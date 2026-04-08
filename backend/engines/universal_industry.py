import base64
import json
import random
from datetime import datetime, timezone
from Crypto.Cipher import AES, PKCS1_OAEP
from Crypto.PublicKey import RSA
from Crypto.Random import get_random_bytes

class UniversalIndustryEngine:
    """
    Universal Industry Refraction Engine
    
    Applies sector-specific resistance constants to the N*z*N*z protocol.
    Each trade/industry has a unique resistance coefficient based on physical properties.
    """
    def __init__(self, N: int = 10, z: int = 2):
        self.PHI = 1.618033
        self.N = N
        self.z = z
        
        # Sector Constants: Mapping the 'Resistance' of each trade
        self.sectors = {
            # Construction & Fabrication
            "welding": 0.88,        # Tensile/Thermal constant
            "masonry": 0.95,        # Compression constant
            "carpentry": 0.82,      # Structural flex constant
            "plumbing": 0.91,       # Flow/Pressure constant
            "electrical": 1.05,     # Conductance constant
            "hvac": 0.89,           # Thermal transfer constant
            
            # Heavy Industry
            "steel": 0.93,          # Alloy strength constant
            "concrete": 0.97,       # Cure/Set constant
            "glass": 1.02,          # Refraction constant
            
            # Aerospace & Defense
            "aviation": 1.12,       # Lift/Drag constant
            "space": 1.618,         # Hull/Radiation constant (PHI)
            "submarine": 1.08,      # Pressure/Depth constant
            "defense": 1.15,        # Armor/Penetration constant
            
            # Biomedical
            "medical": 0.999,       # Biological baseline
            "pharmaceutical": 1.01, # Compound stability
            "prosthetics": 0.96,    # Bio-integration constant
            
            # Energy
            "nuclear": 1.25,        # Fission/Fusion constant
            "solar": 1.03,          # Photon absorption
            "wind": 0.87,           # Turbulence constant
            "hydro": 0.94,          # Flow rate constant
            
            # Digital/Quantum
            "quantum": 1.414,       # √2 superposition constant
            "cyber": 1.0,           # Binary baseline
            "ai": 1.618,            # Neural PHI constant
        }
        
        # RSA keys for artifact encryption
        self.key = RSA.generate(2048)
        self.cipher_rsa = PKCS1_OAEP.new(self.key.publickey())
        self.decrypt_cipher = PKCS1_OAEP.new(self.key)

    def get_sector_constant(self, sector: str) -> float:
        """Get resistance constant for a sector."""
        return self.sectors.get(sector.lower(), 1.0)

    def run_refraction(self, sector: str, sensor_in: float) -> dict:
        """
        Run sector-specific refraction analysis.
        
        Math: scaled_ri = ((sensor_in * sector_const) / PHI) * (N*z*N*z) - noise
        """
        const = self.get_sector_constant(sector)
        multiplier = (self.N * self.z * self.N * self.z)
        
        # Core calculation
        raw_ri = (sensor_in * const) / self.PHI
        noise = random.randint(0, 9) - random.randint(0, 9)
        scaled_ri = (raw_ri * multiplier) - noise
        
        # Sector-adjusted threshold
        threshold = 240 * (const / 1.0)  # Normalize to baseline
        status = "VIOLET_STABLE" if scaled_ri > threshold else "RAINBOW_SHIFT"
        
        return {
            "header": "UNIVERSAL INDUSTRY REFRACTION",
            "sector": sector.upper(),
            "sector_constant": const,
            "sensor_input": sensor_in,
            "raw_ri": round(raw_ri, 6),
            "multiplier": multiplier,
            "noise_offset": noise,
            "scaled_ri": round(scaled_ri, 4),
            "threshold": round(threshold, 2),
            "status": status,
            "scale": f"{self.N}x{self.z}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def run_encrypted_scan(self, sector: str, sensor_in: float) -> dict:
        """
        Run sector scan with full encryption envelope.
        """
        result = self.run_refraction(sector, sensor_in)
        
        # Encrypt the full report
        session_key = get_random_bytes(32)
        aes_cipher = AES.new(session_key, AES.MODE_EAX)
        payload = json.dumps(result)
        ciphertext, tag = aes_cipher.encrypt_and_digest(payload.encode())
        enc_session_key = self.cipher_rsa.encrypt(session_key)
        
        return {
            "sms": f"[{sector.upper()}] {result['status']}. RI: {result['scaled_ri']}",
            "summary": result,
            "encrypted": {
                "p": base64.b64encode(ciphertext).decode(),
                "k": base64.b64encode(enc_session_key).decode(),
                "n": base64.b64encode(aes_cipher.nonce).decode(),
                "t": base64.b64encode(tag).decode()
            }
        }

    def decrypt_artifact(self, encrypted: dict) -> dict:
        """Decrypt an industry artifact."""
        try:
            enc_session_key = base64.b64decode(encrypted['k'])
            ciphertext = base64.b64decode(encrypted['p'])
            nonce = base64.b64decode(encrypted['n'])
            tag = base64.b64decode(encrypted['t'])

            session_key = self.decrypt_cipher.decrypt(enc_session_key)
            aes_cipher = AES.new(session_key, AES.MODE_EAX, nonce=nonce)
            plaintext = aes_cipher.decrypt_and_verify(ciphertext, tag)
            
            return {
                "status": "DECRYPTED",
                "report": json.loads(plaintext.decode('utf-8'))
            }
        except Exception as e:
            return {"status": "DECRYPTION_FAILED", "error": str(e)}

    def list_sectors(self) -> dict:
        """List all available sectors with their constants."""
        return {
            "total_sectors": len(self.sectors),
            "sectors": {k: {"constant": v, "threshold": round(240 * (v / 1.0), 2)} 
                       for k, v in sorted(self.sectors.items())}
        }

    def batch_scan(self, scans: list) -> list:
        """
        Run multiple sector scans.
        
        Args:
            scans: List of {"sector": str, "sensor": float} dicts
        """
        return [self.run_refraction(s["sector"], s["sensor"]) for s in scans]


# Singleton factory
_industry_engines = {}

def get_industry_engine(N: int = 10, z: int = 2) -> UniversalIndustryEngine:
    """Returns UniversalIndustryEngine instance for given N,z configuration."""
    key = f"{N}_{z}"
    if key not in _industry_engines:
        _industry_engines[key] = UniversalIndustryEngine(N, z)
    return _industry_engines[key]
