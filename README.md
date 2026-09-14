# Lavender Pin Co.

The full site for Lavender Pin Co's Pinterest strategy and Shopify web design services — 8 static HTML pages sharing one design system, no build step.

## Pages

| File | What it is |
|---|---|
| `index.html` | **Home** — the two-disciplines chooser (Pinterest Marketing / Shopify Web Design), takes the root URL |
| `pinterest-audit.html` | Pinterest SEO Audit ($197 one-time offer) — carries the live Flodesk opt-in embed ("5 Pinterest SEO Mistakes Costing You Traffic"), which hands off to `checklist.html` after signup |
| `website-starter.html` | Website Starter ($249 one-time offer) |
| `portfolio.html` | Case studies (Your Kind Mind, Marie Gems, E'llegant Creations Bakery) + the full drag/scroll portfolio carousel |
| `about.html` | About Lavender Pin Co / the strategist behind it |
| `contact.html` | Contact form |
| `checklist.html` | Free lead-magnet reward page — "5 Pinterest SEO Mistakes Costing You Traffic". Reached only after opting in via the Flodesk form on `pinterest-audit.html`; deliberately **not** linked from the main nav or footer (it's not a page for cold visitors to browse to directly), and carries no Flodesk embed of its own |
| `faqs.html` | Full Pinterest marketing FAQ knowledge base, 7 sections |

## Shared design system

- `style.css` — single shared stylesheet: design tokens, animations (scroll-reveal, self-drawing SVG icons, hero auto-scroll, proof marquee, portfolio deck), and every reusable component class. Extend this file rather than writing page-specific styles.
- `partials/nav.html` and `partials/footer.html` — shared chrome, injected into every page via `data-include="partials/nav.html"` / `data-include="partials/footer.html"` and a tiny fetch-based loader (`assets/js/include.js`). Each page's `<body data-page="...">` attribute drives the nav's active-link state.
- `assets/js/main.js` — the site's animation/interaction JS (scroll-reveal observer, hero device auto-scroll, portfolio deck drag/scroll logic), shared by every page. Degrades to fully visible/static content with JavaScript disabled.
- `assets/portfolio/` — real screenshots used across proof strips, the portfolio deck, and case-study visuals.
- `content-source/` — the September 2026 copy rewrite (per-page copy with headline alternates and rationale, plus a blog-post rewrite not yet built into pages) — reference material, not served.
- Fonts: Poppins / Playfair Display / Inter via Google Fonts. No external JS libraries besides the Flodesk embed on `pinterest-audit.html`.

## Local preview

The shared nav/footer load via `fetch()`, which browsers block under `file://` — **serve the folder, don't open the HTML file directly**:

```bash
npx serve lavender-pin-co
```

or `python -m http.server` from inside the folder, then open `http://localhost:<port>/`.

## Deploy

Push to `main` and enable GitHub Pages (Settings → Pages → Deploy from branch → `main` / root) to serve at `https://mariegems.github.io/lavender-pin-co/`.

**Root URL note:** the audit page used to live at `/`; Home now does, and the audit moved to `/pinterest-audit.html`. If anything (ads, bio links, backlinks) points at root expecting the audit page, add a host-level redirect (e.g. a Netlify `_redirects` file, or GitHub Pages' own 404-redirect trick) before relying on old links.

**Known open item:** `contact.html`'s form has no backend wired yet — it currently falls back to opening a pre-filled `mailto:` on submit. Swap in Netlify Forms or Formspree once the hosting provider is confirmed (see the `TODO` comment in `contact.html`).

## Brand

Colors, type, and component rules live in `DESIGN.md` in the main myBusiness project, under the "Lavender Pin Co" section — background `#F3EEF9` is required, not optional.
