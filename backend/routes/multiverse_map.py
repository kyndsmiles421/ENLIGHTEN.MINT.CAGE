import secrets
from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger, EMERGENT_LLM_KEY
from datetime import datetime, timezone, timedelta
import uuid
import random
import hashlib

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  MULTIVERSAL LAYERED MAP SYSTEM
#  4 Universes: Terrestrial, Ethereal, Astral, Void
#  Interlocking Logic Engine for cross-universe effects
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ── Universe Definitions ──

UNIVERSES = {
    "terrestrial": {
        "id": "terrestrial",
        "name": "Terrestrial Plane",
        "subtitle": "The Grounded World",
        "description": "The physical realm of earth, body, and material practice. Rooted in nature and tangible wellness.",
        "element": "Earth",
        "color": "#22C55E",
        "color_secondary": "#16A34A",
        "stat_affinity": "vitality",
        "wellness_source": "mood",
        "regions": [
            {"id": "grove_of_roots", "name": "Grove of Roots", "description": "Ancient trees whose roots reach the planet's core",
             "x": 20, "y": 50, "connections": ["stone_garden", "healing_springs"], "discovered_by_default": True,
             "npcs": [{"id": "elder_oak", "name": "Elder Oak", "role": "Guardian", "dialogue_key": "grounding"}],
             "tools": ["meditation_mat", "grounding_stones"]},
            {"id": "stone_garden", "name": "Stone Garden", "description": "A zen garden where each stone holds a lesson",
             "x": 40, "y": 35, "connections": ["grove_of_roots", "mountain_summit", "herbalist_hut"],
             "npcs": [{"id": "stone_keeper", "name": "Stone Keeper", "role": "Artisan", "dialogue_key": "patience"}],
             "tools": ["crystal_compass", "earthen_bowl"]},
            {"id": "healing_springs", "name": "Healing Springs", "description": "Mineral waters that restore vitality",
             "x": 15, "y": 70, "connections": ["grove_of_roots", "cave_of_echoes"],
             "npcs": [{"id": "spring_warden", "name": "Spring Warden", "role": "Healer", "dialogue_key": "renewal"}],
             "tools": ["healing_elixir", "purification_salts"]},
            {"id": "mountain_summit", "name": "Mountain Summit", "description": "Above the clouds, where clarity meets resolve",
             "x": 55, "y": 20, "connections": ["stone_garden", "rift_to_ethereal"],
             "npcs": [{"id": "summit_sage", "name": "Summit Sage", "role": "Sage", "dialogue_key": "perspective"}],
             "tools": ["breath_of_altitude", "summit_beacon"]},
            {"id": "herbalist_hut", "name": "Herbalist's Hut", "description": "Shelves of dried herbs and tinctures for every ailment",
             "x": 60, "y": 55, "connections": ["stone_garden", "cave_of_echoes"],
             "npcs": [{"id": "herbalist", "name": "Wise Herbalist", "role": "Alchemist", "dialogue_key": "remedies"}],
             "tools": ["herbal_blend", "mortar_pestle"]},
            {"id": "cave_of_echoes", "name": "Cave of Echoes", "description": "Sound reverberates infinitely in these ancient halls",
             "x": 40, "y": 80, "connections": ["healing_springs", "herbalist_hut"],
             "npcs": [{"id": "echo_spirit", "name": "Echo Spirit", "role": "Mystic", "dialogue_key": "listening"}],
             "tools": ["resonance_tuner", "echo_amplifier"]},
            {"id": "rift_to_ethereal", "name": "Rift to the Ethereal", "description": "A shimmering tear where earth meets energy",
             "x": 75, "y": 15, "connections": ["mountain_summit"],
             "type": "portal", "portal_target": {"universe": "ethereal", "region": "mist_threshold"}},
        ],
    },
    "ethereal": {
        "id": "ethereal",
        "name": "Ethereal Plane",
        "subtitle": "The Energy World",
        "description": "A luminous realm of auras, chakras, and spiritual energy. Where intention shapes reality.",
        "element": "Water",
        "color": "#3B82F6",
        "color_secondary": "#2563EB",
        "stat_affinity": "harmony",
        "wellness_source": "meditation",
        "regions": [
            {"id": "mist_threshold", "name": "Mist Threshold", "description": "The boundary where physical dissolves into energy",
             "x": 15, "y": 30, "connections": ["chakra_nexus", "luminous_falls"], "discovered_by_default": True,
             "npcs": [{"id": "mist_guide", "name": "Mist Guide", "role": "Navigator", "dialogue_key": "transition"}],
             "tools": ["aura_lens", "mist_compass"],
             "type": "portal", "portal_target": {"universe": "terrestrial", "region": "rift_to_ethereal"}},
            {"id": "chakra_nexus", "name": "Chakra Nexus", "description": "Seven pillars of light representing the energy centers",
             "x": 35, "y": 45, "connections": ["mist_threshold", "dream_archive", "harmonic_bridge"],
             "npcs": [{"id": "chakra_weaver", "name": "Chakra Weaver", "role": "Energy Master", "dialogue_key": "alignment"}],
             "tools": ["chakra_tuning_fork", "energy_thread"]},
            {"id": "luminous_falls", "name": "Luminous Falls", "description": "Waterfalls of pure light energy cascading endlessly",
             "x": 20, "y": 65, "connections": ["mist_threshold", "spirit_marsh"],
             "npcs": [{"id": "light_dancer", "name": "Light Dancer", "role": "Performer", "dialogue_key": "flow"}],
             "tools": ["light_vial", "prism_shard"]},
            {"id": "dream_archive", "name": "Dream Archive", "description": "Library of every dream ever dreamed",
             "x": 55, "y": 30, "connections": ["chakra_nexus", "astral_gate"],
             "npcs": [{"id": "dream_librarian", "name": "Dream Librarian", "role": "Keeper", "dialogue_key": "subconscious"}],
             "tools": ["dream_journal", "lucidity_key"]},
            {"id": "harmonic_bridge", "name": "Harmonic Bridge", "description": "A bridge made of resonant frequencies",
             "x": 50, "y": 60, "connections": ["chakra_nexus", "spirit_marsh"],
             "npcs": [{"id": "frequency_monk", "name": "Frequency Monk", "role": "Harmonist", "dialogue_key": "vibration"}],
             "tools": ["singing_bowl_ethereal", "frequency_key"]},
            {"id": "spirit_marsh", "name": "Spirit Marsh", "description": "Where lost energies gather and can be reclaimed",
             "x": 35, "y": 80, "connections": ["luminous_falls", "harmonic_bridge"],
             "npcs": [{"id": "marsh_phantom", "name": "Marsh Phantom", "role": "Reclaimer", "dialogue_key": "release"}],
             "tools": ["spirit_net", "marsh_lantern"]},
            {"id": "astral_gate", "name": "Gate to the Astral", "description": "A spinning vortex of stars leading to the cosmic plane",
             "x": 75, "y": 25, "connections": ["dream_archive"],
             "type": "portal", "portal_target": {"universe": "astral", "region": "starfall_landing"}},
        ],
    },
    "astral": {
        "id": "astral",
        "name": "Astral Plane",
        "subtitle": "The Cosmic World",
        "description": "The realm of stars, constellations, and universal consciousness. Time bends here.",
        "element": "Fire",
        "color": "#F59E0B",
        "color_secondary": "#D97706",
        "stat_affinity": "wisdom",
        "wellness_source": "journal",
        "regions": [
            {"id": "starfall_landing", "name": "Starfall Landing", "description": "Where fallen stars cool into crystallized wisdom",
             "x": 20, "y": 25, "connections": ["constellation_forge", "temporal_reef"], "discovered_by_default": True,
             "npcs": [{"id": "star_collector", "name": "Star Collector", "role": "Scholar", "dialogue_key": "wisdom"}],
             "tools": ["star_map", "celestial_sextant"],
             "type": "portal", "portal_target": {"universe": "ethereal", "region": "astral_gate"}},
            {"id": "constellation_forge", "name": "Constellation Forge", "description": "Where new star patterns are hammered into existence",
             "x": 45, "y": 40, "connections": ["starfall_landing", "oracle_spire", "nebula_garden"],
             "npcs": [{"id": "forge_master", "name": "Forge Master", "role": "Creator", "dialogue_key": "creation"}],
             "tools": ["cosmic_hammer", "star_thread"]},
            {"id": "temporal_reef", "name": "Temporal Reef", "description": "Coral-like structures grown from crystallized time",
             "x": 15, "y": 60, "connections": ["starfall_landing", "void_threshold"],
             "npcs": [{"id": "time_tender", "name": "Time Tender", "role": "Chronomancer", "dialogue_key": "patience"}],
             "tools": ["temporal_glass", "moment_anchor"]},
            {"id": "oracle_spire", "name": "Oracle Spire", "description": "A tower from which all futures can be glimpsed",
             "x": 60, "y": 25, "connections": ["constellation_forge", "supernova_core"],
             "npcs": [{"id": "oracle_keeper", "name": "Oracle Keeper", "role": "Seer", "dialogue_key": "foresight"}],
             "tools": ["prophecy_lens", "fate_thread"]},
            {"id": "nebula_garden", "name": "Nebula Garden", "description": "Gardens of gas and light where new realities bloom",
             "x": 55, "y": 65, "connections": ["constellation_forge", "supernova_core"],
             "npcs": [{"id": "nebula_tender", "name": "Nebula Tender", "role": "Gardener", "dialogue_key": "growth"}],
             "tools": ["nebula_seed", "reality_water"]},
            {"id": "supernova_core", "name": "Supernova Core", "description": "The heart of an exploding star — pure transformative energy",
             "x": 75, "y": 45, "connections": ["oracle_spire", "nebula_garden"],
             "npcs": [{"id": "nova_phoenix", "name": "Nova Phoenix", "role": "Rebirth Guide", "dialogue_key": "transformation"}],
             "tools": ["nova_shard", "rebirth_flame"]},
            {"id": "void_threshold", "name": "Threshold of the Void", "description": "Where light ends and the unknown begins",
             "x": 20, "y": 80, "connections": ["temporal_reef"],
             "type": "portal", "portal_target": {"universe": "void", "region": "entropy_shore"}},
        ],
    },
    "void": {
        "id": "void",
        "name": "Void Plane",
        "subtitle": "The Unknown World",
        "description": "Beyond all known planes — a realm of pure potential, shadow, and the unconscious mind.",
        "element": "Air",
        "color": "#A855F7",
        "color_secondary": "#7C3AED",
        "stat_affinity": "resonance",
        "wellness_source": "breathing",
        "regions": [
            {"id": "entropy_shore", "name": "Entropy Shore", "description": "A beach of dissolving realities at the edge of existence",
             "x": 20, "y": 30, "connections": ["shadow_library", "silence_depths"], "discovered_by_default": True,
             "npcs": [{"id": "entropy_watcher", "name": "Entropy Watcher", "role": "Observer", "dialogue_key": "acceptance"}],
             "tools": ["void_compass", "entropy_lens"],
             "type": "portal", "portal_target": {"universe": "astral", "region": "void_threshold"}},
            {"id": "shadow_library", "name": "Shadow Library", "description": "Books written in languages not yet invented",
             "x": 40, "y": 45, "connections": ["entropy_shore", "paradox_engine", "mirror_maze"],
             "npcs": [{"id": "shadow_scribe", "name": "Shadow Scribe", "role": "Archivist", "dialogue_key": "unknown"}],
             "tools": ["shadow_ink", "void_quill"]},
            {"id": "silence_depths", "name": "Silence Depths", "description": "Where all sound ceases and thought becomes form",
             "x": 15, "y": 65, "connections": ["entropy_shore", "mirror_maze"],
             "npcs": [{"id": "silence_keeper", "name": "Silence Keeper", "role": "Monk", "dialogue_key": "stillness"}],
             "tools": ["silence_bell", "thought_crystal"]},
            {"id": "paradox_engine", "name": "Paradox Engine", "description": "A machine that runs on contradictions",
             "x": 55, "y": 30, "connections": ["shadow_library", "origin_point"],
             "npcs": [{"id": "paradox_smith", "name": "Paradox Smith", "role": "Engineer", "dialogue_key": "duality"}],
             "tools": ["paradox_gear", "contradiction_key"]},
            {"id": "mirror_maze", "name": "Mirror Maze", "description": "Infinite reflections showing all possible selves",
             "x": 50, "y": 65, "connections": ["shadow_library", "silence_depths", "origin_point"],
             "npcs": [{"id": "mirror_self", "name": "Mirror Self", "role": "Reflection", "dialogue_key": "identity"}],
             "tools": ["truth_mirror", "self_shard"]},
            {"id": "origin_point", "name": "The Origin Point", "description": "Where all four planes converge — the source of everything",
             "x": 75, "y": 48, "connections": ["paradox_engine", "mirror_maze"],
             "type": "nexus",
             "npcs": [{"id": "origin_keeper", "name": "The Origin Keeper", "role": "Cosmic Entity", "dialogue_key": "unity"}],
             "tools": ["origin_key", "universal_thread"]},
        ],
    },
}

# ── Interlocking Effects Definition ──
# Actions in one universe create ripples in others

INTERLOCK_EFFECTS = {
    "terrestrial": {
        "explore": {
            "ethereal": {"effect": "reveal_npc", "description": "Grounding energy stabilizes an Ethereal NPC"},
            "astral": {"effect": "boost_loot", "description": "Earth's abundance enriches Astral discoveries"},
            "void": {"effect": "calm_chaos", "description": "Terrestrial stability reduces Void entropy"},
        },
        "npc_interact": {
            "ethereal": {"effect": "open_path", "description": "Physical wisdom creates energetic pathways"},
        },
    },
    "ethereal": {
        "explore": {
            "terrestrial": {"effect": "grow_flora", "description": "Energy flow makes Terrestrial flora bloom"},
            "astral": {"effect": "amplify_stars", "description": "Ethereal light amplifies star visibility"},
            "void": {"effect": "weaken_shadows", "description": "Light energy weakens Void shadows"},
        },
        "npc_interact": {
            "astral": {"effect": "open_path", "description": "Energy mastery unlocks cosmic paths"},
        },
    },
    "astral": {
        "explore": {
            "terrestrial": {"effect": "reveal_secret", "description": "Cosmic vision reveals hidden Terrestrial locations"},
            "ethereal": {"effect": "charge_nexus", "description": "Star energy charges Ethereal nexus points"},
            "void": {"effect": "illuminate", "description": "Starlight pierces the Void's darkness"},
        },
        "npc_interact": {
            "void": {"effect": "open_path", "description": "Cosmic knowledge bridges into the unknown"},
        },
    },
    "void": {
        "explore": {
            "terrestrial": {"effect": "deepen_roots", "description": "Embracing the unknown deepens Terrestrial foundations"},
            "ethereal": {"effect": "expand_aura", "description": "Void acceptance expands Ethereal aura range"},
            "astral": {"effect": "bend_time", "description": "Void energy warps Astral temporal flow"},
        },
        "npc_interact": {
            "terrestrial": {"effect": "open_path", "description": "Shadow wisdom reveals hidden earth paths"},
        },
    },
}

# Wellness-to-Universe mapping
WELLNESS_UNIVERSE_MAP = {
    "mood": "terrestrial",
    "meditation": "ethereal",
    "journal": "astral",
    "breathing": "void",
    "soundscape": "ethereal",
}


# ── Helper Functions ──

async def get_universe_state(user_id: str) -> dict:
    """Get or create user's multiverse state."""
    state = await db.multiverse_state.find_one({"user_id": user_id}, {"_id": 0})
    if not state:
        state = {
            "user_id": user_id,
            "current_universe": "terrestrial",
            "discovered": {
                "terrestrial": ["grove_of_roots"],
                "ethereal": ["mist_threshold"],
                "astral": ["starfall_landing"],
                "void": ["entropy_shore"],
            },
            "npc_met": {},
            "tools_acquired": {},
            "portals_unlocked": [],
            "ripple_log": [],
            "universe_resonance": {
                "terrestrial": 0, "ethereal": 0, "astral": 0, "void": 0,
            },
            "total_explorations": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.multiverse_state.insert_one(state)
        state.pop("_id", None)
    return state


def compute_ascendant_universe():
    """Determine which universe is currently empowered based on cosmic weather."""
    from routes.reports import get_current_zodiac, get_lunar_phase
    zodiac = get_current_zodiac()
    lunar = get_lunar_phase()
    element = zodiac["element"]
    element_to_universe = {
        "Earth": "terrestrial", "Water": "ethereal",
        "Fire": "astral", "Air": "void",
    }
    ascendant = element_to_universe.get(element, "terrestrial")
    return {
        "universe": ascendant,
        "zodiac": zodiac["sign"],
        "element": element,
        "lunar": lunar["phase"],
        "bonus": "+20% XP and discovery rate",
    }


def generate_npc_dialogue(npc, universe_id, resonance_level):
    """Generate contextual NPC dialogue based on universe resonance."""
    themes = {
        "grounding": ["Feel the earth beneath you.", "Your roots grow deeper with each breath.", "The mountain does not hurry, yet it endures."],
        "patience": ["A garden is not grown in a day.", "The stone teaches stillness.", "Wait. Watch. The answer comes."],
        "renewal": ["These waters remember you.", "Let the old flow away.", "You are renewed with each ripple."],
        "perspective": ["From here, worries seem small.", "The view changes everything.", "Breathe the thin air of clarity."],
        "remedies": ["Nature provides what the soul needs.", "This blend will settle your spirit.", "Healing is already within you."],
        "listening": ["The echo carries truth.", "Listen beyond the words.", "In silence, the universe speaks."],
        "transition": ["The mist parts for those who are ready.", "You carry the earth's strength with you.", "Between worlds, you find yourself."],
        "alignment": ["Your energy centers seek balance.", "One blocked chakra affects all.", "Alignment is a practice, not a destination."],
        "flow": ["Light flows like water here.", "Surrender to the current.", "The falls carry away what you no longer need."],
        "subconscious": ["Every dream is a letter from yourself.", "The archive holds your forgotten truths.", "Sleep is a bridge to understanding."],
        "vibration": ["Everything vibrates at its own frequency.", "Find the note that makes your soul ring.", "Harmony is the universe's default state."],
        "release": ["The marsh holds what was abandoned.", "Reclaim your lost energy.", "Sometimes release is the greatest power."],
        "wisdom": ["Stars fall to share their knowledge.", "Each fragment holds an era of learning.", "Collect wisdom, but do not hoard it."],
        "creation": ["New patterns emerge from chaos.", "You are a constellation being forged.", "Create the light you wish to see."],
        "foresight": ["The future is a garden of possibilities.", "I see many paths before you.", "Which future calls to your heart?"],
        "growth": ["Reality blooms from intention.", "Plant your dreams in fertile imagination.", "Even nebulae were once just dust."],
        "transformation": ["From destruction comes rebirth.", "The phoenix knows: endings are beginnings.", "Let the old self burn away."],
        "acceptance": ["The void does not judge.", "Entropy is not destruction—it is change.", "Accept the unknown as a friend."],
        "unknown": ["Knowledge begins where certainty ends.", "These pages write themselves.", "The greatest wisdom admits ignorance."],
        "stillness": ["In perfect silence, hear everything.", "Thought becomes tangible here.", "The void is not empty—it is full of potential."],
        "duality": ["Contradiction fuels creation.", "Hold two truths at once.", "The paradox is the answer."],
        "identity": ["Which reflection is the real you?", "All versions are true.", "The mirror shows possibility, not limitation."],
        "unity": ["All four planes are one.", "You have walked every world.", "The origin remembers what you have forgotten."],
    }
    key = npc.get("dialogue_key", "wisdom")
    lines = themes.get(key, ["The cosmos speaks through silence."])
    idx = resonance_level % len(lines)
    return lines[idx]


# ── API Endpoints ──

@router.get("/multiverse/state")
async def get_multiverse(user=Depends(get_current_user)):
    """Get user's full multiverse state with all 4 universes."""
    state = await get_universe_state(user["id"])
    ascendant = compute_ascendant_universe()

    universes = []
    for uid, udef in UNIVERSES.items():
        discovered_ids = state["discovered"].get(uid, [])
        regions = []
        for r in udef["regions"]:
            is_disc = r["id"] in discovered_ids
            region = {
                "id": r["id"],
                "name": r["name"],
                "description": r["description"] if is_disc else "???",
                "x": r["x"], "y": r["y"],
                "discovered": is_disc,
                "connections": r.get("connections", []),
                "type": r.get("type"),
                "portal_target": r.get("portal_target") if is_disc else None,
                "has_npc": bool(r.get("npcs")) and is_disc,
                "has_tools": bool(r.get("tools")) and is_disc,
            }
            if is_disc and r.get("npcs"):
                npc = r["npcs"][0]
                met = state.get("npc_met", {}).get(npc["id"], False)
                resonance = state.get("universe_resonance", {}).get(uid, 0)
                region["npc"] = {
                    "id": npc["id"],
                    "name": npc["name"],
                    "role": npc["role"],
                    "met": met,
                    "dialogue": generate_npc_dialogue(npc, uid, resonance) if met else None,
                }
            regions.append(region)

        universes.append({
            "id": uid,
            "name": udef["name"],
            "subtitle": udef["subtitle"],
            "description": udef["description"],
            "element": udef["element"],
            "color": udef["color"],
            "color_secondary": udef["color_secondary"],
            "stat_affinity": udef["stat_affinity"],
            "regions": regions,
            "discovered_count": len(discovered_ids),
            "total_regions": len(udef["regions"]),
            "resonance": state.get("universe_resonance", {}).get(uid, 0),
            "is_ascendant": uid == ascendant["universe"],
        })

    # Recent ripples (last 10)
    recent_ripples = state.get("ripple_log", [])[-10:]

    return {
        "current_universe": state["current_universe"],
        "universes": universes,
        "ascendant": ascendant,
        "portals_unlocked": state.get("portals_unlocked", []),
        "total_explorations": state.get("total_explorations", 0),
        "recent_ripples": recent_ripples,
    }


@router.post("/multiverse/explore")
async def explore_universe_region(data: dict = Body(...), user=Depends(get_current_user)):
    """Explore a region in a universe — triggers interlocking effects."""
    universe_id = data.get("universe_id")
    region_id = data.get("region_id")

    if universe_id not in UNIVERSES:
        raise HTTPException(400, "Invalid universe")

    udef = UNIVERSES[universe_id]
    region = next((r for r in udef["regions"] if r["id"] == region_id), None)
    if not region:
        raise HTTPException(400, "Invalid region")

    state = await get_universe_state(user["id"])
    discovered = state["discovered"].get(universe_id, [])

    # Check if region is accessible (connected to a discovered region)
    if region_id not in discovered:
        accessible = any(
            region_id in next(
                (r["connections"] for r in udef["regions"] if r["id"] == d), []
            ) for d in discovered
        )
        if not accessible:
            raise HTTPException(403, "Region not accessible — discover connected regions first")

    # Discover region
    new_discovery = region_id not in discovered
    if new_discovery:
        await db.multiverse_state.update_one(
            {"user_id": user["id"]},
            {"$addToSet": {f"discovered.{universe_id}": region_id}},
        )

    # Gain resonance
    resonance_gain = 5 if new_discovery else 1
    await db.multiverse_state.update_one(
        {"user_id": user["id"]},
        {"$inc": {
            f"universe_resonance.{universe_id}": resonance_gain,
            "total_explorations": 1,
        }},
    )

    # XP reward
    ascendant = compute_ascendant_universe()
    xp_base = 30 if new_discovery else 10
    if ascendant["universe"] == universe_id:
        xp_base = int(xp_base * 1.2)

    from routes.rpg import get_or_create_character, level_from_xp
    char = await get_or_create_character(user["id"])
    new_xp = char["xp"] + xp_base
    await db.rpg_characters.update_one(
        {"user_id": user["id"]}, {"$inc": {"xp": xp_base}}
    )

    # Currency reward
    dust_reward = secrets.randbelow(11) + 5 if new_discovery else random.randint(1, 5)
    await db.rpg_currencies.update_one(
        {"user_id": user["id"]}, {"$inc": {"cosmic_dust": dust_reward}}, upsert=True,
    )

    # ── INTERLOCKING LOGIC ENGINE ──
    ripples = []
    effects = INTERLOCK_EFFECTS.get(universe_id, {}).get("explore", {})
    for target_uid, effect_def in effects.items():
        ripple = {
            "id": str(uuid.uuid4())[:8],
            "source_universe": universe_id,
            "target_universe": target_uid,
            "effect_type": effect_def["effect"],
            "description": effect_def["description"],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source_region": region_id,
        }

        # Apply effect
        if effect_def["effect"] == "reveal_npc":
            target_regions = state["discovered"].get(target_uid, [])
            if target_regions:
                random_region = random.choice(target_regions)
                target_def = UNIVERSES[target_uid]
                reg = next((r for r in target_def["regions"] if r["id"] == random_region), None)
                if reg and reg.get("npcs"):
                    npc_id = reg["npcs"][0]["id"]
                    await db.multiverse_state.update_one(
                        {"user_id": user["id"]},
                        {"$set": {f"npc_met.{npc_id}": True}},
                    )
                    ripple["detail"] = f"Revealed {reg['npcs'][0]['name']} in {reg['name']}"

        elif effect_def["effect"] in ("open_path", "reveal_secret"):
            target_def = UNIVERSES[target_uid]
            target_disc = state["discovered"].get(target_uid, [])
            undiscovered = [r for r in target_def["regions"] if r["id"] not in target_disc]
            if undiscovered and random.random() < 0.3:
                new_reg = random.choice(undiscovered)
                await db.multiverse_state.update_one(
                    {"user_id": user["id"]},
                    {"$addToSet": {f"discovered.{target_uid}": new_reg["id"]}},
                )
                ripple["detail"] = f"Discovered {new_reg['name']} in {UNIVERSES[target_uid]['name']}"

        elif effect_def["effect"] == "boost_loot":
            extra_dust = secrets.randbelow(8) + 3
            await db.rpg_currencies.update_one(
                {"user_id": user["id"]}, {"$inc": {"cosmic_dust": extra_dust}}, upsert=True,
            )
            dust_reward += extra_dust
            ripple["detail"] = f"+{extra_dust} bonus Cosmic Dust"

        elif effect_def["effect"] in ("grow_flora", "charge_nexus", "expand_aura",
                                       "deepen_roots", "calm_chaos", "weaken_shadows",
                                       "illuminate", "amplify_stars", "bend_time"):
            res_boost = random.randint(1, 3)
            await db.multiverse_state.update_one(
                {"user_id": user["id"]},
                {"$inc": {f"universe_resonance.{target_uid}": res_boost}},
            )
            ripple["detail"] = f"+{res_boost} resonance in {UNIVERSES[target_uid]['name']}"

        ripples.append(ripple)

    # Save ripples to log
    if ripples:
        await db.multiverse_state.update_one(
            {"user_id": user["id"]},
            {"$push": {"ripple_log": {"$each": ripples, "$slice": -50}}},
        )

    # Check portal unlock
    portal_unlocked = None
    if region.get("type") == "portal" and region.get("portal_target"):
        portal_key = f"{universe_id}:{region_id}"
        if portal_key not in state.get("portals_unlocked", []):
            await db.multiverse_state.update_one(
                {"user_id": user["id"]},
                {"$addToSet": {"portals_unlocked": portal_key}},
            )
            target = region["portal_target"]
            await db.multiverse_state.update_one(
                {"user_id": user["id"]},
                {"$addToSet": {f"discovered.{target['universe']}": target["region"]}},
            )
            portal_unlocked = {
                "from": f"{udef['name']} — {region['name']}",
                "to": f"{UNIVERSES[target['universe']]['name']} — {target['region']}",
            }

    # Meet NPCs in region
    npc_met = None
    if region.get("npcs"):
        npc = region["npcs"][0]
        if not state.get("npc_met", {}).get(npc["id"]):
            await db.multiverse_state.update_one(
                {"user_id": user["id"]},
                {"$set": {f"npc_met.{npc['id']}": True}},
            )
            resonance = state.get("universe_resonance", {}).get(universe_id, 0)
            npc_met = {
                "name": npc["name"],
                "role": npc["role"],
                "dialogue": generate_npc_dialogue(npc, universe_id, resonance),
            }

    return {
        "universe": universe_id,
        "region": region["name"],
        "new_discovery": new_discovery,
        "xp_gained": xp_base,
        "dust_gained": dust_reward,
        "resonance_gained": resonance_gain,
        "ripples": ripples,
        "portal_unlocked": portal_unlocked,
        "npc_met": npc_met,
        "ascendant_bonus": ascendant["universe"] == universe_id,
    }


@router.post("/multiverse/interact-npc")
async def interact_with_npc(data: dict = Body(...), user=Depends(get_current_user)):
    """Interact with an NPC — generates dialogue and cross-universe effects."""
    universe_id = data.get("universe_id")
    region_id = data.get("region_id")
    npc_id = data.get("npc_id")

    if universe_id not in UNIVERSES:
        raise HTTPException(400, "Invalid universe")

    udef = UNIVERSES[universe_id]
    region = next((r for r in udef["regions"] if r["id"] == region_id), None)
    if not region:
        raise HTTPException(400, "Invalid region")

    npc = next((n for n in region.get("npcs", []) if n["id"] == npc_id), None)
    if not npc:
        raise HTTPException(400, "NPC not found in this region")

    state = await get_universe_state(user["id"])
    resonance = state.get("universe_resonance", {}).get(universe_id, 0)

    # Mark as met
    await db.multiverse_state.update_one(
        {"user_id": user["id"]},
        {"$set": {f"npc_met.{npc_id}": True}},
    )

    # Gain resonance
    await db.multiverse_state.update_one(
        {"user_id": user["id"]},
        {"$inc": {f"universe_resonance.{universe_id}": 2}},
    )

    # Generate dialogue
    dialogue = generate_npc_dialogue(npc, universe_id, resonance)

    # Interlocking NPC effects
    ripples = []
    npc_effects = INTERLOCK_EFFECTS.get(universe_id, {}).get("npc_interact", {})
    for target_uid, effect_def in npc_effects.items():
        ripple = {
            "id": str(uuid.uuid4())[:8],
            "source_universe": universe_id,
            "target_universe": target_uid,
            "effect_type": effect_def["effect"],
            "description": effect_def["description"],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source_region": region_id,
        }
        # Apply open_path effect
        target_def = UNIVERSES[target_uid]
        target_disc = state["discovered"].get(target_uid, [])
        undiscovered = [r for r in target_def["regions"] if r["id"] not in target_disc]
        if undiscovered and random.random() < 0.4:
            new_reg = random.choice(undiscovered)
            await db.multiverse_state.update_one(
                {"user_id": user["id"]},
                {"$addToSet": {f"discovered.{target_uid}": new_reg["id"]}},
            )
            ripple["detail"] = f"Discovered {new_reg['name']} in {UNIVERSES[target_uid]['name']}"
        else:
            res_boost = random.randint(1, 3)
            await db.multiverse_state.update_one(
                {"user_id": user["id"]},
                {"$inc": {f"universe_resonance.{target_uid}": res_boost}},
            )
            ripple["detail"] = f"+{res_boost} resonance in {UNIVERSES[target_uid]['name']}"
        ripples.append(ripple)

    if ripples:
        await db.multiverse_state.update_one(
            {"user_id": user["id"]},
            {"$push": {"ripple_log": {"$each": ripples, "$slice": -50}}},
        )

    # XP for interaction
    xp = 15
    await db.rpg_characters.update_one(
        {"user_id": user["id"]}, {"$inc": {"xp": xp}}, upsert=True,
    )

    return {
        "npc": npc["name"],
        "role": npc["role"],
        "dialogue": dialogue,
        "xp_gained": xp,
        "resonance_gained": 2,
        "ripples": ripples,
    }


@router.post("/multiverse/travel")
async def travel_universe(data: dict = Body(...), user=Depends(get_current_user)):
    """Switch current universe."""
    target = data.get("universe_id")
    if target not in UNIVERSES:
        raise HTTPException(400, "Invalid universe")

    await db.multiverse_state.update_one(
        {"user_id": user["id"]},
        {"$set": {"current_universe": target}},
        upsert=True,
    )
    return {"current_universe": target, "name": UNIVERSES[target]["name"]}


@router.get("/multiverse/ripples")
async def get_ripple_log(user=Depends(get_current_user)):
    """Get the cross-universe ripple effect history."""
    state = await get_universe_state(user["id"])
    return {
        "ripples": state.get("ripple_log", [])[-20:],
        "universe_resonance": state.get("universe_resonance", {}),
    }
