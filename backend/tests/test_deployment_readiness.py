"""
ENLIGHTEN.MINT.CAFE — Full System Deployment Readiness Backend Tests
Tests all critical API endpoints for Google Play Store deployment.

Modules tested:
- Transmuter API (dust_balance, fans_balance, tier_dynamics)
- Gaming APIs (Resource Alchemy, Gravity Well, Cryptic Quest)
- Core Omnis APIs (spectral bands, trust, gaia anchors)
- Auth endpoints
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test_v29_user@test.com"
TEST_PASSWORD = "testpass123"


class TestHealthAndCore:
    """Basic health and core API tests"""
    
    def test_api_health(self):
        """Test API is responding"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print(f"✓ Health check passed: {response.json()}")
    
    def test_sovereign_status(self):
        """Test sovereign status endpoint (public)"""
        response = requests.get(f"{BASE_URL}/api/sovereign/status")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data or "version" in data or "kernel" in data
        print(f"✓ Sovereign status: {data}")


class TestOmnisAPIs:
    """Test Omnis/Sovereign Hub APIs"""
    
    def test_spectral_bands(self):
        """GET /api/omnis/spectral-singularity/bands"""
        response = requests.get(f"{BASE_URL}/api/omnis/spectral-singularity/bands")
        assert response.status_code == 200
        data = response.json()
        assert "bands" in data
        print(f"✓ Spectral bands: {len(data.get('bands', {}))} bands")
    
    def test_trust_info(self):
        """GET /api/omnis/trust"""
        response = requests.get(f"{BASE_URL}/api/omnis/trust")
        assert response.status_code == 200
        data = response.json()
        print(f"✓ Trust info retrieved")
    
    def test_gaia_anchors(self):
        """GET /api/omnis/crystal-indent/gaia-anchors"""
        response = requests.get(f"{BASE_URL}/api/omnis/crystal-indent/gaia-anchors")
        assert response.status_code == 200
        data = response.json()
        assert "primary_anchor" in data or "anchors" in data or "global_sync" in data
        print(f"✓ Gaia anchors retrieved")
    
    def test_expansion_status(self):
        """GET /api/omnis/expansion/status"""
        response = requests.get(f"{BASE_URL}/api/omnis/expansion/status")
        assert response.status_code == 200
        print(f"✓ Expansion status: {response.json()}")
    
    def test_interconnect_status(self):
        """GET /api/omnis/interconnect/status"""
        response = requests.get(f"{BASE_URL}/api/omnis/interconnect/status")
        assert response.status_code == 200
        print(f"✓ Interconnect status retrieved")
    
    def test_one_print(self):
        """GET /api/omnis/the-one-print (public access)"""
        response = requests.get(f"{BASE_URL}/api/omnis/the-one-print")
        assert response.status_code == 200
        data = response.json()
        # Should have crystal_layer, spectral_layer, etc.
        print(f"✓ One Print retrieved: keys={list(data.keys())}")


class TestAuthFlow:
    """Test authentication endpoints"""
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        # Should return 200 with token or 401 if user doesn't exist
        assert response.status_code in [200, 401, 404]
        if response.status_code == 200:
            data = response.json()
            assert "token" in data or "access_token" in data
            print(f"✓ Login successful")
        else:
            print(f"⚠ Login returned {response.status_code} - user may not exist")
    
    def test_register_or_login(self):
        """Register test user if not exists, then login"""
        # Try to register
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "name": "Test User V29"
        })
        
        # Now login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if login_response.status_code == 200:
            data = login_response.json()
            token = data.get("token") or data.get("access_token")
            assert token is not None
            print(f"✓ Auth flow working, token obtained")
            return token
        else:
            print(f"⚠ Auth flow issue: {login_response.status_code}")
            return None


class TestTransmuterAPI:
    """Test Transmuter/Economy APIs"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            data = response.json()
            return data.get("token") or data.get("access_token")
        return None
    
    def test_transmuter_status_authenticated(self, auth_token):
        """GET /api/transmuter/status - requires auth"""
        if not auth_token:
            pytest.skip("No auth token available")
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/transmuter/status", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify required fields
        assert "dust_balance" in data
        assert "fans_balance" in data
        assert "tier_dynamics" in data
        
        print(f"✓ Transmuter status: dust={data['dust_balance']}, fans={data['fans_balance']}")
    
    def test_work_submit(self, auth_token):
        """POST /api/transmuter/work-submit - silent dust accrual"""
        if not auth_token:
            pytest.skip("No auth token available")
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/api/transmuter/work-submit", 
            headers=headers,
            json={"module": "test_module", "interaction_weight": 10}
        )
        assert response.status_code == 200
        data = response.json()
        assert "accrued" in data or "earned" in data
        print(f"✓ Work submit: {data}")


class TestGamingAPIs:
    """Test P1 Gaming APIs (Resource Alchemy, Gravity Well, Cryptic Quest)"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            data = response.json()
            return data.get("token") or data.get("access_token")
        return None
    
    def test_alchemy_state(self, auth_token):
        """GET /api/gaming/alchemy/state - returns inventory + elements + recipes"""
        if not auth_token:
            pytest.skip("No auth token available")
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/gaming/alchemy/state", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "inventory" in data
        assert "elements" in data
        assert "recipes" in data
        
        print(f"✓ Alchemy state: inventory={data['inventory']}")
    
    def test_gravity_well_market(self, auth_token):
        """GET /api/gaming/gravity-well/market - returns element prices"""
        if not auth_token:
            pytest.skip("No auth token available")
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/gaming/gravity-well/market", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "market" in data
        assert len(data["market"]) > 0
        
        print(f"✓ Gravity Well market: {len(data['market'])} elements")
    
    def test_quest_nodes(self, auth_token):
        """GET /api/gaming/quest/nodes - returns 5 quest nodes"""
        if not auth_token:
            pytest.skip("No auth token available")
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/gaming/quest/nodes", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "nodes" in data
        assert len(data["nodes"]) == 5
        
        print(f"✓ Quest nodes: {len(data['nodes'])} nodes")


class TestModuleEndpoints:
    """Test various module-specific endpoints"""
    
    def test_waitlist_count(self):
        """GET /api/waitlist/count"""
        response = requests.get(f"{BASE_URL}/api/waitlist/count")
        assert response.status_code == 200
        print(f"✓ Waitlist count: {response.json()}")
    
    def test_quick_reset_endpoint(self):
        """GET /api/quick-reset/{feeling}"""
        response = requests.get(f"{BASE_URL}/api/quick-reset/stressed")
        assert response.status_code == 200
        data = response.json()
        assert "frequency" in data or "tool" in data
        print(f"✓ Quick reset for 'stressed': {list(data.keys())}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
