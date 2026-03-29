"""
Iteration 91: Creator Dashboard API Tests
Tests for creator-only endpoints with access control verification.
- Creator user (kyndsmiles@gmail.com) should have full access
- Non-creator user (test@test.com) should get 403 on all /api/creator/* endpoints
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
CREATOR_EMAIL = "kyndsmiles@gmail.com"
CREATOR_PASSWORD = "password"
NON_CREATOR_EMAIL = "test@test.com"
NON_CREATOR_PASSWORD = "password"


@pytest.fixture(scope="module")
def creator_token():
    """Get auth token for creator user (kyndsmiles@gmail.com)"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": CREATOR_EMAIL,
        "password": CREATOR_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Creator login failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def non_creator_token():
    """Get auth token for non-creator user (test@test.com)"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": NON_CREATOR_EMAIL,
        "password": NON_CREATOR_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Non-creator login failed: {response.status_code} - {response.text}")


@pytest.fixture
def creator_headers(creator_token):
    """Headers with creator auth token"""
    return {"Authorization": f"Bearer {creator_token}", "Content-Type": "application/json"}


@pytest.fixture
def non_creator_headers(non_creator_token):
    """Headers with non-creator auth token"""
    return {"Authorization": f"Bearer {non_creator_token}", "Content-Type": "application/json"}


class TestCreatorAccessControl:
    """Test that non-creator users get 403 on all creator endpoints"""

    def test_overview_403_for_non_creator(self, non_creator_headers):
        """GET /api/creator/overview should return 403 for non-creator"""
        response = requests.get(f"{BASE_URL}/api/creator/overview", headers=non_creator_headers)
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        assert "Creator access only" in response.json().get("detail", "")

    def test_popular_features_403_for_non_creator(self, non_creator_headers):
        """GET /api/creator/popular-features should return 403 for non-creator"""
        response = requests.get(f"{BASE_URL}/api/creator/popular-features", headers=non_creator_headers)
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"

    def test_feedback_403_for_non_creator(self, non_creator_headers):
        """GET /api/creator/feedback should return 403 for non-creator"""
        response = requests.get(f"{BASE_URL}/api/creator/feedback", headers=non_creator_headers)
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"

    def test_comments_403_for_non_creator(self, non_creator_headers):
        """GET /api/creator/comments should return 403 for non-creator"""
        response = requests.get(f"{BASE_URL}/api/creator/comments", headers=non_creator_headers)
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"

    def test_recent_users_403_for_non_creator(self, non_creator_headers):
        """GET /api/creator/recent-users should return 403 for non-creator"""
        response = requests.get(f"{BASE_URL}/api/creator/recent-users", headers=non_creator_headers)
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"

    def test_active_trend_403_for_non_creator(self, non_creator_headers):
        """GET /api/creator/active-trend should return 403 for non-creator"""
        response = requests.get(f"{BASE_URL}/api/creator/active-trend", headers=non_creator_headers)
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"


class TestCreatorOverview:
    """Test GET /api/creator/overview for creator user"""

    def test_overview_returns_stats(self, creator_headers):
        """GET /api/creator/overview returns all expected stats"""
        response = requests.get(f"{BASE_URL}/api/creator/overview", headers=creator_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify all expected fields are present
        expected_fields = [
            "total_users", "active_today", "active_week", "active_month",
            "new_users_week", "total_installs", "total_feedback",
            "new_feedback", "in_review_feedback", "resolved_feedback",
            "total_comments", "total_moods", "total_journals", "total_sessions"
        ]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
            assert isinstance(data[field], int), f"Field {field} should be int, got {type(data[field])}"


class TestCreatorPopularFeatures:
    """Test GET /api/creator/popular-features"""

    def test_popular_features_returns_list(self, creator_headers):
        """GET /api/creator/popular-features returns features list"""
        response = requests.get(f"{BASE_URL}/api/creator/popular-features", headers=creator_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "features" in data
        assert isinstance(data["features"], list)
        
        # If there are features, verify structure
        if len(data["features"]) > 0:
            feature = data["features"][0]
            assert "page" in feature
            assert "visits" in feature


class TestCreatorFeedback:
    """Test feedback management endpoints"""

    def test_get_all_feedback(self, creator_headers):
        """GET /api/creator/feedback returns feedback list"""
        response = requests.get(f"{BASE_URL}/api/creator/feedback", headers=creator_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "feedback" in data
        assert "total" in data
        assert isinstance(data["feedback"], list)

    def test_update_feedback_status_invalid_id(self, creator_headers):
        """PUT /api/creator/feedback/{id}/status returns 404 for invalid ID"""
        fake_id = str(uuid.uuid4())
        response = requests.put(
            f"{BASE_URL}/api/creator/feedback/{fake_id}/status",
            json={"status": "in_review"},
            headers=creator_headers
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"

    def test_update_feedback_status_invalid_status(self, creator_headers):
        """PUT /api/creator/feedback/{id}/status returns 400 for invalid status"""
        fake_id = str(uuid.uuid4())
        response = requests.put(
            f"{BASE_URL}/api/creator/feedback/{fake_id}/status",
            json={"status": "invalid_status"},
            headers=creator_headers
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"


class TestCreatorComments:
    """Test comments management endpoints"""

    def test_get_all_comments(self, creator_headers):
        """GET /api/creator/comments returns comments list"""
        response = requests.get(f"{BASE_URL}/api/creator/comments", headers=creator_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "comments" in data
        assert "total" in data
        assert isinstance(data["comments"], list)

    def test_delete_comment_invalid_id(self, creator_headers):
        """DELETE /api/creator/comments/{id} returns 404 for invalid ID"""
        fake_id = str(uuid.uuid4())
        response = requests.delete(
            f"{BASE_URL}/api/creator/comments/{fake_id}",
            headers=creator_headers
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"


class TestCreatorRecentUsers:
    """Test GET /api/creator/recent-users"""

    def test_recent_users_returns_list(self, creator_headers):
        """GET /api/creator/recent-users returns user list without passwords"""
        response = requests.get(f"{BASE_URL}/api/creator/recent-users", headers=creator_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "users" in data
        assert isinstance(data["users"], list)
        
        # Verify no passwords are exposed
        for user in data["users"]:
            assert "password" not in user, "Password should not be exposed in user data"


class TestCreatorActiveTrend:
    """Test GET /api/creator/active-trend"""

    def test_active_trend_returns_14_days(self, creator_headers):
        """GET /api/creator/active-trend returns 14-day trend data"""
        response = requests.get(f"{BASE_URL}/api/creator/active-trend", headers=creator_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "trend" in data
        assert isinstance(data["trend"], list)
        assert len(data["trend"]) == 14, f"Expected 14 days, got {len(data['trend'])}"
        
        # Verify structure
        if len(data["trend"]) > 0:
            day = data["trend"][0]
            assert "date" in day
            assert "active" in day


class TestAppInstallTracking:
    """Test POST /api/app-install"""

    def test_track_install_success(self, creator_headers):
        """POST /api/app-install tracks PWA install event"""
        response = requests.post(
            f"{BASE_URL}/api/app-install",
            json={"platform": "test-platform"},
            headers=creator_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("status") == "tracked"

    def test_track_install_requires_auth(self):
        """POST /api/app-install requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/app-install",
            json={"platform": "test-platform"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


class TestUserGrowth:
    """Test GET /api/creator/user-growth"""

    def test_user_growth_returns_30_days(self, creator_headers):
        """GET /api/creator/user-growth returns 30-day growth data"""
        response = requests.get(f"{BASE_URL}/api/creator/user-growth", headers=creator_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "growth" in data
        assert isinstance(data["growth"], list)
        assert len(data["growth"]) == 30, f"Expected 30 days, got {len(data['growth'])}"
        
        # Verify structure
        if len(data["growth"]) > 0:
            day = data["growth"][0]
            assert "date" in day
            assert "count" in day
