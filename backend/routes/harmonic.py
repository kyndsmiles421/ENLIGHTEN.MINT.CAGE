from fastapi import APIRouter
from engines.harmonic_core import engine, MultiphaseHarmonicEngine

router = APIRouter(prefix="/harmonic", tags=["harmonic"])


@router.get("/resonance")
async def get_harmonic_resonance(frequency: int = 432, polarity: int = 1):
    """
    Calculate harmonic resonance for a given frequency.
    
    Args:
        frequency: Input frequency in Hz (default: 432)
        polarity: 1 for WHITE_LIGHT (expansion), -1 for VOID (contraction)
    """
    result = engine.calculate(frequency, polarity)
    return result


@router.get("/components")
async def get_fractal_components():
    """
    Get base fractal components and constants.
    """
    return {
        "universal_limit": "sys.float_info.max",
        "golden_ratio_Z": engine.Z,
        "trinity_N": engine.N,
        "base_fractal_N_Z": engine.N ** engine.Z,
        "amplification_Z_N": engine.Z ** engine.N,
        "formula": "[(L-1)+(N^Z*polarity)] * [((N^Z)±1)/(N^Z)] / (X/L) * (Z^N)",
        "polarity_modes": {
            "+1": "WHITE_LIGHT (Expansion/Constructive)",
            "-1": "VOID (Contraction/Destructive)"
        }
    }


@router.get("/sacred")
async def get_sacred_frequencies():
    """
    Calculate resonance for all sacred solfeggio frequencies (White Light mode).
    """
    results = engine.get_sacred_resonance()
    return {
        "mode": "WHITE_LIGHT",
        "tuning_system": "Metatron 432",
        "frequencies": results
    }


@router.get("/void")
async def get_void_frequencies():
    """
    Calculate VOID resonance for all sacred frequencies (Contraction mode).
    """
    results = engine.get_void_resonance()
    return {
        "mode": "VOID",
        "tuning_system": "Metatron 432 (Inverted)",
        "frequencies": results
    }


@router.get("/spectrum")
async def get_spectrum(start: int = 100, end: int = 1000, step: int = 100, polarity: int = 1):
    """
    Calculate harmonic values for a custom frequency spectrum.
    """
    frequencies = list(range(start, end + 1, step))
    results = engine.calculate_spectrum(frequencies, polarity)
    return {
        "polarity": "WHITE_LIGHT" if polarity >= 0 else "VOID",
        "range": f"{start}-{end} Hz (step: {step})",
        "spectrum": results
    }


@router.get("/duality")
async def get_duality(frequency: int = 432):
    """
    Compare WHITE_LIGHT vs VOID resonance for a single frequency.
    Shows the constructive/destructive interference duality.
    """
    white_light = engine.calculate(frequency, polarity=1)
    void = engine.calculate(frequency, polarity=-1)
    
    return {
        "frequency": frequency,
        "duality": {
            "WHITE_LIGHT": white_light,
            "VOID": void
        },
        "harmonic_ratio": white_light["harmonic_index"] / void["harmonic_index"] if void["harmonic_index"] > 0 else "INFINITY"
    }
