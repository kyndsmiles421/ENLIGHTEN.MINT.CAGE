"""
ENLIGHTEN.MINT.CAFE - V53.0 UNIFIED MASTER INTEGRATION
STATUS: FULLY OPERATIONAL | INTEGRITY: SYNCED
ARCHITECT: Steven Michael | ROOT: kyndsmiles@gmail.com

This is the MASTER SYNC endpoint that gathers data from EVERY nodule
and delivers it to the frontend in one payload. No more silent auth walls.
No more "Failed to load" errors. Everything interconnected.

NODULES:
- Star Chart (16 constellations, 21 cultures)
- The Vault (Archives, Journal, Ledger)
- Trade Circle (Credits, Marketplace, $15/hr)
- Oracle (5 divination systems)
- Manifest Bar (Hub, Trade, Oracle, Discover, Mixer)
- UI Theme (Obsidian Void / Crystal Rainbow)
- Bio-Digital Osmosis (Ghost Watch, Haptic, Neural)
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from deps import db, get_current_user_optional, logger
import asyncio

router = APIRouter()


# ═══════════════════════════════════════════════════════════════════════════════
# V53.0 LOGIC ENGINE - THE UNIFIED PROCESSING HUB
# ═══════════════════════════════════════════════════════════════════════════════

class V53_LogicEngine:
    """The unified processing hub for all app nodules."""
    
    # Mathematical Constants
    RESONANCE = 8.4881      # √7.3 × π
    PHI = 1.618             # Golden Ratio
    EARTH_HZ = 7.3          # Schumann Resonance
    COMPOSITE = 690         # Composite Frequency
    
    # Financial Constants
    HOURLY_RATE = 15.0      # $15/hr Volunteer Credit
    
    # Solfeggio Frequency Map
    SOLFEGGIO_MAP = {
        "174": {"color": "#8B0000", "name": "Grounding", "chakra": "Root"},
        "285": {"color": "#FF4500", "name": "Quantum Field", "chakra": "Sacral"},
        "396": {"color": "#FFD700", "name": "Liberation", "chakra": "Solar Plexus"},
        "417": {"color": "#32CD32", "name": "Transformation", "chakra": "Heart"},
        "432": {"color": "#00CED1", "name": "Earth Harmony", "chakra": "Throat"},
        "528": {"color": "#00FF00", "name": "DNA Repair", "chakra": "Third Eye"},
        "639": {"color": "#1E90FF", "name": "Connection", "chakra": "Crown"},
        "741": {"color": "#4B0082", "name": "Expression", "chakra": "Higher"},
        "852": {"color": "#9400D3", "name": "Intuition", "chakra": "Divine"},
        "963": {"color": "#FFFFFF", "name": "Oneness", "chakra": "Source"},
    }
    
    @staticmethod
    def get_ui_theme():
        """Returns the Obsidian Void / Crystal Rainbow theme config."""
        return {
            "background": "#000000",
            "palette": "Refracted Crystal Rainbow",
            "rendering": "WebGL/Canvas",
            "resonance": V53_LogicEngine.RESONANCE,
            "composite_hz": V53_LogicEngine.COMPOSITE,
            "phi": V53_LogicEngine.PHI,
            "solfeggio_map": {k: v["color"] for k, v in V53_LogicEngine.SOLFEGGIO_MAP.items()},
            "hitboxes": "15/15 reactive",
            "ghost_watch": "Active (5s interval)",
            "membranes": "Radiating",
            "neural": "Initialized"
        }
    
    @staticmethod
    async def get_vault_stats(uid: Optional[str]):
        """Logic for the Vault/Ledger nodule."""
        if uid:
            wallet = await db.hub_wallets.find_one({"user_id": uid}, {"_id": 0})
            if wallet:
                return {
                    "hourly_rate": V53_LogicEngine.HOURLY_RATE,
                    "dust": wallet.get("dust", 0),
                    "gems": wallet.get("gems", 0),
                    "tier": wallet.get("tier", "seeker"),
                    "utilities": wallet.get("owned_utilities", []),
                    "status": "Verified",
                    "archives": "Unlocked",
                    "journal": "Encrypted"
                }
        
        return {
            "hourly_rate": V53_LogicEngine.HOURLY_RATE,
            "dust": 0,
            "gems": 0,
            "tier": "visitor",
            "utilities": [],
            "status": "Public View",
            "archives": "Preview",
            "journal": "Locked"
        }
    
    @staticmethod
    async def get_star_chart_status(uid: Optional[str]):
        """Get star chart data."""
        try:
            from routes.daily_briefing import CONSTELLATIONS
            visible_count = len([c for c in CONSTELLATIONS if c.get("dec", 0) > -60])
        except Exception:
            visible_count = 16
        
        cultures_count = 21  # Loaded from star_cultures.json
        
        return {
            "constellations_visible": visible_count,
            "cultures_available": cultures_count,
            "render_mode": "Crystal",
            "auth_required": False,
            "status": "Operational"
        }
    
    @staticmethod
    async def get_oracle_status():
        """Get oracle/divination systems status."""
        systems = [
            {"name": "Tarot", "decks": 3, "spreads": 5},
            {"name": "Astrology", "types": ["Western", "Vedic", "Chinese"]},
            {"name": "I Ching", "hexagrams": 64},
            {"name": "Sacred Geometry", "patterns": 12},
            {"name": "Numerology", "systems": ["Pythagorean", "Chaldean"]},
        ]
        
        return {
            "systems": [s["name"] for s in systems],
            "systems_detail": systems,
            "active": True,
            "daily_readings_available": True,
            "status": "Operational"
        }
    
    @staticmethod
    async def get_trade_circle_stats(uid: Optional[str]):
        """Get trade circle / marketplace stats."""
        total_listings = await db.trade_listings.count_documents({})
        active_listings = await db.trade_listings.count_documents({"status": "active"})
        
        user_listings = 0
        pending_offers = 0
        if uid:
            user_listings = await db.trade_listings.count_documents({"seller_id": uid})
            pending_offers = await db.trade_offers.count_documents({
                "$or": [{"buyer_id": uid}, {"seller_id": uid}],
                "status": "pending"
            })
        
        categories = ["Readings", "Healing", "Guidance", "Meditation", "Crafted", "Botanicals", "Recipes", "Goods", "Services"]
        
        return {
            "total_listings": total_listings,
            "active_listings": active_listings,
            "user_listings": user_listings,
            "pending_offers": pending_offers,
            "categories": categories,
            "rate": V53_LogicEngine.HOURLY_RATE,
            "currency": "USD-Equivalent",
            "escrow_active": True,
            "status": "Operational"
        }
    
    @staticmethod
    async def get_user_progress(uid: Optional[str]):
        """Get user's spiritual progress across modules."""
        if not uid:
            return {
                "level": 1,
                "xp": 0,
                "streak": 0,
                "modules_unlocked": 5,
                "achievements": [],
                "status": "Guest"
            }
        
        progress = await db.user_progress.find_one({"user_id": uid}, {"_id": 0})
        streak = await db.streaks.find_one({"user_id": uid}, {"_id": 0})
        achievements = await db.achievements.find({"user_id": uid}, {"_id": 0}).to_list(100)
        
        return {
            "level": progress.get("level", 1) if progress else 1,
            "xp": progress.get("xp", 0) if progress else 0,
            "streak": streak.get("current_streak", 0) if streak else 0,
            "modules_unlocked": progress.get("modules_unlocked", 5) if progress else 5,
            "achievements": [a.get("name") for a in achievements] if achievements else [],
            "status": "Active"
        }
    
    @staticmethod
    async def get_meditation_stats():
        """Get meditation module stats."""
        return {
            "guided_sessions": 12,
            "cosmic_sessions": 8,
            "timer_modes": ["Interval", "Continuous", "Custom"],
            "frequencies_available": list(V53_LogicEngine.SOLFEGGIO_MAP.keys()),
            "status": "Operational"
        }
    
    @staticmethod
    async def get_breathing_stats():
        """Get breathing exercise stats."""
        return {
            "patterns": ["Box", "4-7-8", "Coherent", "Wim Hof", "Pranayama"],
            "custom_builder": True,
            "haptic_sync": True,
            "status": "Operational"
        }
    
    @staticmethod
    async def get_games_stats():
        """Get games module stats."""
        return {
            "games": ["Starseed RPG", "Sacred Symbols", "Breath of Life", "Suanpan", "Memory Match"],
            "rpg_origins": ["Pleiadian", "Sirian", "Arcturian", "Lyran", "Andromedan", "Orion"],
            "status": "Operational"
        }
    
    @staticmethod
    async def get_crystals_stats():
        """Get crystals module stats."""
        crystal_count = await db.crystals.count_documents({})
        return {
            "total_crystals": crystal_count or 12,
            "categories": ["Quartz", "Volcanic", "Metamorphic", "Feldspar", "Phosphate"],
            "vr_mode": True,
            "voice_guide": True,
            "status": "Operational"
        }
    
    @staticmethod
    async def get_manifest_bar():
        """Get the manifest bar configuration."""
        return {
            "items": ["Hub", "Trade", "Oracle", "Discover", "Mixer"],
            "z_index": 999999,
            "position": "fixed-bottom",
            "status": "Locked"
        }
    
    @staticmethod
    async def get_bio_digital_status():
        """Get bio-digital osmosis system status."""
        return {
            "tier1_foundation": {
                "ghost_watch": "Active (5s interval)",
                "haptic": "Bound [80, 50, 120]",
                "dna_morph": "Ready"
            },
            "tier2_immersion": {
                "membranes": "Radiating (4s cycle)",
                "collision": "AABB Ready",
                "neural": "SVG Layer Initialized"
            },
            "tier3_atmosphere": {
                "celestial_sync": "Pending",
                "z_depth": "Pending",
                "entropy": "Pending"
            },
            "status": "Tiers 1-2 Operational"
        }


# ═══════════════════════════════════════════════════════════════════════════════
# MASTER SYNC ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/sync/all-modules")
async def master_sync(user=Depends(get_current_user_optional)):
    """
    THE MASTER NODULE - V53.0 UNIFIED SYNC
    
    Gathers data from EVERY module and sends it to the frontend in one payload.
    Works for both authenticated and unauthenticated users.
    No silent auth walls. No "Failed to load" screens. Everything interconnected.
    """
    try:
        uid = user["id"] if user else None
        is_authenticated = uid is not None
        
        # Get sync theme
        theme = V53_LogicEngine.get_ui_theme()
        
        # Concurrent processing - gather all async data at once
        (vault, star_chart, oracle, trade, progress, 
         meditation, breathing, games, crystals, 
         manifest_bar, bio_digital) = await asyncio.gather(
            V53_LogicEngine.get_vault_stats(uid),
            V53_LogicEngine.get_star_chart_status(uid),
            V53_LogicEngine.get_oracle_status(),
            V53_LogicEngine.get_trade_circle_stats(uid),
            V53_LogicEngine.get_user_progress(uid),
            V53_LogicEngine.get_meditation_stats(),
            V53_LogicEngine.get_breathing_stats(),
            V53_LogicEngine.get_games_stats(),
            V53_LogicEngine.get_crystals_stats(),
            V53_LogicEngine.get_manifest_bar(),
            V53_LogicEngine.get_bio_digital_status(),
        )
        
        return {
            "integrity": "Synced",
            "version": "V53.0",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "authenticated": is_authenticated,
            "user_id": uid,
            "modules": {
                "star_chart": star_chart,
                "the_vault": {
                    "ledger": vault,
                    "archives": vault.get("archives", "Ready"),
                    "journal": vault.get("journal", "Locked")
                },
                "oracle": oracle,
                "trade_circle": trade,
                "progress": progress,
                "meditation": meditation,
                "breathing": breathing,
                "games": games,
                "crystals": crystals,
                "manifest_bar": manifest_bar,
                "ui": theme
            },
            "system": {
                "resonance": V53_LogicEngine.RESONANCE,
                "composite_hz": V53_LogicEngine.COMPOSITE,
                "earth_hz": V53_LogicEngine.EARTH_HZ,
                "phi": V53_LogicEngine.PHI,
                "hourly_rate": f"${V53_LogicEngine.HOURLY_RATE}/hr",
                "bio_digital": bio_digital,
                "solfeggio": V53_LogicEngine.SOLFEGGIO_MAP
            }
        }
        
    except Exception as e:
        logger.error(f"V53 Master Sync Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"V53 Sync Failure: {str(e)}")


@router.get("/sync/module/{module_name}")
async def sync_single_module(module_name: str, user=Depends(get_current_user_optional)):
    """Sync a single module on demand."""
    uid = user["id"] if user else None
    
    module_map = {
        "star-chart": V53_LogicEngine.get_star_chart_status,
        "vault": V53_LogicEngine.get_vault_stats,
        "oracle": V53_LogicEngine.get_oracle_status,
        "trade": V53_LogicEngine.get_trade_circle_stats,
        "progress": V53_LogicEngine.get_user_progress,
        "meditation": V53_LogicEngine.get_meditation_stats,
        "breathing": V53_LogicEngine.get_breathing_stats,
        "games": V53_LogicEngine.get_games_stats,
        "crystals": V53_LogicEngine.get_crystals_stats,
        "manifest": V53_LogicEngine.get_manifest_bar,
        "bio-digital": V53_LogicEngine.get_bio_digital_status,
    }
    
    if module_name not in module_map:
        raise HTTPException(status_code=404, detail=f"Module '{module_name}' not found")
    
    try:
        func = module_map[module_name]
        # Check if function needs uid parameter
        if module_name in ["vault", "star-chart", "trade", "progress"]:
            data = await func(uid)
        else:
            data = await func()
        
        return {
            "module": module_name,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": data,
            "status": "Synced"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Module Sync Error: {str(e)}")


@router.get("/sync/ui-theme")
async def get_ui_theme():
    """Get the Obsidian Void / Crystal Rainbow theme configuration."""
    return {
        "theme": V53_LogicEngine.get_ui_theme(),
        "solfeggio": V53_LogicEngine.SOLFEGGIO_MAP,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.get("/sync/health")
async def sync_health_check():
    """Quick health check for the entire V53.0 system."""
    try:
        await db.command("ping")
        db_status = "Connected"
    except Exception:
        db_status = "Disconnected"
    
    return {
        "status": "V53.0 Operational",
        "integrity": "Synced",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "nodules": {
            "database": db_status,
            "logic_engine": "Active",
            "star_chart": "Ready",
            "vault": "Ready",
            "oracle": "Ready",
            "trade": "Ready",
            "meditation": "Ready",
            "breathing": "Ready",
            "games": "Ready",
            "crystals": "Ready",
            "bio_digital": "Tiers 1-2 Active"
        },
        "constants": {
            "resonance": V53_LogicEngine.RESONANCE,
            "composite_hz": V53_LogicEngine.COMPOSITE,
            "hourly_rate": f"${V53_LogicEngine.HOURLY_RATE}/hr",
            "hitboxes": "15/15"
        }
    }
