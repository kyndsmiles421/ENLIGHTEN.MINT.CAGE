"""
Test suite for Cosmic Harmonics Engine API
Tests celestial awareness: moon phase, solar cycle, zodiac transit
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHarmonicsCelestial:
    """Tests for /api/harmonics/celestial endpoint"""
    
    def test_celestial_endpoint_returns_200(self):
        """Test that celestial endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/harmonics/celestial")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: /api/harmonics/celestial returns 200")
    
    def test_celestial_returns_moon_data(self):
        """Test that celestial endpoint returns moon phase data"""
        response = requests.get(f"{BASE_URL}/api/harmonics/celestial")
        data = response.json()
        
        assert "moon" in data, "Missing 'moon' key in response"
        moon = data["moon"]
        
        assert "phase" in moon, "Missing 'phase' in moon data"
        assert "phase_id" in moon, "Missing 'phase_id' in moon data"
        assert "cycle" in moon, "Missing 'cycle' in moon data"
        assert "illumination" in moon, "Missing 'illumination' in moon data"
        
        # Validate phase_id is one of expected values
        valid_phases = ["new", "waxing_crescent", "first_quarter", "waxing_gibbous", 
                       "full", "waning_gibbous", "last_quarter", "waning_crescent"]
        assert moon["phase_id"] in valid_phases, f"Invalid phase_id: {moon['phase_id']}"
        
        # Validate illumination is between 0 and 1
        assert 0 <= moon["illumination"] <= 1, f"Illumination out of range: {moon['illumination']}"
        
        # Validate cycle is between 0 and 1
        assert 0 <= moon["cycle"] <= 1, f"Cycle out of range: {moon['cycle']}"
        
        print(f"PASS: Moon data valid - phase: {moon['phase']}, phase_id: {moon['phase_id']}, illumination: {moon['illumination']}")
    
    def test_celestial_returns_solar_data(self):
        """Test that celestial endpoint returns solar cycle data"""
        response = requests.get(f"{BASE_URL}/api/harmonics/celestial")
        data = response.json()
        
        assert "solar" in data, "Missing 'solar' key in response"
        solar = data["solar"]
        
        assert "period" in solar, "Missing 'period' in solar data"
        assert "period_id" in solar, "Missing 'period_id' in solar data"
        assert "color" in solar, "Missing 'color' in solar data"
        
        # Validate period_id is one of expected values
        valid_periods = ["golden_dawn", "morning", "zenith", "golden_dusk", "blue_hour", "night", "void"]
        assert solar["period_id"] in valid_periods, f"Invalid period_id: {solar['period_id']}"
        
        # Validate color is a hex color
        assert solar["color"].startswith("#"), f"Color should be hex: {solar['color']}"
        
        print(f"PASS: Solar data valid - period: {solar['period']}, period_id: {solar['period_id']}")
    
    def test_celestial_returns_zodiac_data(self):
        """Test that celestial endpoint returns zodiac transit data"""
        response = requests.get(f"{BASE_URL}/api/harmonics/celestial")
        data = response.json()
        
        assert "zodiac" in data, "Missing 'zodiac' key in response"
        zodiac = data["zodiac"]
        
        assert "sign" in zodiac, "Missing 'sign' in zodiac data"
        assert "color" in zodiac, "Missing 'color' in zodiac data"
        assert "element" in zodiac, "Missing 'element' in zodiac data"
        assert "theme" in zodiac, "Missing 'theme' in zodiac data"
        
        # Validate sign is one of 12 zodiac signs
        valid_signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
                      "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
        assert zodiac["sign"] in valid_signs, f"Invalid zodiac sign: {zodiac['sign']}"
        
        # Validate element is one of 4 elements
        valid_elements = ["Fire", "Earth", "Air", "Water"]
        assert zodiac["element"] in valid_elements, f"Invalid element: {zodiac['element']}"
        
        print(f"PASS: Zodiac data valid - sign: {zodiac['sign']}, element: {zodiac['element']}")
    
    def test_celestial_returns_guidance_data(self):
        """Test that celestial endpoint returns guidance recommendations"""
        response = requests.get(f"{BASE_URL}/api/harmonics/celestial")
        data = response.json()
        
        assert "guidance" in data, "Missing 'guidance' key in response"
        guidance = data["guidance"]
        
        assert "energy" in guidance, "Missing 'energy' in guidance"
        assert "recommended_frequency" in guidance, "Missing 'recommended_frequency' in guidance"
        assert "recommended_frequency_name" in guidance, "Missing 'recommended_frequency_name' in guidance"
        assert "recommended_meditation" in guidance, "Missing 'recommended_meditation' in guidance"
        assert "affirmation_seed" in guidance, "Missing 'affirmation_seed' in guidance"
        
        # Validate frequency is a positive number
        assert isinstance(guidance["recommended_frequency"], (int, float)), "Frequency should be numeric"
        assert guidance["recommended_frequency"] > 0, "Frequency should be positive"
        
        print(f"PASS: Guidance data valid - energy: {guidance['energy']}, frequency: {guidance['recommended_frequency']}Hz")
    
    def test_celestial_returns_atmosphere_data(self):
        """Test that celestial endpoint returns atmosphere settings"""
        response = requests.get(f"{BASE_URL}/api/harmonics/celestial")
        data = response.json()
        
        assert "atmosphere" in data, "Missing 'atmosphere' key in response"
        atmo = data["atmosphere"]
        
        assert "bg" in atmo, "Missing 'bg' in atmosphere"
        assert "accent" in atmo, "Missing 'accent' in atmosphere"
        assert "particle_density" in atmo, "Missing 'particle_density' in atmosphere"
        assert "nebula_intensity" in atmo, "Missing 'nebula_intensity' in atmosphere"
        
        # Validate colors are hex
        assert atmo["bg"].startswith("#"), f"bg should be hex: {atmo['bg']}"
        assert atmo["accent"].startswith("#"), f"accent should be hex: {atmo['accent']}"
        
        # Validate densities are between 0 and 1
        assert 0 <= atmo["particle_density"] <= 1, f"particle_density out of range: {atmo['particle_density']}"
        assert 0 <= atmo["nebula_intensity"] <= 1, f"nebula_intensity out of range: {atmo['nebula_intensity']}"
        
        print(f"PASS: Atmosphere data valid - accent: {atmo['accent']}, particle_density: {atmo['particle_density']}")
    
    def test_celestial_returns_timestamp(self):
        """Test that celestial endpoint returns timestamp"""
        response = requests.get(f"{BASE_URL}/api/harmonics/celestial")
        data = response.json()
        
        assert "timestamp" in data, "Missing 'timestamp' key in response"
        assert isinstance(data["timestamp"], str), "Timestamp should be string"
        assert "T" in data["timestamp"], "Timestamp should be ISO format"
        
        print(f"PASS: Timestamp valid - {data['timestamp']}")


class TestHarmonicsAtmosphere:
    """Tests for /api/harmonics/atmosphere endpoint"""
    
    def test_atmosphere_endpoint_returns_200(self):
        """Test that atmosphere endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/harmonics/atmosphere")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: /api/harmonics/atmosphere returns 200")
    
    def test_atmosphere_returns_moon_phase(self):
        """Test that atmosphere endpoint returns moon phase"""
        response = requests.get(f"{BASE_URL}/api/harmonics/atmosphere")
        data = response.json()
        
        assert "moon_phase" in data, "Missing 'moon_phase' in response"
        assert "moon_illumination" in data, "Missing 'moon_illumination' in response"
        
        print(f"PASS: Atmosphere moon data - phase: {data['moon_phase']}, illumination: {data['moon_illumination']}")
    
    def test_atmosphere_returns_visual_settings(self):
        """Test that atmosphere endpoint returns visual settings"""
        response = requests.get(f"{BASE_URL}/api/harmonics/atmosphere")
        data = response.json()
        
        assert "bg" in data, "Missing 'bg' in response"
        assert "accent" in data, "Missing 'accent' in response"
        assert "particle_density" in data, "Missing 'particle_density' in response"
        assert "nebula_intensity" in data, "Missing 'nebula_intensity' in response"
        
        print(f"PASS: Atmosphere visual settings - bg: {data['bg']}, accent: {data['accent']}")


class TestMoonPhaseCalculation:
    """Tests for moon phase calculation accuracy"""
    
    def test_moon_phase_id_is_valid(self):
        """Test that moon phase_id is one of the 8 valid phases"""
        response = requests.get(f"{BASE_URL}/api/harmonics/celestial")
        data = response.json()
        
        valid_phase_ids = [
            "new", "waxing_crescent", "first_quarter", "waxing_gibbous",
            "full", "waning_gibbous", "last_quarter", "waning_crescent"
        ]
        
        phase_id = data["moon"]["phase_id"]
        assert phase_id in valid_phase_ids, f"Invalid phase_id: {phase_id}. Expected one of: {valid_phase_ids}"
        
        print(f"PASS: Moon phase_id '{phase_id}' is valid")
    
    def test_moon_illumination_matches_phase(self):
        """Test that illumination roughly matches the phase"""
        response = requests.get(f"{BASE_URL}/api/harmonics/celestial")
        data = response.json()
        
        phase_id = data["moon"]["phase_id"]
        illumination = data["moon"]["illumination"]
        
        # Rough validation based on phase
        if phase_id == "new":
            assert illumination < 0.15, f"New moon should have low illumination, got {illumination}"
        elif phase_id == "full":
            assert illumination > 0.85, f"Full moon should have high illumination, got {illumination}"
        elif "waxing" in phase_id or "waning" in phase_id:
            assert 0.1 < illumination < 0.95, f"Waxing/waning should have mid illumination, got {illumination}"
        
        print(f"PASS: Illumination {illumination} matches phase {phase_id}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
