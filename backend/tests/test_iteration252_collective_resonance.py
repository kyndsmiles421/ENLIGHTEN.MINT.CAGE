"""
Iteration 252 - Collective Resonance Dashboard Testing
Tests for:
- GET /api/resonance/global — global density, cross-cluster resonance, cluster heatmap, surge status
- GET /api/resonance/heatmap — condensed 4×4 cluster heatmap
- GET /api/resonance/matrix — full 24×24 global matrix (auth required)
- GET /api/resonance/surge — current Harmony Surge status
- POST /api/resonance/trigger-aggregation — manual aggregation trigger
- POST /api/broker/trade — commerce fee 0.5% during surge (not 2%)
- POST /api/broker/transmute — 60 Dust = 1 Gem during surge (not 100)
- POST /api/quad-hex/resolve-h2 — still generates 24×24 matrix
- GET /api/bank/wallet — dual currency
- POST /api/sentinel/scan — phase-aware scanning
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_USER_EMAIL = "grad_test_522@test.com"
TEST_USER_PASSWORD = "password"
TEST_USER_2_EMAIL = "broker_test@test.com"
TEST_USER_2_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user 1"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        return data.get("token") or data.get("access_token")
    pytest.skip(f"Authentication failed for {TEST_USER_EMAIL}: {response.status_code}")


@pytest.fixture(scope="module")
def auth_token_2():
    """Get authentication token for test user 2"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_USER_2_EMAIL,
        "password": TEST_USER_2_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        return data.get("token") or data.get("access_token")
    pytest.skip(f"Authentication failed for {TEST_USER_2_EMAIL}: {response.status_code}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Auth headers for test user 1"""
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture(scope="module")
def auth_headers_2(auth_token_2):
    """Auth headers for test user 2"""
    return {"Authorization": f"Bearer {auth_token_2}"}


class TestResonanceGlobal:
    """Tests for GET /api/resonance/global endpoint"""
    
    def test_global_resonance_public_access(self):
        """Global resonance endpoint should be publicly accessible"""
        response = requests.get(f"{BASE_URL}/api/resonance/global")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify response structure
        assert "global_density" in data, "Missing global_density"
        assert "cross_cluster_resonance" in data, "Missing cross_cluster_resonance"
        assert "cluster_heatmap" in data, "Missing cluster_heatmap"
        assert "surge" in data, "Missing surge"
        assert "total_users_in_matrix" in data, "Missing total_users_in_matrix"
        
    def test_global_density_value(self):
        """Global density should be a float between 0 and 1"""
        response = requests.get(f"{BASE_URL}/api/resonance/global")
        assert response.status_code == 200
        data = response.json()
        
        density = data.get("global_density", 0)
        assert isinstance(density, (int, float)), "global_density should be numeric"
        assert 0 <= density <= 1, f"global_density {density} should be between 0 and 1"
        
    def test_cluster_heatmap_structure(self):
        """Cluster heatmap should be a 4×4 grid"""
        response = requests.get(f"{BASE_URL}/api/resonance/global")
        assert response.status_code == 200
        data = response.json()
        
        heatmap = data.get("cluster_heatmap", [])
        assert len(heatmap) == 4, f"Heatmap should have 4 rows, got {len(heatmap)}"
        for row in heatmap:
            assert len(row) == 4, f"Each heatmap row should have 4 columns, got {len(row)}"
            
    def test_cross_cluster_resonance_structure(self):
        """Cross-cluster resonance should contain cluster pairs"""
        response = requests.get(f"{BASE_URL}/api/resonance/global")
        assert response.status_code == 200
        data = response.json()
        
        resonance = data.get("cross_cluster_resonance", {})
        assert isinstance(resonance, dict), "cross_cluster_resonance should be a dict"
        # Should have at least some cluster pairs
        if resonance:
            for key, value in resonance.items():
                assert isinstance(value, (int, float)), f"Resonance value for {key} should be numeric"
                
    def test_surge_status_structure(self):
        """Surge status should have active, triggers, and effects"""
        response = requests.get(f"{BASE_URL}/api/resonance/global")
        assert response.status_code == 200
        data = response.json()
        
        surge = data.get("surge", {})
        assert "active" in surge, "Surge should have 'active' field"
        assert isinstance(surge["active"], bool), "surge.active should be boolean"
        
        if surge["active"]:
            assert "triggers" in surge, "Active surge should have triggers"
            assert "effects" in surge, "Active surge should have effects"


class TestResonanceHeatmap:
    """Tests for GET /api/resonance/heatmap endpoint"""
    
    def test_heatmap_public_access(self):
        """Heatmap endpoint should be publicly accessible"""
        response = requests.get(f"{BASE_URL}/api/resonance/heatmap")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert "heatmap" in data, "Missing heatmap"
        assert "density" in data, "Missing density"
        
    def test_heatmap_4x4_structure(self):
        """Heatmap should be a 4×4 grid"""
        response = requests.get(f"{BASE_URL}/api/resonance/heatmap")
        assert response.status_code == 200
        data = response.json()
        
        heatmap = data.get("heatmap", [])
        assert len(heatmap) == 4, f"Heatmap should have 4 rows, got {len(heatmap)}"
        for row in heatmap:
            assert len(row) == 4, f"Each row should have 4 columns, got {len(row)}"


class TestResonanceMatrix:
    """Tests for GET /api/resonance/matrix endpoint (auth required)"""
    
    def test_matrix_requires_auth(self):
        """Matrix endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/resonance/matrix")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        
    def test_matrix_with_auth(self, auth_headers):
        """Matrix endpoint should return 24×24 matrix with auth"""
        response = requests.get(f"{BASE_URL}/api/resonance/matrix", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Matrix may be None if not yet computed
        if data.get("matrix"):
            matrix = data["matrix"]
            assert len(matrix) == 24, f"Matrix should have 24 rows, got {len(matrix)}"
            for row in matrix:
                assert len(row) == 24, f"Each row should have 24 columns, got {len(row)}"


class TestResonanceSurge:
    """Tests for GET /api/resonance/surge endpoint"""
    
    def test_surge_status_public(self):
        """Surge status should be publicly accessible"""
        response = requests.get(f"{BASE_URL}/api/resonance/surge")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert "active" in data, "Missing 'active' field"
        assert isinstance(data["active"], bool), "active should be boolean"
        
    def test_surge_effects_when_active(self):
        """When surge is active, effects should include fee override and transmute discount"""
        response = requests.get(f"{BASE_URL}/api/resonance/surge")
        assert response.status_code == 200
        data = response.json()
        
        if data.get("active"):
            effects = data.get("effects", {})
            assert "commerce_fee_override" in effects, "Active surge should have commerce_fee_override"
            assert "transmute_discount" in effects, "Active surge should have transmute_discount"
            
            # Verify surge values
            assert effects["commerce_fee_override"] == 0.5, f"Commerce fee should be 0.5% during surge, got {effects['commerce_fee_override']}"
            assert effects["transmute_discount"] == 0.6, f"Transmute discount should be 0.6 (40% off), got {effects['transmute_discount']}"


class TestResonanceTriggerAggregation:
    """Tests for POST /api/resonance/trigger-aggregation endpoint"""
    
    def test_trigger_requires_auth(self):
        """Manual aggregation trigger should require authentication"""
        response = requests.post(f"{BASE_URL}/api/resonance/trigger-aggregation")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        
    def test_trigger_with_auth(self, auth_headers):
        """Manual aggregation should work with auth"""
        response = requests.post(f"{BASE_URL}/api/resonance/trigger-aggregation", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Should return snapshot or message
        assert data is not None, "Should return aggregation result"


class TestBrokerTradeSurgeAware:
    """Tests for POST /api/broker/trade with Harmony Surge awareness"""
    
    def test_trade_commerce_fee_during_surge(self, auth_headers, auth_headers_2):
        """Commerce fee should be 0.5% during Harmony Surge (not 2%)"""
        # First check if surge is active
        surge_response = requests.get(f"{BASE_URL}/api/resonance/surge")
        surge_data = surge_response.json()
        surge_active = surge_data.get("active", False)
        
        # Get user 2's ID for trade target
        me_response = requests.get(f"{BASE_URL}/api/auth/me", headers=auth_headers_2)
        if me_response.status_code != 200:
            pytest.skip("Could not get user 2 info")
        target_user_id = me_response.json().get("id")
        
        # Attempt a trade
        trade_response = requests.post(f"{BASE_URL}/api/broker/trade", headers=auth_headers, json={
            "target_user_id": target_user_id,
            "currency": "dust",
            "amount": 10,
            "trade_type": "transfer"
        })
        
        # Trade may fail due to insufficient balance or quad-scan, but we can check the fee rate
        if trade_response.status_code == 200:
            trade_data = trade_response.json()
            if trade_data.get("traded"):
                fee_rate = trade_data.get("commerce_fee_rate")
                if surge_active:
                    assert fee_rate == 0.5, f"During surge, commerce fee should be 0.5%, got {fee_rate}%"
                else:
                    assert fee_rate == 2, f"Without surge, commerce fee should be 2%, got {fee_rate}%"
                    
                # Verify surge status is reported
                assert "harmony_surge_active" in trade_data, "Trade response should include harmony_surge_active"


class TestBrokerTransmuteSurgeAware:
    """Tests for POST /api/broker/transmute with Harmony Surge awareness"""
    
    def test_transmute_ratio_during_surge(self, auth_headers):
        """Transmutation ratio should be 60:1 during surge (not 100:1)"""
        # Check surge status
        surge_response = requests.get(f"{BASE_URL}/api/resonance/surge")
        surge_data = surge_response.json()
        surge_active = surge_data.get("active", False)
        
        # Get wallet balance
        wallet_response = requests.get(f"{BASE_URL}/api/bank/wallet", headers=auth_headers)
        if wallet_response.status_code != 200:
            pytest.skip("Could not get wallet")
        wallet = wallet_response.json()
        dust_balance = wallet.get("dust", 0)
        
        # Determine minimum dust needed based on surge
        min_dust = 60 if surge_active else 100
        
        if dust_balance < min_dust:
            pytest.skip(f"Insufficient dust for transmutation test (have {dust_balance}, need {min_dust})")
            
        # Attempt transmutation
        transmute_response = requests.post(f"{BASE_URL}/api/broker/transmute", headers=auth_headers, json={
            "dust_amount": min_dust
        })
        
        if transmute_response.status_code == 200:
            data = transmute_response.json()
            if data.get("transmuted"):
                effective_ratio = data.get("effective_ratio")
                if surge_active:
                    assert effective_ratio == 60, f"During surge, ratio should be 60:1, got {effective_ratio}:1"
                else:
                    assert effective_ratio == 100, f"Without surge, ratio should be 100:1, got {effective_ratio}:1"
                    
                assert "harmony_surge_active" in data, "Transmute response should include harmony_surge_active"


class TestQuadHexResolveH2:
    """Tests for POST /api/quad-hex/resolve-h2 — still generates 24×24 matrix"""
    
    def test_resolve_h2_requires_auth(self):
        """H² resolve should require authentication"""
        response = requests.post(f"{BASE_URL}/api/quad-hex/resolve-h2")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        
    def test_resolve_h2_returns_24x24_matrix(self, auth_headers):
        """H² resolve should return a 24×24 matrix"""
        response = requests.post(f"{BASE_URL}/api/quad-hex/resolve-h2", headers=auth_headers, json={})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Matrix is stored as h2_matrix
        assert "h2_matrix" in data, "Response should include h2_matrix"
        matrix = data["h2_matrix"]
        assert len(matrix) == 24, f"Matrix should have 24 rows, got {len(matrix)}"
        for row in matrix:
            assert len(row) == 24, f"Each row should have 24 columns, got {len(row)}"
            
        # Verify other H² fields
        assert "cross_cluster_resonance" in data, "Should include cross_cluster_resonance"
        assert "matrix_density" in data, "Should include matrix_density"
        assert "matrix_dimensions" in data, "Should include matrix_dimensions"
        assert data["matrix_dimensions"] == "24×24", f"Matrix dimensions should be 24×24, got {data['matrix_dimensions']}"


class TestBankWallet:
    """Tests for GET /api/bank/wallet — dual currency"""
    
    def test_wallet_requires_auth(self):
        """Wallet endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/bank/wallet")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        
    def test_wallet_returns_dual_currency(self, auth_headers):
        """Wallet should return both dust and gems"""
        response = requests.get(f"{BASE_URL}/api/bank/wallet", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert "dust" in data, "Wallet should include dust"
        assert "gems" in data, "Wallet should include gems"
        assert isinstance(data["dust"], (int, float)), "dust should be numeric"
        assert isinstance(data["gems"], (int, float)), "gems should be numeric"


class TestSentinelScan:
    """Tests for POST /api/sentinel/scan — phase-aware scanning"""
    
    def test_sentinel_scan_requires_auth(self):
        """Sentinel scan should require authentication"""
        response = requests.post(f"{BASE_URL}/api/sentinel/scan", json={"target_user_id": "test"})
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        
    def test_sentinel_scan_with_auth(self, auth_headers):
        """Sentinel scan should work with auth"""
        # Get own user ID
        me_response = requests.get(f"{BASE_URL}/api/auth/me", headers=auth_headers)
        if me_response.status_code != 200:
            pytest.skip("Could not get user info")
        user_id = me_response.json().get("id")
        
        response = requests.post(f"{BASE_URL}/api/sentinel/scan", headers=auth_headers, json={
            "target_user_id": user_id
        })
        # May return 200 or 400 depending on scan rules
        assert response.status_code in [200, 400], f"Expected 200 or 400, got {response.status_code}"


class TestSurgeEffectsIntegration:
    """Integration tests for Harmony Surge effects across the system"""
    
    def test_surge_status_consistency(self):
        """Surge status should be consistent across endpoints"""
        # Get surge from /resonance/surge
        surge_response = requests.get(f"{BASE_URL}/api/resonance/surge")
        assert surge_response.status_code == 200
        surge_data = surge_response.json()
        surge_active_1 = surge_data.get("active", False)
        
        # Get surge from /resonance/global
        global_response = requests.get(f"{BASE_URL}/api/resonance/global")
        assert global_response.status_code == 200
        global_data = global_response.json()
        surge_active_2 = global_data.get("surge", {}).get("active", False)
        
        assert surge_active_1 == surge_active_2, "Surge status should be consistent across endpoints"
        
    def test_surge_triggers_documented(self):
        """When surge is active, triggers should be documented"""
        response = requests.get(f"{BASE_URL}/api/resonance/surge")
        assert response.status_code == 200
        data = response.json()
        
        if data.get("active"):
            triggers = data.get("triggers", [])
            assert len(triggers) > 0, "Active surge should have at least one trigger"
            
            for trigger in triggers:
                assert "type" in trigger, "Each trigger should have a type"
                assert "value" in trigger, "Each trigger should have a value"
                assert "threshold" in trigger, "Each trigger should have a threshold"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
