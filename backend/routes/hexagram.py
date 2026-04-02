from fastapi import APIRouter, Depends
from deps import db, get_current_user, logger
from datetime import datetime, timezone
from routes.sovereign_math import ELEMENTS, element_ode_rhs, rk4_step
import math

router = APIRouter()

TIERS = ["observer", "synthesizer", "archivist", "navigator", "sovereign"]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  I CHING HEXAGRAM STATE-MACHINE
#  64 hexagrams from a 6-bit boolean array:
#    Bit 0: Garden balance ≥ equilibrium threshold
#    Bit 1: Mastery tier ≥ Synthesizer
#    Bit 2: ≥ 3 of 5 elements explored (diversity)
#    Bit 3: ≥ 2 archive categories unlocked
#    Bit 4: Frequency recipe created (Suanpan export)
#    Bit 5: Trade completed in Trade Circle
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HEXAGRAM_NAMES = {
    1: ("乾", "Qian", "The Creative"),
    2: ("坤", "Kun", "The Receptive"),
    3: ("屯", "Zhun", "Difficulty at the Beginning"),
    4: ("蒙", "Meng", "Youthful Folly"),
    5: ("需", "Xu", "Waiting"),
    6: ("讼", "Song", "Conflict"),
    7: ("师", "Shi", "The Army"),
    8: ("比", "Bi", "Holding Together"),
    9: ("小畜", "Xiao Chu", "Small Taming"),
    10: ("履", "Lü", "Treading"),
    11: ("泰", "Tai", "Peace"),
    12: ("否", "Pi", "Standstill"),
    13: ("同人", "Tong Ren", "Fellowship"),
    14: ("大有", "Da You", "Great Possession"),
    15: ("谦", "Qian", "Modesty"),
    16: ("豫", "Yu", "Enthusiasm"),
    17: ("随", "Sui", "Following"),
    18: ("蛊", "Gu", "Work on the Decayed"),
    19: ("临", "Lin", "Approach"),
    20: ("观", "Guan", "Contemplation"),
    21: ("噬嗑", "Shi He", "Biting Through"),
    22: ("贲", "Bi", "Grace"),
    23: ("剥", "Bo", "Splitting Apart"),
    24: ("复", "Fu", "Return"),
    25: ("无妄", "Wu Wang", "Innocence"),
    26: ("大畜", "Da Chu", "Great Taming"),
    27: ("颐", "Yi", "Nourishment"),
    28: ("大过", "Da Guo", "Great Exceeding"),
    29: ("坎", "Kan", "The Abysmal"),
    30: ("离", "Li", "The Clinging"),
    31: ("咸", "Xian", "Influence"),
    32: ("恒", "Heng", "Duration"),
    33: ("遁", "Dun", "Retreat"),
    34: ("大壮", "Da Zhuang", "Great Power"),
    35: ("晋", "Jin", "Progress"),
    36: ("明夷", "Ming Yi", "Darkening of the Light"),
    37: ("家人", "Jia Ren", "The Family"),
    38: ("睽", "Kui", "Opposition"),
    39: ("蹇", "Jian", "Obstruction"),
    40: ("解", "Xie", "Deliverance"),
    41: ("损", "Sun", "Decrease"),
    42: ("益", "Yi", "Increase"),
    43: ("夬", "Guai", "Breakthrough"),
    44: ("姤", "Gou", "Coming to Meet"),
    45: ("萃", "Cui", "Gathering Together"),
    46: ("升", "Sheng", "Pushing Upward"),
    47: ("困", "Kun", "Oppression"),
    48: ("井", "Jing", "The Well"),
    49: ("革", "Ge", "Revolution"),
    50: ("鼎", "Ding", "The Cauldron"),
    51: ("震", "Zhen", "The Arousing"),
    52: ("艮", "Gen", "Keeping Still"),
    53: ("渐", "Jian", "Development"),
    54: ("归妹", "Gui Mei", "The Marrying Maiden"),
    55: ("丰", "Feng", "Abundance"),
    56: ("旅", "Lü", "The Wanderer"),
    57: ("巽", "Xun", "The Gentle"),
    58: ("兑", "Dui", "The Joyous"),
    59: ("涣", "Huan", "Dispersion"),
    60: ("节", "Jie", "Limitation"),
    61: ("中孚", "Zhong Fu", "Inner Truth"),
    62: ("小过", "Xiao Guo", "Small Exceeding"),
    63: ("既济", "Ji Ji", "After Completion"),
    64: ("未济", "Wei Ji", "Before Completion"),
}

# Solfeggio resonance per hexagram (cycle through the 9 sacred frequencies)
SOLFEGGIO = [174, 285, 396, 417, 528, 639, 741, 852, 963]

# Changing line thresholds — how close a condition is to flipping
FLIP_THRESHOLD = 0.15


def compute_hexagram_bits(garden_masses, tier_idx, elements_explored,
                          archives_unlocked, recipes_created, trades_completed,
                          equilibrium_score):
    """Compute the 6-bit state array from system conditions."""
    bits = [0] * 6
    # Bit 0: Garden balance ≥ equilibrium threshold (score ≥ 40)
    bits[0] = 1 if equilibrium_score >= 40 else 0
    # Bit 1: Mastery tier ≥ Synthesizer (index ≥ 1)
    bits[1] = 1 if tier_idx >= 1 else 0
    # Bit 2: ≥ 3 of 5 elements explored
    bits[2] = 1 if elements_explored >= 3 else 0
    # Bit 3: ≥ 2 archive categories unlocked
    bits[3] = 1 if archives_unlocked >= 2 else 0
    # Bit 4: Frequency recipe created
    bits[4] = 1 if recipes_created >= 1 else 0
    # Bit 5: Trade completed
    bits[5] = 1 if trades_completed >= 1 else 0
    return bits


def bits_to_hexagram_number(bits):
    """Convert 6-bit array to hexagram number (1-64)."""
    val = 0
    for i, b in enumerate(bits):
        val |= (b << i)
    return val + 1  # 1-indexed


def compute_changing_lines(equilibrium_score, tier_idx, elements_explored,
                           archives_unlocked, recipes_created, trades_completed):
    """Detect which lines are about to change (near threshold)."""
    changing = []
    # Bit 0: equilibrium near 40 threshold
    if abs(equilibrium_score - 40) < FLIP_THRESHOLD * 100:
        changing.append({
            "line": 0, "label": "Garden Equilibrium",
            "current": equilibrium_score,
            "threshold": 40,
            "direction": "rising" if equilibrium_score < 40 else "falling",
        })
    # Bit 1: tier near synthesizer
    if tier_idx == 0:
        changing.append({
            "line": 1, "label": "Mastery Tier",
            "current": tier_idx,
            "threshold": 1,
            "direction": "rising",
        })
    # Bit 2: elements near 3
    if elements_explored == 2:
        changing.append({
            "line": 2, "label": "Element Diversity",
            "current": elements_explored,
            "threshold": 3,
            "direction": "rising",
        })
    # Bit 3: archives near 2
    if archives_unlocked == 1:
        changing.append({
            "line": 3, "label": "Archive Depth",
            "current": archives_unlocked,
            "threshold": 2,
            "direction": "rising",
        })
    return changing


def hexagram_to_trigrams(number):
    """Split hexagram into upper and lower trigrams."""
    idx = number - 1
    lower = idx & 0x07  # bits 0-2
    upper = (idx >> 3) & 0x07  # bits 3-5
    trigram_names = ["☰ Heaven", "☱ Lake", "☲ Fire", "☳ Thunder",
                     "☴ Wind", "☵ Water", "☶ Mountain", "☷ Earth"]
    return {
        "lower": trigram_names[lower % 8],
        "upper": trigram_names[upper % 8],
    }


@router.get("/hexagram/current")
async def get_current_hexagram(user=Depends(get_current_user)):
    """Compute the current I Ching hexagram from system state."""
    uid = user["id"]

    # Gather system conditions
    tier_doc = await db.mastery_tiers.find_one({"user_id": uid}, {"_id": 0})
    tier_name = tier_doc.get("balance_tier", "observer") if tier_doc else "observer"
    tier_idx = TIERS.index(tier_name) if tier_name in TIERS else 0

    # Garden element masses
    garden = await db.user_garden.find({"user_id": uid}, {"_id": 0}).to_list(24)
    garden_masses = {}
    elements_in_garden = set()
    for g in garden:
        elem = g.get("element", "Earth")
        garden_masses[elem] = garden_masses.get(elem, 0) + g.get("gravity_mass", 60)
        elements_in_garden.add(elem)

    # Compute equilibrium from ODE state
    current_hour = datetime.now(timezone.utc).hour + datetime.now(timezone.utc).minute / 60.0
    initial = [1.0 + garden_masses.get(e, 0) / 100.0 for e in ELEMENTS]
    state_now = list(initial)
    dt_sim = 0.25
    for step in range(int(current_hour * 4)):
        h = (step * dt_sim) % 24
        state_now = rk4_step(state_now, h, dt_sim, garden_masses)

    mean_energy = sum(state_now) / 5.0
    max_dev = max(abs(state_now[i] - mean_energy) for i in range(5))
    # Equilibrium score: 100 when perfectly balanced, 0 when maximally skewed
    equilibrium_score = max(0, 100 - max_dev * 40) if mean_energy > 0 else 0

    # Elements explored (from wheel interactions)
    wheel_doc = await db.wheel_interactions.find_one({"user_id": uid}, {"_id": 0})
    explored_elements = set()
    if wheel_doc:
        for elem in ELEMENTS:
            if wheel_doc.get(f"{elem.lower()}_count", 0) > 0:
                explored_elements.add(elem)
    explored_elements = explored_elements | elements_in_garden
    elements_explored = len(explored_elements)

    # Archives unlocked
    archives_count = await db.archive_progress.count_documents({"user_id": uid})

    # Frequency recipes
    recipes_count = await db.frequency_recipes.count_documents({"user_id": uid})

    # Trade completions
    trades_count = await db.trade_listings.count_documents({
        "$or": [{"seller_id": uid}, {"buyer_id": uid}],
        "status": "completed",
    })

    # Compute hexagram
    bits = compute_hexagram_bits(
        garden_masses, tier_idx, elements_explored,
        archives_count, recipes_count, trades_count,
        equilibrium_score,
    )
    hex_number = bits_to_hexagram_number(bits)
    hex_info = HEXAGRAM_NAMES.get(hex_number, ("?", "Unknown", "Mystery"))
    trigrams = hexagram_to_trigrams(hex_number)

    # Changing lines
    changing = compute_changing_lines(
        equilibrium_score, tier_idx, elements_explored,
        archives_count, recipes_count, trades_count,
    )

    # Stability classification from ODE derivatives
    derivatives = element_ode_rhs(state_now, current_hour, garden_masses)
    total_rate = sum(abs(d) for d in derivatives)
    stability = "stable" if total_rate < 0.1 else "shifting" if total_rate < 0.3 else "volatile"

    # Transition state: if changing lines exist, the hexagram is in transition
    is_transitioning = len(changing) > 0
    # Compute target hexagram if all changing lines flip
    if is_transitioning:
        target_bits = list(bits)
        for cl in changing:
            target_bits[cl["line"]] = 1 - target_bits[cl["line"]]
        target_number = bits_to_hexagram_number(target_bits)
        target_info = HEXAGRAM_NAMES.get(target_number, ("?", "Unknown", "Mystery"))
    else:
        target_number = None
        target_info = None

    # Solfeggio frequency for this hexagram
    solfeggio_hz = SOLFEGGIO[(hex_number - 1) % 9]

    return {
        "hexagram": {
            "number": hex_number,
            "chinese": hex_info[0],
            "pinyin": hex_info[1],
            "name": hex_info[2],
            "bits": bits,
            "trigrams": trigrams,
            "solfeggio_hz": solfeggio_hz,
        },
        "conditions": {
            "equilibrium_score": round(equilibrium_score, 1),
            "tier": tier_name,
            "tier_index": tier_idx,
            "elements_explored": elements_explored,
            "archives_unlocked": archives_count,
            "recipes_created": recipes_count,
            "trades_completed": trades_count,
        },
        "changing_lines": changing,
        "is_transitioning": is_transitioning,
        "target_hexagram": {
            "number": target_number,
            "chinese": target_info[0] if target_info else None,
            "pinyin": target_info[1] if target_info else None,
            "name": target_info[2] if target_info else None,
        } if is_transitioning else None,
        "stability": stability,
        "element_energies": {ELEMENTS[i]: round(state_now[i], 4) for i in range(5)},
    }
