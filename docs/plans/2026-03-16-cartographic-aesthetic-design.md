# Cartographic Aesthetic Redesign

## Goal

Replace the generic template aesthetic with a topographic/cartographic field-guide feel. The site should look like a survey map meets a naturalist's notebook.

## Color Palette

```
--bg:         #F7F5F0    warm off-white (survey paper)
--bg-alt:     #EDE9E0    slightly darker (cards, tags, nav border)
--text:       #3A3A38    warm charcoal
--accent:     #5B7A3A    muted olive green (links, buttons, trails)
--accent-dk:  #4A6530    darker olive (hover states)
--muted:      #B8652A    burnt orange (metadata, coordinates, secondary)
```

## Typography

- Headings: Lora serif (unchanged)
- Body/metadata: IBM Plex Mono (replace Source Sans 3)
- Base font size: 0.9rem (mono is wider than sans, needs compensation)
- The serif-mono contrast gives the field-guide character

## Card Placeholders

Current: single letter on a blue-grey gradient.

New: SVG topo contour pattern.
- Deterministic pattern per site (hash the title to vary line positions/curves)
- Muted olive/brown contour lines on off-white
- Site first letter overlaid small, positioned like a map label (bottom-left)
- Generated inline via Hugo template or JS — no external assets needed

## UI Adjustments

- Navbar: thin bottom border (1px solid rgba(0,0,0,0.08))
- Tags: 1px border style instead of filled background (map legend labels)
- Buttons/links: squared-off corners (border-radius: 2px), utilitarian
- kohde-card: border-radius from 0.75rem to 0.25rem
- Map popup: same corner tightening

## Scope

CSS-only changes except for:
- Google Fonts link update (IBM Plex Mono)
- Card placeholder template change (SVG contour generation)

## Files to modify

1. `themes/retkikohteet/layouts/_default/baseof.html` — font link
2. `themes/retkikohteet/assets/css/main.css` — all style changes
3. `themes/retkikohteet/layouts/partials/kohde-card.html` — placeholder SVG
