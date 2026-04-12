"""
ENLIGHTEN.MINT.CAFE V30.2 - Backend API Tests
Tests all critical API endpoints for the full system audit
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthEndpoints:
    """Health check and basic API tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print(f"✓ Health endpoint: {data}")
    
    def test_treasury_status(self):
        """Test /api/treasury/status returns data"""
        response = requests.get(f"{BASE_URL}/api/treasury/status")
        assert response.status_code == 200
        data = response.json()
        assert "treasury" in data or "status" in data
        print(f"✓ Treasury status: {data.get('status', 'success')}")


class TestTreasuryEndpoints:
    """Treasury API tests"""
    
    def test_treasury_status_structure(self):
        """Test treasury status response structure"""
        response = requests.get(f"{BASE_URL}/api/treasury/status")
        assert response.status_code == 200
        data = response.json()
        
        # Check for expected fields
        if "treasury" in data:
            treasury = data["treasury"]
            assert "system_status" in treasury
            assert "lox_stable" in treasury
            print(f"✓ Treasury structure valid: {treasury.get('system_status')}")


class TestAuthEndpoints:
    """Authentication API tests"""
    
    def test_login_with_test_credentials(self):
        """Test login with test credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test_v29_user@test.com",
            "password": "testpass123"
        })
        # Login should return 200 or 401 (if user doesn't exist)
        assert response.status_code in [200, 401, 404]
        print(f"✓ Login endpoint responded: {response.status_code}")
    
    def test_register_endpoint_exists(self):
        """Test register endpoint exists"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": "test_new_user@test.com",
            "password": "testpass123",
            "name": "Test User"
        })
        # Should return 200, 201, 400 (already exists), or 422 (validation)
        assert response.status_code in [200, 201, 400, 422]
        print(f"✓ Register endpoint responded: {response.status_code}")


class TestOracleEndpoints:
    """Oracle/Divination API tests"""
    
    def test_oracle_tarot_deck_endpoint(self):
        """Test oracle tarot-deck endpoint"""
        response = requests.get(f"{BASE_URL}/api/oracle/tarot-deck")
        # Should return 200 or 401 (auth required)
        assert response.status_code in [200, 401]
        print(f"✓ Oracle tarot-deck endpoint: {response.status_code}")
    
    def test_oracle_reading_endpoint(self):
        """Test oracle reading endpoint"""
        response = requests.post(f"{BASE_URL}/api/oracle/reading", json={
            "type": "tarot",
            "spread": "single"
        })
        # Should return 200, 401 (auth required), or 422 (validation)
        assert response.status_code in [200, 401, 422]
        print(f"✓ Oracle reading endpoint: {response.status_code}")


class TestContentEndpoints:
    """Content API tests"""
    
    def test_mantras_endpoint(self):
        """Test mantras endpoint"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code in [200, 401]
        print(f"✓ Mantras endpoint: {response.status_code}")
    
    def test_avatar_catalog_endpoint(self):
        """Test avatar catalog endpoint"""
        response = requests.get(f"{BASE_URL}/api/avatar/catalog")
        assert response.status_code in [200, 401]
        print(f"✓ Avatar catalog endpoint: {response.status_code}")


class TestMarketplaceEndpoints:
    """Marketplace/Trade API tests"""
    
    def test_marketplace_store(self):
        """Test marketplace store endpoint"""
        response = requests.get(f"{BASE_URL}/api/marketplace/store")
        assert response.status_code in [200, 401]
        print(f"✓ Marketplace store endpoint: {response.status_code}")
    
    def test_marketplace_inventory(self):
        """Test marketplace inventory endpoint"""
        response = requests.get(f"{BASE_URL}/api/marketplace/inventory")
        assert response.status_code in [200, 401]
        print(f"✓ Marketplace inventory endpoint: {response.status_code}")


class TestSovereignEndpoints:
    """Sovereign/Admin API tests"""
    
    def test_sovereigns_list(self):
        """Test sovereigns list endpoint (requires auth)"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list")
        # Should return 401 (not authenticated) or 200
        assert response.status_code in [200, 401]
        print(f"✓ Sovereigns list endpoint: {response.status_code}")


class TestJournalEndpoints:
    """Journal API tests"""
    
    def test_journal_entries(self):
        """Test journal entries endpoint"""
        response = requests.get(f"{BASE_URL}/api/journal/entries")
        assert response.status_code in [200, 401]
        print(f"✓ Journal entries endpoint: {response.status_code}")


class TestArchivesEndpoints:
    """Archives API tests"""
    
    def test_archives_list(self):
        """Test archives list endpoint"""
        response = requests.get(f"{BASE_URL}/api/archives/list")
        assert response.status_code in [200, 401, 404]
        print(f"✓ Archives list endpoint: {response.status_code}")


class TestMasterSyncEndpoints:
    """Master sync API tests"""
    
    def test_sync_health(self):
        """Test sync health endpoint"""
        response = requests.get(f"{BASE_URL}/api/sync/health")
        assert response.status_code in [200, 401, 404]
        print(f"✓ Sync health endpoint: {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
