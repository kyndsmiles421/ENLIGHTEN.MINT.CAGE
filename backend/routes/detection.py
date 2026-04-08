from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import sys
sys.path.insert(0, '/app/backend')
from engines.detection_generator import get_generator

router = APIRouter(prefix="/detection", tags=["Detection Generator"])


class ScanRequest(BaseModel):
    sample_id: str
    administrator: Optional[str] = "Nicole Barlow"


class BatchScanRequest(BaseModel):
    sample_ids: List[str]
    administrator: Optional[str] = "Nicole Barlow"


@router.post("/scan")
async def generate_scan(request: ScanRequest):
    """
    Generate a refractive scan for a single sample.
    Uses Phi-based stability thresholds to detect pathogenic shifts.
    """
    generator = get_generator(request.administrator)
    return generator.generate_scan(request.sample_id)


@router.post("/batch-scan")
async def batch_scan(request: BatchScanRequest):
    """
    Generate refractive scans for multiple samples.
    """
    generator = get_generator(request.administrator)
    results = generator.batch_scan(request.sample_ids)
    return {
        "total_scans": len(results),
        "administrator": request.administrator,
        "results": results
    }


@router.get("/status")
async def detection_status():
    """
    Returns the current detection engine configuration.
    """
    generator = get_generator()
    return {
        "status": "active",
        "engine": "DetectionGenerator",
        "administrator": generator.admin,
        "phi_constant": generator.phi,
        "baseline_resistance": generator.baseline_resistance,
        "stability_threshold": 0.615,
        "barrier_mode": "RECIPROCAL"
    }
