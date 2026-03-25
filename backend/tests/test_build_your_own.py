"""
Test suite for Build Your Own features:
- Custom Breathing Patterns (save, list, delete)
- Custom Affirmation Sets (generate, save, list, delete)
- Custom Soundscape Mixes (save, list, delete)
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "buildtest@test.com"
TEST_PASSWORD = "password123"
TEST_NAME = "Build Test User"


class TestAuthSetup:
    """Authentication setup for testing"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get or create test user and return auth token"""
        # Try login first
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if login_res.status_code == 200:
            return login_res.json()["token"]
        
        # Register if login fails
        register_res = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": TEST_NAME,
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if register_res.status_code == 200:
            return register_res.json()["token"]
        elif register_res.status_code == 400:  # Already registered
            login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            })
            assert login_res.status_code == 200, f"Login failed: {login_res.text}"
            return login_res.json()["token"]
        
        pytest.fail(f"Could not authenticate: {register_res.text}")
    
    def test_health_check(self):
        """Verify API is running"""
        res = requests.get(f"{BASE_URL}/api/health")
        assert res.status_code == 200
        print("✓ Health check passed")


class TestCustomBreathing:
    """Tests for Custom Breathing Patterns feature"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token for breathing tests"""
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if login_res.status_code == 200:
            return login_res.json()["token"]
        
        register_res = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": TEST_NAME,
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if register_res.status_code == 200:
            return register_res.json()["token"]
        
        # Try login again after register attempt
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return login_res.json()["token"]
    
    def test_save_custom_breathing_unauthorized(self):
        """POST /api/breathing/save-custom requires auth"""
        res = requests.post(f"{BASE_URL}/api/breathing/save-custom", json={
            "name": "Test Pattern",
            "inhale": 4,
            "hold1": 4,
            "exhale": 4,
            "hold2": 0
        })
        assert res.status_code == 401
        print("✓ Unauthorized save breathing returns 401")
    
    def test_get_custom_breathing_unauthorized(self):
        """GET /api/breathing/my-custom requires auth"""
        res = requests.get(f"{BASE_URL}/api/breathing/my-custom")
        assert res.status_code == 401
        print("✓ Unauthorized get breathing returns 401")
    
    def test_save_custom_breathing(self, auth_token):
        """POST /api/breathing/save-custom - save a custom pattern"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        res = requests.post(f"{BASE_URL}/api/breathing/save-custom", json={
            "name": "TEST_My Calm Pattern",
            "inhale": 5,
            "hold1": 3,
            "exhale": 6,
            "hold2": 2,
            "color": "#D8B4FE",
            "description": "A calming pattern for stress relief"
        }, headers=headers)
        
        assert res.status_code == 200, f"Save failed: {res.text}"
        data = res.json()
        assert "id" in data
        assert data["name"] == "TEST_My Calm Pattern"
        assert data["inhale"] == 5
        assert data["hold1"] == 3
        assert data["exhale"] == 6
        assert data["hold2"] == 2
        assert data["color"] == "#D8B4FE"
        assert data["description"] == "A calming pattern for stress relief"
        print(f"✓ Saved custom breathing pattern: {data['id']}")
        return data["id"]
    
    def test_get_custom_breathing(self, auth_token):
        """GET /api/breathing/my-custom - list saved patterns"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        res = requests.get(f"{BASE_URL}/api/breathing/my-custom", headers=headers)
        
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)
        print(f"✓ Retrieved {len(data)} custom breathing patterns")
        
        # Verify structure of returned patterns
        if len(data) > 0:
            pattern = data[0]
            assert "id" in pattern
            assert "name" in pattern
            assert "inhale" in pattern
            assert "exhale" in pattern
    
    def test_delete_custom_breathing(self, auth_token):
        """DELETE /api/breathing/custom/{id} - delete a pattern"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # First create a pattern to delete
        create_res = requests.post(f"{BASE_URL}/api/breathing/save-custom", json={
            "name": "TEST_To Delete",
            "inhale": 4,
            "hold1": 4,
            "exhale": 4,
            "hold2": 0
        }, headers=headers)
        assert create_res.status_code == 200
        pattern_id = create_res.json()["id"]
        
        # Delete it
        delete_res = requests.delete(f"{BASE_URL}/api/breathing/custom/{pattern_id}", headers=headers)
        assert delete_res.status_code == 200
        assert delete_res.json()["deleted"] == True
        print(f"✓ Deleted custom breathing pattern: {pattern_id}")
        
        # Verify it's gone
        get_res = requests.get(f"{BASE_URL}/api/breathing/my-custom", headers=headers)
        patterns = get_res.json()
        assert not any(p["id"] == pattern_id for p in patterns)
        print("✓ Verified pattern no longer exists")
    
    def test_delete_nonexistent_breathing(self, auth_token):
        """DELETE /api/breathing/custom/{id} - 404 for nonexistent"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        res = requests.delete(f"{BASE_URL}/api/breathing/custom/nonexistent-id-12345", headers=headers)
        assert res.status_code == 404
        print("✓ Delete nonexistent breathing returns 404")


class TestCustomAffirmations:
    """Tests for Custom Affirmation Sets feature"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token for affirmation tests"""
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if login_res.status_code == 200:
            return login_res.json()["token"]
        
        register_res = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": TEST_NAME,
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if register_res.status_code == 200:
            return register_res.json()["token"]
        
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return login_res.json()["token"]
    
    def test_generate_affirmation_set_unauthorized(self):
        """POST /api/affirmations/generate-set requires auth"""
        res = requests.post(f"{BASE_URL}/api/affirmations/generate-set", json={
            "goal": "I want to feel more confident"
        })
        assert res.status_code == 401
        print("✓ Unauthorized generate affirmations returns 401")
    
    def test_generate_affirmation_set_no_goal(self, auth_token):
        """POST /api/affirmations/generate-set - requires goal"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        res = requests.post(f"{BASE_URL}/api/affirmations/generate-set", json={
            "goal": ""
        }, headers=headers)
        assert res.status_code == 400
        print("✓ Generate affirmations without goal returns 400")
    
    def test_generate_affirmation_set(self, auth_token):
        """POST /api/affirmations/generate-set - AI generates affirmations"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        res = requests.post(f"{BASE_URL}/api/affirmations/generate-set", json={
            "goal": "I want to feel more confident at work and speak up in meetings",
            "count": 5
        }, headers=headers, timeout=45)  # Higher timeout for AI
        
        assert res.status_code == 200, f"Generate failed: {res.text}"
        data = res.json()
        assert "affirmations" in data
        assert isinstance(data["affirmations"], list)
        assert len(data["affirmations"]) >= 3  # At least 3 affirmations
        assert data["goal"] == "I want to feel more confident at work and speak up in meetings"
        print(f"✓ Generated {len(data['affirmations'])} affirmations via AI")
        
        # Verify affirmations are strings
        for aff in data["affirmations"]:
            assert isinstance(aff, str)
            assert len(aff) > 10  # Not empty
    
    def test_save_affirmation_set_unauthorized(self):
        """POST /api/affirmations/save-set requires auth"""
        res = requests.post(f"{BASE_URL}/api/affirmations/save-set", json={
            "name": "Test Set",
            "goal": "Test goal",
            "affirmations": ["I am confident"]
        })
        assert res.status_code == 401
        print("✓ Unauthorized save affirmation set returns 401")
    
    def test_save_affirmation_set(self, auth_token):
        """POST /api/affirmations/save-set - save a custom set"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        res = requests.post(f"{BASE_URL}/api/affirmations/save-set", json={
            "name": "TEST_Morning Power Words",
            "goal": "Start my day with confidence",
            "affirmations": [
                "I am worthy of success and happiness",
                "I embrace challenges as opportunities to grow",
                "I radiate confidence and positivity"
            ],
            "color": "#2DD4BF"
        }, headers=headers)
        
        assert res.status_code == 200, f"Save failed: {res.text}"
        data = res.json()
        assert "id" in data
        assert data["name"] == "TEST_Morning Power Words"
        assert data["goal"] == "Start my day with confidence"
        assert len(data["affirmations"]) == 3
        assert data["color"] == "#2DD4BF"
        print(f"✓ Saved affirmation set: {data['id']}")
        return data["id"]
    
    def test_get_affirmation_sets_unauthorized(self):
        """GET /api/affirmations/my-sets requires auth"""
        res = requests.get(f"{BASE_URL}/api/affirmations/my-sets")
        assert res.status_code == 401
        print("✓ Unauthorized get affirmation sets returns 401")
    
    def test_get_affirmation_sets(self, auth_token):
        """GET /api/affirmations/my-sets - list saved sets"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        res = requests.get(f"{BASE_URL}/api/affirmations/my-sets", headers=headers)
        
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)
        print(f"✓ Retrieved {len(data)} affirmation sets")
        
        # Verify structure
        if len(data) > 0:
            aff_set = data[0]
            assert "id" in aff_set
            assert "name" in aff_set
            assert "affirmations" in aff_set
    
    def test_delete_affirmation_set(self, auth_token):
        """DELETE /api/affirmations/set/{id} - delete a set"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Create a set to delete
        create_res = requests.post(f"{BASE_URL}/api/affirmations/save-set", json={
            "name": "TEST_To Delete",
            "goal": "Test",
            "affirmations": ["Test affirmation"]
        }, headers=headers)
        assert create_res.status_code == 200
        set_id = create_res.json()["id"]
        
        # Delete it
        delete_res = requests.delete(f"{BASE_URL}/api/affirmations/set/{set_id}", headers=headers)
        assert delete_res.status_code == 200
        assert delete_res.json()["deleted"] == True
        print(f"✓ Deleted affirmation set: {set_id}")
        
        # Verify it's gone
        get_res = requests.get(f"{BASE_URL}/api/affirmations/my-sets", headers=headers)
        sets = get_res.json()
        assert not any(s["id"] == set_id for s in sets)
        print("✓ Verified set no longer exists")
    
    def test_delete_nonexistent_affirmation_set(self, auth_token):
        """DELETE /api/affirmations/set/{id} - 404 for nonexistent"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        res = requests.delete(f"{BASE_URL}/api/affirmations/set/nonexistent-id-12345", headers=headers)
        assert res.status_code == 404
        print("✓ Delete nonexistent affirmation set returns 404")


class TestCustomSoundscapes:
    """Tests for Custom Soundscape Mixes feature"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token for soundscape tests"""
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if login_res.status_code == 200:
            return login_res.json()["token"]
        
        register_res = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": TEST_NAME,
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if register_res.status_code == 200:
            return register_res.json()["token"]
        
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return login_res.json()["token"]
    
    def test_save_soundscape_mix_unauthorized(self):
        """POST /api/soundscapes/save-mix requires auth"""
        res = requests.post(f"{BASE_URL}/api/soundscapes/save-mix", json={
            "name": "Test Mix",
            "volumes": {"rain": 50, "ocean": 30}
        })
        assert res.status_code == 401
        print("✓ Unauthorized save soundscape mix returns 401")
    
    def test_save_soundscape_mix_no_sounds(self, auth_token):
        """POST /api/soundscapes/save-mix - requires active sounds"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        res = requests.post(f"{BASE_URL}/api/soundscapes/save-mix", json={
            "name": "Empty Mix",
            "volumes": {}
        }, headers=headers)
        assert res.status_code == 400
        print("✓ Save soundscape with no sounds returns 400")
    
    def test_save_soundscape_mix_zero_volumes(self, auth_token):
        """POST /api/soundscapes/save-mix - zero volumes are filtered"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        res = requests.post(f"{BASE_URL}/api/soundscapes/save-mix", json={
            "name": "Zero Mix",
            "volumes": {"rain": 0, "ocean": 0}
        }, headers=headers)
        assert res.status_code == 400
        print("✓ Save soundscape with all zero volumes returns 400")
    
    def test_save_soundscape_mix(self, auth_token):
        """POST /api/soundscapes/save-mix - save a custom mix"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        res = requests.post(f"{BASE_URL}/api/soundscapes/save-mix", json={
            "name": "TEST_Rainy Forest",
            "volumes": {
                "rain": 60,
                "forest": 40,
                "thunder": 20
            }
        }, headers=headers)
        
        assert res.status_code == 200, f"Save failed: {res.text}"
        data = res.json()
        assert "id" in data
        assert data["name"] == "TEST_Rainy Forest"
        assert data["volumes"]["rain"] == 60
        assert data["volumes"]["forest"] == 40
        assert data["volumes"]["thunder"] == 20
        print(f"✓ Saved soundscape mix: {data['id']}")
        return data["id"]
    
    def test_get_soundscape_mixes_unauthorized(self):
        """GET /api/soundscapes/my-mixes requires auth"""
        res = requests.get(f"{BASE_URL}/api/soundscapes/my-mixes")
        assert res.status_code == 401
        print("✓ Unauthorized get soundscape mixes returns 401")
    
    def test_get_soundscape_mixes(self, auth_token):
        """GET /api/soundscapes/my-mixes - list saved mixes"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        res = requests.get(f"{BASE_URL}/api/soundscapes/my-mixes", headers=headers)
        
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)
        print(f"✓ Retrieved {len(data)} soundscape mixes")
        
        # Verify structure
        if len(data) > 0:
            mix = data[0]
            assert "id" in mix
            assert "name" in mix
            assert "volumes" in mix
    
    def test_delete_soundscape_mix(self, auth_token):
        """DELETE /api/soundscapes/mix/{id} - delete a mix"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Create a mix to delete
        create_res = requests.post(f"{BASE_URL}/api/soundscapes/save-mix", json={
            "name": "TEST_To Delete",
            "volumes": {"rain": 50}
        }, headers=headers)
        assert create_res.status_code == 200
        mix_id = create_res.json()["id"]
        
        # Delete it
        delete_res = requests.delete(f"{BASE_URL}/api/soundscapes/mix/{mix_id}", headers=headers)
        assert delete_res.status_code == 200
        assert delete_res.json()["deleted"] == True
        print(f"✓ Deleted soundscape mix: {mix_id}")
        
        # Verify it's gone
        get_res = requests.get(f"{BASE_URL}/api/soundscapes/my-mixes", headers=headers)
        mixes = get_res.json()
        assert not any(m["id"] == mix_id for m in mixes)
        print("✓ Verified mix no longer exists")
    
    def test_delete_nonexistent_soundscape_mix(self, auth_token):
        """DELETE /api/soundscapes/mix/{id} - 404 for nonexistent"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        res = requests.delete(f"{BASE_URL}/api/soundscapes/mix/nonexistent-id-12345", headers=headers)
        assert res.status_code == 404
        print("✓ Delete nonexistent soundscape mix returns 404")


class TestExistingFeatures:
    """Verify existing features still work"""
    
    def test_daily_affirmation(self):
        """GET /api/affirmations/daily - public endpoint"""
        res = requests.get(f"{BASE_URL}/api/affirmations/daily")
        assert res.status_code == 200
        data = res.json()
        assert "text" in data
        print(f"✓ Daily affirmation: {data['text'][:50]}...")
    
    def test_generate_single_affirmation(self):
        """POST /api/affirmations/generate - public endpoint"""
        res = requests.post(f"{BASE_URL}/api/affirmations/generate", json={
            "theme": "inner peace"
        }, timeout=30)
        assert res.status_code == 200
        data = res.json()
        assert "text" in data
        print(f"✓ Generated affirmation: {data['text'][:50]}...")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
