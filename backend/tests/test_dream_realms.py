"""
Dream Realms API Tests - Procedural Loop Engine
Tests for: /api/dream-realms/active, /dream-realms/complete-challenge, 
/dream-realms/abandon, /dream-realms/history, /dream-realms/legendary-frequencies
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from review request
TEST_EMAIL = "rpg_test@test.com"
TEST_PASSWORD = "password123"


class TestDreamRealmsAuth:
    """Test authentication requirements for Dream Realms endpoints"""
    
    def test_active_realm_requires_auth(self):
        """GET /api/dream-realms/active should require authentication"""
        response = requests.get(f"{BASE_URL}/api/dream-realms/active")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: GET /api/dream-realms/active requires auth")
    
    def test_complete_challenge_requires_auth(self):
        """POST /api/dream-realms/complete-challenge should require authentication"""
        response = requests.post(f"{BASE_URL}/api/dream-realms/complete-challenge", json={"challenge_index": 0})
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: POST /api/dream-realms/complete-challenge requires auth")
    
    def test_abandon_requires_auth(self):
        """POST /api/dream-realms/abandon should require authentication"""
        response = requests.post(f"{BASE_URL}/api/dream-realms/abandon", json={})
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: POST /api/dream-realms/abandon requires auth")
    
    def test_history_requires_auth(self):
        """GET /api/dream-realms/history should require authentication"""
        response = requests.get(f"{BASE_URL}/api/dream-realms/history")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: GET /api/dream-realms/history requires auth")
    
    def test_legendary_frequencies_requires_auth(self):
        """GET /api/dream-realms/legendary-frequencies should require authentication"""
        response = requests.get(f"{BASE_URL}/api/dream-realms/legendary-frequencies")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: GET /api/dream-realms/legendary-frequencies requires auth")


@pytest.fixture(scope="module")
def auth_headers():
    """Get authentication headers for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code != 200:
        pytest.skip(f"Login failed: {response.status_code} - {response.text}")
    
    data = response.json()
    token = data.get("token") or data.get("access_token")
    if not token:
        pytest.skip("No token in login response")
    
    return {"Authorization": f"Bearer {token}"}


class TestDreamRealmsActiveRealm:
    """Test GET /api/dream-realms/active endpoint"""
    
    def test_get_active_realm_returns_realm_data(self, auth_headers):
        """GET /api/dream-realms/active should return realm with required fields"""
        response = requests.get(f"{BASE_URL}/api/dream-realms/active", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify required fields exist
        assert "biome" in data, "Response missing 'biome'"
        assert "difficulty" in data, "Response missing 'difficulty'"
        assert "challenges" in data, "Response missing 'challenges'"
        assert "escape_threshold" in data, "Response missing 'escape_threshold'"
        assert "cosmic_context" in data, "Response missing 'cosmic_context'"
        assert "elements_snapshot" in data, "Response missing 'elements_snapshot'"
        
        print(f"PASS: GET /api/dream-realms/active returns realm data")
        print(f"  - Biome: {data['biome'].get('name', 'Unknown')}")
        print(f"  - Difficulty: {data['difficulty'].get('difficulty', 'Unknown')}x ({data['difficulty'].get('state', 'Unknown')})")
        print(f"  - Challenges: {len(data['challenges'])}")
        print(f"  - Escape threshold: {data['escape_threshold']}")
    
    def test_active_realm_has_biome_structure(self, auth_headers):
        """Biome should have name, atmosphere, visual_distortion, colors"""
        response = requests.get(f"{BASE_URL}/api/dream-realms/active", headers=auth_headers)
        assert response.status_code == 200
        
        biome = response.json().get("biome", {})
        assert "name" in biome, "Biome missing 'name'"
        assert "atmosphere" in biome, "Biome missing 'atmosphere'"
        assert "visual_distortion" in biome, "Biome missing 'visual_distortion'"
        assert "color_primary" in biome, "Biome missing 'color_primary'"
        assert "color_ambient" in biome, "Biome missing 'color_ambient'"
        
        print(f"PASS: Biome structure verified - {biome['name']}, {biome['atmosphere']}")
    
    def test_active_realm_has_difficulty_structure(self, auth_headers):
        """Difficulty should have difficulty, state, description, challenge_count"""
        response = requests.get(f"{BASE_URL}/api/dream-realms/active", headers=auth_headers)
        assert response.status_code == 200
        
        difficulty = response.json().get("difficulty", {})
        assert "difficulty" in difficulty, "Difficulty missing 'difficulty' value"
        assert "state" in difficulty, "Difficulty missing 'state'"
        assert "description" in difficulty, "Difficulty missing 'description'"
        assert "challenge_count" in difficulty, "Difficulty missing 'challenge_count'"
        
        # Verify state is one of expected values
        assert difficulty["state"] in ["tightening", "expanding", "holding"], f"Unexpected state: {difficulty['state']}"
        
        print(f"PASS: Difficulty structure verified - {difficulty['difficulty']}x, {difficulty['state']}")
    
    def test_active_realm_has_cosmic_context(self, auth_headers):
        """Cosmic context should have zodiac, element, natal_sign"""
        response = requests.get(f"{BASE_URL}/api/dream-realms/active", headers=auth_headers)
        assert response.status_code == 200
        
        cosmic = response.json().get("cosmic_context", {})
        assert "zodiac" in cosmic, "Cosmic context missing 'zodiac'"
        assert "element" in cosmic, "Cosmic context missing 'element'"
        assert "natal_sign" in cosmic, "Cosmic context missing 'natal_sign'"
        
        print(f"PASS: Cosmic context verified - {cosmic['zodiac']}, {cosmic['element']}, natal: {cosmic['natal_sign']}")
    
    def test_active_realm_has_elements_snapshot(self, auth_headers):
        """Elements snapshot should have 5 elements with percentage and status"""
        response = requests.get(f"{BASE_URL}/api/dream-realms/active", headers=auth_headers)
        assert response.status_code == 200
        
        elements = response.json().get("elements_snapshot", {})
        expected_elements = ["wood", "fire", "earth", "metal", "water"]
        
        for el in expected_elements:
            assert el in elements, f"Elements snapshot missing '{el}'"
            assert "percentage" in elements[el], f"Element {el} missing 'percentage'"
        
        print(f"PASS: Elements snapshot verified - all 5 elements present")
    
    def test_active_realm_has_challenges(self, auth_headers):
        """Challenges should be an array with task, xp, harmony_boost"""
        response = requests.get(f"{BASE_URL}/api/dream-realms/active", headers=auth_headers)
        assert response.status_code == 200
        
        challenges = response.json().get("challenges", [])
        assert len(challenges) > 0, "No challenges in realm"
        
        for i, ch in enumerate(challenges):
            assert "task" in ch, f"Challenge {i} missing 'task'"
            assert "xp" in ch, f"Challenge {i} missing 'xp'"
            assert "harmony_boost" in ch, f"Challenge {i} missing 'harmony_boost'"
        
        print(f"PASS: Challenges verified - {len(challenges)} challenges with task/xp/harmony_boost")
    
    def test_active_realm_has_narrative(self, auth_headers):
        """Realm should have a narrative (AI-generated or fallback)"""
        response = requests.get(f"{BASE_URL}/api/dream-realms/active", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        # Narrative could be in 'narrative' or 'tighten_narrative' if loop tightened
        has_narrative = "narrative" in data or "tighten_narrative" in data
        assert has_narrative, "Realm missing narrative"
        
        narrative = data.get("narrative") or data.get("tighten_narrative", "")
        assert len(narrative) > 10, "Narrative too short"
        
        print(f"PASS: Narrative present - {len(narrative)} chars")


class TestDreamRealmsCompleteChallenge:
    """Test POST /api/dream-realms/complete-challenge endpoint"""
    
    def test_complete_challenge_awards_xp_and_dust(self, auth_headers):
        """Completing a challenge should award XP and dust"""
        # First get active realm to find an uncompleted challenge
        realm_response = requests.get(f"{BASE_URL}/api/dream-realms/active", headers=auth_headers)
        assert realm_response.status_code == 200
        
        challenges = realm_response.json().get("challenges", [])
        
        # Find first uncompleted challenge
        uncompleted_idx = None
        for i, ch in enumerate(challenges):
            if not ch.get("completed"):
                uncompleted_idx = i
                break
        
        if uncompleted_idx is None:
            pytest.skip("All challenges already completed - cannot test complete-challenge")
        
        # Complete the challenge
        response = requests.post(
            f"{BASE_URL}/api/dream-realms/complete-challenge",
            json={"challenge_index": uncompleted_idx},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "xp_awarded" in data, "Response missing 'xp_awarded'"
        assert "dust_awarded" in data, "Response missing 'dust_awarded'"
        assert "challenges_done" in data, "Response missing 'challenges_done'"
        assert "total_challenges" in data, "Response missing 'total_challenges'"
        assert "current_harmony" in data, "Response missing 'current_harmony'"
        assert "escape_threshold" in data, "Response missing 'escape_threshold'"
        
        assert data["xp_awarded"] > 0, "XP awarded should be positive"
        assert data["dust_awarded"] > 0, "Dust awarded should be positive"
        
        print(f"PASS: Challenge completed - +{data['xp_awarded']} XP, +{data['dust_awarded']} dust")
        print(f"  - Challenges done: {data['challenges_done']}/{data['total_challenges']}")
        print(f"  - Harmony: {data['current_harmony']}/{data['escape_threshold']}")
    
    def test_complete_already_completed_challenge_returns_400(self, auth_headers):
        """Completing an already-completed challenge should return 400"""
        # First get active realm
        realm_response = requests.get(f"{BASE_URL}/api/dream-realms/active", headers=auth_headers)
        assert realm_response.status_code == 200
        
        challenges = realm_response.json().get("challenges", [])
        
        # Find a completed challenge
        completed_idx = None
        for i, ch in enumerate(challenges):
            if ch.get("completed"):
                completed_idx = i
                break
        
        if completed_idx is None:
            pytest.skip("No completed challenges to test duplicate completion")
        
        # Try to complete it again
        response = requests.post(
            f"{BASE_URL}/api/dream-realms/complete-challenge",
            json={"challenge_index": completed_idx},
            headers=auth_headers
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        
        print(f"PASS: Completing already-completed challenge returns 400")
    
    def test_complete_invalid_challenge_index_returns_400(self, auth_headers):
        """Completing with invalid challenge index should return 400"""
        response = requests.post(
            f"{BASE_URL}/api/dream-realms/complete-challenge",
            json={"challenge_index": 999},
            headers=auth_headers
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        
        print(f"PASS: Invalid challenge index returns 400")


class TestDreamRealmsAbandon:
    """Test POST /api/dream-realms/abandon endpoint"""
    
    def test_abandon_realm_marks_abandoned(self, auth_headers):
        """Abandoning realm should mark it as abandoned"""
        # First ensure we have an active realm
        realm_response = requests.get(f"{BASE_URL}/api/dream-realms/active", headers=auth_headers)
        assert realm_response.status_code == 200
        
        # Abandon the realm
        response = requests.post(
            f"{BASE_URL}/api/dream-realms/abandon",
            json={},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "message" in data, "Response missing 'message'"
        
        print(f"PASS: Realm abandoned - {data['message']}")
    
    def test_get_active_after_abandon_generates_new_realm(self, auth_headers):
        """After abandoning, GET active should generate a NEW realm"""
        # Get new active realm (should be generated fresh)
        response = requests.get(f"{BASE_URL}/api/dream-realms/active", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify it's a fresh realm (status should be active, not abandoned)
        assert data.get("status") in ["active", "entering", None], f"Unexpected status: {data.get('status')}"
        
        # Verify it has all required fields
        assert "biome" in data, "New realm missing 'biome'"
        assert "challenges" in data, "New realm missing 'challenges'"
        assert "difficulty" in data, "New realm missing 'difficulty'"
        
        print(f"PASS: New realm generated after abandon - {data['biome'].get('name', 'Unknown')}")
    
    def test_abandon_no_active_realm_returns_404(self, auth_headers):
        """Abandoning when no active realm should return 404"""
        # First abandon current realm
        requests.post(f"{BASE_URL}/api/dream-realms/abandon", json={}, headers=auth_headers)
        
        # Try to abandon again immediately (before new realm is created)
        # Note: This might create a new realm on GET, so we need to be careful
        # Actually, the abandon endpoint checks for active realm, so if we just abandoned,
        # calling abandon again should fail
        
        # Get active to create new realm
        requests.get(f"{BASE_URL}/api/dream-realms/active", headers=auth_headers)
        
        # Now abandon it
        requests.post(f"{BASE_URL}/api/dream-realms/abandon", json={}, headers=auth_headers)
        
        # Try to abandon again without getting active
        response = requests.post(
            f"{BASE_URL}/api/dream-realms/abandon",
            json={},
            headers=auth_headers
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        
        print(f"PASS: Abandon with no active realm returns 404")


class TestDreamRealmsHistory:
    """Test GET /api/dream-realms/history endpoint"""
    
    def test_get_history_returns_past_realms(self, auth_headers):
        """GET /api/dream-realms/history should return past completed/abandoned realms"""
        response = requests.get(f"{BASE_URL}/api/dream-realms/history", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "realms" in data, "Response missing 'realms'"
        assert isinstance(data["realms"], list), "'realms' should be a list"
        
        print(f"PASS: History returns {len(data['realms'])} past realms")
        
        # If there are realms, verify structure
        if len(data["realms"]) > 0:
            realm = data["realms"][0]
            assert "status" in realm, "History realm missing 'status'"
            assert realm["status"] in ["completed", "abandoned"], f"Unexpected status: {realm['status']}"
            assert "biome" in realm, "History realm missing 'biome'"
            
            print(f"  - Most recent: {realm['biome'].get('name', 'Unknown')} ({realm['status']})")


class TestDreamRealmsLegendaryFrequencies:
    """Test GET /api/dream-realms/legendary-frequencies endpoint"""
    
    def test_get_legendary_frequencies_returns_list(self, auth_headers):
        """GET /api/dream-realms/legendary-frequencies should return discovered frequencies"""
        response = requests.get(f"{BASE_URL}/api/dream-realms/legendary-frequencies", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "frequencies" in data, "Response missing 'frequencies'"
        assert isinstance(data["frequencies"], list), "'frequencies' should be a list"
        
        print(f"PASS: Legendary frequencies returns {len(data['frequencies'])} discoveries")
        
        # If there are frequencies, verify structure
        if len(data["frequencies"]) > 0:
            freq = data["frequencies"][0]
            assert "hz" in freq, "Frequency missing 'hz'"
            assert "name" in freq, "Frequency missing 'name'"
            assert "rarity" in freq, "Frequency missing 'rarity'"
            
            print(f"  - Example: {freq['hz']} Hz - {freq['name']} ({freq['rarity']})")


class TestNexusRegression:
    """Regression tests for Nexus page (should still work)"""
    
    def test_nexus_state_still_works(self, auth_headers):
        """GET /api/nexus/state should still return elemental balance"""
        response = requests.get(f"{BASE_URL}/api/nexus/state", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "harmony_score" in data, "Nexus state missing 'harmony_score'"
        assert "elements" in data, "Nexus state missing 'elements'"
        assert "decay_activity" in data, "Nexus state missing 'decay_activity'"
        
        print(f"PASS: Nexus state works - harmony: {data['harmony_score']}")
    
    def test_nexus_birth_resonance_still_works(self, auth_headers):
        """GET /api/nexus/birth-resonance should still return natal data"""
        response = requests.get(f"{BASE_URL}/api/nexus/birth-resonance", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Either calibrated or not
        if data.get("calibrated"):
            assert "sign" in data, "Birth resonance missing 'sign'"
            print(f"PASS: Birth resonance works - {data.get('sign', 'Unknown')}")
        else:
            print(f"PASS: Birth resonance works - not calibrated")


class TestDashboardRegression:
    """Regression tests for Dashboard cosmic weather widget"""
    
    def test_cosmic_weather_still_works(self, auth_headers):
        """GET /api/reports/cosmic-weather should still return weather data"""
        response = requests.get(f"{BASE_URL}/api/reports/cosmic-weather", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "zodiac" in data or "forecast" in data, "Cosmic weather missing expected fields"
        
        print(f"PASS: Cosmic weather works")
        if "zodiac" in data:
            print(f"  - Zodiac: {data['zodiac'].get('sign', 'Unknown')}")
        if "lunar" in data:
            print(f"  - Lunar: {data['lunar'].get('phase', 'Unknown')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
