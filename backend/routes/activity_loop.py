"""
Activity Loop — Unified cross-system progress tracker.
Shows how all systems feed into each other, creating the infinite engagement loop.
"""
from fastapi import APIRouter, Depends
from deps import db, get_current_user
from routes.consciousness import level_from_consciousness_xp
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/activity-loop")


@router.get("/progress")
async def get_loop_progress(user=Depends(get_current_user)):
    """
    Returns a unified view of progress across all systems,
    showing how each feeds into the others.
    """
    uid = user["id"]

    # Gather data from all systems in parallel
    u = await db.users.find_one({"id": uid}, {"_id": 0, "consciousness": 1, "user_dust_balance": 1})
    consciousness = (u or {}).get("consciousness", {})
    xp = consciousness.get("xp", 0)
    level = level_from_consciousness_xp(xp)
    dust = (u or {}).get("user_dust_balance", 0)

    # Polished gems
    polished_count = await db.rpg_inventory.count_documents({"user_id": uid, "state": "polished"})
    raw_count = await db.rpg_inventory.count_documents({"user_id": uid, "state": "raw"})

    # Trades
    trade_count = await db.trade_circle_listings.count_documents({"seller_id": uid, "status": "completed"})
    offer_count = await db.trade_circle_offers.count_documents({
        "$or": [{"buyer_id": uid, "status": "accepted"}, {"seller_id": uid, "status": "accepted"}]
    })

    # Energy gates
    gates_doc = await db.energy_gates.find_one({"user_id": uid}, {"_id": 0})
    gates_unlocked = len((gates_doc or {}).get("unlocked", []))

    # Resonance practice
    res_doc = await db.resonance_practice.find_one({"user_id": uid}, {"_id": 0})
    resonance_sessions = (res_doc or {}).get("total_sessions", 0)
    resonance_streak = (res_doc or {}).get("current_streak", 0)
    resonance_dust = (res_doc or {}).get("total_dust_earned", 0)

    # Hotspot collections
    hot_doc = await db.hotspot_collections.find_one({"user_id": uid}, {"_id": 0})
    hotspot_collections = (hot_doc or {}).get("total_collections", 0)

    # Travel log
    travel_doc = await db.energy_gate_travel.find_one({"user_id": uid}, {"_id": 0})
    realms_visited = len((travel_doc or {}).get("realms", []))

    # Today's daily quest completion
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    quest_doc = await db.rpg_daily_quests.find_one({"user_id": uid, "date": today}, {"_id": 0})
    quests_done = len((quest_doc or {}).get("completed", []))

    # Build the loop diagram data
    loops = [
        {
            "id": "practice_to_dust",
            "from_system": "Resonance Practice",
            "to_system": "Cosmic Dust",
            "metric": resonance_dust,
            "label": f"{resonance_dust} Dust generated from {resonance_sessions} sessions",
            "color": "#8B5CF6",
            "active": resonance_sessions > 0,
        },
        {
            "id": "hotspot_to_gems",
            "from_system": "GPS Hotspots",
            "to_system": "Raw Gems",
            "metric": hotspot_collections,
            "label": f"{hotspot_collections} collections, {raw_count} raw gems in inventory",
            "color": "#2DD4BF",
            "active": hotspot_collections > 0,
        },
        {
            "id": "gems_to_refinement",
            "from_system": "Raw Gems",
            "to_system": "Polished Gems",
            "metric": polished_count,
            "label": f"{polished_count} polished from {raw_count + polished_count} total gems",
            "color": "#D97706",
            "active": polished_count > 0,
        },
        {
            "id": "polish_to_gates",
            "from_system": "Polished Gems + Dust + Trades",
            "to_system": "Energy Gates",
            "metric": gates_unlocked,
            "label": f"{gates_unlocked}/5 gates unlocked",
            "color": "#FBBF24",
            "active": gates_unlocked > 0,
        },
        {
            "id": "trades_to_gates",
            "from_system": "Trade Circle",
            "to_system": "Energy Gates",
            "metric": trade_count + offer_count,
            "label": f"{trade_count + offer_count} completed trades feed gate requirements",
            "color": "#C084FC",
            "active": (trade_count + offer_count) > 0,
        },
        {
            "id": "all_to_consciousness",
            "from_system": "All Activities",
            "to_system": "Consciousness Level",
            "metric": level,
            "label": f"Level {level} ({xp} XP) — unlocks higher multipliers everywhere",
            "color": "#F472B6",
            "active": level > 1,
        },
        {
            "id": "travel_to_gates",
            "from_system": "Realm Travel",
            "to_system": "Energy Gates",
            "metric": realms_visited,
            "label": f"{realms_visited}/5 realms visited",
            "color": "#FB923C",
            "active": realms_visited > 0,
        },
    ]

    return {
        "overview": {
            "consciousness_level": level,
            "xp": xp,
            "dust": dust,
            "polished_gems": polished_count,
            "raw_gems": raw_count,
            "trades": trade_count + offer_count,
            "gates_unlocked": gates_unlocked,
            "resonance_sessions": resonance_sessions,
            "resonance_streak": resonance_streak,
            "hotspot_collections": hotspot_collections,
            "realms_visited": realms_visited,
            "quests_done_today": quests_done,
        },
        "loops": loops,
        "active_loops": sum(1 for loop in loops if loop["active"]),
        "total_loops": len(loops),
    }


@router.get("/heatmap")
async def get_heatmap(days: int = 90, user=Depends(get_current_user)):
    """
    Returns practice/activity heatmap data for the streak calendar.
    Includes resonance, hotspot, quest, and trade activities per day.
    """
    uid = user["id"]
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=days)
    start_iso = start.isoformat()

    # Resonance practice history
    res_doc = await db.resonance_practice.find_one({"user_id": uid}, {"_id": 0, "history": 1})
    res_history = (res_doc or {}).get("history", [])

    # Hotspot collection history
    hot_doc = await db.hotspot_collections.find_one({"user_id": uid}, {"_id": 0, "history": 1})
    hot_history = (hot_doc or {}).get("history", [])

    # Consciousness activity log
    u = await db.users.find_one({"id": uid}, {"_id": 0, "consciousness.activity_log": 1})
    xp_log = (u or {}).get("consciousness", {}).get("activity_log", [])

    # Build daily map
    daily = {}
    for entry in res_history:
        ts = entry.get("timestamp", "")
        if ts >= start_iso:
            day = ts[:10]
            if day not in daily:
                daily[day] = {"resonance": 0, "hotspot": 0, "xp_events": 0, "elements": {}, "dust": 0}
            daily[day]["resonance"] += 1
            daily[day]["dust"] += entry.get("dust", 0)
            elem = entry.get("element", "earth")
            daily[day]["elements"][elem] = daily[day]["elements"].get(elem, 0) + 1

    for entry in hot_history:
        ts = entry.get("timestamp", "")
        if ts >= start_iso:
            day = ts[:10]
            if day not in daily:
                daily[day] = {"resonance": 0, "hotspot": 0, "xp_events": 0, "elements": {}, "dust": 0}
            daily[day]["hotspot"] += 1
            daily[day]["dust"] += entry.get("dust", 0)
            elem = entry.get("element", "earth")
            daily[day]["elements"][elem] = daily[day]["elements"].get(elem, 0) + 1

    for entry in xp_log:
        ts = entry.get("timestamp", "")
        if ts >= start_iso:
            day = ts[:10]
            if day not in daily:
                daily[day] = {"resonance": 0, "hotspot": 0, "xp_events": 0, "elements": {}, "dust": 0}
            daily[day]["xp_events"] += 1

    # Build sorted array for the last N days
    heatmap = []
    for i in range(days):
        d = (now - timedelta(days=days - 1 - i)).strftime("%Y-%m-%d")
        data = daily.get(d, {"resonance": 0, "hotspot": 0, "xp_events": 0, "elements": {}, "dust": 0})
        total = data["resonance"] + data["hotspot"] + data["xp_events"]
        # Determine dominant element
        dominant_element = max(data["elements"], key=data["elements"].get) if data["elements"] else None
        heatmap.append({
            "date": d,
            "total_activities": total,
            "resonance": data["resonance"],
            "hotspot": data["hotspot"],
            "xp_events": data["xp_events"],
            "dust_earned": data["dust"],
            "dominant_element": dominant_element,
        })

    # Current streak
    res_streak = (res_doc or {}).get("current_streak", 0) if res_doc else 0

    return {
        "heatmap": heatmap,
        "days": days,
        "active_days": sum(1 for h in heatmap if h["total_activities"] > 0),
        "current_streak": res_streak,
    }
