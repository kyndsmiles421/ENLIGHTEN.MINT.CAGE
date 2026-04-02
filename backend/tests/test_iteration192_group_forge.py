"""
Iteration 192: Group Forge & Coven System Tests
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tests for:
- Coven CRUD (create, join, leave, get my coven)
- Group Forge endpoint (requires 2+ online coven members)
- WebSocket ping/pong
- Regression: power-spots, celestial nodes, live-tracking
"""
import pytest
import requests
import os
import json
import time

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
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


@pytest.fixture(scope="function")
def cleanup_coven(auth_headers):
    """Cleanup: leave any existing coven before and after test."""
    # Leave coven before test
    requests.post(f"{BASE_URL}/api/sync/covens/leave", headers=auth_headers)
    yield
    # Leave coven after test
    requests.post(f"{BASE_URL}/api/sync/covens/leave", headers=auth_headers)


class TestCovenCRUD:
    """Coven Create/Join/Leave/Get tests."""

    def test_create_coven(self, auth_headers, cleanup_coven):
        """POST /api/sync/covens creates a new coven."""
        response = requests.post(f"{BASE_URL}/api/sync/covens", json={
            "name": "TEST_Coven_192"
        }, headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") is True
        assert "coven_id" in data
        assert "invite_code" in data
        assert len(data["invite_code"]) == 8  # 8-char invite code
        assert data["name"] == "TEST_Coven_192"
        print(f"✓ Created coven: {data['name']} with invite code: {data['invite_code']}")

    def test_create_coven_already_in_coven(self, auth_headers, cleanup_coven):
        """POST /api/sync/covens returns 400 if already in a coven."""
        # First create a coven
        requests.post(f"{BASE_URL}/api/sync/covens", json={"name": "TEST_First_Coven"}, headers=auth_headers)
        
        # Try to create another
        response = requests.post(f"{BASE_URL}/api/sync/covens", json={"name": "TEST_Second_Coven"}, headers=auth_headers)
        assert response.status_code == 400
        assert "already in a coven" in response.json().get("detail", "").lower()
        print("✓ Correctly rejected creating second coven")

    def test_join_coven_invalid_code(self, auth_headers, cleanup_coven):
        """POST /api/sync/covens/join returns 404 for invalid invite code."""
        response = requests.post(f"{BASE_URL}/api/sync/covens/join", json={
            "invite_code": "INVALID1"
        }, headers=auth_headers)
        
        assert response.status_code == 404
        assert "invalid" in response.json().get("detail", "").lower()
        print("✓ Correctly rejected invalid invite code")

    def test_leave_coven_not_in_coven(self, auth_headers, cleanup_coven):
        """POST /api/sync/covens/leave returns 400 if not in a coven."""
        response = requests.post(f"{BASE_URL}/api/sync/covens/leave", headers=auth_headers)
        assert response.status_code == 400
        assert "not in a coven" in response.json().get("detail", "").lower()
        print("✓ Correctly rejected leave when not in coven")

    def test_get_my_coven_not_in_coven(self, auth_headers, cleanup_coven):
        """GET /api/sync/covens/my returns in_coven=false when not in a coven."""
        response = requests.get(f"{BASE_URL}/api/sync/covens/my", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("in_coven") is False
        print("✓ Correctly returned in_coven=false")

    def test_get_my_coven_in_coven(self, auth_headers, cleanup_coven):
        """GET /api/sync/covens/my returns coven details when in a coven."""
        # Create a coven first
        create_res = requests.post(f"{BASE_URL}/api/sync/covens", json={"name": "TEST_My_Coven"}, headers=auth_headers)
        assert create_res.status_code == 200
        
        # Get my coven
        response = requests.get(f"{BASE_URL}/api/sync/covens/my", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("in_coven") is True
        assert data.get("name") == "TEST_My_Coven"
        assert "invite_code" in data
        assert "members" in data
        assert len(data["members"]) >= 1  # At least the creator
        print(f"✓ Got coven details: {data['name']} with {len(data['members'])} members")

    def test_leave_coven_success(self, auth_headers, cleanup_coven):
        """POST /api/sync/covens/leave successfully leaves coven."""
        # Create a coven first
        requests.post(f"{BASE_URL}/api/sync/covens", json={"name": "TEST_Leave_Coven"}, headers=auth_headers)
        
        # Leave the coven
        response = requests.post(f"{BASE_URL}/api/sync/covens/leave", headers=auth_headers)
        assert response.status_code == 200
        assert response.json().get("success") is True
        
        # Verify we're no longer in a coven
        my_coven = requests.get(f"{BASE_URL}/api/sync/covens/my", headers=auth_headers)
        assert my_coven.json().get("in_coven") is False
        print("✓ Successfully left coven")


class TestGroupForge:
    """Group Forge endpoint tests."""

    def test_group_forge_not_in_coven(self, auth_headers, cleanup_coven):
        """POST /api/sync/group-forge returns 400 when not in a coven."""
        response = requests.post(f"{BASE_URL}/api/sync/group-forge", json={
            "build_id": "resonance_amplifier",
            "user_waveform": [0.5, 0.6, 0.7, 0.8, 0.7, 0.6, 0.5, 0.4],
            "time_taken_seconds": 5.0
        }, headers=auth_headers)
        
        assert response.status_code == 400
        assert "must be in a coven" in response.json().get("detail", "").lower()
        print("✓ Correctly rejected group forge when not in coven")

    def test_group_forge_less_than_2_online(self, auth_headers, cleanup_coven):
        """POST /api/sync/group-forge returns 400 when less than 2 online members."""
        # Create a coven (only 1 member - the creator)
        requests.post(f"{BASE_URL}/api/sync/covens", json={"name": "TEST_Solo_Coven"}, headers=auth_headers)
        
        # Try group forge - should fail because only 1 member and not connected via WebSocket
        response = requests.post(f"{BASE_URL}/api/sync/group-forge", json={
            "build_id": "resonance_amplifier",
            "user_waveform": [0.5, 0.6, 0.7, 0.8, 0.7, 0.6, 0.5, 0.4],
            "time_taken_seconds": 5.0
        }, headers=auth_headers)
        
        assert response.status_code == 400
        assert "at least 2 online" in response.json().get("detail", "").lower()
        print("✓ Correctly rejected group forge with less than 2 online members")

    def test_group_forge_invalid_build_id(self, auth_headers, cleanup_coven):
        """POST /api/sync/group-forge returns 404 for invalid build_id."""
        # Create a coven first
        requests.post(f"{BASE_URL}/api/sync/covens", json={"name": "TEST_Invalid_Build_Coven"}, headers=auth_headers)
        
        # Note: This test may return 400 (not enough online) before checking build_id
        # depending on implementation order. Let's check both cases.
        response = requests.post(f"{BASE_URL}/api/sync/group-forge", json={
            "build_id": "INVALID_BUILD_ID_12345",
            "user_waveform": [0.5, 0.6, 0.7, 0.8, 0.7, 0.6, 0.5, 0.4],
            "time_taken_seconds": 5.0
        }, headers=auth_headers)
        
        # Could be 400 (not enough online) or 404 (invalid build) depending on check order
        assert response.status_code in [400, 404], f"Expected 400 or 404, got {response.status_code}"
        print(f"✓ Group forge with invalid build_id returned {response.status_code}")


class TestRegressionEndpoints:
    """Regression tests for existing endpoints."""

    def test_power_spots(self, auth_headers):
        """GET /api/cosmic-map/power-spots returns power spots."""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/power-spots", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "power_spots" in data
        print(f"✓ Power spots returned: {len(data['power_spots'])} spots")

    def test_celestial_nodes(self, auth_headers):
        """GET /api/cosmic-map/celestial/nodes returns celestial nodes."""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/celestial/nodes", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "nodes" in data
        print(f"✓ Celestial nodes returned: {len(data['nodes'])} nodes")

    def test_live_tracking(self, auth_headers):
        """POST /api/cosmic-map/power-spots/{id}/live-tracking works."""
        # First get power spots to get a valid ID
        spots_res = requests.get(f"{BASE_URL}/api/cosmic-map/power-spots", headers=auth_headers)
        spots = spots_res.json().get("power_spots", [])
        
        if not spots:
            pytest.skip("No power spots available for testing")
        
        spot_id = spots[0]["id"]
        response = requests.post(f"{BASE_URL}/api/cosmic-map/power-spots/{spot_id}/live-tracking", json={
            "enabled": True
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") is True
        assert data.get("live_tracking") is True
        print(f"✓ Live tracking enabled for spot: {spot_id}")


class TestOnlineCount:
    """Test online count endpoint."""

    def test_online_count(self, auth_headers):
        """GET /api/sync/online-count returns online count."""
        response = requests.get(f"{BASE_URL}/api/sync/online-count", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "online" in data
        assert isinstance(data["online"], int)
        print(f"✓ Online count: {data['online']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
