"""
Transmuter API Tests — Waste-to-Value Liquidity Controller
Tests for Digital Dust accumulation, Phi Cap exchange, and Sacred Blueprint generation.

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


class TestTransmuterAPI:
    """Test suite for Transmuter (Waste-to-Value) endpoints"""
    
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
    
    # ========== GET /api/transmuter/status ==========
    def test_transmuter_status_returns_200(self):
        """GET /api/transmuter/status should return 200 with wallet and tier info"""
        response = self.session.get(f"{BASE_URL}/api/transmuter/status")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        print(f"Transmuter Status: {data}")
        
        # Verify required fields
        assert "dust_balance" in data, "Missing dust_balance"
        assert "fans_balance" in data, "Missing fans_balance"
        assert "tier" in data, "Missing tier"
        assert "tier_name" in data, "Missing tier_name"
        assert "exchange_rate" in data, "Missing exchange_rate"
        assert "complexity_rewards" in data, "Missing complexity_rewards"
        
        # Verify data types
        assert isinstance(data["dust_balance"], int), "dust_balance should be int"
        assert isinstance(data["fans_balance"], int), "fans_balance should be int"
        assert isinstance(data["tier"], int), "tier should be int"
        assert isinstance(data["exchange_rate"], int), "exchange_rate should be int"
        assert isinstance(data["complexity_rewards"], dict), "complexity_rewards should be dict"
        
        # Verify tier is valid (1-3)
        assert data["tier"] in [1, 2, 3], f"Invalid tier: {data['tier']}"
        assert data["tier_name"] in ["SEED", "ARTISAN", "SOVEREIGN"], f"Invalid tier_name: {data['tier_name']}"
        
        print(f"✓ Status: Dust={data['dust_balance']}, Fans={data['fans_balance']}, Tier={data['tier_name']}, Rate={data['exchange_rate']}")
    
    # ========== POST /api/transmuter/accrue-dust ==========
    def test_accrue_dust_module_interaction(self):
        """POST /api/transmuter/accrue-dust should accrue dust from module interactions"""
        # Get initial balance
        status_before = self.session.get(f"{BASE_URL}/api/transmuter/status").json()
        initial_dust = status_before["dust_balance"]
        
        # Accrue dust
        response = self.session.post(
            f"{BASE_URL}/api/transmuter/accrue-dust",
            json={
                "action": "module_interaction",
                "complexity": 1.0,
                "source_module": "test_module"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        print(f"Accrue Dust Response: {data}")
        
        # Verify response structure
        assert data.get("accrued") == True, "accrued should be True"
        assert "dust_earned" in data, "Missing dust_earned"
        assert "dust_balance" in data, "Missing dust_balance"
        assert data["action"] == "module_interaction", "action mismatch"
        
        # Verify dust was actually added
        assert data["dust_balance"] >= initial_dust, "Dust balance should increase"
        assert data["dust_earned"] > 0, "Should earn some dust"
        
        print(f"✓ Accrued {data['dust_earned']} Dust. New balance: {data['dust_balance']}")
    
    def test_accrue_dust_with_complexity_multiplier(self):
        """POST /api/transmuter/accrue-dust with higher complexity should yield more dust"""
        # Test with complexity 1.0
        response_low = self.session.post(
            f"{BASE_URL}/api/transmuter/accrue-dust",
            json={"action": "task_completion", "complexity": 1.0, "source_module": "test"}
        )
        assert response_low.status_code == 200
        dust_low = response_low.json()["dust_earned"]
        
        # Test with complexity 3.0
        response_high = self.session.post(
            f"{BASE_URL}/api/transmuter/accrue-dust",
            json={"action": "task_completion", "complexity": 3.0, "source_module": "test"}
        )
        assert response_high.status_code == 200
        dust_high = response_high.json()["dust_earned"]
        
        # Higher complexity should yield more dust
        assert dust_high > dust_low, f"Higher complexity should yield more dust: {dust_high} vs {dust_low}"
        print(f"✓ Complexity multiplier works: 1.0x={dust_low}, 3.0x={dust_high}")
    
    def test_accrue_dust_different_actions(self):
        """Different actions should yield different base dust rewards"""
        actions = ["module_interaction", "journal_entry", "meditation_session", "blueprint_generation"]
        rewards = {}
        
        for action in actions:
            response = self.session.post(
                f"{BASE_URL}/api/transmuter/accrue-dust",
                json={"action": action, "complexity": 1.0, "source_module": "test"}
            )
            assert response.status_code == 200, f"Failed for action {action}"
            rewards[action] = response.json()["dust_earned"]
        
        print(f"✓ Action rewards: {rewards}")
        # Verify different actions have different rewards
        assert len(set(rewards.values())) > 1, "Different actions should have different rewards"
    
    # ========== GET /api/transmuter/exchange-preview ==========
    def test_exchange_preview(self):
        """GET /api/transmuter/exchange-preview should preview conversion without executing"""
        response = self.session.get(f"{BASE_URL}/api/transmuter/exchange-preview?dust_amount=3236")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        print(f"Exchange Preview: {data}")
        
        # Verify response structure
        assert "dust_amount" in data, "Missing dust_amount"
        assert "exchange_rate" in data, "Missing exchange_rate"
        assert "fans_you_would_receive" in data, "Missing fans_you_would_receive"
        assert "dust_consumed" in data, "Missing dust_consumed"
        assert "dust_remainder" in data, "Missing dust_remainder"
        
        # Verify math is correct
        assert data["dust_amount"] == 3236, "dust_amount should match input"
        expected_fans = 3236 // data["exchange_rate"]
        assert data["fans_you_would_receive"] == expected_fans, f"Expected {expected_fans} fans"
        
        print(f"✓ Preview: {data['dust_amount']} Dust → {data['fans_you_would_receive']} Fans @ rate {data['exchange_rate']}")
    
    # ========== POST /api/transmuter/trade-dust-to-fans ==========
    def test_trade_dust_to_fans_success(self):
        """POST /api/transmuter/trade-dust-to-fans should convert dust to fans"""
        # First check current balance
        status = self.session.get(f"{BASE_URL}/api/transmuter/status").json()
        current_dust = status["dust_balance"]
        current_fans = status["fans_balance"]
        exchange_rate = status["exchange_rate"]
        
        print(f"Before trade: Dust={current_dust}, Fans={current_fans}, Rate={exchange_rate}")
        
        # Need at least exchange_rate dust to trade
        if current_dust < exchange_rate:
            # Accrue more dust first
            for _ in range(10):
                self.session.post(
                    f"{BASE_URL}/api/transmuter/accrue-dust",
                    json={"action": "blueprint_generation", "complexity": 5.0, "source_module": "test"}
                )
            status = self.session.get(f"{BASE_URL}/api/transmuter/status").json()
            current_dust = status["dust_balance"]
            print(f"After accrual: Dust={current_dust}")
        
        if current_dust < exchange_rate:
            pytest.skip(f"Not enough dust to trade. Have {current_dust}, need {exchange_rate}")
        
        # Trade dust for fans
        trade_amount = exchange_rate * 2  # Trade for 2 fans
        if trade_amount > current_dust:
            trade_amount = (current_dust // exchange_rate) * exchange_rate
        
        response = self.session.post(
            f"{BASE_URL}/api/transmuter/trade-dust-to-fans",
            json={"dust_amount": trade_amount}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        print(f"Trade Response: {data}")
        
        # Verify response structure
        assert data.get("converted") == True, "converted should be True"
        assert "dust_consumed" in data, "Missing dust_consumed"
        assert "fans_earned" in data, "Missing fans_earned"
        assert "dust_remaining" in data, "Missing dust_remaining"
        assert "fans_balance" in data, "Missing fans_balance"
        assert "transaction_id" in data, "Missing transaction_id"
        
        # Verify fans were earned
        assert data["fans_earned"] > 0, "Should earn at least 1 fan"
        
        print(f"✓ Traded {data['dust_consumed']} Dust → {data['fans_earned']} Fans. Remaining: {data['dust_remaining']}")
    
    def test_trade_dust_insufficient_balance(self):
        """POST /api/transmuter/trade-dust-to-fans should fail with insufficient dust"""
        response = self.session.post(
            f"{BASE_URL}/api/transmuter/trade-dust-to-fans",
            json={"dust_amount": 999999999}  # Impossibly high amount
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print(f"✓ Correctly rejected insufficient balance: {response.json()}")
    
    def test_trade_dust_below_minimum(self):
        """POST /api/transmuter/trade-dust-to-fans should fail if below exchange rate"""
        response = self.session.post(
            f"{BASE_URL}/api/transmuter/trade-dust-to-fans",
            json={"dust_amount": 100}  # Below minimum (1618 base rate)
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print(f"✓ Correctly rejected below-minimum trade: {response.json()}")
    
    def test_trade_dust_invalid_amount(self):
        """POST /api/transmuter/trade-dust-to-fans should fail with invalid amount"""
        response = self.session.post(
            f"{BASE_URL}/api/transmuter/trade-dust-to-fans",
            json={"dust_amount": -100}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print(f"✓ Correctly rejected negative amount")
    
    # ========== POST /api/transmuter/generate-blueprint ==========
    def test_generate_blueprint_seed_tier(self):
        """POST /api/transmuter/generate-blueprint should generate basic blueprint for SEED tier"""
        response = self.session.post(
            f"{BASE_URL}/api/transmuter/generate-blueprint",
            json={"length": 12, "width": 8, "trade_type": "Carpentry"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        print(f"Blueprint Response: {data}")
        
        # Verify response structure
        assert "blueprint" in data, "Missing blueprint"
        assert "blueprint_id" in data, "Missing blueprint_id"
        assert "dust_rewarded" in data, "Missing dust_rewarded"
        assert "tier" in data, "Missing tier"
        assert "tier_name" in data, "Missing tier_name"
        
        bp = data["blueprint"]
        
        # Verify basic blueprint fields (all tiers)
        assert "dimensions" in bp, "Missing dimensions"
        assert "standard_cuts" in bp, "Missing standard_cuts"
        assert "trade_type" in bp, "Missing trade_type"
        assert "tier" in bp, "Missing tier in blueprint"
        
        assert bp["dimensions"] == "12x8", f"Dimensions mismatch: {bp['dimensions']}"
        assert bp["trade_type"] == "Carpentry", f"Trade type mismatch: {bp['trade_type']}"
        
        # Verify dust was rewarded
        assert data["dust_rewarded"] > 0, "Should reward dust for blueprint generation"
        
        print(f"✓ Generated {data['tier_name']} blueprint: {bp['dimensions']}, +{data['dust_rewarded']} Dust")
        
        # Check tier-specific fields
        tier = data["tier"]
        if tier >= 2:
            assert "phi_optimized" in bp, "ARTISAN+ should have phi_optimized"
            assert "masonry_ratio" in bp, "ARTISAN+ should have masonry_ratio"
            print(f"  Phi Optimized: {bp.get('phi_optimized')}")
        
        if tier >= 3:
            assert "sacred_geometry" in bp, "SOVEREIGN should have sacred_geometry"
            assert "refraction_key" in bp, "SOVEREIGN should have refraction_key (White Light Encryption)"
            print(f"  Sacred Geometry: {bp.get('sacred_geometry')}")
            print(f"  Refraction Key: {list(bp.get('refraction_key', {}).keys())}")
    
    def test_generate_blueprint_different_trade_types(self):
        """POST /api/transmuter/generate-blueprint should work with different trade types"""
        trade_types = ["Carpentry", "Masonry", "Electrical", "Plumbing", "Landscaping"]
        
        for trade_type in trade_types:
            response = self.session.post(
                f"{BASE_URL}/api/transmuter/generate-blueprint",
                json={"length": 10, "width": 10, "trade_type": trade_type}
            )
            assert response.status_code == 200, f"Failed for trade_type {trade_type}"
            bp = response.json()["blueprint"]
            assert bp["trade_type"] == trade_type, f"Trade type mismatch for {trade_type}"
        
        print(f"✓ All trade types work: {trade_types}")
    
    def test_generate_blueprint_invalid_dimensions(self):
        """POST /api/transmuter/generate-blueprint should fail with invalid dimensions"""
        response = self.session.post(
            f"{BASE_URL}/api/transmuter/generate-blueprint",
            json={"length": -5, "width": 10, "trade_type": "Carpentry"}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print(f"✓ Correctly rejected negative dimensions")
    
    # ========== GET /api/transmuter/blueprints ==========
    def test_get_user_blueprints(self):
        """GET /api/transmuter/blueprints should return user's generated blueprints"""
        response = self.session.get(f"{BASE_URL}/api/transmuter/blueprints")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        print(f"Blueprints Response: {data}")
        
        # Verify response structure
        assert "blueprints" in data, "Missing blueprints"
        assert "total" in data, "Missing total"
        assert isinstance(data["blueprints"], list), "blueprints should be a list"
        
        print(f"✓ User has {data['total']} blueprints")
        
        if data["total"] > 0:
            bp = data["blueprints"][0]
            assert "id" in bp, "Blueprint missing id"
            assert "blueprint" in bp, "Blueprint missing blueprint data"
            assert "created_at" in bp, "Blueprint missing created_at"
    
    # ========== GET /api/transmuter/history ==========
    def test_get_transmuter_history(self):
        """GET /api/transmuter/history should return transaction log"""
        response = self.session.get(f"{BASE_URL}/api/transmuter/history")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        print(f"History Response: {data}")
        
        # Verify response structure
        assert "entries" in data, "Missing entries"
        assert "total" in data, "Missing total"
        assert isinstance(data["entries"], list), "entries should be a list"
        
        print(f"✓ User has {data['total']} history entries")
        
        if data["total"] > 0:
            entry = data["entries"][0]
            assert "id" in entry, "Entry missing id"
            assert "type" in entry, "Entry missing type"
            assert "created_at" in entry, "Entry missing created_at"
            
            # Verify entry types
            valid_types = ["dust_accrual", "dust_to_fans", "blueprint_generation"]
            assert entry["type"] in valid_types, f"Invalid entry type: {entry['type']}"
    
    def test_get_transmuter_history_pagination(self):
        """GET /api/transmuter/history should support pagination"""
        response = self.session.get(f"{BASE_URL}/api/transmuter/history?skip=0&limit=5")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["entries"]) <= 5, "Should respect limit parameter"
        print(f"✓ Pagination works: returned {len(data['entries'])} entries with limit=5")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
