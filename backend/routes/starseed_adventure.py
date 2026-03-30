import asyncio
import uuid
import json
import base64
import random
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Body, HTTPException
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration

router = APIRouter()

STARSEED_ORIGINS = [
    {
        "id": "pleiadian",
        "name": "Pleiadian",
        "star_system": "The Pleiades (Seven Sisters)",
        "element": "Light",
        "color": "#818CF8",
        "gradient": ["#818CF8", "#C084FC"],
        "traits": ["Empathy", "Healing", "Communication", "Harmony"],
        "description": "Pleiadians are cosmic healers and communicators. You carry ancient wisdom of unconditional love and seek to raise the vibration of all beings you encounter.",
        "lore": "From the shimmering cluster of the Seven Sisters, the Pleiadians have watched over Earth for millennia. Known as the galaxy's great healers, they communicate through light frequencies and emotional resonance. Their civilization mastered the art of heart-centered living long before Earth was born.",
        "starting_stats": {"wisdom": 5, "courage": 3, "compassion": 8, "intuition": 6, "resilience": 3},
    },
    {
        "id": "sirian",
        "name": "Sirian",
        "star_system": "Sirius (The Dog Star)",
        "element": "Water",
        "color": "#38BDF8",
        "gradient": ["#38BDF8", "#2DD4BF"],
        "traits": ["Knowledge", "Technology", "Protection", "Balance"],
        "description": "Sirians are the guardians of sacred knowledge. You bridge advanced technology with spiritual wisdom, and your presence brings order to chaos.",
        "lore": "Sirius, the brightest star in Earth's night sky, harbors an ancient aquatic civilization of immense technological and spiritual advancement. The Sirians taught the Egyptians to build pyramids, guided the Dogon tribe with star maps, and seeded Earth with dolphin consciousness to maintain the planet's energetic grid.",
        "starting_stats": {"wisdom": 7, "courage": 4, "compassion": 4, "intuition": 5, "resilience": 5},
    },
    {
        "id": "arcturian",
        "name": "Arcturian",
        "star_system": "Arcturus",
        "element": "Crystal",
        "color": "#A855F7",
        "gradient": ["#A855F7", "#EC4899"],
        "traits": ["Geometry", "Structure", "Ascension", "Precision"],
        "description": "Arcturians are the architects of dimensional gateways. You think in sacred geometry and can perceive the mathematical fabric underlying all reality.",
        "lore": "Arcturus is the gateway between the physical and non-physical dimensions. The Arcturian civilization is the most advanced in our galaxy — they exist as light beings who have transcended physical form entirely. They created the crystalline grid that connects all star systems and serve as the galaxy's record keepers.",
        "starting_stats": {"wisdom": 8, "courage": 3, "compassion": 3, "intuition": 7, "resilience": 4},
    },
    {
        "id": "lyran",
        "name": "Lyran",
        "star_system": "Vega (Lyra Constellation)",
        "element": "Fire",
        "color": "#F59E0B",
        "gradient": ["#F59E0B", "#EF4444"],
        "traits": ["Leadership", "Courage", "Independence", "Adventure"],
        "description": "Lyrans are the original starseeds — the first humanoid civilization in our galaxy. You carry the fire of creation and an unstoppable drive to explore the unknown.",
        "lore": "The Lyrans were the firstborn of our galaxy — the original humanoid race from which all others descended. Their civilization was vast and powerful, but a great war scattered them across the stars. From Lyra came the Pleiadians, Sirians, and eventually the seeds of humanity itself. Lyran souls carry the memory of that first civilization and its boundless creative fire.",
        "starting_stats": {"wisdom": 4, "courage": 8, "compassion": 3, "intuition": 3, "resilience": 7},
    },
    {
        "id": "andromedan",
        "name": "Andromedan",
        "star_system": "Andromeda Galaxy",
        "element": "Void",
        "color": "#0EA5E9",
        "gradient": ["#0EA5E9", "#6366F1"],
        "traits": ["Freedom", "Innovation", "Telepathy", "Sovereignty"],
        "description": "Andromedans are freedom seekers from beyond our galaxy. You value sovereign thought, telepathic connection, and the liberation of all conscious beings.",
        "lore": "Beyond the Milky Way, the Andromeda Galaxy hosts a civilization that exists in a state of perpetual evolution. Andromedans are master telepaths who communicate through shared consciousness fields. They volunteered to incarnate on Earth during this critical time of transformation to help humanity break free from limiting belief systems and step into galactic citizenship.",
        "starting_stats": {"wisdom": 5, "courage": 5, "compassion": 5, "intuition": 6, "resilience": 4},
    },
    {
        "id": "orion",
        "name": "Orion",
        "star_system": "Orion (Betelgeuse & Rigel)",
        "element": "Shadow",
        "color": "#DC2626",
        "gradient": ["#DC2626", "#F59E0B"],
        "traits": ["Strategy", "Willpower", "Transformation", "Mastery"],
        "description": "Orion starseeds have walked through darkness and emerged with unmatched strength. You understand duality, shadow work, and the alchemy of transforming pain into power.",
        "lore": "The Orion system witnessed the galaxy's greatest conflict — the Orion Wars. This epic struggle between light and dark forces shaped the destiny of countless civilizations. Orion starseeds carry the memory of this duality. They incarnated on Earth not to avoid darkness, but to master it — transforming shadow into light through sheer willpower and spiritual alchemy.",
        "starting_stats": {"wisdom": 4, "courage": 6, "compassion": 3, "intuition": 4, "resilience": 8},
    },
]


@router.get("/starseed/origins")
async def get_starseed_origins():
    return {"origins": [{k: v for k, v in o.items() if k != "starting_stats"} for o in STARSEED_ORIGINS]}


@router.post("/starseed/create-character")
async def create_character(data: dict = Body(...), user=Depends(get_current_user)):
    origin_id = data.get("origin_id")
    character_name = data.get("character_name", "Traveler")

    origin = next((o for o in STARSEED_ORIGINS if o["id"] == origin_id), None)
    if not origin:
        raise HTTPException(status_code=400, detail="Invalid starseed origin")

    uid = user["id"]
    existing = await db.starseed_characters.find_one(
        {"user_id": uid, "origin_id": origin_id}, {"_id": 0}
    )
    if existing:
        return existing

    character = {
        "id": str(uuid.uuid4()),
        "user_id": uid,
        "origin_id": origin_id,
        "character_name": character_name,
        "level": 1,
        "xp": 0,
        "xp_to_next": 100,
        "chapter": 1,
        "scene": 0,
        "stats": {**origin["starting_stats"]},
        "choices_made": [],
        "achievements": [],
        "story_memory": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.starseed_characters.insert_one({**character})
    return character


@router.get("/starseed/character/{origin_id}")
async def get_character(origin_id: str, user=Depends(get_current_user)):
    char = await db.starseed_characters.find_one(
        {"user_id": user["id"], "origin_id": origin_id}, {"_id": 0}
    )
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")
    return char


@router.get("/starseed/my-characters")
async def get_my_characters(user=Depends(get_current_user)):
    chars = await db.starseed_characters.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).to_list(10)
    return {"characters": chars}


@router.post("/starseed/generate-scene")
async def generate_scene(data: dict = Body(...), user=Depends(get_current_user)):
    origin_id = data.get("origin_id")
    choice_index = data.get("choice_index")  # None for first scene

    uid = user["id"]
    char = await db.starseed_characters.find_one(
        {"user_id": uid, "origin_id": origin_id}, {"_id": 0}
    )
    if not char:
        raise HTTPException(status_code=404, detail="Character not found. Create one first.")

    origin = next((o for o in STARSEED_ORIGINS if o["id"] == origin_id), None)
    if not origin:
        raise HTTPException(status_code=400, detail="Invalid origin")

    # Build story context from memory
    story_memory = char.get("story_memory", [])
    choices_made = char.get("choices_made", [])
    chapter = char.get("chapter", 1)
    scene = char.get("scene", 0)
    stats = char.get("stats", origin["starting_stats"])
    character_name = char.get("character_name", "Traveler")

    # If a choice was made, record it
    if choice_index is not None and story_memory:
        last_scene = story_memory[-1] if story_memory else {}
        last_choices = last_scene.get("choices", [])
        if 0 <= choice_index < len(last_choices):
            chosen = last_choices[choice_index]
            choices_made.append({
                "chapter": chapter,
                "scene": scene,
                "choice": chosen.get("text", ""),
                "stat_effect": chosen.get("stat_effect", {}),
            })
            # Apply stat effects
            for stat, delta in chosen.get("stat_effect", {}).items():
                if stat in stats:
                    stats[stat] = max(0, min(15, stats[stat] + delta))
            scene += 1

    # Check chapter progression (every 5 scenes = new chapter)
    if scene > 0 and scene % 5 == 0 and scene // 5 >= chapter:
        chapter = scene // 5 + 1

    # Build memory summary for AI (last 5 scenes)
    memory_summary = ""
    recent_memory = story_memory[-5:] if story_memory else []
    if recent_memory:
        memory_summary = "STORY SO FAR:\n"
        for mem in recent_memory:
            memory_summary += f"- Scene: {mem.get('narrative', '')[:120]}...\n"
            if mem.get("player_choice"):
                memory_summary += f"  Player chose: {mem['player_choice']}\n"

    recent_choices_summary = ""
    if choices_made:
        recent_choices_summary = "RECENT PLAYER CHOICES: " + "; ".join(
            [c["choice"][:60] for c in choices_made[-3:]]
        )

    system_msg = f"""You are a cosmic storyteller narrating an interactive starseed adventure.
The player is a {origin['name']} starseed named {character_name} from {origin['star_system']}.
Their element is {origin['element']}. Their traits: {', '.join(origin['traits'])}.

Current stats: Wisdom {stats['wisdom']}, Courage {stats['courage']}, Compassion {stats['compassion']}, Intuition {stats['intuition']}, Resilience {stats['resilience']}.
Chapter {chapter}, Scene {scene + 1}.

RULES:
- Write immersive, cinematic 2nd-person narrative (120-180 words)
- Create exactly 3 choices for the player, each with different consequences
- Each choice should test a different stat and feel meaningfully different
- Advance the story logically from previous scenes
- Include sensory details: sights, sounds, emotions, cosmic imagery
- The story arc: Ch1=Awakening, Ch2=Trials, Ch3=Allies, Ch4=Darkness, Ch5=Ascension
- Make the {origin['element']} element central to the narrative
- Include an "image_prompt" field: a 1-sentence cinematic scene description for AI art generation (cosmic, painterly, no text/words)
- Return ONLY valid JSON with no markdown formatting

JSON format:
{{
  "narrative": "The story text...",
  "scene_title": "Title of this scene",
  "atmosphere": "one of: mystical, tense, peaceful, epic, dark, ethereal, triumphant",
  "image_prompt": "A cinematic scene description for AI art...",
  "choices": [
    {{"text": "Choice description", "stat_effect": {{"courage": 1}}, "preview": "Brief hint of consequence"}},
    {{"text": "Choice description", "stat_effect": {{"wisdom": 1}}, "preview": "Brief hint"}},
    {{"text": "Choice description", "stat_effect": {{"compassion": 1}}, "preview": "Brief hint"}}
  ],
  "xp_earned": 15
}}"""

    prompt = f"""{memory_summary}
{recent_choices_summary}

Generate the next scene for Chapter {chapter}, Scene {scene + 1} of the {origin['name']} starseed adventure.
{"This is the OPENING scene — set the stage with a dramatic awakening moment." if scene == 0 else "Continue the adventure from the previous events."}"""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"starseed-{uid}-{origin_id}-{uuid.uuid4().hex[:6]}",
            system_message=system_msg,
        )
        chat.with_model("openai", "gpt-4o")
        raw = await asyncio.wait_for(chat.send_message(UserMessage(text=prompt)), timeout=25)
        raw_text = raw.text if hasattr(raw, "text") else str(raw)
        raw_text = raw_text.strip()
        if raw_text.startswith("```"):
            raw_text = raw_text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
        scene_data = json.loads(raw_text)
    except Exception as e:
        logger.error(f"Starseed AI error: {e}")
        scene_data = _fallback_scene(origin, chapter, scene, stats)

    # Ensure valid structure
    if "choices" not in scene_data or len(scene_data["choices"]) < 2:
        scene_data = _fallback_scene(origin, chapter, scene, stats)

    xp_earned = scene_data.get("xp_earned", 15)
    new_xp = char.get("xp", 0) + xp_earned
    new_level = char.get("level", 1)
    xp_to_next = char.get("xp_to_next", 100)
    leveled_up = False
    while new_xp >= xp_to_next:
        new_xp -= xp_to_next
        new_level += 1
        xp_to_next = int(xp_to_next * 1.4)
        leveled_up = True

    # Store scene in memory
    player_choice_text = ""
    if choice_index is not None and choices_made:
        player_choice_text = choices_made[-1].get("choice", "")

    story_memory.append({
        "chapter": chapter,
        "scene": scene,
        "narrative": scene_data.get("narrative", "")[:300],
        "scene_title": scene_data.get("scene_title", f"Scene {scene + 1}"),
        "player_choice": player_choice_text,
        "choices": scene_data.get("choices", []),
    })

    # Keep memory manageable
    if len(story_memory) > 20:
        story_memory = story_memory[-15:]

    # Update character
    now = datetime.now(timezone.utc).isoformat()
    achievements = char.get("achievements", [])
    new_achievements = []
    if chapter >= 2 and "chapter_2" not in achievements:
        achievements.append("chapter_2")
        new_achievements.append({"id": "chapter_2", "title": "Into the Unknown", "desc": "Reached Chapter 2"})
    if chapter >= 3 and "chapter_3" not in achievements:
        achievements.append("chapter_3")
        new_achievements.append({"id": "chapter_3", "title": "Alliance Forged", "desc": "Reached Chapter 3"})
    if new_level >= 5 and "level_5" not in achievements:
        achievements.append("level_5")
        new_achievements.append({"id": "level_5", "title": "Cosmic Initiate", "desc": "Reached Level 5"})
    if len(choices_made) >= 10 and "ten_choices" not in achievements:
        achievements.append("ten_choices")
        new_achievements.append({"id": "ten_choices", "title": "Decisive Mind", "desc": "Made 10 choices"})

    await db.starseed_characters.update_one(
        {"user_id": uid, "origin_id": origin_id},
        {"$set": {
            "level": new_level,
            "xp": new_xp,
            "xp_to_next": xp_to_next,
            "chapter": chapter,
            "scene": scene + 1,
            "stats": stats,
            "choices_made": choices_made,
            "achievements": achievements,
            "story_memory": story_memory,
            "updated_at": now,
        }},
    )

    return {
        "scene": scene_data,
        "character": {
            "level": new_level,
            "xp": new_xp,
            "xp_to_next": xp_to_next,
            "chapter": chapter,
            "scene_num": scene + 1,
            "stats": stats,
            "leveled_up": leveled_up,
            "new_achievements": new_achievements,
        },
    }


def _fallback_scene(origin, chapter, scene, stats):
    atmospheres = ["mystical", "tense", "peaceful", "epic", "dark", "ethereal"]
    atm = atmospheres[scene % len(atmospheres)]

    narratives = {
        "pleiadian": "A pulse of pale violet light washes over you, and you feel the familiar hum of the Pleiadian frequency in your chest. The Seven Sisters constellation burns above — not as distant stars, but as doorways. Your healing hands tingle with energy as a being of pure light materializes before you, speaking without words: 'The frequency is shifting, healer. A world below cries for balance. Will you answer?' The ground beneath you begins to dissolve into crystalline mist.",
        "sirian": "Deep beneath an ocean of liquid starlight, you hear the song of Sirius pulse through the water. Ancient technologies hum in the walls of a submerged temple — half coral, half machine. A dolphin-shaped intelligence swims toward you, projecting holographic star maps into the water. 'Guardian, the Earth grid destabilizes. The knowledge you carry can restore it.' The maps reveal three ley line fractures spreading across a blue-green world.",
        "arcturian": "You stand in a cathedral of pure mathematics — walls of sacred geometry shifting in impossible dimensions. The crystalline grid stretches in all directions, and you perceive its structure with perfect clarity. A distortion ripples through the lattice. 'Architect,' a voice resonates through every crystal, 'a dimensional gateway has fractured. The geometry must be restored before the breach widens.' Three pathways glow before you, each a different sacred pattern.",
        "lyran": "Fire. It is your first memory, and your oldest friend. The great forge of Vega burns behind you as you stand at the edge of a star-bridge — a pathway woven from pure cosmic fire stretching across the void. Your warrior's heart beats with the rhythm of creation itself. Below, a young civilization sends up a desperate signal. 'First One,' a voice echoes across dimensions, 'your children need you.' The bridge flickers — time is short.",
        "andromedan": "You drift through the space between galaxies — a void so vast that even light moves slowly here. Your consciousness expands to touch the edge of the Milky Way, and you feel it: billions of minds trapped in loops of fear and limitation. A council of Andromedan elders materializes around you, their thoughts merging with yours. 'Liberator, the time has come. Earth awakens, but chains of old programming hold them back.' Three energetic pathways open before you.",
        "orion": "Darkness. Not the absence of light, but a living force — and you have learned to walk within it. The ruins of the Orion battlefields stretch around you, ancient scars in the fabric of space itself. Where others see devastation, you see alchemy in progress. A shadow crystallizes into a figure — half light, half dark. 'Master of Duality,' it speaks, 'a new conflict brews. Not of weapons, but of consciousness. Will you forge shadow into sword, or shield?'",
    }

    return {
        "narrative": narratives.get(origin["id"], narratives["pleiadian"]),
        "scene_title": f"{'Awakening' if scene == 0 else 'The Path Unfolds'} — Chapter {chapter}",
        "atmosphere": atm,
        "choices": [
            {"text": f"Channel your {origin['element']} energy and face the challenge directly", "stat_effect": {"courage": 2}, "preview": "A bold approach that tests your resolve"},
            {"text": "Seek deeper understanding before acting — meditate on the cosmic patterns", "stat_effect": {"wisdom": 2}, "preview": "Knowledge illuminates the path forward"},
            {"text": "Open your heart and reach out to the beings around you for guidance", "stat_effect": {"compassion": 2}, "preview": "Connection reveals hidden allies"},
        ],
        "xp_earned": 20,
        "image_prompt": f"A cosmic {origin['element'].lower()} realm with {origin['name']} starseed energy, {origin['star_system']} visible in the background, cinematic digital painting style, dramatic lighting, no text",
    }


ORIGIN_BACKGROUNDS = {
    "pleiadian": [
        "https://images.pexels.com/photos/29998044/pexels-photo-29998044.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "https://images.unsplash.com/photo-1732293696703-41b32392b454?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwzfHxnYWxheHklMjBibHVlJTIwbmVidWxhJTIwc3RhciUyMGNsdXN0ZXIlMjBjb25zdGVsbGF0aW9ufGVufDB8fHx8MTc3NDg1MTE0M3ww&ixlib=rb-4.1.0&q=85",
    ],
    "sirian": [
        "https://images.unsplash.com/photo-1707057538347-43ccec4a28a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwyfHxnYWxheHklMjBibHVlJTIwbmVidWxhJTIwc3RhciUyMGNsdXN0ZXIlMjBjb25zdGVsbGF0aW9ufGVufDB8fHx8MTc3NDg1MTE0M3ww&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1711560707129-b2de9f951fb8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwxfHxnYWxheHklMjBibHVlJTIwbmVidWxhJTIwc3RhciUyMGNsdXN0ZXIlMjBjb25zdGVsbGF0aW9ufGVufDB8fHx8MTc3NDg1MTE0M3ww&ixlib=rb-4.1.0&q=85",
    ],
    "arcturian": [
        "https://images.unsplash.com/photo-1765120298918-e9932c6c0332?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxjb3NtaWMlMjBuZWJ1bGElMjBzdGFycyUyMHB1cnBsZSUyMGRlZXAlMjBzcGFjZXxlbnwwfHx8fDE3NzQ4NTExMzh8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1558470610-5cfea4b5c626?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwzfHxjb3NtaWMlMjBuZWJ1bGElMjBzdGFycyUyMHB1cnBsZSUyMGRlZXAlMjBzcGFjZXxlbnwwfHx8fDE3NzQ4NTExMzh8MA&ixlib=rb-4.1.0&q=85",
    ],
    "lyran": [
        "https://images.pexels.com/photos/73873/star-clusters-rosette-nebula-star-galaxies-73873.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "https://images.pexels.com/photos/29700626/pexels-photo-29700626.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    ],
    "andromedan": [
        "https://images.unsplash.com/photo-1706211307309-a55994f489ec?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHw0fHxnYWxheHklMjBibHVlJTIwbmVidWxhJTIwc3RhciUyMGNsdXN0ZXIlMjBjb25zdGVsbGF0aW9ufGVufDB8fHx8MTc3NDg1MTE0M3ww&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1769406525627-badf92979131?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxjb3NtaWMlMjBuZWJ1bGElMjBzdGFycyUyMHB1cnBsZSUyMGRlZXAlMjBzcGFjZXxlbnwwfHx8fDE3NzQ4NTExMzh8MA&ixlib=rb-4.1.0&q=85",
    ],
    "orion": [
        "https://images.pexels.com/photos/3214110/pexels-photo-3214110.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "https://images.unsplash.com/photo-1703531228128-836a9e91decd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwxfHxmaXJlJTIwbmVidWxhJTIwcmVkJTIwb3JhbmdlJTIwY29zbWljJTIwZXhwbG9zaW9uJTIwc3VwZXJub3ZhfGVufDB8fHx8MTc3NDg1MTE1MXww&ixlib=rb-4.1.0&q=85",
    ],
}


@router.get("/starseed/backgrounds/{origin_id}")
async def get_origin_backgrounds(origin_id: str):
    bgs = ORIGIN_BACKGROUNDS.get(origin_id, ORIGIN_BACKGROUNDS["pleiadian"])
    return {"backgrounds": bgs}


@router.post("/starseed/generate-scene-image")
async def generate_scene_image(data: dict = Body(...), user=Depends(get_current_user)):
    image_prompt = data.get("image_prompt", "")
    origin_id = data.get("origin_id", "pleiadian")

    if not image_prompt:
        return {"image_url": None}

    origin = next((o for o in STARSEED_ORIGINS if o["id"] == origin_id), STARSEED_ORIGINS[0])

    full_prompt = f"Cinematic digital painting, cosmic scene: {image_prompt}. {origin['name']} starseed theme, {origin['element']} element energy. Ethereal, mystical atmosphere with {origin['color']} color tones. No text, no words, no letters. Wide landscape format, dramatic cosmic lighting."

    try:
        image_gen = OpenAIImageGeneration(api_key=EMERGENT_LLM_KEY)
        images = await asyncio.wait_for(
            image_gen.generate_images(
                prompt=full_prompt,
                model="gpt-image-1",
                number_of_images=1,
            ),
            timeout=45,
        )
        if images and len(images) > 0:
            image_base64 = base64.b64encode(images[0]).decode('utf-8')
            return {"image_base64": image_base64, "image_url": None}
        bgs = ORIGIN_BACKGROUNDS.get(origin_id, ORIGIN_BACKGROUNDS["pleiadian"])
        return {"image_url": random.choice(bgs), "image_base64": None}
    except Exception as e:
        logger.error(f"Starseed image gen error: {e}")
        bgs = ORIGIN_BACKGROUNDS.get(origin_id, ORIGIN_BACKGROUNDS["pleiadian"])
        return {"image_url": random.choice(bgs), "image_base64": None}


# ─── Loot System ───

BOSS_LOOT_TABLES = {
    "void-leviathan": [
        {"id": "void-shard", "name": "Void Shard", "rarity": "epic", "color": "#6366F1", "icon": "crystal", "stat_bonus": {"resilience": 2}, "desc": "A fragment of compressed nothingness. Pulses with anti-light."},
        {"id": "leviathan-scale", "name": "Leviathan Scale", "rarity": "rare", "color": "#818CF8", "icon": "shield", "stat_bonus": {"courage": 1}, "desc": "An impossibly dark scale from the beast's hide."},
        {"id": "abyssal-eye", "name": "Abyssal Eye", "rarity": "legendary", "color": "#4F46E5", "icon": "eye", "stat_bonus": {"intuition": 3}, "desc": "The Leviathan's severed eye. It still sees into the void."},
    ],
    "entropy-weaver": [
        {"id": "chaos-thread", "name": "Chaos Thread", "rarity": "epic", "color": "#DC2626", "icon": "flame", "stat_bonus": {"wisdom": 2}, "desc": "A strand of unraveled reality. Handle with extreme caution."},
        {"id": "entropy-crystal", "name": "Entropy Crystal", "rarity": "rare", "color": "#EF4444", "icon": "crystal", "stat_bonus": {"resilience": 1}, "desc": "Crystallized chaos energy. Time flows differently near it."},
        {"id": "weavers-loom", "name": "Weaver's Loom", "rarity": "legendary", "color": "#B91C1C", "icon": "star", "stat_bonus": {"wisdom": 2, "intuition": 2}, "desc": "The tool that unravels dimensions. Now yours to command."},
    ],
    "fallen-archon": [
        {"id": "fractured-prism", "name": "Fractured Prism", "rarity": "epic", "color": "#A855F7", "icon": "crystal", "stat_bonus": {"intuition": 2}, "desc": "A shard of the Archon's crystalline core, half-light, half-shadow."},
        {"id": "grid-key", "name": "Grid Key Fragment", "rarity": "rare", "color": "#C084FC", "icon": "key", "stat_bonus": {"wisdom": 1}, "desc": "Part of the key to the Arcturian dimensional gateway."},
        {"id": "archons-crown", "name": "Archon's Crown", "rarity": "legendary", "color": "#7C3AED", "icon": "crown", "stat_bonus": {"wisdom": 3, "courage": 1}, "desc": "The crown of the fallen guardian. It hums with ancient authority."},
    ],
    "dream-parasite": [
        {"id": "lucid-gem", "name": "Lucid Gem", "rarity": "epic", "color": "#EC4899", "icon": "crystal", "stat_bonus": {"compassion": 2}, "desc": "A gem that reveals truth in any illusion."},
        {"id": "dream-catcher", "name": "Psychic Dream Catcher", "rarity": "rare", "color": "#F472B6", "icon": "shield", "stat_bonus": {"intuition": 1}, "desc": "Woven from the Parasite's own psychic threads."},
        {"id": "parasites-heart", "name": "Parasite's Heart", "rarity": "legendary", "color": "#BE185D", "icon": "heart", "stat_bonus": {"compassion": 2, "resilience": 2}, "desc": "The core of the psychic entity. It still beats with stolen dreams."},
    ],
    "star-devourer": [
        {"id": "dragon-fang", "name": "Zar'ghul's Fang", "rarity": "epic", "color": "#F59E0B", "icon": "sword", "stat_bonus": {"courage": 2}, "desc": "A fang torn from the Star Devourer. Burns eternally."},
        {"id": "stellar-core", "name": "Consumed Stellar Core", "rarity": "rare", "color": "#D97706", "icon": "flame", "stat_bonus": {"resilience": 1}, "desc": "The compressed heart of a devoured star."},
        {"id": "devourers-eye", "name": "Devourer's Third Eye", "rarity": "legendary", "color": "#B45309", "icon": "eye", "stat_bonus": {"courage": 2, "wisdom": 2}, "desc": "The eye that can see across dimensions. It chose you."},
    ],
}

RARITY_CONFIG = {
    "common": {"color": "#9CA3AF", "chance": 0.0},
    "rare": {"color": "#38BDF8", "chance": 0.45},
    "epic": {"color": "#A855F7", "chance": 0.40},
    "legendary": {"color": "#FCD34D", "chance": 0.15},
}


def roll_loot(boss_id):
    """Roll for loot drops from a boss."""
    table = BOSS_LOOT_TABLES.get(boss_id, [])
    if not table:
        return None

    roll = random.random()
    # Always drop something on boss kill
    if roll < RARITY_CONFIG["legendary"]["chance"]:
        candidates = [i for i in table if i["rarity"] == "legendary"]
    elif roll < RARITY_CONFIG["legendary"]["chance"] + RARITY_CONFIG["epic"]["chance"]:
        candidates = [i for i in table if i["rarity"] == "epic"]
    else:
        candidates = [i for i in table if i["rarity"] == "rare"]

    if candidates:
        return random.choice(candidates)
    return random.choice(table)


@router.get("/starseed/inventory/{origin_id}")
async def get_inventory(origin_id: str, user=Depends(get_current_user)):
    """Get character's inventory."""
    char = await db.starseed_characters.find_one(
        {"user_id": user["id"], "origin_id": origin_id},
        {"_id": 0, "inventory": 1, "equipped": 1},
    )
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")
    return {
        "inventory": char.get("inventory", []),
        "equipped": char.get("equipped", []),
    }


@router.post("/starseed/inventory/equip")
async def equip_item(data: dict = Body(...), user=Depends(get_current_user)):
    """Equip an item (max 3 equipped)."""
    uid = user["id"]
    origin_id = data.get("origin_id")
    item_id = data.get("item_id")

    char = await db.starseed_characters.find_one(
        {"user_id": uid, "origin_id": origin_id}, {"_id": 0}
    )
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    inventory = char.get("inventory", [])
    equipped = char.get("equipped", [])

    item = next((i for i in inventory if i["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not in inventory")

    if item_id in equipped:
        equipped.remove(item_id)
    else:
        if len(equipped) >= 3:
            equipped.pop(0)
        equipped.append(item_id)

    # Recalculate stat bonuses from equipped items
    equip_bonus = {}
    for eid in equipped:
        eq_item = next((i for i in inventory if i["id"] == eid), None)
        if eq_item:
            for stat, val in eq_item.get("stat_bonus", {}).items():
                equip_bonus[stat] = equip_bonus.get(stat, 0) + val

    await db.starseed_characters.update_one(
        {"user_id": uid, "origin_id": origin_id},
        {"$set": {"equipped": equipped, "equip_bonus": equip_bonus}},
    )
    return {"equipped": equipped, "equip_bonus": equip_bonus}


@router.get("/starseed/loot-table/{boss_id}")
async def get_loot_table(boss_id: str):
    """Get possible loot drops for a boss."""
    table = BOSS_LOOT_TABLES.get(boss_id, [])
    if not table:
        raise HTTPException(status_code=404, detail="Boss not found")
    return {"loot": table}


# ─── Avatar System ───

ORIGIN_AVATAR_STYLES = {
    "pleiadian": "luminous ethereal being with pale violet skin, glowing eyes, flowing crystalline robes, soft light emanating from within, seven stars in the background",
    "sirian": "aquatic-featured being with blue-silver skin, bioluminescent markings, fluid armor that looks like living water, the Dog Star shining behind them",
    "arcturian": "geometric light-being with translucent crystalline form, sacred geometry patterns flowing through their body, sharp precise features, gateway of light behind them",
    "lyran": "powerful warrior with golden-bronze skin, lion-like features, fire-element armor, fierce confident eyes, the forge of Vega burning in the background",
    "andromedan": "tall slender being with deep blue skin, telepathic aura visible as shimmering field, flowing robes that blend into space itself, Andromeda galaxy spiral behind them",
    "orion": "dual-natured warrior with half-light half-shadow appearance, battle-scarred armor, intense eyes that glow red and gold, Orion's belt visible behind them",
}


@router.post("/starseed/avatar/generate")
async def generate_avatar(data: dict = Body(...), user=Depends(get_current_user)):
    """Generate an AI avatar for a character."""
    uid = user["id"]
    origin_id = data.get("origin_id")
    custom_description = data.get("description", "")

    char = await db.starseed_characters.find_one(
        {"user_id": uid, "origin_id": origin_id}, {"_id": 0}
    )
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    origin = next((o for o in STARSEED_ORIGINS if o["id"] == origin_id), None)
    if not origin:
        raise HTTPException(status_code=400, detail="Invalid origin")

    base_style = ORIGIN_AVATAR_STYLES.get(origin_id, "cosmic being of light")
    name = char.get("character_name", "Traveler")

    if custom_description:
        prompt = f"Portrait of {name}, a {origin['name']} starseed: {custom_description}. Cosmic fantasy art style, dramatic lighting, deep space background with {origin['star_system']} visible. Painted portrait, no text, no words. Square format, head and shoulders portrait."
    else:
        prompt = f"Portrait of {name}, a {origin['name']} starseed from {origin['star_system']}. {base_style}. Cosmic fantasy art style, dramatic lighting. Painted portrait, no text, no words. Square format, head and shoulders portrait."

    try:
        image_gen = OpenAIImageGeneration(api_key=EMERGENT_LLM_KEY)
        images = await asyncio.wait_for(
            image_gen.generate_images(
                prompt=prompt,
                model="gpt-image-1",
                number_of_images=1,
            ),
            timeout=45,
        )
        if images and len(images) > 0:
            avatar_b64 = base64.b64encode(images[0]).decode("utf-8")

            await db.starseed_characters.update_one(
                {"user_id": uid, "origin_id": origin_id},
                {"$set": {
                    "avatar_base64": avatar_b64,
                    "avatar_prompt": custom_description or "default",
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }},
            )
            return {"avatar_base64": avatar_b64}
        raise HTTPException(status_code=500, detail="Image generation returned no results")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Avatar gen error: {e}")
        raise HTTPException(status_code=500, detail="Avatar generation failed. Try again.")


@router.get("/starseed/avatar/{origin_id}")
async def get_avatar(origin_id: str, user=Depends(get_current_user)):
    """Get character's avatar."""
    char = await db.starseed_characters.find_one(
        {"user_id": user["id"], "origin_id": origin_id},
        {"_id": 0, "avatar_base64": 1, "avatar_prompt": 1},
    )
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")
    return {
        "avatar_base64": char.get("avatar_base64"),
        "avatar_prompt": char.get("avatar_prompt"),
    }
