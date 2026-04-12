"""
ENLIGHTEN.MINT.CAFE - Backend API Tests
Tests for Treasury, Sovereign Council, and Core APIs
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://zero-scale-physics.preview.emergentagent.com')

class TestHealthAndCore:
    """Health check and core API tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        print(f"Health check: {data}")
    
    def test_sovereign_status(self):
        """Test /api/sovereign/status returns engine info"""
        response = requests.get(f"{BASE_URL}/api/sovereign/status")
        assert response.status_code == 200
        data = response.json()
        assert "engine" in data
        assert data["engine"] == "SovereignEngine"
        print(f"Sovereign status: {data}")


class TestTreasuryAPI:
    """Treasury API endpoint tests"""
    
    def test_treasury_status(self):
        """Test /api/treasury/status returns public telemetry"""
        response = requests.get(f"{BASE_URL}/api/treasury/status")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "treasury" in data
        treasury = data["treasury"]
        assert "system_status" in treasury
        assert "lox_stable" in treasury
        assert "autopay_active" in treasury
        print(f"Treasury status: {treasury['system_status']}")
    
    def test_treasury_cashflow(self):
        """Test /api/treasury/cashflow returns waveform data"""
        response = requests.get(f"{BASE_URL}/api/treasury/cashflow")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "cashflow" in data
        cashflow = data["cashflow"]
        assert "period_hours" in cashflow
        assert "total_revenue" in cashflow
        assert "total_expenses" in cashflow
        print(f"Cash flow period: {cashflow['period_hours']} hours")
    
    def test_treasury_haptic_status(self):
        """Test /api/treasury/haptic-status returns milestone info"""
        response = requests.get(f"{BASE_URL}/api/treasury/haptic-status")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "tier4_expansion" in data
        assert "next_milestone" in data
        assert "haptic_intensity" in data
        print(f"Next milestone: ${data['next_milestone']}")
    
    def test_treasury_audit_requires_auth(self):
        """Test /api/treasury/audit requires authentication"""
        response = requests.get(f"{BASE_URL}/api/treasury/audit")
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403, 422]
        print("Treasury audit correctly requires authentication")


class TestOmnisAPI:
    """Omnis/Singularity API tests"""
    
    def test_omnis_spectral_bands(self):
        """Test /api/omnis/spectral-singularity/bands returns frequency data"""
        response = requests.get(f"{BASE_URL}/api/omnis/spectral-singularity/bands")
        assert response.status_code == 200
        data = response.json()
        assert "bands" in data
        print(f"Spectral bands: {list(data['bands'].keys()) if data['bands'] else 'None'}")
    
    def test_omnis_trust(self):
        """Test /api/omnis/trust returns trust data"""
        response = requests.get(f"{BASE_URL}/api/omnis/trust")
        assert response.status_code == 200
        data = response.json()
        assert "roles" in data or "trust_id" in data
        print(f"Trust data retrieved successfully")
    
    def test_omnis_gaia_anchors(self):
        """Test /api/omnis/crystal-indent/gaia-anchors returns GPS anchors"""
        response = requests.get(f"{BASE_URL}/api/omnis/crystal-indent/gaia-anchors")
        assert response.status_code == 200
        data = response.json()
        assert "primary_anchor" in data or "anchors" in data
        print(f"Gaia anchors retrieved successfully")


class TestHarmonicsAPI:
    """Harmonics/Celestial API tests"""
    
    def test_celestial_harmonics(self):
        """Test /api/harmonics/celestial returns moon/zodiac data"""
        response = requests.get(f"{BASE_URL}/api/harmonics/celestial")
        assert response.status_code == 200
        data = response.json()
        assert "moon" in data
        assert "zodiac" in data
        assert "solar" in data
        print(f"Moon phase: {data['moon'].get('phase', 'Unknown')}")


class TestAuthFlow:
    """Authentication flow tests"""
    
    def test_login_with_valid_credentials(self):
        """Test login with test credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "grad_test_522@test.com",
                "password": "password"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data or "access_token" in data
        print("Login successful with test credentials")
    
    def test_login_with_invalid_credentials(self):
        """Test login with wrong credentials returns error"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "wrong@test.com",
                "password": "wrongpassword"
            }
        )
        # Should return 401 or 400
        assert response.status_code in [400, 401, 403]
        print("Invalid login correctly rejected")


class TestSovereignCouncilAPI:
    """Sovereign Council API tests (requires auth)"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "grad_test_522@test.com",
                "password": "password"
            }
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("token") or data.get("access_token")
        return None
    
    def test_council_list_requires_auth(self):
        """Test /api/sovereigns/list requires authentication"""
        response = requests.get(f"{BASE_URL}/api/sovereigns/list")
        assert response.status_code in [401, 403, 422]
        print("Council list correctly requires authentication")
    
    def test_council_list_with_auth(self, auth_token):
        """Test /api/sovereigns/list with valid auth"""
        if not auth_token:
            pytest.skip("Could not obtain auth token")
        
        response = requests.get(
            f"{BASE_URL}/api/sovereigns/list",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "council" in data
        assert len(data["council"]) == 10  # 10 council members
        print(f"Council members: {len(data['council'])}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
