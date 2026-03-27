"""
Iteration 72: Crystals & Stones Encyclopedia, Rock Hounding Game, Quantum Entanglement, Light Theme
Tests for new features added in this iteration.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user (admin)"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "test@test.com",
        "password": "password"
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")

@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}"}


# ─── Crystal Encyclopedia Tests (No Auth Required) ─────────────────────────────

class TestCrystalEncyclopedia:
    """Crystal encyclopedia GET endpoints - no auth required"""
    
    def test_get_all_crystals(self):
        """GET /api/crystals returns 12 crystals with full details"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        
        assert "crystals" in data
        assert "categories" in data
        assert "chakras" in data
        assert "total" in data
        
        # Should have 12 crystals
        assert len(data["crystals"]) == 12
        assert data["total"] == 12
        
        # Verify crystal structure
        crystal = data["crystals"][0]
        required_fields = ["id", "name", "aka", "color", "category", "chakra", 
                          "element", "zodiac", "hardness", "rarity", "description",
                          "spiritual", "healing", "uses"]
        for field in required_fields:
            assert field in crystal, f"Missing field: {field}"
        
        # Verify categories
        expected_categories = ["all", "quartz", "volcanic", "metamorphic", "feldspar", 
                              "phosphate", "gypsum", "carbonate"]
        assert data["categories"] == expected_categories
        print(f"✓ GET /api/crystals returns {len(data['crystals'])} crystals with full details")
    
    def test_filter_by_category_quartz(self):
        """GET /api/crystals?category=quartz filters by category"""
        response = requests.get(f"{BASE_URL}/api/crystals?category=quartz")
        assert response.status_code == 200
        data = response.json()
        
        # All returned crystals should be quartz category
        for crystal in data["crystals"]:
            assert crystal["category"] == "quartz"
        
        # Should have multiple quartz crystals (clear-quartz, amethyst, rose-quartz, citrine, tigers-eye)
        assert len(data["crystals"]) >= 5
        print(f"✓ GET /api/crystals?category=quartz returns {len(data['crystals'])} quartz crystals")
    
    def test_filter_by_search_love(self):
        """GET /api/crystals?search=love filters by search term"""
        response = requests.get(f"{BASE_URL}/api/crystals?search=love")
        assert response.status_code == 200
        data = response.json()
        
        # Should find rose quartz (Stone of Unconditional Love)
        assert len(data["crystals"]) >= 1
        crystal_names = [c["name"] for c in data["crystals"]]
        assert any("Rose" in name or "love" in name.lower() for name in crystal_names) or \
               any("love" in c["aka"].lower() or "love" in c["description"].lower() for c in data["crystals"])
        print(f"✓ GET /api/crystals?search=love returns {len(data['crystals'])} crystals")
    
    def test_get_single_crystal_amethyst(self):
        """GET /api/crystals/amethyst returns single crystal detail"""
        response = requests.get(f"{BASE_URL}/api/crystals/amethyst")
        assert response.status_code == 200
        crystal = response.json()
        
        assert crystal["id"] == "amethyst"
        assert crystal["name"] == "Amethyst"
        assert crystal["aka"] == "Stone of Spirituality"
        assert crystal["category"] == "quartz"
        assert "Third Eye" in crystal["chakra"]
        assert "spiritual" in crystal
        assert "healing" in crystal
        assert "uses" in crystal
        assert isinstance(crystal["uses"], list)
        print(f"✓ GET /api/crystals/amethyst returns full crystal details")
    
    def test_get_nonexistent_crystal_404(self):
        """GET /api/crystals/nonexistent returns 404"""
        response = requests.get(f"{BASE_URL}/api/crystals/nonexistent")
        assert response.status_code == 404
        print(f"✓ GET /api/crystals/nonexistent returns 404")


# ─── Crystal Collection Tests (Auth Required) ─────────────────────────────────

class TestCrystalCollection:
    """Crystal collection endpoints - auth required"""
    
    def test_get_my_collection(self, auth_headers):
        """GET /api/crystals/collection/mine returns user's collection"""
        response = requests.get(f"{BASE_URL}/api/crystals/collection/mine", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "collection" in data
        assert "crystals" in data
        assert "count" in data
        assert isinstance(data["collection"], list)
        print(f"✓ GET /api/crystals/collection/mine returns collection with {data['count']} crystals")
    
    def test_add_crystal_to_collection(self, auth_headers):
        """POST /api/crystals/collection/add adds crystal to collection"""
        # Try to add lapis-lazuli (less likely to be in collection already)
        response = requests.post(
            f"{BASE_URL}/api/crystals/collection/add",
            json={"crystal_id": "lapis-lazuli"},
            headers=auth_headers
        )
        
        # Either 200 (added) or 400 (already in collection)
        assert response.status_code in [200, 400]
        
        if response.status_code == 200:
            data = response.json()
            assert data["crystal_id"] == "lapis-lazuli"
            assert data["crystal_name"] == "Lapis Lazuli"
            assert "id" in data
            assert "added_at" in data
            print(f"✓ POST /api/crystals/collection/add successfully added lapis-lazuli")
        else:
            # Already in collection
            assert "Already in your collection" in response.json().get("detail", "")
            print(f"✓ POST /api/crystals/collection/add correctly rejects duplicate")
    
    def test_add_duplicate_crystal_rejected(self, auth_headers):
        """POST /api/crystals/collection/add rejects duplicates"""
        # First add clear-quartz
        requests.post(
            f"{BASE_URL}/api/crystals/collection/add",
            json={"crystal_id": "clear-quartz"},
            headers=auth_headers
        )
        
        # Try to add again - should fail
        response = requests.post(
            f"{BASE_URL}/api/crystals/collection/add",
            json={"crystal_id": "clear-quartz"},
            headers=auth_headers
        )
        assert response.status_code == 400
        assert "Already in your collection" in response.json().get("detail", "")
        print(f"✓ POST /api/crystals/collection/add rejects duplicate crystal")
    
    def test_add_nonexistent_crystal_404(self, auth_headers):
        """POST /api/crystals/collection/add returns 404 for nonexistent crystal"""
        response = requests.post(
            f"{BASE_URL}/api/crystals/collection/add",
            json={"crystal_id": "fake-crystal"},
            headers=auth_headers
        )
        assert response.status_code == 404
        print(f"✓ POST /api/crystals/collection/add returns 404 for nonexistent crystal")
    
    def test_collection_requires_auth(self):
        """Collection endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/crystals/collection/mine")
        assert response.status_code in [401, 403]
        print(f"✓ GET /api/crystals/collection/mine requires auth")


# ─── Rock Hounding Game Tests (Auth Required) ─────────────────────────────────

class TestRockHounding:
    """Rock Hounding game endpoints - auth required"""
    
    def test_get_environments(self, auth_headers):
        """GET /api/crystals/rockhound/environments returns 4 environments"""
        response = requests.get(f"{BASE_URL}/api/crystals/rockhound/environments", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "environments" in data
        assert len(data["environments"]) == 4
        
        # Verify environment structure
        env_ids = [e["id"] for e in data["environments"]]
        assert "riverbed" in env_ids
        assert "volcanic" in env_ids
        assert "ocean" in env_ids
        assert "mountain" in env_ids
        
        # Verify difficulty levels
        difficulties = {e["id"]: e["difficulty"] for e in data["environments"]}
        assert difficulties["riverbed"] == "easy"
        assert difficulties["volcanic"] == "medium"
        assert difficulties["ocean"] == "medium"
        assert difficulties["mountain"] == "hard"
        
        # Verify each environment has crystals list
        for env in data["environments"]:
            assert "crystals" in env
            assert isinstance(env["crystals"], list)
            assert len(env["crystals"]) >= 3
        
        print(f"✓ GET /api/crystals/rockhound/environments returns 4 environments with correct difficulties")
    
    def test_dig_for_crystal(self, auth_headers):
        """POST /api/crystals/rockhound/dig returns found/not-found result"""
        response = requests.post(
            f"{BASE_URL}/api/crystals/rockhound/dig",
            json={"environment_id": "riverbed"},
            headers=auth_headers
        )
        
        # Either 200 (success) or 429 (daily limit reached)
        assert response.status_code in [200, 429]
        
        if response.status_code == 200:
            data = response.json()
            assert "found" in data
            assert "environment" in data
            assert "digs_remaining" in data
            
            if data["found"]:
                assert "crystal" in data
                assert data["crystal"] is not None
                assert "is_new" in data
                print(f"✓ POST /api/crystals/rockhound/dig found: {data['crystal']['name']}, digs remaining: {data['digs_remaining']}")
            else:
                print(f"✓ POST /api/crystals/rockhound/dig found nothing, digs remaining: {data['digs_remaining']}")
        else:
            # Daily limit reached
            assert "daily digs" in response.json().get("detail", "").lower()
            print(f"✓ POST /api/crystals/rockhound/dig correctly enforces daily limit")
    
    def test_environments_requires_auth(self):
        """Environments endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/crystals/rockhound/environments")
        assert response.status_code in [401, 403]
        print(f"✓ GET /api/crystals/rockhound/environments requires auth")


# ─── Quantum Entanglement Tests (Auth Required) ─────────────────────────────────

class TestQuantumEntanglement:
    """Quantum Entanglement paired meditation endpoints - auth required"""
    
    def test_get_meditations(self, auth_headers):
        """GET /api/entanglement/meditations returns 5 paired meditations"""
        response = requests.get(f"{BASE_URL}/api/entanglement/meditations", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "meditations" in data
        assert len(data["meditations"]) == 5
        
        # Verify meditation IDs
        med_ids = [m["id"] for m in data["meditations"]]
        expected_ids = ["heart-sync", "third-eye-link", "root-ground", "crown-ascend", "aura-merge"]
        for expected in expected_ids:
            assert expected in med_ids, f"Missing meditation: {expected}"
        
        # Verify meditation structure
        for med in data["meditations"]:
            assert "id" in med
            assert "name" in med
            assert "duration" in med
            assert "description" in med
            assert "chakra" in med
            assert "color" in med
        
        print(f"✓ GET /api/entanglement/meditations returns 5 paired meditations")
    
    def test_create_entanglement_invite(self, auth_headers):
        """POST /api/entanglement/invite creates an entanglement session"""
        response = requests.post(
            f"{BASE_URL}/api/entanglement/invite",
            json={"meditation_id": "heart-sync"},
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "id" in data
        assert data["meditation_id"] == "heart-sync"
        assert data["meditation_name"] == "Heart Synchronization"
        assert data["status"] == "waiting"
        assert data["partner_id"] is None
        assert "created_at" in data
        print(f"✓ POST /api/entanglement/invite creates session with id: {data['id']}")
    
    def test_get_open_sessions(self, auth_headers):
        """GET /api/entanglement/open-sessions returns waiting sessions"""
        response = requests.get(f"{BASE_URL}/api/entanglement/open-sessions", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "sessions" in data
        assert isinstance(data["sessions"], list)
        
        # All returned sessions should be waiting and not from current user
        for session in data["sessions"]:
            assert session["status"] == "waiting"
        
        print(f"✓ GET /api/entanglement/open-sessions returns {len(data['sessions'])} open sessions")
    
    def test_get_my_sessions(self, auth_headers):
        """GET /api/entanglement/my-sessions returns user's session history"""
        response = requests.get(f"{BASE_URL}/api/entanglement/my-sessions", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "sessions" in data
        assert "stats" in data
        assert isinstance(data["sessions"], list)
        
        # Verify stats structure
        assert "total" in data["stats"]
        assert "completed" in data["stats"]
        assert "waiting" in data["stats"]
        assert "active" in data["stats"]
        
        print(f"✓ GET /api/entanglement/my-sessions returns {data['stats']['total']} sessions")
    
    def test_entanglement_requires_auth(self):
        """Entanglement endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/entanglement/meditations")
        assert response.status_code in [401, 403]
        print(f"✓ GET /api/entanglement/meditations requires auth")
    
    def test_create_invalid_meditation_fails(self, auth_headers):
        """POST /api/entanglement/invite with invalid meditation fails"""
        response = requests.post(
            f"{BASE_URL}/api/entanglement/invite",
            json={"meditation_id": "invalid-meditation"},
            headers=auth_headers
        )
        assert response.status_code == 400
        print(f"✓ POST /api/entanglement/invite rejects invalid meditation")


# ─── Regression Tests for Existing Features ─────────────────────────────────

class TestRegressionExistingFeatures:
    """Verify existing endpoints still work"""
    
    def test_health_endpoint(self):
        """GET /api/health returns 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print(f"✓ GET /api/health returns 200")
    
    def test_auth_login(self):
        """POST /api/auth/login works"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        print(f"✓ POST /api/auth/login works")
    
    def test_star_chart_cultures(self, auth_headers):
        """GET /api/star-chart/cultures returns cultures"""
        response = requests.get(f"{BASE_URL}/api/star-chart/cultures", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "cultures" in data
        assert len(data["cultures"]) >= 8
        print(f"✓ GET /api/star-chart/cultures returns {len(data['cultures'])} cultures")
    
    def test_trade_circle_stats(self, auth_headers):
        """GET /api/trade-circle/stats returns stats"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/stats", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "karma" in data or "stats" in data or "total_trades" in data
        print(f"✓ GET /api/trade-circle/stats works")
    
    def test_subscriptions_my_plan(self, auth_headers):
        """GET /api/subscriptions/my-plan returns plan"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/my-plan", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "tier" in data
        print(f"✓ GET /api/subscriptions/my-plan returns tier: {data['tier']}")
    
    def test_subscriptions_tiers(self, auth_headers):
        """GET /api/subscriptions/tiers returns all tiers"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/tiers", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "tiers" in data
        assert len(data["tiers"]) == 5
        print(f"✓ GET /api/subscriptions/tiers returns 5 tiers")
    
    def test_achievements(self, auth_headers):
        """GET /api/achievements returns achievements"""
        response = requests.get(f"{BASE_URL}/api/achievements", headers=auth_headers)
        assert response.status_code == 200
        print(f"✓ GET /api/achievements works")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
