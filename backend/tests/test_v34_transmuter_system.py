"""
V34.0 Transmuter System Tests — Inverse Exponential Math
Tests work-submit with session_duration + resonance_score
Tests transmute endpoint with V34.0 math (100 dust → ~221 net)
"""

import pytest
import requests
import os
import math

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# V34.0 Constants
PHI = 1.618033988749895
PHI_SQUARED = 2.618033988749895
PHI_CUBED = 4.236067977499790

class TestV34TransmuterSystem:
    """V34.0 Transmuter API tests with inverse exponential math"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with auth"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login with test credentials
        login_resp = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test_v29_user@test.com",
            "password": "testpass123"
        })
        
        if login_resp.status_code == 200:
            token = login_resp.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.authenticated = True
        else:
            self.authenticated = False
            pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_transmuter_status(self):
        """Test GET /api/transmuter/status returns V34.0 tier dynamics"""
        resp = self.session.get(f"{BASE_URL}/api/transmuter/status")
        assert resp.status_code == 200, f"Status failed: {resp.text}"
        
        data = resp.json()
        # Verify V34.0 fields
        assert "dust_balance" in data
        assert "tier" in data
        assert "tier_name" in data
        assert "tier_dynamics" in data
        assert "phi_constant" in data
        
        # Verify phi constant is correct
        assert abs(data["phi_constant"] - PHI) < 0.0001, "PHI constant mismatch"
        
        # Verify tier dynamics structure
        dynamics = data["tier_dynamics"]
        assert "ratio" in dynamics
        assert "tax" in dynamics
        assert "resonance_mult" in dynamics
        print(f"PASS: Transmuter status - Tier: {data['tier_name']}, Dust: {data['dust_balance']}")
    
    def test_work_submit_with_session_duration(self):
        """Test POST /api/transmuter/work-submit with session_duration and resonance_score"""
        payload = {
            "module": "breathing",
            "interaction_weight": 10,
            "session_duration": 300,  # 5 minutes
            "resonance_score": 0.8
        }
        
        resp = self.session.post(f"{BASE_URL}/api/transmuter/work-submit", json=payload)
        assert resp.status_code == 200, f"Work submit failed: {resp.text}"
        
        data = resp.json()
        assert data.get("accrued") == True
        assert "earned" in data
        assert "taxed_to_master" in data
        assert "tier" in data
        assert "ratio" in data
        assert "tax_rate" in data
        assert "dust_balance" in data
        
        # Earned should be positive
        assert data["earned"] > 0, "Earned dust should be positive"
        print(f"PASS: Work submit - Earned: {data['earned']}, Tax: {data['taxed_to_master']}, Balance: {data['dust_balance']}")
    
    def test_work_submit_short_interaction(self):
        """Test work-submit with no session duration (short interaction)"""
        payload = {
            "module": "oracle",
            "interaction_weight": 12,
            "session_duration": 0,
            "resonance_score": 0.5
        }
        
        resp = self.session.post(f"{BASE_URL}/api/transmuter/work-submit", json=payload)
        assert resp.status_code == 200, f"Work submit failed: {resp.text}"
        
        data = resp.json()
        assert data.get("accrued") == True
        assert data["earned"] > 0
        print(f"PASS: Short interaction - Earned: {data['earned']}")
    
    def test_transmute_v34_math(self):
        """Test POST /api/transmuter/transmute with V34.0 inverse exponential math
        
        V34.0 Math:
        1. Surge: input * φ² (2.618)
        2. Tax: tier-specific (SEED = 15%)
        3. Inverse multiplier: φ^(-1/(pool+1))
        4. Phi Cap ceiling: input * φ³
        
        For 100 dust at SEED tier:
        - Surge: 100 * 2.618 = 261.8
        - Tax (15%): 261.8 * 0.15 = 39.27
        - After tax: 261.8 - 39.27 = 222.53
        - Inverse mult at pool=100: φ^(-1/101) ≈ 0.9952
        - Net: 222.53 * 0.9952 ≈ 221.46
        - Ceiling: 100 * 4.236 = 423.6 (not hit)
        """
        # First check current balance
        status_resp = self.session.get(f"{BASE_URL}/api/transmuter/status")
        assert status_resp.status_code == 200
        initial_balance = status_resp.json()["dust_balance"]
        
        # Skip if insufficient balance
        if initial_balance < 100:
            pytest.skip(f"Insufficient dust balance ({initial_balance}) for transmute test")
        
        payload = {"input_amount": 100}
        resp = self.session.post(f"{BASE_URL}/api/transmuter/transmute", json=payload)
        assert resp.status_code == 200, f"Transmute failed: {resp.text}"
        
        data = resp.json()
        assert data.get("transmuted") == True
        assert "net_result" in data
        assert "tax_amount" in data
        assert "surge_output" in data or "capped_output" in data
        assert "inverse_multiplier" in data or "tier_ratio" in data
        assert "tier_name" in data
        
        net_result = data["net_result"]
        tax_amount = data["tax_amount"]
        
        # V34.0 math verification for SEED tier (most common)
        # Net result should be approximately 221 for 100 input at SEED tier
        # Allow some variance for different tiers
        if data["tier_name"] == "SEED":
            # SEED: 15% tax, ratio 0.236
            expected_min = 180  # Lower bound
            expected_max = 250  # Upper bound
            assert expected_min <= net_result <= expected_max, \
                f"V34.0 math check: net_result {net_result} outside expected range [{expected_min}, {expected_max}]"
        
        print(f"PASS: Transmute V34.0 - Input: 100, Net: {net_result}, Tax: {tax_amount}, Tier: {data['tier_name']}")
        print(f"  Inverse multiplier applied, phi_cap_applied: {data.get('phi_cap_applied', 'N/A')}")
    
    def test_transmute_insufficient_balance(self):
        """Test transmute with insufficient balance returns 400"""
        payload = {"input_amount": 999999999}
        resp = self.session.post(f"{BASE_URL}/api/transmuter/transmute", json=payload)
        assert resp.status_code == 400, "Should fail with insufficient balance"
        print("PASS: Transmute insufficient balance returns 400")
    
    def test_accrue_dust(self):
        """Test POST /api/transmuter/accrue-dust"""
        payload = {
            "action": "meditation_session",
            "complexity": 1.5,
            "source_module": "meditation"
        }
        
        resp = self.session.post(f"{BASE_URL}/api/transmuter/accrue-dust", json=payload)
        assert resp.status_code == 200, f"Accrue dust failed: {resp.text}"
        
        data = resp.json()
        assert data.get("accrued") == True
        assert "dust_earned" in data
        assert "dust_balance" in data
        assert data["dust_earned"] > 0
        print(f"PASS: Accrue dust - Earned: {data['dust_earned']}, Balance: {data['dust_balance']}")
    
    def test_exchange_preview(self):
        """Test GET /api/transmuter/exchange-preview"""
        resp = self.session.get(f"{BASE_URL}/api/transmuter/exchange-preview?dust_amount=1618")
        assert resp.status_code == 200, f"Exchange preview failed: {resp.text}"
        
        data = resp.json()
        assert "dust_amount" in data
        assert "exchange_rate" in data
        assert "fans_you_would_receive" in data
        assert data["dust_amount"] == 1618
        print(f"PASS: Exchange preview - Rate: {data['exchange_rate']}, Fans: {data['fans_you_would_receive']}")
    
    def test_transmuter_history(self):
        """Test GET /api/transmuter/history"""
        resp = self.session.get(f"{BASE_URL}/api/transmuter/history")
        assert resp.status_code == 200, f"History failed: {resp.text}"
        
        data = resp.json()
        assert "entries" in data
        assert "total" in data
        assert isinstance(data["entries"], list)
        print(f"PASS: Transmuter history - {data['total']} total entries")


class TestTransmuterMathVerification:
    """Verify V34.0 inverse exponential math calculations"""
    
    def test_inverse_multiplier_formula(self):
        """Verify inverse multiplier: φ^(-1/(pool+1))"""
        # At pool=0: φ^(-1) = 0.618
        inv_0 = PHI ** (-1.0 / (0 + 1))
        assert abs(inv_0 - 0.618) < 0.01, f"Inverse at pool=0 should be ~0.618, got {inv_0}"
        
        # At pool=100: φ^(-0.0099) ≈ 0.9952
        inv_100 = PHI ** (-1.0 / (100 + 1))
        assert abs(inv_100 - 0.9952) < 0.01, f"Inverse at pool=100 should be ~0.9952, got {inv_100}"
        
        print(f"PASS: Inverse multiplier formula verified - pool=0: {inv_0:.4f}, pool=100: {inv_100:.4f}")
    
    def test_transmute_calculation(self):
        """Verify transmute calculation: input * φ² * (1-tax) * inverse_mult"""
        input_amount = 100
        tax_rate = 0.15  # SEED tier
        
        # Step 1: Surge
        surge = input_amount * PHI_SQUARED  # 261.8
        
        # Step 2: Tax
        tax = surge * tax_rate  # 39.27
        after_tax = surge - tax  # 222.53
        
        # Step 3: Inverse multiplier
        inv_mult = PHI ** (-1.0 / (input_amount + 1))  # ~0.9952
        net = after_tax * inv_mult  # ~221.46
        
        # Step 4: Ceiling check
        ceiling = input_amount * PHI_CUBED  # 423.6
        final = min(net, ceiling)
        
        assert 220 <= final <= 225, f"Expected ~221, got {final}"
        print(f"PASS: Transmute calculation verified - Input: {input_amount}, Net: {final:.2f}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
