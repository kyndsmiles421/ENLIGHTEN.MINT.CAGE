from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from routes.evolution import SPECIMEN_METADATA
from datetime import datetime, timezone

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  WISDOM EVOLUTION — 4-Tier Cognitive Growth System
#  Seeds (affirmations) → Roots (folklore) → Branches (philosophy) → Canopy (user-created)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WISDOM_TIERS = {
    "seed": {"id": "seed", "name": "Seeds", "description": "Simple affirmations and morsels of wisdom.", "min_interactions": 0, "color": "#22C55E", "icon": "sprout"},
    "root": {"id": "root", "name": "Roots", "description": "Detailed history, folklore, and geological facts.", "min_interactions": 5, "color": "#F59E0B", "icon": "tree-pine"},
    "branch": {"id": "branch", "name": "Branches", "description": "Complex philosophical discourse and guided meditation scripts.", "min_interactions": 15, "color": "#3B82F6", "icon": "git-branch"},
    "canopy": {"id": "canopy", "name": "Canopy", "description": "Peer-to-peer wisdom. Masters plant their own mantras for others to discover.", "min_interactions": 30, "color": "#A855F7", "icon": "crown"},
}

# ── Curated Wisdom Database (Phase 1: Root) ──
CURATED_WISDOM = {
    "peridot": {
        "seed": "I open my heart to growth and renewal.",
        "root": "Peridot, known as the 'Evening Emerald,' has been prized since 1500 BCE by ancient Egyptians on the volcanic island of Zabargad. The Romans called it the 'gem of the sun' for its warm golden-green glow. In Hawaiian mythology, peridot crystals are the tears of Pele, the goddess of fire and volcanoes. Geologically, it forms in the Earth's upper mantle and rides to the surface via volcanic eruptions, making each peridot a messenger from deep within our planet.",
        "branch": "Peridot teaches us the Stoic principle of Amor Fati — love of fate. Just as this stone is born from violent volcanic upheaval yet emerges as something beautiful and luminous, we too can find our brilliance through adversity. The Hermetic tradition associates peridot with the Solar Plexus, the seat of personal power. Meditate with peridot to transform resentment into gratitude, and pressure into diamonds of character.",
    },
    "emerald": {
        "seed": "I radiate love and abundance from my core.",
        "root": "Emerald, the 'Stone of Successful Love,' was Cleopatra's favorite gemstone. The ancient Incas and Muzo people of Colombia revered emeralds as sacred objects representing fertility and immortality. The Emerald Tablet of Hermes Trismegistus — the foundational text of Western alchemy — takes its name from this stone. With a Mohs hardness of 7.5 and a hexagonal crystal system, emerald's natural inclusions (called 'jardin' or garden) are considered part of its character.",
        "branch": "In alchemical philosophy, emerald represents the 'Green Lion' — the raw vitality of nature that must be tamed and refined. The Hermetic axiom 'As Above, So Below' is inscribed upon the mythical Emerald Tablet. This stone invites us to recognize that the microcosm (our inner world) mirrors the macrocosm (the universe). Practice the emerald meditation: visualize green light entering your heart center, expanding with each breath until it encompasses all beings.",
    },
    "obsidian": {
        "seed": "I face my shadow and emerge stronger.",
        "root": "Obsidian, nature's volcanic glass, forms when lava cools so rapidly that crystals cannot form. Ancient Mesoamerican civilizations crafted obsidian mirrors used by priests for divination — they called them 'smoking mirrors' (tezcatl). Aztec warriors tipped their macuahuitl swords with obsidian blades sharper than modern surgical steel. The stone has been used for over 700,000 years as humanity's first cutting tool.",
        "branch": "Obsidian is the philosopher's mirror. In Jungian psychology, the 'shadow' represents the unconscious aspects of personality we refuse to acknowledge. Obsidian's reflective surface literally asks us to look at ourselves. The Stoic Seneca wrote: 'We suffer more in imagination than in reality.' Obsidian cuts through illusion. In deep meditation, hold obsidian and ask: 'What am I afraid to see?' The answer that surfaces is your next lesson.",
    },
    "diamond": {
        "seed": "I am clarity itself — pure crystallized consciousness.",
        "root": "Diamond, the hardest natural substance at Mohs 10, is pure carbon transformed by extreme pressure and heat 100-150 miles below the Earth's surface over 1-3 billion years. The word comes from the Greek 'adamas' meaning unconquerable. In Hindu mythology, Indra's thunderbolt (Vajra) was made of diamond. Ancient Romans believed diamonds were tears of the gods. The first diamonds were found in India's Golconda mines around 800 BCE.",
        "branch": "The diamond is the ultimate alchemical symbol — base carbon transmuted into the most precious substance through extreme pressure and time. This mirrors the Hermetic concept of 'Solve et Coagula' (dissolve and coagulate). We must first break down our ego structures before rebuilding as something crystalline and indestructible. The Buddhist 'Diamond Sutra' uses this stone as a metaphor for the mind that cuts through all illusion. Diamond consciousness is awareness without distortion.",
    },
    "clear_quartz": {
        "seed": "I amplify the frequency of all that is good.",
        "root": "Clear quartz, the most abundant mineral in Earth's crust, has a trigonal crystal system with piezoelectric properties — it converts mechanical pressure into electrical energy. This property makes it essential in modern technology: watches, radios, computers, and oscillators. Ancient Greeks believed quartz was permanently frozen ice (krystallos). Australian Aboriginal peoples used quartz crystals in rain-making ceremonies. Japanese cultures consider it 'the perfect jewel' (suishou).",
        "branch": "Quartz teaches the principle of resonance and amplification. In the Kybalion's Principle of Vibration, 'Nothing rests; everything moves; everything vibrates.' Quartz literally vibrates at a precise, stable frequency — this is why it keeps perfect time in watches. As a meditation companion, quartz amplifies intention. The practice: hold quartz and state your intention clearly. The crystal's stable oscillation acts as an anchor for the chaotic frequencies of the distracted mind.",
    },
    "moonstone": {
        "seed": "I flow with cycles and honor inner knowing.",
        "root": "Moonstone, a variety of feldspar with a perfect cleavage and ethereal adularescence, has been revered since antiquity. Romans believed it was formed from solidified moonbeams. In Hindu tradition, moonstone is considered sacred and is embedded in the forehead of the moon god Chandra. Ancient travelers carried moonstone as a talisman for safe night journeys. The stone's optical phenomenon occurs when light scatters between microscopic layers of two different feldspar minerals.",
        "branch": "Moonstone embodies the Taoist principle of Wu Wei — effortless action through alignment with natural cycles. Just as the moon governs tides without force, moonstone teaches us that true power comes from surrendering to rhythm rather than imposing will. In the alchemical tradition, the moon represents the feminine principle (Luna) — receptive, intuitive, and cyclical. Meditation with moonstone during the full moon amplifies intuitive downloads and dream recall.",
    },
    "lapis_lazuli": {
        "seed": "Royal wisdom flows through my third eye.",
        "root": "Lapis lazuli, with its distinctive deep blue color flecked with golden pyrite, has been mined from the Badakhshan province of Afghanistan for over 6,500 years. It was ground into the pigment 'ultramarine' (meaning 'beyond the sea'), more precious than gold during the Renaissance. Michelangelo and Vermeer used it extensively. In ancient Sumer, lapis was associated with Inanna, queen of heaven. Egyptian pharaohs considered it a stone of royalty and truth.",
        "branch": "Lapis lazuli is the stone of Ma'at — the Egyptian concept of truth, justice, and cosmic order. The golden pyrite flecks within the deep blue represent stars in the night sky of consciousness. In Sufi mysticism, lapis represents the 'Blue Pearl' — the seed of divine consciousness visible in deep meditation. The Hermetic tradition teaches that truth is not found but revealed when the seeker is ready. Meditate with lapis placed on the third eye to access the akashic records of universal memory.",
    },
    "ruby": {
        "seed": "I ignite the fire of unstoppable courage.",
        "root": "Ruby, a variety of corundum colored by chromium, is one of the four precious gemstones. With Mohs hardness of 9 (second only to diamond), rubies have been called the 'King of Gems' since antiquity. In ancient Burma, warriors implanted rubies under their skin believing it made them invincible. Hindu texts describe ruby as 'ratnaraj' — king of precious stones. The finest rubies from Myanmar's Mogok valley exhibit a fluorescent quality called 'pigeon blood red.'",
        "branch": "Ruby embodies the alchemical Fire element — the transformative agent that purifies and strengthens. In the Bhagavad Gita, Krishna tells Arjuna that the soul cannot be destroyed by fire, cut by weapons, or dissolved by water. Ruby consciousness is this indestructible core. The Stoic Marcus Aurelius wrote of an inner citadel — an impregnable fortress of character. Ruby meditation: visualize a red flame at your solar plexus, feel it burning away doubt, fear, and hesitation. What remains is your essential nature.",
    },
    "amber": {
        "seed": "Ancient wisdom flows through me.",
        "root": "Amber is fossilized tree resin, typically 30-90 million years old. Unlike true minerals, it is organic, with no crystal structure (amorphous). The ancient Greeks discovered static electricity by rubbing amber (elektron), giving us the word 'electricity.' Baltic amber from the shores of the North Sea has been traded along the 'Amber Road' since the Neolithic period. Amber frequently preserves ancient insects, spiders, and plant material, creating windows into prehistoric ecosystems.",
        "branch": "Amber is a philosopher's paradox — it is neither stone nor living thing, but a bridge between. It embodies the Buddhist concept of impermanence: once a flowing resin, now solidified, yet holding within it the memory of ancient forests. The Hermetic Principle of Correspondence suggests that amber, having once been alive, retains a 'vital memory.' In contemplation, amber connects us to the long view — that our actions today become the fossils of tomorrow. What do we wish to preserve?",
    },
    "sapphire": {
        "seed": "The stars speak through me — I am aligned.",
        "root": "Sapphire, the blue variety of corundum, has been associated with wisdom and royalty for millennia. Persian rulers believed the sky was painted blue by the reflection of a giant sapphire. Star sapphires exhibit asterism — a six-rayed star caused by oriented rutile needle inclusions. In medieval Europe, clergy wore sapphires to symbolize heaven. The legendary 'Star of India' (563 carats) is the world's largest star sapphire, housed in the American Museum of Natural History.",
        "branch": "Sapphire represents the Platonic ideal of divine wisdom. In Plato's Republic, the philosopher-kings are those who have seen the 'Form of the Good' — an absolute truth beyond the shadows of ordinary perception. Sapphire's association with the Third Eye and Throat chakras suggests it bridges knowing and expressing. The Sufi poet Rumi wrote: 'The universe is not outside of you. Look inside yourself; everything that you want, you already are.' Sapphire meditation reveals this inner cosmos.",
    },
}

# Default wisdom for specimens without curated content
DEFAULT_WISDOM = {
    "seed": "This stone holds ancient wisdom waiting to be discovered.",
    "root": "Throughout history, this mineral has been valued by cultures across the world for its unique properties and spiritual significance.",
    "branch": "In contemplation with this stone, we learn that every material form carries the imprint of the universal consciousness that shaped it. What message does this specimen hold for you today?",
}


def _get_user_tier(interactions: int) -> dict:
    """Determine user's wisdom tier based on total interactions."""
    if interactions >= 30:
        return WISDOM_TIERS["canopy"]
    elif interactions >= 15:
        return WISDOM_TIERS["branch"]
    elif interactions >= 5:
        return WISDOM_TIERS["root"]
    return WISDOM_TIERS["seed"]


@router.get("/wisdom/tiers")
async def get_wisdom_tiers(user=Depends(get_current_user)):
    """Get the wisdom tier definitions and user's current tier."""
    user_id = user["id"]

    # Count total interactions across all specimens
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": None, "total": {"$sum": "$interactions"}}},
    ]
    result = await db.evolution_tracker.aggregate(pipeline).to_list(1)
    total_interactions = result[0]["total"] if result else 0

    current_tier = _get_user_tier(total_interactions)

    return {
        "tiers": list(WISDOM_TIERS.values()),
        "current_tier": current_tier,
        "total_interactions": total_interactions,
        "next_tier_at": {
            "seed": 5,
            "root": 15,
            "branch": 30,
            "canopy": None,
        }.get(current_tier["id"]),
    }


@router.get("/wisdom/for-specimen/{specimen_id}")
async def get_wisdom(specimen_id: str, user=Depends(get_current_user)):
    """Get tiered wisdom for a specific specimen, gated by user's interaction level."""
    user_id = user["id"]

    # Get user's interaction count for this specimen
    evo = await db.evolution_tracker.find_one(
        {"user_id": user_id, "asset_id": specimen_id}, {"_id": 0}
    )
    interactions = (evo or {}).get("interactions", 0)
    tier = _get_user_tier(interactions)

    # Get curated content
    content = CURATED_WISDOM.get(specimen_id, DEFAULT_WISDOM)
    meta = SPECIMEN_METADATA.get(specimen_id, {})

    # Build unlocked wisdom
    unlocked = {}
    locked = {}
    for tier_id, tier_def in WISDOM_TIERS.items():
        if tier_id == "canopy":
            continue  # User-generated — separate endpoint
        if interactions >= tier_def["min_interactions"]:
            unlocked[tier_id] = {
                "tier": tier_def,
                "text": content.get(tier_id, DEFAULT_WISDOM.get(tier_id, "")),
            }
        else:
            locked[tier_id] = {
                "tier": tier_def,
                "interactions_needed": tier_def["min_interactions"] - interactions,
            }

    # Check for user-planted canopy wisdom
    canopy = await db.wisdom_canopy.find(
        {"specimen_id": specimen_id, "approved": True},
        {"_id": 0, "user_id": 0},
    ).sort("planted_at", -1).to_list(5)

    return {
        "specimen_id": specimen_id,
        "specimen_name": meta.get("chakra", specimen_id.replace("_", " ").title()),
        "interactions": interactions,
        "current_tier": tier,
        "unlocked_wisdom": unlocked,
        "locked_wisdom": locked,
        "canopy_wisdom": canopy if interactions >= 30 else [],
        "canopy_locked": interactions < 30,
        "meta": {
            "chakra": meta.get("chakra"),
            "frequency": meta.get("frequency"),
            "mantra": meta.get("mantra"),
        },
    }


@router.post("/wisdom/plant")
async def plant_canopy_wisdom(data: dict = Body(...), user=Depends(get_current_user)):
    """Plant user-created wisdom into the Canopy for others to discover."""
    user_id = user["id"]
    specimen_id = data.get("specimen_id")
    wisdom_text = data.get("text", "").strip()

    if not specimen_id or not wisdom_text:
        raise HTTPException(400, "specimen_id and text required")

    if len(wisdom_text) < 10:
        raise HTTPException(400, "Wisdom must be at least 10 characters")
    if len(wisdom_text) > 500:
        raise HTTPException(400, "Wisdom must be 500 characters or fewer")

    # Verify Canopy tier (30+ interactions)
    evo = await db.evolution_tracker.find_one(
        {"user_id": user_id, "asset_id": specimen_id}, {"_id": 0}
    )
    interactions = (evo or {}).get("interactions", 0)
    if interactions < 30:
        raise HTTPException(400, f"Canopy tier requires 30 interactions. You have {interactions}.")

    # Rate limit: 1 planting per specimen per user
    existing = await db.wisdom_canopy.find_one(
        {"user_id": user_id, "specimen_id": specimen_id}
    )
    if existing:
        raise HTTPException(400, "You've already planted wisdom for this specimen.")

    now = datetime.now(timezone.utc).isoformat()
    await db.wisdom_canopy.insert_one({
        "user_id": user_id,
        "specimen_id": specimen_id,
        "text": wisdom_text,
        "approved": True,  # Auto-approve for now; AI moderation in future
        "planted_at": now,
        "likes": 0,
    })

    # Reward for contribution
    from routes.game_core import award_xp, award_currency
    await award_xp(user_id, 25, f"canopy_plant:{specimen_id}")
    await award_currency(user_id, "cosmic_dust", 15, f"canopy_plant:{specimen_id}")

    return {
        "planted": True,
        "specimen_id": specimen_id,
        "rewards": {"xp": 25, "dust": 15},
    }


@router.get("/wisdom/canopy-feed")
async def get_canopy_feed(user=Depends(get_current_user)):
    """Get the global Canopy feed — user-planted wisdom from all specimens."""
    entries = await db.wisdom_canopy.find(
        {"approved": True},
        {"_id": 0},
    ).sort("planted_at", -1).to_list(30)

    # Enrich with specimen metadata
    for entry in entries:
        meta = SPECIMEN_METADATA.get(entry.get("specimen_id", ""), {})
        entry["chakra"] = meta.get("chakra")
        entry["frequency"] = meta.get("frequency")
        # Remove user_id for privacy
        entry.pop("user_id", None)

    return {"feed": entries, "total": len(entries)}
