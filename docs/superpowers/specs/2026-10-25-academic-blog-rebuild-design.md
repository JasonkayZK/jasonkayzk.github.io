# Academic Blog Rebuild — Design

**Date:** 2026-10-25 (revised 2026-10-25 PM — visual direction switched from jinyansu1.github.io to innei.in "Yohaku" style)
**Status:** Approved by user
**Repo:** `JasonkayZK/JasonkayZK.github.io` (branch `save`, working dir `/Users/zk/workspace/blog`)

## Goal

Rebuild the blog at `jasonkayzk.github.io` from scratch as a professional, academic, English-language personal site for PhD applications. **Content structure is academic** (publications, education, experience, CV); **visual language is ported from https://innei.in/en** (the "Yohaku/余白" theme aesthetic: warm paper background, rose-gray accent, serif display type, timeline lists, dark mode). The old Hexo blog is fully backed up in `__bak/` and none of its content is migrated or used — this is a clean start.

## Constraints & Decisions (user-confirmed)

1. **Generator: Jekyll** (static, GitHub-Pages-compatible) with a fully hand-written theme. innei.in itself runs on Next.js/Mix Space — that stack cannot run on GitHub Pages, so we **port its visual language to vanilla HTML/CSS/JS** instead of using that stack. Deployed via **GitHub Pages native Jekyll build** from the `save` branch root. No GitHub Actions needed anymore.
2. **Old content:** not migrated. `__bak/` stays in the repo as an archive, excluded from the Jekyll build via `exclude:` in `_config.yml`.
3. **Pages:** Home (hero + academic sections), Publications, Blog (single list), Projects, CV page. Plus navbar external links to the existing Chinese site (`https://jasonkayzk.github.io/cn/`) and Japanese site (`https://jasonkayzk.github.io/jp/`).
4. **Visual style — Yohaku port** (user-confirmed choices: hero layout, rose accent, dark mode on):
   - Warm paper background `#faf7f0` (light) / `#1c1c1e` (dark), via CSS custom properties so every color switches with a `data-theme` attribute on `<html>`.
   - Rose-gray accent `#c56473` (light) / `#e095a4` (dark) — innei's signature color.
   - Neutral scale from innei's CSS: text `neutral-9`/`neutral-1..10` pairs (light: `#f9f8f5`–`#141312`, dark: `#141414`–`#f8f8f8`); we mirror these via CSS vars (`--neutral-1` … `--neutral-10`) with values light: `#f9f8f5 #f0efeb #e3e1db #cccac2 #a8a29a #78716c #57534e #3f3f3f #292524 #141312`, dark: `#141414 #242424 #2e2e2e #424242 #646264 #8b8887 #a5a3a0 #c0bebb #dedddb #f8f8f8` (last is most-contrasting; text uses `--neutral-9`-equivalent).
   - Typography: **EB Garamond** (Google Fonts) for display/headings/signature italic accents; system sans for body text; JetBrains Mono/monospace stack for code. innei uses font vars `--app-font-serif` / `--app-font-sans`; we load EB Garamond + Inter from Google Fonts (Inter as the sans, matching innei's clean look).
   - innei-style details: hairline borders (`paper-hairline`, 1px), dashed dividers, serif italic epigraphs, accent-glow text-shadow on the hero name, subtle radial glow behind hero, corner-mark (⌐) decorations on footer/section headers, fade-in-on-load animations (CSS only, `@keyframes` + `.loaded` trigger), rounded cards with soft hover shadow and `-translate-y` lift, pills with accent tint.
   - Dark mode: `prefers-color-scheme` auto + manual toggle button in nav (sun/moon icon) persisted in `localStorage`, applied via `data-theme` attribute with an inline head script to avoid flash-of-wrong-theme.
5. **Content:** all placeholder content (`Your Name`, etc.), formatted complete example entries (2–3 per type) so the user fills in real data later by editing YAML/Markdown only.
6. Deployment switch: after the first build works locally, the user flips GitHub repo Settings → Pages → Source to `save` / `(root)`. Old Hexo workflow and `master` branch build artifacts are left untouched.

## Site Structure

```
.
├── _config.yml               # site config: title, author, url, exclude __bak, kramdown, defaults
├── _data/
│   ├── education.yml         # institution, degree, dates, logo path
│   ├── experience.yml        # company, role, dates, logo path
│   ├── publications.yml      # title, authors (list), venue, year, award, tags, links, abstract
│   └── projects.yml          # name, description, tech tags, links (repo/demo)
├── _layouts/
│   ├── default.html          # <head> (SEO meta, fonts, css, theme init script), nav, content block, footer
│   ├── home.html             # hero (avatar, greeting, tagline, stats, socials) + research interests + recent writing timeline + education/experience
│   ├── page.html             # generic content page (CV, etc.)
│   ├── blog-list.html        # tag filter + timeline-style post list
│   └── post.html             # post header (title/date/category badge/reading time), content, prev/next nav, back link
├── _includes/
│   ├── nav.html              # top nav: Home Publications Blog Projects CV + cn/jp external + theme toggle button
│   ├── footer.html           # © year name · Built with Jekyll & hosted on GitHub Pages · corner-mark decorations
│   ├── social-links.html     # icon links (SVG): GitHub, Google Scholar, Email, RSS
│   ├── experience-list.html  # renders rows from _data (logo + title + subtitle + dates)
│   ├── pub-card.html         # one publication card: title link, authors (owner bold), venue, award badge, links, abstract toggle
│   └── post-card.html        # one blog post row (timeline style)
├── _posts/                   # YYYY-MM-DD-title.md; front matter: title, date, tags, excerpt
├── assets/
│   ├── css/style.scss        # full site stylesheet (Yohaku port: paper vars, serif, hairlines, timeline, cards, dark mode) + syntax highlight
│   └── js/
│       ├── theme.js          # dark-mode toggle: localStorage + prefers-color-scheme + button icon swap
│       ├── blog-filter.js    # tag filtering for blog list
│       └── publications.js   # abstract expand/collapse + topic filtering + hide empty year sections
├── index.md                  # home page content: research interests placeholder text (hero is generated by layout)
├── publications.md           # publications page (renders _data/publications.yml grouped by year desc, Preprints first)
├── blog.md                   # blog list page
├── projects.md               # projects page (renders _data/projects.yml)
├── cv.md                     # CV page (education + experience + skills placeholder sections, CV.pdf link placeholder)
├── img/
│   ├── photo.svg             # placeholder avatar: "JK" monogram on paper tone
│   └── logos/                # placeholder logo blocks (initials), replaced later by user
├── 404.html                  # styled 404 page
├── Gemfile                   # gem "github-pages", jekyll-feed
└── README.md                 # how to run locally, where to edit content, deployment switch steps
```

## Page Specs

### Home
- **Hero** (centered, full-viewport-ish): round avatar (shadow ring), `Hi, I'm Your Name 👋` with the name in accent color + glow, subtitle (`aspiring Ph.D. researcher…`), research keyword chips (`LLM · Systems · RL`), stats row (`N posts · N words · since 2019` — computed by Liquid from `site.posts`), social icon row.
- Below hero: **Research Interests** (from `index.md`), **Recent Writing** — innei's numbered timeline list (01/02/03 on a vertical hairline, accent-numbered first item, category label + title + date), latest 5 posts; **Education** and **Experience** as `experience-list` rows (hairline cards with logo, title, subtitle, dates, corner-mark decorations).
- Content text lives in `index.md` so text edits need no HTML.

### Publications
- Top: `All` + topic filter pills (accent-tinted when active) auto-derived from unique tags.
- Groups in order: **Manuscript** (entries with `venue: "Preprint"`), then year desc.
- Card (paper card, hairline border, hover lift): clickable title (links to PDF), authors with owner name bolded, italic serif venue, rose award badge when present, outline link buttons, `Abstract ▾` toggle expanding a bordered abstract block, small topic tags.
- Data-driven from `_data/publications.yml`; adding a paper = appending YAML.

### Blog
- Single list, innei timeline style: vertical hairline, `01`-style leading number (tabular numerals, accent for newest), category label + serif title + date, reading time; tag filter pills above.
- Post page: serif title, date, category badge, reading time; content; footer with ← Back to Blog and prev/next post links.
- 2 placeholder posts demonstrating the format.

### Projects
- Paper cards with hairline border + hover shadow/lift: project name (serif), one-paragraph description, tech tag pills, repo/demo outline links. 3 placeholder entries.

### CV
- Single page rendering education + experience data plus placeholder Skills/Awards sections and a `[Download CV (PDF)]` outline button (dead link placeholder).

### Navigation & Footer
- Nav (top, hairline bottom border, paper background): `Home  Publications  Blog  Projects  CV` — plus `中文站` / `日文站` external links (subtle separator), and a dark-mode toggle button (sun/moon SVG).
- Footer: `© 2026 Your Name · Built with Jekyll & hosted on GitHub Pages` with innei-style corner-mark (⌐) decorations.

## Interaction/JS

Three small vanilla-JS files, no frameworks:
- `theme.js` (~30 lines): reads localStorage `theme` → sets `data-theme` on `<html>`, falls back to `prefers-color-scheme`; toggle button flips and persists. Inline 2-line variant in `<head>` to prevent FOUC.
- `publications.js`: abstract toggle (aria-expanded), topic filter, hides year sections with no visible cards.
- `blog-filter.js`: tag filter on post rows.

CSS-only animations: fade/translate-in on load for hero elements; no scroll-triggered JS.

## Error/Edge Handling

- Empty `_data` collections or omitted fields render gracefully (`if` guards in includes; no broken rows).
- `exclude: [__bak, docs, .github, ...]` so the 500+ old posts and specs never render.
- 404 page in site style.
- Reading time falls back to "1 min read"; stats row hides word-count segment when there are no posts.
- Theme init script wrapped so it works even if localStorage is unavailable (private mode).

## Testing/Verification

1. `bundle exec jekyll build` succeeds with zero warnings about excluded dirs.
2. `bundle exec jekyll serve` — verify each page renders: home hero/stats/timeline, publications filtering + abstract toggle, blog tag filter + post nav, projects, CV, 404, RSS feed output.
3. Cross-check rendered pages against innei.in for visual fidelity (paper tone `#faf7f0`, accent `#c56473`, serif display, hairlines, timeline, dark mode toggle working with persistence).
4. Responsive check at mobile width (nav collapses to a dropdown; layout adapts).

## Out of Scope (YAGNI)

Migrating old posts; same-site i18n; search; comments; analytics; per-post language switcher; background music/effects toggles; CNAME/custom domain; touching the old cn/jp sites or the `master` branch; server features (view counts, dynamic stats) — home stats are computed at build time.
