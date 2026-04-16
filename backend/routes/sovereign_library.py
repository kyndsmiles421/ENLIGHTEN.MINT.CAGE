"""
Sovereign Cultural Library — V55.1 OmniCore
The Grand Library of Human Wisdom.

10 foundational traditions, each speaking in its own voice.
Every tradition is accessible from every module system-wide.
The Mixer lets users combine elements across cultures.

Phase 1 Launch Traditions:
1. Lakota/Oceti Sakowin — Star Knowledge, Medicine Wheel, Sacred Hoop
2. Kemetic/Egyptian — Pyramid geometry, Thoth, Book of Coming Forth by Day
3. Vedic/Hindu — Chakras, Yantra, Ayurveda, Yoga
4. Yoruba/West African — Ifá divination, Orisha, Djembe rhythms, Adinkra
5. Mayan — Tzolkin calendar, pyramid astronomy, zero mathematics
6. Aboriginal Australian — Dreamtime, Songlines, star maps
7. Celtic — Ogham, sacred groves, solstice astronomy, Brigid's fire
8. Kabbalistic/Jewish — Tree of Life, Metatron's Cube, Gematria
9. Taoist/Chinese — TCM, I Ching, Feng Shui, Qi Gong
10. Sufi/Islamic — Sacred geometry, whirling meditation, Zikr, Rumi

Each tradition has: wisdom, rhythms, geometry, healing, and voice data
that plugs into the Mixer, Academy, Oracle, and all 160+ modules.
"""

# ═══════════════════════════════════════════════════════════════
# THE SOVEREIGN LIBRARY — 10 Traditions × 6 Dimensions each
# Dimensions: wisdom, rhythm, geometry, healing, stars, practices
# ═══════════════════════════════════════════════════════════════

SOVEREIGN_LIBRARY = {
    "lakota": {
        "id": "lakota",
        "name": "Lakota / Oceti Sakowin",
        "region": "Indigenous Americas — Great Plains",
        "core_teaching": "Mitakuye Oyasin — We Are All Related",
        "source": "Ronald Goodman 'Lakota Star Knowledge', Native Skywatchers, Akta Lakota Museum",
        "wisdom": {
            "philosophy": "All life moves in circles. The Sacred Hoop (Cangleska Wakan) has no beginning and no end. Four directions, four virtues, four stages of life — all in balance.",
            "key_concepts": ["Mitakuye Oyasin", "Wakan Tanka (Great Mystery)", "Cangleska Wakan (Sacred Hoop)", "Inipi (Sweat Lodge)", "Hanblecya (Vision Quest)", "Wopila (Giveaway)"],
            "virtues": ["Wisdom (East)", "Generosity (South)", "Bravery (West)", "Fortitude (North)"],
        },
        "rhythm": {
            "instruments": ["Frame drum (heartbeat rhythm)", "Rattles", "Flute (Siyotanka)"],
            "tempo_bpm": "60-80 (heartbeat synchronization)",
            "signature_sound": "Single-beat drum at 60 BPM — the Earth's heartbeat",
            "mixer_tags": ["lakota_drum", "heartbeat_60bpm", "plains_flute", "honor_song"],
            "ceremony_music": "Each ceremony has specific songs received in dreams — songs are given, not composed",
        },
        "geometry": {
            "primary_form": "Circle / Sacred Hoop (Cangleska Wakan)",
            "forms": ["Medicine Wheel (4 directions)", "Tipi (conical — sky touching earth)", "Star quilts (geometric prayer)", "Sun Dance circle"],
            "principle": "All sacred Lakota geometry is circular. The circle represents wholeness, eternity, and the interconnection of all life.",
        },
        "healing": {
            "modalities": ["Inipi (Sweat Lodge purification)", "Sacred pipe ceremony", "Herbal medicine (sage, sweetgrass, cedar, tobacco)", "Vision Quest fasting", "Yuwipi ceremony"],
            "plants": ["Peji hota (sage)", "Wachanga (sweetgrass)", "Hante (cedar)", "Canli (tobacco)"],
            "principle": "Healing comes from relationship — with the plants, the stones, the water, and the community. You cannot heal alone.",
        },
        "stars": {
            "tradition_name": "Wicahpi Oyate — Star Nation",
            "key_stars": ["Cansasa Ipusye (pipe lighter)", "Gleska Wakan (Sacred Hoop)", "Nape (The Hand)", "Wicincala Sakowin (Pleiades)", "Tayamni (Bear's Lodge)", "Wakinyan (Thunderbird)", "Wicahpi Owanjila (Polaris)", "Anpo Wicahpi (Venus)", "Wanagi Tacanku (Milky Way)"],
            "principle": "The sky is a mirror of the Earth. Black Hills geography maps to the star patterns. As above, so below.",
        },
        "practices": ["Pipe ceremony", "Sweat Lodge", "Vision Quest", "Sun Dance", "Drum circle", "Talking circle", "Giveaway ceremony"],
    },

    "kemetic": {
        "id": "kemetic",
        "name": "Kemetic / Ancient Egyptian",
        "region": "Africa — Nile Valley",
        "core_teaching": "As above, so below. As within, so without.",
        "source": "Book of Coming Forth by Day (Book of the Dead), Hermetic Corpus, Temple inscriptions",
        "wisdom": {
            "philosophy": "Ma'at — the cosmic order of truth, justice, and harmony. Every action is weighed against the feather of Ma'at. The goal of life is to align the individual soul (Ba/Ka) with the universal order.",
            "key_concepts": ["Ma'at (truth/order)", "Ka (life force)", "Ba (soul)", "Akh (illuminated spirit)", "Duat (underworld)", "Thoth (wisdom god)", "Djehuti (sacred scribe)"],
            "virtues": ["Ma'at (truth)", "Isfet (chaos — to be overcome)", "Heka (divine magic/speech)", "Sia (perception)"],
        },
        "rhythm": {
            "instruments": ["Sistrum (sacred rattle of Hathor)", "Temple drums", "Harp", "Menat necklace (percussion)"],
            "tempo_bpm": "72 (solar pulse — linked to the 72 names of God)",
            "signature_sound": "Sistrum rattle — believed to ward off Set (chaos) and invoke Hathor (joy)",
            "mixer_tags": ["sistrum_rattle", "temple_drum_72", "nile_harp", "pyramid_drone"],
            "ceremony_music": "Temple rituals used specific tones to open the doors of the Duat",
        },
        "geometry": {
            "primary_form": "Pyramid / Triangle (the primordial mound rising from Nun)",
            "forms": ["Great Pyramid proportions (φ ratio in cross-section)", "Flower of Life (Osireion, Abydos)", "Ankh (loop of eternity)", "Djed pillar (stability)", "Eye of Horus (fractional system)"],
            "principle": "Egyptian geometry is architecture as prayer. Every angle, every proportion encodes cosmic law. The pyramid is a machine for aligning Earth and Sky.",
        },
        "healing": {
            "modalities": ["Gem therapy (lapis lazuli, turquoise, carnelian)", "Sound healing in temple chambers", "Herbal medicine (papyrus records)", "Dream incubation (sleeping in temples)", "Color therapy"],
            "plants": ["Blue lotus (Nymphaea caerulea — sacred entheogen)", "Frankincense (purification)", "Myrrh (embalming, meditation)", "Aloe vera (healing)", "Castor oil"],
            "principle": "The body is a temple. Healing aligns the Ka (life force) with Ma'at (cosmic order). Medicine is both physical and magical (Heka).",
        },
        "stars": {
            "tradition_name": "The Imperishable Stars",
            "key_stars": ["Sirius (Sopdet — herald of the Nile flood)", "Orion (Sah — Osiris in the sky)", "Circumpolar stars (the undying ones)", "Decans (36 star-groups marking 10-day weeks)"],
            "principle": "The pharaoh's soul ascends to become an imperishable star. The Great Pyramid's shafts align to Orion and Sirius. The sky is the destination.",
        },
        "practices": ["Ma'at meditation (weighing the heart)", "Temple visualization", "Heka (sacred speech)", "Dream incubation", "Ankh breathing"],
    },

    "vedic": {
        "id": "vedic",
        "name": "Vedic / Hindu",
        "region": "Asia — Indian Subcontinent",
        "core_teaching": "Tat Tvam Asi — Thou Art That. Atman (individual soul) IS Brahman (universal consciousness).",
        "source": "Vedas, Upanishads, Bhagavad Gita, Yoga Sutras of Patanjali, Ayurvedic Samhitas",
        "wisdom": {
            "philosophy": "Reality is Brahman — one unified consciousness appearing as many. The purpose of life is to realize this unity through dharma (right action), jnana (knowledge), bhakti (devotion), or yoga (union).",
            "key_concepts": ["Brahman (absolute reality)", "Atman (individual soul)", "Dharma (right path)", "Karma (action/consequence)", "Moksha (liberation)", "Chakra (energy centers)", "Prana (life force)"],
            "virtues": ["Ahimsa (non-harm)", "Satya (truth)", "Asteya (non-stealing)", "Brahmacharya (moderation)", "Aparigraha (non-grasping)"],
        },
        "rhythm": {
            "instruments": ["Tabla", "Tanpura (drone)", "Sitar", "Singing bowls", "Conch shell (Shankha)"],
            "tempo_bpm": "Variable — raga-based, follows time of day (prahar)",
            "signature_sound": "OM (AUM) — the primordial vibration from which creation emerged. 136.1 Hz.",
            "mixer_tags": ["om_drone_136hz", "tabla_taal", "tanpura_drone", "singing_bowl", "vedic_chant"],
            "ceremony_music": "Each raga is assigned to a time of day and a mood (rasa). Music IS medicine in the Vedic system.",
        },
        "geometry": {
            "primary_form": "Sri Yantra (9 interlocking triangles — union of Shiva and Shakti)",
            "forms": ["Sri Yantra", "Mandala", "Swastika (auspiciousness — ancient form)", "Lotus patterns", "Kolam/Rangoli (threshold geometry)"],
            "principle": "Yantra is frozen mantra. Geometry is sound made visible. Meditating on a yantra activates the same consciousness as chanting its mantra.",
        },
        "healing": {
            "modalities": ["Ayurveda (dosha balancing)", "Yoga asana", "Pranayama (breathwork)", "Marma therapy (108 vital points)", "Panchakarma (5-action cleanse)", "Jyotish (astrological remedies)"],
            "plants": ["Tulsi (holy basil)", "Ashwagandha (adaptogen)", "Turmeric (Haridra)", "Brahmi (brain tonic)", "Triphala (3-fruit cleanse)"],
            "principle": "Health is balance of the three doshas (Vata/Pitta/Kapha). Disease is imbalance. Treatment restores harmony through diet, herbs, lifestyle, and spiritual practice.",
        },
        "stars": {
            "tradition_name": "Jyotish — Science of Light",
            "key_stars": ["27 Nakshatras (lunar mansions)", "9 Grahas (planets as living beings)", "12 Rashis (zodiac signs)", "Rohini (Aldebaran — Moon's favorite wife)"],
            "principle": "The planets are not distant objects — they are devatas (deities) whose light influences human consciousness. Jyotish reads this influence to guide action.",
        },
        "practices": ["Yoga (8 limbs)", "Pranayama", "Mantra japa", "Puja (devotional ritual)", "Ayurvedic daily routine (Dinacharya)", "Meditation (Dhyana)"],
    },

    "yoruba": {
        "id": "yoruba",
        "name": "Yoruba / West African",
        "region": "Africa — West Africa (Nigeria, Benin, Togo)",
        "core_teaching": "Iwa Pele — Gentle Character. The cultivation of good character is the highest spiritual achievement.",
        "source": "Ifá oral corpus (Odu Ifá — 256 verses), Yoruba elder tradition, Diaspora preservation (Santería, Candomblé)",
        "wisdom": {
            "philosophy": "The universe is governed by Olodumare (Supreme Creator) through the Orisha (divine forces of nature). Every person has an Ori (inner head/destiny) chosen before birth. Ifá divination reveals your Ori's path.",
            "key_concepts": ["Olodumare (Creator)", "Orisha (nature deities)", "Ori (personal destiny/head)", "Ifá (divination system)", "Ashé (divine power/energy)", "Iwa Pele (good character)", "Odu (sacred verses)"],
            "virtues": ["Iwa Pele (gentle character)", "Suuru (patience)", "Ire (blessings)", "Ase (authority/power to create)"],
        },
        "rhythm": {
            "instruments": ["Djembe drum", "Dundun (talking drum)", "Batá drums (sacred triple drum)", "Shekere (gourd rattle)", "Agogo (bell)"],
            "tempo_bpm": "100-160 (polyrhythmic — multiple time signatures simultaneously)",
            "signature_sound": "Batá drum ensemble — three drums conversing. Each Orisha has specific rhythmic patterns that invoke their presence.",
            "mixer_tags": ["djembe_polyrhythm", "bata_orisha", "dundun_talking", "shekere_rattle", "african_chant"],
            "ceremony_music": "Rhythm is prayer. Each Orisha answers to specific drum patterns. Drumming IS invocation.",
        },
        "geometry": {
            "primary_form": "Adinkra symbols (Akan/Ashanti — visual philosophy)",
            "forms": ["Adinkra symbols (62+ encoded concepts)", "Ifá divination board (circular cosmogram)", "Fractal geometry in village layouts", "Textile patterns (kente cloth mathematics)"],
            "principle": "African geometry is embedded in daily life — village layouts follow fractal patterns, textile designs encode mathematical sequences, and Adinkra symbols compress entire philosophies into single marks.",
        },
        "healing": {
            "modalities": ["Ifá herbal medicine (Ewe Oogun)", "Orisha devotion for specific ailments", "Drumming therapy", "River/ocean cleansing (Yemoja/Oshun)", "Ancestor communication"],
            "plants": ["Shea butter tree (Ori)", "Kola nut (ceremonial stimulant)", "Bitter kola (anti-inflammatory)", "Moringa (Ewé Idagba Moto)", "African basil (Efirin)"],
            "principle": "Illness has spiritual roots. Healing addresses the physical AND the Ori (spiritual destiny). An Ifá priest diagnoses through divination before prescribing herbs.",
        },
        "stars": {
            "tradition_name": "Dogon Star Knowledge",
            "key_stars": ["Sirius A (Sigi Tolo — the main star)", "Sirius B (Po Tolo — the hidden companion, known before Western telescopes)", "Emme Ya (Sirius C — debated)", "The Nommo (amphibious teachers from Sirius)"],
            "principle": "The Dogon people of Mali knew the orbital period and companion nature of Sirius B centuries before Western astronomy confirmed it. Knowledge comes from the ancestors — the Nommo.",
        },
        "practices": ["Ifá divination", "Orisha devotion", "Drum and dance ceremony", "Ancestor veneration (Egungun)", "River cleansing", "Adinkra meditation"],
    },

    "mayan": {
        "id": "mayan",
        "name": "Mayan / Mesoamerican",
        "region": "Indigenous Americas — Central America",
        "core_teaching": "In Lak'ech — I Am Another Yourself. You are my other me.",
        "source": "Popol Vuh, Dresden Codex, living Maya Daykeeper tradition, archaeoastronomy research",
        "wisdom": {
            "philosophy": "Time is not linear — it spirals. The Tzolkin (260-day sacred calendar) and the Haab (365-day solar calendar) interlock like gears, creating the Calendar Round (52 years). Each day carries a unique energy (nawal/day sign).",
            "key_concepts": ["Hunab Ku (One Giver of Movement and Measure)", "Nawal (day spirit/energy)", "Tzolkin (sacred 260-day calendar)", "In Lak'ech (I am another yourself)", "Xibalba (underworld)", "World Tree (Wacah Chan)"],
            "virtues": ["In Lak'ech (unity)", "Gratitude to Ajaw (Creator Sun)", "Service to community", "Respect for Nawal (time-energy)"],
        },
        "rhythm": {
            "instruments": ["Tun drum (hollow log drum)", "Turtle shell percussion", "Ocarinas (ceramic flutes)", "Rattles (seeds/stones)", "Conch shell trumpet"],
            "tempo_bpm": "80-120 (ceremonial processional rhythms)",
            "signature_sound": "Conch shell call — announces ceremony, bridges human voice to ocean/sky",
            "mixer_tags": ["tun_drum", "turtle_percussion", "ocarina_flute", "conch_call", "mayan_chant"],
            "ceremony_music": "Music marks the passage of time-energy. Each ceremony aligns with the Tzolkin day sign.",
        },
        "geometry": {
            "primary_form": "Pyramid (stepped — 9 levels representing the 9 Lords of Xibalba)",
            "forms": ["El Castillo (Kukulkan pyramid — equinox serpent shadow)", "Tzolkin grid (13 × 20 = 260)", "Venus cycles (584 days)", "Zero (the Mayans invented zero as a mathematical concept)"],
            "principle": "Mayan geometry is time made visible. Pyramids are calendars in stone. The serpent shadow at equinox on El Castillo is geometry, astronomy, and ceremony unified.",
        },
        "healing": {
            "modalities": ["Temazcal (sweat lodge — Mesoamerican)", "Herbal medicine (extensive pharmacopeia)", "Day-sign diagnosis (your Nawal indicates health patterns)", "Cacao ceremony (heart-opening medicine)", "Copal smoke cleansing"],
            "plants": ["Cacao (Theobroma — food of the gods)", "Copal (tree resin — sacred smoke)", "Epazote (digestive)", "Achiote (ceremonial and medicinal)", "Chaya (Maya spinach — nutrient dense)"],
            "principle": "Health follows the calendar. Your Nawal (birth day-sign) indicates constitutional strengths and vulnerabilities. Treatment aligns body with time-energy.",
        },
        "stars": {
            "tradition_name": "Maya Archaeoastronomy",
            "key_stars": ["Venus (Noh Ek — Great Star, tracked with extreme precision)", "Pleiades (Tzab-ek — Rattlesnake's Tail)", "Orion (Turtle/Hearth — 3 hearthstones of creation)", "Milky Way (Wakah Chan — World Tree/Raised-Up Sky)"],
            "principle": "The Milky Way IS the World Tree (Wacah Chan). When it stands vertical at zenith, the sky-tree is 'raised' — creation renews. Venus cycles governed warfare and ceremony for 1000+ years.",
        },
        "practices": ["Tzolkin day-counting", "Cacao ceremony", "Fire ceremony", "Temazcal", "Pilgrimage to sacred sites", "Venus tracking"],
    },

    "aboriginal": {
        "id": "aboriginal",
        "name": "Aboriginal Australian",
        "region": "Oceania — Australia",
        "core_teaching": "The Dreaming (Tjukurpa) — the land, the law, the stories, and the ancestors are ONE continuous reality.",
        "source": "Elder oral tradition (65,000+ years — oldest continuous culture on Earth), Songline research, Duane Hamacher's Aboriginal astronomy work",
        "wisdom": {
            "philosophy": "The Dreaming is not the past — it is always happening. Ancestor beings sang the world into existence. Their paths across the land became Songlines — musical maps that encode geography, law, and ecology. To walk a Songline is to re-create the world.",
            "key_concepts": ["Tjukurpa/Jukurrpa (The Dreaming)", "Songlines (musical paths)", "Country (land as living relative)", "Caring for Country (ecological stewardship)", "Kinship systems (everything is related through law)"],
            "virtues": ["Caring for Country", "Respect for elders", "Sharing (reciprocal obligation)", "Law (Tjukurpa — living tradition)"],
        },
        "rhythm": {
            "instruments": ["Didgeridoo (Yidaki — oldest wind instrument, 1500+ years)", "Clapsticks (paired rhythm sticks)", "Body percussion", "Voice (overtone singing)"],
            "tempo_bpm": "40-60 (deep grounding — the didgeridoo operates at Earth resonance frequencies)",
            "signature_sound": "Didgeridoo circular breathing drone — 50-70 Hz, close to the Schumann resonance (7.83 Hz overtones)",
            "mixer_tags": ["didgeridoo_drone", "clapstick_rhythm", "songline_vocal", "earth_resonance"],
            "ceremony_music": "Songlines are sung while walking the land. The music IS the map. If you can sing it, you can navigate it.",
        },
        "geometry": {
            "primary_form": "Concentric circles (sacred sites, waterholes, meeting places)",
            "forms": ["Concentric circles (place/waterhole)", "U-shapes (people sitting)", "Wavy lines (water/snake)", "Dot paintings (topographic/ceremonial maps)", "Track marks (animal/ancestor footprints)"],
            "principle": "Aboriginal art IS geometry IS cartography IS ceremony. A dot painting is simultaneously a sacred story, a map of the land, and a geometric pattern. Form and meaning are inseparable.",
        },
        "healing": {
            "modalities": ["Bush medicine (extensive pharmacopeia, 65,000 years of development)", "Smoking ceremonies (purification with native plants)", "Songline healing (singing the sick person's Country)", "Bone pointing (spiritual intervention)", "Waterhole healing"],
            "plants": ["Tea tree (Melaleuca — antiseptic)", "Eucalyptus (respiratory)", "Kakadu plum (highest vitamin C concentration on Earth)", "Wattle seed (nutrition)", "Emu bush (antimicrobial)"],
            "principle": "Illness is disconnection from Country. Healing reconnects the person to their land, their Dreaming, their ancestors. Bush medicine treats the body; ceremony treats the spirit.",
        },
        "stars": {
            "tradition_name": "Aboriginal Astronomy (65,000+ years — oldest astronomy on Earth)",
            "key_stars": ["Emu in the Sky (dark nebulae of Milky Way — the ABSENCE of stars forms the constellation)", "Orion (varies by nation — often a canoe or hunting party)", "Pleiades (Seven Sisters — echoes worldwide)", "Coal Sack Nebula (possum or camp site)", "Morning Star (Venus — significant in Yolngu ceremony)"],
            "principle": "Aboriginal Australians are the first astronomers. They read DARK constellations (the gaps between stars), not just bright ones. The Emu in the Sky uses the dark lanes of the Milky Way — a completely different way of seeing the sky.",
        },
        "practices": ["Walking Country (Songline pilgrimage)", "Smoking ceremony", "Corroboree (ceremonial dance)", "Bush tucker (seasonal eating from the land)", "Star-season reading", "Dot painting as meditation"],
    },

    "celtic": {
        "id": "celtic",
        "name": "Celtic / Gaelic",
        "region": "Europe — British Isles, Gaul, Iberia",
        "core_teaching": "The Otherworld is not elsewhere — it is here, overlapping with this world, accessible through thin places.",
        "source": "Irish mythological cycle, Welsh Mabinogion, Ogham tradition, archaeoastronomy of Newgrange/Stonehenge",
        "wisdom": {
            "philosophy": "Reality has two faces — this world and the Otherworld (Tír na nÓg). They overlap at thin places (sacred wells, hilltops, crossroads) and thin times (dawn, dusk, Samhain, Beltane). The Druids were the keepers of this knowledge.",
            "key_concepts": ["Awen (divine inspiration)", "Ogham (tree alphabet)", "Thin places", "The Otherworld (Tír na nÓg)", "Sovereignty (the land chooses the king)", "Bríd/Brigid (fire, poetry, healing)"],
            "virtues": ["Truth (Fírinne)", "Honor (Clú)", "Hospitality (Oigidecht)", "Courage (Misneach)"],
        },
        "rhythm": {
            "instruments": ["Bodhrán (frame drum)", "Irish harp (Cláirseach)", "Uilleann pipes", "Tin whistle", "Fiddle"],
            "tempo_bpm": "90-140 (jigs 6/8, reels 4/4 — music that makes the feet move)",
            "signature_sound": "Bodhrán pulse with uilleann pipe drone — creates a trance-like groove that bridges dance and meditation",
            "mixer_tags": ["bodhran_pulse", "celtic_harp", "uilleann_drone", "tin_whistle", "gaelic_chant"],
            "ceremony_music": "Music at the crossroads — Celtic music was played at thin places and thin times to open doorways between worlds.",
        },
        "geometry": {
            "primary_form": "Triple Spiral (Triskele — found at Newgrange, 3200 BCE)",
            "forms": ["Triskele (triple spiral — older than the pyramids)", "Celtic knot (endless — no beginning, no end)", "Newgrange passage (winter solstice light box)", "Stone circles (Stonehenge, Callanish)", "Ogham staves (linear tree-alphabet)"],
            "principle": "Celtic geometry is organic — spirals, knots, and interlaces. No straight lines, no sharp corners. Everything flows and returns. The triple spiral may be the oldest sacred geometric symbol in Europe.",
        },
        "healing": {
            "modalities": ["Sacred well healing (holy wells throughout Ireland)", "Herbal medicine (extensive Druidic pharmacopeia)", "Tree medicine (each Ogham tree has healing properties)", "Fire ceremonies (Beltane cleansing)", "Sound healing (harp therapy — documented in medieval Ireland)"],
            "plants": ["Oak (Duir — strength, doorway)", "Hazel (Coll — wisdom, divination)", "Elder (Ruis — death/rebirth)", "Mistletoe (sacred to Druids)", "Meadowsweet (original aspirin plant)"],
            "principle": "Healing comes from the land — wells, trees, and stones carry the memory of the Otherworld. The healer connects the sick person to the living landscape.",
        },
        "stars": {
            "tradition_name": "Insular Celtic Astronomy",
            "key_stars": ["Newgrange solstice alignment (winter solstice sunrise enters the passage)", "Stonehenge (summer solstice + lunar standstill)", "Callanish stones (lunar alignment)", "Pleiades (seasonal marker)"],
            "principle": "Celtic astronomy is monumental — built into stone circles and passage tombs. Newgrange is 500 years older than the Great Pyramid. The stones remember what the people forgot.",
        },
        "practices": ["Ogham divination", "Sacred well pilgrimage", "Fire festival ceremonies (Samhain, Imbolc, Beltane, Lughnasadh)", "Tree meditation", "Walking the thin places"],
    },

    "kabbalistic": {
        "id": "kabbalistic",
        "name": "Kabbalistic / Jewish Mysticism",
        "region": "Middle East — Israel, Mediterranean, diaspora",
        "core_teaching": "Ein Sof — The Infinite. God is beyond comprehension, but divine light flows through 10 Sefirot into creation.",
        "source": "Zohar, Sefer Yetzirah, Bahir, Lurianic Kabbalah, Hasidic tradition",
        "wisdom": {
            "philosophy": "Creation is a series of emanations (Sefirot) from the Infinite (Ein Sof). The 10 Sefirot form the Tree of Life — a map of consciousness from the divine to the material. Tikkun Olam — repair the world through righteous action.",
            "key_concepts": ["Ein Sof (The Infinite)", "Sefirot (10 emanations)", "Tree of Life (Etz Chaim)", "Tikkun Olam (world repair)", "Gematria (number-letter equivalence)", "Tzimtzum (divine contraction)"],
            "virtues": ["Chesed (loving-kindness)", "Gevurah (strength/discipline)", "Tiferet (beauty/balance)", "Emet (truth)"],
        },
        "rhythm": {
            "instruments": ["Shofar (ram's horn)", "Hand drum (tof)", "Voice (niggun — wordless melody)", "Lyre (Kinnor)"],
            "tempo_bpm": "Variable — niggun melodies range from contemplative (40 BPM) to ecstatic (160 BPM)",
            "signature_sound": "Niggun — a wordless melody that transcends language. The Hasidic tradition says a niggun can reach where words cannot.",
            "mixer_tags": ["shofar_blast", "niggun_chant", "kabbalistic_drone", "hebrew_prayer"],
            "ceremony_music": "Shabbat songs, Havdalah melodies, and niggunim (wordless songs) are vehicles for devekut (cleaving to God).",
        },
        "geometry": {
            "primary_form": "Tree of Life (10 Sefirot connected by 22 paths)",
            "forms": ["Tree of Life", "Metatron's Cube (13 circles from Fruit of Life)", "Star of David (Magen David — interpenetrating triangles)", "Hebrew letters as geometric forms (Sefer Yetzirah)", "Flower of Life → Fruit of Life → Metatron's Cube progression"],
            "principle": "Kabbalistic geometry maps the structure of consciousness. The Tree of Life is not a metaphor — it is the actual architecture of how divine light descends into matter through 10 stages.",
        },
        "healing": {
            "modalities": ["Meditation on Sefirot (each governs a body region)", "Hebrew letter meditation", "Mikveh (ritual water immersion)", "Shabbat rest (weekly reset)", "Psalms recitation for healing"],
            "plants": ["Hyssop (purification)", "Frankincense (temple offering)", "Myrtle (Hadassah — used in Sukkot)", "Olive oil (anointing)", "Pomegranate (613 seeds = 613 mitzvot)"],
            "principle": "Healing restores the flow of divine light through the Sefirot. Blockages in consciousness manifest as physical illness. Meditation, prayer, and righteous action clear the channels.",
        },
        "stars": {
            "tradition_name": "Jewish Calendar Astronomy",
            "key_stars": ["Kochav (generic star — each Sefirah associated with a celestial body)", "Moon (lunar calendar governs all Jewish holidays)", "Saturn (Shabbat — Saturday)", "Jupiter (Tzedek — righteousness)"],
            "principle": "The Jewish calendar is lunar-solar. The moon's monthly death and rebirth mirrors the soul's journey through the Sefirot. Every Shabbat is a miniature Olam Ha-Ba (World to Come).",
        },
        "practices": ["Tree of Life meditation", "Gematria (number-letter analysis)", "Shabbat observance", "Mikveh immersion", "Niggun singing", "Hitbodedut (spontaneous prayer in nature)"],
    },

    "taoist": {
        "id": "taoist",
        "name": "Taoist / Chinese",
        "region": "Asia — China",
        "core_teaching": "The Tao that can be named is not the eternal Tao. Wu Wei — effortless action, flowing with the Way.",
        "source": "Tao Te Ching (Laozi), Zhuangzi, I Ching, Huang Di Nei Jing (Yellow Emperor's Classic of Medicine)",
        "wisdom": {
            "philosophy": "The Tao (Way) is the source and pattern of everything. It cannot be grasped by the mind, only embodied through Wu Wei (non-forced action). Yin and Yang are not opposites — they are the Tao breathing.",
            "key_concepts": ["Tao (The Way)", "Wu Wei (effortless action)", "Yin-Yang (complementary forces)", "Qi (vital energy)", "De (virtue/power)", "Wuji (the void before yin-yang)", "Five Elements (Wu Xing)"],
            "virtues": ["Compassion (Ci)", "Frugality (Jian)", "Humility (Bu gan wei tianxia xian)"],
        },
        "rhythm": {
            "instruments": ["Guqin (7-string zither — scholar's instrument)", "Erhu (2-string fiddle)", "Pipa (lute)", "Temple bells", "Wooden fish (muyu — meditation percussion)"],
            "tempo_bpm": "50-80 (contemplative — Guqin music has silence as an instrument)",
            "signature_sound": "Guqin — sparse notes with long silences. The silence between notes IS the music. This is Wu Wei in sound.",
            "mixer_tags": ["guqin_meditation", "temple_bell", "wooden_fish", "erhu_melody", "taoist_chant"],
            "ceremony_music": "Taoist ritual music follows the Five Elements cycle. Temple ceremonies use specific modes (gong, shang, jue, zhi, yu) for different organs and seasons.",
        },
        "geometry": {
            "primary_form": "Yin-Yang (Taijitu — the dynamic balance of all forces)",
            "forms": ["Taijitu (Yin-Yang symbol)", "Bagua (8 trigrams of the I Ching)", "Lo Shu magic square (3×3 — all rows sum to 15)", "Five Elements cycle (generative and destructive)", "Feng Shui compass (Luopan)"],
            "principle": "Taoist geometry describes flow, not structure. The Yin-Yang is not static — it is perpetually transforming. The I Ching's 64 hexagrams map every possible state of change in the universe.",
        },
        "healing": {
            "modalities": ["Acupuncture (meridian system — 365 points)", "Herbal medicine (Materia Medica — 10,000+ substances)", "Qi Gong (energy cultivation)", "Tai Chi (moving meditation)", "Tui Na (therapeutic massage)", "Five Element diet therapy"],
            "plants": ["Ginseng (Ren Shen — human root, king of herbs)", "Reishi mushroom (Ling Zhi — spirit plant)", "Astragalus (Huang Qi — immune builder)", "Goji berry (Gou Qi Zi — longevity)", "Chrysanthemum (Ju Hua — liver/eyes)"],
            "principle": "Qi flows through 12 primary meridians. Illness = Qi blockage or imbalance. Treatment restores flow through needles, herbs, movement, and meditation. Prevention > cure.",
        },
        "stars": {
            "tradition_name": "Chinese Astronomy (4,000+ years of continuous records)",
            "key_stars": ["Polaris (Tian Huang Da Di — Celestial Emperor)", "Big Dipper (Bei Dou — Northern Bushel, central to Taoist cosmology)", "28 Lunar Mansions (Xiu — equivalent to Indian Nakshatras)", "Five Planets = Five Elements (Jupiter=Wood, Mars=Fire, Saturn=Earth, Venus=Metal, Mercury=Water)"],
            "principle": "The Emperor sat on the North Star throne (Polaris). The Big Dipper's handle sweeps like a clock, pointing to the season. The Chinese kept the longest continuous astronomical records on Earth.",
        },
        "practices": ["Tai Chi", "Qi Gong", "I Ching divination", "Tea ceremony (Cha Dao)", "Feng Shui space arrangement", "Taoist meditation (Zuowang — sitting in forgetting)"],
    },

    "sufi": {
        "id": "sufi",
        "name": "Sufi / Islamic Mysticism",
        "region": "Middle East / Central Asia / Global",
        "core_teaching": "La ilaha illallah — There is no reality but The Reality. The heart is the mirror that reflects the Divine.",
        "source": "Quran (mystical interpretation), Rumi's Masnavi, Ibn Arabi's Fusus al-Hikam, Al-Ghazali, Hafiz",
        "wisdom": {
            "philosophy": "Sufism is the inner dimension of Islam — the science of the heart. The ego (nafs) veils the Divine. Through love, remembrance (dhikr), and surrender, the seeker (murid) polishes the heart-mirror until only God's reflection remains.",
            "key_concepts": ["Dhikr (remembrance of God)", "Fana (annihilation of ego)", "Baqa (subsistence in God)", "Qalb (heart — seat of spiritual perception)", "Tariqa (the path)", "Murshid (guide/teacher)", "Maqam (spiritual stations)"],
            "virtues": ["Tawakkul (trust in God)", "Sabr (patience)", "Shukr (gratitude)", "Ihsan (excellence — worship as if you see God)"],
        },
        "rhythm": {
            "instruments": ["Ney (reed flute — Rumi's symbol of the soul's longing)", "Frame drum (daf/bendir)", "Rebab (bowed string)", "Voice (qawwali singing — Nusrat Fateh Ali Khan tradition)"],
            "tempo_bpm": "60-200 (starts slow, builds to ecstasy in Sema/whirling)",
            "signature_sound": "Ney flute — the hollow reed that cries because it was cut from the reed-bed. Rumi: 'Listen to the reed, how it tells a tale, complaining of separations.'",
            "mixer_tags": ["ney_flute", "sufi_daf", "qawwali_vocal", "dhikr_chant", "whirling_rhythm"],
            "ceremony_music": "Sama (spiritual listening) — music as vehicle for ecstatic union with the Divine. Qawwali builds from quiet remembrance to ecstatic frenzy.",
        },
        "geometry": {
            "primary_form": "Islamic geometric patterns (infinite tessellation — reflecting God's infinity)",
            "forms": ["Arabesque (infinite vegetal patterns)", "Girih tiles (5 shapes creating infinite non-repeating patterns — quasi-crystalline, discovered 500 years before Penrose)", "Muqarnas (honeycomb vaulting — 3D sacred geometry)", "8-pointed star (Rub el Hizb)", "Calligraphy as geometry (Bismillah forms)"],
            "principle": "Islamic geometry avoids representation — it points to the Infinite through pattern. A single tile rule generates endless complexity, just as the One (Al-Ahad) manifests as the Many. Girih tiles are mathematically identical to Penrose tiling.",
        },
        "healing": {
            "modalities": ["Dhikr (rhythmic chanting — vagus nerve activation)", "Sema/whirling (vestibular recalibration + trance)", "Prophetic medicine (Tibb an-Nabawi)", "Ruqyah (Quranic recitation for healing)", "Color therapy (inspired by Avicenna)"],
            "plants": ["Black seed (Nigella sativa — 'cure for everything except death')", "Honey (Quranic prescription)", "Dates (Ajwa — prophetic food)", "Olive oil (blessed in Quran)", "Senna (digestive — prophetic medicine)"],
            "principle": "The heart is the organ of spiritual perception. When the heart is polished (through dhikr), the body follows. Sufi healing integrates breath, sound, movement (whirling), and surrender.",
        },
        "stars": {
            "tradition_name": "Islamic Golden Age Astronomy",
            "key_stars": ["Most star names in Western use are Arabic (Aldebaran, Betelgeuse, Rigel, Altair, Vega, Deneb, Fomalhaut)", "Qibla (prayer direction — astronomical calculation)", "Crescent Moon (Islamic calendar marker)", "Al-Sufi's Book of Fixed Stars (964 CE — first systematic star catalog with illustrations)"],
            "principle": "Islamic civilization preserved and advanced Greek astronomy, naming most of the stars we use today. Every mosque faces Mecca — a global geometry problem solved through astronomy.",
        },
        "practices": ["Dhikr (remembrance chanting)", "Sema (whirling meditation)", "Muraqaba (Sufi meditation)", "Qawwali listening", "Calligraphy as meditation", "Fasting (Ramadan)"],
    },
}


def get_tradition(tradition_id):
    """Get a single tradition by ID."""
    return SOVEREIGN_LIBRARY.get(tradition_id)


def get_all_traditions():
    """Get all traditions."""
    return SOVEREIGN_LIBRARY


def get_mixer_tags():
    """Get all mixer-compatible audio tags across all traditions."""
    tags = {}
    for tid, tradition in SOVEREIGN_LIBRARY.items():
        rhythm = tradition.get("rhythm", {})
        tags[tid] = {
            "name": tradition["name"],
            "tags": rhythm.get("mixer_tags", []),
            "tempo_bpm": rhythm.get("tempo_bpm", ""),
            "signature": rhythm.get("signature_sound", ""),
        }
    return tags


def get_geometry_forms():
    """Get all sacred geometry forms across all traditions."""
    forms = {}
    for tid, tradition in SOVEREIGN_LIBRARY.items():
        geo = tradition.get("geometry", {})
        forms[tid] = {
            "name": tradition["name"],
            "primary": geo.get("primary_form", ""),
            "forms": geo.get("forms", []),
            "principle": geo.get("principle", ""),
        }
    return forms
