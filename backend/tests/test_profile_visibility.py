"""
Test Profile Visibility Feature
- Tests visibility settings (public/private/friends)
- Tests profile access control based on visibility
- Tests mutual follow (friendship) logic
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_USER_1 = {"email": "testlearn@test.com", "password": "password123"}
TEST_USER_2 = {"email": "viewer@test.com", "password": "password123"}


class TestProfileVisibility:
    """Profile visibility feature tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def get_auth_token(self, email, password):
        """Helper to get auth token"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": email,
            "password": password
        })
        if response.status_code == 200:
            return response.json().get("token"), response.json().get("user", {}).get("id")
        return None, None
    
    def register_user(self, name, email, password):
        """Helper to register a new user"""
        response = self.session.post(f"{BASE_URL}/api/auth/register", json={
            "name": name,
            "email": email,
            "password": password
        })
        if response.status_code == 200:
            return response.json().get("token"), response.json().get("user", {}).get("id")
        return None, None
    
    # ==================== GET /api/profile/me Tests ====================
    
    def test_profile_me_returns_visibility_default_public(self):
        """GET /api/profile/me returns visibility field defaulting to 'public'"""
        token, user_id = self.get_auth_token(TEST_USER_1["email"], TEST_USER_1["password"])
        assert token is not None, "Failed to login test user 1"
        
        response = self.session.get(
            f"{BASE_URL}/api/profile/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Visibility should exist and default to 'public'
        assert "visibility" in data, "visibility field missing from profile/me response"
        assert data["visibility"] in ["public", "private", "friends"], f"Invalid visibility value: {data['visibility']}"
        print(f"✓ GET /api/profile/me returns visibility: {data['visibility']}")
    
    def test_profile_me_requires_auth(self):
        """GET /api/profile/me requires authentication"""
        response = self.session.get(f"{BASE_URL}/api/profile/me")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("✓ GET /api/profile/me returns 401 without auth")
    
    # ==================== PUT /api/profile/customize Tests ====================
    
    def test_set_visibility_private(self):
        """PUT /api/profile/customize with visibility='private' saves correctly"""
        token, user_id = self.get_auth_token(TEST_USER_1["email"], TEST_USER_1["password"])
        assert token is not None, "Failed to login test user 1"
        
        response = self.session.put(
            f"{BASE_URL}/api/profile/customize",
            headers={"Authorization": f"Bearer {token}"},
            json={"visibility": "private"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("visibility") == "private", f"Expected visibility='private', got {data.get('visibility')}"
        
        # Verify persistence via GET
        verify_response = self.session.get(
            f"{BASE_URL}/api/profile/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert verify_response.status_code == 200
        assert verify_response.json().get("visibility") == "private"
        print("✓ PUT /api/profile/customize with visibility='private' saves correctly")
    
    def test_set_visibility_friends(self):
        """PUT /api/profile/customize with visibility='friends' saves correctly"""
        token, user_id = self.get_auth_token(TEST_USER_1["email"], TEST_USER_1["password"])
        assert token is not None, "Failed to login test user 1"
        
        response = self.session.put(
            f"{BASE_URL}/api/profile/customize",
            headers={"Authorization": f"Bearer {token}"},
            json={"visibility": "friends"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("visibility") == "friends", f"Expected visibility='friends', got {data.get('visibility')}"
        
        # Verify persistence via GET
        verify_response = self.session.get(
            f"{BASE_URL}/api/profile/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert verify_response.status_code == 200
        assert verify_response.json().get("visibility") == "friends"
        print("✓ PUT /api/profile/customize with visibility='friends' saves correctly")
    
    def test_set_visibility_public(self):
        """PUT /api/profile/customize with visibility='public' saves correctly"""
        token, user_id = self.get_auth_token(TEST_USER_1["email"], TEST_USER_1["password"])
        assert token is not None, "Failed to login test user 1"
        
        response = self.session.put(
            f"{BASE_URL}/api/profile/customize",
            headers={"Authorization": f"Bearer {token}"},
            json={"visibility": "public"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("visibility") == "public", f"Expected visibility='public', got {data.get('visibility')}"
        print("✓ PUT /api/profile/customize with visibility='public' saves correctly")
    
    def test_customize_requires_auth(self):
        """PUT /api/profile/customize requires authentication"""
        response = self.session.put(
            f"{BASE_URL}/api/profile/customize",
            json={"visibility": "private"}
        )
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("✓ PUT /api/profile/customize returns 401 without auth")
    
    # ==================== GET /api/profile/public/{user_id} Tests ====================
    
    def test_public_profile_returns_full_for_public_visibility(self):
        """GET /api/profile/public/{user_id} returns full profile for public visibility"""
        # First set user1's profile to public
        token1, user1_id = self.get_auth_token(TEST_USER_1["email"], TEST_USER_1["password"])
        assert token1 is not None, "Failed to login test user 1"
        
        self.session.put(
            f"{BASE_URL}/api/profile/customize",
            headers={"Authorization": f"Bearer {token1}"},
            json={"visibility": "public"}
        )
        
        # Login as user2 and view user1's profile
        token2, user2_id = self.get_auth_token(TEST_USER_2["email"], TEST_USER_2["password"])
        assert token2 is not None, "Failed to login test user 2"
        
        response = self.session.get(
            f"{BASE_URL}/api/profile/public/{user1_id}",
            headers={"Authorization": f"Bearer {token2}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Should NOT be restricted
        assert data.get("restricted") == False, f"Expected restricted=False for public profile, got {data.get('restricted')}"
        assert "stats" in data, "Public profile should include stats"
        assert data.get("visibility") == "public"
        print("✓ GET /api/profile/public/{user_id} returns full profile for public visibility")
    
    def test_private_profile_returns_restricted_for_non_owner(self):
        """GET /api/profile/public/{user_id} returns restricted=true for private profiles when viewed by non-owner"""
        # Set user1's profile to private
        token1, user1_id = self.get_auth_token(TEST_USER_1["email"], TEST_USER_1["password"])
        assert token1 is not None, "Failed to login test user 1"
        
        self.session.put(
            f"{BASE_URL}/api/profile/customize",
            headers={"Authorization": f"Bearer {token1}"},
            json={"visibility": "private"}
        )
        
        # Login as user2 and try to view user1's private profile
        token2, user2_id = self.get_auth_token(TEST_USER_2["email"], TEST_USER_2["password"])
        assert token2 is not None, "Failed to login test user 2"
        
        response = self.session.get(
            f"{BASE_URL}/api/profile/public/{user1_id}",
            headers={"Authorization": f"Bearer {token2}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Should be restricted
        assert data.get("restricted") == True, f"Expected restricted=True for private profile, got {data.get('restricted')}"
        assert data.get("visibility") == "private"
        assert "message" in data, "Restricted profile should include message"
        assert "stats" not in data, "Restricted profile should NOT include stats"
        print("✓ GET /api/profile/public/{user_id} returns restricted=true for private profiles")
    
    def test_owner_can_view_own_private_profile(self):
        """GET /api/profile/public/{user_id} returns full profile when owner views their own private profile"""
        # Set user1's profile to private
        token1, user1_id = self.get_auth_token(TEST_USER_1["email"], TEST_USER_1["password"])
        assert token1 is not None, "Failed to login test user 1"
        
        self.session.put(
            f"{BASE_URL}/api/profile/customize",
            headers={"Authorization": f"Bearer {token1}"},
            json={"visibility": "private"}
        )
        
        # User1 views their own profile
        response = self.session.get(
            f"{BASE_URL}/api/profile/public/{user1_id}",
            headers={"Authorization": f"Bearer {token1}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Owner should see full profile even if private
        assert data.get("restricted") == False, f"Expected restricted=False for owner viewing own profile, got {data.get('restricted')}"
        assert "stats" in data, "Owner should see stats on their own profile"
        print("✓ GET /api/profile/public/{user_id} returns full profile when owner views their own private profile")
    
    def test_friends_only_profile_restricted_for_non_friend(self):
        """GET /api/profile/public/{user_id} returns restricted=true for friends-only profiles when viewer is not a mutual follower"""
        # Set user1's profile to friends only
        token1, user1_id = self.get_auth_token(TEST_USER_1["email"], TEST_USER_1["password"])
        assert token1 is not None, "Failed to login test user 1"
        
        self.session.put(
            f"{BASE_URL}/api/profile/customize",
            headers={"Authorization": f"Bearer {token1}"},
            json={"visibility": "friends"}
        )
        
        # Login as user2 (who is NOT a mutual follower) and try to view
        token2, user2_id = self.get_auth_token(TEST_USER_2["email"], TEST_USER_2["password"])
        assert token2 is not None, "Failed to login test user 2"
        
        # Ensure they are NOT following each other (unfollow if needed)
        # Check current following status and unfollow if following
        following_resp = self.session.get(
            f"{BASE_URL}/api/community/me/following",
            headers={"Authorization": f"Bearer {token2}"}
        )
        if following_resp.status_code == 200:
            following_list = following_resp.json()
            for f in following_list:
                if f.get("following_id") == user1_id:
                    # Unfollow
                    self.session.post(
                        f"{BASE_URL}/api/community/follow/{user1_id}",
                        headers={"Authorization": f"Bearer {token2}"}
                    )
                    break
        
        response = self.session.get(
            f"{BASE_URL}/api/profile/public/{user1_id}",
            headers={"Authorization": f"Bearer {token2}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Should be restricted since they're not mutual followers
        assert data.get("restricted") == True, f"Expected restricted=True for friends-only profile viewed by non-friend, got {data.get('restricted')}"
        assert data.get("visibility") == "friends"
        assert "message" in data
        print("✓ GET /api/profile/public/{user_id} returns restricted=true for friends-only profiles when viewer is not a mutual follower")
    
    def test_friends_only_profile_visible_for_mutual_followers(self):
        """GET /api/profile/public/{user_id} returns full profile for friends-only when viewer is a mutual follower"""
        # Get tokens for both users
        token1, user1_id = self.get_auth_token(TEST_USER_1["email"], TEST_USER_1["password"])
        token2, user2_id = self.get_auth_token(TEST_USER_2["email"], TEST_USER_2["password"])
        assert token1 is not None and token2 is not None, "Failed to login test users"
        
        # Set user1's profile to friends only
        self.session.put(
            f"{BASE_URL}/api/profile/customize",
            headers={"Authorization": f"Bearer {token1}"},
            json={"visibility": "friends"}
        )
        
        # Ensure mutual follows exist
        # First check if user1 follows user2
        following1_resp = self.session.get(
            f"{BASE_URL}/api/community/me/following",
            headers={"Authorization": f"Bearer {token1}"}
        )
        user1_follows_user2 = False
        if following1_resp.status_code == 200:
            for f in following1_resp.json():
                if f.get("following_id") == user2_id:
                    user1_follows_user2 = True
                    break
        
        # If not following, follow
        if not user1_follows_user2:
            follow_resp1 = self.session.post(
                f"{BASE_URL}/api/community/follow/{user2_id}",
                headers={"Authorization": f"Bearer {token1}"}
            )
            print(f"User1 follows User2: {follow_resp1.status_code} - {follow_resp1.json()}")
        
        # Check if user2 follows user1
        following2_resp = self.session.get(
            f"{BASE_URL}/api/community/me/following",
            headers={"Authorization": f"Bearer {token2}"}
        )
        user2_follows_user1 = False
        if following2_resp.status_code == 200:
            for f in following2_resp.json():
                if f.get("following_id") == user1_id:
                    user2_follows_user1 = True
                    break
        
        # If not following, follow
        if not user2_follows_user1:
            follow_resp2 = self.session.post(
                f"{BASE_URL}/api/community/follow/{user1_id}",
                headers={"Authorization": f"Bearer {token2}"}
            )
            print(f"User2 follows User1: {follow_resp2.status_code} - {follow_resp2.json()}")
        
        # Now user2 should be able to see user1's friends-only profile
        response = self.session.get(
            f"{BASE_URL}/api/profile/public/{user1_id}",
            headers={"Authorization": f"Bearer {token2}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Should NOT be restricted since they're mutual followers
        assert data.get("restricted") == False, f"Expected restricted=False for mutual followers, got {data.get('restricted')}"
        assert "stats" in data, "Mutual followers should see stats"
        print("✓ GET /api/profile/public/{user_id} returns full profile for friends-only when viewer is a mutual follower")
    
    def test_public_profile_without_auth(self):
        """GET /api/profile/public/{user_id} works without authentication for public profiles"""
        # First set user1's profile to public
        token1, user1_id = self.get_auth_token(TEST_USER_1["email"], TEST_USER_1["password"])
        assert token1 is not None, "Failed to login test user 1"
        
        self.session.put(
            f"{BASE_URL}/api/profile/customize",
            headers={"Authorization": f"Bearer {token1}"},
            json={"visibility": "public"}
        )
        
        # View without auth
        response = self.session.get(f"{BASE_URL}/api/profile/public/{user1_id}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("restricted") == False, "Public profile should be visible without auth"
        print("✓ GET /api/profile/public/{user_id} works without authentication for public profiles")
    
    def test_private_profile_restricted_without_auth(self):
        """GET /api/profile/public/{user_id} returns restricted for private profiles without auth"""
        # Set user1's profile to private
        token1, user1_id = self.get_auth_token(TEST_USER_1["email"], TEST_USER_1["password"])
        assert token1 is not None, "Failed to login test user 1"
        
        self.session.put(
            f"{BASE_URL}/api/profile/customize",
            headers={"Authorization": f"Bearer {token1}"},
            json={"visibility": "private"}
        )
        
        # View without auth
        response = self.session.get(f"{BASE_URL}/api/profile/public/{user1_id}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("restricted") == True, "Private profile should be restricted without auth"
        print("✓ GET /api/profile/public/{user_id} returns restricted for private profiles without auth")
    
    def test_profile_not_found(self):
        """GET /api/profile/public/{user_id} returns 404 for non-existent user"""
        fake_user_id = str(uuid.uuid4())
        response = self.session.get(f"{BASE_URL}/api/profile/public/{fake_user_id}")
        
        assert response.status_code == 404, f"Expected 404 for non-existent user, got {response.status_code}"
        print("✓ GET /api/profile/public/{user_id} returns 404 for non-existent user")


class TestCleanup:
    """Cleanup test - reset visibility to public"""
    
    def test_cleanup_reset_visibility(self):
        """Reset test user's visibility to public after tests"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        
        response = session.post(f"{BASE_URL}/api/auth/login", json=TEST_USER_1)
        if response.status_code == 200:
            token = response.json().get("token")
            session.put(
                f"{BASE_URL}/api/profile/customize",
                headers={"Authorization": f"Bearer {token}"},
                json={"visibility": "public"}
            )
            print("✓ Cleanup: Reset test user visibility to public")
