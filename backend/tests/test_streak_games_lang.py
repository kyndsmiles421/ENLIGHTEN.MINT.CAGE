"""
Test suite for Streak, Games, and Language features
- Streak check-in and retrieval
- Game score saving and retrieval
- Language selector functionality
"""
import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "testlearn@test.com"
TEST_PASSWORD = "password123"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture
def auth_headers(auth_token):
    """Headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestStreakEndpoints:
    """Tests for /api/streak and /api/streak/checkin endpoints"""

    def test_streak_checkin_returns_streak_data(self, auth_headers):
        """POST /api/streak/checkin creates streak record and returns current_streak"""
        response = requests.post(f"{BASE_URL}/api/streak/checkin", headers=auth_headers, json={})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "current_streak" in data, "Response should contain current_streak"
        assert "longest_streak" in data, "Response should contain longest_streak"
        assert "last_active" in data, "Response should contain last_active"
        assert "total_active_days" in data, "Response should contain total_active_days"
        assert isinstance(data["current_streak"], int), "current_streak should be an integer"
        assert data["current_streak"] >= 1, "current_streak should be at least 1 after check-in"
        print(f"✓ Streak check-in successful: current_streak={data['current_streak']}")

    def test_streak_checkin_same_day_returns_checked_in_false(self, auth_headers):
        """POST /api/streak/checkin with same-day second call returns checked_in=false"""
        # First call
        requests.post(f"{BASE_URL}/api/streak/checkin", headers=auth_headers, json={})
        
        # Second call same day
        response = requests.post(f"{BASE_URL}/api/streak/checkin", headers=auth_headers, json={})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "checked_in" in data, "Response should contain checked_in field"
        assert data["checked_in"] == False, "Second check-in same day should return checked_in=false"
        assert "message" in data or data["checked_in"] == False, "Should indicate already checked in"
        print(f"✓ Same-day check-in correctly returns checked_in=false")

    def test_get_streak_returns_streak_data(self, auth_headers):
        """GET /api/streak returns streak data"""
        response = requests.get(f"{BASE_URL}/api/streak", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "current_streak" in data, "Response should contain current_streak"
        assert "longest_streak" in data, "Response should contain longest_streak"
        assert "total_active_days" in data, "Response should contain total_active_days"
        assert isinstance(data["current_streak"], int), "current_streak should be an integer"
        print(f"✓ GET /api/streak returns: current_streak={data['current_streak']}, longest={data['longest_streak']}")

    def test_streak_requires_auth(self):
        """Streak endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/streak")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        
        response = requests.post(f"{BASE_URL}/api/streak/checkin", json={})
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("✓ Streak endpoints correctly require authentication")


class TestGameScoreEndpoints:
    """Tests for /api/games/score and /api/games/scores endpoints"""

    def test_save_game_score_returns_best_and_plays(self, auth_headers):
        """POST /api/games/score saves score and returns best_score and total_plays"""
        test_score = 500
        response = requests.post(f"{BASE_URL}/api/games/score", headers=auth_headers, json={
            "game_id": "memory-match",
            "score": test_score
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "best_score" in data, "Response should contain best_score"
        assert "total_plays" in data, "Response should contain total_plays"
        assert "game_id" in data, "Response should contain game_id"
        assert data["game_id"] == "memory-match", "game_id should match"
        assert isinstance(data["best_score"], int), "best_score should be an integer"
        assert isinstance(data["total_plays"], int), "total_plays should be an integer"
        assert data["total_plays"] >= 1, "total_plays should be at least 1"
        print(f"✓ Game score saved: best_score={data['best_score']}, total_plays={data['total_plays']}")

    def test_save_higher_score_updates_best(self, auth_headers):
        """POST /api/games/score with higher score updates best_score"""
        # Save a low score first
        requests.post(f"{BASE_URL}/api/games/score", headers=auth_headers, json={
            "game_id": "test-game-higher",
            "score": 100
        })
        
        # Save a higher score
        response = requests.post(f"{BASE_URL}/api/games/score", headers=auth_headers, json={
            "game_id": "test-game-higher",
            "score": 999
        })
        assert response.status_code == 200
        
        data = response.json()
        assert data["best_score"] == 999, f"best_score should be 999, got {data['best_score']}"
        assert data["total_plays"] >= 2, "total_plays should be at least 2"
        print(f"✓ Higher score correctly updates best_score to {data['best_score']}")

    def test_get_game_scores_returns_aggregated(self, auth_headers):
        """GET /api/games/scores returns aggregated scores per game"""
        # First save a score to ensure data exists
        requests.post(f"{BASE_URL}/api/games/score", headers=auth_headers, json={
            "game_id": "breathing-bubble",
            "score": 300
        })
        
        response = requests.get(f"{BASE_URL}/api/games/scores", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "scores" in data, "Response should contain scores object"
        assert isinstance(data["scores"], dict), "scores should be a dictionary"
        
        # Check structure of scores
        if data["scores"]:
            for game_id, score_data in data["scores"].items():
                assert "best_score" in score_data, f"Score data for {game_id} should have best_score"
                assert "total_plays" in score_data, f"Score data for {game_id} should have total_plays"
        print(f"✓ GET /api/games/scores returns {len(data['scores'])} game scores")

    def test_save_score_requires_game_id(self, auth_headers):
        """POST /api/games/score requires game_id"""
        response = requests.post(f"{BASE_URL}/api/games/score", headers=auth_headers, json={
            "score": 100
        })
        assert response.status_code == 400, f"Expected 400 without game_id, got {response.status_code}"
        print("✓ POST /api/games/score correctly requires game_id")

    def test_game_scores_require_auth(self):
        """Game score endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/games/scores")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        
        response = requests.post(f"{BASE_URL}/api/games/score", json={"game_id": "test", "score": 100})
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("✓ Game score endpoints correctly require authentication")


class TestDashboardIntegration:
    """Tests for dashboard stats integration with streak"""

    def test_dashboard_stats_includes_streak(self, auth_headers):
        """GET /api/dashboard/stats includes streak data"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "streak" in data, "Dashboard stats should include streak"
        assert isinstance(data["streak"], int), "streak should be an integer"
        print(f"✓ Dashboard stats includes streak: {data['streak']}")


class TestAllGameTypes:
    """Test saving scores for all 4 game types"""

    @pytest.mark.parametrize("game_id,score", [
        ("memory-match", 850),
        ("breathing-bubble", 420),
        ("color-harmony", 380),
        ("mindful-pattern", 550),
    ])
    def test_save_score_for_each_game(self, auth_headers, game_id, score):
        """Save score for each game type"""
        response = requests.post(f"{BASE_URL}/api/games/score", headers=auth_headers, json={
            "game_id": game_id,
            "score": score
        })
        assert response.status_code == 200, f"Failed to save score for {game_id}: {response.text}"
        
        data = response.json()
        assert data["game_id"] == game_id
        assert "best_score" in data
        assert "total_plays" in data
        print(f"✓ Score saved for {game_id}: score={score}, best={data['best_score']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
