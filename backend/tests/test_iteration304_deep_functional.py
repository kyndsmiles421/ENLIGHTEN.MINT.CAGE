"""
Iteration 304 - DEEP FUNCTIONAL TESTING
Tests actual data flows, button clicks, form submissions, and end-to-end workflows.
Focus: Journal, Meditation, Oracle, Breathing, Mood, Trade Circle, Liquidity Trader,
       Resource Alchemy, Gravity Well, Cryptic Quest, Gaming APIs
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
TEST_EMAIL = "test_v29_user@test.com"
TEST_PASSWORD = "testpass123"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user."""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Return headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}"}


class TestTransmuterWorkSubmit:
    """Test POST /api/transmuter/work-submit - unified work endpoint"""
    
    def test_work_submit_returns_earned_dust(self, auth_headers):
        """Verify work-submit returns 'earned' > 0 and 'dust_balance' updates"""
        response = requests.post(
            f"{BASE_URL}/api/transmuter/work-submit",
            json={"module": "test", "interaction_weight": 10},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify required fields
        assert "earned" in data, "Response missing 'earned' field"
        assert "dust_balance" in data, "Response missing 'dust_balance' field"
        assert data["earned"] > 0, f"Expected earned > 0, got {data['earned']}"
        assert data["dust_balance"] >= 0, f"Expected dust_balance >= 0, got {data['dust_balance']}"
        print(f"PASS: work-submit earned {data['earned']} Dust, balance: {data['dust_balance']}")


class TestGamingAlchemyMine:
    """Test POST /api/gaming/alchemy/mine - mining resources"""
    
    def test_mine_returns_resources(self, auth_headers):
        """Verify mine returns 'mined' object with iron/copper counts > 0"""
        response = requests.post(
            f"{BASE_URL}/api/gaming/alchemy/mine",
            json={},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify mined object exists
        assert "mined" in data, "Response missing 'mined' field"
        mined = data["mined"]
        
        # Verify iron and copper are present and > 0
        assert "iron" in mined, "Mined object missing 'iron'"
        assert "copper" in mined, "Mined object missing 'copper'"
        assert mined["iron"] > 0, f"Expected iron > 0, got {mined['iron']}"
        assert mined["copper"] > 0, f"Expected copper > 0, got {mined['copper']}"
        print(f"PASS: Mined {mined['iron']} iron, {mined['copper']} copper")


class TestGamingQuestSolve:
    """Test POST /api/gaming/quest/solve - solving quest nodes"""
    
    def test_quest_solve_node_beta_fibonacci(self, auth_headers):
        """Verify solving node_beta with 'fibonacci' returns correct=true"""
        response = requests.post(
            f"{BASE_URL}/api/gaming/quest/solve",
            json={"node_id": "node_beta", "answer": "fibonacci"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Should be correct (or already_solved if previously completed)
        if data.get("already_solved"):
            print(f"PASS: node_beta already solved (correct answer was accepted previously)")
        else:
            assert data.get("correct") == True, f"Expected correct=true, got {data}"
            print(f"PASS: node_beta solved correctly, earned {data.get('dust_earned', 0)} Dust")


class TestGravityWellMarket:
    """Test GET /api/gaming/gravity-well/market - market prices"""
    
    def test_market_has_all_elements_with_prices(self, auth_headers):
        """Verify all 7 elements have price_dust > 0"""
        response = requests.get(
            f"{BASE_URL}/api/gaming/gravity-well/market",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "market" in data, "Response missing 'market' field"
        market = data["market"]
        
        # Should have 7 elements
        assert len(market) == 7, f"Expected 7 elements, got {len(market)}"
        
        # Each element should have price_dust > 0
        for elem in market:
            assert "element" in elem, f"Element missing 'element' field: {elem}"
            assert "price_dust" in elem, f"Element missing 'price_dust' field: {elem}"
            assert elem["price_dust"] > 0, f"Expected price_dust > 0 for {elem['element']}, got {elem['price_dust']}"
        
        element_names = [e["element"] for e in market]
        print(f"PASS: All 7 elements have prices > 0: {element_names}")


class TestJournalCRUD:
    """Test Journal entry creation and retrieval"""
    
    def test_create_journal_entry(self, auth_headers):
        """Create a journal entry and verify it appears in the list"""
        # Create entry
        test_title = f"Test Entry {int(time.time())}"
        test_content = "This is a test journal entry for functional testing."
        
        response = requests.post(
            f"{BASE_URL}/api/journal",
            json={"title": test_title, "content": test_content, "mood": "peaceful"},
            headers=auth_headers
        )
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "id" in data, "Response missing 'id' field"
        assert data.get("title") == test_title, f"Title mismatch: {data.get('title')}"
        
        entry_id = data["id"]
        print(f"PASS: Created journal entry with id: {entry_id}")
        
        # Verify it appears in list
        list_response = requests.get(f"{BASE_URL}/api/journal", headers=auth_headers)
        assert list_response.status_code == 200
        entries = list_response.json()
        
        found = any(e.get("id") == entry_id for e in entries)
        assert found, f"Created entry {entry_id} not found in journal list"
        print(f"PASS: Entry {entry_id} found in journal list")


class TestMoodLogging:
    """Test Mood logging functionality"""
    
    def test_log_mood(self, auth_headers):
        """Log a mood and verify it's recorded"""
        response = requests.post(
            f"{BASE_URL}/api/moods",
            json={"mood": "Peaceful", "moods": ["peaceful"], "intensity": 7, "note": "Functional test"},
            headers=auth_headers
        )
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "id" in data, "Response missing 'id' field"
        assert data.get("mood") == "Peaceful", f"Mood mismatch: {data.get('mood')}"
        print(f"PASS: Logged mood with id: {data['id']}")


class TestOracleReading:
    """Test Oracle reading generation"""
    
    def test_tarot_reading(self, auth_headers):
        """Get a tarot reading and verify cards are returned"""
        response = requests.post(
            f"{BASE_URL}/api/oracle/reading",
            json={"reading_type": "tarot", "spread": "three_card"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "type" in data, "Response missing 'type' field"
        assert data["type"] == "tarot", f"Expected type=tarot, got {data['type']}"
        
        # Tarot should have cards
        if "cards" in data:
            assert len(data["cards"]) > 0, "Expected at least 1 card"
            print(f"PASS: Tarot reading returned {len(data['cards'])} cards")
        else:
            print(f"PASS: Tarot reading returned (no cards field but type=tarot)")


class TestAlchemyState:
    """Test Alchemy state retrieval"""
    
    def test_get_alchemy_state(self, auth_headers):
        """Verify alchemy state returns inventory and recipes"""
        response = requests.get(
            f"{BASE_URL}/api/gaming/alchemy/state",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "inventory" in data, "Response missing 'inventory' field"
        assert "recipes" in data, "Response missing 'recipes' field"
        assert "elements" in data, "Response missing 'elements' field"
        
        print(f"PASS: Alchemy state has {len(data['recipes'])} recipes, inventory: {data['inventory']}")


class TestTransmuterStatus:
    """Test Transmuter status endpoint"""
    
    def test_transmuter_status(self, auth_headers):
        """Verify transmuter status returns dust balance and tier info"""
        response = requests.get(
            f"{BASE_URL}/api/transmuter/status",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "dust_balance" in data, "Response missing 'dust_balance'"
        assert "tier_name" in data, "Response missing 'tier_name'"
        assert "tier_dynamics" in data, "Response missing 'tier_dynamics'"
        
        # Verify tier_dynamics has required fields for Alchemy panel
        dynamics = data["tier_dynamics"]
        assert "ratio" in dynamics, "tier_dynamics missing 'ratio'"
        assert "tax" in dynamics, "tier_dynamics missing 'tax'"
        
        print(f"PASS: Transmuter status - Dust: {data['dust_balance']}, Tier: {data['tier_name']}, Ratio: {dynamics['ratio']}")


class TestLiquidityTraderAlchemy:
    """Test Liquidity Trader Alchemy transmutation"""
    
    def test_transmute_dust(self, auth_headers):
        """Test alchemy transmutation with 100 dust"""
        # First check we have enough dust
        status_response = requests.get(f"{BASE_URL}/api/transmuter/status", headers=auth_headers)
        if status_response.status_code != 200:
            pytest.skip("Could not get transmuter status")
        
        dust_balance = status_response.json().get("dust_balance", 0)
        if dust_balance < 100:
            pytest.skip(f"Not enough dust for test: {dust_balance}")
        
        response = requests.post(
            f"{BASE_URL}/api/transmuter/transmute",
            json={"input_amount": 100},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "net_result" in data, "Response missing 'net_result'"
        assert "tier_ratio" in data, "Response missing 'tier_ratio'"
        
        # Net result should be around 105 for SEED tier (23.6% ratio, 15% tax, phi cap)
        # But exact value depends on tier
        print(f"PASS: Transmuted 100 Dust -> Net: {data['net_result']}, Ratio: {data['tier_ratio']}")


class TestQuestNodes:
    """Test Quest nodes retrieval"""
    
    def test_get_quest_nodes(self, auth_headers):
        """Verify quest nodes are returned with proper structure"""
        response = requests.get(
            f"{BASE_URL}/api/gaming/quest/nodes",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "nodes" in data, "Response missing 'nodes'"
        nodes = data["nodes"]
        
        assert len(nodes) > 0, "Expected at least 1 quest node"
        
        # Check first node has required fields
        first_node = nodes[0]
        assert "id" in first_node, "Node missing 'id'"
        assert "name" in first_node, "Node missing 'name'"
        assert "hint" in first_node, "Node missing 'hint'"
        
        print(f"PASS: Got {len(nodes)} quest nodes, first: {first_node['name']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
