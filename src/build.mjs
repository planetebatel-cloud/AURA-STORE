// Static site builder: src/ → public/. Node built-ins only (runs on Vercel as the build command).
import { SITE, PRODUCTS, FAQ } from "./data.mjs";
import { mkdirSync, writeFileSync, cpSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = dirname(fileURLToPath(import.meta.url));
const OUT = join(SRC, "..", "public");
const TODAY = new Date().toISOString().slice(0, 10);
const TBD = '<mark class="tbd">[יעודכן]</mark>';

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const abs = p => SITE.url.replace(/\/$/, "") + p;
const money = n => "₪" + Number(n).toLocaleString("he-IL");
const pUrl = p => "/products/" + p.slug;
const byId = id => PRODUCTS.find(p => p.id === id);
const phoneText = n => n ? "0" + String(n).replace(/^972/, "").replace(/(\d{2})(\d{3})(\d{4})$/, "$1-$2-$3") : "";
const wa = text => SITE.whatsapp ? "https://wa.me/" + SITE.whatsapp + (text ? "?text=" + encodeURIComponent(text) : "") : "";
const val = v => v ? esc(v) : TBD;
const B = SITE.business;
const bizName = val(B.name), bizId = val(B.id), bizAddr = val(B.address);
const contactLine = [
  SITE.whatsapp ? `וואטסאפ <span dir="ltr">${esc(phoneText(SITE.whatsapp))}</span>` : "",
  SITE.email ? `אימייל <a href="mailto:${esc(SITE.email)}" dir="ltr">${esc(SITE.email)}</a>` : ""
].filter(Boolean).join(" · ") || TBD;

/* ---------- shared pieces ---------- */
const wordmark = (cls = "mark") => `<span class="${cls}" dir="ltr">${esc(SITE.brand)}</span>`;

function header(page) {
  return `
<a class="skip" href="#main">דילוג לתוכן</a>
<header class="head${page === "home" ? " is-home" : ""}">
  <div class="head-in pad">
    <div class="head-start">
      <button class="menu-btn" id="menu-btn" type="button" aria-expanded="false" aria-controls="menu">תפריט</button>
      <nav class="nav" id="menu" aria-label="ראשי">
        <a href="/#shop">קולקציה</a>
        <a href="/story">הסיפור</a>
        <a href="/faq">שאלות</a>
      </nav>
    </div>
    <a class="head-mark" href="/" aria-label="${esc(SITE.brand)}, לדף הבית">${wordmark()}</a>
    <button class="bag-btn" id="bag-open" type="button" aria-haspopup="dialog">סל <span class="count" id="bag-count">0</span></button>
  </div>
</header>`;
}

function footer() {
  const social = [
    SITE.instagram ? `<li><a href="https://instagram.com/${esc(SITE.instagram)}" target="_blank" rel="noopener">Instagram</a></li>` : "",
    SITE.tiktok ? `<li><a href="https://www.tiktok.com/@${esc(SITE.tiktok)}" target="_blank" rel="noopener">TikTok</a></li>` : "",
    SITE.whatsapp ? `<li><a href="${esc(wa(""))}" target="_blank" rel="noopener">וואטסאפ <span dir="ltr">${esc(phoneText(SITE.whatsapp))}</span></a></li>` : "",
    SITE.email ? `<li><a href="mailto:${esc(SITE.email)}" dir="ltr">${esc(SITE.email)}</a></li>` : ""
  ].join("");
  const legal = [B.name, B.id ? "ע.מ./ח.פ. " + B.id : ""].filter(Boolean).map(esc).join(" · ");
  return `
<footer class="foot">
  <div class="foot-cols pad">
    <div class="foot-lead">
      <p class="foot-tag">${esc(SITE.tagline)}</p>
    </div>
    <nav aria-label="חנות"><h2>חנות</h2><ul>
      ${PRODUCTS.map(p => `<li><a href="${pUrl(p)}">${esc(p.name)}</a></li>`).join("")}
    </ul></nav>
    <nav aria-label="מידע"><h2>מידע</h2><ul>
      <li><a href="/story">הסיפור</a></li>
      <li><a href="/faq">שאלות נפוצות</a></li>
      <li><a href="/shipping">משלוחים והחזרות</a></li>
      <li><a href="/terms">תקנון</a></li>
      <li><a href="/privacy">מדיניות פרטיות</a></li>
      <li><a href="/accessibility">הצהרת נגישות</a></li>
    </ul></nav>
    ${social ? `<div><h2>קשר</h2><ul>${social}</ul></div>` : ""}
  </div>
  <div class="foot-word pad" aria-hidden="true">${wordmark("foot-mark")}</div>
  <div class="foot-base pad"><span>© ${new Date().getFullYear()} <span dir="ltr">${esc(SITE.brand)}</span>${legal ? " · " + legal : ""}</span><span>נתפר בישראל</span></div>
</footer>`;
}

const bagDrawer = `
<div class="scrim" id="scrim" hidden></div>
<aside class="drawer" id="bag" role="dialog" aria-modal="true" aria-labelledby="bag-title" hidden>
  <div class="d-head pad">
    <h2 id="bag-title">סל</h2>
    <button class="x" type="button" data-close aria-label="סגירה">×</button>
  </div>
  <div class="d-body pad" id="v-cart"></div>
  <div class="d-foot pad" id="f-cart">
    <div class="sum"><div class="total"><span>סכום ביניים</span><span class="price" id="c-sub" dir="ltr"></span></div></div>
    <button class="btn wide" type="button" id="to-details">להמשך הזמנה</button>
    <p class="note">${esc(SITE.preorder)}</p>
  </div>
  <form class="d-body pad form" id="v-details" novalidate hidden>
    <button class="link" type="button" id="back-cart">חזרה לסל</button>
    <div class="field"><label for="o-name">שם מלא</label><input id="o-name" name="name" autocomplete="name" required><p class="err" hidden></p></div>
    <div class="two">
      <div class="field"><label for="o-phone">טלפון</label><input id="o-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" required><p class="err" hidden></p></div>
      <div class="field"><label for="o-email">אימייל <small>לא חובה</small></label><input id="o-email" name="email" type="email" autocomplete="email" dir="ltr"><p class="err" hidden></p></div>
    </div>
    <fieldset><legend class="label">משלוח</legend><div class="ship" id="o-ship"></div></fieldset>
    <div id="o-address" class="form">
      <div class="two">
        <div class="field"><label for="o-city">עיר</label><input id="o-city" name="city" autocomplete="address-level2" required><p class="err" hidden></p></div>
        <div class="field"><label for="o-street">רחוב ומספר</label><input id="o-street" name="street" autocomplete="address-line1" required><p class="err" hidden></p></div>
      </div>
      <div class="field"><label for="o-apt">דירה, קומה, קוד כניסה <small>לא חובה</small></label><input id="o-apt" name="apt" autocomplete="address-line2"></div>
    </div>
    <div class="field"><label for="o-notes">הערות <small>לא חובה</small></label><textarea id="o-notes" name="notes" rows="2"></textarea></div>
    <label class="check"><input type="checkbox" id="o-terms"><span>קראתי ואני מסכים/ה ל<a href="/terms" target="_blank">תקנון</a>, ל<a href="/shipping" target="_blank">מדיניות המשלוחים וההחזרות</a> ול<a href="/privacy" target="_blank">מדיניות הפרטיות</a>.</span></label>
    <p class="err" id="o-terms-err" hidden>יש לאשר את התקנון כדי להמשיך</p>
  </form>
  <div class="d-foot pad" id="f-details" hidden>
    <div class="sum" id="o-sum"></div>
    <button class="btn wide" type="submit" form="v-details" id="o-submit">שליחת ההזמנה</button>
    <p class="err" id="o-err" role="alert" hidden></p>
    <p class="note">${esc(SITE.checkout.note)}</p>
  </div>
  <div class="d-body pad" id="v-done" hidden>
    <div class="done">
      <p class="eyebrow" id="d-num"></p>
      <h3>ההזמנה מוכנה</h3>
      <p>וואטסאפ נפתח עם פרטי ההזמנה. שלחו את ההודעה, ונחזור אליכם עם אישור, זמן אספקה ופרטי תשלום.</p>
      <a class="btn" id="d-wa" href="#" target="_blank" rel="noopener">פתיחה בוואטסאפ</a>
      <pre id="d-msg"></pre>
      <button class="btn ghost" type="button" data-close>המשך קנייה</button>
    </div>
  </div>
</aside>
<div class="toast" id="toast" role="status" aria-live="polite" hidden></div>`;

function layout({ path, title, desc, image, jsonld = [], body, page = "" }) {
  const canonical = abs(path);
  const ogImage = abs(image || "/og.jpg");
  const fullTitle = title ? `${title} | ${SITE.brand}` : `${SITE.brand} · ${SITE.tagline}`;
  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="${page === "product" ? "product" : "website"}">
<meta property="og:site_name" content="${esc(SITE.brand)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:locale" content="he_IL">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#FFFFFF">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400..700&family=Frank+Ruhl+Libre:wght@300..600&family=IBM+Plex+Sans+Hebrew:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/assets/site.css">
${jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`).join("\n")}
<script src="/assets/config.js"></script>
<script defer src="/assets/store.js"></script>
<script defer src="/_vercel/insights/script.js"></script>
</head>
<body class="page-${page || "doc"}">
${header(page)}
<main id="main" tabindex="-1">
${body}
</main>
${footer()}
${bagDrawer}
</body>
</html>
`;
}

/* ---------- product card ---------- */
function card(p, eager = false) {
  return `
<article class="card" data-id="${p.id}">
  <div class="media walk" data-video="/${p.video}">
    <a class="frame" href="${pUrl(p)}" aria-label="${esc(p.name)}, ${esc(p.color)}, ${money(p.price)}">
      <img src="/${p.poster}" alt="${esc(p.name)} ב${esc(p.color)}" width="540" height="720" ${eager ? "" : 'loading="lazy"'} decoding="async">
      <video muted playsinline loop preload="none" aria-hidden="true" tabindex="-1"></video>
    </a>
    <div class="quick" role="group" aria-label="הוספה מהירה של ${esc(p.name)}">
      <span>הוספה מהירה</span>
      ${SITE.sizes.map(s => `<button type="button" data-add="${p.id}" data-size="${s}" aria-label="מידה ${s}">${s}</button>`).join("")}
    </div>
  </div>
  <a class="card-meta" href="${pUrl(p)}" tabindex="-1">
    <h3 class="card-name">${esc(p.name)}</h3>
    <p class="card-sub">${esc(p.color)} · <span class="price" dir="ltr">${money(p.price)}</span></p>
  </a>
</article>`;
}

/* ---------- pages ---------- */
const orgLd = {
  "@context": "https://schema.org", "@type": "Organization", name: SITE.brand, url: abs("/"),
  logo: abs("/apple-touch-icon.png"),
  sameAs: [SITE.instagram && `https://instagram.com/${SITE.instagram}`, SITE.tiktok && `https://www.tiktok.com/@${SITE.tiktok}`].filter(Boolean)
};
const siteLd = { "@context": "https://schema.org", "@type": "WebSite", name: SITE.brand, url: abs("/"), inLanguage: "he-IL" };

function home() {
  const looks = SITE.hero.map(byId).filter(Boolean);
  const body = `
<section class="hero" aria-labelledby="hero-word">
  <h1 class="hero-word pad" id="hero-word"><span class="sr">${esc(SITE.brand)}</span><span class="word" dir="ltr" aria-hidden="true">${[...SITE.brand].map((ch, i) => `<span style="--i:${i}">${ch === " " ? "&nbsp;" : esc(ch)}</span>`).join("")}</span></h1>
  <div class="hero-looks">
    ${looks.map((p, i) => `<a class="hero-look walk is-auto" href="${pUrl(p)}" data-video="/${p.video}" aria-label="${esc(p.name)}">
      <img src="/${p.poster}" alt="${esc(p.name)} ב${esc(p.color)}" width="540" height="720" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}>
      <video muted playsinline loop preload="none" aria-hidden="true" tabindex="-1"></video>
    </a>`).join("")}
  </div>
  <div class="hero-copy pad">
    <p class="hero-tag">${esc(SITE.tagline)}</p>
    <a class="btn-line" href="#shop">לקולקציה</a>
  </div>
</section>

<section id="shop" class="shop pad" aria-labelledby="shop-title">
  <div class="sec-head">
    <h2 id="shop-title">הקולקציה הראשונה</h2>
    <p>${PRODUCTS.length} פריטים · ${esc(SITE.preorder)}</p>
  </div>
  <div class="grid">${PRODUCTS.map((p, i) => card(p, i < 2)).join("")}</div>
</section>

<section class="manifesto" aria-labelledby="mf-title">
  <div class="pad mf-in">
    <h2 id="mf-title">לא תופרים מלאי.<br>תופרים לכם.</h2>
    <p>כל פריט נכנס לייצור במפעל בישראל רק אחרי שמזמינים אותו. בלי מחסנים מלאים ובלי בגדים שאף אחד לא ילבש. כמויות קטנות, גזרות נקיות, ופריט אחד חזק שעושה את ההבדל.</p>
    <a class="btn-line light" href="/story">הסיפור שלנו</a>
  </div>
</section>`;
  return layout({ path: "/", title: "", desc: SITE.description, jsonld: [orgLd, siteLd], body, page: "home" });
}

function product(p) {
  const others = PRODUCTS.filter(x => x.id !== p.id);
  const gallery = [p.poster, ...(p.images || [])];
  const guide = SITE.sizeGuide.length ? `
      <details class="acc-item">
        <summary>מדריך מידות</summary>
        <div class="acc-body"><table class="guide">
          <thead><tr><th scope="col">מידה</th><th scope="col">היקף חזה (ס״מ)</th><th scope="col">אורך (ס״מ)</th></tr></thead>
          <tbody>${SITE.sizeGuide.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}</tbody>
        </table></div>
      </details>` : "";
  const ask = SITE.whatsapp ? `<a class="ask" href="${esc(wa(`היי, יש לי שאלה על ${p.name} (${p.color})`))}" target="_blank" rel="noopener">שאלה על המוצר? כתבו לנו בוואטסאפ</a>` : "";
  const ld = [{
    "@context": "https://schema.org", "@type": "Product", name: `${p.name} ${p.color}`, description: p.seoDesc,
    image: gallery.map(g => abs("/" + g)), sku: p.id, color: p.color,
    brand: { "@type": "Brand", name: SITE.brand },
    offers: { "@type": "Offer", url: abs(pUrl(p)), priceCurrency: "ILS", price: String(p.price),
      availability: "https://schema.org/PreOrder", itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE.brand } }
  }, {
    "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "בית", item: abs("/") },
      { "@type": "ListItem", position: 2, name: "הקולקציה", item: abs("/#shop") },
      { "@type": "ListItem", position: 3, name: p.name, item: abs(pUrl(p)) }
    ]
  }];
  const body = `
<nav class="crumbs pad" aria-label="פירורי לחם"><a href="/">בית</a><span aria-hidden="true">/</span><a href="/#shop">הקולקציה</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.name)}</span></nav>
<div class="pdp pad" data-product="${p.id}">
  <div class="pdp-media">
    <div class="pdp-frame walk is-auto" data-video="/${p.video}">
      <img src="/${p.poster}" alt="${esc(p.name)} ב${esc(p.color)}, הדמיה בתנועה" width="540" height="720" fetchpriority="high" id="pdp-img">
      <video muted playsinline loop preload="none" aria-hidden="true" tabindex="-1"></video>
    </div>
    ${gallery.length > 1 ? `<div class="thumbs" role="group" aria-label="תמונות">${gallery.map((g, i) => `<button type="button" data-src="/${g}" aria-label="תמונה ${i + 1}"${i ? "" : ' aria-current="true"'}><img src="/${g}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
  </div>
  <div class="pdp-info">
    <p class="eyebrow">${esc(SITE.preorder)}</p>
    <h1>${esc(p.name)}</h1>
    <p class="pdp-price"><span class="price" dir="ltr">${money(p.price)}</span></p>
    <p class="pdp-color">צבע: ${esc(p.color)}</p>
    <form class="buy" id="buy" novalidate>
      <fieldset>
        <legend class="label">מידה</legend>
        <div class="sizes">${SITE.sizes.map(s => `<label><input type="radio" name="size" value="${s}"><span>${s}</span></label>`).join("")}</div>
      </fieldset>
      <p class="err" id="size-err" role="alert" hidden>בחרו מידה</p>
      <button class="btn wide" type="submit">הוספה לסל</button>
    </form>
    ${ask}
    <div class="acc">
      <details class="acc-item" open><summary>תיאור</summary><div class="acc-body"><p>${esc(p.desc)}</p></div></details>
      <details class="acc-item"><summary>פרטים</summary><div class="acc-body"><ul>${p.details.map(d => `<li>${esc(d)}</li>`).join("")}</ul></div></details>
      ${guide}
      <details class="acc-item"><summary>משלוח והחזרות</summary><div class="acc-body"><p>הפריט נתפר לפי הזמנה. זמן האספקה יימסר באישור ההזמנה, לפני תשלום. אפשר לבטל עסקה לפי חוק הגנת הצרכן. <a href="/shipping">כל הפרטים</a></p></div></details>
    </div>
    <div class="pdp-foot"><p class="note">${esc(SITE.renderNote)}</p><button class="link" type="button" data-share>העתקת קישור</button></div>
  </div>
</div>
<section class="related pad" aria-labelledby="rel-title">
  <div class="sec-head"><h2 id="rel-title">עוד מהקולקציה</h2></div>
  <div class="grid three">${others.map(o => card(o)).join("")}</div>
</section>
<div class="buybar" id="buybar">
  <div><b>${esc(p.name)}</b><span class="price" dir="ltr">${money(p.price)}</span></div>
  <button class="btn" type="button" id="buybar-btn">הוספה לסל</button>
</div>`;
  return layout({ path: pUrl(p), title: p.seoTitle, desc: p.seoDesc, image: "/" + p.poster, jsonld: ld, body, page: "product" });
}

function doc(path, title, desc, inner, jsonld = []) {
  return layout({ path, title, desc, jsonld, page: "doc", body: `<article class="doc pad">${inner}</article>` });
}

function story() {
  return layout({ path: "/story", title: "הסיפור", desc: "הסיפור של LA ELEGANT: אלגנטיות כדרך להיכנס לחדר, בגדים שנתפרים לפי הזמנה בישראל בכמויות קטנות.", page: "story", body: `
<section class="story-hero pad">
  <p class="eyebrow">הסיפור</p>
  <h1>${esc(SITE.tagline)}</h1>
</section>
<section class="story pad">
  <div class="story-img walk is-auto" data-video="/${byId("pants").video}"><img src="/${byId("pants").poster}" alt="${esc(byId("pants").name)} בתנועה" width="540" height="720" loading="lazy"><video muted playsinline loop preload="none" aria-hidden="true" tabindex="-1"></video></div>
  <div class="story-text">
    <h2>איך נכנסים</h2>
    <p>אלגנטיות היא לא תג מחיר. היא ההליכה, הכתפיים, הקו. הרגע שבו מישהו רואה אתכם לפני שאמרתם מילה. לכן כל פריט אצלנו מוצג בתנועה: בגד טוב נראה הכי טוב כשהולכים בו.</p>
    <h2>לא תופרים מלאי</h2>
    <p>רוב המותגים מייצרים אלפי יחידות ומקווים שימכרו. אנחנו עובדים הפוך: כל פריט נכנס לייצור רק אחרי שמזמינים אותו. בלי מחסנים מלאים, בלי עודפים, ובלי בגדים שנזרקים.</p>
    <h2>נתפר בישראל</h2>
    <p>הקולקציה נתפרת במפעל בישראל, בכמויות קטנות. אנחנו עובדים ישירות מול המפעל, בוחרים את הבדים בעצמנו ובודקים כל גזרה לפני שהיא יוצאת אליכם.</p>
    <h2>גזרות שנשארות</h2>
    <p>בלי טרנדים של עונה אחת. גזרות נקיות, צבעים שקטים, ופריט אחד חזק שעושה את ההבדל.</p>
    <a class="btn" href="/#shop">לקולקציה</a>
  </div>
</section>` });
}

function faq() {
  const ld = [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }];
  return doc("/faq", "שאלות נפוצות", "תשובות על הזמנה מוקדמת, תשלום, זמני אספקה, מידות, החזרות וייצור בישראל.", `
<p class="eyebrow">עזרה</p>
<h1>שאלות נפוצות</h1>
<div class="acc">${FAQ.map(([q, a], i) => `<details class="acc-item"${i ? "" : " open"}><summary>${esc(q)}</summary><div class="acc-body"><p>${esc(a)}</p></div></details>`).join("")}</div>
<p>לא מצאתם תשובה? ${SITE.whatsapp ? `<a href="${esc(wa("היי, יש לי שאלה"))}" target="_blank" rel="noopener">כתבו לנו בוואטסאפ</a>` : "כתבו לנו"} ונחזור אליכם.</p>`, ld);
}

function shipping() {
  return doc("/shipping", "משלוחים והחזרות", "מדיניות משלוחים, ביטול עסקה והחזרות: הזמנה מוקדמת, זמני אספקה וביטול לפי חוק הגנת הצרכן.", `
<h1>משלוחים, ביטולים והחזרות</h1>
<p class="updated">עודכן לאחרונה: ${TODAY}</p>
<h2>הזמנה מוקדמת</h2>
<p>הפריטים באתר מיוצרים לפי הזמנה במפעל בישראל. אחרי שליחת ההזמנה נחזור אליכם עם אישור, זמן אספקה משוער ופרטי תשלום. התשלום מתבצע רק אחרי האישור.</p>
<h2>משלוחים</h2>
<ul>
${SITE.shipping.map(s => `<li>${esc(s.label)}: ${s.price == null ? "העלות תימסר באישור ההזמנה" : s.price ? money(s.price) : "ללא עלות"}.</li>`).join("\n")}
<li>זמן האספקה נמסר באישור ההזמנה ותלוי בזמן הייצור של כל פריט.</li>
<li>אם יתעכב ייצור או משלוח, נעדכן אתכם בהקדם בוואטסאפ או באימייל.</li>
</ul>
<h2>ביטול עסקה</h2>
<p>אפשר לבטל עסקה בהתאם לחוק הגנת הצרכן, התשמ״א-1981 ותקנותיו:</p>
<ul>
<li>ההודעה על ביטול נשלחת בכתב (וואטסאפ או אימייל) תוך 14 יום מיום קבלת המוצר או מיום קבלת המסמך עם פרטי העסקה, המאוחר מביניהם.</li>
<li>דמי ביטול: 5% ממחיר העסקה או 100 ₪, הנמוך מביניהם.</li>
<li>הכסף יוחזר באותו אמצעי תשלום שבו שילמתם.</li>
</ul>
<h2>החזרת פריט</h2>
<ul>
<li>יש להחזיר את הפריט במצבו המקורי, כשאינו פגום ולא נעשה בו שימוש, עם התוויות.</li>
<li>פרטי ההחזרה (כתובת או איסוף) יימסרו כשתפנו אלינו.</li>
</ul>
<h2>החלפת מידה</h2>
<p>לא בטוחים במידה? כתבו לנו לפני ההזמנה. אם המידה לא מתאימה אחרי הקבלה, פנו אלינו תוך 14 יום ונבדוק אפשרות להחלפה.</p>
<h2>יצירת קשר</h2>
<p>${contactLine}</p>`);
}

function terms() {
  return doc("/terms", "תקנון", "תקנון האתר ותנאי הרכישה של LA ELEGANT.", `
<h1>תקנון האתר</h1>
<p class="updated">עודכן לאחרונה: ${TODAY}</p>
<h2>1. כללי</h2>
<p>האתר ${esc(SITE.url.replace(/^https?:\/\//, ""))} ("האתר") מופעל על ידי ${bizName}, ${bizId} ("העסק"), תחת המותג ${esc(SITE.brand)}. השימוש באתר וביצוע הזמנה בו מהווים הסכמה לתקנון זה. התקנון כתוב בלשון רבים ופונה לכל המגדרים.</p>
<h2>2. הזמנה מוקדמת וייצור</h2>
<p>הפריטים מיוצרים לפי הזמנה. שליחת הזמנה באתר היא בקשה לרכישה, והעסקה נכנסת לתוקף רק לאחר אישור העסק ותשלום. העסק רשאי שלא לאשר הזמנה, למשל אם פריט לא נכנס לייצור. במקרה כזה לא ייגבה תשלום, ואם שולם, יוחזר במלואו.</p>
<h2>3. מחירים ותשלום</h2>
<p>המחירים באתר בשקלים חדשים. עלות המשלוח, אם יש, תוצג או תימסר לפני התשלום. פרטי התשלום נשלחים לאחר אישור ההזמנה.</p>
<h2>4. אספקה</h2>
<p>זמן האספקה המשוער נמסר באישור ההזמנה. פרטים נוספים ב<a href="/shipping">מדיניות המשלוחים וההחזרות</a>.</p>
<h2>5. ביטול עסקה והחזרות</h2>
<p>ביטול עסקה והחזרת פריטים נעשים בהתאם לחוק הגנת הצרכן ולמפורט ב<a href="/shipping">מדיניות המשלוחים וההחזרות</a>.</p>
<h2>6. תמונות ותיאורים</h2>
<p>חלק מהתמונות באתר הן הדמיה של העיצוב. העסק עושה מאמץ להציג את הפריטים במדויק, אך ייתכנו הבדלים קלים בגוון ובמרקם בין התמונה לפריט בפועל.</p>
<h2>7. קניין רוחני</h2>
<p>כל התכנים באתר, לרבות עיצובים, תמונות, סרטונים, טקסטים והסימן ${esc(SITE.brand)}, שייכים לעסק. אין להעתיק או להשתמש בהם ללא אישור בכתב.</p>
<h2>8. פרטיות</h2>
<p>השימוש במידע אישי מתואר ב<a href="/privacy">מדיניות הפרטיות</a>.</p>
<h2>9. שינויים בתקנון</h2>
<p>העסק רשאי לעדכן את התקנון מעת לעת. ההזמנה כפופה לנוסח שהיה בתוקף בעת שליחתה.</p>
<h2>10. דין וסמכות שיפוט</h2>
<p>על התקנון חלים דיני מדינת ישראל, וסמכות השיפוט נתונה לבתי המשפט המוסמכים בישראל.</p>
<h2>11. פרטי העסק</h2>
<p>${bizName} · ${bizId} · ${bizAddr}<br>${contactLine}</p>`);
}

function privacy() {
  return doc("/privacy", "מדיניות פרטיות", "איזה מידע אנחנו אוספים באתר, למה, ואיך פונים אלינו בנושא פרטיות.", `
<h1>מדיניות פרטיות</h1>
<p class="updated">עודכן לאחרונה: ${TODAY}</p>
<h2>איזה מידע נאסף</h2>
<ul>
<li>פרטים שאתם מזינים בהזמנה: שם, טלפון, אימייל (לא חובה), כתובת למשלוח והערות.</li>
<li>פרטי ההזמנה: הפריטים, המידות והסכום.</li>
<li>נתוני שימוש סטטיסטיים ואנונימיים (כמו מספר צפיות בעמודים), שאינם מזהים אתכם אישית.</li>
</ul>
<h2>למה המידע משמש</h2>
<ul>
<li>טיפול בהזמנה: אישור, ייצור, תשלום ומשלוח.</li>
<li>יצירת קשר בנוגע להזמנה.</li>
<li>שיפור האתר על סמך נתונים סטטיסטיים.</li>
</ul>
<p>לא נשלח לכם דיוור שיווקי בלי הסכמה מפורשת.</p>
<h2>עם מי המידע משותף</h2>
<p>רק עם מי שנדרש לביצוע ההזמנה: חברת השילוח, ספק התשלום, ושירות ההודעות (וואטסאפ) שבו נשלחת ההזמנה. לא נמכור את המידע לאף אחד.</p>
<h2>אבטחה ושמירה</h2>
<p>המידע נשמר רק כל עוד הוא נדרש לטיפול בהזמנה ולחובות על פי דין. פרטי כרטיס אשראי לא נשמרים באתר.</p>
<h2>הזכויות שלכם</h2>
<p>לפי חוק הגנת הפרטיות, התשמ״א-1981, אפשר לבקש לעיין במידע עליכם, לתקן אותו או למחוק אותו, בפנייה אלינו.</p>
<h2>יצירת קשר</h2>
<p>${bizName} · ${contactLine}</p>`);
}

function accessibility() {
  return doc("/accessibility", "הצהרת נגישות", "הצהרת הנגישות של אתר LA ELEGANT: מה הונגש, מגבלות ידועות ופרטי רכז הנגישות.", `
<h1>הצהרת נגישות</h1>
<p class="updated">עודכן לאחרונה: ${TODAY}</p>
<p>אנחנו רוצים שכל אחד יוכל לגלוש באתר ולהזמין בו בנוחות. האתר נבנה בהתאם להנחיות התקן הישראלי 5568 לנגישות תכנים באינטרנט, המבוסס על הנחיות WCAG 2.0 ברמה AA.</p>
<h2>מה עשינו באתר</h2>
<ul>
<li>מבנה עמודים עם כותרות ברורות ושפת עמוד מוגדרת (עברית, מימין לשמאל).</li>
<li>אפשר לנווט בכל האתר באמצעות המקלדת, עם סימון בולט של האלמנט שבפוקוס וקישור "דילוג לתוכן".</li>
<li>לכל תמונה של מוצר יש טקסט חלופי.</li>
<li>ניגודיות צבעים גבוהה: טקסט כהה על רקע בהיר.</li>
<li>הסרטונים באתר שקטים, ללא צליל, ומשמשים להמחשת הבגד בתנועה. מי שהגדיר במכשיר "הפחתת תנועה" יראה תמונה במקום סרטון.</li>
<li>שדות הטופס מסומנים בתוויות, והודעות שגיאה מוצגות בטקסט ליד השדה.</li>
<li>האתר מותאם לגלישה בטלפון ולהגדלת טקסט בדפדפן.</li>
</ul>
<h2>מגבלות ידועות</h2>
<p>אנחנו ממשיכים לבדוק את האתר. אם נתקלתם בחלק שלא נגיש לכם, נשמח לעזור ולהשלים את ההזמנה גם בטלפון או בוואטסאפ.</p>
<h2>רכז/ת נגישות</h2>
<p>${val(B.accessibilityContact)} · ${contactLine}</p>`);
}

function notFound() {
  return layout({ path: "/404", title: "העמוד לא נמצא", desc: "העמוד לא נמצא.", page: "doc", body: `
<article class="doc pad nf"><p class="eyebrow">404</p><h1>העמוד הזה לא קיים.</h1><p>אבל הקולקציה כן.</p><a class="btn" href="/#shop">לקולקציה</a></article>` });
}

/* ---------- write ---------- */
function write(rel, content) {
  const f = join(OUT, rel);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, content);
}

if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(join(SRC, "media"), join(OUT, "media"), { recursive: true });
cpSync(join(SRC, "assets"), join(OUT, "assets"), { recursive: true });
cpSync(join(SRC, "static"), OUT, { recursive: true });

write("assets/config.js", "window.SHOP = " + JSON.stringify({
  brand: SITE.brand, whatsapp: SITE.whatsapp, checkout: SITE.checkout, shipping: SITE.shipping, sizes: SITE.sizes,
  products: PRODUCTS.map(({ id, slug, name, color, price, poster }) => ({ id, slug, name, color, price, poster }))
}) + ";\n");

write("index.html", home());
PRODUCTS.forEach(p => write(`products/${p.slug}.html`, product(p)));
write("story.html", story());
write("faq.html", faq());
write("shipping.html", shipping());
write("terms.html", terms());
write("privacy.html", privacy());
write("accessibility.html", accessibility());
write("404.html", notFound());

const urls = ["/", ...PRODUCTS.map(pUrl), "/story", "/faq", "/shipping", "/terms", "/privacy", "/accessibility"];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${abs(u)}</loc><lastmod>${TODAY}</lastmod><priority>${u === "/" ? "1.0" : u.startsWith("/products/") ? "0.9" : "0.5"}</priority></url>`).join("\n")}
</urlset>
`);
write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${abs("/sitemap.xml")}\n`);

console.log("built", urls.length, "pages →", OUT);
