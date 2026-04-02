from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone
import uuid

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ENERGETIC PROFILE SCHEMA
#  TCM Five Elements → Frequency → Gravity Mass
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Element → Solfeggio Frequency mapping
ELEMENT_FREQUENCY = {
    "Wood": 396.0,   # Liberation / Growth
    "Fire": 528.0,   # Transformation / Love
    "Earth": 639.0,  # Connection / Grounding
    "Metal": 741.0,  # Expression / Purification
    "Water": 852.0,  # Intuition / Flow
}

# TCM Nature → Gravity weight contribution
NATURE_WEIGHT = {"Hot": 15, "Warm": 10, "Neutral": 5, "Cool": 10, "Cold": 15}
ELEMENT_WEIGHT = {"Wood": 10, "Fire": 15, "Earth": 12, "Metal": 8, "Water": 14}
RARITY_WEIGHT = {"common": 0, "uncommon": 5, "rare": 10, "legendary": 20}

# TCM Taste → Element correspondence
TASTE_ELEMENT = {
    "Sour": "Wood", "Bitter": "Fire", "Sweet": "Earth",
    "Pungent": "Metal", "Salty": "Water",
}

# Visual palette per element
ELEMENT_COLORS = {
    "Wood": "#22C55E", "Fire": "#EF4444", "Earth": "#F59E0B",
    "Metal": "#94A3B8", "Water": "#3B82F6",
}

NATURE_COLORS = {
    "Hot": "#DC2626", "Warm": "#FB923C", "Neutral": "#A3A3A3",
    "Cool": "#38BDF8", "Cold": "#1D4ED8",
}


def calculate_gravity_mass(plant):
    """Derive gravity mass from TCM properties."""
    base = 60
    elem = ELEMENT_WEIGHT.get(plant.get("element", "Earth"), 12)
    nat = NATURE_WEIGHT.get(plant.get("nature", "Neutral"), 5)
    meridian_bonus = len(plant.get("meridians", [])) * 3
    rarity_bonus = RARITY_WEIGHT.get(plant.get("rarity", "common"), 0)
    return min(100, base + elem + nat + meridian_bonus + rarity_bonus)


def derive_frequency(plant):
    """Derive resonant frequency from primary element."""
    return ELEMENT_FREQUENCY.get(plant.get("element", "Earth"), 639.0)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  PLANT CATALOG — The Living Database
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLANT_CATALOG = [
    {
        "id": "ginseng",
        "name": "Ginseng",
        "latin": "Panax ginseng",
        "family": "Araliaceae",
        "element": "Earth",
        "nature": "Warm",
        "tastes": ["Sweet", "Bitter"],
        "meridians": ["Spleen", "Lung", "Heart"],
        "rarity": "rare",
        "parts_used": "Root",
        "properties": ["Qi Tonic", "Adaptogen", "Immune Boost", "Cognitive"],
        "tcm_actions": ["Tonifies Yuan Qi", "Benefits Spleen and Lung", "Generates fluids", "Calms the spirit"],
        "energetic_profile": {
            "yin_yang": "Yang-tonifying",
            "qi_direction": "Ascending",
            "organ_clock": "09:00-11:00 (Spleen)",
            "season": "Late Summer",
        },
        "traditional_use": "The 'King of Herbs' in TCM. Used for 5,000+ years to replenish vital Qi, restore depleted constitutions, and sharpen the mind. Classified as a Superior herb in Shen Nong's Materia Medica.",
        "growing": {"zone": "3-7", "sun": "Partial shade", "soil": "Rich, well-drained", "years_to_harvest": 6},
        "trade_value": {"base_credits": 8, "seasonal_multiplier": 1.5, "tradeable": True},
        "spiritual": "Opens the Crown and Root simultaneously. Bridges heaven and earth energies. Used by Taoist monks for longevity cultivation.",
    },
    {
        "id": "astragalus",
        "name": "Astragalus",
        "latin": "Astragalus membranaceus",
        "family": "Fabaceae",
        "element": "Earth",
        "nature": "Warm",
        "tastes": ["Sweet"],
        "meridians": ["Spleen", "Lung"],
        "rarity": "uncommon",
        "parts_used": "Root",
        "properties": ["Wei Qi Shield", "Immune Modulator", "Anti-aging", "Energy"],
        "tcm_actions": ["Tonifies Spleen Qi", "Raises Yang Qi", "Stabilizes the Exterior", "Promotes urination"],
        "energetic_profile": {
            "yin_yang": "Yang-tonifying",
            "qi_direction": "Ascending",
            "organ_clock": "03:00-05:00 (Lung)",
            "season": "Autumn",
        },
        "traditional_use": "Known as Huang Qi ('Yellow Leader'). The premier Wei Qi (defensive energy) herb. Builds an invisible shield around the body's energy field.",
        "growing": {"zone": "5-9", "sun": "Full sun", "soil": "Sandy, well-drained", "years_to_harvest": 4},
        "trade_value": {"base_credits": 5, "seasonal_multiplier": 1.2, "tradeable": True},
        "spiritual": "Strengthens the aura boundary. Creates energetic resilience against environmental drain.",
    },
    {
        "id": "rehmannia",
        "name": "Rehmannia",
        "latin": "Rehmannia glutinosa",
        "family": "Orobanchaceae",
        "element": "Water",
        "nature": "Cold",
        "tastes": ["Sweet", "Bitter"],
        "meridians": ["Heart", "Liver", "Kidney"],
        "rarity": "uncommon",
        "parts_used": "Root (raw or prepared)",
        "properties": ["Blood Tonic", "Yin Nourisher", "Cooling", "Kidney Support"],
        "tcm_actions": ["Nourishes Yin", "Clears Heat", "Generates fluids", "Cools the Blood"],
        "energetic_profile": {
            "yin_yang": "Yin-nourishing",
            "qi_direction": "Descending",
            "organ_clock": "17:00-19:00 (Kidney)",
            "season": "Winter",
        },
        "traditional_use": "The primary Yin tonic in TCM. Raw form clears heat; prepared form (Shu Di Huang) deeply nourishes Blood and Kidney essence. Central to the Six Flavor Rehmannia Pill.",
        "growing": {"zone": "5-8", "sun": "Full sun to partial shade", "soil": "Loamy, moist", "years_to_harvest": 2},
        "trade_value": {"base_credits": 4, "seasonal_multiplier": 1.0, "tradeable": True},
        "spiritual": "Deep restoration of primal essence. Connects to ancestral memory stored in the Kidneys.",
    },
    {
        "id": "chrysanthemum",
        "name": "Chrysanthemum",
        "latin": "Chrysanthemum morifolium",
        "family": "Asteraceae",
        "element": "Metal",
        "nature": "Cool",
        "tastes": ["Sweet", "Bitter"],
        "meridians": ["Lung", "Liver"],
        "rarity": "common",
        "parts_used": "Flower",
        "properties": ["Vision Clarity", "Heat Clearing", "Liver Calming", "Anti-inflammatory"],
        "tcm_actions": ["Disperses Wind-Heat", "Calms the Liver", "Clears the eyes", "Detoxifies"],
        "energetic_profile": {
            "yin_yang": "Yin-cooling",
            "qi_direction": "Descending",
            "organ_clock": "01:00-03:00 (Liver)",
            "season": "Autumn",
        },
        "traditional_use": "One of the Four Gentlemen flowers in Chinese culture. Ju Hua tea has been consumed for millennia to clear Liver Heat, brighten the eyes, and calm rising Yang.",
        "growing": {"zone": "5-9", "sun": "Full sun", "soil": "Rich, well-drained", "years_to_harvest": 1},
        "trade_value": {"base_credits": 2, "seasonal_multiplier": 1.3, "tradeable": True},
        "spiritual": "Clarity of inner vision. Dissolves the veil between seen and unseen worlds.",
    },
    {
        "id": "schisandra",
        "name": "Schisandra",
        "latin": "Schisandra chinensis",
        "family": "Schisandraceae",
        "element": "Water",
        "nature": "Warm",
        "tastes": ["Sour", "Sweet", "Salty", "Bitter", "Pungent"],
        "meridians": ["Lung", "Heart", "Kidney"],
        "rarity": "rare",
        "parts_used": "Berry",
        "properties": ["Five-Flavor Berry", "Adaptogen", "Liver Protector", "Spirit Stabilizer"],
        "tcm_actions": ["Contains the Lung Qi", "Tonifies the Kidney", "Generates fluids", "Quiets the spirit"],
        "energetic_profile": {
            "yin_yang": "Balanced (all 5 tastes)",
            "qi_direction": "Inward (astringing)",
            "organ_clock": "Circadian (touches all 5 elements)",
            "season": "All seasons",
        },
        "traditional_use": "Wu Wei Zi — 'Five Flavor Berry'. The only known herb containing all five TCM tastes. Used by Taoist masters as a universal harmonizer. Said to 'calm the heart and quiet the spirit.'",
        "growing": {"zone": "4-7", "sun": "Partial shade", "soil": "Rich, acidic", "years_to_harvest": 3},
        "trade_value": {"base_credits": 10, "seasonal_multiplier": 1.0, "tradeable": True},
        "spiritual": "The alchemical unifier. Contains the signature of all Five Elements. Meditation catalyst for practitioners seeking wholeness.",
    },
    {
        "id": "he_shou_wu",
        "name": "He Shou Wu",
        "latin": "Polygonum multiflorum",
        "family": "Polygonaceae",
        "element": "Wood",
        "nature": "Warm",
        "tastes": ["Bitter", "Sweet"],
        "meridians": ["Liver", "Kidney"],
        "rarity": "rare",
        "parts_used": "Root (prepared)",
        "properties": ["Jing Essence", "Hair Restorer", "Longevity", "Blood Builder"],
        "tcm_actions": ["Tonifies Liver and Kidney", "Nourishes Blood", "Augments Jing", "Expels toxins"],
        "energetic_profile": {
            "yin_yang": "Yin-nourishing (prepared)",
            "qi_direction": "Descending & Inward",
            "organ_clock": "01:00-03:00 (Liver)",
            "season": "Spring",
        },
        "traditional_use": "Named after the legend of He, whose white hair turned black after consuming the root. The premier Jing (essence) tonic. Prepared form is key — raw form is a laxative.",
        "growing": {"zone": "6-10", "sun": "Partial shade", "soil": "Moist, humus-rich", "years_to_harvest": 4},
        "trade_value": {"base_credits": 9, "seasonal_multiplier": 1.4, "tradeable": True},
        "spiritual": "Restores primal essence. Links present consciousness to ancestral lineage. The alchemist's youth elixir.",
    },
    {
        "id": "reishi",
        "name": "Reishi",
        "latin": "Ganoderma lucidum",
        "family": "Ganodermataceae",
        "element": "Fire",
        "nature": "Neutral",
        "tastes": ["Bitter"],
        "meridians": ["Heart", "Lung", "Liver", "Kidney"],
        "rarity": "legendary",
        "parts_used": "Fruiting body",
        "properties": ["Shen Tonic", "Immune Master", "Spirit Calmer", "Longevity"],
        "tcm_actions": ["Nourishes the Heart", "Calms the Shen", "Tonifies Qi", "Transforms phlegm"],
        "energetic_profile": {
            "yin_yang": "Balanced (Shen cultivation)",
            "qi_direction": "Centering",
            "organ_clock": "11:00-13:00 (Heart)",
            "season": "All seasons (timeless)",
        },
        "traditional_use": "Ling Zhi — 'Spirit Plant' or 'Mushroom of Immortality'. Classified as Superior in all ancient Chinese pharmacopeias. The Taoist elixir of spiritual awakening.",
        "growing": {"zone": "4-9", "sun": "Deep shade", "soil": "Hardwood logs/sawdust", "years_to_harvest": 2},
        "trade_value": {"base_credits": 15, "seasonal_multiplier": 1.0, "tradeable": True},
        "spiritual": "The supreme Shen tonic. Opens the Heart to receive cosmic wisdom. Bridges mortality and immortality.",
    },
    {
        "id": "mugwort",
        "name": "Mugwort",
        "latin": "Artemisia vulgaris",
        "family": "Asteraceae",
        "element": "Fire",
        "nature": "Warm",
        "tastes": ["Bitter", "Pungent"],
        "meridians": ["Spleen", "Kidney", "Liver"],
        "rarity": "common",
        "parts_used": "Leaves, stems",
        "properties": ["Dream Herb", "Moxibustion", "Warming", "Blood Mover"],
        "tcm_actions": ["Warms the channels", "Stops bleeding", "Disperses cold", "Alleviates pain"],
        "energetic_profile": {
            "yin_yang": "Yang-warming",
            "qi_direction": "Dispersing",
            "organ_clock": "09:00-11:00 (Spleen)",
            "season": "Summer",
        },
        "traditional_use": "Ai Ye — the herb of moxibustion. Burned on acupuncture points for 3,000+ years to drive cold from the meridians. Also the Western 'Dream Herb' placed under pillows for lucid dreaming.",
        "growing": {"zone": "3-9", "sun": "Full sun", "soil": "Any (invasive)", "years_to_harvest": 1},
        "trade_value": {"base_credits": 2, "seasonal_multiplier": 1.1, "tradeable": True},
        "spiritual": "Gateway herb for dream work and divination. Burns in ceremony to clear stagnant energy.",
    },
    {
        "id": "lotus_seed",
        "name": "Lotus Seed",
        "latin": "Nelumbo nucifera",
        "family": "Nelumbonaceae",
        "element": "Earth",
        "nature": "Neutral",
        "tastes": ["Sweet"],
        "meridians": ["Spleen", "Kidney", "Heart"],
        "rarity": "uncommon",
        "parts_used": "Seed, root, leaf, flower",
        "properties": ["Shen Calmer", "Spleen Tonic", "Astringent", "Nutritive"],
        "tcm_actions": ["Tonifies Spleen", "Stops diarrhea", "Nourishes Heart", "Calms the spirit"],
        "energetic_profile": {
            "yin_yang": "Balanced (centering)",
            "qi_direction": "Centering & Descending",
            "organ_clock": "11:00-13:00 (Heart)",
            "season": "Late Summer",
        },
        "traditional_use": "Sacred across Buddhism, Hinduism, and Taoism. Every part is used: seeds calm the Shen, root nourishes Blood, leaf clears Summer Heat, stem moves Blood stasis.",
        "growing": {"zone": "4-10", "sun": "Full sun", "soil": "Aquatic / pond mud", "years_to_harvest": 2},
        "trade_value": {"base_credits": 4, "seasonal_multiplier": 1.2, "tradeable": True},
        "spiritual": "The supreme symbol of spiritual emergence from the mud of material existence. Enlightenment unfolding petal by petal.",
    },
    {
        "id": "white_peony",
        "name": "White Peony",
        "latin": "Paeonia lactiflora",
        "family": "Paeoniaceae",
        "element": "Wood",
        "nature": "Cool",
        "tastes": ["Bitter", "Sour"],
        "meridians": ["Liver", "Spleen"],
        "rarity": "common",
        "parts_used": "Root",
        "properties": ["Blood Nourisher", "Liver Soother", "Pain Reliever", "Yin Preserver"],
        "tcm_actions": ["Nourishes Blood", "Regulates menstruation", "Softens the Liver", "Preserves Yin"],
        "energetic_profile": {
            "yin_yang": "Yin-nourishing",
            "qi_direction": "Inward",
            "organ_clock": "01:00-03:00 (Liver)",
            "season": "Spring",
        },
        "traditional_use": "Bai Shao — one of the most prescribed herbs in Chinese medicine. The gentle blood nourisher. Paired with Dang Gui in 'Four Substances Decoction' for blood deficiency.",
        "growing": {"zone": "3-8", "sun": "Full sun to partial shade", "soil": "Rich, well-drained", "years_to_harvest": 3},
        "trade_value": {"base_credits": 3, "seasonal_multiplier": 1.1, "tradeable": True},
        "spiritual": "Feminine grace and inner beauty. Softens rigidity. The gentle path of healing.",
    },
    {
        "id": "cordyceps",
        "name": "Cordyceps",
        "latin": "Cordyceps sinensis",
        "family": "Ophiocordycipitaceae",
        "element": "Fire",
        "nature": "Warm",
        "tastes": ["Sweet"],
        "meridians": ["Lung", "Kidney"],
        "rarity": "legendary",
        "parts_used": "Whole fungus",
        "properties": ["Lung-Kidney Bridge", "Endurance", "Jing Preserver", "Altitude Adapter"],
        "tcm_actions": ["Tonifies Kidney Yang", "Augments Lung Yin", "Transforms Phlegm", "Stops bleeding"],
        "energetic_profile": {
            "yin_yang": "Yang-tonifying (with Yin protection)",
            "qi_direction": "Ascending & Descending (bidirectional)",
            "organ_clock": "15:00-17:00 (Kidney-Bladder)",
            "season": "Winter / Early Spring",
        },
        "traditional_use": "Dong Chong Xia Cao — 'Winter Worm, Summer Grass'. Perhaps the most exotic substance in TCM. Bridges the plant and animal kingdoms. Tibetan herdsmen discovered their yaks gained extraordinary strength when grazing on cordyceps-rich pastures.",
        "growing": {"zone": "Cultivated (lab)", "sun": "Dark (cave-like)", "soil": "Grain substrate", "years_to_harvest": 1},
        "trade_value": {"base_credits": 18, "seasonal_multiplier": 2.0, "tradeable": True},
        "spiritual": "The bridge between death and rebirth. Transmutation of life force. Ultimate Jing preservation.",
    },
    {
        "id": "licorice",
        "name": "Licorice Root",
        "latin": "Glycyrrhiza glabra",
        "family": "Fabaceae",
        "element": "Earth",
        "nature": "Neutral",
        "tastes": ["Sweet"],
        "meridians": ["All twelve meridians"],
        "rarity": "common",
        "parts_used": "Root",
        "properties": ["The Harmonizer", "Qi Tonic", "Detoxifier", "Formula Guide"],
        "tcm_actions": ["Tonifies Spleen Qi", "Moistens Lung", "Clears Heat-toxin", "Harmonizes other herbs"],
        "energetic_profile": {
            "yin_yang": "Balanced (neutral harmonizer)",
            "qi_direction": "All directions (the peacemaker)",
            "organ_clock": "Universal",
            "season": "All seasons",
        },
        "traditional_use": "Gan Cao — 'Sweet Herb'. Appears in more TCM formulas than any other herb. Called 'The Great Detoxifier' and 'The Peacemaker' because it harmonizes all other herbs in a formula.",
        "growing": {"zone": "7-10", "sun": "Full sun", "soil": "Deep, sandy", "years_to_harvest": 3},
        "trade_value": {"base_credits": 2, "seasonal_multiplier": 1.0, "tradeable": True},
        "spiritual": "The mediator between conflicting energies. Teaches the wisdom of harmony and balance.",
    },
]

# Pre-compute gravity mass and frequency for each plant
for plant in PLANT_CATALOG:
    plant["gravity_mass"] = calculate_gravity_mass(plant)
    plant["frequency"] = derive_frequency(plant)
    plant["element_color"] = ELEMENT_COLORS.get(plant["element"], "#A3A3A3")
    plant["nature_color"] = NATURE_COLORS.get(plant["nature"], "#A3A3A3")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  API ROUTES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/botany/catalog")
async def get_plant_catalog(user=Depends(get_current_user)):
    """Full plant catalog with energetic profiles and gravity masses."""
    tier = await db.mastery_tiers.find_one({"user_id": user["id"]}, {"_id": 0})
    current_tier = tier.get("current_tier", "observer") if tier else "observer"

    MASTERY_TIERS = ["observer", "synthesizer", "archivist", "navigator", "sovereign"]
    tier_idx = MASTERY_TIERS.index(current_tier) if current_tier in MASTERY_TIERS else 0

    rarity_tier_req = {"common": 0, "uncommon": 1, "rare": 2, "legendary": 3}

    plants = []
    for p in PLANT_CATALOG:
        req = rarity_tier_req.get(p["rarity"], 0)
        unlocked = tier_idx >= req
        plant_data = {**p}
        if not unlocked:
            plant_data["locked"] = True
            plant_data["locked_reason"] = f"Requires {MASTERY_TIERS[min(req, len(MASTERY_TIERS)-1)].title()} tier"
            plant_data["tcm_actions"] = []
            plant_data["traditional_use"] = "Locked"
            plant_data["spiritual"] = "Locked"
        else:
            plant_data["locked"] = False
        plants.append(plant_data)

    return {
        "plants": plants,
        "current_tier": current_tier,
        "element_frequencies": ELEMENT_FREQUENCY,
        "element_colors": ELEMENT_COLORS,
        "nature_colors": NATURE_COLORS,
    }


@router.get("/botany/plant/{plant_id}")
async def get_plant_detail(plant_id: str, user=Depends(get_current_user)):
    """Get full detail for a single plant including user's garden status."""
    plant = next((p for p in PLANT_CATALOG if p["id"] == plant_id), None)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")

    garden_entry = await db.user_garden.find_one(
        {"user_id": user["id"], "plant_id": plant_id}, {"_id": 0}
    )

    interactions = await db.gravity_interactions.find_one(
        {"user_id": user["id"], "node_id": f"plant-{plant_id}"}, {"_id": 0}
    )

    return {
        **plant,
        "in_garden": garden_entry is not None,
        "garden_data": garden_entry,
        "interaction_data": interactions,
    }


@router.post("/botany/garden/add")
async def add_to_garden(data: dict = Body(...), user=Depends(get_current_user)):
    """Add a plant to the user's personal garden."""
    plant_id = data.get("plant_id", "")
    plant = next((p for p in PLANT_CATALOG if p["id"] == plant_id), None)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")

    existing = await db.user_garden.find_one({"user_id": user["id"], "plant_id": plant_id})
    if existing:
        raise HTTPException(status_code=400, detail="Plant already in your garden")

    count = await db.user_garden.count_documents({"user_id": user["id"]})
    if count >= 24:
        raise HTTPException(status_code=400, detail="Garden full (max 24 plants)")

    entry = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "plant_id": plant_id,
        "plant_name": plant["name"],
        "element": plant["element"],
        "nature": plant["nature"],
        "gravity_mass": plant["gravity_mass"],
        "frequency": plant["frequency"],
        "stage": "Seed",
        "nurture_count": 0,
        "last_nurtured": None,
        "notes": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.user_garden.insert_one(entry)
    entry.pop("_id", None)
    return entry


@router.get("/botany/garden")
async def get_my_garden(user=Depends(get_current_user)):
    """Get user's personal botanical garden."""
    garden = await db.user_garden.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(24)

    # Calculate garden energetics summary
    elements = {}
    natures = {}
    total_mass = 0
    for g in garden:
        elem = g.get("element", "Earth")
        nat = g.get("nature", "Neutral")
        elements[elem] = elements.get(elem, 0) + 1
        natures[nat] = natures.get(nat, 0) + 1
        total_mass += g.get("gravity_mass", 60)

    dominant_element = max(elements, key=elements.get) if elements else "Earth"
    dominant_nature = max(natures, key=natures.get) if natures else "Neutral"

    return {
        "garden": garden,
        "summary": {
            "total_plants": len(garden),
            "dominant_element": dominant_element,
            "dominant_nature": dominant_nature,
            "element_distribution": elements,
            "nature_distribution": natures,
            "total_gravity_mass": total_mass,
            "garden_frequency": ELEMENT_FREQUENCY.get(dominant_element, 639.0),
        },
    }


@router.post("/botany/garden/nurture")
async def nurture_plant(data: dict = Body(...), user=Depends(get_current_user)):
    """Nurture a plant in your garden (daily action)."""
    garden_id = data.get("garden_id", "")

    entry = await db.user_garden.find_one({"id": garden_id, "user_id": user["id"]})
    if not entry:
        raise HTTPException(status_code=404, detail="Garden entry not found")

    today = datetime.now(timezone.utc).date().isoformat()
    if entry.get("last_nurtured") == today:
        raise HTTPException(status_code=400, detail="Already nurtured today")

    stages = ["Seed", "Sprout", "Sapling", "Mature", "Ancient", "Transcendent"]
    nurtures_per_stage = 5
    new_count = entry.get("nurture_count", 0) + 1
    current_stage = entry.get("stage", "Seed")
    grew = False
    new_stage = current_stage

    stage_progress = new_count % nurtures_per_stage
    if stage_progress == 0:
        idx = stages.index(current_stage) if current_stage in stages else 0
        if idx < len(stages) - 1:
            new_stage = stages[idx + 1]
            grew = True

    await db.user_garden.update_one({"id": garden_id}, {"$set": {
        "nurture_count": new_count,
        "last_nurtured": today,
        "stage": new_stage,
    }})

    return {
        "grew": grew,
        "stage": new_stage,
        "nurture_count": new_count,
        "next_stage_in": nurtures_per_stage - (new_count % nurtures_per_stage),
    }


@router.delete("/botany/garden/{garden_id}")
async def remove_from_garden(garden_id: str, user=Depends(get_current_user)):
    """Remove a plant from your garden."""
    result = await db.user_garden.delete_one({"id": garden_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Garden entry not found")
    return {"status": "removed"}


@router.post("/botany/identify")
async def identify_plant(data: dict = Body(...), user=Depends(get_current_user)):
    """AI-powered plant identification from description. Returns TCM energetic profile."""
    description = data.get("description", "").strip()
    if not description or len(description) < 5:
        raise HTTPException(status_code=400, detail="Provide a plant description (name, appearance, or symptoms)")

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"botany-identify-{user['id']}-{uuid.uuid4().hex[:8]}",
            system_message=(
                "You are a Traditional Chinese Medicine botanical expert. "
                "When given a plant description, identify it and provide its TCM energetic profile. "
                "Respond in valid JSON with these exact fields: "
                '{"name": "...", "latin": "...", "element": "Wood|Fire|Earth|Metal|Water", '
                '"nature": "Hot|Warm|Neutral|Cool|Cold", "tastes": ["..."], '
                '"meridians": ["..."], "tcm_actions": ["..."], "spiritual": "...", '
                '"preparation_suggestion": "..."}'
            ),
        )
        chat = chat.with_model("gemini", "gemini-3-flash-preview")
        response = await chat.send_message(UserMessage(text=f"Identify this plant and provide its TCM energetic profile: {description}"))

        import json
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

        result = json.loads(text)
        result["frequency"] = ELEMENT_FREQUENCY.get(result.get("element", "Earth"), 639.0)
        result["gravity_mass"] = 60 + ELEMENT_WEIGHT.get(result.get("element", "Earth"), 12) + NATURE_WEIGHT.get(result.get("nature", "Neutral"), 5)
        result["element_color"] = ELEMENT_COLORS.get(result.get("element", "Earth"), "#A3A3A3")
        result["nature_color"] = NATURE_COLORS.get(result.get("nature", "Neutral"), "#A3A3A3")

        return {"identification": result, "source": "ai"}

    except Exception as e:
        logger.error(f"Plant identification error: {e}")
        return {
            "identification": {
                "name": "Unknown Plant",
                "element": "Earth",
                "nature": "Neutral",
                "frequency": 639.0,
                "gravity_mass": 65,
                "note": "Could not identify. Try providing more detail.",
            },
            "source": "fallback",
        }


@router.get("/botany/element-map")
async def get_element_map(user=Depends(get_current_user)):
    """Get the Five Elements relationship map with all plants grouped."""
    element_groups = {}
    for elem in ELEMENT_FREQUENCY:
        plants_in_elem = [
            {"id": p["id"], "name": p["name"], "nature": p["nature"], "gravity_mass": p["gravity_mass"], "rarity": p["rarity"]}
            for p in PLANT_CATALOG if p["element"] == elem
        ]
        element_groups[elem] = {
            "frequency": ELEMENT_FREQUENCY[elem],
            "color": ELEMENT_COLORS[elem],
            "plants": plants_in_elem,
            "generating": {"Wood": "Fire", "Fire": "Earth", "Earth": "Metal", "Metal": "Water", "Water": "Wood"}[elem],
            "controlling": {"Wood": "Earth", "Fire": "Metal", "Earth": "Water", "Metal": "Wood", "Water": "Fire"}[elem],
        }

    return {"elements": element_groups}


@router.get("/botany/gravity-nodes")
async def get_botany_gravity_nodes(user=Depends(get_current_user)):
    """Return plant catalog as gravity nodes for the Spatial OS."""
    nodes = []
    for p in PLANT_CATALOG:
        nodes.append({
            "id": f"plant-{p['id']}",
            "label": p["name"],
            "type": "botanical",
            "frequency": p["frequency"],
            "origin_language": "TCM",
            "gravity_mass": p["gravity_mass"],
            "category": p["element"].lower(),
            "description": p.get("traditional_use", "")[:100],
            "nature": p["nature"],
            "rarity": p["rarity"],
            "element_color": p["element_color"],
        })
    return {"nodes": nodes}
