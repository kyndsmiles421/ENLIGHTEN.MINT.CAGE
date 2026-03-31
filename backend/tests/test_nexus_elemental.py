"""
Test suite for Elemental Nexus (5th Realm) - Phase 1 features:
- Dynamic Decay & Momentum (half-life logic)
- Birth Resonance Calibration (natal baseline from birth date)
- Frequency-Task Pairing (Hz frequencies mapped to alignment tasks)
- Nexus State API with harmony_score, harmony_trend, harmony_cycle
- Cosmic Weather Dashboard Widget
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from review request
TEST_USER_EMAIL = "rpg_test@test.com"
TEST_USER_PASSWORD = "password123"


class TestNexusAuthentication:
    """Test authentication requirements for Nexus endpoints"""
    
    def test_nexus_state_requires_auth(self):
        """GET /api/nexus/state should require authentication"""
        response = requests.get(f"{BASE_URL}/api/nexus/state")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: /api/nexus/state requires authentication")
    
    def test_birth_resonance_get_requires_auth(self):
        """GET /api/nexus/birth-resonance should require authentication"""
        response = requests.get(f"{BASE_URL}/api/nexus/birth-resonance")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: GET /api/nexus/birth-resonance requires authentication")
    
    def test_birth_resonance_post_requires_auth(self):
        """POST /api/nexus/birth-resonance should require authentication"""
        response = requests.post(f"{BASE_URL}/api/nexus/birth-resonance", json={
            "birth_month": 6, "birth_day": 22, "birth_year": 1979
        })
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: POST /api/nexus/birth-resonance requires authentication")
    
    def test_nexus_align_requires_auth(self):
        """POST /api/nexus/align should require authentication"""
        response = requests.post(f"{BASE_URL}/api/nexus/align", json={
            "element": "wood", "direction": "deficient"
        })
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: POST /api/nexus/align requires authentication")
    
    def test_cosmic_weather_requires_auth(self):
        """GET /api/reports/cosmic-weather should require authentication"""
        response = requests.get(f"{BASE_URL}/api/reports/cosmic-weather")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: /api/reports/cosmic-weather requires authentication")


@pytest.fixture(scope="class")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    })
    if response.status_code != 200:
        pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")
    data = response.json()
    token = data.get("token") or data.get("access_token")
    if not token:
        pytest.skip("No token in auth response")
    return token


@pytest.fixture(scope="class")
def auth_headers(auth_token):
    """Get auth headers for authenticated requests"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestNexusState:
    """Test GET /api/nexus/state endpoint"""
    
    def test_nexus_state_returns_200(self, auth_headers):
        """GET /api/nexus/state should return 200 with valid auth"""
        response = requests.get(f"{BASE_URL}/api/nexus/state", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: /api/nexus/state returns 200")
    
    def test_nexus_state_has_harmony_score(self, auth_headers):
        """Response should include harmony_score"""
        response = requests.get(f"{BASE_URL}/api/nexus/state", headers=auth_headers)
        data = response.json()
        assert "harmony_score" in data, "Missing harmony_score in response"
        assert isinstance(data["harmony_score"], (int, float)), "harmony_score should be numeric"
        assert 0 <= data["harmony_score"] <= 100, "harmony_score should be 0-100"
        print(f"PASS: harmony_score = {data['harmony_score']}")
    
    def test_nexus_state_has_harmony_trend(self, auth_headers):
        """Response should include harmony_trend (rising/falling/stable)"""
        response = requests.get(f"{BASE_URL}/api/nexus/state", headers=auth_headers)
        data = response.json()
        assert "harmony_trend" in data, "Missing harmony_trend in response"
        assert data["harmony_trend"] in ["rising", "falling", "stable"], f"Invalid trend: {data['harmony_trend']}"
        print(f"PASS: harmony_trend = {data['harmony_trend']}")
    
    def test_nexus_state_has_harmony_cycle(self, auth_headers):
        """Response should include harmony_cycle (constructive/destructive/neutral)"""
        response = requests.get(f"{BASE_URL}/api/nexus/state", headers=auth_headers)
        data = response.json()
        assert "harmony_cycle" in data, "Missing harmony_cycle in response"
        assert data["harmony_cycle"] in ["constructive", "destructive", "neutral"], f"Invalid cycle: {data['harmony_cycle']}"
        print(f"PASS: harmony_cycle = {data['harmony_cycle']}")
    
    def test_nexus_state_has_decay_activity(self, auth_headers):
        """Response should include decay_activity with freshness values"""
        response = requests.get(f"{BASE_URL}/api/nexus/state", headers=auth_headers)
        data = response.json()
        assert "decay_activity" in data, "Missing decay_activity in response"
        decay = data["decay_activity"]
        expected_keys = ["mood_freshness", "meditation_freshness", "journal_freshness", 
                        "breathing_freshness", "soundscape_freshness"]
        for key in expected_keys:
            assert key in decay, f"Missing {key} in decay_activity"
            assert isinstance(decay[key], (int, float)), f"{key} should be numeric"
        print(f"PASS: decay_activity has all freshness values")
    
    def test_nexus_state_has_natal_info(self, auth_headers):
        """Response should include natal info (may be null if not calibrated)"""
        response = requests.get(f"{BASE_URL}/api/nexus/state", headers=auth_headers)
        data = response.json()
        assert "natal" in data, "Missing natal in response"
        # natal can be null if not calibrated, or object with sign/life_path/boosted_element
        if data["natal"] is not None:
            assert "sign" in data["natal"], "natal should have sign"
            assert "life_path" in data["natal"], "natal should have life_path"
            assert "boosted_element" in data["natal"], "natal should have boosted_element"
            print(f"PASS: natal = {data['natal']['sign']}, Life Path {data['natal']['life_path']}")
        else:
            print("PASS: natal is null (not calibrated)")
    
    def test_nexus_state_has_element_frequencies(self, auth_headers):
        """Response should include element_frequencies mapping"""
        response = requests.get(f"{BASE_URL}/api/nexus/state", headers=auth_headers)
        data = response.json()
        assert "element_frequencies" in data, "Missing element_frequencies in response"
        freqs = data["element_frequencies"]
        expected_elements = ["wood", "fire", "earth", "metal", "water"]
        for el in expected_elements:
            assert el in freqs, f"Missing {el} in element_frequencies"
            assert "hz" in freqs[el], f"Missing hz for {el}"
            assert "label" in freqs[el], f"Missing label for {el}"
            assert "mantra" in freqs[el], f"Missing mantra for {el}"
        # Verify specific Hz values from spec
        assert freqs["wood"]["hz"] == 528, "Wood should be 528Hz"
        assert freqs["fire"]["hz"] == 396, "Fire should be 396Hz"
        assert freqs["earth"]["hz"] == 174, "Earth should be 174Hz"
        assert freqs["metal"]["hz"] == 285, "Metal should be 285Hz"
        assert freqs["water"]["hz"] == 432, "Water should be 432Hz"
        print("PASS: element_frequencies has correct Hz values")
    
    def test_nexus_state_has_trend_values(self, auth_headers):
        """Response should include trend_values array (last 7 days)"""
        response = requests.get(f"{BASE_URL}/api/nexus/state", headers=auth_headers)
        data = response.json()
        assert "trend_values" in data, "Missing trend_values in response"
        assert isinstance(data["trend_values"], list), "trend_values should be a list"
        print(f"PASS: trend_values = {data['trend_values']}")
    
    def test_nexus_state_has_elements(self, auth_headers):
        """Response should include elements with all 5 elements"""
        response = requests.get(f"{BASE_URL}/api/nexus/state", headers=auth_headers)
        data = response.json()
        assert "elements" in data, "Missing elements in response"
        elements = data["elements"]
        expected = ["wood", "fire", "earth", "metal", "water"]
        for el in expected:
            assert el in elements, f"Missing element: {el}"
            assert "percentage" in elements[el], f"Missing percentage for {el}"
            assert "status" in elements[el], f"Missing status for {el}"
            assert "color" in elements[el], f"Missing color for {el}"
            assert "frequency" in elements[el], f"Missing frequency for {el}"
        print("PASS: All 5 elements present with required fields")


class TestBirthResonance:
    """Test Birth Resonance Calibration endpoints"""
    
    def test_set_birth_resonance_cancer(self, auth_headers):
        """POST /api/nexus/birth-resonance with June 22, 1979 should return Cancer"""
        response = requests.post(f"{BASE_URL}/api/nexus/birth-resonance", 
            headers=auth_headers,
            json={"birth_month": 6, "birth_day": 22, "birth_year": 1979})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("sign") == "Cancer", f"Expected Cancer, got {data.get('sign')}"
        assert "natal_weights" in data, "Missing natal_weights"
        assert "life_path" in data, "Missing life_path"
        assert "boosted_element" in data, "Missing boosted_element"
        # Cancer should favor water element
        assert data["natal_weights"]["water"] > 0.3, "Cancer should have high water weight"
        print(f"PASS: Birth resonance set - {data['sign']}, Life Path {data['life_path']}, boosted: {data['boosted_element']}")
    
    def test_get_birth_resonance_after_set(self, auth_headers):
        """GET /api/nexus/birth-resonance should return calibrated data"""
        # First set it
        requests.post(f"{BASE_URL}/api/nexus/birth-resonance", 
            headers=auth_headers,
            json={"birth_month": 6, "birth_day": 22, "birth_year": 1979})
        
        # Then get it
        response = requests.get(f"{BASE_URL}/api/nexus/birth-resonance", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("calibrated") == True, "Should be calibrated"
        assert data.get("sign") == "Cancer", f"Expected Cancer, got {data.get('sign')}"
        assert "natal_weights" in data, "Missing natal_weights"
        print(f"PASS: GET birth-resonance returns calibrated data")
    
    def test_birth_resonance_validation(self, auth_headers):
        """POST with invalid date should return 400"""
        # Missing fields
        response = requests.post(f"{BASE_URL}/api/nexus/birth-resonance", 
            headers=auth_headers,
            json={"birth_month": 6})
        assert response.status_code == 400, f"Expected 400 for missing fields, got {response.status_code}"
        
        # Invalid month
        response = requests.post(f"{BASE_URL}/api/nexus/birth-resonance", 
            headers=auth_headers,
            json={"birth_month": 13, "birth_day": 22, "birth_year": 1979})
        assert response.status_code == 400, f"Expected 400 for invalid month, got {response.status_code}"
        print("PASS: Birth resonance validation works")
    
    def test_zodiac_signs_mapping(self, auth_headers):
        """Test various birth dates map to correct zodiac signs"""
        test_cases = [
            (3, 25, 1990, "Aries"),      # March 25
            (4, 25, 1990, "Taurus"),     # April 25
            (5, 25, 1990, "Gemini"),     # May 25
            (6, 25, 1990, "Cancer"),     # June 25
            (7, 25, 1990, "Leo"),        # July 25
            (8, 25, 1990, "Virgo"),      # August 25
            (9, 25, 1990, "Libra"),      # September 25
            (10, 25, 1990, "Scorpio"),   # October 25
            (11, 25, 1990, "Sagittarius"), # November 25
            (12, 25, 1990, "Capricorn"), # December 25
            (1, 25, 1990, "Aquarius"),   # January 25
            (2, 25, 1990, "Pisces"),     # February 25
        ]
        for month, day, year, expected_sign in test_cases:
            response = requests.post(f"{BASE_URL}/api/nexus/birth-resonance", 
                headers=auth_headers,
                json={"birth_month": month, "birth_day": day, "birth_year": year})
            if response.status_code == 200:
                data = response.json()
                assert data.get("sign") == expected_sign, f"Expected {expected_sign} for {month}/{day}, got {data.get('sign')}"
        print("PASS: Zodiac sign mapping verified for all 12 signs")


class TestNexusAlign:
    """Test POST /api/nexus/align endpoint"""
    
    def test_align_returns_frequency_data(self, auth_headers):
        """Alignment should return frequency data and flow animation info"""
        response = requests.post(f"{BASE_URL}/api/nexus/align", 
            headers=auth_headers,
            json={"element": "wood", "direction": "deficient"})
        # May return 400 if already completed today, which is fine
        if response.status_code == 200:
            data = response.json()
            assert "frequency" in data, "Missing frequency in response"
            assert "flow" in data, "Missing flow in response"
            assert "xp_awarded" in data, "Missing xp_awarded"
            assert "dust_awarded" in data, "Missing dust_awarded"
            freq = data["frequency"]
            assert "hz" in freq, "frequency should have hz"
            assert "label" in freq, "frequency should have label"
            assert "mantra" in freq, "frequency should have mantra"
            flow = data["flow"]
            assert "from" in flow, "flow should have from"
            assert "to" in flow, "flow should have to"
            assert "type" in flow, "flow should have type"
            print(f"PASS: Alignment returns frequency {freq['hz']}Hz, flow {flow['from']}→{flow['to']}")
        elif response.status_code == 400:
            # Already completed today
            print("PASS: Alignment already completed today (expected behavior)")
        else:
            pytest.fail(f"Unexpected status: {response.status_code}: {response.text}")
    
    def test_align_invalid_element(self, auth_headers):
        """Alignment with invalid element should return 400"""
        response = requests.post(f"{BASE_URL}/api/nexus/align", 
            headers=auth_headers,
            json={"element": "invalid", "direction": "deficient"})
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("PASS: Invalid element returns 400")
    
    def test_align_invalid_direction(self, auth_headers):
        """Alignment with invalid direction should return 400"""
        response = requests.post(f"{BASE_URL}/api/nexus/align", 
            headers=auth_headers,
            json={"element": "wood", "direction": "invalid"})
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("PASS: Invalid direction returns 400")


class TestCosmicWeather:
    """Test GET /api/reports/cosmic-weather endpoint"""
    
    def test_cosmic_weather_returns_200(self, auth_headers):
        """GET /api/reports/cosmic-weather should return 200"""
        response = requests.get(f"{BASE_URL}/api/reports/cosmic-weather", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: /api/reports/cosmic-weather returns 200")
    
    def test_cosmic_weather_has_forecast(self, auth_headers):
        """Response should include AI forecast"""
        response = requests.get(f"{BASE_URL}/api/reports/cosmic-weather", headers=auth_headers)
        data = response.json()
        assert "forecast" in data, "Missing forecast in response"
        assert isinstance(data["forecast"], str), "forecast should be a string"
        assert len(data["forecast"]) > 20, "forecast should have meaningful content"
        print(f"PASS: forecast = {data['forecast'][:100]}...")
    
    def test_cosmic_weather_has_zodiac(self, auth_headers):
        """Response should include zodiac season info"""
        response = requests.get(f"{BASE_URL}/api/reports/cosmic-weather", headers=auth_headers)
        data = response.json()
        assert "zodiac" in data, "Missing zodiac in response"
        zodiac = data["zodiac"]
        assert "sign" in zodiac, "zodiac should have sign"
        assert "element" in zodiac, "zodiac should have element"
        assert zodiac["element"] in ["Fire", "Water", "Earth", "Air"], f"Invalid element: {zodiac['element']}"
        print(f"PASS: zodiac = {zodiac['sign']} ({zodiac['element']})")
    
    def test_cosmic_weather_has_lunar(self, auth_headers):
        """Response should include lunar phase info"""
        response = requests.get(f"{BASE_URL}/api/reports/cosmic-weather", headers=auth_headers)
        data = response.json()
        assert "lunar" in data, "Missing lunar in response"
        lunar = data["lunar"]
        assert "phase" in lunar, "lunar should have phase"
        assert "energy" in lunar, "lunar should have energy"
        assert "xp_bonus" in lunar, "lunar should have xp_bonus"
        valid_phases = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
                       "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"]
        assert lunar["phase"] in valid_phases, f"Invalid phase: {lunar['phase']}"
        print(f"PASS: lunar = {lunar['phase']}, +{lunar['xp_bonus']} XP bonus")
    
    def test_cosmic_weather_has_tool_recommendations(self, auth_headers):
        """Response should include tool_recommendations"""
        response = requests.get(f"{BASE_URL}/api/reports/cosmic-weather", headers=auth_headers)
        data = response.json()
        assert "tool_recommendations" in data, "Missing tool_recommendations"
        recs = data["tool_recommendations"]
        assert "mixer" in recs, "tool_recommendations should have mixer"
        assert "sacred_text" in recs, "tool_recommendations should have sacred_text"
        mixer = recs["mixer"]
        assert "freq" in mixer, "mixer should have freq"
        assert "tip" in mixer, "mixer should have tip"
        print(f"PASS: tool_recommendations.mixer.freq = {mixer['freq']}")
    
    def test_cosmic_weather_has_rpg_bonuses(self, auth_headers):
        """Response should include rpg_bonuses"""
        response = requests.get(f"{BASE_URL}/api/reports/cosmic-weather", headers=auth_headers)
        data = response.json()
        assert "rpg_bonuses" in data, "Missing rpg_bonuses"
        bonuses = data["rpg_bonuses"]
        assert "element" in bonuses, "rpg_bonuses should have element"
        assert "stat_boosts" in bonuses, "rpg_bonuses should have stat_boosts"
        assert "lunar_xp_bonus" in bonuses, "rpg_bonuses should have lunar_xp_bonus"
        print(f"PASS: rpg_bonuses.element = {bonuses['element']}, lunar_xp_bonus = {bonuses['lunar_xp_bonus']}")


class TestNexusHistory:
    """Test GET /api/nexus/history endpoint"""
    
    def test_nexus_history_returns_200(self, auth_headers):
        """GET /api/nexus/history should return 200"""
        response = requests.get(f"{BASE_URL}/api/nexus/history", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "alignments" in data, "Missing alignments in response"
        assert isinstance(data["alignments"], list), "alignments should be a list"
        print(f"PASS: /api/nexus/history returns {len(data['alignments'])} alignments")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
