from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()

# ========== ADVANCED PROGRESSIVE LEARNING MODULES ==========

LEARNING_MODULES = [
    {
        "id": "foundations",
        "title": "Foundations of Stillness",
        "subtitle": "Master the building blocks of conscious practice",
        "level": 1,
        "color": "#2DD4BF",
        "icon": "layers",
        "duration": "2 weeks",
        "prerequisite": None,
        "description": "Establish a rock-solid foundation in breathwork, meditation, and body awareness. This module transforms basic techniques into deeply embodied skills.",
        "lessons": [
            {"id": "f-1", "title": "The Architecture of Breath", "type": "theory",
             "content": "Breath is the bridge between conscious and unconscious. In this lesson, we explore the anatomy of a complete breath cycle — diaphragmatic expansion, intercostal engagement, and the neurological cascade each exhale triggers.\n\nThe vagus nerve, your body's master relaxation switch, responds directly to breath depth and rhythm. A 6-breath-per-minute pattern activates peak heart rate variability, the measurable signature of resilience.\n\nKey Practice: Sit comfortably. Place one hand on your belly, one on your chest. Breathe so ONLY the belly hand moves for 3 minutes. This is diaphragmatic isolation — the foundation of all advanced breathwork.\n\nDeeper Understanding: Notice the micro-pause between inhale and exhale. This gap — called 'kumbhaka' in yogic tradition — is where the nervous system recalibrates. As you advance, you'll learn to extend and use this pause deliberately.",
             "duration": 12, "tool_link": "/breathing"},
            {"id": "f-2", "title": "Anchor Points in Meditation", "type": "practice",
             "content": "Every meditator needs an anchor — a point of return when the mind wanders. Most beginners use the breath, but advanced practitioners develop multiple anchors they can switch between.\n\nThe Five Classical Anchors:\n1. Breath Sensation (nostrils, belly, or chest)\n2. Body Contact Points (sitting bones, hands on knees)\n3. Sound Field (ambient sounds without labeling)\n4. Visual Focus (candle flame, mandala, or closed-eye light patterns)\n5. Mantra Repetition (silent or whispered)\n\nThis lesson's practice: Set a 10-minute timer. Every 2 minutes, consciously switch your anchor point through all five. Notice how each anchor creates a subtly different quality of attention.\n\nAdvanced Tip: The goal is not to eliminate thoughts — it's to reduce the TIME between noticing you've drifted and returning to the anchor. This 'return speed' is the actual muscle you're training.",
             "duration": 15, "tool_link": "/meditation"},
            {"id": "f-3", "title": "Somatic Intelligence", "type": "theory",
             "content": "Your body stores information your conscious mind has forgotten. Somatic intelligence is the practice of listening to these body-held signals — tension patterns, temperature changes, subtle impulses.\n\nThe Body Scan Protocol:\nStart at the crown of your head. Move attention slowly downward like a warm light beam. At each region, ask: 'What is the quality of sensation here?' Don't try to change anything — just observe.\n\nKey Areas to Investigate:\n- Jaw & temples (stress accumulation)\n- Throat (suppressed expression)\n- Shoulders & upper back (responsibility burden)\n- Solar plexus (anxiety, power dynamics)\n- Lower belly (security, creativity)\n- Hips & lower back (emotional storage)\n\nWhen you find an area of tension, breathe INTO that area. Imagine your breath as warm light dissolving the holding pattern. 3-5 breaths per area is sufficient.\n\nThis becomes the foundation for advanced energy work in later modules.",
             "duration": 15, "tool_link": "/meditation"},
            {"id": "f-4", "title": "Building Your Daily Container", "type": "practice",
             "content": "A 'container' is the consistent time and space you create for practice. Without a container, motivation ebbs and flows. With one, practice becomes as automatic as brushing your teeth.\n\nDesigning Your Container:\n\n1. TIME: Choose the same time daily. Morning is ideal (willpower is highest, fewer interruptions). Even 10 minutes is enough to start.\n\n2. SPACE: Designate a spot. It doesn't need to be a whole room — a corner with a cushion works. Your brain will associate this spot with practice, making entry easier each time.\n\n3. SIGNAL: Create a ritual entry point. Light a candle. Ring a bell. Take 3 deep breaths. This signal tells your nervous system: 'We're shifting modes now.'\n\n4. SEQUENCE: Start with breathwork (3 min) → body scan (3 min) → meditation (4+ min). This sequence warms up the body, then the mind.\n\n5. CLOSURE: End with 3 breaths and a moment of gratitude. This creates a clean boundary between practice and daily life.\n\nYour task: Design your container this week. Write it down. Follow it for 7 consecutive days, then adjust what doesn't work.",
             "duration": 10, "tool_link": "/rituals"},
        ],
    },
    {
        "id": "energy-mastery",
        "title": "Energy Mastery",
        "subtitle": "Harness subtle energy for healing and transformation",
        "level": 2,
        "color": "#8B5CF6",
        "icon": "zap",
        "duration": "3 weeks",
        "prerequisite": "foundations",
        "description": "Move beyond physical techniques into the realm of subtle energy. Learn to sense, direct, and amplify your life force through mudras, frequencies, and chakra activation.",
        "lessons": [
            {"id": "e-1", "title": "The Subtle Body Map", "type": "theory",
             "content": "Across cultures — from Indian chakras to Chinese meridians to Tibetan channels — there is remarkable agreement about the existence of an energy body that interpenetrates the physical body.\n\nThe Seven Primary Energy Centers:\n1. Root (Muladhara) — Base of spine — Security, survival, grounding\n2. Sacral (Svadhisthana) — Below navel — Creativity, pleasure, emotions\n3. Solar Plexus (Manipura) — Upper abdomen — Willpower, confidence, identity\n4. Heart (Anahata) — Center of chest — Love, compassion, connection\n5. Throat (Vishuddha) — Throat — Expression, truth, communication\n6. Third Eye (Ajna) — Between eyebrows — Intuition, insight, vision\n7. Crown (Sahasrara) — Top of head — Spiritual connection, unity\n\nEnergy doesn't just sit in these centers — it FLOWS between them through channels called nadis (yoga) or meridians (TCM). When flow is blocked, we experience physical or emotional symptoms.\n\nPractice: Place your palms 6 inches apart. Slowly move them together and apart. Feel for the subtle magnetic sensation between your hands. This is prana — life force you can learn to direct.",
             "duration": 15, "tool_link": "/mudras"},
            {"id": "e-2", "title": "Mudras as Energy Circuits", "type": "practice",
             "content": "Mudras are not mere hand positions — they are precise electrical circuits that redirect the flow of prana through your subtle body. Each finger represents an element:\n\n- Thumb: Fire (Agni) — willpower, transformation\n- Index: Air (Vayu) — movement, intellect\n- Middle: Space (Akasha) — expansion, connection\n- Ring: Earth (Prithvi) — stability, strength\n- Pinky: Water (Jala) — adaptability, purification\n\nThe Gyan Mudra Protocol (Advanced):\n1. Touch thumb tip to index finger tip\n2. Extend other three fingers comfortably\n3. Rest hands on knees, palms up (receptive) or down (grounding)\n4. Close your eyes and breathe naturally\n5. After 2 minutes, shift attention to the point of contact between thumb and index finger\n6. Notice the subtle warmth or tingling — this is the circuit activating\n7. Now imagine breathing THROUGH this contact point — inhale draws energy in, exhale distributes it\n\nHold for 11 minutes minimum for full effect. The ancient texts say 48 minutes for complete transformation.\n\nCombine with the 396 Hz frequency for grounding, or 528 Hz for heart opening.",
             "duration": 20, "tool_link": "/mudras"},
            {"id": "e-3", "title": "Frequency Resonance & the Body", "type": "theory",
             "content": "Everything vibrates. Every cell, organ, and bone in your body has a resonant frequency. When exposed to specific external frequencies, your body can 'entrain' — synchronize its vibration to match.\n\nThe Solfeggio Frequencies and Their Effects:\n- 174 Hz: Pain reduction, foundation of conscious evolution\n- 285 Hz: Tissue repair, cellular memory healing\n- 396 Hz: Liberating guilt and fear (Root chakra)\n- 417 Hz: Undoing situations, facilitating change (Sacral)\n- 528 Hz: Transformation, DNA repair, 'Love frequency' (Solar Plexus)\n- 639 Hz: Connecting relationships (Heart)\n- 741 Hz: Awakening intuition (Throat)\n- 852 Hz: Returning to spiritual order (Third Eye)\n- 963 Hz: Divine consciousness (Crown)\n\nBinaural beats work differently — they create a 'phantom frequency' when two slightly different tones play in each ear. The brain generates the difference frequency:\n- Delta (0.5-4 Hz): Deep sleep, healing\n- Theta (4-8 Hz): Deep meditation, creativity\n- Alpha (8-13 Hz): Relaxation, flow state\n- Beta (13-30 Hz): Focus, alertness\n- Gamma (30-100 Hz): Peak awareness, insight\n\nPractice: Listen to 528 Hz for 15 minutes while practicing Gyan Mudra. Notice the amplification effect when combining modalities.",
             "duration": 20, "tool_link": "/frequencies"},
            {"id": "e-4", "title": "Chakra Activation Sequence", "type": "practice",
             "content": "This is the crown jewel practice of energy work — a systematic activation of all seven chakras in sequence. This should only be practiced after establishing a foundation in breathwork and meditation.\n\nThe Full Sequence (30 minutes):\n\n1. GROUNDING (3 min): Sit comfortably. Visualize roots extending from your base into the earth. Breathe deeply. Feel gravity.\n\n2. ROOT ACTIVATION (3 min): Focus on the base of your spine. Chant 'LAM' silently or aloud. Visualize a red sphere of light pulsing with each breath.\n\n3. SACRAL (3 min): Shift attention 2 inches below your navel. Chant 'VAM'. Orange sphere. Feel creative energy stirring.\n\n4. SOLAR PLEXUS (3 min): Upper abdomen. 'RAM'. Yellow sphere. Feel your personal power and confidence expanding.\n\n5. HEART (4 min — extra time here): Center of chest. 'YAM'. Green/pink sphere. This is the bridge between lower (physical) and upper (spiritual) chakras. Feel love radiating outward.\n\n6. THROAT (3 min): Throat center. 'HAM'. Blue sphere. Feel your authentic voice clearing.\n\n7. THIRD EYE (3 min): Between eyebrows. 'OM'. Indigo sphere. Feel your inner vision sharpening.\n\n8. CROWN (3 min): Top of head. Silence. Violet/white light. Feel connection to something vast.\n\n9. INTEGRATION (5 min): Visualize a column of white light connecting all seven centers. Breathe and let the energy flow freely.\n\nAftercare: Drink water. Move slowly. Journal any insights immediately.",
             "duration": 35, "tool_link": "/frequencies"},
        ],
    },
    {
        "id": "sound-light-healing",
        "title": "Sound & Light Alchemy",
        "subtitle": "Transform consciousness through sensory immersion",
        "level": 3,
        "color": "#3B82F6",
        "icon": "waves",
        "duration": "3 weeks",
        "prerequisite": "energy-mastery",
        "description": "Discover how sound frequencies, color vibrations, and environmental design can alter your state of consciousness. Combine multiple sensory inputs for amplified healing.",
        "lessons": [
            {"id": "sl-1", "title": "The Science of Sound Resonance", "type": "theory",
             "content": "Sound resonance is one of humanity's oldest contemplative practices. From Aboriginal didgeridoo traditions (40,000+ years) to Tibetan singing bowls to modern binaural beats, every culture discovered that specific sounds alter consciousness.\n\nMechanisms of Sound Resonance:\n\n1. ENTRAINMENT: Your brainwaves synchronize with external rhythmic stimuli. A steady 10 Hz tone will gradually shift your brain toward alpha state.\n\n2. RESONANCE: Every organ has a natural frequency. When a matching frequency is applied externally, the organ vibrates more efficiently — like pushing a swing at its natural rhythm.\n\n3. VAGAL STIMULATION: Low-frequency sounds (especially chanting, humming, and singing bowls) directly stimulate the vagus nerve, activating the parasympathetic nervous system.\n\n4. CYMATICS: Sound literally shapes matter. Dr. Hans Jenny's cymatics experiments show how different frequencies create distinct geometric patterns in sand, water, and other media. Your body is 60% water — imagine what frequencies are doing to your cellular structure.\n\nPractice Protocol:\n- Start with 5 min of humming (feel the vibration in your chest)\n- Transition to 10 min of 528 Hz listening\n- End with 5 min of silence\n- Journal what you notice",
             "duration": 20, "tool_link": "/soundscapes"},
            {"id": "sl-2", "title": "Chromatic Resonance: Working with Color", "type": "practice",
             "content": "Color is visible light — electromagnetic radiation at specific frequencies. Just as sound frequencies affect the body, so do light frequencies.\n\nThe Chromatic Resonance Spectrum:\n\n- RED (625-740nm): Stimulates circulation, raises blood pressure, activates Root chakra. Use for lethargy, cold, low motivation.\n- ORANGE (590-625nm): Boosts creativity, aids digestion, warms the sacral center. Use for creative blocks, emotional stagnation.\n- YELLOW (565-590nm): Stimulates nervous system, enhances mental clarity, strengthens Solar Plexus. Use for brain fog, low confidence.\n- GREEN (500-565nm): Balances, harmonizes, soothes the heart. The most neutral resonant color. Use for emotional turbulence, general alignment.\n- BLUE (450-500nm): Calms, cools the throat center. Use for anxiety, insomnia, overheating.\n- INDIGO (420-450nm): Deepens intuition, supports Third Eye. Use for disconnection from inner wisdom, headaches.\n- VIOLET (380-420nm): Highest visible frequency. Connects to Crown chakra, spiritual awareness. Use for spiritual seeking, transformation.\n\nPractice: Choose the color that corresponds to what you need. Use the Light Resonance tool for a 10-minute immersive session. Combine with the matching chakra tone for amplified effect.\n\nAdvanced: Layer sound + color + mudra for triple-stacking sensory input.",
             "duration": 18, "tool_link": "/light-therapy"},
            {"id": "sl-3", "title": "Crafting Sensory Rituals", "type": "practice",
             "content": "The most powerful wellness practice isn't any single tool — it's the intentional COMBINATION of multiple sensory inputs into a unified experience.\n\nThe Synergy Principle: When you engage multiple senses simultaneously — hearing (soundscapes), seeing (light therapy), feeling (breathing), and directing energy (mudras) — the effects multiply rather than merely add.\n\nDesigning Your Sensory Ritual:\n\n1. SET YOUR INTENTION (1 min): What do you need? Calm? Energy? Clarity? Healing?\n\n2. CHOOSE YOUR STACK based on intention:\n   - CALM: Blue light + Ocean soundscape + 4-7-8 breathing + Dhyana mudra + 432 Hz\n   - ENERGY: Red light + Fire soundscape + Energizing breath + Prana mudra + 396 Hz\n   - CLARITY: Yellow light + Rain soundscape + Box breathing + Gyan mudra + 741 Hz\n   - HEALING: Green light + Forest soundscape + Deep belly breathing + Apana mudra + 528 Hz\n\n3. LAYER SEQUENTIALLY (don't start everything at once):\n   - Minute 0-2: Start breathing pattern\n   - Minute 2-4: Add soundscape\n   - Minute 4-6: Engage light therapy\n   - Minute 6-8: Form mudra\n   - Minute 8-20: Full immersion — let all inputs blend\n   - Minute 20-22: Release mudra, then light, then sound\n   - Minute 22-25: Return to natural breathing in silence\n\nThis layered entry and exit prevents jarring transitions and allows deeper integration.",
             "duration": 25, "tool_link": "/rituals"},
            {"id": "sl-4", "title": "Environmental Design for Practice", "type": "theory",
             "content": "Your practice environment profoundly affects your experience. This lesson covers how to optimize your physical space for deeper states.\n\nThe Five Elements of Sacred Space:\n\n1. LIGHT: Dim, warm lighting (candles ideal). Avoid blue-white LED. Consider colored bulbs for chromotherapy. Dawn and dusk are the most potent natural light times.\n\n2. SOUND: Remove mechanical noise where possible. Add a small water fountain for white noise masking. Have your frequency tools ready.\n\n3. SCENT: Incense, essential oils, or fresh plants. Frankincense deepens meditation. Lavender calms anxiety. Peppermint sharpens focus. Sandalwood grounds.\n\n4. TEXTURE: Your sitting surface matters. Natural materials (cotton, wool, wood) have different vibrational qualities than synthetic. A dedicated cushion or mat becomes 'charged' with practice energy over time.\n\n5. DIRECTION: Traditional practices suggest facing east (direction of sunrise/new beginnings) for morning practice. North for deep meditation. Experiment and notice what feels right.\n\nDigital Environment:\nUse the Zen Garden as your digital sacred space. Nurture your plants before practice. The act of tending your digital garden creates a mindful transition into practice mode.\n\nMinimal Setup: If you can't control your environment, use headphones (soundscapes block external noise) and close your eyes (instant environment change). The most important element is consistent INTENTION.",
             "duration": 15, "tool_link": "/zen-garden"},
        ],
    },
    {
        "id": "integration-mastery",
        "title": "Integration & Mastery",
        "subtitle": "Unify all practices into an awakened daily life",
        "level": 4,
        "color": "#FCD34D",
        "icon": "crown",
        "duration": "4 weeks",
        "prerequisite": "sound-light-healing",
        "description": "The pinnacle of practice: weaving every tool, technique, and insight into a seamless way of living. Transform from practitioner to embodied master.",
        "lessons": [
            {"id": "im-1", "title": "The Art of Non-Doing", "type": "theory",
             "content": "After learning dozens of techniques, the advanced practitioner faces a paradox: the highest practice is no practice at all — or rather, making ALL of life your practice.\n\nWu Wei — The Taoist Art of Non-Doing:\nWu wei doesn't mean passivity. It means acting in perfect alignment with the natural flow of things. Like water flowing downhill — effortless, yet incredibly powerful.\n\nSigns you've arrived at wu wei:\n- You no longer 'try' to meditate — you simply ARE meditative\n- Breath awareness happens spontaneously throughout the day\n- Your body naturally gravitates toward healing foods and movements\n- Emotional reactions are shorter — you feel, process, and release quickly\n- Decisions feel less like choices and more like recognitions\n\nThe Integration Practice:\nFor one full day, make no distinction between 'practice time' and 'regular time.' Maintain the same quality of attention while washing dishes as you do in meditation. Notice the breath while walking. Feel your energy while in conversation.\n\nThis is the real goal of all the previous modules: not to create a perfect practice session, but to dissolve the boundary between practice and life.\n\nThe master meditator doesn't meditate — they live meditatively.",
             "duration": 20, "tool_link": "/meditation"},
            {"id": "im-2", "title": "Emotional Alchemy", "type": "practice",
             "content": "Most people suppress 'negative' emotions or express them destructively. The alchemist does neither — they TRANSFORM emotional energy.\n\nThe Transmutation Protocol:\n\n1. NOTICE: Catch the emotion as early as possible. The sooner you notice, the more energy is available for transformation.\n\n2. NAME: 'I am experiencing anger.' NOT 'I am angry.' This subtle shift creates the observer position.\n\n3. LOCATE: Where in your body is this emotion? Anger often lives in the jaw, fists, and belly. Sadness in the chest and throat. Fear in the gut.\n\n4. BREATHE INTO IT: Don't breathe to make it go away. Breathe to give it MORE space. Expansion, not suppression.\n\n5. FEEL THE CORE: Under anger is usually hurt. Under hurt is usually fear. Under fear is usually love. Keep going deeper.\n\n6. REDIRECT: Once you've reached the core energy, ask: 'How does this energy want to move?' Anger's energy can become fierce determination. Sadness can become deep compassion. Fear can become heightened awareness.\n\nPractice: When a strong emotion arises today, pause for 60 seconds. Run through steps 1-6. Use the Ho'oponopono phrases if needed: 'I'm sorry. Please forgive me. Thank you. I love you.'\n\nThis single skill — emotional alchemy — may be the most valuable thing you learn in this entire program.",
             "duration": 20, "tool_link": "/hooponopono"},
            {"id": "im-3", "title": "Designing Your Unified Practice", "type": "practice",
             "content": "You now have a comprehensive toolkit. This lesson helps you design a sustainable, personalized practice that integrates everything.\n\nThe Unified Practice Framework:\n\nDAILY NON-NEGOTIABLES (15-25 min):\n- Morning: 5 min breathwork + 10 min meditation + 3 affirmations\n- Evening: 5 min body scan + journal entry + 1 min gratitude\n\nWEEKLY DEEP PRACTICES (choose 3-4, rotate):\n- Monday: Chakra activation sequence (30 min)\n- Tuesday: Extended frequency session with mudras (20 min)\n- Wednesday: Sensory ritual stack (25 min)\n- Thursday: Free day — follow intuition\n- Friday: Ho'oponopono forgiveness practice (15 min)\n- Saturday: Mantra meditation (20 min)\n- Sunday: Zen Garden + journaling reflection (20 min)\n\nMONTHLY INTENSIVE (half-day, once per month):\n- Full chakra activation + extended meditation + journaling\n- Review your mood data for patterns\n- Adjust your daily and weekly practice based on what's working\n\nSEASONAL RENEWAL (once per season):\n- Revisit the learning modules that resonated most\n- Set new intentions\n- Try tools you haven't used recently\n\nRemember: The BEST practice is the one you actually DO. A simple 10-minute routine done daily trumps an elaborate 2-hour routine done occasionally.",
             "duration": 20, "tool_link": "/rituals"},
            {"id": "im-4", "title": "The Ongoing Path", "type": "theory",
             "content": "Congratulations — you've completed the Advanced Progressive Learning Modules. But this is not an ending. In fact, the real journey is just beginning.\n\nWhat comes next:\n\n1. DEEPEN, DON'T ACCUMULATE: Resist the urge to seek new techniques. Instead, go deeper into the ones that resonate most. A lifetime of one mudra practiced deeply is worth more than surface knowledge of a hundred.\n\n2. TEACH TO LEARN: Share what you've learned. Teaching forces you to understand at a deeper level. Use the Community features to share insights.\n\n3. TRACK YOUR EVOLUTION: Use mood tracking, journaling, and the recommendation engine to watch your patterns change over months and years. The data tells a story your daily experience might miss.\n\n4. TRUST YOUR INNER TEACHER: By now, you should feel an inner compass guiding your practice. Some days you'll be drawn to silence. Other days to movement. Follow that guidance — your body-mind knows what it needs.\n\n5. RETURN TO BEGINNER'S MIND: Periodically, approach a familiar practice as if for the first time. The breath you've taken 10,000 times in meditation is ALWAYS new if you're truly present.\n\nThe paradox of mastery: The more you know, the more you realize how much there is to discover. This humility IS the practice. This wonder IS the awakening.\n\nYour practice continues with every breath. Namaste.",
             "duration": 15, "tool_link": "/meditation"},
        ],
    },
]

@router.get("/learning/modules")
async def get_learning_modules(user=Depends(get_current_user)):
    """Get all learning modules with user progress."""
    progress = await db.learning_progress.find_one({"user_id": user["id"]}, {"_id": 0})
    if not progress:
        progress = {"user_id": user["id"], "completed_lessons": [], "current_module": "foundations", "started_at": datetime.now(timezone.utc).isoformat()}
        await db.learning_progress.insert_one(progress)
        progress.pop("_id", None)

    completed = progress.get("completed_lessons", [])

    modules_with_progress = []
    for mod in LEARNING_MODULES:
        lesson_ids = [l["id"] for l in mod["lessons"]]
        done = [lid for lid in lesson_ids if lid in completed]
        # Check if prerequisite is met
        unlocked = True
        if mod["prerequisite"]:
            prereq = next((m for m in LEARNING_MODULES if m["id"] == mod["prerequisite"]), None)
            if prereq:
                prereq_lessons = [l["id"] for l in prereq["lessons"]]
                unlocked = all(lid in completed for lid in prereq_lessons)
        modules_with_progress.append({
            "id": mod["id"],
            "title": mod["title"],
            "subtitle": mod["subtitle"],
            "level": mod["level"],
            "color": mod["color"],
            "icon": mod["icon"],
            "duration": mod["duration"],
            "prerequisite": mod["prerequisite"],
            "description": mod["description"],
            "lessons": mod["lessons"],
            "completed_count": len(done),
            "total_lessons": len(lesson_ids),
            "unlocked": unlocked,
            "completed": len(done) == len(lesson_ids),
        })

    return {
        "modules": modules_with_progress,
        "total_completed": len(completed),
        "total_lessons": sum(len(m["lessons"]) for m in LEARNING_MODULES),
    }


@router.post("/learning/complete-lesson")
async def complete_learning_lesson(data: dict, user=Depends(get_current_user)):
    """Mark a learning module lesson as completed."""
    lesson_id = data.get("lesson_id", "")
    if not lesson_id:
        raise HTTPException(status_code=400, detail="lesson_id required")

    # Validate lesson exists
    valid = any(lesson_id == l["id"] for m in LEARNING_MODULES for l in m["lessons"])
    if not valid:
        raise HTTPException(status_code=400, detail="Invalid lesson_id")

    doc = await db.learning_progress.find_one({"user_id": user["id"]})
    if not doc:
        doc = {"user_id": user["id"], "completed_lessons": [], "current_module": "foundations", "started_at": datetime.now(timezone.utc).isoformat()}
        await db.learning_progress.insert_one(doc)

    completed = doc.get("completed_lessons", [])
    if lesson_id not in completed:
        completed.append(lesson_id)

    # Determine current module
    current_module = "foundations"
    for mod in LEARNING_MODULES:
        mod_lessons = [l["id"] for l in mod["lessons"]]
        if all(lid in completed for lid in mod_lessons):
            idx = LEARNING_MODULES.index(mod)
            if idx + 1 < len(LEARNING_MODULES):
                current_module = LEARNING_MODULES[idx + 1]["id"]
            else:
                current_module = mod["id"]

    await db.learning_progress.update_one(
        {"user_id": user["id"]},
        {"$set": {"completed_lessons": completed, "current_module": current_module}},
        upsert=True
    )

    return {"completed_lessons": completed, "current_module": current_module, "lesson_id": lesson_id}



