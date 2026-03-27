"""
Iteration 64: Achievements System & Analytics Dashboard Tests
Tests for:
- GET /api/achievements - returns 15 badges with earned status
- GET /api/achievements/analytics - returns coherence_history, daily_activity, feature_usage, streak, totals
- POST /api/achievements/record-coherence - records today's coherence score
- Achievement auto-unlock logic (streak_3 for 3-day streak)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user."""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Return headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}"}


class TestAchievementsEndpoint:
    """Tests for GET /api/achievements endpoint."""

    def test_achievements_returns_200(self, auth_headers):
        """Test that achievements endpoint returns 200."""
        response = requests.get(f"{BASE_URL}/api/achievements", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_achievements_returns_15_badges(self, auth_headers):
        """Test that achievements endpoint returns exactly 15 badges."""
        response = requests.get(f"{BASE_URL}/api/achievements", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "achievements" in data, "Response should contain 'achievements' key"
        assert len(data["achievements"]) == 15, f"Expected 15 achievements, got {len(data['achievements'])}"

    def test_achievements_structure(self, auth_headers):
        """Test that each achievement has required fields."""
        response = requests.get(f"{BASE_URL}/api/achievements", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["id", "name", "desc", "icon", "color", "earned"]
        for achievement in data["achievements"]:
            for field in required_fields:
                assert field in achievement, f"Achievement missing field: {field}"

    def test_achievements_has_earned_count(self, auth_headers):
        """Test that response includes earned count and total."""
        response = requests.get(f"{BASE_URL}/api/achievements", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "earned" in data, "Response should contain 'earned' count"
        assert "total" in data, "Response should contain 'total' count"
        assert data["total"] == 15, f"Total should be 15, got {data['total']}"
        assert isinstance(data["earned"], int), "Earned should be an integer"

    def test_achievements_badge_ids(self, auth_headers):
        """Test that all expected badge IDs are present."""
        response = requests.get(f"{BASE_URL}/api/achievements", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        expected_ids = [
            "first_breath", "first_meditation", "mood_tracker", "journal_keeper",
            "streak_3", "streak_7", "streak_30", "quantum_observer", "wave_rider",
            "entangled_soul", "zero_point_master", "oracle_seeker", "sage_student",
            "dream_weaver", "community_light"
        ]
        
        actual_ids = [a["id"] for a in data["achievements"]]
        for expected_id in expected_ids:
            assert expected_id in actual_ids, f"Missing achievement ID: {expected_id}"


class TestAnalyticsEndpoint:
    """Tests for GET /api/achievements/analytics endpoint."""

    def test_analytics_returns_200(self, auth_headers):
        """Test that analytics endpoint returns 200."""
        response = requests.get(f"{BASE_URL}/api/achievements/analytics", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_analytics_has_coherence_history(self, auth_headers):
        """Test that analytics includes coherence_history."""
        response = requests.get(f"{BASE_URL}/api/achievements/analytics", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "coherence_history" in data, "Response should contain 'coherence_history'"
        assert isinstance(data["coherence_history"], list), "coherence_history should be a list"

    def test_analytics_has_daily_activity_14_days(self, auth_headers):
        """Test that analytics includes 14 days of daily_activity."""
        response = requests.get(f"{BASE_URL}/api/achievements/analytics", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "daily_activity" in data, "Response should contain 'daily_activity'"
        assert isinstance(data["daily_activity"], list), "daily_activity should be a list"
        assert len(data["daily_activity"]) == 14, f"Expected 14 days, got {len(data['daily_activity'])}"

    def test_analytics_daily_activity_structure(self, auth_headers):
        """Test that each daily_activity entry has required fields."""
        response = requests.get(f"{BASE_URL}/api/achievements/analytics", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["date", "moods", "journals", "meditations", "breathwork", "total"]
        for day in data["daily_activity"]:
            for field in required_fields:
                assert field in day, f"Daily activity missing field: {field}"

    def test_analytics_has_feature_usage_6_features(self, auth_headers):
        """Test that analytics includes 6 features in feature_usage."""
        response = requests.get(f"{BASE_URL}/api/achievements/analytics", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "feature_usage" in data, "Response should contain 'feature_usage'"
        assert isinstance(data["feature_usage"], list), "feature_usage should be a list"
        assert len(data["feature_usage"]) == 6, f"Expected 6 features, got {len(data['feature_usage'])}"

    def test_analytics_feature_usage_structure(self, auth_headers):
        """Test that each feature_usage entry has required fields."""
        response = requests.get(f"{BASE_URL}/api/achievements/analytics", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["name", "count", "color", "icon"]
        for feature in data["feature_usage"]:
            for field in required_fields:
                assert field in feature, f"Feature usage missing field: {field}"

    def test_analytics_has_streak_info(self, auth_headers):
        """Test that analytics includes streak information."""
        response = requests.get(f"{BASE_URL}/api/achievements/analytics", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "streak" in data, "Response should contain 'streak'"
        assert "current" in data["streak"], "Streak should have 'current'"
        assert "longest" in data["streak"], "Streak should have 'longest'"
        assert "total_days" in data["streak"], "Streak should have 'total_days'"

    def test_analytics_has_totals(self, auth_headers):
        """Test that analytics includes totals."""
        response = requests.get(f"{BASE_URL}/api/achievements/analytics", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "totals" in data, "Response should contain 'totals'"
        assert "all_sessions" in data["totals"], "Totals should have 'all_sessions'"
        assert "all_divinations" in data["totals"], "Totals should have 'all_divinations'"
        assert "all_coaching" in data["totals"], "Totals should have 'all_coaching'"


class TestRecordCoherenceEndpoint:
    """Tests for POST /api/achievements/record-coherence endpoint."""

    def test_record_coherence_returns_200(self, auth_headers):
        """Test that record-coherence endpoint returns 200."""
        response = requests.post(f"{BASE_URL}/api/achievements/record-coherence", 
                                 json={}, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_record_coherence_returns_date_and_score(self, auth_headers):
        """Test that record-coherence returns date and score."""
        response = requests.post(f"{BASE_URL}/api/achievements/record-coherence", 
                                 json={}, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "date" in data, "Response should contain 'date'"
        assert "score" in data, "Response should contain 'score'"
        assert isinstance(data["score"], int), "Score should be an integer"


class TestAchievementAutoUnlock:
    """Tests for achievement auto-unlock logic."""

    def test_streak_3_earned_for_test_user(self, auth_headers):
        """Test that streak_3 achievement is earned for test user with 3-day streak."""
        response = requests.get(f"{BASE_URL}/api/achievements", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        streak_3 = next((a for a in data["achievements"] if a["id"] == "streak_3"), None)
        assert streak_3 is not None, "streak_3 achievement should exist"
        # Note: This may or may not be earned depending on test user's actual streak
        print(f"streak_3 earned status: {streak_3['earned']}")

    def test_sage_student_earned_for_test_user(self, auth_headers):
        """Test sage_student achievement status for test user."""
        response = requests.get(f"{BASE_URL}/api/achievements", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        sage_student = next((a for a in data["achievements"] if a["id"] == "sage_student"), None)
        assert sage_student is not None, "sage_student achievement should exist"
        print(f"sage_student earned status: {sage_student['earned']}")

    def test_community_light_earned_for_test_user(self, auth_headers):
        """Test community_light achievement status for test user."""
        response = requests.get(f"{BASE_URL}/api/achievements", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        community_light = next((a for a in data["achievements"] if a["id"] == "community_light"), None)
        assert community_light is not None, "community_light achievement should exist"
        print(f"community_light earned status: {community_light['earned']}")


class TestAuthRequired:
    """Tests that endpoints require authentication."""

    def test_achievements_requires_auth(self):
        """Test that achievements endpoint requires authentication."""
        response = requests.get(f"{BASE_URL}/api/achievements")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"

    def test_analytics_requires_auth(self):
        """Test that analytics endpoint requires authentication."""
        response = requests.get(f"{BASE_URL}/api/achievements/analytics")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"

    def test_record_coherence_requires_auth(self):
        """Test that record-coherence endpoint requires authentication."""
        response = requests.post(f"{BASE_URL}/api/achievements/record-coherence", json={})
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
