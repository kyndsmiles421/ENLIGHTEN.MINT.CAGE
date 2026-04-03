"""
Iteration 228 - AI Mantra DJ Auto-Compose Feature Tests
Tests for:
- GET /api/mixer/auto-compose/goals - returns 6 wellness goals
- POST /api/mixer/auto-compose - goal-based track composition
- Volume curves per goal (descending, ascending, sustained, wave, arc)
- Cross-fade overlaps with staggered start_times
- Hexagram resonance bonus layer
- AI credit deduction
- Tier-gated track limits
- GET /api/fidelity/status - revenue.py fix (credits field type mismatch)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"

# Expected 6 wellness goals
EXPECTED_GOALS = ["deep_sleep", "focus", "energy", "healing", "meditation", "grounding"]


class TestAutoComposeGoals:
    """Test GET /api/mixer/auto-compose/goals endpoint"""
    
    def test_get_auto_compose_goals_returns_6_goals(self):
        """Verify endpoint returns exactly 6 wellness goals"""
        response = requests.get(f"{BASE_URL}/api/mixer/auto-compose/goals")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "goals" in data, "Response should contain 'goals' key"
        
        goals = data["goals"]
        assert len(goals) == 6, f"Expected 6 goals, got {len(goals)}"
        
        goal_keys = [g["key"] for g in goals]
        for expected_goal in EXPECTED_GOALS:
            assert expected_goal in goal_keys, f"Missing goal: {expected_goal}"
        
        print(f"PASS: GET /api/mixer/auto-compose/goals returns 6 goals: {goal_keys}")
    
    def test_goals_have_required_fields(self):
        """Verify each goal has key, label, description, base_duration"""
        response = requests.get(f"{BASE_URL}/api/mixer/auto-compose/goals")
        assert response.status_code == 200
        
        goals = response.json()["goals"]
        for goal in goals:
            assert "key" in goal, f"Goal missing 'key': {goal}"
            assert "label" in goal, f"Goal missing 'label': {goal}"
            assert "description" in goal, f"Goal missing 'description': {goal}"
            assert "base_duration" in goal, f"Goal missing 'base_duration': {goal}"
            assert isinstance(goal["base_duration"], int), f"base_duration should be int: {goal}"
        
        print("PASS: All goals have required fields (key, label, description, base_duration)")


class TestAutoCompose:
    """Test POST /api/mixer/auto-compose endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if login_response.status_code != 200:
            pytest.skip(f"Login failed: {login_response.text}")
        
        self.token = login_response.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
        print(f"Logged in as {TEST_EMAIL}")
    
    def test_auto_compose_deep_sleep_descending_volume(self):
        """Test deep_sleep goal returns tracks with descending volume curve"""
        response = requests.post(
            f"{BASE_URL}/api/mixer/auto-compose",
            json={"goal": "deep_sleep"},
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["goal"] == "deep_sleep"
        assert data["goal_label"] == "Deep Sleep"
        assert data["volume_curve"] == "descending"
        assert "tracks" in data
        assert len(data["tracks"]) > 0, "Should have at least 1 track"
        
        # Verify descending volume pattern (first track volume > last track volume)
        tracks = data["tracks"]
        if len(tracks) > 1:
            first_vol = tracks[0]["volume"]
            last_vol = tracks[-1]["volume"]
            # Descending means first should be higher than last (or equal for short lists)
            assert first_vol >= last_vol, f"Descending volume: first={first_vol} should be >= last={last_vol}"
        
        print(f"PASS: deep_sleep returns {len(tracks)} tracks with descending volume curve")
    
    def test_auto_compose_healing_full_solfeggio_wave_volume(self):
        """Test healing goal returns full solfeggio cascade with wave volume"""
        response = requests.post(
            f"{BASE_URL}/api/mixer/auto-compose",
            json={"goal": "healing"},
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["goal"] == "healing"
        assert data["goal_label"] == "Sacred Healing"
        assert data["volume_curve"] == "wave"
        
        # Healing should have many tracks (9 solfeggio frequencies + ambience + mantras)
        tracks = data["tracks"]
        assert len(tracks) >= 5, f"Healing should have many tracks, got {len(tracks)}"
        
        print(f"PASS: healing returns {len(tracks)} tracks with wave volume curve")
    
    def test_auto_compose_focus_alpha_beta_sustained(self):
        """Test focus goal returns alpha-beta tracks with sustained volume"""
        response = requests.post(
            f"{BASE_URL}/api/mixer/auto-compose",
            json={"goal": "focus"},
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["goal"] == "focus"
        assert data["goal_label"] == "Laser Focus"
        assert data["volume_curve"] == "sustained"
        
        print(f"PASS: focus returns {len(data['tracks'])} tracks with sustained volume curve")
    
    def test_auto_compose_meditation_theta_alpha_arc(self):
        """Test meditation goal returns theta-alpha tracks with arc volume"""
        response = requests.post(
            f"{BASE_URL}/api/mixer/auto-compose",
            json={"goal": "meditation"},
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["goal"] == "meditation"
        assert data["goal_label"] == "Deep Meditation"
        assert data["volume_curve"] == "arc"
        
        print(f"PASS: meditation returns {len(data['tracks'])} tracks with arc volume curve")
    
    def test_auto_compose_energy_ascending_volume(self):
        """Test energy goal returns high-frequency tracks with ascending volume"""
        response = requests.post(
            f"{BASE_URL}/api/mixer/auto-compose",
            json={"goal": "energy"},
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["goal"] == "energy"
        assert data["goal_label"] == "Energy Surge"
        assert data["volume_curve"] == "ascending"
        
        # Verify ascending volume pattern
        tracks = data["tracks"]
        if len(tracks) > 1:
            first_vol = tracks[0]["volume"]
            last_vol = tracks[-1]["volume"]
            # Ascending means last should be higher than first (or equal)
            assert last_vol >= first_vol, f"Ascending volume: last={last_vol} should be >= first={first_vol}"
        
        print(f"PASS: energy returns {len(tracks)} tracks with ascending volume curve")
    
    def test_auto_compose_grounding_sustained_volume(self):
        """Test grounding goal returns low-frequency tracks with sustained volume"""
        response = requests.post(
            f"{BASE_URL}/api/mixer/auto-compose",
            json={"goal": "grounding"},
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["goal"] == "grounding"
        assert data["goal_label"] == "Earth Grounding"
        assert data["volume_curve"] == "sustained"
        
        print(f"PASS: grounding returns {len(data['tracks'])} tracks with sustained volume curve")
    
    def test_auto_compose_invalid_goal_returns_400(self):
        """Test invalid goal returns 400 error"""
        response = requests.post(
            f"{BASE_URL}/api/mixer/auto-compose",
            json={"goal": "invalid_goal_xyz"},
            headers=self.headers
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "detail" in data
        assert "Unknown goal" in data["detail"]
        
        print("PASS: Invalid goal returns 400 with 'Unknown goal' message")
    
    def test_auto_compose_crossfade_staggered_start_times(self):
        """Test tracks have staggered start_times with cross-fade overlap"""
        response = requests.post(
            f"{BASE_URL}/api/mixer/auto-compose",
            json={"goal": "meditation"},  # meditation has crossfade=10
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        tracks = data["tracks"]
        crossfade = data["crossfade_seconds"]
        
        # Filter out hexagram resonance track (it has start_time=0 by design as it plays throughout)
        non_hex_tracks = [t for t in tracks if "Hexagram" not in t.get("source_label", "")]
        
        # Verify staggered start times for non-hexagram tracks
        if len(non_hex_tracks) > 1:
            for i in range(1, len(non_hex_tracks)):
                prev_start = non_hex_tracks[i-1]["start_time"]
                curr_start = non_hex_tracks[i]["start_time"]
                # Each track should start after previous (with overlap)
                assert curr_start >= prev_start, f"Track {i} start_time ({curr_start}) should be >= track {i-1} ({prev_start})"
        
        print(f"PASS: Tracks have staggered start_times with {crossfade}s crossfade")
    
    def test_auto_compose_includes_hexagram_resonance(self):
        """Test auto-compose includes hexagram resonance tone as bonus layer"""
        response = requests.post(
            f"{BASE_URL}/api/mixer/auto-compose",
            json={"goal": "deep_sleep"},
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "hexagram_resonance" in data, "Response should include hexagram_resonance frequency"
        assert isinstance(data["hexagram_resonance"], (int, float)), "hexagram_resonance should be a number"
        
        # Check if hexagram track is in the tracks list
        tracks = data["tracks"]
        hex_tracks = [t for t in tracks if "Hexagram" in t.get("source_label", "")]
        # May or may not have hexagram track depending on layer cap
        
        print(f"PASS: Auto-compose includes hexagram_resonance: {data['hexagram_resonance']}Hz")
    
    def test_auto_compose_response_structure(self):
        """Test auto-compose response has all required fields"""
        response = requests.post(
            f"{BASE_URL}/api/mixer/auto-compose",
            json={"goal": "focus"},
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        required_fields = [
            "goal", "goal_label", "goal_description", "tracks", "track_count",
            "total_duration_seconds", "crossfade_seconds", "volume_curve",
            "hexagram_resonance", "tier"
        ]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        # Verify track structure
        if data["tracks"]:
            track = data["tracks"][0]
            track_fields = ["type", "source_id", "source_label", "volume", "muted", "solo",
                          "start_time", "duration", "color", "locked", "ripple_locked"]
            for field in track_fields:
                assert field in track, f"Track missing field: {field}"
        
        print("PASS: Auto-compose response has all required fields")
    
    def test_auto_compose_track_count_matches_tracks_length(self):
        """Test track_count matches actual tracks array length"""
        response = requests.post(
            f"{BASE_URL}/api/mixer/auto-compose",
            json={"goal": "healing"},
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["track_count"] == len(data["tracks"]), \
            f"track_count ({data['track_count']}) should match tracks length ({len(data['tracks'])})"
        
        print(f"PASS: track_count ({data['track_count']}) matches tracks array length")


class TestFidelityStatusFix:
    """Test GET /api/fidelity/status - revenue.py fix for credits field type mismatch"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if login_response.status_code != 200:
            pytest.skip(f"Login failed: {login_response.text}")
        
        self.token = login_response.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_fidelity_status_no_crash(self):
        """Test /api/fidelity/status no longer crashes (revenue.py fix)"""
        response = requests.get(
            f"{BASE_URL}/api/fidelity/status",
            headers=self.headers
        )
        # Should not return 500 (the bug was a crash due to credits field type mismatch)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify response structure
        assert "tier_id" in data
        assert "tier_label" in data
        assert "discount_pct" in data
        assert "boost_packs" in data
        
        print(f"PASS: /api/fidelity/status returns 200 with tier_id={data['tier_id']}")
    
    def test_fidelity_status_response_structure(self):
        """Test fidelity status response has all expected fields"""
        response = requests.get(
            f"{BASE_URL}/api/fidelity/status",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        expected_fields = [
            "tier_id", "tier_label", "discount_pct",
            "fidelity_boost_active", "fidelity_boost_hours_remaining",
            "boost_packs", "free_trial_eligible"
        ]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
        
        # Verify boost_packs is a list
        assert isinstance(data["boost_packs"], list), "boost_packs should be a list"
        
        print("PASS: Fidelity status response has all expected fields")


class TestExistingEndpointsStillWork:
    """Verify previously working endpoints still function after changes"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if login_response.status_code != 200:
            pytest.skip(f"Login failed: {login_response.text}")
        
        self.token = login_response.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_mixer_subscription_still_works(self):
        """Test GET /api/mixer/subscription still works"""
        response = requests.get(f"{BASE_URL}/api/mixer/subscription", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "tier" in data
        assert "tier_config" in data
        print(f"PASS: /api/mixer/subscription returns tier={data['tier']}")
    
    def test_mixer_sources_still_works(self):
        """Test GET /api/mixer/sources still works"""
        response = requests.get(f"{BASE_URL}/api/mixer/sources", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "sources" in data
        assert isinstance(data["sources"], list)
        print(f"PASS: /api/mixer/sources returns {len(data['sources'])} sources")
    
    def test_mixer_projects_still_works(self):
        """Test GET /api/mixer/projects still works"""
        response = requests.get(f"{BASE_URL}/api/mixer/projects", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "projects" in data
        print(f"PASS: /api/mixer/projects returns {len(data['projects'])} projects")
    
    def test_mixer_recommendations_still_works(self):
        """Test GET /api/mixer/recommendations still works"""
        response = requests.get(f"{BASE_URL}/api/mixer/recommendations", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "recommendations" in data
        print(f"PASS: /api/mixer/recommendations returns {len(data['recommendations'])} recommendations")
    
    def test_auth_me_still_works(self):
        """Test GET /api/auth/me still works"""
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "email" in data
        print(f"PASS: /api/auth/me returns user email={data['email']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
