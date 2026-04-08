import hashlib
import base64
import json
import random
from datetime import datetime, timezone
from Crypto.Cipher import AES, PKCS1_OAEP
from Crypto.PublicKey import RSA
from Crypto.Random import get_random_bytes

class N_Scaled_Refractor:
    """
    N-Scaled Sovereign Refractor Engine
    
    Applies dimensional scaling via N*z*N*z multiplication protocol
    with noise offset for quantum uncertainty simulation.
    """
    def __init__(self, N: int = 1, z: int = 1):
        self.PHI = 1.618033
        self.N = N  # Scale Factor
        self.z = z  # Complex Plane Factor
        self.key = RSA.generate(2048)
        self.cipher_rsa = PKCS1_OAEP.new(self.key.publickey())
        self.decrypt_cipher = PKCS1_OAEP.new(self.key)

    def apply_math_logic(self, base_ri: float) -> tuple:
        """
        Applies N*z*N*z multiplication with noise offset.
        
        Returns:
            tuple: (scaled_ri, multiplier, noise_offset)
        """
        # Multiplication Logic: N*z*N*z
        multiplier = (self.N * self.z * self.N * self.z)
        
        # Noise Offset: -(0-9)(+)(-)(0-9)
        # Simulates quantum uncertainty in the barrier
        noise_a = random.randint(0, 9)
        noise_b = random.randint(0, 9)
        noise_offset = noise_a - noise_b
        
        # Final Scaled Refraction
        scaled_ri = (base_ri * multiplier) - noise_offset
        
        return scaled_ri, multiplier, noise_offset

    def execute_multi_scan(self, sample_id: str, sensor_feed: float) -> dict:
        """
        Execute a scaled multi-dimensional scan.
        
        Args:
            sample_id: Unique identifier for the sample
            sensor_feed: Real-time sensor input value
            
        Returns:
            Dual-channel artifact with scaled RI analysis
        """
        # Calculate Base Reciprocal Resistance
        base_ri = (sensor_feed * 0.999) / self.PHI
        
        # Apply the N*z multiplication protocol
        scaled_ri, multiplier, noise_offset = self.apply_math_logic(base_ri)
        
        # Status threshold scales with N
        threshold = 0.615 * self.N
        status = "STABLE" if scaled_ri > threshold else "PATHOGENIC SHIFT"
        
        # Build full report
        report = {
            "origin": "ENLIGHTEN.MINT.CAFE",
            "engine": "N_Scaled_Refractor",
            "sample_id": sample_id,
            "sensor_feed": sensor_feed,
            "base_ri": round(base_ri, 6),
            "scale_factor_N": self.N,
            "plane_factor_z": self.z,
            "multiplier": multiplier,
            "noise_offset": noise_offset,
            "scaled_ri": round(scaled_ri, 6),
            "threshold": round(threshold, 6),
            "status": status,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        # Encrypt Artifacts (Sovereign Shield)
        session_key = get_random_bytes(32)
        aes_cipher = AES.new(session_key, AES.MODE_EAX)
        payload = json.dumps(report)
        ciphertext, tag = aes_cipher.encrypt_and_digest(payload.encode())
        
        return {
            "sms": f"SCALED SCAN [{self.N}x{self.z}]: {status}. RI: {scaled_ri:.4f}",
            "sms_data": {
                "status": status,
                "scaled_ri": round(scaled_ri, 4),
                "scale": f"{self.N}x{self.z}",
                "multiplier": multiplier,
                "threshold": round(threshold, 4),
                "nonce": base64.b64encode(aes_cipher.nonce).decode()
            },
            "email": {
                "p": base64.b64encode(ciphertext).decode(),
                "k": base64.b64encode(self.cipher_rsa.encrypt(session_key)).decode(),
                "n": base64.b64encode(aes_cipher.nonce).decode(),
                "t": base64.b64encode(tag).decode()
            }
        }

    def decrypt_email(self, email_body: dict) -> dict:
        """
        Decrypt the email body using the private key.
        """
        try:
            enc_session_key = base64.b64decode(email_body['k'])
            ciphertext = base64.b64decode(email_body['p'])
            nonce = base64.b64decode(email_body['n'])
            tag = base64.b64decode(email_body['t'])

            session_key = self.decrypt_cipher.decrypt(enc_session_key)
            aes_cipher = AES.new(session_key, AES.MODE_EAX, nonce=nonce)
            plaintext = aes_cipher.decrypt_and_verify(ciphertext, tag)
            
            return {
                "status": "DECRYPTED",
                "report": json.loads(plaintext.decode('utf-8'))
            }
        except Exception as e:
            return {
                "status": "DECRYPTION_FAILED",
                "error": str(e)
            }

    def reconfigure(self, N: int, z: int):
        """Reconfigure scale factors without regenerating keys."""
        self.N = N
        self.z = z


# Singleton factory
_refractor_instances = {}

def get_n_scaled_refractor(N: int = 1, z: int = 1) -> N_Scaled_Refractor:
    """Returns N_Scaled_Refractor instance for given N,z configuration."""
    key = f"{N}_{z}"
    if key not in _refractor_instances:
        _refractor_instances[key] = N_Scaled_Refractor(N, z)
    return _refractor_instances[key]
