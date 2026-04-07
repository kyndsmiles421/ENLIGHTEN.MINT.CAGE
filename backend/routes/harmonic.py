from fastapi import APIRouter
import sys

router = APIRouter(prefix="/harmonic", tags=["harmonic"])

# System Limits
L_LIMIT = sys.float_info.max

# Metatron's Tuning Constants
X_INPUT = 432
Z_BASE = 1.618
N_POWER = 3
V_ROTARY = 12000
R_RADIUS = 0.5
POLARITY_P = 1


def run_multi_fractal_engine(l_lim, x_in, z_base, n_pow, velocity, radius, polarity):
    """
    Multiphase Fractal Resonance Engine
    Formula: [ (L-1)+(N^Z) ] * [ ((N^Z)-(-1))/(N^Z) ] / (X/L) * (Z^N)
    """
    centrifugal_force = (velocity ** 2) / radius
    base_fractal = n_pow ** z_base
    part_A = (l_lim - 1) + base_fractal
    part_B = (base_fractal - (-1)) / base_fractal
    core_logic_interaction = part_A * part_B
    ratio_X_to_L = x_in / l_lim
    
    try:
        logic_inverse = core_logic_interaction / ratio_X_to_L
    except OverflowError:
        logic_inverse = float('inf')
    
    amplification_factor = z_base ** n_pow
    logic_final = logic_inverse * amplification_factor
    
    try:
        total_output = logic_final + x_in + (centrifugal_force * polarity)
    except OverflowError:
        return float('inf')
    
    if total_output >= l_lim:
        return l_lim
    return total_output


@router.get("/resonance")
async def get_harmonic_resonance(frequency: int = 432):
    """
    Calculate harmonic resonance for a given frequency.
    Default: 432 Hz (Metatron's Tuning)
    """
    result = run_multi_fractal_engine(
        L_LIMIT, frequency, Z_BASE, N_POWER, V_ROTARY, R_RADIUS, POLARITY_P
    )
    
    base_fractal = N_POWER ** Z_BASE
    
    return {
        "input_frequency": frequency,
        "harmonic_output": result if result != L_LIMIT else "INFINITY_BOUND",
        "formula": "[(L-1)+(N^Z)] * [((N^Z)+1)/(N^Z)] / (X/L) * (Z^N)",
        "components": {
            "L_LIMIT": "sys.float_info.max",
            "base_fractal_N_Z": base_fractal,
            "golden_ratio_Z": Z_BASE,
            "power_N": N_POWER,
            "amplification_Z_N": Z_BASE ** N_POWER,
            "centrifugal_force": (V_ROTARY ** 2) / R_RADIUS,
            "polarity": POLARITY_P
        }
    }


@router.get("/components")
async def get_fractal_components():
    """
    Get all fractal components for visualization.
    """
    base_fractal = N_POWER ** Z_BASE
    
    return {
        "metatron_frequency": X_INPUT,
        "golden_ratio": Z_BASE,
        "cubic_power": N_POWER,
        "base_fractal": base_fractal,
        "part_A": "L_LIMIT + base_fractal",
        "part_B": (base_fractal + 1) / base_fractal,
        "amplification_factor": Z_BASE ** N_POWER,
        "centrifugal_force": (V_ROTARY ** 2) / R_RADIUS,
        "rotary_velocity": V_ROTARY,
        "core_radius": R_RADIUS
    }


@router.get("/frequencies")
async def get_sacred_frequencies():
    """
    Calculate resonance for all sacred frequencies.
    """
    sacred_freqs = [174, 285, 396, 417, 432, 528, 639, 741, 852, 963]
    results = {}
    
    for freq in sacred_freqs:
        result = run_multi_fractal_engine(
            L_LIMIT, freq, Z_BASE, N_POWER, V_ROTARY, R_RADIUS, POLARITY_P
        )
        results[freq] = result if result != L_LIMIT else "INFINITY_BOUND"
    
    return {
        "sacred_frequencies": results,
        "tuning_system": "Metatron 432",
        "formula": "[(L-1)+(N^Z)] * [((N^Z)+1)/(N^Z)] / (X/L) * (Z^N)"
    }
