"""
Iteration 226 - Ripple Edit System Tests
Tests for Divine Director multi-track mixer ripple editing functionality:
- POST /api/mixer/projects/ripple - ripple edit shifts unlocked tracks
- POST /api/mixer/tracks/toggle-lock - toggle ripple lock on tracks
- POST /api/mixer/projects - saves tracks with ripple_locked field
- GET /api/mixer/projects/{id} - loads tracks with ripple_locked preserved
- GET /api/mixer/recommendations - hexagram recommendations with trigram info
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


class TestRippleEditSystem:
    """Tests for the Ripple Edit Engine in Divine Director"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.user_id = login_response.json().get("user", {}).get("id")
        else:
            pytest.skip(f"Authentication failed: {login_response.status_code}")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # TEST: Create project with ripple_locked field
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    def test_save_project_with_ripple_locked_tracks(self):
        """POST /api/mixer/projects saves tracks with ripple_locked field"""
        project_name = f"TEST_Ripple_Project_{uuid.uuid4().hex[:8]}"
        
        tracks = [
            {"type": "phonic_tone", "source_label": "Track A", "duration": 60, "start_time": 0, "ripple_locked": False},
            {"type": "phonic_tone", "source_label": "Track B", "duration": 60, "start_time": 60, "ripple_locked": False},
            {"type": "phonic_tone", "source_label": "Track C", "duration": 60, "start_time": 120, "ripple_locked": True},
            {"type": "phonic_tone", "source_label": "Track D", "duration": 60, "start_time": 180, "ripple_locked": False},
        ]
        
        response = self.session.post(f"{BASE_URL}/api/mixer/projects", json={
            "name": project_name,
            "tracks": tracks
        })
        
        assert response.status_code in [200, 201], f"Save failed: {response.text}"
        data = response.json()
        assert data.get("track_count") == 4
        
        # Store project_id for cleanup
        self.test_project_id = data.get("project_id")
        print(f"✓ Created project with ripple_locked tracks: {project_name}")
        return self.test_project_id
    
    def test_get_project_preserves_ripple_locked(self):
        """GET /api/mixer/projects/{id} returns tracks with ripple_locked preserved"""
        # First create a project
        project_name = f"TEST_Ripple_Get_{uuid.uuid4().hex[:8]}"
        
        tracks = [
            {"type": "phonic_tone", "source_label": "Track A", "duration": 60, "start_time": 0, "ripple_locked": False},
            {"type": "phonic_tone", "source_label": "Track B", "duration": 60, "start_time": 60, "ripple_locked": True},
        ]
        
        create_response = self.session.post(f"{BASE_URL}/api/mixer/projects", json={
            "name": project_name,
            "tracks": tracks
        })
        
        assert create_response.status_code in [200, 201]
        project_id = create_response.json().get("project_id")
        
        # Now fetch the project
        get_response = self.session.get(f"{BASE_URL}/api/mixer/projects/{project_id}")
        
        assert get_response.status_code == 200, f"Get failed: {get_response.text}"
        project = get_response.json()
        
        assert "tracks" in project
        assert len(project["tracks"]) == 2
        
        # Verify ripple_locked is preserved
        assert project["tracks"][0].get("ripple_locked") == False, "Track A should be unlocked"
        assert project["tracks"][1].get("ripple_locked") == True, "Track B should be locked"
        
        print(f"✓ GET project preserves ripple_locked field")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # TEST: Toggle ripple lock on tracks
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    def test_toggle_ripple_lock(self):
        """POST /api/mixer/tracks/toggle-lock toggles ripple_locked on a track"""
        # Create a project first
        project_name = f"TEST_Toggle_Lock_{uuid.uuid4().hex[:8]}"
        
        tracks = [
            {"type": "phonic_tone", "source_label": "Track A", "duration": 60, "start_time": 0, "ripple_locked": False},
            {"type": "phonic_tone", "source_label": "Track B", "duration": 60, "start_time": 60, "ripple_locked": False},
        ]
        
        create_response = self.session.post(f"{BASE_URL}/api/mixer/projects", json={
            "name": project_name,
            "tracks": tracks
        })
        
        assert create_response.status_code in [200, 201]
        project_id = create_response.json().get("project_id")
        
        # Toggle lock on track 1
        toggle_response = self.session.post(f"{BASE_URL}/api/mixer/tracks/toggle-lock", json={
            "project_id": project_id,
            "track_index": 1
        })
        
        assert toggle_response.status_code == 200, f"Toggle failed: {toggle_response.text}"
        toggle_data = toggle_response.json()
        
        assert toggle_data.get("track_index") == 1
        assert toggle_data.get("ripple_locked") == True, "Track should now be locked"
        
        # Toggle again to unlock
        toggle_response2 = self.session.post(f"{BASE_URL}/api/mixer/tracks/toggle-lock", json={
            "project_id": project_id,
            "track_index": 1
        })
        
        assert toggle_response2.status_code == 200
        assert toggle_response2.json().get("ripple_locked") == False, "Track should now be unlocked"
        
        print(f"✓ Toggle ripple lock works correctly")
    
    def test_toggle_lock_invalid_index(self):
        """POST /api/mixer/tracks/toggle-lock returns 400 for invalid track index"""
        # Create a project first
        project_name = f"TEST_Toggle_Invalid_{uuid.uuid4().hex[:8]}"
        
        tracks = [
            {"type": "phonic_tone", "source_label": "Track A", "duration": 60, "start_time": 0},
        ]
        
        create_response = self.session.post(f"{BASE_URL}/api/mixer/projects", json={
            "name": project_name,
            "tracks": tracks
        })
        
        project_id = create_response.json().get("project_id")
        
        # Try to toggle invalid index
        toggle_response = self.session.post(f"{BASE_URL}/api/mixer/tracks/toggle-lock", json={
            "project_id": project_id,
            "track_index": 99
        })
        
        assert toggle_response.status_code == 400, "Should return 400 for invalid index"
        print(f"✓ Toggle lock returns 400 for invalid track index")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # TEST: Ripple edit shifts unlocked tracks
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    def test_ripple_edit_shifts_unlocked_tracks(self):
        """POST /api/mixer/projects/ripple shifts unlocked subsequent tracks when duration changes"""
        # Create a project with 4 tracks: A, B (unlocked), C (locked), D (unlocked)
        project_name = f"TEST_Ripple_Shift_{uuid.uuid4().hex[:8]}"
        
        tracks = [
            {"type": "phonic_tone", "source_label": "Track A", "duration": 60, "start_time": 0, "ripple_locked": False},
            {"type": "phonic_tone", "source_label": "Track B", "duration": 60, "start_time": 60, "ripple_locked": False},
            {"type": "phonic_tone", "source_label": "Track C", "duration": 60, "start_time": 120, "ripple_locked": True},
            {"type": "phonic_tone", "source_label": "Track D", "duration": 60, "start_time": 180, "ripple_locked": False},
        ]
        
        create_response = self.session.post(f"{BASE_URL}/api/mixer/projects", json={
            "name": project_name,
            "tracks": tracks
        })
        
        assert create_response.status_code in [200, 201]
        project_id = create_response.json().get("project_id")
        
        # Ripple edit: Track A duration changes from 60 to 80 (delta = +20)
        ripple_response = self.session.post(f"{BASE_URL}/api/mixer/projects/ripple", json={
            "project_id": project_id,
            "changed_index": 0,
            "old_duration": 60,
            "new_duration": 80,
            "old_start": 0,
            "new_start": 0
        })
        
        assert ripple_response.status_code == 200, f"Ripple failed: {ripple_response.text}"
        ripple_data = ripple_response.json()
        
        # Verify response structure
        assert "tracks" in ripple_data
        assert "shifted_indices" in ripple_data
        assert "ripple_delta" in ripple_data
        
        # Verify ripple_delta
        assert ripple_data["ripple_delta"] == 20, "Delta should be +20"
        
        # Verify shifted indices (B and D should shift, C is locked)
        shifted = ripple_data["shifted_indices"]
        assert 1 in shifted, "Track B (index 1) should be shifted"
        assert 2 not in shifted, "Track C (index 2) is locked, should NOT be shifted"
        assert 3 in shifted, "Track D (index 3) should be shifted"
        
        # Verify track positions
        tracks_result = ripple_data["tracks"]
        
        # Track A: duration changed to 80
        assert tracks_result[0]["duration"] == 80, "Track A duration should be 80"
        assert tracks_result[0]["start_time"] == 0, "Track A start_time unchanged"
        
        # Track B: shifted by +20 (60 -> 80)
        assert tracks_result[1]["start_time"] == 80, f"Track B should shift to 80, got {tracks_result[1]['start_time']}"
        
        # Track C: LOCKED - should NOT shift (stays at 120)
        assert tracks_result[2]["start_time"] == 120, f"Track C is locked, should stay at 120, got {tracks_result[2]['start_time']}"
        
        # Track D: shifted by +20 (180 -> 200)
        assert tracks_result[3]["start_time"] == 200, f"Track D should shift to 200, got {tracks_result[3]['start_time']}"
        
        print(f"✓ Ripple edit correctly shifts unlocked tracks and preserves locked tracks")
    
    def test_ripple_edit_negative_delta_shifts_backward(self):
        """Ripple edit with negative delta (shorten) shifts tracks backward"""
        project_name = f"TEST_Ripple_Negative_{uuid.uuid4().hex[:8]}"
        
        tracks = [
            {"type": "phonic_tone", "source_label": "Track A", "duration": 60, "start_time": 0, "ripple_locked": False},
            {"type": "phonic_tone", "source_label": "Track B", "duration": 60, "start_time": 60, "ripple_locked": False},
            {"type": "phonic_tone", "source_label": "Track C", "duration": 60, "start_time": 120, "ripple_locked": False},
        ]
        
        create_response = self.session.post(f"{BASE_URL}/api/mixer/projects", json={
            "name": project_name,
            "tracks": tracks
        })
        
        project_id = create_response.json().get("project_id")
        
        # Shorten Track A from 60 to 40 (delta = -20)
        ripple_response = self.session.post(f"{BASE_URL}/api/mixer/projects/ripple", json={
            "project_id": project_id,
            "changed_index": 0,
            "old_duration": 60,
            "new_duration": 40,
            "old_start": 0,
            "new_start": 0
        })
        
        assert ripple_response.status_code == 200
        ripple_data = ripple_response.json()
        
        assert ripple_data["ripple_delta"] == -20, "Delta should be -20"
        
        tracks_result = ripple_data["tracks"]
        
        # Track A: duration changed to 40
        assert tracks_result[0]["duration"] == 40
        
        # Track B: shifted backward by 20 (60 -> 40)
        assert tracks_result[1]["start_time"] == 40, f"Track B should shift to 40, got {tracks_result[1]['start_time']}"
        
        # Track C: shifted backward by 20 (120 -> 100)
        assert tracks_result[2]["start_time"] == 100, f"Track C should shift to 100, got {tracks_result[2]['start_time']}"
        
        print(f"✓ Ripple edit with negative delta shifts tracks backward correctly")
    
    def test_ripple_edit_positive_delta_shifts_forward(self):
        """Ripple edit with positive delta (lengthen) shifts tracks forward"""
        project_name = f"TEST_Ripple_Positive_{uuid.uuid4().hex[:8]}"
        
        tracks = [
            {"type": "phonic_tone", "source_label": "Track A", "duration": 60, "start_time": 0, "ripple_locked": False},
            {"type": "phonic_tone", "source_label": "Track B", "duration": 60, "start_time": 60, "ripple_locked": False},
        ]
        
        create_response = self.session.post(f"{BASE_URL}/api/mixer/projects", json={
            "name": project_name,
            "tracks": tracks
        })
        
        project_id = create_response.json().get("project_id")
        
        # Lengthen Track A from 60 to 100 (delta = +40)
        ripple_response = self.session.post(f"{BASE_URL}/api/mixer/projects/ripple", json={
            "project_id": project_id,
            "changed_index": 0,
            "old_duration": 60,
            "new_duration": 100,
            "old_start": 0,
            "new_start": 0
        })
        
        assert ripple_response.status_code == 200
        ripple_data = ripple_response.json()
        
        assert ripple_data["ripple_delta"] == 40, "Delta should be +40"
        
        tracks_result = ripple_data["tracks"]
        
        # Track B: shifted forward by 40 (60 -> 100)
        assert tracks_result[1]["start_time"] == 100, f"Track B should shift to 100, got {tracks_result[1]['start_time']}"
        
        print(f"✓ Ripple edit with positive delta shifts tracks forward correctly")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # TEST: Keyframes clamped to new duration
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    def test_ripple_edit_clamps_keyframes_to_new_duration(self):
        """POST /api/mixer/projects/ripple clamps keyframes in changed track to new duration"""
        project_name = f"TEST_Ripple_Keyframes_{uuid.uuid4().hex[:8]}"
        
        # Track with keyframes at time 0, 30, 50, 80 (80 exceeds new duration of 60)
        tracks = [
            {
                "type": "phonic_tone",
                "source_label": "Track A",
                "duration": 100,
                "start_time": 0,
                "ripple_locked": False,
                "keyframes_volume": [
                    {"time": 0, "value": 0.5},
                    {"time": 30, "value": 0.8},
                    {"time": 50, "value": 0.6},
                    {"time": 80, "value": 0.9},
                ],
                "keyframes_frequency": [
                    {"time": 0, "value": 440},
                    {"time": 90, "value": 880},
                ]
            },
            {"type": "phonic_tone", "source_label": "Track B", "duration": 60, "start_time": 100, "ripple_locked": False},
        ]
        
        create_response = self.session.post(f"{BASE_URL}/api/mixer/projects", json={
            "name": project_name,
            "tracks": tracks
        })
        
        project_id = create_response.json().get("project_id")
        
        # Shorten Track A from 100 to 60 - keyframes at 80 and 90 should clamp to 60
        ripple_response = self.session.post(f"{BASE_URL}/api/mixer/projects/ripple", json={
            "project_id": project_id,
            "changed_index": 0,
            "old_duration": 100,
            "new_duration": 60,
            "old_start": 0,
            "new_start": 0
        })
        
        assert ripple_response.status_code == 200
        ripple_data = ripple_response.json()
        
        track_a = ripple_data["tracks"][0]
        
        # Verify keyframes_volume are clamped
        kf_vol = track_a.get("keyframes_volume", [])
        for kf in kf_vol:
            assert kf["time"] <= 60, f"Keyframe time {kf['time']} should be clamped to 60"
        
        # Verify keyframes_frequency are clamped
        kf_freq = track_a.get("keyframes_frequency", [])
        for kf in kf_freq:
            assert kf["time"] <= 60, f"Keyframe time {kf['time']} should be clamped to 60"
        
        print(f"✓ Ripple edit clamps keyframes to new duration")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # TEST: Hexagram recommendations still work
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    def test_recommendations_returns_hexagram_with_trigrams(self):
        """GET /api/mixer/recommendations returns hexagram info with trigram data"""
        response = self.session.get(f"{BASE_URL}/api/mixer/recommendations")
        
        assert response.status_code == 200, f"Recommendations failed: {response.text}"
        data = response.json()
        
        # Verify hexagram info
        assert "hexagram" in data
        hexagram = data["hexagram"]
        assert "number" in hexagram
        assert "lower_trigram" in hexagram
        assert "upper_trigram" in hexagram
        
        # Verify trigram structure
        lower = hexagram["lower_trigram"]
        assert "index" in lower
        assert "name" in lower
        assert "quality" in lower
        
        upper = hexagram["upper_trigram"]
        assert "index" in upper
        assert "name" in upper
        assert "quality" in upper
        
        # Verify other fields
        assert "is_stagnation" in data
        assert "avg_frequency" in data
        assert "recommendations" in data
        assert "solfeggio_resonance" in data
        
        print(f"✓ Recommendations returns hexagram #{hexagram['number']} with trigrams: {lower['name']}/{upper['name']}")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # TEST: Ripple edit with invalid project
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    def test_ripple_edit_invalid_project(self):
        """POST /api/mixer/projects/ripple returns 404 for invalid project"""
        response = self.session.post(f"{BASE_URL}/api/mixer/projects/ripple", json={
            "project_id": "invalid-project-id",
            "changed_index": 0,
            "old_duration": 60,
            "new_duration": 80,
            "old_start": 0,
            "new_start": 0
        })
        
        assert response.status_code == 404, "Should return 404 for invalid project"
        print(f"✓ Ripple edit returns 404 for invalid project")
    
    def test_ripple_edit_invalid_track_index(self):
        """POST /api/mixer/projects/ripple returns 400 for invalid track index"""
        # Create a project first
        project_name = f"TEST_Ripple_Invalid_Idx_{uuid.uuid4().hex[:8]}"
        
        tracks = [
            {"type": "phonic_tone", "source_label": "Track A", "duration": 60, "start_time": 0},
        ]
        
        create_response = self.session.post(f"{BASE_URL}/api/mixer/projects", json={
            "name": project_name,
            "tracks": tracks
        })
        
        project_id = create_response.json().get("project_id")
        
        # Try ripple with invalid index
        response = self.session.post(f"{BASE_URL}/api/mixer/projects/ripple", json={
            "project_id": project_id,
            "changed_index": 99,
            "old_duration": 60,
            "new_duration": 80,
            "old_start": 0,
            "new_start": 0
        })
        
        assert response.status_code == 400, "Should return 400 for invalid track index"
        print(f"✓ Ripple edit returns 400 for invalid track index")


class TestMixerSubscriptionAndSources:
    """Additional tests for mixer subscription and sources"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip(f"Authentication failed: {login_response.status_code}")
    
    def test_get_subscription_returns_tier_config(self):
        """GET /api/mixer/subscription returns tier configuration"""
        response = self.session.get(f"{BASE_URL}/api/mixer/subscription")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "tier" in data
        assert "tier_config" in data
        assert "ai_credits_remaining" in data
        assert "comparison" in data
        assert "all_tiers" in data
        
        # Verify all 4 tiers exist
        all_tiers = data["all_tiers"]
        assert "discovery" in all_tiers
        assert "player" in all_tiers
        assert "ultra_player" in all_tiers
        assert "sovereign" in all_tiers
        
        print(f"✓ Subscription returns tier: {data['tier']}")
    
    def test_get_sources_returns_track_sources(self):
        """GET /api/mixer/sources returns available track sources"""
        response = self.session.get(f"{BASE_URL}/api/mixer/sources")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "sources" in data
        assert "tier" in data
        assert len(data["sources"]) > 0
        
        # Verify source structure
        source = data["sources"][0]
        assert "id" in source
        assert "label" in source
        assert "type" in source
        assert "locked" in source
        
        print(f"✓ Sources returns {len(data['sources'])} sources for tier {data['tier']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
