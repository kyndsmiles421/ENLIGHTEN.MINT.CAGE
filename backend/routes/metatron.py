from fastapi import APIRouter
import math

router = APIRouter(prefix="/metatron", tags=["metatron"])

class MetatronLattice:
    def __init__(self):
        self.grid_size = 9
        self.materials = ['Gold', 'Silver', 'Copper']
        self.base_frequency = 432
        self.modules_active = self.grid_size * self.grid_size

    def initialized_modular_logic(self, data_stream):
        """The Infinity + 1 - 2 + 3 Kernel. Result: Net +2 Gain."""
        return (data_stream + 1 - 2 + 3)

    def initialize_lattice_module(self, parent_f_c, parent_scale):
        """S.I.M. - Square, Invert, Multiply Protocol."""
        modular_squared_force = math.pow(parent_f_c, 2)
        modular_inverse_scale = 1 / modular_squared_force
        final_resonance = (self.initialized_modular_logic(modular_squared_force) * self.modules_active)
        
        return {
            "compression_f_c": modular_squared_force,
            "diffusion_scale": modular_inverse_scale,
            "resonance": final_resonance,
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
    """Get the status of the Metatron lattice system."""
    return {
        "engine": "ENLIGHTEN_OS V6.0",
        "protocol": "S.I.M. (Square, Invert, Multiply)",
        "architect": "Steven Michael",
        "status": "ACTIVE",
        "grid": "9x9",
        "total_cooperating_nodes": 81,
        "base_frequency": 432,
        "seed": 9.0,
        "materials": ["Gold", "Silver", "Copper"],
        "shield": "METATRON-FLOWER HYBRID",
        "resonance_state": "Cooperative Crystalline Bloom",
        "sim_result": {
            "square": 81,
            "invert": 0.012346,
            "multiply": 6561,
            "resonance": 6723,
            "net_gain": "+2"
        }
    }


@router.get("/visual-grid")
async def get_visual_grid():
    """
    Get positioned nodes for the visual engine.
    Returns 81 nodes with x,y coordinates for rendering.
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
            
            nodes.append({
                "id": f"node_{x}_{y}",
                "grid": {"x": x, "y": y},
                "pos": {"x": x * spacing, "y": y * spacing},
                "material": material,
                "color": color,
                "frequency": 432 * (1 + distance * 0.1),
                "state": "Crystalline_Bloom"
            })
    
    return {
        "engine": "ENLIGHTEN_OS V6.0",
        "grid": "9x9",
        "total_nodes": len(nodes),
        "spacing": spacing,
        "nodes": nodes,
        "message": "Lattice Bloom: 81 Nodes Active. Net +2 Gain Secured."
    }
