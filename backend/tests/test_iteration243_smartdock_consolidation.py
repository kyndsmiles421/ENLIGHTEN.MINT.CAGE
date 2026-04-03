"""
Iteration 243 - SmartDock Consolidation Tests
Tests for:
- POST /api/phonic/harmony-score (regression)
- POST /api/phonic/streak-check (regression)
- GET /api/culture-layers/ (regression)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestBackendRegression:
    """Backend regression tests for SmartDock consolidation"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with auth"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.token = token
        else:
            pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_harmony_score_endpoint(self):
        """POST /api/phonic/harmony-score returns score, grade, breakdown, insight"""
        payload = {
            "active_pairs": ["C4-G4", "E4-B4"],
            "total_resonances": 10,
            "strongest_interval": "fifth",
            "session_duration_ms": 60000
        }
        response = self.session.post(f"{BASE_URL}/api/phonic/harmony-score", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "score" in data, "Response missing 'score'"
        assert "grade" in data, "Response missing 'grade'"
        assert "breakdown" in data, "Response missing 'breakdown'"
        assert "insight" in data, "Response missing 'insight'"
        
        # Verify breakdown structure
        breakdown = data["breakdown"]
        assert "resonance_alignment" in breakdown, "Breakdown missing 'resonance_alignment'"
        assert "exploration_diversity" in breakdown, "Breakdown missing 'exploration_diversity'"
        assert "harmonic_depth" in breakdown, "Breakdown missing 'harmonic_depth'"
        
        # Verify score is in valid range
        assert 0 <= data["score"] <= 100, f"Score {data['score']} out of range 0-100"
        
        print(f"PASS: harmony-score returns score={data['score']}, grade={data['grade']}")
    
    def test_harmony_score_empty_data(self):
        """POST /api/phonic/harmony-score with empty data still returns valid response"""
        payload = {
            "active_pairs": [],
            "total_resonances": 0,
            "strongest_interval": "none",
            "session_duration_ms": 0
        }
        response = self.session.post(f"{BASE_URL}/api/phonic/harmony-score", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert "score" in data
        assert "grade" in data
        assert "breakdown" in data
        
        print(f"PASS: harmony-score with empty data returns score={data['score']}")
    
    def test_streak_check_endpoint(self):
        """POST /api/phonic/streak-check returns current_streak, streak_triggered"""
        payload = {
            "active_pairs": ["C4-G4", "E4-B4", "D4-A4"],
            "total_resonances": 15,
            "strongest_interval": "octave",
            "session_duration_ms": 120000
        }
        response = self.session.post(f"{BASE_URL}/api/phonic/streak-check", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "current_streak" in data, "Response missing 'current_streak'"
        assert "streak_triggered" in data, "Response missing 'streak_triggered'"
        
        # Verify types
        assert isinstance(data["current_streak"], int), "current_streak should be int"
        assert isinstance(data["streak_triggered"], bool), "streak_triggered should be bool"
        
        print(f"PASS: streak-check returns current_streak={data['current_streak']}, triggered={data['streak_triggered']}")
    
    def test_culture_layers_endpoint(self):
        """GET /api/culture-layers/ returns cultures list"""
        response = self.session.get(f"{BASE_URL}/api/culture-layers/")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Response is {"layers": [...]}
        assert "layers" in data, "Response missing 'layers' key"
        layers = data["layers"]
        assert isinstance(layers, list), "layers should be a list"
        assert len(layers) >= 3, f"Expected at least 3 cultures, got {len(layers)}"
        
        # Check for expected cultures by name
        culture_names = [c.get("culture", "").lower() for c in layers]
        assert any("hopi" in name for name in culture_names), "Missing Hopi culture"
        assert any("egypt" in name for name in culture_names), "Missing Egyptian culture"
        assert any("vedic" in name or "bharatiya" in name for name in culture_names), "Missing Vedic culture"
        
        print(f"PASS: culture-layers returns {len(layers)} cultures")
    
    def test_streak_status_endpoint(self):
        """GET /api/phonic/streak-status returns streak state"""
        response = self.session.get(f"{BASE_URL}/api/phonic/streak-status")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "current_streak" in data, "Response missing 'current_streak'"
        assert "best_streak" in data, "Response missing 'best_streak'"
        
        print(f"PASS: streak-status returns current={data['current_streak']}, best={data['best_streak']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
