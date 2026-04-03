"""
Iteration 249 - Trial Modal Fix & Sovereign Trial Analytics Tests

Tests for:
1. POST /api/treasury/trial-event - tracks view/dismiss/upgrade_click events
2. GET /api/treasury/sovereign/trial-analytics - returns views, dismissals, upgrades, conversion_rate
3. POST /api/treasury/sovereign/reset-trial - clears all trial events
4. PATCH /api/treasury/sovereign/config - still works correctly
5. GET /api/treasury/skeleton/export - still returns framework skeleton
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


class TestTrialAnalyticsBackend:
    """Test trial analytics endpoints for sovereign dashboard."""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication."""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self.token = None
        
        # Login to get token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if login_response.status_code == 200:
            data = login_response.json()
            self.token = data.get("zen_token") or data.get("token")
            if self.token:
                self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        
        yield
        
        self.session.close()
    
    def test_01_login_success(self):
        """Verify login works with test credentials."""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "zen_token" in data or "token" in data, "No token in response"
        print(f"✓ Login successful for {TEST_EMAIL}")
    
    def test_02_trial_event_view(self):
        """Test POST /api/treasury/trial-event with 'view' event."""
        if not self.token:
            pytest.skip("No auth token available")
        
        response = self.session.post(f"{BASE_URL}/api/treasury/trial-event", json={
            "event": "view"
        })
        assert response.status_code == 200, f"Trial event view failed: {response.text}"
        data = response.json()
        assert data.get("tracked") == True, "Event not tracked"
        print("✓ Trial event 'view' tracked successfully")
    
    def test_03_trial_event_dismiss(self):
        """Test POST /api/treasury/trial-event with 'dismiss' event."""
        if not self.token:
            pytest.skip("No auth token available")
        
        response = self.session.post(f"{BASE_URL}/api/treasury/trial-event", json={
            "event": "dismiss"
        })
        assert response.status_code == 200, f"Trial event dismiss failed: {response.text}"
        data = response.json()
        assert data.get("tracked") == True, "Event not tracked"
        print("✓ Trial event 'dismiss' tracked successfully")
    
    def test_04_trial_event_upgrade_click(self):
        """Test POST /api/treasury/trial-event with 'upgrade_click' event."""
        if not self.token:
            pytest.skip("No auth token available")
        
        response = self.session.post(f"{BASE_URL}/api/treasury/trial-event", json={
            "event": "upgrade_click"
        })
        assert response.status_code == 200, f"Trial event upgrade_click failed: {response.text}"
        data = response.json()
        assert data.get("tracked") == True, "Event not tracked"
        print("✓ Trial event 'upgrade_click' tracked successfully")
    
    def test_05_trial_event_invalid_type(self):
        """Test POST /api/treasury/trial-event with invalid event type returns 400."""
        if not self.token:
            pytest.skip("No auth token available")
        
        response = self.session.post(f"{BASE_URL}/api/treasury/trial-event", json={
            "event": "invalid_event"
        })
        assert response.status_code == 400, f"Expected 400 for invalid event, got {response.status_code}"
        print("✓ Invalid event type correctly rejected with 400")
    
    def test_06_trial_analytics_get(self):
        """Test GET /api/treasury/sovereign/trial-analytics returns correct structure."""
        if not self.token:
            pytest.skip("No auth token available")
        
        response = self.session.get(f"{BASE_URL}/api/treasury/sovereign/trial-analytics")
        assert response.status_code == 200, f"Trial analytics failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "total_views" in data, "Missing total_views"
        assert "total_dismissals" in data, "Missing total_dismissals"
        assert "total_upgrade_clicks" in data, "Missing total_upgrade_clicks"
        assert "conversion_rate" in data, "Missing conversion_rate"
        assert "dismiss_rate" in data, "Missing dismiss_rate"
        
        # Verify types
        assert isinstance(data["total_views"], int), "total_views should be int"
        assert isinstance(data["total_dismissals"], int), "total_dismissals should be int"
        assert isinstance(data["total_upgrade_clicks"], int), "total_upgrade_clicks should be int"
        assert isinstance(data["conversion_rate"], (int, float)), "conversion_rate should be numeric"
        
        print(f"✓ Trial analytics: views={data['total_views']}, dismissals={data['total_dismissals']}, upgrades={data['total_upgrade_clicks']}, conversion={data['conversion_rate']}%")
    
    def test_07_sovereign_config_get(self):
        """Test GET /api/treasury/sovereign/config still works."""
        if not self.token:
            pytest.skip("No auth token available")
        
        response = self.session.get(f"{BASE_URL}/api/treasury/sovereign/config")
        assert response.status_code == 200, f"Sovereign config GET failed: {response.text}"
        data = response.json()
        
        # Verify expected fields
        assert "fee_percent" in data, "Missing fee_percent"
        assert "is_live" in data, "Missing is_live"
        assert "mirror_active" in data, "Missing mirror_active"
        assert "frozen_transactions" in data, "Missing frozen_transactions"
        
        print(f"✓ Sovereign config: fee={data['fee_percent']}%, live={data['is_live']}, mirror={data['mirror_active']}")
    
    def test_08_sovereign_config_patch(self):
        """Test PATCH /api/treasury/sovereign/config still works."""
        if not self.token:
            pytest.skip("No auth token available")
        
        # Get current config
        get_response = self.session.get(f"{BASE_URL}/api/treasury/sovereign/config")
        original_fee = get_response.json().get("fee_percent", 5)
        
        # Update fee
        new_fee = 7.5 if original_fee != 7.5 else 8.0
        response = self.session.patch(f"{BASE_URL}/api/treasury/sovereign/config", json={
            "fee_percent": new_fee
        })
        assert response.status_code == 200, f"Sovereign config PATCH failed: {response.text}"
        data = response.json()
        assert data["fee_percent"] == new_fee, f"Fee not updated: expected {new_fee}, got {data['fee_percent']}"
        
        # Restore original fee
        self.session.patch(f"{BASE_URL}/api/treasury/sovereign/config", json={
            "fee_percent": original_fee
        })
        
        print(f"✓ Sovereign config PATCH works: updated fee to {new_fee}%, restored to {original_fee}%")
    
    def test_09_skeleton_export(self):
        """Test GET /api/treasury/skeleton/export still returns framework skeleton."""
        if not self.token:
            pytest.skip("No auth token available")
        
        response = self.session.get(f"{BASE_URL}/api/treasury/skeleton/export")
        assert response.status_code == 200, f"Skeleton export failed: {response.text}"
        data = response.json()
        
        # Verify skeleton structure
        assert "framework" in data, "Missing framework"
        assert "version" in data, "Missing version"
        assert "skeleton" in data, "Missing skeleton"
        assert "class_archetypes" in data, "Missing class_archetypes"
        
        # Verify skeleton sub-fields
        skeleton = data["skeleton"]
        assert "module_types" in skeleton, "Missing module_types"
        assert "affinity_tags" in skeleton, "Missing affinity_tags"
        assert "tier_levels" in skeleton, "Missing tier_levels"
        assert "interaction_model" in skeleton, "Missing interaction_model"
        assert "monetization" in skeleton, "Missing monetization"
        
        print(f"✓ Skeleton export: framework={data['framework']}, version={data['version']}")
    
    def test_10_reset_trial(self):
        """Test POST /api/treasury/sovereign/reset-trial clears trial events."""
        if not self.token:
            pytest.skip("No auth token available")
        
        # First add some events
        self.session.post(f"{BASE_URL}/api/treasury/trial-event", json={"event": "view"})
        self.session.post(f"{BASE_URL}/api/treasury/trial-event", json={"event": "view"})
        
        # Get analytics before reset
        before = self.session.get(f"{BASE_URL}/api/treasury/sovereign/trial-analytics").json()
        
        # Reset trial
        response = self.session.post(f"{BASE_URL}/api/treasury/sovereign/reset-trial")
        assert response.status_code == 200, f"Reset trial failed: {response.text}"
        data = response.json()
        assert data.get("reset") == True, "Reset not confirmed"
        assert "events_cleared" in data, "Missing events_cleared count"
        
        # Get analytics after reset
        after = self.session.get(f"{BASE_URL}/api/treasury/sovereign/trial-analytics").json()
        
        # Verify events were cleared
        assert after["total_views"] == 0, f"Views not cleared: {after['total_views']}"
        assert after["total_dismissals"] == 0, f"Dismissals not cleared: {after['total_dismissals']}"
        assert after["total_upgrade_clicks"] == 0, f"Upgrades not cleared: {after['total_upgrade_clicks']}"
        
        print(f"✓ Reset trial: cleared {data['events_cleared']} events, analytics now at 0")
    
    def test_11_trial_event_anonymous(self):
        """Test POST /api/treasury/trial-event works without auth (anonymous user)."""
        # Create new session without auth
        anon_session = requests.Session()
        anon_session.headers.update({"Content-Type": "application/json"})
        
        response = anon_session.post(f"{BASE_URL}/api/treasury/trial-event", json={
            "event": "view"
        })
        # Should work for anonymous users too (get_current_user_optional)
        assert response.status_code == 200, f"Anonymous trial event failed: {response.text}"
        data = response.json()
        assert data.get("tracked") == True, "Anonymous event not tracked"
        
        anon_session.close()
        print("✓ Trial event works for anonymous users")
    
    def test_12_sovereign_dashboard(self):
        """Test GET /api/treasury/sovereign/dashboard still works."""
        if not self.token:
            pytest.skip("No auth token available")
        
        response = self.session.get(f"{BASE_URL}/api/treasury/sovereign/dashboard")
        assert response.status_code == 200, f"Sovereign dashboard failed: {response.text}"
        data = response.json()
        
        # Verify expected fields
        assert "treasury_balance" in data, "Missing treasury_balance"
        assert "total_fees_collected" in data, "Missing total_fees_collected"
        assert "fee_percent" in data, "Missing fee_percent"
        assert "is_live" in data, "Missing is_live"
        assert "total_wallets" in data, "Missing total_wallets"
        
        print(f"✓ Sovereign dashboard: treasury={data['treasury_balance']}, wallets={data['total_wallets']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
