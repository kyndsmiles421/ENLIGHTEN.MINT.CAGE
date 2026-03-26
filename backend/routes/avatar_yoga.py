from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()
from deps import create_activity
from models import AvatarConfig
import asyncio

# ========== AVATAR SYSTEM ==========


@router.get("/avatar")
async def get_avatar(user=Depends(get_current_user)):
    avatar = await db.avatars.find_one({"user_id": user["id"]}, {"_id": 0})
    if not avatar:
        return {"user_id": user["id"], "body_type": "balanced", "aura_color": "#D8B4FE", "aura_intensity": 0.6, "silhouette": "default", "robe_style": "flowing", "robe_color": "#1E1B4B", "chakra_emphasis": "all", "particle_density": "medium", "glow_style": "soft", "energy_trails": True}
    return avatar


@router.post("/avatar")
async def save_avatar(config: AvatarConfig, user=Depends(get_current_user)):
    data = config.dict()
    data["user_id"] = user["id"]
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.avatars.update_one({"user_id": user["id"]}, {"$set": data}, upsert=True)
    return {"status": "saved", "avatar": data}


# ========== YOGA SYSTEM ==========

YOGA_STYLES = [
    {
        "id": "hatha",
        "name": "Hatha Yoga",
        "subtitle": "Foundation & Alignment",
        "desc": "The classical path. Hatha means 'sun-moon' — balancing opposing energies through steady postures and conscious breathing. Perfect for building a strong, aligned foundation.",
        "color": "#FB923C",
        "difficulty": "all levels",
        "duration_range": "20-60 min",
        "benefits": ["Builds strength & flexibility", "Improves posture", "Calms the nervous system", "Develops body awareness"],
        "sequences": [
            {
                "id": "hatha-sunrise",
                "name": "Sunrise Salutation",
                "duration": 20,
                "level": "beginner",
                "poses": [
                    {"name": "Mountain Pose (Tadasana)", "duration": 60, "instruction": "Stand tall with feet hip-width apart. Ground through all four corners of your feet. Lengthen your spine toward the sky. Arms rest at your sides, palms facing forward.", "breath": "Deep, even breaths", "focus": "Root chakra grounding"},
                    {"name": "Standing Forward Fold (Uttanasana)", "duration": 45, "instruction": "Exhale and hinge from the hips, folding forward. Let your head hang heavy. Bend your knees as needed. Feel gravity pulling tension from your spine.", "breath": "Exhale to fold deeper", "focus": "Releasing control"},
                    {"name": "Halfway Lift (Ardha Uttanasana)", "duration": 30, "instruction": "Inhale, lengthen your spine parallel to the floor. Fingertips on shins or thighs. Gaze forward with a flat back.", "breath": "Inhale to lengthen", "focus": "Spinal extension"},
                    {"name": "Low Lunge (Anjaneyasana)", "duration": 60, "instruction": "Step your right foot back into a low lunge. Lower your back knee to the floor. Sink your hips forward and down. Reach arms overhead.", "breath": "Breathe into the hip crease", "focus": "Hip opening"},
                    {"name": "Downward Facing Dog (Adho Mukha Svanasana)", "duration": 90, "instruction": "Press back into an inverted V shape. Spread your fingers wide. Press your heels toward the earth. Let your head relax between your arms.", "breath": "5 deep breaths", "focus": "Full body integration"},
                    {"name": "Warrior I (Virabhadrasana I)", "duration": 60, "instruction": "Step your right foot forward between your hands. Back foot at 45 degrees. Bend your front knee to 90 degrees. Reach arms high, gaze upward.", "breath": "Strong, powerful breaths", "focus": "Inner warrior strength"},
                    {"name": "Tree Pose (Vrksasana)", "duration": 60, "instruction": "Shift weight to your left foot. Place your right foot on your inner thigh or calf (never the knee). Hands at heart center or overhead. Find a steady gaze point.", "breath": "Soft, steady breathing", "focus": "Balance & stability"},
                    {"name": "Savasana (Corpse Pose)", "duration": 120, "instruction": "Lie flat on your back. Let your feet fall open. Arms at your sides, palms up. Close your eyes. Release every muscle. Simply exist.", "breath": "Natural, effortless breath", "focus": "Complete surrender"},
                ]
            },
            {
                "id": "hatha-strength",
                "name": "Warrior's Foundation",
                "duration": 30,
                "level": "intermediate",
                "poses": [
                    {"name": "Chair Pose (Utkatasana)", "duration": 60, "instruction": "Feet together, bend knees deeply as if sitting in an invisible chair. Arms reach overhead. Weight in your heels. Engage your core.", "breath": "Strong breath through challenge", "focus": "Building inner fire"},
                    {"name": "Warrior II (Virabhadrasana II)", "duration": 60, "instruction": "Wide stance, right knee bent over ankle. Arms extend parallel to the floor. Gaze past your right fingertips. Shoulders relax down.", "breath": "Steady warrior breath", "focus": "Fierce grace"},
                    {"name": "Extended Side Angle (Utthita Parsvakonasana)", "duration": 45, "instruction": "From Warrior II, place right forearm on right thigh. Left arm reaches overhead, creating a line from left foot to left fingertips.", "breath": "Breathe into the side body", "focus": "Lateral expansion"},
                    {"name": "Triangle Pose (Trikonasana)", "duration": 60, "instruction": "Straighten your front leg. Reach forward then tilt — right hand to shin, left arm to sky. Open your chest to the side wall.", "breath": "Expand with each inhale", "focus": "Opening & alignment"},
                    {"name": "Plank Pose", "duration": 45, "instruction": "Shoulders over wrists, body in one straight line. Engage your core as if bracing for impact. Press the floor away.", "breath": "Strong, rhythmic breathing", "focus": "Core power"},
                    {"name": "Cobra Pose (Bhujangasana)", "duration": 45, "instruction": "Lie face down. Hands under shoulders. Press up, lifting your chest. Keep elbows close. Shoulder blades draw together.", "breath": "Inhale to rise", "focus": "Heart opening"},
                    {"name": "Child's Pose (Balasana)", "duration": 90, "instruction": "Knees wide, big toes touch. Fold forward, forehead to the earth. Arms extended or alongside your body. Surrender completely.", "breath": "Breath into your back body", "focus": "Returning home"},
                    {"name": "Savasana", "duration": 120, "instruction": "Final rest. Lie on your back and let the practice integrate into every cell of your being.", "breath": "Natural breathing", "focus": "Integration"},
                ]
            }
        ]
    },
    {
        "id": "vinyasa",
        "name": "Vinyasa Flow",
        "subtitle": "Breath-Linked Movement",
        "desc": "A dynamic meditation in motion. Each movement is married to breath, creating a flowing dance between effort and ease. Build heat, find rhythm, and let the practice move you.",
        "color": "#EF4444",
        "difficulty": "intermediate",
        "duration_range": "30-75 min",
        "benefits": ["Cardiovascular fitness", "Builds functional strength", "Enhances coordination", "Moving meditation"],
        "sequences": [
            {
                "id": "vinyasa-flow-1",
                "name": "Solar Flow",
                "duration": 25,
                "level": "intermediate",
                "poses": [
                    {"name": "Sun Salutation A — Mountain", "duration": 30, "instruction": "Stand at the top of your mat. Inhale, arms sweep overhead. Palms touch. Gaze up.", "breath": "Inhale — rise", "focus": "Setting intention"},
                    {"name": "Forward Fold", "duration": 20, "instruction": "Exhale, swan dive forward. Fold from the hips. Touch the earth.", "breath": "Exhale — release", "focus": "Letting go"},
                    {"name": "Chaturanga Dandasana", "duration": 20, "instruction": "From plank, lower halfway down. Elbows at 90 degrees, hugging your ribs. Full body engagement.", "breath": "Exhale — lower with control", "focus": "Controlled power"},
                    {"name": "Upward Facing Dog", "duration": 25, "instruction": "Roll over your toes. Press up, lifting chest and thighs off the floor. Open your heart to the sky.", "breath": "Inhale — open", "focus": "Heart expansion"},
                    {"name": "Downward Dog", "duration": 60, "instruction": "Press back, lift your hips high. Pedal your feet. Find length in your spine. This is your home base.", "breath": "5 full breaths", "focus": "Coming home"},
                    {"name": "Crescent Lunge", "duration": 45, "instruction": "Step right foot forward. Back heel lifts high. Bend deeply. Arms reach overhead. Sink low.", "breath": "Power breathing", "focus": "Rising energy"},
                    {"name": "Warrior III (Virabhadrasana III)", "duration": 30, "instruction": "Shift weight onto right foot. Extend left leg back, torso forward. Arms alongside. Body is one line parallel to the floor.", "breath": "Steady, focused breath", "focus": "Flying warrior"},
                    {"name": "Wild Thing (Camatkarasana)", "duration": 30, "instruction": "From Downward Dog, lift right leg. Open your hip. Flip your dog — right hand lifts as you arc into a backbend. Let joy flow.", "breath": "Breath of freedom", "focus": "Ecstatic expression"},
                ]
            }
        ]
    },
    {
        "id": "kundalini",
        "name": "Kundalini Yoga",
        "subtitle": "Awakening the Serpent Energy",
        "desc": "The yoga of awareness. Kundalini combines dynamic movement, breathwork (pranayama), mantras, and meditation to awaken the dormant energy coiled at the base of your spine and raise it through all seven chakras.",
        "color": "#C084FC",
        "difficulty": "intermediate",
        "duration_range": "30-90 min",
        "benefits": ["Awakens kundalini energy", "Clears energy blockages", "Enhances intuition", "Balances the glandular system"],
        "sequences": [
            {
                "id": "kundalini-awakening",
                "name": "Kundalini Rising",
                "duration": 30,
                "level": "intermediate",
                "poses": [
                    {"name": "Tune In (Adi Mantra)", "duration": 60, "instruction": "Sit cross-legged. Hands in prayer at the heart. Chant 'Ong Namo Guru Dev Namo' three times. This opens the channel to your higher self.", "breath": "Full yogic breath", "focus": "Connecting to the golden chain"},
                    {"name": "Breath of Fire (Kapalabhati)", "duration": 90, "instruction": "Rapid, rhythmic breathing through the nose. Equal inhale and exhale. Pump your navel point. Start slow, build speed.", "breath": "Rapid rhythmic pumping", "focus": "Stoking the inner fire"},
                    {"name": "Spinal Flexes (Cat-Cow Seated)", "duration": 90, "instruction": "Hands on knees. Inhale — arch forward, chest lifts. Exhale — round back, chin tucks. Build rhythm. Let the spine undulate like a wave.", "breath": "Synchronized with movement", "focus": "Spinal fluid flow"},
                    {"name": "Sufi Grind", "duration": 60, "instruction": "Circle your torso clockwise, grinding through the hips. Keep it smooth and rhythmic. Then reverse direction.", "breath": "Natural flowing breath", "focus": "Lower chakra activation"},
                    {"name": "Sat Kriya", "duration": 120, "instruction": "Sit on your heels. Arms overhead, fingers interlocked, index fingers pointing up. Chant 'Sat' — pull navel in. 'Nam' — release. Rhythmic and powerful.", "breath": "Sat — pull in, Nam — release", "focus": "Naval point activation"},
                    {"name": "Deep Relaxation", "duration": 180, "instruction": "Lie on your back. Arms at sides, palms up. Allow the kundalini energy to integrate. Feel tingling, warmth, or waves of energy. Simply witness.", "breath": "Completely natural", "focus": "Energy integration"},
                ]
            }
        ]
    },
    {
        "id": "yin",
        "name": "Yin Yoga",
        "subtitle": "Deep Surrender & Meridian Work",
        "desc": "The quiet practice. Yin targets the deep connective tissues — fascia, ligaments, joints — through long, passive holds. Each pose is an invitation to surrender, to breathe into discomfort, and to let time work its magic.",
        "color": "#3B82F6",
        "difficulty": "all levels",
        "duration_range": "45-90 min",
        "benefits": ["Deep flexibility", "Stimulates meridians/chi flow", "Calms the mind profoundly", "Releases deep fascia"],
        "sequences": [
            {
                "id": "yin-surrender",
                "name": "Deep Surrender",
                "duration": 40,
                "level": "beginner",
                "poses": [
                    {"name": "Butterfly Pose (Baddha Konasana)", "duration": 300, "instruction": "Soles of feet together, knees wide. Fold forward gently. Round your spine. Let gravity pull you deeper over 5 minutes. No forcing.", "breath": "Slow, deep belly breaths", "focus": "Hip meridians releasing"},
                    {"name": "Dragon Pose (Low Lunge)", "duration": 240, "instruction": "Deep low lunge with back knee down. Sink your hips toward the earth. Hold and breathe. 4 minutes each side.", "breath": "Breathe into resistance", "focus": "Hip flexor release"},
                    {"name": "Sphinx Pose", "duration": 300, "instruction": "Lie face down. Forearms on the floor, elbows under shoulders. Gentle backbend. Stay passive. Let the lumbar spine decompress over time.", "breath": "Breathe into the belly against the floor", "focus": "Kidney & bladder meridians"},
                    {"name": "Sleeping Swan (Pigeon)", "duration": 300, "instruction": "Right shin parallel to the front of your mat. Left leg extends back. Fold forward over your right leg. Let your weight sink. 5 minutes each side.", "breath": "Surrender breathing", "focus": "Deep hip opening"},
                    {"name": "Legs Up the Wall (Viparita Karani)", "duration": 300, "instruction": "Lie on your back, legs resting up against a wall. Arms wide. Close your eyes. This is the great restorer.", "breath": "Natural, easy breathing", "focus": "Nervous system reset"},
                ]
            }
        ]
    },
    {
        "id": "restorative",
        "name": "Restorative Yoga",
        "subtitle": "Gentle Healing & Deep Rest",
        "desc": "The most nurturing yoga. Using props (pillows, blankets, bolsters), every pose is fully supported so your body can completely let go. This is not stretching — it is conscious resting. Your nervous system heals here.",
        "color": "#22C55E",
        "difficulty": "beginner",
        "duration_range": "30-60 min",
        "benefits": ["Deep nervous system relaxation", "Reduces cortisol levels", "Heals chronic stress patterns", "Improves sleep quality"],
        "sequences": [
            {
                "id": "restorative-heal",
                "name": "Healing Rest",
                "duration": 35,
                "level": "beginner",
                "poses": [
                    {"name": "Supported Child's Pose", "duration": 300, "instruction": "Kneel with a pillow or bolster between your thighs. Fold forward onto the support. Turn your head to one side. Completely surrender your weight. Switch head direction halfway.", "breath": "Slow, oceanic breathing", "focus": "Total surrender"},
                    {"name": "Supported Fish Pose", "duration": 300, "instruction": "Place a pillow under your upper back. Let your arms drape open to the sides. Chest opens naturally. Head rests comfortably. Feel your heart space expand.", "breath": "Heart-opening breaths", "focus": "Heart chakra healing"},
                    {"name": "Supported Bridge", "duration": 240, "instruction": "Lie on your back, feet flat. Lift hips and place a pillow or block underneath your sacrum. Rest your full weight on the support. Arms relax at your sides.", "breath": "Belly breathing", "focus": "Sacral energy restoration"},
                    {"name": "Reclined Twist", "duration": 240, "instruction": "Lie on your back. Hug knees to chest, then let them fall to the right. Arms in a T position. Hold for 4 minutes, then switch sides.", "breath": "Breathe into the twist", "focus": "Spinal release & detox"},
                    {"name": "Final Savasana with Bolster", "duration": 300, "instruction": "Lie flat with a pillow under your knees. Cover yourself with a blanket. Place a warm eye pillow over your eyes. This is pure healing rest. Stay as long as you need.", "breath": "Let breath breathe you", "focus": "Complete integration"},
                ]
            }
        ]
    },
    {
        "id": "pranayama",
        "name": "Pranayama Yoga",
        "subtitle": "The Science of Breath",
        "desc": "Prana is life force. Yama is control. Pranayama practices expand your vital energy through conscious breathing techniques that purify the energy channels (nadis) and prepare the mind for deep meditation.",
        "color": "#2DD4BF",
        "difficulty": "all levels",
        "duration_range": "15-45 min",
        "benefits": ["Expands vital energy", "Purifies energy channels", "Calms anxiety instantly", "Prepares for meditation"],
        "sequences": [
            {
                "id": "pranayama-essentials",
                "name": "Breath Mastery",
                "duration": 25,
                "level": "beginner",
                "poses": [
                    {"name": "Dirga Pranayama (Three-Part Breath)", "duration": 120, "instruction": "Sit tall. Inhale into your belly, then ribs, then chest — three distinct expansions. Exhale in reverse: chest, ribs, belly. Feel the wave of breath.", "breath": "Belly → ribs → chest", "focus": "Full lung capacity"},
                    {"name": "Nadi Shodhana (Alternate Nostril)", "duration": 180, "instruction": "Close right nostril with thumb. Inhale through left. Close left with ring finger. Exhale through right. Inhale right. Close. Exhale left. This is one round.", "breath": "Slow, equal ratios", "focus": "Balancing ida & pingala"},
                    {"name": "Ujjayi Breath (Ocean Breath)", "duration": 120, "instruction": "Slightly constrict the back of your throat. Breathe in and out through the nose with an ocean wave sound. Smooth and continuous.", "breath": "Audible ocean breath", "focus": "Heating & centering"},
                    {"name": "Bhramari (Bee Breath)", "duration": 120, "instruction": "Close your ears with your thumbs, fingers over eyes. Inhale deeply. Exhale with a humming sound like a bee. Feel the vibration in your skull.", "breath": "Humming exhalation", "focus": "Vibrating the pineal gland"},
                    {"name": "Kumbhaka (Breath Retention)", "duration": 180, "instruction": "Inhale for 4 counts. Hold for 4 counts. Exhale for 4 counts. Hold empty for 4 counts. Gradually increase the hold duration over time.", "breath": "4:4:4:4 box pattern", "focus": "Prana accumulation"},
                    {"name": "Silent Meditation", "duration": 180, "instruction": "After pranayama, sit in perfect stillness. Observe the natural breath without controlling it. Notice how alive and clear you feel.", "breath": "Observation only", "focus": "The gap between thoughts"},
                ]
            }
        ]
    },
    {
        "id": "nidra",
        "name": "Yoga Nidra",
        "subtitle": "Conscious Sleep & Deep Healing",
        "desc": "Yoga Nidra is the art of conscious relaxation — hovering between waking and sleeping. In this liminal state, your subconscious mind is deeply receptive. One hour of Yoga Nidra equals four hours of regular sleep.",
        "color": "#6366F1",
        "difficulty": "beginner",
        "duration_range": "20-60 min",
        "benefits": ["Equivalent to 4 hours sleep", "Reprograms subconscious patterns", "Heals trauma & PTSD", "Profound creativity access"],
        "sequences": [
            {
                "id": "nidra-journey",
                "name": "Journey to the Deep",
                "duration": 30,
                "level": "beginner",
                "poses": [
                    {"name": "Settling In", "duration": 120, "instruction": "Lie on your back in Savasana. Cover yourself with a blanket. Palms face up. Close your eyes. Make any final adjustments. Once we begin, remain completely still.", "breath": "Natural settling breath", "focus": "Physical comfort"},
                    {"name": "Sankalpa (Intention)", "duration": 60, "instruction": "State your heartfelt intention silently, three times. A short, positive statement in present tense. 'I am at peace.' 'I am whole.' Plant this seed in the fertile soil of your subconscious.", "breath": "Gentle, connected", "focus": "Seed of transformation"},
                    {"name": "Body Rotation (Nyasa)", "duration": 300, "instruction": "Bring awareness to each body part as I name it. Right thumb... index finger... middle finger... Each part relaxes as you notice it. Move your attention like a spotlight through your entire body.", "breath": "Awareness rides the breath", "focus": "Pratyahara — sense withdrawal"},
                    {"name": "Breath Awareness", "duration": 180, "instruction": "Count your breaths backward from 27 to 1. If you lose count, start again from 27. The counting anchors you in the hypnagogic state — between waking and sleeping.", "breath": "Counting backward", "focus": "Descending into consciousness"},
                    {"name": "Visualization Journey", "duration": 240, "instruction": "Visualize a peaceful garden at twilight. A path of smooth stones leads to a clearing. Moonlight bathes everything in silver. You are completely safe here. Rest in this inner sanctuary.", "breath": "Dream breathing", "focus": "Subconscious landscape"},
                    {"name": "Return & Sankalpa", "duration": 120, "instruction": "Repeat your Sankalpa three times. Begin to deepen your breath. Wiggle your fingers and toes. Gently roll to your right side. When ready, slowly sit up. Carry this peace with you.", "breath": "Gradually deepening", "focus": "Returning transformed"},
                ]
            }
        ]
    },
]


@router.get("/yoga/styles")
async def get_yoga_styles():
    styles = [{k: v for k, v in s.items() if k != "sequences"} for s in YOGA_STYLES]
    return {"styles": styles}


@router.get("/yoga/style/{style_id}")
async def get_yoga_style(style_id: str):
    style = next((s for s in YOGA_STYLES if s["id"] == style_id), None)
    if not style:
        raise HTTPException(status_code=404, detail="Yoga style not found")
    return style


@router.get("/yoga/sequence/{style_id}/{sequence_id}")
async def get_yoga_sequence(style_id: str, sequence_id: str):
    style = next((s for s in YOGA_STYLES if s["id"] == style_id), None)
    if not style:
        raise HTTPException(status_code=404, detail="Yoga style not found")
    seq = next((sq for sq in style["sequences"] if sq["id"] == sequence_id), None)
    if not seq:
        raise HTTPException(status_code=404, detail="Sequence not found")
    return {"style": {k: v for k, v in style.items() if k != "sequences"}, "sequence": seq}


@router.post("/yoga/complete")
async def complete_yoga_session(data: dict = Body(...), user=Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "style_id": data.get("style_id"),
        "sequence_id": data.get("sequence_id"),
        "duration": data.get("duration", 0),
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.yoga_sessions.insert_one(doc)
    await create_activity(user["id"], "share_tool", f"completed a {data.get('style_id', '')} yoga session", {"type": "yoga"})
    total = await db.yoga_sessions.count_documents({"user_id": user["id"]})
    return {"status": "completed", "total_sessions": total}


@router.get("/yoga/history")
async def get_yoga_history(user=Depends(get_current_user)):
    sessions = await db.yoga_sessions.find({"user_id": user["id"]}, {"_id": 0}).sort("completed_at", -1).to_list(50)
    total = await db.yoga_sessions.count_documents({"user_id": user["id"]})
    return {"sessions": sessions, "total": total}



