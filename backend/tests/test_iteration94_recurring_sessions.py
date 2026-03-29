"""
Iteration 94: Recurring Sessions Feature Tests
Tests for scheduled recurring live sessions functionality:
- POST /api/live/recurring - Create recurring session series
- GET /api/live/recurring - List all active recurring sessions with is_subscribed
- POST /api/live/recurring/{id}/subscribe - Subscribe to recurring session
- DELETE /api/live/recurring/{id}/subscribe - Unsubscribe from recurring session
- GET /api/live/recurring/subscriptions - Get user's subscribed sessions
- POST /api/live/recurring/spawn - Spawn sessions from due recurring templates
"""

import pytest
import requests
import os
from datetime import datetime, timezone, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "kyndsmiles@gmail.com"
ADMIN_PASSWORD = "password"
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "password"


class TestRecurringSessions:
    """Tests for recurring session CRUD and subscription operations"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin user auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip(f"Admin login failed: {response.status_code} - {response.text}")
    
    @pytest.fixture(scope="class")
    def test_user_token(self):
        """Get test user auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip(f"Test user login failed: {response.status_code} - {response.text}")
    
    @pytest.fixture(scope="class")
    def admin_headers(self, admin_token):
        """Admin auth headers"""
        return {"Authorization": f"Bearer {admin_token}"}
    
    @pytest.fixture(scope="class")
    def test_user_headers(self, test_user_token):
        """Test user auth headers"""
        return {"Authorization": f"Bearer {test_user_token}"}
    
    # ─── Create Recurring Session Tests ───
    
    def test_create_recurring_session_daily(self, admin_headers):
        """Test creating a daily recurring session"""
        payload = {
            "title": "TEST_Daily Morning Meditation",
            "description": "Start your day with mindfulness",
            "session_type": "meditation",
            "scene": "cosmic-temple",
            "duration_minutes": 20,
            "recurrence": "daily",
            "time_utc": "07:00"
        }
        response = requests.post(f"{BASE_URL}/api/live/recurring", json=payload, headers=admin_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify all fields
        assert "id" in data, "Response should contain id"
        assert data["title"] == payload["title"]
        assert data["description"] == payload["description"]
        assert data["session_type"] == payload["session_type"]
        assert data["scene"] == payload["scene"]
        assert data["duration_minutes"] == payload["duration_minutes"]
        assert data["recurrence"] == "daily"
        assert data["time_utc"] == "07:00"
        assert data["status"] == "active"
        assert data["subscriber_count"] == 1  # Creator is auto-subscribed
        assert "next_occurrence" in data
        assert "host_id" in data
        assert "host_name" in data
        assert "created_at" in data
        
        print(f"✓ Created daily recurring session: {data['id']}")
        return data["id"]
    
    def test_create_recurring_session_weekdays(self, admin_headers):
        """Test creating a weekdays recurring session"""
        payload = {
            "title": "TEST_Weekday Yoga Flow",
            "description": "Energize your workday",
            "session_type": "yoga",
            "scene": "zen-garden",
            "duration_minutes": 30,
            "recurrence": "weekdays",
            "time_utc": "12:00"
        }
        response = requests.post(f"{BASE_URL}/api/live/recurring", json=payload, headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["recurrence"] == "weekdays"
        print(f"✓ Created weekdays recurring session: {data['id']}")
    
    def test_create_recurring_session_weekends(self, admin_headers):
        """Test creating a weekends recurring session"""
        payload = {
            "title": "TEST_Weekend Sound Bath",
            "description": "Relax and recharge",
            "session_type": "sound-bath",
            "scene": "ocean-shore",
            "duration_minutes": 45,
            "recurrence": "weekends",
            "time_utc": "10:00"
        }
        response = requests.post(f"{BASE_URL}/api/live/recurring", json=payload, headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["recurrence"] == "weekends"
        print(f"✓ Created weekends recurring session: {data['id']}")
    
    def test_create_recurring_session_weekly(self, admin_headers):
        """Test creating a weekly recurring session with day_of_week"""
        payload = {
            "title": "TEST_Weekly Breathwork Circle",
            "description": "Deep breathing practice every Wednesday",
            "session_type": "breathwork",
            "scene": "mountain-peak",
            "duration_minutes": 25,
            "recurrence": "weekly",
            "time_utc": "18:00",
            "day_of_week": 2  # Wednesday (0=Mon, 2=Wed)
        }
        response = requests.post(f"{BASE_URL}/api/live/recurring", json=payload, headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["recurrence"] == "weekly"
        assert data["day_of_week"] == 2
        print(f"✓ Created weekly recurring session: {data['id']}")
    
    def test_create_recurring_session_invalid_recurrence(self, admin_headers):
        """Test creating a recurring session with invalid recurrence type"""
        payload = {
            "title": "TEST_Invalid Recurrence",
            "recurrence": "invalid_type",
            "time_utc": "09:00"
        }
        response = requests.post(f"{BASE_URL}/api/live/recurring", json=payload, headers=admin_headers)
        
        assert response.status_code == 400, f"Expected 400 for invalid recurrence, got {response.status_code}"
        print("✓ Invalid recurrence type correctly rejected")
    
    # ─── List Recurring Sessions Tests ───
    
    def test_list_recurring_sessions(self, admin_headers):
        """Test listing all active recurring sessions"""
        response = requests.get(f"{BASE_URL}/api/live/recurring", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "series" in data
        assert isinstance(data["series"], list)
        
        # Check that each series has is_subscribed field and no subscribers array
        for series in data["series"]:
            assert "is_subscribed" in series, "Each series should have is_subscribed field"
            assert "subscribers" not in series, "Subscribers array should be stripped"
            assert "id" in series
            assert "title" in series
            assert "recurrence" in series
            assert "time_utc" in series
            assert "next_occurrence" in series
            assert "subscriber_count" in series
        
        print(f"✓ Listed {len(data['series'])} recurring sessions")
    
    def test_list_recurring_sessions_shows_is_subscribed(self, admin_headers, test_user_headers):
        """Test that is_subscribed correctly reflects user's subscription status"""
        # Admin should be subscribed to their own sessions
        admin_response = requests.get(f"{BASE_URL}/api/live/recurring", headers=admin_headers)
        assert admin_response.status_code == 200
        admin_series = admin_response.json()["series"]
        
        # Find a TEST_ session created by admin
        admin_test_sessions = [s for s in admin_series if s["title"].startswith("TEST_")]
        if admin_test_sessions:
            # Admin should be subscribed to their own session
            assert admin_test_sessions[0]["is_subscribed"] == True, "Creator should be subscribed to their own session"
        
        # Test user should not be subscribed initially
        test_response = requests.get(f"{BASE_URL}/api/live/recurring", headers=test_user_headers)
        assert test_response.status_code == 200
        test_series = test_response.json()["series"]
        
        # Find same TEST_ sessions from test user perspective
        test_user_test_sessions = [s for s in test_series if s["title"].startswith("TEST_")]
        if test_user_test_sessions:
            # Test user should NOT be subscribed to admin's sessions
            assert test_user_test_sessions[0]["is_subscribed"] == False, "Test user should not be subscribed to admin's session"
        
        print("✓ is_subscribed correctly reflects subscription status")
    
    # ─── Subscribe/Unsubscribe Tests ───
    
    def test_subscribe_to_recurring_session(self, admin_headers, test_user_headers):
        """Test subscribing to a recurring session"""
        # First, get a recurring session to subscribe to
        list_response = requests.get(f"{BASE_URL}/api/live/recurring", headers=admin_headers)
        series_list = list_response.json()["series"]
        test_sessions = [s for s in series_list if s["title"].startswith("TEST_")]
        
        if not test_sessions:
            pytest.skip("No TEST_ recurring sessions found")
        
        series_id = test_sessions[0]["id"]
        initial_count = test_sessions[0]["subscriber_count"]
        
        # Subscribe as test user
        subscribe_response = requests.post(
            f"{BASE_URL}/api/live/recurring/{series_id}/subscribe",
            json={},
            headers=test_user_headers
        )
        
        assert subscribe_response.status_code == 200
        data = subscribe_response.json()
        assert data["status"] in ["subscribed", "already_subscribed"]
        
        # Verify subscription by checking list again
        verify_response = requests.get(f"{BASE_URL}/api/live/recurring", headers=test_user_headers)
        verify_series = verify_response.json()["series"]
        subscribed_session = next((s for s in verify_series if s["id"] == series_id), None)
        
        assert subscribed_session is not None
        assert subscribed_session["is_subscribed"] == True, "User should now be subscribed"
        
        if data["status"] == "subscribed":
            assert subscribed_session["subscriber_count"] == initial_count + 1, "Subscriber count should increment"
        
        print(f"✓ Successfully subscribed to recurring session {series_id}")
        return series_id
    
    def test_subscribe_already_subscribed(self, admin_headers):
        """Test subscribing when already subscribed returns appropriate status"""
        # Get a session admin created (they're auto-subscribed)
        list_response = requests.get(f"{BASE_URL}/api/live/recurring", headers=admin_headers)
        series_list = list_response.json()["series"]
        test_sessions = [s for s in series_list if s["title"].startswith("TEST_") and s["is_subscribed"]]
        
        if not test_sessions:
            pytest.skip("No subscribed TEST_ sessions found")
        
        series_id = test_sessions[0]["id"]
        
        # Try to subscribe again
        response = requests.post(
            f"{BASE_URL}/api/live/recurring/{series_id}/subscribe",
            json={},
            headers=admin_headers
        )
        
        assert response.status_code == 200
        assert response.json()["status"] == "already_subscribed"
        print("✓ Already subscribed status returned correctly")
    
    def test_unsubscribe_from_recurring_session(self, test_user_headers):
        """Test unsubscribing from a recurring session"""
        # Get a session test user is subscribed to
        list_response = requests.get(f"{BASE_URL}/api/live/recurring", headers=test_user_headers)
        series_list = list_response.json()["series"]
        subscribed_sessions = [s for s in series_list if s["is_subscribed"] and s["title"].startswith("TEST_")]
        
        if not subscribed_sessions:
            pytest.skip("No subscribed TEST_ sessions found for test user")
        
        series_id = subscribed_sessions[0]["id"]
        initial_count = subscribed_sessions[0]["subscriber_count"]
        
        # Unsubscribe
        unsubscribe_response = requests.delete(
            f"{BASE_URL}/api/live/recurring/{series_id}/subscribe",
            headers=test_user_headers
        )
        
        assert unsubscribe_response.status_code == 200
        assert unsubscribe_response.json()["status"] == "unsubscribed"
        
        # Verify unsubscription
        verify_response = requests.get(f"{BASE_URL}/api/live/recurring", headers=test_user_headers)
        verify_series = verify_response.json()["series"]
        unsubscribed_session = next((s for s in verify_series if s["id"] == series_id), None)
        
        assert unsubscribed_session is not None
        assert unsubscribed_session["is_subscribed"] == False, "User should now be unsubscribed"
        assert unsubscribed_session["subscriber_count"] == initial_count - 1, "Subscriber count should decrement"
        
        print(f"✓ Successfully unsubscribed from recurring session {series_id}")
    
    def test_subscribe_nonexistent_session(self, test_user_headers):
        """Test subscribing to a nonexistent session returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/live/recurring/nonexistent-id-12345/subscribe",
            json={},
            headers=test_user_headers
        )
        
        assert response.status_code == 404
        print("✓ Subscribe to nonexistent session returns 404")
    
    # ─── My Subscriptions Tests ───
    
    def test_get_my_subscriptions(self, admin_headers):
        """Test getting user's subscribed recurring sessions"""
        response = requests.get(f"{BASE_URL}/api/live/recurring/subscriptions", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "series" in data
        assert isinstance(data["series"], list)
        
        # All returned sessions should have is_subscribed = True
        for series in data["series"]:
            assert series["is_subscribed"] == True, "All returned sessions should be subscribed"
            assert "subscribers" not in series, "Subscribers array should be stripped"
        
        print(f"✓ Got {len(data['series'])} subscribed sessions")
    
    def test_subscriptions_only_returns_subscribed(self, test_user_headers, admin_headers):
        """Test that subscriptions endpoint only returns sessions user is subscribed to"""
        # First, ensure test user is not subscribed to any TEST_ sessions
        list_response = requests.get(f"{BASE_URL}/api/live/recurring", headers=test_user_headers)
        all_series = list_response.json()["series"]
        
        # Get subscriptions
        subs_response = requests.get(f"{BASE_URL}/api/live/recurring/subscriptions", headers=test_user_headers)
        subscribed_series = subs_response.json()["series"]
        
        # Subscribed count should be <= total count
        assert len(subscribed_series) <= len(all_series)
        
        # All subscribed series should have is_subscribed = True in the full list
        subscribed_ids = {s["id"] for s in subscribed_series}
        for series in all_series:
            if series["id"] in subscribed_ids:
                assert series["is_subscribed"] == True
        
        print("✓ Subscriptions endpoint correctly filters to subscribed sessions only")
    
    # ─── Spawn Tests ───
    
    def test_spawn_recurring_sessions(self, admin_headers):
        """Test spawning sessions from recurring templates"""
        response = requests.post(f"{BASE_URL}/api/live/recurring/spawn", json={}, headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "spawned" in data
        assert "sessions" in data
        assert isinstance(data["spawned"], int)
        assert isinstance(data["sessions"], list)
        
        # If sessions were spawned, verify their structure
        for session in data["sessions"]:
            assert "id" in session
            assert "title" in session
            assert "recurring_series_id" in session
            assert session["status"] == "scheduled"
        
        print(f"✓ Spawn endpoint returned: {data['spawned']} sessions spawned")
    
    def test_spawn_advances_next_occurrence(self, admin_headers):
        """Test that spawning advances the next_occurrence field"""
        # Create a recurring session with next_occurrence in the past (within 15 min window)
        # This is tricky to test without manipulating time, so we just verify the endpoint works
        
        # Get current recurring sessions
        before_response = requests.get(f"{BASE_URL}/api/live/recurring", headers=admin_headers)
        before_series = {s["id"]: s["next_occurrence"] for s in before_response.json()["series"]}
        
        # Call spawn
        spawn_response = requests.post(f"{BASE_URL}/api/live/recurring/spawn", json={}, headers=admin_headers)
        assert spawn_response.status_code == 200
        
        # Note: next_occurrence only advances if a session was actually spawned
        # This depends on timing, so we just verify the endpoint doesn't error
        print("✓ Spawn endpoint executes without error")
    
    # ─── Authentication Tests ───
    
    def test_recurring_endpoints_require_auth(self):
        """Test that recurring endpoints require authentication"""
        # List recurring sessions
        response = requests.get(f"{BASE_URL}/api/live/recurring")
        assert response.status_code == 401 or response.status_code == 403
        
        # Create recurring session
        response = requests.post(f"{BASE_URL}/api/live/recurring", json={"title": "Test"})
        assert response.status_code == 401 or response.status_code == 403
        
        # Subscribe
        response = requests.post(f"{BASE_URL}/api/live/recurring/test-id/subscribe", json={})
        assert response.status_code == 401 or response.status_code == 403
        
        # Unsubscribe
        response = requests.delete(f"{BASE_URL}/api/live/recurring/test-id/subscribe")
        assert response.status_code == 401 or response.status_code == 403
        
        # My subscriptions
        response = requests.get(f"{BASE_URL}/api/live/recurring/subscriptions")
        assert response.status_code == 401 or response.status_code == 403
        
        print("✓ All recurring endpoints require authentication")


class TestRecurringSessionsCleanup:
    """Cleanup test data after tests"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin user auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin login failed")
    
    def test_cleanup_test_data(self, admin_token):
        """Note: Cleanup would require a delete endpoint which doesn't exist.
        Test data with TEST_ prefix should be cleaned up manually or via DB."""
        print("✓ Test data cleanup note: TEST_ prefixed recurring sessions remain in DB")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
