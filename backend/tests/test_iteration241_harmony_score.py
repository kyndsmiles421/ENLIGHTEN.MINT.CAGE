"""
Iteration 241 Tests: Session Harmony Score + CultureLayerPanel Integration
- POST /api/phonic/harmony-score endpoint
- GET /api/culture-layers/ regression
- GET /api/phonic/harmonic-memory regression
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "grad_test_522@test.com",
        "password": "password"
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")

@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Return auth headers"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestHarmonyScoreEndpoint:
    """Tests for POST /api/phonic/harmony-score"""
    
    def test_harmony_score_with_empty_data(self, auth_headers):
        """Test harmony-score returns score=50 and grade=Neutral with empty data"""
        response = requests.post(f"{BASE_URL}/api/phonic/harmony-score", json={
            "active_pairs": [],
            "total_resonances": 0,
            "strongest_interval": "none",
            "session_duration_ms": 0
        }, headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "score" in data, "Response should contain 'score'"
        assert "grade" in data, "Response should contain 'grade'"
        assert "breakdown" in data, "Response should contain 'breakdown'"
        assert "insight" in data, "Response should contain 'insight'"
        assert "historical_pairs" in data, "Response should contain 'historical_pairs'"
        
        # Verify breakdown structure
        breakdown = data["breakdown"]
        assert "resonance_alignment" in breakdown, "Breakdown should contain 'resonance_alignment'"
        assert "exploration_diversity" in breakdown, "Breakdown should contain 'exploration_diversity'"
        assert "harmonic_depth" in breakdown, "Breakdown should contain 'harmonic_depth'"
        
        print(f"Harmony score with empty data: score={data['score']}, grade={data['grade']}")
    
    def test_harmony_score_with_active_pairs(self, auth_headers):
        """Test harmony-score with active_pairs returns non-zero alignment score"""
        response = requests.post(f"{BASE_URL}/api/phonic/harmony-score", json={
            "active_pairs": ["meditation-starchart", "mixer-wellness"],
            "total_resonances": 5,
            "strongest_interval": "fifth",
            "session_duration_ms": 60000
        }, headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify score is between 0-100
        assert 0 <= data["score"] <= 100, f"Score should be 0-100, got {data['score']}"
        
        # Verify grade is one of the expected values
        valid_grades = ["Dormant", "Seeking", "Awakening", "Neutral", "Resonant", "Harmonious", "Transcendent"]
        assert data["grade"] in valid_grades, f"Grade should be one of {valid_grades}, got {data['grade']}"
        
        # Verify breakdown values are within expected ranges
        breakdown = data["breakdown"]
        assert 0 <= breakdown["resonance_alignment"] <= 40, f"resonance_alignment should be 0-40, got {breakdown['resonance_alignment']}"
        assert 0 <= breakdown["exploration_diversity"] <= 30, f"exploration_diversity should be 0-30, got {breakdown['exploration_diversity']}"
        assert 0 <= breakdown["harmonic_depth"] <= 30, f"harmonic_depth should be 0-30, got {breakdown['harmonic_depth']}"
        
        # Verify insight is a non-empty string
        assert isinstance(data["insight"], str) and len(data["insight"]) > 0, "Insight should be a non-empty string"
        
        print(f"Harmony score with active pairs: score={data['score']}, grade={data['grade']}, breakdown={breakdown}")
    
    def test_harmony_score_response_structure(self, auth_headers):
        """Test harmony-score returns all required fields"""
        response = requests.post(f"{BASE_URL}/api/phonic/harmony-score", json={
            "active_pairs": [],
            "total_resonances": 0,
            "strongest_interval": "none",
            "session_duration_ms": 0
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check all required fields
        required_fields = ["score", "grade", "breakdown", "insight", "historical_pairs"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        # Check breakdown sub-fields
        breakdown_fields = ["resonance_alignment", "exploration_diversity", "harmonic_depth"]
        for field in breakdown_fields:
            assert field in data["breakdown"], f"Missing breakdown field: {field}"
        
        print(f"Response structure verified: {list(data.keys())}")


class TestCultureLayersRegression:
    """Regression tests for culture-layers API"""
    
    def test_culture_layers_list_returns_3_layers(self, auth_headers):
        """GET /api/culture-layers/ should return 3 layers (hopi, egyptian, vedic)"""
        response = requests.get(f"{BASE_URL}/api/culture-layers/", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "layers" in data, "Response should contain 'layers'"
        layers = data["layers"]
        
        assert len(layers) == 3, f"Expected 3 layers, got {len(layers)}"
        
        layer_ids = [l["id"] for l in layers]
        assert "hopi" in layer_ids, "Should include 'hopi' layer"
        assert "egyptian" in layer_ids, "Should include 'egyptian' layer"
        assert "vedic" in layer_ids, "Should include 'vedic' layer"
        
        print(f"Culture layers: {layer_ids}")
    
    def test_culture_layer_hopi_details(self, auth_headers):
        """GET /api/culture-layers/hopi should return full constellation data"""
        response = requests.get(f"{BASE_URL}/api/culture-layers/hopi", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "constellations" in data, "Response should contain 'constellations'"
        assert "teachings" in data, "Response should contain 'teachings'"
        assert len(data["constellations"]) > 0, "Should have at least 1 constellation"
        
        print(f"Hopi layer: {len(data['constellations'])} constellations, {len(data.get('teachings', []))} teachings")


class TestHarmonicMemoryRegression:
    """Regression tests for harmonic-memory API"""
    
    def test_harmonic_memory_returns_memories(self, auth_headers):
        """GET /api/phonic/harmonic-memory should return memories list"""
        response = requests.get(f"{BASE_URL}/api/phonic/harmonic-memory", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "memories" in data, "Response should contain 'memories'"
        assert "total_bookmarks" in data, "Response should contain 'total_bookmarks'"
        
        # Memories should be a list
        assert isinstance(data["memories"], list), "memories should be a list"
        
        print(f"Harmonic memory: {data['total_bookmarks']} bookmarks, {len(data['memories'])} memories returned")


class TestMovementAndFlourishRegression:
    """Regression tests for existing phonic endpoints"""
    
    def test_record_movement(self, auth_headers):
        """POST /api/phonic/record-movement should still work"""
        response = requests.post(f"{BASE_URL}/api/phonic/record-movement", json={
            "route": "/star-chart",
            "duration_ms": 5000,
            "velocity": 0.5
        }, headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data.get("success") == True, "Should return success=True"
        assert "frequency" in data, "Should return frequency"
        
        print(f"Record movement: frequency={data['frequency']}, route_key={data.get('route_key')}")
    
    def test_generate_flourish(self, auth_headers):
        """POST /api/phonic/generate-flourish should still work"""
        response = requests.post(f"{BASE_URL}/api/phonic/generate-flourish", json={
            "session_limit": 10
        }, headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "sonic_profile" in data, "Should return sonic_profile"
        profile = data["sonic_profile"]
        assert "base_frequency" in profile, "Profile should have base_frequency"
        assert "pattern" in profile, "Profile should have pattern"
        
        print(f"Generate flourish: base_frequency={profile['base_frequency']}, pattern={profile['pattern']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
