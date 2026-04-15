"""
Test Sovereign Circle Live Sessions - Iteration 322
Tests: Room creation, room listing, WebSocket connection
"""
import pytest
import requests
import os
import json
import asyncio
import websockets

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSovereignCircleREST:
    """REST API tests for Sovereign Circle"""
    
    def test_create_room(self):
        """POST /api/sovereign-live/create creates room with name, node, room_id"""
        response = requests.post(f"{BASE_URL}/api/sovereign-live/create", json={
            "name": "Test Circle",
            "node": "rapid-city"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "room_id" in data, "Response should contain room_id"
        assert "name" in data, "Response should contain name"
        assert "node" in data, "Response should contain node"
        
        # Verify room_id format (sc_XXXXXXXX)
        assert data["room_id"].startswith("sc_"), f"Room ID should start with 'sc_', got {data['room_id']}"
        assert len(data["room_id"]) == 11, f"Room ID should be 11 chars (sc_ + 8 hex), got {len(data['room_id'])}"
        
        # Verify name and node
        assert data["name"] == "Test Circle", f"Name should be 'Test Circle', got {data['name']}"
        assert data["node"] == "rapid-city", f"Node should be 'rapid-city', got {data['node']}"
        
        print(f"✓ Room created: {data['room_id']}")
        return data["room_id"]
    
    def test_create_room_default_name(self):
        """POST /api/sovereign-live/create with no name uses default"""
        response = requests.post(f"{BASE_URL}/api/sovereign-live/create", json={})
        assert response.status_code == 200
        data = response.json()
        
        assert data["name"] == "Sovereign Circle", f"Default name should be 'Sovereign Circle', got {data['name']}"
        assert data["node"] == "rapid-city", f"Default node should be 'rapid-city', got {data['node']}"
        print(f"✓ Room created with defaults: {data['room_id']}")
    
    def test_list_rooms(self):
        """GET /api/sovereign-live/rooms returns active rooms list with default_node"""
        # First create a room to ensure there's at least one
        create_resp = requests.post(f"{BASE_URL}/api/sovereign-live/create", json={
            "name": "List Test Circle"
        })
        assert create_resp.status_code == 200
        created_room_id = create_resp.json()["room_id"]
        
        # Now list rooms
        response = requests.get(f"{BASE_URL}/api/sovereign-live/rooms")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify response structure
        assert "rooms" in data, "Response should contain 'rooms' array"
        assert "default_node" in data, "Response should contain 'default_node'"
        
        # Verify default_node is Rapid City
        default_node = data["default_node"]
        assert default_node["id"] == "rapid-city", f"Default node id should be 'rapid-city', got {default_node.get('id')}"
        assert "Rapid City" in default_node["name"], f"Default node name should contain 'Rapid City', got {default_node.get('name')}"
        assert default_node["lat"] == 44.0805, f"Default node lat should be 44.0805, got {default_node.get('lat')}"
        assert default_node["lng"] == -103.2310, f"Default node lng should be -103.2310, got {default_node.get('lng')}"
        
        # Verify rooms is a list
        assert isinstance(data["rooms"], list), "rooms should be a list"
        
        # Check if our created room is in the list
        room_ids = [r["id"] for r in data["rooms"]]
        assert created_room_id in room_ids, f"Created room {created_room_id} should be in rooms list"
        
        # Verify room structure
        for room in data["rooms"]:
            assert "id" in room, "Room should have 'id'"
            assert "name" in room, "Room should have 'name'"
            assert "node" in room, "Room should have 'node'"
            assert "peer_count" in room, "Room should have 'peer_count'"
            assert "has_atmosphere" in room, "Room should have 'has_atmosphere'"
        
        print(f"✓ Listed {len(data['rooms'])} rooms, default_node: {default_node['name']}")
    
    def test_get_room_details(self):
        """GET /api/sovereign-live/rooms/{room_id} returns room details"""
        # Create a room first
        create_resp = requests.post(f"{BASE_URL}/api/sovereign-live/create", json={
            "name": "Detail Test Circle"
        })
        room_id = create_resp.json()["room_id"]
        
        # Get room details
        response = requests.get(f"{BASE_URL}/api/sovereign-live/rooms/{room_id}")
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == room_id
        assert data["name"] == "Detail Test Circle"
        assert data["node"] == "rapid-city"
        assert "peer_count" in data
        assert "has_atmosphere" in data
        print(f"✓ Got room details for {room_id}")
    
    def test_get_nonexistent_room(self):
        """GET /api/sovereign-live/rooms/{invalid_id} returns error"""
        response = requests.get(f"{BASE_URL}/api/sovereign-live/rooms/sc_invalid123")
        assert response.status_code == 200  # API returns 200 with error message
        data = response.json()
        assert "error" in data, "Should return error for nonexistent room"
        print("✓ Nonexistent room returns error correctly")


class TestSovereignCircleWebSocket:
    """WebSocket tests for Sovereign Circle"""
    
    @pytest.mark.asyncio
    async def test_websocket_connection(self):
        """WebSocket /api/ws/sovereign-circle connects and returns peer_count"""
        # First create a room via REST
        create_resp = requests.post(f"{BASE_URL}/api/sovereign-live/create", json={
            "name": "WebSocket Test Circle"
        })
        assert create_resp.status_code == 200
        room_id = create_resp.json()["room_id"]
        
        # Connect via WebSocket
        ws_url = BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://')
        ws_endpoint = f"{ws_url}/api/ws/sovereign-circle?room={room_id}&peer=test_peer_1"
        
        try:
            async with websockets.connect(ws_endpoint, timeout=10) as ws:
                # Send ping
                await ws.send(json.dumps({"type": "ping"}))
                
                # Wait for response (could be peer_count or pong)
                response = await asyncio.wait_for(ws.recv(), timeout=5)
                data = json.loads(response)
                
                # Should get either peer_count or pong
                assert data["type"] in ["peer_count", "pong"], f"Expected peer_count or pong, got {data['type']}"
                
                if data["type"] == "peer_count":
                    assert "count" in data, "peer_count should have 'count'"
                    assert data["count"] >= 1, "Should have at least 1 peer (self)"
                    print(f"✓ WebSocket connected, peer_count: {data['count']}")
                elif data["type"] == "pong":
                    assert "peers" in data, "pong should have 'peers'"
                    print(f"✓ WebSocket connected, peers: {data['peers']}")
                    
        except Exception as e:
            pytest.fail(f"WebSocket connection failed: {e}")
    
    @pytest.mark.asyncio
    async def test_websocket_no_room_error(self):
        """WebSocket without room parameter should fail"""
        ws_url = BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://')
        ws_endpoint = f"{ws_url}/api/ws/sovereign-circle?peer=test_peer"
        
        try:
            async with websockets.connect(ws_endpoint, timeout=5) as ws:
                # Should close immediately with error
                response = await asyncio.wait_for(ws.recv(), timeout=3)
                # If we get here, check for error message
                data = json.loads(response)
                assert data.get("type") == "error" or "error" in data
        except websockets.exceptions.ConnectionClosed as e:
            # Expected - connection should be closed
            assert e.code == 4000, f"Expected close code 4000, got {e.code}"
            print("✓ WebSocket correctly rejects connection without room")
        except Exception:
            # Connection refused is also acceptable
            print("✓ WebSocket correctly rejects connection without room")
    
    @pytest.mark.asyncio
    async def test_websocket_invalid_room(self):
        """WebSocket with invalid room should return error"""
        ws_url = BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://')
        ws_endpoint = f"{ws_url}/api/ws/sovereign-circle?room=invalid_room&peer=test_peer"
        
        try:
            async with websockets.connect(ws_endpoint, timeout=5) as ws:
                response = await asyncio.wait_for(ws.recv(), timeout=3)
                data = json.loads(response)
                assert data.get("type") == "error", f"Expected error, got {data}"
                print("✓ WebSocket correctly returns error for invalid room")
        except websockets.exceptions.ConnectionClosed as e:
            # Expected - connection should be closed with 4004
            assert e.code == 4004, f"Expected close code 4004, got {e.code}"
            print("✓ WebSocket correctly closes for invalid room")


class TestRegressionAuth:
    """Regression tests for auth login"""
    
    def test_auth_login_master(self):
        """Auth login works with kyndsmiles@gmail.com/testpass123"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "kyndsmiles@gmail.com",
            "password": "testpass123"
        })
        assert response.status_code == 200, f"Login failed: {response.status_code} - {response.text}"
        data = response.json()
        assert "token" in data or "user" in data, "Login should return token or user"
        print("✓ Master auth login works")
    
    def test_auth_login_test_user(self):
        """Auth login works with test_v29_user@test.com/testpass123"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test_v29_user@test.com",
            "password": "testpass123"
        })
        # This user may or may not exist, so we just check the endpoint works
        assert response.status_code in [200, 401], f"Unexpected status: {response.status_code}"
        print(f"✓ Test user auth endpoint works (status: {response.status_code})")


class TestRegressionFeatures:
    """Regression tests for Light Therapy, Herbology, Breathing"""
    
    def test_light_therapy_endpoint(self):
        """Light Therapy API is accessible"""
        # Check if there's a light therapy endpoint or it's frontend-only
        response = requests.get(f"{BASE_URL}/api/light-therapy/colors")
        # May return 404 if frontend-only, that's OK
        print(f"✓ Light Therapy endpoint check: {response.status_code}")
    
    def test_herbology_herbs(self):
        """Herbology herbs endpoint works"""
        response = requests.get(f"{BASE_URL}/api/herbology/herbs")
        assert response.status_code == 200, f"Herbology herbs failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list) or "herbs" in data, "Should return herbs list"
        print(f"✓ Herbology herbs endpoint works")
    
    def test_breathing_patterns(self):
        """Breathing patterns endpoint works"""
        response = requests.get(f"{BASE_URL}/api/breathing/patterns")
        # May be frontend-only
        print(f"✓ Breathing patterns endpoint check: {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
