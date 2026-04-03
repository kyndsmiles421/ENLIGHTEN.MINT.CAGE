"""
Iteration 239 - Phonic Resonance API Tests
Tests: POST /api/phonic/record-movement, POST /api/phonic/generate-flourish,
       GET /api/phonic/harmonic-pairs, GET /api/phonic/movement-summary
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture(scope="module")
def auth_token():
    """Login and get auth token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "grad_test_522@test.com",
        "password": "password"
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")

@pytest.fixture
def auth_headers(auth_token):
    """Return headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestPhonicRecordMovement:
    """POST /api/phonic/record-movement - Records route visit with duration and velocity"""
    
    def test_record_movement_success(self, auth_headers):
        """Record a route visit and verify response structure"""
        response = requests.post(f"{BASE_URL}/api/phonic/record-movement", json={
            "route": "/meditation",
            "duration_ms": 5000,
            "velocity": 0.5
        }, headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "success" in data, "Response should contain 'success' field"
        assert data["success"] is True, "success should be True"
        assert "frequency" in data, "Response should contain 'frequency' field"
        assert "route_key" in data, "Response should contain 'route_key' field"
        
        # Verify frequency mapping (meditation = 396Hz)
        assert data["frequency"] == 396, f"Expected frequency 396 for meditation, got {data['frequency']}"
        assert data["route_key"] == "meditation", f"Expected route_key 'meditation', got {data['route_key']}"
        print(f"PASS: record-movement returns success=True, frequency={data['frequency']}, route_key={data['route_key']}")
    
    def test_record_movement_suanpan_route(self, auth_headers):
        """Test recording suanpan route (741Hz)"""
        response = requests.post(f"{BASE_URL}/api/phonic/record-movement", json={
            "route": "/suanpan",
            "duration_ms": 3000,
            "velocity": 0.0
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["frequency"] == 741, f"Expected 741Hz for suanpan, got {data['frequency']}"
        assert data["route_key"] == "suanpan"
        print(f"PASS: suanpan route returns frequency=741")
    
    def test_record_movement_star_chart_route(self, auth_headers):
        """Test recording star-chart route (852Hz)"""
        response = requests.post(f"{BASE_URL}/api/phonic/record-movement", json={
            "route": "/star-chart",
            "duration_ms": 10000,
            "velocity": 1.2
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["frequency"] == 852, f"Expected 852Hz for star-chart, got {data['frequency']}"
        assert data["route_key"] == "star-chart"
        print(f"PASS: star-chart route returns frequency=852")
    
    def test_record_movement_unauthorized(self):
        """Test that unauthenticated requests are rejected"""
        response = requests.post(f"{BASE_URL}/api/phonic/record-movement", json={
            "route": "/meditation",
            "duration_ms": 1000,
            "velocity": 0.0
        })
        
        assert response.status_code == 401 or response.status_code == 403, \
            f"Expected 401/403 for unauthorized, got {response.status_code}"
        print(f"PASS: Unauthorized request rejected with {response.status_code}")


class TestPhonicGenerateFlourish:
    """POST /api/phonic/generate-flourish - Generates sonic profile from movement history"""
    
    def test_generate_flourish_success(self, auth_headers):
        """Generate flourish and verify sonic_profile structure"""
        response = requests.post(f"{BASE_URL}/api/phonic/generate-flourish", json={
            "session_limit": 20
        }, headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "sonic_profile" in data, "Response should contain 'sonic_profile'"
        profile = data["sonic_profile"]
        
        # Verify sonic_profile fields
        assert "base_frequency" in profile, "sonic_profile should have base_frequency"
        assert "pattern" in profile, "sonic_profile should have pattern"
        assert "tempo" in profile, "sonic_profile should have tempo"
        assert "overtones" in profile, "sonic_profile should have overtones"
        
        # Verify data types
        assert isinstance(profile["base_frequency"], (int, float)), "base_frequency should be numeric"
        assert isinstance(profile["pattern"], str), "pattern should be string"
        assert isinstance(profile["tempo"], (int, float)), "tempo should be numeric"
        assert isinstance(profile["overtones"], list), "overtones should be list"
        
        # Verify pattern is valid
        valid_patterns = ["steady", "ascending", "descending", "arpeggio", "ambient", "pulsing"]
        assert profile["pattern"] in valid_patterns, f"pattern should be one of {valid_patterns}, got {profile['pattern']}"
        
        # Verify source field
        assert "source" in profile, "sonic_profile should have source field"
        valid_sources = ["time_default", "algorithmic", "gemini"]
        assert profile["source"] in valid_sources, f"source should be one of {valid_sources}"
        
        print(f"PASS: generate-flourish returns sonic_profile with base_frequency={profile['base_frequency']}, pattern={profile['pattern']}, source={profile['source']}")
    
    def test_generate_flourish_with_small_limit(self, auth_headers):
        """Test with small session limit"""
        response = requests.post(f"{BASE_URL}/api/phonic/generate-flourish", json={
            "session_limit": 5
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "sonic_profile" in data
        print(f"PASS: generate-flourish with session_limit=5 works")
    
    def test_generate_flourish_unauthorized(self):
        """Test that unauthenticated requests are rejected"""
        response = requests.post(f"{BASE_URL}/api/phonic/generate-flourish", json={
            "session_limit": 20
        })
        
        assert response.status_code == 401 or response.status_code == 403
        print(f"PASS: Unauthorized request rejected with {response.status_code}")


class TestPhonicHarmonicPairs:
    """GET /api/phonic/harmonic-pairs - Returns resonance pairs for proximity phase-locking"""
    
    def test_harmonic_pairs_success(self, auth_headers):
        """Get harmonic pairs and verify structure"""
        response = requests.get(f"{BASE_URL}/api/phonic/harmonic-pairs", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "pairs" in data, "Response should contain 'pairs'"
        assert "binaural_base" in data, "Response should contain 'binaural_base'"
        
        pairs = data["pairs"]
        assert isinstance(pairs, list), "pairs should be a list"
        assert len(pairs) == 6, f"Expected 6 pairs, got {len(pairs)}"
        
        # Verify each pair structure
        for pair in pairs:
            assert "a" in pair, "Each pair should have 'a' (module A)"
            assert "b" in pair, "Each pair should have 'b' (module B)"
            assert "freq_a" in pair, "Each pair should have 'freq_a'"
            assert "freq_b" in pair, "Each pair should have 'freq_b'"
            assert "interval" in pair, "Each pair should have 'interval'"
            assert "ratio" in pair, "Each pair should have 'ratio'"
            
            # Verify data types
            assert isinstance(pair["freq_a"], (int, float)), "freq_a should be numeric"
            assert isinstance(pair["freq_b"], (int, float)), "freq_b should be numeric"
            assert isinstance(pair["ratio"], (int, float)), "ratio should be numeric"
        
        # Verify binaural_base
        assert data["binaural_base"] == 7, f"Expected binaural_base=7, got {data['binaural_base']}"
        
        print(f"PASS: harmonic-pairs returns {len(pairs)} pairs with binaural_base={data['binaural_base']}")
        
        # Print pair details
        for pair in pairs:
            print(f"  - {pair['a']} <-> {pair['b']}: {pair['freq_a']}Hz / {pair['freq_b']}Hz ({pair['interval']}, ratio={pair['ratio']})")
    
    def test_harmonic_pairs_unauthorized(self):
        """Test that unauthenticated requests are rejected"""
        response = requests.get(f"{BASE_URL}/api/phonic/harmonic-pairs")
        
        assert response.status_code == 401 or response.status_code == 403
        print(f"PASS: Unauthorized request rejected with {response.status_code}")


class TestPhonicMovementSummary:
    """GET /api/phonic/movement-summary - Returns aggregated movement history"""
    
    def test_movement_summary_success(self, auth_headers):
        """Get movement summary and verify structure"""
        response = requests.get(f"{BASE_URL}/api/phonic/movement-summary", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "total_sessions" in data, "Response should contain 'total_sessions'"
        assert "dominant_frequency" in data, "Response should contain 'dominant_frequency'"
        assert "routes_visited" in data, "Response should contain 'routes_visited'"
        assert "total_duration_ms" in data, "Response should contain 'total_duration_ms'"
        
        # Verify data types
        assert isinstance(data["total_sessions"], int), "total_sessions should be int"
        assert isinstance(data["dominant_frequency"], (int, float)), "dominant_frequency should be numeric"
        assert isinstance(data["routes_visited"], list), "routes_visited should be list"
        assert isinstance(data["total_duration_ms"], (int, float)), "total_duration_ms should be numeric"
        
        print(f"PASS: movement-summary returns total_sessions={data['total_sessions']}, dominant_frequency={data['dominant_frequency']}")
        print(f"  - routes_visited: {data['routes_visited']}")
        print(f"  - total_duration_ms: {data['total_duration_ms']}")
    
    def test_movement_summary_unauthorized(self):
        """Test that unauthenticated requests are rejected"""
        response = requests.get(f"{BASE_URL}/api/phonic/movement-summary")
        
        assert response.status_code == 401 or response.status_code == 403
        print(f"PASS: Unauthorized request rejected with {response.status_code}")


class TestHealthCheck:
    """Basic health check to ensure API is running"""
    
    def test_health_endpoint(self):
        """Verify API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print(f"PASS: Health check returns status=ok")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
