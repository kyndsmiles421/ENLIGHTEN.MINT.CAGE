from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()
from models import MoodCreate, JournalCreate, AffirmationRequest, AIGenerateRequest
from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio
import random

@router.post("/moods")
async def create_mood(mood: MoodCreate, user=Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "mood": mood.mood,
        "intensity": mood.intensity,
        "note": mood.note,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.moods.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.get("/moods")
async def get_moods(user=Depends(get_current_user)):
    moods = await db.moods.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return moods

# --- Journal Routes ---
@router.post("/journal")
async def create_journal(entry: JournalCreate, user=Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "title": entry.title,
        "content": entry.content,
        "mood": entry.mood,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.journal.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.get("/journal")
async def get_journal(user=Depends(get_current_user)):
    entries = await db.journal.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return entries

@router.delete("/journal/{entry_id}")
async def delete_journal(entry_id: str, user=Depends(get_current_user)):
    result = await db.journal.delete_one({"id": entry_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"deleted": True}

# --- Affirmation Routes ---
@router.get("/affirmations/daily")
async def get_daily_affirmation():
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    existing = await db.affirmations.find_one({"date": today, "type": "daily"}, {"_id": 0})
    if existing:
        return existing
    affirmations = [
        "I am a beacon of light and love in this universe.",
        "Every breath I take fills me with peace and clarity.",
        "I release all that no longer serves my highest good.",
        "The universe conspires in my favor, always.",
        "I am connected to the infinite wisdom within me.",
        "My consciousness expands with every passing moment.",
        "I am worthy of all the beauty life has to offer.",
        "Peace flows through me like a gentle river.",
        "I trust the journey and embrace the unknown.",
        "My energy is a gift I share freely with the world."
    ]
    text = random.choice(affirmations)
    doc = {"id": str(uuid.uuid4()), "text": text, "date": today, "type": "daily", "created_at": datetime.now(timezone.utc).isoformat()}
    await db.affirmations.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.post("/affirmations/generate")
async def generate_affirmation(req: AffirmationRequest):
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"affirmation-{str(uuid.uuid4())}",
            system_message="You are a spiritual guide and mindfulness teacher. Generate a single powerful, uplifting affirmation that promotes inner peace, consciousness expansion, and positive energy. Keep it to 1-2 sentences. Do not use quotes around it. Be poetic and profound."
        )
        chat.with_model("openai", "gpt-5.2")
        msg = UserMessage(text=f"Generate a unique affirmation about: {req.theme}")
        response = await asyncio.wait_for(chat.send_message(msg), timeout=30)
        return {"text": response, "theme": req.theme, "generated": True}
    except Exception as e:
        logger.error(f"AI generation error: {e}")
        return {"text": "You are a luminous being of infinite potential, radiating peace in every direction.", "theme": req.theme, "generated": False}

# --- Exercises (Qigong, Tai Chi, etc.) ---
EXERCISES_DATA = [
    {
        "id": "qigong-standing",
        "name": "Standing Like a Tree (Zhan Zhuang)",
        "category": "qigong",
        "duration": "10-20 min",
        "level": "Beginner",
        "video_url": "https://www.youtube.com/embed/gUB-i92b6tY",
        "description": "The foundational Qigong posture, also known as 'Embracing the Tree'. This deceptively simple standing meditation is considered the single most important practice in internal martial arts and Qigong healing. By holding a static posture with proper alignment, you allow Qi to gather in the lower Dantian (energy center below the navel), strengthen the fascial network, and develop deep root connection with the earth. Masters practice this daily for up to an hour.",
        "philosophy": "In stillness, find the deepest movement. Zhan Zhuang teaches us that power comes not from effort, but from alignment with natural forces. Like a tree with deep roots, the practitioner becomes unshakable yet flexible.",
        "benefits": ["Builds Qi energy in the Dantian", "Strengthens legs, core, and deep stabilizers", "Calms the nervous system and reduces cortisol", "Improves posture and spinal alignment", "Develops energetic sensitivity", "Increases bone density"],
        "steps": [
            "Stand with feet parallel, shoulder-width apart, toes pointing straight forward. Feel even weight across both feet.",
            "Soften and unlock the knees, bending them slightly. Tuck the tailbone gently under — imagine sitting on the edge of a high stool.",
            "Let your arms rise to chest height, elbows slightly below shoulders, as if you are gently hugging a large balloon or tree trunk. Keep space under the armpits.",
            "Relax the shoulders completely — let them drop away from the ears. Soften the chest. The tongue touches the roof of the mouth behind the front teeth.",
            "Breathe naturally into the lower belly (Dantian, about 2 inches below the navel). Don't force the breath — let it settle into a slow, deep rhythm on its own.",
            "Soften your gaze, looking straight ahead or slightly downward. Half-close the eyes. Release tension from the jaw, face, and forehead.",
            "Hold this posture. Begin with 5 minutes and add 1-2 minutes each week. If trembling or heat arises, this is Qi moving — allow it.",
            "To close: slowly lower the arms, bring palms to rest over the lower belly. Stand quietly for 1-2 minutes, feeling the Qi settling."
        ],
        "tips": "If your shoulders ache, lower the arms slightly. The key is relaxation within structure. Pain means misalignment — adjust, don't push through.",
        "color": "#2DD4BF"
    },
    {
        "id": "qigong-eight-brocades",
        "name": "Eight Pieces of Brocade (Ba Duan Jin)",
        "category": "qigong",
        "duration": "15-25 min",
        "level": "Beginner",
        "video_url": "https://www.youtube.com/embed/3FJy0EDoYK0",
        "description": "One of the most widely practiced Qigong sets in the world, dating back over 800 years to the Song Dynasty. The 'Eight Brocades' (Ba Duan Jin) is a complete system of eight exercises that systematically work every organ, joint, and meridian in the body. Each movement targets specific organ systems according to Traditional Chinese Medicine, making this an ideal daily health maintenance routine. The movements are gentle enough for the elderly yet powerful enough to benefit martial artists.",
        "philosophy": "Like eight pieces of fine brocade silk, each movement is beautiful on its own yet together they form a complete tapestry of health. This practice reminds us that wellness requires attention to every aspect of our being.",
        "benefits": ["Stretches and strengthens the entire body", "Stimulates all major organ systems", "Balances Qi flow through all 12 primary meridians", "Reduces stress and muscular tension", "Improves digestion and immune function", "Enhances respiratory capacity"],
        "steps": [
            "Two Hands Hold Up the Heavens (Shuang Shou Tuo Tian): Interlace fingers, turn palms upward and press toward the sky as you rise onto your toes. Stretch the entire Triple Burner meridian. This regulates all three energy centers of the body. Hold for 3 breaths, lower, repeat 8 times.",
            "Drawing the Bow to Shoot the Eagle (Zuo You Kai Gong): Step into a wide horse stance. Extend one arm as if holding a bow, pull the other back as if drawing the string. Gaze at the extended finger. This opens the lungs and strengthens the arms. Alternate sides, 8 repetitions.",
            "Separating Heaven and Earth (Tiao Li Pi Wei): One palm presses up, the other presses down, stretching the stomach and spleen meridians along the sides. This directly improves digestion and nutrient absorption. Alternate arms, 8 repetitions.",
            "Wise Owl Gazes Backward (Wu Lao Qi Shang): Slowly turn your head to look behind you, first left then right. Keep shoulders still. This releases neck tension, stimulates the vagus nerve, and treats the 'five fatigues and seven injuries'. 8 repetitions each side.",
            "Sway the Head and Shake the Tail (Yao Tou Bai Wei): From a deep horse stance, lean forward and circle the upper body side to side, like an ox shaking off water. This releases excess heart fire and calms the spirit. 8 circles each direction.",
            "Two Hands Hold the Feet to Strengthen the Kidneys (Liang Shou Pan Zu): Reach down and hold the backs of your ankles or feet, then slowly rise, sliding hands up the backs of the legs and along the spine. This strengthens the kidneys and lower back. 8 repetitions.",
            "Clench the Fists and Glare Fiercely (Zan Quan Nu Mu): From horse stance, punch forward slowly with intensity while glaring with wide eyes. This builds liver Qi, releases frustration, and increases vitality. 8 punches each side.",
            "Bouncing on the Toes (Bei Hou Qi Dian): Rise up onto the balls of your feet, then drop your heels sharply to the ground. The vibration travels up through the bones and shakes loose stagnant energy. This is said to cure 100 diseases. Repeat 7 times."
        ],
        "tips": "Move slowly with your breath — inhale on expansive movements, exhale on contracting ones. Quality over quantity. Even 1 round done mindfully is more valuable than 10 done mechanically.",
        "color": "#14B8A6"
    },
    {
        "id": "taichi-cloud-hands",
        "name": "Cloud Hands (Yun Shou)",
        "category": "tai_chi",
        "duration": "10-15 min",
        "level": "Beginner",
        "video_url": "https://www.youtube.com/embed/Sqp2FvIQlZw",
        "description": "Cloud Hands is considered the quintessential Tai Chi movement — a living meditation in motion. The hands move like clouds drifting across the sky while weight shifts from side to side. This single movement contains all the essential principles of Tai Chi: weight shifting, waist turning, continuous flow, and the interplay of Yin and Yang. Many masters say that if you could only practice one movement, Cloud Hands would be the one to choose.",
        "philosophy": "Clouds move without effort, without destination, shaped by the wind yet always whole. In Cloud Hands, we learn to move like nature — effortlessly responsive, perpetually transforming, never grasping.",
        "benefits": ["Develops smooth weight shifting and balance", "Calms the mind through rhythmic, meditative movement", "Enhances whole-body coordination and awareness", "Opens the waist and hips for fluid Qi circulation", "Teaches the integration of upper and lower body", "Relieves stress and promotes deep relaxation"],
        "steps": [
            "Begin in a shoulder-width stance, weight evenly distributed. Arms hang naturally at your sides. Take several deep breaths to center yourself.",
            "Shift your weight to the right foot. As you do, the right hand begins to rise, palm facing you, moving from hip level up to face level. The left hand simultaneously descends.",
            "As the right hand reaches face height, begin turning your waist to the right. The entire upper body moves as one unit — arms don't move independently from the torso.",
            "Now shift weight to the left. The left hand rises as the right descends. The waist turns left. Feel the weight pour from one leg to the other like water.",
            "As you grow comfortable, add stepping: when weight shifts fully left, step the right foot in toward the left. When weight shifts right, step the left foot out to shoulder width.",
            "Move continuously without pause. There is no beginning and no end. The transitions between left and right are as important as the positions themselves.",
            "Breathe naturally. Don't try to coordinate breath with movement — let the breath find its own rhythm within the movement.",
            "Practice for 5-10 minutes. To close, gradually make the movements smaller until you return to standing stillness. Rest with hands on the lower Dantian."
        ],
        "tips": "The secret is in the waist — the arms follow the torso, they don't lead it. If your arms are moving but your waist is still, you're doing arm waving, not Tai Chi. Move from the center.",
        "color": "#D8B4FE"
    },
    {
        "id": "taichi-ward-off",
        "name": "Grasp Sparrow's Tail (Lan Que Wei)",
        "category": "tai_chi",
        "duration": "15-20 min",
        "level": "Intermediate",
        "video_url": "https://www.youtube.com/embed/BpfleNSyLWo",
        "description": "Grasp Sparrow's Tail is the cornerstone sequence of Yang-style Tai Chi, containing the four primary energies (Si Zheng): Peng (Ward Off), Lu (Roll Back), Ji (Press), and An (Push). These four energies correspond to the four cardinal directions and represent the fundamental ways energy can be expressed or received. This sequence teaches the complete cycle of yielding and issuing, making it essential for both martial application and health cultivation.",
        "philosophy": "To grasp a sparrow's tail without harming it requires sensitivity, gentleness, and perfect timing — the same qualities needed to handle life's challenges with grace. Too much force and you crush what you hold; too little and it slips away.",
        "benefits": ["Develops structural integrity and rooting", "Teaches the four primary Tai Chi energies", "Strengthens legs and develops patience", "Improves martial awareness and sensitivity", "Cultivates the ability to yield without collapsing", "Trains whole-body connection (Zheng Ti Jin)"],
        "steps": [
            "Begin in Wu Ji (standing meditation) — feet shoulder-width, arms at sides, mind empty. This is the stillness from which all Tai Chi emerges. Stand for 1-2 minutes.",
            "WARD OFF (Peng): Step forward with the right foot. The right arm rises in front of the chest, forearm rounded as if holding a large balloon against your chest. Energy expands outward in all directions. This is yang energy expressing — don't lean forward, root down.",
            "ROLL BACK (Lu): Turn the waist to the right, sitting back onto the rear leg. Both hands guide an incoming force past you, like a bullfighter's cape. This is yin energy — you receive, redirect, and neutralize. Weight shifts 70% to the rear leg.",
            "PRESS (Ji): Shift weight forward again. The rear hand presses against the front wrist/forearm. Energy compresses then releases forward through the joined hands. Like a wave that draws back before crashing on shore.",
            "PUSH (An): Separate the hands to shoulder width, sit back. Then shift forward and push both palms forward at chest height. Ground the push through your back foot — the power comes from the earth, through the legs, directed by the waist, expressed through the hands.",
            "Complete the sequence on the right side, then turn and repeat on the left. Each transition should be smooth — there are no hard stops.",
            "Repeat the full sequence 4-8 times on each side. With practice, the four distinct movements will blend into one continuous flow.",
            "To close, return to Wu Ji standing. Place palms on the lower Dantian. Stand quietly for 2-3 minutes, allowing the Qi to settle and integrate."
        ],
        "tips": "Each of the four energies has a distinct quality — Peng is expansive like inflating a balloon, Lu is yielding like a swinging door, Ji is compressing like a spring, An is rooting like a wave. Feel these qualities, don't just mimic the shapes.",
        "color": "#C084FC"
    },
    {
        "id": "qigong-five-elements",
        "name": "Five Element Qigong (Wu Xing Gong)",
        "category": "qigong",
        "duration": "20-30 min",
        "level": "Intermediate",
        "video_url": "https://www.youtube.com/embed/_6Y8QSVyYhM",
        "description": "Five Element Qigong is a profound healing system based on Traditional Chinese Medicine's Five Element theory (Wu Xing). Each movement corresponds to one of the five elements — Wood, Fire, Earth, Metal, and Water — along with its associated organ system, emotion, season, color, and sound. By practicing all five movements, you create holistic balance throughout your body's energy system. This is both a physical exercise and an internal alchemy practice.",
        "philosophy": "The five elements are not separate forces but aspects of one continuously transforming energy. Wood feeds Fire, Fire creates Earth (ash), Earth bears Metal (minerals), Metal enriches Water (minerals dissolve), Water nourishes Wood (trees). Understanding this cycle within yourself is the key to lasting health.",
        "benefits": ["Balances all five major organ systems (liver, heart, spleen, lungs, kidneys)", "Harmonizes and transforms stuck emotions", "Deepens connection to seasonal and elemental awareness", "Promotes both physical health and spiritual growth", "Enhances understanding of TCM five-element theory", "Creates internal harmony between generating and controlling cycles"],
        "steps": [
            "WOOD (Liver/Gallbladder — Spring — Green — Anger→Kindness): Stand with feet shoulder-width. Stretch sideways like a tree bending in the wind — one arm reaches over the head to the opposite side while the other pushes down. The sound is 'SHHHH' (like wind through leaves). This releases frustration and cultivates decisiveness. 8 repetitions each side.",
            "FIRE (Heart/Small Intestine — Summer — Red — Anxiety→Joy): Open the chest wide, arms spreading out and up like flames dancing. Bring palms together at the heart center. The sound is 'HAWWW' (like a sigh of relief). This releases anxiety and opens the heart to joy and connection. 8 repetitions.",
            "EARTH (Spleen/Stomach — Late Summer — Yellow — Worry→Trust): Create gentle spiraling movements around the center of the body, hands circling the navel area. The sound is 'WHOOOO' (like a low hum). This settles overthinking, improves digestion, and cultivates groundedness. 8 circles each direction.",
            "METAL (Lungs/Large Intestine — Autumn — White — Grief→Courage): Extend arms wide on the inhale, gathering pure Qi. On the exhale, draw arms in and compress toward the lungs. The sound is 'SSSSS' (like air releasing). This processes grief, strengthens immunity, and builds inner courage. 8 repetitions.",
            "WATER (Kidneys/Bladder — Winter — Blue/Black — Fear→Wisdom): Bend forward, letting the upper body flow downward like a waterfall. Hands sweep down the backs of the legs. Rise slowly, hands tracing up the inner legs. The sound is 'CHEWWW' (like blowing out a candle). This dissolves fear, strengthens willpower, and nourishes deep reserves. 8 repetitions.",
            "INTEGRATION: After completing all five elements, stand in Wu Ji for 3-5 minutes. Visualize the five elemental colors circling within you — green, red, yellow, white, and blue — blending into pure golden light at your center.",
            "Place both palms on the lower Dantian. Feel the warmth gathering. This is the balanced energy of all five elements united.",
            "Bow gently to honor the practice and the wisdom of the elements within you."
        ],
        "tips": "Each element has a healing sound — practice the sounds softly on the exhale. The vibration of each sound resonates with its corresponding organ, amplifying the healing effect. Don't rush between elements; each one deserves full presence.",
        "color": "#FCD34D"
    },
    {
        "id": "taichi-24form",
        "name": "24-Form Tai Chi (Simplified Yang Style)",
        "category": "tai_chi",
        "duration": "20-30 min",
        "level": "Intermediate",
        "video_url": "https://www.youtube.com/embed/R8NbQecDygQ",
        "description": "The 24-Form Tai Chi, created in 1956 by the Chinese Sports Commission, distills the essential movements of traditional Yang-style Tai Chi into an accessible yet complete sequence. It is the most practiced Tai Chi form in the world, performed daily by millions. Despite its simplicity compared to the traditional 108-movement form, it contains all the fundamental principles of Tai Chi and serves as both a standalone health practice and a gateway to deeper study.",
        "philosophy": "Tai Chi is sometimes called 'meditation in motion' or 'moving stillness.' The 24-Form teaches us that true mastery lies not in complexity but in depth of understanding. A single step done with complete awareness is worth more than a hundred movements done mechanically.",
        "benefits": ["Complete full-body exercise touching every joint and muscle", "Deep moving meditation that cultivates present-moment awareness", "Proven to improve balance, reducing fall risk by up to 50%", "Reduces blood pressure and improves cardiovascular health", "Builds patience, discipline, and embodied mindfulness", "Gateway to deeper Tai Chi and internal arts practice"],
        "steps": [
            "OPENING: Commencing Form (Qi Shi) — Rise from stillness. Arms float up to shoulder height, then sink down as knees bend. This represents the universe emerging from emptiness (Wu Ji) into Tai Chi (the interplay of Yin and Yang).",
            "Part Wild Horse's Mane (Ye Ma Fen Zong) — Step diagonally forward, one hand sweeps up (mane), the other presses down. Alternate left and right, 3 repetitions. This teaches diagonal energy and weight shifting.",
            "White Crane Spreads Wings (Bai He Liang Chi) — Shift weight to rear leg, one hand rises above the head, the other drops to the hip. A moment of beautiful stillness within the flow. Empty the front foot completely.",
            "Brush Knee and Twist Step (Lou Xi Ao Bu) — Step forward, one hand brushes past the knee while the other pushes forward from the ear. This is one of the most practical self-defense movements, teaching simultaneous defense and attack.",
            "Playing the Lute (Shou Hui Pi Pa) — Step the rear foot forward, hands form a playing-the-lute position with one hand at wrist height of the other. A moment of contained energy, like a coiled spring.",
            "Repulse Monkey (Dao Juan Gong) — Step backward while one hand pulls back and the other pushes forward. Moving backward with confidence teaches us that retreat can be as powerful as advance.",
            "Continue through: Grasp Sparrow's Tail (both sides), Single Whip, Wave Hands Like Clouds, High Pat on Horse, Kick with Right/Left Heel, Strike Ears with Fists, Turn and Kick, Deflect-Parry-Punch, Apparent Close-Up, Cross Hands.",
            "CLOSING: Cross Hands (Shi Zi Shou) and Closing Form (Shou Shi) — Return to Wu Ji standing. All movement resolves back into stillness. The circle is complete. Stand quietly for 2-5 minutes."
        ],
        "tips": "Learn the form in small sections — 3-4 movements at a time. Practice each section until it feels natural before adding more. It takes most people 3-6 months to learn the complete form. There's no rush. The journey IS the practice.",
        "color": "#FDA4AF"
    }
]

@router.get("/exercises")
async def get_exercises():
    return JSONResponse(content=EXERCISES_DATA, headers={"Cache-Control": "public, max-age=3600"})

@router.post("/exercises/ai-guide")
async def get_exercise_guide(req: AIGenerateRequest):
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"exercise-{str(uuid.uuid4())}",
            system_message="You are a master Qigong and Tai Chi instructor with 40 years of experience. Provide a detailed, warm, and encouraging guided practice session. Include breathing cues, visualization, and energy awareness instructions. Keep response under 300 words."
        )
        chat.with_model("openai", "gpt-5.2")
        msg = UserMessage(text=f"Guide me through a {req.topic} practice session. Include step-by-step instructions with breathing and energy visualization cues.")
        response = await asyncio.wait_for(chat.send_message(msg), timeout=30)
        return {"guide": response, "topic": req.topic}
    except Exception as e:
        logger.error(f"AI exercise guide error: {e}")
        return {"guide": "Begin by standing quietly. Feel your feet rooted to the earth. Breathe slowly and deeply into your lower belly. Let your arms float upward as you inhale, descend as you exhale. Feel the Qi moving through your body like warm golden light.", "topic": req.topic}

# --- Nourishment / Energy Foods ---
NOURISHMENT_DATA = [
    {
        "id": "golden-milk",
        "name": "Golden Milk (Turmeric Latte)",
        "category": "drinks",
        "energy_type": "warming",
        "description": "An ancient Ayurvedic elixir combining turmeric, ginger, and warming spices in creamy milk. Deeply anti-inflammatory, it calms the mind and nourishes the spirit before meditation or sleep.",
        "ingredients": ["Turmeric", "Ginger", "Cinnamon", "Black pepper", "Coconut milk", "Honey"],
        "benefits": ["Anti-inflammatory", "Promotes restful sleep", "Supports digestion", "Enhances mood"],
        "element": "Fire",
        "color": "#FCD34D"
    },
    {
        "id": "matcha-ceremony",
        "name": "Ceremonial Matcha",
        "category": "drinks",
        "energy_type": "awakening",
        "description": "High-grade matcha used in Japanese tea ceremonies for centuries. Rich in L-theanine which promotes calm alertness - the perfect state for meditation and conscious awareness.",
        "ingredients": ["Ceremonial matcha powder", "Hot water (70-80C)", "Bamboo whisk"],
        "benefits": ["Calm focus", "Rich in antioxidants", "Boosts metabolism", "Enhances concentration"],
        "element": "Wood",
        "color": "#86EFAC"
    },
    {
        "id": "adaptogen-bowl",
        "name": "Adaptogen Power Bowl",
        "category": "meals",
        "energy_type": "balancing",
        "description": "A nourishing bowl featuring adaptogenic superfoods that help the body resist physical, chemical, and biological stressors. Perfect post-meditation fuel.",
        "ingredients": ["Quinoa", "Ashwagandha", "Maca root", "Goji berries", "Hemp seeds", "Avocado", "Spirulina"],
        "benefits": ["Stress adaptation", "Hormone balance", "Sustained energy", "Brain nourishment"],
        "element": "Earth",
        "color": "#2DD4BF"
    },
    {
        "id": "cacao-ceremony",
        "name": "Cacao Ceremony Drink",
        "category": "drinks",
        "energy_type": "heart-opening",
        "description": "Raw ceremonial cacao has been used by indigenous cultures for millennia as a heart-opening medicine. Theobromine gently stimulates the cardiovascular system and releases feel-good endorphins.",
        "ingredients": ["Raw cacao paste", "Cayenne pepper", "Vanilla", "Cinnamon", "Honey", "Hot water"],
        "benefits": ["Heart opening", "Mood elevation", "Rich in magnesium", "Spiritual connection"],
        "element": "Fire",
        "color": "#92400E"
    },
    {
        "id": "qi-soup",
        "name": "Qi Nourishing Bone Broth",
        "category": "meals",
        "energy_type": "grounding",
        "description": "A Traditional Chinese Medicine staple, slow-simmered bone broth infused with astragalus, goji berries, and jujube dates. Deeply nourishing to Qi and blood.",
        "ingredients": ["Organic bones", "Astragalus root", "Goji berries", "Jujube dates", "Ginger", "Scallion"],
        "benefits": ["Builds Qi energy", "Supports immunity", "Nourishes joints", "Warms the body"],
        "element": "Earth",
        "color": "#FDA4AF"
    },
    {
        "id": "sattvic-plate",
        "name": "Sattvic Ayurvedic Plate",
        "category": "meals",
        "energy_type": "elevating",
        "description": "In Ayurveda, Sattvic foods are pure, clean, and promote clarity of mind and lightness of body. This plate combines fresh, seasonal, and minimally processed ingredients for spiritual nourishment.",
        "ingredients": ["Basmati rice", "Mung dal", "Ghee", "Fresh vegetables", "Cumin", "Coriander", "Fresh fruits"],
        "benefits": ["Mental clarity", "Digestive ease", "Spiritual elevation", "Dosha balance"],
        "element": "Air",
        "color": "#D8B4FE"
    },
    {
        "id": "mushroom-elixir",
        "name": "Mushroom Adaptogen Elixir",
        "category": "drinks",
        "energy_type": "grounding",
        "description": "A blend of medicinal mushrooms revered in Eastern medicine for thousands of years. Lion's Mane for the mind, Reishi for the spirit, Chaga for the body.",
        "ingredients": ["Lion's Mane", "Reishi", "Chaga", "Cordyceps", "Oat milk", "Cinnamon"],
        "benefits": ["Cognitive enhancement", "Immune support", "Nervous system calm", "Spiritual grounding"],
        "element": "Water",
        "color": "#7C3AED"
    },
    {
        "id": "prana-smoothie",
        "name": "Prana Life Force Smoothie",
        "category": "drinks",
        "energy_type": "vitalizing",
        "description": "A vibrant green smoothie packed with chlorophyll-rich foods that ancient yogis believed contain concentrated prana (life force energy).",
        "ingredients": ["Spirulina", "Wheatgrass", "Banana", "Moringa", "Coconut water", "Chia seeds", "Fresh mint"],
        "benefits": ["Prana enhancement", "Detoxification", "Energy boost", "Alkalizing"],
        "element": "Air",
        "color": "#22C55E"
    }
]

@router.get("/nourishment")
async def get_nourishment():
    return NOURISHMENT_DATA

@router.post("/nourishment/suggest")
async def suggest_nourishment(req: AIGenerateRequest):
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"nourishment-{str(uuid.uuid4())}",
            system_message="You are an Ayurvedic nutrition expert and Traditional Chinese Medicine food therapist. Suggest a specific food or drink recipe that supports spiritual practice and energy cultivation. Include the recipe name, brief description, key ingredients, and how it supports consciousness expansion. Keep under 200 words."
        )
        chat.with_model("openai", "gpt-5.2")
        msg = UserMessage(text=f"Suggest a nourishing recipe for someone who wants to: {req.topic}")
        response = await asyncio.wait_for(chat.send_message(msg), timeout=30)
        return {"suggestion": response, "topic": req.topic}
    except Exception as e:
        logger.error(f"AI nourishment error: {e}")
        return {"suggestion": "Try warm lemon water with honey and a pinch of turmeric first thing in the morning. This simple elixir awakens your digestive fire (Agni) and clears stagnant energy from your system.", "topic": req.topic}

# --- Biometric Frequencies ---
FREQUENCIES_DATA = [
    {
        "id": "freq-174",
        "frequency": 174,
        "name": "Foundation Frequency",
        "category": "solfeggio",
        "description": "The lowest Solfeggio frequency acts as a natural anesthetic. It reduces pain, both physical and energetic, giving your organs a sense of security, safety, and love.",
        "benefits": ["Pain reduction", "Grounding energy", "Sense of security", "Physical healing"],
        "chakra": "Root",
        "color": "#EF4444"
    },
    {
        "id": "freq-285",
        "frequency": 285,
        "name": "Quantum Cognition",
        "category": "solfeggio",
        "description": "This frequency helps heal tissues and brings them to their original form by sending a message to restructure damaged organs. It influences the energy field around you.",
        "benefits": ["Tissue healing", "Energy field repair", "Cellular regeneration", "Restructuring"],
        "chakra": "Sacral",
        "color": "#F97316"
    },
    {
        "id": "freq-396",
        "frequency": 396,
        "name": "Liberation from Fear",
        "category": "solfeggio",
        "description": "This frequency liberates the energy of fear and guilt. It cleanses trauma from the cellular memory, helping you achieve your goals by removing subconscious blocks.",
        "benefits": ["Fear release", "Guilt liberation", "Goal achievement", "Trauma clearing"],
        "chakra": "Root",
        "color": "#EF4444"
    },
    {
        "id": "freq-417",
        "frequency": 417,
        "name": "Facilitating Change",
        "category": "solfeggio",
        "description": "Connected to the sacral chakra, this frequency undoes situations and facilitates change. It cleanses traumatic experiences and clears destructive influences of past events.",
        "benefits": ["Change facilitation", "Trauma clearing", "Negative energy removal", "New beginnings"],
        "chakra": "Sacral",
        "color": "#F97316"
    },
    {
        "id": "freq-432",
        "frequency": 432,
        "name": "Universal Harmony",
        "category": "earth",
        "description": "Known as Verdi's A, 432Hz is mathematically consistent with the universe. Music tuned to this frequency fills the listener with warmth and promotes healing and a deep sense of peace.",
        "benefits": ["Universal alignment", "Heart resonance", "Natural harmony", "Deep relaxation"],
        "chakra": "Heart",
        "color": "#22C55E"
    },
    {
        "id": "freq-528",
        "frequency": 528,
        "name": "Miracle Tone / DNA Repair",
        "category": "solfeggio",
        "description": "The 'Love Frequency' resonates at the heart of everything. It is said to repair DNA, bring transformation, and create miracles. Used by biochemists to repair human DNA.",
        "benefits": ["DNA repair", "Transformation", "Miracles", "Love frequency activation"],
        "chakra": "Solar Plexus",
        "color": "#FCD34D"
    },
    {
        "id": "freq-639",
        "frequency": 639,
        "name": "Connecting Relationships",
        "category": "solfeggio",
        "description": "This frequency enhances communication, understanding, tolerance, and love. It can be used to heal relationship problems and re-connect with loved ones.",
        "benefits": ["Harmonious relationships", "Enhanced communication", "Heart opening", "Tolerance"],
        "chakra": "Heart",
        "color": "#22C55E"
    },
    {
        "id": "freq-741",
        "frequency": 741,
        "name": "Awakening Intuition",
        "category": "solfeggio",
        "description": "This frequency cleans the cell from toxins and electromagnetic radiation. It leads to a purer, more stable spiritual life and helps with problem-solving and self-expression.",
        "benefits": ["Toxin cleansing", "Intuition awakening", "Self-expression", "Problem solving"],
        "chakra": "Throat",
        "color": "#3B82F6"
    },
    {
        "id": "freq-852",
        "frequency": 852,
        "name": "Return to Spiritual Order",
        "category": "solfeggio",
        "description": "This frequency is directly connected to the third eye chakra. It raises awareness and opens intuition, allowing you to communicate with the all-embracing Spirit.",
        "benefits": ["Third eye activation", "Spiritual awareness", "Inner strength", "Intuition"],
        "chakra": "Third Eye",
        "color": "#8B5CF6"
    },
    {
        "id": "freq-963",
        "frequency": 963,
        "name": "Divine Consciousness",
        "category": "solfeggio",
        "description": "The highest Solfeggio frequency is associated with the Crown Chakra. Known as the 'God Frequency', it awakens any system to its original, perfect state of oneness.",
        "benefits": ["Crown chakra activation", "Divine connection", "Enlightenment", "Cosmic consciousness"],
        "chakra": "Crown",
        "color": "#D8B4FE"
    },
    {
        "id": "freq-7_83",
        "frequency": 7.83,
        "name": "Schumann Resonance",
        "category": "earth",
        "description": "The Earth's fundamental frequency - the electromagnetic pulse of our planet. Attuning to this frequency grounds us to Earth's natural rhythm and restores our biological clock.",
        "benefits": ["Earth grounding", "Circadian rhythm reset", "Anti-inflammation", "Deep meditation"],
        "chakra": "Root",
        "color": "#854D0E"
    },
    {
        "id": "freq-40",
        "frequency": 40,
        "name": "Gamma Consciousness",
        "category": "binaural",
        "description": "40Hz gamma waves are associated with higher mental activity, peak consciousness, and 'aha' moments. Buddhist monks in deep meditation produce sustained gamma wave activity.",
        "benefits": ["Peak performance", "Enhanced cognition", "Spiritual insight", "Memory enhancement"],
        "chakra": "Crown",
        "color": "#E879F9"
    }
]

@router.get("/frequencies")
async def get_frequencies():
    return JSONResponse(content=FREQUENCIES_DATA, headers={"Cache-Control": "public, max-age=3600"})


