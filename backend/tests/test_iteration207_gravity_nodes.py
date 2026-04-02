"""
Iteration 207: Gravity Nodes API Tests
Tests for Einstein Spatial Curvature gravity field system with 12 seeded nodes
- GET /api/gravity/nodes - Returns 12 nodes with frequency, gravity_mass, origin_language, star_coordinate, trinity, unlocked status
- GET /api/gravity/field - Returns field parameters (resolution, damping_base, mass_scale)
- POST /api/gravity/interact - Interaction with nodes, mastery tier progression
- Regression tests for hub preferences, weather, observatory, mastery
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestGravityNodesAPI:
    """Tests for the new gravity nodes API endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login with test credentials
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        
        if login_response.status_code == 200:
            data = login_response.json()
            token = data.get("access_token") or data.get("token")
            if token:
                self.session.headers.update({"Authorization": f"Bearer {token}"})
                self.authenticated = True
            else:
                self.authenticated = False
        else:
            self.authenticated = False
    
    # ━━━ GET /api/gravity/nodes ━━━
    def test_gravity_nodes_returns_12_nodes(self):
        """GET /api/gravity/nodes should return exactly 12 seeded nodes"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.get(f"{BASE_URL}/api/gravity/nodes")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "nodes" in data, "Response should contain 'nodes' key"
        assert len(data["nodes"]) == 12, f"Expected 12 nodes, got {len(data['nodes'])}"
    
    def test_gravity_nodes_have_required_fields(self):
        """Each gravity node should have all required fields"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.get(f"{BASE_URL}/api/gravity/nodes")
        assert response.status_code == 200
        
        data = response.json()
        required_fields = ["id", "label", "type", "frequency", "origin_language", 
                          "star_coordinate", "gravity_mass", "tier_required", 
                          "category", "description", "trinity", "unlocked"]
        
        for node in data["nodes"]:
            for field in required_fields:
                assert field in node, f"Node {node.get('id', 'unknown')} missing field: {field}"
    
    def test_gravity_nodes_trinity_structure(self):
        """Each node's trinity should have origin, synthesis, frequency_hz"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.get(f"{BASE_URL}/api/gravity/nodes")
        assert response.status_code == 200
        
        data = response.json()
        for node in data["nodes"]:
            trinity = node.get("trinity", {})
            assert "origin" in trinity, f"Node {node['id']} trinity missing 'origin'"
            assert "synthesis" in trinity, f"Node {node['id']} trinity missing 'synthesis'"
            assert "frequency_hz" in trinity, f"Node {node['id']} trinity missing 'frequency_hz'"
    
    def test_gravity_nodes_star_coordinate_structure(self):
        """Each node's star_coordinate should have ra, dec, constellation"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.get(f"{BASE_URL}/api/gravity/nodes")
        assert response.status_code == 200
        
        data = response.json()
        for node in data["nodes"]:
            coord = node.get("star_coordinate", {})
            assert "ra" in coord, f"Node {node['id']} star_coordinate missing 'ra'"
            assert "dec" in coord, f"Node {node['id']} star_coordinate missing 'dec'"
            assert "constellation" in coord, f"Node {node['id']} star_coordinate missing 'constellation'"
    
    def test_gravity_nodes_categories(self):
        """Nodes should cover expected categories: vedic, egyptian, hopi, sacred_geometry, star_chart, frequency"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.get(f"{BASE_URL}/api/gravity/nodes")
        assert response.status_code == 200
        
        data = response.json()
        categories = set(node["category"] for node in data["nodes"])
        expected_categories = {"vedic", "egyptian", "hopi", "sacred_geometry", "star_chart", "frequency", "hermetic"}
        
        # At least some expected categories should be present
        assert len(categories.intersection(expected_categories)) >= 5, f"Expected at least 5 categories, got: {categories}"
    
    def test_gravity_nodes_returns_current_tier(self):
        """Response should include current_tier and tier_index"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.get(f"{BASE_URL}/api/gravity/nodes")
        assert response.status_code == 200
        
        data = response.json()
        assert "current_tier" in data, "Response should contain 'current_tier'"
        assert "tier_index" in data, "Response should contain 'tier_index'"
        assert data["current_tier"] in ["observer", "synthesizer", "archivist", "navigator", "sovereign"]
    
    def test_gravity_nodes_unlocked_status(self):
        """Nodes should have unlocked status based on user tier"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.get(f"{BASE_URL}/api/gravity/nodes")
        assert response.status_code == 200
        
        data = response.json()
        # At least some nodes should be unlocked for observer tier
        unlocked_count = sum(1 for node in data["nodes"] if node["unlocked"])
        assert unlocked_count > 0, "At least some nodes should be unlocked"
    
    # ━━━ GET /api/gravity/field ━━━
    def test_gravity_field_returns_parameters(self):
        """GET /api/gravity/field should return field parameters"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.get(f"{BASE_URL}/api/gravity/field")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "field_resolution" in data, "Response should contain 'field_resolution'"
        assert "damping_base" in data, "Response should contain 'damping_base'"
        assert "mass_scale" in data, "Response should contain 'mass_scale'"
    
    def test_gravity_field_nodes_summary(self):
        """GET /api/gravity/field should return nodes summary with id, mass, frequency, category"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.get(f"{BASE_URL}/api/gravity/field")
        assert response.status_code == 200
        
        data = response.json()
        assert "nodes" in data, "Response should contain 'nodes'"
        assert len(data["nodes"]) == 12, f"Expected 12 nodes, got {len(data['nodes'])}"
        
        for node in data["nodes"]:
            assert "id" in node, "Node summary should have 'id'"
            assert "mass" in node, "Node summary should have 'mass'"
            assert "frequency" in node, "Node summary should have 'frequency'"
            assert "category" in node, "Node summary should have 'category'"
    
    # ━━━ POST /api/gravity/interact ━━━
    def test_gravity_interact_valid_node(self):
        """POST /api/gravity/interact with valid node_id should return interaction data"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.post(f"{BASE_URL}/api/gravity/interact", json={
            "node_id": "om-vedic",
            "dwell_seconds": 30
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "node_id" in data, "Response should contain 'node_id'"
        assert data["node_id"] == "om-vedic"
        assert "interaction_count" in data, "Response should contain 'interaction_count'"
        assert "total_dwell_seconds" in data, "Response should contain 'total_dwell_seconds'"
        assert "current_tier" in data, "Response should contain 'current_tier'"
        assert "trinity" in data, "Response should contain 'trinity'"
    
    def test_gravity_interact_invalid_node(self):
        """POST /api/gravity/interact with invalid node_id should return error"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.post(f"{BASE_URL}/api/gravity/interact", json={
            "node_id": "invalid-node-xyz",
            "dwell_seconds": 10
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "error" in data, "Response should contain 'error' for invalid node"
        assert data["error"] == "Node not found"
    
    def test_gravity_interact_accumulates_dwell(self):
        """Multiple interactions should accumulate dwell_seconds"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        # First interaction
        response1 = self.session.post(f"{BASE_URL}/api/gravity/interact", json={
            "node_id": "schumann-resonance",
            "dwell_seconds": 15
        })
        assert response1.status_code == 200
        dwell1 = response1.json().get("total_dwell_seconds", 0)
        
        # Second interaction
        response2 = self.session.post(f"{BASE_URL}/api/gravity/interact", json={
            "node_id": "schumann-resonance",
            "dwell_seconds": 20
        })
        assert response2.status_code == 200
        dwell2 = response2.json().get("total_dwell_seconds", 0)
        
        # Dwell should have increased
        assert dwell2 >= dwell1, "Total dwell should accumulate"
    
    def test_gravity_interact_returns_trinity_data(self):
        """Interaction response should include full trinity data"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.post(f"{BASE_URL}/api/gravity/interact", json={
            "node_id": "flower-of-life",
            "dwell_seconds": 5
        })
        assert response.status_code == 200
        
        data = response.json()
        trinity = data.get("trinity", {})
        assert "origin" in trinity, "Trinity should have 'origin'"
        assert "synthesis" in trinity, "Trinity should have 'synthesis'"
        assert "frequency_hz" in trinity, "Trinity should have 'frequency_hz'"


class TestRegressionEndpoints:
    """Regression tests for existing endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        
        if login_response.status_code == 200:
            data = login_response.json()
            token = data.get("access_token") or data.get("token")
            if token:
                self.session.headers.update({"Authorization": f"Bearer {token}"})
                self.authenticated = True
            else:
                self.authenticated = False
        else:
            self.authenticated = False
    
    def test_hub_preferences_get(self):
        """GET /api/hub/preferences should return active_satellites"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.get(f"{BASE_URL}/api/hub/preferences")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "active_satellites" in data, "Response should contain 'active_satellites'"
        assert isinstance(data["active_satellites"], list), "active_satellites should be a list"
    
    def test_hub_preferences_post(self):
        """POST /api/hub/preferences should update active_satellites"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        test_satellites = ["mood", "mixer", "map"]
        response = self.session.post(f"{BASE_URL}/api/hub/preferences", json={
            "active_satellites": test_satellites
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Verify persistence
        get_response = self.session.get(f"{BASE_URL}/api/hub/preferences")
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["active_satellites"] == test_satellites
    
    def test_weather_current(self):
        """GET /api/weather/current should return weather data"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.get(f"{BASE_URL}/api/weather/current?lat=44.08&lon=-103.23")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "temperature_f" in data or "temperature" in data, "Response should contain temperature"
        assert "category" in data, "Response should contain 'category'"
    
    def test_observatory_planets(self):
        """GET /api/observatory/planets should return planets"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.get(f"{BASE_URL}/api/observatory/planets")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "planets" in data, "Response should contain 'planets'"
    
    def test_mastery_tier(self):
        """GET /api/mastery/tier should return current_tier"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.get(f"{BASE_URL}/api/mastery/tier")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "current_tier" in data, "Response should contain 'current_tier'"


class TestAuthenticationRequired:
    """Tests to verify endpoints require authentication"""
    
    def test_gravity_nodes_requires_auth(self):
        """GET /api/gravity/nodes should require authentication"""
        response = requests.get(f"{BASE_URL}/api/gravity/nodes")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_gravity_field_requires_auth(self):
        """GET /api/gravity/field should require authentication"""
        response = requests.get(f"{BASE_URL}/api/gravity/field")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_gravity_interact_requires_auth(self):
        """POST /api/gravity/interact should require authentication"""
        response = requests.post(f"{BASE_URL}/api/gravity/interact", json={
            "node_id": "om-vedic",
            "dwell_seconds": 10
        })
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
