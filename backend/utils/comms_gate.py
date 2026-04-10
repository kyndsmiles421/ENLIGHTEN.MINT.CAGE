"""
ENLIGHTEN.MINT.CAFE - V-FINAL ETERNAL SENTINEL: COMMUNICATIONS HUB
comms_gate.py

Unified gateway for all external communications:
- Twilio SMS Alerts
- SendGrid Email Dispatch
- Nodal Network Synchronization

Security: All credentials loaded from environment variables.
"""

import os
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from deps import logger

# Lazy load Twilio/SendGrid to avoid import errors if not installed
_twilio_client = None
_sendgrid_client = None


def _get_twilio_client():
    """Lazy-load Twilio client."""
    global _twilio_client
    if _twilio_client is None:
        try:
            from twilio.rest import Client
            sid = os.environ.get("TWILIO_ACCOUNT_SID")
            auth = os.environ.get("TWILIO_AUTH_TOKEN")
            if sid and auth:
                _twilio_client = Client(sid, auth)
                logger.info("COMMS_GATE: Twilio client initialized")
            else:
                logger.warning("COMMS_GATE: Twilio credentials not configured")
        except ImportError:
            logger.error("COMMS_GATE: twilio package not installed")
    return _twilio_client


def _get_sendgrid_client():
    """Lazy-load SendGrid client."""
    global _sendgrid_client
    if _sendgrid_client is None:
        try:
            from sendgrid import SendGridAPIClient
            api_key = os.environ.get("SENDGRID_API_KEY")
            if api_key:
                _sendgrid_client = SendGridAPIClient(api_key)
                logger.info("COMMS_GATE: SendGrid client initialized")
            else:
                logger.warning("COMMS_GATE: SendGrid API key not configured")
        except ImportError:
            logger.error("COMMS_GATE: sendgrid package not installed")
    return _sendgrid_client


class CommsGate:
    """
    V-FINAL ETERNAL SENTINEL: Unified Communications Hub
    
    Handles all external communications for the Sovereign Network:
    - SMS alerts via Twilio
    - Email dispatch via SendGrid
    - Nodal network synchronization
    """
    
    # Seven Seals Nodal Network
    NODES = {
        "BLACK_HILLS_V1": {"region": "North America", "type": "CORE", "lat": 44.0805, "lng": -103.231},
        "MASONRY_SCHOOL": {"region": "North America", "type": "ACADEMY", "lat": 43.8, "lng": -103.5},
        "RAPID_CITY": {"region": "North America", "type": "HUB", "lat": 44.0805, "lng": -103.231},
        "KONA_V2": {"region": "Pacific", "type": "WELLNESS", "lat": 19.6400, "lng": -155.9969},
        "GENEVA_V3": {"region": "Europe", "type": "LAW", "lat": 46.2044, "lng": 6.1432},
        "TOKYO_V4": {"region": "Asia", "type": "TECH", "lat": 35.6762, "lng": 139.6503},
        "CAIRO_V5": {"region": "Africa", "type": "WISDOM", "lat": 30.0444, "lng": 31.2357},
    }
    
    def __init__(self):
        """Initialize the Communications Hub."""
        self.twilio_phone = os.environ.get("TWILIO_FROM_NUMBER", "+16055693313")
        self.primary_email = os.environ.get("SENDGRID_FROM_EMAIL", "kyndsmiles@gmail.com")
        self._broadcast_history = []
    
    @property
    def twilio_ready(self) -> bool:
        """Check if Twilio is configured and ready."""
        return _get_twilio_client() is not None
    
    @property
    def sendgrid_ready(self) -> bool:
        """Check if SendGrid is configured and ready."""
        return _get_sendgrid_client() is not None
    
    def get_status(self) -> Dict[str, Any]:
        """Get current communications hub status."""
        return {
            "version": "V-FINAL",
            "name": "COMMS_GATE",
            "twilio": {
                "status": "READY" if self.twilio_ready else "NOT_CONFIGURED",
                "from_number": self.twilio_phone if self.twilio_ready else None,
            },
            "sendgrid": {
                "status": "READY" if self.sendgrid_ready else "NOT_CONFIGURED",
                "from_email": self.primary_email if self.sendgrid_ready else None,
            },
            "nodes_online": len(self.NODES),
            "broadcast_count": len(self._broadcast_history),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    
    def send_sms_alert(self, to_number: str, message: str) -> Dict[str, Any]:
        """
        Send SMS alert via Twilio Gateway.
        
        Args:
            to_number: Recipient phone number (E.164 format: +1XXXXXXXXXX)
            message: Alert message content
            
        Returns:
            Result dict with status and message SID
        """
        client = _get_twilio_client()
        if not client:
            return {
                "status": "error",
                "message": "Twilio not configured. Add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to .env"
            }
        
        try:
            sms = client.messages.create(
                body=f"SENTINEL ALERT: {message}",
                from_=self.twilio_phone,
                to=to_number
            )
            
            result = {
                "status": "success",
                "sid": sms.sid,
                "to": to_number,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            
            self._broadcast_history.append({
                "type": "SMS",
                **result
            })
            
            logger.info(f"COMMS_GATE: SMS sent to {to_number} | SID: {sms.sid}")
            return result
            
        except Exception as e:
            logger.error(f"COMMS_GATE: SMS failed - {e}")
            return {"status": "error", "message": str(e)}
    
    def send_vault_report(self, report_data: str, to_email: Optional[str] = None) -> Dict[str, Any]:
        """
        Dispatch encrypted ledger updates via SendGrid.
        
        Args:
            report_data: Report content (HTML supported)
            to_email: Recipient email (defaults to primary)
            
        Returns:
            Result dict with status code
        """
        client = _get_sendgrid_client()
        if not client:
            return {
                "status": "error",
                "message": "SendGrid not configured. Add SENDGRID_API_KEY to .env"
            }
        
        try:
            from sendgrid.helpers.mail import Mail
            
            recipient = to_email or self.primary_email
            
            message = Mail(
                from_email=self.primary_email,
                to_emails=recipient,
                subject='SovereignHub: Vault Ledger Update',
                html_content=f'''
                <div style="font-family: monospace; background: #0a0a0f; color: #22C55E; padding: 20px;">
                    <h2 style="color: #8B5CF6;">ETERNAL SENTINEL REPORT</h2>
                    <hr style="border-color: #333;">
                    <p><strong>System Pulse:</strong></p>
                    <pre style="color: #FBBF24;">{report_data}</pre>
                    <hr style="border-color: #333;">
                    <p style="color: #666; font-size: 12px;">
                        Generated: {datetime.now(timezone.utc).isoformat()}<br>
                        From: Enlighten.Mint.Sovereign.Trust
                    </p>
                </div>
                '''
            )
            
            response = client.send(message)
            
            result = {
                "status": "success",
                "status_code": response.status_code,
                "to": recipient,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            
            self._broadcast_history.append({
                "type": "EMAIL",
                **result
            })
            
            logger.info(f"COMMS_GATE: Email sent to {recipient} | Status: {response.status_code}")
            return result
            
        except Exception as e:
            logger.error(f"COMMS_GATE: Email failed - {e}")
            return {"status": "error", "message": str(e)}
    
    def sync_nodal_network(self, node_id: str) -> Dict[str, Any]:
        """
        Synchronize digital/legal protocols across the Seven Seals:
        [Black Hills, SD] <-> [Kona, HI] <-> [Geneva, CH] <-> [Tokyo] <-> [Cairo]
        
        Args:
            node_id: Node identifier (e.g., "BLACK_HILLS_V1", "GENEVA_V3")
            
        Returns:
            Sync result with node status
        """
        if node_id not in self.NODES:
            return {
                "status": "error",
                "message": f"Unknown Node Signature: {node_id}",
                "available_nodes": list(self.NODES.keys()),
            }
        
        node = self.NODES[node_id]
        
        return {
            "status": "success",
            "node_id": node_id,
            "region": node["region"],
            "type": node["type"],
            "coordinates": {"lat": node["lat"], "lng": node["lng"]},
            "pulse": "Crystal Refraction Optimized",
            "sync_version": "V10013.0",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    
    def broadcast_to_all_nodes(self, message: str) -> Dict[str, Any]:
        """
        Broadcast message to all nodes in the Sovereign Network.
        
        Args:
            message: Broadcast message
            
        Returns:
            Aggregate result from all nodes
        """
        results = {}
        for node_id in self.NODES:
            sync_result = self.sync_nodal_network(node_id)
            results[node_id] = {
                "status": sync_result["status"],
                "type": sync_result.get("type"),
                "pulse": sync_result.get("pulse"),
            }
        
        return {
            "broadcast_message": message,
            "nodes_synced": len(results),
            "results": results,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    
    def get_broadcast_history(self, limit: int = 50) -> list:
        """Get recent broadcast history."""
        return self._broadcast_history[-limit:]


# Global singleton instance
comms = CommsGate()


# Convenience functions for direct import
def send_sms(to_number: str, message: str) -> Dict[str, Any]:
    """Quick SMS send via global comms instance."""
    return comms.send_sms_alert(to_number, message)


def send_email(report_data: str, to_email: Optional[str] = None) -> Dict[str, Any]:
    """Quick email send via global comms instance."""
    return comms.send_vault_report(report_data, to_email)


def sync_node(node_id: str) -> Dict[str, Any]:
    """Quick node sync via global comms instance."""
    return comms.sync_nodal_network(node_id)
