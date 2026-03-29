import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from deps import logger

router = APIRouter()

# Load star cultures from JSON seed file (refactored from inline Python dicts)
_data_path = Path(__file__).parent.parent / "data" / "star_cultures_data.json"
try:
    with open(_data_path) as f:
        CULTURAL_CONSTELLATIONS = json.load(f)
    logger.info(f"Loaded {len(CULTURAL_CONSTELLATIONS)} star cultures from JSON")
except Exception as e:
    logger.error(f"Failed to load star cultures JSON: {e}")
    CULTURAL_CONSTELLATIONS = {}


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
        raise HTTPException(status_code=404, detail="Culture not found")
    return {
        "id": culture_id,
        "name": culture["name"],
        "color": culture["color"],
        "description": culture["description"],
        "constellations": culture["constellations"],
    }
