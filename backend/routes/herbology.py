from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone
import uuid

router = APIRouter()

HERBS = [
    {"id": "ashwagandha", "name": "Ashwagandha", "latin": "Withania somnifera", "color": "#FB923C",
     "family": "Nightshade", "parts_used": "Root",
     "properties": ["Adaptogen", "Anti-stress", "Immune modulator", "Strength builder"],
     "taste": "Bitter, astringent", "energy": "Warming",
     "systems": ["Nervous", "Endocrine", "Immune", "Reproductive"],
     "preparations": ["Powder in warm milk", "Capsules", "Tincture", "Decoction"],
     "traditional_use": "Ayurvedic rasayana (rejuvenation) herb. Used for over 3,000 years to relieve stress, increase energy, and improve concentration.",
     "dosage": "300-600mg root extract daily, or 1-2 tsp powder in warm milk",
     "caution": "Avoid during pregnancy. May interact with thyroid medications.",
     "spiritual": "Grounding warrior energy, builds ojas (vital essence), enhances meditation stamina"},
    {"id": "turmeric", "name": "Turmeric", "latin": "Curcuma longa", "color": "#FCD34D",
     "family": "Ginger", "parts_used": "Rhizome",
     "properties": ["Anti-inflammatory", "Antioxidant", "Liver support", "Joint health"],
     "taste": "Bitter, pungent", "energy": "Warming",
     "systems": ["Digestive", "Circulatory", "Immune", "Musculoskeletal"],
     "preparations": ["Golden milk", "Fresh grated in food", "Capsules", "Paste"],
     "traditional_use": "Sacred herb in Ayurveda and Traditional Chinese Medicine. Used to purify the blood, heal wounds, and reduce inflammation for millennia.",
     "dosage": "1-3g powder daily with black pepper for absorption",
     "caution": "High doses may thin blood. Consult before surgery.",
     "spiritual": "Purification, solar energy, prosperity, aura cleansing"},
    {"id": "holy_basil", "name": "Holy Basil (Tulsi)", "latin": "Ocimum tenuiflorum", "color": "#22C55E",
     "family": "Mint", "parts_used": "Leaves, seeds",
     "properties": ["Adaptogen", "Respiratory", "Anti-microbial", "Stress relief"],
     "taste": "Pungent, bitter", "energy": "Warming",
     "systems": ["Nervous", "Respiratory", "Immune", "Digestive"],
     "preparations": ["Tea", "Fresh leaves", "Tincture", "Essential oil"],
     "traditional_use": "Sacred plant in Hinduism, grown in every household. Called 'The Incomparable One' - used for 5,000+ years as a gateway between heaven and earth.",
     "dosage": "2-3 cups tea daily, or 300-600mg extract",
     "caution": "May affect fertility. Avoid large amounts during pregnancy.",
     "spiritual": "Protection, devotion, opens the heart, sacred to Vishnu"},
    {"id": "reishi", "name": "Reishi Mushroom", "latin": "Ganoderma lucidum", "color": "#92400E",
     "family": "Polyporaceae", "parts_used": "Fruiting body",
     "properties": ["Immune modulator", "Calming", "Liver support", "Longevity"],
     "taste": "Bitter", "energy": "Neutral to warming",
     "systems": ["Immune", "Nervous", "Liver", "Cardiovascular"],
     "preparations": ["Decoction (simmered 2+ hours)", "Dual extract tincture", "Powder", "Capsules"],
     "traditional_use": "Called 'Mushroom of Immortality' in Chinese medicine. Used for over 2,000 years by Taoist monks to nourish the spirit (Shen) and promote calm wisdom.",
     "dosage": "1-3g dried mushroom daily, or per extract instructions",
     "caution": "May interact with blood thinners and immunosuppressants.",
     "spiritual": "Spiritual potency, Shen tonic, connecting to cosmic consciousness"},
    {"id": "chamomile", "name": "Chamomile", "latin": "Matricaria chamomilla", "color": "#93C5FD",
     "family": "Daisy", "parts_used": "Flowers",
     "properties": ["Calming", "Digestive", "Anti-inflammatory", "Sleep aid"],
     "taste": "Slightly bitter, sweet", "energy": "Cooling",
     "systems": ["Nervous", "Digestive", "Skin", "Immune"],
     "preparations": ["Tea", "Tincture", "Compress", "Bath soak"],
     "traditional_use": "Ancient Egyptian, Greek, and Roman remedy. Dedicated to the sun god Ra. One of the most widely used medicinal plants in human history.",
     "dosage": "2-4 cups tea daily, or 1-2ml tincture 3x daily",
     "caution": "Ragweed allergy cross-reaction possible.",
     "spiritual": "Sun energy, prosperity, peace, purification"},
    {"id": "ginger", "name": "Ginger", "latin": "Zingiber officinale", "color": "#F97316",
     "family": "Ginger", "parts_used": "Rhizome",
     "properties": ["Digestive", "Anti-nausea", "Circulatory", "Warming"],
     "taste": "Pungent, sweet", "energy": "Warming",
     "systems": ["Digestive", "Circulatory", "Respiratory", "Immune"],
     "preparations": ["Fresh tea", "Grated in food", "Capsules", "Crystallized"],
     "traditional_use": "Called 'universal medicine' in Ayurveda. Used in virtually every healing tradition worldwide for over 5,000 years.",
     "dosage": "1-4g fresh root daily, or 250mg extract 4x daily",
     "caution": "May increase bleeding risk. Moderate with blood thinners.",
     "spiritual": "Fire element, success, power, purification of intentions"},
    {"id": "valerian", "name": "Valerian", "latin": "Valeriana officinalis", "color": "#A78BFA",
     "family": "Valerian", "parts_used": "Root",
     "properties": ["Sedative", "Anti-anxiety", "Sleep aid", "Muscle relaxant"],
     "taste": "Bitter, pungent", "energy": "Warming",
     "systems": ["Nervous", "Musculoskeletal"],
     "preparations": ["Tea (strong taste)", "Tincture", "Capsules", "Bath"],
     "traditional_use": "Used since ancient Greece and Rome. Hippocrates described its properties. Name derives from Latin 'valere' meaning 'to be strong/well.'",
     "dosage": "300-600mg extract before bed, or 2-3g dried root as tea",
     "caution": "May cause vivid dreams. Do not combine with sedatives.",
     "spiritual": "Protection, purification, self-empowerment, dream work"},
    {"id": "echinacea", "name": "Echinacea", "latin": "Echinacea purpurea", "color": "#EC4899",
     "family": "Daisy", "parts_used": "Root, flowers, leaves",
     "properties": ["Immune stimulant", "Anti-viral", "Anti-bacterial", "Lymphatic"],
     "taste": "Slightly sweet, tingling", "energy": "Cooling",
     "systems": ["Immune", "Lymphatic", "Respiratory"],
     "preparations": ["Tea", "Tincture", "Capsules", "Fresh juice"],
     "traditional_use": "Sacred medicine of Native American Plains tribes. Used for over 400 years for infections, wounds, and snake bites.",
     "dosage": "Start at first sign of illness. 2-4ml tincture 3x daily for up to 10 days.",
     "caution": "Avoid with autoimmune conditions. Not for long-term continuous use.",
     "spiritual": "Strengthening inner power, boosting spiritual immunity"},
    {"id": "passionflower", "name": "Passionflower", "latin": "Passiflora incarnata", "color": "#818CF8",
     "family": "Passion", "parts_used": "Aerial parts",
     "properties": ["Calming", "Anti-anxiety", "Sleep aid", "Antispasmodic"],
     "taste": "Slightly bitter", "energy": "Cooling",
     "systems": ["Nervous", "Musculoskeletal"],
     "preparations": ["Tea", "Tincture", "Capsules", "Glycerite"],
     "traditional_use": "Used by Native Americans for centuries. Spanish missionaries named it for Christ's passion. A gentle but effective nervine.",
     "dosage": "1-2 cups tea before bed, or 1-2ml tincture",
     "caution": "Avoid with sedative medications. May cause drowsiness.",
     "spiritual": "Peace, higher love, spiritual devotion, calming the monkey mind"},
    {"id": "nettle", "name": "Stinging Nettle", "latin": "Urtica dioica", "color": "#16A34A",
     "family": "Nettle", "parts_used": "Leaves, root, seeds",
     "properties": ["Nutritive", "Anti-allergic", "Kidney tonic", "Blood builder"],
     "taste": "Slightly salty, earthy", "energy": "Cooling/drying",
     "systems": ["Kidney/Urinary", "Blood", "Immune", "Musculoskeletal"],
     "preparations": ["Long infusion (4+ hours)", "Dried in food", "Tincture", "Fresh steamed"],
     "traditional_use": "One of humanity's oldest allies. Used across every continent for food, fiber, and medicine. A supreme nutritive tonic.",
     "dosage": "1-2 cups long infusion daily, or 2-4ml tincture 3x daily",
     "caution": "Wear gloves when harvesting fresh. May lower blood sugar.",
     "spiritual": "Protection, courage, boundary setting, Earth connection"},
    {"id": "elderberry", "name": "Elderberry", "latin": "Sambucus nigra", "color": "#6D28D9",
     "family": "Adoxaceae", "parts_used": "Berries, flowers",
     "properties": ["Antiviral", "Immune boost", "Antioxidant", "Fever reducer"],
     "taste": "Sweet, slightly tart", "energy": "Cooling",
     "systems": ["Immune", "Respiratory"],
     "preparations": ["Syrup", "Tea", "Tincture", "Gummies"],
     "traditional_use": "Called the 'medicine chest' of the country people. Revered across European folk traditions. Hippocrates called the elder tree his medicine chest.",
     "dosage": "1 tablespoon syrup 2-4x daily during illness",
     "caution": "Never consume raw berries. Always cook. Avoid unripe berries.",
     "spiritual": "Fairy magic, protection, transformation, elder wisdom"},
    {"id": "lions_mane", "name": "Lion's Mane", "latin": "Hericium erinaceus", "color": "#E5E7EB",
     "family": "Hericiaceae", "parts_used": "Fruiting body",
     "properties": ["Nootropic", "Nerve regeneration", "Focus", "Gut healing"],
     "taste": "Mild, seafood-like", "energy": "Neutral",
     "systems": ["Nervous", "Digestive", "Immune"],
     "preparations": ["Dual extract tincture", "Powder in coffee", "Capsules", "Cooked fresh"],
     "traditional_use": "Used by Buddhist monks to enhance focus during meditation. Revered in Chinese medicine for brain and gut health.",
     "dosage": "500mg-3g daily, or as tincture",
     "caution": "Generally very safe. Start low if sensitive to mushrooms.",
     "spiritual": "Mental clarity, third eye activation, wisdom seeking"},
]


@router.get("/herbology/herbs")
async def get_herbs():
    return {"herbs": HERBS}


@router.get("/herbology/herb/{herb_id}")
async def get_herb(herb_id: str):
    herb = next((h for h in HERBS if h["id"] == herb_id), None)
    if not herb:
        raise HTTPException(status_code=404, detail="Herb not found")
    return herb


@router.get("/herbology/by-system/{system}")
async def get_herbs_by_system(system: str):
    matches = [h for h in HERBS if any(system.lower() in s.lower() for s in h["systems"])]
    return {"herbs": matches, "system": system}


@router.post("/herbology/cabinet")
async def save_to_cabinet(data: dict = Body(...), user=Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "herb_id": data.get("herb_id"),
        "notes": data.get("notes", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.herb_cabinet.insert_one(doc)
    return {"status": "saved", "id": doc["id"]}


@router.get("/herbology/cabinet")
async def get_cabinet(user=Depends(get_current_user)):
    items = await db.herb_cabinet.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    return {"cabinet": items}


@router.delete("/herbology/cabinet/{item_id}")
async def remove_from_cabinet(item_id: str, user=Depends(get_current_user)):
    await db.herb_cabinet.delete_one({"id": item_id, "user_id": user["id"]})
    return {"status": "removed"}
