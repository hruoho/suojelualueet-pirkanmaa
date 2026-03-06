#!/bin/bash
# Check all external URLs in content front matter for broken links and redirects.
# Usage: ./scripts/check-links.sh
set -euo pipefail

CONTENT_DIR="content/kohteet"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
TIMEOUT=10

# Collect all file→url pairs
all_files=()
all_urls=()

for f in "$CONTENT_DIR"/*.md; do
  [ -f "$f" ] || continue
  while read -r url; do
    # Trim trailing quotes
    url="${url%\"}"
    url="${url%\'}"
    [ -z "$url" ] && continue
    all_files+=("$f")
    all_urls+=("$url")
  done < <(awk '/^---$/{n++; next} n==1{print}' "$f" | grep -oE 'https?://[^"'"'"' ]+')
done

# Build unique URL list and track which files reference each
unique_urls=()
unique_files=()  # comma-separated file lists per unique URL

for i in "${!all_urls[@]}"; do
  url="${all_urls[$i]}"
  file="${all_files[$i]}"
  found=0
  for j in "${!unique_urls[@]}"; do
    if [ "${unique_urls[$j]}" = "$url" ]; then
      # Append file if not already listed
      case ",${unique_files[$j]}," in
        *",$file,"*) ;;
        *) unique_files[$j]="${unique_files[$j]}, $file" ;;
      esac
      found=1
      break
    fi
  done
  if [ "$found" = "0" ]; then
    unique_urls+=("$url")
    unique_files+=("$file")
  fi
done

total=${#unique_urls[@]}
echo "Checking $total unique URLs..."
echo ""

# Results
broken_out=""
redirect_out=""
unreach_out=""
broken_count=0
redirect_count=0
unreach_count=0
ok_count=0

for i in "${!unique_urls[@]}"; do
  url="${unique_urls[$i]}"
  files="${unique_files[$i]}"
  printf "\r  [%d/%d] %-60s" "$((i+1))" "$total" "${url:0:60}" >&2

  # Try HEAD first
  http_code=$(curl -sI -o /dev/null -w '%{http_code}' \
    -L --max-time "$TIMEOUT" --max-redirs 10 \
    -A "$UA" "$url" 2>/dev/null || echo "000")

  # Some servers reject HEAD, retry with GET
  if [ "$http_code" = "405" ] || [ "$http_code" = "403" ]; then
    http_code=$(curl -s -o /dev/null -w '%{http_code}' \
      -L --max-time "$TIMEOUT" --max-redirs 10 \
      -A "$UA" "$url" 2>/dev/null || echo "000")
  fi

  if [ "$http_code" = "000" ]; then
    unreach_out="${unreach_out}  [ERR] ${files}: ${url}\n"
    unreach_count=$((unreach_count + 1))
  elif [ "$http_code" -ge 400 ] 2>/dev/null; then
    broken_out="${broken_out}  [${http_code}] ${files}: ${url}\n"
    broken_count=$((broken_count + 1))
  else
    # Check for redirect: compare initial to effective URL
    effective=$(curl -s -o /dev/null -w '%{url_effective}' \
      -L --max-time "$TIMEOUT" --max-redirs 10 \
      -A "$UA" "$url" 2>/dev/null || echo "$url")

    if [ "$effective" != "$url" ]; then
      # Ignore benign redirects (Google Maps cookie consent param)
      stripped="${effective%&ucbcb=*}"
      stripped="${stripped%?ucbcb=*}"
      if [ "$stripped" = "$url" ]; then
        ok_count=$((ok_count + 1))
      else
        redirect_out="${redirect_out}  [${http_code}] ${files}: ${url} -> ${effective}\n"
        redirect_count=$((redirect_count + 1))
      fi
    else
      ok_count=$((ok_count + 1))
    fi
  fi
done

# Clear progress line
printf "\r%80s\r" "" >&2

# Report
if [ "$broken_count" -gt 0 ]; then
  echo "=== BROKEN (4xx/5xx) ==="
  printf "$broken_out"
  echo ""
fi

if [ "$redirect_count" -gt 0 ]; then
  echo "=== REDIRECTED ==="
  printf "$redirect_out"
  echo ""
fi

if [ "$unreach_count" -gt 0 ]; then
  echo "=== UNREACHABLE ==="
  printf "$unreach_out"
  echo ""
fi

echo "=== SUMMARY ==="
echo "Checked $total URLs: $broken_count broken, $redirect_count redirected, $unreach_count unreachable, $ok_count ok"

# Exit with error if any problems found
[ "$broken_count" -eq 0 ] && [ "$unreach_count" -eq 0 ]
