"""
tesseract_vault.py — V1.1.1 Hawaiian Imports Storage Rights

Replaces the deactivated volunteer-credit→storage system with a Sparks-based
model. Sparks are merit (not monetary; freely earned), so this is compliant
with the V68.76 monetary/merit firewall.

Slot economics:
  • Discovery (tier 1):   2 base slots
  • Resonance (tier 2):   4 base slots
  • Architect (tier 3):   6 base slots
  • Sovereign (tier 4):  10 base slots
  • Founder           :  12 base slots
  • + 1 bonus slot per 1000 sparks earned (capped at 8 bonus)

Per-user state lives in db.tesseract_vault_claims:
  { user_id, relic_id, claimed_at, source }

Default Hawaiian relic catalogue mirrors TesseractVault.js DEFAULT_RELICS.
"""

from fastapi import APIRouter, HTTPException, Depends
from deps import db, get_current_user
from datetime import datetime, timezone

router = APIRouter(prefix="/tesseract-vault", tags=["tesseract-vault"])


# Mirrors frontend DEFAULT_RELICS — keep IDs in sync
RELIC_CATALOGUE = [
    {"id": "lilikoi-fudge",  "label": "Lilikoi Fudge",       "origin": "Maui · Family Recipe",     "color": "#FBBF24", "tier": "sovereign"},
    {"id": "lychee",          "label": "Lychee",              "origin": "Big Island Orchards",      "color": "#F472B6", "tier": "all"},
    {"id": "macadamia",       "label": "Macadamia Nuts",      "origin": "Kona Roastery",            "color": "#A78BFA", "tier": "all"},
    {"id": "koa-wood",        "label": "Koa Wood Carving",    "origin": "Hawaii Heritage",          "color": "#92400E", "tier": "architect"},
    {"id": "kona-coffee",     "label": "Kona Coffee",         "origin": "South Kona Slopes",        "color": "#7C2D12", "tier": "all"},
    {"id": "sea-salt",        "label": "Black Hawaiian Salt", "origin": "Molokai Salt Pans",        "color": "#1F2937", "tier": "all"},
    {"id": "taro",            "label": "Taro Chips",          "origin": "Kauai Fields",             "color": "#7C3AED", "tier": "all"},
    {"id": "spam-musubi",     "label": "Spam Musubi Kit",     "origin": "Honolulu Diner",           "color": "#EF4444", "tier": "all"},
]

_TIER_BASE_SLOTS = {
    "discovery": 2,
    "seeker": 2,
    "resonance": 4,
    "artisan": 4,
    "architect": 6,
    "builder": 6,
    "sovereign": 10,
    "sovereign_monthly": 10,
    "sovereign_founder": 12,
    "founder": 12,
}

_TIER_RANK = {
    "discovery": 1, "seeker": 1,
    "resonance": 2, "artisan": 2,
    "architect": 3, "builder": 3,
    "sovereign": 4, "sovereign_monthly": 4,
    "sovereign_founder": 5, "founder": 5,
}


def _user_tier_id(user: dict) -> str:
    """Resolve the user's tier id from common shapes.
    V1.1.24 — Owner / admin / creator accounts always resolve to the
    top sovereign tier so the app owner is never tier-gated."""
    role = (user.get("role") or "").lower()
    raw_tier = (user.get("tier") or "").lower()
    if (
        user.get("is_owner") is True
        or user.get("is_admin") is True
        or role in ("admin", "owner", "creator")
        or raw_tier in ("creator", "admin", "owner")
    ):
        return "sovereign"
    return (
        (user.get("subscription_tier") or
         user.get("tier_id") or
         user.get("gilded_tier") or
         "discovery")
    ).lower()


def _can_claim_tier(user_tier: str, relic_tier: str) -> bool:
    if relic_tier == "all":
        return True
    return _TIER_RANK.get(user_tier, 0) >= _TIER_RANK.get(relic_tier, 99)


async def _compute_slot_quota(user: dict) -> dict:
    tier = _user_tier_id(user)
    base = _TIER_BASE_SLOTS.get(tier, 2)
    # Sparks lookup (merit currency — non-monetary, transferable)
    spark_doc = await db.sparks_balances.find_one(
        {"user_id": user["id"]}, {"_id": 0, "total": 1}
    )
    sparks = int((spark_doc or {}).get("total", 0))
    bonus = min(8, sparks // 1000)
    return {
        "tier": tier,
        "base_slots": base,
        "bonus_slots": bonus,
        "total_slots": base + bonus,
        "sparks_total": sparks,
        "next_bonus_at": ((sparks // 1000) + 1) * 1000,
    }


@router.get("/state")
async def get_vault_state(user=Depends(get_current_user)):
    """Return the user's vault: catalogue, claimed relics, slot quota."""
    quota = await _compute_slot_quota(user)
    user_tier = quota["tier"]

    # User claims
    claims_cursor = db.tesseract_vault_claims.find(
        {"user_id": user["id"]}, {"_id": 0}
    )
    claims = await claims_cursor.to_list(64)
    claimed_ids = {c["relic_id"] for c in claims}

    # Decorate catalogue with per-user state
    catalogue = []
    for r in RELIC_CATALOGUE:
        catalogue.append({
            **r,
            "claimed": r["id"] in claimed_ids,
            "tier_eligible": _can_claim_tier(user_tier, r["tier"]),
            "lock_reason": None if _can_claim_tier(user_tier, r["tier"])
                           else f"Tier {r['tier']}+ only",
        })

    return {
        "quota": quota,
        "catalogue": catalogue,
        "claims": claims,
        "slots_used": len(claimed_ids),
        "slots_available": max(0, quota["total_slots"] - len(claimed_ids)),
    }


@router.post("/claim/{relic_id}")
async def claim_relic(relic_id: str, user=Depends(get_current_user)):
    """Claim a relic into the user's vault. Consumes 1 slot."""
    relic = next((r for r in RELIC_CATALOGUE if r["id"] == relic_id), None)
    if not relic:
        raise HTTPException(404, "Relic not found")

    user_tier = _user_tier_id(user)
    if not _can_claim_tier(user_tier, relic["tier"]):
        raise HTTPException(403, f"Tier {relic['tier']}+ required")

    # Already claimed?
    existing = await db.tesseract_vault_claims.find_one(
        {"user_id": user["id"], "relic_id": relic_id}, {"_id": 0}
    )
    if existing:
        return {"status": "already_claimed", "relic_id": relic_id}

    # Slot check
    quota = await _compute_slot_quota(user)
    used = await db.tesseract_vault_claims.count_documents({"user_id": user["id"]})
    if used >= quota["total_slots"]:
        raise HTTPException(402, {
            "code": "vault_full",
            "message": f"Vault full ({used}/{quota['total_slots']} slots). "
                       f"Earn {quota['next_bonus_at'] - quota['sparks_total']} more sparks "
                       "for a bonus slot, or upgrade tier.",
            "quota": quota,
            "used": used,
        })

    doc = {
        "user_id": user["id"],
        "relic_id": relic_id,
        "claimed_at": datetime.now(timezone.utc).isoformat(),
        "source": "vault_ui",
    }
    await db.tesseract_vault_claims.insert_one(doc)
    doc.pop("_id", None)  # MongoDB mutation safety
    return {
        "status": "claimed",
        "relic_id": relic_id,
        "claimed_at": doc["claimed_at"],
        "slots_used": used + 1,
        "slots_total": quota["total_slots"],
    }


@router.post("/release/{relic_id}")
async def release_relic(relic_id: str, user=Depends(get_current_user)):
    """Release a relic (frees up 1 slot)."""
    res = await db.tesseract_vault_claims.delete_one(
        {"user_id": user["id"], "relic_id": relic_id}
    )
    if res.deleted_count == 0:
        raise HTTPException(404, "Relic not in your vault")
    return {"status": "released", "relic_id": relic_id}


@router.get("/catalogue")
async def public_catalogue():
    """Public read-only catalogue (for guest browsing of TesseractVault)."""
    return {"relics": RELIC_CATALOGUE}
