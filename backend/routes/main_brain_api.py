"""
ENLIGHTEN.MINT.CAFE - V-FINAL MAIN BRAIN API
main_brain_api.py

API Endpoints for the Sovereign Singularity Engine (Main Brain).
Provides 9x9 Crystalline Lattice state, module synchronization,
and GPU shader injection parameters.

ROUTES:
- GET  /api/main-brain/status      - Get Main Brain status & telemetry
- GET  /api/main-brain/lattice     - Get 9x9 Crystalline Lattice state
- POST /api/main-brain/pulse       - Pulse the lattice and process command
- GET  /api/main-brain/sync        - Synchronize all modules
- GET  /api/main-brain/shader-params - Get GPU shader uniforms for L² Fractal
"""

from fastapi import APIRouter, HTTPException, Body, Depends
from deps import logger, db, get_current_user
from datetime import datetime, timezone

from utils.sovereign_main_brain import main_brain, activate_node_for_route, get_coord_for_route, ROUTE_TO_COORD


router = APIRouter()


@router.get("/main-brain/status")
async def get_main_brain_status():
    """
    Get the current status of the Sovereign Main Brain.
    
    Returns:
        Complete brain telemetry including lattice state and shader params.
    """
    try:
        status = main_brain.get_status()
        return {
            "status": "success",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "main_brain": status,
        }
    except Exception as e:
        logger.error(f"MAIN_BRAIN_API: Status retrieval failed | Error: {str(e)}")
        raise HTTPException(500, f"Main Brain status retrieval failed: {str(e)}")


@router.get("/main-brain/lattice")
async def get_lattice_state():
    """
    Get the current state of the 9x9 Crystalline Lattice.
    
    Returns:
        All 81 nodes with their types, charges, and resonance values.
    """
    try:
        lattice = main_brain.get_lattice_state()
        return {
            "status": "success",
            "lattice": lattice,
        }
    except Exception as e:
        logger.error(f"MAIN_BRAIN_API: Lattice state retrieval failed | Error: {str(e)}")
        raise HTTPException(500, f"Lattice state retrieval failed: {str(e)}")


@router.post("/main-brain/pulse")
async def pulse_lattice():
    """
    Pulse the 9x9 Crystalline Lattice and process an apex command.
    
    This triggers a resonance wave through the entire neural network.
    
    Returns:
        Updated telemetry after pulse processing.
    """
    try:
        telemetry = main_brain.process_apex_command()
        return {
            "status": "success",
            "message": "Lattice pulsed successfully",
            "telemetry": telemetry,
        }
    except Exception as e:
        logger.error(f"MAIN_BRAIN_API: Lattice pulse failed | Error: {str(e)}")
        raise HTTPException(500, f"Lattice pulse failed: {str(e)}")


@router.get("/main-brain/sync")
async def synchronize_modules():
    """
    Synchronize all child modules (Mixer, Generator, Ledger)
    through the Main Brain's 9x9 lattice.
    
    Returns:
        Synchronization status for all modules.
    """
    try:
        sync_result = main_brain.synchronize_modules()
        return {
            "status": "success",
            "sync": sync_result,
        }
    except Exception as e:
        logger.error(f"MAIN_BRAIN_API: Module sync failed | Error: {str(e)}")
        raise HTTPException(500, f"Module synchronization failed: {str(e)}")


@router.get("/main-brain/shader-params")
async def get_shader_parameters():
    """
    Get GPU shader injection parameters for the L² Fractal Engine.
    
    These uniform values drive the WebGL GLSL shaders for real-time
    120 FPS Dynamic Prismatic Liquid rendering.
    
    Returns:
        Shader uniforms (u_phi, u_resonance, u_time, etc.)
    """
    try:
        params = main_brain.inject_shader_parameters()
        return {
            "status": "success",
            "shader_uniforms": params,
            "target_fps": 120,
            "shader_type": "L2_FRACTAL_GLSL",
            "render_mode": "DYNAMIC_PRISMATIC_LIQUID",
        }
    except Exception as e:
        logger.error(f"MAIN_BRAIN_API: Shader params retrieval failed | Error: {str(e)}")
        raise HTTPException(500, f"Shader params retrieval failed: {str(e)}")


@router.get("/main-brain/constants")
async def get_sacred_constants():
    """
    Get the sacred mathematical constants used by the Main Brain.
    
    Returns:
        PHI, Resonance, Vocal Auth frequency, LOx temperature, etc.
    """
    return {
        "status": "success",
        "constants": {
            "phi": main_brain.PHI,
            "resonance": main_brain.RESONANCE_CONST,
            "vocal_auth_hz": main_brain.VOCAL_AUTH_FREQ,
            "lox_temp_celsius": main_brain.LOX_TEMP,
            "lattice_size": main_brain.LATTICE_SIZE,
            "center_node": main_brain.CENTER_NODE,
            "pentagonal_division": 72.0,
            "crystal_facets": 5,
        },
        "formulas": {
            "phi": "(1 + sqrt(5)) / 2",
            "resonance": "(PHI^2) / PI",
            "processing_capacity": "PHI^PHI * 1000 (when LOx <= -183C)",
            "resonance_flow": "(RESONANCE^PHI) + (PHI^PHI)",
        },
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 🗺 V68.6 — ROUTE ACTIVATION ENDPOINTS (Scout Mode)
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/main-brain/activate")
async def activate_route(data: dict = Body(...), user=Depends(get_current_user)):
    """
    Pull-based intentionality: the client calls this ONLY when a module is
    actually entered (workshop, practice, 3D scene). Menu hops are noise.
    Marks the lattice node as active + records the activation in the user's
    personal pattern (for the Mini-Lattice visualization).
    """
    path = str(data.get("path", "")).strip()
    if not path:
        raise HTTPException(status_code=400, detail="path required")

    # Activate the global lattice node (PHI-weighted charge bump)
    activation = activate_node_for_route(path)
    if not activation:
        # Unmapped route — record it but don't fail
        return {"activated": False, "reason": "route_not_mapped", "path": path}

    # Record user-specific activation
    now = datetime.now(timezone.utc).isoformat()
    coord = activation["coord"]
    await db.lattice_activations.update_one(
        {"user_id": user["id"], "x": coord["x"], "y": coord["y"]},
        {
            "$set": {
                "user_id": user["id"],
                "x": coord["x"],
                "y": coord["y"],
                "path": path,
                "type": activation["type"],
                "last_activation": now,
            },
            "$inc": {"activation_count": 1},
            "$setOnInsert": {"first_activation": now},
        },
        upsert=True,
    )

    return {
        "activated": True,
        "path": path,
        "coord": coord,
        "node_type": activation["type"],
        "charge": activation["charge"],
        "resonance": activation["resonance"],
    }


@router.get("/main-brain/user-lattice")
async def get_user_lattice(user=Depends(get_current_user)):
    """
    Returns the user's personal 9x9 activation pattern: which nodes they've
    visited, how many times, and the user's resonance flow across the grid.
    """
    cursor = db.lattice_activations.find(
        {"user_id": user["id"]},
        {"_id": 0},
    ).sort("last_activation", -1)
    activations = await cursor.to_list(length=100)

    # Build a flat 9x9 map for the UI — zero fallback for unvisited
    flat = [[None for _ in range(main_brain.LATTICE_SIZE)] for _ in range(main_brain.LATTICE_SIZE)]
    last_path = []  # chronological walk (most recent last)
    for a in activations:
        x, y = a["x"], a["y"]
        flat[y][x] = {
            "count": a.get("activation_count", 1),
            "type": a.get("type"),
            "path": a.get("path"),
            "last_activation": a.get("last_activation"),
        }
    # Last path = reverse chronological → chronological, dedup adjacent repeats, limit to 8
    chrono = list(reversed(activations))[-8:]
    last_path = [{"x": a["x"], "y": a["y"], "type": a.get("type"), "path": a.get("path")} for a in chrono]

    return {
        "lattice_size": main_brain.LATTICE_SIZE,
        "center": list(main_brain.CENTER_NODE),
        "flat": flat,
        "last_path": last_path,
        "total_activations": sum(a.get("activation_count", 1) for a in activations),
        "unique_nodes_visited": len(activations),
    }


@router.get("/main-brain/route-map")
async def get_route_map():
    """Expose the route→coordinate mapping so clients can pre-highlight."""
    return {"mapping": ROUTE_TO_COORD, "lattice_size": main_brain.LATTICE_SIZE}
