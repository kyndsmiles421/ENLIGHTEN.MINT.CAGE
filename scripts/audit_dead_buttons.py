#!/usr/bin/env python3
"""
/app/scripts/audit_dead_buttons.py — V1.2.7

Scans every page/component in /app/frontend/src and flags any
interactive element that almost certainly does NOTHING when tapped:

  • <button> with no onClick / onMouseDown / onTouchStart / onSubmit / type="submit"
  • <a>      with no href / onClick / to=
  • role="button" elements with no onClick

Output: /app/DEAD_BUTTONS_AUDIT.md  (markdown, sorted by file, line numbers)
        /app/DEAD_BUTTONS_AUDIT.json (machine-readable)

Heuristics are conservative — we miss handlers passed via prop spread
(`{...rest}`) and we explicitly EXEMPT:
  • <button type="submit"> inside a <form onSubmit=…>
  • elements that pass a callback prop down (onClick={onSelect} etc.)
  • disabled buttons (correct behavior — no action by design)

Run after big UI changes, or wire into pre-push.
"""
import re
import json
from pathlib import Path
from datetime import datetime

ROOT = Path("/app/frontend/src")
EXCLUDE = ("_orphans/", "node_modules/", ".cache/", "__pycache__/", "/ui/")

# Captures opening tags <button …>  /  <a …>  /  *role="button"* divs.
BUTTON_OPEN = re.compile(r"<button\b([^>]*)>", re.IGNORECASE | re.DOTALL)
ANCHOR_OPEN = re.compile(r"<a(\s[^>]*)>",       re.IGNORECASE | re.DOTALL)
DIV_BTN_OPEN = re.compile(r'<(div|span)\b([^>]*?role=["\']button["\'][^>]*)>',
                           re.IGNORECASE | re.DOTALL)

# Attribute presence (handles single + double quotes + JSX braces).
HAS_ONCLICK   = re.compile(r"\bonClick=", re.IGNORECASE)
HAS_ONMOUSE   = re.compile(r"\bonMouse(Down|Up)=", re.IGNORECASE)
HAS_ONPOINTER = re.compile(r"\bonPointer(Down|Up)=", re.IGNORECASE)
HAS_ONTOUCH   = re.compile(r"\bonTouch(Start|End)=", re.IGNORECASE)
HAS_ONSUBMIT  = re.compile(r"\bonSubmit=", re.IGNORECASE)
HAS_ONKEYDOWN = re.compile(r"\bonKeyDown=", re.IGNORECASE)
HAS_HREF      = re.compile(r"\bhref=")
HAS_TO        = re.compile(r"\bto=")
HAS_TYPE_SUB  = re.compile(r'\btype=["\']submit["\']', re.IGNORECASE)
HAS_DISABLED  = re.compile(r"\bdisabled\b")
HAS_SPREAD    = re.compile(r"\{\s*\.\.\.")  # {...rest} — likely passes handlers
# Template-literal HTML uses `class=` (not `className=`); these are
# typically wired via event delegation on a parent. Auto-skip.
IS_TEMPLATE_HTML = re.compile(r'\bclass=["\']')


def has_handler(attrs: str) -> bool:
    """Element clearly does something when activated."""
    return bool(
        HAS_ONCLICK.search(attrs) or HAS_ONMOUSE.search(attrs)
        or HAS_ONPOINTER.search(attrs) or HAS_ONTOUCH.search(attrs)
        or HAS_ONSUBMIT.search(attrs) or HAS_ONKEYDOWN.search(attrs)
        or HAS_SPREAD.search(attrs) or IS_TEMPLATE_HTML.search(attrs)
    )


def line_no(src: str, idx: int) -> int:
    return src.count("\n", 0, idx) + 1


def scan_file(path: Path):
    src = path.read_text(errors="replace")
    issues = []

    for m in BUTTON_OPEN.finditer(src):
        attrs = m.group(1)
        if HAS_DISABLED.search(attrs):
            continue
        if HAS_TYPE_SUB.search(attrs):
            continue   # form submit — handled by parent <form onSubmit>
        if has_handler(attrs):
            continue
        issues.append({
            "kind": "button",
            "line": line_no(src, m.start()),
            "snippet": attrs.strip()[:120],
        })

    for m in ANCHOR_OPEN.finditer(src):
        attrs = m.group(1)
        if HAS_HREF.search(attrs) or HAS_TO.search(attrs):
            continue
        if has_handler(attrs):
            continue
        issues.append({
            "kind": "anchor",
            "line": line_no(src, m.start()),
            "snippet": attrs.strip()[:120],
        })

    for m in DIV_BTN_OPEN.finditer(src):
        attrs = m.group(2)
        if has_handler(attrs):
            continue
        issues.append({
            "kind": "role-button-div",
            "line": line_no(src, m.start()),
            "snippet": attrs.strip()[:120],
        })

    return issues


def main():
    files = []
    for p in ROOT.rglob("*.js"):
        if any(s in str(p) for s in EXCLUDE):
            continue
        files.append(p)
    for p in ROOT.rglob("*.jsx"):
        if any(s in str(p) for s in EXCLUDE):
            continue
        files.append(p)

    report = {}
    total = 0
    for p in sorted(files):
        issues = scan_file(p)
        if issues:
            rel = str(p.relative_to(Path("/app")))
            report[rel] = issues
            total += len(issues)

    md = ["# DEAD BUTTON AUDIT — ENLIGHTEN.MINT.CAFE",
          "",
          f"**Generated:** {datetime.utcnow().isoformat()}Z",
          f"**Files scanned:** {len(files)}",
          f"**Files with at least one dead control:** {len(report)}",
          f"**Total dead controls found:** {total}",
          "",
          "Each entry below is an interactive element with NO click /",
          "submit / mouse / touch / keyboard handler AND no href/to.",
          "Tapping it does literally nothing on the live app.",
          "",
          "Heuristics may produce false positives when handlers are passed",
          "down via `{...rest}` spread props — those are auto-skipped.",
          "",
          "---",
          ""]

    for rel, issues in report.items():
        md.append(f"## `{rel}` — {len(issues)} dead control(s)")
        md.append("")
        md.append("| Line | Kind | Element snippet |")
        md.append("|---|---|---|")
        for i in issues[:80]:
            snip = i["snippet"].replace("|", "\\|").replace("\n", " ")
            md.append(f"| {i['line']} | {i['kind']} | `{snip}` |")
        if len(issues) > 80:
            md.append(f"| … | … | _and {len(issues) - 80} more in this file_ |")
        md.append("")

    Path("/app/DEAD_BUTTONS_AUDIT.md").write_text("\n".join(md))
    Path("/app/DEAD_BUTTONS_AUDIT.json").write_text(json.dumps(
        {"generated": datetime.utcnow().isoformat() + "Z",
         "total_files_scanned": len(files),
         "total_files_with_issues": len(report),
         "total_dead_controls": total,
         "by_file": report}, indent=2))

    print(f"✅ {total} dead controls across {len(report)} files (of {len(files)} scanned)")
    print(f"   → /app/DEAD_BUTTONS_AUDIT.md")
    print(f"   → /app/DEAD_BUTTONS_AUDIT.json")


if __name__ == "__main__":
    main()
