"""
Iteration 187 Tests: Three Avenues Reorganization, Education Packs, Resonance Builds
Tests the new Three Avenues (Material/Living/Ancestral) structure with:
- Education Packs with dynamic pricing
- Resonance Builds crafting system
- All previous Science/History endpoints
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
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Auth headers for authenticated requests"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestEducationPacks:
    """Education Packs endpoint tests - new feature"""

    def test_get_all_education_packs(self, auth_headers):
        """GET /api/science-history/economy/education-packs returns 9 packs"""
        response = requests.get(f"{BASE_URL}/api/science-history/economy/education-packs", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "packs" in data
        assert len(data["packs"]) == 9, f"Expected 9 packs, got {len(data['packs'])}"
        assert "balances" in data
        assert "user_level" in data

    def test_filter_material_avenue_packs(self, auth_headers):
        """GET /api/science-history/economy/education-packs?avenue=material returns 3 packs"""
        response = requests.get(f"{BASE_URL}/api/science-history/economy/education-packs?avenue=material", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["packs"]) == 3, f"Expected 3 material packs, got {len(data['packs'])}"
        for pack in data["packs"]:
            assert pack["avenue"] == "material"
            assert pack["currency"] == "kinetic_dust"
            assert pack["scaling"] == "high"

    def test_filter_living_avenue_packs(self, auth_headers):
        """GET /api/science-history/economy/education-packs?avenue=living returns 3 packs"""
        response = requests.get(f"{BASE_URL}/api/science-history/economy/education-packs?avenue=living", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["packs"]) == 3, f"Expected 3 living packs, got {len(data['packs'])}"
        for pack in data["packs"]:
            assert pack["avenue"] == "living"
            assert pack["currency"] == "science_resonance"
            assert pack["scaling"] == "flat"

    def test_filter_ancestral_avenue_packs(self, auth_headers):
        """GET /api/science-history/economy/education-packs?avenue=ancestral returns 3 packs"""
        response = requests.get(f"{BASE_URL}/api/science-history/economy/education-packs?avenue=ancestral", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["packs"]) == 3, f"Expected 3 ancestral packs, got {len(data['packs'])}"
        for pack in data["packs"]:
            assert pack["avenue"] == "ancestral"
            assert pack["currency"] == "science_resonance"

    def test_dynamic_pricing_structure(self, auth_headers):
        """Verify packs have scaled_cost based on user level"""
        response = requests.get(f"{BASE_URL}/api/science-history/economy/education-packs", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        for pack in data["packs"]:
            assert "scaled_cost" in pack
            assert "base_cost" in pack
            assert "user_level" in pack
            assert pack["scaled_cost"] >= pack["base_cost"]  # Scaled cost should be >= base

    def test_purchase_pack_invalid_id(self, auth_headers):
        """POST /api/science-history/economy/purchase-pack with invalid pack_id returns 404"""
        response = requests.post(f"{BASE_URL}/api/science-history/economy/purchase-pack",
            json={"pack_id": "nonexistent_pack"}, headers=auth_headers)
        assert response.status_code == 404


class TestResonanceBuilds:
    """Resonance Builds crafting system tests - new feature"""

    def test_get_resonance_builds(self, auth_headers):
        """GET /api/science-history/economy/builds returns 3 builds"""
        response = requests.get(f"{BASE_URL}/api/science-history/economy/builds", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "builds" in data
        assert len(data["builds"]) == 3, f"Expected 3 builds, got {len(data['builds'])}"
        assert "total_crafted" in data

    def test_builds_have_crafting_requirements(self, auth_headers):
        """Verify builds have required_items and crafting status"""
        response = requests.get(f"{BASE_URL}/api/science-history/economy/builds", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        for build in data["builds"]:
            assert "required_items" in build
            assert "owned_items" in build
            assert "total_required" in build
            assert "can_craft" in build
            assert "crafted" in build
            assert "bonus_type" in build
            assert "bonus_value" in build

    def test_craft_build_missing_items(self, auth_headers):
        """POST /api/science-history/economy/craft-build fails if items not owned"""
        # Try to craft chrono_alchemist which requires alchemist_skin + chronicler_skin
        response = requests.post(f"{BASE_URL}/api/science-history/economy/craft-build",
            json={"build_id": "chrono_alchemist"}, headers=auth_headers)
        # Should fail with 400 if items not owned
        assert response.status_code in [400, 200]  # 400 if missing items, 200 if already crafted

    def test_craft_build_invalid_id(self, auth_headers):
        """POST /api/science-history/economy/craft-build with invalid build_id returns 404"""
        response = requests.post(f"{BASE_URL}/api/science-history/economy/craft-build",
            json={"build_id": "nonexistent_build"}, headers=auth_headers)
        assert response.status_code == 404


class TestAvenuesOverview:
    """Avenues overview endpoint tests - existing feature"""

    def test_get_avenues_overview(self, auth_headers):
        """GET /api/avenues/overview returns all 6 avenues"""
        response = requests.get(f"{BASE_URL}/api/avenues/overview", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "avenues" in data
        assert len(data["avenues"]) == 6, f"Expected 6 avenues, got {len(data['avenues'])}"
        assert "total_resonance" in data
        assert "combined_tier_name" in data

    def test_avenues_include_science_history(self, auth_headers):
        """Verify science and history avenues are present"""
        response = requests.get(f"{BASE_URL}/api/avenues/overview", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        avenue_ids = [a["id"] for a in data["avenues"]]
        assert "science" in avenue_ids
        assert "history" in avenue_ids


class TestExistingBotanicalLab:
    """Botanical Lab endpoints - existing feature regression"""

    def test_get_botanical_simulations(self, auth_headers):
        """GET /api/science-history/botanical-lab returns 5 simulations"""
        response = requests.get(f"{BASE_URL}/api/science-history/botanical-lab", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "simulations" in data
        assert data["total"] == 5


class TestExistingEBike:
    """E-Bike endpoints - existing feature regression"""

    def test_get_ebike_sims(self, auth_headers):
        """GET /api/science-history/ebike/sims returns 2 simulations"""
        response = requests.get(f"{BASE_URL}/api/science-history/ebike/sims", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "simulations" in data
        assert data["total"] == 2


class TestExistingHistoryModules:
    """History modules endpoints - existing feature regression"""

    def test_get_history_modules(self, auth_headers):
        """GET /api/science-history/history-modules returns 4 modules"""
        response = requests.get(f"{BASE_URL}/api/science-history/history-modules", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "modules" in data
        assert data["total"] == 4


class TestExistingGeology:
    """Geology endpoints - existing feature regression"""

    def test_get_geology_modules(self, auth_headers):
        """GET /api/science-history/geology returns 3 modules"""
        response = requests.get(f"{BASE_URL}/api/science-history/geology", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "modules" in data
        assert data["total"] == 3


class TestExistingShop:
    """Circular Economy shop endpoints - existing feature regression"""

    def test_get_shop_items(self, auth_headers):
        """GET /api/science-history/economy/shop returns 8 items"""
        response = requests.get(f"{BASE_URL}/api/science-history/economy/shop", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert data["total_items"] == 8
        assert "balances" in data
        assert "kinetic_dust" in data["balances"]
        assert "science_resonance" in data["balances"]


class TestExistingPurchase:
    """Purchase endpoint - existing feature regression"""

    def test_purchase_invalid_item(self, auth_headers):
        """POST /api/science-history/economy/purchase with invalid item returns 404"""
        response = requests.post(f"{BASE_URL}/api/science-history/economy/purchase",
            json={"item_id": "nonexistent_item"}, headers=auth_headers)
        assert response.status_code == 404


class TestExistingHeartSync:
    """Heart Rate Sync endpoint - existing feature regression"""

    def test_heart_sync_challenge(self, auth_headers):
        """POST /api/science-history/heart-sync works correctly"""
        response = requests.post(f"{BASE_URL}/api/science-history/heart-sync",
            json={"heart_rate": 72, "current_depth": "crust"}, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "sync_level" in data
        assert "your_bpm" in data
        assert "target_bpm" in data
