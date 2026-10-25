# JasonkayZK.github.io

English academic personal site (PhD-application oriented), built with
Hexo 8 and a hand-written `yohaku` theme (visual language ported from
innei.in). Served by GitHub Pages from the `gh-pages` branch, which is
built and pushed by GitHub Actions on every push to `save`. The old blog
backup lives in `__bak/` and is ignored by the build. Chinese/Japanese
archives live at `/cn/` and `/jp/` (separate repos), linked from the nav.

## Run locally

```bash
npm install        # first time only; Node 24+
npm run server     # → http://localhost:4000
npm run build      # clean + generate into public/
```

**Date rule (important):** dates are Asia/Shanghai wall-clock — quote them and
include the offset: `date: "2026-10-30 10:00:00 +08:00"`. All builds must run
with `TZ=Asia/Shanghai` (CI already does; if you build from another timezone,
prefix commands with `TZ=Asia/Shanghai`). Note: `hexo new` writes the current
UTC time as the date — adjust it to Shanghai local time after creating a post.

## Editing content (no HTML involved)

| What | Where |
|---|---|
| Name, email, tagline, keywords, avatar, social links | `_config.yml` |
| Home hero stats (start year) | `_config.yml` → `site_since` |
| Home page text (research interests, news, contact) | `source/index.md` |
| Education / Experience rows | `source/_data/education.yml`, `source/_data/experience.yml` |
| Publications | `source/_data/publications.yml` |
| Projects | `source/_data/projects.yml` |
| CV skills / awards | `source/_data/cv.yml` |
| Blog posts | `source/_posts/YYYY-MM-DD-title.md` |
| Avatar / institution logos | `source/img/photo.*`, `source/img/logos/` |
| CV PDF | drop `cv.pdf` into `themes/yohaku/source/assets/` |
| Colors / fonts / dark mode | `themes/yohaku/source/assets/css/style.css` (CSS vars at top) |

### Add a blog post

`npx hexo new post "My Post"` (or create `source/_posts/2026-10-30-my-post.md`):

```markdown
---
title: "My Post"
date: "2026-10-30 10:00:00 +08:00"
tags: [systems, rust]      # lowercase, no spaces
categories: technical      # optional badge (list also accepted)
excerpt: "Shown on the blog index."
---

Body in Markdown.
```

### Add a publication

Append to `source/_data/publications.yml` — copy an existing entry's shape.
Use `venue: "Preprint"` (exact capitalization) to list it under
**Manuscript**; otherwise set `year` and it is grouped by year
automatically. Filter pills are derived from `tags`.

### Logos & photo

Replace the SVG placeholders in `source/img/logos/` with real logos
(48×48 works best), and replace the avatar by dropping `source/img/photo.jpg`
and changing `avatar:` in `_config.yml`.

## Deployment

Push to `save` → GitHub Actions builds (`npm ci` + `hexo generate`) and
pushes `public/` to the `gh-pages` branch. Pages serves from `gh-pages`.

One-time setup (if Pages is not yet serving from gh-pages):
1. GitHub → repo → **Settings → Pages**
2. Source: **Deploy from a branch** → Branch: `gh-pages` / `(root)` → Save

The `save` branch is pure source; never edit `gh-pages` by hand. The old
`master` branch holds the last legacy build and can be deleted once the
new site is confirmed live.
