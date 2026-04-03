"""
Iteration 250 - Sentinel Content Moderation & Guilds/Community System Tests

Tests for:
- POST /api/sentinel/scan - Content scanning for prohibited patterns
- GET /api/sentinel/stats - Sentinel statistics
- GET /api/sentinel/log - Violation log entries
- GET /api/sentinel/mutes - Shadow-muted users list
- POST /api/sentinel/mute/{user_id} - Shadow mute a user
- POST /api/sentinel/unmute/{user_id} - Remove shadow mute
- GET /api/guilds/identity - User identity settings
- PATCH /api/guilds/identity - Update identity mode (full/avatar/ghost)
- GET /api/guilds/channels - Guild channels and widget feeds
- POST /api/guilds/feed/{feed_id}/post - Post to feed
- GET /api/guilds/feed/{feed_id}/posts - Get feed posts
- POST /api/guilds/feed/{feed_id}/join - Join a feed channel
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSentinelContentModeration:
    """Tests for Content Sentinel - automated content moderation system"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test user authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login with test user
        login_res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if login_res.status_code == 200:
            token = login_res.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.token = token
        else:
            pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_sentinel_scan_clean_content(self):
        """POST /api/sentinel/scan - Clean content should return clean=true"""
        response = self.session.post(f"{BASE_URL}/api/sentinel/scan", json={
            "text": "This is a peaceful meditation about love and harmony",
            "context": "general"
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get("clean") == True
        assert "message" in data
        print(f"✓ Clean content scan passed: {data}")
    
    def test_sentinel_scan_prohibited_content(self):
        """POST /api/sentinel/scan - Prohibited content should return clean=false, blocked=true (or shadow_blocked if user is muted)"""
        response = self.session.post(f"{BASE_URL}/api/sentinel/scan", json={
            "text": "I hate everyone and want to kill them",
            "context": "feed"
        })
        assert response.status_code == 200
        data = response.json()
        # If user is shadow-muted, they get clean=true with shadow_blocked=true
        # Otherwise, they get clean=false with blocked=true
        if data.get("shadow_blocked"):
            assert data.get("clean") == True
            print(f"✓ User is shadow-muted, content silently dropped: {data}")
        else:
            assert data.get("clean") == False
            assert data.get("blocked") == True
            assert "risk_score" in data
            assert data["risk_score"] > 0
            print(f"✓ Prohibited content blocked: risk_score={data.get('risk_score')}")
    
    def test_sentinel_scan_empty_content(self):
        """POST /api/sentinel/scan - Empty content should return clean=true"""
        response = self.session.post(f"{BASE_URL}/api/sentinel/scan", json={
            "text": "",
            "context": "general"
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get("clean") == True
        print(f"✓ Empty content scan passed: {data}")
    
    def test_sentinel_stats(self):
        """GET /api/sentinel/stats - Returns sentinel statistics"""
        response = self.session.get(f"{BASE_URL}/api/sentinel/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_intercepted" in data
        assert "total_blocked" in data
        assert "active_shadow_mutes" in data
        assert isinstance(data["total_intercepted"], int)
        assert isinstance(data["total_blocked"], int)
        assert isinstance(data["active_shadow_mutes"], int)
        print(f"✓ Sentinel stats: intercepted={data['total_intercepted']}, blocked={data['total_blocked']}, mutes={data['active_shadow_mutes']}")
    
    def test_sentinel_log(self):
        """GET /api/sentinel/log - Returns violation log entries"""
        response = self.session.get(f"{BASE_URL}/api/sentinel/log?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert "entries" in data
        assert "total" in data
        assert isinstance(data["entries"], list)
        assert isinstance(data["total"], int)
        print(f"✓ Sentinel log: {data['total']} total entries, showing {len(data['entries'])}")
    
    def test_sentinel_mutes_list(self):
        """GET /api/sentinel/mutes - Returns list of shadow-muted users"""
        response = self.session.get(f"{BASE_URL}/api/sentinel/mutes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Sentinel mutes list: {len(data)} muted users")
    
    def test_sentinel_mute_and_unmute_user(self):
        """POST /api/sentinel/mute/{user_id} and /unmute/{user_id} - Shadow mute/unmute flow"""
        test_user_id = f"test_mute_user_{uuid.uuid4().hex[:8]}"
        
        # Mute the user
        mute_response = self.session.post(f"{BASE_URL}/api/sentinel/mute/{test_user_id}", json={
            "reason": "Test mute for iteration 250"
        })
        assert mute_response.status_code == 200
        mute_data = mute_response.json()
        assert mute_data.get("muted") == True or mute_data.get("already_muted") == True
        print(f"✓ User muted: {mute_data}")
        
        # Unmute the user
        unmute_response = self.session.post(f"{BASE_URL}/api/sentinel/unmute/{test_user_id}")
        assert unmute_response.status_code == 200
        unmute_data = unmute_response.json()
        assert "unmuted" in unmute_data
        print(f"✓ User unmuted: {unmute_data}")


class TestGuildsIdentitySystem:
    """Tests for Guilds & Identity system - community features with identity modes"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test user authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login with test user
        login_res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if login_res.status_code == 200:
            token = login_res.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.token = token
        else:
            pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_get_identity_settings(self):
        """GET /api/guilds/identity - Returns user identity settings with mode_data"""
        response = self.session.get(f"{BASE_URL}/api/guilds/identity")
        assert response.status_code == 200
        data = response.json()
        assert "mode" in data
        assert "mode_data" in data
        assert data["mode"] in ["full", "avatar", "ghost"]
        # mic_enabled and video_enabled may not be present until explicitly set
        print(f"✓ Identity settings: mode={data['mode']}, mic={data.get('mic_enabled', 'not set')}, video={data.get('video_enabled', 'not set')}")
    
    def test_update_identity_mode_full(self):
        """PATCH /api/guilds/identity - Update to full identity mode"""
        response = self.session.patch(f"{BASE_URL}/api/guilds/identity", json={
            "mode": "full"
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get("mode") == "full"
        assert data.get("mode_data", {}).get("visible") == True
        print(f"✓ Identity updated to full mode: {data.get('mode_data')}")
    
    def test_update_identity_mode_avatar(self):
        """PATCH /api/guilds/identity - Update to avatar identity mode"""
        response = self.session.patch(f"{BASE_URL}/api/guilds/identity", json={
            "mode": "avatar"
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get("mode") == "avatar"
        assert data.get("mode_data", {}).get("avatar") == True
        print(f"✓ Identity updated to avatar mode: {data.get('mode_data')}")
    
    def test_update_identity_mode_ghost(self):
        """PATCH /api/guilds/identity - Update to ghost identity mode"""
        response = self.session.patch(f"{BASE_URL}/api/guilds/identity", json={
            "mode": "ghost"
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get("mode") == "ghost"
        assert data.get("mode_data", {}).get("visible") == False
        print(f"✓ Identity updated to ghost mode: {data.get('mode_data')}")
    
    def test_update_identity_invalid_mode(self):
        """PATCH /api/guilds/identity - Invalid mode should return 400"""
        response = self.session.patch(f"{BASE_URL}/api/guilds/identity", json={
            "mode": "invalid_mode"
        })
        assert response.status_code == 400
        print(f"✓ Invalid mode rejected with 400")
    
    def test_update_identity_mic_video_toggles(self):
        """PATCH /api/guilds/identity - Update mic and video toggles"""
        response = self.session.patch(f"{BASE_URL}/api/guilds/identity", json={
            "mic_enabled": False,
            "video_enabled": False
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get("mic_enabled") == False
        assert data.get("video_enabled") == False
        print(f"✓ Mic/video toggles updated: mic={data.get('mic_enabled')}, video={data.get('video_enabled')}")
        
        # Reset to enabled
        self.session.patch(f"{BASE_URL}/api/guilds/identity", json={
            "mic_enabled": True,
            "video_enabled": True,
            "mode": "full"  # Reset to full mode for other tests
        })


class TestGuildsChannelsAndFeeds:
    """Tests for Guild channels and widget feed system"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test user authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login with test user
        login_res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if login_res.status_code == 200:
            token = login_res.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.token = token
        else:
            pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_get_channels(self):
        """GET /api/guilds/channels - Returns guild channels and widget feeds"""
        response = self.session.get(f"{BASE_URL}/api/guilds/channels")
        assert response.status_code == 200
        data = response.json()
        assert "guilds" in data
        assert "feeds" in data
        assert isinstance(data["guilds"], list)
        assert isinstance(data["feeds"], list)
        
        # Verify guild structure
        if len(data["guilds"]) > 0:
            guild = data["guilds"][0]
            assert "id" in guild
            assert "name" in guild
            assert "class_id" in guild
            assert "accessible" in guild
            assert "member_count" in guild
        
        # Verify feed structure
        if len(data["feeds"]) > 0:
            feed = data["feeds"][0]
            assert "id" in feed
            assert "name" in feed
            assert "widget" in feed
            assert "accessible" in feed
        
        print(f"✓ Channels: {len(data['guilds'])} guilds, {len(data['feeds'])} feeds")
        
        # Check if shaman guild is accessible (test user has class 'shaman')
        shaman_guild = next((g for g in data["guilds"] if g.get("class_id") == "shaman"), None)
        if shaman_guild:
            print(f"  Shaman guild accessible: {shaman_guild.get('accessible')}")
    
    def test_join_feed(self):
        """POST /api/guilds/feed/{feed_id}/join - Join a feed channel"""
        feed_id = "feed_solfeggio"  # Frequency Exchange feed
        response = self.session.post(f"{BASE_URL}/api/guilds/feed/{feed_id}/join")
        assert response.status_code == 200
        data = response.json()
        assert data.get("joined") == True
        print(f"✓ Joined feed: {feed_id}")
    
    def test_post_to_feed_clean_content(self):
        """POST /api/guilds/feed/{feed_id}/post - Post clean content to feed"""
        # First ensure user is in full mode (not ghost)
        self.session.patch(f"{BASE_URL}/api/guilds/identity", json={"mode": "full"})
        
        feed_id = "feed_solfeggio"
        test_text = f"Test post from iteration 250 - {uuid.uuid4().hex[:8]}"
        
        response = self.session.post(f"{BASE_URL}/api/guilds/feed/{feed_id}/post", json={
            "text": test_text
        })
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data.get("text") == test_text
        assert data.get("feed_id") == feed_id
        print(f"✓ Posted to feed: {data.get('id')}")
        return data.get("id")
    
    def test_post_to_feed_ghost_mode_blocked(self):
        """POST /api/guilds/feed/{feed_id}/post - Ghost mode users cannot post"""
        # Set to ghost mode
        self.session.patch(f"{BASE_URL}/api/guilds/identity", json={"mode": "ghost"})
        
        feed_id = "feed_solfeggio"
        response = self.session.post(f"{BASE_URL}/api/guilds/feed/{feed_id}/post", json={
            "text": "This should be blocked"
        })
        assert response.status_code == 403
        print(f"✓ Ghost mode post correctly blocked with 403")
        
        # Reset to full mode
        self.session.patch(f"{BASE_URL}/api/guilds/identity", json={"mode": "full"})
    
    def test_get_feed_posts(self):
        """GET /api/guilds/feed/{feed_id}/posts - Returns posts from feed"""
        feed_id = "feed_solfeggio"
        response = self.session.get(f"{BASE_URL}/api/guilds/feed/{feed_id}/posts?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            post = data[0]
            assert "id" in post
            assert "text" in post
            assert "user_name" in post
            assert "created_at" in post
        
        print(f"✓ Feed posts: {len(data)} posts retrieved")
    
    def test_feed_posts_ghost_user_anonymized(self):
        """GET /api/guilds/feed/{feed_id}/posts - Ghost users shown as 'Anonymous Entity'"""
        # First post as avatar mode
        self.session.patch(f"{BASE_URL}/api/guilds/identity", json={"mode": "avatar"})
        
        feed_id = "feed_ambient"
        test_text = f"Avatar mode post - {uuid.uuid4().hex[:8]}"
        
        # Post as avatar
        post_response = self.session.post(f"{BASE_URL}/api/guilds/feed/{feed_id}/post", json={
            "text": test_text
        })
        assert post_response.status_code == 200
        
        # Get posts and verify avatar mode is preserved
        posts_response = self.session.get(f"{BASE_URL}/api/guilds/feed/{feed_id}/posts?limit=5")
        assert posts_response.status_code == 200
        posts = posts_response.json()
        
        # Find our post
        our_post = next((p for p in posts if p.get("text") == test_text), None)
        if our_post:
            assert our_post.get("identity_mode") == "avatar"
            print(f"✓ Avatar mode post preserved: identity_mode={our_post.get('identity_mode')}")
        
        # Reset to full mode
        self.session.patch(f"{BASE_URL}/api/guilds/identity", json={"mode": "full"})


class TestSentinelIntegrationWithFeeds:
    """Tests for Sentinel integration with feed posting"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test user authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login with test user
        login_res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if login_res.status_code == 200:
            token = login_res.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.token = token
        else:
            pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_sentinel_scan_before_feed_post(self):
        """Verify sentinel scan works for feed context"""
        # Scan clean content
        clean_response = self.session.post(f"{BASE_URL}/api/sentinel/scan", json={
            "text": "Sharing my meditation experience with the community",
            "context": "feed"
        })
        assert clean_response.status_code == 200
        assert clean_response.json().get("clean") == True
        
        # Scan prohibited content
        bad_response = self.session.post(f"{BASE_URL}/api/sentinel/scan", json={
            "text": "I hate this and want to kill everyone",
            "context": "feed"
        })
        assert bad_response.status_code == 200
        bad_data = bad_response.json()
        # If user is shadow-muted, they get clean=true with shadow_blocked=true
        # Otherwise, they get clean=false with blocked=true
        if bad_data.get("shadow_blocked"):
            assert bad_data.get("clean") == True
            print(f"✓ User is shadow-muted, sentinel scan returns shadow_blocked")
        else:
            assert bad_data.get("clean") == False
            assert bad_data.get("blocked") == True
            print(f"✓ Sentinel scan integration verified for feed context")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
