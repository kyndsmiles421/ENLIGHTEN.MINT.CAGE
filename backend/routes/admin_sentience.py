"""
admin_sentience.py — V69.0 Sentience SLO Endpoint
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Re-runs the V68.97 sentience audit on demand. Returns the percentage
of engines whose underlying page reads or writes ContextBus.

Why this lives as an admin route:
  • Owner can hit /api/admin/sentience after a deploy to confirm the
    Big Bow stayed tied. If the number drops below baseline, something
    silently severed the nervous system.
  • Future CI hook: a deploy script can curl this endpoint and refuse
    to publish if pct < SENTIENCE_FLOOR.
  • Owner-only — exposing the engine inventory to the public is
    architectural surface area we don't need to grant.

The audit is read-only: it walks the frontend filesystem, no DB writes,
no secrets touched.
"""
from fastapi import APIRouter, HTTPException, Depends
from deps import db, get_current_user
from routes.auth import CREATOR_EMAIL
from pathlib import Path
import re

router = APIRouter()

# Resolve to /app/frontend/src regardless of where the backend boots.
_BACKEND_ROOT = Path(__file__).resolve().parents[1]
_REPO_ROOT = _BACKEND_ROOT.parent
_FRONTEND_SRC = _REPO_ROOT / "frontend" / "src"
_ENGINES_DIR = _FRONTEND_SRC / "engines"
_PAGES_DIR = _FRONTEND_SRC / "pages"

# Pattern that proves an engine OR its wrapped page is sentient.
_BUS_PAT = re.compile(r"busCommit|busRead|ContextBus|primerForPrompt|useSentience")
_PAGE_IMPORT_PAT = re.compile(r"from\s+'\.\./pages/([A-Za-z]+)'")

# V69.0 baseline. Any deploy that drops below this is a regression.
SENTIENCE_FLOOR_PCT = 19.0


async def _require_owner(user: dict):
    """Mirror the owner-gate in routes/arsenal.py: get_current_user
    returns a minimal dict (no email), so we resolve from the DB and
    also accept the is_owner flag as a fallback."""
    doc = await db.users.find_one(
        {"id": user["id"]},
        {"_id": 0, "email": 1, "is_owner": 1, "role": 1},
    ) or {}
    email = (doc.get("email") or "").lower()
    if email == CREATOR_EMAIL.lower() or doc.get("is_owner") is True:
        return
    raise HTTPException(status_code=403, detail="Owner only.")


def _audit_sentience():
    """Walk every Engine.js, find its wrapped page, return a structured
    report. Read-only — no side effects."""
    if not _ENGINES_DIR.exists():
        return {
            "error": "engines/ directory not found",
            "sentient": 0, "total": 0, "pct": 0.0, "engines": [],
        }
    engines_report = []
    sentient = 0
    total = 0
    for engine_file in sorted(_ENGINES_DIR.glob("*Engine.js")):
        try:
            engine_src = engine_file.read_text(encoding="utf-8")
        except Exception:
            continue
        page_match = _PAGE_IMPORT_PAT.search(engine_src)
        if not page_match:
            # Engines that don't wrap a page (e.g. utility engines)
            # are excluded from the percentage — they aren't dispatcher
            # consumers, so they don't count for sentience.
            continue
        page_name = page_match.group(1)
        page_file = _PAGES_DIR / f"{page_name}.js"
        if not page_file.exists():
            continue
        try:
            page_src = page_file.read_text(encoding="utf-8")
        except Exception:
            continue
        total += 1
        is_sentient = bool(_BUS_PAT.search(engine_src) or _BUS_PAT.search(page_src))
        if is_sentient:
            sentient += 1
        engines_report.append({
            "engine": engine_file.stem,
            "page": page_name,
            "sentient": is_sentient,
        })
    pct = (sentient / total * 100) if total else 0.0
    return {
        "sentient": sentient,
        "total": total,
        "pct": round(pct, 1),
        "floor_pct": SENTIENCE_FLOOR_PCT,
        "passing_floor": pct >= SENTIENCE_FLOOR_PCT,
        "engines": engines_report,
    }


@router.get("/admin/sentience")
async def get_sentience(user=Depends(get_current_user)):
    """Owner-only sentience SLO. Returns sentient / total / pct and a
    per-engine breakdown so the owner can see exactly which engines
    are still deaf."""
    await _require_owner(user)
    report = _audit_sentience()
    if "error" in report:
        raise HTTPException(status_code=500, detail=report["error"])
    return report


@router.get("/admin/sentience/summary")
async def get_sentience_summary(user=Depends(get_current_user)):
    """Lightweight summary — just the number, suitable for a CI curl
    that checks pct >= floor and exits non-zero on regression. Owner-
    only by the same gate as the full audit."""
    await _require_owner(user)
    report = _audit_sentience()
    return {
        "sentient": report["sentient"],
        "total": report["total"],
        "pct": report["pct"],
        "floor_pct": report["floor_pct"],
        "passing_floor": report["passing_floor"],
    }
