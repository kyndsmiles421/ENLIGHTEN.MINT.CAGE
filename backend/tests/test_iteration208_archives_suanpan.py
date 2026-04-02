"""
Iteration 208 Tests: Phase 2 Expansion - Archives (Trinity View, StrokeTracer) + Suanpan Mixer
Tests:
- Archives entries API (6 entries with scripts_preview, frequency, unlocked status)
- Individual archive entry retrieval (om-vedic, dao-chinese, qi-chinese)
- Tier-based locking (qi-chinese requires synthesizer tier)
- Stroke tracing with accuracy-based unlocking
- Comparative linguistics API
- Regression: gravity endpoints, weather, hub preferences
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestArchivesAPI:
    """Test Deep-Dive Archives endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if login_resp.status_code == 200:
            self.token = login_resp.json().get("token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Login failed - skipping authenticated tests")
    
    def test_get_archive_entries(self):
        """GET /api/archives/entries - returns 6 entries with required fields"""
        resp = requests.get(f"{BASE_URL}/api/archives/entries", headers=self.headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        data = resp.json()
        assert "entries" in data, "Response should have 'entries' key"
        entries = data["entries"]
        assert len(entries) == 6, f"Expected 6 entries, got {len(entries)}"
        
        # Verify entry structure
        for entry in entries:
            assert "id" in entry, "Entry should have 'id'"
            assert "title" in entry, "Entry should have 'title'"
            assert "category" in entry, "Entry should have 'category'"
            assert "scripts_preview" in entry, "Entry should have 'scripts_preview'"
            assert "frequency" in entry, "Entry should have 'frequency'"
            assert "unlocked" in entry, "Entry should have 'unlocked'"
            assert "tier_required" in entry, "Entry should have 'tier_required'"
        
        # Verify expected entry IDs
        entry_ids = [e["id"] for e in entries]
        expected_ids = ["om-vedic", "dao-chinese", "qi-chinese", "aleph-aramaic", "ankh-egyptian", "iching-hexagram"]
        for eid in expected_ids:
            assert eid in entry_ids, f"Expected entry '{eid}' not found"
        
        # Verify current_tier is returned
        assert "current_tier" in data, "Response should have 'current_tier'"
        print(f"PASS: GET /api/archives/entries - {len(entries)} entries, tier={data['current_tier']}")
    
    def test_get_om_vedic_entry(self):
        """GET /api/archives/entry/om-vedic - returns full entry with scripts, trinity, strokes"""
        resp = requests.get(f"{BASE_URL}/api/archives/entry/om-vedic", headers=self.headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        data = resp.json()
        assert data.get("id") == "om-vedic", "Entry ID should be 'om-vedic'"
        assert data.get("title") == "The Sacred Om", "Title should be 'The Sacred Om'"
        assert data.get("locked") == False, "om-vedic should be unlocked for observer tier"
        
        # Verify scripts structure
        scripts = data.get("scripts", {})
        assert "sanskrit" in scripts, "Should have Sanskrit script"
        assert "chinese" in scripts, "Should have Chinese script"
        
        # Verify Sanskrit script has characters with strokes
        sanskrit = scripts["sanskrit"]
        assert "original" in sanskrit, "Sanskrit should have 'original'"
        assert "characters" in sanskrit, "Sanskrit should have 'characters'"
        chars = sanskrit["characters"]
        assert len(chars) > 0, "Should have at least one character"
        assert "strokes" in chars[0], "Character should have 'strokes'"
        assert "frequency" in chars[0], "Character should have 'frequency'"
        
        # Verify trinity structure
        trinity = data.get("trinity", {})
        assert "origin" in trinity, "Trinity should have 'origin'"
        assert "synthesis" in trinity, "Trinity should have 'synthesis'"
        assert "frequency" in trinity, "Trinity should have 'frequency'"
        
        # Verify frequency data
        freq = trinity["frequency"]
        assert freq.get("hz") == 136.1, "Om frequency should be 136.1Hz"
        assert "solfeggio_nearest" in freq, "Should have solfeggio_nearest"
        assert "chakra" in freq, "Should have chakra"
        assert "element" in freq, "Should have element"
        
        print(f"PASS: GET /api/archives/entry/om-vedic - full entry with trinity layers")
    
    def test_get_dao_chinese_entry(self):
        """GET /api/archives/entry/dao-chinese - returns Chinese Dao entry with evolution array"""
        resp = requests.get(f"{BASE_URL}/api/archives/entry/dao-chinese", headers=self.headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        data = resp.json()
        assert data.get("id") == "dao-chinese", "Entry ID should be 'dao-chinese'"
        assert data.get("locked") == False, "dao-chinese should be unlocked for observer tier"
        
        # Verify Chinese script has evolution array
        scripts = data.get("scripts", {})
        chinese = scripts.get("chinese", {})
        assert "evolution" in chinese, "Chinese script should have 'evolution' array"
        evolution = chinese["evolution"]
        assert len(evolution) >= 4, f"Evolution should have at least 4 stages, got {len(evolution)}"
        assert "Oracle Bone" in evolution[0], "First evolution stage should mention Oracle Bone"
        assert "Modern" in evolution[-1], "Last evolution stage should be Modern"
        
        print(f"PASS: GET /api/archives/entry/dao-chinese - evolution array: {evolution}")
    
    def test_get_qi_chinese_locked(self):
        """GET /api/archives/entry/qi-chinese - returns locked for observer user"""
        resp = requests.get(f"{BASE_URL}/api/archives/entry/qi-chinese", headers=self.headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        data = resp.json()
        assert data.get("id") == "qi-chinese", "Entry ID should be 'qi-chinese'"
        assert data.get("locked") == True, "qi-chinese should be locked for observer tier"
        assert "locked_reason" in data, "Should have locked_reason"
        assert "synthesizer" in data.get("locked_reason", "").lower(), "Locked reason should mention synthesizer tier"
        
        print(f"PASS: GET /api/archives/entry/qi-chinese - locked: {data.get('locked_reason')}")
    
    def test_trace_character_high_accuracy(self):
        """POST /api/archives/trace with accuracy>=70 - unlocks character"""
        resp = requests.post(f"{BASE_URL}/api/archives/trace", headers=self.headers, json={
            "entry_id": "om-vedic",
            "language": "sanskrit",
            "char_index": 0,
            "accuracy": 85
        })
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        data = resp.json()
        assert data.get("unlocked") == True, "Should be unlocked with accuracy >= 70"
        assert data.get("accuracy") == 85, "Accuracy should be 85"
        assert "frequency" in data, "Should return frequency"
        assert data.get("frequency") == 136.1, "Om frequency should be 136.1Hz"
        assert "character_id" in data, "Should return character_id"
        
        print(f"PASS: POST /api/archives/trace (accuracy=85) - unlocked, freq={data.get('frequency')}Hz")
    
    def test_trace_character_low_accuracy(self):
        """POST /api/archives/trace with accuracy<70 - does not unlock"""
        resp = requests.post(f"{BASE_URL}/api/archives/trace", headers=self.headers, json={
            "entry_id": "dao-chinese",
            "language": "chinese",
            "char_index": 0,
            "accuracy": 55
        })
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        data = resp.json()
        assert data.get("unlocked") == False, "Should NOT be unlocked with accuracy < 70"
        assert data.get("accuracy") == 55, "Accuracy should be 55"
        assert "practicing" in data.get("message", "").lower(), "Message should mention practicing"
        
        print(f"PASS: POST /api/archives/trace (accuracy=55) - not unlocked, message: {data.get('message')}")
    
    def test_get_linguistics_concepts(self):
        """GET /api/archives/linguistics - returns 3 concepts with language counts"""
        resp = requests.get(f"{BASE_URL}/api/archives/linguistics", headers=self.headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        data = resp.json()
        assert "concepts" in data, "Response should have 'concepts'"
        concepts = data["concepts"]
        assert len(concepts) == 3, f"Expected 3 concepts, got {len(concepts)}"
        
        concept_ids = [c["id"] for c in concepts]
        assert "spirit" in concept_ids, "Should have 'spirit' concept"
        assert "energy" in concept_ids, "Should have 'energy' concept"
        assert "truth" in concept_ids, "Should have 'truth' concept"
        
        for c in concepts:
            assert "language_count" in c, "Concept should have 'language_count'"
            assert c["language_count"] >= 5, f"Concept should have at least 5 languages"
        
        print(f"PASS: GET /api/archives/linguistics - {len(concepts)} concepts")
    
    def test_get_linguistics_spirit(self):
        """GET /api/archives/linguistics/spirit - returns 7 languages with word, transliteration, frequency"""
        resp = requests.get(f"{BASE_URL}/api/archives/linguistics/spirit", headers=self.headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        data = resp.json()
        assert "concept" in data, "Response should have 'concept'"
        assert data["concept"] == "Spirit / Life Force", "Concept should be 'Spirit / Life Force'"
        
        languages = data.get("languages", {})
        assert len(languages) == 7, f"Expected 7 languages, got {len(languages)}"
        
        expected_langs = ["sanskrit", "chinese", "aramaic", "hebrew", "egyptian", "greek", "hopi"]
        for lang in expected_langs:
            assert lang in languages, f"Should have '{lang}' language"
            lang_data = languages[lang]
            assert "word" in lang_data, f"{lang} should have 'word'"
            assert "transliteration" in lang_data, f"{lang} should have 'transliteration'"
            assert "frequency" in lang_data, f"{lang} should have 'frequency'"
        
        print(f"PASS: GET /api/archives/linguistics/spirit - {len(languages)} languages")


class TestRegressionGravityWeather:
    """Regression tests for gravity endpoints, weather, hub preferences"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "grad_test_522@test.com",
            "password": "password"
        })
        if login_resp.status_code == 200:
            self.token = login_resp.json().get("token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Login failed - skipping authenticated tests")
    
    def test_gravity_nodes(self):
        """GET /api/gravity/nodes - regression test"""
        resp = requests.get(f"{BASE_URL}/api/gravity/nodes", headers=self.headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        data = resp.json()
        assert "nodes" in data, "Response should have 'nodes'"
        assert len(data["nodes"]) >= 10, f"Expected at least 10 nodes, got {len(data['nodes'])}"
        
        print(f"PASS: GET /api/gravity/nodes - {len(data['nodes'])} nodes")
    
    def test_gravity_field(self):
        """GET /api/gravity/field - regression test"""
        resp = requests.get(f"{BASE_URL}/api/gravity/field", headers=self.headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        data = resp.json()
        assert "field_resolution" in data, "Response should have 'field_resolution'"
        assert "damping_base" in data, "Response should have 'damping_base'"
        assert "mass_scale" in data, "Response should have 'mass_scale'"
        
        print(f"PASS: GET /api/gravity/field - resolution={data['field_resolution']}")
    
    def test_gravity_interact(self):
        """POST /api/gravity/interact - regression test"""
        resp = requests.post(f"{BASE_URL}/api/gravity/interact", headers=self.headers, json={
            "node_id": "om-vedic",
            "dwell_seconds": 5
        })
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        data = resp.json()
        assert "node_id" in data, "Response should have 'node_id'"
        assert "interaction_count" in data, "Response should have 'interaction_count'"
        
        print(f"PASS: POST /api/gravity/interact - count={data['interaction_count']}")
    
    def test_weather_current(self):
        """GET /api/weather/current - regression test"""
        resp = requests.get(f"{BASE_URL}/api/weather/current", headers=self.headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        data = resp.json()
        # Weather may have fallback data
        assert "category" in data or "fallback" in data, "Response should have weather data"
        
        print(f"PASS: GET /api/weather/current - category={data.get('category', 'fallback')}")
    
    def test_hub_preferences(self):
        """GET /api/hub/preferences - regression test"""
        resp = requests.get(f"{BASE_URL}/api/hub/preferences", headers=self.headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        data = resp.json()
        assert "active_satellites" in data, "Response should have 'active_satellites'"
        
        print(f"PASS: GET /api/hub/preferences - {len(data['active_satellites'])} active satellites")


class TestAuthRequired:
    """Test that archives endpoints require authentication"""
    
    def test_archives_entries_no_auth(self):
        """GET /api/archives/entries without auth - should return 401/403"""
        resp = requests.get(f"{BASE_URL}/api/archives/entries")
        assert resp.status_code in [401, 403], f"Expected 401/403, got {resp.status_code}"
        print(f"PASS: GET /api/archives/entries without auth - {resp.status_code}")
    
    def test_archives_entry_no_auth(self):
        """GET /api/archives/entry/om-vedic without auth - should return 401/403"""
        resp = requests.get(f"{BASE_URL}/api/archives/entry/om-vedic")
        assert resp.status_code in [401, 403], f"Expected 401/403, got {resp.status_code}"
        print(f"PASS: GET /api/archives/entry/om-vedic without auth - {resp.status_code}")
    
    def test_archives_trace_no_auth(self):
        """POST /api/archives/trace without auth - should return 401/403"""
        resp = requests.post(f"{BASE_URL}/api/archives/trace", json={
            "entry_id": "om-vedic",
            "language": "sanskrit",
            "char_index": 0,
            "accuracy": 85
        })
        assert resp.status_code in [401, 403], f"Expected 401/403, got {resp.status_code}"
        print(f"PASS: POST /api/archives/trace without auth - {resp.status_code}")
    
    def test_archives_linguistics_no_auth(self):
        """GET /api/archives/linguistics without auth - should return 401/403"""
        resp = requests.get(f"{BASE_URL}/api/archives/linguistics")
        assert resp.status_code in [401, 403], f"Expected 401/403, got {resp.status_code}"
        print(f"PASS: GET /api/archives/linguistics without auth - {resp.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
