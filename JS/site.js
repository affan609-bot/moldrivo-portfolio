/* ============================================================
   MOLDRIVO — Site interactions (NEW)
   This file ONLY powers the redesigned website UI.
   The AI chatbot logic remains untouched in JS/main.js.
   ============================================================ */
(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------
     1. PRELOADER — quick fade, no counter animation
     ------------------------------------------------------------ */
  const preloader = document.querySelector(".preloader");
  if (preloader) {
    setTimeout(() => preloader.classList.add("hidden"), 250);
    document.body.classList.add("loaded");
  } else {
    document.body.classList.add("loaded");
  }

  /* ------------------------------------------------------------
     2. THEME TOGGLE (site nav) — dark / light
     ------------------------------------------------------------ */
  const html = document.documentElement;
  const themeBtn = document.getElementById("theme-toggle-site");
  const savedTheme = localStorage.getItem("moldrivo_theme");
  if (savedTheme) html.setAttribute("data-theme", savedTheme);

  const syncThemeIcons = () => {
    const isDark = html.getAttribute("data-theme") !== "light";
    document.querySelectorAll("[data-theme-icon]").forEach((icon) => {
      icon.style.display = isDark ? "" : "none";
    });
    document.querySelectorAll("[data-theme-icon-light]").forEach((icon) => {
      icon.style.display = isDark ? "none" : "";
    });
  };
  syncThemeIcons();

  // Keep icons + storage in sync when the CHATBOT's own theme toggle flips the attribute
  const themeObserver = new MutationObserver(() => {
    syncThemeIcons();
    localStorage.setItem("moldrivo_theme", html.getAttribute("data-theme") === "light" ? "light" : "dark");
  });
  themeObserver.observe(html, { attributes: true, attributeFilter: ["data-theme"] });

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = html.getAttribute("data-theme") === "light" ? "dark" : "light";
      html.setAttribute("data-theme", next);
      localStorage.setItem("moldrivo_theme", next);
      syncThemeIcons();
    });
  }

  /* ------------------------------------------------------------
     3. NAVBAR — scrolled glass state
     ------------------------------------------------------------ */
  const navbar = document.getElementById("navbar");
  const onScrollNav = () => {
    if (!navbar) return;
    navbar.classList.toggle("scrolled", window.scrollY > 24);
  };
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  /* ------------------------------------------------------------
     4. SCROLL PROGRESS BAR
     ------------------------------------------------------------ */
  const progressBar = document.getElementById("progress-bar");
  if (progressBar) {
    const onProgress = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      progressBar.style.width = `${max > 0 ? (h.scrollTop / max) * 100 : 0}%`;
    };
    onProgress();
    window.addEventListener("scroll", onProgress, { passive: true });
    window.addEventListener("resize", onProgress);
  }

  /* ------------------------------------------------------------
     5. (removed) CUSTOM CURSOR GLOW + DOT — disabled for performance
     ------------------------------------------------------------ */

  /* ------------------------------------------------------------
     6. MOBILE MENU
     ------------------------------------------------------------ */
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const toggleMenu = (open) => {
    if (!mobileMenu || !menuToggle) return;
    const isOpen = open ?? !mobileMenu.classList.contains("open");
    mobileMenu.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    document.body.style.overflow = isOpen ? "hidden" : "";
  };
  if (menuToggle) menuToggle.addEventListener("click", () => toggleMenu());
  if (mobileMenu) mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));

  /* ------------------------------------------------------------
     7. (removed) PAGE TRANSITIONS — normal navigation, no delay
     ------------------------------------------------------------ */

  /* ------------------------------------------------------------
     8. SCROLL REVEAL (IntersectionObserver)
     ------------------------------------------------------------ */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -60px 0px" });
    setTimeout(() => revealEls.forEach((el) => io.observe(el)), 300);
  }

  /* ------------------------------------------------------------
     9. ANIMATED COUNTERS
     ------------------------------------------------------------ */
  const counters = document.querySelectorAll("[data-counter]");
  if (counters.length) {
    const animate = (el) => {
      const end = parseFloat(el.getAttribute("data-counter"));
      const suffix = el.getAttribute("data-suffix") || "";
      const prefix = el.getAttribute("data-prefix") || "";
      const dur = 700;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 4); // easeOutQuart
        const val = Math.round(end * eased);
        el.textContent = `${prefix}${val}${suffix}`;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    setTimeout(() => counters.forEach((el) => cio.observe(el)), 300);
  }

  /* ------------------------------------------------------------
     10. MARQUEE — duplicate content for seamless infinite loop
     ------------------------------------------------------------ */
  document.querySelectorAll(".marquee-track").forEach((track) => {
    if (prefersReduced) return;
    const items = Array.from(track.children);
    items.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });
  });

  /* ------------------------------------------------------------
     11. (removed) HERO PARTICLES CANVAS — disabled for performance
     ------------------------------------------------------------ */

  /* ------------------------------------------------------------
     12. (removed) MAGNETIC BUTTONS — disabled
     ------------------------------------------------------------ */

  /* ------------------------------------------------------------
     13. ACTIVE NAV LINK (per page)
     ------------------------------------------------------------ */
  const pageName = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = (link.getAttribute("href") || "").split("/").pop();
    if (href === pageName || (pageName === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });

  /* ------------------------------------------------------------
     14. PORTFOLIO — filter + modal
     ------------------------------------------------------------ */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");
  const modal = document.getElementById("project-modal");
  const modalBackdrop = document.getElementById("modal-backdrop");

  // Filtering
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter");
      projectCards.forEach((card) => {
        const cats = (card.getAttribute("data-category") || "").split(",");
        const show = filter === "all" || cats.includes(filter);
        card.style.display = show ? "" : "none";
        if (show && !card.classList.contains("revealed")) {
          card.classList.remove("revealed");
          requestAnimationFrame(() => card.classList.add("revealed"));
        }
      });
    });
  });

  // Modal data — real projects with full case-study details
  const PROJECTS = {
    nova: {
      image: "Assets/img/project-1.svg",
      title: "Nova Commerce",
      category: "Websites",
      overview: "A headless ecommerce platform that unifies 12 sales channels into one AI-optimized storefront, built for a global fashion retailer.",
      client: "Nova Retail Group",
      timeline: "14 weeks",
      tech: "HTML · CSS · JS · Stripe API · AI Recommendations",
      challenge: "Fragmented channels and a slow legacy store were bleeding conversions. The team needed one fast, unified shopping experience with intelligent product discovery.",
      solution: "We rebuilt the storefront from scratch with an edge-cached architecture, AI-powered recommendations and a conversion-focused design system.",
      results: ["+248% conversion", "-62% page load time", "$12.4M GMV / year", "4.9★ app rating"],
      url: "https://iron-forge1.netlify.app",
    },
    atlas: {
      image: "Assets/img/project-2.svg",
      title: "Atlas AI",
      category: "AI",
      overview: "An autonomous AI sales agent that qualifies leads, books meetings and answers questions 24/7 — powered by Gemini.",
      client: "Atlas Ventures",
      timeline: "9 weeks",
      tech: "Gemini API · Vanilla JS · REST · CRM Webhooks",
      challenge: "The sales team was overwhelmed by inbound volume, missing 60% of leads after hours and responding slowly during peak traffic.",
      solution: "We designed a multi-turn AI agent trained on the full product catalog and pricing, with human handoff built in.",
      results: ["62% meeting bookings", "24/7 availability", "-85% response time", "3.1× qualified leads"],
      url: "#",
    },
    pulse: {
      image: "Assets/img/project-3.svg",
      title: "Pulse Analytics",
      category: "UI UX",
      overview: "A real-time SaaS analytics dashboard that turns millions of data points into instantly readable decisions.",
      client: "Pulse Technologies",
      timeline: "11 weeks",
      tech: "Data Viz · Design System · Realtime WebSockets",
      challenge: "Users drowned in raw numbers. The old dashboard had a 62% weekly churn and a steep learning curve.",
      solution: "We designed a clean information hierarchy, progressive disclosure and living charts that update in real time.",
      results: ["48.2k active users", "+38% retention", "9.2/10 usability", "0 crash reports"],
      url: "#",
    },
    lumina: {
      image: "Assets/img/project-4.svg",
      title: "Lumina Brand",
      category: "Branding",
      overview: "A complete brand identity — logo, typography, color system and 120+ touchpoints for a premium lifestyle startup.",
      client: "Lumina Studio",
      timeline: "6 weeks",
      tech: "Brand Strategy · Logo Design · Guidelines",
      challenge: "Lumina launched with a generic identity that made them invisible next to aggressive competitors.",
      solution: "We crafted an elegant identity system with a signature mark, refined typography and a golden-glow palette.",
      results: ["120+ touchpoints", "3× brand recall", "Unified identity", "IPO-ready assets"],
      url: "#",
    },
    orbit: {
      image: "Assets/img/project-5.svg",
      title: "Orbit Health",
      category: "Apps",
      overview: "A telehealth mobile app with video consultations, medication tracking and smart reminders.",
      client: "Orbit Health Inc.",
      timeline: "16 weeks",
      tech: "Progressive Web App · WebRTC · Offline-first",
      challenge: "Patients needed reliable care on low-end devices and spotty rural networks — a heavy native app wasn't an option.",
      solution: "We built an offline-first PWA with graceful degradation and a doctor-grade video experience.",
      results: ["120k sessions", "4.8★ store rating", "-70% support tickets", "99.9% uptime"],
      url: "https://smit-demoapplication.netlify.app",
    },
    vertex: {
      image: "Assets/img/project-6.svg",
      title: "Vertex Bank",
      category: "Websites",
      overview: "A fintech core experience — accounts, transfers and insights — processing billions in transactions securely.",
      client: "Vertex Financial",
      timeline: "20 weeks",
      tech: "Banking APIs · Security Hardening · Web Apps",
      challenge: "Strict banking regulations plus the need for a delightful, non-banking-feel interface.",
      solution: "A design-led fintech experience with layered security, biometric login and instant financial insights.",
      results: ["$2.1B processed", "99.99% uptime", "Zero breaches", "4.9★ satisfaction"],
      url: "#",
    },
  };

  const openModal = (key) => {
    const p = PROJECTS[key];
    if (!p || !modal) return;
    modal.querySelector("#pm-image").src = p.image;
    modal.querySelector("#pm-title").textContent = p.title;
    modal.querySelector("#pm-cat").textContent = p.category;
    modal.querySelector("#pm-overview").textContent = p.overview;
    modal.querySelector("#pm-client").textContent = p.client;
    modal.querySelector("#pm-timeline").textContent = p.timeline;
    modal.querySelector("#pm-tech").textContent = p.tech;
    modal.querySelector("#pm-challenge").textContent = p.challenge;
    modal.querySelector("#pm-solution").textContent = p.solution;
    const resultsWrap = modal.querySelector("#pm-results");
    resultsWrap.innerHTML = p.results
      .map((r) => `<div class="result-pill"><b>${r.split(" ")[0]}</b><span>${r.slice(r.indexOf(" ") + 1)}</span></div>`)
      .join("");
    const visit = modal.querySelector("#pm-visit");
    visit.href = p.url;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  };
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("open");
    document.body.style.overflow = "";
  };

  projectCards.forEach((card) => {
    card.addEventListener("click", () => openModal(card.getAttribute("data-project")));
  });
  if (modalBackdrop) modalBackdrop.addEventListener("click", closeModal);
  document.getElementById("modal-close")?.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  /* ------------------------------------------------------------
     15. FAQ ACCORDION
     ------------------------------------------------------------ */
  document.querySelectorAll(".faq-q").forEach((q) => {
    q.addEventListener("click", () => {
      const item = q.closest(".faq-item");
      const answer = item.querySelector(".faq-a");
      const isOpen = item.classList.contains("open");
      // close siblings
      item.parentElement.querySelectorAll(".faq-item.open").forEach((other) => {
        if (other !== item) {
          other.classList.remove("open");
          other.querySelector(".faq-a").style.maxHeight = null;
        }
      });
      item.classList.toggle("open", !isOpen);
      if (isOpen) {
        answer.style.maxHeight = answer.scrollHeight + "px";
        requestAnimationFrame(() => { answer.style.maxHeight = "0px"; });
      } else {
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  /* ------------------------------------------------------------
     15b. FOOTER YEAR
     ------------------------------------------------------------ */
  document.querySelectorAll("#year").forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ------------------------------------------------------------
     16. CONTACT FORM + NEWSLETTER
     POSTs to the Express backend for lead + subscriber capture
     ------------------------------------------------------------ */
  async function postJSON(url, data) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "Request failed");
      return payload;
    } catch (err) {
      console.error("Backend request error:", err);
      throw err;
    }
  }

  // Contact form
  const contactForm = document.getElementById("contact-form");
  const successMsg = document.getElementById("form-success");
  const submitBtn = contactForm ? contactForm.querySelector("button[type='submit']") : null;
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btnTxt = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }
      try {
        await postJSON("/api/contact", {
          name: contactForm.name.value,
          email: contactForm.email.value,
          company: contactForm.company && contactForm.company.value,
          budget: contactForm.budget && contactForm.budget.value,
          service: contactForm.service.value,
          message: contactForm.message.value
        });
        if (successMsg) {
          successMsg.textContent = "✓ Thanks! Your message has been sent. We'll reply within 24 hours.";
          successMsg.classList.add("show");
        }
        contactForm.reset();
        setTimeout(() => successMsg && successMsg.classList.remove("show"), 6000);
      } catch (err) {
        if (successMsg) {
          successMsg.textContent = "Sorry, something went wrong. Please try again or email us directly.";
          successMsg.classList.add("show", "error");
          setTimeout(() => successMsg && successMsg.classList.remove("show", "error"), 6000);
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = btnTxt;
        }
      }
    });
  }

  // Newsletter forms
  document.querySelectorAll("form[data-demo]").forEach((form) => {
    const input = form.querySelector("input[type='email']");
    const btn = form.querySelector("button[type='submit']");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = input && input.value.trim();
      if (!email) return;
      const btnTxt = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Joining…"; }
      try {
        await postJSON("/api/newsletter", { email });
        form.reset();
        if (btn) btn.textContent = "✓ Subscribed";
        setTimeout(() => { if (btn) { btn.textContent = btnTxt; btn.disabled = false; } }, 2500);
      } catch (err) {
        if (btn) { btn.textContent = "Try again"; btn.disabled = false; }
        setTimeout(() => { if (btn) btn.textContent = btnTxt; }, 2500);
      }
    });
  });

  /* ------------------------------------------------------------
     17. BACK TO TOP BUTTON
     ------------------------------------------------------------ */
  const toTopBtn = document.getElementById("to-top");
  if (toTopBtn) {
    window.addEventListener("scroll", () => {
      toTopBtn.classList.toggle("visible", window.scrollY > 500);
    }, { passive: true });
    toTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ------------------------------------------------------------
     18. NAVBAR HIDE ON SCROLL DOWN / SHOW ON SCROLL UP
     ------------------------------------------------------------ */
  let lastScrollY = window.scrollY;
  window.addEventListener("scroll", () => {
    if (!navbar) return;
    const y = window.scrollY;
    navbar.classList.toggle("hide", y > lastScrollY && y > 140);
    lastScrollY = y;
  }, { passive: true });

  /* ------------------------------------------------------------
     19. (removed) CARD 3D TILT — disabled for performance
     ------------------------------------------------------------ */

  /* ------------------------------------------------------------
     20. (removed) HERO PARALLAX — disabled for performance
     ------------------------------------------------------------ */
})();
