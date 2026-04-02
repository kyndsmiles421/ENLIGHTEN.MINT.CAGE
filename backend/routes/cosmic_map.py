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


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  POWER SPOTS — Admin-Configurable Legendary Nodes
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class PowerSpotCreate(BaseModel):
    name: str
    lat: float
    lng: float
    description: Optional[str] = "Legendary Power Spot"
    reward_multiplier: Optional[float] = 5.0
    harvest_radius_meters: Optional[int] = 100
    active: Optional[bool] = True
    active_hours: Optional[str] = None  # e.g. "08:00-18:00"


@router.get("/power-spots")
async def get_power_spots(user=Depends(get_current_user), include_all: bool = False):
    """Get Power Spots. include_all=true for admin view (shows inactive too)."""
    query = {} if include_all else {"active": True}
    spots = await db.power_spots.find(query, {"_id": 0}).to_list(50)

    uid = user["id"]
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    harvested = await db.node_harvests.find(
        {"user_id": uid, "date": today, "node_type": "power_spot"}, {"_id": 0, "node_id": 1}
    ).to_list(50)
    harvested_ids = {h["node_id"] for h in harvested}

    result = []
    for s in spots:
        result.append({
            "id": s["id"],
            "name": s["name"],
            "lat": s["lat"],
            "lng": s["lng"],
            "description": s.get("description", ""),
            "reward_multiplier": s.get("reward_multiplier", 5.0),
            "harvest_radius_meters": s.get("harvest_radius_meters", 100),
            "active_hours": s.get("active_hours"),
            "active": s.get("active", True),
            "live_tracking": s.get("live_tracking", False),
            "last_location_update": s.get("last_location_update"),
            "color": "#FBBF24",
            "icon": "crown",
            "rarity": "legendary",
            "reward_type": "kinetic_dust",
            "reward_amount": round(8 * s.get("reward_multiplier", 5.0)),
            "harvested": s["id"] in harvested_ids,
            "type": "power_spot",
        })

    return {"power_spots": result, "total": len(result)}


@router.post("/power-spots")
async def create_power_spot(spot: PowerSpotCreate, user=Depends(get_current_user)):
    """Create or update a Power Spot (admin)."""
    spot_id = hashlib.md5(f"{spot.name}_{spot.lat}_{spot.lng}".encode()).hexdigest()[:12]
    now = datetime.now(timezone.utc).isoformat()

    doc = {
        "id": spot_id,
        "name": spot.name,
        "lat": spot.lat,
        "lng": spot.lng,
        "description": spot.description,
        "reward_multiplier": spot.reward_multiplier,
        "harvest_radius_meters": spot.harvest_radius_meters,
        "active": spot.active,
        "active_hours": spot.active_hours,
        "created_by": user["id"],
        "created_at": now,
        "updated_at": now,
    }

    await db.power_spots.update_one(
        {"id": spot_id}, {"$set": doc}, upsert=True,
    )

    return {
        "success": True,
        "id": spot_id,
        "name": spot.name,
        "lat": spot.lat,
        "lng": spot.lng,
        "reward_multiplier": spot.reward_multiplier,
        "message": f"Power Spot '{spot.name}' deployed at ({spot.lat}, {spot.lng}). {spot.reward_multiplier}x multiplier active.",
    }


class PowerSpotUpdate(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    active: Optional[bool] = None
    active_hours: Optional[str] = None
    reward_multiplier: Optional[float] = None
    description: Optional[str] = None


@router.put("/power-spots/{spot_id}")
async def update_power_spot(spot_id: str, update: PowerSpotUpdate, user=Depends(get_current_user)):
    """Update a Power Spot's location or status."""
    existing = await db.power_spots.find_one({"id": spot_id}, {"_id": 0})
    if not existing:
        raise HTTPException(404, "Power Spot not found")

    updates = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if update.lat is not None:
        updates["lat"] = update.lat
    if update.lng is not None:
        updates["lng"] = update.lng
    if update.active is not None:
        updates["active"] = update.active
    if update.active_hours is not None:
        updates["active_hours"] = update.active_hours
    if update.reward_multiplier is not None:
        updates["reward_multiplier"] = update.reward_multiplier
    if update.description is not None:
        updates["description"] = update.description

    await db.power_spots.update_one({"id": spot_id}, {"$set": updates})

    return {
        "success": True,
        "id": spot_id,
        "updated_fields": list(updates.keys()),
        "message": f"Power Spot updated.",
    }


@router.delete("/power-spots/{spot_id}")
async def delete_power_spot(spot_id: str, user=Depends(get_current_user)):
    """Delete a Power Spot."""
    result = await db.power_spots.delete_one({"id": spot_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Power Spot not found")
    return {"success": True, "message": "Power Spot removed."}


@router.post("/power-spots/harvest")
async def harvest_power_spot(
    spot_id: str = Body(...),
    user_lat: float = Body(...),
    user_lng: float = Body(...),
    user=Depends(get_current_user),
):
    """Harvest a Power Spot."""
    uid = user["id"]
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    existing_harvest = await db.node_harvests.find_one(
        {"user_id": uid, "node_id": spot_id, "date": today, "node_type": "power_spot"}, {"_id": 0}
    )
    if existing_harvest:
        raise HTTPException(400, "Already harvested this Power Spot today")

    spot = await db.power_spots.find_one({"id": spot_id, "active": True}, {"_id": 0})
    if not spot:
        raise HTTPException(404, "Power Spot not found or inactive")

    dlat = spot["lat"] - user_lat
    dlng = spot["lng"] - user_lng
    dist_m = math.sqrt(
        (dlat * 111320) ** 2 + (dlng * 111320 * math.cos(math.radians(user_lat))) ** 2
    )
    radius = spot.get("harvest_radius_meters", 100)

    if dist_m > radius:
        raise HTTPException(400, f"Too far. Distance: {round(dist_m)}m. Must be within {radius}m.")

    reward = round(8 * spot.get("reward_multiplier", 5.0))
    now = datetime.now(timezone.utc).isoformat()

    await db.users.update_one({"id": uid}, {"$inc": {"user_dust_balance": reward}})
    await db.node_harvests.insert_one({
        "user_id": uid,
        "node_id": spot_id,
        "node_name": spot["name"],
        "node_type": "power_spot",
        "reward_type": "kinetic_dust",
        "reward_amount": reward,
        "date": today,
        "harvested_at": now,
        "location": {"lat": user_lat, "lng": user_lng},
    })
    await db.user_activity_log.insert_one({
        "user_id": uid, "type": "power_spot_harvest",
        "detail": f"Harvested Power Spot '{spot['name']}' (+{reward} Kinetic Dust)",
        "timestamp": now,
    })

    return {
        "success": True,
        "node_name": spot["name"],
        "reward_type": "kinetic_dust",
        "reward_amount": reward,
        "multiplier": spot.get("reward_multiplier", 5.0),
        "distance_meters": round(dist_m),
        "message": f"Power Spot Harvested: {spot['name']}! +{reward} Kinetic Dust ({spot.get('reward_multiplier', 5)}x legendary bonus)",
    }


@router.post("/power-spots/{spot_id}/go-live")
async def toggle_go_live(
    spot_id: str,
    go_live: bool = Body(..., embed=True),
    user=Depends(get_current_user),
):
    """Toggle Go Live status for a Power Spot. Broadcasts to nearby users."""
    spot = await db.power_spots.find_one({"id": spot_id}, {"_id": 0})
    if not spot:
        raise HTTPException(404, "Power Spot not found")

    now = datetime.now(timezone.utc).isoformat()
    await db.power_spots.update_one(
        {"id": spot_id},
        {"$set": {"active": go_live, "go_live_at": now if go_live else None, "updated_at": now}},
    )

    if go_live:
        # Create a broadcast notification
        await db.broadcasts.insert_one({
            "type": "power_spot_live",
            "spot_id": spot_id,
            "spot_name": spot["name"],
            "lat": spot["lat"],
            "lng": spot["lng"],
            "reward_multiplier": spot.get("reward_multiplier", 5.0),
            "message": f"The {spot['name']} has anchored. {spot.get('reward_multiplier', 5)}x Kinetic Dust active.",
            "created_at": now,
            "created_by": user["id"],
        })

    return {
        "success": True,
        "spot_name": spot["name"],
        "go_live": go_live,
        "message": f"{spot['name']} is {'LIVE' if go_live else 'offline'}.",
    }


@router.get("/broadcasts/active")
async def get_active_broadcasts(user=Depends(get_current_user)):
    """Get active broadcast notifications (last 24h)."""
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    broadcasts = await db.broadcasts.find(
        {"created_at": {"$gte": cutoff}},
        {"_id": 0},
    ).sort("created_at", -1).to_list(10)

    return {"broadcasts": broadcasts, "count": len(broadcasts)}


@router.post("/power-spots/{spot_id}/live-tracking")
async def toggle_live_tracking(
    spot_id: str,
    enabled: bool = Body(..., embed=True),
    user=Depends(get_current_user),
):
    """Toggle live GPS tracking on/off for a Power Spot."""
    spot = await db.power_spots.find_one({"id": spot_id}, {"_id": 0})
    if not spot:
        raise HTTPException(404, "Power Spot not found")

    now = datetime.now(timezone.utc).isoformat()
    await db.power_spots.update_one(
        {"id": spot_id},
        {"$set": {"live_tracking": enabled, "updated_at": now}},
    )

    return {
        "success": True,
        "spot_id": spot_id,
        "live_tracking": enabled,
        "message": f"Live tracking {'enabled' if enabled else 'disabled'} for {spot['name']}.",
    }


class LocationPing(BaseModel):
    lat: float
    lng: float


@router.put("/power-spots/{spot_id}/update-location")
async def update_spot_location(
    spot_id: str,
    ping: LocationPing,
    user=Depends(get_current_user),
):
    """Update a Power Spot's GPS coordinates (called by live tracking)."""
    spot = await db.power_spots.find_one({"id": spot_id}, {"_id": 0})
    if not spot:
        raise HTTPException(404, "Power Spot not found")

    if not spot.get("live_tracking"):
        raise HTTPException(400, "Live tracking is not enabled for this spot")

    now = datetime.now(timezone.utc).isoformat()
    await db.power_spots.update_one(
        {"id": spot_id},
        {"$set": {
            "lat": ping.lat,
            "lng": ping.lng,
            "last_location_update": now,
            "updated_at": now,
        }},
    )

    return {
        "success": True,
        "spot_id": spot_id,
        "lat": ping.lat,
        "lng": ping.lng,
        "last_location_update": now,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  DIMENSIONAL LAYERING — Celestial Realm
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CELESTIAL_NODES = [
    {
        "id": "orion_gate",
        "name": "Orion's Gate",
        "constellation": "Orion",
        "ra": 5.92,  # Right Ascension in hours
        "dec": -1.2,  # Declination in degrees
        "frequency": 741,
        "color": "#C084FC",
        "reward_type": "science_resonance",
        "base_reward": 15,
        "rarity": "rare",
        "description": "The Hunter's threshold. Orion's belt stars align at 741Hz — the frequency of awakening and intuition.",
    },
    {
        "id": "sirius_nexus",
        "name": "Sirius Nexus",
        "constellation": "Canis Major",
        "ra": 6.75,
        "dec": -16.72,
        "frequency": 852,
        "color": "#A78BFA",
        "reward_type": "science_resonance",
        "base_reward": 20,
        "rarity": "legendary",
        "description": "The brightest star. Sirius pulses at 852Hz — the frequency of returning to spiritual order.",
    },
    {
        "id": "pleiades_beacon",
        "name": "Pleiades Beacon",
        "constellation": "Taurus",
        "ra": 3.79,
        "dec": 24.12,
        "frequency": 963,
        "color": "#818CF8",
        "reward_type": "science_resonance",
        "base_reward": 25,
        "rarity": "legendary",
        "description": "The Seven Sisters. 963Hz — the frequency of the pineal gland and cosmic connection.",
    },
    {
        "id": "vega_alignment",
        "name": "Vega Alignment",
        "constellation": "Lyra",
        "ra": 18.62,
        "dec": 38.78,
        "frequency": 741,
        "color": "#C4B5FD",
        "reward_type": "science_resonance",
        "base_reward": 12,
        "rarity": "uncommon",
        "description": "The Harp Star. Ancient navigators used Vega as the North Star 12,000 years ago.",
    },
    {
        "id": "polaris_lock",
        "name": "Polaris Lock",
        "constellation": "Ursa Minor",
        "ra": 2.53,
        "dec": 89.26,
        "frequency": 852,
        "color": "#DDD6FE",
        "reward_type": "science_resonance",
        "base_reward": 18,
        "rarity": "rare",
        "description": "The axis mundi. Earth's rotational pole aligns here — the ultimate fixed point in a moving cosmos.",
    },
    {
        "id": "antares_bridge",
        "name": "Antares Bridge",
        "constellation": "Scorpius",
        "ra": 16.49,
        "dec": -26.43,
        "frequency": 963,
        "color": "#F0ABFC",
        "reward_type": "science_resonance",
        "base_reward": 22,
        "rarity": "legendary",
        "description": "The Heart of the Scorpion. A red supergiant 700x the Sun's diameter. 963Hz cosmic pulse.",
    },
]

QUADRATIC_DECAY_RATE = 0.9  # y = a * 0.9^(t^2) for celestial items


@router.get("/celestial/nodes")
async def get_celestial_nodes(user=Depends(get_current_user)):
    """Get all celestial nodes for the star chart layer."""
    uid = user["id"]
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    harvested = await db.node_harvests.find(
        {"user_id": uid, "date": today, "node_type": "celestial"}, {"_id": 0, "node_id": 1}
    ).to_list(50)
    harvested_ids = {h["node_id"] for h in harvested}

    nodes = []
    for cn in CELESTIAL_NODES:
        nodes.append({
            **cn,
            "type": "celestial",
            "harvested": cn["id"] in harvested_ids,
            "icon": "star",
            # Convert RA/Dec to screen-friendly x/y (0-1 range)
            "chart_x": cn["ra"] / 24.0,
            "chart_y": (cn["dec"] + 90) / 180.0,
        })

    return {"nodes": nodes, "total": len(nodes)}


@router.post("/celestial/align")
async def align_celestial_node(
    node_id: str = Body(...),
    alignment_accuracy: float = Body(...),
    user=Depends(get_current_user),
):
    """Align with a celestial node (accuracy 0-1)."""
    uid = user["id"]
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    existing = await db.node_harvests.find_one(
        {"user_id": uid, "node_id": node_id, "date": today, "node_type": "celestial"}, {"_id": 0}
    )
    if existing:
        raise HTTPException(400, "Already aligned with this node today")

    target = None
    for cn in CELESTIAL_NODES:
        if cn["id"] == node_id:
            target = cn
            break
    if not target:
        raise HTTPException(404, "Celestial node not found")

    if alignment_accuracy < 0.6:
        return {
            "success": False,
            "accuracy": round(alignment_accuracy * 100, 1),
            "message": "Alignment too weak. Focus your resonance — 60% minimum required.",
        }

    reward = round(target["base_reward"] * alignment_accuracy)
    now = datetime.now(timezone.utc).isoformat()

    await db.avenue_progress.update_one(
        {"user_id": uid},
        {"$inc": {"science.resonance": reward}},
        upsert=True,
    )
    await db.node_harvests.insert_one({
        "user_id": uid,
        "node_id": node_id,
        "node_name": target["name"],
        "node_type": "celestial",
        "reward_type": "science_resonance",
        "reward_amount": reward,
        "date": today,
        "harvested_at": now,
        "alignment_accuracy": round(alignment_accuracy, 3),
        "frequency": target["frequency"],
    })
    await db.user_activity_log.insert_one({
        "user_id": uid, "type": "celestial_alignment",
        "detail": f"Aligned with {target['name']} at {target['frequency']}Hz (+{reward} Science Resonance)",
        "timestamp": now,
    })

    return {
        "success": True,
        "node_name": target["name"],
        "constellation": target["constellation"],
        "frequency": target["frequency"],
        "accuracy": round(alignment_accuracy * 100, 1),
        "reward_amount": reward,
        "message": f"Aligned: {target['name']} ({target['constellation']}) at {target['frequency']}Hz. +{reward} Science Resonance.",
    }


@router.get("/celestial/decay-status")
async def get_celestial_decay_status(user=Depends(get_current_user)):
    """Get quadratic decay status for celestial resonance."""
    uid = user["id"]
    last_celestial = await db.user_activity_log.find_one(
        {"user_id": uid, "type": "celestial_alignment"}, {"_id": 0},
        sort=[("timestamp", -1)],
    )

    if not last_celestial:
        return {
            "quadratic_decay_active": False,
            "days_inactive": 0,
            "decay_factor": 1.0,
            "message": "No celestial activity — begin aligning to build resonance.",
        }

    last_ts = last_celestial.get("timestamp", "")
    try:
        last_dt = datetime.fromisoformat(last_ts.replace("Z", "+00:00"))
        days_inactive = (datetime.now(timezone.utc) - last_dt).total_seconds() / 86400
    except (ValueError, AttributeError):
        days_inactive = 0

    # Quadratic decay: 0.9^(t^2)
    if days_inactive > 0.5:
        decay_factor = QUADRATIC_DECAY_RATE ** (days_inactive ** 2)
    else:
        decay_factor = 1.0

    pulse_speed = min(4.0, 0.3 + (days_inactive ** 1.5 * 0.5)) if days_inactive > 0.5 else 0

    return {
        "quadratic_decay_active": days_inactive > 0.5,
        "days_inactive": round(days_inactive, 2),
        "decay_factor": round(decay_factor, 6),
        "pulse_speed": round(pulse_speed, 2),
        "message": f"Celestial decay: {round(decay_factor * 100, 1)}% resonance retained" if days_inactive > 0.5 else "Celestial resonance stable",
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  CELESTIAL FORGE — Higher Solfeggio Frequencies
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CELESTIAL_FORGE_PATTERNS = {
    "astral_lens": {
        "name": "Astral Lens",
        "frequency": 741,
        "waveform": [0.2, 0.6, 0.9, 0.4, 0.8, 0.1, 0.7, 0.5, 1.0, 0.3, 0.6, 0.9, 0.2],
        "tolerance": 0.08,
        "time_limit_seconds": 10,
        "realm": "celestial",
        "bonus_type": "celestial_vision",
        "bonus_value": 1.4,
        "description": "741Hz — Awakening Intuition. Unlocks enhanced star chart visibility.",
        "required_alignments": 3,
    },
    "cosmic_bridge": {
        "name": "Cosmic Bridge",
        "frequency": 852,
        "waveform": [0.5, 0.0, 1.0, 0.2, 0.8, 0.3, 0.7, 0.1, 0.9, 0.4, 0.6, 0.0, 0.5],
        "tolerance": 0.07,
        "time_limit_seconds": 8,
        "realm": "celestial",
        "bonus_type": "dimensional_bridge",
        "bonus_value": 1.5,
        "description": "852Hz — Returning to Spiritual Order. Bridges ground and celestial realms.",
        "required_alignments": 5,
    },
    "pineal_resonator": {
        "name": "Pineal Resonator",
        "frequency": 963,
        "waveform": [1.0, 0.5, 0.0, 0.5, 1.0, 0.5, 0.0, 0.5, 1.0, 0.5, 0.0, 0.5, 1.0],
        "tolerance": 0.06,
        "time_limit_seconds": 6,
        "realm": "celestial",
        "bonus_type": "pineal_activation",
        "bonus_value": 1.75,
        "description": "963Hz — The God Frequency. Perfect sine wave. The hardest forge in the cosmos.",
        "required_alignments": 8,
    },
}


@router.get("/celestial/forge-patterns")
async def get_celestial_forge_patterns(user=Depends(get_current_user)):
    """Get available celestial forge patterns based on alignment count."""
    uid = user["id"]
    alignment_count = await db.node_harvests.count_documents(
        {"user_id": uid, "node_type": "celestial"}
    )

    patterns = []
    for pid, p in CELESTIAL_FORGE_PATTERNS.items():
        crafted = await db.resonance_builds.find_one(
            {"user_id": uid, "build_id": pid}, {"_id": 0}
        )
        patterns.append({
            "id": pid,
            "name": p["name"],
            "frequency": p["frequency"],
            "description": p["description"],
            "tolerance": p["tolerance"],
            "time_limit_seconds": p["time_limit_seconds"],
            "realm": p["realm"],
            "bonus_type": p["bonus_type"],
            "bonus_value": p["bonus_value"],
            "required_alignments": p["required_alignments"],
            "unlocked": alignment_count >= p["required_alignments"],
            "crafted": crafted is not None,
            "user_alignments": alignment_count,
        })

    return {"patterns": patterns, "user_alignments": alignment_count}


@router.get("/celestial/forge-pattern/{pattern_id}")
async def get_celestial_forge_pattern(pattern_id: str, user=Depends(get_current_user)):
    """Get a specific celestial forge waveform."""
    pattern = CELESTIAL_FORGE_PATTERNS.get(pattern_id)
    if not pattern:
        raise HTTPException(404, "Celestial forge pattern not found")

    uid = user["id"]
    alignment_count = await db.node_harvests.count_documents(
        {"user_id": uid, "node_type": "celestial"}
    )
    if alignment_count < pattern["required_alignments"]:
        raise HTTPException(
            403,
            f"Requires {pattern['required_alignments']} celestial alignments. You have {alignment_count}.",
        )

    return {
        "build_id": pattern_id,
        "name": pattern["name"],
        "frequency": pattern["frequency"],
        "waveform": pattern["waveform"],
        "tolerance": pattern["tolerance"],
        "time_limit_seconds": pattern["time_limit_seconds"],
        "points_count": len(pattern["waveform"]),
        "realm": "celestial",
        "description": pattern["description"],
    }


@router.post("/celestial/forge-attempt")
async def attempt_celestial_forge(attempt: ForgeAttempt, user=Depends(get_current_user)):
    """Attempt a celestial forge (higher frequencies, tighter tolerance)."""
    uid = user["id"]
    pattern = CELESTIAL_FORGE_PATTERNS.get(attempt.build_id)
    if not pattern:
        raise HTTPException(404, "Celestial forge pattern not found")

    existing = await db.resonance_builds.find_one(
        {"user_id": uid, "build_id": attempt.build_id}, {"_id": 0}
    )
    if existing:
        raise HTTPException(400, "Already forged")

    alignment_count = await db.node_harvests.count_documents(
        {"user_id": uid, "node_type": "celestial"}
    )
    if alignment_count < pattern["required_alignments"]:
        raise HTTPException(
            403,
            f"Requires {pattern['required_alignments']} celestial alignments. You have {alignment_count}.",
        )

    target = pattern["waveform"]
    user_wave = attempt.user_waveform
    tolerance = pattern["tolerance"]

    if len(user_wave) != len(target):
        raise HTTPException(400, f"Waveform must have exactly {len(target)} points")

    point_scores = []
    for t, u in zip(target, user_wave):
        error = abs(t - u)
        # Squared error in celestial realm
        squared_error = error ** 2
        score = max(0, 1.0 - (squared_error / (tolerance ** 2)))
        point_scores.append(round(score, 2))

    accuracy = sum(point_scores) / len(point_scores) * 100
    time_ok = attempt.time_taken_seconds <= pattern["time_limit_seconds"]
    time_bonus = max(0, 1.0 - (attempt.time_taken_seconds / pattern["time_limit_seconds"])) * 15

    total_score = round(accuracy + time_bonus, 1)
    forged = accuracy >= 75 and time_ok  # Higher threshold for celestial

    if forged:
        now = datetime.now(timezone.utc).isoformat()
        await db.resonance_builds.insert_one({
            "user_id": uid,
            "build_id": attempt.build_id,
            "build_name": pattern["name"],
            "bonus_type": pattern["bonus_type"],
            "bonus_value": pattern["bonus_value"],
            "realm": "celestial",
            "frequency": pattern["frequency"],
            "crafted_at": now,
            "forge_score": total_score,
            "forge_accuracy": round(accuracy, 1),
        })
        await db.user_activity_log.insert_one({
            "user_id": uid, "type": "celestial_forge",
            "detail": f"Celestial Forge: {pattern['name']} at {pattern['frequency']}Hz",
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
        "realm": "celestial",
        "frequency": pattern["frequency"],
        "message": f"Celestial Forge Complete: {pattern['name']}!" if forged else "Waveform destabilized — the thin air demands precision",
        "bonus": f"{pattern['bonus_type']}: {pattern['bonus_value']}x" if forged else None,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  LOCATION-LOCKED EDUCATION PACKS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post("/location-locked-packs")
async def get_location_locked_packs(
    user_lat: float = Body(...),
    user_lng: float = Body(...),
    user=Depends(get_current_user),
):
    """Get education packs available at user's current location."""
    uid = user["id"]
    spots = await db.power_spots.find({"active": True}, {"_id": 0}).to_list(50)

    nearby_spots = []
    for s in spots:
        dlat = s["lat"] - user_lat
        dlng = s["lng"] - user_lng
        dist_m = math.sqrt(
            (dlat * 111320) ** 2 + (dlng * 111320 * math.cos(math.radians(user_lat))) ** 2
        )
        if dist_m <= s.get("harvest_radius_meters", 100):
            nearby_spots.append(s)

    if not nearby_spots:
        return {
            "at_power_spot": False,
            "packs": [],
            "message": "Not near a Power Spot. Location-locked packs require physical presence.",
        }

    location_packs = [
        {
            "id": "location_history_deep",
            "name": "Deep History: Local Ley Lines",
            "description": "Unlock the hidden energy grid beneath this Power Spot. Available only at Enlightenment Cafe locations.",
            "cost": 0,
            "currency": "free_at_location",
            "rarity": "legendary",
        },
        {
            "id": "location_science_field",
            "name": "Field Science: Geomagnetic Survey",
            "description": "Access real geomagnetic data for this Power Spot's coordinates. Study the Earth's magnetic field strength here.",
            "cost": 0,
            "currency": "free_at_location",
            "rarity": "rare",
        },
    ]

    purchases = await db.economy_purchases.find({"user_id": uid}, {"_id": 0}).to_list(200)
    owned_ids = {p["item_id"] for p in purchases}

    for pack in location_packs:
        pack["owned"] = pack["id"] in owned_ids

    return {
        "at_power_spot": True,
        "spot_name": nearby_spots[0]["name"],
        "packs": location_packs,
        "message": f"You're at {nearby_spots[0]['name']}! Location-locked content available.",
    }
