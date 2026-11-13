/* =====================================================================
   STORE SETTINGS — everything you edit by hand lives here and in i18n.mjs.
   data.mjs  = numbers, contacts, switches (one place for both languages)
   i18n.mjs  = every word on the site, in English and Hebrew
   After a change: git push → Vercel rebuilds the site.
   ===================================================================== */

export const SITE = {
  brand: "La Elegant",
  est: "Est. 2026",
  founded: "2026",
  // Other spellings people (and search engines / AI assistants) may use for the brand
  altNames: ["לה אלגנט", "LA ELEGANT", "La Elegant Israel"],

  // Public address of the site. When the domain is bought, change ONLY this line
  // (e.g. "https://laelegant.co.il") — canonical links, sitemap, hreflang, llms.txt and
  // structured data all follow it. Then add the domain in Vercel (see README).
  url: "https://aurastorebro.vercel.app",

  // Languages: the first one lives at "/", the others at "/<code>/".
  langs: ["en", "he"],

  // Contacts. An empty field is simply not shown.
  // whatsapp: number without +, e.g. "972501234567". Orders are sent to this number.
  whatsapp: "",
  email: "",
  instagram: "",       // handle without @
  tiktok: "",          // handle without @

  // Business details — fill in after registration (shown on the legal pages only when filled)
  business: {
    name: "",                 // registered business name
    id: "",                   // business number (ע.מ.)
    address: "",
    accessibilityContact: ""  // who handles accessibility requests
  },

  checkout: {
    // "whatsapp" = the order is sent to our WhatsApp and we reply with a secure payment link.
    // When a payment provider is connected, add its mode here and branch on it in assets/store.js (placeOrder).
    mode: "whatsapp",
    endpoint: ""       // optional: a URL that receives every order as JSON (e.g. Google Apps Script → Sheet)
  },

  // Delivery options. price: 0 = free, null = "confirmed with your order". Labels are in i18n.mjs (shipping.<id>).
  shipping: [
    { id: "courier", price: 0 }
  ],
  // Delivery time used in Google's structured data. handling + transit should add up to the text in i18n (leadTime).
  delivery: { handlingDays: [7, 10], transitDays: [3, 4] },
  returnDays: 14,

  // ---------- Accounts & bonus coins (Supabase) ----------
  // Leave url/anonKey empty and the site works exactly as before: guest checkout only, no account link.
  // Fill them (Supabase → Project Settings → API) to turn on accounts. See README → "Accounts".
  // The anon key is public by design; never put the service_role key here.
  accounts: {
    supabaseUrl: "",
    supabaseAnonKey: "",
    google: true,       // "Continue with Google" (needs Google set up in Supabase → Auth → Providers)
    email: true         // sign-in link / code by email (needs custom SMTP in Supabase → Auth → SMTP)
  },
  // Bonus coins: 1 coin = ₪1. rate = share of the amount paid that comes back as coins once an order is paid.
  // The real number is enforced in the database (table shop_settings) — keep both the same.
  bonus: { rate: 0.05 },

  // ---------- Search engines ----------
  seo: {
    googleVerification: "",   // Google Search Console → HTML tag → the content="..." value
    bingVerification: "",     // Bing Webmaster Tools → HTML meta tag → content value (Bing also feeds ChatGPT search)
    indexNowKey: ""           // any 32-char hex string; the build publishes /<key>.txt for IndexNow (Bing, Yandex)
  },

  // The piece in the spotlight on the home page
  hero: "set01",
  heroFilm: { poster: "media/film-01.webp", video: "media/film-01.mp4" }
};

/* Products. slug = the product page address (same in every language). Words live in i18n.mjs → products.<id>. */
export const PRODUCTS = [
  {
    id: "set01", slug: "the-bordeaux-set", price: 990,
    gender: "male", category: "Apparel & Accessories > Clothing",
    poster: "media/film-01.webp", video: "media/film-01.mp4",
    images: ["media/detail-knit.webp", "media/detail-trouser.webp"],
    pieceImages: ["media/detail-knit.webp", "media/detail-trouser.webp"],
    sizeGroups: [
      { key: "top", sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
      { key: "waist", sizes: ["28", "30", "32", "34", "36", "38"] }
    ],
    // Size guide by BODY measurements (cm). Update once the factory's finished-garment measurements are final.
    sizeGuide: {
      top: [["XS", "84–88", "44"], ["S", "88–94", "46"], ["M", "94–100", "48"], ["L", "100–106", "50"], ["XL", "106–112", "52"], ["XXL", "112–118", "54"]],
      waist: [["28", "70–73", "44"], ["30", "75–78", "46"], ["32", "80–83", "48"], ["34", "85–88", "50"], ["36", "90–93", "52"], ["38", "95–98", "54"]]
    }
  }
];
