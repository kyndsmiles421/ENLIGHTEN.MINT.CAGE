"""
Creator Dashboard API Tests - Iteration 100
Tests all creator admin endpoints including:
- Overview stats, popular features, user growth, active trend
- Feedback management (list, status update)
- Comments management (list, delete)
- User management (list, search, detail, toggle status)
- Broadcast notifications (send, history)
- Data export (users, feedback)
- Non-admin access denial (403)
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "kyndsmiles@gmail.com"
ADMIN_PASSWORD = "password"
REGULAR_EMAIL = "test@test.com"
REGULAR_PASSWORD = "password"


class TestCreatorDashboardAuth:
    """Test authentication and authorization for creator endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip(f"Admin login failed: {response.status_code} - {response.text}")
    
    @pytest.fixture(scope="class")
    def regular_token(self):
        """Get regular user auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": REGULAR_EMAIL,
            "password": REGULAR_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip(f"Regular user login failed: {response.status_code} - {response.text}")
    
    def test_admin_login_success(self):
        """Admin user can login successfully"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        print(f"✓ Admin login successful")
    
    def test_regular_user_login_success(self):
        """Regular user can login successfully"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": REGULAR_EMAIL,
            "password": REGULAR_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        print(f"✓ Regular user login successful")
    
    def test_non_admin_gets_403_on_creator_overview(self, regular_token):
        """Non-admin users get 403 on creator endpoints"""
        headers = {"Authorization": f"Bearer {regular_token}"}
        response = requests.get(f"{BASE_URL}/api/creator/overview", headers=headers)
        assert response.status_code == 403
        print(f"✓ Non-admin correctly denied access (403)")


class TestCreatorOverview:
    """Test creator overview stats endpoint"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            token = response.json().get("token")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Admin login failed")
    
    def test_overview_returns_stats(self, admin_headers):
        """GET /api/creator/overview returns all expected stats"""
        response = requests.get(f"{BASE_URL}/api/creator/overview", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify all expected fields
        expected_fields = [
            "total_users", "active_today", "active_week", "active_month",
            "new_users_week", "total_installs", "total_feedback",
            "new_feedback", "in_review_feedback", "resolved_feedback",
            "total_comments", "total_moods", "total_journals", "total_sessions"
        ]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
            assert isinstance(data[field], int), f"{field} should be int"
        
        print(f"✓ Overview stats: {data['total_users']} users, {data['active_today']} active today")


class TestCreatorPopularFeatures:
    """Test popular features endpoint"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            token = response.json().get("token")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Admin login failed")
    
    def test_popular_features_returns_list(self, admin_headers):
        """GET /api/creator/popular-features returns features list"""
        response = requests.get(f"{BASE_URL}/api/creator/popular-features", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "features" in data
        assert isinstance(data["features"], list)
        
        if len(data["features"]) > 0:
            feature = data["features"][0]
            assert "page" in feature
            assert "visits" in feature
        
        print(f"✓ Popular features: {len(data['features'])} tracked")


class TestCreatorGrowthTrend:
    """Test user growth and active trend endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            token = response.json().get("token")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Admin login failed")
    
    def test_user_growth_returns_30_days(self, admin_headers):
        """GET /api/creator/user-growth returns 30-day growth data"""
        response = requests.get(f"{BASE_URL}/api/creator/user-growth", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "growth" in data
        assert isinstance(data["growth"], list)
        assert len(data["growth"]) == 30
        
        if len(data["growth"]) > 0:
            day = data["growth"][0]
            assert "date" in day
            assert "count" in day
        
        print(f"✓ User growth: 30 days of data")
    
    def test_active_trend_returns_14_days(self, admin_headers):
        """GET /api/creator/active-trend returns 14-day trend data"""
        response = requests.get(f"{BASE_URL}/api/creator/active-trend", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "trend" in data
        assert isinstance(data["trend"], list)
        assert len(data["trend"]) == 14
        
        if len(data["trend"]) > 0:
            day = data["trend"][0]
            assert "date" in day
            assert "active" in day
        
        print(f"✓ Active trend: 14 days of data")


class TestCreatorFeedback:
    """Test feedback management endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            token = response.json().get("token")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Admin login failed")
    
    def test_get_all_feedback(self, admin_headers):
        """GET /api/creator/feedback returns feedback list"""
        response = requests.get(f"{BASE_URL}/api/creator/feedback", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "feedback" in data
        assert "total" in data
        assert isinstance(data["feedback"], list)
        
        print(f"✓ Feedback: {data['total']} items")
        return data["feedback"]
    
    def test_update_feedback_status(self, admin_headers):
        """PUT /api/creator/feedback/{id}/status updates status"""
        # First get feedback list
        response = requests.get(f"{BASE_URL}/api/creator/feedback", headers=admin_headers)
        if response.status_code != 200:
            pytest.skip("Could not get feedback list")
        
        feedback_list = response.json().get("feedback", [])
        if len(feedback_list) == 0:
            pytest.skip("No feedback items to test status update")
        
        feedback_id = feedback_list[0]["id"]
        original_status = feedback_list[0].get("status", "new")
        
        # Update to in_review
        new_status = "in_review" if original_status != "in_review" else "resolved"
        response = requests.put(
            f"{BASE_URL}/api/creator/feedback/{feedback_id}/status",
            json={"status": new_status},
            headers=admin_headers
        )
        assert response.status_code == 200
        assert response.json().get("status") == "updated"
        
        # Restore original status
        requests.put(
            f"{BASE_URL}/api/creator/feedback/{feedback_id}/status",
            json={"status": original_status},
            headers=admin_headers
        )
        
        print(f"✓ Feedback status update working")
    
    def test_update_feedback_invalid_status(self, admin_headers):
        """PUT /api/creator/feedback/{id}/status rejects invalid status"""
        response = requests.put(
            f"{BASE_URL}/api/creator/feedback/fake-id/status",
            json={"status": "invalid_status"},
            headers=admin_headers
        )
        assert response.status_code == 400
        print(f"✓ Invalid status correctly rejected (400)")


class TestCreatorComments:
    """Test comments management endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            token = response.json().get("token")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Admin login failed")
    
    def test_get_all_comments(self, admin_headers):
        """GET /api/creator/comments returns comments list"""
        response = requests.get(f"{BASE_URL}/api/creator/comments", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "comments" in data
        assert "total" in data
        assert isinstance(data["comments"], list)
        
        print(f"✓ Comments: {data['total']} items")
    
    def test_delete_comment_not_found(self, admin_headers):
        """DELETE /api/creator/comments/{id} returns 404 for non-existent"""
        response = requests.delete(
            f"{BASE_URL}/api/creator/comments/non-existent-id",
            headers=admin_headers
        )
        assert response.status_code == 404
        print(f"✓ Delete non-existent comment returns 404")


class TestCreatorUsers:
    """Test user management endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            token = response.json().get("token")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Admin login failed")
    
    def test_get_recent_users(self, admin_headers):
        """GET /api/creator/recent-users returns user list"""
        response = requests.get(f"{BASE_URL}/api/creator/recent-users", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert isinstance(data["users"], list)
        
        if len(data["users"]) > 0:
            user = data["users"][0]
            assert "id" in user
            assert "email" in user
            assert "password" not in user  # Password should be excluded
        
        print(f"✓ Recent users: {len(data['users'])} users")
        return data["users"]
    
    def test_search_users(self, admin_headers):
        """GET /api/creator/search-users?q=test returns search results"""
        response = requests.get(
            f"{BASE_URL}/api/creator/search-users?q=test",
            headers=admin_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert isinstance(data["users"], list)
        
        print(f"✓ User search: {len(data['users'])} results for 'test'")
    
    def test_search_users_short_query(self, admin_headers):
        """GET /api/creator/search-users?q=a returns empty for short query"""
        response = requests.get(
            f"{BASE_URL}/api/creator/search-users?q=a",
            headers=admin_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["users"] == []
        print(f"✓ Short search query returns empty list")
    
    def test_get_user_detail(self, admin_headers):
        """GET /api/creator/user/{user_id} returns user detail with stats"""
        # First get a user ID
        response = requests.get(f"{BASE_URL}/api/creator/recent-users", headers=admin_headers)
        if response.status_code != 200:
            pytest.skip("Could not get users list")
        
        users = response.json().get("users", [])
        if len(users) == 0:
            pytest.skip("No users to test detail")
        
        user_id = users[0]["id"]
        response = requests.get(f"{BASE_URL}/api/creator/user/{user_id}", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify user detail fields
        assert "id" in data
        assert "email" in data
        assert "mood_count" in data
        assert "journal_count" in data
        assert "session_count" in data
        assert "activity_this_week" in data
        assert "password" not in data
        
        print(f"✓ User detail: {data['email']} with {data['mood_count']} moods")
    
    def test_get_user_detail_not_found(self, admin_headers):
        """GET /api/creator/user/{user_id} returns 404 for non-existent"""
        response = requests.get(
            f"{BASE_URL}/api/creator/user/non-existent-user-id",
            headers=admin_headers
        )
        assert response.status_code == 404
        print(f"✓ Non-existent user returns 404")
    
    def test_toggle_user_status(self, admin_headers):
        """POST /api/creator/user/{user_id}/toggle-status enables/disables user"""
        # Get a non-admin user to toggle
        response = requests.get(f"{BASE_URL}/api/creator/recent-users", headers=admin_headers)
        if response.status_code != 200:
            pytest.skip("Could not get users list")
        
        users = response.json().get("users", [])
        # Find a non-admin user
        test_user = None
        for u in users:
            if u.get("email") != ADMIN_EMAIL:
                test_user = u
                break
        
        if not test_user:
            pytest.skip("No non-admin user to test toggle")
        
        user_id = test_user["id"]
        original_disabled = test_user.get("disabled", False)
        
        # Toggle to opposite state
        response = requests.post(
            f"{BASE_URL}/api/creator/user/{user_id}/toggle-status",
            json={"disabled": not original_disabled},
            headers=admin_headers
        )
        assert response.status_code == 200
        
        # Restore original state
        requests.post(
            f"{BASE_URL}/api/creator/user/{user_id}/toggle-status",
            json={"disabled": original_disabled},
            headers=admin_headers
        )
        
        print(f"✓ User toggle status working")


class TestCreatorBroadcast:
    """Test broadcast notification endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            token = response.json().get("token")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Admin login failed")
    
    def test_send_broadcast(self, admin_headers):
        """POST /api/creator/broadcast sends notification to users"""
        response = requests.post(
            f"{BASE_URL}/api/creator/broadcast",
            json={
                "title": "TEST_Broadcast Title",
                "body": "This is a test broadcast message",
                "target": "all",
                "url": "/"
            },
            headers=admin_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "sent"
        assert "recipients" in data
        assert isinstance(data["recipients"], int)
        
        print(f"✓ Broadcast sent to {data['recipients']} recipients")
    
    def test_send_broadcast_missing_fields(self, admin_headers):
        """POST /api/creator/broadcast rejects missing title/body"""
        response = requests.post(
            f"{BASE_URL}/api/creator/broadcast",
            json={"title": "Only Title"},
            headers=admin_headers
        )
        assert response.status_code == 400
        print(f"✓ Missing body correctly rejected (400)")
    
    def test_get_broadcast_history(self, admin_headers):
        """GET /api/creator/broadcasts returns broadcast history"""
        response = requests.get(f"{BASE_URL}/api/creator/broadcasts", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "broadcasts" in data
        assert isinstance(data["broadcasts"], list)
        
        if len(data["broadcasts"]) > 0:
            broadcast = data["broadcasts"][0]
            assert "title" in broadcast
            assert "body" in broadcast
            assert "sent_to" in broadcast
            assert "target" in broadcast
        
        print(f"✓ Broadcast history: {len(data['broadcasts'])} broadcasts")


class TestCreatorExport:
    """Test data export endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            token = response.json().get("token")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Admin login failed")
    
    def test_export_users(self, admin_headers):
        """GET /api/creator/export/users returns JSON download"""
        response = requests.get(f"{BASE_URL}/api/creator/export/users", headers=admin_headers)
        assert response.status_code == 200
        assert "application/json" in response.headers.get("Content-Type", "")
        assert "attachment" in response.headers.get("Content-Disposition", "")
        
        # Verify it's valid JSON
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            assert "password" not in data[0]  # Password should be excluded
        
        print(f"✓ Users export: {len(data)} users")
    
    def test_export_feedback(self, admin_headers):
        """GET /api/creator/export/feedback returns JSON download"""
        response = requests.get(f"{BASE_URL}/api/creator/export/feedback", headers=admin_headers)
        assert response.status_code == 200
        assert "application/json" in response.headers.get("Content-Type", "")
        
        data = response.json()
        assert isinstance(data, list)
        
        print(f"✓ Feedback export: {len(data)} items")
    
    def test_export_invalid_collection(self, admin_headers):
        """GET /api/creator/export/invalid returns 400"""
        response = requests.get(f"{BASE_URL}/api/creator/export/invalid", headers=admin_headers)
        assert response.status_code == 400
        print(f"✓ Invalid collection export rejected (400)")


class TestNonAdminAccess:
    """Test that non-admin users get 403 on all creator endpoints"""
    
    @pytest.fixture(scope="class")
    def regular_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": REGULAR_EMAIL,
            "password": REGULAR_PASSWORD
        })
        if response.status_code == 200:
            token = response.json().get("token")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Regular user login failed")
    
    def test_non_admin_overview_403(self, regular_headers):
        """Non-admin gets 403 on /creator/overview"""
        response = requests.get(f"{BASE_URL}/api/creator/overview", headers=regular_headers)
        assert response.status_code == 403
    
    def test_non_admin_feedback_403(self, regular_headers):
        """Non-admin gets 403 on /creator/feedback"""
        response = requests.get(f"{BASE_URL}/api/creator/feedback", headers=regular_headers)
        assert response.status_code == 403
    
    def test_non_admin_comments_403(self, regular_headers):
        """Non-admin gets 403 on /creator/comments"""
        response = requests.get(f"{BASE_URL}/api/creator/comments", headers=regular_headers)
        assert response.status_code == 403
    
    def test_non_admin_users_403(self, regular_headers):
        """Non-admin gets 403 on /creator/recent-users"""
        response = requests.get(f"{BASE_URL}/api/creator/recent-users", headers=regular_headers)
        assert response.status_code == 403
    
    def test_non_admin_broadcast_403(self, regular_headers):
        """Non-admin gets 403 on /creator/broadcast"""
        response = requests.post(
            f"{BASE_URL}/api/creator/broadcast",
            json={"title": "Test", "body": "Test"},
            headers=regular_headers
        )
        assert response.status_code == 403
    
    def test_non_admin_export_403(self, regular_headers):
        """Non-admin gets 403 on /creator/export/users"""
        response = requests.get(f"{BASE_URL}/api/creator/export/users", headers=regular_headers)
        assert response.status_code == 403
        print(f"✓ All non-admin access correctly denied (403)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
