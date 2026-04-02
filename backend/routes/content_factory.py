"""
Content Factory — Auto-generation hooks for the closed-loop economy.
Called from quest completion, mixer sessions, and community events.
"""
from deps import db, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone
import uuid
import random

SOLFEGGIO_FREQUENCIES = [174, 285, 396, 417, 432, 528, 639, 741, 852, 963]
BINAURAL_PRESETS = ["alpha_focus", "theta_dream", "delta_sleep", "gamma_insight", "beta_energy"]

TIME_PRESETS = {
    "morning": {"hz": 528, "binaural": "beta_energy", "mood": "energized", "mantra_hint": "morning awakening and purpose"},
    "afternoon": {"hz": 417, "binaural": "alpha_focus", "mood": "focused", "mantra_hint": "sustained clarity and productivity"},
    "evening": {"hz": 639, "binaural": "theta_dream", "mood": "reflective", "mantra_hint": "gratitude and winding down"},
    "night": {"hz": 963, "binaural": "delta_sleep", "mood": "tranquil", "mantra_hint": "deep rest and cosmic connection"},
}


async def _ai_mantra(context: str) -> str:
    """Generate a short mantra using Gemini. Falls back to presets."""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        llm = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"mantra-{uuid.uuid4().hex[:8]}",
            system_message="You are a cosmic wisdom generator. Return only the requested text, nothing else."
        )
        llm.with_model("gemini", "gemini-3-flash-preview")
        response = await llm.send_message(
            UserMessage(text=f"Generate ONE short, powerful spiritual affirmation (max 12 words) for: {context}. Return only the text.")
        )
        return response.strip().strip('"').strip("'")
    except Exception as e:
        logger.error(f"AI mantra fallback: {e}")
        fallbacks = [
            "Your victory echoes through the cosmos",
            "Strength flows where intention goes",
            "The universe rewards your persistence",
            "Every step forward reshapes reality",
            "Your energy signature grows stronger",
        ]
        return random.choice(fallbacks)


async def auto_generate_victory_mantra(user_id: str, quest_name: str) -> dict:
    """Auto-generate a Victory Mantra after quest completion."""
    try:
        mantra_text = await _ai_mantra(f"completing the quest '{quest_name}' — a warrior's triumph")
        asset_id = str(uuid.uuid4())
        asset = {
            "id": asset_id,
            "type": "victory_mantra",
            "name": mantra_text[:60],
            "description": f"Victory Mantra born from completing '{quest_name}'",
            "content": {"mantra": mantra_text, "energy": "victory", "context": quest_name},
            "base_price": 3,
            "source_section": "RPG/Quests",
            "creator_id": user_id,
            "activity_context": f"Quest: {quest_name}",
            "listed": True,
            "purchases": 0,
            "rating": 0,
            "auto_generated": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.content_assets.insert_one({**asset})
        asset.pop("_id", None)
        logger.info(f"Auto-generated victory mantra for {user_id}: {mantra_text[:40]}")
        return asset
    except Exception as e:
        logger.error(f"Auto-gen victory mantra error: {e}")
        return None


async def auto_generate_recovery_frequency(user_id: str, mix_name: str, volumes: dict = None) -> dict:
    """Auto-generate a Recovery Frequency after a Mixer session save."""
    try:
        base_freq = random.choice(SOLFEGGIO_FREQUENCIES)
        secondary_freq = random.choice([f for f in SOLFEGGIO_FREQUENCIES if f != base_freq])
        binaural = random.choice(BINAURAL_PRESETS)

        asset_id = str(uuid.uuid4())
        blend_name = f"{base_freq}Hz Recovery Resonance"
        asset = {
            "id": asset_id,
            "type": "recovery_frequency",
            "name": blend_name,
            "description": f"Recovery Frequency generated from '{mix_name}' session",
            "content": {
                "primary_hz": base_freq,
                "secondary_hz": secondary_freq,
                "binaural_preset": binaural,
                "blend_name": blend_name,
                "source_mix": mix_name,
                "description": f"A {binaural.replace('_', ' ')} blend at {base_freq}Hz from mixer session",
            },
            "base_price": 5,
            "source_section": "Wellness/Mixer",
            "creator_id": user_id,
            "activity_context": f"Mixer: {mix_name}",
            "listed": True,
            "purchases": 0,
            "rating": 0,
            "auto_generated": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.content_assets.insert_one({**asset})
        asset.pop("_id", None)
        logger.info(f"Auto-generated recovery frequency for {user_id}: {blend_name}")
        return asset
    except Exception as e:
        logger.error(f"Auto-gen recovery freq error: {e}")
        return None


def get_time_of_day() -> str:
    """Get current time-of-day category."""
    hour = datetime.now(timezone.utc).hour
    if 5 <= hour < 12:
        return "morning"
    elif 12 <= hour < 17:
        return "afternoon"
    elif 17 <= hour < 21:
        return "evening"
    else:
        return "night"
