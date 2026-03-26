from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()
from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio
import math

# ========== ANIMAL TOTEMS & SPIRIT ANIMALS ==========

ANIMAL_TOTEMS = [
    {"id": "goose", "name": "Snow Goose", "dates": "Dec 22 – Jan 19", "month_start": 12, "day_start": 22, "month_end": 1, "day_end": 19,
     "element": "Earth", "direction": "North", "clan": "Turtle", "color": "#E2E8F0", "stone": "Quartz",
     "plant": "Birch Tree", "complementary": "deer", "challenging": "otter",
     "power": "Determination, ambition, perseverance. The Snow Goose embodies the quest for purpose and accomplishment. You have a deep inner drive that propels you forward through any storm.",
     "shadow": "Obsessiveness, rigidity, workaholism. You may push so hard toward goals that you forget to enjoy the journey.",
     "medicine": "The goose teaches you to find your true direction. Like the V-formation, you understand the power of community and shared purpose. Your medicine is endurance through the darkest winters.",
     "when_appears": "When Snow Goose appears, it's time to set clear intentions and commit fully. A migration is coming — prepare with purpose.",
     "dream_meaning": "Dreaming of geese signals a journey ahead. Flying geese mean your community supports you. Grounded geese suggest you need to reassess your direction."},
    {"id": "otter", "name": "Otter", "dates": "Jan 20 – Feb 18", "month_start": 1, "day_start": 20, "month_end": 2, "day_end": 18,
     "element": "Air", "direction": "North-Northeast", "clan": "Butterfly", "color": "#06B6D4", "stone": "Turquoise",
     "plant": "Aspen Tree", "complementary": "crow", "challenging": "goose",
     "power": "Playfulness, curiosity, unconventional thinking. Otter people see the world differently — your creativity and humor are gifts that heal others.",
     "shadow": "Rebelliousness, emotional detachment, scattered energy. You may resist structure so strongly that you undermine your own goals.",
     "medicine": "Otter medicine is the reminder that joy is a spiritual practice. Play is not frivolous — it reconnects you to source energy. Laughter heals what seriousness cannot.",
     "when_appears": "When Otter shows up, lighten up. You're taking life too seriously. Find the play in your work and the humor in your challenges.",
     "dream_meaning": "Otter in dreams represents the need for fun and social connection. Swimming otters suggest emotional fluidity. Otters at play signal it's time to reconnect with joy."},
    {"id": "wolf", "name": "Wolf", "dates": "Feb 19 – Mar 20", "month_start": 2, "day_start": 19, "month_end": 3, "day_end": 20,
     "element": "Water", "direction": "Northeast", "clan": "Frog", "color": "#8B5CF6", "stone": "Jade",
     "plant": "Plantain", "complementary": "snake", "challenging": "bear",
     "power": "Intuition, deep feeling, psychic sensitivity. Wolf people feel everything intensely and have a powerful connection to the unseen world.",
     "shadow": "Over-sensitivity, victim mentality, escapism. You may retreat into fantasy rather than face harsh realities.",
     "medicine": "Wolf medicine is about trusting your instincts. The lone wolf howls not from loneliness but to call the pack. You teach others to honor their intuition and emotions.",
     "when_appears": "When Wolf appears, pay attention to your dreams and hunches. Your intuition is trying to tell you something important. Trust the inner knowing.",
     "dream_meaning": "Wolf in dreams represents your wild, instinctual nature. A lone wolf means you need solitude. A wolf pack signals loyalty and family bonds."},
    {"id": "hawk", "name": "Red Hawk", "dates": "Mar 21 – Apr 19", "month_start": 3, "day_start": 21, "month_end": 4, "day_end": 19,
     "element": "Fire", "direction": "East", "clan": "Thunderbird", "color": "#EF4444", "stone": "Fire Opal",
     "plant": "Dandelion", "complementary": "falcon", "challenging": "owl",
     "power": "Vision, leadership, initiative. Red Hawk people are natural pioneers who see opportunities others miss. Your fierce energy inspires action.",
     "shadow": "Impatience, aggression, selfishness. Your fire can burn others if not tempered with compassion.",
     "medicine": "Hawk medicine is the gift of perspective. Soaring above the details, you see the bigger picture. You teach others to rise above petty concerns and see with spiritual eyes.",
     "when_appears": "When Hawk appears, expand your vision. Look at your situation from a higher perspective. A message from spirit is coming — watch for signs.",
     "dream_meaning": "Hawk in dreams represents clarity and spiritual messages. A soaring hawk means freedom and expanded awareness. A hawk hunting signals it's time to act decisively."},
    {"id": "beaver", "name": "Beaver", "dates": "Apr 20 – May 20", "month_start": 4, "day_start": 20, "month_end": 5, "day_end": 20,
     "element": "Earth", "direction": "East-Southeast", "clan": "Turtle", "color": "#22C55E", "stone": "Chrysocolla",
     "plant": "Wild Clover", "complementary": "woodpecker", "challenging": "goose",
     "power": "Persistence, craftsmanship, resourcefulness. Beaver people are master builders who turn dreams into reality through patient, steady work.",
     "shadow": "Stubbornness, possessiveness, resistance to change. You may cling to your constructions even when they no longer serve you.",
     "medicine": "Beaver teaches that the dream must be built, not just imagined. Your ability to create structure from chaos is sacred. Every dam you build changes the entire landscape.",
     "when_appears": "When Beaver appears, it's time to build. Stop planning and start doing. Your persistent effort will transform your environment.",
     "dream_meaning": "Beaver in dreams represents industry and creation. Building a dam means you're creating emotional boundaries. A beaver's lodge signals the need for a secure home base."},
    {"id": "deer", "name": "Deer", "dates": "May 21 – Jun 20", "month_start": 5, "day_start": 21, "month_end": 6, "day_end": 20,
     "element": "Air", "direction": "Southeast", "clan": "Butterfly", "color": "#FDA4AF", "stone": "Agate",
     "plant": "Mullein", "complementary": "goose", "challenging": "bear",
     "power": "Grace, sensitivity, gentleness of spirit. Deer people move through life with an elegance that touches everyone around them. Your sensitivity is a form of intelligence.",
     "shadow": "Moodiness, inconsistency, superficiality. You may flit from experience to experience without going deep.",
     "medicine": "Deer medicine is the power of gentleness. True strength doesn't need to be aggressive. Your gentle presence heals the wounded and softens the hard-hearted.",
     "when_appears": "When Deer appears, approach your situation with gentleness rather than force. Be tender with yourself and others. Grace will accomplish what aggression cannot.",
     "dream_meaning": "Deer in dreams represent gentleness and natural beauty. A fawn signals innocence and new beginnings. A stag represents masculine grace and spiritual authority."},
    {"id": "woodpecker", "name": "Woodpecker", "dates": "Jun 21 – Jul 21", "month_start": 6, "day_start": 21, "month_end": 7, "day_end": 21,
     "element": "Water", "direction": "South", "clan": "Frog", "color": "#FB923C", "stone": "Carnelian",
     "plant": "Wild Rose", "complementary": "beaver", "challenging": "snake",
     "power": "Nurturing, devotion, rhythm. Woodpecker people are the heart of any community — deeply loyal, emotionally generous, and attuned to the rhythms of life.",
     "shadow": "Codependency, jealousy, emotional manipulation. Your deep need to be needed can become a trap.",
     "medicine": "Woodpecker teaches persistent devotion. Each tap is a heartbeat — steady, rhythmic, purposeful. You teach others the power of showing up consistently with love.",
     "when_appears": "When Woodpecker appears, listen for the rhythm beneath the noise. Something needs your persistent, loving attention. Keep tapping — you'll break through.",
     "dream_meaning": "Woodpecker in dreams signals persistence paying off. Hearing the tapping means a message is trying to reach you. A woodpecker on a tree means dig deeper into a situation."},
    {"id": "salmon", "name": "Salmon", "dates": "Jul 22 – Aug 21", "month_start": 7, "day_start": 22, "month_end": 8, "day_end": 21,
     "element": "Fire", "direction": "South-Southwest", "clan": "Thunderbird", "color": "#FCD34D", "stone": "Garnet",
     "plant": "Raspberry", "complementary": "owl", "challenging": "otter",
     "power": "Determination, creativity, confidence. Salmon people are born leaders who swim against the current with grace and power. Your creative energy is magnetic.",
     "shadow": "Ego, drama, need for attention. Your desire to be seen can overshadow your deeper gifts.",
     "medicine": "Salmon teaches the power of returning to source. No matter how far you swim, your instinct always knows the way home. Your creative fire lights the path for others.",
     "when_appears": "When Salmon appears, trust your instincts about where you need to go, even if it's upstream. Your inner compass is accurate. Express yourself boldly.",
     "dream_meaning": "Salmon in dreams represent the journey home — returning to your origins or true self. Swimming upstream signals courage to go against the crowd."},
    {"id": "bear", "name": "Brown Bear", "dates": "Aug 22 – Sep 21", "month_start": 8, "day_start": 22, "month_end": 9, "day_end": 21,
     "element": "Earth", "direction": "Southwest", "clan": "Turtle", "color": "#92400E", "stone": "Amethyst",
     "plant": "Violet", "complementary": "wolf", "challenging": "deer",
     "power": "Practicality, analysis, introspection. Bear people have a keen analytical mind and a deep need for periodic solitude. Your ability to hibernate and emerge transformed is your superpower.",
     "shadow": "Criticism, perfectionism, withdrawal. You may retreat into your cave and refuse to come out, or critique others from a place of fear.",
     "medicine": "Bear teaches the sacred art of going within. Hibernation is not hiding — it's incubation. Every great creation requires a period of quiet gestation. Trust the dark.",
     "when_appears": "When Bear appears, it's time for introspection. Go inward before acting outward. Analyze the situation carefully, then emerge with clarity and power.",
     "dream_meaning": "Bear in dreams represents introspection and healing. A hibernating bear means you need rest. A mother bear signals fierce protection of what you love."},
    {"id": "crow", "name": "Crow", "dates": "Sep 22 – Oct 22", "month_start": 9, "day_start": 22, "month_end": 10, "day_end": 22,
     "element": "Air", "direction": "West", "clan": "Butterfly", "color": "#1E1B4B", "stone": "Jasper",
     "plant": "Ivy", "complementary": "otter", "challenging": "hawk",
     "power": "Justice, balance, diplomacy. Crow people are natural mediators who see both sides of every situation. Your gift is bringing harmony where there is conflict.",
     "shadow": "Indecision, people-pleasing, avoiding confrontation. Your desire for balance may prevent you from taking necessary stands.",
     "medicine": "Crow medicine is the ability to walk between worlds — light and dark, past and future, seen and unseen. You are a bridge between opposites, teaching others that duality is an illusion.",
     "when_appears": "When Crow appears, look for the balance point in your situation. Both sides have truth. Your job is not to choose but to integrate.",
     "dream_meaning": "Crow in dreams signals magic and transformation. A talking crow carries a message from the spirit world. A murder of crows means major life changes are coming."},
    {"id": "snake", "name": "Snake", "dates": "Oct 23 – Nov 21", "month_start": 10, "day_start": 23, "month_end": 11, "day_end": 21,
     "element": "Water", "direction": "Northwest", "clan": "Frog", "color": "#7C3AED", "stone": "Malachite",
     "plant": "Thistle", "complementary": "wolf", "challenging": "woodpecker",
     "power": "Transformation, mystery, healing. Snake people undergo more transformations in one lifetime than most experience in several. Your depth is both your gift and your intensity.",
     "shadow": "Jealousy, secrecy, manipulation. Your powerful emotional energy can become toxic if not channeled consciously.",
     "medicine": "Snake teaches that you must shed your old skin to grow. Every death is a rebirth. Your ability to transform poison into medicine — personal pain into healing wisdom — is sacred.",
     "when_appears": "When Snake appears, a major transformation is underway. Something must die for something new to be born. Trust the shedding process, even when it's uncomfortable.",
     "dream_meaning": "Snake in dreams represents transformation, healing, and kundalini energy. A shedding snake means releasing old patterns. A coiled snake signals dormant power ready to awaken."},
    {"id": "owl", "name": "Owl", "dates": "Nov 22 – Dec 21", "month_start": 11, "day_start": 22, "month_end": 12, "day_end": 21,
     "element": "Fire", "direction": "North-Northwest", "clan": "Thunderbird", "color": "#D4AF37", "stone": "Obsidian",
     "plant": "Mistletoe", "complementary": "salmon", "challenging": "hawk",
     "power": "Wisdom, truth-seeking, adventurous spirit. Owl people are natural truth-seekers who refuse to accept surface-level answers. Your quest for meaning takes you to the edges of knowledge.",
     "shadow": "Bluntness, restlessness, know-it-all tendencies. Your love of truth can become a weapon if wielded without compassion.",
     "medicine": "Owl teaches you to see in the dark. Where others are blinded by illusion, you perceive the hidden truth. Your wisdom comes not from books but from direct experience of life's mysteries.",
     "when_appears": "When Owl appears, look beyond the obvious. The truth of your situation is hidden — use your night vision. Someone may not be who they appear to be.",
     "dream_meaning": "Owl in dreams represents hidden wisdom and seeing through deception. A hooting owl carries a warning. An owl in flight means spiritual messages are coming through."},
]

SPIRIT_ANIMALS_EXTRA = [
    {"id": "eagle", "name": "Eagle", "element": "Air", "color": "#FCD34D",
     "power": "Divine connection, courage, spiritual authority. Eagle carries prayers to the Creator and brings back vision.",
     "medicine": "Eagle medicine is the ability to see from the highest vantage point while remaining connected to earth. You are called to lead with spirit.",
     "when_appears": "When Eagle appears, rise above your current situation. Connect with the divine perspective. Your prayers are being heard.",
     "dream_meaning": "Eagle in dreams means spiritual awakening, freedom, and divine messages arriving."},
    {"id": "butterfly", "name": "Butterfly", "element": "Air", "color": "#EC4899",
     "power": "Transformation, rebirth, lightness of being. Butterfly represents the soul's journey through stages of growth.",
     "medicine": "Butterfly teaches that transformation is not an event but a process. Honor every stage — egg, caterpillar, cocoon, flight.",
     "when_appears": "When Butterfly appears, trust your transformation. The cocoon stage feels like death, but wings are forming in the darkness.",
     "dream_meaning": "Butterfly in dreams signals personal transformation, joy, and the soul's freedom."},
    {"id": "turtle", "name": "Turtle", "element": "Earth", "color": "#22C55E",
     "power": "Grounding, ancient wisdom, Mother Earth connection. Turtle carries the world on its back with patience and grace.",
     "medicine": "Turtle teaches that slow and steady wins the race. Your home is within you. Withdraw when needed, advance when ready.",
     "when_appears": "When Turtle appears, slow down. You're moving too fast. Ground yourself and connect with the earth beneath your feet.",
     "dream_meaning": "Turtle in dreams represents protection, patience, and being grounded in wisdom."},
    {"id": "hummingbird", "name": "Hummingbird", "element": "Fire", "color": "#FB923C",
     "power": "Joy, adaptability, resilience. Despite its tiny size, Hummingbird migrates thousands of miles — embodying the impossible.",
     "medicine": "Hummingbird teaches that sweetness is everywhere if you know where to look. Sip the nectar of each moment.",
     "when_appears": "When Hummingbird appears, seek the sweet spot in your life. Joy is available right now, even in difficulty.",
     "dream_meaning": "Hummingbird in dreams means joy is coming, or you need to find joy in small things."},
    {"id": "dragonfly", "name": "Dragonfly", "element": "Water", "color": "#06B6D4",
     "power": "Illusion, change, self-realization. Dragonfly lives most of its life underwater before emerging to fly — a symbol of going beyond the surface.",
     "medicine": "Dragonfly teaches you to see through illusions. What appears solid is often just a reflection. Look deeper.",
     "when_appears": "When Dragonfly appears, something in your life is not what it seems. Look past appearances to find the deeper truth.",
     "dream_meaning": "Dragonfly in dreams signals change, adaptability, and seeing through emotional illusions."},
    {"id": "fox", "name": "Fox", "element": "Fire", "color": "#F97316",
     "power": "Cleverness, adaptability, camouflage. Fox navigates complex situations with intelligence and grace.",
     "medicine": "Fox teaches the art of invisibility — sometimes the wisest action is to observe unseen before acting.",
     "when_appears": "When Fox appears, be strategic. Use intelligence rather than force. Observe before you act.",
     "dream_meaning": "Fox in dreams represents cunning, adaptability, and the need for strategic thinking."},
    {"id": "dolphin", "name": "Dolphin", "element": "Water", "color": "#3B82F6",
     "power": "Communication, joy, breath of life. Dolphin bridges the world of water (emotions) and air (intellect).",
     "medicine": "Dolphin teaches that breathing is sacred. Each conscious breath connects you to the rhythm of life. Play and communicate freely.",
     "when_appears": "When Dolphin appears, breathe. Reconnect with your playful nature and communicate from the heart.",
     "dream_meaning": "Dolphin in dreams represents emotional intelligence, communication, and spiritual guidance through water."},
    {"id": "raven", "name": "Raven", "element": "Air", "color": "#374151",
     "power": "Magic, creation, the void. Raven is the keeper of secrets and the bringer of light from the darkness.",
     "medicine": "Raven teaches that magic is real. The void is not empty — it is full of potential. Creation begins in darkness.",
     "when_appears": "When Raven appears, magic is afoot. Pay attention to synchronicities and signs. The impossible is becoming possible.",
     "dream_meaning": "Raven in dreams means hidden knowledge, magic, and messages from the unconscious."},
]

DREAM_SYMBOLS = {
    "water": {"meaning": "Emotions, the unconscious mind, purification. The state of the water reflects your emotional state — calm, turbulent, clear, or murky.", "category": "nature"},
    "flying": {"meaning": "Freedom, transcendence, spiritual elevation. You are rising above limitations and seeing life from a higher perspective.", "category": "action"},
    "falling": {"meaning": "Loss of control, anxiety, letting go. Can also mean surrendering to a deeper process of transformation.", "category": "action"},
    "teeth": {"meaning": "Power, confidence, self-image. Losing teeth represents fear of aging, loss, or feeling powerless in a situation.", "category": "body"},
    "death": {"meaning": "Transformation, endings that lead to new beginnings. Rarely literal — usually signals a major life transition.", "category": "archetype"},
    "snake": {"meaning": "Kundalini energy, transformation, healing, or hidden fears. The context determines whether it's a positive or shadow symbol.", "category": "animal"},
    "house": {"meaning": "The self, the psyche. Different rooms represent different aspects of your personality. The basement is the unconscious.", "category": "place"},
    "forest": {"meaning": "The unconscious mind, the unknown, a spiritual journey. Being lost means you're exploring uncharted inner territory.", "category": "nature"},
    "fire": {"meaning": "Passion, transformation, destruction and rebirth. Fire purifies and illuminates but can also consume.", "category": "nature"},
    "moon": {"meaning": "Intuition, the feminine, cycles, hidden knowledge. The moon phase in your dream adds nuance.", "category": "nature"},
    "sun": {"meaning": "Consciousness, vitality, the masculine, enlightenment. A rising sun means new awareness dawning.", "category": "nature"},
    "baby": {"meaning": "New beginnings, innocence, vulnerability, a new project or aspect of self being born.", "category": "archetype"},
    "mirror": {"meaning": "Self-reflection, truth, confronting your shadow. What you see reflects what you need to acknowledge.", "category": "object"},
    "door": {"meaning": "Opportunity, transition, new possibilities. A closed door means an opportunity you haven't yet recognized.", "category": "object"},
    "bridge": {"meaning": "Transition, connection between two states of being, crossing from old to new.", "category": "place"},
    "mountain": {"meaning": "Obstacles, achievement, spiritual ascent. Climbing means you're working toward a goal. The summit is enlightenment.", "category": "nature"},
    "ocean": {"meaning": "The vast unconscious, universal emotions, infinite potential. The depth of your feelings.", "category": "nature"},
    "bird": {"meaning": "Freedom, spiritual messages, the soul. The type of bird adds specific meaning.", "category": "animal"},
    "tree": {"meaning": "Growth, roots, life force, family. A healthy tree means strong foundations. A dead tree signals something that needs releasing.", "category": "nature"},
    "rain": {"meaning": "Cleansing, renewal, emotional release. Gentle rain is healing; storms represent emotional overwhelm.", "category": "nature"},
    "road": {"meaning": "Your life path, journey, direction. A fork means a decision. A winding road means the path isn't straight but still leads somewhere.", "category": "place"},
    "car": {"meaning": "Your drive through life, control, direction. Who's driving matters — are you in control or a passenger?", "category": "object"},
    "cat": {"meaning": "Independence, intuition, feminine mystery, sensuality. Cats represent the wild, instinctual self.", "category": "animal"},
    "dog": {"meaning": "Loyalty, friendship, unconditional love, protection. Also represents your own faithfulness and devotion.", "category": "animal"},
    "wolf_dream": {"meaning": "Instinct, intelligence, appetite for freedom, the teacher within. The wolf in dreams calls you to trust your wild nature.", "category": "animal"},
    "spider": {"meaning": "Creativity, weaving your destiny, the web of life. Also can represent feeling trapped or manipulated.", "category": "animal"},
    "crystal": {"meaning": "Clarity, healing, spiritual energy, truth becoming visible.", "category": "object"},
    "light": {"meaning": "Awareness, truth, divine presence, hope, enlightenment breaking through darkness.", "category": "nature"},
    "darkness": {"meaning": "The unknown, the unconscious, fears, but also the womb of creation. Light cannot exist without it.", "category": "nature"},
    "child": {"meaning": "Your inner child, innocence, playfulness, or unresolved childhood experiences.", "category": "archetype"},
    "storm": {"meaning": "Emotional turbulence, upheaval, cleansing destruction that makes way for growth.", "category": "nature"},
    "garden": {"meaning": "Growth, cultivation, the fruits of your labor. A neglected garden means neglected aspects of self.", "category": "place"},
    "star": {"meaning": "Hope, guidance, destiny, divine navigation. Following a star means trusting your highest calling.", "category": "nature"},
    "blood": {"meaning": "Life force, passion, sacrifice, family bonds, or wounds that need healing.", "category": "body"},
    "key": {"meaning": "Solution, access, unlocking hidden knowledge or potential.", "category": "object"},
    "cage": {"meaning": "Restriction, self-imposed limitations, feeling trapped. Ask: who built this cage?", "category": "object"},
    "wedding": {"meaning": "Union, integration of opposites within yourself, commitment, sacred merging.", "category": "archetype"},
    "running": {"meaning": "Avoidance, pursuit of goals, or being chased by something you're not facing.", "category": "action"},
    "swimming": {"meaning": "Navigating emotions, going deep into feelings, emotional endurance.", "category": "action"},
    "flower": {"meaning": "Beauty, growth, the unfolding of potential. The type and color of flower adds meaning.", "category": "nature"},
    "ancestor": {"meaning": "Ancestral wisdom, genetic memory, guidance from those who came before.", "category": "archetype"},
}

MOON_PHASES = [
    {"name": "New Moon", "emoji_code": "new", "meaning": "New beginnings, setting intentions, planting seeds", "energy": "inward"},
    {"name": "Waxing Crescent", "emoji_code": "waxing_crescent", "meaning": "Setting intentions into motion, hope, determination", "energy": "building"},
    {"name": "First Quarter", "emoji_code": "first_quarter", "meaning": "Action, decision, overcoming obstacles", "energy": "active"},
    {"name": "Waxing Gibbous", "emoji_code": "waxing_gibbous", "meaning": "Refinement, patience, trust the process", "energy": "building"},
    {"name": "Full Moon", "emoji_code": "full", "meaning": "Illumination, completion, release, heightened intuition", "energy": "peak"},
    {"name": "Waning Gibbous", "emoji_code": "waning_gibbous", "meaning": "Gratitude, sharing wisdom, giving back", "energy": "releasing"},
    {"name": "Last Quarter", "emoji_code": "last_quarter", "meaning": "Release, forgiveness, letting go", "energy": "releasing"},
    {"name": "Waning Crescent", "emoji_code": "waning_crescent", "meaning": "Rest, surrender, reflection before renewal", "energy": "inward"},
]

def get_moon_phase():
    from math import floor
    now = datetime.now(timezone.utc)
    year, month, day = now.year, now.month, now.day
    if month <= 2:
        year -= 1
        month += 12
    a = floor(year / 100)
    b = floor(a / 4)
    c = 2 - a + b
    e = floor(365.25 * (year + 4716))
    f = floor(30.6001 * (month + 1))
    jd = c + day + e + f - 1524.5
    days_since_new = (jd - 2451549.5) % 29.53059
    phase_idx = int((days_since_new / 29.53059) * 8) % 8
    return MOON_PHASES[phase_idx]

def get_birth_totem(month, day):
    for t in ANIMAL_TOTEMS:
        if t["month_start"] > t["month_end"]:
            if (month == t["month_start"] and day >= t["day_start"]) or (month == t["month_end"] and day <= t["day_end"]):
                return t
        else:
            if (month == t["month_start"] and day >= t["day_start"]) or (month == t["month_end"] and day <= t["day_end"]) or (t["month_start"] < month < t["month_end"]):
                return t
    return ANIMAL_TOTEMS[0]

@router.get("/animal-totems/all")
async def get_all_totems():
    totems = [{k: v for k, v in t.items() if k != "dream_meaning"} for t in ANIMAL_TOTEMS]
    extras = SPIRIT_ANIMALS_EXTRA
    return {"birth_totems": totems, "spirit_animals": extras}

@router.get("/animal-totems/birth")
async def get_birth_totem_reading(month: int, day: int):
    if month < 1 or month > 12 or day < 1 or day > 31:
        raise HTTPException(status_code=400, detail="Invalid date")
    totem = get_birth_totem(month, day)
    comp = next((t for t in ANIMAL_TOTEMS if t["id"] == totem["complementary"]), None)
    chal = next((t for t in ANIMAL_TOTEMS if t["id"] == totem["challenging"]), None)
    return {"totem": totem, "complementary": {"id": comp["id"], "name": comp["name"], "color": comp["color"]} if comp else None,
            "challenging": {"id": chal["id"], "name": chal["name"], "color": chal["color"]} if chal else None}

@router.get("/animal-totems/spirit/{animal_id}")
async def get_spirit_animal(animal_id: str):
    animal = next((a for a in ANIMAL_TOTEMS if a["id"] == animal_id), None)
    if not animal:
        animal = next((a for a in SPIRIT_ANIMALS_EXTRA if a["id"] == animal_id), None)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    return {"animal": animal}

@router.get("/dream-symbols")
async def get_dream_symbols():
    return {"symbols": DREAM_SYMBOLS}

@router.post("/dreams")
async def save_dream(data: dict = Body(...), user=Depends(get_current_user)):
    entry = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "title": data.get("title", "Untitled Dream"),
        "content": data.get("content", ""),
        "mood": data.get("mood", "neutral"),
        "vividness": data.get("vividness", 5),
        "lucid": data.get("lucid", False),
        "symbols": data.get("symbols", []),
        "interpretation": data.get("interpretation", ""),
        "moon_phase": get_moon_phase()["name"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.dreams.insert_one(entry)
    entry.pop("_id", None)
    return {"dream": entry}

@router.get("/dreams")
async def get_dreams(user=Depends(get_current_user)):
    dreams = await db.dreams.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"dreams": dreams}

@router.delete("/dreams/{dream_id}")
async def delete_dream(dream_id: str, user=Depends(get_current_user)):
    r = await db.dreams.delete_one({"id": dream_id, "user_id": user["id"]})
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Dream not found")
    return {"status": "deleted"}

@router.post("/dreams/interpret")
async def interpret_dream(data: dict = Body(...), user=Depends(get_current_user)):
    content = data.get("content", "")
    if not content:
        raise HTTPException(status_code=400, detail="Dream content required")
    try:
        chat = LlmChat(api_key=EMERGENT_LLM_KEY, model="gpt-5.2")
        symbols_list = ", ".join(DREAM_SYMBOLS.keys())
        prompt = f"""You are a wise dream interpreter versed in Jungian psychology, shamanic dreamwork, and spiritual symbolism.

Interpret this dream:
"{content}"

Known dream symbols for reference: {symbols_list}

Provide:
1. **Key Symbols** — identify 3-5 major symbols and their meanings
2. **Emotional Theme** — the underlying emotional current
3. **Spiritual Message** — what your higher self is communicating
4. **Shadow Element** — what the dream reveals about your unconscious
5. **Guidance** — a specific, actionable insight for waking life

Be poetic but practical. Keep under 300 words. Write in second person."""
        response = await chat.send_message_async(UserMessage(content=prompt))
        return {"interpretation": response}
    except Exception:
        found = [k for k in DREAM_SYMBOLS if k in content.lower()]
        fallback = "Your dream contains rich symbolism. "
        for s in found[:3]:
            fallback += f"{s.title()}: {DREAM_SYMBOLS[s]['meaning']} "
        if not found:
            fallback += "Reflect on the emotions you felt during the dream — they are the key to its meaning."
        return {"interpretation": fallback, "fallback": True}

@router.get("/moon-phase")
async def current_moon_phase():
    return {"phase": get_moon_phase()}

@router.post("/green-journal")
async def save_green_entry(data: dict = Body(...), user=Depends(get_current_user)):
    entry = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "entry_type": data.get("entry_type", "observation"),
        "title": data.get("title", ""),
        "content": data.get("content", ""),
        "plants": data.get("plants", []),
        "animals_seen": data.get("animals_seen", []),
        "weather": data.get("weather", ""),
        "season": data.get("season", ""),
        "moon_phase": get_moon_phase()["name"],
        "gratitude": data.get("gratitude", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.green_journal.insert_one(entry)
    entry.pop("_id", None)
    return {"entry": entry}

@router.get("/green-journal")
async def get_green_entries(user=Depends(get_current_user)):
    entries = await db.green_journal.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"entries": entries}

@router.delete("/green-journal/{entry_id}")
async def delete_green_entry(entry_id: str, user=Depends(get_current_user)):
    r = await db.green_journal.delete_one({"id": entry_id, "user_id": user["id"]})
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"status": "deleted"}



