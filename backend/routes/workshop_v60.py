"""
V60.0 — Sovereign Interaction Cells: Batch Activation
5 new modules using the proven Circular Workshop DNA.

Trades: Electrical, Plumbing, Landscaping
Healing: Nursing
Sacred: Bible Study

All endpoints open to guests (Universal Access).
"""
from fastapi import APIRouter, Body

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
