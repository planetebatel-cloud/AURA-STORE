/* =====================================================================
   EVERY WORD ON THE SITE, in English (en) and Hebrew (he).
   Change a sentence here → git push → both languages rebuild.
   Keep the same keys in both languages.
   ===================================================================== */

export const T = {
  /* ============================== ENGLISH ============================== */
  en: {
    meta: { htmlLang: "en", dir: "ltr", ogLocale: "en_IL", hreflang: "en", name: "English", switchTo: "עברית" },
    site: {
      tagline: "Elegance is how you walk into a room.",
      taglineEm: "walk",
      title: "Collection 01",
      homeTitle: "Israeli menswear, sewn to order",
      description: "La Elegant — Israeli menswear, sewn to order. Collection 01: The Bordeaux Set, a half-zip knit with pleated ivory trousers. ₪990, complimentary delivery across Israel.",
      renderNote: "Imagery shows the design in motion. The final fabric shade may vary slightly.",
      preorder: "Collection 01 · Sewn to order in Israel",
      leadTime: "Estimated delivery 10–14 days",
      paymentNote: "Nothing is charged now. We confirm your sizes and delivery date, then send a secure payment link.",
      heroAlt: "A model walking toward the camera in the Bordeaux Set",
      sewn: "Sewn to order in Israel"
    },
    nav: { set: "The Set", story: "Story", faq: "FAQ", account: "Account", menu: "Menu", close: "Close", bag: "Bag", skip: "Skip to content", home: "home", main: "Main" },
    foot: { collection: "Collection 01", how: "How ordering works", info: "Information", shipping: "Shipping & returns", terms: "Terms", privacy: "Privacy", accessibility: "Accessibility", contact: "Contact", shop: "Shop", businessNo: "Business no." },
    shipping: { courier: { label: "Courier to your door", note: "Complimentary across Israel" } },
    home: {
      lead: "Collection 01", shopSet: "Shop the set", firstDrop: "Collection 01 · The first drop", theSet: "the set",
      chooseSizes: "Choose your sizes", freeDelivery: "Complimentary delivery in Israel", inColor: "in",
      promise: [
        ["Sewn to order", "Your set goes into production only after you order it. No warehouse, no surplus."],
        ["Made in Israel", "Cut and sewn in small runs at a factory we work with directly."],
        ["Two sizes, one set", "Choose the knit and the trouser waist separately, for a fit that is yours."]
      ],
      promiseLabel: "How it’s made",
      mfTitle: "We don’t make stock.", mfEm: "We make yours.",
      mfText: "Every set goes into production at a factory in Israel only after it’s ordered. Small runs, clean cuts, quiet colours, and one set that changes the room.",
      ourStory: "Our story"
    },
    pdp: {
      twoPieces: "two pieces", add: "Add the set to bag", addShort: "Add to bag",
      assure: ["Complimentary courier delivery in Israel", "Nothing is charged until we confirm your order"],
      ask: "Questions about sizing? Message us on WhatsApp", askMsg: "Hi, I have a question about",
      accSet: "The set", accDetails: "Details", accShip: "Shipping & returns",
      shipText: "Sewn to order; your delivery date is confirmed with your order, before payment. Courier delivery is complimentary across Israel. Purchases can be cancelled under Israel’s Consumer Protection Law.",
      fullDetails: "Full details", copyLink: "Copy link", images: "Images", inMotion: "The set in motion", image: "Image",
      sizeGuide: "Size guide", guideNote: "Body measurements. Between two sizes, take the smaller for a cleaner line or the larger for an easier fit.",
      crumbs: "Breadcrumb", home: "Home", bonus: "{n} back in bonus coins with an account"
    },
    products: {
      set01: {
        name: "The Bordeaux Set", color: "Bordeaux / Ivory",
        seoTitle: "The Bordeaux Set — Men’s Half-Zip Knit & Pleated Trousers",
        seoDesc: "Collection 01 by La Elegant: a men’s bordeaux half-zip knit with pleated ivory trousers. Sewn to order in Israel. ₪990 for the set, complimentary delivery.",
        imgAlt: "The Bordeaux Set: bordeaux half-zip knit and ivory pleated trousers, in motion",
        lede: "Two pieces, one line. A bordeaux half-zip knit worn over pleated ivory trousers — the quiet uniform of people who never need to explain themselves.",
        pieces: [
          { name: "The Half-Zip", color: "Bordeaux",
            desc: "A fine-gauge knit with a stand collar and a short zip at the neck. Ribbed cuffs and hem hold the line at the wrist and waist.",
            details: ["Stand collar, half zip", "Ribbed cuffs and hem", "Regular, close fit"] },
          { name: "The Pleated Trouser", color: "Ivory",
            desc: "High-rise trousers with front pleats and a pressed crease, falling straight to the shoe. Clean at the waist, generous through the leg.",
            details: ["Front pleats, pressed crease", "High rise, straight leg", "Full length"] }
        ],
        details: ["Men’s set, two pieces sold together", "Sewn to order in small runs in Israel", "Each set is checked by hand before delivery"],
        sizeGroups: {
          top: { label: "Knit size", short: "Knit", err: "Choose your knit size" },
          waist: { label: "Trouser waist", short: "Waist", err: "Choose your trouser waist" }
        },
        sizeGuide: {
          top: { title: "Knit — chest", cols: ["Size", "Chest (cm)", "EU"] },
          waist: { title: "Trousers — waist", cols: ["Waist", "Body waist (cm)", "EU"] }
        }
      }
    },
    story: {
      title: "Story", desc: "The story of La Elegant: Israeli menswear sewn to order in small runs — elegance as the way you walk into a room.",
      eyebrow: "Story", h1: "Elegance is how you", h1Em: "walk", h1End: "into a room.",
      blocks: [
        ["The walk", "Elegance isn’t a logo on the chest. It’s the walk, the shoulders, the line — the moment someone sees you before you’ve said a word. That’s why every piece here is shown in motion: good clothes look best when you walk in them."],
        ["Quiet, on purpose", "No loud prints, no one-season trends. Deep colours, clean cuts and fabrics that hold their shape. Clothes for people who would rather be remembered than noticed."],
        ["No stock", "Most labels make thousands of units and hope they sell. We work the other way round: every set goes into production only after it’s ordered. No overflowing warehouses, no surplus, no clothes thrown away."],
        ["Made in Israel", "The collection is sewn at a factory in Israel, in small runs. We work directly with the factory, choose the fabrics ourselves and check every cut before it reaches you."]
      ],
      factsTitle: "La Elegant at a glance", withAccount: " or with an account",
      facts: {
        what: ["What", "Israeli menswear label — quiet luxury, classic lines"],
        founded: ["Founded", "2026, Israel"],
        made: ["Made", "Sewn to order in small runs at a factory in Israel"],
        collection: ["Collection 01", "The Bordeaux Set: half-zip knit + pleated trousers"],
        price: ["Price", "{price} for the set"],
        sizes: ["Sizes", "Knit XS–XXL · trouser waist 28–38"],
        delivery: ["Delivery", "Complimentary courier across Israel · 10–14 days"],
        order: ["How to order", "Online, as a guest{withAccount}"]
      }
    },
    faq: {
      title: "FAQ", h1: "Frequently asked questions", eyebrow: "Help",
      desc: "Answers about La Elegant: ordering, payment, delivery, sizing, returns, accounts, bonus coins and production in Israel.",
      more: "Didn’t find your answer?", wa: "Message us on WhatsApp", waEnd: "and we’ll get back to you.", reach: "Reach us by", send: "Send us a message and we’ll get back to you.",
      items: [
        ["What is La Elegant?", "La Elegant is an Israeli menswear label founded in 2026. It makes quiet, classic pieces — deep colours, clean cuts — sewn to order in small runs at a factory in Israel. Collection 01 is The Bordeaux Set: a bordeaux half-zip knit with pleated ivory trousers, {price} for the set, with complimentary delivery across Israel."],
        ["What style is La Elegant?", "Quiet luxury — the classic, “old money” look. No loud logos or one-season trends: tailored lines and deep colours that work for a dinner, a date, an event or a day in the city."],
        ["Is it menswear?", "Yes. Collection 01 is cut for men."],
        ["How does ordering work?", "Choose your knit size and trouser waist, add the set to your bag and place the order. We confirm your sizes and delivery date personally, then send a secure payment link. Your set goes into production once it’s paid."],
        ["Do I need an account to order?", "No. You can order as a guest — just your name, phone and address.{accountAnswer}"],
        ["When do I pay?", "Nothing is charged when you place the order. After we confirm it, you receive a secure payment link."],
        ["How long does delivery take?", "Every set is sewn to order at our factory in Israel. Estimated delivery is 10–14 days from payment; the exact date is confirmed with your order. Courier delivery is complimentary across Israel."],
        ["Can I take different sizes for the knit and the trousers?", "Yes. That’s why the set has two size choices: one for the knit, one for the trouser waist. Between two sizes, take the smaller for a cleaner line or the larger for an easier fit. Not sure? Message us before you order."],
        ["Can I buy the pieces separately?", "Collection 01 is offered as a set only, the way it was designed to be worn."],
        ["Can I return or exchange?", "Yes. You can cancel a purchase under Israel’s Consumer Protection Law. If the size isn’t right, contact us within 14 days of delivery and we’ll look into an exchange. Full details are on the shipping and returns page."],
        ["Where are the clothes made?", "At a factory in Israel, in small runs. That’s how we keep control of the cut and the finish, and never make clothes nobody wears."]
      ],
      bonusItems: [
        ["How do bonus coins work?", "With an account, {rate}% of what you pay comes back as bonus coins once your order is paid. 1 coin = ₪1, and you can use your coins at checkout on your next order. Ordered as a guest? Create an account with the same email and the coins for that order are added."]
      ],
      accountAnswer: " An account is optional: it saves your details for next time and collects bonus coins."
    },
    nf: { title: "Page not found", h1: "This page doesn’t exist.", p: "The set does." },
    account: {
      title: "Account", desc: "Your La Elegant account: orders, bonus coins and saved details.",
      h1: "Your account",
      intro: "Sign in to see your orders and bonus coins. No password needed.",
      google: "Continue with Google", or: "or", email: "Email", sendLink: "Email me a sign-in link",
      sent: "Check {email}. Tap the link in the email, or enter the 6-digit code from it here.",
      code: "Code from the email", verify: "Sign in", resend: "Use a different email",
      perks: ["{rate}% back in bonus coins on every paid order", "Your details saved for a faster checkout", "Your orders and their status in one place"],
      balance: "Bonus coins", balanceNote: "{rate}% of every paid order comes back as coins. 1 coin = ₪1, usable at checkout.",
      history: "History", noHistory: "No coins yet. They arrive once your first order is paid.",
      orders: "Your orders", noOrders: "No orders yet.", orderNo: "Order",
      status: { new: "Received", confirmed: "Confirmed", paid: "Paid · in production", shipped: "On its way", delivered: "Delivered", cancelled: "Cancelled" },
      kind: { earn: "Earned", spend: "Used", refund: "Returned", reverse: "Removed", adjust: "Adjustment" },
      details: "Your details", detailsNote: "Saved for a faster checkout.",
      name: "Full name", phone: "Phone", city: "City", street: "Street and number", apt: "Apartment, floor, entry code",
      marketing: "Send me news about new drops. You can unsubscribe at any time.",
      save: "Save", saved: "Saved",
      signedInAs: "Signed in as", signOut: "Sign out",
      del: "Delete my account",
      delConfirm: "Delete your account? Your bonus coins will be lost. Past orders stay in our records for accounting, without your account.",
      deleted: "Your account was deleted.",
      track: "Track an order", trackNote: "Ordered as a guest? Enter your order number and phone.",
      trackNo: "Order number", trackBtn: "Check status", trackNone: "We couldn’t find that order. Check the number and the phone.",
      claimed: "We found {n} earlier order(s) with your email and added them to your account.",
      soon: "Accounts open soon. Meanwhile you can order as a guest — checkout works without an account.",
      err: "Something went wrong. Please try again.", errEmail: "That email address doesn’t look right",
      errCode: "That code didn’t work. Check it, or tap the link in the email."
    },
    ui: {
      bag: "Bag", checkout: "Checkout", thanks: "Thank you", empty: "Your bag is empty.", shopSet: "Shop the set",
      addOne: "Add one", removeOne: "Remove one", remove: "Remove", qty: "Quantity",
      subtotal: "Subtotal", delivery: "Delivery", free: "Complimentary", withOrder: "Confirmed with order", total: "Total", plusDelivery: "+ delivery",
      back: "← Back to bag", contact: "1 · Contact", deliveryStep: "2 · Delivery", payment: "3 · Payment", payTitle: "Secure payment link",
      fullName: "Full name", phone: "Phone", email: "Email", optional: "optional", city: "City", street: "Street and number",
      apt: "Apartment, floor, entry code", notes: "Notes", method: "Delivery method",
      agreeTpl: "I have read and agree to the {terms}, the {ship} and the {priv}.", agreeTerms: "terms", agreeShip: "shipping & returns policy", agreePriv: "privacy policy",
      termsErr: "Please accept the terms to continue", place: "Place order",
      errName: "Enter your full name", errPhone: "Enter an Israeli phone number, e.g. 050-1234567", errEmail: "That email address doesn’t look right",
      errCity: "Enter your city", errStreet: "Enter street and number",
      waTitle: "One last step", waText: "WhatsApp opens with your order. Send the message and we’ll confirm your sizes and delivery date, then send a secure payment link.",
      readyTitle: "Your order is ready", readyText: "Copy your order and send it to the La Elegant team. We’ll confirm your sizes and delivery date, then send a secure payment link. Nothing has been charged.",
      sendWa: "Send on WhatsApp", copy: "Copy order", copied: "Copied", selected: "Selected — copy it", continue: "Continue browsing",
      order: "Order", linkCopied: "Link copied", close: "Close",
      signInPrompt: "Have an account? Sign in to use and earn bonus coins.", signIn: "Sign in",
      bonusUse: "Use my bonus coins ({n})", bonusLine: "Bonus coins",
      earnAfter: "{n} in bonus coins will be added to your account once this order is paid.",
      guestEarn: "Create an account{withEmail} to get {n} in bonus coins for this order.", withEmail: " with {email}", createAccount: "Create an account",
      msg: { hi: "Hi! A new order from", no: "Order no", sub: "Subtotal", del: "Delivery", bonus: "Bonus coins used", total: "Total", name: "Name", phone: "Phone", email: "Email", addr: "Address", notes: "Notes", size: "×" }
    },
    legal: {
      updated: "Last updated",
      shipping: {
        title: "Shipping & returns", desc: "Shipping, cancellation and returns: made-to-order sets, delivery times and cancellation under Israel’s Consumer Protection Law."
      },
      terms: { title: "Terms", desc: "Terms of use and purchase for La Elegant, including accounts and bonus coins." },
      privacy: { title: "Privacy", desc: "What information La Elegant collects, why, who processes it and how to ask us to see or delete it." },
      accessibility: { title: "Accessibility", desc: "La Elegant accessibility statement: what has been done, known limitations and how to contact us." }
    }
  },

  /* =============================== HEBREW =============================== */
  he: {
    meta: { htmlLang: "he", dir: "rtl", ogLocale: "he_IL", hreflang: "he", name: "עברית", switchTo: "English" },
    site: {
      tagline: "אלגנטיות היא הדרך שבה אתה נכנס לחדר.",
      taglineEm: "נכנס",
      title: "קולקציה 01",
      homeTitle: "אופנת גברים ישראלית, תפורה לפי הזמנה",
      description: "La Elegant — אופנת גברים ישראלית, תפורה לפי הזמנה. קולקציה 01: The Bordeaux Set, סריג חצי רוכסן ומכנסיים עם קפלים בצבע שנהב. ‎₪990, משלוח חינם לכל הארץ.",
      renderNote: "התמונות מציגות את העיצוב בתנועה. גוון הבד בפועל עשוי להיות שונה מעט.",
      preorder: "קולקציה 01 · נתפר לפי הזמנה בישראל",
      leadTime: "זמן אספקה משוער 10–14 ימים",
      paymentNote: "שום דבר לא מחויב עכשיו. נאשר איתך את המידות ואת מועד האספקה ואז נשלח קישור מאובטח לתשלום.",
      heroAlt: "דוגמן הולך לעבר המצלמה ב-The Bordeaux Set",
      sewn: "נתפר לפי הזמנה בישראל"
    },
    nav: { set: "הסט", story: "הסיפור", faq: "שאלות נפוצות", account: "החשבון שלי", menu: "תפריט", close: "סגירה", bag: "סל", skip: "דילוג לתוכן", home: "דף הבית", main: "ראשי" },
    foot: { collection: "קולקציה 01", how: "איך מזמינים", info: "מידע", shipping: "משלוחים והחזרות", terms: "תקנון", privacy: "פרטיות", accessibility: "נגישות", contact: "יצירת קשר", shop: "חנות", businessNo: "ע.מ." },
    shipping: { courier: { label: "שליח עד הבית", note: "חינם לכל הארץ" } },
    home: {
      lead: "קולקציה 01", shopSet: "לסט", firstDrop: "קולקציה 01 · הדרופ הראשון", theSet: "לסט",
      chooseSizes: "בחירת מידות", freeDelivery: "משלוח חינם בכל הארץ", inColor: "בצבע",
      promise: [
        ["נתפר לפי הזמנה", "הסט שלך נכנס לייצור רק אחרי שהזמנת אותו. בלי מחסנים, בלי עודפים."],
        ["תוצרת ישראל", "נגזר ונתפר בסדרות קטנות במפעל שאנחנו עובדים איתו ישירות."],
        ["שתי מידות, סט אחד", "בוחרים בנפרד מידה לסריג ומידת מותן למכנסיים, לגזרה שהיא שלך."]
      ],
      promiseLabel: "איך זה נעשה",
      mfTitle: "אנחנו לא מייצרים מלאי.", mfEm: "אנחנו מייצרים את שלך.",
      mfText: "כל סט נכנס לייצור במפעל בישראל רק אחרי שהוזמן. סדרות קטנות, גזרות נקיות, צבעים שקטים, וסט אחד שמשנה את החדר.",
      ourStory: "הסיפור שלנו"
    },
    pdp: {
      twoPieces: "שני פריטים", add: "הוספת הסט לסל", addShort: "הוספה לסל",
      assure: ["משלוח חינם עם שליח לכל הארץ", "שום דבר לא מחויב עד שנאשר את ההזמנה"],
      ask: "שאלות על מידות? כתבו לנו בוואטסאפ", askMsg: "היי, יש לי שאלה על",
      accSet: "הסט", accDetails: "פרטים", accShip: "משלוחים והחזרות",
      shipText: "נתפר לפי הזמנה; מועד האספקה מאושר יחד עם ההזמנה, לפני התשלום. משלוח עם שליח חינם לכל הארץ. ניתן לבטל עסקה לפי חוק הגנת הצרכן.",
      fullDetails: "כל הפרטים", copyLink: "העתקת קישור", images: "תמונות", inMotion: "הסט בתנועה", image: "תמונה",
      sizeGuide: "מדריך מידות", guideNote: "מידות גוף. בין שתי מידות: הקטנה לקו נקי יותר, הגדולה לגזרה נוחה יותר.",
      crumbs: "מיקום בעמוד", home: "דף הבית", bonus: "{n} חוזרים כמטבעות בונוס עם חשבון"
    },
    products: {
      set01: {
        name: "The Bordeaux Set", color: "בורדו / שנהב",
        seoTitle: "The Bordeaux Set — סט לגבר: סריג חצי רוכסן ומכנסיים עם קפלים",
        seoDesc: "קולקציה 01 של La Elegant: סריג בורדו לגבר עם חצי רוכסן ומכנסיים בצבע שנהב עם קפלים. נתפר לפי הזמנה בישראל. ‎₪990 לסט, משלוח חינם.",
        imgAlt: "The Bordeaux Set: סריג בורדו עם חצי רוכסן ומכנסיים בצבע שנהב עם קפלים, בתנועה",
        lede: "שני פריטים, קו אחד. סריג בורדו עם חצי רוכסן מעל מכנסיים בצבע שנהב עם קפלים — המדים השקטים של מי שלא צריך להסביר את עצמו.",
        pieces: [
          { name: "The Half-Zip", color: "בורדו",
            desc: "סריג דק עם צווארון עומד ורוכסן קצר בצוואר. גומי מצולע בשרוולים ובשוליים שומר על הקו בפרק כף היד ובמותן.",
            details: ["צווארון עומד, חצי רוכסן", "גומי מצולע בשרוולים ובשוליים", "גזרה רגילה, קרובה לגוף"] },
          { name: "The Pleated Trouser", color: "שנהב",
            desc: "מכנסיים בגזרה גבוהה עם קפלים קדמיים וקו גיהוץ, שנופלים ישר עד הנעל. נקיים במותן, נדיבים לאורך הרגל.",
            details: ["קפלים קדמיים, קו גיהוץ", "מותן גבוה, רגל ישרה", "אורך מלא"] }
        ],
        details: ["סט לגבר, שני פריטים שנמכרים יחד", "נתפר לפי הזמנה בסדרות קטנות בישראל", "כל סט נבדק ידנית לפני המשלוח"],
        sizeGroups: {
          top: { label: "מידת סריג", short: "סריג", err: "בחרו מידת סריג" },
          waist: { label: "מידת מותן במכנסיים", short: "מותן", err: "בחרו מידת מותן" }
        },
        sizeGuide: {
          top: { title: "סריג — היקף חזה", cols: ["מידה", "חזה (ס״מ)", "EU"] },
          waist: { title: "מכנסיים — מותן", cols: ["מותן", "היקף מותן (ס״מ)", "EU"] }
        }
      }
    },
    story: {
      title: "הסיפור", desc: "הסיפור של La Elegant: אופנת גברים ישראלית שנתפרת לפי הזמנה בסדרות קטנות — אלגנטיות היא הדרך שבה אתה נכנס לחדר.",
      eyebrow: "הסיפור", h1: "אלגנטיות היא הדרך שבה אתה", h1Em: "נכנס", h1End: "לחדר.",
      blocks: [
        ["ההליכה", "אלגנטיות היא לא לוגו על החזה. היא ההליכה, הכתפיים, הקו — הרגע שבו רואים אותך עוד לפני שאמרת מילה. לכן כל פריט כאן מוצג בתנועה: בגדים טובים נראים הכי טוב כשהולכים בהם."],
        ["שקט, בכוונה", "בלי הדפסים צועקים, בלי טרנדים של עונה אחת. צבעים עמוקים, גזרות נקיות ובדים ששומרים על הצורה. בגדים למי שמעדיף שיזכרו אותו, לא רק ישימו לב אליו."],
        ["בלי מלאי", "רוב המותגים מייצרים אלפי יחידות ומקווים שיימכרו. אנחנו עובדים הפוך: כל סט נכנס לייצור רק אחרי שהוזמן. בלי מחסנים מלאים, בלי עודפים, בלי בגדים שנזרקים."],
        ["תוצרת ישראל", "הקולקציה נתפרת במפעל בישראל, בסדרות קטנות. אנחנו עובדים ישירות מול המפעל, בוחרים את הבדים בעצמנו ובודקים כל גזרה לפני שהיא מגיעה אליך."]
      ],
      factsTitle: "La Elegant במבט אחד", withAccount: " או עם חשבון",
      facts: {
        what: ["מה", "מותג אופנת גברים ישראלי — יוקרה שקטה, קווים קלאסיים"],
        founded: ["נוסד", "2026, ישראל"],
        made: ["ייצור", "נתפר לפי הזמנה בסדרות קטנות במפעל בישראל"],
        collection: ["קולקציה 01", "The Bordeaux Set: סריג חצי רוכסן + מכנסיים עם קפלים"],
        price: ["מחיר", "{price} לסט"],
        sizes: ["מידות", "סריג XS–XXL · מותן 28–38"],
        delivery: ["משלוח", "שליח חינם לכל הארץ · 10–14 ימים"],
        order: ["איך מזמינים", "באתר, כאורח{withAccount}"]
      }
    },
    faq: {
      title: "שאלות נפוצות", h1: "שאלות נפוצות", eyebrow: "עזרה",
      desc: "תשובות על La Elegant: הזמנה, תשלום, זמני אספקה, מידות, החזרות, חשבון, מטבעות בונוס וייצור בישראל.",
      more: "לא מצאת תשובה?", wa: "כתבו לנו בוואטסאפ", waEnd: "ונחזור אליך.", reach: "אפשר לפנות אלינו ב:", send: "שלחו לנו הודעה ונחזור אליכם.",
      items: [
        ["מה זה La Elegant?", "La Elegant הוא מותג אופנת גברים ישראלי שנוסד ב-2026. המותג מייצר פריטים שקטים וקלאסיים — צבעים עמוקים, גזרות נקיות — שנתפרים לפי הזמנה בסדרות קטנות במפעל בישראל. קולקציה 01 היא The Bordeaux Set: סריג בורדו עם חצי רוכסן ומכנסיים בצבע שנהב עם קפלים, {price} לסט, עם משלוח חינם לכל הארץ."],
        ["מה הסגנון של La Elegant?", "יוקרה שקטה — הלוק הקלאסי, ה״אולד מאני״. בלי לוגואים צועקים ובלי טרנדים של עונה אחת: קווים מחויטים וצבעים עמוקים שמתאימים לארוחת ערב, לדייט, לאירוע או ליום בעיר."],
        ["זה בגדי גברים?", "כן. קולקציה 01 נגזרה לגברים."],
        ["איך מזמינים?", "בוחרים מידת סריג ומידת מותן, מוסיפים את הסט לסל ומבצעים הזמנה. אנחנו מאשרים איתך את המידות ואת מועד האספקה באופן אישי ושולחים קישור מאובטח לתשלום. הסט נכנס לייצור אחרי התשלום."],
        ["צריך חשבון כדי להזמין?", "לא. אפשר להזמין כאורח — רק שם, טלפון וכתובת.{accountAnswer}"],
        ["מתי משלמים?", "שום דבר לא מחויב בזמן ההזמנה. אחרי שנאשר אותה, יישלח אליך קישור מאובטח לתשלום."],
        ["כמה זמן לוקח המשלוח?", "כל סט נתפר לפי הזמנה במפעל שלנו בישראל. זמן האספקה המשוער הוא 10–14 ימים מהתשלום; התאריך המדויק מאושר יחד עם ההזמנה. משלוח עם שליח חינם לכל הארץ."],
        ["אפשר לבחור מידות שונות לסריג ולמכנסיים?", "כן. בגלל זה יש לסט שתי בחירות מידה: אחת לסריג ואחת למותן המכנסיים. בין שתי מידות — הקטנה לקו נקי יותר, הגדולה לגזרה נוחה יותר. לא בטוחים? כתבו לנו לפני ההזמנה."],
        ["אפשר לקנות את הפריטים בנפרד?", "קולקציה 01 נמכרת כסט בלבד, כמו שהיא עוצבה להילבש."],
        ["אפשר להחזיר או להחליף?", "כן. ניתן לבטל עסקה לפי חוק הגנת הצרכן. אם המידה לא מתאימה, פנו אלינו תוך 14 ימים מהקבלה ונבדוק החלפה. כל הפרטים בעמוד משלוחים והחזרות."],
        ["איפה הבגדים מיוצרים?", "במפעל בישראל, בסדרות קטנות. כך אנחנו שולטים בגזרה ובגימור, ולא מייצרים בגדים שאף אחד לא ילבש."]
      ],
      bonusItems: [
        ["איך עובדים מטבעות הבונוס?", "עם חשבון, {rate}% ממה שמשלמים חוזרים כמטבעות בונוס אחרי שההזמנה שולמה. מטבע אחד = ‎₪1, ואפשר לממש אותם בקופה בהזמנה הבאה. הזמנת כאורח? פתחו חשבון עם אותו אימייל והמטבעות על ההזמנה יתווספו."]
      ],
      accountAnswer: " חשבון הוא אופציונלי: הוא שומר את הפרטים שלך לפעם הבאה וצובר מטבעות בונוס."
    },
    nf: { title: "העמוד לא נמצא", h1: "העמוד הזה לא קיים.", p: "הסט כן." },
    account: {
      title: "החשבון שלי", desc: "החשבון שלך ב-La Elegant: הזמנות, מטבעות בונוס ופרטים שמורים.",
      h1: "החשבון שלי",
      intro: "התחברו כדי לראות את ההזמנות ומטבעות הבונוס. בלי סיסמה.",
      google: "המשך עם Google", or: "או", email: "אימייל", sendLink: "שלחו לי קישור התחברות",
      sent: "בדקו את {email}. לחצו על הקישור במייל, או הקלידו כאן את הקוד בן 6 הספרות שבו.",
      code: "הקוד מהמייל", verify: "התחברות", resend: "אימייל אחר",
      perks: ["{rate}% חוזרים כמטבעות בונוס על כל הזמנה ששולמה", "הפרטים שלך שמורים לקופה מהירה יותר", "כל ההזמנות והסטטוס שלהן במקום אחד"],
      balance: "מטבעות בונוס", balanceNote: "{rate}% מכל הזמנה ששולמה חוזרים כמטבעות. מטבע אחד = ‎₪1, למימוש בקופה.",
      history: "היסטוריה", noHistory: "עדיין אין מטבעות. הם מגיעים אחרי שההזמנה הראשונה שולמה.",
      orders: "ההזמנות שלי", noOrders: "עדיין אין הזמנות.", orderNo: "הזמנה",
      status: { new: "התקבלה", confirmed: "אושרה", paid: "שולמה · בייצור", shipped: "בדרך אליך", delivered: "נמסרה", cancelled: "בוטלה" },
      kind: { earn: "נצברו", spend: "מומשו", refund: "הוחזרו", reverse: "בוטלו", adjust: "התאמה" },
      details: "הפרטים שלי", detailsNote: "שמורים לקופה מהירה יותר.",
      name: "שם מלא", phone: "טלפון", city: "עיר", street: "רחוב ומספר", apt: "דירה, קומה, קוד כניסה",
      marketing: "שלחו לי עדכונים על דרופים חדשים. אפשר להסיר את עצמי בכל עת.",
      save: "שמירה", saved: "נשמר",
      signedInAs: "מחובר/ת בתור", signOut: "התנתקות",
      del: "מחיקת החשבון",
      delConfirm: "למחוק את החשבון? מטבעות הבונוס יאבדו. הזמנות קודמות יישמרו אצלנו לצורכי הנהלת חשבונות, בלי קשר לחשבון.",
      deleted: "החשבון נמחק.",
      track: "מעקב הזמנה", trackNote: "הזמנת כאורח? הזינו מספר הזמנה וטלפון.",
      trackNo: "מספר הזמנה", trackBtn: "בדיקת סטטוס", trackNone: "לא מצאנו את ההזמנה. בדקו את המספר ואת הטלפון.",
      claimed: "מצאנו {n} הזמנות קודמות עם האימייל שלך והוספנו אותן לחשבון.",
      soon: "החשבונות ייפתחו בקרוב. בינתיים אפשר להזמין כאורח — הקופה עובדת בלי חשבון.",
      err: "משהו השתבש. נסו שוב.", errEmail: "כתובת האימייל לא נראית תקינה",
      errCode: "הקוד לא עבד. בדקו אותו, או לחצו על הקישור במייל."
    },
    ui: {
      bag: "סל", checkout: "קופה", thanks: "תודה", empty: "הסל ריק.", shopSet: "לסט",
      addOne: "עוד אחד", removeOne: "אחד פחות", remove: "הסרה", qty: "כמות",
      subtotal: "סכום ביניים", delivery: "משלוח", free: "חינם", withOrder: "מאושר עם ההזמנה", total: "סה״כ", plusDelivery: "+ משלוח",
      back: "→ חזרה לסל", contact: "1 · פרטי קשר", deliveryStep: "2 · משלוח", payment: "3 · תשלום", payTitle: "קישור מאובטח לתשלום",
      fullName: "שם מלא", phone: "טלפון", email: "אימייל", optional: "לא חובה", city: "עיר", street: "רחוב ומספר",
      apt: "דירה, קומה, קוד כניסה", notes: "הערות", method: "שיטת משלוח",
      agreeTpl: "קראתי ואני מסכים/ה ל{terms}, ל{ship} ול{priv}.", agreeTerms: "תקנון", agreeShip: "מדיניות המשלוחים וההחזרות", agreePriv: "מדיניות הפרטיות",
      termsErr: "יש לאשר את התקנון כדי להמשיך", place: "ביצוע הזמנה",
      errName: "הזינו שם מלא", errPhone: "הזינו מספר טלפון ישראלי, למשל 050-1234567", errEmail: "כתובת האימייל לא נראית תקינה",
      errCity: "הזינו עיר", errStreet: "הזינו רחוב ומספר",
      waTitle: "עוד צעד אחד", waText: "וואטסאפ נפתח עם ההזמנה שלך. שלחו את ההודעה ונאשר את המידות ואת מועד האספקה, ואז נשלח קישור מאובטח לתשלום.",
      readyTitle: "ההזמנה מוכנה", readyText: "העתיקו את ההזמנה ושלחו אותה לצוות La Elegant. נאשר את המידות ואת מועד האספקה ונשלח קישור מאובטח לתשלום. שום דבר לא חויב.",
      sendWa: "שליחה בוואטסאפ", copy: "העתקת ההזמנה", copied: "הועתק", selected: "סומן — העתיקו", continue: "המשך גלישה",
      order: "הזמנה", linkCopied: "הקישור הועתק", close: "סגירה",
      signInPrompt: "יש לך חשבון? התחברו כדי לממש ולצבור מטבעות בונוס.", signIn: "התחברות",
      bonusUse: "מימוש מטבעות הבונוס ({n})", bonusLine: "מטבעות בונוס",
      earnAfter: "{n} במטבעות בונוס יתווספו לחשבון אחרי שההזמנה תשולם.",
      guestEarn: "פתחו חשבון{withEmail} וקבלו {n} במטבעות בונוס על ההזמנה הזו.", withEmail: " עם {email}", createAccount: "פתיחת חשבון",
      msg: { hi: "היי! הזמנה חדשה מ-", no: "מספר הזמנה", sub: "סכום ביניים", del: "משלוח", bonus: "מטבעות בונוס", total: "סה״כ", name: "שם", phone: "טלפון", email: "אימייל", addr: "כתובת", notes: "הערות", size: "×" }
    },
    legal: {
      updated: "עודכן לאחרונה",
      shipping: { title: "משלוחים והחזרות", desc: "משלוחים, ביטולים והחזרות: סטים שנתפרים לפי הזמנה, זמני אספקה וביטול עסקה לפי חוק הגנת הצרכן." },
      terms: { title: "תקנון", desc: "תקנון השימוש והרכישה של La Elegant, כולל חשבון משתמש ומטבעות בונוס." },
      privacy: { title: "מדיניות פרטיות", desc: "איזה מידע La Elegant אוספת, למה, מי מעבד אותו ואיך מבקשים לעיין בו או למחוק אותו." },
      accessibility: { title: "הצהרת נגישות", desc: "הצהרת הנגישות של La Elegant: מה נעשה, מגבלות ידועות ואיך פונים אלינו." }
    }
  }
};

/* ---------------------------------------------------------------------
   Legal pages. c = context from build.mjs:
   c.L (link prefix for this language), c.today, c.contact (sentence), c.biz (business block),
   c.operator, c.shipList (<li>…), c.lead (lead-time text), c.rate (bonus %), c.accounts (true/false),
   c.days (return days), c.brand
   --------------------------------------------------------------------- */
export const LEGAL = {
  en: {
    shipping: c => `
<h1>Shipping, cancellation &amp; returns</h1>
<p class="updated">Last updated: ${c.today}</p>
<h2>Made to order</h2>
<p>Every set is sewn to order at a factory in Israel. After you place your order, we confirm your sizes and an estimated delivery date and send a secure payment link. Production starts once payment is received.</p>
<h2>Shipping</h2>
<ul>
${c.shipList}
<li>${c.lead} from payment. The exact date is confirmed with your order.</li>
<li>If production or delivery is delayed, we’ll let you know as soon as possible.</li>
</ul>
<h2>Cancelling a purchase</h2>
<p>You may cancel a purchase in accordance with Israel’s Consumer Protection Law, 5741-1981, and its regulations:</p>
<ul>
<li>Send a written cancellation notice within 14 days of receiving the product or the document with the transaction details, whichever is later.</li>
<li>Cancellation fee: 5% of the transaction price or ₪100, whichever is lower.</li>
<li>Refunds are made to the original payment method.</li>
${c.accounts ? `<li>Bonus coins used on the order are returned to your account; coins earned on it are removed.</li>` : ""}
</ul>
<h2>Returning an item</h2>
<ul>
<li>Items must be returned in their original condition, undamaged and unworn, with tags attached.</li>
<li>Return details (address or pickup) are provided when you contact us.</li>
</ul>
<h2>Size exchange</h2>
<p>Not sure about your size? Message us before ordering. If the size isn’t right after delivery, contact us within ${c.days} days and we’ll look into an exchange.</p>
<h2>Contact</h2>
<p>${c.contact}</p>`,

    terms: c => `
<h1>Terms of use</h1>
<p class="updated">Last updated: ${c.today}</p>
<h2>1. General</h2>
<p>This website (the “Site”) is operated under the brand ${c.brand}${c.operator ? ` by ${c.operator}` : ""} (“we”, “us”). Using the Site or placing an order constitutes acceptance of these terms.</p>
<h2>2. Orders and production</h2>
<p>Pieces are sewn to order. Placing an order on the Site is a request to purchase; the transaction becomes binding only after we confirm it and payment is made. We may decline an order, for example if a size cannot be produced. In that case no payment is taken, and any payment made is refunded in full.</p>
<h2>3. Prices and payment</h2>
<p>Prices are in Israeli new shekels and include VAT where applicable. Delivery cost, if any, is shown before payment. A secure payment link is sent after the order is confirmed.</p>
<h2>4. Delivery</h2>
<p>An estimated delivery date is given with the order confirmation. See the <a href="${c.L}/shipping">shipping &amp; returns policy</a>.</p>
<h2>5. Cancellation and returns</h2>
<p>Cancellations and returns are handled under Israel’s Consumer Protection Law, as set out in the <a href="${c.L}/shipping">shipping &amp; returns policy</a>.</p>
<h2>6. Ordering as a guest or with an account</h2>
<p>You can order without an account. ${c.accounts ? `Opening an account is optional and free. You sign in with Google or with a link sent to your email; you are responsible for keeping access to that email or Google account secure. You can delete your account at any time from the account page.` : `Optional customer accounts may be offered in the future; ordering as a guest will remain possible.`}</p>
${c.accounts ? `<h2>7. Bonus coins</h2>
<ul>
<li>Account holders receive bonus coins worth ${c.rate}% of the amount actually paid for an order (excluding delivery and excluding coins used), credited once the order is paid.</li>
<li>1 coin is worth ₪1 off a future order on the Site. Coins have no cash value, cannot be transferred, sold or exchanged for money, and cannot be used together with another offer unless that offer says so.</li>
<li>Coins used on an order that is cancelled are returned to the account; coins earned on an order that is cancelled or returned are removed.</li>
<li>A guest order can be added to an account opened later with the same email; coins for it are then credited if it was paid.</li>
<li>We may change or end the programme with at least 30 days’ notice on the Site. Coins in your account when a change is announced can be used until the change takes effect.</li>
<li>Deleting your account deletes its coins. Coins obtained by fraud or misuse may be cancelled.</li>
</ul>` : ""}
<h2>${c.accounts ? 8 : 7}. Images and descriptions</h2>
<p>We aim to show every piece accurately, but slight differences in shade and texture between an image on screen and the actual piece may occur.</p>
<h2>${c.accounts ? 9 : 8}. Intellectual property</h2>
<p>All content on the Site, including designs, images, videos, text and the ${c.brand} name and emblem, belongs to us and may not be copied or used without written permission.</p>
<h2>${c.accounts ? 10 : 9}. Privacy</h2>
<p>Use of personal information is described in the <a href="${c.L}/privacy">privacy policy</a>.</p>
<h2>${c.accounts ? 11 : 10}. Changes</h2>
<p>We may update these terms from time to time. An order is governed by the version in force when it was placed.</p>
<h2>${c.accounts ? 12 : 11}. Governing law</h2>
<p>These terms are governed by the laws of the State of Israel, and the competent courts in Israel have jurisdiction.</p>
<h2>${c.accounts ? 13 : 12}. Contact</h2>
<p>${c.biz ? c.biz + "<br>" : ""}${c.contact}</p>`,

    privacy: c => `
<h1>Privacy policy</h1>
<p class="updated">Last updated: ${c.today}</p>
<h2>What we collect</h2>
<ul>
<li>Details you enter when ordering: name, phone, email (optional), delivery address and notes.</li>
<li>Order details: the pieces, sizes and total.</li>
${c.accounts ? `<li>If you open an account: your email address, and if you sign in with Google, the name and email Google shares with us; the details you save in the account; your orders and bonus-coin balance; and whether you agreed to receive news.</li>` : ""}
<li>Anonymous usage statistics (such as page views) that don’t identify you personally.</li>
</ul>
<p>You are not required by law to give us this information, but we can’t handle an order without contact and delivery details.</p>
<h2>How we use it</h2>
<ul>
<li>To handle your order: confirmation, production, payment and delivery.</li>
<li>To contact you about your order.</li>
${c.accounts ? `<li>To run your account: signing you in, showing your orders and managing bonus coins.</li>` : ""}
<li>To improve the site based on statistics.</li>
</ul>
<p>We won’t send you marketing messages without your explicit consent, and you can withdraw consent at any time.</p>
<h2>Who processes it</h2>
<p>Only those needed to run the shop: our hosting provider (Vercel)${c.accounts ? ", our database and sign-in provider (Supabase)" : ""}, the courier, the payment provider and the messaging service through which your order is sent${c.accounts ? ", and Google if you choose to sign in with Google" : ""}. Some of these providers store data outside Israel under their own security and privacy commitments. We never sell your information.</p>
<h2>Your browser</h2>
<p>The site stores your bag${c.accounts ? " and, if you sign in, your sign-in session" : ""} in your browser’s local storage so they stay between visits. We don’t use advertising cookies.</p>
<h2>Storage and security</h2>
<p>Information is kept only as long as needed to handle your order, run your account and meet legal obligations such as bookkeeping. Card details are never entered on or stored by this site.</p>
<h2>Your rights</h2>
<p>Under Israel’s Protection of Privacy Law, 5741-1981, you may ask to review, correct or delete information about you by contacting us.${c.accounts ? ` You can also edit your details or delete your account yourself on the <a href="${c.L}/account">account page</a>.` : ""}</p>
<h2>Contact</h2>
<p>${c.biz ? c.biz + "<br>" : ""}${c.contact}</p>`,

    accessibility: c => `
<h1>Accessibility statement</h1>
<p class="updated">Last updated: ${c.today}</p>
<p>We want everyone to be able to browse and order on this site with ease. The site was built following Israeli Standard 5568 for web content accessibility, based on WCAG 2.0 level AA.</p>
<h2>What we’ve done</h2>
<ul>
<li>Clear page structure with headings and a defined page language, in English and Hebrew.</li>
<li>The whole site can be used with a keyboard, with a visible focus indicator and a “skip to content” link.</li>
<li>Every product image has a text alternative.</li>
<li>High-contrast text on a dark background.</li>
<li>Videos are silent and only show the garments in motion. If your device is set to reduce motion, you see a still image instead.</li>
<li>Form fields have labels, and error messages appear as text next to the field.</li>
<li>The site works on phones and with browser text zoom.</li>
</ul>
<h2>Known limitations</h2>
<p>We keep testing the site. If any part isn’t accessible to you, we’ll gladly help you complete your order directly.</p>
<h2>Accessibility contact</h2>
<p>${c.access ? c.access + "<br>" : ""}${c.contact}</p>`
  },

  he: {
    shipping: c => `
<h1>משלוחים, ביטולים והחזרות</h1>
<p class="updated">עודכן לאחרונה: ${c.today}</p>
<h2>נתפר לפי הזמנה</h2>
<p>כל סט נתפר לפי הזמנה במפעל בישראל. אחרי ביצוע ההזמנה נאשר איתך את המידות ומועד אספקה משוער, ונשלח קישור מאובטח לתשלום. הייצור מתחיל לאחר קבלת התשלום.</p>
<h2>משלוח</h2>
<ul>
${c.shipList}
<li>${c.lead} מיום התשלום. התאריך המדויק מאושר יחד עם ההזמנה.</li>
<li>אם יהיה עיכוב בייצור או במשלוח, נעדכן אותך בהקדם.</li>
</ul>
<h2>ביטול עסקה</h2>
<p>ניתן לבטל עסקה בהתאם לחוק הגנת הצרכן, התשמ״א-1981, ולתקנות שהותקנו לפיו:</p>
<ul>
<li>יש למסור הודעת ביטול בכתב תוך 14 ימים מיום קבלת המוצר או מיום קבלת המסמך עם פרטי העסקה, לפי המאוחר.</li>
<li>דמי ביטול: 5% ממחיר העסקה או 100 ₪, לפי הנמוך מביניהם.</li>
<li>ההחזר יבוצע לאמצעי התשלום המקורי.</li>
${c.accounts ? `<li>מטבעות בונוס שמומשו בהזמנה יוחזרו לחשבון; מטבעות שנצברו בגינה יבוטלו.</li>` : ""}
</ul>
<h2>החזרת פריט</h2>
<ul>
<li>יש להחזיר את הפריטים במצבם המקורי, ללא נזק, לא לבושים ועם התוויות.</li>
<li>פרטי ההחזרה (כתובת או איסוף) יימסרו בעת הפנייה אלינו.</li>
</ul>
<h2>החלפת מידה</h2>
<p>לא בטוחים במידה? כתבו לנו לפני ההזמנה. אם המידה לא מתאימה אחרי הקבלה, פנו אלינו תוך ${c.days} ימים ונבדוק החלפה.</p>
<h2>יצירת קשר</h2>
<p>${c.contact}</p>`,

    terms: c => `
<h1>תקנון שימוש</h1>
<p class="updated">עודכן לאחרונה: ${c.today}</p>
<h2>1. כללי</h2>
<p>אתר זה (״האתר״) מופעל תחת המותג ${c.brand}${c.operator ? ` על ידי ${c.operator}` : ""} (״אנחנו״). השימוש באתר או ביצוע הזמנה בו מהווים הסכמה לתקנון זה. התקנון מנוסח בלשון זכר מטעמי נוחות בלבד ומתייחס לכל המגדרים.</p>
<h2>2. הזמנות וייצור</h2>
<p>הפריטים נתפרים לפי הזמנה. ביצוע הזמנה באתר הוא בקשה לרכישה; העסקה מחייבת רק לאחר שאישרנו אותה ובוצע תשלום. אנו רשאים לסרב להזמנה, למשל אם לא ניתן לייצר מידה מסוימת. במקרה כזה לא ייגבה תשלום, וכל תשלום שבוצע יוחזר במלואו.</p>
<h2>3. מחירים ותשלום</h2>
<p>המחירים בשקלים חדשים וכוללים מע״מ ככל שחל. עלות משלוח, אם יש, מוצגת לפני התשלום. קישור מאובטח לתשלום נשלח לאחר אישור ההזמנה.</p>
<h2>4. אספקה</h2>
<p>מועד אספקה משוער נמסר עם אישור ההזמנה. ראו את <a href="${c.L}/shipping">מדיניות המשלוחים וההחזרות</a>.</p>
<h2>5. ביטולים והחזרות</h2>
<p>ביטולים והחזרות מטופלים לפי חוק הגנת הצרכן, כמפורט ב<a href="${c.L}/shipping">מדיניות המשלוחים וההחזרות</a>.</p>
<h2>6. הזמנה כאורח או עם חשבון</h2>
<p>ניתן להזמין בלי חשבון. ${c.accounts ? `פתיחת חשבון היא אופציונלית וללא תשלום. ההתחברות נעשית עם Google או עם קישור שנשלח לאימייל; באחריותך לשמור על הגישה לאימייל או לחשבון Google. ניתן למחוק את החשבון בכל עת מעמוד החשבון.` : `ייתכן שבעתיד יוצע חשבון לקוח אופציונלי; האפשרות להזמין כאורח תישאר.`}</p>
${c.accounts ? `<h2>7. מטבעות בונוס</h2>
<ul>
<li>בעלי חשבון מקבלים מטבעות בונוס בשווי ${c.rate}% מהסכום ששולם בפועל עבור ההזמנה (ללא משלוח וללא מטבעות שמומשו), והם נזקפים לחשבון לאחר שההזמנה שולמה.</li>
<li>כל מטבע שווה הנחה של ‎₪1 בהזמנה עתידית באתר. למטבעות אין ערך כספי, לא ניתן להעביר, למכור או להמיר אותם בכסף, ולא ניתן לשלב אותם עם מבצע אחר אלא אם נאמר אחרת באותו מבצע.</li>
<li>מטבעות שמומשו בהזמנה שבוטלה יוחזרו לחשבון; מטבעות שנצברו בגין הזמנה שבוטלה או הוחזרה יבוטלו.</li>
<li>הזמנה שבוצעה כאורח ניתנת לצירוף לחשבון שנפתח לאחר מכן עם אותו אימייל; אם שולמה, יתווספו המטבעות בגינה.</li>
<li>אנו רשאים לשנות את התוכנית או להפסיקה בהודעה מראש של 30 ימים לפחות באתר. מטבעות שבחשבון ביום ההודעה ניתנים למימוש עד כניסת השינוי לתוקף.</li>
<li>מחיקת החשבון מוחקת את המטבעות שבו. מטבעות שהושגו במרמה או בשימוש לרעה עשויים להתבטל.</li>
</ul>` : ""}
<h2>${c.accounts ? 8 : 7}. תמונות ותיאורים</h2>
<p>אנו משתדלים להציג כל פריט במדויק, אך ייתכנו הבדלים קלים בגוון ובמרקם בין התמונה במסך לבין הפריט בפועל.</p>
<h2>${c.accounts ? 9 : 8}. קניין רוחני</h2>
<p>כל התוכן באתר, לרבות העיצובים, התמונות, הסרטונים, הטקסטים, השם ${c.brand} והסמל, שייך לנו ואין להעתיקו או להשתמש בו ללא אישור בכתב.</p>
<h2>${c.accounts ? 10 : 9}. פרטיות</h2>
<p>השימוש במידע אישי מתואר ב<a href="${c.L}/privacy">מדיניות הפרטיות</a>.</p>
<h2>${c.accounts ? 11 : 10}. שינויים</h2>
<p>אנו רשאים לעדכן את התקנון מעת לעת. על כל הזמנה חל הנוסח שהיה בתוקף בעת ביצועה.</p>
<h2>${c.accounts ? 12 : 11}. דין וסמכות שיפוט</h2>
<p>על תקנון זה חלים דיני מדינת ישראל, וסמכות השיפוט נתונה לבתי המשפט המוסמכים בישראל.</p>
<h2>${c.accounts ? 13 : 12}. יצירת קשר</h2>
<p>${c.biz ? c.biz + "<br>" : ""}${c.contact}</p>`,

    privacy: c => `
<h1>מדיניות פרטיות</h1>
<p class="updated">עודכן לאחרונה: ${c.today}</p>
<h2>איזה מידע אנחנו אוספים</h2>
<ul>
<li>הפרטים שמוזנים בהזמנה: שם, טלפון, אימייל (לא חובה), כתובת למשלוח והערות.</li>
<li>פרטי ההזמנה: הפריטים, המידות והסכום.</li>
${c.accounts ? `<li>אם נפתח חשבון: כתובת האימייל, ובהתחברות עם Google — השם והאימייל ש-Google משתפת איתנו; הפרטים שנשמרו בחשבון; ההזמנות ויתרת מטבעות הבונוס; והאם ניתנה הסכמה לקבלת עדכונים.</li>` : ""}
<li>סטטיסטיקות שימוש אנונימיות (כמו צפיות בעמודים) שאינן מזהות אותך אישית.</li>
</ul>
<p>אין חובה חוקית למסור לנו מידע זה, אך בלי פרטי קשר ומשלוח לא נוכל לטפל בהזמנה.</p>
<h2>למה אנחנו משתמשים בו</h2>
<ul>
<li>לטיפול בהזמנה: אישור, ייצור, תשלום ומשלוח.</li>
<li>ליצירת קשר בנוגע להזמנה.</li>
${c.accounts ? `<li>לניהול החשבון: התחברות, הצגת ההזמנות וניהול מטבעות הבונוס.</li>` : ""}
<li>לשיפור האתר על סמך סטטיסטיקות.</li>
</ul>
<p>לא נשלח הודעות שיווקיות בלי הסכמה מפורשת, וניתן לבטל את ההסכמה בכל עת.</p>
<h2>מי מעבד את המידע</h2>
<p>רק מי שנדרש להפעלת החנות: ספק האחסון (Vercel)${c.accounts ? ", ספק מסד הנתונים וההתחברות (Supabase)" : ""}, חברת השליחויות, ספק התשלומים ושירות ההודעות שדרכו נשלחת ההזמנה${c.accounts ? ", וכן Google אם בחרת להתחבר באמצעותה" : ""}. חלק מהספקים שומרים מידע מחוץ לישראל, בכפוף להתחייבויות האבטחה והפרטיות שלהם. אנחנו לעולם לא מוכרים את המידע שלך.</p>
<h2>הדפדפן שלך</h2>
<p>האתר שומר את הסל${c.accounts ? " ואם התחברת — גם את פרטי ההתחברות" : ""} באחסון המקומי של הדפדפן, כדי שיישמרו בין ביקורים. איננו משתמשים בעוגיות פרסום.</p>
<h2>שמירה ואבטחה</h2>
<p>המידע נשמר רק כל עוד הוא נדרש לטיפול בהזמנה, לניהול החשבון ולעמידה בחובות לפי דין, כמו הנהלת חשבונות. פרטי כרטיס אשראי לעולם אינם מוזנים או נשמרים באתר זה.</p>
<h2>הזכויות שלך</h2>
<p>לפי חוק הגנת הפרטיות, התשמ״א-1981, ניתן לבקש לעיין במידע עליך, לתקן אותו או למחוק אותו בפנייה אלינו.${c.accounts ? ` אפשר גם לערוך את הפרטים או למחוק את החשבון בעצמך ב<a href="${c.L}/account">עמוד החשבון</a>.` : ""}</p>
<h2>יצירת קשר</h2>
<p>${c.biz ? c.biz + "<br>" : ""}${c.contact}</p>`,

    accessibility: c => `
<h1>הצהרת נגישות</h1>
<p class="updated">עודכן לאחרונה: ${c.today}</p>
<p>אנחנו רוצים שכל אחד יוכל לגלוש ולהזמין באתר בקלות. האתר נבנה לפי תקן ישראלי 5568 לנגישות תכנים באינטרנט, המבוסס על WCAG 2.0 ברמה AA.</p>
<h2>מה עשינו</h2>
<ul>
<li>מבנה עמודים ברור עם כותרות ושפת עמוד מוגדרת, בעברית ובאנגלית.</li>
<li>אפשר להשתמש בכל האתר עם מקלדת, עם סימון פוקוס גלוי וקישור ״דילוג לתוכן״.</li>
<li>לכל תמונת מוצר יש חלופה טקסטואלית.</li>
<li>טקסט בניגודיות גבוהה על רקע כהה.</li>
<li>הסרטונים שקטים ומציגים רק את הבגדים בתנועה. אם המכשיר מוגדר להפחתת תנועה, תוצג תמונה סטטית.</li>
<li>לשדות הטפסים יש תוויות, והודעות שגיאה מופיעות כטקסט ליד השדה.</li>
<li>האתר עובד בטלפונים ועם הגדלת טקסט בדפדפן.</li>
</ul>
<h2>מגבלות ידועות</h2>
<p>אנחנו ממשיכים לבדוק את האתר. אם חלק כלשהו אינו נגיש עבורך, נשמח לעזור להשלים את ההזמנה ישירות.</p>
<h2>רכז/ת נגישות</h2>
<p>${c.access ? c.access + "<br>" : ""}${c.contact}</p>`
  }
};

/* Small phrases the build needs in both languages (contact sentence, shipping lines). */
export const PHRASES = {
  en: {
    contactVia: "You can reach us by", contactNone: "You can reach us through the contact options on this site or by replying to your order confirmation.",
    wa: "WhatsApp", email: "email", ig: "Instagram",
    shipFree: "complimentary", shipConfirm: "cost confirmed with your order", businessNo: "business no."
  },
  he: {
    contactVia: "אפשר לפנות אלינו ב:", contactNone: "אפשר לפנות אלינו דרך אפשרויות הקשר באתר או בתשובה לאישור ההזמנה.",
    wa: "וואטסאפ", email: "אימייל", ig: "אינסטגרם",
    shipFree: "חינם", shipConfirm: "העלות מאושרת עם ההזמנה", businessNo: "ע.מ."
  }
};
