"""
ENLIGHTEN.MINT.CAFE - V-FINAL CRYSTAL MARKETPLACE
refraction_engine.py

THE MATH LAYER ECONOMY:
- Aesthetic Overlays (Base Tier): Mineral signatures with real-world refraction indices
- Math Refractions (Premium Tier): L² Fractal Engine scripts that control light behavior
- Proof of Math: Users buy rights to see UI through specific mathematical lenses

MINERALOGY REFRACTION INDICES (Real-World):
- Clear Quartz: n = 1.544
- Amethyst: n = 1.544 (with internal scattering)
- Rose Quartz: n = 1.544 (diffused, matte)
- Obsidian: n = 1.489 (volcanic glass)
- Selenite: n = 1.520 (9x9 Helix resonance)
- Labradorite: n = 1.560 (iridescent play)
- Opal: n = 1.450 (spectral flash)
"""

import math
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from deps import logger


class RefractionEngine:
    """
    V-FINAL CRYSTAL MARKETPLACE — The Math Layer Controller
    
    Controls how light bends, rainbow sheen intensity, and prismatic blur
    reactions based on the user's purchased mathematical license.
    """
    
    # Golden Constants
    PHI = 1.618033988749895
    INFINITY_MINUS_ONE = float('inf') - 1  # Symbolic edge
    L2_FRACTAL_DEPTH = 54
    SEG_FREQUENCY = 144  # Hz
    
    # ═══════════════════════════════════════════════════════════════════════════
    # AESTHETIC OVERLAYS (BASE TIER) — Mineral Signatures
    # ═══════════════════════════════════════════════════════════════════════════
    
    MINERAL_SIGNATURES = {
        "CLEAR_QUARTZ": {
            "name": "Clear Quartz",
            "refraction_index": 1.544,
            "dispersion": 0.013,
            "clarity": 0.98,
            "description": "High clarity, sharp edges. The purest mathematical lens.",
            "color_primary": "#FFFFFF",
            "color_secondary": "#E0E0E0",
            "shader_params": {
                "edge_sharpness": 0.95,
                "internal_scatter": 0.02,
                "surface_polish": 0.99,
            },
            "tier": "BASE",
            "price_dust": 0,
        },
        "AMETHYST": {
            "name": "Amethyst",
            "refraction_index": 1.544,
            "dispersion": 0.013,
            "clarity": 0.85,
            "description": "Deep purple hues with high internal scattering. Wisdom lens.",
            "color_primary": "#8B5CF6",
            "color_secondary": "#6D28D9",
            "shader_params": {
                "edge_sharpness": 0.70,
                "internal_scatter": 0.45,
                "surface_polish": 0.88,
                "violet_boost": 1.5,
            },
            "tier": "BASE",
            "price_dust": 100,
        },
        "ROSE_QUARTZ": {
            "name": "Rose Quartz",
            "refraction_index": 1.544,
            "dispersion": 0.013,
            "clarity": 0.72,
            "description": "Soft, diffused pink glow with matte finish. Heart lens.",
            "color_primary": "#FDA4AF",
            "color_secondary": "#FB7185",
            "shader_params": {
                "edge_sharpness": 0.40,
                "internal_scatter": 0.65,
                "surface_polish": 0.55,
                "bloom_intensity": 1.3,
            },
            "tier": "BASE",
            "price_dust": 150,
        },
        "OBSIDIAN": {
            "name": "Obsidian",
            "refraction_index": 1.489,
            "dispersion": 0.010,
            "clarity": 0.95,
            "description": "High reflectivity, dark glass-like surface. Void lens.",
            "color_primary": "#18181B",
            "color_secondary": "#09090B",
            "shader_params": {
                "edge_sharpness": 0.99,
                "internal_scatter": 0.01,
                "surface_polish": 0.97,
                "reflection_intensity": 0.85,
            },
            "tier": "BASE",
            "price_dust": 200,
        },
        "SELENITE": {
            "name": "Selenite",
            "refraction_index": 1.520,
            "dispersion": 0.012,
            "clarity": 0.90,
            "description": "9×9 Helix resonance. The architectural lens.",
            "color_primary": "#F0F9FF",
            "color_secondary": "#E0F2FE",
            "shader_params": {
                "edge_sharpness": 0.85,
                "internal_scatter": 0.15,
                "surface_polish": 0.92,
                "helix_pattern": True,
            },
            "tier": "PREMIUM",
            "price_dust": 500,
        },
        "LABRADORITE": {
            "name": "Labradorite",
            "refraction_index": 1.560,
            "dispersion": 0.018,
            "clarity": 0.78,
            "description": "Iridescent play of colors. The aurora lens.",
            "color_primary": "#0EA5E9",
            "color_secondary": "#14B8A6",
            "shader_params": {
                "edge_sharpness": 0.65,
                "internal_scatter": 0.35,
                "surface_polish": 0.80,
                "iridescence": 0.90,
                "color_shift_angle": 45,
            },
            "tier": "PREMIUM",
            "price_dust": 750,
        },
        "OPAL": {
            "name": "Rainbow Opal",
            "refraction_index": 1.450,
            "dispersion": 0.020,
            "clarity": 0.65,
            "description": "Spectral flash. The opalized core lens. Live telemetry ready.",
            "color_primary": "#FBBF24",
            "color_secondary": "#F472B6",
            "shader_params": {
                "edge_sharpness": 0.50,
                "internal_scatter": 0.55,
                "surface_polish": 0.75,
                "spectral_flash": True,
                "play_of_color": 0.95,
            },
            "tier": "LEGENDARY",
            "price_dust": 1500,
        },
    }
    
    # ═══════════════════════════════════════════════════════════════════════════
    # MATH REFRACTIONS (PREMIUM TIER) — L² Fractal Engine Scripts
    # ═══════════════════════════════════════════════════════════════════════════
    
    MATH_REFRACTIONS = {
        "INFINITY_EDGE": {
            "name": "Infinity Minus One",
            "description": "Creates a distinct visual edge that shouldn't exist in Euclidean space.",
            "formula": "∞ - 1",
            "visual_effect": "Boundary dissolution at crystal edges",
            "shader_injection": """
                // INFINITY_EDGE: Non-Euclidean boundary
                float edge = smoothstep(0.0, 0.01, abs(distance - 1.0));
                color.rgb *= mix(1.0, PHI, 1.0 - edge);
                color.a = mix(color.a, 0.0, pow(1.0 - edge, PHI));
            """,
            "tier": "PREMIUM",
            "price_gems": 50,
            "unlock_requirement": "Tier 1 (Trustee)",
        },
        "PRISMATIC_DISPERSION": {
            "name": "Prismatic Dispersion",
            "description": "Custom formula for how white light splits based on node location.",
            "formula": "λ = c / (n × f_SEG)",
            "visual_effect": "Location-aware rainbow splitting",
            "shader_injection": """
                // PRISMATIC_DISPERSION: Node-based light split
                vec3 wavelength = vec3(700.0, 546.0, 435.0) / 1000.0;
                float n = refraction_index;
                vec3 dispersed = sin(wavelength * PI * n * node_factor);
                color.rgb = mix(color.rgb, dispersed, dispersion_strength);
            """,
            "tier": "PREMIUM",
            "price_gems": 75,
            "unlock_requirement": "Complete 5 quests",
        },
        "L2_FRACTAL_RECURSION": {
            "name": "L² Fractal Recursion",
            "description": "54-layer fractal depth applied to crystal surface.",
            "formula": "F(n) = F(n-1)² + F(n-2)",
            "visual_effect": "Infinite zoom into crystal structure",
            "shader_injection": """
                // L2_FRACTAL_RECURSION: 54-layer depth
                float fractal = 0.0;
                vec2 z = uv;
                for(int i = 0; i < 54; i++) {
                    z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + uv;
                    fractal += 1.0 / (1.0 + dot(z, z));
                }
                color.rgb *= 1.0 + fractal * 0.1;
            """,
            "tier": "LEGENDARY",
            "price_gems": 150,
            "unlock_requirement": "Tier 2 (Grand Architect)",
        },
        "PHI_SPIRAL_BLOOM": {
            "name": "Golden Ratio Bloom",
            "description": "φ-based spiral bloom emanating from touch points.",
            "formula": "θ = n × 137.5°",
            "visual_effect": "Fibonacci spiral light trails",
            "shader_injection": """
                // PHI_SPIRAL_BLOOM: Golden angle dispersion
                float angle = atan(uv.y, uv.x);
                float radius = length(uv);
                float phi_angle = mod(angle, 2.39996); // 137.5° in radians
                float spiral = sin(radius * 10.0 - phi_angle * PHI);
                color.rgb += vec3(spiral) * bloom_intensity * 0.2;
            """,
            "tier": "LEGENDARY",
            "price_gems": 200,
            "unlock_requirement": "1000+ XP",
        },
        "OBSIDIAN_VOID_RENDER": {
            "name": "Obsidian Void",
            "description": "144Hz Obsidian Void rendering mode. Pure gesture navigation.",
            "formula": "V = -∫(light) dt",
            "visual_effect": "Light absorption with edge glow",
            "shader_injection": """
                // OBSIDIAN_VOID_RENDER: Light absorption
                float void_factor = 1.0 - smoothstep(0.0, 0.5, brightness);
                color.rgb *= void_factor;
                color.rgb += edge_glow * (1.0 - void_factor) * vec3(0.545, 0.361, 0.965);
            """,
            "tier": "OMEGA",
            "price_gems": 500,
            "unlock_requirement": "Tier 3 (Omega Sovereign)",
        },
    }
    
    # User refraction states (in-memory, would be MongoDB in production)
    _user_licenses = {}
    
    @classmethod
    def get_mineral_catalog(cls) -> List[Dict[str, Any]]:
        """Get all available mineral signatures."""
        return [
            {
                "id": key,
                **{k: v for k, v in mineral.items() if k != "shader_params"},
            }
            for key, mineral in cls.MINERAL_SIGNATURES.items()
        ]
    
    @classmethod
    def get_math_catalog(cls) -> List[Dict[str, Any]]:
        """Get all available math refractions."""
        return [
            {
                "id": key,
                **{k: v for k, v in refraction.items() if k != "shader_injection"},
            }
            for key, refraction in cls.MATH_REFRACTIONS.items()
        ]
    
    @classmethod
    def get_user_licenses(cls, user_id: str) -> Dict[str, Any]:
        """Get user's owned minerals and math refractions."""
        if user_id not in cls._user_licenses:
            cls._user_licenses[user_id] = {
                "user_id": user_id,
                "active_mineral": "CLEAR_QUARTZ",
                "owned_minerals": ["CLEAR_QUARTZ"],
                "active_math": None,
                "owned_math": [],
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        return cls._user_licenses[user_id]
    
    @classmethod
    def purchase_mineral(cls, user_id: str, mineral_id: str, wallet_dust: int) -> Dict[str, Any]:
        """Purchase a mineral signature."""
        mineral = cls.MINERAL_SIGNATURES.get(mineral_id)
        if not mineral:
            return {"status": "error", "message": f"Unknown mineral: {mineral_id}"}
        
        license = cls.get_user_licenses(user_id)
        
        if mineral_id in license["owned_minerals"]:
            return {"status": "error", "message": "Already owned"}
        
        price = mineral["price_dust"]
        if wallet_dust < price:
            return {"status": "error", "message": f"Insufficient Dust. Need {price}, have {wallet_dust}"}
        
        license["owned_minerals"].append(mineral_id)
        
        return {
            "status": "success",
            "purchased": mineral_id,
            "price_paid": price,
            "remaining_dust": wallet_dust - price,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    
    @classmethod
    def purchase_math_refraction(cls, user_id: str, math_id: str, wallet_gems: int, user_tier: int) -> Dict[str, Any]:
        """Purchase a math refraction license."""
        refraction = cls.MATH_REFRACTIONS.get(math_id)
        if not refraction:
            return {"status": "error", "message": f"Unknown refraction: {math_id}"}
        
        license = cls.get_user_licenses(user_id)
        
        if math_id in license["owned_math"]:
            return {"status": "error", "message": "Already licensed"}
        
        # Check tier requirement
        tier_map = {"PREMIUM": 1, "LEGENDARY": 2, "OMEGA": 3}
        required_tier = tier_map.get(refraction["tier"], 0)
        if user_tier < required_tier:
            return {"status": "error", "message": f"Requires Tier {required_tier}. Current: {user_tier}"}
        
        price = refraction["price_gems"]
        if wallet_gems < price:
            return {"status": "error", "message": f"Insufficient Gems. Need {price}, have {wallet_gems}"}
        
        license["owned_math"].append(math_id)
        
        return {
            "status": "success",
            "licensed": math_id,
            "formula": refraction["formula"],
            "visual_effect": refraction["visual_effect"],
            "price_paid": price,
            "remaining_gems": wallet_gems - price,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    
    @classmethod
    def set_active_mineral(cls, user_id: str, mineral_id: str) -> Dict[str, Any]:
        """Set user's active mineral signature."""
        license = cls.get_user_licenses(user_id)
        
        if mineral_id not in license["owned_minerals"]:
            return {"status": "error", "message": "Mineral not owned"}
        
        license["active_mineral"] = mineral_id
        mineral = cls.MINERAL_SIGNATURES[mineral_id]
        
        return {
            "status": "success",
            "active_mineral": mineral_id,
            "refraction_index": mineral["refraction_index"],
            "shader_params": mineral["shader_params"],
        }
    
    @classmethod
    def set_active_math(cls, user_id: str, math_id: Optional[str]) -> Dict[str, Any]:
        """Set user's active math refraction (None to disable)."""
        license = cls.get_user_licenses(user_id)
        
        if math_id and math_id not in license["owned_math"]:
            return {"status": "error", "message": "Math refraction not licensed"}
        
        license["active_math"] = math_id
        
        if math_id:
            refraction = cls.MATH_REFRACTIONS[math_id]
            return {
                "status": "success",
                "active_math": math_id,
                "formula": refraction["formula"],
                "visual_effect": refraction["visual_effect"],
            }
        
        return {"status": "success", "active_math": None, "message": "Math layer disabled"}
    
    @classmethod
    def calculate_prismatic_dispersion(cls, mineral_id: str, node_lat: float, node_lng: float) -> Dict[str, Any]:
        """
        Calculate prismatic dispersion based on mineral and node location.
        
        Formula: λ = c / (n × f_SEG) adjusted by geolocation
        """
        mineral = cls.MINERAL_SIGNATURES.get(mineral_id, cls.MINERAL_SIGNATURES["CLEAR_QUARTZ"])
        n = mineral["refraction_index"]
        dispersion = mineral["dispersion"]
        
        # Node factor based on coordinates (Black Hills = 1.0, others scaled)
        black_hills_lat, black_hills_lng = 44.0805, -103.231
        distance = math.sqrt((node_lat - black_hills_lat)**2 + (node_lng - black_hills_lng)**2)
        node_factor = 1.0 / (1.0 + distance / 100)
        
        # Wavelength calculations (RGB in nm)
        c = 299792458  # Speed of light
        wavelengths = {
            "red": c / (n * cls.SEG_FREQUENCY * 1e12) * 700,
            "green": c / (n * cls.SEG_FREQUENCY * 1e12) * 546,
            "blue": c / (n * cls.SEG_FREQUENCY * 1e12) * 435,
        }
        
        # Dispersion angles
        angles = {
            color: math.degrees(math.asin(math.sin(math.radians(45)) / (n + dispersion * (wl - 550) / 100)))
            for color, wl in wavelengths.items()
        }
        
        return {
            "mineral": mineral_id,
            "refraction_index": n,
            "dispersion": dispersion,
            "node_factor": round(node_factor, 4),
            "wavelengths_nm": {k: round(v, 2) for k, v in wavelengths.items()},
            "dispersion_angles_deg": {k: round(v, 4) for k, v in angles.items()},
            "rainbow_spread": round(abs(angles["red"] - angles["blue"]), 4),
            "seg_frequency": cls.SEG_FREQUENCY,
        }
    
    @classmethod
    def get_shader_injection(cls, user_id: str) -> Dict[str, Any]:
        """
        Get the complete shader injection code for a user's active configuration.
        This is what gets sent to the Three.js renderer.
        """
        license = cls.get_user_licenses(user_id)
        mineral = cls.MINERAL_SIGNATURES[license["active_mineral"]]
        
        shader_code = f"""
// ═══════════════════════════════════════════════════════════════
// CRYSTAL REFRACTION ENGINE — User: {user_id}
// Mineral: {mineral['name']} | n = {mineral['refraction_index']}
// ═══════════════════════════════════════════════════════════════

#define PHI {cls.PHI}
#define SEG_HZ {cls.SEG_FREQUENCY}.0
#define REFRACTION_INDEX {mineral['refraction_index']}
#define DISPERSION {mineral['dispersion']}

// Mineral shader params
float edge_sharpness = {mineral['shader_params']['edge_sharpness']};
float internal_scatter = {mineral['shader_params']['internal_scatter']};
float surface_polish = {mineral['shader_params']['surface_polish']};
"""
        
        if license["active_math"]:
            math_refraction = cls.MATH_REFRACTIONS[license["active_math"]]
            shader_code += f"""
// ═══════════════════════════════════════════════════════════════
// MATH REFRACTION: {math_refraction['name']}
// Formula: {math_refraction['formula']}
// ═══════════════════════════════════════════════════════════════

{math_refraction['shader_injection']}
"""
        
        return {
            "user_id": user_id,
            "active_mineral": license["active_mineral"],
            "active_math": license["active_math"],
            "shader_code": shader_code,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }


# Global instance
refraction_engine = RefractionEngine()
