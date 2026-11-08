-- =====================================================================
-- LA ELEGANT — accounts, orders and bonus coins (Supabase / Postgres)
-- Run once: Supabase → SQL Editor → New query → paste this whole file → Run.
-- Safe to run again after edits (it updates functions and keeps your data).
--
-- How it works
--   • Anyone (guest or signed in) can place an order through place_order().
--     Prices are taken from the products table here, never from the browser.
--   • You manage orders in Table Editor → orders → change "status".
--     When an order becomes 'paid', the account behind it gets bonus coins
--     (shop_settings.bonus_rate × amount paid). 'cancelled' gives back coins used
--     and removes coins earned. Every coin movement is a row in bonus_ledger.
--   • Customers can only ever read their own profile, orders and coins (RLS).
-- =====================================================================

-- Settings -------------------------------------------------------------
create table if not exists public.shop_settings (
  id int primary key default 1 check (id = 1),
  bonus_rate numeric(5,4) not null default 0.05 check (bonus_rate >= 0 and bonus_rate <= 0.5)
);
insert into public.shop_settings (id) values (1) on conflict (id) do nothing;

-- Products & prices — keep in sync with src/data.mjs (id + price) ------
create table if not exists public.products (
  id text primary key,
  name text not null,
  price int not null check (price >= 0),
  active boolean not null default true
);
insert into public.products (id, name, price) values
  ('set01', 'The Bordeaux Set', 990)
on conflict (id) do update set name = excluded.name, price = excluded.price;

-- Profiles (one per account) ------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  phone text check (char_length(phone) <= 30),
  city text check (char_length(city) <= 80),
  street text check (char_length(street) <= 160),
  apt text check (char_length(apt) <= 160),
  marketing_ok boolean not null default false,
  marketing_ok_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Orders ---------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'new'
    check (status in ('new', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled')),
  items jsonb not null,
  subtotal int not null,
  shipping int not null default 0,
  bonus_used int not null default 0,
  total int not null,
  contact jsonb not null,
  email text,
  phone text,
  lang text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists orders_email_idx on public.orders(email) where user_id is null;
create index if not exists orders_phone_idx on public.orders(phone, created_at);

-- Bonus coins: every movement is a row; the balance is the sum ----------
create table if not exists public.bonus_ledger (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  amount int not null,
  kind text not null check (kind in ('earn', 'spend', 'refund', 'reverse', 'adjust')),
  note text,
  created_at timestamptz not null default now()
);
create unique index if not exists bonus_once_per_order on public.bonus_ledger(order_id, kind)
  where order_id is not null and kind <> 'adjust';
create index if not exists bonus_user_idx on public.bonus_ledger(user_id);

-- Row level security: customers see only their own rows ----------------
alter table public.shop_settings enable row level security;
alter table public.products      enable row level security;
alter table public.profiles      enable row level security;
alter table public.orders        enable row level security;
alter table public.bonus_ledger  enable row level security;

drop policy if exists "settings readable" on public.shop_settings;
create policy "settings readable" on public.shop_settings for select using (true);
drop policy if exists "products readable" on public.products;
create policy "products readable" on public.products for select using (true);

drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists "own profile insert" on public.profiles;
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = (select auth.uid()));
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "own orders read" on public.orders;
create policy "own orders read" on public.orders for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "own coins read" on public.bonus_ledger;
create policy "own coins read" on public.bonus_ledger for select to authenticated using (user_id = (select auth.uid()));

-- Profiles: created automatically for every new account -----------------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), ''))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.profiles_touch() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  if new.marketing_ok and (tg_op = 'INSERT' or not old.marketing_ok) then new.marketing_ok_at := now(); end if;
  if not new.marketing_ok then new.marketing_ok_at := null; end if;
  return new;
end $$;
drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before insert or update on public.profiles
  for each row execute function public.profiles_touch();

-- Balance ---------------------------------------------------------------
create or replace function public.bonus_balance(p_user uuid) returns int
language sql stable security definer set search_path = public as $$
  select coalesce(sum(amount), 0)::int from public.bonus_ledger where user_id = p_user;
$$;
revoke all on function public.bonus_balance(uuid) from public, anon, authenticated;

create or replace function public.my_bonus_balance() returns int
language sql stable security definer set search_path = public as $$
  select public.bonus_balance((select auth.uid()));
$$;
revoke all on function public.my_bonus_balance() from public, anon;
grant execute on function public.my_bonus_balance() to authenticated;

-- Placing an order (guest or signed in) ---------------------------------
create or replace function public.place_order(
  p_items jsonb, p_contact jsonb, p_ship text default 'courier', p_use_bonus boolean default false, p_lang text default 'en'
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid   uuid := auth.uid();
  v_item  jsonb;
  v_price int;
  v_qty   int;
  v_items jsonb := '[]'::jsonb;
  v_sub   int := 0;
  v_ship  int := 0;          -- delivery is complimentary; change here if that changes
  v_bonus int := 0;
  v_total int;
  v_rate  numeric;
  v_no    text;
  v_id    uuid;
  v_email text := nullif(lower(trim(coalesce(p_contact->>'email', ''))), '');
  v_phone text := nullif(regexp_replace(coalesce(p_contact->>'phone', ''), '[^0-9]', '', 'g'), '');
begin
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 20 then
    raise exception 'bad_items';
  end if;
  if jsonb_typeof(p_contact) is distinct from 'object' or char_length(p_contact::text) > 2000
     or char_length(coalesce(p_contact->>'name', '')) < 2 or v_phone is null then
    raise exception 'bad_contact';
  end if;
  -- flood guard: at most 5 orders per phone number per hour
  if (select count(*) from public.orders where phone = v_phone and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'too_many_orders';
  end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    select price into v_price from public.products where id = v_item->>'id' and active;
    if v_price is null then raise exception 'unknown_product'; end if;
    v_qty := nullif(v_item->>'qty', '')::int;
    if v_qty is null or v_qty < 1 or v_qty > 10 then raise exception 'bad_qty'; end if;
    if jsonb_typeof(v_item->'sizes') is distinct from 'object' or char_length((v_item->'sizes')::text) > 200 then
      raise exception 'bad_sizes';
    end if;
    v_sub := v_sub + v_price * v_qty;
    v_items := v_items || jsonb_build_object('id', v_item->>'id', 'qty', v_qty, 'price', v_price, 'sizes', v_item->'sizes');
  end loop;

  v_total := v_sub + v_ship;
  if v_uid is not null and p_use_bonus then
    perform pg_advisory_xact_lock(hashtext(v_uid::text));   -- one coin spend at a time per account
    v_bonus := greatest(least(public.bonus_balance(v_uid), v_sub), 0);
    v_total := v_total - v_bonus;
  end if;

  loop
    v_no := 'LE-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from public.orders where number = v_no);
  end loop;

  insert into public.orders (number, user_id, items, subtotal, shipping, bonus_used, total, contact, email, phone, lang)
  values (v_no, v_uid, v_items, v_sub, v_ship, v_bonus, v_total, p_contact, v_email, v_phone, left(coalesce(p_lang, ''), 5))
  returning id into v_id;

  if v_bonus > 0 then
    insert into public.bonus_ledger (user_id, order_id, amount, kind) values (v_uid, v_id, -v_bonus, 'spend');
  end if;

  select bonus_rate into v_rate from public.shop_settings where id = 1;
  return jsonb_build_object(
    'number', v_no, 'subtotal', v_sub, 'shipping', v_ship, 'bonus_used', v_bonus, 'total', v_total,
    'bonus_to_earn', floor(greatest(v_total - v_ship, 0) * coalesce(v_rate, 0))::int,
    'signed_in', v_uid is not null
  );
end $$;
revoke all on function public.place_order(jsonb, jsonb, text, boolean, text) from public;
grant execute on function public.place_order(jsonb, jsonb, text, boolean, text) to anon, authenticated;

-- Coins for a paid order (runs from the status trigger and from claiming) -
create or replace function public.credit_order(p_order uuid) returns void
language plpgsql security definer set search_path = public as $$
declare o public.orders; v_rate numeric; v_amt int;
begin
  select * into o from public.orders where id = p_order;
  if not found or o.user_id is null or o.status not in ('paid', 'shipped', 'delivered') then return; end if;
  select bonus_rate into v_rate from public.shop_settings where id = 1;
  v_amt := floor(greatest(o.total - o.shipping, 0) * coalesce(v_rate, 0));
  if v_amt > 0 then
    insert into public.bonus_ledger (user_id, order_id, amount, kind)
    values (o.user_id, o.id, v_amt, 'earn') on conflict do nothing;
  end if;
end $$;
revoke all on function public.credit_order(uuid) from public, anon, authenticated;

create or replace function public.orders_before_update() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.status in ('paid', 'shipped', 'delivered') and old.status not in ('paid', 'shipped', 'delivered') and new.paid_at is null then
    new.paid_at := now();
  end if;
  return new;
end $$;
drop trigger if exists orders_before_update on public.orders;
create trigger orders_before_update before update on public.orders
  for each row execute function public.orders_before_update();

create or replace function public.orders_after_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status in ('paid', 'shipped', 'delivered') and old.status not in ('paid', 'shipped', 'delivered') then
    perform public.credit_order(new.id);
  end if;
  if new.status = 'cancelled' and old.status <> 'cancelled' and new.user_id is not null then
    -- give back coins used on the order
    insert into public.bonus_ledger (user_id, order_id, amount, kind)
      select new.user_id, new.id, -amount, 'refund' from public.bonus_ledger where order_id = new.id and kind = 'spend'
      on conflict do nothing;
    -- take back coins earned on the order
    insert into public.bonus_ledger (user_id, order_id, amount, kind)
      select new.user_id, new.id, -amount, 'reverse' from public.bonus_ledger where order_id = new.id and kind = 'earn'
      on conflict do nothing;
  end if;
  return null;
end $$;
drop trigger if exists orders_after_update on public.orders;
create trigger orders_after_update after update of status on public.orders
  for each row execute function public.orders_after_update();

-- Guest orders join the account opened later with the same (verified) email -
create or replace function public.claim_my_orders() returns int
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_email text; v_n int := 0; r record;
begin
  if v_uid is null then return 0; end if;
  select lower(email) into v_email from auth.users where id = v_uid and email_confirmed_at is not null;
  if v_email is null then return 0; end if;
  for r in update public.orders set user_id = v_uid where user_id is null and email = v_email returning id loop
    v_n := v_n + 1;
    perform public.credit_order(r.id);
  end loop;
  return v_n;
end $$;
revoke all on function public.claim_my_orders() from public, anon;
grant execute on function public.claim_my_orders() to authenticated;

-- Guest order tracking: order number + phone -----------------------------
create or replace function public.order_status(p_number text, p_phone text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('number', number, 'status', status, 'total', total, 'created_at', created_at)
  from public.orders
  where number = upper(trim(p_number))
    and phone = regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g')
  limit 1;
$$;
revoke all on function public.order_status(text, text) from public;
grant execute on function public.order_status(text, text) to anon, authenticated;

-- Delete my account: orders stay for bookkeeping, unlinked from the person -
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'not_signed_in'; end if;
  update public.orders set user_id = null where user_id = v_uid;
  delete from auth.users where id = v_uid;
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- Admin: give or take coins by hand (run in SQL Editor), e.g.
--   insert into public.bonus_ledger (user_id, amount, kind, note)
--   select id, 50, 'adjust', 'Thank-you gift' from auth.users where email = 'someone@example.com';
