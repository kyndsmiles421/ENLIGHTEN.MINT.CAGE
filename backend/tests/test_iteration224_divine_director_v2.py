"""
Iteration 224 - Divine Director V2 Testing
4-Tier Subscription System: Discovery → Player → Ultra Player → Sovereign
Bonus Wrapped Packs with permanent functional bonuses
21 tier-gated track sources
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from context
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


class TestMixerSubscription4Tiers:
    """Test 4-tier mixer subscription system"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login
        login_resp = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if login_resp.status_code == 200:
            token = login_resp.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip(f"Login failed: {login_resp.status_code}")
    
    def test_subscription_returns_4_tiers(self):
        """GET /api/mixer/subscription returns all 4 tiers in all_tiers"""
        resp = self.session.get(f"{BASE_URL}/api/mixer/subscription")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        
        data = resp.json()
        assert "all_tiers" in data, "Missing all_tiers field"
        
        all_tiers = data["all_tiers"]
        expected_tiers = ["discovery", "player", "ultra_player", "sovereign"]
        for tier in expected_tiers:
            assert tier in all_tiers, f"Missing tier: {tier}"
            assert "name" in all_tiers[tier], f"Missing name for {tier}"
            assert "price_monthly" in all_tiers[tier], f"Missing price_monthly for {tier}"
            assert "color" in all_tiers[tier], f"Missing color for {tier}"
        
        print(f"All 4 tiers present: {list(all_tiers.keys())}")
    
    def test_subscription_returns_10_comparison_rows(self):
        """GET /api/mixer/subscription returns 10 comparison rows"""
        resp = self.session.get(f"{BASE_URL}/api/mixer/subscription")
        assert resp.status_code == 200
        
        data = resp.json()
        assert "comparison" in data, "Missing comparison field"
        
        comparison = data["comparison"]
        assert len(comparison) == 10, f"Expected 10 comparison rows, got {len(comparison)}"
        
        # Verify each row has all 4 tier columns
        for row in comparison:
            assert "feature" in row, "Missing feature field"
            assert "discovery" in row, "Missing discovery column"
            assert "player" in row, "Missing player column"
            assert "ultra_player" in row, "Missing ultra_player column"
            assert "sovereign" in row, "Missing sovereign column"
        
        print(f"10 comparison rows verified with features: {[r['feature'] for r in comparison]}")
    
    def test_subscription_returns_tier_config(self):
        """GET /api/mixer/subscription returns tier_config with all fields"""
        resp = self.session.get(f"{BASE_URL}/api/mixer/subscription")
        assert resp.status_code == 200
        
        data = resp.json()
        assert "tier" in data, "Missing tier field"
        assert "tier_config" in data, "Missing tier_config field"
        assert "ai_credits_remaining" in data, "Missing ai_credits_remaining"
        assert "speed_bonus_pct" in data, "Missing speed_bonus_pct"
        assert "bonus_wraps_active" in data, "Missing bonus_wraps_active"
        
        tier_config = data["tier_config"]
        required_fields = ["name", "label", "price_monthly", "layer_cap", "ai_credits_monthly", 
                          "materialization_delay", "shadow_tracks", "bonus_multiplier", "color"]
        for field in required_fields:
            assert field in tier_config, f"Missing tier_config field: {field}"
        
        print(f"Current tier: {data['tier']}, layer_cap: {tier_config['layer_cap']}, speed_bonus: {data['speed_bonus_pct']}%")


class TestMixerUpgrade4Tiers:
    """Test sequential tier upgrades through 4 tiers"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        login_resp = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if login_resp.status_code == 200:
            token = login_resp.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip(f"Login failed: {login_resp.status_code}")
    
    def test_upgrade_to_higher_tier_succeeds(self):
        """POST /api/mixer/subscription/upgrade to higher tier succeeds"""
        # Get current tier
        sub_resp = self.session.get(f"{BASE_URL}/api/mixer/subscription")
        assert sub_resp.status_code == 200
        current_tier = sub_resp.json()["tier"]
        
        # Determine next tier
        tier_order = ["discovery", "player", "ultra_player", "sovereign"]
        current_idx = tier_order.index(current_tier) if current_tier in tier_order else 0
        
        if current_idx >= len(tier_order) - 1:
            pytest.skip("Already at highest tier (sovereign)")
        
        next_tier = tier_order[current_idx + 1]
        
        # Upgrade
        resp = self.session.post(f"{BASE_URL}/api/mixer/subscription/upgrade", json={"tier": next_tier})
        assert resp.status_code == 200, f"Upgrade failed: {resp.text}"
        
        data = resp.json()
        assert data["tier"] == next_tier, f"Expected tier {next_tier}, got {data['tier']}"
        assert "tier_config" in data, "Missing tier_config in response"
        assert "message" in data, "Missing message in response"
        
        print(f"Upgraded from {current_tier} to {next_tier}: {data['message']}")
    
    def test_upgrade_to_same_or_lower_tier_fails(self):
        """POST /api/mixer/subscription/upgrade to same/lower tier returns 400"""
        # Get current tier
        sub_resp = self.session.get(f"{BASE_URL}/api/mixer/subscription")
        assert sub_resp.status_code == 200
        current_tier = sub_resp.json()["tier"]
        
        # Try to upgrade to same tier
        resp = self.session.post(f"{BASE_URL}/api/mixer/subscription/upgrade", json={"tier": current_tier})
        assert resp.status_code == 400, f"Expected 400 for same tier, got {resp.status_code}"
        
        # Try to upgrade to lower tier (if not discovery)
        tier_order = ["discovery", "player", "ultra_player", "sovereign"]
        current_idx = tier_order.index(current_tier) if current_tier in tier_order else 0
        
        if current_idx > 0:
            lower_tier = tier_order[current_idx - 1]
            resp = self.session.post(f"{BASE_URL}/api/mixer/subscription/upgrade", json={"tier": lower_tier})
            assert resp.status_code == 400, f"Expected 400 for lower tier, got {resp.status_code}"
        
        print(f"Correctly rejected upgrade to same/lower tier from {current_tier}")
    
    def test_upgrade_to_invalid_tier_fails(self):
        """POST /api/mixer/subscription/upgrade with invalid tier returns 400"""
        resp = self.session.post(f"{BASE_URL}/api/mixer/subscription/upgrade", json={"tier": "invalid_tier"})
        assert resp.status_code == 400, f"Expected 400 for invalid tier, got {resp.status_code}"
        print("Correctly rejected invalid tier")


class TestMixerSources21:
    """Test 21 tier-gated track sources"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        login_resp = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if login_resp.status_code == 200:
            token = login_resp.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip(f"Login failed: {login_resp.status_code}")
    
    def test_sources_returns_21_sources(self):
        """GET /api/mixer/sources returns 21 sources"""
        resp = self.session.get(f"{BASE_URL}/api/mixer/sources")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        
        data = resp.json()
        assert "sources" in data, "Missing sources field"
        assert "tier" in data, "Missing tier field"
        
        sources = data["sources"]
        assert len(sources) == 21, f"Expected 21 sources, got {len(sources)}"
        
        print(f"21 sources returned for tier: {data['tier']}")
    
    def test_sources_have_correct_locking_per_tier(self):
        """GET /api/mixer/sources returns correct locked status based on user tier"""
        resp = self.session.get(f"{BASE_URL}/api/mixer/sources")
        assert resp.status_code == 200
        
        data = resp.json()
        user_tier = data["tier"]
        sources = data["sources"]
        
        tier_order = ["discovery", "player", "ultra_player", "sovereign"]
        user_tier_idx = tier_order.index(user_tier) if user_tier in tier_order else 0
        
        # Count sources by tier and locked status
        tier_counts = {"discovery": 0, "player": 0, "ultra_player": 0, "sovereign": 0}
        locked_count = 0
        unlocked_count = 0
        
        for source in sources:
            source_tier = source.get("tier", "discovery")
            tier_counts[source_tier] = tier_counts.get(source_tier, 0) + 1
            
            source_tier_idx = tier_order.index(source_tier) if source_tier in tier_order else 0
            expected_locked = source_tier_idx > user_tier_idx
            
            if source.get("locked"):
                locked_count += 1
            else:
                unlocked_count += 1
            
            # Verify locked status matches tier
            assert source.get("locked") == expected_locked, \
                f"Source {source['id']} should be {'locked' if expected_locked else 'unlocked'} for {user_tier} tier"
        
        print(f"User tier: {user_tier}, Unlocked: {unlocked_count}, Locked: {locked_count}")
        print(f"Sources by tier: {tier_counts}")
    
    def test_sources_have_required_fields(self):
        """GET /api/mixer/sources returns sources with all required fields"""
        resp = self.session.get(f"{BASE_URL}/api/mixer/sources")
        assert resp.status_code == 200
        
        sources = resp.json()["sources"]
        required_fields = ["id", "label", "type", "tier", "color", "locked"]
        
        for source in sources:
            for field in required_fields:
                assert field in source, f"Source {source.get('id', 'unknown')} missing field: {field}"
        
        print(f"All {len(sources)} sources have required fields")


class TestBonusPacks:
    """Test Bonus Wrapped packs system"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        login_resp = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if login_resp.status_code == 200:
            token = login_resp.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip(f"Login failed: {login_resp.status_code}")
    
    def test_bonus_packs_returns_5_packs(self):
        """GET /api/mixer/bonus-packs returns 5 packs"""
        resp = self.session.get(f"{BASE_URL}/api/mixer/bonus-packs")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        
        data = resp.json()
        assert "packs" in data, "Missing packs field"
        assert "user_credits" in data, "Missing user_credits field"
        assert "tier" in data, "Missing tier field"
        
        packs = data["packs"]
        assert len(packs) == 5, f"Expected 5 packs, got {len(packs)}"
        
        print(f"5 bonus packs returned, user credits: {data['user_credits']}")
    
    def test_bonus_packs_have_ownership_and_gating(self):
        """GET /api/mixer/bonus-packs returns ownership, tier-gating, affordability"""
        resp = self.session.get(f"{BASE_URL}/api/mixer/bonus-packs")
        assert resp.status_code == 200
        
        data = resp.json()
        packs = data["packs"]
        
        required_fields = ["id", "name", "description", "type", "price_credits", 
                          "tier_required", "bonus_wrap", "tracks_included", "color",
                          "owned", "tier_locked", "can_afford"]
        
        for pack in packs:
            for field in required_fields:
                assert field in pack, f"Pack {pack.get('id', 'unknown')} missing field: {field}"
            
            # Verify bonus_wrap structure
            assert "type" in pack["bonus_wrap"], "bonus_wrap missing type"
            assert "value" in pack["bonus_wrap"], "bonus_wrap missing value"
            assert "label" in pack["bonus_wrap"], "bonus_wrap missing label"
        
        owned_count = sum(1 for p in packs if p["owned"])
        locked_count = sum(1 for p in packs if p["tier_locked"])
        affordable_count = sum(1 for p in packs if p["can_afford"])
        
        print(f"Packs - Owned: {owned_count}, Tier-locked: {locked_count}, Affordable: {affordable_count}")
    
    def test_owned_packs_returns_track_data(self):
        """GET /api/mixer/bonus-packs/owned returns owned packs with tracks"""
        resp = self.session.get(f"{BASE_URL}/api/mixer/bonus-packs/owned")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        
        data = resp.json()
        assert "owned_packs" in data, "Missing owned_packs field"
        
        owned_packs = data["owned_packs"]
        for pack in owned_packs:
            assert "pack_id" in pack, "Missing pack_id"
            assert "pack_name" in pack, "Missing pack_name"
            assert "tracks" in pack, "Missing tracks"
            assert "bonus_wrap" in pack, "Missing bonus_wrap"
            
            # Verify tracks have required fields
            for track in pack.get("tracks", []):
                assert "type" in track, "Track missing type"
                assert "source_label" in track, "Track missing source_label"
        
        print(f"Owned packs: {[p['pack_name'] for p in owned_packs]}")


class TestBonusPackPurchase:
    """Test bonus pack purchase flow"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        login_resp = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if login_resp.status_code == 200:
            token = login_resp.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip(f"Login failed: {login_resp.status_code}")
    
    def test_duplicate_pack_purchase_returns_400(self):
        """POST /api/mixer/bonus-packs/purchase for owned pack returns 400"""
        # Get owned packs
        owned_resp = self.session.get(f"{BASE_URL}/api/mixer/bonus-packs/owned")
        assert owned_resp.status_code == 200
        
        owned_packs = owned_resp.json().get("owned_packs", [])
        if not owned_packs:
            pytest.skip("No owned packs to test duplicate purchase")
        
        owned_pack_id = owned_packs[0]["pack_id"]
        
        # Try to purchase again
        resp = self.session.post(f"{BASE_URL}/api/mixer/bonus-packs/purchase", json={"packId": owned_pack_id})
        assert resp.status_code == 400, f"Expected 400 for duplicate purchase, got {resp.status_code}"
        assert "already owned" in resp.json().get("detail", "").lower(), "Expected 'already owned' error"
        
        print(f"Correctly rejected duplicate purchase of {owned_pack_id}")
    
    def test_tier_gated_pack_purchase_returns_403(self):
        """POST /api/mixer/bonus-packs/purchase for tier-locked pack returns 403"""
        # Get packs
        packs_resp = self.session.get(f"{BASE_URL}/api/mixer/bonus-packs")
        assert packs_resp.status_code == 200
        
        packs = packs_resp.json().get("packs", [])
        tier_locked_packs = [p for p in packs if p["tier_locked"] and not p["owned"]]
        
        if not tier_locked_packs:
            pytest.skip("No tier-locked packs available to test")
        
        locked_pack_id = tier_locked_packs[0]["id"]
        
        # Try to purchase
        resp = self.session.post(f"{BASE_URL}/api/mixer/bonus-packs/purchase", json={"packId": locked_pack_id})
        assert resp.status_code == 403, f"Expected 403 for tier-locked pack, got {resp.status_code}"
        
        print(f"Correctly rejected tier-locked pack purchase: {locked_pack_id}")
    
    def test_purchase_nonexistent_pack_returns_404(self):
        """POST /api/mixer/bonus-packs/purchase for nonexistent pack returns 404"""
        resp = self.session.post(f"{BASE_URL}/api/mixer/bonus-packs/purchase", json={"packId": "nonexistent-pack"})
        assert resp.status_code == 404, f"Expected 404 for nonexistent pack, got {resp.status_code}"
        
        print("Correctly rejected nonexistent pack purchase")


class TestProjectLayerCap:
    """Test layer cap enforcement per tier"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        login_resp = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if login_resp.status_code == 200:
            token = login_resp.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip(f"Login failed: {login_resp.status_code}")
    
    def test_project_save_within_layer_cap(self):
        """POST /api/mixer/projects within layer cap succeeds"""
        # Get current tier config
        sub_resp = self.session.get(f"{BASE_URL}/api/mixer/subscription")
        assert sub_resp.status_code == 200
        
        tier_config = sub_resp.json()["tier_config"]
        layer_cap = tier_config["layer_cap"]
        
        # Create tracks within cap
        track_count = min(layer_cap, 3) if layer_cap > 0 else 3
        tracks = [
            {"type": "phonic_tone", "source_label": f"Test Track {i}", "volume": 0.8}
            for i in range(track_count)
        ]
        
        resp = self.session.post(f"{BASE_URL}/api/mixer/projects", json={
            "name": f"TEST_LayerCapTest_{track_count}",
            "tracks": tracks
        })
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        
        data = resp.json()
        assert data["track_count"] == track_count, f"Expected {track_count} tracks, got {data['track_count']}"
        
        print(f"Saved project with {track_count} tracks (cap: {layer_cap})")
    
    def test_project_save_exceeding_layer_cap_returns_403(self):
        """POST /api/mixer/projects exceeding layer cap returns 403"""
        # Get current tier config
        sub_resp = self.session.get(f"{BASE_URL}/api/mixer/subscription")
        assert sub_resp.status_code == 200
        
        tier_config = sub_resp.json()["tier_config"]
        layer_cap = tier_config["layer_cap"]
        
        if layer_cap < 0:  # Unlimited
            pytest.skip("Tier has unlimited layers")
        
        # Create tracks exceeding cap
        tracks = [
            {"type": "phonic_tone", "source_label": f"Test Track {i}", "volume": 0.8}
            for i in range(layer_cap + 5)
        ]
        
        resp = self.session.post(f"{BASE_URL}/api/mixer/projects", json={
            "name": "TEST_ExceedLayerCap",
            "tracks": tracks
        })
        assert resp.status_code == 403, f"Expected 403 for exceeding cap, got {resp.status_code}"
        assert "layer cap" in resp.json().get("detail", "").lower(), "Expected layer cap error message"
        
        print(f"Correctly rejected {len(tracks)} tracks (cap: {layer_cap})")


class TestTierLayerCaps:
    """Verify layer caps for each tier"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        login_resp = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if login_resp.status_code == 200:
            token = login_resp.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip(f"Login failed: {login_resp.status_code}")
    
    def test_tier_layer_caps_match_spec(self):
        """Verify tier layer caps: discovery=3, player=8, ultra_player=20, sovereign=unlimited"""
        resp = self.session.get(f"{BASE_URL}/api/mixer/subscription")
        assert resp.status_code == 200
        
        data = resp.json()
        all_tiers = data.get("all_tiers", {})
        
        # Expected layer caps from spec
        expected_caps = {
            "discovery": 3,
            "player": 8,
            "ultra_player": 20,
            "sovereign": -1  # Unlimited
        }
        
        # Get full tier configs from comparison
        comparison = data.get("comparison", [])
        layer_row = next((r for r in comparison if "layer" in r["feature"].lower()), None)
        
        if layer_row:
            assert "3" in layer_row["discovery"], f"Discovery should have 3 tracks: {layer_row['discovery']}"
            assert "8" in layer_row["player"], f"Player should have 8 tracks: {layer_row['player']}"
            assert "20" in layer_row["ultra_player"], f"Ultra Player should have 20 tracks: {layer_row['ultra_player']}"
            assert "unlimited" in layer_row["sovereign"].lower(), f"Sovereign should be unlimited: {layer_row['sovereign']}"
        
        print(f"Layer caps verified: {expected_caps}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
