"""
Iteration 248 - Kinetic Dock & Sovereign Treasury Tests
Tests for:
- Backend: GET/PATCH /api/treasury/sovereign/config
- Backend: GET /api/treasury/skeleton/export
- Backend: GET /api/treasury/sovereign/mirror
- Backend: GET /api/treasury/sovereign/escrow
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSovereignTreasuryAPIs:
    """Test Sovereign Treasury API endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if login_response.status_code == 200:
            data = login_response.json()
            self.token = data.get("zen_token") or data.get("token")
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        else:
            pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_sovereign_config_get(self):
        """GET /api/treasury/sovereign/config returns config with all toggle fields"""
        response = self.session.get(f"{BASE_URL}/api/treasury/sovereign/config")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify all required fields are present
        assert "fee_percent" in data, "Missing fee_percent field"
        assert "is_live" in data, "Missing is_live field"
        assert "mirror_active" in data, "Missing mirror_active field"
        assert "frozen_transactions" in data, "Missing frozen_transactions field"
        
        # Verify data types
        assert isinstance(data["fee_percent"], (int, float)), "fee_percent should be numeric"
        assert isinstance(data["is_live"], bool), "is_live should be boolean"
        assert isinstance(data["mirror_active"], bool), "mirror_active should be boolean"
        assert isinstance(data["frozen_transactions"], bool), "frozen_transactions should be boolean"
        
        print(f"✓ Sovereign config: fee={data['fee_percent']}%, live={data['is_live']}, mirror={data['mirror_active']}, frozen={data['frozen_transactions']}")
    
    def test_sovereign_config_patch_fee_percent(self):
        """PATCH /api/treasury/sovereign/config updates fee_percent dynamically"""
        # Get current config
        get_response = self.session.get(f"{BASE_URL}/api/treasury/sovereign/config")
        assert get_response.status_code == 200
        original_fee = get_response.json().get("fee_percent", 5)
        
        # Update fee to a new value
        new_fee = 7.5 if original_fee != 7.5 else 8.0
        patch_response = self.session.patch(
            f"{BASE_URL}/api/treasury/sovereign/config",
            json={"fee_percent": new_fee}
        )
        assert patch_response.status_code == 200, f"Expected 200, got {patch_response.status_code}: {patch_response.text}"
        
        data = patch_response.json()
        assert data["fee_percent"] == new_fee, f"Expected fee_percent={new_fee}, got {data['fee_percent']}"
        
        # Verify persistence with GET
        verify_response = self.session.get(f"{BASE_URL}/api/treasury/sovereign/config")
        assert verify_response.status_code == 200
        assert verify_response.json()["fee_percent"] == new_fee, "Fee change not persisted"
        
        # Restore original fee
        self.session.patch(f"{BASE_URL}/api/treasury/sovereign/config", json={"fee_percent": original_fee})
        
        print(f"✓ Fee percent updated from {original_fee}% to {new_fee}% and verified")
    
    def test_sovereign_config_patch_toggles(self):
        """PATCH /api/treasury/sovereign/config updates toggle fields"""
        # Get current config
        get_response = self.session.get(f"{BASE_URL}/api/treasury/sovereign/config")
        assert get_response.status_code == 200
        original = get_response.json()
        
        # Toggle mirror_active
        new_mirror = not original.get("mirror_active", True)
        patch_response = self.session.patch(
            f"{BASE_URL}/api/treasury/sovereign/config",
            json={"mirror_active": new_mirror}
        )
        assert patch_response.status_code == 200
        assert patch_response.json()["mirror_active"] == new_mirror
        
        # Restore original
        self.session.patch(f"{BASE_URL}/api/treasury/sovereign/config", json={"mirror_active": original.get("mirror_active", True)})
        
        print(f"✓ Toggle mirror_active updated and restored")
    
    def test_sovereign_config_fee_validation(self):
        """PATCH /api/treasury/sovereign/config validates fee range (0-50)"""
        # Test fee > 50 should fail
        response = self.session.patch(
            f"{BASE_URL}/api/treasury/sovereign/config",
            json={"fee_percent": 55}
        )
        assert response.status_code == 400, f"Expected 400 for fee > 50, got {response.status_code}"
        
        # Test fee < 0 should fail
        response = self.session.patch(
            f"{BASE_URL}/api/treasury/sovereign/config",
            json={"fee_percent": -5}
        )
        assert response.status_code == 400, f"Expected 400 for fee < 0, got {response.status_code}"
        
        print("✓ Fee validation working (rejects < 0 and > 50)")
    
    def test_skeleton_export(self):
        """GET /api/treasury/skeleton/export returns clean JSON with framework skeleton"""
        response = self.session.get(f"{BASE_URL}/api/treasury/skeleton/export")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify top-level structure
        assert "framework" in data, "Missing framework field"
        assert "version" in data, "Missing version field"
        assert "skeleton" in data, "Missing skeleton field"
        assert "class_archetypes" in data, "Missing class_archetypes field"
        
        # Verify skeleton structure
        skeleton = data["skeleton"]
        assert "module_types" in skeleton, "Missing module_types in skeleton"
        assert "affinity_tags" in skeleton, "Missing affinity_tags in skeleton"
        assert "tier_levels" in skeleton, "Missing tier_levels in skeleton"
        assert "interaction_model" in skeleton, "Missing interaction_model in skeleton"
        assert "monetization" in skeleton, "Missing monetization in skeleton"
        
        # Verify module_types is a list
        assert isinstance(skeleton["module_types"], list), "module_types should be a list"
        assert len(skeleton["module_types"]) > 0, "module_types should not be empty"
        
        # Verify interaction_model has expected fields
        interaction = skeleton["interaction_model"]
        assert "drag_and_drop" in interaction, "Missing drag_and_drop in interaction_model"
        assert "magnetic_snap_radius" in interaction, "Missing magnetic_snap_radius in interaction_model"
        assert "focus_mode_trigger" in interaction, "Missing focus_mode_trigger in interaction_model"
        
        print(f"✓ Skeleton export: framework={data['framework']}, version={data['version']}, {len(skeleton['module_types'])} module types")
    
    def test_sovereign_mirror(self):
        """GET /api/treasury/sovereign/mirror returns mirror entries"""
        response = self.session.get(f"{BASE_URL}/api/treasury/sovereign/mirror")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify structure
        assert "entries" in data, "Missing entries field"
        assert "total" in data, "Missing total field"
        assert isinstance(data["entries"], list), "entries should be a list"
        assert isinstance(data["total"], int), "total should be an integer"
        
        print(f"✓ Sovereign mirror: {data['total']} total entries, {len(data['entries'])} returned")
    
    def test_sovereign_mirror_with_limit(self):
        """GET /api/treasury/sovereign/mirror respects limit parameter"""
        response = self.session.get(f"{BASE_URL}/api/treasury/sovereign/mirror?limit=5")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["entries"]) <= 5, "Should respect limit parameter"
        
        print(f"✓ Sovereign mirror with limit=5: {len(data['entries'])} entries returned")
    
    def test_sovereign_escrow(self):
        """GET /api/treasury/sovereign/escrow returns escrow contracts"""
        response = self.session.get(f"{BASE_URL}/api/treasury/sovereign/escrow")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify it's a list
        assert isinstance(data, list), "escrow response should be a list"
        
        # If there are contracts, verify structure
        if len(data) > 0:
            contract = data[0]
            # Check for expected fields in escrow contract
            expected_fields = ["id", "type", "status"]
            for field in expected_fields:
                assert field in contract, f"Missing {field} in escrow contract"
        
        print(f"✓ Sovereign escrow: {len(data)} contracts returned")
    
    def test_sovereign_escrow_with_limit(self):
        """GET /api/treasury/sovereign/escrow respects limit parameter"""
        response = self.session.get(f"{BASE_URL}/api/treasury/sovereign/escrow?limit=5")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) <= 5, "Should respect limit parameter"
        
        print(f"✓ Sovereign escrow with limit=5: {len(data)} contracts returned")
    
    def test_sovereign_dashboard(self):
        """GET /api/treasury/sovereign/dashboard returns dashboard stats"""
        response = self.session.get(f"{BASE_URL}/api/treasury/sovereign/dashboard")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify expected fields
        expected_fields = [
            "treasury_balance", "total_fees_collected", "fee_percent",
            "is_live", "mirror_active", "frozen_transactions",
            "total_escrow_contracts", "total_wallets"
        ]
        for field in expected_fields:
            assert field in data, f"Missing {field} in dashboard response"
        
        print(f"✓ Sovereign dashboard: treasury={data['treasury_balance']}, fees={data['total_fees_collected']}, wallets={data['total_wallets']}")


class TestHealthAndBasicEndpoints:
    """Basic health and connectivity tests"""
    
    def test_health_endpoint(self):
        """Health endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.status_code}"
        print("✓ Health endpoint OK")
    
    def test_auth_login(self):
        """Auth login works with test credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        assert response.status_code == 200, f"Login failed: {response.status_code}: {response.text}"
        
        data = response.json()
        assert "zen_token" in data or "token" in data, "Missing token in login response"
        print("✓ Auth login OK")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
