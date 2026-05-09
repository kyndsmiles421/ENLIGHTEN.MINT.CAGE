import secrets
"""
Quantum Mechanics — Gameplay Systems.
Implements superposition (Shadow Sprites), quantum tunneling (layer traversal),
and entanglement bonds (player linking).

Shadow Sprites exist in superposition at GPS hotspot locations.
Players must physically "observe" (visit the hotspot) to collapse
the sprite into a tangible quest objective.
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone, timedelta
from routes.consciousness import level_from_consciousness_xp
import hashlib
import random
import uuid
import math

router = APIRouter(prefix="/quantum")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  SHADOW SPRITE DEFINITIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SHADOW_TYPES = [
    {
        "type": "echo",
        "name": "Shadow Echo",
        "description": "A faint reflection of unprocessed experience. Integrate it to stabilize the local frequency.",
        "rarity": "common",
        "dust_range": (8, 20),
        "xp": 20,
        "integration_prompt": "What pattern do you keep repeating?",
    },
    {
        "type": "fragment",
        "name": "Shadow Fragment",
        "description": "A crystallized piece of the unconscious. Heavier, more resistant to observation.",
        "rarity": "uncommon",
        "dust_range": (20, 45),
        "xp": 40,
        "integration_prompt": "What are you afraid to acknowledge?",
    },
    {
        "type": "archetype",
        "name": "Archetypal Shadow",
        "description": "A fully formed unconscious pattern. Its collapse reveals deep psychic material.",
        "rarity": "rare",
        "dust_range": (45, 90),
        "xp": 80,
        "integration_prompt": "What part of yourself have you denied?",
    },
    {
        "type": "doppelganger",
        "name": "The Doppelganger",
        "description": "Your quantum mirror — the complete inversion of your conscious identity.",
        "rarity": "legendary",
        "dust_range": (90, 200),
        "xp": 200,
        "integration_prompt": "If you met yourself as a stranger, what would you see?",
    },
]

SHADOW_TYPE_MAP = {s["type"]: s for s in SHADOW_TYPES}

RARITY_WEIGHTS = {"common": 50, "uncommon": 30, "rare": 15, "legendary": 5}

TUNNELING_COSTS = {
    "crust_to_mantle": {"dust": 25, "label": "Surface → Mantle"},
    "mantle_to_outer_core": {"dust": 50, "label": "Mantle → Plasma Sea"},
    "outer_core_to_hollow_earth": {"dust": 100, "label": "Plasma Sea → Hollow Earth"},
    "reverse": {"dust": 10, "label": "Ascending (any direction)"},
}

LAYER_ORDER = ["crust", "mantle", "outer_core", "hollow_earth"]


def _haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _generate_shadow_sprites(uid, lat, lng, count=3):
    """Generate shadow sprites in superposition near GPS coordinates.
    
    V1.2.1 — The first sprite is always placed within the observe_radius_m
    (≤30m), guaranteeing every user has at least one collapsible shadow.
    Subsequent sprites scatter up to 500m away for hunt mechanics.
    """
    now = datetime.now(timezone.utc)
    window = now.strftime("%Y-%m-%d-%H")
    sprites = []
    for i in range(count):
        seed = hashlib.sha256(f"{uid}-shadow-{window}-{i}".encode()).hexdigest()
        rng = random.Random(seed)

        # Select rarity
        roll = rng.randint(1, 100)
        cumulative = 0
        chosen_rarity = "common"
        for rarity, weight in RARITY_WEIGHTS.items():
            cumulative += weight
            if roll <= cumulative:
                chosen_rarity = rarity
                break

        matching = [s for s in SHADOW_TYPES if s["rarity"] == chosen_rarity]
        shadow = rng.choice(matching) if matching else SHADOW_TYPES[0]

        # First sprite: guaranteed within 30m so the mechanic always works.
        # Subsequent sprites: scattered up to 500m for hunt gameplay.
        if i == 0:
            # ~0.00018 deg ≈ 20m at equator — keeps it < 30m on every latitude
            offset_lat = rng.uniform(-0.00018, 0.00018)
            offset_lng = rng.uniform(-0.00018, 0.00018)
        else:
            offset_lat = rng.uniform(-0.004, 0.004)
            offset_lng = rng.uniform(-0.004, 0.004)
        s_lat = lat + offset_lat
        s_lng = lng + offset_lng
        dist = _haversine(lat, lng, s_lat, s_lng)

        sprites.append({
            "sprite_id": f"shadow_{seed[:12]}",
            "type": shadow["type"],
            "name": shadow["name"],
            "description": shadow["description"],
            "rarity": shadow["rarity"],
            "lat": round(s_lat, 6),
            "lng": round(s_lng, 6),
            "distance_m": round(dist, 1),
            "state": "superposition",
            "integration_prompt": shadow["integration_prompt"],
            "dust_range": shadow["dust_range"],
            "xp": shadow["xp"],
            "window": window,
        })

    return sprites


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  SUPERPOSITION — SHADOW SPRITES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/shadows/nearby")
async def get_nearby_shadows(lat: float, lng: float, user=Depends(get_current_user)):
    """Get shadow sprites in superposition near the user's location."""
    uid = user["id"]
    sprites = _generate_shadow_sprites(uid, lat, lng, count=3)

    # Check which ones this user has already collapsed
    collapsed_doc = await db.quantum_shadows.find_one({"user_id": uid}, {"_id": 0})
    collapsed_ids = {c["sprite_id"] for c in (collapsed_doc or {}).get("collapsed", [])}

    for s in sprites:
        if s["sprite_id"] in collapsed_ids:
            s["state"] = "collapsed"

    return {
        "sprites": sprites,
        "total_in_superposition": sum(1 for s in sprites if s["state"] == "superposition"),
        "observe_radius_m": 50,
    }


@router.post("/shadows/observe")
async def observe_shadow(
    sprite_id: str = Body(...),
    lat: float = Body(...),
    lng: float = Body(...),
    user=Depends(get_current_user),
):
    """
    Collapse a shadow sprite's wave function by observing it at the GPS location.
    The player must be within 50m of the sprite.
    """
    uid = user["id"]

    # Regenerate sprites to verify this sprite exists and get its data
    sprites = _generate_shadow_sprites(uid, lat, lng, count=3)
    target = None
    for s in sprites:
        if s["sprite_id"] == sprite_id:
            target = s
            break

    if not target:
        raise HTTPException(404, "Shadow sprite not found in this quantum field")

    # Check distance
    dist = _haversine(lat, lng, target["lat"], target["lng"])
    if dist > 50:
        raise HTTPException(400, f"Too far to observe ({int(dist)}m). Must be within 50m.")

    # Check if already collapsed
    collapsed_doc = await db.quantum_shadows.find_one({"user_id": uid}, {"_id": 0})
    collapsed_ids = {c["sprite_id"] for c in (collapsed_doc or {}).get("collapsed", [])}
    if sprite_id in collapsed_ids:
        raise HTTPException(400, "This shadow has already been collapsed")

    # Collapse the wave function
    shadow_def = SHADOW_TYPE_MAP.get(target["type"], SHADOW_TYPES[0])
    dust_min, dust_max = shadow_def["dust_range"]
    dust_reward = secrets.randbelow(dust_max - dust_min + 1) + dust_min
    xp_reward = shadow_def["xp"]
    now = datetime.now(timezone.utc).isoformat()

    collapse_entry = {
        "sprite_id": sprite_id,
        "type": target["type"],
        "rarity": target["rarity"],
        "dust_earned": dust_reward,
        "xp_earned": xp_reward,
        "timestamp": now,
        "lat": lat,
        "lng": lng,
    }

    await db.quantum_shadows.update_one(
        {"user_id": uid},
        {
            "$push": {"collapsed": collapse_entry},
            "$inc": {"total_collapsed": 1, "total_dust": dust_reward},
            "$set": {"user_id": uid},
        },
        upsert=True,
    )

    # Grant rewards
    await db.users.update_one(
        {"id": uid},
        {
            "$inc": {"user_dust_balance": dust_reward, "consciousness.xp": xp_reward},
            "$push": {
                "consciousness.activity_log": {
                    "type": "shadow_collapse",
                    "xp": xp_reward,
                    "rarity": target["rarity"],
                    "timestamp": now,
                }
            },
        },
    )
    # V68.7 — Trade Ledger dust event
    await db.dust_events.insert_one({
        "user_id": uid, "amount": dust_reward, "kind": "earn",
        "source": f"quantum:shadow_collapse:{target.get('rarity','common')}", "ts": now,
    })

    return {
        "success": True,
        "collapsed": True,
        "sprite": {
            "sprite_id": sprite_id,
            "type": target["type"],
            "name": target["name"],
            "rarity": target["rarity"],
            "state": "collapsed",
            "integration_prompt": shadow_def["integration_prompt"],
        },
        "rewards": {
            "dust": dust_reward,
            "xp": xp_reward,
        },
        "message": f"Wave function collapsed. The {target['name']} reveals itself.",
    }


@router.get("/shadows/history")
async def shadow_history(user=Depends(get_current_user)):
    """Get the user's shadow collapse history."""
    uid = user["id"]
    doc = await db.quantum_shadows.find_one({"user_id": uid}, {"_id": 0})
    collapsed = (doc or {}).get("collapsed", [])

    return {
        "total_collapsed": len(collapsed),
        "total_dust": sum(c.get("dust_earned", 0) for c in collapsed),
        "total_xp": sum(c.get("xp_earned", 0) for c in collapsed),
        "history": collapsed[-20:],
        "by_rarity": {
            r: sum(1 for c in collapsed if c.get("rarity") == r)
            for r in ["common", "uncommon", "rare", "legendary"]
        },
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  QUANTUM TUNNELING — LAYER TRAVERSAL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post("/tunnel")
async def quantum_tunnel(
    target_layer: str = Body(..., embed=True),
    user=Depends(get_current_user),
):
    """
    Quantum tunnel between planetary layers.
    Costs Cosmic Dust based on direction and distance.
    Bypasses sequential descent — teleport directly.
    """
    uid = user["id"]
    if target_layer not in LAYER_ORDER:
        raise HTTPException(400, f"Unknown layer: {target_layer}")

    u = await db.users.find_one({"id": uid}, {"_id": 0, "consciousness": 1, "user_dust_balance": 1})
    xp = (u or {}).get("consciousness", {}).get("xp", 0)
    level = level_from_consciousness_xp(xp)
    dust = (u or {}).get("user_dust_balance", 0)

    # Tunneling requires consciousness level 2+
    if level < 2:
        raise HTTPException(403, "Quantum Tunneling requires consciousness level 2+")

    depth_doc = await db.planetary_depth.find_one({"user_id": uid}, {"_id": 0})
    current = (depth_doc or {}).get("current_layer", "crust")

    if current == target_layer:
        raise HTTPException(400, "Already at this layer")

    current_idx = LAYER_ORDER.index(current)
    target_idx = LAYER_ORDER.index(target_layer)
    descending = target_idx > current_idx

    # Calculate cost
    if descending:
        layers_crossed = target_idx - current_idx
        cost = layers_crossed * 40
    else:
        cost = 10  # Ascending is cheap

    if dust < cost:
        raise HTTPException(400, f"Need {cost} Cosmic Dust (have {dust})")

    # Layer consciousness check
    layer_reqs = {"crust": 1, "mantle": 2, "outer_core": 3, "hollow_earth": 4}
    if level < layer_reqs.get(target_layer, 1):
        raise HTTPException(403, f"Layer requires consciousness level {layer_reqs[target_layer]}")

    now = datetime.now(timezone.utc).isoformat()

    # Deduct cost and move
    await db.users.update_one({"id": uid}, {"$inc": {"user_dust_balance": -cost}})
    # V68.7 — Trade Ledger dust event (spend)
    await db.dust_events.insert_one({
        "user_id": uid, "amount": -cost, "kind": "spend",
        "source": f"quantum:tunnel:{target_layer}", "ts": now,
    })

    unlocked = (depth_doc or {}).get("unlocked_layers", ["crust"])
    if target_layer not in unlocked:
        unlocked.append(target_layer)

    tunnel_entry = {
        "id": str(uuid.uuid4())[:8],
        "from_layer": current,
        "to_layer": target_layer,
        "method": "quantum_tunnel",
        "dust_cost": cost,
        "timestamp": now,
    }

    archetype_map = {"crust": "persona", "mantle": "shadow", "outer_core": "anima", "hollow_earth": "self"}
    new_psyche = archetype_map.get(target_layer, "persona")

    await db.planetary_depth.update_one(
        {"user_id": uid},
        {
            "$set": {
                "user_id": uid,
                "current_layer": target_layer,
                "psyche_state": new_psyche,
                "last_descent": now,
                "unlocked_layers": list(set(unlocked)),
            },
            "$push": {"descent_history": tunnel_entry},
            "$inc": {"total_descents": 1, "total_tunnels": 1},
        },
        upsert=True,
    )

    # XP for tunneling
    xp_reward = 15 * (target_idx + 1)
    await db.users.update_one(
        {"id": uid},
        {
            "$inc": {"consciousness.xp": xp_reward},
            "$push": {
                "consciousness.activity_log": {
                    "type": "quantum_tunnel",
                    "xp": xp_reward,
                    "from": current,
                    "to": target_layer,
                    "timestamp": now,
                }
            },
        },
    )

    return {
        "success": True,
        "tunnel": {
            "from_layer": current,
            "to_layer": target_layer,
            "dust_cost": cost,
            "direction": "descending" if descending else "ascending",
            "layers_crossed": abs(target_idx - current_idx),
        },
        "new_state": {
            "current_layer": target_layer,
            "psyche_state": new_psyche,
            "dust_remaining": dust - cost,
        },
        "rewards": {"xp": xp_reward},
        "message": f"Probability density shifted. You tunnel through to {target_layer.replace('_', ' ').title()}.",
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ENTANGLEMENT BONDS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post("/entangle")
async def create_entanglement(
    target_user_id: str = Body(..., embed=True),
    user=Depends(get_current_user),
):
    """
    Create a quantum entanglement bond between two players.
    Actions on one affect the other regardless of distance or layer.
    """
    uid = user["id"]
    if uid == target_user_id:
        raise HTTPException(400, "Cannot entangle with yourself")

    target = await db.users.find_one({"id": target_user_id}, {"_id": 0, "id": 1, "name": 1})
    if not target:
        raise HTTPException(404, "Target user not found")

    # Check if already entangled
    existing = await db.quantum_entanglements.find_one({
        "$or": [
            {"user_a": uid, "user_b": target_user_id, "active": True},
            {"user_a": target_user_id, "user_b": uid, "active": True},
        ]
    })
    if existing:
        raise HTTPException(400, "Already entangled with this user")

    # Max 3 active entanglements
    count = await db.quantum_entanglements.count_documents({
        "$or": [{"user_a": uid, "active": True}, {"user_b": uid, "active": True}]
    })
    if count >= 3:
        raise HTTPException(400, "Maximum 3 active entanglements")

    now = datetime.now(timezone.utc).isoformat()
    bond_id = str(uuid.uuid4())[:12]

    bond = {
        "bond_id": bond_id,
        "user_a": uid,
        "user_b": target_user_id,
        "created_at": now,
        "active": True,
        "resonance_score": 0,
        "shared_events": [],
    }

    await db.quantum_entanglements.insert_one(bond)

    return {
        "success": True,
        "bond_id": bond_id,
        "entangled_with": target.get("name", "Unknown"),
        "message": "Quantum entanglement established. Your states are now correlated across all layers.",
    }


@router.get("/entanglements")
async def get_entanglements(user=Depends(get_current_user)):
    """Get all active entanglement bonds for the user."""
    uid = user["id"]
    bonds_cursor = db.quantum_entanglements.find(
        {"$or": [{"user_a": uid}, {"user_b": uid}], "active": True},
        {"_id": 0},
    )
    bonds = await bonds_cursor.to_list(length=10)

    result = []
    for b in bonds:
        partner_id = b["user_b"] if b["user_a"] == uid else b["user_a"]
        partner = await db.users.find_one({"id": partner_id}, {"_id": 0, "name": 1, "avatar": 1})
        depth_doc = await db.planetary_depth.find_one({"user_id": partner_id}, {"_id": 0})
        result.append({
            "bond_id": b["bond_id"],
            "partner_name": (partner or {}).get("name", "Unknown"),
            "partner_avatar": (partner or {}).get("avatar"),
            "partner_layer": (depth_doc or {}).get("current_layer", "crust"),
            "resonance_score": b.get("resonance_score", 0),
            "created_at": b["created_at"],
            "shared_events": len(b.get("shared_events", [])),
        })

    return {"entanglements": result, "count": len(result), "max": 3}


@router.get("/tunneling-costs")
async def get_tunneling_costs(user=Depends(get_current_user)):
    """Get the cost table for quantum tunneling."""
    uid = user["id"]
    u = await db.users.find_one({"id": uid}, {"_id": 0, "user_dust_balance": 1, "consciousness": 1})
    dust = (u or {}).get("user_dust_balance", 0)
    xp = (u or {}).get("consciousness", {}).get("xp", 0)
    level = level_from_consciousness_xp(xp)

    depth_doc = await db.planetary_depth.find_one({"user_id": uid}, {"_id": 0})
    current = (depth_doc or {}).get("current_layer", "crust")
    current_idx = LAYER_ORDER.index(current) if current in LAYER_ORDER else 0

    costs = []
    for i, layer in enumerate(LAYER_ORDER):
        if layer == current:
            continue
        descending = i > current_idx
        layers_crossed = abs(i - current_idx)
        cost = layers_crossed * 40 if descending else 10
        layer_reqs = {"crust": 1, "mantle": 2, "outer_core": 3, "hollow_earth": 4}
        costs.append({
            "target": layer,
            "cost": cost,
            "direction": "descend" if descending else "ascend",
            "layers_crossed": layers_crossed,
            "affordable": dust >= cost,
            "consciousness_met": level >= layer_reqs.get(layer, 1),
            "consciousness_required": layer_reqs.get(layer, 1),
        })

    return {
        "current_layer": current,
        "dust_balance": dust,
        "consciousness_level": level,
        "tunneling_unlocked": level >= 2,
        "costs": costs,
    }
