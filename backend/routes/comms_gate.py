"""
ENLIGHTEN.MINT.CAFE - V-FINAL COMMS GATE API
Exposes the Communications Hub functionality via REST endpoints.
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from utils.comms_gate import comms

router = APIRouter(prefix="/comms", tags=["communications"])


@router.get("/status")
async def get_comms_status():
    """
    V-FINAL COMMS GATE — STATUS
    
    Returns the current status of all communication channels:
    - Twilio SMS
    - SendGrid Email
    - Nodal Network
    """
    return comms.get_status()


@router.post("/sms/send")
async def send_sms_alert(
    to_number: str = Query(..., description="Recipient phone (E.164: +1XXXXXXXXXX)"),
    message: str = Query(..., description="Alert message"),
):
    """
    V-FINAL COMMS GATE — SEND SMS
    
    Send an SMS alert via Twilio Gateway.
    Phone must be in E.164 format (e.g., +16055551234).
    """
    if not to_number.startswith("+"):
        raise HTTPException(400, "Phone must be E.164 format (+1XXXXXXXXXX)")
    
    result = comms.send_sms_alert(to_number, message)
    
    if result["status"] == "error":
        raise HTTPException(500, result["message"])
    
    return result


@router.post("/email/send")
async def send_vault_report(
    report_data: str = Query(..., description="Report content (HTML supported)"),
    to_email: Optional[str] = Query(None, description="Recipient email (optional)"),
):
    """
    V-FINAL COMMS GATE — SEND EMAIL
    
    Dispatch a Vault Ledger Report via SendGrid.
    Defaults to primary email if no recipient specified.
    """
    result = comms.send_vault_report(report_data, to_email)
    
    if result["status"] == "error":
        raise HTTPException(500, result["message"])
    
    return result


@router.get("/nodes")
async def get_nodes():
    """
    V-FINAL COMMS GATE — LIST NODES
    
    Returns all nodes in the Seven Seals Network.
    """
    return {
        "version": "V-FINAL",
        "network": "Seven Seals",
        "nodes": comms.NODES,
        "count": len(comms.NODES),
    }


@router.post("/nodes/sync")
async def sync_node(
    node_id: str = Query(..., description="Node ID (e.g., BLACK_HILLS_V1, GENEVA_V3)"),
):
    """
    V-FINAL COMMS GATE — SYNC NODE
    
    Synchronize a specific node in the Sovereign Network.
    """
    result = comms.sync_nodal_network(node_id)
    
    if result["status"] == "error":
        raise HTTPException(404, result["message"])
    
    return result


@router.post("/nodes/broadcast")
async def broadcast_to_network(
    message: str = Query(..., description="Broadcast message"),
):
    """
    V-FINAL COMMS GATE — BROADCAST
    
    Broadcast a message to all nodes in the Seven Seals Network.
    """
    return comms.broadcast_to_all_nodes(message)


@router.get("/history")
async def get_broadcast_history(
    limit: int = Query(default=50, ge=1, le=200, description="Max results"),
):
    """
    V-FINAL COMMS GATE — BROADCAST HISTORY
    
    Returns recent SMS and Email broadcast history.
    """
    return {
        "history": comms.get_broadcast_history(limit),
        "total": len(comms._broadcast_history),
    }
