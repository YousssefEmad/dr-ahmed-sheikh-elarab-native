(function ($) {
  var DATA = window.AH || {};
  var KEY = "ah-lang";
  var base = document.documentElement.getAttribute("data-base") || "";
  var page = document.body.getAttribute("data-page") || "";
  var slug = document.body.getAttribute("data-slug") || "";

  function asset(path) {
    if (!path) return "";
    var clean = String(path).replace(/^\//, "").replace(/\?.*$/, "");
    clean = clean
      .replace(/^wp-content\/uploads\//, "assets/images/uploads/")
      .replace(/^wp-content\/plugins\/gtranslate\/flags\/24\//, "assets/images/flags/");
    return base + clean;
  }

  function flag(name) {
    return asset("assets/images/flags/" + name);
  }

  function href(path) {
    if (!path || path === "/") return base + "index.html";
    var pages = {
      "/about": "about.html",
      "/specialties": "specialties.html",
      "/services": "services.html",
      "/reviews": "reviews.html",
      "/contact": "contact.html",
      "/blogs": "blogs.html",
    };
    if (pages[path]) return base + pages[path];
    if (path.indexOf("/specialties/") === 0) {
      return base + "specialties/" + path.split("/").pop() + ".html";
    }
    return base + "articles/" + String(path).replace(/^\//, "").replace(/\/$/, "") + ".html";
  }

  function getLang() {
    try {
      var saved = localStorage.getItem(KEY);
      if (saved === "ar" || saved === "en") return saved;
    } catch (e) {}
    return "en";
  }

  function setLang(lang) {
    if (lang !== "ar" && lang !== "en") return;
    try {
      localStorage.setItem(KEY, lang);
    } catch (e) {}
    applyLang(lang);
    render();
    window.dispatchEvent(new CustomEvent("ah-lang-change", { detail: { lang: lang } }));
    $(document).trigger("ah-lang-change", [lang]);
  }

  function t(ar, en) {
    var isAr = getLang() === "ar";
    var val = isAr ? ar : en;
    if (val == null || val === "") val = isAr ? en : ar;
    return val || "";
  }

  function applyLang(lang) {
    var dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.documentElement.setAttribute("translate", "no");
    document.documentElement.classList.toggle("lang-ar", lang === "ar");
    document.documentElement.classList.toggle("lang-en", lang === "en");
    document.body.dir = dir;
    document.body.lang = lang;
    document.body.classList.toggle("lang-ar", lang === "ar");
    document.body.classList.toggle("lang-en", lang === "en");
    document.body.classList.add("wp-theme-jonny", "notranslate");
    document.body.setAttribute("translate", "no");
    $(".ah-shell, .ah-main").attr({ dir: dir, lang: lang });
  }

  function facebookEmbed(url) {
    try {
      var parsed = new URL(url);
      parsed.search = "";
      parsed.hash = "";
      var hrefUrl = parsed.toString();
      if (!hrefUrl.endsWith("/")) hrefUrl += "/";
      if (/facebook\.com\/share\//i.test(hrefUrl)) return "";
      return (
        "https://www.facebook.com/plugins/video.php?href=" +
        encodeURIComponent(hrefUrl) +
        "&show_text=false&width=267&height=476&t=0"
      );
    } catch (e) {
      return "";
    }
  }

  function tiktokIcon() {
    return (
      '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path fill="currentColor" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.28 0 .54.04.79.1v3.5a6.4 6.4 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.2 8.2 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z"/></svg>'
    );
  }

  function langBtn(active) {
    return (
      "display:inline-flex;align-items:center;gap:6px;background:transparent;border:" +
      (active ? "1px solid #c5a070" : "1px solid rgba(255,255,255,.3)") +
      ";color:" +
      (active === true ? "#c5a070" : "#fff") +
      ";padding:6px 10px;cursor:pointer;"
    );
  }

  function renderHeader() {
    var site = DATA.site || {};
    var nav = DATA.navItems || [];
    var lang = getLang();
    var pathname = location.pathname.replace(/\\/g, "/");
    var links = nav
      .map(function (item) {
        var active =
          item.href === "/"
            ? page === "home" || /\/(index\.html)?$/.test(pathname)
            : pathname.indexOf(item.href) !== -1 || page === item.href.replace("/", "");
        return (
          '<li class="' +
          (active ? "active current-menu-item" : "") +
          '"><a class="notranslate" href="' +
          href(item.href) +
          '">' +
          t(item.ar, item.en) +
          "</a></li>"
        );
      })
      .join("");

    return (
      '<div class="click-capture" aria-hidden="true"></div>' +
      '<div class="sidebar-menu notranslate" translate="no">' +
      '<span class="close-menu icon-cross2 right-boxed" role="button" tabindex="0"></span>' +
      '<div class="menu-lang right-boxed"></div>' +
      '<ul id="menu-header-menu" class="menu-list right-boxed notranslate" translate="no">' +
      links +
      '<li class="menu-item notranslate"><div style="display:flex;gap:12px;align-items:center;margin-top:8px">' +
      '<button type="button" class="ah-set-lang" data-lang="en" style="' +
      langBtn(lang === "en") +
      '"><img src="' +
      flag("en-us.png") +
      '" width="24" height="24" alt="EN"> EN</button>' +
      '<button type="button" class="ah-set-lang" data-lang="ar" style="' +
      langBtn(lang === "ar") +
      '"><img src="' +
      flag("ar.png") +
      '" width="24" height="24" alt="AR"> AR</button>' +
      "</div></li></ul>" +
      '<div class="menu-footer right-boxed notranslate"><div class="social-list">' +
      '<a target="_blank" rel="noreferrer" href="' +
      site.social.instagram +
      '" class="icon fa fa-instagram" aria-label="Instagram"></a>' +
      '<a target="_blank" rel="noreferrer" href="' +
      site.social.facebook +
      '" class="icon ion-social-facebook" aria-label="Facebook"></a>' +
      '<a target="_blank" rel="noreferrer" href="' +
      site.social.tiktok +
      '" class="icon ah-tiktok" aria-label="TikTok">' +
      tiktokIcon() +
      "</a></div><div class=\"copy\">DR. AHMED SHEIKH ELARAB</div></div></div>" +
      '<header class="navbar navbar-2 navbar-white boxed notranslate' +
      (page === "service-detail" ? " navbar-fixed" : "") +
      '" translate="no"><div class="navbar-bg"></div>' +
      '<button type="button" class="navbar-toggle" aria-expanded="false"><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></button>' +
      '<a class="brand" href="' +
      href("/") +
      '"><img class="brand-img" alt="' +
      site.name +
      '" src="' +
      asset(site.logo) +
      '"><div class="brand-info"><div class="brand-name"></div><div class="brand-text"></div></div></a>' +
      '<div class="social-list hidden-xs">' +
      '<a target="_blank" rel="noreferrer" href="' +
      site.social.instagram +
      '" class="icon fa fa-instagram" aria-label="Instagram"></a>' +
      '<a target="_blank" rel="noreferrer" href="' +
      site.social.facebook +
      '" class="icon ion-social-facebook" aria-label="Facebook"></a>' +
      '<a target="_blank" rel="noreferrer" href="' +
      site.social.tiktok +
      '" class="icon ah-tiktok" aria-label="TikTok">' +
      tiktokIcon() +
      "</a></div></header>" +
      '<div class="copy-bottom white boxed notranslate">DR. AHMED SHEIKH ELARAB</div>'
    );
  }

  function renderFooter() {
    var site = DATA.site || {};
    return (
      '<footer class="ah-jonny-footer"><div class="ah-jonny-footer__inner">' +
      "<span>DR. AHMED SHEIKH ELARAB</span>" +
      '<div class="ah-jonny-footer__social">' +
      '<a href="' +
      site.social.instagram +
      '" target="_blank" rel="noreferrer">Instagram</a>' +
      '<a href="' +
      site.social.tiktok +
      '" target="_blank" rel="noreferrer">TikTok</a>' +
      '<a href="' +
      site.social.facebook +
      '" target="_blank" rel="noreferrer">Facebook</a>' +
      '<a href="' +
      site.whatsapp +
      '" target="_blank" rel="noreferrer" dir="ltr">' +
      site.phone +
      "</a></div>" +
      '<a href="' +
      href("/contact") +
      '">' +
      t("تواصل معنا", "Contact") +
      "</a></div></footer>"
    );
  }

  function renderWidgets() {
    var site = DATA.site || {};
    var lang = getLang();
    var phone = (DATA.chatyChannels || []).find(function (c) {
      return c.channel === "Phone";
    });
    var wa = (DATA.chatyChannels || []).find(function (c) {
      return c.channel === "Whatsapp";
    });
    return (
      '<div class="ah-chaty-fab notranslate" translate="no">' +
      '<div class="ah-chaty-fab__channels">' +
      (phone
        ? '<a href="' +
          phone.url +
          '" class="ah-chaty-fab__channel" aria-label="Phone" title="Phone"><img src="' +
          asset(phone.svgPath) +
          '" alt="Phone" width="48" height="48"></a>'
        : "") +
      (wa
        ? '<a href="' +
          site.whatsapp +
          '" target="_blank" rel="noreferrer" class="ah-chaty-fab__channel" aria-label="WhatsApp" title="WhatsApp"><img src="' +
          asset(wa.svgPath) +
          '" alt="WhatsApp" width="48" height="48"></a>'
        : "") +
      "</div>" +
      '<button type="button" class="ah-chaty-fab__btn" aria-label="' +
      t("تواصل معنا", "Contact With Us") +
      '">' +
      '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 4.5C4 3.67 4.67 3 5.5 3h13c.83 0 1.5.67 1.5 1.5v11c0 .83-.67 1.5-1.5 1.5H9.2L5.4 20.2c-.45.34-1.1.02-1.1-.52V4.5z" fill="#fff"/><path d="M8.2 11.2c1.6 1.5 4.4 1.5 6 0" stroke="#111" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg>' +
      "</button>" +
      '<span class="ah-chaty-fab__cta">' +
      t("تواصل معنا", "Contact With Us") +
      "</span></div>" +
      '<div class="ah-lang-home notranslate" translate="no">' +
      '<button type="button" class="ah-set-lang' +
      (lang === "en" ? " is-active" : "") +
      '" data-lang="en"><img src="' +
      flag("en-us.png") +
      '" width="24" height="24" alt="EN"><span>EN</span></button>' +
      '<button type="button" class="ah-set-lang' +
      (lang === "ar" ? " is-active" : "") +
      '" data-lang="ar"><img src="' +
      flag("ar.png") +
      '" width="24" height="24" alt="AR"><span>AR</span></button></div>'
    );
  }

  function reels(urls, title) {
    if (!urls || !urls.length) return "";
    return (
      '<section class="ah-reels">' +
      (title ? '<h3 class="ah-reels__title">' + title + "</h3>" : "") +
      '<div class="ah-reels__grid">' +
      urls
        .map(function (url) {
          var src = facebookEmbed(url);
          return (
            '<div class="ah-reel">' +
            (src
              ? '<iframe src="' +
                src +
                '" title="Facebook Reel" width="267" height="476" style="border:none;overflow:hidden" scrolling="no" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>'
              : "") +
            '<a class="ah-reel__link" href="' +
            url +
            '" target="_blank" rel="noreferrer">' +
            t("مشاهدة على فيسبوك", "Watch on Facebook") +
            "</a></div>"
          );
        })
        .join("") +
      "</div></section>"
    );
  }

  function renderAbout() {
    var about = DATA.about || {};
    var site = DATA.site || {};
    var isAr = getLang() === "ar";
    var intro = isAr ? about.introAr : about.introEn;
    var experience = isAr ? about.experienceAr : about.experienceEn;
    return (
      '<div class="ah-page-hero"><p class="ah-gold">' +
      t(about.titleAr, about.titleEn) +
      "</p><h1>" +
      t(about.titleAr, about.titleEn) +
      "</h1><p>" +
      t(about.subtitleAr, about.subtitleEn) +
      "</p></div>" +
      '<div class="ah-split"><div class="ah-prose">' +
      (intro || []).map(function (p) { return "<p>" + p + "</p>"; }).join("") +
      "<h2>" +
      t(about.experienceTitleAr, about.experienceTitleEn) +
      "</h2><ul>" +
      (experience || []).map(function (item) { return "<li>" + item + "</li>"; }).join("") +
      "</ul>" +
      '<div class="ah-box"><h3>' +
      t(about.visionTitleAr, about.visionTitleEn) +
      "</h3><p>" +
      t(about.visionAr, about.visionEn) +
      "</p></div>" +
      '<div class="ah-box"><h3>' +
      t(about.missionTitleAr, about.missionTitleEn) +
      "</h3><p>" +
      t(about.missionAr, about.missionEn) +
      "</p></div></div>" +
      "<div><img src=\"" +
      asset(about.image) +
      '" alt="' +
      site.name +
      '"><p style="margin-top:1rem"><a class="ah-btn" href="' +
      site.whatsapp +
      '" target="_blank">' +
      t(site.whatsappLabelAr, site.whatsappLabelEn) +
      "</a></p></div></div>"
    );
  }

  function renderSpecialties() {
    return (
      '<div class="ah-page-hero"><p class="ah-gold">' +
      t("التخصصات", "Specialties") +
      "</p><h1>" +
      t("التخصصات", "Specialties") +
      "</h1><p>" +
      t(
        "استعرض تخصصات الدكتور أحمد شيخ العرب واقرأ التفاصيل والفيديوهات.",
        "Explore Dr. Ahmed Sheikh Elarab’s specialties with details and videos."
      ) +
      '</p></div><div class="ah-card-grid">' +
      (DATA.specialties || [])
        .map(function (s) {
          return (
            '<a href="' +
            href("/specialties/" + s.slug) +
            '" class="ah-card"><img src="' +
            asset(s.cardImage || s.image) +
            '" alt="' +
            t(s.titleAr, s.titleEn) +
            '"><div class="ah-card__body"><div class="en">' +
            (getLang() === "ar" ? s.titleEn : s.titleAr) +
            "</div><h3>" +
            t(s.titleAr, s.titleEn) +
            "</h3><p>" +
            t(s.summaryAr || "اضغط للتفاصيل والفيديوهات", s.summaryEn || "Open for details and videos") +
            "</p></div></a>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderSpecialty() {
    var s = (DATA.specialties || []).find(function (item) {
      return item.slug === slug;
    });
    if (!s) return "<p>Not found</p>";
    var isAr = getLang() === "ar";
    var sections = isAr ? s.sections || s.sectionsEn || [] : s.sectionsEn || [];
    var site = DATA.site || {};
    var body = sections
      .map(function (block) {
        if (block.type === "h3") return "<h3>" + block.text + "</h3>";
        if (block.type === "ul") {
          return "<ul>" + (block.items || []).map(function (item) { return "<li>" + item + "</li>"; }).join("") + "</ul>";
        }
        return "<p>" + (block.text || "") + "</p>";
      })
      .join("");
    return (
      '<div class="ah-page-hero"><p class="ah-gold">' +
      t(s.titleAr, s.titleEn) +
      "</p><h1>" +
      t(s.titleAr, s.titleEn) +
      "</h1>" +
      (s.summaryAr || s.summaryEn ? "<p>" + t(s.summaryAr || "", s.summaryEn || "") + "</p>" : "") +
      '</div><div class="ah-split"><div class="ah-prose">' +
      body +
      (s.noteAr || s.noteEn ? '<div class="ah-box">' + t(s.noteAr || "", s.noteEn || "") + "</div>" : "") +
      '<p style="margin-top:1.5rem"><a class="ah-btn" href="' +
      site.whatsapp +
      '" target="_blank">' +
      t(site.whatsappLabelAr, site.whatsappLabelEn) +
      "</a></p></div>" +
      '<img src="' +
      asset(s.cardImage || s.image) +
      '" alt="' +
      t(s.titleAr, s.titleEn) +
      '"></div>' +
      reels(s.videos, t(s.videosTitleAr || "فيديوهات ذات صلة", s.videosTitleEn || "Related videos")) +
      '<p style="margin-top:2rem"><a href="' +
      href("/specialties") +
      '" class="ah-gold">' +
      t("← العودة للتخصصات", "← Back to specialties") +
      "</a></p>"
    );
  }

  function renderServices() {
    var services = DATA.whyServices || {};
    var site = DATA.site || {};
    var isAr = getLang() === "ar";
    return (
      '<div class="ah-page-hero"><p class="ah-gold">' +
      t("خدماتنا", "Our Services") +
      "</p><h1>" +
      t(services.titleAr, services.titleEn) +
      '</h1><p class="ah-services-lead">' +
      t(services.headingAr, services.headingEn) +
      '</p></div><ol class="ah-services' +
      (isAr ? " is-ar" : "") +
      '">' +
      (services.items || [])
        .map(function (item, index) {
          var title = t(item.titleAr, item.titleEn);
          return (
            '<li class="ah-service-item"><span class="ah-service-item__num">' +
            String(index + 1).padStart(2, "0") +
            '</span><div class="ah-service-item__body">' +
            (title ? "<h3>" + title + "</h3>" : "") +
            "<p>" +
            t(item.textAr, item.textEn) +
            "</p></div></li>"
          );
        })
        .join("") +
      '</ol><div class="ah-box ah-services-closing"><p>' +
      t(services.closingAr, services.closingEn) +
      '</p><p style="margin-top:1rem"><a class="ah-btn" href="' +
      site.whatsapp +
      '" target="_blank" rel="noreferrer">' +
      t(site.whatsappLabelAr, site.whatsappLabelEn) +
      "</a></p></div>"
    );
  }

  function serviceBody(blocks, isAr) {
    if (!blocks || !blocks.length) return "";
    return (
      '<div class="text-muted ah-service-body" dir="' +
      (isAr ? "rtl" : "ltr") +
      '" lang="' +
      (isAr ? "ar" : "en") +
      '">' +
      blocks
        .map(function (block) {
          var type = block[0];
          var content = block[1];
          if (type === "h") return '<h4 class="ah-service-block-heading">' + content + "</h4>";
          if (type === "p") return "<p>" + content + "</p>";
          if (type === "ul") {
            return (
              '<ul class="ah-service-list">' +
              content
                .map(function (pair) {
                  return "<li><strong>" + pair[0] + ":</strong> " + pair[1] + "</li>";
                })
                .join("") +
              "</ul>"
            );
          }
          return "";
        })
        .join("") +
      "</div>"
    );
  }

  function renderServiceDetail() {
    var service = (DATA.serviceDetails || []).find(function (item) {
      return item.slug === slug;
    });
    if (!service) return "<p>Not found</p>";
    var isAr = getLang() === "ar";
    var site = DATA.site || {};
    var title = t(service.titleAr, service.titleEn);
    var subtitle = t(service.subtitleAr, service.subtitleEn);
    var date = isAr ? service.dateAr : service.dateEn;
    var body = isAr ? service.bodyAr : service.bodyEn;
    document.body.classList.add("ah-service-detail");
    return (
      '<div class="content ah-service-page"><div class="blog-list bg-light section"><div class="container"><div class="row ah-service-row' +
      (isAr ? " is-rtl" : "") +
      '"><div class="primary col-md-8">' +
      (service.banner
        ? '<div class="ah-service-banner"><img src="' +
          asset(service.banner) +
          '" alt="' +
          title +
          '" class="ah-service-banner__img"><div class="ah-service-banner__overlay"><span class="ah-service-banner__tag">' +
          t("خدمات", "Services") +
          '</span><h1 class="ah-service-banner__title">' +
          title +
          '</h1><p class="ah-service-banner__subtitle">' +
          (subtitle || "") +
          "</p></div></div>"
        : "") +
      '<article class="post"><div class="post-meta has-rubric"><span class="post-rubric">' +
      t("خدمات", "Services") +
      '</span><div class="post-date"><div class="time">' +
      (date || "") +
      '</div></div></div><h3 class="post-title ah-service-inline-title">' +
      title +
      "</h3>" +
      serviceBody(body, isAr) +
      '</article></div><div class="secondary col-md-4">' +
      '<div class="widget jonny_author_"><h3 class="widget-title">' +
      t("تواصل معنا", "Get in Touch") +
      '</h3><img src="' +
      asset("/assets/images/doctor/DSC03751.jpg") +
      '" alt="' +
      t(site.nameAr, site.name) +
      '" class="ah-service-sidebar-photo"><h4 class="widget-about-title">' +
      t("د. أحمد شيخ العرب", "Dr. Ahmed Sheikh Elarab") +
      '</h4></div>' +
      '<div class="widget widget_block"><form class="wpcf7-form ah-service-sidebar-form"><div class="row">' +
      '<div class="form-group col-sm-6"><input type="text" placeholder="' +
      t("الاسم*", "Name*") +
      '" required></div>' +
      '<div class="form-group col-sm-6"><input type="email" placeholder="' +
      t("البريد الإلكتروني", "Email") +
      '"></div>' +
      '<div class="form-group col-sm-12"><input type="text" placeholder="' +
      t("الموضوع (اختياري)", "Subject (Optional)") +
      '"></div>' +
      '<div class="form-group col-sm-12"><textarea rows="10" placeholder="' +
      t("الرسالة*", "Message*") +
      '" required></textarea></div>' +
      '<div class="col-sm-12"><a href="' +
      site.whatsapp +
      '" target="_blank" rel="noreferrer" class="btn">' +
      t("إرسال عبر واتساب", "Send") +
      "</a></div></div></form></div>" +
      '<div class="widget widget_categories"><h3 class="widget-title">' +
      t("خدماتنا", "Our Services") +
      '</h3><ul class="ah-service-cat-list">' +
      (DATA.serviceDetails || [])
        .map(function (s) {
          return (
            "<li><a href=\"" +
            href("/" + s.slug) +
            '"' +
            (s.slug === slug ? ' class="is-active"' : "") +
            ">" +
            t(s.titleAr, s.titleEn) +
            "</a></li>"
          );
        })
        .join("") +
      "</ul></div></div></div></div></div></div>"
    );
  }

  function renderReviews() {
    var reviews = DATA.reviews || {};
    return (
      '<div class="ah-page-hero"><p class="ah-gold">' +
      t(reviews.titleAr, reviews.titleEn) +
      "</p><h1>" +
      t(reviews.titleAr, reviews.titleEn) +
      "</h1><p>" +
      t(reviews.introAr, reviews.introEn) +
      "</p></div>" +
      reels(reviews.videos)
    );
  }

  function renderContact() {
    var site = DATA.site || {};
    var waPrefill =
      site.whatsapp +
      "?text=" +
      encodeURIComponent(
        t("مرحباً دكتور أحمد، أرغب في الحجز / الاستفسار", "Hello Dr. Ahmed, I would like to book / inquire")
      );
    return (
      '<div class="ah-page-hero"><p class="ah-gold">' +
      t("تواصل معنا", "Contact") +
      "</p><h1>" +
      t("تواصل معنا", "Contact") +
      "</h1><p>" +
      t("أرسل رسالتك أو تواصل عبر واتساب للحجز والاستفسار.", "Send your message or contact us on WhatsApp for booking and inquiries.") +
      '</p></div><div class="ah-form"><a class="ah-btn" href="' +
      waPrefill +
      '" target="_blank" rel="noreferrer">' +
      t("إرسال رسالة / الحجز عبر واتساب", "Send message / book via WhatsApp") +
      '</a></div><div class="ah-box"><h3 style="margin-top:0;color:#c5a070">' +
      t("للحجز والاستفسار", "Booking & inquiries") +
      "</h3><p>" +
      t("واتساب / تليفون:", "WhatsApp / Phone:") +
      ' <a href="' +
      site.whatsapp +
      '" dir="ltr" style="color:#c5a070">' +
      site.phone +
      "</a></p></div>" +
      '<h2 class="ah-gold" style="margin-top:2rem">' +
      t("عناوين الفروع", "Branch addresses") +
      '</h2><div class="ah-branches">' +
      (DATA.branches || [])
        .map(function (b) {
          return (
            '<article class="ah-branch"><h3>' +
            t(b.titleAr, b.titleEn) +
            "</h3><p>" +
            t(b.addressAr, b.addressEn) +
            '</p><p><a href="' +
            b.map +
            '" target="_blank" rel="noreferrer">' +
            t("عرض الخريطة", "View Map") +
            '</a></p><iframe title="' +
            b.titleEn +
            '" src="https://maps.google.com/maps?q=' +
            encodeURIComponent(b.addressEn) +
            '&output=embed" width="100%" height="180" style="border:0;margin-top:.75rem" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></article>'
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderNotFound() {
    return (
      '<div class="ah-page-hero"><h1>' +
      t("الصفحة غير موجودة", "Page not found") +
      "</h1><p><a class=\"ah-gold\" href=\"" +
      href("/") +
      '">' +
      t("العودة للرئيسية", "Back to home") +
      "</a></p></div>"
    );
  }

  function renderBlogs() {
    return (
      '<div class="ah-page-hero"><p class="ah-gold">' +
      t("مقالات واخبار", "Blogs") +
      "</p><h1>" +
      t("مقالات واخبار", "Blogs") +
      "</h1><p>" +
      t("مقالات وأخبار طب وجراحة العيون.", "Articles and news in ophthalmology.") +
      '</p></div><div class="ah-card-grid"><article class="ah-card" style="cursor:default"><div class="ah-card__body"><div class="en">Welcome</div><h3>' +
      t("مرحبًا بكم في عيادة الدكتور أحمد شيخ العرب", "Welcome to Dr. Ahmed Sheikh Elarab Eye Clinics") +
      "</h3><p>" +
      t("رؤية أوضح تبدأ من التشخيص الصحيح والرعاية المتخصصة.", "Clearer vision starts with the right diagnosis and specialized care.") +
      '</p><p style="margin-top:.8rem"><a href="' +
      href("/specialties") +
      '" class="ah-gold">' +
      t("تصفح التخصصات ←", "Browse specialties ←") +
      "</a></p></div></article></div>"
    );
  }

  function renderPage() {
    var map = {
      about: renderAbout,
      specialties: renderSpecialties,
      "specialty-detail": renderSpecialty,
      services: renderServices,
      "service-detail": renderServiceDetail,
      reviews: renderReviews,
      contact: renderContact,
      blogs: renderBlogs,
      "not-found": renderNotFound,
    };
    var fn = map[page];
    if (fn) $("#ah-page").html(fn());
  }

  function bindChrome() {
    $(document).on("click", ".navbar-toggle", function () {
      $("body").removeClass("menu-is-closed").addClass("menu-is-opened");
    });
    $(document).on("click", ".close-menu, .click-capture", function () {
      $("body").removeClass("menu-is-opened").addClass("menu-is-closed");
    });
    $(document).on("click", ".ah-set-lang, [data-lang]", function (e) {
      var lang = this.getAttribute("data-lang");
      if (lang !== "ar" && lang !== "en") return;
      e.preventDefault();
      setLang(lang);
      $("body").removeClass("menu-is-opened").addClass("menu-is-closed");
    });
    $(document).on("click", ".ah-chaty-fab__btn", function (e) {
      e.stopPropagation();
      var $fab = $(".ah-chaty-fab");
      var open = !$fab.hasClass("is-open");
      $fab.toggleClass("is-open", open);
      $fab.find(".ah-chaty-fab__cta").toggle(!open);
      $fab.find(".ah-chaty-fab__btn").html(
        open
          ? '<span class="ah-chaty-fab__x">×</span>'
          : '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 4.5C4 3.67 4.67 3 5.5 3h13c.83 0 1.5.67 1.5 1.5v11c0 .83-.67 1.5-1.5 1.5H9.2L5.4 20.2c-.45.34-1.1.02-1.1-.52V4.5z" fill="#fff"/><path d="M8.2 11.2c1.6 1.5 4.4 1.5 6 0" stroke="#111" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg>'
      );
    });
    $(document).on("click", function (e) {
      if (!$(e.target).closest(".ah-chaty-fab").length) {
        $(".ah-chaty-fab").removeClass("is-open");
        $(".ah-chaty-fab__cta").show();
      }
    });
    $(document).on("submit", ".ah-service-sidebar-form", function (e) {
      e.preventDefault();
    });
  }

  function render() {
    applyLang(getLang());
    $("#site-header").html(renderHeader());
    $("#site-footer").html(renderFooter());
    $("#site-widgets").html(renderWidgets());
    renderPage();
  }

  window.AHApp = { setLang: setLang, getLang: getLang, t: t };
  applyLang(getLang());
  $(function () {
    bindChrome();
    render();
  });
})(jQuery);
