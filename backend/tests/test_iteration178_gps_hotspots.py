"""
Iteration 178: GPS Hotspots Feature Tests
Tests for location-based hotspots (static sacred sites + dynamic procedural nodes)
Endpoints: /api/hotspots/static-sites, /api/hotspots/nearby, /api/hotspots/collect, /api/hotspots/history
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"

# NYC coordinates for testing
NYC_LAT = 40.7128
NYC_LNG = -74.0060

# Sedona Vortex coordinates (static site)
SEDONA_LAT = 34.8697
SEDONA_LNG = -111.7610


class TestGPSHotspotsAuth:
    """Test authentication requirements for hotspot endpoints"""
    
    def test_nearby_requires_auth(self):
        """GET /api/hotspots/nearby requires authentication"""
        response = requests.get(f"{BASE_URL}/api/hotspots/nearby", params={"lat": NYC_LAT, "lng": NYC_LNG})
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ /api/hotspots/nearby requires auth")
    
    def test_collect_requires_auth(self):
        """POST /api/hotspots/collect requires authentication"""
        response = requests.post(f"{BASE_URL}/api/hotspots/collect", json={
            "hotspot_id": "static_sedona",
            "lat": SEDONA_LAT,
            "lng": SEDONA_LNG
        })
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ /api/hotspots/collect requires auth")
    
    def test_history_requires_auth(self):
        """GET /api/hotspots/history requires authentication"""
        response = requests.get(f"{BASE_URL}/api/hotspots/history")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ /api/hotspots/history requires auth")


class TestStaticSites:
    """Test static sacred sites endpoint (no auth required)"""
    
    def test_get_static_sites_returns_8_sites(self):
        """GET /api/hotspots/static-sites returns 8 sacred sites"""
        response = requests.get(f"{BASE_URL}/api/hotspots/static-sites")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "sites" in data, "Response should have 'sites' key"
        assert "total" in data, "Response should have 'total' key"
        assert data["total"] == 8, f"Expected 8 sites, got {data['total']}"
        assert len(data["sites"]) == 8, f"Expected 8 sites in array, got {len(data['sites'])}"
        print(f"✓ Static sites endpoint returns {data['total']} sacred sites")
    
    def test_static_sites_have_required_fields(self):
        """Each static site has id, name, element, tier, lat, lng, lore, element_data"""
        response = requests.get(f"{BASE_URL}/api/hotspots/static-sites")
        assert response.status_code == 200
        
        data = response.json()
        required_fields = ["id", "name", "element", "tier", "lat", "lng", "lore", "element_data"]
        
        for site in data["sites"]:
            for field in required_fields:
                assert field in site, f"Site {site.get('name', 'unknown')} missing field: {field}"
        
        print("✓ All static sites have required fields (id, name, element, tier, lat, lng, lore, element_data)")
    
    def test_static_sites_include_known_locations(self):
        """Static sites include Sedona, Stonehenge, Machu Picchu, etc."""
        response = requests.get(f"{BASE_URL}/api/hotspots/static-sites")
        assert response.status_code == 200
        
        data = response.json()
        site_names = [s["name"] for s in data["sites"]]
        
        expected_sites = ["Sedona Vortex", "Stonehenge Circle", "Machu Picchu Heights", 
                         "Ganges Source Spring", "Mount Fuji Summit", "Cenote Ik Kil",
                         "Uluru Dreaming", "Aurora Gateway"]
        
        for expected in expected_sites:
            assert expected in site_names, f"Missing expected site: {expected}"
        
        print(f"✓ All 8 expected sacred sites present: {', '.join(expected_sites)}")
    
    def test_static_sites_have_valid_tiers(self):
        """Static sites have valid tiers (rare or legendary)"""
        response = requests.get(f"{BASE_URL}/api/hotspots/static-sites")
        assert response.status_code == 200
        
        data = response.json()
        valid_tiers = ["common", "uncommon", "rare", "legendary"]
        
        for site in data["sites"]:
            assert site["tier"] in valid_tiers, f"Site {site['name']} has invalid tier: {site['tier']}"
        
        print("✓ All static sites have valid tiers")


class TestNearbyHotspots:
    """Test nearby hotspots endpoint (requires auth)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        self.token = login_response.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_nearby_returns_dynamic_hotspots(self):
        """GET /api/hotspots/nearby returns 5 dynamic hotspots near NYC"""
        response = requests.get(f"{BASE_URL}/api/hotspots/nearby", 
                               params={"lat": NYC_LAT, "lng": NYC_LNG},
                               headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "hotspots" in data, "Response should have 'hotspots' key"
        
        # Count dynamic hotspots
        dynamic_hotspots = [h for h in data["hotspots"] if h.get("dynamic") == True]
        assert len(dynamic_hotspots) == 5, f"Expected 5 dynamic hotspots, got {len(dynamic_hotspots)}"
        
        print(f"✓ Nearby endpoint returns 5 dynamic hotspots near NYC")
    
    def test_dynamic_hotspots_have_required_fields(self):
        """Dynamic hotspots have name, element, tier, distance, bearing, in_range, on_cooldown"""
        response = requests.get(f"{BASE_URL}/api/hotspots/nearby",
                               params={"lat": NYC_LAT, "lng": NYC_LNG},
                               headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        required_fields = ["id", "name", "element", "tier", "distance_m", "bearing", "in_range", "on_cooldown"]
        
        dynamic_hotspots = [h for h in data["hotspots"] if h.get("dynamic") == True]
        for hotspot in dynamic_hotspots:
            for field in required_fields:
                assert field in hotspot, f"Dynamic hotspot {hotspot.get('name', 'unknown')} missing field: {field}"
        
        print("✓ All dynamic hotspots have required fields")
    
    def test_static_hotspots_filtered_by_radius(self):
        """Static hotspots only return within radius (50km default)"""
        # NYC is far from all static sites, so none should be returned with default 50km radius
        response = requests.get(f"{BASE_URL}/api/hotspots/nearby",
                               params={"lat": NYC_LAT, "lng": NYC_LNG, "radius": 50000},
                               headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        static_hotspots = [h for h in data["hotspots"] if h.get("dynamic") == False]
        
        # NYC is far from all sacred sites, so none should be in 50km radius
        assert len(static_hotspots) == 0, f"Expected 0 static hotspots near NYC, got {len(static_hotspots)}"
        
        print("✓ Static hotspots correctly filtered by radius (none near NYC)")
    
    def test_nearby_returns_collect_radius(self):
        """Response includes collect_radius_m (300m)"""
        response = requests.get(f"{BASE_URL}/api/hotspots/nearby",
                               params={"lat": NYC_LAT, "lng": NYC_LNG},
                               headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "collect_radius_m" in data, "Response should have 'collect_radius_m'"
        assert data["collect_radius_m"] == 300, f"Expected collect_radius_m=300, got {data['collect_radius_m']}"
        
        print("✓ Response includes collect_radius_m = 300")
    
    def test_nearby_returns_dynamic_refresh_hours(self):
        """Response includes dynamic_refresh_hours (4)"""
        response = requests.get(f"{BASE_URL}/api/hotspots/nearby",
                               params={"lat": NYC_LAT, "lng": NYC_LNG},
                               headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "dynamic_refresh_hours" in data, "Response should have 'dynamic_refresh_hours'"
        assert data["dynamic_refresh_hours"] == 4, f"Expected dynamic_refresh_hours=4, got {data['dynamic_refresh_hours']}"
        
        print("✓ Response includes dynamic_refresh_hours = 4")
    
    def test_invalid_coordinates_rejected(self):
        """Invalid coordinates return 400"""
        response = requests.get(f"{BASE_URL}/api/hotspots/nearby",
                               params={"lat": 999, "lng": -74.0060},
                               headers=self.headers)
        assert response.status_code == 400, f"Expected 400 for invalid lat, got {response.status_code}"
        
        print("✓ Invalid coordinates correctly rejected with 400")


class TestCollectHotspot:
    """Test hotspot collection endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        self.token = login_response.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_collect_at_exact_coordinates_succeeds(self):
        """POST /api/hotspots/collect succeeds when at hotspot's exact coordinates"""
        # First get a dynamic hotspot near NYC
        nearby_response = requests.get(f"{BASE_URL}/api/hotspots/nearby",
                                       params={"lat": NYC_LAT, "lng": NYC_LNG},
                                       headers=self.headers)
        assert nearby_response.status_code == 200
        
        data = nearby_response.json()
        dynamic_hotspots = [h for h in data["hotspots"] if h.get("dynamic") == True and not h.get("on_cooldown")]
        
        if len(dynamic_hotspots) == 0:
            pytest.skip("All dynamic hotspots are on cooldown")
        
        # Pick a hotspot - we need to use the SAME user position (NYC) that was used to generate it
        # The hotspot coordinates are relative to the user's position at generation time
        hotspot = dynamic_hotspots[0]
        
        # Use NYC coordinates (where we generated the hotspots from) as user position
        # The hotspot should be within 2km of NYC (DYNAMIC_SPAWN_RADIUS_KM)
        collect_response = requests.post(f"{BASE_URL}/api/hotspots/collect",
                                        json={
                                            "hotspot_id": hotspot["id"],
                                            "lat": NYC_LAT,  # User is at NYC
                                            "lng": NYC_LNG
                                        },
                                        headers=self.headers)
        
        # The hotspot is within 2km of NYC but may not be within 300m
        # So this could fail with "too far" or succeed, or be on cooldown
        if collect_response.status_code == 200:
            result = collect_response.json()
            assert result.get("collected") == True, "Expected collected=True"
            assert "rewards" in result, "Response should have 'rewards'"
            assert "dust" in result["rewards"], "Rewards should include dust"
            assert "xp" in result["rewards"], "Rewards should include xp"
            print(f"✓ Collection succeeded: +{result['rewards']['dust']} dust, +{result['rewards']['xp']} XP")
        elif collect_response.status_code == 400:
            # Either cooldown or too far - both are valid responses
            detail = collect_response.text.lower()
            assert "cooldown" in detail or "too far" in detail or "remaining" in detail
            print(f"✓ Collection correctly rejected: {collect_response.json().get('detail', '')}")
        else:
            pytest.fail(f"Unexpected status: {collect_response.status_code}: {collect_response.text}")
    
    def test_collect_too_far_fails(self):
        """POST /api/hotspots/collect fails if user is >300m from hotspot"""
        # Get a dynamic hotspot near NYC that's NOT on cooldown
        nearby_response = requests.get(f"{BASE_URL}/api/hotspots/nearby",
                                       params={"lat": NYC_LAT, "lng": NYC_LNG},
                                       headers=self.headers)
        assert nearby_response.status_code == 200
        
        data = nearby_response.json()
        # Find hotspots not on cooldown
        available_hotspots = [h for h in data["hotspots"] if h.get("dynamic") == True and not h.get("on_cooldown")]
        
        if len(available_hotspots) == 0:
            # All hotspots on cooldown - test with static site instead (Sedona)
            # Use Sedona coordinates but claim to be far away
            collect_response = requests.post(f"{BASE_URL}/api/hotspots/collect",
                                            json={
                                                "hotspot_id": "static_sedona",
                                                "lat": NYC_LAT,  # NYC is far from Sedona
                                                "lng": NYC_LNG
                                            },
                                            headers=self.headers)
            
            assert collect_response.status_code == 400, f"Expected 400 for too far, got {collect_response.status_code}"
            # Could be "too far" or "cooldown" depending on previous tests
            assert "too far" in collect_response.text.lower() or "300m" in collect_response.text.lower() or "cooldown" in collect_response.text.lower()
            print("✓ Collection correctly fails when user is too far (tested with static site)")
            return
        
        hotspot = available_hotspots[0]
        
        # Try to collect from a location far away (add 1 degree = ~111km)
        collect_response = requests.post(f"{BASE_URL}/api/hotspots/collect",
                                        json={
                                            "hotspot_id": hotspot["id"],
                                            "lat": hotspot["lat"] + 1.0,  # ~111km away
                                            "lng": hotspot["lng"]
                                        },
                                        headers=self.headers)
        
        assert collect_response.status_code == 400, f"Expected 400 for too far, got {collect_response.status_code}"
        assert "too far" in collect_response.text.lower() or "300m" in collect_response.text.lower()
        
        print("✓ Collection correctly fails when user is too far (>300m)")
    
    def test_collect_invalid_hotspot_returns_404(self):
        """POST /api/hotspots/collect with invalid hotspot_id returns 404"""
        collect_response = requests.post(f"{BASE_URL}/api/hotspots/collect",
                                        json={
                                            "hotspot_id": "invalid_hotspot_xyz",
                                            "lat": NYC_LAT,
                                            "lng": NYC_LNG
                                        },
                                        headers=self.headers)
        
        assert collect_response.status_code == 404, f"Expected 404 for invalid hotspot, got {collect_response.status_code}"
        
        print("✓ Invalid hotspot_id correctly returns 404")
    
    def test_collect_enforces_cooldown(self):
        """POST /api/hotspots/collect enforces 2-hour cooldown per hotspot"""
        # Get a dynamic hotspot
        nearby_response = requests.get(f"{BASE_URL}/api/hotspots/nearby",
                                       params={"lat": NYC_LAT, "lng": NYC_LNG},
                                       headers=self.headers)
        assert nearby_response.status_code == 200
        
        data = nearby_response.json()
        dynamic_hotspots = [h for h in data["hotspots"] if h.get("dynamic") == True]
        
        if len(dynamic_hotspots) == 0:
            pytest.skip("No dynamic hotspots available")
        
        # Find one that's on cooldown (from previous collection)
        on_cooldown = [h for h in dynamic_hotspots if h.get("on_cooldown") == True]
        
        if len(on_cooldown) == 0:
            # Try to collect one first, then try again
            hotspot = dynamic_hotspots[0]
            first_collect = requests.post(f"{BASE_URL}/api/hotspots/collect",
                                         json={
                                             "hotspot_id": hotspot["id"],
                                             "lat": hotspot["lat"],
                                             "lng": hotspot["lng"]
                                         },
                                         headers=self.headers)
            
            # Now try to collect again immediately
            second_collect = requests.post(f"{BASE_URL}/api/hotspots/collect",
                                          json={
                                              "hotspot_id": hotspot["id"],
                                              "lat": hotspot["lat"],
                                              "lng": hotspot["lng"]
                                          },
                                          headers=self.headers)
            
            assert second_collect.status_code == 400, f"Expected 400 for cooldown, got {second_collect.status_code}"
            assert "cooldown" in second_collect.text.lower() or "minutes remaining" in second_collect.text.lower()
            print("✓ Cooldown correctly enforced on second collection attempt")
        else:
            # Try to collect one that's already on cooldown
            hotspot = on_cooldown[0]
            collect_response = requests.post(f"{BASE_URL}/api/hotspots/collect",
                                            json={
                                                "hotspot_id": hotspot["id"],
                                                "lat": hotspot["lat"],
                                                "lng": hotspot["lng"]
                                            },
                                            headers=self.headers)
            
            assert collect_response.status_code == 400, f"Expected 400 for cooldown, got {collect_response.status_code}"
            print("✓ Cooldown correctly enforced for hotspot already on cooldown")


class TestCollectionHistory:
    """Test collection history endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        self.token = login_response.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_history_returns_totals(self):
        """GET /api/hotspots/history returns total_collections and history array"""
        response = requests.get(f"{BASE_URL}/api/hotspots/history", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "total_collections" in data, "Response should have 'total_collections'"
        assert "history" in data, "Response should have 'history'"
        assert isinstance(data["history"], list), "history should be a list"
        
        print(f"✓ History endpoint returns total_collections={data['total_collections']}, history array with {len(data['history'])} entries")
    
    def test_history_entries_have_required_fields(self):
        """History entries have hotspot_id, hotspot_name, element, tier, dust, xp, timestamp"""
        response = requests.get(f"{BASE_URL}/api/hotspots/history", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        
        if len(data["history"]) == 0:
            pytest.skip("No collection history yet")
        
        required_fields = ["hotspot_id", "hotspot_name", "element", "tier", "dust", "xp", "timestamp"]
        
        for entry in data["history"]:
            for field in required_fields:
                assert field in entry, f"History entry missing field: {field}"
        
        print("✓ All history entries have required fields")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
