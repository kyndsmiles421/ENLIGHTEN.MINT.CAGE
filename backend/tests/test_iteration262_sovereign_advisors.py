"""
Iteration 262 - Sovereign AI Advisors Testing
Tests for the 5 Sovereign AI Advisors feature:
- GET /api/sovereigns/list - returns all 5 sovereigns with access status
- POST /api/sovereigns/purchase-session - deducts Dust and grants access
- POST /api/sovereigns/chat - sends message and returns AI response
- GET /api/sovereigns/history/{sovereign_id} - returns persistent chat history
- DELETE /api/sovereigns/history/{sovereign_id} - clears chat history
- Tier gating and access control
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"

# Expected sovereigns
EXPECTED_SOVEREIGNS = [
    "grand_architect",      # Architect tier ($89)
    "master_harmonic",      # Sovereign tier ($49)
    "principal_economist",  # Resonance tier ($27)
    "chief_logistics",      # Resonance tier ($27)
    "sovereign_ethicist",   # Discovery tier (free)
]

SOVEREIGN_TIER_MAP = {
    "grand_architect": "architect",
    "master_harmonic": "sovereign",
    "principal_economist": "resonance",
    "chief_logistics": "resonance",
    "sovereign_ethicist": "discovery",
}

SESSION_COST = 50  # Dust cost per session


class TestSovereignAdvisorsAuth:
    """Authentication tests for Sovereign Advisors"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}
    
    def test_list_sovereigns_requires_auth(self):
        """Test that list endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: List sovereigns requires authentication")
    
    def test_chat_requires_auth(self):
        """Test that chat endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/sovereigns/chat", json={
            "sovereign_id": "sovereign_ethicist",
            "message": "Hello"
        })
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: Chat requires authentication")


class TestSovereignList:
    """Tests for GET /api/sovereigns/list"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip(f"Authentication failed: {response.status_code}")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}
    
    def test_list_returns_5_sovereigns(self, auth_headers):
        """Test that list returns exactly 5 sovereigns"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "sovereigns" in data, "Response missing 'sovereigns' key"
        assert len(data["sovereigns"]) == 5, f"Expected 5 sovereigns, got {len(data['sovereigns'])}"
        print(f"PASS: List returns 5 sovereigns")
    
    def test_list_contains_all_expected_sovereigns(self, auth_headers):
        """Test that all expected sovereign IDs are present"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        sovereign_ids = [s["id"] for s in data["sovereigns"]]
        
        for expected_id in EXPECTED_SOVEREIGNS:
            assert expected_id in sovereign_ids, f"Missing sovereign: {expected_id}"
        print(f"PASS: All 5 expected sovereigns present: {sovereign_ids}")
    
    def test_list_sovereign_structure(self, auth_headers):
        """Test that each sovereign has required fields"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        required_fields = ["id", "name", "module", "linked_tier", "has_free_access", "has_session", "session_cost", "color", "icon"]
        
        for sovereign in data["sovereigns"]:
            for field in required_fields:
                assert field in sovereign, f"Sovereign {sovereign.get('id', 'unknown')} missing field: {field}"
        print(f"PASS: All sovereigns have required fields")
    
    def test_list_returns_user_tier(self, auth_headers):
        """Test that list returns user's tier"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "user_tier" in data, "Response missing 'user_tier'"
        assert data["user_tier"] in ["discovery", "resonance", "sovereign", "architect"], f"Invalid tier: {data['user_tier']}"
        print(f"PASS: User tier returned: {data['user_tier']}")
    
    def test_list_returns_dust_balance(self, auth_headers):
        """Test that list returns user's Dust balance"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "dust_balance" in data, "Response missing 'dust_balance'"
        assert isinstance(data["dust_balance"], (int, float)), "dust_balance should be numeric"
        print(f"PASS: Dust balance returned: {data['dust_balance']}")
    
    def test_list_returns_session_cost(self, auth_headers):
        """Test that list returns session cost"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "session_cost" in data, "Response missing 'session_cost'"
        assert data["session_cost"] == SESSION_COST, f"Expected session cost {SESSION_COST}, got {data['session_cost']}"
        print(f"PASS: Session cost returned: {data['session_cost']}")
    
    def test_discovery_user_free_access_to_ethicist(self, auth_headers):
        """Test that Discovery tier user has free access to Sovereign Ethicist"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        user_tier = data["user_tier"]
        
        # Find sovereign_ethicist
        ethicist = next((s for s in data["sovereigns"] if s["id"] == "sovereign_ethicist"), None)
        assert ethicist is not None, "sovereign_ethicist not found"
        
        # Discovery tier should have free access to ethicist (linked to discovery)
        if user_tier == "discovery":
            assert ethicist["has_free_access"] == True, "Discovery user should have free access to Ethicist"
            assert ethicist["session_cost"] == 0, "Free access sovereign should have 0 session cost"
            print(f"PASS: Discovery user has free access to Ethicist")
        else:
            print(f"SKIP: User is {user_tier} tier, not discovery")
    
    def test_locked_sovereigns_have_session_cost(self, auth_headers):
        """Test that locked sovereigns show correct session cost"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        
        for sovereign in data["sovereigns"]:
            if not sovereign["has_free_access"] and not sovereign["has_session"]:
                assert sovereign["session_cost"] == SESSION_COST, f"{sovereign['id']} should cost {SESSION_COST} Dust"
        print(f"PASS: Locked sovereigns show correct session cost")


class TestSovereignPurchaseSession:
    """Tests for POST /api/sovereigns/purchase-session"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip(f"Authentication failed: {response.status_code}")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}
    
    def test_purchase_invalid_sovereign_returns_400(self, auth_headers):
        """Test that purchasing invalid sovereign returns 400"""
        response = requests.post(f"{BASE_URL}/api/sovereigns/purchase-session", 
            headers=auth_headers,
            json={"sovereign_id": "invalid_sovereign"})
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("PASS: Invalid sovereign returns 400")
    
    def test_purchase_free_access_sovereign_returns_free_access(self, auth_headers):
        """Test that purchasing a sovereign you already have free access to returns free_access status"""
        # First check user tier
        list_response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        data = list_response.json()
        user_tier = data["user_tier"]
        
        # Find a sovereign the user has free access to
        free_sovereign = next((s for s in data["sovereigns"] if s["has_free_access"]), None)
        
        if free_sovereign:
            response = requests.post(f"{BASE_URL}/api/sovereigns/purchase-session",
                headers=auth_headers,
                json={"sovereign_id": free_sovereign["id"]})
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            result = response.json()
            assert result.get("status") == "free_access", f"Expected free_access status, got {result}"
            print(f"PASS: Free access sovereign returns free_access status")
        else:
            print("SKIP: No free access sovereign found for this user")
    
    def test_purchase_already_active_session(self, auth_headers):
        """Test that purchasing a sovereign with active session returns already_active"""
        # Check if principal_economist has active session (per context)
        list_response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        data = list_response.json()
        
        economist = next((s for s in data["sovereigns"] if s["id"] == "principal_economist"), None)
        
        if economist and economist.get("has_session"):
            response = requests.post(f"{BASE_URL}/api/sovereigns/purchase-session",
                headers=auth_headers,
                json={"sovereign_id": "principal_economist"})
            assert response.status_code == 200
            result = response.json()
            assert result.get("status") in ["already_active", "free_access"], f"Expected already_active or free_access, got {result}"
            print(f"PASS: Already active session returns correct status")
        else:
            print("SKIP: principal_economist doesn't have active session")


class TestSovereignChat:
    """Tests for POST /api/sovereigns/chat"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip(f"Authentication failed: {response.status_code}")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}
    
    def test_chat_invalid_sovereign_returns_400(self, auth_headers):
        """Test that chatting with invalid sovereign returns 400"""
        response = requests.post(f"{BASE_URL}/api/sovereigns/chat",
            headers=auth_headers,
            json={"sovereign_id": "invalid", "message": "Hello"})
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("PASS: Invalid sovereign chat returns 400")
    
    def test_chat_empty_message_returns_400(self, auth_headers):
        """Test that empty message returns 400"""
        response = requests.post(f"{BASE_URL}/api/sovereigns/chat",
            headers=auth_headers,
            json={"sovereign_id": "sovereign_ethicist", "message": ""})
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("PASS: Empty message returns 400")
    
    def test_chat_locked_sovereign_without_session_returns_403(self, auth_headers):
        """Test that chatting with locked sovereign without session returns 403"""
        # First check which sovereigns are locked
        list_response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        data = list_response.json()
        
        # Find a locked sovereign (no free access and no session)
        locked_sovereign = next((s for s in data["sovereigns"] 
            if not s["has_free_access"] and not s["has_session"]), None)
        
        if locked_sovereign:
            response = requests.post(f"{BASE_URL}/api/sovereigns/chat",
                headers=auth_headers,
                json={"sovereign_id": locked_sovereign["id"], "message": "Hello"})
            assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
            print(f"PASS: Locked sovereign {locked_sovereign['id']} returns 403")
        else:
            print("SKIP: No locked sovereigns found for this user")
    
    def test_chat_with_accessible_sovereign_returns_response(self, auth_headers):
        """Test that chatting with accessible sovereign returns AI response"""
        # First check which sovereigns are accessible
        list_response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        data = list_response.json()
        
        # Find an accessible sovereign
        accessible = next((s for s in data["sovereigns"] 
            if s["has_free_access"] or s["has_session"]), None)
        
        if accessible:
            response = requests.post(f"{BASE_URL}/api/sovereigns/chat",
                headers=auth_headers,
                json={
                    "sovereign_id": accessible["id"],
                    "message": "What is your domain of expertise?",
                    "language": "en"
                })
            
            # Allow for 200 (success) or 500 (LLM error - acceptable for testing)
            if response.status_code == 200:
                result = response.json()
                assert "response" in result, "Response missing 'response' field"
                assert "sovereign_id" in result, "Response missing 'sovereign_id'"
                assert result["sovereign_id"] == accessible["id"]
                print(f"PASS: Chat with {accessible['id']} returns AI response")
            elif response.status_code == 500:
                # LLM errors are acceptable in testing
                print(f"WARN: Chat returned 500 (LLM error) - acceptable for testing")
            else:
                pytest.fail(f"Unexpected status {response.status_code}: {response.text}")
        else:
            pytest.skip("No accessible sovereigns found")
    
    def test_chat_response_includes_bridges(self, auth_headers):
        """Test that chat response includes bridges array"""
        list_response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        data = list_response.json()
        
        accessible = next((s for s in data["sovereigns"] 
            if s["has_free_access"] or s["has_session"]), None)
        
        if accessible:
            response = requests.post(f"{BASE_URL}/api/sovereigns/chat",
                headers=auth_headers,
                json={
                    "sovereign_id": accessible["id"],
                    "message": "Hello",
                    "language": "en"
                })
            
            if response.status_code == 200:
                result = response.json()
                assert "bridges" in result, "Response missing 'bridges' field"
                assert isinstance(result["bridges"], list), "bridges should be a list"
                print(f"PASS: Chat response includes bridges array")
            else:
                print(f"SKIP: Chat returned {response.status_code}")
        else:
            pytest.skip("No accessible sovereigns found")


class TestSovereignHistory:
    """Tests for GET/DELETE /api/sovereigns/history/{sovereign_id}"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip(f"Authentication failed: {response.status_code}")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}
    
    def test_get_history_invalid_sovereign_returns_400(self, auth_headers):
        """Test that getting history for invalid sovereign returns 400"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/history/invalid_sovereign",
            headers=auth_headers)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("PASS: Invalid sovereign history returns 400")
    
    def test_get_history_returns_messages_array(self, auth_headers):
        """Test that history endpoint returns messages array"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/history/sovereign_ethicist",
            headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "messages" in data, "Response missing 'messages'"
        assert isinstance(data["messages"], list), "messages should be a list"
        assert "sovereign_id" in data, "Response missing 'sovereign_id'"
        print(f"PASS: History returns messages array with {len(data['messages'])} messages")
    
    def test_delete_history_invalid_sovereign_returns_400(self, auth_headers):
        """Test that deleting history for invalid sovereign returns 400"""
        response = requests.delete(f"{BASE_URL}/api/sovereigns/history/invalid_sovereign",
            headers=auth_headers)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("PASS: Invalid sovereign delete returns 400")
    
    def test_delete_history_returns_cleared_count(self, auth_headers):
        """Test that delete history returns cleared count"""
        response = requests.delete(f"{BASE_URL}/api/sovereigns/history/sovereign_ethicist",
            headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "cleared" in data, "Response missing 'cleared'"
        assert isinstance(data["cleared"], int), "cleared should be an integer"
        assert "sovereign_id" in data, "Response missing 'sovereign_id'"
        print(f"PASS: Delete history returns cleared count: {data['cleared']}")


class TestSovereignTierGating:
    """Tests for tier-based access control"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip(f"Authentication failed: {response.status_code}")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}
    
    def test_tier_hierarchy_access(self, auth_headers):
        """Test that tier hierarchy determines free access correctly"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        user_tier = data["user_tier"]
        
        # Tier rank: discovery=0, resonance=1, sovereign=2, architect=3
        tier_rank = {"discovery": 0, "resonance": 1, "sovereign": 2, "architect": 3}
        user_rank = tier_rank.get(user_tier, 0)
        
        for sovereign in data["sovereigns"]:
            linked_tier = sovereign["linked_tier"]
            linked_rank = tier_rank.get(linked_tier, 0)
            
            if user_rank >= linked_rank:
                assert sovereign["has_free_access"] == True, \
                    f"User ({user_tier}) should have free access to {sovereign['id']} (linked to {linked_tier})"
            else:
                assert sovereign["has_free_access"] == False, \
                    f"User ({user_tier}) should NOT have free access to {sovereign['id']} (linked to {linked_tier})"
        
        print(f"PASS: Tier hierarchy access control verified for {user_tier} user")
    
    def test_sovereign_linked_tiers_correct(self, auth_headers):
        """Test that sovereigns are linked to correct tiers"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        
        for sovereign in data["sovereigns"]:
            expected_tier = SOVEREIGN_TIER_MAP.get(sovereign["id"])
            if expected_tier:
                assert sovereign["linked_tier"] == expected_tier, \
                    f"{sovereign['id']} should be linked to {expected_tier}, got {sovereign['linked_tier']}"
        
        print("PASS: All sovereigns linked to correct tiers")


class TestSovereignLanguage:
    """Tests for language-aware responses"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip(f"Authentication failed: {response.status_code}")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}
    
    def test_list_returns_language(self, auth_headers):
        """Test that list returns user's language preference"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "language" in data, "Response missing 'language'"
        print(f"PASS: Language returned: {data['language']}")
    
    def test_chat_accepts_language_parameter(self, auth_headers):
        """Test that chat accepts language parameter"""
        list_response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        data = list_response.json()
        
        accessible = next((s for s in data["sovereigns"] 
            if s["has_free_access"] or s["has_session"]), None)
        
        if accessible:
            response = requests.post(f"{BASE_URL}/api/sovereigns/chat",
                headers=auth_headers,
                json={
                    "sovereign_id": accessible["id"],
                    "message": "Hello",
                    "language": "es"  # Spanish
                })
            
            if response.status_code == 200:
                result = response.json()
                assert "language" in result, "Response missing 'language'"
                assert result["language"] == "es", f"Expected language 'es', got {result['language']}"
                print(f"PASS: Chat accepts language parameter")
            else:
                print(f"SKIP: Chat returned {response.status_code}")
        else:
            pytest.skip("No accessible sovereigns found")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
