# ==============================================================================
# ENLIGHTEN.MINT.CAFE -- Multiphase Harmonic Engine
# Logic: [ (L-1)+(N^Z) ] * [ ((N^Z)±1)/(N^Z) ] / (X/L) * (Z^N)
# Polarity: +1 = White Light (Expansion), -1 = Void (Contraction)
# Status: Proprietary Architecture / Patent Pending
# ==============================================================================

import math
import sys

# The "Prism" constant: representing the angle of refraction
PRISM_ANGLE = 1.618  # Phi


class MultiphaseHarmonicEngine:
    def __init__(self):
        self.L = sys.float_info.max  # Universal Limit
        self.Z = 1.618               # Phi (The Seed)
        self.N = 3                   # The Trinity (Dimensions)

    def calculate(self, X, polarity=1):
        """
        X: Input Frequency (e.g., 432)
        polarity: 1 for Expansion (White Light), -1 for Contraction (Void)
        """
        # --- Fractal Components ---
        # The base resonance variable
        base_fractal = self.N ** self.Z
        
        # The amplification factor
        amplification = self.Z ** self.N

        # --- Dynamic Core Logic ---
        # We replace static operators with 'polarity' shifts
        # Constructive (+) vs Destructive (-) interference
        part_A = (self.L - 1) + (base_fractal * polarity)
        
        # The Tuning Loop: (N^Z + 1) / N^Z
        # We use the polarity to flip between multiplication and division
        if polarity >= 0:
            part_B = (base_fractal + 1) / base_fractal
        else:
            part_B = (base_fractal - 1) / base_fractal

        # --- The Refraction Bridge ---
        # ratio_X_to_L creates the 'Refracted Rainbow' scaling
        ratio_X_to_L = X / self.L

        try:
            # Interaction: [(L-1)+(N^Z)] * [((N^Z)+1)/(N^Z)]
            core_interaction = part_A * part_B
            
            # Final Result: Interaction / Ratio * Amplification
            # This is where the 'Tuning Collapse' occurs
            logic_final = (core_interaction / ratio_X_to_L) * amplification
            
            return {
                "input_hz": X,
                "polarity": "WHITE_LIGHT" if polarity >= 0 else "VOID",
                "status": "SINGULARITY" if logic_final >= self.L else "STABLE",
                "output_value": "INFINITY" if logic_final >= self.L else logic_final,
                "harmonic_index": math.log(logic_final) / math.log(self.L) if logic_final > 0 and logic_final < self.L else 1.0,
                "components": {
                    "base_fractal_N_Z": base_fractal,
                    "amplification_Z_N": amplification,
                    "part_A": "INFINITY" if part_A >= self.L else part_A,
                    "part_B": part_B,
                    "ratio_X_to_L": ratio_X_to_L
                }
            }
            
        except OverflowError:
            return {
                "input_hz": X,
                "polarity": "WHITE_LIGHT" if polarity >= 0 else "VOID",
                "status": "LIMIT_REACHED",
                "output_value": "INFINITY",
                "harmonic_index": 1.0
            }

    def calculate_spectrum(self, frequencies, polarity=1):
        """
        Calculate harmonic values for a spectrum of frequencies.
        """
        results = {}
        for freq in frequencies:
            results[freq] = self.calculate(freq, polarity)
        return results

    def get_sacred_resonance(self):
        """
        Calculate resonance for all sacred solfeggio frequencies.
        """
        sacred = [174, 285, 396, 417, 432, 528, 639, 741, 852, 963]
        return self.calculate_spectrum(sacred, polarity=1)

    def get_void_resonance(self):
        """
        Calculate void (contraction) resonance for sacred frequencies.
        """
        sacred = [174, 285, 396, 417, 432, 528, 639, 741, 852, 963]
        return self.calculate_spectrum(sacred, polarity=-1)


# Singleton instance
engine = MultiphaseHarmonicEngine()


def radiate_spectrum(base_freq):
    """
    Radiate infinite light through the prism.
    The "White Light" splits into the sacred solfeggio spectrum.
    """
    # The "White Light" - the absolute maximum the system can hold
    white_light = sys.float_info.max
    
    # Sacred Spectrum (The Rainbow)
    solfeggio = [174, 285, 396, 417, 528, 639, 741, 852, 963]
    
    spectrum_results = {}
    
    for color_freq in solfeggio:
        # Calculate the Refraction Ratio
        # How does the specific color frequency bend the white light?
        refraction = (color_freq / base_freq) * PRISM_ANGLE
        
        # Radiate the light into the spectrum
        try:
            # The 'Radiance' formula: White Light scaled by the Refraction Ratio
            radiance = (white_light / refraction) ** (1/3)  # Cube root to keep it perceivable
            
            # Format for JSON (scientific notation string if too large)
            if radiance > 1e100:
                radiance_str = f"{radiance:.2e}"
            else:
                radiance_str = radiance
                
            spectrum_results[color_freq] = {
                "radiance": radiance_str,
                "refraction_ratio": refraction,
                "intensity": int(color_freq / 100),
                "intensity_bar": "█" * int(color_freq / 100)
            }
        except ZeroDivisionError:
            continue
            
    return {
        "base_frequency": base_freq,
        "prism_angle": PRISM_ANGLE,
        "white_light": "sys.float_info.max",
        "spectrum": spectrum_results
    }


# --- Execute when run directly ---
if __name__ == "__main__":
    result = engine.calculate(432, polarity=1)
    
    print(f"Frequency: {result['input_hz']} Hz")
    print(f"Polarity: {result['polarity']}")
    print(f"Harmonic Index: {result['harmonic_index']}")
    print(f"System State: {result['status']}")
    print(f"Components: {result['components']}")
    
    print("\n--- RADIATING SPECTRUM ---")
    spectrum = radiate_spectrum(432)
    for freq, data in spectrum["spectrum"].items():
        intensity = "█" * data["intensity"]
        print(f"Freq: {freq}Hz | Intensity: {intensity} | Radiance: {data['radiance']:.2e}")
