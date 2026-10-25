# Academic Blog Rebuild — Design

**Date:** 2026-10-25
**Status:** Approved by user
**Repo:** `JasonkayZK/JasonkayZK.github.io` (branch `save`, working dir `/Users/zk/workspace/blog`)

## Goal

Rebuild the blog at `jasonkayzk.github.io` from scratch as a professional, academic, English-language personal site, visually and structurally modeled on <https://jinyansu1.github.io/>. The old Hexo blog is fully backed up in `__bak/` and none of its content is migrated or used — this is a clean start.

## Constraints & Decisions (user-confirmed)

1. **Generator: Jekyll** with a fully hand-written theme (no prebuilt theme), deployed via **GitHub Pages native Jekyll build** from the `save` branch root. No GitHub Actions needed anymore.
2. **Old content:** not migrated. `__bak/` stays in the repo as an archive, excluded from the Jekyll build via `exclude:` in `_config.yml`.
3. **Pages:** Home (sidebar profile + CV sections), Publications, Blog (single list), Projects, CV page. Plus navbar external links to the existing Chinese site (`https://jasonkayzk.github.io/cn/`) and Japanese site (`https://jasonkayzk.github.io/jp/`).
4. **Visual style:** strict replica of the reference site — Inter (body) + Source Serif 4 (headings), academic blue `#2563EB`, text `#1a1a2e`, gray `#6b7280`, white background, `#e5e7eb` borders, fixed 60px top navbar, responsive breakpoints at 1024/768/480px, hamburger menu on mobile.
5. **Content:** all placeholder content (`Your Name`, etc.), formatted complete example entries (2–3 per type) so the user fills in real data later by editing YAML/Markdown only.
6. Deployment switch: after the first build works locally, the user flips GitHub repo Settings → Pages → Source to `save` / `(root)`. Old Hexo workflow and `master` branch build artifacts are left untouched.

## Site Structure

```
.
├── _config.yml               # site config: title, author, url, exclude __bak, sass, kramdown, defaults
├── _data/
│   ├── education.yml         # institution, degree, dates, logo path
│   ├── experience.yml        # company, role, dates, logo path
│   ├── publications.yml      # title, authors (list), venue, year, award, tags, links, abstract
│   └── projects.yml          # name, description, tech tags, links (repo/demo)
├── _layouts/
│   ├── default.html          # <head> (SEO meta, fonts, css), nav, content block, footer
│   ├── home.html             # sidebar (avatar, name, affiliation, social icons) + content (markdown + education/experience lists)
│   ├── page.html             # generic content page (CV, etc.)
│   ├── blog-list.html        # tag filter pills + post cards (title, date, reading time, excerpt)
│   └── post.html             # post header (title/date/category badge/reading time), content, prev/next nav, back link
├── _includes/
│   ├── nav.html              # fixed top nav; Home Publications Blog Projects CV + cn/jp external links
│   ├── footer.html           # © year name. Built with Jekyll & hosted on GitHub Pages.
│   ├── social-links.html     # circular icon buttons (SVG): GitHub, Google Scholar, Email, RSS
│   ├── experience-list.html  # renders rows from _data (logo + title + subtitle + dates)
│   ├── pub-card.html         # one publication card: title link, authors (owner bold), venue, award badge, links, abstract toggle
│   └── post-card.html        # one blog post card for the list page
├── _posts/                   # YYYY-MM-DD-title.md; front matter: title, date, tags, excerpt
├── _sass/                    # (single-file CSS kept instead; see below)
├── assets/
│   ├── css/style.scss        # full site stylesheet (replica of reference palette/layout/components) + syntax highlight vars
│   └── js/
│       ├── blog-filter.js    # tag pill filtering for blog cards
│       └── publications.js   # abstract expand/collapse + topic pill filtering + hide empty year sections
├── index.md                  # home page content: research interests, misc, contact (placeholder text)
├── publications.md           # publications page (renders _data/publications.yml grouped by year desc, Preprints first)
├── blog.md                   # blog list page
├── projects.md               # projects page (renders _data/projects.yml)
├── cv.md                     # CV page (education + experience + skills placeholder sections, CV.pdf link placeholder)
├── img/
│   ├── photo.svg             # placeholder avatar: "JK" monogram, academic blue on light gray
│   └── logos/                # placeholder logo blocks (initials), replaced later by user
├── 404.html                  # styled 404 page
├── Gemfile                   # gem "github-pages", group :jekyll_plugins => jekyll-feed (RSS)
└── README.md                 # how to run locally, where to edit content, deployment switch steps
```

## Page Specs

### Home
- Left sidebar (sticky): avatar, `Your Name`, affiliation line (`Placeholder University`), social icon row.
- Right content: **Research Interests** (2 paragraphs placeholder), **Misc**/news, **Education** and **Experience** as `experience-list` rows driven by `_data/`. Content lives in `index.md` so text edits need no HTML.

### Publications
- Top: `All` + topic filter pills auto-derived from unique tags across all publications.
- Groups in order: **Manuscript** (entries without venue/year → preprints), then year desc (2026 → …).
- Card: clickable title (links to PDF), authors with owner name bolded, italic venue, red award badge when present, outline link buttons (arXiv/Code/Website placeholder), `Abstract ▾` green toggle expanding a bordered abstract block, small gray topic tags.
- Data-driven from `_data/publications.yml`; adding a paper = appending YAML.

### Blog
- Single list. Tag filter pills (derived from all posts' tags) + cards: title, date, reading time (computed from word count, 200 wpm), excerpt.
- Post page: title, date, category badge, reading time; content; footer with ← Back to Blog and prev/next post links.
- 2 placeholder posts demonstrating the format (front matter + `<!-- more -->`-free excerpt field).

### Projects
- Cards in the reference site's visual language (white cards, thin border, hover shadow): project name, one-paragraph description, tech tag pills, repo/demo outline links. 3 placeholder entries.

### CV
- Single page rendering education + experience data plus placeholder Skills/Awards sections and a `[Download CV (PDF)]` outline button (dead link placeholder).

### Navigation & Footer
- Nav: `Home  Publications  Blog  Projects  CV` — plus `中文站` and `日文站` as external links (open in new tab), styled slightly differentiated (e.g. subtle separator) per user's request.
- Footer: `© 2026 Your Name. Built with Jekyll & hosted on GitHub Pages.`

## Interaction/JS

Two small vanilla-JS files (~40 lines each), identical behavior to the reference site:
- `publications.js`: abstract toggle (aria-expanded), topic filter, hides year sections with no visible cards.
- `blog-filter.js`: tag filter on post cards.

No frameworks, no build step beyond Jekyll's own.

## Error/Edge Handling

- Empty `_data` collections or omitted fields render gracefully (`if` guards in includes; no broken rows).
- `exclude: [__bak, docs, .github, ...]` so the 500+ old posts and specs never render.
- 404 page in site style.
- Reading time falls back to "1 min read" for very short posts.

## Testing/Verification

1. `bundle exec jekyll build` succeeds with zero warnings about excluded dirs.
2. `bundle exec jekyll serve` — manually verify each page renders: home sidebar/lists, publications filtering + abstract toggle, blog tag filter + post nav, projects, CV, 404, RSS feed output.
3. Cross-check rendered pages against the reference site for layout fidelity (same class names/structure where possible).
4. Responsive check at mobile width (hamburger nav works — pure CSS checkbox toggle, same as reference).

## Out of Scope (YAGNI)

Migrating old posts; same-site i18n; dark mode; search; comments; analytics; per-post language switcher; CNAME/custom domain; touching the old cn/jp sites or the `master` branch.
