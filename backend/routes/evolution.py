from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone, timedelta
import math

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  PERPETUAL EVOLUTION PROTOCOL (PEP)
#  All assets are "Living Entities" with a Vitality Coefficient.
#  VC = (Interaction × Growth_Rate) - (Time × Decay_Rate)
#  -1% degradation per 24h inactivity.
#  3 Stages: Raw → Refined → Transcendental
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GROWTH_RATE = 5.0       # Points per interaction
DECAY_RATE = 1.0        # -1% VC per 24h
REFINE_THRESHOLD = 50   # VC to reach Refined
TRANSCEND_THRESHOLD = 150  # VC to reach Transcendental

EVOLUTION_STAGES = {
    "raw": {
        "id": "raw",
        "name": "Raw",
        "subtitle": "Freshly Discovered",
        "description": "A jagged, unrefined ore. Basic stats and 1× multipliers.",
        "multiplier": 1.0,
        "min_vc": 0,
        "color": "#9CA3AF",
        "particle_aura": False,
        "visual": "jagged",
    },
    "refined": {
        "id": "refined",
        "name": "Refined",
        "subtitle": "Engaged & Polished",
        "description": "Internal light and polished facets emerge. Doubles resonance intensity.",
        "multiplier": 2.0,
        "min_vc": REFINE_THRESHOLD,
        "color": "#3B82F6",
        "particle_aura": False,
        "visual": "polished",
    },
    "transcendental": {
        "id": "transcendental",
        "name": "Transcendental",
        "subtitle": "Mastered & Eternal",
        "description": "Emits a constant particle aura. Permanent passive effect even when unequipped.",
        "multiplier": 3.0,
        "min_vc": TRANSCEND_THRESHOLD,
        "color": "#FCD34D",
        "particle_aura": True,
        "visual": "radiant",
    },
}

# ── Geological & Spiritual Metadata for Specimens ──
SPECIMEN_METADATA = {
    "peridot": {"crystal_system": "Orthorhombic", "cleavage": "Poor", "chakra": "Heart", "frequency": 639, "mantra": "I open my heart to growth and renewal"},
    "emerald": {"crystal_system": "Hexagonal", "cleavage": "Imperfect", "chakra": "Heart", "frequency": 639, "mantra": "I radiate love and abundance from my core"},
    "jade": {"crystal_system": "Monoclinic", "cleavage": "None", "chakra": "Heart", "frequency": 639, "mantra": "I walk in harmony with all things"},
    "malachite": {"crystal_system": "Monoclinic", "cleavage": "Perfect", "chakra": "Heart / Solar Plexus", "frequency": 528, "mantra": "I transform pain into wisdom"},
    "moss_agate": {"crystal_system": "Trigonal", "cleavage": "None", "chakra": "Heart", "frequency": 639, "mantra": "I am rooted in Earth's abundance"},
    "green_tourmaline": {"crystal_system": "Trigonal", "cleavage": "None", "chakra": "Heart", "frequency": 639, "mantra": "My heart radiates electric compassion"},
    "ruby": {"crystal_system": "Trigonal", "cleavage": "None", "chakra": "Root", "frequency": 396, "mantra": "I ignite the fire of unstoppable courage"},
    "garnet": {"crystal_system": "Cubic", "cleavage": "None", "chakra": "Root", "frequency": 396, "mantra": "I regenerate with every breath"},
    "carnelian": {"crystal_system": "Trigonal", "cleavage": "None", "chakra": "Sacral", "frequency": 417, "mantra": "I embrace creative fire within me"},
    "fire_opal": {"crystal_system": "Amorphous", "cleavage": "Conchoidal", "chakra": "Sacral / Solar Plexus", "frequency": 528, "mantra": "I manifest through the flames of intention"},
    "sunstone": {"crystal_system": "Triclinic", "cleavage": "Perfect", "chakra": "Solar Plexus", "frequency": 528, "mantra": "I shine with the radiance of a thousand suns"},
    "obsidian": {"crystal_system": "Amorphous", "cleavage": "Conchoidal", "chakra": "Root", "frequency": 396, "mantra": "I face my shadow and emerge stronger"},
    "amber": {"crystal_system": "Amorphous", "cleavage": "None", "chakra": "Solar Plexus", "frequency": 528, "mantra": "Ancient wisdom flows through me"},
    "tigers_eye": {"crystal_system": "Trigonal", "cleavage": "None", "chakra": "Solar Plexus", "frequency": 528, "mantra": "I see clearly with grounded focus"},
    "jasper": {"crystal_system": "Trigonal", "cleavage": "None", "chakra": "Root", "frequency": 396, "mantra": "I endure with the patience of stone"},
    "petrified_wood": {"crystal_system": "Trigonal", "cleavage": "None", "chakra": "Root / Third Eye", "frequency": 852, "mantra": "Time reveals the beauty within all things"},
    "topaz": {"crystal_system": "Orthorhombic", "cleavage": "Perfect", "chakra": "Solar Plexus", "frequency": 528, "mantra": "I manifest golden abundance effortlessly"},
    "smoky_quartz": {"crystal_system": "Trigonal", "cleavage": "None", "chakra": "Root", "frequency": 396, "mantra": "I ground myself and transmute negativity"},
    "diamond": {"crystal_system": "Cubic", "cleavage": "Perfect Octahedral", "chakra": "Crown", "frequency": 963, "mantra": "I am clarity itself — pure crystallized consciousness"},
    "clear_quartz": {"crystal_system": "Trigonal", "cleavage": "None", "chakra": "Crown", "frequency": 963, "mantra": "I amplify the frequency of all that is good"},
    "pyrite": {"crystal_system": "Cubic", "cleavage": "None", "chakra": "Solar Plexus", "frequency": 528, "mantra": "I attract prosperity through bold action"},
    "hematite": {"crystal_system": "Trigonal", "cleavage": "None", "chakra": "Root", "frequency": 396, "mantra": "I am shielded and magnetically aligned"},
    "platinum_nugget": {"crystal_system": "Cubic", "cleavage": "None", "chakra": "Crown / Soul Star", "frequency": 963, "mantra": "I am a cosmic conductor of divine frequency"},
    "silver_ore": {"crystal_system": "Cubic", "cleavage": "None", "chakra": "Third Eye", "frequency": 852, "mantra": "Lunar light reveals my deepest intuition"},
    "aquamarine": {"crystal_system": "Hexagonal", "cleavage": "Imperfect", "chakra": "Throat", "frequency": 741, "mantra": "I speak my truth with the clarity of the sea"},
    "moonstone": {"crystal_system": "Monoclinic", "cleavage": "Perfect", "chakra": "Third Eye / Crown", "frequency": 852, "mantra": "I flow with cycles and honor inner knowing"},
    "lapis_lazuli": {"crystal_system": "Cubic", "cleavage": "Poor", "chakra": "Third Eye", "frequency": 852, "mantra": "Royal wisdom flows through my third eye"},
    "sapphire": {"crystal_system": "Trigonal", "cleavage": "None", "chakra": "Third Eye / Throat", "frequency": 852, "mantra": "The stars speak through me — I am aligned"},
    "pearl": {"crystal_system": "Orthorhombic", "cleavage": "None", "chakra": "Crown", "frequency": 963, "mantra": "Patience transforms all irritation into beauty"},
    "larimar": {"crystal_system": "Triclinic", "cleavage": "Perfect", "chakra": "Throat / Heart", "frequency": 741, "mantra": "I am the calm ocean — vast and at peace"},
}

# ── Seasonal Cycles (90-day rotations) ──
SEASONAL_CYCLES = {
    "compression": {
        "id": "compression",
        "name": "The Compression",
        "rock_type": "Metamorphic",
        "description": "Diamonds and Pressure. The UI becomes minimalist and dense; the Mixer focuses on Deep Work frequencies.",
        "color": "#A855F7",
        "accent": "#7C3AED",
        "focus": "deep_work",
        "frequency_base": 396,
        "visual_style": "minimalist",
    },
    "eruption": {
        "id": "eruption",
        "name": "The Eruption",
        "rock_type": "Igneous",
        "description": "Obsidian and Manifestation. High-contrast visuals and high-tempo, driving audio.",
        "color": "#EF4444",
        "accent": "#DC2626",
        "focus": "manifestation",
        "frequency_base": 528,
        "visual_style": "high_contrast",
    },
    "erosion": {
        "id": "erosion",
        "name": "The Erosion",
        "rock_type": "Sedimentary",
        "description": "Time and Sandstone. The UI edges soften; the Ledger highlights Reflections and historical data.",
        "color": "#F59E0B",
        "accent": "#D97706",
        "focus": "reflection",
        "frequency_base": 852,
        "visual_style": "soft_edges",
    },
}

CYCLE_ORDER = ["compression", "eruption", "erosion"]


def _get_current_season() -> dict:
    """Determine the current 90-day geological season."""
    epoch = datetime(2026, 1, 1, tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    days_since = (now - epoch).days
    cycle_index = (days_since // 90) % 3
    cycle_id = CYCLE_ORDER[cycle_index]
    days_into = days_since % 90
    days_remaining = 90 - days_into
    return {
        **SEASONAL_CYCLES[cycle_id],
        "days_into_cycle": days_into,
        "days_remaining": days_remaining,
        "progress": round(days_into / 90 * 100, 1),
    }


def _compute_vc(asset: dict) -> float:
    """Compute Vitality Coefficient for an asset."""
    interactions = asset.get("interactions", 0)
    last_interaction = asset.get("last_interaction_at")

    # Growth component
    growth = interactions * GROWTH_RATE

    # Decay component: -1% per 24h since last interaction
    decay = 0.0
    if last_interaction:
        try:
            last_dt = datetime.fromisoformat(last_interaction)
            if last_dt.tzinfo is None:
                last_dt = last_dt.replace(tzinfo=timezone.utc)
            hours_inactive = (datetime.now(timezone.utc) - last_dt).total_seconds() / 3600
            decay = (hours_inactive / 24) * DECAY_RATE * max(1, growth * 0.01)
        except Exception:
            pass

    # Check for preservation salt (pauses decay)
    if asset.get("preserved_until"):
        try:
            pres_dt = datetime.fromisoformat(asset["preserved_until"])
            if pres_dt.tzinfo is None:
                pres_dt = pres_dt.replace(tzinfo=timezone.utc)
            if datetime.now(timezone.utc) < pres_dt:
                decay = 0.0
        except Exception:
            pass

    vc = max(0, growth - decay)
    return round(vc, 2)


def _get_stage(vc: float) -> dict:
    """Get evolution stage from VC."""
    if vc >= TRANSCEND_THRESHOLD:
        return EVOLUTION_STAGES["transcendental"]
    elif vc >= REFINE_THRESHOLD:
        return EVOLUTION_STAGES["refined"]
    return EVOLUTION_STAGES["raw"]


def _stage_progress(vc: float, stage: dict) -> dict:
    """Compute progress within/toward next stage."""
    if stage["id"] == "transcendental":
        return {"next_stage": None, "progress": 100, "vc_needed": 0}
    elif stage["id"] == "refined":
        needed = TRANSCEND_THRESHOLD - vc
        progress = ((vc - REFINE_THRESHOLD) / (TRANSCEND_THRESHOLD - REFINE_THRESHOLD)) * 100
        return {"next_stage": "transcendental", "progress": round(min(100, progress), 1), "vc_needed": round(needed, 1)}
    else:
        needed = REFINE_THRESHOLD - vc
        progress = (vc / REFINE_THRESHOLD) * 100
        return {"next_stage": "refined", "progress": round(min(100, progress), 1), "vc_needed": round(needed, 1)}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  API ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


@router.get("/evolution/collection")
async def get_evolved_collection(user=Depends(get_current_user)):
    """Get user's specimen collection with PEP evolution data."""
    user_id = user["id"]

    # Check subscription for decay pause
    nexus_sub = await db.nexus_subscriptions.find_one(
        {"user_id": user_id, "status": "active"}, {"_id": 0}
    )
    decay_paused = nexus_sub is not None

    collection = await db.rock_hounding_collection.find(
        {"user_id": user_id}, {"_id": 0, "user_id": 0}
    ).to_list(200)

    evolved = []
    stage_counts = {"raw": 0, "refined": 0, "transcendental": 0}
    total_vc = 0

    for item in collection:
        spec_id = item.get("specimen_id", "")

        # Get or create evolution tracker
        evo = await db.evolution_tracker.find_one(
            {"user_id": user_id, "asset_id": spec_id}, {"_id": 0}
        )
        if not evo:
            evo = {"interactions": 0, "last_interaction_at": item.get("last_found")}

        if decay_paused:
            evo["preserved_until"] = (datetime.now(timezone.utc) + timedelta(days=365)).isoformat()

        vc = _compute_vc(evo)
        stage = _get_stage(vc)
        progress = _stage_progress(vc, stage)
        total_vc += vc
        stage_counts[stage["id"]] += 1

        # Attach spiritual metadata
        meta = SPECIMEN_METADATA.get(spec_id, {})

        evolved.append({
            "specimen_id": spec_id,
            "name": item.get("name", "Unknown"),
            "element": item.get("element", "earth"),
            "rarity": item.get("best_rarity", "common"),
            "count": item.get("count", 1),
            "mohs": item.get("mohs"),
            "description": item.get("description", ""),
            # Evolution data
            "vitality_coefficient": vc,
            "stage": stage,
            "stage_progress": progress,
            "interactions": evo.get("interactions", 0),
            "last_interaction": evo.get("last_interaction_at"),
            "decay_paused": decay_paused,
            # Spiritual metadata
            "crystal_system": meta.get("crystal_system"),
            "cleavage": meta.get("cleavage"),
            "chakra": meta.get("chakra"),
            "frequency": meta.get("frequency"),
            "mantra": meta.get("mantra"),
        })

    return {
        "collection": evolved,
        "total_vc": round(total_vc, 1),
        "stage_counts": stage_counts,
        "decay_paused": decay_paused,
        "season": _get_current_season(),
    }


@router.post("/evolution/interact")
async def interact_with_asset(data: dict = Body(...), user=Depends(get_current_user)):
    """Interact with an asset (polish, attune, nurture) to grow its VC."""
    user_id = user["id"]
    asset_id = data.get("asset_id")
    interaction_type = data.get("type", "polish")  # polish, attune, meditate

    if not asset_id:
        raise HTTPException(400, "asset_id required")

    # Verify ownership
    owned = await db.rock_hounding_collection.find_one(
        {"user_id": user_id, "specimen_id": asset_id}
    )
    if not owned:
        raise HTTPException(404, "Asset not in your collection")

    # Rate limit: 1 interaction per asset per 10 minutes
    evo = await db.evolution_tracker.find_one(
        {"user_id": user_id, "asset_id": asset_id}, {"_id": 0}
    )
    if evo and evo.get("last_interaction_at"):
        try:
            last_dt = datetime.fromisoformat(evo["last_interaction_at"])
            if last_dt.tzinfo is None:
                last_dt = last_dt.replace(tzinfo=timezone.utc)
            cooldown = (datetime.now(timezone.utc) - last_dt).total_seconds()
            if cooldown < 600:
                remaining = int(600 - cooldown)
                raise HTTPException(400, f"Cooldown active. Wait {remaining}s before interacting again.")
        except HTTPException:
            raise
        except Exception:
            pass

    now = datetime.now(timezone.utc).isoformat()

    # Update evolution tracker
    await db.evolution_tracker.update_one(
        {"user_id": user_id, "asset_id": asset_id},
        {
            "$inc": {"interactions": 1},
            "$set": {"last_interaction_at": now, "last_type": interaction_type},
            "$push": {"history": {"type": interaction_type, "at": now}},
        },
        upsert=True,
    )

    # Recompute VC after interaction
    updated_evo = await db.evolution_tracker.find_one(
        {"user_id": user_id, "asset_id": asset_id}, {"_id": 0}
    )
    vc = _compute_vc(updated_evo)
    stage = _get_stage(vc)
    progress = _stage_progress(vc, stage)

    # Check for stage transition
    old_vc = _compute_vc(evo or {"interactions": 0})
    old_stage = _get_stage(old_vc)
    evolved = old_stage["id"] != stage["id"]

    # Award small XP/dust for interaction
    from routes.game_core import award_xp, award_currency
    xp_bonus = 5 * int(stage["multiplier"])
    dust_bonus = 2 * int(stage["multiplier"])
    await award_xp(user_id, xp_bonus, f"evolution:{interaction_type}:{asset_id}")
    await award_currency(user_id, "cosmic_dust", dust_bonus, f"evolution:{interaction_type}:{asset_id}")

    meta = SPECIMEN_METADATA.get(asset_id, {})

    return {
        "interacted": True,
        "asset_id": asset_id,
        "interaction_type": interaction_type,
        "vitality_coefficient": vc,
        "stage": stage,
        "stage_progress": progress,
        "evolved": evolved,
        "rewards": {"xp": xp_bonus, "dust": dust_bonus},
        "mantra": meta.get("mantra"),
        "frequency": meta.get("frequency"),
    }


@router.post("/evolution/preserve")
async def preserve_asset(data: dict = Body(...), user=Depends(get_current_user)):
    """Apply Preservation Salt to pause decay on an asset for 30 days."""
    user_id = user["id"]
    asset_id = data.get("asset_id")

    if not asset_id:
        raise HTTPException(400, "asset_id required")

    # Check inventory for preservation_salt
    inv = await db.marketplace_inventory.find_one(
        {"user_id": user_id, "item_id": "preservation_salt"}
    )
    if not inv or inv.get("quantity", 0) <= 0:
        raise HTTPException(400, "No Preservation Salts in inventory. Purchase from the Cosmic Store.")

    # Deduct salt
    if inv.get("quantity", 0) <= 1:
        await db.marketplace_inventory.delete_one({"user_id": user_id, "item_id": "preservation_salt"})
    else:
        await db.marketplace_inventory.update_one(
            {"user_id": user_id, "item_id": "preservation_salt"},
            {"$inc": {"quantity": -1}},
        )

    # Apply preservation
    expires = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    await db.evolution_tracker.update_one(
        {"user_id": user_id, "asset_id": asset_id},
        {"$set": {"preserved_until": expires}},
        upsert=True,
    )

    return {"preserved": True, "asset_id": asset_id, "preserved_until": expires}


@router.get("/evolution/season")
async def get_season(user=Depends(get_current_user)):
    """Get the current geological season (90-day rotation)."""
    return _get_current_season()


@router.get("/evolution/metadata/{specimen_id}")
async def get_specimen_metadata(specimen_id: str, user=Depends(get_current_user)):
    """Get full geological + spiritual metadata for a specimen."""
    meta = SPECIMEN_METADATA.get(specimen_id)
    if not meta:
        raise HTTPException(404, "Unknown specimen")

    # Get evolution state for this user
    evo = await db.evolution_tracker.find_one(
        {"user_id": user["id"], "asset_id": specimen_id}, {"_id": 0}
    )
    vc = _compute_vc(evo or {"interactions": 0})
    stage = _get_stage(vc)

    return {
        "specimen_id": specimen_id,
        **meta,
        "vitality_coefficient": vc,
        "stage": stage,
        "interactions": (evo or {}).get("interactions", 0),
        "stages": EVOLUTION_STAGES,
    }
