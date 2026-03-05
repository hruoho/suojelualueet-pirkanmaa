# Retkikohteet Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Hugo static site for curated recreational nature spots in Pirkanmaa with a stylized map, visual card grid, and a Claude Code skill for content extraction.

**Architecture:** Hugo site with a custom theme, Leaflet map with nature-toned tiles, content as markdown files with structured front matter. GitHub Actions deploys to GitHub Pages. A Claude Code skill handles data extraction from known sources.

**Tech Stack:** Hugo (extended), Leaflet.js, vanilla CSS/JS, GitHub Actions, Claude Code skills

---

### Task 1: Hugo Site Scaffold

**Files:**
- Create: `hugo.toml`
- Create: `content/_index.md`
- Create: `content/kohteet/_index.md`
- Create: `content/kartta/_index.md`
- Create: `content/tietoa/_index.md`
- Create: `themes/retkikohteet/theme.toml`
- Create: `themes/retkikohteet/layouts/_default/baseof.html`

**Step 1: Initialize Hugo site structure**

```bash
cd /Users/hruoho/Projects/retkikohteet
```

Create `hugo.toml`:

```toml
baseURL = "https://example.github.io/retkikohteet/"
languageCode = "fi"
title = "Retkikohteet — Pirkanmaa"
theme = "retkikohteet"

[params]
  description = "Pirkanmaan retkikohteet yhdessä paikassa"
  region = "Pirkanmaa"

[markup.goldmark.renderer]
  unsafe = true
```

Create `content/_index.md`:

```markdown
---
title: "Retkikohteet"
---
```

Create `content/kohteet/_index.md`:

```markdown
---
title: "Kohteet"
---
```

Create `content/kartta/_index.md`:

```markdown
---
title: "Kartta"
layout: "kartta"
---
```

Create `content/tietoa/_index.md`:

```markdown
---
title: "Tietoa"
---
```

**Step 2: Create minimal theme skeleton**

Create `themes/retkikohteet/theme.toml`:

```toml
name = "Retkikohteet"
license = "MIT"
description = "Custom theme for retkikohteet.fi"
```

Create `themes/retkikohteet/layouts/_default/baseof.html`:

```html
<!DOCTYPE html>
<html lang="fi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ .Title }} — {{ .Site.Title }}</title>
  {{ $style := resources.Get "css/main.css" | minify }}
  <link rel="stylesheet" href="{{ $style.RelPermalink }}">
  {{ block "head" . }}{{ end }}
</head>
<body>
  <nav class="site-nav">
    <a href="{{ "/" | relURL }}" class="site-nav__home">Retkikohteet</a>
    <ul class="site-nav__links">
      <li><a href="{{ "/kartta/" | relURL }}">Kartta</a></li>
      <li><a href="{{ "/kohteet/" | relURL }}">Kohteet</a></li>
      <li><a href="{{ "/tietoa/" | relURL }}">Tietoa</a></li>
    </ul>
  </nav>
  <main>
    {{ block "main" . }}{{ end }}
  </main>
  <footer class="site-footer">
    <p>&copy; {{ now.Year }} Retkikohteet</p>
  </footer>
  {{ block "scripts" . }}{{ end }}
</body>
</html>
```

**Step 3: Verify Hugo builds**

Run: `hugo --minify`
Expected: Successful build with no errors.

**Step 4: Verify dev server**

Run: `hugo server` (check manually, then stop)
Expected: Site served at localhost:1313, shows blank page with nav.

**Step 5: Commit**

```bash
git add hugo.toml content/ themes/
git commit -m "feat: scaffold Hugo site with custom theme skeleton"
```

---

### Task 2: CSS Foundation & Typography

**Files:**
- Create: `themes/retkikohteet/assets/css/main.css`

**Step 1: Create the main stylesheet**

Implement the full visual foundation: palette, typography (Google Fonts: Lora + Source Sans 3), layout basics, nav styling, responsive base, paper grain background texture (CSS-only using a subtle gradient noise pattern).

Key design tokens:
- `--bg: #F5F0E8` (cream)
- `--text: #2C3527` (deep forest)
- `--gold: #C4933F` (golden hour accent)
- `--moss: #5B7A5E` (moss green)
- `--serif: 'Lora', serif`
- `--sans: 'Source Sans 3', sans-serif`

Include nav styling (minimal, horizontal), footer, responsive breakpoints, link styles (gold on hover).

**Step 2: Add Google Fonts to baseof.html**

Add `<link>` tags for Lora (400, 700) and Source Sans 3 (400, 600) in the `<head>` block.

**Step 3: Verify build and visual check**

Run: `hugo server`
Expected: Cream background, correct fonts rendering, nav visible and styled.

**Step 4: Commit**

```bash
git add themes/retkikohteet/assets/css/main.css themes/retkikohteet/layouts/
git commit -m "feat: add CSS foundation with palette, typography, and layout"
```

---

### Task 3: Sample Content — Two Test Places

**Files:**
- Create: `content/kohteet/seitseminen.md`
- Create: `content/kohteet/kintulammi.md`

**Step 1: Create two sample place files**

Use the full front matter schema from the design doc. Use real data from the PDF extraction we already have. Set `draft: false` so they render.

`content/kohteet/seitseminen.md`:

```yaml
---
title: "Seitseminen"
kunta: "Ylöjärvi"
koordinaatit: [61.9123, 23.3945]
pinta_ala_ha: 4550
kuvia: []
kartat:
  google_maps: "https://www.google.com/maps/place/Seitseminen+National+Park"
  paikkatietoikkuna: ""
  maastokartat_app: ""
vaellusreitit_km: 30
tulipaikkoja: 10
laavuja: 5
vuokratupia: ["Kortesalo", "Pitkäjärvi"]
lahde: "luontoon.fi"
lahde_url: "https://www.luontoon.fi/seitseminen"
tags: ["kansallispuisto", "vaellus"]
draft: false
---

Kymmeniä kilometrejä reittejä ja yli 10 tulipaikkaa.
Seitsemisen luontokeskus uudistunut — majoitusta, ruokaa ja aktiviteettejä.
```

`content/kohteet/kintulammi.md`:

```yaml
---
title: "Kintulammin retkeily- ja luonnonsuojelualue"
kunta: "Tampere"
koordinaatit: [61.5650, 23.8950]
pinta_ala_ha: 580
kuvia: []
kartat:
  google_maps: "https://www.google.com/maps/place/Kintulammi"
  paikkatietoikkuna: ""
  maastokartat_app: ""
vaellusreitit_km: 15
tulipaikkoja: 6
laavuja: 4
vuokratupia: ["Kintulammi", "Kortejärvi"]
lahde: "kintulammi.fi"
lahde_url: "https://www.kintulammi.fi"
tags: ["luonnonsuojelualue", "vaellus"]
draft: false
---

6 tulipaikkaa, 4 laavua ja 2 vuokratupaa.
Vattulan vanha metsä suojeltu vuonna 1959.
Suunnitteilla yhteysreittejä Pukala-Orivesi suuntaan.
```

**Step 2: Verify they appear in Hugo**

Run: `hugo list all`
Expected: Both places listed.

**Step 3: Commit**

```bash
git add content/kohteet/
git commit -m "feat: add sample content for Seitseminen and Kintulammi"
```

---

### Task 4: Place Page Template (Single)

**Files:**
- Create: `themes/retkikohteet/layouts/kohteet/single.html`

**Step 1: Create the single place template**

Template renders:
- Title (serif, large)
- Municipality badge
- Area size (ha) if available
- Photo gallery (from `kuvia` front matter, using Hugo image processing: resize, WebP). Show placeholder text if no photos.
- Description (markdown body)
- Facilities section: trail km, fire places, shelters, rental cabins — displayed as icon-like items
- Map links section: Google Maps, Paikkatietoikkuna, Maastokartat — as styled buttons/links
- Tags displayed as subtle labels
- Source attribution with link

Use `resources.GetMatch` for images from `assets/img/kohteet/<place>/`.

**Step 2: Add corresponding CSS**

Add styles for `.kohde-page`, `.kohde-gallery`, `.kohde-facilities`, `.kohde-maps`, `.kohde-tags` to `main.css`.

**Step 3: Verify with sample content**

Run: `hugo server`
Navigate to `/kohteet/seitseminen/`
Expected: Place page renders with all sections, placeholder for photos, facilities listed.

**Step 4: Commit**

```bash
git add themes/retkikohteet/layouts/kohteet/ themes/retkikohteet/assets/css/
git commit -m "feat: add place page template with facilities and map links"
```

---

### Task 5: Place List Template (Card Grid)

**Files:**
- Create: `themes/retkikohteet/layouts/kohteet/list.html`

**Step 1: Create the list template**

Renders all non-draft places as a responsive card grid. Each card shows:
- Thumbnail photo (or a colored placeholder with the first letter)
- Place name (serif)
- Municipality
- Area size if available
- First 1-2 tags

Cards link to the individual place page. Grid uses CSS Grid, responsive: 1 column on mobile, 2 on tablet, 3 on desktop.

**Step 2: Add card grid CSS**

Styles for `.kohteet-grid`, `.kohde-card`, card hover effects (subtle lift/shadow), responsive breakpoints.

**Step 3: Verify**

Run: `hugo server`
Navigate to `/kohteet/`
Expected: Two sample cards displayed in a grid, clickable.

**Step 4: Commit**

```bash
git add themes/retkikohteet/layouts/kohteet/ themes/retkikohteet/assets/css/
git commit -m "feat: add card grid template for place listing"
```

---

### Task 6: Map Page with Leaflet

**Files:**
- Create: `themes/retkikohteet/layouts/kartta/list.html`
- Create: `themes/retkikohteet/layouts/_default/kartta.html`
- Create: `themes/retkikohteet/assets/js/kartta.js`
- Create: `themes/retkikohteet/layouts/partials/places-geojson.html`

**Step 1: Generate GeoJSON at build time**

Create a Hugo partial `places-geojson.html` that iterates all pages in `kohteet` section and outputs a GeoJSON FeatureCollection as inline JSON. Each feature includes: name, municipality, URL, coordinates, area size.

**Step 2: Create the map layout**

`layouts/_default/kartta.html` extends baseof, adds:
- Leaflet CSS/JS from CDN in head block
- A full-viewport `<div id="map">` in main block
- Includes the GeoJSON partial as a `<script>` tag with the data
- Loads `kartta.js` in scripts block

**Step 3: Write kartta.js**

- Initialize Leaflet map centered on Pirkanmaa (~61.5, 23.8, zoom 9)
- Use a nature-toned tile layer. Start with OpenStreetMap standard; note in a comment that Stadia Outdoors or similar can be swapped in.
- Read the inline GeoJSON data
- Add markers with gold-colored circle markers (simple, no external icon needed to start)
- Each marker gets a popup with: place name (linked to place page), municipality, area size

**Step 4: Add map-specific CSS**

Styles for full-viewport map container, popup styling that matches the site palette.

**Step 5: Verify**

Run: `hugo server`
Navigate to `/kartta/`
Expected: Map loads centered on Pirkanmaa, two markers visible for Seitseminen and Kintulammi, popups work.

**Step 6: Commit**

```bash
git add themes/retkikohteet/layouts/ themes/retkikohteet/assets/js/ themes/retkikohteet/assets/css/
git commit -m "feat: add map page with Leaflet and build-time GeoJSON"
```

---

### Task 7: Landing Page

**Files:**
- Create: `themes/retkikohteet/layouts/index.html`

**Step 1: Create the home page template**

Extends baseof. Layout:
- Hero section: large background area with the site title overlaid in serif, a one-line tagline ("Pirkanmaan retkikohteet yhdessä paikassa"), and two call-to-action links: "Katso kartalta" → /kartta/, "Selaa kohteita" → /kohteet/
- For now, use a CSS gradient placeholder for the hero background (deep green to gold tones). Real hero photo can be added later.
- Below hero: a "Kohteita" section showing 3-4 featured place cards (reuse card partial from Task 5 — extract it into `partials/kohde-card.html` if not already done)

**Step 2: Add landing page CSS**

Hero section styling: full-viewport height on desktop, 60vh on mobile. Overlay text centered. CTA buttons styled with gold accent.

**Step 3: Verify**

Run: `hugo server`
Navigate to `/`
Expected: Hero with gradient, title, tagline, CTA buttons. Featured places section below.

**Step 4: Commit**

```bash
git add themes/retkikohteet/layouts/ themes/retkikohteet/assets/css/
git commit -m "feat: add landing page with hero and featured places"
```

---

### Task 8: About Page (Tietoa)

**Files:**
- Create: `themes/retkikohteet/layouts/tietoa/list.html`

**Step 1: Create the about page template**

Simple content page. Renders the markdown body from `content/tietoa/_index.md`.

**Step 2: Add content to tietoa/_index.md**

```markdown
---
title: "Tietoa"
---

## Mikä tämä on?

Retkikohteet kokoaa yhteen Pirkanmaan retkeilykohteiden tiedot,
jotka ovat tällä hetkellä hajallaan eri lähteissä.

## Lähteet

- [Luontoon.fi](https://www.luontoon.fi) — Metsähallituksen retkeilypalvelu
- [Pirkanmaan virkistysalueyhdistys](https://www.pivi.fi)
- [Luonnonperintösäätiö](https://luonnonperintosaatio.fi)
- Ekokumppanit Oy — Pirkanmaan retkeilyreitit (PDF, 2021)
```

**Step 3: Verify**

Run: `hugo server`
Navigate to `/tietoa/`
Expected: About page renders with content.

**Step 4: Commit**

```bash
git add themes/retkikohteet/layouts/tietoa/ content/tietoa/
git commit -m "feat: add about page with source attributions"
```

---

### Task 9: GitHub Actions Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: Create the workflow**

```yaml
name: Deploy Hugo to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: "latest"
          extended: true
      - name: Build
        run: hugo --minify
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Step 2: Verify build locally**

Run: `hugo --minify`
Expected: Clean build, output in `public/`.

**Step 3: Add public/ to .gitignore**

Create `.gitignore`:

```
public/
resources/_gen/
.hugo_build.lock
```

**Step 4: Commit**

```bash
git add .github/workflows/deploy.yml .gitignore
git commit -m "feat: add GitHub Actions workflow for Pages deployment"
```

---

### Task 10: Claude Code Skill — add-kohde

**Files:**
- Create: `.claude/skills/add-kohde.md`

**Step 1: Create the skill file**

The skill should:
- Accept a place name and optionally a municipality
- Define the exact front matter schema expected
- List the known Pirkanmaa sources to search (luontoon.fi, pivi.fi, luonnonperintosaatio.fi, etc.)
- Instruct Claude to fetch each relevant source, extract data, compile into the schema
- Write the file to `content/kohteet/<slug>.md` with `draft: true`
- Report what was found and what's missing

Skill content:

```markdown
---
name: add-kohde
description: Add a new recreational place by extracting data from known sources
---

## Purpose

Extract information about a recreational nature spot and create a Hugo content file.

## Input

The user provides:
- Place name (required)
- Municipality (optional, helps narrow search)

## Known Sources (Pirkanmaa)

Search these in order for information about the place:
1. https://www.luontoon.fi/<place-slug> — Metsahallitus
2. https://www.pirkanmaanvirkistysalueyhdistys.fi/virkistysalueet/ — PIVI areas
3. https://luonnonperintosaatio.fi/suojelualueet/pirkanmaa/ — Conservation areas
4. General web search for "<place name> retkeily pirkanmaa"

## Output Format

Create file: `content/kohteet/<slug>.md`

The slug should be the place name lowercased, spaces replaced with hyphens,
Finnish characters preserved (Hugo handles them).

Front matter schema:

\```yaml
---
title: "<Place Name>"
kunta: "<Municipality>"
koordinaatit: [<lat>, <lon>]
pinta_ala_ha: <number or null>
kuvia: []
kartat:
  google_maps: "<url>"
  paikkatietoikkuna: "<url or empty>"
  maastokartat_app: "<url or empty>"
vaellusreitit_km: <number or null>
tulipaikkoja: <number or null>
laavuja: <number or null>
vuokratupia: [<list or empty>]
lahde: "<source name>"
lahde_url: "<source url>"
tags: [<relevant tags>]
draft: true
---
\```

Body: Free-form description compiled from sources. Include notable features,
conditions, warnings, and any other useful information.

## After Writing

Report to the user:
- What was found and from which source
- What fields are missing or uncertain
- Suggest next steps (add photos, verify coordinates, set draft: false)

## Bulk Mode

If the user provides a source (URL or text) instead of a place name,
extract ALL places from that source and create individual files for each.
```

**Step 2: Verify skill is discoverable**

Run: Check that `.claude/skills/add-kohde.md` exists and is properly formatted.

**Step 3: Commit**

```bash
git add .claude/skills/add-kohde.md
git commit -m "feat: add Claude Code skill for extracting place data"
```

---

### Task 11: Final Integration Verification

**Step 1: Full build check**

Run: `hugo --minify`
Expected: Clean build, no warnings, all pages generated.

**Step 2: Visual walkthrough**

Run: `hugo server`

Check each page:
- `/` — Hero, CTA links, featured places
- `/kohteet/` — Card grid with 2 sample places
- `/kohteet/seitseminen/` — Full place page
- `/kohteet/kintulammi/` — Full place page
- `/kartta/` — Map with 2 markers, popups work
- `/tietoa/` — About page with sources

**Step 3: Mobile responsive check**

Resize browser or use dev tools mobile view. Verify:
- Nav collapses or remains usable
- Cards stack to single column
- Map is usable on mobile
- Place page is readable

**Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: integration fixes from final review"
```
