from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone
import uuid

router = APIRouter()

ESSENTIAL_OILS = [
    {"id": "lavender", "name": "Lavender", "latin": "Lavandula angustifolia", "color": "#C084FC",
     "properties": ["Calming", "Sleep aid", "Anti-anxiety", "Pain relief"],
     "chakra": "Crown & Third Eye", "element": "Air",
     "uses": ["Diffuse for sleep", "Apply to temples for headache", "Add to bath for relaxation", "Inhale for stress"],
     "blends_with": ["chamomile", "eucalyptus", "frankincense", "bergamot"],
     "caution": "Generally safe. Avoid during first trimester of pregnancy.",
     "emotional": "Peace, tranquility, emotional balance",
     "spiritual": "Enhances meditation, opens crown chakra, promotes spiritual clarity"},
    {"id": "peppermint", "name": "Peppermint", "latin": "Mentha piperita", "color": "#2DD4BF",
     "properties": ["Energizing", "Digestive", "Focus", "Cooling"],
     "chakra": "Throat & Solar Plexus", "element": "Fire",
     "uses": ["Inhale for energy", "Apply to stomach for digestion", "Diffuse for mental clarity", "Apply to neck for cooling"],
     "blends_with": ["eucalyptus", "rosemary", "lemon", "lavender"],
     "caution": "Avoid on children under 6. Can irritate sensitive skin.",
     "emotional": "Clarity, alertness, invigoration",
     "spiritual": "Clears mental fog, stimulates higher thought, truth expression"},
    {"id": "frankincense", "name": "Frankincense", "latin": "Boswellia sacra", "color": "#D4AF37",
     "properties": ["Grounding", "Anti-inflammatory", "Immune boost", "Meditative"],
     "chakra": "Crown & Root", "element": "Ether",
     "uses": ["Diffuse during meditation", "Apply to skin for anti-aging", "Inhale for respiratory health", "Anoint pulse points"],
     "blends_with": ["lavender", "myrrh", "sandalwood", "rose"],
     "caution": "Blood-thinning properties. Consult before surgery.",
     "emotional": "Grounding, inner peace, emotional healing",
     "spiritual": "Sacred anointing, deepens meditation, connects to the divine"},
    {"id": "eucalyptus", "name": "Eucalyptus", "latin": "Eucalyptus globulus", "color": "#22C55E",
     "properties": ["Respiratory", "Antibacterial", "Decongestant", "Purifying"],
     "chakra": "Heart & Throat", "element": "Water",
     "uses": ["Steam inhalation for colds", "Diffuse to purify air", "Add to shower for vapor therapy", "Chest rub for congestion"],
     "blends_with": ["peppermint", "tea_tree", "lavender", "lemon"],
     "caution": "Not for internal use. Keep away from face of infants.",
     "emotional": "Liberation, clearing, fresh perspective",
     "spiritual": "Cleanses auric field, removes stagnant energy, renewal"},
    {"id": "rose", "name": "Rose", "latin": "Rosa damascena", "color": "#FDA4AF",
     "properties": ["Heart-opening", "Anti-depressant", "Skin healing", "Aphrodisiac"],
     "chakra": "Heart", "element": "Water",
     "uses": ["Apply to heart center", "Add to skincare", "Diffuse for romance", "Use in ritual baths"],
     "blends_with": ["frankincense", "lavender", "sandalwood", "bergamot"],
     "caution": "Very potent. Use sparingly. Avoid during pregnancy.",
     "emotional": "Unconditional love, compassion, grief healing",
     "spiritual": "Opens the heart chakra, divine feminine energy, self-love"},
    {"id": "sandalwood", "name": "Sandalwood", "latin": "Santalum album", "color": "#A78BFA",
     "properties": ["Grounding", "Calming", "Aphrodisiac", "Meditative"],
     "chakra": "Root & Crown", "element": "Earth",
     "uses": ["Apply to third eye for meditation", "Diffuse for calm", "Use in prayer/ritual", "Skin moisturizer"],
     "blends_with": ["rose", "frankincense", "lavender", "jasmine"],
     "caution": "Sustainable sourcing important. Generally very safe.",
     "emotional": "Deep calm, sensuality, inner harmony",
     "spiritual": "Ancient meditation aid, connects earth and spirit, temple consecration"},
    {"id": "tea_tree", "name": "Tea Tree", "latin": "Melaleuca alternifolia", "color": "#86EFAC",
     "properties": ["Antimicrobial", "Immune support", "Skin clearing", "Purifying"],
     "chakra": "Solar Plexus", "element": "Fire",
     "uses": ["Apply to blemishes", "Diffuse to purify air", "Add to cleaning products", "Foot soak for fungus"],
     "blends_with": ["eucalyptus", "lavender", "lemon", "rosemary"],
     "caution": "Not for internal use. Patch test on sensitive skin.",
     "emotional": "Confidence, clarity, cleansing negativity",
     "spiritual": "Psychic protection, energy purification, boundary setting"},
    {"id": "lemon", "name": "Lemon", "latin": "Citrus limon", "color": "#FCD34D",
     "properties": ["Uplifting", "Cleansing", "Immune support", "Energizing"],
     "chakra": "Solar Plexus", "element": "Fire",
     "uses": ["Diffuse for mood lift", "Add to water for detox", "Clean surfaces naturally", "Inhale for nausea"],
     "blends_with": ["peppermint", "eucalyptus", "lavender", "tea_tree"],
     "caution": "Photosensitive - avoid sun after skin application.",
     "emotional": "Joy, optimism, mental clarity",
     "spiritual": "Solar energy, purification, brightens the aura"},
    {"id": "chamomile", "name": "Roman Chamomile", "latin": "Chamaemelum nobile", "color": "#93C5FD",
     "properties": ["Calming", "Anti-inflammatory", "Sleep aid", "Digestive"],
     "chakra": "Throat & Solar Plexus", "element": "Water",
     "uses": ["Diffuse for children's sleep", "Apply for skin irritation", "Massage for muscle tension", "Inhale for anxiety"],
     "blends_with": ["lavender", "bergamot", "rose", "frankincense"],
     "caution": "May cause allergic reaction if allergic to ragweed.",
     "emotional": "Gentle peace, patience, releasing anger",
     "spiritual": "Sun energy, abundance attraction, inner child healing"},
    {"id": "bergamot", "name": "Bergamot", "latin": "Citrus bergamia", "color": "#FB923C",
     "properties": ["Mood-lifting", "Anti-anxiety", "Skin toning", "Digestive"],
     "chakra": "Heart & Solar Plexus", "element": "Air",
     "uses": ["Diffuse for depression", "Apply to wrists for calm", "Add to tea", "Inhale for confidence"],
     "blends_with": ["lavender", "chamomile", "frankincense", "lemon"],
     "caution": "Highly photosensitive. Use bergaptene-free for skin.",
     "emotional": "Self-acceptance, joy, releasing worry",
     "spiritual": "Heart healing, self-worth, attracts prosperity"},
    {"id": "rosemary", "name": "Rosemary", "latin": "Rosmarinus officinalis", "color": "#059669",
     "properties": ["Memory boost", "Energizing", "Hair growth", "Respiratory"],
     "chakra": "Third Eye", "element": "Fire",
     "uses": ["Diffuse for study/work", "Massage into scalp", "Inhale before exams", "Add to cooking"],
     "blends_with": ["peppermint", "lemon", "eucalyptus", "lavender"],
     "caution": "Avoid with epilepsy or high blood pressure.",
     "emotional": "Mental strength, focus, remembrance",
     "spiritual": "Protection, memory of past lives, ancestral connection"},
    {"id": "myrrh", "name": "Myrrh", "latin": "Commiphora myrrha", "color": "#92400E",
     "properties": ["Grounding", "Anti-inflammatory", "Skin healing", "Sacred"],
     "chakra": "Root & Sacral", "element": "Earth",
     "uses": ["Meditation anointing", "Oral health", "Skin repair", "Emotional grounding"],
     "blends_with": ["frankincense", "sandalwood", "lavender", "rose"],
     "caution": "Avoid during pregnancy. May lower blood sugar.",
     "emotional": "Deep grounding, emotional security, grief processing",
     "spiritual": "Sacred resin, ancestral wisdom, spiritual protection"},
]

BLENDING_TIPS = [
    {"name": "Stress Relief", "oils": ["lavender", "bergamot", "chamomile"], "ratio": "3:2:1", "method": "Diffuser blend"},
    {"name": "Morning Energy", "oils": ["peppermint", "lemon", "rosemary"], "ratio": "2:2:1", "method": "Inhaler or diffuser"},
    {"name": "Deep Meditation", "oils": ["frankincense", "sandalwood", "myrrh"], "ratio": "2:2:1", "method": "Anoint pulse points"},
    {"name": "Heart Opening", "oils": ["rose", "bergamot", "lavender"], "ratio": "1:2:2", "method": "Chest application with carrier oil"},
    {"name": "Immune Shield", "oils": ["tea_tree", "eucalyptus", "lemon"], "ratio": "2:2:1", "method": "Diffuser or steam inhalation"},
    {"name": "Sleep Sanctuary", "oils": ["lavender", "chamomile", "sandalwood"], "ratio": "3:2:1", "method": "Pillow spray or diffuser"},
    {"name": "Focus Flow", "oils": ["rosemary", "peppermint", "lemon"], "ratio": "2:1:2", "method": "Desktop diffuser"},
    {"name": "Sacred Space", "oils": ["frankincense", "rose", "sandalwood"], "ratio": "2:1:2", "method": "Room spray or diffuser"},
]


@router.get("/aromatherapy/oils")
async def get_oils():
    return {"oils": ESSENTIAL_OILS}


@router.get("/aromatherapy/oil/{oil_id}")
async def get_oil(oil_id: str):
    oil = next((o for o in ESSENTIAL_OILS if o["id"] == oil_id), None)
    if not oil:
        raise HTTPException(status_code=404, detail="Oil not found")
    return oil


@router.get("/aromatherapy/blends")
async def get_blends():
    return {"blends": BLENDING_TIPS}


@router.post("/aromatherapy/favorites")
async def save_favorite(data: dict = Body(...), user=Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "oil_id": data.get("oil_id"),
        "notes": data.get("notes", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.aroma_favorites.insert_one(doc)
    return {"status": "saved", "id": doc["id"]}


@router.get("/aromatherapy/favorites")
async def get_favorites(user=Depends(get_current_user)):
    favs = await db.aroma_favorites.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    return {"favorites": favs}


@router.delete("/aromatherapy/favorites/{fav_id}")
async def delete_favorite(fav_id: str, user=Depends(get_current_user)):
    await db.aroma_favorites.delete_one({"id": fav_id, "user_id": user["id"]})
    return {"status": "deleted"}
