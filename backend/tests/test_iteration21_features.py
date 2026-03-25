"""
Test iteration 21 features:
- Guided Experience endpoint (requires auth)
- Tantra, Mudras, Frequencies, Mantras, Exercises endpoints (for GuidedExperience button verification)
- Cardology and Mayan endpoints (verify still working)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestGuidedExperience:
    """Tests for guided-experience/generate endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_guided_experience_requires_auth(self):
        """POST /api/guided-experience/generate should require authentication"""
        response = requests.post(f"{BASE_URL}/api/guided-experience/generate", json={
            "practice_name": "Test Practice",
            "description": "Test description",
            "instructions": ["Step 1", "Step 2"],
            "category": "tantra",
            "duration_minutes": 5
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: Guided experience requires auth (401)")
    
    def test_guided_experience_with_auth(self, auth_token):
        """POST /api/guided-experience/generate with auth should return segments"""
        response = requests.post(
            f"{BASE_URL}/api/guided-experience/generate",
            json={
                "practice_name": "Test Meditation",
                "description": "A test meditation practice",
                "instructions": ["Breathe deeply", "Relax your body", "Focus on your breath"],
                "category": "meditation",
                "duration_minutes": 5
            },
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=60
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "segments" in data, "Response should contain 'segments'"
        assert "total_duration" in data, "Response should contain 'total_duration'"
        assert len(data["segments"]) > 0, "Should have at least one segment"
        # Verify segment structure
        segment = data["segments"][0]
        assert "text" in segment, "Segment should have 'text'"
        assert "duration" in segment, "Segment should have 'duration'"
        assert "cue" in segment, "Segment should have 'cue'"
        print(f"PASS: Guided experience returns {len(data['segments'])} segments")


class TestPracticeEndpoints:
    """Tests for practice pages that should have GuidedExperience button"""
    
    def test_tantra_endpoint(self):
        """GET /api/tantra should return practices"""
        response = requests.get(f"{BASE_URL}/api/tantra")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Should return a list"
        assert len(data) > 0, "Should have at least one practice"
        # Verify practice structure
        practice = data[0]
        assert "id" in practice, "Practice should have 'id'"
        assert "name" in practice, "Practice should have 'name'"
        assert "description" in practice, "Practice should have 'description'"
        assert "instructions" in practice, "Practice should have 'instructions'"
        print(f"PASS: Tantra endpoint returns {len(data)} practices")
    
    def test_mudras_endpoint(self):
        """GET /api/mudras should return mudras"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Should return a list"
        assert len(data) > 0, "Should have at least one mudra"
        # Verify mudra structure
        mudra = data[0]
        assert "id" in mudra, "Mudra should have 'id'"
        assert "name" in mudra, "Mudra should have 'name'"
        assert "description" in mudra, "Mudra should have 'description'"
        print(f"PASS: Mudras endpoint returns {len(data)} mudras")
    
    def test_frequencies_endpoint(self):
        """GET /api/frequencies should return frequencies"""
        response = requests.get(f"{BASE_URL}/api/frequencies")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Should return a list"
        assert len(data) > 0, "Should have at least one frequency"
        # Verify frequency structure
        freq = data[0]
        assert "id" in freq, "Frequency should have 'id'"
        assert "name" in freq, "Frequency should have 'name'"
        assert "frequency" in freq, "Frequency should have 'frequency'"
        print(f"PASS: Frequencies endpoint returns {len(data)} frequencies")
    
    def test_mantras_library_endpoint(self):
        """GET /api/mantras/library should return mantras"""
        response = requests.get(f"{BASE_URL}/api/mantras/library")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Should return a list"
        assert len(data) > 0, "Should have at least one mantra"
        # Verify mantra structure
        mantra = data[0]
        assert "id" in mantra, "Mantra should have 'id'"
        assert "name" in mantra, "Mantra should have 'name'"
        assert "text" in mantra, "Mantra should have 'text'"
        print(f"PASS: Mantras library returns {len(data)} mantras")
    
    def test_exercises_endpoint(self):
        """GET /api/exercises should return exercises"""
        response = requests.get(f"{BASE_URL}/api/exercises")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Should return a list"
        assert len(data) > 0, "Should have at least one exercise"
        # Verify exercise structure
        exercise = data[0]
        assert "id" in exercise, "Exercise should have 'id'"
        assert "name" in exercise, "Exercise should have 'name'"
        assert "steps" in exercise, "Exercise should have 'steps'"
        print(f"PASS: Exercises endpoint returns {len(data)} exercises")


class TestCardologyMayan:
    """Verify Cardology and Mayan endpoints still work"""
    
    def test_cardology_birth_card(self):
        """GET /api/cardology/birth-card should return card"""
        response = requests.get(f"{BASE_URL}/api/cardology/birth-card?month=5&day=12")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        # Card data may be nested in 'card' object
        card = data.get("card", data)
        assert "keyword" in card, "Should have 'keyword'"
        print(f"PASS: Cardology birth card returns {card.get('keyword')}")
    
    def test_mayan_birth_sign(self):
        """GET /api/mayan/birth-sign should return sign"""
        response = requests.get(f"{BASE_URL}/api/mayan/birth-sign?year=1990&month=7&day=26")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "galactic_signature" in data, "Should have 'galactic_signature'"
        assert "sign" in data, "Should have 'sign'"
        print(f"PASS: Mayan birth sign returns {data.get('galactic_signature')}")


class TestQuickResetWaitlist:
    """Test Quick Reset and Waitlist endpoints"""
    
    def test_quick_reset_happy(self):
        """GET /api/quick-reset/happy should return flow"""
        response = requests.get(f"{BASE_URL}/api/quick-reset/happy")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "frequency" in data, "Should have 'frequency'"
        assert "tool" in data, "Should have 'tool'"
        assert "nourishment" in data, "Should have 'nourishment'"
        print("PASS: Quick reset returns flow for 'happy'")
    
    def test_waitlist_count(self):
        """GET /api/waitlist/count should return count"""
        response = requests.get(f"{BASE_URL}/api/waitlist/count")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "count" in data, "Should have 'count'"
        print(f"PASS: Waitlist count is {data.get('count')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
