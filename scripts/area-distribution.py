#!/usr/bin/env python3
"""Print the distribution of `pinta_ala_ha` values across kohde files.

Usage: python3 scripts/area-distribution.py

Reads every front-matter block in content/kohteet/*.md, collects the
numeric `pinta_ala_ha` values (ignoring blank and comment-only entries
like routes), and prints a histogram plus summary statistics. Used to
inform the marker-size function in themes/retkikohteet/assets/js/kartta.js.
"""
import glob
import re
import statistics
import sys


def collect_values(pattern: str = "content/kohteet/*.md") -> list[float]:
    values: list[float] = []
    for path in sorted(glob.glob(pattern)):
        with open(path, "r", encoding="utf-8") as fh:
            for line in fh:
                m = re.match(r"^pinta_ala_ha:\s*(.*)$", line)
                if not m:
                    continue
                rest = m.group(1).strip()
                num = re.match(r"^([0-9]+(?:\.[0-9]+)?)\s*$", rest)
                if num:
                    values.append(float(num.group(1)))
                break  # one pinta_ala_ha line per file
    return values


def print_histogram(values: list[float]) -> None:
    buckets = [
        (1, 1),
        (2, 5),
        (6, 10),
        (11, 20),
        (21, 50),
        (51, 100),
        (101, 300),
        (301, 1000),
        (1001, 5000),
        (5001, 15000),
    ]
    print("Distribution:")
    for lo, hi in buckets:
        count = sum(1 for v in values if lo <= v <= hi)
        bar = "#" * count
        label = f"{lo}" if lo == hi else f"{lo}-{hi}"
        print(f"  {label:>12}  {count:>3}  {bar}")


def print_summary(values: list[float]) -> None:
    srt = sorted(values)
    n = len(srt)
    print()
    print(f"  n={n}  min={srt[0]:g}  max={srt[-1]:g}")
    print(f"  median={statistics.median(srt):g}  mean={statistics.mean(srt):.1f}")
    print(
        f"  p25={srt[n // 4]:g}  "
        f"p75={srt[3 * n // 4]:g}  "
        f"p90={srt[int(0.9 * n)]:g}"
    )


def main() -> int:
    values = collect_values()
    if not values:
        print("No pinta_ala_ha values found — run from repo root.", file=sys.stderr)
        return 1
    print_histogram(values)
    print_summary(values)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
