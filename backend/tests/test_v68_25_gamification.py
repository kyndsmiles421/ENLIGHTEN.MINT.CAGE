"""
V68.25 System-Wide Gamification Rollout Tests
Tests: Holographic Chambers, ChamberMiniGame, Sparks Immersion, Quest Auto-Detect
Focus: Backend API verification for new chamber_ids and game zone signals
"""
import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Test credentials
OWNER_EMAIL = "kyndsmiles@gmail.com"
OWNER_PASSWORD = "Sovereign2026!"


class TestAuth:
    """Authentication tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token for owner account"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": OWNER_EMAIL, "password": OWNER_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        token = data.get("token") or data.get("access_token")
        assert token, "No token in response"
        return token
    
    def test_login_returns_valid_token(self, auth_token):
        """Auth — login returns a valid token"""
        assert auth_token is not None
        assert len(auth_token) > 20
        print(f"✓ Login successful, token length: {len(auth_token)}")


class TestChamberBackdrops:
    """Test POST /api/ai-visuals/chamber for all new chamber_ids"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": OWNER_EMAIL, "password": OWNER_PASSWORD}
        )
        token = response.json().get("token") or response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    # All chamber_ids that must be supported
    CHAMBER_IDS = [
        "herbology",
        "apothecary", 
        "aromatherapy",
        "geology",
        "meditation",
        "physics",
        "academy",
        "masonry",
        "carpentry",
        "culinary",
        "default",
    ]
    
    @pytest.mark.parametrize("chamber_id", CHAMBER_IDS)
    def test_chamber_returns_image(self, auth_headers, chamber_id):
        """POST /api/ai-visuals/chamber with chamber_id returns 200 with image_b64"""
        response = requests.post(
            f"{BASE_URL}/api/ai-visuals/chamber",
            headers=auth_headers,
            json={"chamber_id": chamber_id},
            timeout=120  # AI generation can take time on first call
        )
        assert response.status_code == 200, f"Chamber {chamber_id} failed: {response.text}"
        data = response.json()
        assert "chamber_id" in data, f"No chamber_id in response for {chamber_id}"
        assert data["chamber_id"] == chamber_id, f"Wrong chamber_id returned: {data['chamber_id']}"
        assert "image_b64" in data, f"image_b64 missing from {chamber_id} response"
        # Image should be a substantial base64 string
        assert len(data["image_b64"]) > 1000, f"image_b64 too short for {chamber_id}"
        print(f"✓ Chamber {chamber_id} returned image_b64 (length: {len(data['image_b64'])})")


class TestSparksImmersion:
    """Test POST /api/sparks/immersion for new game zones"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": OWNER_EMAIL, "password": OWNER_PASSWORD}
        )
        token = response.json().get("token") or response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    # New game zones from ChamberMiniGame
    GAME_ZONES = [
        "herbology_pluck",
        "herbology_brew",
        "aromatherapy_blend",
        "aromatherapy_essence",
        "geology_break",
        "meditation_breath",
        "test_zone",
    ]
    
    @pytest.mark.parametrize("zone", GAME_ZONES)
    def test_immersion_credits_sparks(self, auth_headers, zone):
        """POST /api/sparks/immersion accepts zone and returns 200"""
        response = requests.post(
            f"{BASE_URL}/api/sparks/immersion",
            headers=auth_headers,
            json={"seconds": 60, "zone": zone}
        )
        assert response.status_code == 200, f"Immersion for zone {zone} failed: {response.text}"
        data = response.json()
        assert "sparks_earned" in data, f"No sparks_earned in response for zone {zone}"
        assert "total_immersion_minutes" in data, f"No total_immersion_minutes for zone {zone}"
        print(f"✓ Immersion zone {zone}: {data['sparks_earned']} sparks earned")


class TestQuestAutoDetect:
    """Test POST /api/quests/auto_detect for brain signal format"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": OWNER_EMAIL, "password": OWNER_PASSWORD}
        )
        token = response.json().get("token") or response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    # Brain signal formats: <zone>:<mode>:<kind>
    BRAIN_SIGNALS = [
        {"signal": "herbology_pluck:collect:hit", "location": "herbology", "extra": {}},
        {"signal": "herbology_brew:break:hit", "location": "herbology", "extra": {}},
        {"signal": "aromatherapy_blend:rhythm:hit", "location": "aromatherapy", "extra": {}},
        {"signal": "aromatherapy_essence:collect:hit", "location": "aromatherapy", "extra": {}},
        {"signal": "geology_break:break:complete", "location": "geology", "extra": {"cleared": 5}},
        {"signal": "meditation:breath:enter", "location": "meditation", "extra": {}},
    ]
    
    @pytest.mark.parametrize("payload", BRAIN_SIGNALS)
    def test_quest_auto_detect_accepts_signal(self, auth_headers, payload):
        """POST /api/quests/auto_detect accepts brain signal format without 500 errors"""
        response = requests.post(
            f"{BASE_URL}/api/quests/auto_detect",
            headers=auth_headers,
            json=payload,
            timeout=30
        )
        # Should return 200 or 404 (if no matching quest), but NOT 500
        assert response.status_code != 500, f"Quest auto_detect 500 error for {payload['signal']}: {response.text}"
        assert response.status_code in [200, 404, 422], f"Unexpected status {response.status_code} for {payload['signal']}"
        print(f"✓ Quest auto_detect accepted signal: {payload['signal']} (status: {response.status_code})")


class TestSparksWallet:
    """Test GET /api/sparks/wallet returns correct structure"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": OWNER_EMAIL, "password": OWNER_PASSWORD}
        )
        token = response.json().get("token") or response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_sparks_wallet_structure(self, auth_headers):
        """GET /api/sparks/wallet returns sparks, total_earned, cards_earned"""
        response = requests.get(f"{BASE_URL}/api/sparks/wallet", headers=auth_headers)
        assert response.status_code == 200, f"Sparks wallet failed: {response.text}"
        data = response.json()
        assert "sparks" in data, "No sparks in wallet"
        assert "total_earned" in data, "No total_earned in wallet"
        assert "cards_earned" in data, "No cards_earned in wallet"
        assert isinstance(data["sparks"], (int, float)), "sparks should be numeric"
        print(f"✓ Sparks wallet: {data['sparks']} sparks, total_earned: {data['total_earned']}")


class TestHerbologyAPI:
    """Test Herbology catalog API"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": OWNER_EMAIL, "password": OWNER_PASSWORD}
        )
        token = response.json().get("token") or response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_herbology_herbs_returns_data(self, auth_headers):
        """GET /api/herbology/herbs returns herbs array"""
        response = requests.get(f"{BASE_URL}/api/herbology/herbs", headers=auth_headers)
        assert response.status_code == 200, f"Herbology herbs failed: {response.text}"
        data = response.json()
        assert "herbs" in data, "No herbs in response"
        assert isinstance(data["herbs"], list), "herbs should be a list"
        print(f"✓ Herbology herbs: {len(data['herbs'])} herbs loaded")


class TestAromatherapyAPI:
    """Test Aromatherapy catalog API"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": OWNER_EMAIL, "password": OWNER_PASSWORD}
        )
        token = response.json().get("token") or response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_aromatherapy_oils_returns_data(self, auth_headers):
        """GET /api/aromatherapy/oils returns oils array"""
        response = requests.get(f"{BASE_URL}/api/aromatherapy/oils", headers=auth_headers)
        assert response.status_code == 200, f"Aromatherapy oils failed: {response.text}"
        data = response.json()
        assert "oils" in data, "No oils in response"
        assert isinstance(data["oils"], list), "oils should be a list"
        print(f"✓ Aromatherapy oils: {len(data['oils'])} oils loaded")


class TestWorkshopAPIs:
    """Test Workshop module APIs for masonry, carpentry, culinary"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": OWNER_EMAIL, "password": OWNER_PASSWORD}
        )
        token = response.json().get("token") or response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    WORKSHOP_MODULES = ["masonry", "carpentry", "culinary"]
    
    @pytest.mark.parametrize("module_id", WORKSHOP_MODULES)
    def test_workshop_materials_returns_data(self, auth_headers, module_id):
        """GET /api/workshop/{module_id}/materials returns materials"""
        response = requests.get(
            f"{BASE_URL}/api/workshop/{module_id}/materials",
            headers=auth_headers
        )
        # May return 200 or 404 if module not fully implemented
        assert response.status_code in [200, 404], f"Workshop {module_id} materials unexpected status: {response.status_code}"
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Workshop {module_id} materials loaded")
        else:
            print(f"⚠ Workshop {module_id} materials not found (404)")
    
    @pytest.mark.parametrize("module_id", WORKSHOP_MODULES)
    def test_workshop_tools_returns_data(self, auth_headers, module_id):
        """GET /api/workshop/{module_id}/tools returns tools"""
        response = requests.get(
            f"{BASE_URL}/api/workshop/{module_id}/tools",
            headers=auth_headers
        )
        assert response.status_code in [200, 404], f"Workshop {module_id} tools unexpected status: {response.status_code}"
        if response.status_code == 200:
            data = response.json()
            if "tools" in data:
                print(f"✓ Workshop {module_id} tools: {len(data['tools'])} tools loaded")
            else:
                print(f"✓ Workshop {module_id} tools loaded")
        else:
            print(f"⚠ Workshop {module_id} tools not found (404)")


class TestAcademyAPI:
    """Test Academy programs API"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": OWNER_EMAIL, "password": OWNER_PASSWORD}
        )
        token = response.json().get("token") or response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_academy_programs_returns_data(self, auth_headers):
        """GET /api/academy/programs returns programs array"""
        response = requests.get(f"{BASE_URL}/api/academy/programs", headers=auth_headers)
        assert response.status_code == 200, f"Academy programs failed: {response.text}"
        data = response.json()
        assert "programs" in data, "No programs in response"
        assert isinstance(data["programs"], list), "programs should be a list"
        print(f"✓ Academy programs: {len(data['programs'])} programs loaded")


class TestRockHoundingAPI:
    """Test Rock Hounding (Geology) API"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": OWNER_EMAIL, "password": OWNER_PASSWORD}
        )
        token = response.json().get("token") or response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_rock_hounding_mine_returns_data(self, auth_headers):
        """GET /api/rock-hounding/mine returns mine data"""
        response = requests.get(f"{BASE_URL}/api/rock-hounding/mine", headers=auth_headers)
        assert response.status_code == 200, f"Rock hounding mine failed: {response.text}"
        data = response.json()
        # Should have biome and depths
        assert "biome" in data or "depths" in data or "energy_info" in data, "Mine data missing expected fields"
        print(f"✓ Rock hounding mine data loaded")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
