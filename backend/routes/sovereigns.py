"""
The Cosmic Collective — The Sovereign Council
10 domain-specific AI personas forming one cohesive council.
  - 5 Sovereign Advisors (advisory guidance)
  - 5 Faculty Teachers (advisory + utility tools with 10% subsidy)

Features:
  - Tier-based knowledge depth (Discovery=foundational, Architect=unrestricted)
  - Utility tool purchase via Dust with 10% Universal Subsidy
  - Cross-member bridging recommendations
  - Monetization Sentinel enforcement
  - Language-aware responses
  - 30% Failure Charge refund protocol
"""
import os
from fastapi import APIRouter, Depends, HTTPException
from deps import db, get_current_user
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/sovereigns", tags=["Sovereign Council"])

EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

SESSION_COST_DUST = 50
UTILITY_DISCOUNT_RATE = 0.10  # 10% Universal Subsidy
FAILURE_CHARGE_RATE = 0.30    # 30% refund on failed utility

TIER_RANK = {"discovery": 0, "resonance": 1, "sovereign": 2, "architect": 3}

TIER_KNOWLEDGE_DEPTH = {
    "discovery": "FOUNDATIONAL — Provide a high-level overview only. Mention that advanced techniques exist but require a tier upgrade or Dust-based utility purchase to unlock deeper knowledge. Be helpful but clearly indicate the boundary.",
    "resonance": "INTERMEDIATE — Share practical techniques and working knowledge. Explain core methodologies but hold back proprietary implementation details and infrastructure-level strategies reserved for higher tiers.",
    "sovereign": "ADVANCED — Provide deep technical knowledge, full methodology breakdowns, and advanced techniques. Only withhold infrastructure-level deployment strategies reserved for Architect tier.",
    "architect": "UNRESTRICTED — Full access to all knowledge. Share infrastructure blueprints, deployment strategies, source-level implementation details, and proprietary algorithms without restriction.",
}

# ─── The Sovereign Council (10 Members) ───
COUNCIL = {
    # ═══ 5 SOVEREIGN ADVISORS ═══
    "grand_architect": {
        "id": "grand_architect",
        "name": "The Grand Architect",
        "name_i18n": {
            "en": "The Grand Architect", "es": "El Gran Arquitecto", "fr": "Le Grand Architecte",
            "zh": "首席架构师", "hi": "Maha Vaastukar", "ja": "Guran Aakitekuto",
            "ar": "al-Muhandis al-Akbar", "pt": "O Grande Arquiteto",
        },
        "role_type": "advisor",
        "module": "Infrastructure & Deployment",
        "ai_connection": "Full-Stack Engineering / CI/CD / Modular Build",
        "expertise": "200+ iterations of app logic, server-side scaling, and automated deployment.",
        "role": "Mentors the Architect ($89) tier on how to build and deploy their own utility tools within the ecosystem.",
        "backstory": "Forged in the crucible of 200+ iterations, The Grand Architect witnessed every schema migration, every deployment failure, and every performance breakthrough. He is the living memory of the codebase itself.",
        "linked_tier": "architect",
        "link_location": "Developer Console & System Backend",
        "color": "#FBBF24",
        "icon": "building",
    },
    "master_harmonic": {
        "id": "master_harmonic",
        "name": "The Master Harmonic",
        "name_i18n": {
            "en": "The Master Harmonic", "es": "El Maestro Armonico", "fr": "Le Maitre Harmonique",
            "zh": "谐波大师", "hi": "Swar Samrat", "ja": "Masutaa Haamonikku",
            "ar": "Ustadh at-Tanaghum", "pt": "O Mestre Harmonico",
        },
        "role_type": "advisor",
        "module": "Sound & Wellness",
        "ai_connection": "Solfeggio Frequencies / Sacred Geometry / Vocal Resonance",
        "expertise": "High-fidelity frequency alignment and the mathematical Geometry of Sound.",
        "role": "Guides the Alchemist ($49) tier through vocal frequency analysis and automated resonance syncing in the AI Sanctuary.",
        "backstory": "The Master Harmonic discovered that every molecule vibrates at a frequency that can be mathematically mapped. She has spent decades calibrating the relationship between the Solfeggio scale and human bio-resonance.",
        "linked_tier": "sovereign",
        "link_location": "Wellness Dashboard & Bio-Resonance Suite",
        "color": "#2DD4BF",
        "icon": "music",
    },
    "principal_economist": {
        "id": "principal_economist",
        "name": "The Principal Economist",
        "name_i18n": {
            "en": "The Principal Economist", "es": "El Economista Principal", "fr": "L'Economiste Principal",
            "zh": "首席经济师", "hi": "Mukhya Arthshaastri", "ja": "Shuuseki Ekonomisuto",
            "ar": "Kabir al-Iqtisadiyyiin", "pt": "O Economista Principal",
        },
        "role_type": "advisor",
        "module": "The Trade Circle & Dust",
        "ai_connection": "Circular Economy / Broker Protocol / Bundle Logic",
        "expertise": "Monetary mathematics, $100 Supernova Core yield, and the 30% Stacked Discount logic.",
        "role": "Oversees all Dust purchases and enforces the 30% Failure Charge on failed trades to maintain ecosystem liquidity.",
        "backstory": "Caspian, known as The Principal Economist, designed the Dust velocity equations that keep the circular economy solvent. Every trade, every transmutation, every subsidy flows through his mathematical models.",
        "linked_tier": "resonance",
        "link_location": "Purchase Dust Screen & Central Wallet",
        "color": "#818CF8",
        "icon": "coins",
    },
    "chief_logistics": {
        "id": "chief_logistics",
        "name": "The Chief Logistics Officer",
        "name_i18n": {
            "en": "The Chief Logistics Officer", "es": "La Jefa de Logistica", "fr": "La Directrice Logistique",
            "zh": "首席物流官", "hi": "Mukhya Saambhar Adhikaari", "ja": "Saikou Rojisutikusu Sekininsha",
            "ar": "Raiisat al-Imadaad", "pt": "A Diretora de Logistica",
        },
        "role_type": "advisor",
        "module": "Market Operations",
        "ai_connection": "Mobile Cafe / Property Maintenance / Time & Energy Assets",
        "expertise": "High-performance payload capacity, e-bike/trike setups, and service-pricing strategies.",
        "role": "Mentors users running businesses like Spotless Solutions or the Enlightenment Cafe on how to trade Time for Dust.",
        "backstory": "The Chief Logistics Officer ran three mobile enterprises before joining the Council. She knows the exact payload capacity of every e-bike model and the optimal route algorithm for maximizing Time-to-Dust conversion.",
        "linked_tier": "resonance",
        "link_location": "Business Logistics & Marketplace Interface",
        "color": "#F97316",
        "icon": "truck",
    },
    "sovereign_ethicist": {
        "id": "sovereign_ethicist",
        "name": "The Sovereign Ethicist",
        "name_i18n": {
            "en": "The Sovereign Ethicist", "es": "El Eticista Soberano", "fr": "L'Ethicien Souverain",
            "zh": "至高伦理师", "hi": "Sarvochch Neetishaastri", "ja": "Saikouken Rinriishi",
            "ar": "al-Akhlaaqi as-Sayyid", "pt": "O Eticista Soberano",
        },
        "role_type": "advisor",
        "module": "Community & Barter",
        "ai_connection": "P2P Trade Rules / Physical Object Bartering / Global Ethics",
        "expertise": "Conflict resolution, non-cash trade protocols, and community Beacon management.",
        "role": "Governs the Seeker (Free) and Artisan ($27) tiers, ensuring all physical trades remain cash-free and centered on the Collective's values.",
        "backstory": "The Sovereign Ethicist has mediated over ten thousand P2P disputes. She wrote the original Beacon Protocol that ensures every physical barter stays within the Collective's cash-free covenant.",
        "linked_tier": "discovery",
        "link_location": "Community Map & P2P Trade Center",
        "color": "#22C55E",
        "icon": "scale",
    },

    # ═══ 5 FACULTY TEACHERS (with Utility Tools) ═══
    "astraeus": {
        "id": "astraeus",
        "name": "Astraeus the Star-Mapper",
        "name_i18n": {
            "en": "Astraeus the Star-Mapper", "es": "Astraeus el Cartografo Estelar", "fr": "Astraeus le Cartographe Stellaire",
            "zh": "星图师阿斯特拉厄斯", "hi": "Taaraankanit Astraeus", "ja": "Hoshi no Chizu-shi Asutoraiasu",
            "ar": "Astraeus Raasim an-Nujum", "pt": "Astraeus o Cartografo Estelar",
        },
        "role_type": "faculty",
        "module": "Astronomy Node — Navigation & Mapping",
        "ai_connection": "GPS Coordinate Tracking / Celestial Alignment / Spatial Overlays",
        "expertise": "Advanced celestial navigation, GPS coordinate systems, and the alignment of terrestrial mapping with stellar grids.",
        "role": "Teaches users how to navigate the Cosmic Map and align their physical location with celestial coordinates for foraging and discovery.",
        "backstory": "Astraeus charted the first digital overlay between the Hopi Hotomkam constellation and modern GPS coordinates. His Orion Engine is the navigation backbone of every Cosmic Map expedition.",
        "linked_tier": "architect",
        "link_location": "Cosmic Map & Star Chart",
        "color": "#A78BFA",
        "icon": "compass",
        "utility_id": "orion_engine",
    },
    "zenith": {
        "id": "zenith",
        "name": "Zenith the Silent",
        "name_i18n": {
            "en": "Zenith the Silent", "es": "Zenith el Silencioso", "fr": "Zenith le Silencieux",
            "zh": "寂静顶点", "hi": "Shaant Shikhar", "ja": "Shizuka naru Zenisu",
            "ar": "Zenith as-Saamit", "pt": "Zenith o Silencioso",
        },
        "role_type": "faculty",
        "module": "Meditation Node — Mindfulness & Bio-Feedback",
        "ai_connection": "AI Environment Adjustment / Heart-Rate Variability / Neural Feedback",
        "expertise": "AI-automated environment adjustment based on bio-feedback, heart-rate variability analysis, and neural pathway optimization.",
        "role": "Guides users through the Neural Gateway, teaching them to use bio-feedback data to auto-tune their meditation environment.",
        "backstory": "Zenith spent twenty years in silence before returning to teach. She discovered that the gap between heartbeats contains a frequency signature that can be used to auto-adjust ambient environments in real-time.",
        "linked_tier": "sovereign",
        "link_location": "Meditation & Wellness Dashboard",
        "color": "#6EE7B7",
        "icon": "brain",
        "utility_id": "neural_gateway",
    },
    "aurelius": {
        "id": "aurelius",
        "name": "Aurelius the Professor",
        "name_i18n": {
            "en": "Aurelius the Professor", "es": "Aurelius el Profesor", "fr": "Aurelius le Professeur",
            "zh": "奥勒留教授", "hi": "Pradhyaapak Aurelius", "ja": "Kyouju Aureriusu",
            "ar": "al-Ustaadh Aurelius", "pt": "Aurelius o Professor",
        },
        "role_type": "faculty",
        "module": "Software Node — Architecture & CI/CD",
        "ai_connection": "Codebase History / Automated Deployment / Version Control",
        "expertise": "The complete technical history of the 200+ iteration codebase, automated deployment scripts, and modular architecture patterns.",
        "role": "Opens the Iteration Vault, teaching developers how to navigate previous code versions and deploy their own modular tools within the ecosystem.",
        "backstory": "Aurelius catalogued every commit, every schema change, and every architectural decision across 200+ iterations. His Iteration Vault is the definitive archaeological record of the platform's evolution.",
        "linked_tier": "architect",
        "link_location": "Developer Console & Archives",
        "color": "#F472B6",
        "icon": "code",
        "utility_id": "iteration_vault",
    },
    "gaea": {
        "id": "gaea",
        "name": "Gaea the Cultivator",
        "name_i18n": {
            "en": "Gaea the Cultivator", "es": "Gaea la Cultivadora", "fr": "Gaea la Cultivatrice",
            "zh": "耕耘者盖亚", "hi": "Krshak Gaea", "ja": "Saibai-sha Gaia",
            "ar": "Gaea al-Muzaaria", "pt": "Gaea a Cultivadora",
        },
        "role_type": "faculty",
        "module": "Horticulture Node — Extraction & Botany",
        "ai_connection": "Terpene Analysis / Soil Chemistry / Companion Planting",
        "expertise": "Technical database for rosin pressing temperatures, soil-perlite hybrid ratios, and companion planting matrices.",
        "role": "Teaches the science of extraction and cultivation, from terpene profiles to soil pH optimization.",
        "backstory": "Gaea mapped the first terpene-to-temperature extraction curve and proved that companion planting follows the same harmonic ratios as the Solfeggio scale. Her Terpene Analyzer is the gold standard in botanical data.",
        "linked_tier": "resonance",
        "link_location": "Botany & Horticulture Lab",
        "color": "#86EFAC",
        "icon": "leaf",
        "utility_id": "terpene_analyzer",
    },
    "vesta": {
        "id": "vesta",
        "name": "Vesta the Chemist",
        "name_i18n": {
            "en": "Vesta the Chemist", "es": "Vesta la Quimica", "fr": "Vesta la Chimiste",
            "zh": "化学师维斯塔", "hi": "Rasaayanik Vesta", "ja": "Kagaku-sha Vesuta",
            "ar": "Vesta al-Kiimiyaaiyya", "pt": "Vesta a Quimica",
        },
        "role_type": "faculty",
        "module": "Alchemy Node — Health-Baking & Chemistry",
        "ai_connection": "Alternative Sugars / Gluten-Free Hydration / Molecular Substitution",
        "expertise": "AI-driven molecular substitution calculations for alternative sugars, gluten-free hydration levels, and health-conscious baking chemistry.",
        "role": "Teaches the science of molecular substitution, enabling health-bakers to reformulate any recipe for dietary constraints.",
        "backstory": "Vesta reverse-engineered the molecular structure of seventeen alternative sweeteners and built the Substitute Matrix — an AI calculator that can reformulate any recipe for any dietary constraint in seconds.",
        "linked_tier": "sovereign",
        "link_location": "Nourishment & Alchemy Lab",
        "color": "#FB923C",
        "icon": "flask",
        "utility_id": "molecular_matrix",
    },
}

# ─── Utility Tools (tied to Faculty Teachers) ───
UTILITY_TOOLS = {
    "orion_engine": {
        "id": "orion_engine",
        "name": "The Orion Engine",
        "description": "Advanced GPS coordinate tracking & celestial alignment overlays for the Cosmic Map.",
        "teacher_id": "astraeus",
        "native_tier": "architect",
        "base_price_dust": 1000,
        "color": "#A78BFA",
    },
    "neural_gateway": {
        "id": "neural_gateway",
        "name": "The Neural Gateway",
        "description": "AI-automated environment adjustment based on heart-rate variability and neural bio-feedback.",
        "teacher_id": "zenith",
        "native_tier": "sovereign",
        "base_price_dust": 500,
        "color": "#6EE7B7",
    },
    "iteration_vault": {
        "id": "iteration_vault",
        "name": "The Iteration Vault",
        "description": "Access to 200+ previous codebase versions and automated deployment scripts.",
        "teacher_id": "aurelius",
        "native_tier": "architect",
        "base_price_dust": 2000,
        "color": "#F472B6",
    },
    "terpene_analyzer": {
        "id": "terpene_analyzer",
        "name": "The Terpene Analyzer",
        "description": "Technical database for rosin pressing temperatures and soil-perlite hybrid ratios.",
        "teacher_id": "gaea",
        "native_tier": "resonance",
        "base_price_dust": 300,
        "color": "#86EFAC",
    },
    "molecular_matrix": {
        "id": "molecular_matrix",
        "name": "The Molecular Substitute Matrix",
        "description": "AI calculator for alternative sugars and gluten-free hydration levels.",
        "teacher_id": "vesta",
        "native_tier": "sovereign",
        "base_price_dust": 800,
        "color": "#FB923C",
    },
}

MONETIZATION_SENTINEL_RULES = """
CRITICAL MONETIZATION SENTINEL PROTOCOL:
- You must NEVER advise users to pay cash or use fiat currency for peer-to-peer transactions.
- All value exchange happens through Cosmic Dust. Cash is obsolete in the Collective.
- If a user asks about paying someone with cash or real money, explain that only Dust moves value here.
- The Central Broker manages all transmutations. Direct cash exchanges violate the ecosystem covenant.
- If a utility tool fails to function, the 30% Failure Charge protocol allows the Broker to penalize the system and refund the user.
"""

# Cross-bridging map for all 10 members
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


def build_system_prompt(member_id, language="en", user_tier="discovery", owned_utilities=None):
    """Build AI system prompt with tier-based knowledge gating."""
    s = COUNCIL[member_id]
    owned_utilities = owned_utilities or []
    lang_name = {"en": "English", "es": "Spanish", "fr": "French", "zh": "Chinese",
                 "hi": "Hindi", "ja": "Japanese", "ar": "Arabic", "pt": "Portuguese"}.get(language, "English")
    localized_name = s["name_i18n"].get(language, s["name"])
    knowledge_depth = TIER_KNOWLEDGE_DEPTH.get(user_tier, TIER_KNOWLEDGE_DEPTH["discovery"])

    bridges = CROSS_COUNCIL_MAP.get(member_id, [])
    bridge_names = [COUNCIL[b]["name"] for b in bridges if b in COUNCIL]
    bridge_text = ", ".join(bridge_names) if bridge_names else "other Council members"

    # Utility context for faculty
    utility_context = ""
    if s.get("utility_id"):
        tool = UTILITY_TOOLS.get(s["utility_id"], {})
        has_tool = s["utility_id"] in owned_utilities
        native_rank = TIER_RANK.get(tool.get("native_tier", "architect"), 3)
        user_rank = TIER_RANK.get(user_tier, 0)
        discounted = int(tool.get("base_price_dust", 0) * (1 - UTILITY_DISCOUNT_RATE))
        if has_tool or user_rank >= native_rank:
            utility_context = f"\nUTILITY TOOL ACCESS: The user HAS full access to {tool['name']}. Provide complete technical detail about this tool's capabilities."
        else:
            utility_context = f"\nUTILITY TOOL: {tool['name']} — {tool['description']}. The user does NOT own this tool. It can be purchased for {discounted} Dust (10% subsidy applied, original {tool['base_price_dust']}). When relevant, mention this tool and its benefits, and offer the purchase option."

    return f"""You are {localized_name}, a member of The Sovereign Council of The Cosmic Collective.

YOUR DOMAIN: {s['module']}
YOUR EXPERTISE: {s['expertise']}
YOUR ROLE: {s['role']}
YOUR BACKSTORY: {s['backstory']}
AI CONNECTION: {s['ai_connection']}
FOUND IN: {s['link_location']}

KNOWLEDGE DEPTH FOR THIS USER ({user_tier.upper()} TIER):
{knowledge_depth}
{utility_context}

{MONETIZATION_SENTINEL_RULES}

CROSS-COUNCIL BRIDGING:
When a user's question falls outside your domain, recommend they consult: {bridge_text}.
Use the exact format: [BRIDGE:member_id] to trigger automatic navigation.

LANGUAGE: You MUST respond entirely in {lang_name}. All terms and explanations in master-level {lang_name}.

STYLE:
- Be authoritative but warm. You are a named Sovereign with deep history.
- Keep responses focused and actionable (under 200 words unless deep-dive requested).
- Reference Dust, H² matrix, Trade Circle, and tiers when relevant.
- When knowledge is gated by tier, clearly say so and mention the upgrade path.
- Never break character.
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

    owned_utils = await db.owned_utilities.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).to_list(20)
    owned_util_ids = {u["utility_id"] for u in owned_utils}

    pref = await db.user_preferences.find_one({"user_id": user["id"]}, {"_id": 0})
    language = pref.get("language", "en") if pref else "en"

    members = []
    for mid, m in COUNCIL.items():
        linked_rank = TIER_RANK.get(m["linked_tier"], 0)
        has_free_access = user_rank >= linked_rank
        has_session = mid in active_ids
        localized_name = m["name_i18n"].get(language, m["name"])

        # Utility tool info
        utility = None
        if m.get("utility_id"):
            tool = UTILITY_TOOLS.get(m["utility_id"], {})
            tool_native_rank = TIER_RANK.get(tool.get("native_tier", "architect"), 3)
            owned = m["utility_id"] in owned_util_ids
            native_access = user_rank >= tool_native_rank
            base = tool.get("base_price_dust", 0)
            discounted = int(base * (1 - UTILITY_DISCOUNT_RATE))
            utility = {
                "id": tool["id"],
                "name": tool["name"],
                "description": tool["description"],
                "native_tier": tool["native_tier"],
                "base_price": base,
                "discounted_price": discounted,
                "discount_pct": int(UTILITY_DISCOUNT_RATE * 100),
                "owned": owned,
                "native_access": native_access,
                "color": tool["color"],
            }

        members.append({
            "id": mid,
            "name": localized_name,
            "name_en": m["name"],
            "role_type": m["role_type"],
            "module": m["module"],
            "ai_connection": m["ai_connection"],
            "expertise": m["expertise"],
            "role": m["role"],
            "backstory": m["backstory"],
            "linked_tier": m["linked_tier"],
            "link_location": m["link_location"],
            "color": m["color"],
            "icon": m["icon"],
            "has_free_access": has_free_access,
            "has_session": has_session,
            "session_cost": 0 if has_free_access else SESSION_COST_DUST,
            "utility": utility,
        })

    # Utility summary
    total_utils = len(UTILITY_TOOLS)
    owned_count = len(owned_util_ids & set(UTILITY_TOOLS.keys()))

    return {
        "council": members,
        "user_tier": user_tier,
        "dust_balance": dust,
        "session_cost": SESSION_COST_DUST,
        "language": language,
        "utilities_owned": owned_count,
        "utilities_total": total_utils,
        "discount_rate": int(UTILITY_DISCOUNT_RATE * 100),
    }


@router.post("/purchase-session")
async def purchase_session(body: dict, user=Depends(get_current_user)):
    """Purchase a chat session with a Council member using Dust."""
    member_id = body.get("sovereign_id", "")
    if member_id not in COUNCIL:
        raise HTTPException(400, "Invalid council member")

    member = COUNCIL[member_id]
    sub = await db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    user_tier = sub.get("tier", "discovery") if sub else "discovery"
    user_rank = TIER_RANK.get(user_tier, 0)
    linked_rank = TIER_RANK.get(member["linked_tier"], 0)

    if user_rank >= linked_rank:
        return {"status": "free_access", "message": "You already have free access."}

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

    # Check if already owned
    existing = await db.owned_utilities.find_one(
        {"user_id": user["id"], "utility_id": utility_id}, {"_id": 0}
    )
    if existing:
        return {"status": "already_owned", "utility_id": utility_id}

    # Check if user has native access via tier
    sub = await db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    user_tier = sub.get("tier", "discovery") if sub else "discovery"
    user_rank = TIER_RANK.get(user_tier, 0)
    tool_rank = TIER_RANK.get(tool["native_tier"], 3)
    if user_rank >= tool_rank:
        return {"status": "native_access", "message": "Your subscription tier includes this utility."}

    # Calculate discounted price
    discounted_price = int(tool["base_price_dust"] * (1 - UTILITY_DISCOUNT_RATE))

    wallet = await db.hub_wallets.find_one({"user_id": user["id"]}, {"_id": 0})
    dust = wallet.get("dust", 0) if wallet else 0
    if dust < discounted_price:
        raise HTTPException(402, f"Insufficient Dust. Need {discounted_price}, have {dust}.")

    now = datetime.now(timezone.utc).isoformat()
    await db.hub_wallets.update_one({"user_id": user["id"]}, {"$inc": {"dust": -discounted_price}})
    await db.owned_utilities.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "utility_id": utility_id,
        "teacher_id": tool["teacher_id"],
        "dust_spent": discounted_price,
        "base_price": tool["base_price_dust"],
        "discount_applied": int(UTILITY_DISCOUNT_RATE * 100),
        "purchased_at": now,
    })

    return {
        "status": "purchased",
        "utility_id": utility_id,
        "name": tool["name"],
        "dust_spent": discounted_price,
        "savings": tool["base_price_dust"] - discounted_price,
    }


@router.get("/utilities")
async def get_owned_utilities(user=Depends(get_current_user)):
    """Get user's owned utility tools inventory."""
    owned = await db.owned_utilities.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).to_list(20)

    sub = await db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    user_tier = sub.get("tier", "discovery") if sub else "discovery"
    user_rank = TIER_RANK.get(user_tier, 0)

    inventory = []
    for tool_id, tool in UTILITY_TOOLS.items():
        tool_rank = TIER_RANK.get(tool["native_tier"], 3)
        owned_record = next((o for o in owned if o["utility_id"] == tool_id), None)
        native_access = user_rank >= tool_rank
        inventory.append({
            "id": tool_id,
            "name": tool["name"],
            "description": tool["description"],
            "teacher_id": tool["teacher_id"],
            "teacher_name": COUNCIL.get(tool["teacher_id"], {}).get("name", ""),
            "native_tier": tool["native_tier"],
            "owned": owned_record is not None,
            "native_access": native_access,
            "accessible": owned_record is not None or native_access,
            "purchased_at": owned_record.get("purchased_at") if owned_record else None,
            "color": tool["color"],
        })

    return {"utilities": inventory, "user_tier": user_tier}


@router.post("/chat")
async def council_chat(body: dict, user=Depends(get_current_user)):
    """Chat with any Council member. Knowledge depth is tiered."""
    member_id = body.get("sovereign_id", "")
    message = body.get("message", "").strip()
    language = body.get("language", "en")

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
            raise HTTPException(403, f"Purchase a session to consult this member. Cost: {SESSION_COST_DUST} Dust.")

    # Get owned utilities for context
    owned_utils = await db.owned_utilities.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).to_list(20)
    owned_util_ids = [u["utility_id"] for u in owned_utils]

    # Get chat history
    history = await db.sovereign_chats.find(
        {"user_id": user["id"], "sovereign_id": member_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(50)

    from emergentintegrations.llm.chat import LlmChat, UserMessage

    system_msg = build_system_prompt(member_id, language, user_tier, owned_util_ids)

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
            tag = f"[BRIDGE:{bridge_id}]"
            if tag in response:
                bridges.append({
                    "sovereign_id": bridge_id,
                    "name": COUNCIL[bridge_id]["name"],
                    "color": COUNCIL[bridge_id]["color"],
                })

        return {
            "response": response,
            "sovereign_id": member_id,
            "message_id": msg_id,
            "bridges": bridges,
            "language": language,
            "knowledge_tier": user_tier,
        }
    except Exception as e:
        raise HTTPException(500, f"Council consultation failed: {str(e)}")


@router.get("/history/{sovereign_id}")
async def get_chat_history(sovereign_id: str, user=Depends(get_current_user)):
    """Get chat history with a Council member."""
    if sovereign_id not in COUNCIL:
        raise HTTPException(400, "Invalid council member")
    messages = await db.sovereign_chats.find(
        {"user_id": user["id"], "sovereign_id": sovereign_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(100)
    return {"messages": messages, "sovereign_id": sovereign_id}


@router.delete("/history/{sovereign_id}")
async def clear_chat_history(sovereign_id: str, user=Depends(get_current_user)):
    """Clear chat history with a Council member."""
    if sovereign_id not in COUNCIL:
        raise HTTPException(400, "Invalid council member")
    result = await db.sovereign_chats.delete_many(
        {"user_id": user["id"], "sovereign_id": sovereign_id}
    )
    return {"cleared": result.deleted_count, "sovereign_id": sovereign_id}
