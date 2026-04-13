"""
P1 Gaming Routes — Resource Alchemy, Gravity Well Exchange, Cryptic Quest Nodes
Connects to the Sovereign Engine economy (Dust, Fans, Phi Cap)
"""

from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone
from utils.master_transmuter import TRANSMUTER, TIERS, PHI
import uuid
import random
import math

router = APIRouter(prefix="/gaming", tags=["P1 Gaming"])


# ═══ RESOURCE ALCHEMY ═══
# Weight-based puzzle: combine resources to forge higher-tier items

ELEMENTS = {
    "iron": {"weight": 1, "tier": 0, "color": "#94A3B8"},
    "copper": {"weight": 2, "tier": 0, "color": "#F97316"},
    "silver": {"weight": 5, "tier": 1, "color": "#E2E8F0"},
    "gold": {"weight": 13, "tier": 2, "color": "#FCD34D"},
    "crystal": {"weight": 34, "tier": 3, "color": "#A855F7"},
    "obsidian": {"weight": 89, "tier": 4, "color": "#1E293B"},
    "phi_stone": {"weight": 144, "tier": 5, "color": "#2DD4BF"},
}

RECIPES = [
    {"inputs": ["iron", "iron", "copper"], "output": "silver", "dust_reward": 15},
    {"inputs": ["silver", "copper", "copper"], "output": "gold", "dust_reward": 30},
    {"inputs": ["gold", "silver", "silver"], "output": "crystal", "dust_reward": 60},
    {"inputs": ["crystal", "gold", "gold"], "output": "obsidian", "dust_reward": 120},
    {"inputs": ["obsidian", "crystal", "crystal"], "output": "phi_stone", "dust_reward": 250},
]


@router.get("/alchemy/state")
async def get_alchemy_state(user=Depends(get_current_user)):
    """Get player's alchemy inventory and available recipes."""
    inv = await db.alchemy_inventory.find_one({"user_id": user["id"]}, {"_id": 0})
    if not inv:
        inv = {
            "user_id": user["id"],
            "resources": {"iron": 10, "copper": 5},
            "forged_count": 0,
            "highest_tier": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.alchemy_inventory.insert_one(inv)
        inv.pop("_id", None)

    return {
        "inventory": inv["resources"],
        "forged_count": inv.get("forged_count", 0),
        "highest_tier": inv.get("highest_tier", 0),
        "elements": ELEMENTS,
        "recipes": RECIPES,
    }


@router.post("/alchemy/forge")
async def forge_resource(data: dict = Body(...), user=Depends(get_current_user)):
    """Combine resources to forge a higher-tier element."""
    recipe_idx = data.get("recipe_index", 0)
    if recipe_idx < 0 or recipe_idx >= len(RECIPES):
        raise HTTPException(400, "Invalid recipe")

    recipe = RECIPES[recipe_idx]
    inv = await db.alchemy_inventory.find_one({"user_id": user["id"]}, {"_id": 0})
    if not inv:
        raise HTTPException(400, "No inventory found")

    resources = inv.get("resources", {})
    needed = {}
    for item in recipe["inputs"]:
        needed[item] = needed.get(item, 0) + 1

    for item, count in needed.items():
        if resources.get(item, 0) < count:
            raise HTTPException(400, f"Not enough {item}. Need {count}, have {resources.get(item, 0)}")

    # Deduct inputs
    updates = {}
    for item, count in needed.items():
        updates[f"resources.{item}"] = -count
    # Add output
    output = recipe["output"]
    updates[f"resources.{output}"] = 1

    output_tier = ELEMENTS[output]["tier"]
    await db.alchemy_inventory.update_one(
        {"user_id": user["id"]},
        {
            "$inc": {**updates, "forged_count": 1},
            "$max": {"highest_tier": output_tier},
        },
    )

    # Award dust
    dust = recipe["dust_reward"]
    await db.hub_wallets.update_one(
        {"user_id": user["id"]},
        {"$inc": {"dust": dust, "total_dust_earned": dust}},
        upsert=True,
    )

    await db.transmuter_log.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "type": "alchemy_forge",
        "recipe": recipe,
        "output": output,
        "dust_earned": dust,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    updated = await db.alchemy_inventory.find_one({"user_id": user["id"]}, {"_id": 0})
    return {
        "forged": output,
        "tier": output_tier,
        "dust_earned": dust,
        "inventory": updated["resources"],
        "forged_count": updated.get("forged_count", 0),
    }


@router.post("/alchemy/mine")
async def mine_resources(user=Depends(get_current_user)):
    """Mine random base resources (daily action)."""
    mined = {
        "iron": random.randint(2, 5),
        "copper": random.randint(1, 3),
    }
    if random.random() < 0.2:
        mined["silver"] = 1

    updates = {f"resources.{k}": v for k, v in mined.items()}
    await db.alchemy_inventory.update_one(
        {"user_id": user["id"]},
        {"$inc": updates},
        upsert=True,
    )

    dust = 5
    await db.hub_wallets.update_one(
        {"user_id": user["id"]},
        {"$inc": {"dust": dust, "total_dust_earned": dust}},
        upsert=True,
    )

    return {"mined": mined, "dust_earned": dust}


# ═══ GRAVITY WELL EXCHANGE ═══
# Market visualization: buy/sell resources with Phi-weighted pricing

@router.get("/gravity-well/market")
async def get_market(user=Depends(get_current_user)):
    """Get current market prices for all elements."""
    market = []
    for name, elem in ELEMENTS.items():
        base_price = elem["weight"]
        fluctuation = math.sin(hash(name + datetime.now(timezone.utc).strftime("%H")) * PHI) * 0.2
        price = max(1, int(base_price * (1 + fluctuation)))
        market.append({
            "element": name,
            "price_dust": price,
            "weight": elem["weight"],
            "tier": elem["tier"],
            "color": elem["color"],
            "trend": "up" if fluctuation > 0 else "down",
        })
    return {"market": market, "phi_index": round(PHI, 4)}


@router.post("/gravity-well/trade")
async def gravity_trade(data: dict = Body(...), user=Depends(get_current_user)):
    """Buy or sell an element on the Gravity Well market."""
    action = data.get("action", "buy")
    element = data.get("element", "iron")
    quantity = data.get("quantity", 1)

    if element not in ELEMENTS or quantity <= 0 or quantity > 100:
        raise HTTPException(400, "Invalid trade parameters")

    base_price = ELEMENTS[element]["weight"]
    fluctuation = math.sin(hash(element + datetime.now(timezone.utc).strftime("%H")) * PHI) * 0.2
    price = max(1, int(base_price * (1 + fluctuation)))
    total_cost = price * quantity

    wallet = await db.hub_wallets.find_one({"user_id": user["id"]}, {"_id": 0})
    inv = await db.alchemy_inventory.find_one({"user_id": user["id"]}, {"_id": 0})

    if action == "buy":
        if not wallet or wallet.get("dust", 0) < total_cost:
            raise HTTPException(400, f"Not enough Dust. Need {total_cost}")
        await db.hub_wallets.update_one({"user_id": user["id"]}, {"$inc": {"dust": -total_cost}})
        await db.alchemy_inventory.update_one(
            {"user_id": user["id"]},
            {"$inc": {f"resources.{element}": quantity}},
            upsert=True,
        )
    elif action == "sell":
        if not inv or inv.get("resources", {}).get(element, 0) < quantity:
            raise HTTPException(400, f"Not enough {element} to sell")
        sell_price = int(total_cost * 0.8)
        await db.alchemy_inventory.update_one(
            {"user_id": user["id"]},
            {"$inc": {f"resources.{element}": -quantity}},
        )
        await db.hub_wallets.update_one(
            {"user_id": user["id"]},
            {"$inc": {"dust": sell_price, "total_dust_earned": sell_price}},
        )
        total_cost = sell_price

    updated_wallet = await db.hub_wallets.find_one({"user_id": user["id"]}, {"_id": 0})
    updated_inv = await db.alchemy_inventory.find_one({"user_id": user["id"]}, {"_id": 0})

    return {
        "action": action,
        "element": element,
        "quantity": quantity,
        "price_per_unit": price,
        "total": total_cost,
        "dust_balance": updated_wallet.get("dust", 0),
        "inventory": updated_inv.get("resources", {}),
    }


# ═══ CRYPTIC QUEST NODES ═══
# Oracle-based puzzle nodes: solve divination riddles to unlock rewards

QUEST_NODES = [
    {"id": "node_alpha", "name": "The Mirror Gate", "element": "Water", "difficulty": 1, "dust_reward": 20, "hint": "What reflects truth but holds no form?"},
    {"id": "node_beta", "name": "The Spiral Path", "element": "Air", "difficulty": 2, "dust_reward": 40, "hint": "The golden ratio curves through all creation."},
    {"id": "node_gamma", "name": "The Obsidian Forge", "element": "Fire", "difficulty": 3, "dust_reward": 80, "hint": "In darkness, the strongest steel is tempered."},
    {"id": "node_delta", "name": "The Root Chamber", "element": "Earth", "difficulty": 4, "dust_reward": 150, "hint": "432Hz — the frequency of the ancient soil."},
    {"id": "node_omega", "name": "The Sovereign Throne", "element": "Ether", "difficulty": 5, "dust_reward": 300, "hint": "Only the Architect sees the full pattern."},
]

ANSWERS = {
    "node_alpha": ["water", "mirror", "reflection"],
    "node_beta": ["phi", "1.618", "golden ratio", "fibonacci", "spiral"],
    "node_gamma": ["obsidian", "forge", "fire", "steel", "darkness"],
    "node_delta": ["432", "earth", "root", "frequency", "soil"],
    "node_omega": ["architect", "sovereign", "pattern", "steven", "master"],
}


@router.get("/quest/nodes")
async def get_quest_nodes(user=Depends(get_current_user)):
    """Get available quest nodes and player progress."""
    progress = await db.quest_progress.find_one({"user_id": user["id"]}, {"_id": 0})
    solved = (progress or {}).get("solved_nodes", [])

    nodes = []
    for node in QUEST_NODES:
        nodes.append({
            **node,
            "solved": node["id"] in solved,
            "locked": node["difficulty"] > len(solved) + 1,
        })

    return {
        "nodes": nodes,
        "total_solved": len(solved),
        "total_nodes": len(QUEST_NODES),
    }


@router.post("/quest/solve")
async def solve_quest_node(data: dict = Body(...), user=Depends(get_current_user)):
    """Attempt to solve a quest node with an answer."""
    node_id = data.get("node_id", "")
    answer = data.get("answer", "").strip().lower()

    valid_answers = ANSWERS.get(node_id)
    if not valid_answers:
        raise HTTPException(400, "Unknown quest node")

    progress = await db.quest_progress.find_one({"user_id": user["id"]}, {"_id": 0})
    solved = (progress or {}).get("solved_nodes", [])

    if node_id in solved:
        return {"correct": True, "already_solved": True, "message": "Already completed"}

    node = next((n for n in QUEST_NODES if n["id"] == node_id), None)
    if not node:
        raise HTTPException(400, "Node not found")

    if node["difficulty"] > len(solved) + 1:
        raise HTTPException(400, "Node is locked. Solve previous nodes first.")

    correct = any(a in answer for a in valid_answers)

    if correct:
        dust = node["dust_reward"]
        await db.quest_progress.update_one(
            {"user_id": user["id"]},
            {"$addToSet": {"solved_nodes": node_id}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
        await db.hub_wallets.update_one(
            {"user_id": user["id"]},
            {"$inc": {"dust": dust, "total_dust_earned": dust}},
            upsert=True,
        )
        await db.transmuter_log.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "type": "quest_solved",
            "node_id": node_id,
            "dust_earned": dust,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        return {"correct": True, "dust_earned": dust, "node_name": node["name"]}
    else:
        return {"correct": False, "hint": node["hint"]}
