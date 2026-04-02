"""
Iteration 201 — Architect's Workshop Module Tests
Tests for:
1. GET /api/workshop/platonic-solids - 5 Platonic solids with structural data
2. GET /api/workshop/materials - 8 materials with resonance profiles
3. GET /api/workshop/constants - Universal constants (phi, gravity, etc.)
4. POST /api/workshop/golden-ratio - Golden ratio calculator
5. POST /api/workshop/harmonic-nodes - Harmonic oscillation nodes/antinodes
6. POST /api/workshop/inverse-square - Inverse square law calculator
7. GET /api/mastery/tier - Regression test
8. POST /api/mastery/progress - Regression test
9. Brand cleanup - No 'Positive Energy Bar' in science_history.py
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
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Return headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}"}


class TestWorkshopPlatonicSolids:
    """Tests for GET /api/workshop/platonic-solids"""
    
    def test_get_platonic_solids_returns_5_solids(self, auth_headers):
        """Verify endpoint returns exactly 5 Platonic solids."""
        response = requests.get(f"{BASE_URL}/api/workshop/platonic-solids", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "solids" in data
        assert len(data["solids"]) == 5, f"Expected 5 solids, got {len(data['solids'])}"
    
    def test_platonic_solids_have_correct_ids(self, auth_headers):
        """Verify all 5 Platonic solid IDs are present."""
        response = requests.get(f"{BASE_URL}/api/workshop/platonic-solids", headers=auth_headers)
        data = response.json()
        
        expected_ids = {"tetrahedron", "hexahedron", "octahedron", "dodecahedron", "icosahedron"}
        actual_ids = {s["id"] for s in data["solids"]}
        assert actual_ids == expected_ids, f"Missing solids: {expected_ids - actual_ids}"
    
    def test_platonic_solids_have_structural_data(self, auth_headers):
        """Verify each solid has required structural fields."""
        response = requests.get(f"{BASE_URL}/api/workshop/platonic-solids", headers=auth_headers)
        data = response.json()
        
        required_fields = ["id", "name", "element", "faces", "edges", "vertices", "face_shape", 
                          "color", "structural_note", "construction_use", "frequency_hz"]
        
        for solid in data["solids"]:
            for field in required_fields:
                assert field in solid, f"Solid {solid.get('id', 'unknown')} missing field: {field}"
    
    def test_platonic_solids_euler_formula(self, auth_headers):
        """Verify Euler's formula V - E + F = 2 for each solid."""
        response = requests.get(f"{BASE_URL}/api/workshop/platonic-solids", headers=auth_headers)
        data = response.json()
        
        for solid in data["solids"]:
            euler = solid["vertices"] - solid["edges"] + solid["faces"]
            assert euler == 2, f"Euler's formula failed for {solid['id']}: V({solid['vertices']}) - E({solid['edges']}) + F({solid['faces']}) = {euler}"


class TestWorkshopMaterials:
    """Tests for GET /api/workshop/materials"""
    
    def test_get_materials_returns_8_materials(self, auth_headers):
        """Verify endpoint returns exactly 8 materials."""
        response = requests.get(f"{BASE_URL}/api/workshop/materials", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "materials" in data
        assert len(data["materials"]) == 8, f"Expected 8 materials, got {len(data['materials'])}"
    
    def test_materials_have_correct_ids(self, auth_headers):
        """Verify all 8 material IDs are present."""
        response = requests.get(f"{BASE_URL}/api/workshop/materials", headers=auth_headers)
        data = response.json()
        
        expected_ids = {"water", "sand", "glass", "steel", "wood_oak", "concrete", "copper", "crystal"}
        actual_ids = {m["id"] for m in data["materials"]}
        assert actual_ids == expected_ids, f"Missing materials: {expected_ids - actual_ids}"
    
    def test_materials_have_resonance_profiles(self, auth_headers):
        """Verify each material has resonance profile fields."""
        response = requests.get(f"{BASE_URL}/api/workshop/materials", headers=auth_headers)
        data = response.json()
        
        required_fields = ["id", "name", "density", "speed_of_sound", "resonance_note", "color"]
        
        for material in data["materials"]:
            for field in required_fields:
                assert field in material, f"Material {material.get('id', 'unknown')} missing field: {field}"
            # Verify density and speed_of_sound are positive numbers
            assert material["density"] > 0, f"Material {material['id']} has invalid density"
            assert material["speed_of_sound"] > 0, f"Material {material['id']} has invalid speed_of_sound"


class TestWorkshopConstants:
    """Tests for GET /api/workshop/constants"""
    
    def test_get_constants_returns_data(self, auth_headers):
        """Verify endpoint returns constants."""
        response = requests.get(f"{BASE_URL}/api/workshop/constants", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "constants" in data
    
    def test_constants_include_phi(self, auth_headers):
        """Verify phi (golden ratio) is included."""
        response = requests.get(f"{BASE_URL}/api/workshop/constants", headers=auth_headers)
        data = response.json()
        
        assert "phi" in data["constants"]
        phi = data["constants"]["phi"]
        assert abs(phi["value"] - 1.618) < 0.01, f"Phi value incorrect: {phi['value']}"
        assert phi["symbol"] == "φ"
    
    def test_constants_include_gravity(self, auth_headers):
        """Verify gravity constant is included."""
        response = requests.get(f"{BASE_URL}/api/workshop/constants", headers=auth_headers)
        data = response.json()
        
        assert "gravity" in data["constants"]
        gravity = data["constants"]["gravity"]
        assert abs(gravity["value"] - 9.8) < 0.1, f"Gravity value incorrect: {gravity['value']}"
    
    def test_constants_have_required_fields(self, auth_headers):
        """Verify each constant has required fields."""
        response = requests.get(f"{BASE_URL}/api/workshop/constants", headers=auth_headers)
        data = response.json()
        
        for key, const in data["constants"].items():
            assert "value" in const, f"Constant {key} missing 'value'"
            assert "symbol" in const, f"Constant {key} missing 'symbol'"
            assert "name" in const, f"Constant {key} missing 'name'"


class TestWorkshopGoldenRatio:
    """Tests for POST /api/workshop/golden-ratio"""
    
    def test_golden_ratio_with_dimension_100(self, auth_headers):
        """Verify golden ratio calculation with dimension=100."""
        response = requests.post(
            f"{BASE_URL}/api/workshop/golden-ratio",
            json={"dimension": 100},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "input" in data
        assert data["input"] == 100
        assert "phi" in data
        assert abs(data["phi"] - 1.618) < 0.01
        
        # Major segment should be ~61.8
        assert "golden_sections" in data
        major = data["golden_sections"][0]["value"]
        assert 61 < major < 62, f"Major segment incorrect: {major}"
        
        # Minor segment should be ~38.2
        minor = data["golden_sections"][1]["value"]
        assert 38 < minor < 39, f"Minor segment incorrect: {minor}"
    
    def test_golden_ratio_returns_nested_divisions(self, auth_headers):
        """Verify nested φ divisions up to depth 5."""
        response = requests.post(
            f"{BASE_URL}/api/workshop/golden-ratio",
            json={"dimension": 100},
            headers=auth_headers
        )
        data = response.json()
        
        assert "nested" in data
        assert len(data["nested"]) == 5, f"Expected 5 nested divisions, got {len(data['nested'])}"
        
        # Verify depths 1-5
        for i, n in enumerate(data["nested"]):
            assert n["depth"] == i + 1
    
    def test_golden_ratio_invalid_dimension(self, auth_headers):
        """Verify error handling for invalid dimension."""
        response = requests.post(
            f"{BASE_URL}/api/workshop/golden-ratio",
            json={"dimension": -10},
            headers=auth_headers
        )
        assert response.status_code == 200  # Returns error in body
        data = response.json()
        assert "error" in data


class TestWorkshopHarmonicNodes:
    """Tests for POST /api/workshop/harmonic-nodes"""
    
    def test_harmonic_nodes_with_harmonic_3_length_1(self, auth_headers):
        """Verify harmonic=3, length=1.0 returns 4 nodes and 3 antinodes."""
        response = requests.post(
            f"{BASE_URL}/api/workshop/harmonic-nodes",
            json={"harmonic": 3, "length": 1.0},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["harmonic"] == 3
        assert data["length"] == 1.0
        assert data["node_count"] == 4, f"Expected 4 nodes, got {data['node_count']}"
        assert data["antinode_count"] == 3, f"Expected 3 antinodes, got {data['antinode_count']}"
    
    def test_harmonic_nodes_returns_positions(self, auth_headers):
        """Verify nodes and antinodes positions are returned."""
        response = requests.post(
            f"{BASE_URL}/api/workshop/harmonic-nodes",
            json={"harmonic": 2, "length": 1.0},
            headers=auth_headers
        )
        data = response.json()
        
        assert "nodes" in data
        assert "antinodes" in data
        assert len(data["nodes"]) == data["node_count"]
        assert len(data["antinodes"]) == data["antinode_count"]
    
    def test_harmonic_nodes_returns_frequency(self, auth_headers):
        """Verify frequency is calculated."""
        response = requests.post(
            f"{BASE_URL}/api/workshop/harmonic-nodes",
            json={"harmonic": 1, "length": 1.0, "speed_of_sound": 343},
            headers=auth_headers
        )
        data = response.json()
        
        assert "frequency" in data
        assert "wavelength" in data
        # For harmonic=1, length=1, wavelength=2, frequency=343/2=171.5
        assert abs(data["wavelength"] - 2.0) < 0.01
        assert abs(data["frequency"] - 171.5) < 1


class TestWorkshopInverseSquare:
    """Tests for POST /api/workshop/inverse-square"""
    
    def test_inverse_square_power_1_distance_2(self, auth_headers):
        """Verify power=1.0, distance=2.0 returns ~103 dB."""
        response = requests.post(
            f"{BASE_URL}/api/workshop/inverse-square",
            json={"power": 1.0, "distance": 2.0},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["source_power_watts"] == 1.0
        assert data["distance_m"] == 2.0
        assert "db_spl" in data
        # At 2m from 1W source: I = 1/(4*pi*4) ≈ 0.0199, dB = 10*log10(0.0199/1e-12) ≈ 103
        assert 102 < data["db_spl"] < 104, f"Expected ~103 dB, got {data['db_spl']}"
    
    def test_inverse_square_returns_falloff_curve(self, auth_headers):
        """Verify falloff curve is returned."""
        response = requests.post(
            f"{BASE_URL}/api/workshop/inverse-square",
            json={"power": 1.0, "distance": 1.0},
            headers=auth_headers
        )
        data = response.json()
        
        assert "falloff_curve" in data
        assert len(data["falloff_curve"]) > 0
        
        # Verify each point has distance, intensity, db
        for point in data["falloff_curve"]:
            assert "distance" in point
            assert "intensity" in point
            assert "db" in point
    
    def test_inverse_square_invalid_distance(self, auth_headers):
        """Verify error handling for invalid distance."""
        response = requests.post(
            f"{BASE_URL}/api/workshop/inverse-square",
            json={"power": 1.0, "distance": 0},
            headers=auth_headers
        )
        data = response.json()
        assert "error" in data


class TestMasteryRegression:
    """Regression tests for mastery endpoints."""
    
    def test_mastery_tier_endpoint(self, auth_headers):
        """Verify GET /api/mastery/tier still works."""
        response = requests.get(f"{BASE_URL}/api/mastery/tier", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "current_tier" in data
    
    def test_mastery_progress_endpoint(self, auth_headers):
        """Verify POST /api/mastery/progress still works."""
        response = requests.post(
            f"{BASE_URL}/api/mastery/progress",
            json={"type": "practice_time", "seconds": 1},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"


class TestBrandCleanup:
    """Tests for brand cleanup - no 'Positive Energy Bar' text."""
    
    def test_no_positive_energy_bar_in_botanical_lab(self, auth_headers):
        """Verify 'Positive Energy Bar' is not in botanical lab simulations."""
        response = requests.get(f"{BASE_URL}/api/science-history/botanical-lab", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        text = str(data)
        assert "Positive Energy Bar" not in text, "Found 'Positive Energy Bar' in botanical lab data"
        # Should have 'Cosmic Resonance Bar Kit' instead
        assert "Cosmic Resonance Bar" in text, "Missing 'Cosmic Resonance Bar' in botanical lab data"


class TestWorkshopAuth:
    """Tests for workshop endpoint authentication."""
    
    def test_platonic_solids_requires_auth(self):
        """Verify endpoint requires authentication."""
        response = requests.get(f"{BASE_URL}/api/workshop/platonic-solids")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_materials_requires_auth(self):
        """Verify endpoint requires authentication."""
        response = requests.get(f"{BASE_URL}/api/workshop/materials")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_golden_ratio_requires_auth(self):
        """Verify endpoint requires authentication."""
        response = requests.post(f"{BASE_URL}/api/workshop/golden-ratio", json={"dimension": 100})
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
