"""
Iteration 165: Economy Admin, Encounters, and Living Journal Tests
Tests for:
- Economy Admin: Exchange rate, module unlocks, communal goals
- Encounters: Environmental bosses, NPC rivals, World Veins
- Living Journal: AI-generated narratives via Gemini
"""

import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Test credentials
TEST_EMAIL = "rpg_test@test.com"
TEST_PASSWORD = "password123"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user."""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    if response.status_code == 200:
        data = response.json()
        return data.get("token") or data.get("access_token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ECONOMY ADMIN TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestEconomyExchangeRate:
    """Tests for exchange rate endpoints."""

    def test_get_exchange_rate(self, auth_headers):
        """GET /api/economy/exchange-rate returns rate with communal modifier."""
        response = requests.get(f"{BASE_URL}/api/economy/exchange-rate", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "base_rate" in data, "Response should include base_rate"
        assert "effective_rate" in data, "Response should include effective_rate"
        assert "communal_bonus" in data, "Response should include communal_bonus"
        assert "bonus_active" in data, "Response should include bonus_active"
        assert isinstance(data["base_rate"], (int, float)), "base_rate should be numeric"
        assert isinstance(data["effective_rate"], (int, float)), "effective_rate should be numeric"
        print(f"Exchange rate: base={data['base_rate']}, effective={data['effective_rate']}, bonus={data['communal_bonus']}")

    def test_set_exchange_rate(self, auth_headers):
        """POST /api/economy/set-exchange-rate sets global rate."""
        response = requests.post(
            f"{BASE_URL}/api/economy/set-exchange-rate",
            headers=auth_headers,
            json={"dust_per_credit": 150}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("updated") == True, "Should confirm update"
        assert data.get("dust_per_credit") == 150, "Should return new rate"
        print(f"Set exchange rate to 150 dust/credit")

    def test_set_exchange_rate_validation_min(self, auth_headers):
        """POST /api/economy/set-exchange-rate rejects rate < 10."""
        response = requests.post(
            f"{BASE_URL}/api/economy/set-exchange-rate",
            headers=auth_headers,
            json={"dust_per_credit": 5}
        )
        assert response.status_code == 400, f"Expected 400 for rate < 10, got {response.status_code}"
        print("Correctly rejected rate < 10")

    def test_set_exchange_rate_validation_max(self, auth_headers):
        """POST /api/economy/set-exchange-rate rejects rate > 10000."""
        response = requests.post(
            f"{BASE_URL}/api/economy/set-exchange-rate",
            headers=auth_headers,
            json={"dust_per_credit": 15000}
        )
        assert response.status_code == 400, f"Expected 400 for rate > 10000, got {response.status_code}"
        print("Correctly rejected rate > 10000")


class TestEconomyDustConversion:
    """Tests for dust to credits conversion."""

    def test_convert_dust_insufficient(self, auth_headers):
        """POST /api/economy/convert-dust fails with insufficient dust."""
        response = requests.post(
            f"{BASE_URL}/api/economy/convert-dust",
            headers=auth_headers,
            json={"dust_amount": 999999999}
        )
        assert response.status_code == 400, f"Expected 400 for insufficient dust, got {response.status_code}"
        print("Correctly rejected conversion with insufficient dust")

    def test_convert_dust_below_minimum(self, auth_headers):
        """POST /api/economy/convert-dust fails when dust < rate."""
        # First get the current rate
        rate_response = requests.get(f"{BASE_URL}/api/economy/exchange-rate", headers=auth_headers)
        rate = rate_response.json().get("effective_rate", 100)
        
        response = requests.post(
            f"{BASE_URL}/api/economy/convert-dust",
            headers=auth_headers,
            json={"dust_amount": rate - 1}  # Below minimum
        )
        assert response.status_code == 400, f"Expected 400 for dust below rate, got {response.status_code}"
        print(f"Correctly rejected conversion below minimum ({rate} dust)")


class TestEconomyModules:
    """Tests for premium module endpoints."""

    def test_get_modules(self, auth_headers):
        """GET /api/economy/modules returns premium modules with access status."""
        response = requests.get(f"{BASE_URL}/api/economy/modules", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "modules" in data, "Response should include modules array"
        assert len(data["modules"]) > 0, "Should have at least one module"
        
        # Check module structure
        module = data["modules"][0]
        assert "id" in module, "Module should have id"
        assert "name" in module, "Module should have name"
        assert "unlock_cost_credits" in module, "Module should have unlock_cost_credits"
        assert "access" in module, "Module should have access info"
        print(f"Found {len(data['modules'])} premium modules")

    def test_check_access_known_module(self, auth_headers):
        """GET /api/economy/check-access/{module_id} returns access status."""
        response = requests.get(
            f"{BASE_URL}/api/economy/check-access/cosmic_mixer_advanced",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "has_access" in data, "Response should include has_access"
        assert "reason" in data, "Response should include reason"
        print(f"Module access: has_access={data['has_access']}, reason={data['reason']}")

    def test_check_access_unknown_module(self, auth_headers):
        """GET /api/economy/check-access/{module_id} returns not_gated for unknown."""
        response = requests.get(
            f"{BASE_URL}/api/economy/check-access/unknown_module_xyz",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("has_access") == True, "Unknown module should be accessible"
        assert data.get("reason") == "not_gated", "Reason should be not_gated"
        print("Unknown module correctly returns not_gated")

    def test_unlock_module_unknown(self, auth_headers):
        """POST /api/economy/unlock-module fails for unknown module."""
        response = requests.post(
            f"{BASE_URL}/api/economy/unlock-module",
            headers=auth_headers,
            json={"module_id": "fake_module_xyz"}
        )
        assert response.status_code == 400, f"Expected 400 for unknown module, got {response.status_code}"
        print("Correctly rejected unknown module unlock")


class TestEconomyCommunalGoals:
    """Tests for communal goals endpoints."""

    def test_get_communal_goals(self, auth_headers):
        """GET /api/economy/communal-goals returns goals with progress."""
        response = requests.get(f"{BASE_URL}/api/economy/communal-goals", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "goals" in data, "Response should include goals array"
        assert len(data["goals"]) > 0, "Should have at least one goal"
        
        # Check goal structure
        goal = data["goals"][0]
        assert "id" in goal, "Goal should have id"
        assert "name" in goal, "Goal should have name"
        assert "target" in goal, "Goal should have target"
        assert "current" in goal, "Goal should have current progress"
        assert "progress_percent" in goal, "Goal should have progress_percent"
        print(f"Found {len(data['goals'])} communal goals")

    def test_contribute_communal_goal(self, auth_headers):
        """POST /api/economy/contribute-communal adds contribution."""
        response = requests.post(
            f"{BASE_URL}/api/economy/contribute-communal",
            headers=auth_headers,
            json={"goal_id": "enlightenment", "contribution": 1}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("contributed") == True, "Should confirm contribution"
        assert "new_total" in data, "Should return new total"
        assert "target" in data, "Should return target"
        print(f"Contributed to enlightenment: new_total={data['new_total']}, target={data['target']}")

    def test_contribute_unknown_goal(self, auth_headers):
        """POST /api/economy/contribute-communal fails for unknown goal."""
        response = requests.post(
            f"{BASE_URL}/api/economy/contribute-communal",
            headers=auth_headers,
            json={"goal_id": "fake_goal_xyz", "contribution": 1}
        )
        assert response.status_code == 400, f"Expected 400 for unknown goal, got {response.status_code}"
        print("Correctly rejected unknown goal contribution")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ENCOUNTERS TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestEncountersBoss:
    """Tests for environmental boss endpoints."""

    def test_get_daily_boss(self, auth_headers):
        """GET /api/encounters/daily-boss returns today's boss."""
        response = requests.get(f"{BASE_URL}/api/encounters/daily-boss", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Boss should have id"
        assert "name" in data, "Boss should have name"
        assert "description" in data, "Boss should have description"
        assert "time_limit_seconds" in data, "Boss should have time_limit_seconds"
        assert "required_actions" in data, "Boss should have required_actions"
        assert "date" in data, "Should include date"
        assert "completed" in data, "Should include completed status"
        print(f"Daily boss: {data['name']} (id={data['id']}, time_limit={data['time_limit_seconds']}s)")

    def test_attempt_boss_success(self, auth_headers):
        """POST /api/encounters/attempt-boss with success conditions."""
        # First get today's boss
        boss_response = requests.get(f"{BASE_URL}/api/encounters/daily-boss", headers=auth_headers)
        boss = boss_response.json()
        
        response = requests.post(
            f"{BASE_URL}/api/encounters/attempt-boss",
            headers=auth_headers,
            json={
                "boss_id": boss["id"],
                "actions_completed": boss["required_actions"],
                "time_taken_seconds": boss["time_limit_seconds"] - 10  # Within time
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "success" in data, "Should include success status"
        assert "within_time" in data, "Should include within_time"
        assert "enough_actions" in data, "Should include enough_actions"
        assert "rewards" in data, "Should include rewards"
        print(f"Boss attempt: success={data['success']}, rewards={data['rewards']}")

    def test_attempt_boss_failure_time(self, auth_headers):
        """POST /api/encounters/attempt-boss fails when over time limit."""
        boss_response = requests.get(f"{BASE_URL}/api/encounters/daily-boss", headers=auth_headers)
        boss = boss_response.json()
        
        response = requests.post(
            f"{BASE_URL}/api/encounters/attempt-boss",
            headers=auth_headers,
            json={
                "boss_id": boss["id"],
                "actions_completed": boss["required_actions"],
                "time_taken_seconds": boss["time_limit_seconds"] + 100  # Over time
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("success") == False, "Should fail when over time"
        assert data.get("within_time") == False, "within_time should be False"
        print("Boss attempt correctly failed due to time limit")

    def test_attempt_boss_unknown(self, auth_headers):
        """POST /api/encounters/attempt-boss fails for unknown boss."""
        response = requests.post(
            f"{BASE_URL}/api/encounters/attempt-boss",
            headers=auth_headers,
            json={"boss_id": "fake_boss_xyz", "actions_completed": 5, "time_taken_seconds": 30}
        )
        assert response.status_code == 400, f"Expected 400 for unknown boss, got {response.status_code}"
        print("Correctly rejected unknown boss attempt")


class TestEncountersRival:
    """Tests for NPC rival endpoints."""

    def test_get_rival(self, auth_headers):
        """GET /api/encounters/rival returns current rival NPC."""
        response = requests.get(f"{BASE_URL}/api/encounters/rival", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Rival should have id"
        assert "name" in data, "Rival should have name"
        assert "title" in data, "Rival should have title"
        assert "active_dialogue" in data, "Should include active_dialogue"
        assert "rival_score" in data, "Should include rival_score"
        assert "user_score" in data, "Should include user_score"
        print(f"Rival: {data['name']} ({data['title']}), dialogue: '{data['active_dialogue'][:50]}...'")

    def test_rival_action_mine(self, auth_headers):
        """POST /api/encounters/rival-action with mine action."""
        response = requests.post(
            f"{BASE_URL}/api/encounters/rival-action",
            headers=auth_headers,
            json={"action": "mine", "rival_id": "sprinter"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "user_wins" in data, "Should include user_wins"
        assert "action" in data, "Should include action"
        assert "rival_name" in data, "Should include rival_name"
        assert "dialogue" in data, "Should include dialogue"
        print(f"Rival action: user_wins={data['user_wins']}, rewards={data.get('rewards', {})}")

    def test_rival_action_stealth(self, auth_headers):
        """POST /api/encounters/rival-action with stealth buff."""
        response = requests.post(
            f"{BASE_URL}/api/encounters/rival-action",
            headers=auth_headers,
            json={"action": "stealth", "rival_id": "specialist"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("action") == "stealth", "Action should be stealth"
        print(f"Stealth action: user_wins={data['user_wins']}")

    def test_rival_action_speed_burst(self, auth_headers):
        """POST /api/encounters/rival-action with speed_burst buff."""
        response = requests.post(
            f"{BASE_URL}/api/encounters/rival-action",
            headers=auth_headers,
            json={"action": "speed_burst", "rival_id": "sprinter"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("action") == "speed_burst", "Action should be speed_burst"
        print(f"Speed burst action: user_wins={data['user_wins']}")

    def test_rival_action_unknown_rival(self, auth_headers):
        """POST /api/encounters/rival-action fails for unknown rival."""
        response = requests.post(
            f"{BASE_URL}/api/encounters/rival-action",
            headers=auth_headers,
            json={"action": "mine", "rival_id": "fake_rival_xyz"}
        )
        assert response.status_code == 400, f"Expected 400 for unknown rival, got {response.status_code}"
        print("Correctly rejected unknown rival action")


class TestEncountersWorldVeins:
    """Tests for World Vein (collective boss) endpoints."""

    def test_get_world_veins(self, auth_headers):
        """GET /api/encounters/world-veins returns active veins."""
        response = requests.get(f"{BASE_URL}/api/encounters/world-veins", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "world_veins" in data, "Response should include world_veins array"
        assert len(data["world_veins"]) > 0, "Should have at least one vein"
        
        # Check vein structure
        vein = data["world_veins"][0]
        assert "id" in vein, "Vein should have id"
        assert "name" in vein, "Vein should have name"
        assert "required_frequency" in vein, "Vein should have required_frequency"
        assert "required_participants" in vein, "Vein should have required_participants"
        assert "participants" in vein, "Should include current participants"
        assert "cracked" in vein, "Should include cracked status"
        print(f"Found {len(data['world_veins'])} world veins")

    def test_contribute_vein_success(self, auth_headers):
        """POST /api/encounters/contribute-vein with valid frequency."""
        response = requests.post(
            f"{BASE_URL}/api/encounters/contribute-vein",
            headers=auth_headers,
            json={
                "vein_id": "heart_frequency",
                "frequency": 528,  # Exact match
                "duration_minutes": 5
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("contributed") == True, "Should confirm contribution"
        assert "participants" in data, "Should return participants count"
        assert "rewards" in data, "Should include rewards"
        print(f"Vein contribution: participants={data['participants']}, rewards={data['rewards']}")

    def test_contribute_vein_frequency_tolerance(self, auth_headers):
        """POST /api/encounters/contribute-vein accepts ±10% frequency."""
        # 528 Hz ±10% = 475.2 to 580.8
        response = requests.post(
            f"{BASE_URL}/api/encounters/contribute-vein",
            headers=auth_headers,
            json={
                "vein_id": "heart_frequency",
                "frequency": 500,  # Within 10% of 528
                "duration_minutes": 5
            }
        )
        assert response.status_code == 200, f"Expected 200 for frequency within tolerance, got {response.status_code}"
        print("Frequency within 10% tolerance accepted")

    def test_contribute_vein_frequency_mismatch(self, auth_headers):
        """POST /api/encounters/contribute-vein fails with wrong frequency."""
        response = requests.post(
            f"{BASE_URL}/api/encounters/contribute-vein",
            headers=auth_headers,
            json={
                "vein_id": "heart_frequency",
                "frequency": 100,  # Way off from 528
                "duration_minutes": 5
            }
        )
        assert response.status_code == 400, f"Expected 400 for frequency mismatch, got {response.status_code}"
        print("Correctly rejected frequency mismatch")

    def test_contribute_vein_insufficient_duration(self, auth_headers):
        """POST /api/encounters/contribute-vein fails with short duration."""
        response = requests.post(
            f"{BASE_URL}/api/encounters/contribute-vein",
            headers=auth_headers,
            json={
                "vein_id": "heart_frequency",
                "frequency": 528,
                "duration_minutes": 1  # Less than required 5 minutes
            }
        )
        assert response.status_code == 400, f"Expected 400 for insufficient duration, got {response.status_code}"
        print("Correctly rejected insufficient duration")

    def test_contribute_vein_unknown(self, auth_headers):
        """POST /api/encounters/contribute-vein fails for unknown vein."""
        response = requests.post(
            f"{BASE_URL}/api/encounters/contribute-vein",
            headers=auth_headers,
            json={"vein_id": "fake_vein_xyz", "frequency": 528, "duration_minutes": 5}
        )
        assert response.status_code == 400, f"Expected 400 for unknown vein, got {response.status_code}"
        print("Correctly rejected unknown vein contribution")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  LIVING JOURNAL TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestLivingJournal:
    """Tests for Living Journal AI narrative endpoints."""

    def test_get_journal_entries(self, auth_headers):
        """GET /api/journal/entries returns user's journal."""
        response = requests.get(f"{BASE_URL}/api/journal/entries", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "entries" in data, "Response should include entries array"
        assert "total" in data, "Response should include total count"
        print(f"Journal has {data['total']} entries")

    def test_get_specimen_journal(self, auth_headers):
        """GET /api/journal/for-specimen/{id} returns specimen-specific entries."""
        response = requests.get(
            f"{BASE_URL}/api/journal/for-specimen/emerald",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "entries" in data, "Response should include entries array"
        assert "specimen_id" in data, "Response should include specimen_id"
        assert data["specimen_id"] == "emerald", "specimen_id should match"
        print(f"Emerald journal has {len(data['entries'])} entries")

    def test_generate_journal_entry(self, auth_headers):
        """POST /api/journal/generate creates AI narrative for specimen."""
        response = requests.post(
            f"{BASE_URL}/api/journal/generate",
            headers=auth_headers,
            json={
                "specimen_id": "emerald",
                "biome": "earth",
                "layer": "terrestrial"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "entry" in data, "Response should include entry"
        assert "rewards" in data, "Response should include rewards"
        
        entry = data["entry"]
        assert "narrative" in entry, "Entry should have narrative"
        assert "specimen_name" in entry, "Entry should have specimen_name"
        assert "geological_data" in entry, "Entry should have geological_data"
        assert "spiritual_data" in entry, "Entry should have spiritual_data"
        assert len(entry["narrative"]) > 20, "Narrative should be substantial"
        print(f"Generated journal entry: '{entry['narrative'][:100]}...'")

    def test_generate_journal_missing_specimen(self, auth_headers):
        """POST /api/journal/generate fails without specimen_id."""
        response = requests.post(
            f"{BASE_URL}/api/journal/generate",
            headers=auth_headers,
            json={"biome": "earth"}
        )
        assert response.status_code == 400, f"Expected 400 without specimen_id, got {response.status_code}"
        print("Correctly rejected missing specimen_id")

    def test_generate_journal_unowned_specimen(self, auth_headers):
        """POST /api/journal/generate fails for unowned specimen."""
        response = requests.post(
            f"{BASE_URL}/api/journal/generate",
            headers=auth_headers,
            json={"specimen_id": "fake_specimen_xyz"}
        )
        assert response.status_code == 404, f"Expected 404 for unowned specimen, got {response.status_code}"
        print("Correctly rejected unowned specimen")

    def test_add_reflection(self, auth_headers):
        """POST /api/journal/add-reflection adds personal reflection."""
        # First generate an entry to ensure one exists
        requests.post(
            f"{BASE_URL}/api/journal/generate",
            headers=auth_headers,
            json={"specimen_id": "jade", "biome": "earth", "layer": "terrestrial"}
        )
        
        response = requests.post(
            f"{BASE_URL}/api/journal/add-reflection",
            headers=auth_headers,
            json={
                "specimen_id": "jade",
                "reflection": "This jade specimen reminds me of peaceful forests.",
                "entry_number": 1
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("reflection_added") == True, "Should confirm reflection added"
        print("Successfully added reflection to journal entry")

    def test_add_reflection_missing_fields(self, auth_headers):
        """POST /api/journal/add-reflection fails without required fields."""
        response = requests.post(
            f"{BASE_URL}/api/journal/add-reflection",
            headers=auth_headers,
            json={"specimen_id": "emerald"}  # Missing reflection
        )
        assert response.status_code == 400, f"Expected 400 without reflection, got {response.status_code}"
        print("Correctly rejected missing reflection field")

    def test_add_reflection_too_long(self, auth_headers):
        """POST /api/journal/add-reflection fails for reflection > 1000 chars."""
        response = requests.post(
            f"{BASE_URL}/api/journal/add-reflection",
            headers=auth_headers,
            json={
                "specimen_id": "emerald",
                "reflection": "x" * 1001,  # Over 1000 chars
                "entry_number": 1
            }
        )
        assert response.status_code == 400, f"Expected 400 for long reflection, got {response.status_code}"
        print("Correctly rejected reflection > 1000 characters")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  MARKETPLACE DELEGATION TEST
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestMarketplaceDelegation:
    """Test that marketplace convert-dust delegates to economy admin."""

    def test_marketplace_convert_dust_delegates(self, auth_headers):
        """POST /api/marketplace/convert-dust uses economy admin sliding scale."""
        # This should use the same rate as economy admin
        response = requests.post(
            f"{BASE_URL}/api/marketplace/convert-dust",
            headers=auth_headers,
            json={"dust_amount": 10}  # Below minimum to trigger error
        )
        # Should fail with minimum conversion message (proving it uses economy rate)
        assert response.status_code == 400, f"Expected 400 for below minimum, got {response.status_code}"
        assert "Minimum conversion" in response.text or "minimum" in response.text.lower(), \
            "Error should mention minimum conversion"
        print("Marketplace convert-dust correctly delegates to economy admin")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
