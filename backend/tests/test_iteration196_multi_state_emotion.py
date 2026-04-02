"""
Iteration 196: Multi-State Emotion Layering System Tests
Tests for:
- POST /api/moods with single mood (backward compat)
- POST /api/moods with moods array (multi-state)
- Response includes frequency_stack, geometry_stack, resonance_type
- Single mood returns resonance_type='pure', multi returns 'chorded'
- Mood ID to solfeggio frequency mapping (inspired=963, peaceful=432, stressed=396)
- geometry_stack contains sacred geometry names
- Regression: GET /api/moods, GET /api/moods/insights, GET /api/cosmic-map/power-spots, GET /api/sync/leaderboard
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"

# Expected frequency mappings
EXPECTED_FREQUENCIES = {
    'inspired': 963,
    'peaceful': 432,
    'stressed': 396,
    'happy': 528,
    'energized': 741,
    'grateful': 639,
    'curious': 852,
    'hopeful': 528,
    'creative': 741,
    'connected': 639,
    'brave': 396,
    'anxious': 417,
    'tired': 174,
    'sad': 285,
    'unfocused': 741,
    'restless': 417,
    'angry': 396,
    'lonely': 639,
    'overwhelmed': 285,
    'grief': 174,
    'numb': 285,
    'fearful': 396,
    'frustrated': 417,
    'burnout': 174,
    'disconnected': 285,
    'jealous': 417,
    'impatient': 396,
    'bored': 528,
    'nostalgic': 639,
    'awakening': 963,
    'seeking': 852,
    'grounding': 174,
    'expansive': 963,
}

# Expected geometry mappings
EXPECTED_GEOMETRIES = {
    528: 'icosahedron',
    432: 'flower_of_life',
    741: 'metatrons_cube',
    639: 'vesica_piscis',
    852: 'sri_yantra',
    963: 'merkaba',
    396: 'tetrahedron',
    417: 'cube',
    174: 'sphere',
    285: 'octahedron',
}


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture
def auth_headers(auth_token):
    """Auth headers for requests"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestSingleMoodBackwardCompat:
    """Test single mood submission (backward compatibility)"""
    
    def test_single_mood_submission(self, auth_headers):
        """POST /api/moods with single mood should work"""
        response = requests.post(f"{BASE_URL}/api/moods", json={
            "mood": "Peaceful",
            "intensity": 7,
            "note": "Test single mood"
        }, headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify basic fields
        assert "id" in data
        assert data["mood"] == "Peaceful"
        assert data["intensity"] == 7
        
        # Verify new multi-state fields exist
        assert "frequency_stack" in data
        assert "geometry_stack" in data
        assert "resonance_type" in data
        
        # Single mood should return 'pure' resonance
        assert data["resonance_type"] == "pure", f"Expected 'pure', got {data['resonance_type']}"
        
        print(f"PASS: Single mood submission works with resonance_type='pure'")
    
    def test_single_mood_frequency_mapping(self, auth_headers):
        """Single mood should map to correct solfeggio frequency"""
        response = requests.post(f"{BASE_URL}/api/moods", json={
            "mood": "Inspired",
            "moods": ["inspired"],  # Explicit single mood in array
            "intensity": 8
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # inspired should map to 963Hz
        assert 963 in data["frequency_stack"], f"Expected 963 in frequency_stack, got {data['frequency_stack']}"
        assert data["resonance_type"] == "pure"
        
        print(f"PASS: inspired maps to 963Hz correctly")


class TestMultiMoodSubmission:
    """Test multi-mood submission (new feature)"""
    
    def test_multi_mood_submission(self, auth_headers):
        """POST /api/moods with moods array should work"""
        response = requests.post(f"{BASE_URL}/api/moods", json={
            "mood": "Inspired",  # Primary mood
            "moods": ["inspired", "peaceful", "curious"],
            "intensity": 8,
            "note": "Test multi-mood layering"
        }, headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify multi-state fields
        assert "frequency_stack" in data
        assert "geometry_stack" in data
        assert "resonance_type" in data
        
        # Multi-mood should return 'chorded' resonance
        assert data["resonance_type"] == "chorded", f"Expected 'chorded', got {data['resonance_type']}"
        
        # Verify moods array is stored
        assert "moods" in data
        assert len(data["moods"]) == 3
        assert "inspired" in data["moods"]
        assert "peaceful" in data["moods"]
        assert "curious" in data["moods"]
        
        print(f"PASS: Multi-mood submission works with resonance_type='chorded'")
    
    def test_multi_mood_frequency_stack(self, auth_headers):
        """Multi-mood should return correct frequency stack"""
        response = requests.post(f"{BASE_URL}/api/moods", json={
            "mood": "Inspired",
            "moods": ["inspired", "peaceful", "stressed"],
            "intensity": 6
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        freq_stack = data["frequency_stack"]
        
        # Verify expected frequencies are present
        # inspired=963, peaceful=432, stressed=396
        assert 963 in freq_stack, f"Expected 963 (inspired) in {freq_stack}"
        assert 432 in freq_stack, f"Expected 432 (peaceful) in {freq_stack}"
        assert 396 in freq_stack, f"Expected 396 (stressed) in {freq_stack}"
        
        print(f"PASS: frequency_stack contains correct Hz values: {freq_stack}")
    
    def test_multi_mood_geometry_stack(self, auth_headers):
        """Multi-mood should return correct geometry stack"""
        response = requests.post(f"{BASE_URL}/api/moods", json={
            "mood": "Inspired",
            "moods": ["inspired", "peaceful"],
            "intensity": 7
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        geom_stack = data["geometry_stack"]
        
        # inspired=963→merkaba, peaceful=432→flower_of_life
        assert "merkaba" in geom_stack, f"Expected 'merkaba' in {geom_stack}"
        assert "flower_of_life" in geom_stack, f"Expected 'flower_of_life' in {geom_stack}"
        
        print(f"PASS: geometry_stack contains sacred geometry names: {geom_stack}")


class TestFrequencyMappings:
    """Test specific mood to frequency mappings"""
    
    @pytest.mark.parametrize("mood_id,expected_freq", [
        ("inspired", 963),
        ("peaceful", 432),
        ("stressed", 396),
        ("happy", 528),
        ("curious", 852),
        ("tired", 174),
        ("anxious", 417),
    ])
    def test_mood_frequency_mapping(self, auth_headers, mood_id, expected_freq):
        """Each mood ID should map to correct solfeggio frequency"""
        response = requests.post(f"{BASE_URL}/api/moods", json={
            "mood": mood_id.capitalize(),
            "moods": [mood_id],
            "intensity": 5
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert expected_freq in data["frequency_stack"], \
            f"Expected {expected_freq}Hz for {mood_id}, got {data['frequency_stack']}"
        
        print(f"PASS: {mood_id} → {expected_freq}Hz")


class TestGeometryMappings:
    """Test frequency to geometry mappings"""
    
    def test_geometry_for_963hz(self, auth_headers):
        """963Hz (inspired/awakening/expansive) should map to merkaba"""
        response = requests.post(f"{BASE_URL}/api/moods", json={
            "mood": "Inspired",
            "moods": ["inspired"],
            "intensity": 5
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "merkaba" in data["geometry_stack"]
        print("PASS: 963Hz → merkaba")
    
    def test_geometry_for_432hz(self, auth_headers):
        """432Hz (peaceful) should map to flower_of_life"""
        response = requests.post(f"{BASE_URL}/api/moods", json={
            "mood": "Peaceful",
            "moods": ["peaceful"],
            "intensity": 5
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "flower_of_life" in data["geometry_stack"]
        print("PASS: 432Hz → flower_of_life")
    
    def test_geometry_for_396hz(self, auth_headers):
        """396Hz (stressed/angry/brave) should map to tetrahedron"""
        response = requests.post(f"{BASE_URL}/api/moods", json={
            "mood": "Stressed",
            "moods": ["stressed"],
            "intensity": 5
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "tetrahedron" in data["geometry_stack"]
        print("PASS: 396Hz → tetrahedron")


class TestRegressionEndpoints:
    """Regression tests for existing endpoints"""
    
    def test_get_moods_history(self, auth_headers):
        """GET /api/moods should return mood history"""
        response = requests.get(f"{BASE_URL}/api/moods", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: GET /api/moods returns {len(data)} entries")
    
    def test_get_mood_insights(self, auth_headers):
        """GET /api/moods/insights should return insights data"""
        response = requests.get(f"{BASE_URL}/api/moods/insights", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        # Should have has_data field
        assert "has_data" in data
        print(f"PASS: GET /api/moods/insights returns has_data={data.get('has_data')}")
    
    def test_get_power_spots(self, auth_headers):
        """GET /api/cosmic-map/power-spots should work"""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/power-spots", headers=auth_headers)
        
        assert response.status_code == 200
        print("PASS: GET /api/cosmic-map/power-spots returns 200")
    
    def test_get_leaderboard(self, auth_headers):
        """GET /api/sync/leaderboard should work"""
        response = requests.get(f"{BASE_URL}/api/sync/leaderboard", headers=auth_headers)
        
        assert response.status_code == 200
        print("PASS: GET /api/sync/leaderboard returns 200")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
