from fastapi import APIRouter, Depends, Body, HTTPException
from deps import db, get_current_user, logger
from datetime import datetime, timezone
import httpx

router = APIRouter()

# ━━━ Default active satellites (inner ring only) ━━━
DEFAULT_ACTIVE = ["mood", "mixer", "map", "breathing", "meditation", "theory"]

@router.get("/hub/preferences")
async def get_hub_preferences(user=Depends(get_current_user)):
    """Get user's active satellite configuration."""
    prefs = await db.hub_preferences.find_one({"user_id": user["id"]}, {"_id": 0})
    if not prefs:
        prefs = {
            "user_id": user["id"],
            "active_satellites": DEFAULT_ACTIVE,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.hub_preferences.insert_one(prefs)
        prefs.pop("_id", None)
    return {"active_satellites": prefs.get("active_satellites", DEFAULT_ACTIVE)}


@router.post("/hub/preferences")
async def update_hub_preferences(data: dict = Body(...), user=Depends(get_current_user)):
    """Update user's active satellite list."""
    active = data.get("active_satellites", [])
    if not isinstance(active, list):
        raise HTTPException(status_code=400, detail="active_satellites must be a list")
    # Limit to 12 max active
    active = active[:12]
    await db.hub_preferences.update_one(
        {"user_id": user["id"]},
        {"$set": {
            "active_satellites": active,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }, "$setOnInsert": {
            "user_id": user["id"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }},
        upsert=True,
    )
    return {"active_satellites": active}


# ━━━ NWS Weather Proxy ━━━
# National Weather Service API — free, no key required
NWS_BASE = "https://api.weather.gov"
NWS_HEADERS = {"User-Agent": "(CosmicCollective, cosmic@collective.app)", "Accept": "application/geo+json"}

# Weather condition to frequency mapping
WEATHER_FREQUENCIES = {
    "clear": {"base_hz": 528, "type": "sine", "reverb": 0.1, "character": "crystalline"},
    "cloudy": {"base_hz": 396, "type": "triangle", "reverb": 0.4, "character": "muffled"},
    "rain": {"base_hz": 285, "type": "sawtooth", "reverb": 0.7, "character": "heavy"},
    "snow": {"base_hz": 432, "type": "sine", "reverb": 0.5, "character": "soft"},
    "thunderstorm": {"base_hz": 174, "type": "square", "reverb": 0.9, "character": "electric"},
    "fog": {"base_hz": 369, "type": "sine", "reverb": 0.6, "character": "ethereal"},
    "wind": {"base_hz": 417, "type": "triangle", "reverb": 0.3, "character": "sharp"},
    "default": {"base_hz": 432, "type": "sine", "reverb": 0.2, "character": "neutral"},
}


def classify_weather(description):
    """Map NWS text description to a weather category."""
    desc = (description or "").lower()
    if "thunder" in desc or "tstms" in desc:
        return "thunderstorm"
    if "rain" in desc or "shower" in desc or "drizzle" in desc:
        return "rain"
    if "snow" in desc or "blizzard" in desc or "flurr" in desc:
        return "snow"
    if "fog" in desc or "mist" in desc or "haze" in desc:
        return "fog"
    if "wind" in desc or "breezy" in desc or "gusty" in desc:
        return "wind"
    if "cloud" in desc or "overcast" in desc or "mostly cloudy" in desc:
        return "cloudy"
    if "clear" in desc or "sunny" in desc or "fair" in desc:
        return "clear"
    return "default"


@router.get("/weather/current")
async def get_current_weather(lat: float = 44.08, lon: float = -103.23, user=Depends(get_current_user)):
    """Fetch current weather from NWS API and map to frequencies."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            # Step 1: Get grid point from coordinates
            points_r = await client.get(f"{NWS_BASE}/points/{lat},{lon}", headers=NWS_HEADERS)
            if points_r.status_code != 200:
                return _fallback_weather(lat, lon)

            points_data = points_r.json()
            props = points_data.get("properties", {})
            forecast_url = props.get("forecastHourly")
            station_url = props.get("observationStations")
            location_name = f"{props.get('relativeLocation', {}).get('properties', {}).get('city', 'Unknown')}, {props.get('relativeLocation', {}).get('properties', {}).get('state', '')}"

            # Step 2: Get latest observation from nearest station
            temp_f = None
            humidity = None
            wind_speed = None
            wind_direction = None
            description = "Clear"
            if station_url:
                stations_r = await client.get(station_url, headers=NWS_HEADERS)
                if stations_r.status_code == 200:
                    stations = stations_r.json().get("features", [])
                    if stations:
                        station_id = stations[0]["properties"]["stationIdentifier"]
                        obs_r = await client.get(f"{NWS_BASE}/stations/{station_id}/observations/latest", headers=NWS_HEADERS)
                        if obs_r.status_code == 200:
                            obs = obs_r.json().get("properties", {})
                            temp_c = obs.get("temperature", {}).get("value")
                            if temp_c is not None:
                                temp_f = round(temp_c * 9 / 5 + 32, 1)
                            humidity = obs.get("relativeHumidity", {}).get("value")
                            if humidity is not None:
                                humidity = round(humidity, 1)
                            wind_val = obs.get("windSpeed", {}).get("value")
                            if wind_val is not None:
                                wind_speed = round(wind_val * 0.621371, 1)  # km/h to mph
                            wind_direction = obs.get("windDirection", {}).get("value")
                            description = obs.get("textDescription") or "Clear"

            # Step 3: Get forecast for "seeing" conditions
            cloud_cover = None
            if forecast_url:
                fc_r = await client.get(forecast_url, headers=NWS_HEADERS)
                if fc_r.status_code == 200:
                    periods = fc_r.json().get("properties", {}).get("periods", [])
                    if periods:
                        current_period = periods[0]
                        if description == "Clear":
                            description = current_period.get("shortForecast", description)
                        cloud_cover = current_period.get("probabilityOfPrecipitation", {}).get("value")

            # Map weather to frequency
            category = classify_weather(description)
            freq_data = WEATHER_FREQUENCIES.get(category, WEATHER_FREQUENCIES["default"])

            # Temperature-adjusted pitch
            pitch_adjust = 0
            if temp_f is not None:
                pitch_adjust = (temp_f - 60) * 0.5  # warmer = slightly higher

            # Seeing quality for stargazing (based on clouds + humidity)
            seeing = "excellent"
            if cloud_cover and cloud_cover > 60:
                seeing = "poor"
            elif cloud_cover and cloud_cover > 30:
                seeing = "fair"
            elif humidity and humidity > 80:
                seeing = "fair"
            else:
                seeing = "excellent" if (humidity or 50) < 50 else "good"

            return {
                "location": location_name,
                "lat": lat,
                "lon": lon,
                "temperature_f": temp_f,
                "humidity": humidity,
                "wind_speed_mph": wind_speed,
                "wind_direction": wind_direction,
                "description": description,
                "category": category,
                "seeing_quality": seeing,
                "cloud_cover_pct": cloud_cover,
                "frequency": {
                    "base_hz": freq_data["base_hz"] + pitch_adjust,
                    "type": freq_data["type"],
                    "reverb": freq_data["reverb"],
                    "character": freq_data["character"],
                },
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

    except Exception as e:
        logger.error(f"NWS Weather error: {e}")
        return _fallback_weather(lat, lon)


def _fallback_weather(lat, lon):
    """Fallback when NWS API is unavailable."""
    return {
        "location": f"({lat}, {lon})",
        "lat": lat,
        "lon": lon,
        "temperature_f": None,
        "humidity": None,
        "wind_speed_mph": None,
        "wind_direction": None,
        "description": "Data unavailable",
        "category": "default",
        "seeing_quality": "unknown",
        "cloud_cover_pct": None,
        "frequency": WEATHER_FREQUENCIES["default"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "fallback": True,
    }
