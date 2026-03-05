# Retkikohteet — Design Document

## Purpose

A static website that gathers scattered information about recreational nature spots in Pirkanmaa into one curated, aesthetically pleasing resource. Supports two use cases: discovering new places via a map/visual browse, and quickly finding details of a known place.

## Decisions

- **Tech stack:** Hugo + GitHub Pages
- **Approach:** Pure Hugo with Leaflet/MapLibre for the map, vanilla JS where needed
- **Language:** Finnish only
- **Scope:** Pirkanmaa to start, architecture supports expanding to other regions
- **Content workflow:** Claude Code skill for data extraction from known sources, manual curation
- **Responsive:** Equal priority for mobile and desktop

## Content Model

Each place is a markdown file in `content/kohteet/` with structured front matter:

```yaml
---
title: "Seitseminen"
kunta: "Ylöjärvi"
koordinaatit: [61.9123, 23.3945]
pinta_ala_ha: 45
kuvia:
  - src: "seitseminen-01.jpg"
    alt: "Näkymä Multiharjulta"
kartat:
  google_maps: "https://maps.google.com/..."
  paikkatietoikkuna: "https://paikkatietoikkuna.fi/..."
  maastokartat_app: "maastokartat://..."
vaellusreitit_km: 30
tulipaikkoja: 10
laavuja: 5
vuokratupia: ["Kortesalo", "Pitkäjärvi"]
lahde: "luontoon.fi"
lahde_url: "https://www.luontoon.fi/seitseminen"
tags: ["kansallispuisto", "vaellus", "melonta"]
draft: true
---

Free-form description and notes.
```

Images stored in `assets/img/kohteet/<place-name>/` to leverage Hugo's image processing pipeline (resizing, WebP conversion).

## Site Structure

```
/                     — Landing page: atmospheric hero, intro, links to map + featured places
/kartta/              — Full-page stylized map, markers with popups (name, thumbnail, link)
/kohteet/             — Card grid of all places, visual-first, filterable by tags/municipality
/kohteet/<place>/     — Individual place page: photos, details, map links, facilities
/tietoa/              — About page: purpose, sources, contact
```

Navigation: three items — Kartta, Kohteet, Tietoa.

## Visual Design

### Palette — light, airy, parchment-inspired

- Background: warm off-white / cream (#F5F0E8 range)
- Text: deep forest dark (#2C3527)
- Accents: muted gold / golden hour (#C4933F), moss green (#5B7A5E)
- Links/interactive: darker gold on hover
- Borders/dividers: subtle, thin earthy lines

### Typography

- Headings: serif with character (Lora, Playfair Display) — warm, literary feel
- Body: clean sans-serif (Source Sans, Inter) for readability
- Place names: serif at larger sizes for "nature guide" feel

### Visual elements

- Card grid: photo, place name, municipality, area size per card
- Photos with subtle rounded corners, soft shadow
- Map: muted/natural tile style (Stadia Outdoors or desaturated OSM)
- Custom markers: simple pin or leaf icon in gold accent
- Generous whitespace
- Subtle paper grain texture on background if it works naturally
- Landing page is image-forward, minimal text
- Cards are visual-first, text secondary

## Data Sources

Known sources for Pirkanmaa:

1. **Ekokumppanit PDF** — "Pirkanmaan ja Tampereen kaupunkiseudun retkeilyreitit" (2021), ~20 places with facilities, links, notes
2. **Pirkanmaan virkistysalueyhdistys (pivi.fi)** — 8 managed recreation areas with detailed pages
3. **Luonnonperintosaatio** — Conservation areas in Pirkanmaa
4. **luontoon.fi** — Metsahallitus national hiking areas and national parks

## Data Pipeline

No dedicated scraper scripts. Instead, a Claude Code skill (`.claude/skills/add-kohde.md`) that:

1. Takes a place name (and optionally municipality/region)
2. Searches known source websites for information
3. Compiles findings into the correct front matter schema
4. Writes a draft markdown file to `content/kohteet/`
5. Reports what was found and what's missing (coordinates, photos, area size)

Can also bulk-process: given a source, extract all places and generate draft files.

Workflow: invoke skill -> review drafts -> enrich with photos/notes/coordinates -> set `draft: false` -> publish.

## Build & Deployment

- Custom Hugo theme in `themes/retkikohteet/`
- `hugo.toml` with Finnish language settings
- GitHub Actions: on push to main, `hugo --minify`, deploy to GitHub Pages
- Local dev: `hugo server`

## Future Considerations (not in scope now)

- Client-side filtering by arbitrary front matter properties (JS reading JSON at build time)
- Richer map interactions if Leaflet proves limiting
- Expansion beyond Pirkanmaa (region as a taxonomy)
- Multiple map tile style options
