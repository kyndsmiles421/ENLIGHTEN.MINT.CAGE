"""
AI Product Generator — Tool Forge & Skill Generator
Behavior-driven triggers create sellable utility assets.

Tool Forge: Resonator Keys, Focus Lenses, Resource Harvesters
Skill Generator: Passive Buffs, Active Mantras, Skill Bottling
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone
from routes.consciousness import get_consciousness, level_from_consciousness_xp
import uuid
import random

router = APIRouter(prefix="/forge")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  TOOL DEFINITIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOOL_TYPES = {
    "resonator_key": {
        "name": "Resonator Key",
        "category": "tool",
        "description": "Consumable item to unlock high-tier frequency gates",
        "base_price": 8,
        "min_level": 3,
        "rarity_weights": {"common": 40, "uncommon": 30, "rare": 20, "epic": 8, "legendary": 2},
    },
    "focus_lens": {
        "name": "Focus Lens",
        "category": "tool",
        "description": "Extends Ultra fidelity duration without extra cost",
        "base_price": 12,
        "min_level": 3,
        "rarity_weights": {"common": 35, "uncommon": 30, "rare": 20, "epic": 10, "legendary": 5},
    },
    "resource_harvester": {
        "name": "Resource Harvester",
        "category": "tool",
        "description": "Automates Dust collection during idle periods",
        "base_price": 15,
        "min_level": 3,
        "rarity_weights": {"common": 30, "uncommon": 30, "rare": 25, "epic": 10, "legendary": 5},
    },
}

SKILL_TYPES = {
    "passive_buff": {
        "name": "Passive Buff",
        "category": "skill",
        "description": "Energy recovery speed or Broker's Eye market alerts",
        "base_price": 10,
        "min_level": 4,
        "rarity_weights": {"common": 35, "uncommon": 30, "rare": 20, "epic": 10, "legendary": 5},
    },
    "active_mantra": {
        "name": "Active Mantra",
        "category": "skill",
        "description": "Triggers temporary HUD multipliers or atmospheric shifts",
        "base_price": 7,
        "min_level": 4,
        "rarity_weights": {"common": 40, "uncommon": 25, "rare": 20, "epic": 10, "legendary": 5},
    },
    "skill_bottle": {
        "name": "Skill Bottle",
        "category": "skill",
        "description": "Package a mastered skill and sell it in the Trade Circle",
        "base_price": 20,
        "min_level": 5,
        "rarity_weights": {"common": 20, "uncommon": 30, "rare": 25, "epic": 15, "legendary": 10},
    },
}

ALL_FORGE_TYPES = {**TOOL_TYPES, **SKILL_TYPES}

RARITY_MULTIPLIER = {
    "common": 1.0,
    "uncommon": 1.5,
    "rare": 2.0,
    "epic": 3.0,
    "legendary": 5.0,
}

SOLFEGGIO = [174, 285, 396, 417, 432, 528, 639, 741, 852, 963]


def roll_rarity(weights: dict) -> str:
    """Weighted random rarity roll."""
    pool = []
    for rarity, weight in weights.items():
        pool.extend([rarity] * weight)
    return random.choice(pool)


async def _ai_forge_name(item_type: str, rarity: str, context: str) -> str:
    """Generate a creative name for a forged item using Gemini."""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        llm = LlmChat(api_key=EMERGENT_LLM_KEY)
        llm.with_model("gemini", "gemini-3-flash-preview")
        response = await llm.chat([
            UserMessage(content=(
                f"Generate ONE creative mystical name (2-4 words, no quotes) for a {rarity} "
                f"{item_type.replace('_', ' ')} in a cosmic wellness game. Context: {context}. "
                f"Return ONLY the name."
            ))
        ])
        return response.content.strip().strip('"').strip("'")[:60]
    except Exception as e:
        logger.error(f"AI forge name fallback: {e}")
        prefixes = {
            "common": ["Basic", "Simple", "Rough"],
            "uncommon": ["Polished", "Refined", "Tuned"],
            "rare": ["Radiant", "Harmonic", "Prismatic"],
            "epic": ["Celestial", "Astral", "Ethereal"],
            "legendary": ["Cosmic", "Transcendent", "Divine"],
        }
        prefix = random.choice(prefixes.get(rarity, ["Mystic"]))
        type_name = item_type.replace("_", " ").title()
        return f"{prefix} {type_name}"


async def _ai_skill_description(skill_type: str, rarity: str, context: str) -> str:
    """Generate a brief skill effect description using Gemini."""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        llm = LlmChat(api_key=EMERGENT_LLM_KEY)
        llm.with_model("gemini", "gemini-3-flash-preview")
        response = await llm.chat([
            UserMessage(content=(
                f"Describe in ONE sentence (max 20 words) the magical effect of a {rarity} "
                f"{skill_type.replace('_', ' ')} in a cosmic wellness RPG. Context: {context}. "
                f"Return ONLY the description."
            ))
        ])
        return response.content.strip().strip('"').strip("'")[:120]
    except Exception as e:
        logger.error(f"AI skill desc fallback: {e}")
        return f"A {rarity} {skill_type.replace('_', ' ')} radiating with cosmic energy."


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  TOOL FORGE — Create functional items
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/tools/types")
async def list_tool_types(user=Depends(get_current_user)):
    """List available tool types with consciousness level requirements."""
    c = await get_consciousness(user["id"])
    level = level_from_consciousness_xp(c.get("xp", 0))
    tools = []
    for key, t in TOOL_TYPES.items():
        tools.append({
            "id": key,
            **t,
            "locked": level < t["min_level"],
            "user_level": level,
        })
    return {"tools": tools, "consciousness_level": level}


@router.post("/tools/create")
async def forge_tool(data: dict = Body(...), user=Depends(get_current_user)):
    """Forge a new tool. Requires consciousness level 3+."""
    tool_type = data.get("type", "")
    context = data.get("context", "quest milestone")

    if tool_type not in TOOL_TYPES:
        raise HTTPException(400, f"Invalid tool type. Options: {list(TOOL_TYPES.keys())}")

    user_id = user["id"]
    tool_def = TOOL_TYPES[tool_type]

    # Check consciousness level
    c = await get_consciousness(user_id)
    level = level_from_consciousness_xp(c.get("xp", 0))
    if level < tool_def["min_level"]:
        raise HTTPException(403, f"Requires Consciousness Level {tool_def['min_level']} ({LEVEL_NAMES.get(tool_def['min_level'], '')})")

    # Check cost (25 Dust per forge attempt)
    forge_cost = 25
    u = await db.users.find_one({"id": user_id}, {"_id": 0, "user_dust_balance": 1})
    dust = (u or {}).get("user_dust_balance", 0)
    if dust < forge_cost:
        raise HTTPException(400, f"Forging requires {forge_cost} Dust. You have {dust}.")

    # Roll rarity
    rarity = roll_rarity(tool_def["rarity_weights"])
    name = await _ai_forge_name(tool_type, rarity, context)

    # Build tool properties based on type
    properties = {}
    if tool_type == "resonator_key":
        properties = {
            "frequency_gate": random.choice(SOLFEGGIO),
            "uses": 1 + (1 if rarity in ("epic", "legendary") else 0),
            "potency": RARITY_MULTIPLIER[rarity],
        }
    elif tool_type == "focus_lens":
        base_hours = {"common": 2, "uncommon": 4, "rare": 8, "epic": 16, "legendary": 24}
        properties = {
            "extend_hours": base_hours.get(rarity, 2),
            "fidelity_target": "ultra",
        }
    elif tool_type == "resource_harvester":
        base_rate = {"common": 1, "uncommon": 2, "rare": 3, "epic": 5, "legendary": 8}
        properties = {
            "dust_per_hour": base_rate.get(rarity, 1),
            "duration_hours": 12 + (12 if rarity in ("epic", "legendary") else 0),
        }

    price = int(tool_def["base_price"] * RARITY_MULTIPLIER[rarity])

    item_id = str(uuid.uuid4())
    item = {
        "id": item_id,
        "type": tool_type,
        "category": "tool",
        "name": name,
        "description": tool_def["description"],
        "rarity": rarity,
        "properties": properties,
        "base_price": price,
        "creator_id": user_id,
        "listed": False,
        "forged_at": datetime.now(timezone.utc).isoformat(),
        "context": context,
    }

    await db.forge_items.insert_one({**item})
    await db.users.update_one({"id": user_id}, {"$inc": {"user_dust_balance": -forge_cost}})

    # Award consciousness XP for forging
    from routes.consciousness import ACTIVITY_XP
    xp = ACTIVITY_XP.get("forge_creation", 40)
    await db.users.update_one({"id": user_id}, {
        "$inc": {"consciousness.xp": xp},
        "$push": {"consciousness.activity_log": {
            "$each": [{"activity": "forge_creation", "xp": xp, "context": name, "timestamp": datetime.now(timezone.utc).isoformat()}],
            "$slice": -50,
        }},
    })

    return {
        "item": item,
        "forge_cost": forge_cost,
        "consciousness_xp_gained": xp,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  SKILL GENERATOR — Create skills & buffs
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/skills/types")
async def list_skill_types(user=Depends(get_current_user)):
    """List available skill types with consciousness level requirements."""
    c = await get_consciousness(user["id"])
    level = level_from_consciousness_xp(c.get("xp", 0))
    skills = []
    for key, s in SKILL_TYPES.items():
        skills.append({
            "id": key,
            **s,
            "locked": level < s["min_level"],
            "user_level": level,
        })
    return {"skills": skills, "consciousness_level": level}


@router.post("/skills/generate")
async def generate_skill(data: dict = Body(...), user=Depends(get_current_user)):
    """Generate a new skill. Requires consciousness level 4+ (5 for Skill Bottling)."""
    skill_type = data.get("type", "")
    context = data.get("context", "interaction pattern analysis")

    if skill_type not in SKILL_TYPES:
        raise HTTPException(400, f"Invalid skill type. Options: {list(SKILL_TYPES.keys())}")

    user_id = user["id"]
    skill_def = SKILL_TYPES[skill_type]

    # Check consciousness level
    c = await get_consciousness(user_id)
    level = level_from_consciousness_xp(c.get("xp", 0))
    if level < skill_def["min_level"]:
        raise HTTPException(403, f"Requires Consciousness Level {skill_def['min_level']}")

    # Skill generation costs Credits
    gen_cost = 3
    u = await db.users.find_one({"id": user_id}, {"_id": 0, "user_credit_balance": 1})
    credits = (u or {}).get("user_credit_balance", 0)
    if credits < gen_cost:
        raise HTTPException(400, f"Skill generation requires {gen_cost} Credits. You have {credits}.")

    # Roll rarity
    rarity = roll_rarity(skill_def["rarity_weights"])
    name = await _ai_forge_name(skill_type, rarity, context)
    effect_desc = await _ai_skill_description(skill_type, rarity, context)

    # Build skill properties
    properties = {}
    if skill_type == "passive_buff":
        buff_types = ["energy_recovery", "dust_bonus", "xp_boost", "market_alert", "meditation_depth"]
        buff = random.choice(buff_types)
        magnitude = {"common": 5, "uncommon": 10, "rare": 15, "epic": 25, "legendary": 40}
        properties = {
            "buff_type": buff,
            "magnitude_pct": magnitude.get(rarity, 5),
            "duration_hours": 24 * (1 + list(RARITY_MULTIPLIER.keys()).index(rarity)),
        }
    elif skill_type == "active_mantra":
        effects = ["hud_multiplier", "atmosphere_shift", "xp_surge", "dust_rain", "aura_flash"]
        effect = random.choice(effects)
        power = {"common": 1.2, "uncommon": 1.5, "rare": 2.0, "epic": 3.0, "legendary": 5.0}
        properties = {
            "effect": effect,
            "power_multiplier": power.get(rarity, 1.2),
            "duration_minutes": 15 * (1 + list(RARITY_MULTIPLIER.keys()).index(rarity)),
            "cooldown_hours": max(1, 6 - list(RARITY_MULTIPLIER.keys()).index(rarity)),
        }
    elif skill_type == "skill_bottle":
        properties = {
            "packaged_skill": context or "mastered technique",
            "potency": RARITY_MULTIPLIER[rarity],
            "transferable": True,
            "uses": 1 if rarity in ("common", "uncommon") else 3,
        }

    price = int(skill_def["base_price"] * RARITY_MULTIPLIER[rarity])

    item_id = str(uuid.uuid4())
    item = {
        "id": item_id,
        "type": skill_type,
        "category": "skill",
        "name": name,
        "description": effect_desc,
        "rarity": rarity,
        "properties": properties,
        "base_price": price,
        "creator_id": user_id,
        "listed": False,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "context": context,
    }

    await db.forge_items.insert_one({**item})
    await db.users.update_one({"id": user_id}, {"$inc": {"user_credit_balance": -gen_cost}})

    # Award consciousness XP
    from routes.consciousness import ACTIVITY_XP
    xp = ACTIVITY_XP.get("skill_generation", 45)
    await db.users.update_one({"id": user_id}, {
        "$inc": {"consciousness.xp": xp},
        "$push": {"consciousness.activity_log": {
            "$each": [{"activity": "skill_generation", "xp": xp, "context": name, "timestamp": datetime.now(timezone.utc).isoformat()}],
            "$slice": -50,
        }},
    })

    return {
        "item": item,
        "gen_cost": gen_cost,
        "consciousness_xp_gained": xp,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  INVENTORY & LISTING
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/inventory")
async def forge_inventory(category: str = "", user=Depends(get_current_user)):
    """Get user's forged items inventory."""
    query = {"creator_id": user["id"]}
    if category:
        query["category"] = category
    items = await db.forge_items.find(query, {"_id": 0}).sort("forged_at", -1).to_list(50)
    # Fix sort for skills (which use generated_at)
    items.sort(key=lambda x: x.get("forged_at") or x.get("generated_at", ""), reverse=True)
    return {"items": items, "count": len(items)}


@router.post("/list")
async def list_forge_item(data: dict = Body(...), user=Depends(get_current_user)):
    """List a forged item on the Trade Circle marketplace."""
    item_id = data.get("item_id", "")
    item = await db.forge_items.find_one(
        {"id": item_id, "creator_id": user["id"]}, {"_id": 0}
    )
    if not item:
        raise HTTPException(404, "Item not found in your inventory")
    if item.get("listed"):
        raise HTTPException(400, "Item already listed")

    await db.forge_items.update_one({"id": item_id}, {"$set": {"listed": True}})

    # Also add to content_assets for marketplace visibility
    asset = {
        "id": item_id,
        "type": f"forge_{item['type']}",
        "name": item["name"],
        "description": item.get("description", ""),
        "content": {"rarity": item["rarity"], "properties": item.get("properties", {}), "forge_type": item["type"]},
        "base_price": item["base_price"],
        "source_section": "AI Forge",
        "creator_id": user["id"],
        "activity_context": f"Forged: {item['name']}",
        "listed": True,
        "purchases": 0,
        "rating": 0,
        "auto_generated": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.content_assets.insert_one({**asset})

    return {"listed": True, "item": item["name"], "price": item["base_price"]}


@router.post("/use")
async def use_forge_item(data: dict = Body(...), user=Depends(get_current_user)):
    """Use/consume a forged item from inventory."""
    item_id = data.get("item_id", "")
    item = await db.forge_items.find_one(
        {"id": item_id, "creator_id": user["id"], "listed": False}, {"_id": 0}
    )
    if not item:
        raise HTTPException(404, "Item not found or already listed")

    user_id = user["id"]
    effect = {}

    if item["type"] == "resonator_key":
        effect = {"unlocked_gate": item["properties"].get("frequency_gate", 528), "uses_remaining": item["properties"].get("uses", 1) - 1}
    elif item["type"] == "focus_lens":
        extend_hours = item["properties"].get("extend_hours", 2)
        from datetime import timedelta
        u = await db.users.find_one({"id": user_id}, {"_id": 0, "fidelity_boost": 1})
        boost = (u or {}).get("fidelity_boost", {})
        now = datetime.now(timezone.utc)
        if boost and boost.get("expires_at"):
            try:
                expires = datetime.fromisoformat(boost["expires_at"])
                new_exp = (expires if expires > now else now) + timedelta(hours=extend_hours)
            except (ValueError, TypeError):
                new_exp = now + timedelta(hours=extend_hours)
        else:
            new_exp = now + timedelta(hours=extend_hours)
        await db.users.update_one({"id": user_id}, {"$set": {
            "fidelity_boost.expires_at": new_exp.isoformat(),
            "fidelity_boost.level": "ultra",
        }})
        effect = {"extended_hours": extend_hours, "new_expiry": new_exp.isoformat()}
    elif item["type"] == "resource_harvester":
        dust_per_hour = item["properties"].get("dust_per_hour", 1)
        duration = item["properties"].get("duration_hours", 12)
        total_dust = dust_per_hour * duration
        await db.users.update_one({"id": user_id}, {"$inc": {"user_dust_balance": total_dust}})
        effect = {"dust_collected": total_dust, "rate": dust_per_hour, "hours": duration}
    elif item["type"] == "passive_buff":
        effect = {"buff_activated": item["properties"].get("buff_type", "generic"), "duration_hours": item["properties"].get("duration_hours", 24)}
    elif item["type"] == "active_mantra":
        effect = {"effect_triggered": item["properties"].get("effect", "generic"), "multiplier": item["properties"].get("power_multiplier", 1.2)}
    elif item["type"] == "skill_bottle":
        effect = {"skill_transferred": item["properties"].get("packaged_skill", "technique")}

    # Remove consumed item
    await db.forge_items.delete_one({"id": item_id})

    return {"used": True, "item_name": item["name"], "type": item["type"], "effect": effect}


# Level name helper used in error messages
LEVEL_NAMES = {1: "Physical", 2: "Emotional", 3: "Mental", 4: "Intuitive", 5: "Pure Consciousness"}
