"""
Iteration 185 Tests: Biometrics Avenue, Expanded Math Challenges, Fractal Completion Bonus

Tests:
- GET /api/avenues/overview — now returns 4 avenues including biometrics
- GET /api/avenues/biometrics/activities — returns 8 activity types
- POST /api/avenues/biometrics/log — log physical activity, generates kinetic dust
- POST /api/avenues/biometrics/log with heart_rate in target range gives 1.5x dust bonus
- GET /api/avenues/biometrics/stats — returns biometric stats
- GET /api/avenues/mathematics/challenges — now returns 19 challenges (was 8)
- POST /api/avenues/mathematics/solve — test solving algebra/calculus challenges
- GET /api/avenues/resonance-check — now includes biometrics in total resonance
- GET /api/master-view/audit — mastery_avenues now includes biometrics with kinetic_dust
- POST /api/sublayers/navigate — Fractal Completion Bonus triggers when all sub-layers explored
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


class TestBiometricsAvenue:
    """Tests for the new Biometrics Avenue (The Sentinel)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        self.token = login_resp.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_avenues_overview_returns_4_avenues(self):
        """GET /api/avenues/overview should return 4 avenues including biometrics"""
        resp = requests.get(f"{BASE_URL}/api/avenues/overview", headers=self.headers)
        assert resp.status_code == 200, f"Failed: {resp.text}"
        data = resp.json()
        
        assert "avenues" in data
        assert len(data["avenues"]) == 4, f"Expected 4 avenues, got {len(data['avenues'])}"
        
        avenue_ids = [a["id"] for a in data["avenues"]]
        assert "mathematics" in avenue_ids
        assert "art" in avenue_ids
        assert "thought" in avenue_ids
        assert "biometrics" in avenue_ids
        
        # Check biometrics avenue details
        bio_avenue = next(a for a in data["avenues"] if a["id"] == "biometrics")
        assert bio_avenue["name"] == "The Avenue of Biometrics"
        assert bio_avenue["title"] == "The Sentinel"
        assert bio_avenue["color"] == "#10B981"
        assert bio_avenue["max_resonance"] == 1000
        print(f"✓ Avenues overview returns 4 avenues including biometrics")
    
    def test_biometrics_activities_returns_8_types(self):
        """GET /api/avenues/biometrics/activities should return 8 activity types"""
        resp = requests.get(f"{BASE_URL}/api/avenues/biometrics/activities", headers=self.headers)
        assert resp.status_code == 200, f"Failed: {resp.text}"
        data = resp.json()
        
        assert "activities" in data
        assert data["total"] == 8, f"Expected 8 activities, got {data['total']}"
        
        activity_ids = [a["id"] for a in data["activities"]]
        expected_activities = ["walking", "cycling", "running", "yoga", "martial_arts", "dance", "gym", "meditation"]
        for act in expected_activities:
            assert act in activity_ids, f"Missing activity: {act}"
        
        # Check activity structure
        walking = next(a for a in data["activities"] if a["id"] == "walking")
        assert walking["category"] == "low_intensity"
        assert walking["unit"] == "steps"
        assert "kinetic_dust_per_unit" in walking
        assert "resonance_per_session" in walking
        assert "target_bpm" in walking
        print(f"✓ Biometrics activities returns 8 types: {activity_ids}")
    
    def test_log_biometric_activity_generates_kinetic_dust(self):
        """POST /api/avenues/biometrics/log should generate kinetic dust and resonance"""
        resp = requests.post(f"{BASE_URL}/api/avenues/biometrics/log", 
            json={
                "activity_id": "cycling",
                "value": 5.0,  # 5 km
                "duration_minutes": 30
            },
            headers=self.headers
        )
        assert resp.status_code == 200, f"Failed: {resp.text}"
        data = resp.json()
        
        assert data["success"] == True
        assert data["activity"] == "Cycling"
        assert data["value"] == 5.0
        assert data["unit"] == "km"
        assert data["kinetic_dust_earned"] > 0
        assert data["cosmic_dust_added"] == data["kinetic_dust_earned"]  # 1:1 conversion
        assert data["resonance_earned"] > 0
        assert data["xp_earned"] > 0
        assert data["hr_bonus"] == False  # No heart rate provided
        print(f"✓ Logged cycling: {data['kinetic_dust_earned']} kinetic dust, {data['resonance_earned']} resonance")
    
    def test_log_activity_with_heart_rate_bonus(self):
        """POST /api/avenues/biometrics/log with heart_rate in target range gives 1.5x dust"""
        # Walking target BPM is 90-120
        resp = requests.post(f"{BASE_URL}/api/avenues/biometrics/log", 
            json={
                "activity_id": "walking",
                "value": 1000,  # 1000 steps
                "heart_rate": 100,  # Within 90-120 range
                "duration_minutes": 15
            },
            headers=self.headers
        )
        assert resp.status_code == 200, f"Failed: {resp.text}"
        data = resp.json()
        
        assert data["success"] == True
        assert data["hr_bonus"] == True, "Heart rate bonus should be applied"
        # Walking: 0.01 dust/step * 1000 steps = 10 dust, with 1.5x bonus = 15 dust
        expected_base = 1000 * 0.01
        expected_with_bonus = expected_base * 1.5
        assert data["kinetic_dust_earned"] == expected_with_bonus, f"Expected {expected_with_bonus}, got {data['kinetic_dust_earned']}"
        print(f"✓ Heart rate bonus applied: {data['kinetic_dust_earned']} kinetic dust (1.5x)")
    
    def test_log_activity_without_heart_rate_bonus(self):
        """POST /api/avenues/biometrics/log with heart_rate outside range gives no bonus"""
        # Walking target BPM is 90-120, using 150 (outside range)
        resp = requests.post(f"{BASE_URL}/api/avenues/biometrics/log", 
            json={
                "activity_id": "walking",
                "value": 500,  # 500 steps
                "heart_rate": 150,  # Outside 90-120 range
            },
            headers=self.headers
        )
        assert resp.status_code == 200, f"Failed: {resp.text}"
        data = resp.json()
        
        assert data["success"] == True
        assert data["hr_bonus"] == False, "Heart rate bonus should NOT be applied"
        # Walking: 0.01 dust/step * 500 steps = 5 dust (no bonus)
        expected = 500 * 0.01
        assert data["kinetic_dust_earned"] == expected, f"Expected {expected}, got {data['kinetic_dust_earned']}"
        print(f"✓ No heart rate bonus when outside range: {data['kinetic_dust_earned']} kinetic dust")
    
    def test_biometrics_stats(self):
        """GET /api/avenues/biometrics/stats should return stats and history"""
        resp = requests.get(f"{BASE_URL}/api/avenues/biometrics/stats", headers=self.headers)
        assert resp.status_code == 200, f"Failed: {resp.text}"
        data = resp.json()
        
        assert "resonance" in data
        assert "kinetic_dust_total" in data
        assert "total_sessions" in data
        assert "by_activity" in data
        assert "recent_history" in data
        assert data["total_sessions"] >= 0
        print(f"✓ Biometrics stats: {data['total_sessions']} sessions, {data['kinetic_dust_total']} total dust")


class TestExpandedMathChallenges:
    """Tests for expanded Mathematics challenges (8 -> 19)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        self.token = login_resp.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_math_challenges_returns_19(self):
        """GET /api/avenues/mathematics/challenges should return 19 challenges"""
        resp = requests.get(f"{BASE_URL}/api/avenues/mathematics/challenges", headers=self.headers)
        assert resp.status_code == 200, f"Failed: {resp.text}"
        data = resp.json()
        
        assert "challenges" in data
        assert data["total"] == 19, f"Expected 19 challenges, got {data['total']}"
        
        challenge_ids = [c["id"] for c in data["challenges"]]
        
        # Original 8 challenges
        original = ["phi_ratio", "platonic_count", "fibonacci_8th", "metatron_vertices", 
                   "vesica_piscis", "flower_petals", "pi_sequence", "euler_identity"]
        for c in original:
            assert c in challenge_ids, f"Missing original challenge: {c}"
        
        # New algebra challenges
        algebra = ["quadratic_discriminant", "imaginary_unit", "binomial_expansion"]
        for c in algebra:
            assert c in challenge_ids, f"Missing algebra challenge: {c}"
        
        # New trigonometry challenges
        trig = ["unit_circle", "pythagorean_identity"]
        for c in trig:
            assert c in challenge_ids, f"Missing trig challenge: {c}"
        
        # New calculus challenges
        calculus = ["derivative_x_squared", "integral_constant", "e_value", "limit_sinx_x"]
        for c in calculus:
            assert c in challenge_ids, f"Missing calculus challenge: {c}"
        
        # New number theory challenges
        number_theory = ["prime_infinity", "perfect_number"]
        for c in number_theory:
            assert c in challenge_ids, f"Missing number theory challenge: {c}"
        
        print(f"✓ Math challenges returns 19 challenges including algebra, trig, calculus, number theory")
    
    def test_solve_imaginary_unit_challenge(self):
        """POST /api/avenues/mathematics/solve with imaginary_unit=-1"""
        resp = requests.post(f"{BASE_URL}/api/avenues/mathematics/solve",
            json={
                "challenge_id": "imaginary_unit",
                "answer": "-1"
            },
            headers=self.headers
        )
        # May be 200 (correct) or 400 (already completed)
        if resp.status_code == 400:
            assert "already completed" in resp.json().get("detail", "").lower()
            print(f"✓ imaginary_unit challenge already completed")
        else:
            assert resp.status_code == 200, f"Failed: {resp.text}"
            data = resp.json()
            assert data["correct"] == True
            print(f"✓ Solved imaginary_unit: +{data['resonance_earned']} resonance")
    
    def test_solve_unit_circle_challenge(self):
        """POST /api/avenues/mathematics/solve with unit_circle=1"""
        resp = requests.post(f"{BASE_URL}/api/avenues/mathematics/solve",
            json={
                "challenge_id": "unit_circle",
                "answer": "1"
            },
            headers=self.headers
        )
        if resp.status_code == 400:
            assert "already completed" in resp.json().get("detail", "").lower()
            print(f"✓ unit_circle challenge already completed")
        else:
            assert resp.status_code == 200, f"Failed: {resp.text}"
            data = resp.json()
            assert data["correct"] == True
            print(f"✓ Solved unit_circle: +{data['resonance_earned']} resonance")
    
    def test_solve_derivative_challenge(self):
        """POST /api/avenues/mathematics/solve with derivative_x_squared=3x2"""
        resp = requests.post(f"{BASE_URL}/api/avenues/mathematics/solve",
            json={
                "challenge_id": "derivative_x_squared",
                "answer": "3x2"
            },
            headers=self.headers
        )
        if resp.status_code == 400:
            assert "already completed" in resp.json().get("detail", "").lower()
            print(f"✓ derivative_x_squared challenge already completed")
        else:
            assert resp.status_code == 200, f"Failed: {resp.text}"
            data = resp.json()
            assert data["correct"] == True
            print(f"✓ Solved derivative_x_squared: +{data['resonance_earned']} resonance")


class TestResonanceAndMasterView:
    """Tests for resonance-check and master-view with biometrics"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        self.token = login_resp.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_resonance_check_includes_biometrics(self):
        """GET /api/avenues/resonance-check should include biometrics in total"""
        resp = requests.get(f"{BASE_URL}/api/avenues/resonance-check", headers=self.headers)
        assert resp.status_code == 200, f"Failed: {resp.text}"
        data = resp.json()
        
        assert "mathematics" in data
        assert "art" in data
        assert "thought" in data
        assert "biometrics" in data
        assert "total" in data
        
        # Verify total includes all 4 avenues
        expected_total = data["mathematics"] + data["art"] + data["thought"] + data["biometrics"]
        assert data["total"] == expected_total, f"Total mismatch: {data['total']} != {expected_total}"
        
        # Check equilibrium includes biometrics
        assert "equilibrium" in data
        assert "biometrics" in data["equilibrium"]
        
        print(f"✓ Resonance check includes biometrics: math={data['mathematics']}, art={data['art']}, thought={data['thought']}, bio={data['biometrics']}, total={data['total']}")
    
    def test_master_view_includes_biometrics(self):
        """GET /api/master-view/audit should include biometrics in mastery_avenues"""
        resp = requests.get(f"{BASE_URL}/api/master-view/audit", headers=self.headers)
        assert resp.status_code == 200, f"Failed: {resp.text}"
        data = resp.json()
        
        assert "mastery_avenues" in data
        avenues = data["mastery_avenues"]
        
        assert "mathematics" in avenues
        assert "art" in avenues
        assert "thought" in avenues
        assert "biometrics" in avenues
        
        # Check biometrics has kinetic_dust field
        bio = avenues["biometrics"]
        assert "resonance" in bio
        assert "tier" in bio
        assert "kinetic_dust" in bio
        assert "status" in bio
        
        # Check combined tier calculation (now /800 instead of /600)
        assert "combined_tier" in avenues
        assert "total_resonance" in avenues
        
        print(f"✓ Master view includes biometrics: resonance={bio['resonance']}, kinetic_dust={bio['kinetic_dust']}, tier={bio['tier']}")


class TestFractalCompletionBonus:
    """Tests for Fractal Completion Bonus when all sub-layers in a depth are explored"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        self.token = login_resp.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_sublayer_navigate_returns_depth_mastery_fields(self):
        """POST /api/sublayers/navigate should return depth_mastery and depth_mastery_reward fields"""
        # Navigate to a sublayer (may already be explored)
        resp = requests.post(f"{BASE_URL}/api/sublayers/navigate",
            json={"sublayer_id": "crust_sub_0"},
            headers=self.headers
        )
        assert resp.status_code == 200, f"Failed: {resp.text}"
        data = resp.json()
        
        assert "success" in data
        assert "depth_mastery" in data
        assert "depth_mastery_reward" in data
        assert "first_visit" in data
        
        print(f"✓ Navigate returns depth_mastery fields: mastery={data['depth_mastery']}, reward={data['depth_mastery_reward']}")
    
    def test_sublayer_progress_includes_mastered_depths(self):
        """GET /api/sublayers/progress should include mastered_depths list"""
        resp = requests.get(f"{BASE_URL}/api/sublayers/progress", headers=self.headers)
        assert resp.status_code == 200, f"Failed: {resp.text}"
        data = resp.json()
        
        assert "mastered_depths" in data
        assert isinstance(data["mastered_depths"], list)
        assert "by_depth" in data
        
        # Check by_depth structure
        for depth_id in ["crust", "mantle", "outer_core", "hollow_earth"]:
            assert depth_id in data["by_depth"]
            depth_data = data["by_depth"][depth_id]
            assert "total" in depth_data
            assert "explored" in depth_data
            assert "completion_pct" in depth_data
        
        print(f"✓ Sublayer progress includes mastered_depths: {data['mastered_depths']}")


class TestRegressionChecks:
    """Regression tests to ensure previous features still work"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        self.token = login_resp.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_fractal_map_still_works(self):
        """GET /api/sublayers/fractal-map should still return 54 sublayers"""
        resp = requests.get(f"{BASE_URL}/api/sublayers/fractal-map", headers=self.headers)
        assert resp.status_code == 200, f"Failed: {resp.text}"
        data = resp.json()
        
        assert data["total_sublayers"] == 54
        assert len(data["depths"]) == 4
        print(f"✓ Fractal map still returns 54 sublayers across 4 depths")
    
    def test_art_prompts_still_work(self):
        """GET /api/avenues/art/prompts should still return 5 prompts"""
        resp = requests.get(f"{BASE_URL}/api/avenues/art/prompts", headers=self.headers)
        assert resp.status_code == 200, f"Failed: {resp.text}"
        data = resp.json()
        
        assert data["total"] == 5
        print(f"✓ Art prompts still returns 5 prompts")
    
    def test_thought_quests_still_work(self):
        """GET /api/avenues/thought/quests should still return 6 quests"""
        resp = requests.get(f"{BASE_URL}/api/avenues/thought/quests", headers=self.headers)
        assert resp.status_code == 200, f"Failed: {resp.text}"
        data = resp.json()
        
        assert data["total"] == 6
        print(f"✓ Thought quests still returns 6 quests")
    
    def test_planetary_layers_still_work(self):
        """GET /api/planetary/layers should still return 4 layers"""
        resp = requests.get(f"{BASE_URL}/api/planetary/layers", headers=self.headers)
        assert resp.status_code == 200, f"Failed: {resp.text}"
        data = resp.json()
        
        assert len(data["layers"]) == 4
        print(f"✓ Planetary layers still returns 4 layers")
    
    def test_dimensions_grid_still_works(self):
        """GET /api/dimensions/grid should still return 12-cell grid"""
        resp = requests.get(f"{BASE_URL}/api/dimensions/grid", headers=self.headers)
        assert resp.status_code == 200, f"Failed: {resp.text}"
        data = resp.json()
        
        assert data["grid_size"]["total_cells"] == 12
        assert len(data["grid"]) == 12
        print(f"✓ Dimensions grid still returns 12 cells")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
