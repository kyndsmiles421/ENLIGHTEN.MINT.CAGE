from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from emergentintegrations.llm.chat import LlmChat, UserMessage
from datetime import datetime, timezone, timedelta
from utils.compliance_labels import safe_module
import uuid
import asyncio
import random

router = APIRouter()

ALL_FEATURES = [
    {"id": "breathing", "name": "Breathwork", "path": "/breathing", "category": "body", "color": "#2DD4BF",
     "desc": "Guided breathing patterns to calm your nervous system", "db_collection": "breathing_sessions"},
    {"id": "meditation", "name": "Meditation", "path": "/meditation", "category": "mind", "color": "#D8B4FE",
     "desc": "Still the mind through guided or silent practice", "db_collection": "custom_meditations"},
    {"id": "yoga", "name": "Yoga", "path": "/yoga", "category": "body", "color": "#FB923C",
     "desc": "7 sacred yoga styles from Hatha to Nidra", "db_collection": "yoga_sessions"},
    {"id": "aromatherapy", "name": "Aromatic Resonance", "path": "/aromatherapy", "category": "resonance", "color": "#C084FC",
     "desc": "Essential oils for chakra alignment and emotional balance", "db_collection": "aroma_favorites"},
    {"id": "herbology", "name": "Herbology", "path": "/herbology", "category": "resonance", "color": "#22C55E",
     "desc": "Ancient plant wisdom for holistic health", "db_collection": "herb_cabinet"},
    {"id": "elixirs", "name": "Elixirs & Drinks", "path": "/elixirs", "category": "nourishment", "color": "#FB923C",
     "desc": "Sacred beverages from Golden Milk to Ceremonial Cacao", "db_collection": "elixir_favorites"},
    {"id": "acupressure", "name": "Acupressure", "path": "/acupressure", "category": "resonance", "color": "#EF4444",
     "desc": "Ancient pressure points for pain relief and energy flow", "db_collection": "acupressure_sessions"},
    {"id": "reiki", "name": "Reiki & Aura", "path": "/reiki", "category": "energy", "color": "#818CF8",
     "desc": "Energy alignment, aura readings, and chakra resonance", "db_collection": "reiki_sessions"},
    {"id": "numerology", "name": "Numerology", "path": "/numerology", "category": "divination", "color": "#FCD34D",
     "desc": "Discover your core numbers and life path", "db_collection": None},
    {"id": "cardology", "name": "Sacred Cardology", "path": "/cardology", "category": "divination", "color": "#D4AF37",
     "desc": "Birth cards and yearly spread via Magi Formula", "db_collection": None},
    {"id": "mayan", "name": "Mayan Astrology", "path": "/mayan", "category": "divination", "color": "#A78BFA",
     "desc": "Your Tzolk'in day sign and galactic tone", "db_collection": None},
    {"id": "oracle", "name": "Oracle Divination", "path": "/oracle", "category": "divination", "color": "#E879F9",
     "desc": "Tarot, zodiac, I Ching, and sacred geometry readings", "db_collection": "readings"},
    {"id": "teachings", "name": "Spiritual Teachings", "path": "/teachings", "category": "wisdom", "color": "#3B82F6",
     "desc": "11 master teachers across every tradition", "db_collection": None},
    {"id": "totems", "name": "Animal Totems", "path": "/animal-totems", "category": "nature", "color": "#86EFAC",
     "desc": "Birth totems and spirit animal guides", "db_collection": None},
    {"id": "dreams", "name": "Dream Interpretation", "path": "/dreams", "category": "nature", "color": "#6366F1",
     "desc": "AI dream analysis and 41 symbol library", "db_collection": "dreams"},
    {"id": "green_journal", "name": "Green Journal", "path": "/green-journal", "category": "nature", "color": "#16A34A",
     "desc": "Nature observation and plant spirit journal", "db_collection": "green_journal"},
    {"id": "meal_planning", "name": "Meal Planning", "path": "/meal-planning", "category": "nourishment", "color": "#22C55E",
     "desc": "Conscious nourishment with 5 themed meal plans", "db_collection": "meal_logs"},
    {"id": "mantras", "name": "Mantras", "path": "/mantras", "category": "sound", "color": "#FB923C",
     "desc": "Sacred chants for vibrational resonance", "db_collection": "custom_mantras"},
    {"id": "mudras", "name": "Mudras", "path": "/mudras", "category": "body", "color": "#FDA4AF",
     "desc": "Sacred hand gestures for energy flow", "db_collection": None},
    {"id": "frequencies", "name": "Frequencies", "path": "/frequencies", "category": "sound", "color": "#8B5CF6",
     "desc": "Solfeggio and binaural resonant frequencies", "db_collection": None},
    {"id": "light_therapy", "name": "Light Resonance", "path": "/light-therapy", "category": "senses", "color": "#A855F7",
     "desc": "Chromatic resonance colors for chakra alignment", "db_collection": None},
    {"id": "zen_garden", "name": "Zen Garden", "path": "/zen-garden", "category": "decompression", "color": "#22C55E",
     "desc": "Nurture plants and find stillness", "db_collection": "zen_plants"},
    {"id": "hooponopono", "name": "Ho'oponopono", "path": "/hooponopono", "category": "spirit", "color": "#E879F9",
     "desc": "Hawaiian art of forgiveness and reconciliation", "db_collection": None},
]


@router.get("/discover/suggestions")
async def get_suggestions(user=Depends(get_current_user)):
    uid = user["id"]
    used_features = set()
    for feat in ALL_FEATURES:
        if feat["db_collection"]:
            count = await db[feat["db_collection"]].count_documents({"user_id": uid})
            if count > 0:
                used_features.add(feat["id"])
    unused = [f for f in ALL_FEATURES if f["id"] not in used_features]
    random.shuffle(unused)
    suggestions = unused[:3] if len(unused) >= 3 else unused
    return {
        "suggestions": [safe_module(f) for f in suggestions],
        "total_features": len(ALL_FEATURES),
        "explored": len(used_features),
        "unexplored": len(unused),
        "exploration_percent": round(len(used_features) / len(ALL_FEATURES) * 100) if ALL_FEATURES else 0,
    }


@router.get("/discover/personalized")
async def get_personalized_suggestion(user=Depends(get_current_user)):
    uid = user["id"]
    recent_moods = await db.moods.find({"user_id": uid}, {"_id": 0, "mood": 1}).sort("created_at", -1).to_list(5)
    mood_list = [m.get("mood", "") for m in recent_moods]
    dominant_mood = mood_list[0] if mood_list else "neutral"
    mood_feature_map = {
        "stressed": ["breathing", "aromatherapy", "acupressure", "reiki", "zen_garden"],
        "anxious": ["meditation", "acupressure", "reiki", "frequencies", "hooponopono"],
        "sad": ["mantras", "light_therapy", "teachings", "elixirs", "yoga"],
        "angry": ["breathing", "hooponopono", "acupressure", "yoga", "zen_garden"],
        "happy": ["meal_planning", "dreams", "numerology", "cardology", "totems"],
        "peaceful": ["meditation", "reiki", "teachings", "dreams", "green_journal"],
        "tired": ["acupressure", "elixirs", "yoga", "frequencies", "light_therapy"],
        "grateful": ["green_journal", "teachings", "mantras", "meal_planning", "dreams"],
        "confused": ["oracle", "numerology", "cardology", "mayan", "teachings"],
        "neutral": ["yoga", "aromatherapy", "herbology", "meditation", "totems"],
    }
    recommended_ids = mood_feature_map.get(dominant_mood, mood_feature_map["neutral"])
    recommended = [f for f in ALL_FEATURES if f["id"] in recommended_ids]
    return {
        "mood": dominant_mood,
        "recommended": [safe_module(f) for f in recommended[:3]],
        "reason": f"Based on your recent {dominant_mood} energy, these practices may serve you well"
    }
