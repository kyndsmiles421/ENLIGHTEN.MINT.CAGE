from fastapi import APIRouter, Depends, Body, HTTPException
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone
import uuid
import asyncio

router = APIRouter()

BLESSING_TEMPLATES = [
    {"id": "peace", "category": "Peace", "text": "May peace surround you like a warm embrace. May your mind be still and your heart be full.", "color": "#2DD4BF"},
    {"id": "healing", "category": "Healing", "text": "May healing light flow through every cell of your being. You are whole, you are restored.", "color": "#22C55E"},
    {"id": "protection", "category": "Protection", "text": "May you be shielded from all harm. A circle of divine light surrounds and protects you always.", "color": "#8B5CF6"},
    {"id": "abundance", "category": "Abundance", "text": "May abundance flow to you in all forms — love, health, joy, and prosperity. The universe provides.", "color": "#FCD34D"},
    {"id": "strength", "category": "Strength", "text": "May you find unshakable strength within. You are braver than you believe and stronger than you know.", "color": "#EF4444"},
    {"id": "love", "category": "Love", "text": "May unconditional love fill your heart and radiate to all you meet. You are deeply, infinitely loved.", "color": "#C084FC"},
    {"id": "clarity", "category": "Clarity", "text": "May the fog lift and your path become clear. Trust your inner wisdom — it has never failed you.", "color": "#3B82F6"},
    {"id": "joy", "category": "Joy", "text": "May laughter find you in unexpected places. May joy bubble up from the deepest part of your soul.", "color": "#FB923C"},
    {"id": "gratitude", "category": "Gratitude", "text": "May you see the sacred in the ordinary. Every breath is a gift, every moment a blessing.", "color": "#06B6D4"},
    {"id": "rest", "category": "Rest", "text": "May your body release all tension. May your spirit find the deep rest it deserves tonight.", "color": "#6366F1"},
    {"id": "courage", "category": "Courage", "text": "May courage rise within you when you need it most. You were made for this moment.", "color": "#F59E0B"},
    {"id": "forgiveness", "category": "Forgiveness", "text": "May you release what weighs heavy on your heart. Forgiveness is the key that sets your spirit free.", "color": "#10B981"},
]


@router.get("/blessings/templates")
async def get_templates():
    return BLESSING_TEMPLATES


@router.post("/blessings/send")
async def send_blessing(data: dict = Body(...), user=Depends(get_current_user)):
    template = next((t for t in BLESSING_TEMPLATES if t["id"] == data.get("template_id")), None)
    blessing = {
        "id": str(uuid.uuid4()),
        "from_user_id": user["id"],
        "from_name": user.get("name", "Anonymous Soul"),
        "to_name": data.get("to_name", "A Beautiful Soul"),
        "to_user_id": data.get("to_user_id", ""),
        "template_id": data.get("template_id", ""),
        "category": template["category"] if template else data.get("category", "Custom"),
        "text": data.get("text") or (template["text"] if template else ""),
        "custom_message": data.get("custom_message", ""),
        "color": template["color"] if template else data.get("color", "#C084FC"),
        "is_ai_generated": data.get("is_ai_generated", False),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.blessings.insert_one({**blessing})
    blessing.pop("_id", None)

    # Create in-app notification for recipient
    to_user_id = data.get("to_user_id", "")
    if to_user_id:
        notif = {
            "id": str(uuid.uuid4()),
            "user_id": to_user_id,
            "type": "blessing",
            "title": "New Blessing Received",
            "message": f"{blessing['from_name']} sent you a blessing: \"{blessing['text'][:80]}...\"" if len(blessing['text']) > 80 else f"{blessing['from_name']} sent you a blessing: \"{blessing['text']}\"",
            "color": blessing["color"],
            "link": "/blessings",
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.in_app_notifications.insert_one({**notif})
        notif.pop("_id", None)

        # Send push notification
        try:
            from routes.notifications import send_push_to_user
            await send_push_to_user(
                to_user_id,
                f"Blessing from {blessing['from_name']}",
                blessing["text"][:120],
                "/blessings",
                "blessing",
            )
        except Exception:
            pass

    return {"status": "sent", "blessing": blessing}


@router.get("/blessings/feed")
async def get_blessing_feed():
    blessings = await db.blessings.find(
        {}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return blessings


@router.get("/blessings/my-sent")
async def get_my_sent(user=Depends(get_current_user)):
    """Get blessings sent by the current user."""
    blessings = await db.blessings.find(
        {"from_user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return {"blessings": blessings, "count": len(blessings)}


@router.get("/blessings/my-received")
async def get_my_received(user=Depends(get_current_user)):
    """Get blessings received by the current user (matched by name or user_id)."""
    user_doc = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    name = user_doc.get("name", "") if user_doc else ""
    query = {"$or": [{"to_user_id": user["id"]}]}
    if name:
        query["$or"].append({"to_name": {"$regex": name, "$options": "i"}})
    blessings = await db.blessings.find(query, {"_id": 0}).sort("created_at", -1).to_list(50)
    return {"blessings": blessings, "count": len(blessings)}


@router.post("/blessings/generate")
async def generate_ai_blessing(data: dict = Body(...), user=Depends(get_current_user)):
    """AI generates a personalized blessing based on category and optional context."""
    category = data.get("category", "peace")
    to_name = data.get("to_name", "a beautiful soul")
    context = data.get("context", "")

    prompt = (
        f"You are a compassionate spiritual guide. Write a unique, heartfelt blessing for {to_name} "
        f"focused on the theme of '{category}'. "
        + (f"Additional context: {context}. " if context else "")
        + "The blessing should be 2-3 sentences, poetic but sincere, using sacred/spiritual language. "
        "Do NOT use quotes around it. Write it directly."
    )

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"blessing-{uuid.uuid4().hex[:8]}",
            system_message="You are a compassionate spiritual guide who writes heartfelt blessings."
        )
        chat.with_model("gemini", "gemini-3-flash-preview")
        response = await asyncio.wait_for(chat.send_message(UserMessage(text=prompt)), timeout=20)
        return {"blessing_text": response.strip(), "category": category}
    except Exception as e:
        logger.error(f"AI blessing generation error: {e}")
        # Fallback to template
        tmpl = next((t for t in BLESSING_TEMPLATES if t["category"].lower() == category.lower()), BLESSING_TEMPLATES[0])
        return {"blessing_text": tmpl["text"], "category": category, "fallback": True}


@router.get("/blessings/stats")
async def get_blessing_stats(user=Depends(get_current_user)):
    """Get user's blessing activity stats."""
    sent_count = await db.blessings.count_documents({"from_user_id": user["id"]})
    user_doc = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    name = user_doc.get("name", "") if user_doc else ""
    query = {"$or": [{"to_user_id": user["id"]}]}
    if name:
        query["$or"].append({"to_name": {"$regex": name, "$options": "i"}})
    received_count = await db.blessings.count_documents(query)
    total_community = await db.blessings.count_documents({})
    return {
        "sent": sent_count,
        "received": received_count,
        "community_total": total_community,
    }
