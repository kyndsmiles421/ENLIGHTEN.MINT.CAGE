# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React + Tailwind CSS + Framer Motion + Three.js
- **Backend**: FastAPI + Motor Async MongoDB
- **AI**: OpenAI GPT-4o, TTS tts-1-hd, Sora 2, GPT Image 1, Whisper — all via Emergent LLM Key
- **Payments**: Stripe (test key in pod)
- **3D**: Three.js + UnrealBloomPass + EffectComposer
- **Mobile**: Capacitor configured for App Store / Play Store wrapping

## All Implemented Features

### Core
- 6-Pillar Navigation, JWT Auth + Stripe, PWA, Accessibility

### Gaming-Level Star Chart — NOW 20 WORLD CULTURES (100 constellations)
- UnrealBloomPass bloom, Milky Way band, 15k stars, camera momentum, 10 nebulae, constellation journey mode
- **8 Original Cultures**: Mayan, Egyptian, Aboriginal, Lakota, Chinese, Vedic, Norse, Polynesian
- **12 NEW Cultures (Feb 2026)**: Greek, Japanese, Yoruba, Celtic, Inuit, Aztec, Sumerian, Persian, Bantu, Native American, Slavic, Maori
- Each culture: 5 constellations with real RA/Dec star coordinates, mythology, deity, lesson, drawing paths
- Cultural overlay rendering in Three.js with color-coded lines and labels

### Sacred Texts Audiobook Reader (NEW — Feb 2026)
- **15 Ancient Scriptures**: Bhagavad Gita, Tao Te Ching, Egyptian Book of the Dead, Popol Vuh, Upanishads, Dhammapada, Rumi's Masnavi, Poetic Edda, Bardo Thodol, I Ching, Emerald Tablet, Yoga Sutras, Kojiki, Odu Ifa, Kalevala
- **AI Chapter Generation**: GPT-4o generates retellings + curated excerpts + scholarly commentary per chapter
- **HD Voice Narration**: tts-1-hd with tradition-matched voices (Sage for Hindu, Shimmer for Taoist/Buddhist, Fable for Sufi/Finnish, Onyx for Egyptian/Yoruba)
- **VR Immersive Reader**: Fullscreen cinematic reading with:
  - Animated particle effects matched to each tradition (golden particles, water ink, hieroglyph reveal, lotus bloom, whirling stars, rune frost, mandala pulse, emerald glow, sakura drift)
  - Narrative paragraph reveal (blur-to-clear with staggered timing)
  - Animation speed controls (slow/normal/fast)
  - Three content sections: Retelling, Sacred Passages, Deeper Meaning
  - Progress tracking (bookmarks per user/text)
- **Backend**: `/api/sacred-texts`, `/api/sacred-texts/{id}`, `/api/sacred-texts/{id}/chapters/{ch}/generate`, `/api/sacred-texts/{id}/chapters/{ch}/narrate`, `/api/sacred-texts/progress/{user_id}`

### Myths & Legends Database (Feb 2026)
- 20 civilizations, 120+ seed myths, AI generation, search, HD voice narration
- Dual-tab page: "Creation Stories" (15 original) + "Myths & Legends"

### AI Avatar Generator
- AI Manifestation tab + Energy Builder tab + Avatar Gallery + Global Avatar Display

### Context-Aware Human Voices (tts-1-hd)
- 35+ NarrationPlayer instances with 25+ voice-context mappings

### Immersive Visuals, Ambient Audio, Split Screen, Cosmic Mixer, Dashboard, 40+ content pages

## Test Credentials
- User: test@test.com / password
- Admin/Creator: kyndsmiles@gmail.com / password

## Backlog
- **P2**: Refactor star_cultures.py data into MongoDB/JSON seed file
