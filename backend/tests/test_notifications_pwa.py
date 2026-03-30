# Test file for PWA Push Notifications endpoints
# Tests: VAPID key, notification status, preferences, quantum coherence, inbox, read-all

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "kyndsmiles@gmail.com"
TEST_PASSWORD = "password"


class TestNotificationEndpoints:
    """Tests for push notification and inbox endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup auth token for tests"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get auth token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if login_response.status_code == 200:
            data = login_response.json()
            token = data.get("token") or data.get("access_token")
            if token:
                self.session.headers.update({"Authorization": f"Bearer {token}"})
                self.token = token
            else:
                pytest.skip("No token in login response")
        else:
            pytest.skip(f"Login failed: {login_response.status_code}")
    
    def test_login_returns_token(self):
        """POST /api/auth/login with valid credentials returns a token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        token = data.get("token") or data.get("access_token")
        assert token is not None, "No token in response"
        assert len(token) > 0, "Token is empty"
        print(f"Login successful, token length: {len(token)}")
    
    def test_vapid_public_key(self):
        """GET /api/notifications/vapid-public-key returns a non-empty public_key"""
        response = self.session.get(f"{BASE_URL}/api/notifications/vapid-public-key")
        assert response.status_code == 200, f"VAPID key endpoint failed: {response.text}"
        data = response.json()
        assert "public_key" in data, "No public_key in response"
        assert len(data["public_key"]) > 0, "public_key is empty"
        print(f"VAPID public key: {data['public_key'][:30]}...")
    
    def test_notification_status(self):
        """GET /api/notifications/status returns subscribed boolean and preferences object"""
        response = self.session.get(f"{BASE_URL}/api/notifications/status")
        assert response.status_code == 200, f"Status endpoint failed: {response.text}"
        data = response.json()
        assert "subscribed" in data, "No subscribed field in response"
        assert isinstance(data["subscribed"], bool), "subscribed is not boolean"
        assert "preferences" in data, "No preferences field in response"
        assert isinstance(data["preferences"], dict), "preferences is not an object"
        print(f"Subscribed: {data['subscribed']}, Preferences: {data['preferences']}")
    
    def test_update_preferences(self):
        """POST /api/notifications/preferences updates user notification preferences"""
        new_prefs = {
            "daily_relaxation": True,
            "cosmic_insights": False,
            "practice_reminders": True,
            "reminder_hour": 9,
            "evening_hour": 21
        }
        response = self.session.post(f"{BASE_URL}/api/notifications/preferences", json=new_prefs)
        assert response.status_code == 200, f"Preferences update failed: {response.text}"
        data = response.json()
        assert data.get("status") == "updated", f"Expected status 'updated', got: {data.get('status')}"
        assert "preferences" in data, "No preferences in response"
        # Verify the preferences were updated
        prefs = data["preferences"]
        assert prefs.get("reminder_hour") == 9, "reminder_hour not updated"
        assert prefs.get("evening_hour") == 21, "evening_hour not updated"
        print(f"Preferences updated: {prefs}")
    
    def test_quantum_coherence(self):
        """GET /api/notifications/quantum-coherence returns coherence_score and state"""
        response = self.session.get(f"{BASE_URL}/api/notifications/quantum-coherence")
        assert response.status_code == 200, f"Quantum coherence endpoint failed: {response.text}"
        data = response.json()
        assert "coherence_score" in data, "No coherence_score in response"
        assert isinstance(data["coherence_score"], (int, float)), "coherence_score is not a number"
        assert "state" in data, "No state in response"
        assert isinstance(data["state"], str), "state is not a string"
        assert "phase" in data, "No phase in response"
        print(f"Coherence score: {data['coherence_score']}, State: {data['state']}, Phase: {data['phase']}")
    
    def test_inbox(self):
        """GET /api/notifications/inbox returns notifications array and unread_count"""
        response = self.session.get(f"{BASE_URL}/api/notifications/inbox")
        assert response.status_code == 200, f"Inbox endpoint failed: {response.text}"
        data = response.json()
        assert "notifications" in data, "No notifications field in response"
        assert isinstance(data["notifications"], list), "notifications is not an array"
        assert "unread_count" in data, "No unread_count in response"
        assert isinstance(data["unread_count"], int), "unread_count is not an integer"
        print(f"Inbox: {len(data['notifications'])} notifications, {data['unread_count']} unread")
    
    def test_read_all(self):
        """POST /api/notifications/read-all returns status all_read"""
        response = self.session.post(f"{BASE_URL}/api/notifications/read-all")
        assert response.status_code == 200, f"Read-all endpoint failed: {response.text}"
        data = response.json()
        assert data.get("status") == "all_read", f"Expected status 'all_read', got: {data.get('status')}"
        print("All notifications marked as read")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
