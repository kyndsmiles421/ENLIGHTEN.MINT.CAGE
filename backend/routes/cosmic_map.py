"""
Cosmic Map, Forge Mini-Game, and Exponential Decay Engine
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
import math
import hashlib
import random
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from typing import Optional

from routes.auth import get_current_user
from deps import db

router = APIRouter(prefix="/cosmic-map", tags=["cosmic-map"])


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  EXPONENTIAL DECAY ENGINE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DECAY_RATE = 0.9  # y = a * 0.9^days_inactive
MIN_RESONANCE_FLOOR = 5  # never decay below this


async def calculate_decay(user_id: str):
    """Calculate and apply exponential decay to Science Resonance."""
    prog = await db.avenue_progress.find_one({"user_id": user_id}, {"_id": 0})
    if not prog:
        return {"decayed": False, "reason": "no_progress"}

    last_activity = await db.user_activity_log.find_one(
        {"user_id": user_id},
        {"_id": 0},
        sort=[("timestamp", -1)],
    )

    if not last_activity:
        return {"decayed": False, "reason": "no_activity_log"}

    last_ts = last_activity.get("timestamp", "")
    try:
        last_dt = datetime.fromisoformat(last_ts.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return {"decayed": False, "reason": "invalid_timestamp"}

    now = datetime.now(timezone.utc)
    days_inactive = (now - last_dt).total_seconds() / 86400

    if days_inactive < 1.0:
        return {
            "decayed": False,
            "days_inactive": round(days_inactive, 2),
            "decay_factor": 1.0,
            "message": "Active — no decay",
        }

    decay_factor = DECAY_RATE ** days_inactive
    sci_res = prog.get("science", {}).get("resonance", 0)
    hist_res = prog.get("history", {}).get("resonance", 0)

    new_sci = max(MIN_RESONANCE_FLOOR, round(sci_res * decay_factor))
    new_hist = max(MIN_RESONANCE_FLOOR, round(hist_res * decay_factor))
    sci_lost = sci_res - new_sci
    hist_lost = hist_res - new_hist

    if sci_lost > 0 or hist_lost > 0:
        updates = {}
        if sci_lost > 0:
            updates["science.resonance"] = new_sci
        if hist_lost > 0:
            updates["history.resonance"] = new_hist
        await db.avenue_progress.update_one(
            {"user_id": user_id},
            {"$set": updates},
        )

    return {
        "decayed": sci_lost > 0 or hist_lost > 0,
        "days_inactive": round(days_inactive, 2),
        "decay_factor": round(decay_factor, 4),
        "science_lost": sci_lost,
        "history_lost": hist_lost,
        "new_science_resonance": new_sci,
        "new_history_resonance": new_hist,
        "pulse_speed": min(3.0, 0.5 + (days_inactive * 0.3)),
    }


@router.get("/decay-status")
async def get_decay_status(user=Depends(get_current_user)):
    """Check current decay status without applying it."""
    uid = user["id"]
    prog = await db.avenue_progress.find_one({"user_id": uid}, {"_id": 0})
    last_activity = await db.user_activity_log.find_one(
        {"user_id": uid}, {"_id": 0}, sort=[("timestamp", -1)],
    )

    sci_res = (prog or {}).get("science", {}).get("resonance", 0)
    hist_res = (prog or {}).get("history", {}).get("resonance", 0)

    if not last_activity:
        days_inactive = 0
    else:
        last_ts = last_activity.get("timestamp", "")
        try:
            last_dt = datetime.fromisoformat(last_ts.replace("Z", "+00:00"))
            days_inactive = (datetime.now(timezone.utc) - last_dt).total_seconds() / 86400
        except (ValueError, AttributeError):
            days_inactive = 0

    decay_factor = DECAY_RATE ** max(0, days_inactive - 1) if days_inactive > 1 else 1.0
    projected_sci = max(MIN_RESONANCE_FLOOR, round(sci_res * decay_factor))
    projected_hist = max(MIN_RESONANCE_FLOOR, round(hist_res * decay_factor))

    at_risk = days_inactive > 0.5
    pulse_speed = min(3.0, 0.5 + (days_inactive * 0.3)) if at_risk else 0

    return {
        "science_resonance": sci_res,
        "history_resonance": hist_res,
        "days_inactive": round(days_inactive, 2),
        "decay_active": days_inactive >= 1.0,
        "at_risk": at_risk,
        "decay_factor": round(decay_factor, 4),
        "projected_science": projected_sci,
        "projected_history": projected_hist,
        "pulse_speed": round(pulse_speed, 2),
        "message": "Resonance stable" if not at_risk else f"Decay warning: {round(days_inactive,1)} days since last activity",
    }


@router.post("/apply-decay")
async def apply_decay(user=Depends(get_current_user)):
    """Apply exponential decay (called on app open)."""
    return await calculate_decay(user["id"])


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  FORGE MINI-GAME
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORGE_PATTERNS = {
    "kinetic_amplifier": {
        "name": "Kinetic Amplifier",
        "frequency": 432,
        "waveform": [0.0, 0.5, 1.0, 0.7, 0.3, 0.8, 0.2, 0.9, 0.4, 0.6, 1.0, 0.5, 0.0],
        "tolerance": 0.15,
        "time_limit_seconds": 12,
    },
    "zen_flow": {
        "name": "Zen Flow",
        "frequency": 528,
        "waveform": [0.0, 0.3, 0.6, 0.9, 1.0, 0.9, 0.6, 0.3, 0.0, 0.3, 0.6, 0.9, 1.0],
        "tolerance": 0.12,
        "time_limit_seconds": 10,
    },
    "chrono_alchemist": {
        "name": "Chrono-Alchemist",
        "frequency": 396,
        "waveform": [0.5, 0.8, 0.2, 1.0, 0.0, 0.7, 0.3, 0.9, 0.1, 0.6, 0.4, 0.8, 0.5],
        "tolerance": 0.10,
        "time_limit_seconds": 8,
    },
}


@router.get("/forge/pattern/{build_id}")
async def get_forge_pattern(build_id: str, user=Depends(get_current_user)):
    """Get the waveform pattern for a forge mini-game."""
    pattern = FORGE_PATTERNS.get(build_id)
    if not pattern:
        raise HTTPException(404, "Forge pattern not found")

    return {
        "build_id": build_id,
        "name": pattern["name"],
        "frequency": pattern["frequency"],
        "waveform": pattern["waveform"],
        "tolerance": pattern["tolerance"],
        "time_limit_seconds": pattern["time_limit_seconds"],
        "points_count": len(pattern["waveform"]),
    }


class ForgeAttempt(BaseModel):
    build_id: str
    user_waveform: list[float]
    time_taken_seconds: float


@router.post("/forge/attempt")
async def attempt_forge(attempt: ForgeAttempt, user=Depends(get_current_user)):
    """Validate a forge attempt by comparing waveform match."""
    uid = user["id"]
    pattern = FORGE_PATTERNS.get(attempt.build_id)
    if not pattern:
        raise HTTPException(404, "Forge pattern not found")

    # Check if already crafted
    existing = await db.resonance_builds.find_one(
        {"user_id": uid, "build_id": attempt.build_id}, {"_id": 0}
    )
    if existing:
        raise HTTPException(400, "Already crafted")

    # Check required items
    from routes.science_history import RESONANCE_BUILDS
    build_def = None
    for b in RESONANCE_BUILDS:
        if b["id"] == attempt.build_id:
            build_def = b
            break
    if not build_def:
        raise HTTPException(404, "Build definition not found")

    purchases = await db.economy_purchases.find({"user_id": uid}, {"_id": 0}).to_list(200)
    owned_ids = {p["item_id"] for p in purchases}
    missing = [r for r in build_def["required_items"] if r not in owned_ids]
    if missing:
        raise HTTPException(400, f"Missing items: {', '.join(missing)}")

    # Compare waveforms
    target = pattern["waveform"]
    user_wave = attempt.user_waveform
    tolerance = pattern["tolerance"]

    if len(user_wave) != len(target):
        raise HTTPException(400, f"Waveform must have exactly {len(target)} points")

    total_error = 0.0
    point_scores = []
    for i, (t, u) in enumerate(zip(target, user_wave)):
        error = abs(t - u)
        score = max(0, 1.0 - (error / tolerance)) if error <= tolerance else 0
        total_error += error
        point_scores.append(round(score, 2))

    accuracy = sum(point_scores) / len(point_scores) * 100
    time_ok = attempt.time_taken_seconds <= pattern["time_limit_seconds"]
    time_bonus = max(0, 1.0 - (attempt.time_taken_seconds / pattern["time_limit_seconds"])) * 10

    total_score = round(accuracy + time_bonus, 1)
    forged = accuracy >= 70 and time_ok

    if forged:
        now = datetime.now(timezone.utc).isoformat()
        await db.resonance_builds.insert_one({
            "user_id": uid,
            "build_id": attempt.build_id,
            "build_name": build_def["name"],
            "bonus_type": build_def["bonus_type"],
            "bonus_value": build_def["bonus_value"],
            "crafted_at": now,
            "forge_score": total_score,
            "forge_accuracy": round(accuracy, 1),
        })
        # Log activity
        await db.user_activity_log.insert_one({
            "user_id": uid,
            "type": "forge",
            "detail": f"Forged {build_def['name']}",
            "timestamp": now,
        })

    return {
        "forged": forged,
        "accuracy": round(accuracy, 1),
        "time_bonus": round(time_bonus, 1),
        "total_score": total_score,
        "point_scores": point_scores,
        "time_ok": time_ok,
        "time_taken": round(attempt.time_taken_seconds, 1),
        "time_limit": pattern["time_limit_seconds"],
        "message": f"Forged: {build_def['name']}!" if forged else "Waveform mismatch — realign and retry",
        "bonus": f"{build_def['bonus_type']}: {build_def['bonus_value']}x" if forged else None,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  COSMIC MAP — GPS Node Generation
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NODE_TYPES = {
    "kinetic": {
        "avenue": "material",
        "name_prefix": "Kinetic Node",
        "names": [
            "Torque Vortex", "Velocity Pocket", "Gear Nexus",
            "Momentum Well", "Drive Resonance", "Crank Matrix",
        ],
        "color": "#F59E0B",
        "reward_type": "kinetic_dust",
        "base_reward": 8,
        "icon": "zap",
    },
    "botanical": {
        "avenue": "living",
        "name_prefix": "Botanical Spot",
        "names": [
            "Wild Aquafaba Grove", "Monk Fruit Clearing", "Lychee Bloom",
            "Hemp Meadow", "Pectin Spring", "Coconut Sanctuary",
        ],
        "color": "#2DD4BF",
        "reward_type": "science_resonance",
        "base_reward": 5,
        "icon": "leaf",
    },
    "star_anchor": {
        "avenue": "ancestral",
        "name_prefix": "Star Anchor",
        "names": [
            "Orion's Gate", "Sirius Nexus", "Pleiades Beacon",
            "Vega Alignment", "Polaris Lock", "Antares Bridge",
        ],
        "color": "#8B5CF6",
        "reward_type": "science_resonance",
        "base_reward": 7,
        "icon": "star",
    },
}


def generate_nodes_for_location(lat: float, lng: float, radius_km: float = 1.0):
    """Procedurally generate nodes based on coordinates with daily seed consistency."""
    day_seed = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    nodes = []

    for node_type_key, node_type in NODE_TYPES.items():
        count = 4 if node_type_key == "kinetic" else 3
        for i in range(count):
            seed_str = f"{day_seed}_{node_type_key}_{i}_{round(lat, 2)}_{round(lng, 2)}"
            seed_hash = hashlib.md5(seed_str.encode()).hexdigest()
            rng = random.Random(seed_hash)

            angle = rng.uniform(0, 2 * math.pi)
            dist = rng.uniform(0.1, radius_km)
            dlat = dist / 111.32 * math.cos(angle)
            dlng = dist / (111.32 * math.cos(math.radians(lat))) * math.sin(angle)

            node_lat = lat + dlat
            node_lng = lng + dlng

            name_idx = rng.randint(0, len(node_type["names"]) - 1)
            rarity = rng.choice(["common", "common", "uncommon", "uncommon", "rare"])
            reward_mult = {"common": 1.0, "uncommon": 1.5, "rare": 2.5}[rarity]

            nodes.append({
                "id": seed_hash[:12],
                "type": node_type_key,
                "avenue": node_type["avenue"],
                "name": node_type["names"][name_idx],
                "lat": round(node_lat, 6),
                "lng": round(node_lng, 6),
                "color": node_type["color"],
                "icon": node_type["icon"],
                "rarity": rarity,
                "reward_type": node_type["reward_type"],
                "reward_amount": round(node_type["base_reward"] * reward_mult),
                "harvest_radius_meters": 50,
            })

    return nodes


class LocationRequest(BaseModel):
    lat: float
    lng: float
    radius_km: Optional[float] = 1.0


@router.post("/nodes")
async def get_nearby_nodes(loc: LocationRequest, user=Depends(get_current_user)):
    """Get procedurally generated nodes near the user's location."""
    uid = user["id"]
    nodes = generate_nodes_for_location(loc.lat, loc.lng, loc.radius_km or 1.0)

    # Check which nodes have already been harvested today
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    harvested = await db.node_harvests.find(
        {"user_id": uid, "date": today}, {"_id": 0, "node_id": 1}
    ).to_list(100)
    harvested_ids = {h["node_id"] for h in harvested}

    for node in nodes:
        node["harvested"] = node["id"] in harvested_ids

    return {
        "nodes": nodes,
        "total": len(nodes),
        "harvested_count": len(harvested_ids),
        "center": {"lat": loc.lat, "lng": loc.lng},
    }


class HarvestRequest(BaseModel):
    node_id: str
    user_lat: float
    user_lng: float


@router.post("/harvest")
async def harvest_node(req: HarvestRequest, user=Depends(get_current_user)):
    """Harvest a node if within proximity range."""
    uid = user["id"]
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Check if already harvested
    existing = await db.node_harvests.find_one(
        {"user_id": uid, "node_id": req.node_id, "date": today}, {"_id": 0}
    )
    if existing:
        raise HTTPException(400, "Already harvested today")

    # Generate nodes to find this one
    nodes = generate_nodes_for_location(req.user_lat, req.user_lng, 2.0)
    target = None
    for n in nodes:
        if n["id"] == req.node_id:
            target = n
            break

    if not target:
        raise HTTPException(404, "Node not found near your location")

    # Calculate distance
    dlat = target["lat"] - req.user_lat
    dlng = target["lng"] - req.user_lng
    dist_m = math.sqrt(
        (dlat * 111320) ** 2 + (dlng * 111320 * math.cos(math.radians(req.user_lat))) ** 2
    )

    if dist_m > target["harvest_radius_meters"]:
        raise HTTPException(400, f"Too far. Distance: {round(dist_m)}m. Must be within {target['harvest_radius_meters']}m.")

    # Apply reward
    now = datetime.now(timezone.utc).isoformat()
    reward = target["reward_amount"]

    if target["reward_type"] == "kinetic_dust":
        await db.users.update_one({"id": uid}, {"$inc": {"user_dust_balance": reward}})
    else:
        await db.avenue_progress.update_one(
            {"user_id": uid},
            {"$inc": {"science.resonance": reward}},
            upsert=True,
        )

    # Record harvest
    await db.node_harvests.insert_one({
        "user_id": uid,
        "node_id": req.node_id,
        "node_name": target["name"],
        "node_type": target["type"],
        "reward_type": target["reward_type"],
        "reward_amount": reward,
        "date": today,
        "harvested_at": now,
        "location": {"lat": req.user_lat, "lng": req.user_lng},
    })

    # Log activity (resets decay timer)
    await db.user_activity_log.insert_one({
        "user_id": uid,
        "type": "harvest",
        "detail": f"Harvested {target['name']} (+{reward} {target['reward_type']})",
        "timestamp": now,
    })

    return {
        "success": True,
        "node_name": target["name"],
        "node_type": target["type"],
        "rarity": target["rarity"],
        "reward_type": target["reward_type"],
        "reward_amount": reward,
        "distance_meters": round(dist_m),
        "message": f"Harvested {target['name']}! +{reward} {target['reward_type'].replace('_', ' ').title()}",
    }


@router.get("/harvest-history")
async def get_harvest_history(user=Depends(get_current_user)):
    """Get recent harvest history."""
    uid = user["id"]
    harvests = await db.node_harvests.find(
        {"user_id": uid}, {"_id": 0}
    ).sort("harvested_at", -1).to_list(50)

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    today_harvests = [h for h in harvests if h.get("date") == today]

    return {
        "history": harvests[:20],
        "today_count": len(today_harvests),
        "today_rewards": {
            "kinetic_dust": sum(h["reward_amount"] for h in today_harvests if h["reward_type"] == "kinetic_dust"),
            "science_resonance": sum(h["reward_amount"] for h in today_harvests if h["reward_type"] == "science_resonance"),
        },
        "total_harvests": len(harvests),
    }
