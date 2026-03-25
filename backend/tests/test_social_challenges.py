"""
Test suite for Social/Friends system, Messaging with privacy controls, and Daily Challenges.
Tests the new features: Friends page tabs, open messaging, message privacy, and daily challenge system.
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "password"

# Secondary test user for social interactions
TEST_EMAIL_2 = f"test_social_{uuid.uuid4().hex[:8]}@test.com"
TEST_PASSWORD_2 = "password123"
TEST_NAME_2 = "Test Social User"


@pytest.fixture(scope="module")
def auth_token():
    """Get auth token for primary test user."""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Primary user authentication failed")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Auth headers for primary user."""
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture(scope="module")
def secondary_user():
    """Create and authenticate a secondary test user for social interactions."""
    # Register new user
    reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
        "name": TEST_NAME_2,
        "email": TEST_EMAIL_2,
        "password": TEST_PASSWORD_2
    })
    if reg_response.status_code == 200:
        data = reg_response.json()
        return {
            "token": data["token"],
            "user": data["user"],
            "headers": {"Authorization": f"Bearer {data['token']}"}
        }
    elif reg_response.status_code == 400:
        # User already exists, try login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL_2,
            "password": TEST_PASSWORD_2
        })
        if login_response.status_code == 200:
            data = login_response.json()
            return {
                "token": data["token"],
                "user": data["user"],
                "headers": {"Authorization": f"Bearer {data['token']}"}
            }
    pytest.skip("Could not create/login secondary test user")


class TestDailyChallenge:
    """Tests for Daily Challenge system - rotating challenges, completion, history, leaderboard."""

    def test_get_daily_challenge(self, auth_headers):
        """GET /api/daily-challenge returns today's challenge with required fields."""
        response = requests.get(f"{BASE_URL}/api/daily-challenge", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "challenge" in data, "Response should contain 'challenge'"
        assert "stats" in data, "Response should contain 'stats'"
        
        challenge = data["challenge"]
        assert "id" in challenge, "Challenge should have 'id'"
        assert "title" in challenge, "Challenge should have 'title'"
        assert "description" in challenge, "Challenge should have 'description'"
        assert "category" in challenge, "Challenge should have 'category'"
        assert "xp" in challenge, "Challenge should have 'xp'"
        assert "difficulty" in challenge, "Challenge should have 'difficulty'"
        assert "color" in challenge, "Challenge should have 'color'"
        assert "date" in challenge, "Challenge should have 'date'"
        assert "completed" in challenge, "Challenge should have 'completed' status"
        
        stats = data["stats"]
        assert "total_completed" in stats, "Stats should have 'total_completed'"
        assert "current_streak" in stats, "Stats should have 'current_streak'"
        
        print(f"Daily challenge: {challenge['title']} ({challenge['category']}) - {challenge['xp']} XP")
        print(f"Completed: {challenge['completed']}, Total completed: {stats['total_completed']}")

    def test_daily_challenge_requires_auth(self):
        """GET /api/daily-challenge requires authentication."""
        response = requests.get(f"{BASE_URL}/api/daily-challenge")
        assert response.status_code == 401, "Should require authentication"

    def test_complete_daily_challenge(self, auth_headers):
        """POST /api/daily-challenge/complete marks challenge as done."""
        response = requests.post(f"{BASE_URL}/api/daily-challenge/complete", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "status" in data, "Response should have 'status'"
        # Status can be 'completed' or 'already_completed'
        assert data["status"] in ["completed", "already_completed"], f"Unexpected status: {data['status']}"
        
        if data["status"] == "completed":
            assert "xp_earned" in data, "Should return xp_earned on completion"
            assert "total_completed" in data, "Should return total_completed"
            print(f"Challenge completed! +{data['xp_earned']} XP, Total: {data['total_completed']}")
        else:
            print("Challenge already completed today")

    def test_get_challenge_history(self, auth_headers):
        """GET /api/daily-challenge/history returns user's completion history."""
        response = requests.get(f"{BASE_URL}/api/daily-challenge/history", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "history" in data, "Response should have 'history'"
        assert "total_xp" in data, "Response should have 'total_xp'"
        assert "total_completed" in data, "Response should have 'total_completed'"
        
        assert isinstance(data["history"], list), "History should be a list"
        assert isinstance(data["total_xp"], int), "total_xp should be an integer"
        
        print(f"Challenge history: {data['total_completed']} completed, {data['total_xp']} total XP")
        
        # Verify history entries have required fields
        if data["history"]:
            entry = data["history"][0]
            assert "challenge_title" in entry, "History entry should have 'challenge_title'"
            assert "xp_earned" in entry, "History entry should have 'xp_earned'"
            assert "completed_at" in entry, "History entry should have 'completed_at'"

    def test_get_challenge_leaderboard(self, auth_headers):
        """GET /api/daily-challenge/leaderboard returns ranked users by XP."""
        response = requests.get(f"{BASE_URL}/api/daily-challenge/leaderboard", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "leaderboard" in data, "Response should have 'leaderboard'"
        assert isinstance(data["leaderboard"], list), "Leaderboard should be a list"
        
        if data["leaderboard"]:
            leader = data["leaderboard"][0]
            assert "rank" in leader, "Leader should have 'rank'"
            assert "user_id" in leader, "Leader should have 'user_id'"
            assert "display_name" in leader, "Leader should have 'display_name'"
            assert "total_xp" in leader, "Leader should have 'total_xp'"
            assert "total_completed" in leader, "Leader should have 'total_completed'"
            assert "is_me" in leader, "Leader should have 'is_me' flag"
            
            print(f"Leaderboard top: {leader['display_name']} - {leader['total_xp']} XP")


class TestUsersDiscover:
    """Tests for user discovery endpoint."""

    def test_discover_users(self, auth_headers):
        """GET /api/users/discover returns all platform users."""
        response = requests.get(f"{BASE_URL}/api/users/discover", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "users" in data, "Response should have 'users'"
        assert "total" in data, "Response should have 'total'"
        assert isinstance(data["users"], list), "Users should be a list"
        
        if data["users"]:
            user = data["users"][0]
            assert "id" in user, "User should have 'id'"
            assert "name" in user, "User should have 'name'"
            assert "display_name" in user, "User should have 'display_name'"
            assert "avatar_style" in user, "User should have 'avatar_style'"
            assert "is_friend" in user, "User should have 'is_friend'"
            assert "is_pending" in user, "User should have 'is_pending'"
            assert "message_privacy" in user, "User should have 'message_privacy'"
            
        print(f"Discovered {len(data['users'])} users, total: {data['total']}")

    def test_discover_users_requires_auth(self):
        """GET /api/users/discover requires authentication."""
        response = requests.get(f"{BASE_URL}/api/users/discover")
        assert response.status_code == 401, "Should require authentication"


class TestFriendsSystem:
    """Tests for Friends system - requests, accept/decline, list, search."""

    def test_get_friends_list(self, auth_headers):
        """GET /api/friends/list returns user's friends."""
        response = requests.get(f"{BASE_URL}/api/friends/list", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "friends" in data, "Response should have 'friends'"
        assert "count" in data, "Response should have 'count'"
        assert isinstance(data["friends"], list), "Friends should be a list"
        
        print(f"Friends count: {data['count']}")

    def test_get_friend_requests(self, auth_headers):
        """GET /api/friends/requests returns pending requests."""
        response = requests.get(f"{BASE_URL}/api/friends/requests", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "received" in data, "Response should have 'received'"
        assert "sent" in data, "Response should have 'sent'"
        assert isinstance(data["received"], list), "Received should be a list"
        assert isinstance(data["sent"], list), "Sent should be a list"
        
        print(f"Received requests: {len(data['received'])}, Sent: {len(data['sent'])}")

    def test_search_users(self, auth_headers):
        """GET /api/friends/search searches users by name."""
        response = requests.get(f"{BASE_URL}/api/friends/search?q=test", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "users" in data, "Response should have 'users'"
        assert isinstance(data["users"], list), "Users should be a list"
        
        if data["users"]:
            user = data["users"][0]
            assert "id" in user, "User should have 'id'"
            assert "display_name" in user, "User should have 'display_name'"
            assert "is_friend" in user, "User should have 'is_friend'"
            assert "is_pending" in user, "User should have 'is_pending'"
            assert "message_privacy" in user, "User should have 'message_privacy'"
            
        print(f"Search results for 'test': {len(data['users'])} users")

    def test_search_requires_min_length(self, auth_headers):
        """GET /api/friends/search requires at least 2 characters."""
        response = requests.get(f"{BASE_URL}/api/friends/search?q=a", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["users"] == [], "Should return empty list for short query"

    def test_get_suggested_friends(self, auth_headers):
        """GET /api/friends/suggested returns suggested friends."""
        response = requests.get(f"{BASE_URL}/api/friends/suggested", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "suggested" in data, "Response should have 'suggested'"
        assert isinstance(data["suggested"], list), "Suggested should be a list"
        
        print(f"Suggested friends: {len(data['suggested'])}")

    def test_send_friend_request(self, auth_headers, secondary_user):
        """POST /api/friends/request sends a friend request."""
        response = requests.post(f"{BASE_URL}/api/friends/request", 
            json={"user_id": secondary_user["user"]["id"]},
            headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "status" in data, "Response should have 'status'"
        # Status can be 'sent', 'already_pending', or 'already_friends'
        assert data["status"] in ["sent", "already_pending", "already_friends"], f"Unexpected status: {data['status']}"
        print(f"Friend request status: {data['status']}")

    def test_send_friend_request_invalid_user(self, auth_headers):
        """POST /api/friends/request with invalid user_id returns 404."""
        response = requests.post(f"{BASE_URL}/api/friends/request",
            json={"user_id": "nonexistent-user-id"},
            headers=auth_headers)
        assert response.status_code == 404, "Should return 404 for nonexistent user"


class TestFriendsFeed:
    """Tests for activity feed."""

    def test_get_friends_feed(self, auth_headers):
        """GET /api/friends/feed returns activity feed."""
        response = requests.get(f"{BASE_URL}/api/friends/feed", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "feed" in data, "Response should have 'feed'"
        assert isinstance(data["feed"], list), "Feed should be a list"
        
        if data["feed"]:
            activity = data["feed"][0]
            assert "id" in activity, "Activity should have 'id'"
            assert "user_id" in activity, "Activity should have 'user_id'"
            assert "user_name" in activity, "Activity should have 'user_name'"
            assert "type" in activity, "Activity should have 'type'"
            assert "message" in activity, "Activity should have 'message'"
            assert "created_at" in activity, "Activity should have 'created_at'"
            
        print(f"Feed items: {len(data['feed'])}")

    def test_share_with_friends(self, auth_headers):
        """POST /api/friends/share creates activity."""
        response = requests.post(f"{BASE_URL}/api/friends/share",
            json={"type": "achievement", "message": "Test share from pytest", "data": {}},
            headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["status"] == "shared", "Should return 'shared' status"


class TestMessaging:
    """Tests for messaging system with privacy controls."""

    def test_get_conversations(self, auth_headers):
        """GET /api/messages/conversations returns conversation list."""
        response = requests.get(f"{BASE_URL}/api/messages/conversations", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "conversations" in data, "Response should have 'conversations'"
        assert isinstance(data["conversations"], list), "Conversations should be a list"
        
        if data["conversations"]:
            convo = data["conversations"][0]
            assert "conversation_id" in convo, "Convo should have 'conversation_id'"
            assert "other_id" in convo, "Convo should have 'other_id'"
            assert "other_name" in convo, "Convo should have 'other_name'"
            assert "last_message" in convo, "Convo should have 'last_message'"
            assert "unread_count" in convo, "Convo should have 'unread_count'"
            
        print(f"Conversations: {len(data['conversations'])}")

    def test_send_message(self, auth_headers, secondary_user):
        """POST /api/messages/send sends a message."""
        response = requests.post(f"{BASE_URL}/api/messages/send",
            json={"to_id": secondary_user["user"]["id"], "text": "Hello from pytest!"},
            headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["status"] == "sent", "Should return 'sent' status"
        assert "message_id" in data, "Should return message_id"
        print(f"Message sent, ID: {data['message_id']}")

    def test_send_message_requires_fields(self, auth_headers):
        """POST /api/messages/send requires to_id and text."""
        response = requests.post(f"{BASE_URL}/api/messages/send",
            json={"to_id": ""},
            headers=auth_headers)
        assert response.status_code == 400, "Should return 400 for missing fields"

    def test_get_messages_in_conversation(self, auth_headers, secondary_user):
        """GET /api/messages/{conversation_id} returns messages."""
        # First send a message to create conversation
        requests.post(f"{BASE_URL}/api/messages/send",
            json={"to_id": secondary_user["user"]["id"], "text": "Test message"},
            headers=auth_headers)
        
        # Get user ID from auth
        me_response = requests.get(f"{BASE_URL}/api/auth/me", headers=auth_headers)
        my_id = me_response.json()["id"]
        
        # Construct conversation ID
        convo_id = "_".join(sorted([my_id, secondary_user["user"]["id"]]))
        
        response = requests.get(f"{BASE_URL}/api/messages/{convo_id}", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "messages" in data, "Response should have 'messages'"
        assert isinstance(data["messages"], list), "Messages should be a list"
        
        if data["messages"]:
            msg = data["messages"][0]
            assert "id" in msg, "Message should have 'id'"
            assert "from_id" in msg, "Message should have 'from_id'"
            assert "to_id" in msg, "Message should have 'to_id'"
            assert "text" in msg, "Message should have 'text'"
            
        print(f"Messages in conversation: {len(data['messages'])}")


class TestMessagePrivacy:
    """Tests for message privacy settings."""

    def test_set_message_privacy_nobody(self, secondary_user):
        """PUT /api/profile/customize can set message_privacy to 'nobody'."""
        response = requests.put(f"{BASE_URL}/api/profile/customize",
            json={"message_privacy": "nobody"},
            headers=secondary_user["headers"])
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("message_privacy") == "nobody", "message_privacy should be 'nobody'"
        print("Set message_privacy to 'nobody'")

    def test_message_blocked_when_privacy_nobody(self, auth_headers, secondary_user):
        """POST /api/messages/send returns 403 when recipient has message_privacy='nobody'."""
        # First ensure secondary user has message_privacy='nobody'
        requests.put(f"{BASE_URL}/api/profile/customize",
            json={"message_privacy": "nobody"},
            headers=secondary_user["headers"])
        
        # Try to send message
        response = requests.post(f"{BASE_URL}/api/messages/send",
            json={"to_id": secondary_user["user"]["id"], "text": "This should be blocked"},
            headers=auth_headers)
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        
        data = response.json()
        assert "disabled" in data.get("detail", "").lower() or "messages" in data.get("detail", "").lower(), \
            f"Should indicate messages are disabled: {data}"
        print("Message correctly blocked when privacy='nobody'")

    def test_set_message_privacy_everyone(self, secondary_user):
        """PUT /api/profile/customize can set message_privacy to 'everyone'."""
        response = requests.put(f"{BASE_URL}/api/profile/customize",
            json={"message_privacy": "everyone"},
            headers=secondary_user["headers"])
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("message_privacy") == "everyone", "message_privacy should be 'everyone'"
        print("Set message_privacy to 'everyone'")

    def test_message_allowed_when_privacy_everyone(self, auth_headers, secondary_user):
        """POST /api/messages/send succeeds when recipient has message_privacy='everyone'."""
        # First ensure secondary user has message_privacy='everyone'
        requests.put(f"{BASE_URL}/api/profile/customize",
            json={"message_privacy": "everyone"},
            headers=secondary_user["headers"])
        
        # Try to send message
        response = requests.post(f"{BASE_URL}/api/messages/send",
            json={"to_id": secondary_user["user"]["id"], "text": "This should work"},
            headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("Message correctly allowed when privacy='everyone'")


class TestProfileMessagePrivacyUI:
    """Tests for profile message privacy settings in profile API."""

    def test_get_profile_includes_message_privacy(self, auth_headers):
        """GET /api/profile/me includes message_privacy field."""
        response = requests.get(f"{BASE_URL}/api/profile/me", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "message_privacy" in data, "Profile should include 'message_privacy'"
        assert data["message_privacy"] in ["everyone", "friends_only", "nobody"], \
            f"Invalid message_privacy value: {data['message_privacy']}"
        print(f"Current message_privacy: {data['message_privacy']}")

    def test_set_message_privacy_friends_only(self, auth_headers):
        """PUT /api/profile/customize can set message_privacy to 'friends_only'."""
        response = requests.put(f"{BASE_URL}/api/profile/customize",
            json={"message_privacy": "friends_only"},
            headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("message_privacy") == "friends_only", "message_privacy should be 'friends_only'"
        
        # Reset to everyone for other tests
        requests.put(f"{BASE_URL}/api/profile/customize",
            json={"message_privacy": "everyone"},
            headers=auth_headers)
        print("Set and reset message_privacy successfully")
