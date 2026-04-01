from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from routes.evolution import SPECIMEN_METADATA
from datetime import datetime, timezone

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  SMARTDOCK NEXUS — The Relic Pedestal
#  Slotting a "Master Stone" triggers global app transformation:
#  Audio: Blends stone's frequency into Cosmic Mixer
#  Visual: Shifts UI palette to match stone's chakra
#  Functional: Unlocks tier-specific teachings + mantras
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHAKRA_PALETTES = {
    "Root": {"primary": "#EF4444", "secondary": "#991B1B", "accent": "#FCA5A5", "glow": "rgba(239,68,68,0.08)", "hz": 396},
    "Sacral": {"primary": "#F97316", "secondary": "#9A3412", "accent": "#FDBA74", "glow": "rgba(249,115,22,0.08)", "hz": 417},
    "Solar Plexus": {"primary": "#F59E0B", "secondary": "#92400E", "accent": "#FCD34D", "glow": "rgba(245,158,11,0.08)", "hz": 528},
    "Heart": {"primary": "#22C55E", "secondary": "#166534", "accent": "#86EFAC", "glow": "rgba(34,197,94,0.08)", "hz": 639},
    "Heart / Solar Plexus": {"primary": "#22C55E", "secondary": "#92400E", "accent": "#86EFAC", "glow": "rgba(34,197,94,0.08)", "hz": 528},
    "Throat": {"primary": "#06B6D4", "secondary": "#155E75", "accent": "#67E8F9", "glow": "rgba(6,182,212,0.08)", "hz": 741},
    "Throat / Heart": {"primary": "#06B6D4", "secondary": "#166534", "accent": "#67E8F9", "glow": "rgba(6,182,212,0.08)", "hz": 741},
    "Third Eye": {"primary": "#8B5CF6", "secondary": "#5B21B6", "accent": "#C4B5FD", "glow": "rgba(139,92,246,0.08)", "hz": 852},
    "Third Eye / Crown": {"primary": "#8B5CF6", "secondary": "#6D28D9", "accent": "#C4B5FD", "glow": "rgba(139,92,246,0.08)", "hz": 852},
    "Third Eye / Throat": {"primary": "#8B5CF6", "secondary": "#155E75", "accent": "#C4B5FD", "glow": "rgba(139,92,246,0.08)", "hz": 852},
    "Crown": {"primary": "#A855F7", "secondary": "#7C3AED", "accent": "#D8B4FE", "glow": "rgba(168,85,247,0.08)", "hz": 963},
    "Crown / Soul Star": {"primary": "#F8FAFC", "secondary": "#A855F7", "accent": "#F3E8FF", "glow": "rgba(248,250,252,0.08)", "hz": 963},
    "Root / Third Eye": {"primary": "#EF4444", "secondary": "#5B21B6", "accent": "#FCA5A5", "glow": "rgba(239,68,68,0.08)", "hz": 852},
    "Sacral / Solar Plexus": {"primary": "#F97316", "secondary": "#92400E", "accent": "#FDBA74", "glow": "rgba(249,115,22,0.08)", "hz": 528},
}


@router.get("/smartdock/state")
async def get_dock_state(user=Depends(get_current_user)):
    """Get the current SmartDock state — which stone is slotted and its effects."""
    user_id = user["id"]
    dock = await db.smartdock_state.find_one({"user_id": user_id}, {"_id": 0, "user_id": 0})

    if not dock or not dock.get("slotted_specimen"):
        return {
            "slotted": False,
            "specimen": None,
            "resonance_effect": None,
            "audio_blend": None,
            "visual_palette": None,
            "active_mantra": None,
        }

    spec_id = dock["slotted_specimen"]
    meta = SPECIMEN_METADATA.get(spec_id, {})
    chakra = meta.get("chakra", "Heart")
    palette = CHAKRA_PALETTES.get(chakra, CHAKRA_PALETTES["Heart"])

    # Get polished status
    owned = await db.rock_hounding_collection.find_one(
        {"user_id": user_id, "specimen_id": spec_id}, {"_id": 0, "user_id": 0}
    )

    # Get evolution stage
    evo = await db.evolution_tracker.find_one(
        {"user_id": user_id, "asset_id": spec_id}, {"_id": 0}
    )
    from routes.evolution import _compute_vc, _get_stage
    vc = _compute_vc(evo or {"interactions": 0})
    stage = _get_stage(vc)

    return {
        "slotted": True,
        "specimen": {
            "id": spec_id,
            "name": (owned or {}).get("name", spec_id.replace("_", " ").title()),
            "element": (owned or {}).get("element"),
            "rarity": (owned or {}).get("best_rarity"),
            "mohs": (owned or {}).get("mohs"),
            "polished": (owned or {}).get("polished", False),
            "stage": stage,
            "vc": vc,
        },
        "resonance_effect": {
            "chakra": chakra,
            "frequency": meta.get("frequency", 528),
            "mantra": meta.get("mantra"),
            "crystal_system": meta.get("crystal_system"),
        },
        "audio_blend": {
            "frequency_hz": meta.get("frequency", 528),
            "blend_mode": "additive",
            "intensity": min(1.0, vc / 100) if vc > 0 else 0.3,
        },
        "visual_palette": palette,
        "active_mantra": meta.get("mantra"),
        "slotted_at": dock.get("slotted_at"),
    }


@router.post("/smartdock/slot")
async def slot_stone(data: dict = Body(...), user=Depends(get_current_user)):
    """Slot a stone into the SmartDock pedestal. Triggers global app transformation."""
    user_id = user["id"]
    specimen_id = data.get("specimen_id")

    if not specimen_id:
        raise HTTPException(400, "specimen_id required")

    # Verify ownership
    owned = await db.rock_hounding_collection.find_one(
        {"user_id": user_id, "specimen_id": specimen_id}
    )
    if not owned:
        raise HTTPException(404, "Specimen not in your collection")

    meta = SPECIMEN_METADATA.get(specimen_id, {})
    chakra = meta.get("chakra", "Heart")
    palette = CHAKRA_PALETTES.get(chakra, CHAKRA_PALETTES["Heart"])
    now = datetime.now(timezone.utc).isoformat()

    await db.smartdock_state.update_one(
        {"user_id": user_id},
        {"$set": {
            "user_id": user_id,
            "slotted_specimen": specimen_id,
            "slotted_at": now,
            "chakra": chakra,
            "frequency": meta.get("frequency", 528),
        }},
        upsert=True,
    )

    # Log to Cosmic Ledger
    await db.cosmic_ledger_entries.insert_one({
        "user_id": user_id,
        "type": "smartdock_slot",
        "specimen_id": specimen_id,
        "specimen_name": owned.get("name", "Unknown"),
        "chakra": chakra,
        "frequency": meta.get("frequency"),
        "timestamp": now,
    })

    # Boost evolution VC for active use
    await db.evolution_tracker.update_one(
        {"user_id": user_id, "asset_id": specimen_id},
        {
            "$inc": {"interactions": 1},
            "$set": {"last_interaction_at": now},
        },
        upsert=True,
    )

    return {
        "slotted": True,
        "specimen_id": specimen_id,
        "resonance_effect": {
            "chakra": chakra,
            "frequency": meta.get("frequency", 528),
            "mantra": meta.get("mantra"),
        },
        "visual_palette": palette,
        "audio_blend": {
            "frequency_hz": meta.get("frequency", 528),
            "blend_mode": "additive",
        },
    }


@router.post("/smartdock/unslot")
async def unslot_stone(user=Depends(get_current_user)):
    """Remove the current stone from the SmartDock."""
    user_id = user["id"]
    dock = await db.smartdock_state.find_one({"user_id": user_id})
    if not dock or not dock.get("slotted_specimen"):
        raise HTTPException(400, "No stone currently slotted")

    await db.smartdock_state.update_one(
        {"user_id": user_id},
        {"$set": {"slotted_specimen": None, "unslotted_at": datetime.now(timezone.utc).isoformat()}},
    )

    return {"unslotted": True}


@router.get("/smartdock/eligible")
async def get_eligible_stones(user=Depends(get_current_user)):
    """Get all stones eligible for SmartDock slotting (must be in collection)."""
    user_id = user["id"]
    collection = await db.rock_hounding_collection.find(
        {"user_id": user_id}, {"_id": 0, "user_id": 0}
    ).to_list(100)

    stones = []
    for item in collection:
        spec_id = item.get("specimen_id", "")
        meta = SPECIMEN_METADATA.get(spec_id, {})
        stones.append({
            "specimen_id": spec_id,
            "name": item.get("name", "Unknown"),
            "element": item.get("element"),
            "rarity": item.get("best_rarity"),
            "polished": item.get("polished", False),
            "chakra": meta.get("chakra"),
            "frequency": meta.get("frequency"),
            "mantra": meta.get("mantra"),
        })

    return {"stones": stones}
