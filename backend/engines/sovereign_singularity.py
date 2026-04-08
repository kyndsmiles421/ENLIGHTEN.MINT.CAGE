import base64
import json
import random
from datetime import datetime, timezone
from Crypto.Cipher import AES, PKCS1_OAEP
from Crypto.PublicKey import RSA
from Crypto.Random import get_random_bytes

class SovereignMagSingularity:
    """
    Sovereign Magnetic Singularity Engine
    
    Unified 21-sector matrix for high-coherence singularity detection.
    Threshold elevated to 400 for VIOLET_SINGULARITY classification.
    """
    def __init__(self, N: int = 10, z: int = 2):
        self.PHI = 1.618033
        self.SQRT2 = 1.414213
        self.N = N
        self.z = z
        
        # Integrated 21-Sector Matrix
        self.registry = {
            # PHI Constants (Golden Ratio - Maximum Coherence)
            "toroidal_flux": 1.618,
            "tokamak": 1.618,
            "antimatter_trap": 1.618,
            "battery_storage": 1.618,
            "fusion": 1.618,
            "ai": 1.618,
            
            # SQRT2 Constants (Quantum/Superconducting)
            "superconducting_lev": 1.414,
            "quantum_spin": 1.414,
            "quantum": 1.414,
            
            # Bioelectromagnetics
            "bio": 0.88,
            "bio_magnetics": 0.88,
            "neural": 0.92,
            "neural_stim": 0.95,
            "cardiac": 1.0,
            "healing_pemf": 0.92,
            
            # Medical/Research
            "mri": 1.08,
            "mri_imaging": 1.08,
            "particle_beam": 1.15,
            
            # Industrial
            "motor": 0.96,
            "generator": 1.02,
            "transformer": 0.98,
            
            # Energy
            "solar": 1.25,
            "wind": 0.89,
            "hydro": 1.05,
            "nuclear": 1.25,
            "geothermal": 1.22,
        }
        
        # RSA keys for artifact encryption
        self.key = RSA.generate(2048)
        self.cipher_rsa = PKCS1_OAEP.new(self.key.publickey())
        self.decrypt_cipher = PKCS1_OAEP.new(self.key)

    def get_sector_constant(self, sector: str) -> float:
        """Get constant for a sector from unified registry."""
        return self.registry.get(sector.lower(), 1.0)

    def execute_singularity_scan(self, sector: str, flux_in: float) -> dict:
        """
        Execute singularity detection scan.
        
        Args:
            sector: Sector from unified registry
            flux_in: Input flux/energy value
            
        Returns:
            Singularity analysis with VIOLET_SINGULARITY or STABLE status
        """
        const = self.get_sector_constant(sector)
        multiplier = (self.N * self.z * self.N * self.z)
        
        # Core calculation
        raw_ri = (flux_in * const) / self.PHI
        jitter = random.randint(0, 9) - random.randint(0, 9)
        scaled_ri = (raw_ri * multiplier) - jitter
        
        # Singularity threshold at 400
        status = "VIOLET_SINGULARITY" if scaled_ri > 400 else "STABLE"
        
        # Singularity proximity percentage
        proximity = min(100, max(0, (scaled_ri / 400) * 100))
        
        return {
            "header": "SOVEREIGN SINGULARITY SCAN",
            "sector": sector.upper(),
            "sector_constant": const,
            "constant_type": "PHI" if const == self.PHI else ("SQRT2" if const == self.SQRT2 else "STANDARD"),
            "flux_input": flux_in,
            "raw_ri": round(raw_ri, 6),
            "multiplier": multiplier,
            "jitter": jitter,
            "scaled_ri": round(scaled_ri, 4),
            "singularity_threshold": 400,
            "singularity_proximity": round(proximity, 2),
            "status": status,
            "scale": f"{self.N}x{self.z}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def execute_multi_scan(self, scans: list) -> dict:
        """
        Execute multiple singularity scans.
        
        Args:
            scans: List of {"sector": str, "flux": float}
            
        Returns:
            Combined analysis with singularity count
        """
        results = []
        total_ri = 0
        
        for scan in scans:
            result = self.execute_singularity_scan(scan["sector"], scan["flux"])
            results.append(result)
            total_ri += result["scaled_ri"]
        
        singularity_count = sum(1 for r in results if r["status"] == "VIOLET_SINGULARITY")
        
        return {
            "header": "MULTI-SECTOR SINGULARITY ANALYSIS",
            "total_scans": len(results),
            "total_ri": round(total_ri, 2),
            "average_ri": round(total_ri / len(results), 2) if results else 0,
            "singularity_count": singularity_count,
            "stable_count": len(results) - singularity_count,
            "system_status": "VIOLET_CONVERGENCE" if singularity_count >= len(results) / 2 else "STABLE_MATRIX",
            "results": results,
            "scale": f"{self.N}x{self.z}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def run_encrypted_scan(self, sector: str, flux_in: float) -> dict:
        """Run singularity scan with encryption envelope."""
        result = self.execute_singularity_scan(sector, flux_in)
        
        session_key = get_random_bytes(32)
        aes_cipher = AES.new(session_key, AES.MODE_EAX)
        payload = json.dumps(result)
        ciphertext, tag = aes_cipher.encrypt_and_digest(payload.encode())
        enc_session_key = self.cipher_rsa.encrypt(session_key)
        
        return {
            "sms": f"[{sector.upper()}] {result['status']}. RI: {result['scaled_ri']} | Prox: {result['singularity_proximity']}%",
            "summary": result,
            "encrypted": {
                "p": base64.b64encode(ciphertext).decode(),
                "k": base64.b64encode(enc_session_key).decode(),
                "n": base64.b64encode(aes_cipher.nonce).decode(),
                "t": base64.b64encode(tag).decode()
            }
        }

    def decrypt_artifact(self, encrypted: dict) -> dict:
        """Decrypt a singularity artifact."""
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

    def list_registry(self) -> dict:
        """List the unified sector registry."""
        phi_sectors = [k for k, v in self.registry.items() if v == self.PHI]
        sqrt2_sectors = [k for k, v in self.registry.items() if v == self.SQRT2]
        
        return {
            "total_sectors": len(self.registry),
            "singularity_threshold": 400,
            "phi_sectors": phi_sectors,
            "sqrt2_sectors": sqrt2_sectors,
            "registry": {k: {"constant": v, "type": "PHI" if v == self.PHI else ("SQRT2" if v == self.SQRT2 else "STANDARD")} 
                        for k, v in sorted(self.registry.items())}
        }


# Singleton factory
_singularity_engines = {}

def get_singularity_engine(N: int = 10, z: int = 2) -> SovereignMagSingularity:
    """Returns SovereignMagSingularity instance for given N,z configuration."""
    key = f"{N}_{z}"
    if key not in _singularity_engines:
        _singularity_engines[key] = SovereignMagSingularity(N, z)
    return _singularity_engines[key]
