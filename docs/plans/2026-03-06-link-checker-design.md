# Link Checker Design

**Goal:** A shell script to detect broken and redirected URLs in content front matter, run manually.

**Architecture:** Single shell script extracts URLs from YAML front matter, checks each with curl, reports problems.

## Scope

- **Check:** All HTTP(S) URLs in front matter fields: `google_maps`, `paikkatietoikkuna`, `karttapaikka`, `luontoon_fi`, `lahde_url`
- **Skip:** `maastokartat_app` (always empty), body content links
- **Extract from:** `content/kohteet/*.md`, front matter block only (between `---` markers)

## What it detects

| Category | Condition | Output |
|----------|-----------|--------|
| Broken | HTTP 4xx/5xx | Status code, file, URL |
| Redirected | 3xx (initial != final URL) | Status code, file, old URL, new URL |
| Unreachable | Connection error, timeout, DNS failure | Error description, file, URL |

## Implementation details

- **Tool:** `curl -sIL` (silent, HEAD request, follow redirects)
- **Timeout:** 10 seconds per URL (`--max-time 10`)
- **Redirect detection:** Compare initial URL to `curl -w '%{url_effective}'` final URL
- **User-Agent:** Real browser-like UA to avoid blocks
- **HEAD fallback:** If server rejects HEAD, retry with GET and discard body
- **Deduplication:** Same URL in multiple files checked once, reported for all
- **Execution:** Sequential, no parallelism (~2-4 min for ~130 URLs)
- **Exit code:** 0 if all ok, 1 if any broken/unreachable

## Output format

```
=== BROKEN (4xx/5xx) ===
[404] content/kohteet/pukala.md: https://example.com/gone

=== REDIRECTED (3xx) ===
[301] content/kohteet/ritajarvi.md: https://old-url -> https://new-url

=== UNREACHABLE ===
[ERR] content/kohteet/bar.md: https://timeout.example.com (connection timed out)

=== SUMMARY ===
Checked 131 URLs: 2 broken, 1 redirected, 1 unreachable, 127 ok
```

## Usage

```bash
./scripts/check-links.sh
```

No arguments, no configuration, no state files. Just run it and read the output.
