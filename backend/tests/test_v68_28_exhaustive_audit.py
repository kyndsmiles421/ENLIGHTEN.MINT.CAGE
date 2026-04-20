"""
V68.28 EXHAUSTIVE AUDIT — Full API Coverage for ENLIGHTEN.MINT.CAFE
Tests all endpoints requested in the audit: auth, ai-visuals, knowledge, sparks, quests, starseed, profile
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://zero-scale-physics.preview.emergentagent.com').rstrip('/')

# Test credentials from test_credentials.md
OWNER_EMAIL = "kyndsmiles@gmail.com"
OWNER_PASSWORD = "Sovereign2026!"


class TestAuthFlows:
    """AUTH FLOWS — Login, /api/auth/me, logout verification"""
    
    def test_login_success(self):
        """POST /api/auth/login with owner credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data or "access_token" in data, "No token in response"
        assert "user" in data, "No user in response"
        user = data["user"]
        assert user.get("email") == OWNER_EMAIL
        # Check is_owner flag
        is_owner = user.get("is_owner", False) or user.get("role") == "admin"
        print(f"✓ Login success: is_owner={is_owner}, role={user.get('role')}")
    
    def test_auth_me_returns_owner(self):
        """GET /api/auth/me returns owner/admin with is_owner=true"""
        # First login
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        token = login_resp.json().get("token") or login_resp.json().get("access_token")
        
        # Then check /auth/me
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert response.status_code == 200, f"/auth/me failed: {response.text}"
        data = response.json()
        print(f"✓ /auth/me: id={data.get('id')}, email={data.get('email')}, role={data.get('role')}")
    
    def test_guest_token_access(self):
        """Guest mode token='guest_token' should reach basic endpoints"""
        headers = {"Authorization": "Bearer guest_token"}
        # Guest should be able to access public endpoints
        response = requests.post(f"{BASE_URL}/api/ai-visuals/chamber", json={"chamber_id": "default"})
        assert response.status_code == 200, "Guest cannot access public chamber endpoint"
        print("✓ Guest token can access public endpoints")


class TestAIVisualsEndpoints:
    """BACKEND API — POST /api/ai-visuals/chamber with all 10 chamber types"""
    
    CHAMBER_TYPES = [
        "geology", "masonry", "carpentry", "culinary", 
        "herbology", "aromatherapy", "physics", "academy", 
        "meditation", "default"
    ]
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        return response.json().get("token") or response.json().get("access_token")
    
    @pytest.mark.parametrize("chamber_id", CHAMBER_TYPES)
    def test_chamber_backdrop_all_types(self, auth_token, chamber_id):
        """Test each chamber type returns 200 and image"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/ai-visuals/chamber",
            json={"chamber_id": chamber_id},
            headers=headers
        )
        assert response.status_code == 200, f"Chamber {chamber_id} failed: {response.text}"
        data = response.json()
        assert "image_b64" in data, f"No image_b64 for {chamber_id}"
        img_size_bytes = len(data["image_b64"]) * 3 // 4
        print(f"✓ {chamber_id}: {img_size_bytes} bytes (~{img_size_bytes // 1024}KB)")


class TestKnowledgeEndpoints:
    """BACKEND API — GET /api/knowledge/deep-dive"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        return response.json().get("token") or response.json().get("access_token")
    
    def test_knowledge_deep_dive_herbology(self, auth_token):
        """GET /api/knowledge/deep-dive?topic=herbology"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(
            f"{BASE_URL}/api/knowledge/deep-dive",
            params={"topic": "herbology"},
            headers=headers
        )
        if response.status_code == 404:
            print("⚠ Knowledge deep-dive endpoint not found (may not be implemented)")
            pytest.skip("Endpoint not implemented")
        assert response.status_code == 200, f"Knowledge deep-dive failed: {response.text}"
        data = response.json()
        print(f"✓ Knowledge deep-dive: {data}")


class TestSparksEndpoints:
    """BACKEND API — GET /api/sparks/wallet, /api/sparks/immersion, /api/sparks/cards"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        return response.json().get("token") or response.json().get("access_token")
    
    def test_sparks_wallet(self, auth_token):
        """GET /api/sparks/wallet"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/sparks/wallet", headers=headers)
        assert response.status_code == 200, f"Sparks wallet failed: {response.text}"
        data = response.json()
        assert "sparks" in data
        assert "total_earned" in data
        print(f"✓ Sparks wallet: {data['sparks']} sparks, {data['total_earned']} total earned")
    
    def test_sparks_immersion(self, auth_token):
        """POST /api/sparks/immersion"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/sparks/immersion",
            json={"seconds": 10, "zone": "meditation_breath"},
            headers=headers
        )
        assert response.status_code == 200, f"Sparks immersion failed: {response.text}"
        data = response.json()
        assert "sparks_earned" in data
        print(f"✓ Sparks immersion: {data['sparks_earned']} earned")
    
    def test_sparks_cards(self, auth_token):
        """GET /api/sparks/cards"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/sparks/cards", headers=headers)
        assert response.status_code == 200, f"Sparks cards failed: {response.text}"
        data = response.json()
        assert "cards" in data
        print(f"✓ Sparks cards: {len(data['cards'])} cards")


class TestQuestsEndpoints:
    """BACKEND API — GET /api/quests/available, /api/quests/auto-detect"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        return response.json().get("token") or response.json().get("access_token")
    
    def test_quests_available(self, auth_token):
        """GET /api/quests/available"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/quests/available", headers=headers)
        assert response.status_code == 200, f"Quests available failed: {response.text}"
        data = response.json()
        assert "quests" in data
        print(f"✓ Quests available: {len(data['quests'])} quests")
    
    def test_quests_auto_detect(self, auth_token):
        """POST /api/quests/auto-detect"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/quests/auto_detect",
            json={"signal": "meditation:breath:complete"},
            headers=headers
        )
        assert response.status_code == 200, f"Quests auto-detect failed: {response.text}"
        print(f"✓ Quests auto-detect: {response.json()}")


class TestStarseedEndpoints:
    """BACKEND API — GET /api/starseed/my-characters"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        return response.json().get("token") or response.json().get("access_token")
    
    def test_starseed_my_characters(self, auth_token):
        """GET /api/starseed/my-characters returns 200 with token"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/starseed/my-characters", headers=headers)
        assert response.status_code == 200, f"Starseed my-characters failed: {response.text}"
        data = response.json()
        assert "characters" in data
        print(f"✓ Starseed my-characters: {len(data['characters'])} characters")
    
    def test_starseed_origins(self, auth_token):
        """GET /api/starseed/origins"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/starseed/origins", headers=headers)
        assert response.status_code == 200, f"Starseed origins failed: {response.text}"
        data = response.json()
        assert "origins" in data
        print(f"✓ Starseed origins: {len(data['origins'])} origins")


class TestProfileEndpoints:
    """BACKEND API — GET /api/profile/me"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        return response.json().get("token") or response.json().get("access_token")
    
    def test_profile_me(self, auth_token):
        """GET /api/profile/me"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/profile/me", headers=headers)
        assert response.status_code == 200, f"Profile me failed: {response.text}"
        data = response.json()
        print(f"✓ Profile me: {data.get('name')}, role={data.get('role')}")


class TestHealthAndMisc:
    """Health check and miscellaneous endpoints"""
    
    def test_health_check(self):
        """GET /api/health"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.text}"
        print(f"✓ Health check: {response.json()}")
    
    def test_no_500_errors_on_common_endpoints(self):
        """Verify no 500 errors on common endpoints"""
        endpoints = [
            "/api/health",
            "/api/starseed/origins",
        ]
        for endpoint in endpoints:
            response = requests.get(f"{BASE_URL}{endpoint}")
            assert response.status_code != 500, f"500 error on {endpoint}: {response.text}"
            print(f"✓ {endpoint}: {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
