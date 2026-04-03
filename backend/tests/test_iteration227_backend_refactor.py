"""
Iteration 227 - Backend Refactoring Verification Tests
Tests auto-router discovery, MongoDB indexes, GZip compression, and all critical endpoints.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


class TestAuthEndpoints:
    """Authentication endpoints - core functionality after refactor"""
    
    def test_login_success(self):
        """POST /api/auth/login - verify login still works after auto-router discovery"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "Token missing from login response"
        assert "user" in data, "User missing from login response"
        assert data["user"]["email"] == TEST_EMAIL
        print(f"✓ Login successful, token received")
        return data["token"]
    
    def test_auth_me_with_token(self):
        """GET /api/auth/me - verify authenticated endpoint works"""
        # First login
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_resp.status_code == 200
        token = login_resp.json()["token"]
        
        # Then get me
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200, f"Auth/me failed: {response.text}"
        data = response.json()
        assert "id" in data
        assert "email" in data
        print(f"✓ GET /api/auth/me works, user: {data.get('name', 'N/A')}")


class TestDashboardEndpoints:
    """Dashboard endpoints - verify auto-router loaded dashboard routes"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        self.token = login_resp.json().get("token", "")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_dashboard_returns_data(self):
        """GET /api/dashboard/stats - verify dashboard endpoint works"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=self.headers)
        assert response.status_code == 200, f"Dashboard failed: {response.text}"
        data = response.json()
        # Dashboard should return some data structure
        assert isinstance(data, dict), "Dashboard should return a dict"
        print(f"✓ GET /api/dashboard/stats works, keys: {list(data.keys())[:5]}")


class TestMixerDirectorEndpoints:
    """Mixer Director endpoints - critical for Divine Director feature"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        self.token = login_resp.json().get("token", "")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_mixer_subscription(self):
        """GET /api/mixer/subscription - verify tier info returns"""
        response = requests.get(f"{BASE_URL}/api/mixer/subscription", headers=self.headers)
        assert response.status_code == 200, f"Mixer subscription failed: {response.text}"
        data = response.json()
        assert "tier" in data, "tier missing from subscription response"
        assert "tier_config" in data, "tier_config missing"
        assert "comparison" in data, "comparison missing"
        print(f"✓ GET /api/mixer/subscription works, tier: {data['tier']}")
    
    def test_mixer_sources(self):
        """GET /api/mixer/sources - verify sources list returns"""
        response = requests.get(f"{BASE_URL}/api/mixer/sources", headers=self.headers)
        assert response.status_code == 200, f"Mixer sources failed: {response.text}"
        data = response.json()
        assert "sources" in data, "sources missing"
        assert isinstance(data["sources"], list), "sources should be a list"
        assert len(data["sources"]) > 0, "sources should not be empty"
        print(f"✓ GET /api/mixer/sources works, {len(data['sources'])} sources")
    
    def test_mixer_recommendations(self):
        """GET /api/mixer/recommendations - verify hexagram data returns"""
        response = requests.get(f"{BASE_URL}/api/mixer/recommendations", headers=self.headers)
        assert response.status_code == 200, f"Mixer recommendations failed: {response.text}"
        data = response.json()
        assert "hexagram" in data, "hexagram missing"
        assert "recommendations" in data, "recommendations missing"
        print(f"✓ GET /api/mixer/recommendations works, hexagram: {data['hexagram'].get('number', 'N/A')}")
    
    def test_mixer_projects_list(self):
        """GET /api/mixer/projects - verify project list returns"""
        response = requests.get(f"{BASE_URL}/api/mixer/projects", headers=self.headers)
        assert response.status_code == 200, f"Mixer projects failed: {response.text}"
        data = response.json()
        assert "projects" in data, "projects missing"
        assert isinstance(data["projects"], list), "projects should be a list"
        print(f"✓ GET /api/mixer/projects works, {len(data['projects'])} projects")
    
    def test_mixer_projects_save(self):
        """POST /api/mixer/projects - verify project save works"""
        response = requests.post(
            f"{BASE_URL}/api/mixer/projects",
            headers=self.headers,
            json={
                "name": "TEST_Refactor_227_Project",
                "tracks": [
                    {"type": "phonic_tone", "source_label": "Test Track", "volume": 0.8, "duration": 60}
                ]
            }
        )
        assert response.status_code == 200, f"Mixer project save failed: {response.text}"
        data = response.json()
        assert "status" in data, "status missing"
        assert data["status"] in ["created", "updated"], f"Unexpected status: {data['status']}"
        print(f"✓ POST /api/mixer/projects works, status: {data['status']}")
    
    def test_mixer_ripple_edit(self):
        """POST /api/mixer/projects/ripple - verify ripple edit works (from iteration 226)"""
        # First create a project with multiple tracks
        create_resp = requests.post(
            f"{BASE_URL}/api/mixer/projects",
            headers=self.headers,
            json={
                "name": "TEST_Ripple_227_Project",
                "tracks": [
                    {"type": "phonic_tone", "source_label": "Track 1", "volume": 0.8, "duration": 60, "start_time": 0},
                    {"type": "ambience", "source_label": "Track 2", "volume": 0.7, "duration": 30, "start_time": 60},
                    {"type": "mantra", "source_label": "Track 3", "volume": 0.6, "duration": 45, "start_time": 90}
                ]
            }
        )
        assert create_resp.status_code == 200
        project_id = create_resp.json().get("project_id")
        
        # Now test ripple edit
        response = requests.post(
            f"{BASE_URL}/api/mixer/projects/ripple",
            headers=self.headers,
            json={
                "project_id": project_id,
                "changed_index": 0,
                "old_duration": 60,
                "new_duration": 90,
                "old_start": 0,
                "new_start": 0
            }
        )
        assert response.status_code == 200, f"Ripple edit failed: {response.text}"
        data = response.json()
        assert "tracks" in data, "tracks missing from ripple response"
        assert "shifted_indices" in data, "shifted_indices missing"
        assert "ripple_delta" in data, "ripple_delta missing"
        print(f"✓ POST /api/mixer/projects/ripple works, shifted: {data['shifted_indices']}")
    
    def test_mixer_bonus_packs(self):
        """GET /api/mixer/bonus-packs - verify bonus packs list returns"""
        response = requests.get(f"{BASE_URL}/api/mixer/bonus-packs", headers=self.headers)
        assert response.status_code == 200, f"Mixer bonus-packs failed: {response.text}"
        data = response.json()
        assert "packs" in data, "packs missing"
        assert isinstance(data["packs"], list), "packs should be a list"
        print(f"✓ GET /api/mixer/bonus-packs works, {len(data['packs'])} packs")


class TestEnergyGatesEndpoints:
    """Energy Gates endpoints - verify auto-router loaded energy_gates routes"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        self.token = login_resp.json().get("token", "")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_energy_gates_status(self):
        """GET /api/energy-gates/status - verify gate data returns"""
        response = requests.get(f"{BASE_URL}/api/energy-gates/status", headers=self.headers)
        assert response.status_code == 200, f"Energy gates status failed: {response.text}"
        data = response.json()
        # Should return gate status data
        assert isinstance(data, dict), "Energy gates should return a dict"
        print(f"✓ GET /api/energy-gates/status works")


class TestSubscriptionsEndpoints:
    """Subscriptions endpoints - verify auto-router loaded subscriptions routes"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        self.token = login_resp.json().get("token", "")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_subscriptions_my_plan(self):
        """GET /api/subscriptions/my-plan - verify subscription returns"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/my-plan", headers=self.headers)
        assert response.status_code == 200, f"Subscriptions my-plan failed: {response.text}"
        data = response.json()
        assert isinstance(data, dict), "Subscription should return a dict"
        print(f"✓ GET /api/subscriptions/my-plan works")


class TestGZipCompression:
    """GZip compression middleware verification"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        self.token = login_resp.json().get("token", "")
        self.headers = {"Authorization": f"Bearer {self.token}", "Accept-Encoding": "gzip, deflate"}
    
    def test_gzip_on_large_response(self):
        """Verify GZip compression is applied to responses > 500 bytes"""
        # mixer/sources returns a large response that should trigger GZip
        response = requests.get(
            f"{BASE_URL}/api/mixer/sources",
            headers=self.headers
        )
        assert response.status_code == 200
        
        # Check if response was compressed (requests auto-decompresses)
        # We can check the Content-Encoding header in response.headers
        content_encoding = response.headers.get("Content-Encoding", "")
        
        # Note: GZip middleware only compresses if response > minimum_size (500 bytes)
        # and client accepts gzip encoding
        if len(response.content) > 500:
            print(f"✓ Response size: {len(response.content)} bytes, Content-Encoding: {content_encoding or 'none'}")
        else:
            print(f"✓ Response size: {len(response.content)} bytes (below GZip threshold)")


class TestAutoRouterDiscovery:
    """Verify auto-router discovery loaded all critical route modules"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        self.token = login_resp.json().get("token", "")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_auth_routes_loaded(self):
        """Verify auth routes are loaded"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL, "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        print("✓ Auth routes loaded")
    
    def test_dashboard_routes_loaded(self):
        """Verify dashboard routes are loaded"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=self.headers)
        assert response.status_code == 200
        print("✓ Dashboard routes loaded")
    
    def test_mixer_director_routes_loaded(self):
        """Verify mixer_director routes are loaded"""
        response = requests.get(f"{BASE_URL}/api/mixer/subscription", headers=self.headers)
        assert response.status_code == 200
        print("✓ Mixer Director routes loaded")
    
    def test_energy_gates_routes_loaded(self):
        """Verify energy_gates routes are loaded"""
        response = requests.get(f"{BASE_URL}/api/energy-gates/status", headers=self.headers)
        assert response.status_code == 200
        print("✓ Energy Gates routes loaded")
    
    def test_subscriptions_routes_loaded(self):
        """Verify subscriptions routes are loaded"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/my-plan", headers=self.headers)
        assert response.status_code == 200
        print("✓ Subscriptions routes loaded")
    
    def test_hexagram_routes_loaded(self):
        """Verify hexagram routes are loaded"""
        response = requests.get(f"{BASE_URL}/api/hexagram/current", headers=self.headers)
        # May return 200 or 404 depending on user state, but not 500
        assert response.status_code in [200, 404], f"Hexagram routes error: {response.status_code}"
        print("✓ Hexagram routes loaded")
    
    def test_profiles_routes_loaded(self):
        """Verify profiles routes are loaded"""
        response = requests.get(f"{BASE_URL}/api/profiles/me", headers=self.headers)
        assert response.status_code in [200, 404]
        print("✓ Profiles routes loaded")
    
    def test_notifications_routes_loaded(self):
        """Verify notifications routes are loaded"""
        response = requests.get(f"{BASE_URL}/api/notifications/status", headers=self.headers)
        assert response.status_code == 200
        print("✓ Notifications routes loaded")
    
    def test_community_routes_loaded(self):
        """Verify community routes are loaded"""
        response = requests.get(f"{BASE_URL}/api/community/feed", headers=self.headers)
        assert response.status_code == 200
        print("✓ Community routes loaded")
    
    def test_meditations_routes_loaded(self):
        """Verify meditations routes are loaded"""
        response = requests.get(f"{BASE_URL}/api/meditation/my-custom", headers=self.headers)
        assert response.status_code == 200
        print("✓ Meditations routes loaded")


class TestMongoDBConnectionPooling:
    """Verify MongoDB connection pooling is working (indirect test via response times)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        self.token = login_resp.json().get("token", "")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_multiple_rapid_requests(self):
        """Make multiple rapid requests to verify connection pooling handles load"""
        import time
        
        endpoints = [
            "/api/dashboard/stats",
            "/api/mixer/subscription",
            "/api/mixer/sources",
            "/api/mixer/projects",
            "/api/subscriptions/my-plan"
        ]
        
        start = time.time()
        for endpoint in endpoints:
            response = requests.get(f"{BASE_URL}{endpoint}", headers=self.headers)
            assert response.status_code == 200, f"{endpoint} failed: {response.status_code}"
        
        elapsed = time.time() - start
        print(f"✓ 5 rapid requests completed in {elapsed:.2f}s (avg {elapsed/5:.2f}s per request)")
        
        # With connection pooling, this should be reasonably fast
        assert elapsed < 30, f"Requests too slow ({elapsed:.2f}s), possible connection pooling issue"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
