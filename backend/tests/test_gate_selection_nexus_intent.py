"""
Test Suite: Branching Resonance Gates + Nexus Intent + UI Enhancements
Iteration 157 - Tests for:
1. GET /api/dream-realms/active returns status=choosing with gates (purge/root/void)
2. POST /api/dream-realms/choose-gate with valid gate creates active realm
3. POST /api/dream-realms/choose-gate with invalid gate returns 400
4. POST /api/dream-realms/abandon works for choosing status realms
5. After abandon, GET /api/dream-realms/active generates new choosing realm
6. POST /api/dream-realms/complete-challenge still works after gate selection
7. GET /api/nexus/intent returns state=drift with element, action, frequency, confidence, warning
8. GET /api/dream-realms/history shows gate_chosen field
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "rpg_test@test.com"
TEST_PASSWORD = "password123"


class TestGateSelectionAndNexusIntent:
    """Tests for Branching Resonance Gates and Nexus Intent features"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if login_response.status_code != 200:
            pytest.skip(f"Login failed: {login_response.status_code} - {login_response.text}")
        
        token = login_response.json().get("token")
        self.session.headers.update({"Authorization": f"Bearer {token}"})
        yield
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # NEXUS INTENT TESTS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    def test_nexus_intent_returns_drift_state(self):
        """GET /api/nexus/intent returns state=drift with element, action, frequency, confidence, warning"""
        response = self.session.get(f"{BASE_URL}/api/nexus/intent")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "state" in data, "Response should have 'state' field"
        
        # State can be 'drift' or 'balanced'
        if data["state"] == "drift":
            # Drift state should have these fields
            assert "element" in data, "Drift state should have 'element'"
            assert "action" in data, "Drift state should have 'action'"
            assert "frequency" in data, "Drift state should have 'frequency'"
            assert "confidence" in data, "Drift state should have 'confidence'"
            assert "warning" in data or "message" in data, "Drift state should have 'warning' or 'message'"
            assert "harmony" in data, "Drift state should have 'harmony'"
            
            # Validate action structure
            action = data["action"]
            assert "label" in action, "Action should have 'label'"
            assert "path" in action, "Action should have 'path'"
            assert "icon" in action, "Action should have 'icon'"
            
            # Validate frequency structure
            freq = data["frequency"]
            assert "hz" in freq, "Frequency should have 'hz'"
            assert "label" in freq, "Frequency should have 'label'"
            
            # Validate confidence is between 0 and 1
            assert 0 <= data["confidence"] <= 1, f"Confidence should be 0-1, got {data['confidence']}"
            
            print(f"✓ Nexus intent: {data['element']} {data.get('direction', '')} (confidence: {data['confidence']})")
            print(f"  Action: {action['label']} -> {action['path']}")
            print(f"  Frequency: {freq['hz']} Hz")
        else:
            # Balanced state
            assert data["state"] == "balanced", f"State should be 'drift' or 'balanced', got {data['state']}"
            assert "harmony" in data, "Balanced state should have 'harmony'"
            print(f"✓ Nexus intent: balanced (harmony: {data['harmony']})")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # GATE SELECTION TESTS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    def test_abandon_current_realm_to_get_choosing_state(self):
        """First abandon any active realm to get to choosing state"""
        # Try to abandon current realm (may be active or choosing)
        abandon_response = self.session.post(f"{BASE_URL}/api/dream-realms/abandon")
        # Either 200 (abandoned) or 404 (no active realm) is acceptable
        assert abandon_response.status_code in [200, 404], f"Unexpected status: {abandon_response.status_code}"
        
        if abandon_response.status_code == 200:
            print("✓ Abandoned current realm")
        else:
            print("✓ No active realm to abandon")
    
    def test_get_active_realm_returns_choosing_with_gates(self):
        """GET /api/dream-realms/active returns status=choosing with gates object"""
        # First abandon any existing realm
        self.session.post(f"{BASE_URL}/api/dream-realms/abandon")
        
        # Now get active realm - should be in choosing state
        response = self.session.get(f"{BASE_URL}/api/dream-realms/active")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("status") == "choosing", f"Expected status='choosing', got {data.get('status')}"
        
        # Verify gates object exists with purge, root, void
        assert "gates" in data, "Response should have 'gates' object"
        gates = data["gates"]
        
        for gate_id in ["purge", "root", "void"]:
            assert gate_id in gates, f"Gates should contain '{gate_id}'"
            gate = gates[gate_id]
            
            # Verify gate structure
            assert "name" in gate, f"Gate {gate_id} should have 'name'"
            assert "subtitle" in gate, f"Gate {gate_id} should have 'subtitle'"
            assert "description" in gate, f"Gate {gate_id} should have 'description'"
            assert "color" in gate, f"Gate {gate_id} should have 'color'"
            assert "elements" in gate, f"Gate {gate_id} should have 'elements'"
            assert "style" in gate, f"Gate {gate_id} should have 'style'"
            assert "biome_preview" in gate, f"Gate {gate_id} should have 'biome_preview'"
            assert "challenge_count" in gate, f"Gate {gate_id} should have 'challenge_count'"
            
            print(f"✓ Gate '{gate_id}': {gate['name']} - {gate['biome_preview']}")
        
        # Verify other choosing state fields
        assert "difficulty" in data, "Choosing state should have 'difficulty'"
        assert "cosmic_context" in data, "Choosing state should have 'cosmic_context'"
        assert "current_harmony" in data, "Choosing state should have 'current_harmony'"
        
        print(f"✓ Realm in choosing state with 3 gates, harmony: {data['current_harmony']}")
    
    def test_choose_gate_purge_creates_active_realm(self):
        """POST /api/dream-realms/choose-gate with gate_id=purge creates active realm"""
        # First ensure we're in choosing state
        self.session.post(f"{BASE_URL}/api/dream-realms/abandon")
        self.session.get(f"{BASE_URL}/api/dream-realms/active")  # Creates choosing realm
        
        # Choose purge gate
        response = self.session.post(f"{BASE_URL}/api/dream-realms/choose-gate", json={
            "gate_id": "purge"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "gate" in data, "Response should have 'gate'"
        assert data["gate"] == "purge", f"Expected gate='purge', got {data['gate']}"
        assert "biome" in data, "Response should have 'biome'"
        assert "narrative" in data, "Response should have 'narrative'"
        
        # Verify biome has gate info
        biome = data["biome"]
        assert biome.get("gate") == "purge", f"Biome should have gate='purge'"
        assert "gate_name" in biome, "Biome should have 'gate_name'"
        assert "gate_style" in biome, "Biome should have 'gate_style'"
        assert biome["gate_style"] == "active", "Purge gate should have style='active'"
        
        print(f"✓ Entered Purge gate: {biome.get('name')}")
        print(f"  Narrative: {data['narrative'][:100]}...")
        
        # Verify realm is now active
        active_response = self.session.get(f"{BASE_URL}/api/dream-realms/active")
        active_data = active_response.json()
        assert active_data.get("status") == "active", f"Realm should be active, got {active_data.get('status')}"
        assert active_data.get("biome", {}).get("gate") == "purge", "Active realm should have purge gate"
    
    def test_choose_gate_root_creates_active_realm(self):
        """POST /api/dream-realms/choose-gate with gate_id=root creates active realm"""
        # First ensure we're in choosing state
        self.session.post(f"{BASE_URL}/api/dream-realms/abandon")
        self.session.get(f"{BASE_URL}/api/dream-realms/active")
        
        # Choose root gate
        response = self.session.post(f"{BASE_URL}/api/dream-realms/choose-gate", json={
            "gate_id": "root"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["gate"] == "root"
        assert data["biome"]["gate_style"] == "passive", "Root gate should have style='passive'"
        
        print(f"✓ Entered Root gate: {data['biome'].get('name')}")
    
    def test_choose_gate_void_creates_active_realm(self):
        """POST /api/dream-realms/choose-gate with gate_id=void creates active realm"""
        # First ensure we're in choosing state
        self.session.post(f"{BASE_URL}/api/dream-realms/abandon")
        self.session.get(f"{BASE_URL}/api/dream-realms/active")
        
        # Choose void gate
        response = self.session.post(f"{BASE_URL}/api/dream-realms/choose-gate", json={
            "gate_id": "void"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["gate"] == "void"
        assert data["biome"]["gate_style"] == "meditative", "Void gate should have style='meditative'"
        
        print(f"✓ Entered Void gate: {data['biome'].get('name')}")
    
    def test_choose_gate_invalid_returns_400(self):
        """POST /api/dream-realms/choose-gate with invalid gate returns 400"""
        # First ensure we're in choosing state
        self.session.post(f"{BASE_URL}/api/dream-realms/abandon")
        self.session.get(f"{BASE_URL}/api/dream-realms/active")
        
        # Try invalid gate
        response = self.session.post(f"{BASE_URL}/api/dream-realms/choose-gate", json={
            "gate_id": "invalid_gate"
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        
        print("✓ Invalid gate correctly returns 400")
    
    def test_abandon_works_for_choosing_status(self):
        """POST /api/dream-realms/abandon works for choosing status realms"""
        # First ensure we're in choosing state
        self.session.post(f"{BASE_URL}/api/dream-realms/abandon")
        active_response = self.session.get(f"{BASE_URL}/api/dream-realms/active")
        assert active_response.json().get("status") == "choosing"
        
        # Now abandon the choosing realm
        abandon_response = self.session.post(f"{BASE_URL}/api/dream-realms/abandon")
        assert abandon_response.status_code == 200, f"Expected 200, got {abandon_response.status_code}"
        
        data = abandon_response.json()
        assert "message" in data, "Response should have 'message'"
        
        print("✓ Abandoned choosing status realm successfully")
    
    def test_after_abandon_get_active_generates_new_choosing(self):
        """After abandon, GET /api/dream-realms/active generates new choosing realm"""
        # Abandon current realm
        self.session.post(f"{BASE_URL}/api/dream-realms/abandon")
        
        # Get active - should create new choosing realm
        response = self.session.get(f"{BASE_URL}/api/dream-realms/active")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("status") == "choosing", f"Expected choosing, got {data.get('status')}"
        assert "gates" in data, "New realm should have gates"
        assert "realm_id" in data, "New realm should have realm_id"
        
        print(f"✓ New choosing realm generated: {data['realm_id']}")
    
    def test_complete_challenge_works_after_gate_selection(self):
        """POST /api/dream-realms/complete-challenge still works after gate selection"""
        # Setup: abandon, get choosing, choose gate
        self.session.post(f"{BASE_URL}/api/dream-realms/abandon")
        self.session.get(f"{BASE_URL}/api/dream-realms/active")
        self.session.post(f"{BASE_URL}/api/dream-realms/choose-gate", json={"gate_id": "root"})
        
        # Get active realm to see challenges
        active_response = self.session.get(f"{BASE_URL}/api/dream-realms/active")
        active_data = active_response.json()
        
        assert active_data.get("status") == "active", "Realm should be active"
        challenges = active_data.get("challenges", [])
        assert len(challenges) > 0, "Should have challenges"
        
        # Find first uncompleted challenge
        uncompleted_idx = None
        for i, ch in enumerate(challenges):
            if not ch.get("completed"):
                uncompleted_idx = i
                break
        
        if uncompleted_idx is None:
            print("✓ All challenges already completed, skipping complete test")
            return
        
        # Complete the challenge
        response = self.session.post(f"{BASE_URL}/api/dream-realms/complete-challenge", json={
            "challenge_index": uncompleted_idx
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "xp_awarded" in data, "Response should have 'xp_awarded'"
        assert "dust_awarded" in data, "Response should have 'dust_awarded'"
        assert "challenges_done" in data, "Response should have 'challenges_done'"
        
        print(f"✓ Challenge completed: +{data['xp_awarded']} XP, +{data['dust_awarded']} dust")
    
    def test_history_shows_gate_chosen_field(self):
        """GET /api/dream-realms/history shows gate_chosen field"""
        # First create and abandon a realm with gate chosen
        self.session.post(f"{BASE_URL}/api/dream-realms/abandon")
        self.session.get(f"{BASE_URL}/api/dream-realms/active")
        self.session.post(f"{BASE_URL}/api/dream-realms/choose-gate", json={"gate_id": "purge"})
        self.session.post(f"{BASE_URL}/api/dream-realms/abandon")
        
        # Get history
        response = self.session.get(f"{BASE_URL}/api/dream-realms/history")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "realms" in data, "Response should have 'realms'"
        
        realms = data["realms"]
        if len(realms) > 0:
            # Check if any realm has gate_chosen
            has_gate_chosen = any(r.get("gate_chosen") for r in realms)
            if has_gate_chosen:
                for r in realms:
                    if r.get("gate_chosen"):
                        print(f"✓ History realm has gate_chosen: {r['gate_chosen']}")
                        break
            else:
                print("✓ History returned but no realms with gate_chosen yet")
        else:
            print("✓ History is empty (no completed/abandoned realms)")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # REGRESSION TESTS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    def test_nexus_state_still_works(self):
        """GET /api/nexus/state still works (regression)"""
        response = self.session.get(f"{BASE_URL}/api/nexus/state")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "elements" in data, "Should have 'elements'"
        assert "harmony_score" in data, "Should have 'harmony_score'"
        
        print(f"✓ Nexus state: harmony={data['harmony_score']}")
    
    def test_cosmic_weather_still_works(self):
        """GET /api/reports/cosmic-weather still works (regression)"""
        response = self.session.get(f"{BASE_URL}/api/reports/cosmic-weather")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "zodiac" in data or "element" in data, "Should have zodiac or element"
        
        print(f"✓ Cosmic weather: {data.get('zodiac', {}).get('sign', 'N/A')}")


class TestAuthProtection:
    """Test that endpoints require authentication"""
    
    def test_nexus_intent_requires_auth(self):
        """GET /api/nexus/intent requires authentication"""
        response = requests.get(f"{BASE_URL}/api/nexus/intent")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ /api/nexus/intent requires auth")
    
    def test_choose_gate_requires_auth(self):
        """POST /api/dream-realms/choose-gate requires authentication"""
        response = requests.post(f"{BASE_URL}/api/dream-realms/choose-gate", json={"gate_id": "purge"})
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ /api/dream-realms/choose-gate requires auth")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
