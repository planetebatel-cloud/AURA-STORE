/* =====================================================================
   STORE DATA. Everything you edit by hand lives here.
   After a change: git push → Vercel rebuilds the site.
   ===================================================================== */

export const SITE = {
  brand: "La Elegant",
  url: "https://aurastorebro.vercel.app",   // change when we connect our own domain
  wordmarkFont: "Italianno",                    // script for the logo: Ballet / Pinyon Script / Imperial Script / Italianno

  // Contacts. An empty field is simply not shown.
  whatsapp: "",        // number without +, e.g. "972501234567". Empty = checkout runs in preview mode
  email: "",
  instagram: "",       // handle without @
  tiktok: "",          // handle without @

  // Business details — fill in after registration (needed for legal pages and payments)
  business: {
    name: "",                 // registered business name
    id: "",                   // business number (ע.מ. / ח.פ.)
    address: "",
    accessibilityContact: ""  // who handles accessibility requests
  },

  tagline: "Elegance is how you walk into a room.",
  description: "La Elegant is an Israeli fashion label. A first collection of clean, considered pieces, made to order in small runs in Israel.",
  renderNote: "Images are renders of the design. The final fabric shade may vary slightly.",
  preorder: "Pre-order · Made to order in Israel",

  checkout: {
    mode: "whatsapp",  // orders go to WhatsApp for now; switches once payments are connected
    endpoint: "",      // optional: Google Apps Script URL to log every order into a sheet
    note: "This is a pre-order. Once you send it, we'll reply on WhatsApp with confirmation, delivery time and payment details. Nothing is charged before you confirm."
  },

  // Delivery options. price: null = "confirmed with your order"
  shipping: [
    { id: "courier", label: "Courier to your door", price: null, note: "Delivery cost is confirmed with your order" }
    // { id: "pickup", label: "Pickup", price: 0, note: "Address sent on WhatsApp" },
  ],

  sizes: ["S", "M", "L", "XL"],

  // Size guide: [size, chest cm, length cm]. Empty = hidden.
  // Example: [["S", 104, 68], ["M", 110, 70], ["L", 116, 72], ["XL", 122, 74]]
  sizeGuide: [],

  hero: "hoodie",  // the piece in the spotlight when there is no campaign film

  // Campaign film in the home-page spotlight (a looping walk). Remove to use the hero piece instead.
  heroFilm: { poster: "media/film-01.webp", video: "media/film-01.mp4", alt: "A model walking toward the camera" }
};

/* Products. slug = the product page address. images = extra photos (optional). */
export const PRODUCTS = [
  {
    id: "hoodie", slug: "oversized-heavy-hoodie-black",
    name: "Heavy Oversized Hoodie", color: "Black", price: 249,
    poster: "media/hoodie.webp", video: "media/hoodie.mp4", images: [],
    seoTitle: "Heavy Oversized Hoodie in Black",
    seoDesc: "A heavy cotton oversized hoodie in black with dropped shoulders and a kangaroo pocket. Made to order in Israel in small runs.",
    desc: "An oversized hoodie in heavy cotton. Dropped shoulders, a kangaroo pocket and a white drawcord. Simple, weighty and clean.",
    details: ["Oversized fit, dropped shoulders", "Heavyweight cotton", "Kangaroo pocket", "Made in Israel"]
  },
  {
    id: "tee", slug: "boxy-tee-white",
    name: "Boxy Tee", color: "White", price: 129,
    poster: "media/tee.webp", video: "media/tee.mp4", images: [],
    seoTitle: "Boxy Tee in White, Heavy Cotton",
    seoDesc: "A white boxy t-shirt in heavy cotton with a tight crew neck and wide short sleeves. Made to order in Israel.",
    desc: "A wide, cropped tee with a tight crew neck and sleeves that sit wide on the arm. The basic every wardrobe needs, made properly.",
    details: ["Boxy fit", "Tight crew neck", "Heavy cotton", "Made in Israel"]
  },
  {
    id: "pants", slug: "wide-leg-trousers-olive",
    name: "Wide-Leg Trousers", color: "Olive", price: 289,
    poster: "media/pants.webp", video: "media/pants.mp4", images: [],
    seoTitle: "Wide-Leg Trousers in Olive",
    seoDesc: "High-waisted wide-leg trousers in olive that break over the shoe. Made to order in Israel in small runs.",
    desc: "High-waisted trousers with a wide leg that falls straight over the shoe. They move with you and keep a clean line.",
    details: ["Wide leg", "High waist", "Full length, breaks over the shoe", "Made in Israel"]
  },
  {
    id: "bomber", slug: "cropped-bomber-pink",
    name: "Cropped Bomber", color: "Pink", price: 389,
    poster: "media/bomber.webp", video: "media/bomber.mp4", images: [],
    seoTitle: "Cropped Bomber Jacket in Pink",
    seoDesc: "A cropped bomber jacket in bright pink with dropped shoulders, a full zip and ribbed hem. Made to order in Israel.",
    desc: "A cropped bomber in a loud pink, with dropped shoulders, a full zip and ribbing at the hem and cuffs. The piece that walks in before you do.",
    details: ["Cropped fit", "Full zip", "Ribbed hem and cuffs", "Made in Israel"]
  }
];

export const FAQ = [
  ["What does pre-order mean?",
   "We don't produce stock in advance. Every piece goes into production at a factory in Israel after it's ordered, so every order on the site is a pre-order. After you send yours, we'll reply with confirmation, delivery time and payment details."],
  ["When do I pay?",
   "Nothing is charged when you send the order. Once we confirm it and the delivery time, we send you the payment details."],
  ["How long does delivery take?",
   "Production and delivery time depend on how many orders each piece has. You'll get the exact delivery time with your confirmation, before you pay."],
  ["How do I pick a size?",
   "The cuts are generous on purpose. Between two sizes, take the smaller one for a cleaner line or the larger one for an oversized look. Not sure? Message us on WhatsApp."],
  ["Can I return or exchange?",
   "Yes. You can cancel a purchase under Israel's Consumer Protection Law. All the details are on the shipping and returns page."],
  ["Where are the clothes made?",
   "At a factory in Israel, in small runs. That's how we keep control of the quality and avoid making clothes nobody wears."],
  ["Why do the images look like renders?",
   "Because they are renders of the design. The collection is made to order, so some images are shown before production. The final fabric shade may vary slightly."]
];
