"""
ENLIGHTEN.MINT.CAFE - AUTONOMOUS TREASURY API
autonomous_treasury_api.py

API Endpoints for the Self-Sustaining Ledger Protocol.
Enables the Equity Reservoir to manage its own operating costs.

ROUTES:
- GET  /api/treasury/status        - Public telemetry
- GET  /api/treasury/audit         - Master-only full audit view
- GET  /api/treasury/cashflow      - Cash flow waveform data
- POST /api/treasury/revenue       - Add incoming revenue
- POST /api/treasury/authorize     - Authorize pending payment
- POST /api/treasury/emergency-stop - Emergency stop autonomous spending
- POST /api/treasury/resume        - Resume autonomous operations
"""

from fastapi import APIRouter, HTTPException, Depends, Body
from deps import logger, get_current_user, get_current_user_optional
from datetime import datetime, timezone

from utils.autonomous_treasury import autonomous_treasury


router = APIRouter()


@router.get("/treasury/status")
async def get_treasury_status():
    """
    Get public treasury telemetry.
    
    No sensitive data exposed - safe for public viewing.
    """
    try:
        telemetry = autonomous_treasury.get_public_telemetry()
        return {
            "status": "success",
            "treasury": telemetry,
        }
    except Exception as e:
        logger.error(f"TREASURY_API: Status retrieval failed | Error: {str(e)}")
        raise HTTPException(500, f"Treasury status retrieval failed: {str(e)}")


@router.get("/treasury/audit")
async def get_treasury_audit(user=Depends(get_current_user)):
    """
    Get the full audit view - MASTER AUTHORITY ONLY.
    
    Returns the complete 'Blood' view including:
    - Full equity details
    - All transactions
    - Pending authorizations
    - Master Print ID
    """
    try:
        audit = autonomous_treasury.get_master_audit(user.get("email", ""))
        
        if audit is None:
            raise HTTPException(403, "Only Master Authority can access the audit view")
        
        return {
            "status": "success",
            "audit": audit,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"TREASURY_API: Audit retrieval failed | Error: {str(e)}")
        raise HTTPException(500, f"Audit retrieval failed: {str(e)}")


@router.get("/treasury/cashflow")
async def get_cash_flow(hours: int = 24):
    """
    Get cash flow waveform data for visualization.
    
    Query Params:
        hours: Time period in hours (default: 24)
    """
    try:
        waveform = autonomous_treasury.get_cash_flow_waveform(hours)
        return {
            "status": "success",
            "cashflow": waveform,
        }
    except Exception as e:
        logger.error(f"TREASURY_API: Cash flow retrieval failed | Error: {str(e)}")
        raise HTTPException(500, f"Cash flow retrieval failed: {str(e)}")


@router.post("/treasury/revenue")
async def add_revenue(
    data: dict = Body(...),
    user=Depends(get_current_user_optional)
):
    """
    Add incoming revenue to the equity reservoir.
    
    Request Body:
        amount: float - Revenue amount
        source: str - Revenue source (volunteer_credit, advocacy, etc.)
        node: str (optional) - Wellness node attribution
    """
    amount = data.get("amount")
    source = data.get("source")
    node = data.get("node")
    
    if not amount or not source:
        raise HTTPException(400, "Both 'amount' and 'source' are required")
    
    try:
        amount = float(amount)
        if amount <= 0:
            raise HTTPException(400, "Amount must be positive")
    except (TypeError, ValueError):
        raise HTTPException(400, "Invalid amount format")
    
    try:
        result = autonomous_treasury.add_revenue(amount, source, node)
        return {
            "status": "success",
            "result": result,
        }
    except Exception as e:
        logger.error(f"TREASURY_API: Revenue addition failed | Error: {str(e)}")
        raise HTTPException(500, f"Revenue addition failed: {str(e)}")


@router.post("/treasury/authorize")
async def authorize_payment(
    data: dict = Body(...),
    user=Depends(get_current_user)
):
    """
    Authorize a pending payment that exceeded the φ cap.
    
    MASTER AUTHORITY ONLY.
    
    Request Body:
        pending_id: str - ID of the pending authorization
    """
    pending_id = data.get("pending_id")
    
    if not pending_id:
        raise HTTPException(400, "'pending_id' is required")
    
    try:
        result = autonomous_treasury.authorize_pending(
            pending_id,
            user.get("email", "")
        )
        
        if result["status"] == "DENIED":
            raise HTTPException(403, result["reason"])
        
        if result["status"] == "NOT_FOUND":
            raise HTTPException(404, result["reason"])
        
        return {
            "status": "success",
            "result": result,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"TREASURY_API: Authorization failed | Error: {str(e)}")
        raise HTTPException(500, f"Authorization failed: {str(e)}")


@router.post("/treasury/emergency-stop")
async def emergency_stop(
    data: dict = Body(default={}),
    user=Depends(get_current_user)
):
    """
    Emergency stop for autonomous spending.
    
    MASTER AUTHORITY ONLY.
    
    Request Body (optional):
        voice_command: str - Voice command that triggered the stop
    """
    voice_command = data.get("voice_command", "")
    
    try:
        result = autonomous_treasury.emergency_stop(
            user.get("email", ""),
            voice_command
        )
        
        if result["status"] == "DENIED":
            raise HTTPException(403, result["reason"])
        
        return {
            "status": "success",
            "result": result,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"TREASURY_API: Emergency stop failed | Error: {str(e)}")
        raise HTTPException(500, f"Emergency stop failed: {str(e)}")


@router.post("/treasury/resume")
async def resume_autonomous(user=Depends(get_current_user)):
    """
    Resume autonomous operations after emergency stop.
    
    MASTER AUTHORITY ONLY.
    """
    try:
        result = autonomous_treasury.resume_autonomous(user.get("email", ""))
        
        if result["status"] == "DENIED":
            raise HTTPException(403, result["reason"])
        
        return {
            "status": "success",
            "result": result,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"TREASURY_API: Resume failed | Error: {str(e)}")
        raise HTTPException(500, f"Resume failed: {str(e)}")


@router.get("/treasury/pending")
async def get_pending_authorizations(user=Depends(get_current_user)):
    """
    Get pending authorizations that exceed the φ cap.
    
    MASTER AUTHORITY ONLY.
    """
    if user.get("email") != autonomous_treasury.MASTER_EMAIL:
        raise HTTPException(403, "Only Master Authority can view pending authorizations")
    
    return {
        "status": "success",
        "pending": autonomous_treasury.pending_authorizations,
        "phi_cap": autonomous_treasury.equity_reservoir * autonomous_treasury.PHI_CAP,
    }
