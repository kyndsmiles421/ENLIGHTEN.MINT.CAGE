import hashlib
import hmac
import base64
import json
from datetime import datetime, timezone
from Crypto.Cipher import AES, PKCS1_OAEP
from Crypto.PublicKey import RSA
from Crypto.Random import get_random_bytes

class SovereignRefractor:
    """
    Dual-Channel Secure Transmission Engine
    
    Splits encrypted artifacts into two streams:
    - SMS: Contains status + refractive_index (Outer Barrier notification)
    - Email: Contains encrypted_payload (Inner Core data)
    
    Both streams must be reunited at the Inner Core to decrypt.
    """
    def __init__(self):
        self.PHI = 1.618033
        # Generating System-Root Barrier Keys
        self.key = RSA.generate(2048)
        self.cipher_rsa = PKCS1_OAEP.new(self.key.publickey())
        self.decrypt_cipher = PKCS1_OAEP.new(self.key)

    def execute_scan(self, sample_id: str, sensor_input: float) -> dict:
        """
        Calculates biological resistance and encrypts for secure transmission.
        
        Args:
            sample_id: Unique identifier for the sample
            sensor_input: Real-time sensor feed (outer resistance value)
            
        Returns:
            Dual-channel artifact with SMS summary and encrypted email body
        """
        # 1. THE MATH: Reciprocal Barrier Logic
        # R_total = (Outer_Resistance * Inner_Core) / PHI
        outer_r = sensor_input  # Real-time feed
        inner_r = 0.999         # Internal stability mirror
        
        # Calculate Refractive Index
        refractive_index = (outer_r * inner_r) / self.PHI
        
        # Determine status based on the refractive shift
        status = "STABLE" if refractive_index > 0.615 else "PATHOGENIC SHIFT DETECTED"
        
        # 2. THE DOCUMENTATION: Build the Raw Report
        raw_report = {
            "origin": "ENLIGHTEN.MINT.CAFE",
            "sample_id": sample_id,
            "status": status,
            "ri_value": round(refractive_index, 6),
            "outer_resistance": outer_r,
            "inner_resistance": inner_r,
            "phi_constant": self.PHI,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        report_str = json.dumps(raw_report)

        # 3. THE ENCRYPTION: Secure the Artifact
        session_key = get_random_bytes(32)
        aes_cipher = AES.new(session_key, AES.MODE_EAX)
        ciphertext, tag = aes_cipher.encrypt_and_digest(report_str.encode())
        
        # Encrypt the session key with your RSA Public Barrier
        enc_session_key = self.cipher_rsa.encrypt(session_key)

        # 4. DATA PREP: Encode for Email/Text Compatibility
        return {
            "sms_summary": f"SCAN COMPLETE: {status}. RI: {round(refractive_index, 6)}",
            "sms_data": {
                "status": status,
                "refractive_index": round(refractive_index, 6),
                "sample_id": sample_id,
                "nonce": base64.b64encode(aes_cipher.nonce).decode()
            },
            "email_body": {
                "payload": base64.b64encode(ciphertext).decode(),
                "barrier_key": base64.b64encode(enc_session_key).decode(),
                "nonce": base64.b64encode(aes_cipher.nonce).decode(),
                "auth_tag": base64.b64encode(tag).decode()
            }
        }

    def reunite_streams(self, sms_data: dict, email_body: dict) -> dict:
        """
        Reunite SMS and Email streams to decrypt the Inner Core.
        
        Both channels must match (nonce verification) before decryption proceeds.
        
        Args:
            sms_data: Data from SMS channel (contains nonce for verification)
            email_body: Encrypted payload from email channel
            
        Returns:
            Decrypted report if streams match, error otherwise
        """
        try:
            # Verify the streams originated from the same scan
            if sms_data.get('nonce') != email_body.get('nonce'):
                return {
                    "status": "BARRIER_MISMATCH",
                    "error": "SMS and Email nonces do not match - streams compromised"
                }
            
            # Extract components
            enc_session_key = base64.b64decode(email_body['barrier_key'])
            ciphertext = base64.b64decode(email_body['payload'])
            nonce = base64.b64decode(email_body['nonce'])
            tag = base64.b64decode(email_body['auth_tag'])

            # Breach the RSA barrier
            session_key = self.decrypt_cipher.decrypt(enc_session_key)

            # Breach the AES barrier
            aes_cipher = AES.new(session_key, AES.MODE_EAX, nonce=nonce)
            plaintext = aes_cipher.decrypt_and_verify(ciphertext, tag)
            
            raw_report = json.loads(plaintext.decode('utf-8'))

            return {
                "status": "STREAMS_REUNITED",
                "decrypted_report": raw_report,
                "verification": {
                    "sms_ri": sms_data.get('refractive_index'),
                    "report_ri": raw_report.get('ri_value'),
                    "match": sms_data.get('refractive_index') == raw_report.get('ri_value')
                }
            }
        except Exception as e:
            return {
                "status": "DECRYPTION_FAILED",
                "error": str(e)
            }

    def export_public_key(self) -> str:
        """Export public key for external verification."""
        return self.key.publickey().export_key().decode('utf-8')


# Singleton instance
_refractor_instance = None

def get_refractor() -> SovereignRefractor:
    """Returns singleton SovereignRefractor instance."""
    global _refractor_instance
    if _refractor_instance is None:
        _refractor_instance = SovereignRefractor()
    return _refractor_instance
