from fastapi import APIRouter, Depends, Body
from deps import db, get_current_user, get_current_user_optional, logger
from datetime import datetime, timezone, timedelta
import math

router = APIRouter()

# ━━━ Planet Electromagnetic Frequencies (NASA Voyager data, scaled to audible) ━━━
PLANET_FREQUENCIES = {
    "mercury": {"hz": 282.4, "color": "#94A3B8", "orbital_speed_km_s": 47.4, "distance_au": 0.39, "desc": "Swift messenger, closest to the sun"},
    "venus": {"hz": 221.2, "color": "#FBBF24", "orbital_speed_km_s": 35.0, "distance_au": 0.72, "desc": "Morning star, shrouded in clouds"},
    "earth": {"hz": 194.2, "color": "#22C55E", "orbital_speed_km_s": 29.8, "distance_au": 1.0, "desc": "Our home, the pale blue dot"},
    "mars": {"hz": 144.7, "color": "#EF4444", "orbital_speed_km_s": 24.1, "distance_au": 1.52, "desc": "The red planet, iron oxide surface"},
    "jupiter": {"hz": 183.6, "color": "#FB923C", "orbital_speed_km_s": 13.1, "distance_au": 5.2, "desc": "Gas giant, Great Red Spot storms"},
    "saturn": {"hz": 147.9, "color": "#FBBF24", "orbital_speed_km_s": 9.7, "distance_au": 9.54, "desc": "Ringed wonder, hexagonal north pole"},
    "uranus": {"hz": 207.4, "color": "#06B6D4", "orbital_speed_km_s": 6.8, "distance_au": 19.2, "desc": "Ice giant, tilted 98 degrees"},
    "neptune": {"hz": 211.4, "color": "#3B82F6", "orbital_speed_km_s": 5.4, "distance_au": 30.1, "desc": "Deep blue, fastest winds in solar system"},
}

# ━━━ Notable Stars with Light-Time Distances ━━━
NOTABLE_STARS = [
    {"name": "Sirius", "distance_ly": 8.6, "magnitude": -1.46, "color": "#E0F2FE", "constellation": "Canis Major", "temp_k": 9940},
    {"name": "Betelgeuse", "distance_ly": 700, "magnitude": 0.42, "color": "#EF4444", "constellation": "Orion", "temp_k": 3600},
    {"name": "Rigel", "distance_ly": 860, "magnitude": 0.13, "color": "#93C5FD", "constellation": "Orion", "temp_k": 12100},
    {"name": "Vega", "distance_ly": 25, "magnitude": 0.03, "color": "#F0F9FF", "constellation": "Lyra", "temp_k": 9600},
    {"name": "Polaris", "distance_ly": 433, "magnitude": 1.98, "color": "#FEF3C7", "constellation": "Ursa Minor", "temp_k": 6015},
    {"name": "Aldebaran", "distance_ly": 65, "magnitude": 0.85, "color": "#FB923C", "constellation": "Taurus", "temp_k": 3900},
    {"name": "Antares", "distance_ly": 550, "magnitude": 1.09, "color": "#EF4444", "constellation": "Scorpius", "temp_k": 3400},
    {"name": "Arcturus", "distance_ly": 37, "magnitude": -0.05, "color": "#F59E0B", "constellation": "Bootes", "temp_k": 4290},
    {"name": "Canopus", "distance_ly": 310, "magnitude": -0.74, "color": "#FEF9C3", "constellation": "Carina", "temp_k": 7350},
    {"name": "Proxima Centauri", "distance_ly": 4.24, "magnitude": 11.05, "color": "#EF4444", "constellation": "Centaurus", "temp_k": 3042},
]

# ━━━ Western Constellations with Mythology ━━━
CONSTELLATIONS = [
    {"id": "orion", "name": "Orion", "latin": "Orion", "abbr": "Ori", "season": "Winter",
     "ra_center": 5.5, "dec_center": 0, "area_sq_deg": 594, "color": "#60A5FA",
     "bright_stars": ["Betelgeuse", "Rigel", "Bellatrix", "Mintaka", "Alnilam", "Alnitak"],
     "mythology": "The great hunter of Greek myth. Son of Poseidon, he could walk on water. Placed in the sky by Zeus after being killed by a scorpion sent by Gaia. His belt of three stars (Mintaka, Alnilam, Alnitak) is one of the most recognizable patterns in the night sky. Orion eternally chases the Pleiades across the heavens.",
     "deep_sky": ["M42 (Orion Nebula)", "M43", "Horsehead Nebula (B33)"],
     "best_viewing": "December-February, visible worldwide"},
    {"id": "ursa_major", "name": "Ursa Major", "latin": "Ursa Major", "abbr": "UMa", "season": "Spring",
     "ra_center": 11, "dec_center": 55, "area_sq_deg": 1280, "color": "#FBBF24",
     "bright_stars": ["Dubhe", "Merak", "Phecda", "Megrez", "Alioth", "Mizar", "Alkaid"],
     "mythology": "The Great Bear. Callisto, a nymph of Artemis, was transformed into a bear by Zeus's jealous wife Hera. Zeus placed her in the sky to save her from hunters. The Big Dipper (Plough) forms the bear's hindquarters and tail. The pointer stars (Dubhe and Merak) aim directly at Polaris.",
     "deep_sky": ["M81 (Bode's Galaxy)", "M82 (Cigar Galaxy)", "M101 (Pinwheel Galaxy)"],
     "best_viewing": "Year-round from Northern Hemisphere, circumpolar above 41°N"},
    {"id": "scorpius", "name": "Scorpius", "latin": "Scorpius", "abbr": "Sco", "season": "Summer",
     "ra_center": 16.9, "dec_center": -30, "area_sq_deg": 497, "color": "#EF4444",
     "bright_stars": ["Antares", "Shaula", "Sargas", "Dschubba", "Graffias"],
     "mythology": "The scorpion that killed Orion. Sent by Gaia (Earth goddess) to punish Orion's boast that he could kill every animal on Earth. Zeus placed them on opposite sides of the sky — when Scorpius rises in the east, Orion sets in the west. They never appear together. Antares ('rival of Mars') is its blood-red heart.",
     "deep_sky": ["M4 (globular cluster)", "M7 (Ptolemy Cluster)", "M80"],
     "best_viewing": "June-August, best from southern latitudes"},
    {"id": "leo", "name": "Leo", "latin": "Leo", "abbr": "Leo", "season": "Spring",
     "ra_center": 10.7, "dec_center": 15, "area_sq_deg": 947, "color": "#F59E0B",
     "bright_stars": ["Regulus", "Denebola", "Algieba", "Zosma"],
     "mythology": "The Nemean Lion, first of Heracles' twelve labors. Its golden fur was impervious to mortal weapons. Heracles strangled it with his bare hands and wore its pelt as armor. Zeus placed the lion in the sky to honor the beast's ferocity. Regulus ('little king') marks the lion's heart.",
     "deep_sky": ["M65", "M66", "M95", "M96 (Leo Triplet galaxies)"],
     "best_viewing": "March-May"},
    {"id": "cassiopeia", "name": "Cassiopeia", "latin": "Cassiopeia", "abbr": "Cas", "season": "Autumn",
     "ra_center": 1, "dec_center": 60, "area_sq_deg": 598, "color": "#EC4899",
     "bright_stars": ["Schedar", "Caph", "Gamma Cas", "Ruchbah", "Segin"],
     "mythology": "The vain queen of Ethiopia who boasted her beauty surpassed the sea nymphs. Poseidon punished her by chaining her daughter Andromeda to a rock for a sea monster. Cassiopeia was placed in the sky on her throne, condemned to circle the pole upside-down for half the year as eternal humiliation. Her W-shape is unmistakable.",
     "deep_sky": ["M52", "M103", "NGC 457 (Owl Cluster)"],
     "best_viewing": "Year-round from Northern Hemisphere, circumpolar"},
    {"id": "taurus", "name": "Taurus", "latin": "Taurus", "abbr": "Tau", "season": "Winter",
     "ra_center": 4.7, "dec_center": 18, "area_sq_deg": 797, "color": "#FB923C",
     "bright_stars": ["Aldebaran", "Elnath", "Alcyone (Pleiades)"],
     "mythology": "Zeus disguised himself as a magnificent white bull to abduct Europa, princess of Phoenicia. She climbed onto his back; he swam to Crete. The Pleiades (Seven Sisters) ride on the bull's shoulder — daughters of Atlas, placed in the sky to escape Orion's pursuit. Aldebaran, the bull's fiery eye, guards the Hyades cluster.",
     "deep_sky": ["M1 (Crab Nebula)", "M45 (Pleiades)", "Hyades cluster"],
     "best_viewing": "November-January"},
    {"id": "gemini", "name": "Gemini", "latin": "Gemini", "abbr": "Gem", "season": "Winter",
     "ra_center": 7, "dec_center": 22, "area_sq_deg": 514, "color": "#A78BFA",
     "bright_stars": ["Castor", "Pollux", "Alhena", "Tejat"],
     "mythology": "The twin brothers Castor and Pollux (Dioscuri). Castor was mortal, Pollux was divine (son of Zeus). When Castor died, Pollux begged Zeus to share his immortality. Zeus placed them together as stars — inseparable in death as in life. Sailors prayed to them for protection. Pollux is the brighter twin.",
     "deep_sky": ["M35 (open cluster)", "Eskimo Nebula (NGC 2392)"],
     "best_viewing": "January-March"},
    {"id": "virgo", "name": "Virgo", "latin": "Virgo", "abbr": "Vir", "season": "Spring",
     "ra_center": 13.4, "dec_center": -4, "area_sq_deg": 1294, "color": "#22C55E",
     "bright_stars": ["Spica", "Vindemiatrix", "Porrima"],
     "mythology": "Associated with Demeter (goddess of harvest) or her daughter Persephone. When Persephone was taken to the underworld by Hades, Demeter's grief caused winter. Virgo sets in autumn (harvest ends) and rises in spring (life returns). Spica ('ear of wheat') represents the grain she holds. The second-largest constellation.",
     "deep_sky": ["Virgo Cluster (1,300+ galaxies)", "M49", "M87 (supermassive black hole imaged 2019)"],
     "best_viewing": "April-June"},
    {"id": "aquila", "name": "Aquila", "latin": "Aquila", "abbr": "Aql", "season": "Summer",
     "ra_center": 19.8, "dec_center": 3, "area_sq_deg": 652, "color": "#D4AF37",
     "bright_stars": ["Altair", "Tarazed", "Alshain"],
     "mythology": "Zeus's eagle, who carried his thunderbolts and abducted Ganymede to serve as cupbearer of the gods. Altair forms part of the Summer Triangle with Vega (Lyra) and Deneb (Cygnus). In Chinese mythology, Altair is the Cowherd, separated from his love Vega (the Weaver Girl) by the Milky Way.",
     "deep_sky": ["NGC 6709", "NGC 6755"],
     "best_viewing": "July-September"},
    {"id": "cygnus", "name": "Cygnus", "latin": "Cygnus", "abbr": "Cyg", "season": "Summer",
     "ra_center": 20.6, "dec_center": 42, "area_sq_deg": 804, "color": "#F0F9FF",
     "bright_stars": ["Deneb", "Sadr", "Gienah", "Albireo"],
     "mythology": "The Swan. Zeus disguised himself as a swan to seduce Leda, queen of Sparta. Their union produced Helen (of Troy) and the twins Castor and Pollux. The Northern Cross asterism forms the swan's body. Deneb ('tail') is one of the most luminous stars visible — 200,000x the Sun's brightness, 2,600 light-years away.",
     "deep_sky": ["North America Nebula (NGC 7000)", "Veil Nebula", "Cygnus X-1 (black hole)"],
     "best_viewing": "July-October"},
    {"id": "lyra", "name": "Lyra", "latin": "Lyra", "abbr": "Lyr", "season": "Summer",
     "ra_center": 18.9, "dec_center": 36, "area_sq_deg": 286, "color": "#C084FC",
     "bright_stars": ["Vega", "Sheliak", "Sulafat"],
     "mythology": "The lyre of Orpheus, greatest musician in Greek myth. His music could charm animals, move trees, and halt rivers. When his wife Eurydice died, he played so beautifully that Hades allowed her to return — but Orpheus looked back too soon and lost her forever. Zeus placed his lyre among the stars. Vega will be the North Star in 12,000 years.",
     "deep_sky": ["M57 (Ring Nebula)", "M56"],
     "best_viewing": "June-September"},
    {"id": "sagittarius", "name": "Sagittarius", "latin": "Sagittarius", "abbr": "Sgr", "season": "Summer",
     "ra_center": 19, "dec_center": -25, "area_sq_deg": 867, "color": "#F97316",
     "bright_stars": ["Kaus Australis", "Nunki", "Ascella", "Kaus Media"],
     "mythology": "The Archer — a centaur aiming his bow at the heart of Scorpius. Often identified with Chiron, the wise centaur who tutored Achilles, Heracles, and Asclepius. The 'Teapot' asterism is easier to spot than the centaur. The center of our Milky Way galaxy lies in the direction of Sagittarius — Sagittarius A* is the supermassive black hole 26,000 light-years away.",
     "deep_sky": ["M8 (Lagoon Nebula)", "M17 (Omega Nebula)", "M20 (Trifid Nebula)", "Sagittarius A*"],
     "best_viewing": "July-August, best from southern latitudes"},
    {"id": "canis_major", "name": "Canis Major", "latin": "Canis Major", "abbr": "CMa", "season": "Winter",
     "ra_center": 6.8, "dec_center": -22, "area_sq_deg": 380, "color": "#E0F2FE",
     "bright_stars": ["Sirius", "Adhara", "Wezen", "Mirzam"],
     "mythology": "Orion's loyal hunting dog. Sirius, the Dog Star, is the brightest star in the night sky — only 8.6 light-years away. Ancient Egyptians based their calendar on Sirius's heliacal rising, which coincided with the Nile's annual flood. The 'Dog Days of Summer' are named for when Sirius rises with the Sun (July-August).",
     "deep_sky": ["M41 (open cluster)", "NGC 2362 (Tau CMa cluster)"],
     "best_viewing": "January-March"},
    {"id": "andromeda_const", "name": "Andromeda", "latin": "Andromeda", "abbr": "And", "season": "Autumn",
     "ra_center": 0.8, "dec_center": 38, "area_sq_deg": 722, "color": "#93C5FD",
     "bright_stars": ["Alpheratz", "Mirach", "Almach"],
     "mythology": "Princess Andromeda, chained to a rock as sacrifice to the sea monster Cetus. Her mother Cassiopeia's vanity brought Poseidon's wrath. Perseus, fresh from slaying Medusa, saw Andromeda and rescued her by turning the monster to stone with Medusa's head. The Andromeda Galaxy (M31) is visible to the naked eye — 2.5 million light-years away, approaching us at 110 km/s.",
     "deep_sky": ["M31 (Andromeda Galaxy)", "M32", "M110"],
     "best_viewing": "October-December"},
    {"id": "perseus", "name": "Perseus", "latin": "Perseus", "abbr": "Per", "season": "Winter",
     "ra_center": 3.2, "dec_center": 45, "area_sq_deg": 615, "color": "#818CF8",
     "bright_stars": ["Mirfak", "Algol", "Atik"],
     "mythology": "The hero who slew Medusa. Son of Zeus and Danae. Given winged sandals by Hermes, a cap of invisibility by Hades, and a mirrored shield by Athena. Algol ('the Demon Star') represents Medusa's eye — it winks every 2.87 days as a binary star eclipses. The Perseid meteor shower radiates from this constellation every August.",
     "deep_sky": ["NGC 869/884 (Double Cluster)", "M34", "California Nebula"],
     "best_viewing": "November-February"},
    {"id": "ursa_minor", "name": "Ursa Minor", "latin": "Ursa Minor", "abbr": "UMi", "season": "Year-round",
     "ra_center": 15, "dec_center": 78, "area_sq_deg": 256, "color": "#FEF3C7",
     "bright_stars": ["Polaris", "Kochab", "Pherkad"],
     "mythology": "The Little Bear. Arcas, son of Callisto (Ursa Major), was also transformed by Zeus to prevent him from accidentally killing his mother while hunting. Polaris, the North Star, sits within 1° of true celestial north — all other stars appear to rotate around it. Polaris has guided navigators for millennia. Due to precession, Vega will replace it as North Star around 14,000 AD.",
     "deep_sky": ["Polaris (Cepheid variable + triple star system)"],
     "best_viewing": "Year-round, circumpolar in Northern Hemisphere"},
    {"id": "aries", "name": "Aries", "latin": "Aries", "abbr": "Ari", "season": "Autumn",
     "ra_center": 2.6, "dec_center": 21, "area_sq_deg": 441, "color": "#EF4444",
     "bright_stars": ["Hamal", "Sheratan", "Mesarthim"],
     "mythology": "The golden-fleeced ram sent by Hermes to rescue Phrixus and Helle from their cruel stepmother. The ram flew them to Colchis; Helle fell into the sea (now the Hellespont). Phrixus sacrificed the ram and hung the Golden Fleece in a sacred grove — later sought by Jason and the Argonauts. The First Point of Aries marked the vernal equinox 2,000 years ago.",
     "deep_sky": ["NGC 772 (galaxy)"],
     "best_viewing": "October-December"},
    {"id": "pisces", "name": "Pisces", "latin": "Pisces", "abbr": "Psc", "season": "Autumn",
     "ra_center": 0.5, "dec_center": 12, "area_sq_deg": 889, "color": "#2DD4BF",
     "bright_stars": ["Eta Piscium", "Gamma Piscium", "Omega Piscium"],
     "mythology": "Two fish tied by a cord. Aphrodite and her son Eros transformed into fish to escape the monster Typhon, tying themselves together so they wouldn't be separated in the Euphrates River. The vernal equinox currently lies in Pisces (the 'Age of Pisces'). We are transitioning into the Age of Aquarius due to the precession of Earth's axis.",
     "deep_sky": ["M74 (spiral galaxy)", "Vernal equinox point"],
     "best_viewing": "September-November"},
    {"id": "aquarius", "name": "Aquarius", "latin": "Aquarius", "abbr": "Aqr", "season": "Autumn",
     "ra_center": 22.3, "dec_center": -10, "area_sq_deg": 980, "color": "#38BDF8",
     "bright_stars": ["Sadalsuud", "Sadalmelik", "Skat"],
     "mythology": "The Water Bearer. Ganymede, the most beautiful mortal, was abducted by Zeus (as an eagle, Aquila) to serve as cupbearer of the gods on Olympus. He pours the water of knowledge from his urn to Earth. The Age of Aquarius — the next great astrological age — symbolizes enlightenment, technology, and collective consciousness. We stand at its threshold.",
     "deep_sky": ["M2 (globular cluster)", "NGC 7009 (Saturn Nebula)", "Helix Nebula (NGC 7293)"],
     "best_viewing": "September-November"},
    {"id": "draco", "name": "Draco", "latin": "Draco", "abbr": "Dra", "season": "Summer",
     "ra_center": 15, "dec_center": 65, "area_sq_deg": 1083, "color": "#6B7280",
     "bright_stars": ["Eltanin", "Rastaban", "Thuban", "Grumium"],
     "mythology": "The dragon Ladon, who guarded the golden apples in the Garden of the Hesperides. Heracles slew him as his eleventh labor. Hera placed Ladon in the sky, coiled around the celestial pole. Thuban was the North Star when the Egyptian pyramids were built (2700 BC) — the descending passage of the Great Pyramid aligns with Thuban's ancient position.",
     "deep_sky": ["NGC 6543 (Cat's Eye Nebula)", "Draco Dwarf Galaxy"],
     "best_viewing": "Year-round, circumpolar in Northern Hemisphere"},
]



# ━━━ Celestial Events Generator ━━━
def generate_celestial_events():
    """Generate upcoming celestial events based on current date."""
    now = datetime.now(timezone.utc)
    events = []

    # Recurring annual events (approximate dates)
    annual_events = [
        {"name": "Quadrantids Meteor Shower", "month": 1, "day": 3, "duration_days": 2, "type": "meteor_shower", "peak_rate": 120, "color": "#60A5FA"},
        {"name": "Lyrids Meteor Shower", "month": 4, "day": 22, "duration_days": 2, "type": "meteor_shower", "peak_rate": 18, "color": "#A78BFA"},
        {"name": "Eta Aquariids", "month": 5, "day": 6, "duration_days": 3, "type": "meteor_shower", "peak_rate": 50, "color": "#2DD4BF"},
        {"name": "Perseids Meteor Shower", "month": 8, "day": 12, "duration_days": 3, "type": "meteor_shower", "peak_rate": 100, "color": "#FBBF24"},
        {"name": "Orionids Meteor Shower", "month": 10, "day": 21, "duration_days": 2, "type": "meteor_shower", "peak_rate": 20, "color": "#FB923C"},
        {"name": "Geminids Meteor Shower", "month": 12, "day": 14, "duration_days": 3, "type": "meteor_shower", "peak_rate": 150, "color": "#EC4899"},
        {"name": "Summer Solstice", "month": 6, "day": 21, "duration_days": 1, "type": "solstice", "peak_rate": 0, "color": "#FBBF24"},
        {"name": "Winter Solstice", "month": 12, "day": 21, "duration_days": 1, "type": "solstice", "peak_rate": 0, "color": "#3B82F6"},
        {"name": "Vernal Equinox", "month": 3, "day": 20, "duration_days": 1, "type": "equinox", "peak_rate": 0, "color": "#22C55E"},
        {"name": "Autumnal Equinox", "month": 9, "day": 22, "duration_days": 1, "type": "equinox", "peak_rate": 0, "color": "#FB923C"},
    ]

    for evt in annual_events:
        # Calculate next occurrence
        evt_date = datetime(now.year, evt["month"], evt["day"], tzinfo=timezone.utc)
        if evt_date < now:
            evt_date = datetime(now.year + 1, evt["month"], evt["day"], tzinfo=timezone.utc)

        days_until = (evt_date - now).days
        events.append({
            "name": evt["name"],
            "date": evt_date.isoformat(),
            "days_until": days_until,
            "type": evt["type"],
            "peak_rate": evt.get("peak_rate", 0),
            "color": evt["color"],
            "active": days_until <= evt["duration_days"] and days_until >= 0,
        })

    # Moon phase calculation (simplified)
    known_new_moon = datetime(2024, 1, 11, tzinfo=timezone.utc)
    synodic_month = 29.53059
    days_since = (now - known_new_moon).total_seconds() / 86400
    moon_age = days_since % synodic_month
    moon_phase_pct = moon_age / synodic_month
    if moon_phase_pct < 0.03:
        moon_name = "New Moon"
    elif moon_phase_pct < 0.22:
        moon_name = "Waxing Crescent"
    elif moon_phase_pct < 0.28:
        moon_name = "First Quarter"
    elif moon_phase_pct < 0.47:
        moon_name = "Waxing Gibbous"
    elif moon_phase_pct < 0.53:
        moon_name = "Full Moon"
    elif moon_phase_pct < 0.72:
        moon_name = "Waning Gibbous"
    elif moon_phase_pct < 0.78:
        moon_name = "Last Quarter"
    else:
        moon_name = "Waning Crescent"

    moon_illumination = round(abs(math.cos(moon_phase_pct * 2 * math.pi)) * 100, 1) if moon_phase_pct > 0.5 else round((1 - abs(math.cos(moon_phase_pct * 2 * math.pi))) * 100, 1)

    return events, {"phase": moon_name, "illumination": moon_illumination, "age_days": round(moon_age, 1)}


@router.get("/observatory/planets")
async def get_planet_data(user=Depends(get_current_user_optional)):
    """Planet electromagnetic frequencies and orbital data."""
    planets = []
    for name, data in PLANET_FREQUENCIES.items():
        # Light-time from Earth
        au = data["distance_au"]
        light_minutes = round(au * 8.317, 1)  # 1 AU ≈ 8.317 light-minutes
        planets.append({
            "name": name.capitalize(),
            "hz": data["hz"],
            "color": data["color"],
            "orbital_speed_km_s": data["orbital_speed_km_s"],
            "distance_au": au,
            "light_time_minutes": light_minutes,
            "desc": data["desc"],
        })
    return {"planets": planets}


@router.get("/observatory/stars")
async def get_star_data(user=Depends(get_current_user_optional)):
    """Notable stars with light-time distances and sonification data."""
    stars = []
    for s in NOTABLE_STARS:
        # Sonification: map temperature to frequency (hotter = higher pitch)
        sonified_hz = round(200 + (s["temp_k"] / 12100) * 800, 1)
        stars.append({
            **s,
            "sonified_hz": sonified_hz,
            "light_departed_year": round(datetime.now().year - s["distance_ly"]),
        })
    return {"stars": stars}


@router.get("/observatory/events")
async def get_celestial_events(user=Depends(get_current_user_optional)):
    """Upcoming celestial events and current moon phase."""
    events, moon = generate_celestial_events()
    # Sort by days until
    events.sort(key=lambda e: e["days_until"])
    return {
        "events": events[:10],
        "moon": moon,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.post("/observatory/sonify")
async def sonify_object(data: dict = Body(...), user=Depends(get_current_user_optional)):
    """Convert astronomical data into sound parameters."""
    object_type = data.get("type", "")  # "planet" or "star"
    name = data.get("name", "").lower()

    if object_type == "planet":
        planet = PLANET_FREQUENCIES.get(name)
        if not planet:
            return {"error": f"Unknown planet: {name}"}
        return {
            "name": name.capitalize(),
            "frequency_hz": planet["hz"],
            "harmonics": [planet["hz"], planet["hz"] * 2, planet["hz"] * 3],
            "orbital_rhythm_bpm": round(planet["orbital_speed_km_s"] * 2, 1),
            "character": "deep" if planet["hz"] < 180 else "mid" if planet["hz"] < 220 else "bright",
            "color": planet["color"],
        }
    elif object_type == "star":
        star = next((s for s in NOTABLE_STARS if s["name"].lower() == name), None)
        if not star:
            return {"error": f"Unknown star: {name}"}
        sonified_hz = round(200 + (star["temp_k"] / 12100) * 800, 1)
        return {
            "name": star["name"],
            "frequency_hz": sonified_hz,
            "harmonics": [sonified_hz, sonified_hz * 1.5, sonified_hz * 2],
            "temperature_k": star["temp_k"],
            "brightness_factor": round(10 ** (-star["magnitude"] / 2.5), 2),
            "character": "cool" if star["temp_k"] < 4000 else "warm" if star["temp_k"] < 7000 else "hot",
            "color": star["color"],
        }
    return {"error": "type must be 'planet' or 'star'"}


@router.get("/observatory/constellations")
async def get_constellations():
    """Return the 20 major Western constellations with mythology and deep-sky objects."""
    return {"constellations": [{k: v for k, v in c.items()} for c in CONSTELLATIONS]}

