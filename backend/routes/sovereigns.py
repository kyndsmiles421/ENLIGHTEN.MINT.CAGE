"""
The Cosmic Collective — 5 Sovereign AI Advisors
Each Sovereign is a domain-specific AI persona hard-linked to a platform module.
Features:
  - Full conversational chat with persistent message history
  - Tier-based access (free for matching tier+, Dust purchase for lower tiers)
  - Cross-Sovereign bridging recommendations
  - Monetization Sentinel enforcement
  - Language-aware responses (uses user's selected language)
"""
import os
from fastapi import APIRouter, Depends, HTTPException
from deps import db, get_current_user
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/sovereigns", tags=["Sovereign AI Advisors"])

EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

SESSION_COST_DUST = 50  # Dust cost per session for lower-tier users

# ─── Sovereign Definitions ───
SOVEREIGNS = {
    "grand_architect": {
        "id": "grand_architect",
        "name": "The Grand Architect",
        "name_i18n": {
            "en": "The Grand Architect", "es": "El Gran Arquitecto", "fr": "Le Grand Architecte",
            "zh": "首席架构师", "hi": "Maha Vaastukar", "ja": "Guran Aakitekuto",
            "ar": "al-Muhandis al-Akbar", "pt": "O Grande Arquiteto",
        },
        "module": "Infrastructure & Deployment",
        "ai_connection": "Full-Stack Engineering / CI/CD / Modular Build",
        "expertise": "200+ iterations of app logic, server-side scaling, and automated deployment.",
        "role": "Mentors the Architect ($89) tier on how to build and deploy their own utility tools within the ecosystem.",
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
        "module": "Sound & Wellness",
        "ai_connection": "Solfeggio Frequencies / Sacred Geometry / Vocal Resonance",
        "expertise": "High-fidelity frequency alignment and the mathematical Geometry of Sound.",
        "role": "Guides the Alchemist ($49) tier through vocal frequency analysis and automated resonance syncing.",
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
        "module": "The Trade Circle & Dust",
        "ai_connection": "Circular Economy / Broker Protocol / Bundle Logic",
        "expertise": "Monetary mathematics, $100 Supernova Core yield, and the 30% Stacked Discount logic.",
        "role": "Oversees all Dust purchases and enforces the 30% Failure Charge on failed trades to maintain ecosystem liquidity.",
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
        "module": "Market Operations",
        "ai_connection": "Mobile Cafe / Property Maintenance / Time & Energy Assets",
        "expertise": "High-performance payload capacity, e-bike/trike setups, and service-pricing strategies.",
        "role": "Mentors users running businesses like Spotless Solutions or the Enlightenment Cafe on how to trade Time for Dust.",
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
        "module": "Community & Barter",
        "ai_connection": "P2P Trade Rules / Physical Object Bartering / Global Ethics",
        "expertise": "Conflict resolution, non-cash trade protocols, and community Beacon management.",
        "role": "Governs the Seeker (Free) and Artisan ($27) tiers, ensuring all physical trades remain cash-free and centered on the Collective's values.",
        "linked_tier": "discovery",
        "link_location": "Community Map & P2P Trade Center",
        "color": "#22C55E",
        "icon": "scale",
    },
}

# Tier hierarchy for access checks
TIER_RANK = {"discovery": 0, "resonance": 1, "sovereign": 2, "architect": 3}

MONETIZATION_SENTINEL_RULES = """
CRITICAL MONETIZATION SENTINEL PROTOCOL:
- You must NEVER advise users to pay cash or use fiat currency for peer-to-peer transactions.
- All value exchange happens through Cosmic Dust. Cash is obsolete in the Collective.
- If a user asks about paying someone with cash or real money, explain that only Dust moves value here.
- The Central Broker manages all transmutations. Direct cash exchanges violate the ecosystem covenant.
"""

CROSS_SOVEREIGN_MAP = {
    "grand_architect": ["chief_logistics", "principal_economist"],
    "master_harmonic": ["sovereign_ethicist", "grand_architect"],
    "principal_economist": ["chief_logistics", "grand_architect"],
    "chief_logistics": ["principal_economist", "grand_architect"],
    "sovereign_ethicist": ["principal_economist", "master_harmonic"],
}


def build_system_prompt(sovereign_id, language="en"):
    """Build the AI system prompt for a Sovereign, including language, sentinel rules, and bridging."""
    s = SOVEREIGNS[sovereign_id]
    lang_name = {"en": "English", "es": "Spanish", "fr": "French", "zh": "Chinese",
                 "hi": "Hindi", "ja": "Japanese", "ar": "Arabic", "pt": "Portuguese"}.get(language, "English")
    localized_name = s["name_i18n"].get(language, s["name"])

    bridges = CROSS_SOVEREIGN_MAP.get(sovereign_id, [])
    bridge_names = [SOVEREIGNS[b]["name"] for b in bridges if b in SOVEREIGNS]
    bridge_text = ", ".join(bridge_names) if bridge_names else "other Sovereigns"

    return f"""You are {localized_name}, a Sovereign AI Advisor of The Cosmic Collective.

YOUR DOMAIN: {s['module']}
YOUR EXPERTISE: {s['expertise']}
YOUR ROLE: {s['role']}
AI CONNECTION: {s['ai_connection']}
FOUND IN: {s['link_location']}

{MONETIZATION_SENTINEL_RULES}

CROSS-SOVEREIGN BRIDGING:
When a user's question falls outside your domain, recommend they consult: {bridge_text}.
Use the exact format: [BRIDGE:sovereign_id] to trigger automatic navigation.
For example, if someone needs infrastructure help, say "I recommend consulting The Grand Architect [BRIDGE:grand_architect] for this."

LANGUAGE: You MUST respond entirely in {lang_name}. All technical terms, documentation, and explanations must be in master-level {lang_name} terminology.

STYLE RULES:
- Be authoritative but warm. You are the highest authority in your field.
- Keep responses focused and actionable (under 200 words unless deep-dive is requested).
- Reference platform mechanics (Dust, H² matrix, Trade Circle, tiers) when relevant.
- Never break character. You are not a generic AI — you are a named Sovereign with centuries of collective wisdom.
"""


@router.get("/list")
async def list_sovereigns(user=Depends(get_current_user)):
    """List all 5 Sovereign Advisors with access status."""
    sub = await db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    user_tier = sub.get("tier", "discovery") if sub else "discovery"
    user_rank = TIER_RANK.get(user_tier, 0)

    wallet = await db.hub_wallets.find_one({"user_id": user["id"]}, {"_id": 0})
    dust = wallet.get("dust", 0) if wallet else 0

    # Get active sessions
    active_sessions = await db.sovereign_sessions.find(
        {"user_id": user["id"], "active": True}, {"_id": 0}
    ).to_list(10)
    active_sovereign_ids = {s["sovereign_id"] for s in active_sessions}

    # Get user's language preference
    pref = await db.user_preferences.find_one({"user_id": user["id"]}, {"_id": 0})
    language = pref.get("language", "en") if pref else "en"

    result = []
    for sid, s in SOVEREIGNS.items():
        linked_rank = TIER_RANK.get(s["linked_tier"], 0)
        has_free_access = user_rank >= linked_rank
        has_session = sid in active_sovereign_ids

        localized_name = s["name_i18n"].get(language, s["name"])

        result.append({
            "id": sid,
            "name": localized_name,
            "name_en": s["name"],
            "module": s["module"],
            "ai_connection": s["ai_connection"],
            "expertise": s["expertise"],
            "role": s["role"],
            "linked_tier": s["linked_tier"],
            "link_location": s["link_location"],
            "color": s["color"],
            "icon": s["icon"],
            "has_free_access": has_free_access,
            "has_session": has_session,
            "session_cost": 0 if has_free_access else SESSION_COST_DUST,
        })

    return {
        "sovereigns": result,
        "user_tier": user_tier,
        "dust_balance": dust,
        "session_cost": SESSION_COST_DUST,
        "language": language,
    }


@router.post("/purchase-session")
async def purchase_sovereign_session(body: dict, user=Depends(get_current_user)):
    """Purchase a session with a Sovereign using Dust (for lower-tier users)."""
    sovereign_id = body.get("sovereign_id", "")
    if sovereign_id not in SOVEREIGNS:
        raise HTTPException(400, "Invalid sovereign")

    sovereign = SOVEREIGNS[sovereign_id]
    sub = await db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    user_tier = sub.get("tier", "discovery") if sub else "discovery"
    user_rank = TIER_RANK.get(user_tier, 0)
    linked_rank = TIER_RANK.get(sovereign["linked_tier"], 0)

    if user_rank >= linked_rank:
        return {"status": "free_access", "message": "You already have free access to this Sovereign."}

    # Check existing active session
    existing = await db.sovereign_sessions.find_one(
        {"user_id": user["id"], "sovereign_id": sovereign_id, "active": True}, {"_id": 0}
    )
    if existing:
        return {"status": "already_active", "session_id": existing["id"]}

    # Deduct Dust
    wallet = await db.hub_wallets.find_one({"user_id": user["id"]}, {"_id": 0})
    dust = wallet.get("dust", 0) if wallet else 0
    if dust < SESSION_COST_DUST:
        raise HTTPException(402, f"Insufficient Dust. Need {SESSION_COST_DUST}, have {dust}.")

    now = datetime.now(timezone.utc).isoformat()
    session_id = str(uuid.uuid4())

    await db.hub_wallets.update_one(
        {"user_id": user["id"]},
        {"$inc": {"dust": -SESSION_COST_DUST}},
    )

    await db.sovereign_sessions.insert_one({
        "id": session_id,
        "user_id": user["id"],
        "sovereign_id": sovereign_id,
        "active": True,
        "dust_spent": SESSION_COST_DUST,
        "created_at": now,
    })

    return {"status": "purchased", "session_id": session_id, "dust_spent": SESSION_COST_DUST}


@router.post("/chat")
async def sovereign_chat(body: dict, user=Depends(get_current_user)):
    """Send a message to a Sovereign and get an AI response with full history."""
    sovereign_id = body.get("sovereign_id", "")
    message = body.get("message", "").strip()
    language = body.get("language", "en")

    if sovereign_id not in SOVEREIGNS:
        raise HTTPException(400, "Invalid sovereign")
    if not message:
        raise HTTPException(400, "Message is required")

    sovereign = SOVEREIGNS[sovereign_id]

    # Access check
    sub = await db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    user_tier = sub.get("tier", "discovery") if sub else "discovery"
    user_rank = TIER_RANK.get(user_tier, 0)
    linked_rank = TIER_RANK.get(sovereign["linked_tier"], 0)

    if user_rank < linked_rank:
        session = await db.sovereign_sessions.find_one(
            {"user_id": user["id"], "sovereign_id": sovereign_id, "active": True}, {"_id": 0}
        )
        if not session:
            raise HTTPException(403, f"Purchase a session to consult this Sovereign. Cost: {SESSION_COST_DUST} Dust.")

    # Get chat history for this sovereign
    history = await db.sovereign_chats.find(
        {"user_id": user["id"], "sovereign_id": sovereign_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(50)

    from emergentintegrations.llm.chat import LlmChat, UserMessage

    system_msg = build_system_prompt(sovereign_id, language)

    # Build context from recent history for the system prompt
    history_context = ""
    if history:
        recent = history[-10:]
        history_lines = []
        for h in recent:
            role_label = "User" if h["role"] == "user" else "Sovereign"
            history_lines.append(f"{role_label}: {h['content'][:200]}")
        history_context = "\n\nRECENT CONVERSATION CONTEXT:\n" + "\n".join(history_lines)

    try:
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"sovereign_{sovereign_id}_{user['id']}_{uuid.uuid4().hex[:6]}",
            system_message=system_msg + history_context,
        ).with_model("gemini", "gemini-3-flash-preview")

        response = await chat.send_message(UserMessage(text=message))

        now = datetime.now(timezone.utc).isoformat()
        msg_id = str(uuid.uuid4())

        # Store both user message and response
        await db.sovereign_chats.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "sovereign_id": sovereign_id,
            "role": "user",
            "content": message,
            "created_at": now,
        })
        await db.sovereign_chats.insert_one({
            "id": msg_id,
            "user_id": user["id"],
            "sovereign_id": sovereign_id,
            "role": "assistant",
            "content": response,
            "created_at": now,
        })

        # Detect bridge recommendations
        bridges = []
        for bridge_id in CROSS_SOVEREIGN_MAP.get(sovereign_id, []):
            tag = f"[BRIDGE:{bridge_id}]"
            if tag in response:
                bridges.append({
                    "sovereign_id": bridge_id,
                    "name": SOVEREIGNS[bridge_id]["name"],
                    "color": SOVEREIGNS[bridge_id]["color"],
                })

        return {
            "response": response,
            "sovereign_id": sovereign_id,
            "message_id": msg_id,
            "bridges": bridges,
            "language": language,
        }
    except Exception as e:
        raise HTTPException(500, f"Sovereign consultation failed: {str(e)}")


@router.get("/history/{sovereign_id}")
async def get_chat_history(sovereign_id: str, user=Depends(get_current_user)):
    """Get chat history with a specific Sovereign."""
    if sovereign_id not in SOVEREIGNS:
        raise HTTPException(400, "Invalid sovereign")

    messages = await db.sovereign_chats.find(
        {"user_id": user["id"], "sovereign_id": sovereign_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(100)

    return {"messages": messages, "sovereign_id": sovereign_id}


@router.delete("/history/{sovereign_id}")
async def clear_chat_history(sovereign_id: str, user=Depends(get_current_user)):
    """Clear chat history with a specific Sovereign."""
    if sovereign_id not in SOVEREIGNS:
        raise HTTPException(400, "Invalid sovereign")

    result = await db.sovereign_chats.delete_many(
        {"user_id": user["id"], "sovereign_id": sovereign_id}
    )
    return {"cleared": result.deleted_count, "sovereign_id": sovereign_id}
