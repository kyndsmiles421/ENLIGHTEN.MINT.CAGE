from fastapi import APIRouter, Depends
from deps import db, get_current_user, EMERGENT_LLM_KEY
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/starseed")

# ─── Static Adventure Tree ───
ORIGINS = [
    {"id": "pleiadian", "name": "Pleiadian", "color": "#818CF8", "desc": "Healers and teachers of unconditional love", "traits": ["empathic", "nurturing", "sensitive to energy"], "element": "water"},
    {"id": "sirian", "name": "Sirian", "color": "#2DD4BF", "desc": "Guardians of ancient knowledge and technology", "traits": ["logical", "inventive", "drawn to nature"], "element": "earth"},
    {"id": "arcturian", "name": "Arcturian", "color": "#C084FC", "desc": "Masters of sacred geometry and dimensional travel", "traits": ["visionary", "structured", "metaphysical"], "element": "ether"},
    {"id": "andromedan", "name": "Andromedan", "color": "#F59E0B", "desc": "Freedom seekers and truth warriors", "traits": ["independent", "adventurous", "justice-driven"], "element": "fire"},
    {"id": "lyran", "name": "Lyran", "color": "#EF4444", "desc": "The original starseeds — ancient warrior souls", "traits": ["courageous", "leadership", "creative"], "element": "fire"},
    {"id": "orion", "name": "Orion", "color": "#06B6D4", "desc": "Seekers of wisdom through duality and balance", "traits": ["analytical", "competitive", "transformative"], "element": "air"},
    {"id": "mintakan", "name": "Mintakan", "color": "#22C55E", "desc": "Lightworkers from a water world now destroyed", "traits": ["nostalgic", "deeply loving", "drawn to water"], "element": "water"},
    {"id": "venusian", "name": "Venusian", "color": "#EC4899", "desc": "Embodiments of beauty, art, and divine feminine", "traits": ["artistic", "romantic", "harmonious"], "element": "earth"},
]

CHAPTERS = {
    "awakening": {
        "title": "The Awakening",
        "narration": "You stand at the threshold of remembrance. The stars whisper your true name. A veil of forgetfulness begins to thin...",
        "choices": [
            {"id": "follow_light", "text": "Follow the column of light rising from the earth", "leads_to": "temple_of_light", "trait": "intuitive"},
            {"id": "listen_to_song", "text": "Listen to the celestial song calling from the stars", "leads_to": "star_choir", "trait": "empathic"},
            {"id": "touch_the_crystal", "text": "Reach for the glowing crystal half-buried in the soil", "leads_to": "crystal_cave", "trait": "grounded"},
            {"id": "close_eyes", "text": "Close your eyes and feel the vibration of your soul", "leads_to": "inner_cosmos", "trait": "introspective"},
        ],
    },
    "temple_of_light": {
        "title": "Temple of Light",
        "narration": "A vast temple materializes — pillars of pure light form archways leading in three directions. Ancient symbols pulse on the floor. You feel a presence watching, not with eyes, but with love.",
        "choices": [
            {"id": "enter_healing", "text": "Enter the Healing Chamber where light mends all wounds", "leads_to": "healing_chamber", "trait": "nurturing", "origin_hint": "pleiadian"},
            {"id": "enter_library", "text": "Ascend to the Library of Akashic Records", "leads_to": "akashic_library", "trait": "seeker", "origin_hint": "sirian"},
            {"id": "enter_geometry", "text": "Step into the Sacred Geometry Sanctum", "leads_to": "geometry_sanctum", "trait": "visionary", "origin_hint": "arcturian"},
        ],
    },
    "star_choir": {
        "title": "The Star Choir",
        "narration": "Voices of a thousand star systems weave together in harmony. Each note carries the memory of a civilization. You feel your frequency rising to join them.",
        "choices": [
            {"id": "sing_love", "text": "Add your voice — sing the frequency of unconditional love", "leads_to": "love_frequency", "trait": "loving", "origin_hint": "pleiadian"},
            {"id": "sing_truth", "text": "Sing the note of absolute truth that shatters illusions", "leads_to": "truth_resonance", "trait": "justice", "origin_hint": "andromedan"},
            {"id": "harmonize", "text": "Find the harmonic that balances all frequencies", "leads_to": "cosmic_balance", "trait": "balanced", "origin_hint": "orion"},
        ],
    },
    "crystal_cave": {
        "title": "The Crystal Cave",
        "narration": "Deep beneath the surface, crystals of every color pulse with ancient data. Each one holds the memory of a star system. Your hands tingle as you reach toward them.",
        "choices": [
            {"id": "rose_quartz", "text": "Touch the Rose Quartz — it vibrates with pure love", "leads_to": "love_frequency", "trait": "loving", "origin_hint": "venusian"},
            {"id": "lapis_lazuli", "text": "Pick up the Lapis Lazuli — it holds cosmic truth", "leads_to": "truth_resonance", "trait": "wisdom", "origin_hint": "sirian"},
            {"id": "obsidian", "text": "Grip the Obsidian — it shows you your shadow self", "leads_to": "shadow_work", "trait": "courageous", "origin_hint": "lyran"},
        ],
    },
    "inner_cosmos": {
        "title": "The Inner Cosmos",
        "narration": "Behind your closed eyes, an entire universe unfolds. Galaxies spiral within your consciousness. You realize you are not in the universe — the universe is in you.",
        "choices": [
            {"id": "expand", "text": "Expand your awareness to encompass all dimensions", "leads_to": "geometry_sanctum", "trait": "expansive", "origin_hint": "arcturian"},
            {"id": "dive_deep", "text": "Dive into the deepest point — the source of all creation", "leads_to": "source_point", "trait": "seeker", "origin_hint": "mintakan"},
            {"id": "become_light", "text": "Transform your body into pure light frequency", "leads_to": "healing_chamber", "trait": "transcendent", "origin_hint": "lyran"},
        ],
    },
    # ─── Ending Chapters ───
    "healing_chamber": {
        "title": "The Healing Chamber",
        "narration": "Waves of emerald and violet light wash through you. Every wound — physical, emotional, ancestral — dissolves. You remember: you came to Earth to heal others, because you first learned to heal yourself.",
        "choices": [],
        "ending": True,
        "origin_result": "pleiadian",
        "gift": "Empathic Healing Touch",
        "frequency": 528,
    },
    "akashic_library": {
        "title": "The Akashic Library",
        "narration": "Infinite scrolls of light unfurl before you. You see your past lives, your soul contracts, the web connecting all beings. Knowledge flows into you like water filling a vessel that was always meant to hold it.",
        "choices": [],
        "ending": True,
        "origin_result": "sirian",
        "gift": "Akashic Sight",
        "frequency": 852,
    },
    "geometry_sanctum": {
        "title": "Sacred Geometry Sanctum",
        "narration": "Metatron's Cube rotates before you, containing all platonic solids. You see the blueprint of creation itself. Each shape is a doorway to another dimension. You understand now — you are the architect.",
        "choices": [],
        "ending": True,
        "origin_result": "arcturian",
        "gift": "Dimensional Architect",
        "frequency": 963,
    },
    "love_frequency": {
        "title": "The Love Frequency",
        "narration": "528 Hz floods your being. The frequency of miracles, of DNA repair, of the green heart of creation. Love is not an emotion — it is the fundamental force of the cosmos, and you are its vessel.",
        "choices": [],
        "ending": True,
        "origin_result": "pleiadian",
        "gift": "Heart Resonance",
        "frequency": 528,
    },
    "truth_resonance": {
        "title": "The Truth Resonance",
        "narration": "A single clear note rings through all dimensions. Illusions shatter. Masks fall. What remains is beautiful, raw, and absolutely real. You are a truth-bearer. The universe needs your voice.",
        "choices": [],
        "ending": True,
        "origin_result": "andromedan",
        "gift": "Voice of Truth",
        "frequency": 741,
    },
    "cosmic_balance": {
        "title": "Cosmic Balance",
        "narration": "Light and dark dance together in perfect harmony. You see that duality was never opposition — it was partnership. You stand at the center point, the fulcrum of all creation, perfectly balanced.",
        "choices": [],
        "ending": True,
        "origin_result": "orion",
        "gift": "Equilibrium Master",
        "frequency": 432,
    },
    "shadow_work": {
        "title": "Shadow Integration",
        "narration": "Your shadow self stands before you — not as enemy, but as ally. Every fear, every doubt, every repressed power. You embrace it all. In that embrace, you become whole. The warrior is complete.",
        "choices": [],
        "ending": True,
        "origin_result": "lyran",
        "gift": "Shadow Warrior",
        "frequency": 396,
    },
    "source_point": {
        "title": "The Source Point",
        "narration": "At the deepest point of existence, before time, before space, there is only pure potential. You remember your home — a water world of infinite love, now existing only in the hearts of its children. You carry it forward.",
        "choices": [],
        "ending": True,
        "origin_result": "mintakan",
        "gift": "Source Memory",
        "frequency": 639,
    },
}


@router.get("/origins")
async def get_origins():
    # Delegate to the full starseed_adventure origins with complete data
    # V1.0.8 — Apply Spiritual Shield (Play Store framing). The legacy
    # static lore in STARSEED_ORIGINS contains "healer/healing" verbiage
    # that we substitute with spiritual-mythic alternatives before the
    # client ever sees it. Mirrors the shielding in
    # routes/starseed_adventure.get_starseed_origins so this duplicate
    # route (registered first by alphabetical module load order) never
    # leaks the unshielded copy.
    from routes.starseed_adventure import STARSEED_ORIGINS, _shield_obj
    cleaned = []
    for o in STARSEED_ORIGINS:
        item = {k: v for k, v in o.items() if k != "starting_stats"}
        cleaned.append(_shield_obj(item))
    return {"origins": cleaned}


@router.get("/chapter/{chapter_id}")
async def get_chapter(chapter_id: str):
    chapter = CHAPTERS.get(chapter_id)
    if not chapter:
        from fastapi import HTTPException
        raise HTTPException(404, "Chapter not found")
    result = {**chapter, "id": chapter_id}
    if chapter.get("ending"):
        origin = next((o for o in ORIGINS if o["id"] == chapter["origin_result"]), None)
        result["origin"] = origin
    return result


@router.post("/save-journey")
async def save_journey(body: dict, user=Depends(get_current_user)):
    """Save a completed starseed journey."""
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "origin_id": body.get("origin_id"),
        "origin_name": body.get("origin_name"),
        "gift": body.get("gift"),
        "path": body.get("path", []),
        "frequency": body.get("frequency"),
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.starseed_journeys.insert_one(doc)
    doc.pop("_id", None)

    # Update user profile with starseed origin
    await db.user_profiles.update_one(
        {"user_id": user["id"]},
        {"$set": {
            "starseed_origin": body.get("origin_id"),
            "starseed_gift": body.get("gift"),
        }},
        upsert=True,
    )
    return doc


@router.get("/my-journeys")
async def get_my_journeys(user=Depends(get_current_user)):
    journeys = await db.starseed_journeys.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("completed_at", -1).to_list(20)
    return journeys


@router.get("/my-origin")
async def get_my_origin(user=Depends(get_current_user)):
    profile = await db.user_profiles.find_one(
        {"user_id": user["id"]},
        {"_id": 0, "starseed_origin": 1, "starseed_gift": 1}
    )
    if not profile or not profile.get("starseed_origin"):
        return {"origin": None, "gift": None}
    origin = next((o for o in ORIGINS if o["id"] == profile.get("starseed_origin")), None)
    return {"origin": origin, "gift": profile.get("starseed_gift")}
