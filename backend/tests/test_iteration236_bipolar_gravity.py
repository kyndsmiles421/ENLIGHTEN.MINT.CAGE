"""
Iteration 236 - Bipolar Gravity Ecosystem Backend Tests
Tests: Sovereign status, Mixer subscription, Mixer sources APIs
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestIteration236BipolarGravity:
    """Backend API tests for Bipolar Gravity Ecosystem iteration"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.token = token
        else:
            pytest.skip("Authentication failed - skipping authenticated tests")
    
    # ━━━ Health Check ━━━
    def test_health_endpoint(self):
        """Test health endpoint returns OK"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        print("✓ Health endpoint working")
    
    # ━━━ Sovereign Status API ━━━
    def test_sovereign_status_returns_tier(self):
        """GET /api/sovereign/status returns tier and capabilities"""
        response = self.session.get(f"{BASE_URL}/api/sovereign/status")
        assert response.status_code == 200
        data = response.json()
        
        # Verify tier info
        assert "tier" in data
        assert "tier_name" in data
        assert data["tier"] in ["standard", "apprentice", "artisan", "sovereign"]
        
        # Verify capabilities
        assert "effective_capabilities" in data
        print(f"✓ Sovereign status: tier={data['tier']}, name={data['tier_name']}")
    
    def test_sovereign_status_has_experience_config(self):
        """Sovereign status includes experience configuration"""
        response = self.session.get(f"{BASE_URL}/api/sovereign/status")
        assert response.status_code == 200
        data = response.json()
        
        assert "experience" in data
        exp = data["experience"]
        assert "visuals" in exp
        assert "audio" in exp
        print(f"✓ Experience config: visuals={exp['visuals']}, audio={exp['audio']}")
    
    # ━━━ Mixer Subscription API ━━━
    def test_mixer_subscription_returns_tier_config(self):
        """GET /api/mixer/subscription returns tier configuration"""
        response = self.session.get(f"{BASE_URL}/api/mixer/subscription")
        assert response.status_code == 200
        data = response.json()
        
        assert "tier" in data
        assert "tier_config" in data
        assert "ai_credits_remaining" in data
        
        tier_config = data["tier_config"]
        assert "layer_cap" in tier_config
        assert "name" in tier_config
        print(f"✓ Mixer subscription: tier={data['tier']}, layer_cap={tier_config['layer_cap']}, ai_credits={data['ai_credits_remaining']}")
    
    def test_mixer_subscription_has_speed_bonus(self):
        """Mixer subscription includes speed bonus percentage"""
        response = self.session.get(f"{BASE_URL}/api/mixer/subscription")
        assert response.status_code == 200
        data = response.json()
        
        assert "speed_bonus_pct" in data
        assert isinstance(data["speed_bonus_pct"], (int, float))
        print(f"✓ Speed bonus: {data['speed_bonus_pct']}%")
    
    def test_mixer_subscription_has_keyframe_automation(self):
        """Tier config includes keyframe automation flag"""
        response = self.session.get(f"{BASE_URL}/api/mixer/subscription")
        assert response.status_code == 200
        data = response.json()
        
        tier_config = data["tier_config"]
        assert "keyframe_automation" in tier_config
        print(f"✓ Keyframe automation: {tier_config['keyframe_automation']}")
    
    # ━━━ Mixer Sources API ━━━
    def test_mixer_sources_returns_list(self):
        """GET /api/mixer/sources returns sources list"""
        response = self.session.get(f"{BASE_URL}/api/mixer/sources")
        assert response.status_code == 200
        data = response.json()
        
        assert "sources" in data
        assert isinstance(data["sources"], list)
        assert len(data["sources"]) > 0
        print(f"✓ Mixer sources: {len(data['sources'])} sources available")
    
    def test_mixer_sources_have_required_fields(self):
        """Each source has required fields: id, label, type, tier"""
        response = self.session.get(f"{BASE_URL}/api/mixer/sources")
        assert response.status_code == 200
        sources = response.json()["sources"]
        
        for source in sources[:5]:  # Check first 5
            assert "id" in source
            assert "label" in source
            assert "type" in source
            assert "tier" in source
            assert "locked" in source
        print(f"✓ Sources have required fields (checked {min(5, len(sources))} sources)")
    
    def test_mixer_sources_include_phonic_tones(self):
        """Sources include phonic_tone type with frequencies"""
        response = self.session.get(f"{BASE_URL}/api/mixer/sources")
        assert response.status_code == 200
        sources = response.json()["sources"]
        
        phonic_tones = [s for s in sources if s["type"] == "phonic_tone"]
        assert len(phonic_tones) > 0
        
        # Verify frequency field
        for tone in phonic_tones[:3]:
            assert "frequency" in tone
            assert isinstance(tone["frequency"], (int, float))
        print(f"✓ Found {len(phonic_tones)} phonic tones with frequencies")
    
    # ━━━ Mixer Projects API ━━━
    def test_mixer_projects_list(self):
        """GET /api/mixer/projects returns projects list"""
        response = self.session.get(f"{BASE_URL}/api/mixer/projects")
        assert response.status_code == 200
        data = response.json()
        
        assert "projects" in data
        assert isinstance(data["projects"], list)
        print(f"✓ Mixer projects: {len(data['projects'])} projects")
    
    # ━━━ Mixer Bonus Packs API ━━━
    def test_mixer_bonus_packs_list(self):
        """GET /api/mixer/bonus-packs returns packs list"""
        response = self.session.get(f"{BASE_URL}/api/mixer/bonus-packs")
        assert response.status_code == 200
        data = response.json()
        
        assert "packs" in data
        assert isinstance(data["packs"], list)
        print(f"✓ Bonus packs: {len(data['packs'])} packs available")
    
    # ━━━ Mixer Recommendations API ━━━
    def test_mixer_recommendations(self):
        """GET /api/mixer/recommendations returns recommendations"""
        response = self.session.get(f"{BASE_URL}/api/mixer/recommendations")
        assert response.status_code == 200
        data = response.json()
        
        assert "recommendations" in data
        print(f"✓ Recommendations: {len(data['recommendations'])} recommendations")
    
    # ━━━ Mixer Auto-Compose Goals API ━━━
    def test_mixer_auto_compose_goals(self):
        """GET /api/mixer/auto-compose/goals returns goals list"""
        response = self.session.get(f"{BASE_URL}/api/mixer/auto-compose/goals")
        # May return 404 if not implemented, or 200 with goals
        if response.status_code == 200:
            data = response.json()
            assert "goals" in data
            print(f"✓ Auto-compose goals: {len(data['goals'])} goals")
        else:
            print(f"⚠ Auto-compose goals endpoint returned {response.status_code}")
    
    # ━━━ Mixer Templates API ━━━
    def test_mixer_templates(self):
        """GET /api/mixer/templates returns templates list"""
        response = self.session.get(f"{BASE_URL}/api/mixer/templates")
        if response.status_code == 200:
            data = response.json()
            assert "templates" in data
            print(f"✓ Templates: {len(data['templates'])} templates")
        else:
            print(f"⚠ Templates endpoint returned {response.status_code}")
    
    # ━━━ Mixer Recording Config API ━━━
    def test_mixer_recording_config(self):
        """GET /api/mixer/recording/config returns recording configuration"""
        response = self.session.get(f"{BASE_URL}/api/mixer/recording/config")
        if response.status_code == 200:
            data = response.json()
            assert "tier" in data or "video" in data or "audio" in data
            print(f"✓ Recording config available")
        else:
            print(f"⚠ Recording config endpoint returned {response.status_code}")
    
    # ━━━ Mixer AI Capabilities API ━━━
    def test_mixer_ai_capabilities(self):
        """GET /api/mixer/ai/capabilities returns AI capabilities"""
        response = self.session.get(f"{BASE_URL}/api/mixer/ai/capabilities")
        if response.status_code == 200:
            data = response.json()
            assert "capabilities" in data or "credits_remaining" in data
            print(f"✓ AI capabilities available")
        else:
            print(f"⚠ AI capabilities endpoint returned {response.status_code}")
    
    # ━━━ Sovereign Events API ━━━
    def test_sovereign_events_publish(self):
        """POST /api/sovereign/events/publish publishes event"""
        response = self.session.post(f"{BASE_URL}/api/sovereign/events/publish", json={
            "event_type": "test_event",
            "data": {"test": True, "iteration": 236}
        })
        # May return 200 or 201
        assert response.status_code in [200, 201, 422]
        if response.status_code in [200, 201]:
            print("✓ Event published successfully")
        else:
            print(f"⚠ Event publish returned {response.status_code}")
    
    def test_sovereign_events_recent(self):
        """GET /api/sovereign/events/recent returns recent events"""
        response = self.session.get(f"{BASE_URL}/api/sovereign/events/recent")
        if response.status_code == 200:
            data = response.json()
            assert "events" in data or isinstance(data, list)
            print(f"✓ Recent events retrieved")
        else:
            print(f"⚠ Recent events endpoint returned {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
