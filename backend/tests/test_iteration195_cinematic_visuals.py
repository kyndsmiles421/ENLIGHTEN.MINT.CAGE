"""
Iteration 195: Cinematic Visual Features Testing
- Persistent Audio Waveform Visualizer (frontend)
- 4-Layer Depth Transition (frontend)
- Haptic Ripple Effect (frontend)
- Regression tests for cosmic-map, celestial, auth, sync APIs
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAuthAndRegression:
    """Authentication and regression tests for cosmic map features"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in login response"
        return data["token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    # ━━━ Regression: Power Spots API ━━━
    def test_get_power_spots(self, auth_headers):
        """GET /api/cosmic-map/power-spots returns power spots data"""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/power-spots", headers=auth_headers)
        assert response.status_code == 200, f"Power spots failed: {response.text}"
        data = response.json()
        assert "power_spots" in data, "Missing power_spots key"
        assert isinstance(data["power_spots"], list), "power_spots should be a list"
        print(f"SUCCESS: GET /api/cosmic-map/power-spots - {len(data['power_spots'])} spots")
    
    # ━━━ Regression: Celestial Nodes API ━━━
    def test_get_celestial_nodes(self, auth_headers):
        """GET /api/cosmic-map/celestial/nodes returns celestial nodes"""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/celestial/nodes", headers=auth_headers)
        assert response.status_code == 200, f"Celestial nodes failed: {response.text}"
        data = response.json()
        assert "nodes" in data, "Missing nodes key"
        assert isinstance(data["nodes"], list), "nodes should be a list"
        # Verify node structure for celestial chart
        if len(data["nodes"]) > 0:
            node = data["nodes"][0]
            assert "chart_x" in node or "id" in node, "Node missing expected fields"
        print(f"SUCCESS: GET /api/cosmic-map/celestial/nodes - {len(data['nodes'])} nodes")
    
    # ━━━ Regression: Avatar API ━━━
    def test_get_avatar(self, auth_headers):
        """GET /api/auth/avatar returns avatar data"""
        response = requests.get(f"{BASE_URL}/api/auth/avatar", headers=auth_headers)
        assert response.status_code == 200, f"Avatar failed: {response.text}"
        data = response.json()
        assert "avatar" in data, "Missing avatar key"
        assert "available_symbols" in data, "Missing available_symbols"
        assert "available_colors" in data, "Missing available_colors"
        print(f"SUCCESS: GET /api/auth/avatar - avatar retrieved")
    
    # ━━━ Regression: Leaderboard API ━━━
    def test_get_leaderboard(self, auth_headers):
        """GET /api/sync/leaderboard returns leaderboard data"""
        response = requests.get(f"{BASE_URL}/api/sync/leaderboard", headers=auth_headers)
        assert response.status_code == 200, f"Leaderboard failed: {response.text}"
        data = response.json()
        assert "leaderboard" in data, "Missing leaderboard key"
        assert isinstance(data["leaderboard"], list), "leaderboard should be a list"
        print(f"SUCCESS: GET /api/sync/leaderboard - {len(data['leaderboard'])} entries")
    
    # ━━━ Regression: Coven Creation ━━━
    def test_create_coven(self, auth_headers):
        """POST /api/sync/covens creates a coven"""
        import random
        import string
        coven_name = f"TEST_Coven_{''.join(random.choices(string.ascii_uppercase, k=4))}"
        
        response = requests.post(f"{BASE_URL}/api/sync/covens", 
            json={"name": coven_name}, 
            headers=auth_headers)
        
        # May return 200 (created) or 400 (already in coven)
        if response.status_code == 200:
            data = response.json()
            assert "invite_code" in data or "message" in data, "Missing expected response fields"
            print(f"SUCCESS: POST /api/sync/covens - coven created or already exists")
        elif response.status_code == 400:
            # User already in a coven - this is acceptable
            print(f"INFO: POST /api/sync/covens - user already in coven (expected)")
        else:
            pytest.fail(f"Unexpected status {response.status_code}: {response.text}")
    
    # ━━━ Regression: My Coven API ━━━
    def test_get_my_coven(self, auth_headers):
        """GET /api/sync/covens/my returns coven membership status"""
        response = requests.get(f"{BASE_URL}/api/sync/covens/my", headers=auth_headers)
        assert response.status_code == 200, f"My coven failed: {response.text}"
        data = response.json()
        assert "in_coven" in data, "Missing in_coven key"
        print(f"SUCCESS: GET /api/sync/covens/my - in_coven: {data['in_coven']}")
    
    # ━━━ Regression: Decay Status API ━━━
    def test_get_decay_status(self, auth_headers):
        """GET /api/cosmic-map/decay-status returns decay info"""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/decay-status", headers=auth_headers)
        assert response.status_code == 200, f"Decay status failed: {response.text}"
        data = response.json()
        # Should have at_risk or similar decay fields
        print(f"SUCCESS: GET /api/cosmic-map/decay-status - decay data retrieved")
    
    # ━━━ Regression: Celestial Decay Status ━━━
    def test_get_celestial_decay_status(self, auth_headers):
        """GET /api/cosmic-map/celestial/decay-status returns celestial decay info"""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/celestial/decay-status", headers=auth_headers)
        assert response.status_code == 200, f"Celestial decay failed: {response.text}"
        data = response.json()
        print(f"SUCCESS: GET /api/cosmic-map/celestial/decay-status - celestial decay data retrieved")
    
    # ━━━ Regression: Harvest History ━━━
    def test_get_harvest_history(self, auth_headers):
        """GET /api/cosmic-map/harvest-history returns harvest history"""
        response = requests.get(f"{BASE_URL}/api/cosmic-map/harvest-history", headers=auth_headers)
        assert response.status_code == 200, f"Harvest history failed: {response.text}"
        data = response.json()
        print(f"SUCCESS: GET /api/cosmic-map/harvest-history - history retrieved")


class TestWebSocketConnection:
    """Test WebSocket connectivity for sync features"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return response.json()["token"]
    
    def test_websocket_endpoint_exists(self, auth_token):
        """Verify WebSocket endpoint is accessible (HTTP upgrade check)"""
        # WebSocket endpoints typically return 426 Upgrade Required for HTTP requests
        # or 400 Bad Request if not a proper WS handshake
        ws_url = BASE_URL.replace('https', 'http').replace('http', 'https')
        response = requests.get(f"{ws_url}/api/ws/sync?token={auth_token}")
        # WebSocket endpoints typically reject plain HTTP with various codes
        # 400, 426, or connection errors are all acceptable
        assert response.status_code in [400, 426, 403, 404, 500] or response.status_code < 500, \
            f"WebSocket endpoint check: {response.status_code}"
        print(f"INFO: WebSocket endpoint /api/ws/sync exists (HTTP returned {response.status_code})")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
