from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone
import uuid

router = APIRouter()

ELIXIRS = [
    {"id": "golden_milk", "name": "Golden Milk", "category": "healing_latte", "color": "#FCD34D",
     "subtitle": "The Ancient Ayurvedic Elixir",
     "ingredients": ["1 cup warm plant milk", "1 tsp turmeric", "1/2 tsp cinnamon", "Pinch black pepper", "1 tsp honey or maple", "1/2 tsp ghee or coconut oil"],
     "instructions": "Warm milk gently (don't boil). Whisk in turmeric, cinnamon, pepper, and oil. Sweeten to taste. Sip slowly and mindfully.",
     "benefits": ["Anti-inflammatory", "Sleep aid", "Joint health", "Immune boost", "Mood lift"],
     "best_time": "Evening", "prep_time": "5 min",
     "tradition": "Ayurveda - used for thousands of years as a nourishing nightcap",
     "intention": "Warmth, healing, inner glow"},
    {"id": "moon_milk", "name": "Moon Milk", "category": "healing_latte", "color": "#C084FC",
     "subtitle": "Lunar Sleep Potion",
     "ingredients": ["1 cup warm oat milk", "1 tsp ashwagandha", "1/2 tsp cinnamon", "1/4 tsp nutmeg", "1 tsp rose water", "1 tsp honey", "Pinch cardamom"],
     "instructions": "Warm oat milk. Add ashwagandha, spices, and rose water. Whisk until frothy. Add honey last. Drink 30 minutes before sleep.",
     "benefits": ["Deep sleep", "Stress relief", "Hormonal balance", "Nervous system calm"],
     "best_time": "Before bed", "prep_time": "5 min",
     "tradition": "Ayurvedic Rasayana - nourishing the body during moon cycles",
     "intention": "Surrender, rest, lunar wisdom"},
    {"id": "fire_cider", "name": "Fire Cider", "category": "tonic", "color": "#EF4444",
     "subtitle": "Immune-Boosting Vinegar Tonic",
     "ingredients": ["Apple cider vinegar base", "Fresh ginger root", "Fresh turmeric root", "Horseradish", "Garlic cloves", "Onion", "Cayenne pepper", "Raw honey"],
     "instructions": "Chop all roots and aromatics. Pack into jar, cover with ACV. Infuse 4-6 weeks, shaking daily. Strain and add honey. Take 1-2 tbsp daily.",
     "benefits": ["Immune power", "Circulation", "Digestive fire", "Antimicrobial", "Vitamin-rich"],
     "best_time": "Morning", "prep_time": "20 min + 4 weeks infusion",
     "tradition": "Folk herbalism - centuries-old kitchen medicine",
     "intention": "Strength, vitality, warrior energy"},
    {"id": "chaga_chai", "name": "Chaga Chai", "category": "medicinal_tea", "color": "#92400E",
     "subtitle": "Adaptogenic Forest Brew",
     "ingredients": ["2 cups water", "1 tbsp chaga chunks or powder", "1 cinnamon stick", "3 cardamom pods", "2 cloves", "Fresh ginger slice", "Star anise", "Plant milk to taste"],
     "instructions": "Simmer chaga in water for 20+ minutes (longer = stronger). Add spices for last 5 minutes. Strain. Add warm plant milk and sweetener.",
     "benefits": ["Immune modulation", "Antioxidant-rich", "Energy without caffeine", "Anti-inflammatory"],
     "best_time": "Morning or afternoon", "prep_time": "25 min",
     "tradition": "Siberian/Russian folk medicine - 'King of Medicinal Mushrooms'",
     "intention": "Grounded power, forest wisdom"},
    {"id": "green_goddess", "name": "Green Goddess Smoothie", "category": "smoothie", "color": "#22C55E",
     "subtitle": "Chlorophyll Life Force",
     "ingredients": ["1 cup spinach", "1/2 avocado", "1 banana", "1 tbsp spirulina", "1 cup coconut water", "1 tbsp hemp seeds", "Fresh mint leaves", "Squeeze of lime"],
     "instructions": "Blend greens and liquid first until smooth. Add remaining ingredients. Blend until creamy. Drink immediately for maximum nutrition.",
     "benefits": ["Detoxification", "Energy", "Mineral-rich", "Brain food", "Alkalizing"],
     "best_time": "Morning", "prep_time": "5 min",
     "tradition": "Modern wellness, inspired by Ayurvedic green rasayana",
     "intention": "Vitality, renewal, earth connection"},
    {"id": "cacao_ceremony", "name": "Ceremonial Cacao", "category": "ceremonial", "color": "#7C2D12",
     "subtitle": "Heart-Opening Sacred Drink",
     "ingredients": ["1.5 oz ceremonial grade cacao", "1 cup hot water", "Pinch cayenne", "1/2 tsp cinnamon", "1 tsp honey", "Pinch sea salt", "Optional: rose petals, vanilla"],
     "instructions": "Grate or chop cacao. Heat water to just below boiling. Whisk cacao into water until smooth. Add spices and sweetener. Set an intention before drinking.",
     "benefits": ["Heart opening", "Mood elevation", "Focus", "Magnesium-rich", "Theobromine energy"],
     "best_time": "Morning ritual or ceremony", "prep_time": "10 min",
     "tradition": "Mayan/Aztec sacred medicine - 'Food of the Gods' (theobroma)",
     "intention": "Heart opening, gratitude, creative flow"},
    {"id": "reishi_hot_choc", "name": "Reishi Hot Chocolate", "category": "healing_latte", "color": "#6D28D9",
     "subtitle": "Mushroom of Immortality Elixir",
     "ingredients": ["1 cup oat milk", "1 tbsp cacao powder", "1 tsp reishi extract", "1/2 tsp maca powder", "1 tsp maple syrup", "Pinch cinnamon", "Pinch sea salt"],
     "instructions": "Warm milk gently. Whisk in cacao, reishi, and maca. Add sweetener and spices. Whisk until frothy. Sip slowly in stillness.",
     "benefits": ["Calm energy", "Immune support", "Stress resilience", "Deep sleep", "Longevity"],
     "best_time": "Evening", "prep_time": "5 min",
     "tradition": "Chinese Taoist medicine meets Mesoamerican cacao tradition",
     "intention": "Immortal spirit, peaceful strength"},
    {"id": "lemon_ginger_shot", "name": "Lemon Ginger Wellness Shot", "category": "tonic", "color": "#FDE047",
     "subtitle": "Morning Lightning Bolt",
     "ingredients": ["Juice of 1 lemon", "1 inch fresh ginger (juiced)", "Pinch cayenne", "1 tsp raw honey", "1 tsp apple cider vinegar"],
     "instructions": "Juice ginger. Combine all ingredients. Take as a quick shot. Follow with warm water.",
     "benefits": ["Digestive fire", "Immune boost", "Alkalizing", "Energizing", "Detox kickstart"],
     "best_time": "First thing in morning", "prep_time": "3 min",
     "tradition": "Naturopathic medicine and Ayurvedic digestive practices",
     "intention": "Awakening, purification, daily reset"},
    {"id": "tulsi_rose", "name": "Tulsi Rose Tea", "category": "medicinal_tea", "color": "#FDA4AF",
     "subtitle": "Heart & Spirit Soother",
     "ingredients": ["1 tbsp dried tulsi (holy basil)", "1 tsp dried rose petals", "1 tsp dried lavender", "2 cups hot water", "Honey to taste"],
     "instructions": "Place herbs in teapot. Pour hot water over (not boiling). Steep 5-7 minutes covered. Strain and sweeten. Inhale aroma before sipping.",
     "benefits": ["Stress relief", "Heart soothing", "Immune support", "Hormonal balance"],
     "best_time": "Afternoon or evening", "prep_time": "7 min",
     "tradition": "Ayurvedic Tulsi combined with Persian rose medicine",
     "intention": "Devotion, self-love, gentle strength"},
    {"id": "matcha_zen", "name": "Zen Matcha Ceremony", "category": "ceremonial", "color": "#86EFAC",
     "subtitle": "Focused Calm Energy",
     "ingredients": ["1.5 tsp ceremonial matcha", "2 oz hot water (175F)", "6 oz warm oat milk", "1 tsp honey", "Optional: vanilla"],
     "instructions": "Sift matcha into bowl. Add hot water. Whisk vigorously in W-motion until frothy. Warm milk separately. Pour matcha over milk. Sweeten.",
     "benefits": ["Calm alertness", "L-theanine focus", "Antioxidant-rich", "Metabolism boost"],
     "best_time": "Morning", "prep_time": "5 min",
     "tradition": "Japanese Zen Buddhist tea ceremony - Chanoyu",
     "intention": "Presence, mindfulness, harmonious energy"},
]

DRINK_CATEGORIES = [
    {"id": "healing_latte", "name": "Healing Lattes", "desc": "Warm, nurturing milk-based elixirs", "color": "#FCD34D"},
    {"id": "medicinal_tea", "name": "Medicinal Teas", "desc": "Herbal infusions for specific healing", "color": "#22C55E"},
    {"id": "tonic", "name": "Tonics & Shots", "desc": "Concentrated wellness boosters", "color": "#EF4444"},
    {"id": "smoothie", "name": "Healing Smoothies", "desc": "Nutrient-dense blended drinks", "color": "#3B82F6"},
    {"id": "ceremonial", "name": "Ceremonial Drinks", "desc": "Sacred and ritual beverages", "color": "#C084FC"},
]


@router.get("/elixirs/all")
async def get_all_elixirs():
    return {"elixirs": ELIXIRS, "categories": DRINK_CATEGORIES}


@router.get("/elixirs/category/{category_id}")
async def get_elixirs_by_category(category_id: str):
    filtered = [e for e in ELIXIRS if e["category"] == category_id]
    return {"elixirs": filtered, "category": category_id}


@router.get("/elixirs/{elixir_id}")
async def get_elixir(elixir_id: str):
    elixir = next((e for e in ELIXIRS if e["id"] == elixir_id), None)
    if not elixir:
        raise HTTPException(status_code=404, detail="Elixir not found")
    return elixir


@router.post("/elixirs/favorites")
async def save_elixir_fav(data: dict = Body(...), user=Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "elixir_id": data.get("elixir_id"),
        "rating": data.get("rating", 5),
        "notes": data.get("notes", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.elixir_favorites.insert_one(doc)
    return {"status": "saved", "id": doc["id"]}


@router.get("/elixirs/favorites/my")
async def get_elixir_favs(user=Depends(get_current_user)):
    favs = await db.elixir_favorites.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    return {"favorites": favs}
