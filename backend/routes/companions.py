"""
companions.py — V68.92 Cross-Tradition Companion Engine
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When a user reads a sacred text, this module surfaces *historically &
spiritually intertwined* companions across other traditions. Powered
by a curated map of cross-cultural concept-bridges — not AI inference
— so the references are factually defensible.

Examples:
  • Surah Maryam (19) ↔ Luke 1 (Annunciation) ↔ Bhagavad Gita 4 (avatar)
  • Genesis 1 (Creation) ↔ Kumulipo (Hawaiian creation) ↔ Rig Veda 10.129
  • Tao Te Ching 1 ↔ Heart Sutra (emptiness) ↔ Ecclesiastes (vanity)
  • Dhammapada (mind verses) ↔ Mishnah Berachot (intentionality)

This is the "Cross-Pollination" layer the user repeatedly asked for —
ordained spiritual cross-reference, not AI guesswork.
"""
from fastapi import APIRouter, HTTPException
from deps import db
from typing import List, Dict

router = APIRouter()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CONCEPT BRIDGES — Each key is a concept; each value is a list of
# (text_id, optional_chapter_id, tradition_label, why_paired) tuples.
# A reading surfaces companions when its title/description/themes
# contain any of the trigger keywords.
#
# Format of each pairing dict:
#   id              → text id (matches BIBLE_BOOKS or SACRED_TEXTS)
#   chapter         → optional chapter id within that text
#   tradition       → display label
#   why             → 1-sentence reason this companion rhymes
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPANION_BRIDGES: Dict[str, List[Dict]] = {
    # Mary / Maryam — the sacred mother across three Abrahamic traditions
    "maryam": [
        {"id": "new-testament-luke", "tradition": "Christian (Gospel of Luke)",
         "why": "Luke 1 — the Annunciation and Magnificat parallel Surah Maryam's account of Mary."},
        {"id": "maryam", "tradition": "Islamic (Quran 19)",
         "why": "Surah Maryam — the only chapter in the Quran named after a woman, honoring Mary's purity."},
        {"id": "bhagavad-gita", "chapter": "bg-4", "tradition": "Hindu (Bhagavad Gita 4)",
         "why": "Krishna's avatar discourse — the divine entering human form across traditions."},
    ],

    # Creation — every cosmogony rhymes
    "creation": [
        {"id": "old-testament-genesis", "tradition": "Hebrew Bible (Genesis 1)",
         "why": "'In the beginning, God created the heavens and the earth' — the seven-day cosmogony."},
        {"id": "kumulipo", "tradition": "Polynesian (Native Hawaiian)",
         "why": "The Pō (deep darkness) before light — coral born first, then sea creatures, plants, humanity."},
        {"id": "whakapapa-maori", "tradition": "Polynesian (Māori)",
         "why": "Te Kore → Te Pō → Te Ao Mārama — the void becoming the night becoming the world of light."},
        {"id": "popol-vuh", "tradition": "Mayan",
         "why": "The makers shape humans from maize after three failed attempts — creation as iteration."},
        {"id": "norse-edda", "tradition": "Norse",
         "why": "Ginnungagap, the yawning void, between fire and ice — creation as cosmic friction."},
        {"id": "kojiki", "tradition": "Shinto (Japan)",
         "why": "Izanagi and Izanami stir the brine — Japanese islands born from a sacred spear."},
        {"id": "book-of-the-dead", "tradition": "Ancient Egyptian",
         "why": "Atum self-creating from the primordial waters of Nun — emergence from the deep."},
    ],

    # Mindfulness / Breath / Inner Sovereignty
    "mindfulness": [
        {"id": "majjhima-nikaya", "chapter": "mn-3", "tradition": "Buddhist (Satipatthana Sutta)",
         "why": "The Four Foundations of Mindfulness — body, feeling, mind, dharmas — the heart of Buddhist practice."},
        {"id": "majjhima-nikaya", "chapter": "mn-4", "tradition": "Buddhist (Anapanasati Sutta)",
         "why": "Mindfulness of breathing — sixteen contemplations on the in-breath and out-breath."},
        {"id": "yoga-sutras", "tradition": "Hindu (Patanjali)",
         "why": "Citta-vritti-nirodha — the stilling of mental fluctuations as the gateway to samadhi."},
        {"id": "tao-te-ching", "tradition": "Taoist",
         "why": "Wu wei — effortless action arising from emptied mind."},
        {"id": "philippians", "tradition": "Christian (Philippians 4)",
         "why": "'Whatsoever things are pure...think on these things' — Christian contemplative attention."},
    ],

    # Ethics of speech — across every tradition
    "speech": [
        {"id": "an-nisa", "tradition": "Islamic (Quran 4 — An-Nisa)",
         "why": "Justice in speech and the protection of the vulnerable through fair words."},
        {"id": "majjhima-nikaya", "tradition": "Buddhist (Right Speech)",
         "why": "Right Speech of the Eightfold Path — abstaining from lying, divisive, harsh, and idle talk."},
        {"id": "old-testament-proverbs", "tradition": "Hebrew Bible (Proverbs 18)",
         "why": "'Death and life are in the power of the tongue' — the proverbial weight of words."},
        {"id": "rumi-masnavi", "tradition": "Sufi (Rumi)",
         "why": "Sufi teachings on the silent witness behind every spoken word."},
    ],

    # The Sacred Mother / Divine Feminine
    "mother": [
        {"id": "maryam", "tradition": "Islamic (Surah Maryam)",
         "why": "The Quran's tribute to Mary — purity, childbirth under the date palm, the infant who spoke."},
        {"id": "new-testament-luke", "tradition": "Christian (Luke 1)",
         "why": "The Magnificat — Mary's song of justice and the upending of the proud."},
        {"id": "kumulipo", "tradition": "Polynesian (Hawaiian)",
         "why": "Papa, the earth-mother, in the genealogy of all Hawaiian aliʻi."},
        {"id": "whakapapa-maori", "tradition": "Polynesian (Māori)",
         "why": "Papatūānuku — the earth-mother held in eternal embrace until separated by Tāne Mahuta."},
    ],

    # Ancestors / Lineage / Continuity
    "lineage": [
        {"id": "kumulipo", "tradition": "Polynesian (Hawaiian)",
         "why": "The chant traces the genealogy of the universe down to the chiefs — every soul an inheritor."},
        {"id": "whakapapa-maori", "tradition": "Polynesian (Māori)",
         "why": "Whakapapa — the recitation of ancestral lines is itself a sacred act of memory."},
        {"id": "old-testament-genesis", "tradition": "Hebrew Bible",
         "why": "The 'toledot' (generations) of Adam, Noah, Abraham — the patriarchal lineages."},
        {"id": "lakota-seven-rites", "chapter": "ls-4", "tradition": "Lakota (Hunkapi)",
         "why": "Hunkapi — the Making of Relatives — extends lineage across blood lines into spiritual kinship."},
    ],

    # Aloha / Lovingkindness
    "love": [
        {"id": "huna-principles", "chapter": "hu-5", "tradition": "Hawaiian (ALOHA principle)",
         "why": "'To love is to be happy with' — the fifth Huna principle."},
        {"id": "anguttara-nikaya", "chapter": "an-3", "tradition": "Buddhist (Brahmaviharas)",
         "why": "Metta (loving-kindness) as the first of the four sublime states."},
        {"id": "new-testament-1corinthians", "tradition": "Christian (1 Corinthians 13)",
         "why": "'Love is patient, love is kind...' — the great hymn to agape."},
        {"id": "rumi-masnavi", "tradition": "Sufi (Rumi)",
         "why": "Ishq — divine love as the engine of return."},
    ],

    # Stewardship / Care for the Earth
    "stewardship": [
        {"id": "dreamtime-aboriginal", "chapter": "dt-5", "tradition": "Aboriginal (Caring for Country)",
         "why": "Country is not a resource — it is a living relative requiring ongoing care."},
        {"id": "hopi-prophecy", "chapter": "hp-5", "tradition": "Hopi (Koyaanisqatsi)",
         "why": "Life out of balance — the Hopi warning when stewardship is forgotten."},
        {"id": "lakota-seven-rites", "tradition": "Lakota",
         "why": "The pipe ceremony — every act of breath honors all relations (Mitakuye Oyasin)."},
        {"id": "old-testament-genesis", "tradition": "Hebrew Bible (Genesis 2)",
         "why": "Adam placed in the Garden 'to till and to keep it' — the original stewardship covenant."},
    ],

    # V68.93 — Emptiness / Non-Self / Form is Emptiness — across schools
    "emptiness": [
        {"id": "heart-sutra", "tradition": "Mahayana (Heart Sutra)",
         "why": "Form is emptiness; emptiness is form — the most concise statement of sunyata."},
        {"id": "diamond-sutra", "tradition": "Mahayana (Diamond Sutra)",
         "why": "All conditioned phenomena are like dreams, illusions, dewdrops, lightning."},
        {"id": "lankavatara-sutra", "tradition": "Yogacara / Zen",
         "why": "Mind-only (cittamatra) — the 'storehouse consciousness' that projects what we call the world."},
        {"id": "tao-te-ching", "tradition": "Taoist",
         "why": "The Tao that can be named is not the eternal Tao — emptiness as the fertile ground."},
        {"id": "samyutta-nikaya", "tradition": "Theravada (Anattalakkhana Sutta)",
         "why": "The Buddha's teaching of non-self (anatta) — the original Pali root of the Mahayana view."},
    ],

    # V68.93 — The Word / Sacred Sound / Logos
    "sacred_sound": [
        {"id": "atharva-veda", "chapter": "av-5", "tradition": "Hindu (Mandukya Upanishad)",
         "why": "Aum — the syllable that contains past, present, future, and the silence beyond."},
        {"id": "sama-veda", "tradition": "Hindu (Vedic chant)",
         "why": "The Saman melodies — sacred vibration as the primordial form of revelation."},
        {"id": "guru-granth-sahib", "chapter": "gg-1", "tradition": "Sikh (Mool Mantar)",
         "why": "Ik Onkar Sat Naam — One Universal Creator, the True Name. Sound as sovereign reality."},
        {"id": "new-testament-john", "tradition": "Christian (John 1)",
         "why": "In the beginning was the Word, and the Word was with God — Logos as creative principle."},
        {"id": "rumi-masnavi", "tradition": "Sufi (Rumi)",
         "why": "The reed flute's lament — sound as the voice of separated souls calling home."},
    ],

    # V68.93 — Dharma / Righteousness / The Path
    "dharma": [
        {"id": "bhagavad-gita", "tradition": "Hindu (Bhagavad Gita)",
         "why": "Krishna's teaching to Arjuna on Kurukshetra — duty without attachment to fruits."},
        {"id": "mahabharata", "chapter": "mb-4", "tradition": "Hindu (Bhishma Parva)",
         "why": "The full epic context of dharma in war — the Gita is its philosophical heart."},
        {"id": "samyutta-nikaya", "chapter": "sn-1", "tradition": "Buddhist (Setting the Wheel of Dharma)",
         "why": "The Buddha's first sermon — the Four Noble Truths and the Middle Way."},
        {"id": "guru-granth-sahib", "chapter": "gg-2", "tradition": "Sikh (Asa di Vaar)",
         "why": "The path of the Gurmukh — daily devotion, honest labor, sharing with others."},
    ],

    # V68.93 — Purification / Inner Fire / Asha
    "purification": [
        {"id": "zend-avesta", "chapter": "za-5", "tradition": "Zoroastrian (Asha vs Druj)",
         "why": "Asha (truth, righteousness) opposed to Druj (lie, distortion) — the cosmic ethical fire."},
        {"id": "visuddhimagga", "tradition": "Buddhist (Path of Purification)",
         "why": "Buddhaghosa's 23-chapter manual — sila, samadhi, panna as the threefold purification."},
        {"id": "yoga-sutras", "tradition": "Hindu (Patanjali)",
         "why": "Tapas (austerity) as one of the niyamas — inner heat that refines the practitioner."},
        {"id": "lakota-seven-rites", "chapter": "ls-1", "tradition": "Lakota (Inipi)",
         "why": "The purification lodge — sweat, prayer, and rebirth in the womb of the Earth."},
    ],
}

# Direct text-ID → companion-list shortcuts. When a user opens any of
# these IDs, return the listed companions immediately (no concept-keyword
# parsing needed). Keys are CANONICAL TEXT IDS.
DIRECT_COMPANIONS: Dict[str, List[Dict]] = {
    "maryam":            [c for c in COMPANION_BRIDGES["maryam"] if c["id"] != "maryam"],
    "kumulipo":          [c for c in COMPANION_BRIDGES["creation"] if c["id"] != "kumulipo"][:4],
    "whakapapa-maori":   [c for c in COMPANION_BRIDGES["creation"] if c["id"] != "whakapapa-maori"][:4],
    "popol-vuh":         [c for c in COMPANION_BRIDGES["creation"] if c["id"] != "popol-vuh"][:4],
    "norse-edda":        [c for c in COMPANION_BRIDGES["creation"] if c["id"] != "norse-edda"][:4],
    "huna-principles":   COMPANION_BRIDGES["love"],
    "majjhima-nikaya":   COMPANION_BRIDGES["mindfulness"],
    "yoga-sutras":       COMPANION_BRIDGES["mindfulness"],
    "tao-te-ching":      COMPANION_BRIDGES["mindfulness"],
    "dreamtime-aboriginal": COMPANION_BRIDGES["stewardship"],
    "hopi-prophecy":     COMPANION_BRIDGES["stewardship"],
    "lakota-seven-rites":COMPANION_BRIDGES["stewardship"],
    "rumi-masnavi":      COMPANION_BRIDGES["love"],
    "dhammapada":        COMPANION_BRIDGES["mindfulness"],
    # V68.93 — Direct mappings for the 15 newly catalogued texts.
    "heart-sutra":       COMPANION_BRIDGES["emptiness"],
    "diamond-sutra":     COMPANION_BRIDGES["emptiness"],
    "lankavatara-sutra": COMPANION_BRIDGES["emptiness"],
    "lotus-sutra":       COMPANION_BRIDGES["mindfulness"],
    "rig-veda":          COMPANION_BRIDGES["sacred_sound"],
    "sama-veda":         COMPANION_BRIDGES["sacred_sound"],
    "yajur-veda":        COMPANION_BRIDGES["sacred_sound"],
    "atharva-veda":      COMPANION_BRIDGES["sacred_sound"],
    "mahabharata":       COMPANION_BRIDGES["dharma"],
    "ramayana":          COMPANION_BRIDGES["dharma"],
    "brahma-sutras":     COMPANION_BRIDGES["emptiness"],
    "guru-granth-sahib": COMPANION_BRIDGES["sacred_sound"],
    "book-of-mormon":    COMPANION_BRIDGES["lineage"],
    "pearl-of-great-price": COMPANION_BRIDGES["creation"],
    "zend-avesta":       COMPANION_BRIDGES["purification"],
}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# V68.94 — "Today's Cross-Tradition Pairing"
#
# A deterministic-by-UTC-date pick from COMPANION_BRIDGES so every
# Sovereign Hub visitor sees the SAME pairing on a given day. Rotates
# through every concept before repeating, giving organic daily reasons
# to open the app.
#
# IMPORTANT (route-order): this handler MUST be registered BEFORE the
# `/companions/{text_id}` catch-all below, otherwise FastAPI's
# declaration-order matching turns "daily" into a text_id lookup and
# the endpoint silently returns an empty companion list.
#
# Why server-side instead of frontend Math.random:
#   • Single source of truth — adding new concepts auto-extends rotation
#   • Future-compat: lets us inject curated calendar overrides later
#     (e.g., Christmas → "maryam", Wesak → "emptiness") without a
#     frontend release.
#   • Stable response shape so the test suite can pin it.
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
from datetime import datetime, timezone

# Curated calendar overrides — month/day → concept. Empty slots fall
# through to the deterministic rotation. Keep this small and meaningful;
# this is NOT a holiday lookup table, it's a "right pairing on the right
# day" hint that future agents/PMs can extend without code review.
_DAILY_CALENDAR_OVERRIDES: Dict[str, str] = {
    "12-25": "maryam",       # Christmas — Annunciation/Mary across traditions
    "05-23": "emptiness",    # Approx. Wesak — Buddhist enlightenment day
    "10-24": "dharma",       # United Nations / global covenant resonance
    "04-22": "stewardship",  # Earth Day — Caring-for-Country across traditions
}


def _pick_daily_concept(today: datetime) -> str:
    """Deterministic daily concept. Calendar override wins; otherwise
    rotate by ordinal-day across the available concept bridges so the
    cycle matches the bridge count exactly."""
    md_key = today.strftime("%m-%d")
    if md_key in _DAILY_CALENDAR_OVERRIDES:
        override = _DAILY_CALENDAR_OVERRIDES[md_key]
        if override in COMPANION_BRIDGES:
            return override
    keys = list(COMPANION_BRIDGES.keys())
    if not keys:
        return ""
    # Day-of-year is stable per-UTC-date and rotates through all concepts.
    doy = today.timetuple().tm_yday
    return keys[doy % len(keys)]


@router.get("/companions/daily")
async def get_daily_pairing():
    """Today's Cross-Tradition Pairing for the Sovereign Hub home view.
    Returns concept + companions list, plus a date stamp so the client
    can cache for the rest of the UTC day."""
    today = datetime.now(timezone.utc)
    concept = _pick_daily_concept(today)
    if not concept:
        # COMPANION_BRIDGES would only be empty during catastrophic edits;
        # graceful empty response keeps the widget Flatland-compliant.
        return {"date_utc": today.strftime("%Y-%m-%d"), "concept": None, "companions": []}
    return {
        "date_utc": today.strftime("%Y-%m-%d"),
        "concept": concept,
        "companions": COMPANION_BRIDGES[concept],
    }


@router.get("/companions/{text_id}")
async def get_companions(text_id: str):
    """Return ordained cross-tradition companions for a given text id.
    Falls back gracefully — empty companions[] is a valid response."""
    text_id = text_id.strip().lower()
    direct = DIRECT_COMPANIONS.get(text_id, [])
    return {
        "text_id": text_id,
        "companions": direct,
        "concept_bridges_available": list(COMPANION_BRIDGES.keys()),
    }


@router.get("/companions/concept/{concept}")
async def get_concept_companions(concept: str):
    """Return all texts that share a multi-tradition concept (creation,
    mindfulness, mother, love, stewardship, lineage, speech, mindfulness)."""
    concept = concept.strip().lower()
    if concept not in COMPANION_BRIDGES:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown concept. Available: {list(COMPANION_BRIDGES.keys())}",
        )
    return {
        "concept": concept,
        "companions": COMPANION_BRIDGES[concept],
    }
