from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from emergentintegrations.llm.chat import LlmChat, UserMessage
from datetime import datetime, timezone
import uuid
import asyncio
import random

router = APIRouter()

MEAL_TEMPLATES = {
    "energizing": {
        "name": "Energizing Vitality",
        "color": "#FB923C",
        "focus": "High-prana foods for energy and alertness",
        "meals": [
            {"meal": "breakfast", "name": "Sunrise Power Bowl", "items": ["Overnight oats with chia seeds", "Fresh berries and banana", "Almond butter drizzle", "Bee pollen sprinkle", "Cinnamon and turmeric"], "intention": "Ignite your digestive fire"},
            {"meal": "lunch", "name": "Warrior's Feast", "items": ["Quinoa and roasted sweet potato bowl", "Sauteed kale with garlic", "Chickpeas with cumin", "Tahini dressing", "Avocado slices"], "intention": "Sustained strength and focus"},
            {"meal": "snack", "name": "Prana Bites", "items": ["Trail mix (almonds, goji berries, cacao nibs)", "Green apple slices", "Raw honey"], "intention": "Quick energy without crash"},
            {"meal": "dinner", "name": "Earth & Fire Plate", "items": ["Grilled tempeh or salmon", "Brown rice", "Roasted root vegetables", "Steamed broccoli", "Ginger-tamari sauce"], "intention": "Nourish and restore"}
        ]
    },
    "calming": {
        "name": "Calm & Centered",
        "color": "#93C5FD",
        "focus": "Sattvic foods for peace of mind and restful sleep",
        "meals": [
            {"meal": "breakfast", "name": "Peaceful Morning Porridge", "items": ["Warm rice porridge or oatmeal", "Stewed apples with cinnamon", "Ghee or coconut oil", "Cardamom and rose water", "Maple syrup"], "intention": "Gentle awakening"},
            {"meal": "lunch", "name": "Garden of Peace", "items": ["Kitchari (mung dal and rice)", "Steamed seasonal vegetables", "Fresh cilantro chutney", "Warm flatbread", "Cooling cucumber raita"], "intention": "Balance and harmony"},
            {"meal": "snack", "name": "Serenity Snack", "items": ["Chamomile tea", "Dates stuffed with almond butter", "Fresh figs"], "intention": "Afternoon reset"},
            {"meal": "dinner", "name": "Moonlight Supper", "items": ["Light vegetable soup", "Steamed asparagus", "Basmati rice with saffron", "Warm milk with nutmeg (after meal)"], "intention": "Prepare for deep rest"}
        ]
    },
    "detox": {
        "name": "Purification & Cleanse",
        "color": "#22C55E",
        "focus": "Light, cleansing foods to reset the body",
        "meals": [
            {"meal": "breakfast", "name": "Cleansing Dawn", "items": ["Warm lemon water on waking", "Green smoothie (spinach, celery, cucumber, apple, ginger)", "Chia pudding"], "intention": "Flush and renew"},
            {"meal": "lunch", "name": "Purity Bowl", "items": ["Raw salad with mixed greens", "Sprouts and microgreens", "Steamed quinoa", "Lemon-olive oil dressing", "Kimchi or sauerkraut"], "intention": "Living food, living energy"},
            {"meal": "snack", "name": "Renewal Juice", "items": ["Fresh-pressed green juice", "Celery, cucumber, parsley, lemon, ginger"], "intention": "Liquid light"},
            {"meal": "dinner", "name": "Gentle Reset", "items": ["Miso soup", "Steamed vegetables", "Small portion brown rice", "Pickled ginger"], "intention": "Light evening, easy digestion"}
        ]
    },
    "grounding": {
        "name": "Earth Grounding",
        "color": "#92400E",
        "focus": "Warm, heavy, rooted foods for stability and presence",
        "meals": [
            {"meal": "breakfast", "name": "Rooted Morning", "items": ["Warm sweet potato hash", "Scrambled eggs or tofu with turmeric", "Sauteed mushrooms", "Sourdough toast with butter", "Chai tea"], "intention": "Plant your roots for the day"},
            {"meal": "lunch", "name": "Harvest Table", "items": ["Lentil stew with root vegetables", "Warm crusty bread", "Roasted beets with goat cheese", "Fresh thyme and rosemary"], "intention": "The Earth provides"},
            {"meal": "snack", "name": "Grounding Bites", "items": ["Tahini and date balls", "Roasted nuts", "Dark chocolate square"], "intention": "Return to center"},
            {"meal": "dinner", "name": "Hearth & Home", "items": ["Slow-cooked bean chili or stew", "Cornbread", "Steamed greens", "Warm bone or vegetable broth"], "intention": "Nourishment for the soul"}
        ]
    },
    "heart_opening": {
        "name": "Heart-Opening Feast",
        "color": "#FDA4AF",
        "focus": "Foods that nourish the heart chakra and promote love",
        "meals": [
            {"meal": "breakfast", "name": "Rose Dawn", "items": ["Acai bowl with berry compote", "Rose water granola", "Sliced strawberries and raspberries", "Hemp hearts", "Drizzle of pomegranate molasses"], "intention": "Open your heart to the day"},
            {"meal": "lunch", "name": "Love Garden", "items": ["Buddha bowl with pink rice", "Roasted beets and carrots", "Edamame and avocado", "Pomegranate seeds", "Rose-infused vinaigrette"], "intention": "Nourish with love"},
            {"meal": "snack", "name": "Heart Treats", "items": ["Dark chocolate with sea salt", "Fresh raspberries", "Green tea with jasmine"], "intention": "Sweetness of self-love"},
            {"meal": "dinner", "name": "Compassion Table", "items": ["Wild-caught salmon or marinated tofu", "Roasted pink vegetables (beets, radish)", "Leafy green salad", "Olive oil and lemon", "Fresh herbs"], "intention": "Feed the body, heal the heart"}
        ]
    },
}


@router.get("/meals/plans")
async def get_meal_plans():
    plans = []
    for key, plan in MEAL_TEMPLATES.items():
        plans.append({"id": key, "name": plan["name"], "color": plan["color"], "focus": plan["focus"], "meal_count": len(plan["meals"])})
    return {"plans": plans}


@router.get("/meals/plan/{plan_id}")
async def get_meal_plan(plan_id: str):
    plan = MEAL_TEMPLATES.get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return {"id": plan_id, **plan}


@router.post("/meals/log")
async def log_meal(data: dict = Body(...), user=Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "meal_type": data.get("meal_type", "lunch"),
        "plan_id": data.get("plan_id"),
        "items": data.get("items", []),
        "notes": data.get("notes", ""),
        "mood_before": data.get("mood_before", ""),
        "mood_after": data.get("mood_after", ""),
        "mindful_eating": data.get("mindful_eating", False),
        "gratitude": data.get("gratitude", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.meal_logs.insert_one(doc)
    return {"status": "logged", "id": doc["id"]}


@router.get("/meals/log")
async def get_meal_logs(user=Depends(get_current_user)):
    logs = await db.meal_logs.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return {"logs": logs}


@router.delete("/meals/log/{log_id}")
async def delete_meal_log(log_id: str, user=Depends(get_current_user)):
    await db.meal_logs.delete_one({"id": log_id, "user_id": user["id"]})
    return {"status": "deleted"}


@router.post("/meals/suggest")
async def suggest_meal(data: dict = Body(...), user=Depends(get_current_user)):
    mood = data.get("mood", "balanced")
    dietary = data.get("dietary", "no restrictions")
    time_of_day = data.get("time_of_day", "lunch")
    try:
        chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"meal-{uuid.uuid4()}",
                        system_message="You are a holistic nutritionist combining Ayurveda, Traditional Chinese Medicine, and modern nutrition science. Suggest a meal that nourishes both body and spirit. Be specific with ingredients and brief preparation. Include the energetic/spiritual quality of the meal.")
        chat.with_model("gemini", "gemini-3-flash-preview")
        prompt = f"Suggest a {time_of_day} meal for someone feeling {mood}. Dietary preference: {dietary}. Include: dish name, ingredients list, brief prep steps, and the energetic intention/benefit."
        response = await asyncio.wait_for(chat.send_message(UserMessage(text=prompt)), timeout=30)
        return {"suggestion": response}
    except Exception as e:
        logger.error(f"Meal suggestion error: {e}")
        fallback_plan = random.choice(list(MEAL_TEMPLATES.values()))
        fallback_meal = next((m for m in fallback_plan["meals"] if m["meal"] == time_of_day), fallback_plan["meals"][0])
        return {"suggestion": f"**{fallback_meal['name']}**\n\nIngredients:\n" + "\n".join(f"- {i}" for i in fallback_meal["items"]) + f"\n\nIntention: {fallback_meal['intention']}"}
