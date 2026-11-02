# La Elegant — Collection 01 drop

A one-product storefront for the first drop: **The Bordeaux Set** (half-zip knit + pleated trousers), ₪990.
Static site, no framework: `node src/build.mjs` turns `src/` into `public/`, and Vercel runs that on every push.

## What to edit

Everything lives in `src/data.mjs`:

| What | Where |
| --- | --- |
| WhatsApp number that receives orders | `SITE.whatsapp` — digits only, e.g. `"972501234567"` |
| Email / Instagram / TikTok | `SITE.email`, `SITE.instagram`, `SITE.tiktok` |
| Business details for the legal pages | `SITE.business` (shown only when filled) |
| Price, names, descriptions | `PRODUCTS[0]` |
| Sizes | `PRODUCTS[0].sizeGroups` (knit size + trouser waist) |
| Size guide | `PRODUCTS[0].sizeGuide` (body measurements, cm) |
| Delivery option and price | `SITE.shipping` |
| Delivery time text | `SITE.leadTime` |
| Public address of the site | `SITE.url` |

## Checkout

Bag → contact & delivery → "Place order".

- With `SITE.whatsapp` filled: WhatsApp opens with the full order (sizes, address, total) addressed to us.
- Without it: the customer gets a "Copy order" screen to send it to us.
- Optional: `SITE.checkout.endpoint` — any URL that should also receive each order as JSON (for example a Google Apps Script that writes to a Sheet).
- Online payment: add the provider in `placeOrder()` in `src/assets/store.js` (there is a marked hook) and set `SITE.checkout.mode`.

## Logo

`src/brand/` holds the web versions of the pencil emblem (ivory on transparent) and the Cinzel font for the wordmark.
`brand-assets/` has larger PNGs: `emblem-ivory.png` (for dark backgrounds) and `emblem-ink.png` (for light backgrounds).
The emblem is a cleaned-up scan of the hand-drawn sketch (variant 1); a vector redraw can replace it later without touching the code.
