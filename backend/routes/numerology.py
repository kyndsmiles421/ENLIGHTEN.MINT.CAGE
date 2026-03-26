from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()

# ========== NUMEROLOGY ==========

def reduce_to_single(n):
    while n > 9 and n not in (11, 22, 33):
        n = sum(int(d) for d in str(n))
    return n

def date_to_life_path(year, month, day):
    m = reduce_to_single(month)
    d = reduce_to_single(day)
    y = reduce_to_single(year)
    return reduce_to_single(m + d + y)

LETTER_VALUES = {c: (i % 9) + 1 for i, c in enumerate("ABCDEFGHIJKLMNOPQRSTUVWXYZ")}
VOWELS = set("AEIOU")

def name_to_number(name, vowels_only=False, consonants_only=False):
    total = 0
    for ch in name.upper():
        if ch not in LETTER_VALUES:
            continue
        is_vowel = ch in VOWELS
        if vowels_only and not is_vowel:
            continue
        if consonants_only and is_vowel:
            continue
        total += LETTER_VALUES[ch]
    return reduce_to_single(total)

LIFE_PATH_MEANINGS = {
    1: {"title": "The Pioneer", "element": "Fire", "color": "#EF4444",
        "meaning": "You are a natural-born leader with an innate drive toward independence and originality. Your path is about learning to stand on your own, trust your unique vision, and pioneer new territories. You came here to initiate, innovate, and inspire others through courageous action.",
        "strengths": ["Leadership", "Independence", "Creativity", "Determination", "Courage"],
        "challenges": ["Stubbornness", "Isolation", "Impatience", "Ego dominance"],
        "spiritual_lesson": "True leadership is service. Your independence is a gift meant to light the way for others, not to separate you from them."},
    2: {"title": "The Peacemaker", "element": "Water", "color": "#3B82F6",
        "meaning": "You are here to master the art of partnership, diplomacy, and sensitivity. Your soul chose a path of cooperation, balance, and harmony. You perceive subtleties others miss — the unspoken feelings, the energetic undercurrents. This sensitivity is your superpower.",
        "strengths": ["Diplomacy", "Intuition", "Cooperation", "Patience", "Empathy"],
        "challenges": ["Over-sensitivity", "Indecisiveness", "People-pleasing", "Self-doubt"],
        "spiritual_lesson": "Your power lies in your receptivity. The ability to listen deeply and hold space for others is one of the highest spiritual gifts."},
    3: {"title": "The Creative", "element": "Fire", "color": "#FCD34D",
        "meaning": "You are a natural communicator, artist, and joyful expresser of life. Your path is about learning to use your creative gifts — words, art, music, performance — to uplift and inspire. Joy is not frivolous for you; it is your spiritual practice.",
        "strengths": ["Creativity", "Communication", "Optimism", "Charisma", "Inspiration"],
        "challenges": ["Scattered energy", "Superficiality", "Self-doubt about talent", "Emotional volatility"],
        "spiritual_lesson": "Creation is a divine act. When you express authentically, you become a channel for Source energy itself."},
    4: {"title": "The Builder", "element": "Earth", "color": "#22C55E",
        "meaning": "You are here to build lasting foundations — in your life, your work, and your community. Your path values discipline, structure, integrity, and hard work. Where others dream, you manifest. You turn vision into reality through persistent, devoted effort.",
        "strengths": ["Discipline", "Reliability", "Practicality", "Endurance", "Loyalty"],
        "challenges": ["Rigidity", "Workaholism", "Resistance to change", "Control issues"],
        "spiritual_lesson": "True security comes from within, not from external structures. Build your inner foundation first, and everything else follows."},
    5: {"title": "The Freedom Seeker", "element": "Air", "color": "#8B5CF6",
        "meaning": "You are here to experience life in all its variety, adventure, and sensory richness. Your soul craves freedom, change, and new experiences. You learn through direct experience rather than theory. Travel, movement, and exploration are not luxuries for you — they are necessities.",
        "strengths": ["Adaptability", "Adventurousness", "Versatility", "Charisma", "Resourcefulness"],
        "challenges": ["Restlessness", "Excess", "Commitment avoidance", "Impulsiveness"],
        "spiritual_lesson": "True freedom is internal. When you find the still center within, you are free everywhere — even in limitation."},
    6: {"title": "The Nurturer", "element": "Earth", "color": "#EC4899",
        "meaning": "You are here to master unconditional love, responsibility, and service to family and community. Your path centers on home, healing, beauty, and taking care of others. You have a deep sense of duty and an innate understanding of what others need.",
        "strengths": ["Compassion", "Responsibility", "Healing ability", "Artistic sense", "Devotion"],
        "challenges": ["Self-sacrifice", "Control through caring", "Perfectionism", "Martyrdom"],
        "spiritual_lesson": "You cannot pour from an empty cup. Learning to nurture yourself is not selfish — it is the foundation of all genuine service."},
    7: {"title": "The Seeker", "element": "Water", "color": "#6366F1",
        "meaning": "You are here to dive deep into the mysteries of existence — the inner world, spiritual truth, and the nature of consciousness itself. Your path is one of introspection, analysis, and wisdom. You are not satisfied with surface answers; you need to understand the WHY behind everything.",
        "strengths": ["Analytical mind", "Intuition", "Spiritual depth", "Wisdom", "Research ability"],
        "challenges": ["Isolation", "Over-thinking", "Skepticism", "Emotional detachment"],
        "spiritual_lesson": "Knowledge becomes wisdom only when it passes through the heart. Let your brilliant mind serve your compassionate heart."},
    8: {"title": "The Powerhouse", "element": "Earth", "color": "#FB923C",
        "meaning": "You are here to master the material world — abundance, authority, achievement, and the responsible use of power. Your path involves learning that true power is not dominance but the ability to manifest vision and uplift others through material success.",
        "strengths": ["Business acumen", "Leadership", "Manifestation", "Ambition", "Resilience"],
        "challenges": ["Materialism", "Workaholism", "Power struggles", "Burnout"],
        "spiritual_lesson": "Money and power are spiritual tools. When wielded with consciousness, they become vehicles for tremendous good."},
    9: {"title": "The Humanitarian", "element": "Fire", "color": "#F97316",
        "meaning": "You are here to serve humanity on a grand scale. Your soul has completed many cycles and carries ancient wisdom. Your path involves letting go of the personal to embrace the universal — transforming personal pain into compassion for all beings.",
        "strengths": ["Compassion", "Wisdom", "Artistic talent", "Global awareness", "Generosity"],
        "challenges": ["Letting go", "Boundary issues", "Resentment from giving too much", "Nostalgia"],
        "spiritual_lesson": "Completion requires release. The more you let go, the more life flows through you for the benefit of all."},
    11: {"title": "The Illuminator (Master Number)", "element": "Light", "color": "#D8B4FE",
        "meaning": "You carry the energy of spiritual illumination. As a master number, 11 vibrates at a higher frequency than single digits. You are here to be a channel between the spiritual and physical worlds — an intuitive, visionary, and inspirational presence. This path is intense and demanding.",
        "strengths": ["Spiritual insight", "Intuition", "Inspiration", "Visionary thinking", "Charisma"],
        "challenges": ["Nervous tension", "Self-doubt", "Overwhelm from sensitivity", "Anxiety"],
        "spiritual_lesson": "You are a lightning rod for higher consciousness. Ground yourself daily, or the voltage of your own sensitivity will burn you out."},
    22: {"title": "The Master Builder (Master Number)", "element": "Earth/Light", "color": "#D4AF37",
        "meaning": "The most powerful number in numerology. You have the vision of the 11 combined with the practical ability of the 4. You are here to build something that serves humanity on a massive scale — institutions, systems, or works that outlast your lifetime.",
        "strengths": ["Visionary leadership", "Practical mastery", "Large-scale creation", "Discipline", "Inspiration"],
        "challenges": ["Enormous pressure", "Perfectionism", "Feeling overwhelmed by potential", "Self-doubt"],
        "spiritual_lesson": "Your gift is turning divine vision into earthly reality. Trust the process — even the Master Builder lays one brick at a time."},
    33: {"title": "The Master Teacher (Master Number)", "element": "Light", "color": "#C084FC",
        "meaning": "The rarest and highest master number. You are here to uplift humanity through selfless service, healing, and spiritual teaching. Your entire life is your message. You teach not through words alone but through the example of unconditional love in action.",
        "strengths": ["Unconditional love", "Healing presence", "Selfless service", "Spiritual mastery", "Compassion"],
        "challenges": ["Self-sacrifice", "Martyrdom", "Overwhelm from others' suffering", "Neglecting personal needs"],
        "spiritual_lesson": "You embody love itself. Your greatest teaching is your presence — simply being who you are transforms everyone around you."},
}

DESTINY_MEANINGS = {
    1: "Your destiny is to become a leader and innovator. Life will push you toward independence and self-reliance.",
    2: "Your destiny is partnership and diplomacy. You are meant to bring harmony and cooperation wherever you go.",
    3: "Your destiny is creative expression. You are meant to communicate, create, and bring joy to the world.",
    4: "Your destiny is to build lasting structures. You bring order, stability, and practical wisdom.",
    5: "Your destiny is freedom and change. You are meant to experience life fully and teach adaptability.",
    6: "Your destiny is love and service. You are meant to nurture, heal, and create beauty in your community.",
    7: "Your destiny is spiritual wisdom. You are meant to seek truth, develop intuition, and share deep understanding.",
    8: "Your destiny is material mastery. You are meant to achieve, lead, and demonstrate ethical power.",
    9: "Your destiny is humanitarian service. You are meant to give back, let go, and serve the greater good.",
    11: "Your destiny is spiritual illumination. You are a visionary meant to inspire and uplift through higher consciousness.",
    22: "Your destiny is master building. You are meant to create enduring works that serve humanity on a grand scale.",
    33: "Your destiny is master teaching. You are meant to embody unconditional love and heal through your presence.",
}

SOUL_URGE_MEANINGS = {
    1: "Your soul craves independence and originality. Deep down, you want to lead and create something uniquely yours.",
    2: "Your soul craves harmony and connection. Deep down, you want love, partnership, and peaceful coexistence.",
    3: "Your soul craves self-expression and joy. Deep down, you want to create, communicate, and be appreciated.",
    4: "Your soul craves stability and order. Deep down, you want security, structure, and to build something lasting.",
    5: "Your soul craves freedom and adventure. Deep down, you want variety, excitement, and new experiences.",
    6: "Your soul craves love and beauty. Deep down, you want a harmonious home, family, and to be of service.",
    7: "Your soul craves understanding and solitude. Deep down, you want to understand the mysteries of existence.",
    8: "Your soul craves achievement and recognition. Deep down, you want to demonstrate mastery and leave a legacy.",
    9: "Your soul craves universal love. Deep down, you want to serve humanity and make the world a better place.",
    11: "Your soul craves spiritual revelation. Deep down, you long for transcendence and to channel higher wisdom.",
    22: "Your soul craves to manifest the impossible. Deep down, you want to turn divine vision into earthly reality.",
    33: "Your soul craves to heal and teach. Deep down, you want to embody pure love and elevate all beings.",
}

@router.post("/numerology/calculate")
async def calculate_numerology(data: dict = Body(...)):
    name = data.get("name", "").strip()
    birth_date = data.get("birth_date", "")
    if not name or not birth_date:
        raise HTTPException(status_code=400, detail="Name and birth date required")
    try:
        parts = birth_date.split("-")
        year, month, day = int(parts[0]), int(parts[1]), int(parts[2])
    except (ValueError, IndexError):
        raise HTTPException(status_code=400, detail="Invalid date format (YYYY-MM-DD)")

    life_path = date_to_life_path(year, month, day)
    destiny = name_to_number(name)
    soul_urge = name_to_number(name, vowels_only=True)
    personality = name_to_number(name, consonants_only=True)
    birthday_num = reduce_to_single(day)

    lp = LIFE_PATH_MEANINGS.get(life_path, LIFE_PATH_MEANINGS[9])

    return {
        "name": name,
        "birth_date": birth_date,
        "life_path": {
            "number": life_path,
            "title": lp["title"],
            "element": lp["element"],
            "color": lp["color"],
            "meaning": lp["meaning"],
            "strengths": lp["strengths"],
            "challenges": lp["challenges"],
            "spiritual_lesson": lp["spiritual_lesson"],
        },
        "destiny": {
            "number": destiny,
            "meaning": DESTINY_MEANINGS.get(destiny, DESTINY_MEANINGS[9]),
        },
        "soul_urge": {
            "number": soul_urge,
            "meaning": SOUL_URGE_MEANINGS.get(soul_urge, SOUL_URGE_MEANINGS[9]),
        },
        "personality": {
            "number": personality,
            "meaning": f"Your outer personality vibrates at {personality}. This is the mask you show the world — how others perceive you before they know your depths.",
        },
        "birthday": {
            "number": birthday_num,
            "meaning": f"Born on the {day}th, your birthday number {birthday_num} adds a special talent: " + {
                1: "leadership and initiative",
                2: "sensitivity and cooperation",
                3: "creative self-expression",
                4: "practical organization",
                5: "adaptability and freedom-seeking",
                6: "nurturing and responsibility",
                7: "analytical and spiritual depth",
                8: "business and material mastery",
                9: "compassion and global awareness",
            }.get(birthday_num, "unique spiritual gifts") + ".",
        },
    }

@router.post("/numerology/compatibility")
async def numerology_compatibility(data: dict = Body(...)):
    name1 = data.get("name1", "").strip()
    date1 = data.get("date1", "")
    name2 = data.get("name2", "").strip()
    date2 = data.get("date2", "")
    if not all([name1, date1, name2, date2]):
        raise HTTPException(status_code=400, detail="Both names and dates required")
    try:
        p1 = date1.split("-"); lp1 = date_to_life_path(int(p1[0]), int(p1[1]), int(p1[2]))
        p2 = date2.split("-"); lp2 = date_to_life_path(int(p2[0]), int(p2[1]), int(p2[2]))
    except (ValueError, IndexError):
        raise HTTPException(status_code=400, detail="Invalid date format")

    harmony_map = {
        frozenset({1,5}): 92, frozenset({1,3}): 88, frozenset({2,6}): 95, frozenset({2,4}): 85,
        frozenset({3,5}): 90, frozenset({3,9}): 88, frozenset({4,8}): 90, frozenset({4,6}): 85,
        frozenset({5,7}): 80, frozenset({6,9}): 88, frozenset({7,9}): 85, frozenset({1,1}): 70,
        frozenset({2,2}): 80, frozenset({3,3}): 85, frozenset({7,7}): 90, frozenset({8,8}): 75,
    }
    pair = frozenset({lp1, lp2})
    score = harmony_map.get(pair, 50 + abs(hash(pair)) % 40)
    lpm1 = LIFE_PATH_MEANINGS.get(lp1, LIFE_PATH_MEANINGS[9])
    lpm2 = LIFE_PATH_MEANINGS.get(lp2, LIFE_PATH_MEANINGS[9])

    return {
        "person1": {"name": name1, "life_path": lp1, "title": lpm1["title"], "color": lpm1["color"]},
        "person2": {"name": name2, "life_path": lp2, "title": lpm2["title"], "color": lpm2["color"]},
        "harmony_score": min(score, 100),
        "dynamic": f"The {lpm1['title']} ({lp1}) meets the {lpm2['title']} ({lp2}). " + (
            "This is a naturally harmonious pairing with deep understanding." if score >= 85 else
            "This combination brings growth through complementary energies." if score >= 70 else
            "This pairing challenges both to grow beyond comfort zones."
        ),
    }



