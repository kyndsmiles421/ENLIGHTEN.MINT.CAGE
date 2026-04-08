import random
import base64
import json
from datetime import datetime, timezone
from Crypto.Cipher import AES, PKCS1_OAEP
from Crypto.PublicKey import RSA
from Crypto.Random import get_random_bytes

class HolisticHealingEngine:
    """
    Holistic Healing Refraction Engine
    
    Calculates vital coherence across holistic healing modalities
    using scaled refraction mathematics.
    """
    def __init__(self, N: int = 10, z: int = 2):
        self.PHI = 1.618033
        self.N = N
        self.z = z
        
        # Holistic Modality Constants
        self.modalities = {
            # Breathwork & Pranayama
            "breathwork_rhythm": 1.618,     # Geometric breathing (PHI)
            "pranayama": 1.618,             # Yogic breath control (PHI)
            "wim_hof": 1.35,                # Cold exposure breathing
            "box_breathing": 1.25,          # 4-4-4-4 pattern
            "holotropic": 1.42,             # Altered state induction
            
            # Herbalism & Plant Medicine
            "herb_synergy": 1.15,           # Plant-based chemistry
            "adaptogen_stack": 1.22,        # Stress modulation
            "nootropic_blend": 1.18,        # Cognitive enhancement
            "tincture_potency": 1.08,       # Extract concentration
            "mushroom_complex": 1.25,       # Fungal compounds
            
            # Somatic & Bodywork
            "somatic_release": 0.94,        # Neural tension discharge
            "fascia_unwinding": 0.98,       # Connective tissue release
            "craniosacral": 1.02,           # Subtle body rhythm
            "myofascial": 0.96,             # Deep tissue work
            "polyvagal_tone": 1.05,         # Vagus nerve activation
            
            # Circadian & Chronobiology
            "circadian_sync": 1.05,         # Solar/Lunar alignment
            "melatonin_cycle": 0.98,        # Sleep hormone rhythm
            "cortisol_curve": 1.02,         # Stress hormone pattern
            "ultradian_pulse": 0.95,        # 90-minute cycles
            
            # Energy & Frequency
            "chakra_alignment": 1.618,      # Energy center balance (PHI)
            "meridian_flow": 1.12,          # Acupuncture pathways
            "biofield_tuning": 1.08,        # Electromagnetic coherence
            "sound_healing": 1.15,          # Vibrational therapy
            "light_therapy": 1.18,          # Photobiomodulation
            
            # Mind-Body Integration
            "meditation_depth": 1.618,      # Conscious stillness (PHI)
            "yoga_flow": 1.25,              # Movement meditation
            "tai_chi": 1.15,                # Martial arts meditation
            "qigong": 1.18,                 # Energy cultivation
            "mindfulness": 1.08,            # Present awareness
        }
        
        # RSA keys for artifact encryption
        self.key = RSA.generate(2048)
        self.cipher_rsa = PKCS1_OAEP.new(self.key.publickey())
        self.decrypt_cipher = PKCS1_OAEP.new(self.key)

    def get_modality_constant(self, modality: str) -> float:
        """Get constant for a healing modality."""
        return self.modalities.get(modality.lower(), 1.0)

    def execute_healing_scan(self, practice: str, vitality_input: float) -> dict:
        """
        Execute healing coherence scan.
        
        Args:
            practice: Healing modality name
            vitality_input: Current vitality/energy level (0.0 - 2.0)
            
        Returns:
            Vital coherence analysis
        """
        const = self.get_modality_constant(practice)
        multiplier = (self.N * self.z * self.N * self.z)
        
        # Core calculation
        raw_ri = (vitality_input * const) / self.PHI
        jitter = random.randint(0, 9) - random.randint(0, 9)
        scaled_ri = (raw_ri * multiplier) - jitter
        
        # Vital coherence threshold at 400
        status = "VITAL_COHERENCE" if scaled_ri > 400 else "RESTORATION_REQUIRED"
        
        # Vitality percentage
        vitality_percent = min(100, max(0, (scaled_ri / 400) * 100))
        
        return {
            "header": "HOLISTIC HEALING SCAN",
            "practice": practice.upper(),
            "modality_constant": const,
            "constant_type": "PHI" if const == self.PHI else "STANDARD",
            "vitality_input": vitality_input,
            "raw_ri": round(raw_ri, 6),
            "multiplier": multiplier,
            "jitter": jitter,
            "scaled_ri": round(scaled_ri, 4),
            "coherence_threshold": 400,
            "vitality_percent": round(vitality_percent, 2),
            "status": status,
            "scale": f"{self.N}x{self.z}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def create_healing_protocol(self, modalities: list) -> dict:
        """
        Create a multi-modality healing protocol.
        
        Args:
            modalities: List of {"practice": str, "vitality": float, "duration_min": int}
            
        Returns:
            Combined protocol analysis
        """
        results = []
        total_ri = 0
        total_duration = 0
        
        for mod in modalities:
            scan = self.execute_healing_scan(mod["practice"], mod["vitality"])
            scan["duration_min"] = mod.get("duration_min", 15)
            scan["effective_dose"] = round(
                mod.get("duration_min", 15) * (scan["vitality_percent"] / 100), 1
            )
            results.append(scan)
            total_ri += scan["scaled_ri"]
            total_duration += mod.get("duration_min", 15)
        
        coherent_count = sum(1 for r in results if r["status"] == "VITAL_COHERENCE")
        
        return {
            "header": "HOLISTIC HEALING PROTOCOL",
            "total_modalities": len(results),
            "total_duration_min": total_duration,
            "total_ri": round(total_ri, 2),
            "average_vitality": round(sum(r["vitality_percent"] for r in results) / len(results), 2) if results else 0,
            "protocol_status": "FULL_COHERENCE" if coherent_count >= len(results) / 2 else "PARTIAL_RESTORATION",
            "coherent_practices": coherent_count,
            "restoration_needed": len(results) - coherent_count,
            "practices": results,
            "scale": f"{self.N}x{self.z}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def run_encrypted_scan(self, practice: str, vitality_input: float) -> dict:
        """Run healing scan with encryption envelope."""
        result = self.execute_healing_scan(practice, vitality_input)
        
        session_key = get_random_bytes(32)
        aes_cipher = AES.new(session_key, AES.MODE_EAX)
        payload = json.dumps(result)
        ciphertext, tag = aes_cipher.encrypt_and_digest(payload.encode())
        enc_session_key = self.cipher_rsa.encrypt(session_key)
        
        return {
            "sms": f"[{practice.upper()}] {result['status']}. RI: {result['scaled_ri']} | Vitality: {result['vitality_percent']}%",
            "summary": result,
            "encrypted": {
                "p": base64.b64encode(ciphertext).decode(),
                "k": base64.b64encode(enc_session_key).decode(),
                "n": base64.b64encode(aes_cipher.nonce).decode(),
                "t": base64.b64encode(tag).decode()
            }
        }

    def decrypt_artifact(self, encrypted: dict) -> dict:
        """Decrypt a healing artifact."""
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

    def list_modalities(self) -> dict:
        """List all available healing modalities."""
        categories = {
            "breathwork": ["breathwork_rhythm", "pranayama", "wim_hof", "box_breathing", "holotropic"],
            "herbalism": ["herb_synergy", "adaptogen_stack", "nootropic_blend", "tincture_potency", "mushroom_complex"],
            "somatic": ["somatic_release", "fascia_unwinding", "craniosacral", "myofascial", "polyvagal_tone"],
            "circadian": ["circadian_sync", "melatonin_cycle", "cortisol_curve", "ultradian_pulse"],
            "energy": ["chakra_alignment", "meridian_flow", "biofield_tuning", "sound_healing", "light_therapy"],
            "mind_body": ["meditation_depth", "yoga_flow", "tai_chi", "qigong", "mindfulness"]
        }
        
        phi_modalities = [k for k, v in self.modalities.items() if v == self.PHI]
        
        return {
            "total_modalities": len(self.modalities),
            "coherence_threshold": 400,
            "categories": categories,
            "phi_modalities": phi_modalities,
            "modalities": {k: {"constant": v, "type": "PHI" if v == self.PHI else "STANDARD"} 
                         for k, v in sorted(self.modalities.items())}
        }


# Singleton factory
_healing_engines = {}

def get_healing_engine(N: int = 10, z: int = 2) -> HolisticHealingEngine:
    """Returns HolisticHealingEngine instance for given N,z configuration."""
    key = f"{N}_{z}"
    if key not in _healing_engines:
        _healing_engines[key] = HolisticHealingEngine(N, z)
    return _healing_engines[key]
