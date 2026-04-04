"""
Iteration 264 - SmartDock Consult Overlay Tests
Tests for the Sovereign Council chat integration via SmartDock Consult button.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://zero-scale-physics.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user."""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        return data.get("token") or data.get("access_token")
    pytest.skip(f"Authentication failed: {response.status_code}")


@pytest.fixture
def auth_headers(auth_token):
    """Get auth headers for API calls."""
    return {"Authorization": f"Bearer {auth_token}"}


class TestSovereignsList:
    """Tests for GET /api/sovereigns/list endpoint."""
    
    def test_list_returns_10_members(self, auth_headers):
        """Verify all 10 council members are returned."""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "council" in data
        assert len(data["council"]) == 10
        print(f"SUCCESS: Found {len(data['council'])} council members")
    
    def test_list_contains_5_advisors_5_faculty(self, auth_headers):
        """Verify 5 advisors and 5 faculty members."""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        advisors = [m for m in data["council"] if m["role_type"] == "advisor"]
        faculty = [m for m in data["council"] if m["role_type"] == "faculty"]
        
        assert len(advisors) == 5, f"Expected 5 advisors, got {len(advisors)}"
        assert len(faculty) == 5, f"Expected 5 faculty, got {len(faculty)}"
        print(f"SUCCESS: 5 advisors and 5 faculty verified")
    
    def test_list_member_structure(self, auth_headers):
        """Verify each member has required fields."""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["id", "name", "role_type", "module", "color", "icon", 
                          "has_free_access", "has_session", "session_cost"]
        
        for member in data["council"]:
            for field in required_fields:
                assert field in member, f"Missing field '{field}' in member {member.get('id')}"
        print("SUCCESS: All members have required fields")
    
    def test_faculty_have_utility_objects(self, auth_headers):
        """Verify faculty members have utility tool objects."""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        faculty = [m for m in data["council"] if m["role_type"] == "faculty"]
        for member in faculty:
            assert member.get("utility") is not None, f"Faculty {member['id']} missing utility"
            util = member["utility"]
            assert "id" in util
            assert "name" in util
            assert "base_price" in util
            assert "discounted_price" in util
            assert "discount_pct" in util
            assert util["discount_pct"] == 10, f"Expected 10% discount, got {util['discount_pct']}%"
        print("SUCCESS: All faculty have utility objects with 10% discount")
    
    def test_advisors_have_no_utility(self, auth_headers):
        """Verify advisors don't have utility tools."""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        advisors = [m for m in data["council"] if m["role_type"] == "advisor"]
        for member in advisors:
            assert member.get("utility") is None, f"Advisor {member['id']} should not have utility"
        print("SUCCESS: Advisors have no utility tools")


class TestSovereignsChat:
    """Tests for POST /api/sovereigns/chat endpoint."""
    
    def test_chat_with_sovereign_ethicist(self, auth_headers):
        """Test chat with Sovereign Ethicist (default for dashboard)."""
        response = requests.post(f"{BASE_URL}/api/sovereigns/chat", 
            headers={**auth_headers, "Content-Type": "application/json"},
            json={
                "sovereign_id": "sovereign_ethicist",
                "message": "What is your expertise?",
                "language": "en"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "sovereign_id" in data
        assert data["sovereign_id"] == "sovereign_ethicist"
        assert len(data["response"]) > 0
        print(f"SUCCESS: Chat response received ({len(data['response'])} chars)")
    
    def test_chat_with_principal_economist(self, auth_headers):
        """Test chat with Principal Economist (context for /economy page)."""
        response = requests.post(f"{BASE_URL}/api/sovereigns/chat",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={
                "sovereign_id": "principal_economist",
                "message": "Tell me about Dust economics",
                "language": "en"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert data["sovereign_id"] == "principal_economist"
        print("SUCCESS: Principal Economist chat working")
    
    def test_chat_returns_knowledge_tier(self, auth_headers):
        """Verify chat response includes knowledge tier."""
        response = requests.post(f"{BASE_URL}/api/sovereigns/chat",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={
                "sovereign_id": "sovereign_ethicist",
                "message": "Hello",
                "language": "en"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "knowledge_tier" in data
        print(f"SUCCESS: Knowledge tier returned: {data['knowledge_tier']}")
    
    def test_chat_invalid_sovereign_returns_400(self, auth_headers):
        """Test chat with invalid sovereign ID."""
        response = requests.post(f"{BASE_URL}/api/sovereigns/chat",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={
                "sovereign_id": "invalid_member",
                "message": "Hello",
                "language": "en"
            }
        )
        assert response.status_code == 400
        print("SUCCESS: Invalid sovereign returns 400")
    
    def test_chat_empty_message_returns_400(self, auth_headers):
        """Test chat with empty message."""
        response = requests.post(f"{BASE_URL}/api/sovereigns/chat",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={
                "sovereign_id": "sovereign_ethicist",
                "message": "",
                "language": "en"
            }
        )
        assert response.status_code == 400
        print("SUCCESS: Empty message returns 400")


class TestSovereignsHistory:
    """Tests for GET/DELETE /api/sovereigns/history/{sovereign_id}."""
    
    def test_get_history(self, auth_headers):
        """Test getting chat history."""
        response = requests.get(f"{BASE_URL}/api/sovereigns/history/sovereign_ethicist",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "messages" in data
        assert "sovereign_id" in data
        print(f"SUCCESS: History retrieved ({len(data['messages'])} messages)")
    
    def test_get_history_invalid_sovereign(self, auth_headers):
        """Test getting history for invalid sovereign."""
        response = requests.get(f"{BASE_URL}/api/sovereigns/history/invalid_member",
            headers=auth_headers
        )
        assert response.status_code == 400
        print("SUCCESS: Invalid sovereign history returns 400")


class TestSovereignsUtilities:
    """Tests for utility-related endpoints."""
    
    def test_get_utilities(self, auth_headers):
        """Test getting owned utilities."""
        response = requests.get(f"{BASE_URL}/api/sovereigns/utilities",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "utilities" in data
        assert len(data["utilities"]) == 5  # 5 utility tools
        print(f"SUCCESS: Utilities endpoint returns {len(data['utilities'])} tools")
    
    def test_purchase_utility_insufficient_dust(self, auth_headers):
        """Test purchasing utility with insufficient Dust."""
        response = requests.post(f"{BASE_URL}/api/sovereigns/purchase-utility",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"utility_id": "orion_engine"}  # 900 Dust (1000 - 10%)
        )
        # Should return 402 (insufficient funds) or already_owned/native_access
        assert response.status_code in [200, 402]
        data = response.json()
        if response.status_code == 402:
            print("SUCCESS: Insufficient Dust returns 402")
        else:
            print(f"SUCCESS: Utility status: {data.get('status')}")


class TestContextAwareSovereigns:
    """Tests for context-aware sovereign selection mapping."""
    
    def test_page_sovereign_mapping(self, auth_headers):
        """Verify PAGE_SOVEREIGN_MAP routes are correct."""
        # These mappings are defined in SovereignConsultOverlay.js
        expected_mappings = {
            "/economy": "principal_economist",
            "/star-chart": "astraeus",
            "/wellness": "zenith",
            "/garden": "gaea",
            "/community": "sovereign_ethicist",
        }
        
        # Verify all mapped sovereigns exist
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        member_ids = {m["id"] for m in data["council"]}
        
        for route, sovereign_id in expected_mappings.items():
            assert sovereign_id in member_ids, f"Sovereign {sovereign_id} for route {route} not found"
        
        print("SUCCESS: All context-aware sovereign mappings are valid")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
