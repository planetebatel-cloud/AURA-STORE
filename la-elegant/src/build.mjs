// Static site builder: src/ → public/. Node built-ins only (runs on Vercel as the build command).
import { SITE, PRODUCTS, FAQ } from "./data.mjs";
import { mkdirSync, writeFileSync, cpSync, rmSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = dirname(fileURLToPath(import.meta.url));
// SITE_BASE lets the same site run under a sub-path (e.g. /la-elegant); SITE_OUT / SITE_URL override output folder and public address.
const BASE = (process.env.SITE_BASE || "").replace(/\/$/, "");
const OUT = process.env.SITE_OUT ? resolve(process.cwd(), process.env.SITE_OUT) : join(SRC, "..", "public");
if (process.env.SITE_URL) SITE.url = process.env.SITE_URL;
const TODAY = new Date().toISOString().slice(0, 10);

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const abs = p => SITE.url.replace(/\/$/, "") + p;
const money = n => "₪" + Number(n).toLocaleString("en-US");
const pPath = p => "/products/" + p.slug;
const pUrl = p => BASE + pPath(p);
const byId = id => PRODUCTS.find(p => p.id === id);
const phoneText = n => n ? "0" + String(n).replace(/^972/, "").replace(/(\d{2})(\d{3})(\d{4})$/, "$1-$2-$3") : "";
const wa = text => SITE.whatsapp ? "https://wa.me/" + SITE.whatsapp + (text ? "?text=" + encodeURIComponent(text) : "") : "";
const B = SITE.business;
const hasContact = !!(SITE.whatsapp || SITE.email || SITE.instagram);
const contactLine = [
  SITE.whatsapp ? `WhatsApp <a href="${esc(wa(""))}" target="_blank" rel="noopener">${esc(phoneText(SITE.whatsapp))}</a>` : "",
  SITE.email ? `email <a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>` : "",
  SITE.instagram ? `Instagram <a href="https://instagram.com/${esc(SITE.instagram)}" target="_blank" rel="noopener">@${esc(SITE.instagram)}</a>` : ""
].filter(Boolean).join(" · ");
const contactSentence = contactLine ? `You can reach us by ${contactLine}.` : "You can reach us through the contact options on this site or by replying to your order confirmation.";
const operator = B.name ? `${esc(B.name)}${B.id ? `, business no. ${esc(B.id)}` : ""}` : "";
const bizBlock = [B.name && esc(B.name), B.id && "Business no. " + esc(B.id), B.address && esc(B.address)].filter(Boolean).join(" · ");

/* ---------- brand lockup (emblem + serif wordmark) ---------- */
const lockup = (cls = "") => `<span class="lockup ${cls}"><img class="lk-emblem" src="${BASE}/brand/${cls.includes("lg") ? "emblem" : "emblem-sm"}.webp" alt="" width="${cls.includes("lg") ? 720 : 260}" height="${cls.includes("lg") ? 539 : 195}"><span class="lk-word">${esc(SITE.brand)}</span><span class="lk-est"><i></i>${esc(SITE.est)}<i></i></span></span>`;

function header(page) {
  return `
<a class="skip" href="#main">Skip to content</a>
<header class="head${page === "home" ? " is-home" : ""}">
  <div class="head-in pad">
    <div class="head-start">
      <button class="menu-btn" id="menu-btn" type="button" aria-expanded="false" aria-controls="menu">Menu</button>
      <nav class="nav" id="menu" aria-label="Main">
        <a href="${pUrl(PRODUCTS[0])}">The Set</a>
        <a href="${BASE}/story">Story</a>
        <a href="${BASE}/faq">FAQ</a>
      </nav>
    </div>
    <a class="head-mark" href="${BASE}/" aria-label="${esc(SITE.brand)}, home">${lockup("sm")}</a>
    <button class="bag-btn" id="bag-open" type="button" aria-haspopup="dialog">Bag <span class="count" id="bag-count">0</span></button>
  </div>
</header>`;
}

function footer() {
  const social = [
    SITE.instagram ? `<li><a href="https://instagram.com/${esc(SITE.instagram)}" target="_blank" rel="noopener">Instagram</a></li>` : "",
    SITE.tiktok ? `<li><a href="https://www.tiktok.com/@${esc(SITE.tiktok)}" target="_blank" rel="noopener">TikTok</a></li>` : "",
    SITE.whatsapp ? `<li><a href="${esc(wa(""))}" target="_blank" rel="noopener">WhatsApp ${esc(phoneText(SITE.whatsapp))}</a></li>` : "",
    SITE.email ? `<li><a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a></li>` : ""
  ].join("");
  const legal = [B.name, B.id ? "Business no. " + B.id : ""].filter(Boolean).map(esc).join(" · ");
  return `
<footer class="foot">
  <div class="foot-mark-row pad"><a href="${BASE}/" aria-label="${esc(SITE.brand)}, home">${lockup("lg")}</a></div>
  <div class="foot-cols pad${social ? "" : " no-social"}">
    <p class="foot-tag">${esc(SITE.tagline)}</p>
    <nav aria-label="Shop"><h2>Collection 01</h2><ul>
      ${PRODUCTS.map(p => `<li><a href="${pUrl(p)}">${esc(p.name)}</a></li>`).join("")}
      <li><a href="${BASE}/faq">How ordering works</a></li>
    </ul></nav>
    <nav aria-label="Information"><h2>Information</h2><ul>
      <li><a href="${BASE}/story">Story</a></li>
      <li><a href="${BASE}/shipping">Shipping &amp; returns</a></li>
      <li><a href="${BASE}/terms">Terms</a></li>
      <li><a href="${BASE}/privacy">Privacy</a></li>
      <li><a href="${BASE}/accessibility">Accessibility</a></li>
    </ul></nav>
    ${social ? `<div><h2>Contact</h2><ul>${social}</ul></div>` : ""}
  </div>
  <div class="foot-base pad"><span>© ${new Date().getFullYear()} ${esc(SITE.brand)}${legal ? " · " + legal : ""}</span><span>Sewn to order in Israel</span></div>
</footer>`;
}

const bagDrawer = `
<div class="scrim" id="scrim" hidden></div>
<aside class="drawer" id="bag" role="dialog" aria-modal="true" aria-labelledby="bag-title" hidden>
  <div class="d-head pad">
    <h2 id="bag-title">Bag</h2>
    <button class="x" type="button" data-close aria-label="Close">×</button>
  </div>
  <div class="d-body pad" id="v-cart"></div>
  <div class="d-foot pad" id="f-cart">
    <div class="sum"><div class="total"><span>Subtotal</span><span class="price" id="c-sub"></span></div><div class="mutedv"><span>Delivery</span><span>Complimentary</span></div></div>
    <button class="btn wide" type="button" id="to-details">Checkout</button>
    <p class="note">${esc(SITE.preorder)} · ${esc(SITE.leadTime)}</p>
  </div>
  <form class="d-body pad form" id="v-details" novalidate hidden>
    <button class="link" type="button" id="back-cart">← Back to bag</button>
    <p class="step">1 · Contact</p>
    <div class="field"><label for="o-name">Full name</label><input id="o-name" name="name" autocomplete="name" required><p class="err" hidden></p></div>
    <div class="two">
      <div class="field"><label for="o-phone">Phone</label><input id="o-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required><p class="err" hidden></p></div>
      <div class="field"><label for="o-email">Email <small>optional</small></label><input id="o-email" name="email" type="email" autocomplete="email"><p class="err" hidden></p></div>
    </div>
    <p class="step">2 · Delivery</p>
    <fieldset><legend class="sr">Delivery method</legend><div class="ship" id="o-ship"></div></fieldset>
    <div id="o-address" class="form">
      <div class="two">
        <div class="field"><label for="o-city">City</label><input id="o-city" name="city" autocomplete="address-level2" required><p class="err" hidden></p></div>
        <div class="field"><label for="o-street">Street and number</label><input id="o-street" name="street" autocomplete="address-line1" required><p class="err" hidden></p></div>
      </div>
      <div class="field"><label for="o-apt">Apartment, floor, entry code <small>optional</small></label><input id="o-apt" name="apt" autocomplete="address-line2"></div>
    </div>
    <div class="field"><label for="o-notes">Notes <small>optional</small></label><textarea id="o-notes" name="notes" rows="2"></textarea></div>
    <p class="step">3 · Payment</p>
    <div class="pay">
      <p><b>Secure payment link</b></p>
      <p>${esc(SITE.checkout.paymentNote)}</p>
    </div>
    <label class="check"><input type="checkbox" id="o-terms"><span>I have read and agree to the <a href="${BASE}/terms" target="_blank">terms</a>, the <a href="${BASE}/shipping" target="_blank">shipping &amp; returns policy</a> and the <a href="${BASE}/privacy" target="_blank">privacy policy</a>.</span></label>
    <p class="err" id="o-terms-err" hidden>Please accept the terms to continue</p>
  </form>
  <div class="d-foot pad" id="f-details" hidden>
    <div class="sum" id="o-sum"></div>
    <button class="btn wide" type="submit" form="v-details" id="o-submit">Place order</button>
    <p class="err" id="o-err" role="alert" hidden></p>
  </div>
  <div class="d-body pad" id="v-done" hidden>
    <div class="done">
      <img class="done-mark" src="${BASE}/brand/emblem-sm.webp" alt="" width="130" height="97">
      <p class="eyebrow" id="d-num"></p>
      <h3 id="d-title">Thank you</h3>
      <p id="d-text"></p>
      <a class="btn" id="d-wa" href="#" target="_blank" rel="noopener" hidden>Send on WhatsApp</a>
      <button class="btn" type="button" id="d-copy" hidden>Copy order</button>
      <pre id="d-msg"></pre>
      <button class="btn ghost" type="button" data-close>Continue browsing</button>
    </div>
  </div>
</aside>
<div class="toast" id="toast" role="status" aria-live="polite" hidden></div>`;

function layout({ path, title, desc, image, jsonld = [], body, page = "" }) {
  const canonical = abs(path);
  const ogImage = abs(image || "/og.jpg");
  const fullTitle = title ? `${title} | ${SITE.brand}` : `${SITE.brand} · Collection 01`;
  return `<!doctype html>
<html lang="en" dir="ltr">
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
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_IL">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0A0A0A">
<link rel="icon" href="${BASE}/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="${BASE}/apple-touch-icon.png">
<link rel="preload" href="${BASE}/brand/cinzel-500.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..500;1,6..72,300..400&family=Jost:wght@300..500&display=swap">
<link rel="stylesheet" href="${BASE}/assets/site.css">
${jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`).join("\n")}
<script src="${BASE}/assets/config.js"></script>
<script defer src="${BASE}/assets/store.js"></script>
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

/* ---------- size pickers ---------- */
const sizePickers = p => p.sizeGroups.map(g => `
      <fieldset class="sizeset" data-group="${g.key}">
        <legend class="label">${esc(g.label)}</legend>
        <div class="sizes" style="--n:${g.sizes.length}">${g.sizes.map(s => `<label><input type="radio" name="size-${g.key}" value="${esc(s)}"><span>${esc(s)}</span></label>`).join("")}</div>
        <p class="err" data-err="${g.key}" role="alert" hidden>Choose your ${esc(g.label.toLowerCase())}</p>
      </fieldset>`).join("");

const sizeGuide = p => {
  const g = p.sizeGuide || {};
  const tables = Object.values(g).map(t => `
    <p class="guide-title">${esc(t.title)}</p>
    <table class="guide">
      <thead><tr>${t.cols.map(c => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>
      <tbody>${t.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>`).join("");
  return tables ? `
      <details class="acc-item">
        <summary>Size guide</summary>
        <div class="acc-body">${tables}
          <p class="note">Body measurements. Between two sizes, take the smaller for a cleaner line or the larger for an easier fit.</p>
        </div>
      </details>` : "";
};

/* ---------- pages ---------- */
const orgLd = {
  "@context": "https://schema.org", "@type": "Organization", name: SITE.brand, url: abs("/"),
  logo: abs("/apple-touch-icon.png"),
  sameAs: [SITE.instagram && `https://instagram.com/${SITE.instagram}`, SITE.tiktok && `https://www.tiktok.com/@${SITE.tiktok}`].filter(Boolean)
};
const siteLd = { "@context": "https://schema.org", "@type": "WebSite", name: SITE.brand, url: abs("/"), inLanguage: "en" };

function home() {
  const p = byId(SITE.hero) || PRODUCTS[0];
  const film = SITE.heroFilm;
  const words = SITE.tagline.split(" ");
  const body = `
<section class="stage" aria-labelledby="hero-line">
  <a class="stage-spot spot walk is-auto" href="${pUrl(p)}" data-video="${BASE}/${film.video}" aria-label="${esc(p.name)}, ${money(p.price)}">
    <img src="${BASE}/${film.poster}" alt="${esc(film.alt)}" width="600" height="800" fetchpriority="high">
    <video muted playsinline loop preload="none" aria-hidden="true" tabindex="-1"></video>
  </a>
  <h1 class="stage-line" id="hero-line">${words.map((w, i) => `<span style="--i:${i}">${w === "walk" ? "<em>walk</em>" : esc(w)}</span>`).join(" ")}</h1>
  <div class="credits">
    <span class="lead">Collection 01</span>
    <span>${esc(p.name)}</span>
    <span class="price">${money(p.price)}</span>
    <a class="btn-line" href="${pUrl(p)}">Shop the set</a>
  </div>
</section>

<section id="shop" class="feature pad" aria-labelledby="set-title">
  <div class="feature-media">
    ${p.pieces.map(x => `<figure><a class="frame spot" href="${pUrl(p)}" tabindex="-1"><img src="${BASE}/${x.image}" alt="${esc(x.name)} in ${esc(x.color.toLowerCase())}" width="600" height="800" loading="lazy" decoding="async"></a><figcaption>${esc(x.name)} · ${esc(x.color)}</figcaption></figure>`).join("")}
  </div>
  <div class="feature-info">
    <p class="eyebrow">Collection 01 · The first drop</p>
    <h2 id="set-title">${esc(p.name)}</h2>
    <p class="feature-price"><span class="price">${money(p.price)}</span> <span class="mutedv">· the set</span></p>
    <p class="feature-lede">${esc(p.lede)}</p>
    <ol class="pieces">
      ${p.pieces.map((x, i) => `<li><span class="num">0${i + 1}</span><div><h3>${esc(x.name)} <span>${esc(x.color)}</span></h3><p>${esc(x.desc)}</p></div></li>`).join("")}
    </ol>
    <div class="feature-cta">
      <a class="btn" href="${pUrl(p)}">Choose your sizes</a>
      <p class="note">${esc(SITE.leadTime)} · Complimentary delivery in Israel</p>
    </div>
  </div>
</section>

<section class="promise pad" aria-label="How it's made">
  <div><p class="eyebrow">01</p><h3>Sewn to order</h3><p>Your set goes into production only after you order it. No warehouse, no surplus.</p></div>
  <div><p class="eyebrow">02</p><h3>Made in Israel</h3><p>Cut and sewn in small runs at a factory we work with directly.</p></div>
  <div><p class="eyebrow">03</p><h3>Two sizes, one set</h3><p>Choose the knit and the trouser waist separately, for a fit that is yours.</p></div>
</section>

<section class="manifesto pad" aria-labelledby="mf-title">
  <img class="mf-mark" src="${BASE}/brand/emblem.webp" alt="" width="720" height="539" loading="lazy">
  <h2 id="mf-title">We don’t make stock.<br><em>We make yours.</em></h2>
  <p>Every set goes into production at a factory in Israel only after it’s ordered. Small runs, clean cuts, quiet colours, and one set that changes the room.</p>
  <a class="btn-line" href="${BASE}/story">Our story</a>
</section>`;
  return layout({ path: "/", title: "", desc: SITE.description, jsonld: [orgLd, siteLd], body, page: "home" });
}

function product(p) {
  const ask = SITE.whatsapp ? `<a class="ask" href="${esc(wa(`Hi, I have a question about ${p.name}`))}" target="_blank" rel="noopener">Questions about sizing? Message us on WhatsApp</a>` : "";
  const ld = [{
    "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.seoDesc,
    image: [p.poster, ...(p.images || [])].map(g => abs("/" + g)), sku: p.id, color: p.color,
    brand: { "@type": "Brand", name: SITE.brand },
    offers: { "@type": "Offer", url: abs(pPath(p)), priceCurrency: "ILS", price: String(p.price),
      availability: "https://schema.org/PreOrder", itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE.brand } }
  }, {
    "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
      { "@type": "ListItem", position: 2, name: "Collection 01", item: abs("/#shop") },
      { "@type": "ListItem", position: 3, name: p.name, item: abs(pPath(p)) }
    ]
  }];
  const body = `
<nav class="crumbs pad" aria-label="Breadcrumb"><a href="${BASE}/">Home</a><span aria-hidden="true">/</span><a href="${BASE}/#shop">Collection 01</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.name)}</span></nav>
<div class="pdp pad" data-product="${p.id}">
  <div class="pdp-media">
    <div class="pdp-frame spot walk is-auto" data-video="${BASE}/${p.video}">
      <img src="${BASE}/${p.poster}" alt="${esc(p.name)}: bordeaux half-zip knit and ivory pleated trousers, in motion" width="600" height="800" fetchpriority="high" id="pdp-img">
      <video muted playsinline loop preload="none" aria-hidden="true" tabindex="-1"></video>
    </div>
    ${p.images && p.images.length ? `<div class="thumbs" role="group" aria-label="Images">${[p.poster, ...p.images].map((g, i) => `<button type="button" data-src="${BASE}/${g}" aria-label="${["The set in motion", ...p.pieces.map(x => x.name)][i] || "Image " + (i + 1)}"${i ? "" : ' aria-current="true"'}><img src="${BASE}/${g}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
  </div>
  <div class="pdp-info">
    <p class="eyebrow">${esc(SITE.preorder)}</p>
    <h1>${esc(p.name)}</h1>
    <p class="pdp-price"><span class="price">${money(p.price)}</span> <span class="mutedv">· two pieces</span></p>
    <p class="pdp-color">${p.pieces.map(x => `${esc(x.name.replace(/^The /, ""))} — ${esc(x.color)}`).join(" · ")}</p>
    <form class="buy" id="buy" novalidate>
      ${sizePickers(p)}
      <button class="btn wide" type="submit">Add the set to bag · ${money(p.price)}</button>
      <ul class="assure">
        <li>${esc(SITE.leadTime)}</li>
        <li>Complimentary courier delivery in Israel</li>
        <li>Nothing is charged until we confirm your order</li>
      </ul>
    </form>
    ${ask}
    <div class="acc">
      <details class="acc-item" open><summary>The set</summary><div class="acc-body"><p>${esc(p.lede)}</p></div></details>
      ${p.pieces.map(x => `<details class="acc-item"><summary>${esc(x.name)} · ${esc(x.color)}</summary><div class="acc-body"><p>${esc(x.desc)}</p><ul>${x.details.map(d => `<li>${esc(d)}</li>`).join("")}</ul></div></details>`).join("")}
      ${sizeGuide(p)}
      <details class="acc-item"><summary>Details</summary><div class="acc-body"><ul>${p.details.map(d => `<li>${esc(d)}</li>`).join("")}</ul></div></details>
      <details class="acc-item"><summary>Shipping &amp; returns</summary><div class="acc-body"><p>Sewn to order; your delivery date is confirmed with your order, before payment. Courier delivery is complimentary across Israel. Purchases can be cancelled under Israel’s Consumer Protection Law. <a href="${BASE}/shipping">Full details</a></p></div></details>
    </div>
    <div class="pdp-foot"><p class="note">${esc(SITE.renderNote)}</p><button class="link" type="button" data-share>Copy link</button></div>
  </div>
</div>
<div class="buybar" id="buybar">
  <div><b>${esc(p.name)}</b><span class="price">${money(p.price)}</span></div>
  <button class="btn" type="button" id="buybar-btn">Add to bag</button>
</div>`;
  return layout({ path: pPath(p), title: p.seoTitle, desc: p.seoDesc, jsonld: ld, body, page: "product" });
}

function doc(path, title, desc, inner, jsonld = []) {
  return layout({ path, title, desc, jsonld, page: "doc", body: `<article class="doc pad">${inner}</article>` });
}

function story() {
  const p = PRODUCTS[0];
  return layout({ path: "/story", title: "Story", desc: "The story of La Elegant: elegance as the way you walk into a room, and clothes sewn to order in Israel in small runs.", page: "story", body: `
<section class="story-hero pad">
  <img class="story-mark" src="${BASE}/brand/emblem.webp" alt="" width="720" height="539">
  <p class="eyebrow">Story · ${esc(SITE.est)}</p>
  <h1>Elegance is how you <em>walk</em> into a room.</h1>
</section>
<section class="story pad">
  <div class="story-img spot walk is-auto" data-video="${BASE}/${p.video}"><img src="${BASE}/${p.poster}" alt="${esc(p.name)} in motion" width="600" height="800" loading="lazy"><video muted playsinline loop preload="none" aria-hidden="true" tabindex="-1"></video></div>
  <div class="story-text">
    <h2>The walk</h2>
    <p>Elegance isn’t a logo on the chest. It’s the walk, the shoulders, the line — the moment someone sees you before you’ve said a word. That’s why every piece here is shown in motion: good clothes look best when you walk in them.</p>
    <h2>Quiet, on purpose</h2>
    <p>No loud prints, no one-season trends. Deep colours, clean cuts and fabrics that hold their shape. Clothes for people who would rather be remembered than noticed.</p>
    <h2>No stock</h2>
    <p>Most labels make thousands of units and hope they sell. We work the other way round: every set goes into production only after it’s ordered. No overflowing warehouses, no surplus, no clothes thrown away.</p>
    <h2>Made in Israel</h2>
    <p>The collection is sewn at a factory in Israel, in small runs. We work directly with the factory, choose the fabrics ourselves and check every cut before it reaches you.</p>
    <a class="btn" href="${pUrl(p)}">Shop the set</a>
  </div>
</section>` });
}

function faq() {
  const ld = [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }];
  return doc("/faq", "FAQ", "Answers about ordering, payment, delivery times, sizing, returns and production in Israel.", `
<p class="eyebrow">Help</p>
<h1>Frequently asked questions</h1>
<div class="acc">${FAQ.map(([q, a], i) => `<details class="acc-item"${i ? "" : " open"}><summary>${esc(q)}</summary><div class="acc-body"><p>${esc(a)}</p></div></details>`).join("")}</div>
<p>Didn’t find your answer? ${SITE.whatsapp ? `<a href="${esc(wa("Hi, I have a question"))}" target="_blank" rel="noopener">Message us on WhatsApp</a> and we’ll get back to you.` : contactLine ? `Reach us by ${contactLine}.` : "Send us a message and we’ll get back to you."}</p>`, ld);
}

function shipping() {
  return doc("/shipping", "Shipping & returns", "Shipping, cancellation and returns policy: made-to-order sets, delivery times and cancellation under Israel’s Consumer Protection Law.", `
<h1>Shipping, cancellation &amp; returns</h1>
<p class="updated">Last updated: ${TODAY}</p>
<h2>Made to order</h2>
<p>Every set is sewn to order at a factory in Israel. After you place your order, we confirm your sizes and an estimated delivery date and send a secure payment link. Production starts once payment is received.</p>
<h2>Shipping</h2>
<ul>
${SITE.shipping.map(s => `<li>${esc(s.label)}: ${s.price == null ? "cost confirmed with your order" : s.price ? money(s.price) : "complimentary"}.</li>`).join("\n")}
<li>${esc(SITE.leadTime)} from payment. The exact date is confirmed with your order.</li>
<li>If production or delivery is delayed, we’ll let you know as soon as possible.</li>
</ul>
<h2>Cancelling a purchase</h2>
<p>You may cancel a purchase in accordance with Israel’s Consumer Protection Law, 5741-1981, and its regulations:</p>
<ul>
<li>Send a written cancellation notice within 14 days of receiving the product or the document with the transaction details, whichever is later.</li>
<li>Cancellation fee: 5% of the transaction price or ₪100, whichever is lower.</li>
<li>Refunds are made to the original payment method.</li>
</ul>
<h2>Returning an item</h2>
<ul>
<li>Items must be returned in their original condition, undamaged and unworn, with tags attached.</li>
<li>Return details (address or pickup) are provided when you contact us.</li>
</ul>
<h2>Size exchange</h2>
<p>Not sure about your size? Message us before ordering. If the size isn’t right after delivery, contact us within 14 days and we’ll look into an exchange.</p>
<h2>Contact</h2>
<p>${contactSentence}</p>`);
}

function terms() {
  return doc("/terms", "Terms", "Terms of use and purchase for La Elegant.", `
<h1>Terms of use</h1>
<p class="updated">Last updated: ${TODAY}</p>
<h2>1. General</h2>
<p>This website (the “Site”) is operated under the brand ${esc(SITE.brand)}${operator ? ` by ${operator}` : ""} (“we”, “us”). Using the Site or placing an order constitutes acceptance of these terms.</p>
<h2>2. Orders and production</h2>
<p>Pieces are sewn to order. Placing an order on the Site is a request to purchase; the transaction becomes binding only after we confirm it and payment is made. We may decline an order, for example if a size cannot be produced. In that case no payment is taken, and any payment made is refunded in full.</p>
<h2>3. Prices and payment</h2>
<p>Prices are in Israeli new shekels and include VAT where applicable. Delivery cost, if any, is shown before payment. A secure payment link is sent after the order is confirmed.</p>
<h2>4. Delivery</h2>
<p>An estimated delivery date is given with the order confirmation. See the <a href="${BASE}/shipping">shipping &amp; returns policy</a>.</p>
<h2>5. Cancellation and returns</h2>
<p>Cancellations and returns are handled under Israel’s Consumer Protection Law, as set out in the <a href="${BASE}/shipping">shipping &amp; returns policy</a>.</p>
<h2>6. Images and descriptions</h2>
<p>We aim to show every piece accurately, but slight differences in shade and texture between an image on screen and the actual piece may occur.</p>
<h2>7. Intellectual property</h2>
<p>All content on the Site, including designs, images, videos, text and the ${esc(SITE.brand)} name and emblem, belongs to us and may not be copied or used without written permission.</p>
<h2>8. Privacy</h2>
<p>Use of personal information is described in the <a href="${BASE}/privacy">privacy policy</a>.</p>
<h2>9. Changes</h2>
<p>We may update these terms from time to time. An order is governed by the version in force when it was placed.</p>
<h2>10. Governing law</h2>
<p>These terms are governed by the laws of the State of Israel, and the competent courts in Israel have jurisdiction.</p>
<h2>11. Contact</h2>
<p>${bizBlock ? bizBlock + "<br>" : ""}${contactSentence}</p>`);
}

function privacy() {
  return doc("/privacy", "Privacy", "What information we collect on the site, why, and how to contact us about privacy.", `
<h1>Privacy policy</h1>
<p class="updated">Last updated: ${TODAY}</p>
<h2>What we collect</h2>
<ul>
<li>Details you enter when ordering: name, phone, email (optional), delivery address and notes.</li>
<li>Order details: the pieces, sizes and total.</li>
<li>Anonymous usage statistics (such as page views) that don’t identify you personally.</li>
</ul>
<h2>How we use it</h2>
<ul>
<li>To handle your order: confirmation, production, payment and delivery.</li>
<li>To contact you about your order.</li>
<li>To improve the site based on statistics.</li>
</ul>
<p>We won’t send you marketing messages without your explicit consent.</p>
<h2>Who we share it with</h2>
<p>Only those needed to fulfil your order: the courier, the payment provider and the messaging service through which your order is sent. We never sell your information.</p>
<h2>Storage and security</h2>
<p>Information is kept only as long as needed to handle your order and meet legal obligations. Card details are never entered on or stored by this site.</p>
<h2>Your rights</h2>
<p>Under Israel’s Protection of Privacy Law, 5741-1981, you may ask to review, correct or delete information about you by contacting us.</p>
<h2>Contact</h2>
<p>${bizBlock ? bizBlock + "<br>" : ""}${contactSentence}</p>`);
}

function accessibility() {
  return doc("/accessibility", "Accessibility", "La Elegant accessibility statement: what has been done, known limitations and how to contact us.", `
<h1>Accessibility statement</h1>
<p class="updated">Last updated: ${TODAY}</p>
<p>We want everyone to be able to browse and order on this site with ease. The site was built following Israeli Standard 5568 for web content accessibility, based on WCAG 2.0 level AA.</p>
<h2>What we’ve done</h2>
<ul>
<li>Clear page structure with headings and a defined page language.</li>
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
<p>${B.accessibilityContact ? esc(B.accessibilityContact) + "<br>" : ""}${contactSentence}</p>`);
}

function notFound() {
  return layout({ path: "/404", title: "Page not found", desc: "Page not found.", page: "doc", body: `
<article class="doc pad nf"><p class="eyebrow">404</p><h1>This page doesn’t exist.</h1><p>The set does.</p><a class="btn" href="${pUrl(PRODUCTS[0])}">Shop the set</a></article>` });
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
cpSync(join(SRC, "brand"), join(OUT, "brand"), { recursive: true });
cpSync(join(SRC, "static"), OUT, { recursive: true });

write("assets/config.js", "window.SHOP = " + JSON.stringify({
  base: BASE, brand: SITE.brand, whatsapp: SITE.whatsapp, checkout: SITE.checkout, shipping: SITE.shipping, leadTime: SITE.leadTime,
  products: PRODUCTS.map(({ id, slug, name, color, price, poster, sizeGroups }) => ({ id, slug, name, color, price, poster, sizeGroups }))
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

const urls = ["/", ...PRODUCTS.map(pPath), "/story", "/faq", "/shipping", "/terms", "/privacy", "/accessibility"];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${abs(u)}</loc><lastmod>${TODAY}</lastmod><priority>${u === "/" ? "1.0" : u.startsWith("/products/") ? "0.9" : "0.5"}</priority></url>`).join("\n")}
</urlset>
`);
write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${abs("/sitemap.xml")}\n`);

console.log("built", urls.length, "pages →", OUT);
