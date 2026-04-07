import hashlib
import hmac
import json
import base64
from Crypto.Cipher import AES, PKCS1_OAEP
from Crypto.PublicKey import RSA
from Crypto.Random import get_random_bytes

class RefractiveShield:
    """
    Sovereign Cryptographic Engine
    Implements Reciprocal Barrier Resistance: R_total = R_outer + R_inner
    """
    def __init__(self, rsa_key_path=None):
        # Initializing the Inner Core
        if rsa_key_path:
            with open(rsa_key_path, 'r') as f:
                self.key_pair = RSA.import_key(f.read())
        else:
            self.key_pair = RSA.generate(2048)
            
        self.private_key = self.key_pair
        self.public_key = self.key_pair.publickey()

    def encrypt(self, plaintext: str) -> dict:
        """
        Refracts plaintext through dual barriers.
        """
        # 1. Inner Core Layer (AES-256-EAX)
        session_key = get_random_bytes(32)
        inner_cipher = AES.new(session_key, AES.MODE_EAX)
        ciphertext, tag = inner_cipher.encrypt_and_digest(plaintext.encode('utf-8'))

        # 2. Outer Barrier Layer (RSA Refraction)
        outer_cipher = PKCS1_OAEP.new(self.public_key)
        enc_session_key = outer_cipher.encrypt(session_key)

        # 3. Refractive Index (Reciprocal Resistance)
        # We use HMAC to bind the outer barrier to the inner core's noise
        refractive_index = hmac.new(
            session_key, 
            ciphertext + enc_session_key, 
            hashlib.sha256
        ).digest()

        # 4. JSON Serialization for Sovereign OS
        return {
            "outer_barrier": base64.b64encode(enc_session_key).decode('utf-8'),
            "inner_core": base64.b64encode(ciphertext).decode('utf-8'),
            "nonce": base64.b64encode(inner_cipher.nonce).decode('utf-8'),
            "tag": base64.b64encode(tag).decode('utf-8'),
            "refractive_index": base64.b64encode(refractive_index).decode('utf-8'),
            "status": "isolated"
        }

    def decrypt(self, shield_packet: dict) -> str:
        """
        Breaks the barriers in reverse order using the private core.
        """
        try:
            # Extract Components
            enc_session_key = base64.b64decode(shield_packet['outer_barrier'])
            ciphertext = base64.b64decode(shield_packet['inner_core'])
            nonce = base64.b64decode(shield_packet['nonce'])
            tag = base64.b64decode(shield_packet['tag'])
            provided_refraction = base64.b64decode(shield_packet['refractive_index'])

            # 1. Breach Outer Barrier
            outer_cipher = PKCS1_OAEP.new(self.private_key)
            session_key = outer_cipher.decrypt(enc_session_key)

            # 2. Validate Refractive Index
            # If the resistance doesn't match, the core 'defunds' access
            expected_refraction = hmac.new(
                session_key, 
                ciphertext + enc_session_key, 
                hashlib.sha256
            ).digest()

            if not hmac.compare_digest(provided_refraction, expected_refraction):
                return {"error": "Refractive index mismatch - barrier integrity compromised", "status": "breach_detected"}

            # 3. Breach Inner Core
            inner_cipher = AES.new(session_key, AES.MODE_EAX, nonce=nonce)
            plaintext = inner_cipher.decrypt_and_verify(ciphertext, tag)

            return {
                "plaintext": plaintext.decode('utf-8'),
                "status": "decrypted",
                "barrier_integrity": "verified"
            }

        except ValueError as e:
            return {"error": f"Decryption failed - {str(e)}", "status": "barrier_breach"}
        except Exception as e:
            return {"error": f"Shield malfunction - {str(e)}", "status": "critical_failure"}

    def export_public_key(self) -> str:
        """Export public key for external barrier synchronization."""
        return self.public_key.export_key().decode('utf-8')

    def export_private_key(self) -> str:
        """Export private key (SOVEREIGN USE ONLY)."""
        return self.private_key.export_key().decode('utf-8')


# Singleton instance for API usage
_shield_instance = None

def get_shield() -> RefractiveShield:
    """Returns singleton RefractiveShield instance."""
    global _shield_instance
    if _shield_instance is None:
        _shield_instance = RefractiveShield()
    return _shield_instance
