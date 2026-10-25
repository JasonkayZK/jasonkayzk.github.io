# Hexo Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the 60%-complete Jekyll site (Tasks 1–6 of the Jekyll plan done and reviewed; visual assets/data/posts committed) to **Hexo 8** with an identical-output hand-written `yohaku` theme, deployed via Actions→gh-pages.

**Architecture:** Hexo 8.1.2 + EJS theme `themes/yohaku/`, native `site.data.*` for YAML content, marked renderer with a heading override for kramdown parity, hexo-generator-feed for RSS. Source of truth `save` branch root; Actions builds and pushes `public/` to `gh-pages` (peaceiris/actions-gh-pages@v4, GITHUB_TOKEN).

**Tech Stack:** Node 24, hexo ^8.1.2, hexo-renderer-ejs, hexo-renderer-marked, hexo-generator-feed, hexo-server (dev).

**Spec:** `docs/superpowers/specs/2026-10-25-academic-blog-rebuild-design.md` (rev 3, Hexo)

**Working directory:** `/Users/zk/workspace/blog` (branch `save`, HEAD bb9fd40b). `__bak/` and `docs/` — never touch. Commit messages verbatim with the Co-Authored-By line.

**Parity reference:** keep the Jekyll `_site/` directory (untracked) until Task 5 QA completes — it is the ground truth for output comparisons. **Do not delete it before Task 5.**

**Empirical gotchas (verified in a scratch Hexo 8.1.2 site — follow these exactly):**
1. `package.json` must contain `"hexo": {"version": "8.1.2"}` or the CLI silently no-ops.
2. **prev/next inverted vs Jekyll**: Hexo `page.prev` = newer post, `page.next` = older post. (Jekyll `page.previous` = older.) The Jekyll layout rendered "← {{ previous.title }}" as older-post link; in Hexo use `page.next` for the ← link and `page.prev` for the → link.
3. **Front-matter dates must be quoted**: `date: "2026-10-24 21:30:00 +08:00"` — unquoted YAML Dates double-shift by machine TZ (verified 8h bug).
4. `external_link.enable: false` and `meta_generator: false` in config for output parity.
5. `post.tags`/`post.categories` are Query objects of Tag/Category objects — access `.name`; first category via `post.categories.first().name` — guard for empty (`.first()` on empty Query returns undefined).
6. Dates via `date()` helper with moment formats; datetime attr via `date(page.date, 'YYYY-MM-DDTHH:mm:ssZ')` (NOT `date_xml` — it emits UTC).
7. Build with `TZ=Asia/Shanghai` locally and in CI.
8. Highlight markup: Hexo emits `<figure class="highlight python"><table>...<td class="code"><pre>` and token spans `.keyword/.string/.comment/.built_in/.title/.number/.attr/.subst/.literal/.symbol/.function/.params/.tag/.name/.attr` — extend the rouge-style selectors in style.css and reset the table.
9. `marked` injects `headerlink` anchors in headings — remove via `themes/yohaku/scripts/marked.js` renderer override.
10. `source/index.md` with `layout: home` overrides the index generator (good — no hexo-generator-index needed).
11. Local npm registry is npmmirror — fine; but `npm ci` on GH runners must handle mirror `resolved` URLs. If it fails, regenerate the lockfile against the default registry (`npm install --registry=https://registry.npmjs.org`) and commit that.

---

### Task H1: Scaffold — package.json, config, content moves, theme stub

**Files:**
- Create: `package.json`, `themes/yohaku/_config.yml`, `scaffolds/post.md`, `themes/yohaku/layout/layout.ejs` (stub)
- Rewrite: `_config.yml`, `.gitignore`
- Move: `_data/` → `source/_data/` (git mv), `_posts/` → `source/_posts/` (git mv, then quote dates), `img/` → `source/img/` (git mv)
- Delete: `Gemfile`, `Gemfile.lock`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "jasonkayzk-github-io",
  "version": "1.0.0",
  "private": true,
  "hexo": {
    "version": "8.1.2"
  },
  "scripts": {
    "build": "hexo clean && hexo generate",
    "server": "hexo server"
  },
  "dependencies": {
    "hexo": "^8.1.2",
    "hexo-generator-feed": "^4.0.0",
    "hexo-renderer-ejs": "^2.0.0",
    "hexo-renderer-marked": "^7.0.1"
  },
  "devDependencies": {
    "hexo-server": "^3.0.0"
  }
}
```

- [ ] **Step 2: `npm install`** (creates package-lock.json). Expected exit 0.

- [ ] **Step 3: Rewrite `_config.yml`**

```yaml
# Site settings — replace the placeholder values with your own.
title: Your Name
author: Your Name
email: your-email@example.com
description: >-
  Personal website of Your Name — software engineer and aspiring researcher.
  Replace this description in _config.yml.
affiliation: "Aspiring Ph.D. Student"
hero_tagline: "I turn curiosity into systems"
hero_keywords: [LLM, Systems, RL]
site_since: 2019
avatar: "/img/photo.svg"

# Social links shown on the home hero (leave the value unset to hide the icon)
github_username: "JasonkayZK"
scholar_url: "https://scholar.google.com"
twitter_username:

language: en
timezone: 'Asia/Shanghai'

# URL
url: https://jasonkayzk.github.io
permalink: blog/:year/:month/:day/:title/
pretty_urls:
  trailing_index: false

# Directory
source_dir: source
public_dir: public
new_post_name: :year-:month-:day-:title.md
default_layout: post

# Writing
meta_generator: false
external_link:
  enable: false

# Highlight
syntax_highlighter: highlight.js
highlight:
  line_number: false
  auto_detect: false
  wrap: true
  hljs: false

# Markdown (kramdown-parity behavior)
marked:
  breaks: false
  smartypants: false
  autolink: false
  mangle: false
  headerIds: true
  modifyAnchors: 1
  prependRoot: false

# Theme
theme: yohaku

# RSS
feed:
  type: atom
  path: feed.xml
  limit: 20
  content: true
  autodiscovery: true
```

- [ ] **Step 4: Rewrite `.gitignore`**

```gitignore
.DS_Store
node_modules/
public/
db.json
```

(`_site/` intentionally NOT ignored yet? — it IS already matched by nothing; Jekyll is gone so drop `_site/` line. Keep `_site/` on disk until Task 5 QA; add `_site/` entry now too so it can never be committed:)

```gitignore
.DS_Store
node_modules/
public/
db.json
_site/
```

- [ ] **Step 5: Content moves**

```bash
mkdir -p source
git mv _data source/_data
git mv _posts source/_posts
git mv img source/img
```

Then edit BOTH posts in `source/_posts/`: quote the date lines:
`date: 2026-10-20 09:00:00 +08:00` → `date: "2026-10-20 09:00:00 +08:00"` (and the 10-24 one likewise).

- [ ] **Step 6: Write `scaffolds/post.md`**

```markdown
---
title: {{ title }}
date: "{{ date }}"
tags:
categories:
excerpt:
---
```

- [ ] **Step 7: Write `themes/yohaku/_config.yml`**

```yaml
# Theme config — the yohaku theme reads all site settings from the root _config.yml.
```

- [ ] **Step 8: Write stub `themes/yohaku/layout/layout.ejs`**

```html
<!DOCTYPE html>
<html lang="en">
  <head><meta charset="UTF-8"><title><%= page.title || config.title %></title></head>
  <body><%- body %></body>
</html>
```

- [ ] **Step 9: Delete Gemfile**

```bash
git rm Gemfile Gemfile.lock
```

- [ ] **Step 10: Move CSS/JS assets** (keep original paths until Task H2 so nothing is lost — actually move NOW per mapping; Jekyll `assets/` must go):

```bash
mkdir -p themes/yohaku/source/assets/css themes/yohaku/source/assets/js
git mv assets/js/theme.js themes/yohaku/source/assets/js/theme.js
git mv assets/js/blog-filter.js themes/yohaku/source/assets/js/blog-filter.js
git mv assets/js/publications.js themes/yohaku/source/assets/js/publications.js
# style.scss needs front-matter stripped — do it manually:
tail -n +3 assets/css/style.scss > themes/yohaku/source/assets/css/style.css
git add themes/yohaku/source/assets/css/style.css
git rm assets/css/style.scss
```

- [ ] **Step 11: Build check**

```bash
npx hexo clean && TZ=Asia/Shanghai npx hexo generate
```
Expected: exit 0, `public/` generated with `source/_data` NOT copied (underscore rule), posts rendered under `public/blog/2026/10/20/hello-world/index.html` etc. (with default stub layout — ugly but valid).

Run: `ls source/_data source/_posts && grep -c '"hexo"' package.json && test -f themes/yohaku/source/assets/css/style.css && head -1 themes/yohaku/source/assets/css/style.css | grep -qv '^---$' && echo CSS-STRIPPED`
Expected: listings OK, count 1, CSS-STRIPPED.

Run: `test -f public/2026/10/20/hello-world/index.html -o -f public/blog/2026/10/20/hello-world/index.html && echo POST-RENDERED` — NOTE: with `permalink: blog/:year/...` posts land under `/blog/...`; check that path. Expected: POST-RENDERED.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "chore: scaffold hexo 8, config translation, move data/posts/img

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task H2: Theme shell + post/page layouts + partials

**Files:**
- Create: `themes/yohaku/layout/layout.ejs` (full port), `page.ejs`, `post.ejs`, `partial/nav.ejs`, `partial/footer.ejs`, `partial/social-links.ejs`

Convert from the Jekyll sources (READ these exact files and port mechanically — do not redesign):
- `_layouts/default.html` → `layout.ejs`: same head (charset, viewport, title conditional → `<% if (page.title && page.title !== '') { %><%= page.title %> | <% } %><%= config.title %>` via `escape()`; description chain with `truncate` helper equivalents — do raw EJS: `page.excerpt || config.description` then strip tags via regex `.replace(/<[^>]*>/g,'').replace(/\s+/g,' ')` and slice(0,160) then escape; author; two theme-color metas unchanged; canonical → `<%= url_for(page.path) %>` rendered with full URL — use `config.url + '/' + page.path` — simpler: `full_url_for(page.path)`; feed alternate link DROPPED (feed plugin autodiscovery injects it — verify in output); fonts preconnect+link unchanged; stylesheet `url_for('assets/css/style.css')`; FOUC inline script verbatim; THEN leave `<%- partial('partial/nav') %>`, `<main class="page-content"><%- body %></main>`, `<%- partial('partial/footer') %>`, theme.js script `url_for('assets/js/theme.js')`.
- `_includes/nav.html` → `partial/nav.ejs`: `relative_url` → `url_for(...)`; active-state conditionals: `page.url === '/'` becomes `page.path === 'index.html'` (or compare `is_home()`; in EJS locals have `is_home` helper — use `is_home()` for Home, `page.path` startsWith 'publications/' etc.). Simplest robust: `<% var p = page.path || ''; %>` then Home: `p === 'index.html'`; Publications: `p.indexOf('publications/') === 0`; Blog (incl. posts): `p.indexOf('blog/') === 0`; Projects: `p.indexOf('projects/') === 0`; CV: `p.indexOf('cv/') === 0`. cn/jp links verbatim; theme toggle button verbatim.
- `_includes/footer.html` → `partial/footer.ejs`: `site.time | date: '%Y'` → `moment().format('YYYY')`; text "Built with Jekyll" → "Built with Hexo" (the ONE intentional content diff).
- `_includes/social-links.html` → `partial/social-links.ejs`: conditionals on `config.github_username` etc. (nil-safe: `if (config.github_username)`); RSS href `full_url_for('feed.xml')`; SVGs verbatim.
- `_layouts/page.html` → `page.ejs`: `.page-container`, conditional `page-title` (`page.title` when set AND non-empty — CV page has a title, home uses home.ejs not page.ejs).
- `_layouts/post.html` → `post.ejs`: header (page-label from `page.categories.first() && page.categories.first().name || 'Writing'` guarded; title escaped; time datetime `date(page.date, 'YYYY-MM-DDTHH:mm:ssZ')` + display `date(page.date, 'MMMM D, YYYY')`; category badge; reading time via `Math.max(1, Math.floor(page.content.replace(/<[^>]*>/g,'').split(/\s+/).filter(Boolean).length / 200))`); content `<%- page.content %>`; footer back-link; **prev/next SWAPPED**: `← ` link uses `page.next` (older post) when `page.next`, `→` link uses `page.prev` (newer post) when `page.prev`; classes `post-nav-prev`/`post-nav-next` stay attached to the ← and → links respectively.

- [ ] **Step 1-6:** write the six files per above.
- [ ] **Step 7: Build + verify**

```bash
npx hexo clean && TZ=Asia/Shanghai npx hexo generate
```

Run: `grep -c 'site-nav' public/index.html` → ≥1; `grep -c 'theme-toggle' public/index.html` → ≥1; `grep -c 'jasonkayzk.github.io/cn/' public/index.html` → ≥1; `grep -c "localStorage.getItem('theme')" public/index.html` → ≥1; `test -f public/assets/js/theme.js` → exists; `grep -c 'assets/css/style.css' public/index.html` → ≥1 (stylesheet link intact); `grep -c 'generator' public/index.html` → 0 lines matching `name="generator"`.

Run: `grep -o 'datetime="[^"]*"' public/blog/2026/10/24/code-blocks-example/index.html`
Expected: `datetime="2026-10-24T21:30:00+08:00"` (proves quoting + timezone pipeline).

Run older post: `grep -c 'post-nav-next' public/blog/2026/10/20/hello-world/index.html` → 1 and `grep -c 'post-nav-prev' public/blog/2026/10/20/hello-world/index.html` → 0 (newer post link only, pointing to Code Blocks post — matches Jekyll `_site/` behavior).

Run: `diff <(grep -o 'class="active"[^>]*>[A-Za-z]*' _site/index.html) <(grep -o 'class="active"[^>]*>[A-Za-z]*' public/index.html)` → empty or Home diff only.

- [ ] **Step 8: Commit** — `feat: yohaku theme shell, post/page layouts, assets`

```bash
git add themes/yohaku
git commit -m "feat: yohaku theme shell, post/page layouts, assets

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task H3: Home, blog, publications pages

**Files:**
- Create: `themes/yohaku/layout/home.ejs`, `blog.ejs`, `publications.ejs`, `partial/experience-list.ejs`, `partial/pub-card.ejs`
- Create: `source/index.md`, `source/blog/index.md`, `source/publications/index.md`

Conversions (read the Jekyll originals in git history if needed — `git show 1e6e089c:_layouts/home.html` etc. — they were deleted from worktree in H1 only if moved; THEY ARE NOT — _layouts still exists! NOTE: `_layouts/`, `_includes/`, `index.md`, `publications.md`, `blog.md` were NOT deleted in H1 — delete them in THIS task after the ports are verified):
- `home.ejs` ← `_layouts/home.html`: stats: `site.posts.length`; total words: `site.posts.reduce((s,p)=>s+p.content.replace(/<[^>]*>/g,'').split(/\s+/).filter(Boolean).length,0)`; years: `moment().format('YYYY') - Number(config.site_since)`; hero fields from `config.*`; keywords loop `config.hero_keywords.forEach`; recent-writing: `site.posts.slice(0,5)` (already newest-first), index pad via `String(i+1).padStart(2,'0')`, meta date `date(post.date,'MMM D, YYYY')`, category `post.categories.first()` guarded, title escaped; education/experience via `partial('partial/experience-list',{items: site.data.education})` guarded on truthiness.
- `experience-list.ejs` ← include: EJS with `items` local; guard `if (!items || !items.length) return ''` pattern (EJS partial: `<% if (items && items.length) { %>...<% } %>`); fields escaped via `escape()` helper (the EJS `<%= %>` escapes automatically — USE `<%= %>` for all data output, it escapes; use `<%- %>` only for trusted HTML like content).
- `blog.ejs` ← `_layouts/blog-list.html`: tags from `site.posts` — `var tags = []; site.posts.each(function(p){ p.tags.each(function(t){ if (tags.indexOf(t.name)===-1) tags.push(t.name); }); }); tags.sort();` pills with aria-pressed (All true) + `data-tag` escaped; timeline items: `site.posts.each(function(post, i)` with data-tags `post.tags.map(t=>t.name).join(',')`, index padStart, meta (date, first category guarded, reading time), title; loop with i for first-large.
- `publications.ejs` ← `publications.md`: layout default wrapper content; `var pubs = site.data.publications || []`; topics: set of all tags sorted; `var manuscripts = pubs.filter(p=>p.venue==='Preprint')`; `var published = pubs.filter(p=>p.venue!=='Preprint')`; years: `[...new Set(published.map(p=>p.year))].sort((a,b)=>b-a)`; per-year `published.filter(p=>p.year===y)`; pub-card partial `{pub: p}`; script tag publications.js; page-label `Research`, page-title `Publications`.
- `partial/pub-card.ejs` ← `_includes/pub-card.html`: local `pub`; `data-tags` = `(pub.tags||[]).join(',')`; title linked when `pub.pdf`; authors loop with strong when `a === config.author`, `<%= %>` escaping; venue + award; links loop; abstract toggle + details; tags chips.
- `source/index.md` ← `index.md` (git mv): front matter `layout: home`, `title: ""` — Hexo: empty title fine; body verbatim.
- `source/blog/index.md`: `layout: blog`, `title: Blog`.
- `source/publications/index.md`: `layout: publications`, `title: Publications`.

After verification, delete the Jekyll page/layout files:
```bash
git rm -r _layouts _includes index.md publications.md blog.md
```

- [ ] **Verify:**
```bash
npx hexo clean && TZ=Asia/Shanghai npx hexo generate
grep -c 'hero-greeting' public/index.html          # ≥1
grep -c 'class="experience-item"' public/index.html # 4
grep -c 'Recent Writing' public/index.html          # 1
grep -c 'timeline-index' public/index.html          # 2
grep -oE '[0-9]+k</strong> words' public/index.html # 0k (154 words) — same as Jekyll
grep -c 'class="timeline-item blog-post-card"' public/blog/index.html  # 2
grep -c 'filter-pill' public/blog/index.html        # 4
grep -c 'aria-pressed="true"' public/blog/index.html # 1
grep -c 'class="pub-card"' public/publications/index.html # 3
grep -c '>Manuscript<' public/publications/index.html # 1
grep -cE '>2025<|>2024<' public/publications/index.html # 2
grep -c 'pub-award' public/publications/index.html  # 1
grep -c '<strong>Your Name</strong>' public/publications/index.html # 3
grep -c 'aria-pressed' public/publications/index.html # 4
```
Parity diff vs `_site/`: `diff <(grep -o 'data-tags="[^"]*"' _site/blog/index.html) <(grep -o 'data-tags="[^"]*"' public/blog/index.html)` — empty.

- [ ] **Commit:** `feat: home, publications, blog pages with data loaders`

---

### Task H4: Projects, CV, 404, feed, markdown parity

**Files:**
- Create: `themes/yohaku/layout/projects.ejs`, `cv.ejs`, `source/projects/index.md`, `source/cv/index.md`, `source/404.md`, `themes/yohaku/scripts/marked.js`
- Modify: `themes/yohaku/source/assets/css/style.css` (highlight selector extension)

- `projects.ejs`: from Jekyll plan Task 7 spec (cards from `site.data.projects`, name linked when `repo`, description, tag chips, GitHub/Demo links).
- `cv.ejs`: page-container, page-label `Curriculum`, title `CV`, Download CV link `url_for('assets/cv.pdf')` + placeholder note, Education/Experience via experience-list partial, Skills/Awards placeholder lists (raw `<h2>` + `<ul>` from the Jekyll plan cv.md).
- `source/404.md`: `layout: page`? — needs the notfound styling; make a dedicated tiny layout inline: front matter `layout: page` + body:
  ```html
  <div class="page-container notfound">
    <div class="page-label">Lost</div>
    <h1 class="page-title">404</h1>
    <p>The page you are looking for does not exist or has been moved.</p>
    <p><a href="/">← Back to Home</a></p>
  </div>
  ```
  BUT `page.ejs` already wraps in `.page-container` + prints `page-title` from title — so give 404.md `title: "404"` and body just the label+p+link, letting the layout provide container/title. Simpler and consistent. `permalink: 404.html` in front matter.
- `themes/yohaku/scripts/marked.js`:

```javascript
'use strict';

hexo.extend.filter.register('marked:renderer', function (renderer) {
  renderer.heading = function (text, level) {
    // kramdown-style: id on the heading, no headerlink anchor
    var id = text.toLowerCase().replace(/<[^>]*>/g, '').replace(/[^\w一-龥- ]/g, '').trim().replace(/\s+/g, '-');
    return '<h' + level + ' id="' + id + '">' + text + '</h' + level + '>';
  };
  return renderer;
});
```

- style.css: after the existing `.highlight .mi, .highlight .mf` block, add:

```css
/* Hexo highlight.js long-name tokens + figure/table resets */
.highlight .keyword { color: #a35d6a; }
.highlight .string, .highlight .subst { color: #5c6e5a; }
.highlight .comment { color: #8b8887; font-style: italic; }
.highlight .built_in, .highlight .literal, .highlight .symbol { color: #55628d; }
.highlight .title, .highlight .function { color: #8a6a4f; }
.highlight .number { color: #7a5b3a; }
.highlight .attr, .highlight .attribute { color: #8a6a4f; }
.highlight .params { color: #57534e; }
.highlight .tag, .highlight .name { color: #a35d6a; }
figure.highlight {
  margin: 0 0 1.5em;
  border: 1px solid var(--hairline);
  border-radius: 8px;
  background: var(--neutral-2);
  overflow-x: auto;
}
figure.highlight table { margin: 0; border: none; width: 100%; }
figure.highlight td { border: none; padding: 0; background: none; }
figure.highlight td.code { width: 100%; }
figure.highlight pre { margin: 0; border: none; background: none; border-radius: 0; }
```

- [ ] **Verify:**
```bash
npx hexo clean && TZ=Asia/Shanghai npx hexo generate
test -f public/404.html && echo HAS-404         # HAS-404
grep -c 'class="project-card"' public/projects/index.html  # 3
grep -c 'class="experience-item"' public/cv/index.html     # 4
grep -c 'Download CV' public/cv/index.html     # 1
grep -c '<entry>' public/feed.xml              # 2
grep -c 'headerlink' public/blog/2026/10/24/code-blocks-example/index.html  # 0
grep -c 'figure class="highlight' public/blog/2026/10/24/code-blocks-example/index.html  # ≥1
grep -c 'atom+xml' public/index.html           # autodiscovery link ≥1
```

- [ ] **Commit:** `feat: projects, cv, 404, feed; kramdown and highlight parity`

---

### Task H5: CI workflow, README, final QA parity pass

**Files:**
- Create: `.github/workflows/deploy.yml`, `README.md`

- [ ] `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [save]
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: deploy
  cancel-in-progress: true

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    env:
      TZ: Asia/Shanghai
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npx hexo clean && npx hexo generate
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
          publish_branch: gh-pages
          commit_message: 'deploy: ${{ github.sha }}'
```

- `README.md`: rewrite for Hexo — commands (`npm install`, `npm run server`, `npm run build`), content-editing table (same YAML surfaces, paths now `source/_data/`, `source/_posts/`), **the date-quoting rule** (always quote front-matter dates), add-post/add-publication recipes, deploy explanation (push to save → Actions → gh-pages; Pages Source must be set to `gh-pages` / `(root)` — one-time manual step), macOS CLT note REMOVED (Ruby gone), Node 24 requirement.

- [ ] **QA matrix (local, before commit):**
```bash
npx hexo clean && TZ=Asia/Shanghai npx hexo generate
# parity vs Jekyll reference:
diff <(grep -o 'class="active"[^>]*>[A-Za-z]*' _site/publications/index.html) <(grep -o 'class="active"[^>]*>[A-Za-z]*' public/publications/index.html)  # empty
for p in / /blog/ /publications/ /projects/ /cv/ /404.html /feed.xml; do
  echo "== $p"; grep -c 'site-nav' "public$p" 2>/dev/null || echo MISSING
done  # all ≥1 (for feed.xml expect 0 — skip feed)
grep -c 'name="generator"' public/index.html  # 0
grep -o 'datetime="[^"]*"' public/blog/2026/10/24/code-blocks-example/index.html  # +08:00
# dark mode assets:
test -f public/assets/js/theme.js && test -f public/assets/js/blog-filter.js && test -f public/assets/js/publications.js && test -f public/assets/css/style.css && echo ASSETS-OK
```
Interactive: `npm run server` → check pages visually (paper bg, rose accent, dark toggle + persistence, filters, abstract toggle, hamburger at mobile width).

Delete the Jekyll reference AFTER user confirms deployment: keep `_site/` for now (gitignored).

- [ ] **Commit:** `ci: deploy to gh-pages via actions; docs: README`

---

### Deploy (user manual steps — do NOT run without the user)

1. `git push origin save`
2. Watch the Actions run complete (it pushes `gh-pages`).
3. GitHub → Settings → Pages → Source: *Deploy from a branch* → Branch: `gh-pages` / `(root)` → Save.
4. Verify `https://jasonkayzk.github.io/`. (Old `master` branch can be deleted after confirmation — ask user first.)
