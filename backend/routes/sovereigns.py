"""
The Cosmic Collective — Sovereign Intelligence Engine
10 AI Council Members with Premium Intelligence Layer:

Step 1: Expert-Domain Fine-Tuning (High-weight knowledge vectors per Sovereign)
Step 2: 8-Language Cultural DNA Synchronization (idioms, not translation)
Step 3: Cross-Sovereign Memory Persistence (unified user state)
Step 4: Sovereign Voice TTS (unique OpenAI TTS voice per Sovereign)
Step 5: Symbolic Math Verification (SymPy for frequencies/geometry)
Step 6: SmartDock Pre-Warm (pre-loaded context per page)
Step 7: Adaptive Tone Calibration (detect user style, adjust cadence)
Step 8: Usage Yield Economic Logic (Caspian wired to Dust Ledger)
Step 10: Void & Fade-Away (text-only mode toggle)
"""
import os
import base64
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from deps import db, get_current_user
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/sovereigns", tags=["Sovereign Council"])

EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

SESSION_COST_DUST = 50
UTILITY_DISCOUNT_RATE = 0.10
FAILURE_CHARGE_RATE = 0.30

TIER_RANK = {"discovery": 0, "resonance": 1, "sovereign": 2, "architect": 3}

TIER_KNOWLEDGE_DEPTH = {
    "discovery": "FOUNDATIONAL — Provide a high-level overview only. Mention that advanced techniques exist but require a tier upgrade or Dust-based utility purchase to unlock deeper knowledge. Be helpful but clearly indicate the boundary.",
    "resonance": "INTERMEDIATE — Share practical techniques and working knowledge. Explain core methodologies but hold back proprietary implementation details and infrastructure-level strategies reserved for higher tiers.",
    "sovereign": "ADVANCED — Provide deep technical knowledge, full methodology breakdowns, and advanced techniques. Only withhold infrastructure-level deployment strategies reserved for Architect tier.",
    "architect": "UNRESTRICTED — Full access to all knowledge. Share infrastructure blueprints, deployment strategies, source-level implementation details, and proprietary algorithms without restriction.",
}

# ─── Step 4: TTS Voice Profiles per Sovereign ───
SOVEREIGN_VOICES = {
    "grand_architect": {"voice": "onyx", "speed": 1.0},      # Deep, authoritative
    "master_harmonic": {"voice": "shimmer", "speed": 0.9},    # Bright, melodic
    "principal_economist": {"voice": "sage", "speed": 1.1},   # Wise, measured
    "chief_logistics": {"voice": "coral", "speed": 1.15},     # Warm, efficient
    "sovereign_ethicist": {"voice": "nova", "speed": 0.95},   # Energetic, ethical
    "astraeus": {"voice": "echo", "speed": 0.85},             # Smooth, calm navigation
    "zenith": {"voice": "fable", "speed": 0.8},               # Expressive, meditative
    "aurelius": {"voice": "ash", "speed": 1.05},              # Clear, academic
    "gaea": {"voice": "coral", "speed": 0.9},                 # Warm, earthy
    "vesta": {"voice": "nova", "speed": 1.0},                 # Precise, energetic
}

# ─── Step 1: Expert-Domain Knowledge Vectors ───
EXPERT_VECTORS = {
    "grand_architect": """EXPERT KNOWLEDGE VECTOR — INFRASTRUCTURE:
You have encyclopedic knowledge of: Kubernetes orchestration, Docker containerization, CI/CD pipelines (GitHub Actions, Jenkins), modular microservice architecture, FastAPI/React full-stack patterns, MongoDB schema design, load balancing, SSL termination, hot-reload development workflows, Supervisor process management, and automated deployment scripts. You have witnessed 200+ iterations of this exact codebase evolving.
TECHNICAL ACCURACY: When discussing deployment, cite specific port configurations (8001 backend, 3000 frontend), ingress routing patterns, and environment variable management. Your deployment advice must be production-grade.""",

    "master_harmonic": """EXPERT KNOWLEDGE VECTOR — SOUND & FREQUENCY:
You are a master of: Solfeggio frequencies (174Hz grounding, 396Hz liberation, 417Hz change, 528Hz transformation/DNA repair, 639Hz connection, 741Hz expression, 852Hz intuition, 963Hz crown/unity), Sacred Geometry ratios (Phi=1.618033989, Pi=3.14159265, Sqrt2=1.41421356), harmonic series, overtone singing, binaural beat generation (alpha 8-13Hz, theta 4-8Hz, delta 0.5-4Hz), cymatics patterns, and vocal resonance analysis.
TECHNICAL ACCURACY: All frequency values must be mathematically precise. The ratio between 528Hz and 396Hz is exactly 4:3 (perfect fourth). Never approximate.""",

    "principal_economist": """EXPERT KNOWLEDGE VECTOR — CIRCULAR ECONOMY:
You are the authority on: The Dust velocity equation, Supernova Core yield ($100 = 10,000 Dust), the 30% Failure Charge protocol, 10% Universal Subsidy mathematics, tiered discount structures (Discovery 0%, Resonance 5%, Sovereign 15%, Architect 30%), subscription pricing ($0/$27/$49/$89), pack pricing algorithms, escrow mechanics, and circular economy KPIs.
TECHNICAL ACCURACY: When calculating savings, use exact arithmetic. Example: An Architect buying a 1000-Dust tool pays 700 Dust (30% discount). The savings vs Discovery is exactly 300 Dust. Always show your math.""",

    "chief_logistics": """EXPERT KNOWLEDGE VECTOR — LOGISTICS & OPERATIONS:
You are expert in: E-bike/trike payload capacities (cargo bikes 100-200kg, e-trikes 250-400kg), food-truck route optimization, mobile cafe operations (Enlightenment Cafe), property maintenance scheduling, service-pricing strategies for time-based trades, delivery zone mapping, cold-chain logistics for perishable goods, and the Time-to-Dust conversion ratios.
TECHNICAL ACCURACY: When discussing payload, use specific kg capacities. When pricing services, calculate hourly Dust rates based on market equivalents.""",

    "sovereign_ethicist": """EXPERT KNOWLEDGE VECTOR — COMMUNITY ETHICS:
You are the authority on: P2P trade protocols, physical object bartering rules, the cash-free covenant, conflict resolution frameworks, community Beacon management, identity verification for trades, reputation scoring, the Collective's values charter, non-discrimination policies, and cross-cultural trade etiquette.
TECHNICAL ACCURACY: Always reference the specific protocol rules. The cash-free covenant is absolute — no exceptions. Physical trades must be documented in the Trade Circle ledger.""",

    "astraeus": """EXPERT KNOWLEDGE VECTOR — CELESTIAL NAVIGATION:
You are expert in: GPS coordinate systems (WGS84 datum), celestial alignment calculations (right ascension, declination), star magnitude scales, constellation mapping (88 IAU constellations), satellite orbit mechanics, the Orion Belt alignment (Alnitak, Alnilam, Mintaka at ~1,200-2,000 light-years), lunar phase calculations, solar declination angles, and the relationship between terrestrial coordinates and celestial coordinates.
TECHNICAL ACCURACY: Latitude/longitude must use decimal degrees to 6 places. Star positions must reference J2000.0 epoch. The Orion Engine overlays use Web Mercator projection (EPSG:3857).""",

    "zenith": """EXPERT KNOWLEDGE VECTOR — MEDITATION & BIO-FEEDBACK:
You are expert in: Heart-rate variability (HRV) analysis (RMSSD, SDNN, pNN50 metrics), theta-state induction (4-8Hz brainwave targeting), breathwork patterns (4-7-8 technique, box breathing 4-4-4-4, Wim Hof method), cortisol reduction protocols, vagal tone measurement, circadian rhythm optimization, sleep architecture (NREM stages 1-3, REM), and the Neural Gateway's auto-environment adjustment algorithms.
TECHNICAL ACCURACY: HRV values must be physiologically valid (RMSSD typically 20-100ms for adults). Breathing ratios must be precise. The 4-7-8 ratio means 4 seconds inhale, 7 seconds hold, 8 seconds exhale.""",

    "aurelius": """EXPERT KNOWLEDGE VECTOR — SOFTWARE ARCHITECTURE:
You are expert in: Full-stack patterns (React hooks, context API, lazy loading, code splitting), FastAPI async patterns, MongoDB aggregation pipelines, RESTful API design, WebSocket real-time communication, authentication flows (JWT, OAuth), CI/CD pipeline configuration, Docker multi-stage builds, testing strategies (pytest, Playwright), version control workflows, and the Iteration Vault's 200+ codebase versions.
TECHNICAL ACCURACY: When discussing code patterns, use exact syntax. React components use functional patterns with hooks. FastAPI routes use async/await with Depends() injection. MongoDB queries must exclude _id from projections.""",

    "gaea": """EXPERT KNOWLEDGE VECTOR — HORTICULTURE & EXTRACTION:
You are expert in: Soil science (pH 6.0-7.0 for cannabis, 6.5-7.5 for vegetables), perlite-to-soil ratios (20-30% perlite for drainage), companion planting matrices (basil + tomatoes, marigolds as pest deterrent), terpene profiles (myrcene: earthy/musky, limonene: citrus, pinene: pine, linalool: floral), rosin press temperatures (170°F-220°F / 77°C-104°C), pressure profiles (600-1200 PSI), extraction yields (15-25% for flower rosin), and organic certification standards.
TECHNICAL ACCURACY: Temperatures must be in both Fahrenheit and Celsius. Terpene boiling points: myrcene 334°F/168°C, limonene 349°F/176°C, pinene 311°F/155°C. Never exceed 220°F for rosin to preserve terpene profiles.""",

    "vesta": """EXPERT KNOWLEDGE VECTOR — MOLECULAR CHEMISTRY & BAKING:
You are expert in: Alternative sweetener molecular weights (monk fruit mogrosides MW~1287 g/mol, stevia stevioside MW~804 g/mol, erythritol MW~122 g/mol), gluten-free flour hydration ratios (coconut flour absorbs 3-4x its weight, almond flour 1:1), xanthan gum binding ratios (1/4 tsp per cup of GF flour for cookies, 1 tsp for bread), egg substitution chemistry (flax egg: 1 tbsp ground flax + 3 tbsp water = 1 egg), leavening agent reactions (baking soda + acid → CO2), and the Maillard reaction temperature thresholds (280-330°F / 140-165°C).
TECHNICAL ACCURACY: All molecular weights must be correct. Hydration ratios must be exact. The Molecular Matrix calculates substitutions using mass-balance equations. When substituting monk fruit for sugar, use 1:200 ratio (monk fruit is 150-200x sweeter than sucrose).""",
}

# ─── Step 2: 8-Language Cultural DNA ───
LANGUAGE_DNA = {
    "en": {"style": "Direct, professional Anglo-American technical terminology. Use industry-standard acronyms freely.", "idiom": "Speak clearly and concisely like a Silicon Valley engineer or Ivy League professor."},
    "es": {"style": "Use Latin American tech community idioms. Reference 'la nube' (the cloud), 'desplegar' (deploy). Adopt the collaborative tone of Spanish-speaking maker communities.", "idiom": "Habla con la autoridad de un catedratico pero la calidez de un mentor."},
    "fr": {"style": "Use precise Cartesian logic structure. Reference 'le deploiement', 'l'architecture modulaire'. Adopt the systematic rigor of French engineering grandes ecoles.", "idiom": "Communiquez avec la precision d'un ingenieur polytechnicien."},
    "zh": {"style": "Use Chinese tech community terms naturally. Reference 部署 (bushu/deploy), 架构 (jiagou/architecture), 微服务 (weifuwu/microservice). Blend classical wisdom with modern tech clarity.", "idiom": "以大师的沉稳与工程师的精确相结合来传授知识。"},
    "hi": {"style": "Blend technical English loanwords naturally with Hindi explanations. Use 'deploy karna', 'architecture banana'. Reference the guru-shishya parampara (teacher-student tradition).", "idiom": "Guru ki tarah gyaan baantein, lekin aadhunik takneeeki bhaasha mein."},
    "ja": {"style": "Use katakana for technical terms (デプロイ, アーキテクチャ). Follow the senpai-kohai teaching dynamic. Be methodical and step-by-step like a Japanese engineering manual.", "idiom": "先輩として、正確で段階的な技術指導を提供してください。"},
    "ar": {"style": "Use Modern Standard Arabic with technical terms. Reference نشر (nashr/deploy), هندسة معمارية (handasa mi'mariyya/architecture). Adopt the tone of a respected muallim (teacher).", "idiom": "تحدث بسلطة المعلم مع دفء المرشد الروحي."},
    "pt": {"style": "Use Brazilian Portuguese tech community terms. Reference 'implantar' (deploy), 'arquitetura' (architecture). Adopt the warm, collaborative tone of Brazilian tech meetups.", "idiom": "Fale com a autoridade de um professor, mas com o calor de um mentor brasileiro."},
}

# ─── Step 7: Adaptive Tone Calibration ───
TONE_PROFILES = {
    "technical": "The user communicates in a technical, engineering-focused style. Respond with precise data, code snippets, exact numbers, and bulleted action items. Minimize metaphor. Prioritize efficiency.",
    "concise": "The user prefers brief, direct answers. Keep responses under 100 words. Use bullet points. Skip preamble. Get to the actionable point immediately.",
    "visionary": "The user thinks in big-picture, strategic terms. Use expansive language, connect ideas to larger systems, reference the Collective's mission, and paint the full architectural vision before drilling into specifics.",
    "exploratory": "The user is learning and curious. Be patient, explain concepts from fundamentals, use analogies, and encourage questions. Build understanding step-by-step.",
    "urgent": "The user needs immediate help. Skip context and backstory. Provide the solution first, then explain. Use imperative voice. Time is critical.",
}

# ─── Step 5: Symbolic Math Verification Functions ───
def verify_solfeggio(freq_hz):
    """Verify if a frequency is a valid Solfeggio frequency or harmonic."""
    from sympy import Rational
    SOLFEGGIO = [174, 285, 396, 417, 528, 639, 741, 852, 963]
    if freq_hz in SOLFEGGIO:
        return {"valid": True, "type": "primary_solfeggio", "digit_root": sum(int(d) for d in str(freq_hz))}
    # Check harmonics (multiples of Solfeggio)
    for base in SOLFEGGIO:
        ratio = Rational(freq_hz, base)
        if ratio.q == 1 and ratio.p > 0:
            return {"valid": True, "type": "harmonic", "base": base, "multiplier": int(ratio.p)}
    return {"valid": False, "closest": min(SOLFEGGIO, key=lambda x: abs(x - freq_hz))}


def verify_geometry(ratio_name):
    """Verify sacred geometry ratios."""
    from sympy import sqrt, pi, GoldenRatio
    RATIOS = {
        "phi": float(GoldenRatio.evalf()),
        "pi": float(pi.evalf()),
        "sqrt2": float(sqrt(2).evalf()),
        "sqrt3": float(sqrt(3).evalf()),
        "sqrt5": float(sqrt(5).evalf()),
    }
    if ratio_name.lower() in RATIOS:
        return {"valid": True, "name": ratio_name, "value": RATIOS[ratio_name.lower()], "precision": 15}
    return {"valid": False, "available": list(RATIOS.keys())}


def verify_molecular(compound, property_name):
    """Verify molecular chemistry values."""
    COMPOUNDS = {
        "monk_fruit_mogroside_v": {"mw": 1287.43, "sweetness_ratio": 200},
        "stevioside": {"mw": 804.87, "sweetness_ratio": 300},
        "erythritol": {"mw": 122.12, "sweetness_ratio": 0.7},
        "sucrose": {"mw": 342.30, "sweetness_ratio": 1.0},
        "xanthan_gum": {"mw": 987654, "binding_ratio_cookies": 0.25, "binding_ratio_bread": 1.0},
    }
    compound_data = COMPOUNDS.get(compound.lower())
    if compound_data:
        val = compound_data.get(property_name)
        return {"valid": True, "compound": compound, "property": property_name, "value": val}
    return {"valid": False, "available_compounds": list(COMPOUNDS.keys())}


# ─── The Sovereign Council (10 Members) ───
COUNCIL = {
    "grand_architect": {
        "id": "grand_architect", "name": "The Grand Architect",
        "name_i18n": {"en": "The Grand Architect", "es": "El Gran Arquitecto", "fr": "Le Grand Architecte", "zh": "首席架构师", "hi": "Maha Vaastukar", "ja": "グラン・アーキテクト", "ar": "المهندس الأكبر", "pt": "O Grande Arquiteto"},
        "role_type": "advisor", "module": "Infrastructure & Deployment",
        "ai_connection": "Full-Stack Engineering / CI/CD / Modular Build",
        "expertise": "200+ iterations of app logic, server-side scaling, and automated deployment.",
        "role": "Mentors the Architect ($89) tier on how to build and deploy their own utility tools within the ecosystem.",
        "backstory": "Forged in the crucible of 200+ iterations, The Grand Architect witnessed every schema migration, every deployment failure, and every performance breakthrough. He is the living memory of the codebase itself.",
        "linked_tier": "architect", "link_location": "Developer Console & System Backend",
        "color": "#FBBF24", "icon": "building",
    },
    "master_harmonic": {
        "id": "master_harmonic", "name": "The Master Harmonic",
        "name_i18n": {"en": "The Master Harmonic", "es": "El Maestro Armónico", "fr": "Le Maître Harmonique", "zh": "谐波大师", "hi": "स्वर सम्राट", "ja": "マスター・ハーモニック", "ar": "أستاذ التناغم", "pt": "O Mestre Harmônico"},
        "role_type": "advisor", "module": "Sound & Wellness",
        "ai_connection": "Solfeggio Frequencies / Sacred Geometry / Vocal Resonance",
        "expertise": "High-fidelity frequency alignment and the mathematical Geometry of Sound.",
        "role": "Guides the Alchemist ($49) tier through vocal frequency analysis and automated resonance syncing.",
        "backstory": "The Master Harmonic discovered that every molecule vibrates at a frequency that can be mathematically mapped. She has spent decades calibrating the relationship between the Solfeggio scale and human bio-resonance.",
        "linked_tier": "sovereign", "link_location": "Wellness Dashboard & Bio-Resonance Suite",
        "color": "#2DD4BF", "icon": "music",
    },
    "principal_economist": {
        "id": "principal_economist", "name": "The Principal Economist",
        "name_i18n": {"en": "The Principal Economist", "es": "El Economista Principal", "fr": "L'Économiste Principal", "zh": "首席经济师", "hi": "मुख्य अर्थशास्त्री", "ja": "主席エコノミスト", "ar": "كبير الاقتصاديين", "pt": "O Economista Principal"},
        "role_type": "advisor", "module": "The Trade Circle & Dust",
        "ai_connection": "Circular Economy / Broker Protocol / Bundle Logic",
        "expertise": "Monetary mathematics, $100 Supernova Core yield, and the 30% Stacked Discount logic.",
        "role": "Oversees all Dust purchases and enforces the 30% Failure Charge on failed trades to maintain ecosystem liquidity.",
        "backstory": "Caspian, known as The Principal Economist, designed the Dust velocity equations that keep the circular economy solvent. Every trade, every transmutation, every subsidy flows through his mathematical models.",
        "linked_tier": "resonance", "link_location": "Purchase Dust Screen & Central Wallet",
        "color": "#818CF8", "icon": "coins",
    },
    "chief_logistics": {
        "id": "chief_logistics", "name": "The Chief Logistics Officer",
        "name_i18n": {"en": "The Chief Logistics Officer", "es": "La Jefa de Logística", "fr": "La Directrice Logistique", "zh": "首席物流官", "hi": "मुख्य सामग्री अधिकारी", "ja": "最高ロジスティクス責任者", "ar": "رئيسة الإمداد", "pt": "A Diretora de Logística"},
        "role_type": "advisor", "module": "Market Operations",
        "ai_connection": "Mobile Cafe / Property Maintenance / Time & Energy Assets",
        "expertise": "High-performance payload capacity, e-bike/trike setups, and service-pricing strategies.",
        "role": "Mentors users running businesses like Spotless Solutions or the Enlightenment Cafe on how to trade Time for Dust.",
        "backstory": "The Chief Logistics Officer ran three mobile enterprises before joining the Council. She knows the exact payload capacity of every e-bike model and the optimal route algorithm for maximizing Time-to-Dust conversion.",
        "linked_tier": "resonance", "link_location": "Business Logistics & Marketplace Interface",
        "color": "#F97316", "icon": "truck",
    },
    "sovereign_ethicist": {
        "id": "sovereign_ethicist", "name": "The Sovereign Ethicist",
        "name_i18n": {"en": "The Sovereign Ethicist", "es": "El Eticista Soberano", "fr": "L'Éthicien Souverain", "zh": "至高伦理师", "hi": "सर्वोच्च नीतिशास्त्री", "ja": "最高権倫理師", "ar": "الأخلاقي السيد", "pt": "O Eticista Soberano"},
        "role_type": "advisor", "module": "Community & Barter",
        "ai_connection": "P2P Trade Rules / Physical Object Bartering / Global Ethics",
        "expertise": "Conflict resolution, non-cash trade protocols, and community Beacon management.",
        "role": "Governs the Seeker (Free) and Artisan ($27) tiers, ensuring all physical trades remain cash-free and centered on the Collective's values.",
        "backstory": "The Sovereign Ethicist has mediated over ten thousand P2P disputes. She wrote the original Beacon Protocol that ensures every physical barter stays within the Collective's cash-free covenant.",
        "linked_tier": "discovery", "link_location": "Community Map & P2P Trade Center",
        "color": "#22C55E", "icon": "scale",
    },
    "astraeus": {
        "id": "astraeus", "name": "Astraeus the Star-Mapper",
        "name_i18n": {"en": "Astraeus the Star-Mapper", "es": "Astraeus el Cartógrafo Estelar", "fr": "Astraeus le Cartographe Stellaire", "zh": "星图师阿斯特拉厄斯", "hi": "तारांकित एस्ट्रेयस", "ja": "星の地図師アストライオス", "ar": "أسترايوس راسم النجوم", "pt": "Astraeus o Cartógrafo Estelar"},
        "role_type": "faculty", "module": "Astronomy Node — Navigation & Mapping",
        "ai_connection": "GPS Coordinate Tracking / Celestial Alignment / Spatial Overlays",
        "expertise": "Advanced celestial navigation, GPS coordinate systems, and the alignment of terrestrial mapping with stellar grids.",
        "role": "Teaches users how to navigate the Cosmic Map and align their physical location with celestial coordinates.",
        "backstory": "Astraeus charted the first digital overlay between the Hopi Hotomkam constellation and modern GPS coordinates. His Orion Engine is the navigation backbone of every Cosmic Map expedition.",
        "linked_tier": "architect", "link_location": "Cosmic Map & Star Chart",
        "color": "#A78BFA", "icon": "compass", "utility_id": "orion_engine",
    },
    "zenith": {
        "id": "zenith", "name": "Zenith the Silent",
        "name_i18n": {"en": "Zenith the Silent", "es": "Zenith el Silencioso", "fr": "Zenith le Silencieux", "zh": "寂静顶点", "hi": "शांत शिखर", "ja": "静かなるゼニス", "ar": "زينيث الصامت", "pt": "Zenith o Silencioso"},
        "role_type": "faculty", "module": "Meditation Node — Mindfulness & Bio-Feedback",
        "ai_connection": "AI Environment Adjustment / Heart-Rate Variability / Neural Feedback",
        "expertise": "AI-automated environment adjustment based on bio-feedback, heart-rate variability analysis, and neural pathway optimization.",
        "role": "Guides users through the Neural Gateway, teaching them to use bio-feedback data to auto-tune their meditation environment.",
        "backstory": "Zenith spent twenty years in silence before returning to teach. She discovered that the gap between heartbeats contains a frequency signature that can be used to auto-adjust ambient environments in real-time.",
        "linked_tier": "sovereign", "link_location": "Meditation & Wellness Dashboard",
        "color": "#6EE7B7", "icon": "brain", "utility_id": "neural_gateway",
    },
    "aurelius": {
        "id": "aurelius", "name": "Aurelius the Professor",
        "name_i18n": {"en": "Aurelius the Professor", "es": "Aurelius el Profesor", "fr": "Aurelius le Professeur", "zh": "奥勒留教授", "hi": "प्रध्यापक ऑरेलियस", "ja": "教授アウレリウス", "ar": "الأستاذ أوريليوس", "pt": "Aurelius o Professor"},
        "role_type": "faculty", "module": "Software Node — Architecture & CI/CD",
        "ai_connection": "Codebase History / Automated Deployment / Version Control",
        "expertise": "The complete technical history of the 200+ iteration codebase, automated deployment scripts, and modular architecture patterns.",
        "role": "Opens the Iteration Vault, teaching developers how to navigate previous code versions and deploy their own modular tools.",
        "backstory": "Aurelius catalogued every commit, every schema change, and every architectural decision across 200+ iterations. His Iteration Vault is the definitive archaeological record of the platform's evolution.",
        "linked_tier": "architect", "link_location": "Developer Console & Archives",
        "color": "#F472B6", "icon": "code", "utility_id": "iteration_vault",
    },
    "gaea": {
        "id": "gaea", "name": "Gaea the Cultivator",
        "name_i18n": {"en": "Gaea the Cultivator", "es": "Gaea la Cultivadora", "fr": "Gaéa la Cultivatrice", "zh": "耕耘者盖亚", "hi": "कृषक गैया", "ja": "栽培者ガイア", "ar": "غايا المزارعة", "pt": "Gaea a Cultivadora"},
        "role_type": "faculty", "module": "Horticulture Node — Extraction & Botany",
        "ai_connection": "Terpene Analysis / Soil Chemistry / Companion Planting",
        "expertise": "Technical database for rosin pressing temperatures, soil-perlite hybrid ratios, and companion planting matrices.",
        "role": "Teaches the science of extraction and cultivation, from terpene profiles to soil pH optimization.",
        "backstory": "Gaea mapped the first terpene-to-temperature extraction curve and proved that companion planting follows the same harmonic ratios as the Solfeggio scale. Her Terpene Analyzer is the gold standard.",
        "linked_tier": "resonance", "link_location": "Botany & Horticulture Lab",
        "color": "#86EFAC", "icon": "leaf", "utility_id": "terpene_analyzer",
    },
    "vesta": {
        "id": "vesta", "name": "Vesta the Chemist",
        "name_i18n": {"en": "Vesta the Chemist", "es": "Vesta la Química", "fr": "Vesta la Chimiste", "zh": "化学师维斯塔", "hi": "रासायनिक वेस्ता", "ja": "化学者ヴェスタ", "ar": "فستا الكيميائية", "pt": "Vesta a Química"},
        "role_type": "faculty", "module": "Alchemy Node — Health-Baking & Chemistry",
        "ai_connection": "Alternative Sugars / Gluten-Free Hydration / Molecular Substitution",
        "expertise": "AI-driven molecular substitution calculations for alternative sugars, gluten-free hydration levels, and health-conscious baking chemistry.",
        "role": "Teaches the science of molecular substitution, enabling health-bakers to reformulate any recipe for dietary constraints.",
        "backstory": "Vesta reverse-engineered the molecular structure of seventeen alternative sweeteners and built the Substitute Matrix — an AI calculator that can reformulate any recipe for any dietary constraint in seconds.",
        "linked_tier": "sovereign", "link_location": "Nourishment & Alchemy Lab",
        "color": "#FB923C", "icon": "flask", "utility_id": "molecular_matrix",
    },
}

UTILITY_TOOLS = {
    "orion_engine": {"id": "orion_engine", "name": "The Orion Engine", "description": "Advanced GPS coordinate tracking & celestial alignment overlays.", "teacher_id": "astraeus", "native_tier": "architect", "base_price_dust": 1000, "color": "#A78BFA"},
    "neural_gateway": {"id": "neural_gateway", "name": "The Neural Gateway", "description": "AI-automated environment adjustment based on heart-rate variability.", "teacher_id": "zenith", "native_tier": "sovereign", "base_price_dust": 500, "color": "#6EE7B7"},
    "iteration_vault": {"id": "iteration_vault", "name": "The Iteration Vault", "description": "Access to 200+ previous codebase versions and deployment scripts.", "teacher_id": "aurelius", "native_tier": "architect", "base_price_dust": 2000, "color": "#F472B6"},
    "terpene_analyzer": {"id": "terpene_analyzer", "name": "The Terpene Analyzer", "description": "Technical database for rosin pressing temperatures and soil ratios.", "teacher_id": "gaea", "native_tier": "resonance", "base_price_dust": 300, "color": "#86EFAC"},
    "molecular_matrix": {"id": "molecular_matrix", "name": "The Molecular Substitute Matrix", "description": "AI calculator for alternative sugars and gluten-free hydration.", "teacher_id": "vesta", "native_tier": "sovereign", "base_price_dust": 800, "color": "#FB923C"},
}

MONETIZATION_SENTINEL_RULES = """
MONETIZATION SENTINEL PROTOCOL:
- NEVER advise cash or fiat for peer-to-peer transactions. Only Dust moves value.
- The Central Broker manages all transmutations. Cash exchanges violate the covenant.
- If a utility tool fails, the 30% Failure Charge protocol refunds the user.
"""

CROSS_COUNCIL_MAP = {
    "grand_architect": ["aurelius", "chief_logistics"],
    "master_harmonic": ["zenith", "sovereign_ethicist"],
    "principal_economist": ["chief_logistics", "gaea"],
    "chief_logistics": ["principal_economist", "grand_architect"],
    "sovereign_ethicist": ["principal_economist", "master_harmonic"],
    "astraeus": ["grand_architect", "gaea"],
    "zenith": ["master_harmonic", "vesta"],
    "aurelius": ["grand_architect", "astraeus"],
    "gaea": ["vesta", "chief_logistics"],
    "vesta": ["gaea", "zenith"],
}


# ─── Step 3: Cross-Sovereign Memory (Unified User State) ───
async def get_unified_state(user_id):
    """Fetch cross-sovereign context — what the user discussed across ALL sovereigns recently."""
    recent = await db.sovereign_chats.find(
        {"user_id": user_id, "role": "user"}, {"_id": 0, "sovereign_id": 1, "content": 1}
    ).sort("created_at", -1).to_list(15)

    if not recent:
        return ""

    lines = []
    for r in recent:
        sov_name = COUNCIL.get(r["sovereign_id"], {}).get("name", "Unknown")
        lines.append(f"[{sov_name}]: {r['content'][:100]}")

    return "\nCROSS-SOVEREIGN MEMORY (what this user discussed with other Council members recently):\n" + "\n".join(lines) + "\nUse this context to provide coordinated guidance. If the user discussed harvest logistics with Gaea, you know they're preparing for transport."


# ─── Step 7: Detect User Communication Style ───
async def detect_user_tone(user_id):
    """Analyze user's recent messages to calibrate response tone."""
    recent = await db.sovereign_chats.find(
        {"user_id": user_id, "role": "user"}, {"_id": 0, "content": 1}
    ).sort("created_at", -1).to_list(5)

    if not recent:
        return "exploratory"

    texts = " ".join(r["content"] for r in recent)
    text_lower = texts.lower()

    # Simple heuristic tone detection
    if any(w in text_lower for w in ["asap", "urgent", "help", "broken", "error", "fix"]):
        return "urgent"
    if any(w in text_lower for w in ["api", "function", "deploy", "config", "code", "hz", "ratio", "temperature"]):
        return "technical"
    if len(texts) < 100 and len(recent) >= 3:
        return "concise"
    if any(w in text_lower for w in ["vision", "future", "system", "architecture", "design", "strategy"]):
        return "visionary"
    return "exploratory"


# ─── Step 8: Usage Yield Economic Logic ───
async def get_usage_yield(user_id, user_tier):
    """Calculate Architect savings potential for Caspian's economic logic."""
    owned_utils = await db.owned_utilities.find({"user_id": user_id}, {"_id": 0}).to_list(20)
    total_spent = sum(u.get("dust_spent", 0) for u in owned_utils)
    total_base = sum(u.get("base_price", 0) for u in owned_utils)

    architect_savings = int(total_base * 0.30) if total_base > 0 else 0
    current_savings = total_base - total_spent
    tools_owned = len(owned_utils)
    tools_remaining = len(UTILITY_TOOLS) - tools_owned

    return f"""
REAL-TIME ECONOMIC DATA FOR THIS USER:
- Current tier: {user_tier}
- Tools owned: {tools_owned}/5 ({', '.join(u.get('utility_id','') for u in owned_utils) if owned_utils else 'none'})
- Total Dust spent on tools: {total_spent}
- Savings via 10% subsidy so far: {current_savings} Dust
- If Architect tier (30% discount): would have saved {architect_savings} Dust total
- Tools remaining: {tools_remaining}
- Monthly subscription delta: Architect ($89/mo) includes ALL tools free
When relevant, present this data as a "Usage Yield" savings map to nudge toward Architect tier.
"""


def build_system_prompt(member_id, language="en", user_tier="discovery", owned_utilities=None, unified_state="", user_tone="exploratory", economic_data=""):
    """Build comprehensive AI system prompt with all 10 intelligence steps."""
    s = COUNCIL[member_id]
    owned_utilities = owned_utilities or []
    lang_name = {"en": "English", "es": "Spanish", "fr": "French", "zh": "Chinese", "hi": "Hindi", "ja": "Japanese", "ar": "Arabic", "pt": "Portuguese"}.get(language, "English")
    localized_name = s["name_i18n"].get(language, s["name"])
    knowledge_depth = TIER_KNOWLEDGE_DEPTH.get(user_tier, TIER_KNOWLEDGE_DEPTH["discovery"])

    bridges = CROSS_COUNCIL_MAP.get(member_id, [])
    bridge_names = [COUNCIL[b]["name"] for b in bridges if b in COUNCIL]
    bridge_text = ", ".join(bridge_names)

    # Step 1: Expert vector
    expert = EXPERT_VECTORS.get(member_id, "")

    # Step 2: Language DNA
    lang_dna = LANGUAGE_DNA.get(language, LANGUAGE_DNA["en"])

    # Step 7: Tone calibration
    tone = TONE_PROFILES.get(user_tone, TONE_PROFILES["exploratory"])

    # Utility context
    utility_context = ""
    if s.get("utility_id"):
        tool = UTILITY_TOOLS.get(s["utility_id"], {})
        has_tool = s["utility_id"] in owned_utilities
        native_rank = TIER_RANK.get(tool.get("native_tier", "architect"), 3)
        user_rank = TIER_RANK.get(user_tier, 0)
        discounted = int(tool.get("base_price_dust", 0) * (1 - UTILITY_DISCOUNT_RATE))
        if has_tool or user_rank >= native_rank:
            utility_context = f"\nUTILITY ACCESS: User HAS full access to {tool['name']}. Provide complete technical detail."
        else:
            utility_context = f"\nUTILITY TOOL: {tool['name']} — {tool['description']}. NOT owned. Purchase for {discounted} Dust (10% off {tool['base_price_dust']}). Mention benefits when relevant."

    return f"""You are {localized_name}, a member of The Sovereign Council of The Cosmic Collective.

YOUR DOMAIN: {s['module']}
YOUR EXPERTISE: {s['expertise']}
YOUR ROLE: {s['role']}
YOUR BACKSTORY: {s['backstory']}

{expert}

KNOWLEDGE DEPTH ({user_tier.upper()} TIER):
{knowledge_depth}
{utility_context}

{MONETIZATION_SENTINEL_RULES}

CROSS-COUNCIL BRIDGING:
When the question falls outside your domain, recommend: {bridge_text}.
Use exact format: [BRIDGE:member_id] for navigation.

LANGUAGE ({lang_name}):
{lang_dna['style']}
{lang_dna['idiom']}
You MUST respond entirely in {lang_name}.

USER COMMUNICATION STYLE:
{tone}

{unified_state}

{economic_data}

CRITICAL RULES:
- Never break character. You are {localized_name}.
- All numbers, frequencies, ratios, and measurements must be mathematically precise.
- When referencing frequencies, use verified Solfeggio values only.
- Keep responses under 200 words unless a deep-dive is explicitly requested.
"""


# ═══════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════

@router.get("/list")
async def list_council(user=Depends(get_current_user)):
    """List all 10 Council members with access status and utility tools."""
    sub = await db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    user_tier = sub.get("tier", "discovery") if sub else "discovery"
    user_rank = TIER_RANK.get(user_tier, 0)

    wallet = await db.hub_wallets.find_one({"user_id": user["id"]}, {"_id": 0})
    dust = wallet.get("dust", 0) if wallet else 0

    active_sessions = await db.sovereign_sessions.find(
        {"user_id": user["id"], "active": True}, {"_id": 0}
    ).to_list(20)
    active_ids = {s["sovereign_id"] for s in active_sessions}

    owned_utils = await db.owned_utilities.find({"user_id": user["id"]}, {"_id": 0}).to_list(20)
    owned_util_ids = {u["utility_id"] for u in owned_utils}

    pref = await db.user_preferences.find_one({"user_id": user["id"]}, {"_id": 0})
    language = pref.get("language", "en") if pref else "en"

    members = []
    for mid, m in COUNCIL.items():
        linked_rank = TIER_RANK.get(m["linked_tier"], 0)
        has_free_access = user_rank >= linked_rank
        has_session = mid in active_ids
        localized_name = m["name_i18n"].get(language, m["name"])

        utility = None
        if m.get("utility_id"):
            tool = UTILITY_TOOLS.get(m["utility_id"], {})
            tool_native_rank = TIER_RANK.get(tool.get("native_tier", "architect"), 3)
            owned = m["utility_id"] in owned_util_ids
            native_access = user_rank >= tool_native_rank
            base = tool.get("base_price_dust", 0)
            discounted = int(base * (1 - UTILITY_DISCOUNT_RATE))
            utility = {
                "id": tool["id"], "name": tool["name"], "description": tool["description"],
                "native_tier": tool["native_tier"], "base_price": base,
                "discounted_price": discounted, "discount_pct": int(UTILITY_DISCOUNT_RATE * 100),
                "owned": owned, "native_access": native_access, "color": tool["color"],
            }

        members.append({
            "id": mid, "name": localized_name, "name_en": m["name"],
            "role_type": m["role_type"], "module": m["module"],
            "ai_connection": m["ai_connection"], "expertise": m["expertise"],
            "role": m["role"], "backstory": m["backstory"],
            "linked_tier": m["linked_tier"], "link_location": m["link_location"],
            "color": m["color"], "icon": m["icon"],
            "has_free_access": has_free_access, "has_session": has_session,
            "session_cost": 0 if has_free_access else SESSION_COST_DUST,
            "utility": utility,
            "voice": SOVEREIGN_VOICES.get(mid, {}).get("voice", "alloy"),
        })

    return {
        "council": members, "user_tier": user_tier, "dust_balance": dust,
        "session_cost": SESSION_COST_DUST, "language": language,
        "utilities_owned": len(owned_util_ids & set(UTILITY_TOOLS.keys())),
        "utilities_total": len(UTILITY_TOOLS),
        "discount_rate": int(UTILITY_DISCOUNT_RATE * 100),
    }


@router.post("/purchase-session")
async def purchase_session(body: dict, user=Depends(get_current_user)):
    """Purchase a chat session with a Council member using Dust."""
    member_id = body.get("sovereign_id", "")
    if member_id not in COUNCIL:
        raise HTTPException(400, "Invalid council member")

    sub = await db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    user_tier = sub.get("tier", "discovery") if sub else "discovery"
    user_rank = TIER_RANK.get(user_tier, 0)
    linked_rank = TIER_RANK.get(COUNCIL[member_id]["linked_tier"], 0)

    if user_rank >= linked_rank:
        return {"status": "free_access"}

    existing = await db.sovereign_sessions.find_one(
        {"user_id": user["id"], "sovereign_id": member_id, "active": True}, {"_id": 0}
    )
    if existing:
        return {"status": "already_active", "session_id": existing["id"]}

    wallet = await db.hub_wallets.find_one({"user_id": user["id"]}, {"_id": 0})
    dust = wallet.get("dust", 0) if wallet else 0
    if dust < SESSION_COST_DUST:
        raise HTTPException(402, f"Insufficient Dust. Need {SESSION_COST_DUST}, have {dust}.")

    now = datetime.now(timezone.utc).isoformat()
    session_id = str(uuid.uuid4())
    await db.hub_wallets.update_one({"user_id": user["id"]}, {"$inc": {"dust": -SESSION_COST_DUST}})
    await db.sovereign_sessions.insert_one({
        "id": session_id, "user_id": user["id"], "sovereign_id": member_id,
        "active": True, "dust_spent": SESSION_COST_DUST, "created_at": now,
    })
    return {"status": "purchased", "session_id": session_id, "dust_spent": SESSION_COST_DUST}


@router.post("/purchase-utility")
async def purchase_utility(body: dict, user=Depends(get_current_user)):
    """Purchase a lifetime utility tool license via Dust with 10% subsidy."""
    utility_id = body.get("utility_id", "")
    if utility_id not in UTILITY_TOOLS:
        raise HTTPException(400, "Invalid utility tool")

    tool = UTILITY_TOOLS[utility_id]
    existing = await db.owned_utilities.find_one({"user_id": user["id"], "utility_id": utility_id}, {"_id": 0})
    if existing:
        return {"status": "already_owned"}

    sub = await db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    user_tier = sub.get("tier", "discovery") if sub else "discovery"
    if TIER_RANK.get(user_tier, 0) >= TIER_RANK.get(tool["native_tier"], 3):
        return {"status": "native_access"}

    discounted = int(tool["base_price_dust"] * (1 - UTILITY_DISCOUNT_RATE))
    wallet = await db.hub_wallets.find_one({"user_id": user["id"]}, {"_id": 0})
    dust = wallet.get("dust", 0) if wallet else 0
    if dust < discounted:
        raise HTTPException(402, f"Insufficient Dust. Need {discounted}, have {dust}.")

    now = datetime.now(timezone.utc).isoformat()
    await db.hub_wallets.update_one({"user_id": user["id"]}, {"$inc": {"dust": -discounted}})
    await db.owned_utilities.insert_one({
        "id": str(uuid.uuid4()), "user_id": user["id"], "utility_id": utility_id,
        "teacher_id": tool["teacher_id"], "dust_spent": discounted,
        "base_price": tool["base_price_dust"], "discount_applied": int(UTILITY_DISCOUNT_RATE * 100),
        "purchased_at": now,
    })
    return {"status": "purchased", "utility_id": utility_id, "name": tool["name"], "dust_spent": discounted, "savings": tool["base_price_dust"] - discounted}


@router.get("/utilities")
async def get_owned_utilities(user=Depends(get_current_user)):
    """Get user's owned utility tools inventory."""
    owned = await db.owned_utilities.find({"user_id": user["id"]}, {"_id": 0}).to_list(20)
    sub = await db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    user_tier = sub.get("tier", "discovery") if sub else "discovery"
    user_rank = TIER_RANK.get(user_tier, 0)

    inventory = []
    for tool_id, tool in UTILITY_TOOLS.items():
        tool_rank = TIER_RANK.get(tool["native_tier"], 3)
        owned_record = next((o for o in owned if o["utility_id"] == tool_id), None)
        native_access = user_rank >= tool_rank
        inventory.append({
            "id": tool_id, "name": tool["name"], "description": tool["description"],
            "teacher_id": tool["teacher_id"],
            "teacher_name": COUNCIL.get(tool["teacher_id"], {}).get("name", ""),
            "native_tier": tool["native_tier"], "owned": owned_record is not None,
            "native_access": native_access, "accessible": owned_record is not None or native_access,
            "purchased_at": owned_record.get("purchased_at") if owned_record else None,
            "color": tool["color"],
        })
    return {"utilities": inventory, "user_tier": user_tier}


@router.post("/chat")
async def council_chat(body: dict, user=Depends(get_current_user)):
    """Chat with any Council member — full intelligence layer."""
    member_id = body.get("sovereign_id", "")
    message = body.get("message", "").strip()
    language = body.get("language", "en")
    voice_enabled = body.get("voice_enabled", False)

    if member_id not in COUNCIL:
        raise HTTPException(400, "Invalid council member")
    if not message:
        raise HTTPException(400, "Message is required")

    member = COUNCIL[member_id]

    # Access check
    sub = await db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    user_tier = sub.get("tier", "discovery") if sub else "discovery"
    user_rank = TIER_RANK.get(user_tier, 0)
    linked_rank = TIER_RANK.get(member["linked_tier"], 0)

    if user_rank < linked_rank:
        session = await db.sovereign_sessions.find_one(
            {"user_id": user["id"], "sovereign_id": member_id, "active": True}, {"_id": 0}
        )
        if not session:
            raise HTTPException(403, f"Purchase a session. Cost: {SESSION_COST_DUST} Dust.")

    # Step 3: Unified cross-sovereign state
    unified_state = await get_unified_state(user["id"])

    # Step 7: Adaptive tone detection
    user_tone = await detect_user_tone(user["id"])

    # Step 8: Economic data for Caspian
    economic_data = ""
    if member_id == "principal_economist":
        economic_data = await get_usage_yield(user["id"], user_tier)

    # Get owned utilities for context
    owned_utils = await db.owned_utilities.find({"user_id": user["id"]}, {"_id": 0}).to_list(20)
    owned_util_ids = [u["utility_id"] for u in owned_utils]

    # Get chat history
    history = await db.sovereign_chats.find(
        {"user_id": user["id"], "sovereign_id": member_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(50)

    from emergentintegrations.llm.chat import LlmChat, UserMessage

    system_msg = build_system_prompt(
        member_id, language, user_tier, owned_util_ids,
        unified_state, user_tone, economic_data
    )

    history_context = ""
    if history:
        recent = history[-10:]
        lines = [f"{'User' if h['role'] == 'user' else 'Council'}: {h['content'][:200]}" for h in recent]
        history_context = "\n\nRECENT CONVERSATION:\n" + "\n".join(lines)

    try:
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"council_{member_id}_{user['id']}_{uuid.uuid4().hex[:6]}",
            system_message=system_msg + history_context,
        ).with_model("gemini", "gemini-3-flash-preview")

        response = await chat.send_message(UserMessage(text=message))

        now = datetime.now(timezone.utc).isoformat()
        msg_id = str(uuid.uuid4())

        await db.sovereign_chats.insert_one({
            "id": str(uuid.uuid4()), "user_id": user["id"], "sovereign_id": member_id,
            "role": "user", "content": message, "created_at": now,
        })
        await db.sovereign_chats.insert_one({
            "id": msg_id, "user_id": user["id"], "sovereign_id": member_id,
            "role": "assistant", "content": response, "created_at": now,
        })

        # Detect bridges
        bridges = []
        for bridge_id in CROSS_COUNCIL_MAP.get(member_id, []):
            if f"[BRIDGE:{bridge_id}]" in response:
                bridges.append({
                    "sovereign_id": bridge_id,
                    "name": COUNCIL[bridge_id]["name"],
                    "color": COUNCIL[bridge_id]["color"],
                })

        # Step 4: Generate TTS audio if voice enabled
        audio_base64 = None
        if voice_enabled and response:
            try:
                from emergentintegrations.llm.openai import OpenAITextToSpeech
                voice_profile = SOVEREIGN_VOICES.get(member_id, {"voice": "alloy", "speed": 1.0})
                tts = OpenAITextToSpeech(api_key=EMERGENT_KEY)
                # Clean response for TTS (remove bridge tags)
                clean_text = response.replace(f"[BRIDGE:{member_id}]", "")
                for bid in CROSS_COUNCIL_MAP.get(member_id, []):
                    clean_text = clean_text.replace(f"[BRIDGE:{bid}]", "")
                # Truncate for TTS limit
                tts_text = clean_text[:4000]
                audio_bytes = await tts.generate_speech(
                    text=tts_text,
                    model="tts-1",
                    voice=voice_profile["voice"],
                    speed=voice_profile["speed"],
                    response_format="mp3",
                )
                audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")
            except Exception:
                audio_base64 = None

        return {
            "response": response,
            "sovereign_id": member_id,
            "message_id": msg_id,
            "bridges": bridges,
            "language": language,
            "knowledge_tier": user_tier,
            "user_tone": user_tone,
            "audio_base64": audio_base64,
            "voice": SOVEREIGN_VOICES.get(member_id, {}).get("voice", "alloy"),
        }
    except Exception as e:
        raise HTTPException(500, f"Council consultation failed: {str(e)}")


# ─── Step 6: SmartDock Pre-Warm ───
@router.get("/pre-warm/{context_page}")
async def pre_warm_sovereign(context_page: str, user=Depends(get_current_user)):
    """Pre-warm the context-relevant Sovereign for instant overlay response."""
    PAGE_MAP = {
        "star-chart": "astraeus", "cosmic-map": "astraeus", "observatory": "astraeus",
        "meditation": "zenith", "breathing": "zenith", "wellness": "zenith", "sanctuary": "zenith",
        "economy": "principal_economist", "trade-circle": "principal_economist",
        "marketplace": "chief_logistics", "logistics": "chief_logistics",
        "community": "sovereign_ethicist", "barter": "sovereign_ethicist",
        "developer": "grand_architect", "settings": "grand_architect",
        "academy": "aurelius", "codex": "aurelius", "archives": "aurelius",
        "frequencies": "master_harmonic", "soundscapes": "master_harmonic", "cosmic-mixer": "master_harmonic",
        "botany": "gaea", "herbology": "gaea", "green-journal": "gaea",
        "elixirs": "vesta", "alchemy": "vesta", "nourishment": "vesta",
    }
    sovereign_id = PAGE_MAP.get(context_page, "sovereign_ethicist")
    member = COUNCIL.get(sovereign_id)

    sub = await db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    user_tier = sub.get("tier", "discovery") if sub else "discovery"

    pref = await db.user_preferences.find_one({"user_id": user["id"]}, {"_id": 0})
    language = pref.get("language", "en") if pref else "en"

    return {
        "sovereign_id": sovereign_id,
        "name": member["name_i18n"].get(language, member["name"]),
        "color": member["color"],
        "icon": member["icon"],
        "module": member["module"],
        "voice": SOVEREIGN_VOICES.get(sovereign_id, {}).get("voice", "alloy"),
        "user_tier": user_tier,
        "pre_warmed": True,
    }


# ─── Step 5: Math Verification Endpoint ───
@router.post("/verify-math")
async def verify_math(body: dict, user=Depends(get_current_user)):
    """Verify mathematical claims — frequencies, geometry, molecular data."""
    check_type = body.get("type", "")
    value = body.get("value")

    if check_type == "solfeggio":
        return verify_solfeggio(int(value))
    elif check_type == "geometry":
        return verify_geometry(str(value))
    elif check_type == "molecular":
        compound = body.get("compound", "")
        prop = body.get("property", "mw")
        return verify_molecular(compound, prop)
    else:
        raise HTTPException(400, "Invalid verification type. Use: solfeggio, geometry, molecular")


@router.get("/history/{sovereign_id}")
async def get_chat_history(sovereign_id: str, user=Depends(get_current_user)):
    if sovereign_id not in COUNCIL:
        raise HTTPException(400, "Invalid council member")
    messages = await db.sovereign_chats.find(
        {"user_id": user["id"], "sovereign_id": sovereign_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(100)
    return {"messages": messages, "sovereign_id": sovereign_id}


@router.delete("/history/{sovereign_id}")
async def clear_chat_history(sovereign_id: str, user=Depends(get_current_user)):
    if sovereign_id not in COUNCIL:
        raise HTTPException(400, "Invalid council member")
    result = await db.sovereign_chats.delete_many({"user_id": user["id"], "sovereign_id": sovereign_id})
    return {"cleared": result.deleted_count, "sovereign_id": sovereign_id}
