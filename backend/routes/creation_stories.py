from fastapi import APIRouter, Depends
from deps import db, get_current_user, EMERGENT_LLM_KEY, logger
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai import OpenAITextToSpeech
from engines.crystal_seal import secure_hash_short
from datetime import datetime, timezone
import uuid
import asyncio

router = APIRouter()

tts_cache = {}

CREATION_STORIES = [
    {
        "id": "mayan",
        "culture": "Mayan",
        "region": "Central America",
        "color": "#22C55E",
        "title": "The Popol Vuh — Creation by Word and Thought",
        "deity": "Tepeu & Gucumatz (Heart of Sky)",
        "era": "~1500 BCE",
        "story": "Before there was Earth, there was only the calm sea and the great sky. The creators — Tepeu, the Maker, and Gucumatz, the Feathered Serpent — rested in the primordial waters, cloaked in green and blue feathers, luminous with wisdom. They spoke, and by their Word alone, the Earth arose from the sea: mountains erupted, rivers carved valleys, and forests blanketed the land.\n\nBut the gods desired beings who could speak, think, and honor them. First they shaped creatures from mud — but the mud dissolved in rain. Then they carved humans from wood — but wooden people had no souls, no memory of their makers. The gods sent a great flood to wash them away.\n\nFinally, the divine grandmother Xmucane ground white and yellow corn, mixed it with water, and from this sacred maize the gods shaped the first true humans — the four Balam. These corn-people could see to the edges of the universe and understand all things. The gods, fearing they had made beings too powerful, breathed mist upon their eyes, limiting their vision to what was near. And so humanity was born: brilliant enough to create, humble enough to seek.",
        "lesson": "Creation requires patience and willingness to begin again. Perfection comes not from the first attempt but from the courage to reshape what doesn't work.",
        "symbols": ["Maize/Corn", "Feathered Serpent", "Primordial Water", "The Word"],
    },
    {
        "id": "egyptian",
        "culture": "Egyptian",
        "region": "North Africa",
        "color": "#EAB308",
        "title": "The Atum and the Benben — Order from the Primordial Mound",
        "deity": "Atum (Ra-Atum)",
        "era": "~3000 BCE",
        "story": "In the beginning, there was only Nun — an infinite, dark ocean of chaos without surface or floor. From these waters, through sheer will, arose Atum, the complete one, standing upon the first mound of earth called the Benben — the sacred pyramidal stone.\n\nAtum was utterly alone. From his own essence — through a divine sneeze or utterance — he brought forth Shu, the god of air, and Tefnut, the goddess of moisture. These twins separated to explore the darkness, and Atum wept with joy when they returned, and from his tears sprang the first humans.\n\nShu and Tefnut gave birth to Geb, the earth, and Nut, the sky. Geb lay flat as the ground, and Nut arched her star-spangled body above him, held aloft by their father Shu. Each night, Nut swallowed the sun and gave birth to it again at dawn.\n\nFrom Geb and Nut came Osiris, Isis, Set, and Nephthys — and from their loves and conflicts, the entire drama of Egyptian civilization unfolded. The Benben stone, where it all began, became the model for every pyramid: humanity's attempt to touch the point where creation first broke through chaos.",
        "lesson": "Order (Ma'at) must be continuously maintained against chaos (Isfet). Creation is not a single event but an ongoing responsibility shared by gods and mortals alike.",
        "symbols": ["Benben Stone/Pyramid", "Primordial Waters (Nun)", "The Sun", "Tears"],
    },
    {
        "id": "aboriginal",
        "culture": "Aboriginal Australian",
        "region": "Australia",
        "color": "#F97316",
        "title": "The Dreamtime — When Ancestors Sang the World Alive",
        "deity": "The Ancestor Spirits",
        "era": "65,000+ years old (oldest continuous tradition)",
        "story": "In the Dreamtime — the Tjukurpa — the world existed as a flat, featureless plain of endless potential, sleeping beneath an eternal darkness. Beneath the surface rested the Ancestor Spirits in the forms of giant serpents, emus, kangaroos, and humans of immense power.\n\nOne by one, the Ancestors awoke and broke through the Earth's crust. As they traveled across the formless land, their every action shaped the world: where the Rainbow Serpent slithered, rivers formed; where the giant emu stamped, lakes pooled; where Ancestors sang, mountains rose and valleys sank. Every rock, waterhole, hill, and star was sung into existence along paths called Songlines — invisible routes crisscrossing the entire continent.\n\nThe Ancestors taught the people sacred Law: how to hunt, which plants to eat, when to perform ceremony, and how to care for Country. When their great journey was complete, the Ancestors returned to the earth — becoming the rocks, trees, and waterholes themselves. They did not die; they became the land.\n\nThe Dreamtime is not the past. It is the eternal present — always happening, always shaping. Every ceremony re-enacts the Ancestors' journeys, every song re-sings the world into being. To walk a Songline is to walk with the creators, keeping creation alive with each footstep.",
        "lesson": "The land is not a possession — it is a living relative. Creation is not finished; we participate in it through ceremony, song, and care for the earth.",
        "symbols": ["Rainbow Serpent", "Songlines", "The Dreaming", "Country/Land"],
    },
    {
        "id": "lakota",
        "culture": "Lakota Sioux",
        "region": "North America (Great Plains)",
        "color": "#DC2626",
        "title": "Inyan and the Blood of Creation",
        "deity": "Inyan (Stone), Skan (Sky), Wi (Sun)",
        "era": "Ancient oral tradition",
        "story": "Before anything existed, there was only Inyan — the primordial Rock, immensely powerful, infinitely alone. Inyan longed so deeply for companionship that he opened his own veins, and his blue blood flowed outward in all directions, creating Maka, the Earth, from his own substance.\n\nAs Inyan's blood spread, it became the great waters. But the effort drained him: the mighty Rock shrank and hardened, his power flowing into his creation. From the mingling of Inyan's spirit with the new world arose Skan, the Sky — the great judge and source of all spiritual energy.\n\nSkan created Wi, the Sun, to bring light and warmth. Skan breathed the four winds into existence: the North Wind of wisdom, the East Wind of new beginnings, the South Wind of growth, and the West Wind of endings and thunder. From these cardinal forces, all weather, seasons, and life emerged.\n\nThe White Buffalo Calf Woman later descended to the Lakota people, bringing the Sacred Pipe and the seven sacred ceremonies. She taught that all beings — two-legged, four-legged, winged, and rooted — are relatives in the great hoop of life. 'Mitakuye Oyasin,' she said: We are all related.\n\nCreation, in Lakota understanding, was an act of sacrifice — Inyan giving of himself so that others might exist. Every act of generosity echoes this original gift.",
        "lesson": "Creation requires sacrifice. The creator gave of himself so that others might live. Mitakuye Oyasin — we are all related, and everything is connected in the sacred hoop.",
        "symbols": ["Sacred Rock (Inyan)", "Blue Blood/Water", "Sacred Pipe", "Four Winds"],
    },
    {
        "id": "hindu",
        "culture": "Hindu",
        "region": "South Asia",
        "color": "#F59E0B",
        "title": "The Cosmic Egg and the Dance of Brahma",
        "deity": "Brahma, Vishnu, Shiva (Trimurti)",
        "era": "~1500 BCE (Rigveda)",
        "story": "Before creation, there was neither existence nor non-existence — only a vast, dark, breathing ocean of potential called the Hiranyagarbha, the Golden Womb. Within this cosmic egg floated Vishnu, the Preserver, resting on the coils of the infinite serpent Ananta-Shesha upon the waters of eternity.\n\nFrom Vishnu's navel grew a lotus, and upon that lotus sat Brahma, the Creator, with four faces looking in every direction. Brahma opened his eyes and spoke the sacred syllable 'Om' — the sound that is the vibration of all reality. From this sound, the Vedas emerged: the complete blueprint of creation.\n\nBrahma then separated the cosmic egg into Heaven and Earth, and from his mind sprang the ten Prajapatis — the progenitors of all living beings. He created day and night, the seasons, and the cycle of birth, death, and rebirth (samsara).\n\nMeanwhile, Shiva — the Destroyer and Transformer — dances the Tandava at the end of each cosmic cycle, dissolving the universe back into formless potential so that Brahma may create anew. This cycle of creation, preservation, and destruction repeats eternally across trillions of years, each cycle called a Kalpa — one day in the life of Brahma.\n\nThe universe breathes: expanding in creation, contracting in dissolution, over and over, forever.",
        "lesson": "Creation, preservation, and dissolution are one eternal rhythm. Nothing is truly destroyed — it transforms. The cosmos breathes, and we breathe with it.",
        "symbols": ["Om", "Lotus", "Cosmic Egg", "Serpent Shesha", "Tandava Dance"],
    },
    {
        "id": "norse",
        "culture": "Norse",
        "region": "Scandinavia",
        "color": "#6366F1",
        "title": "Ginnungagap — The Yawning Void Between Fire and Ice",
        "deity": "Odin, Vili, Ve (from the giant Ymir)",
        "era": "~800 CE (Prose Edda)",
        "story": "Before the worlds, there was Ginnungagap — the great yawning void, silent and infinite. To its north lay Niflheim, a realm of ice and freezing mist; to its south burned Muspelheim, a world of flame and volcanic fury.\n\nWhere the ice of Niflheim met the sparks of Muspelheim in the center of the void, the frost melted and formed drops that quickened into life: Ymir, the first frost giant, and Audhumla, the primordial cow whose milk nourished him. Audhumla licked the salty ice blocks for sustenance, and from the ice she uncovered Buri, the first of the gods.\n\nBuri's grandsons — Odin, Vili, and Ve — slew the giant Ymir and from his enormous body built the world. His flesh became the earth, his blood the seas, his bones the mountains, his skull the dome of the sky, held up by four dwarves at the cardinal points. His brains were scattered to become the clouds, and his eyebrows formed Midgard, the protected realm of humanity.\n\nOdin and his brothers found two tree trunks on a beach — an ash and an elm — and breathed life into them, creating Ask and Embla, the first man and woman. Odin gave them spirit, Vili gave them understanding and movement, and Ve gave them form, speech, sight, and hearing.\n\nBut the Norse knew: this creation is temporary. Ragnarok — the twilight of the gods — will come, and all will be destroyed, only to rise again, renewed, from the sea.",
        "lesson": "Creation emerges from the meeting of opposites — fire and ice, order and chaos. Even the gods know that all things end, and from every ending comes a new beginning.",
        "symbols": ["Yggdrasil (World Tree)", "Fire & Ice", "Ymir's Body", "The Void"],
    },
    {
        "id": "greek",
        "culture": "Greek",
        "region": "Mediterranean",
        "color": "#8B5CF6",
        "title": "Chaos and the Birth of the Titans",
        "deity": "Chaos, Gaia, Eros, Kronos, Zeus",
        "era": "~700 BCE (Hesiod's Theogony)",
        "story": "In the beginning was Chaos — not disorder, but a vast, formless gap of infinite potential. From Chaos spontaneously emerged Gaia (Earth), Tartarus (the Underworld), and Eros (Love) — the force that would drive all creation forward.\n\nGaia, without partner, brought forth Ouranos (Sky) to cover her and be her equal. Together, Gaia and Ouranos produced the twelve Titans, the three Cyclopes, and the three Hecatonchires (hundred-handed ones). But Ouranos, terrified of his monstrous children, imprisoned them within Gaia's body.\n\nIn agony, Gaia forged a great sickle and called upon her children for help. Only Kronos, the youngest Titan, had the courage to act. He castrated his father with the sickle, and from Ouranos' blood falling upon the earth, the Giants and the Furies were born. From the foam where his severed parts fell into the sea, Aphrodite arose.\n\nKronos ruled the Golden Age but, fearing his own children would overthrow him, swallowed each one at birth. His wife Rhea, in desperation, hid the youngest — Zeus — on the island of Crete. Zeus grew strong, freed his siblings, and led the Olympians to war against the Titans in the great Titanomachy. After ten years of cosmic battle, Zeus claimed the throne of heaven.\n\nPrometheus, a rebel Titan, shaped humanity from clay and stole fire from the gods to give to mortals — the spark of civilization, the light of consciousness.",
        "lesson": "Each generation must challenge the last to grow. Progress requires the courage to overthrow what no longer serves, and fire — knowledge — belongs to all beings.",
        "symbols": ["Chaos/Void", "Sickle", "Fire of Prometheus", "Mount Olympus"],
    },
    {
        "id": "japanese",
        "culture": "Japanese (Shinto)",
        "region": "East Asia",
        "color": "#EC4899",
        "title": "Izanagi and Izanami — The Jeweled Spear of Heaven",
        "deity": "Izanagi & Izanami",
        "era": "~712 CE (Kojiki)",
        "story": "When heaven and earth first separated from the primordial chaos, the heavenly deities commanded two divine siblings — Izanagi (He Who Invites) and Izanami (She Who Invites) — to solidify the drifting, jellyfish-like earth below.\n\nStanding on the Floating Bridge of Heaven, they thrust the Jeweled Spear of Heaven into the brine below and stirred. When they withdrew the spear, drops of salt water fell from its tip, congealing into Onogoro, the first island.\n\nThe divine pair descended to this island, built a pillar, and performed a marriage ceremony — walking around the pillar in opposite directions and greeting each other with words of love. From their union were born the eight great islands of Japan, followed by the deities of wind, mountains, rivers, trees, and seas.\n\nBut when Izanami gave birth to Kagutsuchi, the god of fire, she was fatally burned. Grief-stricken, Izanagi descended to Yomi, the land of the dead, to bring her back. But he saw her decaying form and fled in horror. Izanami, shamed, vowed to kill a thousand people each day in revenge. Izanagi vowed to give life to fifteen hundred.\n\nWhen Izanagi purified himself in a river after his escape, from his left eye was born Amaterasu, the Sun Goddess; from his right eye, Tsukuyomi, the Moon God; and from his nose, Susanoo, the Storm God. Thus from grief and purification came the three greatest forces of nature.",
        "lesson": "Life and death are inseparable partners in creation. From loss and purification come the greatest transformations. Even grief can birth the sun.",
        "symbols": ["Jeweled Spear", "The Pillar", "Purification/Misogi", "The Sun Goddess"],
    },
    {
        "id": "yoruba",
        "culture": "Yoruba",
        "region": "West Africa",
        "color": "#14B8A6",
        "title": "Olodumare and the Golden Chain from Heaven",
        "deity": "Olodumare, Obatala, Oduduwa",
        "era": "Ancient oral tradition (Nigeria/Benin)",
        "story": "In the beginning, there was only sky above and an endless expanse of water below. Olodumare, the Supreme Being, dwelled in the heavens with the Orishas — divine spirits of immense power.\n\nOlodumare summoned Obatala, the Spirit of Purity, and gave him a golden chain, a snail shell filled with sacred sand, a white hen, a black cat, and a palm nut. Obatala descended the golden chain from heaven toward the waters below.\n\nWhen the chain ended but water still stretched in every direction, Obatala poured the sacred sand onto the water's surface and released the white hen. The hen scratched and scattered the sand in all directions, and wherever the sand settled, dry land formed — hills, valleys, and plains emerging from the primal ocean. This first place was called Ile-Ife, the 'House of Expansion,' the sacred city where creation began.\n\nObatala planted the palm nut, and it grew immediately into a great tree, spreading seeds that became forests. He shaped human figures from clay, and Olodumare breathed the breath of life into them.\n\nBut Obatala grew thirsty and drank palm wine, and in his drunkenness, he shaped some figures imperfectly. When he sobered, he wept at what he had done and swore never to drink again, becoming the protector of all people with disabilities — those he had shaped with imperfect hands but perfect souls.\n\nOduduwa, another Orisha, completed the work of creation, establishing the sacred kingship of Ife, and from this one city, all Yoruba civilization spread across the world.",
        "lesson": "Even divine creators make mistakes. True nobility is not in perfection but in taking responsibility for your errors and protecting those affected by them.",
        "symbols": ["Golden Chain", "Sacred Sand", "White Hen", "Clay/Earth", "Ile-Ife"],
    },
    {
        "id": "maori",
        "culture": "Maori",
        "region": "New Zealand / Polynesia",
        "color": "#0EA5E9",
        "title": "Ranginui and Papatuanuku — Separating Sky Father and Earth Mother",
        "deity": "Tane Mahuta (God of Forests)",
        "era": "Ancient Polynesian oral tradition",
        "story": "In the beginning, there was Te Kore — the Void — and from the Void came Te Po — the Darkness — layer upon layer of ever-deepening night. From the deepest darkness, two beings emerged and found each other: Ranginui, the Sky Father, and Papatuanuku, the Earth Mother.\n\nThey embraced so tightly that their children — the gods of wind, sea, war, food, and forest — were trapped in perpetual darkness between their parents' bodies. The children debated what to do. Tu, the fierce god of war, wanted to kill their parents. But Tane Mahuta, the god of forests and birds, proposed a gentler solution: separate them.\n\nTane lay on his back and placed his feet against his father Ranginui and pushed with all his divine strength. Slowly, agonizingly, sky separated from earth. Light flooded in for the first time. Ranginui rose upward, weeping — his tears became the rain and the morning dew. Papatuanuku's sighs of longing became the mists that rise from the earth at dawn.\n\nTane then adorned his father with stars, the sun, and the moon to ease his loneliness. He clothed his mother in forests, ferns, and all growing things. Tawhirimatea, the wind god, alone refused to accept the separation and wages eternal war against his siblings — the storms that rage between sky and earth are his grief.\n\nRanginui and Papatuanuku still reach for each other. The horizon is where their love almost touches.",
        "lesson": "Growth requires separation from what is comfortable. Light enters only when we have the courage to push beyond the darkness we know. Love persists even across the greatest distances.",
        "symbols": ["Sky & Earth Embrace", "The Pushing Apart", "Rain as Tears", "Horizon"],
    },
    {
        "id": "chinese",
        "culture": "Chinese",
        "region": "East Asia",
        "color": "#F43F5E",
        "title": "Pangu and the Cosmic Egg",
        "deity": "Pangu, Nuwa",
        "era": "~200 CE (Three Five Historic Records)",
        "story": "Before heaven and earth existed, the universe was a formless chaos shaped like a great egg. Inside this cosmic egg, the opposing forces of Yin (dark, cold, passive) and Yang (light, hot, active) churned together for eighteen thousand years.\n\nWithin this egg, Pangu slowly grew, nourished by the swirling energies. When he finally awoke, he found himself trapped in suffocating darkness. Seizing a great axe, he swung it with all his might and cracked the egg open.\n\nThe light, clear Yang energies rose upward to become Heaven (Tian). The heavy, murky Yin energies sank downward to become Earth (Di). Pangu stood between them, pushing them apart, growing ten feet taller each day for eighteen thousand years until sky and earth were firmly fixed.\n\nExhausted, Pangu lay down and died — but his death became the world. His breath became wind and clouds, his voice became thunder. His left eye became the sun, his right eye the moon. His body became the mountains, his blood the rivers, his muscles the farmland. His hair became the stars, his skin the soil, his sweat the rain. The fleas on his body became humanity.\n\nLater, the goddess Nuwa, lonely in this new world, shaped figures from yellow clay along a riverbank. The first ones she crafted carefully became nobles; those she mass-produced by dipping a rope in mud and flicking it became common people. She repaired the broken sky with stones of five colors when the pillars of heaven cracked, saving creation from collapse.",
        "lesson": "The universe itself is a sacrifice — the creator gives everything to become the creation. Every mountain, river, and star was once part of something whole that chose to transform.",
        "symbols": ["Cosmic Egg", "Yin & Yang", "Axe", "Five-Colored Stones"],
    },
    {
        "id": "celtic",
        "culture": "Celtic",
        "region": "Western Europe",
        "color": "#10B981",
        "title": "The Well of Wisdom and the Sacred Grove",
        "deity": "Danu (Mother Goddess), Dagda, Brigid",
        "era": "~500 BCE (Irish oral tradition)",
        "story": "The Celts spoke of creation not as a single event but as an eternal process flowing from the Otherworld — a realm of spirit existing alongside and within our physical world, separated only by a thin veil.\n\nAt the center of all existence stood the great Well of Wisdom — Connla's Well — surrounded by nine sacred hazel trees. The hazelnuts that fell into the well contained all the knowledge of the universe. The Salmon of Wisdom swam in this well, eating the hazelnuts and carrying the knowledge of all things in its flesh.\n\nFrom this well flowed the five great rivers of sense and meaning, spreading wisdom throughout the world. The goddess Danu — the great mother — nourished the land through these waters, and her children, the Tuatha De Danann (People of the Goddess Danu), were the divine race who brought four sacred treasures to Ireland: the Stone of Destiny, the Spear of Lugh, the Sword of Nuada, and the Cauldron of the Dagda.\n\nThe Dagda, the Good God, played his great harp — Uaithne — and with it commanded the seasons: a chord for weeping brought autumn and winter, a chord for laughter brought spring, and a chord for dreaming brought summer's rest.\n\nCreation in the Celtic view was not made once but is continuously sustained by the interplay between this world and the Otherworld. Every sacred grove is a doorway; every well is a mirror of the cosmic source; every act of poetry or prophecy touches the original creative power.",
        "lesson": "Wisdom is the true source of creation. The world is sustained by knowledge, poetry, and the connection between the seen and unseen realms. Every grove is a temple; every well, a gateway.",
        "symbols": ["Sacred Well", "Hazel Tree", "Salmon of Wisdom", "The Harp"],
    },
    {
        "id": "inuit",
        "culture": "Inuit",
        "region": "Arctic (Alaska/Canada/Greenland)",
        "color": "#64748B",
        "title": "Sedna and the World Beneath the Ice",
        "deity": "Sedna (Sea Mother), Raven, Sila",
        "era": "Ancient Arctic oral tradition",
        "story": "In the time before time, when the world was still forming, there was darkness and ice. Raven, the trickster creator, flew through the black sky and found a great pea pod on the frozen ground. He cracked it open, and from inside emerged the first human — confused, shivering, but alive.\n\nRaven taught this first person how to survive: which animals to hunt, how to build shelters from snow and bone, how to respect the spirits of every creature taken for food. Raven then created the other animals — caribou from clay, fish from wood shavings, birds from leaves — and set them loose across the tundra and sea.\n\nBut the most powerful spirit of all was Sedna, the Sea Mother. Once a beautiful young woman, Sedna was betrayed by her father during a terrible storm at sea. As she clung to the edge of his kayak, he cut her fingers off one by one. Each severed finger became a sea creature: her thumb became a whale, her index finger a seal, her ring finger a walrus. Sedna sank to the bottom of the ocean, where she became the Mother of the Sea — controlling all marine life.\n\nWhen humans disrespect the animals or break taboos, Sedna's hair becomes tangled with the sins of the people, and she withholds the sea creatures in anger. Only the shaman — the angakkuq — can journey in trance to the ocean floor, comb Sedna's hair, and soothe her spirit, releasing the animals so the people may eat.\n\nAbove all is Sila — the breath, the weather, the universal consciousness that connects all living things under the vast Arctic sky.",
        "lesson": "Survival depends on reciprocity with nature. Every animal taken is a gift that must be honored. When we forget our connection to the living world, abundance withdraws.",
        "symbols": ["Raven", "Sea/Ice", "Sedna's Fingers", "The Shaman's Journey"],
    },
    {
        "id": "aztec",
        "culture": "Aztec",
        "region": "Central America",
        "color": "#B45309",
        "title": "The Five Suns — Creation Through Sacrifice",
        "deity": "Quetzalcoatl, Tezcatlipoca, Tonatiuh",
        "era": "~1300 CE",
        "story": "The Aztecs believed the universe had been created and destroyed four times before our current age. Each era was ruled by a different sun, and each ended in catastrophe.\n\nThe First Sun (Nahui Ocelotl) was the Sun of Earth, ruled by Tezcatlipoca. It ended when jaguars devoured humanity. The Second Sun (Nahui Ehecatl) was the Sun of Wind, ruled by Quetzalcoatl. It ended when hurricanes swept everything away and humans were transformed into monkeys. The Third Sun (Nahui Quiahuitl) was the Sun of Rain, ruled by Tlaloc. It ended when fire rained from the sky. The Fourth Sun (Nahui Atl) was the Sun of Water. It ended in a great flood that turned humans into fish.\n\nOur current age is the Fifth Sun (Nahui Ollin), the Sun of Movement. After the Fourth Sun's destruction, the gods gathered at Teotihuacan in total darkness. Someone had to sacrifice themselves to become the new sun. Nanahuatzin, a humble, pockmarked god, threw himself into a great bonfire and rose as the blazing sun. But he hung motionless in the sky.\n\n'I require blood,' the sun declared. 'I require sacrifice to move.' And so the gods sacrificed themselves, giving their divine blood to set the sun in motion across the sky. This established the cosmic covenant: the sun gives life through light and warmth; in return, life must be offered back.\n\nThe Fifth Sun, like all others, will eventually end — destroyed by earthquakes. The Aztecs lived with this knowledge: existence is temporary, sustained only by continuous offering and gratitude.",
        "lesson": "Nothing in the universe is free. The sun itself required sacrifice to shine. Every gift of life carries with it the responsibility to give back. Existence is earned, never guaranteed.",
        "symbols": ["Five Suns", "Sacred Fire", "Blood/Sacrifice", "Earthquakes"],
    },
    {
        "id": "sumerian",
        "culture": "Sumerian",
        "region": "Mesopotamia (Modern Iraq)",
        "color": "#A855F7",
        "title": "Nammu and the Tablets of Destiny",
        "deity": "Nammu, Enlil, Enki, Marduk",
        "era": "~2100 BCE (oldest written creation myth)",
        "story": "The Sumerians composed the oldest creation stories known to writing. In the beginning was Nammu — the primordial sea, the mother of all things, who existed before heaven and earth separated.\n\nFrom Nammu's waters emerged An (Heaven) and Ki (Earth), who were joined as one. Their son Enlil, the god of air, separated them — pushing heaven upward and claiming earth as his domain. Enlil's breath became the wind; his voice, the storm.\n\nEnki, the god of wisdom and freshwater, filled the rivers Tigris and Euphrates with sweet water and taught humanity the arts of civilization: writing, law, agriculture, mathematics, and astronomy. He established the me — the divine laws and powers that govern all aspects of civilization and nature.\n\nWhen the gods grew tired of laboring to dig irrigation canals and tend the earth, Enki and the mother goddess Ninhursag mixed clay with the blood of a slain god and shaped humans to do the work. They gave humans intelligence enough to serve but not enough to rival the gods.\n\nLater, in the Babylonian version, Marduk — champion of the younger gods — slew the chaos dragon Tiamat, splitting her body in two: one half became the sky, the other the earth. From Tiamat's eyes flowed the Tigris and Euphrates rivers. The Tablets of Destiny, which controlled the fate of all things, were placed upon Marduk's chest.\n\nThis is the oldest recorded creation story in human history — carved into clay tablets that have survived five thousand years.",
        "lesson": "Civilization is a divine gift that must be maintained through wisdom, law, and continuous effort. The power to create carries the responsibility to order and sustain.",
        "symbols": ["Clay Tablets", "Primordial Sea", "Rivers", "Tablets of Destiny"],
    },
]

REGION_MAP = {
    "Africa": ["egyptian", "yoruba"],
    "Americas": ["mayan", "lakota", "aztec"],
    "Asia": ["hindu", "japanese", "chinese"],
    "Europe": ["norse", "greek", "celtic"],
    "Oceania": ["aboriginal", "maori"],
    "Arctic & Middle East": ["inuit", "sumerian"],
}


@router.get("/creation-stories")
async def get_creation_stories():
    """Return all creation stories with metadata."""
    stories = []
    for s in CREATION_STORIES:
        stories.append({
            "id": s["id"],
            "culture": s["culture"],
            "region": s["region"],
            "color": s["color"],
            "title": s["title"],
            "deity": s["deity"],
            "era": s["era"],
            "symbols": s["symbols"],
            "lesson": s["lesson"],
            "story_preview": s["story"][:150] + "...",
        })
    return {"stories": stories, "regions": REGION_MAP, "total": len(stories)}


@router.get("/creation-stories/{story_id}")
async def get_creation_story(story_id: str):
    """Return full creation story."""
    for s in CREATION_STORIES:
        if s["id"] == story_id:
            return s
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Story not found")


@router.post("/creation-stories/{story_id}/narrate")
async def narrate_creation_story(story_id: str):
    """Generate TTS audio for a creation story."""
    story = None
    for s in CREATION_STORIES:
        if s["id"] == story_id:
            story = s
            break
    if not story:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Story not found")

    # Build narration text - intro + story + lesson
    narration = (
        f"The {story['culture']} Creation Story. {story['title']}. "
        f"{story['story'][:3500]} "
        f"The cosmic lesson: {story['lesson']}"
    )

    cache_key = secure_hash_short(f"creation-{story_id}", 32)
    if cache_key in tts_cache:
        return {"audio": tts_cache[cache_key], "story_id": story_id}

    try:
        tts = OpenAITextToSpeech(api_key=EMERGENT_LLM_KEY)
        audio_b64 = await tts.generate_speech_base64(
            text=narration[:4096],
            model="tts-1-hd",
            voice="onyx",
            speed=0.85,
            response_format="mp3",
        )
        tts_cache[cache_key] = audio_b64
        return {"audio": audio_b64, "story_id": story_id}
    except Exception as e:
        logger.error(f"Creation story TTS error: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="Failed to generate narration")



# ═══════════════════════════════════════════════
# MYTHS, LEGENDS & FOLKLORE — AI-Generated per civilization
# ═══════════════════════════════════════════════

CIVILIZATIONS = [
    {"id": "mayan", "name": "Mayan", "region": "Central America", "color": "#22C55E",
     "myths_seed": ["Popol Vuh Hero Twins", "Xibalba Underworld", "Kukulkan the Feathered Serpent", "The Maize God", "The Jaguar Sun God", "The 400 Boys and Zipacna"]},
    {"id": "egyptian", "name": "Egyptian", "region": "North Africa", "color": "#EAB308",
     "myths_seed": ["Osiris and Isis", "The Eye of Ra", "Anubis and the Weighing of the Heart", "The Contendings of Horus and Set", "Thoth and the Moon", "The Book of the Dead Journey"]},
    {"id": "aboriginal", "name": "Aboriginal Australian", "region": "Australia", "color": "#F97316",
     "myths_seed": ["The Rainbow Serpent", "Tiddalik the Frog", "The Seven Sisters Songline", "Baiame the Sky Father", "The Emu and the Jabiru", "How the Kangaroo Got Its Tail"]},
    {"id": "lakota", "name": "Lakota Sioux", "region": "North America", "color": "#DC2626",
     "myths_seed": ["White Buffalo Calf Woman", "Iktomi the Spider Trickster", "The Thunderbirds", "Fallen Star Boy", "The Legend of Devil's Tower", "Coyote Steals Fire"]},
    {"id": "hindu", "name": "Hindu", "region": "South Asia", "color": "#F59E0B",
     "myths_seed": ["The Churning of the Ocean of Milk", "Rama and Sita (Ramayana)", "Krishna and the Serpent Kaliya", "Ganesha and the Broken Tusk", "Durga Slays Mahishasura", "Savitri and Yama"]},
    {"id": "norse", "name": "Norse", "region": "Scandinavia", "color": "#6366F1",
     "myths_seed": ["Thor and the Midgard Serpent", "Loki and Baldur's Death", "Odin's Quest for Wisdom", "Ragnarok", "Freya and the Necklace Brisingamen", "The Mead of Poetry"]},
    {"id": "greek", "name": "Greek", "region": "Mediterranean", "color": "#8B5CF6",
     "myths_seed": ["Orpheus and Eurydice", "Perseus and Medusa", "The Odyssey of Odysseus", "Persephone and Hades", "Theseus and the Minotaur", "Icarus and Daedalus"]},
    {"id": "japanese", "name": "Japanese", "region": "East Asia", "color": "#EC4899",
     "myths_seed": ["Amaterasu and the Cave", "Susanoo and the Yamata no Orochi", "The Tale of the Bamboo Cutter", "Urashima Taro", "Momotaro the Peach Boy", "Tanabata Star Lovers"]},
    {"id": "yoruba", "name": "Yoruba", "region": "West Africa", "color": "#14B8A6",
     "myths_seed": ["Shango God of Thunder", "Oshun and the River", "Eshu at the Crossroads", "Ogun Lord of Iron", "Yemoja Mother of Waters", "The Tortoise and the Wisdom Gourd"]},
    {"id": "maori", "name": "Maori", "region": "Polynesia", "color": "#0EA5E9",
     "myths_seed": ["Maui Fishes Up the North Island", "Maui Captures the Sun", "Hinemoa and Tutanekai", "Paikea the Whale Rider", "Hatupatu and the Bird Woman", "The Taniwha Guardians"]},
    {"id": "chinese", "name": "Chinese", "region": "East Asia", "color": "#F43F5E",
     "myths_seed": ["Journey to the West (Monkey King)", "Chang'e and the Moon", "The Cowherd and the Weaver Girl", "Hou Yi Shoots the Suns", "The Dragon Kings", "Mulan the Warrior"]},
    {"id": "celtic", "name": "Celtic", "region": "Western Europe", "color": "#10B981",
     "myths_seed": ["Cu Chulainn the Hound of Ulster", "The Children of Lir", "Deirdre of the Sorrows", "Finn McCool and the Salmon", "The Morrigan War Goddess", "Oisin in Tir na nOg"]},
    {"id": "inuit", "name": "Inuit", "region": "Arctic", "color": "#64748B",
     "myths_seed": ["Sedna Goddess of the Sea", "Raven Steals the Sun", "The Qallupilluit Under the Ice", "Kiviuq the Eternal Wanderer", "The Northern Lights Spirits", "Nanuk the Bear Spirit"]},
    {"id": "aztec", "name": "Aztec", "region": "Central America", "color": "#B45309",
     "myths_seed": ["Quetzalcoatl's Journey to Mictlan", "The Legend of the Five Suns", "Huitzilopochtli and Coyolxauhqui", "Tlaloc's Paradise", "Xochiquetzal Goddess of Beauty", "The Founding of Tenochtitlan"]},
    {"id": "sumerian", "name": "Sumerian", "region": "Mesopotamia", "color": "#A855F7",
     "myths_seed": ["Inanna's Descent to the Underworld", "Gilgamesh and Enkidu", "The Flood of Utnapishtim", "Enki and the World Order", "Dumuzi and the Seasons", "The Huluppu Tree"]},
    {"id": "persian", "name": "Persian", "region": "Middle East", "color": "#D97706",
     "myths_seed": ["Rostam and Sohrab", "Zahhak the Dragon King", "Simorgh the Divine Bird", "Jamshid's Golden Age", "Kaveh the Blacksmith's Revolt", "Zal and Rudabeh"]},
    {"id": "african_bantu", "name": "Bantu", "region": "Central & Southern Africa", "color": "#059669",
     "myths_seed": ["Anansi the Spider", "Mwindo the Epic Hero", "The Hare and the Moon", "Nyame and the Sky Stories", "Kintu First Man of Buganda", "The Chameleon and Death"]},
    {"id": "polynesian", "name": "Polynesian", "region": "Pacific Islands", "color": "#0284C7",
     "myths_seed": ["Maui and the Fire Goddess", "Pele of the Volcano", "Ta'aroa the Creator", "The Voyage of Rata", "Hina and the Eel", "The Origin of Coconut"]},
    {"id": "native_american", "name": "Native American (Various)", "region": "North America", "color": "#B91C1C",
     "myths_seed": ["Coyote Creates the Stars", "Grandmother Spider Brings Light", "The Trail of Tears Sky", "Raven and the First People", "Kokopelli the Flute Player", "Blue Corn Maiden"]},
    {"id": "slavic", "name": "Slavic", "region": "Eastern Europe", "color": "#7C3AED",
     "myths_seed": ["Baba Yaga's Hut", "The Firebird", "Koschei the Deathless", "Morana Goddess of Winter", "Perun vs Veles", "Vasilisa the Beautiful"]},
]

CIV_MAP = {c["id"]: c for c in CIVILIZATIONS}


@router.get("/myths/civilizations")
async def get_civilizations():
    """Return all civilizations with their myth seed lists."""
    return {
        "civilizations": [{
            "id": c["id"], "name": c["name"], "region": c["region"],
            "color": c["color"], "myth_count": len(c["myths_seed"]),
            "myths_preview": c["myths_seed"],
        } for c in CIVILIZATIONS],
        "total": len(CIVILIZATIONS),
    }


@router.get("/myths/{civ_id}")
async def get_myths_for_civilization(civ_id: str):
    """Return all myths for a civilization (cached from DB + seed list)."""
    civ = CIV_MAP.get(civ_id)
    if not civ:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Civilization not found")

    # Fetch any previously generated myths from DB
    stored = await db.myths.find(
        {"civilization_id": civ_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)

    stored_titles = {m["seed_title"] for m in stored}

    # Build combined list: stored myths + ungenerated seeds
    myths = []
    for m in stored:
        myths.append({**m, "generated": True})

    for seed in civ["myths_seed"]:
        if seed not in stored_titles:
            myths.append({
                "id": None, "seed_title": seed, "title": seed,
                "civilization_id": civ_id, "culture": civ["name"],
                "generated": False,
            })

    return {
        "civilization": {
            "id": civ["id"], "name": civ["name"],
            "region": civ["region"], "color": civ["color"],
        },
        "myths": myths,
        "total": len(myths),
    }


@router.post("/myths/{civ_id}/generate")
async def generate_myth(civ_id: str, body: dict, user=Depends(get_current_user)):
    """Generate a full myth/legend using AI for a given civilization and seed title."""
    civ = CIV_MAP.get(civ_id)
    if not civ:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Civilization not found")

    seed_title = body.get("seed_title", "").strip()
    if not seed_title:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="seed_title required")

    # Check if already generated
    existing = await db.myths.find_one(
        {"civilization_id": civ_id, "seed_title": seed_title}, {"_id": 0}
    )
    if existing:
        return existing

    prompt = f"""You are a master storyteller and cultural historian. Tell the myth/legend of "{seed_title}" from the {civ['name']} tradition ({civ['region']}).

Write it as an immersive, richly detailed narrative — not an academic summary. Include:
1. **Title**: A evocative title for this myth
2. **Type**: One of: creation, hero_journey, love, trickster, underworld, divine_conflict, origin, prophecy, transformation
3. **Characters**: List the key figures with brief descriptions
4. **Story**: The full myth told in vivid narrative prose (800-1200 words). Use sensory detail, dialogue where appropriate, and emotional depth.
5. **Moral/Lesson**: The wisdom this myth teaches
6. **Symbols**: Key symbols and their meanings
7. **Connected myths**: Names of related myths from this or other traditions

Return as JSON with keys: title, type, characters (list of {{name, role}}), story, lesson, symbols (list), connected_myths (list)"""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"myth-gen-{civ_id}-{uuid.uuid4().hex[:8]}",
            system_message="You are a master storyteller and cultural historian. Return responses as valid JSON only.",
        )
        chat.with_model("gemini", "gemini-3-flash-preview")
        response = await chat.send_message(UserMessage(text=prompt))
        text = response.strip()

        # Parse JSON from response
        import json as _json
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        data = _json.loads(text)
        myth_id = str(uuid.uuid4())[:8]

        myth_doc = {
            "id": myth_id,
            "seed_title": seed_title,
            "civilization_id": civ_id,
            "culture": civ["name"],
            "region": civ["region"],
            "color": civ["color"],
            "title": data.get("title", seed_title),
            "type": data.get("type", "myth"),
            "characters": data.get("characters", []),
            "story": data.get("story", ""),
            "lesson": data.get("lesson", ""),
            "symbols": data.get("symbols", []),
            "connected_myths": data.get("connected_myths", []),
            "generated_by": user["id"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        await db.myths.insert_one({**myth_doc, "_id": myth_id})
        return myth_doc

    except Exception as e:
        logger.error(f"Myth generation error: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="Failed to generate myth")


@router.post("/myths/{myth_id}/narrate")
async def narrate_myth(myth_id: str):
    """Generate TTS audio for a generated myth."""
    myth = await db.myths.find_one({"id": myth_id}, {"_id": 0})
    if not myth:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Myth not found or not yet generated")

    narration = (
        f"{myth.get('title', 'A Myth')} — from the {myth.get('culture', '')} tradition. "
        f"{myth.get('story', '')[:3500]} "
        f"The wisdom of this tale: {myth.get('lesson', '')}"
    )

    cache_key = secure_hash_short(f"myth-{myth_id}", 32)
    if cache_key in tts_cache:
        return {"audio": tts_cache[cache_key], "myth_id": myth_id}

    try:
        tts = OpenAITextToSpeech(api_key=EMERGENT_LLM_KEY)
        audio_b64 = await tts.generate_speech_base64(
            text=narration[:4096],
            model="tts-1-hd",
            voice="fable",
            speed=0.85,
            response_format="mp3",
        )
        tts_cache[cache_key] = audio_b64
        return {"audio": audio_b64, "myth_id": myth_id}
    except Exception as e:
        logger.error(f"Myth TTS error: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="Failed to generate myth narration")


@router.get("/myths/search/{query}")
async def search_myths(query: str):
    """Search myths across all civilizations by keyword."""
    results = await db.myths.find(
        {"$or": [
            {"title": {"$regex": query, "$options": "i"}},
            {"seed_title": {"$regex": query, "$options": "i"}},
            {"story": {"$regex": query, "$options": "i"}},
            {"culture": {"$regex": query, "$options": "i"}},
        ]},
        {"_id": 0, "story": 0}
    ).to_list(50)

    # Also search seed titles from CIVILIZATIONS
    seed_results = []
    q = query.lower()
    for civ in CIVILIZATIONS:
        for seed in civ["myths_seed"]:
            if q in seed.lower() or q in civ["name"].lower():
                if not any(r["seed_title"] == seed and r["civilization_id"] == civ["id"] for r in results):
                    seed_results.append({
                        "seed_title": seed, "title": seed,
                        "civilization_id": civ["id"], "culture": civ["name"],
                        "region": civ["region"], "color": civ["color"],
                        "generated": False,
                    })

    return {"results": results + seed_results, "query": query}
