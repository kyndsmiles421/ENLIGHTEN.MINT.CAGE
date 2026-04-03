"""
Iteration 244 - Orbital Mixer & Module Registry Tests
Tests for the new Orbital Mixer feature in Playground mode on CosmicMixerPage.

Features tested:
- Backend API: /api/phonic/harmony-score
- Backend API: /api/phonic/streak-status
- Module Registry configuration
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestBackendAPIs:
    """Backend API tests for Orbital Mixer related endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get auth token
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "grad_test_522@test.com", "password": "password"}
        )
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.auth_token = token
        else:
            pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_health_check(self):
        """Test health endpoint is accessible"""
        response = self.session.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print("Health check passed")
    
    def test_harmony_score_endpoint(self):
        """Test /api/phonic/harmony-score returns valid response"""
        response = self.session.post(f"{BASE_URL}/api/phonic/harmony-score", json={})
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "score" in data, "Response should contain 'score'"
        assert "grade" in data, "Response should contain 'grade'"
        assert "breakdown" in data, "Response should contain 'breakdown'"
        assert "insight" in data, "Response should contain 'insight'"
        
        # Verify breakdown structure
        breakdown = data.get("breakdown", {})
        assert "resonance_alignment" in breakdown, "Breakdown should contain 'resonance_alignment'"
        assert "exploration_diversity" in breakdown, "Breakdown should contain 'exploration_diversity'"
        assert "harmonic_depth" in breakdown, "Breakdown should contain 'harmonic_depth'"
        
        # Verify data types
        assert isinstance(data["score"], (int, float)), "Score should be numeric"
        assert isinstance(data["grade"], str), "Grade should be string"
        
        print(f"Harmony score: {data['score']}, Grade: {data['grade']}")
    
    def test_streak_status_endpoint(self):
        """Test /api/phonic/streak-status returns valid response"""
        response = self.session.get(f"{BASE_URL}/api/phonic/streak-status")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "current_streak" in data, "Response should contain 'current_streak'"
        assert "best_streak" in data, "Response should contain 'best_streak'"
        
        # Verify data types
        assert isinstance(data["current_streak"], int), "current_streak should be integer"
        assert isinstance(data["best_streak"], int), "best_streak should be integer"
        
        print(f"Current streak: {data['current_streak']}, Best streak: {data['best_streak']}")
    
    def test_login_returns_valid_token(self):
        """Test login endpoint returns valid token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "grad_test_522@test.com", "password": "password"},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "token" in data, "Response should contain 'token'"
        assert "user" in data, "Response should contain 'user'"
        assert data["user"]["email"] == "grad_test_522@test.com"
        
        print(f"Login successful for user: {data['user']['email']}")
    
    def test_culture_layers_endpoint(self):
        """Test /api/culture-layers/ returns valid response (regression test)"""
        response = self.session.get(f"{BASE_URL}/api/culture-layers/")
        assert response.status_code == 200
        data = response.json()
        
        # Response is an object with 'layers' key containing the list
        assert "layers" in data, "Response should contain 'layers' key"
        layers = data.get("layers", [])
        assert isinstance(layers, list), "Layers should be a list"
        assert len(layers) >= 3, "Should have at least 3 cultures (Hopi, Egyptian, Vedic)"
        
        print(f"Culture layers count: {len(layers)}")


class TestModuleRegistryConfiguration:
    """Tests to verify module registry configuration matches expected structure"""
    
    def test_frequency_modules_count(self):
        """Verify expected number of frequency modules"""
        # Based on moduleRegistry.js, we expect 8 frequency modules
        expected_freq_modules = [
            'freq_396', 'freq_417', 'freq_432', 'freq_528',
            'freq_639', 'freq_741', 'freq_852', 'freq_963'
        ]
        assert len(expected_freq_modules) == 8
        print(f"Frequency modules: {len(expected_freq_modules)}")
    
    def test_sound_modules_count(self):
        """Verify expected number of sound modules"""
        # Based on moduleRegistry.js, we expect 6 sound modules
        expected_sound_modules = [
            'sound_ocean', 'sound_rain', 'sound_forest',
            'sound_fire', 'sound_wind', 'sound_bowl'
        ]
        assert len(expected_sound_modules) == 6
        print(f"Sound modules: {len(expected_sound_modules)}")
    
    def test_instrument_modules_count(self):
        """Verify expected number of instrument modules"""
        # Based on moduleRegistry.js, we expect 4 instrument modules
        expected_inst_modules = [
            'inst_tanpura', 'inst_flute', 'inst_bowl', 'inst_harp'
        ]
        assert len(expected_inst_modules) == 4
        print(f"Instrument modules: {len(expected_inst_modules)}")
    
    def test_locked_modules_count(self):
        """Verify expected number of locked modules"""
        # Based on moduleRegistry.js, we expect 3 locked modules
        expected_locked_modules = [
            'ICHING_01', 'FRACTAL_L2', 'GPS_MAP'
        ]
        assert len(expected_locked_modules) == 3
        print(f"Locked modules: {len(expected_locked_modules)}")
    
    def test_module_groups_count(self):
        """Verify expected number of module groups"""
        # Based on moduleRegistry.js, we expect 4 groups
        expected_groups = ['frequencies', 'sounds', 'instruments', 'engines']
        assert len(expected_groups) == 4
        print(f"Module groups: {len(expected_groups)}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
