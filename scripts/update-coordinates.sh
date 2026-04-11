#!/usr/bin/env bash
# Update the `koordinaatit` field in a kohde markdown file.
#
# Interactive (loops until you hit Ctrl-D / empty filename):
#   ./scripts/update-coordinates.sh
#
# One-shot:
#   ./scripts/update-coordinates.sh <kohde-file> "<lat>, <long>"
#
# Example:
#   ./scripts/update-coordinates.sh content/kohteet/ahtialan-lehmuslehto.md "61.4321, 23.1234"

set -euo pipefail

KOHTEET_DIR="content/kohteet"

# Apply one update. Args: <file> "<lat>, <long>"
# Returns 0 on success/abort, non-zero on hard error (missing file etc.).
update_one() {
  local file="$1"
  local coords="$2"

  if [[ ! -f "$file" ]]; then
    echo "Error: file not found: $file" >&2
    return 1
  fi

  local lat lon
  lat="$(echo "$coords" | awk -F',' '{gsub(/^[ \t]+|[ \t]+$/,"",$1); print $1}')"
  lon="$(echo "$coords" | awk -F',' '{gsub(/^[ \t]+|[ \t]+$/,"",$2); print $2}')"

  if [[ -z "$lat" || -z "$lon" ]]; then
    echo "Error: could not parse coordinates from: $coords" >&2
    echo "Expected format: \"<lat>, <long>\"" >&2
    return 1
  fi

  if ! grep -q '^koordinaatit:' "$file"; then
    echo "Error: no 'koordinaatit:' line found in $file" >&2
    return 1
  fi

  local new_line="koordinaatit: [${lat}, ${lon}]"
  local tmp
  tmp="$(mktemp)"
  # shellcheck disable=SC2064
  trap "rm -f '$tmp'" RETURN

  awk -v new="$new_line" '
    /^koordinaatit:/ && !done { print new; done=1; next }
    { print }
  ' "$file" > "$tmp"

  if diff -q "$file" "$tmp" >/dev/null; then
    echo "No changes — coordinates already set to [${lat}, ${lon}]."
    return 0
  fi

  echo "Proposed change to $file:"
  echo
  diff -u "$file" "$tmp" | sed '1,2d' || true
  echo

  local reply
  read -r -p "Apply this change? [y/N] " reply
  case "$reply" in
    y|Y|yes|YES)
      mv "$tmp" "$file"
      echo "Updated."
      ;;
    *)
      echo "Aborted."
      ;;
  esac
}

# One-shot mode
if [[ $# -eq 2 ]]; then
  update_one "$1" "$2"
  exit $?
fi

if [[ $# -ne 0 ]]; then
  echo "Usage: $0                                # interactive" >&2
  echo "       $0 <kohde-file> \"<lat>, <long>\"   # one-shot" >&2
  exit 2
fi

# Interactive mode
if [[ ! -d "$KOHTEET_DIR" ]]; then
  echo "Error: directory not found: $KOHTEET_DIR (run from repo root)" >&2
  exit 1
fi

echo "Interactive coordinate updater. Ctrl-D or empty filename to quit."
echo "Tab-completes filenames in $KOHTEET_DIR/"
echo

while :; do
  # Read the filename with tab-completion. We temporarily cd into the
  # kohteet dir so readline's built-in filename completion lists its
  # contents directly — no full path typing needed.
  pushd "$KOHTEET_DIR" > /dev/null
  name=""
  if ! read -e -r -p "Kohde file: " name; then
    popd > /dev/null
    echo
    break
  fi
  popd > /dev/null

  if [[ -z "$name" ]]; then
    break
  fi

  file="$KOHTEET_DIR/$name"
  if [[ ! -f "$file" ]]; then
    echo "Not found: $file"
    echo
    continue
  fi

  read -r -p "Coordinates (\"lat, long\"): " coords
  if [[ -z "$coords" ]]; then
    echo "Skipped (no coordinates entered)."
    echo
    continue
  fi

  update_one "$file" "$coords" || true
  echo
done
