from fastapi import APIRouter, Depends
from deps import db, get_current_user, get_current_user_optional, logger
from datetime import datetime, timezone
import asyncio

router = APIRouter(prefix="/resonance", tags=["Collective Resonance Dashboard"])

# ─── Surge Thresholds ───
SURGE_DENSITY_THRESHOLD = 0.85       # Global density must exceed this
SURGE_CLUSTER_THRESHOLD = 0.85       # Any cross-cluster pair exceeding this triggers surge
SURGE_COMMERCE_FEE_OVERRIDE = 0.5    # 0.5% fee during surge (down from 2%)
SURGE_TRANSMUTE_DISCOUNT = 0.6       # 40% cheaper transmutation during surge
AGGREGATION_INTERVAL = 60            # Seconds between global aggregation cycles


async def aggregate_global_matrix():
    """Pull the current H² state from all active users and compute the
    global 24×24 interference pattern.
    
    The global matrix is the element-wise average of all individual matrices,
    reflecting the collective resonance of the entire platform.
    """
    tensors = await db.h2_tensors.find(
        {}, {"_id": 0, "matrix": 1, "density": 1, "user_id": 1}
    ).to_list(500)

    if not tensors:
        return None

    n = 24
    global_matrix = [[0.0] * n for _ in range(n)]
    count = len(tensors)

    for tensor in tensors:
        matrix = tensor.get("matrix", [])
        if len(matrix) != n:
            continue
        for i in range(n):
            if len(matrix[i]) != n:
                continue
            for j in range(n):
                global_matrix[i][j] += matrix[i][j]

    # Average
    for i in range(n):
        for j in range(n):
            global_matrix[i][j] = round(global_matrix[i][j] / max(count, 1), 4)

    return global_matrix


def compute_global_density(matrix):
    """Density = ratio of non-zero cells in the global matrix."""
    n = len(matrix)
    non_zero = sum(1 for i in range(n) for j in range(n) if matrix[i][j] > 0)
    return round(non_zero / (n * n), 4)


CLUSTER_NAMES = ["security", "location", "finance", "evolution"]


def compute_global_resonance(matrix):
    """Compute cross-cluster resonance from the global matrix."""
    resonance = {}
    for ci, cn in enumerate(CLUSTER_NAMES):
        for cj, cm in enumerate(CLUSTER_NAMES):
            if ci > cj:
                continue
            si, ei = ci * 6, (ci + 1) * 6
            sj, ej = cj * 6, (cj + 1) * 6

            total = 0.0
            count = 0
            for i in range(si, ei):
                for j in range(sj, ej):
                    total += matrix[i][j]
                    count += 1

            avg = round(total / max(count, 1), 4)
            key = f"{cn}×{cm}" if ci != cj else cn
            resonance[key] = avg

    return resonance


def detect_surge(density, resonance):
    """Check if a Harmony Surge should be triggered.
    
    Conditions (any triggers surge):
    1. Global density exceeds SURGE_DENSITY_THRESHOLD
    2. Any cross-cluster resonance pair exceeds SURGE_CLUSTER_THRESHOLD
    """
    surge_triggers = []

    if density >= SURGE_DENSITY_THRESHOLD:
        surge_triggers.append({
            "type": "global_density",
            "value": density,
            "threshold": SURGE_DENSITY_THRESHOLD,
        })

    for key, value in resonance.items():
        if "×" in key and value >= SURGE_CLUSTER_THRESHOLD:
            surge_triggers.append({
                "type": "cross_cluster",
                "pair": key,
                "value": value,
                "threshold": SURGE_CLUSTER_THRESHOLD,
            })

    return {
        "active": len(surge_triggers) > 0,
        "triggers": surge_triggers,
        "effects": {
            "commerce_fee_override": SURGE_COMMERCE_FEE_OVERRIDE if surge_triggers else None,
            "transmute_discount": SURGE_TRANSMUTE_DISCOUNT if surge_triggers else None,
        },
    }


def compute_cluster_heatmap(matrix):
    """Compute a condensed 4×4 cluster heatmap for frontend rendering.
    Each cell is the average intensity of the 6×6 sub-block."""
    heatmap = []
    for ci in range(4):
        row = []
        for cj in range(4):
            si, sj = ci * 6, cj * 6
            total = 0.0
            for i in range(si, si + 6):
                for j in range(sj, sj + 6):
                    total += matrix[i][j]
            row.append(round(total / 36.0, 4))
        heatmap.append(row)
    return heatmap


async def run_aggregation_cycle():
    """Execute one aggregation cycle: aggregate → analyze → store → flag surge."""
    now = datetime.now(timezone.utc).isoformat()

    global_matrix = await aggregate_global_matrix()
    if not global_matrix:
        return

    density = compute_global_density(global_matrix)
    resonance = compute_global_resonance(global_matrix)
    surge = detect_surge(density, resonance)
    heatmap = compute_cluster_heatmap(global_matrix)

    total_users = await db.h2_tensors.count_documents({})

    snapshot = {
        "id": "global_latest",
        "global_density": density,
        "cross_cluster_resonance": resonance,
        "cluster_heatmap": heatmap,
        "surge": surge,
        "total_users_in_matrix": total_users,
        "aggregated_at": now,
    }

    # Store latest snapshot (overwrite)
    await db.collective_resonance.update_one(
        {"id": "global_latest"},
        {"$set": snapshot},
        upsert=True,
    )

    # Also store in the global matrix collection (for tensor retrieval)
    await db.global_h2_matrix.update_one(
        {"id": "global"},
        {"$set": {
            "id": "global",
            "matrix": global_matrix,
            "density": density,
            "heatmap": heatmap,
            "aggregated_at": now,
        }},
        upsert=True,
    )

    # Update sovereign config with surge state
    await db.sovereign_config.update_one(
        {"id": "global"},
        {"$set": {
            "harmony_surge_active": surge["active"],
            "harmony_surge_data": surge,
        }},
        upsert=True,
    )

    if surge["active"]:
        logger.info(f"HARMONY SURGE ACTIVE — density: {density}, triggers: {len(surge['triggers'])}")

    return snapshot


async def resonance_aggregation_loop():
    """Background loop that aggregates the global matrix every 60 seconds."""
    while True:
        try:
            await run_aggregation_cycle()
        except Exception as e:
            logger.error(f"Resonance aggregation error: {e}")
        await asyncio.sleep(AGGREGATION_INTERVAL)


# ─── ENDPOINTS ───

@router.get("/global")
async def get_global_resonance(user=Depends(get_current_user_optional)):
    """Get the latest global collective resonance snapshot.
    Public endpoint — no auth required for community transparency."""
    snapshot = await db.collective_resonance.find_one(
        {"id": "global_latest"}, {"_id": 0}
    )
    if not snapshot:
        # Trigger an immediate aggregation
        snapshot = await run_aggregation_cycle()
        if not snapshot:
            return {
                "global_density": 0,
                "cross_cluster_resonance": {},
                "cluster_heatmap": [[0] * 4 for _ in range(4)],
                "surge": {"active": False, "triggers": [], "effects": {}},
                "total_users_in_matrix": 0,
                "aggregated_at": None,
            }
    return snapshot


@router.get("/heatmap")
async def get_global_heatmap(user=Depends(get_current_user_optional)):
    """Get the condensed 4×4 cluster heatmap for shader rendering."""
    data = await db.global_h2_matrix.find_one({"id": "global"}, {"_id": 0})
    if not data:
        return {"heatmap": [[0] * 4 for _ in range(4)], "density": 0}
    return {
        "heatmap": data.get("heatmap", [[0] * 4 for _ in range(4)]),
        "density": data.get("density", 0),
        "aggregated_at": data.get("aggregated_at"),
    }


@router.get("/matrix")
async def get_global_matrix(user=Depends(get_current_user)):
    """Get the full global 24×24 matrix (requires auth — admin view)."""
    data = await db.global_h2_matrix.find_one({"id": "global"}, {"_id": 0})
    if not data:
        return {"matrix": None, "density": 0, "message": "No global matrix computed yet"}
    return data


@router.get("/surge")
async def get_surge_status(user=Depends(get_current_user_optional)):
    """Get current Harmony Surge status."""
    config = await db.sovereign_config.find_one({"id": "global"}, {"_id": 0})
    if not config:
        return {"active": False, "effects": {}}

    surge_data = config.get("harmony_surge_data", {"active": False})
    return {
        "active": surge_data.get("active", False),
        "triggers": surge_data.get("triggers", []),
        "effects": surge_data.get("effects", {}),
    }


@router.post("/trigger-aggregation")
async def manual_aggregation(user=Depends(get_current_user)):
    """Manually trigger an aggregation cycle (admin use)."""
    snapshot = await run_aggregation_cycle()
    return snapshot or {"message": "No H² tensors to aggregate"}
