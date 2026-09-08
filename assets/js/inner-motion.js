/**
 * Inner pages — Alchemy-style motion: Lenis, cursor, grain, site lines,
 * liquid hero, card tilt/sheen. Dark only. Homepage untouched.
 */
(function () {
  var reduce =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  if (isTouch) document.body.classList.add("is-touch");

  function basePath() {
    return document.documentElement.getAttribute("data-base") || "";
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function ensureChrome() {
    if (!document.querySelector(".ah-grain")) {
      var grain = document.createElement("div");
      grain.className = "ah-grain";
      grain.setAttribute("aria-hidden", "true");
      document.body.appendChild(grain);
    }

    if (!isTouch && !reduce && !document.querySelector(".ah-cursor")) {
      var cursor = document.createElement("div");
      cursor.className = "ah-cursor";
      cursor.innerHTML =
        '<span class="ah-cursor-ring"></span><span class="ah-cursor-plus"></span><span class="ah-cursor-dot"></span>';
      document.body.appendChild(cursor);
    }

    if (!document.querySelector(".site-lines")) {
      var lines = document.createElement("div");
      lines.className = "site-lines";
      lines.setAttribute("aria-hidden", "true");
      lines.innerHTML =
        '<div class="site-line"><span class="site-line-glow"></span></div>' +
        '<div class="site-line"><span class="site-line-glow"></span></div>' +
        '<div class="site-line"><span class="site-line-glow"></span></div>';
      document.body.appendChild(lines);
    }

    var oldAhLines = document.querySelector(".ah-site-lines");
    if (oldAhLines) oldAhLines.remove();

    var oldBeams = document.querySelector(".ah-light-beams");
    if (oldBeams) oldBeams.remove();
  }

  function ensureProgress() {
    if (document.querySelector(".ah-progress-wrap")) return;
    var wrap = document.createElement("div");
    wrap.className = "ah-progress-wrap";
    wrap.setAttribute("aria-label", "Back to top");
    wrap.innerHTML =
      '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50,3 a47,47 0 1,1 0,94 a47,47 0 1,1 0,-94" pathLength="100"/></svg>';
    document.body.appendChild(wrap);
    var path = wrap.querySelector("path");
    if (path) {
      path.style.strokeDasharray = "100";
      path.style.strokeDashoffset = "100";
    }
    function onScroll() {
      var doc = document.documentElement;
      var scrollTop = doc.scrollTop || document.body.scrollTop;
      var height = doc.scrollHeight - doc.clientHeight;
      var progress = height > 0 ? scrollTop / height : 0;
      if (path) path.style.strokeDashoffset = String(100 - progress * 100);
      wrap.classList.toggle("is-visible", scrollTop > 320);
    }
    wrap.addEventListener("click", function () {
      if (window.__ahLenis) window.__ahLenis.scrollTo(0, { immediate: !!reduce });
      else window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function prepareHero() {
    var hero = document.querySelector(".ah-page-hero");
    if (!hero) return null;

    hero.classList.add("ah-has-liquid");

    var oldBg = hero.querySelector(".ah-page-hero__bg");
    if (oldBg) oldBg.remove();
    var oldCanvas = hero.querySelector(".ah-page-hero__canvas");
    if (oldCanvas) oldCanvas.remove();

    if (!hero.querySelector("[data-liquid]")) {
      var stage = document.createElement("div");
      stage.className = "ah-liquid-stage";
      stage.setAttribute("aria-hidden", "true");
      var imgs = [
        "assets/images/doctor/DSC03485.jpg",
        "assets/images/doctor/DSC03584.jpg",
        "assets/images/doctor/DSC03720.jpg",
        "assets/images/uploads/2024/07/DRAS1.jpg",
      ];
      var pick = imgs[Math.floor(Math.random() * imgs.length)] || imgs[0];
      stage.setAttribute("data-liquid", basePath() + pick);
      hero.insertBefore(stage, hero.firstChild);
    }

    return hero;
  }

  function enhanceCards() {
    document
      .querySelectorAll(".ah-card, .ah-box, .ah-service-item, .ah-branch, .ah-reel")
      .forEach(function (card) {
        if (!card.querySelector(".ah-card-sheen")) {
          var sheen = document.createElement("span");
          sheen.className = "ah-card-sheen";
          sheen.setAttribute("aria-hidden", "true");
          card.appendChild(sheen);
        }
        card.classList.add("ah-tilt");
      });
  }

  function runCursor() {
    var cursor = document.querySelector(".ah-cursor");
    if (!cursor || isTouch || reduce) return;
    var dot = cursor.querySelector(".ah-cursor-dot");
    var ring = cursor.querySelector(".ah-cursor-ring");
    var plus = cursor.querySelector(".ah-cursor-plus");
    var pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    var ringPos = { x: pos.x, y: pos.y };

    window.addEventListener("pointermove", function (e) {
      pos.x = e.clientX;
      pos.y = e.clientY;
    });

    var hoverables =
      "a, button, input, select, textarea, .ah-card, .ah-box, .ah-service-item, .ah-btn, .ah-lang-home, .ah-chaty-fab__btn";
    document.addEventListener("pointerover", function (e) {
      if (e.target.closest(hoverables)) document.body.classList.add("is-hovering");
    });
    document.addEventListener("pointerout", function (e) {
      if (e.target.closest(hoverables)) document.body.classList.remove("is-hovering");
    });

    function loop() {
      ringPos.x += (pos.x - ringPos.x) * 0.18;
      ringPos.y += (pos.y - ringPos.y) * 0.18;
      if (dot) dot.style.transform = "translate(" + pos.x + "px," + pos.y + "px)";
      if (plus)
        plus.style.transform =
          "translate(" +
          pos.x +
          "px," +
          pos.y +
          "px) " +
          (document.body.classList.contains("is-hovering") ? "rotate(45deg)" : "");
      if (ring) ring.style.transform = "translate(" + ringPos.x + "px," + ringPos.y + "px)";
      requestAnimationFrame(loop);
    }
    loop();
  }

  function runTilt() {
    if (isTouch || reduce || !window.gsap) return;
    var gsap = window.gsap;
    document.querySelectorAll(".ah-tilt").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", x * 100 + "%");
        card.style.setProperty("--my", y * 100 + "%");
        gsap.to(card, {
          rotateY: (x - 0.5) * 10,
          rotateX: (0.5 - y) * 8,
          duration: 0.45,
          ease: "power3.out",
          overwrite: true,
        });
      });
      card.addEventListener("pointerleave", function () {
        gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power3.out" });
      });
    });
  }

  function runLenis() {
    if (reduce || typeof window.Lenis === "undefined" || !window.gsap) return null;
    var gsap = window.gsap;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
    var lenis = new window.Lenis({
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.95,
    });
    lenis.on("scroll", function () {
      if (window.ScrollTrigger) window.ScrollTrigger.update();
    });
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    window.__ahLenis = lenis;
    return lenis;
  }

  function runLineGlows() {
    if (reduce || !window.gsap) return;
    window.gsap.utils.toArray(".site-line-glow").forEach(function (glow, i) {
      window.gsap.fromTo(
        glow,
        { y: "-30vh" },
        {
          y: "130vh",
          duration: 4.2 + i * 1.15,
          ease: "none",
          repeat: -1,
          delay: i * 0.9,
        }
      );
    });
  }

  function wrapChars(el) {
    if (el.dataset.splitDone === "1") return;
    var walk = function (node) {
      if (node.nodeType === 3) {
        var parts = node.textContent.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        parts.forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
            return;
          }
          var word = document.createElement("span");
          word.className = "word";
          Array.from(part).forEach(function (ch) {
            var span = document.createElement("span");
            span.className = "char";
            span.textContent = ch;
            word.appendChild(span);
          });
          frag.appendChild(word);
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && !node.classList.contains("char")) {
        Array.from(node.childNodes).forEach(walk);
      }
    };
    Array.from(el.childNodes).forEach(walk);
    el.dataset.splitDone = "1";
  }

  var revealTweens = [];

  function markRevealTargets() {
    document
      .querySelectorAll(
        ".ah-page-hero h1, .ah-page-hero > p:not(.ah-gold), .ah-prose > h2, .ah-prose > h3, .ah-box > h3, .ah-reels__title, .ah-services-closing h2, .ah-service-banner h1, .ah-service-banner h2"
      )
      .forEach(function (el) {
        el.classList.add("reveal-title");
        el.setAttribute("data-reveal", "");
      });
  }

  function setupTextReveal() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    revealTweens.splice(0).forEach(function (tween) {
      tween.kill();
    });

    markRevealTargets();

    var rtl = document.documentElement.dir === "rtl";
    var targets = document.querySelectorAll("[data-reveal]");

    if (rtl) {
      targets.forEach(function (el) {
        var tween = gsap.fromTo(
          el,
          { color: "rgba(244,239,228,0.22)" },
          {
            color: "#ffffff",
            textShadow: "0 0 22px rgba(255,255,255,0.28)",
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 82%",
              end: "top 28%",
              scrub: 1.1,
            },
          }
        );
        revealTweens.push(tween);
      });
      return;
    }

    targets.forEach(function (el) {
      wrapChars(el);
    });

    targets.forEach(function (el) {
      var chars = el.querySelectorAll(".char");
      if (!chars.length) return;
      var tween = gsap.fromTo(
        chars,
        {
          color: "rgba(244,239,228,0.18)",
          textShadow: "0 0 0 rgba(255,255,255,0)",
          y: 18,
        },
        {
          color: "#ffffff",
          textShadow: "0 0 22px rgba(255,255,255,0.28)",
          y: 0,
          ease: "none",
          stagger: 0.04,
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            end: "top 28%",
            scrub: 1.1,
          },
        }
      );
      revealTweens.push(tween);
    });
  }

  function runParallax() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    gsap.utils
      .toArray(".ah-card img, .ah-media-frame img, .ah-service-banner__img, .ah-service-sidebar-photo")
      .forEach(function (img) {
        gsap.fromTo(
          img,
          { yPercent: -6, scale: 1.08 },
          {
            yPercent: 6,
            scale: 1.02,
            ease: "none",
            scrollTrigger: {
              trigger: img.closest(".ah-card, .ah-media-frame, .ah-service-banner, .widget") || img,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
  }

  function runGsapIntro() {
    if (reduce || !window.gsap) return;
    var gsap = window.gsap;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

    var heroKids = gsap.utils.toArray(
      ".ah-page-hero > :not(.ah-liquid-stage):not(.ah-page-hero__bg):not(.ah-page-hero__canvas)"
    );
    if (heroKids.length) {
      gsap.fromTo(
        heroKids,
        { y: 48, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "transform",
        }
      );
    }

    var banner = document.querySelector(".ah-service-banner");
    if (banner) {
      gsap.fromTo(
        banner,
        { y: 36, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", clearProps: "transform" }
      );
    }

    if (!window.ScrollTrigger) return;

    gsap.utils
      .toArray(
        ".ah-card, .ah-service-item, .ah-box, .ah-branch, .ah-reel, .ah-split, .ah-services-closing, .ah-service-page .secondary .widget, .ah-form .ah-btn, .ah-service-page .primary"
      )
      .forEach(function (el, i) {
        gsap.fromTo(
          el,
          { y: 48, opacity: 0 },
          {
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
            y: 0,
            opacity: 1,
            duration: 0.85,
            delay: (i % 4) * 0.05,
            ease: "power3.out",
            clearProps: "transform",
          }
        );
      });

    setTimeout(function () {
      window.ScrollTrigger.refresh();
    }, 200);
  }

  function boot() {
    ensureChrome();
    ensureProgress();
    prepareHero();
    enhanceCards();
    if (typeof window.AhLiquidBoot === "function") window.AhLiquidBoot();
    runCursor();
    runLenis();
    runLineGlows();
    runTilt();
    window.requestAnimationFrame(function () {
      setTimeout(function () {
        runGsapIntro();
        runParallax();
        setupTextReveal();
      }, 60);
    });

    window.addEventListener("ah-lang-change", function () {
      setTimeout(function () {
        setupTextReveal();
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      }, 50);
    });
  }

  ready(function () {
    setTimeout(boot, 40);
  });
})();
