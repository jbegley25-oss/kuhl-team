// Picks the hero photo for the current subpage and keeps it in sync
// when Next.js navigates between pages without a full reload.
(function () {
  var base = "/kuhl-team/img/heroes/";
  var heroes = {
    "property-management": "alpine-valley",
    "hoa-management": "alpine-lake",
    "vacation-rentals": "glenwood-canyon",
    "buy": "meadow-ridge",
    "sell": "peak-lake",
    "about": "glenwood-canyon",
    "contact": "alpine-valley"
  };

  function apply() {
    var slug = location.pathname.replace(/^\/kuhl-team\/?/, "").split("/")[0];
    var name = heroes[slug] || "alpine-valley";
    var el = document.getElementById("hero-img-style");
    if (!el) {
      el = document.createElement("style");
      el.id = "hero-img-style";
      document.head.appendChild(el);
    }
    el.textContent =
      ":root{--hero-img:url(" + base + name + ".jpg);--hero-img-sm:url(" + base + name + "-sm.jpg)}";
  }

  ["pushState", "replaceState"].forEach(function (fn) {
    var orig = history[fn];
    history[fn] = function () {
      var r = orig.apply(this, arguments);
      apply();
      return r;
    };
  });
  window.addEventListener("popstate", apply);
  apply();

  // ---- Owner Portal button (header + mobile menu) ----
  var PORTAL_URL = "#owner-portal"; // TODO: replace with the real owner portal link

  function makePortal(extraClass) {
    var a = document.createElement("a");
    a.href = PORTAL_URL;
    a.className = "ar-portal" + (extraClass ? " " + extraClass : "");
    a.textContent = "Owner Portal";
    a.setAttribute("data-portal", "");
    if (/^https?:/.test(PORTAL_URL)) { a.target = "_blank"; a.rel = "noopener"; }
    return a;
  }

  function addPortal() {
    var header = document.querySelector("body > header");
    if (!header) return;
    // desktop: just before "Get in touch"
    var cta = [].find.call(header.querySelectorAll("a"), function (a) {
      return /get in touch/i.test(a.textContent) && !a.closest("nav");
    });
    if (cta && !(cta.previousElementSibling && cta.previousElementSibling.hasAttribute("data-portal"))) {
      cta.parentNode.insertBefore(makePortal(), cta);
    }
    // mobile menu panel: before its "Get in touch" button
    [].forEach.call(document.querySelectorAll("a"), function (a) {
      if (a === cta || !/get in touch/i.test(a.textContent) || a.closest("main, footer")) return;
      var prev = a.previousElementSibling;
      if (prev && prev.hasAttribute("data-portal")) return;
      if (a.parentNode.querySelector("[data-portal]")) return;
      a.parentNode.insertBefore(makePortal("ar-portal--menu"), a);
    });
  }

  function start() {
    addPortal();
    new MutationObserver(addPortal).observe(document.body, { childList: true, subtree: true });
  }
  // wait until React has hydrated so the extra button never causes a mismatch
  function later() { setTimeout(start, 400); }
  if (document.readyState === "complete") later();
  else window.addEventListener("load", later);
})();
