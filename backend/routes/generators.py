from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, create_activity, logger
from datetime import datetime, timezone
import uuid
import hashlib

router = APIRouter()

TIERS = ["observer", "synthesizer", "archivist", "navigator", "sovereign"]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  GENERATOR CATALOG — Tiered Payable Bonuses
#  Three generator types, each tier-gated and priced
#  in Trade Circle credits.
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GENERATOR_CATALOG = [
    # Sub-Harmonic Generators — Thicken low end with beating effect
    {
        "id": "sub-harmonic-01",
        "name": "Sub-Harmonic Pulse",
        "type": "sub_harmonic",
        "description": "1.5Hz beating effect that thickens the low end of meditation sessions. Creates a physical, haptic-heavy experience.",
        "tier_required": "synthesizer",
        "price_credits": 8,
        "params": {
            "beat_frequency": 1.5,
            "sub_ratio": 0.5,
            "gain_base": 0.15,
            "decay_seconds": 4.0,
        },
        "bloom_variance": {"reverb_color": 0.12, "decay_mod": 0.08},
    },
    {
        "id": "sub-harmonic-02",
        "name": "Deep Earth Resonator",
        "type": "sub_harmonic",
        "description": "7.83Hz Schumann resonance sub-harmonic. Grounds the session in Earth's electromagnetic heartbeat.",
        "tier_required": "archivist",
        "price_credits": 15,
        "params": {
            "beat_frequency": 7.83,
            "sub_ratio": 0.25,
            "gain_base": 0.12,
            "decay_seconds": 6.0,
        },
        "bloom_variance": {"reverb_color": 0.18, "decay_mod": 0.15},
    },
    {
        "id": "sub-harmonic-03",
        "name": "Sovereign Bass Field",
        "type": "sub_harmonic",
        "description": "Multi-layered sub-harmonic stack with sympathetic resonance. The deepest physical tone achievable.",
        "tier_required": "sovereign",
        "price_credits": 30,
        "params": {
            "beat_frequency": 3.0,
            "sub_ratio": 0.125,
            "gain_base": 0.10,
            "decay_seconds": 10.0,
            "sympathetic": True,
        },
        "bloom_variance": {"reverb_color": 0.25, "decay_mod": 0.20},
    },

    # Procedural Mantra Extensions — AI phonic resonance layers
    {
        "id": "mantra-ext-01",
        "name": "Phonic Flourish",
        "type": "mantra_extension",
        "description": "Adds an improvised 174-528Hz phonic resonance layer that evolves based on orbital movement history.",
        "tier_required": "synthesizer",
        "price_credits": 10,
        "params": {
            "freq_range": [174, 528],
            "evolution_rate": 0.05,
            "layer_count": 2,
        },
        "bloom_variance": {"reverb_color": 0.10, "decay_mod": 0.06},
    },
    {
        "id": "mantra-ext-02",
        "name": "Harmonic Density Weave",
        "type": "mantra_extension",
        "description": "Full solfeggio spectrum overlay (174-963Hz) with harmonic series generation up to 5 overtones.",
        "tier_required": "archivist",
        "price_credits": 20,
        "params": {
            "freq_range": [174, 963],
            "evolution_rate": 0.08,
            "layer_count": 5,
            "overtones": 5,
        },
        "bloom_variance": {"reverb_color": 0.15, "decay_mod": 0.12},
    },
    {
        "id": "mantra-ext-03",
        "name": "Celestial Gate Resonance",
        "type": "mantra_extension",
        "description": "Transcendence-tier phonic engine spanning 174-1074Hz. Full spectral evolution with real-time hexagram modulation.",
        "tier_required": "sovereign",
        "price_credits": 35,
        "params": {
            "freq_range": [174, 1074],
            "evolution_rate": 0.12,
            "layer_count": 8,
            "overtones": 8,
            "hexagram_modulation": True,
        },
        "bloom_variance": {"reverb_color": 0.22, "decay_mod": 0.18},
    },

    # Ultra-Lossless Rendering — Session boost for high-end DSP
    {
        "id": "lossless-01",
        "name": "Hi-Fi Session Boost",
        "type": "ultra_lossless",
        "description": "Upgrades a single session to 88.2kHz/24-bit Pro-Grade rendering with convolution reverb.",
        "tier_required": "archivist",
        "price_credits": 5,
        "params": {
            "sample_rate": 88200,
            "bit_depth": 24,
            "convolution": True,
            "duration_minutes": 30,
        },
        "bloom_variance": {"reverb_color": 0.08, "decay_mod": 0.05},
    },
    {
        "id": "lossless-02",
        "name": "Ultra-Lossless Sovereign Render",
        "type": "ultra_lossless",
        "description": "Full 96kHz/24-bit Lossless with sympathetic resonance, convolution reverb, and spatial panning. Unlimited duration.",
        "tier_required": "sovereign",
        "price_credits": 12,
        "params": {
            "sample_rate": 96000,
            "bit_depth": 24,
            "convolution": True,
            "sympathetic": True,
            "spatial_panning": True,
            "duration_minutes": -1,
        },
        "bloom_variance": {"reverb_color": 0.20, "decay_mod": 0.15},
    },
]

GENERATOR_MAP = {g["id"]: g for g in GENERATOR_CATALOG}


def compute_bloom_coefficients(user_id: str, generator_id: str, hexagram_number: int = 1):
    """Hybrid Generator Logic:
    Deterministic Core: fundamental intervals are fixed from hexagram state.
    Bloom: seeded RNG (user_id) modulates reverb color and decay within variance bounds.
    """
    gen = GENERATOR_MAP.get(generator_id)
    if not gen:
        return {"reverb_color_mod": 0, "decay_rate_mod": 0, "bloom_seed": 0}

    # Deterministic base from hexagram
    hex_factor = (hexagram_number % 8 + 1) / 8.0  # 0.125 to 1.0

    # Seeded RNG from user_id — consistent per user, per generator
    seed_str = f"{user_id}:{generator_id}"
    seed_hash = int(hashlib.sha256(seed_str.encode()).hexdigest()[:8], 16)
    # Normalize to 0-1 range
    seed_norm = (seed_hash % 10000) / 10000.0

    variance = gen["bloom_variance"]
    reverb_color_mod = hex_factor * variance["reverb_color"] * (0.8 + seed_norm * 0.4)
    decay_rate_mod = hex_factor * variance["decay_mod"] * (0.7 + seed_norm * 0.6)

    return {
        "reverb_color_mod": round(reverb_color_mod, 4),
        "decay_rate_mod": round(decay_rate_mod, 4),
        "bloom_seed": seed_hash,
        "hex_factor": round(hex_factor, 3),
    }


@router.get("/trade-circle/generators/catalog")
async def get_generator_catalog(user=Depends(get_current_user)):
    """Get the full generator catalog with tier-gating and ownership status."""
    user_id = user["id"]

    # Get user tier
    tier_doc = await db.mastery_tiers.find_one({"user_id": user_id}, {"_id": 0})
    tier_name = tier_doc.get("balance_tier", "observer") if tier_doc else "observer"
    tier_idx = TIERS.index(tier_name) if tier_name in TIERS else 0

    # Get user credits
    u = await db.users.find_one({"id": user_id}, {"_id": 0, "user_credit_balance": 1})
    credits = u.get("user_credit_balance", 0) if u else 0

    # Get owned generators
    owned_docs = await db.user_generators.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(50)
    owned_ids = {d["generator_id"] for d in owned_docs}

    catalog = []
    for gen in GENERATOR_CATALOG:
        req_tier_idx = TIERS.index(gen["tier_required"]) if gen["tier_required"] in TIERS else 0
        entry = {
            "id": gen["id"],
            "name": gen["name"],
            "type": gen["type"],
            "description": gen["description"],
            "tier_required": gen["tier_required"],
            "price_credits": gen["price_credits"],
            "owned": gen["id"] in owned_ids,
            "tier_locked": tier_idx < req_tier_idx,
            "can_afford": credits >= gen["price_credits"],
        }
        catalog.append(entry)

    return {
        "catalog": catalog,
        "user_tier": tier_name,
        "user_credits": credits,
    }


@router.post("/trade-circle/purchase")
async def purchase_generator(data: dict = Body(...), user=Depends(get_current_user)):
    """Purchase a generator using Trade Circle credits.
    Validates: Tier Gating -> Credit Balance -> Deduct Credits -> Unlock Asset."""
    generator_id = data.get("generatorId", "")
    user_id = user["id"]

    gen = GENERATOR_MAP.get(generator_id)
    if not gen:
        raise HTTPException(status_code=404, detail="Generator not found in catalog")

    # 1. Tier Gating
    tier_doc = await db.mastery_tiers.find_one({"user_id": user_id}, {"_id": 0})
    tier_name = tier_doc.get("balance_tier", "observer") if tier_doc else "observer"
    tier_idx = TIERS.index(tier_name) if tier_name in TIERS else 0
    req_tier_idx = TIERS.index(gen["tier_required"]) if gen["tier_required"] in TIERS else 0

    if tier_idx < req_tier_idx:
        raise HTTPException(
            status_code=403,
            detail=f"Requires {gen['tier_required'].title()} tier. Current: {tier_name.title()}."
        )

    # 2. Check already owned
    existing = await db.user_generators.find_one(
        {"user_id": user_id, "generator_id": generator_id}
    )
    if existing:
        raise HTTPException(status_code=400, detail="Generator already owned")

    # 3. Credit Balance
    u = await db.users.find_one({"id": user_id}, {"_id": 0, "user_credit_balance": 1})
    current_credits = u.get("user_credit_balance", 0) if u else 0
    if current_credits < gen["price_credits"]:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient credits. Need {gen['price_credits']}, have {current_credits}."
        )

    # 4. Deduct Credits
    await db.users.update_one(
        {"id": user_id},
        {"$inc": {"user_credit_balance": -gen["price_credits"]}}
    )

    # 5. Unlock Asset — compute bloom coefficients
    hex_doc = await db.hexagram_journal.find_one(
        {"user_id": user_id}, {"_id": 0, "hexagram_id": 1}
    )
    hex_number = hex_doc.get("hexagram_id", 1) if hex_doc else 1
    bloom = compute_bloom_coefficients(user_id, generator_id, hex_number)

    ownership = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "generator_id": generator_id,
        "generator_name": gen["name"],
        "generator_type": gen["type"],
        "params": gen["params"],
        "bloom_coefficients": bloom,
        "purchased_at": datetime.now(timezone.utc).isoformat(),
        "active": True,
    }

    await db.user_generators.insert_one(ownership)
    ownership.pop("_id", None)

    # Log transaction
    await db.generator_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "generator_id": generator_id,
        "credits_spent": gen["price_credits"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    await create_activity(user_id, "generator_purchase", f"Unlocked: {gen['name']}")

    return {
        "purchased": gen["name"],
        "generator": ownership,
        "credits_remaining": current_credits - gen["price_credits"],
    }


@router.get("/vault/generators")
async def get_vault_generators(user=Depends(get_current_user)):
    """Returns owned generators with their Bloom variance coefficients."""
    user_id = user["id"]

    owned = await db.user_generators.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(50)

    # Recompute bloom with current hexagram state
    hex_doc = await db.hexagram_journal.find_one(
        {"user_id": user_id}, {"_id": 0, "hexagram_id": 1}
    )
    hex_number = hex_doc.get("hexagram_id", 1) if hex_doc else 1

    generators = []
    for g in owned:
        bloom = compute_bloom_coefficients(user_id, g["generator_id"], hex_number)
        gen_def = GENERATOR_MAP.get(g["generator_id"], {})
        generators.append({
            "id": g["generator_id"],
            "name": g.get("generator_name", ""),
            "type": g.get("generator_type", ""),
            "params": g.get("params", {}),
            "bloom_coefficients": bloom,
            "active": g.get("active", True),
            "purchased_at": g.get("purchased_at", ""),
            "description": gen_def.get("description", ""),
        })

    return {"generators": generators, "hexagram_number": hex_number}


@router.post("/vault/generators/toggle")
async def toggle_generator(data: dict = Body(...), user=Depends(get_current_user)):
    """Toggle a generator on/off."""
    generator_id = data.get("generatorId", "")
    user_id = user["id"]

    doc = await db.user_generators.find_one(
        {"user_id": user_id, "generator_id": generator_id}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Generator not owned")

    new_active = not doc.get("active", True)
    await db.user_generators.update_one(
        {"user_id": user_id, "generator_id": generator_id},
        {"$set": {"active": new_active}}
    )

    return {"generator_id": generator_id, "active": new_active}
