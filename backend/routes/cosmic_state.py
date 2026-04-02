from fastapi import APIRouter, Depends
from deps import db, get_current_user, logger
from datetime import datetime, timezone
from routes.sovereign_math import (
    ELEMENTS, solve_element_ode, element_ode_rhs, rk4_step,
    solve_lorenz, GENERATION_RATE, CONTROL_RATE, NATURAL_DECAY, CIRCADIAN_AMP,
)
import math

router = APIRouter()

TIERS = ["observer", "synthesizer", "archivist", "navigator", "sovereign"]


@router.get("/cosmic-state")
async def get_cosmic_state(user=Depends(get_current_user)):
    """Unified master math endpoint. Returns tier-gated data bundle:
    - Observer+: garden energies + stability
    - Synthesizer+: derivatives + matrix params
    - Archivist+: full ODE trajectory + analysis
    - Sovereign: chaos prediction
    """
    tier_doc = await db.mastery_tiers.find_one({"user_id": user["id"]}, {"_id": 0})
    tier_name = tier_doc.get("balance_tier", "observer") if tier_doc else "observer"
    tier_idx = TIERS.index(tier_name) if tier_name in TIERS else 0

    # Garden element masses (shared across all tiers)
    garden = await db.user_garden.find({"user_id": user["id"]}, {"_id": 0}).to_list(24)
    garden_masses = {}
    for g in garden:
        elem = g.get("element", "Earth")
        garden_masses[elem] = garden_masses.get(elem, 0) + g.get("gravity_mass", 60)

    current_hour = datetime.now(timezone.utc).hour + datetime.now(timezone.utc).minute / 60.0

    # Compute current state via ODE integration to current hour
    initial = [1.0 + garden_masses.get(e, 0) / 100.0 for e in ELEMENTS]
    state_now = list(initial)
    dt_sim = 0.25
    for step in range(int(current_hour * 4)):
        h = (step * dt_sim) % 24
        state_now = rk4_step(state_now, h, dt_sim, garden_masses)

    # Derivatives at current time
    derivatives = element_ode_rhs(state_now, current_hour, garden_masses)
    total_derivative = sum(abs(d) for d in derivatives)
    stability = "stable" if total_derivative < 0.1 else "shifting" if total_derivative < 0.3 else "volatile"

    # Mean energy for deviations
    mean_energy = sum(state_now) / 5.0

    # ── Observer tier: basic energies + stability ──
    result = {
        "tier": tier_name,
        "tier_index": tier_idx,
        "current_hour": round(current_hour, 1),
        "energies": {ELEMENTS[i]: round(state_now[i], 4) for i in range(5)},
        "stability": stability,
        "total_rate_of_change": round(total_derivative, 4),
        "garden_masses": garden_masses,
    }

    # ── Synthesizer+: derivatives + deviations ──
    if tier_idx >= 1:
        result["derivatives"] = {ELEMENTS[i]: round(derivatives[i], 6) for i in range(5)}
        result["deviations"] = {ELEMENTS[i]: round(state_now[i] - mean_energy, 4) for i in range(5)}

    # ── Archivist+: full 24hr ODE trajectory + analysis ──
    if tier_idx >= 2:
        trajectory = solve_element_ode(initial, garden_masses, hours=24)
        analysis = {}
        for elem in ELEMENTS:
            values = [t["state"][elem] for t in trajectory]
            peak_idx = max(range(len(values)), key=lambda j: values[j])
            trough_idx = min(range(len(values)), key=lambda j: values[j])
            analysis[elem] = {
                "peak_hour": trajectory[peak_idx]["hour"],
                "peak_value": values[peak_idx],
                "trough_hour": trajectory[trough_idx]["hour"],
                "trough_value": values[trough_idx],
                "amplitude": round(values[peak_idx] - values[trough_idx], 4),
            }
        result["trajectory"] = trajectory
        result["analysis"] = analysis
        result["ode_params"] = {
            "generation_rate": GENERATION_RATE,
            "control_rate": CONTROL_RATE,
            "natural_decay": NATURAL_DECAY,
            "circadian_amplitude": CIRCADIAN_AMP,
        }

    # ── Sovereign: chaos prediction for current dominant frequency ──
    if tier_idx >= 4:
        dominant_elem = max(ELEMENTS, key=lambda e: state_now[ELEMENTS.index(e)])
        freq_map = {"Wood": 396, "Fire": 528, "Earth": 639, "Metal": 741, "Water": 852}
        freq = freq_map.get(dominant_elem, 528)
        x0 = (freq % 100) / 10.0
        y0 = ((freq * 1.618) % 100) / 10.0
        z0 = ((freq * 2.718) % 100) / 10.0
        original = solve_lorenz(x0, y0, z0, steps=300, dt=0.01)
        perturbed = solve_lorenz(x0 + 0.01, y0, z0, steps=300, dt=0.01)
        divergences = []
        for i in range(min(len(original), len(perturbed))):
            o, p = original[i], perturbed[i]
            dist = math.sqrt((o["x"]-p["x"])**2 + (o["y"]-p["y"])**2 + (o["z"]-p["z"])**2)
            divergences.append({"step": o["step"], "divergence": round(dist, 4)})
        if len(divergences) > 10 and divergences[-1]["divergence"] > 0 and divergences[1]["divergence"] > 0:
            lyapunov = math.log(divergences[-1]["divergence"] / max(divergences[1]["divergence"], 0.0001)) / (len(divergences) * 0.01)
        else:
            lyapunov = 0.0
        if lyapunov > 5:
            sensitivity = "extreme"
        elif lyapunov > 2:
            sensitivity = "high"
        elif lyapunov > 0.5:
            sensitivity = "moderate"
        else:
            sensitivity = "stable"
        result["chaos"] = {
            "dominant_element": dominant_elem,
            "frequency": freq,
            "lyapunov": round(lyapunov, 4),
            "sensitivity": sensitivity,
            "attractor_sample": original[:10],
            "divergences": divergences[:10],
        }

    return result
