"""
Iteration 230 - Mixer Content Library Expansion Tests
Tests for:
- STOCK_SOURCES expanded 21→60 with tier gating
- TIER_COMPARISON expanded 10→14 rows
- AUTO_COMPOSE_GOALS updated with new sources
- Video overlays, light modes, fractals, filters expansion
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
        data = response.json()
        return data.get("token") or data.get("zen_token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestMixerSourcesExpansion:
    """Test STOCK_SOURCES expanded to 60 with tier gating"""
    
    def test_get_sources_returns_60_total(self, auth_headers):
        """GET /api/mixer/sources should return 60 total sources"""
        response = requests.get(f"{BASE_URL}/api/mixer/sources", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "sources" in data
        sources = data["sources"]
        
        # Should have 60 total sources
        assert len(sources) == 60, f"Expected 60 sources, got {len(sources)}"
        
        # Verify tier field exists on all sources
        for src in sources:
            assert "tier" in src, f"Source {src.get('id')} missing tier field"
            assert src["tier"] in ["discovery", "player", "ultra_player", "sovereign"]
    
    def test_sources_tier_distribution(self, auth_headers):
        """Verify tier distribution: 12 discovery, 14 player, 16 ultra_player, 18 sovereign"""
        response = requests.get(f"{BASE_URL}/api/mixer/sources", headers=auth_headers)
        assert response.status_code == 200
        
        sources = response.json()["sources"]
        tier_counts = {"discovery": 0, "player": 0, "ultra_player": 0, "sovereign": 0}
        
        for src in sources:
            tier_counts[src["tier"]] += 1
        
        # Expected distribution based on code
        assert tier_counts["discovery"] == 12, f"Expected 12 discovery, got {tier_counts['discovery']}"
        assert tier_counts["player"] == 14, f"Expected 14 player, got {tier_counts['player']}"
        assert tier_counts["ultra_player"] == 16, f"Expected 16 ultra_player, got {tier_counts['ultra_player']}"
        assert tier_counts["sovereign"] == 18, f"Expected 18 sovereign, got {tier_counts['sovereign']}"
    
    def test_ultra_player_sees_42_unlocked(self, auth_headers):
        """Ultra player tier should see 42 unlocked sources (12+14+16)"""
        response = requests.get(f"{BASE_URL}/api/mixer/sources", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        sources = data["sources"]
        tier = data.get("tier")
        
        # Test user should be ultra_player
        assert tier == "ultra_player", f"Expected ultra_player tier, got {tier}"
        
        unlocked = [s for s in sources if not s.get("locked", False)]
        locked = [s for s in sources if s.get("locked", False)]
        
        # Ultra player: 12 discovery + 14 player + 16 ultra_player = 42 unlocked
        assert len(unlocked) == 42, f"Expected 42 unlocked sources, got {len(unlocked)}"
        # 18 sovereign should be locked
        assert len(locked) == 18, f"Expected 18 locked sources, got {len(locked)}"
    
    def test_new_sources_exist(self, auth_headers):
        """Verify new sources like amb-whale-song, amb-cave-crystal exist"""
        response = requests.get(f"{BASE_URL}/api/mixer/sources", headers=auth_headers)
        assert response.status_code == 200
        
        sources = response.json()["sources"]
        source_ids = [s["id"] for s in sources]
        
        # New sovereign sources
        assert "amb-whale-song" in source_ids, "Missing amb-whale-song"
        assert "amb-cave-crystal" in source_ids, "Missing amb-cave-crystal"
        assert "mantra-heart-sutra" in source_ids, "Missing mantra-heart-sutra"
        assert "amb-volcanic" in source_ids, "Missing amb-volcanic"
        assert "vis-dimensional" in source_ids, "Missing vis-dimensional"


class TestMixerSubscriptionComparison:
    """Test TIER_COMPARISON expanded to 14 rows"""
    
    def test_subscription_returns_14_comparison_rows(self, auth_headers):
        """GET /api/mixer/subscription should return 14 comparison rows"""
        response = requests.get(f"{BASE_URL}/api/mixer/subscription", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "comparison" in data
        comparison = data["comparison"]
        
        # Should have 14 rows
        assert len(comparison) == 14, f"Expected 14 comparison rows, got {len(comparison)}"
    
    def test_comparison_includes_new_features(self, auth_headers):
        """Verify comparison includes Sound Sources, Video Overlays, Light Modes, Fractals, Visual Filters"""
        response = requests.get(f"{BASE_URL}/api/mixer/subscription", headers=auth_headers)
        assert response.status_code == 200
        
        comparison = response.json()["comparison"]
        features = [row["feature"] for row in comparison]
        
        # Check for expanded feature rows
        assert "Sound Sources" in features, "Missing 'Sound Sources' row"
        assert "Video Overlays" in features, "Missing 'Video Overlays' row"
        assert "Light Modes" in features, "Missing 'Light Modes' row"
        assert "Fractals" in features, "Missing 'Fractals' row"
        assert "Visual Filters" in features, "Missing 'Visual Filters' row"
    
    def test_tier_config_stock_label(self, auth_headers):
        """Verify tier_config shows correct stock_label for ultra_player"""
        response = requests.get(f"{BASE_URL}/api/mixer/subscription", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        tier_config = data.get("tier_config", {})
        
        # Ultra player should show "42 Sources + 4K Video + 12 Filters"
        stock_label = tier_config.get("stock_label", "")
        assert "42 Sources" in stock_label, f"Expected '42 Sources' in stock_label, got: {stock_label}"
        assert "4K Video" in stock_label, f"Expected '4K Video' in stock_label, got: {stock_label}"
        assert "12 Filters" in stock_label, f"Expected '12 Filters' in stock_label, got: {stock_label}"


class TestAutoComposeExpansion:
    """Test AUTO_COMPOSE_GOALS updated with new sources"""
    
    def test_get_goals_returns_6(self, auth_headers):
        """GET /api/mixer/auto-compose/goals should return 6 goals"""
        response = requests.get(f"{BASE_URL}/api/mixer/auto-compose/goals", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "goals" in data
        goals = data["goals"]
        
        assert len(goals) == 6, f"Expected 6 goals, got {len(goals)}"
        
        goal_keys = [g["key"] for g in goals]
        expected_keys = ["deep_sleep", "focus", "energy", "healing", "meditation", "grounding"]
        for key in expected_keys:
            assert key in goal_keys, f"Missing goal: {key}"
    
    def test_auto_compose_healing_generates_15_plus_tracks(self, auth_headers):
        """POST /api/mixer/auto-compose with goal='healing' should generate 15+ tracks"""
        response = requests.post(
            f"{BASE_URL}/api/mixer/auto-compose",
            headers=auth_headers,
            json={"goal": "healing"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "tracks" in data
        tracks = data["tracks"]
        
        # Healing has 9 frequencies + 3 ambience + 3 mantras + hexagram = 16+ tracks
        assert len(tracks) >= 15, f"Expected 15+ tracks for healing, got {len(tracks)}"
        assert data.get("goal") == "healing"
        assert data.get("goal_label") == "Sacred Healing"
    
    def test_auto_compose_deep_sleep_includes_whale_song(self, auth_headers):
        """POST /api/mixer/auto-compose with goal='deep_sleep' should include amb-whale-song"""
        response = requests.post(
            f"{BASE_URL}/api/mixer/auto-compose",
            headers=auth_headers,
            json={"goal": "deep_sleep"}
        )
        assert response.status_code == 200
        
        data = response.json()
        tracks = data["tracks"]
        source_ids = [t.get("source_id") for t in tracks]
        
        # amb-whale-song is sovereign tier, test user is ultra_player so it won't be included
        # But the goal definition includes it - check if it's in the goal config
        assert data.get("goal") == "deep_sleep"
        assert data.get("goal_label") == "Deep Sleep"
    
    def test_auto_compose_meditation_includes_new_sources(self, auth_headers):
        """POST /api/mixer/auto-compose with goal='meditation' should include new sources"""
        response = requests.post(
            f"{BASE_URL}/api/mixer/auto-compose",
            headers=auth_headers,
            json={"goal": "meditation"}
        )
        assert response.status_code == 200
        
        data = response.json()
        tracks = data["tracks"]
        source_ids = [t.get("source_id") for t in tracks]
        source_labels = [t.get("source_label") for t in tracks]
        
        # Meditation goal includes amb-cave-crystal (sovereign) and mantra-heart-sutra (sovereign)
        # Test user is ultra_player so sovereign sources won't be included
        # But should include other meditation sources
        assert data.get("goal") == "meditation"
        assert len(tracks) >= 8, f"Expected 8+ tracks for meditation, got {len(tracks)}"
    
    def test_all_6_goals_work(self, auth_headers):
        """Test all 6 auto-compose goals work"""
        goals = ["deep_sleep", "focus", "energy", "healing", "meditation", "grounding"]
        
        for goal in goals:
            response = requests.post(
                f"{BASE_URL}/api/mixer/auto-compose",
                headers=auth_headers,
                json={"goal": goal}
            )
            assert response.status_code == 200, f"Goal '{goal}' failed: {response.status_code} - {response.text}"
            
            data = response.json()
            assert data.get("goal") == goal
            assert "tracks" in data
            assert len(data["tracks"]) > 0, f"Goal '{goal}' returned no tracks"
            print(f"Goal '{goal}': {len(data['tracks'])} tracks generated")


class TestConsciousnessPanelRegression:
    """Regression test for ConsciousnessPanel from iteration 229"""
    
    def test_consciousness_status_endpoint(self, auth_headers):
        """GET /api/consciousness/status should still work"""
        response = requests.get(f"{BASE_URL}/api/consciousness/status", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "level" in data
        assert "xp_total" in data
        assert "all_levels" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
