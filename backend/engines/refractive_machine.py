import hashlib
import hmac
import base64
from Crypto.Cipher import AES, PKCS1_OAEP
from Crypto.PublicKey import RSA
from Crypto.Random import get_random_bytes

class RefractiveMachine:
    """
    Unified Diagnostic + Encryption Engine
    Combines dual-barrier refractive analysis with AES-256/RSA-2048 artifact generation.
    """
    def __init__(self, admin="Nicole Barlow"):
        self.admin = admin
        self.phi = 1.618033
        # Reciprocal Barrier Keys
        self.key = RSA.generate(2048)
        self.cipher_rsa = PKCS1_OAEP.new(self.key.publickey())
        self.decrypt_cipher = PKCS1_OAEP.new(self.key)

    def run_diagnostic(self, sample_data: str, outer_r: float = 0.998, inner_r: float = 0.998) -> dict:
        """
        Run full diagnostic with encrypted artifact generation.
        
        Args:
            sample_data: Sample identifier
            outer_r: Outer barrier resistance (default 0.998)
            inner_r: Inner barrier resistance (default 0.998, reciprocal match)
        
        Returns:
            Encrypted diagnostic artifact
        """
        # 1. THE MATH: Calculate Refractive Index (Dual-Barrier Logic)
        # R_total = (Outer * Inner) / Phi
        refractive_index = (outer_r * inner_r) / self.phi
        
        status = "STABLE" if refractive_index > 0.615 else "PATHOGENIC SHIFT"
        raw_report = f"ID: {sample_data} | Result: {status} | Admin: {self.admin}"

        # 2. THE ENCRYPTION: RefractiveShield Implementation
        session_key = get_random_bytes(32)
        aes_cipher = AES.new(session_key, AES.MODE_EAX)
        ciphertext, tag = aes_cipher.encrypt_and_digest(raw_report.encode())

        # Bind the barrier to the RSA handshake
        encrypted_session_key = self.cipher_rsa.encrypt(session_key)

        # 3. THE ARTIFACT: Prepare for Email/Text
        artifact = {
            "header": "REFRACTIVE MACHINE DIAGNOSTIC",
            "admin": self.admin,
            "sample_id": sample_data,
            "refractive_index": round(refractive_index, 6),
            "phi_constant": self.phi,
            "outer_barrier": outer_r,
            "inner_barrier": inner_r,
            "status": status,
            "encrypted_payload": base64.b64encode(ciphertext).decode(),
            "barrier_key": base64.b64encode(encrypted_session_key).decode(),
            "nonce": base64.b64encode(aes_cipher.nonce).decode(),
            "tag": base64.b64encode(tag).decode(),
            "encryption": "AES-256-EAX + RSA-2048-OAEP"
        }
        return artifact

    def decrypt_artifact(self, artifact: dict) -> dict:
        """
        Decrypt an artifact using the private key.
        
        Args:
            artifact: The encrypted artifact dict
            
        Returns:
            Decrypted report
        """
        try:
            encrypted_session_key = base64.b64decode(artifact['barrier_key'])
            ciphertext = base64.b64decode(artifact['encrypted_payload'])
            nonce = base64.b64decode(artifact['nonce'])
            tag = base64.b64decode(artifact['tag'])

            # Breach the RSA barrier
            session_key = self.decrypt_cipher.decrypt(encrypted_session_key)

            # Breach the AES barrier
            aes_cipher = AES.new(session_key, AES.MODE_EAX, nonce=nonce)
            plaintext = aes_cipher.decrypt_and_verify(ciphertext, tag)

            return {
                "status": "DECRYPTED",
                "raw_report": plaintext.decode('utf-8'),
                "refractive_index": artifact.get('refractive_index'),
                "diagnostic_status": artifact.get('status')
            }
        except Exception as e:
            return {
                "status": "DECRYPTION_FAILED",
                "error": str(e)
            }

    def export_public_key(self) -> str:
        """Export public key for external artifact verification."""
        return self.key.publickey().export_key().decode('utf-8')


# Singleton instance
_machine_instance = None

def get_machine(admin: str = "Nicole Barlow") -> RefractiveMachine:
    """Returns singleton RefractiveMachine instance."""
    global _machine_instance
    if _machine_instance is None or _machine_instance.admin != admin:
        _machine_instance = RefractiveMachine(admin)
    return _machine_instance
