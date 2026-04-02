from fastapi import APIRouter, Depends, Body
from deps import db, get_current_user, logger
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
async def get_planet_data(user=Depends(get_current_user)):
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
async def get_star_data(user=Depends(get_current_user)):
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
async def get_celestial_events(user=Depends(get_current_user)):
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
async def sonify_object(data: dict = Body(...), user=Depends(get_current_user)):
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
