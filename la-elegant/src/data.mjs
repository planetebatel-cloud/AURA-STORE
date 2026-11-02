/* =====================================================================
   STORE DATA — Collection 01 drop. Everything you edit by hand lives here.
   After a change: git push → Vercel rebuilds the site.
   ===================================================================== */

export const SITE = {
  brand: "La Elegant",
  est: "Est. 2026",
  url: "https://la-elegant.vercel.app",   // public address of this site (change when we connect our own domain)

  // Contacts. An empty field is simply not shown.
  // whatsapp: number without +, e.g. "972501234567". Orders are sent to this number.
  // While it's empty, checkout ends with "copy your order" instead of opening WhatsApp.
  whatsapp: "",
  email: "",
  instagram: "",       // handle without @
  tiktok: "",          // handle without @

  // Business details — fill in after registration (shown on the legal pages only when filled)
  business: {
    name: "",                 // registered business name
    id: "",                   // business number (ע.מ. / ח.פ.)
    address: "",
    accessibilityContact: ""  // who handles accessibility requests
  },

  tagline: "Elegance is how you walk into a room.",
  description: "La Elegant — Collection 01. The Bordeaux Set: a half-zip knit and pleated ivory trousers, sewn to order in Israel. ₪990.",
  renderNote: "Imagery shows the design in motion. The final fabric shade may vary slightly.",
  preorder: "Collection 01 · Sewn to order in Israel",
  leadTime: "Estimated delivery 10–14 days",

  checkout: {
    // "whatsapp" = the order is sent to our WhatsApp and we reply with a secure payment link.
    // When a payment provider is connected, add its mode here and branch on it in assets/store.js (placeOrder).
    mode: "whatsapp",
    endpoint: "",      // optional: a URL that receives every order as JSON (e.g. Google Apps Script → Sheet)
    paymentNote: "Nothing is charged now. We confirm your sizes and delivery date, then send a secure payment link."
  },

  // Delivery options. price: 0 = free, null = "confirmed with your order"
  shipping: [
    { id: "courier", label: "Courier to your door", price: 0, note: "Complimentary across Israel" }
  ],

  // The piece in the spotlight on the home page
  hero: "set01",
  heroFilm: { poster: "media/film-01.webp", video: "media/film-01.mp4", alt: "A model walking toward the camera in the Bordeaux Set" }
};

/* Products. slug = the product page address. */
export const PRODUCTS = [
  {
    id: "set01", slug: "the-bordeaux-set",
    name: "The Bordeaux Set", color: "Bordeaux / Ivory", price: 990,
    poster: "media/film-01.webp", video: "media/film-01.mp4",
    images: ["media/detail-knit.webp", "media/detail-trouser.webp"],
    seoTitle: "The Bordeaux Set — Half-Zip Knit & Pleated Trousers",
    seoDesc: "Collection 01 by La Elegant: a bordeaux half-zip knit with pleated ivory trousers. Sewn to order in Israel. ₪990 for the set.",
    lede: "Two pieces, one line. A bordeaux half-zip knit worn over pleated ivory trousers — the quiet uniform of people who never need to explain themselves.",
    pieces: [
      { name: "The Half-Zip", color: "Bordeaux", image: "media/detail-knit.webp",
        desc: "A fine-gauge knit with a stand collar and a short zip at the neck. Ribbed cuffs and hem hold the line at the wrist and waist.",
        details: ["Stand collar, half zip", "Ribbed cuffs and hem", "Regular, close fit"] },
      { name: "The Pleated Trouser", color: "Ivory", image: "media/detail-trouser.webp",
        desc: "High-rise trousers with front pleats and a pressed crease, falling straight to the shoe. Clean at the waist, generous through the leg.",
        details: ["Front pleats, pressed crease", "High rise, straight leg", "Full length"] }
    ],
    details: ["Two pieces, sold as a set", "Sewn to order in small runs in Israel", "Each set is checked by hand before delivery"],
    sizeGroups: [
      { key: "top", label: "Knit size", short: "Knit", sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
      { key: "waist", label: "Trouser waist", short: "Waist", sizes: ["28", "30", "32", "34", "36", "38"] }
    ],
    // Size guide by BODY measurements (cm). Update once the factory's finished-garment measurements are final.
    sizeGuide: {
      top: { title: "Knit — chest", cols: ["Size", "Chest (cm)", "EU"], rows: [
        ["XS", "84–88", "44"], ["S", "88–94", "46"], ["M", "94–100", "48"], ["L", "100–106", "50"], ["XL", "106–112", "52"], ["XXL", "112–118", "54"]
      ] },
      waist: { title: "Trousers — waist", cols: ["Waist", "Body waist (cm)", "EU"], rows: [
        ["28", "70–73", "44"], ["30", "75–78", "46"], ["32", "80–83", "48"], ["34", "85–88", "50"], ["36", "90–93", "52"], ["38", "95–98", "54"]
      ] }
    }
  }
];

export const FAQ = [
  ["How does ordering work?",
   "Choose your knit size and trouser waist, add the set to your bag and place the order. We confirm your sizes and delivery date personally, then send a secure payment link. Your set goes into production once it's paid."],
  ["When do I pay?",
   "Nothing is charged when you place the order. After we confirm it, you receive a secure payment link."],
  ["How long does delivery take?",
   "Every set is sewn to order at our factory in Israel. Estimated delivery is 10–14 days from payment; the exact date is confirmed with your order. Courier delivery is complimentary across Israel."],
  ["Can I take different sizes for the knit and the trousers?",
   "Yes. That's why the set has two size choices: one for the knit, one for the trouser waist. Between two sizes, take the smaller for a cleaner line or the larger for an easier fit. Not sure? Message us before you order."],
  ["Can I buy the pieces separately?",
   "Collection 01 is offered as a set only, the way it was designed to be worn."],
  ["Can I return or exchange?",
   "Yes. You can cancel a purchase under Israel's Consumer Protection Law. If the size isn't right, contact us within 14 days of delivery and we'll look into an exchange. Full details are on the shipping and returns page."],
  ["Where are the clothes made?",
   "At a factory in Israel, in small runs. That's how we keep control of the cut and the finish, and never make clothes nobody wears."]
];
