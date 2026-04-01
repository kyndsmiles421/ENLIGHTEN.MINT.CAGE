"""
Test suite for Forgotten Languages System (Iteration 159)
Tests:
- GET /api/forgotten-languages/daily - Daily cipher with script, breath pattern, glyphs, tier info
- GET /api/forgotten-languages/mastery - Tier progression, decoded counts, permanent modifiers
- GET /api/forgotten-languages/scripts - All 5 script families with breath patterns
- POST /api/forgotten-languages/decode - Decode glyph, award XP/dust/modifier
- POST /api/forgotten-languages/decode - Fail for already-decoded glyph (400)
- POST /api/forgotten-languages/decode - Fail for invalid glyph_id (400)
- Regression: POST /api/game-core/commit-reward
- Regression: GET /api/rock-hounding/mine
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "rpg_test@test.com"
TEST_PASSWORD = "password123"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    # Try to register if login fails
    reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
        "name": "RPG Test User"
    })
    if reg_response.status_code in [200, 201]:
        return reg_response.json().get("token")
    pytest.skip("Authentication failed - skipping tests")


@pytest.fixture(scope="module")
def headers(auth_token):
    """Auth headers for API requests"""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestForgottenLanguagesDaily:
    """Tests for GET /api/forgotten-languages/daily"""
    
    def test_daily_cipher_returns_200(self, headers):
        """Daily cipher endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/daily", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    def test_daily_cipher_has_date(self, headers):
        """Daily cipher includes today's date"""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/daily", headers=headers)
        data = response.json()
        assert "date" in data, "Missing 'date' field"
        assert len(data["date"]) == 10, "Date should be YYYY-MM-DD format"
    
    def test_daily_cipher_has_element(self, headers):
        """Daily cipher includes deficient element"""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/daily", headers=headers)
        data = response.json()
        assert "element" in data, "Missing 'element' field"
        assert data["element"] in ["wood", "fire", "earth", "metal", "water"], f"Invalid element: {data['element']}"
    
    def test_daily_cipher_has_script(self, headers):
        """Daily cipher includes script family info"""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/daily", headers=headers)
        data = response.json()
        assert "script" in data, "Missing 'script' field"
        script = data["script"]
        assert "name" in script, "Script missing 'name'"
        assert "origin" in script, "Script missing 'origin'"
        assert "description" in script, "Script missing 'description'"
        assert "color" in script, "Script missing 'color'"
        assert "glyph_style" in script, "Script missing 'glyph_style'"
    
    def test_daily_cipher_has_breath_pattern(self, headers):
        """Daily cipher includes breath pattern info"""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/daily", headers=headers)
        data = response.json()
        assert "breath" in data, "Missing 'breath' field"
        breath = data["breath"]
        assert "pattern" in breath, "Breath missing 'pattern'"
        assert "label" in breath, "Breath missing 'label'"
        assert "hz" in breath, "Breath missing 'hz'"
        assert "mantra" in breath, "Breath missing 'mantra'"
    
    def test_daily_cipher_has_tier_info(self, headers):
        """Daily cipher includes tier information"""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/daily", headers=headers)
        data = response.json()
        assert "tier" in data, "Missing 'tier' field"
        assert "tier_name" in data, "Missing 'tier_name' field"
        assert "harmony" in data, "Missing 'harmony' field"
        assert isinstance(data["tier"], int), "Tier should be integer"
        assert 1 <= data["tier"] <= 5, f"Tier should be 1-5, got {data['tier']}"
    
    def test_daily_cipher_has_glyphs(self, headers):
        """Daily cipher includes glyph array"""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/daily", headers=headers)
        data = response.json()
        assert "glyphs" in data, "Missing 'glyphs' field"
        assert isinstance(data["glyphs"], list), "Glyphs should be a list"
        assert len(data["glyphs"]) >= 3, f"Expected at least 3 glyphs, got {len(data['glyphs'])}"
    
    def test_daily_cipher_glyph_structure(self, headers):
        """Each glyph has required fields"""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/daily", headers=headers)
        data = response.json()
        for glyph in data["glyphs"]:
            assert "id" in glyph, "Glyph missing 'id'"
            assert "name" in glyph, "Glyph missing 'name'"
            assert "element" in glyph, "Glyph missing 'element'"
            assert "difficulty" in glyph, "Glyph missing 'difficulty'"
            assert "geo_seed" in glyph, "Glyph missing 'geo_seed'"
            assert "meaning" in glyph, "Glyph missing 'meaning'"
            assert "phonetic" in glyph, "Glyph missing 'phonetic'"
            assert "decoded" in glyph, "Glyph missing 'decoded'"
    
    def test_daily_cipher_has_rewards_info(self, headers):
        """Daily cipher includes rewards per glyph"""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/daily", headers=headers)
        data = response.json()
        assert "rewards_per_glyph" in data, "Missing 'rewards_per_glyph' field"
        rewards = data["rewards_per_glyph"]
        assert "xp" in rewards, "Rewards missing 'xp'"
        assert "dust" in rewards, "Rewards missing 'dust'"
        assert "modifier" in rewards, "Rewards missing 'modifier'"
    
    def test_daily_cipher_has_progress(self, headers):
        """Daily cipher includes progress counts"""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/daily", headers=headers)
        data = response.json()
        assert "decoded_count" in data, "Missing 'decoded_count'"
        assert "total_glyphs" in data, "Missing 'total_glyphs'"


class TestForgottenLanguagesMastery:
    """Tests for GET /api/forgotten-languages/mastery"""
    
    def test_mastery_returns_200(self, headers):
        """Mastery endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/mastery", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    def test_mastery_has_current_tier(self, headers):
        """Mastery includes current tier info"""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/mastery", headers=headers)
        data = response.json()
        assert "current_tier" in data, "Missing 'current_tier'"
        assert "current_tier_name" in data, "Missing 'current_tier_name'"
        assert "harmony" in data, "Missing 'harmony'"
    
    def test_mastery_has_total_decoded(self, headers):
        """Mastery includes total decoded count"""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/mastery", headers=headers)
        data = response.json()
        assert "total_decoded" in data, "Missing 'total_decoded'"
        assert isinstance(data["total_decoded"], int), "total_decoded should be integer"
    
    def test_mastery_has_by_element(self, headers):
        """Mastery includes per-element breakdown"""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/mastery", headers=headers)
        data = response.json()
        assert "by_element" in data, "Missing 'by_element'"
        assert isinstance(data["by_element"], dict), "by_element should be dict"
    
    def test_mastery_has_modifiers(self, headers):
        """Mastery includes permanent modifiers"""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/mastery", headers=headers)
        data = response.json()
        assert "modifiers" in data, "Missing 'modifiers'"
        assert isinstance(data["modifiers"], dict), "modifiers should be dict"
    
    def test_mastery_has_tiers_list(self, headers):
        """Mastery includes all tiers with unlock status"""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/mastery", headers=headers)
        data = response.json()
        assert "tiers" in data, "Missing 'tiers'"
        assert isinstance(data["tiers"], list), "tiers should be list"
        assert len(data["tiers"]) == 5, f"Expected 5 tiers, got {len(data['tiers'])}"
        
        for tier in data["tiers"]:
            assert "tier" in tier, "Tier missing 'tier'"
            assert "name" in tier, "Tier missing 'name'"
            assert "harmony_required" in tier, "Tier missing 'harmony_required'"
            assert "unlocked" in tier, "Tier missing 'unlocked'"
            assert "current" in tier, "Tier missing 'current'"
    
    def test_mastery_tier_unlock_logic(self, headers):
        """Tiers unlock based on harmony score"""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/mastery", headers=headers)
        data = response.json()
        harmony = data["harmony"]
        
        for tier in data["tiers"]:
            expected_unlocked = harmony >= tier["harmony_required"]
            assert tier["unlocked"] == expected_unlocked, \
                f"Tier {tier['tier']} unlock mismatch: harmony={harmony}, required={tier['harmony_required']}"
    
    def test_mastery_has_scripts(self, headers):
        """Mastery includes script family references"""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/mastery", headers=headers)
        data = response.json()
        assert "scripts" in data, "Missing 'scripts'"
        assert isinstance(data["scripts"], dict), "scripts should be dict"


class TestForgottenLanguagesScripts:
    """Tests for GET /api/forgotten-languages/scripts"""
    
    def test_scripts_returns_200(self, headers):
        """Scripts endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/scripts", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    def test_scripts_has_all_five_elements(self, headers):
        """Scripts includes all 5 elemental script families"""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/scripts", headers=headers)
        data = response.json()
        assert "scripts" in data, "Missing 'scripts'"
        scripts = data["scripts"]
        
        expected_elements = ["wood", "fire", "earth", "metal", "water"]
        for el in expected_elements:
            assert el in scripts, f"Missing script for element: {el}"
    
    def test_scripts_structure(self, headers):
        """Each script has required fields"""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/scripts", headers=headers)
        data = response.json()
        
        for el, script in data["scripts"].items():
            assert "name" in script, f"{el} script missing 'name'"
            assert "origin" in script, f"{el} script missing 'origin'"
            assert "description" in script, f"{el} script missing 'description'"
            assert "color" in script, f"{el} script missing 'color'"
            assert "glyph_style" in script, f"{el} script missing 'glyph_style'"
            assert "breath" in script, f"{el} script missing 'breath'"
    
    def test_scripts_breath_patterns(self, headers):
        """Each script has breath pattern info"""
        response = requests.get(f"{BASE_URL}/api/forgotten-languages/scripts", headers=headers)
        data = response.json()
        
        for el, script in data["scripts"].items():
            breath = script["breath"]
            assert "pattern" in breath, f"{el} breath missing 'pattern'"
            assert "label" in breath, f"{el} breath missing 'label'"
            assert "hz" in breath, f"{el} breath missing 'hz'"
            assert "mantra" in breath, f"{el} breath missing 'mantra'"


class TestForgottenLanguagesDecode:
    """Tests for POST /api/forgotten-languages/decode"""
    
    def test_decode_missing_glyph_id_returns_400(self, headers):
        """Decode without glyph_id returns 400"""
        response = requests.post(f"{BASE_URL}/api/forgotten-languages/decode", 
                                 json={}, headers=headers)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    
    def test_decode_invalid_glyph_id_returns_400(self, headers):
        """Decode with invalid glyph_id returns 400"""
        response = requests.post(f"{BASE_URL}/api/forgotten-languages/decode", 
                                 json={"glyph_id": "invalid_glyph_xyz"}, headers=headers)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    
    def test_decode_valid_glyph_success(self, headers):
        """Decode a valid undecoded glyph succeeds"""
        # First get today's glyphs
        daily_response = requests.get(f"{BASE_URL}/api/forgotten-languages/daily", headers=headers)
        daily_data = daily_response.json()
        
        # Find an undecoded glyph
        undecoded = [g for g in daily_data["glyphs"] if not g["decoded"]]
        
        if not undecoded:
            pytest.skip("All glyphs already decoded today")
        
        glyph = undecoded[0]
        response = requests.post(f"{BASE_URL}/api/forgotten-languages/decode",
                                 json={"glyph_id": glyph["id"]}, headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data["decoded"] == True, "decoded should be True"
        assert "glyph" in data, "Missing 'glyph'"
        assert "rewards" in data, "Missing 'rewards'"
        assert "progress" in data, "Missing 'progress'"
    
    def test_decode_rewards_structure(self, headers):
        """Decode response includes proper rewards structure"""
        daily_response = requests.get(f"{BASE_URL}/api/forgotten-languages/daily", headers=headers)
        daily_data = daily_response.json()
        
        undecoded = [g for g in daily_data["glyphs"] if not g["decoded"]]
        
        if not undecoded:
            pytest.skip("All glyphs already decoded today")
        
        glyph = undecoded[0]
        response = requests.post(f"{BASE_URL}/api/forgotten-languages/decode",
                                 json={"glyph_id": glyph["id"]}, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            rewards = data["rewards"]
            assert "xp" in rewards, "Rewards missing 'xp'"
            assert "dust" in rewards, "Rewards missing 'dust'"
            assert "modifier" in rewards, "Rewards missing 'modifier'"
    
    def test_decode_already_decoded_returns_400(self, headers):
        """Decode an already-decoded glyph returns 400"""
        daily_response = requests.get(f"{BASE_URL}/api/forgotten-languages/daily", headers=headers)
        daily_data = daily_response.json()
        
        # Find a decoded glyph
        decoded = [g for g in daily_data["glyphs"] if g["decoded"]]
        
        if not decoded:
            # Decode one first
            undecoded = [g for g in daily_data["glyphs"] if not g["decoded"]]
            if undecoded:
                requests.post(f"{BASE_URL}/api/forgotten-languages/decode",
                              json={"glyph_id": undecoded[0]["id"]}, headers=headers)
                # Refresh
                daily_response = requests.get(f"{BASE_URL}/api/forgotten-languages/daily", headers=headers)
                daily_data = daily_response.json()
                decoded = [g for g in daily_data["glyphs"] if g["decoded"]]
        
        if not decoded:
            pytest.skip("No decoded glyphs available for test")
        
        glyph = decoded[0]
        response = requests.post(f"{BASE_URL}/api/forgotten-languages/decode",
                                 json={"glyph_id": glyph["id"]}, headers=headers)
        
        assert response.status_code == 400, f"Expected 400 for already decoded, got {response.status_code}"


class TestRegressionGameCore:
    """Regression tests for Game Core endpoints"""
    
    def test_commit_reward_still_works(self, headers):
        """POST /api/game-core/commit-reward still works"""
        response = requests.post(f"{BASE_URL}/api/game-core/commit-reward", 
                                 json={"module_id": "unknown", "xp": 1}, headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["status"] == "committed", "Expected status 'committed'"
    
    def test_game_core_stats_still_works(self, headers):
        """GET /api/game-core/stats still works"""
        response = requests.get(f"{BASE_URL}/api/game-core/stats", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "level" in data, "Missing 'level'"
        assert "currencies" in data, "Missing 'currencies'"
        assert "stats" in data, "Missing 'stats'"


class TestRegressionRockHounding:
    """Regression tests for Rock Hounding endpoints"""
    
    def test_rock_hounding_mine_still_works(self, headers):
        """GET /api/rock-hounding/mine still works"""
        response = requests.get(f"{BASE_URL}/api/rock-hounding/mine", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "biome" in data, "Missing 'biome'"
        assert "depths" in data, "Missing 'depths'"
        assert "energy_info" in data, "Missing 'energy_info'"
    
    def test_rock_hounding_collection_still_works(self, headers):
        """GET /api/rock-hounding/collection still works"""
        response = requests.get(f"{BASE_URL}/api/rock-hounding/collection", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "collection" in data, "Missing 'collection'"
        assert "total_discovered" in data, "Missing 'total_discovered'"


class TestDeficientElementSelection:
    """Test that daily cipher selects deficient element's script"""
    
    def test_daily_element_matches_deficient(self, headers):
        """Daily cipher element should be the deficient element from Nexus"""
        # Get Nexus state
        nexus_response = requests.get(f"{BASE_URL}/api/nexus/state", headers=headers)
        if nexus_response.status_code != 200:
            pytest.skip("Nexus state not available")
        
        nexus_data = nexus_response.json()
        elements = nexus_data.get("elements", {})
        
        # Find deficient element (lowest percentage)
        min_pct = 100
        deficient_el = None
        for eid, edata in elements.items():
            pct = edata.get("percentage", 20)
            if pct < min_pct:
                min_pct = pct
                deficient_el = eid
        
        # Get daily cipher
        daily_response = requests.get(f"{BASE_URL}/api/forgotten-languages/daily", headers=headers)
        daily_data = daily_response.json()
        
        # The daily element should match the deficient element
        # (or earth as fallback if no deficient)
        if deficient_el:
            assert daily_data["element"] == deficient_el, \
                f"Expected deficient element {deficient_el}, got {daily_data['element']}"
