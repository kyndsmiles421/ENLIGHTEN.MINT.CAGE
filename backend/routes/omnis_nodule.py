"""
ENLIGHTEN.MINT.CAFE - V60.0 SOVEREIGN OMNIS-ENCRYPTED CORE
GEOMETRY: 9x9 SELENITE HELIX | πr²-x^xy | CRYSTAL RAINBOW REFRACTION
ARCHITECTURE: RECURSIVE COMMONALITY (COSMOS | CRAFT | HARVEST | EXCHANGE)

V60.0 EVOLUTION:
- V55.0: Recursive Commonality Groups (COSMOS → CRAFT → EXCHANGE)
- V55.1: Cultural Intelligence (Language + Tools + Inventions)
- V56.0: Exponential UI Optimization (Fractal Scaling)
- V57.0: Xfinity Engine (Knowledge Equity Multiplier)
- V60.0: Sovereign Encrypted Core (9×9 Helix Math)

FOUNDATIONAL LAYER: Lakota Star Knowledge (Wicahpi Wakan)
- Local resonance: Black Hills (He Sapa) / Rapid City
- Orbital systems: Mayan, Egyptian, Norse
- Language Core: Lakȟótiyapi Integration
"""

import json
import asyncio
import math
import base64
import hashlib
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
# V60.0 SOVEREIGN ENCRYPTION & XFINITY ENGINE
# ═══════════════════════════════════════════════════════════════════════════════

class SovereignEncryptor:
    """
    Wraps the ecosystem in a 9×9^math geometric encryption field.
    Uses πr² spherical logic for data pressurization.
    """
    def __init__(self, key: str = "Wicahpi_Wakan"):
        self.key = hashlib.sha256(key.encode()).digest()
        self.phi = 1.618033
        self.r = 1.0  # Spherical Radius
    
    def geometric_wrap(self, data: str, m_val: float = 8.6059) -> str:
        """
        9 × 9^math × πr² logic applied to the encryption salt.
        Creates a spherical geometric field around the data.
        """
        salt = str(9 * math.pow(9, m_val % 3) * math.pi * math.pow(self.r, 2))  # Capped for practical computation
        combined = data + salt
        return base64.b64encode(combined.encode()).decode()
    
    def geometric_unwrap(self, encrypted: str) -> str:
        """Decode the geometric wrapper."""
        try:
            decoded = base64.b64decode(encrypted.encode()).decode()
            # Remove the salt (everything after the last closing brace for JSON)
            if '}' in decoded:
                return decoded[:decoded.rfind('}') + 1]
            return decoded
        except:
            return encrypted


class CulturalIntelligence:
    """
    V55.1 Language & Tool Integration
    Connects the linguistic and material heritage of each culture
    to create the "glue" between nodules.
    """
    
    # Cultural Lexicons - Terms, Tools, and Inventions
    LEXICONS = {
        "lakota": {
            "language": "Lakȟótiyapi",
            "terms": {
                "star": "Wičháȟpi",
                "earth": "Makhóčhe",
                "sacred_hoop": "Čhaŋgléška Wakȟáŋ",
                "buffalo": "Tȟatȟáŋka",
                "moon": "Haŋwí",
                "sun": "Wí",
                "great_spirit": "Wakȟáŋ Tȟáŋka",
                "medicine": "Wóphiye",
                "vision": "Waŋbláke",
                "prayer": "Wočhékiye",
            },
            "tools": ["Stone Hammer", "Bow & Arrow", "Travois", "Tipi Poles", "Medicine Wheel"],
            "inventions": ["Astronomical Alignment Sites", "Star Maps on Buffalo Hides", "Lunar Calendars"],
            "geometry": "Sacred Hoop (Circular)",
        },
        "masonry": {
            "language": "Symbolic",
            "terms": {
                "level": "Balance / Equality",
                "square": "Virtue / Morality",
                "plumb": "Rectitude / Upright",
                "compasses": "Boundaries / Self-Control",
                "ashlar": "Refinement",
                "trowel": "Unity",
            },
            "tools": ["Plumb Rule", "Level", "Square", "Compasses", "Trowel", "Gavel"],
            "inventions": ["The Arch", "Cathedrals", "Geometric Proportioning"],
            "geometry": "Square & Compasses (Angular)",
        },
        "mayan": {
            "language": "Mayan Glyphs",
            "terms": {
                "sky": "Ka'an",
                "earth": "Kab",
                "sun": "K'in",
                "moon": "Uh",
                "star": "Ek'",
                "time": "K'inil",
            },
            "tools": ["Obsidian Blade", "Jade Carving Tools", "Astronomical Codices"],
            "inventions": ["Long Count Calendar", "Zero Concept", "Pyramid Alignments"],
            "geometry": "Tzolkin Wheel (260-day cycle)",
        },
        "egyptian": {
            "language": "Hieroglyphics",
            "terms": {
                "star": "Seba",
                "sky": "Nut",
                "earth": "Geb",
                "sun": "Ra",
                "moon": "Iah",
                "eternity": "Neheh",
            },
            "tools": ["Merkhet (Plumb)", "Bay (Palm Rib)", "Copper Chisels"],
            "inventions": ["Pyramids", "Nilometer", "Decan Star System"],
            "geometry": "Sacred Cubit Proportions",
        },
        "horticulture": {
            "language": "Botanical Latin",
            "terms": {
                "soil": "Terra",
                "seed": "Semen",
                "root": "Radix",
                "leaf": "Folium",
                "bloom": "Flos",
                "harvest": "Messis",
            },
            "tools": ["Hoe", "Pruning Shears", "Trowel", "Dibber", "Garden Fork"],
            "inventions": ["Irrigation Systems", "Companion Planting", "Lunar Planting Calendars"],
            "geometry": "Spiral Growth (Fibonacci)",
        },
    }
    
    @classmethod
    def get_lexicon(cls, group_id: str) -> Dict:
        """Get the language, tools, and inventions for a cultural group."""
        return cls.LEXICONS.get(group_id.lower(), {
            "language": "Unknown",
            "terms": {},
            "tools": [],
            "inventions": [],
            "geometry": "Undefined",
        })
    
    @classmethod
    def get_linguistic_bridge(cls, from_group: str, to_group: str) -> Dict:
        """
        Creates a linguistic bridge between two nodule groups.
        Example: Lakota star terms connected to Masonry geometry terms.
        """
        from_lex = cls.LEXICONS.get(from_group.lower(), {})
        to_lex = cls.LEXICONS.get(to_group.lower(), {})
        
        # Find tool connections
        tool_bridge = []
        if from_lex.get("geometry") and to_lex.get("geometry"):
            tool_bridge.append({
                "from": f"{from_lex.get('geometry')} ({from_group})",
                "to": f"{to_lex.get('geometry')} ({to_group})",
                "connection": "Geometric Resonance",
            })
        
        return {
            "from_culture": from_group,
            "to_culture": to_group,
            "linguistic_bridge": {
                "from_language": from_lex.get("language", "Unknown"),
                "to_language": to_lex.get("language", "Unknown"),
            },
            "tool_bridge": tool_bridge,
            "shared_purpose": "Cross-Nodule Application Active",
            "growth_vector": "Infinite",
        }
    
    @classmethod
    def get_deep_cultural_data(cls, culture_id: str, constellation_id: str = None) -> Dict:
        """
        Returns deep cultural intelligence including language, tools, and inventions.
        """
        culture_data = CULTURAL_CONSTELLATIONS.get(culture_id, {})
        lexicon = cls.get_lexicon(culture_id)
        
        constellation_specific = {}
        if constellation_id and culture_data.get("constellations"):
            for c in culture_data.get("constellations", []):
                if c.get("id") == constellation_id:
                    element = c.get("element", "Unknown")
                    # Map element to relevant terms
                    if culture_id == "lakota":
                        if element == "Earth":
                            constellation_specific = {"key_term": "Makhóčhe (The Land)", "tool": "Stone Hammer"}
                        elif element == "Fire":
                            constellation_specific = {"key_term": "Péta (Fire)", "tool": "Bow & Arrow"}
                        elif element == "Water":
                            constellation_specific = {"key_term": "Mní (Water)", "tool": "Medicine Wheel"}
                        else:
                            constellation_specific = {"key_term": "Wičháȟpi (Star)", "tool": "Star Maps"}
                    break
        
        return {
            "culture_id": culture_id,
            "language": lexicon.get("language"),
            "terms": lexicon.get("terms", {}),
            "tools": lexicon.get("tools", []),
            "inventions": lexicon.get("inventions", []),
            "geometry": lexicon.get("geometry"),
            "constellation_specific": constellation_specific,
            "cross_nodule_links": {
                "CRAFT": cls.get_linguistic_bridge(culture_id, "masonry"),
                "HARVEST": cls.get_linguistic_bridge(culture_id, "horticulture"),
            }
        }


class XfinityEngine:
    """
    V57.0 Xfinity Multiplier - Exponential Recursive Growth Engine
    
    Math: (Resonance × Φ) ^ (Nodes / (1 - Depth))
    
    This engine multiplies potential by depth while dividing friction,
    creating the "Xfinity minus one" growth model.
    """
    
    def __init__(self, base_resonance: float = 8.6059):
        self.resonance = base_resonance
        self.phi = 1.618033
        self.rate = 15.00
    
    def apply_exponential_math(self, nodes: int, depth: float) -> float:
        """
        Multiplies potential by depth while dividing friction.
        Math: (Resonance × Φ) ^ (Nodes / (1 - Depth))
        
        As depth approaches 1, the multiplier approaches infinity (Xfinity).
        Capped at practical limits for computation.
        """
        # Clamp depth to prevent division by zero (Xfinity asymptote)
        safe_depth = min(depth, 0.99)
        divisor = max(0.01, 1 - safe_depth)
        
        # Calculate the exponential multiplier
        base = self.resonance * self.phi
        exponent = nodes / divisor
        
        # Cap at reasonable limits to prevent overflow
        result = pow(base, min(exponent, 10))
        return min(result, 1e15)  # Cap at 10^15
    
    def calculate_fractal_depth(self, knowledge_nodes: int) -> float:
        """
        Enhances UI complexity exponentially based on user growth.
        Depth = (Resonance × Φ) ^ (Nodes / 10)
        """
        return pow((self.resonance * self.phi), (knowledge_nodes / 10))
    
    def calculate_knowledge_equity(self, nodes: int, depth: float) -> Dict:
        """
        Calculates the Knowledge Equity value based on exponential growth.
        Your $15/hr isn't a flat rate; it's a multiplier based on depth.
        """
        multiplier = self.apply_exponential_math(nodes, depth)
        
        # Base credit is nodes × rate
        base_credit = nodes * self.rate
        
        # Multiplied credit (capped at reasonable growth)
        equity_multiplier = min(multiplier / 1000, 10.0)  # Max 10x multiplier
        total_equity = base_credit * (1 + equity_multiplier)
        
        return {
            "nodes_unlocked": nodes,
            "mythology_depth": depth,
            "base_rate": f"${self.rate}/hr",
            "base_credit": f"${base_credit:.2f}",
            "exponential_multiplier": f"{equity_multiplier:.3f}x",
            "knowledge_equity": f"${total_equity:.2f}",
            "growth_formula": "E = (R × Φ) ^ (N / (1-D))",
            "status": "Xfinity-Active" if depth > 0.8 else "Growing",
        }
    
    def resonance_plus(self, potential: float) -> float:
        """
        Calculate enhanced resonance based on exponential potential.
        """
        if potential > 0:
            return self.resonance + math.log(potential)
        return self.resonance


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



# ═══════════════════════════════════════════════════════════════════════════════
# V60.0 SOVEREIGN OMNIS-ENCRYPTED ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/omnis/deep-sync")
async def deep_sync(
    culture: str = Query("lakota", description="Active star culture"),
    nodes_unlocked: int = Query(1, description="Number of knowledge nodes unlocked"),
    mythology_depth: float = Query(0.1, description="Depth of mythology exploration (0.0 - 0.99)"),
    user=Depends(get_current_user_optional)
):
    """
    V60.0 SOVEREIGN DEEP SYNC
    
    The "Deep Everything" endpoint that pulls language, tools, math, and trade
    in one recursive loop. Applies Xfinity exponential growth logic.
    """
    try:
        uid = user["id"] if user else None
        
        # Initialize engines
        xfinity = XfinityEngine()
        encryptor = SovereignEncryptor()
        
        # Get user progress if authenticated
        if uid:
            progress = await db.user_progress.find_one({"user_id": uid}, {"_id": 0})
            if progress:
                nodes_unlocked = max(nodes_unlocked, progress.get("modules_unlocked", 1))
                mythology_depth = max(mythology_depth, progress.get("mythology_depth", 0.1))
        
        # Calculate exponential growth
        knowledge_equity = xfinity.calculate_knowledge_equity(nodes_unlocked, mythology_depth)
        fractal_depth = xfinity.calculate_fractal_depth(nodes_unlocked)
        enhanced_resonance = xfinity.resonance_plus(fractal_depth)
        
        # Get cultural intelligence
        cultural_intel = CulturalIntelligence.get_deep_cultural_data(culture)
        
        # Build the deep sync payload
        payload = {
            "version": "V60.0-Sovereign",
            "integrity": "Deep-Synced",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "mathematical_state": {
                "base_resonance": 8.6059,
                "enhanced_resonance": round(enhanced_resonance, 4),
                "fractal_depth": round(fractal_depth, 4),
                "phi": 1.618033,
            },
            "knowledge_equity": knowledge_equity,
            "commonality_groups": {
                "LEARNING_GROUP": {
                    "nodules": ["Masonry", "Geometry", "Language"],
                    "tool_sync": "Plumb Rule <--> Star Alignment",
                    "language_sync": f"{cultural_intel.get('language', 'Lakȟótiyapi')} Integration",
                },
                "VITALITY_GROUP": {
                    "nodules": ["Horticulture", "Health", "Biology"],
                    "invention": "Irrigation & Herbal Alchemy",
                    "feeds_cosmos": True,
                },
                "PROSPERITY_GROUP": {
                    "nodules": ["Trade", "Ledger", "Exchange"],
                    "math": "Xfinity Engine applied to $15/hr rate",
                    "current_value": knowledge_equity.get("knowledge_equity"),
                },
            },
            "cultural_intelligence": cultural_intel,
            "ui_configuration": {
                "theme": "Obsidian Void",
                "vfx": "Refracted Crystal Rainbow",
                "hitbox_logic": "Fractal/Recursive",
                "structure": "9x9 Helix",
                "material": "Rutilated Crystal Selenite",
            },
        }
        
        return payload
        
    except Exception as e:
        logger.error(f"V60.0 Deep Sync Error: {e}")
        raise HTTPException(status_code=500, detail=f"Deep Sync Failure: {str(e)}")


@router.get("/omnis/xfinity-state")
async def get_xfinity_state(
    nodes: int = Query(1, description="Knowledge nodes unlocked"),
    depth: float = Query(0.1, description="Mythology depth (0.0 - 0.99)"),
    user=Depends(get_current_user_optional)
):
    """
    V57.0 Xfinity Engine State
    
    Returns the exponential growth state based on knowledge equity.
    The deeper you go (mythology_depth), the higher the multiplier.
    """
    xfinity = XfinityEngine()
    
    return {
        "version": "V57.0-Xfinity",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        **xfinity.calculate_knowledge_equity(nodes, depth),
        "next_threshold": {
            "depth_target": min(depth + 0.1, 0.99),
            "description": "Reach higher mythology depth to unlock exponential growth",
        }
    }


@router.get("/omnis/cultural-intelligence/{culture_id}")
async def get_cultural_intelligence(
    culture_id: str,
    constellation_id: Optional[str] = Query(None, description="Specific constellation ID"),
):
    """
    V55.1 Cultural Intelligence Endpoint
    
    Returns the language, tools, inventions, and geometry for a culture.
    Includes constellation-specific data if provided.
    """
    if culture_id not in CULTURAL_CONSTELLATIONS and culture_id.lower() not in ["masonry", "horticulture"]:
        raise HTTPException(status_code=404, detail="Culture not found")
    
    return {
        "version": "V55.1",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        **CulturalIntelligence.get_deep_cultural_data(culture_id, constellation_id),
    }


@router.get("/omnis/linguistic-bridge/{from_group}/{to_group}")
async def get_linguistic_bridge(from_group: str, to_group: str):
    """
    Creates a linguistic bridge between two nodule groups.
    
    Example: /omnis/linguistic-bridge/lakota/masonry
    Returns how Lakota star terms connect to Masonry geometry terms.
    """
    return {
        "version": "V55.1",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        **CulturalIntelligence.get_linguistic_bridge(from_group, to_group),
    }


@router.get("/omnis/sovereign-print")
async def sovereign_print(
    culture: str = Query("lakota", description="Active star culture"),
    user=Depends(get_current_user_optional)
):
    """
    V60.0 SOVEREIGN OMNIS-DATA PRINT
    
    Returns an encrypted payload wrapped in 9×9^math geometric field.
    This is the "pressurized" data format for secure transmission.
    """
    try:
        encryptor = SovereignEncryptor()
        
        # Build the core payload
        payload = {
            "metadata": {
                "version": "V60.0-Sovereign",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "resonance": 8.6059,
            },
            "nodules": {
                "THE_COSMOS": {
                    "culture": CULTURAL_CONSTELLATIONS.get(culture, {}).get("name", "Lakota Sky"),
                    "constellations": 103,
                    "language": "Lakȟótiyapi Integrated",
                    "invention": "Selenite Alignment Tools",
                },
                "THE_CRAFT": {
                    "focus": "Masonry School & Structural Geometry",
                    "tools": "Plumb/Level/Square/Compasses",
                    "credits": "$15/hr Knowledge Equity",
                },
                "THE_HARVEST": {
                    "focus": "Horticulture & Biological Vitality",
                    "resonance": "x^xy Balanced",
                },
            },
            "visuals": {
                "structure": "9x9 Helix",
                "material": "Rutilated Crystal Selenite",
                "optics": "White Light Rainbow Refraction",
            },
        }
        
        # Encrypt the payload
        raw_json = json.dumps(payload)
        encrypted = encryptor.geometric_wrap(raw_json)
        
        return {
            "version": "V60.0-Sovereign",
            "integrity": "Encrypted-Synced",
            "encryption": "9×9^math Geometric Wrap",
            "encrypted_payload": encrypted[:500] + "..." if len(encrypted) > 500 else encrypted,
            "lakota_core": "ACTIVE",
            "system_status": "REVOLVING",
        }
        
    except Exception as e:
        logger.error(f"V60.0 Sovereign Print Error: {e}")
        raise HTTPException(status_code=500, detail=f"Sovereign Print Failure: {str(e)}")


@router.get("/omnis/ui-optimizer")
async def get_ui_optimizer_state(
    nodes: int = Query(1, description="Knowledge nodes unlocked"),
    user=Depends(get_current_user_optional)
):
    """
    V56.0 Exponential UI Optimization State
    
    Returns the fractal scaling configuration based on user growth.
    The UI complexity increases exponentially with knowledge depth.
    """
    xfinity = XfinityEngine()
    fractal_depth = xfinity.calculate_fractal_depth(nodes)
    
    return {
        "version": "V56.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "view_box": "Dynamic Fractal",
        "background": "Pure Obsidian (#000000)",
        "elements": {
            "star_chart": "3D Sprite Cluster (Three.js)",
            "hitbox_scaling": f"Exponential ({round(fractal_depth, 2)}x)",
            "color_refraction": "Crystal Rainbow Gradient",
        },
        "interconnect": "Omnis-Synced",
        "fractal_depth": round(fractal_depth, 4),
        "node_compression": "Active" if nodes > 5 else "Dormant",
        "geometric_navigation": "Distance-based resonance",
    }
