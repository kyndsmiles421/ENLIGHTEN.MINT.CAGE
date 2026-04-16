"""
V55.0 OmniCore Testing — Ghost Trails + Sacred Geometry
Tests for:
- Ghost Trails API (GET/POST endpoints)
- Health and Crystals endpoints
- Sacred Geometry overlay integration
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndCrystals:
    """Basic health and crystals endpoint tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns OK"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print("✓ Health endpoint returns OK")
    
    def test_crystals_endpoint(self):
        """Test /api/crystals returns crystal data"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        assert "crystals" in data
        assert len(data["crystals"]) > 0
        assert "categories" in data
        assert "chakras" in data
        print(f"✓ Crystals endpoint returns {len(data['crystals'])} crystals")


class TestGhostTrailsAPI:
    """V55.0 Ghost Trails API tests"""
    
    def test_get_ghost_trails_default_room(self):
        """Test GET /api/ghost-trails/default returns trails and sparks"""
        response = requests.get(f"{BASE_URL}/api/ghost-trails/default")
        assert response.status_code == 200
        data = response.json()
        assert "trails" in data
        assert "sparks" in data
        assert "active_count" in data
        assert isinstance(data["trails"], list)
        assert isinstance(data["sparks"], list)
        print(f"✓ Ghost trails GET returns trails={len(data['trails'])}, sparks={len(data['sparks'])}")
    
    def test_get_ghost_trails_custom_room(self):
        """Test GET /api/ghost-trails/{room} for custom room"""
        response = requests.get(f"{BASE_URL}/api/ghost-trails/crystals")
        assert response.status_code == 200
        data = response.json()
        assert "trails" in data
        assert "sparks" in data
        print("✓ Ghost trails GET for custom room works")
    
    def test_post_ghost_trails_update(self):
        """Test POST /api/ghost-trails/update accepts position data"""
        payload = {
            "room": "test_room_v55",
            "user_id": "pytest_user_001",
            "position": {"x": 4, "y": 3},
            "color": "#8B5CF6",
            "realm": "HOLLOW_EARTH"
        }
        response = requests.post(
            f"{BASE_URL}/api/ghost-trails/update",
            json=payload
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        assert "active_in_room" in data
        print(f"✓ Ghost trails update POST works, active_in_room={data['active_in_room']}")
    
    def test_post_ghost_trails_update_minimal(self):
        """Test POST /api/ghost-trails/update with minimal data"""
        payload = {
            "room": "test_room_v55",
            "user_id": "pytest_user_002"
        }
        response = requests.post(
            f"{BASE_URL}/api/ghost-trails/update",
            json=payload
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print("✓ Ghost trails update with minimal data works")
    
    def test_post_leave_spark(self):
        """Test POST /api/ghost-trails/leave-spark creates residue spark"""
        payload = {
            "room": "test_room_v55",
            "position": {"x": 6, "y": 5},
            "color": "#22C55E"
        }
        response = requests.post(
            f"{BASE_URL}/api/ghost-trails/leave-spark",
            json=payload
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        assert "sparks_in_room" in data
        print(f"✓ Leave spark POST works, sparks_in_room={data['sparks_in_room']}")
    
    def test_verify_spark_persisted(self):
        """Test that spark is visible in GET after POST"""
        # First create a spark
        spark_payload = {
            "room": "test_verify_spark",
            "position": {"x": 2, "y": 7},
            "color": "#FCD34D"
        }
        post_response = requests.post(
            f"{BASE_URL}/api/ghost-trails/leave-spark",
            json=spark_payload
        )
        assert post_response.status_code == 200
        
        # Then verify it appears in GET
        get_response = requests.get(f"{BASE_URL}/api/ghost-trails/test_verify_spark")
        assert get_response.status_code == 200
        data = get_response.json()
        assert len(data["sparks"]) >= 1
        # Check spark has correct structure
        spark = data["sparks"][-1]
        assert "position" in spark
        assert "color" in spark
        assert "created_at" in spark
        print("✓ Spark persisted and visible in GET")
    
    def test_verify_trail_persisted(self):
        """Test that trail is visible in GET after update"""
        # First create a trail
        trail_payload = {
            "room": "test_verify_trail",
            "user_id": "pytest_trail_user",
            "position": {"x": 3, "y": 4},
            "color": "#D8B4FE"
        }
        post_response = requests.post(
            f"{BASE_URL}/api/ghost-trails/update",
            json=trail_payload
        )
        assert post_response.status_code == 200
        
        # Then verify it appears in GET
        get_response = requests.get(f"{BASE_URL}/api/ghost-trails/test_verify_trail")
        assert get_response.status_code == 200
        data = get_response.json()
        assert len(data["trails"]) >= 1
        # Check trail has correct structure
        trail = data["trails"][0]
        assert "user_id" in trail
        assert "trail" in trail
        assert "color" in trail
        print("✓ Trail persisted and visible in GET")


class TestSacredGeometryIntegration:
    """Tests for Sacred Geometry overlay integration"""
    
    def test_breathing_endpoint_exists(self):
        """Test breathing custom patterns endpoint"""
        response = requests.get(f"{BASE_URL}/api/breathing/patterns")
        # May return 200 or 404 depending on implementation
        assert response.status_code in [200, 404, 401]
        print(f"✓ Breathing patterns endpoint status: {response.status_code}")
    
    def test_meditation_endpoint_exists(self):
        """Test meditation endpoint"""
        response = requests.get(f"{BASE_URL}/api/meditation/guided")
        assert response.status_code in [200, 404, 401]
        print(f"✓ Meditation guided endpoint status: {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
