# Academic Blog Rebuild Implementation Plan (v2 — Yohaku style)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `jasonkayzk.github.io` from scratch as an English academic personal site (PhD-application oriented) whose visual language is a vanilla HTML/CSS/JS port of https://innei.in/en (Yohaku), deployed via GitHub Pages native build from the `save` branch.

**Architecture:** Jekyll (github-pages gem) with hand-written layouts/includes, data-driven content in `_data/*.yml`, one stylesheet implementing Yohaku's design system via CSS custom properties (light/dark themes), three small vanilla-JS files. No frameworks, no CI.

**Tech Stack:** Ruby 3.3 + Bundler, `github-pages` gem (Jekyll 3.10, kramdown, Rouge), jekyll-feed for RSS. Google Fonts: EB Garamond + Inter.

**Spec:** `docs/superpowers/specs/2026-10-25-academic-blog-rebuild-design.md` (revised — Yohaku)

**Working directory:** `/Users/zk/workspace/blog` (git branch `save`). All commands run from repo root. `__bak/` and `docs/` already exist — never delete or modify them. Commit messages verbatim including the Co-Authored-By line.

**Environment note (verified):** this machine's Command Line Tools has broken C++ headers (`/usr/include/c++/v1/` holds only stale files). The `github-pages` gem's sassc native build needs `CPLUS_INCLUDE_PATH` pointed at the SDK. Use this exact invocation whenever running `bundle install` the first time:

```bash
export CPLUS_INCLUDE_PATH="$(xcrun --show-sdk-path)/usr/include/c++/v1:$(xcrun --show-sdk-path)/usr/include"
bundle install
```

`Gemfile.lock` gets committed afterwards, so later `bundle exec` calls don't rebuild native gems.

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
  Personal website of Your Name — software engineer and aspiring researcher.
  Replace this description in _config.yml.
affiliation: "Aspiring Ph.D. Student"
hero_tagline: "I turn curiosity into systems"
hero_keywords: [LLM, Systems, RL]
site_since: 2019
avatar: "/img/photo.svg"

# Social links shown on the home hero (leave a value empty to hide the icon)
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

```bash
export CPLUS_INCLUDE_PATH="$(xcrun --show-sdk-path)/usr/include/c++/v1:$(xcrun --show-sdk-path)/usr/include"
bundle install
```

Expected: exit 0, `Bundle complete!` (first run compiles sassc, takes minutes). If it fails on C++ headers, verify the env var was exported in the same shell invocation and retry. Do NOT swap for plain `gem "jekyll"`.

- [ ] **Step 5: Verify a clean build on the empty site**

Run: `bundle exec jekyll build`
Expected: exit 0, `Generation done`, a `_site/` directory appears.

- [ ] **Step 6: Commit**

```bash
git add Gemfile Gemfile.lock .gitignore _config.yml
git commit -m "feat: bootstrap jekyll site config

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Base layout, nav (with theme toggle), footer, social icons, theme.js

**Files:**
- Create: `_layouts/default.html`
- Create: `_layouts/page.html`
- Create: `_includes/nav.html`
- Create: `_includes/footer.html`
- Create: `_includes/social-links.html`
- Create: `assets/js/theme.js`
- Create: `index.md` (stub, replaced in Task 4)

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
    <meta name="theme-color" content="#faf7f0" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#1c1c1e" media="(prefers-color-scheme: dark)">
    <link rel="canonical" href="{{ page.url | replace: 'index.html', '' | absolute_url }}">
    <link rel="alternate" type="application/atom+xml" title="{{ site.title | escape }}" href="{{ '/feed.xml' | absolute_url }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ '/assets/css/style.scss' | relative_url }}">
    <script>
      // Prevent flash of wrong theme: applied before first paint.
      (function () {
        try {
          var t = localStorage.getItem('theme');
          if (t !== 'light' && t !== 'dark') t = 'auto';
          if (t === 'auto') t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', t);
        } catch (e) { /* localStorage unavailable: stay light */ }
      })();
    </script>
    {% feed_meta %}
  </head>
  <body>
    {% include nav.html %}
    <main class="page-content">
      {{ content }}
    </main>
    {% include footer.html %}
    <script src="{{ '/assets/js/theme.js' | relative_url }}"></script>
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
      <li class="nav-theme">
        <button class="theme-toggle" aria-label="Toggle dark mode" title="Toggle dark mode">
          <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
      </li>
    </ul>
  </div>
</nav>
```

- [ ] **Step 4: Write `_includes/footer.html`**

```html
<footer class="site-footer">
  <div class="footer-container">
    <span class="corner corner-tl" aria-hidden="true"></span>
    <span class="corner corner-tr" aria-hidden="true"></span>
    <span class="corner corner-bl" aria-hidden="true"></span>
    <span class="corner corner-br" aria-hidden="true"></span>
    <p>&copy; {{ site.time | date: '%Y' }} {{ site.author }} · Built with <a href="https://jekyllrb.com">Jekyll</a> &amp; hosted on <a href="https://pages.github.com">GitHub Pages</a></p>
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

- [ ] **Step 6: Write `assets/js/theme.js`**

```javascript
(function () {
  var root = document.documentElement;
  var btn = document.querySelector('.theme-toggle');
  if (!btn) return;

  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  // Follow OS changes while in auto mode (no stored preference).
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  var onChange = function (e) {
    try {
      if (!localStorage.getItem('theme')) {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    } catch (err) { /* ignore */ }
  };
  if (mq.addEventListener) mq.addEventListener('change', onChange);

  btn.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (err) { /* ignore */ }
  });
})();
```

- [ ] **Step 7: Write stub `index.md`**

```markdown
---
layout: page
---
Coming soon.
```

Note: the stylesheet referenced (`/assets/css/style.scss`) does not exist until Task 3 — the page will be unstyled, which is expected at this stage.

- [ ] **Step 8: Build and verify**

Run: `bundle exec jekyll build`
Expected: exit 0.

Run: `grep -c 'site-nav' _site/index.html && grep -c 'theme-toggle' _site/index.html && grep -c 'jasonkayzk.github.io/cn/' _site/index.html`
Expected: all ≥ 1.

Run: `grep -c "localStorage.getItem('theme')" _site/index.html`
Expected: ≥ 1 (inline FOUC guard present).

Run: `ls _site/assets/js/theme.js`
Expected: exists.

- [ ] **Step 9: Commit**

```bash
git add _layouts _includes index.md assets/js/theme.js
git commit -m "feat: base layout with nav, theme toggle, footer

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Full Yohaku stylesheet

**Files:**
- Create: `assets/css/style.scss`

- [ ] **Step 1: Write `assets/css/style.scss`**

The file starts with the required SCSS front matter (`---` newline `---`), then all CSS below.

```scss
---
---

/* ==========================================================================
   Yohaku-inspired design system, ported to plain CSS for Jekyll.
   Light: warm paper #faf7f0 / rose accent #c56473.
   Dark:  #1c1c1e / #e095a4.  Everything switches via [data-theme].
   ========================================================================== */

:root,
[data-theme="light"] {
  --paper: #faf7f0;
  --paper-raised: #fffdf8;
  --accent: #c56473;
  --accent-soft: rgba(197, 100, 115, 0.08);
  --accent-glow: rgba(197, 100, 115, 0.28);
  --hairline: rgba(0, 0, 0, 0.06);
  --hairline-strong: rgba(0, 0, 0, 0.12);
  --card-bg: rgba(255, 255, 255, 0.5);
  --card-border: rgba(0, 0, 0, 0.05);
  --ink: #141312;
  --haze: #57534e;
  --faint: #78716c;

  --neutral-1: #f9f8f5;
  --neutral-2: #f0efeb;
  --neutral-3: #e3e1db;
  --neutral-5: #a8a29a;

  --font-serif: "EB Garamond", Georgia, "Times New Roman", serif;
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", "SF Mono", Monaco, Consolas, monospace;
}

[data-theme="dark"] {
  --paper: #1c1c1e;
  --paper-raised: #242424;
  --accent: #e095a4;
  --accent-soft: rgba(224, 149, 164, 0.1);
  --accent-glow: rgba(224, 149, 164, 0.3);
  --hairline: rgba(255, 255, 255, 0.07);
  --hairline-strong: rgba(255, 255, 255, 0.14);
  --card-bg: rgba(255, 255, 255, 0.04);
  --card-border: rgba(255, 255, 255, 0.06);
  --ink: #f8f8f8;
  --haze: #a5a3a0;
  --faint: #8b8887;

  --neutral-1: #141414;
  --neutral-2: #242424;
  --neutral-3: #2e2e2e;
  --neutral-5: #646264;
}

*,
*::before,
*::after { box-sizing: border-box; margin: 0; padding: 0; }

html { font-size: 16px; scroll-behavior: smooth; }

body {
  font-family: var(--font-sans);
  color: var(--ink);
  background-color: var(--paper);
  line-height: 1.75;
  -webkit-font-smoothing: antialiased;
  transition: background-color 0.3s ease, color 0.3s ease;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-serif);
  font-weight: 500;
  line-height: 1.3;
  color: var(--ink);
}
h1 { font-size: 2.2rem; }
h2 { font-size: 1.5rem; }
h3 { font-size: 1.2rem; }
h2, h3 { letter-spacing: 0.01em; }

p { margin-bottom: 1.25em; }

a { color: var(--accent); text-decoration: none; transition: color 0.2s ease; }
a:hover { color: var(--ink); }

img { max-width: 100%; height: auto; }

ul, ol { margin-bottom: 1.25em; padding-left: 1.5em; }

blockquote {
  border-left: 2px solid var(--accent);
  margin: 1.5em 0;
  padding: 0.25em 1.25em;
  color: var(--haze);
  font-family: var(--font-serif);
  font-style: italic;
}

hr { border: none; height: 1px; background: var(--hairline); margin: 2em 0; }

code {
  font-family: var(--font-mono);
  font-size: 0.85em;
  background: var(--neutral-2);
  padding: 0.15em 0.4em;
  border-radius: 4px;
}
pre {
  background: var(--neutral-2);
  border: 1px solid var(--hairline);
  border-radius: 8px;
  padding: 1em 1.25em;
  overflow-x: auto;
  margin-bottom: 1.5em;
}
pre code { background: none; padding: 0; font-size: 0.85rem; }

table { width: 100%; border-collapse: collapse; margin-bottom: 1.5em; }
th, td { text-align: left; padding: 0.6em 1em; border-bottom: 1px solid var(--hairline); }
th { font-weight: 600; background: var(--neutral-1); }

strong { font-weight: 600; }

/*--------------------------------------------------------------------------
  Layout
--------------------------------------------------------------------------*/
.page-content { min-height: calc(100vh - 60px - 100px); }

.page-container { max-width: 880px; margin: 0 auto; padding: 3rem 1.5rem 4rem; }
.post-container { max-width: 760px; margin: 0 auto; padding: 3rem 1.5rem 4rem; }

.page-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: var(--faint);
  font-family: var(--font-sans);
}
.page-title {
  margin: 0.6rem 0 2.5rem;
  font-size: 1.75rem;
  font-weight: 500;
}

/*--------------------------------------------------------------------------
  Navigation
--------------------------------------------------------------------------*/
.site-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--paper);
  border-bottom: 1px solid var(--hairline);
  backdrop-filter: blur(8px);
  transition: background-color 0.3s ease;
}
.nav-container {
  max-width: 1020px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.nav-title {
  font-family: var(--font-serif);
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--ink);
}
.nav-title:hover { color: var(--accent); }
.nav-links { list-style: none; display: flex; align-items: center; gap: 1.6rem; margin: 0; padding: 0; }
.nav-links > li > a {
  color: var(--haze);
  font-size: 0.9rem;
  padding: 0.25em 0;
  transition: color 0.2s;
}
.nav-links > li > a:hover { color: var(--accent); }
.nav-links > li > a.active { color: var(--accent); }
.nav-external { display: flex; gap: 1.2rem; padding-left: 1.6rem; margin-left: 0.4rem; border-left: 1px solid var(--hairline); }
.nav-theme { display: flex; align-items: center; }
.theme-toggle {
  background: none;
  border: 1px solid var(--hairline-strong);
  border-radius: 50%;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--haze);
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}
.theme-toggle:hover { color: var(--accent); border-color: var(--accent); }
[data-theme="light"] .icon-moon { display: none; }
[data-theme="dark"] .icon-sun { display: none; }

.nav-toggle { display: none; }
.nav-hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 5px; }
.nav-hamburger span { width: 22px; height: 1.5px; background: var(--ink); transition: transform 0.3s, opacity 0.3s; }

/*--------------------------------------------------------------------------
  Footer
--------------------------------------------------------------------------*/
.site-footer { border-top: 1px solid var(--hairline); }
.footer-container {
  max-width: 1020px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 3rem;
  position: relative;
  text-align: center;
  color: var(--faint);
  font-size: 0.85rem;
}
.footer-container p { margin-bottom: 0; }
.footer-container a { color: var(--haze); }
.footer-container a:hover { color: var(--accent); }
/* innei-style corner marks */
.corner { position: absolute; width: 14px; height: 14px; border-color: var(--hairline-strong); border-style: solid; border-width: 0; }
.corner-tl { top: 1.2rem; left: 0;    border-top-width: 1px;    border-left-width: 1px; }
.corner-tr { top: 1.2rem; right: 0;   border-top-width: 1px;    border-right-width: 1px; }
.corner-bl { bottom: 1.2rem; left: 0; border-bottom-width: 1px; border-left-width: 1px; }
.corner-br { bottom: 1.2rem; right: 0;border-bottom-width: 1px; border-right-width: 1px; }

/*--------------------------------------------------------------------------
  Home — hero
--------------------------------------------------------------------------*/
.hero {
  position: relative;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 1.5rem 5rem;
  overflow: hidden;
}
.hero-glow {
  position: absolute;
  top: 42%;
  left: 50%;
  width: 450px;
  height: 450px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(ellipse, var(--accent-glow) 0%, transparent 55%);
  opacity: 0.35;
  pointer-events: none;
}
.hero-avatar {
  width: 112px;
  height: 112px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px var(--hairline-strong), 0 8px 24px rgba(0, 0, 0, 0.08);
  object-fit: cover;
  margin-bottom: 2rem;
}
.hero-greeting {
  font-family: var(--font-serif);
  font-size: 2.2rem;
  font-weight: 400;
  color: var(--ink);
  margin-bottom: 0.75rem;
}
.hero-greeting .hero-name {
  font-weight: 560;
  letter-spacing: -0.035em;
  color: var(--accent);
  text-shadow: 0 0 28px var(--accent-glow);
}
.hero-greeting .wave { display: inline-block; transform: rotate(-8deg) translateY(-0.03em); margin-left: 0.14em; font-weight: 300; }
.hero-tagline {
  font-family: var(--font-serif);
  font-size: 1.15rem;
  font-style: italic;
  font-weight: 400;
  color: var(--haze);
  margin-bottom: 1.75rem;
}
.hero-keywords {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2.5rem;
}
.hero-keyword {
  font-size: 0.78rem;
  font-weight: 500;
  padding: 0.25em 0.9em;
  border: 1px solid var(--hairline-strong);
  border-radius: 999px;
  color: var(--haze);
}
.hero-stats {
  display: flex;
  gap: 2.5rem;
  justify-content: center;
  flex-wrap: wrap;
  font-size: 0.85rem;
  color: var(--faint);
  margin-bottom: 2.25rem;
  font-variant-numeric: tabular-nums;
}
.hero-stats strong { color: var(--haze); font-weight: 600; }
.hero .social-links { gap: 0.9rem; }
.hero .social-links a { color: var(--haze); }
.hero .social-links a:hover { color: var(--accent); transform: translateY(-2px); }

/* Entrance animations */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.hero-avatar, .hero-greeting, .hero-tagline, .hero-keywords, .hero-stats, .hero .social-links {
  opacity: 0;
  animation: fade-up 0.7s ease forwards;
}
.hero-greeting { animation-delay: 0.05s; }
.hero-tagline { animation-delay: 0.15s; }
.hero-keywords { animation-delay: 0.25s; }
.hero-stats { animation-delay: 0.35s; }
.hero .social-links { animation-delay: 0.45s; }

/*--------------------------------------------------------------------------
  Home — below hero
--------------------------------------------------------------------------*/
.home-body { max-width: 880px; margin: 0 auto; padding: 0 1.5rem 5rem; }
.home-section { margin-top: 4rem; }
.home-section-title {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  letter-spacing: 2px;
  color: var(--haze);
  margin-bottom: 1.25rem;
}

/* Timeline list (Recent Writing) */
.timeline-list { position: relative; }
.timeline-list::before {
  content: "";
  position: absolute;
  top: 1rem; bottom: 1rem; left: 19px;
  width: 1px;
  background: var(--hairline-strong);
}
.timeline-item { position: relative; padding: 0.75rem 0 0.75rem 3rem; }
.timeline-index {
  position: absolute;
  left: 19px;
  top: 0.9rem;
  transform: translateX(-50%);
  background: var(--paper);
  padding: 0 0.4em;
  font-size: 0.72rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--faint);
}
.timeline-item:first-child .timeline-index { color: var(--accent); }
.timeline-meta { font-size: 0.78rem; color: var(--faint); margin-bottom: 0.15rem; display: flex; gap: 0.5rem; flex-wrap: wrap; }
.timeline-title {
  font-family: var(--font-serif);
  font-size: 1.15rem;
  font-weight: 500;
  line-height: 1.35;
  color: var(--ink);
  transition: color 0.2s;
}
.timeline-item a { color: inherit; }
.timeline-item a:hover .timeline-title { color: var(--accent); }
.timeline-title-large { font-size: 1.35rem; }

/* Experience rows (Education / Experience) */
.social-links { display: flex; gap: 0.75rem; }
.social-links a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: var(--haze);
  background: var(--accent-soft);
  transition: color 0.2s, background-color 0.2s, transform 0.2s;
}
.social-links a:hover { color: var(--accent); background: var(--accent-soft); }

.experience-list { display: flex; flex-direction: column; gap: 0.9rem; }
.experience-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1.1rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 10px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.experience-item:hover { transform: translateY(-1px); box-shadow: 0 2px 16px rgba(0, 0, 0, 0.05); }
.experience-logo { width: 44px; height: 44px; object-fit: contain; border-radius: 8px; flex-shrink: 0; }
.experience-details { flex: 1; min-width: 0; }
.experience-title { font-weight: 600; font-size: 0.95rem; color: var(--ink); }
.experience-subtitle, .experience-org { font-size: 0.85rem; color: var(--haze); }
.experience-date { font-size: 0.8rem; color: var(--faint); font-style: italic; font-family: var(--font-serif); }

/*--------------------------------------------------------------------------
  Pills (used by publications filter, blog tag filter, tags)
--------------------------------------------------------------------------*/
.filter-bar { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 2rem; }
.filter-pill {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  font-weight: 500;
  padding: 0.3em 0.95em;
  border: 1px solid var(--hairline-strong);
  border-radius: 999px;
  background: none;
  color: var(--haze);
  cursor: pointer;
  transition: all 0.2s;
}
.filter-pill:hover { border-color: var(--accent); color: var(--accent); }
.filter-pill.active { background: var(--accent); border-color: var(--accent); color: var(--paper-raised); }
.tag-chip {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 500;
  padding: 0.12em 0.6em;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
}

/*--------------------------------------------------------------------------
  Publications
--------------------------------------------------------------------------*/
.pub-year-section { margin-bottom: 2.5rem; }
.pub-year {
  font-size: 1.1rem;
  font-family: var(--font-serif);
  color: var(--faint);
  border-bottom: 1px dashed var(--hairline-strong);
  padding-bottom: 0.4rem;
  margin-bottom: 0.5rem;
}
.pub-card { padding: 1.4rem 0; border-bottom: 1px solid var(--hairline); }
.pub-card:last-child { border-bottom: none; }
.pub-title {
  font-family: var(--font-serif);
  font-size: 1.18rem;
  font-weight: 500;
  line-height: 1.4;
  color: var(--ink);
  margin-bottom: 0.35rem;
}
.pub-card > .pub-card-main > .pub-title a { color: inherit; }
.pub-card > .pub-card-main > .pub-title a:hover { color: var(--accent); }
.pub-authors { font-size: 0.9rem; color: var(--haze); margin-bottom: 0.25rem; }
.pub-venue { font-size: 0.9rem; color: var(--haze); font-style: italic; font-family: var(--font-serif); margin-bottom: 0.6rem; }
.pub-award {
  display: inline-block;
  font-family: var(--font-sans);
  font-style: normal;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.1em 0.6em;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  margin-left: 0.5rem;
}
.pub-actions { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.6rem; }
.pub-links { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.pub-link {
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 500;
  padding: 0.22em 0.8em;
  border: 1px solid var(--accent);
  border-radius: 999px;
  color: var(--accent);
  background: none;
  transition: background 0.2s, color 0.2s;
}
.pub-link:hover { background: var(--accent); color: var(--paper-raised); }
.pub-abstract-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-family: var(--font-sans);
  font-size: 0.78rem;
  font-weight: 500;
  padding: 0.22em 0.8em;
  border: 1px dashed var(--hairline-strong);
  border-radius: 999px;
  color: var(--haze);
  background: none;
  cursor: pointer;
  transition: all 0.2s;
}
.pub-abstract-toggle:hover { border-color: var(--accent); color: var(--accent); }
.pub-abstract-toggle[aria-expanded="true"] { border-style: solid; color: var(--accent); }
.pub-chevron { font-size: 0.7rem; transition: transform 0.3s ease; }
.pub-abstract-toggle[aria-expanded="true"] .pub-chevron { transform: rotate(180deg); }
.pub-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.pub-details { display: none; }
.pub-details[aria-hidden="false"] { display: block; }
.pub-abstract {
  margin-top: 0.9rem;
  padding: 0.9rem 1.1rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-left: 2px solid var(--accent);
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--haze);
}

/*--------------------------------------------------------------------------
  Blog list (timeline style, innei-like)
--------------------------------------------------------------------------*/
.blog-container { max-width: 760px; margin: 0 auto; padding: 3rem 1.5rem 4rem; }
.blog-container .timeline-list { margin-top: 0.5rem; }

/*--------------------------------------------------------------------------
  Post page
--------------------------------------------------------------------------*/
.post-header { margin-bottom: 2.25rem; }
.post-title { font-size: 2rem; font-weight: 500; margin-bottom: 0.6rem; }
.post-meta { display: flex; align-items: center; gap: 1rem; color: var(--faint); font-size: 0.85rem; flex-wrap: wrap; }
.post-category-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.12em 0.7em;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
}
.post-reading-time { font-variant-numeric: tabular-nums; }

.post-content { font-size: 1rem; line-height: 1.85; color: var(--ink); }
.post-content h2 { margin-top: 2.5rem; }
.post-content h3 { margin-top: 2rem; }
.post-content img { border-radius: 8px; margin: 1.5em 0; }
.post-content a { text-decoration: underline; text-decoration-color: var(--accent-soft); text-underline-offset: 3px; }
.post-content a:hover { text-decoration-color: var(--accent); }

.post-footer { margin-top: 3.5rem; padding-top: 1.5rem; border-top: 1px dashed var(--hairline-strong); }
.back-to-blog { display: inline-block; margin-bottom: 0.9rem; font-size: 0.9rem; color: var(--haze); }
.back-to-blog:hover { color: var(--accent); }
.post-nav { display: flex; justify-content: space-between; gap: 1rem; }
.post-nav-prev, .post-nav-next { font-size: 0.85rem; max-width: 48%; }

/*--------------------------------------------------------------------------
  Projects
--------------------------------------------------------------------------*/
.projects-list { display: flex; flex-direction: column; gap: 1.1rem; }
.project-card {
  padding: 1.4rem 1.5rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.project-card:hover { transform: translateY(-2px); box-shadow: 0 2px 16px rgba(0, 0, 0, 0.05); }
.project-title { font-family: var(--font-serif); font-size: 1.2rem; margin-bottom: 0.4rem; }
.project-title a { color: var(--ink); }
.project-title a:hover { color: var(--accent); }
.project-description { font-size: 0.92rem; color: var(--haze); margin-bottom: 0.8rem; }
.project-links { display: flex; gap: 0.5rem; margin-top: 0.9rem; }

/*--------------------------------------------------------------------------
  404
--------------------------------------------------------------------------*/
.notfound { text-align: center; padding: 5rem 0 6rem; }
.notfound p { color: var(--haze); }

/*--------------------------------------------------------------------------
  Syntax highlighting (tuned for paper background)
--------------------------------------------------------------------------*/
.highlight .c, .highlight .c1, .highlight .cm { color: #8b8887; font-style: italic; }
.highlight .k, .highlight .kd, .highlight .kn, .highlight .kp, .highlight .kr, .highlight .kt { color: #a35d6a; }
.highlight .s, .highlight .s1, .highlight .s2, .highlight .sb, .highlight .sc, .highlight .sd, .highlight .sh, .highlight .sx { color: #5c6e5a; }
.highlight .na { color: #8a6a4f; }
.highlight .nb { color: #55628d; }
.highlight .nc { color: #8a6a4f; }
.highlight .nf, .highlight .nx { color: #8a6a4f; }
.highlight .no { color: #55628d; }
.highlight .nn { color: #55628d; }
.highlight .o { color: #57534e; }
.highlight .mi, .highlight .mf { color: #7a5b3a; }

/*--------------------------------------------------------------------------
  Responsive
--------------------------------------------------------------------------*/
@media (max-width: 768px) {
  .nav-hamburger { display: flex; }
  .nav-links {
    position: absolute;
    top: 60px; left: 0; right: 0;
    background: var(--paper);
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 0;
    border-bottom: 1px solid var(--hairline);
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }
  .nav-toggle:checked ~ .nav-links { max-height: 460px; }
  .nav-links > li { border-bottom: 1px solid var(--hairline); }
  .nav-links > li > a, .nav-links .nav-external a { display: block; padding: 0.8rem 1.5rem; }
  .nav-links .nav-external { display: contents; }
  .nav-links .nav-theme { padding: 0.6rem 1.5rem; border-bottom: 1px solid var(--hairline); }
  .nav-toggle:checked ~ .nav-hamburger span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
  .nav-toggle:checked ~ .nav-hamburger span:nth-child(2) { opacity: 0; }
  .nav-toggle:checked ~ .nav-hamburger span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }
  .hero { min-height: calc(100vh - 60px); }
  .hero-greeting { font-size: 1.7rem; }
  .hero-avatar { width: 88px; height: 88px; }
  .hero-stats { gap: 1.5rem; }
  .post-title { font-size: 1.5rem; }
  .post-nav { flex-direction: column; }
}

@media (max-width: 480px) {
  body { font-size: 15px; }
  .page-container, .post-container, .blog-container { padding-left: 1rem; padding-right: 1rem; }
}
```

- [ ] **Step 2: Build and verify the stylesheet compiles**

Run: `bundle exec jekyll build && head -5 _site/assets/css/style.css && grep -c 'data-theme="dark"' _site/assets/css/style.css`
Expected: exit 0; compiled CSS present and contains the dark-theme selector (`2` occurrences or more — variable block + any usage).

- [ ] **Step 3: Commit**

```bash
git add assets/css/style.scss
git commit -m "feat: yohaku-style site stylesheet with dark mode

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Home page — hero, timeline, experience lists, placeholder images

**Files:**
- Create: `_layouts/home.html`
- Create: `_includes/experience-list.html`
- Create: `_includes/timeline-item.html`
- Create: `_data/education.yml`
- Create: `_data/experience.yml`
- Create: `img/photo.svg`
- Create: `img/logos/university_a.svg`, `img/logos/university_b.svg`, `img/logos/company_a.svg`, `img/logos/company_b.svg`
- Modify (replace stub): `index.md`

- [ ] **Step 1: Write `_layouts/home.html`**

Computes stats at build time: post count, total words (200 wpm reading words summed), years since `site.site_since`, latest 5 posts for the timeline. Hero fields come from `_config.yml` (`hero_tagline`, `hero_keywords`, `site_since`).

```html
---
layout: default
---
{% assign total_words = 0 %}
{% for post in site.posts %}
  {% assign total_words = total_words | plus: post.content | strip_html | number_of_words %}
{% endfor %}
{% assign years_active = site.time | date: '%Y' | minus: site.site_since %}

<section class="hero">
  <div class="hero-glow" aria-hidden="true"></div>
  <img src="{{ site.avatar }}" alt="{{ site.author }}" class="hero-avatar">
  <h1 class="hero-greeting">
    <span style="font-weight: 300;">Hi, I'm </span><span class="hero-name">{{ site.author }}</span><span class="wave"> 👋</span>
  </h1>
  <p class="hero-tagline">{{ site.hero_tagline }}</p>
  <div class="hero-keywords">
    {% for kw in site.hero_keywords %}
    <span class="hero-keyword">{{ kw }}</span>
    {% endfor %}
  </div>
  <div class="hero-stats">
    <span><strong>{{ site.posts | size }}</strong> posts</span>
    <span><strong>{{ total_words | divided_by: 1000 }}k</strong> words</span>
    <span><strong>{{ years_active }}</strong> years writing</span>
  </div>
  {% include social-links.html %}
</section>

<div class="home-body">
  {{ content }}

  {% if site.posts != empty %}
  <section class="home-section">
    <h2 class="home-section-title">Recent Writing</h2>
    <div class="timeline-list">
      {% assign recent = site.posts | sort: date | reverse %}
      {% for post in recent limit: 5 %}
      {% assign idx = forloop.index | prepend: '0' %}
      <div class="timeline-item">
        <span class="timeline-index">{{ idx | slice: -2, 2 }}</span>
        <div class="timeline-meta">
          <span>{{ post.date | date: '%b %-d, %Y' }}</span>
          {% if post.category %}<span>·</span><span>{{ post.category }}</span>{% endif %}
        </div>
        <a href="{{ post.url | relative_url }}">
          <h3 class="timeline-title {% if forloop.first %}timeline-title-large{% endif %}">{{ post.title }}</h3>
        </a>
      </div>
      {% endfor %}
    </div>
  </section>
  {% endif %}

  {% if site.data.education and site.data.education != empty %}
  <section class="home-section">
    <h2 class="home-section-title">Education</h2>
    {% include experience-list.html items=site.data.education %}
  </section>
  {% endif %}

  {% if site.data.experience and site.data.experience != empty %}
  <section class="home-section">
    <h2 class="home-section-title">Experience</h2>
    {% include experience-list.html items=site.data.experience %}
  </section>
  {% endif %}
</div>
```

Note on the Liquid: `{% assign total_words = total_words | plus: post.content | strip_html | number_of_words %}` — filter order matters here and evaluates right-to-left in Liquid chains; this construct is unreliable across Jekyll versions. Since Task 6 adds posts, verify at Step 7 that `_site/index.html` contains a non-`0k` words figure; if it renders `0k` with posts present, replace with per-post capture:

```liquid
{% assign total_words = 0 %}
{% for post in site.posts %}
  {% assign w = post.content | strip_html | number_of_words %}
  {% assign total_words = total_words | plus: w %}
{% endfor %}
```

(This per-post form is the correct fallback; use it directly if the first build already misses it.)

- [ ] **Step 2: Write `_includes/experience-list.html`**

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
  subtitle: Ph.D. in Computer Science (prospective)
  org: Department of Computer Science
  dates: 2027 – expected
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
- title: Placeholder Company A
  subtitle: Senior Backend Engineer
  org: Platform Engineering
  dates: 2023 – present
  logo: /img/logos/company_a.svg

- title: Placeholder Company B
  subtitle: Backend Engineer
  org: Infrastructure
  dates: 2020 – 2023
  logo: /img/logos/company_b.svg
```

- [ ] **Step 5: Write placeholder images**

`img/photo.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <circle cx="90" cy="90" r="88" fill="#f0efeb"/>
  <circle cx="90" cy="90" r="87" fill="none" stroke="#e3e1db" stroke-width="2"/>
  <text x="90" y="113" font-family="Georgia, 'Times New Roman', serif" font-size="58" font-weight="500" fill="#c56473" text-anchor="middle">JK</text>
</svg>
```

`img/logos/university_a.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <rect width="48" height="48" rx="10" fill="#f0efeb"/>
  <text x="24" y="31" font-family="Georgia, serif" font-size="18" font-weight="500" fill="#57534e" text-anchor="middle">PU</text>
</svg>
```

`img/logos/university_b.svg`: same but initials `AU`.
`img/logos/company_a.svg`: same but initials `CA`, text `fill="#c56473"`.
`img/logos/company_b.svg`: same as company_a but initials `CB`.

- [ ] **Step 6: Replace `index.md`**

```markdown
---
layout: home
---
## Research Interests

Replace this section with 2–3 paragraphs describing what you work on and what
you want to study in a Ph.D. program. Name the areas, the questions that drive
you, and what you have built or explored so far. Keep it specific — admissions
readers skim hundreds of these.

## News

- **2026** — Placeholder: this site was rebuilt.
- **2026** — Placeholder: preparing Ph.D. applications for Fall 2027.

## Contact

Email: your-email@example.com
```

- [ ] **Step 7: Build and verify**

Run: `bundle exec jekyll build`
Expected: exit 0.

Run: `grep -c 'hero-greeting' _site/index.html && grep -c 'hero-name' _site/index.html`
Expected: both ≥ 1.

Run: `grep -c 'class="experience-item"' _site/index.html`
Expected: `4` (2 education + 2 experience).

- [ ] **Step 8: Commit**

```bash
git add _layouts/home.html _includes index.md _data img
git commit -m "feat: home page with hero and timeline sections

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

Grouping rule: an entry with `venue: "Preprint"` goes into **Manuscript**; every other entry must have `year` and is grouped by year descending.

```yaml
# Publications. Fields:
#   title    — string
#   authors  — list; the entry matching site.author (in _config.yml) is bolded
#   venue    — string; use exactly "Preprint" to place the entry under Manuscript
#   year     — integer, required for non-preprints
#   award    — optional string, shown as a badge next to the venue
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
    publication with an award badge.

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
      {% for t in pub.tags %}<span class="tag-chip">{{ t }}</span>{% endfor %}
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

(The Liquid in this card is exact — `{{ pub.award }}`, not `pub.away` — verified by the Step 5 grep for `pub-award`.)

- [ ] **Step 3: Write `publications.md`**

```markdown
---
layout: default
title: Publications
permalink: /publications/
---
<div class="page-container">
  <div class="page-label">Research</div>
  <h1 class="page-title">Publications</h1>

  {% assign topics = '' | split: '' %}
  {% for p in site.data.publications %}
    {% for t in p.tags %}
      {% assign topics = topics | push: t %}
    {% endfor %}
  {% endfor %}
  {% assign topics = topics | uniq | sort %}

  {% if topics != empty %}
  <div class="filter-bar">
    <button class="filter-pill active" data-tag="all">All</button>
    {% for t in topics %}
    <button class="filter-pill" data-tag="{{ t }}">{{ t }}</button>
    {% endfor %}
  </div>
  {% endif %}

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

  var pills = document.querySelectorAll('.filter-pill');
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

Run: `grep -c '>Manuscript<' _site/publications/index.html`
Expected: `1`.

Run: `grep -cE '>2025<|>2024<' _site/publications/index.html`
Expected: `2`.

Run: `grep -c 'pub-award' _site/publications/index.html`
Expected: `1` (award badge present and rendered; `0` means the award span is missing — check the `{% if pub.award %}` guard).

Run: `test $(grep -c '{{ pub' _site/publications/index.html) -eq 0 && echo LIQUID-OK`
Expected: `LIQUID-OK` (no unrendered Liquid leaked to HTML).

- [ ] **Step 6: Commit**

```bash
git add _data/publications.yml _includes/pub-card.html publications.md assets/js/publications.js
git commit -m "feat: publications page with topic filter and abstract toggles

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Blog — timeline list, post layout, sample posts

**Files:**
- Create: `_layouts/blog-list.html`
- Create: `_layouts/post.html`
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
  <div class="page-label">Blog</div>
  <h1 class="page-title">{{ page.title }}</h1>

  {% assign all_tags = '' | split: '' %}
  {% for post in site.posts %}
    {% for t in post.tags %}
      {% assign all_tags = all_tags | push: t %}
    {% endfor %}
  {% endfor %}
  {% assign all_tags = all_tags | uniq | sort %}

  {% if all_tags != empty %}
  <div class="filter-bar">
    <button class="filter-pill active" data-tag="all">All</button>
    {% for t in all_tags %}
    <button class="filter-pill" data-tag="{{ t }}">{{ t }}</button>
    {% endfor %}
  </div>
  {% endif %}

  <div class="timeline-list">
    {% for post in site.posts %}
    <div class="timeline-item blog-post-card" data-tags="{{ post.tags | join: ',' }}">
      <span class="timeline-index">{{ forloop.index | prepend: '00' | slice: -2, 2 }}</span>
      <div class="timeline-meta">
        <span>{{ post.date | date: '%b %-d, %Y' }}</span>
        {% if post.category %}<span>·</span><span>{{ post.category }}</span>{% endif %}
        {% assign words = post.content | strip_html | number_of_words %}
        {% assign minutes = words | divided_by: 200 | at_least: 1 %}
        <span>·</span><span>{{ minutes }} min read</span>
      </div>
      <a href="{{ post.url | relative_url }}">
        <h2 class="timeline-title {% if forloop.first %}timeline-title-large{% endif %}">{{ post.title }}</h2>
      </a>
    </div>
    {% endfor %}
  </div>
</div>
<script src="{{ '/assets/js/blog-filter.js' | relative_url }}"></script>
```

- [ ] **Step 2: Write `_layouts/post.html`**

```html
---
layout: default
---
<div class="post-container">
  <article class="post-article">
    <header class="post-header">
      <div class="page-label">{{ page.category | default: 'Writing' }}</div>
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

- [ ] **Step 3: Write `blog.md`**

```markdown
---
layout: blog-list
title: Blog
permalink: /blog/
---
```

- [ ] **Step 4: Write `assets/js/blog-filter.js`**

```javascript
document.addEventListener('DOMContentLoaded', function () {
  var pills = document.querySelectorAll('.filter-pill');
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

- [ ] **Step 5: Write `_posts/2026-10-20-hello-world.md`**

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

- [ ] **Step 6: Write `_posts/2026-10-24-code-blocks-example.md`**

````markdown
---
title: "Code Blocks Look Like This"
date: 2026-10-24 21:30:00 +08:00
tags: [demo, code]
category: technical
excerpt: "A placeholder post that exists only to demo headings, code blocks, tables, and blockquotes."
---

## A level-two heading

### Level three

Inline `code`, **bold**, *italic*, and [links](https://jekyllrb.com) behave as
expected.

```python
def greet(name: str) -> str:
    """Return a greeting with the given name."""
    return f"Hello, {name}!"


for i in range(3):
    print(greet(f"world #{i}"))
```

| Column A | Column B |
|----------|----------|
| 1        | 2        |

> Placeholder blockquote. Replace or delete this post before writing seriously.
````

- [ ] **Step 7: Build and verify**

Run: `bundle exec jekyll build`
Expected: exit 0.

Run: `grep -c 'class="timeline-item blog-post-card"' _site/blog/index.html`
Expected: `2`.

Run: `grep -c 'filter-pill' _site/blog/index.html`
Expected: `4` (All + demo + code + meta).

Run: `ls _site/blog/2026/10/20/hello-world/`
Expected: `index.html` exists.

Run: `grep -c 'highlight' _site/blog/2026/10/24/code-blocks-example/index.html`
Expected: ≥ 1 (python block highlighted).

Run: `grep -c 'Recent Writing' _site/index.html && grep -cE 'timeline-index' _site/index.html`
Expected: `1` and `2` (home shows exactly 2 posts, being all posts so far, in the timeline).

Run: `grep -oE '[0-9]+k</strong> words' _site/index.html`
Expected: a non-zero figure (e.g. `1k</strong> words`). If `0k`, apply the per-post `assign` fallback documented in Task 4 Step 1 and rebuild.

Run: `grep -c '<entry>' _site/feed.xml`
Expected: `2`.

- [ ] **Step 8: Commit**

```bash
git add _layouts/blog-list.html _layouts/post.html blog.md assets/js/blog-filter.js _posts
git commit -m "feat: blog with timeline list, tag filter, sample posts

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
  <div class="page-label">Building</div>
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
        {% for t in p.tags %}<span class="tag-chip">{{ t }}</span>{% endfor %}
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

Headings inside the container are raw HTML `<h2>` on purpose — kramdown does not process markdown inside an HTML block.

```markdown
---
layout: default
title: CV
permalink: /cv/
---
<div class="page-container">
  <div class="page-label">Curriculum</div>
  <h1 class="page-title">CV</h1>

  <p><a class="pub-link" href="{{ '/assets/cv.pdf' | relative_url }}">Download CV (PDF)</a>
  <em>(placeholder — drop your <code>cv.pdf</code> into <code>assets/</code>)</em></p>

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
  <div class="page-label">Lost</div>
  <h1 class="page-title">404</h1>
  <p>The page you are looking for does not exist or has been moved.</p>
  <p><a href="{{ '/' | relative_url }}">&larr; Back to Home</a></p>
</div>
```

- [ ] **Step 2: Write `README.md`**

````markdown
# JasonkayZK.github.io

English academic personal site (PhD-application oriented), built with a
hand-written Jekyll theme — visual language ported from innei.in's Yohaku —
and served by GitHub Pages from this branch (`save`). Old blog backup lives
in `__bak/` and is excluded from the build. The Chinese and Japanese archives
live at `/cn/` and `/jp/` (separate repos) and are linked from the nav.

## Run locally

```bash
bundle install        # first time only (see note below on macOS CLT)
bundle exec jekyll serve
# → http://127.0.0.1:4000
```

macOS note: if the `github-pages` gem's sassc native build fails with C++
header errors, export these before `bundle install`:

```bash
export CPLUS_INCLUDE_PATH="$(xcrun --show-sdk-path)/usr/include/c++/v1:$(xcrun --show-sdk-path)/usr/include"
```

## Editing content (no HTML involved)

| What | Where |
|---|---|
| Name, email, tagline, keywords, avatar, social links | `_config.yml` |
| Home hero stats (start year) | `_config.yml` → `site_since` |
| Home page text (research interests, news, contact) | `index.md` |
| Education / Experience rows | `_data/education.yml`, `_data/experience.yml` |
| Publications | `_data/publications.yml` |
| Projects | `_data/projects.yml` |
| Blog posts | `_posts/YYYY-MM-DD-title.md` |
| Avatar / institution logos | `img/photo.*`, `img/logos/` |
| CV PDF | drop `assets/cv.pdf`, link already points there |
| Colors / fonts / dark mode | `assets/css/style.scss` (CSS vars at top) |

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
it is grouped by year automatically. Filter pills are derived from `tags`.

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
Expected: `404.html  assets  blog  cv  feed.xml  img  index.html  projects  publications` (order irrelevant; no `__bak`, no `docs`, no `README.html`).

Run: `test ! -e _site/__bak && test ! -e _site/docs && test ! -e .github/workflows && echo CLEAN`
Expected: `CLEAN`.

Run: `grep -o '<title>[^<]*</title>' _site/index.html _site/publications/index.html _site/blog/index.html _site/cv/index.html _site/projects/index.html`
Expected: home is `Your Name`, the rest `X | Your Name`.

Run: `test -f _site/assets/js/theme.js && test -f _site/assets/js/blog-filter.js && test -f _site/assets/js/publications.js && test -f _site/assets/css/style.css && echo ASSETS-OK`
Expected: `ASSETS-OK`.

Run: `grep -c 'data-theme' _site/index.html`
Expected: ≥ 2 (inline switch script + html attribute usage).

- [ ] **Step 4: Visual smoke test with the dev server**

Run: `bundle exec jekyll serve` (background), then:

```bash
for p in / /publications/ /blog/ /blog/2026/10/20/hello-world/ /projects/ /cv/ /404.html /feed.xml; do
  curl -s -o /dev/null -w "%{http_code} $p\n" "http://127.0.0.1:4000$p"
done
```

Expected: every line `200`. Stop the server afterwards.

Interactive check for the user (or implementer with a headless browser if available): open http://127.0.0.1:4000 — warm paper background, rose accent, serif hero with glow, dark-mode toggle in nav works and persists across reloads, publications filter + abstract toggle work, blog tag filter works, mobile-width nav collapses to hamburger.

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
3. Wait for the Pages build; verify `https://jasonkayzk.github.io/` serves the new site.
4. Optional cleanup later: delete the `master` branch (old Hexo build archive) — ask the user first.
