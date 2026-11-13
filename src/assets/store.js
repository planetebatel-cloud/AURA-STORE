/* LA ELEGANT storefront runtime: walking media, bag, checkout (guest or signed in), bonus coins, product page. */
(function () {
  const S = window.SHOP || { products: [], shipping: [], checkout: {}, t: {} };
  const t = S.t || {};
  const L = S.prefix || "";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const money = n => "₪" + Number(n).toLocaleString("en-US");
  const fill = (s, o) => String(s || "").replace(/\{(\w+)\}/g, (m, k) => (k in o ? o[k] : m));
  const byId = id => S.products.find(p => p.id === id);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const hasIO = "IntersectionObserver" in window;
  const priceSpan = n => `<span class="price" dir="ltr">${money(n)}</span>`;

  /* ---------- accounts (Supabase), loaded only when needed ---------- */
  const AUTH = (function () {
    const A = S.accounts;
    if (!A || !A.url || !A.key) return null;
    let clientP = null;
    function lib() {
      if (window.supabase && window.supabase.createClient) return Promise.resolve(window.supabase);
      return new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = A.lib; s.async = true;
        s.onload = () => res(window.supabase); s.onerror = rej;
        document.head.appendChild(s);
      });
    }
    function client() {
      if (!clientP) clientP = lib().then(sb => sb.createClient(A.url, A.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "implicit" } }));
      return clientP;
    }
    function hasSession() {
      try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/^sb-.*-auth-token$/.test(k)) return true; } } catch (e) {}
      return false;
    }
    async function me() {
      if (!hasSession()) return null;
      try {
        const c = await client();
        const { data } = await c.auth.getSession();
        const user = data && data.session && data.session.user;
        if (!user) return null;
        const [prof, bal] = await Promise.all([
          c.from("profiles").select("full_name, phone, city, street, apt").eq("id", user.id).maybeSingle(),
          c.rpc("my_bonus_balance")
        ]);
        return { user, profile: (prof && prof.data) || {}, balance: (bal && typeof bal.data === "number") ? bal.data : 0 };
      } catch (e) { return null; }
    }
    return { client, hasSession, me, conf: A };
  })();
  window.LE_AUTH = AUTH;

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
  window.LE_TOAST = toast;

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
    menuBtn.textContent = open ? (menuBtn.dataset.close || "Close") : (menuBtn.dataset.open || "Menu");
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
    $$("a", menu).forEach(a => a.addEventListener("click", () => setMenu(false)));
  }

  /* ---------- walking media ---------- */
  const walkers = $$(".walk").map(el => ({ el, v: $("video", el), src: el.dataset.video, auto: el.classList.contains("is-auto"), playing: false }));
  function load(w) { if (w && w.v && !w.v.getAttribute("src")) { w.v.src = w.src; w.v.preload = "auto"; } }
  function play(w) {
    if (!w || reduce || !w.v || w.el.classList.contains("no-walk")) return;
    load(w); w.playing = true;
    const p = w.v.play(); if (p && p.catch) p.catch(() => {});
  }
  function stop(w) {
    if (!w || !w.v) return;
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
  const views = { cart: ["#v-cart", "#f-cart"], details: ["#v-details", "#f-details"], done: ["#v-done"] };
  function show(view) {
    Object.values(views).flat().forEach(s => { const el = $(s); if (el) el.hidden = true; });
    views[view].forEach(s => { const el = $(s); if (el) el.hidden = false; });
    $("#bag-title").textContent = view === "details" ? t.checkout : view === "done" ? t.thanks : t.bag;
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
    // Coming back from the account page with "?bag" / "#bag": reopen the bag.
    if (location.hash === "#bag" && bag.length) { history.replaceState(null, "", location.pathname + location.search); setTimeout(() => openBag(AUTH && AUTH.hasSession() ? "details" : "cart"), 50); }
  }
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeBag(); setMenu(false); } });

  function renderCart() {
    const box = $("#v-cart"), foot = $("#f-cart");
    if (!bag.length) {
      const first = S.products[0];
      box.innerHTML = `<div class="empty"><p>${esc(t.empty)}</p><a class="btn ghost" href="${L}/products/${first ? first.slug : ""}" data-close>${esc(t.shopSet)}</a></div>`;
      foot.hidden = true;
      return;
    }
    foot.hidden = false;
    box.innerHTML = bag.map((l, i) => {
      const p = byId(l.id), url = L + "/products/" + p.slug;
      return `<div class="line">
        <a class="thumb" href="${url}" tabindex="-1"><img src="/${p.poster}" alt=""></a>
        <div class="line-info">
          <div class="line-top"><a href="${url}">${esc(p.name)}</a>${priceSpan(p.price * l.qty)}</div>
          <span class="line-sub">${esc(p.color)}</span>
          <span class="line-sub">${esc(sizeText(p, l.sizes))}</span>
          <div class="qty">
            <button type="button" data-q="${i}" data-d="-1" aria-label="${esc(t.removeOne)}">−</button>
            <output aria-label="${esc(t.qty)}">${l.qty}</output>
            <button type="button" data-q="${i}" data-d="1" aria-label="${esc(t.addOne)}">+</button>
            <button type="button" class="rm" data-rm="${i}">${esc(t.remove)}</button>
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
    $("#to-details").addEventListener("click", () => { show("details"); const n = $("#o-name"); if (n && !n.value) n.focus(); });
    $("#back-cart").addEventListener("click", () => show("cart"));
  }

  /* ---------- checkout ---------- */
  let session = null;          // { user, profile, balance } when signed in
  let sessionLoaded = false;
  function shipChoice() { const r = $('input[name="ship"]:checked'); return S.shipping.find(s => s.id === (r && r.value)) || S.shipping[0]; }
  const useBonus = () => { const c = $("#o-use-bonus"); return !!(c && c.checked && session && session.balance > 0); };
  const bonusAmount = () => (useBonus() ? Math.min(session.balance, subtotal()) : 0);

  function renderDetails() {
    const ship = $("#o-ship");
    if (ship && !ship.children.length) {
      ship.innerHTML = S.shipping.map((s, i) => `<label><span class="ship-txt"><span>${esc(s.label)}</span>${s.note ? `<small>${esc(s.note)}</small>` : ""}</span>
        <span>${s.price == null ? "" : s.price ? priceSpan(s.price) : esc(t.free)} <input type="radio" name="ship" value="${esc(s.id)}"${i ? "" : " checked"}></span></label>`).join("");
      ship.addEventListener("change", () => { toggleAddress(); renderSum(); });
    }
    toggleAddress(); renderSum();
    if (AUTH) loadAccountIntoCheckout();
  }

  async function loadAccountIntoCheckout() {
    const hint = $("#o-acct"), box = $("#o-bonus");
    AUTH.client().catch(() => {});   // warm up the library so placing the order is quick
    if (!sessionLoaded) { session = await AUTH.me(); sessionLoaded = true; }
    if (!session) {
      hint.innerHTML = `<p>${esc(t.signInPrompt)} <a href="${L}/account?from=bag">${esc(t.signIn)}</a></p>`;
      hint.hidden = false; box.hidden = true;
      return;
    }
    hint.innerHTML = `<p>${esc(t.account.signedInAs)} <b dir="ltr">${esc(session.user.email || "")}</b></p>`;
    hint.hidden = false;
    const pr = session.profile || {};
    const set = (id, v) => { const el = $(id); if (el && !el.value && v) el.value = v; };
    set("#o-name", pr.full_name || (session.user.user_metadata && session.user.user_metadata.full_name));
    set("#o-phone", pr.phone); set("#o-email", session.user.email); set("#o-city", pr.city); set("#o-street", pr.street); set("#o-apt", pr.apt);
    if (session.balance > 0) {
      box.innerHTML = `<label class="check bonus-use"><input type="checkbox" id="o-use-bonus" checked><span>${esc(fill(t.bonusUse, { n: money(session.balance) }))}</span></label>`;
      box.hidden = false;
      $("#o-use-bonus").addEventListener("change", renderSum);
    } else { box.hidden = true; box.innerHTML = ""; }
    renderSum();
  }

  function toggleAddress() { const a = $("#o-address"); if (a) a.hidden = shipChoice() && shipChoice().id === "pickup"; }
  function renderSum() {
    const s = shipChoice(), sub = subtotal(), bonus = bonusAmount();
    const shipTxt = !s ? "" : s.price == null ? esc(t.withOrder) : s.price ? priceSpan(s.price) : esc(t.free);
    const total = sub + (s && s.price ? s.price : 0) - bonus;
    $("#o-sum").innerHTML = `
      <div><span>${esc(t.subtotal)}</span>${priceSpan(sub)}</div>
      <div><span>${esc(t.delivery)}</span><span class="mutedv">${shipTxt}</span></div>
      ${bonus ? `<div><span>${esc(t.bonusLine)}</span><span class="price" dir="ltr">−${money(bonus)}</span></div>` : ""}
      <div class="total ruled"><span>${esc(t.total)}</span><span>${priceSpan(total)}${s && s.price == null ? ` <small class="mutedv">${esc(t.plusDelivery)}</small>` : ""}</span></div>`;
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
  let placing = false;
  if (form) {
    $$("input", form).forEach(i => i.addEventListener("input", () => { if (i.getAttribute("aria-invalid") === "true") fieldErr(i, ""); }));
    $("#o-terms").addEventListener("change", () => { $("#o-terms-err").hidden = true; });
    form.addEventListener("submit", e => {
      e.preventDefault();
      if (placing) return;
      const name = $("#o-name"), phone = $("#o-phone"), email = $("#o-email"), city = $("#o-city"), street = $("#o-street");
      const needAddr = !$("#o-address").hidden;
      const checks = [
        fieldErr(name, name.value.trim().length < 2 ? t.errName : ""),
        fieldErr(phone, /^0(5\d{8}|[2-9]\d{7})$/.test(normPhone(phone.value)) ? "" : t.errPhone),
        fieldErr(email, !email.value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()) ? "" : t.errEmail),
        needAddr ? fieldErr(city, city.value.trim() ? "" : t.errCity) : true,
        needAddr ? fieldErr(street, street.value.trim() ? "" : t.errStreet) : true
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
    const m = t.msg;
    const lines = o.items.map(l => `• ${l.name} (${l.color}) · ${l.sizeText} · ${m.size}${l.qty} · ${money(l.price * l.qty)}`);
    const shipTxt = o.ship.price == null ? t.withOrder : o.ship.price ? money(o.ship.price) : t.free;
    return [
      `${m.hi}${S.lang === "he" ? "" : " "}${S.brand}`,
      `${m.no}: ${o.id}`,
      "",
      ...lines,
      "",
      `${m.sub}: ${money(o.subtotal)}`,
      `${m.del}: ${o.ship.label} (${shipTxt})`,
      o.bonus ? `${m.bonus}: −${money(o.bonus)}` : "",
      `${m.total}: ${money(o.total)}${o.ship.price == null ? " " + t.plusDelivery : ""}`,
      "",
      ...[
        `${m.name}: ${o.customer.name}`,
        `${m.phone}: ${o.customer.phone}`,
        o.customer.email ? `${m.email}: ${o.customer.email}` : "",
        o.customer.needAddr ? `${m.addr}: ${[o.customer.street, o.customer.city, o.customer.apt].filter(Boolean).join(", ")}` : "",
        o.customer.notes ? `${m.notes}: ${o.customer.notes}` : ""
      ].filter(Boolean)
    ].join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  /* Saves the order in the database when accounts are on. Never blocks a sale: on any error we fall back to a local order number. */
  async function saveOrder(order, c) {
    if (!AUTH) return null;
    try {
      const cl = await AUTH.client();
      const contact = { name: c.name, phone: c.phone, email: c.email, city: c.needAddr ? c.city : "", street: c.needAddr ? c.street : "", apt: c.needAddr ? c.apt : "", notes: c.notes, ship: c.ship.id };
      const items = order.items.map(l => ({ id: l.id, qty: l.qty, sizes: l.sizes }));
      const { data, error } = await cl.rpc("place_order", { p_items: items, p_contact: contact, p_ship: c.ship.id, p_use_bonus: useBonus(), p_lang: S.lang });
      if (error || !data) return null;
      if (session) {   // keep the account's details fresh for next time
        cl.from("profiles").update({ full_name: c.name, phone: c.phone, ...(c.needAddr ? { city: c.city, street: c.street, apt: c.apt } : {}) }).eq("id", session.user.id).then(() => {}, () => {});
      }
      return data;
    } catch (e) { return null; }
  }

  async function placeOrder(c) {
    const err = $("#o-err"), btn = $("#o-submit");
    const items = bag.map(l => { const p = byId(l.id); return { id: p.id, name: p.name, color: p.color, sizes: l.sizes, sizeText: sizeText(p, l.sizes), qty: l.qty, price: p.price }; });
    const sub = subtotal();
    const order = {
      id: "LE-" + Date.now().toString(36).slice(-6).toUpperCase(),
      items, subtotal: sub, ship: c.ship, bonus: 0, total: sub + (c.ship.price || 0), customer: c, at: new Date().toISOString()
    };
    err.hidden = true;
    placing = true; btn.disabled = true;

    const saved = await saveOrder(order, c);
    if (saved) { order.id = saved.number; order.bonus = saved.bonus_used || 0; order.total = saved.total; order.earn = saved.bonus_to_earn || 0; order.signedIn = saved.signed_in; }
    const text = orderText(order);

    /* Payment hook: when a payment provider is connected, branch on S.checkout.mode here
       (e.g. create the payment session for `order` / `saved.number` and redirect to it). */
    if (S.checkout && S.checkout.endpoint) {
      try { fetch(S.checkout.endpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(order) }).catch(() => {}); } catch (e) {}
    }
    const waBtn = $("#d-wa"), copyBtn = $("#d-copy");
    $("#d-num").textContent = t.order + " " + order.id;
    $("#d-msg").textContent = text;
    if (S.whatsapp) {
      const url = "https://wa.me/" + S.whatsapp + "?text=" + encodeURIComponent(text);
      if (!AUTH) { try { window.open(url, "_blank", "noopener"); } catch (e) {} }   // without the database step we are still inside the click
      $("#d-title").textContent = t.waTitle;
      $("#d-text").textContent = t.waText;
      waBtn.href = url; waBtn.hidden = false; copyBtn.hidden = true;
    } else {
      $("#d-title").textContent = t.readyTitle;
      $("#d-text").textContent = t.readyText;
      waBtn.hidden = true; copyBtn.hidden = false; copyBtn.textContent = t.copy;
      copyBtn.onclick = async () => {
        try { await navigator.clipboard.writeText(text); copyBtn.textContent = t.copied; }
        catch (e) { const r = document.createRange(); r.selectNodeContents($("#d-msg")); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); copyBtn.textContent = t.selected; }
      };
    }

    // Bonus coins message
    const bn = $("#d-bonus"), ba = $("#d-acct");
    bn.hidden = true; ba.hidden = true;
    if (saved && order.earn > 0) {
      if (order.signedIn) {
        bn.textContent = fill(t.earnAfter, { n: money(order.earn) }); bn.hidden = false;
        if (session) session.balance -= order.bonus;
      } else if (c.email) {
        bn.textContent = fill(t.guestEarn, { withEmail: fill(t.withEmail, { email: c.email }), n: money(order.earn) }); bn.hidden = false;
        ba.href = `${L}/account?email=${encodeURIComponent(c.email)}`; ba.hidden = false;
      }
    }

    bag = []; save(); renderCount();
    placing = false; btn.disabled = false;
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
    $$(".thumbs button").forEach((tb, i) => tb.addEventListener("click", () => {
      $$(".thumbs button").forEach(x => x.removeAttribute("aria-current"));
      tb.setAttribute("aria-current", "true");
      img.src = tb.dataset.src;
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
      toast(t.linkCopied);
    } catch (err) {
      if (err && err.name === "AbortError") return;
      toast(url);
    }
  });
})();
