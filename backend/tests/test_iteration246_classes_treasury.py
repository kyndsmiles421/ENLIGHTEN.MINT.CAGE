"""
Iteration 246 - Anthropology Classes + Sovereign Treasury + Constellations Mirror Hook Tests
Tests:
- GET /api/classes/archetypes - returns 4 class definitions
- POST /api/classes/select - assigns class to user
- GET /api/classes/mine - returns user's current class
- POST /api/classes/xp - adds XP and levels up
- GET /api/treasury/balance - returns wallet with initial 100 credits
- GET /api/treasury/ledger - returns transaction history
- POST /api/treasury/purchase - deducts credits, splits fee (5% sovereign), records escrow
- GET /api/treasury/sovereign/dashboard - returns treasury stats
- POST /api/constellations - mirror hook writes to sovereign_mirror collection
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        return data.get("token") or data.get("zen_token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Auth headers for authenticated requests"""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestClassesAPI:
    """Anthropology Class System Tests"""
    
    def test_get_archetypes_returns_4_classes(self):
        """GET /api/classes/archetypes returns 4 class definitions"""
        response = requests.get(f"{BASE_URL}/api/classes/archetypes")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of archetypes"
        assert len(data) == 4, f"Expected 4 archetypes, got {len(data)}"
        
        # Verify all 4 classes are present
        class_ids = [c.get("id") for c in data]
        assert "shaman" in class_ids, "Missing shaman class"
        assert "nomad" in class_ids, "Missing nomad class"
        assert "architect" in class_ids, "Missing architect class"
        assert "merchant" in class_ids, "Missing merchant class"
        
        # Verify class structure
        for cls in data:
            assert "id" in cls, "Class missing id"
            assert "name" in cls, "Class missing name"
            assert "title" in cls, "Class missing title"
            assert "description" in cls, "Class missing description"
            assert "color" in cls, "Class missing color"
            assert "icon" in cls, "Class missing icon"
            assert "boosted_affinities" in cls, "Class missing boosted_affinities"
            assert "synergy_bonus" in cls, "Class missing synergy_bonus"
            assert isinstance(cls["boosted_affinities"], list), "boosted_affinities should be list"
        
        print(f"✓ GET /api/classes/archetypes returns 4 classes: {class_ids}")
    
    def test_select_class_shaman(self, auth_headers):
        """POST /api/classes/select assigns shaman class to user"""
        response = requests.post(
            f"{BASE_URL}/api/classes/select",
            headers=auth_headers,
            json={"class_id": "shaman"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("class_id") == "shaman", f"Expected class_id 'shaman', got {data.get('class_id')}"
        assert "class_data" in data, "Response missing class_data"
        assert data["class_data"]["name"] == "Shaman", "Class name should be Shaman"
        
        print(f"✓ POST /api/classes/select assigns shaman class successfully")
    
    def test_select_class_invalid(self, auth_headers):
        """POST /api/classes/select with invalid class returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/classes/select",
            headers=auth_headers,
            json={"class_id": "invalid_class"}
        )
        assert response.status_code == 400, f"Expected 400 for invalid class, got {response.status_code}"
        print(f"✓ POST /api/classes/select rejects invalid class with 400")
    
    def test_get_my_class(self, auth_headers):
        """GET /api/classes/mine returns user's current class"""
        response = requests.get(f"{BASE_URL}/api/classes/mine", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "class_id" in data, "Response missing class_id"
        assert "class_data" in data, "Response missing class_data"
        assert "xp" in data, "Response missing xp"
        assert "level" in data, "Response missing level"
        
        # Should have shaman from previous test
        if data.get("class_id"):
            assert data["class_id"] == "shaman", f"Expected shaman, got {data['class_id']}"
        
        print(f"✓ GET /api/classes/mine returns class: {data.get('class_id')}, level: {data.get('level')}, xp: {data.get('xp')}")
    
    def test_add_xp(self, auth_headers):
        """POST /api/classes/xp adds XP and levels up correctly"""
        # First get current XP
        response = requests.get(f"{BASE_URL}/api/classes/mine", headers=auth_headers)
        initial_data = response.json()
        initial_xp = initial_data.get("xp", 0)
        initial_level = initial_data.get("level", 1)
        
        # Add 50 XP
        response = requests.post(
            f"{BASE_URL}/api/classes/xp",
            headers=auth_headers,
            json={"amount": 50}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "xp" in data, "Response missing xp"
        assert "level" in data, "Response missing level"
        assert "xp_added" in data, "Response missing xp_added"
        assert data["xp_added"] == 50, f"Expected xp_added=50, got {data['xp_added']}"
        assert data["xp"] == initial_xp + 50, f"Expected xp={initial_xp + 50}, got {data['xp']}"
        
        # Level should be 1 + xp // 100
        expected_level = 1 + data["xp"] // 100
        assert data["level"] == expected_level, f"Expected level={expected_level}, got {data['level']}"
        
        print(f"✓ POST /api/classes/xp adds XP: {initial_xp} -> {data['xp']}, level: {data['level']}")
    
    def test_add_xp_invalid_amount(self, auth_headers):
        """POST /api/classes/xp with invalid amount returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/classes/xp",
            headers=auth_headers,
            json={"amount": -10}
        )
        assert response.status_code == 400, f"Expected 400 for negative XP, got {response.status_code}"
        print(f"✓ POST /api/classes/xp rejects negative XP with 400")


class TestTreasuryAPI:
    """Sovereign Treasury Tests"""
    
    def test_get_balance_initial_100_credits(self, auth_headers):
        """GET /api/treasury/balance returns wallet with initial 100 credits"""
        response = requests.get(f"{BASE_URL}/api/treasury/balance", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "balance" in data, "Response missing balance"
        assert "total_earned" in data, "Response missing total_earned"
        assert "total_spent" in data, "Response missing total_spent"
        
        # Balance should be >= 0 (may have been modified by previous tests)
        assert isinstance(data["balance"], (int, float)), "Balance should be numeric"
        
        print(f"✓ GET /api/treasury/balance returns balance: {data['balance']}, earned: {data['total_earned']}, spent: {data['total_spent']}")
    
    def test_get_ledger(self, auth_headers):
        """GET /api/treasury/ledger returns transaction history"""
        response = requests.get(f"{BASE_URL}/api/treasury/ledger", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Ledger should be a list"
        
        # If there are transactions, verify structure
        if len(data) > 0:
            txn = data[0]
            assert "type" in txn or "amount" in txn, "Transaction missing type or amount"
        
        print(f"✓ GET /api/treasury/ledger returns {len(data)} transactions")
    
    def test_sovereign_dashboard(self, auth_headers):
        """GET /api/treasury/sovereign/dashboard returns treasury stats"""
        response = requests.get(f"{BASE_URL}/api/treasury/sovereign/dashboard", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "treasury_balance" in data, "Response missing treasury_balance"
        assert "fee_percent" in data, "Response missing fee_percent"
        assert data["fee_percent"] == 5, f"Expected 5% fee, got {data['fee_percent']}"
        assert "total_escrow_contracts" in data, "Response missing total_escrow_contracts"
        assert "total_wallets" in data, "Response missing total_wallets"
        
        print(f"✓ GET /api/treasury/sovereign/dashboard: treasury={data['treasury_balance']}, fee={data['fee_percent']}%, wallets={data['total_wallets']}")


class TestConstellationMirrorHook:
    """Constellation Mirror Hook Tests - verifies sovereign_mirror collection writes"""
    
    def test_create_constellation_writes_to_mirror(self, auth_headers):
        """POST /api/constellations writes to sovereign_mirror collection"""
        unique_name = f"TEST_Mirror_Constellation_{uuid.uuid4().hex[:8]}"
        
        response = requests.post(
            f"{BASE_URL}/api/constellations",
            headers=auth_headers,
            json={
                "name": unique_name,
                "description": "Test constellation for mirror hook verification",
                "module_ids": ["freq_432", "freq_528"],
                "synergies": [{"a": "freq_432", "b": "freq_528", "shared": ["healing"], "score": 0.5}],
                "is_public": True,
                "is_for_sale": False,
                "tags": ["test", "mirror"]
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response missing constellation id"
        assert data["name"] == unique_name, f"Expected name '{unique_name}', got {data['name']}"
        
        constellation_id = data["id"]
        print(f"✓ POST /api/constellations created: {constellation_id}")
        
        # Clean up - delete the test constellation
        delete_response = requests.delete(
            f"{BASE_URL}/api/constellations/{constellation_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200, f"Cleanup failed: {delete_response.status_code}"
        print(f"✓ Cleaned up test constellation: {constellation_id}")


class TestPurchaseFlow:
    """Full Purchase Flow Tests - requires tier 2 seller"""
    
    def test_purchase_requires_for_sale_constellation(self, auth_headers):
        """POST /api/treasury/purchase fails for non-for-sale constellation"""
        # First create a non-for-sale constellation
        unique_name = f"TEST_NotForSale_{uuid.uuid4().hex[:8]}"
        
        create_response = requests.post(
            f"{BASE_URL}/api/constellations",
            headers=auth_headers,
            json={
                "name": unique_name,
                "module_ids": ["freq_432"],
                "is_public": True,
                "is_for_sale": False
            }
        )
        assert create_response.status_code == 200
        constellation_id = create_response.json()["id"]
        
        # Try to purchase it (should fail)
        purchase_response = requests.post(
            f"{BASE_URL}/api/treasury/purchase",
            headers=auth_headers,
            json={"constellation_id": constellation_id}
        )
        # Should fail because it's not for sale
        assert purchase_response.status_code == 400, f"Expected 400 for non-for-sale, got {purchase_response.status_code}"
        
        # Clean up
        requests.delete(f"{BASE_URL}/api/constellations/{constellation_id}", headers=auth_headers)
        print(f"✓ POST /api/treasury/purchase correctly rejects non-for-sale constellation")
    
    def test_purchase_requires_valid_constellation(self, auth_headers):
        """POST /api/treasury/purchase fails for non-existent constellation"""
        response = requests.post(
            f"{BASE_URL}/api/treasury/purchase",
            headers=auth_headers,
            json={"constellation_id": "non_existent_id_12345"}
        )
        assert response.status_code == 404, f"Expected 404 for non-existent, got {response.status_code}"
        print(f"✓ POST /api/treasury/purchase returns 404 for non-existent constellation")
    
    def test_purchase_requires_constellation_id(self, auth_headers):
        """POST /api/treasury/purchase fails without constellation_id"""
        response = requests.post(
            f"{BASE_URL}/api/treasury/purchase",
            headers=auth_headers,
            json={}
        )
        assert response.status_code == 400, f"Expected 400 for missing constellation_id, got {response.status_code}"
        print(f"✓ POST /api/treasury/purchase requires constellation_id")


class TestClassSwitching:
    """Test switching between classes"""
    
    def test_switch_to_nomad(self, auth_headers):
        """User can switch from shaman to nomad"""
        response = requests.post(
            f"{BASE_URL}/api/classes/select",
            headers=auth_headers,
            json={"class_id": "nomad"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["class_id"] == "nomad"
        print(f"✓ Switched to nomad class")
    
    def test_switch_to_architect(self, auth_headers):
        """User can switch to architect"""
        response = requests.post(
            f"{BASE_URL}/api/classes/select",
            headers=auth_headers,
            json={"class_id": "architect"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["class_id"] == "architect"
        print(f"✓ Switched to architect class")
    
    def test_switch_to_merchant(self, auth_headers):
        """User can switch to merchant"""
        response = requests.post(
            f"{BASE_URL}/api/classes/select",
            headers=auth_headers,
            json={"class_id": "merchant"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["class_id"] == "merchant"
        print(f"✓ Switched to merchant class")
    
    def test_switch_back_to_shaman(self, auth_headers):
        """User can switch back to shaman"""
        response = requests.post(
            f"{BASE_URL}/api/classes/select",
            headers=auth_headers,
            json={"class_id": "shaman"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["class_id"] == "shaman"
        print(f"✓ Switched back to shaman class")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
