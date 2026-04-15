"""
test_sovereign_live.py — Tests for Sovereign Circle Live Sessions
Tests: Room CRUD, WebSocket connections, atmosphere sync
"""
import pytest
import requests
import asyncio
import websockets
import json
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSovereignLiveRooms:
    """Sovereign Live Sessions - Room CRUD tests"""
    
    def test_create_room_with_name(self):
        """POST /api/sovereign-live/create creates a room with name, node, room_id"""
        response = requests.post(f"{BASE_URL}/api/sovereign-live/create", json={
            "name": "TEST_Session_Create"
        })
        assert response.status_code == 200
        data = response.json()
        assert "room_id" in data
        assert data["room_id"].startswith("sc_")
        assert data["name"] == "TEST_Session_Create"
        assert data["node"] == "rapid-city"  # Default node
        
    def test_create_room_with_custom_node(self):
        """POST /api/sovereign-live/create with custom node"""
        response = requests.post(f"{BASE_URL}/api/sovereign-live/create", json={
            "name": "TEST_Custom_Node",
            "node": "custom-node"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["node"] == "custom-node"
        
    def test_create_room_default_name(self):
        """POST /api/sovereign-live/create without name uses default"""
        response = requests.post(f"{BASE_URL}/api/sovereign-live/create", json={})
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Sovereign Circle"
        
    def test_list_rooms_returns_default_node(self):
        """GET /api/sovereign-live/rooms lists active rooms with default_node (Rapid City)"""
        response = requests.get(f"{BASE_URL}/api/sovereign-live/rooms")
        assert response.status_code == 200
        data = response.json()
        assert "rooms" in data
        assert "default_node" in data
        assert data["default_node"]["name"] == "Rapid City — Black Hills"
        assert data["default_node"]["id"] == "rapid-city"
        
    def test_list_rooms_contains_peer_count(self):
        """GET /api/sovereign-live/rooms returns peer_count for each room"""
        # First create a room
        create_resp = requests.post(f"{BASE_URL}/api/sovereign-live/create", json={
            "name": "TEST_Peer_Count_Room"
        })
        room_id = create_resp.json()["room_id"]
        
        # List rooms
        response = requests.get(f"{BASE_URL}/api/sovereign-live/rooms")
        assert response.status_code == 200
        data = response.json()
        
        # Find our room
        our_room = next((r for r in data["rooms"] if r["id"] == room_id), None)
        assert our_room is not None
        assert "peer_count" in our_room
        assert isinstance(our_room["peer_count"], int)
        
    def test_get_room_details(self):
        """GET /api/sovereign-live/rooms/{id} returns room details"""
        # Create a room first
        create_resp = requests.post(f"{BASE_URL}/api/sovereign-live/create", json={
            "name": "TEST_Room_Details"
        })
        room_id = create_resp.json()["room_id"]
        
        # Get room details
        response = requests.get(f"{BASE_URL}/api/sovereign-live/rooms/{room_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == room_id
        assert data["name"] == "TEST_Room_Details"
        assert data["node"] == "rapid-city"
        assert "peer_count" in data
        assert "has_atmosphere" in data
        assert "atmosphere" in data
        
    def test_get_nonexistent_room(self):
        """GET /api/sovereign-live/rooms/{invalid_id} returns error"""
        response = requests.get(f"{BASE_URL}/api/sovereign-live/rooms/nonexistent_room")
        assert response.status_code == 200  # API returns 200 with error message
        data = response.json()
        assert "error" in data


class TestSovereignLiveWebSocket:
    """Sovereign Live Sessions - WebSocket tests"""
    
    @pytest.mark.asyncio
    async def test_websocket_connect_and_ping(self):
        """WebSocket /api/ws/sovereign-circle connects and receives peer_count on ping"""
        # Create a room first
        create_resp = requests.post(f"{BASE_URL}/api/sovereign-live/create", json={
            "name": "TEST_WS_Room"
        })
        room_id = create_resp.json()["room_id"]
        
        uri = f"wss://{BASE_URL.replace('https://', '')}/api/ws/sovereign-circle?room={room_id}&peer=test_peer"
        
        async with websockets.connect(uri) as ws:
            # Should receive peer_count on connect
            initial_msg = await asyncio.wait_for(ws.recv(), timeout=5)
            initial_data = json.loads(initial_msg)
            assert initial_data["type"] == "peer_count"
            assert initial_data["count"] == 1
            
            # Send ping
            await ws.send(json.dumps({"type": "ping"}))
            pong_msg = await asyncio.wait_for(ws.recv(), timeout=5)
            pong_data = json.loads(pong_msg)
            assert pong_data["type"] == "pong"
            assert "peers" in pong_data
            
    @pytest.mark.asyncio
    async def test_websocket_invalid_room(self):
        """WebSocket to invalid room returns error and closes"""
        uri = f"wss://{BASE_URL.replace('https://', '')}/api/ws/sovereign-circle?room=invalid_room&peer=test_peer"
        
        async with websockets.connect(uri) as ws:
            msg = await asyncio.wait_for(ws.recv(), timeout=5)
            data = json.loads(msg)
            assert data["type"] == "error"
            assert "not found" in data["message"].lower()


# Run tests with: pytest /app/backend/tests/test_sovereign_live.py -v
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
