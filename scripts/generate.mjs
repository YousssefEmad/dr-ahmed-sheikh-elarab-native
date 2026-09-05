import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nativeRoot = path.resolve(__dirname, "..");
const nextRoot = path.resolve(__dirname, "..", "..", "dr-ahmed-sheikh-elarab");

async function load(rel) {
  return import(pathToFileURL(path.join(nextRoot, rel)).href);
}

const { site, navItems, branches } = await load("data/site.js");
const { about } = await load("data/about.js");
const { specialties } = await load("data/specialties.js");
const { serviceDetails } = await load("data/serviceDetails.js");
const { services: whyServices, reviews } = await load("data/content.js");
const { chatyChannels } = await load("data/chatyChannels.js");

const seo = {
  description:
    "Dr. Ahmed Sheikh Elarab – Retina, Cataract & Laser Surgery Consultant, PhD in Ophthalmology. Clinics in Nasr City, Mohandessin & Fifth Settlement. Book now: 01554239529.",
};

const pageSeo = {
  about: {
    title: "About Us | من نحن",
    description:
      "Learn about Dr. Ahmed Sheikh Elarab – consultant ophthalmologist specializing in retina, cataract and laser surgery.",
  },
  specialties: {
    title: "Specialties | التخصصات",
    description:
      "Explore eye specialties: cataract surgery, laser vision correction, pediatric ophthalmology, retina care and more.",
  },
  services: {
    title: "Our Services | خدماتنا",
    description: "Why choose Dr. Ahmed Sheikh Elarab? Specialized supervision, latest technology, accurate diagnosis.",
  },
  reviews: {
    title: "Patient Reviews | آراء عملائنا",
    description: "Real patient reviews and video testimonials for Dr. Ahmed Sheikh Elarab Eye Clinics.",
  },
  contact: {
    title: "Contact | تواصل معنا",
    description:
      "Contact Dr. Ahmed Sheikh Elarab Eye Clinics – Nasr City, Mohandessin and Fifth Settlement. WhatsApp: 01554239529.",
  },
  blogs: {
    title: "Blogs | مقالات واخبار",
    description: "Articles and news in ophthalmology from Dr. Ahmed Sheikh Elarab Eye Clinics.",
  },
};

function rewriteAssetPath(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/^\/wp-content\/uploads\//, "/assets/images/uploads/")
    .replace(/^\/media\//, "/assets/images/uploads/")
    .replace(/^\/wp-content\/plugins\/gtranslate\/flags\/24\//, "/assets/images/flags/");
}

function rewriteDeep(value) {
  if (Array.isArray(value)) return value.map(rewriteDeep);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, rewriteDeep(v)]));
  }
  return rewriteAssetPath(value);
}

const payload = rewriteDeep({
  site,
  navItems,
  branches,
  about,
  specialties,
  serviceDetails,
  whyServices,
  reviews,
  chatyChannels,
});

fs.writeFileSync(
  path.join(nativeRoot, "assets", "js", "data.js"),
  `window.AH = ${JSON.stringify(payload, null, 2)};\n`,
  "utf8"
);

const homeI18n = fs.readFileSync(path.join(nativeRoot, "assets", "js", "home-i18n.json"), "utf8");
fs.writeFileSync(
  path.join(nativeRoot, "assets", "js", "home-i18n-embed.js"),
  `window.AH_HOME_I18N = ${homeI18n};\n`,
  "utf8"
);

function escapeAttr(value = "") {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function langPair(en, ar, tag = "span") {
  return `<${tag} data-lang-only="en">${escapeHtml(en)}</${tag}><${tag} data-lang-only="ar">${escapeHtml(ar)}</${tag}>`;
}

function assetPath(p, base = "") {
  return (
    base +
    String(p || "")
      .replace(/^\//, "")
      .replace(/\?.*$/, "")
      .replace(/^wp-content\/uploads\//, "assets/images/uploads/")
      .replace(/^media\//, "assets/images/uploads/")
  );
}

function facebookEmbed(url) {
  try {
    const parsed = new URL(url);
    parsed.search = "";
    parsed.hash = "";
    let hrefUrl = parsed.toString();
    if (!hrefUrl.endsWith("/")) hrefUrl += "/";
    if (/facebook\.com\/share\//i.test(hrefUrl)) return "";
    return (
      "https://www.facebook.com/plugins/video.php?href=" +
      encodeURIComponent(hrefUrl) +
      "&show_text=false&width=267&height=476&t=0"
    );
  } catch {
    return "";
  }
}

function reelsHtml(urls = [], titleEn = "", titleAr = "") {
  if (!urls.length) return "";
  return `
    <section class="ah-reels">
      ${titleEn || titleAr ? `<h3 class="ah-reels__title">${langPair(titleEn, titleAr)}</h3>` : ""}
      <div class="ah-reels__grid">
        ${urls
          .map((url) => {
            const src = facebookEmbed(url);
            return `<div class="ah-reel">${
              src
                ? `<iframe src="${escapeAttr(src)}" title="Facebook Reel" width="267" height="476" class="ah-reel__frame" scrolling="no" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`
                : ""
            }<a class="ah-reel__link" href="${escapeAttr(url)}" target="_blank" rel="noreferrer">${langPair("Watch on Facebook", "مشاهدة على فيسبوك")}</a></div>`;
          })
          .join("\n        ")}
      </div>
    </section>`;
}

function renderSections(blocks = []) {
  return blocks
    .map((block) => {
      if (block.type === "h3") return `<h3>${escapeHtml(block.text)}</h3>`;
      if (block.type === "ul") {
        return `<ul>${(block.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
      }
      return `<p>${escapeHtml(block.text || "")}</p>`;
    })
    .join("\n        ");
}

function serviceBlocks(blocks = []) {
  return blocks
    .map(([type, content]) => {
      if (type === "h") return `<h4 class="ah-service-block-heading">${escapeHtml(content)}</h4>`;
      if (type === "p") return `<p>${escapeHtml(content)}</p>`;
      if (type === "ul") {
        return `<ul class="ah-service-list">${content
          .map(([label, text]) => `<li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(text)}</li>`)
          .join("")}</ul>`;
      }
      return "";
    })
    .join("\n          ");
}

function aboutPageContent() {
  const img = String(about.image || "").replace(/^\//, "");
  return `
    <div class="ah-page-hero">
      <p class="ah-gold">${langPair(about.titleEn, about.titleAr)}</p>
      <h1>${langPair(about.titleEn, about.titleAr)}</h1>
      <p>${langPair(about.subtitleEn, about.subtitleAr)}</p>
    </div>
    <div class="ah-split">
      <div class="ah-prose">
        ${about.introEn.map((p) => `<p data-lang-only="en">${escapeHtml(p)}</p>`).join("\n        ")}
        ${about.introAr.map((p) => `<p data-lang-only="ar">${escapeHtml(p)}</p>`).join("\n        ")}
        <h2>${langPair(about.experienceTitleEn, about.experienceTitleAr)}</h2>
        <ul data-lang-only="en">
          ${about.experienceEn.map((item) => `<li>${escapeHtml(item)}</li>`).join("\n          ")}
        </ul>
        <ul data-lang-only="ar">
          ${about.experienceAr.map((item) => `<li>${escapeHtml(item)}</li>`).join("\n          ")}
        </ul>
        <div class="ah-box">
          <h3>${langPair(about.visionTitleEn, about.visionTitleAr)}</h3>
          <p>${langPair(about.visionEn, about.visionAr)}</p>
        </div>
        <div class="ah-box">
          <h3>${langPair(about.missionTitleEn, about.missionTitleAr)}</h3>
          <p>${langPair(about.missionEn, about.missionAr)}</p>
        </div>
      </div>
      <div>
        <img src="${escapeAttr(img)}" alt="${escapeAttr(site.name)}">
        <p class="ah-mt">
          <a class="ah-btn" href="${escapeAttr(site.whatsapp)}" target="_blank" rel="noopener">
            ${langPair(site.whatsappLabelEn, site.whatsappLabelAr)}
          </a>
        </p>
      </div>
    </div>`;
}

function specialtiesPageContent() {
  const cards = specialties
    .map((s) => {
      const img = assetPath(s.cardImage || s.image, "");
      return `<a href="specialties/${escapeAttr(s.slug)}.html" class="ah-card">
        <img src="${escapeAttr(img)}" alt="${escapeAttr(s.titleEn)}">
        <div class="ah-card__body">
          <div class="en">${langPair(s.titleAr, s.titleEn)}</div>
          <h3>${langPair(s.titleEn, s.titleAr)}</h3>
          <p>${langPair(s.summaryEn || "Open for details and videos", s.summaryAr || "اضغط للتفاصيل والفيديوهات")}</p>
        </div>
      </a>`;
    })
    .join("\n      ");
  return `
    <div class="ah-page-hero">
      <p class="ah-gold">${langPair("Specialties", "التخصصات")}</p>
      <h1>${langPair("Specialties", "التخصصات")}</h1>
      <p>${langPair(
        "Explore Dr. Ahmed Sheikh Elarab’s specialties with details and videos.",
        "استعرض تخصصات الدكتور أحمد شيخ العرب واقرأ التفاصيل والفيديوهات."
      )}</p>
    </div>
    <div class="ah-card-grid">
      ${cards}
    </div>`;
}

function specialtyDetailContent(s) {
  const img = assetPath(s.cardImage || s.image, "../");
  const enBlocks = s.sectionsEn?.length ? s.sectionsEn : s.sections || [];
  const arBlocks = s.sections?.length ? s.sections : s.sectionsEn || [];
  return `
    <div class="ah-page-hero">
      <p class="ah-gold">${langPair(s.titleEn, s.titleAr)}</p>
      <h1>${langPair(s.titleEn, s.titleAr)}</h1>
      ${s.summaryEn || s.summaryAr ? `<p>${langPair(s.summaryEn || "", s.summaryAr || "")}</p>` : ""}
    </div>
    <div class="ah-split">
      <div>
        <div class="ah-prose" data-lang-only="en">
          ${renderSections(enBlocks)}
          ${s.noteEn ? `<div class="ah-box">${escapeHtml(s.noteEn)}</div>` : ""}
        </div>
        <div class="ah-prose" data-lang-only="ar">
          ${renderSections(arBlocks)}
          ${s.noteAr ? `<div class="ah-box">${escapeHtml(s.noteAr)}</div>` : ""}
        </div>
        <p class="ah-mt-lg">
          <a class="ah-btn" href="${escapeAttr(site.whatsapp)}" target="_blank" rel="noopener">
            ${langPair(site.whatsappLabelEn, site.whatsappLabelAr)}
          </a>
        </p>
      </div>
      <img src="${escapeAttr(img)}" alt="${escapeAttr(s.titleEn)}">
    </div>
    ${reelsHtml(s.videos || [], s.videosTitleEn || "Related videos", s.videosTitleAr || "فيديوهات ذات صلة")}
    <p class="ah-mt-xl"><a href="../specialties.html" class="ah-gold">${langPair("← Back to specialties", "← العودة للتخصصات")}</a></p>`;
}

function servicesPageContent() {
  const items = whyServices.items
    .map((item, i) => {
      const num = String(i + 1).padStart(2, "0");
      const title = item.titleEn || item.titleAr ? `<h3>${langPair(item.titleEn, item.titleAr)}</h3>` : "";
      return `<li class="ah-service-item">
        <span class="ah-service-item__num">${num}</span>
        <div class="ah-service-item__body">
          ${title}
          <p>${langPair(item.textEn, item.textAr)}</p>
        </div>
      </li>`;
    })
    .join("\n      ");
  return `
    <div class="ah-page-hero">
      <p class="ah-gold">${langPair("Our Services", "خدماتنا")}</p>
      <h1>${langPair(whyServices.titleEn, whyServices.titleAr)}</h1>
      <p class="ah-services-lead">${langPair(whyServices.headingEn, whyServices.headingAr)}</p>
    </div>
    <ol class="ah-services">
      ${items}
    </ol>
    <div class="ah-box ah-services-closing">
      <p>${langPair(whyServices.closingEn, whyServices.closingAr)}</p>
      <p class="ah-mt">
        <a class="ah-btn" href="${escapeAttr(site.whatsapp)}" target="_blank" rel="noreferrer">
          ${langPair(site.whatsappLabelEn, site.whatsappLabelAr)}
        </a>
      </p>
    </div>`;
}

function serviceDetailContent(service) {
  const banner = service.banner ? assetPath(service.banner, "../") : "";
  const doctor = assetPath("/assets/images/doctor/DSC03751.jpg", "../");
  const list = serviceDetails
    .map((item) => {
      const active = item.slug === service.slug ? ' class="is-active"' : "";
      return `<li><a href="${escapeAttr(item.slug)}.html"${active}>${langPair(item.titleEn, item.titleAr)}</a></li>`;
    })
    .join("\n            ");
  return `
    <div class="content ah-service-page">
      <div class="blog-list bg-light section">
        <div class="container">
          <div class="row ah-service-row">
            <div class="primary col-md-8">
              ${
                banner
                  ? `<div class="ah-service-banner">
                <img src="${escapeAttr(banner)}" alt="${escapeAttr(service.titleEn)}" class="ah-service-banner__img">
                <div class="ah-service-banner__overlay">
                  <span class="ah-service-banner__tag">${langPair("Services", "خدمات")}</span>
                  <h1 class="ah-service-banner__title">${langPair(service.titleEn, service.titleAr)}</h1>
                  <p class="ah-service-banner__subtitle">${langPair(service.subtitleEn || "", service.subtitleAr || "")}</p>
                </div>
              </div>`
                  : ""
              }
              <article class="post">
                <div class="post-meta has-rubric">
                  <span class="post-rubric">${langPair("Services", "خدمات")}</span>
                  <div class="post-date"><div class="time">${langPair(service.dateEn || "", service.dateAr || "")}</div></div>
                </div>
                <h3 class="post-title ah-service-inline-title">${langPair(service.titleEn, service.titleAr)}</h3>
                <div class="text-muted ah-service-body" data-lang-only="en" dir="ltr" lang="en">
                  ${serviceBlocks(service.bodyEn || [])}
                </div>
                <div class="text-muted ah-service-body" data-lang-only="ar" dir="rtl" lang="ar">
                  ${serviceBlocks(service.bodyAr || [])}
                </div>
              </article>
            </div>
            <div class="secondary col-md-4">
              <div class="widget ah-author-card">
                <h3 class="widget-title">${langPair("Get in Touch", "تواصل معنا")}</h3>
                <img src="${escapeAttr(doctor)}" alt="${escapeAttr(site.name)}" class="ah-service-sidebar-photo">
                <h4 class="widget-about-title">${langPair("Dr. Ahmed Sheikh Elarab", "د. أحمد شيخ العرب")}</h4>
              </div>
              <div class="widget ah-widget-block">
                <form class="ah-contact-form ah-service-sidebar-form">
                  <div class="row">
                    <div class="form-group col-sm-6"><input type="text" placeholder="Name* / الاسم*" required></div>
                    <div class="form-group col-sm-6"><input type="email" placeholder="Email / البريد الإلكتروني"></div>
                    <div class="form-group col-sm-12"><input type="text" placeholder="Subject (Optional) / الموضوع (اختياري)"></div>
                    <div class="form-group col-sm-12"><textarea rows="10" placeholder="Message* / الرسالة*" required></textarea></div>
                    <div class="col-sm-12">
                      <a href="${escapeAttr(site.whatsapp)}" target="_blank" rel="noreferrer" class="btn">${langPair("Send", "إرسال عبر واتساب")}</a>
                    </div>
                  </div>
                </form>
              </div>
              <div class="widget ah-widget-list">
                <h3 class="widget-title">${langPair("Our Services", "خدماتنا")}</h3>
                <ul class="ah-service-cat-list">
            ${list}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function reviewsPageContent() {
  return `
    <div class="ah-page-hero">
      <p class="ah-gold">${langPair(reviews.titleEn, reviews.titleAr)}</p>
      <h1>${langPair(reviews.titleEn, reviews.titleAr)}</h1>
      <p>${langPair(reviews.introEn, reviews.introAr)}</p>
    </div>
    ${reelsHtml(reviews.videos || [])}`;
}

function contactPageContent() {
  const enPrefill = site.whatsapp + "?text=" + encodeURIComponent("Hello Dr. Ahmed, I would like to book / inquire");
  const arPrefill = site.whatsapp + "?text=" + encodeURIComponent("مرحباً دكتور أحمد، أرغب في الحجز / الاستفسار");
  const cards = branches
    .map(
      (b) => `<article class="ah-branch">
        <h3>${langPair(b.titleEn, b.titleAr)}</h3>
        <p>${langPair(b.addressEn, b.addressAr)}</p>
        <p><a href="${escapeAttr(b.map)}" target="_blank" rel="noreferrer">${langPair("View Map", "عرض الخريطة")}</a></p>
        <iframe title="${escapeAttr(b.titleEn)}" src="https://maps.google.com/maps?q=${encodeURIComponent(b.addressEn)}&output=embed" width="100%" height="180" class="ah-branch-map" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </article>`
    )
    .join("\n      ");
  return `
    <div class="ah-page-hero">
      <p class="ah-gold">${langPair("Contact", "تواصل معنا")}</p>
      <h1>${langPair("Contact", "تواصل معنا")}</h1>
      <p>${langPair("Send your message or contact us on WhatsApp for booking and inquiries.", "أرسل رسالتك أو تواصل عبر واتساب للحجز والاستفسار.")}</p>
    </div>
    <div class="ah-form">
      <a class="ah-btn" data-lang-only="en" href="${escapeAttr(enPrefill)}" target="_blank" rel="noreferrer">Send message / book via WhatsApp</a>
      <a class="ah-btn" data-lang-only="ar" href="${escapeAttr(arPrefill)}" target="_blank" rel="noreferrer">إرسال رسالة / الحجز عبر واتساب</a>
    </div>
    <div class="ah-box">
      <h3>${langPair("Booking & inquiries", "للحجز والاستفسار")}</h3>
      <p>${langPair("WhatsApp / Phone:", "واتساب / تليفون:")} <a href="${escapeAttr(site.whatsapp)}" dir="ltr" class="ah-contact-phone">${escapeHtml(site.phone)}</a></p>
    </div>
    <h2 class="ah-gold ah-mt-xl">${langPair("Branch addresses", "عناوين الفروع")}</h2>
    <div class="ah-branches">
      ${cards}
    </div>`;
}

function blogsPageContent() {
  return `
    <div class="ah-page-hero">
      <p class="ah-gold">${langPair("Blogs", "مقالات واخبار")}</p>
      <h1>${langPair("Blogs", "مقالات واخبار")}</h1>
      <p>${langPair("Articles and news in ophthalmology.", "مقالات وأخبار طب وجراحة العيون.")}</p>
    </div>
    <div class="ah-card-grid">
      <article class="ah-card ah-card--static">
        <div class="ah-card__body">
          <div class="en">Welcome</div>
          <h3>${langPair("Welcome to Dr. Ahmed Sheikh Elarab Eye Clinics", "مرحبًا بكم في عيادة الدكتور أحمد شيخ العرب")}</h3>
          <p>${langPair("Clearer vision starts with the right diagnosis and specialized care.", "رؤية أوضح تبدأ من التشخيص الصحيح والرعاية المتخصصة.")}</p>
          <p class="ah-mt"><a href="specialties.html" class="ah-gold">${langPair("Browse specialties ←", "تصفح التخصصات ←")}</a></p>
        </div>
      </article>
    </div>`;
}

function notFoundPageContent() {
  return `
    <div class="ah-page-hero">
      <h1>${langPair("Page not found", "الصفحة غير موجودة")}</h1>
      <p><a class="ah-gold" href="index.html">${langPair("Back to home", "العودة للرئيسية")}</a></p>
    </div>`;
}

function writePage({ file, page, slug = "", title, description, canonical, base, extraClass = "", content = "" }) {
  const html = `<!DOCTYPE html>
<html lang="en" dir="ltr" data-base="${base}">
<head>
  <meta charset="UTF-8">
  <script>
  (function(){try{var l=localStorage.getItem("ah-lang");if(l!=="ar"&&l!=="en")l="en";document.documentElement.lang=l;document.documentElement.dir=l==="ar"?"rtl":"ltr";document.documentElement.classList.add("lang-"+l);}catch(e){}})();
  </script>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeAttr(title)}</title>
  <meta name="description" content="${escapeAttr(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeAttr(title)}">
  <meta property="og:description" content="${escapeAttr(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="https://drahmed-sheikhelarab.com/assets/images/logo/site-logo.png">
  <link rel="icon" href="${base}assets/images/logo/site-logo.png" type="image/png">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Playfair+Display:400,400i,700,700i|Poppins:400,500,600,700|Tajawal:400,500,600,700">
  <link rel="stylesheet" href="${base}assets/css/bootstrap.css">
  <link rel="stylesheet" href="${base}assets/css/font-awesome.min.css">
  <link rel="stylesheet" href="${base}assets/css/ionicons.min.css">
  <link rel="stylesheet" href="${base}assets/css/linearicons.css">
  <link rel="stylesheet" href="${base}assets/css/style.css">
  <link rel="stylesheet" href="${base}assets/css/theme.css">
  <link rel="stylesheet" href="${base}assets/css/uploads-style.css">
  <link rel="stylesheet" href="${base}assets/css/inner-site.css">
  <link rel="stylesheet" href="${base}assets/css/inner-service.css">
</head>
<body class="menu-is-closed${extraClass}" data-page="${page}" data-slug="${slug}">
  <div class="ah-shell">
    <div id="site-header"></div>
    <main class="ah-main" id="ah-page"${content ? ' data-static="1"' : ""}>${content}</main>
    <div id="site-footer"></div>
    <div id="site-widgets"></div>
  </div>
  <script src="${base}assets/js/jquery.min.js"></script>
  <script src="${base}assets/js/jquery-migrate.min.js"></script>
  <script src="${base}assets/js/bootstrap.min.js"></script>
  <script src="${base}assets/js/data.js"></script>
  <script src="${base}assets/js/inner-app.js"></script>
</body>
</html>
`;
  const full = path.join(nativeRoot, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html, "utf8");
}

const siteUrl = "https://drahmed-sheikhelarab.com";

writePage({
  file: "about.html",
  page: "about",
  title: pageSeo.about.title,
  description: pageSeo.about.description,
  canonical: `${siteUrl}/about.html`,
  base: "",
  content: aboutPageContent(),
});

writePage({
  file: "specialties.html",
  page: "specialties",
  title: pageSeo.specialties.title,
  description: pageSeo.specialties.description,
  canonical: `${siteUrl}/specialties.html`,
  base: "",
  content: specialtiesPageContent(),
});

for (const s of specialties) {
  writePage({
    file: `specialties/${s.slug}.html`,
    page: "specialty-detail",
    slug: s.slug,
    title: `${s.titleEn} | ${s.titleAr} | Dr. Ahmed Sheikh Elarab`,
    description: s.summaryEn || s.summaryAr || pageSeo.specialties.description,
    canonical: `${siteUrl}/specialties/${s.slug}.html`,
    base: "../",
    content: specialtyDetailContent(s),
  });
}

writePage({
  file: "services.html",
  page: "services",
  title: pageSeo.services.title,
  description: pageSeo.services.description,
  canonical: `${siteUrl}/services.html`,
  base: "",
  content: servicesPageContent(),
});

for (const s of serviceDetails) {
  writePage({
    file: `articles/${s.slug}.html`,
    page: "service-detail",
    slug: s.slug,
    title: `${s.titleEn} | ${s.titleAr} | Dr. Ahmed Sheikh Elarab`,
    description: s.subtitleEn || s.subtitleAr || pageSeo.services.description,
    canonical: `${siteUrl}/articles/${s.slug}.html`,
    base: "../",
    extraClass: " ah-service-detail",
    content: serviceDetailContent(s),
  });
}

writePage({
  file: "reviews.html",
  page: "reviews",
  title: pageSeo.reviews.title,
  description: pageSeo.reviews.description,
  canonical: `${siteUrl}/reviews.html`,
  base: "",
  content: reviewsPageContent(),
});

writePage({
  file: "contact.html",
  page: "contact",
  title: pageSeo.contact.title,
  description: pageSeo.contact.description,
  canonical: `${siteUrl}/contact.html`,
  base: "",
  content: contactPageContent(),
});

writePage({
  file: "blogs.html",
  page: "blogs",
  title: pageSeo.blogs.title,
  description: pageSeo.blogs.description,
  canonical: `${siteUrl}/blogs.html`,
  base: "",
  content: blogsPageContent(),
});

writePage({
  file: "404.html",
  page: "not-found",
  title: "Page not found | Dr. Ahmed Sheikh Elarab",
  description: seo.description,
  canonical: `${siteUrl}/404.html`,
  base: "",
  content: notFoundPageContent(),
});

const urls = [
  "/",
  "/about.html",
  "/specialties.html",
  ...specialties.map((s) => `/specialties/${s.slug}.html`),
  "/services.html",
  ...serviceDetails.map((s) => `/articles/${s.slug}.html`),
  "/reviews.html",
  "/contact.html",
  "/blogs.html",
];

fs.writeFileSync(
  path.join(nativeRoot, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${siteUrl}${u === "/" ? "/" : u}</loc><changefreq>weekly</changefreq></url>`).join("\n")}
</urlset>
`,
  "utf8"
);

fs.writeFileSync(
  path.join(nativeRoot, "robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`,
  "utf8"
);

console.log(
  `Generated data + ${specialties.length} specialties + ${serviceDetails.length} services + inner pages`
);
