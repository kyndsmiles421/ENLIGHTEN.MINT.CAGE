from fastapi import APIRouter, Depends
from deps import db, get_current_user
from datetime import datetime, timezone

router = APIRouter()


@router.get("/hexagram/journal")
async def get_hexagram_journal(limit: int = 50, user=Depends(get_current_user)):
    """Retrieve the user's hexagram transition history (Book of Changes)."""
    entries = await db.hexagram_journal.find(
        {"user_id": user["id"]},
        {"_id": 0},
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    return {"entries": entries, "total": len(entries)}


@router.post("/hexagram/journal/record")
async def record_hexagram_transition(user=Depends(get_current_user)):
    """Compute current hexagram and record if it differs from the last entry."""
    from routes.hexagram import (
        compute_hexagram_bits, bits_to_hexagram_number, compute_changing_lines,
        hexagram_to_trigrams, HEXAGRAM_NAMES, SOLFEGGIO, TIERS, ELEMENTS,
    )
    from routes.sovereign_math import element_ode_rhs, rk4_step

    uid = user["id"]

    # Gather conditions (same as hexagram/current)
    tier_doc = await db.mastery_tiers.find_one({"user_id": uid}, {"_id": 0})
    tier_name = tier_doc.get("balance_tier", "observer") if tier_doc else "observer"
    tier_idx = TIERS.index(tier_name) if tier_name in TIERS else 0

    garden = await db.user_garden.find({"user_id": uid}, {"_id": 0}).to_list(24)
    garden_masses = {}
    elements_in_garden = set()
    for g in garden:
        elem = g.get("element", "Earth")
        garden_masses[elem] = garden_masses.get(elem, 0) + g.get("gravity_mass", 60)
        elements_in_garden.add(elem)

    current_hour = datetime.now(timezone.utc).hour + datetime.now(timezone.utc).minute / 60.0
    initial = [1.0 + garden_masses.get(e, 0) / 100.0 for e in ELEMENTS]
    state_now = list(initial)
    dt_sim = 0.25
    for step in range(int(current_hour * 4)):
        h = (step * dt_sim) % 24
        state_now = rk4_step(state_now, h, dt_sim, garden_masses)

    import math
    mean_energy = sum(state_now) / 5.0
    max_dev = max(abs(state_now[i] - mean_energy) for i in range(5))
    equilibrium_score = max(0, 100 - max_dev * 40) if mean_energy > 0 else 0

    wheel_doc = await db.wheel_interactions.find_one({"user_id": uid}, {"_id": 0})
    explored_elements = set(elements_in_garden)
    if wheel_doc:
        for elem in ELEMENTS:
            if wheel_doc.get(f"{elem.lower()}_count", 0) > 0:
                explored_elements.add(elem)

    archives_count = await db.archive_progress.count_documents({"user_id": uid})
    recipes_count = await db.frequency_recipes.count_documents({"user_id": uid})
    trades_count = await db.trade_listings.count_documents({
        "$or": [{"seller_id": uid}, {"buyer_id": uid}],
        "status": "completed",
    })

    bits = compute_hexagram_bits(
        garden_masses, tier_idx, len(explored_elements),
        archives_count, recipes_count, trades_count, equilibrium_score,
    )
    hex_number = bits_to_hexagram_number(bits)
    hex_info = HEXAGRAM_NAMES.get(hex_number, ("?", "Unknown", "Mystery"))

    # Check if different from last journal entry
    last_entry = await db.hexagram_journal.find_one(
        {"user_id": uid}, {"_id": 0}, sort=[("timestamp", -1)]
    )
    if last_entry and last_entry.get("hexagram_number") == hex_number:
        return {"recorded": False, "reason": "no_change", "hexagram_number": hex_number}

    changing = compute_changing_lines(
        equilibrium_score, tier_idx, len(explored_elements),
        archives_count, recipes_count, trades_count,
    )

    derivatives = element_ode_rhs(state_now, current_hour, garden_masses)
    total_rate = sum(abs(d) for d in derivatives)
    stability = "stable" if total_rate < 0.1 else "shifting" if total_rate < 0.3 else "volatile"

    entry = {
        "user_id": uid,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "hexagram_number": hex_number,
        "chinese": hex_info[0],
        "pinyin": hex_info[1],
        "name": hex_info[2],
        "bits": bits,
        "trigrams": hexagram_to_trigrams(hex_number),
        "solfeggio_hz": SOLFEGGIO[(hex_number - 1) % 9],
        "equilibrium_score": round(equilibrium_score, 1),
        "stability": stability,
        "tier": tier_name,
        "changing_lines": changing,
        "previous_hexagram": last_entry.get("hexagram_number") if last_entry else None,
        "energies": {ELEMENTS[i]: round(state_now[i], 4) for i in range(5)},
    }

    await db.hexagram_journal.insert_one(entry)
    entry.pop("_id", None)

    return {"recorded": True, "entry": entry}
