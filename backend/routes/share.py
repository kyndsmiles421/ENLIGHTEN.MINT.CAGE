"""
V68.7 — RESONANCE PATTERN SHARE
Generates a shareable fingerprint: stable public URL + caption summarizing
the user's 9x9 lattice journey. No image generation server — the browser
snapshots the SVG if it wants a PNG. We return the ingredients; the UI
composes the share payload.

Endpoints:
  GET /api/share/pattern                    — current user's pattern (authed)
  GET /api/share/pattern/public/{share_id}  — public read of any pattern (unauthed)
"""
from datetime import datetime, timezone
import hashlib
from fastapi import APIRouter, Depends, HTTPException
from deps import db, get_current_user
from utils.sovereign_main_brain import main_brain
from routes.sparks import GAMING_CARDS

router = APIRouter()


def _rank_from_sparks(sparks: int, earned_card_ids: set) -> str:
    if "sovereign_crown" in earned_card_ids or sparks >= 15000:
        return "SOVEREIGN"
    if "tesseract_key" in earned_card_ids or sparks >= 7500:
        return "ARCHITECT"
    if "oracle_seer" in earned_card_ids or sparks >= 5000:
        return "ORACLE"
    if "master_craftsman" in earned_card_ids or sparks >= 3000:
        return "ARTISAN"
    if "celestial_navigator" in earned_card_ids or sparks >= 1500:
        return "NAVIGATOR"
    if "starseed_initiate" in earned_card_ids or sparks >= 500:
        return "SEED"
    return "CITIZEN"


async def _build_pattern(user_id: str) -> dict:
    # User's activations
    cursor = db.lattice_activations.find({"user_id": user_id}, {"_id": 0}).sort("last_activation", 1)
    activations = await cursor.to_list(length=500)

    # Wallet + rank
    wallet = await db.spark_wallets.find_one({"user_id": user_id}, {"_id": 0}) or {}
    sparks = int(wallet.get("sparks", 0))
    card_ids = {c.get("card_id") for c in wallet.get("cards_earned", []) if isinstance(c, dict)}
    card_ids.update({c["id"] for c in GAMING_CARDS if sparks >= c["spark_threshold"]})
    rank = _rank_from_sparks(sparks, card_ids)

    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0, "name": 1, "email": 1}) or {}
    display_name = user_doc.get("name") or (user_doc.get("email", "").split("@")[0] if user_doc.get("email") else "Traveler")

    coords = [{"x": a["x"], "y": a["y"], "type": a.get("type"), "count": a.get("activation_count", 1)} for a in activations]
    unique_nodes = len(coords)
    total_activations = sum(c["count"] for c in coords)

    return {
        "rank": rank,
        "sparks": sparks,
        "display_name": display_name,
        "unique_nodes": unique_nodes,
        "total_activations": total_activations,
        "lattice_size": main_brain.LATTICE_SIZE,
        "coords": coords,
    }


def _stable_share_id(user_id: str) -> str:
    return hashlib.sha1(f"sovereign:{user_id}".encode()).hexdigest()[:12]


@router.get("/share/pattern")
async def share_my_pattern(user=Depends(get_current_user)):
    """Returns the user's shareable Resonance Pattern payload."""
    data = await _build_pattern(user["id"])
    share_id = _stable_share_id(user["id"])
    # Persist so anyone with the link can read it later
    await db.resonance_patterns.update_one(
        {"share_id": share_id},
        {"$set": {
            "share_id": share_id,
            "user_id": user["id"],
            "updated_at": datetime.now(timezone.utc).isoformat(),
            **data,
        }},
        upsert=True,
    )
    # The app-relative share URL — frontend composes the absolute URL using its own origin
    share_path = f"/resonance/{share_id}"
    caption = (
        f"✦ My Sovereign Lattice — {data['rank']} rank · "
        f"{data['unique_nodes']}/{data['lattice_size']**2} nodes activated · "
        f"{data['sparks']} sparks earned"
    )
    return {
        "share_id": share_id,
        "share_path": share_path,
        "share_url": share_path,  # frontend will prefix with window.location.origin
        "caption": caption,
        "pattern": data,
    }


@router.get("/share/pattern/public/{share_id}")
async def get_public_pattern(share_id: str):
    """Public read — no auth. Anyone with the link sees the pattern."""
    doc = await db.resonance_patterns.find_one({"share_id": share_id}, {"_id": 0, "user_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="pattern not found")
    return doc
