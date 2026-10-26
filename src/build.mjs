// Static site builder: src/ → public/. Node built-ins only (runs on Vercel as the build command).
import { SITE, PRODUCTS, FAQ } from "./data.mjs";
import { mkdirSync, writeFileSync, cpSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = dirname(fileURLToPath(import.meta.url));
const OUT = join(SRC, "..", "public");
const TODAY = new Date().toISOString().slice(0, 10);
const TBD = '<mark class="tbd">[to be added]</mark>';

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const abs = p => SITE.url.replace(/\/$/, "") + p;
const money = n => "₪" + Number(n).toLocaleString("en-US");
const pUrl = p => "/products/" + p.slug;
const byId = id => PRODUCTS.find(p => p.id === id);
const phoneText = n => n ? "0" + String(n).replace(/^972/, "").replace(/(\d{2})(\d{3})(\d{4})$/, "$1-$2-$3") : "";
const wa = text => SITE.whatsapp ? "https://wa.me/" + SITE.whatsapp + (text ? "?text=" + encodeURIComponent(text) : "") : "";
const val = v => v ? esc(v) : TBD;
const B = SITE.business;
const bizName = val(B.name), bizId = val(B.id), bizAddr = val(B.address);
const contactLine = [
  SITE.whatsapp ? `WhatsApp ${esc(phoneText(SITE.whatsapp))}` : "",
  SITE.email ? `email <a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>` : ""
].filter(Boolean).join(" · ") || TBD;
const fontParam = SITE.wordmarkFont.replace(/ /g, "+") + (SITE.wordmarkFont === "Ballet" ? ":opsz@16..72" : "");

/* ---------- shared pieces ---------- */
const wordmark = (cls = "mark") => `<span class="${cls}">${esc(SITE.brand)}</span>`;

function header(page) {
  return `
<a class="skip" href="#main">Skip to content</a>
<header class="head${page === "home" ? " is-home" : ""}">
  <div class="head-in pad">
    <div class="head-start">
      <button class="menu-btn" id="menu-btn" type="button" aria-expanded="false" aria-controls="menu">Menu</button>
      <nav class="nav" id="menu" aria-label="Main">
        <a href="/#shop">Collection</a>
        <a href="/story">Story</a>
        <a href="/faq">FAQ</a>
      </nav>
    </div>
    <a class="head-mark" href="/" aria-label="${esc(SITE.brand)}, home">${wordmark()}</a>
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
  <div class="foot-mark-row pad"><a href="/" aria-label="${esc(SITE.brand)}, home">${wordmark("foot-mark")}</a></div>
  <div class="foot-cols pad">
    <p class="foot-tag">${esc(SITE.tagline)}</p>
    <nav aria-label="Shop"><h2>Shop</h2><ul>
      ${PRODUCTS.map(p => `<li><a href="${pUrl(p)}">${esc(p.name)}</a></li>`).join("")}
    </ul></nav>
    <nav aria-label="Information"><h2>Information</h2><ul>
      <li><a href="/story">Story</a></li>
      <li><a href="/faq">FAQ</a></li>
      <li><a href="/shipping">Shipping &amp; returns</a></li>
      <li><a href="/terms">Terms</a></li>
      <li><a href="/privacy">Privacy</a></li>
      <li><a href="/accessibility">Accessibility</a></li>
    </ul></nav>
    ${social ? `<div><h2>Contact</h2><ul>${social}</ul></div>` : ""}
  </div>
  <div class="foot-base pad"><span>© ${new Date().getFullYear()} ${esc(SITE.brand)}${legal ? " · " + legal : ""}</span><span>Made in Israel</span></div>
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
    <div class="sum"><div class="total"><span>Subtotal</span><span class="price" id="c-sub"></span></div></div>
    <button class="btn wide" type="button" id="to-details">Continue to checkout</button>
    <p class="note">${esc(SITE.preorder)}</p>
  </div>
  <form class="d-body pad form" id="v-details" novalidate hidden>
    <button class="link" type="button" id="back-cart">Back to bag</button>
    <div class="field"><label for="o-name">Full name</label><input id="o-name" name="name" autocomplete="name" required><p class="err" hidden></p></div>
    <div class="two">
      <div class="field"><label for="o-phone">Phone</label><input id="o-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required><p class="err" hidden></p></div>
      <div class="field"><label for="o-email">Email <small>optional</small></label><input id="o-email" name="email" type="email" autocomplete="email"><p class="err" hidden></p></div>
    </div>
    <fieldset><legend class="label">Delivery</legend><div class="ship" id="o-ship"></div></fieldset>
    <div id="o-address" class="form">
      <div class="two">
        <div class="field"><label for="o-city">City</label><input id="o-city" name="city" autocomplete="address-level2" required><p class="err" hidden></p></div>
        <div class="field"><label for="o-street">Street and number</label><input id="o-street" name="street" autocomplete="address-line1" required><p class="err" hidden></p></div>
      </div>
      <div class="field"><label for="o-apt">Apartment, floor, entry code <small>optional</small></label><input id="o-apt" name="apt" autocomplete="address-line2"></div>
    </div>
    <div class="field"><label for="o-notes">Notes <small>optional</small></label><textarea id="o-notes" name="notes" rows="2"></textarea></div>
    <label class="check"><input type="checkbox" id="o-terms"><span>I have read and agree to the <a href="/terms" target="_blank">terms</a>, the <a href="/shipping" target="_blank">shipping &amp; returns policy</a> and the <a href="/privacy" target="_blank">privacy policy</a>.</span></label>
    <p class="err" id="o-terms-err" hidden>Please accept the terms to continue</p>
  </form>
  <div class="d-foot pad" id="f-details" hidden>
    <div class="sum" id="o-sum"></div>
    <button class="btn wide" type="submit" form="v-details" id="o-submit">Send order</button>
    <p class="err" id="o-err" role="alert" hidden></p>
    <p class="note">${esc(SITE.checkout.note)}</p>
  </div>
  <div class="d-body pad" id="v-done" hidden>
    <div class="done">
      <p class="eyebrow" id="d-num"></p>
      <h3>Your order is ready</h3>
      <p>WhatsApp opens with your order details. Send the message and we'll reply with confirmation, delivery time and payment details.</p>
      <a class="btn" id="d-wa" href="#" target="_blank" rel="noopener">Open in WhatsApp</a>
      <pre id="d-msg"></pre>
      <button class="btn ghost" type="button" data-close>Keep browsing</button>
    </div>
  </div>
</aside>
<div class="toast" id="toast" role="status" aria-live="polite" hidden></div>`;

function layout({ path, title, desc, image, jsonld = [], body, page = "" }) {
  const canonical = abs(path);
  const ogImage = abs(image || "/og.jpg");
  const fullTitle = title ? `${title} | ${SITE.brand}` : `${SITE.brand} · ${SITE.tagline}`;
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
<meta property="og:locale" content="en_IL">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0A0A0A">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${fontParam}&family=Newsreader:ital,opsz,wght@0,6..72,300..500;1,6..72,300..400&family=Jost:wght@300..500&display=swap">
<link rel="stylesheet" href="/assets/site.css">
<style>:root{--script:"${esc(SITE.wordmarkFont)}",cursive}</style>
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
    <a class="frame spot" href="${pUrl(p)}" aria-label="${esc(p.name)}, ${esc(p.color)}, ${money(p.price)}">
      <img src="/${p.poster}" alt="${esc(p.name)} in ${esc(p.color.toLowerCase())}" width="540" height="720" ${eager ? "" : 'loading="lazy"'} decoding="async">
      <video muted playsinline loop preload="none" aria-hidden="true" tabindex="-1"></video>
    </a>
    <div class="quick" role="group" aria-label="Quick add ${esc(p.name)}">
      <span>Quick add</span>
      ${SITE.sizes.map(s => `<button type="button" data-add="${p.id}" data-size="${s}" aria-label="Size ${s}">${s}</button>`).join("")}
    </div>
  </div>
  <a class="card-meta" href="${pUrl(p)}" tabindex="-1">
    <h3 class="card-name">${esc(p.name)}</h3>
    <p class="card-sub">${esc(p.color)} · <span class="price">${money(p.price)}</span></p>
  </a>
</article>`;
}

/* ---------- pages ---------- */
const orgLd = {
  "@context": "https://schema.org", "@type": "Organization", name: SITE.brand, url: abs("/"),
  logo: abs("/apple-touch-icon.png"),
  sameAs: [SITE.instagram && `https://instagram.com/${SITE.instagram}`, SITE.tiktok && `https://www.tiktok.com/@${SITE.tiktok}`].filter(Boolean)
};
const siteLd = { "@context": "https://schema.org", "@type": "WebSite", name: SITE.brand, url: abs("/"), inLanguage: "en" };

function home() {
  const piece = byId(SITE.hero) || PRODUCTS[0];
  const film = SITE.heroFilm;
  const hero = film
    ? { href: "#shop", label: "Shop the collection", video: film.video, poster: film.poster, alt: film.alt }
    : { href: pUrl(piece), label: piece.name, video: piece.video, poster: piece.poster, alt: `${piece.name} in ${piece.color.toLowerCase()}, walking` };
  const words = SITE.tagline.split(" ");
  const body = `
<section class="stage" aria-labelledby="hero-line">
  <a class="stage-spot spot walk is-auto" href="${hero.href}" data-video="/${hero.video}" aria-label="${esc(hero.label)}">
    <img src="/${hero.poster}" alt="${esc(hero.alt)}" width="600" height="800" fetchpriority="high">
    <video muted playsinline loop preload="none" aria-hidden="true" tabindex="-1"></video>
  </a>
  <h1 class="stage-line" id="hero-line">${words.map((w, i) => `<span style="--i:${i}">${w === "walk" ? "<em>walk</em>" : esc(w)}</span>`).join(" ")}</h1>
  <div class="credits">
    <span class="lead">Collection 01</span>
    <span>Made in Israel</span>
    <span>Made to order</span>
    <a class="btn-line" href="#shop">Shop the collection</a>
  </div>
</section>

<section id="shop" class="shop pad" aria-labelledby="shop-title">
  <div class="sec-head">
    <p class="eyebrow">Collection 01</p>
    <h2 id="shop-title">The first collection</h2>
    <p class="sub">Four pieces, made to order in Israel</p>
  </div>
  <div class="grid">${PRODUCTS.map((p, i) => card(p, i < 2)).join("")}</div>
</section>

<section class="manifesto pad" aria-labelledby="mf-title">
  <h2 id="mf-title">We don’t make stock.<br><em>We make yours.</em></h2>
  <p>Every piece goes into production at a factory in Israel only after it’s ordered. No overflowing warehouses, no clothes nobody wears. Small runs, clean cuts, and one strong piece that changes the room.</p>
  <a class="btn-line" href="/story">Our story</a>
</section>`;
  return layout({ path: "/", title: "", desc: SITE.description, jsonld: [orgLd, siteLd], body, page: "home" });
}

function product(p) {
  const others = PRODUCTS.filter(x => x.id !== p.id);
  const gallery = [p.poster, ...(p.images || [])];
  const guide = SITE.sizeGuide.length ? `
      <details class="acc-item">
        <summary>Size guide</summary>
        <div class="acc-body"><table class="guide">
          <thead><tr><th scope="col">Size</th><th scope="col">Chest (cm)</th><th scope="col">Length (cm)</th></tr></thead>
          <tbody>${SITE.sizeGuide.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}</tbody>
        </table></div>
      </details>` : "";
  const ask = SITE.whatsapp ? `<a class="ask" href="${esc(wa(`Hi, I have a question about the ${p.name} (${p.color})`))}" target="_blank" rel="noopener">Questions about this piece? Message us on WhatsApp</a>` : "";
  const ld = [{
    "@context": "https://schema.org", "@type": "Product", name: `${p.name} ${p.color}`, description: p.seoDesc,
    image: gallery.map(g => abs("/" + g)), sku: p.id, color: p.color,
    brand: { "@type": "Brand", name: SITE.brand },
    offers: { "@type": "Offer", url: abs(pUrl(p)), priceCurrency: "ILS", price: String(p.price),
      availability: "https://schema.org/PreOrder", itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE.brand } }
  }, {
    "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
      { "@type": "ListItem", position: 2, name: "Collection", item: abs("/#shop") },
      { "@type": "ListItem", position: 3, name: p.name, item: abs(pUrl(p)) }
    ]
  }];
  const body = `
<nav class="crumbs pad" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/#shop">Collection</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.name)}</span></nav>
<div class="pdp pad" data-product="${p.id}">
  <div class="pdp-media">
    <div class="pdp-frame spot walk is-auto" data-video="/${p.video}">
      <img src="/${p.poster}" alt="${esc(p.name)} in ${esc(p.color.toLowerCase())}, render in motion" width="540" height="720" fetchpriority="high" id="pdp-img">
      <video muted playsinline loop preload="none" aria-hidden="true" tabindex="-1"></video>
    </div>
    ${gallery.length > 1 ? `<div class="thumbs" role="group" aria-label="Images">${gallery.map((g, i) => `<button type="button" data-src="/${g}" aria-label="Image ${i + 1}"${i ? "" : ' aria-current="true"'}><img src="/${g}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
  </div>
  <div class="pdp-info">
    <p class="eyebrow">${esc(SITE.preorder)}</p>
    <h1>${esc(p.name)}</h1>
    <p class="pdp-price"><span class="price">${money(p.price)}</span></p>
    <p class="pdp-color">Colour: ${esc(p.color)}</p>
    <form class="buy" id="buy" novalidate>
      <fieldset>
        <legend class="label">Size</legend>
        <div class="sizes">${SITE.sizes.map(s => `<label><input type="radio" name="size" value="${s}"><span>${s}</span></label>`).join("")}</div>
      </fieldset>
      <p class="err" id="size-err" role="alert" hidden>Choose a size</p>
      <button class="btn wide" type="submit">Add to bag</button>
    </form>
    ${ask}
    <div class="acc">
      <details class="acc-item" open><summary>Description</summary><div class="acc-body"><p>${esc(p.desc)}</p></div></details>
      <details class="acc-item"><summary>Details</summary><div class="acc-body"><ul>${p.details.map(d => `<li>${esc(d)}</li>`).join("")}</ul></div></details>
      ${guide}
      <details class="acc-item"><summary>Shipping &amp; returns</summary><div class="acc-body"><p>Made to order. Your delivery time is confirmed with your order, before payment. Purchases can be cancelled under Israel’s Consumer Protection Law. <a href="/shipping">Full details</a></p></div></details>
    </div>
    <div class="pdp-foot"><p class="note">${esc(SITE.renderNote)}</p><button class="link" type="button" data-share>Copy link</button></div>
  </div>
</div>
<section class="related pad" aria-labelledby="rel-title">
  <div class="sec-head"><h2 id="rel-title">More from the collection</h2></div>
  <div class="grid three">${others.map(o => card(o)).join("")}</div>
</section>
<div class="buybar" id="buybar">
  <div><b>${esc(p.name)}</b><span class="price">${money(p.price)}</span></div>
  <button class="btn" type="button" id="buybar-btn">Add to bag</button>
</div>`;
  return layout({ path: pUrl(p), title: p.seoTitle, desc: p.seoDesc, image: "/" + p.poster, jsonld: ld, body, page: "product" });
}

function doc(path, title, desc, inner, jsonld = []) {
  return layout({ path, title, desc, jsonld, page: "doc", body: `<article class="doc pad">${inner}</article>` });
}

function story() {
  const p = byId("pants");
  return layout({ path: "/story", title: "Story", desc: "The story of La Elegant: elegance as the way you walk into a room, and clothes made to order in Israel in small runs.", page: "story", body: `
<section class="story-hero pad">
  <p class="eyebrow">Story</p>
  <h1>Elegance is how you <em>walk</em> into a room.</h1>
</section>
<section class="story pad">
  <div class="story-img spot walk is-auto" data-video="/${p.video}"><img src="/${p.poster}" alt="${esc(p.name)} in motion" width="540" height="720" loading="lazy"><video muted playsinline loop preload="none" aria-hidden="true" tabindex="-1"></video></div>
  <div class="story-text">
    <h2>The walk</h2>
    <p>Elegance isn’t a price tag. It’s the walk, the shoulders, the line. The moment someone sees you before you’ve said a word. That’s why every piece here is shown in motion: good clothes look best when you walk in them.</p>
    <h2>No stock</h2>
    <p>Most labels make thousands of units and hope they sell. We work the other way round: every piece goes into production only after it’s ordered. No overflowing warehouses, no surplus, no clothes thrown away.</p>
    <h2>Made in Israel</h2>
    <p>The collection is sewn at a factory in Israel, in small runs. We work directly with the factory, choose the fabrics ourselves and check every cut before it reaches you.</p>
    <h2>Cuts that stay</h2>
    <p>No one-season trends. Clean cuts, quiet colours, and one strong piece that makes the difference.</p>
    <a class="btn" href="/#shop">Shop the collection</a>
  </div>
</section>` });
}

function faq() {
  const ld = [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }];
  return doc("/faq", "FAQ", "Answers about pre-orders, payment, delivery times, sizing, returns and production in Israel.", `
<p class="eyebrow">Help</p>
<h1>Frequently asked questions</h1>
<div class="acc">${FAQ.map(([q, a], i) => `<details class="acc-item"${i ? "" : " open"}><summary>${esc(q)}</summary><div class="acc-body"><p>${esc(a)}</p></div></details>`).join("")}</div>
<p>Didn’t find your answer? ${SITE.whatsapp ? `<a href="${esc(wa("Hi, I have a question"))}" target="_blank" rel="noopener">Message us on WhatsApp</a>` : "Message us"} and we’ll get back to you.</p>`, ld);
}

function shipping() {
  return doc("/shipping", "Shipping & returns", "Shipping, cancellation and returns policy: pre-orders, delivery times and cancellation under Israel’s Consumer Protection Law.", `
<h1>Shipping, cancellation &amp; returns</h1>
<p class="updated">Last updated: ${TODAY}</p>
<h2>Pre-order</h2>
<p>Pieces on this site are made to order at a factory in Israel. After you send your order, we reply with confirmation, an estimated delivery time and payment details. Payment is taken only after confirmation.</p>
<h2>Shipping</h2>
<ul>
${SITE.shipping.map(s => `<li>${esc(s.label)}: ${s.price == null ? "cost confirmed with your order" : s.price ? money(s.price) : "free"}.</li>`).join("\n")}
<li>Delivery time is confirmed with your order and depends on the production time of each piece.</li>
<li>If production or delivery is delayed, we’ll let you know as soon as possible by WhatsApp or email.</li>
</ul>
<h2>Cancelling a purchase</h2>
<p>You may cancel a purchase in accordance with Israel’s Consumer Protection Law, 5741-1981, and its regulations:</p>
<ul>
<li>Send a written cancellation notice (WhatsApp or email) within 14 days of receiving the product or the document with the transaction details, whichever is later.</li>
<li>Cancellation fee: 5% of the transaction price or ₪100, whichever is lower.</li>
<li>Refunds are made to the original payment method.</li>
</ul>
<h2>Returning an item</h2>
<ul>
<li>Items must be returned in their original condition, undamaged and unused, with tags attached.</li>
<li>Return details (address or pickup) are provided when you contact us.</li>
</ul>
<h2>Size exchange</h2>
<p>Not sure about your size? Message us before ordering. If the size doesn’t fit after delivery, contact us within 14 days and we’ll look into an exchange.</p>
<h2>Contact</h2>
<p>${contactLine}</p>`);
}

function terms() {
  return doc("/terms", "Terms", "Terms of use and purchase for La Elegant.", `
<h1>Terms of use</h1>
<p class="updated">Last updated: ${TODAY}</p>
<h2>1. General</h2>
<p>The website ${esc(SITE.url.replace(/^https?:\/\//, ""))} (the “Site”) is operated by ${bizName}, business no. ${bizId} (the “Business”), under the brand ${esc(SITE.brand)}. Using the Site or placing an order constitutes acceptance of these terms.</p>
<h2>2. Pre-orders and production</h2>
<p>Pieces are made to order. Sending an order on the Site is a request to purchase; the transaction becomes binding only after the Business confirms it and payment is made. The Business may decline an order, for example if a piece does not go into production. In that case no payment is taken, and any payment made is refunded in full.</p>
<h2>3. Prices and payment</h2>
<p>Prices are in Israeli new shekels. Delivery cost, if any, is shown or confirmed before payment. Payment details are sent after the order is confirmed.</p>
<h2>4. Delivery</h2>
<p>An estimated delivery time is given with the order confirmation. See the <a href="/shipping">shipping &amp; returns policy</a>.</p>
<h2>5. Cancellation and returns</h2>
<p>Cancellations and returns are handled under Israel’s Consumer Protection Law, as set out in the <a href="/shipping">shipping &amp; returns policy</a>.</p>
<h2>6. Images and descriptions</h2>
<p>Some images on the Site are renders of the design. We aim to show every piece accurately, but slight differences in shade and texture between an image and the actual piece may occur.</p>
<h2>7. Intellectual property</h2>
<p>All content on the Site, including designs, images, videos, text and the ${esc(SITE.brand)} mark, belongs to the Business and may not be copied or used without written permission.</p>
<h2>8. Privacy</h2>
<p>Use of personal information is described in the <a href="/privacy">privacy policy</a>.</p>
<h2>9. Changes</h2>
<p>The Business may update these terms from time to time. An order is governed by the version in force when it was sent.</p>
<h2>10. Governing law</h2>
<p>These terms are governed by the laws of the State of Israel, and the competent courts in Israel have jurisdiction.</p>
<h2>11. Business details</h2>
<p>${bizName} · ${bizId} · ${bizAddr}<br>${contactLine}</p>`);
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
<p>Only those needed to fulfil your order: the courier, the payment provider, and the messaging service (WhatsApp) through which the order is sent. We never sell your information.</p>
<h2>Storage and security</h2>
<p>Information is kept only as long as needed to handle your order and meet legal obligations. Card details are never stored on this site.</p>
<h2>Your rights</h2>
<p>Under Israel’s Protection of Privacy Law, 5741-1981, you may ask to review, correct or delete information about you by contacting us.</p>
<h2>Contact</h2>
<p>${bizName} · ${contactLine}</p>`);
}

function accessibility() {
  return doc("/accessibility", "Accessibility", "La Elegant accessibility statement: what has been done, known limitations and the accessibility contact.", `
<h1>Accessibility statement</h1>
<p class="updated">Last updated: ${TODAY}</p>
<p>We want everyone to be able to browse and order on this site with ease. The site was built following Israeli Standard 5568 for web content accessibility, based on WCAG 2.0 level AA.</p>
<h2>What we’ve done</h2>
<ul>
<li>Clear page structure with headings and a defined page language.</li>
<li>The whole site can be used with a keyboard, with a visible focus indicator and a “skip to content” link.</li>
<li>Every product image has a text alternative.</li>
<li>High-contrast text on a dark background.</li>
<li>Videos are silent and only show the garment in motion. If your device is set to reduce motion, you see a still image instead.</li>
<li>Form fields have labels, and error messages appear as text next to the field.</li>
<li>The site works on phones and with browser text zoom.</li>
</ul>
<h2>Known limitations</h2>
<p>We keep testing the site. If any part isn’t accessible to you, we’ll gladly help you complete your order by phone or WhatsApp.</p>
<h2>Accessibility contact</h2>
<p>${val(B.accessibilityContact)} · ${contactLine}</p>`);
}

function notFound() {
  return layout({ path: "/404", title: "Page not found", desc: "Page not found.", page: "doc", body: `
<article class="doc pad nf"><p class="eyebrow">404</p><h1>This page doesn’t exist.</h1><p>The collection does.</p><a class="btn" href="/#shop">Shop the collection</a></article>` });
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
