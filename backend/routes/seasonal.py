import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from deps import db, get_current_user

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  SEASONAL FREQUENCIES — Time-gated sonic crystals
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SEASONAL_FREQUENCIES = [
    {
        "id": "spring-equinox",
        "name": "Vernal Awakening",
        "hz": 396.5,
        "desc": "Liberation frequency — release fear and guilt as nature renews",
        "color": "#4ADE80",
        "season": "spring",
        "month_start": 3, "day_start": 6,
        "month_end": 4, "day_end": 5,
        "icon": "sprout",
        "lore": "As the Earth tilts toward the sun and day matches night, this frequency resonates with the planet's magnetic shift. Ancient cultures celebrated this moment as a portal for releasing the old and welcoming rebirth.",
    },
    {
        "id": "summer-solstice",
        "name": "Solar Zenith",
        "hz": 639.5,
        "desc": "Connection & relationships — harmonize at peak solar energy",
        "color": "#F59E0B",
        "season": "summer",
        "month_start": 6, "day_start": 7,
        "month_end": 7, "day_end": 7,
        "icon": "sun",
        "lore": "The longest day channels maximum solar energy into the Earth's ley lines. This frequency amplifies interpersonal bonds, making it the ideal tone for strengthening connections with your cosmic tribe.",
    },
    {
        "id": "autumn-equinox",
        "name": "Harvest Resonance",
        "hz": 741.5,
        "desc": "Intuition & awakening — clarity as the veil thins",
        "color": "#F97316",
        "season": "autumn",
        "month_start": 9, "day_start": 8,
        "month_end": 10, "day_end": 8,
        "icon": "leaf",
        "lore": "As day and night balance again, the thinning veil between worlds amplifies intuitive channels. This frequency clears electromagnetic fog and opens the third eye to hidden truths.",
    },
    {
        "id": "winter-solstice",
        "name": "Stellar Depths",
        "hz": 852.5,
        "desc": "Spiritual return — the longest night opens the inner cosmos",
        "color": "#38BDF8",
        "season": "winter",
        "month_start": 12, "day_start": 7,
        "month_end": 1, "day_end": 7,
        "icon": "snowflake",
        "lore": "In the deepest darkness, the cosmos reveals its most intimate frequencies. Ancient starseeds gathered at stone circles during this time, believing the 852Hz tone could open gateways to higher dimensional consciousness.",
    },
]


def _is_in_window(freq, now):
    """Check if current date falls within the frequency's seasonal window."""
    m, d = now.month, now.day
    ms, ds = freq["month_start"], freq["day_start"]
    me, de = freq["month_end"], freq["day_end"]
    # Handle winter solstice wrapping across year boundary
    if ms > me:
        return (m > ms or (m == ms and d >= ds)) or (m < me or (m == me and d <= de))
    return (m > ms or (m == ms and d >= ds)) and (m < me or (m == me and d <= de))


@router.get("/seasonal/active")
async def get_active_seasonal(user=Depends(get_current_user)):
    """Return currently available seasonal frequencies and user's collection."""
    uid = user["id"]
    now = datetime.now(timezone.utc)

    collected = await db.seasonal_collection.find(
        {"user_id": uid}, {"_id": 0}
    ).to_list(100)
    collected_ids = {c["frequency_id"] for c in collected}

    active = []
    upcoming = []
    for freq in SEASONAL_FREQUENCIES:
        entry = {
            "id": freq["id"],
            "name": freq["name"],
            "hz": freq["hz"],
            "desc": freq["desc"],
            "color": freq["color"],
            "season": freq["season"],
            "icon": freq["icon"],
            "lore": freq["lore"],
            "collected": freq["id"] in collected_ids,
        }
        if _is_in_window(freq, now):
            entry["available"] = True
            active.append(entry)
        else:
            entry["available"] = False
            upcoming.append(entry)

    return {
        "active": active,
        "upcoming": upcoming,
        "collected": [c for c in collected],
        "total_collected": len(collected_ids),
        "total_possible": len(SEASONAL_FREQUENCIES),
    }


@router.post("/seasonal/collect")
async def collect_seasonal(data: dict, user=Depends(get_current_user)):
    """Collect a currently active seasonal frequency."""
    uid = user["id"]
    freq_id = data.get("frequency_id")
    now = datetime.now(timezone.utc)

    freq = next((f for f in SEASONAL_FREQUENCIES if f["id"] == freq_id), None)
    if not freq:
        return {"status": "error", "reason": "Unknown frequency"}

    if not _is_in_window(freq, now):
        return {"status": "unavailable", "reason": f"The {freq['name']} frequency is only available during {freq['season']}"}

    existing = await db.seasonal_collection.find_one({"user_id": uid, "frequency_id": freq_id})
    if existing:
        return {"status": "already_collected", "frequency": {k: v for k, v in freq.items() if k not in ("month_start", "day_start", "month_end", "day_end")}}

    record = {
        "id": str(uuid.uuid4()),
        "user_id": uid,
        "frequency_id": freq_id,
        "frequency_name": freq["name"],
        "hz": freq["hz"],
        "color": freq["color"],
        "season": freq["season"],
        "collected_at": now.isoformat(),
    }
    await db.seasonal_collection.insert_one({**record})
    record.pop("_id", None)

    # Grant achievement in cosmic ledger if all 4 collected
    all_collected = await db.seasonal_collection.count_documents({"user_id": uid})
    achievement = None
    if all_collected >= len(SEASONAL_FREQUENCIES):
        achievement = {"id": "sonic_crystal_master", "title": "Sonic Crystal Master", "desc": "Collected all 4 seasonal frequencies"}

    return {
        "status": "collected",
        "frequency": {k: v for k, v in freq.items() if k not in ("month_start", "day_start", "month_end", "day_end")},
        "record": record,
        "achievement": achievement,
    }
