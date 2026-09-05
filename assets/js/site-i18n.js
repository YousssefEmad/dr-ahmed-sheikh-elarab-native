/**
 * Home EN/AR i18n — no Google Translate.
 * Uses embedded home-i18n.json (AH_HOME_I18N) + [data-i18n] / [data-i18n-html].
 */
(function () {
  var KEY = "ah-lang";
  var DICT = window.AH_HOME_I18N || null;
  var NAV = [
    { href: "index.html", key: "nav.home" },
    { href: "about.html", key: "nav.about" },
    { href: "specialties.html", key: "nav.specialties" },
    { href: "services.html", key: "nav.services" },
    { href: "reviews.html", key: "nav.reviews" },
    { href: "contact.html", key: "nav.contact" },
    { href: "blogs.html", key: "nav.blogs" },
  ];

  function getLang() {
    try {
      var saved = localStorage.getItem(KEY);
      if (saved === "ar" || saved === "en") return saved;
    } catch (e) {}
    return "en";
  }

  function t(key, lang) {
    if (!DICT || !DICT[key]) return null;
    var entry = DICT[key];
    return entry[lang] || entry.en || entry.ar || null;
  }

  function applyDir(lang) {
    var dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.documentElement.setAttribute("translate", "no");
    document.documentElement.classList.toggle("lang-ar", lang === "ar");
    document.documentElement.classList.toggle("lang-en", lang === "en");
    if (document.body) {
      document.body.dir = dir;
      document.body.lang = lang;
      document.body.classList.toggle("lang-ar", lang === "ar");
      document.body.classList.toggle("lang-en", lang === "en");
      document.body.setAttribute("translate", "no");
      document.body.classList.add("notranslate");
    }
  }

  function applyLangOnly(lang) {
    document.querySelectorAll("[data-lang-only]").forEach(function (el) {
      var show = el.getAttribute("data-lang-only") === lang;
      el.style.display = show ? "" : "none";
    });
  }

  function applyForm(lang) {
    var dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll(".ah-contact-form").forEach(function (el) {
      el.dir = dir;
      el.lang = lang === "ar" ? "ar" : "en";
    });
  }

  function applyValue(el, val) {
    if (val == null || val === "") return;
    if (el.hasAttribute("data-i18n-html") || /<[a-z][\s\S]*>/i.test(val)) {
      el.innerHTML = val;
    } else {
      el.textContent = val;
    }
  }

  function applyDataI18n(lang) {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      applyValue(el, t(el.getAttribute("data-i18n"), lang));
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var val = t(el.getAttribute("data-i18n-placeholder"), lang);
      if (val != null) el.placeholder = val;
    });

    document.querySelectorAll("[data-i18n-value]").forEach(function (el) {
      var val = t(el.getAttribute("data-i18n-value"), lang);
      if (val != null) el.value = val;
    });

    document.querySelectorAll("[data-ar][data-en]").forEach(function (el) {
      if (el.hasAttribute("data-i18n")) return;
      var ar = el.getAttribute("data-ar");
      var en = el.getAttribute("data-en");
      if (!ar || !en) return;
      el.textContent = lang === "ar" ? ar : en;
    });
  }

  function updateMenu(lang) {
    var list = document.getElementById("menu-header-menu");
    if (list) {
      NAV.forEach(function (item) {
        var label = t(item.key, lang);
        if (!label) return;
        list.querySelectorAll('a[href="' + item.href + '"]').forEach(function (a) {
          if (a.getAttribute("data-lang") || a.getAttribute("data-gt-lang")) return;
          a.textContent = label;
        });
      });
    }

    document.querySelectorAll("[data-lang]").forEach(function (el) {
      var code = el.getAttribute("data-lang");
      el.classList.toggle("active", code === lang);
      el.classList.toggle("is-active", code === lang);
      if (el.tagName !== "BUTTON") {
        el.style.opacity = code === lang ? "1" : "0.55";
      }
    });
  }

  function closeSidebarMenu() {
    document.body.classList.remove("menu-is-opened");
    document.body.classList.add("menu-is-closed");
    if (window.jQuery) {
      window.jQuery(".menu-list ul").slideUp(300);
    }
  }

  function initSidebarMenu() {
    var closeBtn = document.querySelector(".sidebar-menu .close-menu");
    if (closeBtn) {
      closeBtn.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          closeBtn.click();
        }
      });
    }
  }

  function initHomeWidgets() {
    var fab = document.getElementById("ah-chaty-fab");
    var toggle = document.getElementById("ah-chaty-toggle");
    if (!fab || !toggle) return;

    var smileSvg =
      '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4.5C4 3.67 4.67 3 5.5 3h13c.83 0 1.5.67 1.5 1.5v11c0 .83-.67 1.5-1.5 1.5H9.2L5.4 20.2c-.45.34-1.1.02-1.1-.52V4.5z" fill="#fff"/><path d="M8.2 11.2c1.6 1.5 4.4 1.5 6 0" stroke="#111" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg>';

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = fab.classList.toggle("is-open");
      toggle.innerHTML = open
        ? '<span class="ah-chaty-fab__x">×</span>'
        : smileSvg;
      var cta = fab.querySelector(".ah-chaty-fab__cta");
      if (cta) cta.style.display = open ? "none" : "";
    });

    document.addEventListener("click", function (e) {
      if (!fab.contains(e.target)) {
        fab.classList.remove("is-open");
        toggle.innerHTML = smileSvg;
        var cta = fab.querySelector(".ah-chaty-fab__cta");
        if (cta) cta.style.display = "";
      }
    });
  }

  function refreshReviewCarousel(lang) {
    setTimeout(function () {
      var $ = window.jQuery;
      if (!$ || !$.fn.owlCarousel) return;
      var $c = $(".review-carousel");
      if (!$c.length) return;
      var isRtl = lang === "ar";
      var opts = {
        responsive: { 0: { items: 1 }, 720: { items: 1 }, 1280: { items: 1 } },
        responsiveRefreshRate: 0,
        nav: true,
        navText: [],
        animateIn: "fadeIn",
        dots: false,
        rtl: isRtl,
      };
      if ($c.hasClass("owl-loaded")) {
        $c.trigger("destroy.owl.carousel");
        $c.removeClass("owl-loaded owl-hidden");
      }
      $c.owlCarousel(opts);
    }, 80);
  }

  function setLang(lang) {
    if (lang !== "ar" && lang !== "en") return;
    try {
      localStorage.setItem(KEY, lang);
    } catch (e) {}
    applyDir(lang);
    applyDataI18n(lang);
    applyLangOnly(lang);
    applyForm(lang);
    updateMenu(lang);
    refreshReviewCarousel(lang);
    window.dispatchEvent(
      new CustomEvent("ah-lang-change", { detail: { lang: lang } })
    );
  }

  window.ahSetLang = setLang;
  window.ahGetLang = getLang;
  window.doGTranslate = function () {};

  document.addEventListener(
    "click",
    function (e) {
      var a = e.target.closest && e.target.closest("[data-lang]");
      if (!a) return;
      var lang = a.getAttribute("data-lang");
      if (lang !== "ar" && lang !== "en") return;
      e.preventDefault();
      e.stopPropagation();
      setLang(lang);
      closeSidebarMenu();
    },
    true
  );

  function dictUrl() {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute("src") || "";
      if (src.indexOf("site-i18n.js") !== -1) {
        return src.replace(/site-i18n\.js.*$/, "home-i18n.json");
      }
    }
    return "assets/js/home-i18n.json";
  }

  function initContactForm() {
    var form = document.querySelector(".ah-contact-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (form.querySelector('[name="name"]') || {}).value || "";
      var email = (form.querySelector('[name="email"]') || {}).value || "";
      var subject = (form.querySelector('[name="subject"]') || {}).value || "";
      var message = (form.querySelector('[name="text"]') || {}).value || "";
      var text = [name, email, subject, message].filter(Boolean).join("\n");
      window.open(
        "https://wa.me/201554239529?text=" + encodeURIComponent(text),
        "_blank",
        "noopener"
      );
    });
  }

  function start() {
    setLang(getLang());
    initHomeWidgets();
    initSidebarMenu();
    initContactForm();
  }

  function boot() {
    applyDir(getLang());
    if (DICT) {
      start();
      return;
    }
    fetch(dictUrl())
      .then(function (r) {
        return r.json();
      })
      .then(function (json) {
        DICT = json;
        start();
      })
      .catch(function () {
        applyDir(getLang());
        updateMenu(getLang());
        initHomeWidgets();
        initSidebarMenu();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
