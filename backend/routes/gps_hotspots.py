"""
GPS Hotspots — Location-based material nodes.
Static (landmarks) + Dynamic (procedurally spawned near user).
Rewards feed into Energy Gate requirements (gems, dust, rare items).
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone, timedelta
import hashlib
import math
import random

router = APIRouter(prefix="/hotspots")

# ── Element config ──────────────────────────────────────────────────
ELEMENTS = {
    "earth": {"color": "#D97706", "frequency": 396, "icon": "mountain"},
    "water": {"color": "#F472B6", "frequency": 417, "icon": "droplets"},
    "fire":  {"color": "#94A3B8", "frequency": 528, "icon": "flame"},
    "air":   {"color": "#8B5CF6", "frequency": 741, "icon": "wind"},
    "ether": {"color": "#FBBF24", "frequency": 963, "icon": "sparkles"},
}

# ── Reward tiers ────────────────────────────────────────────────────
REWARD_TIERS = {
    "common":    {"dust": (5, 15),  "gem_chance": 0.10, "xp": 15},
    "uncommon":  {"dust": (15, 30), "gem_chance": 0.25, "xp": 35},
    "rare":      {"dust": (30, 60), "gem_chance": 0.50, "xp": 75},
    "legendary": {"dust": (60, 120), "gem_chance": 0.85, "xp": 150},
}

# ── Static hotspots (curated sacred sites) ──────────────────────────
STATIC_HOTSPOTS = [
    {"id": "static_sedona", "name": "Sedona Vortex", "element": "earth",
     "lat": 34.8697, "lng": -111.7610, "tier": "legendary",
     "lore": "Ancient red rock spirals channel Earth's deepest currents."},
    {"id": "static_stonehenge", "name": "Stonehenge Circle", "element": "ether",
     "lat": 51.1789, "lng": -1.8262, "tier": "legendary",
     "lore": "The stones hum at 963 Hz when the solstice sun touches their faces."},
    {"id": "static_machu", "name": "Machu Picchu Heights", "element": "air",
     "lat": -13.1631, "lng": -72.5450, "tier": "legendary",
     "lore": "Above the clouds, the Air Gate's frequency echoes through Incan walls."},
    {"id": "static_ganges", "name": "Ganges Source Spring", "element": "water",
     "lat": 30.9262, "lng": 78.9368, "tier": "rare",
     "lore": "Where the sacred river is born, the Water element flows purest."},
    {"id": "static_fuji", "name": "Mount Fuji Summit", "element": "fire",
     "lat": 35.3606, "lng": 138.7274, "tier": "legendary",
     "lore": "Volcanic fire meets sky — the crucible of transmutation."},
    {"id": "static_cenote", "name": "Cenote Ik Kil", "element": "water",
     "lat": 20.6620, "lng": -88.5510, "tier": "rare",
     "lore": "The Mayans knew: water remembers everything it touches."},
    {"id": "static_uluru", "name": "Uluru Dreaming", "element": "earth",
     "lat": -25.3444, "lng": 131.0369, "tier": "rare",
     "lore": "The red monolith breathes with 40,000 years of dream-lines."},
    {"id": "static_aurora", "name": "Aurora Gateway", "element": "ether",
     "lat": 69.6492, "lng": 18.9553, "tier": "rare",
     "lore": "When the northern lights dance, the Ether Gate opens briefly."},
    # Rapid City local hotspots
    {"id": "static_memorial_park", "name": "Memorial Park Spring", "element": "water",
     "lat": 44.0752, "lng": -103.2310, "tier": "uncommon",
     "lore": "The creek whispers through cottonwoods, carrying the memory of rain and snowmelt."},
    {"id": "static_skyline_drive", "name": "Skyline Drive Overlook", "element": "earth",
     "lat": 44.0614, "lng": -103.2570, "tier": "uncommon",
     "lore": "At the crest of the ridge, the Badlands spread below like the spine of the Earth."},
    {"id": "static_storybook_island", "name": "Storybook Island Grove", "element": "air",
     "lat": 44.0735, "lng": -103.2420, "tier": "uncommon",
     "lore": "Where imagination takes form. The Air element dances through the trees of childhood wonder."},
    {"id": "static_dinosaur_park", "name": "Dinosaur Park Summit", "element": "fire",
     "lat": 44.0745, "lng": -103.2515, "tier": "uncommon",
     "lore": "Ancient titans once walked here. Their fire still smolders beneath the hilltop."},
    {"id": "static_canyon_lake", "name": "Canyon Lake Reflection", "element": "water",
     "lat": 44.0690, "lng": -103.2660, "tier": "rare",
     "lore": "Still waters hold the sky. The Water Gate's frequency resonates off the canyon walls."},
]

COLLECT_RADIUS_METERS = 50   # Must be within 50m to collect (geofence)
DYNAMIC_REFRESH_HOURS = 4    # Dynamic hotspots respawn every 4 hours
DYNAMIC_SPAWN_COUNT = 5      # Number of dynamic hotspots per user
DYNAMIC_SPAWN_RADIUS_KM = 2  # Spawn within 2km of user
COLLECT_COOLDOWN_HOURS = 2   # Per-hotspot cooldown after collecting


def _haversine(lat1, lng1, lat2, lng2):
    """Distance between two coords in meters."""
    R = 6371000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _generate_dynamic_hotspots(user_id: str, lat: float, lng: float):
    """
    Procedurally generate hotspots near the user.
    Uses time-window seed so they refresh every DYNAMIC_REFRESH_HOURS.
    """
    now = datetime.now(timezone.utc)
    window = int(now.timestamp()) // (DYNAMIC_REFRESH_HOURS * 3600)
    seed_str = f"{user_id}:{window}"
    seed = int(hashlib.sha256(seed_str.encode()).hexdigest()[:8], 16)
    rng = random.Random(seed)

    elements = list(ELEMENTS.keys())
    tiers = ["common", "common", "common", "uncommon", "uncommon", "rare"]
    names_adj = ["Whispering", "Shimmering", "Hidden", "Ancient", "Radiant",
                 "Glowing", "Forgotten", "Pulsing", "Mystic", "Echoing"]
    names_noun = ["Nexus", "Spring", "Grove", "Stone", "Rift",
                  "Pool", "Cairn", "Crystal", "Flame", "Current"]

    hotspots = []
    for i in range(DYNAMIC_SPAWN_COUNT):
        angle = rng.uniform(0, 2 * math.pi)
        dist_km = rng.uniform(0.1, DYNAMIC_SPAWN_RADIUS_KM)
        # Offset in degrees (rough: 1 degree ≈ 111km)
        d_lat = (dist_km / 111) * math.cos(angle)
        d_lng = (dist_km / (111 * max(math.cos(math.radians(lat)), 0.01))) * math.sin(angle)

        elem = rng.choice(elements)
        tier = rng.choice(tiers)
        adj = rng.choice(names_adj)
        noun = rng.choice(names_noun)

        h_lat = round(lat + d_lat, 6)
        h_lng = round(lng + d_lng, 6)
        h_id = f"dyn_{user_id[:8]}_{window}_{i}"

        hotspots.append({
            "id": h_id,
            "name": f"{adj} {noun}",
            "element": elem,
            "lat": h_lat,
            "lng": h_lng,
            "tier": tier,
            "lore": f"A {tier} {elem} node pulses with {ELEMENTS[elem]['frequency']} Hz energy.",
            "dynamic": True,
            "expires_at": (
                datetime(1970, 1, 1, tzinfo=timezone.utc)
                + timedelta(seconds=(window + 1) * DYNAMIC_REFRESH_HOURS * 3600)
            ).isoformat(),
        })

    return hotspots


@router.get("/nearby")
async def get_nearby_hotspots(
    lat: float,
    lng: float,
    radius: float = 50000,
    user=Depends(get_current_user),
):
    """Get all hotspots near the user's coordinates."""
    if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
        raise HTTPException(400, "Invalid coordinates")

    user_id = user["id"]

    # Generate dynamic hotspots near user
    dynamic = _generate_dynamic_hotspots(user_id, lat, lng)

    # Filter static hotspots within radius
    nearby_static = []
    for hs in STATIC_HOTSPOTS:
        dist = _haversine(lat, lng, hs["lat"], hs["lng"])
        if dist <= radius:
            nearby_static.append({
                **hs,
                "dynamic": False,
                "distance_m": round(dist),
                "bearing": _bearing(lat, lng, hs["lat"], hs["lng"]),
            })

    # Add distance to dynamic hotspots
    for hs in dynamic:
        hs["distance_m"] = round(_haversine(lat, lng, hs["lat"], hs["lng"]))
        hs["bearing"] = _bearing(lat, lng, hs["lat"], hs["lng"])

    all_hotspots = nearby_static + dynamic

    # Get user's collection cooldowns
    cooldowns_doc = await db.hotspot_collections.find_one(
        {"user_id": user_id}, {"_id": 0}
    )
    cooldowns = (cooldowns_doc or {}).get("collections", {})
    now = datetime.now(timezone.utc)

    for hs in all_hotspots:
        last_collected = cooldowns.get(hs["id"])
        if last_collected:
            lc = datetime.fromisoformat(last_collected)
            if lc.tzinfo is None:
                lc = lc.replace(tzinfo=timezone.utc)
            cooldown_end = lc + timedelta(hours=COLLECT_COOLDOWN_HOURS)
            hs["on_cooldown"] = now < cooldown_end
            hs["cooldown_until"] = cooldown_end.isoformat() if hs["on_cooldown"] else None
        else:
            hs["on_cooldown"] = False
            hs["cooldown_until"] = None

        hs["in_range"] = hs["distance_m"] <= COLLECT_RADIUS_METERS
        hs["element_data"] = ELEMENTS.get(hs["element"], {})

    # Sort by distance
    all_hotspots.sort(key=lambda h: h["distance_m"])

    return {
        "hotspots": all_hotspots,
        "user_lat": lat,
        "user_lng": lng,
        "collect_radius_m": COLLECT_RADIUS_METERS,
        "total_nearby": len(all_hotspots),
        "dynamic_refresh_hours": DYNAMIC_REFRESH_HOURS,
    }


def _bearing(lat1, lng1, lat2, lng2):
    """Calculate bearing from point 1 to point 2 in degrees."""
    dl = math.radians(lng2 - lng1)
    p1, p2 = math.radians(lat1), math.radians(lat2)
    x = math.sin(dl) * math.cos(p2)
    y = math.cos(p1) * math.sin(p2) - math.sin(p1) * math.cos(p2) * math.cos(dl)
    brng = math.degrees(math.atan2(x, y))
    return round((brng + 360) % 360, 1)


@router.post("/collect")
async def collect_hotspot(data: dict = Body(...), user=Depends(get_current_user)):
    """Collect rewards from a hotspot. User must be within COLLECT_RADIUS_METERS."""
    hotspot_id = data.get("hotspot_id", "")
    user_lat = data.get("lat", 0)
    user_lng = data.get("lng", 0)
    user_id = user["id"]

    if not hotspot_id:
        raise HTTPException(400, "Missing hotspot_id")

    # Find the hotspot
    hotspot = None
    for hs in STATIC_HOTSPOTS:
        if hs["id"] == hotspot_id:
            hotspot = {**hs, "dynamic": False}
            break

    if not hotspot and hotspot_id.startswith("dyn_"):
        dynamic = _generate_dynamic_hotspots(user_id, user_lat, user_lng)
        for hs in dynamic:
            if hs["id"] == hotspot_id:
                hotspot = hs
                break

    if not hotspot:
        raise HTTPException(404, "Hotspot not found or expired")

    # Distance check
    dist = _haversine(user_lat, user_lng, hotspot["lat"], hotspot["lng"])
    if dist > COLLECT_RADIUS_METERS:
        raise HTTPException(400, f"Too far away ({round(dist)}m). Must be within {COLLECT_RADIUS_METERS}m.")

    # Cooldown check
    cooldowns_doc = await db.hotspot_collections.find_one(
        {"user_id": user_id}, {"_id": 0}
    )
    cooldowns = (cooldowns_doc or {}).get("collections", {})
    now = datetime.now(timezone.utc)

    last_collected = cooldowns.get(hotspot_id)
    if last_collected:
        lc = datetime.fromisoformat(last_collected)
        if lc.tzinfo is None:
            lc = lc.replace(tzinfo=timezone.utc)
        if now < lc + timedelta(hours=COLLECT_COOLDOWN_HOURS):
            remaining = (lc + timedelta(hours=COLLECT_COOLDOWN_HOURS) - now).total_seconds() / 60
            raise HTTPException(400, f"On cooldown. {round(remaining)} minutes remaining.")

    # Calculate rewards
    tier = hotspot.get("tier", "common")
    reward_cfg = REWARD_TIERS.get(tier, REWARD_TIERS["common"])
    rng = random.Random()

    dust_reward = rng.randint(*reward_cfg["dust"])
    xp_reward = reward_cfg["xp"]
    got_gem = rng.random() < reward_cfg["gem_chance"]
    element = hotspot.get("element", "earth")

    # Award dust
    await db.users.update_one({"id": user_id}, {"$inc": {"user_dust_balance": dust_reward}})

    # Award XP
    await db.users.update_one({"id": user_id}, {
        "$inc": {"consciousness.xp": xp_reward},
        "$push": {"consciousness.activity_log": {
            "$each": [{"activity": "hotspot_collect", "xp": xp_reward,
                       "context": hotspot["name"], "timestamp": now.isoformat()}],
            "$slice": -50,
        }},
    })

    # Maybe award a gem (raw specimen for refinement)
    gem_data = None
    if got_gem:
        gem_names = {
            "earth": ["Amber Shard", "Obsidian Fragment", "Tiger's Eye Chip"],
            "water": ["Aquamarine Piece", "Moonstone Sliver", "Pearl Seed"],
            "fire": ["Garnet Ember", "Carnelian Spark", "Ruby Dust"],
            "air": ["Amethyst Wisp", "Fluorite Breeze", "Opal Mist"],
            "ether": ["Diamond Seed", "Celestite Prism", "Labradorite Core"],
        }
        import uuid
        gem_name = rng.choice(gem_names.get(element, gem_names["earth"]))
        gem_id = str(uuid.uuid4())[:12]
        gem_doc = {
            "id": gem_id,
            "user_id": user_id,
            "name": gem_name,
            "element": element,
            "state": "raw",
            "source": "hotspot",
            "source_id": hotspot_id,
            "rarity": tier,
            "collected_at": now.isoformat(),
        }
        await db.rpg_inventory.insert_one(gem_doc)
        gem_data = {"name": gem_name, "element": element, "rarity": tier}

    # Record collection
    await db.hotspot_collections.update_one(
        {"user_id": user_id},
        {
            "$set": {f"collections.{hotspot_id}": now.isoformat()},
            "$inc": {"total_collections": 1},
            "$push": {"history": {
                "$each": [{
                    "hotspot_id": hotspot_id,
                    "hotspot_name": hotspot["name"],
                    "element": element,
                    "tier": tier,
                    "dust": dust_reward,
                    "xp": xp_reward,
                    "gem": gem_data,
                    "timestamp": now.isoformat(),
                }],
                "$slice": -100,
            }},
            "$setOnInsert": {"user_id": user_id},
        },
        upsert=True,
    )

    # Auto-complete daily quest "hotspot"
    quest_result = None
    try:
        from routes.rpg import award_quest_xp
        quest_result = await award_quest_xp(user_id, "hotspot")
    except Exception:
        pass

    return {
        "collected": True,
        "hotspot": hotspot["name"],
        "element": element,
        "tier": tier,
        "rewards": {
            "dust": dust_reward,
            "xp": xp_reward,
            "gem": gem_data,
        },
        "lore": hotspot.get("lore", ""),
        "cooldown_hours": COLLECT_COOLDOWN_HOURS,
        "quest_completed": quest_result is not None,
    }


@router.get("/history")
async def collection_history(user=Depends(get_current_user)):
    """Get user's hotspot collection history."""
    doc = await db.hotspot_collections.find_one(
        {"user_id": user["id"]}, {"_id": 0}
    )
    return {
        "total_collections": (doc or {}).get("total_collections", 0),
        "history": (doc or {}).get("history", []),
    }


@router.get("/static-sites")
async def get_static_sites():
    """Get all static sacred sites (no auth required for discovery)."""
    return {
        "sites": [
            {
                "id": s["id"],
                "name": s["name"],
                "element": s["element"],
                "tier": s["tier"],
                "lat": s["lat"],
                "lng": s["lng"],
                "lore": s["lore"],
                "element_data": ELEMENTS.get(s["element"], {}),
            }
            for s in STATIC_HOTSPOTS
        ],
        "total": len(STATIC_HOTSPOTS),
    }
