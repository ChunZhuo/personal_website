# Bilingual al-folio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add hand-written Chinese (`/zh/`) versions of every user-authored page and post on `chunzhuo.github.io`, with a navbar EN | 中文 switcher and localized theme strings, while leaving the existing English site visually identical.

**Architecture:** Use the `jekyll-polyglot` plugin to generate a per-language site at `/zh/` from pages tagged `lang: zh`. Theme UI strings (search hint, theme toggle, footer "last updated") live in `_data/strings/{en,zh}.yml` and are looked up via `site.data.strings[site.active_lang]`. The existing Google Translate widget in `_includes/header.liquid` is removed and replaced with a custom `_includes/lang_switcher.liquid`.

**Tech Stack:** Jekyll 4, jekyll-polyglot, Liquid templates, al-folio theme, Docker for local builds, GitHub Actions for deploy.

**Spec reference:** `docs/superpowers/specs/2026-05-08-bilingual-site-design.md`

---

## File Plan

**Create:**
- `_data/strings/en.yml` — English UI strings
- `_data/strings/zh.yml` — Chinese UI strings (English fallback values until user fills in)
- `_includes/lang_switcher.liquid` — EN | 中文 toggle
- `_pages/zh/about.md`, `_pages/zh/cv.md`, `_pages/zh/blog.md`, `_pages/zh/books.md`, `_pages/zh/news.md`, `_pages/zh/off-hours.md`, `_pages/zh/reports.md`, `_pages/zh/repositories.md`, `_pages/zh/404.md` — Chinese page stubs
- `_posts/zh/2026-05-07-multimodality-for-biology.md` — Chinese stub for the user's only real blog post

**Modify:**
- `Gemfile` — add `gem "jekyll-polyglot"`
- `Gemfile.lock` — refreshed by `bundle install`
- `_config.yml` — add polyglot keys, add polyglot to `plugins:` list
- `_includes/header.liquid` — remove Google Translate widget block, mount `lang_switcher.liquid`, swap hardcoded strings to dictionary lookups
- `_includes/footer.liquid` — swap "Last updated" string to dictionary lookup
- `_layouts/default.liquid` — set `<html lang="{{ site.active_lang }}">`; assign `t = site.data.strings[site.active_lang]` once at top so all sub-includes can use `t.*`
- All existing files in `_pages/*.md` (9 files) — add `lang: en` to front matter
- All existing files in `_posts/*.md` (~32 files) — add `lang: en` to front matter

**Excluded from changes:**
- Demo posts get `lang: en` but no Chinese version (per user decision).
- Bibliography (`_bibliography/papers.bib`) and search index — left English-only in Phase 1.

## Test strategy

This is a Jekyll site, so "test" means: rebuild via Docker, open the site in a browser, and verify the expected URL renders the expected content. Each task ends with an explicit build + visual-check step before commit.

The Docker build command is `docker compose up --build` (per `AGENTS.md`); the site is at `http://localhost:8080`. If the user prefers `bundle exec jekyll serve` directly, that also works. The verification steps below are written for Docker.

If `docker compose` is not available in the executing environment, use `bundle exec jekyll build` to verify build success without a server.

---

## Task 1: Pre-flight build check

**Files:** none modified

**Why:** Establish a known-good baseline before adding any moving parts. If the site doesn't build cleanly today, we need to know that before changing things.

- [ ] **Step 1: Build current site**

```bash
cd /c/Users/Joe/personal_website
docker compose up --build
```

Expected: site comes up at `http://localhost:8080` with no build errors. Visit `/` and confirm the about page renders. `Ctrl+C` to stop after verifying.

If `docker compose` is unavailable, run instead:

```bash
bundle exec jekyll build
```

Expected: exits 0 with no errors.

- [ ] **Step 2: Note baseline build time and any warnings**

Record the build time from the output. Future builds should be in the same ballpark. If there are warnings, note them — they're pre-existing and not our concern.

- [ ] **Step 3: No commit (no changes)**

---

## Task 2: Add jekyll-polyglot to Gemfile

**Files:**
- Modify: `Gemfile`
- Modify (auto): `Gemfile.lock`

- [ ] **Step 1: Edit `Gemfile` — add `jekyll-polyglot` to the `:jekyll_plugins` group**

Open `Gemfile`. Add `gem 'jekyll-polyglot'` inside the existing `group :jekyll_plugins do ... end` block, sorted alphabetically with the others. After the change, the relevant block looks like:

```ruby
group :jekyll_plugins do
    gem 'jekyll-3rd-party-libraries'
    gem 'jekyll-archives-v2'
    gem 'jekyll-cache-bust'
    gem 'jekyll-email-protect'
    gem 'jekyll-feed'
    gem 'jekyll-get-json'
    gem 'jekyll-imagemagick'
    gem 'jekyll-jupyter-notebook'
    gem 'jekyll-link-attributes'
    gem 'jekyll-minifier'
    gem 'jekyll-paginate-v2'
    gem 'jekyll-polyglot'
    gem 'jekyll-regex-replace'
    gem 'jekyll-scholar'
    gem 'jekyll-sitemap'
    gem 'jekyll-socials'
    gem 'jekyll-tabs'
    gem 'jekyll-terser', :git => "https://github.com/RobertoJBeltran/jekyll-terser.git"
    gem 'jekyll-toc'
    gem 'jekyll-twitter-plugin'
    gem 'jemoji'

    gem 'classifier-reborn'  # used for content categorization during the build
end
```

- [ ] **Step 2: Refresh `Gemfile.lock`**

```bash
bundle install
```

Expected: bundler resolves and installs `jekyll-polyglot`. `Gemfile.lock` is updated. No errors.

If bundler is not available locally, the Docker build in Step 3 will run `bundle install` inside the container; in that case, `Gemfile.lock` is regenerated by Docker.

- [ ] **Step 3: Verify build still works**

```bash
docker compose up --build
```

Expected: build succeeds. Site at `http://localhost:8080` is unchanged (polyglot is loaded but not yet configured, so behavior is identical). `Ctrl+C` after verifying.

- [ ] **Step 4: Commit**

```bash
git add Gemfile Gemfile.lock
git commit -m "Add jekyll-polyglot gem for bilingual site support"
```

---

## Task 3: Configure polyglot in `_config.yml`

**Files:**
- Modify: `_config.yml`

- [ ] **Step 1: Add polyglot configuration**

Find the `# Plug-ins` section in `_config.yml` (around line 209). Inside the `plugins:` list, add `jekyll-polyglot` (alphabetical order, between `jekyll-paginate-v2` and `jekyll-regex-replace`):

```yaml
plugins:
  - jekyll-3rd-party-libraries
  - jekyll-archives-v2
  - jekyll-cache-bust
  - jekyll-email-protect
  - jekyll-feed
  # ... existing entries ...
  - jekyll-paginate-v2
  - jekyll-polyglot
  - jekyll-regex-replace
  # ... rest unchanged ...
```

Then, immediately above the `plugins:` block, add a new polyglot config block:

```yaml
# -----------------------------------------------------------------------------
# Polyglot (multilingual) settings
# -----------------------------------------------------------------------------

languages: ["en", "zh"]
default_lang: "en"
exclude_from_localization: ["assets", "robots.txt", "sitemap.xml", "_bibliography"]
parallel_localization: true
```

- [ ] **Step 2: Verify build**

```bash
docker compose up --build
```

Expected: build succeeds. Polyglot is now active but no pages are tagged `lang: zh` yet, so `/zh/` will not exist. Visit `/` — the English site should still render exactly as before.

In the build log you should see polyglot-related output like `Building site for default language: "en" to: ...`. If the build fails because polyglot can't find a per-language entry, that's expected — we'll add `lang:` tags in the next task.

- [ ] **Step 3: Commit**

```bash
git add _config.yml
git commit -m "Configure jekyll-polyglot with en (default) and zh languages"
```

---

## Task 4: Tag every existing page with `lang: en`

**Files:**
- Modify: every `_pages/*.md` file (9 files total)

**Why:** Polyglot uses the `lang:` front-matter key to assign each page to a language site. With `default_lang: en`, untagged pages default to English, but explicit tagging is clearer and protects against accidental mis-classification when we later add Chinese files.

- [ ] **Step 1: List the files to modify**

```bash
ls _pages/*.md
```

Expected output: `404.md  about.md  blog.md  books.md  cv.md  news.md  off-hours.md  reports.md  repositories.md`

- [ ] **Step 2: Add `lang: en` to each file's front matter**

For each file, open it and add `lang: en` as a new line directly under the opening `---` line. Example for `_pages/about.md`:

Before:
```yaml
---
layout: about
title: about
permalink: /
subtitle: AI4Bio · bioinformatics · machine learning.
```

After:
```yaml
---
layout: about
title: about
lang: en
permalink: /
subtitle: AI4Bio · bioinformatics · machine learning.
```

Repeat the same single-line addition (`lang: en` on a new line, right after `---`) for: `404.md`, `blog.md`, `books.md`, `cv.md`, `news.md`, `off-hours.md`, `reports.md`, `repositories.md`.

- [ ] **Step 3: Verify build and English site is identical**

```bash
docker compose up --build
```

Expected: build succeeds. Visit `/`, `/blog/`, `/cv/` — pages render exactly as before. `/zh/` still does not exist (no Chinese pages yet).

- [ ] **Step 4: Commit**

```bash
git add _pages/
git commit -m "Tag all _pages/ entries as lang: en for polyglot"
```

---

## Task 5: Tag every existing post with `lang: en`

**Files:**
- Modify: every `_posts/*.md` file (~32 files)

- [ ] **Step 1: List the files**

```bash
ls _posts/*.md | wc -l
```

Record the count. Each file must end up with `lang: en` in its front matter.

- [ ] **Step 2: Add `lang: en` to each post**

For every file in `_posts/*.md`, open it and add `lang: en` as a new line directly under the opening `---` line, before the existing front-matter keys. Example:

Before:
```yaml
---
layout: post
title: a post with formatting and links
date: 2015-03-15 16:40:16
description: ...
```

After:
```yaml
---
layout: post
lang: en
title: a post with formatting and links
date: 2015-03-15 16:40:16
description: ...
```

This applies to **all** posts including the al-folio template demo posts. The user-authored post `_posts/2026-05-07-multimodality-for-biology.md` is included.

- [ ] **Step 3: Verify build**

```bash
docker compose up --build
```

Expected: build succeeds. Visit `/blog/` and confirm all posts still appear in the listing. Visit a few individual posts (e.g., `/blog/2026/multimodality-for-biology/`) and confirm they render.

- [ ] **Step 4: Commit**

```bash
git add _posts/
git commit -m "Tag all _posts/ entries as lang: en for polyglot"
```

---

## Task 6: Create `_data/strings/en.yml` and `_data/strings/zh.yml`

**Files:**
- Create: `_data/strings/en.yml`
- Create: `_data/strings/zh.yml`

**Why:** Theme UI strings (search hint, theme toggle tooltip, "Last updated:" label, etc.) live outside any single page's body and aren't picked up by polyglot's per-page filtering. A `_data/strings/<lang>.yml` dictionary lets layouts emit the right string per active language.

- [ ] **Step 1: Create the directory**

```bash
mkdir -p _data/strings
```

- [ ] **Step 2: Write `_data/strings/en.yml`**

```yaml
# English UI strings used across layouts and includes.
# Looked up via {% assign t = site.data.strings[site.active_lang] %} then {{ t.<key> }}.

nav:
  toggle: "Toggle navigation"
  search_hint: "ctrl k"
  search_title: "Search"
  translate_title: "Translate"
  theme_title: "Change theme"

footer:
  last_updated: "Last updated"

search:
  placeholder: "Search..."
  no_results: "No results found."

post:
  next: "Next post"
  previous: "Previous post"
  read_more: "Read more"
  reading_time: "min read"
  tags: "Tags"
```

- [ ] **Step 3: Write `_data/strings/zh.yml`**

`zh.yml` ships with the **same keys** but English values as a fallback. The user fills in Chinese values in Phase 2; until then, the Chinese site shows English UI chrome rather than blanks (which would render as empty strings and break layout).

```yaml
# Chinese UI strings. English values are placeholder fallbacks.
# Replace each value with its Chinese translation when ready.

nav:
  toggle: "Toggle navigation"        # TODO 翻译: e.g. "切换导航"
  search_hint: "ctrl k"              # TODO 翻译: keep as "ctrl k" or translate hint
  search_title: "Search"             # TODO 翻译: e.g. "搜索"
  translate_title: "Translate"       # TODO 翻译: e.g. "翻译"
  theme_title: "Change theme"        # TODO 翻译: e.g. "切换主题"

footer:
  last_updated: "Last updated"       # TODO 翻译: e.g. "最近更新"

search:
  placeholder: "Search..."           # TODO 翻译: e.g. "搜索..."
  no_results: "No results found."    # TODO 翻译: e.g. "未找到结果。"

post:
  next: "Next post"                  # TODO 翻译: e.g. "下一篇"
  previous: "Previous post"          # TODO 翻译: e.g. "上一篇"
  read_more: "Read more"             # TODO 翻译: e.g. "阅读全文"
  reading_time: "min read"           # TODO 翻译: e.g. "分钟阅读"
  tags: "Tags"                       # TODO 翻译: e.g. "标签"
```

- [ ] **Step 4: Verify build**

```bash
docker compose up --build
```

Expected: build succeeds. No visible change yet (strings dictionary is created but no layout reads it).

- [ ] **Step 5: Commit**

```bash
git add _data/strings/
git commit -m "Add _data/strings/{en,zh}.yml dictionary for theme UI strings"
```

---

## Task 7: Create `_includes/lang_switcher.liquid`

**Files:**
- Create: `_includes/lang_switcher.liquid`

**Why:** Visitors need a one-click way to flip between EN and 中文. The switcher links to the equivalent URL in the other language — i.e., on `/cv/` it links to `/zh/cv/`, and on `/zh/cv/` it links back to `/cv/`.

- [ ] **Step 1: Write the include**

```liquid
{%- comment -%}
  Language switcher: emits "EN | 中文" with the active language bolded.
  For each non-active language, links to the equivalent URL.
  Strips the "/zh" prefix from the current URL to compute the English path,
  then re-prefixes for the target language (or leaves it bare for default_lang).
{%- endcomment -%}

{%- assign current_path = page.url | remove_first: '/zh' -%}
{%- if current_path == '' -%}{%- assign current_path = '/' -%}{%- endif -%}

<span class="lang-switcher" style="margin-left: 0.5rem; white-space: nowrap;">
  {%- for lang in site.languages -%}
    {%- if lang == site.active_lang -%}
      <strong style="color: var(--global-theme-color, inherit);">
        {%- if lang == 'zh' -%}中文{%- else -%}{{ lang | upcase }}{%- endif -%}
      </strong>
    {%- else -%}
      {%- if lang == site.default_lang -%}
        <a href="{{ current_path | relative_url }}">EN</a>
      {%- else -%}
        <a href="{{ '/' | append: lang | append: current_path | relative_url }}">
          {%- if lang == 'zh' -%}中文{%- else -%}{{ lang | upcase }}{%- endif -%}
        </a>
      {%- endif -%}
    {%- endif -%}
    {%- unless forloop.last -%} <span style="opacity: 0.5;">|</span> {%- endunless -%}
  {%- endfor -%}
</span>
```

- [ ] **Step 2: Verify the file is parseable**

```bash
docker compose up --build
```

Expected: build succeeds. The include exists but isn't mounted yet, so no visual change. Build success confirms the Liquid syntax is valid.

- [ ] **Step 3: Commit**

```bash
git add _includes/lang_switcher.liquid
git commit -m "Add _includes/lang_switcher.liquid for EN | 中文 toggle"
```

---

## Task 8: Replace Google Translate widget with the language switcher

**Files:**
- Modify: `_includes/header.liquid` (lines 128–188)

**Why:** The existing Google Translate widget was a stopgap. With polyglot generating real Chinese pages, the widget is redundant and would confuse visitors (clicking it on `/zh/about` would translate already-Chinese content). Replace the widget block + its associated `<style>` and `<script>` blocks with a single include of `lang_switcher.liquid`.

- [ ] **Step 1: Open `_includes/header.liquid` and locate the widget block**

Lines 128–131 (the navbar `<li>`):

```liquid
          <!-- Google Translate -->
          <li class="nav-item d-flex align-items-center" id="translate-nav-item" title="Translate">
            <div id="google_translate_element"></div>
          </li>
```

Lines 156–188 (the `<style>` and `<script>` blocks below the `</header>`):

```liquid
<!-- Google Translate widget styling and loader -->
<style>
  #google_translate_element { display: inline-block; padding: 0 0.5rem; }
  ... (all the GT-specific CSS) ...
</style>
<script>
  function googleTranslateElementInit() {
    new google.translate.TranslateElement({...}, 'google_translate_element');
  }
</script>
<script src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" defer></script>
```

- [ ] **Step 2: Replace the navbar `<li>` with the language switcher include**

Replace lines 128–131 with:

```liquid
          <!-- Language switcher -->
          <li class="nav-item d-flex align-items-center" id="lang-switcher-nav-item">
            {% include lang_switcher.liquid %}
          </li>
```

- [ ] **Step 3: Delete the entire Google Translate `<style>` and `<script>` block (lines 156–188 of the original file)**

After removal, the file should end at line 154 with `</header>` and have nothing more. (Confirm by reading the file end: no `<style>` block, no `<script src="https://translate.google.com/...">`.)

- [ ] **Step 4: Verify build and that the new switcher renders**

```bash
docker compose up --build
```

Visit `/`. Expected: the navbar shows `EN | 中文` where the Google Translate dropdown used to be. `EN` is bold (active), `中文` is a clickable link.

Click `中文`. Expected: navigates to `/zh/`. The page will 404 currently — that's expected, we haven't created `/zh/about.md` yet. We'll fix this in Task 10.

- [ ] **Step 5: Commit**

```bash
git add _includes/header.liquid
git commit -m "Replace Google Translate widget with lang_switcher in navbar"
```

---

## Task 9: Wire `t = site.data.strings[site.active_lang]` into layouts and localize a starter set of strings

**Files:**
- Modify: `_layouts/default.liquid`
- Modify: `_includes/header.liquid`
- Modify: `_includes/footer.liquid`

**Why:** Strings dictionary is useless until layouts read it. We assign `t` once at the top of `default.liquid` so all sub-includes can use `{{ t.<key> }}`. Then we replace the highest-value hardcoded strings (search hint, theme toggle, last-updated) with dictionary lookups. This is a starter set — more strings can be migrated in follow-up passes.

- [ ] **Step 1: Read current `_layouts/default.liquid`**

```bash
head -20 _layouts/default.liquid
```

Note the structure. We need to find a place near the top (after `---` front-matter, before the first content) to add the `assign` statement. Typically the top of a Jekyll layout starts with `<!DOCTYPE html>` or a `{% include %}` for `<head>`.

- [ ] **Step 2: Add the `t` assign and language-aware `<html>` tag to `_layouts/default.liquid`**

Current lines 1–2 of `_layouts/default.liquid`:

```liquid
<!doctype html>
<html lang="{{ site.lang }}">
```

Replace those exact two lines with:

```liquid
{%- assign t = site.data.strings[site.active_lang] -%}
<!doctype html>
<html lang="{{ site.active_lang | default: site.lang }}">
```

The rest of the file is unchanged. The `assign t` runs once per render and is in scope for all included files (header, footer, etc.) because Liquid scopes are inherited by `{% include %}`. The `<html lang>` attribute now reflects the active polyglot language (`en` or `zh`) instead of the static site-level `lang: en`.

- [ ] **Step 3: In `_includes/header.liquid`, swap hardcoded strings to dictionary lookups**

Find these literals and replace:

| Line(s) | Before | After |
|---|---|---|
| `<span class="sr-only">Toggle navigation</span>` | hardcoded | `<span class="sr-only">{{ t.nav.toggle }}</span>` |
| `<button id="search-toggle" title="Search" ...>` | `title="Search"` | `title="{{ t.nav.search_title }}"` |
| `<span class="nav-link">ctrl k <i class="fa-solid fa-magnifying-glass"></i></span>` | hardcoded `ctrl k` | `<span class="nav-link">{{ t.nav.search_hint }} <i class="fa-solid fa-magnifying-glass"></i></span>` |
| `<button id="light-toggle" title="Change theme">` | `title="Change theme"` | `title="{{ t.nav.theme_title }}"` |

Note: `header.liquid` is included by `default.liquid` which has already done the `assign t = ...` — so `t` is in scope here. No re-assign needed.

- [ ] **Step 4: In `_includes/footer.liquid`, swap "Last updated" to dictionary lookup**

```liquid
{% if site.last_updated %}
  {{ t.footer.last_updated }}: {{ 'now' | date: '%B %d, %Y' }}.
{% endif %}
```

- [ ] **Step 5: Verify build and visual check on English site**

```bash
docker compose up --build
```

Visit `/`. Expected: site looks identical to before. Hover over the search button — tooltip says "Search". Hover over theme toggle — tooltip says "Change theme". Footer shows "Last updated: ..." (if `site.last_updated` is true). No visual regressions.

- [ ] **Step 6: Commit**

```bash
git add _layouts/default.liquid _includes/header.liquid _includes/footer.liquid
git commit -m "Wire site.data.strings dictionary into layouts; localize starter strings"
```

---

## Task 10: Create Chinese page stubs for every real `_pages/` entry

**Files:**
- Create: `_pages/zh/about.md`, `_pages/zh/cv.md`, `_pages/zh/blog.md`, `_pages/zh/books.md`, `_pages/zh/news.md`, `_pages/zh/off-hours.md`, `_pages/zh/reports.md`, `_pages/zh/repositories.md`, `_pages/zh/404.md`

**Why:** With these stubs in place, `/zh/...` URLs become reachable and the language switcher's `中文` link goes somewhere. Bodies are placeholder; the user fills them in during Phase 2.

**Important:** the Chinese stubs **must mirror the English page's `permalink:`** so polyglot maps them correctly. polyglot prefixes `/zh/` automatically when `lang: zh` is set, so use the SAME `permalink` value as the English page.

- [ ] **Step 1: Create `mkdir -p _pages/zh`**

```bash
mkdir -p _pages/zh
```

- [ ] **Step 2: Create `_pages/zh/about.md`**

Source the English `_pages/about.md`'s front matter and adjust. The English version's `permalink: /` becomes the Chinese version's `permalink: /` too (polyglot prepends `/zh/`):

```markdown
---
layout: about
title: 关于
lang: zh
permalink: /
subtitle: AI4Bio · 生物信息学 · 机器学习。

profile:
  align: right
  image: selfie.jpg
  image_circular: false
  more_info:

selected_papers: false
social: true

announcements:
  enabled: false
  scrollable: true
  limit: 5

latest_posts:
  enabled: false
  scrollable: true
  limit: 3
---

<!-- TODO 翻译: 用中文写一段关于自己的介绍 -->

我是张淳卓 (Chunzhuo Zhang)。**(此页面待翻译)**
```

- [ ] **Step 3: Create the remaining 8 stubs**

For each of `cv.md`, `blog.md`, `books.md`, `news.md`, `off-hours.md`, `reports.md`, `repositories.md`, `404.md`:

1. Read the English version's front matter from `_pages/<name>.md`.
2. Copy the front matter to `_pages/zh/<name>.md`, preserving `layout:`, `permalink:`, `nav:`, `nav_order:`, and any layout-specific fields like `display_categories:` or `pretty_table:`.
3. Change `lang: en` → `lang: zh`.
4. Change `title:` to its Chinese equivalent. Suggested mapping:
   - `cv` → `简历`
   - `blog` → `博客`
   - `books` → `书籍`
   - `news` → `新闻`
   - `off-hours` → `生活`
   - `reports` → `报告`
   - `repositories` → `仓库`
   - `404` → `404`
5. Set the body to a one-line TODO placeholder: `<!-- TODO 翻译: <english title> 页面 -->`

Example for `_pages/zh/cv.md`:

```markdown
---
layout: cv
permalink: /cv/
title: 简历
lang: zh
nav: true
nav_order: 5
cv_pdf: chunzhuo_zhang_cv.pdf
description: 简历
toc:
  sidebar: left
---

<!-- TODO 翻译: 简历页面 -->
```

(Match each file's actual front-matter — read the English source first to get the exact fields.)

- [ ] **Step 4: Verify build and visit the Chinese site**

```bash
docker compose up --build
```

Visit `/zh/`. Expected: a near-empty page rendered through the `about` layout, navbar shows Chinese page titles (`关于 / 简历 / 博客 / ...`), language switcher shows `EN | 中文` with `中文` bold. Click `EN` — should return to `/`.

Visit `/zh/cv/`. Expected: empty CV page (placeholder body), Chinese nav, switcher works.

If a stub page fails to build (e.g., its English version uses a layout-specific field we missed), fix the front matter and rebuild.

- [ ] **Step 5: Commit**

```bash
git add _pages/zh/
git commit -m "Add Chinese page stubs for all real pages (placeholders, lang: zh)"
```

---

## Task 11: Create the Chinese stub for the user's blog post

**Files:**
- Create: `_posts/zh/2026-05-07-multimodality-for-biology.md`

**Why:** The user's only real blog post needs a Chinese counterpart so it appears at `/zh/blog/2026/multimodality-for-biology/` and shows up on the `/zh/blog/` listing. Demo posts get NO Chinese version (per spec).

- [ ] **Step 1: Create `_posts/zh/`**

```bash
mkdir -p _posts/zh
```

- [ ] **Step 2: Read the English post's front matter**

```bash
head -30 _posts/2026-05-07-multimodality-for-biology.md
```

Note the front-matter fields: `layout`, `title`, `date`, `description`, `tags`, `categories`, etc.

- [ ] **Step 3: Write `_posts/zh/2026-05-07-multimodality-for-biology.md`**

Copy the English front matter, change `lang: en` → `lang: zh`, translate `title:` and `description:` to Chinese (or leave as TODO placeholders for the user). Set body to a TODO comment. Example:

```markdown
---
layout: post
lang: zh
title: 生物学中的多模态融合
date: 2026-05-07
description: <!-- TODO 翻译 -->
tags: multimodality biology
categories: research
---

<!-- TODO 翻译: 用中文写这篇博客 -->

(此文章待翻译)
```

Preserve the same `tags` and `categories` values as the English version so archive pages group them correctly per language.

- [ ] **Step 4: Verify build**

```bash
docker compose up --build
```

Visit `/zh/blog/`. Expected: the listing shows the one Chinese post stub.

Visit `/zh/blog/2026/multimodality-for-biology/` (or whatever URL polyglot generates — check the build output for the actual permalink). Expected: stub renders.

- [ ] **Step 5: Commit**

```bash
git add _posts/zh/
git commit -m "Add Chinese stub for multimodality-for-biology post"
```

---

## Task 12: End-to-end verification

**Files:** none modified

- [ ] **Step 1: Full rebuild from scratch**

```bash
docker compose down
docker compose up --build
```

Expected: clean build, no errors.

- [ ] **Step 2: Visit each English URL and confirm no regression**

Open in browser and visually verify:
- `/` — about page, English content, EN bold in switcher
- `/cv/` — CV page renders, CV PDF link works
- `/blog/` — full blog post listing including all demo posts and the multimodality post
- `/blog/2026/multimodality-for-biology/` — full English content
- `/off-hours/` — hero image and intro render
- `/books/`, `/news/`, `/reports/`, `/repositories/` — render

- [ ] **Step 3: Visit each Chinese URL**

- `/zh/` — about layout, Chinese title, placeholder body, 中文 bold in switcher
- `/zh/cv/` — CV layout, placeholder body
- `/zh/blog/` — listing shows only the one Chinese post stub
- `/zh/blog/2026/multimodality-for-biology/` — Chinese stub renders
- `/zh/off-hours/`, `/zh/books/`, `/zh/news/`, `/zh/reports/`, `/zh/repositories/` — placeholders render

- [ ] **Step 4: Test the language switcher round-trip**

From `/`, click `中文` → lands on `/zh/`.
From `/zh/`, click `EN` → lands on `/`.
From `/cv/`, click `中文` → lands on `/zh/cv/`.
From `/zh/cv/`, click `EN` → lands on `/cv/`.

If any of these go to the wrong URL, the bug is in `_includes/lang_switcher.liquid` — the most likely cause is the `current_path` computation when the URL has trailing slashes vs not. Fix and re-verify.

- [ ] **Step 5: Verify search still works on English site**

Press `Ctrl+K` (or click the search icon) on `/`. Expected: search modal opens, searches across English content, results link to English pages. (Search is intentionally English-only in Phase 1.)

- [ ] **Step 6: No commit — verification only**

If everything passes, the implementation is done. If any step fails, fix the underlying issue, re-verify, and commit the fix as a separate "fix:" commit.

---

## Task 13: Document handoff to user

**Files:**
- Create: `docs/superpowers/specs/2026-05-08-bilingual-site-handoff.md` (a short handoff note for the user)

- [ ] **Step 1: Write the handoff note**

```markdown
# Bilingual site — Phase 2 handoff

Phase 1 (scaffolding) is complete. The site builds and `/zh/` is live with placeholder content. To finish the Chinese site:

## What you need to do

### 1. Translate page bodies

Open each file under `_pages/zh/` and replace the `<!-- TODO 翻译 -->` placeholder + the placeholder line with real Chinese content. Files to edit:

- `_pages/zh/about.md` — homepage (highest priority)
- `_pages/zh/cv.md`
- `_pages/zh/blog.md`
- `_pages/zh/books.md`
- `_pages/zh/news.md`
- `_pages/zh/off-hours.md`
- `_pages/zh/reports.md`
- `_pages/zh/repositories.md`
- `_pages/zh/404.md`

The front matter is already correct — only edit content below the second `---`.

### 2. Translate your blog post

`_posts/zh/2026-05-07-multimodality-for-biology.md` — translate title, description, body.

### 3. Translate UI strings

Open `_data/strings/zh.yml`. Each line has a `# TODO 翻译:` comment with a suggested Chinese translation. Replace each English value with the Chinese equivalent. Example:

```yaml
nav:
  toggle: "切换导航"        # was: "Toggle navigation"
  search_hint: "ctrl k"
  search_title: "搜索"      # was: "Search"
```

### 4. Verify

After each batch of edits, run `docker compose up --build` and visit `/zh/` to confirm.

## What was deliberately left out (Phase 3 candidates)

- **Search** is English-only. Searching on `/zh/` returns English results.
- **Bibliography** (`_bibliography/papers.bib`) is not localized.
- **Hardcoded strings in deeper layouts** (e.g., `_layouts/post.liquid` next/previous, `_includes/pagination.liquid`) are not yet in the strings dictionary. As you notice English text leaking onto Chinese pages, add the key to `_data/strings/{en,zh}.yml` and a `{{ t.<key> }}` lookup in the relevant layout file.
- **Demo posts** (`_posts/2015-*` through `_posts/2025-*`) have no Chinese versions — by design.
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-05-08-bilingual-site-handoff.md
git commit -m "Add Phase 2 handoff note for bilingual site translation"
```

---

## Final Checklist

- [ ] All 12 implementation tasks complete (Task 13 is handoff doc).
- [ ] English site renders identically to pre-implementation.
- [ ] Chinese site at `/zh/` renders with placeholders.
- [ ] Language switcher in navbar works in both directions.
- [ ] No build errors.
- [ ] All commits made on `main` (or feature branch if user prefers).

When the user is ready, push to GitHub: `git push origin main`. GitHub Actions will deploy. Verify the live site at `https://chunzhuo.github.io/` (English) and `https://chunzhuo.github.io/zh/` (Chinese).
