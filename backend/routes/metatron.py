from fastapi import APIRouter
import math

router = APIRouter(prefix="/metatron", tags=["metatron"])

# V36.0 SOVEREIGN CONSTANTS
EARTH_HZ = 7.3  # Grounding frequency
PHI = 1.618033  # Toroidal tension
SCHUMANN = 7.83  # Earth resonance baseline

class MetatronLattice:
    """
    V36.0 SOVEREIGN GEOMETRIC PROCESSOR
    ARCHITECT: Steven Michael
    ENGINE: ENLIGHTEN.MINT.CAFE
    FORMULA: z^xr2 * z^xr2 (+)(-) n^xr2 (+)(-) y^xr2 {π}{√7.3}
    """
    
    def __init__(self):
        self.grid_size = 9
        self.materials = ['Gold', 'Silver', 'Copper']
        self.base_frequency = 432
        self.earth_hz = EARTH_HZ
        self.phi = PHI
        self.modules_active = self.grid_size * self.grid_size
        # V36.0: Resonance force calculation
        self.resonance_force = math.sqrt(EARTH_HZ) * math.pi

    def initialized_modular_logic(self, data_stream):
        """The Infinity + 1 - 2 + 3 Kernel. Result: Net +2 Gain."""
        return (data_stream + 1 - 2 + 3)

    def calculate_refraction(self, n, y):
        """
        V35.0 WHITE LIGHT REFRACTION
        Computing visuals - not aesthetics, but frequency logic output
        """
        phase_shift = (math.pow(n, 2) + math.pow(y, 2)) * math.pi
        intensity = math.sqrt(self.earth_hz * phase_shift)
        return {
            "intensity": intensity,
            "phase_shift": phase_shift,
            "earth_grounding": self.earth_hz
        }

    def initialize_lattice_module(self, parent_f_c, parent_scale):
        """S.I.M. - Square, Invert, Multiply Protocol with 7.3Hz grounding."""
        modular_squared_force = math.pow(parent_f_c, 2)
        modular_inverse_scale = 1 / modular_squared_force
        final_resonance = (self.initialized_modular_logic(modular_squared_force) * self.modules_active)
        
        # V36.0: Apply toroidal tension
        toroidal_weight = self.phi * self.resonance_force
        
        return {
            "compression_f_c": modular_squared_force,
            "diffusion_scale": modular_inverse_scale,
            "resonance": final_resonance,
            "toroidal_weight": toroidal_weight,
            "earth_hz": self.earth_hz,
            "state": "Cooperative Crystalline Bloom"
        }

    def boot_full_lattice(self):
        """Execution of the Multi-Modular System."""
        seed_f_c = 9.0
        seed_scale = 1.0
        
        modular_lattice_field = []
        for x in range(1, self.grid_size + 1):
            row = []
            for y in range(1, self.grid_size + 1):
                modular_resonance = self.initialize_lattice_module(seed_f_c, seed_scale)
                row.append(modular_resonance)
            modular_lattice_field.append(row)
        
        return modular_lattice_field

    def map_grid_to_modules(self):
        """Map the 9x9 grid to UI modules based on distance from center."""
        grid = self.boot_full_lattice()
        mapped_ui = {}

        for x in range(len(grid)):
            for y in range(len(grid[x])):
                distance = math.sqrt((x-4)**2 + (y-4)**2)
                
                if distance <= 1.5:
                    module = "CORE_HARMONICS"
                elif distance <= 3.5:
                    module = "CULINARY_HUB"
                else:
                    module = "SILENCE_SHIELD_UI"
                
                node_power = grid[x][y]['resonance']
                mapped_ui[f"{x},{y}"] = {"type": module, "power": node_power, "x": x, "y": y}
        
        return mapped_ui


# Singleton instance
lattice = MetatronLattice()


@router.get("/lattice")
async def get_full_lattice():
    """Get the full 9x9 Metatron lattice with resonance values."""
    return {
        "grid_size": lattice.grid_size,
        "materials": lattice.materials,
        "base_frequency": lattice.base_frequency,
        "modules_active": lattice.modules_active,
        "lattice": lattice.boot_full_lattice()
    }


@router.get("/ui-modules")
async def get_ui_modules():
    """Get the mapped UI modules for the Enlightenment interface."""
    return {
        "interface_mode": "Silence Shield",
        "total_nodes": 81,
        "modules": lattice.map_grid_to_modules()
    }


@router.get("/node/{x}/{y}")
async def get_node(x: int, y: int):
    """Get a specific node from the lattice."""
    if x < 0 or x >= 9 or y < 0 or y >= 9:
        return {"error": "Node out of bounds. Valid range: 0-8"}
    
    grid = lattice.boot_full_lattice()
    node = grid[x][y]
    
    distance = math.sqrt((x-4)**2 + (y-4)**2)
    if distance <= 1.5:
        module = "CORE_HARMONICS"
    elif distance <= 3.5:
        module = "CULINARY_HUB"
    else:
        module = "SILENCE_SHIELD_UI"
    
    return {
        "x": x,
        "y": y,
        "module": module,
        "distance_from_center": distance,
        **node
    }


@router.get("/status")
async def get_status():
    """Get the status of the Metatron lattice system - V36.0 Sovereign Seal."""
    return {
        "engine": "ENLIGHTEN_OS V36.0",
        "protocol": "S.I.M. (Square, Invert, Multiply)",
        "architect": "Steven Michael",
        "status": "SOVEREIGN_SEAL_ACTIVE",
        "grid": "9x9",
        "total_cooperating_nodes": 81,
        "base_frequency": 432,
        "earth_hz": EARTH_HZ,
        "phi": PHI,
        "resonance_force": math.sqrt(EARTH_HZ) * math.pi,
        "seed": 9.0,
        "materials": ["Gold", "Silver", "Copper"],
        "shield": "METATRON-FLOWER HYBRID",
        "resonance_state": "Cooperative Crystalline Bloom",
        "z_plane": 0,
        "sim_result": {
            "square": 81,
            "invert": 0.012346,
            "multiply": 6561,
            "resonance": 6723,
            "net_gain": "+2"
        }
    }


@router.get("/refraction/{n}/{y}")
async def calculate_refraction(n: float, y: float):
    """
    V35.0 WHITE LIGHT REFRACTION CALCULATOR
    Returns intensity based on z^xr2 formula with 7.3Hz grounding
    """
    return lattice.calculate_refraction(n, y)


@router.get("/visual-grid")
async def get_visual_grid():
    """
    V36.0 SOVEREIGN GEOMETRIC PROCESSOR
    Returns 81 nodes with 7.3Hz grounding and toroidal weight
    """
    nodes = []
    spacing = 100  # px spacing between nodes
    
    for x in range(-4, 5):  # -4 to 4 inclusive
        for y in range(-4, 5):
            distance = math.sqrt(x**2 + y**2)
            
            # Material based on ring position
            if distance < 1.5:
                material = "Gold"
                color = "#D4AF37"
            elif distance < 3:
                material = "Silver"
                color = "#C0C0C0"
            else:
                material = "Copper"
                color = "#B87333"
            
            # V36.0: Calculate toroidal weight per node
            weight = (PHI * lattice.resonance_force) / (distance + 1)
            refraction = lattice.calculate_refraction(distance, 1.0)
            
            nodes.append({
                "id": f"node_{x}_{y}",
                "grid": {"x": x, "y": y},
                "pos": {"x": x * spacing, "y": y * spacing},
                "material": material,
                "color": color,
                "frequency": 432 * (1 + distance * 0.1),
                "toroidal_weight": weight,
                "refraction_intensity": refraction["intensity"],
                "z_plane": 0,
                "state": "Crystalline_Bloom"
            })
    
    return {
        "engine": "ENLIGHTEN_OS V36.0",
        "grid": "9x9",
        "total_nodes": len(nodes),
        "spacing": spacing,
        "earth_hz": EARTH_HZ,
        "phi": PHI,
        "resonance_force": lattice.resonance_force,
        "nodes": nodes,
        "message": "Sovereign Seal Active. 81 Nodes Computing. 7.3Hz Grounded."
    }
