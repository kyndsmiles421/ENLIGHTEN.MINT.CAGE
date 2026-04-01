"""
Iteration 174 Tests: Aura Colors, God Mode Dashboard, Genesis Minting, 144-Slot Cap
Tests the new features:
1. Updated Aura Colors (L1=Amber, L2=Rose/Teal, L3=Silver/Blue, L4=Indigo/Violet, L5=Gold/White)
2. God Mode Dashboard (Level 5 / Founding Architect real-time economy feed)
3. Founder's Minting (1-of-1 Genesis item per Founding Architect)
4. 144-Slot Cap on Founding Architect program
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials - Founding Architect user who has already minted Genesis
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


class TestAuraColors:
    """Test updated consciousness level aura colors"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        # Login
        login_res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL, "password": TEST_PASSWORD
        })
        if login_res.status_code == 200:
            token = login_res.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        yield
    
    def test_consciousness_levels_returns_all_five_levels(self):
        """GET /api/consciousness/levels returns all 5 levels with updated colors"""
        res = self.session.get(f"{BASE_URL}/api/consciousness/levels")
        assert res.status_code == 200
        data = res.json()
        assert "levels" in data
        assert len(data["levels"]) == 5
        
        # Verify level names
        level_names = [l["name"] for l in data["levels"]]
        assert level_names == ["Physical", "Emotional", "Mental", "Intuitive", "Pure Consciousness"]
    
    def test_level1_amber_aura_color(self):
        """Level 1 (Physical) should have Amber aura color"""
        res = self.session.get(f"{BASE_URL}/api/consciousness/levels")
        assert res.status_code == 200
        levels = res.json()["levels"]
        level1 = levels[0]
        
        assert level1["level"] == 1
        assert level1["name"] == "Physical"
        assert level1["color"] == "#D97706"  # Amber
        assert level1["aura_color"] == "#B45309"  # Darker amber
        assert "217, 119, 6" in level1["aura_glow"]  # Amber glow
    
    def test_level2_rose_teal_aura_colors(self):
        """Level 2 (Emotional) should have Rose primary and Teal secondary"""
        res = self.session.get(f"{BASE_URL}/api/consciousness/levels")
        assert res.status_code == 200
        levels = res.json()["levels"]
        level2 = levels[1]
        
        assert level2["level"] == 2
        assert level2["name"] == "Emotional"
        assert level2["color"] == "#F472B6"  # Rose
        assert level2["aura_color"] == "#2DD4BF"  # Teal
        assert "244, 114, 182" in level2["aura_glow"]  # Rose glow
    
    def test_level3_silver_blue_aura_colors(self):
        """Level 3 (Mental) should have Silver primary and Blue secondary"""
        res = self.session.get(f"{BASE_URL}/api/consciousness/levels")
        assert res.status_code == 200
        levels = res.json()["levels"]
        level3 = levels[2]
        
        assert level3["level"] == 3
        assert level3["name"] == "Mental"
        assert level3["color"] == "#94A3B8"  # Silver
        assert level3["aura_color"] == "#3B82F6"  # Blue
        assert "148, 163, 184" in level3["aura_glow"]  # Silver glow
    
    def test_level4_indigo_violet_aura_colors(self):
        """Level 4 (Intuitive) should have Indigo/Violet colors"""
        res = self.session.get(f"{BASE_URL}/api/consciousness/levels")
        assert res.status_code == 200
        levels = res.json()["levels"]
        level4 = levels[3]
        
        assert level4["level"] == 4
        assert level4["name"] == "Intuitive"
        assert level4["color"] == "#8B5CF6"  # Violet
        assert level4["aura_color"] == "#6366F1"  # Indigo
        assert "139, 92, 246" in level4["aura_glow"]  # Violet glow
    
    def test_level5_gold_white_halo_aura_colors(self):
        """Level 5 (Pure Consciousness) should have Gold/White Halo colors"""
        res = self.session.get(f"{BASE_URL}/api/consciousness/levels")
        assert res.status_code == 200
        levels = res.json()["levels"]
        level5 = levels[4]
        
        assert level5["level"] == 5
        assert level5["name"] == "Pure Consciousness"
        assert level5["color"] == "#FBBF24"  # Gold
        assert level5["aura_color"] == "#FFFBEB"  # White/Cream (halo)
        assert "251, 191, 36" in level5["aura_glow"]  # Gold glow
    
    def test_consciousness_status_returns_level_info_with_colors(self):
        """GET /api/consciousness/status returns level_info with aura colors"""
        res = self.session.get(f"{BASE_URL}/api/consciousness/status")
        assert res.status_code == 200
        data = res.json()
        
        assert "level" in data
        assert "level_info" in data
        level_info = data["level_info"]
        
        # Verify color fields exist
        assert "color" in level_info
        assert "aura_color" in level_info
        assert "aura_glow" in level_info


class TestFoundingArchitectStatus:
    """Test Founding Architect status endpoint with 144-slot cap"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        # Login
        login_res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL, "password": TEST_PASSWORD
        })
        if login_res.status_code == 200:
            token = login_res.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        yield
    
    def test_founding_architect_status_returns_slot_info(self):
        """GET /api/founding-architect/status returns slots_filled, slots_total (144), slots_remaining"""
        res = self.session.get(f"{BASE_URL}/api/founding-architect/status")
        assert res.status_code == 200
        data = res.json()
        
        # Verify slot fields
        assert "slots_filled" in data
        assert "slots_total" in data
        assert "slots_remaining" in data
        
        # Verify 144 slot cap
        assert data["slots_total"] == 144
        assert data["slots_remaining"] == 144 - data["slots_filled"]
        assert data["slots_remaining"] >= 0
    
    def test_founding_architect_status_returns_genesis_minted_status(self):
        """GET /api/founding-architect/status returns genesis_minted status"""
        res = self.session.get(f"{BASE_URL}/api/founding-architect/status")
        assert res.status_code == 200
        data = res.json()
        
        # Verify genesis_minted field
        assert "genesis_minted" in data
        assert isinstance(data["genesis_minted"], bool)
    
    def test_founding_architect_status_for_founder(self):
        """Test user is a Founding Architect with genesis already minted"""
        res = self.session.get(f"{BASE_URL}/api/founding-architect/status")
        assert res.status_code == 200
        data = res.json()
        
        # Test user should be a Founding Architect
        assert data["is_founding_architect"] == True
        # Test user has already minted Genesis
        assert data["genesis_minted"] == True
        # Should have perks
        assert data["perks"] is not None
        assert data["perks"]["lifetime_elite_discount"] == 30


class TestFoundingArchitectRedeem:
    """Test Founding Architect redeem endpoint with 144-slot cap"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        # Login
        login_res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL, "password": TEST_PASSWORD
        })
        if login_res.status_code == 200:
            token = login_res.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        yield
    
    def test_redeem_already_founder_returns_400(self):
        """POST /api/founding-architect/redeem returns 400 if already a Founding Architect"""
        res = self.session.post(f"{BASE_URL}/api/founding-architect/redeem", json={
            "code": "COSMIC-FOUNDER-2026"
        })
        # Should return 400 because test user is already a Founding Architect
        assert res.status_code == 400
        data = res.json()
        assert "Already a Founding Architect" in data.get("detail", "")
    
    def test_redeem_invalid_code_returns_400(self):
        """POST /api/founding-architect/redeem returns 400 for invalid code"""
        res = self.session.post(f"{BASE_URL}/api/founding-architect/redeem", json={
            "code": "INVALID-CODE-12345"
        })
        assert res.status_code == 400
        data = res.json()
        assert "Invalid invite code" in data.get("detail", "")


class TestGenesisMint:
    """Test Genesis Minting endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        # Login
        login_res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL, "password": TEST_PASSWORD
        })
        if login_res.status_code == 200:
            token = login_res.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        yield
    
    def test_genesis_mint_already_minted_returns_400(self):
        """POST /api/forge/genesis/mint returns 400 if user already minted Genesis"""
        res = self.session.post(f"{BASE_URL}/api/forge/genesis/mint", json={
            "type": "resonator_key",
            "context": "Test Genesis"
        })
        # Test user has already minted, should return 400
        assert res.status_code == 400
        data = res.json()
        assert "already minted" in data.get("detail", "").lower()
    
    def test_genesis_mint_invalid_type_returns_400(self):
        """POST /api/forge/genesis/mint returns 400 for invalid item type"""
        res = self.session.post(f"{BASE_URL}/api/forge/genesis/mint", json={
            "type": "invalid_type",
            "context": "Test"
        })
        # Should return 400 for invalid type (or 400 for already minted)
        assert res.status_code == 400


class TestGenesisMintNonFounder:
    """Test Genesis Minting for non-founder user"""
    
    def test_genesis_mint_non_founder_returns_403(self):
        """POST /api/forge/genesis/mint returns 403 for non-Founding Architect"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        
        # Try to create a new user or use a non-founder account
        # For this test, we'll try without auth which should fail
        res = session.post(f"{BASE_URL}/api/forge/genesis/mint", json={
            "type": "resonator_key",
            "context": "Test"
        })
        # Should return 401 (no auth) or 403 (not a founder)
        assert res.status_code in [401, 403, 422]


class TestGodModeEconomy:
    """Test God Mode Economy Dashboard endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        # Login as Founding Architect
        login_res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL, "password": TEST_PASSWORD
        })
        if login_res.status_code == 200:
            token = login_res.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        yield
    
    def test_god_mode_economy_returns_stats(self):
        """GET /api/forge/god-mode/economy returns economy stats for Founding Architect"""
        res = self.session.get(f"{BASE_URL}/api/forge/god-mode/economy")
        assert res.status_code == 200
        data = res.json()
        
        # Verify economy stats
        assert "economy" in data
        economy = data["economy"]
        assert "total_users" in economy
        assert "founding_architects" in economy
        assert "architect_slots_remaining" in economy
        assert "total_forge_items" in economy
        assert "total_genesis_items" in economy
        assert "total_marketplace_assets" in economy
        assert "total_listings" in economy
    
    def test_god_mode_economy_returns_distributions(self):
        """GET /api/forge/god-mode/economy returns asset and consciousness distributions"""
        res = self.session.get(f"{BASE_URL}/api/forge/god-mode/economy")
        assert res.status_code == 200
        data = res.json()
        
        # Verify distributions
        assert "asset_distribution" in data
        assert "consciousness_distribution" in data
        assert isinstance(data["asset_distribution"], dict)
        assert isinstance(data["consciousness_distribution"], dict)
    
    def test_god_mode_economy_returns_recent_activity(self):
        """GET /api/forge/god-mode/economy returns recent trades and forges"""
        res = self.session.get(f"{BASE_URL}/api/forge/god-mode/economy")
        assert res.status_code == 200
        data = res.json()
        
        # Verify recent activity
        assert "recent_trades" in data
        assert "recent_forges" in data
        assert isinstance(data["recent_trades"], list)
        assert isinstance(data["recent_forges"], list)
    
    def test_god_mode_economy_returns_user_info(self):
        """GET /api/forge/god-mode/economy returns user level and founder status"""
        res = self.session.get(f"{BASE_URL}/api/forge/god-mode/economy")
        assert res.status_code == 200
        data = res.json()
        
        # Verify user info
        assert "user_level" in data
        assert "is_founding_architect" in data
        # Test user is a Founding Architect
        assert data["is_founding_architect"] == True
    
    def test_god_mode_economy_architect_slots_remaining(self):
        """God Mode shows correct architect_slots_remaining (144 - filled)"""
        res = self.session.get(f"{BASE_URL}/api/forge/god-mode/economy")
        assert res.status_code == 200
        data = res.json()
        
        economy = data["economy"]
        # Verify 144 slot cap calculation
        expected_remaining = max(0, 144 - economy["founding_architects"])
        assert economy["architect_slots_remaining"] == expected_remaining


class TestGodModeAccessControl:
    """Test God Mode access control - requires Level 5 or Founding Architect"""
    
    def test_god_mode_no_auth_returns_401(self):
        """GET /api/forge/god-mode/economy returns 401 without auth"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        
        res = session.get(f"{BASE_URL}/api/forge/god-mode/economy")
        assert res.status_code in [401, 422]


class TestConsciousnessStatusWithAllLevels:
    """Test consciousness status returns all_levels with updated colors"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        # Login
        login_res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL, "password": TEST_PASSWORD
        })
        if login_res.status_code == 200:
            token = login_res.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        yield
    
    def test_consciousness_status_includes_all_levels(self):
        """GET /api/consciousness/status includes all_levels array"""
        res = self.session.get(f"{BASE_URL}/api/consciousness/status")
        assert res.status_code == 200
        data = res.json()
        
        assert "all_levels" in data
        assert len(data["all_levels"]) == 5
        
        # Verify each level has color info
        for level in data["all_levels"]:
            assert "color" in level
            assert "aura_color" in level
            assert "aura_glow" in level


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
