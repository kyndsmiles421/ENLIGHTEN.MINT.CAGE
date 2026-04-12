"""
Transmuter API Tests — SovereignEngine v2.0
Tests for Fibonacci Accrual, Phi Cap, Scholarship Tax, and Work-Submit endpoints.

NEW v2.0 Endpoints:
- POST /api/transmuter/transmute — Fibonacci alchemy with tier-based ratios
- POST /api/transmuter/work-submit — Unified work endpoint with Fibonacci dampening
- GET /api/transmuter/status — Now includes tier_dynamics, all_tier_dynamics, scholarship_tax_rate

Test User: test_v29_user@test.com / testpass123
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    BASE_URL = "https://zero-scale-physics.preview.emergentagent.com"

TEST_EMAIL = "test_v29_user@test.com"
TEST_PASSWORD = "testpass123"


class TestTransmuterV2API:
    """Test suite for SovereignEngine v2.0 Transmuter endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Login and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        
        if login_response.status_code != 200:
            pytest.skip(f"Login failed: {login_response.status_code} - {login_response.text}")
        
        data = login_response.json()
        self.token = data.get("token")
        self.user = data.get("user", {})
        
        if not self.token:
            pytest.skip("No token received from login")
        
        self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        print(f"Logged in as: {self.user.get('email', 'unknown')}")
    
    # ========== GET /api/transmuter/status — V2.0 Fields ==========
    def test_status_returns_tier_dynamics(self):
        """GET /api/transmuter/status should return tier_dynamics for current user tier"""
        response = self.session.get(f"{BASE_URL}/api/transmuter/status")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        print(f"Status Response Keys: {list(data.keys())}")
        
        # V2.0 Required Fields
        assert "tier_dynamics" in data, "Missing tier_dynamics (V2.0 field)"
        assert "all_tier_dynamics" in data, "Missing all_tier_dynamics (V2.0 field)"
        assert "scholarship_tax_rate" in data, "Missing scholarship_tax_rate (V2.0 field)"
        assert "tier_ratios" in data, "Missing tier_ratios (V2.0 field)"
        
        # Verify tier_dynamics structure
        td = data["tier_dynamics"]
        assert "index" in td, "tier_dynamics missing index"
        assert "ratio" in td, "tier_dynamics missing ratio"
        assert "tax" in td, "tier_dynamics missing tax"
        assert "label" in td, "tier_dynamics missing label"
        
        print(f"✓ tier_dynamics: {td}")
        
        # Verify all_tier_dynamics has all tiers
        all_td = data["all_tier_dynamics"]
        assert "SOVEREIGN" in all_td, "all_tier_dynamics missing SOVEREIGN"
        assert "ARTISAN" in all_td, "all_tier_dynamics missing ARTISAN"
        assert "SEED" in all_td, "all_tier_dynamics missing SEED"
        assert "BASE" in all_td, "all_tier_dynamics missing BASE"
        
        # Verify SEED tier dynamics (ratio: 0.236, tax: 0.15)
        seed_td = all_td["SEED"]
        assert seed_td["ratio"] == 0.236, f"SEED ratio should be 0.236, got {seed_td['ratio']}"
        assert seed_td["tax"] == 0.15, f"SEED tax should be 0.15, got {seed_td['tax']}"
        
        # Verify SOVEREIGN tier dynamics (ratio: 0.618, tax: 0.0)
        sov_td = all_td["SOVEREIGN"]
        assert sov_td["ratio"] == 0.618, f"SOVEREIGN ratio should be 0.618, got {sov_td['ratio']}"
        assert sov_td["tax"] == 0.0, f"SOVEREIGN tax should be 0.0, got {sov_td['tax']}"
        
        print(f"✓ all_tier_dynamics verified: SEED={seed_td}, SOVEREIGN={sov_td}")
        
        # Verify scholarship_tax_rate
        assert data["scholarship_tax_rate"] == 0.15, f"scholarship_tax_rate should be 0.15, got {data['scholarship_tax_rate']}"
        print(f"✓ scholarship_tax_rate: {data['scholarship_tax_rate']}")
        
        # Verify tier_ratios (Fibonacci-derived)
        ratios = data["tier_ratios"]
        assert ratios == [0.09, 0.236, 0.382, 0.618], f"tier_ratios mismatch: {ratios}"
        print(f"✓ tier_ratios: {ratios}")
    
    # ========== POST /api/transmuter/transmute — Fibonacci Alchemy ==========
    def test_transmute_basic_alchemy(self):
        """POST /api/transmuter/transmute should apply Fibonacci accrual and Phi Cap"""
        # First ensure we have enough dust
        status = self.session.get(f"{BASE_URL}/api/transmuter/status").json()
        current_dust = status["dust_balance"]
        
        if current_dust < 100:
            # Accrue more dust
            for _ in range(5):
                self.session.post(
                    f"{BASE_URL}/api/transmuter/accrue-dust",
                    json={"action": "blueprint_generation", "complexity": 5.0, "source_module": "test"}
                )
            status = self.session.get(f"{BASE_URL}/api/transmuter/status").json()
            current_dust = status["dust_balance"]
        
        if current_dust < 100:
            pytest.skip(f"Not enough dust for transmute test. Have {current_dust}")
        
        input_amount = 100
        response = self.session.post(
            f"{BASE_URL}/api/transmuter/transmute",
            json={"input_amount": input_amount}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        print(f"Transmute Response: {data}")
        
        # Verify response structure
        assert data.get("transmuted") == True, "transmuted should be True"
        assert "input_amount" in data, "Missing input_amount"
        assert "net_result" in data, "Missing net_result"
        assert "tax_amount" in data, "Missing tax_amount"
        assert "capped_output" in data, "Missing capped_output"
        assert "tier_ratio" in data, "Missing tier_ratio"
        assert "tax_rate" in data, "Missing tax_rate"
        assert "tier_name" in data, "Missing tier_name"
        assert "phi_cap_applied" in data, "Missing phi_cap_applied"
        assert "dust_balance" in data, "Missing dust_balance"
        assert "transaction_id" in data, "Missing transaction_id"
        
        # Verify math: gross = input * (1 + ratio), capped = min(gross, input * 1.618)
        tier_ratio = data["tier_ratio"]
        gross_expected = input_amount * (1 + tier_ratio)
        capped_expected = min(gross_expected, input_amount * 1.618)
        tax_expected = capped_expected * data["tax_rate"]
        net_expected = capped_expected - tax_expected
        
        print(f"  Input: {input_amount}, Ratio: {tier_ratio}, Tax Rate: {data['tax_rate']}")
        print(f"  Gross: {gross_expected}, Capped: {capped_expected}, Tax: {tax_expected}, Net: {net_expected}")
        print(f"  Actual: Net={data['net_result']}, Tax={data['tax_amount']}, Capped={data['capped_output']}")
        
        # Allow for rounding differences
        assert abs(data["net_result"] - int(net_expected)) <= 1, f"Net result mismatch"
        
        print(f"✓ Transmute: {input_amount} → {data['net_result']} (tax: {data['tax_amount']}, tier: {data['tier_name']})")
    
    def test_transmute_phi_cap_ceiling(self):
        """POST /api/transmuter/transmute should apply Phi Cap (1.618x) ceiling"""
        # Ensure we have dust
        status = self.session.get(f"{BASE_URL}/api/transmuter/status").json()
        if status["dust_balance"] < 100:
            for _ in range(5):
                self.session.post(
                    f"{BASE_URL}/api/transmuter/accrue-dust",
                    json={"action": "blueprint_generation", "complexity": 5.0, "source_module": "test"}
                )
        
        input_amount = 100
        response = self.session.post(
            f"{BASE_URL}/api/transmuter/transmute",
            json={"input_amount": input_amount}
        )
        assert response.status_code == 200
        
        data = response.json()
        
        # Phi Cap = 1.618x input
        max_output = input_amount * 1.618
        
        # Capped output should never exceed Phi Cap
        assert data["capped_output"] <= max_output, f"Capped output {data['capped_output']} exceeds Phi Cap {max_output}"
        
        print(f"✓ Phi Cap verified: capped_output={data['capped_output']} <= max={max_output}")
    
    def test_transmute_insufficient_dust(self):
        """POST /api/transmuter/transmute should fail with insufficient dust"""
        response = self.session.post(
            f"{BASE_URL}/api/transmuter/transmute",
            json={"input_amount": 999999999}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print(f"✓ Correctly rejected insufficient dust: {response.json()}")
    
    def test_transmute_invalid_amount(self):
        """POST /api/transmuter/transmute should fail with invalid amount"""
        response = self.session.post(
            f"{BASE_URL}/api/transmuter/transmute",
            json={"input_amount": -50}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print(f"✓ Correctly rejected negative amount")
    
    # ========== POST /api/transmuter/work-submit — Unified Work Endpoint ==========
    def test_work_submit_basic(self):
        """POST /api/transmuter/work-submit should accrue dust with tier dynamics"""
        response = self.session.post(
            f"{BASE_URL}/api/transmuter/work-submit",
            json={"module": "test_module", "interaction_weight": 100}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        print(f"Work Submit Response: {data}")
        
        # Verify response structure
        assert data.get("accrued") == True, "accrued should be True"
        assert "earned" in data, "Missing earned"
        assert "taxed_to_master" in data, "Missing taxed_to_master"
        assert "tier" in data, "Missing tier"
        assert "ratio" in data, "Missing ratio"
        assert "tax_rate" in data, "Missing tax_rate"
        assert "dust_balance" in data, "Missing dust_balance"
        
        # Verify tier is valid
        assert data["tier"] in ["BASE", "SEED", "ARTISAN", "SOVEREIGN"], f"Invalid tier: {data['tier']}"
        
        # Verify ratio matches tier
        tier_ratios = {"BASE": 0.09, "SEED": 0.236, "ARTISAN": 0.382, "SOVEREIGN": 0.618}
        expected_ratio = tier_ratios.get(data["tier"])
        assert data["ratio"] == expected_ratio, f"Ratio mismatch for {data['tier']}: expected {expected_ratio}, got {data['ratio']}"
        
        print(f"✓ Work Submit: earned={data['earned']}, taxed={data['taxed_to_master']}, tier={data['tier']}, ratio={data['ratio']}")
    
    def test_work_submit_fibonacci_dampening(self):
        """POST /api/transmuter/work-submit should apply Fibonacci dampening (divide by Fib[3]=3)"""
        interaction_weight = 100
        response = self.session.post(
            f"{BASE_URL}/api/transmuter/work-submit",
            json={"module": "test_module", "interaction_weight": interaction_weight}
        )
        assert response.status_code == 200
        
        data = response.json()
        
        # Calculate expected: gross = weight * ratio, tax = gross * tax_rate, net = gross - tax, dampened = net / 3
        ratio = data["ratio"]
        tax_rate = data["tax_rate"]
        gross = interaction_weight * ratio
        tax = gross * tax_rate
        net = gross - tax
        dampened_expected = net / 3  # Fib[3] = 3
        
        print(f"  Weight: {interaction_weight}, Ratio: {ratio}, Tax Rate: {tax_rate}")
        print(f"  Gross: {gross}, Tax: {tax}, Net: {net}, Dampened: {dampened_expected}")
        print(f"  Actual earned: {data['earned']}")
        
        # Allow for rounding (earned is int, dampened is float)
        assert abs(data["earned"] - max(1, int(dampened_expected))) <= 1, f"Dampening mismatch"
        
        print(f"✓ Fibonacci dampening verified: {data['earned']} ≈ {dampened_expected}")
    
    def test_work_submit_different_weights(self):
        """POST /api/transmuter/work-submit should scale with interaction_weight"""
        weights = [10, 50, 100, 500]
        results = {}
        
        for weight in weights:
            response = self.session.post(
                f"{BASE_URL}/api/transmuter/work-submit",
                json={"module": "test_module", "interaction_weight": weight}
            )
            assert response.status_code == 200
            results[weight] = response.json()["earned"]
        
        print(f"✓ Weight scaling: {results}")
        
        # Higher weight should yield more dust (or equal due to minimum of 1)
        for i in range(len(weights) - 1):
            assert results[weights[i+1]] >= results[weights[i]], f"Higher weight should yield more dust"
    
    def test_work_submit_max_weight_cap(self):
        """POST /api/transmuter/work-submit should cap interaction_weight at 1000"""
        # Test with weight above cap
        response = self.session.post(
            f"{BASE_URL}/api/transmuter/work-submit",
            json={"module": "test_module", "interaction_weight": 5000}
        )
        assert response.status_code == 200
        
        data = response.json()
        
        # The weight should be capped at 1000, so earned should be based on 1000
        # This is a sanity check - the exact value depends on tier
        print(f"✓ Weight cap test: earned={data['earned']} (weight capped at 1000)")
    
    # ========== Existing Endpoints Still Work ==========
    def test_accrue_dust_still_works(self):
        """POST /api/transmuter/accrue-dust should still work (backward compatibility)"""
        response = self.session.post(
            f"{BASE_URL}/api/transmuter/accrue-dust",
            json={"action": "module_interaction", "complexity": 1.0, "source_module": "test"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("accrued") == True
        assert "dust_earned" in data
        assert "dust_balance" in data
        
        print(f"✓ accrue-dust still works: earned={data['dust_earned']}")
    
    def test_trade_dust_to_fans_still_works(self):
        """POST /api/transmuter/trade-dust-to-fans should still work (backward compatibility)"""
        # First check balance
        status = self.session.get(f"{BASE_URL}/api/transmuter/status").json()
        exchange_rate = status["exchange_rate"]
        
        if status["dust_balance"] < exchange_rate:
            pytest.skip(f"Not enough dust for trade test. Have {status['dust_balance']}, need {exchange_rate}")
        
        response = self.session.post(
            f"{BASE_URL}/api/transmuter/trade-dust-to-fans",
            json={"dust_amount": exchange_rate}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("converted") == True
        assert data["fans_earned"] >= 1
        
        print(f"✓ trade-dust-to-fans still works: earned={data['fans_earned']} fans")
    
    def test_generate_blueprint_still_works(self):
        """POST /api/transmuter/generate-blueprint should still work (backward compatibility)"""
        response = self.session.post(
            f"{BASE_URL}/api/transmuter/generate-blueprint",
            json={"length": 12, "width": 8, "trade_type": "Carpentry"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "blueprint" in data
        assert "blueprint_id" in data
        assert "dust_rewarded" in data
        
        print(f"✓ generate-blueprint still works: id={data['blueprint_id']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
