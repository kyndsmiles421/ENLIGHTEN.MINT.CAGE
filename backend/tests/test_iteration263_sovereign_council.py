"""
Iteration 263 - Sovereign Council (10 Members) Backend Tests
Tests the unified council with 5 Sovereign Advisors + 5 Faculty Teachers
Features: Utility tools with 10% subsidy, tier-based knowledge depth, session purchases
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"

# Expected council members
EXPECTED_ADVISORS = ["grand_architect", "master_harmonic", "principal_economist", "chief_logistics", "sovereign_ethicist"]
EXPECTED_FACULTY = ["astraeus", "zenith", "aurelius", "gaea", "vesta"]
ALL_MEMBERS = EXPECTED_ADVISORS + EXPECTED_FACULTY

# Expected utility tools (faculty only)
EXPECTED_UTILITIES = {
    "orion_engine": {"teacher": "astraeus", "base_price": 1000, "discounted": 900},
    "neural_gateway": {"teacher": "zenith", "base_price": 500, "discounted": 450},
    "iteration_vault": {"teacher": "aurelius", "base_price": 2000, "discounted": 1800},
    "terpene_analyzer": {"teacher": "gaea", "base_price": 300, "discounted": 270},
    "molecular_matrix": {"teacher": "vesta", "base_price": 800, "discounted": 720},
}


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
    """Auth headers for API requests"""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestCouncilList:
    """Tests for GET /api/sovereigns/list - 10 member council"""

    def test_list_returns_10_members(self, auth_headers):
        """Verify list returns exactly 10 council members"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "council" in data, "Response should have 'council' key"
        assert len(data["council"]) == 10, f"Expected 10 members, got {len(data['council'])}"

    def test_list_has_5_advisors(self, auth_headers):
        """Verify 5 Sovereign Advisors in council"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        data = response.json()
        
        advisors = [m for m in data["council"] if m["role_type"] == "advisor"]
        assert len(advisors) == 5, f"Expected 5 advisors, got {len(advisors)}"
        
        advisor_ids = {a["id"] for a in advisors}
        for expected_id in EXPECTED_ADVISORS:
            assert expected_id in advisor_ids, f"Missing advisor: {expected_id}"

    def test_list_has_5_faculty(self, auth_headers):
        """Verify 5 Faculty Teachers in council"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        data = response.json()
        
        faculty = [m for m in data["council"] if m["role_type"] == "faculty"]
        assert len(faculty) == 5, f"Expected 5 faculty, got {len(faculty)}"
        
        faculty_ids = {f["id"] for f in faculty}
        for expected_id in EXPECTED_FACULTY:
            assert expected_id in faculty_ids, f"Missing faculty: {expected_id}"

    def test_advisors_have_no_utility(self, auth_headers):
        """Verify advisors have utility=null"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        data = response.json()
        
        advisors = [m for m in data["council"] if m["role_type"] == "advisor"]
        for advisor in advisors:
            assert advisor.get("utility") is None, f"Advisor {advisor['id']} should have utility=null"

    def test_faculty_have_utility_objects(self, auth_headers):
        """Verify faculty members have utility objects with correct structure"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        data = response.json()
        
        faculty = [m for m in data["council"] if m["role_type"] == "faculty"]
        for member in faculty:
            util = member.get("utility")
            assert util is not None, f"Faculty {member['id']} should have utility object"
            
            # Check utility structure
            assert "id" in util, f"Utility for {member['id']} missing 'id'"
            assert "name" in util, f"Utility for {member['id']} missing 'name'"
            assert "description" in util, f"Utility for {member['id']} missing 'description'"
            assert "base_price" in util, f"Utility for {member['id']} missing 'base_price'"
            assert "discounted_price" in util, f"Utility for {member['id']} missing 'discounted_price'"
            assert "discount_pct" in util, f"Utility for {member['id']} missing 'discount_pct'"
            assert "owned" in util, f"Utility for {member['id']} missing 'owned'"
            assert "native_access" in util, f"Utility for {member['id']} missing 'native_access'"

    def test_utility_10_percent_discount(self, auth_headers):
        """Verify utility tools have 10% discount applied"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        data = response.json()
        
        faculty = [m for m in data["council"] if m["role_type"] == "faculty"]
        for member in faculty:
            util = member.get("utility")
            assert util["discount_pct"] == 10, f"Utility {util['id']} should have 10% discount"
            
            expected_discounted = int(util["base_price"] * 0.9)
            assert util["discounted_price"] == expected_discounted, \
                f"Utility {util['id']}: expected discounted {expected_discounted}, got {util['discounted_price']}"

    def test_list_returns_user_stats(self, auth_headers):
        """Verify list returns user tier, dust balance, utilities count"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        data = response.json()
        
        assert "user_tier" in data, "Response should have 'user_tier'"
        assert "dust_balance" in data, "Response should have 'dust_balance'"
        assert "utilities_owned" in data, "Response should have 'utilities_owned'"
        assert "utilities_total" in data, "Response should have 'utilities_total'"
        assert "discount_rate" in data, "Response should have 'discount_rate'"
        
        assert data["utilities_total"] == 5, f"Expected 5 total utilities, got {data['utilities_total']}"
        assert data["discount_rate"] == 10, f"Expected 10% discount rate, got {data['discount_rate']}"


class TestUtilitiesEndpoint:
    """Tests for GET /api/sovereigns/utilities - utility inventory"""

    def test_utilities_returns_5_tools(self, auth_headers):
        """Verify utilities endpoint returns all 5 tools"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/utilities", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "utilities" in data, "Response should have 'utilities' key"
        assert len(data["utilities"]) == 5, f"Expected 5 utilities, got {len(data['utilities'])}"

    def test_utilities_have_correct_structure(self, auth_headers):
        """Verify each utility has required fields"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/utilities", headers=auth_headers)
        data = response.json()
        
        for util in data["utilities"]:
            assert "id" in util
            assert "name" in util
            assert "description" in util
            assert "teacher_id" in util
            assert "teacher_name" in util
            assert "native_tier" in util
            assert "owned" in util
            assert "native_access" in util
            assert "accessible" in util

    def test_utilities_match_expected_tools(self, auth_headers):
        """Verify all expected utility tools are present"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/utilities", headers=auth_headers)
        data = response.json()
        
        util_ids = {u["id"] for u in data["utilities"]}
        for expected_id in EXPECTED_UTILITIES.keys():
            assert expected_id in util_ids, f"Missing utility: {expected_id}"


class TestPurchaseSession:
    """Tests for POST /api/sovereigns/purchase-session"""

    def test_purchase_session_for_all_members(self, auth_headers):
        """Verify purchase-session endpoint accepts all 10 member IDs"""
        for member_id in ALL_MEMBERS:
            response = requests.post(
                f"{BASE_URL}/api/sovereigns/purchase-session",
                headers=auth_headers,
                json={"sovereign_id": member_id}
            )
            # Should return 200 (free_access, already_active, or purchased)
            # or 402 (insufficient dust) - all are valid responses
            assert response.status_code in [200, 402], \
                f"Member {member_id}: Expected 200 or 402, got {response.status_code}: {response.text}"

    def test_purchase_session_invalid_member(self, auth_headers):
        """Verify 400 error for invalid member ID"""
        response = requests.post(
            f"{BASE_URL}/api/sovereigns/purchase-session",
            headers=auth_headers,
            json={"sovereign_id": "invalid_member_xyz"}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"


class TestPurchaseUtility:
    """Tests for POST /api/sovereigns/purchase-utility"""

    def test_purchase_utility_invalid_tool(self, auth_headers):
        """Verify 400 error for invalid utility ID"""
        response = requests.post(
            f"{BASE_URL}/api/sovereigns/purchase-utility",
            headers=auth_headers,
            json={"utility_id": "invalid_utility_xyz"}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"

    def test_purchase_utility_insufficient_dust(self, auth_headers):
        """Verify 402 error when user has insufficient Dust"""
        # Try to purchase the most expensive utility (iteration_vault = 1800 Dust)
        # Test user has ~121 Dust, so this should fail
        response = requests.post(
            f"{BASE_URL}/api/sovereigns/purchase-utility",
            headers=auth_headers,
            json={"utility_id": "iteration_vault"}
        )
        # Should be 402 (insufficient) or 200 (already owned/native access)
        if response.status_code == 200:
            data = response.json()
            assert data.get("status") in ["already_owned", "native_access"], \
                f"Unexpected success status: {data}"
        else:
            assert response.status_code == 402, f"Expected 402, got {response.status_code}: {response.text}"

    def test_purchase_utility_already_owned_check(self, auth_headers):
        """Verify already owned utilities return appropriate status"""
        # First check what utilities user owns
        list_response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        data = list_response.json()
        
        # Find any owned utility
        for member in data["council"]:
            util = member.get("utility")
            if util and util.get("owned"):
                # Try to purchase again
                response = requests.post(
                    f"{BASE_URL}/api/sovereigns/purchase-utility",
                    headers=auth_headers,
                    json={"utility_id": util["id"]}
                )
                assert response.status_code == 200
                result = response.json()
                assert result.get("status") == "already_owned", \
                    f"Expected 'already_owned' status, got {result}"
                return
        
        # If no owned utilities, test passes (nothing to verify)
        pytest.skip("No owned utilities to test already_owned check")


class TestChat:
    """Tests for POST /api/sovereigns/chat"""

    def test_chat_with_free_access_member(self, auth_headers):
        """Test chat with sovereign_ethicist (free for Discovery tier)"""
        response = requests.post(
            f"{BASE_URL}/api/sovereigns/chat",
            headers=auth_headers,
            json={
                "sovereign_id": "sovereign_ethicist",
                "message": "Hello, what is your role?",
                "language": "en"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "response" in data, "Chat response should have 'response' field"
        assert "sovereign_id" in data, "Chat response should have 'sovereign_id'"
        assert "knowledge_tier" in data, "Chat response should have 'knowledge_tier'"
        assert len(data["response"]) > 0, "Response should not be empty"

    def test_chat_invalid_member(self, auth_headers):
        """Verify 400 error for invalid member ID"""
        response = requests.post(
            f"{BASE_URL}/api/sovereigns/chat",
            headers=auth_headers,
            json={
                "sovereign_id": "invalid_member",
                "message": "Hello",
                "language": "en"
            }
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"

    def test_chat_empty_message(self, auth_headers):
        """Verify 400 error for empty message"""
        response = requests.post(
            f"{BASE_URL}/api/sovereigns/chat",
            headers=auth_headers,
            json={
                "sovereign_id": "sovereign_ethicist",
                "message": "",
                "language": "en"
            }
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"

    def test_chat_returns_knowledge_tier(self, auth_headers):
        """Verify chat response includes knowledge tier"""
        response = requests.post(
            f"{BASE_URL}/api/sovereigns/chat",
            headers=auth_headers,
            json={
                "sovereign_id": "sovereign_ethicist",
                "message": "What tier am I on?",
                "language": "en"
            }
        )
        if response.status_code == 200:
            data = response.json()
            assert "knowledge_tier" in data, "Response should include knowledge_tier"
            assert data["knowledge_tier"] in ["discovery", "resonance", "sovereign", "architect"]


class TestChatHistory:
    """Tests for GET/DELETE /api/sovereigns/history/{sovereign_id}"""

    def test_get_history_valid_member(self, auth_headers):
        """Test getting chat history for valid member"""
        response = requests.get(
            f"{BASE_URL}/api/sovereigns/history/sovereign_ethicist",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "messages" in data, "Response should have 'messages' key"
        assert "sovereign_id" in data, "Response should have 'sovereign_id'"
        assert isinstance(data["messages"], list), "Messages should be a list"

    def test_get_history_invalid_member(self, auth_headers):
        """Verify 400 error for invalid member ID"""
        response = requests.get(
            f"{BASE_URL}/api/sovereigns/history/invalid_member",
            headers=auth_headers
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"

    def test_delete_history_valid_member(self, auth_headers):
        """Test clearing chat history for valid member"""
        response = requests.delete(
            f"{BASE_URL}/api/sovereigns/history/sovereign_ethicist",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "cleared" in data, "Response should have 'cleared' count"
        assert "sovereign_id" in data, "Response should have 'sovereign_id'"

    def test_delete_history_invalid_member(self, auth_headers):
        """Verify 400 error for invalid member ID"""
        response = requests.delete(
            f"{BASE_URL}/api/sovereigns/history/invalid_member",
            headers=auth_headers
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"

    def test_history_for_all_10_members(self, auth_headers):
        """Verify history endpoint works for all 10 council members"""
        for member_id in ALL_MEMBERS:
            response = requests.get(
                f"{BASE_URL}/api/sovereigns/history/{member_id}",
                headers=auth_headers
            )
            assert response.status_code == 200, \
                f"History for {member_id}: Expected 200, got {response.status_code}"


class TestMemberStructure:
    """Tests for individual member data structure"""

    def test_all_members_have_required_fields(self, auth_headers):
        """Verify all members have required fields"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        data = response.json()
        
        required_fields = [
            "id", "name", "role_type", "module", "expertise", "role",
            "backstory", "linked_tier", "color", "icon",
            "has_free_access", "has_session", "session_cost"
        ]
        
        for member in data["council"]:
            for field in required_fields:
                assert field in member, f"Member {member.get('id', 'unknown')} missing field: {field}"

    def test_member_tier_mappings(self, auth_headers):
        """Verify members have correct linked_tier values"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        data = response.json()
        
        expected_tiers = {
            "grand_architect": "architect",
            "master_harmonic": "sovereign",
            "principal_economist": "resonance",
            "chief_logistics": "resonance",
            "sovereign_ethicist": "discovery",
            "astraeus": "architect",
            "zenith": "sovereign",
            "aurelius": "architect",
            "gaea": "resonance",
            "vesta": "sovereign",
        }
        
        for member in data["council"]:
            expected = expected_tiers.get(member["id"])
            if expected:
                assert member["linked_tier"] == expected, \
                    f"Member {member['id']}: expected tier {expected}, got {member['linked_tier']}"


class TestAccessControl:
    """Tests for tier-based access control"""

    def test_discovery_user_free_access_to_ethicist(self, auth_headers):
        """Verify Discovery tier user has free access to sovereign_ethicist"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        data = response.json()
        
        # Test user is on Discovery tier
        assert data["user_tier"] == "discovery", f"Expected discovery tier, got {data['user_tier']}"
        
        # Find sovereign_ethicist
        ethicist = next((m for m in data["council"] if m["id"] == "sovereign_ethicist"), None)
        assert ethicist is not None, "sovereign_ethicist not found"
        assert ethicist["has_free_access"] == True, "Discovery user should have free access to ethicist"

    def test_locked_members_show_session_cost(self, auth_headers):
        """Verify locked members show 50 Dust session cost"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list", headers=auth_headers)
        data = response.json()
        
        for member in data["council"]:
            if not member["has_free_access"] and not member["has_session"]:
                assert member["session_cost"] == 50, \
                    f"Member {member['id']}: expected session_cost 50, got {member['session_cost']}"
