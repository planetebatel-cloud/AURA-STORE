// Static site builder: src/ → public/. Node built-ins only (runs on Vercel as the build command).
// Builds every language in SITE.langs: the first at "/", the others at "/<lang>/".
import { SITE, PRODUCTS } from "./data.mjs";
import { T, LEGAL, PHRASES } from "./i18n.mjs";
import { mkdirSync, writeFileSync, cpSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = dirname(fileURLToPath(import.meta.url));
const OUT = join(SRC, "..", "public");
const TODAY = new Date().toISOString().slice(0, 10);
const YEAR = new Date().getFullYear();
const LANGS = SITE.langs;
const DEF = LANGS[0];
const ACC = !!(SITE.accounts.supabaseUrl && SITE.accounts.supabaseAnonKey);
const RATE = Math.round(SITE.bonus.rate * 100);
const SUPABASE_JS = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0/dist/umd/supabase.js";

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fill = (s, o) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in o ? o[k] : m));
const origin = SITE.url.replace(/\/$/, "");
const abs = p => origin + p;
const money = n => "₪" + Number(n).toLocaleString("en-US");
const priceHtml = n => `<span class="price" dir="ltr">${money(n)}</span>`;
const prefix = lang => (lang === DEF ? "" : "/" + lang);
const loc = (lang, path) => (path === "/" ? prefix(lang) || "/" : prefix(lang) + path);
const pPath = p => "/products/" + p.slug;
const byId = id => PRODUCTS.find(p => p.id === id);
const phoneText = n => (n ? "0" + String(n).replace(/^972/, "").replace(/(\d{2})(\d{3})(\d{4})$/, "$1-$2-$3") : "");
const wa = text => (SITE.whatsapp ? "https://wa.me/" + SITE.whatsapp + (text ? "?text=" + encodeURIComponent(text) : "") : "");
const B = SITE.business;
const ld = j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`;
const sameAs = [SITE.instagram && `https://instagram.com/${SITE.instagram}`, SITE.tiktok && `https://www.tiktok.com/@${SITE.tiktok}`].filter(Boolean);

/* Every page that exists in every language (path without the language prefix). */
const PAGES = ["/", ...PRODUCTS.map(pPath), "/story", "/faq", "/shipping", "/terms", "/privacy", "/accessibility"];

function buildLang(lang) {
  const t = T[lang], ph = PHRASES[lang], L = prefix(lang);
  const prod = p => ({ ...p, ...t.products[p.id] });
  const pUrl = p => L + pPath(p);

  const contactLine = [
    SITE.whatsapp ? `${ph.wa} <a href="${esc(wa(""))}" target="_blank" rel="noopener" dir="ltr">${esc(phoneText(SITE.whatsapp))}</a>` : "",
    SITE.email ? `${ph.email} <a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>` : "",
    SITE.instagram ? `${ph.ig} <a href="https://instagram.com/${esc(SITE.instagram)}" target="_blank" rel="noopener" dir="ltr">@${esc(SITE.instagram)}</a>` : ""
  ].filter(Boolean).join(" · ");
  const contactSentence = contactLine ? `${ph.contactVia} ${contactLine}.` : ph.contactNone;
  const operator = B.name ? `${esc(B.name)}${B.id ? `, ${ph.businessNo} ${esc(B.id)}` : ""}` : "";
  const bizBlock = [B.name && esc(B.name), B.id && `${ph.businessNo} ${esc(B.id)}`, B.address && esc(B.address)].filter(Boolean).join(" · ");
  const shipLabel = s => t.shipping[s.id] || { label: s.id, note: "" };

  /* ---------- brand lockup (emblem + serif wordmark), always LTR ---------- */
  const lockup = (cls = "") => `<span class="lockup ${cls}" dir="ltr"><img class="lk-emblem" src="/brand/${cls.includes("lg") ? "emblem" : "emblem-sm"}.webp" alt="" width="${cls.includes("lg") ? 720 : 260}" height="${cls.includes("lg") ? 539 : 195}"><span class="lk-word">${esc(SITE.brand)}</span><span class="lk-est"><i></i>${esc(SITE.est)}<i></i></span></span>`;

  function header(page, path) {
    const other = LANGS.filter(l => l !== lang);
    return `
<a class="skip" href="#main">${esc(t.nav.skip)}</a>
<header class="head${page === "home" ? " is-home" : ""}">
  <div class="head-in pad">
    <div class="head-start">
      <button class="menu-btn" id="menu-btn" type="button" aria-expanded="false" aria-controls="menu" data-open="${esc(t.nav.menu)}" data-close="${esc(t.nav.close)}">${esc(t.nav.menu)}</button>
      <nav class="nav" id="menu" aria-label="${esc(t.nav.main)}">
        <a href="${pUrl(PRODUCTS[0])}">${esc(t.nav.set)}</a>
        <a href="${L}/story">${esc(t.nav.story)}</a>
        <a href="${L}/faq">${esc(t.nav.faq)}</a>
        ${ACC ? `<a href="${L}/account" data-account>${esc(t.nav.account)}</a>` : ""}
        ${other.map(o => `<a class="lang" href="${loc(o, path)}" hreflang="${T[o].meta.hreflang}" lang="${T[o].meta.htmlLang}">${esc(T[o].meta.name)}</a>`).join("")}
      </nav>
    </div>
    <a class="head-mark" href="${loc(lang, "/")}" aria-label="${esc(SITE.brand)}, ${esc(t.nav.home)}">${lockup("sm")}</a>
    <button class="bag-btn" id="bag-open" type="button" aria-haspopup="dialog">${esc(t.nav.bag)} <span class="count" id="bag-count">0</span></button>
  </div>
</header>`;
  }

  function footer() {
    const social = [
      SITE.instagram ? `<li><a href="https://instagram.com/${esc(SITE.instagram)}" target="_blank" rel="noopener">Instagram</a></li>` : "",
      SITE.tiktok ? `<li><a href="https://www.tiktok.com/@${esc(SITE.tiktok)}" target="_blank" rel="noopener">TikTok</a></li>` : "",
      SITE.whatsapp ? `<li><a href="${esc(wa(""))}" target="_blank" rel="noopener">WhatsApp <span dir="ltr">${esc(phoneText(SITE.whatsapp))}</span></a></li>` : "",
      SITE.email ? `<li><a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a></li>` : ""
    ].join("");
    const legal = [B.name, B.id ? `${t.foot.businessNo} ${B.id}` : ""].filter(Boolean).map(esc).join(" · ");
    return `
<footer class="foot">
  <div class="foot-mark-row pad"><a href="${loc(lang, "/")}" aria-label="${esc(SITE.brand)}, ${esc(t.nav.home)}">${lockup("lg")}</a></div>
  <div class="foot-cols pad${social ? "" : " no-social"}">
    <p class="foot-tag">${esc(t.site.tagline)}</p>
    <nav aria-label="${esc(t.foot.shop)}"><h2>${esc(t.foot.collection)}</h2><ul>
      ${PRODUCTS.map(prod).map(p => `<li><a href="${pUrl(p)}">${esc(p.name)}</a></li>`).join("")}
      <li><a href="${L}/faq">${esc(t.foot.how)}</a></li>
      ${ACC ? `<li><a href="${L}/account">${esc(t.nav.account)}</a></li>` : ""}
    </ul></nav>
    <nav aria-label="${esc(t.foot.info)}"><h2>${esc(t.foot.info)}</h2><ul>
      <li><a href="${L}/story">${esc(t.nav.story)}</a></li>
      <li><a href="${L}/shipping">${esc(t.foot.shipping)}</a></li>
      <li><a href="${L}/terms">${esc(t.foot.terms)}</a></li>
      <li><a href="${L}/privacy">${esc(t.foot.privacy)}</a></li>
      <li><a href="${L}/accessibility">${esc(t.foot.accessibility)}</a></li>
    </ul></nav>
    ${social ? `<div><h2>${esc(t.foot.contact)}</h2><ul>${social}</ul></div>` : ""}
  </div>
  <div class="foot-base pad"><span>© ${YEAR} ${esc(SITE.brand)}${legal ? " · " + legal : ""}</span><span>${esc(t.site.sewn)}</span></div>
</footer>`;
  }

  const u = t.ui;
  const agree = fill(esc(u.agreeTpl), {
    terms: `<a href="${L}/terms" target="_blank">${esc(u.agreeTerms)}</a>`,
    ship: `<a href="${L}/shipping" target="_blank">${esc(u.agreeShip)}</a>`,
    priv: `<a href="${L}/privacy" target="_blank">${esc(u.agreePriv)}</a>`
  });
  const bagDrawer = `
<div class="scrim" id="scrim" hidden></div>
<aside class="drawer" id="bag" role="dialog" aria-modal="true" aria-labelledby="bag-title" hidden>
  <div class="d-head pad">
    <h2 id="bag-title">${esc(u.bag)}</h2>
    <button class="x" type="button" data-close aria-label="${esc(u.close)}">×</button>
  </div>
  <div class="d-body pad" id="v-cart"></div>
  <div class="d-foot pad" id="f-cart">
    <div class="sum"><div class="total"><span>${esc(u.subtotal)}</span><span class="price" dir="ltr" id="c-sub"></span></div><div class="mutedv"><span>${esc(u.delivery)}</span><span>${esc(u.free)}</span></div></div>
    <button class="btn wide" type="button" id="to-details">${esc(u.checkout)}</button>
    <p class="note">${esc(t.site.preorder)} · ${esc(t.site.leadTime)}</p>
  </div>
  <form class="d-body pad form" id="v-details" novalidate hidden>
    <button class="link" type="button" id="back-cart">${esc(u.back)}</button>
    <div class="acct-hint" id="o-acct" hidden></div>
    <p class="step">${esc(u.contact)}</p>
    <div class="field"><label for="o-name">${esc(u.fullName)}</label><input id="o-name" name="name" autocomplete="name" required maxlength="120"><p class="err" hidden></p></div>
    <div class="two">
      <div class="field"><label for="o-phone">${esc(u.phone)}</label><input id="o-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required dir="ltr" maxlength="20"><p class="err" hidden></p></div>
      <div class="field"><label for="o-email">${esc(u.email)} <small>${esc(u.optional)}</small></label><input id="o-email" name="email" type="email" autocomplete="email" dir="ltr" maxlength="160"><p class="err" hidden></p></div>
    </div>
    <p class="step">${esc(u.deliveryStep)}</p>
    <fieldset><legend class="sr">${esc(u.method)}</legend><div class="ship" id="o-ship"></div></fieldset>
    <div id="o-address" class="form">
      <div class="two">
        <div class="field"><label for="o-city">${esc(u.city)}</label><input id="o-city" name="city" autocomplete="address-level2" required maxlength="80"><p class="err" hidden></p></div>
        <div class="field"><label for="o-street">${esc(u.street)}</label><input id="o-street" name="street" autocomplete="address-line1" required maxlength="160"><p class="err" hidden></p></div>
      </div>
      <div class="field"><label for="o-apt">${esc(u.apt)} <small>${esc(u.optional)}</small></label><input id="o-apt" name="apt" autocomplete="address-line2" maxlength="160"></div>
    </div>
    <div class="field"><label for="o-notes">${esc(u.notes)} <small>${esc(u.optional)}</small></label><textarea id="o-notes" name="notes" rows="2" maxlength="500"></textarea></div>
    <p class="step">${esc(u.payment)}</p>
    <div class="pay">
      <p><b>${esc(u.payTitle)}</b></p>
      <p>${esc(t.site.paymentNote)}</p>
    </div>
    <div id="o-bonus" hidden></div>
    <label class="check"><input type="checkbox" id="o-terms"><span>${agree}</span></label>
    <p class="err" id="o-terms-err" hidden>${esc(u.termsErr)}</p>
  </form>
  <div class="d-foot pad" id="f-details" hidden>
    <div class="sum" id="o-sum"></div>
    <button class="btn wide" type="submit" form="v-details" id="o-submit">${esc(u.place)}</button>
    <p class="err" id="o-err" role="alert" hidden></p>
  </div>
  <div class="d-body pad" id="v-done" hidden>
    <div class="done">
      <img class="done-mark" src="/brand/emblem-sm.webp" alt="" width="130" height="97">
      <p class="eyebrow" id="d-num"></p>
      <h3 id="d-title">${esc(u.thanks)}</h3>
      <p id="d-text"></p>
      <a class="btn" id="d-wa" href="#" target="_blank" rel="noopener" hidden>${esc(u.sendWa)}</a>
      <button class="btn" type="button" id="d-copy" hidden>${esc(u.copy)}</button>
      <p class="bonus-note" id="d-bonus" hidden></p>
      <a class="btn ghost" id="d-acct" href="${L}/account" hidden>${esc(u.createAccount)}</a>
      <pre id="d-msg" dir="auto"></pre>
      <button class="btn ghost" type="button" data-close>${esc(u.continue)}</button>
    </div>
  </div>
</aside>
<div class="toast" id="toast" role="status" aria-live="polite" hidden></div>`;

  /* ---------- structured data shared by pages ---------- */
  const orgLd = {
    "@context": "https://schema.org", "@type": "Organization", "@id": abs("/#org"), name: SITE.brand, url: abs(loc(lang, "/")),
    logo: abs("/apple-touch-icon.png"), image: abs("/og.jpg"), description: t.site.description,
    slogan: t.site.tagline, foundingDate: SITE.founded, foundingLocation: { "@type": "Place", name: "Israel" },
    areaServed: { "@type": "Country", name: "Israel" },
    ...(sameAs.length ? { sameAs } : {}),
    ...((SITE.whatsapp || SITE.email) ? { contactPoint: [{ "@type": "ContactPoint", contactType: "customer service", areaServed: "IL", availableLanguage: ["en", "he", "ru"], ...(SITE.whatsapp ? { telephone: "+" + SITE.whatsapp } : {}), ...(SITE.email ? { email: SITE.email } : {}) }] } : {})
  };
  const siteLd = { "@context": "https://schema.org", "@type": "WebSite", "@id": abs("/#website"), name: SITE.brand, url: abs("/"), inLanguage: LANGS.map(l => T[l].meta.htmlLang), publisher: { "@id": abs("/#org") } };

  function layout({ path, title, desc, jsonld = [], body, page = "", noindex = false, scripts = "" }) {
    const canonical = abs(loc(lang, path));
    const fullTitle = title ? `${title} | ${SITE.brand}` : `${SITE.brand} · ${t.site.homeTitle}`;
    const alternates = noindex ? "" : LANGS.map(l => `<link rel="alternate" hreflang="${T[l].meta.hreflang}" href="${esc(abs(loc(l, path)))}">`).join("\n") +
      `\n<link rel="alternate" hreflang="x-default" href="${esc(abs(loc(DEF, path)))}">`;
    const hebFonts = lang === "he" ? "&family=Frank+Ruhl+Libre:wght@300..500&family=Heebo:wght@300..500" : "";
    return `<!doctype html>
<html lang="${t.meta.htmlLang}" dir="${t.meta.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
${noindex ? `<meta name="robots" content="noindex">` : `<link rel="canonical" href="${esc(canonical)}">\n${alternates}`}
${SITE.seo.googleVerification ? `<meta name="google-site-verification" content="${esc(SITE.seo.googleVerification)}">` : ""}
${SITE.seo.bingVerification ? `<meta name="msvalidate.01" content="${esc(SITE.seo.bingVerification)}">` : ""}
<meta property="og:type" content="${page === "product" ? "product" : "website"}">
<meta property="og:site_name" content="${esc(SITE.brand)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(abs("/og.jpg"))}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${t.meta.ogLocale}">
${LANGS.filter(l => l !== lang).map(l => `<meta property="og:locale:alternate" content="${T[l].meta.ogLocale}">`).join("\n")}
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0A0A0A">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/brand/cinzel-500.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..500;1,6..72,300..400&family=Jost:wght@300..500${hebFonts}&display=swap">
<link rel="stylesheet" href="/assets/site.css">
${jsonld.map(ld).join("\n")}
<script src="/assets/config-${lang}.js"></script>
<script defer src="/assets/store.js"></script>
${scripts}
<script defer src="/_vercel/insights/script.js"></script>
</head>
<body class="page-${page || "doc"}">
${header(page, path)}
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
  const sizePickers = p => p.sizeGroups.map(g => {
    const gt = p.sizeGroupsText[g.key];
    return `
      <fieldset class="sizeset" data-group="${g.key}">
        <legend class="label">${esc(gt.label)}</legend>
        <div class="sizes" style="--n:${g.sizes.length}" dir="ltr">${g.sizes.map(s => `<label><input type="radio" name="size-${g.key}" value="${esc(s)}"><span>${esc(s)}</span></label>`).join("")}</div>
        <p class="err" data-err="${g.key}" role="alert" hidden>${esc(gt.err)}</p>
      </fieldset>`;
  }).join("");

  const sizeGuide = p => {
    const tables = Object.entries(p.sizeGuide || {}).map(([k, rows]) => {
      const gt = p.sizeGuideText[k];
      return `
    <p class="guide-title">${esc(gt.title)}</p>
    <table class="guide">
      <thead><tr>${gt.cols.map(c => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map(r => `<tr>${r.map(c => `<td dir="ltr">${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>`;
    }).join("");
    return tables ? `
      <details class="acc-item">
        <summary>${esc(t.pdp.sizeGuide)}</summary>
        <div class="acc-body">${tables}
          <p class="note">${esc(t.pdp.guideNote)}</p>
        </div>
      </details>` : "";
  };

  const full = p => {
    const x = t.products[p.id];
    return { ...x, ...p, sizeGroupsText: x.sizeGroups, sizeGuideText: x.sizeGuide, pieces: x.pieces.map((pc, i) => ({ ...pc, image: p.pieceImages[i] })) };
  };

  /* ---------- pages ---------- */
  function home() {
    const p = full(byId(SITE.hero) || PRODUCTS[0]);
    const film = SITE.heroFilm;
    const words = t.site.tagline.split(" ");
    const body = `
<section class="stage" aria-labelledby="hero-line">
  <a class="stage-spot spot walk is-auto" href="${pUrl(p)}" data-video="/${film.video}" aria-label="${esc(p.name)}, ${money(p.price)}">
    <img src="/${film.poster}" alt="${esc(t.site.heroAlt)}" width="600" height="800" fetchpriority="high">
    <video muted playsinline loop preload="none" aria-hidden="true" tabindex="-1"></video>
  </a>
  <h1 class="stage-line" id="hero-line">${words.map((w, i) => `<span style="--i:${i}">${w.replace(/[.,]$/, "") === t.site.taglineEm ? `<em>${esc(w)}</em>` : esc(w)}</span>`).join(" ")}</h1>
  <div class="credits">
    <span class="lead">${esc(t.home.lead)}</span>
    <span>${esc(p.name)}</span>
    ${priceHtml(p.price)}
    <a class="btn-line" href="${pUrl(p)}">${esc(t.home.shopSet)}</a>
  </div>
</section>

<section id="shop" class="feature pad" aria-labelledby="set-title">
  <div class="feature-media">
    ${p.pieces.map(x => `<figure><a class="frame spot" href="${pUrl(p)}" tabindex="-1"><img src="/${x.image}" alt="${esc(x.name)} · ${esc(x.color)}" width="600" height="800" loading="lazy" decoding="async"></a><figcaption>${esc(x.name)} · ${esc(x.color)}</figcaption></figure>`).join("")}
  </div>
  <div class="feature-info">
    <p class="eyebrow">${esc(t.home.firstDrop)}</p>
    <h2 id="set-title">${esc(p.name)}</h2>
    <p class="feature-price">${priceHtml(p.price)} <span class="mutedv">· ${esc(t.home.theSet)}</span></p>
    <p class="feature-lede">${esc(p.lede)}</p>
    <ol class="pieces">
      ${p.pieces.map((x, i) => `<li><span class="num">0${i + 1}</span><div><h3>${esc(x.name)} <span>${esc(x.color)}</span></h3><p>${esc(x.desc)}</p></div></li>`).join("")}
    </ol>
    <div class="feature-cta">
      <a class="btn" href="${pUrl(p)}">${esc(t.home.chooseSizes)}</a>
      <p class="note">${esc(t.site.leadTime)} · ${esc(t.home.freeDelivery)}</p>
    </div>
  </div>
</section>

<section class="promise pad" aria-label="${esc(t.home.promiseLabel)}">
  ${t.home.promise.map(([h, txt], i) => `<div><p class="eyebrow">0${i + 1}</p><h3>${esc(h)}</h3><p>${esc(txt)}</p></div>`).join("\n  ")}
</section>

<section class="manifesto pad" aria-labelledby="mf-title">
  <img class="mf-mark" src="/brand/emblem.webp" alt="" width="720" height="539" loading="lazy">
  <h2 id="mf-title">${esc(t.home.mfTitle)}<br><em>${esc(t.home.mfEm)}</em></h2>
  <p>${esc(t.home.mfText)}</p>
  <a class="btn-line" href="${L}/story">${esc(t.home.ourStory)}</a>
</section>`;
    return layout({ path: "/", title: "", desc: t.site.description, jsonld: [orgLd, siteLd], body, page: "home" });
  }

  function product(raw) {
    const p = full(raw);
    const d = SITE.delivery;
    const ask = SITE.whatsapp ? `<a class="ask" href="${esc(wa(`${t.pdp.askMsg} ${p.name}`))}" target="_blank" rel="noopener">${esc(t.pdp.ask)}</a>` : "";
    const productLd = {
      "@context": "https://schema.org", "@type": "Product", "@id": abs(pPath(p)) + "#product",
      name: p.name, description: p.seoDesc, sku: p.id, color: p.color, category: p.category,
      image: [p.poster, ...(p.images || [])].map(g => abs("/" + g)),
      brand: { "@type": "Brand", name: SITE.brand },
      audience: { "@type": "PeopleAudience", suggestedGender: p.gender },
      countryOfOrigin: { "@type": "Country", name: "Israel" },
      offers: {
        "@type": "Offer", url: abs(loc(lang, pPath(p))), priceCurrency: "ILS", price: String(p.price),
        availability: "https://schema.org/PreOrder", itemCondition: "https://schema.org/NewCondition",
        seller: { "@id": abs("/#org") },
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: { "@type": "MonetaryAmount", value: String(SITE.shipping[0].price || 0), currency: "ILS" },
          shippingDestination: { "@type": "DefinedRegion", addressCountry: "IL" },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: { "@type": "QuantitativeValue", minValue: d.handlingDays[0], maxValue: d.handlingDays[1], unitCode: "DAY" },
            transitTime: { "@type": "QuantitativeValue", minValue: d.transitDays[0], maxValue: d.transitDays[1], unitCode: "DAY" }
          }
        },
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy", applicableCountry: "IL",
          returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow", merchantReturnDays: SITE.returnDays,
          returnMethod: "https://schema.org/ReturnByMail"
        }
      }
    };
    const crumbLd = {
      "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: t.pdp.home, item: abs(loc(lang, "/")) },
        { "@type": "ListItem", position: 2, name: t.home.lead, item: abs(loc(lang, "/")) + "#shop" },
        { "@type": "ListItem", position: 3, name: p.name, item: abs(loc(lang, pPath(p))) }
      ]
    };
    const bonusLine = ACC ? `<li>${esc(fill(t.pdp.bonus, { n: money(Math.floor(p.price * SITE.bonus.rate)) }))}</li>` : "";
    const body = `
<nav class="crumbs pad" aria-label="${esc(t.pdp.crumbs)}"><a href="${loc(lang, "/")}">${esc(t.pdp.home)}</a><span aria-hidden="true">/</span><a href="${loc(lang, "/")}#shop">${esc(t.home.lead)}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.name)}</span></nav>
<div class="pdp pad" data-product="${p.id}">
  <div class="pdp-media">
    <div class="pdp-frame spot walk is-auto" data-video="/${p.video}">
      <img src="/${p.poster}" alt="${esc(p.imgAlt)}" width="600" height="800" fetchpriority="high" id="pdp-img">
      <video muted playsinline loop preload="none" aria-hidden="true" tabindex="-1"></video>
    </div>
    ${p.images && p.images.length ? `<div class="thumbs" role="group" aria-label="${esc(t.pdp.images)}">${[p.poster, ...p.images].map((g, i) => `<button type="button" data-src="/${g}" aria-label="${esc([t.pdp.inMotion, ...p.pieces.map(x => x.name)][i] || t.pdp.image + " " + (i + 1))}"${i ? "" : ' aria-current="true"'}><img src="/${g}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
  </div>
  <div class="pdp-info">
    <p class="eyebrow">${esc(t.site.preorder)}</p>
    <h1>${esc(p.name)}</h1>
    <p class="pdp-price">${priceHtml(p.price)} <span class="mutedv">· ${esc(t.pdp.twoPieces)}</span></p>
    <p class="pdp-color">${p.pieces.map(x => `${esc(x.name.replace(/^The /, ""))} — ${esc(x.color)}`).join(" · ")}</p>
    <form class="buy" id="buy" novalidate>
      ${sizePickers(p)}
      <button class="btn wide" type="submit">${esc(t.pdp.add)} · ${priceHtml(p.price)}</button>
      <ul class="assure">
        <li>${esc(t.site.leadTime)}</li>
        ${t.pdp.assure.map(a => `<li>${esc(a)}</li>`).join("\n        ")}
        ${bonusLine}
      </ul>
    </form>
    ${ask}
    <div class="acc">
      <details class="acc-item" open><summary>${esc(t.pdp.accSet)}</summary><div class="acc-body"><p>${esc(p.lede)}</p></div></details>
      ${p.pieces.map(x => `<details class="acc-item"><summary>${esc(x.name)} · ${esc(x.color)}</summary><div class="acc-body"><p>${esc(x.desc)}</p><ul>${x.details.map(dd => `<li>${esc(dd)}</li>`).join("")}</ul></div></details>`).join("")}
      ${sizeGuide(p)}
      <details class="acc-item"><summary>${esc(t.pdp.accDetails)}</summary><div class="acc-body"><ul>${p.details.map(dd => `<li>${esc(dd)}</li>`).join("")}</ul></div></details>
      <details class="acc-item"><summary>${esc(t.pdp.accShip)}</summary><div class="acc-body"><p>${esc(t.pdp.shipText)} <a href="${L}/shipping">${esc(t.pdp.fullDetails)}</a></p></div></details>
    </div>
    <div class="pdp-foot"><p class="note">${esc(t.site.renderNote)}</p><button class="link" type="button" data-share>${esc(t.pdp.copyLink)}</button></div>
  </div>
</div>
<div class="buybar" id="buybar">
  <div><b>${esc(p.name)}</b>${priceHtml(p.price)}</div>
  <button class="btn" type="button" id="buybar-btn">${esc(t.pdp.addShort)}</button>
</div>`;
    return layout({ path: pPath(p), title: p.seoTitle, desc: p.seoDesc, jsonld: [productLd, crumbLd], body, page: "product" });
  }

  function doc(path, title, desc, inner, jsonld = []) {
    return layout({ path, title, desc, jsonld, page: "doc", body: `<article class="doc pad">${inner}</article>` });
  }

  function story() {
    const p = full(PRODUCTS[0]);
    const s = t.story;
    const facts = Object.values(s.facts).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(fill(v, { price: money(p.price), withAccount: ACC ? s.withAccount : "" }))}</dd></div>`).join("");
    return layout({ path: "/story", title: s.title, desc: s.desc, page: "story", jsonld: [orgLd], body: `
<section class="story-hero pad">
  <img class="story-mark" src="/brand/emblem.webp" alt="" width="720" height="539">
  <p class="eyebrow">${esc(s.eyebrow)} · ${esc(SITE.est)}</p>
  <h1>${esc(s.h1)} <em>${esc(s.h1Em)}</em> ${esc(s.h1End)}</h1>
</section>
<section class="story pad">
  <div class="story-img spot walk is-auto" data-video="/${p.video}"><img src="/${p.poster}" alt="${esc(p.imgAlt)}" width="600" height="800" loading="lazy"><video muted playsinline loop preload="none" aria-hidden="true" tabindex="-1"></video></div>
  <div class="story-text">
    ${s.blocks.map(([h, txt]) => `<h2>${esc(h)}</h2>\n    <p>${esc(txt)}</p>`).join("\n    ")}
    <a class="btn" href="${pUrl(p)}">${esc(t.home.shopSet)}</a>
  </div>
</section>
<section class="facts pad" aria-labelledby="facts-title">
  <h2 id="facts-title">${esc(s.factsTitle)}</h2>
  <dl>${facts}</dl>
</section>` });
  }

  const faqItems = () => {
    const base = t.faq.items.map(([q, a]) => [q, fill(a, { price: money(PRODUCTS[0].price), accountAnswer: ACC ? t.faq.accountAnswer : "" })]);
    return ACC ? [...base, ...t.faq.bonusItems.map(([q, a]) => [q, fill(a, { rate: RATE })])] : base;
  };

  function faq() {
    const items = faqItems();
    const f = t.faq;
    const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", inLanguage: t.meta.htmlLang, mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
    return doc("/faq", f.title, f.desc, `
<p class="eyebrow">${esc(f.eyebrow)}</p>
<h1>${esc(f.h1)}</h1>
<div class="acc">${items.map(([q, a], i) => `<details class="acc-item"${i ? "" : " open"}><summary>${esc(q)}</summary><div class="acc-body"><p>${esc(a)}</p></div></details>`).join("")}</div>
<p>${esc(f.more)} ${SITE.whatsapp ? `<a href="${esc(wa(lang === "he" ? "היי, יש לי שאלה" : "Hi, I have a question"))}" target="_blank" rel="noopener">${esc(f.wa)}</a> ${esc(f.waEnd)}` : contactLine ? `${esc(f.reach)} ${contactLine}.` : esc(f.send)}</p>`, [faqLd]);
  }

  const legalCtx = {
    L, today: TODAY, contact: contactSentence, biz: bizBlock, operator, brand: esc(SITE.brand), access: B.accessibilityContact ? esc(B.accessibilityContact) : "",
    shipList: SITE.shipping.map(s => `<li>${esc(shipLabel(s).label)}: ${s.price == null ? ph.shipConfirm : s.price ? money(s.price) : ph.shipFree}.</li>`).join("\n"),
    lead: esc(t.site.leadTime), rate: RATE, accounts: ACC, days: SITE.returnDays
  };
  const legalPage = key => doc("/" + key, t.legal[key].title, t.legal[key].desc, LEGAL[lang][key](legalCtx));

  function account() {
    const a = t.account;
    const body = `
<section class="acct pad" aria-labelledby="acct-title">
  <p class="eyebrow">${esc(SITE.brand)}</p>
  <h1 id="acct-title">${esc(a.h1)}</h1>
  <div id="acct-root" aria-live="polite">${ACC ? `<p class="note">…</p>` : `<p>${esc(a.soon)}</p>`}</div>
</section>`;
    return layout({ path: "/account", title: a.title, desc: a.desc, page: "account", noindex: true, body,
      scripts: ACC ? `<script defer src="${SUPABASE_JS}"></script>\n<script defer src="/assets/account.js"></script>` : "" });
  }

  /* ---------- runtime config for this language ---------- */
  const config = {
    lang, prefix: L, brand: SITE.brand, whatsapp: SITE.whatsapp, checkout: { ...SITE.checkout, paymentNote: t.site.paymentNote },
    shipping: SITE.shipping.map(s => ({ ...s, ...shipLabel(s) })), leadTime: t.site.leadTime,
    products: PRODUCTS.map(full).map(p => ({ id: p.id, slug: p.slug, name: p.name, color: p.color, price: p.price, poster: p.poster,
      sizeGroups: p.sizeGroups.map(g => ({ key: g.key, sizes: g.sizes, label: p.sizeGroupsText[g.key].label, short: p.sizeGroupsText[g.key].short })) })),
    t: { ...t.ui, nav: t.nav, account: t.account },
    accounts: ACC ? { url: SITE.accounts.supabaseUrl, key: SITE.accounts.supabaseAnonKey, google: SITE.accounts.google, email: SITE.accounts.email, lib: SUPABASE_JS } : null,
    bonusRate: SITE.bonus.rate
  };

  return { home, product, story, faq, legalPage, account, config, full, faqItems };
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

const built = {};
for (const lang of LANGS) {
  const b = buildLang(lang);
  built[lang] = b;
  const dir = lang === DEF ? "" : lang + "/";
  write(`assets/config-${lang}.js`, "window.SHOP = " + JSON.stringify(b.config) + ";\n");
  write(dir + "index.html", b.home());
  PRODUCTS.forEach(p => write(`${dir}products/${p.slug}.html`, b.product(p)));
  write(dir + "story.html", b.story());
  write(dir + "faq.html", b.faq());
  ["shipping", "terms", "privacy", "accessibility"].forEach(k => write(`${dir}${k}.html`, b.legalPage(k)));
  write(dir + "account.html", b.account());
}

/* 404 — one page for every language */
write("404.html", `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(T.en.nf.title)} | ${esc(SITE.brand)}</title><link rel="icon" href="/favicon.png" type="image/png">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..500;1,6..72,300..400&family=Jost:wght@300..500&family=Frank+Ruhl+Libre:wght@300..500&display=swap">
<link rel="stylesheet" href="/assets/site.css"></head>
<body class="page-doc"><main id="main"><article class="doc pad nf">
<img class="done-mark" src="/brand/emblem-sm.webp" alt="" width="130" height="97">
<p class="eyebrow">404</p>
<h1>${esc(T.en.nf.h1)}</h1><p>${esc(T.en.nf.p)}</p>
<a class="btn" href="${pPath(PRODUCTS[0])}">${esc(T.en.home.shopSet)}</a>
${T.he ? `<div lang="he" dir="rtl" class="nf-alt"><h2>${esc(T.he.nf.h1)}</h2><p>${esc(T.he.nf.p)}</p><a class="btn ghost" href="/he${pPath(PRODUCTS[0])}">${esc(T.he.home.shopSet)}</a></div>` : ""}
</article></main></body></html>
`);

/* sitemap with language alternates */
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${LANGS.flatMap(lang => PAGES.map(path => `  <url>
    <loc>${abs(loc(lang, path))}</loc>
    <lastmod>${TODAY}</lastmod>
    <priority>${path === "/" ? "1.0" : path.startsWith("/products/") ? "0.9" : path === "/story" || path === "/faq" ? "0.7" : "0.4"}</priority>
${LANGS.map(l => `    <xhtml:link rel="alternate" hreflang="${T[l].meta.hreflang}" href="${abs(loc(l, path))}"/>`).join("\n")}
    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(loc(DEF, path))}"/>
  </url>`)).join("\n")}
</urlset>
`);

/* robots.txt — search engines and AI assistants are welcome; private pages are not indexed */
const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "meta-externalagent", "Bingbot", "Googlebot"];
const privatePaths = LANGS.map(l => `Disallow: ${prefix(l)}/account`).join("\n");
write("robots.txt", `User-agent: *
Allow: /
${privatePaths}

# Search engines and AI assistants (ChatGPT, Claude, Perplexity, Gemini, Apple, Meta) are welcome to read and recommend this site.
${AI_BOTS.map(b => `User-agent: ${b}`).join("\n")}
Allow: /
${privatePaths}

Sitemap: ${abs("/sitemap.xml")}
`);

/* llms.txt — a plain summary for AI assistants (https://llmstxt.org) */
{
  const en = T.en, p = built.en.full(PRODUCTS[0]);
  const he = T.he ? built.he.full(PRODUCTS[0]) : null;
  const facts = Object.values(en.story.facts).map(([k, v]) => `- ${k}: ${fill(v, { price: money(p.price), withAccount: ACC ? en.story.withAccount : "" })}`).join("\n");
  const qa = built.en.faqItems().map(([q, a]) => `### ${q}\n${a}`).join("\n\n");
  write("llms.txt", `# ${SITE.brand}

> ${en.site.description}

${facts}
${ACC ? `- Bonus programme: optional free account; ${RATE}% of each paid order comes back as bonus coins (1 coin = ₪1)\n` : ""}- Ordering: no account needed; nothing is charged until the order is confirmed, then a secure payment link is sent
- Website languages: English and Hebrew
${sameAs.length ? `- Social: ${sameAs.join(", ")}\n` : ""}
## Shop
- [${p.name}](${abs(pPath(p))}): ${p.seoDesc}
${he ? `- [${he.name} — Hebrew](${abs(loc("he", pPath(p)))}): ${he.seoDesc}\n` : ""}
## About
- [Story](${abs("/story")}): ${en.story.desc}
- [FAQ](${abs("/faq")}): ${en.faq.desc}
${he ? `- [עברית — דף הבית](${abs(loc("he", "/"))}): ${T.he.site.description}\n` : ""}
## Policies
- [Shipping & returns](${abs("/shipping")}): free courier across Israel, ${en.site.leadTime.toLowerCase()}, cancellation under Israel’s Consumer Protection Law
- [Terms](${abs("/terms")})
- [Privacy](${abs("/privacy")})

## Questions people ask

${qa}
`);
}

/* IndexNow key file (Bing, Yandex, and the search engines that share their index) */
if (SITE.seo.indexNowKey) write(`${SITE.seo.indexNowKey}.txt`, SITE.seo.indexNowKey);

console.log(`built ${LANGS.length} languages × ${PAGES.length} pages (+ account, 404) → ${OUT}${ACC ? " · accounts ON" : " · accounts off (no Supabase keys)"}`);
