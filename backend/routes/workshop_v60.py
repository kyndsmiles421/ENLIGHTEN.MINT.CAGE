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
