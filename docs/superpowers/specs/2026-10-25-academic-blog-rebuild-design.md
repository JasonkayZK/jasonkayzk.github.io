# Academic Blog Rebuild — Design

**Date:** 2026-10-25 (rev 2 PM — visual switched to innei.in "Yohaku"; rev 3 — **framework switched Jekyll → Hexo** at user request, mid-implementation)
**Status:** Approved by user
**Repo:** `JasonkayZK/JasonkayZK.github.io` (branch `save`, working dir `/Users/zk/workspace/blog`)

## Goal

Rebuild the blog at `jasonkayzk.github.io` from scratch as a professional, academic, English-language personal site for PhD applications. **Content structure is academic** (publications, education, experience, CV); **visual language is ported from https://innei.in/en** (the "Yohaku/余白" aesthetic: warm paper background, rose-gray accent, serif display type, timeline lists, dark mode). The old Hexo blog is fully backed up in `__bak/` and none of its content is migrated or used — this is a clean start.

**Framework history:** the site was originally implemented on Jekyll (Tasks 1–6 of the first plan, with full review cycles — 645-line stylesheet, 3 JS files, data YAMLs, placeholder images, and 2 sample posts all committed and verified). At that point the user requested a switch to **Hexo** (familiarity). All framework-neutral assets carry over; the template layer is converted Liquid → EJS; deployment changes from Pages-native build to Actions→gh-pages. Visual output must remain identical.

## Constraints & Decisions (user-confirmed)

1. **Generator: Hexo 8** with a fully hand-written theme `themes/yohaku/` (EJS templates — Hexo default engine, closest to the existing markup). Deployed via **GitHub Actions → `gh-pages` branch** (peaceiris/actions-gh-pages@v4, built-in `GITHUB_TOKEN`, no secrets needed); Pages serves from `gh-pages`. The `save` branch root is pure source.
2. **Old content:** not migrated. `__bak/` stays in the repo untouched (Hexo ignores underscore dirs natively).
3. **Pages:** Home (hero + academic sections), Publications, Blog (single list), Projects, CV page. Plus navbar external links to the existing Chinese site (`https://jasonkayzk.github.io/cn/`) and Japanese site (`https://jasonkayzk.github.io/jp/`).
4. **Visual style — Yohaku port** (user-confirmed: hero layout, rose accent, dark mode on):
   - Warm paper background `#faf7f0` (light) / `#1c1c1e` (dark), CSS custom properties switching via `[data-theme]` on `<html>`.
   - Rose-gray accent `#c56473` (light) / `#e095a4` (dark).
   - Typography: EB Garamond (display) + Inter (body) + JetBrains Mono (code), via Google Fonts.
   - innei-style details: hairlines, dashed dividers, serif italics, accent-glow on hero name, radial hero glow, corner-mark (⌐) decorations, fade-up entrance animations, hover-lift cards, accent-tinted pills.
   - Dark mode: prefers-color-scheme auto + manual toggle (localStorage, `data-theme` attr, inline FOUC guard in `<head>`).
5. **Content:** all placeholder content (`Your Name`, etc.). Content-editing surface for the user stays YAML-driven: `source/_data/*.yml` (publications/education/experience/projects) read via Hexo's native `site.data.*` (verified in Hexo 8 — no plugin needed), markdown posts in `source/_posts/`, site keys in `_config.yml`.
6. Deployment: Actions workflow `.github/workflows/deploy.yml` on push to `save`; user flips Pages Source to `gh-pages` / `(root)` once. `master` (old Hexo build archive) may be deleted later.

## Hexo migration decisions (empirically verified in a scratch Hexo 8.1.2 site)

- `package.json` MUST contain `"hexo": {"version": "8.1.2"}` or the CLI silently no-ops.
- Template engine: **EJS**. `layout.ejs` (shared shell with `<%- body %>`) replaces `default.html`; includes become `layout/partial/*.ejs` via `partial('partial/x', {locals})`.
- **Prev/next is inverted vs Jekyll:** Jekyll `page.previous` (older) == Hexo `page.next`, and vice versa. Getting this backwards is the #1 silent breakage.
- **Front-matter dates must be quoted** (`date: "2026-10-24 21:30:00 +08:00"`) — unquoted YAML Dates get double-shifted by machine TZ (verified 8h bug). Combined with `timezone: 'Asia/Shanghai'` in config and `TZ: Asia/Shanghai` in CI.
- Config parity switches: `external_link.enable: false` (else Hexo rewrites external links), `meta_generator: false`, `syntax_highlighter: highlight.js` with `line_number: false`, `marked` options tuned to kramdown behavior (`modifyAnchors: 1`); heading `headerlink` anchors removed via a small `themes/yohaku/scripts/marked.js` renderer override.
- Highlight markup differs (Hexo emits `figure.highlight > table > td.code` with long token names `.keyword/.string/.comment/...`): style.css gains ~15 lines extending the rouge-selector lists and resetting `figure.highlight` tables — visual parity, not byte parity.
- RSS: hexo-generator-feed@4 with `path: feed.xml`; its autodiscovery injects the alternate link where `{% feed_meta %}` was.
- 404: `source/404.md` with `permalink: /404.html` (Pages needs the exact file).
- URLs preserved: `permalink: blog/:year/:month/:day/:title/`, assets served from `/assets/css|js/*` via `themes/yohaku/source/`.
- Dates in templates via `date()` helper with moment formats (`'MMM D, YYYY'`); `date_xml` emits UTC — use `date(page.date,'YYYY-MM-DDTHH:mm:ssZ')` for datetime attributes.

## Site Structure (Hexo)

```
.
├── _config.yml               # site keys (title/author/email/affiliation/hero_*/site_since/avatar/socials)
│                             # + hexo: url, permalink, timezone, theme: yohaku, highlight/marked/feed config,
│                             #   external_link/meta_generator off
├── package.json              # hexo 8.1.2 (+ "hexo".version field), renderers (ejs, marked), generator-feed, hexo-server
├── scaffolds/post.md         # new-post scaffold with quoted-date + excerpt conventions
├── themes/yohaku/
│   ├── _config.yml           # comment-only placeholder
│   ├── layout/
│   │   ├── layout.ejs        # shell: head (SEO, fonts, css, FOUC guard, feed autodiscovery), nav, body, footer, theme.js
│   │   ├── home.ejs          # hero + research interests content + recent writing + education/experience
│   │   ├── blog.ejs          # tag pills + timeline list
│   │   ├── post.ejs          # post header/content/prev-next (directions swapped vs Jekyll!)
│   │   ├── page.ejs          # generic content page
│   │   ├── publications.ejs  # topic pills + Manuscript/year groups + pub-card partials
│   │   ├── projects.ejs      # project cards from site.data.projects
│   │   ├── cv.ejs            # education/experience/skills/awards + CV.pdf link
│   │   └── partial/
│   │       ├── nav.ejs           # 5 links + cn/jp external + theme toggle
│   │       ├── footer.ejs        # © year · Jekyll→Hexo credit · corner marks
│   │       ├── social-links.ejs  # conditional social icons
│   │       ├── experience-list.ejs
│   │       └── pub-card.ejs      # one publication card (param: pub)
│   ├── scripts/marked.js     # heading renderer override (no headerlink anchors)
│   └── source/assets/
│       ├── css/style.css     # ported stylesheet (front matter stripped) + highlight-class extensions
│       └── js/{theme.js, blog-filter.js, publications.js}
├── source/
│   ├── _data/{education,experience,publications,projects}.yml   # user's editing surface
│   ├── _posts/*.md           # quoted dates; tags/categories/excerpt front matter
│   ├── img/photo.svg, img/logos/*.svg
│   ├── index.md              # layout: home (overrides index generator)
│   ├── blog/index.md         # layout: blog
│   ├── publications/index.md # layout: publications
│   ├── projects/index.md     # layout: projects
│   ├── cv/index.md           # layout: cv
│   └── 404.md                # permalink: /404.html
├── .github/workflows/deploy.yml   # push to save → npm ci → hexo generate → gh-pages (peaceiris v4, GITHUB_TOKEN)
├── README.md                 # hexo commands, content editing guide, date-quoting rule, deploy docs
└── docs/                     # specs + plans (unchanged)
```

## Page Specs

### Home
- **Hero** (centered): avatar, `Hi, I'm Your Name 👋` (name in accent + glow, wave aria-hidden), tagline, keyword chips, stats row (posts / k-words / years, computed at template time), social icons.
- Below: **Research Interests** (from `source/index.md` body), **Recent Writing** timeline (01/02/… on a vertical hairline, latest 5), **Education** / **Experience** rows from `site.data.*` via `experience-list` partial.

### Publications
- Topic filter pills (from unique tags across `site.data.publications`) + **Manuscript** section (venue === "Preprint") + year-descending sections. pub-card: linked title, bolded owner-author, italic venue, award badge, outline links, abstract toggle, tag chips. All data output escaped.

### Blog
- Tag filter pills + timeline list (indices, date, first category, reading time at 200wpm, serif title, large on first). Post page: label/title/date/badge/reading-time header, content, ← Back to Blog, prev/next (Hexo direction semantics).

### Projects
- Cards from `site.data.projects`: serif name (linked when repo), description, tag chips, GitHub/Demo outline links.

### CV
- Education + Experience via shared partial, placeholder Skills/Awards sections, `[Download CV (PDF)]` outline link.

### Navigation & Footer
- Nav: Home / Publications / Blog / Projects / CV + 中文站/日文站 external links (left hairline separator) + dark-mode toggle. Footer: `© YYYY Your Name · Built with Hexo & hosted on GitHub Pages` + corner marks.

## Interaction/JS

Three vanilla ES5 files (ported verbatim from the Jekyll build, all review fixes included: aria-pressed pills, `Array.prototype.some` visibility check, Safari mq fallback):
- `theme.js` — dark toggle, localStorage, prefers-color-scheme auto-follow.
- `publications.js` — abstract toggle (aria-expanded), topic filter, hide empty year sections.
- `blog-filter.js` — tag filter.

## Error/Edge Handling

- Data files absent/empty → sections hidden via truthiness guards.
- Reading time `Math.max(1, floor(words/200))`; stats words floor to k.
- 404 in site style at `/404.html`.
- Date pipeline: quoted FM dates + `timezone: Asia/Shanghai` + `TZ` in CI — QA grep `datetime="2026-10-24T21:30:00+08:00"`.

## Testing/Verification

Per-task greps plus a final parity pass: build with `TZ=Asia/Shanghai npx hexo generate`, compare with the preserved Jekyll `_site/` output (nav active states, hero stats, card counts, data-tags attribute sets, dark toggle script presence, absence of generator meta). Interactive: paper bg, accent #c56473, dark toggle persists, filters work, hamburger nav at mobile width.

## Out of Scope (YAGNI)

Migrating old posts; same-site i18n; search; comments; analytics; custom domain; touching `__bak/`, old cn/jp sites, or `master`; dynamic stats.
