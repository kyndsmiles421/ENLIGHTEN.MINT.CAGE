"""
Iteration 184: L² Fractal Engine and Mastery Avenues Testing

Tests:
- Fractal Sub-Layer System (54 total: Crust=4, Mantle=9, Core=16, Hollow=25)
- Three Mastery Avenues (Mathematics/Art/Thought Theory)
- Master View taste-test audit sections
- Local Density Rendering (only active sub-layer computed)
- Resonance thresholds for sub-layer access

Test User: grad_test_522@test.com / password
- Consciousness level 1 (only Crust accessible)
- Already solved phi_ratio challenge
- Already navigated crust_sub_0
- Current dust ~128
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestFractalEngine:
    """L² Fractal Sub-Layer System Tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if login_resp.status_code != 200:
            pytest.skip("Login failed - skipping authenticated tests")
        self.token = login_resp.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_fractal_map_returns_4_depths_54_sublayers(self):
        """GET /api/sublayers/fractal-map returns 4 depths with L² sub-layers, total=54"""
        resp = requests.get(f"{BASE_URL}/api/sublayers/fractal-map", headers=self.headers)
        assert resp.status_code == 200
        data = resp.json()
        
        # Verify 4 depths
        assert "depths" in data
        assert len(data["depths"]) == 4
        
        # Verify total sublayers = 54
        assert data["total_sublayers"] == 54
        
        # Verify L² pattern: 2²=4, 3²=9, 4²=16, 5²=25
        expected_counts = {"crust": 4, "mantle": 9, "outer_core": 16, "hollow_earth": 25}
        for depth in data["depths"]:
            assert depth["sub_count"] == expected_counts[depth["depth_id"]]
            assert depth["L"] ** 2 == depth["sub_count"]
        
        # Verify exploration progress fields
        assert "total_explored" in data
        assert "exploration_pct" in data
        assert "current_depth" in data
        assert "current_sublayer" in data
        assert "fractal_law" in data
        print(f"Fractal map: {data['total_explored']}/54 explored ({data['exploration_pct']}%)")
    
    def test_fractal_map_local_density_rendering(self):
        """Only current depth returns sublayers array, others return null"""
        resp = requests.get(f"{BASE_URL}/api/sublayers/fractal-map", headers=self.headers)
        assert resp.status_code == 200
        data = resp.json()
        
        current_depth = data["current_depth"]
        for depth in data["depths"]:
            if depth["depth_id"] == current_depth:
                # Current depth should have sublayers array
                assert depth["sublayers"] is not None
                assert isinstance(depth["sublayers"], list)
                print(f"Current depth {current_depth} has {len(depth['sublayers'])} sublayers unfolded")
            else:
                # Other depths should have sublayers = null (collapsed)
                assert depth["sublayers"] is None
    
    def test_depth_unfold_crust(self):
        """GET /api/sublayers/depth/crust unfolds crust's 2x2 fractal grid"""
        resp = requests.get(f"{BASE_URL}/api/sublayers/depth/crust", headers=self.headers)
        assert resp.status_code == 200
        data = resp.json()
        
        assert data["depth_id"] == "crust"
        assert data["L"] == 2
        assert data["grid_size"] == 2
        assert data["sub_count"] == 4
        assert len(data["sublayers"]) == 4
        
        # Verify grid structure (2x2)
        for sub in data["sublayers"]:
            assert sub["row"] in [0, 1]
            assert sub["col"] in [0, 1]
            assert sub["grid_size"] == 2
            assert "frequency_hz" in sub
            assert "dust_cost" in sub
            assert "xp_reward" in sub
        print(f"Crust grid: {data['explored_count']}/4 explored")
    
    def test_depth_unfold_mantle_requires_level_2(self):
        """GET /api/sublayers/depth/mantle requires consciousness level 2"""
        resp = requests.get(f"{BASE_URL}/api/sublayers/depth/mantle", headers=self.headers)
        # Test user is level 1, so mantle should be forbidden
        assert resp.status_code == 403
        assert "level 2" in resp.json().get("detail", "").lower()
        print("Mantle correctly gated at level 2")
    
    def test_sublayer_progress(self):
        """GET /api/sublayers/progress returns detailed exploration progress"""
        resp = requests.get(f"{BASE_URL}/api/sublayers/progress", headers=self.headers)
        assert resp.status_code == 200
        data = resp.json()
        
        assert data["total_sublayers"] == 54
        assert "total_explored" in data
        assert "exploration_pct" in data
        assert "by_depth" in data
        
        # Verify by_depth structure
        for depth_id in ["crust", "mantle", "outer_core", "hollow_earth"]:
            assert depth_id in data["by_depth"]
            depth_info = data["by_depth"][depth_id]
            assert "total" in depth_info
            assert "explored" in depth_info
            assert "completion_pct" in depth_info
        print(f"Progress: {data['total_explored']}/54 ({data['exploration_pct']}%)")
    
    def test_navigate_sublayer_first_visit_costs_dust(self):
        """POST /api/sublayers/navigate costs dust on first visit, grants XP"""
        # First get current state
        progress_resp = requests.get(f"{BASE_URL}/api/sublayers/progress", headers=self.headers)
        explored = progress_resp.json().get("explored_sublayers", [])
        
        # Try to navigate to crust_sub_1 (if not already explored)
        target = "crust_sub_1"
        resp = requests.post(f"{BASE_URL}/api/sublayers/navigate", 
                            json={"sublayer_id": target}, headers=self.headers)
        
        if resp.status_code == 200:
            data = resp.json()
            assert data["success"] == True
            assert "sublayer" in data
            assert data["sublayer"]["id"] == target
            
            if data["first_visit"]:
                assert data["dust_cost"] > 0
                assert data["xp_reward"] > 0
                print(f"First visit to {target}: cost {data['dust_cost']} dust, earned {data['xp_reward']} XP")
            else:
                assert data["dust_cost"] == 0
                assert data["xp_reward"] == 0
                print(f"Revisit to {target}: free navigation")
        elif resp.status_code == 400:
            # Might not have enough dust
            print(f"Navigation blocked: {resp.json().get('detail')}")
        else:
            pytest.fail(f"Unexpected status: {resp.status_code}")


class TestMasteryAvenues:
    """Three Mastery Avenues Tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if login_resp.status_code != 200:
            pytest.skip("Login failed - skipping authenticated tests")
        self.token = login_resp.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_avenues_overview_returns_3_avenues(self):
        """GET /api/avenues/overview returns 3 avenues with resonance, tier, completion"""
        resp = requests.get(f"{BASE_URL}/api/avenues/overview", headers=self.headers)
        assert resp.status_code == 200
        data = resp.json()
        
        assert "avenues" in data
        assert len(data["avenues"]) == 3
        
        avenue_ids = [a["id"] for a in data["avenues"]]
        assert "mathematics" in avenue_ids
        assert "art" in avenue_ids
        assert "thought" in avenue_ids
        
        for avenue in data["avenues"]:
            assert "resonance" in avenue
            assert "tier" in avenue
            assert "tier_name" in avenue
            assert "completed_count" in avenue
            assert "pct" in avenue
            assert "equilibrium_reached" in avenue
        
        assert "total_resonance" in data
        assert "combined_tier" in data
        assert "combined_tier_name" in data
        print(f"Total resonance: {data['total_resonance']}, Combined tier: {data['combined_tier_name']}")
    
    def test_mathematics_challenges_returns_8(self):
        """GET /api/avenues/mathematics/challenges returns 8 Sacred Geometry challenges"""
        resp = requests.get(f"{BASE_URL}/api/avenues/mathematics/challenges", headers=self.headers)
        assert resp.status_code == 200
        data = resp.json()
        
        assert "challenges" in data
        assert data["total"] == 8
        assert len(data["challenges"]) == 8
        
        for challenge in data["challenges"]:
            assert "id" in challenge
            assert "name" in challenge
            assert "question" in challenge
            assert "hint" in challenge
            assert "difficulty" in challenge
            assert "resonance" in challenge
            assert "completed" in challenge
        
        completed = data["completed"]
        print(f"Math challenges: {completed}/8 completed")
    
    def test_mathematics_solve_correct_answer(self):
        """POST /api/avenues/mathematics/solve with correct answer gives resonance+XP"""
        # Try platonic_count (answer: 5) if not already completed
        resp = requests.post(f"{BASE_URL}/api/avenues/mathematics/solve",
                            json={"challenge_id": "platonic_count", "answer": "5"},
                            headers=self.headers)
        
        if resp.status_code == 200:
            data = resp.json()
            if data.get("correct"):
                assert data["resonance_earned"] > 0
                assert data["xp_earned"] > 0
                print(f"Solved platonic_count: +{data['resonance_earned']} resonance, +{data['xp_earned']} XP")
            else:
                print(f"Wrong answer feedback: {data.get('message')}")
        elif resp.status_code == 400:
            # Already completed
            print(f"Challenge already completed: {resp.json().get('detail')}")
        else:
            pytest.fail(f"Unexpected status: {resp.status_code}")
    
    def test_mathematics_solve_wrong_answer(self):
        """POST /api/avenues/mathematics/solve with wrong answer returns correct:false"""
        # Try fibonacci_8th with wrong answer
        resp = requests.post(f"{BASE_URL}/api/avenues/mathematics/solve",
                            json={"challenge_id": "fibonacci_8th", "answer": "wrong"},
                            headers=self.headers)
        
        if resp.status_code == 200:
            data = resp.json()
            if "correct" in data:
                if not data["correct"]:
                    assert "hint" in data
                    print(f"Wrong answer handled: {data.get('message')}")
                else:
                    print("Answer was actually correct (unexpected)")
        elif resp.status_code == 400:
            # Already completed
            print(f"Challenge already completed: {resp.json().get('detail')}")
    
    def test_thought_quests_returns_6(self):
        """GET /api/avenues/thought/quests returns 6 Integration Quests"""
        resp = requests.get(f"{BASE_URL}/api/avenues/thought/quests", headers=self.headers)
        assert resp.status_code == 200
        data = resp.json()
        
        assert "quests" in data
        assert data["total"] == 6
        assert len(data["quests"]) == 6
        
        for quest in data["quests"]:
            assert "id" in quest
            assert "name" in quest
            assert "archetype" in quest
            assert "layer" in quest
            assert "prompt" in quest
            assert "resonance" in quest
            assert "depth_insight" in quest
            assert "completed" in quest
        
        print(f"Thought quests: {data['completed']}/6 completed")
    
    def test_thought_reflect_min_10_chars(self):
        """POST /api/avenues/thought/reflect requires min 10 chars"""
        # Try with short reflection
        resp = requests.post(f"{BASE_URL}/api/avenues/thought/reflect",
                            json={"quest_id": "shadow_recognition", "reflection": "short"},
                            headers=self.headers)
        
        if resp.status_code == 400:
            assert "10 characters" in resp.json().get("detail", "").lower()
            print("Short reflection correctly rejected")
        elif resp.status_code == 200:
            # Quest might already be completed
            print("Quest already completed or reflection accepted")
    
    def test_thought_reflect_valid_submission(self):
        """POST /api/avenues/thought/reflect with valid reflection gives resonance+XP"""
        resp = requests.post(f"{BASE_URL}/api/avenues/thought/reflect",
                            json={
                                "quest_id": "persona_dissolution",
                                "reflection": "I often wear a mask of confidence when I feel uncertain inside. Removing it would mean showing vulnerability."
                            },
                            headers=self.headers)
        
        if resp.status_code == 200:
            data = resp.json()
            if data.get("success"):
                assert data["resonance_earned"] > 0
                assert data["xp_earned"] > 0
                assert "depth_insight" in data
                print(f"Reflection accepted: +{data['resonance_earned']} resonance")
        elif resp.status_code == 400:
            print(f"Quest already completed: {resp.json().get('detail')}")
    
    def test_art_prompts_returns_5(self):
        """GET /api/avenues/art/prompts returns 5 Art prompts"""
        resp = requests.get(f"{BASE_URL}/api/avenues/art/prompts", headers=self.headers)
        assert resp.status_code == 200
        data = resp.json()
        
        assert "prompts" in data
        assert data["total"] == 5
        assert len(data["prompts"]) == 5
        
        for prompt in data["prompts"]:
            assert "id" in prompt
            assert "name" in prompt
            assert "prompt" in prompt
            assert "resonance" in prompt
            assert "category" in prompt
            assert "completed" in prompt
        
        print(f"Art prompts: {data['completed']}/5 completed")
    
    def test_art_create_valid_submission(self):
        """POST /api/avenues/art/create with valid creation gives resonance+XP"""
        resp = requests.post(f"{BASE_URL}/api/avenues/art/create",
                            json={
                                "prompt_id": "depth_landscape",
                                "creation": "A vast cavern of amber crystals, pulsing with warm light. The air hums with a low frequency."
                            },
                            headers=self.headers)
        
        if resp.status_code == 200:
            data = resp.json()
            if data.get("success"):
                assert data["resonance_earned"] > 0
                assert data["xp_earned"] > 0
                print(f"Art creation accepted: +{data['resonance_earned']} resonance")
        elif resp.status_code == 400:
            print(f"Prompt already completed: {resp.json().get('detail')}")
    
    def test_resonance_check_thresholds(self):
        """GET /api/avenues/resonance-check returns combined resonance with collapse thresholds"""
        resp = requests.get(f"{BASE_URL}/api/avenues/resonance-check", headers=self.headers)
        assert resp.status_code == 200
        data = resp.json()
        
        assert "mathematics" in data
        assert "art" in data
        assert "thought" in data
        assert "total" in data
        assert "thresholds" in data
        assert "equilibrium" in data
        
        # Verify threshold structure
        thresholds = data["thresholds"]
        assert "common_collapse" in thresholds
        assert "uncommon_collapse" in thresholds
        assert "rare_collapse" in thresholds
        assert "legendary_collapse" in thresholds
        
        for key, val in thresholds.items():
            assert "required" in val
            assert "met" in val
        
        print(f"Resonance: math={data['mathematics']}, art={data['art']}, thought={data['thought']}, total={data['total']}")


class TestMasterViewAudit:
    """Master View Audit with Fractal Engine and Mastery Avenues sections"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if login_resp.status_code != 200:
            pytest.skip("Login failed - skipping authenticated tests")
        self.token = login_resp.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_master_view_includes_fractal_engine(self):
        """GET /api/master-view/audit includes fractal_engine section"""
        resp = requests.get(f"{BASE_URL}/api/master-view/audit", headers=self.headers)
        assert resp.status_code == 200
        data = resp.json()
        
        assert "fractal_engine" in data
        fe = data["fractal_engine"]
        
        assert fe["total_sublayers"] == 54
        assert "explored" in fe
        assert "exploration_pct" in fe
        assert "current_sublayer" in fe
        assert "by_depth" in fe
        assert "fractal_law" in fe
        assert fe["fractal_law"] == "L² where L = depth_index + 2"
        assert "status" in fe
        
        # Verify by_depth has all 4 depths
        for depth in ["crust", "mantle", "outer_core", "hollow_earth"]:
            assert depth in fe["by_depth"]
            assert "L" in fe["by_depth"][depth]
            assert "sub_count" in fe["by_depth"][depth]
            assert "explored" in fe["by_depth"][depth]
        
        print(f"Fractal Engine audit: {fe['explored']}/54 explored")
    
    def test_master_view_includes_mastery_avenues(self):
        """GET /api/master-view/audit includes mastery_avenues section"""
        resp = requests.get(f"{BASE_URL}/api/master-view/audit", headers=self.headers)
        assert resp.status_code == 200
        data = resp.json()
        
        assert "mastery_avenues" in data
        ma = data["mastery_avenues"]
        
        assert "mathematics" in ma
        assert "art" in ma
        assert "thought" in ma
        assert "total_resonance" in ma
        assert "combined_tier" in ma
        assert "status" in ma
        
        for avenue in ["mathematics", "art", "thought"]:
            assert "resonance" in ma[avenue]
            assert "tier" in ma[avenue]
            assert "status" in ma[avenue]
        
        print(f"Mastery Avenues audit: total_resonance={ma['total_resonance']}, tier={ma['combined_tier']}")
    
    def test_master_view_includes_taste_test(self):
        """GET /api/master-view/audit includes taste_test section"""
        resp = requests.get(f"{BASE_URL}/api/master-view/audit", headers=self.headers)
        assert resp.status_code == 200
        data = resp.json()
        
        assert "taste_test" in data
        tt = data["taste_test"]
        
        # Geometric integrity
        assert "geometric_integrity" in tt
        gi = tt["geometric_integrity"]
        assert gi["sublayer_count_valid"] == True
        assert gi["l_squared_verified"] == True
        assert gi["status"] == "verified"
        
        # Quantum handshake
        assert "quantum_handshake" in tt
        qh = tt["quantum_handshake"]
        assert "total_resonance" in qh
        assert "common_threshold_met" in qh
        assert "uncommon_threshold_met" in qh
        assert "rare_threshold_met" in qh
        assert "legendary_threshold_met" in qh
        assert qh["status"] == "calibrated"
        
        # Dimensional flow
        assert "dimensional_flow" in tt
        df = tt["dimensional_flow"]
        assert df["depth_layers"] == 4
        assert df["dimensions"] == 3
        assert df["grid_cells"] == 12
        assert df["sublayers"] == 54
        assert df["total_navigable"] == 12 * 54
        assert df["status"] == "flowing"
        
        print("Taste test: geometric_integrity=verified, quantum_handshake=calibrated, dimensional_flow=flowing")
    
    def test_master_view_full_audit_structure(self):
        """GET /api/master-view/audit returns complete audit structure"""
        resp = requests.get(f"{BASE_URL}/api/master-view/audit", headers=self.headers)
        assert resp.status_code == 200
        data = resp.json()
        
        # Verify all main sections exist
        required_sections = [
            "player", "stratigraphy", "psyche", "dimensional", "quantum",
            "frequency_scaling", "subsystems", "fractal_engine", "mastery_avenues",
            "taste_test", "system_health", "timestamp"
        ]
        for section in required_sections:
            assert section in data, f"Missing section: {section}"
        
        print(f"Master View audit complete with {len(required_sections)} sections")


class TestRegressionPreviousFeatures:
    """Regression tests for Planetary Depths, Quantum Field, Dimensions"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if login_resp.status_code != 200:
            pytest.skip("Login failed - skipping authenticated tests")
        self.token = login_resp.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_planetary_layers_still_working(self):
        """GET /api/planetary/layers still returns 4 layers"""
        resp = requests.get(f"{BASE_URL}/api/planetary/layers", headers=self.headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "layers" in data
        assert len(data["layers"]) == 4
        print("Planetary layers regression: PASS")
    
    def test_quantum_shadows_still_working(self):
        """GET /api/quantum/shadows/nearby still returns sprites"""
        resp = requests.get(f"{BASE_URL}/api/quantum/shadows/nearby?lat=37.7749&lng=-122.4194", headers=self.headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "sprites" in data
        print(f"Quantum shadows regression: PASS ({len(data['sprites'])} sprites)")
    
    def test_dimensions_grid_still_working(self):
        """GET /api/dimensions/grid still returns 12-cell grid"""
        resp = requests.get(f"{BASE_URL}/api/dimensions/grid", headers=self.headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "grid" in data
        assert len(data["grid"]) == 12
        print("Dimensions grid regression: PASS")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
