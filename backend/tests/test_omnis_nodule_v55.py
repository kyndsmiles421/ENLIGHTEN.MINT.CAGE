"""
V55.0 Omnis-Nodule Integration Tests
Tests for ENLIGHTEN.MINT.CAFE recursive commonality architecture

Features tested:
- /api/omnis/sync - Master sync with COSMOS, CRAFT, HARVEST, EXCHANGE groups
- /api/omnis/cultures - 21 cultures with 103 total constellations
- /api/omnis/deep-lore/{culture_id}/{constellation_id} - Multi-layer mythology
- /api/omnis/award-learning - Credit award for authenticated users
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def auth_token(api_client):
    """Get authentication token"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")


@pytest.fixture(scope="module")
def authenticated_client(api_client, auth_token):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return api_client


class TestOmnisSyncEndpoint:
    """Tests for /api/omnis/sync - V55.0 Master Sync"""
    
    def test_omnis_sync_returns_200(self, api_client):
        """Sync endpoint should return 200"""
        response = api_client.get(f"{BASE_URL}/api/omnis/sync")
        assert response.status_code == 200
        print("✓ Omnis sync returns 200")
    
    def test_omnis_sync_has_version(self, api_client):
        """Sync should return V55.0 version"""
        response = api_client.get(f"{BASE_URL}/api/omnis/sync")
        data = response.json()
        assert data.get("version") == "V55.0"
        print("✓ Omnis sync returns V55.0 version")
    
    def test_omnis_sync_has_all_groups(self, api_client):
        """Sync should return COSMOS, CRAFT, HARVEST, EXCHANGE groups"""
        response = api_client.get(f"{BASE_URL}/api/omnis/sync")
        data = response.json()
        
        interconnected = data.get("interconnected_data", {})
        assert "COSMOS" in interconnected, "Missing COSMOS group"
        assert "CRAFT" in interconnected, "Missing CRAFT group"
        assert "HARVEST" in interconnected, "Missing HARVEST group"
        assert "EXCHANGE" in interconnected, "Missing EXCHANGE group"
        print("✓ Omnis sync has all 4 commonality groups")
    
    def test_omnis_sync_cosmos_has_lakota_default(self, api_client):
        """COSMOS should default to Lakota as foundational culture"""
        response = api_client.get(f"{BASE_URL}/api/omnis/sync")
        data = response.json()
        
        cosmos = data.get("interconnected_data", {}).get("COSMOS", {})
        assert cosmos.get("culture_id") == "lakota"
        assert cosmos.get("is_foundational") == True
        print("✓ COSMOS defaults to Lakota as foundational")
    
    def test_omnis_sync_exchange_has_rate(self, api_client):
        """EXCHANGE should have $15/hr rate"""
        response = api_client.get(f"{BASE_URL}/api/omnis/sync")
        data = response.json()
        
        exchange = data.get("interconnected_data", {}).get("EXCHANGE", {})
        assert "$15" in exchange.get("rate_card", "")
        print("✓ EXCHANGE has $15/hr rate")
    
    def test_omnis_sync_has_resonance(self, api_client):
        """Sync should include resonance calculation"""
        response = api_client.get(f"{BASE_URL}/api/omnis/sync")
        data = response.json()
        
        resonance = data.get("resonance", {})
        assert "base_resonance" in resonance
        assert resonance.get("base_resonance") == 8.4881
        print("✓ Omnis sync includes resonance with base 8.4881")
    
    def test_omnis_sync_with_culture_param(self, api_client):
        """Sync should accept culture parameter"""
        response = api_client.get(f"{BASE_URL}/api/omnis/sync?culture=mayan")
        data = response.json()
        
        cosmos = data.get("interconnected_data", {}).get("COSMOS", {})
        assert cosmos.get("culture_id") == "mayan"
        print("✓ Omnis sync accepts culture parameter")


class TestOmnisCulturesEndpoint:
    """Tests for /api/omnis/cultures - 21 cultures with 103 constellations"""
    
    def test_cultures_returns_200(self, api_client):
        """Cultures endpoint should return 200"""
        response = api_client.get(f"{BASE_URL}/api/omnis/cultures")
        assert response.status_code == 200
        print("✓ Cultures endpoint returns 200")
    
    def test_cultures_has_21_cultures(self, api_client):
        """Should return exactly 21 cultures"""
        response = api_client.get(f"{BASE_URL}/api/omnis/cultures")
        data = response.json()
        
        assert data.get("total_cultures") == 21
        assert len(data.get("cultures", [])) == 21
        print("✓ Returns 21 cultures")
    
    def test_cultures_has_103_constellations(self, api_client):
        """Should return 103 total constellations"""
        response = api_client.get(f"{BASE_URL}/api/omnis/cultures")
        data = response.json()
        
        assert data.get("total_constellations") == 103
        print("✓ Returns 103 total constellations")
    
    def test_lakota_is_foundational(self, api_client):
        """Lakota should be marked as foundational"""
        response = api_client.get(f"{BASE_URL}/api/omnis/cultures")
        data = response.json()
        
        assert data.get("foundational_culture") == "lakota"
        
        cultures = data.get("cultures", [])
        lakota = next((c for c in cultures if c.get("id") == "lakota"), None)
        assert lakota is not None
        assert lakota.get("is_foundational") == True
        print("✓ Lakota is marked as foundational")
    
    def test_lakota_is_first_in_list(self, api_client):
        """Lakota should be first in the cultures list"""
        response = api_client.get(f"{BASE_URL}/api/omnis/cultures")
        data = response.json()
        
        cultures = data.get("cultures", [])
        assert len(cultures) > 0
        assert cultures[0].get("id") == "lakota"
        print("✓ Lakota is first in cultures list")
    
    def test_each_culture_has_required_fields(self, api_client):
        """Each culture should have id, name, color, constellation_count"""
        response = api_client.get(f"{BASE_URL}/api/omnis/cultures")
        data = response.json()
        
        for culture in data.get("cultures", []):
            assert "id" in culture, f"Missing id in culture"
            assert "name" in culture, f"Missing name in {culture.get('id')}"
            assert "color" in culture, f"Missing color in {culture.get('id')}"
            assert "constellation_count" in culture, f"Missing constellation_count in {culture.get('id')}"
        print("✓ All cultures have required fields")


class TestDeepLoreEndpoint:
    """Tests for /api/omnis/deep-lore/{culture_id}/{constellation_id}"""
    
    def test_deep_lore_returns_200(self, api_client):
        """Deep lore endpoint should return 200 for valid constellation"""
        response = api_client.get(f"{BASE_URL}/api/omnis/deep-lore/lakota/nape")
        assert response.status_code == 200
        print("✓ Deep lore returns 200")
    
    def test_deep_lore_returns_404_for_invalid(self, api_client):
        """Deep lore should return 404 for invalid constellation"""
        response = api_client.get(f"{BASE_URL}/api/omnis/deep-lore/lakota/invalid_constellation")
        assert response.status_code == 404
        print("✓ Deep lore returns 404 for invalid constellation")
    
    def test_deep_lore_has_four_layers(self, api_client):
        """Deep lore should have surface, middle, deep, sacred layers"""
        response = api_client.get(f"{BASE_URL}/api/omnis/deep-lore/lakota/nape")
        data = response.json()
        
        layers = data.get("layers", {})
        assert "surface" in layers, "Missing surface layer"
        assert "middle" in layers, "Missing middle layer"
        assert "deep" in layers, "Missing deep layer"
        assert "sacred" in layers, "Missing sacred layer"
        print("✓ Deep lore has all 4 depth layers")
    
    def test_deep_lore_layers_have_names(self, api_client):
        """Each layer should have name and description"""
        response = api_client.get(f"{BASE_URL}/api/omnis/deep-lore/lakota/nape")
        data = response.json()
        
        layers = data.get("layers", {})
        expected_names = {
            "surface": "The Visible",
            "middle": "The Story",
            "deep": "The Lesson",
            "sacred": "The Sacred"
        }
        
        for layer_key, expected_name in expected_names.items():
            layer = layers.get(layer_key, {})
            assert layer.get("name") == expected_name, f"Layer {layer_key} has wrong name"
            assert "description" in layer, f"Layer {layer_key} missing description"
        print("✓ All layers have correct names and descriptions")
    
    def test_deep_lore_has_cross_nodule_connections(self, api_client):
        """Deep lore should have CRAFT, HARVEST, EXCHANGE connections"""
        response = api_client.get(f"{BASE_URL}/api/omnis/deep-lore/lakota/nape")
        data = response.json()
        
        connections = data.get("cross_nodule_connections", {})
        assert "CRAFT" in connections, "Missing CRAFT connection"
        assert "HARVEST" in connections, "Missing HARVEST connection"
        assert "EXCHANGE" in connections, "Missing EXCHANGE connection"
        print("✓ Deep lore has cross-nodule connections")
    
    def test_deep_lore_has_mythology(self, api_client):
        """Deep lore should include mythology with figure, story, lesson"""
        response = api_client.get(f"{BASE_URL}/api/omnis/deep-lore/lakota/nape")
        data = response.json()
        
        mythology = data.get("mythology", {})
        assert "figure" in mythology, "Missing mythology figure"
        assert "story" in mythology, "Missing mythology story"
        assert "lesson" in mythology, "Missing mythology lesson"
        print("✓ Deep lore has mythology with figure, story, lesson")
    
    def test_deep_lore_has_constellation_info(self, api_client):
        """Deep lore should include constellation details"""
        response = api_client.get(f"{BASE_URL}/api/omnis/deep-lore/lakota/nape")
        data = response.json()
        
        constellation = data.get("constellation", {})
        assert constellation.get("id") == "nape"
        assert constellation.get("culture_id") == "lakota"
        assert "stars" in constellation
        print("✓ Deep lore has constellation info")
    
    def test_deep_lore_works_for_multiple_cultures(self, api_client):
        """Deep lore should work for different cultures"""
        test_cases = [
            ("mayan", "ak_ek"),
            ("egyptian", "sah"),
            ("chinese", "qing_long"),
        ]
        
        for culture_id, constellation_id in test_cases:
            response = api_client.get(f"{BASE_URL}/api/omnis/deep-lore/{culture_id}/{constellation_id}")
            assert response.status_code == 200, f"Failed for {culture_id}/{constellation_id}"
            data = response.json()
            assert "layers" in data
        print("✓ Deep lore works for multiple cultures")


class TestAwardLearningEndpoint:
    """Tests for /api/omnis/award-learning - Credit award system"""
    
    def test_award_learning_requires_auth(self, api_client):
        """Award learning should require authentication"""
        # Remove auth header if present
        api_client.headers.pop("Authorization", None)
        
        response = api_client.post(
            f"{BASE_URL}/api/omnis/award-learning?constellation_id=nape&culture_id=lakota"
        )
        assert response.status_code == 401
        print("✓ Award learning requires authentication")
    
    def test_award_learning_with_auth(self, authenticated_client):
        """Award learning should work with authentication"""
        response = authenticated_client.post(
            f"{BASE_URL}/api/omnis/award-learning?constellation_id=nape&culture_id=lakota"
        )
        assert response.status_code == 200
        print("✓ Award learning works with authentication")
    
    def test_award_learning_returns_credit_info(self, authenticated_client):
        """Award learning should return credit hours and value"""
        response = authenticated_client.post(
            f"{BASE_URL}/api/omnis/award-learning?constellation_id=mato_tipila&culture_id=lakota"
        )
        data = response.json()
        
        assert data.get("awarded") == True
        assert data.get("credit_hours") == 0.25
        assert "$3.75" in data.get("credit_value", "")
        assert "$15" in data.get("rate", "")
        print("✓ Award learning returns correct credit info ($3.75 for 0.25 hours at $15/hr)")


class TestFoundationalCultureEndpoint:
    """Tests for /api/omnis/foundational-culture"""
    
    def test_foundational_culture_returns_200(self, api_client):
        """Foundational culture endpoint should return 200"""
        response = api_client.get(f"{BASE_URL}/api/omnis/foundational-culture")
        assert response.status_code == 200
        print("✓ Foundational culture returns 200")
    
    def test_foundational_culture_is_lakota(self, api_client):
        """Foundational culture should be Lakota"""
        response = api_client.get(f"{BASE_URL}/api/omnis/foundational-culture")
        data = response.json()
        
        foundational = data.get("foundational", {})
        assert foundational.get("id") == "lakota"
        assert foundational.get("is_foundational") == True
        print("✓ Foundational culture is Lakota")
    
    def test_foundational_has_local_resonance(self, api_client):
        """Foundational culture should have Black Hills local resonance"""
        response = api_client.get(f"{BASE_URL}/api/omnis/foundational-culture")
        data = response.json()
        
        foundational = data.get("foundational", {})
        local_resonance = foundational.get("local_resonance", {})
        assert "Black Hills" in local_resonance.get("region", "")
        print("✓ Foundational culture has Black Hills local resonance")
    
    def test_has_orbital_cultures(self, api_client):
        """Should return orbital cultures"""
        response = api_client.get(f"{BASE_URL}/api/omnis/foundational-culture")
        data = response.json()
        
        orbitals = data.get("orbitals", [])
        assert len(orbitals) > 0
        for orbital in orbitals:
            assert orbital.get("is_orbital") == True
        print("✓ Has orbital cultures")


class TestCommonalityGroupsEndpoint:
    """Tests for /api/omnis/commonality-groups"""
    
    def test_commonality_groups_returns_200(self, api_client):
        """Commonality groups endpoint should return 200"""
        response = api_client.get(f"{BASE_URL}/api/omnis/commonality-groups")
        assert response.status_code == 200
        print("✓ Commonality groups returns 200")
    
    def test_has_all_four_groups(self, api_client):
        """Should have COSMOS, CRAFT, HARVEST, EXCHANGE groups"""
        response = api_client.get(f"{BASE_URL}/api/omnis/commonality-groups")
        data = response.json()
        
        groups = data.get("groups", {})
        assert "COSMOS" in groups
        assert "CRAFT" in groups
        assert "HARVEST" in groups
        assert "EXCHANGE" in groups
        print("✓ Has all 4 commonality groups")
    
    def test_has_cross_talk_map(self, api_client):
        """Should have cross-talk relationships"""
        response = api_client.get(f"{BASE_URL}/api/omnis/commonality-groups")
        data = response.json()
        
        cross_talk = data.get("cross_talk_map", {})
        assert "COSMOS -> CRAFT" in cross_talk
        assert "CRAFT -> EXCHANGE" in cross_talk
        print("✓ Has cross-talk map")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
