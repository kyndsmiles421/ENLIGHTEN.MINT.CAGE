import random
import base64
import json
from datetime import datetime, timezone
from Crypto.Cipher import AES, PKCS1_OAEP
from Crypto.PublicKey import RSA
from Crypto.Random import get_random_bytes

class OmniVitalityEngine:
    """
    Omni Vitality Engine
    
    Multi-generational vitality processing for human lifecycle
    and community coherence using scaled refraction mathematics.
    """
    def __init__(self, N: int = 10, z: int = 2):
        self.N = N
        self.z = z
        self.PHI = 1.618033
        self.SQRT2 = 1.414213
        
        # Human Lifecycle & Community Constants
        self.nodules = {
            # Foundational Sciences
            "physiology_anatomy": 1.25,       # Structural mapping
            "biochemistry": 1.18,             # Molecular processes
            "genetics": 1.35,                 # DNA/RNA constants
            "microbiology": 1.12,             # Pathogen awareness
            
            # Clinical Applications
            "nursing_clinical": 1.10,         # Applied care protocols
            "diagnostics": 1.15,              # Assessment methods
            "pharmacology": 1.22,             # Drug interactions
            "emergency_response": 1.28,       # Critical care constants
            
            # Developmental Stages
            "prenatal_formation": 1.618,      # Embryonic growth (PHI)
            "child_edu_prime": 1.618,         # Early developmental growth (PHI)
            "adolescent_transition": 1.35,    # Hormonal/neural restructuring
            "adult_maintenance": 1.05,        # Peak function baseline
            "elderly_wisdom_sync": 1.414,     # Neuro-preservation (√2)
            
            # Community & Social
            "community_awareness": 1.08,      # Social coherence
            "family_dynamics": 1.15,          # Relational patterns
            "cultural_integration": 1.12,     # Societal adaptation
            "collective_healing": 1.25,       # Group resonance
            
            # Mental & Cognitive
            "cognitive_function": 1.18,       # Mental processing
            "emotional_regulation": 1.08,     # Affect management
            "memory_consolidation": 1.22,     # Retention patterns
            "neuroplasticity": 1.618,         # Brain adaptation (PHI)
            
            # Spiritual & Transpersonal
            "spiritual_emergence": 1.618,     # Awakening constant (PHI)
            "ancestral_connection": 1.414,    # Lineage resonance (√2)
            "purpose_alignment": 1.35,        # Life direction
            "death_transition": 1.618,        # End-of-life coherence (PHI)
        }
        
        # RSA keys for artifact encryption
        self.key = RSA.generate(2048)
        self.cipher_rsa = PKCS1_OAEP.new(self.key.publickey())
        self.decrypt_cipher = PKCS1_OAEP.new(self.key)

    def get_nodule_constant(self, nodule: str) -> float:
        """Get constant for a lifecycle nodule."""
        return self.nodules.get(nodule.lower(), 1.0)

    def process_vitality_stream(self, module: str, input_data: float) -> dict:
        """
        Process vitality stream through lifecycle nodule.
        
        Args:
            module: Lifecycle nodule name
            input_data: Vitality/coherence input (0.0 - 2.0)
            
        Returns:
            Vitality stream analysis
        """
        const = self.get_nodule_constant(module)
        multiplier = (self.N * self.z * self.N * self.z)
        
        # The Refractive Index of Growth
        raw_ri = (input_data * const) / self.PHI
        
        # Rainbow Light Infraction Operator
        jitter = random.randint(0, 9) - random.randint(0, 9)
        scaled_ri = (raw_ri * multiplier) - jitter
        
        # Determine constant type
        const_type = "PHI" if const == self.PHI else ("SQRT2" if const == self.SQRT2 else "STANDARD")
        
        # Status determination
        threshold = 400 * (const / 1.25)  # Normalize to baseline
        status = "VIOLET_RESONANCE" if scaled_ri > threshold else "GROWTH_PHASE"
        
        # Vitality coherence percentage
        coherence = min(100, max(0, (scaled_ri / threshold) * 100))
        
        return {
            "header": "OMNI VITALITY STREAM",
            "module": module.upper(),
            "nodule_constant": const,
            "constant_type": const_type,
            "input_data": input_data,
            "raw_ri": round(raw_ri, 6),
            "multiplier": multiplier,
            "jitter": jitter,
            "scaled_ri": round(scaled_ri, 4),
            "threshold": round(threshold, 2),
            "coherence_percent": round(coherence, 2),
            "status": status,
            "scale": f"{self.N}x{self.z}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def process_lifecycle_matrix(self, streams: list) -> dict:
        """
        Process multiple vitality streams across lifecycle.
        
        Args:
            streams: List of {"module": str, "input": float}
            
        Returns:
            Comprehensive lifecycle analysis
        """
        results = []
        total_ri = 0
        
        for stream in streams:
            result = self.process_vitality_stream(stream["module"], stream["input"])
            results.append(result)
            total_ri += result["scaled_ri"]
        
        resonance_count = sum(1 for r in results if r["status"] == "VIOLET_RESONANCE")
        
        # Categorize results
        phi_results = [r for r in results if r["constant_type"] == "PHI"]
        sqrt2_results = [r for r in results if r["constant_type"] == "SQRT2"]
        
        return {
            "header": "LIFECYCLE MATRIX ANALYSIS",
            "total_streams": len(results),
            "total_ri": round(total_ri, 2),
            "average_ri": round(total_ri / len(results), 2) if results else 0,
            "matrix_status": "OMNI_COHERENCE" if resonance_count >= len(results) / 2 else "DEVELOPMENTAL_PHASE",
            "resonance_count": resonance_count,
            "growth_count": len(results) - resonance_count,
            "phi_streams": len(phi_results),
            "sqrt2_streams": len(sqrt2_results),
            "streams": results,
            "scale": f"{self.N}x{self.z}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def run_encrypted_stream(self, module: str, input_data: float) -> dict:
        """Run vitality stream with encryption envelope."""
        result = self.process_vitality_stream(module, input_data)
        
        session_key = get_random_bytes(32)
        aes_cipher = AES.new(session_key, AES.MODE_EAX)
        payload = json.dumps(result)
        ciphertext, tag = aes_cipher.encrypt_and_digest(payload.encode())
        enc_session_key = self.cipher_rsa.encrypt(session_key)
        
        return {
            "sms": f"[{module.upper()}] {result['status']}. RI: {result['scaled_ri']} | Coh: {result['coherence_percent']}%",
            "summary": result,
            "encrypted": {
                "p": base64.b64encode(ciphertext).decode(),
                "k": base64.b64encode(enc_session_key).decode(),
                "n": base64.b64encode(aes_cipher.nonce).decode(),
                "t": base64.b64encode(tag).decode()
            }
        }

    def decrypt_artifact(self, encrypted: dict) -> dict:
        """Decrypt a vitality artifact."""
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

    def list_nodules(self) -> dict:
        """List all available lifecycle nodules."""
        categories = {
            "foundational": ["physiology_anatomy", "biochemistry", "genetics", "microbiology"],
            "clinical": ["nursing_clinical", "diagnostics", "pharmacology", "emergency_response"],
            "developmental": ["prenatal_formation", "child_edu_prime", "adolescent_transition", "adult_maintenance", "elderly_wisdom_sync"],
            "community": ["community_awareness", "family_dynamics", "cultural_integration", "collective_healing"],
            "cognitive": ["cognitive_function", "emotional_regulation", "memory_consolidation", "neuroplasticity"],
            "transpersonal": ["spiritual_emergence", "ancestral_connection", "purpose_alignment", "death_transition"]
        }
        
        phi_nodules = [k for k, v in self.nodules.items() if v == self.PHI]
        sqrt2_nodules = [k for k, v in self.nodules.items() if v == self.SQRT2]
        
        return {
            "total_nodules": len(self.nodules),
            "categories": categories,
            "phi_nodules": phi_nodules,
            "sqrt2_nodules": sqrt2_nodules,
            "nodules": {k: {"constant": v, "type": "PHI" if v == self.PHI else ("SQRT2" if v == self.SQRT2 else "STANDARD")} 
                       for k, v in sorted(self.nodules.items())}
        }


# Singleton factory
_omni_engines = {}

def get_omni_engine(N: int = 10, z: int = 2) -> OmniVitalityEngine:
    """Returns OmniVitalityEngine instance for given N,z configuration."""
    key = f"{N}_{z}"
    if key not in _omni_engines:
        _omni_engines[key] = OmniVitalityEngine(N, z)
    return _omni_engines[key]
