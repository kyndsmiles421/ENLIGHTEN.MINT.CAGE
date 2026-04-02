"""
Iteration 189 Tests: Power Spots, Celestial Nodes, Dimensional Layering, Celestial Forge
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Features tested:
- Power Spots CRUD (admin-configurable legendary nodes with 5x multiplier)
- Power Spot harvesting with distance validation
- Celestial Nodes (6 nodes with RA/Dec coordinates)
- Celestial Alignment (requires 60%+ accuracy)
- Quadratic Decay for celestial resonance (0.9^t²)
- Celestial Forge patterns (741/852/963Hz Higher Solfeggio)
- Location-Locked Education Packs
- Regression: Previous cosmic map endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


class TestAuth:
    """Authentication for test user"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip(f"Auth failed: {response.status_code} - {response.text}")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Auth headers for authenticated requests"""
        return {"Authorization": f"Bearer {auth_token}"}


class TestPowerSpots(TestAuth):
    """Power Spots CRUD and Harvest tests"""
    
    def test_get_power_spots(self, auth_headers):
        """GET /api/cosmic-map/power-spots returns active Power Spots"""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/power-spots", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "power_spots" in data
        assert "total" in data
        assert isinstance(data["power_spots"], list)
        print(f"✓ GET power-spots: {data['total']} active spots")
        
        # Check existing Enlightenment Cafe spot
        if data["total"] > 0:
            spot = data["power_spots"][0]
            assert "id" in spot
            assert "name" in spot
            assert "lat" in spot
            assert "lng" in spot
            assert "reward_multiplier" in spot
            assert spot["type"] == "power_spot"
            assert spot["rarity"] == "legendary"
            print(f"  Found: {spot['name']} at ({spot['lat']}, {spot['lng']}) - {spot['reward_multiplier']}x")
    
    def test_create_power_spot(self, auth_headers):
        """POST /api/cosmic-map/power-spots creates a Power Spot"""
        payload = {
            "name": "TEST_Cosmic_Nexus_189",
            "lat": 40.7580,
            "lng": -73.9855,
            "description": "Test Power Spot for iteration 189",
            "reward_multiplier": 5.0,
            "harvest_radius_meters": 100,
            "active": True
        }
        response = requests.post(f"{BASE_URL}/api/cosmic-map/power-spots", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "id" in data
        assert data["name"] == payload["name"]
        assert data["lat"] == payload["lat"]
        assert data["lng"] == payload["lng"]
        assert data["reward_multiplier"] == 5.0
        print(f"✓ Created Power Spot: {data['name']} (id: {data['id']})")
        return data["id"]
    
    def test_update_power_spot(self, auth_headers):
        """PUT /api/cosmic-map/power-spots/{id} updates a Power Spot"""
        # First get existing spots to find one to update
        get_resp = requests.get(f"{BASE_URL}/api/cosmic-map/power-spots", headers=auth_headers)
        spots = get_resp.json().get("power_spots", [])
        
        if not spots:
            pytest.skip("No power spots to update")
        
        spot_id = spots[0]["id"]
        update_payload = {
            "description": "Updated description for testing",
            "reward_multiplier": 6.0
        }
        response = requests.put(f"{BASE_URL}/api/cosmic-map/power-spots/{spot_id}", json=update_payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "updated_fields" in data
        print(f"✓ Updated Power Spot {spot_id}: {data['updated_fields']}")
    
    def test_harvest_power_spot_distance_error(self, auth_headers):
        """POST /api/cosmic-map/power-spots/harvest returns distance error when too far"""
        # Get a power spot
        get_resp = requests.get(f"{BASE_URL}/api/cosmic-map/power-spots", headers=auth_headers)
        spots = get_resp.json().get("power_spots", [])
        
        if not spots:
            pytest.skip("No power spots to harvest")
        
        spot = spots[0]
        # Use coordinates far from the spot
        payload = {
            "spot_id": spot["id"],
            "user_lat": 0.0,  # Far away
            "user_lng": 0.0
        }
        response = requests.post(f"{BASE_URL}/api/cosmic-map/power-spots/harvest", json=payload, headers=auth_headers)
        # Should return 400 with distance error
        assert response.status_code == 400
        assert "Too far" in response.json().get("detail", "")
        print(f"✓ Power Spot harvest correctly returns distance error")


class TestCelestialNodes(TestAuth):
    """Celestial Nodes and Alignment tests"""
    
    def test_get_celestial_nodes(self, auth_headers):
        """GET /api/cosmic-map/celestial/nodes returns 6 celestial nodes"""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/celestial/nodes", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "nodes" in data
        assert "total" in data
        assert data["total"] == 6
        
        nodes = data["nodes"]
        assert len(nodes) == 6
        
        # Verify node structure
        expected_nodes = ["orion_gate", "sirius_nexus", "pleiades_beacon", "vega_alignment", "polaris_lock", "antares_bridge"]
        node_ids = [n["id"] for n in nodes]
        for expected in expected_nodes:
            assert expected in node_ids, f"Missing celestial node: {expected}"
        
        # Check node properties
        for node in nodes:
            assert "id" in node
            assert "name" in node
            assert "constellation" in node
            assert "ra" in node  # Right Ascension
            assert "dec" in node  # Declination
            assert "frequency" in node
            assert node["frequency"] in [741, 852, 963]  # Higher Solfeggio
            assert "chart_x" in node  # Canvas coordinates
            assert "chart_y" in node
            assert node["type"] == "celestial"
        
        print(f"✓ GET celestial/nodes: {data['total']} nodes with RA/Dec coordinates")
        for n in nodes:
            print(f"  {n['name']} ({n['constellation']}): {n['frequency']}Hz, RA={n['ra']}, Dec={n['dec']}")
    
    def test_celestial_align_success(self, auth_headers):
        """POST /api/cosmic-map/celestial/align aligns with 60%+ accuracy"""
        payload = {
            "node_id": "vega_alignment",
            "alignment_accuracy": 0.75  # 75% accuracy
        }
        response = requests.post(f"{BASE_URL}/api/cosmic-map/celestial/align", json=payload, headers=auth_headers)
        
        # May return 400 if already aligned today
        if response.status_code == 400 and "Already aligned" in response.json().get("detail", ""):
            print("✓ Celestial align: Already aligned today (expected)")
            return
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "node_name" in data
        assert "constellation" in data
        assert "frequency" in data
        assert "accuracy" in data
        assert "reward_amount" in data
        print(f"✓ Celestial align: {data['node_name']} at {data['frequency']}Hz, accuracy={data['accuracy']}%")
    
    def test_celestial_align_low_accuracy_fails(self, auth_headers):
        """POST /api/cosmic-map/celestial/align fails with <60% accuracy"""
        payload = {
            "node_id": "polaris_lock",
            "alignment_accuracy": 0.45  # 45% - too low
        }
        response = requests.post(f"{BASE_URL}/api/cosmic-map/celestial/align", json=payload, headers=auth_headers)
        
        # May return 400 if already aligned
        if response.status_code == 400 and "Already aligned" in response.json().get("detail", ""):
            print("✓ Celestial align low accuracy: Already aligned today")
            return
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert "60%" in data.get("message", "")
        print(f"✓ Celestial align correctly rejects low accuracy: {data['message']}")


class TestCelestialDecay(TestAuth):
    """Quadratic Decay for celestial resonance"""
    
    def test_get_celestial_decay_status(self, auth_headers):
        """GET /api/cosmic-map/celestial/decay-status returns quadratic decay info"""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/celestial/decay-status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "quadratic_decay_active" in data
        assert "days_inactive" in data
        assert "decay_factor" in data
        assert "message" in data
        
        print(f"✓ Celestial decay status: active={data['quadratic_decay_active']}, days={data['days_inactive']}, factor={data['decay_factor']}")


class TestCelestialForge(TestAuth):
    """Celestial Forge with Higher Solfeggio frequencies (741/852/963Hz)"""
    
    def test_get_celestial_forge_patterns(self, auth_headers):
        """GET /api/cosmic-map/celestial/forge-patterns returns 3 patterns"""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/celestial/forge-patterns", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "patterns" in data
        assert "user_alignments" in data
        patterns = data["patterns"]
        assert len(patterns) == 3
        
        expected_patterns = {
            "astral_lens": {"frequency": 741, "required_alignments": 3},
            "cosmic_bridge": {"frequency": 852, "required_alignments": 5},
            "pineal_resonator": {"frequency": 963, "required_alignments": 8}
        }
        
        for p in patterns:
            assert p["id"] in expected_patterns
            assert p["frequency"] == expected_patterns[p["id"]]["frequency"]
            assert p["required_alignments"] == expected_patterns[p["id"]]["required_alignments"]
            assert "unlocked" in p
            assert "crafted" in p
            assert p["realm"] == "celestial"
        
        print(f"✓ Celestial forge patterns: 3 patterns, user has {data['user_alignments']} alignments")
        for p in patterns:
            status = "✓ unlocked" if p["unlocked"] else f"🔒 needs {p['required_alignments']} alignments"
            print(f"  {p['name']} ({p['frequency']}Hz): {status}")
    
    def test_get_celestial_forge_pattern_locked(self, auth_headers):
        """GET /api/cosmic-map/celestial/forge-pattern/{id} returns 403 if not enough alignments"""
        # Test user likely has 0 alignments, so all patterns should be locked
        response = requests.get(f"{BASE_URL}/api/cosmic-map/celestial/forge-pattern/astral_lens", headers=auth_headers)
        
        if response.status_code == 403:
            assert "alignments" in response.json().get("detail", "").lower()
            print("✓ Celestial forge pattern correctly returns 403 for locked pattern")
        elif response.status_code == 200:
            # User has enough alignments
            data = response.json()
            assert "waveform" in data
            assert len(data["waveform"]) == 13
            print(f"✓ Celestial forge pattern unlocked: {data['name']} at {data['frequency']}Hz")
    
    def test_celestial_forge_attempt_locked(self, auth_headers):
        """POST /api/cosmic-map/celestial/forge-attempt returns 403 if not enough alignments"""
        payload = {
            "build_id": "pineal_resonator",
            "user_waveform": [1.0, 0.5, 0.0, 0.5, 1.0, 0.5, 0.0, 0.5, 1.0, 0.5, 0.0, 0.5, 1.0],
            "time_taken_seconds": 5.0
        }
        response = requests.post(f"{BASE_URL}/api/cosmic-map/celestial/forge-attempt", json=payload, headers=auth_headers)
        
        if response.status_code == 403:
            assert "alignments" in response.json().get("detail", "").lower()
            print("✓ Celestial forge attempt correctly returns 403 for locked pattern")
        elif response.status_code == 200:
            data = response.json()
            print(f"✓ Celestial forge attempt: forged={data['forged']}, accuracy={data['accuracy']}%")


class TestLocationLockedPacks(TestAuth):
    """Location-Locked Education Packs"""
    
    def test_location_locked_packs_not_near_spot(self, auth_headers):
        """POST /api/cosmic-map/location-locked-packs returns empty when not near Power Spot"""
        payload = {
            "user_lat": 0.0,
            "user_lng": 0.0
        }
        response = requests.post(f"{BASE_URL}/api/cosmic-map/location-locked-packs", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert data["at_power_spot"] is False
        assert data["packs"] == []
        assert "Not near a Power Spot" in data["message"]
        print("✓ Location-locked packs: correctly returns empty when not near Power Spot")
    
    def test_location_locked_packs_near_spot(self, auth_headers):
        """POST /api/cosmic-map/location-locked-packs returns packs when near Power Spot"""
        # Get a power spot location
        spots_resp = requests.get(f"{BASE_URL}/api/cosmic-map/power-spots", headers=auth_headers)
        spots = spots_resp.json().get("power_spots", [])
        
        if not spots:
            pytest.skip("No power spots available")
        
        spot = spots[0]
        payload = {
            "user_lat": spot["lat"],
            "user_lng": spot["lng"]
        }
        response = requests.post(f"{BASE_URL}/api/cosmic-map/location-locked-packs", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert data["at_power_spot"] is True
        assert "spot_name" in data
        assert len(data["packs"]) == 2
        
        pack_ids = [p["id"] for p in data["packs"]]
        assert "location_history_deep" in pack_ids
        assert "location_science_field" in pack_ids
        
        print(f"✓ Location-locked packs at {data['spot_name']}: {len(data['packs'])} packs available")


class TestRegressionCosmicMap(TestAuth):
    """Regression tests for previous cosmic map endpoints"""
    
    def test_decay_status(self, auth_headers):
        """GET /api/cosmic-map/decay-status (regression)"""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/decay-status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "science_resonance" in data
        assert "days_inactive" in data
        assert "decay_factor" in data
        print(f"✓ Decay status: {data['days_inactive']} days inactive, factor={data['decay_factor']}")
    
    def test_forge_pattern(self, auth_headers):
        """GET /api/cosmic-map/forge/pattern/{id} (regression)"""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/forge/pattern/kinetic_amplifier", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["frequency"] == 432
        assert len(data["waveform"]) == 13
        print(f"✓ Forge pattern: {data['name']} at {data['frequency']}Hz")
    
    def test_nodes(self, auth_headers):
        """POST /api/cosmic-map/nodes (regression)"""
        payload = {"lat": 40.7128, "lng": -74.006, "radius_km": 1.0}
        response = requests.post(f"{BASE_URL}/api/cosmic-map/nodes", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "nodes" in data
        assert data["total"] == 10  # 4 kinetic + 3 botanical + 3 star_anchor
        print(f"✓ Nodes: {data['total']} procedural nodes generated")
    
    def test_harvest_history(self, auth_headers):
        """GET /api/cosmic-map/harvest-history (regression)"""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/harvest-history", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "history" in data
        assert "today_count" in data
        assert "today_rewards" in data
        print(f"✓ Harvest history: {data['today_count']} harvests today")


class TestAvenuesRegression(TestAuth):
    """Regression tests for avenues endpoints"""
    
    def test_avenues_overview(self, auth_headers):
        """GET /api/avenues/overview (regression)"""
        response = requests.get(f"{BASE_URL}/api/avenues/overview", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "avenues" in data
        print(f"✓ Avenues overview: {len(data['avenues'])} avenues")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
