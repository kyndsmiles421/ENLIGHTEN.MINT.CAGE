import base64
import json
import random
from datetime import datetime, timezone
from Crypto.Cipher import AES, PKCS1_OAEP
from Crypto.PublicKey import RSA
from Crypto.Random import get_random_bytes

class RenewableEnergyEngine:
    """
    Renewable Energy Harvest Refraction Engine
    
    Calculates energy harvest potential across renewable sectors
    using scaled refraction mathematics.
    """
    def __init__(self, N: int = 10, z: int = 2):
        self.PHI = 1.618033
        self.N = N
        self.z = z
        
        # Energy Constants: Mapping the 'Harvest' potential
        self.energy_sectors = {
            # Solar
            "solar_passive": 1.25,      # Thermal gain constant
            "solar_pv": 1.18,           # Photovoltaic efficiency
            "solar_concentrated": 1.35, # CSP multiplier
            "solar_hybrid": 1.28,       # Combined systems
            
            # Wind
            "wind_kinetic": 0.89,       # Torque/Resistance constant
            "wind_offshore": 0.95,      # Ocean wind constant
            "wind_vertical": 0.82,      # VAWT constant
            "wind_micro": 0.78,         # Small-scale turbines
            
            # Water
            "hydro_dam": 1.05,          # Potential energy constant
            "hydro_run": 0.92,          # Run-of-river constant
            "tidal": 1.12,              # Lunar cycle constant
            "wave": 0.97,               # Kinetic wave constant
            
            # Storage
            "battery_storage": 1.618,   # Chemical stability constant (PHI)
            "hydrogen": 1.42,           # Electrolysis constant
            "pumped_hydro": 1.08,       # Gravitational storage
            "thermal_storage": 1.15,    # Heat retention constant
            "flywheel": 0.94,           # Rotational momentum
            
            # Grid
            "grid_harmony": 1.0,        # Frequency sync constant
            "grid_micro": 0.96,         # Microgrid isolation
            "grid_smart": 1.05,         # AI-optimized distribution
            
            # Emerging
            "geothermal": 1.22,         # Earth core constant
            "biomass": 0.88,            # Organic conversion
            "fusion": 1.618,            # Plasma containment (PHI)
        }
        
        # RSA keys for artifact encryption
        self.key = RSA.generate(2048)
        self.cipher_rsa = PKCS1_OAEP.new(self.key.publickey())
        self.decrypt_cipher = PKCS1_OAEP.new(self.key)

    def get_sector_constant(self, sector: str) -> float:
        """Get harvest constant for an energy sector."""
        return self.energy_sectors.get(sector.lower(), 1.0)

    def calculate_harvest(self, sector: str, environmental_input: float) -> dict:
        """
        Calculate energy harvest potential for a sector.
        
        Args:
            sector: Energy sector name
            environmental_input: Environmental conditions factor (0.0 - 2.0)
            
        Returns:
            Harvest refraction analysis
        """
        const = self.get_sector_constant(sector)
        multiplier = (self.N * self.z * self.N * self.z)
        
        # Core calculation
        raw_ri = (environmental_input * const) / self.PHI
        noise = random.randint(0, 9) - random.randint(0, 9)
        scaled_ri = (raw_ri * multiplier) - noise
        
        # Sector-adjusted threshold
        threshold = 240 * (const / 1.0)
        status = "VIOLET_HARVEST" if scaled_ri > threshold else "RAINBOW_DISSIPATION"
        
        # Efficiency calculation
        efficiency = min(100, max(0, (scaled_ri / threshold) * 100))
        
        return {
            "header": "RENEWABLE ENERGY HARVEST",
            "sector": sector.upper(),
            "sector_constant": const,
            "environmental_input": environmental_input,
            "raw_ri": round(raw_ri, 6),
            "multiplier": multiplier,
            "noise_offset": noise,
            "scaled_ri": round(scaled_ri, 4),
            "threshold": round(threshold, 2),
            "efficiency_percent": round(efficiency, 2),
            "status": status,
            "scale": f"{self.N}x{self.z}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def simulate_hybrid_system(self, components: list) -> dict:
        """
        Simulate a hybrid renewable energy system.
        
        Args:
            components: List of {"sector": str, "input": float, "capacity_kw": float}
            
        Returns:
            Combined system analysis
        """
        results = []
        total_harvest = 0
        total_capacity = 0
        
        for comp in components:
            harvest = self.calculate_harvest(comp["sector"], comp["input"])
            harvest["capacity_kw"] = comp.get("capacity_kw", 1.0)
            harvest["effective_output_kw"] = round(
                comp.get("capacity_kw", 1.0) * (harvest["efficiency_percent"] / 100), 2
            )
            results.append(harvest)
            total_harvest += harvest["scaled_ri"]
            total_capacity += comp.get("capacity_kw", 1.0)
        
        stable_count = sum(1 for r in results if r["status"] == "VIOLET_HARVEST")
        
        return {
            "header": "HYBRID SYSTEM ANALYSIS",
            "total_components": len(results),
            "total_capacity_kw": total_capacity,
            "total_harvest_ri": round(total_harvest, 2),
            "system_status": "VIOLET_STABLE" if stable_count >= len(results) / 2 else "RAINBOW_UNSTABLE",
            "stable_components": stable_count,
            "unstable_components": len(results) - stable_count,
            "components": results,
            "scale": f"{self.N}x{self.z}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def run_encrypted_scan(self, sector: str, environmental_input: float) -> dict:
        """Run harvest calculation with encryption envelope."""
        result = self.calculate_harvest(sector, environmental_input)
        
        session_key = get_random_bytes(32)
        aes_cipher = AES.new(session_key, AES.MODE_EAX)
        payload = json.dumps(result)
        ciphertext, tag = aes_cipher.encrypt_and_digest(payload.encode())
        enc_session_key = self.cipher_rsa.encrypt(session_key)
        
        return {
            "sms": f"[{sector.upper()}] {result['status']}. RI: {result['scaled_ri']} | Eff: {result['efficiency_percent']}%",
            "summary": result,
            "encrypted": {
                "p": base64.b64encode(ciphertext).decode(),
                "k": base64.b64encode(enc_session_key).decode(),
                "n": base64.b64encode(aes_cipher.nonce).decode(),
                "t": base64.b64encode(tag).decode()
            }
        }

    def decrypt_artifact(self, encrypted: dict) -> dict:
        """Decrypt an energy harvest artifact."""
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
        """List all available energy sectors."""
        categories = {
            "solar": ["solar_passive", "solar_pv", "solar_concentrated", "solar_hybrid"],
            "wind": ["wind_kinetic", "wind_offshore", "wind_vertical", "wind_micro"],
            "water": ["hydro_dam", "hydro_run", "tidal", "wave"],
            "storage": ["battery_storage", "hydrogen", "pumped_hydro", "thermal_storage", "flywheel"],
            "grid": ["grid_harmony", "grid_micro", "grid_smart"],
            "emerging": ["geothermal", "biomass", "fusion"]
        }
        
        return {
            "total_sectors": len(self.energy_sectors),
            "categories": categories,
            "sectors": {k: {"constant": v, "threshold": round(240 * (v / 1.0), 2)} 
                       for k, v in sorted(self.energy_sectors.items())}
        }


# Singleton factory
_energy_engines = {}

def get_energy_engine(N: int = 10, z: int = 2) -> RenewableEnergyEngine:
    """Returns RenewableEnergyEngine instance for given N,z configuration."""
    key = f"{N}_{z}"
    if key not in _energy_engines:
        _energy_engines[key] = RenewableEnergyEngine(N, z)
    return _energy_engines[key]
