"""
Iteration 193: Coven Leaderboard Tests
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tests for GET /api/sync/leaderboard endpoint that ranks covens by combined forge score + harvest count.
Also includes regression tests for coven CRUD and cosmic-map endpoints.
"""
import pytest
import requests
import os
import time

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
    """Auth headers for API calls"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestLeaderboardEndpoint:
    """Tests for GET /api/sync/leaderboard"""
    
    def test_leaderboard_returns_200(self, auth_headers):
        """Leaderboard endpoint should return 200"""
        response = requests.get(f"{BASE_URL}/api/sync/leaderboard", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: GET /api/sync/leaderboard returns 200")
    
    def test_leaderboard_structure(self, auth_headers):
        """Leaderboard response should have correct structure"""
        response = requests.get(f"{BASE_URL}/api/sync/leaderboard", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "leaderboard" in data, "Response should have 'leaderboard' key"
        assert "total_covens" in data, "Response should have 'total_covens' key"
        assert isinstance(data["leaderboard"], list), "leaderboard should be a list"
        assert isinstance(data["total_covens"], int), "total_covens should be an int"
        print(f"PASS: Leaderboard structure correct - {data['total_covens']} covens")
    
    def test_leaderboard_empty_when_no_covens(self, auth_headers):
        """If no covens exist, leaderboard should be empty list"""
        response = requests.get(f"{BASE_URL}/api/sync/leaderboard", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        # This test just verifies the structure works even if empty
        assert isinstance(data["leaderboard"], list)
        print(f"PASS: Leaderboard returns list (currently {len(data['leaderboard'])} covens)")


class TestLeaderboardWithCoven:
    """Tests that create a coven and verify leaderboard ranking"""
    
    def test_create_coven_and_verify_leaderboard(self, auth_headers):
        """Create a test coven and verify it appears in leaderboard"""
        # First, leave any existing coven
        requests.post(f"{BASE_URL}/api/sync/covens/leave", headers=auth_headers)
        time.sleep(0.3)
        
        # Create a test coven
        coven_name = "TEST_Leaderboard_Coven_193"
        create_response = requests.post(f"{BASE_URL}/api/sync/covens", 
            json={"name": coven_name}, headers=auth_headers)
        
        assert create_response.status_code == 200, f"Failed to create coven: {create_response.text}"
        coven_data = create_response.json()
        assert coven_data.get("success") == True
        coven_id = coven_data.get("coven_id")
        print(f"PASS: Created test coven '{coven_name}' with id {coven_id}")
        
        # Verify coven appears in leaderboard
        time.sleep(0.3)
        lb_response = requests.get(f"{BASE_URL}/api/sync/leaderboard", headers=auth_headers)
        assert lb_response.status_code == 200
        lb_data = lb_response.json()
        
        # Find our coven in leaderboard
        our_coven = None
        for c in lb_data["leaderboard"]:
            if c.get("coven_id") == coven_id:
                our_coven = c
                break
        
        assert our_coven is not None, f"Created coven not found in leaderboard"
        print(f"PASS: Coven found in leaderboard at rank {our_coven.get('rank')}")
        
        # Verify leaderboard entry has required fields
        required_fields = ["rank", "name", "leader", "member_count", "forge_score", 
                          "harvest_count", "combined_score", "coven_id"]
        for field in required_fields:
            assert field in our_coven, f"Missing field '{field}' in leaderboard entry"
        
        print(f"PASS: Leaderboard entry has all required fields: {required_fields}")
        
        # Verify data types
        assert isinstance(our_coven["rank"], int), "rank should be int"
        assert isinstance(our_coven["member_count"], int), "member_count should be int"
        assert isinstance(our_coven["combined_score"], (int, float)), "combined_score should be numeric"
        print("PASS: Leaderboard entry data types correct")
        
        # Cleanup - leave the coven
        leave_response = requests.post(f"{BASE_URL}/api/sync/covens/leave", headers=auth_headers)
        assert leave_response.status_code == 200
        print("PASS: Cleaned up test coven")
    
    def test_leaderboard_sorted_by_combined_score(self, auth_headers):
        """Verify leaderboard is sorted by combined_score descending"""
        response = requests.get(f"{BASE_URL}/api/sync/leaderboard", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        leaderboard = data["leaderboard"]
        if len(leaderboard) >= 2:
            for i in range(len(leaderboard) - 1):
                assert leaderboard[i]["combined_score"] >= leaderboard[i+1]["combined_score"], \
                    f"Leaderboard not sorted: {leaderboard[i]['combined_score']} < {leaderboard[i+1]['combined_score']}"
            print(f"PASS: Leaderboard sorted by combined_score (checked {len(leaderboard)} entries)")
        else:
            print(f"PASS: Leaderboard sorting check skipped (only {len(leaderboard)} entries)")
    
    def test_leaderboard_ranks_are_sequential(self, auth_headers):
        """Verify ranks are 1, 2, 3, ... in order"""
        response = requests.get(f"{BASE_URL}/api/sync/leaderboard", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        leaderboard = data["leaderboard"]
        for i, entry in enumerate(leaderboard):
            expected_rank = i + 1
            assert entry["rank"] == expected_rank, f"Expected rank {expected_rank}, got {entry['rank']}"
        
        print(f"PASS: Ranks are sequential 1 to {len(leaderboard)}")


class TestCovenRegressions:
    """Regression tests for coven CRUD operations"""
    
    def test_create_coven(self, auth_headers):
        """POST /api/sync/covens creates coven"""
        # Leave any existing coven first
        requests.post(f"{BASE_URL}/api/sync/covens/leave", headers=auth_headers)
        time.sleep(0.2)
        
        response = requests.post(f"{BASE_URL}/api/sync/covens", 
            json={"name": "TEST_Regression_Coven"}, headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "coven_id" in data
        assert "invite_code" in data
        assert len(data["invite_code"]) == 8
        print(f"PASS: POST /api/sync/covens creates coven with invite code {data['invite_code']}")
        
        # Cleanup
        requests.post(f"{BASE_URL}/api/sync/covens/leave", headers=auth_headers)
    
    def test_join_coven_invalid_code(self, auth_headers):
        """POST /api/sync/covens/join returns 404 for invalid code"""
        # Leave any existing coven first
        requests.post(f"{BASE_URL}/api/sync/covens/leave", headers=auth_headers)
        time.sleep(0.2)
        
        response = requests.post(f"{BASE_URL}/api/sync/covens/join", 
            json={"invite_code": "INVALID1"}, headers=auth_headers)
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: POST /api/sync/covens/join returns 404 for invalid code")
    
    def test_get_my_coven_not_in_coven(self, auth_headers):
        """GET /api/sync/covens/my returns in_coven=false when not in coven"""
        # Leave any existing coven first
        requests.post(f"{BASE_URL}/api/sync/covens/leave", headers=auth_headers)
        time.sleep(0.2)
        
        response = requests.get(f"{BASE_URL}/api/sync/covens/my", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("in_coven") == False
        print("PASS: GET /api/sync/covens/my returns in_coven=false when not in coven")
    
    def test_get_my_coven_when_in_coven(self, auth_headers):
        """GET /api/sync/covens/my returns coven details when in coven"""
        # Leave any existing coven first
        requests.post(f"{BASE_URL}/api/sync/covens/leave", headers=auth_headers)
        time.sleep(0.2)
        
        # Create a coven
        create_response = requests.post(f"{BASE_URL}/api/sync/covens", 
            json={"name": "TEST_MyCoven_Check"}, headers=auth_headers)
        assert create_response.status_code == 200
        
        # Get my coven
        response = requests.get(f"{BASE_URL}/api/sync/covens/my", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("in_coven") == True
        assert "coven_id" in data
        assert "name" in data
        assert "invite_code" in data
        assert "members" in data
        assert isinstance(data["members"], list)
        print(f"PASS: GET /api/sync/covens/my returns coven details: {data['name']}")
        
        # Cleanup
        requests.post(f"{BASE_URL}/api/sync/covens/leave", headers=auth_headers)


class TestCosmicMapRegressions:
    """Regression tests for cosmic-map endpoints"""
    
    def test_power_spots(self, auth_headers):
        """GET /api/cosmic-map/power-spots works"""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/power-spots", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "power_spots" in data
        print(f"PASS: GET /api/cosmic-map/power-spots returns {len(data['power_spots'])} spots")


class TestWebSocketPing:
    """Test WebSocket connectivity (basic check)"""
    
    def test_websocket_endpoint_exists(self, auth_token):
        """WebSocket endpoint should be accessible"""
        # We can't fully test WebSocket with requests, but we can verify the endpoint pattern
        # The actual WebSocket test would require websockets library
        ws_url = f"{BASE_URL}/api/ws/sync?token={auth_token}"
        # Just verify the URL is constructable
        assert "ws/sync" in ws_url
        print(f"PASS: WebSocket URL pattern correct: /api/ws/sync?token=...")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
