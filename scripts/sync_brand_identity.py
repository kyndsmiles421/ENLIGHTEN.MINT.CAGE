#!/usr/bin/env python3
"""
sync_brand_identity.py — V1.1.19 Brand Identity Drift Killer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Propagates /app/shared/brand_identity.json into the JSON-LD blocks
embedded in the two static HTML entry points. Run this whenever the
source-of-truth JSON is edited so the HTML head schema, the React
build, and the static landing page never drift apart.

Usage:
  python3 /app/scripts/sync_brand_identity.py
  python3 /app/scripts/sync_brand_identity.py --check   # exit 1 if drift

The backend /api/.well-known/brand-identity.json endpoint reads the
JSON directly at request time, so it never needs syncing — but Google
crawlers read JSON-LD from <head>, which means we MUST keep the HTML
files in lockstep with the JSON source.

Drift detection: each HTML file's JSON-LD <script> block is delimited
by sentinel comments so this script can find and replace it
deterministically without an HTML parser.
"""
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "shared" / "brand_identity.json"
HTML_FILES = [
    ROOT / "frontend" / "public" / "index.html",
    ROOT / "frontend" / "public" / "landing.html",
]

# Sentinels mark the start/end of the auto-managed block in each HTML
# file. Anything between them is replaced; anything outside is left
# alone. Add these comments around the existing JSON-LD <script> the
# first time you run --install.
START_SENTINEL = "<!-- BRAND_IDENTITY:START -->"
END_SENTINEL = "<!-- BRAND_IDENTITY:END -->"


def _load_source() -> dict:
    with SOURCE.open("r", encoding="utf-8") as fh:
        data = json.load(fh)
    return data["graph"]


def _block_for(graph: dict, indent: str = "        ") -> str:
    """Render the canonical <script> block (sentinels + JSON-LD)."""
    pretty = json.dumps(graph, indent=2, ensure_ascii=False)
    indented = "\n".join(indent + line for line in pretty.splitlines())
    return (
        f"{indent}{START_SENTINEL}\n"
        f"{indent}<script type=\"application/ld+json\">\n"
        f"{indented}\n"
        f"{indent}</script>\n"
        f"{indent}{END_SENTINEL}"
    )


def _replace_block(html: str, block: str) -> tuple[str, bool]:
    """Replace the sentinel-delimited block. Returns (new_html, found)."""
    pattern = re.compile(
        re.escape(START_SENTINEL) + r".*?" + re.escape(END_SENTINEL),
        re.DOTALL,
    )
    if not pattern.search(html):
        return html, False
    new_html = pattern.sub(block.strip(), html, count=1)
    return new_html, True


def _install_sentinels(html: str, block: str) -> str:
    """First-run: replace any existing application/ld+json <script>
    that contains our brand id with the sentinel-wrapped canonical
    block. If no match, leave the file unchanged."""
    pattern = re.compile(
        r'<script type="application/ld\+json">.*?enlighten-mint-cafe\.me/#brand.*?</script>',
        re.DOTALL,
    )
    if not pattern.search(html):
        return html
    return pattern.sub(block.strip(), html, count=1)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true",
                        help="Exit 1 if any HTML file is out of sync.")
    parser.add_argument("--install", action="store_true",
                        help="Wrap existing JSON-LD blocks with sentinels (first run only).")
    args = parser.parse_args()

    graph = _load_source()
    canonical = _block_for(graph, indent="        ")
    canonical_no_indent = _block_for(graph, indent="")

    drifted = []
    for path in HTML_FILES:
        html = path.read_text(encoding="utf-8")
        # landing.html uses no indentation in the head; index.html uses 8-space.
        block = canonical_no_indent if path.name == "landing.html" else canonical
        new_html, found = _replace_block(html, block)
        if not found:
            if args.install:
                new_html = _install_sentinels(html, block)
                if new_html == html:
                    print(f"[SKIP] {path}: no JSON-LD block matching brand id found")
                    continue
            else:
                print(f"[WARN] {path}: missing sentinels — run with --install once")
                continue
        if new_html != html:
            if args.check:
                drifted.append(str(path))
            else:
                path.write_text(new_html, encoding="utf-8")
                print(f"[OK]   {path}: synced")
        else:
            print(f"[NOOP] {path}: already in sync")

    if args.check and drifted:
        print("DRIFT DETECTED:", *drifted, sep="\n  ")
        sys.exit(1)


if __name__ == "__main__":
    main()
