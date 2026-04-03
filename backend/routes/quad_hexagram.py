from fastapi import APIRouter, Depends, HTTPException
from deps import db, get_current_user
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter(prefix="/quad-hex", tags=["H² Hexagram-Squared Engine"])

# ─── Phase Modes (Adaptive Omni-Key) ───
PHASE_MODES = {
    "harmonic": {
        "id": "harmonic",
        "name": "Harmonic",
        "description": "Resonance-based filtering for wellness atmosphere",
        "trigger": "low_activity",
        "line1_key": "resonance_variance",
        "phase_weight": 1.0,
    },
    "fractal": {
        "id": "fractal",
        "name": "Fractal",
        "description": "Structural symmetry analysis for high-traffic events",
        "trigger": "high_traffic",
        "line1_key": "structural_symmetry",
        "phase_weight": 1.5,
    },
    "elemental": {
        "id": "elemental",
        "name": "Elemental",
        "description": "Binary hard-lock grounding for defensive posture",
        "trigger": "security_alert",
        "line1_key": "grounding_lock",
        "phase_weight": 2.0,
    },
}

CLUSTER_NAMES = ["security", "location", "finance", "evolution"]
CLUSTER_RANGES = {
    "security": (0, 6),
    "location": (6, 12),
    "finance": (12, 18),
    "evolution": (18, 24),
}


async def detect_phase(user_id: str) -> str:
    """Super-Observer: scan platform telemetry to determine active phase."""
    active_mutes = await db.sentinel_mutes.count_documents({"active": True})
    violation_count = await db.sentinel_log.count_documents({})
    if active_mutes >= 2 or violation_count >= 10:
        return "elemental"

    recent_cutoff = (datetime.now(timezone.utc) - timedelta(minutes=15)).isoformat()
    recent_posts = await db.feed_posts.count_documents(
        {"created_at": {"$gte": recent_cutoff}}
    )
    if recent_posts >= 20:
        return "fractal"

    return "harmonic"


# ═══════════════════════════════════════════
#  LINEAR RESOLVERS (24-bit State Vector)
# ═══════════════════════════════════════════

async def resolve_security(user_id: str, phase: str) -> list:
    """Hexagram 1: Security/Sentinel — Lines 1-6."""
    lines = [0] * 6
    if phase == "harmonic":
        v = await db.sentinel_log.count_documents({"user_id": user_id})
        lines[0] = 1 if v == 0 else 0
    elif phase == "fractal":
        p = await db.class_profiles.find_one({"user_id": user_id})
        lines[0] = 1 if p else 0
    else:
        m = await db.sentinel_mutes.find_one({"user_id": user_id, "active": True})
        lines[0] = 0 if m else 1

    lines[1] = 1 if await db.users.find_one({"id": user_id}) else 0
    lines[2] = 1 if await db.class_profiles.find_one({"user_id": user_id}) else 0
    m = await db.sentinel_mutes.find_one({"user_id": user_id, "active": True})
    lines[3] = 0 if m else 1
    lines[4] = 1 if await db.identity_settings.find_one({"user_id": user_id}) else 0
    lines[5] = 1 if await db.feed_posts.count_documents({"user_id": user_id}) > 0 else 0
    return lines


async def resolve_location(user_id: str) -> list:
    """Hexagram 2: Location/Cosmic Map — Lines 7-12."""
    lines = [0] * 6
    lines[0] = 1 if await db.hub_wallets.find_one({"user_id": user_id}) else 0
    presence = await db.feed_presence.count_documents({"user_id": user_id})
    lines[1] = 1 if presence > 0 else 0
    lines[2] = 1 if await db.constellations.count_documents({"creator_id": user_id}) > 0 else 0
    lines[3] = 1 if presence >= 2 else 0
    lines[4] = 1 if await db.harmony_scores.count_documents({"user_id": user_id}) > 0 else 0
    lines[5] = 1 if await db.constellations.count_documents({"creator_id": user_id, "likes": {"$gt": 0}}) > 0 else 0
    return lines


async def resolve_finance(user_id: str) -> list:
    """Hexagram 3: Finance/Central Hub — Lines 13-18."""
    lines = [0] * 6
    wallet = await db.hub_wallets.find_one({"user_id": user_id}, {"_id": 0})
    lines[0] = 1 if wallet and wallet.get("dust", 0) > 0 else 0
    lines[1] = 1 if wallet and wallet.get("total_dust_earned", 0) > 0 else 0
    lines[2] = 1 if wallet and wallet.get("gems", 0) > 0 else 0
    lines[3] = 1 if await db.hub_ledger.count_documents({"user_id": user_id, "type": {"$in": ["trade_out", "transfer_out"]}}) > 0 else 0
    lines[4] = 1 if await db.broker_escrow.count_documents({"$or": [{"initiator_id": user_id}, {"target_id": user_id}]}) > 0 else 0
    lines[5] = 1 if await db.hub_ledger.count_documents({"user_id": user_id, "type": {"$in": ["trade_in", "transfer_in"]}}) > 0 else 0
    return lines


async def resolve_evolution(user_id: str) -> list:
    """Hexagram 4: Evolution/The Forge — Lines 19-24."""
    lines = [0] * 6
    lines[0] = 1 if await db.mastery_records.count_documents({"user_id": user_id}) > 0 else 0
    streak = await db.resonance_streaks.find_one({"user_id": user_id}, {"_id": 0})
    lines[1] = 1 if streak and streak.get("current_streak", 0) >= 3 else 0
    lines[2] = 1 if await db.constellations.count_documents({"creator_id": user_id, "synergies": {"$exists": True, "$ne": []}}) > 0 else 0
    popular = await db.constellations.find_one({"creator_id": user_id, "load_count": {"$gte": 3}}, {"_id": 0})
    lines[3] = 1 if popular else 0
    lines[4] = 1 if await db.transmutation_log.count_documents({"user_id": user_id}) > 0 else 0
    exit_taxes = await db.hub_ledger.count_documents({"user_id": user_id, "type": "return_tax"})
    lines[5] = 1 if exit_taxes == 0 else 0
    return lines


# ═══════════════════════════════════════════
#  H² ENGINE: 24×24 STATE MATRIX
# ═══════════════════════════════════════════

def compute_h2_matrix(state_vector: list, phase: str) -> list:
    """Generate the 24×24 State Matrix from the linear 24-bit vector.
    
    X-Axis = Current State (the 24 lines)
    Y-Axis = Contextual Influence (phase-weighted cross-reference)
    
    Each cell M[i][j] represents the interference between line_i and line_j:
    - If both are 1 (aligned): cell = 1.0 × phase_weight
    - If one is 1 (partial): cell = 0.5
    - If both are 0 (void): cell = 0.0
    - Cross-cluster interactions get a resonance bonus of +0.25
    """
    n = 24
    phase_weight = PHASE_MODES.get(phase, {}).get("phase_weight", 1.0)
    matrix = []

    for i in range(n):
        row = []
        cluster_i = _get_cluster_index(i)
        for j in range(n):
            cluster_j = _get_cluster_index(j)
            vi, vj = state_vector[i], state_vector[j]

            if vi == 1 and vj == 1:
                cell = 1.0 * phase_weight
            elif vi == 1 or vj == 1:
                cell = 0.5
            else:
                cell = 0.0

            # Cross-cluster resonance bonus
            if cluster_i != cluster_j and vi == 1 and vj == 1:
                cell += 0.25

            row.append(round(cell, 4))
        matrix.append(row)

    return matrix


def _get_cluster_index(line_idx: int) -> int:
    """Map a 0-23 line index to its cluster (0=Security, 1=Location, 2=Finance, 3=Evolution)."""
    return line_idx // 6


def compute_cross_cluster_resonance(matrix: list) -> dict:
    """Calculate interference patterns between clusters.
    
    Returns a 4×4 resonance map where each cell is the average
    interaction strength between two clusters.
    """
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

            avg = round(total / count, 4) if count > 0 else 0.0
            key = f"{cn}×{cm}" if ci != cj else cn
            resonance[key] = avg

    return resonance


def compute_matrix_density(matrix: list) -> float:
    """Compute the density of the matrix (ratio of non-zero cells to total cells)."""
    n = len(matrix)
    non_zero = sum(1 for i in range(n) for j in range(n) if matrix[i][j] > 0)
    return round(non_zero / (n * n), 4)


def compute_matrix_determinant_proxy(matrix: list, state_vector: list) -> float:
    """Compute a determinant-like value for the State Matrix.
    
    Positive = trade adds value to the Collective
    Negative = trade extracts value
    
    Uses: trace, cluster self-resonance, density, and alignment.
    High-density + high-alignment always produces a positive determinant.
    """
    n = len(matrix)
    trace = sum(matrix[i][i] for i in range(n))

    # Cluster self-resonance: geometric mean of diagonal cluster sums
    cluster_scores = []
    for ci in range(4):
        si = ci * 6
        cluster_sum = sum(matrix[si + k][si + k] for k in range(6))
        cluster_scores.append(cluster_sum / 6.0)

    # Cross-cluster energy: average off-diagonal interaction
    cross_energy = 0.0
    cross_count = 0
    for i in range(n):
        for j in range(n):
            if i // 6 != j // 6:
                cross_energy += matrix[i][j]
                cross_count += 1
    avg_cross = cross_energy / max(cross_count, 1)

    density = compute_matrix_density(matrix)
    alignment = sum(state_vector) / 24.0

    # Determinant: weighted combination favoring density and alignment
    det = (trace / n) * sum(cluster_scores) * (density ** 0.5) * alignment + avg_cross - 0.5
    return round(det, 6)


def compute_variable_return_tax(matrix: list, base_tax: int = 30) -> int:
    """Compute variable return tax based on matrix density.
    
    - High density (stable economy) → lower tax (min 15%)
    - Low density (unstable, outbound drain) → higher tax (max 45%)
    """
    density = compute_matrix_density(matrix)
    if density >= 0.6:
        return max(15, base_tax - 10)
    elif density >= 0.4:
        return base_tax
    elif density >= 0.2:
        return min(40, base_tax + 5)
    else:
        return min(45, base_tax + 15)


def apply_cross_cluster_effects(state_vector: list, resonance: dict) -> dict:
    """Derive actionable effects from cross-cluster interference.
    
    Security×Finance: Low resonance → restrict transmutation
    Location×Evolution: High resonance → reduce return tax
    Security×Evolution: Low resonance → flag for sentinel review
    """
    effects = {
        "transmutation_modifier": 1.0,
        "tax_modifier": 1.0,
        "sentinel_escalation": False,
        "economy_health": "stable",
    }

    sec_fin = resonance.get("security×finance", 0)
    loc_evo = resonance.get("location×evolution", 0)
    sec_evo = resonance.get("security×evolution", 0)

    # Security×Finance: low resonance → restrict transmutation
    if sec_fin < 0.3:
        effects["transmutation_modifier"] = 1.5  # Need 50% more dust
        effects["economy_health"] = "cautious"

    # Location×Evolution: high resonance → encourage economy
    if loc_evo > 0.5:
        effects["tax_modifier"] = 0.7  # 30% tax reduction

    # Security×Evolution: low resonance → sentinel escalation
    if sec_evo < 0.2:
        effects["sentinel_escalation"] = True
        effects["economy_health"] = "volatile"

    return effects


# ═══════════════════════════════════════════
#  ENDPOINTS
# ═══════════════════════════════════════════

@router.post("/resolve")
async def resolve_state_vector(body: dict = None, user=Depends(get_current_user)):
    """Generate the full 24-bit State Vector (linear) for the current user."""
    phase = await detect_phase(user["id"])

    hex1 = await resolve_security(user["id"], phase)
    hex2 = await resolve_location(user["id"])
    hex3 = await resolve_finance(user["id"])
    hex4 = await resolve_evolution(user["id"])

    all_lines = hex1 + hex2 + hex3 + hex4
    binary_string = ''.join(str(b) for b in all_lines)
    state_integer = int(binary_string, 2)
    alignment = sum(all_lines) / 24.0

    result = {
        "state_vector": state_integer,
        "binary": binary_string,
        "alignment_score": round(alignment, 4),
        "phase_mode": phase,
        "phase_data": PHASE_MODES[phase],
        "hexagrams": {
            "security": {"lines": hex1, "score": round(sum(hex1) / 6, 4)},
            "location": {"lines": hex2, "score": round(sum(hex2) / 6, 4)},
            "finance": {"lines": hex3, "score": round(sum(hex3) / 6, 4)},
            "evolution": {"lines": hex4, "score": round(sum(hex4) / 6, 4)},
        },
        "total_aligned": sum(all_lines),
        "resolved_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.hexagram_states.update_one(
        {"user_id": user["id"]},
        {"$set": {"user_id": user["id"], **result}},
        upsert=True,
    )
    return result


@router.post("/resolve-h2")
async def resolve_h2_matrix(body: dict = None, user=Depends(get_current_user)):
    """Generate the full H² State Matrix (24×24 = 576 intersections).
    
    Returns: state tensor, cross-cluster resonance map, matrix density,
    determinant proxy, variable return tax, and cross-cluster effects.
    """
    phase = await detect_phase(user["id"])

    hex1 = await resolve_security(user["id"], phase)
    hex2 = await resolve_location(user["id"])
    hex3 = await resolve_finance(user["id"])
    hex4 = await resolve_evolution(user["id"])

    state_vector = hex1 + hex2 + hex3 + hex4
    binary_string = ''.join(str(b) for b in state_vector)
    alignment = sum(state_vector) / 24.0

    # H² computation
    matrix = compute_h2_matrix(state_vector, phase)
    resonance = compute_cross_cluster_resonance(matrix)
    density = compute_matrix_density(matrix)
    determinant = compute_matrix_determinant_proxy(matrix, state_vector)
    variable_tax = compute_variable_return_tax(matrix)
    effects = apply_cross_cluster_effects(state_vector, resonance)

    result = {
        "binary": binary_string,
        "alignment_score": round(alignment, 4),
        "phase_mode": phase,
        "phase_data": PHASE_MODES[phase],
        "hexagrams": {
            "security": {"lines": hex1, "score": round(sum(hex1) / 6, 4)},
            "location": {"lines": hex2, "score": round(sum(hex2) / 6, 4)},
            "finance": {"lines": hex3, "score": round(sum(hex3) / 6, 4)},
            "evolution": {"lines": hex4, "score": round(sum(hex4) / 6, 4)},
        },
        "h2_matrix": matrix,
        "matrix_dimensions": "24×24",
        "total_intersections": 576,
        "cross_cluster_resonance": resonance,
        "matrix_density": density,
        "determinant_proxy": determinant,
        "determinant_positive": determinant > 0,
        "variable_return_tax": variable_tax,
        "cross_cluster_effects": effects,
        "total_aligned": sum(state_vector),
        "resolved_at": datetime.now(timezone.utc).isoformat(),
    }

    # Cache the H² state
    cache_data = {k: v for k, v in result.items() if k != "h2_matrix"}
    cache_data["has_matrix"] = True
    await db.hexagram_states.update_one(
        {"user_id": user["id"]},
        {"$set": {"user_id": user["id"], **cache_data}},
        upsert=True,
    )

    # Store full tensor separately (large document)
    await db.h2_tensors.update_one(
        {"user_id": user["id"]},
        {"$set": {
            "user_id": user["id"],
            "matrix": matrix,
            "binary": binary_string,
            "phase": phase,
            "density": density,
            "determinant": determinant,
            "resolved_at": result["resolved_at"],
        }},
        upsert=True,
    )

    return result


@router.post("/quad-scan")
async def quad_scan(body: dict, user=Depends(get_current_user)):
    """Run the 24-line quad-scan for a P2P transaction."""
    target_user_id = body.get("target_user_id")
    if not target_user_id:
        raise HTTPException(400, "target_user_id required")
    if target_user_id == user["id"]:
        raise HTTPException(400, "Cannot scan against yourself")

    phase = await detect_phase(user["id"])
    i_sec = await resolve_security(user["id"], phase)
    i_fin = await resolve_finance(user["id"])
    t_sec = await resolve_security(target_user_id, phase)
    t_fin = await resolve_finance(target_user_id)

    sec_total = sum(i_sec) + sum(t_sec)
    fin_total = sum(i_fin) + sum(t_fin)
    sec_pass = sec_total >= 8
    fin_pass = fin_total >= 4

    return {
        "cleared": sec_pass and fin_pass,
        "phase_mode": phase,
        "initiator": {"security": sum(i_sec), "finance": sum(i_fin)},
        "target": {"security": sum(t_sec), "finance": sum(t_fin)},
        "checks": {
            "security": {"pass": sec_pass, "combined": sec_total, "required": 8},
            "finance": {"pass": fin_pass, "combined": fin_total, "required": 4},
        },
        "scanned_at": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/phase")
async def get_current_phase(user=Depends(get_current_user)):
    """Get the current platform phase mode determined by the Super-Observer."""
    phase = await detect_phase(user["id"])
    return {"phase": phase, **PHASE_MODES[phase]}


@router.get("/state")
async def get_cached_state(user=Depends(get_current_user)):
    """Get the most recently resolved state (linear or H²)."""
    state = await db.hexagram_states.find_one({"user_id": user["id"]}, {"_id": 0})
    if not state:
        raise HTTPException(404, "No state vector resolved yet")
    return state


@router.get("/tensor")
async def get_cached_tensor(user=Depends(get_current_user)):
    """Get the most recently resolved H² tensor (full 24×24 matrix)."""
    tensor = await db.h2_tensors.find_one({"user_id": user["id"]}, {"_id": 0})
    if not tensor:
        raise HTTPException(404, "No H² tensor resolved yet. Call POST /resolve-h2 first.")
    return tensor
