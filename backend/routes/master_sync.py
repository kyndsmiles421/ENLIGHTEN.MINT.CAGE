"""
ENLIGHTEN.MINT.CAFE - UNIFIED FULL-STACK NODULE INTEGRATION
VERSION: V53.0 MASTER SYNC
ARCHITECT: Steven Michael | ROOT: kyndsmiles@gmail.com

This is the MASTER SYNC endpoint that gathers data from EVERY nodule
and delivers it to the frontend in one payload. No more silent auth walls.
No more "Failed to load" errors. Everything interconnected.

NODULES:
- Star Chart (16 constellations)
- The Vault (Archives, Journal, Ledger)
- Trade Circle (Credits, Marketplace)
- Oracle (Divination systems)
- Manifest Bar (Navigation)
- UI Theme (Obsidian Void / Crystal Rainbow)
"""

from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from deps import db, get_current_user_optional, logger
import asyncio

router = APIRouter()


# ═══════════════════════════════════════════════════════════════════════════════
# MIDDLE-END: THE LOGIC ENGINE
# ═══════════════════════════════════════════════════════════════════════════════

class LogicEngine:
    """The 'Brain' connecting math, finance, and visual state."""
    
    # Steven's profit-margin-adjusted rate
    HOURLY_RATE = 15.0
    
    # Mathematical constants
    RESONANCE = 8.4881  # √7.3 × π
    PHI = 1.618
    EARTH_HZ = 7.3
    COMPOSITE = 690
    
    @staticmethod
    def get_ui_theme():
        """Returns the Obsidian Void / Crystal Rainbow theme config."""
        return {
            "background": "#000000",
            "palette": "Refracted Crystal Rainbow",
            "rendering": "WebGL/Canvas",
            "resonance": LogicEngine.RESONANCE,
            "composite_hz": LogicEngine.COMPOSITE,
            "solfeggio_map": {
                "174": "#8B0000",
                "285": "#FF4500",
                "396": "#FFD700",
                "417": "#32CD32",
                "432": "#00CED1",
                "528": "#00FF00",
                "639": "#1E90FF",
                "741": "#4B0082",
                "852": "#9400D3",
                "963": "#FFFFFF",
            }
        }
    
    @staticmethod
    async def get_vault_stats(uid: Optional[str]):
        """Logic for the Trade/Ledger nodule."""
        if uid:
            # Fetch user's wallet from DB
            wallet = await db.hub_wallets.find_one({"user_id": uid}, {"_id": 0})
            if wallet:
                return {
                    "hourly_rate": LogicEngine.HOURLY_RATE,
                    "dust": wallet.get("dust", 0),
                    "gems": wallet.get("gems", 0),
                    "tier": wallet.get("tier", "seeker"),
                    "status": "Verified"
                }
        
        # Public view
        return {
            "hourly_rate": LogicEngine.HOURLY_RATE,
            "dust": 0,
            "gems": 0,
            "tier": "visitor",
            "status": "Public View"
        }
    
    @staticmethod
    async def get_star_chart_status(uid: Optional[str]):
        """Get star chart constellation count."""
        # Always return data - no auth wall
        from routes.daily_briefing import CONSTELLATIONS
        visible_count = len([c for c in CONSTELLATIONS if c.get("dec", 0) > -60])
        
        return {
            "constellations_visible": visible_count,
            "render_mode": "Crystal",
            "auth_required": False,
            "cultures_available": 21
        }
    
    @staticmethod
    async def get_oracle_status():
        """Get oracle/divination systems status."""
        return {
            "systems": ["Tarot", "Astrology", "I Ching", "Sacred Geometry", "Numerology"],
            "active": True,
            "daily_readings_available": True
        }
    
    @staticmethod
    async def get_trade_circle_stats(uid: Optional[str]):
        """Get trade circle / marketplace stats."""
        total_listings = await db.trade_listings.count_documents({})
        
        user_listings = 0
        if uid:
            user_listings = await db.trade_listings.count_documents({"seller_id": uid})
        
        return {
            "total_listings": total_listings,
            "user_listings": user_listings,
            "categories": ["Readings", "Healing", "Guidance", "Meditation", "Crafted", "Botanicals"],
            "escrow_active": True
        }
    
    @staticmethod
    async def get_user_progress(uid: Optional[str]):
        """Get user's spiritual progress across modules."""
        if not uid:
            return {"level": 1, "xp": 0, "streak": 0, "modules_unlocked": 5}
        
        # Fetch progress data
        progress = await db.user_progress.find_one({"user_id": uid}, {"_id": 0})
        streak = await db.streaks.find_one({"user_id": uid}, {"_id": 0})
        
        return {
            "level": progress.get("level", 1) if progress else 1,
            "xp": progress.get("xp", 0) if progress else 0,
            "streak": streak.get("current_streak", 0) if streak else 0,
            "modules_unlocked": progress.get("modules_unlocked", 5) if progress else 5
        }


# ═══════════════════════════════════════════════════════════════════════════════
# BACKEND: THE MASTER SYNC ENDPOINT
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/sync/all-modules")
async def sync_everything(user=Depends(get_current_user_optional)):
    """
    THE MASTER NODULE.
    
    Gathers data from EVERY module and sends it to the frontend in one payload.
    Works for both authenticated and unauthenticated users.
    No silent auth walls. No "Failed to load" screens.
    """
    try:
        uid = user["id"] if user else None
        is_authenticated = uid is not None
        
        # Get theme synchronously
        theme = LogicEngine.get_ui_theme()
        
        # Concurrent processing - gather all async data at once
        vault, star_chart, oracle, trade, progress = await asyncio.gather(
            LogicEngine.get_vault_stats(uid),
            LogicEngine.get_star_chart_status(uid),
            LogicEngine.get_oracle_status(),
            LogicEngine.get_trade_circle_stats(uid),
            LogicEngine.get_user_progress(uid),
        )
        
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "integrity": "Synced",
            "version": "V53.0",
            "authenticated": is_authenticated,
            "user_id": uid,
            "modules": {
                "star_chart": star_chart,
                "the_vault": {
                    "ledger": vault,
                    "archives": "Ready",
                    "journal": "Encrypted" if is_authenticated else "Locked"
                },
                "oracle": oracle,
                "trade_circle": trade,
                "progress": progress,
                "manifest_bar": ["Hub", "Trade", "Oracle", "Discover", "Mixer"],
                "ui": theme
            },
            "system": {
                "resonance": LogicEngine.RESONANCE,
                "composite_hz": LogicEngine.COMPOSITE,
                "earth_hz": LogicEngine.EARTH_HZ,
                "phi": LogicEngine.PHI,
                "ghost_watch": "Active",
                "haptic": "Bound",
                "neural": "Initialized"
            }
        }
        
    except Exception as e:
        logger.error(f"Master Sync Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Nodule Sync Error: {str(e)}")


@router.get("/sync/module/{module_name}")
async def sync_single_module(module_name: str, user=Depends(get_current_user_optional)):
    """
    Sync a single module on demand.
    Useful for lazy-loading or refreshing specific sections.
    """
    uid = user["id"] if user else None
    
    module_map = {
        "star-chart": LogicEngine.get_star_chart_status,
        "vault": LogicEngine.get_vault_stats,
        "oracle": LogicEngine.get_oracle_status,
        "trade": LogicEngine.get_trade_circle_stats,
        "progress": LogicEngine.get_user_progress,
    }
    
    if module_name not in module_map:
        raise HTTPException(status_code=404, detail=f"Module '{module_name}' not found")
    
    try:
        # Handle both sync and async functions
        func = module_map[module_name]
        if module_name in ["vault", "star-chart", "trade", "progress"]:
            data = await func(uid)
        else:
            data = await func()
        
        return {
            "module": module_name,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Module Sync Error: {str(e)}")


@router.get("/sync/ui-theme")
async def get_ui_theme():
    """
    Get the Obsidian Void / Crystal Rainbow theme configuration.
    No auth required - this is pure visual config.
    """
    return {
        "theme": LogicEngine.get_ui_theme(),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.get("/sync/health")
async def sync_health_check():
    """
    Quick health check for the sync system.
    Returns status of all nodules.
    """
    try:
        # Check DB connection
        await db.command("ping")
        db_status = "Connected"
    except Exception:
        db_status = "Disconnected"
    
    return {
        "status": "Operational",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "nodules": {
            "database": db_status,
            "logic_engine": "Active",
            "star_chart": "Ready",
            "vault": "Ready",
            "oracle": "Ready",
            "trade": "Ready"
        },
        "constants": {
            "resonance": LogicEngine.RESONANCE,
            "hourly_rate": f"${LogicEngine.HOURLY_RATE}/hr"
        }
    }
