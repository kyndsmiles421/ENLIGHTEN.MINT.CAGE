"""
Iteration 190: Live GPS Tracking for Power Spots
Tests for:
- POST /api/cosmic-map/power-spots/{spot_id}/live-tracking - Toggle live tracking
- PUT /api/cosmic-map/power-spots/{spot_id}/update-location - Update lat/lng when tracking enabled
- GET /api/cosmic-map/power-spots?include_all=true - Returns all spots including inactive
- GET /api/cosmic-map/power-spots - Returns only active spots
- Power spot response includes live_tracking and last_location_update fields
- Regression: POST /api/cosmic-map/power-spots, go-live, DELETE
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Auth headers for requests"""
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture
def test_spot(auth_headers):
    """Create a test spot and clean up after"""
    spot_data = {
        "name": "TEST_GPS_Tracking_Spot",
        "lat": 44.0805,
        "lng": -103.231,
        "description": "Test spot for GPS tracking",
        "reward_multiplier": 3.0,
        "harvest_radius_meters": 50,
        "active": True
    }
    response = requests.post(f"{BASE_URL}/api/cosmic-map/power-spots", json=spot_data, headers=auth_headers)
    assert response.status_code == 200, f"Failed to create test spot: {response.text}"
    spot_id = response.json()["id"]
    
    yield {"id": spot_id, **spot_data}
    
    # Cleanup
    requests.delete(f"{BASE_URL}/api/cosmic-map/power-spots/{spot_id}", headers=auth_headers)


class TestLiveTrackingToggle:
    """Tests for POST /api/cosmic-map/power-spots/{spot_id}/live-tracking"""
    
    def test_enable_live_tracking(self, auth_headers, test_spot):
        """Enable live tracking on a spot"""
        response = requests.post(
            f"{BASE_URL}/api/cosmic-map/power-spots/{test_spot['id']}/live-tracking",
            json={"enabled": True},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data["success"] is True
        assert data["live_tracking"] is True
        assert data["spot_id"] == test_spot["id"]
        assert "enabled" in data["message"].lower()
        print(f"PASS: Enable live tracking - {data['message']}")
    
    def test_disable_live_tracking(self, auth_headers, test_spot):
        """Disable live tracking on a spot"""
        # First enable
        requests.post(
            f"{BASE_URL}/api/cosmic-map/power-spots/{test_spot['id']}/live-tracking",
            json={"enabled": True},
            headers=auth_headers
        )
        
        # Then disable
        response = requests.post(
            f"{BASE_URL}/api/cosmic-map/power-spots/{test_spot['id']}/live-tracking",
            json={"enabled": False},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data["success"] is True
        assert data["live_tracking"] is False
        assert "disabled" in data["message"].lower()
        print(f"PASS: Disable live tracking - {data['message']}")
    
    def test_toggle_tracking_nonexistent_spot(self, auth_headers):
        """Toggle tracking on nonexistent spot returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/cosmic-map/power-spots/nonexistent123/live-tracking",
            json={"enabled": True},
            headers=auth_headers
        )
        assert response.status_code == 404
        print("PASS: Nonexistent spot returns 404")


class TestUpdateLocation:
    """Tests for PUT /api/cosmic-map/power-spots/{spot_id}/update-location"""
    
    def test_update_location_when_tracking_enabled(self, auth_headers, test_spot):
        """Update location succeeds when tracking is enabled"""
        # Enable tracking first
        requests.post(
            f"{BASE_URL}/api/cosmic-map/power-spots/{test_spot['id']}/live-tracking",
            json={"enabled": True},
            headers=auth_headers
        )
        
        # Update location
        new_location = {"lat": 44.0810, "lng": -103.235}
        response = requests.put(
            f"{BASE_URL}/api/cosmic-map/power-spots/{test_spot['id']}/update-location",
            json=new_location,
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data["success"] is True
        assert data["lat"] == new_location["lat"]
        assert data["lng"] == new_location["lng"]
        assert "last_location_update" in data
        print(f"PASS: Update location when tracking enabled - lat: {data['lat']}, lng: {data['lng']}")
    
    def test_update_location_when_tracking_disabled(self, auth_headers, test_spot):
        """Update location returns 400 when tracking is disabled"""
        # Ensure tracking is disabled
        requests.post(
            f"{BASE_URL}/api/cosmic-map/power-spots/{test_spot['id']}/live-tracking",
            json={"enabled": False},
            headers=auth_headers
        )
        
        # Try to update location
        response = requests.put(
            f"{BASE_URL}/api/cosmic-map/power-spots/{test_spot['id']}/update-location",
            json={"lat": 44.0810, "lng": -103.235},
            headers=auth_headers
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        assert "not enabled" in response.json().get("detail", "").lower()
        print("PASS: Update location returns 400 when tracking disabled")
    
    def test_update_location_nonexistent_spot(self, auth_headers):
        """Update location on nonexistent spot returns 404"""
        response = requests.put(
            f"{BASE_URL}/api/cosmic-map/power-spots/nonexistent123/update-location",
            json={"lat": 44.0810, "lng": -103.235},
            headers=auth_headers
        )
        assert response.status_code == 404
        print("PASS: Update location on nonexistent spot returns 404")


class TestGetPowerSpots:
    """Tests for GET /api/cosmic-map/power-spots with include_all param"""
    
    def test_get_power_spots_default_only_active(self, auth_headers, test_spot):
        """Default GET returns only active spots"""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/power-spots", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "power_spots" in data
        # All returned spots should be active
        for spot in data["power_spots"]:
            assert spot["active"] is True, f"Spot {spot['id']} is not active but was returned"
        print(f"PASS: Default GET returns {len(data['power_spots'])} active spots")
    
    def test_get_power_spots_include_all(self, auth_headers, test_spot):
        """GET with include_all=true returns all spots including inactive"""
        # First make the test spot inactive
        requests.post(
            f"{BASE_URL}/api/cosmic-map/power-spots/{test_spot['id']}/go-live",
            json={"go_live": False},
            headers=auth_headers
        )
        
        # Get all spots
        response = requests.get(f"{BASE_URL}/api/cosmic-map/power-spots?include_all=true", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "power_spots" in data
        
        # Find our test spot
        test_spot_found = False
        for spot in data["power_spots"]:
            if spot["id"] == test_spot["id"]:
                test_spot_found = True
                assert spot["active"] is False, "Test spot should be inactive"
                break
        
        assert test_spot_found, "Test spot not found in include_all response"
        print(f"PASS: include_all=true returns all spots including inactive (total: {len(data['power_spots'])})")
    
    def test_power_spot_response_includes_tracking_fields(self, auth_headers, test_spot):
        """Power spot response includes live_tracking and last_location_update fields"""
        # Enable tracking and update location
        requests.post(
            f"{BASE_URL}/api/cosmic-map/power-spots/{test_spot['id']}/live-tracking",
            json={"enabled": True},
            headers=auth_headers
        )
        requests.put(
            f"{BASE_URL}/api/cosmic-map/power-spots/{test_spot['id']}/update-location",
            json={"lat": 44.0815, "lng": -103.240},
            headers=auth_headers
        )
        
        # Get spots
        response = requests.get(f"{BASE_URL}/api/cosmic-map/power-spots?include_all=true", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Find our test spot
        for spot in data["power_spots"]:
            if spot["id"] == test_spot["id"]:
                assert "live_tracking" in spot, "live_tracking field missing"
                assert "last_location_update" in spot, "last_location_update field missing"
                assert spot["live_tracking"] is True
                assert spot["last_location_update"] is not None
                print(f"PASS: Spot includes live_tracking={spot['live_tracking']}, last_location_update={spot['last_location_update']}")
                return
        
        pytest.fail("Test spot not found in response")


class TestRegressionPowerSpots:
    """Regression tests for existing Power Spot functionality"""
    
    def test_create_power_spot(self, auth_headers):
        """POST /api/cosmic-map/power-spots creates a spot"""
        spot_data = {
            "name": "TEST_Regression_Create_Spot",
            "lat": 45.0,
            "lng": -100.0,
            "description": "Regression test spot",
            "reward_multiplier": 2.5,
            "harvest_radius_meters": 75,
            "active": True
        }
        response = requests.post(f"{BASE_URL}/api/cosmic-map/power-spots", json=spot_data, headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data["success"] is True
        assert "id" in data
        assert data["name"] == spot_data["name"]
        assert data["lat"] == spot_data["lat"]
        assert data["lng"] == spot_data["lng"]
        print(f"PASS: Create power spot - id: {data['id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/cosmic-map/power-spots/{data['id']}", headers=auth_headers)
    
    def test_go_live_toggle(self, auth_headers, test_spot):
        """POST /api/cosmic-map/power-spots/{spot_id}/go-live toggles live status"""
        # Go offline
        response = requests.post(
            f"{BASE_URL}/api/cosmic-map/power-spots/{test_spot['id']}/go-live",
            json={"go_live": False},
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["go_live"] is False
        print(f"PASS: Go offline - {data['message']}")
        
        # Go live
        response = requests.post(
            f"{BASE_URL}/api/cosmic-map/power-spots/{test_spot['id']}/go-live",
            json={"go_live": True},
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["go_live"] is True
        print(f"PASS: Go live - {data['message']}")
    
    def test_delete_power_spot(self, auth_headers):
        """DELETE /api/cosmic-map/power-spots/{spot_id} deletes a spot"""
        # Create a spot to delete
        spot_data = {
            "name": "TEST_Delete_Spot",
            "lat": 46.0,
            "lng": -101.0,
            "description": "Spot to delete",
            "reward_multiplier": 1.0
        }
        create_response = requests.post(f"{BASE_URL}/api/cosmic-map/power-spots", json=spot_data, headers=auth_headers)
        spot_id = create_response.json()["id"]
        
        # Delete it
        response = requests.delete(f"{BASE_URL}/api/cosmic-map/power-spots/{spot_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        print(f"PASS: Delete power spot - {data['message']}")
        
        # Verify it's gone
        get_response = requests.get(f"{BASE_URL}/api/cosmic-map/power-spots?include_all=true", headers=auth_headers)
        spots = get_response.json()["power_spots"]
        for spot in spots:
            assert spot["id"] != spot_id, "Deleted spot still exists"
        print("PASS: Verified spot is deleted")
    
    def test_delete_nonexistent_spot(self, auth_headers):
        """DELETE nonexistent spot returns 404"""
        response = requests.delete(f"{BASE_URL}/api/cosmic-map/power-spots/nonexistent123", headers=auth_headers)
        assert response.status_code == 404
        print("PASS: Delete nonexistent spot returns 404")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
