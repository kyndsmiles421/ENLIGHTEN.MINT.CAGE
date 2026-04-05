from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from routes.evolution import SPECIMEN_METADATA, _compute_vc, _get_stage
from datetime import datetime, timezone
import os

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  LIVING JOURNAL — AI-Generated Discovery Narratives
#  Combines geological data + spiritual lore + personal context
#  Uses Gemini for procedural storytelling
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


async def _generate_discovery_narrative(specimen: dict, meta: dict, context: dict) -> str:
    """Generate a personalized discovery narrative using Gemini."""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage

        llm = LlmChat(
            api_key=os.environ.get("EMERGENT_LLM_KEY", ""),
            session_id=f"journal_{specimen.get('name', 'unknown')}",
            system_message="You are the Living Journal of The ENLIGHTEN.MINT.CAFE — a mystical geology-based wellness platform. Write brief, evocative, poetic journal entries.",
        ).with_model("gemini", "gemini-3-flash-preview")

        from routes.evolution import _get_current_season
        season = _get_current_season()

        prompt = f"""Write a brief, evocative journal entry (3-4 sentences) about a user's mineral discovery.

Specimen: {specimen.get('name', 'Unknown')}
Element: {specimen.get('element', 'earth')}
Rarity: {specimen.get('rarity', 'common')}
Mohs Hardness: {specimen.get('mohs', 5)}

Geological Data:
- Crystal System: {meta.get('crystal_system', 'Unknown')}
- Cleavage: {meta.get('cleavage', 'Unknown')}

Spiritual Data:
- Chakra: {meta.get('chakra', 'Heart')}
- Frequency: {meta.get('frequency', 528)} Hz
- Mantra: {meta.get('mantra', '')}

Context:
- Current Season: {season.get('name', 'Eruption')} ({season.get('rock_type', 'Igneous')})
- Layer: {context.get('layer', 'terrestrial')}
- Mine Biome: {context.get('biome', 'earth')}
- Time of Day: {context.get('time_of_day', 'day')}
- Discovery Number: {context.get('discovery_count', 1)}

Write in second person ("You discovered..."). Blend scientific wonder with spiritual significance.
Keep it mystical but grounded. No emojis. 3-4 sentences maximum."""

        response = await llm.send_message(UserMessage(text=prompt))

        return response.strip() if isinstance(response, str) else str(response).strip()
    except Exception as e:
        logger.error(f"Living Journal generation error: {e}")
        # Fallback narrative
        name = specimen.get("name", "Unknown")
        chakra = meta.get("chakra", "Heart")
        freq = meta.get("frequency", 528)
        return f"Deep within the {context.get('biome', 'earth')} formations, you uncovered {name}. Its {chakra} resonance at {freq} Hz hummed through your fingertips as you freed it from the stone. This specimen carries the memory of millennia, waiting for this moment of rediscovery."


@router.get("/journal/entries")
async def get_journal(user=Depends(get_current_user)):
    """Get user's Living Journal entries."""
    entries = await db.living_journal.find(
        {"user_id": user["id"]},
        {"_id": 0, "user_id": 0},
    ).sort("timestamp", -1).to_list(50)
    return {"entries": entries, "total": len(entries)}


@router.get("/journal/for-specimen/{specimen_id}")
async def get_specimen_journal(specimen_id: str, user=Depends(get_current_user)):
    """Get all journal entries for a specific specimen."""
    entries = await db.living_journal.find(
        {"user_id": user["id"], "specimen_id": specimen_id},
        {"_id": 0, "user_id": 0},
    ).sort("timestamp", -1).to_list(20)
    return {"entries": entries, "specimen_id": specimen_id}


@router.post("/journal/generate")
async def generate_entry(data: dict = Body(...), user=Depends(get_current_user)):
    """Generate a new Living Journal entry for a specimen discovery."""
    user_id = user["id"]
    specimen_id = data.get("specimen_id")
    biome = data.get("biome", "earth")
    layer = data.get("layer", "terrestrial")

    if not specimen_id:
        raise HTTPException(400, "specimen_id required")

    # Get specimen from collection
    owned = await db.rock_hounding_collection.find_one(
        {"user_id": user_id, "specimen_id": specimen_id},
        {"_id": 0, "user_id": 0},
    )
    if not owned:
        raise HTTPException(404, "Specimen not in your collection")

    meta = SPECIMEN_METADATA.get(specimen_id, {})

    # Count previous entries
    count = await db.living_journal.count_documents(
        {"user_id": user_id, "specimen_id": specimen_id}
    )

    # Determine time of day
    hour = datetime.now(timezone.utc).hour
    time_of_day = "dawn" if 5 <= hour < 9 else "day" if 9 <= hour < 17 else "dusk" if 17 <= hour < 21 else "night"

    context = {
        "biome": biome,
        "layer": layer,
        "time_of_day": time_of_day,
        "discovery_count": count + 1,
    }

    # Generate narrative
    narrative = await _generate_discovery_narrative(owned, meta, context)

    # Get evolution stage
    evo = await db.evolution_tracker.find_one(
        {"user_id": user_id, "asset_id": specimen_id}, {"_id": 0}
    )
    vc = _compute_vc(evo or {"interactions": 0})
    stage = _get_stage(vc)

    # Save entry
    now = datetime.now(timezone.utc).isoformat()
    entry = {
        "user_id": user_id,
        "specimen_id": specimen_id,
        "specimen_name": owned.get("name", "Unknown"),
        "element": owned.get("element"),
        "rarity": owned.get("best_rarity", "common"),
        "narrative": narrative,
        "geological_data": {
            "crystal_system": meta.get("crystal_system"),
            "cleavage": meta.get("cleavage"),
            "mohs": owned.get("mohs"),
        },
        "spiritual_data": {
            "chakra": meta.get("chakra"),
            "frequency": meta.get("frequency"),
            "mantra": meta.get("mantra"),
        },
        "context": context,
        "evolution_stage": stage["name"],
        "vitality_coefficient": vc,
        "timestamp": now,
        "entry_number": count + 1,
    }
    await db.living_journal.insert_one(entry)
    # Remove MongoDB _id and user_id from response
    entry.pop("_id", None)
    entry.pop("user_id", None)

    # Award XP for journaling
    from routes.game_core import award_xp
    await award_xp(user_id, 5, f"journal:{specimen_id}")

    # Contribute to communal enlightenment goal
    await db.communal_progress.update_one(
        {"goal_id": "enlightenment"},
        {"$inc": {"current": 1}, "$set": {"updated_at": now}},
        upsert=True,
    )

    return {"entry": entry, "rewards": {"xp": 5}}


@router.post("/journal/add-reflection")
async def add_reflection(data: dict = Body(...), user=Depends(get_current_user)):
    """Add a personal reflection to an existing journal entry."""
    user_id = user["id"]
    specimen_id = data.get("specimen_id")
    reflection = data.get("reflection", "").strip()
    entry_number = data.get("entry_number", 1)

    if not specimen_id or not reflection:
        raise HTTPException(400, "specimen_id and reflection required")
    if len(reflection) > 1000:
        raise HTTPException(400, "Reflection must be 1000 characters or fewer")

    result = await db.living_journal.update_one(
        {"user_id": user_id, "specimen_id": specimen_id, "entry_number": entry_number},
        {
            "$set": {
                "personal_reflection": reflection,
                "reflection_added_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )

    if result.modified_count == 0:
        raise HTTPException(404, "Journal entry not found")

    return {"reflection_added": True, "specimen_id": specimen_id}
