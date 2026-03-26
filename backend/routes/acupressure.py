from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from emergentintegrations.llm.chat import LlmChat, UserMessage
from datetime import datetime, timezone, timedelta
import uuid
import asyncio
import random

router = APIRouter()

ACUPRESSURE_POINTS = [
    {"id": "li4", "name": "He Gu (LI4)", "location": "Web between thumb and index finger",
     "meridian": "Large Intestine", "element": "Metal", "color": "#E5E7EB",
     "technique": "Press firmly with opposite thumb, rotating in small circles for 1-2 minutes per hand",
     "benefits": ["Headache relief", "Stress reduction", "Pain anywhere in body", "Immune boost", "Facial tension"],
     "conditions": ["Headaches", "Migraines", "Toothache", "Colds", "Constipation"],
     "caution": "Avoid during pregnancy — can stimulate contractions",
     "depth": "Firm, deep pressure", "duration": "1-2 minutes each side",
     "spiritual": "Gateway point — opens the flow of qi throughout the entire body"},
    {"id": "pc6", "name": "Nei Guan (PC6)", "location": "Inner wrist, 2 finger-widths from crease, between tendons",
     "meridian": "Pericardium", "element": "Fire", "color": "#EF4444",
     "technique": "Press with thumb pad, hold steady pressure or gentle circular motion for 2-3 minutes",
     "benefits": ["Nausea relief", "Anxiety reduction", "Heart calming", "Motion sickness", "Insomnia"],
     "conditions": ["Nausea", "Anxiety", "Palpitations", "Chest tightness", "Insomnia"],
     "caution": "Generally very safe. Press gently if wrist is tender.",
     "depth": "Moderate, steady pressure", "duration": "2-3 minutes each wrist",
     "spiritual": "Inner gate — opens the heart protector, calms the spirit (Shen)"},
    {"id": "lv3", "name": "Tai Chong (LV3)", "location": "Top of foot, between big toe and second toe, in the depression",
     "meridian": "Liver", "element": "Wood", "color": "#22C55E",
     "technique": "Press with thumb, angling slightly toward the big toe bone. Hold or use small circles.",
     "benefits": ["Stress relief", "Anger management", "Eye health", "Menstrual regulation", "Detoxification"],
     "conditions": ["Stress", "Irritability", "Headaches", "Eye strain", "PMS", "Insomnia"],
     "caution": "May be tender if liver qi is stagnant — breathe through it.",
     "depth": "Moderate to firm", "duration": "1-2 minutes each foot",
     "spiritual": "The Great Surge — moves stagnant qi, restores smooth flow of life force"},
    {"id": "st36", "name": "Zu San Li (ST36)", "location": "Below knee, 4 finger-widths down from kneecap, outer side of shinbone",
     "meridian": "Stomach", "element": "Earth", "color": "#FB923C",
     "technique": "Press firmly with thumb or knuckle. Can also tap briskly for stimulation.",
     "benefits": ["Energy boost", "Digestive health", "Immune strength", "Longevity", "Overall vitality"],
     "conditions": ["Fatigue", "Digestive issues", "Weak immunity", "Knee pain", "Depression"],
     "caution": "Avoid strong stimulation late at night — can be too energizing.",
     "depth": "Firm, deep pressure", "duration": "2-3 minutes each leg",
     "spiritual": "The Longevity Point — ancient masters pressed this daily for health and spiritual endurance"},
    {"id": "gv20", "name": "Bai Hui (GV20)", "location": "Top of head, at the crown — intersection of line from ear tips and midline",
     "meridian": "Governing Vessel", "element": "Yang/Fire", "color": "#A78BFA",
     "technique": "Press gently with fingertip or tap lightly. Can also hold with palm over point.",
     "benefits": ["Mental clarity", "Headache relief", "Mood elevation", "Spiritual connection", "Memory"],
     "conditions": ["Brain fog", "Depression", "Headaches", "Insomnia", "Prolapse conditions"],
     "caution": "Use gentle pressure only. Avoid if you have high blood pressure.",
     "depth": "Light to moderate", "duration": "1-2 minutes",
     "spiritual": "Hundred Meetings — the crown point where all yang energy converges, gateway to higher consciousness"},
    {"id": "ki1", "name": "Yong Quan (KI1)", "location": "Bottom of foot, in the depression when toes curl, front 1/3 of sole",
     "meridian": "Kidney", "element": "Water", "color": "#3B82F6",
     "technique": "Press firmly with thumb knuckle. Roll a tennis ball under foot for broader stimulation.",
     "benefits": ["Grounding", "Insomnia relief", "Anxiety reduction", "Hot flash relief", "Energy descent"],
     "conditions": ["Insomnia", "Anxiety", "Dizziness", "High blood pressure", "Night sweats"],
     "caution": "Can be very tender. Start gently and increase pressure gradually.",
     "depth": "Firm, sustained pressure", "duration": "2-3 minutes each foot",
     "spiritual": "Bubbling Spring — the root point, connects you to Earth's energy, grounds scattered qi"},
    {"id": "cv17", "name": "Shan Zhong (CV17)", "location": "Center of chest, on the breastbone, level with the nipples",
     "meridian": "Conception Vessel", "element": "Yin/Air", "color": "#FDA4AF",
     "technique": "Press gently with fingertips or palm. Breathe deeply while holding. Can also rub in circles.",
     "benefits": ["Chest opening", "Grief release", "Anxiety relief", "Breathing improvement", "Heart healing"],
     "conditions": ["Chest tightness", "Grief", "Asthma", "Anxiety", "Lactation issues"],
     "caution": "Use gentle pressure — the sternum is sensitive.",
     "depth": "Light, nurturing pressure", "duration": "1-3 minutes",
     "spiritual": "Sea of Tranquility — opens the heart center, releases stored grief, invites unconditional love"},
    {"id": "gb20", "name": "Feng Chi (GB20)", "location": "Base of skull, in the hollow between the two neck muscles",
     "meridian": "Gallbladder", "element": "Wood", "color": "#16A34A",
     "technique": "Press with thumbs, angling upward toward the opposite eye. Hold or use small circles.",
     "benefits": ["Headache relief", "Neck tension", "Eye strain", "Cold symptoms", "Mental clarity"],
     "conditions": ["Tension headaches", "Stiff neck", "Blurred vision", "Common cold", "Dizziness"],
     "caution": "Avoid excessive pressure. Do not press if there is neck injury.",
     "depth": "Moderate, upward-angled pressure", "duration": "1-2 minutes",
     "spiritual": "Wind Pool — clears wind from the mind, sharpens perception and intuition"},
    {"id": "ht7", "name": "Shen Men (HT7)", "location": "Inner wrist crease, on the pinky side, in the small depression",
     "meridian": "Heart", "element": "Fire", "color": "#EC4899",
     "technique": "Press gently with thumbnail or fingertip. Hold with calm breathing.",
     "benefits": ["Insomnia relief", "Anxiety reduction", "Emotional balance", "Heart calming", "Memory"],
     "conditions": ["Insomnia", "Anxiety", "Panic attacks", "Emotional overwhelm", "Palpitations"],
     "caution": "Use gentle pressure — very sensitive point.",
     "depth": "Light, precise pressure", "duration": "1-2 minutes each wrist",
     "spiritual": "Spirit Gate — the doorway to the heart's deepest chamber, calms the Shen (spirit)"},
    {"id": "sp6", "name": "San Yin Jiao (SP6)", "location": "Inner leg, 4 finger-widths above ankle bone, behind the shinbone",
     "meridian": "Spleen", "element": "Earth", "color": "#FCD34D",
     "technique": "Press with thumb, perpendicular to the bone. Hold steady or use gentle circles.",
     "benefits": ["Hormonal balance", "Digestive health", "Sleep improvement", "Pain relief", "Blood nourishment"],
     "conditions": ["Menstrual issues", "Insomnia", "Digestive weakness", "Fatigue", "Skin problems"],
     "caution": "AVOID during pregnancy — can stimulate uterine contractions.",
     "depth": "Moderate to firm", "duration": "2-3 minutes each leg",
     "spiritual": "Three Yin Intersection — where three yin meridians meet, deeply nourishing to yin essence"},
]

MASSAGE_ROUTINES = [
    {"id": "stress_relief", "name": "Stress Relief Sequence", "duration": "10 min", "color": "#93C5FD",
     "points": ["li4", "pc6", "lv3", "ht7", "gv20"],
     "instructions": "Start with deep breaths. Work each point for 1-2 minutes. Breathe into any tenderness. End with palms over eyes.",
     "best_for": "After a stressful day, before meditation"},
    {"id": "energy_boost", "name": "Morning Energy Activation", "duration": "8 min", "color": "#FB923C",
     "points": ["st36", "li4", "gv20", "ki1"],
     "instructions": "Tap briskly on ST36 to awaken. Press LI4 firmly. Tap GV20 lightly. Massage KI1 to ground the energy.",
     "best_for": "Morning wake-up, afternoon slump"},
    {"id": "deep_sleep", "name": "Deep Sleep Protocol", "duration": "12 min", "color": "#6366F1",
     "points": ["ht7", "sp6", "ki1", "pc6", "gv20"],
     "instructions": "Dim lights. Press each point gently and slowly. Focus on exhaling longer than inhaling. End with KI1 to draw energy down.",
     "best_for": "30 minutes before bed"},
    {"id": "headache_relief", "name": "Headache & Migraine Relief", "duration": "8 min", "color": "#EF4444",
     "points": ["li4", "gb20", "lv3", "gv20"],
     "instructions": "Start with LI4 — the master pain point. Move to GB20 at skull base. Press LV3 on feet. Finish with gentle GV20.",
     "best_for": "At onset of headache or tension"},
    {"id": "emotional_balance", "name": "Emotional Heart Healing", "duration": "10 min", "color": "#FDA4AF",
     "points": ["cv17", "ht7", "pc6", "lv3"],
     "instructions": "Begin with hand on heart (CV17). Breathe love into the center. Move to HT7 and PC6. Close with LV3 to release stagnation.",
     "best_for": "Grief, heartbreak, emotional overwhelm"},
    {"id": "immune_shield", "name": "Immune Shield Activation", "duration": "8 min", "color": "#22C55E",
     "points": ["st36", "li4", "sp6", "gv20"],
     "instructions": "Press ST36 firmly for immune activation. Work LI4 for defense. SP6 for blood nourishment. GV20 to raise yang qi.",
     "best_for": "Season changes, feeling run down"},
]


@router.get("/acupressure/points")
async def get_points():
    return {"points": ACUPRESSURE_POINTS}


@router.get("/acupressure/point/{point_id}")
async def get_point(point_id: str):
    point = next((p for p in ACUPRESSURE_POINTS if p["id"] == point_id), None)
    if not point:
        raise HTTPException(status_code=404, detail="Point not found")
    return point


@router.get("/acupressure/routines")
async def get_routines():
    return {"routines": MASSAGE_ROUTINES}


@router.get("/acupressure/routine/{routine_id}")
async def get_routine(routine_id: str):
    routine = next((r for r in MASSAGE_ROUTINES if r["id"] == routine_id), None)
    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found")
    points_detail = [next((p for p in ACUPRESSURE_POINTS if p["id"] == pid), None) for pid in routine["points"]]
    points_detail = [p for p in points_detail if p]
    return {**routine, "points_detail": points_detail}


@router.post("/acupressure/sessions")
async def log_session(data: dict = Body(...), user=Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "routine_id": data.get("routine_id"),
        "points_used": data.get("points_used", []),
        "duration_minutes": data.get("duration_minutes", 0),
        "notes": data.get("notes", ""),
        "relief_level": data.get("relief_level", 5),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.acupressure_sessions.insert_one(doc)
    return {"status": "logged", "id": doc["id"]}


@router.get("/acupressure/sessions")
async def get_sessions(user=Depends(get_current_user)):
    sessions = await db.acupressure_sessions.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return {"sessions": sessions}
