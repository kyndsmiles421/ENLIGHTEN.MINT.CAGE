from fastapi import APIRouter, Depends
from deps import db, get_current_user
from datetime import datetime, timezone
import uuid

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
async def send_blessing(data: dict, user=Depends(get_current_user)):
    template = next((t for t in BLESSING_TEMPLATES if t["id"] == data.get("template_id")), None)
    blessing = {
        "id": str(uuid.uuid4()),
        "from_user_id": user["id"],
        "from_name": user.get("name", "Anonymous Soul"),
        "to_name": data.get("to_name", "A Beautiful Soul"),
        "template_id": data.get("template_id", ""),
        "category": template["category"] if template else data.get("category", ""),
        "text": template["text"] if template else "",
        "custom_message": data.get("custom_message", ""),
        "color": template["color"] if template else "#C084FC",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.blessings.insert_one({**blessing})
    blessing.pop("_id", None)
    return {"status": "sent", "blessing": blessing}


@router.get("/blessings/feed")
async def get_blessing_feed():
    blessings = await db.blessings.find(
        {}, {"_id": 0}
    ).sort("created_at", -1).to_list(30)
    return blessings
