import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function copyFile(from, to) {
  if (!fs.existsSync(from)) {
    console.warn("missing", from);
    return;
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dest);
    else copyFile(src, dest);
  }
}

const copies = [
  ["wp-content/themes/jonny/css", "assets/css"],
  ["wp-content/themes/jonny/js", "assets/js"],
  ["wp-content/themes/jonny/fonts", "assets/fonts"],
  ["wp-content/themes/jonny/images", "assets/images/theme"],
  ["wp-content/uploads/2018", "assets/images/uploads/2018"],
  ["wp-content/uploads/2024", "assets/images/uploads/2024"],
  ["wp-content/plugins/gtranslate/flags/24", "assets/images/flags"],
  ["wp-includes/js/jquery", "assets/js"],
];

for (const [from, to] of copies) {
  copyDir(path.join(root, from), path.join(root, to));
}

const files = [
  ["wp-content/themes/jonny/style.css", "assets/css/theme.css"],
  ["wp-content/uploads/style.css", "assets/css/uploads-style.css"],
  ["wp-content/plugins/contact-form-7/includes/css/styles.css", "assets/css/contact-form-7.css"],
  ["wp-content/plugins/jonny_plugin/style.css", "assets/css/jonny-plugin.css"],
  ["wp-content/plugins/js_composer/assets/css/js_composer.min.css", "assets/css/js_composer.min.css"],
  ["wp-content/plugins/js_composer/assets/lib/bower/animate-css/animate.min.css", "assets/css/animate.min.css"],
  ["wp-includes/js/dist/hooks.min.js", "assets/js/hooks.min.js"],
  ["wp-includes/js/dist/i18n.min.js", "assets/js/i18n.min.js"],
  ["wp-includes/js/imagesloaded.min.js", "assets/js/imagesloaded.min.js"],
  ["wp-includes/js/comment-reply.min.js", "assets/js/comment-reply.min.js"],
  ["wp-content/plugins/contact-form-7/includes/swv/js/index.js", "assets/js/cf7-swv.js"],
  ["wp-content/plugins/contact-form-7/includes/js/index.js", "assets/js/contact-form-7.js"],
  ["wp-content/plugins/js_composer/assets/js/dist/js_composer_front.min.js", "assets/js/js_composer_front.min.js"],
  ["wp-content/plugins/js_composer/assets/lib/vc_waypoints/vc-waypoints.min.js", "assets/js/vc-waypoints.min.js"],
];

for (const [from, to] of files) copyFile(path.join(root, from), path.join(root, to));

const uploadsCss = path.join(root, "assets/css/uploads-style.css");
if (fs.existsSync(uploadsCss)) {
  const css = fs.readFileSync(uploadsCss, "utf8").split("/wp-content/themes/jonny/fonts/").join("../fonts/");
  fs.writeFileSync(uploadsCss, css, "utf8");
}

let html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const replacements = [
  ["/wp-content/themes/jonny/css/", "assets/css/"],
  ["/wp-content/themes/jonny/js/", "assets/js/"],
  ["/wp-content/themes/jonny/style.css", "assets/css/theme.css"],
  ["/wp-content/uploads/style.css", "assets/css/uploads-style.css"],
  ["/wp-content/uploads/", "assets/images/uploads/"],
  ["/wp-content/plugins/contact-form-7/includes/css/styles.css", "assets/css/contact-form-7.css"],
  ["/wp-content/plugins/jonny_plugin/style.css", "assets/css/jonny-plugin.css"],
  ["/wp-content/plugins/js_composer/assets/css/js_composer.min.css", "assets/css/js_composer.min.css"],
  ["/wp-content/plugins/js_composer/assets/lib/bower/animate-css/animate.min.css", "assets/css/animate.min.css"],
  ["/wp-content/plugins/gtranslate/flags/24/", "assets/images/flags/"],
  ["/wp-includes/js/jquery/jquery.min.js", "assets/js/jquery.min.js"],
  ["/wp-includes/js/jquery/jquery-migrate.min.js", "assets/js/jquery-migrate.min.js"],
  ["/wp-includes/js/dist/hooks.min.js", "assets/js/hooks.min.js"],
  ["/wp-includes/js/dist/i18n.min.js", "assets/js/i18n.min.js"],
  ["/wp-includes/js/imagesloaded.min.js", "assets/js/imagesloaded.min.js"],
  ["/wp-includes/js/comment-reply.min.js", "assets/js/comment-reply.min.js"],
  ["/wp-content/plugins/contact-form-7/includes/swv/js/index.js", "assets/js/cf7-swv.js"],
  ["/wp-content/plugins/contact-form-7/includes/js/index.js", "assets/js/contact-form-7.js"],
  ["/wp-content/plugins/js_composer/assets/js/dist/js_composer_front.min.js", "assets/js/js_composer_front.min.js"],
  ["/wp-content/plugins/js_composer/assets/lib/vc_waypoints/vc-waypoints.min.js", "assets/js/vc-waypoints.min.js"],
  ['href="/assets/', 'href="assets/'],
  ['src="/assets/', 'src="assets/'],
  ['href="/" data-i18n="nav.home"', 'href="index.html" data-i18n="nav.home"'],
  ['class="brand" href="/"', 'class="brand" href="index.html"'],
  ['href="/about"', 'href="about.html"'],
  ['href="/specialties"', 'href="specialties.html"'],
  ['href="/services"', 'href="services.html"'],
  ['href="/reviews"', 'href="reviews.html"'],
  ['href="/contact"', 'href="contact.html"'],
  ['href="/blogs"', 'href="blogs.html"'],
  ['href="/precision-cataract-surgery/"', 'href="articles/precision-cataract-surgery.html"'],
  ['href="/comprehensive-eye-exams/"', 'href="articles/comprehensive-eye-exams.html"'],
  ['href="/pediatric-ophthalmology/"', 'href="articles/pediatric-ophthalmology.html"'],
  ['href="/emergency-eye-services/"', 'href="articles/emergency-eye-services.html"'],
  ['href="/lasik-surgery/"', 'href="articles/lasik-surgery.html"'],
  ['href="/glaucoma-treatment/"', 'href="articles/glaucoma-treatment.html"'],
  ['href="/diabetic-retinopathy/"', 'href="articles/diabetic-retinopathy.html"'],
  ['href="/macular-degeneration-care/"', 'href="articles/macular-degeneration-care.html"'],
];

for (const [from, to] of replacements) {
  html = html.split(from).join(to);
}

fs.writeFileSync(path.join(root, "index.html"), html, "utf8");
console.log("Assets restructured and homepage paths updated.");
