"""
ENLIGHTEN.MINT.CAFE - V55.0 OMNIS-NODULE INTEGRATION
ARCHITECTURE: RECURSIVE COMMONALITY (COSMOS | CRAFT | HARVEST | EXCHANGE)

This module implements inter-nodule intelligence where:
- THE COSMOS (Star Knowledge) informs THE CRAFT (Masonry, Geometry)
- THE CRAFT unlocks credits in THE EXCHANGE (Trade Ledger)
- THE HARVEST (Horticulture, Health) feeds THE COSMOS meditation visuals
- Everything cross-pollinates through a shared context bus

FOUNDATIONAL LAYER: Lakota Star Knowledge (Wicahpi Wakan)
- Local resonance: Black Hills (He Sapa) / Rapid City
- Orbital systems: Mayan, Egyptian, Norse
"""

import json
import asyncio
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from deps import db, get_current_user_optional, logger

router = APIRouter()

# Load star cultures data
_data_path = Path(__file__).parent.parent / "data" / "star_cultures_data.json"
try:
    with open(_data_path) as f:
        CULTURAL_CONSTELLATIONS = json.load(f)
    logger.info(f"V55.0 Omnis: Loaded {len(CULTURAL_CONSTELLATIONS)} star cultures")
except Exception as e:
    logger.error(f"V55.0 Omnis: Failed to load star cultures: {e}")
    CULTURAL_CONSTELLATIONS = {}


class OmnisEngine:
    """
    The V55.0 Omnis-Nodule Integration Engine
    Cross-pollinates learning, meditation, and trade through recursive commonality.
    """
    
    # Mathematical Constants
    RESONANCE_BASE = 8.4881      # √7.3 × π
    PHI = 1.618                   # Golden Ratio
    VOLUNTEER_RATE = 15.00        # $15/hr Commonality Constant
    
    # Commonality Groups
    GROUPS = {
        "COSMOS": {
            "name": "The Cosmos",
            "description": "Navigation, Mythology, Perspective",
            "nodules": ["Star Knowledge", "Astrology", "Mythology"],
            "feeds": ["THE_CRAFT"],  # Geometry patterns feed learning
        },
        "CRAFT": {
            "name": "The Craft", 
            "description": "Structure, Geometry, Skill-Building",
            "nodules": ["Masonry", "Sacred Geometry", "Mathematics"],
            "feeds": ["THE_EXCHANGE", "THE_COSMOS"],  # Hours -> Credits, Patterns -> Visuals
        },
        "HARVEST": {
            "name": "The Harvest",
            "description": "Biology, Growth, Vitality",
            "nodules": ["Horticulture", "Health", "Wellness"],
            "feeds": ["THE_COSMOS"],  # Biological rhythm -> Breath work
        },
        "EXCHANGE": {
            "name": "The Exchange",
            "description": "Trade, Community, Credit Flow",
            "nodules": ["Trade Circle", "Marketplace", "Ledger"],
            "feeds": ["THE_HARVEST"],  # Credits -> Garden funding
        },
    }
    
    # Foundational Culture (Lakota - Black Hills resonance)
    FOUNDATIONAL_CULTURE = "lakota"
    
    @staticmethod
    def get_foundational_culture():
        """Returns the Lakota star knowledge as the foundational layer."""
        lakota = CULTURAL_CONSTELLATIONS.get("lakota", {})
        return {
            "id": "lakota",
            "name": lakota.get("name", "Lakota Sky"),
            "color": lakota.get("color", "#DC2626"),
            "description": lakota.get("description", ""),
            "icon": lakota.get("icon", "feather"),
            "constellations": lakota.get("constellations", []),
            "is_foundational": True,
            "local_resonance": {
                "region": "Black Hills (He Sapa)",
                "city": "Rapid City",
                "significance": "Sacred mirror of the night sky"
            }
        }
    
    @staticmethod
    def get_orbital_cultures():
        """Returns cultures that orbit the foundational Lakota layer."""
        orbital_ids = ["mayan", "egyptian", "norse", "hopi", "greek", "chinese"]
        orbitals = []
        for cid in orbital_ids:
            culture = CULTURAL_CONSTELLATIONS.get(cid, {})
            if culture:
                orbitals.append({
                    "id": cid,
                    "name": culture.get("name", cid.title()),
                    "color": culture.get("color", "#818CF8"),
                    "description": culture.get("description", ""),
                    "icon": culture.get("icon", "globe"),
                    "constellation_count": len(culture.get("constellations", [])),
                    "is_orbital": True,
                })
        return orbitals
    
    @staticmethod
    def get_all_cultures_summary():
        """Returns a summary of all 21 cultures with constellation counts."""
        cultures = []
        for cid, data in CULTURAL_CONSTELLATIONS.items():
            cultures.append({
                "id": cid,
                "name": data.get("name", cid.title()),
                "color": data.get("color", "#818CF8"),
                "icon": data.get("icon", "star"),
                "description": data.get("description", "")[:150] + "..." if len(data.get("description", "")) > 150 else data.get("description", ""),
                "constellation_count": len(data.get("constellations", [])),
                "is_foundational": cid == "lakota",
            })
        # Sort with Lakota first, then alphabetically
        cultures.sort(key=lambda x: (not x["is_foundational"], x["name"]))
        return cultures
    
    @staticmethod
    def get_deep_lore(culture_id: str, constellation_id: str):
        """
        Dive deep into a constellation's mythology across multiple layers.
        Returns story, lesson, sacred connections, and cross-nodule links.
        """
        culture = CULTURAL_CONSTELLATIONS.get(culture_id)
        if not culture:
            return None
        
        constellation = None
        for c in culture.get("constellations", []):
            if c.get("id") == constellation_id:
                constellation = c
                break
        
        if not constellation:
            return None
        
        mythology = constellation.get("mythology", {})
        
        # Build deep lore structure
        deep_lore = {
            "constellation": {
                "id": constellation.get("id"),
                "name": constellation.get("name"),
                "culture": culture.get("name"),
                "culture_id": culture_id,
                "element": constellation.get("element"),
                "ra": constellation.get("ra"),
                "dec": constellation.get("dec"),
                "stars": constellation.get("stars", []),
            },
            "mythology": {
                "figure": mythology.get("figure", "Unknown Figure"),
                "deity": mythology.get("deity", ""),
                "origin": mythology.get("origin", culture.get("name")),
                "story": mythology.get("story", ""),
                "lesson": mythology.get("lesson", ""),
            },
            "layers": {
                "surface": {
                    "name": "The Visible",
                    "description": f"What the eye sees: {len(constellation.get('stars', []))} stars forming {mythology.get('figure', 'a celestial figure')}",
                },
                "middle": {
                    "name": "The Story",
                    "description": mythology.get("story", "A tale lost to time"),
                },
                "deep": {
                    "name": "The Lesson",
                    "description": mythology.get("lesson", "Wisdom awaits the seeker"),
                },
                "sacred": {
                    "name": "The Sacred",
                    "description": f"Connected to {mythology.get('deity', 'the cosmic order')} — {mythology.get('origin', culture.get('name'))} tradition",
                },
            },
            "cross_nodule_connections": {
                "CRAFT": {
                    "connection": "Sacred Geometry",
                    "description": f"The {constellation.get('name')} pattern informs geometric meditation structures",
                    "unlock_hint": "Complete a Sacred Geometry session to see this constellation's hidden geometry",
                },
                "HARVEST": {
                    "connection": "Seasonal Planting",
                    "description": f"When {constellation.get('name')} rises, traditional planting wisdom activates",
                    "unlock_hint": "Add this constellation to your Horticulture calendar",
                },
                "EXCHANGE": {
                    "connection": "Credit Yield",
                    "description": f"Learning {constellation.get('name')}'s full mythology awards {OmnisEngine.VOLUNTEER_RATE} credit-hours",
                    "unlock_hint": "Complete the narrated journey to earn credits",
                },
            },
            "related_constellations": [],
        }
        
        # Find related constellations (same element or deity family)
        element = constellation.get("element")
        for other_culture_id, other_culture in CULTURAL_CONSTELLATIONS.items():
            for other_c in other_culture.get("constellations", []):
                if other_c.get("id") != constellation_id:
                    if other_c.get("element") == element:
                        deep_lore["related_constellations"].append({
                            "id": other_c.get("id"),
                            "name": other_c.get("name"),
                            "culture": other_culture.get("name"),
                            "culture_id": other_culture_id,
                            "relation": f"Shares {element} element",
                        })
        
        # Limit related to 5
        deep_lore["related_constellations"] = deep_lore["related_constellations"][:5]
        
        return deep_lore
    
    @staticmethod
    async def calculate_resonance(uid: Optional[str], culture_id: str = "lakota"):
        """
        Calculate user's resonance level based on their learning progress.
        Formula: (craft_complexity × harvest_vitality) / 8.4881
        """
        craft_complexity = 1.0
        harvest_vitality = 1.0
        
        if uid:
            # Get user's learning progress
            progress = await db.user_progress.find_one({"user_id": uid}, {"_id": 0})
            if progress:
                craft_complexity = 1.0 + (progress.get("level", 1) * 0.1)
            
            # Get user's wellness/health score if tracked
            wellness = await db.health_logs.count_documents({"user_id": uid})
            if wellness > 0:
                harvest_vitality = 1.0 + min(wellness * 0.01, 1.0)
        
        resonance = (craft_complexity * harvest_vitality) / OmnisEngine.RESONANCE_BASE
        
        return {
            "base_resonance": OmnisEngine.RESONANCE_BASE,
            "craft_complexity": round(craft_complexity, 3),
            "harvest_vitality": round(harvest_vitality, 3),
            "total_resonance": round(OmnisEngine.RESONANCE_BASE + resonance, 4),
            "culture_alignment": culture_id,
        }
    
    @staticmethod
    async def sync_all_nodules(uid: Optional[str], selected_sky: str = "lakota"):
        """
        Master sync that connects every nodule through recursive commonality.
        """
        # Parallel gather all data
        cosmos_task = asyncio.create_task(OmnisEngine.get_cosmos_nodule(selected_sky))
        craft_task = asyncio.create_task(OmnisEngine.get_craft_nodule(uid))
        harvest_task = asyncio.create_task(OmnisEngine.get_harvest_nodule(uid))
        resonance_task = asyncio.create_task(OmnisEngine.calculate_resonance(uid, selected_sky))
        
        cosmos, craft, harvest, resonance = await asyncio.gather(
            cosmos_task, craft_task, harvest_task, resonance_task
        )
        
        # Calculate trade ledger based on craft hours
        trade_credits = craft.get("credit_yield", 0) * OmnisEngine.VOLUNTEER_RATE
        
        return {
            "ui_state": {
                "theme": "Obsidian Void / Refracted Crystal",
                "layout": "Recursive Commonality",
                "foundational_culture": "lakota",
            },
            "interconnected_data": {
                "COSMOS": cosmos,
                "CRAFT": craft,
                "HARVEST": harvest,
                "EXCHANGE": {
                    "balance": trade_credits,
                    "rate_card": f"${OmnisEngine.VOLUNTEER_RATE}/hr",
                    "source": "Learning hours converted to trade credits",
                },
            },
            "resonance": resonance,
            "commonality_groups": OmnisEngine.GROUPS,
        }
    
    @staticmethod
    async def get_cosmos_nodule(culture_id: str = "lakota"):
        """Get cosmos (star knowledge) nodule data."""
        culture = CULTURAL_CONSTELLATIONS.get(culture_id, {})
        constellations = culture.get("constellations", [])
        
        return {
            "culture_id": culture_id,
            "culture_name": culture.get("name", "Unknown Sky"),
            "color": culture.get("color", "#DC2626"),
            "description": culture.get("description", ""),
            "constellation_count": len(constellations),
            "constellations_summary": [
                {
                    "id": c.get("id"),
                    "name": c.get("name"),
                    "element": c.get("element"),
                    "figure": c.get("mythology", {}).get("figure", ""),
                } for c in constellations
            ],
            "is_foundational": culture_id == "lakota",
        }
    
    @staticmethod
    async def get_craft_nodule(uid: Optional[str]):
        """Get craft (masonry, learning) nodule data."""
        lessons_completed = 0
        credit_yield = 0.0
        
        if uid:
            # Count completed lessons/modules
            lessons = await db.user_progress.find_one({"user_id": uid}, {"_id": 0})
            if lessons:
                lessons_completed = lessons.get("modules_unlocked", 0)
                credit_yield = lessons_completed * 0.5  # 0.5 hours per module
        
        return {
            "subject": "Operative Masonry & Sacred Geometry",
            "geometry_unlocked": ["Perfect Ashlar", "Vesica Piscis", "Flower of Life"][:lessons_completed + 1],
            "lessons_completed": lessons_completed,
            "credit_yield": credit_yield,
            "resonance_impact": round(OmnisEngine.PHI * (1 + lessons_completed * 0.1), 3),
        }
    
    @staticmethod
    async def get_harvest_nodule(uid: Optional[str]):
        """Get harvest (horticulture, health) nodule data."""
        return {
            "soil_resonance": "Balanced",
            "body_vitality": "Optimized",
            "biological_rhythm": {
                "breath_cycle": "4-7-8",
                "plant_cycle": "Lunar",
            },
            "herbal_logic": "Native Black Hills Flora",
            "feeds_cosmos": True,  # Breath work patterns inform meditation
        }


# ═══════════════════════════════════════════════════════════════════════════════
# V55.0 API ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/omnis/sync")
async def omnis_sync(
    culture: str = Query("lakota", description="Active star culture"),
    user=Depends(get_current_user_optional)
):
    """
    V55.0 Omnis-Nodule Master Sync
    Returns interconnected data from all four commonality groups.
    """
    try:
        uid = user["id"] if user else None
        sync_data = await OmnisEngine.sync_all_nodules(uid, culture)
        
        return {
            "version": "V55.0",
            "integrity": "Omnis-Synced",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            **sync_data
        }
    except Exception as e:
        logger.error(f"V55.0 Omnis Sync Error: {e}")
        raise HTTPException(status_code=500, detail=f"Omnis Sync Failure: {str(e)}")


@router.get("/omnis/foundational-culture")
async def get_foundational_culture():
    """
    Returns the Lakota star knowledge as the foundational layer.
    All other cultures orbit this local Black Hills resonance.
    """
    return {
        "foundational": OmnisEngine.get_foundational_culture(),
        "orbitals": OmnisEngine.get_orbital_cultures(),
    }


@router.get("/omnis/cultures")
async def get_all_cultures():
    """
    Returns all 21 star cultures with their constellation counts.
    Lakota is marked as foundational and listed first.
    """
    return {
        "total_cultures": len(CULTURAL_CONSTELLATIONS),
        "total_constellations": sum(len(c.get("constellations", [])) for c in CULTURAL_CONSTELLATIONS.values()),
        "foundational_culture": "lakota",
        "cultures": OmnisEngine.get_all_cultures_summary(),
    }


@router.get("/omnis/deep-lore/{culture_id}/{constellation_id}")
async def get_deep_lore(
    culture_id: str,
    constellation_id: str,
    user=Depends(get_current_user_optional)
):
    """
    Dive deep into a constellation's mythology across multiple layers.
    Returns story, lesson, sacred connections, and cross-nodule links.
    
    This is the "goes deep down" endpoint — not stopping at the second layer.
    """
    deep_lore = OmnisEngine.get_deep_lore(culture_id, constellation_id)
    
    if not deep_lore:
        raise HTTPException(status_code=404, detail="Constellation not found in specified culture")
    
    # Award XP for deep exploration if authenticated
    if user:
        try:
            await db.user_progress.update_one(
                {"user_id": user["id"]},
                {"$inc": {"deep_lore_explored": 1}},
                upsert=True
            )
        except:
            pass
    
    return {
        "version": "V55.0",
        "depth": "Sacred",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        **deep_lore
    }


@router.get("/omnis/culture/{culture_id}/full")
async def get_culture_full(culture_id: str):
    """
    Returns a culture's full data including all constellations with deep mythology.
    This is for the "never stopping" recursive display.
    """
    culture = CULTURAL_CONSTELLATIONS.get(culture_id)
    if not culture:
        raise HTTPException(status_code=404, detail="Culture not found")
    
    return {
        "id": culture_id,
        "name": culture.get("name"),
        "color": culture.get("color"),
        "icon": culture.get("icon"),
        "description": culture.get("description"),
        "is_foundational": culture_id == "lakota",
        "constellations": culture.get("constellations", []),
        "total_constellations": len(culture.get("constellations", [])),
        "cross_talk": {
            "feeds": ["CRAFT", "HARVEST"] if culture_id == "lakota" else ["COSMOS"],
            "receives_from": ["HARVEST", "CRAFT"],
        }
    }


@router.get("/omnis/commonality-groups")
async def get_commonality_groups():
    """
    Returns the four commonality groups and their cross-talk relationships.
    """
    return {
        "groups": OmnisEngine.GROUPS,
        "cross_talk_map": {
            "COSMOS -> CRAFT": "Star geometry informs Sacred Geometry meditation",
            "CRAFT -> EXCHANGE": "Learning hours convert to $15/hr credits",
            "HARVEST -> COSMOS": "Biological rhythms sync with breath meditation",
            "EXCHANGE -> HARVEST": "Credits fund garden and health modules",
        },
        "resonance_formula": "E = (craft_complexity × harvest_vitality) / 8.4881",
    }


@router.post("/omnis/award-learning")
async def award_learning_credits(
    constellation_id: str = Query(..., description="Constellation studied"),
    culture_id: str = Query(..., description="Culture of the constellation"),
    user=Depends(get_current_user_optional)
):
    """
    Awards credit hours for completing a deep lore exploration.
    This is the cross-talk from COSMOS to EXCHANGE.
    """
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required for credit awards")
    
    credit_hours = 0.25  # 15 minutes per deep exploration
    credit_value = credit_hours * OmnisEngine.VOLUNTEER_RATE
    
    try:
        await db.hub_wallets.update_one(
            {"user_id": user["id"]},
            {
                "$inc": {"dust": int(credit_value * 100)},  # Store as cents
                "$push": {
                    "learning_credits": {
                        "constellation_id": constellation_id,
                        "culture_id": culture_id,
                        "credit_hours": credit_hours,
                        "credit_value": credit_value,
                        "awarded_at": datetime.now(timezone.utc).isoformat(),
                    }
                }
            },
            upsert=True
        )
        
        return {
            "awarded": True,
            "credit_hours": credit_hours,
            "credit_value": f"${credit_value:.2f}",
            "rate": f"${OmnisEngine.VOLUNTEER_RATE}/hr",
            "message": f"Earned {credit_hours} hours of learning credit for exploring {constellation_id}",
        }
    except Exception as e:
        logger.error(f"Award learning credits error: {e}")
        raise HTTPException(status_code=500, detail="Failed to award credits")
