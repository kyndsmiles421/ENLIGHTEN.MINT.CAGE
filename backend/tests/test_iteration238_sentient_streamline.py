"""
Iteration 238 - Sentient Streamline Enhancement Tests
Tests for:
1. Backend: GET /api/sovereign-mastery/status returns gravity_multiplier, bloom_multiplier, current_tier
2. Backend: POST /api/sovereign-mastery/record with action=core_orientation returns tier_advanced=true
3. Backend: POST /api/sovereign-mastery/record with action=mixer_collision increments collision count
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


class TestSovereignMasteryBackend:
    """Tests for Sovereign Mastery API endpoints - Iteration 238"""
    
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
            data = login_response.json()
            self.token = data.get("token")
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        else:
            pytest.skip(f"Authentication failed: {login_response.status_code}")
    
    def test_mastery_status_returns_multipliers(self):
        """GET /api/sovereign-mastery/status returns gravity_multiplier, bloom_multiplier, current_tier"""
        response = self.session.get(f"{BASE_URL}/api/sovereign-mastery/status")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify required fields exist
        assert "current_tier" in data, "Missing current_tier in response"
        assert "gravity_multiplier" in data, "Missing gravity_multiplier in response"
        assert "bloom_multiplier" in data, "Missing bloom_multiplier in response"
        
        # Verify types
        assert isinstance(data["current_tier"], int), "current_tier should be int"
        assert isinstance(data["gravity_multiplier"], (int, float)), "gravity_multiplier should be numeric"
        assert isinstance(data["bloom_multiplier"], (int, float)), "bloom_multiplier should be numeric"
        
        # Verify tier info structure
        if data["current_tier"] > 0:
            assert "tier_info" in data, "Missing tier_info for tier > 0"
            tier_info = data["tier_info"]
            assert "gravity_multiplier" in tier_info, "tier_info missing gravity_multiplier"
            assert "bloom_multiplier" in tier_info, "tier_info missing bloom_multiplier"
        
        print(f"✓ Mastery status: tier={data['current_tier']}, gravity={data['gravity_multiplier']}, bloom={data['bloom_multiplier']}")
    
    def test_mastery_status_returns_all_tiers(self):
        """GET /api/sovereign-mastery/status returns all_tiers array with 4 tiers"""
        response = self.session.get(f"{BASE_URL}/api/sovereign-mastery/status")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "all_tiers" in data, "Missing all_tiers in response"
        assert len(data["all_tiers"]) == 4, f"Expected 4 tiers, got {len(data['all_tiers'])}"
        
        # Verify tier structure
        for tier in data["all_tiers"]:
            assert "tier" in tier
            assert "name" in tier
            assert "gravity_multiplier" in tier
            assert "bloom_multiplier" in tier
        
        # Verify tier multipliers match expected values
        expected_multipliers = [
            (1, 1.0, 1.0),   # Tier 1: Novice
            (2, 1.3, 1.4),   # Tier 2: Practitioner
            (3, 1.8, 2.0),   # Tier 3: Specialist
            (4, 2.5, 3.0),   # Tier 4: Sovereign
        ]
        
        for tier_num, expected_gravity, expected_bloom in expected_multipliers:
            tier = data["all_tiers"][tier_num - 1]
            assert tier["gravity_multiplier"] == expected_gravity, f"Tier {tier_num} gravity mismatch"
            assert tier["bloom_multiplier"] == expected_bloom, f"Tier {tier_num} bloom mismatch"
        
        print("✓ All 4 tiers present with correct multipliers")
    
    def test_record_core_orientation(self):
        """POST /api/sovereign-mastery/record with action=core_orientation returns success"""
        response = self.session.post(f"{BASE_URL}/api/sovereign-mastery/record", json={
            "action": "core_orientation"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert data.get("success") == True, "Expected success=true"
        assert data.get("action") == "core_orientation", "Action mismatch"
        assert "current_tier" in data, "Missing current_tier in response"
        assert "tier_advanced" in data, "Missing tier_advanced in response"
        assert "gravity_multiplier" in data, "Missing gravity_multiplier in response"
        assert "bloom_multiplier" in data, "Missing bloom_multiplier in response"
        
        # After core_orientation, user should be at least tier 1
        assert data["current_tier"] >= 1, "User should be at tier 1+ after core_orientation"
        
        print(f"✓ Core orientation recorded: tier={data['current_tier']}, advanced={data['tier_advanced']}")
    
    def test_record_mixer_collision(self):
        """POST /api/sovereign-mastery/record with action=mixer_collision increments count"""
        # Get current collision count
        status_before = self.session.get(f"{BASE_URL}/api/sovereign-mastery/status").json()
        collisions_before = status_before.get("mixer_collisions", 0)
        
        # Record a mixer collision
        response = self.session.post(f"{BASE_URL}/api/sovereign-mastery/record", json={
            "action": "mixer_collision"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert data.get("success") == True, "Expected success=true"
        assert data.get("action") == "mixer_collision", "Action mismatch"
        assert "detail" in data, "Missing detail in response"
        assert "+25 XP" in data["detail"], "Expected XP reward in detail"
        
        # Verify collision count incremented
        status_after = self.session.get(f"{BASE_URL}/api/sovereign-mastery/status").json()
        collisions_after = status_after.get("mixer_collisions", 0)
        
        assert collisions_after == collisions_before + 1, f"Collision count should increment: {collisions_before} -> {collisions_after}"
        
        print(f"✓ Mixer collision recorded: {collisions_before} -> {collisions_after}")
    
    def test_record_invalid_action(self):
        """POST /api/sovereign-mastery/record with invalid action returns 400"""
        response = self.session.post(f"{BASE_URL}/api/sovereign-mastery/record", json={
            "action": "invalid_action"
        })
        
        assert response.status_code == 400, f"Expected 400 for invalid action, got {response.status_code}"
        print("✓ Invalid action correctly rejected with 400")
    
    def test_mastery_status_returns_avenues(self):
        """GET /api/sovereign-mastery/status returns avenues with progress"""
        response = self.session.get(f"{BASE_URL}/api/sovereign-mastery/status")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "avenues" in data, "Missing avenues in response"
        avenues = data["avenues"]
        
        # Should have 3 avenues
        assert len(avenues) == 3, f"Expected 3 avenues, got {len(avenues)}"
        
        expected_avenues = ["spotless_solutions", "enlightenment_cafe", "tech_dev"]
        for av_id in expected_avenues:
            assert av_id in avenues, f"Missing avenue: {av_id}"
            av = avenues[av_id]
            assert "name" in av
            assert "curriculum" in av
            assert "progress_pct" in av
            assert len(av["curriculum"]) == 5, f"Avenue {av_id} should have 5 lessons"
        
        print("✓ All 3 avenues present with curriculum")
    
    def test_mastery_status_returns_certificates(self):
        """GET /api/sovereign-mastery/status returns certificates array"""
        response = self.session.get(f"{BASE_URL}/api/sovereign-mastery/status")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "certificates" in data, "Missing certificates in response"
        assert isinstance(data["certificates"], list), "certificates should be a list"
        
        print(f"✓ Certificates array present: {len(data['certificates'])} certificates")
    
    def test_mastery_status_returns_next_requirement(self):
        """GET /api/sovereign-mastery/status returns next_requirement"""
        response = self.session.get(f"{BASE_URL}/api/sovereign-mastery/status")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "next_requirement" in data, "Missing next_requirement in response"
        
        if data["next_requirement"]:
            req = data["next_requirement"]
            assert "action" in req, "next_requirement missing action"
            assert "current" in req, "next_requirement missing current"
            assert "target" in req, "next_requirement missing target"
        
        print(f"✓ Next requirement: {data.get('next_requirement')}")


class TestSovereignMasteryAvenues:
    """Tests for Avenue endpoints"""
    
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
            data = login_response.json()
            self.token = data.get("token")
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        else:
            pytest.skip(f"Authentication failed: {login_response.status_code}")
    
    def test_get_avenues(self):
        """GET /api/sovereign-mastery/avenues returns all avenues"""
        response = self.session.get(f"{BASE_URL}/api/sovereign-mastery/avenues")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "avenues" in data
        assert len(data["avenues"]) == 3
        
        for av in data["avenues"]:
            assert "id" in av
            assert "name" in av
            assert "curriculum" in av
            assert "progress_pct" in av
            assert "total_xp" in av
            assert av["total_xp"] == 1100, f"Avenue {av['id']} should have 1100 total XP"
        
        print("✓ GET /api/sovereign-mastery/avenues returns 3 avenues")
    
    def test_get_certificates(self):
        """GET /api/sovereign-mastery/certificates returns certificates list"""
        response = self.session.get(f"{BASE_URL}/api/sovereign-mastery/certificates")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "certificates" in data
        assert isinstance(data["certificates"], list)
        
        print(f"✓ GET /api/sovereign-mastery/certificates returns {len(data['certificates'])} certificates")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
