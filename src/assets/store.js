/* LA ELEGANT storefront runtime: walking media, bag, checkout, product page. */
(function () {
  const S = window.SHOP || { products: [], shipping: [], checkout: {} };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const money = n => "₪" + Number(n).toLocaleString("en-US");
  const byId = id => S.products.find(p => p.id === id);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const hasIO = "IntersectionObserver" in window;

  /* ---------- toast ---------- */
  const toastEl = $("#toast");
  let toastTimer = 0;
  function toast(text, action) {
    if (!toastEl) return;
    toastEl.innerHTML = `<span>${esc(text)}</span>` + (action ? `<button type="button">${esc(action.label)}</button>` : "");
    if (action) $("button", toastEl).addEventListener("click", () => { toastEl.hidden = true; action.run(); });
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 3600);
  }

  /* ---------- wordmarks fit the full width ---------- */
  function fitAll() {
    $$("[data-fit]").forEach(el => {
      const host = el.parentElement;
      const cs = getComputedStyle(host);
      const box = host.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (!box) return;
      el.style.fontSize = "100px";
      const w = el.scrollWidth;
      if (w) el.style.fontSize = (100 * box * 0.995 / w) + "px";
    });
  }
  fitAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  let rz = 0;
  addEventListener("resize", () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(fitAll); });

  /* ---------- header: brand appears after the hero wordmark scrolls away ---------- */
  const heroWord = $(".hero-word");
  if (heroWord && hasIO) {
    new IntersectionObserver(([e]) => document.body.classList.toggle("scrolled", !e.isIntersecting), { rootMargin: "-64px 0px 0px 0px" }).observe(heroWord);
  } else {
    document.body.classList.add("scrolled");
  }

  /* ---------- mobile menu ---------- */
  const menuBtn = $("#menu-btn"), menu = $("#menu");
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.textContent = open ? "Close" : "Menu";
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
    $$("a", menu).forEach(a => a.addEventListener("click", () => setMenu(false)));
  }

  /* ---------- walking media ---------- */
  const walkers = $$(".walk").map(el => ({ el, v: $("video", el), src: el.dataset.video, auto: el.classList.contains("is-auto"), playing: false }));
  function load(w) { if (w.v && !w.v.getAttribute("src")) { w.v.src = w.src; w.v.preload = "auto"; } }
  function play(w) {
    if (reduce || !w.v || w.el.classList.contains("no-walk")) return;
    load(w); w.playing = true;
    const p = w.v.play(); if (p && p.catch) p.catch(() => {});
  }
  function stop(w) {
    if (!w.v) return;
    w.playing = false; w.el.classList.remove("is-walking"); w.v.pause();
    setTimeout(() => { if (!w.playing) { try { w.v.currentTime = 0; } catch (e) {} } }, 420);
  }
  walkers.forEach(w => w.v && w.v.addEventListener("playing", () => { if (w.playing) w.el.classList.add("is-walking"); }));

  const autos = walkers.filter(w => w.auto), cards = walkers.filter(w => !w.auto);
  if (hasIO) {
    const vis = new IntersectionObserver(es => es.forEach(e => {
      const w = autos.find(x => x.el === e.target);
      e.isIntersecting ? play(w) : stop(w);
    }), { threshold: 0.2 });
    autos.forEach(w => vis.observe(w.el));
    if (!saveData) {
      const pre = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) { load(cards.find(x => x.el === e.target)); pre.unobserve(e.target); }
      }), { rootMargin: "50% 0px" });
      cards.forEach(w => pre.observe(w.el));
    }
  } else {
    autos.forEach(play);
  }
  if (canHover) {
    cards.forEach(w => {
      w.el.addEventListener("pointerenter", () => play(w));
      w.el.addEventListener("pointerleave", () => stop(w));
      w.el.addEventListener("focusin", () => play(w));
      w.el.addEventListener("focusout", e => { if (!w.el.contains(e.relatedTarget)) stop(w); });
    });
  } else if (hasIO) {
    const center = new IntersectionObserver(es => es.forEach(e => {
      const w = cards.find(x => x.el === e.target);
      e.isIntersecting ? play(w) : stop(w);
    }), { rootMargin: "-35% 0px -35% 0px" });
    cards.forEach(w => center.observe(w.el));
  }

  /* ---------- bag ---------- */
  const KEY = "le-bag";
  let bag = [];
  const validSizes = l => { const p = byId(l.id); return p && l.sizes && p.sizeGroups.every(g => g.sizes.includes(l.sizes[g.key])); };
  const sizeKey = sz => JSON.stringify(sz || {});
  const sizeText = (p, sz) => p.sizeGroups.map(g => `${g.short} ${sz[g.key]}`).join(" · ");
  try { bag = JSON.parse(localStorage.getItem(KEY) || "[]").filter(l => validSizes(l) && l.qty > 0); } catch (e) { bag = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(bag)); } catch (e) {} };
  const itemsCount = () => bag.reduce((s, l) => s + l.qty, 0);
  const subtotal = () => bag.reduce((s, l) => s + byId(l.id).price * l.qty, 0);
  function renderCount() { const c = $("#bag-count"); if (c) c.textContent = itemsCount(); }
  function add(id, sizes) {
    const l = bag.find(x => x.id === id && sizeKey(x.sizes) === sizeKey(sizes));
    if (l) l.qty++; else bag.push({ id, sizes, qty: 1 });
    save(); renderCount();
  }
  renderCount();

  const drawer = $("#bag"), scrim = $("#scrim");
  let lastFocus = null;
  const views = {
    cart: ["#v-cart", "#f-cart"], details: ["#v-details", "#f-details"], done: ["#v-done"]
  };
  function show(view) {
    Object.values(views).flat().forEach(s => { const el = $(s); if (el) el.hidden = true; });
    views[view].forEach(s => { const el = $(s); if (el) el.hidden = false; });
    $("#bag-title").textContent = view === "details" ? "Checkout" : view === "done" ? "Thank you" : "Bag";
    if (view === "cart") renderCart();
    if (view === "details") renderDetails();
    const scroller = $(views[view][0]); if (scroller) scroller.scrollTop = 0;
  }
  function openBag(view = "cart") {
    if (!drawer) return;
    lastFocus = document.activeElement;
    show(view);
    scrim.hidden = false; drawer.hidden = false;
    document.documentElement.style.overflow = "hidden";
    const x = $(".x", drawer); if (x) x.focus();
  }
  function closeBag() {
    if (!drawer || drawer.hidden) return;
    drawer.hidden = true; scrim.hidden = true;
    document.documentElement.style.overflow = "";
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }
  if (drawer) {
    $("#bag-open").addEventListener("click", () => openBag("cart"));
    scrim.addEventListener("click", closeBag);
    drawer.addEventListener("click", e => { if (e.target.closest("[data-close]")) closeBag(); });
    drawer.addEventListener("keydown", e => {
      if (e.key !== "Tab") return;
      const f = $$("a[href], button, input, textarea, select", drawer).filter(el => !el.disabled && el.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
  }
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeBag(); setMenu(false); } });

  function renderCart() {
    const box = $("#v-cart"), foot = $("#f-cart");
    if (!bag.length) {
      const first = S.products[0];
      box.innerHTML = `<div class="empty"><p>Your bag is empty.</p><a class="btn ghost" href="/products/${first ? first.slug : ""}" data-close>Shop the set</a></div>`;
      foot.hidden = true;
      return;
    }
    foot.hidden = false;
    box.innerHTML = bag.map((l, i) => {
      const p = byId(l.id), url = "/products/" + p.slug;
      return `<div class="line">
        <a class="thumb" href="${url}" tabindex="-1"><img src="/${p.poster}" alt=""></a>
        <div class="line-info">
          <div class="line-top"><a href="${url}">${esc(p.name)}</a><span class="price">${money(p.price * l.qty)}</span></div>
          <span class="line-sub">${esc(p.color)}</span>
          <span class="line-sub">${esc(sizeText(p, l.sizes))}</span>
          <div class="qty">
            <button type="button" data-q="${i}" data-d="1" aria-label="Add one">+</button>
            <output aria-label="Quantity">${l.qty}</output>
            <button type="button" data-q="${i}" data-d="-1" aria-label="Remove one">−</button>
            <button type="button" class="rm" data-rm="${i}">Remove</button>
          </div>
        </div>
      </div>`;
    }).join("");
    $("#c-sub").textContent = money(subtotal());
  }
  if (drawer) {
    $("#v-cart").addEventListener("click", e => {
      const q = e.target.closest("[data-q]"), rm = e.target.closest("[data-rm]");
      if (q) { const l = bag[+q.dataset.q]; l.qty += +q.dataset.d; if (l.qty < 1) bag.splice(+q.dataset.q, 1); }
      else if (rm) bag.splice(+rm.dataset.rm, 1);
      else return;
      save(); renderCount(); renderCart();
    });
    $("#to-details").addEventListener("click", () => { show("details"); const n = $("#o-name"); if (n) n.focus(); });
    $("#back-cart").addEventListener("click", () => show("cart"));
  }

  /* ---------- checkout ---------- */
  function shipChoice() { const r = $('input[name="ship"]:checked'); return S.shipping.find(s => s.id === (r && r.value)) || S.shipping[0]; }
  function renderDetails() {
    const ship = $("#o-ship");
    if (ship && !ship.children.length) {
      ship.innerHTML = S.shipping.map((s, i) => `<label><span class="ship-txt"><span>${esc(s.label)}</span>${s.note ? `<small>${esc(s.note)}</small>` : ""}</span>
        <span>${s.price == null ? "" : s.price ? `<span class="price">${money(s.price)}</span>` : "Complimentary"} <input type="radio" name="ship" value="${esc(s.id)}"${i ? "" : " checked"}></span></label>`).join("");
      ship.addEventListener("change", () => { toggleAddress(); renderSum(); });
    }
    toggleAddress(); renderSum();
  }
  function toggleAddress() { const a = $("#o-address"); if (a) a.hidden = shipChoice() && shipChoice().id === "pickup"; }
  function renderSum() {
    const s = shipChoice(), sub = subtotal();
    const shipTxt = !s ? "" : s.price == null ? "Confirmed with order" : s.price ? money(s.price) : "Complimentary";
    const total = sub + (s && s.price ? s.price : 0);
    $("#o-sum").innerHTML = `
      <div><span>Subtotal</span><span class="price">${money(sub)}</span></div>
      <div><span>Delivery</span><span class="mutedv">${shipTxt}</span></div>
      <div class="total ruled"><span>Total</span><span><span class="price">${money(total)}</span>${s && s.price == null ? ' <small class="mutedv">+ delivery</small>' : ""}</span></div>`;
  }

  function fieldErr(input, msg) {
    const p = input.parentElement.querySelector(".err");
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (p) { p.textContent = msg || ""; p.hidden = !msg; }
    return !msg;
  }
  function normPhone(v) {
    let d = String(v).replace(/[^\d+]/g, "");
    if (d.startsWith("+972")) d = "0" + d.slice(4);
    else if (d.startsWith("972")) d = "0" + d.slice(3);
    return d;
  }
  const form = $("#v-details");
  if (form) {
    $$("input", form).forEach(i => i.addEventListener("input", () => { if (i.getAttribute("aria-invalid") === "true") fieldErr(i, ""); }));
    $("#o-terms").addEventListener("change", () => { $("#o-terms-err").hidden = true; });
    form.addEventListener("submit", e => {
      e.preventDefault();
      const name = $("#o-name"), phone = $("#o-phone"), email = $("#o-email"), city = $("#o-city"), street = $("#o-street");
      const needAddr = !$("#o-address").hidden;
      const checks = [
        fieldErr(name, name.value.trim().length < 2 ? "Enter your full name" : ""),
        fieldErr(phone, /^0(5\d{8}|[2-9]\d{7})$/.test(normPhone(phone.value)) ? "" : "Enter an Israeli phone number, e.g. 050-1234567"),
        fieldErr(email, !email.value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()) ? "" : "That email address doesn’t look right"),
        needAddr ? fieldErr(city, city.value.trim() ? "" : "Enter your city") : true,
        needAddr ? fieldErr(street, street.value.trim() ? "" : "Enter street and number") : true
      ];
      const terms = $("#o-terms").checked;
      $("#o-terms-err").hidden = terms;
      if (checks.includes(false) || !terms) {
        const bad = form.querySelector('[aria-invalid="true"]') || $("#o-terms");
        bad.focus();
        return;
      }
      placeOrder({
        name: name.value.trim(), phone: normPhone(phone.value), email: email.value.trim(),
        city: city.value.trim(), street: street.value.trim(), apt: $("#o-apt").value.trim(),
        notes: $("#o-notes").value.trim(), ship: shipChoice(), needAddr
      });
    });
  }

  function orderText(o) {
    const lines = o.items.map(l => `• ${l.name} (${l.color}) · ${l.sizeText} · ×${l.qty} · ${money(l.price * l.qty)}`);
    const shipTxt = o.ship.price == null ? "confirmed with order" : o.ship.price ? money(o.ship.price) : "complimentary";
    return [
      `Hi! A new order from ${S.brand}`,
      `Order no: ${o.id}`,
      "",
      ...lines,
      "",
      `Subtotal: ${money(o.subtotal)}`,
      `Delivery: ${o.ship.label} (${shipTxt})`,
      `Total: ${money(o.total)}${o.ship.price == null ? " + delivery" : ""}`,
      "",
      ...[
        `Name: ${o.customer.name}`,
        `Phone: ${o.customer.phone}`,
        o.customer.email ? `Email: ${o.customer.email}` : "",
        o.customer.needAddr ? `Address: ${[o.customer.street, o.customer.city, o.customer.apt].filter(Boolean).join(", ")}` : "",
        o.customer.notes ? `Notes: ${o.customer.notes}` : ""
      ].filter(Boolean)
    ].join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  function placeOrder(c) {
    const err = $("#o-err");
    const items = bag.map(l => { const p = byId(l.id); return { id: p.id, name: p.name, color: p.color, sizes: l.sizes, sizeText: sizeText(p, l.sizes), qty: l.qty, price: p.price }; });
    const sub = subtotal();
    const order = {
      id: "LE-" + Date.now().toString(36).slice(-5).toUpperCase(),
      items, subtotal: sub, ship: c.ship, total: sub + (c.ship.price || 0), customer: c, at: new Date().toISOString()
    };
    const text = orderText(order);
    err.hidden = true;

    /* Payment hook: when a payment provider is connected, branch on S.checkout.mode here
       (e.g. create the payment session with `order` and redirect to it). */
    if (S.checkout && S.checkout.endpoint) {
      try {
        fetch(S.checkout.endpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(order) }).catch(() => {});
      } catch (e) {}
    }
    const waBtn = $("#d-wa"), copyBtn = $("#d-copy");
    $("#d-num").textContent = "Order " + order.id;
    $("#d-msg").textContent = text;
    if (S.whatsapp) {
      const url = "https://wa.me/" + S.whatsapp + "?text=" + encodeURIComponent(text);
      try { window.open(url, "_blank", "noopener"); } catch (e) {}
      $("#d-title").textContent = "One last step";
      $("#d-text").textContent = "WhatsApp opens with your order. Send the message and we’ll confirm your sizes and delivery date, then send a secure payment link.";
      waBtn.href = url; waBtn.hidden = false; copyBtn.hidden = true;
    } else {
      $("#d-title").textContent = "Your order is ready";
      $("#d-text").textContent = "Copy your order and send it to the La Elegant team. We’ll confirm your sizes and delivery date, then send a secure payment link. Nothing has been charged.";
      waBtn.hidden = true; copyBtn.hidden = false;
      copyBtn.onclick = async () => {
        try { await navigator.clipboard.writeText(text); copyBtn.textContent = "Copied"; }
        catch (e) { const r = document.createRange(); r.selectNodeContents($("#d-msg")); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); copyBtn.textContent = "Selected — copy it"; }
      };
    }
    bag = []; save(); renderCount();
    show("done");
  }

  /* ---------- product page ---------- */
  const pdp = $(".pdp");
  if (pdp) {
    const p = byId(pdp.dataset.product);
    const buy = $("#buy");
    const picked = key => { const r = $(`input[name="size-${key}"]:checked`, buy); return r ? r.value : ""; };
    buy.addEventListener("change", e => { const g = e.target.closest("[data-group]"); if (g) $(`[data-err="${g.dataset.group}"]`, buy).hidden = true; });
    const addNow = () => {
      const sizes = {};
      let missing = null;
      p.sizeGroups.forEach(g => {
        sizes[g.key] = picked(g.key);
        const e = $(`[data-err="${g.key}"]`, buy);
        e.hidden = !!sizes[g.key];
        if (!sizes[g.key] && !missing) missing = g.key;
      });
      if (missing) {
        const set = $(`[data-group="${missing}"]`, buy);
        set.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        const f = $("input", set); if (f) f.focus({ preventScroll: true });
        return;
      }
      add(p.id, sizes);
      openBag("cart");
    };
    buy.addEventListener("submit", e => { e.preventDefault(); addNow(); });
    const bb = $("#buybar-btn"); if (bb) bb.addEventListener("click", addNow);

    const img = $("#pdp-img"), frameW = walkers.find(w => w.el.classList.contains("pdp-frame"));
    $$(".thumbs button").forEach((t, i) => t.addEventListener("click", () => {
      $$(".thumbs button").forEach(x => x.removeAttribute("aria-current"));
      t.setAttribute("aria-current", "true");
      img.src = t.dataset.src;
      if (frameW) {
        frameW.el.classList.toggle("no-walk", i > 0);
        i > 0 ? stop(frameW) : play(frameW);
      }
    }));
  }

  /* ---------- share ---------- */
  document.addEventListener("click", async e => {
    if (!e.target.closest("[data-share]")) return;
    const url = location.href.split("#")[0];
    try {
      if (navigator.share && !canHover) { await navigator.share({ title: document.title, url }); return; }
      await navigator.clipboard.writeText(url);
      toast("Link copied");
    } catch (err) {
      if (err && err.name === "AbortError") return;
      toast(url);
    }
  });
})();
