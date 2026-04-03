"""
Multi-Civilization Star Charts — Culture Layers for Nexus Nebula
Lazy-loaded JSON data for Hopi, Egyptian, and Vedic star systems.
"""
from fastapi import APIRouter, Depends
from deps import get_current_user

router = APIRouter(prefix="/culture-layers", tags=["culture-layers"])

# ━━━ Hopi Star Knowledge ━━━
HOPI_LAYER = {
    "id": "hopi",
    "name": "Hopi Star Knowledge",
    "culture": "Hopi (Hopituh Shi-nu-mu)",
    "description": "The Hopi see the stars as the homes of the Kachina spirits. Their three mesas align with Orion's Belt, reflecting the 'As Above, So Below' principle.",
    "primary_color": "#D97706",
    "accent_color": "#F59E0B",
    "frequency": 432,
    "constellations": [
        {
            "id": "hopi_orion",
            "name": "Hotomkam",
            "meaning": "Three Stars (Orion's Belt)",
            "significance": "The three Hopi mesas mirror Orion's Belt stars, linking earth to sky.",
            "stars": [
                {"name": "Alnitak", "ra": 5.679, "dec": -1.943, "magnitude": 1.74, "element": "Fire"},
                {"name": "Alnilam", "ra": 5.603, "dec": -1.202, "magnitude": 1.69, "element": "Fire"},
                {"name": "Mintaka", "ra": 5.533, "dec": -0.299, "magnitude": 2.23, "element": "Fire"},
            ],
            "line_connections": [[0, 1], [1, 2]],
        },
        {
            "id": "hopi_pleiades",
            "name": "Tsootsma",
            "meaning": "The Harmonious Ones",
            "significance": "The Pleiades mark the time of the Wuwuchim ceremony, a rite of spiritual rebirth.",
            "stars": [
                {"name": "Alcyone", "ra": 3.791, "dec": 24.105, "magnitude": 2.87, "element": "Air"},
                {"name": "Maia", "ra": 3.771, "dec": 24.367, "magnitude": 3.87, "element": "Air"},
                {"name": "Electra", "ra": 3.749, "dec": 24.113, "magnitude": 3.7, "element": "Air"},
                {"name": "Taygeta", "ra": 3.761, "dec": 24.467, "magnitude": 4.29, "element": "Air"},
                {"name": "Merope", "ra": 3.772, "dec": 23.948, "magnitude": 4.18, "element": "Water"},
                {"name": "Celaeno", "ra": 3.744, "dec": 24.289, "magnitude": 5.45, "element": "Water"},
                {"name": "Atlas", "ra": 3.819, "dec": 24.053, "magnitude": 3.62, "element": "Earth"},
            ],
            "line_connections": [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6]],
        },
        {
            "id": "hopi_sirius",
            "name": "Blue Star Kachina",
            "meaning": "Saquasohuh",
            "significance": "The Blue Star Kachina prophecy speaks of a day of purification when the star reveals itself.",
            "stars": [
                {"name": "Sirius", "ra": 6.752, "dec": -16.716, "magnitude": -1.46, "element": "Water"},
            ],
            "line_connections": [],
        },
    ],
    "teachings": [
        "The stars are not distant — they are our relatives watching over us.",
        "As the Kachina return to the mesas each winter, so do the stars return to guide us.",
        "The Fourth World is illuminated by the same stars that lit the First.",
    ],
}

# ━━━ Egyptian Star Wisdom ━━━
EGYPTIAN_LAYER = {
    "id": "egyptian",
    "name": "Egyptian Star Wisdom",
    "culture": "Kemet (Ancient Egypt)",
    "description": "The Egyptians aligned their pyramids and temples with stellar precision. The Nile mirrored the Milky Way, creating a sacred geography linking earth to the Duat (afterlife realm).",
    "primary_color": "#B45309",
    "accent_color": "#D97706",
    "frequency": 528,
    "constellations": [
        {
            "id": "egypt_osiris",
            "name": "Sah (Osiris)",
            "meaning": "The Lord of the Duat",
            "significance": "Orion represented Osiris, god of the afterlife. The Great Pyramid's southern shaft aligns with Orion's Belt.",
            "stars": [
                {"name": "Betelgeuse", "ra": 5.919, "dec": 7.407, "magnitude": 0.42, "element": "Fire"},
                {"name": "Rigel", "ra": 5.242, "dec": -8.202, "magnitude": 0.13, "element": "Water"},
                {"name": "Bellatrix", "ra": 5.418, "dec": 6.350, "magnitude": 1.64, "element": "Air"},
                {"name": "Saiph", "ra": 5.795, "dec": -9.670, "magnitude": 2.09, "element": "Earth"},
                {"name": "Alnitak", "ra": 5.679, "dec": -1.943, "magnitude": 1.74, "element": "Fire"},
                {"name": "Alnilam", "ra": 5.603, "dec": -1.202, "magnitude": 1.69, "element": "Fire"},
                {"name": "Mintaka", "ra": 5.533, "dec": -0.299, "magnitude": 2.23, "element": "Fire"},
            ],
            "line_connections": [[0, 2], [2, 4], [4, 5], [5, 6], [6, 3], [3, 1], [0, 4], [1, 6]],
        },
        {
            "id": "egypt_isis",
            "name": "Sopdet (Isis)",
            "meaning": "The Star of the Nile",
            "significance": "Sirius (Sopdet) heralded the annual flooding of the Nile. Its heliacal rising marked the Egyptian New Year.",
            "stars": [
                {"name": "Sirius", "ra": 6.752, "dec": -16.716, "magnitude": -1.46, "element": "Water"},
                {"name": "Mirzam", "ra": 6.378, "dec": -17.956, "magnitude": 1.98, "element": "Water"},
            ],
            "line_connections": [[0, 1]],
        },
        {
            "id": "egypt_thoth",
            "name": "Meskhetiu (Thoth's Leg)",
            "meaning": "The Bull's Foreleg (Ursa Major)",
            "significance": "Represented the leg of Set, held in place by Isis. The circumpolar stars symbolized eternal life.",
            "stars": [
                {"name": "Dubhe", "ra": 11.062, "dec": 61.751, "magnitude": 1.79, "element": "Earth"},
                {"name": "Merak", "ra": 11.031, "dec": 56.383, "magnitude": 2.37, "element": "Earth"},
                {"name": "Phecda", "ra": 11.897, "dec": 53.695, "magnitude": 2.44, "element": "Air"},
                {"name": "Megrez", "ra": 12.257, "dec": 57.033, "magnitude": 3.31, "element": "Air"},
                {"name": "Alioth", "ra": 12.900, "dec": 55.960, "magnitude": 1.77, "element": "Fire"},
                {"name": "Mizar", "ra": 13.399, "dec": 54.926, "magnitude": 2.27, "element": "Fire"},
                {"name": "Alkaid", "ra": 13.792, "dec": 49.313, "magnitude": 1.86, "element": "Fire"},
            ],
            "line_connections": [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]],
        },
    ],
    "teachings": [
        "The stars do not die — they descend into the Duat and rise again, as all souls do.",
        "Sopdet brings the flood. The flood brings life. Life returns to the stars.",
        "To know the heavens is to know the path through the Hall of Ma'at.",
    ],
}

# ━━━ Vedic Star Science ━━━
VEDIC_LAYER = {
    "id": "vedic",
    "name": "Vedic Jyotish",
    "culture": "Bharatiya (Vedic India)",
    "description": "Jyotish — the 'Science of Light' — divides the sky into 27 Nakshatras (lunar mansions). Each Nakshatra carries a deity, a Shakti (power), and a specific influence on consciousness.",
    "primary_color": "#7C3AED",
    "accent_color": "#A78BFA",
    "frequency": 741,
    "constellations": [
        {
            "id": "vedic_ashwini",
            "name": "Ashwini",
            "meaning": "The Horse Riders",
            "significance": "Ruled by the Ashwin twins, physicians of the gods. Governs healing, speed, and new beginnings. Shakti: the power to reach things quickly.",
            "stars": [
                {"name": "Hamal", "ra": 2.120, "dec": 23.462, "magnitude": 2.00, "element": "Fire"},
                {"name": "Sheratan", "ra": 1.911, "dec": 20.808, "magnitude": 2.64, "element": "Fire"},
                {"name": "Mesarthim", "ra": 1.898, "dec": 19.294, "magnitude": 3.88, "element": "Fire"},
            ],
            "line_connections": [[0, 1], [1, 2]],
        },
        {
            "id": "vedic_rohini",
            "name": "Rohini",
            "meaning": "The Red One",
            "significance": "Ruled by Prajapati. The birth star of Krishna. Governs growth, fertility, and artistic creation. Shakti: the power of creation.",
            "stars": [
                {"name": "Aldebaran", "ra": 4.599, "dec": 16.509, "magnitude": 0.85, "element": "Earth"},
                {"name": "Theta Tauri", "ra": 4.478, "dec": 15.870, "magnitude": 3.84, "element": "Earth"},
                {"name": "Gamma Tauri", "ra": 4.330, "dec": 15.628, "magnitude": 3.65, "element": "Earth"},
                {"name": "Delta Tauri", "ra": 4.383, "dec": 17.542, "magnitude": 3.76, "element": "Earth"},
                {"name": "Epsilon Tauri", "ra": 4.477, "dec": 19.180, "magnitude": 3.53, "element": "Earth"},
            ],
            "line_connections": [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]],
        },
        {
            "id": "vedic_pushya",
            "name": "Pushya",
            "meaning": "The Nourisher",
            "significance": "Ruled by Brihaspati (Jupiter). The most auspicious Nakshatra. Governs spiritual nourishment and dharma. Shakti: the power to create spiritual energy.",
            "stars": [
                {"name": "Asellus Borealis", "ra": 8.745, "dec": 21.469, "magnitude": 4.66, "element": "Water"},
                {"name": "Asellus Australis", "ra": 8.728, "dec": 18.154, "magnitude": 3.94, "element": "Water"},
                {"name": "Praesepe M44", "ra": 8.667, "dec": 19.983, "magnitude": 3.7, "element": "Water"},
            ],
            "line_connections": [[0, 2], [2, 1]],
        },
        {
            "id": "vedic_swati",
            "name": "Swati",
            "meaning": "The Independent One",
            "significance": "Ruled by Vayu (Wind God). A single star: Arcturus. Governs freedom, trade, and movement. Shakti: the power to scatter like the wind.",
            "stars": [
                {"name": "Arcturus", "ra": 14.261, "dec": 19.183, "magnitude": -0.05, "element": "Air"},
            ],
            "line_connections": [],
        },
    ],
    "teachings": [
        "Jyotish is not prediction — it is illumination. The stars show what is, not what must be.",
        "Each Nakshatra is a door. The Moon walks through 27 doors in one cycle, gathering wisdom.",
        "The cosmic Prana flows through the Nakshatras as blood flows through the nadis of the body.",
    ],
}

CULTURE_LAYERS = {
    "hopi": HOPI_LAYER,
    "egyptian": EGYPTIAN_LAYER,
    "vedic": VEDIC_LAYER,
}


@router.get("/")
async def list_culture_layers(user=Depends(get_current_user)):
    """List available culture layers (metadata only — no constellation data)."""
    layers = []
    for key, layer in CULTURE_LAYERS.items():
        layers.append({
            "id": layer["id"],
            "name": layer["name"],
            "culture": layer["culture"],
            "description": layer["description"],
            "primary_color": layer["primary_color"],
            "accent_color": layer["accent_color"],
            "frequency": layer["frequency"],
            "constellation_count": len(layer["constellations"]),
            "teaching_count": len(layer["teachings"]),
        })
    return {"layers": layers}


@router.get("/{layer_id}")
async def get_culture_layer(layer_id: str, user=Depends(get_current_user)):
    """Lazy-load a specific culture layer with full constellation data."""
    layer = CULTURE_LAYERS.get(layer_id)
    if not layer:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Culture layer '{layer_id}' not found")
    return layer
