"""
The Cosmic Collective — AI Co-Pilot & Pack Generator
Provides:
  - Just-in-time micro-lessons when Learning Toggle is ON
  - Automated pack synthesis from user expertise
  - Context-aware educational guidance
"""
import os
from fastapi import APIRouter, Depends, HTTPException
from deps import db, get_current_user
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/copilot", tags=["AI Co-Pilot & Pack Generator"])

EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

# ─── Context Hints Library ───
CONTEXT_HINTS = {
    "trade": {
        "title": "Trade Mechanics",
        "why": "Trades use the AI Broker with H² matrix verification. Your determinant must be positive.",
        "tip": "Time your trades during Harmony Surge for 40% lower transmutation costs.",
        "pack_link": "transmutation",
    },
    "hexagram": {
        "title": "H² State Matrix",
        "why": "Your 24-line binary state is evaluated across 4 clusters: Security, Location, Finance, Evolution.",
        "tip": "Cross-cluster resonance gives a +0.25 bonus. Balance all clusters for maximum density.",
        "pack_link": "foundations",
    },
    "constellation": {
        "title": "Orbital Synthesis",
        "why": "Constellations are modular compositions in the Orbital Mixer. Synergy bonds multiply output.",
        "tip": "Aim for 3+ module constellations to unlock bonus synergy patterns.",
        "pack_link": "foundations",
    },
    "wallet": {
        "title": "Dual Currency Economics",
        "why": "Cosmic Dust is earned via platform activity. Celestial Gems are premium. The AI Broker transmutes between them.",
        "tip": "Earn Dust through guild activity, learning, and constellation creation.",
        "pack_link": "transmutation",
    },
    "sentinel": {
        "title": "Content Governance",
        "why": "The Sentinel phase-shifts between Harmonic, Fractal, and Elemental modes based on platform activity.",
        "tip": "Three violations trigger shadow-mute. Post constructive content to maintain a clean record.",
        "pack_link": "sentinel_ops",
    },
    "forge": {
        "title": "Forge Simulation",
        "why": "Labs validate learning through H² determinant checks. A positive determinant proves you've harmonized the data.",
        "tip": "Strengthen your weakest cluster before attempting lab completion.",
        "pack_link": "foundations",
    },
    "subscription": {
        "title": "Subscription Benefits",
        "why": "Higher tiers unlock more project slots, marketplace discounts, and commission levels.",
        "tip": "Sovereign tier ($89.99/mo) unlocks 27% Master commissions — it pays for itself through brokering.",
        "pack_link": None,
    },
    "commission": {
        "title": "Brokerage Commissions",
        "why": "Your commission rate increases with mastery level. Sovereign Masters earn 27% on all sales and referrals.",
        "tip": "Complete Mastery Deep-Dives to level up in specific domains. Commissions are per-domain.",
        "pack_link": None,
    },
}


@router.get("/hint/{context}")
async def get_context_hint(context: str, user=Depends(get_current_user)):
    """Get a static context hint for the Learning Toggle tooltip."""
    hint = CONTEXT_HINTS.get(context)
    if not hint:
        return {"hint": None}

    # Check if learning toggle is on
    pref = await db.learning_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    toggle_on = pref.get("learning_toggle", False) if pref else False

    return {
        "hint": hint,
        "learning_toggle": toggle_on,
    }


@router.post("/micro-lesson")
async def generate_micro_lesson(body: dict, user=Depends(get_current_user)):
    """Generate an AI-powered just-in-time micro-lesson based on user context."""
    context = body.get("context", "general")
    struggle_point = body.get("struggle_point", "")
    current_action = body.get("current_action", "")

    # Check learning toggle
    pref = await db.learning_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    toggle_on = pref.get("learning_toggle", False) if pref else False
    if not toggle_on:
        return {"lesson": None, "reason": "Learning Toggle is off"}

    # Get user state for personalization
    score = await db.accreditation_scores.find_one({"user_id": user["id"]}, {"_id": 0})
    sub = await db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})

    modality = pref.get("modality", "architect") if pref else "architect"
    resonance = score.get("total_resonance_points", 0) if score else 0
    tier = sub.get("tier", "discovery") if sub else "discovery"

    from emergentintegrations.llm.chat import LlmChat, UserMessage

    system_msg = f"""You are the Cosmic Collective AI Co-Pilot. Generate a concise, actionable micro-lesson.

Context: The user is in the '{context}' area of the platform.
User state: modality={modality}, resonance={resonance}RP, tier={tier}
Struggle point: {struggle_point or 'none specified'}
Current action: {current_action or 'browsing'}

Rules:
- Keep the lesson under 80 words
- Be direct and practical
- Connect the current task to broader platform mechanics
- Use the user's modality language (architect=strategic, chef=practical, researcher=analytical, voyager=experiential)
- End with one concrete next-step action"""

    try:
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"copilot_{user['id']}_{context}",
            system_message=system_msg,
        ).with_model("gemini", "gemini-3-flash-preview")

        prompt = f"Generate a micro-lesson for: {context}"
        if struggle_point:
            prompt += f". The user is struggling with: {struggle_point}"
        if current_action:
            prompt += f". They are currently: {current_action}"

        response = await chat.send_message(UserMessage(text=prompt))

        # Log the micro-lesson
        await db.copilot_lessons.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "context": context,
            "struggle_point": struggle_point,
            "lesson_text": response,
            "modality": modality,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

        return {
            "lesson": response,
            "context": context,
            "hint": CONTEXT_HINTS.get(context),
        }
    except Exception:
        # Fallback to static hint
        hint = CONTEXT_HINTS.get(context, {})
        return {
            "lesson": hint.get("why", "") + " " + hint.get("tip", ""),
            "context": context,
            "hint": hint,
            "fallback": True,
        }


@router.post("/generate-pack")
async def generate_pack_outline(body: dict, user=Depends(get_current_user)):
    """AI Synthesis Forge — full pack generation pipeline with curriculum, assessments, and financials."""
    field = body.get("field", "")
    expertise = body.get("expertise", "")
    pack_type = body.get("pack_type", "mini")

    if not field or not expertise:
        raise HTTPException(400, "field and expertise are required")

    pack_configs = {
        "mini": {"price_range": "$87 – $177", "modules": "3-5", "depth": "hyper-focused", "base_price": 127, "lessons": 6},
        "mastery": {"price_range": "$447 – $897", "modules": "12-18", "depth": "comprehensive vertical", "base_price": 597, "lessons": 16},
        "business": {"price_range": "$1,347+", "modules": "24-30", "depth": "turnkey business plan", "base_price": 1497, "lessons": 24},
    }
    config = pack_configs.get(pack_type, pack_configs["mini"])

    from emergentintegrations.llm.chat import LlmChat, UserMessage

    system_msg = f"""You are the Cosmic Collective Synthesis Forge. Generate a complete learning pack.

Pack type: {pack_type} ({config['depth']})
Price range: {config['price_range']}
Lesson count: {config['lessons']} progressive lessons from Observer to Sovereign
Field: {field}
Expertise: {expertise}

Generate the following structured output:

PACK NAME: [compelling, professional name]
DESCRIPTION: [2-3 sentence marketing description]
DOMAIN: [culinary/engineering/horticulture/business/wellness/creative]
SUGGESTED PRICE: [specific dollar amount within range]

CURRICULUM (Progressive from Observer → Sovereign):
[List each lesson with number, title, level (Observer/Practitioner/Professional/Sovereign), and 1-line description]

KEY OUTCOMES:
[5 specific, measurable outcomes]

ASSESSMENT CHALLENGES:
[3 non-googleable challenges that prove real-world mastery]

BROKERAGE TAGS:
[3 specific services/products this pack qualifies the user to broker in the Trade Circle]

Be specific, practical, and market-ready. No filler. Every lesson must teach something actionable."""

    try:
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"forge_{user['id']}_{uuid.uuid4().hex[:8]}",
            system_message=system_msg,
        ).with_model("gemini", "gemini-3-flash-preview")

        response = await chat.send_message(
            UserMessage(text=f"Generate a complete {pack_type} pack for the field of: {field}. Creator expertise: {expertise}")
        )

        # Compute financials
        base = config["base_price"]
        active_users = await db.hub_wallets.count_documents({})
        active_users = max(active_users, 50)

        financials = {
            "suggested_retail": base,
            "resonance_discount": round(base * 0.85, 2),
            "sovereign_discount": round(base * 0.70, 2),
            "commission_27_pct": round(base * 0.27, 2),
            "commission_13_pct": round(base * 0.135, 2),
            "commission_6_pct": round(base * 0.0675, 2),
            "creator_revenue_per_sale": round(base * 0.73, 2),
            "projected_monthly_sales": max(3, int(active_users * 0.02)),
            "projected_monthly_revenue": round(base * 0.73 * max(3, int(active_users * 0.02)), 2),
            "active_users_in_ecosystem": active_users,
        }

        draft_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        await db.pack_drafts.insert_one({
            "id": draft_id,
            "user_id": user["id"],
            "field": field,
            "expertise": expertise,
            "pack_type": pack_type,
            "outline": response,
            "financials": financials,
            "status": "draft",
            "created_at": now,
        })

        return {
            "draft_id": draft_id,
            "outline": response,
            "pack_type": pack_type,
            "config": config,
            "financials": financials,
        }
    except Exception as e:
        raise HTTPException(500, f"Synthesis failed: {str(e)}")


@router.post("/publish-pack/{draft_id}")
async def publish_pack(draft_id: str, user=Depends(get_current_user)):
    """Publish a draft pack to the Trade Circle Marketplace."""
    draft = await db.pack_drafts.find_one({"id": draft_id, "user_id": user["id"]}, {"_id": 0})
    if not draft:
        raise HTTPException(404, "Draft not found")
    if draft.get("status") == "published":
        return {"status": "already_published", "pack_id": draft.get("published_pack_id")}

    now = datetime.now(timezone.utc).isoformat()
    pack_id = str(uuid.uuid4())
    financials = draft.get("financials", {})

    await db.marketplace_packs.insert_one({
        "id": pack_id,
        "creator_id": user["id"],
        "draft_id": draft_id,
        "field": draft.get("field", ""),
        "pack_type": draft.get("pack_type", "mini"),
        "outline": draft.get("outline", ""),
        "price": financials.get("suggested_retail", 127),
        "commission_rate": 27.0,
        "status": "active",
        "sales_count": 0,
        "total_revenue": 0,
        "published_at": now,
    })

    await db.pack_drafts.update_one(
        {"id": draft_id},
        {"$set": {"status": "published", "published_pack_id": pack_id, "published_at": now}},
    )

    return {"status": "published", "pack_id": pack_id, "draft_id": draft_id}


@router.get("/drafts")
async def get_pack_drafts(user=Depends(get_current_user)):
    """Get user's pack drafts with financials."""
    drafts = await db.pack_drafts.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(20)
    return {"drafts": drafts}


@router.get("/marketplace")
async def get_marketplace_packs(user=Depends(get_current_user)):
    """Get published packs in the Trade Circle Marketplace."""
    packs = await db.marketplace_packs.find(
        {"status": "active"}, {"_id": 0}
    ).sort("published_at", -1).to_list(50)
    # Get creator packs
    my_packs = await db.marketplace_packs.find(
        {"creator_id": user["id"]}, {"_id": 0}
    ).to_list(50)
    return {
        "marketplace": packs,
        "my_published_packs": my_packs,
        "total_active": len(packs),
    }


@router.get("/toggle-status")
async def get_toggle_status(user=Depends(get_current_user)):
    """Get the Learning Toggle status with progression context."""
    pref = await db.learning_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    toggle_on = pref.get("learning_toggle", False) if pref else False
    modality = pref.get("modality", "architect") if pref else "architect"
    intensity = pref.get("intensity", "guided") if pref else "guided"

    score = await db.accreditation_scores.find_one({"user_id": user["id"]}, {"_id": 0})
    sub = await db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    comm = await db.commission_profiles.find_one({"user_id": user["id"]}, {"_id": 0})

    # Calculate advancement level
    modules_completed = score.get("modules_completed", 0) if score else 0
    tier = sub.get("tier", "discovery") if sub else "discovery"

    if modules_completed >= 12:
        adv_level = 4
    elif modules_completed >= 6:
        adv_level = 3
    elif modules_completed >= 2:
        adv_level = 2
    else:
        adv_level = 1

    level_names = {1: "Observer", 2: "Practitioner", 3: "Professional", 4: "Sovereign"}
    level_colors = {1: "#6B7280", 2: "#818CF8", 3: "#22C55E", 4: "#FBBF24"}

    return {
        "learning_toggle": toggle_on,
        "modality": modality,
        "intensity": intensity,
        "advancement": {
            "level": adv_level,
            "name": level_names.get(adv_level, "Observer"),
            "color": level_colors.get(adv_level, "#6B7280"),
            "modules_completed": modules_completed,
            "next_level_at": {1: 2, 2: 6, 3: 12, 4: None}.get(adv_level),
        },
        "subscription_tier": tier,
        "domain_levels": comm.get("domain_levels", {}) if comm else {},
    }
