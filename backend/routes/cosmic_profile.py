from fastapi import APIRouter, Depends
from deps import db, get_current_user, logger
from datetime import datetime, timezone

router = APIRouter()


@router.get("/cosmic-profile")
async def get_cosmic_profile(user=Depends(get_current_user)):
    """Build a comprehensive cosmic profile from user's forecast, meditation, and divination history."""
    user_id = user["id"]

    # Forecast stats
    forecasts = await db.forecasts.find(
        {"user_id": user_id}, {"_id": 0, "system": 1, "period": 1, "forecast": 1, "created_at": 1}
    ).sort("created_at", -1).to_list(100)

    system_counts = {}
    period_counts = {"daily": 0, "weekly": 0, "monthly": 0, "yearly": 0}
    total_energy = 0
    energy_count = 0
    all_lucky_numbers = []
    all_crystals = []
    all_elements = []
    section_energies = {"positive": 0, "neutral": 0, "challenging": 0, "transformative": 0}

    for f in forecasts:
        system_counts[f["system"]] = system_counts.get(f["system"], 0) + 1
        period_counts[f.get("period", "daily")] = period_counts.get(f.get("period", "daily"), 0) + 1
        fc = f.get("forecast", {})
        if fc.get("overall_energy"):
            total_energy += fc["overall_energy"]
            energy_count += 1
        lucky = fc.get("lucky", {})
        if lucky.get("numbers"):
            all_lucky_numbers.extend(lucky["numbers"])
        if lucky.get("crystal"):
            all_crystals.append(lucky["crystal"])
        if lucky.get("element"):
            all_elements.append(lucky["element"])
        for sec in fc.get("sections", []):
            e = sec.get("energy", "neutral")
            section_energies[e] = section_energies.get(e, 0) + 1

    # Most frequent lucky numbers
    num_freq = {}
    for n in all_lucky_numbers:
        num_freq[n] = num_freq.get(n, 0) + 1
    top_numbers = sorted(num_freq.items(), key=lambda x: -x[1])[:5]

    # Most frequent crystals
    crystal_freq = {}
    for c in all_crystals:
        crystal_freq[c] = crystal_freq.get(c, 0) + 1
    top_crystals = sorted(crystal_freq.items(), key=lambda x: -x[1])[:3]

    # Most frequent elements
    elem_freq = {}
    for e in all_elements:
        elem_freq[e] = elem_freq.get(e, 0) + 1
    top_elements = sorted(elem_freq.items(), key=lambda x: -x[1])[:3]

    # Constellation meditation stats
    constellation_meds = await db.constellation_meditations.find(
        {"user_id": user_id}, {"_id": 0, "constellation_id": 1, "constellation_name": 1, "element": 1, "duration": 1}
    ).to_list(100)

    constellation_counts = {}
    total_med_minutes = 0
    for m in constellation_meds:
        constellation_counts[m["constellation_name"]] = constellation_counts.get(m["constellation_name"], 0) + 1
        total_med_minutes += m.get("duration", 0)
    top_constellations = sorted(constellation_counts.items(), key=lambda x: -x[1])[:5]

    # Mood history
    moods = await db.moods.find(
        {"user_id": user_id}, {"_id": 0, "mood": 1, "created_at": 1}
    ).sort("created_at", -1).to_list(30)
    mood_freq = {}
    for m in moods:
        mood_freq[m["mood"]] = mood_freq.get(m["mood"], 0) + 1
    top_moods = sorted(mood_freq.items(), key=lambda x: -x[1])[:5]

    # Gamification stats
    gam = await db.gamification.find_one({"user_id": user_id}, {"_id": 0})
    xp = gam.get("xp", 0) if gam else 0
    level = gam.get("level", 1) if gam else 1
    streak = gam.get("streak", 0) if gam else 0

    # Zen garden stats
    plants = await db.zen_plants.find({"user_id": user_id}, {"_id": 0, "plant_type": 1, "stage": 1, "water_count": 1}).to_list(20)
    total_waters = sum(p.get("water_count", 0) for p in plants)

    # Build the profile
    avg_energy = round(total_energy / energy_count, 1) if energy_count > 0 else 0
    dominant_system = max(system_counts.items(), key=lambda x: x[1])[0] if system_counts else None
    dominant_period = max(period_counts.items(), key=lambda x: x[1])[0] if any(v > 0 for v in period_counts.values()) else None
    dominant_energy_type = max(section_energies.items(), key=lambda x: x[1])[0] if any(v > 0 for v in section_energies.values()) else "neutral"

    return {
        "total_forecasts": len(forecasts),
        "system_counts": system_counts,
        "period_counts": period_counts,
        "dominant_system": dominant_system,
        "dominant_period": dominant_period,
        "avg_cosmic_energy": avg_energy,
        "dominant_energy_type": dominant_energy_type,
        "section_energies": section_energies,
        "recurring_numbers": [{"number": n, "count": c} for n, c in top_numbers],
        "recurring_crystals": [{"crystal": c, "count": ct} for c, ct in top_crystals],
        "recurring_elements": [{"element": e, "count": ct} for e, ct in top_elements],
        "constellation_meditations": {
            "total": len(constellation_meds),
            "total_minutes": total_med_minutes,
            "top_constellations": [{"name": n, "count": c} for n, c in top_constellations],
        },
        "mood_patterns": [{"mood": m, "count": c} for m, c in top_moods],
        "gamification": {"xp": xp, "level": level, "streak": streak},
        "garden": {"plants": len(plants), "total_waters": total_waters},
        "recent_forecasts": forecasts[:5],
    }
