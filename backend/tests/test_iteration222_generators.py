"""
Iteration 222 - Generator System Tests
Tests for Tiered Payable Bonuses (Generators) system:
- GET /api/trade-circle/generators/catalog - Full catalog with ownership, tier-locking, affordability
- POST /api/trade-circle/purchase - Purchase generator with tier validation, credit check
- GET /api/vault/generators - Owned generators with bloom coefficients
- POST /api/vault/generators/toggle - Toggle generator active state
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user (archivist tier)"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Auth headers with Bearer token"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestGeneratorCatalog:
    """Tests for GET /api/trade-circle/generators/catalog"""
    
    def test_catalog_returns_200(self, auth_headers):
        """Catalog endpoint returns 200 with valid auth"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/generators/catalog", headers=auth_headers)
        assert response.status_code == 200
        print("✓ Catalog endpoint returns 200")
    
    def test_catalog_structure(self, auth_headers):
        """Catalog response has correct structure"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/generators/catalog", headers=auth_headers)
        data = response.json()
        
        assert "catalog" in data
        assert "user_tier" in data
        assert "user_credits" in data
        assert isinstance(data["catalog"], list)
        assert len(data["catalog"]) == 8  # 3 sub-harmonic + 3 mantra + 2 lossless
        print(f"✓ Catalog has {len(data['catalog'])} generators")
    
    def test_catalog_generator_fields(self, auth_headers):
        """Each generator has required fields"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/generators/catalog", headers=auth_headers)
        data = response.json()
        
        required_fields = ["id", "name", "type", "description", "tier_required", 
                          "price_credits", "owned", "tier_locked", "can_afford"]
        
        for gen in data["catalog"]:
            for field in required_fields:
                assert field in gen, f"Missing field: {field} in generator {gen.get('id')}"
        print("✓ All generators have required fields")
    
    def test_catalog_tier_locking(self, auth_headers):
        """Sovereign generators are tier-locked for archivist user"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/generators/catalog", headers=auth_headers)
        data = response.json()
        
        assert data["user_tier"] == "archivist"
        
        sovereign_gens = [g for g in data["catalog"] if g["tier_required"] == "sovereign"]
        for gen in sovereign_gens:
            assert gen["tier_locked"] == True, f"Sovereign generator {gen['id']} should be tier-locked"
        
        archivist_gens = [g for g in data["catalog"] if g["tier_required"] in ["synthesizer", "archivist"]]
        for gen in archivist_gens:
            assert gen["tier_locked"] == False, f"Generator {gen['id']} should not be tier-locked"
        
        print(f"✓ Tier-locking correct: {len(sovereign_gens)} sovereign locked, {len(archivist_gens)} accessible")
    
    def test_catalog_ownership_status(self, auth_headers):
        """Catalog shows correct ownership status"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/generators/catalog", headers=auth_headers)
        data = response.json()
        
        # sub-harmonic-01 was purchased by test user
        sub_harmonic_01 = next((g for g in data["catalog"] if g["id"] == "sub-harmonic-01"), None)
        assert sub_harmonic_01 is not None
        assert sub_harmonic_01["owned"] == True
        print("✓ Ownership status correctly shows sub-harmonic-01 as owned")
    
    def test_catalog_requires_auth(self):
        """Catalog endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/generators/catalog")
        assert response.status_code == 401 or response.status_code == 403
        print("✓ Catalog requires authentication")


class TestGeneratorPurchase:
    """Tests for POST /api/trade-circle/purchase"""
    
    def test_duplicate_purchase_rejected(self, auth_headers):
        """Duplicate purchase returns 400"""
        response = requests.post(f"{BASE_URL}/api/trade-circle/purchase", 
            headers=auth_headers,
            json={"generatorId": "sub-harmonic-01"})
        
        assert response.status_code == 400
        assert "already owned" in response.json().get("detail", "").lower()
        print("✓ Duplicate purchase correctly rejected with 400")
    
    def test_tier_gating_enforced(self, auth_headers):
        """Sovereign generators blocked for archivist user"""
        response = requests.post(f"{BASE_URL}/api/trade-circle/purchase",
            headers=auth_headers,
            json={"generatorId": "sub-harmonic-03"})  # sovereign tier
        
        assert response.status_code == 403
        assert "sovereign" in response.json().get("detail", "").lower()
        print("✓ Tier-gating enforced: sovereign generator blocked for archivist")
    
    def test_invalid_generator_rejected(self, auth_headers):
        """Invalid generator ID returns 404"""
        response = requests.post(f"{BASE_URL}/api/trade-circle/purchase",
            headers=auth_headers,
            json={"generatorId": "invalid-generator-id"})
        
        assert response.status_code == 404
        print("✓ Invalid generator ID returns 404")
    
    def test_purchase_requires_auth(self):
        """Purchase endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/trade-circle/purchase",
            json={"generatorId": "sub-harmonic-02"})
        
        assert response.status_code == 401 or response.status_code == 403
        print("✓ Purchase requires authentication")


class TestVaultGenerators:
    """Tests for GET /api/vault/generators"""
    
    def test_vault_returns_200(self, auth_headers):
        """Vault endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/vault/generators", headers=auth_headers)
        assert response.status_code == 200
        print("✓ Vault endpoint returns 200")
    
    def test_vault_structure(self, auth_headers):
        """Vault response has correct structure"""
        response = requests.get(f"{BASE_URL}/api/vault/generators", headers=auth_headers)
        data = response.json()
        
        assert "generators" in data
        assert "hexagram_number" in data
        assert isinstance(data["generators"], list)
        print(f"✓ Vault has {len(data['generators'])} owned generators")
    
    def test_vault_generator_fields(self, auth_headers):
        """Owned generators have bloom coefficients"""
        response = requests.get(f"{BASE_URL}/api/vault/generators", headers=auth_headers)
        data = response.json()
        
        if len(data["generators"]) > 0:
            gen = data["generators"][0]
            assert "bloom_coefficients" in gen
            assert "reverb_color_mod" in gen["bloom_coefficients"]
            assert "decay_rate_mod" in gen["bloom_coefficients"]
            assert "bloom_seed" in gen["bloom_coefficients"]
            assert "hex_factor" in gen["bloom_coefficients"]
            print("✓ Owned generators have bloom coefficients")
        else:
            pytest.skip("No owned generators to test")
    
    def test_vault_requires_auth(self):
        """Vault endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/vault/generators")
        assert response.status_code == 401 or response.status_code == 403
        print("✓ Vault requires authentication")


class TestGeneratorToggle:
    """Tests for POST /api/vault/generators/toggle"""
    
    def test_toggle_owned_generator(self, auth_headers):
        """Toggle owned generator changes active state"""
        # Get current state
        vault_response = requests.get(f"{BASE_URL}/api/vault/generators", headers=auth_headers)
        vault_data = vault_response.json()
        
        if len(vault_data["generators"]) == 0:
            pytest.skip("No owned generators to toggle")
        
        gen = vault_data["generators"][0]
        initial_active = gen["active"]
        
        # Toggle
        toggle_response = requests.post(f"{BASE_URL}/api/vault/generators/toggle",
            headers=auth_headers,
            json={"generatorId": gen["id"]})
        
        assert toggle_response.status_code == 200
        toggle_data = toggle_response.json()
        assert toggle_data["active"] != initial_active
        
        # Verify persistence
        verify_response = requests.get(f"{BASE_URL}/api/vault/generators", headers=auth_headers)
        verify_data = verify_response.json()
        updated_gen = next((g for g in verify_data["generators"] if g["id"] == gen["id"]), None)
        assert updated_gen["active"] == toggle_data["active"]
        
        print(f"✓ Toggle changed active state from {initial_active} to {toggle_data['active']}")
    
    def test_toggle_non_owned_generator(self, auth_headers):
        """Toggle non-owned generator returns 404"""
        response = requests.post(f"{BASE_URL}/api/vault/generators/toggle",
            headers=auth_headers,
            json={"generatorId": "sub-harmonic-02"})  # Not owned
        
        assert response.status_code == 404
        assert "not owned" in response.json().get("detail", "").lower()
        print("✓ Toggle non-owned generator returns 404")
    
    def test_toggle_requires_auth(self):
        """Toggle endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/vault/generators/toggle",
            json={"generatorId": "sub-harmonic-01"})
        
        assert response.status_code == 401 or response.status_code == 403
        print("✓ Toggle requires authentication")


class TestGeneratorTypes:
    """Tests for generator type coverage"""
    
    def test_all_generator_types_present(self, auth_headers):
        """Catalog has all three generator types"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/generators/catalog", headers=auth_headers)
        data = response.json()
        
        types = set(g["type"] for g in data["catalog"])
        assert "sub_harmonic" in types
        assert "mantra_extension" in types
        assert "ultra_lossless" in types
        print(f"✓ All 3 generator types present: {types}")
    
    def test_generator_type_counts(self, auth_headers):
        """Correct number of generators per type"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/generators/catalog", headers=auth_headers)
        data = response.json()
        
        type_counts = {}
        for g in data["catalog"]:
            type_counts[g["type"]] = type_counts.get(g["type"], 0) + 1
        
        assert type_counts.get("sub_harmonic", 0) == 3
        assert type_counts.get("mantra_extension", 0) == 3
        assert type_counts.get("ultra_lossless", 0) == 2
        print(f"✓ Generator type counts: {type_counts}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
