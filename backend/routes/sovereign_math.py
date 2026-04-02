from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger
from datetime import datetime, timezone
import math

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ELEMENT ODE SOLVER
#  Coupled Ordinary Differential Equations for 24hr Sheng/Ke cycles
#  dE/dt = generation_rate - control_rate - decay_rate + external_input
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ELEMENTS = ["Wood", "Fire", "Earth", "Metal", "Water"]
GENERATING = {"Wood": "Fire", "Fire": "Earth", "Earth": "Metal", "Metal": "Water", "Water": "Wood"}
CONTROLLING = {"Wood": "Earth", "Fire": "Metal", "Earth": "Water", "Metal": "Wood", "Water": "Fire"}
GENERATED_BY = {v: k for k, v in GENERATING.items()}
CONTROLLED_BY = {v: k for k, v in CONTROLLING.items()}

# Rate constants for the ODE system
GENERATION_RATE = 0.15    # Sheng cycle generation coefficient
CONTROL_RATE = 0.08       # Ke cycle control coefficient
NATURAL_DECAY = 0.02      # Exponential decay per hour
CIRCADIAN_AMP = 0.12      # Circadian rhythm amplitude

# Peak hours per element (TCM Organ Clock)
PEAK_HOURS = {
    "Wood": 2.0,   # 01:00-03:00 Liver
    "Fire": 12.0,  # 11:00-13:00 Heart
    "Earth": 10.0, # 09:00-11:00 Spleen
    "Metal": 4.0,  # 03:00-05:00 Lung
    "Water": 18.0, # 17:00-19:00 Kidney
}


def circadian_factor(element, hour):
    """TCM organ clock circadian modulation. Returns 0.0-1.0."""
    peak = PEAK_HOURS[element]
    delta = abs(hour - peak)
    if delta > 12:
        delta = 24 - delta
    return math.exp(-(delta ** 2) / 18)  # Gaussian centered on peak hour


def element_ode_rhs(state, hour, garden_masses):
    """Right-hand side of the coupled ODE system.
    state = [wood_energy, fire_energy, earth_energy, metal_energy, water_energy]
    Returns derivatives [dWood/dt, dFire/dt, dEarth/dt, dMetal/dt, dWater/dt]
    """
    derivatives = [0.0] * 5
    for i, elem in enumerate(ELEMENTS):
        E = state[i]
        generator = GENERATED_BY[elem]
        controller = CONTROLLED_BY[elem]
        gen_idx = ELEMENTS.index(generator)
        ctrl_idx = ELEMENTS.index(controller)

        # Sheng: energy flows in from generator
        generation = GENERATION_RATE * state[gen_idx] * circadian_factor(generator, hour)

        # Ke: energy is suppressed by controller
        control = CONTROL_RATE * state[ctrl_idx] * circadian_factor(controller, hour)

        # Natural decay
        decay = NATURAL_DECAY * E

        # Circadian boost from TCM organ clock
        circadian = CIRCADIAN_AMP * circadian_factor(elem, hour)

        # Garden mass contribution (plants amplify their element)
        garden_boost = garden_masses.get(elem, 0) * 0.002

        derivatives[i] = generation - control - decay + circadian + garden_boost

    return derivatives


def rk4_step(state, hour, dt, garden_masses):
    """Fourth-order Runge-Kutta integration step."""
    k1 = element_ode_rhs(state, hour, garden_masses)
    s2 = [state[i] + 0.5 * dt * k1[i] for i in range(5)]
    k2 = element_ode_rhs(s2, hour + 0.5 * dt, garden_masses)
    s3 = [state[i] + 0.5 * dt * k2[i] for i in range(5)]
    k3 = element_ode_rhs(s3, hour + 0.5 * dt, garden_masses)
    s4 = [state[i] + dt * k3[i] for i in range(5)]
    k4 = element_ode_rhs(s4, hour + dt, garden_masses)

    return [
        max(0, state[i] + (dt / 6.0) * (k1[i] + 2*k2[i] + 2*k3[i] + k4[i]))
        for i in range(5)
    ]


def solve_element_ode(initial_state, garden_masses, hours=24, steps_per_hour=4):
    """Solve the coupled element ODE for the given time span."""
    dt = 1.0 / steps_per_hour
    state = list(initial_state)
    trajectory = [{"hour": 0, "state": {ELEMENTS[i]: round(state[i], 4) for i in range(5)}}]

    for step in range(hours * steps_per_hour):
        hour = (step * dt) % 24
        state = rk4_step(state, hour, dt, garden_masses)
        if (step + 1) % steps_per_hour == 0:
            h = ((step + 1) * dt) % 24
            trajectory.append({
                "hour": round(h, 1),
                "state": {ELEMENTS[i]: round(state[i], 4) for i in range(5)},
            })

    return trajectory


@router.get("/math/element-ode")
async def get_element_ode(user=Depends(get_current_user)):
    """Simulate 24-hour Sheng/Ke element cycles using coupled ODEs.
    Requires Archivist tier or above."""
    tier_doc = await db.mastery_tiers.find_one({"user_id": user["id"]}, {"_id": 0})
    tier_name = tier_doc.get("balance_tier", "observer") if tier_doc else "observer"
    TIERS = ["observer", "synthesizer", "archivist", "navigator", "sovereign"]
    tier_idx = TIERS.index(tier_name) if tier_name in TIERS else 0

    if tier_idx < 2:
        raise HTTPException(status_code=403, detail=f"Requires Archivist tier. Current: {tier_name}")

    # Get garden element masses
    garden = await db.user_garden.find({"user_id": user["id"]}, {"_id": 0}).to_list(24)
    garden_masses = {}
    for g in garden:
        elem = g.get("element", "Earth")
        garden_masses[elem] = garden_masses.get(elem, 0) + g.get("gravity_mass", 60)

    # Initial state: normalized energy levels per element
    initial = [1.0] * 5
    for i, elem in enumerate(ELEMENTS):
        mass_factor = garden_masses.get(elem, 0) / 100.0
        initial[i] = 1.0 + mass_factor

    trajectory = solve_element_ode(initial, garden_masses, hours=24)

    # Find peak and trough per element
    analysis = {}
    for elem in ELEMENTS:
        values = [t["state"][elem] for t in trajectory]
        peak_idx = max(range(len(values)), key=lambda i: values[i])
        trough_idx = min(range(len(values)), key=lambda i: values[i])
        analysis[elem] = {
            "peak_hour": trajectory[peak_idx]["hour"],
            "peak_value": values[peak_idx],
            "trough_hour": trajectory[trough_idx]["hour"],
            "trough_value": values[trough_idx],
            "amplitude": round(values[peak_idx] - values[trough_idx], 4),
            "current": values[-1],
        }

    return {
        "trajectory": trajectory,
        "analysis": analysis,
        "garden_masses": garden_masses,
        "tier": tier_name,
        "model": "Coupled ODE (RK4)",
        "parameters": {
            "generation_rate": GENERATION_RATE,
            "control_rate": CONTROL_RATE,
            "natural_decay": NATURAL_DECAY,
            "circadian_amplitude": CIRCADIAN_AMP,
        },
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  CHAOS THEORY — Lorenz Attractor for Predictive Resonance
#  Butterfly Effect: tiny changes in frequency → divergent outcomes
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Lorenz system parameters
SIGMA = 10.0
RHO = 28.0
BETA = 8.0 / 3.0


def lorenz_rhs(x, y, z, sigma=SIGMA, rho=RHO, beta=BETA):
    """Lorenz attractor derivatives."""
    return (
        sigma * (y - x),
        x * (rho - z) - y,
        x * y - beta * z,
    )


def lorenz_rk4(x, y, z, dt, sigma=SIGMA, rho=RHO, beta=BETA):
    """RK4 step for Lorenz system."""
    k1 = lorenz_rhs(x, y, z, sigma, rho, beta)
    k2 = lorenz_rhs(x + 0.5*dt*k1[0], y + 0.5*dt*k1[1], z + 0.5*dt*k1[2], sigma, rho, beta)
    k3 = lorenz_rhs(x + 0.5*dt*k2[0], y + 0.5*dt*k2[1], z + 0.5*dt*k2[2], sigma, rho, beta)
    k4 = lorenz_rhs(x + dt*k3[0], y + dt*k3[1], z + dt*k3[2], sigma, rho, beta)
    return (
        x + (dt/6)*(k1[0] + 2*k2[0] + 2*k3[0] + k4[0]),
        y + (dt/6)*(k1[1] + 2*k2[1] + 2*k3[1] + k4[1]),
        z + (dt/6)*(k1[2] + 2*k2[2] + 2*k3[2] + k4[2]),
    )


def solve_lorenz(x0, y0, z0, steps=500, dt=0.01):
    """Solve Lorenz system and return trajectory."""
    trajectory = [{"step": 0, "x": round(x0, 4), "y": round(y0, 4), "z": round(z0, 4)}]
    x, y, z = x0, y0, z0
    for i in range(1, steps + 1):
        x, y, z = lorenz_rk4(x, y, z, dt)
        if i % 10 == 0:
            trajectory.append({"step": i, "x": round(x, 4), "y": round(y, 4), "z": round(z, 4)})
    return trajectory


@router.post("/math/chaos-predict")
async def chaos_predict(data: dict = Body(...), user=Depends(get_current_user)):
    """Lorenz attractor prediction — Butterfly Effect on frequency recipes.
    Requires Sovereign tier."""
    tier_doc = await db.mastery_tiers.find_one({"user_id": user["id"]}, {"_id": 0})
    tier_name = tier_doc.get("balance_tier", "observer") if tier_doc else "observer"
    TIERS = ["observer", "synthesizer", "archivist", "navigator", "sovereign"]
    tier_idx = TIERS.index(tier_name) if tier_name in TIERS else 0

    if tier_idx < 4:
        raise HTTPException(status_code=403, detail=f"Requires Sovereign tier. Current: {tier_name}")

    frequency = data.get("frequency", 528.0)
    perturbation = data.get("perturbation", 0.01)

    # Map frequency to Lorenz initial conditions
    # Normalize to Lorenz-scale coordinates
    x0 = (frequency % 100) / 10.0
    y0 = ((frequency * 1.618) % 100) / 10.0  # Golden ratio scaling
    z0 = ((frequency * 2.718) % 100) / 10.0  # Euler number scaling

    # Solve original trajectory
    original = solve_lorenz(x0, y0, z0, steps=300, dt=0.01)

    # Solve perturbed trajectory (butterfly effect)
    perturbed = solve_lorenz(x0 + perturbation, y0, z0, steps=300, dt=0.01)

    # Calculate divergence over time
    divergences = []
    for i in range(min(len(original), len(perturbed))):
        o, p = original[i], perturbed[i]
        dist = math.sqrt((o["x"]-p["x"])**2 + (o["y"]-p["y"])**2 + (o["z"]-p["z"])**2)
        divergences.append({"step": o["step"], "divergence": round(dist, 4)})

    # Lyapunov exponent estimate (rate of divergence)
    if len(divergences) > 10 and divergences[-1]["divergence"] > 0 and divergences[1]["divergence"] > 0:
        lyapunov = math.log(divergences[-1]["divergence"] / max(divergences[1]["divergence"], 0.0001)) / (len(divergences) * 0.01)
    else:
        lyapunov = 0.0

    # Sensitivity classification
    if lyapunov > 5:
        sensitivity = "extreme"
        prediction = "This frequency sits on a chaotic attractor saddle point. Tiny changes cascade unpredictably."
    elif lyapunov > 2:
        sensitivity = "high"
        prediction = "Strong butterfly effect. Frequency recipes near this value will produce divergent outcomes."
    elif lyapunov > 0.5:
        sensitivity = "moderate"
        prediction = "Moderate sensitivity. The system will eventually diverge but follows predictable patterns initially."
    else:
        sensitivity = "stable"
        prediction = "This frequency occupies a stable attractor basin. Recipes here produce consistent results."

    return {
        "frequency": frequency,
        "perturbation": perturbation,
        "original_trajectory": original[:20],
        "perturbed_trajectory": perturbed[:20],
        "divergences": divergences[:20],
        "lyapunov_estimate": round(lyapunov, 4),
        "sensitivity": sensitivity,
        "prediction": prediction,
        "model": "Lorenz Attractor (sigma=10, rho=28, beta=8/3)",
        "tier": tier_name,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  MATRIX TRANSFORMS — 4x4 Rotation Matrices for Star Chart
#  Proper homogeneous coordinates replacing ad-hoc spherical lerp
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def mat4_identity():
    return [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]

def mat4_multiply(a, b):
    result = [[0]*4 for _ in range(4)]
    for i in range(4):
        for j in range(4):
            for k in range(4):
                result[i][j] += a[i][k] * b[k][j]
    return result

def mat4_rotation_x(angle):
    c, s = math.cos(angle), math.sin(angle)
    return [[1,0,0,0],[0,c,-s,0],[0,s,c,0],[0,0,0,1]]

def mat4_rotation_y(angle):
    c, s = math.cos(angle), math.sin(angle)
    return [[c,0,s,0],[0,1,0,0],[-s,0,c,0],[0,0,0,1]]

def mat4_rotation_z(angle):
    c, s = math.cos(angle), math.sin(angle)
    return [[c,-s,0,0],[s,c,0,0],[0,0,1,0],[0,0,0,1]]

def mat4_scale(sx, sy, sz):
    return [[sx,0,0,0],[0,sy,0,0],[0,0,sz,0],[0,0,0,1]]

def mat4_translate(tx, ty, tz):
    return [[1,0,0,tx],[0,1,0,ty],[0,0,1,tz],[0,0,0,1]]

def mat4_apply(m, v):
    """Apply 4x4 matrix to a 3D point (homogeneous)."""
    x = m[0][0]*v[0] + m[0][1]*v[1] + m[0][2]*v[2] + m[0][3]
    y = m[1][0]*v[0] + m[1][1]*v[1] + m[1][2]*v[2] + m[1][3]
    z = m[2][0]*v[0] + m[2][1]*v[1] + m[2][2]*v[2] + m[2][3]
    w = m[3][0]*v[0] + m[3][1]*v[1] + m[3][2]*v[2] + m[3][3]
    if w != 0 and w != 1:
        return [x/w, y/w, z/w]
    return [x, y, z]

def spherical_to_cartesian(ra_hours, dec_degrees, radius):
    """Convert RA/Dec to Cartesian coordinates."""
    ra_rad = (ra_hours / 24.0) * 2 * math.pi
    dec_rad = (dec_degrees / 180.0) * math.pi
    x = radius * math.cos(dec_rad) * math.cos(ra_rad)
    y = radius * math.sin(dec_rad)
    z = -radius * math.cos(dec_rad) * math.sin(ra_rad)
    return [x, y, z]


@router.post("/math/matrix-transform")
async def matrix_transform(data: dict = Body(...), user=Depends(get_current_user)):
    """Compute proper 4x4 rotation matrix for Star Chart camera movement.
    Requires Synthesizer tier or above."""
    tier_doc = await db.mastery_tiers.find_one({"user_id": user["id"]}, {"_id": 0})
    tier_name = tier_doc.get("balance_tier", "observer") if tier_doc else "observer"
    TIERS = ["observer", "synthesizer", "archivist", "navigator", "sovereign"]
    tier_idx = TIERS.index(tier_name) if tier_name in TIERS else 0

    if tier_idx < 1:
        raise HTTPException(status_code=403, detail=f"Requires Synthesizer tier. Current: {tier_name}")

    # Source and target coordinates
    src_ra = data.get("source_ra", 0.0)
    src_dec = data.get("source_dec", 0.0)
    tgt_ra = data.get("target_ra", 6.0)
    tgt_dec = data.get("target_dec", 45.0)
    radius = data.get("radius", 50.0)
    steps = min(data.get("steps", 20), 60)

    src_cart = spherical_to_cartesian(src_ra, src_dec, radius)
    tgt_cart = spherical_to_cartesian(tgt_ra, tgt_dec, radius)

    # Compute rotation axis and angle between source and target
    # Cross product for axis
    ax = src_cart[1]*tgt_cart[2] - src_cart[2]*tgt_cart[1]
    ay = src_cart[2]*tgt_cart[0] - src_cart[0]*tgt_cart[2]
    az = src_cart[0]*tgt_cart[1] - src_cart[1]*tgt_cart[0]
    axis_len = math.sqrt(ax*ax + ay*ay + az*az)

    if axis_len < 1e-10:
        # Points are colinear — use Y axis as rotation axis
        ax, ay, az = 0, 1, 0
        axis_len = 1

    ax, ay, az = ax/axis_len, ay/axis_len, az/axis_len

    # Dot product for angle
    dot = sum(a*b for a, b in zip(src_cart, tgt_cart))
    src_len = math.sqrt(sum(v*v for v in src_cart))
    tgt_len = math.sqrt(sum(v*v for v in tgt_cart))
    cos_angle = max(-1, min(1, dot / (src_len * tgt_len + 1e-10)))
    total_angle = math.acos(cos_angle)

    # Generate interpolated transforms using Rodrigues rotation
    keyframes = []
    for i in range(steps + 1):
        t = i / steps
        # Ease-in-out for cinematic feel
        t_eased = t * t * (3 - 2 * t)  # Smoothstep
        angle = total_angle * t_eased

        # Rodrigues rotation matrix
        c, s = math.cos(angle), math.sin(angle)
        C = 1 - c
        rot = [
            [c + ax*ax*C,     ax*ay*C - az*s,  ax*az*C + ay*s, 0],
            [ay*ax*C + az*s,  c + ay*ay*C,     ay*az*C - ax*s, 0],
            [az*ax*C - ay*s,  az*ay*C + ax*s,  c + az*az*C,    0],
            [0, 0, 0, 1],
        ]

        # Apply rotation to source position
        pos = mat4_apply(rot, src_cart)

        keyframes.append({
            "t": round(t, 3),
            "t_eased": round(t_eased, 4),
            "position": [round(v, 4) for v in pos],
            "angle": round(math.degrees(angle), 2),
        })

    return {
        "source": {"ra": src_ra, "dec": src_dec, "cartesian": [round(v, 4) for v in src_cart]},
        "target": {"ra": tgt_ra, "dec": tgt_dec, "cartesian": [round(v, 4) for v in tgt_cart]},
        "rotation_axis": [round(ax, 6), round(ay, 6), round(az, 6)],
        "total_angle_degrees": round(math.degrees(total_angle), 2),
        "keyframes": keyframes,
        "model": "Rodrigues Rotation (4x4 homogeneous)",
        "tier": tier_name,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  DERIVATIVE ANALYSIS — Real-time Garden Balance rate-of-change
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/math/garden-derivative")
async def get_garden_derivative(user=Depends(get_current_user)):
    """Calculate dBalance/dt — the rate at which the garden balance is changing.
    Uses numerical differentiation on the element ODE trajectory."""
    tier_doc = await db.mastery_tiers.find_one({"user_id": user["id"]}, {"_id": 0})
    tier_name = tier_doc.get("balance_tier", "observer") if tier_doc else "observer"
    TIERS = ["observer", "synthesizer", "archivist", "navigator", "sovereign"]
    tier_idx = TIERS.index(tier_name) if tier_name in TIERS else 0

    if tier_idx < 1:
        raise HTTPException(status_code=403, detail=f"Requires Synthesizer tier. Current: {tier_name}")

    garden = await db.user_garden.find({"user_id": user["id"]}, {"_id": 0}).to_list(24)
    garden_masses = {}
    for g in garden:
        elem = g.get("element", "Earth")
        garden_masses[elem] = garden_masses.get(elem, 0) + g.get("gravity_mass", 60)

    current_hour = datetime.now(timezone.utc).hour + datetime.now(timezone.utc).minute / 60.0

    # Current state
    initial = [1.0 + garden_masses.get(e, 0) / 100.0 for e in ELEMENTS]
    state_now = list(initial)
    dt_sim = 0.25
    for step in range(int(current_hour * 4)):
        h = (step * dt_sim) % 24
        state_now = rk4_step(state_now, h, dt_sim, garden_masses)

    # Derivatives at current time
    derivatives = element_ode_rhs(state_now, current_hour, garden_masses)

    # Equilibrium deviation
    mean_energy = sum(state_now) / 5.0
    deviations = {ELEMENTS[i]: round(state_now[i] - mean_energy, 4) for i in range(5)}

    # Overall balance derivative
    total_derivative = sum(abs(d) for d in derivatives)
    stability = "stable" if total_derivative < 0.1 else "shifting" if total_derivative < 0.3 else "volatile"

    return {
        "current_hour": round(current_hour, 1),
        "element_energies": {ELEMENTS[i]: round(state_now[i], 4) for i in range(5)},
        "derivatives": {ELEMENTS[i]: round(derivatives[i], 6) for i in range(5)},
        "deviations_from_mean": deviations,
        "total_rate_of_change": round(total_derivative, 4),
        "stability": stability,
        "tier": tier_name,
    }
