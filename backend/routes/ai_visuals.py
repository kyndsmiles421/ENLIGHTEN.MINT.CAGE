from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration
from emergentintegrations.llm.openai.video_generation import OpenAIVideoGeneration
from datetime import datetime, timezone
from pathlib import Path
import base64
import hashlib
import asyncio
import uuid
import os

router = APIRouter()

VIDEOS_DIR = Path(__file__).parent.parent / "static" / "videos"
VIDEOS_DIR.mkdir(parents=True, exist_ok=True)

# In-memory job tracker for video generation
_video_jobs = {}  # job_id -> { status, video_url, error, prompt }


async def get_or_generate_image(prompt: str, category: str, ref_id: str):
    """Check cache first, generate if missing. Returns base64 image string."""
    cache_key = hashlib.md5(f"{category}:{ref_id}:{prompt[:100]}".encode()).hexdigest()

    # Check MongoDB cache
    cached = await db.ai_visuals_cache.find_one(
        {"cache_key": cache_key}, {"_id": 0, "image_b64": 1}
    )
    if cached and cached.get("image_b64"):
        return cached["image_b64"]

    # Generate new image
    try:
        gen = OpenAIImageGeneration(api_key=EMERGENT_LLM_KEY)
        images = await asyncio.wait_for(
            gen.generate_images(
                prompt=prompt,
                model="gpt-image-1",
                number_of_images=1,
            ),
            timeout=90,
        )
        if not images or len(images) == 0:
            return None

        image_b64 = base64.b64encode(images[0]).decode("utf-8")

        # Cache in MongoDB
        await db.ai_visuals_cache.update_one(
            {"cache_key": cache_key},
            {
                "$set": {
                    "cache_key": cache_key,
                    "category": category,
                    "ref_id": ref_id,
                    "prompt_preview": prompt[:200],
                    "image_b64": image_b64,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
            },
            upsert=True,
        )
        return image_b64
    except Exception as e:
        logger.error(f"Image generation error [{category}/{ref_id}]: {e}")
        return None


# ═══════════════════════════════════════════════════════
# CREATION STORY SCENE GENERATION
# ═══════════════════════════════════════════════════════

STORY_SCENE_PROMPTS = {
    "mayan": [
        "Vast primordial ocean under starlit sky, two luminous feathered serpent gods Tepeu and Gucumatz floating above calm turquoise waters, ethereal green and blue feathers glowing, mountains beginning to emerge from the sea, Mayan artistic style, cosmic spiritual atmosphere, cinematic lighting",
        "Divine grandmother Xmucane grinding sacred white and yellow corn on stone metate, golden corn kernels glowing with divine light, four human figures taking shape from corn dough, lush jungle backdrop with pyramids, Mayan creation scene, mystical warm golden tones",
        "Four newly created corn-people the Balam standing under brilliant starry sky, their eyes radiating cosmic light that reaches the edges of the universe, gods breathing sacred mist to limit their vision, ancient Mayan temple in background, ethereal spiritual scene",
    ],
    "egyptian": [
        "Infinite dark primordial ocean Nun stretching to infinity, a single luminous mound the Benben stone emerging from the waters, golden pyramidal shape radiating light, the god Atum standing atop it with arms raised, Egyptian hieroglyphic style, cosmic dawn atmosphere",
        "Nut the sky goddess arched over Geb the earth god, her star-spangled body forming the dome of heaven, Shu the air god holding them apart, Egyptian artistic style with hieroglyphs and gold, cosmic creation scene, temple pillars framing",
        "Great pyramid of Giza aligned with three stars of Orion's belt above, golden shafts of light connecting pyramid to the constellation of Sah-Osiris, night sky with Egyptian deities, pharaonic style, mystical cosmic architecture",
    ],
    "aboriginal": [
        "Vast flat Australian outback under endless darkness, giant Rainbow Serpent breaking through the earth's crust, creating rivers and mountains as it slithers across the land, Aboriginal dot painting style with cosmic elements, deep earth tones and luminous serpent",
        "Aboriginal ancestor spirits walking across the dreamtime landscape, singing the world into existence, songlines visible as glowing golden paths stretching across the continent, rock art style with modern cosmic overlay, Australian outback at dawn",
        "Giant celestial emu formed by dark lanes of the Milky Way stretching across the southern sky, Aboriginal elders gathered around a fire below looking up, dot painting cosmic art style, connection between sky and earth",
    ],
    "lakota": [
        "Primordial Rock Inyan opening his veins, blue cosmic blood flowing outward becoming oceans and rivers, the Earth Maka forming from his substance, Lakota artistic style, sacred stone radiating blue energy, cosmic spiritual landscape",
        "White Buffalo Calf Woman descending from golden clouds carrying the Sacred Pipe, Lakota people gathered on the Great Plains below, buffalo herds in the distance, four sacred winds visible as colored streams from cardinal directions, mystical Native American scene",
        "Great sacred hoop of stars in the night sky above the Black Hills, Medicine Wheel on the earth below mirroring the celestial pattern, four directions marked by colored light, Lakota spiritual cosmic connection, eagle soaring",
    ],
    "hindu": [
        "Vishnu resting on the coils of infinite serpent Shesha on the cosmic ocean, a luminous lotus growing from his navel, Brahma sitting on the lotus with four faces, golden cosmic egg cracking open in the background, Hindu artistic style, rich golds and blues",
        "Brahma speaking the sacred syllable Om, visible as golden vibrating waves spreading through space creating galaxies and stars, the Vedas materializing as luminous scrolls, Hindu cosmic creation, mandala patterns in space",
        "Shiva performing the Tandava dance of cosmic destruction and creation, ring of fire surrounding him, universe dissolving and reforming, third eye blazing, Hindu artistic style, cosmic cycle visualization",
    ],
    "norse": [
        "The great yawning void Ginnungagap between realms of ice Niflheim on left and fire Muspelheim on right, sparks and frost meeting in the center, the giant Ymir forming from melting ice, Audhumla the cosmic cow, Norse mythological art style",
        "Odin Vili and Ve shaping the world from Ymir's enormous body, his flesh becoming earth and blood becoming seas, skull becoming sky dome held by four dwarves, Norse epic cosmic creation scene, dramatic lighting",
        "Yggdrasil the World Tree with nine realms connected through its branches and roots, Ask and Embla the first humans standing at its base receiving gifts from the gods, Norse mythological cosmic tree of life",
    ],
    "greek": [
        "Formless Chaos as a vast luminous void, Gaia Earth emerging below and Eros Love as golden light between, Ouranos Sky forming above studded with stars, Greek cosmic creation in classical art style with modern cosmic elements",
        "Prometheus shaping humanity from clay on a mountaintop, reaching up to steal fire from the sun and passing it down to his clay figures, Greek mythological scene, dramatic chiaroscuro lighting, Mount Olympus in clouds above",
        "Titanomachy cosmic battle between Olympians and Titans, Zeus wielding lightning bolts from storm clouds, the old order being overthrown, epic Greek mythological scene with cosmic scale",
    ],
    "japanese": [
        "Izanagi and Izanami standing on the Floating Bridge of Heaven, thrusting the Jeweled Spear into the primordial brine below, drops of salt water falling to form the first island, Japanese ukiyo-e cosmic art style with celestial bridge",
        "Three great deities being born from Izanagi's purification: Amaterasu the Sun Goddess from his left eye blazing with golden light, Tsukuyomi the Moon God from his right eye in silver, Susanoo the Storm God from his nose with wind and thunder, Japanese mythological art",
        "Amaterasu emerging from the cave of heaven, flooding the world with sunlight for the first time, other deities celebrating, mirror and jewels gleaming, Japanese Shinto cosmic creation scene",
    ],
    "yoruba": [
        "Olodumare in luminous heavens handing Obatala a golden chain, snail shell of sacred sand, and white hen, Obatala descending the golden chain from heaven toward endless waters below, Yoruba artistic style with rich colors and patterns",
        "White hen scratching sacred sand on the primordial waters, dry land spreading outward in all directions forming hills and valleys, Ile-Ife the first city forming, palm tree growing immediately from planted seed, African cosmic creation art",
        "Obatala shaping human figures from clay by a river, Olodumare's divine breath visible as golden light entering the figures, some figures perfectly shaped others imperfect, Yoruba artistic style showing divine compassion",
    ],
    "maori": [
        "Ranginui Sky Father and Papatuanuku Earth Mother in tight embrace, their children trapped in eternal darkness between them, Polynesian artistic style with tiki patterns, cosmic claustrophobic scene",
        "Tane Mahuta lying on his back pushing his father Ranginui upward with mighty legs, light flooding in for the first time, tears becoming rain, Maori creation scene with traditional patterns, dramatic cosmic separation",
        "Ranginui adorned with stars by Tane, mists rising from Papatuanuku reaching toward the sky, the horizon where sky and earth almost touch, Polynesian cosmic art with Maori patterns, love across impossible distance",
    ],
    "chinese": [
        "Pangu awakening inside the cosmic egg, swirling Yin and Yang energies surrounding him, raising his great axe to crack the shell, Chinese mythological art style with tai chi symbol, cosmic darkness being split",
        "Pangu standing between heaven and earth pushing them apart, growing taller over thousands of years, clear Yang energies rising as sky above, murky Yin energies sinking as earth below, Chinese cosmic creation art, epic scale",
        "Nuwa the goddess shaping human figures from yellow clay by a riverbank, first carefully crafted nobles and rope-flicked common people, repairing the broken sky with five-colored stones, Chinese mythological art, elegant scene",
    ],
    "celtic": [
        "Connla's Well of Wisdom surrounded by nine sacred hazel trees, hazelnuts falling into luminous water, the Salmon of Wisdom swimming below, five great rivers flowing outward, Celtic knotwork borders, mystical emerald forest",
        "The Dagda playing his great harp Uaithne, commanding the seasons with three chords, autumn leaves and spring blossoms and summer warmth swirling around him, Celtic artistic style with intricate knotwork patterns",
        "A sacred grove as doorway between this world and the Otherworld, thin veil between realms visible as shimmering light between ancient oak trees, Tuatha De Danann carrying the four treasures, Celtic mystical art",
    ],
    "inuit": [
        "Raven the trickster flying through black Arctic sky, finding a glowing pea pod on frozen tundra below, cracking it open to reveal the first human, Northern Lights dancing above, Inuit artistic style with bold shapes",
        "Sedna sinking to the ocean floor as her severed fingers transform into whales seals and walruses, dramatic underwater scene with Arctic ice above, marine creatures spiraling outward from her hands, Inuit mythological art",
        "Angakkuq shaman in trance journeying to the ocean floor to comb Sedna's tangled hair, spirit world visible with marine creatures and cosmic energy, Arctic underwater spiritual scene, Inuit artistic style",
    ],
    "aztec": [
        "Five Suns of Aztec creation shown as five concentric cosmic circles, each containing its own world being destroyed: jaguars, hurricanes, fire rain, and flood, the Fifth Sun blazing in center, Aztec calendar stone style art",
        "Nanahuatzin the humble pockmarked god leaping into the great bonfire at Teotihuacan, transforming into the blazing new sun, other gods watching in awe, Aztec pyramids and cosmic fire, dramatic mythological scene",
        "The Fifth Sun Nahui Ollin hanging motionless in the sky, gods sacrificing themselves giving divine blood to set it in motion, streams of celestial blood making the sun arc across the sky, Aztec cosmic art style",
    ],
    "sumerian": [
        "Primordial sea goddess Nammu stretching to infinity, heaven An and earth Ki still joined as one, ancient Mesopotamian ziggurat style, cuneiform tablets floating, cosmic waters with golden light",
        "Enki god of wisdom filling the Tigris and Euphrates with sweet water, teaching humanity writing and agriculture and astronomy, clay tablets inscribed with knowledge, Sumerian artistic style with ziggurat and cosmic elements",
        "Marduk slaying the chaos dragon Tiamat, splitting her body into sky and earth, Tablets of Destiny placed on his chest, Babylonian epic cosmic battle, cuneiform and cosmic art merged",
    ],
}


@router.post("/ai-visuals/story-scenes/{story_id}")
async def generate_story_scenes(story_id: str, user=Depends(get_current_user)):
    """Generate or retrieve AI cinematic scenes for a creation story."""
    prompts = STORY_SCENE_PROMPTS.get(story_id)
    if not prompts:
        raise HTTPException(status_code=404, detail="Story not found")

    scenes = []
    for i, prompt in enumerate(prompts):
        ref_id = f"{story_id}_scene_{i}"
        # Check cache first
        cache_key = hashlib.md5(f"story_scene:{ref_id}:{prompt[:100]}".encode()).hexdigest()
        cached = await db.ai_visuals_cache.find_one(
            {"cache_key": cache_key}, {"_id": 0, "image_b64": 1}
        )
        if cached and cached.get("image_b64"):
            scenes.append({"scene_index": i, "image_b64": cached["image_b64"], "cached": True})
        else:
            scenes.append({"scene_index": i, "image_b64": None, "cached": False})

    return {"story_id": story_id, "scenes": scenes, "total_scenes": len(prompts)}


@router.post("/ai-visuals/generate-scene")
async def generate_single_scene(
    data: dict = Body(...),
    user=Depends(get_current_user),
):
    """Generate a single AI scene image. Called one at a time for progressive loading."""
    story_id = data.get("story_id")
    scene_index = data.get("scene_index", 0)

    prompts = STORY_SCENE_PROMPTS.get(story_id)
    if not prompts or scene_index >= len(prompts):
        raise HTTPException(status_code=404, detail="Scene not found")

    prompt = prompts[scene_index]
    ref_id = f"{story_id}_scene_{scene_index}"

    image_b64 = await get_or_generate_image(prompt, "story_scene", ref_id)
    if not image_b64:
        raise HTTPException(status_code=500, detail="Failed to generate scene")

    return {
        "story_id": story_id,
        "scene_index": scene_index,
        "image_b64": image_b64,
    }


# ═══════════════════════════════════════════════════════
# COSMIC VISUALS FOR OTHER PAGES
# ═══════════════════════════════════════════════════════

@router.post("/ai-visuals/meditation")
async def generate_meditation_visual(
    data: dict = Body(...),
    user=Depends(get_current_user),
):
    """Generate ambient visual for meditation session."""
    theme = data.get("theme", "cosmic peace")
    prompt = f"Abstract cosmic meditation visualization: {theme}. Deep space nebula, floating luminous particles, gentle aurora waves, spiritual energy field, peaceful serene atmosphere, dark background with soft glowing colors, suitable as meditation ambient background, ultra wide cinematic"
    ref_id = hashlib.md5(theme.encode()).hexdigest()[:12]
    image_b64 = await get_or_generate_image(prompt, "meditation", ref_id)
    if not image_b64:
        raise HTTPException(status_code=500, detail="Failed to generate visual")
    return {"image_b64": image_b64, "theme": theme}


@router.post("/ai-visuals/forecast")
async def generate_forecast_visual(
    data: dict = Body(...),
    user=Depends(get_current_user),
):
    """Generate cosmic imagery for divination forecast."""
    system = data.get("system", "astrology")
    period = data.get("period", "daily")
    summary = data.get("summary", "")[:200]
    prompt = f"Mystical {system} divination cosmic scene for {period} forecast: {summary}. Celestial imagery with zodiac symbols, tarot cards, crystal spheres, cosmic energy flows, mystical purple and gold tones, dark spiritual background, cinematic prophetic atmosphere"
    ref_id = hashlib.md5(f"{system}:{period}:{summary[:50]}".encode()).hexdigest()[:12]
    image_b64 = await get_or_generate_image(prompt, "forecast", ref_id)
    if not image_b64:
        raise HTTPException(status_code=500, detail="Failed to generate visual")
    return {"image_b64": image_b64, "system": system}


@router.post("/ai-visuals/dream")
async def generate_dream_visual(
    data: dict = Body(...),
    user=Depends(get_current_user),
):
    """Generate AI visual interpretation of dream symbols."""
    description = data.get("description", "")[:300]
    prompt = f"Surreal dreamscape visualization: {description}. Ethereal floating elements, dream-like distortions, soft luminous glow, symbolic imagery, Salvador Dali inspired cosmic surrealism, deep purples and midnight blues with golden dream light, mystical unconscious landscape"
    ref_id = hashlib.md5(description.encode()).hexdigest()[:12]
    image_b64 = await get_or_generate_image(prompt, "dream", ref_id)
    if not image_b64:
        raise HTTPException(status_code=500, detail="Failed to generate visual")
    return {"image_b64": image_b64}


@router.post("/ai-visuals/cosmic-portrait")
async def generate_cosmic_portrait(
    data: dict = Body(...),
    user=Depends(get_current_user),
):
    """Generate personalized cosmic portrait from user profile data."""
    zodiac = data.get("zodiac", "")
    energy = data.get("energy_level", 5)
    element = data.get("element", "")
    traits = data.get("traits", "")[:200]
    prompt = f"Cosmic spiritual portrait: A luminous ethereal being embodying {zodiac} zodiac energy, {element} element, energy level {energy}/10. {traits}. Aura radiating with cosmic light, constellation patterns woven into the figure, celestial background with personal star map, spiritual portrait art, mystical luminous atmosphere, dark cosmic background"
    ref_id = hashlib.md5(f"{zodiac}:{element}:{energy}".encode()).hexdigest()[:12]
    image_b64 = await get_or_generate_image(prompt, "cosmic_portrait", ref_id)
    if not image_b64:
        raise HTTPException(status_code=500, detail="Failed to generate portrait")
    return {"image_b64": image_b64, "zodiac": zodiac}


@router.post("/ai-visuals/daily-card")
async def generate_daily_card(
    data: dict = Body(...),
    user=Depends(get_current_user),
):
    """Generate AI cosmic card of the day art."""
    theme = data.get("theme", "cosmic wisdom")
    affirmation = data.get("affirmation", "")[:150]
    prompt = f"Cosmic card of the day artwork: '{affirmation}'. Theme: {theme}. Mystical tarot-card style illustration with ornate golden border, cosmic symbols, celestial imagery, dark rich background with luminous accents, spiritual divination art, vertical card format"
    ref_id = hashlib.md5(f"daily:{theme}:{affirmation[:30]}".encode()).hexdigest()[:12]
    image_b64 = await get_or_generate_image(prompt, "daily_card", ref_id)
    if not image_b64:
        raise HTTPException(status_code=500, detail="Failed to generate card")
    return {"image_b64": image_b64, "theme": theme}


@router.get("/ai-visuals/quantum-principles")
async def get_quantum_principles():
    """Return quantum principles for frontend use."""
    from quantum_framework import QUANTUM_PRINCIPLES, QUANTUM_MEDITATIONS, FUTURE_TECH_HOOKS
    principles = [
        {"id": k, "physics": v["physics"], "spiritual": v["spiritual"], "practice": v["practice"], "color": v["color"]}
        for k, v in QUANTUM_PRINCIPLES.items()
    ]
    meditations = [
        {"id": m["id"], "name": m["name"], "principle": m["principle"], "step_count": len(m["steps"]),
         "total_duration": sum(s["duration"] for s in m["steps"]),
         "steps": m["steps"]}
        for m in QUANTUM_MEDITATIONS
    ]
    return {
        "principles": principles,
        "meditations": meditations,
        "future_tech": list(FUTURE_TECH_HOOKS.keys()),
    }


# ═══════════════════════════════════════════════════════
# SORA 2 VIDEO GENERATION
# ═══════════════════════════════════════════════════════

# Cinematic video prompts adapted from scene prompts (shorter, action-focused for video)
VIDEO_SCENE_PROMPTS = {
    "mayan": "Vast primordial ocean under starlit sky, two luminous feathered serpent gods floating above calm turquoise waters, ethereal feathers glowing, mountains slowly emerging from the sea, Mayan artistic style, cinematic lighting, slow majestic camera movement",
    "egyptian": "Infinite dark primordial ocean Nun, a luminous golden mound emerging from the waters, the god Atum standing atop it with arms raised commanding light to appear, Egyptian hieroglyphic style, cosmic dawn atmosphere, slow zoom in",
    "aboriginal": "Giant luminous Rainbow Serpent breaking through the earth's crust in the Australian outback, creating rivers and mountains as it slithers, Aboriginal dot painting style with cosmic elements, camera follows the serpent's path",
    "lakota": "White Buffalo Calf Woman descending from golden clouds carrying the Sacred Pipe, Lakota people gathered on the Great Plains below, buffalo herds in the distance, four sacred winds as colored streams, slow descent camera movement",
    "hindu": "Vishnu resting on the coils of infinite serpent Shesha on the cosmic ocean, a luminous lotus growing from his navel with Brahma appearing, golden cosmic egg cracking in background, Hindu artistic style, slow cinematic reveal",
    "norse": "The great void Ginnungagap between realms of ice and fire, sparks and frost meeting in the center, the giant Ymir slowly forming from melting ice, the cosmic cow Audhumla appearing, Norse mythological art, dramatic camera sweep",
    "greek": "Formless Chaos as a vast luminous void, Gaia the Earth slowly emerging below, Ouranos the Sky forming above with stars appearing one by one, golden light of Eros weaving between them, Greek cosmic creation, dramatic lighting",
    "japanese": "Izanagi and Izanami standing on the Floating Bridge of Heaven, thrusting the Jeweled Spear into the primordial brine below, salt water drops falling to form the first island, Japanese ukiyo-e style, slow motion spear movement",
    "yoruba": "Obatala descending a golden chain from luminous heavens toward endless waters below, carrying sacred objects, a white hen scratching sand on the waters below creating dry land, Yoruba artistic style, dramatic vertical descent camera",
    "maori": "Tane Mahuta lying on his back pushing his father Ranginui Sky upward with mighty legs, light flooding in for the first time between earth and sky, tears becoming rain, Maori creation scene, dramatic slow separation",
    "chinese": "Pangu awakening inside the cosmic egg, swirling Yin and Yang energies surrounding him, raising his great axe to crack the shell, light bursting through the crack, Chinese mythological art, dramatic slow-motion crack",
    "celtic": "Connla's Well of Wisdom surrounded by nine sacred hazel trees, hazelnuts falling into luminous water, the Salmon of Wisdom swimming below, five rivers flowing outward, Celtic knotwork borders, slow overhead camera",
    "inuit": "Raven the trickster flying through black Arctic sky, finding a glowing pea pod on frozen tundra, cracking it open to reveal the first human, Northern Lights dancing above, Inuit artistic style, slow dramatic reveal",
    "aztec": "Five Suns of Aztec creation as concentric cosmic circles each with its own world, the Fifth Sun blazing at center, Nanahuatzin leaping into the great bonfire, Aztec pyramid style, epic camera zoom into the fire",
    "sumerian": "Primordial sea goddess Nammu stretching to infinity, Marduk confronting the chaos dragon Tiamat, splitting her body into sky and earth, Tablets of Destiny glowing, Babylonian epic cosmic battle, dramatic action movement",
}


async def _run_video_generation(job_id: str, prompt: str, cache_key: str, filename: str):
    """Background coroutine for Sora 2 video generation."""
    try:
        _video_jobs[job_id]["status"] = "generating"
        logger.info(f"Sora 2 generation started: {job_id}")

        output_path = str(VIDEOS_DIR / filename)

        def _generate():
            gen = OpenAIVideoGeneration(api_key=EMERGENT_LLM_KEY)
            video_bytes = gen.text_to_video(
                prompt=prompt,
                model="sora-2",
                size="1280x720",
                duration=4,
                max_wait_time=600,
            )
            if video_bytes:
                gen.save_video(video_bytes, output_path)
                return True
            return False

        loop = asyncio.get_event_loop()
        success = await loop.run_in_executor(None, _generate)

        if success and os.path.exists(output_path):
            video_url = f"/api/static/videos/{filename}"
            _video_jobs[job_id]["status"] = "complete"
            _video_jobs[job_id]["video_url"] = video_url

            # Cache in MongoDB
            await db.ai_video_cache.update_one(
                {"cache_key": cache_key},
                {"$set": {
                    "cache_key": cache_key,
                    "video_url": video_url,
                    "filename": filename,
                    "prompt_preview": prompt[:200],
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }},
                upsert=True,
            )
            logger.info(f"Sora 2 generation complete: {job_id} -> {video_url}")
        else:
            _video_jobs[job_id]["status"] = "failed"
            _video_jobs[job_id]["error"] = "Video generation returned empty"
            logger.error(f"Sora 2 generation failed (empty): {job_id}")
    except Exception as e:
        _video_jobs[job_id]["status"] = "failed"
        _video_jobs[job_id]["error"] = str(e)[:200]
        logger.error(f"Sora 2 generation error: {job_id}: {e}")


@router.post("/ai-visuals/generate-video")
async def generate_video(
    data: dict = Body(...),
    user=Depends(get_current_user),
):
    """Start Sora 2 video generation. Returns immediately with job_id to poll."""
    story_id = data.get("story_id")
    custom_prompt = data.get("prompt", "")

    if story_id:
        prompt = VIDEO_SCENE_PROMPTS.get(story_id)
        if not prompt:
            raise HTTPException(status_code=404, detail="Story not found")
    elif custom_prompt:
        prompt = custom_prompt[:500]
    else:
        raise HTTPException(status_code=400, detail="Provide story_id or prompt")

    cache_key = hashlib.md5(f"video:{prompt[:200]}".encode()).hexdigest()

    # Check MongoDB cache first
    cached = await db.ai_video_cache.find_one(
        {"cache_key": cache_key}, {"_id": 0, "video_url": 1}
    )
    if cached and cached.get("video_url"):
        # Verify file exists
        file_path = str(Path(__file__).parent.parent / cached["video_url"].lstrip("/api/"))
        if os.path.exists(file_path):
            return {
                "status": "complete",
                "job_id": None,
                "video_url": cached["video_url"],
                "cached": True,
            }

    # Check if already generating
    for jid, job in _video_jobs.items():
        if job.get("cache_key") == cache_key and job["status"] == "generating":
            return {"status": "generating", "job_id": jid, "cached": False}

    # Start background generation
    job_id = str(uuid.uuid4())[:12]
    filename = f"{cache_key[:16]}_{job_id}.mp4"
    _video_jobs[job_id] = {
        "status": "queued",
        "video_url": None,
        "error": None,
        "cache_key": cache_key,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    asyncio.create_task(_run_video_generation(job_id, prompt, cache_key, filename))

    return {"status": "queued", "job_id": job_id, "cached": False}


@router.get("/ai-visuals/video-status/{job_id}")
async def get_video_status(job_id: str, user=Depends(get_current_user)):
    """Poll video generation status."""
    job = _video_jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "job_id": job_id,
        "status": job["status"],
        "video_url": job.get("video_url"),
        "error": job.get("error"),
    }


@router.get("/ai-visuals/video-stories")
async def get_video_stories(user=Depends(get_current_user)):
    """Return available stories that can have video generation."""
    stories = []
    for sid in VIDEO_SCENE_PROMPTS:
        # Check if video is already cached
        cache_key = hashlib.md5(f"video:{VIDEO_SCENE_PROMPTS[sid][:200]}".encode()).hexdigest()
        cached = await db.ai_video_cache.find_one(
            {"cache_key": cache_key}, {"_id": 0, "video_url": 1}
        )
        stories.append({
            "story_id": sid,
            "has_video": bool(cached and cached.get("video_url")),
            "video_url": cached.get("video_url") if cached else None,
        })
    return {"stories": stories}


# Batch generation tracker
_batch_jobs = {}


async def _run_batch_generation(batch_id: str, story_ids: list):
    """Sequentially generate videos for a batch of stories."""
    batch = _batch_jobs[batch_id]
    for i, sid in enumerate(story_ids):
        if batch.get("cancelled"):
            break
        batch["current_idx"] = i
        batch["current_story"] = sid
        prompt = VIDEO_SCENE_PROMPTS.get(sid)
        if not prompt:
            batch["failed"].append(sid)
            continue

        cache_key = hashlib.md5(f"video:{prompt[:200]}".encode()).hexdigest()

        cached = await db.ai_video_cache.find_one(
            {"cache_key": cache_key}, {"_id": 0, "video_url": 1}
        )
        if cached and cached.get("video_url"):
            batch["completed"].append(sid)
            continue

        job_id = str(uuid.uuid4())[:12]
        filename = f"{cache_key[:16]}_{job_id}.mp4"
        batch["job_ids"].append(job_id)
        _video_jobs[job_id] = {
            "status": "generating",
            "video_url": None,
            "error": None,
            "cache_key": cache_key,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        try:
            await _run_video_generation(job_id, prompt, cache_key, filename)
            if _video_jobs[job_id]["status"] == "complete":
                batch["completed"].append(sid)
            else:
                batch["failed"].append(sid)
        except Exception as e:
            logger.error(f"Batch gen error for {sid}: {e}")
            batch["failed"].append(sid)

    batch["status"] = "complete"
    batch["current_story"] = None


@router.post("/ai-visuals/generate-batch")
async def generate_batch(
    data: dict = Body(...),
    user=Depends(get_current_user),
):
    """Start batch video generation for multiple stories."""
    story_ids = data.get("story_ids", list(VIDEO_SCENE_PROMPTS.keys()))

    for bid, batch in _batch_jobs.items():
        if batch["status"] == "generating":
            return {
                "batch_id": bid,
                "status": "already_running",
                "current_story": batch.get("current_story"),
                "completed": len(batch["completed"]),
                "failed": len(batch["failed"]),
                "total": len(batch["story_ids"]),
            }

    batch_id = str(uuid.uuid4())[:12]
    _batch_jobs[batch_id] = {
        "status": "generating",
        "story_ids": story_ids,
        "current_idx": 0,
        "current_story": story_ids[0] if story_ids else None,
        "completed": [],
        "failed": [],
        "job_ids": [],
        "cancelled": False,
    }

    asyncio.create_task(_run_batch_generation(batch_id, story_ids))

    return {
        "batch_id": batch_id,
        "status": "started",
        "total": len(story_ids),
    }


@router.get("/ai-visuals/batch-status/{batch_id}")
async def get_batch_status(batch_id: str, user=Depends(get_current_user)):
    """Poll batch generation status."""
    batch = _batch_jobs.get(batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    return {
        "batch_id": batch_id,
        "status": batch["status"],
        "current_story": batch.get("current_story"),
        "current_idx": batch.get("current_idx", 0),
        "completed": len(batch["completed"]),
        "completed_ids": batch["completed"],
        "failed": len(batch["failed"]),
        "failed_ids": batch["failed"],
        "total": len(batch["story_ids"]),
    }


# ════════════════════════════════════════════
# INTRO VIDEO — Cinematic App Tour (Sora 2)
# ════════════════════════════════════════════

INTRO_VIDEO_PROMPT = """A cinematic, ethereal journey through cosmic spiritual realms. 
Opening: camera drifts through a vast nebula of swirling violet and teal stardust, revealing ancient constellation patterns from different world cultures. 
Transition: golden light rays pierce through crystal formations as sacred geometric patterns (Flower of Life, Metatron's Cube) slowly rotate and pulse. 
Middle: a serene figure sits in meditation surrounded by floating symbols from world traditions — Om, Yin-Yang, Eye of Horus, Tree of Life, Medicine Wheel — each glowing in its tradition's color. 
Ending: camera pulls back to reveal an infinite cosmic library with scrolls of light, settling on a luminous portal that opens invitingly. 
Style: ultra cinematic, magical realism, soft focus bokeh, volumetric light rays, deep space colors (indigo, violet, teal, gold), 4K quality, spiritual and awe-inspiring atmosphere."""

INTRO_CACHE_KEY = "cosmic_collective_intro_v1"


@router.get("/ai-visuals/intro-video")
async def get_intro_video():
    """Get the pre-generated cinematic intro video. No auth required."""
    cached = await db.ai_video_cache.find_one(
        {"cache_key": INTRO_CACHE_KEY}, {"_id": 0, "video_url": 1}
    )
    if cached and cached.get("video_url"):
        file_path = str(Path(__file__).parent.parent / cached["video_url"].lstrip("/api/"))
        if os.path.exists(file_path):
            return {"status": "ready", "video_url": cached["video_url"]}

    # Check if currently generating
    for jid, job in _video_jobs.items():
        if job.get("cache_key") == INTRO_CACHE_KEY:
            return {"status": job["status"], "job_id": jid}

    return {"status": "not_generated"}


@router.post("/ai-visuals/intro-video/generate")
async def generate_intro_video(user=Depends(get_current_user)):
    """Trigger generation of the cinematic intro video (admin/creator only)."""
    # Check if already exists
    cached = await db.ai_video_cache.find_one(
        {"cache_key": INTRO_CACHE_KEY}, {"_id": 0, "video_url": 1}
    )
    if cached and cached.get("video_url"):
        file_path = str(Path(__file__).parent.parent / cached["video_url"].lstrip("/api/"))
        if os.path.exists(file_path):
            return {"status": "complete", "video_url": cached["video_url"], "cached": True}

    # Check if already generating
    for jid, job in _video_jobs.items():
        if job.get("cache_key") == INTRO_CACHE_KEY and job["status"] == "generating":
            return {"status": "generating", "job_id": jid}

    # Start generation
    job_id = str(uuid.uuid4())[:12]
    filename = f"intro_{INTRO_CACHE_KEY[:12]}_{job_id}.mp4"
    _video_jobs[job_id] = {
        "status": "queued",
        "video_url": None,
        "error": None,
        "cache_key": INTRO_CACHE_KEY,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    asyncio.create_task(_run_video_generation(job_id, INTRO_VIDEO_PROMPT, INTRO_CACHE_KEY, filename))

    return {"status": "queued", "job_id": job_id}
