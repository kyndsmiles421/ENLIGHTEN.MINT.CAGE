"""
V60.0-V62.0 — Sovereign Interaction Cells: Universal Workshop Engine
All modules use proven Circular Workshop DNA.
All endpoints open to guests (Universal Access).
"""
from fastapi import APIRouter, Body
from routes.workshop import MASONRY_STONES, MASONRY_TOOLS, CARPENTRY_WOODS, CARPENTRY_TOOLS

router = APIRouter()

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
    """Universal tools endpoint for all V60.0 modules."""
    module = MODULES.get(module_id)
    if not module:
        return {"error": f"Module '{module_id}' not found"}
    return {"tools": module["tools"]}


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

    return {
        "action": f"{tool['action_verb']} {mat['name']}",
        "tool": tool["name"],
        "material": mat["name"],
        "xp_awarded": tool["xp_per_action"],
        "skill": module["skill"],
        "tutorial_context": (
            f"The user selected the {tool['name']} tool on {mat['name']}. "
            f"Technique: {tool['technique']} "
            f"Context: {mat['origin']}. "
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
                "domain": meta["domain"],
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
            "subtitle": meta["subtitle"],
            "icon": meta["icon"],
            "accentColor": meta["accentColor"],
            "skillKey": meta["skillKey"],
            "matLabel": meta["matLabel"],
            "domain": meta["domain"],
            "materialCount": len(module["materials"]) if module else 0,
            "toolCount": len(module["tools"]) if module else 0,
            "route": f"/workshop/{mod_id}",
            "tags": INTENT_TAGS.get(mod_id, []),
        })
    return {"modules": registry, "total": len(registry)}

