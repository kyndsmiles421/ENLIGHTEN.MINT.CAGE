import base64
import json
import random
from datetime import datetime, timezone
from Crypto.Cipher import AES, PKCS1_OAEP
from Crypto.PublicKey import RSA
from Crypto.Random import get_random_bytes

class MagneticsSovereignEngine:
    """
    Magnetics Sovereign Flux Engine
    
    Calculates magnetic field coherence and flux stability
    using scaled refraction mathematics.
    """
    def __init__(self, N: int = 10, z: int = 2):
        self.PHI = 1.618033
        self.N = N
        self.z = z
        
        # Magnetic Sector Constants
        self.sectors = {
            # Toroidal Systems
            "toroidal_flux": 1.618,      # Geometric coherence (PHI)
            "toroidal_plasma": 1.55,     # Plasma containment
            "tokamak": 1.618,            # Fusion reactor constant (PHI)
            
            # Induction & Transfer
            "induction_kinetic": 0.92,   # Energy transfer
            "induction_resonant": 1.05,  # Resonant coupling
            "wireless_power": 0.89,      # WPT efficiency
            
            # Levitation
            "diamagnetic_lev": 1.25,     # Stability constant
            "superconducting_lev": 1.414, # √2 Meissner effect
            "maglev_transport": 1.12,    # High-speed rail constant
            
            # Bioelectromagnetics
            "bio_magnetics": 0.88,       # Human field resonance
            "neural_stim": 0.95,         # TMS constant
            "cardiac_rhythm": 1.0,       # Heart field baseline
            "healing_pemf": 0.92,        # Pulsed EMF therapy
            
            # Industrial
            "motor_efficiency": 0.96,    # Electric motor constant
            "generator_output": 1.02,    # Power generation
            "transformer_core": 0.98,    # Core loss constant
            
            # Research & Advanced
            "particle_beam": 1.35,       # Accelerator steering
            "mri_imaging": 1.08,         # Medical imaging constant
            "quantum_spin": 1.414,       # √2 spin resonance
            "antimatter_trap": 1.618,    # Penning trap (PHI)
        }
        
        # RSA keys for artifact encryption
        self.key = RSA.generate(2048)
        self.cipher_rsa = PKCS1_OAEP.new(self.key.publickey())
        self.decrypt_cipher = PKCS1_OAEP.new(self.key)

    def get_sector_constant(self, sector: str) -> float:
        """Get magnetic constant for a sector."""
        return self.sectors.get(sector.lower(), 1.0)

    def execute_flux_scan(self, sector: str, flux_input: float) -> dict:
        """
        Execute magnetic flux coherence scan.
        
        Args:
            sector: Magnetic sector name
            flux_input: Magnetic flux density factor (Tesla-normalized)
            
        Returns:
            Flux coherence analysis
        """
        const = self.get_sector_constant(sector)
        multiplier = (self.N * self.z * self.N * self.z)
        
        # Core calculation
        raw_ri = (flux_input * const) / self.PHI
        noise = random.randint(0, 9) - random.randint(0, 9)
        scaled_ri = (raw_ri * multiplier) - noise
        
        # Sector-adjusted threshold
        threshold = 250 * (const / 1.0)
        status = "MAGNETIC_COHERENCE" if scaled_ri > threshold else "FLUX_LEAKAGE"
        
        # Coherence percentage
        coherence = min(100, max(0, (scaled_ri / threshold) * 100))
        
        return {
            "header": "MAGNETICS SOVEREIGN FLUX SCAN",
            "sector": sector.upper(),
            "sector_constant": const,
            "flux_input": flux_input,
            "raw_ri": round(raw_ri, 6),
            "multiplier": multiplier,
            "noise_offset": noise,
            "scaled_ri": round(scaled_ri, 4),
            "threshold": round(threshold, 2),
            "coherence_percent": round(coherence, 2),
            "status": status,
            "scale": f"{self.N}x{self.z}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def simulate_field_array(self, components: list) -> dict:
        """
        Simulate a multi-component magnetic field array.
        
        Args:
            components: List of {"sector": str, "flux": float, "tesla": float}
            
        Returns:
            Combined field analysis
        """
        results = []
        total_flux = 0
        total_tesla = 0
        
        for comp in components:
            scan = self.execute_flux_scan(comp["sector"], comp["flux"])
            scan["tesla_rating"] = comp.get("tesla", 1.0)
            scan["effective_field"] = round(
                comp.get("tesla", 1.0) * (scan["coherence_percent"] / 100), 3
            )
            results.append(scan)
            total_flux += scan["scaled_ri"]
            total_tesla += comp.get("tesla", 1.0)
        
        coherent_count = sum(1 for r in results if r["status"] == "MAGNETIC_COHERENCE")
        
        return {
            "header": "MAGNETIC FIELD ARRAY ANALYSIS",
            "total_components": len(results),
            "total_tesla": total_tesla,
            "total_flux_ri": round(total_flux, 2),
            "array_status": "UNIFIED_COHERENCE" if coherent_count >= len(results) / 2 else "FIELD_FRAGMENTATION",
            "coherent_components": coherent_count,
            "leaking_components": len(results) - coherent_count,
            "components": results,
            "scale": f"{self.N}x{self.z}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def run_encrypted_scan(self, sector: str, flux_input: float) -> dict:
        """Run flux scan with encryption envelope."""
        result = self.execute_flux_scan(sector, flux_input)
        
        session_key = get_random_bytes(32)
        aes_cipher = AES.new(session_key, AES.MODE_EAX)
        payload = json.dumps(result)
        ciphertext, tag = aes_cipher.encrypt_and_digest(payload.encode())
        enc_session_key = self.cipher_rsa.encrypt(session_key)
        
        return {
            "sms": f"[{sector.upper()}] {result['status']}. RI: {result['scaled_ri']} | Coh: {result['coherence_percent']}%",
            "summary": result,
            "encrypted": {
                "p": base64.b64encode(ciphertext).decode(),
                "k": base64.b64encode(enc_session_key).decode(),
                "n": base64.b64encode(aes_cipher.nonce).decode(),
                "t": base64.b64encode(tag).decode()
            }
        }

    def decrypt_artifact(self, encrypted: dict) -> dict:
        """Decrypt a magnetic flux artifact."""
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
        """List all available magnetic sectors."""
        categories = {
            "toroidal": ["toroidal_flux", "toroidal_plasma", "tokamak"],
            "induction": ["induction_kinetic", "induction_resonant", "wireless_power"],
            "levitation": ["diamagnetic_lev", "superconducting_lev", "maglev_transport"],
            "bioelectromagnetics": ["bio_magnetics", "neural_stim", "cardiac_rhythm", "healing_pemf"],
            "industrial": ["motor_efficiency", "generator_output", "transformer_core"],
            "advanced": ["particle_beam", "mri_imaging", "quantum_spin", "antimatter_trap"]
        }
        
        return {
            "total_sectors": len(self.sectors),
            "categories": categories,
            "sectors": {k: {"constant": v, "threshold": round(250 * (v / 1.0), 2)} 
                       for k, v in sorted(self.sectors.items())}
        }


# Singleton factory
_magnetics_engines = {}

def get_magnetics_engine(N: int = 10, z: int = 2) -> MagneticsSovereignEngine:
    """Returns MagneticsSovereignEngine instance for given N,z configuration."""
    key = f"{N}_{z}"
    if key not in _magnetics_engines:
        _magnetics_engines[key] = MagneticsSovereignEngine(N, z)
    return _magnetics_engines[key]
