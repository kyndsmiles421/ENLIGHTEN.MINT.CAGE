from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()

# --- Beginner's Journey ---

@router.get("/journey/progress")
async def get_journey_progress(user=Depends(get_current_user)):
    """Get user's journey progress."""
    doc = await db.journey_progress.find_one({"user_id": user["id"]}, {"_id": 0})
    if not doc:
        doc = {
            "user_id": user["id"],
            "completed_lessons": [],
            "current_stage": 0,
            "started_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.journey_progress.insert_one(doc)
        doc.pop("_id", None)
    return doc

@router.post("/journey/complete-lesson")
async def complete_journey_lesson(data: dict, user=Depends(get_current_user)):
    """Mark a lesson as completed."""
    lesson_id = data.get("lesson_id", "")
    if not lesson_id:
        raise HTTPException(status_code=400, detail="lesson_id required")
    doc = await db.journey_progress.find_one({"user_id": user["id"]})
    if not doc:
        doc = {
            "user_id": user["id"],
            "completed_lessons": [],
            "current_stage": 0,
            "started_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.journey_progress.insert_one(doc)
    completed = doc.get("completed_lessons", [])
    if lesson_id not in completed:
        completed.append(lesson_id)
    # Determine current stage based on completed lessons
    stage_counts = [4, 4, 4, 4, 4]  # lessons per stage
    unlocked_stage = 0
    for i, count in enumerate(stage_counts):
        stage_lessons = [item for item in completed if item.startswith(f"s{i}-")]
        if len(stage_lessons) >= count:
            unlocked_stage = i + 1
    await db.journey_progress.update_one(
        {"user_id": user["id"]},
        {"$set": {"completed_lessons": completed, "current_stage": unlocked_stage}},
        upsert=True
    )
    return {"completed_lessons": completed, "current_stage": unlocked_stage, "lesson_id": lesson_id}

# --- Custom Mantra Practices ---

@router.get("/mantras/library")
async def get_mantra_library():
    """Return the built-in mantra library."""
    return MANTRA_LIBRARY

@router.post("/mantras/save-custom")
async def save_custom_mantra(data: dict, user=Depends(get_current_user)):
    """Save a user-created custom mantra practice."""
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "name": data.get("name", "My Mantra"),
        "mantra_text": data.get("mantra_text", ""),
        "meaning": data.get("meaning", ""),
        "repetitions": max(1, min(1008, data.get("repetitions", 108))),
        "sound": data.get("sound", "silence"),
        "color": data.get("color", "#FCD34D"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.custom_mantras.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.get("/mantras/my-custom")
async def get_custom_mantras(user=Depends(get_current_user)):
    items = await db.custom_mantras.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items

@router.delete("/mantras/custom/{mantra_id}")
async def delete_custom_mantra(mantra_id: str, user=Depends(get_current_user)):
    result = await db.custom_mantras.delete_one({"id": mantra_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"deleted": True}

MANTRA_LIBRARY = [
    {
        "id": "om", "name": "Om (Aum)", "sanskrit": "ॐ",
        "text": "Om", "pronunciation": "Ahhh — Ohhh — Mmmm",
        "category": "meditation",
        "color": "#D8B4FE",
        "meaning": "The primordial sound of the universe. Represents creation, preservation, and dissolution. The vibration from which all existence emerged.",
        "benefits": ["Calms the mind", "Balances nervous system", "Connects to universal consciousness", "Reduces stress and anxiety"],
        "chakra": "Crown (Sahasrara)",
        "tradition": "Vedic / Hindu / Buddhist",
        "practice_tips": "Sit comfortably, take a deep breath, and let the sound flow naturally. Feel the vibration in your chest, throat, and crown.",
        "recommended_reps": 108,
    },
    {
        "id": "om-mani", "name": "Om Mani Padme Hum", "sanskrit": "ॐ मणि पद्मे हूँ",
        "text": "Om Mani Padme Hum", "pronunciation": "Om Mah-nee Pahd-may Hoom",
        "category": "compassion",
        "color": "#2DD4BF",
        "meaning": "The jewel in the lotus. The mantra of Avalokiteshvara, the bodhisattva of compassion. Each syllable purifies one of six realms of existence.",
        "benefits": ["Cultivates compassion", "Purifies karma", "Opens the heart", "Reduces attachment and hatred"],
        "chakra": "Heart (Anahata)",
        "tradition": "Tibetan Buddhist",
        "practice_tips": "Visualize a bright white light emanating from your heart with each repetition. Send compassion to all beings.",
        "recommended_reps": 108,
    },
    {
        "id": "om-namah", "name": "Om Namah Shivaya", "sanskrit": "ॐ नमः शिवाय",
        "text": "Om Namah Shivaya", "pronunciation": "Om Nah-mah Shee-vah-yah",
        "category": "devotion",
        "color": "#3B82F6",
        "meaning": "I bow to Shiva, the supreme consciousness within. The five syllables represent earth, water, fire, air, and ether.",
        "benefits": ["Destroys negative patterns", "Awakens inner divinity", "Brings inner peace", "Supports transformation"],
        "chakra": "Third Eye (Ajna)",
        "tradition": "Shaivite Hindu",
        "practice_tips": "Feel each syllable resonating with a different element within your body. Surrender to the transformative energy.",
        "recommended_reps": 108,
    },
    {
        "id": "so-hum", "name": "So Hum", "sanskrit": "सो ऽहम्",
        "text": "So Hum", "pronunciation": "Soh Hum",
        "category": "meditation",
        "color": "#86EFAC",
        "meaning": "I am That. Identifies the individual self with the universal. 'So' on the inhale (that), 'Hum' on the exhale (I am).",
        "benefits": ["Deepens meditation", "Synchronizes with breath", "Dissolves ego", "Promotes self-realization"],
        "chakra": "Crown (Sahasrara)",
        "tradition": "Vedantic",
        "practice_tips": "Silently think 'So' as you inhale and 'Hum' as you exhale. Let the mantra and breath become one.",
        "recommended_reps": 0,
    },
    {
        "id": "sat-nam", "name": "Sat Nam", "sanskrit": "सत नाम",
        "text": "Sat Nam", "pronunciation": "Saht Nahm",
        "category": "meditation",
        "color": "#FCD34D",
        "meaning": "Truth is my identity. The seed mantra of Kundalini Yoga. 'Sat' means truth, 'Nam' means name or identity.",
        "benefits": ["Awakens kundalini", "Balances chakras", "Reveals authentic self", "Grounds spiritual energy"],
        "chakra": "All chakras",
        "tradition": "Sikh / Kundalini Yoga",
        "practice_tips": "Extend 'Saaat' for 7 times the length of 'Nam'. Feel the vibration travel from the navel to the crown.",
        "recommended_reps": 108,
    },
    {
        "id": "shanti", "name": "Om Shanti Shanti Shanti", "sanskrit": "ॐ शान्तिः शान्तिः शान्तिः",
        "text": "Om Shanti Shanti Shanti", "pronunciation": "Om Shahn-tee Shahn-tee Shahn-tee",
        "category": "peace",
        "color": "#93C5FD",
        "meaning": "Om, Peace, Peace, Peace. Three repetitions invoke peace in body, speech, and mind — or peace from divine, environmental, and internal disturbances.",
        "benefits": ["Deep peace and serenity", "Calms agitation", "Creates protective aura", "Harmonizes environment"],
        "chakra": "Throat (Vishuddha)",
        "tradition": "Vedic / Hindu",
        "practice_tips": "Let each 'Shanti' dissolve a different layer of tension — physical, emotional, spiritual.",
        "recommended_reps": 27,
    },
    {
        "id": "gayatri", "name": "Gayatri Mantra", "sanskrit": "ॐ भूर्भुवः स्वः",
        "text": "Om Bhur Bhuva Swaha, Tat Savitur Varenyam, Bhargo Devasya Dhimahi, Dhiyo Yo Nah Prachodayat",
        "pronunciation": "Om Bhoor Bhoo-vah Swah-ha, Taht Sah-vee-toor Vah-rehn-yahm, Bhar-go Deh-vahs-yah Dhee-mah-hee, Dhee-yo Yo Nah Prah-cho-dah-yaht",
        "category": "illumination",
        "color": "#FB923C",
        "meaning": "We meditate upon the divine light of the radiant source. May it illuminate our intellect. The most sacred Vedic hymn, a prayer to the sun deity Savitri.",
        "benefits": ["Illuminates the mind", "Enhances wisdom", "Purifies consciousness", "Protects the chanter"],
        "chakra": "Third Eye (Ajna)",
        "tradition": "Rig Veda",
        "practice_tips": "Best chanted at sunrise, noon, and sunset. Feel the golden light of the sun filling your entire being with each recitation.",
        "recommended_reps": 108,
    },
    {
        "id": "ra-ma-da-sa", "name": "Ra Ma Da Sa", "sanskrit": "",
        "text": "Ra Ma Da Sa, Sa Say So Hung",
        "pronunciation": "Rah Mah Dah Sah, Sah Say So Hung",
        "category": "healing",
        "color": "#22C55E",
        "meaning": "Sun, Moon, Earth, Infinity — Infinity, experience of totality, I am Thou. A powerful healing mantra that calls upon cosmic forces.",
        "benefits": ["Powerful healing energy", "Boosts immune system", "Sends healing to others", "Connects to cosmic forces"],
        "chakra": "Heart (Anahata)",
        "tradition": "Kundalini Yoga",
        "practice_tips": "Hold your palms up at 60 degrees. Visualize green healing light flowing through your hands as you chant.",
        "recommended_reps": 11,
    },
    {
        "id": "lokah", "name": "Lokah Samastah", "sanskrit": "लोकाः समस्ताः सुखिनो भवन्तु",
        "text": "Lokah Samastah Sukhino Bhavantu",
        "pronunciation": "Lo-kah Sah-mah-stah Soo-khee-no Bhah-vahn-too",
        "category": "compassion",
        "color": "#E879F9",
        "meaning": "May all beings everywhere be happy and free, and may my thoughts, words, and actions contribute to that happiness and freedom.",
        "benefits": ["Expands compassion", "Creates positive karma", "Connects to all beings", "Promotes universal love"],
        "chakra": "Heart (Anahata)",
        "tradition": "Vedic / Yoga",
        "practice_tips": "As you chant, expand your awareness outward — from yourself to loved ones, to your community, to the entire world.",
        "recommended_reps": 27,
    },
    {
        "id": "ham-sa", "name": "Ham Sa", "sanskrit": "हंस",
        "text": "Ham Sa", "pronunciation": "Hahm Sah",
        "category": "meditation",
        "color": "#94A3B8",
        "meaning": "The swan. The natural mantra of the breath — 'Ham' on the exhale, 'Sa' on the inhale. Represents the individual soul (Jiva) recognizing the universal soul (Atman).",
        "benefits": ["Natural breath awareness", "Effortless meditation", "Self-inquiry", "Dissolves duality"],
        "chakra": "Crown (Sahasrara)",
        "tradition": "Advaita Vedanta",
        "practice_tips": "Simply observe your natural breath. Notice 'Ham' sound on exhale, 'Sa' sound on inhale. No effort needed.",
        "recommended_reps": 0,
    },
]


