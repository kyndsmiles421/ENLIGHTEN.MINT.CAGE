"""
V60.0-V62.0 — Sovereign Interaction Cells: Universal Workshop Engine
All modules use proven Circular Workshop DNA.
All endpoints open to guests (Universal Access).
"""
from fastapi import APIRouter, Body
from routes.workshop import MASONRY_STONES, MASONRY_TOOLS, CARPENTRY_WOODS, CARPENTRY_TOOLS

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# V1.2.3 — Compliance Display Helpers
# Keep canonical domain keys in DB/code (no migration), translate to
# Play-Store-safe labels at the API serialization boundary.
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

_DOMAIN_DISPLAY = {
    "Healing Arts": "Resonant Arts",
}
_TEXT_REPLACEMENTS = [
    ("Healing Arts Cell", "Resonant Arts Cell"),
    ("Healing Pillar", "Resonance Pillar"),
    ("Healing Arts", "Resonant Arts"),
    ("heal the land", "regenerate the land"),
]

def _display_domain(d: str) -> str:
    """Return the user-facing display label for a canonical domain key."""
    return _DOMAIN_DISPLAY.get(d, d)

def _display_text(s: str) -> str:
    """Apply user-facing text replacements without changing canonical keys."""
    if not s:
        return s
    out = s
    for old, new in _TEXT_REPLACEMENTS:
        out = out.replace(old, new)
    return out

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ELECTRICAL WORKSHOP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ELECTRICAL_MATERIALS = [
    {
        "id": "copper_wire", "name": "Copper Wire", "color": "#B87333",
        "gauge": "12 AWG", "ampacity": 20, "resistance_ohm_km": 5.2,
        "origin": "Conductor — drawn copper with 99.9% purity, the backbone of all electrical systems",
        "composition": ["Copper (99.9%)", "Oxygen-free annealed", "Tin coating (optional)"],
        "crystal_structure": "Face-centered cubic (FCC)",
        "uses": "Branch circuits, outlets, switches, lighting, motor leads",
        "dive_layers": [
            {"depth": 0, "label": "Insulated Cable", "desc": "THHN/THWN thermoplastic insulation over solid or stranded copper conductor"},
            {"depth": 1, "label": "Copper Strands", "desc": "19-strand bunch for flexibility; each strand 0.45mm diameter drawn through diamond dies"},
            {"depth": 2, "label": "Crystal Grain", "desc": "Annealed copper grains 50-100 microns across; grain boundaries scatter electrons slightly"},
            {"depth": 3, "label": "Electron Band", "desc": "4s¹ valence electron in copper's partially filled band — the reason copper conducts so well"},
            {"depth": 4, "label": "Fermi Surface", "desc": "Nearly spherical Fermi surface with neck contacts at L-points — Brillouin zone topology"},
            {"depth": 5, "label": "Quantum Tunneling", "desc": "Electron wavefunction tunneling through thin oxide barriers at contact points"},
        ],
    },
    {
        "id": "romex", "name": "Romex NM-B", "color": "#F5F5DC",
        "gauge": "14/2 AWG", "ampacity": 15, "resistance_ohm_km": 8.3,
        "origin": "Non-metallic sheathed cable — the standard residential wiring in North America",
        "composition": ["Hot (black)", "Neutral (white)", "Ground (bare)", "Paper separator", "PVC jacket"],
        "crystal_structure": "Multi-conductor assembly",
        "uses": "Interior residential wiring, outlets, switches, lighting circuits",
        "dive_layers": [
            {"depth": 0, "label": "Sheathed Cable", "desc": "Flat grey PVC jacket stamped with gauge, conductor count, and voltage rating"},
            {"depth": 1, "label": "Conductor Bundle", "desc": "Hot, neutral, and ground conductors separated by paper wrap inside the sheath"},
            {"depth": 2, "label": "Insulation Chemistry", "desc": "Cross-linked polyethylene (XLPE) rated to 90°C; chlorine-free for reduced toxicity"},
            {"depth": 3, "label": "Dielectric Strength", "desc": "Insulation withstands 600V — electric field drops across 0.76mm wall thickness"},
            {"depth": 4, "label": "Polymer Chains", "desc": "Ethylene monomers cross-linked by peroxide catalysis creating a 3D thermoset network"},
            {"depth": 5, "label": "Electron Confinement", "desc": "Band gap of 8.8 eV in polyethylene vs 0 eV in copper — why insulation insulates"},
        ],
    },
    {
        "id": "conduit", "name": "EMT Conduit", "color": "#C0C0C0",
        "gauge": "3/4 inch", "ampacity": 0, "resistance_ohm_km": 0,
        "origin": "Electrical metallic tubing — thin-wall steel raceway for commercial and industrial wiring",
        "composition": ["Galvanized steel (98%)", "Zinc coating (2%)", "Chromate passivation"],
        "crystal_structure": "Body-centered cubic (BCC) steel",
        "uses": "Commercial buildings, exposed wiring, equipment rooms, industrial installations",
        "dive_layers": [
            {"depth": 0, "label": "Installed Run", "desc": "Galvanized steel tube with compression fittings connecting to junction boxes"},
            {"depth": 1, "label": "Zinc Coating", "desc": "Hot-dip galvanized 25-micron zinc layer providing sacrificial cathodic protection"},
            {"depth": 2, "label": "Steel Microstructure", "desc": "Ferrite and pearlite phases in low-carbon steel; the iron-carbon phase diagram in action"},
            {"depth": 3, "label": "Crystal Grains", "desc": "BCC iron lattice with carbon atoms in octahedral interstitial sites (max 0.02% solubility)"},
            {"depth": 4, "label": "Galvanic Protection", "desc": "Zinc (E° = -0.76V) oxidizes preferentially to iron (E° = -0.44V) — electrochemical shield"},
            {"depth": 5, "label": "Electron Transfer", "desc": "Zinc 4s² electrons flow to iron at scratches, maintaining passivation until zinc is consumed"},
        ],
    },
]

ELECTRICAL_TOOLS = [
    {"id": "wire_stripper", "name": "Wire Stripper", "action_verb": "Strip", "description": "Precision jaws that remove insulation without nicking the conductor", "technique": "Match the gauge notch to your wire. Squeeze, rotate 180°, pull. The insulation slides off cleanly. A nicked conductor must be cut back and re-stripped.", "color": "#EF4444", "xp_per_action": 12, "icon_symbol": "W"},
    {"id": "multimeter", "name": "Multimeter", "action_verb": "Measure", "description": "Digital meter for voltage, current, resistance, and continuity testing", "technique": "Set the dial to the expected range. Black lead to COM, red to V/Ω. Test known-live circuits with the meter first to confirm it works. Never measure current in parallel.", "color": "#3B82F6", "xp_per_action": 12, "icon_symbol": "M"},
    {"id": "lineman_pliers", "name": "Lineman Pliers", "action_verb": "Grip", "description": "Heavy-duty pliers for twisting, cutting, and pulling wire", "technique": "Grip both conductors, twist clockwise 5-6 turns for a solid splice. The flat nose provides leverage for pulling wire through conduit.", "color": "#94A3B8", "xp_per_action": 12, "icon_symbol": "P"},
    {"id": "fish_tape", "name": "Fish Tape", "action_verb": "Fish", "description": "Flat steel tape for pulling wire through conduit and wall cavities", "technique": "Feed the tape through the conduit, attach wires with electrical tape in a smooth bullet shape, then pull steadily. Use wire lube for long runs.", "color": "#22C55E", "xp_per_action": 12, "icon_symbol": "F"},
    {"id": "conduit_bender", "name": "Conduit Bender", "action_verb": "Bend", "description": "Manual bender for creating precise angles in EMT conduit", "technique": "Mark the conduit at the bend point. Align the arrow on the bender shoe. Apply foot pressure while pulling the handle to exactly 90°. Check with a level.", "color": "#F59E0B", "xp_per_action": 12, "icon_symbol": "B"},
    {"id": "voltage_tester", "name": "Voltage Tester", "action_verb": "Test", "description": "Non-contact detector that senses AC voltage through insulation", "technique": "Always verify the tester works on a known-live circuit first. Sweep near the conductor — the tip glows red and beeps if voltage is present. Test all conductors.", "color": "#A78BFA", "xp_per_action": 12, "icon_symbol": "V"},
    {"id": "crimper", "name": "Crimper", "action_verb": "Crimp", "description": "Ratcheting tool for securing terminals and lugs onto wire ends", "technique": "Insert the stripped wire fully into the terminal barrel. Place in the correct die size. Squeeze until the ratchet releases. Tug-test the connection.", "color": "#EC4899", "xp_per_action": 12, "icon_symbol": "C"},
    {"id": "cable_cutter", "name": "Cable Cutter", "action_verb": "Cut", "description": "Hardened steel jaws for clean cuts through copper and aluminum cable", "technique": "Position the cable deep in the jaws for maximum leverage. Cut perpendicular to the cable axis. Deburr the cut end before termination.", "color": "#F97316", "xp_per_action": 12, "icon_symbol": "X"},
    {"id": "torque_driver", "name": "Torque Driver", "action_verb": "Torque", "description": "Calibrated screwdriver ensuring proper terminal tightness per NEC", "technique": "Set to the manufacturer's specified inch-pounds. Drive until the clutch clicks. Over-torquing damages terminals; under-torquing causes arcing.", "color": "#2DD4BF", "xp_per_action": 12, "icon_symbol": "T"},
]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PLUMBING WORKSHOP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLUMBING_MATERIALS = [
    {
        "id": "copper_pipe", "name": "Copper Type L", "color": "#B87333",
        "diameter": "3/4 inch", "pressure_psi": 330, "flow_gpm": 6.5,
        "origin": "Drawn seamless copper tube — the gold standard for potable water supply",
        "composition": ["Copper (99.9%)", "Phosphorus deoxidized", "ASTM B88 spec"],
        "crystal_structure": "FCC copper with cold-drawn texture",
        "uses": "Hot/cold water supply, refrigerant lines, medical gas piping",
        "dive_layers": [
            {"depth": 0, "label": "Fitted Joint", "desc": "Sweated copper joint — flux, solder, and capillary action create a watertight seal"},
            {"depth": 1, "label": "Solder Seam", "desc": "Lead-free Sn/Ag/Cu solder wicked into 0.004-inch gap by capillary action at 450°F"},
            {"depth": 2, "label": "Copper Microstructure", "desc": "Cold-drawn grains elongated in the draw direction; annealing recrystallizes to equiaxed"},
            {"depth": 3, "label": "CuO Patina", "desc": "Green patina (copper carbonate) forms over decades — nature's protective corrosion layer"},
            {"depth": 4, "label": "Metallic Bonding", "desc": "Delocalized 4s electron sea shared across FCC lattice — excellent thermal and electrical conductor"},
            {"depth": 5, "label": "Free Electron Gas", "desc": "Drude model: electrons move freely at Fermi velocity (1.57×10⁶ m/s) between lattice collisions"},
        ],
    },
    {
        "id": "pvc_pipe", "name": "PVC Schedule 40", "color": "#E8E8E8",
        "diameter": "2 inch", "pressure_psi": 166, "flow_gpm": 24,
        "origin": "Polyvinyl chloride — the most widely used plastic pipe for drain, waste, and vent",
        "composition": ["PVC resin (87%)", "Calcium carbonate filler", "Tin stabilizer", "Titanium dioxide pigment"],
        "crystal_structure": "Amorphous thermoplastic",
        "uses": "Drain-waste-vent (DWV), cold water pressure, irrigation, conduit",
        "dive_layers": [
            {"depth": 0, "label": "Cemented Joint", "desc": "Solvent-welded PVC — primer softens the surface, cement fuses the molecular chains together"},
            {"depth": 1, "label": "Pipe Wall", "desc": "Schedule 40 wall thickness 0.154 inches; extruded through an annular die at 350°F"},
            {"depth": 2, "label": "Polymer Matrix", "desc": "Amorphous PVC chains with calcium carbonate filler particles dispersed for rigidity"},
            {"depth": 3, "label": "Vinyl Chloride Chains", "desc": "Head-to-tail polymerization of CH₂=CHCl; the chlorine atoms prevent crystallization"},
            {"depth": 4, "label": "Solvent Welding", "desc": "THF/MEK solvent dissolves polymer chains; evaporation re-entangles them across the joint"},
            {"depth": 5, "label": "Molecular Entanglement", "desc": "Reptation model: polymer chains 'snake' through the melt, creating physical crosslinks"},
        ],
    },
    {
        "id": "pex_tube", "name": "PEX-A Tubing", "color": "#E74C3C",
        "diameter": "1/2 inch", "pressure_psi": 160, "flow_gpm": 3.5,
        "origin": "Cross-linked polyethylene — flexible tubing revolutionizing residential plumbing",
        "composition": ["HDPE resin", "Peroxide cross-linked (Engel method)", "EVOH oxygen barrier"],
        "crystal_structure": "Semi-crystalline cross-linked PE",
        "uses": "Residential water supply, radiant floor heating, snow melt systems",
        "dive_layers": [
            {"depth": 0, "label": "Expansion Joint", "desc": "Cold-expansion fitting — tube expands, slides over barb, shrinks back for a mechanical seal"},
            {"depth": 1, "label": "Cross-Linked Wall", "desc": "PEX-A (Engel method): 85% cross-link density via peroxide during extrusion; most flexible type"},
            {"depth": 2, "label": "Crystalline Lamellae", "desc": "Folded-chain polyethylene crystallites connected by tie molecules in the amorphous phase"},
            {"depth": 3, "label": "Cross-Link Network", "desc": "C-C covalent bridges between chains created by free radical reaction at 400°F"},
            {"depth": 4, "label": "Shape Memory", "desc": "Cross-links store the original shape; heating above Tg allows expansion, cooling locks new form"},
            {"depth": 5, "label": "Thermal Vibrations", "desc": "Phonon transport through PE crystallites: thermal conductivity 0.4 W/mK (insulating)"},
        ],
    },
]

PLUMBING_TOOLS = [
    {"id": "pipe_wrench", "name": "Pipe Wrench", "action_verb": "Wrench", "description": "Adjustable serrated-jaw wrench for gripping round pipe and fittings", "technique": "Always pull toward the jaw opening. The jaw bites tighter as you pull. Use two wrenches for unions — one holds, one turns.", "color": "#EF4444", "xp_per_action": 12, "icon_symbol": "W"},
    {"id": "tube_cutter", "name": "Tube Cutter", "action_verb": "Cut", "description": "Rotary cutter for clean, square cuts on copper and PEX tubing", "technique": "Score lightly on the first rotation, then tighten 1/4 turn per revolution. Over-tightening collapses thin-wall copper.", "color": "#3B82F6", "xp_per_action": 12, "icon_symbol": "C"},
    {"id": "torch", "name": "Soldering Torch", "action_verb": "Solder", "description": "MAPP gas torch for sweating copper joints with lead-free solder", "technique": "Heat the fitting, not the tube. Touch solder to the joint — it should wick in by capillary action. The flame never touches the solder.", "color": "#F59E0B", "xp_per_action": 12, "icon_symbol": "T"},
    {"id": "teflon", "name": "Teflon Tape", "action_verb": "Seal", "description": "PTFE thread sealant tape for threaded pipe connections", "technique": "Wrap 3-5 times clockwise (when facing the end). The tape must tighten as you thread in, not unravel.", "color": "#E8E8E8", "xp_per_action": 12, "icon_symbol": "S"},
    {"id": "basin_wrench", "name": "Basin Wrench", "action_verb": "Reach", "description": "Long-reach pivoting wrench for faucet nuts in tight spaces", "technique": "The spring-loaded jaw pivots to grip in either direction. Extend the shaft, lock the jaw onto the nut, and turn from below the sink.", "color": "#A78BFA", "xp_per_action": 12, "icon_symbol": "B"},
    {"id": "plunger", "name": "Flange Plunger", "action_verb": "Plunge", "description": "Flanged rubber cup for clearing toilet and drain clogs", "technique": "Submerge the cup, create a seal, and plunge with firm vertical strokes. The first plunge should be gentle to expel air; subsequent ones build hydraulic pressure.", "color": "#22C55E", "xp_per_action": 12, "icon_symbol": "P"},
    {"id": "snake", "name": "Drain Snake", "action_verb": "Snake", "description": "Flexible steel cable for clearing deep drain blockages", "technique": "Feed the cable into the drain while cranking the handle. When you hit resistance, increase cranking — the auger head bores through the clog.", "color": "#94A3B8", "xp_per_action": 12, "icon_symbol": "N"},
    {"id": "flux_brush", "name": "Flux Brush", "action_verb": "Flux", "description": "Acid-core brush for applying flux paste to copper before soldering", "technique": "Clean the tube and fitting with emery cloth first. Apply flux to both mating surfaces. Flux draws solder into the joint by reducing surface tension.", "color": "#EC4899", "xp_per_action": 12, "icon_symbol": "F"},
    {"id": "deburr", "name": "Deburring Tool", "action_verb": "Deburr", "description": "Reaming blade for removing internal burrs from cut pipe", "technique": "Insert the blade into the cut end, rotate 3-4 times with light pressure. Burrs restrict flow and create turbulence that erodes the pipe wall.", "color": "#2DD4BF", "xp_per_action": 12, "icon_symbol": "D"},
]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LANDSCAPING WORKSHOP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LANDSCAPING_MATERIALS = [
    {
        "id": "topsoil", "name": "Loam Topsoil", "color": "#5B3A29",
        "ph": 6.5, "organic_pct": 5, "density_kg_m3": 1250,
        "origin": "Living medium — weathered rock mixed with decomposed organic matter over millennia",
        "composition": ["Sand (40%)", "Silt (40%)", "Clay (20%)", "Organic matter (5%)"],
        "structure": "Granular aggregates bound by fungal hyphae and humic acids",
        "uses": "Garden beds, lawns, raised planters, topdressing, grading",
        "dive_layers": [
            {"depth": 0, "label": "Topsoil Layer", "desc": "Dark, crumbly A-horizon — 6 inches of life supporting 95% of all terrestrial plant growth"},
            {"depth": 1, "label": "Root Zone", "desc": "Billions of root hairs per cubic meter extracting water and nutrients through osmotic pressure"},
            {"depth": 2, "label": "Mycorrhizal Network", "desc": "Fungal hyphae connecting plant roots in a 'wood wide web' — sharing nutrients and chemical signals"},
            {"depth": 3, "label": "Humic Acid", "desc": "Complex aromatic polymers from decomposition — the dark color that defines fertile soil"},
            {"depth": 4, "label": "Clay Minerals", "desc": "Kaolinite/montmorillonite platelets with enormous surface area holding cation exchange sites"},
            {"depth": 5, "label": "Silicate Lattice", "desc": "SiO₄ tetrahedra and AlO₆ octahedra sheets — the mineral skeleton that weathers into soil"},
        ],
    },
    {
        "id": "gravel", "name": "Crushed Gravel", "color": "#94A3B8",
        "ph": 7.5, "organic_pct": 0, "density_kg_m3": 1600,
        "origin": "Angular crushed stone — mechanically broken rock graded for drainage and stability",
        "composition": ["Limestone/granite aggregate", "Angular fragments 3/8-3/4 inch", "Fines (10%)"],
        "structure": "Interlocking angular particles with 30-40% void space",
        "uses": "Drainage beds, walkway base, French drains, dry creek beds, mulch alternative",
        "dive_layers": [
            {"depth": 0, "label": "Gravel Bed", "desc": "Compacted angular stone layer providing drainage and structural base for hardscape"},
            {"depth": 1, "label": "Particle Interlock", "desc": "Angular faces wedge against each other under compaction — why crushed stone is stronger than round"},
            {"depth": 2, "label": "Void Network", "desc": "Connected pore space allowing 15 gallons/minute/sq-ft drainage rate — the hidden plumbing of landscape"},
            {"depth": 3, "label": "Rock Mineralogy", "desc": "Calcite or quartz grains depending on source quarry; pH influence on surrounding soil"},
            {"depth": 4, "label": "Weathering Front", "desc": "Chemical dissolution at grain surfaces releasing Ca²⁺, Mg²⁺ into groundwater over decades"},
            {"depth": 5, "label": "Geologic Memory", "desc": "Isotope ratios in the stone record the temperature and chemistry of the ocean where it formed"},
        ],
    },
    {
        "id": "compost", "name": "Finished Compost", "color": "#6B4226",
        "ph": 7.0, "organic_pct": 50, "density_kg_m3": 600,
        "origin": "Decomposed organic matter — nature's recycling program, the foundation of regenerative soil",
        "composition": ["Humus (60%)", "Beneficial microbes", "Trace minerals", "Moisture (40%)"],
        "structure": "Amorphous humic matrix teeming with billions of organisms per gram",
        "uses": "Soil amendment, mulch, seed starting, compost tea, carbon sequestration",
        "dive_layers": [
            {"depth": 0, "label": "Finished Humus", "desc": "Dark, earthy-smelling material — the end product of thermophilic decomposition at 140°F"},
            {"depth": 1, "label": "Microbial City", "desc": "1 billion bacteria, 1 million fungi, and 10,000 protozoa per gram — a living metropolis"},
            {"depth": 2, "label": "Decomposer Cascade", "desc": "Bacteria break cellulose, fungi break lignin, protozoa graze bacteria — the food web in a handful"},
            {"depth": 3, "label": "Humic Molecules", "desc": "Random polymers of phenols, quinones, and amino acids — no two molecules are identical"},
            {"depth": 4, "label": "Cation Exchange", "desc": "Negatively charged humic sites hold K⁺, Ca²⁺, Mg²⁺ — a nutrient battery plants can withdraw from"},
            {"depth": 5, "label": "Carbon Sequestration", "desc": "Stable humin carbon with 1,000+ year residence time — composting as climate solution"},
        ],
    },
]

LANDSCAPING_TOOLS = [
    {"id": "spade", "name": "Garden Spade", "action_verb": "Dig", "description": "Flat-bladed tool for digging, edging, and transplanting", "technique": "Drive the blade vertically with your foot. Lever the handle back to pop the soil. Keep the blade sharp — a sharp spade cuts roots cleanly.", "color": "#92400E", "xp_per_action": 12, "icon_symbol": "S"},
    {"id": "rake", "name": "Bow Rake", "action_verb": "Rake", "description": "Heavy steel-tined rake for grading soil and spreading material", "technique": "Pull with the tines for leveling; push with the flat back for final grading. The bow flex absorbs shock on rocky ground.", "color": "#94A3B8", "xp_per_action": 12, "icon_symbol": "R"},
    {"id": "pruners", "name": "Bypass Pruners", "action_verb": "Prune", "description": "Scissor-action hand pruners for clean cuts on live branches up to 3/4 inch", "technique": "Position the cutting blade on the side you're keeping. Cut at a 45° angle just above an outward-facing bud. Clean blades between plants to prevent disease spread.", "color": "#22C55E", "xp_per_action": 12, "icon_symbol": "P"},
    {"id": "wheelbarrow", "name": "Wheelbarrow", "action_verb": "Haul", "description": "Single-wheel barrow for moving soil, mulch, gravel, and debris", "technique": "Load the weight over the wheel, not the handles. Lean forward and push with your legs. For slopes, always face uphill with the load.", "color": "#F59E0B", "xp_per_action": 12, "icon_symbol": "W"},
    {"id": "tamper", "name": "Hand Tamper", "action_verb": "Compact", "description": "Flat steel plate on a handle for compacting gravel and soil base", "technique": "Lift and drop with steady rhythm. Overlap each strike by half. Compact in 2-inch lifts — thicker layers won't compact evenly.", "color": "#EF4444", "xp_per_action": 12, "icon_symbol": "T"},
    {"id": "edger", "name": "Half-Moon Edger", "action_verb": "Edge", "description": "Curved blade for cutting crisp bed edges in turf", "technique": "Place the blade at the bed line, step down firmly, and rock the handle to cut through roots. A clean edge is the #1 sign of professional work.", "color": "#3B82F6", "xp_per_action": 12, "icon_symbol": "E"},
    {"id": "hoe", "name": "Stirrup Hoe", "action_verb": "Cultivate", "description": "Oscillating hoe that cuts weeds on both push and pull strokes", "technique": "Skim 1 inch below the surface in a back-and-forth motion. The blade severs weed roots without turning soil — preserving soil structure.", "color": "#A78BFA", "xp_per_action": 12, "icon_symbol": "H"},
    {"id": "dibber", "name": "Dibber", "action_verb": "Plant", "description": "Pointed tool for making planting holes for seeds and bulbs", "technique": "Push to the marked depth line, twist slightly to widen the hole, drop the seed/bulb, and firm the soil. Depth marks ensure consistent planting.", "color": "#EC4899", "xp_per_action": 12, "icon_symbol": "D"},
    {"id": "level_ls", "name": "Line Level", "action_verb": "Grade", "description": "String-mounted bubble level for establishing grade over distance", "technique": "Stretch the string between stakes. Hang the level at center. Adjust stake height until bubble centers. Grade at 1/8 inch per foot away from structures.", "color": "#2DD4BF", "xp_per_action": 12, "icon_symbol": "L"},
]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# NURSING WORKSHOP (Healing Arts)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NURSING_MATERIALS = [
    {
        "id": "vital_signs", "name": "Patient Vitals", "color": "#EF4444",
        "category": "Assessment", "complexity": "Foundation",
        "origin": "Clinical assessment — the five vital signs that reveal the body's systemic state",
        "components": ["Heart Rate", "Blood Pressure", "Temperature", "Respiratory Rate", "Oxygen Saturation"],
        "system": "Cardiovascular-Respiratory axis",
        "uses": "Triage, baseline assessment, monitoring, early warning scores",
        "dive_layers": [
            {"depth": 0, "label": "Surface Symptom", "desc": "Patient presents with observable signs: skin color, breathing pattern, level of consciousness"},
            {"depth": 1, "label": "Physiological System", "desc": "Five vital signs map to cardiovascular, respiratory, thermoregulatory, and neurological systems"},
            {"depth": 2, "label": "Cellular Stress", "desc": "Tachycardia signals cells demanding more oxygen; fever signals immune activation releasing pyrogens"},
            {"depth": 3, "label": "Mitochondrial Flux", "desc": "ATP production rate determines cellular energy budget — the root of systemic compensation"},
            {"depth": 4, "label": "Molecular Signaling", "desc": "Catecholamines, cytokines, prostaglandins — the chemical messengers behind every vital sign change"},
            {"depth": 5, "label": "Atomic Balance", "desc": "Na⁺/K⁺ pump maintaining -70mV resting potential across every cell membrane — life at the ion level"},
        ],
    },
    {
        "id": "wound_care", "name": "Wound Assessment", "color": "#F59E0B",
        "category": "Treatment", "complexity": "Intermediate",
        "origin": "Tissue repair science — understanding the four phases of wound healing",
        "components": ["Hemostasis phase", "Inflammatory phase", "Proliferative phase", "Remodeling phase"],
        "system": "Integumentary-Immune axis",
        "uses": "Wound classification, dressing selection, healing trajectory, infection prevention",
        "dive_layers": [
            {"depth": 0, "label": "Wound Surface", "desc": "Classify: color (red/yellow/black), depth (partial/full thickness), drainage type and amount"},
            {"depth": 1, "label": "Healing Phases", "desc": "Hemostasis (minutes) → Inflammation (days) → Proliferation (weeks) → Remodeling (months to years)"},
            {"depth": 2, "label": "Cellular Response", "desc": "Neutrophils arrive first, then macrophages orchestrate fibroblasts to lay collagen scaffold"},
            {"depth": 3, "label": "Collagen Architecture", "desc": "Type III collagen → Type I replacement; tensile strength reaches 80% of original over 2 years"},
            {"depth": 4, "label": "Growth Factors", "desc": "PDGF, TGF-β, VEGF — molecular signals directing cell migration, division, and angiogenesis"},
            {"depth": 5, "label": "Oxygen Gradient", "desc": "Wound center is hypoxic (pO₂ < 10mmHg); the oxygen gradient drives angiogenesis and collagen cross-linking"},
        ],
    },
    {
        "id": "medication", "name": "Medication Admin", "color": "#3B82F6",
        "category": "Pharmacology", "complexity": "Advanced",
        "origin": "The '10 Rights' of medication safety — the foundation of pharmacological nursing",
        "components": ["Right patient", "Right drug", "Right dose", "Right route", "Right time"],
        "system": "Pharmacokinetic-Pharmacodynamic axis",
        "uses": "Drug administration, dosage calculation, adverse reaction monitoring, patient education",
        "dive_layers": [
            {"depth": 0, "label": "Medication Order", "desc": "Verify the 10 Rights before every administration — the nurse is the last safety checkpoint"},
            {"depth": 1, "label": "Absorption Route", "desc": "Oral → GI tract → portal vein → first-pass liver metabolism; IV bypasses all barriers"},
            {"depth": 2, "label": "Distribution", "desc": "Protein binding, blood-brain barrier, placental barrier — not all tissues see the same drug level"},
            {"depth": 3, "label": "Receptor Binding", "desc": "Lock-and-key: agonists activate, antagonists block, partial agonists do both — dose-response curves"},
            {"depth": 4, "label": "Hepatic Metabolism", "desc": "CYP450 enzymes oxidize drugs in the liver; genetic polymorphisms create fast/slow metabolizers"},
            {"depth": 5, "label": "Molecular Pharmacology", "desc": "Drug-receptor affinity (Kd) and efficacy (Emax) — the quantum chemistry of healing"},
        ],
    },
]

NURSING_TOOLS = [
    {"id": "stethoscope", "name": "Stethoscope", "action_verb": "Auscultate", "description": "Acoustic device for listening to heart, lung, and bowel sounds", "technique": "Use the diaphragm for high-pitched sounds (S1/S2, breath sounds) and the bell for low-pitched (S3/S4, murmurs). Warm the chest piece first.", "color": "#EF4444", "xp_per_action": 12, "icon_symbol": "A"},
    {"id": "bp_cuff", "name": "Sphygmomanometer", "action_verb": "Measure", "description": "Blood pressure cuff with aneroid gauge for manual BP measurement", "technique": "Palpate the brachial artery. Inflate to 30mmHg above estimated systolic. Deflate at 2-3mmHg/second. First Korotkoff sound = systolic; last = diastolic.", "color": "#3B82F6", "xp_per_action": 12, "icon_symbol": "B"},
    {"id": "thermometer", "name": "Thermometer", "action_verb": "Assess", "description": "Digital or tympanic thermometer for core temperature measurement", "technique": "Oral: under the tongue, lips closed, wait for beep. Tympanic: pull ear up and back (adult), aim at tympanic membrane. Know the normal range: 97.8-99.1°F.", "color": "#F59E0B", "xp_per_action": 12, "icon_symbol": "T"},
    {"id": "pulse_ox", "name": "Pulse Oximeter", "action_verb": "Monitor", "description": "Clip-on sensor measuring arterial oxygen saturation via light absorption", "technique": "Place on a warm, well-perfused finger. Remove nail polish (it absorbs light). Normal SpO₂: 95-100%. Below 90% = hypoxemia requiring immediate intervention.", "color": "#22C55E", "xp_per_action": 12, "icon_symbol": "O"},
    {"id": "dressing_kit", "name": "Dressing Kit", "action_verb": "Dress", "description": "Sterile wound care supplies for cleaning and covering wounds", "technique": "Don sterile gloves. Clean from center outward using non-cytotoxic solution. Select dressing based on wound bed: dry wounds need moisture, wet wounds need absorption.", "color": "#A78BFA", "xp_per_action": 12, "icon_symbol": "D"},
    {"id": "syringe", "name": "Syringe", "action_verb": "Inject", "description": "Graduated barrel with plunger for precise medication delivery", "technique": "Select gauge/length by route: IM = 21-23G/1-1.5 inch, SubQ = 25-27G/5/8 inch. Aspirate for IM (check for blood return). Inject at proper rate.", "color": "#EC4899", "xp_per_action": 12, "icon_symbol": "S"},
    {"id": "reflex_hammer", "name": "Reflex Hammer", "action_verb": "Percuss", "description": "Weighted hammer for testing deep tendon reflexes", "technique": "Strike the tendon, not the muscle. Grade 0-4: 0=absent, 2=normal, 4=clonus. Compare bilateral. Abnormal reflexes indicate upper or lower motor neuron pathology.", "color": "#F97316", "xp_per_action": 12, "icon_symbol": "R"},
    {"id": "penlight", "name": "Penlight", "action_verb": "Examine", "description": "Focused light for pupil assessment and oral/throat examination", "technique": "PERRLA: Pupils Equal, Round, Reactive to Light and Accommodation. Shine from the side, observe direct and consensual response. Document size in mm.", "color": "#94A3B8", "xp_per_action": 12, "icon_symbol": "P"},
    {"id": "empathy", "name": "Therapeutic Presence", "action_verb": "Connect", "description": "The most powerful tool in nursing — authentic human connection and active listening", "technique": "Sit at eye level. Use open body language. Reflect feelings before solving problems. Silence is therapeutic. The patient is the expert on their own experience.", "color": "#D4AF37", "xp_per_action": 12, "icon_symbol": "E"},
]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# BIBLE STUDY WORKSHOP (Sacred Knowledge)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BIBLE_MATERIALS = [
    {
        "id": "genesis", "name": "Genesis", "color": "#22C55E",
        "testament": "Old", "chapters": 50, "theme": "Beginnings",
        "origin": "The Book of Origins — creation, fall, flood, and the patriarchal covenants",
        "key_elements": ["Creation narrative", "Abrahamic covenant", "Joseph cycle", "Patriarchal lineage"],
        "literary_form": "Primeval history + ancestral narrative",
        "uses": "Foundation theology, covenant understanding, typology, moral instruction",
        "dive_layers": [
            {"depth": 0, "label": "Written Text", "desc": "English translation — the accessible surface of an ancient Near Eastern document"},
            {"depth": 1, "label": "Original Language", "desc": "Biblical Hebrew — 'Bereshit bara Elohim' — each word carries layers of meaning lost in translation"},
            {"depth": 2, "label": "Cultural Context", "desc": "Ancient Mesopotamian worldview: creation accounts, flood narratives, covenant treaties parallel Sumerian texts"},
            {"depth": 3, "label": "Theological Intent", "desc": "Monotheistic polemic against polytheism; humanity as image-bearers (tselem) with divine vocation"},
            {"depth": 4, "label": "Prophetic Echo", "desc": "Protoevangelium (3:15), Seed promise (12:3), Shiloh prophecy (49:10) — threads running to fulfillment"},
            {"depth": 5, "label": "Spiritual Frequency", "desc": "The resonance between Creator and creation — 'And God saw that it was good' as vibrational truth"},
        ],
    },
    {
        "id": "psalms", "name": "Psalms", "color": "#A78BFA",
        "testament": "Old", "chapters": 150, "theme": "Worship & Lament",
        "origin": "The hymnal of ancient Israel — 150 poems spanning praise, lament, wisdom, and prophecy",
        "key_elements": ["Praise psalms", "Lament psalms", "Royal psalms", "Wisdom psalms"],
        "literary_form": "Hebrew poetry — parallelism, acrostics, chiasm",
        "uses": "Prayer, worship, emotional processing, meditation, liturgy",
        "dive_layers": [
            {"depth": 0, "label": "Written Text", "desc": "Poetic verse — rhythm and imagery that has anchored worship for three millennia"},
            {"depth": 1, "label": "Original Language", "desc": "Hebrew parallelism: A-line states; B-line echoes, contrasts, or intensifies — the heartbeat of Semitic poetry"},
            {"depth": 2, "label": "Cultural Context", "desc": "Temple worship, Davidic court, exile experience — each psalm has a 'Sitz im Leben' (life setting)"},
            {"depth": 3, "label": "Theological Intent", "desc": "Honest dialogue with God: praise AND lament are equally holy — the full spectrum of human emotion before the Divine"},
            {"depth": 4, "label": "Prophetic Echo", "desc": "Messianic psalms (2, 22, 110) quoted more than any other OT source in the New Testament"},
            {"depth": 5, "label": "Spiritual Frequency", "desc": "Selah (סֶלָה) — the pause that creates space for resonance between the spoken word and the listening soul"},
        ],
    },
    {
        "id": "john", "name": "Gospel of John", "color": "#3B82F6",
        "testament": "New", "chapters": 21, "theme": "Incarnation & Belief",
        "origin": "The 'Spiritual Gospel' — theological meditation on the divine nature of Jesus",
        "key_elements": ["Seven I AM statements", "Seven signs", "Farewell discourse", "Prologue (Logos theology)"],
        "literary_form": "Theological narrative — selective biography with symbolic structure",
        "uses": "Christology, evangelism, spiritual formation, sacramental theology",
        "dive_layers": [
            {"depth": 0, "label": "Written Text", "desc": "Koine Greek narrative — deceptively simple vocabulary carrying the deepest theology in the NT"},
            {"depth": 1, "label": "Original Language", "desc": "'En arche en ho Logos' — Logos bridges Greek philosophy (Heraclitus) and Hebrew Wisdom (Proverbs 8)"},
            {"depth": 2, "label": "Cultural Context", "desc": "Written to a community expelled from synagogue (aposynagogos) — identity crisis shapes the 'us/them' language"},
            {"depth": 3, "label": "Theological Intent", "desc": "Seven 'I AM' statements echo Exodus 3:14 — the evangelist's claim that Jesus IS the God of Sinai"},
            {"depth": 4, "label": "Prophetic Echo", "desc": "Water→Wine, Bread of Life, Living Water — each sign recapitulates and transcends an Exodus miracle"},
            {"depth": 5, "label": "Spiritual Frequency", "desc": "'That you may believe' (20:31) — the entire Gospel vibrates at a single frequency: awakening faith"},
        ],
    },
]

BIBLE_TOOLS = [
    {"id": "lexicon", "name": "Greek/Hebrew Lexicon", "action_verb": "Parse", "description": "Dictionary of original biblical languages with root analysis and semantic range", "technique": "Look up the Strong's number. Read the full semantic range, not just the first definition. A word's meaning is determined by its context, not its etymology alone.", "color": "#3B82F6", "xp_per_action": 12, "icon_symbol": "L"},
    {"id": "concordance", "name": "Concordance", "action_verb": "Trace", "description": "Index of every word's occurrence across all 66 books", "technique": "Search the key word. Note every occurrence. Look for patterns: where does the Bible first use this word? How does its usage evolve? This is the 'thread' method.", "color": "#22C55E", "xp_per_action": 12, "icon_symbol": "C"},
    {"id": "historical_map", "name": "Historical Atlas", "action_verb": "Locate", "description": "Geographic and archaeological maps of the biblical world", "technique": "Place the text on the map. Distance, terrain, and political borders change the meaning. 'Going down to Jericho' is literal — it's a 3,400-foot descent.", "color": "#F59E0B", "xp_per_action": 12, "icon_symbol": "M"},
    {"id": "cross_ref", "name": "Cross-Reference", "action_verb": "Connect", "description": "System linking related passages across Old and New Testaments", "technique": "Follow the marginal references. Ask: Is this a quotation, allusion, or echo? The NT authors assumed you knew the OT context — the reference is the iceberg tip.", "color": "#A78BFA", "xp_per_action": 12, "icon_symbol": "X"},
    {"id": "commentary", "name": "Commentary", "action_verb": "Study", "description": "Scholarly analysis of the text's meaning in its original context", "technique": "Read the text FIRST, form your own questions, THEN consult the commentary. Use it to correct blind spots, not replace personal engagement.", "color": "#94A3B8", "xp_per_action": 12, "icon_symbol": "S"},
    {"id": "etymology", "name": "Word Study", "action_verb": "Unpack", "description": "Deep-dive into a single word's origin, evolution, and theological weight", "technique": "Trace the word from its Proto-Semitic or Proto-Greek root through its biblical usage. 'Hesed' (חֶסֶד) appears 248 times — no single English word captures it.", "color": "#EC4899", "xp_per_action": 12, "icon_symbol": "W"},
    {"id": "archaeology", "name": "Archaeological Context", "action_verb": "Excavate", "description": "Physical evidence from the ancient world illuminating the biblical text", "technique": "Match the text to the material record. The Tel Dan Stele confirmed 'House of David.' Dead Sea Scrolls pushed manuscript evidence back 1,000 years.", "color": "#F97316", "xp_per_action": 12, "icon_symbol": "A"},
    {"id": "application", "name": "Life Application", "action_verb": "Apply", "description": "Bridging the ancient text to present-day wisdom and practice", "technique": "Ask: What did it mean THEN? What principle transcends culture? How does that principle speak NOW? Avoid 'mirror reading' — the text is not about you, but it is FOR you.", "color": "#EF4444", "xp_per_action": 12, "icon_symbol": "P"},
    {"id": "prayer", "name": "Lectio Divina", "action_verb": "Meditate", "description": "Ancient practice of prayerful, contemplative Scripture reading", "technique": "Read slowly (Lectio). Reflect on what resonates (Meditatio). Respond in prayer (Oratio). Rest in silence (Contemplatio). Let the text read you.", "color": "#D4AF37", "xp_per_action": 12, "icon_symbol": "D"},
]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# UNIVERSAL ENDPOINTS — One pattern, all 5 modules
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MODULES = {
    "electrical": {"materials": ELECTRICAL_MATERIALS, "tools": ELECTRICAL_TOOLS, "mat_key": "materials", "mat_id_key": "material_id", "skill": "Electrical_Skill"},
    "plumbing": {"materials": PLUMBING_MATERIALS, "tools": PLUMBING_TOOLS, "mat_key": "materials", "mat_id_key": "material_id", "skill": "Plumbing_Skill"},
    "landscaping": {"materials": LANDSCAPING_MATERIALS, "tools": LANDSCAPING_TOOLS, "mat_key": "materials", "mat_id_key": "material_id", "skill": "Landscaping_Skill"},
    "nursing": {"materials": NURSING_MATERIALS, "tools": NURSING_TOOLS, "mat_key": "scenarios", "mat_id_key": "scenario_id", "skill": "Nursing_Skill"},
    "bible": {"materials": BIBLE_MATERIALS, "tools": BIBLE_TOOLS, "mat_key": "texts", "mat_id_key": "text_id", "skill": "Bible_Study_Skill"},
}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# V61.0 STRIKE 1: PARITY — Expand all workshops to 6 materials
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ELECTRICAL_MATERIALS.extend([
    {"id": "fiber_optic", "name": "Fiber Optic Cable", "color": "#60A5FA",
     "gauge": "Single-mode", "ampacity": 0, "resistance_ohm_km": 0,
     "origin": "Photonic conductor — glass filaments transmitting data as light pulses at 186,000 miles/sec",
     "composition": ["Silica glass core (9μm)", "Cladding (125μm)", "Kevlar strength member", "PVC jacket"],
     "crystal_structure": "Amorphous silica glass",
     "uses": "Internet backbone, data centers, FTTH, medical endoscopy, military comms",
     "dive_layers": [
         {"depth": 0, "label": "Jacketed Cable", "desc": "Yellow single-mode or orange multimode — color codes identify the fiber type instantly"},
         {"depth": 1, "label": "Glass Core", "desc": "9-micron core — thinner than a human hair, carrying terabits per second via total internal reflection"},
         {"depth": 2, "label": "Total Internal Reflection", "desc": "Snell's Law: light hitting the core-cladding boundary above the critical angle bounces back — zero escape"},
         {"depth": 3, "label": "Photon Propagation", "desc": "Guided electromagnetic modes: LP01 in single-mode. Dispersion limits bandwidth over distance"},
         {"depth": 4, "label": "Silica Structure", "desc": "Amorphous SiO₂ network with OH⁻ impurities creating absorption peaks at 1240nm and 1380nm"},
         {"depth": 5, "label": "Quantum Optics", "desc": "Single-photon detection for quantum key distribution — the physics of unhackable communication"},
     ]},
    {"id": "gfci_outlet", "name": "GFCI Outlet", "color": "#FBBF24",
     "gauge": "20A/125V", "ampacity": 20, "resistance_ohm_km": 0,
     "origin": "Ground-fault circuit interrupter — life-saving device that detects 5mA current imbalance in 1/40th of a second",
     "composition": ["Current transformer sensor", "Differential comparator", "Solenoid trip mechanism", "Test/Reset buttons"],
     "crystal_structure": "Electromechanical assembly",
     "uses": "Kitchens, bathrooms, garages, outdoor outlets — anywhere water meets electricity",
     "dive_layers": [
         {"depth": 0, "label": "Installed Device", "desc": "Duplex outlet with TEST and RESET buttons — the colored buttons are a visual safety indicator"},
         {"depth": 1, "label": "Sensing Coil", "desc": "Toroidal current transformer: hot and neutral pass through. If currents differ by 5mA, a fault exists"},
         {"depth": 2, "label": "Differential Detection", "desc": "Comparator circuit: equal and opposite currents cancel in the toroid. Any imbalance = ground fault"},
         {"depth": 3, "label": "Trip Mechanism", "desc": "Solenoid-driven contact separation in 25 milliseconds — faster than ventricular fibrillation onset"},
         {"depth": 4, "label": "Electromagnetic Induction", "desc": "Faraday's law: changing flux from current imbalance induces voltage in the sense winding"},
         {"depth": 5, "label": "Cardiac Protection", "desc": "5mA threshold chosen because 10mA causes muscle lock. The GFCI trips before you can't let go"},
     ]},
    {"id": "breaker", "name": "Circuit Breaker", "color": "#EF4444",
     "gauge": "20A/240V", "ampacity": 20, "resistance_ohm_km": 0,
     "origin": "Overcurrent protection — thermal-magnetic device that opens the circuit before wires melt",
     "composition": ["Bimetallic strip (thermal)", "Electromagnetic coil (magnetic)", "Arc chute", "Toggle mechanism"],
     "crystal_structure": "Bimetallic Cu/Fe laminate",
     "uses": "Panel boards, load centers, motor protection, branch circuit protection",
     "dive_layers": [
         {"depth": 0, "label": "Panel Breaker", "desc": "Toggle switch snapped onto the bus bar — the gatekeeper between the utility and your home"},
         {"depth": 1, "label": "Thermal Element", "desc": "Bimetallic strip bends under sustained overcurrent heat — handles slow overloads (10-30 seconds)"},
         {"depth": 2, "label": "Magnetic Element", "desc": "Electromagnetic coil trips instantly on short circuit (10x rated current) — handles fast faults"},
         {"depth": 3, "label": "Arc Chute", "desc": "Steel plates split and cool the arc when contacts open — extinguishing 10,000°F plasma in milliseconds"},
         {"depth": 4, "label": "Bimetallic Physics", "desc": "Copper (CTE: 17μm/m/°C) bonded to iron (CTE: 12μm/m/°C) — differential expansion creates deflection"},
         {"depth": 5, "label": "Plasma Dynamics", "desc": "Electric arc ionizes air at 6,000K. Arc chute plates increase arc voltage until it self-extinguishes"},
     ]},
])

PLUMBING_MATERIALS.extend([
    {"id": "cast_iron", "name": "Cast Iron DWV", "color": "#4A4A4A",
     "diameter": "4 inch", "pressure_psi": 0, "flow_gpm": 100,
     "origin": "Hub-and-spigot cast iron — the 100-year pipe that built America's sewer infrastructure",
     "composition": ["Grey cast iron (96%)", "Carbon flake graphite (3.5%)", "Silicon (0.5%)"],
     "crystal_structure": "Pearlite matrix with flake graphite inclusions",
     "uses": "Main drain, sewer laterals, vent stacks, commercial DWV, fire suppression",
     "dive_layers": [
         {"depth": 0, "label": "Hub Joint", "desc": "Lead and oakum joint — molten lead poured into the hub around oakum packing. Still found in pre-1970 homes"},
         {"depth": 1, "label": "Iron Wall", "desc": "0.25-inch wall thickness; centrifugally cast for uniform density. Absorbs sound far better than plastic"},
         {"depth": 2, "label": "Graphite Flakes", "desc": "Free graphite flakes in the iron matrix act as crack arrestors and vibration dampers"},
         {"depth": 3, "label": "Corrosion Layer", "desc": "Tuberculation: iron oxide nodules grow inward over decades, eventually restricting flow to 50%"},
         {"depth": 4, "label": "Electrochemistry", "desc": "Galvanic corrosion where cast iron (cathode) meets copper (anode) without dielectric union"},
         {"depth": 5, "label": "Metallurgy", "desc": "Fe-C phase diagram at 3.5% carbon: eutectic solidification creates the graphite flake morphology"},
     ]},
    {"id": "sharkbite", "name": "SharkBite Push-Fit", "color": "#FF6B35",
     "diameter": "1/2 inch", "pressure_psi": 200, "flow_gpm": 3,
     "origin": "Push-to-connect fitting — no solder, no tools, instant watertight connection",
     "composition": ["DZR brass body", "EPDM O-ring", "Stainless steel teeth", "PEX stiffener"],
     "crystal_structure": "Dezincification-resistant brass alloy",
     "uses": "Repair coupling, PEX-to-copper transition, emergency fixes, DIY plumbing",
     "dive_layers": [
         {"depth": 0, "label": "Push Connection", "desc": "Push the pipe in until it clicks. Stainless teeth grip; O-ring seals. Removable with disconnect clip"},
         {"depth": 1, "label": "Grab Ring", "desc": "316 stainless steel teeth angle inward — the harder you pull, the tighter they bite. Shark-tooth geometry"},
         {"depth": 2, "label": "EPDM Seal", "desc": "Ethylene propylene diene monomer O-ring: chemical resistance to chlorinated water, rated to 200°F"},
         {"depth": 3, "label": "DZR Brass", "desc": "Dezincification-resistant: arsenic additive locks zinc in the crystal lattice, preventing selective leaching"},
         {"depth": 4, "label": "Elastomer Chemistry", "desc": "EPDM terpolymer: ethylene (55%), propylene (40%), diene (5%) — the diene enables cross-linking"},
         {"depth": 5, "label": "Contact Mechanics", "desc": "Hertzian contact stress at tooth-pipe interface: localized plastic deformation creates the grip"},
     ]},
    {"id": "brass_valve", "name": "Brass Ball Valve", "color": "#D4AF37",
     "diameter": "3/4 inch", "pressure_psi": 600, "flow_gpm": 15,
     "origin": "Quarter-turn shutoff valve — the most reliable isolation valve in residential plumbing",
     "composition": ["Forged brass body (C83600)", "Chrome-plated brass ball", "PTFE seats", "Stem packing"],
     "crystal_structure": "Alpha-beta brass (Cu-Zn)",
     "uses": "Main shutoff, fixture isolation, irrigation control, boiler isolation",
     "dive_layers": [
         {"depth": 0, "label": "Installed Valve", "desc": "Quarter-turn handle: parallel to pipe = open, perpendicular = closed. Full port = zero flow restriction"},
         {"depth": 1, "label": "Ball Mechanism", "desc": "Chrome-plated brass sphere with bore hole. 90° rotation moves bore from aligned (open) to blocked (closed)"},
         {"depth": 2, "label": "PTFE Seats", "desc": "Polytetrafluoroethylene seat rings compress against the ball — chemically inert, self-lubricating"},
         {"depth": 3, "label": "Stem Seal", "desc": "O-ring and packing gland prevent leakage around the rotating stem — the most common failure point"},
         {"depth": 4, "label": "Brass Metallurgy", "desc": "60% Cu / 40% Zn: alpha+beta dual phase. Hot-forged at 700°C for superior grain structure"},
         {"depth": 5, "label": "Tribology", "desc": "PTFE coefficient of friction: 0.04. The ball rotates on a near-frictionless surface for decades"},
     ]},
])

LANDSCAPING_MATERIALS.extend([
    {"id": "river_rock", "name": "River Rock", "color": "#8B8682",
     "ph": 7.0, "organic_pct": 0, "density_kg_m3": 1800,
     "origin": "Water-tumbled stone — millennia of hydraulic erosion create smooth, rounded aggregate",
     "composition": ["Mixed lithology (granite, basalt, quartz)", "Smooth rounded 1-3 inch", "No fines"],
     "structure": "Rounded clasts with minimal interlock; high void ratio",
     "uses": "Dry creek beds, drainage swales, decorative mulch, water features, erosion control",
     "dive_layers": [
         {"depth": 0, "label": "Rock Bed", "desc": "Smooth multicolored stones — each one a geological autobiography written by the river"},
         {"depth": 1, "label": "Hydraulic Rounding", "desc": "Zingg shape classification: rollers and spheres dominate after 50+ miles of river transport"},
         {"depth": 2, "label": "Mixed Mineralogy", "desc": "Each stone's color tells its origin: pink = feldspar-rich granite, dark = basalt, white = quartz"},
         {"depth": 3, "label": "Surface Weathering", "desc": "Desert varnish (iron/manganese oxide) coats exposed surfaces over centuries in arid climates"},
         {"depth": 4, "label": "Sediment Transport", "desc": "Hjulström curve: 2-inch cobbles need 1 m/s flow to move — velocity determines what the river carries"},
         {"depth": 5, "label": "Isotope Provenance", "desc": "Zircon U-Pb dating traces each stone to its parent pluton — geological DNA fingerprinting"},
     ]},
    {"id": "peat_moss", "name": "Sphagnum Peat", "color": "#5D4E37",
     "ph": 4.0, "organic_pct": 95, "density_kg_m3": 150,
     "origin": "Partially decomposed sphagnum moss — accumulated in anaerobic bogs over thousands of years",
     "composition": ["Sphagnum cell walls (70%)", "Humic acids (20%)", "Mineral traces (10%)"],
     "structure": "Sponge-like cellular matrix holding 20x its weight in water",
     "uses": "Seed starting, soil amendment, acid-loving plants, moisture retention",
     "dive_layers": [
         {"depth": 0, "label": "Baled Peat", "desc": "Compressed brown fiber — light, acidic, and sterile. The standard seed-starting medium worldwide"},
         {"depth": 1, "label": "Sphagnum Cells", "desc": "Hyaline cells: dead, hollow water-storage chambers comprising 80% of the leaf. Nature's sponge"},
         {"depth": 2, "label": "Cation Exchange", "desc": "Cell walls release H⁺ ions, taking up Ca²⁺/Mg²⁺ — this is why peat acidifies everything it touches"},
         {"depth": 3, "label": "Anaerobic Preservation", "desc": "Waterlogged, oxygen-free conditions halt decomposition — peat accumulates 1mm per year"},
         {"depth": 4, "label": "Bog Chemistry", "desc": "Sphagnol and other phenolic compounds create antimicrobial conditions — 'bog bodies' preserved for millennia"},
         {"depth": 5, "label": "Carbon Reservoir", "desc": "Peatlands store 30% of global soil carbon in 3% of land area — extraction releases ancient CO₂"},
     ]},
    {"id": "hardwood_mulch", "name": "Hardwood Mulch", "color": "#654321",
     "ph": 6.0, "organic_pct": 80, "density_kg_m3": 350,
     "origin": "Shredded bark and wood — the protective skin of the garden bed",
     "composition": ["Bark fibers (60%)", "Sapwood chips (30%)", "Leaf litter (10%)"],
     "structure": "Interlocking shredded fibers forming a breathable mat",
     "uses": "Weed suppression, moisture retention, temperature regulation, aesthetic",
     "dive_layers": [
         {"depth": 0, "label": "Mulch Layer", "desc": "2-3 inch layer of shredded hardwood — the garden's blanket, keeping soil moist and weeds down"},
         {"depth": 1, "label": "Decomposition Front", "desc": "Bottom layer turning grey and crumbly — fungi breaking lignin, feeding the soil beneath"},
         {"depth": 2, "label": "Fungal Colonization", "desc": "White mycelium threads binding mulch particles — the first colonizers in the decomposition cascade"},
         {"depth": 3, "label": "Lignin Breakdown", "desc": "Only white-rot fungi (Basidiomycetes) can break lignin's aromatic rings — a 300-million-year-old polymer"},
         {"depth": 4, "label": "Allelopathy", "desc": "Fresh hardwood releases juglone (walnut) or tannins that can inhibit seed germination temporarily"},
         {"depth": 5, "label": "Carbon Cycling", "desc": "C:N ratio of 400:1 means microbes borrow soil nitrogen to decompose — the temporary 'nitrogen tie-up'"},
     ]},
])

NURSING_MATERIALS.extend([
    {"id": "fall_risk", "name": "Fall Risk Assessment", "color": "#F97316",
     "category": "Safety", "complexity": "Foundation",
     "origin": "Evidence-based fall prevention — the #1 cause of injury in hospitalized patients",
     "components": ["Morse Fall Scale", "Environmental scan", "Gait assessment", "Medication review", "Patient education"],
     "system": "Musculoskeletal-Neurological axis",
     "uses": "Admission assessment, shift reassessment, post-fall investigation, care planning",
     "dive_layers": [
         {"depth": 0, "label": "Risk Screen", "desc": "Morse Fall Scale: history of falling, secondary diagnosis, ambulatory aid, IV/heparin lock, gait, mental status"},
         {"depth": 1, "label": "Gait Analysis", "desc": "Timed Up-and-Go test: stand, walk 3 meters, turn, return, sit. Over 12 seconds = high fall risk"},
         {"depth": 2, "label": "Vestibular System", "desc": "Semicircular canals detect rotation; otolith organs detect linear acceleration — the body's gyroscope"},
         {"depth": 3, "label": "Proprioception", "desc": "Muscle spindles and Golgi tendon organs: real-time feedback on joint position and force — the hidden sense"},
         {"depth": 4, "label": "Neural Integration", "desc": "Cerebellum integrates vestibular, visual, and proprioceptive input — 50ms processing delay = fall risk"},
         {"depth": 5, "label": "Sarcopenia", "desc": "Age-related muscle mass loss: 3-8% per decade after 30. Type II fast-twitch fibers decline first — the physics of frailty"},
     ]},
    {"id": "cardiac", "name": "Cardiac Monitoring", "color": "#DC2626",
     "category": "Critical Care", "complexity": "Advanced",
     "origin": "Continuous ECG surveillance — detecting life-threatening arrhythmias before they kill",
     "components": ["12-lead ECG", "Telemetry monitoring", "Rhythm interpretation", "ACLS protocols"],
     "system": "Cardiovascular-Electrical axis",
     "uses": "ICU/CCU monitoring, post-MI care, arrhythmia detection, code response",
     "dive_layers": [
         {"depth": 0, "label": "Monitor Display", "desc": "Green waveform: P-QRS-T complex repeating 60-100 times per minute — the electrical heartbeat"},
         {"depth": 1, "label": "12-Lead ECG", "desc": "12 views of the same electrical event: 6 limb leads + 6 precordial leads = 3D electrical map of the heart"},
         {"depth": 2, "label": "Conduction System", "desc": "SA node → AV node → Bundle of His → Purkinje fibers: the heart's built-in pacemaker cascade"},
         {"depth": 3, "label": "Ion Channels", "desc": "Na⁺ influx (depolarization), K⁺ efflux (repolarization), Ca²⁺ plateau — the choreography of each heartbeat"},
         {"depth": 4, "label": "Action Potential", "desc": "Phase 0-4: resting (-90mV) → rapid depolarization → plateau → repolarization → resting. 300ms per cycle"},
         {"depth": 5, "label": "Quantum Cardiology", "desc": "Electron tunneling in mitochondrial Complex I generates the ATP that powers every contraction"},
     ]},
    {"id": "patient_ed", "name": "Patient Education", "color": "#8B5CF6",
     "category": "Communication", "complexity": "Foundation",
     "origin": "Health literacy and teach-back — ensuring patients understand their care after discharge",
     "components": ["Health literacy assessment", "Teach-back method", "Written materials", "Motivational interviewing"],
     "system": "Cognitive-Behavioral axis",
     "uses": "Discharge planning, medication teaching, lifestyle modification, informed consent",
     "dive_layers": [
         {"depth": 0, "label": "Teaching Session", "desc": "Face-to-face education using plain language, pictures, and demonstration — meeting the patient where they are"},
         {"depth": 1, "label": "Teach-Back", "desc": "'Can you explain back to me how you'll take this medication?' — verifying understanding without shaming"},
         {"depth": 2, "label": "Health Literacy", "desc": "36% of US adults have basic or below-basic health literacy. Consent forms average a 12th-grade reading level"},
         {"depth": 3, "label": "Adult Learning Theory", "desc": "Knowles' andragogy: adults learn best when the content is immediately relevant to their life situation"},
         {"depth": 4, "label": "Behavior Change", "desc": "Transtheoretical Model: precontemplation → contemplation → preparation → action → maintenance"},
         {"depth": 5, "label": "Neuroplasticity", "desc": "Repeated practice physically rewires neural pathways — habit formation takes 66 days on average (Lally et al.)"},
     ]},
])

BIBLE_MATERIALS.extend([
    {"id": "romans", "name": "Romans", "color": "#EF4444",
     "testament": "New", "chapters": 16, "theme": "Justification by Faith",
     "origin": "Paul's magnum opus — the most systematic theology in the New Testament",
     "key_elements": ["Righteousness of God", "Justification by faith", "Life in the Spirit", "Israel's future"],
     "literary_form": "Theological epistle — logical argument building to doxology",
     "uses": "Soteriology, ethics, ecclesiology, Jewish-Gentile reconciliation",
     "dive_layers": [
         {"depth": 0, "label": "Written Text", "desc": "English translation of Paul's letter to the church in Rome — written circa 57 AD from Corinth"},
         {"depth": 1, "label": "Original Language", "desc": "Koine Greek: 'dikaiosynē theou' (righteousness of God) — the thesis statement of the entire letter"},
         {"depth": 2, "label": "Cultural Context", "desc": "Written to a mixed Jewish-Gentile congregation; Paul mediates the Torah-vs-grace tension"},
         {"depth": 3, "label": "Theological Intent", "desc": "Chapters 1-8: universal sin → justification → sanctification → glorification. The 'Roman Road' of salvation"},
         {"depth": 4, "label": "Prophetic Echo", "desc": "Romans 9-11: Israel's temporary hardening and future restoration — 'All Israel will be saved' (11:26)"},
         {"depth": 5, "label": "Spiritual Frequency", "desc": "'Nothing can separate us from the love of God' (8:38-39) — the crescendo that shook the Western world"},
     ]},
    {"id": "proverbs", "name": "Proverbs", "color": "#F59E0B",
     "testament": "Old", "chapters": 31, "theme": "Practical Wisdom",
     "origin": "The wisdom anthology — centuries of distilled observation about how life actually works",
     "key_elements": ["Fear of the Lord", "Lady Wisdom vs. Folly", "Royal instruction", "Numerical sayings"],
     "literary_form": "Mashal (proverb/comparison) — compressed truth in memorable form",
     "uses": "Character formation, decision-making, parenting, business ethics, conflict resolution",
     "dive_layers": [
         {"depth": 0, "label": "Written Text", "desc": "Two-line parallelisms: 'Trust in the LORD with all your heart' (3:5) — bite-sized wisdom for daily life"},
         {"depth": 1, "label": "Original Language", "desc": "Hebrew mashal: not just 'proverb' but 'comparison, riddle, oracle.' Each saying compresses layers"},
         {"depth": 2, "label": "Cultural Context", "desc": "International wisdom tradition: Egyptian Instruction of Amenemope parallels Proverbs 22:17-24:22"},
         {"depth": 3, "label": "Theological Intent", "desc": "'The fear of the LORD is the beginning of wisdom' (1:7) — all practical skill flows from right relationship"},
         {"depth": 4, "label": "Prophetic Echo", "desc": "Wisdom personified (ch. 8) becomes the Logos of John 1 — 'I was there when he set the heavens in place'"},
         {"depth": 5, "label": "Spiritual Frequency", "desc": "The 'Two Ways' structure: wisdom leads to life, folly to death — a binary that resonates in every culture"},
     ]},
    {"id": "revelation", "name": "Revelation", "color": "#7C3AED",
     "testament": "New", "chapters": 22, "theme": "Cosmic Victory",
     "origin": "Apocalyptic vision — John's exile on Patmos produces the Bible's most vivid imagery",
     "key_elements": ["Seven churches", "Throne room vision", "Seven seals/trumpets/bowls", "New Jerusalem"],
     "literary_form": "Apocalyptic prophecy — symbolic, cyclical, climactic",
     "uses": "Eschatology, worship, perseverance theology, cosmic christology",
     "dive_layers": [
         {"depth": 0, "label": "Written Text", "desc": "Vivid symbolic narrative — dragons, trumpets, seals, and a city of gold descending from heaven"},
         {"depth": 1, "label": "Original Language", "desc": "Semitized Greek: John thinks in Hebrew but writes in Greek. 348 OT allusions, zero direct quotations"},
         {"depth": 2, "label": "Cultural Context", "desc": "Written during Roman persecution (Domitian, 95 AD). '666' = Nero Caesar in Hebrew gematria"},
         {"depth": 3, "label": "Theological Intent", "desc": "Not a timeline but a theology: God wins, evil is defeated, creation is renewed. 'Behold, I make all things new'"},
         {"depth": 4, "label": "Prophetic Echo", "desc": "New Jerusalem reverses Eden: Tree of Life returns, the curse is lifted, God dwells with humanity again"},
         {"depth": 5, "label": "Spiritual Frequency", "desc": "'Come, Lord Jesus' (22:20) — the final frequency: longing for restoration that vibrates through all creation"},
     ]},
])


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# V61.0 STRIKE 2: SOCIAL PILLAR — Child Care & Elderly Care
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHILDCARE_MATERIALS = [
    {"id": "milestone", "name": "Developmental Milestones", "color": "#F472B6",
     "category": "Development", "complexity": "Foundation",
     "origin": "Ages & Stages — tracking physical, cognitive, language, and social-emotional growth",
     "components": ["Gross motor", "Fine motor", "Language", "Cognitive", "Social-emotional"],
     "system": "Neurodevelopmental axis",
     "uses": "Screening, parent education, referral decisions, curriculum planning",
     "dive_layers": [
         {"depth": 0, "label": "Observable Behavior", "desc": "Can the child stack 6 blocks? Follow 2-step directions? Share a toy? Each milestone maps to a neural circuit"},
         {"depth": 1, "label": "Developmental Domain", "desc": "Five domains interweave: a child who can't sit (gross motor) will struggle to use hands (fine motor)"},
         {"depth": 2, "label": "Neural Pruning", "desc": "Use it or lose it: 700 new synaptic connections per second in the first 3 years. Unused ones are pruned"},
         {"depth": 3, "label": "Myelination", "desc": "Myelin sheaths wrap axons in fatty insulation — increasing signal speed from 2 to 120 m/s. Sequence matters"},
         {"depth": 4, "label": "Epigenetics", "desc": "Early experiences methylate DNA: stress hormones can silence genes for resilience. Nurture literally changes nature"},
         {"depth": 5, "label": "Neuroplasticity", "desc": "The young brain rewires 10x faster than adults — the biological argument for early intervention"},
     ]},
    {"id": "play_based", "name": "Play-Based Learning", "color": "#A78BFA",
     "category": "Pedagogy", "complexity": "Intermediate",
     "origin": "Constructivist education — children build knowledge through active exploration and play",
     "components": ["Free play", "Guided play", "Dramatic play", "Constructive play", "Sensory play"],
     "system": "Cognitive-Social axis",
     "uses": "Preschool curriculum, home enrichment, therapeutic play, school readiness",
     "dive_layers": [
         {"depth": 0, "label": "Play Activity", "desc": "Block towers, pretend kitchens, sandboxes — what looks like 'just playing' is the most serious work of childhood"},
         {"depth": 1, "label": "Play Taxonomy", "desc": "Parten's stages: solitary → parallel → associative → cooperative. Social complexity increases with development"},
         {"depth": 2, "label": "Executive Function", "desc": "Play develops inhibitory control, working memory, and cognitive flexibility — the CEO skills of the brain"},
         {"depth": 3, "label": "Zone of Proximal Development", "desc": "Vygotsky: play creates a zone where children perform beyond their current level with scaffolding"},
         {"depth": 4, "label": "Mirror Neurons", "desc": "Observing another's action activates the same motor neurons — the neurological basis of learning by watching"},
         {"depth": 5, "label": "Dopamine Circuits", "desc": "Play activates the mesolimbic reward pathway — novelty → dopamine → motivation → learning. Joy IS the mechanism"},
     ]},
    {"id": "safety", "name": "Child Safety Protocol", "color": "#EF4444",
     "category": "Protection", "complexity": "Critical",
     "origin": "Injury prevention and mandatory reporting — the first duty of every caregiver",
     "components": ["Environmental safety", "Supervision ratios", "Emergency response", "Mandated reporting"],
     "system": "Prevention-Response axis",
     "uses": "Childproofing, ratio compliance, accident investigation, abuse recognition",
     "dive_layers": [
         {"depth": 0, "label": "Safe Environment", "desc": "Outlet covers, cabinet locks, soft corners, secured furniture — engineering hazards out of the space"},
         {"depth": 1, "label": "Supervision Ratios", "desc": "Infants 1:4, toddlers 1:6, preschool 1:10 — the numbers that keep children visible and protected"},
         {"depth": 2, "label": "Injury Epidemiology", "desc": "Falls (35%), poisoning (12%), burns (8%) — knowing the statistics guides prevention priorities"},
         {"depth": 3, "label": "Trauma-Informed Care", "desc": "ACEs (Adverse Childhood Experiences): each additional ACE increases health risk exponentially"},
         {"depth": 4, "label": "Attachment Theory", "desc": "Bowlby: secure attachment = safe base for exploration. The caregiver IS the safety equipment"},
         {"depth": 5, "label": "Stress Neurobiology", "desc": "Toxic stress floods cortisol → shrinks hippocampus, enlarges amygdala. Prevention rewires the brain"},
     ]},
]

CHILDCARE_TOOLS = [
    {"id": "storytelling", "name": "Storytelling", "action_verb": "Narrate", "description": "Interactive read-alouds and narrative play for language and imagination development", "technique": "Use different voices for characters. Pause and ask predictive questions. Point to pictures. Let the child turn pages. Repetition builds vocabulary — read favorites again and again.", "color": "#F472B6", "xp_per_action": 12, "icon_symbol": "S"},
    {"id": "guided_play", "name": "Guided Play", "action_verb": "Facilitate", "description": "Adult-scaffolded play activities with intentional learning objectives", "technique": "Set up the environment with purpose (put measuring cups in the sand). Observe first, then enter the play as a co-player. Ask open-ended questions. Follow the child's lead.", "color": "#A78BFA", "xp_per_action": 12, "icon_symbol": "G"},
    {"id": "safety_check", "name": "Safety Protocol", "action_verb": "Secure", "description": "Environmental scanning and hazard assessment for child spaces", "technique": "Get on your knees — see the room from a child's height. Check: choking hazards, tip-over risks, accessible toxins, cord strangulation, hot surfaces, sharp edges.", "color": "#EF4444", "xp_per_action": 12, "icon_symbol": "X"},
    {"id": "nutrition_cc", "name": "Child Nutrition", "action_verb": "Nourish", "description": "Age-appropriate meal planning and feeding development support", "technique": "Division of Responsibility (Ellyn Satter): adult decides what, when, where. Child decides whether and how much. Never force-feed. Offer new foods 10-15 times before concluding rejection.", "color": "#22C55E", "xp_per_action": 12, "icon_symbol": "N"},
    {"id": "positive_discipline", "name": "Positive Guidance", "action_verb": "Guide", "description": "Non-punitive behavior management through connection and redirection", "technique": "Name the emotion: 'You're frustrated because...' Validate the feeling, redirect the behavior. Natural consequences over punishment. The goal is self-regulation, not compliance.", "color": "#F59E0B", "xp_per_action": 12, "icon_symbol": "P"},
    {"id": "observation", "name": "Child Observation", "action_verb": "Observe", "description": "Systematic documentation of behavior, development, and learning", "technique": "Use running records: time-stamped, objective descriptions. 'Maria stacked 4 blocks, knocked them down, laughed, rebuilt.' Avoid interpretation. Patterns emerge over time.", "color": "#3B82F6", "xp_per_action": 12, "icon_symbol": "O"},
    {"id": "sensory", "name": "Sensory Activity", "action_verb": "Stimulate", "description": "Multi-sensory experiences for neural integration and calm regulation", "technique": "Water table, playdough, rice bins, finger paint. Messy play IS brain-building. Proprioceptive input (heavy work, squeezing) calms an overstimulated nervous system.", "color": "#EC4899", "xp_per_action": 12, "icon_symbol": "R"},
    {"id": "music_move", "name": "Music & Movement", "action_verb": "Engage", "description": "Rhythmic activities integrating auditory processing and gross motor skills", "technique": "Start with the beat: clap, stomp, march. Add melody. Add instruments. Freeze dance builds inhibitory control. Lullabies regulate heart rate and breathing.", "color": "#F97316", "xp_per_action": 12, "icon_symbol": "M"},
    {"id": "empathy_model", "name": "Empathy Modeling", "action_verb": "Model", "description": "Demonstrating emotional attunement and compassionate response", "technique": "Narrate your own emotions: 'I feel frustrated too.' Label what you see in the child. Comfort before correction. Children learn empathy by receiving it, not by being told about it.", "color": "#D4AF37", "xp_per_action": 12, "icon_symbol": "E"},
]

ELDERCARE_MATERIALS = [
    {"id": "dignity", "name": "Resident Dignity", "color": "#A78BFA",
     "category": "Ethics", "complexity": "Foundation",
     "origin": "Person-centered care — the resident is a person first, a patient second",
     "components": ["Autonomy", "Privacy", "Individuality", "Choice", "Respect"],
     "system": "Psychosocial-Ethical axis",
     "uses": "Care planning, staff training, family communication, quality improvement",
     "dive_layers": [
         {"depth": 0, "label": "Daily Interaction", "desc": "Knock before entering. Use their preferred name. Offer choices in clothing, food, and schedule"},
         {"depth": 1, "label": "Person-Centered Model", "desc": "Tom Kitwood: dementia doesn't erase personhood. The task of care is to maintain the person, not just the body"},
         {"depth": 2, "label": "Maslow's Hierarchy", "desc": "Safety and belonging BEFORE self-actualization. Loneliness kills more elders than heart disease"},
         {"depth": 3, "label": "Autonomy Ethics", "desc": "Capacity vs. competence: having dementia doesn't mean losing all decision-making ability. Assess per-decision"},
         {"depth": 4, "label": "Neurodegeneration", "desc": "Amyloid plaques and tau tangles destroy hippocampal neurons — memory fades but emotional memory persists longest"},
         {"depth": 5, "label": "Cellular Senescence", "desc": "Telomere shortening, mitochondrial dysfunction, stem cell exhaustion — the biology of aging at the molecular level"},
     ]},
    {"id": "mobility", "name": "Mobility & Transfers", "color": "#3B82F6",
     "category": "Physical Care", "complexity": "Intermediate",
     "origin": "Safe movement and fall prevention — preserving independence through proper body mechanics",
     "components": ["Gait belt use", "Transfer techniques", "Wheelchair positioning", "Range of motion"],
     "system": "Musculoskeletal-Safety axis",
     "uses": "Bed-to-chair transfers, ambulation assistance, repositioning, rehabilitation",
     "dive_layers": [
         {"depth": 0, "label": "Transfer Assist", "desc": "Gait belt secured at waist, feet shoulder-width apart, count to three, pivot on the strong leg"},
         {"depth": 1, "label": "Body Mechanics", "desc": "Lift with legs, not back. Keep the load close. Widen your base of support. The caregiver's spine is at risk"},
         {"depth": 2, "label": "Contracture Prevention", "desc": "Range-of-motion exercises maintain joint flexibility — unused joints freeze within weeks of immobility"},
         {"depth": 3, "label": "Bone Density", "desc": "Wolff's Law: bone remodels in response to load. Weight-bearing activity is the only stimulus for bone formation"},
         {"depth": 4, "label": "Sarcopenia Cascade", "desc": "Muscle loss → weakness → falls → fractures → immobility → more muscle loss. The downward spiral of inactivity"},
         {"depth": 5, "label": "Osteocyte Signaling", "desc": "Mechanotransduction: osteocytes sense mechanical strain and signal osteoblasts to build bone — use it or lose it"},
     ]},
    {"id": "memory_care", "name": "Memory Care", "color": "#F59E0B",
     "category": "Cognitive", "complexity": "Advanced",
     "origin": "Dementia-specific care — communication, safety, and quality of life for cognitive decline",
     "components": ["Validation therapy", "Reminiscence", "Redirection", "Environmental cues", "Routine structure"],
     "system": "Cognitive-Emotional axis",
     "uses": "Dementia care units, behavioral management, family support, end-of-life planning",
     "dive_layers": [
         {"depth": 0, "label": "Behavioral Approach", "desc": "Join their reality. If she thinks it's 1962, ask about 1962. Correcting causes distress; validating creates connection"},
         {"depth": 1, "label": "Validation Therapy", "desc": "Naomi Feil: behind every behavior is an unmet need. Agitation = pain, fear, or loneliness until proven otherwise"},
         {"depth": 2, "label": "Sundowning", "desc": "Late-afternoon confusion linked to circadian rhythm disruption — melatonin production declines with neurodegeneration"},
         {"depth": 3, "label": "Hippocampal Atrophy", "desc": "Short-term memory fails first (hippocampus) while procedural memory (basal ganglia) can persist — they may forget your name but remember how to dance"},
         {"depth": 4, "label": "Neurotransmitter Deficit", "desc": "Acetylcholine depletion in Alzheimer's: cholinergic neurons in nucleus basalis die — the chemistry of forgetting"},
         {"depth": 5, "label": "Protein Misfolding", "desc": "Beta-amyloid 42 aggregates into oligomers → plaques. Tau hyperphosphorylation → neurofibrillary tangles. Two pathologies, one disease"},
     ]},
]

ELDERCARE_TOOLS = [
    {"id": "mobility_assist", "name": "Mobility Assist", "action_verb": "Mobilize", "description": "Safe transfer and ambulation techniques preserving resident independence", "technique": "Always use a gait belt. Lock wheelchair brakes. Have the resident scoot to the edge. Count together: 'Ready, set, stand.' Support at the belt, never under the arms.", "color": "#3B82F6", "xp_per_action": 12, "icon_symbol": "M"},
    {"id": "memory_engage", "name": "Memory Engagement", "action_verb": "Reminisce", "description": "Validation and reminiscence techniques for cognitive connection", "technique": "Use sensory triggers: old music, familiar scents, photo albums. Ask about feelings, not facts. 'How did that make you feel?' works when 'What did you do?' doesn't.", "color": "#F59E0B", "xp_per_action": 12, "icon_symbol": "R"},
    {"id": "med_pass", "name": "Medication Pass", "action_verb": "Administer", "description": "Safe medication administration for complex multi-drug regimens", "technique": "Verify the 5 Rights at the bedside. Open packaging in front of the resident. Watch them swallow. Document immediately. Report any refusal to the nurse.", "color": "#EF4444", "xp_per_action": 12, "icon_symbol": "X"},
    {"id": "companionship", "name": "Companionship", "action_verb": "Accompany", "description": "Purposeful social engagement and emotional presence", "technique": "Sit at eye level. Hold a hand if welcome. Silence is acceptable — presence matters more than words. Learn their life story. Every resident was someone's everything.", "color": "#D4AF37", "xp_per_action": 12, "icon_symbol": "C"},
    {"id": "comfort", "name": "Comfort Measures", "action_verb": "Comfort", "description": "Pain management and end-of-life comfort care", "technique": "Reposition every 2 hours. Mouth care with swabs. Cool cloth on forehead. Soft music. Dim lights. The goal shifts from cure to comfort — and that is not giving up.", "color": "#A78BFA", "xp_per_action": 12, "icon_symbol": "O"},
    {"id": "fall_prevent", "name": "Fall Prevention", "action_verb": "Prevent", "description": "Environmental and behavioral strategies to keep residents safe", "technique": "Non-skid footwear. Call light within reach. Bed in lowest position. Night lights on. Clear pathways. The best fall intervention is the one that prevents it.", "color": "#22C55E", "xp_per_action": 12, "icon_symbol": "F"},
    {"id": "nutrition_ec", "name": "Nutrition Support", "action_verb": "Nourish", "description": "Meal assistance and nutritional monitoring for elderly residents", "technique": "Check diet order. Assist with tray setup. Cut food if needed. Encourage fluids. Document intake percentage. Report less than 50% to the dietitian.", "color": "#F97316", "xp_per_action": 12, "icon_symbol": "N"},
    {"id": "hygiene_care", "name": "Hygiene Care", "action_verb": "Bathe", "description": "Dignified personal care maintaining skin integrity and self-esteem", "technique": "Warm the room first. Offer choices: bath or shower? Expose only the area being washed. Use the resident's preferred products. Check skin for breakdown at every bath.", "color": "#EC4899", "xp_per_action": 12, "icon_symbol": "H"},
    {"id": "activity_plan", "name": "Activity Planning", "action_verb": "Engage", "description": "Meaningful activities matched to cognitive and physical abilities", "technique": "Match activity to ability: folding towels for dementia, painting for arthritis, music for all. The activity doesn't have to produce anything — the engagement IS the product.", "color": "#94A3B8", "xp_per_action": 12, "icon_symbol": "A"},
]

# Register new V61.0 modules
MODULES["childcare"] = {"materials": CHILDCARE_MATERIALS, "tools": CHILDCARE_TOOLS, "mat_key": "scenarios", "mat_id_key": "scenario_id", "skill": "Childcare_Skill"}
MODULES["eldercare"] = {"materials": ELDERCARE_MATERIALS, "tools": ELDERCARE_TOOLS, "mat_key": "scenarios", "mat_id_key": "scenario_id", "skill": "Eldercare_Skill"}


@router.get("/workshop/{module_id}/materials")
async def get_module_materials(module_id: str):
    """Universal materials endpoint for all V60.0 modules."""
    module = MODULES.get(module_id)
    if not module:
        return {"error": f"Module '{module_id}' not found"}
    return {module["mat_key"]: module["materials"]}


@router.get("/workshop/{module_id}/tools")
async def get_module_tools(module_id: str):
    """Universal tools endpoint for all V60.0 modules.
    
    V1.2.3 — Backfills missing 'technique' and 'description' fields with the
    tool's existing 'desc' (or a sensible default) so the frontend never
    renders 'undefined' when a tool was authored with shorter metadata.
    """
    module = MODULES.get(module_id)
    if not module:
        return {"error": f"Module '{module_id}' not found"}
    safe_tools = []
    for t in module["tools"]:
        st = dict(t)
        # Frontend reads tool.technique and tool.description; some legacy
        # tools (Brunton Compass, Seismograph, …) only carry 'desc'.
        st.setdefault("technique", st.get("desc") or st.get("description") or f"Apply {st.get('action_verb', 'use')} with intention.")
        st.setdefault("description", st.get("desc") or st.get("technique") or "")
        safe_tools.append(st)
    return {"tools": safe_tools}


@router.post("/workshop/{module_id}/tool-action")
async def module_tool_action(module_id: str, data: dict = Body(...)):
    """Universal tool-action endpoint for all V60.0 modules."""
    module = MODULES.get(module_id)
    if not module:
        return {"error": f"Module '{module_id}' not found"}

    tool_id = data.get("tool_id", "")
    mat_id = data.get(module["mat_id_key"], data.get("material_id", ""))

    tool = next((t for t in module["tools"] if t["id"] == tool_id), None)
    mat = next((m for m in module["materials"] if m["id"] == mat_id), None)
    if not tool or not mat:
        return {"error": "Invalid tool or material"}

    # V1.2.3 — Defensive lookups so authoring shortcuts (desc-only tools)
    # never produce 'undefined' in the rendered tutorial.
    technique = tool.get("technique") or tool.get("desc") or tool.get("description") or f"Apply {tool.get('action_verb', 'use')} with intention."
    description = tool.get("description") or tool.get("desc") or technique

    return {
        "action": f"{tool['action_verb']} {mat['name']}",
        "tool": tool["name"],
        "tool_technique": technique,
        "tool_description": description,
        "material": mat["name"],
        "material_origin": mat.get("origin", ""),
        "xp_awarded": tool["xp_per_action"],
        "skill": module["skill"],
        "tutorial_context": (
            f"The user selected the {tool['name']} tool on {mat['name']}. "
            f"Technique: {technique} "
            f"Context: {mat.get('origin', '')}. "
            f"Generate a practical tutorial step for using the {tool['name']} with {mat['name']}. "
            f"Include safety notes and a professional tip."
        ),
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# V62.0 — PARITY II: Expand Child Care & Elderly Care to 6 materials
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHILDCARE_MATERIALS.extend([
    {"id": "toddler_nutrition", "name": "Toddler Nutrition", "color": "#22C55E", "category": "Health", "complexity": "Foundation",
     "origin": "Feeding the growing brain — nutrition in the first 1,000 days shapes lifelong health",
     "components": ["Iron-rich foods", "Healthy fats", "Limited sugar", "Self-feeding skills", "Mealtime routine"],
     "system": "Nutritional-Developmental axis",
     "uses": "Meal planning, picky eating strategies, allergy introduction, growth monitoring",
     "dive_layers": [
         {"depth": 0, "label": "Mealtime", "desc": "Colorful plates, small portions, family-style service — making nutrition a social experience"},
         {"depth": 1, "label": "Macro Balance", "desc": "Toddlers need 40% calories from fat (brain building), 15% protein, 45% carbs — different from adults"},
         {"depth": 2, "label": "Micronutrient Needs", "desc": "Iron deficiency affects 7% of toddlers — impacts cognitive development before anemia appears on labs"},
         {"depth": 3, "label": "Gut-Brain Axis", "desc": "70% of serotonin is produced in the gut. Microbiome diversity in early childhood shapes mental health"},
         {"depth": 4, "label": "Taste Development", "desc": "Bitter rejection is genetic (TAS2R38 gene). Repeated neutral exposure (10-15 times) overcomes neophobia"},
         {"depth": 5, "label": "Epigenetic Nutrition", "desc": "Early nutrition methylates genes controlling metabolism — 'programming' obesity risk for life"},
     ]},
    {"id": "conflict_resolution", "name": "Conflict Resolution", "color": "#F59E0B", "category": "Social", "complexity": "Intermediate",
     "origin": "Teaching children to solve problems without aggression — the foundation of emotional intelligence",
     "components": ["Emotion naming", "Turn-taking", "Compromise", "Using words", "Seeking help"],
     "system": "Social-Emotional axis",
     "uses": "Peer disputes, sharing struggles, sibling rivalry, classroom management",
     "dive_layers": [
         {"depth": 0, "label": "The Conflict", "desc": "Two children want the same toy. This is not a problem — it's a developmental opportunity"},
         {"depth": 1, "label": "Emotion Coaching", "desc": "Gottman's 5 steps: notice the emotion, see it as teaching moment, validate, label, set limits"},
         {"depth": 2, "label": "Prefrontal Development", "desc": "The PFC (impulse control center) isn't fully myelinated until age 25. Expecting adult self-control is neurologically impossible"},
         {"depth": 3, "label": "Mirror Neuron Modeling", "desc": "Children who observe adults resolving conflict calmly build stronger conflict-resolution neural circuits"},
         {"depth": 4, "label": "Cortisol Regulation", "desc": "Unresolved conflict floods cortisol. Co-regulation (calm adult presence) teaches the child's HPA axis to self-regulate"},
         {"depth": 5, "label": "Attachment Security", "desc": "Secure attachment = safe base for conflict. The child who knows they won't be abandoned can tolerate disagreement"},
     ]},
    {"id": "cognitive_play", "name": "Cognitive Play", "color": "#3B82F6", "category": "Learning", "complexity": "Intermediate",
     "origin": "Structured play activities that build problem-solving, memory, and abstract thinking",
     "components": ["Puzzles", "Sorting/matching", "Pattern recognition", "Cause-effect toys", "Pretend play"],
     "system": "Cognitive-Executive axis",
     "uses": "School readiness, STEM foundations, gifted identification, developmental screening",
     "dive_layers": [
         {"depth": 0, "label": "Play Activity", "desc": "Sorting buttons by color, building block towers, completing puzzles — play that looks easy but builds genius"},
         {"depth": 1, "label": "Piaget's Stages", "desc": "Sensorimotor (0-2) → Preoperational (2-7): object permanence, symbolic thought, egocentrism — the cognitive ladder"},
         {"depth": 2, "label": "Executive Function", "desc": "Working memory (hold info) + inhibitory control (resist impulse) + cognitive flexibility (switch strategies)"},
         {"depth": 3, "label": "Synaptic Density", "desc": "Peak synapse count at age 3: 1,000 trillion connections. Experience determines which survive pruning"},
         {"depth": 4, "label": "Scaffolding Theory", "desc": "Bruner: adult provides just enough support for the child to succeed, then withdraws. The zone of proximal development in action"},
         {"depth": 5, "label": "Neurogenesis", "desc": "Hippocampal neurogenesis continues through childhood — enriched environments literally grow more brain cells"},
     ]},
])

ELDERCARE_MATERIALS.extend([
    {"id": "palliative", "name": "Palliative Care", "color": "#8B5CF6", "category": "End-of-Life", "complexity": "Advanced",
     "origin": "Comfort-focused care for serious illness — quality of life when cure is no longer the goal",
     "components": ["Pain management", "Symptom control", "Psychosocial support", "Advance directives", "Family meetings"],
     "system": "Holistic-Comfort axis",
     "uses": "Hospice, oncology, chronic disease, goals-of-care discussions, bereavement",
     "dive_layers": [
         {"depth": 0, "label": "Comfort Plan", "desc": "Shift from 'doing everything' to 'doing the right things.' The bravest medical decision is choosing comfort"},
         {"depth": 1, "label": "Pain Assessment", "desc": "FLACC scale for non-verbal patients. Pain is the 5th vital sign. Believe the patient's report, not your assumptions"},
         {"depth": 2, "label": "Opioid Pharmacology", "desc": "Morphine binds μ-opioid receptors in the dorsal horn, blocking substance P transmission. Titrate to effect, not to fear"},
         {"depth": 3, "label": "Total Pain Concept", "desc": "Cicely Saunders: physical + emotional + social + spiritual pain = total suffering. You can't medicate grief"},
         {"depth": 4, "label": "Dying Process", "desc": "Cheyne-Stokes breathing, mottling, terminal restlessness — the body's natural shutdown sequence"},
         {"depth": 5, "label": "Cellular Apoptosis", "desc": "Programmed cell death: caspase cascades dismantle the cell from within. Death is not failure — it is biology"},
     ]},
    {"id": "occupational_therapy", "name": "Occupational Therapy", "color": "#F97316", "category": "Rehabilitation", "complexity": "Intermediate",
     "origin": "Restoring independence in daily living — helping people do what matters most to them",
     "components": ["ADL assessment", "Adaptive equipment", "Energy conservation", "Home modification", "Cognitive rehab"],
     "system": "Functional-Adaptive axis",
     "uses": "Post-stroke rehab, arthritis management, dementia adaptation, discharge planning",
     "dive_layers": [
         {"depth": 0, "label": "Daily Living", "desc": "Can they dress, bathe, eat, toilet independently? The Katz ADL Index measures functional independence"},
         {"depth": 1, "label": "Task Analysis", "desc": "Break 'making breakfast' into 47 discrete steps. Find where the chain breaks. Adapt that specific link"},
         {"depth": 2, "label": "Neuroplastic Rehab", "desc": "Constraint-induced movement therapy: force the affected limb to work. 10,000 repetitions rewire the motor cortex"},
         {"depth": 3, "label": "Assistive Technology", "desc": "Built-up utensil grips, button hooks, reachers, shower chairs — engineering solutions for biological limitations"},
         {"depth": 4, "label": "Motor Learning", "desc": "Fitts & Posner: cognitive → associative → autonomous. Practice schedule matters more than practice volume"},
         {"depth": 5, "label": "Cortical Reorganization", "desc": "After stroke, adjacent brain areas recruit to compensate. The brain's map literally redraws itself with practice"},
     ]},
    {"id": "end_of_life", "name": "End-of-Life Dignity", "color": "#D4AF37", "category": "Ethics", "complexity": "Critical",
     "origin": "The final chapter — ensuring every person dies with the same respect they deserved in life",
     "components": ["Advance directives", "DNR/POLST", "Family presence", "Spiritual care", "Legacy work"],
     "system": "Ethical-Spiritual axis",
     "uses": "Hospice enrollment, family conferences, ethical decision-making, grief support",
     "dive_layers": [
         {"depth": 0, "label": "The Conversation", "desc": "'What matters most to you?' is more important than 'What treatment do you want?' Goals before options"},
         {"depth": 1, "label": "Advance Directives", "desc": "Living will + healthcare proxy. Only 37% of Americans have them. The conversation saves families from impossible choices"},
         {"depth": 2, "label": "Ethical Framework", "desc": "Autonomy, beneficence, non-maleficence, justice — the four pillars of medical ethics at the bedside"},
         {"depth": 3, "label": "Grief Anticipation", "desc": "Anticipatory grief begins before death. Acknowledge it: 'You're already grieving. That's normal and human'"},
         {"depth": 4, "label": "Spiritual Distress", "desc": "Existential questions intensify: 'Why me? Was my life meaningful? What happens next?' Listen, don't answer"},
         {"depth": 5, "label": "Consciousness & Dying", "desc": "Terminal lucidity — unexplained cognitive clarity before death. Hearing is the last sense to fade. Speak to the dying"},
     ]},
])


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# V62.0 — 4 NEW CELLS: Welding, Automotive, Nutrition, Meditation
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WELDING_MATERIALS = [
    {"id": "mild_steel", "name": "Mild Steel", "color": "#6B7280", "gauge": "1/4 inch plate", "tensile_mpa": 400,
     "origin": "Low-carbon steel — the most commonly welded metal on Earth", "composition": ["Iron (98.5%)", "Carbon (0.2%)", "Manganese (0.8%)"],
     "crystal_structure": "Ferrite + Pearlite (BCC iron)", "uses": "Structural fabrication, frames, brackets, general repair",
     "dive_layers": [
         {"depth": 0, "label": "Base Metal", "desc": "Hot-rolled A36 plate with mill scale — the workhorse of structural steel fabrication"},
         {"depth": 1, "label": "Heat-Affected Zone", "desc": "The HAZ: base metal altered by weld heat but not melted. Grain growth here reduces toughness"},
         {"depth": 2, "label": "Weld Pool", "desc": "Molten puddle at 2,800°F: base metal + filler mix. Shielding gas prevents atmospheric contamination"},
         {"depth": 3, "label": "Solidification", "desc": "Epitaxial grain growth from fusion line inward. Columnar dendrites form as the pool freezes"},
         {"depth": 4, "label": "Phase Transformation", "desc": "Austenite → ferrite/pearlite on cooling. Fast cooling creates martensite — hard, brittle, crack-prone"},
         {"depth": 5, "label": "Dislocation Theory", "desc": "Strength comes from dislocation pinning: carbon atoms lock crystal defects. The physics of steel strength"},
     ]},
    {"id": "aluminum", "name": "Aluminum 6061", "color": "#C0C0C0", "gauge": "3/16 inch plate", "tensile_mpa": 310,
     "origin": "Heat-treatable aluminum alloy — lightweight, corrosion-resistant, the metal of modern fabrication",
     "composition": ["Aluminum (97%)", "Magnesium (1%)", "Silicon (0.6%)", "Copper (0.3%)"],
     "crystal_structure": "FCC aluminum with Mg₂Si precipitates", "uses": "Boat hulls, bike frames, truck bodies, aerospace",
     "dive_layers": [
         {"depth": 0, "label": "Cleaned Surface", "desc": "Wire-brushed to remove aluminum oxide — the invisible 3,700°F-melting barrier that sabotages welds"},
         {"depth": 1, "label": "AC TIG Process", "desc": "AC current: electrode-positive half-cycle blasts oxide off; electrode-negative melts the base. Alternating 120 times/second"},
         {"depth": 2, "label": "Thermal Conductivity", "desc": "Aluminum conducts heat 5x faster than steel — the weld pool runs away if you don't compensate with higher amperage"},
         {"depth": 3, "label": "Precipitate Dissolution", "desc": "HAZ temperatures dissolve Mg₂Si precipitates that give 6061-T6 its strength — the weld zone is always weaker"},
         {"depth": 4, "label": "Hot Cracking", "desc": "Solidification cracking in the partially-solidified zone: silicon-rich eutectic films between grains"},
         {"depth": 5, "label": "Oxide Thermodynamics", "desc": "Al₂O₃: ΔG = -1582 kJ/mol. Aluminum WANTS to oxidize more than almost any metal — constant battle"},
     ]},
    {"id": "stainless", "name": "Stainless 304", "color": "#E8E8E8", "gauge": "16 gauge sheet", "tensile_mpa": 515,
     "origin": "Austenitic stainless steel — chromium creates an invisible, self-healing oxide shield",
     "composition": ["Iron (68%)", "Chromium (18%)", "Nickel (8%)", "Carbon (<0.08%)"],
     "crystal_structure": "FCC austenite (stabilized by nickel)", "uses": "Food equipment, medical, chemical processing, architectural",
     "dive_layers": [
         {"depth": 0, "label": "Brushed Finish", "desc": "Satin #4 finish — chromium oxide reforms in seconds after scratching. Self-healing surface"},
         {"depth": 1, "label": "TIG Purge", "desc": "Back-purge with argon prevents 'sugaring' (chromium oxide contamination) on the root side of the joint"},
         {"depth": 2, "label": "Sensitization", "desc": "Heating to 800-1500°F precipitates chromium carbides at grain boundaries — stealing chromium from the matrix"},
         {"depth": 3, "label": "Passive Film", "desc": "Cr₂O₃ film: 1-5nm thick, transparent, self-healing. Requires minimum 10.5% Cr in solution to form"},
         {"depth": 4, "label": "Austenite Stability", "desc": "Nickel stabilizes FCC structure at room temp. Without Ni, chromium steels are ferritic (BCC) and less tough"},
         {"depth": 5, "label": "Corrosion Electrochemistry", "desc": "Pitting potential (Epit) vs repassivation potential (Erp): the electrochemical window of safety"},
     ]},
]

WELDING_TOOLS = [
    {"id": "tig_torch", "name": "TIG Torch", "action_verb": "Weld", "description": "Gas tungsten arc welding torch for precision fusion of all metals", "technique": "Hold like a pencil at 15° from vertical. Maintain 1/8-inch arc length. Add filler rod to the leading edge of the pool. Never touch tungsten to the pool.", "color": "#3B82F6", "xp_per_action": 12, "icon_symbol": "T"},
    {"id": "mig_gun", "name": "MIG Gun", "action_verb": "Feed", "description": "Wire-feed welding gun for fast, semi-automatic fusion", "technique": "Push technique for thin metal (better penetration), drag for thick. Maintain consistent 3/4-inch stickout. Listen for the steady 'bacon frying' sound — crackle means settings are off.", "color": "#EF4444", "xp_per_action": 12, "icon_symbol": "M"},
    {"id": "angle_grinder", "name": "Angle Grinder", "action_verb": "Grind", "description": "High-speed rotary tool for surface prep, weld cleanup, and cutting", "technique": "10-15° angle to the work surface. Let the disc do the work — excessive pressure glazes the abrasive. Always grind INTO the edge, never away from it. Guard must be between you and the disc.", "color": "#F59E0B", "xp_per_action": 12, "icon_symbol": "G"},
    {"id": "welding_clamp", "name": "Welding Clamp", "action_verb": "Fixture", "description": "Heavy-duty clamps and fixtures for holding workpieces in alignment", "technique": "Tack weld at ends first, then middle. Alternate sides to minimize distortion. A part that moves during welding is a weld that fails in service.", "color": "#22C55E", "xp_per_action": 12, "icon_symbol": "C"},
    {"id": "flux_weld", "name": "Flux Paste", "action_verb": "Flux", "description": "Chemical cleaning agent that prevents oxidation during brazing and soldering", "technique": "Apply thin coat to both surfaces. Flux activates at temperature — it bubbles, clears, and goes glassy. If it turns black, you overheated it.", "color": "#A78BFA", "xp_per_action": 12, "icon_symbol": "F"},
    {"id": "chipping_hammer", "name": "Chipping Hammer", "action_verb": "Chip", "description": "Spring-handle hammer for removing slag from stick and flux-core welds", "technique": "Angle the chisel point at 30° to the bead surface. Short, sharp strikes. The slag should pop off in sheets — if it sticks, your weld is too cold.", "color": "#94A3B8", "xp_per_action": 12, "icon_symbol": "H"},
    {"id": "welding_helmet", "name": "Auto-Dark Helmet", "action_verb": "Shield", "description": "Variable-shade auto-darkening helmet protecting eyes from UV/IR arc radiation", "technique": "Set shade 10 for TIG, shade 11-13 for MIG/Stick. Reaction time under 1/25,000 second. Always check the auto-dark sensor BEFORE striking an arc.", "color": "#EC4899", "xp_per_action": 12, "icon_symbol": "S"},
    {"id": "filler_rod", "name": "Filler Rod", "action_verb": "Fill", "description": "Consumable wire or rod that adds material to the weld joint", "technique": "Match filler to base metal: ER70S-6 for mild steel, ER4043 for aluminum, ER308L for stainless. Dip into the leading edge of the pool, not the arc.", "color": "#F97316", "xp_per_action": 12, "icon_symbol": "R"},
    {"id": "wire_brush", "name": "Wire Brush", "action_verb": "Clean", "description": "Stainless steel bristle brush for pre-weld cleaning and inter-pass cleaning", "technique": "Dedicated brushes per metal type — steel brush on stainless causes contamination. Clean 1 inch past the weld zone. Remove mill scale, rust, oil, and paint.", "color": "#2DD4BF", "xp_per_action": 12, "icon_symbol": "B"},
]

AUTOMOTIVE_MATERIALS = [
    {"id": "engine_block", "name": "Engine Block", "color": "#6B7280", "category": "Powertrain", "complexity": "Advanced",
     "origin": "Internal combustion engine — 150 years of thermodynamic engineering in a single casting",
     "components": ["Cylinder bores", "Crankshaft journals", "Water jacket", "Oil galleries", "Deck surface"],
     "system": "Thermodynamic-Mechanical axis", "uses": "Diagnostics, rebuilding, performance tuning, emissions",
     "dive_layers": [
         {"depth": 0, "label": "Under the Hood", "desc": "Cast iron or aluminum block — the heart of the vehicle. Every component connects to this one casting"},
         {"depth": 1, "label": "Four-Stroke Cycle", "desc": "Intake-Compression-Power-Exhaust: 4 strokes, 2 revolutions, 1 power pulse. Otto cycle efficiency: ~25-30%"},
         {"depth": 2, "label": "Combustion Chamber", "desc": "Fuel-air mixture compressed 10:1, ignited by spark at 40,000V. Flame front propagates at 30 m/s"},
         {"depth": 3, "label": "Thermodynamics", "desc": "PV diagram: work = area inside the curve. Carnot efficiency limits what any heat engine can achieve"},
         {"depth": 4, "label": "Tribology", "desc": "Hydrodynamic oil film: 0.001mm thick between bearing and journal. No metal-to-metal contact at speed"},
         {"depth": 5, "label": "Molecular Combustion", "desc": "C₈H₁₈ + 12.5O₂ → 8CO₂ + 9H₂O + 5,471 kJ/mol. Every explosion is controlled chemistry"},
     ]},
    {"id": "brake_system", "name": "Brake System", "color": "#EF4444", "category": "Safety", "complexity": "Critical",
     "origin": "Hydraulic friction braking — converting kinetic energy to heat through Pascal's principle",
     "components": ["Master cylinder", "Calipers", "Rotors", "Pads", "Brake fluid (DOT 4)"],
     "system": "Hydraulic-Friction axis", "uses": "Brake service, pad replacement, fluid flush, ABS diagnostics",
     "dive_layers": [
         {"depth": 0, "label": "Brake Components", "desc": "Pedal → master cylinder → brake lines → calipers → pads → rotors. Your foot controls 2 tons at 70 mph"},
         {"depth": 1, "label": "Pascal's Law", "desc": "Pressure applied to confined fluid is transmitted equally. 4:1 mechanical advantage at the caliper"},
         {"depth": 2, "label": "Friction Interface", "desc": "Pad meets rotor at 600°F under braking. Semi-metallic compounds: steel fiber + ceramic + friction modifiers"},
         {"depth": 3, "label": "Heat Dissipation", "desc": "Vented rotors: 60 mph stop converts 500 kJ to heat. Brake fade = boiled fluid or glazed pads"},
         {"depth": 4, "label": "ABS Logic", "desc": "Wheel speed sensors detect lockup. ECU pulses caliper pressure 15 times/second — faster than any human"},
         {"depth": 5, "label": "Energy Conservation", "desc": "½mv² = Fd. All kinetic energy must go somewhere: heat in pads, or deformation in a crash. Physics has no sympathy"},
     ]},
    {"id": "electrical_harness", "name": "Electrical System", "color": "#FBBF24", "category": "Electronics", "complexity": "Intermediate",
     "origin": "Vehicle wiring — 2+ miles of copper connecting 100+ computers in a modern car",
     "components": ["ECU", "CAN bus", "Fuse box", "Alternator", "Battery (12V/48V)"],
     "system": "Electronic-Communication axis", "uses": "Diagnostics, wiring repair, module programming, sensor replacement",
     "dive_layers": [
         {"depth": 0, "label": "Wiring Harness", "desc": "Color-coded wires bundled in looms — the nervous system of the vehicle. One broken wire = one dead system"},
         {"depth": 1, "label": "CAN Bus Network", "desc": "Controller Area Network: 40+ modules sharing data at 500 kbps on twisted-pair wire. Invented by Bosch in 1983"},
         {"depth": 2, "label": "OBD-II Protocol", "desc": "Standardized diagnostic port: 16 pins, 5 protocols. DTCs (P0xxx) tell you what failed, freeze frame tells you when"},
         {"depth": 3, "label": "Sensor Physics", "desc": "O₂ sensor: zirconia generates voltage from exhaust oxygen differential. MAP sensor: piezoresistive silicon diaphragm"},
         {"depth": 4, "label": "PWM Control", "desc": "Pulse Width Modulation: rapid on/off cycling controls average voltage. 100 Hz switching drives motors, LEDs, injectors"},
         {"depth": 5, "label": "Semiconductor Logic", "desc": "MOSFET switches: gate voltage creates inversion layer in silicon. 0V = off, 5V = on. Billions per ECU"},
     ]},
]

AUTOMOTIVE_TOOLS = [
    {"id": "torque_wrench", "name": "Torque Wrench", "action_verb": "Torque", "description": "Calibrated wrench ensuring fasteners are tightened to manufacturer specifications", "technique": "Set to spec in ft-lbs or Nm. Pull smoothly — the click means 'stop.' Over-torquing stretches bolts; under-torquing lets them back out. Lug nuts: star pattern, 3 passes.", "color": "#3B82F6", "xp_per_action": 12, "icon_symbol": "T"},
    {"id": "obd_scanner", "name": "OBD-II Scanner", "action_verb": "Scan", "description": "Diagnostic tool reading fault codes and live data from the vehicle's computer", "technique": "Plug into the 16-pin port under the dash. Read DTCs first, then check freeze frame data. A code tells you what happened, not why — diagnosis starts after the scan.", "color": "#22C55E", "xp_per_action": 12, "icon_symbol": "O"},
    {"id": "oil_filter_wrench", "name": "Oil Filter Wrench", "action_verb": "Extract", "description": "Grip tool for removing spin-on oil filters without crushing them", "technique": "Loosen counter-clockwise. If stuck, drive a screwdriver through it for leverage (messy but effective). New filter: hand-tight plus 3/4 turn. Never over-tighten.", "color": "#F59E0B", "xp_per_action": 12, "icon_symbol": "F"},
    {"id": "auto_multimeter", "name": "Automotive DMM", "action_verb": "Diagnose", "description": "Digital multimeter rated for automotive voltage, current, and resistance testing", "technique": "Voltage drop test: the most powerful diagnostic technique. Measure across a connection under load — more than 0.1V means resistance. The problem is always at the connection.", "color": "#EF4444", "xp_per_action": 12, "icon_symbol": "M"},
    {"id": "jack_stands", "name": "Jack & Stands", "action_verb": "Lift", "description": "Hydraulic floor jack and safety stands for under-vehicle access", "technique": "Jack at the manufacturer's lift point ONLY. Place stands on frame rails. Shake the vehicle before going under. The jack is for lifting; the stands are for living.", "color": "#94A3B8", "xp_per_action": 12, "icon_symbol": "J"},
    {"id": "socket_set", "name": "Socket Set", "action_verb": "Fasten", "description": "Ratcheting drive sockets in 6-point and 12-point configurations", "technique": "6-point for loosening (more contact area). 12-point for tight spaces (30° increments). Extensions flex under load — support the socket with your other hand.", "color": "#A78BFA", "xp_per_action": 12, "icon_symbol": "S"},
    {"id": "brake_bleeder", "name": "Brake Bleeder", "action_verb": "Bleed", "description": "Pressure or vacuum tool for removing air from hydraulic brake lines", "technique": "Start at the wheel farthest from the master cylinder. Open bleeder, press pedal, close bleeder, release pedal. Repeat until fluid runs clear with no bubbles.", "color": "#EC4899", "xp_per_action": 12, "icon_symbol": "B"},
    {"id": "timing_light", "name": "Timing Light", "action_verb": "Time", "description": "Strobe light for checking ignition timing against crankshaft position", "technique": "Clip inductive pickup around #1 plug wire. Aim strobe at timing marks. Advance/retard to spec. On modern cars, timing is ECU-controlled — the light confirms, not adjusts.", "color": "#F97316", "xp_per_action": 12, "icon_symbol": "L"},
    {"id": "compression_tester", "name": "Compression Tester", "action_verb": "Test", "description": "Gauge measuring cylinder compression to assess engine health", "technique": "Remove all spark plugs. Disable ignition. Thread gauge into cylinder. Crank 4-5 revolutions. All cylinders should be within 10% of each other. Low compression = rings, valves, or head gasket.", "color": "#2DD4BF", "xp_per_action": 12, "icon_symbol": "C"},
]

NUTRITION_MATERIALS = [
    {"id": "whole_foods", "name": "Whole Foods", "color": "#22C55E", "category": "Foundation", "complexity": "Foundation",
     "origin": "Unprocessed, nutrient-dense foods — the way humans ate for 200,000 years before 1950",
     "components": ["Vegetables", "Fruits", "Whole grains", "Legumes", "Nuts/seeds"],
     "system": "Nutritional-Metabolic axis", "uses": "Daily nutrition, disease prevention, energy optimization, gut health",
     "dive_layers": [
         {"depth": 0, "label": "The Plate", "desc": "Half vegetables, quarter protein, quarter whole grain — the simplest nutrition advice that actually works"},
         {"depth": 1, "label": "Macronutrient Balance", "desc": "Carbs (45-65%), Protein (10-35%), Fat (20-35%). Ratios matter less than quality — a nut is not a doughnut"},
         {"depth": 2, "label": "Phytochemicals", "desc": "8,000+ plant compounds: lycopene, sulforaphane, quercetin — not vitamins, but potent cell protectors"},
         {"depth": 3, "label": "Fiber Fermentation", "desc": "Gut bacteria ferment soluble fiber into short-chain fatty acids (butyrate) — fuel for colonocytes and immune regulation"},
         {"depth": 4, "label": "Nutrient Synergy", "desc": "Iron + vitamin C = 6x absorption. Turmeric + piperine = 2,000% bioavailability. Foods work in concert, not isolation"},
         {"depth": 5, "label": "Metabolic Signaling", "desc": "mTOR, AMPK, sirtuins — nutrient sensors that toggle between growth and repair modes. Fasting activates cellular cleanup (autophagy)"},
     ]},
    {"id": "fermented", "name": "Fermented Foods", "color": "#A78BFA", "category": "Gut Health", "complexity": "Intermediate",
     "origin": "Microbial transformation — 10,000 years of humans partnering with bacteria and yeast",
     "components": ["Sauerkraut", "Kimchi", "Kefir", "Miso", "Kombucha"],
     "system": "Microbiome-Immune axis", "uses": "Probiotic intake, digestive health, immune support, food preservation",
     "dive_layers": [
         {"depth": 0, "label": "Fermented Product", "desc": "Tangy, alive, bubbling — billions of beneficial organisms in every tablespoon"},
         {"depth": 1, "label": "Lacto-Fermentation", "desc": "Lactobacillus converts sugars to lactic acid. pH drops from 6.5 to 3.5 — preserving food and creating probiotics simultaneously"},
         {"depth": 2, "label": "Microbiome Diversity", "desc": "Fermented food consumers have 10,000+ unique microbial taxa. Diversity = resilience in the gut ecosystem"},
         {"depth": 3, "label": "Immune Crosstalk", "desc": "70% of immune cells live in GALT (gut-associated lymphoid tissue). Probiotics train immune tolerance through dendritic cell signaling"},
         {"depth": 4, "label": "Postbiotics", "desc": "Dead bacteria still beneficial: cell wall components (lipoteichoic acid) modulate inflammation independent of viability"},
         {"depth": 5, "label": "Quorum Sensing", "desc": "Bacteria communicate via autoinducer molecules. At critical density, they collectively activate biofilm, virulence, or cooperation genes"},
     ]},
    {"id": "superfoods", "name": "Superfoods", "color": "#F59E0B", "category": "Optimization", "complexity": "Intermediate",
     "origin": "Nutrient-dense foods with extraordinary concentrations of vitamins, minerals, and antioxidants",
     "components": ["Spirulina", "Cacao", "Turmeric", "Moringa", "Açaí"],
     "system": "Antioxidant-Longevity axis", "uses": "Supplementation, smoothie building, anti-inflammatory protocols, athletic recovery",
     "dive_layers": [
         {"depth": 0, "label": "Superfood Selection", "desc": "Deeply pigmented, minimally processed, traditionally revered — color intensity correlates with antioxidant density"},
         {"depth": 1, "label": "ORAC Value", "desc": "Oxygen Radical Absorbance Capacity: cacao = 95,500 μmol TE/100g. For comparison, blueberries = 4,669"},
         {"depth": 2, "label": "Polyphenol Action", "desc": "Flavonoids, stilbenes, lignans cross the blood-brain barrier. Reduce neuroinflammation. Improve cerebral blood flow"},
         {"depth": 3, "label": "Curcumin Pathway", "desc": "Curcumin inhibits NF-κB (master inflammation switch), COX-2, and MMP-9 simultaneously — multi-target pharmacology"},
         {"depth": 4, "label": "Xenohormesis", "desc": "Plant stress compounds (resveratrol from UV-stressed grapes) activate human stress-response pathways (sirtuins). Borrowed resilience"},
         {"depth": 5, "label": "Mitochondrial Biogenesis", "desc": "PGC-1α activation by polyphenols triggers new mitochondria production — more cellular power plants from food compounds"},
     ]},
]

NUTRITION_TOOLS = [
    {"id": "macro_tracker", "name": "Macro Tracker", "action_verb": "Track", "description": "Caloric and macronutrient logging for nutritional awareness", "technique": "Log before you eat, not after. Focus on protein first (0.7-1g per lb bodyweight), then fill with vegetables and whole carbs. Tracking is a skill — accuracy improves with practice.", "color": "#22C55E", "xp_per_action": 12, "icon_symbol": "T"},
    {"id": "ferment_vessel", "name": "Fermentation Vessel", "action_verb": "Culture", "description": "Airlock-sealed container for lacto-fermentation and kombucha brewing", "technique": "Salt brine for vegetables (2-3%). Submerge completely — anything above the brine spoils. Room temperature for 3-14 days. Taste daily. Your palate is the best pH meter.", "color": "#A78BFA", "xp_per_action": 12, "icon_symbol": "F"},
    {"id": "dehydrator", "name": "Food Dehydrator", "action_verb": "Preserve", "description": "Low-temperature dryer for creating raw snacks, herbs, and preserved foods", "technique": "Slice uniformly (1/4 inch). 115°F for 'raw' preservation, 135°F for jerky. Rotate trays halfway through. Done when leathery, not crunchy (fruits) or brittle (herbs).", "color": "#F59E0B", "xp_per_action": 12, "icon_symbol": "D"},
    {"id": "sprouting_jar", "name": "Sprouting Jar", "action_verb": "Sprout", "description": "Mesh-lidded jar for germinating seeds into living nutrition", "technique": "Soak seeds overnight. Drain and rinse 2x daily. Keep inverted at 45° for drainage. Harvest when tails are 1-2x seed length. Sprouts have 10-100x the nutrients of dry seeds.", "color": "#3B82F6", "xp_per_action": 12, "icon_symbol": "S"},
    {"id": "ph_meter", "name": "pH Meter", "action_verb": "Measure", "description": "Digital probe for monitoring fermentation acidity and soil health", "technique": "Calibrate with buffer solutions before each use. Fermentation target: pH 3.5-4.0 for vegetables, 2.5-3.5 for kombucha. Below 4.6 prevents botulism — the critical safety line.", "color": "#EF4444", "xp_per_action": 12, "icon_symbol": "P"},
    {"id": "refractometer", "name": "Brix Refractometer", "action_verb": "Analyze", "description": "Optical instrument measuring sugar content in fruits and juices", "technique": "Place 2 drops on the prism. Close the lid. Look through the eyepiece. The blue-white boundary line reads in °Brix. Higher Brix = more minerals, better flavor, longer shelf life.", "color": "#94A3B8", "xp_per_action": 12, "icon_symbol": "B"},
    {"id": "mortar_pestle", "name": "Mortar & Pestle", "action_verb": "Grind", "description": "Ancient stone tool for crushing spices, herbs, and medicinal preparations", "technique": "Coarse to fine: crack first with downward strikes, then grind in circles. Stone mortars absorb flavor over decades — season yours. Freshly ground spices have 10x the volatile oils.", "color": "#EC4899", "xp_per_action": 12, "icon_symbol": "M"},
    {"id": "kitchen_scale", "name": "Digital Scale", "action_verb": "Weigh", "description": "Precision gram scale for accurate portioning and recipe consistency", "technique": "Tare between ingredients. Weigh in grams (more precise than ounces). Baking is chemistry — 10g extra flour changes texture. Weighing eliminates the #1 source of recipe failure.", "color": "#F97316", "xp_per_action": 12, "icon_symbol": "W"},
    {"id": "food_journal", "name": "Food Journal", "action_verb": "Reflect", "description": "Mindful eating diary connecting food choices to energy, mood, and symptoms", "technique": "Log food AND how you feel 2 hours later. Patterns emerge in 2 weeks: 'dairy → brain fog, greens → energy.' The journal makes the invisible visible.", "color": "#D4AF37", "xp_per_action": 12, "icon_symbol": "J"},
]

MEDITATION_MATERIALS = [
    {"id": "silence", "name": "Inner Silence", "color": "#6366F1", "category": "Foundation", "complexity": "Foundation",
     "origin": "The practice of pure awareness — the space between thoughts where consciousness rests",
     "components": ["Posture", "Stillness", "Non-attachment", "Present moment", "Witness awareness"],
     "system": "Consciousness-Awareness axis", "uses": "Stress reduction, mental clarity, spiritual development, emotional regulation",
     "dive_layers": [
         {"depth": 0, "label": "Seated Practice", "desc": "Spine tall, eyes soft, jaw relaxed. The posture is the practice — alert without effort, relaxed without collapse"},
         {"depth": 1, "label": "Thought Observation", "desc": "Thoughts arise like clouds. You are the sky, not the weather. Noticing a thought IS the practice succeeding"},
         {"depth": 2, "label": "Default Mode Network", "desc": "DMN activity decreases with meditation. The 'monkey mind' is a measurable neural network — and it can be quieted"},
         {"depth": 3, "label": "Gamma Synchrony", "desc": "Long-term meditators show 25x gamma wave activity (25-100 Hz) — neural coherence across the entire cortex"},
         {"depth": 4, "label": "Cortical Thickening", "desc": "8 weeks of mindfulness measurably thickens the prefrontal cortex and shrinks the amygdala. The brain literally reshapes"},
         {"depth": 5, "label": "Non-Dual Awareness", "desc": "Subject-object collapse: the observer and the observed merge. Neuroscience calls it 'minimal phenomenal experience'"},
     ]},
    {"id": "breath", "name": "Breath Awareness", "color": "#22C55E", "category": "Technique", "complexity": "Foundation",
     "origin": "Pranayama — conscious breathing as the bridge between body and mind",
     "components": ["Diaphragmatic breath", "4-7-8 pattern", "Box breathing", "Alternate nostril", "Breath retention"],
     "system": "Autonomic-Respiratory axis", "uses": "Anxiety relief, sleep improvement, performance, vagal tone enhancement",
     "dive_layers": [
         {"depth": 0, "label": "Conscious Breath", "desc": "Notice the breath without changing it. Where do you feel it? Nostrils, chest, belly? This is the anchor"},
         {"depth": 1, "label": "Autonomic Shift", "desc": "Extended exhale activates parasympathetic nervous system. 4-count inhale, 7-count hold, 8-count exhale = instant calm"},
         {"depth": 2, "label": "Vagal Tone", "desc": "Slow breathing stimulates the vagus nerve. High vagal tone = better emotional regulation, lower inflammation, faster recovery"},
         {"depth": 3, "label": "CO₂ Tolerance", "desc": "Breath retention builds chemoreceptor tolerance. Higher CO₂ tolerance = lower anxiety response. The chemistry of calm"},
         {"depth": 4, "label": "Nitric Oxide", "desc": "Nasal breathing releases NO from paranasal sinuses — vasodilator, bronchodilator, antimicrobial. Mouth breathing bypasses this"},
         {"depth": 5, "label": "Respiratory Sinus Arrhythmia", "desc": "Heart rate increases on inhale, decreases on exhale. Coherent breathing at 5.5 breaths/min maximizes heart rate variability"},
     ]},
    {"id": "visualization", "name": "Visualization", "color": "#F59E0B", "category": "Advanced", "complexity": "Intermediate",
     "origin": "Mental imagery practice — the brain cannot distinguish vividly imagined experience from reality",
     "components": ["Guided imagery", "Body of light", "Nature sanctuary", "Future self", "Healing visualization"],
     "system": "Cognitive-Imaginative axis", "uses": "Goal achievement, pain management, sports performance, creative problem-solving",
     "dive_layers": [
         {"depth": 0, "label": "Inner Landscape", "desc": "Close eyes. Build the scene: a forest, a temple, a horizon. Add sensory detail until you can smell the air"},
         {"depth": 1, "label": "Motor Imagery", "desc": "Imagining a movement activates 80% of the same neural circuits as performing it. Mental rehearsal IS physical practice"},
         {"depth": 2, "label": "Reticular Activation", "desc": "RAS filters 11 million bits/second down to 50. Visualization programs the RAS to notice opportunities aligned with your image"},
         {"depth": 3, "label": "Psychoneuroimmunology", "desc": "Visualizing immune cells attacking pathogens measurably increases NK cell activity. The mind heals the body"},
         {"depth": 4, "label": "Theta State", "desc": "4-8 Hz theta waves during deep visualization — the same frequency as REM sleep and hypnagogic creativity"},
         {"depth": 5, "label": "Quantum Observer Effect", "desc": "Consciousness collapses the wavefunction. At the deepest level, observation and reality are inseparable — the meditator's ultimate insight"},
     ]},
]

MEDITATION_TOOLS = [
    {"id": "focus_anchor", "name": "Focus Anchor", "action_verb": "Focus", "description": "Single-pointed concentration on a chosen object: breath, flame, or mantra", "technique": "Choose one anchor. When attention wanders (it will), gently return. Each return IS a repetition — like a bicep curl for attention. 10 returns = 10 reps of focus training.", "color": "#6366F1", "xp_per_action": 12, "icon_symbol": "F"},
    {"id": "breath_counter", "name": "Breath Counter", "action_verb": "Count", "description": "Counting breaths to stabilize wandering attention", "technique": "Count exhales from 1 to 10. If you lose count, start over without judgment. Reaching 10 consistently takes weeks. The practice is the restart, not the number.", "color": "#22C55E", "xp_per_action": 12, "icon_symbol": "C"},
    {"id": "body_scan", "name": "Body Scan", "action_verb": "Scan", "description": "Systematic attention through every body region for somatic awareness", "technique": "Start at the crown. Move down slowly: forehead, eyes, jaw, throat, shoulders... Notice sensation without changing it. Tension you notice dissolves. Tension you ignore persists.", "color": "#3B82F6", "xp_per_action": 12, "icon_symbol": "B"},
    {"id": "mantra_tool", "name": "Mantra Repetition", "action_verb": "Chant", "description": "Sacred syllable or phrase repeated to quiet the discursive mind", "technique": "Choose a resonant word: 'Om,' 'Shalom,' 'Peace.' Synchronize with breath. Let it become automatic — the mantra meditates you. In time, it continues in the background of awareness.", "color": "#A78BFA", "xp_per_action": 12, "icon_symbol": "M"},
    {"id": "loving_kindness", "name": "Loving-Kindness", "action_verb": "Radiate", "description": "Metta bhavana — generating compassion for self, loved ones, and all beings", "technique": "'May I be happy. May I be healthy. May I be safe.' Extend to a loved one, a neutral person, a difficult person, then all beings. The order matters — you can't give what you don't have.", "color": "#EC4899", "xp_per_action": 12, "icon_symbol": "L"},
    {"id": "walking_practice", "name": "Walking Meditation", "action_verb": "Walk", "description": "Slow, deliberate walking with full attention on each step", "technique": "10-pace path. Lift, move, place. Feel the heel, ball, toes. At the end, pause, turn mindfully, return. Speed is inversely proportional to depth. Slower = deeper.", "color": "#F97316", "xp_per_action": 12, "icon_symbol": "W"},
    {"id": "sound_bath", "name": "Sound Immersion", "action_verb": "Listen", "description": "Deep listening to singing bowls, gongs, or ambient tones for vibrational healing", "technique": "Lie down. Close eyes. Let sound wash over you without analyzing. Tibetan bowls produce binaural beating that entrains brainwaves toward theta. Surrender to the frequency.", "color": "#F59E0B", "xp_per_action": 12, "icon_symbol": "S"},
    {"id": "med_journal", "name": "Meditation Journal", "action_verb": "Record", "description": "Post-sit documentation of insights, challenges, and subtle shifts", "technique": "Write immediately after sitting. Note: duration, technique, quality of attention, any insights or resistance. Patterns emerge over months that are invisible in the moment.", "color": "#94A3B8", "xp_per_action": 12, "icon_symbol": "J"},
    {"id": "gratitude", "name": "Gratitude Practice", "action_verb": "Appreciate", "description": "Structured appreciation training rewiring the brain's negativity bias", "technique": "Three specifics, not generics. Not 'I'm grateful for my family' but 'I'm grateful my daughter laughed at breakfast today.' Specificity activates the reward circuitry.", "color": "#D4AF37", "xp_per_action": 12, "icon_symbol": "G"},
]

# Register V62.0 modules
MODULES["welding"] = {"materials": WELDING_MATERIALS, "tools": WELDING_TOOLS, "mat_key": "materials", "mat_id_key": "material_id", "skill": "Welding_Skill"}
MODULES["automotive"] = {"materials": AUTOMOTIVE_MATERIALS, "tools": AUTOMOTIVE_TOOLS, "mat_key": "systems", "mat_id_key": "system_id", "skill": "Automotive_Skill"}
MODULES["nutrition"] = {"materials": NUTRITION_MATERIALS, "tools": NUTRITION_TOOLS, "mat_key": "foods", "mat_id_key": "food_id", "skill": "Nutrition_Skill"}
MODULES["meditation"] = {"materials": MEDITATION_MATERIALS, "tools": MEDITATION_TOOLS, "mat_key": "practices", "mat_id_key": "practice_id", "skill": "Meditation_Skill"}

# V63.0 — Ancestor Migration: Masonry & Carpentry join the dynamic registry
MODULES["masonry"] = {"materials": MASONRY_STONES, "tools": MASONRY_TOOLS, "mat_key": "stones", "mat_id_key": "stone_id", "skill": "Masonry_Skill"}
MODULES["carpentry"] = {"materials": CARPENTRY_WOODS, "tools": CARPENTRY_TOOLS, "mat_key": "woods", "mat_id_key": "wood_id", "skill": "Carpentry_Skill"}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# V62.0 — MASTER REGISTRY ENDPOINT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WORKSHOP_REGISTRY = {
    "welding": {"title": "Welding Workshop", "subtitle": "Trade Pillar — Tap the metal to dive into metallurgy. Select a tool to fuse.", "icon": "Flame", "accentColor": "#6B7280", "skillKey": "Welding_Skill", "matLabel": "Metal", "domain": "Trade & Craft"},
    "automotive": {"title": "Automotive Workshop", "subtitle": "Trade Pillar — Tap the system to dive into engineering. Select a tool to diagnose.", "icon": "Car", "accentColor": "#6B7280", "skillKey": "Automotive_Skill", "matLabel": "System", "domain": "Trade & Craft"},
    "nutrition": {"title": "Nutrition Workshop", "subtitle": "Healing Arts Cell — Tap the food group to dive into biochemistry. Select a tool to nourish.", "icon": "Apple", "accentColor": "#22C55E", "skillKey": "Nutrition_Skill", "matLabel": "Food", "domain": "Healing Arts"},
    "meditation": {"title": "Meditation Workshop", "subtitle": "Mind & Spirit Cell — Tap the practice to dive into consciousness. Select a tool to awaken.", "icon": "Brain", "accentColor": "#6366F1", "skillKey": "Meditation_Skill", "matLabel": "Practice", "domain": "Mind & Spirit"},
    "electrical": {"title": "Electrical Workshop", "subtitle": "Trade Pillar — Tap the conductor to dive into electron flow.", "icon": "Zap", "accentColor": "#B87333", "skillKey": "Electrical_Skill", "matLabel": "Conductor", "domain": "Trade & Craft"},
    "plumbing": {"title": "Plumbing Workshop", "subtitle": "Trade Pillar — Tap the pipe to dive into fluid dynamics.", "icon": "Droplets", "accentColor": "#3B82F6", "skillKey": "Plumbing_Skill", "matLabel": "Pipe", "domain": "Trade & Craft"},
    "landscaping": {"title": "Landscaping Workshop", "subtitle": "Trade Pillar — Tap the soil to dive into earth science.", "icon": "Leaf", "accentColor": "#22C55E", "skillKey": "Landscaping_Skill", "matLabel": "Material", "domain": "Trade & Craft"},
    "nursing": {"title": "Nursing Workshop", "subtitle": "Healing Arts Cell — Tap the scenario to dive into physiology.", "icon": "Heart", "accentColor": "#EF4444", "skillKey": "Nursing_Skill", "matLabel": "Scenario", "domain": "Healing Arts"},
    "bible": {"title": "Bible Study Workshop", "subtitle": "Sacred Knowledge Cell — Tap the scripture to dive into original language.", "icon": "BookOpen", "accentColor": "#D4AF37", "skillKey": "Bible_Study_Skill", "matLabel": "Scripture", "domain": "Sacred Knowledge"},
    "childcare": {"title": "Child Care Workshop", "subtitle": "Social Pillar — Tap the scenario to dive into child development.", "icon": "Baby", "accentColor": "#F472B6", "skillKey": "Childcare_Skill", "matLabel": "Scenario", "domain": "Healing Arts"},
    "eldercare": {"title": "Elderly Care Workshop", "subtitle": "Social Pillar — Tap the scenario to dive into gerontology.", "icon": "HandHeart", "accentColor": "#A78BFA", "skillKey": "Eldercare_Skill", "matLabel": "Scenario", "domain": "Healing Arts"},
    "masonry": {"title": "Masonry Workshop", "subtitle": "Trade Pillar — Tap the stone to dive into mineral structure.", "icon": "Hammer", "accentColor": "#94A3B8", "skillKey": "Masonry_Skill", "matLabel": "Stone", "domain": "Trade & Craft"},
    "carpentry": {"title": "Carpentry Workshop", "subtitle": "Trade Pillar — Tap the wood to dive into grain structure.", "icon": "Axe", "accentColor": "#92400E", "skillKey": "Carpentry_Skill", "matLabel": "Wood", "domain": "Trade & Craft"},
    "hvac": {"title": "HVAC Workshop", "subtitle": "Trade Pillar — Tap the system to dive into thermodynamics.", "icon": "Wind", "accentColor": "#06B6D4", "skillKey": "HVAC_Skill", "matLabel": "System", "domain": "Trade & Craft"},
    "robotics": {"title": "Robotics Workshop", "subtitle": "Science Pillar — Tap the component to dive into mechatronics.", "icon": "Cpu", "accentColor": "#8B5CF6", "skillKey": "Robotics_Skill", "matLabel": "Component", "domain": "Science & Physics"},
    "first_aid": {"title": "First Aid Workshop", "subtitle": "Healing Arts Cell — Tap the emergency to dive into trauma response.", "icon": "Cross", "accentColor": "#EF4444", "skillKey": "FirstAid_Skill", "matLabel": "Emergency", "domain": "Healing Arts"},
    "hermetics": {"title": "Hermetics Workshop", "subtitle": "Sacred Knowledge Cell — Tap the principle to dive into universal law.", "icon": "Eye", "accentColor": "#D4AF37", "skillKey": "Hermetics_Skill", "matLabel": "Principle", "domain": "Sacred Knowledge"},
}



# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# V63.0 — HVAC, Robotics, First Aid, Hermetics
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HVAC_MATERIALS = [
    {"id": "ductwork", "name": "Sheet Metal Duct", "color": "#94A3B8", "category": "Distribution", "complexity": "Foundation",
     "origin": "Galvanized steel air distribution — the lungs of every building", "composition": ["Galvanized steel", "S-lock seams", "Duct sealant"],
     "system": "Air distribution", "uses": "Heating, cooling, ventilation, air quality",
     "dive_layers": [
         {"depth": 0, "label": "Installed Run", "desc": "Rectangular or round galvanized duct connecting air handler to registers throughout the building"},
         {"depth": 1, "label": "Airflow Design", "desc": "Static pressure, CFM calculation, duct sizing via ACCA Manual D — the math of moving air"},
         {"depth": 2, "label": "Heat Transfer", "desc": "Conduction through duct walls, radiation from surfaces, convection within the airstream — three modes simultaneously"},
         {"depth": 3, "label": "Fluid Dynamics", "desc": "Reynolds number determines laminar vs turbulent flow. Turbulence increases pressure drop but improves mixing"},
         {"depth": 4, "label": "Psychrometrics", "desc": "Temperature + humidity plotted on the psychrometric chart — the single most powerful HVAC design tool"},
         {"depth": 5, "label": "Molecular Kinetics", "desc": "Air molecules at 70°F move at 1,100 ft/s (speed of sound). Temperature IS average kinetic energy"},
     ]},
    {"id": "refrigerant", "name": "R-410A Refrigerant", "color": "#06B6D4", "category": "Refrigeration", "complexity": "Advanced",
     "origin": "Hydrofluorocarbon blend — the working fluid that moves heat against nature's gradient", "composition": ["R-32 (50%)", "R-125 (50%)"],
     "system": "Vapor compression cycle", "uses": "Air conditioning, heat pumps, refrigeration",
     "dive_layers": [
         {"depth": 0, "label": "Refrigerant Cycle", "desc": "Liquid absorbs heat (evaporator) → gas is compressed → gas rejects heat (condenser) → liquid again. Repeat"},
         {"depth": 1, "label": "Phase Change", "desc": "R-410A boils at -61°F at atmospheric pressure. In the evaporator, controlled pressure raises boiling point to 40°F"},
         {"depth": 2, "label": "Superheat/Subcool", "desc": "Superheat ensures only gas enters compressor. Subcooling ensures only liquid enters TXV. The diagnostic duo"},
         {"depth": 3, "label": "Compressor Work", "desc": "Isentropic compression: PV^γ = constant. Scroll compressor achieves 70% isentropic efficiency"},
         {"depth": 4, "label": "COP Analysis", "desc": "Coefficient of Performance = Qcool/Wcompressor. Heat pumps move 3-4x more energy than they consume"},
         {"depth": 5, "label": "Molecular Dipole", "desc": "R-32 (CH₂F₂) polar molecule with high latent heat. GWP=675 driving transition to R-454B (GWP=466)"},
     ]},
    {"id": "thermostat", "name": "Smart Thermostat", "color": "#F59E0B", "category": "Controls", "complexity": "Intermediate",
     "origin": "Intelligent climate control — the brain that optimizes comfort and energy", "composition": ["Temperature sensor", "Humidity sensor", "Occupancy sensor", "Wi-Fi module"],
     "system": "Control systems", "uses": "Temperature regulation, energy savings, zoning, scheduling",
     "dive_layers": [
         {"depth": 0, "label": "Wall Unit", "desc": "Touch screen displaying temperature, humidity, schedule, and energy usage — the user interface of comfort"},
         {"depth": 1, "label": "PID Control", "desc": "Proportional-Integral-Derivative: the three-term algorithm that prevents overshoot and oscillation"},
         {"depth": 2, "label": "Anticipatory Logic", "desc": "Machine learning predicts thermal mass response — starts heating 15 minutes early to hit setpoint on time"},
         {"depth": 3, "label": "Thermistor Physics", "desc": "NTC thermistor: resistance drops exponentially with temperature. Steinhart-Hart equation converts R to °F"},
         {"depth": 4, "label": "Feedback Systems", "desc": "Negative feedback: if temperature > setpoint, reduce heating. Positive feedback causes runaway — the thermostat prevents chaos"},
         {"depth": 5, "label": "Information Theory", "desc": "Shannon entropy of sensor data: how much information each reading carries about the building's thermal state"},
     ]},
]

HVAC_TOOLS = [
    {"id": "manifold_gauges", "name": "Manifold Gauges", "action_verb": "Diagnose", "description": "High/low pressure gauges for reading refrigerant system pressures", "technique": "Blue = low side (suction), Red = high side (discharge). Connect with system running. Compare readings to PT chart for the refrigerant type.", "color": "#06B6D4", "xp_per_action": 12, "icon_symbol": "G"},
    {"id": "vacuum_pump", "name": "Vacuum Pump", "action_verb": "Evacuate", "description": "Deep vacuum pump for removing moisture and non-condensables from refrigerant systems", "technique": "Pull to 500 microns minimum. Hold for 10 minutes. If vacuum rises, there's a leak. Moisture at 500 microns boils at -40°F — total dehydration.", "color": "#3B82F6", "xp_per_action": 12, "icon_symbol": "V"},
    {"id": "leak_detector", "name": "Leak Detector", "action_verb": "Detect", "description": "Electronic sniffer for finding refrigerant leaks in sealed systems", "technique": "Start at the top — refrigerant is heavier than air. Move the probe slowly (1 inch/second) around every joint, valve, and fitting. Soap bubbles confirm what the sniffer finds.", "color": "#EF4444", "xp_per_action": 12, "icon_symbol": "L"},
    {"id": "anemometer", "name": "Anemometer", "action_verb": "Measure", "description": "Air velocity meter for balancing duct airflow at registers", "technique": "Measure at each supply register. Total CFM must match equipment rating. Adjust dampers to balance: every room should get its designed airflow.", "color": "#22C55E", "xp_per_action": 12, "icon_symbol": "A"},
    {"id": "flaring_tool", "name": "Flaring Tool", "action_verb": "Flare", "description": "Precision tool for creating 45° flare connections on copper tubing", "technique": "Cut square, deburr inside, slip nut on FIRST. Clamp tube flush with die block. Lubricate cone. Tighten until flare is smooth and even — one of the most leak-prone joints if done wrong.", "color": "#F59E0B", "xp_per_action": 12, "icon_symbol": "F"},
    {"id": "combustion_analyzer", "name": "Combustion Analyzer", "action_verb": "Analyze", "description": "Flue gas analyzer measuring efficiency and safety of fuel-burning equipment", "technique": "Insert probe in flue. Read CO, CO₂, O₂, stack temperature. CO above 100 ppm = cracked heat exchanger = immediate shutdown. Safety first.", "color": "#94A3B8", "xp_per_action": 12, "icon_symbol": "C"},
    {"id": "recovery_machine", "name": "Recovery Machine", "action_verb": "Recover", "description": "EPA-required machine for capturing refrigerant before system service", "technique": "Connect to liquid and vapor ports. Recover to DOT-approved tank. EPA Section 608 requires recovery before opening any system. Venting is a federal crime.", "color": "#A78BFA", "xp_per_action": 12, "icon_symbol": "R"},
    {"id": "duct_blaster", "name": "Duct Blaster", "action_verb": "Pressurize", "description": "Calibrated fan for measuring duct leakage in CFM25", "technique": "Seal all registers. Attach fan to one opening. Pressurize to 25 Pa. Read leakage. Industry standard: <4% of total system CFM. Leaky ducts waste 20-30% of energy.", "color": "#EC4899", "xp_per_action": 12, "icon_symbol": "D"},
    {"id": "brazing_torch", "name": "Brazing Torch", "action_verb": "Braze", "description": "Oxy-acetylene or air-acetylene torch for silver brazing copper joints", "technique": "Nitrogen purge while brazing prevents internal oxidation. Heat the fitting, not the tube. Alloy flows toward heat. BCuP-6 (Sil-Fos) for copper-to-copper needs no flux.", "color": "#F97316", "xp_per_action": 12, "icon_symbol": "B"},
]

ROBOTICS_MATERIALS = [
    {"id": "servo", "name": "Servo Motor", "color": "#8B5CF6", "category": "Actuation", "complexity": "Foundation",
     "origin": "Closed-loop actuator — precise angular control through feedback", "composition": ["DC motor", "Gear reduction", "Potentiometer", "Control circuit"],
     "system": "Electromechanical", "uses": "Robotic joints, pan/tilt, grippers, walking robots",
     "dive_layers": [
         {"depth": 0, "label": "Servo Unit", "desc": "3-wire connection: power, ground, signal. PWM pulse width (1-2ms) controls angle (0-180°)"},
         {"depth": 1, "label": "Feedback Loop", "desc": "Potentiometer reads current angle. Error = desired - actual. PID controller drives motor to minimize error"},
         {"depth": 2, "label": "Gear Train", "desc": "Spur or planetary reduction: 100:1 ratio multiplies torque while dividing speed. Backlash = positional uncertainty"},
         {"depth": 3, "label": "PWM Encoding", "desc": "50 Hz signal: 1.5ms pulse = center. Resolution: 0.01ms = 1.8° movement. Digital precision from analog signal"},
         {"depth": 4, "label": "Motor Physics", "desc": "Lorentz force: F = BIL. Current-carrying conductor in magnetic field produces force proportional to current"},
         {"depth": 5, "label": "Back-EMF", "desc": "Spinning motor generates voltage opposing the supply (Lenz's law). At no-load speed, back-EMF ≈ supply voltage"},
     ]},
    {"id": "microcontroller", "name": "Microcontroller", "color": "#3B82F6", "category": "Computing", "complexity": "Intermediate",
     "origin": "Single-chip computer — the brain of every embedded system and robot", "composition": ["ARM Cortex-M core", "Flash memory", "GPIO pins", "ADC/DAC", "Communication buses"],
     "system": "Digital computing", "uses": "Sensor reading, motor control, decision-making, communication",
     "dive_layers": [
         {"depth": 0, "label": "Dev Board", "desc": "Arduino/ESP32/STM32 — pins, power, USB. Upload code, read sensors, drive actuators. The universal robot brain"},
         {"depth": 1, "label": "GPIO Control", "desc": "General Purpose I/O: each pin can be input (read sensor) or output (drive LED/motor). Digital or analog"},
         {"depth": 2, "label": "Interrupt Handling", "desc": "Hardware interrupts: sensor triggers ISR (Interrupt Service Routine) within microseconds. Real-time response"},
         {"depth": 3, "label": "ADC Conversion", "desc": "10-bit ADC: 0-3.3V mapped to 0-1023. Resolution = 3.2mV per step. Successive approximation register architecture"},
         {"depth": 4, "label": "Clock Architecture", "desc": "Crystal oscillator → PLL → system clock. 240 MHz = 4.17 ns per cycle. Every instruction takes discrete clock cycles"},
         {"depth": 5, "label": "Transistor Gates", "desc": "CMOS: complementary NMOS/PMOS pairs. Each logic gate = 2-6 transistors. Billions of gates per chip"},
     ]},
    {"id": "sensor_array", "name": "Sensor Array", "color": "#22C55E", "category": "Perception", "complexity": "Intermediate",
     "origin": "Multi-modal sensing — giving robots the ability to perceive their environment", "composition": ["Ultrasonic", "IR proximity", "IMU (6-axis)", "Camera", "Encoders"],
     "system": "Perception pipeline", "uses": "Obstacle avoidance, mapping, localization, object recognition",
     "dive_layers": [
         {"depth": 0, "label": "Sensor Suite", "desc": "Distance, rotation, acceleration, light — each sensor adds a dimension to the robot's world model"},
         {"depth": 1, "label": "Sensor Fusion", "desc": "Kalman filter: combine noisy sensor data into optimal state estimate. GPS + IMU + encoders = precise localization"},
         {"depth": 2, "label": "Signal Processing", "desc": "Low-pass filter removes noise. FFT reveals frequency components. Nyquist theorem: sample at 2x max frequency"},
         {"depth": 3, "label": "Transduction", "desc": "Physical phenomenon → electrical signal. Piezoelectric (pressure→voltage), photoelectric (light→current)"},
         {"depth": 4, "label": "Noise Floor", "desc": "Johnson-Nyquist noise: thermal electrons create voltage fluctuations. Signal-to-noise ratio determines sensor quality"},
         {"depth": 5, "label": "Quantum Sensing", "desc": "Atomic clocks, SQUID magnetometers, quantum gyroscopes — approaching the Heisenberg uncertainty limit"},
     ]},
]

ROBOTICS_TOOLS = [
    {"id": "soldering_iron", "name": "Soldering Iron", "action_verb": "Solder", "description": "Temperature-controlled iron for joining electronic components to PCBs", "technique": "Tin the tip. Heat the pad AND the lead simultaneously for 2 seconds. Touch solder to the joint, not the iron. A good joint is shiny and concave.", "color": "#F59E0B", "xp_per_action": 12, "icon_symbol": "S"},
    {"id": "oscilloscope", "name": "Oscilloscope", "action_verb": "Probe", "description": "Time-domain signal analyzer for debugging electronic circuits", "technique": "Set timebase to expected signal period. Set voltage scale to expected amplitude. Trigger on rising edge. The scope shows you what the multimeter only summarizes.", "color": "#3B82F6", "xp_per_action": 12, "icon_symbol": "O"},
    {"id": "logic_analyzer", "name": "Logic Analyzer", "action_verb": "Decode", "description": "Digital protocol decoder for I2C, SPI, UART, and CAN bus signals", "technique": "Connect probes to data lines. Set protocol decoder. Trigger on start condition. You can now READ the conversation between chips — invaluable for debugging.", "color": "#8B5CF6", "xp_per_action": 12, "icon_symbol": "L"},
    {"id": "cad_software", "name": "3D CAD", "action_verb": "Design", "description": "Parametric 3D modeling for robot chassis and mechanism design", "technique": "Design for manufacturing: wall thickness, draft angles, tolerance stack-up. Simulate kinematics before cutting metal. If it doesn't work in CAD, it won't work in reality.", "color": "#22C55E", "xp_per_action": 12, "icon_symbol": "D"},
    {"id": "motor_driver", "name": "Motor Driver", "action_verb": "Drive", "description": "H-bridge or stepper driver for controlling motor speed and direction", "technique": "L298N for DC motors, A4988 for steppers. PWM frequency above audible range (>20kHz) eliminates motor whine. Current limiting prevents driver burnout.", "color": "#EF4444", "xp_per_action": 12, "icon_symbol": "M"},
    {"id": "wire_crimper", "name": "Dupont Crimper", "action_verb": "Crimp", "description": "Precision crimping tool for making custom wiring harnesses", "technique": "Strip 2mm of insulation. Place wire in crimp pin. Squeeze once — the pin folds around bare wire AND insulation. Tug test. Custom cables are cheaper and more reliable than jumper wires.", "color": "#94A3B8", "xp_per_action": 12, "icon_symbol": "C"},
    {"id": "pid_tuner", "name": "PID Tuner", "action_verb": "Tune", "description": "Software tool for optimizing proportional-integral-derivative control loops", "technique": "Ziegler-Nichols: increase P until oscillation (Ku). Set P=0.6Ku, I=Ti/2, D=Ti/8. Fine-tune from there. Every robot joint needs its own PID tuning.", "color": "#A78BFA", "xp_per_action": 12, "icon_symbol": "P"},
    {"id": "3d_printer", "name": "3D Printer", "action_verb": "Print", "description": "FDM printer for rapid prototyping of robot parts and enclosures", "technique": "PLA for prototypes, PETG for functional parts, TPU for flexible. Layer height = resolution vs speed tradeoff. Orient for strength: layers are weak in tension along Z axis.", "color": "#EC4899", "xp_per_action": 12, "icon_symbol": "R"},
    {"id": "firmware_debug", "name": "Debug Console", "action_verb": "Debug", "description": "Serial monitor and debugger for stepping through embedded code", "technique": "Serial.println() is your best friend. Add timestamps. Log state machine transitions. When the robot 'does nothing,' the serial output tells you WHERE it got stuck.", "color": "#F97316", "xp_per_action": 12, "icon_symbol": "B"},
]

FIRSTAID_MATERIALS = [
    {"id": "wound_emergency", "name": "Wound & Bleeding", "color": "#EF4444", "category": "Trauma", "complexity": "Critical",
     "origin": "Hemorrhage control — the #1 preventable cause of death in trauma", "components": ["Direct pressure", "Tourniquet", "Wound packing", "Hemostatic agents"],
     "system": "Hemostatic-Vascular axis", "uses": "Cuts, lacerations, amputations, penetrating injuries",
     "dive_layers": [
         {"depth": 0, "label": "Scene Assessment", "desc": "BSI (body substance isolation) first. Scene safe? Mechanism of injury? Number of patients? Call 911."},
         {"depth": 1, "label": "Hemorrhage Control", "desc": "Direct pressure → elevation → pressure dressing → tourniquet. Escalate in 30-second intervals if bleeding doesn't stop"},
         {"depth": 2, "label": "Coagulation Cascade", "desc": "Intrinsic + extrinsic pathways converge at Factor X → thrombin → fibrin mesh. The body's emergency repair system"},
         {"depth": 3, "label": "Shock Physiology", "desc": "Class I-IV hemorrhagic shock: >40% blood loss = Class IV. Tachycardia, hypotension, altered consciousness"},
         {"depth": 4, "label": "Platelet Activation", "desc": "Collagen exposure → GP Ib/IX/V binding → shape change → granule release → aggregation. 2-5 minutes to primary plug"},
         {"depth": 5, "label": "Hemostatic Agents", "desc": "Kaolin (QuikClot) activates Factor XII. Chitosan (Celox) binds red blood cells independently of clotting factors"},
     ]},
    {"id": "cpr", "name": "CPR & AED", "color": "#3B82F6", "category": "Cardiac", "complexity": "Critical",
     "origin": "Cardiopulmonary resuscitation — buying time until the heart can be restarted", "components": ["Chest compressions", "Rescue breaths", "AED application", "Recovery position"],
     "system": "Cardiovascular-Respiratory axis", "uses": "Cardiac arrest, drowning, choking, anaphylaxis",
     "dive_layers": [
         {"depth": 0, "label": "Response Check", "desc": "Tap and shout. No response? Call 911, get AED. Check breathing for 10 seconds. No pulse? Start CPR."},
         {"depth": 1, "label": "Compression Quality", "desc": "2 inches deep, 100-120/min, full recoil. 30:2 ratio. Minimize interruptions. Push hard, push fast, let up completely"},
         {"depth": 2, "label": "Coronary Perfusion", "desc": "CPR generates 25-33% of normal cardiac output. Coronary perfusion pressure must exceed 15 mmHg for ROSC"},
         {"depth": 3, "label": "Defibrillation", "desc": "AED analyzes rhythm: VF/pVT = shockable. Asystole/PEA = not shockable. The AED decides — you push the button"},
         {"depth": 4, "label": "Electrical Conduction", "desc": "200J biphasic shock depolarizes all myocardial cells simultaneously, allowing SA node to resume as pacemaker"},
         {"depth": 5, "label": "Cellular Ischemia", "desc": "Brain neurons die in 4-6 minutes without oxygen. CPR extends the window. Every minute without CPR = 10% survival decrease"},
     ]},
    {"id": "shock", "name": "Shock Management", "color": "#F59E0B", "category": "Systemic", "complexity": "Advanced",
     "origin": "Systemic hypoperfusion — when the circulatory system fails to meet cellular oxygen demand", "components": ["Recognition", "Positioning", "Temperature control", "Fluid support"],
     "system": "Circulatory-Metabolic axis", "uses": "Trauma, allergic reactions, burns, dehydration, sepsis",
     "dive_layers": [
         {"depth": 0, "label": "Recognition", "desc": "Pale, cool, clammy skin. Rapid weak pulse. Altered mental status. Thirst. Anxiety. These are the early warning signs"},
         {"depth": 1, "label": "Shock Types", "desc": "Hypovolemic (volume loss), Cardiogenic (pump failure), Distributive (vessel dilation), Obstructive (flow blocked)"},
         {"depth": 2, "label": "Compensatory Phase", "desc": "Baroreceptors detect pressure drop → sympathetic activation → vasoconstriction + tachycardia. The body fights back"},
         {"depth": 3, "label": "Cellular Hypoxia", "desc": "Without O₂, cells switch to anaerobic metabolism. Lactic acid accumulates. pH drops. Enzymes denature. Cells die."},
         {"depth": 4, "label": "Catecholamine Surge", "desc": "Epinephrine and norepinephrine: α₁ (vasoconstriction), β₁ (heart rate/contractility), β₂ (bronchodilation). The fight-or-die hormones"},
         {"depth": 5, "label": "Irreversible Cascade", "desc": "Lysosomal enzyme release, DIC (disseminated intravascular coagulation), multi-organ failure. The point of no return"},
     ]},
]

FIRSTAID_TOOLS = [
    {"id": "tourniquet", "name": "Tourniquet (CAT)", "action_verb": "Apply", "description": "Combat Application Tourniquet for life-threatening extremity hemorrhage", "technique": "High and tight on the limb. Twist windlass until bleeding stops. Note the time. Do NOT loosen once applied. Painful? Yes. Life-saving? Absolutely.", "color": "#EF4444", "xp_per_action": 12, "icon_symbol": "T"},
    {"id": "aed", "name": "AED", "action_verb": "Shock", "description": "Automated External Defibrillator for cardiac arrest rhythm analysis and treatment", "technique": "Power on. Follow voice prompts. Bare the chest. Apply pads (upper right, lower left). Stand clear during analysis. Press shock if advised. Resume CPR immediately.", "color": "#3B82F6", "xp_per_action": 12, "icon_symbol": "A"},
    {"id": "bandage", "name": "Pressure Bandage", "action_verb": "Bandage", "description": "Elastic bandage with built-in pressure bar for wound compression", "technique": "Place pad directly over wound. Wrap firmly (not cutting off circulation). Secure tail. If blood soaks through, add MORE on top — never remove the first layer.", "color": "#22C55E", "xp_per_action": 12, "icon_symbol": "B"},
    {"id": "splint", "name": "SAM Splint", "action_verb": "Splint", "description": "Moldable aluminum splint for immobilizing suspected fractures", "technique": "Fold into C-curve for rigidity. Pad with gauze. Immobilize the joint above and below the injury. Check CSM (circulation, sensation, movement) after applying.", "color": "#F59E0B", "xp_per_action": 12, "icon_symbol": "S"},
    {"id": "epipen", "name": "EpiPen", "action_verb": "Inject", "description": "Auto-injector delivering epinephrine for severe allergic reactions (anaphylaxis)", "technique": "Remove safety cap. Press firmly against outer thigh (through clothing is OK). Hold 10 seconds. Massage site. Call 911 — effects wear off in 15-20 minutes.", "color": "#A78BFA", "xp_per_action": 12, "icon_symbol": "E"},
    {"id": "cervical_collar", "name": "C-Spine Control", "action_verb": "Stabilize", "description": "Manual in-line stabilization for suspected spinal injury", "technique": "Do NOT move the patient. Hold the head in neutral alignment. 'What happened? Where does it hurt? Can you wiggle your toes?' Movement = potential paralysis.", "color": "#94A3B8", "xp_per_action": 12, "icon_symbol": "C"},
    {"id": "chest_seal", "name": "Chest Seal", "action_verb": "Seal", "description": "Occlusive dressing for open chest wounds (sucking chest wound)", "technique": "Apply vented seal over the wound during exhalation. If no commercial seal: plastic wrap taped on 3 sides. The vent lets air OUT but not IN — prevents tension pneumothorax.", "color": "#EC4899", "xp_per_action": 12, "icon_symbol": "X"},
    {"id": "pulse_check", "name": "Vital Signs Check", "action_verb": "Assess", "description": "Rapid assessment of breathing, pulse, and consciousness level", "technique": "AVPU: Alert, Voice responsive, Pain responsive, Unresponsive. Radial pulse = SBP >80. Carotid pulse = SBP >60. No pulse = CPR. Reassess every 5 minutes.", "color": "#F97316", "xp_per_action": 12, "icon_symbol": "V"},
    {"id": "recovery_pos", "name": "Recovery Position", "action_verb": "Position", "description": "Lateral recumbent position for unconscious breathing patients", "technique": "Roll onto side. Lower arm extended forward. Upper knee bent at 90°. Tilt head back slightly. This prevents aspiration if they vomit. Monitor breathing continuously.", "color": "#D4AF37", "xp_per_action": 12, "icon_symbol": "R"},
]

HERMETICS_MATERIALS = [
    {"id": "emerald_tablet", "name": "Emerald Tablet", "color": "#22C55E", "category": "Foundation", "complexity": "Advanced",
     "origin": "Tabula Smaragdina — the foundational text of Hermetic philosophy, attributed to Hermes Trismegistus", "components": ["As above, so below", "The One Thing", "Separation and conjunction", "Ascent and descent"],
     "literary_form": "Alchemical aphorism", "uses": "Philosophical framework, meditation object, alchemical practice",
     "dive_layers": [
         {"depth": 0, "label": "The Text", "desc": "'That which is above is like that which is below' — the master key to correspondence between macrocosm and microcosm"},
         {"depth": 1, "label": "Hermetic Context", "desc": "Attributed to Hermes Trismegistus (thrice-great). Greco-Egyptian synthesis: Thoth meets Hermes. Wisdom tradition spanning millennia"},
         {"depth": 2, "label": "Alchemical Operation", "desc": "Solve et Coagula: dissolve the fixed, fix the volatile. The Tablet describes the Great Work in coded language"},
         {"depth": 3, "label": "Correspondence Principle", "desc": "Microcosm mirrors macrocosm: the atom mirrors the solar system, the cell mirrors the organism, the self mirrors the cosmos"},
         {"depth": 4, "label": "Prima Materia", "desc": "The 'One Thing' from which all arises — the undifferentiated potential. In modern terms: the quantum vacuum, the unified field"},
         {"depth": 5, "label": "Universal Vibration", "desc": "All is vibration at different frequencies. Matter is slow light. Consciousness is fast matter. The Tablet encodes this unity"},
     ]},
    {"id": "kybalion", "name": "The Kybalion", "color": "#D4AF37", "category": "Principles", "complexity": "Intermediate",
     "origin": "Seven Hermetic Principles — the operating manual for understanding universal law", "components": ["Mentalism", "Correspondence", "Vibration", "Polarity", "Rhythm", "Cause/Effect", "Gender"],
     "literary_form": "Philosophical treatise", "uses": "Mental transmutation, understanding duality, mastering rhythm, conscious creation",
     "dive_layers": [
         {"depth": 0, "label": "The Seven Principles", "desc": "Mentalism, Correspondence, Vibration, Polarity, Rhythm, Cause and Effect, Gender — the seven keys to the Temple"},
         {"depth": 1, "label": "Principle of Mentalism", "desc": "'The All is Mind; the Universe is Mental.' Consciousness is not produced BY matter — matter is produced BY consciousness"},
         {"depth": 2, "label": "Principle of Vibration", "desc": "'Nothing rests; everything moves; everything vibrates.' The difference between lead and gold is vibrational frequency"},
         {"depth": 3, "label": "Principle of Polarity", "desc": "'Everything is dual; everything has poles.' Hot/cold, love/hate, light/dark are degrees of the SAME thing"},
         {"depth": 4, "label": "Mental Transmutation", "desc": "The art of changing mental states: raise your vibration by will. You don't eliminate hate — you transmute it to love along the same pole"},
         {"depth": 5, "label": "The All in All", "desc": "'While All is in THE ALL, THE ALL is in All.' Holographic universe: each part contains the whole. The fractal nature of existence"},
     ]},
    {"id": "alchemy", "name": "Alchemical Process", "color": "#8B5CF6", "category": "Transformation", "complexity": "Advanced",
     "origin": "The Great Work — the systematic transmutation of base nature into spiritual gold", "components": ["Nigredo (blackening)", "Albedo (whitening)", "Citrinitas (yellowing)", "Rubedo (reddening)"],
     "literary_form": "Symbolic process", "uses": "Inner transformation, shadow work, spiritual development, creative process",
     "dive_layers": [
         {"depth": 0, "label": "The Laboratory", "desc": "The alchemist's workspace — simultaneously a physical lab and a metaphor for the inner world of consciousness"},
         {"depth": 1, "label": "Nigredo", "desc": "The blackening: putrefaction, decomposition, dark night of the soul. The necessary death of the old self before rebirth"},
         {"depth": 2, "label": "Albedo", "desc": "The whitening: purification, washing, the dawn after darkness. The soul is cleansed of impurities. The mirror becomes clear"},
         {"depth": 3, "label": "Citrinitas", "desc": "The yellowing: the solar dawn of wisdom. Integration of shadow and light. The yellowing of the white — intellect awakens"},
         {"depth": 4, "label": "Rubedo", "desc": "The reddening: the Philosopher's Stone achieved. Union of opposites. The Self realized. The gold that was always there, revealed"},
         {"depth": 5, "label": "Unus Mundus", "desc": "Jung's 'One World': psyche and matter are two aspects of one reality. The alchemist's final insight: the gold is you"},
     ]},
]

HERMETICS_TOOLS = [
    {"id": "contemplation", "name": "Contemplation", "action_verb": "Contemplate", "description": "Deep reflective practice on a Hermetic principle or symbol", "technique": "Choose one principle. Sit with it for 20 minutes. Don't analyze — let it reveal itself. The principle teaches differently each time because YOU are different each time.", "color": "#D4AF37", "xp_per_action": 12, "icon_symbol": "C"},
    {"id": "correspondence_map", "name": "Correspondence Map", "action_verb": "Map", "description": "Charting the 'as above, so below' connections between domains", "technique": "Pick any two scales: atom and galaxy, cell and city, breath and tide. Find the structural parallels. This is not metaphor — it is pattern recognition across scale.", "color": "#22C55E", "xp_per_action": 12, "icon_symbol": "M"},
    {"id": "polarity_practice", "name": "Polarity Practice", "action_verb": "Transmute", "description": "Consciously raising vibration along a polar spectrum", "technique": "Identify the negative pole you're experiencing (fear, anger, sadness). Find the SAME pole's positive end (courage, passion, tenderness). Move your attention along the scale.", "color": "#6366F1", "xp_per_action": 12, "icon_symbol": "P"},
    {"id": "rhythm_awareness", "name": "Rhythm Awareness", "action_verb": "Observe", "description": "Recognizing and working with natural cycles and pendulum swings", "technique": "Track your energy cycles: morning/evening, weekly, seasonal. The pendulum swings both ways. Mastery is not stopping the swing — it is choosing where to stand on the arc.", "color": "#F59E0B", "xp_per_action": 12, "icon_symbol": "R"},
    {"id": "mental_alchemy", "name": "Mental Alchemy", "action_verb": "Transform", "description": "The practice of consciously changing mental and emotional states", "technique": "Observe your current state without judgment. Name it. Now, recall a time you felt the OPPOSITE. Hold that memory with your whole body. The state shifts. This is transmutation.", "color": "#EF4444", "xp_per_action": 12, "icon_symbol": "A"},
    {"id": "symbol_study", "name": "Symbol Meditation", "action_verb": "Decode", "description": "Deep study of alchemical and Hermetic symbols as consciousness tools", "technique": "Ouroboros, Caduceus, Philosopher's Stone, Hexagram. Each symbol is a compressed teaching. Gaze at it daily for a week. New meanings emerge as your understanding deepens.", "color": "#A78BFA", "xp_per_action": 12, "icon_symbol": "S"},
    {"id": "journal_hermes", "name": "Hermetic Journal", "action_verb": "Record", "description": "Documenting insights, synchronicities, and transmutation experiences", "technique": "Record: date, principle studied, insight received, life parallels noticed. Over months, the journal becomes a map of your transformation — your personal Emerald Tablet.", "color": "#94A3B8", "xp_per_action": 12, "icon_symbol": "J"},
    {"id": "cause_effect", "name": "Causal Analysis", "action_verb": "Trace", "description": "Tracing chains of cause and effect to understand life patterns", "technique": "Choose a current situation. Ask 'What caused this?' five times (5 Whys). You'll reach a root cause — usually a belief or decision, not an event. Change the cause, change the effect.", "color": "#3B82F6", "xp_per_action": 12, "icon_symbol": "T"},
    {"id": "gender_balance", "name": "Gender Balance", "action_verb": "Balance", "description": "Integrating active (masculine) and receptive (feminine) principles within", "technique": "Not about biological sex — about creative polarity. When stuck: are you too active (forcing) or too passive (waiting)? The Great Work requires both the will to act and the wisdom to receive.", "color": "#EC4899", "xp_per_action": 12, "icon_symbol": "B"},
]

# Register V63.0 modules
MODULES["hvac"] = {"materials": HVAC_MATERIALS, "tools": HVAC_TOOLS, "mat_key": "systems", "mat_id_key": "system_id", "skill": "HVAC_Skill"}
MODULES["robotics"] = {"materials": ROBOTICS_MATERIALS, "tools": ROBOTICS_TOOLS, "mat_key": "components", "mat_id_key": "component_id", "skill": "Robotics_Skill"}
MODULES["first_aid"] = {"materials": FIRSTAID_MATERIALS, "tools": FIRSTAID_TOOLS, "mat_key": "emergencies", "mat_id_key": "emergency_id", "skill": "FirstAid_Skill"}
MODULES["hermetics"] = {"materials": HERMETICS_MATERIALS, "tools": HERMETICS_TOOLS, "mat_key": "principles", "mat_id_key": "principle_id", "skill": "Hermetics_Skill"}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# V63.0 — INTENT-BASED SEARCH TAGS + SEARCH ENDPOINT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# V64.0 STRIKE 2: FULL PARITY for HVAC, Robotics, First Aid, Hermetics
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HVAC_MATERIALS.extend([
    {"id": "heat_pump", "name": "Heat Pump System", "color": "#F97316", "category": "Heating/Cooling", "complexity": "Advanced",
     "origin": "Reversible vapor compression — one machine for heating AND cooling", "composition": ["Reversing valve", "Indoor coil", "Outdoor coil", "Compressor"],
     "system": "Thermodynamic cycle", "uses": "Year-round comfort, energy efficiency, electrification",
     "dive_layers": [
         {"depth": 0, "label": "Split System", "desc": "Indoor air handler + outdoor condenser connected by refrigerant lines — moves heat in either direction"},
         {"depth": 1, "label": "Reversing Valve", "desc": "4-way valve swaps hot/cold coils: cooling mode = outdoor rejection, heating mode = outdoor absorption"},
         {"depth": 2, "label": "COP in Heating", "desc": "COP of 3-4 in heating: for every 1 kW of electricity, moves 3-4 kW of heat from cold outdoor air into your home"},
         {"depth": 3, "label": "Defrost Cycle", "desc": "Below 35°F, ice forms on outdoor coil. Reversal briefly melts it. The system heats itself to keep heating you"},
         {"depth": 4, "label": "Carnot Limit", "desc": "COPmax = TH/(TH-TL). As outdoor temp drops, efficiency drops. At -10°F, backup heat required"},
         {"depth": 5, "label": "Entropy Flow", "desc": "Heat naturally flows hot→cold (2nd Law). Heat pump forces cold→hot by adding work. You are paying to reverse entropy"},
     ]},
    {"id": "boiler", "name": "Hydronic Boiler", "color": "#EF4444", "category": "Heating", "complexity": "Advanced",
     "origin": "Hot water heating — radiant comfort through heated water circulated in piping", "composition": ["Heat exchanger", "Circulator pump", "Expansion tank", "Air separator"],
     "system": "Hydronic loop", "uses": "Radiant floor, baseboard, fan coil, snow melt, pool heating",
     "dive_layers": [
         {"depth": 0, "label": "Boiler Room", "desc": "Wall-hung condensing boiler: 95% AFUE. Stainless steel heat exchanger extracts maximum BTU from flue gas"},
         {"depth": 1, "label": "Condensing Technology", "desc": "Return water below 130°F → flue gas condenses → latent heat captured. 10-15% more efficient than non-condensing"},
         {"depth": 2, "label": "Radiant Physics", "desc": "Warm floor radiates infrared to objects/people. Mean Radiant Temperature drives comfort more than air temperature"},
         {"depth": 3, "label": "Pump Curves", "desc": "System curve (resistance) intersects pump curve (flow/head). The crossing point IS the operating condition"},
         {"depth": 4, "label": "Heat Transfer Coefficients", "desc": "Convection (h=5-25 W/m²K air), forced convection (h=50-20,000 water). Water moves 3,500x more heat than air per volume"},
         {"depth": 5, "label": "Latent Heat", "desc": "Water vapor in flue gas: 970 BTU/lb released during condensation. The hidden energy that non-condensing boilers waste"},
     ]},
    {"id": "mini_split", "name": "Ductless Mini-Split", "color": "#22C55E", "category": "Zoned Comfort", "complexity": "Intermediate",
     "origin": "Inverter-driven ductless system — individual room control without ductwork", "composition": ["Inverter compressor", "Wall cassette", "Line set", "Wireless remote"],
     "system": "Variable refrigerant flow", "uses": "Room additions, old homes, server rooms, garages, multi-zone",
     "dive_layers": [
         {"depth": 0, "label": "Wall Cassette", "desc": "Sleek indoor unit with washable filter. Whisper-quiet: 19 dB. Each room gets its own thermostat"},
         {"depth": 1, "label": "Inverter Technology", "desc": "Variable-speed compressor: runs at 10-100% capacity. No on/off cycling = tighter temp control and 30% energy savings"},
         {"depth": 2, "label": "Refrigerant Metering", "desc": "Electronic expansion valve adjusts superheat in real-time. Better efficiency than fixed orifice across all conditions"},
         {"depth": 3, "label": "SEER2 Rating", "desc": "Seasonal Energy Efficiency Ratio: BTU cooling per watt-hour. Top mini-splits hit SEER2 42 — 3x better than window units"},
         {"depth": 4, "label": "DC Motor Physics", "desc": "Brushless DC motor in inverter compressor: permanent magnet rotor, electronically commutated. 95% electrical efficiency"},
         {"depth": 5, "label": "Exergy Analysis", "desc": "Available work destroyed = T₀ × entropy generated. The mini-split minimizes irreversibility by matching capacity to load"},
     ]},
])

ROBOTICS_MATERIALS.extend([
    {"id": "lidar", "name": "LiDAR Scanner", "color": "#EF4444", "category": "Perception", "complexity": "Advanced",
     "origin": "Light Detection and Ranging — laser-based 3D spatial mapping", "composition": ["Pulsed laser", "Rotating mirror", "Photodetector", "Time counter"],
     "system": "Point cloud generation", "uses": "SLAM, obstacle avoidance, autonomous navigation, 3D mapping",
     "dive_layers": [
         {"depth": 0, "label": "Spinning Scanner", "desc": "360° rotating laser fires 300,000 pulses/second, building a real-time 3D point cloud of the environment"},
         {"depth": 1, "label": "Time-of-Flight", "desc": "Laser pulse leaves, reflects off object, returns. Distance = (speed_of_light × time) / 2. Resolution: ±2cm at 100m"},
         {"depth": 2, "label": "SLAM Algorithm", "desc": "Simultaneous Localization And Mapping: builds a map while tracking its own position within that map. The chicken-and-egg of robotics"},
         {"depth": 3, "label": "Point Cloud Processing", "desc": "Millions of XYZ points → voxel grid → ground plane extraction → object clustering → bounding boxes. Raw data → understanding"},
         {"depth": 4, "label": "Photon Detection", "desc": "Avalanche photodiode: single photon triggers electron cascade. Gain of 10⁶. Detects the faintest reflections"},
         {"depth": 5, "label": "Quantum Noise Limit", "desc": "Shot noise from photon statistics sets fundamental detection limit. √N photons = minimum uncertainty in measurement"},
     ]},
    {"id": "stepper", "name": "Stepper Motor", "color": "#F59E0B", "category": "Actuation", "complexity": "Foundation",
     "origin": "Open-loop positioning — precise step-by-step rotation without feedback", "composition": ["Stator coils (bipolar)", "Permanent magnet rotor", "1.8° step angle", "200 steps/revolution"],
     "system": "Discrete position control", "uses": "3D printers, CNC, camera gimbals, pick-and-place machines",
     "dive_layers": [
         {"depth": 0, "label": "Motor Unit", "desc": "NEMA 17 frame: 4 wires, 200 steps per revolution. Each step = 1.8° of precise, repeatable rotation"},
         {"depth": 1, "label": "Microstepping", "desc": "Driver subdivides each step into 16-256 microsteps via current shaping. 200 × 256 = 51,200 positions per revolution"},
         {"depth": 2, "label": "Torque Curve", "desc": "Holding torque highest at standstill. Torque drops with speed due to back-EMF and inductance limiting current rise time"},
         {"depth": 3, "label": "Magnetic Detent", "desc": "Permanent magnet rotor aligns with stator teeth. Each detent position = one full step. The physics of digital positioning"},
         {"depth": 4, "label": "Current Chopping", "desc": "Driver switches current on/off at 20-50 kHz to maintain constant current despite changing back-EMF. Active current regulation"},
         {"depth": 5, "label": "Reluctance Torque", "desc": "Torque = -dW/dθ. Magnetic energy varies with rotor angle. Minimum energy = stable position. Maximum gradient = peak torque"},
     ]},
    {"id": "end_effector", "name": "Robot End Effector", "color": "#22C55E", "category": "Manipulation", "complexity": "Intermediate",
     "origin": "The robot's 'hand' — the tool that makes contact with the physical world", "composition": ["Gripper fingers", "Force sensor", "Pneumatic actuator", "Compliance mechanism"],
     "system": "Grasping and manipulation", "uses": "Pick-and-place, assembly, material handling, surgical robotics",
     "dive_layers": [
         {"depth": 0, "label": "Gripper Assembly", "desc": "Parallel-jaw, soft-finger, or vacuum: each type matches a class of objects. The right gripper makes the robot useful"},
         {"depth": 1, "label": "Grasp Planning", "desc": "Force closure: contact points must resist all external wrenches. Minimum 3 contacts for planar, 7 for spatial stability"},
         {"depth": 2, "label": "Force Control", "desc": "Impedance control: the gripper behaves like a virtual spring-damper. Soft enough to hold an egg, firm enough to turn a bolt"},
         {"depth": 3, "label": "Tactile Sensing", "desc": "Piezoresistive arrays at fingertips: 16×16 taxel grid detecting 0.01N force changes. The robot feels what it touches"},
         {"depth": 4, "label": "Compliance Design", "desc": "Remote Center Compliance (RCC): passive mechanical device allowing peg-in-hole insertion despite 1mm misalignment"},
         {"depth": 5, "label": "Contact Mechanics", "desc": "Hertz contact theory: elastic deformation at fingertip-object interface. Contact area grows as F^(2/3). Friction = μ × F_normal"},
     ]},
])

FIRSTAID_MATERIALS.extend([
    {"id": "burns", "name": "Burn Treatment", "color": "#F97316", "category": "Thermal", "complexity": "Intermediate",
     "origin": "Thermal injury management — cooling, classifying, and covering burned tissue",
     "components": ["Cool water", "Sterile dressing", "Pain management", "Fluid monitoring"],
     "system": "Integumentary-Thermoregulatory axis", "uses": "Kitchen burns, sunburn, chemical exposure, electrical burns",
     "dive_layers": [
         {"depth": 0, "label": "Initial Response", "desc": "Stop the burning process. Cool with running water for 20 minutes. Do NOT use ice, butter, or toothpaste"},
         {"depth": 1, "label": "Burn Classification", "desc": "Superficial (red), Partial-thickness (blisters), Full-thickness (white/charred). Rule of 9s estimates body surface area"},
         {"depth": 2, "label": "Fluid Shift", "desc": "Burns >20% BSA cause massive capillary leak. Parkland formula: 4ml × kg × %BSA in first 24 hours"},
         {"depth": 3, "label": "Inflammatory Cascade", "desc": "Histamine, bradykinin, prostaglandins flood the wound. Vasodilation + increased permeability = edema"},
         {"depth": 4, "label": "Protein Denaturation", "desc": "At 60°C, collagen triple helix unwinds. At 70°C, cell membranes fail. Burns are molecular-level destruction"},
         {"depth": 5, "label": "Zone of Stasis", "desc": "Jackson's burn model: zone of coagulation (dead), zone of stasis (salvageable), zone of hyperemia (will recover). Treatment targets the stasis zone"},
     ]},
    {"id": "choking", "name": "Choking / Heimlich", "color": "#8B5CF6", "category": "Airway", "complexity": "Critical",
     "origin": "Foreign body airway obstruction — the technique that saves 50,000 lives per year",
     "components": ["Recognition", "Back blows", "Abdominal thrusts", "Chest thrusts (infants/pregnant)"],
     "system": "Respiratory-Mechanical axis", "uses": "Restaurant emergencies, pediatric choking, elderly aspiration",
     "dive_layers": [
         {"depth": 0, "label": "Recognition", "desc": "Universal choking sign: hands to throat. Can they speak? If yes = mild obstruction (encourage coughing). If no = severe = act NOW"},
         {"depth": 1, "label": "Abdominal Thrust", "desc": "Stand behind, fist above navel, grasp with other hand, thrust inward-upward. The diaphragm compresses, forcing air up and object out"},
         {"depth": 2, "label": "Physics of Expulsion", "desc": "Abdominal thrust creates 2-4 PSI surge in airway. This equals ~30 L/min airflow — enough to dislodge most objects"},
         {"depth": 3, "label": "Airway Anatomy", "desc": "Epiglottis, vocal cords, trachea → carina → bronchi. Objects lodge most often at the right main bronchus (wider, more vertical)"},
         {"depth": 4, "label": "Vagal Response", "desc": "Laryngospasm: protective reflex seals the airway. Can persist even after obstruction is cleared. Positive pressure ventilation may be needed"},
         {"depth": 5, "label": "Hypoxic Cascade", "desc": "SpO₂ drops 3-5% per minute without ventilation. At 4 minutes: brain damage begins. At 6: irreversible. Time is everything"},
     ]},
    {"id": "allergic", "name": "Allergic Reaction", "color": "#EC4899", "category": "Immune", "complexity": "Advanced",
     "origin": "Anaphylaxis recognition and treatment — the immune system attacking itself",
     "components": ["Epinephrine", "Antihistamines", "Airway management", "Position of comfort"],
     "system": "Immune-Vascular axis", "uses": "Bee stings, food allergies, drug reactions, latex sensitivity",
     "dive_layers": [
         {"depth": 0, "label": "Symptom Recognition", "desc": "Hives + swelling + difficulty breathing + dropping BP = anaphylaxis. Two or more body systems involved = give epi"},
         {"depth": 1, "label": "EpiPen Protocol", "desc": "Outer thigh, through clothing if needed. Hold 10 seconds. Massage site. Effects last 15-20 minutes. Call 911 — biphasic reaction possible"},
         {"depth": 2, "label": "Mast Cell Degranulation", "desc": "IgE antibodies crosslink on mast cells → histamine release → vasodilation, bronchospasm, increased permeability. The allergic cascade"},
         {"depth": 3, "label": "Epinephrine Mechanism", "desc": "α₁: vasoconstriction (raises BP). β₁: increases heart rate/contractility. β₂: bronchodilation. One drug, three life-saving actions"},
         {"depth": 4, "label": "Biphasic Reaction", "desc": "20% of anaphylaxis cases have a second wave 1-72 hours later. This is why observation is mandatory after epinephrine"},
         {"depth": 5, "label": "IgE Sensitization", "desc": "First exposure: immune system creates IgE antibodies. Second exposure: pre-formed IgE triggers instant response. The immune memory that kills"},
     ]},
])

HERMETICS_MATERIALS.extend([
    {"id": "sacred_geometry", "name": "Sacred Geometry", "color": "#6366F1", "category": "Mathematics", "complexity": "Intermediate",
     "origin": "The geometric patterns underlying all creation — the architecture of the universe made visible",
     "components": ["Flower of Life", "Metatron's Cube", "Fibonacci spiral", "Platonic solids", "Vesica Piscis"],
     "literary_form": "Visual mathematics", "uses": "Meditation objects, architectural design, artistic composition, cosmological understanding",
     "dive_layers": [
         {"depth": 0, "label": "The Patterns", "desc": "Circles within circles, spirals within spirals — the same geometry appears in galaxies, hurricanes, sunflowers, and DNA"},
         {"depth": 1, "label": "Flower of Life", "desc": "19 interlocking circles: the matrix from which all Platonic solids can be derived. Found in temples from Egypt to China"},
         {"depth": 2, "label": "Golden Ratio", "desc": "φ = 1.618033... Self-similar proportion found in nautilus shells, DNA helix, leaf arrangement (phyllotaxis), and the Parthenon"},
         {"depth": 3, "label": "Platonic Solids", "desc": "Only 5 regular polyhedra exist: tetrahedron, cube, octahedron, dodecahedron, icosahedron. Mapped to elements since Plato"},
         {"depth": 4, "label": "Fractal Self-Similarity", "desc": "Mandelbrot set: infinite complexity from z → z² + c. The boundary between order and chaos is infinitely detailed"},
         {"depth": 5, "label": "Toroidal Field", "desc": "The torus: the only shape that folds into itself. The geometry of magnetic fields, blood flow, and — some say — consciousness"},
     ]},
    {"id": "tarot_arcana", "name": "Tarot Major Arcana", "color": "#EC4899", "category": "Symbolism", "complexity": "Intermediate",
     "origin": "22 archetypal images mapping the soul's journey from Fool to World",
     "components": ["The Fool (0)", "The Magician (I)", "The High Priestess (II)", "The Wheel (X)", "The World (XXI)"],
     "literary_form": "Symbolic narrative", "uses": "Self-reflection, decision-making, archetypal psychology, creative inspiration",
     "dive_layers": [
         {"depth": 0, "label": "The Card", "desc": "22 Major Arcana: each card is a doorway into a universal human experience. Not fortune-telling — mirror-holding"},
         {"depth": 1, "label": "The Fool's Journey", "desc": "Card 0 → XXI: the archetypal hero's journey. Innocence → mastery → surrender → completion. Every human walks this path"},
         {"depth": 2, "label": "Jungian Archetypes", "desc": "Magician = conscious will. High Priestess = unconscious knowing. Tower = ego dissolution. These are the faces of the psyche"},
         {"depth": 3, "label": "Hermetic Correspondence", "desc": "Each card maps to a Hebrew letter, an astrological sign, and a path on the Tree of Life. Three systems in one symbol"},
         {"depth": 4, "label": "Active Imagination", "desc": "Jung's technique: dialogue with the archetypal image. The card speaks if you listen. The unconscious has information the ego lacks"},
         {"depth": 5, "label": "Synchronicity", "desc": "Jung: meaningful coincidence without causal connection. The 'right' card appearing is not randomness — it is acausal orderedness"},
     ]},
    {"id": "astral", "name": "Astral Projection", "color": "#38BDF8", "category": "Consciousness", "complexity": "Advanced",
     "origin": "Out-of-body experience — the ancient practice of separating awareness from the physical form",
     "components": ["Relaxation", "Vibrational state", "Separation technique", "Navigation", "Return"],
     "literary_form": "Experiential practice", "uses": "Consciousness exploration, lucid dreaming bridge, spiritual development",
     "dive_layers": [
         {"depth": 0, "label": "The Practice", "desc": "Deep relaxation → hypnagogic state → vibrational sensation → separation of awareness from body. Reported across all cultures"},
         {"depth": 1, "label": "Monroe Technique", "desc": "Robert Monroe's method: reach the vibrational state, then 'roll out' or 'float up.' Maintain calm — fear snaps you back instantly"},
         {"depth": 2, "label": "Sleep Paralysis Gateway", "desc": "REM atonia: the body paralyzes during sleep to prevent acting out dreams. Conscious awareness during atonia = the doorway"},
         {"depth": 3, "label": "Theta-Gamma Burst", "desc": "EEG shows theta waves (4-8 Hz) with gamma bursts (40+ Hz) during reported OBEs — the brain signature of non-local awareness"},
         {"depth": 4, "label": "Phenomenological Reports", "desc": "360° vision, passing through walls, silver cord connection, meeting entities. Cross-cultural consistency despite no shared training"},
         {"depth": 5, "label": "Consciousness Beyond Brain", "desc": "The hard problem: if awareness separates from the brain, materialism is incomplete. NDEs and OBEs are the frontier of consciousness science"},
     ]},
])


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# V64.0 STRIKE 3: 5 NEW CELLS — Public Speaking, Philosophy, Pedagogy, Anatomy, Machining
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SPEAKING_MATERIALS = [
    {"id": "audience", "name": "Audience Analysis", "color": "#F59E0B", "category": "Preparation",
     "origin": "Know your audience before you speak — the foundation of all effective communication",
     "components": ["Demographics", "Knowledge level", "Attitudes", "Needs", "Context"],
     "system": "Rhetorical-Analytical axis", "uses": "Speech prep, pitch meetings, teaching, advocacy",
     "dive_layers": [
         {"depth": 0, "label": "The Room", "desc": "Who are they? What do they already know? What do they need? What will move them? Answer these before writing a word"},
         {"depth": 1, "label": "Aristotle's Triad", "desc": "Ethos (credibility), Pathos (emotion), Logos (logic). Every great speech balances all three. Most fail by relying on one"},
         {"depth": 2, "label": "Cognitive Load", "desc": "Working memory holds 4±1 chunks. Structure your speech in 3 main points. More = forgotten. Fewer = thin"},
         {"depth": 3, "label": "Mirror Neurons", "desc": "When you feel it, they feel it. Authentic emotion activates the listener's mirror neuron system. You can't fake passion"},
         {"depth": 4, "label": "Primacy-Recency", "desc": "People remember the first thing and the last thing. Open with a hook. Close with a call to action. The middle is filler"},
         {"depth": 5, "label": "Narrative Transport", "desc": "Stories reduce cortisol and increase oxytocin. A transported listener's resistance to persuasion drops by 50%. Story IS the mechanism"},
     ]},
    {"id": "persuasion", "name": "Persuasion Framework", "color": "#EF4444", "category": "Influence",
     "origin": "The art and science of ethical influence — moving people toward better decisions",
     "components": ["Framing", "Social proof", "Reciprocity", "Scarcity", "Commitment"],
     "system": "Psychological-Rhetorical axis", "uses": "Sales, leadership, negotiation, activism, fundraising",
     "dive_layers": [
         {"depth": 0, "label": "The Ask", "desc": "What do you want them to DO after listening? If you don't know, neither will they. Start with the outcome"},
         {"depth": 1, "label": "Cialdini's Principles", "desc": "Reciprocity, Commitment, Social Proof, Authority, Liking, Scarcity — the 6 weapons of ethical influence"},
         {"depth": 2, "label": "Framing Effect", "desc": "'90% survival rate' vs '10% mortality rate.' Same data, opposite reactions. The frame IS the message"},
         {"depth": 3, "label": "Cognitive Biases", "desc": "Anchoring, confirmation bias, availability heuristic — the shortcuts your audience's brain takes. Work with them, not against"},
         {"depth": 4, "label": "Elaboration Likelihood", "desc": "Central route (logic) for engaged audiences. Peripheral route (cues) for disengaged. Match your approach to their investment"},
         {"depth": 5, "label": "Neural Coupling", "desc": "fMRI shows speaker-listener brain patterns synchronize during effective communication. Literally: your brains connect"},
     ]},
    {"id": "storytelling_ps", "name": "Storytelling", "color": "#A78BFA", "category": "Delivery",
     "origin": "The oldest technology for transmitting knowledge — 100,000 years of human narrative",
     "components": ["Character", "Conflict", "Resolution", "Sensory detail", "Emotional arc"],
     "system": "Narrative-Emotional axis", "uses": "Keynotes, teaching, branding, therapy, leadership",
     "dive_layers": [
         {"depth": 0, "label": "The Story", "desc": "Character + Want + Obstacle + Resolution = Story. Miss any element and you have an anecdote, not a narrative"},
         {"depth": 1, "label": "Story Structure", "desc": "Freytag's pyramid: exposition → rising action → climax → falling action → resolution. The shape of every compelling story"},
         {"depth": 2, "label": "Emotional Arc", "desc": "Vonnegut's shape of stories: 'Man in Hole' (fall then rise) is the most universally satisfying narrative shape"},
         {"depth": 3, "label": "Sensory Anchoring", "desc": "'The room smelled like burnt coffee and ambition.' Concrete sensory details activate the listener's sensory cortex. They EXPERIENCE your story"},
         {"depth": 4, "label": "Oxytocin Response", "desc": "Character-driven stories increase oxytocin by 47%. Oxytocin = trust, empathy, cooperation. Stories literally change brain chemistry"},
         {"depth": 5, "label": "Collective Unconscious", "desc": "Campbell's monomyth: all human stories follow the same deep structure. The Hero's Journey is not a formula — it is an archetypal truth"},
     ]},
]

SPEAKING_TOOLS = [
    {"id": "hook", "name": "Opening Hook", "action_verb": "Hook", "description": "The first 30 seconds that determine if anyone listens to the next 30 minutes", "technique": "Start with a question, a startling statistic, a story, or a bold statement. Never start with 'My name is...' or 'Today I'm going to talk about...' Those are sleep signals.", "color": "#F59E0B", "xp_per_action": 12, "icon_symbol": "H"},
    {"id": "vocal_variety", "name": "Vocal Variety", "action_verb": "Modulate", "description": "Using pitch, pace, volume, and pause to create meaning beyond words", "technique": "Speed up during excitement, slow down for emphasis. Pause BEFORE your key point (creates anticipation), not after (that's just... awkward). Whisper to draw them in.", "color": "#3B82F6", "xp_per_action": 12, "icon_symbol": "V"},
    {"id": "body_language", "name": "Stage Presence", "action_verb": "Command", "description": "Using physical space, gesture, and posture to amplify your message", "technique": "Plant your feet. Gesture above the waist. Move with purpose — walk TO a new point when transitioning ideas. Open palms = trust. Pointed finger = aggression.", "color": "#EF4444", "xp_per_action": 12, "icon_symbol": "S"},
    {"id": "structure_speech", "name": "Speech Structure", "action_verb": "Organize", "description": "The invisible skeleton that makes complex ideas feel simple", "technique": "Tell them what you'll tell them. Tell them. Tell them what you told them. Within the body: Problem-Solution, Chronological, or Cause-Effect. Pick ONE structure.", "color": "#22C55E", "xp_per_action": 12, "icon_symbol": "O"},
    {"id": "callback", "name": "Callback Technique", "action_verb": "Echo", "description": "Referencing earlier points to create thematic unity and audience recognition", "technique": "Plant a phrase in your opening. Reference it in the middle. Repeat it in the close with new meaning. The audience feels the circle close. This creates 'Aha.'", "color": "#A78BFA", "xp_per_action": 12, "icon_symbol": "C"},
    {"id": "q_and_a", "name": "Q&A Mastery", "action_verb": "Field", "description": "Handling audience questions without losing control or credibility", "technique": "Repeat the question (buys time + ensures everyone heard). Answer the question you WISH they asked if the real one is hostile. End on YOUR terms — 'One final thought...'", "color": "#94A3B8", "xp_per_action": 12, "icon_symbol": "Q"},
    {"id": "visual_aid", "name": "Visual Design", "action_verb": "Show", "description": "Creating slides and visuals that amplify rather than replace your message", "technique": "One idea per slide. 6 words maximum. Full-bleed images. If the slide makes sense without you, you're the unnecessary one. Slides support; they don't substitute.", "color": "#EC4899", "xp_per_action": 12, "icon_symbol": "D"},
    {"id": "rehearsal", "name": "Rehearsal Protocol", "action_verb": "Rehearse", "description": "The practice method that separates amateurs from professionals", "technique": "Record yourself. Watch without sound (check body language). Listen without video (check vocal variety). Time it. Cut 20%. Rehearse transitions most — that's where speakers stumble.", "color": "#F97316", "xp_per_action": 12, "icon_symbol": "R"},
    {"id": "close", "name": "Power Close", "action_verb": "Close", "description": "The final impression that determines what they remember and what they do", "technique": "Circle back to your opening story/image with new meaning. End with a specific call to action. Never say 'In conclusion' or 'That's all I have.' Drop the mic, don't place it.", "color": "#D4AF37", "xp_per_action": 12, "icon_symbol": "P"},
]

PHILOSOPHY_MATERIALS = [
    {"id": "ethics", "name": "Ethics", "color": "#22C55E", "category": "Moral", "complexity": "Foundation",
     "origin": "The study of right action — how should we live?", "components": ["Virtue ethics", "Deontology", "Consequentialism", "Care ethics"],
     "system": "Moral reasoning", "uses": "Decision-making, professional ethics, bioethics, justice",
     "dive_layers": [
         {"depth": 0, "label": "The Question", "desc": "'What should I do?' — the most practical question in all of philosophy. Every action has ethical weight"},
         {"depth": 1, "label": "Three Frameworks", "desc": "Virtue (be good), Deontology (follow rules), Consequentialism (maximize outcomes). Each illuminates; none is complete alone"},
         {"depth": 2, "label": "Trolley Problem", "desc": "Pull the lever? Push the man? Same outcome, different moral intuitions. The gap between these IS the territory of ethics"},
         {"depth": 3, "label": "Moral Development", "desc": "Kohlberg: pre-conventional (punishment) → conventional (conformity) → post-conventional (principle). Most adults plateau at stage 4"},
         {"depth": 4, "label": "Categorical Imperative", "desc": "Kant: act only by rules you could will to be universal law. 'Could I want everyone to do this?' If no, it's wrong. Period"},
         {"depth": 5, "label": "Meta-Ethics", "desc": "Are moral facts real (realism) or constructed (anti-realism)? If constructed, by whom? If real, how do we access them? The foundation beneath the foundation"},
     ]},
    {"id": "logic", "name": "Logic", "color": "#3B82F6", "category": "Reasoning", "complexity": "Foundation",
     "origin": "The laws of valid reasoning — the operating system of clear thinking", "components": ["Deduction", "Induction", "Abduction", "Fallacies"],
     "system": "Formal-Informal reasoning", "uses": "Argumentation, critical thinking, programming, mathematics",
     "dive_layers": [
         {"depth": 0, "label": "The Argument", "desc": "Premises + conclusion. If the premises are true and the logic is valid, the conclusion MUST be true. That's the power"},
         {"depth": 1, "label": "Syllogistic Form", "desc": "All A are B. All B are C. Therefore: All A are C. Valid. 'Some A are B. Some B are C. Therefore: Some A are C.' INVALID"},
         {"depth": 2, "label": "Common Fallacies", "desc": "Ad hominem, strawman, false dilemma, appeal to authority, slippery slope, red herring — the 20 ways thinking goes wrong"},
         {"depth": 3, "label": "Propositional Logic", "desc": "P → Q (if P then Q). Modus ponens: P, P→Q, therefore Q. Modus tollens: ¬Q, P→Q, therefore ¬P. The algebra of truth"},
         {"depth": 4, "label": "Gödel's Incompleteness", "desc": "Any consistent formal system powerful enough to describe arithmetic contains true statements it cannot prove. Logic has limits"},
         {"depth": 5, "label": "Paraconsistency", "desc": "What if contradictions don't destroy everything? Paraconsistent logics allow local contradiction without global explosion. The frontier"},
     ]},
    {"id": "metaphysics", "name": "Metaphysics", "color": "#8B5CF6", "category": "Reality", "complexity": "Advanced",
     "origin": "The study of what exists — beyond physics, into the nature of reality itself", "components": ["Ontology", "Causation", "Free will", "Time", "Consciousness"],
     "system": "Ontological-Cosmological axis", "uses": "Worldview formation, science philosophy, theology, AI ethics",
     "dive_layers": [
         {"depth": 0, "label": "The Question", "desc": "'What is real?' — the question that launched 2,500 years of Western philosophy and 5,000 years of Eastern inquiry"},
         {"depth": 1, "label": "Substance & Property", "desc": "What is a 'thing'? A bundle of properties (Hume) or a substance with properties (Aristotle)? This determines everything"},
         {"depth": 2, "label": "Causation Problem", "desc": "Hume: we never observe causation, only constant conjunction. 'The sun rose every day' ≠ 'The sun will rise tomorrow.' Induction is faith"},
         {"depth": 3, "label": "Free Will", "desc": "Determinism (every event has a cause) vs libertarian free will vs compatibilism (both somehow). Your answer changes ethics, law, and identity"},
         {"depth": 4, "label": "Problem of Universals", "desc": "Does 'redness' exist apart from red things? Plato: yes (Forms). Nominalism: no (just a word). This 2,400-year debate is still live"},
         {"depth": 5, "label": "Hard Problem", "desc": "Chalmers: why does physical processing give rise to subjective experience? Why is there 'something it is like' to be conscious? The deepest question in philosophy"},
     ]},
]

PHILOSOPHY_TOOLS = [
    {"id": "socratic", "name": "Socratic Questioning", "action_verb": "Question", "description": "The method of inquiry through directed questioning that exposes assumptions", "technique": "Never state your position. Ask: 'What do you mean by X?' 'How do you know that?' 'What follows from that?' 'Can you give an example?' The question IS the teaching.", "color": "#22C55E", "xp_per_action": 12, "icon_symbol": "Q"},
    {"id": "thought_exp", "name": "Thought Experiment", "action_verb": "Imagine", "description": "Hypothetical scenarios that test the boundaries of concepts and intuitions", "technique": "Trolley Problem, Ship of Theseus, Brain in a Vat, Mary's Room. Construct a scenario that isolates ONE variable. If the intuition conflicts with the theory, one must yield.", "color": "#3B82F6", "xp_per_action": 12, "icon_symbol": "T"},
    {"id": "dialectic", "name": "Dialectical Method", "action_verb": "Synthesize", "description": "Thesis → antithesis → synthesis: advancing understanding through structured opposition", "technique": "State position A clearly. State its strongest opposition B. Find the truth in BOTH. Create position C that transcends the contradiction. Repeat. This is how knowledge evolves.", "color": "#8B5CF6", "xp_per_action": 12, "icon_symbol": "D"},
    {"id": "fallacy_check", "name": "Fallacy Detection", "action_verb": "Analyze", "description": "Identifying logical errors in arguments — yours and others'", "technique": "Read the argument. Identify the conclusion. Identify each premise. Ask: does this premise actually support the conclusion? Is the connection logical or emotional? Name the fallacy.", "color": "#EF4444", "xp_per_action": 12, "icon_symbol": "F"},
    {"id": "phil_journal", "name": "Philosophical Journal", "action_verb": "Reflect", "description": "Written reflection connecting abstract ideas to lived experience", "technique": "Read a passage. Write what you understood. Write what confused you. Write how it connects to your life. The confusion is where the learning lives. Sit with it.", "color": "#F59E0B", "xp_per_action": 12, "icon_symbol": "J"},
    {"id": "steelman", "name": "Steelmanning", "action_verb": "Strengthen", "description": "Constructing the strongest possible version of an opposing argument", "technique": "Before you argue against a position, build it up to its BEST form. If you can't present the opposition better than they can, you don't understand it well enough to critique it.", "color": "#94A3B8", "xp_per_action": 12, "icon_symbol": "S"},
    {"id": "concept_map", "name": "Concept Mapping", "action_verb": "Map", "description": "Visual diagramming of philosophical relationships and dependencies", "technique": "Central concept in the middle. Branch: causes, effects, related concepts, contradictions. Draw lines between related ideas. The map reveals structure invisible in linear reading.", "color": "#A78BFA", "xp_per_action": 12, "icon_symbol": "M"},
    {"id": "phil_dialogue", "name": "Philosophical Dialogue", "action_verb": "Dialogue", "description": "Structured conversation seeking truth rather than victory", "technique": "Rule 1: You must be willing to be wrong. Rule 2: Understand before you respond. Rule 3: Attack ideas, never people. Rule 4: The goal is truth, not winning.", "color": "#EC4899", "xp_per_action": 12, "icon_symbol": "P"},
    {"id": "meditation_phil", "name": "Philosophical Meditation", "action_verb": "Contemplate", "description": "Extended contemplation on a single philosophical question or paradox", "technique": "Choose one question: 'Am I the same person I was 10 years ago?' Sit with it for 30 minutes. Don't search for answers — let the question deepen. The depth IS the practice.", "color": "#D4AF37", "xp_per_action": 12, "icon_symbol": "C"},
]

PEDAGOGY_MATERIALS = [
    {"id": "lesson_design", "name": "Lesson Design", "color": "#3B82F6", "category": "Planning",
     "origin": "Backwards design — start with what students should KNOW and DO, then build backward",
     "components": ["Learning objectives", "Assessment design", "Activity sequence", "Differentiation"],
     "system": "Instructional design", "uses": "K-12, higher ed, corporate training, workshop facilitation",
     "dive_layers": [
         {"depth": 0, "label": "The Plan", "desc": "Objective → Assessment → Instruction. If you can't assess it, you can't teach it. If you can't state it, you don't know what it is"},
         {"depth": 1, "label": "Bloom's Taxonomy", "desc": "Remember → Understand → Apply → Analyze → Evaluate → Create. Most teaching stays at 'Remember.' Mastery lives at 'Create'"},
         {"depth": 2, "label": "Backwards Design", "desc": "Wiggins & McTighe: start with the desired result, determine acceptable evidence, THEN plan learning experiences. Most teachers do this backward"},
         {"depth": 3, "label": "Cognitive Load Theory", "desc": "Intrinsic load (complexity) + extraneous load (poor design) + germane load (learning) = total. Reduce extraneous. Manage intrinsic. Maximize germane"},
         {"depth": 4, "label": "Schema Formation", "desc": "New knowledge must attach to existing schema. If there's no hook, the information bounces off. Activate prior knowledge FIRST"},
         {"depth": 5, "label": "Transfer Problem", "desc": "Learning in context A rarely transfers to context B without explicit bridging. This is why school knowledge often can't be applied in life"},
     ]},
    {"id": "assessment", "name": "Assessment Design", "color": "#22C55E", "category": "Evaluation",
     "origin": "Measuring what matters — the difference between testing memory and testing understanding",
     "components": ["Formative", "Summative", "Authentic", "Portfolio", "Self-assessment"],
     "system": "Measurement-Feedback axis", "uses": "Grading, feedback, certification, program evaluation",
     "dive_layers": [
         {"depth": 0, "label": "The Assessment", "desc": "Formative = checking the oven mid-bake. Summative = tasting the finished cake. Both necessary, different purposes"},
         {"depth": 1, "label": "Validity & Reliability", "desc": "Validity: does it measure what we claim? Reliability: would we get the same result again? A ruler that's wrong is reliable but invalid"},
         {"depth": 2, "label": "Authentic Assessment", "desc": "Real-world tasks: build it, present it, solve the actual problem. Multiple-choice tests measure recognition, not capability"},
         {"depth": 3, "label": "Rubric Design", "desc": "Analytic rubrics: separate scores per criterion. Holistic rubrics: one overall score. Rubrics make invisible expectations visible"},
         {"depth": 4, "label": "Assessment Bias", "desc": "Language bias, cultural bias, format bias (some students freeze on tests but shine in projects). Every format advantages someone"},
         {"depth": 5, "label": "Washback Effect", "desc": "Students study for the test format, not the content. If you test memorization, they memorize. If you test thinking, they think. The test SHAPES the learning"},
     ]},
    {"id": "classroom_mgmt", "name": "Classroom Management", "color": "#F59E0B", "category": "Environment",
     "origin": "Creating conditions where learning happens — the invisible architecture of the classroom",
     "components": ["Routines", "Expectations", "Relationships", "Engagement", "Transitions"],
     "system": "Environmental-Behavioral axis", "uses": "K-12, workshops, group facilitation, community education",
     "dive_layers": [
         {"depth": 0, "label": "The Room", "desc": "The best classroom management is invisible: students are too engaged to misbehave. Engagement IS management"},
         {"depth": 1, "label": "Proactive Systems", "desc": "80% of management is prevention: clear routines, taught expectations, smooth transitions. Reactive management means the system failed"},
         {"depth": 2, "label": "Relationship-Driven", "desc": "Students don't learn from people they don't trust. 'They don't care what you know until they know that you care.' (Teddy Roosevelt, paraphrased)"},
         {"depth": 3, "label": "Restorative Practices", "desc": "Harm → repair → reintegration. 'What happened? Who was affected? How do we make it right?' Punishment controls behavior; restoration builds character"},
         {"depth": 4, "label": "Self-Determination Theory", "desc": "Autonomy + Competence + Relatedness = intrinsic motivation (Deci & Ryan). Remove any one and motivation collapses to compliance"},
         {"depth": 5, "label": "Hidden Curriculum", "desc": "The unspoken lessons of HOW the classroom runs: who gets called on, whose ideas are valued, what counts as 'smart.' The structure teaches as much as the content"},
     ]},
]

PEDAGOGY_TOOLS = [
    {"id": "objective_writer", "name": "Objective Writer", "action_verb": "Define", "description": "Crafting measurable learning objectives using Bloom's action verbs", "technique": "'Students will be able to [verb] [content] [condition].' Use Bloom's verbs: analyze, not 'understand.' Evaluate, not 'know about.' If you can't observe and measure it, rewrite it.", "color": "#3B82F6", "xp_per_action": 12, "icon_symbol": "O"},
    {"id": "formative_check", "name": "Formative Check", "action_verb": "Check", "description": "Quick mid-lesson assessment to adjust instruction in real-time", "technique": "Exit ticket, thumbs up/down, whiteboard response, think-pair-share. Check understanding every 10 minutes. If 30% are lost, STOP and reteach. Don't plow through for the 70%.", "color": "#22C55E", "xp_per_action": 12, "icon_symbol": "C"},
    {"id": "scaffold", "name": "Scaffolding", "action_verb": "Support", "description": "Temporary support structures that enable learners to reach beyond current ability", "technique": "Model → guided practice → independent practice. Gradually remove support as competence grows. The scaffold is not the building — remove it when the walls can stand.", "color": "#F59E0B", "xp_per_action": 12, "icon_symbol": "S"},
    {"id": "differentiation", "name": "Differentiation", "action_verb": "Adapt", "description": "Adjusting content, process, or product to meet diverse learner needs", "technique": "Same learning goal, different paths. Tiered tasks: all students work on persuasive writing, but the texts vary in complexity. Choice boards let students select HOW they demonstrate mastery.", "color": "#EF4444", "xp_per_action": 12, "icon_symbol": "D"},
    {"id": "questioning", "name": "Questioning Strategy", "action_verb": "Probe", "description": "Using strategic questions to deepen thinking rather than check recall", "technique": "Wait time: 3-5 seconds after asking. Cold call, not hand-raising (equity). Follow up: 'How do you know?' 'What if...?' 'Can someone add to that?' The second question is where thinking starts.", "color": "#A78BFA", "xp_per_action": 12, "icon_symbol": "Q"},
    {"id": "cooperative", "name": "Cooperative Learning", "action_verb": "Collaborate", "description": "Structured group work where every member has a role and accountability", "technique": "Jigsaw, think-pair-share, numbered heads, gallery walk. Structure is everything: unstructured group work = one person works, three watch. Assign roles. Build in individual accountability.", "color": "#94A3B8", "xp_per_action": 12, "icon_symbol": "G"},
    {"id": "feedback_tool", "name": "Feedback Protocol", "action_verb": "Respond", "description": "Giving specific, actionable feedback that improves performance", "technique": "Stars and stairs: what's working + what to improve. Be specific: not 'good job' but 'your thesis clearly states a position.' Timely: feedback 3 weeks later is archaeology, not guidance.", "color": "#EC4899", "xp_per_action": 12, "icon_symbol": "F"},
    {"id": "reflection", "name": "Reflective Practice", "action_verb": "Reflect", "description": "Systematic self-evaluation of teaching effectiveness", "technique": "After every lesson: What worked? What didn't? What will I change? Record a 2-minute voice memo. Review monthly. The teacher who doesn't reflect teaches the same first year 30 times.", "color": "#F97316", "xp_per_action": 12, "icon_symbol": "R"},
    {"id": "culturally_resp", "name": "Cultural Responsiveness", "action_verb": "Honor", "description": "Teaching that validates and incorporates students' cultural identities", "technique": "Learn names correctly. Include diverse perspectives in content. Examine your own biases. 'Windows and mirrors': students need to see themselves AND see others. Representation is not optional.", "color": "#D4AF37", "xp_per_action": 12, "icon_symbol": "H"},
]

ANATOMY_MATERIALS = [
    {"id": "musculoskeletal", "name": "Musculoskeletal System", "color": "#94A3B8", "category": "Movement",
     "origin": "206 bones + 600 muscles — the framework that moves the human body",
     "components": ["Bones", "Joints", "Skeletal muscle", "Tendons", "Ligaments"],
     "system": "Structural-Mechanical axis", "uses": "Physical therapy, sports medicine, orthopedics, anatomy education",
     "dive_layers": [
         {"depth": 0, "label": "Body in Motion", "desc": "Skeleton provides structure, muscles provide force, joints provide movement. Three systems working as one machine"},
         {"depth": 1, "label": "Joint Mechanics", "desc": "Ball-and-socket (hip), hinge (elbow), pivot (atlas), saddle (thumb). Each joint type allows specific degrees of freedom"},
         {"depth": 2, "label": "Muscle Fiber Types", "desc": "Type I (slow oxidative: marathon), Type IIa (fast oxidative: middle distance), Type IIx (fast glycolytic: sprint). Genetics sets the ratio"},
         {"depth": 3, "label": "Sliding Filament", "desc": "Actin and myosin interdigitate. Myosin heads walk along actin powered by ATP hydrolysis. 10nm power stroke per cycle"},
         {"depth": 4, "label": "Calcium Signaling", "desc": "Action potential → T-tubule → sarcoplasmic reticulum releases Ca²⁺ → troponin shifts → actin binding sites exposed → contraction"},
         {"depth": 5, "label": "ATP Synthesis", "desc": "Creatine phosphate (10s) → glycolysis (2min) → oxidative phosphorylation (hours). Three energy systems, one seamless transition"},
     ]},
    {"id": "cardiovascular", "name": "Cardiovascular System", "color": "#EF4444", "category": "Circulation",
     "origin": "The heart pumps 2,000 gallons per day through 60,000 miles of vessels",
     "components": ["Heart (4 chambers)", "Arteries", "Veins", "Capillaries", "Blood (5L)"],
     "system": "Circulatory-Oxygen transport", "uses": "Cardiology, emergency medicine, exercise physiology, pathology",
     "dive_layers": [
         {"depth": 0, "label": "The Heart", "desc": "Right side: lungs. Left side: body. Four chambers, four valves, one electrical system. Beats 100,000 times per day without rest"},
         {"depth": 1, "label": "Cardiac Cycle", "desc": "Diastole (fill) → atrial systole (top-off) → ventricular systole (pump). 0.8 seconds per cycle at 75 bpm. S1 (closure of AV valves) S2 (closure of semilunar)"},
         {"depth": 2, "label": "Hemodynamics", "desc": "Cardiac output = stroke volume × heart rate. Mean arterial pressure = CO × systemic vascular resistance. These two equations explain cardiovascular physiology"},
         {"depth": 3, "label": "Capillary Exchange", "desc": "Starling forces: hydrostatic pressure pushes fluid out, oncotic pressure pulls it back. The balance determines edema vs dehydration"},
         {"depth": 4, "label": "Oxygen Transport", "desc": "Hemoglobin: 4 heme groups, each binding one O₂. Cooperative binding: the first O₂ makes the next easier. The sigmoid curve of life"},
         {"depth": 5, "label": "Cardiac Electrophysiology", "desc": "SA node fires at 60-100 bpm. Gap junctions propagate depolarization as a syncytium. The heart is its own pacemaker — it beats without the brain"},
     ]},
    {"id": "nervous_system", "name": "Nervous System", "color": "#A78BFA", "category": "Control",
     "origin": "86 billion neurons processing reality at 268 mph — the body's command center",
     "components": ["Brain", "Spinal cord", "Peripheral nerves", "Autonomic system", "Sensory organs"],
     "system": "Neural-Cognitive axis", "uses": "Neurology, psychiatry, neuroscience, pain management",
     "dive_layers": [
         {"depth": 0, "label": "The Network", "desc": "Central (brain + cord) and Peripheral (31 spinal nerves + 12 cranial). Voluntary (move your arm) and Autonomic (digest your food)"},
         {"depth": 1, "label": "Brain Regions", "desc": "Frontal (decision), Parietal (sensation), Temporal (memory/language), Occipital (vision), Cerebellum (coordination), Brainstem (survival)"},
         {"depth": 2, "label": "Action Potential", "desc": "Resting: -70mV. Threshold: -55mV. Depolarization: +30mV. Repolarization: -70mV. Refractory. All-or-nothing. 1-2ms per spike"},
         {"depth": 3, "label": "Synaptic Transmission", "desc": "Vesicles fuse → neurotransmitter floods cleft → binds receptor → ion channel opens → post-synaptic potential. 0.5ms delay per synapse"},
         {"depth": 4, "label": "Neurotransmitter Systems", "desc": "Glutamate (excitatory), GABA (inhibitory), Dopamine (reward), Serotonin (mood), Acetylcholine (muscle). Five molecules, all of behavior"},
         {"depth": 5, "label": "Consciousness", "desc": "Integrated Information Theory (Φ): consciousness = the amount of integrated information a system generates. The brain's deepest mystery, quantified"},
     ]},
]

ANATOMY_TOOLS = [
    {"id": "palpation", "name": "Palpation", "action_verb": "Palpate", "description": "Using hands to examine body structures through touch", "technique": "Light palpation first (1-2 cm depth), then deep. Flat fingers for large areas, fingertips for specific structures. Close your eyes — your fingers see more when your eyes are closed.", "color": "#94A3B8", "xp_per_action": 12, "icon_symbol": "P"},
    {"id": "dissection", "name": "Virtual Dissection", "action_verb": "Dissect", "description": "Layer-by-layer exploration of anatomical structures", "technique": "Skin → fascia → muscle → vessels → nerves → bone. Always identify before cutting. Respect the cadaver — they are your first patient and your greatest teacher.", "color": "#EF4444", "xp_per_action": 12, "icon_symbol": "D"},
    {"id": "imaging", "name": "Medical Imaging", "action_verb": "Image", "description": "Interpreting X-ray, CT, MRI, and ultrasound to see inside the living body", "technique": "X-ray: bones (white), air (black), soft tissue (grey). CT: cross-sections. MRI: soft tissue detail. Ultrasound: real-time, no radiation. Each modality has its strength.", "color": "#3B82F6", "xp_per_action": 12, "icon_symbol": "I"},
    {"id": "surface_anatomy", "name": "Surface Landmarks", "action_verb": "Locate", "description": "Identifying anatomical structures visible or palpable at the body surface", "technique": "Sternal notch, acromion process, ASIS, tibial tuberosity. These landmarks are your GPS for locating deeper structures. Learn them until you can find them in the dark.", "color": "#22C55E", "xp_per_action": 12, "icon_symbol": "L"},
    {"id": "histology", "name": "Histology", "action_verb": "Examine", "description": "Microscopic examination of tissue structure and cellular organization", "technique": "Low power first (orientation), then high power (detail). Identify: epithelial type, connective tissue, muscle type, nerve presence. The tissue tells you the function.", "color": "#A78BFA", "xp_per_action": 12, "icon_symbol": "H"},
    {"id": "clinical_corr", "name": "Clinical Correlation", "action_verb": "Correlate", "description": "Connecting anatomical knowledge to clinical presentations", "technique": "'The patient has weakness in wrist extension.' Trace the nerve: radial nerve → posterior cord → C5-C8 roots. Where could it be damaged? Anatomy IS diagnosis.", "color": "#F59E0B", "xp_per_action": 12, "icon_symbol": "C"},
    {"id": "movement_analysis", "name": "Movement Analysis", "action_verb": "Analyze", "description": "Breaking complex movements into component joint actions and muscle activations", "technique": "Observe the movement. Identify each joint involved. Name the motion (flexion, extension, rotation). Identify the prime mover, synergist, and antagonist. Now you understand the movement.", "color": "#EC4899", "xp_per_action": 12, "icon_symbol": "M"},
    {"id": "anatomy_sketch", "name": "Anatomical Drawing", "action_verb": "Draw", "description": "Hand-drawing anatomical structures to reinforce spatial understanding", "technique": "Draw from observation, not memory (at first). Label as you draw. Drawing forces attention to details you'd skip while reading. The hand teaches the brain spatial relationships.", "color": "#F97316", "xp_per_action": 12, "icon_symbol": "S"},
    {"id": "systems_review", "name": "Systems Review", "action_verb": "Integrate", "description": "Connecting multiple organ systems to understand whole-body function", "technique": "Pick one function: 'exercise.' Trace through: respiratory (O₂ in), cardiovascular (O₂ delivery), muscular (contraction), nervous (coordination), endocrine (regulation). Everything connects.", "color": "#D4AF37", "xp_per_action": 12, "icon_symbol": "R"},
]

MACHINING_MATERIALS = [
    {"id": "lathe_work", "name": "Lathe Work", "color": "#6B7280", "category": "Turning",
     "origin": "The mother of all machine tools — rotating the workpiece against a fixed cutting tool",
     "components": ["Chuck", "Tailstock", "Tool post", "Cross-slide", "Lead screw"],
     "system": "Rotational machining", "uses": "Shafts, bushings, threads, tapers, facing, boring",
     "dive_layers": [
         {"depth": 0, "label": "The Setup", "desc": "Workpiece in chuck, tool at center height, RPM set by material and diameter. The lathe is 5,000 years old and still irreplaceable"},
         {"depth": 1, "label": "Cutting Parameters", "desc": "Surface speed (SFM), feed rate (IPR), depth of cut (DOC). These three numbers determine finish quality, tool life, and cycle time"},
         {"depth": 2, "label": "Chip Formation", "desc": "Type 1 (continuous), Type 2 (built-up edge), Type 3 (segmented). Chip type reveals if your parameters are correct. Listen to the cut"},
         {"depth": 3, "label": "Tool Geometry", "desc": "Rake angle (chip flow), clearance angle (no rubbing), nose radius (finish). Each degree matters. Sharpen to specification, not to 'looks sharp'"},
         {"depth": 4, "label": "Taylor's Tool Life", "desc": "VT^n = C. Speed × Tool-life^exponent = constant. Double the speed, tool life drops exponentially. The fundamental tradeoff of machining"},
         {"depth": 5, "label": "Cutting Mechanics", "desc": "Merchant's circle: cutting force, thrust force, friction force, shear angle. All of machining is controlled shear deformation of metal"},
     ]},
    {"id": "milling", "name": "Milling Operations", "color": "#3B82F6", "category": "Multi-Axis",
     "origin": "Rotating cutter, fixed workpiece — the most versatile machine tool for flat and complex surfaces",
     "components": ["Spindle", "End mill", "Vise", "Work table (XYZ)", "Digital readout"],
     "system": "Multi-axis material removal", "uses": "Pockets, slots, contours, drill patterns, keyways",
     "dive_layers": [
         {"depth": 0, "label": "The Machine", "desc": "Vertical or horizontal spindle. Table moves in X-Y-Z. The cutter spins; the work feeds. More flexible than a lathe, less precise by nature"},
         {"depth": 1, "label": "Climb vs Conventional", "desc": "Climb milling: cutter enters thick, exits thin (better finish). Conventional: enters thin, exits thick (safer on older machines). Direction matters"},
         {"depth": 2, "label": "End Mill Selection", "desc": "2-flute (aluminum), 4-flute (steel), ball-nose (3D contours). Coating: TiN, TiAlN, AlCrN. The tool is the most expensive consumable in the shop"},
         {"depth": 3, "label": "Vibration Control", "desc": "Chatter: the self-excited vibration that ruins finish and breaks tools. Caused by improper speed/feed, excessive stickout, or resonance. Change speed first"},
         {"depth": 4, "label": "Metal Removal Rate", "desc": "MRR = DOC × WOC × Feed. Cubic inches per minute. This number determines if the job makes money or loses it. Time is the enemy"},
         {"depth": 5, "label": "Finite Element Analysis", "desc": "FEA models predict deflection, thermal expansion, and residual stress from cutting forces. The computer sees what the machinist feels"},
     ]},
    {"id": "cnc", "name": "CNC Programming", "color": "#22C55E", "category": "Digital",
     "origin": "Computer Numerical Control — translating digital geometry into physical parts with micron precision",
     "components": ["G-code", "CAM software", "Tool library", "Work coordinates", "Probe cycles"],
     "system": "Digital-Physical bridge", "uses": "Production machining, prototyping, aerospace, medical devices",
     "dive_layers": [
         {"depth": 0, "label": "The Program", "desc": "G-code: G00 (rapid), G01 (linear feed), G02/G03 (arc). M03 (spindle on), M05 (spindle off). The language of metal removal"},
         {"depth": 1, "label": "CAM Toolpaths", "desc": "Adaptive clearing, HSM pocketing, morphed spirals. The software calculates millions of positions the human brain cannot. But the human must verify"},
         {"depth": 2, "label": "Work Coordinate System", "desc": "G54-G59: up to 6 saved origin points. Touch-off the part, set zero. Everything is measured from this reference. One wrong zero = scrap"},
         {"depth": 3, "label": "Tolerance & GD&T", "desc": "±0.001 inch is standard. ±0.0001 is precision. Position, flatness, concentricity, runout — GD&T defines what 'good enough' means mathematically"},
         {"depth": 4, "label": "Servo Control", "desc": "Closed-loop positioning: encoder reads position → compares to command → servo adjusts. 1,000 corrections per second per axis"},
         {"depth": 5, "label": "Interpolation Algorithm", "desc": "The controller breaks curves into tiny line segments (nanoseconds apart). Bresenham's algorithm for arcs. The machine approximates continuous geometry with discrete steps"},
     ]},
]

MACHINING_TOOLS = [
    {"id": "micrometer", "name": "Micrometer", "action_verb": "Measure", "description": "Precision measuring instrument reading to 0.0001 inch", "technique": "Clean the anvil faces. Use the thimble, not the barrel, to close on the part. Read: barrel (0.1s) + thimble (0.001s) + vernier (0.0001). The last digit matters — it's the difference between a part and scrap.", "color": "#94A3B8", "xp_per_action": 12, "icon_symbol": "M"},
    {"id": "indicator", "name": "Dial Indicator", "action_verb": "Indicate", "description": "Measuring runout, flatness, and alignment to 0.0005 inch", "technique": "Mount on magnetic base. Zero the needle. Sweep the surface. One full revolution of the needle = 0.001 inch. Read the total indicator reading (TIR). Half of TIR = actual deviation.", "color": "#3B82F6", "xp_per_action": 12, "icon_symbol": "I"},
    {"id": "surface_grinder", "name": "Surface Grinder", "action_verb": "Grind", "description": "Abrasive wheel for achieving mirror finishes and tight tolerances", "technique": "Dress the wheel first. Down-feed 0.0005 inch per pass. Flood coolant. Cross-feed overlap 1/3 wheel width. Grinding is the final process — you can't grind what you can't measure.", "color": "#EF4444", "xp_per_action": 12, "icon_symbol": "G"},
    {"id": "tap_die", "name": "Tap & Die Set", "action_verb": "Thread", "description": "Cutting internal (tap) and external (die) screw threads by hand or machine", "technique": "Start square to the hole. Turn clockwise 1/2 turn, back 1/4 turn (clears chips). Use cutting oil. Break-through taps for through-holes, bottoming taps for blind holes.", "color": "#F59E0B", "xp_per_action": 12, "icon_symbol": "T"},
    {"id": "edge_finder", "name": "Edge Finder", "action_verb": "Locate", "description": "Spinning probe for finding the exact edge of a workpiece on the mill", "technique": "Spin in the spindle at 1,000 RPM. Approach the edge slowly. When the tip kicks (de-centers), you're exactly one half-diameter from the edge. Set your zero.", "color": "#22C55E", "xp_per_action": 12, "icon_symbol": "E"},
    {"id": "deburr_tool", "name": "Deburring Tool", "action_verb": "Deburr", "description": "Swivel-blade tool for removing sharp edges from machined parts", "technique": "Draw the blade along every machined edge. One pass. Burrs cause cuts, interfere with assembly, and concentrate stress. A deburred part is a professional part.", "color": "#A78BFA", "xp_per_action": 12, "icon_symbol": "D"},
    {"id": "speeds_feeds", "name": "Speeds & Feeds Calc", "action_verb": "Calculate", "description": "Computing optimal RPM and feed rate for any material/tool combination", "technique": "RPM = (SFM × 3.82) / Diameter. Feed = RPM × IPT × number of flutes. Start conservative, adjust by sound and chip formation. The calculator starts the conversation; the machinist finishes it.", "color": "#EC4899", "xp_per_action": 12, "icon_symbol": "C"},
    {"id": "coolant_mgmt", "name": "Coolant Management", "action_verb": "Cool", "description": "Flood and mist coolant systems for temperature and chip control", "technique": "Aim at the cutting zone, not the chip pile. 6-8% concentration for water-soluble. Check with a refractometer weekly. Bad coolant = bad finish + short tool life + skin irritation.", "color": "#F97316", "xp_per_action": 12, "icon_symbol": "L"},
    {"id": "workholding", "name": "Workholding Setup", "action_verb": "Fixture", "description": "Securing the workpiece for repeatable, rigid machining", "technique": "Support near the cut. Clamp against a solid surface. Over-clamping distorts thin parts. Under-clamping = flying parts. The fixture is 50% of the machining problem.", "color": "#D4AF37", "xp_per_action": 12, "icon_symbol": "F"},
]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# V65.0 PARITY PUSH — Expand 5 modules from 3 → 6 materials
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ── MACHINING +3 ──
MACHINING_MATERIALS.extend([
    {"id": "surface_grinding", "name": "Surface Grinding", "color": "#EF4444", "category": "Finishing",
     "origin": "Abrasive machining — achieving mirror finishes and sub-micron flatness with a spinning wheel",
     "components": ["Grinding wheel (Al₂O₃/CBN)", "Magnetic chuck", "Dresser", "Coolant flood", "Spark-out pass"],
     "system": "Abrasive material removal", "uses": "Gauge blocks, die plates, seal surfaces, heat-treated parts, tooling",
     "dive_layers": [
         {"depth": 0, "label": "The Setup", "desc": "Part on magnetic chuck, wheel dressed true, coolant flooding. Surface grinding is the slowest and most precise metal removal process"},
         {"depth": 1, "label": "Wheel Selection", "desc": "Grain (Al₂O₃ for steel, SiC for cast iron, CBN for hardened), bond (vitrified/resinoid), structure (open/dense). The wheel IS the cutting tool"},
         {"depth": 2, "label": "Spark-Out", "desc": "Final passes with zero down-feed — the wheel continues cutting as the machine relaxes elastic deflection. Where flatness is born"},
         {"depth": 3, "label": "Thermal Damage", "desc": "Grinding burn: surface rehardening or tempering from friction heat. Blue discoloration = ruined part. Nital etch reveals subsurface damage"},
         {"depth": 4, "label": "Abrasive Mechanics", "desc": "Each grain is a negative-rake cutting tool. Specific grinding energy: 10-50 J/mm³ — 10x higher than turning because of rubbing and plowing"},
         {"depth": 5, "label": "Crystal Fracture", "desc": "Self-sharpening: vitrified bond fractures to expose new grain edges. The wheel renews itself at the atomic level during cutting"},
     ]},
    {"id": "edm", "name": "EDM (Electric Discharge)", "color": "#FBBF24", "category": "Non-Traditional",
     "origin": "Spark erosion — removing metal without mechanical contact using controlled electrical discharge",
     "components": ["Electrode (graphite/copper)", "Dielectric fluid", "Spark gap", "Servo feed", "Flushing system"],
     "system": "Electrothermal material removal", "uses": "Injection molds, aerospace turbine blades, medical implants, hardened dies",
     "dive_layers": [
         {"depth": 0, "label": "The Machine", "desc": "Sinker or wire EDM. The electrode never touches the work. Material is removed spark by spark, each one a tiny lightning bolt"},
         {"depth": 1, "label": "Spark Gap", "desc": "0.001-0.002 inch gap maintained by servo. Dielectric (kerosene or deionized water) insulates until voltage breaks through — then: discharge"},
         {"depth": 2, "label": "Crater Formation", "desc": "Each spark melts and vaporizes a 10-50 micron crater. 10,000 sparks per second. The surface is a moonscape of overlapping craters"},
         {"depth": 3, "label": "Recast Layer", "desc": "Rapidly solidified material on the crater rim: amorphous, brittle, tensile-stressed. Must be removed for fatigue-critical parts"},
         {"depth": 4, "label": "Plasma Channel", "desc": "10,000-20,000°C plasma column lasting microseconds. Thermal conductivity of dielectric determines how fast the crater quenches"},
         {"depth": 5, "label": "Quantum Tunneling Ignition", "desc": "Spark initiation: electron field emission across the gap (Fowler-Nordheim tunneling) creates the first conductive bridge through the dielectric"},
     ]},
    {"id": "threading", "name": "Thread Cutting", "color": "#A78BFA", "category": "Precision",
     "origin": "Creating helical grooves — the universal mechanical fastening system since Archimedes",
     "components": ["Thread form (60° UNC/UNF)", "Lead screw synchronization", "Thread gauge", "Single-point tool", "Pitch diameter"],
     "system": "Helical geometry generation", "uses": "Fastener production, lead screws, pipe threads, ball screws, worm gears",
     "dive_layers": [
         {"depth": 0, "label": "The Cut", "desc": "Lathe synchronized: spindle rotation locked to carriage feed via lead screw. One revolution = one pitch advanced. The helix writes itself"},
         {"depth": 1, "label": "Thread Geometry", "desc": "Major diameter, minor diameter, pitch diameter — the pitch diameter is the functional size. Thread gauges check this invisible cylinder"},
         {"depth": 2, "label": "Multi-Pass Strategy", "desc": "29.5° infeed (modified flank) or radial infeed. 6-12 spring passes. Depth per pass decreases as thread deepens to manage chip load"},
         {"depth": 3, "label": "Thread Fit Classes", "desc": "Class 1 (loose), Class 2 (general), Class 3 (precision). Tolerance bands measured in 0.0001 inch on pitch diameter. Fit is function"},
         {"depth": 4, "label": "Helix Mechanics", "desc": "Mechanical advantage = pitch / (π × mean diameter). A 1/4-20 bolt multiplies torque 28x. The inclined plane wrapped around a cylinder"},
         {"depth": 5, "label": "Friction & Preload", "desc": "Bolt preload creates clamping force via elastic stretch. 90% of torque is lost to friction. The coefficient of friction between threads determines everything"},
     ]},
])

# ── ANATOMY +3 ──
ANATOMY_MATERIALS.extend([
    {"id": "endocrine", "name": "Endocrine System", "color": "#F59E0B", "category": "Chemical Signaling",
     "origin": "The body's chemical messenger network — glands secreting hormones that regulate every physiological process",
     "components": ["Hypothalamus", "Pituitary", "Thyroid", "Adrenals", "Pancreatic islets"],
     "system": "Neuroendocrine axis", "uses": "Metabolic regulation, growth, stress response, reproduction, homeostasis",
     "dive_layers": [
         {"depth": 0, "label": "Gland Network", "desc": "Endocrine glands release hormones directly into blood — no ducts. The hypothalamus is the master regulator, governing the pituitary below it"},
         {"depth": 1, "label": "Feedback Loops", "desc": "Negative feedback: high thyroid hormone (T4) suppresses TSH. The thermostat principle applied to biochemistry. Disruption = disease"},
         {"depth": 2, "label": "Hormone Classes", "desc": "Peptides (insulin: fast, water-soluble), steroids (cortisol: slow, lipid-soluble), amines (epinephrine: rapid). Structure determines speed and mechanism"},
         {"depth": 3, "label": "Receptor Binding", "desc": "Peptides bind surface receptors → second messenger cascade (cAMP). Steroids enter the cell → bind nuclear receptors → alter gene transcription directly"},
         {"depth": 4, "label": "HPA Axis", "desc": "Hypothalamus → CRH → Pituitary → ACTH → Adrenal cortex → Cortisol. The stress response cascade that can save your life or destroy your health"},
         {"depth": 5, "label": "Molecular Signaling", "desc": "G-protein coupled receptors: ligand binding → conformational change → GDP/GTP exchange → adenylyl cyclase activation. Signal amplification: 1 hormone molecule activates 10,000 enzyme molecules"},
     ]},
    {"id": "lymphatic", "name": "Lymphatic System", "color": "#22C55E", "category": "Immune Defense",
     "origin": "The body's drainage and defense network — one-way fluid recovery system and immune surveillance highway",
     "components": ["Lymph nodes", "Thoracic duct", "Spleen", "Thymus", "MALT (mucosal tissue)"],
     "system": "Immune-Fluid axis", "uses": "Infection defense, fluid balance, fat absorption, cancer metastasis surveillance",
     "dive_layers": [
         {"depth": 0, "label": "Lymph Network", "desc": "3 liters of fluid leak from capillaries daily. Without lymphatic return, tissues would swell fatally in hours. The forgotten circulatory system"},
         {"depth": 1, "label": "Node Architecture", "desc": "600+ lymph nodes: cortex (B-cells), paracortex (T-cells), medulla (macrophages). Each node filters lymph and mounts immune responses"},
         {"depth": 2, "label": "Immune Surveillance", "desc": "Dendritic cells carry antigens from tissue to lymph node → present to naive T-cells → clonal expansion. The adaptive immune response is born here"},
         {"depth": 3, "label": "Lymphocyte Activation", "desc": "Antigen presentation via MHC-I (CD8 T-cells) or MHC-II (CD4 T-cells). Two-signal requirement prevents autoimmunity: antigen + co-stimulation"},
         {"depth": 4, "label": "Cytokine Networks", "desc": "IL-2 (T-cell growth), IFN-γ (macrophage activation), TNF-α (inflammation). Cytokine storms: when the immune system's volume knob breaks off"},
         {"depth": 5, "label": "Clonal Selection", "desc": "Burnet's theory: 10¹¹ unique lymphocyte clones, each with a randomly generated receptor. Antigen selects the matching clone for expansion. Evolution in miniature, happening inside you right now"},
     ]},
    {"id": "integumentary", "name": "Integumentary (Skin)", "color": "#EC4899", "category": "Barrier System",
     "origin": "The body's largest organ — 22 square feet of living armor that senses, protects, and thermoregulates",
     "components": ["Epidermis", "Dermis", "Hypodermis", "Melanocytes", "Sensory receptors"],
     "system": "Barrier-Sensory axis", "uses": "Protection, thermoregulation, sensation, vitamin D synthesis, immune defense",
     "dive_layers": [
         {"depth": 0, "label": "Skin Surface", "desc": "Stratum corneum: 15-20 layers of dead, keratin-packed cells. You shed 30,000-40,000 of these cells every hour. Your outer shell is a graveyard"},
         {"depth": 1, "label": "Epidermal Layers", "desc": "Basale → spinosum → granulosum → lucidum → corneum. A 28-day conveyor belt from living stem cell to dead armor plate"},
         {"depth": 2, "label": "Melanin Shield", "desc": "Melanocytes transfer melanosomes to keratinocytes via dendrites. UVB → DNA thymine dimers → melanin absorbs future UV. Tan is a scar response"},
         {"depth": 3, "label": "Dermal Matrix", "desc": "Collagen Type I (80%) + elastin (2%) in a ground substance of glycosaminoglycans. The dermis gives skin its tensile strength and elasticity"},
         {"depth": 4, "label": "Sensory Transduction", "desc": "Merkel cells (pressure), Meissner (light touch), Pacinian (vibration), Ruffini (stretch). Each converts mechanical energy to action potentials"},
         {"depth": 5, "label": "Mechanotransduction", "desc": "Piezo1/Piezo2 ion channels: mechanical force opens the channel → Ca²⁺ influx → depolarization. Touch becomes electricity at the molecular gate"},
     ]},
])

# ── PEDAGOGY +3 ──
PEDAGOGY_MATERIALS.extend([
    {"id": "curriculum_mapping", "name": "Curriculum Mapping", "color": "#F59E0B", "category": "Design",
     "origin": "Backward design architecture — building the learning map before writing a single lesson",
     "components": ["Standards alignment", "Scope & sequence", "Vertical articulation", "Horizontal integration", "Assessment mapping"],
     "system": "Instructional design axis", "uses": "Course development, program coherence, accreditation, gap analysis",
     "dive_layers": [
         {"depth": 0, "label": "The Map", "desc": "What students should know (standards), when they learn it (sequence), and how we verify (assessments). The blueprint before the building"},
         {"depth": 1, "label": "Backward Design", "desc": "Wiggins & McTighe: Start with the assessment. What evidence of understanding do you need? Then design the learning experience to produce that evidence"},
         {"depth": 2, "label": "Spiral Curriculum", "desc": "Bruner: Revisit core concepts at increasing complexity. Fractions in 3rd grade become ratios in 6th and proportional reasoning in 9th. The helix of mastery"},
         {"depth": 3, "label": "Cognitive Load Theory", "desc": "Sweller: Working memory holds 4±1 chunks. Intrinsic load (content complexity) + extraneous load (poor design) must not exceed capacity. Design for the bottleneck"},
         {"depth": 4, "label": "Transfer Theory", "desc": "Near transfer (similar context) is easy. Far transfer (novel context) is the holy grail. Teach for transfer by varying practice contexts and requiring abstraction"},
         {"depth": 5, "label": "Schema Construction", "desc": "Expert knowledge is organized in hierarchical schemas that chunk information. Novices see details; experts see patterns. Curriculum builds schemas deliberately"},
     ]},
    {"id": "differentiation", "name": "Differentiated Instruction", "color": "#22C55E", "category": "Adaptive",
     "origin": "Teaching the same standard through multiple pathways — because 30 students means 30 different brains",
     "components": ["Readiness tiers", "Learning profiles", "Interest grouping", "Flexible pacing", "Formative assessment loops"],
     "system": "Adaptive instruction axis", "uses": "Inclusive classrooms, gifted education, special education, multilingual learners",
     "dive_layers": [
         {"depth": 0, "label": "The Classroom", "desc": "Same learning goal, multiple pathways. Tier 1 (approaching), Tier 2 (meeting), Tier 3 (exceeding). The ceiling is removed, the floor is supported"},
         {"depth": 1, "label": "Content-Process-Product", "desc": "Differentiate WHAT students learn (content), HOW they process it (activities), or WHAT they produce (assessment). Tomlinson's three levers"},
         {"depth": 2, "label": "Formative Assessment", "desc": "Exit tickets, think-pair-share, whiteboards. The 3-minute check that tells you who needs reteaching BEFORE the test. Assessment AS learning, not OF learning"},
         {"depth": 3, "label": "Zone of Proximal Development", "desc": "Vygotsky: The sweet spot between 'I can do this alone' and 'I can't do this at all.' Scaffolding provides temporary support in this zone"},
         {"depth": 4, "label": "Neuroplasticity in Learning", "desc": "Repeated retrieval strengthens synaptic connections (Hebb's Law). Spaced practice > massed practice. Interleaving > blocking. The brain learns by struggling, not by ease"},
         {"depth": 5, "label": "Universal Design for Learning", "desc": "CAST framework: Multiple means of engagement (WHY), representation (WHAT), action/expression (HOW). Designing for the margins benefits the center. Variability is the norm, not the exception"},
     ]},
    {"id": "behavioral_psych", "name": "Behavioral Psychology", "color": "#EF4444", "category": "Motivation",
     "origin": "The science of why students do what they do — from Pavlov's bell to self-determination theory",
     "components": ["Classical conditioning", "Operant conditioning", "Self-determination theory", "Growth mindset", "Intrinsic motivation"],
     "system": "Behavioral-Motivational axis", "uses": "Classroom management, habit formation, motivation design, behavior intervention",
     "dive_layers": [
         {"depth": 0, "label": "Observable Behavior", "desc": "Stimulus → Response. The behaviorist sees what the student DOES, not what they think. Measurable, observable, modifiable"},
         {"depth": 1, "label": "Reinforcement Schedules", "desc": "Variable ratio (gambling, most addictive), fixed interval (paycheck), variable interval (pop quizzes). The schedule determines persistence of behavior"},
         {"depth": 2, "label": "Self-Determination", "desc": "Deci & Ryan: Autonomy (I choose), Competence (I can), Relatedness (I belong). Satisfy all three and intrinsic motivation ignites. Deprive one and it dies"},
         {"depth": 3, "label": "Growth Mindset", "desc": "Dweck: 'I can't do this YET.' Neural pathways strengthen with effort. Praising effort over ability increases persistence. Fixed mindset is a self-fulfilling prophecy"},
         {"depth": 4, "label": "Extinction Burst", "desc": "Remove a reinforcer and the behavior temporarily INCREASES before decreasing. The tantrum gets worse before it stops. Understanding this prevents giving in at the worst moment"},
         {"depth": 5, "label": "Dopamine Prediction Error", "desc": "Schultz: Dopamine fires not for reward, but for UNEXPECTED reward. Predicted rewards produce no dopamine signal. The brain learns from surprise, not from satisfaction"},
     ]},
])

# ── WELDING +3 ──
WELDING_MATERIALS.extend([
    {"id": "flux_core", "name": "Flux-Core Arc", "color": "#F97316", "gauge": "0.045 wire", "tensile_mpa": 480,
     "origin": "Self-shielded or dual-shield wire welding — structural steel fabrication without external gas bottles",
     "composition": ["Steel sheath (outer)", "Flux core (rutile/fluoride)", "Deoxidizers", "Alloying elements", "Gas-forming compounds"],
     "crystal_structure": "Tubular wire with mineral core", "uses": "Structural steel, shipbuilding, bridge fabrication, field welding in wind",
     "dive_layers": [
         {"depth": 0, "label": "Wire Feed", "desc": "Looks like MIG but the wire is hollow — flux inside creates its own shielding gas and slag. Drag technique, not push. Deeper penetration than solid wire"},
         {"depth": 1, "label": "Self-Shielding", "desc": "Inner flux decomposes at arc temperature: CaCO₃ → CaO + CO₂. The CO₂ displaces atmospheric nitrogen. No gas bottle needed — works in 35 mph wind"},
         {"depth": 2, "label": "Slag System", "desc": "Molten flux floats on top of the weld pool, protecting it during solidification. Basic flux: CaF₂ + CaCO₃ + TiO₂. Rutile flux: higher deposition, less impact toughness"},
         {"depth": 3, "label": "Hydrogen Control", "desc": "Moisture in flux = hydrogen in weld = delayed cracking. Store wire in heated cabinets. H4 designation means <4 mL H₂ per 100g of deposited metal"},
         {"depth": 4, "label": "Transfer Modes", "desc": "Globular transfer at low voltage, spray above threshold. Dual-shield (E71T-1) achieves spray arc with CO₂/Ar mix. Transfer mode determines spatter and penetration"},
         {"depth": 5, "label": "Thermodynamic Shielding", "desc": "Flux decomposition is endothermic — it cools the arc periphery, constricting the plasma column. Hotter, narrower arc = deeper penetration. Chemistry shapes the physics"},
     ]},
    {"id": "plasma_cutting", "name": "Plasma Cutting", "color": "#60A5FA", "gauge": "Up to 1.5 inch", "tensile_mpa": 0,
     "origin": "Ionized gas cutting — a 40,000°F plasma jet that melts and blows metal away at sonic velocity",
     "composition": ["Tungsten electrode (cathode)", "Copper nozzle (constricts arc)", "Plasma gas (air/N₂/O₂)", "Shield gas (CO₂/N₂)", "Swirl ring"],
     "crystal_structure": "Plasma (4th state of matter)", "uses": "Steel/aluminum plate cutting, CNC profiling, gouging, demolition, art fabrication",
     "dive_layers": [
         {"depth": 0, "label": "The Cut", "desc": "Pilot arc ionizes the gas → transferred arc to workpiece → 40,000°F plasma jet melts metal → high-velocity gas blows molten metal away. 200 inches/minute on thin plate"},
         {"depth": 1, "label": "Arc Constriction", "desc": "Copper nozzle orifice squeezes the arc from 3/8 inch to 0.040 inch diameter. Energy density increases 100x. Same power, smaller target = hotter"},
         {"depth": 2, "label": "Dross Formation", "desc": "Low-speed dross: re-solidified metal on bottom edge (too slow). High-speed dross: uncut material (too fast). Perfect speed = clean edge, no dross"},
         {"depth": 3, "label": "Gas Selection", "desc": "Air: cheapest (mild steel). O₂: exothermic reaction on steel (fastest). N₂: non-reactive (stainless/aluminum). H₂/N₂ mix: best quality on stainless"},
         {"depth": 4, "label": "Ionization Energy", "desc": "First ionization of nitrogen: 14.5 eV. The nozzle voltage must overcome this threshold. Once ionized, the gas conducts — plasma is the 4th state of matter"},
         {"depth": 5, "label": "Magneto-Hydrodynamics", "desc": "Lorentz force (J × B) constricts the plasma column (pinch effect). Self-magnetic field from 200A current squeezes the arc. The plasma confines itself"},
     ]},
    {"id": "underwater", "name": "Underwater/Hyperbaric", "color": "#2DD4BF", "gauge": "Depth-rated", "tensile_mpa": 460,
     "origin": "Welding at depth — where water pressure, limited visibility, and hydrogen embrittlement make every joint a survival challenge",
     "composition": ["Waterproof electrode coating", "Bubble-forming flux", "Diving gas (HeO₂)", "Hyperbaric chamber", "Sacrificial anodes"],
     "crystal_structure": "Wet/Dry weld microstructure depends on pressure", "uses": "Pipeline repair, offshore rigs, ship hull repair, dam gates, submarine maintenance",
     "dive_layers": [
         {"depth": 0, "label": "Wet Welding", "desc": "Stick welding directly in water. The flux coating creates a gas bubble around the arc. Visibility: 6 inches. Current: 20% higher than dry. The most hostile welding environment on Earth"},
         {"depth": 1, "label": "Dry Habitat", "desc": "Hyperbaric chamber clamped to structure, water pumped out. Divers weld in a gas environment at ambient pressure. Better quality but 10x the cost of wet welding"},
         {"depth": 2, "label": "Hydrogen Challenge", "desc": "Water dissociates at arc temperature: H₂O → H₂ + O. Atomic hydrogen dissolves in steel, causes porosity, cold cracking. The #1 enemy of underwater welds"},
         {"depth": 3, "label": "Pressure Effects", "desc": "At depth, increased gas density stabilizes the arc but raises arc voltage. 10 meters = 1 additional atmosphere. Weld cooling rate increases dramatically in water"},
         {"depth": 4, "label": "Rapid Quenching", "desc": "Water cooling rate: 100-500°C/second vs 10-50°C/second in air. Martensite forms in HAZ even on mild steel. Pre-heat is impossible. Temper bead technique compensates"},
         {"depth": 5, "label": "Henry's Law", "desc": "Gas solubility in metal proportional to partial pressure. At 30 meters depth, hydrogen solubility in weld pool quadruples. The physics of depth makes every dive-weld a metallurgical challenge"},
     ]},
])

# ── NUTRITION +3 ──
NUTRITION_MATERIALS.extend([
    {"id": "micronutrient", "name": "Micronutrient Density", "color": "#22C55E", "category": "Vitamins & Minerals",
     "origin": "The invisible architecture of health — 30+ essential micronutrients that run 10,000 enzymatic reactions per second",
     "components": ["Fat-soluble vitamins (A, D, E, K)", "Water-soluble vitamins (B-complex, C)", "Macro-minerals (Ca, Mg, K)", "Trace minerals (Fe, Zn, Se)", "Phytonutrients"],
     "system": "Enzymatic-Cofactor axis", "uses": "Deficiency prevention, performance optimization, immune function, bone health, mental clarity",
     "dive_layers": [
         {"depth": 0, "label": "Nutrient Label", "desc": "RDA (Recommended Daily Allowance) vs DV (Daily Value) vs UL (Upper Limit). The label tells you the minimum; optimal intake is often higher"},
         {"depth": 1, "label": "Bioavailability", "desc": "Heme iron (meat): 25% absorbed. Non-heme iron (plants): 5% absorbed. Vitamin C boosts non-heme absorption 3-6x. The nutrient is only as good as its absorption"},
         {"depth": 2, "label": "Synergy & Antagonism", "desc": "Vitamin D enables calcium absorption. Zinc and copper compete for the same transporter. Iron blocks zinc. Magnesium activates vitamin D. Nutrients are a network, not a list"},
         {"depth": 3, "label": "Enzymatic Cofactors", "desc": "Zinc is a cofactor for 300+ enzymes. Magnesium for 600+. B12 for methylation. Without the cofactor, the enzyme is a lock without a key"},
         {"depth": 4, "label": "Epigenetic Effects", "desc": "Folate provides methyl groups for DNA methylation — literally controlling which genes are expressed. Nutrient status writes on the genome"},
         {"depth": 5, "label": "Redox Biochemistry", "desc": "Vitamin C donates electrons (antioxidant), then vitamin E regenerates it, then glutathione regenerates E. The antioxidant relay: a chain of electron transfers protecting every cell membrane"},
     ]},
    {"id": "gut_microbiome", "name": "Gut Microbiome", "color": "#A78BFA", "category": "Microbial Ecosystem",
     "origin": "The 100 trillion organisms in your gut — a metabolic organ weighing 4 pounds that we didn't know existed 30 years ago",
     "components": ["Bacteroidetes", "Firmicutes", "Short-chain fatty acids", "Gut-brain axis", "Mucosal barrier"],
     "system": "Microbiome-Immune axis", "uses": "Immune regulation, mood modulation, metabolic health, inflammation control, disease prevention",
     "dive_layers": [
         {"depth": 0, "label": "The Ecosystem", "desc": "More microbial cells than human cells. More microbial genes than human genes. You are a superorganism — a walking ecosystem with a human scaffold"},
         {"depth": 1, "label": "Diversity = Health", "desc": "Shannon diversity index: higher = healthier. Hunter-gatherers: 1,200+ species. Western gut: 600-800. Every course of antibiotics is a forest fire"},
         {"depth": 2, "label": "Fermentation Products", "desc": "Fiber → butyrate (fuels colonocytes), propionate (liver), acetate (peripheral). Short-chain fatty acids are the currency your microbes pay you for feeding them fiber"},
         {"depth": 3, "label": "Gut-Brain Axis", "desc": "Vagus nerve: 80% of fibers run gut → brain. Serotonin: 95% made in gut. Microbes produce GABA, dopamine, norepinephrine. Your mood is partly microbial"},
         {"depth": 4, "label": "Immune Training", "desc": "70% of immune tissue is gut-associated (GALT). Commensal bacteria train regulatory T-cells to tolerate self. No microbiome = autoimmunity"},
         {"depth": 5, "label": "Quorum Sensing", "desc": "Bacteria communicate via signaling molecules (autoinducers). At threshold concentration, the colony switches behavior collectively. Democracy at the molecular level"},
     ]},
    {"id": "metabolic_flex", "name": "Metabolic Flexibility", "color": "#F59E0B", "category": "Energy Systems",
     "origin": "The body's ability to switch between fuel sources — the metabolic skill that separates health from disease",
     "components": ["Glycolysis", "Beta-oxidation", "Ketogenesis", "Mitochondrial biogenesis", "Insulin sensitivity"],
     "system": "Energy-Substrate axis", "uses": "Fat loss, endurance performance, metabolic health, diabetes prevention, longevity",
     "dive_layers": [
         {"depth": 0, "label": "Fuel Selection", "desc": "Fed state: glucose (insulin high). Fasted state: fatty acids (insulin low). Metabolic flexibility means you can switch smoothly. Metabolic inflexibility means you can't burn fat"},
         {"depth": 1, "label": "Randle Cycle", "desc": "Fatty acid oxidation inhibits glucose oxidation and vice versa. The two fuel systems compete at the mitochondrial gate. Insulin is the traffic controller"},
         {"depth": 2, "label": "Mitochondrial Density", "desc": "Exercise increases mitochondrial number (biogenesis via PGC-1α) and efficiency. More mitochondria = more metabolic flexibility = better fuel switching"},
         {"depth": 3, "label": "Ketone Metabolism", "desc": "Liver converts fatty acids to beta-hydroxybutyrate and acetoacetate. Brain runs on ketones when glucose is scarce. Evolutionary insurance policy for famine"},
         {"depth": 4, "label": "Insulin Signaling", "desc": "Insulin binds receptor → IRS-1 → PI3K → Akt → GLUT4 translocation. This cascade moves glucose transporters to the cell surface. Resistance at any step = type 2 diabetes"},
         {"depth": 5, "label": "Electron Transport Chain", "desc": "Complex I-IV + ATP synthase: electrons from food fall through redox potential gradient, pumping protons. ATP synthase spins at 9,000 RPM. All of metabolism converges on this molecular turbine"},
     ]},
])

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# V66.0 ABSOLUTE ZERO PARITY — Final 4 modules from 3 → 6 materials
# 132 total materials. 100% density. Zero empty shelves.
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ── AUTOMOTIVE +3 ──
AUTOMOTIVE_MATERIALS.extend([
    {"id": "hybrid_ev", "name": "Hybrid/EV Systems", "color": "#22C55E", "category": "Electrification", "complexity": "Advanced",
     "origin": "The electrification revolution — where 150 years of combustion engineering meets the lithium ion",
     "components": ["Battery pack (Li-ion NMC)", "Inverter (DC→AC)", "Permanent magnet motor", "Regenerative braking", "Thermal management"],
     "system": "Electrochemical-Mechanical axis", "uses": "EV diagnostics, high-voltage safety, battery health, range optimization",
     "dive_layers": [
         {"depth": 0, "label": "Under the Hood", "desc": "No engine noise. 400V battery pack under the floor, inverter converts DC to 3-phase AC, motor spins the wheels. 90% drivetrain efficiency vs 25% for ICE"},
         {"depth": 1, "label": "Battery Architecture", "desc": "Cells → modules → pack. 7,000+ cylindrical cells in a Tesla Model 3. BMS (Battery Management System) balances every cell within 5mV"},
         {"depth": 2, "label": "Regenerative Braking", "desc": "Motor becomes generator under deceleration. Kinetic energy → electrical energy → stored in battery. Recovers 60-70% of braking energy. Brake pads last 200,000 miles"},
         {"depth": 3, "label": "Inverter Switching", "desc": "IGBTs or SiC MOSFETs switch 400V at 10,000 Hz. Pulse width modulation creates a synthetic sine wave from DC. The inverter IS the throttle"},
         {"depth": 4, "label": "Electrochemistry", "desc": "Li⁺ ions shuttle between graphite anode and NMC cathode through liquid electrolyte. Intercalation, not plating. Side reactions = capacity fade"},
         {"depth": 5, "label": "Solid-State Frontier", "desc": "Replace liquid electrolyte with ceramic (Li₇La₃Zr₂O₁₂). No dendrites, no fires, 2x energy density. The physics of the next paradigm — lithium ions moving through crystal lattice"},
     ]},
    {"id": "transmission", "name": "Transmission Overhaul", "color": "#A78BFA", "category": "Powertrain", "complexity": "Advanced",
     "origin": "Gear-based torque multiplication — matching engine RPM to wheel speed across all driving conditions",
     "components": ["Planetary gear sets", "Torque converter", "Valve body", "Clutch packs", "Synchronizers"],
     "system": "Mechanical-Hydraulic axis", "uses": "Transmission rebuild, shift quality diagnosis, fluid service, performance tuning",
     "dive_layers": [
         {"depth": 0, "label": "The Gearbox", "desc": "Manual: driver selects gear via synchronizers. Automatic: hydraulic valve body selects via clutch packs. CVT: belt on variable-diameter pulleys. All solve the same problem: torque multiplication"},
         {"depth": 1, "label": "Planetary Gear Set", "desc": "Sun gear + planet gears + ring gear. Hold any one, drive another, and the third outputs at a different ratio. One gear set, infinite combinations. Simpson/Ravigneaux compound sets give 6-10 ratios"},
         {"depth": 2, "label": "Torque Converter", "desc": "Impeller (engine-side) throws fluid at turbine (transmission-side). Stator redirects fluid for torque multiplication up to 2.5:1. Lock-up clutch eliminates slip at cruise"},
         {"depth": 3, "label": "Hydraulic Control", "desc": "Valve body: a hydraulic computer. Governor pressure (speed) + throttle pressure (load) = shift timing. Modern: solenoids replace governors. TCM controls 6+ solenoids simultaneously"},
         {"depth": 4, "label": "Gear Tooth Contact", "desc": "Hertzian contact stress at gear mesh: 1,000+ MPa on a surface the size of a grain of rice. Involute tooth profile ensures constant velocity ratio regardless of center distance variation"},
         {"depth": 5, "label": "Conservation of Angular Momentum", "desc": "τ = Iα. Torque = moment of inertia × angular acceleration. Gear ratio trades RPM for torque. Energy is conserved — the transmission does not create power, it transforms it. The fundamental trade: speed for force"},
     ]},
    {"id": "ecu_remap", "name": "ECU Remapping", "color": "#3B82F6", "category": "Digital", "complexity": "Expert",
     "origin": "Rewriting the engine's brain — modifying fuel maps, ignition timing, and boost pressure for performance or efficiency",
     "components": ["ECU flash tool", "Fuel map (VE table)", "Ignition advance table", "Boost control map", "Lambda targets"],
     "system": "Digital-Thermodynamic axis", "uses": "Performance tuning, emissions compliance, fuel economy, forced induction management",
     "dive_layers": [
         {"depth": 0, "label": "The Flash", "desc": "Connect to OBD-II port. Read stock calibration. Modify tables. Write new calibration. The engine breathes differently in 15 minutes. Power, torque, response — all change"},
         {"depth": 1, "label": "Fuel Map (VE Table)", "desc": "3D surface: RPM × Load → Volumetric Efficiency (%). Determines injector pulse width at every operating point. 16×16 grid = 256 cells, each hand-tuned on a dyno"},
         {"depth": 2, "label": "Ignition Advance", "desc": "Degrees before TDC where spark fires. More advance = more power (up to the knock limit). Less advance = safer but slower. The razor edge between peak power and engine destruction"},
         {"depth": 3, "label": "Knock Detection", "desc": "Piezoelectric sensor on the block listens for detonation vibration (6-8 kHz). ECU retards timing 2° per knock event. Knock = uncontrolled detonation = melted pistons"},
         {"depth": 4, "label": "Closed-Loop Feedback", "desc": "O₂ sensor reads exhaust → ECU adjusts fuel trim ±25% → targets λ=1 (stoichiometric). Short-term fuel trim is real-time. Long-term fuel trim reveals systematic drift. The engine teaches itself"},
         {"depth": 5, "label": "Thermodynamic Optimization", "desc": "MBT (Minimum advance for Best Torque): the ignition timing where peak cylinder pressure occurs at 15° ATDC. Every engine has one optimal point for each RPM/load cell. Finding it is finding the engine's truth"},
     ]},
])

# ── MEDITATION +3 ──
MEDITATION_MATERIALS.extend([
    {"id": "theta_wave", "name": "Theta Wave Induction", "color": "#8B5CF6", "category": "Brainwave", "complexity": "Advanced",
     "origin": "Accessing the 4-8 Hz frequency band — the gateway between waking consciousness and the subconscious",
     "components": ["Binaural beats", "Isochronic tones", "Progressive relaxation", "Hypnagogic threshold", "Sensory withdrawal"],
     "system": "Neuro-Frequency axis", "uses": "Deep meditation, creativity, healing, subconscious reprogramming, lucid dreaming",
     "dive_layers": [
         {"depth": 0, "label": "The Practice", "desc": "Lie down. Close eyes. Headphones with 6 Hz binaural beat (200 Hz left, 206 Hz right). Allow the body to dissolve. The theta state is the doorway between wake and sleep"},
         {"depth": 1, "label": "Brainwave Spectrum", "desc": "Gamma (30+ Hz: insight), Beta (13-30: active), Alpha (8-13: relaxed), Theta (4-8: deep meditation/dreams), Delta (0.5-4: deep sleep). Theta is the creative sweet spot"},
         {"depth": 2, "label": "Binaural Entrainment", "desc": "Two slightly different frequencies in each ear → the brain generates a 'phantom' beat at the difference frequency. 200 Hz + 206 Hz = 6 Hz theta perception in the superior olivary nucleus"},
         {"depth": 3, "label": "Hypnagogic State", "desc": "The threshold between wake and sleep: spontaneous imagery, loosened logic, creative associations. Edison and Dalí used this state deliberately. The mind's most fertile ground"},
         {"depth": 4, "label": "Thalamocortical Oscillation", "desc": "Thalamus acts as a pacemaker: rhythmic inhibition-rebound cycles generate theta waves across the cortex. Meditation deepens these oscillations — coherence spreads hemisphere to hemisphere"},
         {"depth": 5, "label": "Quantum Coherence in Microtubules", "desc": "Penrose-Hameroff Orch-OR theory: quantum computations in neuronal microtubules may collapse at theta frequencies. Consciousness as orchestrated quantum reduction — the deepest hypothesis on why meditation transforms awareness"},
     ]},
    {"id": "heart_coherence", "name": "Heart-Math Coherence", "color": "#EF4444", "category": "Psychophysiology", "complexity": "Intermediate",
     "origin": "Heart-brain synchronization — the measurable state where heart rhythm, breath, and emotion align into a single coherent wave",
     "components": ["Heart rate variability", "Coherent breathing (5.5 bpm)", "Positive emotion focus", "Inner Balance sensor", "Autonomic balance"],
     "system": "Cardiac-Neural axis", "uses": "Stress resilience, emotional regulation, peak performance, trauma recovery, blood pressure management",
     "dive_layers": [
         {"depth": 0, "label": "The Practice", "desc": "Focus attention on the heart. Breathe slowly (5.5 breaths/min). Generate a feeling of gratitude or appreciation. Within 60 seconds, your HRV pattern shifts from chaotic to coherent"},
         {"depth": 1, "label": "HRV Pattern", "desc": "Coherent HRV: smooth sine wave at 0.1 Hz. Incoherent HRV: jagged, erratic. The pattern reflects autonomic nervous system balance. Coherence = sympathetic/parasympathetic harmony"},
         {"depth": 2, "label": "Baroreflex Loop", "desc": "Blood pressure sensors in the carotid sinus trigger heart rate adjustment every 10 seconds (0.1 Hz). Breathing at this frequency resonates with the baroreflex — maximum HRV amplitude"},
         {"depth": 3, "label": "Heart-Brain Communication", "desc": "The heart sends MORE information to the brain than the brain sends to the heart. 40,000 sensory neurons in the heart. The vagus nerve carries 80% of its traffic upward"},
         {"depth": 4, "label": "Electromagnetic Field", "desc": "The heart generates an electromagnetic field 100x stronger than the brain, measurable 3+ feet from the body. Coherent heart rhythm creates coherent field — other people's nervous systems entrain to it"},
         {"depth": 5, "label": "Nonlinear Dynamics", "desc": "Heart rhythm is a chaotic attractor — deterministic but non-repeating. Coherence shifts the attractor from strange (multi-lobed) to periodic (single loop). Order emerging from chaos — the mathematical signature of flow state"},
     ]},
    {"id": "stoic_vis", "name": "Stoic Visualization", "color": "#D4AF37", "category": "Philosophical", "complexity": "Intermediate",
     "origin": "Premeditatio malorum — the ancient Stoic practice of rehearsing adversity to build unshakable equanimity",
     "components": ["Negative visualization", "Memento mori", "View from above", "Dichotomy of control", "Voluntary discomfort"],
     "system": "Cognitive-Stoic axis", "uses": "Anxiety reduction, gratitude cultivation, decision clarity, leadership resilience, fear inoculation",
     "dive_layers": [
         {"depth": 0, "label": "The Practice", "desc": "Sit quietly. Visualize losing something you value — health, a loved one, your home. Feel the grief fully. Open your eyes. Everything is still here. Gratitude floods the gap between imagined loss and present reality"},
         {"depth": 1, "label": "Premeditatio Malorum", "desc": "Seneca: 'We suffer more in imagination than in reality.' By rehearsing adversity calmly, the Stoic is never surprised. The worst case, pre-lived, loses its power to destabilize"},
         {"depth": 2, "label": "Dichotomy of Control", "desc": "Epictetus: 'Some things are up to us, some are not.' Separate your thoughts, actions, and values (up to you) from outcomes, others' opinions, and events (not up to you). Serenity lives in this separation"},
         {"depth": 3, "label": "View from Above", "desc": "Marcus Aurelius: zoom out from your problem to your city, your continent, the Earth, the cosmos. Your crisis is a grain of sand on an infinite beach. Perspective dissolves anxiety"},
         {"depth": 4, "label": "Hedonic Adaptation", "desc": "Brickman & Campbell: lottery winners return to baseline happiness within 6 months. Negative visualization deliberately reverses adaptation — you re-experience what you already have as if newly received"},
         {"depth": 5, "label": "Amor Fati", "desc": "Nietzsche/Stoic convergence: 'Love your fate.' Not merely accepting what happens, but WANTING it exactly as it is. The universe is not indifferent — it is the forge. Every obstacle is the raw material of growth. This is the deepest meditation: reality itself as teacher"},
     ]},
])

# ── SPEAKING +3 ──
SPEAKING_MATERIALS.extend([
    {"id": "rhetoric", "name": "Rhetorical Devices", "color": "#3B82F6", "category": "Language Craft",
     "origin": "The toolbox of eloquence — 2,500 years of techniques for making words unforgettable",
     "components": ["Anaphora", "Tricolon", "Chiasmus", "Antithesis", "Metaphor"],
     "system": "Linguistic-Persuasion axis", "uses": "Speechwriting, copywriting, preaching, political oratory, debate",
     "dive_layers": [
         {"depth": 0, "label": "The Device", "desc": "Rhetorical devices are patterns in language that create emphasis, rhythm, and memorability. They turn information into impact. Every great speech is a catalog of these patterns"},
         {"depth": 1, "label": "Repetition Structures", "desc": "Anaphora: 'I have a dream...' (same beginning). Epistrophe: '...of the people, by the people, for the people' (same ending). Symploce: both. Repetition is rhythm is memory"},
         {"depth": 2, "label": "Tricolon", "desc": "Three parallel phrases: 'Veni, vidi, vici.' 'Life, liberty, pursuit of happiness.' 'Government of, by, and for the people.' The rule of three: two is a coincidence, three is a pattern"},
         {"depth": 3, "label": "Chiasmus", "desc": "ABBA reversal: 'Ask not what your country can do for you — ask what you can do for your country.' The mirror structure creates a feeling of completion and inevitability"},
         {"depth": 4, "label": "Metaphor Theory", "desc": "Lakoff & Johnson: we think IN metaphors. 'Argument is war' (attack, defend, win). 'Time is money' (spend, save, waste). The metaphor chosen determines the thought available"},
         {"depth": 5, "label": "Phonaesthetics", "desc": "Sound symbolism: 'gl-' words often relate to light (glow, glitter, gleam). Plosives (/p/, /b/, /t/, /d/) convey force. Fricatives (/s/, /f/) convey softness. The sound of language carries meaning below conscious awareness"},
     ]},
    {"id": "body_analysis", "name": "Body Language Analysis", "color": "#22C55E", "category": "Nonverbal",
     "origin": "The 93% of communication that isn't words — reading and projecting nonverbal signals",
     "components": ["Facial microexpressions", "Proxemics", "Gesture clusters", "Posture analysis", "Eye contact patterns"],
     "system": "Kinesthetic-Social axis", "uses": "Negotiation, interviewing, teaching, leadership, deception detection",
     "dive_layers": [
         {"depth": 0, "label": "The Signal", "desc": "Mehrabian's Rule: 7% words, 38% tone, 55% body language. The numbers are debated; the principle is not. When words and body disagree, people believe the body"},
         {"depth": 1, "label": "Microexpressions", "desc": "Ekman's 7 universal emotions flash across the face in 1/25th of a second: happiness, sadness, anger, fear, surprise, disgust, contempt. Untrained observers miss 80%"},
         {"depth": 2, "label": "Gesture Clusters", "desc": "Single gestures mean nothing. Crossed arms PLUS averted gaze PLUS leaning back = defensive. Read clusters, not singles. Context determines meaning — the same gesture in two settings means two things"},
         {"depth": 3, "label": "Proxemics", "desc": "Hall's zones: intimate (0-18 in), personal (18 in-4 ft), social (4-12 ft), public (12+ ft). Violating zone boundaries triggers autonomic stress response. Power = choosing the distance"},
         {"depth": 4, "label": "Mirror Neuron System", "desc": "We unconsciously mimic others' postures and expressions. Deliberate mirroring builds rapport: the other person's brain registers 'same tribe.' Rapport is a neurological event, not a feeling"},
         {"depth": 5, "label": "Embodied Cognition", "desc": "Carney/Cuddy (debated but provocative): expansive postures increase testosterone and decrease cortisol. The body doesn't just express the mind — it shapes it. Posture changes biochemistry changes confidence"},
     ]},
    {"id": "crisis_comm", "name": "Crisis Communication", "color": "#EF4444", "category": "High-Stakes",
     "origin": "Speaking when everything is on fire — the communication discipline where stakes are existential",
     "components": ["Holding statement", "Stakeholder mapping", "Media training", "Empathy-first framing", "Recovery narrative"],
     "system": "Strategic-Communication axis", "uses": "PR crisis, medical bad news, organizational failure, emergency briefings, legal communication",
     "dive_layers": [
         {"depth": 0, "label": "The Crisis", "desc": "Something went wrong. Publicly. People are scared, angry, or both. The first 60 minutes determine whether you recover in weeks or years. Silence is interpreted as guilt"},
         {"depth": 1, "label": "The Framework", "desc": "Acknowledge → Empathize → Act → Update. Never deny, never minimize, never blame the victim. Lead with what you know, admit what you don't, commit to transparency"},
         {"depth": 2, "label": "Stakeholder Triage", "desc": "Who is affected? Employees first, customers second, media third, shareholders fourth. Get the order wrong and the crisis multiplies. Internal alignment before external messaging"},
         {"depth": 3, "label": "Amygdala Hijack", "desc": "Under threat, the audience's amygdala overrides the prefrontal cortex. Logic is offline. Speak to the fear FIRST. 'I understand you're scared. Here's what we're doing.' Calm the limbic system before engaging reason"},
         {"depth": 4, "label": "Apology Architecture", "desc": "Effective apology = Recognition + Responsibility + Remorse + Remedy. 'We saw it. It's our fault. We're sorry. Here's the fix.' Missing any component and the apology backfires"},
         {"depth": 5, "label": "Narrative Reclamation", "desc": "Post-crisis: rewrite the story. Johnson & Johnson's Tylenol recall (1982) became the gold standard of crisis response. The crisis BECOMES the proof of character. The deepest communication truth: how you fail defines you more than how you succeed"},
     ]},
])

# ── PHILOSOPHY +3 ──
PHILOSOPHY_MATERIALS.extend([
    {"id": "existentialism", "name": "Existentialism", "color": "#6B7280", "category": "Existence", "complexity": "Intermediate",
     "origin": "The philosophy of radical freedom — you are condemned to be free, and must create your own meaning",
     "components": ["Existence precedes essence", "Radical freedom", "Authenticity", "Absurdity", "Bad faith"],
     "system": "Existential-Phenomenological axis", "uses": "Personal identity, therapy, literature, death anxiety, meaning-making",
     "dive_layers": [
         {"depth": 0, "label": "The Situation", "desc": "'Existence precedes essence' — Sartre. A hammer is designed before it exists (essence → existence). You exist BEFORE you have a purpose. You must create your own meaning"},
         {"depth": 1, "label": "Radical Freedom", "desc": "Sartre: you are always free to choose. Even in prison, you choose your response. 'Man is condemned to be free.' This freedom is terrifying — it means you are fully responsible"},
         {"depth": 2, "label": "Bad Faith", "desc": "Pretending you have no choice: 'I had to,' 'I'm just that kind of person.' Bad faith is lying to yourself about your freedom. The waiter who IS a waiter instead of someone playing the role of a waiter"},
         {"depth": 3, "label": "The Absurd", "desc": "Camus: the universe is silent to our demand for meaning. The Absurd is the gap between our need for purpose and the cosmos' indifference. Sisyphus must imagine himself happy"},
         {"depth": 4, "label": "Authentic Existence", "desc": "Heidegger: Being-toward-death. Only by confronting your finitude do you stop living the 'They-self' (das Man) and begin living YOUR life. Death is not the end of life — it is the condition that makes life possible"},
         {"depth": 5, "label": "Facticity and Transcendence", "desc": "You are always both what you are (facticity: your body, history, situation) and what you are not yet (transcendence: your projects, your future). Human existence IS this tension. You are never finished. The final truth of existentialism: you are a verb, not a noun"},
     ]},
    {"id": "stoicism", "name": "Stoicism", "color": "#D4AF37", "category": "Practice", "complexity": "Foundation",
     "origin": "The philosophy of unshakable tranquility — 2,300 years of training the mind to master circumstances",
     "components": ["Dichotomy of control", "Virtue as sole good", "Amor fati", "Memento mori", "Cosmopolitanism"],
     "system": "Ethical-Practical axis", "uses": "Resilience, leadership, military training, CBT foundations, daily philosophy",
     "dive_layers": [
         {"depth": 0, "label": "The Teaching", "desc": "Control what you can (your thoughts, actions, values). Accept what you cannot (outcomes, others, events). This one distinction eliminates 90% of human suffering"},
         {"depth": 1, "label": "Four Cardinal Virtues", "desc": "Wisdom (knowing what's good), Courage (acting despite fear), Justice (treating others fairly), Temperance (moderation in all things). Everything else is 'preferred' or 'dispreferred' — not good or bad"},
         {"depth": 2, "label": "Premeditatio Malorum", "desc": "Seneca: rehearse worst cases in advance. Not pessimism — preparation. The Stoic who has imagined losing everything can never be blindsided. The fear of the thing is worse than the thing itself"},
         {"depth": 3, "label": "Sympatheia", "desc": "Marcus Aurelius: everything is connected. You are not separate from the cosmos — you are the cosmos experiencing itself locally. Duty to others follows naturally from this insight"},
         {"depth": 4, "label": "CBT Connection", "desc": "Albert Ellis and Aaron Beck: Cognitive Behavioral Therapy is applied Stoicism. 'It is not things that disturb us, but our judgments about things' — Epictetus (50 AD). The most validated therapy in modern psychology is 2,300 years old"},
         {"depth": 5, "label": "Logos", "desc": "The Stoic universe is rational — permeated by Logos (divine reason). Every event is part of a causal web that IS fate (heimarmene). Your freedom is not to choose what happens, but to choose how you respond. At the deepest level: the universe is thinking through you"},
     ]},
    {"id": "epistemology", "name": "Epistemology", "color": "#60A5FA", "category": "Knowledge", "complexity": "Advanced",
     "origin": "How do we know what we know? — the study of knowledge, belief, and justification",
     "components": ["Justified true belief", "Skepticism", "Empiricism vs rationalism", "Reliabilism", "Social epistemology"],
     "system": "Epistemic-Justification axis", "uses": "Critical thinking, science philosophy, education, AI ethics, media literacy",
     "dive_layers": [
         {"depth": 0, "label": "The Question", "desc": "'How do you KNOW that?' — the question that separates opinion from knowledge. Knowledge = justified true belief (JTB). But is that enough? Gettier says no"},
         {"depth": 1, "label": "Gettier Problem", "desc": "You believe P, P is true, you have justification — but your justification is accidentally right. Do you KNOW? Gettier (1963): 3 pages that destroyed 2,400 years of epistemology"},
         {"depth": 2, "label": "Skeptical Challenge", "desc": "Descartes: how do you know you're not dreaming? Or a brain in a vat? Radical doubt strips away everything until only 'Cogito ergo sum' remains. But can you rebuild from there?"},
         {"depth": 3, "label": "Empiricism vs Rationalism", "desc": "Locke/Hume: all knowledge from experience (tabula rasa). Descartes/Leibniz: some knowledge is innate (a priori). Kant: both — the mind structures experience. Kant won, but the debate isn't over"},
         {"depth": 4, "label": "Reliabilism", "desc": "Goldman: knowledge = belief produced by a reliable cognitive process. No need for the believer to know WHY they know. Your vision is reliable even if you can't explain optics. Externalism vs internalism"},
         {"depth": 5, "label": "Epistemic Humility", "desc": "The deepest epistemological truth: the more you know, the more you know you don't know. Socrates' wisdom was knowing his ignorance. At the quantum level, Heisenberg's uncertainty principle says reality itself resists complete knowledge. The universe keeps secrets — not from cruelty, but from structure"},
     ]},
])



# Register V64.0 modules
MODULES["speaking"] = {"materials": SPEAKING_MATERIALS, "tools": SPEAKING_TOOLS, "mat_key": "topics", "mat_id_key": "topic_id", "skill": "Speaking_Skill"}
MODULES["philosophy"] = {"materials": PHILOSOPHY_MATERIALS, "tools": PHILOSOPHY_TOOLS, "mat_key": "branches", "mat_id_key": "branch_id", "skill": "Philosophy_Skill"}
MODULES["pedagogy"] = {"materials": PEDAGOGY_MATERIALS, "tools": PEDAGOGY_TOOLS, "mat_key": "domains", "mat_id_key": "domain_id", "skill": "Pedagogy_Skill"}
MODULES["anatomy"] = {"materials": ANATOMY_MATERIALS, "tools": ANATOMY_TOOLS, "mat_key": "systems", "mat_id_key": "system_id", "skill": "Anatomy_Skill"}
MODULES["machining"] = {"materials": MACHINING_MATERIALS, "tools": MACHINING_TOOLS, "mat_key": "operations", "mat_id_key": "operation_id", "skill": "Machining_Skill"}

# Add V64.0 to registry
WORKSHOP_REGISTRY["speaking"] = {"title": "Public Speaking Workshop", "subtitle": "Human Development — Tap the topic to dive into rhetoric. Select a tool to command the room.", "icon": "Mic", "accentColor": "#F59E0B", "skillKey": "Speaking_Skill", "matLabel": "Topic", "domain": "Exploration"}
WORKSHOP_REGISTRY["philosophy"] = {"title": "Philosophy Workshop", "subtitle": "Sacred Knowledge — Tap the branch to dive into truth. Select a tool to think.", "icon": "Scale", "accentColor": "#8B5CF6", "skillKey": "Philosophy_Skill", "matLabel": "Branch", "domain": "Sacred Knowledge"}
WORKSHOP_REGISTRY["pedagogy"] = {"title": "Pedagogy Workshop", "subtitle": "Human Development — Tap the domain to dive into learning science. Select a tool to teach.", "icon": "GraduationCap", "accentColor": "#3B82F6", "skillKey": "Pedagogy_Skill", "matLabel": "Domain", "domain": "Exploration"}
WORKSHOP_REGISTRY["anatomy"] = {"title": "Anatomy Workshop", "subtitle": "Science Pillar — Tap the system to dive into the human body. Select a tool to explore.", "icon": "Activity", "accentColor": "#EF4444", "skillKey": "Anatomy_Skill", "matLabel": "System", "domain": "Science & Physics"}
WORKSHOP_REGISTRY["machining"] = {"title": "Machining Workshop", "subtitle": "Trade Pillar — Tap the operation to dive into metal cutting. Select a tool to machine.", "icon": "Cog", "accentColor": "#6B7280", "skillKey": "Machining_Skill", "matLabel": "Operation", "domain": "Trade & Craft"}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# V68.0 — 5 NEW MODULES: Forestry, Geology, Economics, Music Theory, Permaculture
# Full parity from birth: 6 materials, 9 tools, 6-depth dives, intent tags
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ── FORESTRY ──
FORESTRY_MATERIALS = [
    {"id": "timber_harvest", "name": "Timber Harvesting", "color": "#92400E", "category": "Production",
     "origin": "Selective felling and extraction — sustainable removal of mature trees while preserving the forest canopy",
     "components": ["Felling wedge", "Chainsaw (bar/chain)", "Skidder", "Landing deck", "Bucking station"],
     "system": "Silvicultural extraction", "uses": "Lumber production, forest thinning, salvage logging, habitat management",
     "dive_layers": [
         {"depth": 0, "label": "The Fell", "desc": "Notch cut (70°) on the fall side, back cut 2 inches above the notch floor. The hinge wood controls the fall. One mistake and the tree barber-chairs"},
         {"depth": 1, "label": "Species Selection", "desc": "Diameter at breast height (DBH), crown class (dominant/codominant/intermediate/suppressed), and defect cull determine which trees are marked for harvest"},
         {"depth": 2, "label": "Growth Rings", "desc": "Each ring = one year. Wide rings = fast growth (good site). Narrow rings = competition. Reaction wood (compression/tension) reveals the tree's structural history"},
         {"depth": 3, "label": "Cambium Layer", "desc": "One cell thick, between bark and wood. The cambium divides outward (bark) and inward (xylem). Damage it and the tree dies. It is the living skin of all lumber"},
         {"depth": 4, "label": "Lignin Architecture", "desc": "Lignin is the polymer that makes wood rigid — 25% of wood by weight. It cross-links cellulose microfibrils into a composite stronger than steel per unit weight"},
         {"depth": 5, "label": "Carbon Sequestration", "desc": "Photosynthesis: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. A mature tree sequesters 48 lbs of CO₂/year. Timber locks that carbon for centuries. Forestry is atmospheric engineering"},
     ]},
    {"id": "tree_id", "name": "Tree Identification", "color": "#22C55E", "category": "Knowledge",
     "origin": "Reading the forest — identifying species by bark, leaf, bud, and habitat before a single tool is lifted",
     "components": ["Bark texture", "Leaf arrangement (alternate/opposite)", "Bud scales", "Fruit/cone", "Habitat preference"],
     "system": "Dendrological classification", "uses": "Timber valuation, ecological assessment, foraging safety, land management",
     "dive_layers": [
         {"depth": 0, "label": "The Walk", "desc": "Look up (crown shape), look down (leaf litter), look at the trunk (bark pattern). Alternate leaves = most species. Opposite leaves = MADCap Horse (Maple, Ash, Dogwood, Caprifoliaceae, Horse chestnut)"},
         {"depth": 1, "label": "Bark Language", "desc": "Shagbark hickory peels in strips. White oak has vertical ridges. Beech is smooth gray. Sycamore sheds in patches. Bark is the tree's fingerprint — no two species alike"},
         {"depth": 2, "label": "Leaf Morphology", "desc": "Simple vs compound. Pinnate vs palmate. Serrate vs entire margin. Leaf shape is driven by light capture efficiency and water loss trade-offs at the species level"},
         {"depth": 3, "label": "Mycorrhizal Networks", "desc": "90% of trees depend on fungal partners. Ectomycorrhizae wrap oak roots. Arbuscular mycorrhizae penetrate maple cells. The tree you see is half the organism"},
         {"depth": 4, "label": "Phylogenetics", "desc": "Angiosperms (hardwoods) diverged from gymnosperms (softwoods) 300 million years ago. DNA sequencing rewrites the tree of trees — oaks are closer to beeches than they look"},
         {"depth": 5, "label": "Convergent Evolution", "desc": "Unrelated species evolve identical solutions: thorns (defense), deciduousness (drought), wind-dispersed seeds. Form follows function at the molecular level — natural selection is the universal architect"},
     ]},
    {"id": "chainsaw_maint", "name": "Chainsaw Maintenance", "color": "#6B7280", "category": "Tool Mastery",
     "origin": "Keeping the most dangerous hand tool in forestry cutting true — sharpening, tensioning, and fuel system care",
     "components": ["Chain file (round + flat)", "Depth gauge tool", "Bar groove cleaner", "Spark plug", "Air filter"],
     "system": "Small engine + cutting chain", "uses": "Felling, limbing, bucking, storm cleanup, firewood processing",
     "dive_layers": [
         {"depth": 0, "label": "The Chain", "desc": "Left cutter, right cutter, drive link — repeating pattern. File each cutter at 30° with 3-5 strokes of a round file. Count strokes. Equal on each side or the saw pulls"},
         {"depth": 1, "label": "Depth Gauges", "desc": "The raker in front of each cutter controls bite depth. Too high = slow cut. Too low = aggressive grab (kickback). 0.025 inch below the cutter top. Flat file to set"},
         {"depth": 2, "label": "Bar Maintenance", "desc": "Flip the bar every tank to even rail wear. Clean the oil groove. Dress burrs with a flat file. A worn bar makes a crooked cut no matter how sharp the chain"},
         {"depth": 3, "label": "2-Stroke Combustion", "desc": "50:1 fuel-oil mix. The oil must burn clean (low ash) or carbon deposits kill the piston rings. Pre-mix fuel prevents the #1 cause of chainsaw failure: stale ethanol fuel"},
         {"depth": 4, "label": "Vibration Dampening", "desc": "Anti-vibration mounts isolate the handles from the engine. Hand-arm vibration syndrome (HAVS) from chronic exposure damages capillaries permanently. The mounts are a medical device"},
         {"depth": 5, "label": "Cutting Geometry", "desc": "The chisel cutter is a micro-lathe: the chrome-plated edge shears wood fibers at 13,000 RPM. Optimal hook angle, clearance angle, and edge radius determine cut speed vs. chain life. Metallurgy at 60 mph"},
     ]},
    {"id": "wildfire", "name": "Wildfire Science", "color": "#EF4444", "category": "Emergency",
     "origin": "Understanding fire behavior — the triangle of heat, fuel, and oxygen that turns forests into infernos",
     "components": ["Fire triangle", "Fuel ladder", "Spot fires", "Fire weather", "Burnout operations"],
     "system": "Combustion-Weather-Terrain axis", "uses": "Prescribed burns, firefighting, forest management, community protection",
     "dive_layers": [
         {"depth": 0, "label": "The Fire Triangle", "desc": "Heat + Fuel + Oxygen = Fire. Remove any one and the fire dies. Firefighters attack the fuel (clear lines), heat (water/retardant), or oxygen (smother with dirt)"},
         {"depth": 1, "label": "Fire Behavior", "desc": "Fire runs uphill (preheats fuel above). Fire accelerates in narrow canyons (chimney effect). Wind-driven fires move 10+ mph. Slope, weather, fuel = the behavior triangle"},
         {"depth": 2, "label": "Fuel Ladder", "desc": "Ground litter → understory shrubs → lower branches → crown. If the vertical fuel is continuous, a surface fire climbs to a crown fire. Prescribed burns break the ladder"},
         {"depth": 3, "label": "Pyrolysis", "desc": "At 300°C, wood decomposes into flammable gases (CO, CH₄, H₂) + char. These gases ignite at 500°C. The wood doesn't burn — the gases do. Flame is burning vapor"},
         {"depth": 4, "label": "Convection Column", "desc": "A large fire creates its own weather: 2,000°F air rises at 100+ mph, creating a convection column. This column can generate pyrocumulus clouds and fire tornadoes"},
         {"depth": 5, "label": "Fire Ecology", "desc": "Many species REQUIRE fire: lodgepole pine cones only open at 140°F. Sequoia seeds need bare mineral soil. Fire is not destruction — it's a 400-million-year evolutionary pressure that shaped every forest on Earth"},
     ]},
    {"id": "dendrology", "name": "Wood Properties", "color": "#D4AF37", "category": "Material Science",
     "origin": "Understanding wood from the inside out — grain, density, moisture, and how cellular structure determines every use",
     "components": ["Specific gravity", "Moisture content", "Janka hardness", "Grain pattern", "Shrinkage coefficient"],
     "system": "Cellular-Mechanical axis", "uses": "Lumber grading, furniture selection, structural engineering, instrument making",
     "dive_layers": [
         {"depth": 0, "label": "The Board", "desc": "Flatsawn, quartersawn, or riftsawn — the angle of cut through the log determines grain pattern, stability, and figure. Quartersawn oak shows medullary rays. Flatsawn shows cathedral pattern"},
         {"depth": 1, "label": "Moisture Content", "desc": "Green wood: 30-200% MC. Kiln-dried: 6-8%. Equilibrium MC matches the environment. Wood moves forever — it swells across the grain with moisture and shrinks when dry"},
         {"depth": 2, "label": "Heartwood vs Sapwood", "desc": "Sapwood is alive (conducts water). Heartwood is dead (filled with extractives). Extractives = natural preservatives. Black locust heartwood resists rot for 50+ years"},
         {"depth": 3, "label": "Fiber Saturation Point", "desc": "~28% MC: all free water is gone, only bound water remains in cell walls. Below FSP, wood shrinks. Above FSP, no dimensional change. This is the magic number of wood science"},
         {"depth": 4, "label": "Anisotropy", "desc": "Wood is 10x stronger along the grain than across it. Tangential shrinkage is 2x radial. This anisotropy comes from the cellulose microfibril angle in the S2 cell wall layer"},
         {"depth": 5, "label": "Cellulose Crystallinity", "desc": "Cellulose chains hydrogen-bond into crystalline microfibrils with tensile strength rivaling steel. Nature's composite: crystalline cellulose + amorphous hemicellulose + rigid lignin. 400 million years of R&D"},
     ]},
    {"id": "watershed", "name": "Watershed Management", "color": "#3B82F6", "category": "Hydrology",
     "origin": "Forests are water factories — managing the relationship between trees, soil, and the water cycle",
     "components": ["Canopy interception", "Infiltration rate", "Riparian buffer", "Stream crossing", "Erosion control"],
     "system": "Hydrological-Ecological axis", "uses": "Drinking water protection, flood control, aquatic habitat, logging road design",
     "dive_layers": [
         {"depth": 0, "label": "The Watershed", "desc": "Every drop of rain that hits a ridge flows downhill to the same stream. The watershed boundary is the ridgeline. Forests are the world's cheapest water treatment plants"},
         {"depth": 1, "label": "Canopy Interception", "desc": "A mature forest intercepts 20-40% of rainfall on leaf surfaces where it evaporates. The rest drips through (throughfall) or runs down the trunk (stemflow). Trees regulate the water cycle"},
         {"depth": 2, "label": "Infiltration", "desc": "Forest soil absorbs water 10-15x faster than bare ground. Root channels, earthworm tunnels, and organic matter create macropores. Destroy the forest floor and floods follow"},
         {"depth": 3, "label": "Riparian Buffer", "desc": "50-100 foot vegetated strip along streams filters sediment, absorbs nutrients (nitrogen/phosphorus), shades water to protect fish. The buffer is the immune system of the waterway"},
         {"depth": 4, "label": "Evapotranspiration", "desc": "A mature oak transpires 40,000 gallons/year. Trees are solar-powered water pumps — pulling groundwater through roots and releasing it as vapor through stomata. ET drives 60% of terrestrial water cycling"},
         {"depth": 5, "label": "Water Potential Gradient", "desc": "Water moves from high to low water potential: soil (-0.1 MPa) → root (-0.5) → stem (-1.0) → leaf (-1.5) → atmosphere (-100). The entire 300-foot column is pulled by evaporation at the leaf. Cohesion-tension theory: the tallest straw on Earth"},
     ]},
]

FORESTRY_TOOLS = [
    {"id": "chainsaw", "name": "Chainsaw", "icon_symbol": "Axe", "action_verb": "Cut", "xp_per_action": 12, "color": "#92400E", "desc": "Fell, limb, and buck timber with the forester's primary tool"},
    {"id": "compass_cruise", "name": "Compass & Cruise", "icon_symbol": "Compass", "action_verb": "Survey", "xp_per_action": 10, "color": "#22C55E", "desc": "Timber cruise: measure DBH, height, and defect to estimate board feet per acre"},
    {"id": "increment_borer", "name": "Increment Borer", "icon_symbol": "Search", "action_verb": "Core", "xp_per_action": 8, "color": "#D4AF37", "desc": "Extract a pencil-thin core to count growth rings and assess tree age and health"},
    {"id": "prescribed_burn", "name": "Prescribed Burn", "icon_symbol": "Flame", "action_verb": "Ignite", "xp_per_action": 15, "color": "#EF4444", "desc": "Controlled fire to reduce fuel loads, recycle nutrients, and restore fire-adapted ecosystems"},
    {"id": "tree_planter", "name": "Planting Dibble", "icon_symbol": "Leaf", "action_verb": "Plant", "xp_per_action": 10, "color": "#22C55E", "desc": "Plant seedlings at proper depth and spacing for reforestation"},
    {"id": "log_scaler", "name": "Log Scale Stick", "icon_symbol": "Ruler", "action_verb": "Scale", "xp_per_action": 8, "color": "#6B7280", "desc": "Measure log diameter and length to calculate board foot volume (Doyle/Scribner rule)"},
    {"id": "gps_mapper", "name": "GPS/GIS Mapper", "icon_symbol": "Map", "action_verb": "Map", "xp_per_action": 10, "color": "#3B82F6", "desc": "Map stand boundaries, stream crossings, and harvest units with GPS and GIS layers"},
    {"id": "soil_probe", "name": "Soil Probe", "icon_symbol": "Layers", "action_verb": "Probe", "xp_per_action": 8, "color": "#92400E", "desc": "Sample soil horizons to assess site quality, drainage, and erosion risk"},
    {"id": "clinometer", "name": "Clinometer", "icon_symbol": "Triangle", "action_verb": "Measure", "xp_per_action": 8, "color": "#F59E0B", "desc": "Measure tree height and slope angle using trigonometry and a handheld optical instrument"},
]

# ── GEOLOGY ──
GEOLOGY_MATERIALS = [
    {"id": "igneous", "name": "Igneous Rocks", "color": "#EF4444", "category": "Formation",
     "origin": "Born from fire — crystallized from molten magma either deep underground (intrusive) or at the surface (extrusive)",
     "components": ["Granite (intrusive)", "Basalt (extrusive)", "Obsidian (volcanic glass)", "Quartz crystals", "Feldspar"],
     "system": "Magmatic crystallization", "uses": "Construction, countertops, road base, geothermal energy, mineral exploration",
     "dive_layers": [
         {"depth": 0, "label": "The Rock", "desc": "Hold a piece of granite: each crystal grew slowly underground over millions of years. Large crystals = slow cooling (intrusive). No crystals = fast cooling (extrusive). The texture tells the story"},
         {"depth": 1, "label": "Bowen's Reaction Series", "desc": "Minerals crystallize from magma in a predictable sequence: olivine first (1200°C), then pyroxene, amphibole, biotite, and finally quartz (700°C). The last mineral to form fills the gaps"},
         {"depth": 2, "label": "Magma Chamber", "desc": "5-30 km deep. Fractional crystallization: early crystals sink, changing the magma composition. One magma chamber can produce granite, diorite, and gabbro — differentiation by gravity"},
         {"depth": 3, "label": "Plate Tectonics", "desc": "Divergent boundaries: basalt floods (mid-ocean ridges). Convergent boundaries: andesite/rhyolite (subduction volcanoes). Hotspots: oceanic basalt (Hawaii). The tectonic setting determines the magma type"},
         {"depth": 4, "label": "Nucleation", "desc": "Crystal growth begins at nucleation sites — impurities or surfaces where atoms first organize. Supercooling delays nucleation → volcanic glass (obsidian). The gap between disorder and order"},
         {"depth": 5, "label": "Silicate Tetrahedra", "desc": "Every silicate mineral is built from SiO₄ tetrahedra linked by shared oxygen atoms. Isolated (olivine), chains (pyroxene), sheets (mica), framework (quartz). Four atoms arrange themselves and build mountains"},
     ]},
    {"id": "sedimentary", "name": "Sedimentary Rocks", "color": "#F59E0B", "category": "Deposition",
     "origin": "The Earth's diary — layers of compressed sediment recording billions of years of weather, life, and chemistry",
     "components": ["Sandstone", "Limestone", "Shale", "Conglomerate", "Evaporites"],
     "system": "Weathering-Transport-Deposition", "uses": "Fossil fuels, aquifers, building stone, cement, paleontology",
     "dive_layers": [
         {"depth": 0, "label": "The Layers", "desc": "Sedimentary rocks form in horizontal layers (strata). Youngest on top, oldest on bottom (Law of Superposition). Each layer is a chapter in Earth's autobiography"},
         {"depth": 1, "label": "Clastic vs Chemical", "desc": "Clastic: broken rock fragments cemented together (sandstone, shale). Chemical: precipitated from solution (limestone, rock salt). Biochemical: built by organisms (coral reef limestone, coal)"},
         {"depth": 2, "label": "Diagenesis", "desc": "Sediment → rock: compaction squeezes water out, cementation fills pore space with quartz/calcite/iron oxide. Takes millions of years. Pressure + chemistry + time = stone"},
         {"depth": 3, "label": "Stratigraphy", "desc": "Walther's Law: facies adjacent in vertical sequence were also adjacent laterally. A beach migrating inland leaves sandstone over shale over limestone. Vertical patterns decode horizontal environments"},
         {"depth": 4, "label": "Fossil Record", "desc": "Sedimentary rocks are the only rocks that contain fossils. Rapid burial in low-oxygen environments preserves organisms. Index fossils date rocks; facies fossils reveal environments"},
         {"depth": 5, "label": "Isotope Geochemistry", "desc": "δ¹⁸O ratios in marine sediments record global temperature history. δ¹³C records carbon cycling. Every atom in the rock is a thermometer and a clock pointing back to the moment it was deposited"},
     ]},
    {"id": "metamorphic", "name": "Metamorphic Rocks", "color": "#A78BFA", "category": "Transformation",
     "origin": "Rocks reborn under pressure — the transformation of existing rock by heat, pressure, and chemically active fluids",
     "components": ["Marble (from limestone)", "Slate (from shale)", "Gneiss (from granite)", "Quartzite (from sandstone)", "Schist"],
     "system": "Pressure-Temperature transformation", "uses": "Roofing slate, decorative marble, gemstones, geologic mapping, tectonic reconstruction",
     "dive_layers": [
         {"depth": 0, "label": "The Transformation", "desc": "Limestone becomes marble. Shale becomes slate. Granite becomes gneiss. Same chemistry, rearranged by heat and pressure. Metamorphism is alchemy that actually works"},
         {"depth": 1, "label": "Foliation", "desc": "Directed pressure aligns flat minerals (mica, chlorite) perpendicular to the stress. Slate cleaves perfectly because every crystal is parallel. The rock remembers which direction it was squeezed"},
         {"depth": 2, "label": "Grade Sequence", "desc": "Increasing metamorphism: shale → slate → phyllite → schist → gneiss → migmatite (partial melt). Each grade has index minerals: chlorite (low) → garnet (medium) → sillimanite (high)"},
         {"depth": 3, "label": "Contact vs Regional", "desc": "Contact: heat from an intrusion bakes surrounding rock (narrow aureole). Regional: mountain-building compresses entire belts (Himalayas). Scale determines the metamorphic style"},
         {"depth": 4, "label": "Phase Diagrams", "desc": "Stability fields on a P-T diagram: every mineral exists only within specific pressure-temperature ranges. Cross a boundary and the mineral transforms. The diagram is a map of matter's preferences"},
         {"depth": 5, "label": "Gibbs Free Energy", "desc": "ΔG = ΔH - TΔS. A mineral transformation occurs when the products have lower free energy than the reactants at the given P and T. Every metamorphic reaction is the universe minimizing its energy. Rocks obey thermodynamics"},
     ]},
    {"id": "minerals", "name": "Mineral Identification", "color": "#2DD4BF", "category": "Classification",
     "origin": "The building blocks of all rock — naturally occurring, inorganic crystalline solids with definite chemical composition",
     "components": ["Mohs hardness", "Streak", "Luster", "Cleavage/Fracture", "Specific gravity"],
     "system": "Physical-Chemical classification", "uses": "Mineral exploration, gemology, ceramic/glass raw materials, industrial minerals",
     "dive_layers": [
         {"depth": 0, "label": "The Tests", "desc": "Scratch it (hardness), streak it on porcelain (streak color), look at the light (luster), break it (cleavage planes or conchoidal fracture). Five minutes and you can identify 90% of common minerals"},
         {"depth": 1, "label": "Crystal Systems", "desc": "Seven systems: cubic, tetragonal, hexagonal, orthorhombic, monoclinic, triclinic, trigonal. The external shape reflects the internal atomic arrangement. Halite is cubic because Na⁺ and Cl⁻ stack in cubes"},
         {"depth": 2, "label": "Silicate Classes", "desc": "Nesosilicates (isolated SiO₄), sorosilicates (double), cyclosilicates (rings), inosilicates (chains), phyllosilicates (sheets), tectosilicates (frameworks). Polymerization determines every physical property"},
         {"depth": 3, "label": "Solid Solution", "desc": "Olivine ranges from Mg₂SiO₄ (forsterite) to Fe₂SiO₄ (fayalite). Mg and Fe substitute freely because they have similar ionic radii. Most minerals are not pure compounds — they are compositional ranges"},
         {"depth": 4, "label": "X-Ray Diffraction", "desc": "Bragg's Law: nλ = 2d sinθ. X-rays bounce off crystal planes and interfere constructively at specific angles. The diffraction pattern is the mineral's fingerprint — every mineral on Earth has a unique XRD signature"},
         {"depth": 5, "label": "Crystal Field Theory", "desc": "Transition metal ions in crystal lattices split their d-orbitals. The energy gap between split levels absorbs specific wavelengths of light. Ruby is red because Cr³⁺ in corundum absorbs green. Color is quantum mechanics made visible"},
     ]},
    {"id": "plate_tectonics", "name": "Plate Tectonics", "color": "#3B82F6", "category": "Dynamics",
     "origin": "The engine that moves continents, builds mountains, triggers earthquakes, and recycles the crust",
     "components": ["Lithospheric plates", "Mid-ocean ridges", "Subduction zones", "Transform faults", "Mantle convection"],
     "system": "Geodynamic engine", "uses": "Earthquake prediction, volcano monitoring, mineral deposit location, geopolitical boundaries",
     "dive_layers": [
         {"depth": 0, "label": "The Plates", "desc": "15 major plates, 0-200 km thick, floating on the asthenosphere. They diverge (mid-Atlantic ridge), converge (Himalayas), or slide past each other (San Andreas). Every earthquake is a plate boundary event"},
         {"depth": 1, "label": "Divergent Boundaries", "desc": "Mid-ocean ridges: magma rises, plates separate at 2-15 cm/year. New oceanic crust forms. Iceland sits on one. The Atlantic is getting wider by the width of your fingernail growth every year"},
         {"depth": 2, "label": "Subduction", "desc": "Dense oceanic plate dives under continental plate at 2-8 cm/year. The descending slab triggers volcanism 100 km inland (Cascades, Andes). Subduction recycles the oceanic crust back into the mantle"},
         {"depth": 3, "label": "Seismic Waves", "desc": "P-waves (compressional, through anything), S-waves (shear, not through liquid). S-wave shadow zone proved the outer core is liquid. Seismology is X-raying the planet with earthquakes"},
         {"depth": 4, "label": "Mantle Convection", "desc": "Hot mantle rises at ridges, spreads laterally, cools, and sinks at subduction zones. Rayleigh number > 10³: convection is inevitable. The mantle convects because gravity and heat have no choice"},
         {"depth": 5, "label": "Slab Pull", "desc": "The primary driving force is not mantle pushing — it's the cold, dense subducting slab PULLING the plate behind it. Gravitational potential energy of the sinking slab converts to kinetic energy. Continents move because rock falls"},
     ]},
    {"id": "hydrogeology", "name": "Groundwater Systems", "color": "#60A5FA", "category": "Hydrology",
     "origin": "The invisible ocean beneath our feet — 30% of the world's freshwater stored in rock pores and fractures",
     "components": ["Aquifer", "Water table", "Porosity/Permeability", "Well design", "Contamination plume"],
     "system": "Subsurface hydrology", "uses": "Drinking water, irrigation, contamination remediation, geothermal, construction dewatering",
     "dive_layers": [
         {"depth": 0, "label": "The Aquifer", "desc": "A rock or sediment layer that stores and transmits water. Sandstone and gravel are great aquifers (high porosity + permeability). Shale stores water but won't release it (high porosity, low permeability)"},
         {"depth": 1, "label": "Water Table", "desc": "The surface below which all pores are saturated. It's not flat — it follows topography, higher under hills, lower near streams. Pump a well and the water table forms a cone of depression around it"},
         {"depth": 2, "label": "Darcy's Law", "desc": "Q = KA(dh/dl). Flow rate = hydraulic conductivity × area × hydraulic gradient. Darcy proved in 1856 that groundwater flow is proportional to the slope of the water table. The foundation of hydrogeology"},
         {"depth": 3, "label": "Contamination Transport", "desc": "Plumes follow groundwater flow but are modified by advection, dispersion, and retardation. DNAPL (dense non-aqueous phase liquid) sinks below the water table. LNAPL floats on it. Chemistry determines fate"},
         {"depth": 4, "label": "Porosity Types", "desc": "Primary porosity: original pore space (sandstone). Secondary porosity: fractures and dissolution (limestone karst). Dual-porosity systems store water in matrix but transmit it through fractures"},
         {"depth": 5, "label": "Isotope Hydrology", "desc": "Tritium (³H) from 1950s nuclear tests dates water younger than 70 years. ¹⁴C dates water up to 50,000 years. δ²H and δ¹⁸O reveal recharge elevation and paleoclimate. Every water molecule carries its birth certificate"},
     ]},
]

GEOLOGY_TOOLS = [
    {"id": "rock_hammer", "name": "Rock Hammer", "icon_symbol": "Hammer", "action_verb": "Strike", "xp_per_action": 12, "color": "#6B7280", "desc": "Break fresh surfaces and test hardness — the geologist's most essential tool"},
    {"id": "hand_lens", "name": "Hand Lens (10x)", "icon_symbol": "Search", "action_verb": "Examine", "xp_per_action": 8, "color": "#D4AF37", "desc": "Identify minerals, textures, and microfossils in the field at 10x magnification"},
    {"id": "acid_test", "name": "HCl Acid Test", "icon_symbol": "Droplets", "action_verb": "Test", "xp_per_action": 8, "color": "#22C55E", "desc": "Drop dilute HCl on rock — fizzing means calcite (limestone/marble). The carbonate acid test"},
    {"id": "streak_plate", "name": "Streak Plate", "icon_symbol": "Layers", "action_verb": "Streak", "xp_per_action": 8, "color": "#F8FAFC", "desc": "Drag mineral across unglazed porcelain to reveal true powder color regardless of surface appearance"},
    {"id": "compass_clinometer", "name": "Brunton Compass", "icon_symbol": "Compass", "action_verb": "Measure", "xp_per_action": 10, "color": "#3B82F6", "desc": "Measure strike and dip of rock layers — the orientation data that builds geological maps"},
    {"id": "gps_station", "name": "GPS Station", "icon_symbol": "Map", "action_verb": "Plot", "xp_per_action": 10, "color": "#60A5FA", "desc": "Record precise locations of outcrops, contacts, and sample sites for mapping"},
    {"id": "thin_section", "name": "Thin Section Scope", "icon_symbol": "Eye", "action_verb": "Analyze", "xp_per_action": 12, "color": "#A78BFA", "desc": "View 30-micron rock slices under polarized light — minerals reveal their crystal structure"},
    {"id": "seismograph", "name": "Seismograph", "icon_symbol": "Activity", "action_verb": "Monitor", "xp_per_action": 10, "color": "#EF4444", "desc": "Record ground vibrations to detect earthquakes and map subsurface structures"},
    {"id": "core_drill", "name": "Core Drill", "icon_symbol": "Cog", "action_verb": "Drill", "xp_per_action": 15, "color": "#92400E", "desc": "Extract cylindrical rock cores from depth for stratigraphic analysis and mineral assay"},
]

# ── ECONOMICS ──
ECONOMICS_MATERIALS = [
    {"id": "supply_demand", "name": "Supply & Demand", "color": "#22C55E", "category": "Microeconomics",
     "origin": "The invisible hand — how individual buying and selling decisions determine prices without central planning",
     "components": ["Demand curve", "Supply curve", "Equilibrium price", "Elasticity", "Surplus/Shortage"],
     "system": "Market price mechanism", "uses": "Business pricing, policy analysis, investment, market research",
     "dive_layers": [
         {"depth": 0, "label": "The Market", "desc": "Price goes up → people buy less (demand), producers make more (supply). Where the curves cross = equilibrium. No one decides the price. The market decides itself"},
         {"depth": 1, "label": "Elasticity", "desc": "Price elasticity of demand: %ΔQd / %ΔP. Insulin is inelastic (you pay any price). Luxury cars are elastic (price up, sales crash). Elasticity determines who bears the tax burden"},
         {"depth": 2, "label": "Consumer Surplus", "desc": "The triangle between what you'd pay and what you actually pay. Producer surplus: between cost and price. Total surplus = consumer + producer. Efficient markets maximize total surplus"},
         {"depth": 3, "label": "Deadweight Loss", "desc": "Taxes, price ceilings, price floors all create a triangle of transactions that WOULD have happened but didn't. Deadweight loss is wealth that evaporates — no one gets it. Inefficiency made visible"},
         {"depth": 4, "label": "General Equilibrium", "desc": "Arrow-Debreu theorem: under perfect competition, a set of prices exists where ALL markets clear simultaneously. The entire economy can reach equilibrium. The mathematical proof of Adam Smith's intuition"},
         {"depth": 5, "label": "Information Asymmetry", "desc": "Akerlof's Market for Lemons: when sellers know quality and buyers don't, bad products drive out good ones. Markets fail when information is unequal. Trust is an economic input as fundamental as capital"},
     ]},
    {"id": "monetary", "name": "Money & Banking", "color": "#D4AF37", "category": "Monetary",
     "origin": "How money is created, multiplied, and managed — the central bank's invisible architecture",
     "components": ["Fractional reserve", "Federal funds rate", "Open market operations", "Money multiplier", "Inflation targeting"],
     "system": "Monetary policy axis", "uses": "Interest rate forecasting, investment strategy, inflation protection, currency analysis",
     "dive_layers": [
         {"depth": 0, "label": "What Is Money", "desc": "Medium of exchange, unit of account, store of value. Fiat money has value because the government says it does AND because everyone agrees. Money is a shared belief system"},
         {"depth": 1, "label": "Fractional Reserve", "desc": "Bank receives $100 deposit, keeps $10 (reserve ratio 10%), lends $90. That $90 gets deposited at another bank → $81 lent → $72.90 lent. Money multiplier: 1/reserve ratio. $100 creates $1,000"},
         {"depth": 2, "label": "Federal Funds Rate", "desc": "The rate banks charge each other for overnight loans. The Fed targets this rate to control the economy. Lower = stimulate (cheap money). Higher = cool (expensive money). One number moves trillions"},
         {"depth": 3, "label": "Quantity Theory", "desc": "MV = PQ. Money supply × velocity = price level × real output. If M doubles and V and Q stay constant, prices double. Milton Friedman: 'Inflation is always and everywhere a monetary phenomenon'"},
         {"depth": 4, "label": "Yield Curve", "desc": "Plot interest rates by maturity: normal (upward slope), flat, inverted. An inverted yield curve has preceded every US recession since 1955. The bond market prices in the future better than any forecaster"},
         {"depth": 5, "label": "Liquidity Trap", "desc": "Keynes: when interest rates hit zero, monetary policy loses traction. People hoard cash because bonds pay nothing. Pushing on a string. Modern response: quantitative easing (central bank buys assets directly). The boundary where money theory breaks"},
     ]},
    {"id": "trade", "name": "International Trade", "color": "#3B82F6", "category": "Global",
     "origin": "Why nations trade — comparative advantage and the gains from specialization",
     "components": ["Comparative advantage", "Terms of trade", "Tariffs/Quotas", "Balance of payments", "Exchange rates"],
     "system": "Trade-Currency axis", "uses": "Trade policy, import/export business, forex, supply chain strategy",
     "dive_layers": [
         {"depth": 0, "label": "Why Trade", "desc": "Even if Country A is better at EVERYTHING, both countries gain by specializing in what they're RELATIVELY better at. Ricardo's comparative advantage: the most counterintuitive truth in economics"},
         {"depth": 1, "label": "Terms of Trade", "desc": "The ratio of export prices to import prices. Improving terms = your exports buy more imports. Commodity-dependent countries suffer when raw material prices fall. The price ratio determines who wins"},
         {"depth": 2, "label": "Tariff Effects", "desc": "Tariff raises domestic price → domestic producers gain, consumers lose, government collects revenue. Net effect: deadweight loss (usually). The few who benefit lobby; the many who lose don't notice"},
         {"depth": 3, "label": "Balance of Payments", "desc": "Current account (trade in goods/services) + Capital account (investment flows) = 0. Trade deficit MUST equal capital surplus. If you buy more than you sell, foreigners must be investing the difference"},
         {"depth": 4, "label": "Exchange Rate Dynamics", "desc": "PPP (Purchasing Power Parity): exchange rates should equalize prices of identical goods. Interest rate parity: higher rates attract capital, strengthening the currency. Covered vs uncovered parity"},
         {"depth": 5, "label": "Impossible Trinity", "desc": "Mundell-Fleming: a country can have only 2 of 3: fixed exchange rate, free capital movement, independent monetary policy. You MUST sacrifice one. This constraint shapes every central bank decision on Earth"},
     ]},
    {"id": "behavioral", "name": "Behavioral Economics", "color": "#EC4899", "category": "Psychology",
     "origin": "Why humans don't act rationally — the cognitive biases that make real markets deviate from perfect theory",
     "components": ["Loss aversion", "Anchoring", "Status quo bias", "Hyperbolic discounting", "Framing effects"],
     "system": "Cognitive-Economic axis", "uses": "Marketing, nudge policy, investment psychology, product design, public health",
     "dive_layers": [
         {"depth": 0, "label": "The Bias", "desc": "Losing $100 feels 2.5x worse than gaining $100 feels good (Kahneman & Tversky). Loss aversion explains why people hold losing stocks, reject fair gambles, and overpay for insurance"},
         {"depth": 1, "label": "Anchoring", "desc": "The first number you hear biases every subsequent judgment. Real estate agents set high asking prices. Retailers show original price crossed out. The anchor isn't even relevant — it still works"},
         {"depth": 2, "label": "Hyperbolic Discounting", "desc": "People prefer $100 today over $110 tomorrow, but prefer $110 in 31 days over $100 in 30 days. Same delay, different choice. Present bias explains credit card debt, obesity, and climate inaction"},
         {"depth": 3, "label": "Framing", "desc": "'90% survival rate' vs '10% mortality rate' — identical information, opposite emotional response. The frame determines the decision. Tversky & Kahneman's Asian Disease problem proved rationality is an illusion"},
         {"depth": 4, "label": "Prospect Theory", "desc": "Kahneman & Tversky's value function: concave for gains (risk-averse), convex for losses (risk-seeking), steeper for losses. People evaluate outcomes relative to a reference point, not absolute wealth. Nobel Prize 2002"},
         {"depth": 5, "label": "Dual Process Theory", "desc": "System 1: fast, automatic, emotional (heuristics). System 2: slow, deliberate, logical (calculation). Most economic decisions are System 1. Homo economicus is a System 2 fiction. Rationality is the exception, not the rule"},
     ]},
    {"id": "gdp", "name": "GDP & Growth", "color": "#F59E0B", "category": "Macroeconomics",
     "origin": "Measuring the heartbeat of an economy — total output, growth rates, and the business cycle",
     "components": ["GDP calculation (Y=C+I+G+NX)", "Real vs Nominal", "Business cycle", "Productivity", "Growth accounting"],
     "system": "Aggregate output measurement", "uses": "Economic forecasting, fiscal policy, investment timing, development planning",
     "dive_layers": [
         {"depth": 0, "label": "The Number", "desc": "GDP = Consumption + Investment + Government + Net Exports. The US: ~$28 trillion. It measures everything the economy produces in a year. Imperfect but irreplaceable"},
         {"depth": 1, "label": "Real vs Nominal", "desc": "Nominal GDP grows from inflation AND production. Real GDP strips out inflation (using a base year). If nominal grows 5% and inflation is 3%, real growth is ~2%. Real GDP is the signal; nominal is the noise"},
         {"depth": 2, "label": "Business Cycle", "desc": "Expansion → Peak → Contraction → Trough → Expansion. Average US expansion: 5 years. Average recession: 11 months. The cycle is driven by credit, confidence, and inventory — animal spirits with math"},
         {"depth": 3, "label": "Solow Growth Model", "desc": "Y = A·K^α·L^(1-α). Output = Technology × Capital × Labor. In the long run, only technological progress (A) drives per-capita growth. Capital accumulation has diminishing returns. Ideas are the only infinite resource"},
         {"depth": 4, "label": "Total Factor Productivity", "desc": "TFP is the Solow residual — the growth that can't be explained by more capital or labor. It captures technology, education, institutions, and efficiency. TFP is the mystery ingredient of prosperity"},
         {"depth": 5, "label": "Endogenous Growth", "desc": "Romer (1990): ideas are non-rival goods. Using an idea doesn't prevent others from using it. Knowledge creates increasing returns. This breaks the neoclassical model and explains why some nations grow exponentially while others stagnate. The economics of ideas"},
     ]},
    {"id": "game_theory", "name": "Game Theory", "color": "#8B5CF6", "category": "Strategy",
     "origin": "The mathematics of strategic interaction — when your best move depends on what the other player does",
     "components": ["Nash equilibrium", "Prisoner's dilemma", "Dominant strategy", "Payoff matrix", "Repeated games"],
     "system": "Strategic decision axis", "uses": "Business competition, auction design, negotiation, arms control, evolutionary biology",
     "dive_layers": [
         {"depth": 0, "label": "The Game", "desc": "Two or more players, each with strategies, each with payoffs that depend on everyone's choices. The question: what will rational players do? The answer is often surprising and counterintuitive"},
         {"depth": 1, "label": "Prisoner's Dilemma", "desc": "Both cooperate = good. Both defect = bad. One defects while other cooperates = best for defector, worst for cooperator. Rational individuals defect. Rational outcome is worse for both. Individual rationality ≠ group rationality"},
         {"depth": 2, "label": "Nash Equilibrium", "desc": "A set of strategies where no player can improve their payoff by unilaterally changing strategy. It's not optimal — it's stable. Nash (1950) proved every finite game has at least one. Beautiful Mind, ugly outcomes"},
         {"depth": 3, "label": "Repeated Games", "desc": "Axelrod's tournaments: in iterated Prisoner's Dilemma, Tit-for-Tat wins — cooperate first, then mirror. Cooperation emerges from repetition and reputation. The shadow of the future makes ethics rational"},
         {"depth": 4, "label": "Mechanism Design", "desc": "Reverse game theory: design the RULES so that self-interested players produce the outcome you want. Vickrey auction (second-price sealed bid): truthful bidding is the dominant strategy. Nobel Prize 2007"},
         {"depth": 5, "label": "Evolutionary Game Theory", "desc": "Maynard Smith: strategies are phenotypes, payoffs are fitness. ESS (Evolutionarily Stable Strategy) resists invasion by mutant strategies. Hawk-Dove game explains territorial behavior. Game theory IS natural selection formalized"},
     ]},
]

ECONOMICS_TOOLS = [
    {"id": "supply_demand_sim", "name": "Market Simulator", "icon_symbol": "Activity", "action_verb": "Simulate", "xp_per_action": 12, "color": "#22C55E", "desc": "Model supply and demand shifts and observe equilibrium price changes in real-time"},
    {"id": "gdp_calc", "name": "GDP Calculator", "icon_symbol": "Calculator", "action_verb": "Calculate", "xp_per_action": 10, "color": "#F59E0B", "desc": "Compute GDP components and growth rates from national accounts data"},
    {"id": "trade_analyzer", "name": "Trade Flow Analyzer", "icon_symbol": "Globe", "action_verb": "Analyze", "xp_per_action": 10, "color": "#3B82F6", "desc": "Map import/export flows between countries and compute comparative advantage"},
    {"id": "payoff_matrix", "name": "Payoff Matrix Builder", "icon_symbol": "Layers", "action_verb": "Strategize", "xp_per_action": 10, "color": "#8B5CF6", "desc": "Construct and solve game theory matrices to find Nash equilibria"},
    {"id": "bias_detector", "name": "Bias Detector", "icon_symbol": "Brain", "action_verb": "Detect", "xp_per_action": 8, "color": "#EC4899", "desc": "Identify cognitive biases in decision scenarios and practice debiasing techniques"},
    {"id": "inflation_tracker", "name": "Inflation Tracker", "icon_symbol": "TrendingUp", "action_verb": "Track", "xp_per_action": 8, "color": "#EF4444", "desc": "Monitor CPI, PPI, and core inflation to understand purchasing power changes"},
    {"id": "policy_lab", "name": "Policy Lab", "icon_symbol": "Scale", "action_verb": "Test", "xp_per_action": 12, "color": "#D4AF37", "desc": "Test fiscal and monetary policy changes and observe macroeconomic effects"},
    {"id": "yield_curve", "name": "Yield Curve Plotter", "icon_symbol": "LineChart", "action_verb": "Plot", "xp_per_action": 10, "color": "#60A5FA", "desc": "Plot yield curves across maturities and identify recession signals"},
    {"id": "case_study", "name": "Case Study Journal", "icon_symbol": "BookOpen", "action_verb": "Study", "xp_per_action": 8, "color": "#92400E", "desc": "Analyze historical economic events: Great Depression, 2008 crisis, hyperinflation episodes"},
]

# ── MUSIC THEORY ──
MUSIC_MATERIALS = [
    {"id": "scales", "name": "Scales & Modes", "color": "#8B5CF6", "category": "Melody",
     "origin": "The alphabet of music — organized pitch collections that define the emotional palette of every song",
     "components": ["Major scale", "Minor scales (natural/harmonic/melodic)", "Modes (Dorian/Mixolydian)", "Pentatonic", "Chromatic"],
     "system": "Tonal pitch organization", "uses": "Composition, improvisation, ear training, songwriting, music analysis",
     "dive_layers": [
         {"depth": 0, "label": "The Scale", "desc": "Major scale: W-W-H-W-W-W-H (whole and half steps). Seven notes, infinite songs. Every pop song, hymn, and anthem lives in the major scale. Change one note and the emotion shifts completely"},
         {"depth": 1, "label": "Modes", "desc": "Start the major scale on a different note: Dorian (2nd), Phrygian (3rd), Lydian (4th), Mixolydian (5th), Aeolian (6th = natural minor), Locrian (7th). Seven scales from one pattern. Medieval monks named them"},
         {"depth": 2, "label": "Minor Variations", "desc": "Natural minor: Aeolian mode. Harmonic minor: raised 7th (creates leading tone). Melodic minor: raised 6th and 7th ascending, natural descending. Three flavors of sadness"},
         {"depth": 3, "label": "Pentatonic", "desc": "Remove the 4th and 7th from major: 5 notes, zero dissonance. Every culture on Earth independently discovered the pentatonic scale. Play only the black keys on a piano — that's pentatonic"},
         {"depth": 4, "label": "Equal Temperament", "desc": "Divide the octave into 12 equal semitones: each frequency ratio = ²√12 ≈ 1.05946. Bach's Well-Tempered Clavier proved it works. A mathematical compromise that made modulation possible"},
         {"depth": 5, "label": "Harmonic Series", "desc": "A vibrating string produces the fundamental plus overtones at 2x, 3x, 4x, 5x the frequency. Ratios 2:1 (octave), 3:2 (fifth), 4:3 (fourth). Music IS the harmonic series. Consonance is the physics of simple ratios"},
     ]},
    {"id": "harmony", "name": "Harmony & Chords", "color": "#3B82F6", "category": "Harmony",
     "origin": "Vertical music — stacking notes simultaneously to create tension, resolution, and emotional depth",
     "components": ["Triads (major/minor/diminished/augmented)", "Seventh chords", "Inversions", "Voice leading", "Cadences"],
     "system": "Vertical pitch organization", "uses": "Arranging, piano/guitar accompaniment, film scoring, songwriting",
     "dive_layers": [
         {"depth": 0, "label": "The Chord", "desc": "Stack thirds: C-E-G = C major (happy). C-Eb-G = C minor (sad). Three notes, two emotions. Every chord is built by stacking intervals of a third"},
         {"depth": 1, "label": "Progressions", "desc": "I-IV-V-I: the foundation of Western music. I-V-vi-IV: the pop progression (Don't Stop Believin', Let It Be, No Woman No Cry). Four chords, thousands of songs. Function trumps novelty"},
         {"depth": 2, "label": "Voice Leading", "desc": "Move each note to the nearest available note in the next chord. Contrary motion is strongest. Parallel fifths are forbidden (they lose independence). Smooth voice leading is why Bach sounds effortless"},
         {"depth": 3, "label": "Cadences", "desc": "V→I: authentic (strong ending). IV→I: plagal (amen). V→vi: deceptive (surprise). ii→V: half cadence (pause). Cadences are punctuation. Without them, music is a run-on sentence"},
         {"depth": 4, "label": "Functional Harmony", "desc": "Tonic (I, vi: home), Subdominant (IV, ii: away), Dominant (V, vii°: tension). Music is the journey from home, through tension, back to home. T→S→D→T. Tension and release is the universal story arc"},
         {"depth": 5, "label": "Acoustic Beating", "desc": "Two frequencies close together create beats at (f₂-f₁) Hz. Consonance: simple ratios → slow or no beating. Dissonance: complex ratios → rapid beating. Harmony is the physics of interference patterns. The ear is a Fourier analyzer"},
     ]},
    {"id": "rhythm", "name": "Rhythm & Meter", "color": "#EF4444", "category": "Time",
     "origin": "The heartbeat of music — organizing sound in time through pulse, meter, and subdivision",
     "components": ["Time signature", "Note values", "Syncopation", "Polyrhythm", "Tempo/BPM"],
     "system": "Temporal organization", "uses": "Drumming, conducting, dance, production, groove design",
     "dive_layers": [
         {"depth": 0, "label": "The Beat", "desc": "4/4 time: four quarter-note beats per measure. 3/4: waltz. 6/8: compound duple. The time signature is the grid. Everything musical happens on, before, or after the beat"},
         {"depth": 1, "label": "Syncopation", "desc": "Accent on the 'wrong' beat — the 'and' instead of the downbeat. Funk, jazz, reggae, hip-hop all live in the spaces between beats. Syncopation is controlled surprise"},
         {"depth": 2, "label": "Polyrhythm", "desc": "3 against 2 (hemiola): the foundation of African and Afro-Cuban music. 4 against 3: Chopin. 7 against 4: progressive metal. Multiple time grids coexisting creates rhythmic depth"},
         {"depth": 3, "label": "Swing Feel", "desc": "Straight eighth notes: equal division. Swung eighth notes: long-short (approximately triplet feel). The ratio varies by genre: jazz (~67/33), shuffle (~75/25). Swing cannot be notated — it must be felt"},
         {"depth": 4, "label": "Metric Modulation", "desc": "Carter/Ligeti: the new tempo's beat = a subdivision of the old tempo. Quarter note = dotted quarter: tempo multiplied by 2/3. Tempo changes become pitch relationships — time and frequency are the same thing at different scales"},
         {"depth": 5, "label": "Neural Entrainment", "desc": "The brain's motor cortex synchronizes neural oscillations to external rhythmic stimuli. The beat is not perceived — it is predicted. Rhythm is the brain's clock. The urge to tap your foot is a neurological event, not a choice"},
     ]},
    {"id": "counterpoint", "name": "Counterpoint", "color": "#22C55E", "category": "Polyphony",
     "origin": "The art of combining independent melodic lines — the highest discipline in classical composition",
     "components": ["Species counterpoint", "Cantus firmus", "Consonance/Dissonance treatment", "Imitation", "Fugue"],
     "system": "Horizontal polyphonic axis", "uses": "Classical composition, film scoring, choral writing, contrapuntal analysis",
     "dive_layers": [
         {"depth": 0, "label": "Two Voices", "desc": "One melody holds still (cantus firmus), the other moves against it (counterpoint = 'point against point'). When both voices are interesting independently AND beautiful together, that's counterpoint"},
         {"depth": 1, "label": "Species Progression", "desc": "Fux (1725): First species (note against note), Second (2:1), Third (4:1), Fourth (syncopated), Fifth (florid/free). Five levels of increasing complexity. Bach never needed a sixth"},
         {"depth": 2, "label": "Dissonance Treatment", "desc": "Dissonance must be prepared (approached by step), sounded on a weak beat, and resolved by step downward. These three rules govern 500 years of Western music"},
         {"depth": 3, "label": "Fugue", "desc": "Subject enters alone. Answer enters in a different voice (usually at the 5th). Counter-subject accompanies. Episode modulates. Stretto overlaps entries. The fugue is counterpoint's cathedral"},
         {"depth": 4, "label": "Invertible Counterpoint", "desc": "Two melodies that work when swapped (the top becomes the bottom). At the octave: all intervals invert (3rd↔6th, 5th↔4th). Composing music that works upside down requires planning every note"},
         {"depth": 5, "label": "Information Theory", "desc": "Shannon entropy applied to melody: predictable passages have low entropy (chorus), surprising passages have high entropy (development). Great counterpoint optimizes the information rate — enough surprise to engage, enough pattern to follow. Music is structured information"},
     ]},
    {"id": "ear_training", "name": "Ear Training", "color": "#F59E0B", "category": "Perception",
     "origin": "Training the ear to identify intervals, chords, and rhythms by sound alone — the musician's core skill",
     "components": ["Interval recognition", "Chord quality", "Melodic dictation", "Rhythmic dictation", "Relative pitch"],
     "system": "Auditory-Cognitive axis", "uses": "Sight-singing, transcription, improvisation, ensemble tuning, composition",
     "dive_layers": [
         {"depth": 0, "label": "The Interval", "desc": "Minor 2nd = Jaws. Major 3rd = 'Oh When the Saints.' Perfect 5th = Star Wars. Every interval has a song reference. Train the association and you can identify any interval by ear"},
         {"depth": 1, "label": "Chord Quality", "desc": "Major = happy (bright third). Minor = sad (dark third). Diminished = tension. Augmented = unstable. Dominant 7th = blues. The ear learns to hear vertical structures as single emotional colors"},
         {"depth": 2, "label": "Melodic Dictation", "desc": "Hear a melody, write it down. Scale degree recognition: 'that note feels like home (1), that one wants to resolve down (7), that one is floating (5).' Solfege (do-re-mi) is the technology for this"},
         {"depth": 3, "label": "Relative Pitch", "desc": "Most musicians don't have absolute pitch (identifying notes without reference). Relative pitch — identifying intervals FROM a reference — is trainable to near-perfect accuracy. Relation > label"},
         {"depth": 4, "label": "Auditory Scene Analysis", "desc": "Bregman: the brain separates simultaneous sounds into 'streams' using onset time, frequency proximity, and timbre. Hearing a bass line under a melody is the brain performing real-time source separation"},
         {"depth": 5, "label": "Tonotopic Mapping", "desc": "The basilar membrane in the cochlea is a frequency analyzer: high frequencies at the base, low at the apex. Hair cells transduce vibration to neural impulses. The cochlea is a biological FFT (Fast Fourier Transform). Hearing is physics"},
     ]},
    {"id": "orchestration", "name": "Orchestration", "color": "#D4AF37", "category": "Timbre",
     "origin": "The art of choosing which instruments play which notes — painting with the colors of the orchestra",
     "components": ["Instrument ranges", "Timbre blending", "Doubling", "Dynamics/Articulation", "Score reading"],
     "system": "Timbral-Dynamic axis", "uses": "Film scoring, concert music, arrangement, music production, sound design",
     "dive_layers": [
         {"depth": 0, "label": "The Palette", "desc": "Strings (warm/sustain), Woodwinds (agile/color), Brass (power/projection), Percussion (rhythm/accent). Each family has a role. Combine them and you have 100+ simultaneous timbres to paint with"},
         {"depth": 1, "label": "Instrument Registers", "desc": "Flute: bright above the staff, thin below. Clarinet: dark low (chalumeau), clear high (clarion). French horn: heroic mid, vulnerable high. Every instrument has a personality that changes with register"},
         {"depth": 2, "label": "Doubling & Blending", "desc": "Flute + violin = bright, focused tone. Oboe + clarinet = warm, reedy blend. Horn + bassoon = dark, blended warmth. Doubling at the unison reinforces; doubling at the octave extends range"},
         {"depth": 3, "label": "Dynamic Balancing", "desc": "A trumpet at forte overpowers four violins. Orchestration is physics: a brass instrument radiates directionally, strings radiate omnidirectionally. Balance requires understanding acoustic power output"},
         {"depth": 4, "label": "Spectral Analysis", "desc": "Timbre is the harmonic spectrum: a clarinet produces mostly odd harmonics (hollow sound), a violin produces all harmonics (rich sound). The relative amplitude of each overtone IS the timbre. Orchestration is spectral engineering"},
         {"depth": 5, "label": "Psychoacoustic Masking", "desc": "Louder sounds mask quieter sounds at nearby frequencies (simultaneous masking). A sustained chord masks a delicate melody in the same register. Orchestration must account for the ear's frequency selectivity — critical bandwidth and auditory filters determine what the listener actually hears"},
     ]},
]

MUSIC_TOOLS = [
    {"id": "keyboard", "name": "Keyboard", "icon_symbol": "Music", "action_verb": "Play", "xp_per_action": 12, "color": "#8B5CF6", "desc": "Visualize and play scales, chords, and progressions on the universal music instrument"},
    {"id": "staff_writer", "name": "Staff Notation", "icon_symbol": "Type", "action_verb": "Notate", "xp_per_action": 10, "color": "#F8FAFC", "desc": "Write music in standard notation — the universal written language of music"},
    {"id": "ear_trainer", "name": "Ear Trainer", "icon_symbol": "Headphones", "action_verb": "Listen", "xp_per_action": 10, "color": "#F59E0B", "desc": "Practice interval recognition, chord identification, and melodic dictation"},
    {"id": "metronome", "name": "Metronome", "icon_symbol": "Clock", "action_verb": "Tempo", "xp_per_action": 8, "color": "#EF4444", "desc": "Practice with precise tempo control and subdivision for rhythmic accuracy"},
    {"id": "chord_analyzer", "name": "Chord Analyzer", "icon_symbol": "Layers", "action_verb": "Analyze", "xp_per_action": 10, "color": "#3B82F6", "desc": "Input a chord and see its name, intervals, function, and common progressions"},
    {"id": "score_reader", "name": "Score Reader", "icon_symbol": "BookOpen", "action_verb": "Study", "xp_per_action": 8, "color": "#D4AF37", "desc": "Read and analyze orchestral scores from Bach to film composers"},
    {"id": "circle_of_fifths", "name": "Circle of Fifths", "icon_symbol": "Compass", "action_verb": "Navigate", "xp_per_action": 8, "color": "#22C55E", "desc": "Navigate key relationships, find relative minors, and understand modulation paths"},
    {"id": "transposer", "name": "Transposer", "icon_symbol": "Repeat", "action_verb": "Transpose", "xp_per_action": 8, "color": "#A78BFA", "desc": "Transpose melodies and progressions between keys while maintaining intervallic structure"},
    {"id": "counterpoint_lab", "name": "Counterpoint Lab", "icon_symbol": "Sparkles", "action_verb": "Compose", "xp_per_action": 15, "color": "#EC4899", "desc": "Practice species counterpoint against a cantus firmus with rule checking"},
]

# ── PERMACULTURE ──
PERMACULTURE_MATERIALS = [
    {"id": "design_principles", "name": "Design Principles", "color": "#22C55E", "category": "Foundation",
     "origin": "Mollison and Holmgren's 12 principles — the operating system for designing regenerative human habitats",
     "components": ["Observe and interact", "Catch and store energy", "Obtain a yield", "Self-regulate", "Use renewables"],
     "system": "Ethical design framework", "uses": "Site design, farm planning, community development, urban design",
     "dive_layers": [
         {"depth": 0, "label": "The Ethics", "desc": "Earth Care, People Care, Fair Share. Every permaculture design starts here. If the design doesn't serve all three, it's not permaculture — it's just landscaping"},
         {"depth": 1, "label": "Observe Before Acting", "desc": "Spend one full year observing your site: where does water flow? Where is shade? Where is wind? What grows naturally? The site already knows the design. Your job is to listen"},
         {"depth": 2, "label": "Stacking Functions", "desc": "Every element performs multiple functions. A fruit tree provides food, shade, wind break, habitat, nitrogen fixation (if leguminous), and beauty. Redundancy through multifunctionality"},
         {"depth": 3, "label": "Zone & Sector Planning", "desc": "Zone 0 (house) to Zone 5 (wilderness). Place elements by frequency of use. Sector analysis: map sun angles, wind direction, water flow, fire risk. Design with energy, not against it"},
         {"depth": 4, "label": "Edge Effect", "desc": "The boundary between two ecosystems (forest/meadow, land/water) is the most productive zone. Increase edge through keyhole beds, herb spirals, and contour swales. Nature's abundance concentrates at interfaces"},
         {"depth": 5, "label": "Succession Theory", "desc": "Bare soil → pioneer weeds → grasses → shrubs → pioneer trees → climax forest. Permaculture accelerates succession through guilds and stacking. You're not building a garden — you're fast-forwarding 200 years of ecological development. Design IS accelerated evolution"},
     ]},
    {"id": "food_forest", "name": "Food Forest", "color": "#92400E", "category": "Agroforestry",
     "origin": "A self-sustaining, multi-layered edible ecosystem modeled on the structure of a natural forest",
     "components": ["Canopy layer", "Understory trees", "Shrub layer", "Herbaceous", "Ground cover", "Root crops", "Vine layer"],
     "system": "Seven-layer agroforestry", "uses": "Long-term food production, biodiversity, carbon sequestration, water retention, wildlife habitat",
     "dive_layers": [
         {"depth": 0, "label": "Seven Layers", "desc": "Canopy (walnut, chestnut), Understory (apple, pear), Shrub (blueberry, hazelnut), Herbaceous (comfrey, mint), Ground cover (clover, strawberry), Root (garlic, turmeric), Vine (grape, kiwi). Every vertical inch produces food"},
         {"depth": 1, "label": "Guild Design", "desc": "Apple guild: apple tree (production) + comfrey (nutrients) + clover (nitrogen) + daffodil (pest deterrent) + bee balm (pollinator). Each plant supports the others. No single point of failure"},
         {"depth": 2, "label": "Nitrogen Fixation", "desc": "Rhizobium bacteria in legume root nodules convert atmospheric N₂ → NH₃. One mature alder fixes 40-300 kg N/hectare/year. Free fertilizer, solar-powered, self-regulating"},
         {"depth": 3, "label": "Mycorrhizal Network", "desc": "Fungi connect tree roots underground, transferring nutrients and water between species. Mother trees feed seedlings through the network. The 'Wood Wide Web' is not a metaphor — it's measured biochemistry"},
         {"depth": 4, "label": "Nutrient Cycling", "desc": "Leaf litter → soil fauna (earthworms, arthropods) → humus → plant roots → leaves. A mature food forest cycles nutrients internally with zero external inputs. The system feeds itself by recycling death into life"},
         {"depth": 5, "label": "Thermodynamic Efficiency", "desc": "A food forest captures 3-8% of incoming solar radiation as biomass (vs 0.1% for annual crops). Higher leaf area index = more photosynthesis per unit ground area. The food forest approaches the thermodynamic limit of solar energy conversion for temperate ecosystems"},
     ]},
    {"id": "water_harvest", "name": "Water Harvesting", "color": "#3B82F6", "category": "Hydrology",
     "origin": "Catching, storing, and infiltrating every drop of rain before it leaves the property — water is life",
     "components": ["Swale (contour ditch)", "Rain garden", "Keyline design", "Hugelkultur", "Cistern"],
     "system": "Passive water management", "uses": "Drought resilience, groundwater recharge, flood prevention, irrigation-free farming",
     "dive_layers": [
         {"depth": 0, "label": "The Swale", "desc": "A level ditch on contour with a berm on the downhill side. Water fills the swale and infiltrates slowly. One inch of rain on 1,000 sq ft = 623 gallons. A swale turns runoff into groundwater"},
         {"depth": 1, "label": "Keyline Design", "desc": "Yeomans (1954): plow parallel to the keyline (the point where slope changes from convex to concave). Water spreads from valleys to ridges, hydrating the entire landscape evenly"},
         {"depth": 2, "label": "Hugelkultur", "desc": "Buried logs under soil mounds. Logs absorb water like sponges (1 cubic meter of wood holds 800 liters). As wood decomposes over 20 years, it releases nutrients and moisture. A self-watering raised bed"},
         {"depth": 3, "label": "Infiltration Rate", "desc": "Sandy soil: 2+ inches/hour. Clay: 0.1 inch/hour. Adding organic matter increases porosity. Mycorrhizal fungi produce glomalin, which binds soil aggregates and creates water channels. Biology builds hydrology"},
         {"depth": 4, "label": "Hydrological Cycle", "desc": "Small water cycle: evapotranspiration from vegetation → local rainfall → infiltration → springs. Deforested landscapes break this cycle. Rehydrating land through permaculture restores local rain patterns"},
         {"depth": 5, "label": "Capillary Action", "desc": "Water rises through soil pores against gravity via surface tension and adhesion. Smaller pores = higher rise (clay: 2+ meters). The meniscus at the air-water interface exerts a force described by the Young-Laplace equation. Every drop of water in the soil column is suspended by molecular physics"},
     ]},
    {"id": "composting", "name": "Composting Systems", "color": "#92400E", "category": "Soil Building",
     "origin": "Controlled decomposition — turning waste into the most valuable substance in agriculture: humus",
     "components": ["C:N ratio", "Thermophilic phase", "Vermicompost", "Bokashi", "Compost tea"],
     "system": "Microbial decomposition", "uses": "Soil fertility, waste reduction, pathogen kill, seedling media, bioremediation",
     "dive_layers": [
         {"depth": 0, "label": "The Pile", "desc": "Browns (carbon: leaves, cardboard, straw) + Greens (nitrogen: food scraps, grass, manure) at 30:1 C:N ratio. Add water and air. Microbes do the rest in 2-6 months"},
         {"depth": 1, "label": "Thermophilic Phase", "desc": "130-160°F for 3+ days kills pathogens and weed seeds. Thermophilic bacteria (Thermus, Bacillus) dominate. Turn the pile to introduce oxygen. If it smells bad, it's anaerobic — turn it"},
         {"depth": 2, "label": "Vermicomposting", "desc": "Red wigglers (Eisenia fetida) eat their body weight daily. Worm castings contain 5x more nitrogen, 7x more phosphorus, 11x more potassium than surrounding soil. The worm's gut is a fertilizer factory"},
         {"depth": 3, "label": "Humic Substances", "desc": "Humic acid, fulvic acid, humin: the stable end-products of decomposition. They persist in soil for centuries, holding water at 20x their weight and chelating minerals for plant uptake. Humus is black gold"},
         {"depth": 4, "label": "Microbial Succession", "desc": "Bacteria dominate first (sugar feeders), then fungi (cellulose/lignin breakers), then protozoa and nematodes (bacteria grazers). Each trophic level releases nutrients the previous locked up. Decomposition has an ecological structure"},
         {"depth": 5, "label": "Humification Chemistry", "desc": "Lignin fragments polymerize with amino acids and polysaccharides via Maillard-type reactions to form recalcitrant humic polymers. These resist further decomposition because no single enzyme can cleave their random cross-links. Humus is entropy's last stand against decay — molecular complexity as durability"},
     ]},
    {"id": "soil_biology", "name": "Soil Biology", "color": "#D4AF37", "category": "Microbiome",
     "origin": "The underground civilization — a teaspoon of healthy soil contains more organisms than people on Earth",
     "components": ["Bacteria", "Fungi", "Protozoa", "Nematodes", "Arthropods"],
     "system": "Soil food web", "uses": "Regenerative agriculture, carbon farming, disease suppression, nutrient cycling, erosion prevention",
     "dive_layers": [
         {"depth": 0, "label": "The Food Web", "desc": "Bacteria → protozoa eat bacteria → nematodes eat protozoa → arthropods eat nematodes → birds eat arthropods. Each step releases plant-available nutrients. The soil food web IS the fertilizer system"},
         {"depth": 1, "label": "Bacterial-Fungal Ratio", "desc": "Grassland: bacteria-dominated. Forest: fungi-dominated. Annual crops: bacterial. Perennials: fungal. The B:F ratio determines which plants thrive. Succession moves soil from bacterial to fungal dominance"},
         {"depth": 2, "label": "Mycorrhizal Exchange", "desc": "Plant trades sugars (photosynthate) for minerals (phosphorus, zinc, copper) from fungal hyphae. The fungal network extends root reach 100-1000x. 90% of plant species depend on this trade. It's the oldest economic system on Earth"},
         {"depth": 3, "label": "Aggregate Formation", "desc": "Fungal hyphae physically bind soil particles. Glomalin (fungal glycoprotein) glues aggregates. Root exudates feed bacteria that produce biofilms. Soil structure is biologically built, not chemically created"},
         {"depth": 4, "label": "Carbon Sequestration", "desc": "Plants pump 20-40% of photosynthate into roots → exudates → soil microbes. Microbial necromass becomes stable soil carbon. Grasslands store 2x more carbon than forests (belowground). Soil is the largest terrestrial carbon sink"},
         {"depth": 5, "label": "Quorum Sensing", "desc": "Soil bacteria communicate via autoinducer molecules (acyl-homoserine lactones). At threshold population density, the colony switches gene expression collectively — biofilm formation, enzyme production, pathogen defense. Democracy at the molecular level, underground"},
     ]},
    {"id": "climate_resilience", "name": "Climate Resilience", "color": "#60A5FA", "category": "Adaptation",
     "origin": "Designing landscapes that thrive under climate uncertainty — drought, flood, heat, and cold",
     "components": ["Microclimate design", "Windbreaks", "Thermal mass", "Drought-adapted species", "Flood management"],
     "system": "Adaptive design axis", "uses": "Farm resilience, urban cooling, fire protection, coastal defense, community preparedness",
     "dive_layers": [
         {"depth": 0, "label": "The Design", "desc": "South-facing slope for warmth. Windbreak on the north. Thermal mass (stone/water) buffers temperature. Diverse species = diverse responses. No monoculture survives climate chaos — diversity is insurance"},
         {"depth": 1, "label": "Microclimate Stacking", "desc": "A south-facing stone wall creates Zone 9 conditions in Zone 6. A pond moderates surrounding air temperature 5-10°F. A windbreak reduces wind speed for 10x its height downwind. Design microclimates within your climate"},
         {"depth": 2, "label": "Drought Strategy", "desc": "Deep mulch (6+ inches), swales for infiltration, drought-adapted root stocks, reducing exposed soil. A well-designed permaculture system uses 1/10th the water of conventional agriculture for the same yield"},
         {"depth": 3, "label": "Albedo Management", "desc": "Dark surfaces absorb heat (urban heat island). Light mulch reflects it. Tree canopy reduces ground temperature 10-15°F. Ponds provide evaporative cooling. Albedo design is passive air conditioning at landscape scale"},
         {"depth": 4, "label": "Resilience Theory", "desc": "Holling: adaptive cycle — growth → conservation → release → reorganization. Resilient systems tolerate disturbance by maintaining diversity, redundancy, and modularity. The opposite of efficiency is resilience. Design for both"},
         {"depth": 5, "label": "Entropy & Negentropy", "desc": "Schrödinger: life maintains order by exporting entropy. A permaculture system captures solar energy (low entropy photons) and builds biological complexity (negentropy). The food forest is a local reversal of the Second Law — order from chaos, powered by sunlight. Design as applied thermodynamics"},
     ]},
]

PERMACULTURE_TOOLS = [
    {"id": "site_survey", "name": "Site Survey Kit", "icon_symbol": "Map", "action_verb": "Survey", "xp_per_action": 12, "color": "#22C55E", "desc": "Map sun, wind, water, slope, and soil across your site using sector and zone analysis"},
    {"id": "a_frame", "name": "A-Frame Level", "icon_symbol": "Triangle", "action_verb": "Mark", "xp_per_action": 10, "color": "#92400E", "desc": "Find and mark contour lines across the landscape for swale and keyline placement"},
    {"id": "broadfork", "name": "Broadfork", "icon_symbol": "Wrench", "action_verb": "Aerate", "xp_per_action": 10, "color": "#6B7280", "desc": "Deep-aerate soil without inverting layers — preserving the soil food web while improving infiltration"},
    {"id": "refractometer", "name": "Refractometer (Brix)", "icon_symbol": "Eye", "action_verb": "Test", "xp_per_action": 8, "color": "#D4AF37", "desc": "Measure plant sap sugar content (Brix) as an indicator of plant health and pest resistance"},
    {"id": "seed_saver", "name": "Seed Saving Kit", "icon_symbol": "Leaf", "action_verb": "Save", "xp_per_action": 10, "color": "#22C55E", "desc": "Harvest, dry, and store seeds for genetic diversity and food sovereignty"},
    {"id": "soil_test", "name": "Soil Test Kit", "icon_symbol": "Layers", "action_verb": "Test", "xp_per_action": 8, "color": "#92400E", "desc": "Test pH, NPK, organic matter, and microbial activity to guide soil building strategy"},
    {"id": "guild_planner", "name": "Guild Planner", "icon_symbol": "Sparkles", "action_verb": "Design", "xp_per_action": 12, "color": "#3B82F6", "desc": "Design plant guilds with complementary root depths, nutrient needs, and pest deterrence"},
    {"id": "compost_thermo", "name": "Compost Thermometer", "icon_symbol": "Flame", "action_verb": "Monitor", "xp_per_action": 8, "color": "#EF4444", "desc": "Monitor compost core temperature to verify thermophilic pathogen kill (131°F+ for 3 days)"},
    {"id": "water_calc", "name": "Water Budget Calculator", "icon_symbol": "Droplets", "action_verb": "Calculate", "xp_per_action": 10, "color": "#3B82F6", "desc": "Calculate rainfall capture, storage needs, and irrigation-free potential for your site"},
]

# ── Register V68.0 modules ──
MODULES["forestry"] = {"materials": FORESTRY_MATERIALS, "tools": FORESTRY_TOOLS, "mat_key": "practices", "mat_id_key": "practice_id", "skill": "Forestry_Skill"}
MODULES["geology"] = {"materials": GEOLOGY_MATERIALS, "tools": GEOLOGY_TOOLS, "mat_key": "formations", "mat_id_key": "formation_id", "skill": "Geology_Skill"}
MODULES["economics"] = {"materials": ECONOMICS_MATERIALS, "tools": ECONOMICS_TOOLS, "mat_key": "concepts", "mat_id_key": "concept_id", "skill": "Economics_Skill"}
MODULES["music"] = {"materials": MUSIC_MATERIALS, "tools": MUSIC_TOOLS, "mat_key": "elements", "mat_id_key": "element_id", "skill": "Music_Skill"}
MODULES["permaculture"] = {"materials": PERMACULTURE_MATERIALS, "tools": PERMACULTURE_TOOLS, "mat_key": "systems", "mat_id_key": "system_id", "skill": "Permaculture_Skill"}

WORKSHOP_REGISTRY["forestry"] = {"title": "Forestry Workshop", "subtitle": "Trade Pillar — Tap the practice to dive into forest science. Select a tool to manage the woodland.", "icon": "Axe", "accentColor": "#22C55E", "skillKey": "Forestry_Skill", "matLabel": "Practice", "domain": "Trade & Craft"}
WORKSHOP_REGISTRY["geology"] = {"title": "Geology Workshop", "subtitle": "Science Pillar — Tap the formation to dive into Earth science. Select a tool to read the rock record.", "icon": "Mountain", "accentColor": "#6B7280", "skillKey": "Geology_Skill", "matLabel": "Formation", "domain": "Science & Physics"}
WORKSHOP_REGISTRY["economics"] = {"title": "Economics Workshop", "subtitle": "Sacred Knowledge — Tap the concept to dive into the dismal science. Select a tool to decode markets.", "icon": "TrendingUp", "accentColor": "#F59E0B", "skillKey": "Economics_Skill", "matLabel": "Concept", "domain": "Sacred Knowledge"}
WORKSHOP_REGISTRY["music"] = {"title": "Music Theory Workshop", "subtitle": "Creative Pillar — Tap the element to dive into sound architecture. Select a tool to compose.", "icon": "Music", "accentColor": "#8B5CF6", "skillKey": "Music_Skill", "matLabel": "Element", "domain": "Creative Arts"}
WORKSHOP_REGISTRY["permaculture"] = {"title": "Permaculture Workshop", "subtitle": "Healing Pillar — Tap the system to dive into regenerative design. Select a tool to heal the land.", "icon": "Leaf", "accentColor": "#22C55E", "skillKey": "Permaculture_Skill", "matLabel": "System", "domain": "Healing Arts"}



INTENT_TAGS = {
    "masonry": ["stone", "structure", "foundation", "build", "chisel", "mortar", "architecture", "mineral", "construction", "strength"],
    "carpentry": ["wood", "grain", "joint", "build", "saw", "plane", "furniture", "timber", "craft", "structure"],
    "electrical": ["wire", "current", "voltage", "circuit", "safety", "power", "conductivity", "energy", "light", "resistance"],
    "plumbing": ["water", "pipe", "flow", "pressure", "drain", "repair", "solder", "copper", "valve", "fluid"],
    "landscaping": ["soil", "earth", "plant", "garden", "nature", "drainage", "ecology", "growth", "terrain", "roots"],
    "welding": ["metal", "heat", "fusion", "steel", "fabrication", "strength", "structure", "arc", "join", "forge"],
    "automotive": ["engine", "repair", "diagnosis", "brake", "fuel", "drive", "mechanic", "torque", "vehicle", "power"],
    "nursing": ["care", "health", "vitals", "patient", "healing", "assessment", "medication", "safety", "anatomy", "wellness"],
    "childcare": ["development", "nurture", "play", "safety", "nutrition", "growth", "learning", "empathy", "child", "education"],
    "eldercare": ["dignity", "mobility", "memory", "comfort", "aging", "care", "companion", "wellness", "respect", "compassion"],
    "bible": ["scripture", "faith", "wisdom", "prayer", "theology", "spirit", "word", "study", "gospel", "truth"],
    "nutrition": ["food", "diet", "health", "vitality", "ferment", "nourish", "gut", "energy", "whole", "superfood"],
    "meditation": ["breath", "silence", "focus", "awareness", "calm", "mindfulness", "peace", "consciousness", "presence", "stillness"],
    "hvac": ["air", "temperature", "comfort", "heating", "cooling", "ventilation", "climate", "refrigerant", "duct", "efficiency"],
    "robotics": ["automation", "sensor", "motor", "programming", "circuit", "control", "feedback", "machine", "intelligence", "mechanism"],
    "first_aid": ["emergency", "rescue", "bleeding", "cpr", "safety", "trauma", "survival", "wound", "response", "life"],
    "hermetics": ["principle", "vibration", "correspondence", "transmutation", "polarity", "alchemy", "consciousness", "universal", "wisdom", "sacred"],
    "speaking": ["communication", "persuasion", "audience", "voice", "confidence", "rhetoric", "presentation", "story", "influence", "leadership"],
    "philosophy": ["ethics", "logic", "truth", "reason", "metaphysics", "wisdom", "thinking", "argument", "consciousness", "virtue"],
    "pedagogy": ["teaching", "learning", "education", "assessment", "curriculum", "classroom", "student", "instruction", "development", "knowledge"],
    "anatomy": ["body", "muscle", "bone", "nerve", "heart", "brain", "health", "physiology", "movement", "organ"],
    "machining": ["metal", "precision", "lathe", "mill", "cnc", "measurement", "tolerance", "cutting", "manufacturing", "tool"],
    "forestry": ["timber", "tree", "chainsaw", "wildfire", "wood", "watershed", "harvest", "ecology", "lumber", "dendrology"],
    "geology": ["rock", "mineral", "earthquake", "plate", "crystal", "fossil", "volcano", "sediment", "igneous", "metamorphic"],
    "economics": ["market", "money", "trade", "gdp", "inflation", "supply", "demand", "price", "policy", "investment"],
    "music": ["scale", "chord", "harmony", "rhythm", "melody", "key", "tempo", "counterpoint", "interval", "composition"],
    "permaculture": ["garden", "soil", "compost", "water", "regenerative", "food", "forest", "sustainable", "ecology", "design"],
}


@router.get("/workshop/search")
async def search_workshops(q: str = ""):
    """V63.0 Intent-Based Neural Search — find workshops by concept across all 7 domains."""
    if not q or len(q) < 2:
        return {"results": [], "query": q}

    query_lower = q.lower().strip()
    results = []

    for mod_id, meta in WORKSHOP_REGISTRY.items():
        score = 0
        # Title match
        if query_lower in meta["title"].lower():
            score += 10
        # Subtitle match
        if query_lower in meta["subtitle"].lower():
            score += 5
        # Domain match
        if query_lower in meta["domain"].lower():
            score += 8
        # Tag match (cross-domain intent)
        tags = INTENT_TAGS.get(mod_id, [])
        for tag in tags:
            if query_lower in tag or tag in query_lower:
                score += 3

        # Material name/origin match
        module = MODULES.get(mod_id)
        if module:
            for mat in module["materials"]:
                if query_lower in mat.get("name", "").lower():
                    score += 7
                if query_lower in mat.get("origin", "").lower():
                    score += 2
            for tool in module["tools"]:
                if query_lower in tool.get("name", "").lower():
                    score += 4
                if query_lower in tool.get("description", "").lower():
                    score += 1

        if score > 0:
            results.append({
                "id": mod_id,
                "title": meta["title"],
                "domain": _display_domain(meta["domain"]),
                "icon": meta["icon"],
                "accentColor": meta["accentColor"],
                "route": f"/workshop/{mod_id}",
                "score": score,
                "matchedTags": [t for t in tags if query_lower in t or t in query_lower],
            })

    results.sort(key=lambda r: -r["score"])
    return {"results": results, "query": q, "total": len(results)}


@router.get("/workshop/registry")
async def get_workshop_registry():
    """V62.0 Master Registry — returns all available workshop modules with metadata and search tags."""
    registry = []
    for mod_id, meta in WORKSHOP_REGISTRY.items():
        module = MODULES.get(mod_id)
        registry.append({
            "id": mod_id,
            "title": meta["title"],
            "subtitle": _display_text(meta["subtitle"]),
            "icon": meta["icon"],
            "accentColor": meta["accentColor"],
            "skillKey": meta["skillKey"],
            "matLabel": meta["matLabel"],
            "domain": _display_domain(meta["domain"]),
            "materialCount": len(module["materials"]) if module else 0,
            "toolCount": len(module["tools"]) if module else 0,
            "route": f"/workshop/{mod_id}",
            "tags": INTENT_TAGS.get(mod_id, []),
        })
    return {"modules": registry, "total": len(registry)}

