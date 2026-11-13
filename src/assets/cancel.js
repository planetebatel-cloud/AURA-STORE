/* Cancellation form: builds a written cancellation notice and hands it to WhatsApp, email or the clipboard.
   Nothing is stored on the site. */
(function () {
  var C = window.CANCEL, f = document.getElementById("cancel-form");
  if (!C || !f) return;
  var err = document.getElementById("cancel-err"), done = document.getElementById("cancel-done");
  f.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = function (n) { return (f.elements[n].value || "").trim(); };
    if (!v("name") || !v("phone")) { err.textContent = C.missing; err.hidden = false; f.elements[v("name") ? "phone" : "name"].focus(); return; }
    err.hidden = true;
    var L = C.labels, lines = [C.head, "", L.name + ": " + v("name"), L.phone + ": " + v("phone")];
    if (v("order")) lines.push(L.order + ": " + v("order"));
    if (v("email")) lines.push(L.email + ": " + v("email"));
    if (v("reason")) lines.push(L.reason + ": " + v("reason"));
    lines.push(new Date().toLocaleDateString("en-GB"));
    var text = lines.join("\n"), via = (e.submitter && e.submitter.dataset.via) || (C.wa ? "wa" : C.mail ? "mail" : "copy");
    if (via === "wa" && C.wa) window.open("https://wa.me/" + C.wa + "?text=" + encodeURIComponent(text), "_blank", "noopener");
    else if (via === "mail" && C.mail) location.href = "mailto:" + C.mail + "?subject=" + encodeURIComponent(C.subject) + "&body=" + encodeURIComponent(text);
    else {
      var ok = function () { done.textContent = C.copied; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, function () { window.prompt(C.subject, text); });
      else window.prompt(C.subject, text);
    }
  });
})();
