from fastapi import APIRouter, Depends, Body
from deps import get_current_user
import math

router = APIRouter()

# ━━━ Universal Constants ━━━
CONSTANTS = {
    "phi": {"value": 1.6180339887, "symbol": "φ", "name": "Golden Ratio", "desc": "The divine proportion found throughout nature, art, and architecture"},
    "pi": {"value": 3.14159265359, "symbol": "π", "name": "Pi", "desc": "The ratio of a circle's circumference to its diameter"},
    "e": {"value": 2.71828182846, "symbol": "e", "name": "Euler's Number", "desc": "The base of natural logarithms, governing exponential growth"},
    "gravity": {"value": 9.80665, "symbol": "g", "name": "Standard Gravity", "unit": "m/s²", "desc": "Acceleration due to Earth's gravity"},
    "speed_of_sound": {"value": 343.0, "symbol": "c_s", "name": "Speed of Sound", "unit": "m/s", "desc": "Speed of sound in air at 20°C"},
    "planck": {"value": 6.62607015e-34, "symbol": "h", "name": "Planck Constant", "unit": "J·s", "desc": "Fundamental quantum of action"},
    "schumann": {"value": 7.83, "symbol": "f_s", "name": "Schumann Resonance", "unit": "Hz", "desc": "Earth's electromagnetic resonant frequency"},
}

# ━━━ Platonic Solids ━━━
PLATONIC_SOLIDS = [
    {
        "id": "tetrahedron", "name": "Tetrahedron", "element": "Fire",
        "faces": 4, "edges": 6, "vertices": 4, "face_shape": "Triangle",
        "color": "#EF4444",
        "structural_note": "Strongest frame for weight distribution. Every face is a rigid triangle.",
        "construction_use": "Roof trusses, crane booms, space frames. Inherently rigid — cannot deform without breaking an edge.",
        "frequency_hz": 396,
    },
    {
        "id": "hexahedron", "name": "Hexahedron (Cube)", "element": "Earth",
        "faces": 6, "edges": 12, "vertices": 8, "face_shape": "Square",
        "color": "#22C55E",
        "structural_note": "Foundation of traditional 90° construction. Requires diagonal bracing to resist shear.",
        "construction_use": "Building foundations, rooms, shipping containers. Easy to manufacture but needs cross-bracing.",
        "frequency_hz": 432,
    },
    {
        "id": "octahedron", "name": "Octahedron", "element": "Air",
        "faces": 8, "edges": 12, "vertices": 6, "face_shape": "Triangle",
        "color": "#3B82F6",
        "structural_note": "Dual of the cube. All triangular faces make it very rigid.",
        "construction_use": "Diamond crystal structure, molecular geometry. Used in tensegrity sculptures.",
        "frequency_hz": 528,
    },
    {
        "id": "dodecahedron", "name": "Dodecahedron", "element": "Aether",
        "faces": 12, "edges": 30, "vertices": 20, "face_shape": "Pentagon",
        "color": "#FBBF24",
        "structural_note": "Contains the Golden Ratio in every dimension. The shape of the universe itself.",
        "construction_use": "Acoustic diffusers, geodesic variants. Pentagon faces resist uniform pressure.",
        "frequency_hz": 741,
    },
    {
        "id": "icosahedron", "name": "Icosahedron", "element": "Water",
        "faces": 20, "edges": 30, "vertices": 12, "face_shape": "Triangle",
        "color": "#A78BFA",
        "structural_note": "Basis for geodesic domes. Maximum interior volume with minimum material.",
        "construction_use": "Geodesic domes, virus capsids, fullerenes. Most efficient enclosure in nature.",
        "frequency_hz": 852,
    },
]

# ━━━ Materials Resonance Library ━━━
MATERIALS = [
    {"id": "water", "name": "Water", "density": 997, "speed_of_sound": 1480, "resonance_note": "Cymatics: water forms star patterns at 432Hz", "color": "#3B82F6"},
    {"id": "sand", "name": "Sand", "density": 1600, "speed_of_sound": 300, "resonance_note": "Chladni plates: sand collects at nodal lines", "color": "#F59E0B"},
    {"id": "glass", "name": "Glass", "density": 2500, "speed_of_sound": 5640, "resonance_note": "Wine glasses shatter at their natural frequency (~550Hz)", "color": "#06B6D4"},
    {"id": "steel", "name": "Steel", "density": 7800, "speed_of_sound": 5960, "resonance_note": "Tuning forks: precise frequency from length and cross-section", "color": "#94A3B8"},
    {"id": "wood_oak", "name": "Oak Wood", "density": 750, "speed_of_sound": 3850, "resonance_note": "Violin bodies: shaped to amplify specific harmonics", "color": "#92400E"},
    {"id": "concrete", "name": "Concrete", "density": 2400, "speed_of_sound": 3400, "resonance_note": "Bridges: must avoid resonant frequency matching wind/traffic", "color": "#6B7280"},
    {"id": "copper", "name": "Copper", "density": 8960, "speed_of_sound": 3750, "resonance_note": "Singing bowls: alloy composition determines harmonic richness", "color": "#F97316"},
    {"id": "crystal", "name": "Quartz Crystal", "density": 2650, "speed_of_sound": 5720, "resonance_note": "Piezoelectric: converts mechanical stress to electrical signal", "color": "#EC4899"},
]


@router.get("/workshop/constants")
async def get_constants(user=Depends(get_current_user)):
    """Universal constants for physics calculations."""
    return {"constants": CONSTANTS}


@router.get("/workshop/platonic-solids")
async def get_platonic_solids(user=Depends(get_current_user)):
    """Platonic solids with structural analysis data."""
    return {"solids": PLATONIC_SOLIDS}


@router.get("/workshop/materials")
async def get_materials(user=Depends(get_current_user)):
    """Materials resonance library."""
    return {"materials": MATERIALS}


@router.post("/workshop/golden-ratio")
async def calculate_golden_ratio(data: dict = Body(...), user=Depends(get_current_user)):
    """Calculate Golden Ratio proportions for a given dimension."""
    dimension = data.get("dimension", 0)
    if not dimension or dimension <= 0:
        return {"error": "Provide a positive dimension value"}

    phi = 1.6180339887
    return {
        "input": dimension,
        "phi": phi,
        "golden_long": round(dimension * phi, 4),
        "golden_short": round(dimension / phi, 4),
        "golden_sections": [
            {"label": "Major segment", "value": round(dimension / phi, 4)},
            {"label": "Minor segment", "value": round(dimension - dimension / phi, 4)},
        ],
        "nested": [
            {"depth": i, "value": round(dimension / (phi ** i), 4)}
            for i in range(1, 6)
        ],
    }


@router.post("/workshop/inverse-square")
async def calculate_inverse_square(data: dict = Body(...), user=Depends(get_current_user)):
    """Calculate sound intensity at distance using inverse square law."""
    source_power = data.get("power", 1.0)  # watts
    distance = data.get("distance", 1.0)  # meters
    if distance <= 0:
        return {"error": "Distance must be positive"}

    intensity = source_power / (4 * math.pi * distance ** 2)
    db_level = 10 * math.log10(max(intensity / 1e-12, 1e-30))

    return {
        "source_power_watts": source_power,
        "distance_m": distance,
        "intensity_w_m2": round(intensity, 10),
        "db_spl": round(db_level, 1),
        "falloff_curve": [
            {"distance": d, "intensity": round(source_power / (4 * math.pi * d ** 2), 10), "db": round(10 * math.log10(max(source_power / (4 * math.pi * d ** 2) / 1e-12, 1e-30)), 1)}
            for d in [0.5, 1, 2, 3, 5, 8, 10, 15, 20]
        ],
    }


@router.post("/workshop/harmonic-nodes")
async def calculate_harmonic_nodes(data: dict = Body(...), user=Depends(get_current_user)):
    """Calculate nodes and antinodes for a vibrating string/plate."""
    length = data.get("length", 1.0)  # meters
    harmonic = data.get("harmonic", 1)  # harmonic number
    material_speed = data.get("speed_of_sound", 343.0)  # m/s

    if harmonic < 1 or harmonic > 12:
        return {"error": "Harmonic must be between 1 and 12"}

    wavelength = (2 * length) / harmonic
    frequency = material_speed / wavelength
    nodes = [round(i * length / harmonic, 4) for i in range(harmonic + 1)]
    antinodes = [round((i + 0.5) * length / harmonic, 4) for i in range(harmonic)]

    return {
        "length": length,
        "harmonic": harmonic,
        "wavelength": round(wavelength, 4),
        "frequency": round(frequency, 2),
        "nodes": nodes,
        "antinodes": antinodes,
        "node_count": len(nodes),
        "antinode_count": len(antinodes),
    }
