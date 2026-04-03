"""
Iteration 240 Backend Tests — Culture Layers, Harmonic Memory, Hopi Star Culture
Tests for:
1. GET /api/culture-layers/ — returns 3 layers (hopi, egyptian, vedic)
2. GET /api/culture-layers/{layer_id} — returns full constellation data
3. POST /api/phonic/record-harmonic — records harmonic bookmark
4. GET /api/phonic/harmonic-memory — returns harmonic memory with closeness_factor
5. GET /api/star-chart/cultures/hopi — returns Hopi star culture data
6. POST /api/phonic/record-movement — regression test
7. POST /api/phonic/generate-flourish — regression test
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
    """Get authentication token for test user."""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        return data.get("token") or data.get("access_token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Return headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}"}


class TestCultureLayersAPI:
    """Tests for Multi-Civilization Star Charts — Culture Layers API"""

    def test_list_culture_layers(self, auth_headers):
        """GET /api/culture-layers/ returns 3 layers with metadata"""
        response = requests.get(f"{BASE_URL}/api/culture-layers/", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "layers" in data, "Response should contain 'layers' key"
        layers = data["layers"]
        
        # Should have exactly 3 layers: hopi, egyptian, vedic
        assert len(layers) == 3, f"Expected 3 layers, got {len(layers)}"
        
        layer_ids = [l["id"] for l in layers]
        assert "hopi" in layer_ids, "Hopi layer should be present"
        assert "egyptian" in layer_ids, "Egyptian layer should be present"
        assert "vedic" in layer_ids, "Vedic layer should be present"
        
        # Verify metadata structure for each layer
        for layer in layers:
            assert "id" in layer
            assert "name" in layer
            assert "culture" in layer
            assert "description" in layer
            assert "primary_color" in layer
            assert "accent_color" in layer
            assert "frequency" in layer
            assert "constellation_count" in layer
            assert "teaching_count" in layer
            assert layer["constellation_count"] > 0, f"Layer {layer['id']} should have constellations"

    def test_get_hopi_culture_layer(self, auth_headers):
        """GET /api/culture-layers/hopi returns full Hopi constellation data"""
        response = requests.get(f"{BASE_URL}/api/culture-layers/hopi", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["id"] == "hopi"
        assert data["name"] == "Hopi Star Knowledge"
        assert data["culture"] == "Hopi (Hopituh Shi-nu-mu)"
        assert data["frequency"] == 432
        
        # Verify constellations
        assert "constellations" in data
        constellations = data["constellations"]
        assert len(constellations) == 3, f"Hopi should have 3 constellations, got {len(constellations)}"
        
        constellation_ids = [c["id"] for c in constellations]
        assert "hopi_orion" in constellation_ids, "Hotomkam (Orion) should be present"
        assert "hopi_pleiades" in constellation_ids, "Tsootsma (Pleiades) should be present"
        assert "hopi_sirius" in constellation_ids, "Blue Star Kachina should be present"
        
        # Verify teachings
        assert "teachings" in data
        assert len(data["teachings"]) == 3, "Hopi should have 3 teachings"

    def test_get_egyptian_culture_layer(self, auth_headers):
        """GET /api/culture-layers/egyptian returns full Egyptian constellation data"""
        response = requests.get(f"{BASE_URL}/api/culture-layers/egyptian", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["id"] == "egyptian"
        assert data["name"] == "Egyptian Star Wisdom"
        assert data["frequency"] == 528
        
        assert "constellations" in data
        assert len(data["constellations"]) == 3, f"Egyptian should have 3 constellations"
        
        assert "teachings" in data
        assert len(data["teachings"]) == 3

    def test_get_vedic_culture_layer(self, auth_headers):
        """GET /api/culture-layers/vedic returns full Vedic constellation data"""
        response = requests.get(f"{BASE_URL}/api/culture-layers/vedic", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["id"] == "vedic"
        assert data["name"] == "Vedic Jyotish"
        assert data["frequency"] == 741
        
        assert "constellations" in data
        assert len(data["constellations"]) == 4, f"Vedic should have 4 constellations"
        
        assert "teachings" in data
        assert len(data["teachings"]) == 3

    def test_get_invalid_culture_layer(self, auth_headers):
        """GET /api/culture-layers/invalid returns 404"""
        response = requests.get(f"{BASE_URL}/api/culture-layers/invalid_layer", headers=auth_headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"


class TestHarmonicMemoryAPI:
    """Tests for Harmonic Memory — sphere pairing bookmarks"""

    def test_record_harmonic_bookmark(self, auth_headers):
        """POST /api/phonic/record-harmonic records a harmonic bookmark"""
        response = requests.post(f"{BASE_URL}/api/phonic/record-harmonic", 
            headers=auth_headers,
            json={
                "module_a": "starchart",
                "module_b": "meditation",
                "intensity": 0.75,
                "interval": "fifth"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["success"] == True
        assert "pair_key" in data
        # Pair key should be sorted alphabetically
        assert data["pair_key"] == "meditation-starchart"

    def test_record_harmonic_bookmark_different_pair(self, auth_headers):
        """POST /api/phonic/record-harmonic records another harmonic bookmark"""
        response = requests.post(f"{BASE_URL}/api/phonic/record-harmonic", 
            headers=auth_headers,
            json={
                "module_a": "mixer",
                "module_b": "wellness",
                "intensity": 0.85,
                "interval": "octave"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["pair_key"] == "mixer-wellness"

    def test_get_harmonic_memory(self, auth_headers):
        """GET /api/phonic/harmonic-memory returns harmonic memory with closeness_factor"""
        response = requests.get(f"{BASE_URL}/api/phonic/harmonic-memory", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "memories" in data
        assert "total_bookmarks" in data
        
        # Should have at least the bookmarks we just created
        memories = data["memories"]
        if len(memories) > 0:
            # Verify structure of memory entries
            mem = memories[0]
            assert "pair_key" in mem
            assert "module_a" in mem
            assert "module_b" in mem
            assert "interaction_count" in mem
            assert "avg_intensity" in mem
            assert "closeness_factor" in mem, "closeness_factor should be present"
            assert "suggested_angle_offset" in mem, "suggested_angle_offset should be present"
            assert "last_interval" in mem
            
            # Verify closeness_factor is within expected range (0 to 0.8)
            assert 0 <= mem["closeness_factor"] <= 0.8, f"closeness_factor should be 0-0.8, got {mem['closeness_factor']}"


class TestHopiStarCulture:
    """Tests for Hopi star culture in existing star-chart API"""

    def test_get_hopi_star_culture(self, auth_headers):
        """GET /api/star-chart/cultures/hopi returns Hopi star culture data"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures/hopi", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["id"] == "hopi"
        assert data["name"] == "Hopi Star Knowledge"  # Name from star_cultures_data.json
        assert "constellations" in data
        
        # Hopi should have 3 constellations
        constellations = data["constellations"]
        assert len(constellations) == 3, f"Hopi should have 3 constellations, got {len(constellations)}"
        
        # Verify constellation structure
        for const in constellations:
            assert "id" in const
            assert "name" in const
            assert "stars" in const
            assert "lines" in const
            assert "element" in const
            assert "mythology" in const

    def test_star_cultures_list_includes_hopi(self, auth_headers):
        """GET /api/star-chart/cultures includes hopi in the list"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "cultures" in data
        
        culture_ids = [c["id"] for c in data["cultures"]]
        assert "hopi" in culture_ids, "Hopi should be in the cultures list"
        
        # Verify total count is 21 (20 original + 1 hopi)
        # Note: The main agent mentioned 21 total cultures
        assert len(culture_ids) >= 21, f"Expected at least 21 cultures, got {len(culture_ids)}"


class TestPhonicAPIRegression:
    """Regression tests for existing Phonic API endpoints"""

    def test_record_movement(self, auth_headers):
        """POST /api/phonic/record-movement still works (regression)"""
        response = requests.post(f"{BASE_URL}/api/phonic/record-movement",
            headers=auth_headers,
            json={
                "route": "/star-chart",
                "duration_ms": 5000,
                "velocity": 0.5
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["success"] == True
        assert data["frequency"] == 852  # star-chart frequency
        assert data["route_key"] == "star-chart"

    def test_generate_flourish(self, auth_headers):
        """POST /api/phonic/generate-flourish still works (regression)"""
        response = requests.post(f"{BASE_URL}/api/phonic/generate-flourish",
            headers=auth_headers,
            json={"session_limit": 10}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "sonic_profile" in data
        
        profile = data["sonic_profile"]
        assert "base_frequency" in profile
        assert "pattern" in profile
        assert "tempo" in profile
        assert "source" in profile


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
