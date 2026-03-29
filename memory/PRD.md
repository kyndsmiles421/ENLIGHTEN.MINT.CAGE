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

### Gaming-Level Star Chart — 20 WORLD CULTURES (100 constellations)
- UnrealBloomPass bloom, Milky Way band, 15k stars, camera momentum
- 20 cultures: Mayan, Egyptian, Aboriginal, Lakota, Chinese, Vedic, Norse, Polynesian, Greek, Japanese, Yoruba, Celtic, Inuit, Aztec, Sumerian, Persian, Bantu, Native American, Slavic, Maori
- Each: 5 constellations with real RA/Dec star coordinates, mythology, deities, lessons, drawing paths

### Sacred Texts Audiobook Reader
- 15 scriptures: Bhagavad Gita, Tao Te Ching, Book of the Dead, Popol Vuh, Upanishads, Dhammapada, Rumi's Masnavi, Poetic Edda, Bardo Thodol, I Ching, Emerald Tablet, Yoga Sutras, Kojiki, Odu Ifa, Kalevala
- AI chapter generation (retelling + excerpts + commentary)
- VR Immersive Reader: fullscreen with 10 particle themes, blur-to-clear narrative reveal, speed controls
- HD TTS with tradition-matched voices, progress tracking

### World Spiritual Traditions Encyclopedia (UPGRADED Feb 2026)
- 12 living traditions: Hinduism, Buddhism, Taoism, Sufism, Kabbalah, Indigenous, Mystical Christianity, Egyptian, Greek Philosophy, Zen, Yoga/Tantra, African
- **VR Immersive Mode**: Fullscreen tradition exploration with animated particles per tradition, narrative blur-to-clear concept reveals, AI "Ask the Oracle" with voice narration
- **HD Voice Narration**: Tradition overviews + AI exploration results narrated via tts-1-hd with mapped voices (sage/shimmer/fable/onyx)
- **Backend**: `/api/encyclopedia/traditions/{id}/narrate`, `/api/encyclopedia/narrate-text`

### Crystals & Stones (UPGRADED Feb 2026)
- 12 sacred crystals: Clear Quartz, Amethyst, Rose Quartz, Obsidian, Citrine, Lapis Lazuli, Tiger's Eye, Moonstone, Turquoise, Selenite, Labradorite, Malachite
- **VR Crystal Meditation**: Fullscreen crystal viewing with diamond-shaped particles, glowing crystal orb, staggered property reveals (essence, spiritual, healing, uses), chakra badges
- **HD Voice Guide**: Crystal descriptions narrated via tts-1-hd shimmer voice
- **3 Tabs**: Crystal Guide (search + category filters), My Collection, Rock Hounding
- **Backend**: `/api/crystals/{id}/narrate`

### Myths & Legends Database
- 20 civilizations, 120+ seed myths, AI generation, search, HD voice narration
- Dual-tab: "Creation Stories" (15 original) + "Myths & Legends"

### AI Avatar Generator
- AI Manifestation + Energy Builder + Avatar Gallery + Global Display

### Context-Aware Human Voices (tts-1-hd)
- 35+ NarrationPlayer instances + encyclopedia/crystal narrators with tradition-mapped voices

### Other
- Cosmic Mixer, Split Screen, Dashboard, Ambient Soundscapes, Guided Tour, 40+ content pages, Sora 2 Videos

## Test Credentials
- User: test@test.com / password
- Admin/Creator: kyndsmiles@gmail.com / password

## Backlog
- **P2**: Refactor star_cultures.py data into MongoDB/JSON seed file
