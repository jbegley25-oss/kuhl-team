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
})();
