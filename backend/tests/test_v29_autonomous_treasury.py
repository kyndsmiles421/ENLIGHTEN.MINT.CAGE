"""
V29.0 Autonomous Treasury API Tests
Tests for the Four-Tiered Pay Structure, Haptic Milestone Alerts, Voice Commands, and Audit Stream

Endpoints tested:
- GET /api/treasury/status - Public telemetry with PHI constant
- GET /api/treasury/haptic-status - Tier 4 expansion, milestone tracking, pulse pattern
- GET /api/treasury/cashflow - Cash flow waveform data
- GET /api/treasury/audit - Master Authority only (should return 403 for non-master)
- GET /api/treasury/audit-stream - Master Authority only terminal feed
- POST /api/treasury/voice-command - Voice command handler (Audit Treasury, Vault Status)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_USER_EMAIL = "grad_test_522@test.com"
TEST_USER_PASSWORD = "password"
MASTER_EMAIL = "kyndsmiles@gmail.com"

# V29.0 Constants
PHI = 1.618033988749895
SAFETY_BUFFER = 40000.00
HAPTIC_THRESHOLD = 1000.00
HAPTIC_INTENSITY = 0.80
SOLFEGGIO_PULSE = [174, 100, 528, 100, 174]


class TestTreasuryPublicEndpoints:
    """Tests for public treasury endpoints (no auth required)"""
    
    def test_treasury_status_returns_public_telemetry(self):
        """GET /api/treasury/status - Returns public telemetry with PHI constant"""
        response = requests.get(f"{BASE_URL}/api/treasury/status")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["status"] == "success"
        assert "treasury" in data
        
        treasury = data["treasury"]
        assert treasury["system_status"] == "AUTONOMOUS"
        assert "lox_stable" in treasury
        assert "autopay_active" in treasury
        assert "cash_flow" in treasury
        assert "node_count" in treasury
        assert "phi_constant" in treasury
        
        # Verify PHI constant
        assert treasury["phi_constant"] == PHI, f"Expected PHI={PHI}, got {treasury['phi_constant']}"
        
        print(f"✓ Treasury status: {treasury['system_status']}, PHI={treasury['phi_constant']}")
    
    def test_treasury_haptic_status_returns_tier4_and_milestones(self):
        """GET /api/treasury/haptic-status - Returns Tier 4 expansion, milestone tracking, pulse pattern"""
        response = requests.get(f"{BASE_URL}/api/treasury/haptic-status")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["status"] == "success"
        
        # Verify Tier 4 Expansion data
        assert "tier4_expansion" in data
        assert isinstance(data["tier4_expansion"], (int, float))
        
        # Verify milestone tracking
        assert "last_milestone" in data
        assert "next_milestone" in data
        assert "distance_to_next" in data
        
        # Verify haptic configuration
        assert data["haptic_intensity"] == HAPTIC_INTENSITY, f"Expected intensity={HAPTIC_INTENSITY}, got {data['haptic_intensity']}"
        assert data["pulse_pattern"] == SOLFEGGIO_PULSE, f"Expected pulse={SOLFEGGIO_PULSE}, got {data['pulse_pattern']}"
        
        # Verify recent haptic events array
        assert "recent_haptic_events" in data
        assert isinstance(data["recent_haptic_events"], list)
        
        print(f"✓ Haptic status: T4=${data['tier4_expansion']:,.2f}, next milestone=${data['next_milestone']:,.0f}")
    
    def test_treasury_cashflow_returns_waveform_data(self):
        """GET /api/treasury/cashflow - Returns cash flow waveform data"""
        response = requests.get(f"{BASE_URL}/api/treasury/cashflow?hours=24")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["status"] == "success"
        assert "cashflow" in data
        
        cashflow = data["cashflow"]
        assert "period_hours" in cashflow
        assert cashflow["period_hours"] == 24
        assert "total_revenue" in cashflow
        assert "total_expenses" in cashflow
        assert "net_flow" in cashflow
        assert "transaction_count" in cashflow
        assert "waveform" in cashflow
        
        waveform = cashflow["waveform"]
        assert "peaks" in waveform
        assert "dips" in waveform
        assert isinstance(waveform["peaks"], list)
        assert isinstance(waveform["dips"], list)
        
        print(f"✓ Cash flow: revenue=${cashflow['total_revenue']:.2f}, expenses=${cashflow['total_expenses']:.2f}, net=${cashflow['net_flow']:.2f}")


class TestTreasuryAuthenticatedEndpoints:
    """Tests for authenticated treasury endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get auth headers for authenticated requests"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_treasury_audit_returns_403_for_non_master(self, auth_headers):
        """GET /api/treasury/audit - Should return 403 for non-master user"""
        response = requests.get(f"{BASE_URL}/api/treasury/audit", headers=auth_headers)
        
        # Non-master user should get 403 Forbidden
        assert response.status_code == 403, f"Expected 403 for non-master, got {response.status_code}: {response.text}"
        
        print(f"✓ Audit endpoint correctly returns 403 for non-master user")
    
    def test_treasury_audit_stream_returns_403_for_non_master(self, auth_headers):
        """GET /api/treasury/audit-stream - Should return 403 for non-master user"""
        response = requests.get(f"{BASE_URL}/api/treasury/audit-stream", headers=auth_headers)
        
        # Non-master user should get 403 Forbidden
        assert response.status_code == 403, f"Expected 403 for non-master, got {response.status_code}: {response.text}"
        
        print(f"✓ Audit stream endpoint correctly returns 403 for non-master user")
    
    def test_treasury_voice_command_returns_403_for_non_master(self, auth_headers):
        """POST /api/treasury/voice-command - Should return 403 for non-master user"""
        response = requests.post(
            f"{BASE_URL}/api/treasury/voice-command",
            json={"command": "Audit Treasury"},
            headers=auth_headers
        )
        
        # Non-master user should get 403 Forbidden
        assert response.status_code == 403, f"Expected 403 for non-master, got {response.status_code}: {response.text}"
        
        print(f"✓ Voice command endpoint correctly returns 403 for non-master user")
    
    def test_treasury_pending_returns_403_for_non_master(self, auth_headers):
        """GET /api/treasury/pending - Should return 403 for non-master user"""
        response = requests.get(f"{BASE_URL}/api/treasury/pending", headers=auth_headers)
        
        # Non-master user should get 403 Forbidden
        assert response.status_code == 403, f"Expected 403 for non-master, got {response.status_code}: {response.text}"
        
        print(f"✓ Pending authorizations endpoint correctly returns 403 for non-master user")
    
    def test_treasury_emergency_stop_returns_403_for_non_master(self, auth_headers):
        """POST /api/treasury/emergency-stop - Should return 403 for non-master user"""
        response = requests.post(
            f"{BASE_URL}/api/treasury/emergency-stop",
            json={},
            headers=auth_headers
        )
        
        # Non-master user should get 403 Forbidden
        assert response.status_code == 403, f"Expected 403 for non-master, got {response.status_code}: {response.text}"
        
        print(f"✓ Emergency stop endpoint correctly returns 403 for non-master user")
    
    def test_treasury_resume_returns_403_for_non_master(self, auth_headers):
        """POST /api/treasury/resume - Should return 403 for non-master user"""
        response = requests.post(f"{BASE_URL}/api/treasury/resume", headers=auth_headers)
        
        # Non-master user should get 403 Forbidden
        assert response.status_code == 403, f"Expected 403 for non-master, got {response.status_code}: {response.text}"
        
        print(f"✓ Resume endpoint correctly returns 403 for non-master user")


class TestTreasuryFourTierStructure:
    """Tests for the Four-Tiered Pay Structure logic"""
    
    def test_haptic_status_tier4_formula(self):
        """Verify Tier 4 Expansion formula: Reservoir - Buffer - Escrow"""
        response = requests.get(f"{BASE_URL}/api/treasury/haptic-status")
        
        assert response.status_code == 200
        data = response.json()
        
        tier4 = data["tier4_expansion"]
        
        # Tier 4 should be positive (Reservoir > Buffer + Escrow)
        assert tier4 >= 0, f"Tier 4 Expansion should be >= 0, got {tier4}"
        
        # Verify milestone calculation
        next_milestone = data["next_milestone"]
        last_milestone = data["last_milestone"]
        
        # Next milestone should be greater than last
        assert next_milestone > last_milestone, f"Next milestone ({next_milestone}) should be > last ({last_milestone})"
        
        # Distance to next should be positive
        assert data["distance_to_next"] > 0, f"Distance to next milestone should be > 0"
        
        print(f"✓ Four-Tier structure verified: T4=${tier4:,.2f}, milestones working")
    
    def test_haptic_threshold_is_1000(self):
        """Verify haptic threshold is $1,000"""
        response = requests.get(f"{BASE_URL}/api/treasury/haptic-status")
        
        assert response.status_code == 200
        data = response.json()
        
        # Next milestone should be a multiple of 1000
        next_milestone = data["next_milestone"]
        assert next_milestone % HAPTIC_THRESHOLD == 0, f"Next milestone ({next_milestone}) should be multiple of {HAPTIC_THRESHOLD}"
        
        print(f"✓ Haptic threshold verified: ${HAPTIC_THRESHOLD:,.0f} increments")


class TestTreasuryRevenueEndpoint:
    """Tests for revenue addition endpoint"""
    
    def test_treasury_revenue_requires_amount_and_source(self):
        """POST /api/treasury/revenue - Requires amount and source"""
        # Missing amount
        response = requests.post(
            f"{BASE_URL}/api/treasury/revenue",
            json={"source": "test"}
        )
        assert response.status_code == 400, f"Expected 400 for missing amount, got {response.status_code}"
        
        # Missing source
        response = requests.post(
            f"{BASE_URL}/api/treasury/revenue",
            json={"amount": 100}
        )
        assert response.status_code == 400, f"Expected 400 for missing source, got {response.status_code}"
        
        print(f"✓ Revenue endpoint validates required fields")
    
    def test_treasury_revenue_rejects_negative_amount(self):
        """POST /api/treasury/revenue - Rejects negative amounts"""
        response = requests.post(
            f"{BASE_URL}/api/treasury/revenue",
            json={"amount": -100, "source": "test"}
        )
        assert response.status_code == 400, f"Expected 400 for negative amount, got {response.status_code}"
        
        print(f"✓ Revenue endpoint rejects negative amounts")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
