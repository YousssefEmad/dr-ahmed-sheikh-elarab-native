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

function writePage({ file, page, slug = "", title, description, canonical, base, extraClass = "" }) {
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
  <link rel="stylesheet" href="${base}assets/css/jonny-wp.css">
  <link rel="stylesheet" href="${base}assets/css/uploads-style.css">
  <link rel="stylesheet" href="${base}assets/css/inner-site.css">
  <link rel="stylesheet" href="${base}assets/css/inner-service.css">
  <style>
    :root { --ah-gold: #c5a070; --ah-gold-rgb: 197, 160, 112; }
    .brand img { width: auto !important; height: 58px; max-width: 280px; object-fit: contain; }
    body { background: #111; }
    .ah-shell .ah-main { position: relative; z-index: 1; }
    .text-primary, .ah-gold { color: #c5a070 !important; }
    body.lang-ar, html[dir=rtl] body { font-family: "Tajawal", "Cairo", "Segoe UI", Tahoma, sans-serif; }
    html[dir=rtl] .ah-page-hero h1, body.lang-ar .ah-page-hero h1 { font-family: "Tajawal", "Cairo", sans-serif; }
  </style>
</head>
<body class="wp-theme-jonny menu-is-closed${extraClass}" data-page="${page}" data-slug="${slug}">
  <div class="ah-shell">
    <div id="site-header"></div>
    <main class="ah-main" id="ah-page"></main>
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
});

writePage({
  file: "specialties.html",
  page: "specialties",
  title: pageSeo.specialties.title,
  description: pageSeo.specialties.description,
  canonical: `${siteUrl}/specialties.html`,
  base: "",
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
  });
}

writePage({
  file: "services.html",
  page: "services",
  title: pageSeo.services.title,
  description: pageSeo.services.description,
  canonical: `${siteUrl}/services.html`,
  base: "",
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
  });
}

writePage({
  file: "reviews.html",
  page: "reviews",
  title: pageSeo.reviews.title,
  description: pageSeo.reviews.description,
  canonical: `${siteUrl}/reviews.html`,
  base: "",
});

writePage({
  file: "contact.html",
  page: "contact",
  title: pageSeo.contact.title,
  description: pageSeo.contact.description,
  canonical: `${siteUrl}/contact.html`,
  base: "",
});

writePage({
  file: "blogs.html",
  page: "blogs",
  title: pageSeo.blogs.title,
  description: pageSeo.blogs.description,
  canonical: `${siteUrl}/blogs.html`,
  base: "",
});

writePage({
  file: "404.html",
  page: "not-found",
  title: "Page not found | Dr. Ahmed Sheikh Elarab",
  description: seo.description,
  canonical: `${siteUrl}/404.html`,
  base: "",
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
