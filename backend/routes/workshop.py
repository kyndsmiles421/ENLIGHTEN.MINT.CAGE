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


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MASONRY 3D CIRCULAR WORKSHOP — Trade Pillar Engine
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MASONRY_STONES = [
    {
        "id": "granite",
        "name": "Granite",
        "color": "#94A3B8",
        "density_kg_m3": 2750,
        "mohs_hardness": 6.5,
        "compressive_mpa": 200,
        "origin": "Igneous — slow-cooled magma deep in Earth's crust",
        "mineral_composition": ["Feldspar (60%)", "Quartz (30%)", "Mica (10%)"],
        "crystal_system": "Triclinic (Feldspar) / Hexagonal (Quartz)",
        "uses": "Foundations, countertops, monuments, curbstones",
        "dive_layers": [
            {"depth": 0, "label": "Quarried Block", "desc": "Rough-hewn granite slab with visible grain"},
            {"depth": 1, "label": "Grain Structure", "desc": "Interlocking feldspar, quartz and mica crystals visible at 2x magnification"},
            {"depth": 2, "label": "Mineral Domains", "desc": "Orthoclase feldspar pink zones, quartz glass-clear veins, biotite mica dark flakes"},
            {"depth": 3, "label": "Crystal Lattice", "desc": "SiO4 tetrahedra chains in quartz; AlSi3O8 framework in feldspar"},
            {"depth": 4, "label": "Molecular Bonds", "desc": "Si-O covalent bonds at 1.61 angstroms; K+ ions in feldspar cleavage planes"},
            {"depth": 5, "label": "Quantum Shell", "desc": "Silicon 3p orbital hybridization; piezoelectric potential in quartz domains"},
        ],
    },
    {
        "id": "marble",
        "name": "Marble",
        "color": "#E2E8F0",
        "density_kg_m3": 2710,
        "mohs_hardness": 3.5,
        "compressive_mpa": 70,
        "origin": "Metamorphic — limestone recrystallized under heat and pressure",
        "mineral_composition": ["Calcite (95%)", "Dolomite (3%)", "Trace minerals (2%)"],
        "crystal_system": "Trigonal (Calcite rhombohedra)",
        "uses": "Sculpture, flooring, facades, altars",
        "dive_layers": [
            {"depth": 0, "label": "Polished Slab", "desc": "Luminous white surface with grey veining"},
            {"depth": 1, "label": "Sugar Grain", "desc": "Interlocking calcite sugar-crystals 0.2-2mm across"},
            {"depth": 2, "label": "Calcite Domains", "desc": "Rhombohedral cleavage faces catching light — double refraction visible"},
            {"depth": 3, "label": "CaCO3 Lattice", "desc": "Calcium ions + planar carbonate groups in trigonal symmetry"},
            {"depth": 4, "label": "Ionic Architecture", "desc": "Ca2+ coordinated by 6 oxygen atoms; CO3 plane at 120 degree angles"},
            {"depth": 5, "label": "Electron Clouds", "desc": "Calcium 4s orbital empty; carbon sp2 hybridization in carbonate"},
        ],
    },
    {
        "id": "limestone",
        "name": "Limestone",
        "color": "#D4C5A9",
        "density_kg_m3": 2500,
        "mohs_hardness": 3.0,
        "compressive_mpa": 55,
        "origin": "Sedimentary — ancient sea floors compressed over millions of years",
        "mineral_composition": ["Calcite (80%)", "Aragonite (10%)", "Fossil fragments (10%)"],
        "crystal_system": "Trigonal (Calcite) / Orthorhombic (Aragonite)",
        "uses": "Walls, arches, cement production, pyramids of Giza",
        "dive_layers": [
            {"depth": 0, "label": "Ashlar Block", "desc": "Cream-colored dressed stone with fossil impressions"},
            {"depth": 1, "label": "Fossil Matrix", "desc": "Crinoid stems, shell fragments, foram tests in calcite cement"},
            {"depth": 2, "label": "Biogenic Calcite", "desc": "Microcrystalline calcite (micrite) binding bioclasts"},
            {"depth": 3, "label": "CaCO3 Microstructure", "desc": "Nanometer-scale calcite rhombs in biological template"},
            {"depth": 4, "label": "Carbonate Chemistry", "desc": "CO2 + H2O + CaCO3 equilibrium — the carbon cycle in stone"},
            {"depth": 5, "label": "Isotope Record", "desc": "O-18/O-16 ratio records ancient ocean temperature"},
        ],
    },
    {
        "id": "slate",
        "name": "Slate",
        "color": "#475569",
        "density_kg_m3": 2800,
        "mohs_hardness": 5.5,
        "compressive_mpa": 100,
        "origin": "Metamorphic — shale compressed and heated, developing foliation",
        "mineral_composition": ["Quartz (40%)", "Muscovite mica (30%)", "Chlorite (20%)", "Clay minerals (10%)"],
        "crystal_system": "Monoclinic (Muscovite) / Hexagonal (Quartz)",
        "uses": "Roofing, flooring, chalkboards, billiard tables",
        "dive_layers": [
            {"depth": 0, "label": "Split Slab", "desc": "Dark grey laminar stone split along cleavage planes"},
            {"depth": 1, "label": "Foliation Layers", "desc": "Paper-thin mica sheets aligned perpendicular to compression"},
            {"depth": 2, "label": "Mineral Alignment", "desc": "Muscovite mica flakes oriented by tectonic pressure"},
            {"depth": 3, "label": "Silicate Sheets", "desc": "2D Si2O5 sheets with Al3+ substitution in mica layers"},
            {"depth": 4, "label": "Interlayer Bonds", "desc": "K+ ions bridging mica sheets; weak van der Waals cleavage"},
            {"depth": 5, "label": "Metamorphic Memory", "desc": "Crystal preferred orientation records 300 million years of pressure history"},
        ],
    },
    {
        "id": "sandstone",
        "name": "Sandstone",
        "color": "#C2956B",
        "density_kg_m3": 2200,
        "mohs_hardness": 6.0,
        "compressive_mpa": 40,
        "origin": "Sedimentary — cemented sand grains from ancient rivers and deserts",
        "mineral_composition": ["Quartz (70%)", "Feldspar (15%)", "Iron oxides (10%)", "Clay cement (5%)"],
        "crystal_system": "Hexagonal (Quartz grains)",
        "uses": "Building facades, paving, grindstones, oil reservoirs",
        "dive_layers": [
            {"depth": 0, "label": "Dressed Block", "desc": "Warm ochre stone with visible sand-grain texture"},
            {"depth": 1, "label": "Sand Grains", "desc": "Rounded quartz grains 0.1-2mm cemented by silica or calcite"},
            {"depth": 2, "label": "Porosity Map", "desc": "15-25% void space between grains — groundwater pathways"},
            {"depth": 3, "label": "Quartz Overgrowths", "desc": "Secondary SiO2 precipitated in optical continuity with parent grain"},
            {"depth": 4, "label": "Silica Tetrahedra", "desc": "SiO4 framework with each O shared between two Si atoms"},
            {"depth": 5, "label": "Provenance Signal", "desc": "Zircon trace elements record the source mountain range"},
        ],
    },
    {
        "id": "basalt",
        "name": "Basalt",
        "color": "#1E293B",
        "density_kg_m3": 3000,
        "mohs_hardness": 6.0,
        "compressive_mpa": 300,
        "origin": "Igneous — rapidly cooled lava from volcanic eruptions",
        "mineral_composition": ["Plagioclase (50%)", "Pyroxene (30%)", "Olivine (15%)", "Magnetite (5%)"],
        "crystal_system": "Triclinic (Plagioclase) / Monoclinic (Pyroxene)",
        "uses": "Road base, railway ballast, Giant's Causeway columns, countertops",
        "dive_layers": [
            {"depth": 0, "label": "Columnar Block", "desc": "Dense dark stone — may show hexagonal columnar jointing"},
            {"depth": 1, "label": "Microcrystalline", "desc": "Tiny plagioclase laths in pyroxene groundmass — too fine for naked eye"},
            {"depth": 2, "label": "Mineral Assemblage", "desc": "Green olivine phenocrysts in plagioclase-pyroxene matrix"},
            {"depth": 3, "label": "Pyroxene Chains", "desc": "Single-chain inosilicate SiO3 units with Mg/Fe bonding"},
            {"depth": 4, "label": "Magma Chemistry", "desc": "45-52% SiO2 (mafic); Fe/Mg-rich minerals crystallize first (Bowen's series)"},
            {"depth": 5, "label": "Mantle Origin", "desc": "Partial melting at 70-100km depth; Nd/Sr isotopes trace mantle reservoir"},
        ],
    },
]

MASONRY_TOOLS = [
    {
        "id": "trowel",
        "name": "Trowel",
        "action_verb": "Spread",
        "description": "Flat blade for spreading and shaping mortar between stone courses",
        "technique": "Hold at 45 degrees, load mortar on back edge, sweep forward in one smooth motion. The bed joint should be 10mm thick.",
        "color": "#94A3B8",
        "xp_per_action": 12,
        "icon_symbol": "T",
    },
    {
        "id": "mash_hammer",
        "name": "Mash Hammer",
        "action_verb": "Strike",
        "description": "Heavy double-faced hammer for driving chisels and rough-splitting stone",
        "technique": "Grip near the end for maximum force. Strike the chisel head squarely — a glancing blow splits the stone unpredictably.",
        "color": "#EF4444",
        "xp_per_action": 12,
        "icon_symbol": "H",
    },
    {
        "id": "chisel",
        "name": "Point Chisel",
        "action_verb": "Carve",
        "description": "Pointed steel chisel for rough shaping and removing bulk material",
        "technique": "Hold at 60 degrees to the face. Strike rhythmically — listen for the pitch change that signals the stone is about to split.",
        "color": "#F59E0B",
        "xp_per_action": 12,
        "icon_symbol": "C",
    },
    {
        "id": "square",
        "name": "Try Square",
        "action_verb": "Measure",
        "description": "L-shaped precision tool for checking 90-degree angles in dressed stone",
        "technique": "Press the stock firmly against the reference face. Slide the blade along the test face — light gaps reveal deviation.",
        "color": "#3B82F6",
        "xp_per_action": 12,
        "icon_symbol": "S",
    },
    {
        "id": "level",
        "name": "Spirit Level",
        "action_verb": "Level",
        "description": "Bubble vial instrument for ensuring horizontal and vertical trueness",
        "technique": "Place on the course. The bubble must center between the lines. Adjust by tapping the stone with the trowel handle.",
        "color": "#22C55E",
        "xp_per_action": 12,
        "icon_symbol": "L",
    },
    {
        "id": "plumb_bob",
        "name": "Plumb Bob",
        "action_verb": "Plumb",
        "description": "Weighted point on a string for checking vertical alignment",
        "technique": "Hang from the top course. The point should graze the bottom course. Any gap means the wall leans.",
        "color": "#A78BFA",
        "xp_per_action": 12,
        "icon_symbol": "P",
    },
    {
        "id": "jointer",
        "name": "Jointer",
        "action_verb": "Joint",
        "description": "Curved steel tool for finishing and compressing mortar joints",
        "technique": "Draw along the wet mortar joint with firm pressure. This compresses the mortar, sealing it against water.",
        "color": "#EC4899",
        "xp_per_action": 12,
        "icon_symbol": "J",
    },
    {
        "id": "bolster",
        "name": "Bolster Chisel",
        "action_verb": "Split",
        "description": "Wide-bladed chisel for cutting bricks and stone along a scored line",
        "technique": "Score the cut line first, then place the bolster blade in the groove. One firm hammer strike splits clean.",
        "color": "#F97316",
        "xp_per_action": 12,
        "icon_symbol": "B",
    },
    {
        "id": "pitching_tool",
        "name": "Pitching Tool",
        "action_verb": "Pitch",
        "description": "Wide chisel for removing large projections and creating dressed faces",
        "technique": "Place at the stone edge, angle slightly inward. Strike to shear off projections. Work from the edge toward center.",
        "color": "#2DD4BF",
        "xp_per_action": 12,
        "icon_symbol": "X",
    },
]


@router.get("/workshop/masonry/stones")
async def get_masonry_stones():
    """Return all masonry stone materials with dive layer data. Open to all — the Workshop breathes for everyone."""
    return {"stones": MASONRY_STONES}


@router.get("/workshop/masonry/tools")
async def get_masonry_tools():
    """Return the 9 primary masonry tools for the sprocket ring. Open to all."""
    return {"tools": MASONRY_TOOLS}


@router.get("/workshop/masonry/stone/{stone_id}")
async def get_stone_detail(stone_id: str):
    """Return detailed stone data including dive layers for Recursive Dive. Open to all."""
    stone = next((s for s in MASONRY_STONES if s["id"] == stone_id), None)
    if not stone:
        return {"error": "Stone not found"}
    return {"stone": stone}


@router.post("/workshop/masonry/tool-action")
async def masonry_tool_action(data: dict = Body(...)):
    """Record a tool action against a stone and return context for tutorial generation. Open to all."""
    tool_id = data.get("tool_id", "")
    stone_id = data.get("stone_id", "")

    tool = next((t for t in MASONRY_TOOLS if t["id"] == tool_id), None)
    stone = next((s for s in MASONRY_STONES if s["id"] == stone_id), None)
    if not tool or not stone:
        return {"error": "Invalid tool or stone"}

    return {
        "action": f"{tool['action_verb']} {stone['name']}",
        "tool": tool["name"],
        "stone": stone["name"],
        "xp_awarded": tool["xp_per_action"],
        "tutorial_context": (
            f"The user selected the {tool['name']} tool on a block of {stone['name']}. "
            f"Technique: {tool['technique']} "
            f"Stone properties: {stone['origin']}. Hardness: {stone['mohs_hardness']} Mohs. "
            f"Compressive strength: {stone['compressive_mpa']} MPa. "
            f"Generate a practical masonry tutorial step for using the {tool['name']} on {stone['name']}. "
            f"Include safety notes and a professional tip."
        ),
    }
