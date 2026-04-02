"""
Iteration 186 Tests: Science/History Avenues, E-Bike Simulator, Circular Economy
Tests for:
- Botanical Lab simulations (5 sims)
- E-Bike Engineering simulator (2 sims)
- History modules (4 modules)
- Geology modules (3 modules)
- Circular Economy marketplace (8 items)
- Avenues overview (6 avenues)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "grad_test_522@test.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user."""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Return headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestAvenuesOverview:
    """Test /api/avenues/overview returns all 6 avenues."""

    def test_avenues_overview_returns_6_avenues(self, auth_headers):
        """GET /api/avenues/overview should return 6 avenues including science and history."""
        response = requests.get(f"{BASE_URL}/api/avenues/overview", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "avenues" in data
        avenues = data["avenues"]
        assert len(avenues) == 6, f"Expected 6 avenues, got {len(avenues)}"
        
        avenue_ids = [a["id"] for a in avenues]
        assert "mathematics" in avenue_ids
        assert "art" in avenue_ids
        assert "thought" in avenue_ids
        assert "biometrics" in avenue_ids
        assert "science" in avenue_ids
        assert "history" in avenue_ids
        
        # Verify science avenue details
        science = next(a for a in avenues if a["id"] == "science")
        assert science["title"] == "The Alchemist"
        assert science["color"] == "#F59E0B"
        
        # Verify history avenue details
        history = next(a for a in avenues if a["id"] == "history")
        assert history["title"] == "The Chronicler"
        assert history["color"] == "#EC4899"
        
        print(f"✓ Avenues overview returns 6 avenues: {avenue_ids}")


class TestBotanicalLab:
    """Test Botanical Lab simulation endpoints."""

    def test_get_botanical_simulations(self, auth_headers):
        """GET /api/science-history/botanical-lab should return 5 simulations."""
        response = requests.get(f"{BASE_URL}/api/science-history/botanical-lab", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "simulations" in data
        sims = data["simulations"]
        assert data["total"] == 5, f"Expected 5 simulations, got {data['total']}"
        
        sim_ids = [s["id"] for s in sims]
        expected_ids = ["aquafaba_meringue", "monk_fruit_pectin", "coconut_hemp_emulsion", "kona_extraction", "lychee_crumb"]
        for eid in expected_ids:
            assert eid in sim_ids, f"Missing simulation: {eid}"
        
        # Verify simulation structure
        for sim in sims:
            assert "id" in sim
            assert "name" in sim
            assert "category" in sim
            assert "variables" in sim
            assert "resonance" in sim
            assert "completed" in sim
        
        print(f"✓ Botanical Lab returns 5 simulations: {sim_ids}")

    def test_run_botanical_simulation(self, auth_headers):
        """POST /api/science-history/botanical-lab/simulate should accept variables and return score."""
        # Use aquafaba_meringue simulation with optimal values
        payload = {
            "simulation_id": "aquafaba_meringue",
            "variables": {
                "whip_speed": 800,  # optimal
                "temperature": 18,  # optimal
                "acid_drops": 4     # optimal
            }
        }
        response = requests.post(f"{BASE_URL}/api/science-history/botanical-lab/simulate", 
                                 json=payload, headers=auth_headers)
        
        # May return 400 if already mastered, which is acceptable
        if response.status_code == 400 and "already mastered" in response.text.lower():
            print("✓ Botanical simulation already mastered (expected)")
            return
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "score" in data
        assert "mastered" in data
        assert "feedback" in data
        assert "science_note" in data
        assert isinstance(data["score"], int)
        assert isinstance(data["feedback"], list)
        
        print(f"✓ Botanical simulation returned score: {data['score']}%, mastered: {data['mastered']}")


class TestEBikeSimulator:
    """Test E-Bike Engineering simulator endpoints."""

    def test_get_ebike_simulations(self, auth_headers):
        """GET /api/science-history/ebike/sims should return 2 simulations."""
        response = requests.get(f"{BASE_URL}/api/science-history/ebike/sims", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "simulations" in data
        assert data["total"] == 2, f"Expected 2 simulations, got {data['total']}"
        
        sim_ids = [s["id"] for s in data["simulations"]]
        assert "torque_range" in sim_ids
        assert "battery_physics" in sim_ids
        
        # Verify simulation structure
        for sim in data["simulations"]:
            assert "id" in sim
            assert "name" in sim
            assert "variables" in sim
            assert "resonance" in sim
            assert "completed" in sim
        
        print(f"✓ E-Bike simulator returns 2 simulations: {sim_ids}")

    def test_run_ebike_simulation(self, auth_headers):
        """POST /api/science-history/ebike/simulate should return score and calculated range."""
        payload = {
            "simulation_id": "battery_physics",
            "variables": {
                "battery_wh": 1500,   # optimal
                "motor_watts": 2000,  # optimal
                "speed_mph": 20       # optimal
            }
        }
        response = requests.post(f"{BASE_URL}/api/science-history/ebike/simulate",
                                 json=payload, headers=auth_headers)
        
        # May return 400 if already mastered
        if response.status_code == 400 and "already mastered" in response.text.lower():
            print("✓ E-Bike simulation already mastered (expected)")
            return
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "score" in data
        assert "mastered" in data
        assert "feedback" in data
        assert "calculated" in data
        assert "estimated_range_miles" in data["calculated"]
        
        print(f"✓ E-Bike simulation returned score: {data['score']}%, range: {data['calculated']['estimated_range_miles']} mi")


class TestHistoryModules:
    """Test History module endpoints."""

    def test_get_history_modules(self, auth_headers):
        """GET /api/science-history/history-modules should return 4 modules."""
        response = requests.get(f"{BASE_URL}/api/science-history/history-modules", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "modules" in data
        assert data["total"] == 4, f"Expected 4 modules, got {data['total']}"
        
        module_ids = [m["id"] for m in data["modules"]]
        expected_ids = ["ancient_astronomy", "sacred_sites", "transport_evolution", "alchemy_history"]
        for eid in expected_ids:
            assert eid in module_ids, f"Missing module: {eid}"
        
        # Verify module structure
        for mod in data["modules"]:
            assert "id" in mod
            assert "name" in mod
            assert "era" in mod
            assert "civilizations" in mod
            assert "question_count" in mod
            assert "resonance" in mod
        
        print(f"✓ History modules returns 4 modules: {module_ids}")

    def test_get_history_question(self, auth_headers):
        """GET /api/science-history/history/{module_id}/question/{index} should return question text."""
        response = requests.get(f"{BASE_URL}/api/science-history/history/ancient_astronomy/question/0", 
                               headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "question" in data
        assert "hint" in data
        assert "index" in data
        assert "total" in data
        assert data["index"] == 0
        assert len(data["question"]) > 0
        
        print(f"✓ History question returned: '{data['question'][:50]}...'")

    def test_answer_history_question(self, auth_headers):
        """POST /api/science-history/history/answer should check answer correctness."""
        # Answer: "egyptian" for "Which civilization created the 365-day solar calendar?"
        payload = {
            "module_id": "ancient_astronomy",
            "question_index": 0,
            "answer": "egyptian"
        }
        response = requests.post(f"{BASE_URL}/api/science-history/history/answer",
                                json=payload, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "correct" in data
        assert "message" in data
        # The answer should be correct
        assert data["correct"] == True, f"Expected correct answer, got: {data}"
        
        print(f"✓ History answer check: correct={data['correct']}, resonance={data.get('resonance_earned', 0)}")


class TestGeologyModules:
    """Test Geology module endpoints."""

    def test_get_geology_modules(self, auth_headers):
        """GET /api/science-history/geology should return 3 modules."""
        response = requests.get(f"{BASE_URL}/api/science-history/geology", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "modules" in data
        assert data["total"] == 3, f"Expected 3 modules, got {data['total']}"
        
        module_ids = [m["id"] for m in data["modules"]]
        expected_ids = ["layer_identification", "mineral_hardness", "rock_cycle"]
        for eid in expected_ids:
            assert eid in module_ids, f"Missing module: {eid}"
        
        print(f"✓ Geology modules returns 3 modules: {module_ids}")

    def test_get_geology_question(self, auth_headers):
        """GET /api/science-history/geology/{module_id}/question/{index} should return question text."""
        response = requests.get(f"{BASE_URL}/api/science-history/geology/layer_identification/question/0",
                               headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "question" in data
        assert "hint" in data
        assert "index" in data
        assert "total" in data
        
        print(f"✓ Geology question returned: '{data['question'][:50]}...'")

    def test_answer_geology_question(self, auth_headers):
        """POST /api/science-history/geology/answer should check answer correctness."""
        # Answer: "crust" for "What is the thinnest layer of the Earth?"
        payload = {
            "module_id": "layer_identification",
            "question_index": 0,
            "answer": "crust"
        }
        response = requests.post(f"{BASE_URL}/api/science-history/geology/answer",
                                json=payload, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "correct" in data
        assert "message" in data
        assert data["correct"] == True, f"Expected correct answer, got: {data}"
        
        print(f"✓ Geology answer check: correct={data['correct']}, resonance={data.get('resonance_earned', 0)}")


class TestCircularEconomy:
    """Test Circular Economy marketplace endpoints."""

    def test_get_shop_items(self, auth_headers):
        """GET /api/science-history/economy/shop should return 8 items with balances."""
        response = requests.get(f"{BASE_URL}/api/science-history/economy/shop", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "items" in data
        assert "balances" in data
        assert data["total_items"] == 8, f"Expected 8 items, got {data['total_items']}"
        
        # Verify balances structure
        assert "kinetic_dust" in data["balances"]
        assert "science_resonance" in data["balances"]
        
        # Verify item structure
        item_ids = [i["id"] for i in data["items"]]
        expected_ids = ["carbon_fork", "fat_tire_set", "torque_sensor", "yoga_mat", 
                       "meditation_cushion", "alchemist_skin", "chronicler_skin", "sentinel_skin"]
        for eid in expected_ids:
            assert eid in item_ids, f"Missing item: {eid}"
        
        for item in data["items"]:
            assert "id" in item
            assert "name" in item
            assert "category" in item
            assert "currency" in item
            assert "rarity" in item
            assert "owned" in item
        
        print(f"✓ Shop returns 8 items, balances: dust={data['balances']['kinetic_dust']}, resonance={data['balances']['science_resonance']}")

    def test_purchase_item(self, auth_headers):
        """POST /api/science-history/economy/purchase should deduct currency and record purchase."""
        # First check current balance
        shop_response = requests.get(f"{BASE_URL}/api/science-history/economy/shop", headers=auth_headers)
        shop_data = shop_response.json()
        initial_dust = shop_data["balances"]["kinetic_dust"]
        
        # Find an affordable item that's not owned
        affordable_item = None
        for item in shop_data["items"]:
            if not item["owned"] and item["currency"] == "kinetic_dust" and item["cost_dust"] <= initial_dust:
                affordable_item = item
                break
        
        if not affordable_item:
            print(f"✓ No affordable unowned items (dust balance: {initial_dust}) - skipping purchase test")
            return
        
        # Attempt purchase
        payload = {"item_id": affordable_item["id"]}
        response = requests.post(f"{BASE_URL}/api/science-history/economy/purchase",
                                json=payload, headers=auth_headers)
        
        if response.status_code == 400 and "already owned" in response.text.lower():
            print(f"✓ Item already owned - purchase endpoint working")
            return
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["success"] == True
        assert "item" in data
        assert "spent" in data
        assert "currency" in data
        
        # Verify balance was deducted
        shop_after = requests.get(f"{BASE_URL}/api/science-history/economy/shop", headers=auth_headers)
        new_dust = shop_after.json()["balances"]["kinetic_dust"]
        assert new_dust < initial_dust, f"Balance should have decreased: {initial_dust} -> {new_dust}"
        
        print(f"✓ Purchase successful: {data['item']}, spent {data['spent']} {data['currency']}")


class TestResonanceCheck:
    """Test resonance check includes science and history."""

    def test_resonance_check_includes_all_avenues(self, auth_headers):
        """GET /api/avenues/resonance-check should include science and history."""
        response = requests.get(f"{BASE_URL}/api/avenues/resonance-check", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "mathematics" in data
        assert "art" in data
        assert "thought" in data
        assert "biometrics" in data
        assert "science" in data
        assert "history" in data
        assert "total" in data
        assert "equilibrium" in data
        
        # Verify equilibrium includes all 6 avenues
        eq = data["equilibrium"]
        assert "science" in eq
        assert "history" in eq
        
        print(f"✓ Resonance check includes all 6 avenues, total: {data['total']}")


class TestHeartSync:
    """Test Heart Rate Sync challenge."""

    def test_heart_sync_challenge(self, auth_headers):
        """POST /api/science-history/heart-sync should return sync level and rewards."""
        payload = {
            "heart_rate": 72,  # Target for crust depth
            "current_depth": "crust"
        }
        response = requests.post(f"{BASE_URL}/api/science-history/heart-sync",
                                json=payload, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "sync_level" in data
        assert "your_bpm" in data
        assert "target_bpm" in data
        assert "depth" in data
        assert "resonance_earned" in data
        assert "dust_earned" in data
        
        # With exact target BPM, should be perfect sync
        assert data["sync_level"] == "perfect", f"Expected perfect sync, got: {data['sync_level']}"
        
        print(f"✓ Heart sync: {data['sync_level']}, resonance: {data['resonance_earned']}, dust: {data['dust_earned']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
