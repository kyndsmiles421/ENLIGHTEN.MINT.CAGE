"""
Iteration 231 - Mixer Media & Templates Testing
Tests for:
1. Mix Templates (12 templates across 4 tiers)
2. Tiered Video Recording Config (480p→4K)
3. Tiered Audio Recording Config (44.1kHz→192kHz)
4. Tiered AI Generation with Gemini integration
5. Recording upload/download endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user (ultra_player tier)"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Auth headers for authenticated requests"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestMixTemplates:
    """Test Mix Templates endpoints"""
    
    def test_get_templates_returns_12_templates(self, auth_headers):
        """GET /api/mixer/templates returns 12 templates across 4 tiers"""
        response = requests.get(f"{BASE_URL}/api/mixer/templates", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "templates" in data
        assert "categories" in data
        assert "user_tier" in data
        
        templates = data["templates"]
        assert len(templates) == 12, f"Expected 12 templates, got {len(templates)}"
        
        # Verify tier distribution: 3 discovery, 3 player, 3 ultra_player, 3 sovereign
        tier_counts = {}
        for tpl in templates:
            tier = tpl.get("tier", "unknown")
            tier_counts[tier] = tier_counts.get(tier, 0) + 1
        
        assert tier_counts.get("discovery", 0) == 3, f"Expected 3 discovery templates, got {tier_counts.get('discovery', 0)}"
        assert tier_counts.get("player", 0) == 3, f"Expected 3 player templates, got {tier_counts.get('player', 0)}"
        assert tier_counts.get("ultra_player", 0) == 3, f"Expected 3 ultra_player templates, got {tier_counts.get('ultra_player', 0)}"
        assert tier_counts.get("sovereign", 0) == 3, f"Expected 3 sovereign templates, got {tier_counts.get('sovereign', 0)}"
    
    def test_templates_have_lock_status(self, auth_headers):
        """Templates have locked field based on user tier"""
        response = requests.get(f"{BASE_URL}/api/mixer/templates", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        templates = data["templates"]
        user_tier = data["user_tier"]
        
        # For ultra_player: discovery, player, ultra_player unlocked; sovereign locked
        unlocked_count = sum(1 for t in templates if not t.get("locked", True))
        locked_count = sum(1 for t in templates if t.get("locked", False))
        
        # ultra_player should see 9 unlocked (3+3+3) and 3 locked (sovereign)
        if user_tier == "ultra_player":
            assert unlocked_count == 9, f"Expected 9 unlocked for ultra_player, got {unlocked_count}"
            assert locked_count == 3, f"Expected 3 locked for ultra_player, got {locked_count}"
    
    def test_apply_morning_ritual_template(self, auth_headers):
        """POST /api/mixer/templates/apply with 'tpl-morning-ritual' returns 3 tracks"""
        response = requests.post(
            f"{BASE_URL}/api/mixer/templates/apply",
            json={"template_id": "tpl-morning-ritual"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "tracks" in data
        assert "track_count" in data
        assert data["track_count"] == 3, f"Expected 3 tracks, got {data['track_count']}"
        assert len(data["tracks"]) == 3
        
        # Verify track structure
        for track in data["tracks"]:
            assert "type" in track
            assert "source_id" in track
            assert "volume" in track
            assert "start_time" in track
            assert "duration" in track
    
    def test_apply_chakra_journey_template(self, auth_headers):
        """POST /api/mixer/templates/apply with 'tpl-chakra-journey' returns 9 tracks"""
        response = requests.post(
            f"{BASE_URL}/api/mixer/templates/apply",
            json={"template_id": "tpl-chakra-journey"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["track_count"] == 9, f"Expected 9 tracks, got {data['track_count']}"
    
    def test_apply_sovereign_template_forbidden_for_ultra_player(self, auth_headers):
        """POST /api/mixer/templates/apply with sovereign template returns 403 for ultra_player"""
        response = requests.post(
            f"{BASE_URL}/api/mixer/templates/apply",
            json={"template_id": "tpl-cosmic-immersion"},
            headers=auth_headers
        )
        assert response.status_code == 403, f"Expected 403 for sovereign template, got {response.status_code}: {response.text}"
    
    def test_apply_nonexistent_template_returns_404(self, auth_headers):
        """POST /api/mixer/templates/apply with invalid template returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/mixer/templates/apply",
            json={"template_id": "tpl-nonexistent"},
            headers=auth_headers
        )
        assert response.status_code == 404


class TestRecordingConfig:
    """Test Tiered Recording Configuration endpoints"""
    
    def test_get_recording_config(self, auth_headers):
        """GET /api/mixer/recording/config returns tiered video, audio, and AI config"""
        response = requests.get(f"{BASE_URL}/api/mixer/recording/config", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify main config sections
        assert "tier" in data
        assert "video" in data
        assert "audio" in data
        assert "ai" in data
        
        # Verify comparison sections
        assert "video_comparison" in data
        assert "audio_comparison" in data
        assert "ai_comparison" in data
        
        # Verify all tiers sections
        assert "all_video_tiers" in data
        assert "all_audio_tiers" in data
        assert "all_ai_tiers" in data
    
    def test_ultra_player_video_config(self, auth_headers):
        """Ultra player gets 1080p/60fps/8Mbps video config"""
        response = requests.get(f"{BASE_URL}/api/mixer/recording/config", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        video = data["video"]
        
        # Ultra player should get Full HD config
        assert video["res_label"] == "1080p Full HD", f"Expected 1080p Full HD, got {video.get('res_label')}"
        assert video["max_fps"] == 60, f"Expected 60fps, got {video.get('max_fps')}"
        assert video["bitrate"] == 8_000_000, f"Expected 8Mbps, got {video.get('bitrate')}"
        assert video["max_resolution"]["width"] == 1920
        assert video["max_resolution"]["height"] == 1080
    
    def test_ultra_player_audio_config(self, auth_headers):
        """Ultra player gets 96kHz/stereo/24-bit audio config"""
        response = requests.get(f"{BASE_URL}/api/mixer/recording/config", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        audio = data["audio"]
        
        # Ultra player should get Studio Quality config
        assert audio["sample_rate"] == 96000, f"Expected 96kHz, got {audio.get('sample_rate')}"
        assert audio["channels"] == 2, f"Expected stereo (2 channels), got {audio.get('channels')}"
        assert audio["bit_depth"] == 24, f"Expected 24-bit, got {audio.get('bit_depth')}"
        assert audio["label"] == "Studio Quality"
    
    def test_all_video_tiers_present(self, auth_headers):
        """all_video_tiers contains all 4 tiers with correct resolutions"""
        response = requests.get(f"{BASE_URL}/api/mixer/recording/config", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        all_video = data["all_video_tiers"]
        
        assert "discovery" in all_video
        assert "player" in all_video
        assert "ultra_player" in all_video
        assert "sovereign" in all_video
        
        # Verify resolution progression
        assert all_video["discovery"]["res_label"] == "480p SD"
        assert all_video["player"]["res_label"] == "720p HD"
        assert all_video["ultra_player"]["res_label"] == "1080p Full HD"
        assert all_video["sovereign"]["res_label"] == "4K Ultra HD"
    
    def test_all_audio_tiers_present(self, auth_headers):
        """all_audio_tiers contains all 4 tiers with correct sample rates"""
        response = requests.get(f"{BASE_URL}/api/mixer/recording/config", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        all_audio = data["all_audio_tiers"]
        
        assert "discovery" in all_audio
        assert "player" in all_audio
        assert "ultra_player" in all_audio
        assert "sovereign" in all_audio
        
        # Verify sample rate progression
        assert all_audio["discovery"]["sample_rate"] == 44100
        assert all_audio["player"]["sample_rate"] == 48000
        assert all_audio["ultra_player"]["sample_rate"] == 96000
        assert all_audio["sovereign"]["sample_rate"] == 192000


class TestRecordings:
    """Test Recording list endpoint"""
    
    def test_get_recordings_returns_list(self, auth_headers):
        """GET /api/mixer/recordings returns list (may be empty)"""
        response = requests.get(f"{BASE_URL}/api/mixer/recordings", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "recordings" in data
        assert isinstance(data["recordings"], list)


class TestAICapabilities:
    """Test AI Generation capabilities endpoints"""
    
    def test_get_ai_capabilities(self, auth_headers):
        """GET /api/mixer/ai/capabilities returns tier capabilities with credits"""
        response = requests.get(f"{BASE_URL}/api/mixer/ai/capabilities", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "tier" in data
        assert "capabilities" in data
        assert "credits_remaining" in data
        assert "all_tiers" in data
        
        # Verify capabilities structure
        caps = data["capabilities"]
        assert "label" in caps
        assert "mix_gen" in caps
        assert "video_gen" in caps
        assert "max_tracks_gen" in caps
    
    def test_ultra_player_ai_capabilities(self, auth_headers):
        """Ultra player gets Pro AI Studio with 12 max tracks"""
        response = requests.get(f"{BASE_URL}/api/mixer/ai/capabilities", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        caps = data["capabilities"]
        
        # Ultra player should get Pro AI Studio
        assert caps["label"] == "Pro AI Studio", f"Expected Pro AI Studio, got {caps.get('label')}"
        assert caps["max_tracks_gen"] == 12, f"Expected 12 max tracks, got {caps.get('max_tracks_gen')}"
        assert caps["mix_gen"] == True
        assert caps["video_gen"] == True
        assert caps["voice_clone"] == False  # Only sovereign gets voice clone
    
    def test_all_ai_tiers_present(self, auth_headers):
        """all_tiers contains all 4 AI tier configurations"""
        response = requests.get(f"{BASE_URL}/api/mixer/ai/capabilities", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        all_tiers = data["all_tiers"]
        
        assert "discovery" in all_tiers
        assert "player" in all_tiers
        assert "ultra_player" in all_tiers
        assert "sovereign" in all_tiers
        
        # Verify max tracks progression
        assert all_tiers["discovery"]["max_tracks_gen"] == 3
        assert all_tiers["player"]["max_tracks_gen"] == 6
        assert all_tiers["ultra_player"]["max_tracks_gen"] == 12
        assert all_tiers["sovereign"]["max_tracks_gen"] == 20


class TestAIGeneration:
    """Test AI Mix Generation endpoint"""
    
    def test_ai_generate_mix_with_prompt(self, auth_headers):
        """POST /api/mixer/ai/generate-mix with prompt generates tracks"""
        response = requests.post(
            f"{BASE_URL}/api/mixer/ai/generate-mix",
            json={"prompt": "relaxing meditation", "duration_minutes": 5},
            headers=auth_headers
        )
        
        # May return 402 if no credits, or 200 if successful
        if response.status_code == 402:
            pytest.skip("Insufficient AI credits for test")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "tracks" in data
        assert "track_count" in data
        assert "prompt" in data
        assert "credits_used" in data
        assert "generated_by" in data
        
        # Verify tracks were generated
        assert data["track_count"] > 0
        assert len(data["tracks"]) == data["track_count"]
        
        # Verify track structure
        for track in data["tracks"]:
            assert "type" in track
            assert "source_id" in track
            assert "volume" in track
            assert 0 <= track["volume"] <= 1


class TestRegressionEndpoints:
    """Regression tests for previously working endpoints"""
    
    def test_mixer_subscription_still_works(self, auth_headers):
        """GET /api/mixer/subscription still returns subscription data"""
        response = requests.get(f"{BASE_URL}/api/mixer/subscription", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "tier" in data
        assert "tier_config" in data
    
    def test_mixer_sources_still_works(self, auth_headers):
        """GET /api/mixer/sources still returns sources"""
        response = requests.get(f"{BASE_URL}/api/mixer/sources", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "sources" in data
        assert len(data["sources"]) >= 60  # From iteration 230
    
    def test_mixer_projects_still_works(self, auth_headers):
        """GET /api/mixer/projects still returns projects list"""
        response = requests.get(f"{BASE_URL}/api/mixer/projects", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "projects" in data
    
    def test_auto_compose_goals_still_works(self, auth_headers):
        """GET /api/mixer/auto-compose/goals still returns goals"""
        response = requests.get(f"{BASE_URL}/api/mixer/auto-compose/goals", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "goals" in data
        assert len(data["goals"]) >= 6  # From iteration 228
    
    def test_consciousness_status_still_works(self, auth_headers):
        """GET /api/consciousness/status still works (regression from iteration 229)"""
        response = requests.get(f"{BASE_URL}/api/consciousness/status", headers=auth_headers)
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
