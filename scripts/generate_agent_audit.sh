#!/usr/bin/env bash
# /app/scripts/generate_agent_audit.sh
# V1.2.6 — Generates a complete line-by-line audit of every agent commit
# across the project history. Produces:
#   /app/AGENT_AUDIT_LINE_BY_LINE.md  — human-readable
#   /app/AGENT_AUDIT_LINE_BY_LINE.json — machine-readable (one record per commit)
#
# Run after every significant change OR via a cron / CI hook. Idempotent.
# The output files are overwritten in place; git history is the source of truth.

set -e
cd "$(dirname "$0")/.."

OUT_MD="AGENT_AUDIT_LINE_BY_LINE.md"
OUT_JSON="AGENT_AUDIT_LINE_BY_LINE.json"
TOTAL=$(git log --oneline 2>/dev/null | wc -l | tr -d ' ')
GENERATED=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# ──────────────────────────────────────────────────────────────
# 1. MARKDOWN AUDIT  (every commit, every file, every line delta)
# ──────────────────────────────────────────────────────────────
{
  echo "# AGENT AUDIT — LINE-BY-LINE"
  echo ""
  echo "**Project:** ENLIGHTEN.MINT.CAFE  "
  echo "**Generated:** ${GENERATED}  "
  echo "**Total commits in history:** ${TOTAL}  "
  echo "**Source of truth:** \`git log\` (this file is regenerated, never hand-edited)"
  echo ""
  echo "Each entry below is one agent commit. The \`files_changed\` block shows"
  echo "every file the agent touched in that commit and exactly how many lines"
  echo "were added/removed (\`+N/-N\`). Newest first."
  echo ""
  echo "---"
  echo ""
  git log --pretty=format:"## %h%n**Date:** %ad  %n**Author:** %an  %n**Subject:** %s%n%n**files_changed:**" \
    --date=iso \
    --numstat 2>/dev/null \
  | awk '
      /^## / { if (in_stat) { print "```"; in_stat=0 } print; next }
      /^\*\*Date:/ { print; next }
      /^\*\*Author:/ { print; next }
      /^\*\*Subject:/ { print; next }
      /^\*\*files_changed:/ { print; print "```"; in_stat=1; next }
      /^[0-9-]+\t[0-9-]+\t/ { gsub(/\t/, "  "); print; next }
      /^$/ { next }
      { print }
      END { if (in_stat) print "```" }
  '
} > "$OUT_MD"

# ──────────────────────────────────────────────────────────────
# 2. JSON AUDIT  (machine-readable, one object per commit)
# ──────────────────────────────────────────────────────────────
python3 - <<'PYEOF' > "$OUT_JSON"
import subprocess, json, re
out = subprocess.check_output(
    ["git", "log",
     "--pretty=format:===COMMIT===%n%H%n%ad%n%an%n%s",
     "--date=iso", "--numstat"],
    text=True, cwd="/app"
)
commits = []
for block in out.split("===COMMIT===\n"):
    if not block.strip():
        continue
    lines = block.strip().split("\n")
    if len(lines) < 4:
        continue
    sha, date, author, subject = lines[0], lines[1], lines[2], lines[3]
    files = []
    for ln in lines[4:]:
        if not ln.strip():
            continue
        m = re.match(r"^(\d+|-)\s+(\d+|-)\s+(.+)$", ln)
        if not m:
            continue
        added, removed, path = m.group(1), m.group(2), m.group(3)
        files.append({
            "path": path,
            "lines_added": int(added) if added != "-" else None,
            "lines_removed": int(removed) if removed != "-" else None,
        })
    commits.append({
        "sha": sha[:12],
        "date": date,
        "author": author,
        "subject": subject,
        "files_changed": files,
        "file_count": len(files),
    })
print(json.dumps({"total": len(commits), "commits": commits}, indent=2))
PYEOF

LINE_COUNT=$(wc -l < "$OUT_MD" | tr -d ' ')
echo "✅ Audit generated:"
echo "   ${OUT_MD}    (${LINE_COUNT} lines, ${TOTAL} commits)"
echo "   ${OUT_JSON}  (machine-readable)"
