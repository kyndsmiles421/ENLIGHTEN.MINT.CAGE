"""
seeds.py — Crystalline Seed Minting API

THE LATTICE EXCHANGE - Digital Real Estate Coordinates

Routes:
- POST /api/seeds/mint — Mint a new Crystalline Seed (package 36-bit address + metadata)
- GET /api/seeds/gallery — List all seeds (optionally filtered)
- GET /api/seeds/{seed_id} — Get specific seed by ID
- GET /api/seeds/user/{user_id} — Get seeds minted by a user
- PUT /api/seeds/{seed_id}/visibility — Toggle public/private

MongoDB Collection: crystalline_seeds
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
import hashlib
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/seeds", tags=["crystalline-seeds"])

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "cosmic_collective")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
seeds_collection = db["crystalline_seeds"]

# ═══════════════════════════════════════════════════════════════════════════
# MODELS
# ═══════════════════════════════════════════════════════════════════════════

class PathNode(BaseModel):
    """Single node in the 36-bit path"""
    depth: int = Field(..., ge=0, le=5)
    hexagram_number: int = Field(..., ge=0, le=63)
    language_code: str
    row: int = Field(..., ge=0, le=8)
    col: int = Field(..., ge=0, le=8)
    dwell_time_ms: Optional[int] = 0

class DwellEntry(BaseModel):
    """Behavioral memory entry from Sentient Registry"""
    coordinate: str  # "row-col"
    visits: int
    total_dwell_ms: int
    stability: str  # WILD, FORMING, STABLE, HARDENED, CRYSTALLIZED

class MintSeedRequest(BaseModel):
    """Request to mint a Crystalline Seed"""
    address_36bit: str = Field(..., description="The 36-bit binary address string")
    path: List[PathNode] = Field(..., description="Array of path nodes from L0 to current depth")
    linguistic_state: str = Field(..., description="Current language code (e.g., 'sa' for Sanskrit)")
    dwell_history: Optional[List[DwellEntry]] = Field(default=[], description="Behavioral memory from Sentient Registry")
    minter_id: Optional[str] = Field(default="anonymous", description="User ID or anonymous")
    constellation_name: Optional[str] = Field(default=None, description="Optional custom name for the seed")

class SeedResponse(BaseModel):
    """Response model for a Crystalline Seed"""
    seed_id: str
    address_36bit: str
    path: List[dict]
    linguistic_state: str
    dwell_history: List[dict]
    minter_id: str
    constellation_name: Optional[str]
    rarity_score: float
    rarity_tier: str
    depth: int
    timestamp: str
    is_public: bool
    
class GalleryResponse(BaseModel):
    """Response model for gallery listing"""
    seeds: List[SeedResponse]
    total_count: int
    page: int
    page_size: int

# ═══════════════════════════════════════════════════════════════════════════
# RARITY ALGORITHM
# ═══════════════════════════════════════════════════════════════════════════

# The 9 "Rule of Nines" language codes that contribute to rarity
RULE_OF_NINES_LANGUAGES = ['en', 'es', 'ja', 'zh-cmn', 'zh-yue', 'sa', 'hi', 'lkt', 'dak']

# Sacred hexagrams (from the 9 master controllers)
SACRED_HEXAGRAMS = [1, 2, 11, 12, 63, 64, 29, 30, 15]

def calculate_rarity_score(seed_data: dict) -> tuple[float, str]:
    """
    Calculate rarity score (0-100) based on:
    - Depth level (deeper = rarer)
    - Proximity to Source State (0.500 gravity zone)
    - Linguistic state (sacred languages = rarer)
    - Path contains sacred hexagrams
    - Dwell time (longer meditation = rarer)
    
    Returns: (score, tier)
    Tiers: COMMON (0-20), UNCOMMON (21-40), RARE (41-60), EPIC (61-80), LEGENDARY (81-100)
    """
    score = 0.0
    
    # 1. Depth contribution (max 30 points)
    # L0=0, L1=5, L2=10, L3=15, L4=22, L5=30
    depth = seed_data.get('depth', 0)
    depth_scores = [0, 5, 10, 15, 22, 30]
    score += depth_scores[min(depth, 5)]
    
    # 2. Linguistic state (max 20 points)
    lang = seed_data.get('linguistic_state', 'en')
    if lang in ['sa', 'lkt', 'dak']:  # Ancient/Crystalline languages
        score += 20
    elif lang in ['ja', 'zh-cmn', 'zh-yue']:  # Technical/Binary languages
        score += 15
    elif lang in ['hi']:  # Balanced
        score += 10
    else:  # Modern
        score += 5
    
    # 3. Sacred hexagrams in path (max 20 points)
    path = seed_data.get('path', [])
    sacred_count = sum(1 for p in path if p.get('hexagram_number') in SACRED_HEXAGRAMS)
    score += min(sacred_count * 5, 20)
    
    # 4. Dwell history richness (max 15 points)
    dwell_history = seed_data.get('dwell_history', [])
    crystallized_count = sum(1 for d in dwell_history if d.get('stability') == 'CRYSTALLIZED')
    hardened_count = sum(1 for d in dwell_history if d.get('stability') == 'HARDENED')
    score += min(crystallized_count * 5 + hardened_count * 2, 15)
    
    # 5. Address pattern bonus (max 15 points)
    # Check for special patterns in the 36-bit address
    address = seed_data.get('address_36bit', '')
    
    # Palindrome bonus
    if address and address == address[::-1]:
        score += 10
    
    # Alternating pattern (like 010101 for Source State hexagram 63)
    if '010101' in address or '101010' in address:
        score += 5
    
    # All same bits (extremely rare)
    if address and (address.replace('|', '') == '0' * len(address.replace('|', '')) or 
                    address.replace('|', '') == '1' * len(address.replace('|', ''))):
        score += 15
    
    # Cap at 100
    score = min(score, 100)
    
    # Determine tier
    if score >= 81:
        tier = "LEGENDARY"
    elif score >= 61:
        tier = "EPIC"
    elif score >= 41:
        tier = "RARE"
    elif score >= 21:
        tier = "UNCOMMON"
    else:
        tier = "COMMON"
    
    return round(score, 2), tier

def generate_seed_id(address: str, timestamp: str) -> str:
    """Generate unique seed ID from address hash + timestamp"""
    raw = f"{address}:{timestamp}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]

# ═══════════════════════════════════════════════════════════════════════════
# ROUTES
# ═══════════════════════════════════════════════════════════════════════════

@router.post("/mint", response_model=SeedResponse)
async def mint_seed(request: MintSeedRequest):
    """
    Mint a new Crystalline Seed
    
    Packages the 36-bit address + dwell history + linguistic state into a
    permanent digital artifact with calculated rarity.
    """
    try:
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Calculate depth from path
        depth = len(request.path)
        
        # Generate unique seed ID
        seed_id = generate_seed_id(request.address_36bit, timestamp)
        
        # Prepare seed data
        seed_data = {
            "address_36bit": request.address_36bit,
            "path": [p.model_dump() for p in request.path],
            "linguistic_state": request.linguistic_state,
            "dwell_history": [d.model_dump() for d in request.dwell_history] if request.dwell_history else [],
            "minter_id": request.minter_id or "anonymous",
            "depth": depth,
        }
        
        # Calculate rarity
        rarity_score, rarity_tier = calculate_rarity_score(seed_data)
        
        # Complete seed document
        seed_doc = {
            "seed_id": seed_id,
            **seed_data,
            "constellation_name": request.constellation_name,
            "rarity_score": rarity_score,
            "rarity_tier": rarity_tier,
            "timestamp": timestamp,
            "is_public": True,  # Public by default
        }
        
        # Store in MongoDB
        await seeds_collection.insert_one(seed_doc)
        
        return SeedResponse(**seed_doc)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to mint seed: {str(e)}")

@router.get("/gallery", response_model=GalleryResponse)
async def get_gallery(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    rarity_tier: Optional[str] = Query(None, description="Filter by rarity tier"),
    linguistic_state: Optional[str] = Query(None, description="Filter by language"),
    min_depth: Optional[int] = Query(None, ge=0, le=5),
    sort_by: str = Query("timestamp", description="Sort field: timestamp, rarity_score, depth"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
):
    """
    Get paginated gallery of public Crystalline Seeds
    """
    try:
        # Build query
        query = {"is_public": True}
        
        if rarity_tier:
            query["rarity_tier"] = rarity_tier.upper()
        if linguistic_state:
            query["linguistic_state"] = linguistic_state
        if min_depth is not None:
            query["depth"] = {"$gte": min_depth}
        
        # Sort
        sort_direction = -1 if sort_order == "desc" else 1
        sort_field = sort_by if sort_by in ["timestamp", "rarity_score", "depth"] else "timestamp"
        
        # Get total count
        total_count = await seeds_collection.count_documents(query)
        
        # Fetch seeds
        skip = (page - 1) * page_size
        cursor = seeds_collection.find(query, {"_id": 0}).sort(sort_field, sort_direction).skip(skip).limit(page_size)
        seeds = await cursor.to_list(length=page_size)
        
        return GalleryResponse(
            seeds=[SeedResponse(**seed) for seed in seeds],
            total_count=total_count,
            page=page,
            page_size=page_size,
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch gallery: {str(e)}")

@router.get("/{seed_id}", response_model=SeedResponse)
async def get_seed(seed_id: str):
    """Get a specific seed by ID"""
    try:
        seed = await seeds_collection.find_one({"seed_id": seed_id}, {"_id": 0})
        if not seed:
            raise HTTPException(status_code=404, detail="Seed not found")
        return SeedResponse(**seed)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch seed: {str(e)}")

@router.get("/user/{user_id}")
async def get_user_seeds(
    user_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """Get all seeds minted by a specific user"""
    try:
        query = {"minter_id": user_id}
        
        total_count = await seeds_collection.count_documents(query)
        
        skip = (page - 1) * page_size
        cursor = seeds_collection.find(query, {"_id": 0}).sort("timestamp", -1).skip(skip).limit(page_size)
        seeds = await cursor.to_list(length=page_size)
        
        return {
            "seeds": seeds,
            "total_count": total_count,
            "page": page,
            "page_size": page_size,
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user seeds: {str(e)}")

@router.put("/{seed_id}/visibility")
async def toggle_visibility(seed_id: str, is_public: bool):
    """Toggle seed visibility (public/private)"""
    try:
        result = await seeds_collection.update_one(
            {"seed_id": seed_id},
            {"$set": {"is_public": is_public}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Seed not found")
            
        return {"success": True, "is_public": is_public}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update visibility: {str(e)}")

@router.get("/stats/overview")
async def get_stats():
    """Get overview statistics of the Lattice Exchange"""
    try:
        total_seeds = await seeds_collection.count_documents({})
        public_seeds = await seeds_collection.count_documents({"is_public": True})
        
        # Count by tier
        tiers = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"]
        tier_counts = {}
        for tier in tiers:
            tier_counts[tier] = await seeds_collection.count_documents({"rarity_tier": tier})
        
        # Count by depth
        depth_counts = {}
        for d in range(6):
            depth_counts[f"L{d}"] = await seeds_collection.count_documents({"depth": d})
        
        # Most popular languages
        pipeline = [
            {"$group": {"_id": "$linguistic_state", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 9}
        ]
        lang_cursor = seeds_collection.aggregate(pipeline)
        lang_stats = await lang_cursor.to_list(length=9)
        
        return {
            "total_seeds": total_seeds,
            "public_seeds": public_seeds,
            "tier_distribution": tier_counts,
            "depth_distribution": depth_counts,
            "language_distribution": {item["_id"]: item["count"] for item in lang_stats if item["_id"]},
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")
