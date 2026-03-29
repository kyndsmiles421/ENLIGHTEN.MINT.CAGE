# Extended Star Cultures — 12 additional civilizations
# Each culture has 5 constellations with real star RA/Dec coordinates

EXTENDED_CULTURES = {
    "greek": {
        "name": "Greek Sky",
        "color": "#8B5CF6",
        "icon": "scroll",
        "description": "The ancient Greeks named 48 constellations still used today. Their sky was a canvas of divine drama — heroes, monsters, and lovers placed among the stars by the gods as eternal memorials to the greatest stories ever told.",
        "constellations": [
            {
                "id": "andromeda_chain", "name": "Andromeda (The Chained Princess)", "culture_name": "Greek",
                "ra": 1.0, "dec": 35.0,
                "stars": [
                    {"name": "Alpheratz", "ra": 0.14, "dec": 29.09, "mag": 2.06},
                    {"name": "Mirach", "ra": 1.16, "dec": 35.62, "mag": 2.05},
                    {"name": "Almach", "ra": 2.07, "dec": 42.33, "mag": 2.17},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Air",
                "mythology": {
                    "figure": "The Chained Princess",
                    "origin": "Greek",
                    "deity": "Perseus / Poseidon",
                    "story": "Princess Andromeda was chained to the sea cliffs by her parents to appease the sea monster Cetus, sent by Poseidon after her mother Cassiopeia boasted of surpassing the Nereids in beauty. Perseus, returning from slaying Medusa, saw the maiden and fell instantly in love. He dove from the sky on his winged sandals, brandished Medusa's severed head, and turned the monster to stone. Athena placed Andromeda in the stars, where she reaches out eternally toward her rescuer.",
                    "lesson": "No chain forged by the pride of others can hold you when courage answers love's call."
                },
                "paths": [
                    [[0,0],[0.5,0.3],[1.0,0.7]],
                    [[0.5,0.3],[0.5,0.6]],
                    [[0.5,0.3],[0.3,0.1]],
                ],
            },
            {
                "id": "lyra_orpheus", "name": "Lyra (Orpheus's Lyre)", "culture_name": "Greek",
                "ra": 18.6, "dec": 36.0,
                "stars": [
                    {"name": "Vega", "ra": 18.62, "dec": 38.78, "mag": 0.03},
                    {"name": "Sheliak", "ra": 18.83, "dec": 33.36, "mag": 3.45},
                    {"name": "Sulafat", "ra": 18.98, "dec": 32.69, "mag": 3.24},
                ],
                "lines": [[0,1],[0,2],[1,2]],
                "element": "Air",
                "mythology": {
                    "figure": "The Lyre of Orpheus",
                    "origin": "Greek",
                    "deity": "Apollo / Hermes",
                    "story": "When Orpheus lost his beloved Eurydice to the underworld, he played his lyre with such sorrow that stones wept and rivers paused to listen. He descended to Hades and charmed even Persephone. But turning back at the threshold, he lost Eurydice forever. After his death, Zeus placed his lyre in the heavens. Vega, its brightest star, is the fifth brightest in the entire sky — a beacon of music that transcends death.",
                    "lesson": "Art born from grief becomes immortal. The songs we sing in our darkest hours echo longest through eternity."
                },
                "paths": [
                    [[0,0.5],[-0.2,0],[0.2,0],[0,0.5]],
                    [[-0.2,0],[0,-0.3],[0.2,0]],
                ],
            },
            {
                "id": "centaurus_chiron", "name": "Centaurus (Chiron the Healer)", "culture_name": "Greek",
                "ra": 14.4, "dec": -60.0,
                "stars": [
                    {"name": "Alpha Centauri", "ra": 14.66, "dec": -60.84, "mag": -0.01},
                    {"name": "Hadar", "ra": 14.06, "dec": -60.37, "mag": 0.61},
                    {"name": "Menkent", "ra": 14.11, "dec": -36.37, "mag": 2.06},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Earth",
                "mythology": {
                    "figure": "Chiron the Wise Centaur",
                    "origin": "Greek",
                    "deity": "Kronos",
                    "story": "Unlike the wild centaurs, Chiron was wise, gentle, and learned in medicine, music, and prophecy. He tutored Achilles, Asclepius, and Heracles. When accidentally wounded by Heracles' poisoned arrow, Chiron — being immortal — could not die but suffered endlessly. He willingly gave up his immortality to free Prometheus, and Zeus honored his sacrifice by placing him among the stars. Alpha Centauri, the closest star system to our Sun, shines at his heart.",
                    "lesson": "The greatest teacher is one who sacrifices their own comfort to free others from their chains."
                },
                "paths": [
                    [[-0.3,0],[0,0],[0.3,0.2],[0.5,0.8]],
                    [[0,0],[0,-0.5],[-0.2,-0.8]],
                    [[0,0],[0.3,-0.3],[0.5,-0.6]],
                ],
            },
            {
                "id": "perseus_hero", "name": "Perseus (The Hero)", "culture_name": "Greek",
                "ra": 3.3, "dec": 45.0,
                "stars": [
                    {"name": "Mirfak", "ra": 3.41, "dec": 49.86, "mag": 1.79},
                    {"name": "Algol (Demon Star)", "ra": 3.14, "dec": 40.96, "mag": 2.12},
                    {"name": "Atik", "ra": 3.96, "dec": 40.01, "mag": 2.85},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Fire",
                "mythology": {
                    "figure": "Perseus the Gorgon-Slayer",
                    "origin": "Greek",
                    "deity": "Zeus / Athena",
                    "story": "Perseus holds Medusa's severed head in one hand and his curved sword in the other. Algol, the 'Demon Star,' marks Medusa's winking eye — it is a real eclipsing binary that dims every 2.87 days, as if the Gorgon still blinks. The ancients noticed this eerie pulsing and feared it. Armed with Athena's polished shield, Hermes' winged sandals, and Hades' helm of invisibility, Perseus slew the Gorgon by looking only at her reflection.",
                    "lesson": "Sometimes the only way to confront a monster is to see it reflected — understanding your enemy indirectly reveals what direct confrontation would destroy."
                },
                "paths": [
                    [[0,0.5],[0,0],[-0.3,-0.4]],
                    [[0,0],[0.4,-0.3]],
                    [[0,0.5],[0.3,0.7]],
                    [[0,0.5],[-0.3,0.7]],
                ],
            },
            {
                "id": "cygnus_zeus", "name": "Cygnus (The Swan of Zeus)", "culture_name": "Greek",
                "ra": 20.4, "dec": 40.0,
                "stars": [
                    {"name": "Deneb", "ra": 20.69, "dec": 45.28, "mag": 1.25},
                    {"name": "Sadr", "ra": 20.37, "dec": 40.26, "mag": 2.23},
                    {"name": "Albireo", "ra": 19.51, "dec": 27.96, "mag": 3.08},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Water",
                "mythology": {
                    "figure": "Zeus as the Swan",
                    "origin": "Greek",
                    "deity": "Zeus",
                    "story": "Zeus transformed himself into a magnificent swan to visit Leda, Queen of Sparta. From their union came Helen of Troy, whose beauty launched a thousand ships. The Northern Cross formed by Cygnus flies along the Milky Way — its wings spread wide, its neck outstretched toward the southern horizon. Deneb, at the tail, is one of the most luminous stars known, shining 200,000 times brighter than the Sun from 2,600 light-years away.",
                    "lesson": "Even the king of gods chose beauty and gentleness over thunder when love called. True power knows when to be soft."
                },
                "paths": [
                    [[0,0.8],[0,0],[0,-0.8]],
                    [[-0.6,0.2],[0,0],[0.6,0.2]],
                ],
            },
        ],
    },
    "japanese": {
        "name": "Japanese Sky",
        "color": "#EC4899",
        "icon": "moon",
        "description": "Japanese astronomy blends Shinto animism with imported Chinese star lore. The sky holds love stories, harvest festivals, and the dwelling places of kami — divine spirits inhabiting every natural phenomenon.",
        "constellations": [
            {
                "id": "tanabata", "name": "Tanabata (Star Lovers)", "culture_name": "Japanese",
                "ra": 19.2, "dec": 24.0,
                "stars": [
                    {"name": "Vega (Orihime)", "ra": 18.62, "dec": 38.78, "mag": 0.03},
                    {"name": "Altair (Hikoboshi)", "ra": 19.85, "dec": 8.87, "mag": 0.77},
                    {"name": "Deneb (Magpie Bridge)", "ra": 20.69, "dec": 45.28, "mag": 1.25},
                ],
                "lines": [[0,2],[2,1]],
                "element": "Water",
                "mythology": {
                    "figure": "The Star-Crossed Lovers",
                    "origin": "Japanese",
                    "deity": "Tentei (Sky Emperor)",
                    "story": "Orihime (Vega), the celestial weaver, and Hikoboshi (Altair), the cowherd, fell so deeply in love that they neglected their duties. The Sky Emperor separated them on opposite sides of the Amanogawa (Milky Way). Only on the 7th day of the 7th month, a flock of magpies forms a bridge across the starry river so they may embrace. If it rains that night, the magpies cannot fly, and the lovers must wait another year. Deneb marks the magpie bridge between them.",
                    "lesson": "True love endures separation. Even the Milky Way cannot keep apart what the heart has joined."
                },
                "paths": [
                    [[-0.5,0.5],[0,0],[0.5,-0.5]],
                    [[0,0],[0.3,0.6]],
                ],
            },
            {
                "id": "subaru", "name": "Subaru (The Pleiades)", "culture_name": "Japanese",
                "ra": 3.79, "dec": 24.1,
                "stars": [
                    {"name": "Alcyone (Subaru)", "ra": 3.79, "dec": 24.11, "mag": 2.87},
                    {"name": "Electra", "ra": 3.75, "dec": 24.11, "mag": 3.70},
                    {"name": "Maia", "ra": 3.76, "dec": 24.37, "mag": 3.87},
                ],
                "lines": [[0,1],[0,2],[1,2]],
                "element": "Earth",
                "mythology": {
                    "figure": "The Gathered Stars",
                    "origin": "Japanese",
                    "deity": "Amaterasu",
                    "story": "Subaru means 'to gather together' or 'united.' In Japanese culture, the Pleiades represent unity and the harvest season. When Subaru appeared in the autumn sky, farmers knew it was time to begin the rice harvest. The cluster's tightness symbolized community bonds — six stars visible to the naked eye, huddled close like a family around a hearth. The car company Subaru takes its name and logo from this star cluster, honoring the merger of six companies into one.",
                    "lesson": "Strength comes from unity. Stars that gather together shine brighter than any solitary flame."
                },
                "paths": [
                    [[-0.1,0.1],[0,0],[0.1,0.1]],
                    [[0,0],[0,0.2]],
                ],
            },
            {
                "id": "hokkyokusei", "name": "Hokkyokusei (The North Star)", "culture_name": "Japanese",
                "ra": 2.5, "dec": 89.0,
                "stars": [
                    {"name": "Polaris (Hokkyokusei)", "ra": 2.53, "dec": 89.26, "mag": 1.98},
                    {"name": "Kochab", "ra": 14.85, "dec": 74.16, "mag": 2.08},
                    {"name": "Pherkad", "ra": 15.35, "dec": 71.83, "mag": 3.00},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Air",
                "mythology": {
                    "figure": "The Emperor's Star",
                    "origin": "Japanese / Shinto",
                    "deity": "Ame-no-Minakanushi (Central Kami)",
                    "story": "In Japanese cosmology, the North Star is the seat of Ame-no-Minakanushi, the first kami (divine being) to emerge at creation — the center around which all heaven revolves. Just as the Emperor was the immovable center of earthly Japan, the North Star is the immovable center of the celestial realm. Samurai navigators and Buddhist monks alike revered Hokkyokusei as the star of destiny and moral truth — the one light that never wanders.",
                    "lesson": "In a world of constant motion, find the one truth that does not move. Align yourself with that, and you will never be lost."
                },
                "paths": [
                    [[0,0],[0,-0.5]],
                    [[0,0],[0.3,0.2]],
                    [[0,0],[-0.3,0.2]],
                ],
            },
            {
                "id": "amaterasu_mirror", "name": "Kagami (Amaterasu's Mirror)", "culture_name": "Japanese",
                "ra": 15.58, "dec": 26.7,
                "stars": [
                    {"name": "Alphecca", "ra": 15.58, "dec": 26.71, "mag": 2.23},
                    {"name": "Nusakan", "ra": 15.46, "dec": 29.11, "mag": 3.68},
                    {"name": "T CrB", "ra": 15.99, "dec": 25.92, "mag": 3.8},
                ],
                "lines": [[0,1],[0,2],[1,2]],
                "element": "Fire",
                "mythology": {
                    "figure": "The Sacred Mirror of the Sun",
                    "origin": "Japanese / Shinto",
                    "deity": "Amaterasu (Sun Goddess)",
                    "story": "When Amaterasu, the Sun Goddess, retreated into a cave after her brother Susanoo's rampage, the world plunged into darkness. The kami hung the sacred mirror Yata no Kagami at the cave entrance. Curious, Amaterasu peeked out and saw her own brilliant reflection — stunned by her own radiance, she was drawn out, and light returned to the world. The Corona Borealis star-crown is her mirror in the sky — a ring of light reminding us that our own brilliance is sometimes hidden from ourselves.",
                    "lesson": "You carry light within you that you cannot see. Sometimes you need a mirror — a friend, a moment of stillness — to remember how brightly you shine."
                },
                "paths": [
                    [[-0.3,0],[0,0.3],[0.3,0],[0,-0.3],[-0.3,0]],
                ],
            },
            {
                "id": "orochi", "name": "Yamata no Orochi (Eight-Headed Serpent)", "culture_name": "Japanese",
                "ra": 9.5, "dec": -8.0,
                "stars": [
                    {"name": "Alphard (Heart of the Serpent)", "ra": 9.46, "dec": -8.66, "mag": 1.98},
                    {"name": "Gamma Hydrae", "ra": 13.32, "dec": -23.17, "mag": 3.0},
                    {"name": "Zeta Hydrae", "ra": 8.92, "dec": 5.95, "mag": 3.11},
                ],
                "lines": [[2,0],[0,1]],
                "element": "Water",
                "mythology": {
                    "figure": "The Eight-Headed Dragon",
                    "origin": "Japanese / Shinto",
                    "deity": "Susanoo (Storm God)",
                    "story": "The serpent Hydra represents Yamata no Orochi — the monstrous eight-headed, eight-tailed dragon that terrorized the province of Izumo. Each year it devoured a maiden. Susanoo, the storm god exiled from heaven, discovered an elderly couple weeping over their last daughter Kushinadahime. He set out eight vats of sake, and when the serpent drank from all eight heads and fell into a stupor, Susanoo cut it to pieces. From one tail he drew the legendary sword Kusanagi no Tsurugi.",
                    "lesson": "The mightiest foe often defeats itself. Wisdom and patience overcome what brute force cannot."
                },
                "paths": [
                    [[-0.8,0.3],[-0.4,0],[0,0],[0.4,-0.2],[0.8,-0.3],[1.2,-0.6]],
                    [[0,0],[0.1,0.3]],
                    [[-0.4,0],[-0.5,0.3]],
                ],
            },
        ],
    },
    "yoruba": {
        "name": "Yoruba Sky",
        "color": "#14B8A6",
        "icon": "star",
        "description": "The Yoruba people of West Africa saw the sky as the domain of Olodumare and the Orishas. Stars marked the pathways of divine messengers, and celestial events guided planting, rituals, and the interpretation of destiny through Ifa divination.",
        "constellations": [
            {
                "id": "shango_bolt", "name": "Edun Ara (Shango's Thunderstone)", "culture_name": "Yoruba",
                "ra": 6.75, "dec": -16.7,
                "stars": [
                    {"name": "Sirius (Shango's Eye)", "ra": 6.75, "dec": -16.72, "mag": -1.46},
                    {"name": "Mirzam", "ra": 6.38, "dec": -17.96, "mag": 1.98},
                    {"name": "Wezen", "ra": 7.14, "dec": -26.39, "mag": 1.84},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Fire",
                "mythology": {
                    "figure": "The Thunderstone of Shango",
                    "origin": "Yoruba",
                    "deity": "Shango (God of Thunder)",
                    "story": "Sirius, the brightest star, was Shango's thunderstone cast from heaven — blazing white-blue like lightning frozen in the sky. Shango, the fourth Alafin of Oyo, became the Orisha of thunder, fire, and justice after ascending to the heavens. When Sirius appeared with the rains, Yoruba farmers knew Shango was speaking — commanding the storms that would water the earth. His double-headed axe, the oshe, cleaves falsehood from truth just as lightning splits the sky.",
                    "lesson": "Justice arrives like lightning — brilliant, undeniable, and impossible to outrun."
                },
                "paths": [
                    [[0,0.3],[0,0],[-0.3,-0.2]],
                    [[0,0],[0.3,-0.4]],
                    [[0,0.3],[-0.2,0.5]],
                    [[0,0.3],[0.2,0.5]],
                ],
            },
            {
                "id": "oshun_river", "name": "Odo Oshun (Oshun's River)", "culture_name": "Yoruba",
                "ra": 3.5, "dec": -30.0,
                "stars": [
                    {"name": "Achernar", "ra": 1.63, "dec": -57.24, "mag": 0.46},
                    {"name": "Acamar", "ra": 2.97, "dec": -40.30, "mag": 2.88},
                    {"name": "Zaurak", "ra": 3.97, "dec": -13.51, "mag": 2.95},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Water",
                "mythology": {
                    "figure": "The Celestial River",
                    "origin": "Yoruba",
                    "deity": "Oshun (Goddess of Rivers and Love)",
                    "story": "The river constellation Eridanus was seen as the celestial Osun River, the sacred domain of Oshun. She is the Orisha of sweetwater, fertility, beauty, and diplomacy. When the other Orishas failed to create humanity because they excluded the only woman among them, nothing worked until they honored Oshun. She dipped her honey-gold reflection into the river of stars and life flowed. The winding stars trace her path from heaven to earth.",
                    "lesson": "No creation is complete without the feminine principle. The river of life flows only when all voices are honored."
                },
                "paths": [
                    [[0.5,0.8],[0.3,0.5],[0,0.2],[-0.2,0],[-0.3,-0.3],[-0.1,-0.6],[0.2,-0.8]],
                ],
            },
            {
                "id": "ogun_forge", "name": "Irin Ogun (Ogun's Iron)", "culture_name": "Yoruba",
                "ra": 5.28, "dec": 46.0,
                "stars": [
                    {"name": "Capella (Ogun's Fire)", "ra": 5.28, "dec": 46.0, "mag": 0.08},
                    {"name": "Menkalinan", "ra": 5.99, "dec": 44.95, "mag": 1.90},
                    {"name": "Mahasim", "ra": 5.99, "dec": 37.21, "mag": 2.62},
                ],
                "lines": [[0,1],[1,2],[0,2]],
                "element": "Fire",
                "mythology": {
                    "figure": "The Forge of Ogun",
                    "origin": "Yoruba",
                    "deity": "Ogun (God of Iron and War)",
                    "story": "Capella burned with the golden-white heat of Ogun's forge. Ogun is the Orisha of iron, technology, and the warrior path. He cleared the primordial forest with his machete so the other Orishas could descend to earth. Every blacksmith, surgeon, and driver prays to Ogun. The triangular constellation represents his anvil — where raw ore becomes tools, weapons become plowshares, and chaos becomes civilization. His sacred number is seven, and his day is Tuesday.",
                    "lesson": "The one who clears the path for others is the true hero. Civilization is built not with words but with iron determination."
                },
                "paths": [
                    [[-0.3,0.3],[0.3,0.3],[0,-0.3],[-0.3,0.3]],
                ],
            },
            {
                "id": "eshu_crossroad", "name": "Orita Eshu (Eshu's Crossroads)", "culture_name": "Yoruba",
                "ra": 12.5, "dec": -60.0,
                "stars": [
                    {"name": "Acrux", "ra": 12.44, "dec": -63.1, "mag": 0.76},
                    {"name": "Mimosa", "ra": 12.79, "dec": -59.69, "mag": 1.25},
                    {"name": "Gacrux", "ra": 12.52, "dec": -57.11, "mag": 1.63},
                ],
                "lines": [[0,2],[1,2]],
                "element": "Air",
                "mythology": {
                    "figure": "The Divine Crossroads",
                    "origin": "Yoruba",
                    "deity": "Eshu-Elegba (Messenger/Trickster)",
                    "story": "The Southern Cross was Eshu's crossroads in the sky — the junction where fate diverges. Eshu-Elegba stands at every crossroads between the human world and the divine, carrying messages between mortals and Olodumare. He is not evil but the keeper of ashe (spiritual power). No Ifa divination begins without first honoring Eshu, for he opens and closes the doors of destiny. The cross formation represents the four cardinal directions of choice.",
                    "lesson": "Every crossroads is sacred. The choices you make at intersections define your destiny. Always honor the messenger before asking for the message."
                },
                "paths": [
                    [[0,0.5],[0,-0.5]],
                    [[-0.4,0],[0.4,0]],
                ],
            },
            {
                "id": "yemoja_waters", "name": "Omi Yemoja (Yemoja's Waters)", "culture_name": "Yoruba",
                "ra": 22.1, "dec": -8.0,
                "stars": [
                    {"name": "Sadalsuud", "ra": 21.53, "dec": -5.57, "mag": 2.91},
                    {"name": "Sadalmelik", "ra": 22.10, "dec": -0.32, "mag": 2.96},
                    {"name": "Skat", "ra": 22.88, "dec": -15.82, "mag": 3.27},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Water",
                "mythology": {
                    "figure": "The Mother of Waters",
                    "origin": "Yoruba",
                    "deity": "Yemoja (Mother of All Orishas)",
                    "story": "The Aquarius water-bearer region represented Yemoja — the great mother whose waters broke to birth the rivers, the ocean, and fourteen of the major Orishas. Yemoja's domain is the ocean and motherhood. Her waters nurture all life. In the diaspora, she became Yemanja in Brazil, where millions offer flowers to the sea on New Year's Eve. The stars pour her celestial waters across the Milky Way.",
                    "lesson": "The mother's love is the ocean — vast, deep, and the source from which all rivers of life flow."
                },
                "paths": [
                    [[0.3,0.3],[0,0],[-0.3,-0.3],[-0.5,-0.6]],
                    [[0,0],[0.2,-0.3]],
                ],
            },
        ],
    },
    "celtic": {
        "name": "Celtic Sky",
        "color": "#10B981",
        "icon": "star",
        "description": "The Celtic peoples tracked stars through sacred groves and stone circles. Their astronomy was intertwined with Druidic wisdom — the sky was a mirror of the Otherworld, and each bright star a doorway between realms.",
        "constellations": [
            {
                "id": "arth_fawr", "name": "Arth Fawr (The Great Bear / Arthur)", "culture_name": "Celtic",
                "ra": 12.0, "dec": 56.0,
                "stars": [
                    {"name": "Dubhe", "ra": 11.06, "dec": 61.75, "mag": 1.79},
                    {"name": "Merak", "ra": 11.02, "dec": 56.38, "mag": 2.37},
                    {"name": "Alioth", "ra": 12.9, "dec": 55.96, "mag": 1.77},
                    {"name": "Alkaid", "ra": 13.79, "dec": 49.31, "mag": 1.86},
                ],
                "lines": [[0,1],[1,2],[2,3]],
                "element": "Earth",
                "mythology": {
                    "figure": "King Arthur's Chariot",
                    "origin": "Celtic (Welsh)",
                    "deity": "Arthur / Arianrhod",
                    "story": "The Welsh called the Great Bear 'Arth Fawr' — the Great Bear from which King Arthur may take his name (Arth = bear). The seven stars were also seen as Arthur's Chariot (Plough) circling the celestial pole, ever guarding the gateway to the Otherworld. Arianrhod, the silver-wheeled star goddess, ruled from her castle Caer Sidi at the celestial pole. The circumpolar stars — those that never set below the horizon — were souls in her keeping.",
                    "lesson": "The guardian never rests. Like the stars that circle the pole without setting, true duty is eternal vigilance."
                },
                "paths": [
                    [[-0.5,0.3],[-0.5,-0.1],[0.2,-0.1],[0.8,-0.4]],
                    [[-0.5,-0.1],[-0.3,-0.4],[0.2,-0.1]],
                ],
            },
            {
                "id": "brigid_crown", "name": "Coron Brigid (Brigid's Crown)", "culture_name": "Celtic",
                "ra": 15.6, "dec": 27.0,
                "stars": [
                    {"name": "Alphecca (Brigid's Jewel)", "ra": 15.58, "dec": 26.71, "mag": 2.23},
                    {"name": "Nusakan", "ra": 15.46, "dec": 29.11, "mag": 3.68},
                    {"name": "Theta CrB", "ra": 15.55, "dec": 31.36, "mag": 4.14},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Fire",
                "mythology": {
                    "figure": "The Crown of the Goddess",
                    "origin": "Celtic (Irish)",
                    "deity": "Brigid (Goddess of Healing, Poetry, and Smithcraft)",
                    "story": "Corona Borealis was the crown of Brigid — the triple goddess of healing, poetry, and the forge. At Imbolc (February 1st), when these stars rose in the pre-dawn sky, the Celts celebrated Brigid's return with fire festivals, marking winter's end. She tends the eternal flame at Kildare, and her crown in the sky reminds healers, poets, and smiths that their arts are sacred — each a form of transformation, turning raw material into beauty.",
                    "lesson": "Healing, poetry, and craft are all the same fire — the divine impulse to take what is broken and make it beautiful."
                },
                "paths": [
                    [[-0.3,-0.1],[-0.1,0.2],[0.1,0.3],[0.3,0.2],[0.3,-0.1],[0.1,-0.3],[-0.1,-0.3],[-0.3,-0.1]],
                ],
            },
            {
                "id": "bradan_feasa", "name": "Bradan Feasa (Salmon of Wisdom)", "culture_name": "Celtic",
                "ra": 1.0, "dec": 10.0,
                "stars": [
                    {"name": "Alrescha", "ra": 2.03, "dec": 2.76, "mag": 3.82},
                    {"name": "Eta Piscium", "ra": 1.52, "dec": 15.35, "mag": 3.62},
                    {"name": "Gamma Piscium", "ra": 23.29, "dec": 3.28, "mag": 3.70},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Water",
                "mythology": {
                    "figure": "The Salmon of Knowledge",
                    "origin": "Celtic (Irish)",
                    "deity": "Fionn mac Cumhaill",
                    "story": "In the sacred pool beneath nine hazel trees, the Salmon of Wisdom swam — having eaten the nuts that contained all knowledge. The druid Finnegas spent seven years fishing for it. When young Fionn mac Cumhaill accidentally tasted the salmon's oil while cooking it, all wisdom flooded into him. The Pisces fish constellation was this salmon, swimming through the cosmic well. Celtic wisdom held that knowledge is not earned by force but received in a moment of accidental grace.",
                    "lesson": "Wisdom comes not to the one who hunts it longest, but to the one who is open at the moment it arrives."
                },
                "paths": [
                    [[-0.3,0],[0,0],[0.3,-0.2]],
                    [[0,0],[0.1,0.3]],
                    [[0.3,-0.2],[0.5,-0.1]],
                ],
            },
            {
                "id": "lugh_spear", "name": "Sleá Lugh (Lugh's Spear)", "culture_name": "Celtic",
                "ra": 5.5, "dec": -1.0,
                "stars": [
                    {"name": "Alnitak", "ra": 5.68, "dec": -1.94, "mag": 1.77},
                    {"name": "Alnilam", "ra": 5.6, "dec": -1.2, "mag": 1.69},
                    {"name": "Mintaka", "ra": 5.53, "dec": -0.3, "mag": 2.23},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Fire",
                "mythology": {
                    "figure": "The Spear of Lugh the Long-Armed",
                    "origin": "Celtic (Irish)",
                    "deity": "Lugh (God of Light and Skill)",
                    "story": "Orion's Belt was Lugh's Spear — a weapon so fierce it had to be kept in a cauldron of poppy-water to prevent it from blazing into flame. Lugh Lamhfhada (Long Arm) was the master of every art and craft. At the festival of Lughnasadh (August 1st), when these stars dominated the pre-dawn sky, the Celts celebrated with games, harvest feasts, and contests of skill. His spear never missed its mark — like truth, once thrown, it cannot be turned aside.",
                    "lesson": "Master many arts, for the one who can only swing a sword is unarmed when the battle requires a song."
                },
                "paths": [
                    [[0,0.5],[0,0],[0,-0.5]],
                    [[-0.1,0],[0.1,0]],
                ],
            },
            {
                "id": "cernunnos", "name": "Cernunnos (The Horned God)", "culture_name": "Celtic",
                "ra": 4.6, "dec": 16.5,
                "stars": [
                    {"name": "Aldebaran (Eye of the Stag)", "ra": 4.60, "dec": 16.51, "mag": 0.85},
                    {"name": "Elnath", "ra": 5.44, "dec": 28.61, "mag": 1.65},
                    {"name": "Tianguan", "ra": 5.63, "dec": 21.14, "mag": 3.00},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Earth",
                "mythology": {
                    "figure": "The Horned God of the Wild",
                    "origin": "Celtic (Pan-Celtic)",
                    "deity": "Cernunnos",
                    "story": "Taurus was Cernunnos — the antlered god of the forest, lord of animals, and keeper of the gateway between life and death. Aldebaran, glowing deep red-orange, was his fiery eye watching from the dark forest of stars. Cernunnos sits cross-legged between the worlds, holding a torque in one hand and a serpent in the other, mediating between civilization and wildness. The Druids honored him at Samhain when the veil between worlds thins.",
                    "lesson": "The wild is not your enemy but your ancestor. Civilization forgets what the forest remembers."
                },
                "paths": [
                    [[0,0],[-0.2,0.3],[-0.4,0.6]],
                    [[0,0],[0.3,0.4],[0.5,0.7]],
                    [[0,0],[0,-0.4]],
                ],
            },
        ],
    },
    "inuit": {
        "name": "Inuit Sky",
        "color": "#64748B",
        "icon": "star",
        "description": "In the long Arctic winter, the sky was a clock, calendar, and story book. Inuit astronomers read the stars for hunting seasons, weather prediction, and navigation across featureless snowscapes where the horizon and sky merge into one.",
        "constellations": [
            {
                "id": "tukturjuit", "name": "Tukturjuit (The Caribou)", "culture_name": "Inuit",
                "ra": 12.0, "dec": 58.0,
                "stars": [
                    {"name": "Dubhe", "ra": 11.06, "dec": 61.75, "mag": 1.79},
                    {"name": "Merak", "ra": 11.02, "dec": 56.38, "mag": 2.37},
                    {"name": "Phecda", "ra": 11.9, "dec": 53.69, "mag": 2.44},
                    {"name": "Megrez", "ra": 12.26, "dec": 57.03, "mag": 3.31},
                ],
                "lines": [[0,1],[1,2],[2,3],[3,0]],
                "element": "Earth",
                "mythology": {
                    "figure": "The Great Caribou",
                    "origin": "Inuit (Central Arctic)",
                    "deity": "Sila (Spirit of Weather and Wisdom)",
                    "story": "The Big Dipper bowl stars formed Tukturjuit — the cosmic caribou that the hunter pursues eternally across the sky. The caribou was the most vital animal for Inuit survival, providing food, clothing, shelter, and tools. When Tukturjuit circled low near the horizon in autumn, it signaled the caribou migration — time for the great hunt that would sustain the community through the dark winter months. The celestial caribou never stops moving, just as the earthly herds follow ancient paths across the tundra.",
                    "lesson": "Life follows the migration. Those who read the patterns of the sky will never go hungry."
                },
                "paths": [
                    [[-0.5,0.3],[-0.5,-0.2],[0.2,-0.4],[0.3,0.2],[-0.5,0.3]],
                    [[0.3,0.2],[0.6,0.5]],
                    [[-0.5,0.3],[-0.8,0.5]],
                ],
            },
            {
                "id": "sakiattiak", "name": "Sakiattiak (The Breastbone)", "culture_name": "Inuit",
                "ra": 3.79, "dec": 24.1,
                "stars": [
                    {"name": "Alcyone", "ra": 3.79, "dec": 24.11, "mag": 2.87},
                    {"name": "Atlas", "ra": 3.82, "dec": 24.05, "mag": 3.62},
                    {"name": "Electra", "ra": 3.75, "dec": 24.11, "mag": 3.70},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Air",
                "mythology": {
                    "figure": "The Caribou's Breastbone",
                    "origin": "Inuit",
                    "deity": "Spirit of the Hunt",
                    "story": "The Pleiades cluster was Sakiattiak — a caribou breastbone used in scapulimancy (bone divination). After a successful hunt, the shoulder blade or breastbone was heated over fire, and the cracks that formed were read as prophecy — predicting weather, hunting fortune, and the health of the community. The tight cluster of stars resembled the intricate crack patterns. When Sakiattiak rose in the autumn sky, it confirmed the season for divination and the sharing of the communal feast.",
                    "lesson": "Even bones carry wisdom. The universe writes its messages in cracks and stars alike — one must only learn to read."
                },
                "paths": [
                    [[-0.1,0.1],[0,0],[0.1,0.1]],
                    [[0,0],[0,-0.2]],
                ],
            },
            {
                "id": "nanurjuk", "name": "Nanurjuk (The Polar Bear Spirit)", "culture_name": "Inuit",
                "ra": 5.9, "dec": 7.0,
                "stars": [
                    {"name": "Betelgeuse (Nanurjuk's Eye)", "ra": 5.92, "dec": 7.41, "mag": 0.5},
                    {"name": "Bellatrix", "ra": 5.42, "dec": 6.35, "mag": 1.64},
                    {"name": "Saiph", "ra": 5.8, "dec": -9.67, "mag": 2.09},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Water",
                "mythology": {
                    "figure": "The Great Polar Bear",
                    "origin": "Inuit (Baffin Island)",
                    "deity": "Nanuk (Bear Spirit)",
                    "story": "Betelgeuse's deep red glow was the eye of Nanurjuk — the great spirit bear that walks between the ice and the stars. Nanuk, the polar bear spirit, teaches hunters respect. A hunter must approach a bear with reverence, for the bear chooses to give itself. If disrespected, the bear spirit will warn all other animals, and the hunter will find nothing. Betelgeuse, a dying red supergiant, pulses and changes brightness — the bear's eye blinking as it watches humanity from the cosmic ice.",
                    "lesson": "The prey chooses the hunter as much as the hunter chooses the prey. Approach all of life with humility."
                },
                "paths": [
                    [[-0.3,0],[0,0],[0,-0.5]],
                    [[0,0],[0.3,0.3]],
                    [[-0.3,0],[-0.5,0.3]],
                ],
            },
            {
                "id": "quturjuuk", "name": "Quturjuuk (The Collarbones)", "culture_name": "Inuit",
                "ra": 19.8, "dec": 9.0,
                "stars": [
                    {"name": "Altair", "ra": 19.85, "dec": 8.87, "mag": 0.77},
                    {"name": "Tarazed", "ra": 19.77, "dec": 10.61, "mag": 2.72},
                    {"name": "Alshain", "ra": 19.92, "dec": 6.41, "mag": 3.71},
                ],
                "lines": [[1,0],[0,2]],
                "element": "Air",
                "mythology": {
                    "figure": "The Sky Collarbones",
                    "origin": "Inuit (Igloolik)",
                    "deity": "Nuliajuk (Sea Mother)",
                    "story": "Altair and its flanking stars formed Quturjuuk — two collarbones, a crucial reference for Inuit navigators. In the flat Arctic, where landmarks vanish under snow, stars were the only reliable guides. Quturjuuk's position told travelers the time and direction. In Igloolik tradition, these stars marked the return of the sun after months of darkness. When the collarbones appeared above the southern horizon in late January, children ran through the village shouting — light was returning.",
                    "lesson": "After the longest darkness, a small light on the horizon is enough to make an entire community sing."
                },
                "paths": [
                    [[-0.2,0.1],[0,0],[0.2,-0.1]],
                ],
            },
            {
                "id": "aagjuuk", "name": "Aagjuuk (The Stars of Direction)", "culture_name": "Inuit",
                "ra": 22.96, "dec": -29.6,
                "stars": [
                    {"name": "Fomalhaut", "ra": 22.96, "dec": -29.62, "mag": 1.16},
                    {"name": "Diphda", "ra": 0.73, "dec": -17.99, "mag": 2.04},
                    {"name": "Ankaa", "ra": 0.44, "dec": -42.31, "mag": 2.38},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Water",
                "mythology": {
                    "figure": "The Direction Stars",
                    "origin": "Inuit (Netsilik)",
                    "deity": "Sila (Universal Consciousness)",
                    "story": "Fomalhaut and its companions formed Aagjuuk — the two stars that always appear together at the same time and position in the southern sky. They were the most important navigation stars for Netsilik Inuit, used like a celestial clock. By noting when Aagjuuk appeared above the horizon and at what angle, travelers could determine both time and direction without a compass. In a world of perpetual ice and shifting snow, these stars were as essential as food and fire.",
                    "lesson": "In a world without fixed landmarks, look up. The sky is the one map that never drifts."
                },
                "paths": [
                    [[0,0],[0.5,0.3]],
                    [[0,0],[0.3,-0.5]],
                ],
            },
        ],
    },
    "aztec": {
        "name": "Aztec Sky",
        "color": "#B45309",
        "icon": "star",
        "description": "The Aztecs built their capital Tenochtitlan aligned to the stars. Their calendar stones encoded astronomical cycles, and celestial events determined the timing of ceremonies, warfare, and the cosmic balance between creation and destruction.",
        "constellations": [
            {
                "id": "mamalhuaztli", "name": "Mamalhuaztli (The Fire Drill)", "culture_name": "Aztec",
                "ra": 5.6, "dec": -1.0,
                "stars": [
                    {"name": "Alnitak", "ra": 5.68, "dec": -1.94, "mag": 1.77},
                    {"name": "Alnilam", "ra": 5.6, "dec": -1.2, "mag": 1.69},
                    {"name": "Mintaka", "ra": 5.53, "dec": -0.3, "mag": 2.23},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Fire",
                "mythology": {
                    "figure": "The Cosmic Fire Drill",
                    "origin": "Aztec",
                    "deity": "Xiuhtecuhtli (Fire God)",
                    "story": "Orion's belt was the Mamalhuaztli — the fire drill used to kindle the New Fire every 52 years at the culmination of the Calendar Round. At midnight, when these stars reached the zenith, priests would drill new fire on the chest of a sacrificial victim atop Huixachtlan hill. If the fire caught, the universe would continue for another 52 years. If it failed, the Tzitzimimeh star demons would descend and devour humanity. All fires in the empire were extinguished and relit from this single sacred flame.",
                    "lesson": "Civilization requires periodic renewal. Let the old fire die so that the new flame may burn brighter."
                },
                "paths": [
                    [[0,0.2],[0,0],[0,-0.2]],
                    [[-0.1,0.1],[0.1,-0.1]],
                ],
            },
            {
                "id": "tianquiztli", "name": "Tianquiztli (The Marketplace)", "culture_name": "Aztec",
                "ra": 3.79, "dec": 24.1,
                "stars": [
                    {"name": "Alcyone", "ra": 3.79, "dec": 24.11, "mag": 2.87},
                    {"name": "Atlas", "ra": 3.82, "dec": 24.05, "mag": 3.62},
                    {"name": "Electra", "ra": 3.75, "dec": 24.11, "mag": 3.70},
                ],
                "lines": [[0,1],[0,2],[1,2]],
                "element": "Earth",
                "mythology": {
                    "figure": "The Celestial Marketplace",
                    "origin": "Aztec",
                    "deity": "Quetzalcoatl",
                    "story": "The Pleiades were Tianquiztli — the cosmic marketplace where the gods gathered to trade and set prices. Its zenith passage at midnight marked the critical moment of the New Fire ceremony. The Aztec 52-year cycle (Calendar Round) was timed to this star cluster. Markets were the heart of Aztec civilization, and their celestial counterpart confirmed that even commerce was divinely ordained. The stars' annual disappearance and return mirrored the cycles of trade and abundance.",
                    "lesson": "Exchange is sacred. When beings meet to give and receive fairly, they mirror the divine marketplace above."
                },
                "paths": [
                    [[-0.1,0.1],[0,0],[0.1,0.1]],
                    [[0,0],[0,-0.15]],
                ],
            },
            {
                "id": "citlalcolotl", "name": "Citlalcolotl (The Scorpion Star)", "culture_name": "Aztec",
                "ra": 16.5, "dec": -26.0,
                "stars": [
                    {"name": "Antares", "ra": 16.49, "dec": -26.43, "mag": 0.96},
                    {"name": "Dschubba", "ra": 16.01, "dec": -22.62, "mag": 2.32},
                    {"name": "Shaula", "ra": 17.56, "dec": -37.1, "mag": 1.63},
                ],
                "lines": [[1,0],[0,2]],
                "element": "Water",
                "mythology": {
                    "figure": "The Celestial Scorpion",
                    "origin": "Aztec",
                    "deity": "Mictlantecuhtli (Lord of the Dead)",
                    "story": "Antares blazed red as the heart of Citlalcolotl — the celestial scorpion guarding the southern gateway to Mictlan, the underworld. The scorpion was associated with the land of the dead, where souls journeyed through nine treacherous levels over four years before finding rest. Mictlantecuhtli, the skeletal lord, ruled this domain with his wife Mictecacihuatl. The scorpion's low arc across the southern sky traced the path the dead must walk.",
                    "lesson": "Death is not an ending but a journey. The soul that perseveres through darkness will find rest in the deepest layer of peace."
                },
                "paths": [
                    [[0.3,0.2],[0,0],[-0.5,-0.5],[-0.8,-0.8],[-1.0,-1.2]],
                    [[0.3,0.2],[0.5,0.4]],
                ],
            },
            {
                "id": "tezcatlipoca_star", "name": "Tezcatlipoca (Smoking Mirror)", "culture_name": "Aztec",
                "ra": 12.0, "dec": 58.0,
                "stars": [
                    {"name": "Dubhe", "ra": 11.06, "dec": 61.75, "mag": 1.79},
                    {"name": "Merak", "ra": 11.02, "dec": 56.38, "mag": 2.37},
                    {"name": "Phecda", "ra": 11.9, "dec": 53.69, "mag": 2.44},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Air",
                "mythology": {
                    "figure": "The Smoking Mirror God",
                    "origin": "Aztec",
                    "deity": "Tezcatlipoca (God of Night and Destiny)",
                    "story": "Tezcatlipoca, the shape-shifting god of the night sky, was associated with the Great Bear circling the pole. Legend says he lost his foot when creating the world — bitten off by the Earth Monster Cipactli — which is why the Great Bear dips below the horizon in tropical Mexico. His obsidian smoking mirror revealed all truths and deceptions. He was the rival and complement of Quetzalcoatl — darkness to light, night to day.",
                    "lesson": "The mirror shows both what you wish to see and what you fear. Only the brave look into the smoking glass without flinching."
                },
                "paths": [
                    [[-0.5,0.3],[-0.5,-0.1],[0.2,-0.4]],
                    [[-0.5,-0.1],[-0.2,-0.4],[0.2,-0.4]],
                ],
            },
            {
                "id": "quetzalcoatl_venus", "name": "Tlahuizcalpantecuhtli (Quetzalcoatl as Morning Star)", "culture_name": "Aztec",
                "ra": 7.65, "dec": 5.2,
                "stars": [
                    {"name": "Procyon", "ra": 7.65, "dec": 5.22, "mag": 0.34},
                    {"name": "Gomeisa", "ra": 7.45, "dec": 8.29, "mag": 2.89},
                    {"name": "Sirius", "ra": 6.75, "dec": -16.72, "mag": -1.46},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Air",
                "mythology": {
                    "figure": "The Feathered Serpent Star",
                    "origin": "Aztec",
                    "deity": "Quetzalcoatl",
                    "story": "When Quetzalcoatl was tricked by Tezcatlipoca and exiled from Tula, he set himself ablaze on the shores of the eastern sea. His heart rose from the ashes to become the Morning Star — Tlahuizcalpantecuhtli. For eight days he descended to the underworld, and on the ninth he rose again, brighter than before. Venus as the Morning Star was his most sacred manifestation, and Aztec warfare was often timed to its cycles. Procyon and Sirius flanked the path of his celestial resurrection.",
                    "lesson": "From the ashes of defeat rises the brightest star. The one who descends to the underworld and returns carries the light of transformation."
                },
                "paths": [
                    [[0,0.2],[0,0],[-0.5,-0.8]],
                    [[0,0.2],[0.2,0.4]],
                ],
            },
        ],
    },
    "sumerian": {
        "name": "Sumerian Sky",
        "color": "#A855F7",
        "icon": "scroll",
        "description": "The Sumerians invented systematic astronomy around 3000 BCE. Their MUL.APIN tablets catalogued stars into three 'paths' — the paths of Anu, Enlil, and Ea — dividing the sky into cosmic highways that would influence all subsequent Western astronomy.",
        "constellations": [
            {
                "id": "mul_gu_an_na", "name": "GU.AN.NA (The Bull of Heaven)", "culture_name": "Sumerian",
                "ra": 4.6, "dec": 16.5,
                "stars": [
                    {"name": "Aldebaran (Eye of the Bull)", "ra": 4.60, "dec": 16.51, "mag": 0.85},
                    {"name": "Elnath", "ra": 5.44, "dec": 28.61, "mag": 1.65},
                    {"name": "Tianguan", "ra": 5.63, "dec": 21.14, "mag": 3.0},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Earth",
                "mythology": {
                    "figure": "The Bull of Heaven",
                    "origin": "Sumerian",
                    "deity": "Anu (Sky God) / Ishtar",
                    "story": "When Gilgamesh rejected the goddess Ishtar's love, she unleashed the Bull of Heaven upon the city of Uruk. The Bull's breath opened chasms that swallowed hundreds of warriors. Gilgamesh and Enkidu fought the divine beast, and Enkidu seized it by the horns while Gilgamesh drove his sword into its neck. They offered its heart to Shamash the sun god. Aldebaran — the red eye of the Bull — still blazes with fury in the sky, a reminder of divine wrath and mortal courage.",
                    "lesson": "When heaven itself attacks, stand firm with those you trust. Even divine fury can be overcome by friendship."
                },
                "paths": [
                    [[0,0],[-0.3,0.4],[-0.6,0.7]],
                    [[0,0],[0.4,0.3],[0.7,0.4]],
                    [[0,0],[0,-0.4]],
                ],
            },
            {
                "id": "mul_sipa_zi", "name": "SIPA.ZI.AN.NA (True Shepherd of Anu)", "culture_name": "Sumerian",
                "ra": 5.6, "dec": 0.0,
                "stars": [
                    {"name": "Betelgeuse", "ra": 5.92, "dec": 7.41, "mag": 0.5},
                    {"name": "Rigel", "ra": 5.24, "dec": -8.2, "mag": 0.13},
                    {"name": "Bellatrix", "ra": 5.42, "dec": 6.35, "mag": 1.64},
                ],
                "lines": [[0,2],[2,1]],
                "element": "Fire",
                "mythology": {
                    "figure": "The True Shepherd of Heaven",
                    "origin": "Sumerian",
                    "deity": "Dumuzi / Tammuz (Shepherd God)",
                    "story": "Orion was SIPA.ZI.AN.NA — the True Shepherd of Anu, identified with Dumuzi (Tammuz), the shepherd-king who married the goddess Inanna. When Inanna descended to the underworld, she was killed and hung on a hook. Dumuzi refused to mourn and was condemned to take her place for half the year. His annual descent brought winter; his return brought spring. The Shepherd in the sky tends the celestial flocks — the stars themselves.",
                    "lesson": "The shepherd who neglects to grieve for love will learn that grief comes for us all. Compassion is not optional."
                },
                "paths": [
                    [[-0.3,0.3],[0,0],[0.3,-0.3]],
                    [[0,0],[0,-0.6]],
                    [[-0.3,0.3],[-0.5,0.5]],
                ],
            },
            {
                "id": "mul_gir_tab", "name": "GIR.TAB (The Scorpion)", "culture_name": "Sumerian",
                "ra": 16.5, "dec": -26.0,
                "stars": [
                    {"name": "Antares", "ra": 16.49, "dec": -26.43, "mag": 0.96},
                    {"name": "Shaula", "ra": 17.56, "dec": -37.1, "mag": 1.63},
                    {"name": "Dschubba", "ra": 16.01, "dec": -22.62, "mag": 2.32},
                ],
                "lines": [[2,0],[0,1]],
                "element": "Water",
                "mythology": {
                    "figure": "The Scorpion Guardian",
                    "origin": "Sumerian / Babylonian",
                    "deity": "Ishara (Goddess of Oaths)",
                    "story": "The scorpion-men guarded the gate of Mashu mountain where the sun entered the underworld each evening. In the Epic of Gilgamesh, the hero encountered these terrifying half-human, half-scorpion beings at the edge of the world. They warned him that no mortal had ever passed through the tunnel of the sun. But Gilgamesh's courage convinced them to open the gate, and he walked twelve leagues in total darkness before emerging into the jeweled garden of the gods.",
                    "lesson": "The guardians of the forbidden path test courage, not worthiness. The gate opens for the one who does not turn back."
                },
                "paths": [
                    [[0.3,0.2],[0,0],[-0.5,-0.3],[-0.8,-0.7],[-0.9,-1.0]],
                    [[0.3,0.2],[0.5,0.3]],
                ],
            },
            {
                "id": "mul_apin", "name": "MUL.APIN (The Plow)", "culture_name": "Sumerian",
                "ra": 4.3, "dec": 35.0,
                "stars": [
                    {"name": "Hamal", "ra": 2.12, "dec": 23.46, "mag": 2.00},
                    {"name": "Sheratan", "ra": 1.91, "dec": 20.81, "mag": 2.64},
                    {"name": "Mesarthim", "ra": 1.90, "dec": 19.29, "mag": 3.86},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Earth",
                "mythology": {
                    "figure": "The Celestial Plow",
                    "origin": "Sumerian",
                    "deity": "Enlil (Lord of the Wind and Earth)",
                    "story": "MUL.APIN — the Plow Star — was among the first constellations catalogued in human history, inscribed on cuneiform tablets around 1200 BCE. It marked the beginning of the agricultural year when it rose heliacally. Enlil, the god of wind and agriculture, had given humanity the plow — the tool that transformed nomads into civilizations. The annual rising of this constellation told Sumerian farmers to begin tilling the earth, a calendar written in starlight.",
                    "lesson": "The oldest wisdom is agricultural: there is a season for planting and a season for harvest. Read the sky, and the earth will provide."
                },
                "paths": [
                    [[0,0.2],[0,0],[0,-0.2]],
                    [[-0.2,0],[0,0]],
                ],
            },
            {
                "id": "mul_dingir_inanna", "name": "MUL.DINGIR.INANNA (Star of Inanna)", "culture_name": "Sumerian",
                "ra": 13.42, "dec": -11.2,
                "stars": [
                    {"name": "Spica (Inanna's Star)", "ra": 13.42, "dec": -11.16, "mag": 0.97},
                    {"name": "Porrima", "ra": 12.69, "dec": -1.45, "mag": 2.74},
                    {"name": "Vindemiatrix", "ra": 13.04, "dec": 10.96, "mag": 2.83},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Air",
                "mythology": {
                    "figure": "The Star of the Queen of Heaven",
                    "origin": "Sumerian",
                    "deity": "Inanna / Ishtar (Queen of Heaven)",
                    "story": "Spica was the star of Inanna — the most powerful goddess in Mesopotamia: queen of heaven, goddess of love, war, and justice. Her eight-pointed star symbol is the oldest religious icon in recorded history. Inanna descended to the underworld, was killed, and rose again — the first death-and-resurrection myth. As the evening and morning star (Venus), she bridged day and night. Spica's blue-white brilliance in the constellation of the maiden was her celestial throne.",
                    "lesson": "True power descends to the deepest darkness and returns transformed. The queen of heaven earned her throne in the underworld."
                },
                "paths": [
                    [[0,0],[0.3,0.5]],
                    [[0,0],[-0.3,0.3]],
                    [[0,0],[0,-0.4]],
                ],
            },
        ],
    },
    "persian": {
        "name": "Persian Sky",
        "color": "#D97706",
        "icon": "star",
        "description": "Persian astronomy, rooted in Zoroastrian cosmology, identified four Royal Stars as the guardians of the sky. The cosmos was a battleground between Ahura Mazda (light) and Angra Mainyu (darkness), with stars as the army of light.",
        "constellations": [
            {
                "id": "tishtar", "name": "Tishtar (The Rain Star)", "culture_name": "Persian",
                "ra": 6.75, "dec": -16.7,
                "stars": [
                    {"name": "Sirius (Tishtar)", "ra": 6.75, "dec": -16.72, "mag": -1.46},
                    {"name": "Mirzam", "ra": 6.38, "dec": -17.96, "mag": 1.98},
                    {"name": "Adhara", "ra": 6.98, "dec": -28.97, "mag": 1.50},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Water",
                "mythology": {
                    "figure": "The Cosmic Rain Bringer",
                    "origin": "Persian / Zoroastrian",
                    "deity": "Tishtrya (Yazata of Rain)",
                    "story": "Tishtar (Sirius) was the most important star in Persian cosmology — the divine rain-bringer who annually battled the demon of drought, Apaosha. In the form of a brilliant white horse, Tishtar charges into the cosmic sea Vourukasha, and the splash creates the rains that water the earth. When Sirius rises in late summer, the rains come. As one of the four Royal Stars of Persia, Tishtar guards the eastern gate of heaven.",
                    "lesson": "The brightest star fights the hardest battle. Abundance comes not by chance but through cosmic struggle."
                },
                "paths": [
                    [[0,0.3],[0,0],[-0.3,-0.2]],
                    [[0,0],[0.3,-0.5]],
                ],
            },
            {
                "id": "haft_owrang", "name": "Haft Owrang (Seven Thrones)", "culture_name": "Persian",
                "ra": 12.5, "dec": 56.0,
                "stars": [
                    {"name": "Dubhe", "ra": 11.06, "dec": 61.75, "mag": 1.79},
                    {"name": "Merak", "ra": 11.02, "dec": 56.38, "mag": 2.37},
                    {"name": "Alioth", "ra": 12.9, "dec": 55.96, "mag": 1.77},
                    {"name": "Alkaid", "ra": 13.79, "dec": 49.31, "mag": 1.86},
                ],
                "lines": [[0,1],[1,2],[2,3]],
                "element": "Air",
                "mythology": {
                    "figure": "The Seven Thrones of Heaven",
                    "origin": "Persian",
                    "deity": "Ahura Mazda (Lord of Wisdom)",
                    "story": "The seven stars of the Great Bear were Haft Owrang — seven thrones upon which the Amesha Spentas (Holy Immortals) sit, governing the seven creations: sky, water, earth, plants, animals, humans, and fire. These circumpolar stars never set in Persian latitudes, eternally vigilant against Angra Mainyu's darkness. In Shahnameh, the epic of kings, heroes navigated by these seven lights as they journeyed between the realms of mortals and the divine.",
                    "lesson": "Seven pillars uphold creation. Neglect any one — sky, water, earth, plant, animal, human, or fire — and the whole edifice trembles."
                },
                "paths": [
                    [[-0.5,0.3],[-0.5,-0.1],[0.2,-0.1],[0.8,-0.4]],
                    [[-0.5,-0.1],[-0.2,-0.4],[0.2,-0.1]],
                ],
            },
            {
                "id": "venant", "name": "Venant (The Guardian of the West)", "culture_name": "Persian",
                "ra": 22.96, "dec": -29.6,
                "stars": [
                    {"name": "Fomalhaut (Venant)", "ra": 22.96, "dec": -29.62, "mag": 1.16},
                    {"name": "Diphda", "ra": 0.73, "dec": -17.99, "mag": 2.04},
                    {"name": "Skat", "ra": 22.88, "dec": -15.82, "mag": 3.27},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Water",
                "mythology": {
                    "figure": "The Western Royal Star",
                    "origin": "Persian / Zoroastrian",
                    "deity": "Apam Napat (Water Deity)",
                    "story": "Fomalhaut was Venant — one of the Four Royal Stars guarding the western gate of heaven, associated with the autumn equinox and the element of water. The Four Royals (Aldebaran/east, Regulus/north, Antares/south, Fomalhaut/west) were cosmic sentinels appointed by Ahura Mazda to watch over the four quarters of the sky. Fomalhaut's lonely brilliance in an otherwise dark region of sky earned it the title 'The Solitary One' — a lone guardian standing watch.",
                    "lesson": "The truest guardian stands alone. Fidelity is proven not in company but in solitude."
                },
                "paths": [
                    [[0,0],[0.4,0.4]],
                    [[0,0],[0.3,-0.3]],
                ],
            },
            {
                "id": "simorgh", "name": "Simorgh (The Divine Bird)", "culture_name": "Persian",
                "ra": 20.5, "dec": 40.0,
                "stars": [
                    {"name": "Deneb (Simorgh's Tail)", "ra": 20.69, "dec": 45.28, "mag": 1.25},
                    {"name": "Sadr", "ra": 20.37, "dec": 40.26, "mag": 2.23},
                    {"name": "Albireo", "ra": 19.51, "dec": 27.96, "mag": 3.08},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Air",
                "mythology": {
                    "figure": "The Mythical Bird of Wisdom",
                    "origin": "Persian",
                    "deity": "Simorgh",
                    "story": "Cygnus the swan was the Simorgh — the divine bird who nests atop the Tree of All Seeds (Harvisptokhm) at the center of the cosmic ocean. The Simorgh possesses the knowledge of all ages. In the Shahnameh, she raised the albino prince Zal and later healed his son Rostam in battle. In Attar's mystical poem, thirty birds (si morgh) journey to find their king — and discover the Simorgh is their own collective reflection. Deneb marks her luminous tail feather.",
                    "lesson": "The divine you seek outside yourself is the reflection of all seekers united. You are already what you are searching for."
                },
                "paths": [
                    [[0,0.8],[0,0],[0,-0.8]],
                    [[-0.5,0.2],[0,0],[0.5,0.2]],
                ],
            },
            {
                "id": "parvin", "name": "Parvin (The Cluster of Fate)", "culture_name": "Persian",
                "ra": 3.79, "dec": 24.1,
                "stars": [
                    {"name": "Alcyone (Parvin)", "ra": 3.79, "dec": 24.11, "mag": 2.87},
                    {"name": "Atlas", "ra": 3.82, "dec": 24.05, "mag": 3.62},
                    {"name": "Electra", "ra": 3.75, "dec": 24.11, "mag": 3.70},
                ],
                "lines": [[0,1],[0,2],[1,2]],
                "element": "Earth",
                "mythology": {
                    "figure": "The Stars of Destiny",
                    "origin": "Persian",
                    "deity": "Zurvan (God of Time)",
                    "story": "Parvin (Pleiades) was one of the most celebrated star clusters in Persian poetry and astronomy. Hafez, Rumi, and Ferdowsi all wrote of Parvin as jewels scattered across the cosmic veil. In Zoroastrian tradition, the cluster marked the beginning of the new year (Nowruz) and the triumph of spring over winter. The number of stars visible to the naked eye was used to test visual acuity — a warrior who could count all seven was deemed fit for battle.",
                    "lesson": "The clearest eyes see the most stars. Sharpen your vision — not just of the sky, but of truth."
                },
                "paths": [
                    [[-0.1,0.1],[0,0],[0.1,0.1]],
                    [[0,0],[0,-0.15]],
                ],
            },
        ],
    },
    "african_bantu": {
        "name": "Bantu Sky",
        "color": "#059669",
        "icon": "star",
        "description": "Bantu-speaking peoples across Central and Southern Africa developed rich star lore tied to agriculture, initiation, and the ancestors. The Milky Way was the backbone of night, and star clusters marked the planting calendar.",
        "constellations": [
            {
                "id": "dithutlwa", "name": "Dithutlwa (The Giraffes)", "culture_name": "Bantu",
                "ra": 12.5, "dec": -60.0,
                "stars": [
                    {"name": "Acrux", "ra": 12.44, "dec": -63.1, "mag": 0.76},
                    {"name": "Mimosa", "ra": 12.79, "dec": -59.69, "mag": 1.25},
                    {"name": "Gacrux", "ra": 12.52, "dec": -57.11, "mag": 1.63},
                ],
                "lines": [[0,1],[1,2],[2,0]],
                "element": "Earth",
                "mythology": {
                    "figure": "The Celestial Giraffes",
                    "origin": "Bantu (Tswana / Venda)",
                    "deity": "Modimo (Supreme Being)",
                    "story": "The Southern Cross and its pointer stars were Dithutlwa — giraffes walking across the night veldt. The tall cross shape mimicked the giraffe's long neck reaching for the highest acacia leaves. Among the Tswana and Venda peoples, the giraffes' appearance in the evening sky signaled the approach of the dry season and time to prepare food stores. The giraffes walked the star-path between the living and the ancestors, their height bridging earth and heaven.",
                    "lesson": "Reach higher. The one who stretches beyond what is easily grasped finds the sweetest fruit."
                },
                "paths": [
                    [[0,0.5],[0,-0.5]],
                    [[-0.3,0],[0.3,0]],
                    [[0,0.5],[0.1,0.8],[0.15,1.0]],
                ],
            },
            {
                "id": "selemela", "name": "Selemela (The Plowing Stars)", "culture_name": "Bantu",
                "ra": 3.79, "dec": 24.1,
                "stars": [
                    {"name": "Alcyone (Selemela)", "ra": 3.79, "dec": 24.11, "mag": 2.87},
                    {"name": "Atlas", "ra": 3.82, "dec": 24.05, "mag": 3.62},
                    {"name": "Electra", "ra": 3.75, "dec": 24.11, "mag": 3.70},
                ],
                "lines": [[0,1],[0,2],[1,2]],
                "element": "Earth",
                "mythology": {
                    "figure": "The Digging Stars",
                    "origin": "Bantu (Sotho / Zulu)",
                    "deity": "Ancestors",
                    "story": "Selemela (Pleiades) was the most important agricultural star cluster across Bantu Africa. When it appeared in the morning sky in June, Sotho farmers knew it was time to begin planting. The Zulu called it isiLimela — 'the digging stars.' An entire calendar system was built around its annual appearance and disappearance. Young men undergoing initiation were told: 'When you see Selemela, you are becoming a man — it is time to dig not just the earth, but into yourself.'",
                    "lesson": "The stars themselves command: it is time to plant. Whether seeds in the earth or intentions in the soul, the season will not wait."
                },
                "paths": [
                    [[-0.1,0.1],[0,0],[0.1,0.1]],
                    [[0,0],[0,-0.2]],
                ],
            },
            {
                "id": "naka", "name": "Naka (The Horn Star)", "culture_name": "Bantu",
                "ra": 4.6, "dec": 16.5,
                "stars": [
                    {"name": "Aldebaran (Naka)", "ra": 4.60, "dec": 16.51, "mag": 0.85},
                    {"name": "Elnath", "ra": 5.44, "dec": 28.61, "mag": 1.65},
                    {"name": "Tianguan", "ra": 5.63, "dec": 21.14, "mag": 3.0},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Fire",
                "mythology": {
                    "figure": "The Buffalo's Horn",
                    "origin": "Bantu (Xhosa)",
                    "deity": "uThixo (Creator)",
                    "story": "Aldebaran was Naka — the glowing tip of the great celestial buffalo's horn. The buffalo was the most dangerous and respected animal of the veldt, and its celestial form watched over warriors and cattle herders alike. Among the Xhosa, the buffalo horn star rising before dawn in winter was a signal for cattle raids — the most audacious test of young manhood. The red-orange color of Aldebaran represented the fire that burns in the heart of every warrior.",
                    "lesson": "Courage is not the absence of fear but the horn that points forward despite it."
                },
                "paths": [
                    [[0,0],[-0.3,0.5]],
                    [[0,0],[0.3,0.3]],
                    [[0,0],[0,-0.3]],
                ],
            },
            {
                "id": "mphatlalatsane", "name": "Mphatlalatsane (The Morning Star)", "culture_name": "Bantu",
                "ra": 6.40, "dec": -52.7,
                "stars": [
                    {"name": "Canopus (Mphatlalatsane)", "ra": 6.40, "dec": -52.70, "mag": -0.74},
                    {"name": "Avior", "ra": 8.38, "dec": -59.51, "mag": 1.86},
                    {"name": "Miaplacidus", "ra": 9.22, "dec": -69.72, "mag": 1.68},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Fire",
                "mythology": {
                    "figure": "The Shining One",
                    "origin": "Bantu (Sotho / Pedi)",
                    "deity": "Ancestors",
                    "story": "Canopus — the second brightest star in the sky — was Mphatlalatsane or Nanga among the Sotho peoples. Its appearance in the early morning sky in late May marked the beginning of winter and the time for initiation schools. Young people would be taken to the mountain lodges for weeks of teaching, emerging as adults. Canopus was the 'star that calls the youth to wisdom.' Its blinding brightness low on the horizon was a beacon that demanded attention — you could not ignore its summons.",
                    "lesson": "When the bright star calls, answer. The journey from youth to wisdom begins with a single step into the cold dawn."
                },
                "paths": [
                    [[0,0],[0.5,-0.2],[1.0,-0.5]],
                ],
            },
            {
                "id": "dinaledi", "name": "Dinaledi (The Stars / Ancestor Path)", "culture_name": "Bantu",
                "ra": 14.4, "dec": -60.0,
                "stars": [
                    {"name": "Alpha Centauri", "ra": 14.66, "dec": -60.84, "mag": -0.01},
                    {"name": "Hadar", "ra": 14.06, "dec": -60.37, "mag": 0.61},
                    {"name": "Menkent", "ra": 14.11, "dec": -36.37, "mag": 2.06},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Air",
                "mythology": {
                    "figure": "The Ancestor Pointers",
                    "origin": "Bantu (Pan-Southern African)",
                    "deity": "Badimo (Ancestor Spirits)",
                    "story": "Alpha and Beta Centauri were the Two Pointers — dinaledi tse pedi — that aimed at the Southern Cross, which in turn pointed to the celestial south pole, the axis around which the ancestors' heaven revolves. In many Bantu traditions, the Milky Way itself was the path of the ancestors, and these bright pointer stars were the gatekeepers. The recently discovered Homo naledi fossils were named 'naledi' (star) because the Rising Star cave where they were found leads toward these very stars.",
                    "lesson": "The ancestors point the way. Follow where the brightest lights aim, and you will find the center of everything."
                },
                "paths": [
                    [[-0.3,0],[0,0],[0,0.5]],
                ],
            },
        ],
    },
    "native_american": {
        "name": "Native American Sky",
        "color": "#B91C1C",
        "icon": "star",
        "description": "Hundreds of Native American nations each developed unique star traditions. Common threads include the Milky Way as a spirit path, animal constellations guiding the seasons, and stars as the campfires of ancestors watching over the living.",
        "constellations": [
            {
                "id": "spider_woman", "name": "Kokyangwuti (Spider Woman's Web)", "culture_name": "Native American",
                "ra": 20.5, "dec": 40.0,
                "stars": [
                    {"name": "Deneb", "ra": 20.69, "dec": 45.28, "mag": 1.25},
                    {"name": "Sadr", "ra": 20.37, "dec": 40.26, "mag": 2.23},
                    {"name": "Albireo", "ra": 19.51, "dec": 27.96, "mag": 3.08},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Air",
                "mythology": {
                    "figure": "Spider Woman's Web of Stars",
                    "origin": "Hopi / Navajo",
                    "deity": "Spider Woman (Kokyangwuti)",
                    "story": "The Northern Cross was Spider Woman's web — the cosmic matrix she wove to connect all living things. In Hopi tradition, Spider Woman created humanity from clay of four colors and connected them with threads of wisdom. The Navajo see her as Na'ashjé'ii Asdzáá, who taught the people to weave. The cross shape of Cygnus represents the four sacred directions of her web. Every thread connects to the center, and every being is connected to every other through her invisible strands.",
                    "lesson": "All things are connected by invisible threads. Pull one strand of the web and the entire universe trembles."
                },
                "paths": [
                    [[0,0.8],[0,0],[0,-0.8]],
                    [[-0.6,0.2],[0,0],[0.6,0.2]],
                ],
            },
            {
                "id": "bear_lodge", "name": "Wicincala Sakowin (Seven Sisters / Bear Lodge)", "culture_name": "Native American",
                "ra": 3.79, "dec": 24.1,
                "stars": [
                    {"name": "Alcyone", "ra": 3.79, "dec": 24.11, "mag": 2.87},
                    {"name": "Atlas", "ra": 3.82, "dec": 24.05, "mag": 3.62},
                    {"name": "Electra", "ra": 3.75, "dec": 24.11, "mag": 3.70},
                ],
                "lines": [[0,1],[0,2],[1,2]],
                "element": "Earth",
                "mythology": {
                    "figure": "The Seven Sisters of Devils Tower",
                    "origin": "Lakota / Kiowa",
                    "deity": "Mato (Bear Spirit)",
                    "story": "Seven sisters were playing when a great bear chased them. They climbed a rock and prayed for help. The rock grew into the sky, becoming Devils Tower (Bear Lodge Butte), its sides scored with the bear's claw marks. The sisters rose so high they became the Pleiades, forever safe among the stars. This story is told by Lakota, Kiowa, Arapaho, and Cheyenne nations with variations. The Pleiades' seasonal appearance marks the time for storytelling — when the snakes are asleep and it is safe to speak of sacred things.",
                    "lesson": "When you call for help from the earth itself, the earth answers. The sacred ground rises to protect the innocent."
                },
                "paths": [
                    [[-0.1,0.1],[0,0],[0.1,0.1]],
                    [[0,0],[0,-0.2]],
                ],
            },
            {
                "id": "thunderbird", "name": "Binesi (The Thunderbird)", "culture_name": "Native American",
                "ra": 19.8, "dec": 9.0,
                "stars": [
                    {"name": "Altair (Thunderbird's Heart)", "ra": 19.85, "dec": 8.87, "mag": 0.77},
                    {"name": "Tarazed", "ra": 19.77, "dec": 10.61, "mag": 2.72},
                    {"name": "Alshain", "ra": 19.92, "dec": 6.41, "mag": 3.71},
                ],
                "lines": [[1,0],[0,2]],
                "element": "Fire",
                "mythology": {
                    "figure": "The Thunderbird",
                    "origin": "Ojibwe / Algonquin",
                    "deity": "Animiki (Thunder Being)",
                    "story": "Aquila the Eagle was Binesi — the Thunderbird, the most powerful spirit in the sky. Lightning flashed from its eyes and thunder rolled from its wings. The Thunderbird battled the underwater serpent spirits (Mishipeshu) in an eternal cosmic struggle that created storms. Among the Ojibwe, the Thunderbird was a protector spirit — its presence in the sky during summer storms assured the people that the forces of good were actively fighting chaos. Altair at its heart blazed with the fire of divine protection.",
                    "lesson": "The great protector is not gentle. Sometimes love manifests as thunder — fierce, loud, and impossible to ignore."
                },
                "paths": [
                    [[-0.5,0.1],[0,0],[0.5,0.1]],
                    [[0,0],[0,-0.3]],
                    [[0,0],[0,0.4]],
                ],
            },
            {
                "id": "coyote_stars", "name": "Ma'ii Bizò'(Coyote's Stars)", "culture_name": "Native American",
                "ra": 10.14, "dec": 12.0,
                "stars": [
                    {"name": "Regulus", "ra": 10.14, "dec": 11.97, "mag": 1.35},
                    {"name": "Denebola", "ra": 11.82, "dec": 14.57, "mag": 2.14},
                    {"name": "Algieba", "ra": 10.33, "dec": 19.84, "mag": 2.28},
                ],
                "lines": [[0,2],[2,1]],
                "element": "Fire",
                "mythology": {
                    "figure": "Coyote's Scattered Stars",
                    "origin": "Navajo",
                    "deity": "Ma'ii (Coyote / Trickster)",
                    "story": "In Navajo tradition, Black God (Haashch'eeshzhiní) was carefully placing the stars in perfect patterns using his crystal pouch. Coyote grew impatient and grabbed the pouch, scattering stars randomly across the sky — which is why most stars seem disordered. But the ones Black God had already placed — the bright recognizable constellations — remain in their original positions. Leo's bright stars are among those Coyote scattered in a moment of chaos — bright, distinctive, and slightly askew.",
                    "lesson": "Impatience creates chaos from order. But even chaos has its own wild beauty — some of the best things happen by accident."
                },
                "paths": [
                    [[0,0],[0.2,0.3]],
                    [[0.2,0.3],[0.8,0.2]],
                    [[0,0],[-0.2,-0.2]],
                ],
            },
            {
                "id": "morning_star", "name": "Anpao (The Morning Star)", "culture_name": "Native American",
                "ra": 6.75, "dec": -16.7,
                "stars": [
                    {"name": "Sirius (Morning Star)", "ra": 6.75, "dec": -16.72, "mag": -1.46},
                    {"name": "Procyon", "ra": 7.65, "dec": 5.22, "mag": 0.34},
                    {"name": "Betelgeuse", "ra": 5.92, "dec": 7.41, "mag": 0.5},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Air",
                "mythology": {
                    "figure": "The Dawn Bringer",
                    "origin": "Lakota / Pawnee",
                    "deity": "Anpao (Spirit of the Dawn)",
                    "story": "The Morning Star was among the most sacred objects in Plains Indian cosmology. To the Pawnee, the Morning Star (Opirikusu) was a warrior god whose union with the Evening Star created humanity. To the Lakota, Anpao (Two-Face) was the spirit of dawn — beautiful on one side, scarred on the other — representing the duality of each new day's potential. Sirius, blazing at dawn in winter, was the herald that darkness was ending and light returning. Every dawn ceremony honored this star's promise.",
                    "lesson": "Every dawn carries two faces — hope and fear. The warrior greets both and chooses the face of light."
                },
                "paths": [
                    [[0,0],[0.4,0.8]],
                    [[0,0],[-0.4,0.9]],
                ],
            },
        ],
    },
    "slavic": {
        "name": "Slavic Sky",
        "color": "#7C3AED",
        "icon": "star",
        "description": "Slavic peoples saw the sky through the lens of their rich mythology — the cosmic tree Svetovit, the thunder god Perun, and the cycles of the agricultural year. Their star lore blends pre-Christian paganism with deep connections to the natural world.",
        "constellations": [
            {
                "id": "perun_axe", "name": "Perunova Sekira (Perun's Axe)", "culture_name": "Slavic",
                "ra": 5.6, "dec": 0.0,
                "stars": [
                    {"name": "Betelgeuse", "ra": 5.92, "dec": 7.41, "mag": 0.5},
                    {"name": "Rigel", "ra": 5.24, "dec": -8.2, "mag": 0.13},
                    {"name": "Bellatrix", "ra": 5.42, "dec": 6.35, "mag": 1.64},
                ],
                "lines": [[0,2],[2,1]],
                "element": "Fire",
                "mythology": {
                    "figure": "The Thunder God's Weapon",
                    "origin": "Slavic (Pan-Slavic)",
                    "deity": "Perun (God of Thunder)",
                    "story": "Orion was the axe of Perun — the supreme Slavic god of thunder, oak trees, and justice. Perun eternally battles Veles, the serpent god of the underworld, who steals cattle, water, and sometimes the sun itself. When Perun hurls his axe-stars across the sky, lightning strikes and rain falls, freeing what Veles has stolen. The conflict between Perun (sky/order) and Veles (earth/chaos) is the fundamental myth of all Slavic peoples, reflected in every thunderstorm.",
                    "lesson": "The universe maintains its balance through eternal opposition. Thunder and serpent, sky and earth — neither can exist without the other."
                },
                "paths": [
                    [[-0.3,0.3],[0,0],[0.3,-0.3]],
                    [[0,0],[0,-0.5]],
                    [[-0.3,0.3],[-0.5,0.5]],
                ],
            },
            {
                "id": "voz_wagon", "name": "Voz (The Great Wagon)", "culture_name": "Slavic",
                "ra": 12.5, "dec": 56.0,
                "stars": [
                    {"name": "Dubhe", "ra": 11.06, "dec": 61.75, "mag": 1.79},
                    {"name": "Merak", "ra": 11.02, "dec": 56.38, "mag": 2.37},
                    {"name": "Alioth", "ra": 12.9, "dec": 55.96, "mag": 1.77},
                    {"name": "Alkaid", "ra": 13.79, "dec": 49.31, "mag": 1.86},
                ],
                "lines": [[0,1],[1,2],[2,3]],
                "element": "Earth",
                "mythology": {
                    "figure": "The Celestial Wagon",
                    "origin": "Slavic (Russian / Polish)",
                    "deity": "Svarog (Sky Smith God)",
                    "story": "The Big Dipper was Voz — the Great Wagon carrying souls to the afterlife. In Russian folklore, the seven stars were seven brothers turned to stone by a witch, then placed in the sky by Svarog the celestial smith. The wagon circles the North Star endlessly, never resting. In Polish tradition, it was Wóz Niebios — the Heavenly Cart driven by a farmer who was so honest that God rewarded him with a place in the eternal sky. The cart never sets below the horizon — a promise of eternal labor rewarded.",
                    "lesson": "Honest work is its own immortality. The one who toils faithfully is given a place among the stars that never sets."
                },
                "paths": [
                    [[-0.5,0.3],[-0.5,-0.1],[0.2,-0.1],[0.8,-0.4]],
                    [[-0.5,-0.1],[-0.2,-0.4],[0.2,-0.1]],
                ],
            },
            {
                "id": "firebird", "name": "Zhar-Ptitsa (The Firebird)", "culture_name": "Slavic",
                "ra": 18.62, "dec": 38.0,
                "stars": [
                    {"name": "Vega (Firebird's Eye)", "ra": 18.62, "dec": 38.78, "mag": 0.03},
                    {"name": "Sheliak", "ra": 18.83, "dec": 33.36, "mag": 3.45},
                    {"name": "Sulafat", "ra": 18.98, "dec": 32.69, "mag": 3.24},
                ],
                "lines": [[0,1],[0,2],[1,2]],
                "element": "Fire",
                "mythology": {
                    "figure": "The Firebird",
                    "origin": "Slavic (Russian)",
                    "deity": "Spirit of Transformation",
                    "story": "Vega was the blazing eye of the Zhar-Ptitsa — the Firebird, whose single feather could light an entire room. In Russian fairy tales, the hero Ivan Tsarevich pursues the Firebird through enchanted gardens, past Baba Yaga's hut, to the edge of the world. Each feather left behind glows with the fire of truth, leading the seeker deeper into mystery. The Firebird cannot be caught — only followed. Vega's blue-white brilliance, the brightest star in the northern sky, burns with the same untouchable beauty.",
                    "lesson": "Chase the light you can never fully grasp. The pursuit itself transforms you into something luminous."
                },
                "paths": [
                    [[0,0.5],[-0.2,0],[0.2,0],[0,0.5]],
                    [[-0.2,0],[0,-0.3],[0.2,0]],
                ],
            },
            {
                "id": "mokosh_spindle", "name": "Mokosh's Vreteno (The Spindle)", "culture_name": "Slavic",
                "ra": 3.79, "dec": 24.1,
                "stars": [
                    {"name": "Alcyone", "ra": 3.79, "dec": 24.11, "mag": 2.87},
                    {"name": "Atlas", "ra": 3.82, "dec": 24.05, "mag": 3.62},
                    {"name": "Merope", "ra": 3.77, "dec": 23.95, "mag": 4.18},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Water",
                "mythology": {
                    "figure": "The Goddess's Spindle",
                    "origin": "Slavic",
                    "deity": "Mokosh (Earth Mother / Fate Goddess)",
                    "story": "The Pleiades were Mokosh's spindle — the cosmic tool with which the Earth Mother spun the threads of fate for every living being. Mokosh was the only female deity in the official Slavic pantheon of Vladimir's Kiev. She governed women's work (spinning, weaving, washing), fertility, and fate itself. The tight cluster of the Pleiades resembled the twisted fibers on a spindle whorl. When women spun thread under these stars, they believed Mokosh guided their hands — and that every thread they made was a small echo of the threads of destiny.",
                    "lesson": "Every small creative act echoes the cosmic creation. When you make something with your hands, you spin the threads of fate."
                },
                "paths": [
                    [[0,0.15],[0,0],[0,-0.15]],
                    [[-0.1,0],[0.1,0]],
                ],
            },
            {
                "id": "baba_yaga", "name": "Izba Baba Yagi (Baba Yaga's Hut)", "culture_name": "Slavic",
                "ra": 0.7, "dec": 57.0,
                "stars": [
                    {"name": "Schedar", "ra": 0.68, "dec": 56.54, "mag": 2.23},
                    {"name": "Caph", "ra": 0.15, "dec": 59.15, "mag": 2.27},
                    {"name": "Navi", "ra": 0.95, "dec": 60.72, "mag": 2.47},
                ],
                "lines": [[0,1],[0,2],[1,2]],
                "element": "Air",
                "mythology": {
                    "figure": "The Witch's Hut on Chicken Legs",
                    "origin": "Slavic (Russian / Eastern Slavic)",
                    "deity": "Baba Yaga (Crone/Wise Woman)",
                    "story": "Cassiopeia's W-shape was Baba Yaga's hut perched on its chicken legs, spinning in the sky. Baba Yaga is the most complex figure in Slavic mythology — simultaneously terrifying and wise, cruel and generous. She flies through the sky in a mortar, sweeping her tracks with a pestle. Those who approach with courage and good manners receive magical aid; the rude and cowardly are eaten. Her hut spins to face the brave and turns away from the unworthy. The circumpolar constellation rotates around Polaris like her hut spinning on its legs.",
                    "lesson": "The guardian of wisdom tests you before revealing the truth. Approach the unknown with respect, and even the fearsome crone becomes your ally."
                },
                "paths": [
                    [[-0.3,0.1],[0,-0.2],[0.3,0.2]],
                    [[0,-0.2],[0,-0.5]],
                    [[-0.2,-0.5],[0,-0.2],[0.2,-0.5]],
                ],
            },
        ],
    },
    "maori": {
        "name": "Maori Sky",
        "color": "#0EA5E9",
        "icon": "star",
        "description": "The Maori of Aotearoa (New Zealand) developed one of the most sophisticated Polynesian star systems. Matariki (Pleiades) marks the new year, and the sky holds the great canoe of Tama-rereti, the taniwha guardians, and the love stories of the stars.",
        "constellations": [
            {
                "id": "te_waka", "name": "Te Waka o Tama-rereti (The Great Canoe)", "culture_name": "Maori",
                "ra": 17.0, "dec": -35.0,
                "stars": [
                    {"name": "Antares (Te Kauaka)", "ra": 16.49, "dec": -26.43, "mag": 0.96},
                    {"name": "Shaula", "ra": 17.56, "dec": -37.1, "mag": 1.63},
                    {"name": "Sargas", "ra": 17.62, "dec": -43.0, "mag": 1.87},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Water",
                "mythology": {
                    "figure": "The Celestial Waka (Canoe)",
                    "origin": "Maori",
                    "deity": "Tama-rereti (Star Voyager)",
                    "story": "The tail of Scorpius is Te Waka o Tama-rereti — the great celestial canoe. When the sky was dark and featureless, the hero Tama-rereti sailed his canoe across the heavenly ocean, and the shining pebbles (kaimoana) that he scattered from the canoe became the stars. Ranginui, the Sky Father, was so pleased that he placed the canoe itself in the sky as a constellation. The Milky Way is the wake of his voyage — the luminous trail of the first cosmic navigator.",
                    "lesson": "One brave journey can illuminate the sky for all who follow. Leave light in your wake."
                },
                "paths": [
                    [[0.3,0.3],[0,0],[-0.5,-0.5],[-0.8,-0.8]],
                ],
            },
            {
                "id": "matariki_maori", "name": "Matariki (The New Year Stars)", "culture_name": "Maori",
                "ra": 3.79, "dec": 24.1,
                "stars": [
                    {"name": "Alcyone (Matariki)", "ra": 3.79, "dec": 24.11, "mag": 2.87},
                    {"name": "Atlas (Tupuanuku)", "ra": 3.82, "dec": 24.05, "mag": 3.62},
                    {"name": "Electra (Waiti)", "ra": 3.75, "dec": 24.11, "mag": 3.70},
                ],
                "lines": [[0,1],[0,2],[1,2]],
                "element": "Earth",
                "mythology": {
                    "figure": "Eyes of the God / Mother and Children",
                    "origin": "Maori",
                    "deity": "Matariki (Star Mother)",
                    "story": "Matariki is the Maori New Year, celebrated when the Pleiades rise before dawn in late June. The nine stars of Matariki are a mother and her children, each governing a domain: Matariki (wellbeing), Tupuanuku (food from earth), Tupuarangi (food from sky), Waiti (freshwater), Waita (ocean), Waipuna-a-rangi (rain), Ururangi (wind), Pohutukawa (the departed), and Hiwa-i-te-rangi (wishes). Maori light fires, sing waiata, shed tears for the dead, and set intentions for the coming year.",
                    "lesson": "Every ending births a new beginning. The darkest night of winter holds all the seeds of what will bloom."
                },
                "paths": [
                    [[-0.1,0.1],[0,0],[0.1,0.1]],
                    [[0,0],[0,0.2]],
                    [[-0.1,0.1],[0,0.25],[0.1,0.1]],
                ],
            },
            {
                "id": "rehua", "name": "Rehua (Chief of the Stars)", "culture_name": "Maori",
                "ra": 16.49, "dec": -26.4,
                "stars": [
                    {"name": "Antares (Rehua)", "ra": 16.49, "dec": -26.43, "mag": 0.96},
                    {"name": "Dschubba", "ra": 16.01, "dec": -22.62, "mag": 2.32},
                    {"name": "Graffias", "ra": 16.09, "dec": -19.81, "mag": 2.62},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Fire",
                "mythology": {
                    "figure": "The Chief of All Stars",
                    "origin": "Maori",
                    "deity": "Rehua (Supreme Star Being)",
                    "story": "Rehua (Antares) is the ariki (chief) of all stars — the most important star in Maori astronomy after Matariki. Rehua is a celestial being of such mana (spiritual power) that birds nest in his hair and the deceased ascend to his realm. He dwells in the highest of the ten heavens. His red brilliance in summer marks the season of abundance. When Tane (god of forests) climbed through the celestial realms seeking the baskets of knowledge, Rehua guided him to the summit.",
                    "lesson": "The highest wisdom shines with a steady red fire. Seek the one who has climbed all the heavens — they will show you the way up."
                },
                "paths": [
                    [[0,0],[0.3,0.2],[0.5,0.4]],
                    [[0,0],[-0.2,0.3]],
                ],
            },
            {
                "id": "puanga", "name": "Puanga (Rigel — The New Year Herald)", "culture_name": "Maori",
                "ra": 5.24, "dec": -8.2,
                "stars": [
                    {"name": "Rigel (Puanga)", "ra": 5.24, "dec": -8.2, "mag": 0.13},
                    {"name": "Saiph", "ra": 5.8, "dec": -9.67, "mag": 2.09},
                    {"name": "Mintaka", "ra": 5.53, "dec": -0.3, "mag": 2.23},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Water",
                "mythology": {
                    "figure": "The Herald Star",
                    "origin": "Maori (Whanganui)",
                    "deity": "Puanga",
                    "story": "In the Whanganui region, Puanga (Rigel) rather than Matariki marks the new year. This brilliant blue-white star rises before the Pleiades and was considered the true herald of the season's turn. Puanga is a star of such brightness that some iwi (tribes) believed it was a separate celestial being rivaling Matariki in authority. The dual new year traditions remind the Maori that different perspectives can coexist — both are true, both are honored, and the sky is large enough for all traditions.",
                    "lesson": "Two truths can shine in the same sky without diminishing each other. Honor all paths that lead to light."
                },
                "paths": [
                    [[0,0],[0.3,0]],
                    [[0,0],[0.2,0.3]],
                ],
            },
            {
                "id": "takurua", "name": "Takurua (Sirius — The Winter Star)", "culture_name": "Maori",
                "ra": 6.75, "dec": -16.7,
                "stars": [
                    {"name": "Sirius (Takurua)", "ra": 6.75, "dec": -16.72, "mag": -1.46},
                    {"name": "Mirzam", "ra": 6.38, "dec": -17.96, "mag": 1.98},
                    {"name": "Wezen", "ra": 7.14, "dec": -26.39, "mag": 1.84},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Water",
                "mythology": {
                    "figure": "The Winter Star",
                    "origin": "Maori",
                    "deity": "Takurua",
                    "story": "Sirius — the brightest star visible from Aotearoa — was Takurua, the star of winter. Its appearance high in the midnight sky confirmed that winter (hotoke) had truly arrived. The name also means 'winter' itself. Takurua's piercing brilliance on cold clear nights symbolized the sharp beauty of the season — harsh but necessary for the land to rest and regenerate. When Takurua began to set earlier each night, the people knew Matariki's rise and the new year were approaching.",
                    "lesson": "The coldest seasons produce the clearest skies. Embrace the winters of life — they sharpen your vision."
                },
                "paths": [
                    [[0,0],[-0.3,0]],
                    [[0,0],[0.3,-0.4]],
                ],
            },
        ],
    },
}
