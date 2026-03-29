"""
Iteration 92 Tests: Mood Insights & Trends, Crystal Pairing Share, Blessing Notifications
Tests:
- GET /api/moods/insights - mood analytics with AI insight
- GET /api/crystals/pairing/{id}/share - public pairing share endpoint
- POST /api/blessings/send - creates in-app notification for recipient
- GET /api/notifications/inbox - in-app notifications with unread_count
- POST /api/notifications/read/{id} - mark notification as read
- POST /api/notifications/read-all - mark all notifications as read
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://zen-energy-bar.preview.emergentagent.com').rstrip('/')


class TestMoodInsights:
    """Test mood insights endpoint with analytics and AI insight"""
    
    @pytest.fixture(scope="class")
    def test_user_token(self):
        """Login as test user who has 3+ moods logged"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Test user login failed")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, test_user_token):
        return {"Authorization": f"Bearer {test_user_token}"}
    
    def test_mood_insights_returns_data_for_user_with_moods(self, auth_headers):
        """Test that insights endpoint returns analytics for user with 3+ moods"""
        response = requests.get(f"{BASE_URL}/api/moods/insights", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Should have data since test user has 3+ moods logged
        assert data.get("has_data") == True, "Expected has_data=True for user with moods"
        
        # Verify analytics fields
        assert "total_entries" in data, "Missing total_entries"
        assert "avg_intensity" in data, "Missing avg_intensity"
        assert "top_moods" in data, "Missing top_moods"
        assert "weekly" in data, "Missing weekly"
        assert "logging_streak" in data, "Missing logging_streak"
        
        # Verify top_moods structure
        if data["top_moods"]:
            assert "mood" in data["top_moods"][0], "top_moods missing mood field"
            assert "count" in data["top_moods"][0], "top_moods missing count field"
        
        # Verify weekly structure
        assert len(data["weekly"]) == 7, "Weekly should have 7 days"
        for day in data["weekly"]:
            assert "date" in day, "Weekly day missing date"
            assert "day" in day, "Weekly day missing day"
            assert "count" in day, "Weekly day missing count"
        
        print(f"Mood insights returned: total_entries={data['total_entries']}, avg_intensity={data['avg_intensity']}, streak={data['logging_streak']}")
    
    def test_mood_insights_includes_ai_insight_when_3_plus_moods(self, auth_headers):
        """Test that AI insight is generated when user has 3+ moods"""
        response = requests.get(f"{BASE_URL}/api/moods/insights", headers=auth_headers, timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        if data.get("has_data") and data.get("total_entries", 0) >= 3:
            # AI insight should be present (may be None if AI call failed, but field should exist)
            assert "ai_insight" in data, "Missing ai_insight field"
            print(f"AI insight present: {data.get('ai_insight') is not None}")
    
    def test_mood_insights_returns_no_data_for_new_user(self):
        """Test that insights returns has_data=false for user with no moods"""
        # Create a new user
        unique_email = f"test_no_moods_{uuid.uuid4().hex[:8]}@test.com"
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "password123",
            "name": "No Moods User"
        })
        
        if register_response.status_code != 200:
            pytest.skip("Could not create test user")
        
        token = register_response.json().get("token")
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.get(f"{BASE_URL}/api/moods/insights", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("has_data") == False, "Expected has_data=False for user with no moods"
        print("Correctly returns has_data=False for new user")


class TestCrystalPairingShare:
    """Test crystal pairing share endpoint"""
    
    @pytest.fixture(scope="class")
    def test_user_token(self):
        """Login as test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Test user login failed")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, test_user_token):
        return {"Authorization": f"Bearer {test_user_token}"}
    
    def test_create_pairing_and_get_share_data(self, auth_headers):
        """Test creating a pairing and then fetching it via public share endpoint"""
        # First create a pairing
        pairing_response = requests.post(f"{BASE_URL}/api/crystals/pairing", json={
            "mood": "Stressed",
            "intention": "Peace"
        }, headers=auth_headers, timeout=60)
        
        if pairing_response.status_code != 200:
            pytest.skip(f"Could not create pairing: {pairing_response.text}")
        
        # Get pairing history to find the ID
        history_response = requests.get(f"{BASE_URL}/api/crystals/pairing/history", headers=auth_headers)
        assert history_response.status_code == 200
        
        pairings = history_response.json().get("pairings", [])
        if not pairings:
            pytest.skip("No pairings found in history")
        
        pairing_id = pairings[0]["id"]
        
        # Test public share endpoint (no auth required)
        share_response = requests.get(f"{BASE_URL}/api/crystals/pairing/{pairing_id}/share")
        assert share_response.status_code == 200, f"Share endpoint failed: {share_response.text}"
        
        share_data = share_response.json()
        assert "pairing" in share_data, "Missing pairing in share response"
        assert "crystals" in share_data, "Missing crystals in share response"
        assert "user_name" in share_data, "Missing user_name in share response"
        
        print(f"Share endpoint returned pairing with {len(share_data['crystals'])} crystals")
    
    def test_share_endpoint_returns_404_for_invalid_id(self):
        """Test that share endpoint returns 404 for non-existent pairing"""
        response = requests.get(f"{BASE_URL}/api/crystals/pairing/invalid-id-12345/share")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("Correctly returns 404 for invalid pairing ID")


class TestBlessingNotifications:
    """Test blessing notifications - in-app notification creation"""
    
    @pytest.fixture(scope="class")
    def sender_token(self):
        """Login as sender (test user)"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Sender login failed")
    
    @pytest.fixture(scope="class")
    def recipient_token(self):
        """Login as recipient (creator user)"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "kyndsmiles@gmail.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Recipient login failed")
    
    @pytest.fixture(scope="class")
    def recipient_user_id(self, recipient_token):
        """Get recipient user ID"""
        headers = {"Authorization": f"Bearer {recipient_token}"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        if response.status_code == 200:
            return response.json().get("id")
        pytest.skip("Could not get recipient user ID")
    
    def test_send_blessing_creates_notification_for_recipient(self, sender_token, recipient_token, recipient_user_id):
        """Test that sending a blessing with to_user_id creates in-app notification"""
        sender_headers = {"Authorization": f"Bearer {sender_token}"}
        recipient_headers = {"Authorization": f"Bearer {recipient_token}"}
        
        # Get initial unread count for recipient
        initial_inbox = requests.get(f"{BASE_URL}/api/notifications/inbox", headers=recipient_headers)
        initial_unread = initial_inbox.json().get("unread_count", 0) if initial_inbox.status_code == 200 else 0
        
        # Send blessing with to_user_id
        blessing_response = requests.post(f"{BASE_URL}/api/blessings/send", json={
            "template_id": "peace",
            "to_name": "Creator User",
            "to_user_id": recipient_user_id,
            "custom_message": "Test blessing for notification"
        }, headers=sender_headers)
        
        assert blessing_response.status_code == 200, f"Blessing send failed: {blessing_response.text}"
        
        # Check recipient's inbox for new notification
        inbox_response = requests.get(f"{BASE_URL}/api/notifications/inbox", headers=recipient_headers)
        assert inbox_response.status_code == 200
        
        inbox_data = inbox_response.json()
        assert "notifications" in inbox_data, "Missing notifications in inbox"
        assert "unread_count" in inbox_data, "Missing unread_count in inbox"
        
        # Unread count should have increased
        new_unread = inbox_data.get("unread_count", 0)
        assert new_unread >= initial_unread, f"Unread count should have increased: was {initial_unread}, now {new_unread}"
        
        # Check that there's a blessing notification
        notifications = inbox_data.get("notifications", [])
        blessing_notifs = [n for n in notifications if n.get("type") == "blessing"]
        assert len(blessing_notifs) > 0, "No blessing notification found in inbox"
        
        latest_blessing = blessing_notifs[0]
        assert "title" in latest_blessing, "Notification missing title"
        assert "message" in latest_blessing, "Notification missing message"
        assert latest_blessing.get("read") == False, "New notification should be unread"
        
        print(f"Blessing notification created successfully. Unread count: {new_unread}")


class TestNotificationInbox:
    """Test notification inbox endpoints"""
    
    @pytest.fixture(scope="class")
    def test_user_token(self):
        """Login as test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "kyndsmiles@gmail.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Test user login failed")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, test_user_token):
        return {"Authorization": f"Bearer {test_user_token}"}
    
    def test_get_inbox_returns_notifications_and_unread_count(self, auth_headers):
        """Test GET /api/notifications/inbox returns proper structure"""
        response = requests.get(f"{BASE_URL}/api/notifications/inbox", headers=auth_headers)
        assert response.status_code == 200, f"Inbox request failed: {response.text}"
        
        data = response.json()
        assert "notifications" in data, "Missing notifications field"
        assert "unread_count" in data, "Missing unread_count field"
        assert isinstance(data["notifications"], list), "notifications should be a list"
        assert isinstance(data["unread_count"], int), "unread_count should be an integer"
        
        print(f"Inbox returned {len(data['notifications'])} notifications, {data['unread_count']} unread")
    
    def test_mark_notification_as_read(self, auth_headers):
        """Test POST /api/notifications/read/{id} marks notification as read"""
        # First get inbox to find an unread notification
        inbox_response = requests.get(f"{BASE_URL}/api/notifications/inbox", headers=auth_headers)
        assert inbox_response.status_code == 200
        
        notifications = inbox_response.json().get("notifications", [])
        unread_notifs = [n for n in notifications if not n.get("read")]
        
        if not unread_notifs:
            # Create a notification by sending a blessing to self
            me_response = requests.get(f"{BASE_URL}/api/auth/me", headers=auth_headers)
            if me_response.status_code == 200:
                my_id = me_response.json().get("id")
                # Use a different user to send blessing
                sender_response = requests.post(f"{BASE_URL}/api/auth/login", json={
                    "email": "test@test.com",
                    "password": "password"
                })
                if sender_response.status_code == 200:
                    sender_headers = {"Authorization": f"Bearer {sender_response.json()['token']}"}
                    requests.post(f"{BASE_URL}/api/blessings/send", json={
                        "template_id": "healing",
                        "to_name": "Test",
                        "to_user_id": my_id
                    }, headers=sender_headers)
                    
                    # Re-fetch inbox
                    inbox_response = requests.get(f"{BASE_URL}/api/notifications/inbox", headers=auth_headers)
                    notifications = inbox_response.json().get("notifications", [])
                    unread_notifs = [n for n in notifications if not n.get("read")]
        
        if not unread_notifs:
            pytest.skip("No unread notifications to test with")
        
        notif_id = unread_notifs[0]["id"]
        
        # Mark as read
        read_response = requests.post(f"{BASE_URL}/api/notifications/read/{notif_id}", headers=auth_headers)
        assert read_response.status_code == 200, f"Mark read failed: {read_response.text}"
        
        # Verify it's now read
        inbox_after = requests.get(f"{BASE_URL}/api/notifications/inbox", headers=auth_headers)
        notifications_after = inbox_after.json().get("notifications", [])
        marked_notif = next((n for n in notifications_after if n["id"] == notif_id), None)
        
        if marked_notif:
            assert marked_notif.get("read") == True, "Notification should be marked as read"
        
        print(f"Successfully marked notification {notif_id} as read")
    
    def test_mark_all_notifications_as_read(self, auth_headers):
        """Test POST /api/notifications/read-all marks all as read"""
        response = requests.post(f"{BASE_URL}/api/notifications/read-all", headers=auth_headers)
        assert response.status_code == 200, f"Mark all read failed: {response.text}"
        
        # Verify unread count is 0
        inbox_response = requests.get(f"{BASE_URL}/api/notifications/inbox", headers=auth_headers)
        assert inbox_response.status_code == 200
        
        unread_count = inbox_response.json().get("unread_count", -1)
        assert unread_count == 0, f"Unread count should be 0 after mark-all-read, got {unread_count}"
        
        print("Successfully marked all notifications as read")


class TestMoodEndpoints:
    """Test basic mood CRUD to ensure moods can be logged"""
    
    @pytest.fixture(scope="class")
    def test_user_token(self):
        """Login as test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Test user login failed")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, test_user_token):
        return {"Authorization": f"Bearer {test_user_token}"}
    
    def test_get_moods_list(self, auth_headers):
        """Test GET /api/moods returns mood history"""
        response = requests.get(f"{BASE_URL}/api/moods", headers=auth_headers)
        assert response.status_code == 200
        
        moods = response.json()
        assert isinstance(moods, list), "Moods should be a list"
        print(f"User has {len(moods)} moods logged")
    
    def test_create_mood(self, auth_headers):
        """Test POST /api/moods creates a new mood entry"""
        response = requests.post(f"{BASE_URL}/api/moods", json={
            "mood": "Grateful",
            "intensity": 8,
            "note": "Test mood for iteration 92"
        }, headers=auth_headers)
        
        assert response.status_code == 200, f"Create mood failed: {response.text}"
        
        data = response.json()
        assert data.get("mood") == "Grateful"
        assert data.get("intensity") == 8
        assert "id" in data
        
        print(f"Created mood: {data['mood']} with intensity {data['intensity']}")


class TestBlessingTemplates:
    """Test blessing templates endpoint"""
    
    def test_get_blessing_templates(self):
        """Test GET /api/blessings/templates returns templates"""
        response = requests.get(f"{BASE_URL}/api/blessings/templates")
        assert response.status_code == 200
        
        templates = response.json()
        assert isinstance(templates, list), "Templates should be a list"
        assert len(templates) > 0, "Should have at least one template"
        
        # Verify template structure
        template = templates[0]
        assert "id" in template, "Template missing id"
        assert "category" in template, "Template missing category"
        assert "text" in template, "Template missing text"
        assert "color" in template, "Template missing color"
        
        print(f"Found {len(templates)} blessing templates")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
