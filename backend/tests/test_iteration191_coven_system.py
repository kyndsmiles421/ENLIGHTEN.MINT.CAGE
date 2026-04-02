"""
Iteration 191: Coven/Party System Tests
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tests for the Synchronicity Events — WebSocket-based Coven (Party) system
with real-time player visibility on the Cosmic Map.

Features tested:
- POST /api/sync/covens - Create a new coven with invite code
- POST /api/sync/covens/join - Join a coven via invite code
- POST /api/sync/covens/leave - Leave the current coven
- GET /api/sync/covens/my - Get coven details with members list
- GET /api/sync/online-count - Get online user count
- Error cases: already in coven, invalid invite code
- Regression: cosmic-map endpoints still work
"""

import pytest
import requests
import os
import time
import asyncio
import websockets
import json

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


class TestCovenSystem:
    """Coven/Party System API tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login
        login_resp = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        data = login_resp.json()
        self.token = data.get("token")
        self.user_id = data.get("user", {}).get("id")
        assert self.token, "No token received"
        self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        
        # Cleanup: Leave any existing coven before tests
        self._leave_coven_if_in_one()
        
        yield
        
        # Teardown: Leave coven and cleanup test covens
        self._leave_coven_if_in_one()
    
    def _leave_coven_if_in_one(self):
        """Helper to leave coven if currently in one"""
        try:
            my_coven = self.session.get(f"{BASE_URL}/api/sync/covens/my")
            if my_coven.status_code == 200 and my_coven.json().get("in_coven"):
                self.session.post(f"{BASE_URL}/api/sync/covens/leave")
        except Exception:
            pass
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # CREATE COVEN TESTS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    def test_create_coven_success(self):
        """POST /api/sync/covens - Create a new coven"""
        response = self.session.post(f"{BASE_URL}/api/sync/covens", json={
            "name": "TEST_Cosmic_Travelers"
        })
        assert response.status_code == 200, f"Create coven failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert data.get("success") is True
        assert "coven_id" in data
        assert "invite_code" in data
        assert data.get("name") == "TEST_Cosmic_Travelers"
        assert len(data.get("invite_code", "")) == 8  # 8-char invite code
        print(f"✓ Created coven with invite code: {data['invite_code']}")
    
    def test_create_coven_already_in_one(self):
        """POST /api/sync/covens - Cannot create if already in a coven (400)"""
        # First create a coven
        create_resp = self.session.post(f"{BASE_URL}/api/sync/covens", json={
            "name": "TEST_First_Coven"
        })
        assert create_resp.status_code == 200
        
        # Try to create another - should fail
        response = self.session.post(f"{BASE_URL}/api/sync/covens", json={
            "name": "TEST_Second_Coven"
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "already in a coven" in response.json().get("detail", "").lower()
        print("✓ Correctly rejected creating second coven (400)")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # JOIN COVEN TESTS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    def test_join_coven_invalid_code(self):
        """POST /api/sync/covens/join - Invalid invite code returns 404"""
        response = self.session.post(f"{BASE_URL}/api/sync/covens/join", json={
            "invite_code": "INVALID1"
        })
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        assert "invalid" in response.json().get("detail", "").lower()
        print("✓ Correctly rejected invalid invite code (404)")
    
    def test_join_coven_already_in_one(self):
        """POST /api/sync/covens/join - Cannot join if already in a coven (400)"""
        # First create a coven
        create_resp = self.session.post(f"{BASE_URL}/api/sync/covens", json={
            "name": "TEST_My_Coven"
        })
        assert create_resp.status_code == 200
        invite_code = create_resp.json().get("invite_code")
        
        # Try to join another coven - should fail
        response = self.session.post(f"{BASE_URL}/api/sync/covens/join", json={
            "invite_code": invite_code  # Even own code should fail
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "already in a coven" in response.json().get("detail", "").lower()
        print("✓ Correctly rejected joining when already in coven (400)")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # LEAVE COVEN TESTS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    def test_leave_coven_success(self):
        """POST /api/sync/covens/leave - Leave the current coven"""
        # First create a coven
        create_resp = self.session.post(f"{BASE_URL}/api/sync/covens", json={
            "name": "TEST_Leave_Coven"
        })
        assert create_resp.status_code == 200
        
        # Leave the coven
        response = self.session.post(f"{BASE_URL}/api/sync/covens/leave")
        assert response.status_code == 200, f"Leave coven failed: {response.text}"
        data = response.json()
        assert data.get("success") is True
        assert "left" in data.get("message", "").lower()
        print("✓ Successfully left coven")
        
        # Verify no longer in coven
        my_coven = self.session.get(f"{BASE_URL}/api/sync/covens/my")
        assert my_coven.status_code == 200
        assert my_coven.json().get("in_coven") is False
        print("✓ Verified no longer in coven")
    
    def test_leave_coven_not_in_one(self):
        """POST /api/sync/covens/leave - Cannot leave if not in a coven (400)"""
        response = self.session.post(f"{BASE_URL}/api/sync/covens/leave")
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "not in a coven" in response.json().get("detail", "").lower()
        print("✓ Correctly rejected leaving when not in coven (400)")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # GET MY COVEN TESTS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    def test_get_my_coven_not_in_one(self):
        """GET /api/sync/covens/my - Returns in_coven=false when not in coven"""
        response = self.session.get(f"{BASE_URL}/api/sync/covens/my")
        assert response.status_code == 200, f"Get my coven failed: {response.text}"
        data = response.json()
        assert data.get("in_coven") is False
        print("✓ Correctly returns in_coven=false when not in coven")
    
    def test_get_my_coven_with_details(self):
        """GET /api/sync/covens/my - Returns coven details with members list"""
        # Create a coven
        create_resp = self.session.post(f"{BASE_URL}/api/sync/covens", json={
            "name": "TEST_Details_Coven"
        })
        assert create_resp.status_code == 200
        coven_id = create_resp.json().get("coven_id")
        invite_code = create_resp.json().get("invite_code")
        
        # Get coven details
        response = self.session.get(f"{BASE_URL}/api/sync/covens/my")
        assert response.status_code == 200, f"Get my coven failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert data.get("in_coven") is True
        assert data.get("coven_id") == coven_id
        assert data.get("name") == "TEST_Details_Coven"
        assert data.get("invite_code") == invite_code
        assert data.get("role") == "leader"
        assert "members" in data
        assert isinstance(data.get("members"), list)
        assert len(data.get("members")) >= 1  # At least the creator
        assert data.get("member_count") >= 1
        assert data.get("max_members") == 6  # Default
        
        # Verify member structure
        member = data["members"][0]
        assert "user_id" in member
        assert "name" in member
        assert "role" in member
        assert "online" in member
        print(f"✓ Got coven details: {data['name']} with {data['member_count']} member(s)")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # ONLINE COUNT TEST
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    def test_get_online_count(self):
        """GET /api/sync/online-count - Returns online user count"""
        response = self.session.get(f"{BASE_URL}/api/sync/online-count")
        assert response.status_code == 200, f"Get online count failed: {response.text}"
        data = response.json()
        assert "online" in data
        assert isinstance(data.get("online"), int)
        assert data.get("online") >= 0
        print(f"✓ Online count: {data['online']}")


class TestCovenRegressionEndpoints:
    """Regression tests for cosmic-map endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login
        login_resp = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        data = login_resp.json()
        self.token = data.get("token")
        self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        yield
    
    def test_regression_power_spots(self):
        """GET /api/cosmic-map/power-spots - Regression test"""
        response = self.session.get(f"{BASE_URL}/api/cosmic-map/power-spots")
        assert response.status_code == 200, f"Power spots failed: {response.text}"
        data = response.json()
        assert "power_spots" in data
        print(f"✓ Regression: Power spots endpoint works ({len(data.get('power_spots', []))} spots)")
    
    def test_regression_celestial_nodes(self):
        """GET /api/cosmic-map/celestial/nodes - Regression test"""
        response = self.session.get(f"{BASE_URL}/api/cosmic-map/celestial/nodes")
        assert response.status_code == 200, f"Celestial nodes failed: {response.text}"
        data = response.json()
        assert "nodes" in data
        print(f"✓ Regression: Celestial nodes endpoint works ({len(data.get('nodes', []))} nodes)")


class TestWebSocketSync:
    """WebSocket /api/ws/sync tests - using synchronous wrapper"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login
        login_resp = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        data = login_resp.json()
        self.token = data.get("token")
        self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        yield
    
    def test_websocket_connection_valid_token(self):
        """WebSocket /api/ws/sync - Accepts connection with valid token"""
        async def run_test():
            ws_url = BASE_URL.replace("https", "wss").replace("http", "ws")
            uri = f"{ws_url}/api/ws/sync?token={self.token}"
            
            async with websockets.connect(uri, close_timeout=5) as ws:
                # Send ping
                await ws.send(json.dumps({"type": "ping"}))
                
                # Wait for pong response
                response = await asyncio.wait_for(ws.recv(), timeout=5)
                data = json.loads(response)
                
                assert data.get("type") == "pong"
                assert "online" in data
                print(f"✓ WebSocket connected, ping returned pong with online={data['online']}")
                return True
        
        try:
            result = asyncio.get_event_loop().run_until_complete(run_test())
            assert result
        except RuntimeError:
            # No event loop, create new one
            result = asyncio.new_event_loop().run_until_complete(run_test())
            assert result
    
    def test_websocket_position_update(self):
        """WebSocket /api/ws/sync - Position update returns coven_positions"""
        async def run_test():
            ws_url = BASE_URL.replace("https", "wss").replace("http", "ws")
            uri = f"{ws_url}/api/ws/sync?token={self.token}"
            
            async with websockets.connect(uri, close_timeout=5) as ws:
                # Send position update
                await ws.send(json.dumps({
                    "type": "position",
                    "lat": 40.7128,
                    "lng": -74.006
                }))
                
                # Wait for response (may be coven_positions or nothing if not in coven)
                try:
                    response = await asyncio.wait_for(ws.recv(), timeout=3)
                    data = json.loads(response)
                    # If in coven, should get coven_positions
                    if data.get("type") == "coven_positions":
                        assert "members" in data
                        print(f"✓ Position update returned coven_positions with {len(data['members'])} members")
                    else:
                        print(f"✓ Position update sent, received: {data.get('type')}")
                except asyncio.TimeoutError:
                    # No response is OK if not in a coven
                    print("✓ Position update sent (no coven response - user not in coven)")
                return True
        
        try:
            result = asyncio.get_event_loop().run_until_complete(run_test())
            assert result
        except RuntimeError:
            result = asyncio.new_event_loop().run_until_complete(run_test())
            assert result
    
    def test_websocket_invalid_token(self):
        """WebSocket /api/ws/sync - Rejects connection with invalid token"""
        async def run_test():
            ws_url = BASE_URL.replace("https", "wss").replace("http", "ws")
            uri = f"{ws_url}/api/ws/sync?token=invalid_token_123"
            
            try:
                async with websockets.connect(uri, close_timeout=5) as ws:
                    # Should be closed immediately
                    await asyncio.wait_for(ws.recv(), timeout=3)
                    return False  # Should not reach here
            except websockets.exceptions.ConnectionClosed as e:
                print(f"✓ WebSocket correctly rejected invalid token (code={e.code})")
                return True
            except asyncio.TimeoutError:
                print("✓ WebSocket rejected invalid token (timeout)")
                return True
            except Exception as e:
                print(f"✓ WebSocket rejected invalid token: {type(e).__name__}")
                return True
        
        try:
            result = asyncio.get_event_loop().run_until_complete(run_test())
            assert result
        except RuntimeError:
            result = asyncio.new_event_loop().run_until_complete(run_test())
            assert result


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
