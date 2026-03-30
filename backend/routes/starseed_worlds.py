import uuid
import random
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Body, HTTPException
from deps import db, get_current_user, logger

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  COSMIC GEMS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GEM_TYPES = [
    # Elemental Gems
    {"id": "ember-shard", "name": "Ember Shard", "type": "elemental", "element": "Fire",
     "color": "#EF4444", "icon": "flame", "rarity": "common",
     "desc": "A sliver of primordial fire, warm to the touch even in the void.",
     "stat_bonus": {"courage": 1}, "socket_bonus": {"courage": 2}},
    {"id": "tide-pearl", "name": "Tide Pearl", "type": "elemental", "element": "Water",
     "color": "#38BDF8", "icon": "droplet", "rarity": "common",
     "desc": "Formed in the cosmic oceans of Sirius. Hums with fluid energy.",
     "stat_bonus": {"wisdom": 1}, "socket_bonus": {"wisdom": 2}},
    {"id": "void-glass", "name": "Void Glass", "type": "elemental", "element": "Void",
     "color": "#6366F1", "icon": "circle", "rarity": "common",
     "desc": "Compressed nothingness given form. Stare too long and it stares back.",
     "stat_bonus": {"resilience": 1}, "socket_bonus": {"resilience": 2}},
    {"id": "prism-dust", "name": "Prism Dust", "type": "elemental", "element": "Light",
     "color": "#FCD34D", "icon": "sparkles", "rarity": "common",
     "desc": "Crystallized starlight. Scatters into rainbows when shaken.",
     "stat_bonus": {"compassion": 1}, "socket_bonus": {"compassion": 2}},
    {"id": "shadow-amber", "name": "Shadow Amber", "type": "elemental", "element": "Shadow",
     "color": "#DC2626", "icon": "moon", "rarity": "common",
     "desc": "Hardened darkness from the Orion Rift. Throbs with duality.",
     "stat_bonus": {"intuition": 1}, "socket_bonus": {"intuition": 2}},
    {"id": "crystal-node", "name": "Crystal Node", "type": "elemental", "element": "Crystal",
     "color": "#A855F7", "icon": "hexagon", "rarity": "common",
     "desc": "A node from the Arcturian crystalline grid. Vibrates at 432 Hz.",
     "stat_bonus": {"wisdom": 1}, "socket_bonus": {"wisdom": 2}},

    # Starseed Gems (origin-specific, rare)
    {"id": "pleiadian-heart", "name": "Heart of the Seven Sisters", "type": "starseed", "element": "Light",
     "color": "#818CF8", "icon": "heart", "rarity": "rare", "origin_affinity": "pleiadian",
     "desc": "The combined love frequency of all seven Pleiadian stars.",
     "stat_bonus": {"compassion": 2, "wisdom": 1}, "socket_bonus": {"compassion": 3, "wisdom": 2}},
    {"id": "sirian-trident", "name": "Trident of Sirius", "type": "starseed", "element": "Water",
     "color": "#0EA5E9", "icon": "zap", "rarity": "rare", "origin_affinity": "sirian",
     "desc": "Channeled from the aquatic temples deep beneath Sirius B.",
     "stat_bonus": {"wisdom": 2, "resilience": 1}, "socket_bonus": {"wisdom": 3, "resilience": 2}},
    {"id": "arcturian-prism", "name": "Arcturian Prism Core", "type": "starseed", "element": "Crystal",
     "color": "#C084FC", "icon": "diamond", "rarity": "rare", "origin_affinity": "arcturian",
     "desc": "A core fragment of the great dimensional gateway.",
     "stat_bonus": {"intuition": 2, "wisdom": 1}, "socket_bonus": {"intuition": 3, "wisdom": 2}},
    {"id": "lyran-ember", "name": "Vega's First Flame", "type": "starseed", "element": "Fire",
     "color": "#F59E0B", "icon": "flame", "rarity": "rare", "origin_affinity": "lyran",
     "desc": "A spark from the original forge of creation in Lyra.",
     "stat_bonus": {"courage": 2, "resilience": 1}, "socket_bonus": {"courage": 3, "resilience": 2}},
    {"id": "andromedan-lens", "name": "Andromedan Mind Lens", "type": "starseed", "element": "Void",
     "color": "#0EA5E9", "icon": "eye", "rarity": "rare", "origin_affinity": "andromedan",
     "desc": "A telepathic amplifier from beyond our galaxy.",
     "stat_bonus": {"intuition": 2, "compassion": 1}, "socket_bonus": {"intuition": 3, "compassion": 2}},
    {"id": "orion-scar", "name": "Scar of the Orion Wars", "type": "starseed", "element": "Shadow",
     "color": "#DC2626", "icon": "shield", "rarity": "rare", "origin_affinity": "orion",
     "desc": "Forged in the fires of the galaxy's greatest conflict.",
     "stat_bonus": {"resilience": 2, "courage": 1}, "socket_bonus": {"resilience": 3, "courage": 2}},

    # Cosmic Gems (ultra-rare, universal)
    {"id": "singularity-seed", "name": "Singularity Seed", "type": "cosmic", "element": "All",
     "color": "#F0ABFC", "icon": "atom", "rarity": "legendary",
     "desc": "A fragment of the original Big Bang. Contains infinite potential.",
     "stat_bonus": {"wisdom": 2, "courage": 2, "compassion": 2}, "socket_bonus": {"wisdom": 3, "courage": 3, "compassion": 3}},
    {"id": "akashic-shard", "name": "Akashic Shard", "type": "cosmic", "element": "All",
     "color": "#FBBF24", "icon": "book", "rarity": "legendary",
     "desc": "A piece of the Akashic Records themselves. All knowledge ripples within.",
     "stat_bonus": {"wisdom": 3, "intuition": 2}, "socket_bonus": {"wisdom": 4, "intuition": 3}},
    {"id": "nexus-heart", "name": "Heart of the Nexus", "type": "cosmic", "element": "All",
     "color": "#34D399", "icon": "infinity", "rarity": "legendary",
     "desc": "The beating core of the multiverse itself. Bridges all realms.",
     "stat_bonus": {"resilience": 3, "compassion": 2}, "socket_bonus": {"resilience": 4, "compassion": 3}},
]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  EQUIPMENT SYSTEM
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EQUIPMENT_SLOTS = ["weapon", "armor", "accessory", "talisman"]

EQUIPMENT_SETS = {
    "celestial-guardian": {
        "name": "Celestial Guardian",
        "color": "#818CF8",
        "pieces": ["starlight-blade", "astral-plate", "nebula-ring", "guardian-sigil"],
        "bonuses": {
            2: {"label": "(2) +2 Resilience, +1 Courage", "stats": {"resilience": 2, "courage": 1}},
            4: {"label": "(4) +4 All Stats, +Portal Sight", "stats": {"wisdom": 4, "courage": 4, "compassion": 4, "intuition": 4, "resilience": 4}, "special": "portal_sight"},
        },
    },
    "void-walker": {
        "name": "Void Walker",
        "color": "#6366F1",
        "pieces": ["entropy-edge", "null-shroud", "rift-band", "void-compass"],
        "bonuses": {
            2: {"label": "(2) +2 Intuition, +1 Wisdom", "stats": {"intuition": 2, "wisdom": 1}},
            4: {"label": "(4) +4 All Stats, +Void Step", "stats": {"wisdom": 4, "courage": 4, "compassion": 4, "intuition": 4, "resilience": 4}, "special": "void_step"},
        },
    },
    "starforged": {
        "name": "Starforged",
        "color": "#F59E0B",
        "pieces": ["solar-hammer", "corona-mail", "flare-pendant", "forge-brand"],
        "bonuses": {
            2: {"label": "(2) +2 Courage, +1 Resilience", "stats": {"courage": 2, "resilience": 1}},
            4: {"label": "(4) +4 All Stats, +Star Strike", "stats": {"wisdom": 4, "courage": 4, "compassion": 4, "intuition": 4, "resilience": 4}, "special": "star_strike"},
        },
    },
}

EQUIPMENT_CATALOG = [
    # Celestial Guardian Set
    {"id": "starlight-blade", "name": "Starlight Blade", "slot": "weapon", "set_id": "celestial-guardian",
     "rarity": "epic", "color": "#818CF8", "icon": "sword",
     "stat_bonus": {"courage": 3, "wisdom": 1}, "gem_sockets": 2,
     "desc": "Forged from condensed starlight in the Pleiadian forge-temples."},
    {"id": "astral-plate", "name": "Astral Plate", "slot": "armor", "set_id": "celestial-guardian",
     "rarity": "epic", "color": "#818CF8", "icon": "shield",
     "stat_bonus": {"resilience": 3, "compassion": 1}, "gem_sockets": 2,
     "desc": "Woven from the fabric between dimensions. Shimmers with starlight."},
    {"id": "nebula-ring", "name": "Nebula Ring", "slot": "accessory", "set_id": "celestial-guardian",
     "rarity": "epic", "color": "#818CF8", "icon": "circle",
     "stat_bonus": {"intuition": 2, "wisdom": 2}, "gem_sockets": 1,
     "desc": "A ring carved from a dying nebula. Pulses with cosmic awareness."},
    {"id": "guardian-sigil", "name": "Guardian's Sigil", "slot": "talisman", "set_id": "celestial-guardian",
     "rarity": "epic", "color": "#818CF8", "icon": "star",
     "stat_bonus": {"compassion": 2, "resilience": 2}, "gem_sockets": 1,
     "desc": "An ancient sigil passed down by the Cosmic Guardians since the First Age."},

    # Void Walker Set
    {"id": "entropy-edge", "name": "Entropy Edge", "slot": "weapon", "set_id": "void-walker",
     "rarity": "epic", "color": "#6366F1", "icon": "sword",
     "stat_bonus": {"courage": 2, "intuition": 2}, "gem_sockets": 2,
     "desc": "A blade that cuts through reality itself. The edge is always sharp."},
    {"id": "null-shroud", "name": "Null Shroud", "slot": "armor", "set_id": "void-walker",
     "rarity": "epic", "color": "#6366F1", "icon": "shield",
     "stat_bonus": {"resilience": 2, "wisdom": 2}, "gem_sockets": 2,
     "desc": "A cloak of compressed void. You become a shadow within shadows."},
    {"id": "rift-band", "name": "Rift Band", "slot": "accessory", "set_id": "void-walker",
     "rarity": "epic", "color": "#6366F1", "icon": "circle",
     "stat_bonus": {"intuition": 3, "courage": 1}, "gem_sockets": 1,
     "desc": "A bracelet that pulses at the frequency of dimensional rifts."},
    {"id": "void-compass", "name": "Void Compass", "slot": "talisman", "set_id": "void-walker",
     "rarity": "epic", "color": "#6366F1", "icon": "compass",
     "stat_bonus": {"wisdom": 3, "intuition": 1}, "gem_sockets": 1,
     "desc": "Points toward the nearest tear in the fabric of spacetime."},

    # Starforged Set
    {"id": "solar-hammer", "name": "Solar Hammer", "slot": "weapon", "set_id": "starforged",
     "rarity": "epic", "color": "#F59E0B", "icon": "sword",
     "stat_bonus": {"courage": 4}, "gem_sockets": 2,
     "desc": "Hammered from a white dwarf's core by the Lyran forge-masters."},
    {"id": "corona-mail", "name": "Corona Mail", "slot": "armor", "set_id": "starforged",
     "rarity": "epic", "color": "#F59E0B", "icon": "shield",
     "stat_bonus": {"resilience": 4}, "gem_sockets": 2,
     "desc": "Chainmail of living solar plasma. Burns those who dare strike you."},
    {"id": "flare-pendant", "name": "Flare Pendant", "slot": "accessory", "set_id": "starforged",
     "rarity": "epic", "color": "#F59E0B", "icon": "circle",
     "stat_bonus": {"courage": 2, "compassion": 2}, "gem_sockets": 1,
     "desc": "A pendant that holds a miniature solar flare in eternal bloom."},
    {"id": "forge-brand", "name": "Forge Brand", "slot": "talisman", "set_id": "starforged",
     "rarity": "epic", "color": "#F59E0B", "icon": "flame",
     "stat_bonus": {"resilience": 2, "wisdom": 2}, "gem_sockets": 1,
     "desc": "The mark of the Starforged. Burned into existence, never fades."},

    # Standalone Legendary Equipment
    {"id": "cosmic-aegis", "name": "Cosmic Aegis", "slot": "armor", "set_id": None,
     "rarity": "legendary", "color": "#34D399", "icon": "shield",
     "stat_bonus": {"resilience": 5, "compassion": 2}, "gem_sockets": 3,
     "desc": "A shield born from a supernova. Protects across dimensions."},
    {"id": "astral-weaver", "name": "Astral Weaver", "slot": "weapon", "set_id": None,
     "rarity": "legendary", "color": "#EC4899", "icon": "sword",
     "stat_bonus": {"wisdom": 3, "intuition": 3, "courage": 1}, "gem_sockets": 3,
     "desc": "A staff that weaves reality. Each swing rewrites local spacetime."},
    {"id": "infinity-loop", "name": "Infinity Loop", "slot": "accessory", "set_id": None,
     "rarity": "legendary", "color": "#FBBF24", "icon": "infinity",
     "stat_bonus": {"wisdom": 2, "courage": 2, "compassion": 2, "intuition": 2}, "gem_sockets": 2,
     "desc": "A Mobius strip of crystallized time. The wearer exists in all moments."},
    {"id": "origin-totem", "name": "Totem of Origins", "slot": "talisman", "set_id": None,
     "rarity": "legendary", "color": "#F0ABFC", "icon": "star",
     "stat_bonus": {"resilience": 3, "intuition": 3}, "gem_sockets": 2,
     "desc": "Carved from the first stone of creation. Hums with every origin's frequency."},
]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  MULTIVERSE REALMS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MULTIVERSE_REALMS = [
    {
        "id": "astral-sanctum",
        "name": "The Astral Sanctum",
        "subtitle": "Realm of Light & Healing",
        "color": "#818CF8",
        "gradient": ["#818CF8", "#C084FC"],
        "element": "Light",
        "icon": "sun",
        "description": "A luminous dimension of pure healing energy, where the Pleiadian elders maintain the galaxy's greatest library of consciousness.",
        "lore": "Beyond the veil of ordinary reality lies the Astral Sanctum — a realm woven from living light. Here, thought becomes architecture and emotion paints the sky. The Pleiadian High Council convenes in crystalline towers that sing with harmonic frequencies, and every visitor finds their deepest wounds addressed by the realm's sentient healing fields.",
        "difficulty": "Novice",
        "level_req": 1,
        "gem_req": [],
        "unique_gems": ["prism-dust", "pleiadian-heart"],
        "unique_equipment": ["starlight-blade", "astral-plate"],
        "enemies": ["Shade Wraith", "Distortion Wisp", "Memory Eater"],
        "boss": "The Forgotten Archon",
        "atmosphere": "peaceful",
    },
    {
        "id": "shadow-nexus",
        "name": "The Shadow Nexus",
        "subtitle": "Crossroads of Duality",
        "color": "#DC2626",
        "gradient": ["#DC2626", "#6366F1"],
        "element": "Shadow",
        "icon": "moon",
        "description": "The intersection of light and dark where the Orion Wars echo eternally. Only the brave traverse its twisting corridors.",
        "lore": "Where light meets dark, the Shadow Nexus thrums with the eternal echoes of the Orion Wars. This twisted dimension exists as a scar in spacetime — a place where the greatest battle in galactic history still reverberates. Warriors from both sides wander its halls as spectral echoes, and the very ground shifts between illumination and absolute darkness.",
        "difficulty": "Veteran",
        "level_req": 3,
        "gem_req": ["shadow-amber"],
        "unique_gems": ["shadow-amber", "orion-scar"],
        "unique_equipment": ["entropy-edge", "null-shroud"],
        "enemies": ["Shadow Knight", "Rift Stalker", "Echo Warrior"],
        "boss": "The Dual Sovereign",
        "atmosphere": "dark",
    },
    {
        "id": "crystal-caverns",
        "name": "The Crystal Caverns",
        "subtitle": "Heart of the Grid",
        "color": "#A855F7",
        "gradient": ["#A855F7", "#EC4899"],
        "element": "Crystal",
        "icon": "diamond",
        "description": "Deep within the Arcturian dimensional gateway, crystalline chambers hold the secrets of sacred geometry and universal structure.",
        "lore": "Beneath the surface of Arcturus, impossibly vast caverns of living crystal extend in every direction. Each crystal is a node in the galactic information grid, storing the accumulated knowledge of a billion civilizations. The geometry of the caverns is itself a message — those who can read it gain access to the fundamental laws underlying all reality.",
        "difficulty": "Expert",
        "level_req": 5,
        "gem_req": ["crystal-node", "arcturian-prism"],
        "unique_gems": ["crystal-node", "arcturian-prism", "akashic-shard"],
        "unique_equipment": ["nebula-ring", "guardian-sigil", "cosmic-aegis"],
        "enemies": ["Crystal Golem", "Grid Phantom", "Prism Serpent"],
        "boss": "The Geometer",
        "atmosphere": "mystical",
    },
    {
        "id": "void-between",
        "name": "The Void Between",
        "subtitle": "Edge of Existence",
        "color": "#0EA5E9",
        "gradient": ["#0EA5E9", "#1E3A5F"],
        "element": "Void",
        "icon": "orbit",
        "description": "The space between galaxies — an infinite expanse where reality thins to nothing and the Andromedans built their telepathic relay network.",
        "lore": "Beyond the edge of the Milky Way, between the spiraling arms of galaxies, lies the Void Between. Here, physical laws are suggestions and consciousness is the only reliable constant. The Andromedans built a vast telepathic relay network through this emptiness, creating highways of pure thought that connect distant civilizations. Those who enter must rely on will alone — for in the Void, only intent has substance.",
        "difficulty": "Master",
        "level_req": 8,
        "gem_req": ["void-glass", "andromedan-lens", "singularity-seed"],
        "unique_gems": ["void-glass", "andromedan-lens", "singularity-seed", "nexus-heart"],
        "unique_equipment": ["rift-band", "void-compass", "astral-weaver", "infinity-loop", "origin-totem"],
        "enemies": ["Void Behemoth", "Thought Parasite", "Entropy Wraith", "Null Entity"],
        "boss": "The Singularity",
        "atmosphere": "cosmic",
    },
]

# Portal definitions — how to discover and unlock
PORTAL_REGISTRY = {
    "astral-sanctum": {
        "unlock_type": "auto",
        "description": "The Astral Sanctum is always open to those who begin their journey.",
    },
    "shadow-nexus": {
        "unlock_type": "layered",
        "conditions": {
            "level": 3,
            "gems": ["shadow-amber"],
            "story_choice": "embrace_duality",
        },
        "description": "Requires Level 3, a Shadow Amber gem, and the courage to embrace duality.",
    },
    "crystal-caverns": {
        "unlock_type": "layered",
        "conditions": {
            "level": 5,
            "gems": ["crystal-node", "arcturian-prism"],
            "story_choice": "seek_knowledge",
        },
        "description": "Requires Level 5, Crystal Node + Arcturian Prism gems, and a quest for knowledge.",
    },
    "void-between": {
        "unlock_type": "layered",
        "conditions": {
            "level": 8,
            "gems": ["void-glass", "andromedan-lens", "singularity-seed"],
            "story_choice": "transcend_form",
        },
        "description": "Requires Level 8, three cosmic gems, and transcendence of physical form.",
    },
}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  CRAFTING & ENCHANTING RECIPES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRAFTING_RECIPES = [
    {"id": "forge-starlight-blade", "name": "Forge Starlight Blade",
     "result_id": "starlight-blade", "result_type": "equipment",
     "materials": [{"id": "prism-dust", "qty": 3}, {"id": "ember-shard", "qty": 2}],
     "level_req": 3, "description": "Combine light and fire to forge the legendary Starlight Blade."},
    {"id": "forge-entropy-edge", "name": "Forge Entropy Edge",
     "result_id": "entropy-edge", "result_type": "equipment",
     "materials": [{"id": "void-glass", "qty": 3}, {"id": "shadow-amber", "qty": 2}],
     "level_req": 4, "description": "Channel void and shadow to create a blade that cuts reality."},
    {"id": "forge-solar-hammer", "name": "Forge Solar Hammer",
     "result_id": "solar-hammer", "result_type": "equipment",
     "materials": [{"id": "ember-shard", "qty": 4}, {"id": "crystal-node", "qty": 1}],
     "level_req": 4, "description": "Intense fire shaped by crystalline precision."},
    {"id": "fuse-singularity-seed", "name": "Fuse Singularity Seed",
     "result_id": "singularity-seed", "result_type": "gem",
     "materials": [{"id": "prism-dust", "qty": 2}, {"id": "void-glass", "qty": 2}, {"id": "ember-shard", "qty": 2}, {"id": "shadow-amber", "qty": 2}, {"id": "crystal-node", "qty": 2}, {"id": "tide-pearl", "qty": 2}],
     "level_req": 7, "description": "Combine all six elemental gems to create a fragment of the Big Bang."},
    {"id": "weave-cosmic-aegis", "name": "Weave Cosmic Aegis",
     "result_id": "cosmic-aegis", "result_type": "equipment",
     "materials": [{"id": "crystal-node", "qty": 3}, {"id": "tide-pearl", "qty": 3}, {"id": "prism-dust", "qty": 2}],
     "level_req": 6, "description": "Layer crystal, water, and light into an impenetrable cosmic shield."},
    {"id": "forge-infinity-loop", "name": "Forge Infinity Loop",
     "result_id": "infinity-loop", "result_type": "equipment",
     "materials": [{"id": "akashic-shard", "qty": 1}, {"id": "singularity-seed", "qty": 1}],
     "level_req": 9, "description": "Only the Akashic and the Singularity can bend time into a loop."},
]

ENCHANT_OPTIONS = [
    {"id": "fortify", "name": "Fortify", "desc": "Increase base stat bonuses by 50%.", "cost_gems": 2, "cost_type": "any"},
    {"id": "attune", "name": "Attune to Origin", "desc": "Align equipment to your origin for +2 to your origin's primary stat.", "cost_gems": 1, "cost_type": "starseed"},
    {"id": "awaken", "name": "Awaken", "desc": "Unlock a hidden ability within the equipment.", "cost_gems": 3, "cost_type": "cosmic"},
]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  GEM DISCOVERY (STORY / EXPLORATION)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REALM_GEM_DISCOVERIES = {
    "astral-sanctum": [
        {"gem_id": "prism-dust", "chance": 0.40, "method": "exploration"},
        {"gem_id": "tide-pearl", "chance": 0.30, "method": "exploration"},
        {"gem_id": "pleiadian-heart", "chance": 0.08, "method": "secret_location"},
    ],
    "shadow-nexus": [
        {"gem_id": "shadow-amber", "chance": 0.35, "method": "exploration"},
        {"gem_id": "ember-shard", "chance": 0.30, "method": "exploration"},
        {"gem_id": "orion-scar", "chance": 0.08, "method": "secret_location"},
    ],
    "crystal-caverns": [
        {"gem_id": "crystal-node", "chance": 0.35, "method": "exploration"},
        {"gem_id": "void-glass", "chance": 0.25, "method": "exploration"},
        {"gem_id": "arcturian-prism", "chance": 0.08, "method": "secret_location"},
        {"gem_id": "akashic-shard", "chance": 0.03, "method": "secret_location"},
    ],
    "void-between": [
        {"gem_id": "void-glass", "chance": 0.30, "method": "exploration"},
        {"gem_id": "shadow-amber", "chance": 0.20, "method": "exploration"},
        {"gem_id": "andromedan-lens", "chance": 0.10, "method": "secret_location"},
        {"gem_id": "singularity-seed", "chance": 0.02, "method": "secret_location"},
        {"gem_id": "nexus-heart", "chance": 0.02, "method": "secret_location"},
    ],
}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  HELPER FUNCTIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def get_gem_def(gem_id):
    return next((g for g in GEM_TYPES if g["id"] == gem_id), None)

def get_equip_def(equip_id):
    return next((e for e in EQUIPMENT_CATALOG if e["id"] == equip_id), None)

def check_portal_unlocked(realm_id, character):
    portal = PORTAL_REGISTRY.get(realm_id)
    if not portal:
        return False
    if portal["unlock_type"] == "auto":
        return True
    conds = portal.get("conditions", {})
    if character.get("level", 1) < conds.get("level", 0):
        return False
    char_gems = [g["id"] for g in character.get("gem_collection", [])]
    for req_gem in conds.get("gems", []):
        if req_gem not in char_gems:
            return False
    # Story choice is optional (tracked separately)
    return True


def roll_realm_gem(realm_id):
    discoveries = REALM_GEM_DISCOVERIES.get(realm_id, [])
    if not discoveries:
        return None
    roll = random.random()
    cumulative = 0
    for d in discoveries:
        cumulative += d["chance"]
        if roll < cumulative:
            gem_def = get_gem_def(d["gem_id"])
            if gem_def:
                return {**gem_def, "found_in": realm_id, "method": d["method"],
                        "found_at": datetime.now(timezone.utc).isoformat(),
                        "instance_id": str(uuid.uuid4())}
            return None
    return None


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  API ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ─── Multiverse / Realms ───

@router.get("/starseed/worlds/realms")
async def get_realms(user=Depends(get_current_user)):
    """Get all multiverse realms with unlock status."""
    chars = await db.starseed_characters.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).to_list(10)

    best_char = max(chars, key=lambda c: c.get("level", 1)) if chars else None

    realms_out = []
    for realm in MULTIVERSE_REALMS:
        unlocked = check_portal_unlocked(realm["id"], best_char) if best_char else (realm["id"] == "astral-sanctum")
        portal_info = PORTAL_REGISTRY.get(realm["id"], {})
        realms_out.append({
            "id": realm["id"],
            "name": realm["name"],
            "subtitle": realm["subtitle"],
            "color": realm["color"],
            "gradient": realm["gradient"],
            "element": realm["element"],
            "icon": realm["icon"],
            "description": realm["description"],
            "lore": realm["lore"],
            "difficulty": realm["difficulty"],
            "level_req": realm["level_req"],
            "gem_req": realm["gem_req"],
            "boss": realm["boss"],
            "atmosphere": realm["atmosphere"],
            "unlocked": unlocked,
            "portal_description": portal_info.get("description", ""),
        })
    return {"realms": realms_out}


@router.get("/starseed/worlds/realm/{realm_id}")
async def get_realm_detail(realm_id: str, user=Depends(get_current_user)):
    """Get detailed realm info including available gems and equipment."""
    realm = next((r for r in MULTIVERSE_REALMS if r["id"] == realm_id), None)
    if not realm:
        raise HTTPException(status_code=404, detail="Realm not found")

    unique_gems = [get_gem_def(gid) for gid in realm.get("unique_gems", []) if get_gem_def(gid)]
    unique_equip = [get_equip_def(eid) for eid in realm.get("unique_equipment", []) if get_equip_def(eid)]

    return {
        **{k: v for k, v in realm.items()},
        "unique_gems_detail": unique_gems,
        "unique_equipment_detail": unique_equip,
    }


@router.post("/starseed/worlds/explore")
async def explore_realm(data: dict = Body(...), user=Depends(get_current_user)):
    """Explore a realm and potentially discover gems or equipment."""
    realm_id = data.get("realm_id")
    origin_id = data.get("origin_id")

    realm = next((r for r in MULTIVERSE_REALMS if r["id"] == realm_id), None)
    if not realm:
        raise HTTPException(status_code=404, detail="Realm not found")

    char = await db.starseed_characters.find_one(
        {"user_id": user["id"], "origin_id": origin_id}, {"_id": 0}
    )
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    if not check_portal_unlocked(realm_id, char):
        raise HTTPException(status_code=403, detail="Portal locked. Meet the requirements to enter.")

    discoveries = []
    xp_gained = random.randint(10, 25) * (MULTIVERSE_REALMS.index(realm) + 1)

    # Roll for gem discovery
    gem_found = roll_realm_gem(realm_id)
    if gem_found:
        gem_collection = char.get("gem_collection", [])
        gem_collection.append(gem_found)
        await db.starseed_characters.update_one(
            {"user_id": user["id"], "origin_id": origin_id},
            {"$set": {"gem_collection": gem_collection}}
        )
        discoveries.append({"type": "gem", "item": gem_found})

    # Rare equipment discovery (5% chance in correct realm)
    if random.random() < 0.05:
        possible_equip = [get_equip_def(eid) for eid in realm.get("unique_equipment", []) if get_equip_def(eid)]
        if possible_equip:
            equip_found = random.choice(possible_equip)
            equip_instance = {**equip_found, "instance_id": str(uuid.uuid4()),
                              "socketed_gems": [], "enchantments": [],
                              "found_in": realm_id, "found_at": datetime.now(timezone.utc).isoformat()}
            equipment = char.get("equipment_collection", [])
            equipment.append(equip_instance)
            await db.starseed_characters.update_one(
                {"user_id": user["id"], "origin_id": origin_id},
                {"$set": {"equipment_collection": equipment}}
            )
            discoveries.append({"type": "equipment", "item": equip_instance})

    # XP
    new_xp = char.get("xp", 0) + xp_gained
    level = char.get("level", 1)
    xp_to_next = char.get("xp_to_next", 100)
    leveled_up = False
    if new_xp >= xp_to_next:
        level += 1
        new_xp -= xp_to_next
        xp_to_next = int(xp_to_next * 1.5)
        leveled_up = True

    await db.starseed_characters.update_one(
        {"user_id": user["id"], "origin_id": origin_id},
        {"$set": {"xp": new_xp, "level": level, "xp_to_next": xp_to_next}}
    )

    return {
        "realm_id": realm_id,
        "discoveries": discoveries,
        "xp_gained": xp_gained,
        "leveled_up": leveled_up,
        "new_level": level if leveled_up else None,
        "encounter": random.choice(realm["enemies"]) if random.random() < 0.6 else None,
    }


# ─── Gem Collection ───

@router.get("/starseed/worlds/gems/{origin_id}")
async def get_gem_collection(origin_id: str, user=Depends(get_current_user)):
    """Get a character's gem collection."""
    char = await db.starseed_characters.find_one(
        {"user_id": user["id"], "origin_id": origin_id},
        {"_id": 0, "gem_collection": 1}
    )
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")
    return {"gems": char.get("gem_collection", []), "all_gem_types": GEM_TYPES}


@router.get("/starseed/worlds/gem-catalog")
async def get_gem_catalog():
    """Get all available gem types."""
    return {"gems": GEM_TYPES}


# ─── Equipment Collection ───

@router.get("/starseed/worlds/equipment/{origin_id}")
async def get_equipment_collection(origin_id: str, user=Depends(get_current_user)):
    """Get a character's equipment collection and loadout."""
    # First check if character exists
    char_exists = await db.starseed_characters.find_one(
        {"user_id": user["id"], "origin_id": origin_id},
        {"_id": 0, "origin_id": 1}
    )
    if not char_exists:
        raise HTTPException(status_code=404, detail="Character not found")
    
    # Get equipment fields (may not exist on older characters)
    char = await db.starseed_characters.find_one(
        {"user_id": user["id"], "origin_id": origin_id},
        {"_id": 0, "equipment_collection": 1, "equipped_gear": 1}
    )
    return {
        "equipment": char.get("equipment_collection", []) if char else [],
        "equipped": char.get("equipped_gear", {}) if char else {},
        "sets": EQUIPMENT_SETS,
        "slots": EQUIPMENT_SLOTS,
    }


@router.post("/starseed/worlds/equip-gear")
async def equip_gear(data: dict = Body(...), user=Depends(get_current_user)):
    """Equip gear to a slot."""
    origin_id = data.get("origin_id")
    instance_id = data.get("instance_id")
    slot = data.get("slot")

    if slot not in EQUIPMENT_SLOTS:
        raise HTTPException(status_code=400, detail="Invalid slot")

    char = await db.starseed_characters.find_one(
        {"user_id": user["id"], "origin_id": origin_id}, {"_id": 0}
    )
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    equipment = char.get("equipment_collection", [])
    item = next((e for e in equipment if e.get("instance_id") == instance_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found in collection")
    if item.get("slot") != slot:
        raise HTTPException(status_code=400, detail="Equipment does not fit that slot")

    equipped = char.get("equipped_gear", {})
    equipped[slot] = instance_id

    # Calculate set bonuses
    equipped_set_ids = []
    for s, iid in equipped.items():
        eq = next((e for e in equipment if e.get("instance_id") == iid), None)
        if eq and eq.get("set_id"):
            equipped_set_ids.append(eq["set_id"])

    active_set_bonuses = []
    for set_id, set_def in EQUIPMENT_SETS.items():
        count = equipped_set_ids.count(set_id)
        for threshold, bonus in set_def["bonuses"].items():
            if count >= int(threshold):
                active_set_bonuses.append({"set_id": set_id, "set_name": set_def["name"],
                                           "pieces": count, "bonus": bonus})

    await db.starseed_characters.update_one(
        {"user_id": user["id"], "origin_id": origin_id},
        {"$set": {"equipped_gear": equipped, "active_set_bonuses": active_set_bonuses}}
    )
    return {"equipped": equipped, "active_set_bonuses": active_set_bonuses}


@router.post("/starseed/worlds/unequip-gear")
async def unequip_gear(data: dict = Body(...), user=Depends(get_current_user)):
    """Unequip gear from a slot."""
    origin_id = data.get("origin_id")
    slot = data.get("slot")

    char = await db.starseed_characters.find_one(
        {"user_id": user["id"], "origin_id": origin_id}, {"_id": 0}
    )
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    equipped = char.get("equipped_gear", {})
    equipped.pop(slot, None)

    await db.starseed_characters.update_one(
        {"user_id": user["id"], "origin_id": origin_id},
        {"$set": {"equipped_gear": equipped}}
    )
    return {"equipped": equipped}


# ─── Gem Socketing ───

@router.post("/starseed/worlds/socket-gem")
async def socket_gem(data: dict = Body(...), user=Depends(get_current_user)):
    """Socket a gem into equipment."""
    origin_id = data.get("origin_id")
    equip_instance_id = data.get("equip_instance_id")
    gem_instance_id = data.get("gem_instance_id")

    char = await db.starseed_characters.find_one(
        {"user_id": user["id"], "origin_id": origin_id}, {"_id": 0}
    )
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    equipment = char.get("equipment_collection", [])
    gems = char.get("gem_collection", [])

    equip = next((e for e in equipment if e.get("instance_id") == equip_instance_id), None)
    gem = next((g for g in gems if g.get("instance_id") == gem_instance_id), None)

    if not equip:
        raise HTTPException(status_code=404, detail="Equipment not found")
    if not gem:
        raise HTTPException(status_code=404, detail="Gem not found")

    socketed = equip.get("socketed_gems", [])
    max_sockets = equip.get("gem_sockets", 0)
    if len(socketed) >= max_sockets:
        raise HTTPException(status_code=400, detail=f"All {max_sockets} gem sockets are full")

    socketed.append({"gem_instance_id": gem_instance_id, "gem_id": gem["id"],
                      "name": gem["name"], "socket_bonus": gem.get("socket_bonus", {})})
    equip["socketed_gems"] = socketed

    # Remove gem from collection
    gems = [g for g in gems if g.get("instance_id") != gem_instance_id]

    await db.starseed_characters.update_one(
        {"user_id": user["id"], "origin_id": origin_id},
        {"$set": {"equipment_collection": equipment, "gem_collection": gems}}
    )
    return {"equipment": equip, "remaining_gems": len(gems)}


@router.post("/starseed/worlds/unsocket-gem")
async def unsocket_gem(data: dict = Body(...), user=Depends(get_current_user)):
    """Remove a socketed gem from equipment."""
    origin_id = data.get("origin_id")
    equip_instance_id = data.get("equip_instance_id")
    gem_instance_id = data.get("gem_instance_id")

    char = await db.starseed_characters.find_one(
        {"user_id": user["id"], "origin_id": origin_id}, {"_id": 0}
    )
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    equipment = char.get("equipment_collection", [])
    gems = char.get("gem_collection", [])

    equip = next((e for e in equipment if e.get("instance_id") == equip_instance_id), None)
    if not equip:
        raise HTTPException(status_code=404, detail="Equipment not found")

    socketed = equip.get("socketed_gems", [])
    gem_entry = next((s for s in socketed if s["gem_instance_id"] == gem_instance_id), None)
    if not gem_entry:
        raise HTTPException(status_code=404, detail="Gem not socketed in this equipment")

    socketed.remove(gem_entry)
    equip["socketed_gems"] = socketed

    gem_def = get_gem_def(gem_entry["gem_id"])
    if gem_def:
        gems.append({**gem_def, "instance_id": gem_instance_id,
                      "found_at": datetime.now(timezone.utc).isoformat()})

    await db.starseed_characters.update_one(
        {"user_id": user["id"], "origin_id": origin_id},
        {"$set": {"equipment_collection": equipment, "gem_collection": gems}}
    )
    return {"equipment": equip, "remaining_gems": len(gems)}


# ─── Crafting ───

@router.get("/starseed/worlds/crafting-recipes")
async def get_crafting_recipes(user=Depends(get_current_user)):
    """Get all crafting recipes."""
    return {"recipes": CRAFTING_RECIPES, "enchant_options": ENCHANT_OPTIONS}


@router.post("/starseed/worlds/craft")
async def craft_item(data: dict = Body(...), user=Depends(get_current_user)):
    """Craft an item from gems/materials."""
    origin_id = data.get("origin_id")
    recipe_id = data.get("recipe_id")

    recipe = next((r for r in CRAFTING_RECIPES if r["id"] == recipe_id), None)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    char = await db.starseed_characters.find_one(
        {"user_id": user["id"], "origin_id": origin_id}, {"_id": 0}
    )
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    if char.get("level", 1) < recipe.get("level_req", 1):
        raise HTTPException(status_code=400, detail=f"Requires level {recipe['level_req']}")

    gems = char.get("gem_collection", [])

    # Check materials
    for mat in recipe["materials"]:
        available = [g for g in gems if g["id"] == mat["id"]]
        if len(available) < mat["qty"]:
            raise HTTPException(status_code=400,
                                detail=f"Need {mat['qty']}x {mat['id']}, have {len(available)}")

    # Consume materials
    for mat in recipe["materials"]:
        consumed = 0
        new_gems = []
        for g in gems:
            if g["id"] == mat["id"] and consumed < mat["qty"]:
                consumed += 1
                continue
            new_gems.append(g)
        gems = new_gems

    # Create result
    if recipe["result_type"] == "equipment":
        equip_def = get_equip_def(recipe["result_id"])
        if equip_def:
            crafted = {**equip_def, "instance_id": str(uuid.uuid4()),
                       "socketed_gems": [], "enchantments": [], "crafted": True,
                       "found_at": datetime.now(timezone.utc).isoformat()}
            equipment = char.get("equipment_collection", [])
            equipment.append(crafted)
            await db.starseed_characters.update_one(
                {"user_id": user["id"], "origin_id": origin_id},
                {"$set": {"gem_collection": gems, "equipment_collection": equipment}}
            )
            return {"crafted": crafted, "type": "equipment"}
    elif recipe["result_type"] == "gem":
        gem_def = get_gem_def(recipe["result_id"])
        if gem_def:
            crafted = {**gem_def, "instance_id": str(uuid.uuid4()), "crafted": True,
                       "found_at": datetime.now(timezone.utc).isoformat()}
            gems.append(crafted)
            await db.starseed_characters.update_one(
                {"user_id": user["id"], "origin_id": origin_id},
                {"$set": {"gem_collection": gems}}
            )
            return {"crafted": crafted, "type": "gem"}

    raise HTTPException(status_code=500, detail="Crafting failed")


@router.post("/starseed/worlds/enchant")
async def enchant_equipment(data: dict = Body(...), user=Depends(get_current_user)):
    """Enchant equipment using gems."""
    origin_id = data.get("origin_id")
    equip_instance_id = data.get("equip_instance_id")
    enchant_id = data.get("enchant_id")

    enchant = next((e for e in ENCHANT_OPTIONS if e["id"] == enchant_id), None)
    if not enchant:
        raise HTTPException(status_code=404, detail="Enchantment not found")

    char = await db.starseed_characters.find_one(
        {"user_id": user["id"], "origin_id": origin_id}, {"_id": 0}
    )
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    equipment = char.get("equipment_collection", [])
    gems = char.get("gem_collection", [])

    equip = next((e for e in equipment if e.get("instance_id") == equip_instance_id), None)
    if not equip:
        raise HTTPException(status_code=404, detail="Equipment not found")

    # Check gem cost
    cost = enchant["cost_gems"]
    cost_type = enchant["cost_type"]

    if cost_type == "any":
        available = gems
    elif cost_type == "starseed":
        available = [g for g in gems if g.get("type") == "starseed"]
    elif cost_type == "cosmic":
        available = [g for g in gems if g.get("type") == "cosmic"]
    else:
        available = gems

    if len(available) < cost:
        raise HTTPException(status_code=400, detail=f"Need {cost} {cost_type} gems, have {len(available)}")

    # Consume gems
    consumed_ids = set()
    for g in available[:cost]:
        consumed_ids.add(g["instance_id"])
    gems = [g for g in gems if g.get("instance_id") not in consumed_ids]

    # Apply enchantment
    enchantments = equip.get("enchantments", [])
    if any(e["id"] == enchant_id for e in enchantments):
        raise HTTPException(status_code=400, detail="Already enchanted with this")

    enchantments.append({"id": enchant_id, "name": enchant["name"], "desc": enchant["desc"],
                          "applied_at": datetime.now(timezone.utc).isoformat()})
    equip["enchantments"] = enchantments

    # Apply fortify if applicable
    if enchant_id == "fortify":
        for stat, val in equip.get("stat_bonus", {}).items():
            equip["stat_bonus"][stat] = int(val * 1.5)

    await db.starseed_characters.update_one(
        {"user_id": user["id"], "origin_id": origin_id},
        {"$set": {"equipment_collection": equipment, "gem_collection": gems}}
    )
    return {"equipment": equip, "enchantment_applied": enchant["name"]}


# ─── Equipment Catalog ───

@router.get("/starseed/worlds/equipment-catalog")
async def get_equipment_catalog():
    """Get all equipment and set definitions."""
    return {"equipment": EQUIPMENT_CATALOG, "sets": EQUIPMENT_SETS}


# ─── Portal Status ───

@router.get("/starseed/worlds/portals/{origin_id}")
async def get_portal_status(origin_id: str, user=Depends(get_current_user)):
    """Get portal unlock status for all realms for a character."""
    char = await db.starseed_characters.find_one(
        {"user_id": user["id"], "origin_id": origin_id}, {"_id": 0}
    )
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    portals = []
    for realm in MULTIVERSE_REALMS:
        unlocked = check_portal_unlocked(realm["id"], char)
        portal_info = PORTAL_REGISTRY.get(realm["id"], {})
        conds = portal_info.get("conditions", {})

        # Progress tracking
        progress = {}
        if conds:
            progress["level"] = {"required": conds.get("level", 0), "current": char.get("level", 1),
                                  "met": char.get("level", 1) >= conds.get("level", 0)}
            char_gems = [g["id"] for g in char.get("gem_collection", [])]
            gem_progress = []
            for rg in conds.get("gems", []):
                gem_def = get_gem_def(rg)
                gem_progress.append({"id": rg, "name": gem_def["name"] if gem_def else rg,
                                      "has": rg in char_gems})
            progress["gems"] = gem_progress

        portals.append({
            "realm_id": realm["id"],
            "realm_name": realm["name"],
            "color": realm["color"],
            "unlocked": unlocked,
            "description": portal_info.get("description", ""),
            "progress": progress,
        })
    return {"portals": portals}
