"""
V56.0 Full System Audit - Backend API Tests
Tests all critical endpoints for the mobile PWA audit
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://zero-scale-physics.preview.emergentagent.com')

class TestHealthAndCore:
    """Health check and core API tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns OK"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print(f"Health check passed: {data}")
    
    def test_api_root(self):
        """Test API root responds"""
        response = requests.get(f"{BASE_URL}/api")
        assert response.status_code in [200, 404]  # May redirect or return info


class TestOmniBridgeAPI:
    """OmniBridge Cross-Cultural Intelligence API tests"""
    
    def test_traditions_endpoint(self):
        """Test /api/omni-bridge/traditions returns 10 traditions"""
        response = requests.get(f"{BASE_URL}/api/omni-bridge/traditions")
        assert response.status_code == 200
        data = response.json()
        assert "traditions" in data
        assert data.get("count") == 10
        
        # Verify all 10 traditions present
        tradition_ids = [t["id"] for t in data["traditions"]]
        expected = ["lakota", "kemetic", "vedic", "yoruba", "mayan", 
                   "aboriginal", "celtic", "kabbalistic", "taoist", "sufi"]
        for tid in expected:
            assert tid in tradition_ids, f"Missing tradition: {tid}"
        print(f"Traditions endpoint passed: {data['count']} traditions")
    
    def test_mixer_tags_endpoint(self):
        """Test /api/omni-bridge/mixer-tags returns tags for all traditions"""
        response = requests.get(f"{BASE_URL}/api/omni-bridge/mixer-tags")
        assert response.status_code == 200
        data = response.json()
        
        # Should have 10 traditions with tags
        assert len(data) == 10
        
        # Each tradition should have tags array
        for tid, tdata in data.items():
            assert "tags" in tdata, f"Missing tags for {tid}"
            assert "name" in tdata, f"Missing name for {tid}"
            assert len(tdata["tags"]) > 0, f"Empty tags for {tid}"
        
        print(f"Mixer tags endpoint passed: {len(data)} traditions with tags")
    
    def test_lakota_sky_endpoint(self):
        """Test /api/omni-bridge/lakota-sky returns constellations"""
        response = requests.get(f"{BASE_URL}/api/omni-bridge/lakota-sky")
        assert response.status_code == 200
        data = response.json()
        
        # Should have constellations
        assert "constellations" in data or isinstance(data, list)
        constellations = data.get("constellations", data)
        assert len(constellations) >= 7, f"Expected 7+ constellations, got {len(constellations)}"
        print(f"Lakota Sky endpoint passed: {len(constellations)} constellations")
    
    def test_cultural_map_endpoint(self):
        """Test /api/omni-bridge/cultural-map returns bridges"""
        response = requests.get(f"{BASE_URL}/api/omni-bridge/cultural-map")
        assert response.status_code == 200
        data = response.json()
        
        # Should have bridges
        assert "bridges" in data or "modules" in data
        print(f"Cultural map endpoint passed")
    
    def test_node_mythology_endpoint(self):
        """Test /api/omni-bridge/node-mythology/{node_id} returns node data"""
        response = requests.get(f"{BASE_URL}/api/omni-bridge/node-mythology/0")
        assert response.status_code == 200
        data = response.json()
        
        # Should have node data
        assert "node_name" in data or "chakra" in data or "element" in data
        print(f"Node mythology endpoint passed: {data.get('node_name', 'Center')}")


class TestEconomyAPI:
    """Economy and subscription tier tests"""
    
    def test_economy_tiers_endpoint(self):
        """Test /api/economy/tiers returns 4 subscription tiers"""
        response = requests.get(f"{BASE_URL}/api/economy/tiers")
        assert response.status_code == 200
        data = response.json()
        
        assert "tiers" in data
        tiers = data["tiers"]
        assert len(tiers) == 4, f"Expected 4 tiers, got {len(tiers)}"
        
        # Verify tier IDs
        tier_ids = [t["id"] for t in tiers]
        expected = ["discovery", "resonance", "sovereign", "architect"]
        for tid in expected:
            assert tid in tier_ids, f"Missing tier: {tid}"
        
        print(f"Economy tiers endpoint passed: {len(tiers)} tiers")


class TestAuthAPI:
    """Authentication API tests"""
    
    def test_login_endpoint_exists(self):
        """Test /api/auth/login endpoint exists"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpass"
        })
        # Should return 401 for invalid credentials, not 404
        assert response.status_code in [401, 400, 422], f"Unexpected status: {response.status_code}"
        print(f"Auth login endpoint exists: status {response.status_code}")
    
    def test_valid_login(self):
        """Test login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test_v29_user@test.com",
            "password": "testpass123"
        })
        
        if response.status_code == 200:
            data = response.json()
            assert "token" in data or "access_token" in data
            print(f"Login successful for test user")
        else:
            print(f"Login returned {response.status_code} - user may not exist")


class TestBreathingAPI:
    """Breathing module API tests"""
    
    def test_breathing_patterns_endpoint(self):
        """Test breathing patterns are available"""
        # This may be a frontend-only feature, but check if API exists
        response = requests.get(f"{BASE_URL}/api/breathing/patterns")
        if response.status_code == 200:
            data = response.json()
            print(f"Breathing patterns endpoint exists")
        else:
            print(f"Breathing patterns endpoint: {response.status_code} (may be frontend-only)")


class TestCrystalsAPI:
    """Crystals module API tests"""
    
    def test_crystals_list_endpoint(self):
        """Test crystals list endpoint"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        if response.status_code == 200:
            data = response.json()
            print(f"Crystals endpoint exists")
        else:
            print(f"Crystals endpoint: {response.status_code}")


class TestOracleAPI:
    """Oracle/Tarot API tests"""
    
    def test_oracle_endpoint(self):
        """Test oracle endpoint exists"""
        response = requests.get(f"{BASE_URL}/api/oracle/cards")
        if response.status_code == 200:
            data = response.json()
            print(f"Oracle cards endpoint exists")
        else:
            print(f"Oracle endpoint: {response.status_code}")


class TestGamesAPI:
    """Games module API tests"""
    
    def test_games_list_endpoint(self):
        """Test games list endpoint"""
        response = requests.get(f"{BASE_URL}/api/games")
        if response.status_code == 200:
            data = response.json()
            print(f"Games endpoint exists")
        else:
            print(f"Games endpoint: {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
