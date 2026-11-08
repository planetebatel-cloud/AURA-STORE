/* LA ELEGANT account page: sign in (Google / email link or code), bonus coins, orders, saved details, guest order tracking. */
(function () {
  const S = window.SHOP || {};
  const AUTH = window.LE_AUTH;
  const root = document.getElementById("acct-root");
  if (!root || !AUTH) return;
  const a = (S.t && S.t.account) || {};
  const L = S.prefix || "";
  const rate = Math.round((S.bonusRate || 0) * 100);
  const money = n => "₪" + Number(n).toLocaleString("en-US");
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fill = (s, o) => String(s || "").replace(/\{(\w+)\}/g, (m, k) => (k in o ? o[k] : m));
  const date = d => new Date(d).toLocaleDateString(S.lang === "he" ? "he-IL" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  const params = new URLSearchParams(location.search);
  const fromBag = params.get("from") === "bag";
  const back = location.origin + L + "/account" + (fromBag ? "?from=bag" : "");
  const toast = window.LE_TOAST || (() => {});
  let client = null;

  const bagCount = () => { try { return JSON.parse(localStorage.getItem("le-bag") || "[]").length; } catch (e) { return 0; } };

  /* ---------- signed out ---------- */
  function signedOut(state = {}) {
    const conf = AUTH.conf;
    root.innerHTML = `
<div class="acct-grid">
  <div class="acct-card">
    <p class="acct-intro">${esc(a.intro)}</p>
    <ul class="perks">${(a.perks || []).map(p => `<li>${esc(fill(p, { rate }))}</li>`).join("")}</ul>
    ${conf.google ? `<button class="btn wide ghost" type="button" id="a-google">${esc(a.google)}</button>` : ""}
    ${conf.google && conf.email ? `<p class="or"><span>${esc(a.or)}</span></p>` : ""}
    ${conf.email ? (state.sent ? `
    <form class="form" id="a-code" novalidate>
      <p>${esc(fill(a.sent, { email: state.email }))}</p>
      <div class="field"><label for="a-code-in">${esc(a.code)}</label><input id="a-code-in" inputmode="numeric" autocomplete="one-time-code" maxlength="10" dir="ltr"><p class="err" hidden></p></div>
      <button class="btn wide" type="submit">${esc(a.verify)}</button>
      <button class="link" type="button" id="a-reset">${esc(a.resend)}</button>
    </form>` : `
    <form class="form" id="a-email" novalidate>
      <div class="field"><label for="a-email-in">${esc(a.email)}</label><input id="a-email-in" type="email" autocomplete="email" dir="ltr" maxlength="160" value="${esc(state.email || params.get("email") || "")}"><p class="err" hidden></p></div>
      <button class="btn wide" type="submit">${esc(a.sendLink)}</button>
    </form>`) : ""}
    <p class="err" id="a-err" role="alert" hidden></p>
  </div>
  ${trackCard()}
</div>`;
    const err = msg => { const e = document.getElementById("a-err"); e.textContent = msg; e.hidden = !msg; };
    const g = document.getElementById("a-google");
    if (g) g.addEventListener("click", async () => {
      const { error } = await client.auth.signInWithOAuth({ provider: "google", options: { redirectTo: back } });
      if (error) err(a.err);
    });
    const ef = document.getElementById("a-email");
    if (ef) ef.addEventListener("submit", async e => {
      e.preventDefault();
      const input = document.getElementById("a-email-in"), email = input.value.trim().toLowerCase();
      const bad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
      const fe = input.parentElement.querySelector(".err"); fe.textContent = bad ? a.errEmail : ""; fe.hidden = !bad; input.setAttribute("aria-invalid", bad ? "true" : "false");
      if (bad) { input.focus(); return; }
      ef.querySelector("button").disabled = true;
      const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: back, shouldCreateUser: true } });
      if (error) { ef.querySelector("button").disabled = false; err(a.err); return; }
      signedOut({ sent: true, email });
      const c = document.getElementById("a-code-in"); if (c) c.focus();
    });
    const cf = document.getElementById("a-code");
    if (cf) cf.addEventListener("submit", async e => {
      e.preventDefault();
      const input = document.getElementById("a-code-in"), token = input.value.replace(/\s/g, "");
      if (!token) { input.focus(); return; }
      const { error } = await client.auth.verifyOtp({ email: state.email, token, type: "email" });
      if (error) { const fe = input.parentElement.querySelector(".err"); fe.textContent = a.errCode; fe.hidden = false; return; }
      // onAuthStateChange renders the signed-in view
    });
    const rs = document.getElementById("a-reset");
    if (rs) rs.addEventListener("click", () => signedOut({}));
    bindTrack();
  }

  /* ---------- guest order tracking ---------- */
  function trackCard() {
    return `
  <div class="acct-card">
    <h2>${esc(a.track)}</h2>
    <p class="note">${esc(a.trackNote)}</p>
    <form class="form" id="a-track" novalidate>
      <div class="two">
        <div class="field"><label for="a-tr-no">${esc(a.trackNo)}</label><input id="a-tr-no" dir="ltr" maxlength="12" placeholder="LE-XXXXXX" autocapitalize="characters"></div>
        <div class="field"><label for="a-tr-ph">${esc(a.phone)}</label><input id="a-tr-ph" type="tel" inputmode="tel" dir="ltr" maxlength="20"></div>
      </div>
      <button class="btn ghost wide" type="submit">${esc(a.trackBtn)}</button>
      <p id="a-tr-out" aria-live="polite"></p>
    </form>
  </div>`;
  }
  function bindTrack() {
    const f = document.getElementById("a-track");
    if (!f) return;
    f.addEventListener("submit", async e => {
      e.preventDefault();
      const no = document.getElementById("a-tr-no").value.trim().toUpperCase();
      let ph = document.getElementById("a-tr-ph").value.replace(/[^\d]/g, "");
      if (ph.startsWith("972")) ph = "0" + ph.slice(3);
      const out = document.getElementById("a-tr-out");
      if (!no || !ph) { out.textContent = a.trackNone; return; }
      const { data, error } = await client.rpc("order_status", { p_number: no, p_phone: ph });
      out.innerHTML = error || !data ? esc(a.trackNone)
        : `<b>${esc(a.orderNo)} ${esc(data.number)}</b> · ${esc((a.status || {})[data.status] || data.status)} · ${date(data.created_at)} · <span class="price" dir="ltr">${money(data.total)}</span>`;
    });
  }

  /* ---------- signed in ---------- */
  async function signedIn(user) {
    root.innerHTML = `<p class="note">…</p>`;
    // Guest orders placed with this (verified) email join the account once per browser session.
    try {
      const flag = "le-claimed-" + user.id;
      if (!sessionStorage.getItem(flag)) {
        const { data: n } = await client.rpc("claim_my_orders");
        sessionStorage.setItem(flag, "1");
        if (n > 0) toast(fill(a.claimed, { n }));
      }
    } catch (e) {}
    const [prof, bal, led, ord] = await Promise.all([
      client.from("profiles").select("full_name, phone, city, street, apt, marketing_ok").eq("id", user.id).maybeSingle(),
      client.rpc("my_bonus_balance"),
      client.from("bonus_ledger").select("amount, kind, created_at, orders(number)").order("created_at", { ascending: false }).limit(20),
      client.from("orders").select("number, status, total, bonus_used, created_at").order("created_at", { ascending: false }).limit(50)
    ]);
    const p = (prof && prof.data) || {};
    const balance = (bal && typeof bal.data === "number") ? bal.data : 0;
    const ledger = (led && led.data) || [];
    const orders = (ord && ord.data) || [];
    const name = p.full_name || (user.user_metadata && user.user_metadata.full_name) || "";

    root.innerHTML = `
<div class="acct-top">
  <p>${esc(a.signedInAs)} <b dir="ltr">${esc(user.email || "")}</b></p>
  <button class="link" type="button" id="a-out">${esc(a.signOut)}</button>
</div>
${fromBag && bagCount() ? `<a class="btn wide" href="${L || "/"}#bag">${esc((S.t && S.t.checkout) || "Checkout")}</a>` : ""}
<div class="acct-grid">
  <section class="acct-card coins" aria-labelledby="a-bal">
    <h2 id="a-bal">${esc(a.balance)}</h2>
    <p class="coins-n"><span class="price" dir="ltr">${money(balance)}</span></p>
    <p class="note">${esc(fill(a.balanceNote, { rate }))}</p>
    <h3>${esc(a.history)}</h3>
    ${ledger.length ? `<ul class="ledger">${ledger.map(r => `<li><span>${esc((a.kind || {})[r.kind] || r.kind)}${r.orders && r.orders.number ? ` · ${esc(r.orders.number)}` : ""}<small>${date(r.created_at)}</small></span><span class="price ${r.amount < 0 ? "neg" : "pos"}" dir="ltr">${r.amount < 0 ? "−" : "+"}${money(Math.abs(r.amount))}</span></li>`).join("")}</ul>` : `<p class="note">${esc(a.noHistory)}</p>`}
  </section>
  <section class="acct-card" aria-labelledby="a-ord">
    <h2 id="a-ord">${esc(a.orders)}</h2>
    ${orders.length ? `<ul class="orders">${orders.map(o => `<li><span><b dir="ltr">${esc(o.number)}</b><small>${date(o.created_at)}</small></span><span class="st st-${esc(o.status)}">${esc((a.status || {})[o.status] || o.status)}</span><span class="price" dir="ltr">${money(o.total)}</span></li>`).join("")}</ul>` : `<p class="note">${esc(a.noOrders)}</p>`}
  </section>
  <section class="acct-card" aria-labelledby="a-det">
    <h2 id="a-det">${esc(a.details)}</h2>
    <p class="note">${esc(a.detailsNote)}</p>
    <form class="form" id="a-prof" novalidate>
      <div class="field"><label for="p-name">${esc(a.name)}</label><input id="p-name" autocomplete="name" maxlength="120" value="${esc(name)}"></div>
      <div class="field"><label for="p-phone">${esc(a.phone)}</label><input id="p-phone" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" maxlength="20" value="${esc(p.phone || "")}"></div>
      <div class="two">
        <div class="field"><label for="p-city">${esc(a.city)}</label><input id="p-city" autocomplete="address-level2" maxlength="80" value="${esc(p.city || "")}"></div>
        <div class="field"><label for="p-street">${esc(a.street)}</label><input id="p-street" autocomplete="address-line1" maxlength="160" value="${esc(p.street || "")}"></div>
      </div>
      <div class="field"><label for="p-apt">${esc(a.apt)}</label><input id="p-apt" autocomplete="address-line2" maxlength="160" value="${esc(p.apt || "")}"></div>
      <label class="check"><input type="checkbox" id="p-mkt"${p.marketing_ok ? " checked" : ""}><span>${esc(a.marketing)}</span></label>
      <button class="btn wide" type="submit">${esc(a.save)}</button>
    </form>
  </section>
</div>
<div class="acct-danger"><button class="link" type="button" id="a-del">${esc(a.del)}</button></div>`;

    document.getElementById("a-out").addEventListener("click", async () => { await client.auth.signOut(); signedOut({}); });
    document.getElementById("a-prof").addEventListener("submit", async e => {
      e.preventDefault();
      const v = id => document.getElementById(id).value.trim();
      const { error } = await client.from("profiles").upsert({
        id: user.id, full_name: v("p-name"), phone: v("p-phone"), city: v("p-city"), street: v("p-street"), apt: v("p-apt"),
        marketing_ok: document.getElementById("p-mkt").checked
      });
      toast(error ? a.err : a.saved);
    });
    document.getElementById("a-del").addEventListener("click", async () => {
      if (!confirm(a.delConfirm)) return;
      const { error } = await client.rpc("delete_my_account");
      if (error) { toast(a.err); return; }
      try { await client.auth.signOut(); } catch (e) {}
      toast(a.deleted);
      signedOut({});
    });
  }

  /* ---------- start ---------- */
  (async () => {
    try {
      client = await AUTH.client();
      let rendered = null;
      const render = session => {
        const id = session && session.user ? session.user.id : "out";
        if (rendered === id) return;
        rendered = id;
        session && session.user ? signedIn(session.user) : signedOut({});
      };
      client.auth.onAuthStateChange((_e, session) => setTimeout(() => render(session), 0));
      const { data } = await client.auth.getSession();
      render(data && data.session);
    } catch (e) {
      root.innerHTML = `<p>${esc(a.err)}</p>`;
    }
  })();
})();
