---
name: add-kohde
description: Add a new recreational place by extracting data from known sources. Use when the user wants to add a new retkikohde or extract places from a source.
---

## Purpose

Extract information about a recreational nature spot and create a Hugo content file.

## Input

The user provides:
- Place name (required)
- Municipality/kunta (optional, helps narrow search)

## Known Sources (Pirkanmaa)

Search these in order for information about the place:
1. https://www.luontoon.fi/ — Metsahallitus national hiking areas
2. https://www.pirkanmaanvirkistysalueyhdistys.fi/virkistysalueet/ — PIVI managed areas
3. https://luonnonperintosaatio.fi/suojelualueet/pirkanmaa/ — Conservation areas
4. General web search for the place name with "retkeily" or "luonto" and "pirkanmaa"

## Process

1. Search each relevant source for information about the given place
2. Extract: name, municipality, coordinates, area size, facilities (trails, fire places, shelters, rental cabins), links, description
3. Compile findings into the content file format below
4. Write the file to `content/kohteet/<slug>.md` with `draft: true`
5. Report what was found, from which source, and what's missing

## Output Format

Create file at: `content/kohteet/<slug>.md`

The slug is the place name lowercased, spaces replaced with hyphens, Finnish characters preserved.

Front matter:

```yaml
---
title: "<Place Name>"
kunta: "<Municipality>"
koordinaatit: [<lat>, <lon>]
pinta_ala_ha: <number or leave out if unknown>
kuvia: []
kartat:
  google_maps: "<url>"
  paikkatietoikkuna: ""
  maastokartat_app: ""
vaellusreitit_km: <number or leave out if unknown>
tulipaikkoja: <number or leave out if unknown>
laavuja: <number or leave out if unknown>
vuokratupia: []
lahde: "<primary source name>"
lahde_url: "<primary source url>"
tags: [<relevant tags from: kansallispuisto, luonnonsuojelualue, virkistysalue, vaellus, melonta, pyoraily, luontopolku>]
draft: true
---

<Description compiled from sources. Include notable features, conditions, and useful information.>
```

## After Writing

Report to the user:
- What was found and from which source
- What fields are missing or uncertain (especially: coordinates, area size)
- Suggest next steps: add photos, verify coordinates on map, set draft: false when ready

## Bulk Mode

If the user provides a source URL or text content instead of a place name, extract ALL places mentioned in that source and create individual files for each. Ask for confirmation before writing if more than 5 files would be created.
