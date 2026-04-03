"""
Iteration 237 - Sovereign Mastery Path Testing
Tests for:
- GET /api/sovereign-mastery/status - tier info, multipliers, avenue data
- POST /api/sovereign-mastery/record - core_orientation, lesson_complete, mixer_collision
- GET /api/sovereign-mastery/avenues - all 3 avenues with curriculum
- GET /api/sovereign-mastery/certificates - earned certificates
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSovereignMasteryAPI:
    """Sovereign Mastery 4-Tier Path API Tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login with test user
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.authenticated = True
        else:
            self.authenticated = False
            pytest.skip("Authentication failed - skipping authenticated tests")
    
    # ━━━ GET /api/sovereign-mastery/status ━━━
    def test_mastery_status_returns_tier_info(self):
        """GET /api/sovereign-mastery/status returns tier info"""
        response = self.session.get(f"{BASE_URL}/api/sovereign-mastery/status")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "current_tier" in data, "Missing current_tier"
        assert "all_tiers" in data, "Missing all_tiers"
        assert isinstance(data["current_tier"], int), "current_tier should be int"
        assert len(data["all_tiers"]) == 4, "Should have 4 tiers"
        print(f"PASS: Mastery status returns tier info - current_tier={data['current_tier']}")
    
    def test_mastery_status_returns_multipliers(self):
        """GET /api/sovereign-mastery/status returns gravity and bloom multipliers"""
        response = self.session.get(f"{BASE_URL}/api/sovereign-mastery/status")
        assert response.status_code == 200
        
        data = response.json()
        assert "gravity_multiplier" in data, "Missing gravity_multiplier"
        assert "bloom_multiplier" in data, "Missing bloom_multiplier"
        assert isinstance(data["gravity_multiplier"], (int, float)), "gravity_multiplier should be numeric"
        assert isinstance(data["bloom_multiplier"], (int, float)), "bloom_multiplier should be numeric"
        assert data["gravity_multiplier"] >= 1.0, "gravity_multiplier should be >= 1.0"
        assert data["bloom_multiplier"] >= 1.0, "bloom_multiplier should be >= 1.0"
        print(f"PASS: Mastery status returns multipliers - gravity={data['gravity_multiplier']}, bloom={data['bloom_multiplier']}")
    
    def test_mastery_status_returns_avenue_data(self):
        """GET /api/sovereign-mastery/status returns avenue progress data"""
        response = self.session.get(f"{BASE_URL}/api/sovereign-mastery/status")
        assert response.status_code == 200
        
        data = response.json()
        assert "avenues" in data, "Missing avenues"
        avenues = data["avenues"]
        assert len(avenues) == 3, f"Should have 3 avenues, got {len(avenues)}"
        
        expected_avenues = ["spotless_solutions", "enlightenment_cafe", "tech_dev"]
        for av_id in expected_avenues:
            assert av_id in avenues, f"Missing avenue: {av_id}"
            av = avenues[av_id]
            assert "name" in av, f"Avenue {av_id} missing name"
            assert "curriculum" in av, f"Avenue {av_id} missing curriculum"
            assert "progress_pct" in av, f"Avenue {av_id} missing progress_pct"
            assert "completed_lessons" in av, f"Avenue {av_id} missing completed_lessons"
        print(f"PASS: Mastery status returns 3 avenues with curriculum data")
    
    def test_mastery_status_returns_tier_scale(self):
        """GET /api/sovereign-mastery/status returns all 4 tiers with requirements"""
        response = self.session.get(f"{BASE_URL}/api/sovereign-mastery/status")
        assert response.status_code == 200
        
        data = response.json()
        all_tiers = data["all_tiers"]
        
        tier_names = ["Novice / Seeker", "Practitioner", "Specialist", "Sovereign / Super-User"]
        for i, tier in enumerate(all_tiers):
            assert tier["tier"] == i + 1, f"Tier {i+1} has wrong tier number"
            assert tier["name"] == tier_names[i], f"Tier {i+1} has wrong name"
            assert "gravity_multiplier" in tier, f"Tier {i+1} missing gravity_multiplier"
            assert "bloom_multiplier" in tier, f"Tier {i+1} missing bloom_multiplier"
            assert "requirement" in tier, f"Tier {i+1} missing requirement"
        print(f"PASS: Mastery status returns 4-tier scale with requirements")
    
    def test_mastery_status_returns_next_requirement(self):
        """GET /api/sovereign-mastery/status returns next requirement details"""
        response = self.session.get(f"{BASE_URL}/api/sovereign-mastery/status")
        assert response.status_code == 200
        
        data = response.json()
        # next_requirement may be None if at max tier
        if data["current_tier"] < 4:
            assert "next_requirement" in data, "Missing next_requirement"
            next_req = data["next_requirement"]
            if next_req:
                assert "action" in next_req, "next_requirement missing action"
                assert "current" in next_req, "next_requirement missing current"
                assert "target" in next_req, "next_requirement missing target"
        print(f"PASS: Mastery status returns next requirement details")
    
    # ━━━ POST /api/sovereign-mastery/record ━━━
    def test_record_core_orientation_advances_tier(self):
        """POST /api/sovereign-mastery/record with action=core_orientation advances to Tier 1"""
        response = self.session.post(f"{BASE_URL}/api/sovereign-mastery/record", json={
            "action": "core_orientation"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["success"] == True, "Expected success=True"
        assert data["action"] == "core_orientation", "Wrong action returned"
        assert "detail" in data, "Missing detail"
        assert "current_tier" in data, "Missing current_tier"
        assert data["current_tier"] >= 1, "Should be at least Tier 1 after core_orientation"
        print(f"PASS: Core orientation recorded - tier={data['current_tier']}, detail={data['detail']}")
    
    def test_record_lesson_complete_records_xp(self):
        """POST /api/sovereign-mastery/record with action=lesson_complete records lesson and XP"""
        response = self.session.post(f"{BASE_URL}/api/sovereign-mastery/record", json={
            "action": "lesson_complete",
            "avenue_id": "tech_dev",
            "lesson_id": "td_1"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["success"] == True, "Expected success=True"
        assert data["action"] == "lesson_complete", "Wrong action returned"
        assert "detail" in data, "Missing detail"
        assert "XP" in data["detail"], "Detail should mention XP"
        print(f"PASS: Lesson complete recorded - detail={data['detail']}")
    
    def test_record_mixer_collision_increments_count(self):
        """POST /api/sovereign-mastery/record with action=mixer_collision increments collision count"""
        # Get current collision count
        status_before = self.session.get(f"{BASE_URL}/api/sovereign-mastery/status").json()
        collisions_before = status_before.get("mixer_collisions", 0)
        
        response = self.session.post(f"{BASE_URL}/api/sovereign-mastery/record", json={
            "action": "mixer_collision"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["success"] == True, "Expected success=True"
        assert data["action"] == "mixer_collision", "Wrong action returned"
        
        # Verify count incremented
        status_after = self.session.get(f"{BASE_URL}/api/sovereign-mastery/status").json()
        collisions_after = status_after.get("mixer_collisions", 0)
        assert collisions_after == collisions_before + 1, f"Collision count should increment: {collisions_before} -> {collisions_after}"
        print(f"PASS: Mixer collision recorded - count={collisions_after}")
    
    def test_record_invalid_action_returns_400(self):
        """POST /api/sovereign-mastery/record with invalid action returns 400"""
        response = self.session.post(f"{BASE_URL}/api/sovereign-mastery/record", json={
            "action": "invalid_action"
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print(f"PASS: Invalid action returns 400")
    
    def test_record_lesson_without_avenue_returns_400(self):
        """POST /api/sovereign-mastery/record lesson_complete without avenue_id returns 400"""
        response = self.session.post(f"{BASE_URL}/api/sovereign-mastery/record", json={
            "action": "lesson_complete",
            "lesson_id": "td_1"
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print(f"PASS: Lesson complete without avenue_id returns 400")
    
    # ━━━ GET /api/sovereign-mastery/avenues ━━━
    def test_avenues_returns_all_three(self):
        """GET /api/sovereign-mastery/avenues returns all 3 avenues with curriculum"""
        response = self.session.get(f"{BASE_URL}/api/sovereign-mastery/avenues")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "avenues" in data, "Missing avenues"
        avenues = data["avenues"]
        assert len(avenues) == 3, f"Should have 3 avenues, got {len(avenues)}"
        
        avenue_names = ["Spotless Solutions", "Enlightenment Cafe", "Tech / Dev Path"]
        for av in avenues:
            assert av["name"] in avenue_names, f"Unexpected avenue: {av['name']}"
            assert "curriculum" in av, f"Avenue {av['name']} missing curriculum"
            assert len(av["curriculum"]) == 5, f"Avenue {av['name']} should have 5 lessons"
            assert "progress_pct" in av, f"Avenue {av['name']} missing progress_pct"
            assert "earned_xp" in av, f"Avenue {av['name']} missing earned_xp"
        print(f"PASS: Avenues endpoint returns 3 avenues with 5 lessons each")
    
    def test_avenues_curriculum_has_xp_values(self):
        """GET /api/sovereign-mastery/avenues curriculum lessons have XP values"""
        response = self.session.get(f"{BASE_URL}/api/sovereign-mastery/avenues")
        assert response.status_code == 200
        
        data = response.json()
        for av in data["avenues"]:
            for lesson in av["curriculum"]:
                assert "id" in lesson, f"Lesson missing id"
                assert "title" in lesson, f"Lesson missing title"
                assert "xp" in lesson, f"Lesson missing xp"
                assert lesson["xp"] > 0, f"Lesson XP should be positive"
        print(f"PASS: All avenue lessons have XP values")
    
    # ━━━ GET /api/sovereign-mastery/certificates ━━━
    def test_certificates_returns_list(self):
        """GET /api/sovereign-mastery/certificates returns certificates list"""
        response = self.session.get(f"{BASE_URL}/api/sovereign-mastery/certificates")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "certificates" in data, "Missing certificates"
        assert isinstance(data["certificates"], list), "certificates should be a list"
        print(f"PASS: Certificates endpoint returns list - count={len(data['certificates'])}")
    
    # ━━━ Multiplier Integration Tests ━━━
    def test_tier_multipliers_increase_with_tier(self):
        """Verify tier multipliers increase with tier level"""
        response = self.session.get(f"{BASE_URL}/api/sovereign-mastery/status")
        assert response.status_code == 200
        
        data = response.json()
        all_tiers = data["all_tiers"]
        
        prev_gravity = 0
        prev_bloom = 0
        for tier in all_tiers:
            assert tier["gravity_multiplier"] > prev_gravity, f"Tier {tier['tier']} gravity should increase"
            assert tier["bloom_multiplier"] > prev_bloom, f"Tier {tier['tier']} bloom should increase"
            prev_gravity = tier["gravity_multiplier"]
            prev_bloom = tier["bloom_multiplier"]
        print(f"PASS: Tier multipliers increase with tier level")
    
    def test_current_multipliers_match_tier(self):
        """Verify current multipliers match current tier"""
        response = self.session.get(f"{BASE_URL}/api/sovereign-mastery/status")
        assert response.status_code == 200
        
        data = response.json()
        current_tier = data["current_tier"]
        
        if current_tier > 0:
            tier_info = data["tier_info"]
            assert data["gravity_multiplier"] == tier_info["gravity_multiplier"], "gravity_multiplier should match tier"
            assert data["bloom_multiplier"] == tier_info["bloom_multiplier"], "bloom_multiplier should match tier"
        else:
            assert data["gravity_multiplier"] == 1.0, "Tier 0 should have gravity=1.0"
            assert data["bloom_multiplier"] == 1.0, "Tier 0 should have bloom=1.0"
        print(f"PASS: Current multipliers match tier {current_tier}")


class TestSovereignMasteryUnauthenticated:
    """Test unauthenticated access to mastery endpoints"""
    
    def test_mastery_status_requires_auth(self):
        """GET /api/sovereign-mastery/status requires authentication"""
        response = requests.get(f"{BASE_URL}/api/sovereign-mastery/status")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"PASS: Mastery status requires authentication")
    
    def test_mastery_record_requires_auth(self):
        """POST /api/sovereign-mastery/record requires authentication"""
        response = requests.post(f"{BASE_URL}/api/sovereign-mastery/record", json={
            "action": "core_orientation"
        })
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"PASS: Mastery record requires authentication")
    
    def test_avenues_requires_auth(self):
        """GET /api/sovereign-mastery/avenues requires authentication"""
        response = requests.get(f"{BASE_URL}/api/sovereign-mastery/avenues")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"PASS: Avenues endpoint requires authentication")
    
    def test_certificates_requires_auth(self):
        """GET /api/sovereign-mastery/certificates requires authentication"""
        response = requests.get(f"{BASE_URL}/api/sovereign-mastery/certificates")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"PASS: Certificates endpoint requires authentication")
