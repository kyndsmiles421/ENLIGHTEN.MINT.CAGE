"""
Iteration 242 - Resonance Streak Mechanic + External Organic Audio Tests
Tests:
- POST /api/phonic/streak-check with high score increments streak
- POST /api/phonic/streak-check 3x consecutive with score >= 75 returns streak_triggered=true and xp_awarded=50
- POST /api/phonic/streak-check with low score resets streak to 0
- GET /api/phonic/streak-status returns current streak state
- POST /api/phonic/harmony-score regression
- GET /api/culture-layers/ regression
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


class TestIteration242StreakMechanic:
    """Tests for Resonance Streak Mechanic (P0)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip(f"Login failed: {login_response.status_code}")
    
    def test_streak_check_high_score_increments(self):
        """POST /api/phonic/streak-check with high score (total_resonances=15, strongest_interval=octave) returns current_streak incrementing"""
        # First reset streak by sending low score
        reset_payload = {
            "active_pairs": [],
            "total_resonances": 0,
            "strongest_interval": "none",
            "session_duration_ms": 1000
        }
        self.session.post(f"{BASE_URL}/api/phonic/streak-check", json=reset_payload)
        
        # Now send high score
        high_score_payload = {
            "active_pairs": ["starchart-mixer", "meditation-wellness"],
            "total_resonances": 15,
            "strongest_interval": "octave",
            "session_duration_ms": 30000
        }
        response = self.session.post(f"{BASE_URL}/api/phonic/streak-check", json=high_score_payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify response structure
        assert "current_streak" in data
        assert "best_streak" in data
        assert "streak_active" in data
        assert "streak_triggered" in data
        assert "xp_awarded" in data
        assert "total_xp_earned" in data
        assert "score_used" in data
        
        # Verify streak incremented (should be 1 after reset + 1 high score)
        assert data["current_streak"] >= 1, f"Expected streak >= 1, got {data['current_streak']}"
        assert data["score_used"] >= 75, f"Expected score >= 75 for high resonance, got {data['score_used']}"
        print(f"PASS: streak-check high score - current_streak={data['current_streak']}, score_used={data['score_used']}")
    
    def test_streak_check_3x_consecutive_triggers(self):
        """POST /api/phonic/streak-check 3x consecutive with score >= 75 returns streak_triggered=true and xp_awarded=50"""
        # Reset streak first
        reset_payload = {
            "active_pairs": [],
            "total_resonances": 0,
            "strongest_interval": "none",
            "session_duration_ms": 1000
        }
        self.session.post(f"{BASE_URL}/api/phonic/streak-check", json=reset_payload)
        
        # Send 3 consecutive high scores
        high_score_payload = {
            "active_pairs": ["starchart-mixer", "meditation-wellness"],
            "total_resonances": 15,
            "strongest_interval": "octave",
            "session_duration_ms": 30000
        }
        
        streak_triggered = False
        xp_awarded = 0
        
        for i in range(3):
            response = self.session.post(f"{BASE_URL}/api/phonic/streak-check", json=high_score_payload)
            assert response.status_code == 200, f"Call {i+1}: Expected 200, got {response.status_code}"
            data = response.json()
            print(f"Call {i+1}: current_streak={data['current_streak']}, streak_triggered={data['streak_triggered']}, xp_awarded={data['xp_awarded']}")
            
            if data["streak_triggered"]:
                streak_triggered = True
                xp_awarded = data["xp_awarded"]
        
        # After 3 consecutive high scores, streak should trigger
        assert streak_triggered, "Expected streak_triggered=true after 3 consecutive high scores"
        assert xp_awarded >= 50, f"Expected xp_awarded >= 50, got {xp_awarded}"
        print(f"PASS: 3x consecutive triggers - streak_triggered={streak_triggered}, xp_awarded={xp_awarded}")
    
    def test_streak_check_low_score_resets(self):
        """POST /api/phonic/streak-check with low score resets streak to 0"""
        # First build up a streak
        high_score_payload = {
            "active_pairs": ["starchart-mixer"],
            "total_resonances": 15,
            "strongest_interval": "octave",
            "session_duration_ms": 30000
        }
        self.session.post(f"{BASE_URL}/api/phonic/streak-check", json=high_score_payload)
        
        # Now send low score
        low_score_payload = {
            "active_pairs": [],
            "total_resonances": 0,
            "strongest_interval": "none",
            "session_duration_ms": 1000
        }
        response = self.session.post(f"{BASE_URL}/api/phonic/streak-check", json=low_score_payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify streak reset
        assert data["current_streak"] == 0, f"Expected current_streak=0 after low score, got {data['current_streak']}"
        assert data["score_used"] < 75, f"Expected score < 75 for low resonance, got {data['score_used']}"
        print(f"PASS: streak-check low score resets - current_streak={data['current_streak']}, score_used={data['score_used']}")
    
    def test_streak_status_returns_state(self):
        """GET /api/phonic/streak-status returns current streak state"""
        response = self.session.get(f"{BASE_URL}/api/phonic/streak-status")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify response structure
        assert "current_streak" in data
        assert "best_streak" in data
        assert "streak_active" in data
        assert "total_xp_earned" in data
        assert "last_score" in data
        
        print(f"PASS: streak-status - current_streak={data['current_streak']}, best_streak={data['best_streak']}, total_xp_earned={data['total_xp_earned']}")


class TestIteration242Regression:
    """Regression tests for existing endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip(f"Login failed: {login_response.status_code}")
    
    def test_harmony_score_regression(self):
        """POST /api/phonic/harmony-score still works (regression)"""
        payload = {
            "active_pairs": ["starchart-mixer"],
            "total_resonances": 5,
            "strongest_interval": "fifth",
            "session_duration_ms": 10000
        }
        response = self.session.post(f"{BASE_URL}/api/phonic/harmony-score", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify response structure
        assert "score" in data
        assert "grade" in data
        assert "breakdown" in data
        assert "insight" in data
        assert "historical_pairs" in data
        
        assert 0 <= data["score"] <= 100, f"Score should be 0-100, got {data['score']}"
        print(f"PASS: harmony-score regression - score={data['score']}, grade={data['grade']}")
    
    def test_culture_layers_regression(self):
        """GET /api/culture-layers/ still works (regression)"""
        response = self.session.get(f"{BASE_URL}/api/culture-layers/")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify response structure
        assert "layers" in data
        assert len(data["layers"]) >= 3, f"Expected at least 3 layers, got {len(data['layers'])}"
        
        layer_ids = [layer["id"] for layer in data["layers"]]
        assert "hopi" in layer_ids, "Expected 'hopi' layer"
        assert "egyptian" in layer_ids, "Expected 'egyptian' layer"
        assert "vedic" in layer_ids, "Expected 'vedic' layer"
        
        print(f"PASS: culture-layers regression - {len(data['layers'])} layers found")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
