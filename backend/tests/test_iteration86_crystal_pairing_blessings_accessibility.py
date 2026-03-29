"""
Iteration 86: Test Crystal Pairing AI, Enhanced Blessings, Accessibility Settings, Star Cultures JSON Refactor
Focus: New features from backlog - Crystal Pairing AI, Enhanced Blessings (AI, stats, tabs), Accessibility Settings, Star Cultures JSON
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture(scope="module")
def auth_token(api_client):
    """Get authentication token for test user"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": "test@test.com",
        "password": "password"
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")

@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


# ═══════════════════════════════════════════════════════════════════════════════
# CRYSTAL PAIRING AI TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class TestCrystalPairingOptions:
    """Test GET /api/crystals/pairing/options - returns moods and intentions lists"""
    
    def test_pairing_options_returns_moods(self, api_client):
        """Verify pairing options endpoint returns moods list"""
        response = api_client.get(f"{BASE_URL}/api/crystals/pairing/options")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "moods" in data, "Response should contain 'moods' key"
        assert isinstance(data["moods"], list), "Moods should be a list"
        assert len(data["moods"]) >= 10, f"Expected at least 10 moods, got {len(data['moods'])}"
        # Verify expected moods
        expected_moods = ["Stressed", "Anxious", "Sad", "Tired", "Angry", "Confused"]
        for mood in expected_moods:
            assert mood in data["moods"], f"Expected mood '{mood}' not found"
        print(f"✓ Pairing options returns {len(data['moods'])} moods")
    
    def test_pairing_options_returns_intentions(self, api_client):
        """Verify pairing options endpoint returns intentions list"""
        response = api_client.get(f"{BASE_URL}/api/crystals/pairing/options")
        assert response.status_code == 200
        data = response.json()
        assert "intentions" in data, "Response should contain 'intentions' key"
        assert isinstance(data["intentions"], list), "Intentions should be a list"
        assert len(data["intentions"]) >= 10, f"Expected at least 10 intentions, got {len(data['intentions'])}"
        # Verify expected intentions
        expected_intentions = ["Love", "Protection", "Wisdom", "Abundance", "Healing", "Intuition"]
        for intention in expected_intentions:
            assert intention in data["intentions"], f"Expected intention '{intention}' not found"
        print(f"✓ Pairing options returns {len(data['intentions'])} intentions")


class TestCrystalPairingAI:
    """Test POST /api/crystals/pairing - AI crystal pairing with mood/intention (requires auth)"""
    
    def test_pairing_requires_auth(self, api_client):
        """Verify pairing endpoint requires authentication"""
        response = api_client.post(f"{BASE_URL}/api/crystals/pairing", json={
            "mood": "Stressed",
            "intention": "Peace"
        })
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print("✓ Crystal pairing requires authentication")
    
    def test_pairing_with_mood_and_intention(self, api_client, auth_headers):
        """Test AI crystal pairing with mood and intention"""
        response = api_client.post(f"{BASE_URL}/api/crystals/pairing", json={
            "mood": "Stressed",
            "intention": "Peace"
        }, headers=auth_headers, timeout=60)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Verify response structure
        assert "crystals" in data, "Response should contain 'crystals'"
        assert "explanation" in data, "Response should contain 'explanation'"
        assert isinstance(data["crystals"], list), "Crystals should be a list"
        assert len(data["crystals"]) >= 1, "Should return at least 1 crystal"
        # Verify crystal structure
        for crystal in data["crystals"]:
            assert "id" in crystal, "Crystal should have 'id'"
            assert "name" in crystal, "Crystal should have 'name'"
        print(f"✓ Crystal pairing returned {len(data['crystals'])} crystals with AI explanation")


class TestCrystalPairingHistory:
    """Test GET /api/crystals/pairing/history - user's pairing history (requires auth)"""
    
    def test_history_requires_auth(self, api_client):
        """Verify history endpoint requires authentication"""
        response = api_client.get(f"{BASE_URL}/api/crystals/pairing/history")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print("✓ Pairing history requires authentication")
    
    def test_history_returns_pairings(self, api_client, auth_headers):
        """Test pairing history returns user's pairings"""
        response = api_client.get(f"{BASE_URL}/api/crystals/pairing/history", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "pairings" in data, "Response should contain 'pairings'"
        assert isinstance(data["pairings"], list), "Pairings should be a list"
        print(f"✓ Pairing history returns {len(data['pairings'])} pairings")


# ═══════════════════════════════════════════════════════════════════════════════
# ENHANCED BLESSINGS TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class TestBlessingTemplates:
    """Test GET /api/blessings/templates - returns 12 blessing templates"""
    
    def test_templates_returns_12(self, api_client):
        """Verify templates endpoint returns 12 blessing templates"""
        response = api_client.get(f"{BASE_URL}/api/blessings/templates")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 12, f"Expected 12 templates, got {len(data)}"
        # Verify template structure
        for template in data:
            assert "id" in template, "Template should have 'id'"
            assert "category" in template, "Template should have 'category'"
            assert "text" in template, "Template should have 'text'"
            assert "color" in template, "Template should have 'color'"
        # Verify expected categories
        categories = [t["category"] for t in data]
        expected = ["Peace", "Healing", "Protection", "Abundance", "Strength", "Love"]
        for cat in expected:
            assert cat in categories, f"Expected category '{cat}' not found"
        print(f"✓ Blessing templates returns 12 templates with categories: {categories}")


class TestBlessingSend:
    """Test POST /api/blessings/send - send a blessing (requires auth)"""
    
    def test_send_requires_auth(self, api_client):
        """Verify send endpoint requires authentication"""
        response = api_client.post(f"{BASE_URL}/api/blessings/send", json={
            "template_id": "peace",
            "to_name": "Test User"
        })
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print("✓ Blessing send requires authentication")
    
    def test_send_blessing_with_template(self, api_client, auth_headers):
        """Test sending a blessing with template"""
        response = api_client.post(f"{BASE_URL}/api/blessings/send", json={
            "template_id": "peace",
            "to_name": "TEST_Blessing_Recipient",
            "custom_message": "Test blessing message"
        }, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "status" in data, "Response should contain 'status'"
        assert data["status"] == "sent", f"Expected status 'sent', got {data['status']}"
        assert "blessing" in data, "Response should contain 'blessing'"
        print("✓ Blessing sent successfully with template")


class TestBlessingAIGenerate:
    """Test POST /api/blessings/generate - AI-generated custom blessing (requires auth)"""
    
    def test_generate_requires_auth(self, api_client):
        """Verify generate endpoint requires authentication"""
        response = api_client.post(f"{BASE_URL}/api/blessings/generate", json={
            "category": "peace",
            "to_name": "Test User"
        })
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print("✓ AI blessing generate requires authentication")
    
    def test_generate_ai_blessing(self, api_client, auth_headers):
        """Test AI-generated blessing"""
        response = api_client.post(f"{BASE_URL}/api/blessings/generate", json={
            "category": "healing",
            "to_name": "Test Friend",
            "context": "recovering from illness"
        }, headers=auth_headers, timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "blessing_text" in data, "Response should contain 'blessing_text'"
        assert len(data["blessing_text"]) > 20, "Blessing text should be substantial"
        assert "category" in data, "Response should contain 'category'"
        print(f"✓ AI blessing generated: {data['blessing_text'][:50]}...")


class TestBlessingFeed:
    """Test GET /api/blessings/feed - public blessing feed"""
    
    def test_feed_is_public(self, api_client):
        """Verify feed endpoint is public (no auth required)"""
        response = api_client.get(f"{BASE_URL}/api/blessings/feed")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ Blessing feed is public, returns {len(data)} blessings")


class TestBlessingMySent:
    """Test GET /api/blessings/my-sent - user's sent blessings (requires auth)"""
    
    def test_my_sent_requires_auth(self, api_client):
        """Verify my-sent endpoint requires authentication"""
        response = api_client.get(f"{BASE_URL}/api/blessings/my-sent")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print("✓ My-sent blessings requires authentication")
    
    def test_my_sent_returns_blessings(self, api_client, auth_headers):
        """Test my-sent returns user's sent blessings"""
        response = api_client.get(f"{BASE_URL}/api/blessings/my-sent", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "blessings" in data, "Response should contain 'blessings'"
        assert "count" in data, "Response should contain 'count'"
        assert isinstance(data["blessings"], list), "Blessings should be a list"
        print(f"✓ My-sent returns {data['count']} sent blessings")


class TestBlessingMyReceived:
    """Test GET /api/blessings/my-received - user's received blessings (requires auth)"""
    
    def test_my_received_requires_auth(self, api_client):
        """Verify my-received endpoint requires authentication"""
        response = api_client.get(f"{BASE_URL}/api/blessings/my-received")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print("✓ My-received blessings requires authentication")
    
    def test_my_received_returns_blessings(self, api_client, auth_headers):
        """Test my-received returns user's received blessings"""
        response = api_client.get(f"{BASE_URL}/api/blessings/my-received", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "blessings" in data, "Response should contain 'blessings'"
        assert "count" in data, "Response should contain 'count'"
        assert isinstance(data["blessings"], list), "Blessings should be a list"
        print(f"✓ My-received returns {data['count']} received blessings")


class TestBlessingStats:
    """Test GET /api/blessings/stats - user blessing stats (requires auth)"""
    
    def test_stats_requires_auth(self, api_client):
        """Verify stats endpoint requires authentication"""
        response = api_client.get(f"{BASE_URL}/api/blessings/stats")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print("✓ Blessing stats requires authentication")
    
    def test_stats_returns_counts(self, api_client, auth_headers):
        """Test stats returns sent, received, and community counts"""
        response = api_client.get(f"{BASE_URL}/api/blessings/stats", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "sent" in data, "Response should contain 'sent'"
        assert "received" in data, "Response should contain 'received'"
        assert "community_total" in data, "Response should contain 'community_total'"
        assert isinstance(data["sent"], int), "Sent should be an integer"
        assert isinstance(data["received"], int), "Received should be an integer"
        assert isinstance(data["community_total"], int), "Community total should be an integer"
        print(f"✓ Blessing stats: sent={data['sent']}, received={data['received']}, community={data['community_total']}")


# ═══════════════════════════════════════════════════════════════════════════════
# STAR CULTURES JSON REFACTOR TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class TestStarCulturesRefactored:
    """Test GET /api/star-chart/cultures - returns 20 cultures (refactored from JSON)"""
    
    def test_cultures_returns_20(self, api_client):
        """Verify cultures endpoint returns 20 cultures"""
        response = api_client.get(f"{BASE_URL}/api/star-chart/cultures")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "cultures" in data, "Response should contain 'cultures'"
        assert isinstance(data["cultures"], list), "Cultures should be a list"
        assert len(data["cultures"]) == 20, f"Expected 20 cultures, got {len(data['cultures'])}"
        # Verify culture structure
        for culture in data["cultures"]:
            assert "id" in culture, "Culture should have 'id'"
            assert "name" in culture, "Culture should have 'name'"
            assert "color" in culture, "Culture should have 'color'"
            assert "description" in culture, "Culture should have 'description'"
            assert "constellation_count" in culture, "Culture should have 'constellation_count'"
        culture_ids = [c["id"] for c in data["cultures"]]
        print(f"✓ Star cultures returns 20 cultures: {culture_ids}")
    
    def test_mayan_culture_detail(self, api_client):
        """Test GET /api/star-chart/cultures/mayan - returns Mayan culture constellation data"""
        response = api_client.get(f"{BASE_URL}/api/star-chart/cultures/mayan")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "id" in data, "Response should contain 'id'"
        assert data["id"] == "mayan", f"Expected id 'mayan', got {data['id']}"
        assert "name" in data, "Response should contain 'name'"
        assert data["name"] == "Mayan Sky", f"Expected name 'Mayan Sky', got {data['name']}"
        assert "constellations" in data, "Response should contain 'constellations'"
        assert isinstance(data["constellations"], list), "Constellations should be a list"
        assert len(data["constellations"]) >= 3, f"Expected at least 3 constellations, got {len(data['constellations'])}"
        # Verify constellation structure
        for const in data["constellations"]:
            assert "id" in const, "Constellation should have 'id'"
            assert "name" in const, "Constellation should have 'name'"
            assert "stars" in const, "Constellation should have 'stars'"
            assert "mythology" in const, "Constellation should have 'mythology'"
        print(f"✓ Mayan culture returns {len(data['constellations'])} constellations")
    
    def test_culture_not_found(self, api_client):
        """Test 404 for non-existent culture"""
        response = api_client.get(f"{BASE_URL}/api/star-chart/cultures/nonexistent")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Non-existent culture returns 404")


# ═══════════════════════════════════════════════════════════════════════════════
# CRYSTAL PAIRING NARRATION TEST
# ═══════════════════════════════════════════════════════════════════════════════

class TestCrystalPairingNarrate:
    """Test POST /api/crystals/pairing/narrate - TTS narration of pairing explanation (requires auth)"""
    
    def test_narrate_requires_auth(self, api_client):
        """Verify narrate endpoint requires authentication"""
        response = api_client.post(f"{BASE_URL}/api/crystals/pairing/narrate", json={
            "text": "Test narration text"
        })
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print("✓ Pairing narrate requires authentication")
    
    def test_narrate_requires_text(self, api_client, auth_headers):
        """Verify narrate endpoint requires text"""
        response = api_client.post(f"{BASE_URL}/api/crystals/pairing/narrate", json={
            "text": ""
        }, headers=auth_headers)
        assert response.status_code == 400, f"Expected 400 for empty text, got {response.status_code}"
        print("✓ Pairing narrate validates text input")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
