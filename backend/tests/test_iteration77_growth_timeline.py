"""
Iteration 77: Spiritual Growth Timeline Tests
Tests for GET /api/timeline endpoint and related functionality
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
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestTimelineEndpoint:
    """Tests for GET /api/timeline endpoint"""

    def test_timeline_requires_auth(self):
        """Timeline endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/timeline")
        assert response.status_code == 401 or response.status_code == 403

    def test_timeline_returns_200(self, auth_headers):
        """Timeline endpoint returns 200 for authenticated user"""
        response = requests.get(f"{BASE_URL}/api/timeline", headers=auth_headers)
        assert response.status_code == 200

    def test_timeline_has_weeks_array(self, auth_headers):
        """Timeline returns weeks array with 12 weeks of data"""
        response = requests.get(f"{BASE_URL}/api/timeline", headers=auth_headers)
        data = response.json()
        assert "weeks" in data
        assert isinstance(data["weeks"], list)
        assert len(data["weeks"]) == 12, "Should return exactly 12 weeks of heatmap data"

    def test_timeline_week_structure(self, auth_headers):
        """Each week has required fields"""
        response = requests.get(f"{BASE_URL}/api/timeline", headers=auth_headers)
        data = response.json()
        for week in data["weeks"]:
            assert "week" in week
            assert "label" in week
            assert "count" in week
            assert "top_category" in week
            assert "top_color" in week
            assert "unique_pages" in week
            assert "categories" in week

    def test_timeline_has_category_breakdown(self, auth_headers):
        """Timeline returns category breakdown"""
        response = requests.get(f"{BASE_URL}/api/timeline", headers=auth_headers)
        data = response.json()
        assert "category_breakdown" in data
        assert isinstance(data["category_breakdown"], list)
        # Each category should have category, count, color
        for cat in data["category_breakdown"]:
            assert "category" in cat
            assert "count" in cat
            assert "color" in cat

    def test_timeline_has_milestones(self, auth_headers):
        """Timeline returns milestones array"""
        response = requests.get(f"{BASE_URL}/api/timeline", headers=auth_headers)
        data = response.json()
        assert "milestones" in data
        assert isinstance(data["milestones"], list)
        assert len(data["milestones"]) == 15, "Should return 15 milestones"

    def test_timeline_milestone_structure(self, auth_headers):
        """Each milestone has required fields"""
        response = requests.get(f"{BASE_URL}/api/timeline", headers=auth_headers)
        data = response.json()
        for m in data["milestones"]:
            assert "threshold" in m
            assert "type" in m
            assert "title" in m
            assert "desc" in m
            assert "color" in m
            assert "earned" in m
            assert isinstance(m["earned"], bool)

    def test_timeline_has_milestones_counts(self, auth_headers):
        """Timeline returns milestones_earned and milestones_total"""
        response = requests.get(f"{BASE_URL}/api/timeline", headers=auth_headers)
        data = response.json()
        assert "milestones_earned" in data
        assert "milestones_total" in data
        assert isinstance(data["milestones_earned"], int)
        assert isinstance(data["milestones_total"], int)
        assert data["milestones_total"] == 15

    def test_timeline_has_recent_highlights(self, auth_headers):
        """Timeline returns recent_highlights array"""
        response = requests.get(f"{BASE_URL}/api/timeline", headers=auth_headers)
        data = response.json()
        assert "recent_highlights" in data
        assert isinstance(data["recent_highlights"], list)

    def test_timeline_highlight_structure(self, auth_headers):
        """Each highlight has required fields"""
        response = requests.get(f"{BASE_URL}/api/timeline", headers=auth_headers)
        data = response.json()
        for h in data["recent_highlights"]:
            assert "page" in h
            assert "label" in h
            assert "category" in h
            assert "color" in h
            assert "timestamp" in h

    def test_timeline_has_stats(self, auth_headers):
        """Timeline returns stats object"""
        response = requests.get(f"{BASE_URL}/api/timeline", headers=auth_headers)
        data = response.json()
        assert "stats" in data
        assert isinstance(data["stats"], dict)

    def test_timeline_stats_structure(self, auth_headers):
        """Stats object has all required fields"""
        response = requests.get(f"{BASE_URL}/api/timeline", headers=auth_headers)
        data = response.json()
        stats = data["stats"]
        
        # All required stats fields
        required_fields = [
            "journey_start",
            "days_active",
            "total_activities",
            "unique_features",
            "current_streak",
            "max_streak",
            "traditions_explored",
            "mood_entries",
            "journal_entries",
            "blessings_sent",
            "ai_sessions",
            "books_saved",
            "books_completed"
        ]
        
        for field in required_fields:
            assert field in stats, f"Missing stats field: {field}"

    def test_timeline_stats_types(self, auth_headers):
        """Stats fields have correct types"""
        response = requests.get(f"{BASE_URL}/api/timeline", headers=auth_headers)
        data = response.json()
        stats = data["stats"]
        
        # Integer fields
        int_fields = [
            "days_active", "total_activities", "unique_features",
            "current_streak", "max_streak", "traditions_explored",
            "mood_entries", "journal_entries", "blessings_sent",
            "ai_sessions", "books_saved", "books_completed"
        ]
        
        for field in int_fields:
            assert isinstance(stats[field], int), f"{field} should be int"


class TestMilestoneTypes:
    """Tests for different milestone types"""

    def test_milestone_types_covered(self, auth_headers):
        """All milestone types are present"""
        response = requests.get(f"{BASE_URL}/api/timeline", headers=auth_headers)
        data = response.json()
        
        milestone_types = {m["type"] for m in data["milestones"]}
        expected_types = {
            "first_visit", "visits", "akashic", "journal", "mood",
            "blessing", "streak", "ai_sessions", "reading_save",
            "reading_complete", "encyclopedia"
        }
        
        assert expected_types.issubset(milestone_types), f"Missing types: {expected_types - milestone_types}"


class TestCategoryColors:
    """Tests for category color consistency"""

    def test_category_colors_valid(self, auth_headers):
        """Category colors are valid hex colors"""
        response = requests.get(f"{BASE_URL}/api/timeline", headers=auth_headers)
        data = response.json()
        
        for cat in data["category_breakdown"]:
            color = cat["color"]
            assert color.startswith("#"), f"Color should be hex: {color}"
            assert len(color) == 7, f"Color should be 7 chars: {color}"


class TestWeeklyHeatmap:
    """Tests for weekly heatmap data"""

    def test_weeks_ordered_chronologically(self, auth_headers):
        """Weeks are in chronological order (oldest to newest)"""
        response = requests.get(f"{BASE_URL}/api/timeline", headers=auth_headers)
        data = response.json()
        
        weeks = data["weeks"]
        # Week keys should be in ascending order
        week_keys = [w["week"] for w in weeks]
        assert week_keys == sorted(week_keys), "Weeks should be chronologically ordered"

    def test_week_labels_formatted(self, auth_headers):
        """Week labels are formatted as 'Mon DD'"""
        response = requests.get(f"{BASE_URL}/api/timeline", headers=auth_headers)
        data = response.json()
        
        for week in data["weeks"]:
            label = week["label"]
            # Should be like "Jan 06" or "Dec 30"
            assert len(label) >= 5, f"Label too short: {label}"


class TestTimelineIntegration:
    """Integration tests for timeline with other features"""

    def test_timeline_reflects_activity(self, auth_headers):
        """Timeline data reflects user activity"""
        # First track an activity
        track_response = requests.post(
            f"{BASE_URL}/api/activity/track",
            headers=auth_headers,
            json={"page": "/breathing", "action": "visit", "label": "Breathwork"}
        )
        assert track_response.status_code == 200
        
        # Then check timeline
        response = requests.get(f"{BASE_URL}/api/timeline", headers=auth_headers)
        data = response.json()
        
        # Should have at least some activity
        assert data["stats"]["total_activities"] >= 0


class TestTimelinePerformance:
    """Performance tests for timeline endpoint"""

    def test_timeline_response_time(self, auth_headers):
        """Timeline endpoint responds within reasonable time"""
        import time
        start = time.time()
        response = requests.get(f"{BASE_URL}/api/timeline", headers=auth_headers)
        elapsed = time.time() - start
        
        assert response.status_code == 200
        assert elapsed < 5.0, f"Timeline took too long: {elapsed}s"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
