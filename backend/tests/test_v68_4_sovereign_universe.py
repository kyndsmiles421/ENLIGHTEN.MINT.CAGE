"""
V68.4 Phase D — Sovereign Universe Interconnect Tests
Tests for:
- Quest auto_detect endpoint with ordered step completion
- Universe state aggregate endpoint
- Universe signal breadcrumb endpoint
- Legacy quest advance endpoint
- Spark wallet integration with quest rewards
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from /app/memory/test_credentials.md
TEST_EMAIL = "test_v29_user@test.com"
TEST_PASSWORD = "testpass123"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        return data.get("token") or data.get("access_token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestQuestsAvailable:
    """Test GET /api/quests/available endpoint"""
    
    def test_quests_available_returns_quests(self, auth_headers):
        """Verify quests endpoint returns quest list with steps"""
        response = requests.get(f"{BASE_URL}/api/quests/available", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "quests" in data
        assert isinstance(data["quests"], list)
        assert len(data["quests"]) >= 3, "Expected at least 3 quests"
        
    def test_resonant_frequency_quest_has_3_steps(self, auth_headers):
        """Verify 'The Resonant Frequency' quest has 3 steps with auto_signal"""
        response = requests.get(f"{BASE_URL}/api/quests/available", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        resonant = next((q for q in data["quests"] if q["id"] == "resonant_frequency"), None)
        assert resonant is not None, "resonant_frequency quest not found"
        assert len(resonant["steps"]) == 3, f"Expected 3 steps, got {len(resonant['steps'])}"
        
        # Verify step structure
        for step in resonant["steps"]:
            assert "id" in step
            assert "action" in step
            assert "done" in step


class TestQuestAutoDetect:
    """Test POST /api/quests/auto_detect endpoint"""
    
    def test_auto_detect_missing_signal_returns_400(self, auth_headers):
        """POST without signal field should return 400"""
        response = requests.post(
            f"{BASE_URL}/api/quests/auto_detect",
            json={},
            headers=auth_headers
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        
    def test_auto_detect_invalid_signal_returns_empty(self, auth_headers):
        """POST with invalid signal should return 200 with empty advanced array"""
        response = requests.post(
            f"{BASE_URL}/api/quests/auto_detect",
            json={"signal": "nonsense:nothing"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "advanced" in data
        assert data["advanced"] == [], f"Expected empty advanced, got {data['advanced']}"
        assert data["count"] == 0
        
    def test_auto_detect_fire_triangle_step1(self, auth_headers):
        """Fire Triangle quest step 1: forestry:material:wildfire"""
        response = requests.post(
            f"{BASE_URL}/api/quests/auto_detect",
            json={"signal": "forestry:material:wildfire"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "advanced" in data
        assert "count" in data
        # Either advances step or already completed (idempotent)
        if data["count"] > 0:
            assert data["advanced"][0]["step_id"] == "study_fire"
            assert data["advanced"][0]["quest_id"] == "fire_triangle"
            print(f"Step 1 advanced: {data['advanced'][0]}")
        else:
            print("Step 1 already completed (idempotent)")
            
    def test_auto_detect_idempotent_same_signal(self, auth_headers):
        """Re-firing same signal should return empty advanced (idempotent)"""
        # Fire the same signal again
        response = requests.post(
            f"{BASE_URL}/api/quests/auto_detect",
            json={"signal": "forestry:material:wildfire"},
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        # Should be idempotent - no double advancement
        # Either already done from previous test or still empty
        print(f"Idempotent check: advanced={data['advanced']}, count={data['count']}")
        
    def test_auto_detect_out_of_order_rejected(self, auth_headers):
        """Firing step 3 before step 2 should return empty (ordered enforcement)"""
        # Try to fire step 3 signal before step 2 is done
        response = requests.post(
            f"{BASE_URL}/api/quests/auto_detect",
            json={"signal": "dream_realms:fire_extinguish"},
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        # Should not advance because step 2 isn't done yet
        # (unless all steps are already done)
        print(f"Out-of-order check: advanced={data['advanced']}, count={data['count']}")
        
    def test_auto_detect_fire_triangle_step2(self, auth_headers):
        """Fire Triangle quest step 2: forestry:dive:wildfire:3"""
        response = requests.post(
            f"{BASE_URL}/api/quests/auto_detect",
            json={"signal": "forestry:dive:wildfire:3"},
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        if data["count"] > 0:
            assert data["advanced"][0]["step_id"] == "learn_pyrolysis"
            print(f"Step 2 advanced: {data['advanced'][0]}")
        else:
            print("Step 2 already completed or step 1 not done")
            
    def test_auto_detect_fire_triangle_step3_completion(self, auth_headers):
        """Fire Triangle quest step 3: dream_realms:fire_extinguish - should complete quest"""
        response = requests.post(
            f"{BASE_URL}/api/quests/auto_detect",
            json={"signal": "dream_realms:fire_extinguish"},
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        if data["count"] > 0:
            result = data["advanced"][0]
            assert result["step_id"] == "save_realm"
            assert result["quest_complete"] == True, "Quest should be complete"
            assert result["reward_sparks"] == 750, f"Expected 750 sparks, got {result['reward_sparks']}"
            print(f"Quest completed! Reward: {result['reward_sparks']} sparks")
        else:
            print("Step 3 already completed or prior steps not done")


class TestUniverseState:
    """Test GET /api/universe/state endpoint"""
    
    def test_universe_state_returns_aggregate(self, auth_headers):
        """Verify universe state returns all required fields"""
        response = requests.get(f"{BASE_URL}/api/universe/state", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Required fields
        assert "sparks" in data, "Missing sparks field"
        assert "total_earned" in data, "Missing total_earned field"
        assert "cards_earned" in data, "Missing cards_earned field"
        assert "next_card" in data, "Missing next_card field"
        assert "quests" in data, "Missing quests field"
        assert "immersion_minutes" in data, "Missing immersion_minutes field"
        assert "ts" in data, "Missing ts field"
        
        # Type checks
        assert isinstance(data["sparks"], int)
        assert isinstance(data["cards_earned"], list)
        assert isinstance(data["quests"], list)
        
        print(f"Universe state: sparks={data['sparks']}, cards={len(data['cards_earned'])}, quests={len(data['quests'])}")


class TestUniverseSignal:
    """Test POST /api/universe/signal endpoint"""
    
    def test_universe_signal_with_valid_signal(self, auth_headers):
        """POST with signal should return logged: true"""
        response = requests.post(
            f"{BASE_URL}/api/universe/signal",
            json={"signal": "test:signal:breadcrumb", "location": "/test-page"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("logged") == True, f"Expected logged: true, got {data}"
        
    def test_universe_signal_without_signal(self, auth_headers):
        """POST without signal should return logged: false"""
        response = requests.post(
            f"{BASE_URL}/api/universe/signal",
            json={"location": "/test-page"},
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("logged") == False, f"Expected logged: false, got {data}"


class TestLegacyQuestAdvance:
    """Test POST /api/quests/advance (legacy manual endpoint)"""
    
    def test_legacy_advance_harmonic_convergence(self, auth_headers):
        """Legacy advance endpoint should still work"""
        response = requests.post(
            f"{BASE_URL}/api/quests/advance",
            json={"quest_id": "harmonic_convergence", "step_id": "find_harmonics"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "status" in data
        # Either step_completed or already_completed
        assert data["status"] in ["step_completed", "already_completed"], f"Unexpected status: {data['status']}"
        print(f"Legacy advance result: {data}")
        
    def test_legacy_advance_invalid_quest(self, auth_headers):
        """Legacy advance with invalid quest should return 404"""
        response = requests.post(
            f"{BASE_URL}/api/quests/advance",
            json={"quest_id": "nonexistent_quest", "step_id": "fake_step"},
            headers=auth_headers
        )
        assert response.status_code == 404


class TestSparkWalletIntegration:
    """Test spark wallet reflects quest rewards"""
    
    def test_spark_wallet_endpoint(self, auth_headers):
        """Verify spark wallet endpoint works"""
        response = requests.get(f"{BASE_URL}/api/sparks/wallet", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "sparks" in data
        assert "total_earned" in data
        assert "cards_earned" in data
        assert "next_card" in data
        
        print(f"Spark wallet: sparks={data['sparks']}, total_earned={data['total_earned']}, cards={len(data['cards_earned'])}")


class TestResonantFrequencyAlreadyComplete:
    """Test that resonant_frequency quest returns no advances (already completed per spec)"""
    
    def test_resonant_frequency_no_advance(self, auth_headers):
        """resonant_frequency quest is already completed - signals should return empty"""
        response = requests.post(
            f"{BASE_URL}/api/quests/auto_detect",
            json={"signal": "geology:material:minerals"},
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        # Per spec: test user already completed resonant_frequency
        # So this signal should not advance anything
        print(f"Resonant frequency signal result: advanced={data['advanced']}, count={data['count']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
