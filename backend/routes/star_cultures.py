from fastapi import APIRouter
from deps import logger

router = APIRouter()

# Multi-cultural constellation systems
# Each culture groups the same stars differently with unique mythologies
CULTURAL_CONSTELLATIONS = {
    "mayan": {
        "name": "Mayan Sky",
        "color": "#22C55E",
        "icon": "pyramid",
        "description": "The Maya tracked celestial cycles with extraordinary precision. Their sky was divided into cosmic creatures and deities guiding agricultural and ceremonial life.",
        "constellations": [
            {
                "id": "ak_ek", "name": "Ak Ek (Turtle)", "culture_name": "Mayan",
                "ra": 5.5, "dec": -1.0,
                "stars": [
                    {"name": "Alnitak", "ra": 5.68, "dec": -1.94, "mag": 1.77},
                    {"name": "Alnilam", "ra": 5.6, "dec": -1.2, "mag": 1.69},
                    {"name": "Mintaka", "ra": 5.53, "dec": -0.3, "mag": 2.23},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Earth",
                "mythology": {
                    "figure": "The Cosmic Turtle",
                    "origin": "Mayan",
                    "deity": "Hun Hunahpu (Maize God)",
                    "story": "Orion's belt represented the three hearthstones of creation placed by the gods at the beginning of time. The Maize God, Hun Hunahpu, was reborn from a crack in the turtle's shell — the constellation representing the moment of cosmic creation. The Maya saw these stars as the turtle from whose back the world was born, and the Maize God emerged to bring sustenance to humanity.",
                    "lesson": "Creation is an ongoing act. Each dawn, the universe is reborn from the cosmic hearth."
                },
                "paths": [
                    [[-0.3,0],[0,0.2],[0.3,0],[0,-0.2],[-0.3,0]],
                    [[-0.2,0.1],[0,0.4],[0.2,0.1]],
                    [[-0.2,-0.1],[0,-0.3],[0.2,-0.1]],
                ],
            },
            {
                "id": "zinaan_ek", "name": "Zinaan Ek (Scorpion)", "culture_name": "Mayan",
                "ra": 16.5, "dec": -26.0,
                "stars": [
                    {"name": "Antares", "ra": 16.49, "dec": -26.43, "mag": 0.96},
                    {"name": "Shaula", "ra": 17.56, "dec": -37.1, "mag": 1.63},
                    {"name": "Sargas", "ra": 17.62, "dec": -43.0, "mag": 1.87},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Water",
                "mythology": {
                    "figure": "The Celestial Scorpion",
                    "origin": "Mayan",
                    "deity": "Xbalanque",
                    "story": "The Maya scorpion constellation marked the dry season and the underworld portal Xibalba. The Hero Twins Hunahpu and Xbalanque descended through this star-gate to defeat the Lords of Death in a cosmic ball game. Antares, the scorpion's heart, glows red as the fires of the underworld — a beacon warning travelers of the trials below.",
                    "lesson": "To overcome darkness, you must be willing to descend into it. Victory requires facing your deepest fears."
                },
                "paths": [
                    [[-1.0,0],[-0.5,0.2],[0,0],[0.5,-0.2],[1.0,-0.5]],
                    [[1.0,-0.5],[1.2,-0.8],[1.3,-0.5]],
                    [[-1.0,0],[-1.3,0.3],[-1.4,0.1]],
                ],
            },
            {
                "id": "balam", "name": "Balam (Jaguar)", "culture_name": "Mayan",
                "ra": 10.5, "dec": 15.0,
                "stars": [
                    {"name": "Regulus", "ra": 10.14, "dec": 11.97, "mag": 1.35},
                    {"name": "Denebola", "ra": 11.82, "dec": 14.57, "mag": 2.14},
                    {"name": "Algieba", "ra": 10.33, "dec": 19.84, "mag": 2.28},
                ],
                "lines": [[0,2],[2,1]],
                "element": "Fire",
                "mythology": {
                    "figure": "The Night Jaguar",
                    "origin": "Mayan",
                    "deity": "Kinich Ahau (Sun God)",
                    "story": "Each night, the Sun God Kinich Ahau transforms into a jaguar to journey through Xibalba, the underworld. Regulus was the jaguar's glowing eye, watching over the jungle from the sky. Maya kings wore jaguar pelts to channel this celestial power — the ability to traverse between worlds of light and darkness.",
                    "lesson": "True power comes from mastery of both the light and shadow within yourself."
                },
                "paths": [
                    [[0.5,0.8],[0.2,0.6],[-0.3,0.5],[-0.6,0.3],[-0.5,0],[-0.2,-0.2],[0.2,-0.3],[0.5,-0.1],[0.6,0.3],[0.5,0.8]],
                    [[-0.6,0.3],[-0.9,0.1]],
                    [[-0.2,-0.2],[-0.4,-0.6]],
                    [[0.2,-0.3],[0.4,-0.6]],
                ],
            },
            {
                "id": "chan", "name": "Chan (Serpent)", "culture_name": "Mayan",
                "ra": 18.9, "dec": 36.0,
                "stars": [
                    {"name": "Vega", "ra": 18.62, "dec": 38.78, "mag": 0.03},
                    {"name": "Sheliak", "ra": 18.83, "dec": 33.36, "mag": 3.45},
                    {"name": "Sulafat", "ra": 18.98, "dec": 32.69, "mag": 3.24},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Air",
                "mythology": {
                    "figure": "The Feathered Serpent",
                    "origin": "Mayan",
                    "deity": "Kukulkan",
                    "story": "Kukulkan, the feathered serpent, descended from these stars to bring knowledge of astronomy, mathematics, and the sacred calendar to the Maya people. Vega's brilliant light was the serpent's glowing crest. At the spring equinox, a shadow serpent descends the pyramid at Chichen Itza — a celestial alignment honoring this cosmic teacher.",
                    "lesson": "Wisdom descends from the heavens but takes root in the Earth. Knowledge is the bridge between worlds."
                },
                "paths": [
                    [[0,1.2],[0.2,0.8],[0,0.4],[-0.2,0],[0,-0.4],[0.2,-0.8],[0,-1.2]],
                    [[0,1.2],[0.3,1.4],[0.1,1.6],[-0.2,1.5]],
                ],
            },
            {
                "id": "xux_ek", "name": "Xux Ek (Wasp Star)", "culture_name": "Mayan",
                "ra": 7.0, "dec": 22.0,
                "stars": [
                    {"name": "Pollux", "ra": 7.76, "dec": 28.03, "mag": 1.14},
                    {"name": "Castor", "ra": 7.58, "dec": 31.89, "mag": 1.58},
                    {"name": "Alhena", "ra": 6.63, "dec": 16.4, "mag": 1.93},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Fire",
                "mythology": {
                    "figure": "The Wasp Star / Peccary",
                    "origin": "Mayan",
                    "deity": "Ah Puch",
                    "story": "The Wasp Star marked the season when swarms would emerge. The twin stars Castor and Pollux were seen as the Hero Twins themselves, forever locked in their cosmic ball game against the Lords of Death. Their appearance signaled the agricultural calendar's key turning point.",
                    "lesson": "Duality is the nature of existence. Light and dark, life and death, play the eternal game together."
                },
                "paths": [
                    [[-0.4,1.2],[0,0.8],[0.4,1.2]],
                    [[0,0.8],[0,-0.2],[0,-0.8]],
                    [[-0.3,-0.2],[0,-0.2],[0.3,-0.2]],
                ],
            },
        ],
    },
    "egyptian": {
        "name": "Egyptian Sky",
        "color": "#EAB308",
        "icon": "eye",
        "description": "The ancient Egyptians saw the sky as the body of Nut, the sky goddess. Stars were the souls of the dead, and constellations mapped the journey through the Duat (underworld).",
        "constellations": [
            {
                "id": "sah", "name": "Sah (Osiris)", "culture_name": "Egyptian",
                "ra": 5.5, "dec": 0.0,
                "stars": [
                    {"name": "Betelgeuse", "ra": 5.92, "dec": 7.41, "mag": 0.5},
                    {"name": "Rigel", "ra": 5.24, "dec": -8.2, "mag": 0.13},
                    {"name": "Bellatrix", "ra": 5.42, "dec": 6.35, "mag": 1.64},
                    {"name": "Mintaka", "ra": 5.53, "dec": -0.3, "mag": 2.23},
                    {"name": "Alnilam", "ra": 5.6, "dec": -1.2, "mag": 1.69},
                    {"name": "Alnitak", "ra": 5.68, "dec": -1.94, "mag": 1.77},
                    {"name": "Saiph", "ra": 5.8, "dec": -9.67, "mag": 2.09},
                ],
                "lines": [[0,2],[2,3],[3,4],[4,5],[5,6],[6,1],[0,4]],
                "element": "Fire",
                "mythology": {
                    "figure": "Sah — Lord of the Stars",
                    "origin": "Egyptian",
                    "deity": "Osiris",
                    "story": "Sah was the stellar embodiment of Osiris, lord of the afterlife and judge of the dead. The three belt stars aligned with the three great pyramids of Giza — a mirror of heaven on earth. When Sah rose before dawn, it heralded the annual flooding of the Nile, the lifeblood of Egypt. The pharaohs believed their souls would ascend through shafts in the pyramids to join Osiris among these eternal stars.",
                    "lesson": "As above, so below. The patterns of heaven are reflected in the architecture of the soul."
                },
                "paths": [
                    [[0,1.5],[0,0.8],[0,0],[0,-0.8],[0,-1.5]],
                    [[-0.5,0.8],[0,0.8],[0.5,0.8]],
                    [[-0.8,1.2],[0,1.5],[0.8,1.2]],
                    [[-0.3,0],[0.3,0]],
                    [[0,-0.8],[-0.5,-1.3]],
                    [[0,-0.8],[0.5,-1.3]],
                ],
            },
            {
                "id": "meskhetiu", "name": "Meskhetiu (Bull's Thigh)", "culture_name": "Egyptian",
                "ra": 11.0, "dec": 55.0,
                "stars": [
                    {"name": "Dubhe", "ra": 11.06, "dec": 61.75, "mag": 1.79},
                    {"name": "Merak", "ra": 11.03, "dec": 56.38, "mag": 2.37},
                    {"name": "Phecda", "ra": 11.9, "dec": 53.69, "mag": 2.44},
                    {"name": "Megrez", "ra": 12.26, "dec": 57.03, "mag": 3.31},
                    {"name": "Alioth", "ra": 12.9, "dec": 55.96, "mag": 1.77},
                    {"name": "Mizar", "ra": 13.4, "dec": 54.93, "mag": 2.27},
                    {"name": "Alkaid", "ra": 13.79, "dec": 49.31, "mag": 1.86},
                ],
                "lines": [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
                "element": "Earth",
                "mythology": {
                    "figure": "The Bull's Foreleg",
                    "origin": "Egyptian",
                    "deity": "Set / Isis",
                    "story": "The Egyptians saw the Big Dipper as the severed foreleg of Set, the chaotic god who murdered his brother Osiris. Isis and her allies chained this leg to the celestial pole so Set could never fully reassemble. A hippopotamus goddess, Taweret, eternally guards the chain, keeping chaos bound. This constellation never sets below the Egyptian horizon — forever circling, forever imprisoned.",
                    "lesson": "Even chaos can be contained when wisdom stands eternal guard. Order is maintained through vigilance."
                },
                "paths": [
                    [[-0.5,0.5],[0,0.3],[0.3,0],[0.1,-0.4],[-0.3,-0.6],[-0.6,-0.3],[-0.5,0.5]],
                    [[0.3,0],[0.8,0.2],[1.2,0]],
                ],
            },
            {
                "id": "sopdet", "name": "Sopdet (Isis Star)", "culture_name": "Egyptian",
                "ra": 4.5, "dec": 16.0,
                "stars": [
                    {"name": "Aldebaran", "ra": 4.6, "dec": 16.51, "mag": 0.85},
                    {"name": "Elnath", "ra": 5.44, "dec": 28.61, "mag": 1.65},
                    {"name": "Alcyone", "ra": 3.79, "dec": 24.11, "mag": 2.87},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Water",
                "mythology": {
                    "figure": "The Star of Isis",
                    "origin": "Egyptian",
                    "deity": "Isis / Hathor",
                    "story": "Aldebaran, the fiery eye, was associated with Hathor, the cow goddess of love and the sky. The Hyades star cluster formed her celestial face. The Egyptians watched this region closely — when these stars appeared at dawn, it signaled the season of divine protection. Isis wept tears that became the flooding Nile, nourishing all of Egypt.",
                    "lesson": "Tears of compassion become rivers of sustenance. Your grief can water the gardens of others."
                },
                "paths": [
                    [[-0.8,0.8],[-0.3,0.3],[0,0],[0.3,-0.2],[0.8,-0.1]],
                    [[0,0],[0,0.6],[0.3,1.0]],
                    [[-0.3,0.3],[-0.6,0.8]],
                ],
            },
            {
                "id": "wadjet", "name": "Wadjet (Serpent Crown)", "culture_name": "Egyptian",
                "ra": 16.5, "dec": -26.0,
                "stars": [
                    {"name": "Antares", "ra": 16.49, "dec": -26.43, "mag": 0.96},
                    {"name": "Shaula", "ra": 17.56, "dec": -37.1, "mag": 1.63},
                    {"name": "Sargas", "ra": 17.62, "dec": -43.0, "mag": 1.87},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Fire",
                "mythology": {
                    "figure": "The Uraeus Serpent",
                    "origin": "Egyptian",
                    "deity": "Wadjet / Serket",
                    "story": "The scorpion stars represented Serket, the goddess who protected the canopic jars containing the pharaoh's organs. Her red heart-star Antares was the Eye of the Serpent — the uraeus that adorned the pharaoh's crown. Serket's venom could kill or heal, making her the patron of medicine. She guarded the gateway to the afterlife, testing each soul's worthiness.",
                    "lesson": "The power to destroy and the power to heal are the same force, directed by intention."
                },
                "paths": [
                    [[0,0.8],[0.3,0.4],[0,0],[-0.3,-0.4],[0,-0.8],[0.3,-1.2]],
                    [[0,0.8],[-0.3,1.0],[0,1.2],[0.3,1.0],[0,0.8]],
                ],
            },
            {
                "id": "anpu", "name": "Anpu (Jackal Guide)", "culture_name": "Egyptian",
                "ra": 7.0, "dec": 22.0,
                "stars": [
                    {"name": "Pollux", "ra": 7.76, "dec": 28.03, "mag": 1.14},
                    {"name": "Castor", "ra": 7.58, "dec": 31.89, "mag": 1.58},
                    {"name": "Alhena", "ra": 6.63, "dec": 16.4, "mag": 1.93},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Air",
                "mythology": {
                    "figure": "The Jackal of the Duat",
                    "origin": "Egyptian",
                    "deity": "Anubis",
                    "story": "These twin stars were the eyes of Anubis, the jackal-headed god who guided souls through the Duat — the Egyptian underworld. He invented mummification to preserve his father Osiris, and stood beside the scales of Ma'at to weigh each heart against the feather of truth. His constellation rose when the embalming season began.",
                    "lesson": "The guide through darkness must know both death and preservation. To lead others, first walk the path alone."
                },
                "paths": [
                    [[0,1.0],[0,0.5],[0,0],[-0.2,-0.5],[-0.4,-0.9]],
                    [[0,0],[0.2,-0.5],[0.4,-0.9]],
                    [[0,1.0],[-0.3,1.3],[-0.5,1.1]],
                    [[0,1.0],[0.3,1.3],[0.5,1.1]],
                ],
            },
        ],
    },
    "australian": {
        "name": "Aboriginal Sky",
        "color": "#F97316",
        "icon": "sun",
        "description": "Aboriginal Australians hold the world's oldest continuous astronomical traditions (65,000+ years). They see constellations in both the bright stars AND the dark spaces between them.",
        "constellations": [
            {
                "id": "tchingal", "name": "Tchingal (Emu in the Sky)", "culture_name": "Aboriginal",
                "ra": 12.5, "dec": -60.0,
                "stars": [
                    {"name": "Acrux (proxy)", "ra": 12.44, "dec": -63.1, "mag": 0.77},
                    {"name": "Spica", "ra": 13.42, "dec": -11.16, "mag": 0.97},
                    {"name": "Porrima", "ra": 12.69, "dec": -1.45, "mag": 2.74},
                ],
                "lines": [[0,2],[2,1]],
                "element": "Earth",
                "mythology": {
                    "figure": "The Great Celestial Emu",
                    "origin": "Aboriginal Australian",
                    "deity": "Dreamtime Spirit",
                    "story": "The Emu in the Sky is the most famous Aboriginal constellation — formed not by stars but by the dark dust lanes of the Milky Way. When the Emu's neck (the Coalsack Nebula near the Southern Cross) stretches across the sky in April-May, it signals emu egg-laying season. This is one of the world's oldest astronomical traditions, with rock art depicting it dating back 15,000+ years. The emu teaches the rhythm of the land.",
                    "lesson": "Look not only at what shines, but at the spaces between. Darkness holds its own wisdom and patterns."
                },
                "paths": [
                    [[0,0.5],[-0.3,0.2],[-0.2,-0.2],[0,-0.5],[0.2,-0.2],[0.3,0.2],[0,0.5]],
                    [[0,0.5],[0,1.0],[0.1,1.4]],
                    [[-0.2,-0.2],[-0.5,-0.6]],
                    [[0.2,-0.2],[0.5,-0.6]],
                ],
            },
            {
                "id": "djulpan", "name": "Djulpan (Canoe)", "culture_name": "Aboriginal",
                "ra": 5.5, "dec": 0.0,
                "stars": [
                    {"name": "Betelgeuse", "ra": 5.92, "dec": 7.41, "mag": 0.5},
                    {"name": "Rigel", "ra": 5.24, "dec": -8.2, "mag": 0.13},
                    {"name": "Mintaka", "ra": 5.53, "dec": -0.3, "mag": 2.23},
                    {"name": "Alnilam", "ra": 5.6, "dec": -1.2, "mag": 1.69},
                    {"name": "Alnitak", "ra": 5.68, "dec": -1.94, "mag": 1.77},
                ],
                "lines": [[0,2],[2,3],[3,4],[4,1]],
                "element": "Water",
                "mythology": {
                    "figure": "The Fishing Canoe",
                    "origin": "Yolngu (Aboriginal)",
                    "deity": "Three Brothers",
                    "story": "The Yolngu people of Arnhem Land see Orion as a canoe. The three belt stars are three brothers who went fishing and caught a forbidden king-fish. As punishment for breaking sacred law, they were cast into the sky in their canoe for eternity. The Orion Nebula below is the fish still dangling from their line. This serves as a constant reminder that sacred laws govern even the smallest actions.",
                    "lesson": "Sacred law applies to all equally. Even small transgressions ripple through the cosmos."
                },
                "paths": [
                    [[-0.8,0.3],[-0.3,0],[0,0],[0.3,0],[0.8,0.3]],
                    [[-0.8,0.3],[0,0.5],[0.8,0.3]],
                    [[0,0],[0,-0.5],[0,-1.0]],
                ],
            },
            {
                "id": "kungkarungkara", "name": "Kungkarungkara (Seven Sisters)", "culture_name": "Aboriginal",
                "ra": 3.79, "dec": 24.0,
                "stars": [
                    {"name": "Alcyone", "ra": 3.79, "dec": 24.11, "mag": 2.87},
                    {"name": "Aldebaran", "ra": 4.6, "dec": 16.51, "mag": 0.85},
                    {"name": "Elnath", "ra": 5.44, "dec": 28.61, "mag": 1.65},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Fire",
                "mythology": {
                    "figure": "The Seven Sisters",
                    "origin": "Aboriginal Australian",
                    "deity": "Ancestral Women",
                    "story": "Across many Aboriginal nations, the Pleiades are seven sisters fleeing from Jampijinpa (Orion), a man pursuing them with unwanted desire. They traveled across the land, creating waterholes and sacred sites wherever they camped. Finally, they leaped into the sky to escape forever. Aldebaran is the man still pursuing them. This Dreaming track crosses the entire Australian continent — one of the longest songlines.",
                    "lesson": "Sacred boundaries must be respected. The pursued become stars — untouchable and eternal."
                },
                "paths": [
                    [[-0.2,0.2],[0,0.3],[0.2,0.2],[0.1,0],[-0.1,0],[-0.2,0.2]],
                    [[0.3,0],[0.6,-0.2],[0.9,-0.1]],
                ],
            },
            {
                "id": "bunya", "name": "Bunya (Eagle)", "culture_name": "Aboriginal",
                "ra": 18.9, "dec": 36.0,
                "stars": [
                    {"name": "Vega", "ra": 18.62, "dec": 38.78, "mag": 0.03},
                    {"name": "Sheliak", "ra": 18.83, "dec": 33.36, "mag": 3.45},
                    {"name": "Sulafat", "ra": 18.98, "dec": 32.69, "mag": 3.24},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Air",
                "mythology": {
                    "figure": "The Wedge-Tailed Eagle",
                    "origin": "Aboriginal Australian",
                    "deity": "Bunjil the Creator",
                    "story": "Bunjil is the great creator spirit of the Kulin people, who takes the form of a wedge-tailed eagle. After creating the land, rivers, and people, Bunjil soared into the sky and became the bright star Vega — forever watching over his creation from above. His two helpers, the stars beside him, are his dogs who accompanied him during the creation of the world.",
                    "lesson": "The creator never abandons creation. The watchful eye above sees all and cares for all."
                },
                "paths": [
                    [[0,0.8],[0,0],[0,-0.5]],
                    [[0,0],[-0.8,0.4],[-1.2,0.6]],
                    [[0,0],[0.8,0.4],[1.2,0.6]],
                    [[-0.8,0.4],[-0.6,0.2]],
                    [[0.8,0.4],[0.6,0.2]],
                ],
            },
            {
                "id": "marali", "name": "Marali (Southern Cross Guide)", "culture_name": "Aboriginal",
                "ra": 10.5, "dec": 15.0,
                "stars": [
                    {"name": "Regulus", "ra": 10.14, "dec": 11.97, "mag": 1.35},
                    {"name": "Denebola", "ra": 11.82, "dec": 14.57, "mag": 2.14},
                    {"name": "Algieba", "ra": 10.33, "dec": 19.84, "mag": 2.28},
                ],
                "lines": [[0,2],[2,1]],
                "element": "Fire",
                "mythology": {
                    "figure": "The Stingray",
                    "origin": "Aboriginal Australian",
                    "deity": "Dreamtime Ancestor",
                    "story": "Some coastal Aboriginal groups saw this star region as a great stingray gliding through the cosmic sea. The stingray ancestor created the river channels and coastal formations during the Dreamtime. Its regular appearance guided fishing seasons and tidal knowledge passed down through 65,000 years of continuous observation.",
                    "lesson": "The oldest knowledge flows through the rivers of story. Listen to the elders who remember the Dreaming."
                },
                "paths": [
                    [[-0.6,0],[0,0.4],[0.6,0],[0,-0.4],[-0.6,0]],
                    [[0.6,0],[1.2,0]],
                ],
            },
        ],
    },
    "lakota": {
        "name": "Lakota Sky",
        "color": "#DC2626",
        "icon": "feather",
        "description": "The Lakota Sioux see the night sky as a sacred mirror of the Black Hills (He Sapa). Star patterns guided ceremonies, seasonal camps, and the path of the spirit after death.",
        "constellations": [
            {
                "id": "nape", "name": "Nape (The Hand)", "culture_name": "Lakota",
                "ra": 5.5, "dec": 0.0,
                "stars": [
                    {"name": "Rigel", "ra": 5.24, "dec": -8.2, "mag": 0.13},
                    {"name": "Mintaka", "ra": 5.53, "dec": -0.3, "mag": 2.23},
                    {"name": "Alnilam", "ra": 5.6, "dec": -1.2, "mag": 1.69},
                    {"name": "Alnitak", "ra": 5.68, "dec": -1.94, "mag": 1.77},
                    {"name": "Betelgeuse", "ra": 5.92, "dec": 7.41, "mag": 0.5},
                ],
                "lines": [[0,1],[1,2],[2,3],[3,4]],
                "element": "Fire",
                "mythology": {
                    "figure": "The Chief's Hand",
                    "origin": "Lakota Sioux",
                    "deity": "Fallen Star",
                    "story": "The Lakota see the bottom of Orion as the wrist and fingers of a great chief's hand, severed by the Thunder Being as punishment for arrogance. The arm stretches across the sky as a reminder. Orion's belt stars are the wrist, and the sword stars are the severed fingers dripping with starlight. This constellation teaches that even great leaders must practice humility before the sacred powers.",
                    "lesson": "Power without humility invites its own undoing. Lead with an open hand, not a clenched fist."
                },
                "paths": [
                    [[0,-0.8],[0,-0.2],[0,0],[0,0.2],[0,0.8]],
                    [[0,0],[-0.4,0.3],[-0.7,0.6]],
                    [[0,0],[0.4,0.3],[0.7,0.6]],
                    [[0,-0.2],[-0.3,-0.6]],
                    [[0,-0.2],[0.3,-0.6]],
                ],
            },
            {
                "id": "mato_tipila", "name": "Mato Tipila (Bear Lodge)", "culture_name": "Lakota",
                "ra": 3.79, "dec": 24.0,
                "stars": [
                    {"name": "Alcyone", "ra": 3.79, "dec": 24.11, "mag": 2.87},
                    {"name": "Aldebaran", "ra": 4.6, "dec": 16.51, "mag": 0.85},
                    {"name": "Elnath", "ra": 5.44, "dec": 28.61, "mag": 1.65},
                ],
                "lines": [[0,1],[0,2],[1,2]],
                "element": "Earth",
                "mythology": {
                    "figure": "The Bear Lodge / Devil's Tower",
                    "origin": "Lakota Sioux",
                    "deity": "Mato (Bear Spirit)",
                    "story": "Seven sisters were chased by a great bear. They prayed to the rock, which rose into the sky to save them, becoming Devil's Tower (Mato Tipila) with the bear's claw marks scarring its sides. The seven sisters became the Pleiades star cluster. Each year when the Pleiades are visible, the Lakota honor the connection between the sacred Black Hills landscape and its celestial mirror.",
                    "lesson": "The Earth rises to protect the innocent. Sacred places on the ground mirror sacred patterns in the sky."
                },
                "paths": [
                    [[0,0.6],[-0.5,0],[0,-0.6],[0.5,0],[0,0.6]],
                    [[0,0.6],[0,1.0]],
                    [[-0.5,0],[-0.9,0]],
                    [[0.5,0],[0.9,0]],
                    [[0,-0.6],[0,-1.0]],
                ],
            },
            {
                "id": "can_gleska", "name": "Can Gleska Wakan (Sacred Hoop)", "culture_name": "Lakota",
                "ra": 10.5, "dec": 15.0,
                "stars": [
                    {"name": "Regulus", "ra": 10.14, "dec": 11.97, "mag": 1.35},
                    {"name": "Denebola", "ra": 11.82, "dec": 14.57, "mag": 2.14},
                    {"name": "Algieba", "ra": 10.33, "dec": 19.84, "mag": 2.28},
                ],
                "lines": [[0,2],[2,1],[1,0]],
                "element": "Air",
                "mythology": {
                    "figure": "The Sacred Hoop of Stars",
                    "origin": "Lakota Sioux",
                    "deity": "Wakan Tanka (Great Spirit)",
                    "story": "The Sacred Hoop represents the interconnection of all living things — the Circle of Life that has no beginning and no end. These stars form part of the great celestial circle that mirrors the Medicine Wheel on Earth. The four directions, four seasons, and four stages of life are all contained within. When the hoop is broken, the people suffer; when restored, harmony returns.",
                    "lesson": "All of life moves in circles. What you send into the world returns to you. Mend the sacred hoop within yourself."
                },
                "paths": [
                    [[0,0.8],[0.7,0.4],[0.7,-0.4],[0,-0.8],[-0.7,-0.4],[-0.7,0.4],[0,0.8]],
                    [[0,0.8],[0,-0.8]],
                    [[-0.7,0],[0.7,0]],
                ],
            },
            {
                "id": "wicincala_sakowin", "name": "Wicincala Sakowin (Seven Girls)", "culture_name": "Lakota",
                "ra": 11.0, "dec": 55.0,
                "stars": [
                    {"name": "Dubhe", "ra": 11.06, "dec": 61.75, "mag": 1.79},
                    {"name": "Merak", "ra": 11.03, "dec": 56.38, "mag": 2.37},
                    {"name": "Phecda", "ra": 11.9, "dec": 53.69, "mag": 2.44},
                    {"name": "Megrez", "ra": 12.26, "dec": 57.03, "mag": 3.31},
                    {"name": "Alioth", "ra": 12.9, "dec": 55.96, "mag": 1.77},
                    {"name": "Mizar", "ra": 13.4, "dec": 54.93, "mag": 2.27},
                    {"name": "Alkaid", "ra": 13.79, "dec": 49.31, "mag": 1.86},
                ],
                "lines": [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
                "element": "Water",
                "mythology": {
                    "figure": "The Seven Little Girls / Stretcher Bearers",
                    "origin": "Lakota Sioux",
                    "deity": "Star People",
                    "story": "The Lakota see the Big Dipper as a stretcher (the bowl) carried by mourners (the handle stars). A great chief has fallen, and his people carry him across the sky in an eternal funeral procession. Others know these as seven young girls who were taken to the sky by the Star People to learn sacred teachings. The Dipper's position marks the seasons and guides all who travel at night.",
                    "lesson": "Even in mourning there is movement. Grief carried together becomes a journey toward healing."
                },
                "paths": [
                    [[-0.5,0.3],[0.5,0.3],[0.5,-0.3],[-0.5,-0.3],[-0.5,0.3]],
                    [[0.5,0.3],[0.9,0.5],[1.3,0.3],[1.7,0]],
                ],
            },
            {
                "id": "tayamni", "name": "Tayamni (Buffalo)", "culture_name": "Lakota",
                "ra": 16.5, "dec": -26.0,
                "stars": [
                    {"name": "Antares", "ra": 16.49, "dec": -26.43, "mag": 0.96},
                    {"name": "Shaula", "ra": 17.56, "dec": -37.1, "mag": 1.63},
                    {"name": "Sargas", "ra": 17.62, "dec": -43.0, "mag": 1.87},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Earth",
                "mythology": {
                    "figure": "The Celestial Buffalo",
                    "origin": "Lakota Sioux",
                    "deity": "Tatanka (Buffalo Spirit)",
                    "story": "The Lakota see a great buffalo in this region of the sky. Antares is the buffalo's red heart, beating with the pulse of the prairie. The buffalo was the center of Lakota life — providing food, shelter, tools, and spiritual connection. When the celestial buffalo's heart star rises bright, it signals the time for the Sun Dance ceremony and the renewal of the people's covenant with the Earth.",
                    "lesson": "The buffalo gives everything and asks nothing in return. True abundance comes from generosity of spirit."
                },
                "paths": [
                    [[-0.8,0.3],[-0.3,0.5],[0.2,0.4],[0.6,0.2],[0.8,0],
                     [0.6,-0.2],[0.2,-0.3],[-0.3,-0.2],[-0.8,0.3]],
                    [[-0.8,0.3],[-1.1,0.6],[-0.9,0.8]],
                    [[-0.8,0.3],[-1.1,0.2],[-0.9,0.0]],
                    [[0.2,-0.3],[0.1,-0.7]],
                    [[0.6,-0.2],[0.7,-0.6]],
                ],
            },
        ],
    },
}


@router.get("/star-chart/cultures")
async def get_star_cultures():
    """Return available cultural sky systems."""
    cultures = []
    for key, val in CULTURAL_CONSTELLATIONS.items():
        cultures.append({
            "id": key,
            "name": val["name"],
            "color": val["color"],
            "icon": val["icon"],
            "description": val["description"],
            "constellation_count": len(val["constellations"]),
        })
    return {"cultures": cultures}


@router.get("/star-chart/cultures/{culture_id}")
async def get_culture_constellations(culture_id: str):
    """Return constellation data for a specific cultural sky system."""
    culture = CULTURAL_CONSTELLATIONS.get(culture_id)
    if not culture:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Culture not found")
    return {
        "id": culture_id,
        "name": culture["name"],
        "color": culture["color"],
        "description": culture["description"],
        "constellations": culture["constellations"],
    }
