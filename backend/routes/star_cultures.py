from fastapi import APIRouter
from deps import logger
from data.extended_star_cultures import EXTENDED_CULTURES

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
    "chinese": {
        "name": "Chinese Sky",
        "color": "#EF4444",
        "icon": "star",
        "description": "Chinese astronomy is one of the oldest in the world (4,000+ years). The sky is divided into the Four Sacred Beasts guarding the cardinal directions, and the Purple Forbidden Enclosure — the Emperor's celestial palace at the pole.",
        "constellations": [
            {
                "id": "qing_long", "name": "Qing Long (Azure Dragon)", "culture_name": "Chinese",
                "ra": 16.5, "dec": -26.0,
                "stars": [
                    {"name": "Antares (Xin)", "ra": 16.49, "dec": -26.43, "mag": 0.96},
                    {"name": "Shaula (Wei)", "ra": 17.56, "dec": -37.1, "mag": 1.63},
                    {"name": "Sargas (Wei)", "ra": 17.62, "dec": -43.0, "mag": 1.87},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Wood",
                "mythology": {
                    "figure": "The Azure Dragon of the East",
                    "origin": "Chinese",
                    "deity": "Qing Long",
                    "story": "The Azure Dragon guards the eastern sky and represents spring, dawn, and new growth. Its seven Lunar Mansions — Jiao (Horn), Kang (Neck), Di (Root), Fang (Chamber), Xin (Heart), Wei (Tail), and Ji (Winnowing Basket) — track the dragon from horn to tail. Antares is Xin, the Dragon's Heart, pulsing red with cosmic fire. When the Dragon's Horn rises at dusk in spring, farmers know it is time to plant. The Azure Dragon embodies the Yang energy of creation and the unstoppable force of renewal.",
                    "lesson": "Like the dragon rising in spring, growth cannot be rushed — but when the season comes, nothing can hold it back."
                },
                "paths": [
                    [[-1.2,0.6],[-0.8,0.4],[-0.3,0.2],[0,0],[0.3,-0.3],[0.7,-0.6],[1.0,-0.8],[1.2,-0.6]],
                    [[0,0],[0.2,0.3],[0.1,0.6],[-0.1,0.8]],
                    [[-0.8,0.4],[-1.0,0.7],[-0.8,0.9]],
                ],
            },
            {
                "id": "bai_hu", "name": "Bai Hu (White Tiger)", "culture_name": "Chinese",
                "ra": 5.5, "dec": 0.0,
                "stars": [
                    {"name": "Betelgeuse (Shen)", "ra": 5.92, "dec": 7.41, "mag": 0.5},
                    {"name": "Rigel (Shen)", "ra": 5.24, "dec": -8.2, "mag": 0.13},
                    {"name": "Bellatrix (Shen)", "ra": 5.42, "dec": 6.35, "mag": 1.64},
                    {"name": "Mintaka (Shen)", "ra": 5.53, "dec": -0.3, "mag": 2.23},
                    {"name": "Alnilam (Shen)", "ra": 5.6, "dec": -1.2, "mag": 1.69},
                    {"name": "Alnitak (Shen)", "ra": 5.68, "dec": -1.94, "mag": 1.77},
                ],
                "lines": [[0,2],[2,3],[3,4],[4,5],[5,1],[0,3]],
                "element": "Metal",
                "mythology": {
                    "figure": "The White Tiger of the West",
                    "origin": "Chinese",
                    "deity": "Bai Hu",
                    "story": "The White Tiger guards the western sky and represents autumn, dusk, and the setting sun. Its seven Lunar Mansions — Kui (Legs), Lou (Bond), Wei (Stomach), Mao (Hairy Head), Bi (Net), Zi (Turtle Beak), and Shen (Three Stars) — form the great celestial tiger. The Shen mansion (Orion's central stars) is the tiger's luminous body. In Chinese martial arts, the White Tiger represents fierce righteous power. Generals prayed to Bai Hu before battle, and white tiger amulets protected against evil spirits.",
                    "lesson": "True courage is not the absence of fear, but righteous action in the face of it. The White Tiger strikes only to protect."
                },
                "paths": [
                    [[-0.8,0.8],[-0.4,0.4],[0,0],[0.4,0.4],[0.8,0.8]],
                    [[0,0],[0,-0.4],[0,-0.8]],
                    [[-0.4,0.4],[-0.6,0.1],[-0.4,-0.2]],
                    [[0.4,0.4],[0.6,0.1],[0.4,-0.2]],
                    [[-0.8,0.8],[-1.0,0.6]],
                    [[0.8,0.8],[1.0,0.6]],
                ],
            },
            {
                "id": "zhu_que", "name": "Zhu Que (Vermilion Bird)", "culture_name": "Chinese",
                "ra": 10.5, "dec": 15.0,
                "stars": [
                    {"name": "Regulus (Xuan Yuan)", "ra": 10.14, "dec": 11.97, "mag": 1.35},
                    {"name": "Denebola (Wu Di Zuo)", "ra": 11.82, "dec": 14.57, "mag": 2.14},
                    {"name": "Algieba (Xuan Yuan)", "ra": 10.33, "dec": 19.84, "mag": 2.28},
                ],
                "lines": [[0,2],[2,1],[1,0]],
                "element": "Fire",
                "mythology": {
                    "figure": "The Vermilion Bird of the South",
                    "origin": "Chinese",
                    "deity": "Zhu Que / Feng Huang",
                    "story": "The Vermilion Bird guards the southern sky and represents summer, midday, and the peak of Yang energy. Its seven Lunar Mansions — Jing (Well), Gui (Ghosts), Liu (Willow), Xing (Star), Zhang (Extended Net), Yi (Wings), and Zhen (Chariot) — trace a magnificent phoenix across the heavens. Regulus, the brightest star in this region, was called Xuan Yuan after the Yellow Emperor himself. The Vermilion Bird is often conflated with the Feng Huang (Phoenix) — symbol of the empress, immortality, and the eternal cycle of death and rebirth.",
                    "lesson": "Like the phoenix, transformation requires surrender to the flame. What burns away was never truly yours."
                },
                "paths": [
                    [[0,0.8],[0,0.3],[0,0],[0.3,-0.2],[0,-0.5],[-0.3,-0.2],[0,0]],
                    [[0,0.3],[-0.5,0.6],[-0.8,0.5]],
                    [[0,0.3],[0.5,0.6],[0.8,0.5]],
                    [[-0.5,0.6],[-0.3,0.9],[0,1.0],[0.3,0.9],[0.5,0.6]],
                ],
            },
            {
                "id": "xuan_wu", "name": "Xuan Wu (Black Tortoise)", "culture_name": "Chinese",
                "ra": 18.9, "dec": 36.0,
                "stars": [
                    {"name": "Vega (Zhi Nu)", "ra": 18.62, "dec": 38.78, "mag": 0.03},
                    {"name": "Sheliak", "ra": 18.83, "dec": 33.36, "mag": 3.45},
                    {"name": "Sulafat", "ra": 18.98, "dec": 32.69, "mag": 3.24},
                ],
                "lines": [[0,1],[1,2],[2,0]],
                "element": "Water",
                "mythology": {
                    "figure": "The Black Tortoise of the North",
                    "origin": "Chinese",
                    "deity": "Xuan Wu / Zhen Wu",
                    "story": "The Black Tortoise — a tortoise entwined with a serpent — guards the northern sky and represents winter, midnight, and deep Yin energy. Its seven Lunar Mansions — Dou (Dipper), Niu (Ox), Nu (Girl), Xu (Emptiness), Wei (Rooftop), Shi (Encampment), and Bi (Wall) — form the shell of cosmic protection. Vega, the weaving star Zhi Nu, tells the famous love story: the Weaver Girl and the Cowherd, separated by the Milky Way, who reunite once a year on the seventh night of the seventh month when magpies build a bridge across the Silver River.",
                    "lesson": "True love endures any separation. Patience and devotion can bridge even the river of stars."
                },
                "paths": [
                    [[-0.6,0.4],[-0.3,0.6],[0.3,0.6],[0.6,0.4],[0.6,-0.2],[0.3,-0.5],[-0.3,-0.5],[-0.6,-0.2],[-0.6,0.4]],
                    [[0.3,-0.5],[0.5,-0.7],[0.3,-0.9],[0,-0.8],[-0.3,-0.9],[-0.5,-0.7],[-0.3,-0.5]],
                ],
            },
            {
                "id": "zi_wei", "name": "Zi Wei Yuan (Purple Forbidden Enclosure)", "culture_name": "Chinese",
                "ra": 11.0, "dec": 55.0,
                "stars": [
                    {"name": "Dubhe (Tian Shu)", "ra": 11.06, "dec": 61.75, "mag": 1.79},
                    {"name": "Merak (Tian Xuan)", "ra": 11.03, "dec": 56.38, "mag": 2.37},
                    {"name": "Phecda (Tian Ji)", "ra": 11.9, "dec": 53.69, "mag": 2.44},
                    {"name": "Megrez (Tian Quan)", "ra": 12.26, "dec": 57.03, "mag": 3.31},
                    {"name": "Alioth (Yu Heng)", "ra": 12.9, "dec": 55.96, "mag": 1.77},
                    {"name": "Mizar (Kai Yang)", "ra": 13.4, "dec": 54.93, "mag": 2.27},
                    {"name": "Alkaid (Yao Guang)", "ra": 13.79, "dec": 49.31, "mag": 1.86},
                ],
                "lines": [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
                "element": "Earth",
                "mythology": {
                    "figure": "The Emperor's Celestial Palace",
                    "origin": "Chinese",
                    "deity": "Tian Di (Celestial Emperor)",
                    "story": "The Bei Dou (Northern Dipper / Big Dipper) is the most important asterism in Chinese astronomy — the celestial chariot of the Jade Emperor, ruler of heaven. Its seven stars each carry a name: Tian Shu (Pivot of Heaven), Tian Xuan (Jade Rotating), Tian Ji (Pearl of Heaven), Tian Quan (Jade Balance), Yu Heng (Jade Transverse), Kai Yang (Opening Sun), and Yao Guang (Twinkling Brilliance). The Dipper's handle points to different seasons as it rotates around Polaris (the Celestial Emperor's throne). The Purple Forbidden Enclosure surrounding it mirrors the Forbidden City on Earth — as above, so below. Feng shui masters use the Dipper's orientation to align buildings, graves, and cities.",
                    "lesson": "The center holds still while all things turn around it. Find your own celestial pole — the quiet center from which you govern your life."
                },
                "paths": [
                    [[-0.5,0.3],[0.5,0.3],[0.5,-0.3],[-0.5,-0.3],[-0.5,0.3]],
                    [[0.5,0.3],[0.9,0.5],[1.3,0.3],[1.7,0]],
                    [[-0.7,0.5],[-0.5,0.3]],
                    [[-0.7,-0.5],[-0.5,-0.3]],
                    [[0.7,0.5],[0.5,0.3]],
                    [[0.7,-0.5],[0.5,-0.3]],
                ],
            },
        ],
    },
    "vedic": {
        "name": "Vedic Sky",
        "color": "#FF9800",
        "icon": "star",
        "description": "The Vedic Nakshatra system divides the sky into 27 lunar mansions, each ruled by a deity and carrying specific spiritual energy. Indian astronomy dates back over 5,000 years to the Vedas, the oldest scriptures of humanity.",
        "constellations": [
            {
                "id": "sapta_rishi", "name": "Sapta Rishi (Seven Sages)", "culture_name": "Vedic",
                "ra": 12.0, "dec": 55.0,
                "stars": [
                    {"name": "Kratu (Dubhe)", "ra": 11.06, "dec": 61.75, "mag": 1.79},
                    {"name": "Pulaha (Merak)", "ra": 11.03, "dec": 56.38, "mag": 2.37},
                    {"name": "Pulastya (Phecda)", "ra": 11.9, "dec": 53.69, "mag": 2.44},
                    {"name": "Atri (Megrez)", "ra": 12.26, "dec": 57.03, "mag": 3.31},
                    {"name": "Angiras (Alioth)", "ra": 12.9, "dec": 55.96, "mag": 1.77},
                    {"name": "Vasishtha (Mizar)", "ra": 13.4, "dec": 54.93, "mag": 2.27},
                    {"name": "Bhrigu (Alkaid)", "ra": 13.79, "dec": 49.31, "mag": 1.86},
                ],
                "lines": [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
                "element": "Akasha",
                "mythology": {
                    "figure": "The Seven Sages",
                    "origin": "Vedic",
                    "deity": "Brahma",
                    "story": "The Sapta Rishi are the seven great sages born from the mind of Brahma, the Creator. Each sage — Kratu, Pulaha, Pulastya, Atri, Angiras, Vasishtha, and Bhrigu — carries a fundamental aspect of cosmic knowledge. Vasishtha, the brightest, was the guru of Lord Rama. His companion star Arundhati (Alcor) symbolizes the ideal devoted wife. In Hindu weddings, the couple is shown this double star as a blessing. The seven sages eternally circle Dhruva (Polaris), the unmoving star representing Lord Vishnu's steadfast nature.",
                    "lesson": "True knowledge is not acquired — it is remembered. The sages are within you, waiting to be awakened."
                },
                "paths": [
                    [[-0.5,0.3],[0.5,0.3],[0.5,-0.3],[-0.5,-0.3],[-0.5,0.3]],
                    [[0.5,0.3],[0.9,0.5],[1.3,0.3],[1.7,0]],
                ],
            },
            {
                "id": "rohini", "name": "Rohini (The Red One)", "culture_name": "Vedic",
                "ra": 4.6, "dec": 16.5,
                "stars": [
                    {"name": "Aldebaran (Rohini)", "ra": 4.6, "dec": 16.51, "mag": 0.85},
                    {"name": "Ain", "ra": 4.48, "dec": 19.18, "mag": 3.53},
                    {"name": "Hyadum I", "ra": 4.33, "dec": 15.63, "mag": 3.65},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Prithvi",
                "mythology": {
                    "figure": "The Beloved of the Moon",
                    "origin": "Vedic",
                    "deity": "Chandra (Moon God)",
                    "story": "Rohini is the most beloved of Chandra's 27 wives (the 27 Nakshatras). Her star Aldebaran glows red with passion and fertility. Chandra loved Rohini so much that he neglected his other wives, who complained to their father Daksha. Daksha cursed Chandra to waste away, which is why the moon wanes. Only Shiva's mercy restored the cycle of waxing and waning. Rohini Nakshatra is considered the most auspicious for new beginnings, love, and creative ventures in Vedic astrology.",
                    "lesson": "Love must be shared equally, or it becomes attachment. The waxing and waning teaches balance."
                },
                "paths": [
                    [[-0.3,0.3],[0,0],[0.3,0.3]],
                    [[0,0],[0,-0.5]],
                ],
            },
            {
                "id": "trishul", "name": "Mrigashira (The Deer's Head)", "culture_name": "Vedic",
                "ra": 5.9, "dec": 7.0,
                "stars": [
                    {"name": "Betelgeuse (Ardra)", "ra": 5.92, "dec": 7.41, "mag": 0.5},
                    {"name": "Bellatrix", "ra": 5.42, "dec": 6.35, "mag": 1.64},
                    {"name": "Mintaka", "ra": 5.53, "dec": -0.3, "mag": 2.23},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Vayu",
                "mythology": {
                    "figure": "Shiva's Deer Hunt",
                    "origin": "Vedic",
                    "deity": "Soma / Chandra",
                    "story": "Mrigashira means 'deer's head' and tells the story of Brahma pursuing his own daughter Rohini in the form of a deer (Mriga). Shiva, as Rudra the cosmic hunter, shot an arrow to stop this transgression — the arrow became the three stars of Orion's Belt. This asterism marks the boundary between seeking and finding. Those born under Mrigashira are eternal seekers, always questing for truth but finding it in the journey itself.",
                    "lesson": "The search is the destination. What you seek is seeking you."
                },
                "paths": [
                    [[-0.4,0.3],[0,0],[0.4,0.3]],
                    [[0,0],[0.2,-0.4],[0,-0.8],[-0.2,-0.4],[0,0]],
                ],
            },
            {
                "id": "magha", "name": "Magha (The Mighty One)", "culture_name": "Vedic",
                "ra": 10.14, "dec": 12.0,
                "stars": [
                    {"name": "Regulus (Magha)", "ra": 10.14, "dec": 11.97, "mag": 1.35},
                    {"name": "Algieba", "ra": 10.33, "dec": 19.84, "mag": 2.28},
                    {"name": "Adhafera", "ra": 10.28, "dec": 23.42, "mag": 3.44},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Agni",
                "mythology": {
                    "figure": "The Throne of Kings",
                    "origin": "Vedic",
                    "deity": "Pitris (The Ancestors)",
                    "story": "Magha is ruled by the Pitris — the divine ancestors who guide us from the celestial realm. Regulus, its royal star, has been called 'the heart of the lion' across cultures, but in Vedic astronomy it is the throne from which ancestral blessings flow. Magha Nakshatra bestows authority, leadership, and the power of lineage. The Shradh ceremonies honoring ancestors are timed to this star's movements. Those born under Magha carry the weight and dignity of their entire ancestral line.",
                    "lesson": "You are the living prayer of ancestors who dreamed of your existence. Honor them by living fully."
                },
                "paths": [
                    [[-0.3,-0.2],[0,0],[0.2,0.4],[0,0.8]],
                    [[0,0],[0.4,0],[0.6,0.3]],
                ],
            },
            {
                "id": "swati", "name": "Swati (The Sword)", "culture_name": "Vedic",
                "ra": 14.26, "dec": 19.2,
                "stars": [
                    {"name": "Arcturus (Swati)", "ra": 14.26, "dec": 19.18, "mag": -0.05},
                    {"name": "Muphrid", "ra": 13.91, "dec": 18.4, "mag": 2.68},
                    {"name": "Seginus", "ra": 14.53, "dec": 38.31, "mag": 3.03},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Vayu",
                "mythology": {
                    "figure": "The Independent Star",
                    "origin": "Vedic",
                    "deity": "Vayu (Wind God)",
                    "story": "Swati is ruled by Vayu, the god of wind and breath — prana itself. Arcturus, the brightest star in the northern sky, burns with fierce independence. In Vedic tradition, when a raindrop falls into the ocean during Swati Nakshatra, it becomes a pearl inside an oyster. This is the alchemy of Swati — transforming ordinary experience into precious wisdom. Those born under Swati are fiercely independent, adaptable as the wind, and capable of turning adversity into beauty.",
                    "lesson": "Be like the wind — belong everywhere, cling nowhere. Your freedom is your greatest gift."
                },
                "paths": [
                    [[-0.4,0],[0,0],[0.3,-0.2]],
                    [[0,0],[0.1,0.5],[0.3,1.0]],
                ],
            },
        ],
    },
    "norse": {
        "name": "Norse Sky",
        "color": "#90CAF9",
        "icon": "star",
        "description": "The Norse saw the night sky as a cosmic tapestry woven by the Norns (Fates) upon the branches of Yggdrasil, the World Tree. Stars were sparks from Muspelheim placed by the gods to light the void, and the Milky Way was the Bifrost bridge to Asgard.",
        "constellations": [
            {
                "id": "thors_wagon", "name": "Thor's Wagon (Karlavagnen)", "culture_name": "Norse",
                "ra": 12.0, "dec": 55.0,
                "stars": [
                    {"name": "Dubhe", "ra": 11.06, "dec": 61.75, "mag": 1.79},
                    {"name": "Merak", "ra": 11.03, "dec": 56.38, "mag": 2.37},
                    {"name": "Phecda", "ra": 11.9, "dec": 53.69, "mag": 2.44},
                    {"name": "Megrez", "ra": 12.26, "dec": 57.03, "mag": 3.31},
                    {"name": "Alioth", "ra": 12.9, "dec": 55.96, "mag": 1.77},
                    {"name": "Mizar", "ra": 13.4, "dec": 54.93, "mag": 2.27},
                    {"name": "Alkaid", "ra": 13.79, "dec": 49.31, "mag": 1.86},
                ],
                "lines": [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[3,0]],
                "element": "Lightning",
                "mythology": {
                    "figure": "Thor's Chariot",
                    "origin": "Norse",
                    "deity": "Thor",
                    "story": "The Vikings saw the Big Dipper as Thor's great wagon (Karlavagnen), pulled across the heavens by his two goats, Tanngrisnir and Tanngnjostur. When Thor strikes his hammer Mjolnir upon the chariot's floor, thunder rolls across Midgard. Norse seafarers used the Wagon's pointer stars to find Polaris — the 'Veraldar Nagli' (World Nail) — around which the entire sky pivots. For the Vikings, this constellation was both a spiritual symbol of divine protection and a practical navigation tool that guided them across uncharted oceans.",
                    "lesson": "The mightiest force in the universe also serves as a humble guide. True power is found in service."
                },
                "paths": [
                    [[-0.5,0.3],[0.5,0.3],[0.5,-0.3],[-0.5,-0.3],[-0.5,0.3]],
                    [[0.5,0.3],[0.9,0.5],[1.3,0.3],[1.7,0]],
                ],
            },
            {
                "id": "odins_eye", "name": "Odin's Eye (Thiazi's Eyes)", "culture_name": "Norse",
                "ra": 5.2, "dec": 46.0,
                "stars": [
                    {"name": "Capella (Thiazi)", "ra": 5.28, "dec": 45.99, "mag": 0.08},
                    {"name": "Menkalinan", "ra": 5.99, "dec": 44.95, "mag": 1.9},
                    {"name": "Mahasim", "ra": 5.99, "dec": 37.21, "mag": 2.69},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Wisdom",
                "mythology": {
                    "figure": "The Giant's Eyes",
                    "origin": "Norse",
                    "deity": "Odin / Thiazi",
                    "story": "When the frost giant Thiazi was slain by the Aesir for kidnapping Idun and her golden apples of immortality, his daughter Skadi came to Asgard seeking vengeance. As a peace offering, Odin took Thiazi's eyes and cast them into the sky as two brilliant stars. Capella, one of the brightest stars visible, is Thiazi's gleaming eye watching over Midgard for eternity. This asterism reminds us that even in death, the giant's gaze endures — watching, protecting, remembering.",
                    "lesson": "What we lose in one realm, we gain in another. Death is not an ending but a transformation of form."
                },
                "paths": [
                    [[-0.3,0],[0,0],[0.3,0]],
                    [[0,0],[0.2,-0.5],[0,-0.9]],
                ],
            },
            {
                "id": "freyjas_distaff", "name": "Freyja's Distaff (Friggerock)", "culture_name": "Norse",
                "ra": 5.6, "dec": 0.0,
                "stars": [
                    {"name": "Alnilam", "ra": 5.6, "dec": -1.2, "mag": 1.69},
                    {"name": "Alnitak", "ra": 5.68, "dec": -1.94, "mag": 1.77},
                    {"name": "Mintaka", "ra": 5.53, "dec": -0.3, "mag": 2.23},
                ],
                "lines": [[0,1],[1,2],[2,0]],
                "element": "Fate",
                "mythology": {
                    "figure": "The Spindle of Fate",
                    "origin": "Norse",
                    "deity": "Freyja / Frigg",
                    "story": "Orion's Belt was known to the Norse as Freyja's Distaff (Friggerock) — the spinning tool of the goddess of love, beauty, and destiny. Freyja spins the threads of fate alongside the Norns at the roots of Yggdrasil. The three aligned stars represent the cosmic spindle upon which all destinies are wound. Warriors who died bravely were chosen by Freyja to join her in Folkvangr. When you see these three stars in perfect alignment, remember: your thread of fate is being woven right now.",
                    "lesson": "You cannot choose the thread given to you, but you can choose how bravely you weave it."
                },
                "paths": [
                    [[-0.2,0.1],[0,0],[0.2,0.1]],
                    [[-0.2,0.1],[0,0.3],[0.2,0.1]],
                ],
            },
            {
                "id": "fenrir", "name": "Fenrir (The Great Wolf)", "culture_name": "Norse",
                "ra": 6.75, "dec": -16.7,
                "stars": [
                    {"name": "Sirius (Fenrir's Eye)", "ra": 6.75, "dec": -16.72, "mag": -1.46},
                    {"name": "Mirzam", "ra": 6.38, "dec": -17.96, "mag": 1.98},
                    {"name": "Adhara", "ra": 6.98, "dec": -28.97, "mag": 1.5},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Chaos",
                "mythology": {
                    "figure": "The Bound Wolf",
                    "origin": "Norse",
                    "deity": "Fenrir / Loki's Son",
                    "story": "Sirius, the brightest star in the sky, was seen by some Norse traditions as the blazing eye of Fenrir, the great cosmic wolf bound by the gods with the magical ribbon Gleipnir. Son of Loki and the giantess Angrboda, Fenrir grows ever larger and will one day break free at Ragnarok to swallow Odin himself. The star's fierce brilliance is a reminder of primal power restrained but never extinguished. Fenrir teaches that what we chain within ourselves only grows stronger — better to transform it than to bind it.",
                    "lesson": "What you suppress does not disappear — it grows in the dark. Face your shadow before it breaks its chains."
                },
                "paths": [
                    [[0,0],[-0.4,0.3],[-0.7,0.2]],
                    [[0,0],[0.3,-0.5],[0.1,-1.0]],
                    [[-0.4,0.3],[-0.3,0.7]],
                ],
            },
            {
                "id": "bifrost", "name": "Bifrost (The Rainbow Bridge)", "culture_name": "Norse",
                "ra": 20.7, "dec": 45.3,
                "stars": [
                    {"name": "Deneb (Bifrost Gate)", "ra": 20.69, "dec": 45.28, "mag": 1.25},
                    {"name": "Sadr", "ra": 20.37, "dec": 40.26, "mag": 2.2},
                    {"name": "Albireo", "ra": 19.51, "dec": 27.96, "mag": 3.18},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Bridge",
                "mythology": {
                    "figure": "The Bridge Between Worlds",
                    "origin": "Norse",
                    "deity": "Heimdall",
                    "story": "The Milky Way was known to the Norse as Bifrost — the burning rainbow bridge connecting Midgard (Earth) to Asgard (realm of the gods). At its peak stands Deneb, marking the Asgard gate guarded eternally by Heimdall, the watchman of the gods, whose horn Gjallarhorn will sound at Ragnarok. The Cygnus cross-shape embedded in the Milky Way reinforced this image of a celestial crossing point. Norse shamans believed that during deep trance, the soul could travel Bifrost to commune with the gods.",
                    "lesson": "Between every world lies a bridge. Between every ending and beginning, between grief and joy — Bifrost waits for those brave enough to cross."
                },
                "paths": [
                    [[0,0.5],[0,0],[0,-0.5],[0,-1.0]],
                    [[-0.4,0],[0,0],[0.4,0]],
                ],
            },
        ],
    },
    "polynesian": {
        "name": "Polynesian Sky",
        "color": "#26C6DA",
        "icon": "star",
        "description": "Polynesian navigators crossed the vast Pacific Ocean using only stars, ocean swells, and bird flights. Their star knowledge — passed down orally for millennia — represents humanity's greatest feat of non-instrument navigation, spanning millions of square miles of open ocean.",
        "constellations": [
            {
                "id": "hokulea", "name": "Hokule'a (Star of Joy)", "culture_name": "Polynesian",
                "ra": 14.26, "dec": 19.2,
                "stars": [
                    {"name": "Arcturus (Hokule'a)", "ra": 14.26, "dec": 19.18, "mag": -0.05},
                    {"name": "Muphrid", "ra": 13.91, "dec": 18.4, "mag": 2.68},
                    {"name": "Izar", "ra": 14.75, "dec": 27.07, "mag": 2.37},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Navigation",
                "mythology": {
                    "figure": "The Zenith Star of Hawaii",
                    "origin": "Polynesian",
                    "deity": "Kanaloa (God of the Ocean)",
                    "story": "Hokule'a — 'Star of Joy' — is Arcturus, the zenith star of Hawaii. When this star passes directly overhead, a navigator knows they have reached the latitude of the Hawaiian Islands. The famous voyaging canoe Hokule'a was named after this star and has sailed over 150,000 nautical miles using traditional Polynesian navigation. To the ancient Hawaiians, Hokule'a was a beacon of hope — proof that the ancestors had found paradise, and a promise that the way home could always be found by looking up.",
                    "lesson": "You carry your compass within. Trust the star that shines directly above your heart — it knows where home is."
                },
                "paths": [
                    [[-0.3,0],[0,0],[0.4,0.4]],
                    [[0,0],[0,0.5]],
                ],
            },
            {
                "id": "matariki", "name": "Matariki (The Pleiades)", "culture_name": "Polynesian",
                "ra": 3.79, "dec": 24.1,
                "stars": [
                    {"name": "Alcyone (Matariki)", "ra": 3.79, "dec": 24.1, "mag": 2.87},
                    {"name": "Atlas", "ra": 3.82, "dec": 24.05, "mag": 3.62},
                    {"name": "Electra", "ra": 3.75, "dec": 24.11, "mag": 3.7},
                ],
                "lines": [[0,1],[0,2],[1,2]],
                "element": "Renewal",
                "mythology": {
                    "figure": "The Eyes of God",
                    "origin": "Polynesian (Maori)",
                    "deity": "Tane (God of Forests and Light)",
                    "story": "Matariki (the Pleiades) marks the Maori New Year when this star cluster rises just before dawn in late June. The nine stars of Matariki are seen as a mother surrounded by her children, each star governing a different aspect of wellbeing: Matariki (health), Tupuanuku (food from the earth), Tupuarangi (food from the sky), Waiti (freshwater), Waita (saltwater), Waipuna-a-rangi (rain), Ururangi (winds), Pohutukawa (the dead), and Hiwa-i-te-rangi (wishes). Maori traditions include lighting fires, singing, and setting intentions for the coming year.",
                    "lesson": "Every ending births a beginning. The darkest night of the year holds the seeds of all that will bloom."
                },
                "paths": [
                    [[-0.2,0.2],[0,0],[0.2,0.2]],
                    [[0,0],[0,-0.3]],
                    [[-0.2,0.2],[0,0.4],[0.2,0.2]],
                ],
            },
            {
                "id": "newe", "name": "Newe (The Southern Cross)", "culture_name": "Polynesian",
                "ra": 12.45, "dec": -63.1,
                "stars": [
                    {"name": "Acrux (Newe)", "ra": 12.44, "dec": -63.1, "mag": 0.76},
                    {"name": "Mimosa", "ra": 12.79, "dec": -59.69, "mag": 1.25},
                    {"name": "Gacrux", "ra": 12.52, "dec": -57.11, "mag": 1.63},
                ],
                "lines": [[0,2],[1,0]],
                "element": "Direction",
                "mythology": {
                    "figure": "The Anchor of the Sky Canoe",
                    "origin": "Polynesian (Tongan)",
                    "deity": "Maui (Demigod)",
                    "story": "The Southern Cross was the most important constellation for Polynesian navigators sailing south. In Tongan tradition, it is 'Toloa' — a duck flying south. In Hawaiian tradition, the four stars form 'Newe' — the anchor that holds the great celestial canoe of Maui in place. By extending the long axis of the cross 4.5 times, navigators could find true south — essential for crossing the equator. The Southern Cross guided the greatest ocean migration in human history, as Polynesian wayfinders settled every habitable island in the Pacific.",
                    "lesson": "The smallest constellation can guide you across the largest ocean. Never underestimate what is small but true."
                },
                "paths": [
                    [[0,0.5],[0,-0.5]],
                    [[-0.4,0],[0.4,0]],
                ],
            },
            {
                "id": "manaiakalani", "name": "Manaiakalani (The Chief's Fishhook)", "culture_name": "Polynesian",
                "ra": 16.9, "dec": -26.0,
                "stars": [
                    {"name": "Antares (Ka Hei Hei)", "ra": 16.49, "dec": -26.43, "mag": 0.96},
                    {"name": "Shaula", "ra": 17.56, "dec": -37.1, "mag": 1.63},
                    {"name": "Sargas", "ra": 17.62, "dec": -43.0, "mag": 1.87},
                ],
                "lines": [[0,1],[1,2]],
                "element": "Creation",
                "mythology": {
                    "figure": "Maui's Fishhook",
                    "origin": "Polynesian (Hawaiian)",
                    "deity": "Maui (Demigod)",
                    "story": "Manaiakalani is the magical fishhook of the demigod Maui, cast into the deep ocean to pull up new lands from the sea floor. With this hook, Maui fished up the Hawaiian Islands, the North Island of New Zealand, and islands across the Pacific. The scorpion's tail stars form the hook's curve. The story teaches that new worlds are not discovered — they are pulled from the depths by courage and determination. Every Polynesian island is a testament to Maui's fishhook and the audacity of those who followed the stars across the unknown.",
                    "lesson": "The land beneath your feet was once hidden in the deep. What you need already exists — you just have to be brave enough to pull it up."
                },
                "paths": [
                    [[0,0.3],[-0.2,0],[0,-0.3],[0.3,-0.5],[0.4,-0.8],[0.2,-1.0],[0,-0.9],[-0.2,-0.7]],
                ],
            },
            {
                "id": "ka_iwikuamoo", "name": "Ka Iwikuamo'o (The Backbone)", "culture_name": "Polynesian",
                "ra": 18.6, "dec": 38.0,
                "stars": [
                    {"name": "Vega (Ka Hoku Ho'okele)", "ra": 18.62, "dec": 38.78, "mag": 0.03},
                    {"name": "Deneb", "ra": 20.69, "dec": 45.28, "mag": 1.25},
                    {"name": "Altair (Humu)", "ra": 19.85, "dec": 8.87, "mag": 0.77},
                ],
                "lines": [[0,1],[0,2]],
                "element": "Sky Path",
                "mythology": {
                    "figure": "The Milky Way Backbone",
                    "origin": "Polynesian (Hawaiian)",
                    "deity": "Wakea (Sky Father)",
                    "story": "Ka Iwikuamo'o — 'The Backbone of the Lizard' — is the Hawaiian name for the Milky Way, seen as the spine of a great celestial lizard stretching across the heavens. Vega, Deneb, and Altair (the Summer Triangle) form the key waypoints along this backbone. Vega (Ka Hoku Ho'okele, the 'steering star') was one of the most important navigation stars. The Milky Way itself served as a grand celestial highway, with Hawaiian navigators using its orientation to determine direction, season, and latitude. The backbone connects all things — earth to sky, island to island, mortal to divine.",
                    "lesson": "You are a vertebra in the backbone of the universe. Without you, the great body of creation would be incomplete."
                },
                "paths": [
                    [[-0.5,0.3],[0,0],[0.5,-0.5]],
                    [[0,0],[0.3,0.3]],
                ],
            },
        ],
    },
}

# Merge extended cultures (Greek, Japanese, Yoruba, Celtic, Inuit, Aztec, Sumerian, Persian, Bantu, Native American, Slavic, Maori)
CULTURAL_CONSTELLATIONS.update(EXTENDED_CULTURES)


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
