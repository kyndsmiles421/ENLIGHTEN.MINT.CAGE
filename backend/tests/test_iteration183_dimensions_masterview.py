"""
Iteration 183 Tests: Dimensional Space (3D/4D/5D), Master View Audit, Collective Shadow Map

Tests:
- GET /api/dimensions/grid — 12-cell multiverse grid (4 depths × 3 dimensions)
- POST /api/dimensions/phase-shift — shift between 3D/4D/5D (gated by consciousness level)
- GET /api/dimensions/status — current dimension, depth, cell_id, shift history
- GET /api/dimensions/collective-shadow-map — global shadow collapse hotspots
- GET /api/master-view/audit — comprehensive system audit
- Regression: Planetary Depths and Quantum Field still work
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from iteration 182
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    assert response.status_code == 200, f"Login failed: {response.text}"
    data = response.json()
    assert "token" in data, "No token in login response"
    return data["token"]


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Auth headers for authenticated requests"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestDimensionalGrid:
    """Tests for GET /api/dimensions/grid — 12-cell multiverse grid"""
    
    def test_grid_returns_12_cells(self, auth_headers):
        """Grid should return exactly 12 cells (4 depths × 3 dimensions)"""
        response = requests.get(f"{BASE_URL}/api/dimensions/grid", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "grid" in data
        assert len(data["grid"]) == 12, f"Expected 12 cells, got {len(data['grid'])}"
        
    def test_grid_has_correct_structure(self, auth_headers):
        """Each grid cell should have required fields"""
        response = requests.get(f"{BASE_URL}/api/dimensions/grid", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        for cell in data["grid"]:
            assert "cell_id" in cell
            assert "depth" in cell
            assert "dimension" in cell
            assert "accessible" in cell
            assert "is_current" in cell
            assert "color" in cell
            
    def test_grid_has_all_depths(self, auth_headers):
        """Grid should contain all 4 depth layers"""
        response = requests.get(f"{BASE_URL}/api/dimensions/grid", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        depths = set(cell["depth"] for cell in data["grid"])
        expected_depths = {"crust", "mantle", "outer_core", "hollow_earth"}
        assert depths == expected_depths, f"Missing depths: {expected_depths - depths}"
        
    def test_grid_has_all_dimensions(self, auth_headers):
        """Grid should contain all 3 dimensions (3d, 4d, 5d)"""
        response = requests.get(f"{BASE_URL}/api/dimensions/grid", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        dimensions = set(cell["dimension"] for cell in data["grid"])
        expected_dims = {"3d", "4d", "5d"}
        assert dimensions == expected_dims, f"Missing dimensions: {expected_dims - dimensions}"
        
    def test_grid_returns_dimensions_info(self, auth_headers):
        """Grid should return dimension definitions"""
        response = requests.get(f"{BASE_URL}/api/dimensions/grid", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "dimensions" in data
        assert len(data["dimensions"]) == 3
        
        for dim in data["dimensions"]:
            assert "id" in dim
            assert "name" in dim
            assert "consciousness_required" in dim
            assert "color" in dim
            
    def test_grid_returns_current_position(self, auth_headers):
        """Grid should return user's current position"""
        response = requests.get(f"{BASE_URL}/api/dimensions/grid", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "current_position" in data
        pos = data["current_position"]
        assert "depth" in pos
        assert "dimension" in pos
        assert "cell_id" in pos
        
    def test_grid_returns_consciousness_level(self, auth_headers):
        """Grid should return user's consciousness level"""
        response = requests.get(f"{BASE_URL}/api/dimensions/grid", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "consciousness_level" in data
        assert isinstance(data["consciousness_level"], int)
        
    def test_grid_returns_grid_size(self, auth_headers):
        """Grid should return grid size metadata"""
        response = requests.get(f"{BASE_URL}/api/dimensions/grid", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "grid_size" in data
        assert data["grid_size"]["depths"] == 4
        assert data["grid_size"]["dimensions"] == 3
        assert data["grid_size"]["total_cells"] == 12
        
    def test_grid_cell_ids_match_pattern(self, auth_headers):
        """Cell IDs should follow {depth}_{dimension} pattern"""
        response = requests.get(f"{BASE_URL}/api/dimensions/grid", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        expected_cells = [
            "crust_3d", "crust_4d", "crust_5d",
            "mantle_3d", "mantle_4d", "mantle_5d",
            "outer_core_3d", "outer_core_4d", "outer_core_5d",
            "hollow_earth_3d", "hollow_earth_4d", "hollow_earth_5d"
        ]
        actual_cells = [cell["cell_id"] for cell in data["grid"]]
        
        for expected in expected_cells:
            assert expected in actual_cells, f"Missing cell: {expected}"


class TestPhaseShift:
    """Tests for POST /api/dimensions/phase-shift — dimension shifting"""
    
    def test_phase_shift_requires_auth(self):
        """Phase-shift should require authentication"""
        response = requests.post(f"{BASE_URL}/api/dimensions/phase-shift", json={
            "target_dimension": "4d"
        })
        assert response.status_code == 401 or response.status_code == 403
        
    def test_phase_shift_invalid_dimension(self, auth_headers):
        """Phase-shift to invalid dimension should fail"""
        response = requests.post(f"{BASE_URL}/api/dimensions/phase-shift", 
            json={"target_dimension": "6d"},
            headers=auth_headers
        )
        assert response.status_code == 400
        
    def test_phase_shift_to_4d_requires_level_2(self, auth_headers):
        """Phase-shift to 4D requires consciousness level 2"""
        # Test user has level 1, so this should fail with 403
        response = requests.post(f"{BASE_URL}/api/dimensions/phase-shift",
            json={"target_dimension": "4d"},
            headers=auth_headers
        )
        # Should be 403 (forbidden) because level 1 < required level 2
        assert response.status_code == 403
        assert "consciousness level" in response.json().get("detail", "").lower()
        
    def test_phase_shift_to_5d_requires_level_3(self, auth_headers):
        """Phase-shift to 5D requires consciousness level 3"""
        response = requests.post(f"{BASE_URL}/api/dimensions/phase-shift",
            json={"target_dimension": "5d"},
            headers=auth_headers
        )
        assert response.status_code == 403
        
    def test_phase_shift_to_same_dimension_fails(self, auth_headers):
        """Cannot phase-shift to current dimension"""
        # First get current dimension
        status_res = requests.get(f"{BASE_URL}/api/dimensions/status", headers=auth_headers)
        current_dim = status_res.json().get("current_dimension", "3d")
        
        response = requests.post(f"{BASE_URL}/api/dimensions/phase-shift",
            json={"target_dimension": current_dim},
            headers=auth_headers
        )
        assert response.status_code == 400
        assert "already" in response.json().get("detail", "").lower()


class TestDimensionalStatus:
    """Tests for GET /api/dimensions/status — current dimensional state"""
    
    def test_status_returns_current_dimension(self, auth_headers):
        """Status should return current dimension"""
        response = requests.get(f"{BASE_URL}/api/dimensions/status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "current_dimension" in data
        assert data["current_dimension"] in ["3d", "4d", "5d"]
        
    def test_status_returns_dimension_info(self, auth_headers):
        """Status should return dimension info object"""
        response = requests.get(f"{BASE_URL}/api/dimensions/status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "dimension_info" in data
        info = data["dimension_info"]
        assert "id" in info
        assert "name" in info
        assert "color" in info
        
    def test_status_returns_current_depth(self, auth_headers):
        """Status should return current depth layer"""
        response = requests.get(f"{BASE_URL}/api/dimensions/status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "current_depth" in data
        assert data["current_depth"] in ["crust", "mantle", "outer_core", "hollow_earth"]
        
    def test_status_returns_cell_id(self, auth_headers):
        """Status should return combined cell_id"""
        response = requests.get(f"{BASE_URL}/api/dimensions/status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "cell_id" in data
        # Cell ID should be {depth}_{dimension}
        assert "_" in data["cell_id"]
        
    def test_status_returns_shift_history(self, auth_headers):
        """Status should return shift history (last 10)"""
        response = requests.get(f"{BASE_URL}/api/dimensions/status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "shift_history" in data
        assert isinstance(data["shift_history"], list)
        
    def test_status_returns_total_shifts(self, auth_headers):
        """Status should return total shift count"""
        response = requests.get(f"{BASE_URL}/api/dimensions/status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "total_shifts" in data
        assert isinstance(data["total_shifts"], int)


class TestCollectiveShadowMap:
    """Tests for GET /api/dimensions/collective-shadow-map — global shadow heatmap"""
    
    def test_shadow_map_returns_hotspots(self, auth_headers):
        """Shadow map should return hotspots array"""
        response = requests.get(f"{BASE_URL}/api/dimensions/collective-shadow-map", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "hotspots" in data
        assert isinstance(data["hotspots"], list)
        
    def test_shadow_map_returns_global_stats(self, auth_headers):
        """Shadow map should return global statistics"""
        response = requests.get(f"{BASE_URL}/api/dimensions/collective-shadow-map", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "global_stats" in data
        stats = data["global_stats"]
        # Stats may be empty if no shadows collapsed yet
        assert isinstance(stats, dict)
        
    def test_shadow_map_returns_description(self, auth_headers):
        """Shadow map should return map description"""
        response = requests.get(f"{BASE_URL}/api/dimensions/collective-shadow-map", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "map_description" in data
        assert len(data["map_description"]) > 0


class TestMasterViewAudit:
    """Tests for GET /api/master-view/audit — comprehensive system audit"""
    
    def test_audit_returns_player_section(self, auth_headers):
        """Audit should return player info section"""
        response = requests.get(f"{BASE_URL}/api/master-view/audit", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "player" in data
        player = data["player"]
        assert "name" in player
        assert "consciousness_level" in player
        assert "xp" in player
        assert "dust" in player
        
    def test_audit_returns_stratigraphy_section(self, auth_headers):
        """Audit should return planetary stratigraphy section"""
        response = requests.get(f"{BASE_URL}/api/master-view/audit", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "stratigraphy" in data
        strat = data["stratigraphy"]
        assert "current_layer" in strat
        assert "layer_name" in strat
        assert "frequency_hz" in strat
        assert "status" in strat
        
    def test_audit_returns_psyche_section(self, auth_headers):
        """Audit should return psyche tracking section"""
        response = requests.get(f"{BASE_URL}/api/master-view/audit", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "psyche" in data
        psyche = data["psyche"]
        assert "current_state" in psyche
        assert "archetype_name" in psyche
        assert "status" in psyche
        
    def test_audit_returns_dimensional_section(self, auth_headers):
        """Audit should return dimensional grid section"""
        response = requests.get(f"{BASE_URL}/api/master-view/audit", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "dimensional" in data
        dim = data["dimensional"]
        assert "current_dimension" in dim
        assert "dimension_name" in dim
        assert "cell_id" in dim
        assert "total_shifts" in dim
        assert "status" in dim
        
    def test_audit_returns_quantum_section(self, auth_headers):
        """Audit should return quantum mechanics section"""
        response = requests.get(f"{BASE_URL}/api/master-view/audit", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "quantum" in data
        quantum = data["quantum"]
        assert "shadows_collapsed" in quantum
        assert "entanglement_bonds" in quantum
        assert "status" in quantum
        
    def test_audit_returns_frequency_scaling_section(self, auth_headers):
        """Audit should return frequency scaling section"""
        response = requests.get(f"{BASE_URL}/api/master-view/audit", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "frequency_scaling" in data
        freq = data["frequency_scaling"]
        assert "current_hz" in freq
        assert "scale" in freq
        assert "status" in freq
        
    def test_audit_returns_subsystems_section(self, auth_headers):
        """Audit should return subsystems status section"""
        response = requests.get(f"{BASE_URL}/api/master-view/audit", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "subsystems" in data
        subs = data["subsystems"]
        assert "energy_gates" in subs
        assert "resonance" in subs
        assert "hotspots" in subs
        assert "inventory" in subs
        
    def test_audit_returns_system_health_section(self, auth_headers):
        """Audit should return system health section"""
        response = requests.get(f"{BASE_URL}/api/master-view/audit", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "system_health" in data
        health = data["system_health"]
        assert "backend" in health
        assert "frontend" in health
        assert "overall" in health
        
    def test_audit_returns_timestamp(self, auth_headers):
        """Audit should return timestamp"""
        response = requests.get(f"{BASE_URL}/api/master-view/audit", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "timestamp" in data


class TestRegressionPlanetaryDepths:
    """Regression tests for Planetary Depths (Iteration 182)"""
    
    def test_planetary_layers_still_works(self, auth_headers):
        """GET /api/planetary/layers should still work"""
        response = requests.get(f"{BASE_URL}/api/planetary/layers", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "layers" in data
        assert len(data["layers"]) == 4
        
    def test_planetary_depth_status_still_works(self, auth_headers):
        """GET /api/planetary/depth-status should still work"""
        response = requests.get(f"{BASE_URL}/api/planetary/depth-status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "current_layer" in data
        assert "psyche_state" in data
        
    def test_planetary_frequency_map_still_works(self):
        """GET /api/planetary/frequency-map should still work (no auth)"""
        response = requests.get(f"{BASE_URL}/api/planetary/frequency-map")
        assert response.status_code == 200
        data = response.json()
        assert "frequency_map" in data


class TestRegressionQuantumField:
    """Regression tests for Quantum Field (Iteration 182)"""
    
    def test_quantum_shadows_nearby_still_works(self, auth_headers):
        """GET /api/quantum/shadows/nearby should still work"""
        response = requests.get(
            f"{BASE_URL}/api/quantum/shadows/nearby?lat=44.0805&lng=-103.231",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "sprites" in data  # API returns "sprites" not "shadows"
        
    def test_quantum_shadows_history_still_works(self, auth_headers):
        """GET /api/quantum/shadows/history should still work"""
        response = requests.get(f"{BASE_URL}/api/quantum/shadows/history", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "history" in data  # API returns "history" not "collapsed"
        
    def test_quantum_tunneling_costs_still_works(self, auth_headers):
        """GET /api/quantum/tunneling-costs should still work"""
        response = requests.get(f"{BASE_URL}/api/quantum/tunneling-costs", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "costs" in data
        
    def test_quantum_entanglements_still_works(self, auth_headers):
        """GET /api/quantum/entanglements should still work"""
        response = requests.get(f"{BASE_URL}/api/quantum/entanglements", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "entanglements" in data  # API returns "entanglements" not "bonds"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
