# La Elegant — store

Collection 01 drop: **The Bordeaux Set** (half-zip knit + pleated trousers), ₪990.
Static site, no framework: `node src/build.mjs` turns `src/` into `public/`, and Vercel runs that on every push.
English lives at `/`, Hebrew at `/he/`.

## Where things are

| What | File |
| --- | --- |
| Prices, sizes, contacts, business details, domain, switches | `src/data.mjs` |
| Every word on the site, English and Hebrew (incl. legal pages) | `src/i18n.mjs` |
| Look and feel | `src/assets/site.css` |
| Bag, checkout, bonus coins in checkout | `src/assets/store.js` |
| Account page | `src/assets/account.js` |
| Database for accounts, orders and bonus coins | `supabase/schema.sql` |
| Photos and the walking film | `src/media/` |

Change a file → `git push` → Vercel rebuilds in about a minute.

## Checkout

Bag → contact & delivery → "Place order". **No account needed.**

- With `SITE.whatsapp` filled: the order is ready to send on WhatsApp (sizes, address, total) addressed to us.
- Without it: the customer gets a "Copy order" screen.
- Online payment: add the provider in `placeOrder()` in `src/assets/store.js` (there is a marked hook) and set `SITE.checkout.mode`.

## When the domain is bought

1. Vercel → this project → **Settings → Domains** → add the domain (e.g. `laelegant.co.il` and `www.laelegant.co.il`), follow the DNS steps it shows.
2. In the same screen set `aurastorebro.vercel.app` to **redirect** to the new domain (so Google sees one address).
3. In `src/data.mjs` change `url:` to the new address and push. Canonical links, sitemap, hreflang, `llms.txt` and structured data follow it.
4. Supabase (if accounts are on) → Auth → URL Configuration: put the new address in Site URL and Redirect URLs.

## Accounts and bonus coins

Accounts are optional for customers. With an account they get **5% of every paid order back as coins** (1 coin = ₪1) to use at checkout.
A guest who later opens an account with the same email gets the coins for that order too.

Until the two keys below are filled, accounts stay off and the site works exactly like before.

**One-time setup (about 30 minutes):**

1. [supabase.com](https://supabase.com) → New project (free). Region: **Central EU (Frankfurt)**.
2. **SQL Editor** → New query → paste all of `supabase/schema.sql` → Run.
3. **Authentication → URL Configuration**
   - Site URL: `https://aurastorebro.vercel.app` (later: the domain)
   - Redirect URLs: `https://aurastorebro.vercel.app/**` (later also `https://<domain>/**`)
4. **Sign in with Google** (recommended, no email setup needed): Google Cloud Console → APIs & Services → Credentials → Create OAuth client ID (Web).
   Authorised redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`. Paste the Client ID and Secret into Supabase → Authentication → Providers → Google.
5. **Sign in by email** needs your own email sender: Supabase's built-in sender only delivers to your own team and 2 emails an hour.
   Authentication → Emails → SMTP Settings → connect Resend or Brevo (free tiers are enough). Best done after the domain is bought.
   In Emails → Templates → *Magic Link*, add `{{ .Token }}` to the text so people can also type a 6-digit code.
   Not ready yet? Set `email: false` in `SITE.accounts` and keep Google only.
6. **Project Settings → API** → copy *Project URL* and the *anon / publishable* key into `SITE.accounts` in `src/data.mjs` → push.
   (The anon key is public by design. Never put the `service_role` key in the code.)

**Running orders:** Supabase → Table Editor → `orders`. Change `status`:
`new` → `confirmed` → `paid` → `shipped` → `delivered` (or `cancelled`).
Coins are added automatically when an order becomes `paid`, given back when an order that used coins is `cancelled`, and removed if a paid order is `cancelled`.
Every coin movement is a row in `bonus_ledger`.

**Changing the bonus:** `shop_settings.bonus_rate` in the database **and** `SITE.bonus.rate` in `data.mjs` (the site shows it, the database enforces it).
**Changing a price:** `PRODUCTS` in `data.mjs` **and** the `products` table (the database checks prices, not the browser).

## Search engines (SEO)

Already built in: one canonical address per page, English ↔ Hebrew `hreflang`, `sitemap.xml` with both languages, Open Graph images,
structured data (Organization, Product with price / free delivery / returns, Breadcrumbs, FAQ).

After the domain is live:

1. [Google Search Console](https://search.google.com/search-console) → add the domain → HTML tag method → paste the `content` value into `SITE.seo.googleVerification` → push → Verify → submit `sitemap.xml`.
2. [Bing Webmaster Tools](https://www.bing.com/webmasters) → import from Google Search Console (or use `SITE.seo.bingVerification`). Bing's index also feeds ChatGPT search and Copilot.
3. Optional: put any 32-character hex string in `SITE.seo.indexNowKey`; the site publishes the key file so Bing picks up changes faster.

## AI assistants (GEO)

So ChatGPT, Claude, Perplexity and Gemini can find and describe the brand correctly:

- `robots.txt` explicitly welcomes their crawlers; `/llms.txt` gives them a plain summary with facts, prices, policies and the FAQ.
- The Story page has a "La Elegant at a glance" facts block; the FAQ answers the questions people ask an assistant ("Israeli menswear brand", "old money style", "where is it made").
- What matters most is **outside the site**: assistants recommend brands that other sites talk about. Fill `SITE.instagram` / `SITE.tiktok` (they become `sameAs` links that tie the brand together),
  put the site link in every bio, and get mentioned where people ask for recommendations (Reddit, Hebrew forums and Facebook groups, fashion blogs, press, reviews after the first sales).

## Logo

`src/brand/` holds the web versions of the pencil emblem (ivory on transparent) and the Cinzel font for the wordmark.
`brand-assets/` has larger PNGs: `emblem-ivory.png` (for dark backgrounds) and `emblem-ink.png` (for light backgrounds).
