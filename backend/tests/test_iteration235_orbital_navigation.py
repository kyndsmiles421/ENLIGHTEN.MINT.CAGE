"""
Iteration 235 - Orbital Navigation System Tests
Tests for: SovereignCrossbar, NebulaSphere, NebulaPlayground, SovereignHUD
Backend APIs: /api/sovereign/status, /api/mixer/subscription, /api/mixer/sources
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestOrbitalNavigationBackend:
    """Backend API tests for Orbital Navigation system"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with auth"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        
        if login_response.status_code == 200:
            data = login_response.json()
            self.token = data.get("token") or data.get("access_token")
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
            print(f"Auth successful, token obtained")
        else:
            pytest.skip(f"Authentication failed: {login_response.status_code}")
    
    # ━━━ Sovereign Status API ━━━
    def test_sovereign_status_returns_tier(self):
        """GET /api/sovereign/status returns tier info for crossbar"""
        response = self.session.get(f"{BASE_URL}/api/sovereign/status")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "tier" in data, "Response should contain 'tier'"
        assert data["tier"] in ["standard", "apprentice", "artisan", "sovereign"], f"Invalid tier: {data['tier']}"
        print(f"Sovereign status: tier={data['tier']}")
    
    def test_sovereign_status_has_capabilities(self):
        """GET /api/sovereign/status returns capabilities for HUD"""
        response = self.session.get(f"{BASE_URL}/api/sovereign/status")
        assert response.status_code == 200
        
        data = response.json()
        # Should have capabilities or active_units for HUD display
        assert "capabilities" in data or "active_units" in data, "Response should contain capabilities or active_units"
        print(f"Sovereign capabilities present")
    
    # ━━━ Mixer Subscription API ━━━
    def test_mixer_subscription_returns_config(self):
        """GET /api/mixer/subscription returns tier config for crossbar modules"""
        response = self.session.get(f"{BASE_URL}/api/mixer/subscription")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        # Should have tier-related config
        assert "tier" in data or "subscription" in data or "config" in data, "Response should contain tier config"
        print(f"Mixer subscription data received")
    
    # ━━━ Mixer Sources API ━━━
    def test_mixer_sources_returns_list(self):
        """GET /api/mixer/sources returns sources for Divine Director module"""
        response = self.session.get(f"{BASE_URL}/api/mixer/sources")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        # Should return sources list
        assert isinstance(data, (list, dict)), "Response should be list or dict"
        if isinstance(data, dict):
            assert "sources" in data or len(data) > 0, "Response should contain sources"
        print(f"Mixer sources received")
    
    # ━━━ Pub/Sub Events API (for HUD) ━━━
    def test_pubsub_publish_event(self):
        """POST /api/sovereign/events/publish for sphere merge events"""
        response = self.session.post(f"{BASE_URL}/api/sovereign/events/publish", json={
            "event_type": "sphere_merge_test",
            "payload": {
                "module_id": "starchart",
                "label": "Star Charts",
                "merged_at": 1234567890
            }
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("published") == True, "Event should be published"
        print(f"Pub/sub event published successfully")
    
    def test_pubsub_recent_events(self):
        """GET /api/sovereign/events/recent for HUD recent tasks feed"""
        response = self.session.get(f"{BASE_URL}/api/sovereign/events/recent")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "events" in data, "Response should contain 'events'"
        assert isinstance(data["events"], list), "Events should be a list"
        print(f"Recent events: {len(data['events'])} events")
    
    # ━━━ Regression Tests ━━━
    def test_mixer_templates_still_working(self):
        """GET /api/mixer/templates regression test"""
        response = self.session.get(f"{BASE_URL}/api/mixer/templates")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("Mixer templates API working")
    
    def test_mixer_recording_config_still_working(self):
        """GET /api/mixer/recording/config regression test"""
        response = self.session.get(f"{BASE_URL}/api/mixer/recording/config")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("Mixer recording config API working")
    
    def test_mixer_ai_capabilities_still_working(self):
        """GET /api/mixer/ai/capabilities regression test"""
        response = self.session.get(f"{BASE_URL}/api/mixer/ai/capabilities")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("Mixer AI capabilities API working")
    
    def test_sovereign_tiers_still_working(self):
        """GET /api/sovereign/tiers regression test"""
        response = self.session.get(f"{BASE_URL}/api/sovereign/tiers")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "tiers" in data, "Response should contain 'tiers'"
        assert len(data["tiers"]) == 4, "Should have 4 tiers"
        print("Sovereign tiers API working")
    
    def test_command_mode_still_working(self):
        """POST /api/sovereign/command regression test"""
        response = self.session.post(f"{BASE_URL}/api/sovereign/command", json={
            "command": "test command",
            "context": "mixer"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "thinking_chain" in data or "ai_response" in data, "Response should contain thinking_chain or ai_response"
        print("Command mode API working")


class TestOrbitalNavigationHeaders:
    """Test Sovereign Tier Middleware headers"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with auth"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        
        if login_response.status_code == 200:
            data = login_response.json()
            self.token = data.get("token") or data.get("access_token")
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        else:
            pytest.skip(f"Authentication failed: {login_response.status_code}")
    
    def test_sovereign_tier_header_present(self):
        """X-Sovereign-Tier header should be present on API responses"""
        response = self.session.get(f"{BASE_URL}/api/sovereign/status")
        assert response.status_code == 200
        
        # Check for tier header
        tier_header = response.headers.get("X-Sovereign-Tier")
        assert tier_header is not None, "X-Sovereign-Tier header should be present"
        assert tier_header in ["standard", "apprentice", "artisan", "sovereign"], f"Invalid tier header: {tier_header}"
        print(f"X-Sovereign-Tier header: {tier_header}")
    
    def test_response_time_header_present(self):
        """X-Response-Time header should be present on API responses"""
        response = self.session.get(f"{BASE_URL}/api/sovereign/status")
        assert response.status_code == 200
        
        time_header = response.headers.get("X-Response-Time")
        assert time_header is not None, "X-Response-Time header should be present"
        print(f"X-Response-Time header: {time_header}")
    
    def test_tier_priority_header_present(self):
        """X-Tier-Priority header should be present on API responses"""
        response = self.session.get(f"{BASE_URL}/api/sovereign/status")
        assert response.status_code == 200
        
        priority_header = response.headers.get("X-Tier-Priority")
        assert priority_header is not None, "X-Tier-Priority header should be present"
        print(f"X-Tier-Priority header: {priority_header}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
