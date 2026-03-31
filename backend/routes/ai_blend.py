from fastapi import APIRouter, Depends, Body
from deps import db, get_current_user, EMERGENT_LLM_KEY
from datetime import datetime, timezone, timedelta
from routes.subscriptions import get_user_credits, tier_level, deduct_credits
import json

router = APIRouter()

# ─── Mood → Frequency Algorithmic Engine ───
MOOD_FREQ_RULES = {
    "stressed":  {"primary": [396, 174], "sounds": ["rain", "ocean"], "drone": "singing-bowl", "desc": "Dissolving tension"},
    "anxious":   {"primary": [417, 432], "sounds": ["rain", "stream"], "drone": "tanpura-drone", "desc": "Calming anxiety"},
    "sad":       {"primary": [639, 528], "sounds": ["ocean", "forest"], "drone": "cello-drone", "desc": "Lifting the heart"},
    "angry":     {"primary": [174, 396], "sounds": ["ocean", "wind"], "drone": "didgeridoo-drone", "desc": "Grounding fire"},
    "happy":     {"primary": [528, 963], "sounds": ["stream", "forest"], "drone": "kalimba-drone", "desc": "Amplifying joy"},
    "peaceful":  {"primary": [432, 852], "sounds": ["ocean", "night"], "drone": "bowl-drone", "desc": "Deepening peace"},
    "tired":     {"primary": [852, 963], "sounds": ["stream", "fire"], "drone": "flute-drone", "desc": "Gentle awakening"},
    "grateful":  {"primary": [963, 528], "sounds": ["forest", "stream"], "drone": "harp-drone", "desc": "Celebrating gratitude"},
    "confused":  {"primary": [741, 852], "sounds": ["rain", "cave"], "drone": "shakuhachi-drone", "desc": "Finding clarity"},
    "neutral":   {"primary": [432, 528], "sounds": ["ocean"], "drone": "harmonium-drone", "desc": "Centering balance"},
}


async def get_mood_history(user_id: str, days: int = 7):
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    moods = await db.moods.find(
        {"user_id": user_id, "created_at": {"$gte": cutoff}},
        {"_id": 0, "mood": 1, "score": 1, "note": 1, "created_at": 1}
    ).sort("created_at", -1).to_list(50)
    return moods


def algorithmic_blend(moods):
    """Rule-based frequency blend from mood patterns."""
    if not moods:
        return MOOD_FREQ_RULES["neutral"], "neutral", "No mood data — here's a balanced blend."

    mood_counts = {}
    for m in moods:
        mood = m.get("mood", "neutral").lower()
        mood_counts[mood] = mood_counts.get(mood, 0) + 1

    dominant = max(mood_counts, key=mood_counts.get)
    rules = MOOD_FREQ_RULES.get(dominant, MOOD_FREQ_RULES["neutral"])

    avg_score = sum(m.get("score", 5) for m in moods) / len(moods)
    intensity = "gentle" if avg_score < 4 else "moderate" if avg_score < 7 else "vibrant"

    summary = f"Your dominant energy this week: {dominant}. Intensity: {intensity}. {rules['desc']}."
    return rules, dominant, summary


async def ai_enhanced_blend(moods, user_id):
    """GPT-4o powered deep analysis of mood patterns → custom blend."""
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    mood_text = "\n".join([
        f"- {m.get('mood', '?')} (score {m.get('score', '?')}/10) — {m.get('note', 'no note')} [{m.get('created_at', '')[:10]}]"
        for m in moods[:20]
    ])

    prompt = f"""You are a wellness sound therapist. Analyze this user's mood journal from the past 7 days and create a personalized healing frequency blend.

MOOD DATA:
{mood_text}

AVAILABLE FREQUENCIES (Hz): 174, 285, 396, 417, 432, 528, 639, 741, 852, 963, 7.83, 10, 40, 111, 1111
AVAILABLE SOUNDS: rain, ocean, wind, fire, singing-bowl, thunder, stream, forest, cave, night, waterfall
AVAILABLE DRONES: sitar-drone, tanpura-drone, didgeridoo-drone, bowl-drone, flute-drone, erhu-drone, oud-drone, harmonium-drone, shakuhachi-drone, koto-drone, hang-drum-drone, cello-drone, tibetan-horn, harp-drone, kalimba-drone, bagpipe-drone

Return ONLY a JSON object (no markdown):
{{
  "primary": [2-3 frequency Hz numbers],
  "sounds": [1-2 sound IDs],
  "drone": "one drone ID",
  "desc": "One sentence why this blend helps them",
  "insight": "2-3 sentences analyzing their emotional pattern and what this blend addresses",
  "blend_name": "A poetic name for this custom blend"
}}"""

    llm = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"ai-blend-{user_id[:8]}",
        system_message="You are a wellness sound therapist specializing in frequency healing and mood analysis."
    )
    response = await llm.send_message(UserMessage(text=prompt))
    text = response.strip()

    # Strip markdown fences if present
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()

    result = json.loads(text)
    return result


@router.post("/mixer/ai-blend")
async def get_ai_frequency_blend(user=Depends(get_current_user), body: dict = Body(default={})):
    """Generate a personalized frequency blend based on mood history.
    Free users get algorithmic blend. Plus+ users get AI-enhanced blend.
    """
    moods = await get_mood_history(user["id"], days=7)
    credits = await get_user_credits(user["id"])
    user_tier = credits.get("tier", "free")
    user_level = tier_level(user_tier)
    plus_level = tier_level("plus")

    is_premium = user_level >= plus_level or credits.get("is_admin")

    if is_premium and moods:
        try:
            deduction = await deduct_credits(user["id"], "text_generation")
            if not deduction["allowed"]:
                # Fall back to algorithmic if out of credits
                rules, dominant, summary = algorithmic_blend(moods)
                return {
                    "type": "algorithmic",
                    "blend": rules,
                    "dominant_mood": dominant,
                    "summary": summary,
                    "mood_count": len(moods),
                    "is_premium": True,
                    "fallback": True,
                    "remaining_credits": deduction["remaining"],
                }

            ai_result = await ai_enhanced_blend(moods, user["id"])
            return {
                "type": "ai_enhanced",
                "blend": {
                    "primary": ai_result.get("primary", [432]),
                    "sounds": ai_result.get("sounds", []),
                    "drone": ai_result.get("drone"),
                    "desc": ai_result.get("desc", ""),
                },
                "insight": ai_result.get("insight", ""),
                "blend_name": ai_result.get("blend_name", "Custom Blend"),
                "dominant_mood": moods[0].get("mood", "neutral") if moods else "neutral",
                "summary": ai_result.get("desc", ""),
                "mood_count": len(moods),
                "is_premium": True,
                "remaining_credits": deduction.get("remaining"),
            }
        except Exception:
            # Fall back to algorithmic on AI error
            rules, dominant, summary = algorithmic_blend(moods)
            return {
                "type": "algorithmic",
                "blend": rules,
                "dominant_mood": dominant,
                "summary": summary,
                "mood_count": len(moods),
                "is_premium": True,
                "fallback": True,
            }
    else:
        rules, dominant, summary = algorithmic_blend(moods)
        return {
            "type": "algorithmic",
            "blend": rules,
            "dominant_mood": dominant,
            "summary": summary,
            "mood_count": len(moods),
            "is_premium": False,
            "upgrade_hint": "Upgrade to Plus for AI-personalized blends with deep mood analysis" if not is_premium else None,
        }
