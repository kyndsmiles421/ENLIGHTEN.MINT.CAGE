import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Lock, Check, ChevronRight, ArrowLeft, Play, Sparkles,
  Wind, Timer, Music, Headphones, Radio, Lightbulb, Hand,
  Heart, Sprout, Triangle, Sun, BookOpen, Loader2, Volume2
} from 'lucide-react';
import { Slider } from '../components/ui/slider';
import { useAuth } from '../context/AuthContext';
import { useSensory } from '../context/SensoryContext';
import NarrationPlayer from '../components/NarrationPlayer';
import CelebrationBurst from '../components/CelebrationBurst';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STAGE_IMAGES = {
  0: 'https://static.prod-images.emergentagent.com/jobs/6b549655-e34a-4903-8684-60556dd46642/images/0242128527ed8bbfd3171368dce4b460cd954dfad75f77b5e40c9d30e161c0ed.png',
  1: 'https://static.prod-images.emergentagent.com/jobs/6b549655-e34a-4903-8684-60556dd46642/images/7eee011f295da07138599b27eefa0bd9ed58e262c5d9ca0439a50bebfe2e2175.png',
  2: 'https://static.prod-images.emergentagent.com/jobs/6b549655-e34a-4903-8684-60556dd46642/images/73fdbcae5ff02ced0e5f9efb0eb6ecfaf49cf9b59be1431f25e138be03fab419.png',
  3: 'https://static.prod-images.emergentagent.com/jobs/6b549655-e34a-4903-8684-60556dd46642/images/aa50dc006c7e8dbd4ea9d9c8e3e21fba0cebe41b64c37a9d4dd8628883377245.png',
  4: 'https://static.prod-images.emergentagent.com/jobs/6b549655-e34a-4903-8684-60556dd46642/images/cd01b7daa0918967ec9fc21e17e425cc79e9a668bedd9808f932b5143d334681.png',
};

const STAGES = [
  {
    id: 0, title: 'Foundation', subtitle: 'Awaken Your Awareness',
    color: '#C084FC', icon: Sparkles,
    desc: 'Begin your journey by understanding the foundations of holistic wellness. Learn to set powerful intentions and understand the energy that flows through all living things.',
    lessons: [
      {
        id: 's0-welcome', title: 'Welcome to Your Journey',
        desc: 'Understand what holistic wellness means and how this path will transform your daily life.',
        visual: 'intention',
        narration: 'Welcome to The ENLIGHTEN.MINT.CAFE. This journey will guide you through ancient and modern wellness practices — from breathwork to meditation, sound resonance to sacred rituals. Each stage builds upon the last, creating a comprehensive foundation for your well-being. There is no rush. Move at your own pace. The most important thing is to show up with an open heart and a curious mind. Let us begin.',
        content: [
          { type: 'text', value: 'Holistic wellness is the understanding that your well-being is not just physical — it encompasses your mind, emotions, energy, and spirit. When these are in harmony, you experience vitality, clarity, and deep inner peace.' },
          { type: 'text', value: 'In this journey, you will explore practices from traditions spanning thousands of years — yogic breathing, Buddhist meditation, Hawaiian forgiveness, sound resonance, sacred geometry, and more.' },
          { type: 'tip', value: 'Set an intention now: What do you hope to gain from this journey? Write it down or hold it in your heart.' },
        ],
        tryLink: '/journal',
        tryLabel: 'Set Your Intention in Journal',
      },
      {
        id: 's0-energy', title: 'Understanding Life Force Energy',
        desc: 'Learn about prana, chi, and the vital energy that powers your body and mind.',
        visual: 'energy',
        narration: 'Every living thing is sustained by a vital life force energy. In yoga, it is called Prana. In Chinese medicine, it is Chi. In Japanese tradition, it is Ki. This energy flows through channels in your body, nourishing every cell, organ, and thought. When this energy flows freely, you feel vibrant, clear, and alive. When it is blocked, you may feel tired, anxious, or unwell. The practices in this journey are all designed to cultivate, balance, and direct this energy for your highest good.',
        content: [
          { type: 'text', value: 'Life force energy goes by many names: Prana (Sanskrit), Chi/Qi (Chinese), Ki (Japanese), Mana (Hawaiian), Ruach (Hebrew). Despite different names, all traditions describe the same fundamental energy that animates all life.' },
          { type: 'chakra_visual' },
          { type: 'text', value: 'This energy flows through your body via channels (nadis in yoga, meridians in TCM) and concentrates at seven major energy centers called chakras.' },
          { type: 'tip', value: 'Place your palms facing each other about 6 inches apart. Slowly move them closer and farther. Can you feel a subtle warmth or tingling? That is your energy field.' },
        ],
        tryLink: '/light-therapy',
        tryLabel: 'Explore Chakra Energy with Light Resonance',
      },
      {
        id: 's0-mindfulness', title: 'The Art of Being Present',
        desc: 'Discover mindfulness — the foundation of every practice in this journey.',
        visual: 'present',
        narration: 'Mindfulness is simply the practice of being fully present in this moment — without judgment, without trying to change anything. It is the foundation upon which every other practice in this journey is built. When you breathe consciously, you are mindful. When you chant a mantra with full attention, you are mindful. When you listen to resonant sounds with open awareness, you are mindful. Right now, take a moment. Feel your feet on the ground. Feel the air entering your nostrils. Hear the sounds around you. This is mindfulness.',
        content: [
          { type: 'text', value: 'Mindfulness is not about emptying your mind or achieving a special state. It is simply the practice of paying attention to the present moment with kindness and curiosity.' },
          { type: 'text', value: 'Research shows that regular mindfulness practice reduces stress hormones by up to 23%, increases grey matter in brain regions associated with emotional regulation, and improves immune function.' },
          { type: 'mini_tool', tool: 'breathing_30s' },
          { type: 'tip', value: 'Try this: For the next 30 seconds, simply observe your natural breath without changing it. Notice the inhale, the pause, and the exhale. This is your first meditation.' },
        ],
        tryLink: '/meditation',
        tryLabel: 'Try a Guided Meditation',
      },
      {
        id: 's0-daily', title: 'Creating Your Daily Practice',
        desc: 'Learn how to build a sustainable wellness routine that fits your life.',
        visual: 'routine',
        narration: 'The most powerful practice is the one you actually do. It does not need to be long or complicated. Even five minutes of conscious breathing each morning can transform your entire day. The key is consistency, not intensity. Start small. Choose one practice that resonates with you, and commit to doing it for just five minutes a day. As it becomes natural, you can gradually add more. Your morning sets the tone for your entire day. Instead of reaching for your phone, try reaching for your breath first.',
        content: [
          { type: 'text', value: 'A daily wellness practice does not need to be hours long. Research shows that even 5-10 minutes of consistent practice creates measurable changes in your brain and body within 8 weeks.' },
          { type: 'routine_builder' },
          { type: 'text', value: 'The best time for practice is whenever works for you. Many traditions recommend early morning (the "Brahma Muhurta" — 4-6am) when the mind is naturally calm. But any time you can commit to consistently is the right time.' },
          { type: 'tip', value: 'Start with just one practice from this journey. Do it for 5 minutes every day for one week before adding anything else.' },
        ],
        tryLink: '/dashboard',
        tryLabel: 'Track Your Progress on Dashboard',
      },
    ],
  },
  {
    id: 1, title: 'Breath & Body', subtitle: 'Harness Your Vital Force',
    color: '#2DD4BF', icon: Wind,
    desc: 'Your breath is the bridge between body and mind. Learn foundational breathing techniques and gentle body movements to activate your life force energy.',
    lessons: [
      {
        id: 's1-breath-intro', title: 'The Science of Breath',
        desc: 'Understand how conscious breathing transforms your nervous system.',
        visual: 'breath_science',
        narration: 'Your breath is the only bodily function that is both automatic and voluntary. This makes it a unique gateway between your conscious and unconscious mind. When you breathe slowly and deeply, you activate your parasympathetic nervous system — the rest and digest mode. Your heart rate slows, blood pressure drops, and stress hormones decrease. When you breathe rapidly, you activate the sympathetic nervous system — the fight or flight response. By learning to control your breath, you learn to control your state of being.',
        content: [
          { type: 'text', value: 'Pranayama — the yogic science of breath control — has been practiced for over 5,000 years. Modern science confirms what ancient yogis knew: conscious breathing directly influences your autonomic nervous system, brain waves, and emotional state.' },
          { type: 'text', value: 'Key facts: You take about 20,000 breaths per day. Most people use only 30% of their lung capacity. Deep diaphragmatic breathing can reduce cortisol (stress hormone) by up to 50%.' },
          { type: 'mini_tool', tool: 'diaphragm_check' },
          { type: 'tip', value: 'Place one hand on your chest and one on your belly. Breathe naturally. Which hand moves more? If it is your chest, you are breathing shallowly. Practice letting your belly expand with each inhale.' },
        ],
        tryLink: '/breathing',
        tryLabel: 'Practice Breathing Exercises',
      },
      {
        id: 's1-box', title: 'Box Breathing Mastery',
        desc: 'Master the foundational 4-4-4-4 breathing pattern used by elite performers.',
        visual: 'box_breathing',
        narration: 'Box breathing, also called square breathing, is a technique used by Navy SEALs, surgeons, and elite athletes to maintain calm focus under pressure. The pattern is simple: inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold empty for 4 seconds. This creates a perfect square of breath. The equal timing balances your nervous system and brings your mind to a single point of focus. Let us practice together. Inhale... two, three, four. Hold... two, three, four. Exhale... two, three, four. Hold... two, three, four.',
        content: [
          { type: 'text', value: 'Box Breathing (Sama Vritti Pranayama) creates equal ratios of inhalation, retention, exhalation, and suspension. This balance harmonizes the two branches of your autonomic nervous system.' },
          { type: 'mini_tool', tool: 'box_breathing' },
          { type: 'text', value: 'Practice this for 4 cycles to start, gradually working up to 10 cycles. You can do this anywhere — at your desk, before a meeting, or when you feel stress rising.' },
          { type: 'tip', value: 'If holding for 4 seconds feels difficult, start with 3-3-3-3 and work your way up.' },
        ],
        tryLink: '/breathing',
        tryLabel: 'Explore All Breathing Patterns',
      },
      {
        id: 's1-478', title: 'The 4-7-8 Sleep Breath',
        desc: 'Learn the powerful relaxation breathing technique for deep rest.',
        visual: 'relaxation',
        narration: 'The 4-7-8 breathing technique was developed by Dr. Andrew Weil, based on the ancient pranayama practice of breath retention. It is one of the most effective natural tools for falling asleep and reducing anxiety. Inhale through your nose for 4 seconds. Hold your breath for 7 seconds. Exhale slowly through your mouth for 8 seconds. The extended exhale activates your vagus nerve, triggering deep relaxation. Many people find they fall asleep within 3 cycles of this technique.',
        content: [
          { type: 'text', value: 'The 4-7-8 pattern works because the extended exhale phase is twice the length of the inhale. This ratio powerfully activates the parasympathetic nervous system, sending a clear signal to your body that it is safe to relax.' },
          { type: 'mini_tool', tool: 'breathing_478' },
          { type: 'text', value: 'Practice this twice daily — once in the morning and once before bed. After 4-6 weeks of consistent practice, many people report falling asleep within 60 seconds.' },
          { type: 'tip', value: 'Place the tip of your tongue against the ridge behind your upper front teeth during the entire exercise. This connects two major energy meridians.' },
        ],
        tryLink: '/breathing',
        tryLabel: 'Try 4-7-8 Breathing',
      },
      {
        id: 's1-movement', title: 'Mindful Movement',
        desc: 'Introduction to Qigong and gentle energy exercises.',
        visual: 'qigong',
        narration: 'Movement is medicine. When you combine conscious breathing with gentle, intentional movement, you create a powerful practice for health and vitality. Qigong, which means energy cultivation, has been practiced in China for over 4,000 years. The slow, flowing movements massage your internal organs, open your energy meridians, and build your life force. You do not need to be flexible or athletic. Qigong meets you where you are.',
        content: [
          { type: 'text', value: 'Qigong (Chi Kung) combines slow movement, breathing, and mental focus to cultivate and balance life force energy. Studies show it reduces chronic pain by 40%, improves balance by 30%, and significantly reduces blood pressure.' },
          { type: 'text', value: 'Key principle: In Qigong, the mind leads the chi, and the chi leads the body. Where your attention goes, energy flows.' },
          { type: 'tip', value: 'Try this now: Stand with feet shoulder-width apart. Slowly raise your arms as you inhale, palms facing up. Lower them as you exhale, palms pressing down. Repeat 5 times. Feel the energy between your palms.' },
        ],
        tryLink: '/exercises',
        tryLabel: 'Explore Qigong Exercises',
      },
    ],
  },
  {
    id: 2, title: 'Mind & Meditation', subtitle: 'Journey Inward',
    color: '#A78BFA', icon: Timer,
    desc: 'Meditation is the art of coming home to yourself. Explore guided meditations, mantra practice, and the resonant power of forgiveness.',
    lessons: [
      {
        id: 's2-meditation-intro', title: 'What Is Meditation?',
        desc: 'Dispel common myths and understand what meditation truly is.',
        visual: 'meditation_intro',
        narration: 'Meditation is not about stopping your thoughts. It is not about achieving a blank mind or floating in bliss. Meditation is simply the practice of observing your inner world with curiosity and compassion. When you sit to meditate, thoughts will come. That is normal. The practice is in noticing them and gently returning your attention to your anchor — whether that is your breath, a mantra, or a sound. Each time you return, you strengthen your attention muscle. Over time, you develop a peaceful awareness that stays with you throughout your day.',
        content: [
          { type: 'text', value: 'Common myths about meditation: "I need to stop thinking" (No — you observe thoughts without following them), "I need to sit cross-legged" (Any comfortable position works), "I need hours of practice" (Even 5 minutes creates measurable benefits).' },
          { type: 'text', value: 'Neuroscience research shows meditation increases cortical thickness, improves attention span, reduces amygdala reactivity (less emotional hijacking), and even slows brain aging.' },
          { type: 'tip', value: 'Start with just 3 minutes. Set a timer, close your eyes, and focus on your breath. When thoughts arise, label them "thinking" and return to your breath. That is meditation.' },
        ],
        tryLink: '/meditation',
        tryLabel: 'Try a Guided Meditation',
      },
      {
        id: 's2-guided', title: 'Your First Guided Session',
        desc: 'Experience a complete beginner-friendly guided meditation.',
        visual: 'guided_session',
        narration: 'Let us do a simple guided meditation together. Find a comfortable seat. Close your eyes or soften your gaze. Take three deep breaths to arrive in this moment. Now, let your breathing return to its natural rhythm. Simply observe it. Feel the air entering through your nostrils, cool and fresh. Feel it leaving, warm and soft. Your mind will wander. That is perfectly natural. Each time it does, gently guide it back to the breath. There is nowhere to go. Nothing to achieve. Just this breath, this moment, this awareness. You are doing beautifully.',
        content: [
          { type: 'text', value: 'Guided meditations are perfect for beginners because they give your mind something to follow. As you grow in practice, you can gradually move toward unguided silence.' },
          { type: 'mini_tool', tool: 'mini_meditation' },
          { type: 'text', value: 'After your session, take a moment to notice how you feel. Is your mind calmer? Your body more relaxed? This awareness is part of the practice.' },
          { type: 'tip', value: 'Try meditating at the same time each day. Consistency helps your brain shift into meditation mode more easily over time.' },
        ],
        tryLink: '/meditation',
        tryLabel: 'Explore Full Guided Meditations',
      },
      {
        id: 's2-mantras', title: 'The Power of Mantra',
        desc: 'Discover how sacred sounds can quiet the mind and elevate consciousness.',
        visual: 'mantra_power',
        narration: 'A mantra is a sacred sound, word, or phrase repeated during meditation. The word comes from Sanskrit: man means mind, tra means instrument or vehicle. A mantra is literally an instrument of the mind. The simplest and most universal mantra is Om — the primordial sound from which all creation emerged. When you chant Om, you align your vibration with the fundamental frequency of the universe. Let us try it together. Take a deep breath in. And chant: Ommmmm. Feel the vibration in your chest, your throat, your crown. This is the power of mantra.',
        content: [
          { type: 'text', value: 'Mantras work on multiple levels: physically, the vibrations massage internal organs and stimulate the vagus nerve. Mentally, the repetition gives the mind a single focus point. Spiritually, the sacred sounds connect you to higher states of consciousness.' },
          { type: 'mini_tool', tool: 'so_hum' },
          { type: 'text', value: '"So Hum" — meaning "I am That" — is the perfect beginner mantra because it naturally synchronizes with your breath. "So" on the inhale, "Hum" on the exhale.' },
          { type: 'tip', value: 'Start with "So Hum" for 5 minutes. Silently think "So" as you breathe in, "Hum" as you breathe out. Let the mantra become effortless.' },
        ],
        tryLink: '/mantras',
        tryLabel: 'Explore the Mantra Library',
      },
      {
        id: 's2-hooponopono', title: 'Forgiveness Resonance',
        desc: "Learn Ho'oponopono — the Hawaiian practice of reconciliation and love.",
        visual: 'forgiveness',
        narration: "Ho'oponopono is a profound Hawaiian practice of forgiveness and reconciliation. It uses four simple yet powerful phrases: I'm sorry. Please forgive me. Thank you. I love you. These phrases are directed inward — toward yourself, toward a memory, toward a situation, or toward another person held in your awareness. The practice teaches that everything in your experience is your responsibility. Not as blame, but as empowerment. If it exists in your consciousness, you have the power to heal it. Through these four phrases, you cleanse, forgive, and restore harmony.",
        content: [
          { type: 'text', value: "Ho'oponopono (ho-oh-po-no-po-no) translates to 'to make right' or 'to correct an error.' It is an ancient Hawaiian practice modernized by Morrnah Simeona and later Dr. Ihaleakala Hew Len, who reportedly supported a ward of vulnerable people without ever seeing them — by practicing Ho'oponopono on himself." },
          { type: 'hooponopono_mini' },
          { type: 'text', value: "The four phrases work together: 'I\\'m sorry' acknowledges the pain. 'Please forgive me' asks for release. 'Thank you' expresses gratitude for the alignment. 'I love you' sends the highest frequency — unconditional love." },
          { type: 'tip', value: "Think of someone you have a difficult relationship with. Hold them in your heart, and silently repeat: I'm sorry. Please forgive me. Thank you. I love you. Notice what shifts." },
        ],
        tryLink: '/hooponopono',
        tryLabel: "Practice Ho'oponopono",
      },
    ],
  },
  {
    id: 3, title: 'Sound & Senses', subtitle: 'Resonance Through Vibration',
    color: '#38BDF8', icon: Headphones,
    desc: 'Everything in the universe vibrates. Learn to use sound, frequency, light, and affirmation as powerful tools for resonance and transformation.',
    lessons: [
      {
        id: 's3-soundscapes', title: 'The Resonant Power of Sound',
        desc: 'Learn how ambient sounds rewire your brain for calm and focus.',
        visual: 'sound_healing',
        narration: 'Sound has been used for resonant practice since the beginning of human civilization. From the chanting of monks in medieval monasteries to the singing bowls of Tibet, from the didgeridoo of Aboriginal Australians to the icaros of Amazonian shamans — every culture discovered that certain sounds can soothe, calm, and transform consciousness. Modern neuroscience confirms this: specific sound frequencies entrain your brain waves, shifting you from stressed beta states into calm alpha and deep theta states. You do not need to understand the science to feel the effect. Simply listen, and let the sounds carry you.',
        content: [
          { type: 'text', value: 'Neuroacoustic research shows that nature sounds (rain, ocean, birdsong) reduce cortisol levels and lower sympathetic nervous system activation. The brain interprets these sounds as "safe environment" signals, allowing deep relaxation.' },
          { type: 'text', value: 'Sound resonance is now used in studios and retreats worldwide: singing bowls for relaxation, binaural beats for focus, nature sounds for improved sleep, and music as a contemplative companion.' },
          { type: 'tip', value: 'Try mixing Rain and Singing Bowls at low volume while you work or study. Notice how your focus and mood shift over 30 minutes.' },
        ],
        tryLink: '/soundscapes',
        tryLabel: 'Create Your Soundscape Mix',
      },
      {
        id: 's3-frequencies', title: 'Solfeggio & Sacred Frequencies',
        desc: 'Discover the resonant frequencies that resonate with your body and soul.',
        visual: 'frequencies',
        narration: 'In the 11th century, a Benedictine monk named Guido d Arezzo developed the Solfeggio scale — a set of sacred frequencies used in Gregorian chants. These frequencies were believed to impart spiritual blessings. The most famous is 528 Hertz, known as the Love Frequency or the Miracle Tone. Tradition holds it carries restorative resonance at a cellular level. 396 Hertz liberates guilt and fear. 639 Hertz harmonizes relationships. 741 Hertz awakens intuition. 852 Hertz returns to spiritual order. Each frequency is a key that unlocks a different aspect of resonance.',
        content: [
          { type: 'text', value: 'The Solfeggio Frequencies: 174 Hz (deep grounding), 285 Hz (tissue resonance), 396 Hz (liberation from fear), 417 Hz (facilitating change), 528 Hz (love), 639 Hz (relationships), 741 Hz (intuition), 852 Hz (spiritual order), 963 Hz (divine connection).' },
          { type: 'text', value: 'Binaural beats work by playing slightly different frequencies in each ear. Your brain creates a third "phantom" frequency equal to the difference. For example, 200 Hz in one ear and 210 Hz in the other creates a 10 Hz alpha wave — associated with calm focus.' },
          { type: 'tip', value: 'Use headphones for binaural beats — the effect requires different frequencies in each ear. Start with 10 minutes and gradually increase.' },
        ],
        tryLink: '/frequencies',
        tryLabel: 'Experience Resonant Frequencies',
      },
      {
        id: 's3-light', title: 'Chromatic Resonance & Light',
        desc: 'Learn how different colors of light affect your energy and mood.',
        visual: 'chromotherapy',
        narration: 'Color is simply light vibrating at different frequencies. Each color carries a unique energy that affects your body and mind. Red stimulates vitality and grounds you in your physical body. Orange ignites creativity and emotional flow. Yellow boosts confidence and personal power. Green heals the heart and restores balance. Blue calms the mind and aids communication. Indigo deepens intuition. Violet connects you to spiritual awareness. By intentionally bathing in these colors, you can shift your energy and support specific aspects of your well-being.',
        content: [
          { type: 'text', value: 'Chromatic resonance (color attunement) has roots in ancient Egyptian and Greek cultural practice. Many practitioners observe that blue tones bring calm, red tones invite warmth, and green tones soothe the senses.' },
          { type: 'chakra_colors' },
          { type: 'text', value: 'Each of the seven chakras corresponds to a color: Root (Red), Sacral (Orange), Solar Plexus (Yellow), Heart (Green), Throat (Blue), Third Eye (Indigo), Crown (Violet).' },
          { type: 'tip', value: 'If you feel anxious, try a blue light resonance session. If you feel lethargic, try red or orange. Let your intuition guide your color choice.' },
        ],
        tryLink: '/light-therapy',
        tryLabel: 'Start a Light Resonance Session',
      },
      {
        id: 's3-affirmations', title: 'The Science of Affirmations',
        desc: 'Understand how positive self-talk rewires your neural pathways.',
        visual: 'affirmations',
        narration: 'Your brain does not distinguish between real experiences and vividly imagined ones. When you repeat an affirmation with genuine feeling, your brain begins to form new neural pathways that align with that belief. This is called neuroplasticity — your brain is ability to rewire itself throughout your entire life. Affirmations are not wishful thinking. They are a deliberate practice of directing your subconscious mind toward the reality you want to create. The key is repetition, emotion, and belief. Choose affirmations that feel true in your body, not just your mind.',
        content: [
          { type: 'text', value: 'Neuroscience research shows that self-affirmation activates the ventromedial prefrontal cortex — the brain region associated with self-related processing and positive valuation. Regular practice can reduce stress response and improve problem-solving under pressure.' },
          { type: 'text', value: 'Effective affirmations are: present tense ("I am" not "I will be"), emotionally charged, specific, and believable. If "I am wealthy" feels false, try "I am open to abundance flowing into my life."' },
          { type: 'tip', value: 'Create a set of 3-5 affirmations for your current life focus. Repeat them each morning while looking in a mirror. The mirror adds visual reinforcement.' },
        ],
        tryLink: '/affirmations',
        tryLabel: 'Generate AI-Powered Affirmations',
      },
    ],
  },
  {
    id: 4, title: 'Sacred Practices', subtitle: 'Ancient Wisdom for Modern Life',
    color: '#F59E0B', icon: Sparkles,
    desc: 'Explore the deeper dimensions of wellness through sacred geometry, hand mudras, oracle wisdom, and the art of creating your own personal practices.',
    lessons: [
      {
        id: 's4-mudras', title: 'Sacred Hand Gestures',
        desc: 'Learn how mudras direct energy flow and activate inner alignment.',
        visual: 'mudras',
        narration: 'Mudras are sacred hand gestures that have been used for thousands of years in yoga, meditation, and contemplative traditions. The word mudra comes from Sanskrit, meaning seal or gesture. Each finger represents one of the five elements: thumb is fire, index is air, middle is space, ring is earth, and pinky is water. By touching specific fingers together, you create energy circuits that direct prana to different areas of your body and consciousness. Gyan Mudra — touching your index finger to your thumb — is perhaps the most well-known. It enhances wisdom, focus, and calm.',
        content: [
          { type: 'text', value: 'There are over 100 known mudras, each with specific therapeutic effects. The five fingers correspond to five elements: Thumb (Fire/Agni), Index (Air/Vayu), Middle (Space/Akasha), Ring (Earth/Prithvi), Pinky (Water/Jala).' },
          { type: 'text', value: 'Research at the National Institute of Mental Health and Neurosciences found that specific mudras can alter brain wave patterns, with Gyan Mudra increasing alpha waves (associated with relaxation and creativity).' },
          { type: 'tip', value: 'Try Gyan Mudra now: Touch the tip of your index finger to the tip of your thumb. Keep the other three fingers extended. Rest your hands on your knees, palms up. Hold for 5 minutes while breathing deeply.' },
        ],
        tryLink: '/mudras',
        tryLabel: 'Explore All 25 Mudras',
      },
      {
        id: 's4-yantra', title: 'Sacred Geometry & Yantra',
        desc: 'Discover the visual meditation tools of sacred geometric patterns.',
        visual: 'yantra',
        narration: 'Sacred geometry is the language of creation. From the spiral of galaxies to the pattern of a sunflower, from the structure of DNA to the shape of snowflakes — geometry is the blueprint of existence. Yantras are sacred geometric diagrams used in tantric traditions as visual meditation tools. The most famous is the Sri Yantra, composed of nine interlocking triangles that represent the union of masculine and feminine divine energies. Meditating on a yantra is believed to quiet the mind, activate higher consciousness, and connect you with the cosmic intelligence that designed the universe.',
        content: [
          { type: 'text', value: 'Sacred geometry appears everywhere in nature: the Golden Ratio (1.618) in spiral shells and flower petals, the Fibonacci sequence in pine cones and galaxies, the Flower of Life pattern in molecular structures.' },
          { type: 'text', value: 'Yantra meditation involves gazing softly at the center of the geometric pattern, allowing your vision to soften and your awareness to expand. This trataka (gazing) practice improves concentration and activates the third eye center.' },
          { type: 'tip', value: 'Find a quiet space. Gaze at the center of a yantra for 3 minutes without blinking if possible. When your eyes water, close them and observe the afterimage. This is your meditation.' },
        ],
        tryLink: '/yantra',
        tryLabel: 'Explore Sacred Yantras',
      },
      {
        id: 's4-oracle', title: 'Intuitive Guidance & Oracle',
        desc: 'Learn to access your inner wisdom through oracle and divination tools.',
        visual: 'oracle',
        narration: 'Oracle tools — tarot cards, runes, I Ching, and similar systems — are not about predicting the future. They are mirrors for your subconscious mind. When you ask a question and draw a card, the symbolism reflects patterns and truths that your conscious mind may not yet perceive. Think of the oracle as a conversation with your deeper self. The answer was always within you. The oracle simply gives it form and language. Approach with respect, genuine curiosity, and an open heart. The most powerful question is never what will happen, but what do I need to understand.',
        content: [
          { type: 'text', value: 'Oracle tools work through the principle of synchronicity — meaningful coincidences that Carl Jung described as events connected by meaning rather than causality. Your unconscious mind, connected to a greater field of intelligence, guides you to the message you need.' },
          { type: 'text', value: 'AI-powered oracle readings combine ancient wisdom traditions with modern language processing to create deeply personal, relevant guidance for your specific questions and life circumstances.' },
          { type: 'tip', value: 'Before consulting the oracle, sit quietly for a moment. Clarify your question. The best questions are open-ended: "What do I need to know about..." rather than "Will I..."' },
        ],
        tryLink: '/oracle',
        tryLabel: 'Consult the AI Oracle',
      },
      {
        id: 's4-personal', title: 'Creating Your Personal Practice',
        desc: 'Combine everything you have learned into a practice uniquely yours.',
        visual: 'personal_practice',
        narration: 'Congratulations. You have traveled through the foundations of holistic wellness — from breathwork to meditation, from sound resonance to sacred practices. Now it is time to create a practice that is uniquely yours. There is no single right way. Your practice should reflect your goals, your lifestyle, and what resonates most deeply with you. Perhaps your morning begins with 5 minutes of breathing, followed by a short meditation and 3 affirmations. Perhaps your evening includes a soundscape bath and journaling. The beauty is that you now have the tools. Trust your intuition. Your inner wisdom knows exactly what you need.',
        content: [
          { type: 'text', value: 'You have now learned: conscious breathing, meditation, mantra practice, forgiveness, sound resonance, frequency alignment, light resonance, affirmations, mudras, sacred geometry, and oracle guidance. These are powerful tools for lifelong well-being.' },
          { type: 'text', value: 'Remember: The app has "Build Your Own" features in Breathing, Affirmations, Soundscapes, Mantras, and Meditations. Use these to create practices tailored exactly to your needs.' },
          { type: 'tip', value: 'Write down your ideal daily practice. Keep it to 15-20 minutes to start. As the Buddha said: "A jug fills drop by drop." Consistency is everything.' },
        ],
        tryLink: '/create',
        tryLabel: 'Visit the Creation Studio',
      },
    ],
  },
];

/* ====== MINI TOOLS ====== */

function MiniBreathing30s() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState('ready');
  const [timer, setTimer] = useState(30);
  const intervalRef = useRef(null);

  const start = () => {
    setActive(true); setTimer(30); setPhase('Breathe naturally');
    intervalRef.current = setInterval(() => {
      setTimer(t => { if (t <= 1) { clearInterval(intervalRef.current); setActive(false); setPhase('done'); return 0; } return t - 1; });
    }, 1000);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <div className="p-6 rounded-2xl text-center" style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)' }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#2DD4BF' }}>30-Second Mindful Breathing</p>
      {!active && phase !== 'done' && (
        <button onClick={start} className="btn-glass px-6 py-2 text-sm" data-testid="mini-breathe-start">
          <Play size={14} className="inline mr-2" /> Start
        </button>
      )}
      {active && (
        <div>
          <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 4, repeat: Infinity }}
            className="w-16 h-16 rounded-full mx-auto mb-3" style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.3) 0%, transparent 70%)' }} />
          <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#2DD4BF' }}>{timer}s</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{phase}</p>
        </div>
      )}
      {phase === 'done' && <p className="text-sm" style={{ color: '#2DD4BF' }}>Well done. Notice how you feel.</p>}
    </div>
  );
}

function MiniBoxBreathing() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState('ready');
  const [count, setCount] = useState(4);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef(null);
  const phaseRef = useRef('inhale');

  const start = () => {
    setActive(true); setCycles(0);
    phaseRef.current = 'inhale'; setPhase('Inhale'); setCount(4);
    intervalRef.current = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          const next = { inhale: 'hold1', hold1: 'exhale', exhale: 'hold2', hold2: 'inhale' };
          const labels = { inhale: 'Inhale', hold1: 'Hold', exhale: 'Exhale', hold2: 'Hold' };
          if (phaseRef.current === 'hold2') setCycles(cy => { if (cy >= 3) { clearInterval(intervalRef.current); setActive(false); setPhase('done'); return cy + 1; } return cy + 1; });
          phaseRef.current = next[phaseRef.current];
          setPhase(labels[phaseRef.current]);
          return 4;
        }
        return c - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <div className="p-6 rounded-2xl text-center" style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)' }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#2DD4BF' }}>Box Breathing Practice</p>
      {!active && phase !== 'done' && (
        <button onClick={start} className="btn-glass px-6 py-2 text-sm" data-testid="mini-box-start">
          <Play size={14} className="inline mr-2" /> 4 Cycles
        </button>
      )}
      {active && (
        <div>
          <motion.div animate={{ scale: phase === 'Inhale' ? 1.4 : phase === 'Exhale' ? 1 : undefined }}
            transition={{ duration: 4 }}
            className="w-16 h-16 rounded-xl mx-auto mb-3" style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.3) 0%, transparent 70%)' }} />
          <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#2DD4BF' }}>{count}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{phase} — Cycle {cycles + 1}/4</p>
        </div>
      )}
      {phase === 'done' && <p className="text-sm" style={{ color: '#2DD4BF' }}>4 cycles complete. Feel the calm.</p>}
    </div>
  );
}

function MiniBreathing478() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState('ready');
  const [count, setCount] = useState(4);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef(null);
  const phaseRef = useRef('inhale');

  const start = () => {
    setActive(true); setCycles(0);
    phaseRef.current = 'inhale'; setPhase('Inhale'); setCount(4);
    intervalRef.current = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          const durations = { inhale: 7, hold: 8, exhale: 4 };
          const next = { inhale: 'hold', hold: 'exhale', exhale: 'inhale' };
          const labels = { inhale: 'Inhale', hold: 'Hold', exhale: 'Exhale' };
          if (phaseRef.current === 'exhale') setCycles(cy => { if (cy >= 2) { clearInterval(intervalRef.current); setActive(false); setPhase('done'); return cy + 1; } return cy + 1; });
          phaseRef.current = next[phaseRef.current];
          setPhase(labels[phaseRef.current]);
          return durations[phaseRef.current];
        }
        return c - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <div className="p-6 rounded-2xl text-center" style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)' }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#A78BFA' }}>4-7-8 Breathing</p>
      {!active && phase !== 'done' && (
        <button onClick={start} className="btn-glass px-6 py-2 text-sm" data-testid="mini-478-start">
          <Play size={14} className="inline mr-2" /> 3 Cycles
        </button>
      )}
      {active && (
        <div>
          <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#A78BFA' }}>{count}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{phase} — Cycle {cycles + 1}/3</p>
        </div>
      )}
      {phase === 'done' && <p className="text-sm" style={{ color: '#A78BFA' }}>Deep relaxation activated. Notice your body.</p>}
    </div>
  );
}

function MiniMeditation() {
  const [active, setActive] = useState(false);
  const [timer, setTimer] = useState(120);
  const intervalRef = useRef(null);

  const start = () => {
    setActive(true); setTimer(120);
    intervalRef.current = setInterval(() => {
      setTimer(t => { if (t <= 1) { clearInterval(intervalRef.current); setActive(false); return 0; } return t - 1; });
    }, 1000);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);
  const mins = Math.floor(timer / 60); const secs = timer % 60;

  return (
    <div className="p-6 rounded-2xl text-center" style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)' }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#A78BFA' }}>2-Minute Meditation</p>
      {!active && timer > 0 && (
        <button onClick={start} className="btn-glass px-6 py-2 text-sm" data-testid="mini-meditate-start">
          <Play size={14} className="inline mr-2" /> Start
        </button>
      )}
      {active && (
        <div>
          <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity }}
            className="w-16 h-16 rounded-full mx-auto mb-3" style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.3) 0%, transparent 70%)' }} />
          <p className="text-2xl font-light tabular-nums" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#A78BFA' }}>{mins}:{secs.toString().padStart(2, '0')}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Focus on your breath...</p>
        </div>
      )}
      {timer === 0 && !active && <p className="text-sm" style={{ color: '#A78BFA' }}>Session complete. Carry this peace with you.</p>}
    </div>
  );
}

function MiniSoHum() {
  const [count, setCount] = useState(0);
  const [breathing, setBreathing] = useState(false);
  const [phase, setPhase] = useState('So');
  const intervalRef = useRef(null);

  const start = () => {
    setBreathing(true); setCount(0); setPhase('So');
    intervalRef.current = setInterval(() => {
      setPhase(p => {
        if (p === 'So') return 'Hum';
        setCount(c => { if (c >= 9) { clearInterval(intervalRef.current); setBreathing(false); return c + 1; } return c + 1; });
        return 'So';
      });
    }, 3000);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <div className="p-6 rounded-2xl text-center" style={{ background: 'rgba(252,211,77,0.06)', border: '1px solid rgba(252,211,77,0.15)' }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#FCD34D' }}>So Hum Mantra</p>
      {!breathing && count === 0 && (
        <button onClick={start} className="btn-glass px-6 py-2 text-sm" data-testid="mini-sohum-start">
          <Play size={14} className="inline mr-2" /> 10 Breaths
        </button>
      )}
      {breathing && (
        <div>
          <AnimatePresence mode="wait">
            <motion.p key={phase} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
              className="text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#FCD34D' }}>
              {phase}
            </motion.p>
          </AnimatePresence>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{phase === 'So' ? 'Inhale...' : 'Exhale...'} — {count + 1}/10</p>
        </div>
      )}
      {count >= 10 && !breathing && <p className="text-sm" style={{ color: '#FCD34D' }}>I am That. Beautiful practice.</p>}
    </div>
  );
}

function MiniHooponopono() {
  const phrases = ["I'm sorry", "Please forgive me", "Thank you", "I love you"];
  const colors = ['#3B82F6', '#D8B4FE', '#22C55E', '#FDA4AF'];
  const [idx, setIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef(null);

  const start = () => {
    setRunning(true); setIdx(0); setCycles(0);
    intervalRef.current = setInterval(() => {
      setIdx(i => {
        const next = (i + 1) % 4;
        if (next === 0) setCycles(c => { if (c >= 2) { clearInterval(intervalRef.current); setRunning(false); return c + 1; } return c + 1; });
        return next;
      });
    }, 4000);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <div className="p-6 rounded-2xl text-center" style={{ background: 'rgba(253,164,175,0.06)', border: '1px solid rgba(253,164,175,0.15)' }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#FDA4AF' }}>Ho'oponopono Mini</p>
      {!running && cycles === 0 && (
        <button onClick={start} className="btn-glass px-6 py-2 text-sm" data-testid="mini-hooponopono-start">
          <Heart size={14} className="inline mr-2" fill="#FDA4AF" /> 3 Cycles
        </button>
      )}
      {running && (
        <AnimatePresence mode="wait">
          <motion.p key={idx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="text-xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: colors[idx] }}>
            {phrases[idx]}
          </motion.p>
        </AnimatePresence>
      )}
      {cycles >= 3 && !running && <p className="text-sm" style={{ color: '#FDA4AF' }}>Resonance flowing. Thank you.</p>}
    </div>
  );
}

function ChakraVisual() {
  const chakras = [
    { name: 'Root', color: '#EF4444', pos: 'Spine base' },
    { name: 'Sacral', color: '#FB923C', pos: 'Lower abdomen' },
    { name: 'Solar Plexus', color: '#FCD34D', pos: 'Upper abdomen' },
    { name: 'Heart', color: '#22C55E', pos: 'Center chest' },
    { name: 'Throat', color: '#3B82F6', pos: 'Throat' },
    { name: 'Third Eye', color: '#6366F1', pos: 'Between brows' },
    { name: 'Crown', color: '#A855F7', pos: 'Top of head' },
  ];
  return (
    <div className="p-6 rounded-2xl" style={{ background: 'rgba(192,132,252,0.04)', border: '1px solid rgba(192,132,252,0.1)' }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-4 text-center" style={{ color: 'var(--text-muted)' }}>The Seven Chakras</p>
      <div className="flex flex-col items-center gap-2">
        {[...chakras].reverse().map((c, i) => (
          <motion.div key={c.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 w-full max-w-xs">
            <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ background: c.color, boxShadow: `0 0 10px ${c.color}40` }} />
            <div className="flex-1">
              <span className="text-xs font-medium" style={{ color: c.color }}>{c.name}</span>
              <span className="text-[11px] ml-2" style={{ color: 'var(--text-muted)' }}>{c.pos}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function RoutineBuilder() {
  const practices = ['5 min Breathing', '10 min Meditation', 'Mantra (27 reps)', '3 Affirmations', 'Journaling', 'Soundscape Bath', 'Light Resonance', 'Gratitude Practice'];
  const [selected, setSelected] = useState([]);
  return (
    <div className="p-6 rounded-2xl" style={{ background: 'rgba(192,132,252,0.04)', border: '1px solid rgba(192,132,252,0.1)' }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-3 text-center" style={{ color: 'var(--text-muted)' }}>Build Your Routine</p>
      <p className="text-xs text-center mb-4" style={{ color: 'var(--text-muted)' }}>Tap to select practices for your daily ritual</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {practices.map(p => (
          <button key={p} onClick={() => setSelected(s => s.includes(p) ? s.filter(x => x !== p) : [...s, p])}
            className="px-3 py-1.5 rounded-full text-xs transition-all"
            style={{
              background: selected.includes(p) ? 'rgba(192,132,252,0.15)' : 'rgba(255,255,255,0.02)',
              color: selected.includes(p) ? '#C084FC' : 'var(--text-muted)',
              border: `1px solid ${selected.includes(p) ? 'rgba(192,132,252,0.3)' : 'rgba(255,255,255,0.06)'}`,
            }}>
            {selected.includes(p) && <Check size={10} className="inline mr-1" />}{p}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-center mt-3" style={{ color: '#C084FC' }}>
          Your routine: {selected.join(' → ')}
        </p>
      )}
    </div>
  );
}

function renderMiniTool(tool) {
  switch (tool) {
    case 'breathing_30s': return <MiniBreathing30s />;
    case 'box_breathing': return <MiniBoxBreathing />;
    case 'breathing_478': return <MiniBreathing478 />;
    case 'mini_meditation': return <MiniMeditation />;
    case 'so_hum': return <MiniSoHum />;
    case 'diaphragm_check': return (
      <div className="p-5 rounded-2xl text-center" style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.1)' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#2DD4BF' }}>Diaphragmatic Check</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Place one hand on chest, one on belly. Breathe naturally 5 times. If belly moves more than chest, you are breathing correctly.</p>
      </div>
    );
    default: return null;
  }
}

/* ====== LESSON DETAIL VIEW ====== */
function LessonView({ lesson, stage, onComplete, isCompleted, onBack }) {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <button onClick={onBack} className="flex items-center gap-1 text-xs mb-6" style={{ color: 'var(--text-muted)' }} data-testid="lesson-back">
        <ArrowLeft size={14} /> Back to {stage.title}
      </button>

      {/* Hero Image */}
      <div className="relative rounded-2xl overflow-hidden mb-8 h-48 md:h-64">
        <img src={STAGE_IMAGES[stage.id]} alt={lesson.title} className="w-full h-full object-cover" style={{ opacity: 0.6 }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(11,12,21,0.95) 0%, rgba(11,12,21,0.3) 60%, ${stage.color}10 100%)` }} />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: stage.color }}>{stage.title}</p>
          <h2 className="text-2xl md:text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{lesson.title}</h2>
        </div>
      </div>

      {/* Narration */}
      <div className="mb-8">
        <NarrationPlayer text={lesson.narration} label="Listen to This Lesson" color={stage.color} context="knowledge" />
      </div>

      {/* Content */}
      <div className="space-y-6 mb-10">
        {lesson.content.map((block, i) => {
          if (block.type === 'text') return (
            <motion.p key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {block.value}
            </motion.p>
          );
          if (block.type === 'tip') return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl" style={{ background: `${stage.color}08`, border: `1px solid ${stage.color}15` }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: stage.color }}>Try This</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{block.value}</p>
            </motion.div>
          );
          if (block.type === 'mini_tool') return <div key={i}>{renderMiniTool(block.tool)}</div>;
          if (block.type === 'chakra_visual') return <ChakraVisual key={i} />;
          if (block.type === 'chakra_colors') return <ChakraVisual key={i} />;
          if (block.type === 'hooponopono_mini') return <MiniHooponopono key={i} />;
          if (block.type === 'routine_builder') return <RoutineBuilder key={i} />;
          return null;
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 items-center pb-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
        {lesson.tryLink && (
          <button onClick={() => navigate(lesson.tryLink)}
            className="btn-glass px-5 py-2.5 text-sm flex items-center gap-2"
            style={{ background: `${stage.color}10`, borderColor: `${stage.color}25`, color: stage.color }}
            data-testid="lesson-try-btn">
            <ChevronRight size={14} /> {lesson.tryLabel}
          </button>
        )}
        {!isCompleted ? (
          <button onClick={onComplete}
            className="btn-glass px-5 py-2.5 text-sm flex items-center gap-2"
            data-testid="lesson-complete-btn">
            <Check size={14} /> Mark as Complete
          </button>
        ) : (
          <span className="flex items-center gap-1 text-xs" style={{ color: '#22C55E' }}>
            <Check size={14} /> Completed
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* ====== MAIN PAGE ====== */
export default function Journey() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('journey', 8); }, []);

  const { user, authHeaders } = useAuth();
  const { playCelebration } = useSensory();
  const [progress, setProgress] = useState({ completed_lessons: [], current_stage: 0 });
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeStage, setActiveStage] = useState(null);
  const [expandedStage, setExpandedStage] = useState(null);
  const [celebrating, setCelebrating] = useState(false);

  const loadProgress = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API}/journey/progress`, { headers: authHeaders });
      setProgress(res.data);
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  }, [user, authHeaders]);

  useEffect(() => { loadProgress(); }, [loadProgress]);

  const completeLesson = async (lessonId) => {
    if (!user) { toast.error('Sign in to track your journey'); return; }
    try {
      const res = await axios.post(`${API}/journey/complete-lesson`, { lesson_id: lessonId }, { headers: authHeaders });
      setProgress(res.data);
      playCelebration();
      setCelebrating(true);
      toast.success('Lesson completed!');
    } catch { toast.error('Could not save progress'); }
  };

  const isLessonCompleted = (id) => progress.completed_lessons.includes(id);
  const isStageUnlocked = (stageId) => stageId === 0 || stageId <= progress.current_stage;
  const getStageProgress = (stage) => {
    const completed = stage.lessons.filter(l => isLessonCompleted(l.id)).length;
    return { completed, total: stage.lessons.length, percent: (completed / stage.lessons.length) * 100 };
  };

  const totalLessons = STAGES.reduce((sum, s) => sum + s.lessons.length, 0);
  const totalCompleted = progress.completed_lessons.length;

  // Lesson detail view
  if (activeLesson && activeStage) {
    return (
      <div className="min-h-screen pt-20 pb-40 px-5" style={{ background: 'transparent' }}>
        <div className="max-w-3xl mx-auto">
          <CelebrationBurst active={celebrating} onComplete={() => setCelebrating(false)} />
          <LessonView
            lesson={activeLesson}
            stage={activeStage}
            isCompleted={isLessonCompleted(activeLesson.id)}
            onComplete={() => completeLesson(activeLesson.id)}
            onBack={() => { setActiveLesson(null); setActiveStage(null); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-40 px-5" style={{ background: 'transparent' }}>
      <div className="max-w-3xl mx-auto">
        <CelebrationBurst active={celebrating} onComplete={() => setCelebrating(false)} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#C084FC' }}>Beginner's Journey</p>
          <h1 className="text-3xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Your Path to Wellness
          </h1>
          <p className="text-base mb-4" style={{ color: 'var(--text-secondary)' }}>
            A guided journey through the practices of The ENLIGHTEN.MINT.CAFE. Complete each stage to unlock the next.
          </p>

          {/* Overall progress */}
          <div className="flex items-center gap-4 mb-12">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                animate={{ width: `${(totalCompleted / totalLessons) * 100}%` }}
                style={{ background: 'linear-gradient(90deg, #C084FC, #2DD4BF)' }} />
            </div>
            <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
              {totalCompleted}/{totalLessons} lessons
            </span>
          </div>
        </motion.div>

        {/* Stages */}
        <div className="space-y-6">
          {STAGES.map((stage, si) => {
            const unlocked = isStageUnlocked(stage.id);
            const sp = getStageProgress(stage);
            const Icon = stage.icon;
            const isExpanded = expandedStage === stage.id;

            return (
              <motion.div key={stage.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.08 }}>
                {/* Stage Card */}
                <button
                  onClick={() => unlocked && setExpandedStage(isExpanded ? null : stage.id)}
                  className="w-full p-6 md:p-8 text-left transition-all"
                  style={{
                    opacity: unlocked ? 1 : 0.4,
                    borderColor: isExpanded ? `${stage.color}30` : 'rgba(255,255,255,0.08)',
                    cursor: unlocked ? 'pointer' : 'default',
                  }}
                  data-testid={`stage-${stage.id}`}
                  disabled={!unlocked}>
                  <div className="flex items-start gap-5">
                    {/* Stage icon */}
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${stage.color}12`, border: `1px solid ${stage.color}20` }}>
                      {unlocked ? <Icon size={24} style={{ color: stage.color }} /> : <Lock size={20} style={{ color: 'var(--text-muted)' }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: stage.color }}>
                          Stage {stage.id + 1}
                        </span>
                        {sp.completed === sp.total && sp.total > 0 && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>Complete</span>
                        )}
                      </div>
                      <h3 className="text-lg md:text-xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{stage.title}</h3>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stage.subtitle}</p>
                      {unlocked && (
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${sp.percent}%`, background: stage.color }} />
                          </div>
                          <span className="text-[11px] tabular-nums" style={{ color: 'var(--text-muted)' }}>{sp.completed}/{sp.total}</span>
                        </div>
                      )}
                    </div>
                    {unlocked && (
                      <ChevronRight size={18} style={{ color: 'var(--text-muted)', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s' }} />
                    )}
                  </div>
                </button>

                {/* Expanded lessons */}
                <AnimatePresence>
                  {isExpanded && unlocked && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden">
                      <div className="pt-3 space-y-2">
                        {/* Stage image */}
                        <div className="relative rounded-xl overflow-hidden h-32 mb-4">
                          <img src={STAGE_IMAGES[stage.id]} alt={stage.title} className="w-full h-full object-cover" style={{ opacity: 0.5 }} />
                          <div className="absolute inset-0" style={{ background: `linear-gradient(to right, rgba(11,12,21,0.9) 0%, ${stage.color}08 50%, rgba(11,12,21,0.9) 100%)` }} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-sm max-w-md text-center px-4" style={{ color: 'var(--text-secondary)' }}>{stage.desc}</p>
                          </div>
                        </div>

                        {stage.lessons.map((lesson, li) => {
                          const done = isLessonCompleted(lesson.id);
                          return (
                            <motion.button
                              key={lesson.id}
                              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: li * 0.05 }}
                              onClick={() => { setActiveLesson(lesson); setActiveStage(stage); }}
                              className="w-full p-5 text-left flex items-start gap-4 group transition-all hover:scale-[1.01]"
                              style={{ borderColor: done ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)' }}
                              data-testid={`lesson-${lesson.id}`}>
                              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: done ? 'rgba(34,197,94,0.15)' : `${stage.color}08`,
                                  border: `1px solid ${done ? 'rgba(34,197,94,0.3)' : `${stage.color}15`}`,
                                }}>
                                {done ? <Check size={14} style={{ color: '#22C55E' }} /> : <span className="text-xs" style={{ color: stage.color }}>{li + 1}</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium mb-0.5" style={{ color: done ? '#22C55E' : 'var(--text-primary)' }}>{lesson.title}</p>
                                <p className="text-xs line-clamp-1" style={{ color: 'var(--text-muted)' }}>{lesson.desc}</p>
                              </div>
                              <ChevronRight size={16} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-muted)' }} />
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Discover Sacred Scriptures Cross-Link */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mt-12 mb-8" data-testid="journey-scripture-discovery">
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4 text-center" style={{ color: 'var(--text-muted)' }}>
            Go Deeper
          </p>
          <button onClick={() => navigate('/bible')}
            className="w-full p-6 md:p-8 text-left group hover:scale-[1.01] transition-all relative overflow-hidden"
            style={{ borderColor: 'rgba(217,119,6,0.15)' }}
            data-testid="journey-to-scriptures-btn">
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ background: 'radial-gradient(ellipse at 30% 50%, #D97706 0%, transparent 60%)' }} />
            <div className="relative flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.15)' }}>
                <BookOpen size={24} style={{ color: '#D97706' }} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#D97706' }}>
                  Sacred Scriptures Library
                </p>
                <h3 className="text-lg md:text-xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  Explore 136 Sacred Texts
                </h3>
                <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Dive into the Bible, Quran, Torah, Kabbalah, Lost Books & more with AI-powered chapter summaries, Vision Mode scene recreations, and guided cross-tradition journeys.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Bible', 'Quran', 'Kabbalah', 'Torah', 'Lost Books'].map(t => (
                    <span key={t} className="text-[9px] px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(217,119,6,0.08)', color: '#D97706', border: '1px solid rgba(217,119,6,0.12)' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight size={18} style={{ color: '#D97706' }} className="flex-shrink-0 mt-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          {/* Scripture Journeys Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
            {[
              { title: 'The Life of Moses', sub: 'Bible, Quran & Kabbalah', color: '#D97706', id: 'life-of-moses' },
              { title: 'In the Beginning', sub: 'Creation across all traditions', color: '#818CF8', id: 'creation-stories' },
              { title: 'Mary & Jesus', sub: 'Gospels, Quran & lost texts', color: '#DC2626', id: 'mary-and-jesus' },
              { title: 'The Path of Divine Love', sub: 'Love & mercy across faiths', color: '#EC4899', id: 'divine-love' },
            ].map((j, i) => (
              <motion.button key={j.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + i * 0.04 }}
                onClick={() => navigate(`/bible?tab=journeys`)}
                className="p-3.5 flex items-center gap-3 text-left group hover:scale-[1.01] transition-all"
                data-testid={`journey-link-${j.id}`}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${j.color}10`, border: `1px solid ${j.color}18` }}>
                  <BookOpen size={13} style={{ color: j.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{j.title}</p>
                  <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{j.sub}</p>
                </div>
                <ChevronRight size={10} style={{ color: j.color, opacity: 0.4 }} />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {!user && (
          <div className="p-8 text-center mt-12">
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Sign in to save your progress and unlock stages as you grow.</p>
            <a href="/auth" className="btn-glass px-6 py-2 text-sm inline-block" style={{ color: '#C084FC' }}>Begin Journey</a>
          </div>
        )}
      </div>
    </div>
  );
}
