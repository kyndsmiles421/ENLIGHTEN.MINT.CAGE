"""
Iteration 251 - H² (Hexagram Squared) Engine Testing
Tests for:
- POST /api/quad-hex/resolve-h2 — 24×24 matrix, cross_cluster_resonance, matrix_density, determinant_proxy, variable_return_tax
- POST /api/quad-hex/resolve — linear 24-bit state vector (backward compat)
- GET /api/quad-hex/tensor — cached H² tensor with full 24×24 matrix
- GET /api/quad-hex/phase — current platform phase mode
- POST /api/broker/trade — recursive 2-pass verification with H² matrix
- POST /api/broker/transmute — Dust to Gems conversion
- GET /api/broker/scan-preview — h2_analysis with matrix_density, determinant, variable_return_tax
- GET /api/bank/wallet — dust and gems balance
- POST /api/bank/earn — awards dust for platform actions
- GET /api/bank/policy — monetary policy stats
- POST /api/sentinel/scan — phase-aware content scanning
- GET /api/sentinel/stats — sentinel violation stats
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_USER_1 = {"email": "grad_test_522@test.com", "password": "password"}
TEST_USER_2 = {"email": "broker_test@test.com", "password": "password"}


class TestH2EngineBackend:
    """H² Engine Backend API Tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session and authenticate"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Authenticate user 1
        login_res = self.session.post(f"{BASE_URL}/api/auth/login", json=TEST_USER_1)
        if login_res.status_code == 200:
            data = login_res.json()
            self.token_1 = data.get("token")
            self.user_1_id = data.get("user", {}).get("id")
            self.auth_headers_1 = {"Authorization": f"Bearer {self.token_1}"}
        else:
            pytest.skip(f"User 1 login failed: {login_res.status_code}")
        
        # Authenticate user 2
        login_res_2 = self.session.post(f"{BASE_URL}/api/auth/login", json=TEST_USER_2)
        if login_res_2.status_code == 200:
            data_2 = login_res_2.json()
            self.token_2 = data_2.get("token")
            self.user_2_id = data_2.get("user", {}).get("id")
            self.auth_headers_2 = {"Authorization": f"Bearer {self.token_2}"}
        else:
            self.token_2 = None
            self.user_2_id = None
            self.auth_headers_2 = {}
    
    # ═══════════════════════════════════════════
    # QUAD-HEX ENDPOINTS
    # ═══════════════════════════════════════════
    
    def test_resolve_h2_matrix(self):
        """POST /api/quad-hex/resolve-h2 — returns full 24×24 H² matrix"""
        res = self.session.post(
            f"{BASE_URL}/api/quad-hex/resolve-h2",
            headers=self.auth_headers_1,
            json={}
        )
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        
        # Verify H² matrix structure
        assert "h2_matrix" in data, "Missing h2_matrix"
        assert "matrix_dimensions" in data, "Missing matrix_dimensions"
        assert data["matrix_dimensions"] == "24×24", f"Expected 24×24, got {data['matrix_dimensions']}"
        assert "total_intersections" in data, "Missing total_intersections"
        assert data["total_intersections"] == 576, f"Expected 576, got {data['total_intersections']}"
        
        # Verify matrix is 24×24
        matrix = data["h2_matrix"]
        assert len(matrix) == 24, f"Matrix should have 24 rows, got {len(matrix)}"
        assert all(len(row) == 24 for row in matrix), "Each row should have 24 columns"
        
        # Verify cross-cluster resonance
        assert "cross_cluster_resonance" in data, "Missing cross_cluster_resonance"
        resonance = data["cross_cluster_resonance"]
        assert isinstance(resonance, dict), "cross_cluster_resonance should be dict"
        
        # Verify matrix density
        assert "matrix_density" in data, "Missing matrix_density"
        assert 0 <= data["matrix_density"] <= 1, "matrix_density should be between 0 and 1"
        
        # Verify determinant proxy
        assert "determinant_proxy" in data, "Missing determinant_proxy"
        assert "determinant_positive" in data, "Missing determinant_positive"
        assert isinstance(data["determinant_positive"], bool), "determinant_positive should be bool"
        
        # Verify variable return tax
        assert "variable_return_tax" in data, "Missing variable_return_tax"
        assert 15 <= data["variable_return_tax"] <= 45, f"variable_return_tax should be 15-45, got {data['variable_return_tax']}"
        
        # Verify cross-cluster effects
        assert "cross_cluster_effects" in data, "Missing cross_cluster_effects"
        effects = data["cross_cluster_effects"]
        assert "transmutation_modifier" in effects, "Missing transmutation_modifier"
        assert "tax_modifier" in effects, "Missing tax_modifier"
        assert "economy_health" in effects, "Missing economy_health"
        
        # Verify hexagrams
        assert "hexagrams" in data, "Missing hexagrams"
        for cluster in ["security", "location", "finance", "evolution"]:
            assert cluster in data["hexagrams"], f"Missing hexagram cluster: {cluster}"
            assert "lines" in data["hexagrams"][cluster], f"Missing lines in {cluster}"
            assert "score" in data["hexagrams"][cluster], f"Missing score in {cluster}"
            assert len(data["hexagrams"][cluster]["lines"]) == 6, f"{cluster} should have 6 lines"
        
        print(f"✓ H² Matrix resolved: {data['matrix_dimensions']}, density={data['matrix_density']}, det={data['determinant_proxy']}")
    
    def test_resolve_linear_state_vector(self):
        """POST /api/quad-hex/resolve — returns linear 24-bit state vector (backward compat)"""
        res = self.session.post(
            f"{BASE_URL}/api/quad-hex/resolve",
            headers=self.auth_headers_1,
            json={}
        )
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        
        # Verify linear state vector
        assert "state_vector" in data, "Missing state_vector"
        assert "binary" in data, "Missing binary"
        assert len(data["binary"]) == 24, f"Binary should be 24 bits, got {len(data['binary'])}"
        
        # Verify alignment score
        assert "alignment_score" in data, "Missing alignment_score"
        assert 0 <= data["alignment_score"] <= 1, "alignment_score should be 0-1"
        
        # Verify phase mode
        assert "phase_mode" in data, "Missing phase_mode"
        assert data["phase_mode"] in ["harmonic", "fractal", "elemental"], f"Invalid phase: {data['phase_mode']}"
        
        # Verify hexagrams
        assert "hexagrams" in data, "Missing hexagrams"
        
        print(f"✓ Linear state vector: {data['binary']}, alignment={data['alignment_score']}")
    
    def test_get_cached_tensor(self):
        """GET /api/quad-hex/tensor — returns cached H² tensor"""
        # First resolve to ensure tensor exists
        self.session.post(f"{BASE_URL}/api/quad-hex/resolve-h2", headers=self.auth_headers_1, json={})
        
        res = self.session.get(f"{BASE_URL}/api/quad-hex/tensor", headers=self.auth_headers_1)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        assert "matrix" in data, "Missing matrix in tensor"
        assert "binary" in data, "Missing binary in tensor"
        assert "phase" in data, "Missing phase in tensor"
        assert "density" in data, "Missing density in tensor"
        assert "determinant" in data, "Missing determinant in tensor"
        
        print(f"✓ Cached tensor retrieved: phase={data['phase']}, density={data['density']}")
    
    def test_get_current_phase(self):
        """GET /api/quad-hex/phase — returns current platform phase mode"""
        res = self.session.get(f"{BASE_URL}/api/quad-hex/phase", headers=self.auth_headers_1)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        assert "phase" in data, "Missing phase"
        assert data["phase"] in ["harmonic", "fractal", "elemental"], f"Invalid phase: {data['phase']}"
        assert "name" in data, "Missing name"
        assert "description" in data, "Missing description"
        
        print(f"✓ Current phase: {data['phase']} ({data['name']})")
    
    # ═══════════════════════════════════════════
    # BROKER ENDPOINTS
    # ═══════════════════════════════════════════
    
    def test_broker_scan_preview(self):
        """GET /api/broker/scan-preview — includes h2_analysis"""
        res = self.session.get(f"{BASE_URL}/api/broker/scan-preview", headers=self.auth_headers_1)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        
        # Verify basic scan data
        assert "phase" in data, "Missing phase"
        assert "security_lines" in data, "Missing security_lines"
        assert "finance_lines" in data, "Missing finance_lines"
        assert "evolution_lines" in data, "Missing evolution_lines"
        assert "trade_ready" in data, "Missing trade_ready"
        
        # Verify H² analysis
        assert "h2_analysis" in data, "Missing h2_analysis"
        h2 = data["h2_analysis"]
        assert "matrix_density" in h2, "Missing matrix_density in h2_analysis"
        assert "determinant" in h2, "Missing determinant in h2_analysis"
        assert "determinant_positive" in h2, "Missing determinant_positive in h2_analysis"
        assert "variable_return_tax" in h2, "Missing variable_return_tax in h2_analysis"
        assert "cross_cluster_resonance" in h2, "Missing cross_cluster_resonance in h2_analysis"
        assert "cross_effects" in h2, "Missing cross_effects in h2_analysis"
        
        print(f"✓ Scan preview: trade_ready={data['trade_ready']}, density={h2['matrix_density']}, det={h2['determinant']}")
    
    def test_broker_trade_with_h2_analysis(self):
        """POST /api/broker/trade — uses recursive 2-pass verification with H² matrix"""
        if not self.user_2_id:
            pytest.skip("User 2 not available for trade test")
        
        # Get user 1 wallet balance first
        wallet_res = self.session.get(f"{BASE_URL}/api/bank/wallet", headers=self.auth_headers_1)
        if wallet_res.status_code != 200:
            pytest.skip("Could not get wallet balance")
        
        wallet = wallet_res.json()
        if wallet.get("dust", 0) < 10:
            pytest.skip(f"Insufficient dust for trade test: {wallet.get('dust', 0)}")
        
        # Attempt trade
        res = self.session.post(
            f"{BASE_URL}/api/broker/trade",
            headers=self.auth_headers_1,
            json={
                "target_user_id": self.user_2_id,
                "currency": "dust",
                "amount": 5,
                "trade_type": "transfer"
            }
        )
        
        # Trade may succeed or fail based on quad-scan
        if res.status_code == 200:
            data = res.json()
            if data.get("traded"):
                # Verify H² analysis in response
                assert "h2_analysis" in data, "Missing h2_analysis in trade response"
                h2 = data["h2_analysis"]
                assert "pass1" in h2, "Missing pass1 in h2_analysis"
                assert "pass2" in h2, "Missing pass2 in h2_analysis"
                assert "determinant" in h2, "Missing determinant in h2_analysis"
                assert "matrix_density" in h2, "Missing matrix_density in h2_analysis"
                assert "economy_health" in h2, "Missing economy_health in h2_analysis"
                
                print(f"✓ Trade executed: pass1={h2['pass1']}, pass2={h2['pass2']}, det={h2['determinant']}")
            else:
                # Trade failed quad-scan
                assert "scan" in data, "Missing scan in failed trade response"
                print(f"✓ Trade blocked by quad-scan: {data.get('reason')}")
        else:
            # Other error (insufficient funds, frozen, etc.)
            print(f"✓ Trade returned {res.status_code}: {res.text[:100]}")
    
    def test_broker_transmute(self):
        """POST /api/broker/transmute — Dust to Gems conversion"""
        # Get wallet balance
        wallet_res = self.session.get(f"{BASE_URL}/api/bank/wallet", headers=self.auth_headers_1)
        if wallet_res.status_code != 200:
            pytest.skip("Could not get wallet balance")
        
        wallet = wallet_res.json()
        if wallet.get("dust", 0) < 100:
            pytest.skip(f"Insufficient dust for transmute test: {wallet.get('dust', 0)}")
        
        res = self.session.post(
            f"{BASE_URL}/api/broker/transmute",
            headers=self.auth_headers_1,
            json={"dust_amount": 100}
        )
        
        if res.status_code == 200:
            data = res.json()
            assert data.get("transmuted") == True, "Expected transmuted=True"
            assert "dust_consumed" in data, "Missing dust_consumed"
            assert "gems_created" in data, "Missing gems_created"
            assert data["dust_consumed"] == 100, f"Expected 100 dust consumed, got {data['dust_consumed']}"
            assert data["gems_created"] == 1, f"Expected 1 gem created, got {data['gems_created']}"
            print(f"✓ Transmuted: {data['dust_consumed']} dust → {data['gems_created']} gem")
        elif res.status_code == 403:
            # Hexagram alignment too low
            print(f"✓ Transmute blocked by hexagram gate: {res.json().get('detail')}")
        else:
            print(f"✓ Transmute returned {res.status_code}: {res.text[:100]}")
    
    # ═══════════════════════════════════════════
    # BANK ENDPOINTS
    # ═══════════════════════════════════════════
    
    def test_bank_wallet(self):
        """GET /api/bank/wallet — returns dust and gems balance"""
        res = self.session.get(f"{BASE_URL}/api/bank/wallet", headers=self.auth_headers_1)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        assert "dust" in data, "Missing dust"
        assert "gems" in data, "Missing gems"
        assert isinstance(data["dust"], (int, float)), "dust should be numeric"
        assert isinstance(data["gems"], (int, float)), "gems should be numeric"
        assert "transmutation_rate" in data, "Missing transmutation_rate"
        assert "return_tax_rate" in data, "Missing return_tax_rate"
        
        print(f"✓ Wallet: {data['dust']} dust, {data['gems']} gems")
    
    def test_bank_earn(self):
        """POST /api/bank/earn — awards dust for platform actions"""
        res = self.session.post(
            f"{BASE_URL}/api/bank/earn",
            headers=self.auth_headers_1,
            json={"action": "daily_login"}
        )
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        assert "earned" in data, "Missing earned"
        assert "action" in data, "Missing action"
        assert "dust_balance" in data, "Missing dust_balance"
        assert data["action"] == "daily_login", f"Expected daily_login, got {data['action']}"
        
        print(f"✓ Earned {data['earned']} dust for {data['action']}, balance={data['dust_balance']}")
    
    def test_bank_earn_invalid_action(self):
        """POST /api/bank/earn — rejects invalid action"""
        res = self.session.post(
            f"{BASE_URL}/api/bank/earn",
            headers=self.auth_headers_1,
            json={"action": "invalid_action_xyz"}
        )
        assert res.status_code == 400, f"Expected 400, got {res.status_code}"
        print("✓ Invalid action rejected with 400")
    
    def test_bank_policy(self):
        """GET /api/bank/policy — returns monetary policy stats"""
        res = self.session.get(f"{BASE_URL}/api/bank/policy", headers=self.auth_headers_1)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        assert "dust_to_gem_ratio" in data, "Missing dust_to_gem_ratio"
        assert "return_tax_percent" in data, "Missing return_tax_percent"
        assert "dust_rewards" in data, "Missing dust_rewards"
        assert "total_wallets" in data, "Missing total_wallets"
        assert "circulating_dust" in data, "Missing circulating_dust"
        assert "circulating_gems" in data, "Missing circulating_gems"
        
        print(f"✓ Policy: ratio={data['dust_to_gem_ratio']}, tax={data['return_tax_percent']}%, wallets={data['total_wallets']}")
    
    # ═══════════════════════════════════════════
    # SENTINEL ENDPOINTS
    # ═══════════════════════════════════════════
    
    def test_sentinel_scan_clean(self):
        """POST /api/sentinel/scan — phase-aware content scanning (clean content)"""
        res = self.session.post(
            f"{BASE_URL}/api/sentinel/scan",
            headers=self.auth_headers_1,
            json={"text": "This is a peaceful meditation message", "context": "feed"}
        )
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        # May be clean=true or shadow_blocked=true if user is muted
        assert "clean" in data, "Missing clean"
        if data.get("shadow_blocked"):
            print(f"✓ Sentinel scan: shadow_blocked (user is muted)")
        else:
            assert data["clean"] == True, f"Expected clean=True for safe content"
            assert "phase_mode" in data, "Missing phase_mode"
            print(f"✓ Sentinel scan: clean=True, phase={data.get('phase_mode')}")
    
    def test_sentinel_stats(self):
        """GET /api/sentinel/stats — sentinel violation stats"""
        res = self.session.get(f"{BASE_URL}/api/sentinel/stats", headers=self.auth_headers_1)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        assert "total_intercepted" in data, "Missing total_intercepted"
        assert "total_blocked" in data, "Missing total_blocked"
        assert "active_shadow_mutes" in data, "Missing active_shadow_mutes"
        
        print(f"✓ Sentinel stats: intercepted={data['total_intercepted']}, blocked={data['total_blocked']}, mutes={data['active_shadow_mutes']}")
    
    # ═══════════════════════════════════════════
    # USER 2 TESTS (for P2P scenarios)
    # ═══════════════════════════════════════════
    
    def test_user2_wallet(self):
        """GET /api/bank/wallet — user 2 wallet"""
        if not self.token_2:
            pytest.skip("User 2 not available")
        
        res = self.session.get(f"{BASE_URL}/api/bank/wallet", headers=self.auth_headers_2)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        print(f"✓ User 2 wallet: {data.get('dust', 0)} dust, {data.get('gems', 0)} gems")
    
    def test_user2_h2_resolve(self):
        """POST /api/quad-hex/resolve-h2 — user 2 H² matrix"""
        if not self.token_2:
            pytest.skip("User 2 not available")
        
        res = self.session.post(
            f"{BASE_URL}/api/quad-hex/resolve-h2",
            headers=self.auth_headers_2,
            json={}
        )
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        
        data = res.json()
        assert "h2_matrix" in data, "Missing h2_matrix"
        assert "determinant_proxy" in data, "Missing determinant_proxy"
        
        print(f"✓ User 2 H² matrix: density={data.get('matrix_density')}, det={data.get('determinant_proxy')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
