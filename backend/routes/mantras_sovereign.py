from fastapi import APIRouter, Depends
from deps import db, get_current_user

router = APIRouter()

TIERS = ["observer", "synthesizer", "archivist", "navigator", "sovereign"]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  EXPANDED MANTRAS & AFFIRMATIONS LIBRARY
#  50+ entries across Ancient Mantras, Phonic Resonances,
#  Positive Affirmations, and Wisdom Prescriptions
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MANTRAS_LIBRARY = [
    # ── Ancient Mantras (meditation tradition) ──
    {"id": "om", "text": "Om", "sanskrit": "ॐ", "category": "ancient_mantra", "tradition": "Vedic", "hz": 136, "tier": "observer", "chakra": "Crown"},
    {"id": "om-mani", "text": "Om Mani Padme Hum", "sanskrit": "ॐ मणि पद्मे हूँ", "category": "ancient_mantra", "tradition": "Buddhist", "hz": 528, "tier": "observer", "chakra": "Heart"},
    {"id": "gayatri", "text": "Om Bhur Bhuva Swaha", "sanskrit": "ॐ भूर्भुवः स्वः", "category": "ancient_mantra", "tradition": "Vedic", "hz": 396, "tier": "synthesizer", "chakra": "Solar Plexus"},
    {"id": "so-ham", "text": "So Ham", "sanskrit": "सो ऽहम्", "category": "ancient_mantra", "tradition": "Vedic", "hz": 639, "tier": "observer", "chakra": "Throat"},
    {"id": "om-namah", "text": "Om Namah Shivaya", "sanskrit": "ॐ नमः शिवाय", "category": "ancient_mantra", "tradition": "Hindu", "hz": 417, "tier": "synthesizer", "chakra": "Third Eye"},
    {"id": "gate-gate", "text": "Gate Gate Paragate Parasamgate Bodhi Svaha", "sanskrit": "गते गते पारगते", "category": "ancient_mantra", "tradition": "Buddhist", "hz": 741, "tier": "archivist", "chakra": "Crown"},
    {"id": "lokah", "text": "Lokah Samastah Sukhino Bhavantu", "sanskrit": "लोकाः समस्ताः सुखिनो भवन्तु", "category": "ancient_mantra", "tradition": "Vedic", "hz": 852, "tier": "synthesizer", "chakra": "Heart"},
    {"id": "sat-nam", "text": "Sat Nam", "sanskrit": "सत् नाम", "category": "ancient_mantra", "tradition": "Sikh", "hz": 963, "tier": "observer", "chakra": "Root"},
    {"id": "ra-ma", "text": "Ra Ma Da Sa Sa Say So Hung", "sanskrit": "रा मा दा सा", "category": "ancient_mantra", "tradition": "Kundalini", "hz": 528, "tier": "archivist", "chakra": "All"},
    {"id": "ham-sa", "text": "Ham Sa", "sanskrit": "हंस", "category": "ancient_mantra", "tradition": "Vedic", "hz": 285, "tier": "observer", "chakra": "Breath"},

    # ── Phonic Resonances (frequency-based) ──
    {"id": "ph-174", "text": "Foundation Tone", "category": "phonic_resonance", "hz": 174, "tier": "observer", "desc": "Pain reduction, security foundation"},
    {"id": "ph-285", "text": "Quantum Field", "category": "phonic_resonance", "hz": 285, "tier": "observer", "desc": "Tissue regeneration, energy field repair"},
    {"id": "ph-396", "text": "Liberation", "category": "phonic_resonance", "hz": 396, "tier": "observer", "desc": "Release guilt and fear"},
    {"id": "ph-417", "text": "Transmutation", "category": "phonic_resonance", "hz": 417, "tier": "synthesizer", "desc": "Facilitate change, undo situations"},
    {"id": "ph-528", "text": "Miracle Tone", "category": "phonic_resonance", "hz": 528, "tier": "observer", "desc": "DNA repair, transformation"},
    {"id": "ph-639", "text": "Connection", "category": "phonic_resonance", "hz": 639, "tier": "synthesizer", "desc": "Harmonizing relationships"},
    {"id": "ph-741", "text": "Awakening", "category": "phonic_resonance", "hz": 741, "tier": "archivist", "desc": "Intuition activation, problem solving"},
    {"id": "ph-852", "text": "Spiritual Order", "category": "phonic_resonance", "hz": 852, "tier": "archivist", "desc": "Return to spiritual order"},
    {"id": "ph-963", "text": "Divine Connection", "category": "phonic_resonance", "hz": 963, "tier": "navigator", "desc": "Pineal gland activation, unity consciousness"},
    {"id": "ph-1074", "text": "Celestial Gate", "category": "phonic_resonance", "hz": 1074, "tier": "sovereign", "desc": "Transcendence frequency"},

    # ── Positive Affirmations (spoken word) ──
    {"id": "aff-01", "text": "I am aligned with the energy of abundance", "category": "affirmation", "element": "Earth", "tier": "observer"},
    {"id": "aff-02", "text": "My body is a vessel of healing light", "category": "affirmation", "element": "Fire", "tier": "observer"},
    {"id": "aff-03", "text": "I flow with the rhythm of the cosmos", "category": "affirmation", "element": "Water", "tier": "observer"},
    {"id": "aff-04", "text": "I am rooted in strength and clarity", "category": "affirmation", "element": "Wood", "tier": "observer"},
    {"id": "aff-05", "text": "I release what no longer serves my highest self", "category": "affirmation", "element": "Metal", "tier": "observer"},
    {"id": "aff-06", "text": "Every breath deepens my connection to source", "category": "affirmation", "element": "Wood", "tier": "synthesizer"},
    {"id": "aff-07", "text": "I transform challenges into wisdom", "category": "affirmation", "element": "Fire", "tier": "synthesizer"},
    {"id": "aff-08", "text": "My energy field radiates peace and protection", "category": "affirmation", "element": "Metal", "tier": "synthesizer"},
    {"id": "aff-09", "text": "I am the observer and the observed", "category": "affirmation", "element": "Water", "tier": "archivist"},
    {"id": "aff-10", "text": "The universe conspires in my favor", "category": "affirmation", "element": "Earth", "tier": "archivist"},
    {"id": "aff-11", "text": "I embody the stillness between heartbeats", "category": "affirmation", "element": "Water", "tier": "archivist"},
    {"id": "aff-12", "text": "My resonance shifts reality", "category": "affirmation", "element": "Fire", "tier": "navigator"},
    {"id": "aff-13", "text": "I am the architect of my cosmic destiny", "category": "affirmation", "element": "Wood", "tier": "navigator"},
    {"id": "aff-14", "text": "Through me, ancient wisdom flows into the present", "category": "affirmation", "element": "Earth", "tier": "navigator"},
    {"id": "aff-15", "text": "I have transcended the illusion of separation", "category": "affirmation", "element": "Metal", "tier": "sovereign"},

    # ── Wisdom Prescriptions (hexagram-linked) ──
    {"id": "wp-creative", "text": "The Creative force moves through you. Act with bold initiative.", "category": "wisdom_prescription", "hexagram_range": [1, 8], "tier": "synthesizer"},
    {"id": "wp-receptive", "text": "Yield to the natural flow. Strength lies in receptivity.", "category": "wisdom_prescription", "hexagram_range": [9, 16], "tier": "synthesizer"},
    {"id": "wp-thunder", "text": "Change approaches like thunder. Prepare the inner temple.", "category": "wisdom_prescription", "hexagram_range": [17, 24], "tier": "archivist"},
    {"id": "wp-mountain", "text": "Be still as the mountain. Clarity emerges from silence.", "category": "wisdom_prescription", "hexagram_range": [25, 32], "tier": "archivist"},
    {"id": "wp-wind", "text": "The gentle wind penetrates all barriers. Persistence transforms.", "category": "wisdom_prescription", "hexagram_range": [33, 40], "tier": "navigator"},
    {"id": "wp-water", "text": "Flow around obstacles. The soft overcomes the hard.", "category": "wisdom_prescription", "hexagram_range": [41, 48], "tier": "navigator"},
    {"id": "wp-fire", "text": "Illuminate the darkness within. Radiance attracts radiance.", "category": "wisdom_prescription", "hexagram_range": [49, 56], "tier": "sovereign"},
    {"id": "wp-heaven", "text": "You approach completion. The cycle prepares to begin anew.", "category": "wisdom_prescription", "hexagram_range": [57, 64], "tier": "sovereign"},
]


@router.get("/mantras/sovereign-library")
async def get_sovereign_library(user=Depends(get_current_user)):
    """Tier-gated mantras + affirmations + wisdom prescriptions library."""
    tier_doc = await db.mastery_tiers.find_one({"user_id": user["id"]}, {"_id": 0})
    tier_name = tier_doc.get("balance_tier", "observer") if tier_doc else "observer"
    tier_idx = TIERS.index(tier_name) if tier_name in TIERS else 0

    result = {"tier": tier_name, "categories": {}, "total": 0, "unlocked": 0}

    for m in MANTRAS_LIBRARY:
        m_tier_idx = TIERS.index(m["tier"]) if m["tier"] in TIERS else 0
        is_unlocked = tier_idx >= m_tier_idx
        cat = m["category"]
        if cat not in result["categories"]:
            result["categories"][cat] = {"entries": [], "unlocked_count": 0, "total_count": 0}
        entry = {**m, "locked": not is_unlocked}
        if not is_unlocked:
            entry["text"] = entry["text"][:12] + "..."
        result["categories"][cat]["entries"].append(entry)
        result["categories"][cat]["total_count"] += 1
        if is_unlocked:
            result["categories"][cat]["unlocked_count"] += 1
        result["total"] += 1
        if is_unlocked:
            result["unlocked"] += 1

    return result


@router.get("/mantras/wisdom-prescription")
async def get_wisdom_prescription(user=Depends(get_current_user)):
    """Get the current wisdom prescription based on active hexagram state."""
    from routes.hexagram import (
        compute_hexagram_bits, bits_to_hexagram_number, HEXAGRAM_NAMES,
        TIERS as HTIERS, ELEMENTS,
    )
    from routes.sovereign_math import rk4_step
    from datetime import datetime, timezone

    uid = user["id"]
    tier_doc = await db.mastery_tiers.find_one({"user_id": uid}, {"_id": 0})
    tier_name = tier_doc.get("balance_tier", "observer") if tier_doc else "observer"
    tier_idx = TIERS.index(tier_name) if tier_name in TIERS else 0

    garden = await db.user_garden.find({"user_id": uid}, {"_id": 0}).to_list(24)
    garden_masses = {}
    elements_in_garden = set()
    for g in garden:
        elem = g.get("element", "Earth")
        garden_masses[elem] = garden_masses.get(elem, 0) + g.get("gravity_mass", 60)
        elements_in_garden.add(elem)

    current_hour = datetime.now(timezone.utc).hour + datetime.now(timezone.utc).minute / 60.0
    initial = [1.0 + garden_masses.get(e, 0) / 100.0 for e in ELEMENTS]
    state_now = list(initial)
    dt_sim = 0.25
    for step in range(int(current_hour * 4)):
        h = (step * dt_sim) % 24
        state_now = rk4_step(state_now, h, dt_sim, garden_masses)

    mean_energy = sum(state_now) / 5.0
    max_dev = max(abs(state_now[i] - mean_energy) for i in range(5))
    equilibrium_score = max(0, 100 - max_dev * 40) if mean_energy > 0 else 0

    wheel_doc = await db.wheel_interactions.find_one({"user_id": uid}, {"_id": 0})
    explored = set(elements_in_garden)
    if wheel_doc:
        for elem in ELEMENTS:
            if wheel_doc.get(f"{elem.lower()}_count", 0) > 0:
                explored.add(elem)

    archives_count = await db.archive_progress.count_documents({"user_id": uid})
    recipes_count = await db.frequency_recipes.count_documents({"user_id": uid})
    trades_count = await db.trade_listings.count_documents({
        "$or": [{"seller_id": uid}, {"buyer_id": uid}],
        "status": "completed",
    })

    bits = compute_hexagram_bits(
        garden_masses, tier_idx, len(explored),
        archives_count, recipes_count, trades_count, equilibrium_score,
    )
    hex_number = bits_to_hexagram_number(bits)
    hex_info = HEXAGRAM_NAMES.get(hex_number, ("?", "Unknown", "Mystery"))

    # Find matching wisdom prescription
    prescription = None
    for wp in MANTRAS_LIBRARY:
        if wp["category"] != "wisdom_prescription":
            continue
        wp_tier_idx = TIERS.index(wp["tier"]) if wp["tier"] in TIERS else 0
        if tier_idx < wp_tier_idx:
            continue
        hr = wp.get("hexagram_range", [0, 0])
        if hr[0] <= hex_number <= hr[1]:
            prescription = wp
            break

    # Find matching affirmation by dominant element
    dominant_idx = max(range(5), key=lambda i: state_now[i])
    dominant_elem = ELEMENTS[dominant_idx]
    affirmation = None
    for af in MANTRAS_LIBRARY:
        if af["category"] != "affirmation":
            continue
        af_tier_idx = TIERS.index(af["tier"]) if af["tier"] in TIERS else 0
        if tier_idx < af_tier_idx:
            continue
        if af.get("element") == dominant_elem:
            affirmation = af
            break

    # Find matching phonic resonance by solfeggio
    from routes.hexagram import SOLFEGGIO
    target_hz = SOLFEGGIO[(hex_number - 1) % 9]
    resonance = None
    for pr in MANTRAS_LIBRARY:
        if pr["category"] != "phonic_resonance":
            continue
        pr_tier_idx = TIERS.index(pr["tier"]) if pr["tier"] in TIERS else 0
        if tier_idx < pr_tier_idx:
            continue
        if pr.get("hz") == target_hz:
            resonance = pr
            break

    return {
        "hexagram": {"number": hex_number, "chinese": hex_info[0], "name": hex_info[2]},
        "dominant_element": dominant_elem,
        "solfeggio_hz": target_hz,
        "prescription": prescription,
        "affirmation": affirmation,
        "resonance": resonance,
        "tier": tier_name,
    }
