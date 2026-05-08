"""
brand_identity.py — V1.1.19 Sovereign Brand Birth Certificate
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Canonical, machine-readable Brand Identity surface. Reads from the
Single Source of Truth at /app/shared/brand_identity.json so the HTML
head schema, this endpoint, and the sync script can never drift.

Path: GET /api/.well-known/brand-identity.json

To change the brand identity:
  1. Edit /app/shared/brand_identity.json
  2. Run /app/scripts/sync_brand_identity.py to propagate to the HTML
     files (index.html, landing.html). This endpoint picks up the
     change automatically on next request — no rebuild needed.
"""
import json
from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()

# Single Source of Truth lives at /app/shared/brand_identity.json.
# Resolve the path relative to this file so it works in any deploy
# environment (preview, prod, container).
_BRAND_FILE = Path(__file__).resolve().parents[2] / "shared" / "brand_identity.json"


def _load_brand_graph() -> dict:
    """Read the canonical brand graph from the shared JSON. Falls
    through to a minimal stub if the file is missing so the endpoint
    never 500s — but in normal operation the file is always present."""
    try:
        with _BRAND_FILE.open("r", encoding="utf-8") as fh:
            data = json.load(fh)
        graph = data.get("graph", {})
        # Embed metadata so agents can detect changes without diffing
        # the full graph. Mirrors the version + updated fields in the
        # source JSON.
        return {
            **graph,
            "_meta": {
                "version": data.get("version", "unknown"),
                "schema_origin": "https://enlighten-mint-cafe.me/",
                "agent_readable": True,
                "updated": data.get("updated", "unknown"),
                "source_of_truth": "/app/shared/brand_identity.json",
            },
        }
    except Exception:
        # Never block the endpoint on a missing/corrupt file. Return
        # the minimal stub so crawlers still get a valid response.
        return {
            "@context": "https://schema.org",
            "@graph": [],
            "_meta": {"version": "unknown", "agent_readable": True},
        }


@router.get("/.well-known/brand-identity.json")
async def brand_identity():
    """Canonical machine-readable brand identity. Public, cacheable."""
    return JSONResponse(
        content=_load_brand_graph(),
        headers={
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
        },
    )
