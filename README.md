# Moldrivo — Software Agency Website

A premium, production-ready agency website for **Moldrivo**, built with **pure HTML5, CSS3 and Vanilla JavaScript (ES6)** — no frameworks, no libraries.

It features a fully redesigned luxury-minimalist site (Apple / Linear / Stripe-inspired) **wrapped around your existing AI sales-agent chatbot**, whose architecture, API integration and functionality were preserved exactly as they were.

---

## 🚀 Quick Start

1. **Serve the folder** with any static server (the site uses `fetch`, so it should be served over HTTP, not `file://`):

   ```bash
   npx serve .
   # or
   python -m http.server 8080
   ```

2. Open `http://localhost:8080` (or `index.html`).

> ⚠️ **API key**: before testing the chat, add your real Google Gemini key in `JS/config.js`.

---

## 📁 Project Structure

```
moldrivo-ai agent/
├── index.html        # Home — hero, marquee, services, why-us, process, projects, testimonials, stats, CTA
├── services.html     # 12 service cards (features, tech, pricing)
├── portfolio.html    # Filterable grid + case-study modal
├── team.html         # Team member cards with socials
├── about.html        # Story, mission, values, timeline, achievements, stats
├── contact.html      # Contact form, map, FAQ, hours, Calendly
├── README.md
├── Assets/
│   ├── logo.svg / favicon.svg / og-image.svg
│   └── img/          # project covers + team portraits (SVG art)
├── CSS/
│   └── style.css     # design tokens, themes, components, animations, responsive
└── JS/
    ├── config.js     # ⚠️ UNCHANGED — chatbot config (Gemini key, model, URLs)
    ├── api.js        # ⚠️ UNCHANGED — Gemini REST API service
    ├── main.js       # ⚠️ UNCHANGED — chatbot frontend logic
    └── site.js       # NEW — website UI interactions (loader, nav, reveal, counters, filters, modal, FAQ…)
```

---

## 🤖 AI Sales Agent (preserved as-is)

The chatbot was **not modified**. Your existing:

- **`JS/config.js`** — Gemini API key, model name, booking/WhatsApp/email URLs
- **`JS/api.js`** — `AI_Service` class calling the Gemini REST API with the same system prompt, lead-collection flow and `[SHOW_CTA]` trigger
- **`JS/main.js`** — chat window logic (history, typing indicator, markdown, CTA buttons, download/clear chat, theme toggle)

…are byte-for-byte identical to the originals. The widget markup (`#moldrivo-widget-container`, `#moldrivo-chat-window`, `#moldrivo-fab`, chips, etc.) is also unchanged and included on every page, so the assistant is available site-wide.

The only thing that changed is the **styling**: the widget now matches the redesigned luxury look (see the `AI SALES AGENT WIDGET` section in `CSS/style.css`). Its class names and IDs were left untouched so `main.js` keeps working.

### To customize the assistant
| What | Where |
| --- | --- |
| Gemini API key + model | `JS/config.js` |
| Agent personality / pricing / lead rules | `JS/api.js` → `systemInstruction` |
| Booking, WhatsApp, email links | `JS/config.js` → `URLS` |

---

## 🎨 Design System

- **Palette** — `#0A0A0A` bg · `#111827` secondary · `#161B22` cards · `#2E8BFF` primary · `#A7FF3C` accent
- **Type** — *Space Grotesk* (display), *Inter* (body), *Instrument Serif* (italic accents)
- **Modes** — full **dark / light** theme via `[data-theme]`, persisted in `localStorage`
- **Motion** — preloader with counter, scroll-progress bar, page transitions, scroll reveal, counters, particles canvas, custom cursor glow, magnetic buttons, marquees, float cards — all hand-rolled in `JS/site.js` (no GSAP)

## 🧭 Editing Guide

- **Global styles & tokens** → `CSS/style.css` (variables at the top)
- **Site behavior** → `JS/site.js` (each feature is a numbered, commented block)
- **Project case studies** → `JS/site.js` → `PROJECTS` object (modal is populated from here)
- **Team / services / content** → directly in each HTML file
- **Replace placeholder URLs** (`calendly.com/moldrivo`, `wa.me/…`, `mailto:…`, social links) with your real ones

---

## ✅ Performance & SEO

- Semantic HTML, one CSS file, two small JS files (chatbot + site)
- Lazy-loaded images, `loading="lazy"`, SVG-based art (no heavy media)
- SEO meta, Open Graph, Twitter cards, canonical + `Organization` JSON-LD structured data
- Keyboard-focus styles and `prefers-reduced-motion` support for accessibility

---

## 🔧 To Do After Cloning

1. Add your **Gemini API key** in `JS/config.js`.
2. Replace **Calendly / WhatsApp / email / social URLs** with real ones.
3. Swap the SVG avatar art in `Assets/img/` for real photos if desired.
4. Update the Google Map embed in `contact.html` to your location.
