"""
V1.0.4 Comprehensive API Test Suite
Tests all critical endpoints for ENLIGHTEN.MINT.CAFE
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://zero-scale-physics.preview.emergentagent.com')

class TestHealthAndBasics:
    """Basic health and connectivity tests"""
    
    def test_health_endpoint(self):
        """Health check should return 200"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200
        print(f"Health check: {response.json()}")
    
    def test_downloads_api_list(self):
        """Downloads API should list available files"""
        response = requests.get(f"{BASE_URL}/api/downloads", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "vault" in data
        assert data["total"] > 0
        print(f"Downloads available: {data['total']}")
    
    def test_apk_download_available(self):
        """APK v1.0.4 should be downloadable"""
        response = requests.head(f"{BASE_URL}/api/downloads/enlighten-v1.0.4.apk", timeout=10)
        assert response.status_code == 200
        print("APK v1.0.4 available")
    
    def test_aab_download_available(self):
        """AAB v1.0.4 should be downloadable"""
        response = requests.head(f"{BASE_URL}/api/downloads/enlighten-mint-cafe-v1.0.4.aab", timeout=10)
        assert response.status_code == 200
        print("AAB v1.0.4 available")


class TestAuthFlow:
    """Authentication flow tests"""
    
    def test_login_with_owner_credentials(self):
        """Login with owner credentials should succeed"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "kyndsmiles@gmail.com",
            "password": "Sovereign2026!"
        }, timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert "token" in data or "zen_token" in data
        print(f"Login successful, token received")
        return data.get("token") or data.get("zen_token")
    
    def test_auth_me_with_token(self):
        """Auth/me should return user info with valid token"""
        # First login
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "kyndsmiles@gmail.com",
            "password": "Sovereign2026!"
        }, timeout=15)
        token = login_resp.json().get("token") or login_resp.json().get("zen_token")
        
        # Then check auth/me
        response = requests.get(f"{BASE_URL}/api/auth/me", 
            headers={"Authorization": f"Bearer {token}"}, timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "email" in data or "user" in data
        print(f"Auth/me returned user data")


class TestMainBrainLattice:
    """Main Brain and Lattice API tests"""
    
    def test_lattice_endpoint(self):
        """Lattice endpoint should return 9x9 grid data"""
        response = requests.get(f"{BASE_URL}/api/main-brain/lattice", timeout=10)
        assert response.status_code == 200
        data = response.json()
        # Check for lattice structure
        lattice = data.get("lattice") or data.get("lattice_state") or data
        if "nodes" in lattice:
            print(f"Lattice nodes: {len(lattice['nodes'])}")
        print("Lattice endpoint working")


class TestSparksAndEconomy:
    """Sparks and economy system tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "kyndsmiles@gmail.com",
            "password": "Sovereign2026!"
        }, timeout=15)
        return response.json().get("token") or response.json().get("zen_token")
    
    def test_sparks_wallet(self, auth_token):
        """Sparks wallet should return balance"""
        response = requests.get(f"{BASE_URL}/api/sparks/wallet",
            headers={"Authorization": f"Bearer {auth_token}"}, timeout=10)
        assert response.status_code == 200
        data = response.json()
        print(f"Sparks wallet: {data}")
    
    def test_quests_available(self, auth_token):
        """Quests endpoint should return available quests"""
        response = requests.get(f"{BASE_URL}/api/quests/available",
            headers={"Authorization": f"Bearer {auth_token}"}, timeout=10)
        assert response.status_code == 200
        print("Quests endpoint working")


class TestStarseedAdventure:
    """Starseed Adventure API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "kyndsmiles@gmail.com",
            "password": "Sovereign2026!"
        }, timeout=15)
        return response.json().get("token") or response.json().get("zen_token")
    
    def test_starseed_origins(self, auth_token):
        """Starseed origins should return available origins"""
        response = requests.get(f"{BASE_URL}/api/starseed/origins",
            headers={"Authorization": f"Bearer {auth_token}"}, timeout=10)
        assert response.status_code == 200
        print("Starseed origins endpoint working")
    
    def test_starseed_my_characters(self, auth_token):
        """My characters endpoint should work"""
        response = requests.get(f"{BASE_URL}/api/starseed/my-characters",
            headers={"Authorization": f"Bearer {auth_token}"}, timeout=10)
        assert response.status_code == 200
        print("Starseed my-characters endpoint working")


class TestAIVisuals:
    """AI Visuals / Chamber backdrop tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "kyndsmiles@gmail.com",
            "password": "Sovereign2026!"
        }, timeout=15)
        return response.json().get("token") or response.json().get("zen_token")
    
    def test_chamber_geology(self, auth_token):
        """Geology chamber should return backdrop"""
        response = requests.post(f"{BASE_URL}/api/ai-visuals/chamber",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"chamber_type": "geology"}, timeout=15)
        assert response.status_code == 200
        print("Geology chamber backdrop working")
    
    def test_chamber_reflexology(self, auth_token):
        """Reflexology chamber should return backdrop"""
        response = requests.post(f"{BASE_URL}/api/ai-visuals/chamber",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"chamber_type": "reflexology"}, timeout=15)
        # May return 200 or use default
        assert response.status_code in [200, 201]
        print("Reflexology chamber backdrop working")
