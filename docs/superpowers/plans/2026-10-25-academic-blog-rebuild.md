# Academic Blog Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `jasonkayzk.github.io` from scratch as an English academic personal site with a hand-written Jekyll theme replicating <https://jinyansu1.github.io/>, deployed via GitHub Pages native build from the `save` branch.

**Architecture:** Jekyll (github-pages gem) with fully hand-written layouts includes, data-driven content in `_data/*.yml`, one stylesheet adapted from the reference site, two small vanilla-JS filter scripts. No frameworks, no CI — GitHub Pages builds the `save` branch root directly.

**Tech Stack:** Ruby 3.3 + Bundler, `github-pages` gem (Jekyll 3.10, kramdown, Rouge), jekyll-feed for RSS.

**Spec:** `docs/superpowers/specs/2026-10-25-academic-blog-rebuild-design.md`

**Working directory:** `/Users/zk/workspace/blog` (git branch `save`, clean). All commands run from repo root unless noted. `__bak/` and `docs/` already exist and must never be deleted or modified.

**Conventions used everywhere:**
- Site owner name / text values are placeholders (`Your Name` etc.) — user edits them later by config/YAML only.
- Commit messages end with the attribution line shown in each commit command. If working outside the main session, keep it verbatim.

---

### Task 1: Bootstrap — Gemfile, .gitignore, _config.yml

**Files:**
- Create: `Gemfile`
- Create: `.gitignore`
- Create: `_config.yml`

- [ ] **Step 1: Write `Gemfile`**

```ruby
source "https://rubygems.org"

gem "github-pages", group: :jekyll_plugins
```

- [ ] **Step 2: Write `.gitignore`**

```gitignore
.DS_Store
_site/
.sass-cache/
.jekyll-cache/
.jekyll-metadata
vendor/
```

- [ ] **Step 3: Write `_config.yml`**

```yaml
# Site settings — replace the placeholder values with your own.
title: Your Name
author: Your Name
email: your-email@example.com
description: >-
  Personal website of Your Name — software engineer and researcher.
  Replace this description in _config.yml.
affiliation: "Ph.D. Student at Placeholder University"
avatar: "/img/photo.svg"

# Social links shown in the home sidebar (leave a value empty to hide the icon)
github_username: "JasonkayZK"
scholar_url: "https://scholar.google.com"
twitter_username: ""

# Blog
permalink: /blog/:year/:month/:day/:title/

# Build settings
markdown: kramdown
plugins:
  - jekyll-feed

# Never render these as site content
exclude:
  - __bak
  - docs
  - .github
  - .gitignore
  - README.md
  - Gemfile
  - Gemfile.lock
  - vendor
  - .DS_Store

defaults:
  - scope:
      path: ""
      type: posts
    values:
      layout: post
```

- [ ] **Step 4: Install dependencies**

Run: `bundle install`
Expected: exit 0, `Bundle complete!` (first run takes a few minutes — sassc compiles natively). If the `github-pages` gem fails to install on this machine, fix the toolchain (`xcode-select --install`) and retry — do NOT swap for plain `gem "jekyll"` (GitHub Pages builds with the github-pages versions and we must match them).

- [ ] **Step 5: Verify a clean build on the empty site**

Run: `bundle exec jekyll build`
Expected: exit 0, `Source: /Users/zk/workspace/blog ... Destination: _site ... Generation done`. A `_site/` directory appears (may be nearly empty).

- [ ] **Step 6: Commit**

```bash
git add Gemfile Gemfile.lock .gitignore _config.yml
git commit -m "feat: bootstrap jekyll site config

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Base layout, nav, footer, social icons, page layout, stub index

**Files:**
- Create: `_layouts/default.html`
- Create: `_layouts/page.html`
- Create: `_includes/nav.html`
- Create: `_includes/footer.html`
- Create: `_includes/social-links.html`
- Create: `index.md` (stub; replaced in Task 4)

- [ ] **Step 1: Write `_layouts/default.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{% if page.title %}{{ page.title | escape }} | {% endif %}{{ site.title | escape }}</title>
    <meta name="description" content="{{ page.excerpt | default: site.description | strip_html | strip_newlines | truncate: 160 | escape }}">
    <meta name="author" content="{{ site.author | escape }}">
    <link rel="canonical" href="{{ page.url | replace: 'index.html', '' | absolute_url }}">
    <link rel="alternate" type="application/atom+xml" title="{{ site.title | escape }}" href="{{ '/feed.xml' | absolute_url }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ '/assets/css/style.css' | relative_url }}">
    {% feed_meta %}
  </head>
  <body>
    {% include nav.html %}
    <main class="page-content">
      {{ content }}
    </main>
    {% include footer.html %}
  </body>
</html>
```

- [ ] **Step 2: Write `_layouts/page.html`**

```html
---
layout: default
---
<div class="page-container">
  {% if page.title %}
  <h1 class="page-title">{{ page.title }}</h1>
  {% endif %}
  {{ content }}
</div>
```

- [ ] **Step 3: Write `_includes/nav.html`**

```html
<nav class="site-nav">
  <div class="nav-container">
    <a class="nav-title" href="{{ '/' | relative_url }}">{{ site.title }}</a>
    <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle navigation">
    <label for="nav-toggle" class="nav-hamburger">
      <span></span>
      <span></span>
      <span></span>
    </label>
    <ul class="nav-links">
      <li><a href="{{ '/' | relative_url }}" {% if page.url == '/' %}class="active"{% endif %}>Home</a></li>
      <li><a href="{{ '/publications/' | relative_url }}" {% if page.url == '/publications/' %}class="active"{% endif %}>Publications</a></li>
      <li><a href="{{ '/blog/' | relative_url }}" {% if page.url contains '/blog' %}class="active"{% endif %}>Blog</a></li>
      <li><a href="{{ '/projects/' | relative_url }}" {% if page.url == '/projects/' %}class="active"{% endif %}>Projects</a></li>
      <li><a href="{{ '/cv/' | relative_url }}" {% if page.url == '/cv/' %}class="active"{% endif %}>CV</a></li>
      <li class="nav-external">
        <a href="https://jasonkayzk.github.io/cn/" target="_blank" rel="noopener">中文站</a>
        <a href="https://jasonkayzk.github.io/jp/" target="_blank" rel="noopener">日文站</a>
      </li>
    </ul>
  </div>
</nav>
```

- [ ] **Step 4: Write `_includes/footer.html`**

```html
<footer class="site-footer">
  <div class="footer-container">
    <p>&copy; {{ site.time | date: '%Y' }} {{ site.author }}. Built with <a href="https://jekyllrb.com">Jekyll</a> &amp; hosted on <a href="https://pages.github.com">GitHub Pages</a>.</p>
  </div>
</footer>
```

- [ ] **Step 5: Write `_includes/social-links.html`**

```html
<div class="social-links">
  {% if site.github_username %}
  <a href="https://github.com/{{ site.github_username }}" title="GitHub" target="_blank" rel="noopener">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
  </a>
  {% endif %}
  {% if site.scholar_url %}
  <a href="{{ site.scholar_url }}" title="Google Scholar" target="_blank" rel="noopener">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/></svg>
  </a>
  {% endif %}
  {% if site.twitter_username %}
  <a href="https://twitter.com/{{ site.twitter_username }}" title="Twitter / X" target="_blank" rel="noopener">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  </a>
  {% endif %}
  {% if site.email %}
  <a href="mailto:{{ site.email }}" title="Email">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
  </a>
  {% endif %}
  <a href="{{ '/feed.xml' | absolute_url }}" title="RSS">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6.503 20.752A2.25 2.25 0 016.5 16.3a2.25 2.25 0 01.003 4.452zM2.004 11.21v3.5a8.037 8.037 0 017.288 7.285h3.501c-.25-5.955-4.834-10.538-10.789-10.785zM2.004 2v3.5c10.47 0 18.996 8.522 18.996 19h3.5C24.5 13.825 13.865 2 2.004 2z"/></svg>
  </a>
</div>
```

- [ ] **Step 6: Write stub `index.md`**

```markdown
---
layout: page
---
Coming soon.
```

- [ ] **Step 7: Build and verify**

Run: `bundle exec jekyll build`
Expected: exit 0.

Run: `grep -c 'site-nav' _site/index.html && grep -c 'jasonkayzk.github.io/cn/' _site/index.html`
Expected: both counts ≥ 1 (nav present, cn external link present).

Run: `grep -c 'feed.xml' _site/index.html`
Expected: ≥ 1 (jekyll-feed link tag present).

- [ ] **Step 8: Commit**

```bash
git add _layouts _includes index.md
git commit -m "feat: base layout with nav, footer, social links

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Full stylesheet (reference-site replica + additions)

**Files:**
- Create: `assets/css/style.scss`

- [ ] **Step 1: Write `assets/css/style.scss`**

The file must start with two lines of triple dashes (Jekyll SCSS front matter), then the full CSS. Content is the reference site's stylesheet (reformatted) plus 5 additions: footer styles, `.nav-external`, project cards, 404 page, and a taller mobile nav max-height.

```scss
---
---

/* ---------------------------------------------------------------------------
   Base — adapted from the reference site jinyansu1.github.io
----------------------------------------------------------------------------*/
*,
*::before,
*::after { box-sizing: border-box; margin: 0; padding: 0; }

html { font-size: 16px; scroll-behavior: smooth; }

body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #1a1a2e;
  background-color: #fff;
  line-height: 1.7;
  padding-top: 60px;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6 {
  font-family: "Source Serif 4", Georgia, "Times New Roman", serif;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 0.75em;
  color: #1a1a2e;
}
h1 { font-size: 2rem; }
h2 { font-size: 1.5rem; }
h3 { font-size: 1.25rem; }

p { margin-bottom: 1.25em; }

a { color: #2563EB; text-decoration: none; transition: color 0.2s ease; }
a:hover { color: #1043b3; }

img { max-width: 100%; height: auto; }

ul, ol { margin-bottom: 1.25em; padding-left: 1.5em; }

blockquote {
  border-left: 3px solid #2563EB;
  margin: 1.5em 0;
  padding: 0.5em 1.5em;
  color: #6b7280;
  font-style: italic;
  background: #f8fafc;
  border-radius: 0 4px 4px 0;
}

hr { border: none; height: 1px; background: #e5e7eb; margin: 2em 0; }

code {
  font-family: 'SF Mono', Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 0.9em;
  background: #f8fafc;
  padding: 0.15em 0.4em;
  border-radius: 3px;
  border: 1px solid #e5e7eb;
}
pre {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 1em 1.25em;
  overflow-x: auto;
  margin-bottom: 1.5em;
}
pre code { background: none; border: none; padding: 0; font-size: 0.875em; }

table { width: 100%; border-collapse: collapse; margin-bottom: 1.5em; }
th, td { text-align: left; padding: 0.6em 1em; border-bottom: 1px solid #e5e7eb; }
th { font-weight: 600; background: #f8fafc; }

strong { font-weight: 600; }

/* ---------------------------------------------------------------------------
   Layout containers
----------------------------------------------------------------------------*/
.page-content { min-height: calc(100vh - 60px - 80px); }

.page-container,
.post-container,
.publications-container { max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; }

.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 3rem;
  align-items: start;
}

.page-title { margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 2px solid #f8fafc; }

/* ---------------------------------------------------------------------------
   Navigation
----------------------------------------------------------------------------*/
.site-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  z-index: 1000;
  display: flex;
  align-items: center;
}
.nav-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.nav-title {
  font-family: "Source Serif 4", Georgia, "Times New Roman", serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a2e;
}
.nav-title:hover { color: #2563EB; }
.nav-links { list-style: none; display: flex; gap: 2rem; margin: 0; padding: 0; }
.nav-links a {
  color: #6b7280;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.25em 0;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
}
.nav-links a:hover,
.nav-links a.active { color: #2563EB; border-bottom-color: #2563EB; }
.nav-toggle { display: none; }
.nav-hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 5px; }
.nav-hamburger span { width: 24px; height: 2px; background: #1a1a2e; transition: transform 0.3s, opacity 0.3s; }

/* ADDITION: external cn/jp site links in the nav */
.nav-external {
  display: flex;
  gap: 1.5rem;
  padding-left: 1.75rem;
  margin-left: 0.25rem;
  border-left: 1px solid #e5e7eb;
}

/* ---------------------------------------------------------------------------
   Footer
----------------------------------------------------------------------------*/
/* ADDITION: footer not present in the reference stylesheet */
.site-footer { border-top: 1px solid #e5e7eb; background: #fff; }
.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.75rem 1.5rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
}
.footer-container p { margin-bottom: 0; }
.footer-container a { color: #2563EB; }

/* ---------------------------------------------------------------------------
   Home — sidebar + experience lists
----------------------------------------------------------------------------*/
.home-sidebar { text-align: center; position: sticky; top: calc(60px + 2rem); }
.avatar {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
  border: 3px solid #f8fafc;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
.home-name { font-size: 1.4rem; margin-bottom: 0.5rem; }
.home-affiliation { font-size: 0.9rem; color: #6b7280; line-height: 1.5; margin-bottom: 1rem; }
.social-links { display: flex; justify-content: center; gap: 0.75rem; margin-top: 0.5rem; }
.social-links a {
  color: #6b7280;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f8fafc;
}
.social-links a:hover { color: #2563EB; background: #dbeafe; }

.home-content h2 { font-size: 1.3rem; color: #1a1a2e; margin-top: 1.5rem; }
.home-content h2:first-child { margin-top: 0; }
.research-highlight { color: #1a1a2e; font-weight: 700; }

.experience-list { display: flex; flex-direction: column; gap: 1rem; }
.experience-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.2s;
}
.experience-item:hover { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }
.experience-logo { width: 48px; height: 48px; object-fit: contain; border-radius: 6px; flex-shrink: 0; }
.experience-details { flex: 1; min-width: 0; }
.experience-title { font-weight: 600; font-size: 0.95rem; color: #1a1a2e; }
.experience-org { font-size: 0.85rem; color: #6b7280; }
.experience-subtitle { font-size: 0.85rem; color: #6b7280; }
.experience-date { font-size: 0.8rem; color: #6b7280; font-style: italic; }

/* ---------------------------------------------------------------------------
   Publications
----------------------------------------------------------------------------*/
.pub-filters { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 2rem; }
.pub-filter-pill {
  display: inline-block;
  padding: 0.35em 0.9em;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  background: none;
}
.pub-filter-pill:hover { border-color: #2563EB; color: #2563EB; }
.pub-filter-pill.active { background: #2563EB; color: #fff; border-color: #2563EB; }

.pub-year-section { margin-bottom: 2rem; }
.pub-year {
  font-size: 1.3rem;
  color: #6b7280;
  border-bottom: 2px solid #f8fafc;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.pub-card { padding: 1.25rem 0; border-bottom: 1px solid #e5e7eb; }
.pub-card:last-child { border-bottom: none; }
.pub-title {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 0.3rem;
}
.pub-authors { font-size: 0.9rem; color: #6b7280; margin-bottom: 0.25rem; }
.pub-venue { font-size: 0.9rem; color: #6b7280; font-style: italic; margin-bottom: 0.5rem; }
.pub-award {
  display: inline-block;
  background: #fef2f2;
  color: #dc2626;
  font-size: 0.8rem;
  font-style: normal;
  font-weight: 600;
  padding: 0.1em 0.5em;
  border-radius: 4px;
  margin-left: 0.5rem;
}
.pub-actions { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
.pub-links { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.pub-link {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.25em 0.75em;
  border: 1px solid #2563EB;
  border-radius: 4px;
  color: #2563EB;
  transition: background 0.2s, color 0.2s;
}
.pub-link:hover { background: #2563EB; color: #fff; }
.pub-abstract-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25em 0.75em;
  border: 1px solid #10b981;
  border-radius: 4px;
  color: #10b981;
  background: none;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  font-family: inherit;
}
.pub-abstract-toggle:hover { background: #10b981; color: #fff; }
.pub-abstract-toggle[aria-expanded="true"] { background: #10b981; color: #fff; }
.pub-abstract-toggle[aria-expanded="true"] .pub-chevron { transform: rotate(180deg); }
.pub-chevron { font-size: 0.75rem; transition: transform 0.3s ease; }
.pub-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.pub-tag {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 500;
  padding: 0.15em 0.5em;
  background: #f8fafc;
  color: #6b7280;
  border-radius: 3px;
  border: 1px solid #e5e7eb;
}
.pub-details { max-height: 0; overflow: hidden; transition: max-height 0.4s ease; }
.pub-details[aria-hidden="false"] { max-height: 800px; }
.pub-abstract {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #6b7280;
  border-left: 3px solid #10b981;
}
.pub-figure { margin-top: 1rem; text-align: center; }
.pub-figure img { max-width: 100%; border-radius: 6px; border: 1px solid #e5e7eb; }

/* ---------------------------------------------------------------------------
   Blog — list + posts
----------------------------------------------------------------------------*/
.blog-container { max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; }
.blog-section { margin-bottom: 2.5rem; }
.blog-section-title { font-size: 1.4rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #f8fafc; }
.blog-tags { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
.tag-pill {
  display: inline-block;
  padding: 0.3em 0.85em;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  background: none;
  font-family: inherit;
}
.tag-pill:hover { border-color: #2563EB; color: #2563EB; }
.tag-pill.active { background: #2563EB; color: #fff; border-color: #2563EB; }
.tag-badge {
  display: inline-block;
  background: #f8fafc;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.1em 0.5em;
  border-radius: 4px;
}

.blog-post-card { padding: 1.5rem 0; border-bottom: 1px solid #e5e7eb; }
.blog-post-card:last-child { border-bottom: none; }
.blog-post-card-title { font-size: 1.15rem; margin-bottom: 0.3rem; }
.blog-post-card-title a { color: #1a1a2e; }
.blog-post-card-title a:hover { color: #2563EB; }
.blog-post-card-meta {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.blog-post-card-excerpt { font-size: 0.95rem; color: #6b7280; margin-bottom: 0; }

.post-header { margin-bottom: 2rem; }
.post-title { font-size: 2rem; margin-bottom: 0.5rem; }
.post-meta { display: flex; align-items: center; gap: 1rem; color: #6b7280; font-size: 0.9rem; }
.post-category-badge {
  display: inline-block;
  background: #dbeafe;
  color: #2563EB;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.15em 0.6em;
  border-radius: 4px;
}
.post-reading-time { color: #6b7280; }

.post-content { font-size: 1.05rem; line-height: 1.8; }
.post-content h2 { margin-top: 2rem; }
.post-content h3 { margin-top: 1.5rem; }
.post-content img { border-radius: 6px; margin: 1.5em 0; }
.post-content table {
  display: block;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-collapse: collapse;
  font-size: 0.9rem;
  margin: 1.25em 0;
}
.post-content th, .post-content td { padding: 0.4em 0.65em; border: 1px solid #e5e7eb; white-space: nowrap; }
.post-content th { background: #f8fafc; font-weight: 600; }

.post-footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb; }
.back-to-blog { display: inline-block; margin-bottom: 1rem; font-weight: 500; }
.post-nav { display: flex; justify-content: space-between; gap: 1rem; }
.post-nav-prev, .post-nav-next { font-size: 0.9rem; color: #2563EB; }

/* ---------------------------------------------------------------------------
   ADDITION: Projects page
----------------------------------------------------------------------------*/
.projects-list { display: flex; flex-direction: column; gap: 1.25rem; }
.project-card {
  padding: 1.5rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: box-shadow 0.2s;
}
.project-card:hover { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }
.project-title {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 1.15rem;
  margin-bottom: 0.35rem;
}
.project-title a { color: #1a1a2e; }
.project-title a:hover { color: #2563EB; }
.project-description { font-size: 0.95rem; color: #6b7280; margin-bottom: 0.75rem; }
.project-links { display: flex; gap: 0.5rem; margin-top: 0.75rem; }

/* ---------------------------------------------------------------------------
   ADDITION: 404 page
----------------------------------------------------------------------------*/
.notfound { text-align: center; padding: 4rem 0; }
.notfound p { color: #6b7280; }

/* ---------------------------------------------------------------------------
   Syntax highlighting (GitHub-style, matches the reference)
----------------------------------------------------------------------------*/
.highlight .c, .highlight .c1, .highlight .cm { color: #6a737d; font-style: italic; }
.highlight .k, .highlight .kd, .highlight .kn, .highlight .kp, .highlight .kr, .highlight .kt { color: #d73a49; }
.highlight .s, .highlight .s1, .highlight .s2, .highlight .sb, .highlight .sc, .highlight .sd, .highlight .sh, .highlight .sx { color: #032f62; }
.highlight .na { color: #6f42c1; }
.highlight .nb { color: #005cc5; }
.highlight .nc { color: #6f42c1; }
.highlight .nf, .highlight .nx { color: #6f42c1; }
.highlight .no { color: #005cc5; }
.highlight .ni { color: #24292e; font-weight: bold; }
.highlight .nn { color: #005cc5; }
.highlight .o, .highlight .ow { color: #d73a49; }
.highlight .p { color: #24292e; }
.highlight .mi, .highlight .mf, .highlight .mh, .highlight .mo { color: #005cc5; }
.highlight .gh { color: #005cc5; font-weight: bold; }
.highlight .gi { color: #22863a; background: #f0fff4; }
.highlight .gd { color: #b31d28; background: #ffeef0; }
.highlight .ge { font-style: italic; }
.highlight .gs { font-weight: bold; }
.highlight .err { color: #b31d28; }

/* ---------------------------------------------------------------------------
   Responsive
----------------------------------------------------------------------------*/
@media screen and (max-width: 1024px) {
  .home-container { grid-template-columns: 220px 1fr; gap: 2rem; }
}

@media screen and (max-width: 768px) {
  .home-container { grid-template-columns: 1fr; gap: 1.5rem; }
  .home-sidebar { position: static; display: flex; flex-direction: column; align-items: center; }
  .avatar { width: 140px; height: 140px; }
  .nav-hamburger { display: flex; }
  .nav-links {
    position: absolute;
    top: 60px; left: 0; right: 0;
    background: #fff;
    flex-direction: column;
    gap: 0;
    padding: 0;
    border-bottom: 1px solid #e5e7eb;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }
  .nav-links li { border-bottom: 1px solid #e5e7eb; }
  .nav-links a { display: block; padding: 0.75rem 1.5rem; border-bottom: none; }
  /* ADDITION: 7 nav items need more than the reference's 300px */
  .nav-toggle:checked ~ .nav-links { max-height: 420px; }
  .nav-toggle:checked ~ .nav-hamburger span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
  .nav-toggle:checked ~ .nav-hamburger span:nth-child(2) { opacity: 0; }
  .nav-toggle:checked ~ .nav-hamburger span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }
  /* ADDITION: flatten the external-links wrapper so its items stack like the others */
  .nav-external { display: contents; }
  .post-title { font-size: 1.5rem; }
  .post-meta { flex-wrap: wrap; gap: 0.5rem; }
  .post-nav { flex-direction: column; }
}

@media screen and (max-width: 480px) {
  body { font-size: 15px; }
  .page-container,
  .post-container,
  .publications-container,
  .blog-container { padding: 1.5rem 1rem; }
  .pub-title { font-size: 0.95rem; }
  .blog-tags { gap: 0.35rem; }
}
```

- [ ] **Step 2: Build and verify the stylesheet compiles**

Run: `bundle exec jekyll build && head -5 _site/assets/css/style.css`
Expected: exit 0; the compiled file starts with the converted CSS (not empty). No `Error: Invalid CSS` output.

- [ ] **Step 3: Commit**

```bash
git add assets/css/style.scss
git commit -m "feat: site stylesheet adapted from reference theme

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Home page — sidebar, experience lists, placeholder images

**Files:**
- Create: `_layouts/home.html`
- Create: `_includes/experience-list.html`
- Create: `_data/education.yml`
- Create: `_data/experience.yml`
- Create: `img/photo.svg`
- Create: `img/logos/university_a.svg`, `img/logos/university_b.svg`, `img/logos/company_a.svg`, `img/logos/company_b.svg`
- Modify (replace stub): `index.md`

- [ ] **Step 1: Write `_layouts/home.html`**

```html
---
layout: default
---
<div class="home-container">
  <aside class="home-sidebar">
    <img src="{{ site.avatar }}" alt="{{ site.author }}" class="avatar">
    <h1 class="home-name">{{ site.author }}</h1>
    <p class="home-affiliation">{{ site.affiliation }}</p>
    {% include social-links.html %}
  </aside>
  <div class="home-content">
    {{ content }}

    {% if site.data.education and site.data.education != empty %}
    <h2 id="education">Education</h2>
    {% include experience-list.html items=site.data.education %}
    {% endif %}

    {% if site.data.experience and site.data.experience != empty %}
    <h2 id="experience">Experience</h2>
    {% include experience-list.html items=site.data.experience %}
    {% endif %}
  </div>
</div>
```

- [ ] **Step 2: Write `_includes/experience-list.html`**

Renders a vertical list of `experience-item` rows. Parameters: `items` (a `_data` array). Fields per item: `title`, `subtitle`, `org` (optional), `dates`, `logo` (optional). Renders nothing when `items` is empty or nil.

```html
{% if include.items and include.items != empty %}
<div class="experience-list">
  {% for item in include.items %}
  <div class="experience-item">
    {% if item.logo %}
    <img src="{{ item.logo }}" alt="{{ item.title }}" class="experience-logo">
    {% endif %}
    <div class="experience-details">
      <div class="experience-title">{{ item.title }}</div>
      {% if item.subtitle %}
      <div class="experience-subtitle">{{ item.subtitle }}</div>
      {% endif %}
      {% if item.org %}
      <div class="experience-org">{{ item.org }}</div>
      {% endif %}
      <div class="experience-date">{{ item.dates }}</div>
    </div>
  </div>
  {% endfor %}
</div>
{% endif %}
```

- [ ] **Step 3: Write `_data/education.yml`**

```yaml
# Education history, shown on Home and CV. Newest first.
# Fields: title, subtitle, org (optional), dates, logo (optional, 48x48 friendly)
- title: Placeholder University
  subtitle: Ph.D. in Computer Science
  org: Department of Computer Science
  dates: 2024 – present
  logo: /img/logos/university_a.svg

- title: Another University
  subtitle: B.S. in Software Engineering
  dates: 2016 – 2020
  logo: /img/logos/university_b.svg
```

- [ ] **Step 4: Write `_data/experience.yml`**

```yaml
# Work experience, shown on Home and CV. Newest first.
# Same fields as education.yml
- title: Company A
  subtitle: Senior Backend Engineer
  org: Platform Engineering
  dates: 2023 – present
  logo: /img/logos/company_a.svg

- title: Company B
  subtitle: Backend Engineer
  org: Infrastructure
  dates: 2020 – 2023
  logo: /img/logos/company_b.svg
```

- [ ] **Step 5: Write placeholder images**

`img/photo.svg` (default avatar; replace by dropping `img/photo.jpg` and updating `avatar:` in `_config.yml`):

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <circle cx="90" cy="90" r="88" fill="#dbeafe"/>
  <circle cx="90" cy="90" r="88" fill="none" stroke="#93c5fd" stroke-width="4"/>
  <text x="90" y="112" font-family="Georgia, 'Times New Roman', serif" font-size="60" font-weight="600" fill="#2563EB" text-anchor="middle">JK</text>
</svg>
```

`img/logos/university_a.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <rect width="48" height="48" rx="8" fill="#eff6ff"/>
  <text x="24" y="31" font-family="Inter, -apple-system, sans-serif" font-size="17" font-weight="600" fill="#2563EB" text-anchor="middle">PU</text>
</svg>
```

`img/logos/university_b.svg`: same content but initials text `AU`.

`img/logos/company_a.svg`: same content but initials text `CA` and `fill="#64748b"` for the text and `fill="#f8fafc"` for the rect.

`img/logos/company_b.svg`: same as company_a but initials text `CB`.

- [ ] **Step 6: Replace `index.md` with the real home content**

```markdown
---
layout: home
---
## Research Interests

Replace this section with 2–3 paragraphs describing what you work on. Name the
areas you care about, why they matter, and what you are currently exploring.
Keep it concrete and specific — this is the first thing visitors read about you.

## News

- **2026** — Placeholder news item: the site was rebuilt.
- **2024** — Placeholder news item: joined Placeholder University.

## Contact

Email: your-email@example.com
```

- [ ] **Step 7: Build and verify**

Run: `bundle exec jekyll build`
Expected: exit 0.

Run: `grep -c 'class="experience-item"' _site/index.html`
Expected: `4` (two education + two experience rows).

Run: `grep -c 'home-sidebar' _site/index.html && grep -c 'Research Interests' _site/index.html`
Expected: both ≥ 1.

Run: `ls _site/img/logos/`
Expected: `company_a.svg  company_b.svg  university_a.svg  university_b.svg`.

- [ ] **Step 8: Commit**

```bash
git add _layouts/home.html _includes/experience-list.html _data index.md img
git commit -m "feat: home page with sidebar and CV sections

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Publications page

**Files:**
- Create: `_data/publications.yml`
- Create: `_includes/pub-card.html`
- Create: `publications.md`
- Create: `assets/js/publications.js`

- [ ] **Step 1: Write `_data/publications.yml`**

Grouping rule used by the page: an entry with `venue: "Preprint"` goes into the **Manuscript** section; every other entry **must** have a `year` and is grouped by year descending.

```yaml
# Publications. Fields:
#   title    — string
#   authors  — list; the entry matching site.author (in _config.yml) is bolded
#   venue    — string; use exactly "Preprint" to place the entry under Manuscript
#   year     — integer, required for non-preprints
#   award    — optional string, shown as a red badge next to the venue
#   tags     — list of topics; drives the filter pills
#   pdf      — optional URL; makes the title a link
#   links    — optional list of {label, url} rendered as outline buttons
#   abstract — optional string, shown behind the Abstract toggle

- title: "Placeholder Paper Title: A Study of Something Interesting"
  authors:
    - Your Name
    - Alice Cooperauthor
  venue: "Preprint"
  tags: [LLM, Reasoning]
  pdf: https://arxiv.org
  links:
    - label: arXiv
      url: https://arxiv.org
    - label: Code
      url: https://github.com/JasonkayZK
  abstract: >
    This is a placeholder abstract. Replace it with the real abstract of the
    paper. It is hidden behind the Abstract toggle on the page, so it can be a
    few sentences longer than the excerpt shown anywhere else.

- title: "Another Placeholder Paper: Systems and Such"
  authors:
    - Your Name
    - Bob Cooperator
    - Carol Cooperator
  venue: "International Conference on Placeholder Research (ICPR)"
  year: 2025
  award: Best Paper Award
  tags: [Systems, LLM]
  pdf: https://arxiv.org
  abstract: >
    Second placeholder abstract. This entry demonstrates a year-grouped
    publication with an award badge. Keep entries within a year in the order
    you want them displayed.

- title: "A Third Placeholder Paper"
  authors:
    - Devin Cooperauthor
    - Your Name
  venue: "Workshop on Placeholder Computing (WPC)"
  year: 2024
  tags: [Systems]
  abstract: >
    Third placeholder abstract. This entry demonstrates a publication where
    the site owner is not the first author.
```

- [ ] **Step 2: Write `_includes/pub-card.html`**

Parameter: `pub` (one entry from `publications.yml`).

```html
<div class="pub-card" data-tags="{{ pub.tags | join: ',' }}">
  <div class="pub-card-main">
    <h3 class="pub-title">
      {% if pub.pdf %}
      <a href="{{ pub.pdf }}" target="_blank" rel="noopener">{{ pub.title }}</a>
      {% else %}
      {{ pub.title }}
      {% endif %}
    </h3>
    <p class="pub-authors">
      {%- for a in pub.authors -%}
      {%- if a == site.author %}<strong>{{ a }}</strong>{% else %}{{ a }}{% endif -%}
      {%- unless forloop.last %}, {% endunless -%}
      {%- endfor -%}
    </p>
    <p class="pub-venue">
      {{ pub.venue }}
      {% if pub.award %}<span class="pub-award">{{ pub.award }}</span>{% endif %}
    </p>
    <div class="pub-actions">
      {% if pub.links and pub.links != empty %}
      <div class="pub-links">
        {% for l in pub.links %}
        <a class="pub-link" href="{{ l.url }}" target="_blank" rel="noopener">{{ l.label }}</a>
        {% endfor %}
      </div>
      {% endif %}
      {% if pub.abstract %}
      <button class="pub-abstract-toggle" aria-expanded="false">
        Abstract <span class="pub-chevron">▾</span>
      </button>
      {% endif %}
    </div>
    {% if pub.tags and pub.tags != empty %}
    <div class="pub-tags">
      {% for t in pub.tags %}<span class="pub-tag">{{ t }}</span>{% endfor %}
    </div>
    {% endif %}
  </div>
  {% if pub.abstract %}
  <div class="pub-details" aria-hidden="true">
    <div class="pub-abstract">{{ pub.abstract }}</div>
  </div>
  {% endif %}
</div>
```

- [ ] **Step 3: Write `publications.md`**

```markdown
---
layout: default
title: Publications
permalink: /publications/
---
<div class="publications-container">
  <h1 class="page-title">Publications</h1>

  {% comment %}
    Collect the unique set of topic tags across all publications,
    alphabetize them, and render the filter pills.
  {% endcomment %}
  {% assign topics = '' | split: '' %}
  {% for p in site.data.publications %}
    {% for t in p.tags %}
      {% assign topics = topics | push: t %}
    {% endfor %}
  {% endfor %}
  {% assign topics = topics | uniq | sort %}

  {% if topics != empty %}
  <div class="pub-filters">
    <button class="pub-filter-pill active" data-tag="all">All</button>
    {% for t in topics %}
    <button class="pub-filter-pill" data-tag="{{ t }}">{{ t }}</button>
    {% endfor %}
  </div>
  {% endif %}

  {% comment %}Manuscripts: entries whose venue is exactly "Preprint".{% endcomment %}
  {% assign pubs = site.data.publications %}
  {% assign manuscripts = pubs | where: "venue", "Preprint" %}
  {% assign published = pubs | where_exp: "p", "p.venue != 'Preprint'" %}

  {% if manuscripts != empty %}
  <section class="pub-year-section">
    <h2 class="pub-year">Manuscript</h2>
    {% for p in manuscripts %}
    {% include pub-card.html pub=p %}
    {% endfor %}
  </section>
  {% endif %}

  {% comment %}Year sections, newest first.{% endcomment %}
  {% assign years = '' | split: '' %}
  {% for p in published %}
    {% assign years = years | push: p.year %}
  {% endfor %}
  {% assign years = years | uniq | sort | reverse %}

  {% for y in years %}
  <section class="pub-year-section">
    <h2 class="pub-year">{{ y }}</h2>
    {% assign year_pubs = published | where: "year", y %}
    {% for p in year_pubs %}
    {% include pub-card.html pub=p %}
    {% endfor %}
  </section>
  {% endfor %}
</div>
<script src="{{ '/assets/js/publications.js' | relative_url }}"></script>
```

- [ ] **Step 4: Write `assets/js/publications.js`**

```javascript
document.addEventListener('DOMContentLoaded', function () {
  // Abstract expand/collapse
  var toggles = document.querySelectorAll('.pub-abstract-toggle');
  toggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = this.closest('.pub-card');
      var details = card.querySelector('.pub-details');
      var isExpanded = this.getAttribute('aria-expanded') === 'true';

      this.setAttribute('aria-expanded', !isExpanded);
      details.setAttribute('aria-hidden', isExpanded);
    });
  });

  // Tag filtering
  var pills = document.querySelectorAll('.pub-filter-pill');
  var cards = document.querySelectorAll('.pub-card');
  var yearSections = document.querySelectorAll('.pub-year-section');

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      var tag = this.getAttribute('data-tag');

      pills.forEach(function (p) { p.classList.remove('active'); });
      this.classList.add('active');

      cards.forEach(function (card) {
        var cardTags = (card.getAttribute('data-tags') || '').split(',');
        if (tag === 'all' || cardTags.indexOf(tag) !== -1) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });

      // Hide year sections that have no visible cards
      yearSections.forEach(function (section) {
        var visibleCards = section.querySelectorAll('.pub-card:not([style*="display: none"])');
        section.style.display = visibleCards.length > 0 ? '' : 'none';
      });
    });
  });
});
```

- [ ] **Step 5: Build and verify**

Run: `bundle exec jekyll build`
Expected: exit 0.

Run: `grep -c 'class="pub-card"' _site/publications/index.html`
Expected: `3`.

Run: `grep -c 'Manuscript' _site/publications/index.html && grep -c 'pub-year' _site/publications/index.html`
Expected: both ≥ 1. Year headings render `2025` and `2024`.

Run: `grep -c '<strong>Your Name</strong>' _site/publications/index.html`
Expected: `3` (Your Name appears as an author in all 3 entries and is bolded in each).

Run: `grep -c 'pub-award' _site/publications/index.html`
Expected: `1`.

Run: `ls _site/assets/js/publications.js`
Expected: the file exists.

- [ ] **Step 6: Commit**

```bash
git add _data/publications.yml _includes/pub-card.html publications.md assets/js/publications.js
git commit -m "feat: publications page with topic filter and abstract toggles

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Blog — list layout with tag filter, post layout, sample posts

**Files:**
- Create: `_layouts/blog-list.html`
- Create: `_layouts/post.html`
- Create: `_includes/post-card.html`
- Create: `blog.md`
- Create: `assets/js/blog-filter.js`
- Create: `_posts/2026-10-20-hello-world.md`
- Create: `_posts/2026-10-24-code-blocks-example.md`

- [ ] **Step 1: Write `_layouts/blog-list.html`**

```html
---
layout: default
---
<div class="blog-container">
  <h1 class="page-title">{{ page.title }}</h1>

  {% comment %}Unique tag set across all posts, alphabetized.{% endcomment %}
  {% assign all_tags = '' | split: '' %}
  {% for post in site.posts %}
    {% for t in post.tags %}
      {% assign all_tags = all_tags | push: t %}
    {% endfor %}
  {% endfor %}
  {% assign all_tags = all_tags | uniq | sort %}

  {% if all_tags != empty %}
  <div class="blog-tags">
    <button class="tag-pill active" data-tag="all">All</button>
    {% for t in all_tags %}
    <button class="tag-pill" data-tag="{{ t }}">{{ t }}</button>
    {% endfor %}
  </div>
  {% endif %}

  {% for post in site.posts %}
  {% include post-card.html post=post %}
  {% endfor %}
</div>
<script src="{{ '/assets/js/blog-filter.js' | relative_url }}"></script>
```

- [ ] **Step 2: Write `_includes/post-card.html`**

Parameter: `post`.

```html
{% assign words = include.post.content | strip_html | number_of_words %}
{% assign minutes = words | divided_by: 200 | at_least: 1 %}
<div class="blog-post-card" data-tags="{{ include.post.tags | join: ',' }}">
  <h2 class="blog-post-card-title">
    <a href="{{ include.post.url | relative_url }}">{{ include.post.title }}</a>
  </h2>
  <div class="blog-post-card-meta">
    <time datetime="{{ include.post.date | date_to_xmlschema }}">{{ include.post.date | date: '%B %-d, %Y' }}</time>
    <span class="post-reading-time">{{ minutes }} min read</span>
  </div>
  {% if include.post.excerpt %}
  <p class="blog-post-card-excerpt">{{ include.post.excerpt | strip_html | truncate: 160 }}</p>
  {% endif %}
</div>
```

- [ ] **Step 3: Write `_layouts/post.html`**

```html
---
layout: default
---
<div class="post-container">
  <article class="post-article">
    <header class="post-header">
      <h1 class="post-title">{{ page.title }}</h1>
      <div class="post-meta">
        <time datetime="{{ page.date | date_to_xmlschema }}">{{ page.date | date: '%B %-d, %Y' }}</time>
        {% if page.category %}
        <span class="post-category-badge">{{ page.category }}</span>
        {% endif %}
        {% assign words = page.content | strip_html | number_of_words %}
        {% assign minutes = words | divided_by: 200 | at_least: 1 %}
        <span class="post-reading-time">{{ minutes }} min read</span>
      </div>
    </header>
    <div class="post-content">
      {{ content }}
    </div>
    <footer class="post-footer">
      <a href="{{ '/blog/' | relative_url }}" class="back-to-blog">&larr; Back to Blog</a>
      <div class="post-nav">
        {% if page.previous %}
        <a href="{{ page.previous.url | relative_url }}" class="post-nav-prev">&larr; {{ page.previous.title }}</a>
        {% endif %}
        {% if page.next %}
        <a href="{{ page.next.url | relative_url }}" class="post-nav-next">{{ page.next.title }} &rarr;</a>
        {% endif %}
      </div>
    </footer>
  </article>
</div>
```

- [ ] **Step 4: Write `blog.md`**

```markdown
---
layout: blog-list
title: Blog
permalink: /blog/
---
```

- [ ] **Step 5: Write `assets/js/blog-filter.js`**

```javascript
document.addEventListener('DOMContentLoaded', function () {
  var pills = document.querySelectorAll('.tag-pill');
  var cards = document.querySelectorAll('.blog-post-card');

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      var tag = this.getAttribute('data-tag');

      pills.forEach(function (p) { p.classList.remove('active'); });
      this.classList.add('active');

      cards.forEach(function (card) {
        var cardTags = (card.getAttribute('data-tags') || '').split(',');
        if (tag === 'all' || cardTags.indexOf(tag) !== -1) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
});
```

- [ ] **Step 6: Write `_posts/2026-10-20-hello-world.md`**

````markdown
---
title: "Hello, World"
date: 2026-10-20 09:00:00 +08:00
tags: [meta]
category: essay
excerpt: "A placeholder first post explaining how posts on this site are written and organized."
---

Welcome to the rebuilt site. This post is a placeholder so the blog index and
the post layout have something to render. Delete it once you start writing real
posts.

## Writing a new post

Create a file named `YYYY-MM-DD-your-title.md` in the `_posts` directory with
this front matter:

```yaml
title: "Your Title"
date: 2026-10-20 09:00:00 +08:00
tags: [systems, rust]
category: technical
excerpt: "One or two sentences shown on the blog index."
```

The `tags` drive the filter pills on the [Blog](/blog/) page, `category` is an
optional badge on the post page, and `excerpt` is what the index card shows.
Everything is optional except `title` and `date`.
````

- [ ] **Step 7: Write `_posts/2026-10-24-code-blocks-example.md`**

````markdown
---
title: "Code Blocks Look Like This"
date: 2026-10-24 21:30:00 +08:00
tags: [demo, code]
category: technical
excerpt: "A placeholder post that exists only to demo headings, code blocks, tables, and blockquotes."
---

## A level-two heading

A level-three heading works too.

### Level three

Inline `code`, **bold**, *italic*, and [links](https://jekyllrb.com) behave as
expected.

### A code block

```python
def greet(name: str) -> str:
    """Return a greeting with the given name."""
    return f"Hello, {name}!"


for i in range(3):
    print(greet(f"world #{i}"))
```

### A table

| Column A | Column B |
|----------|----------|
| 1        | 2        |

### A blockquote

> Placeholder blockquote. Replace or delete this post before writing seriously.
````

- [ ] **Step 8: Build and verify**

Run: `bundle exec jekyll build`
Expected: exit 0.

Run: `grep -c 'class="blog-post-card"' _site/blog/index.html`
Expected: `2`.

Run: `grep -c 'tag-pill' _site/blog/index.html`
Expected: ≥ 4 (All + demo + code + meta).

Run: `ls _site/blog/2026/10/20/hello-world/`
Expected: `index.html` exists.

Run: `grep -c 'post-nav-prev' _site/blog/2026/10/20/hello-world/index.html && grep -c 'highlight' _site/blog/2026/10/24/code-blocks-example/index.html`
Expected: both ≥ 1 (prev/next nav renders on the older post; python block is highlighted).

Run: `ls _site/feed.xml && grep -c '<entry>' _site/feed.xml`
Expected: feed.xml exists and contains 2 entries.

- [ ] **Step 9: Commit**

```bash
git add _layouts/blog-list.html _layouts/post.html _includes/post-card.html blog.md assets/js/blog-filter.js _posts
git commit -m "feat: blog with tag filter, reading time, and sample posts

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Projects and CV pages

**Files:**
- Create: `_data/projects.yml`
- Create: `projects.md`
- Create: `cv.md`

- [ ] **Step 1: Write `_data/projects.yml`**

```yaml
# Project cards. Fields:
#   name        — string
#   description — one short paragraph
#   tags        — list of tech tags
#   repo        — optional URL to the source repository
#   demo        — optional URL to a live demo

- name: Placeholder Project Alpha
  description: >
    Replace this with a one-to-three sentence description of the project:
    what problem it solves and what makes it interesting. Keep it short —
    readers can follow the links for details.
  tags: [Rust, CLI]
  repo: https://github.com/JasonkayZK
  demo:

- name: Placeholder Project Beta
  description: >
    Second placeholder project. Demonstrates a card with a demo link and
    without one, so you can see both states before filling in real projects.
  tags: [LLM, Python]
  repo: https://github.com/JasonkayZK
  demo: https://example.com

- name: Placeholder Project Gamma
  description: >
    Third placeholder project. Every field except name is optional; this card
    shows the layout with only tags and no links at all.
  tags: [Distributed Systems, Go]
  repo:
  demo:
```

- [ ] **Step 2: Write `projects.md`**

```markdown
---
layout: default
title: Projects
permalink: /projects/
---
<div class="page-container">
  <h1 class="page-title">Projects</h1>
  <div class="projects-list">
    {% for p in site.data.projects %}
    <div class="project-card">
      <h2 class="project-title">
        {% if p.repo %}
        <a href="{{ p.repo }}" target="_blank" rel="noopener">{{ p.name }}</a>
        {% else %}
        {{ p.name }}
        {% endif %}
      </h2>
      <p class="project-description">{{ p.description }}</p>
      {% if p.tags and p.tags != empty %}
      <div class="pub-tags">
        {% for t in p.tags %}<span class="pub-tag">{{ t }}</span>{% endfor %}
      </div>
      {% endif %}
      {% if p.repo or p.demo %}
      <div class="project-links">
        {% if p.repo %}
        <a class="pub-link" href="{{ p.repo }}" target="_blank" rel="noopener">GitHub</a>
        {% endif %}
        {% if p.demo %}
        <a class="pub-link" href="{{ p.demo }}" target="_blank" rel="noopener">Demo</a>
        {% endif %}
      </div>
      {% endif %}
    </div>
    {% endfor %}
  </div>
</div>
```

- [ ] **Step 3: Write `cv.md`**

Note: headings inside the container are raw HTML `<h2>` on purpose — kramdown does not process markdown inside an HTML block.

```markdown
---
layout: default
title: CV
permalink: /cv/
---
<div class="page-container">
  <h1 class="page-title">CV</h1>

  <p><a class="pub-link" href="{{ '/assets/cv.pdf' | relative_url }}">Download CV (PDF)</a>
  <em>(link is a placeholder — drop your <code>cv.pdf</code> into <code>assets/</code>)</em></p>

  <h2>Education</h2>
  {% include experience-list.html items=site.data.education %}

  <h2>Experience</h2>
  {% include experience-list.html items=site.data.experience %}

  <h2>Skills</h2>
  <ul>
    <li>Placeholder skill group one: language, language, framework</li>
    <li>Placeholder skill group two: infrastructure, tooling</li>
  </ul>

  <h2>Awards</h2>
  <ul>
    <li>20XX — Placeholder award</li>
  </ul>
</div>
```

- [ ] **Step 4: Build and verify**

Run: `bundle exec jekyll build`
Expected: exit 0.

Run: `grep -c 'class="project-card"' _site/projects/index.html`
Expected: `3`.

Run: `grep -c 'class="experience-item"' _site/cv/index.html`
Expected: `4`.

Run: `grep -c 'Download CV' _site/cv/index.html`
Expected: `1`.

- [ ] **Step 5: Commit**

```bash
git add _data/projects.yml projects.md cv.md
git commit -m "feat: projects and cv pages

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: 404 page, README, final QA

**Files:**
- Create: `404.html`
- Create: `README.md`

- [ ] **Step 1: Write `404.html`**

```html
---
layout: default
permalink: /404.html
---
<div class="page-container notfound">
  <h1 class="page-title">404</h1>
  <p>The page you are looking for does not exist or has been moved.</p>
  <p><a href="{{ '/' | relative_url }}">&larr; Back to Home</a></p>
</div>
```

- [ ] **Step 2: Write `README.md`**

````markdown
# JasonkayZK.github.io

English academic personal site, built with a hand-written Jekyll theme and
served by GitHub Pages from this branch (`save`). Old blog backup lives in
`__bak/` and is excluded from the build.

## Run locally

```bash
bundle install        # first time only
bundle exec jekyll serve
# → http://127.0.0.1:4000
```

## Editing content (no HTML involved)

| What | Where |
|---|---|
| Name, email, description, avatar, social links | `_config.yml` |
| Home page text (research interests, news, contact) | `index.md` |
| Education / Experience rows | `_data/education.yml`, `_data/experience.yml` |
| Publications | `_data/publications.yml` |
| Projects | `_data/projects.yml` |
| Blog posts | `_posts/YYYY-MM-DD-title.md` |
| Avatar / institution logos | `img/photo.*`, `img/logos/` |
| CV PDF | drop `assets/cv.pdf`, link already points there |

### Add a blog post

Create `_posts/2026-10-30-my-post.md`:

```markdown
---
title: "My Post"
date: 2026-10-30 10:00:00 +08:00
tags: [systems, rust]      # lowercase, no spaces
category: technical        # optional badge
excerpt: "Shown on the blog index."
---

Body in Markdown.
```

### Add a publication

Append to `_data/publications.yml` — copy an existing entry's shape. Use
`venue: "Preprint"` to list it under **Manuscript**; otherwise set `year` and
it is grouped by year automatically.

### Logos & photo

Replace the SVG placeholders in `img/logos/` with real logos (48×48 works
best), and replace the avatar by dropping `img/photo.jpg` and changing
`avatar:` in `_config.yml`.

## Deployment

GitHub Pages builds this branch directly — push to `save` and it deploys. No
CI. If Pages is not yet serving from this branch:

1. Push the branch: `git push origin save`
2. GitHub → repo → **Settings → Pages**
3. Under *Build and deployment* → Source: **Deploy from a branch**
4. Branch: `save` / `(root)` → **Save**

The old workflow (Hexo → `master`) lived only ever at the repo root on old
commits; `.github/` now only exists inside `__bak/` where GitHub ignores it.
The `master` branch still holds the last Hexo build as an archive and can be
deleted once the new site is confirmed live.
````

- [ ] **Step 3: Full rebuild and QA checklist**

Run: `rm -rf _site && bundle exec jekyll build`
Expected: exit 0, `Generation done`.

Run: `ls _site`
Expected exactly: `404.html  assets  blog  cv  feed.xml  img  index.html  projects  publications` (order irrelevant; no `__bak`, no `docs`, no `README.html`).

Run: `test ! -e _site/__bak && test ! -e _site/docs && test ! -e .github/workflows && echo CLEAN`
Expected: `CLEAN` (backup and specs never render; no workflow file at repo root that could interfere).

Run: `grep -c 'research-highlight\|home-affiliation' _site/index.html`
Expected: ≥ 1.

Run: `grep -o '<title>[^<]*</title>' _site/index.html _site/publications/index.html _site/blog/index.html _site/cv/index.html _site/projects/index.html`
Expected: five titles, each ending in `| Your Name`.

- [ ] **Step 4: Visual smoke test with the dev server**

Run: `bundle exec jekyll serve` (background), then:

```bash
for p in / /publications/ /blog/ /blog/2026/10/20/hello-world/ /projects/ /cv/ /404.html /feed.xml; do
  curl -s -o /dev/null -w "%{http_code} $p\n" "http://127.0.0.1:4000$p"
done
```

Expected: every line `200`. Stop the server afterwards. (Interactive check: open http://127.0.0.1:4000 in a browser and confirm the layout matches the reference site: fixed nav with 中文站/日文站 links, sidebar avatar, blue accent `#2563EB`, publication filter pills, abstract toggles, blog tag pills, mobile hamburger at narrow width.)

- [ ] **Step 5: Commit**

```bash
git add 404.html README.md
git commit -m "feat: 404 page, README, final QA

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Deploy (user manual steps — do NOT run without the user)

1. `git push origin save`
2. GitHub → `JasonkayZK/JasonkayZK.github.io` → **Settings → Pages** → Source: *Deploy from a branch* → Branch: `save` / `(root)` → Save.
3. Wait for the Pages workflow to finish; verify `https://jasonkayzk.github.io/` serves the new site.
4. Optional cleanup later: delete the `master` branch (old Hexo build archive) — ask the user first.
