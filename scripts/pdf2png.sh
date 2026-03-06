#!/bin/bash
# Convert a PDF map to PNG and place it in the Hugo assets folder.
# Usage: ./scripts/pdf2png.sh <pdf-file> <kohde-slug> [output-name]
#
# Examples:
#   ./scripts/pdf2png.sh kartat-pdf/pukala-kartta.pdf pukala
#   ./scripts/pdf2png.sh kartat-pdf/hameenkangas-kesa.pdf hameenkangas kartta-kesa

set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Usage: $0 <pdf-file> <kohde-slug> [output-name]"
  echo "  output-name defaults to 'kartta'"
  exit 1
fi

PDF="$1"
SLUG="$2"
NAME="${3:-kartta}"

DEST="themes/retkikohteet/assets/img/kohteet/${SLUG}"

mkdir -p "$DEST"
pdftoppm -png -r 200 -singlefile "$PDF" "${DEST}/${NAME}"

echo "Created ${DEST}/${NAME}.png"
echo "Add to front matter:"
echo "  - src: \"${NAME}.png\""
echo "    alt: \"...\""
