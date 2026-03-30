import asyncio
import uuid
import base64
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Body, HTTPException
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  AVATAR BUILDER PARTS CATALOG
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AVATAR_CATEGORIES = [
    {
        "id": "base_form",
        "name": "Base Form",
        "description": "The fundamental shape of your spiritual being",
        "step": 1,
        "options": [
            {"id": "humanoid", "name": "Humanoid", "color": "#818CF8",
             "desc": "A refined human-like form radiating inner light.",
             "prompt_fragment": "humanoid spiritual being with elegant proportions, glowing skin"},
            {"id": "ethereal", "name": "Ethereal", "color": "#C084FC",
             "desc": "A translucent being of pure energy, barely physical.",
             "prompt_fragment": "translucent ethereal energy being, body made of flowing light particles"},
            {"id": "crystalline", "name": "Crystalline", "color": "#A855F7",
             "desc": "A living crystal entity, sharp angles and prismatic refractions.",
             "prompt_fragment": "crystalline being made of living gemstone, prismatic refractions through body"},
            {"id": "aquatic", "name": "Aquatic", "color": "#38BDF8",
             "desc": "A fluid, ocean-born entity with bioluminescent features.",
             "prompt_fragment": "aquatic spiritual being with flowing fins, bioluminescent markings, fluid body"},
            {"id": "flame_being", "name": "Flame Being", "color": "#F59E0B",
             "desc": "A being of living fire, constantly shifting and blazing.",
             "prompt_fragment": "being made of cosmic fire and plasma, constantly shifting flame body"},
            {"id": "void_entity", "name": "Void Entity", "color": "#6366F1",
             "desc": "A being of compressed darkness, stars visible within its form.",
             "prompt_fragment": "dark void entity with galaxies and stars visible inside body, cosmic silhouette"},
            {"id": "nature_spirit", "name": "Nature Spirit", "color": "#34D399",
             "desc": "A being woven from living plants, flowers, and earth.",
             "prompt_fragment": "nature spirit with body of living vines, flowers, bark, and moss, glowing green energy"},
            {"id": "chimera", "name": "Cosmic Chimera", "color": "#EC4899",
             "desc": "A fusion of multiple cosmic creatures — part dragon, part phoenix, part serpent.",
             "prompt_fragment": "cosmic chimera creature with dragon wings, phoenix feathers, serpent tail, multiple cosmic animal features"},
        ],
    },
    {
        "id": "aura",
        "name": "Aura & Energy Field",
        "description": "The visible energy field surrounding your being",
        "step": 2,
        "options": [
            {"id": "radiant_gold", "name": "Radiant Gold", "color": "#FCD34D",
             "desc": "A blazing golden aura of divine authority.",
             "prompt_fragment": "surrounded by radiant golden aura, divine light emanating outward"},
            {"id": "violet_flame", "name": "Violet Flame", "color": "#A855F7",
             "desc": "The transmuting violet flame of Saint Germain.",
             "prompt_fragment": "enveloped in violet flame aura, purple transmuting fire energy field"},
            {"id": "aurora_borealis", "name": "Aurora Borealis", "color": "#34D399",
             "desc": "Shifting curtains of northern lights swirl around you.",
             "prompt_fragment": "surrounded by aurora borealis energy, shifting green and purple light curtains"},
            {"id": "nebula_cloud", "name": "Nebula Cloud", "color": "#EC4899",
             "desc": "A personal nebula of cosmic gas and newborn stars.",
             "prompt_fragment": "enveloped in colorful nebula cloud aura, cosmic gas and baby stars forming around body"},
            {"id": "electric_plasma", "name": "Electric Plasma", "color": "#38BDF8",
             "desc": "Crackling arcs of plasma and lightning.",
             "prompt_fragment": "crackling electric plasma aura, lightning arcs and energy discharges surrounding body"},
            {"id": "shadow_mist", "name": "Shadow Mist", "color": "#6366F1",
             "desc": "Dark wisps of shadow energy curl protectively around you.",
             "prompt_fragment": "dark shadow mist aura, wisps of darkness curling around body, mysterious energy"},
            {"id": "crystalline_matrix", "name": "Crystalline Matrix", "color": "#F0ABFC",
             "desc": "A lattice of floating crystal shards orbiting your form.",
             "prompt_fragment": "orbiting crystalline matrix aura, floating crystal shards forming sacred geometry around body"},
            {"id": "chakra_rainbow", "name": "Chakra Rainbow", "color": "#EF4444",
             "desc": "All seven chakra colors visible as stacked energy rings.",
             "prompt_fragment": "seven chakra energy rings visible, rainbow spectrum aura from root to crown"},
        ],
    },
    {
        "id": "cosmic_features",
        "name": "Cosmic Features",
        "description": "Distinctive cosmic traits and appendages",
        "step": 3,
        "multi_select": True,
        "max_selections": 4,
        "options": [
            {"id": "angel_wings", "name": "Angelic Wings", "color": "#FCD34D",
             "desc": "Vast feathered wings of pure white light.", "level_req": 1,
             "prompt_fragment": "with large angelic wings made of white light feathers"},
            {"id": "dragon_wings", "name": "Dragon Wings", "color": "#EF4444",
             "desc": "Leathery cosmic dragon wings with star patterns.", "level_req": 2,
             "prompt_fragment": "with dragon wings covered in constellation patterns, cosmic membrane"},
            {"id": "butterfly_wings", "name": "Ethereal Butterfly Wings", "color": "#EC4899",
             "desc": "Delicate, iridescent wings of pure energy.", "level_req": 1,
             "prompt_fragment": "with delicate butterfly wings made of shimmering iridescent energy"},
            {"id": "third_eye", "name": "Third Eye", "color": "#A855F7",
             "desc": "A luminous third eye on the forehead, seeing beyond reality.", "level_req": 3,
             "prompt_fragment": "with glowing third eye on forehead, radiating purple light"},
            {"id": "halo", "name": "Cosmic Halo", "color": "#FBBF24",
             "desc": "A ring of concentrated cosmic energy above the head.", "level_req": 2,
             "prompt_fragment": "with floating halo ring of cosmic energy above head"},
            {"id": "horns", "name": "Celestial Horns", "color": "#DC2626",
             "desc": "Elegant curved horns of crystallized starlight.", "level_req": 4,
             "prompt_fragment": "with elegant curved horns made of crystallized starlight"},
            {"id": "crystal_growths", "name": "Crystal Growths", "color": "#C084FC",
             "desc": "Living crystals sprouting from shoulders and back.", "level_req": 3,
             "prompt_fragment": "with crystal formations growing from shoulders and spine"},
            {"id": "tentacles", "name": "Cosmic Tentacles", "color": "#0EA5E9",
             "desc": "Graceful tentacle appendages flowing with bioluminescence.", "level_req": 5,
             "prompt_fragment": "with flowing cosmic tentacles, bioluminescent patterns along each tentacle"},
            {"id": "tail", "name": "Celestial Tail", "color": "#34D399",
             "desc": "A long, prehensile tail trailing cosmic particles.", "level_req": 2,
             "prompt_fragment": "with long celestial tail trailing cosmic particles and stardust"},
            {"id": "extra_arms", "name": "Multiple Arms", "color": "#F59E0B",
             "desc": "Four or six arms, each holding a different cosmic artifact.", "level_req": 6,
             "prompt_fragment": "with multiple arms like a cosmic deity, each hand holding energy"},
            {"id": "floating_orbs", "name": "Floating Orbs", "color": "#818CF8",
             "desc": "Spheres of concentrated energy orbiting your body.", "level_req": 1,
             "prompt_fragment": "with glowing energy orbs floating around and orbiting body"},
            {"id": "eye_constellation", "name": "Constellation Eyes", "color": "#6366F1",
             "desc": "Eyes replaced with miniature star constellations.", "level_req": 4,
             "prompt_fragment": "with eyes made of miniature star constellations, galaxies visible in pupils"},
        ],
    },
    {
        "id": "markings",
        "name": "Sacred Markings",
        "description": "Mystical patterns inscribed on your form",
        "step": 4,
        "multi_select": True,
        "max_selections": 3,
        "options": [
            {"id": "sacred_geometry", "name": "Sacred Geometry", "color": "#A855F7",
             "desc": "Metatron's Cube, Flower of Life, and platonic solids.",
             "prompt_fragment": "with sacred geometry patterns on skin, Metatron's cube, flower of life"},
            {"id": "bioluminescent", "name": "Bioluminescent Lines", "color": "#38BDF8",
             "desc": "Glowing circuit-like lines tracing your energy meridians.",
             "prompt_fragment": "with bioluminescent glowing lines tracing energy meridians across body"},
            {"id": "star_maps", "name": "Star Map Tattoos", "color": "#FCD34D",
             "desc": "Actual constellation maps etched across your skin.",
             "prompt_fragment": "with constellation star map tattoos across skin, accurate star patterns"},
            {"id": "runes", "name": "Ancient Runes", "color": "#DC2626",
             "desc": "Elder Futhark and cosmic runes glowing with power.",
             "prompt_fragment": "with glowing ancient runes inscribed on body, elder futhark symbols"},
            {"id": "fractal_patterns", "name": "Fractal Patterns", "color": "#EC4899",
             "desc": "Infinite fractal spirals embedded in your form.",
             "prompt_fragment": "with fractal spiral patterns across skin, Mandelbrot set designs"},
            {"id": "elemental_sigils", "name": "Elemental Sigils", "color": "#F59E0B",
             "desc": "Sigils of the five elements: fire, water, earth, air, spirit.",
             "prompt_fragment": "with elemental sigils on body, fire water earth air spirit symbols glowing"},
            {"id": "chakra_symbols", "name": "Chakra Symbols", "color": "#34D399",
             "desc": "The seven chakra symbols aligned along your spine.",
             "prompt_fragment": "with seven chakra symbols visible along spine, each glowing its respective color"},
            {"id": "tribal_cosmic", "name": "Cosmic Tribal", "color": "#9CA3AF",
             "desc": "Bold tribal patterns infused with cosmic energy.",
             "prompt_fragment": "with cosmic tribal patterns on skin, bold lines filled with starlight"},
        ],
    },
    {
        "id": "accessories",
        "name": "Cosmic Accessories",
        "description": "Sacred objects and adornments",
        "step": 5,
        "multi_select": True,
        "max_selections": 3,
        "options": [
            {"id": "crown_light", "name": "Crown of Light", "color": "#FCD34D",
             "desc": "A radiant crown woven from pure concentrated light.",
             "prompt_fragment": "wearing a crown made of concentrated golden light, divine headpiece"},
            {"id": "crystal_crown", "name": "Crystal Crown", "color": "#A855F7",
             "desc": "A crown of raw amethyst and quartz crystals.",
             "prompt_fragment": "wearing a crown of raw amethyst and clear quartz crystal points"},
            {"id": "flowing_cloak", "name": "Celestial Cloak", "color": "#6366F1",
             "desc": "A cloak that shows the night sky within its fabric.",
             "prompt_fragment": "wearing a flowing cloak with the night sky visible in its fabric, stars and galaxies within"},
            {"id": "energy_orb", "name": "Energy Orb (Held)", "color": "#38BDF8",
             "desc": "A sphere of raw cosmic power held in your palm.",
             "prompt_fragment": "holding a glowing sphere of cosmic energy in one hand"},
            {"id": "staff", "name": "Astral Staff", "color": "#34D399",
             "desc": "A tall staff topped with a cosmic gemstone.",
             "prompt_fragment": "holding tall astral staff with large glowing gemstone at top"},
            {"id": "floating_runes", "name": "Floating Rune Stones", "color": "#F59E0B",
             "desc": "Rune-carved stones orbiting your body.",
             "prompt_fragment": "with floating rune stones orbiting around body, each carved with ancient symbols"},
            {"id": "spirit_companion", "name": "Spirit Companion", "color": "#EC4899",
             "desc": "A small cosmic creature perched on your shoulder.",
             "prompt_fragment": "with a small cosmic spirit creature companion on shoulder, glowing ethereal pet"},
            {"id": "chains_of_light", "name": "Chains of Light", "color": "#818CF8",
             "desc": "Decorative chains of pure light draped across your form.",
             "prompt_fragment": "adorned with decorative chains made of pure light, ethereal jewelry"},
            {"id": "cosmic_shield", "name": "Cosmic Shield", "color": "#EF4444",
             "desc": "A floating shield bearing sacred symbols.",
             "prompt_fragment": "with floating cosmic shield nearby, bearing sacred geometry symbols"},
            {"id": "meditation_pose", "name": "Lotus Meditation Pose", "color": "#34D399",
             "desc": "Depicted in serene floating lotus position.",
             "prompt_fragment": "in serene floating lotus meditation pose, levitating"},
        ],
    },
    {
        "id": "background",
        "name": "Cosmic Background",
        "description": "The realm or setting behind your avatar",
        "step": 6,
        "options": [
            {"id": "deep_space", "name": "Deep Space", "color": "#1E1B4B",
             "desc": "The infinite void between galaxies.",
             "prompt_fragment": "deep space background with distant galaxies and nebulae"},
            {"id": "nebula", "name": "Nebula Birth", "color": "#EC4899",
             "desc": "Inside a colorful star-forming nebula.",
             "prompt_fragment": "inside colorful nebula with gas clouds, star formation happening"},
            {"id": "crystal_cavern", "name": "Crystal Cavern", "color": "#A855F7",
             "desc": "A vast underground cavern of glowing crystals.",
             "prompt_fragment": "inside vast crystal cavern with glowing amethyst and quartz formations"},
            {"id": "astral_temple", "name": "Astral Temple", "color": "#818CF8",
             "desc": "An ancient temple floating in the astral plane.",
             "prompt_fragment": "in ancient floating astral temple, sacred architecture, cosmic pillars"},
            {"id": "sacred_forest", "name": "Sacred Forest", "color": "#34D399",
             "desc": "An enchanted forest with bioluminescent trees.",
             "prompt_fragment": "in sacred bioluminescent forest, glowing trees and floating spirits"},
            {"id": "volcanic_forge", "name": "Volcanic Forge", "color": "#EF4444",
             "desc": "A forge within a cosmic volcano.",
             "prompt_fragment": "in cosmic volcanic forge, rivers of lava and molten starlight"},
            {"id": "ocean_depths", "name": "Cosmic Ocean", "color": "#0EA5E9",
             "desc": "Deep within a cosmic ocean of liquid starlight.",
             "prompt_fragment": "underwater in cosmic ocean of liquid starlight, celestial sea creatures"},
            {"id": "void_threshold", "name": "Void Threshold", "color": "#6366F1",
             "desc": "At the edge of a dimensional rift.",
             "prompt_fragment": "standing at edge of dimensional rift, void and reality colliding"},
        ],
    },
]

# Evolution unlocks at milestones
EVOLUTION_STAGES = [
    {"level": 1, "name": "Awakened", "unlocks": ["base_form", "aura", "background"], "desc": "Your spiritual form begins to take shape."},
    {"level": 2, "name": "Ascendant", "unlocks": ["cosmic_features_basic"], "desc": "Wings, halos, and tails become available."},
    {"level": 3, "name": "Illuminated", "unlocks": ["markings", "third_eye"], "desc": "Sacred markings and the third eye open."},
    {"level": 5, "name": "Transcendent", "unlocks": ["accessories", "cosmic_features_advanced"], "desc": "Full cosmic accessories and advanced features."},
    {"level": 8, "name": "Cosmic", "unlocks": ["all"], "desc": "Every option is available. You have transcended all limits."},
]


@router.get("/starseed/avatar-builder/catalog")
async def get_avatar_catalog(user=Depends(get_current_user)):
    """Get the full avatar builder catalog with level-gated options."""
    chars = await db.starseed_characters.find(
        {"user_id": user["id"]}, {"_id": 0, "level": 1, "origin_id": 1}
    ).to_list(10)
    best_level = max((c.get("level", 1) for c in chars), default=1) if chars else 1

    # Unlock options based on level
    categories_out = []
    for cat in AVATAR_CATEGORIES:
        cat_out = {**cat, "options": []}
        for opt in cat["options"]:
            level_req = opt.get("level_req", 1)
            cat_out["options"].append({
                **{k: v for k, v in opt.items() if k != "prompt_fragment"},
                "unlocked": best_level >= level_req,
                "level_req": level_req,
            })
        categories_out.append(cat_out)

    return {
        "categories": categories_out,
        "evolution_stages": EVOLUTION_STAGES,
        "current_level": best_level,
    }


@router.get("/starseed/avatar-builder/my-avatar")
async def get_my_built_avatar(user=Depends(get_current_user)):
    """Get user's saved avatar configuration."""
    avatar = await db.spiritual_avatars.find_one(
        {"user_id": user["id"]}, {"_id": 0}
    )
    return {"avatar": avatar}


@router.post("/starseed/avatar-builder/save")
async def save_avatar_config(data: dict = Body(...), user=Depends(get_current_user)):
    """Save avatar builder selections (without generating image)."""
    selections = data.get("selections", {})

    await db.spiritual_avatars.update_one(
        {"user_id": user["id"]},
        {"$set": {
            "user_id": user["id"],
            "selections": selections,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }},
        upsert=True,
    )
    return {"saved": True}


@router.post("/starseed/avatar-builder/generate")
async def generate_built_avatar(data: dict = Body(...), user=Depends(get_current_user)):
    """Generate AI image from avatar builder selections."""
    selections = data.get("selections", {})
    custom_notes = data.get("custom_notes", "")

    # Build composite prompt from selections
    prompt_parts = []

    # Base form
    base_form = selections.get("base_form")
    if base_form:
        opt = _find_option("base_form", base_form)
        if opt:
            prompt_parts.append(opt["prompt_fragment"])

    # Aura
    aura = selections.get("aura")
    if aura:
        opt = _find_option("aura", aura)
        if opt:
            prompt_parts.append(opt["prompt_fragment"])

    # Cosmic features (multi-select)
    features = selections.get("cosmic_features", [])
    for feat_id in features:
        opt = _find_option("cosmic_features", feat_id)
        if opt:
            prompt_parts.append(opt["prompt_fragment"])

    # Markings (multi-select)
    markings = selections.get("markings", [])
    for mark_id in markings:
        opt = _find_option("markings", mark_id)
        if opt:
            prompt_parts.append(opt["prompt_fragment"])

    # Accessories (multi-select)
    accessories = selections.get("accessories", [])
    for acc_id in accessories:
        opt = _find_option("accessories", acc_id)
        if opt:
            prompt_parts.append(opt["prompt_fragment"])

    # Background
    bg = selections.get("background")
    if bg:
        opt = _find_option("background", bg)
        if opt:
            prompt_parts.append(opt["prompt_fragment"])

    if not prompt_parts:
        raise HTTPException(status_code=400, detail="Select at least a base form")

    composite = ", ".join(prompt_parts)
    if custom_notes:
        composite += f". Additional details: {custom_notes}"

    full_prompt = (
        f"Full body portrait of a spiritual cosmic being: {composite}. "
        f"Cinematic fantasy art, dramatic cosmic lighting, ultra detailed, "
        f"mystical atmosphere. No text, no words, no letters. "
        f"Square format, full body centered composition."
    )

    try:
        image_gen = OpenAIImageGeneration(api_key=EMERGENT_LLM_KEY)
        images = await asyncio.wait_for(
            image_gen.generate_images(
                prompt=full_prompt,
                model="gpt-image-1",
                number_of_images=1,
            ),
            timeout=60,
        )
        if images and len(images) > 0:
            avatar_b64 = base64.b64encode(images[0]).decode("utf-8")

            await db.spiritual_avatars.update_one(
                {"user_id": user["id"]},
                {"$set": {
                    "user_id": user["id"],
                    "selections": selections,
                    "custom_notes": custom_notes,
                    "avatar_base64": avatar_b64,
                    "generated_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }},
                upsert=True,
            )

            # Also set as profile avatar
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": {"spiritual_avatar_b64": avatar_b64}}
            )

            return {"avatar_base64": avatar_b64}
        raise HTTPException(status_code=500, detail="Image generation returned no results")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Spiritual avatar gen error: {e}")
        raise HTTPException(status_code=500, detail="Avatar generation failed. Try again.")


def _find_option(category_id, option_id):
    cat = next((c for c in AVATAR_CATEGORIES if c["id"] == category_id), None)
    if not cat:
        return None
    return next((o for o in cat["options"] if o["id"] == option_id), None)
