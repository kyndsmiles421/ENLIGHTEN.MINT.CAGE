"""
seed_hunting.py — The Daily Coordinate Hunt

SEED HUNTING PROTOCOL
---------------------
Daily challenges where users race to find specific rare coordinates.
First to mint a seed at the target 36-bit address wins exclusive rewards.

Game Mechanics:
- Each hunt has a TARGET ADDRESS (partially revealed)
- Players must navigate to matching coordinates
- First to mint wins LEGENDARY tier bonus
- Top 10 get EPIC tier rewards
- All participants get participation XP

Hunt Types:
- EXACT: Match exact 36-bit address (extremely rare)
- PATTERN: Match specific bit patterns (e.g., palindrome)
- DEPTH: Reach specific depth with any address
- LANGUAGE: Mint in specific sacred language
- HEXAGRAM: Include specific sacred hexagrams in path
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import hashlib
import random
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/seed-hunt", tags=["seed-hunting"])

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "cosmic_collective")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
hunts_collection = db["seed_hunts"]
hunt_entries_collection = db["hunt_entries"]
hunt_rewards_collection = db["hunt_rewards"]

# ═══════════════════════════════════════════════════════════════════════════
# HUNT CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

HUNT_TYPES = {
    "EXACT": {
        "name": "Coordinate Lock",
        "description": "Match the exact 36-bit target address",
        "difficulty": "LEGENDARY",
        "base_xp": 500,
        "winner_bonus": 2000,
    },
    "PATTERN": {
        "name": "Pattern Seeker",
        "description": "Find an address matching the required bit pattern",
        "difficulty": "EPIC",
        "base_xp": 200,
        "winner_bonus": 1000,
    },
    "DEPTH": {
        "name": "Deep Diver",
        "description": "Reach the target depth level",
        "difficulty": "RARE",
        "base_xp": 100,
        "winner_bonus": 500,
    },
    "LANGUAGE": {
        "name": "Cultural Quest",
        "description": "Mint a seed in the sacred target language",
        "difficulty": "UNCOMMON",
        "base_xp": 75,
        "winner_bonus": 300,
    },
    "HEXAGRAM": {
        "name": "Hexagram Hunter",
        "description": "Include the target sacred hexagram in your path",
        "difficulty": "RARE",
        "base_xp": 150,
        "winner_bonus": 600,
    },
}

# Sacred languages and hexagrams for hunt targets
SACRED_LANGUAGES = ['sa', 'lkt', 'dak']  # Sanskrit, Lakota, Dakota
SACRED_HEXAGRAMS = [1, 2, 11, 12, 63, 64, 29, 30, 15]

# ═══════════════════════════════════════════════════════════════════════════
# MODELS
# ═══════════════════════════════════════════════════════════════════════════

class HuntTarget(BaseModel):
    """The target criteria for a hunt"""
    hunt_type: str
    target_address: Optional[str] = None  # For EXACT hunts
    target_pattern: Optional[str] = None  # For PATTERN hunts (regex-like)
    target_depth: Optional[int] = None  # For DEPTH hunts
    target_language: Optional[str] = None  # For LANGUAGE hunts
    target_hexagram: Optional[int] = None  # For HEXAGRAM hunts
    revealed_bits: Optional[str] = None  # Partially revealed address (for hints)

class HuntResponse(BaseModel):
    """Response model for a hunt"""
    hunt_id: str
    hunt_type: str
    hunt_name: str
    description: str
    difficulty: str
    target: dict
    hints: List[str]
    start_time: str
    end_time: str
    time_remaining_seconds: int
    total_entries: int
    winners: List[dict]
    rewards: dict
    status: str  # ACTIVE, COMPLETED, UPCOMING

class HuntEntryRequest(BaseModel):
    """Request to submit a hunt entry"""
    seed_id: str
    hunter_id: str

class HuntEntryResponse(BaseModel):
    """Response for hunt entry submission"""
    success: bool
    match: bool
    rank: Optional[int] = None
    xp_earned: int
    message: str

class LeaderboardEntry(BaseModel):
    """Leaderboard entry"""
    rank: int
    hunter_id: str
    seed_id: str
    timestamp: str
    xp_earned: int

# ═══════════════════════════════════════════════════════════════════════════
# HUNT GENERATION
# ═══════════════════════════════════════════════════════════════════════════

def generate_random_address() -> str:
    """Generate a random 36-bit address"""
    segments = []
    for i in range(6):  # 6 depth levels max
        hex_bits = ''.join(random.choice('01') for _ in range(6))
        lang_bits = ''.join(random.choice('01') for _ in range(4))
        segments.append(f"{hex_bits}|{lang_bits}")
    return '|'.join(segments)

def generate_revealed_address(full_address: str, reveal_percent: float = 0.3) -> str:
    """Partially reveal an address (replace some bits with '?')"""
    chars = list(full_address)
    bit_indices = [i for i, c in enumerate(chars) if c in '01']
    hide_count = int(len(bit_indices) * (1 - reveal_percent))
    hide_indices = random.sample(bit_indices, hide_count)
    
    for idx in hide_indices:
        chars[idx] = '?'
    
    return ''.join(chars)

def generate_hunt_target(hunt_type: str) -> HuntTarget:
    """Generate target criteria based on hunt type"""
    if hunt_type == "EXACT":
        full_address = generate_random_address()
        return HuntTarget(
            hunt_type=hunt_type,
            target_address=full_address,
            revealed_bits=generate_revealed_address(full_address, 0.25),
        )
    elif hunt_type == "PATTERN":
        # Generate a pattern like "palindrome" or "alternating"
        patterns = ["010101", "101010", "111000", "000111"]
        return HuntTarget(
            hunt_type=hunt_type,
            target_pattern=random.choice(patterns),
        )
    elif hunt_type == "DEPTH":
        return HuntTarget(
            hunt_type=hunt_type,
            target_depth=random.randint(3, 5),  # L3, L4, or L5
        )
    elif hunt_type == "LANGUAGE":
        return HuntTarget(
            hunt_type=hunt_type,
            target_language=random.choice(SACRED_LANGUAGES),
        )
    elif hunt_type == "HEXAGRAM":
        return HuntTarget(
            hunt_type=hunt_type,
            target_hexagram=random.choice(SACRED_HEXAGRAMS),
        )
    else:
        raise ValueError(f"Unknown hunt type: {hunt_type}")

def generate_hints(target: HuntTarget) -> List[str]:
    """Generate hints for the hunt"""
    hints = []
    
    if target.hunt_type == "EXACT":
        hints.append(f"Target address partially revealed: {target.revealed_bits}")
        hints.append("The full address will be revealed in the final hour")
    elif target.hunt_type == "PATTERN":
        hints.append(f"Look for the pattern: {target.target_pattern}")
        hints.append("This pattern appears in hexagram 63 (Source State)")
    elif target.hunt_type == "DEPTH":
        hints.append(f"Descend to Level {target.target_depth}")
        hints.append(f"You'll be navigating through {9**target.target_depth:,} possible states")
    elif target.hunt_type == "LANGUAGE":
        lang_names = {'sa': 'Sanskrit', 'lkt': 'Lakota', 'dak': 'Dakota'}
        hints.append(f"Mint your seed in {lang_names.get(target.target_language, target.target_language)}")
        hints.append("Ancient languages carry deeper resonance")
    elif target.hunt_type == "HEXAGRAM":
        hints.append(f"Include Hexagram #{target.target_hexagram} in your journey")
        hints.append("Sacred hexagrams amplify your seed's rarity")
    
    return hints

async def create_daily_hunt() -> dict:
    """Create a new daily hunt"""
    # Rotate hunt types based on day
    hunt_types = list(HUNT_TYPES.keys())
    day_of_year = datetime.now(timezone.utc).timetuple().tm_yday
    hunt_type = hunt_types[day_of_year % len(hunt_types)]
    
    config = HUNT_TYPES[hunt_type]
    target = generate_hunt_target(hunt_type)
    hints = generate_hints(target)
    
    now = datetime.now(timezone.utc)
    # Hunt runs from midnight to midnight UTC
    start_time = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end_time = start_time + timedelta(days=1)
    
    hunt_id = hashlib.sha256(f"{start_time.isoformat()}:{hunt_type}".encode()).hexdigest()[:16]
    
    hunt_doc = {
        "hunt_id": hunt_id,
        "hunt_type": hunt_type,
        "hunt_name": config["name"],
        "description": config["description"],
        "difficulty": config["difficulty"],
        "target": target.model_dump(),
        "hints": hints,
        "start_time": start_time.isoformat(),
        "end_time": end_time.isoformat(),
        "base_xp": config["base_xp"],
        "winner_bonus": config["winner_bonus"],
        "winners": [],
        "total_entries": 0,
        "status": "ACTIVE" if start_time <= now < end_time else "COMPLETED",
        "created_at": now.isoformat(),
    }
    
    # Upsert (update if exists, insert if not)
    await hunts_collection.update_one(
        {"hunt_id": hunt_id},
        {"$setOnInsert": hunt_doc},
        upsert=True
    )
    
    return hunt_doc

# ═══════════════════════════════════════════════════════════════════════════
# MATCHING LOGIC
# ═══════════════════════════════════════════════════════════════════════════

def check_hunt_match(seed: dict, target: HuntTarget) -> bool:
    """Check if a seed matches the hunt target"""
    if target.hunt_type == "EXACT":
        # Exact address match
        return seed.get("address_36bit") == target.target_address
    
    elif target.hunt_type == "PATTERN":
        # Check if pattern exists in address
        address = seed.get("address_36bit", "").replace("|", "")
        return target.target_pattern in address
    
    elif target.hunt_type == "DEPTH":
        # Check depth level
        return seed.get("depth", 0) >= target.target_depth
    
    elif target.hunt_type == "LANGUAGE":
        # Check linguistic state
        return seed.get("linguistic_state") == target.target_language
    
    elif target.hunt_type == "HEXAGRAM":
        # Check if target hexagram is in path
        path = seed.get("path", [])
        return any(p.get("hexagram_number") == target.target_hexagram for p in path)
    
    return False

# ═══════════════════════════════════════════════════════════════════════════
# ROUTES
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/current", response_model=HuntResponse)
async def get_current_hunt():
    """Get the current active hunt (creates one if none exists)"""
    try:
        now = datetime.now(timezone.utc)
        
        # Find today's hunt
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        hunt = await hunts_collection.find_one({
            "start_time": {"$lte": now.isoformat()},
            "end_time": {"$gt": now.isoformat()},
        }, {"_id": 0})
        
        if not hunt:
            # Create new hunt
            hunt = await create_daily_hunt()
        
        # Calculate time remaining
        end_time = datetime.fromisoformat(hunt["end_time"].replace('Z', '+00:00'))
        time_remaining = max(0, int((end_time - now).total_seconds()))
        
        # Update status
        if time_remaining <= 0:
            hunt["status"] = "COMPLETED"
        
        return HuntResponse(
            hunt_id=hunt["hunt_id"],
            hunt_type=hunt["hunt_type"],
            hunt_name=hunt["hunt_name"],
            description=hunt["description"],
            difficulty=hunt["difficulty"],
            target=hunt["target"],
            hints=hunt["hints"],
            start_time=hunt["start_time"],
            end_time=hunt["end_time"],
            time_remaining_seconds=time_remaining,
            total_entries=hunt.get("total_entries", 0),
            winners=hunt.get("winners", [])[:10],  # Top 10
            rewards={
                "base_xp": hunt["base_xp"],
                "winner_bonus": hunt["winner_bonus"],
            },
            status=hunt["status"],
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get hunt: {str(e)}")

@router.post("/submit", response_model=HuntEntryResponse)
async def submit_hunt_entry(request: HuntEntryRequest):
    """Submit a seed as a hunt entry"""
    try:
        now = datetime.now(timezone.utc)
        
        # Get current hunt
        hunt = await hunts_collection.find_one({
            "start_time": {"$lte": now.isoformat()},
            "end_time": {"$gt": now.isoformat()},
        })
        
        if not hunt:
            return HuntEntryResponse(
                success=False,
                match=False,
                xp_earned=0,
                message="No active hunt found",
            )
        
        # Get the seed from seeds collection
        seeds_collection = db["crystalline_seeds"]
        seed = await seeds_collection.find_one({"seed_id": request.seed_id})
        
        if not seed:
            return HuntEntryResponse(
                success=False,
                match=False,
                xp_earned=0,
                message="Seed not found",
            )
        
        # Check if already submitted
        existing_entry = await hunt_entries_collection.find_one({
            "hunt_id": hunt["hunt_id"],
            "seed_id": request.seed_id,
        })
        
        if existing_entry:
            return HuntEntryResponse(
                success=False,
                match=existing_entry.get("match", False),
                rank=existing_entry.get("rank"),
                xp_earned=0,
                message="This seed has already been submitted to this hunt",
            )
        
        # Check if this seed matches the hunt target
        target = HuntTarget(**hunt["target"])
        is_match = check_hunt_match(seed, target)
        
        # Calculate XP
        xp_earned = hunt["base_xp"] if is_match else hunt["base_xp"] // 4  # Participation XP
        
        # Determine rank (if match)
        rank = None
        if is_match:
            current_winners = hunt.get("winners", [])
            rank = len(current_winners) + 1
            
            # Winner bonus for first place
            if rank == 1:
                xp_earned += hunt["winner_bonus"]
            elif rank <= 3:
                xp_earned += hunt["winner_bonus"] // 2
            elif rank <= 10:
                xp_earned += hunt["winner_bonus"] // 4
        
        # Record entry
        entry_doc = {
            "hunt_id": hunt["hunt_id"],
            "seed_id": request.seed_id,
            "hunter_id": request.hunter_id,
            "match": is_match,
            "rank": rank,
            "xp_earned": xp_earned,
            "timestamp": now.isoformat(),
        }
        
        await hunt_entries_collection.insert_one(entry_doc)
        
        # Update hunt stats
        update_ops = {"$inc": {"total_entries": 1}}
        
        if is_match and rank:
            update_ops["$push"] = {
                "winners": {
                    "rank": rank,
                    "hunter_id": request.hunter_id,
                    "seed_id": request.seed_id,
                    "timestamp": now.isoformat(),
                    "xp_earned": xp_earned,
                }
            }
        
        await hunts_collection.update_one(
            {"hunt_id": hunt["hunt_id"]},
            update_ops
        )
        
        # Update user's total XP (in hub_wallets)
        wallets_collection = db["hub_wallets"]
        await wallets_collection.update_one(
            {"user_id": request.hunter_id},
            {
                "$inc": {"total_hunt_xp": xp_earned},
                "$push": {
                    "hunt_history": {
                        "hunt_id": hunt["hunt_id"],
                        "seed_id": request.seed_id,
                        "xp_earned": xp_earned,
                        "timestamp": now.isoformat(),
                    }
                }
            },
            upsert=True
        )
        
        message = "🏆 HUNT COMPLETE! " if is_match else "Entry recorded. "
        if is_match:
            if rank == 1:
                message += "FIRST PLACE! Maximum XP awarded!"
            elif rank <= 3:
                message += f"Top 3 finish (#{rank})!"
            elif rank <= 10:
                message += f"Top 10 finish (#{rank})!"
            else:
                message += f"Finished #{rank}"
        else:
            message += "Seed doesn't match target, but you earned participation XP."
        
        return HuntEntryResponse(
            success=True,
            match=is_match,
            rank=rank,
            xp_earned=xp_earned,
            message=message,
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit entry: {str(e)}")

@router.get("/leaderboard")
async def get_hunt_leaderboard(hunt_id: Optional[str] = None, limit: int = Query(20, ge=1, le=100)):
    """Get leaderboard for a hunt (or current hunt)"""
    try:
        if hunt_id:
            hunt = await hunts_collection.find_one({"hunt_id": hunt_id}, {"_id": 0})
        else:
            now = datetime.now(timezone.utc)
            hunt = await hunts_collection.find_one({
                "start_time": {"$lte": now.isoformat()},
                "end_time": {"$gt": now.isoformat()},
            }, {"_id": 0})
        
        if not hunt:
            return {"leaderboard": [], "total_entries": 0}
        
        winners = hunt.get("winners", [])[:limit]
        
        return {
            "hunt_id": hunt["hunt_id"],
            "hunt_name": hunt["hunt_name"],
            "leaderboard": winners,
            "total_entries": hunt.get("total_entries", 0),
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get leaderboard: {str(e)}")

@router.get("/history")
async def get_hunt_history(limit: int = Query(10, ge=1, le=50)):
    """Get past hunt results"""
    try:
        now = datetime.now(timezone.utc)
        
        cursor = hunts_collection.find(
            {"end_time": {"$lt": now.isoformat()}},
            {"_id": 0}
        ).sort("end_time", -1).limit(limit)
        
        hunts = await cursor.to_list(length=limit)
        
        return {
            "past_hunts": [
                {
                    "hunt_id": h["hunt_id"],
                    "hunt_name": h["hunt_name"],
                    "hunt_type": h["hunt_type"],
                    "difficulty": h["difficulty"],
                    "end_time": h["end_time"],
                    "total_entries": h.get("total_entries", 0),
                    "winner": h.get("winners", [{}])[0] if h.get("winners") else None,
                }
                for h in hunts
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get history: {str(e)}")

@router.get("/user/{user_id}/stats")
async def get_user_hunt_stats(user_id: str):
    """Get a user's hunt statistics"""
    try:
        # Get all entries by this user
        cursor = hunt_entries_collection.find(
            {"hunter_id": user_id},
            {"_id": 0}
        )
        entries = await cursor.to_list(length=1000)
        
        total_entries = len(entries)
        total_wins = sum(1 for e in entries if e.get("match"))
        total_xp = sum(e.get("xp_earned", 0) for e in entries)
        first_places = sum(1 for e in entries if e.get("rank") == 1)
        top_3 = sum(1 for e in entries if e.get("rank") and e.get("rank") <= 3)
        top_10 = sum(1 for e in entries if e.get("rank") and e.get("rank") <= 10)
        
        return {
            "user_id": user_id,
            "total_hunts_entered": total_entries,
            "total_wins": total_wins,
            "total_xp_earned": total_xp,
            "first_places": first_places,
            "top_3_finishes": top_3,
            "top_10_finishes": top_10,
            "win_rate": round(total_wins / total_entries * 100, 1) if total_entries > 0 else 0,
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user stats: {str(e)}")
