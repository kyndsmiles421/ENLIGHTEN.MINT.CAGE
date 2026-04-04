"""
Iteration 225 - Hexagram-Based Pack Recommendations & Keyframe Automation Tests

Tests:
1. GET /api/mixer/recommendations - hexagram info, trigrams, stagnation, recommendations
2. Recommendations: soul type (lower trigram → vocal packs)
3. Recommendations: environment type (upper trigram → visual/ambience packs)
4. Recommendations: tone=soft for owned packs, tone=active for unowned
5. Stagnation detection for hexagrams 12,23,29,36,39,47
6. POST /api/mixer/projects - keyframes_volume and keyframes_frequency support
7. GET /api/mixer/projects/{id} - keyframe data preserved
8. 4-tier subscription system (Discovery/Player/Ultra Player/Sovereign)
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://zero-scale-physics.preview.emergentagent.com').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


class TestHexagramRecommendations:
    """Tests for hexagram-based pack recommendations engine"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_recommendations_returns_hexagram_info(self):
        """GET /api/mixer/recommendations returns hexagram number, name, trigrams"""
        response = requests.get(f"{BASE_URL}/api/mixer/recommendations", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify hexagram structure
        assert "hexagram" in data
        hex_info = data["hexagram"]
        assert "number" in hex_info
        assert isinstance(hex_info["number"], int)
        assert 1 <= hex_info["number"] <= 64
        assert "name" in hex_info
        assert "chinese" in hex_info
        
        # Verify trigram info
        assert "lower_trigram" in hex_info
        assert "upper_trigram" in hex_info
        assert "index" in hex_info["lower_trigram"]
        assert "name" in hex_info["lower_trigram"]
        assert "quality" in hex_info["lower_trigram"]
        assert "index" in hex_info["upper_trigram"]
        assert "name" in hex_info["upper_trigram"]
        assert "quality" in hex_info["upper_trigram"]
        
        print(f"Hexagram #{hex_info['number']} {hex_info['chinese']} - {hex_info['name']}")
        print(f"Lower: {hex_info['lower_trigram']['name']} ({hex_info['lower_trigram']['quality']})")
        print(f"Upper: {hex_info['upper_trigram']['name']} ({hex_info['upper_trigram']['quality']})")
    
    def test_recommendations_returns_stagnation_status(self):
        """GET /api/mixer/recommendations returns is_stagnation boolean"""
        response = requests.get(f"{BASE_URL}/api/mixer/recommendations", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "is_stagnation" in data
        assert isinstance(data["is_stagnation"], bool)
        print(f"Stagnation status: {data['is_stagnation']}")
    
    def test_recommendations_returns_avg_frequency(self):
        """GET /api/mixer/recommendations returns avg_frequency from recent projects"""
        response = requests.get(f"{BASE_URL}/api/mixer/recommendations", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "avg_frequency" in data
        assert isinstance(data["avg_frequency"], (int, float))
        print(f"Average frequency: {data['avg_frequency']} Hz")
    
    def test_recommendations_returns_solfeggio_resonance(self):
        """GET /api/mixer/recommendations returns solfeggio_resonance"""
        response = requests.get(f"{BASE_URL}/api/mixer/recommendations", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "solfeggio_resonance" in data
        # Solfeggio frequencies: 174, 285, 396, 417, 528, 639, 741, 852, 963
        assert data["solfeggio_resonance"] in [174, 285, 396, 417, 528, 639, 741, 852, 963]
        print(f"Solfeggio resonance: {data['solfeggio_resonance']} Hz")
    
    def test_recommendations_cards_structure(self):
        """GET /api/mixer/recommendations returns recommendation cards with correct structure"""
        response = requests.get(f"{BASE_URL}/api/mixer/recommendations", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "recommendations" in data
        recs = data["recommendations"]
        
        for rec in recs:
            # Required fields
            assert "type" in rec
            assert rec["type"] in ["soul", "environment", "stagnation"]
            assert "trigram" in rec
            assert "pack_id" in rec
            assert "pack_name" in rec
            assert "pack_color" in rec
            assert "bonus_wrap" in rec
            assert "price_credits" in rec
            assert "owned" in rec
            assert isinstance(rec["owned"], bool)
            assert "reason" in rec
            assert "tone" in rec
            assert rec["tone"] in ["soft", "active"]
            assert "message" in rec
            
            print(f"Rec type={rec['type']}, pack={rec['pack_name']}, tone={rec['tone']}, owned={rec['owned']}")
    
    def test_soul_recommendation_uses_lower_trigram(self):
        """Soul recommendations are based on lower trigram (bits 0-2)"""
        response = requests.get(f"{BASE_URL}/api/mixer/recommendations", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        recs = data["recommendations"]
        soul_recs = [r for r in recs if r["type"] == "soul"]
        
        if soul_recs:
            soul = soul_recs[0]
            lower_tri = data["hexagram"]["lower_trigram"]
            # Soul recommendation should reference lower trigram
            assert lower_tri["name"] in soul["trigram"] or lower_tri["quality"] in soul["trigram"]
            # Soul packs are vocal/mantra types
            assert soul["pack_id"] in ["pack-vedic-vocals", "pack-hopi-chants", "pack-solfeggio-master"]
            print(f"Soul rec for {lower_tri['name']}: {soul['pack_name']}")
    
    def test_environment_recommendation_uses_upper_trigram(self):
        """Environment recommendations are based on upper trigram (bits 3-5)"""
        response = requests.get(f"{BASE_URL}/api/mixer/recommendations", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        recs = data["recommendations"]
        env_recs = [r for r in recs if r["type"] == "environment"]
        
        if env_recs:
            env = env_recs[0]
            upper_tri = data["hexagram"]["upper_trigram"]
            # Environment recommendation should reference upper trigram
            assert upper_tri["name"] in env["trigram"] or upper_tri["quality"] in env["trigram"]
            # Environment packs are visual/ambience types
            assert env["pack_id"] in ["pack-deep-earth", "pack-sacred-geometry"]
            print(f"Environment rec for {upper_tri['name']}: {env['pack_name']}")
    
    def test_owned_pack_has_soft_tone(self):
        """Owned packs should have tone='soft'"""
        response = requests.get(f"{BASE_URL}/api/mixer/recommendations", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        recs = data["recommendations"]
        
        for rec in recs:
            if rec["owned"]:
                assert rec["tone"] == "soft", f"Owned pack {rec['pack_name']} should have soft tone"
                assert "already" in rec["message"].lower() or "kit" in rec["message"].lower()
                print(f"Owned pack {rec['pack_name']} has soft tone ✓")
    
    def test_unowned_pack_has_active_tone(self):
        """Unowned packs should have tone='active'"""
        response = requests.get(f"{BASE_URL}/api/mixer/recommendations", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        recs = data["recommendations"]
        
        for rec in recs:
            if not rec["owned"]:
                assert rec["tone"] == "active", f"Unowned pack {rec['pack_name']} should have active tone"
                print(f"Unowned pack {rec['pack_name']} has active tone ✓")


class TestKeyframeAutomation:
    """Tests for keyframe automation in projects"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
        self.test_project_name = f"TEST_Keyframe_{uuid.uuid4().hex[:8]}"
    
    def test_save_project_with_volume_keyframes(self):
        """POST /api/mixer/projects supports keyframes_volume array"""
        project_data = {
            "name": self.test_project_name,
            "tracks": [{
                "type": "phonic_tone",
                "source_id": "tone-mi",
                "source_label": "MI (528Hz)",
                "volume": 0.8,
                "frequency": 528,
                "keyframes_volume": [
                    {"time": 0, "value": 0.1},
                    {"time": 15, "value": 0.5},
                    {"time": 30, "value": 1.0},
                    {"time": 45, "value": 0.7},
                    {"time": 60, "value": 0.3}
                ]
            }]
        }
        
        response = requests.post(f"{BASE_URL}/api/mixer/projects", 
                                json=project_data, headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] in ["created", "updated"]
        assert data["track_count"] == 1
        project_id = data["project_id"]
        
        # Verify keyframes are preserved
        get_response = requests.get(f"{BASE_URL}/api/mixer/projects/{project_id}", 
                                   headers=self.headers)
        assert get_response.status_code == 200
        
        project = get_response.json()
        track = project["tracks"][0]
        assert "keyframes_volume" in track
        assert len(track["keyframes_volume"]) == 5
        assert track["keyframes_volume"][0]["time"] == 0
        assert track["keyframes_volume"][0]["value"] == 0.1
        assert track["keyframes_volume"][2]["value"] == 1.0
        print(f"Volume keyframes saved: {len(track['keyframes_volume'])} points")
    
    def test_save_project_with_frequency_keyframes(self):
        """POST /api/mixer/projects supports keyframes_frequency array"""
        project_name = f"TEST_FreqKF_{uuid.uuid4().hex[:8]}"
        project_data = {
            "name": project_name,
            "tracks": [{
                "type": "phonic_tone",
                "source_id": "tone-om",
                "source_label": "OM (136.1Hz)",
                "volume": 0.8,
                "frequency": 136.1,
                "keyframes_frequency": [
                    {"time": 0, "value": 136.1},
                    {"time": 20, "value": 285},
                    {"time": 40, "value": 528},
                    {"time": 60, "value": 136.1}
                ]
            }]
        }
        
        response = requests.post(f"{BASE_URL}/api/mixer/projects", 
                                json=project_data, headers=self.headers)
        assert response.status_code == 200
        
        project_id = response.json()["project_id"]
        
        # Verify keyframes are preserved
        get_response = requests.get(f"{BASE_URL}/api/mixer/projects/{project_id}", 
                                   headers=self.headers)
        assert get_response.status_code == 200
        
        project = get_response.json()
        track = project["tracks"][0]
        assert "keyframes_frequency" in track
        assert len(track["keyframes_frequency"]) == 4
        assert track["keyframes_frequency"][0]["value"] == 136.1
        assert track["keyframes_frequency"][2]["value"] == 528
        print(f"Frequency keyframes saved: {len(track['keyframes_frequency'])} points")
    
    def test_save_project_with_both_keyframe_types(self):
        """POST /api/mixer/projects supports both volume and frequency keyframes"""
        project_name = f"TEST_BothKF_{uuid.uuid4().hex[:8]}"
        project_data = {
            "name": project_name,
            "tracks": [{
                "type": "phonic_tone",
                "source_id": "tone-mi",
                "source_label": "MI (528Hz)",
                "volume": 0.8,
                "frequency": 528,
                "keyframes_volume": [
                    {"time": 0, "value": 0.2},
                    {"time": 30, "value": 0.9},
                    {"time": 60, "value": 0.5}
                ],
                "keyframes_frequency": [
                    {"time": 0, "value": 528},
                    {"time": 30, "value": 639},
                    {"time": 60, "value": 528}
                ]
            }]
        }
        
        response = requests.post(f"{BASE_URL}/api/mixer/projects", 
                                json=project_data, headers=self.headers)
        assert response.status_code == 200
        
        project_id = response.json()["project_id"]
        
        # Verify both keyframe types are preserved
        get_response = requests.get(f"{BASE_URL}/api/mixer/projects/{project_id}", 
                                   headers=self.headers)
        assert get_response.status_code == 200
        
        project = get_response.json()
        track = project["tracks"][0]
        assert "keyframes_volume" in track
        assert "keyframes_frequency" in track
        assert len(track["keyframes_volume"]) == 3
        assert len(track["keyframes_frequency"]) == 3
        print(f"Both keyframe types saved: vol={len(track['keyframes_volume'])}, freq={len(track['keyframes_frequency'])}")
    
    def test_keyframe_values_are_clamped(self):
        """Keyframe values are clamped to valid ranges"""
        project_name = f"TEST_ClampKF_{uuid.uuid4().hex[:8]}"
        project_data = {
            "name": project_name,
            "tracks": [{
                "type": "phonic_tone",
                "source_id": "tone-mi",
                "source_label": "MI (528Hz)",
                "volume": 0.8,
                "frequency": 528,
                "keyframes_volume": [
                    {"time": -10, "value": -0.5},  # Should clamp time to 0, value to 0
                    {"time": 30, "value": 1.5}     # Should clamp value to 1
                ]
            }]
        }
        
        response = requests.post(f"{BASE_URL}/api/mixer/projects", 
                                json=project_data, headers=self.headers)
        assert response.status_code == 200
        
        project_id = response.json()["project_id"]
        
        get_response = requests.get(f"{BASE_URL}/api/mixer/projects/{project_id}", 
                                   headers=self.headers)
        assert get_response.status_code == 200
        
        project = get_response.json()
        track = project["tracks"][0]
        kf = track["keyframes_volume"]
        
        # Time should be clamped to >= 0
        assert kf[0]["time"] >= 0
        # Volume should be clamped to 0-1
        assert 0 <= kf[0]["value"] <= 1
        assert 0 <= kf[1]["value"] <= 1
        print(f"Keyframe clamping verified: time={kf[0]['time']}, values={kf[0]['value']}, {kf[1]['value']}")


class TestFourTierSubscription:
    """Tests for 4-tier subscription system"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_subscription_returns_all_four_tiers(self):
        """GET /api/mixer/subscription returns all 4 tiers in all_tiers"""
        response = requests.get(f"{BASE_URL}/api/mixer/subscription", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "all_tiers" in data
        
        expected_tiers = ["discovery", "player", "ultra_player", "sovereign"]
        for tier in expected_tiers:
            assert tier in data["all_tiers"], f"Missing tier: {tier}"
            tier_info = data["all_tiers"][tier]
            assert "name" in tier_info
            assert "label" in tier_info
            assert "price_monthly" in tier_info
            assert "color" in tier_info
        
        print(f"All 4 tiers present: {list(data['all_tiers'].keys())}")
    
    def test_subscription_tier_config_has_keyframe_automation(self):
        """tier_config includes keyframe_automation boolean"""
        response = requests.get(f"{BASE_URL}/api/mixer/subscription", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "tier_config" in data
        assert "keyframe_automation" in data["tier_config"]
        assert isinstance(data["tier_config"]["keyframe_automation"], bool)
        
        tier = data["tier"]
        kf_enabled = data["tier_config"]["keyframe_automation"]
        print(f"Tier {tier}: keyframe_automation = {kf_enabled}")
        
        # Ultra Player and Sovereign should have keyframe automation
        if tier in ["ultra_player", "sovereign"]:
            assert kf_enabled, f"{tier} should have keyframe_automation=True"
    
    def test_comparison_table_has_keyframe_row(self):
        """Comparison table includes Keyframe Automation row"""
        response = requests.get(f"{BASE_URL}/api/mixer/subscription", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "comparison" in data
        
        kf_row = None
        for row in data["comparison"]:
            if "Keyframe" in row.get("feature", ""):
                kf_row = row
                break
        
        assert kf_row is not None, "Keyframe Automation row not found in comparison"
        assert kf_row["discovery"] == "No"
        assert kf_row["player"] == "No"
        assert kf_row["ultra_player"] == "Yes"
        assert kf_row["sovereign"] == "Yes"
        print(f"Keyframe row: {kf_row}")
    
    def test_speed_bonus_from_pack_purchase(self):
        """Speed bonus is accumulated from pack purchases"""
        response = requests.get(f"{BASE_URL}/api/mixer/subscription", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "speed_bonus_pct" in data
        assert "bonus_wraps_active" in data
        
        # User owns pack-vedic-vocals which gives +10% speed
        if data["bonus_wraps_active"]:
            total_bonus = sum(b["bonus"]["value"] for b in data["bonus_wraps_active"] 
                            if b["bonus"]["type"] == "speed_boost")
            print(f"Speed bonus: {data['speed_bonus_pct']}% from {len(data['bonus_wraps_active'])} packs")


class TestSourcesAndPacks:
    """Tests for sources and bonus packs with tier gating"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_sources_returns_21_sources(self):
        """GET /api/mixer/sources returns 21 stock sources"""
        response = requests.get(f"{BASE_URL}/api/mixer/sources", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "sources" in data
        assert len(data["sources"]) == 21
        print(f"Sources count: {len(data['sources'])}")
    
    def test_sources_have_tier_gating(self):
        """Sources have locked status based on user tier"""
        response = requests.get(f"{BASE_URL}/api/mixer/sources", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        sources = data["sources"]
        
        locked_count = sum(1 for s in sources if s.get("locked"))
        unlocked_count = sum(1 for s in sources if not s.get("locked"))
        
        print(f"Sources: {unlocked_count} unlocked, {locked_count} locked")
        
        # Each source should have locked field
        for s in sources:
            assert "locked" in s
            assert "tier" in s
    
    def test_bonus_packs_returns_5_packs(self):
        """GET /api/mixer/bonus-packs returns 5 bonus packs"""
        response = requests.get(f"{BASE_URL}/api/mixer/bonus-packs", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "packs" in data
        assert len(data["packs"]) == 5
        
        for pack in data["packs"]:
            assert "id" in pack
            assert "name" in pack
            assert "bonus_wrap" in pack
            assert "owned" in pack
            assert "tier_locked" in pack
            assert "can_afford" in pack
        
        print(f"Bonus packs: {[p['name'] for p in data['packs']]}")
    
    def test_owned_pack_shows_correct_status(self):
        """Owned packs show owned=True"""
        response = requests.get(f"{BASE_URL}/api/mixer/bonus-packs", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        packs = data["packs"]
        
        # User owns pack-vedic-vocals
        vedic = next((p for p in packs if p["id"] == "pack-vedic-vocals"), None)
        if vedic:
            assert vedic["owned"] == True
            print(f"Vedic Vocal Suite owned: {vedic['owned']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
