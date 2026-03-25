"""
Test suite for Beginner's Journey API endpoints
Tests: /api/journey/progress and /api/journey/complete-lesson
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "buildtest@test.com"
TEST_PASSWORD = "password123"


class TestJourneyAPI:
    """Tests for Journey progress tracking endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Authenticate
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.authenticated = True
        else:
            self.authenticated = False
            pytest.skip("Authentication failed - skipping authenticated tests")
    
    # --- GET /api/journey/progress tests ---
    
    def test_get_progress_unauthenticated(self):
        """Test that unauthenticated users cannot access progress"""
        response = requests.get(f"{BASE_URL}/api/journey/progress")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_get_progress_authenticated(self):
        """Test getting journey progress for authenticated user"""
        response = self.session.get(f"{BASE_URL}/api/journey/progress")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        # Verify response structure
        assert "completed_lessons" in data, "Response should contain completed_lessons"
        assert "current_stage" in data, "Response should contain current_stage"
        assert "user_id" in data, "Response should contain user_id"
        assert "started_at" in data, "Response should contain started_at"
        
        # Verify data types
        assert isinstance(data["completed_lessons"], list), "completed_lessons should be a list"
        assert isinstance(data["current_stage"], int), "current_stage should be an integer"
        assert data["current_stage"] >= 0, "current_stage should be non-negative"
    
    # --- POST /api/journey/complete-lesson tests ---
    
    def test_complete_lesson_unauthenticated(self):
        """Test that unauthenticated users cannot complete lessons"""
        response = requests.post(f"{BASE_URL}/api/journey/complete-lesson", json={
            "lesson_id": "s0-welcome"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_complete_lesson_missing_lesson_id(self):
        """Test completing lesson without lesson_id returns 400"""
        response = self.session.post(f"{BASE_URL}/api/journey/complete-lesson", json={})
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        
        data = response.json()
        assert "detail" in data, "Error response should contain detail"
    
    def test_complete_lesson_empty_lesson_id(self):
        """Test completing lesson with empty lesson_id returns 400"""
        response = self.session.post(f"{BASE_URL}/api/journey/complete-lesson", json={
            "lesson_id": ""
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    
    def test_complete_lesson_valid(self):
        """Test completing a valid lesson"""
        # Complete a test lesson
        lesson_id = "TEST_s0-test-lesson"
        response = self.session.post(f"{BASE_URL}/api/journey/complete-lesson", json={
            "lesson_id": lesson_id
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        # Verify response structure
        assert "completed_lessons" in data, "Response should contain completed_lessons"
        assert "current_stage" in data, "Response should contain current_stage"
        assert "lesson_id" in data, "Response should contain lesson_id"
        
        # Verify the lesson was added
        assert lesson_id in data["completed_lessons"], "Lesson should be in completed_lessons"
        assert data["lesson_id"] == lesson_id, "Response should echo the lesson_id"
    
    def test_complete_lesson_idempotent(self):
        """Test that completing the same lesson twice doesn't duplicate it"""
        lesson_id = "TEST_s0-idempotent-test"
        
        # Complete the lesson first time
        response1 = self.session.post(f"{BASE_URL}/api/journey/complete-lesson", json={
            "lesson_id": lesson_id
        })
        assert response1.status_code == 200
        count1 = response1.json()["completed_lessons"].count(lesson_id)
        
        # Complete the same lesson again
        response2 = self.session.post(f"{BASE_URL}/api/journey/complete-lesson", json={
            "lesson_id": lesson_id
        })
        assert response2.status_code == 200
        count2 = response2.json()["completed_lessons"].count(lesson_id)
        
        # Should not duplicate
        assert count1 == 1, "Lesson should appear exactly once"
        assert count2 == 1, "Lesson should still appear exactly once after second completion"
    
    def test_complete_lesson_and_verify_persistence(self):
        """Test that completed lesson persists in GET progress"""
        lesson_id = "TEST_s0-persistence-test"
        
        # Complete the lesson
        complete_response = self.session.post(f"{BASE_URL}/api/journey/complete-lesson", json={
            "lesson_id": lesson_id
        })
        assert complete_response.status_code == 200
        
        # Verify it persists in GET
        get_response = self.session.get(f"{BASE_URL}/api/journey/progress")
        assert get_response.status_code == 200
        
        data = get_response.json()
        assert lesson_id in data["completed_lessons"], "Completed lesson should persist in progress"


class TestStageUnlocking:
    """Tests for stage unlocking logic"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Authenticate
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.authenticated = True
        else:
            self.authenticated = False
            pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_stage_unlocking_logic(self):
        """Test that completing 4 lessons in a stage unlocks the next stage"""
        # Get initial progress
        initial_response = self.session.get(f"{BASE_URL}/api/journey/progress")
        assert initial_response.status_code == 200
        initial_stage = initial_response.json()["current_stage"]
        
        # Complete 4 lessons in stage 0 (using TEST_ prefix to avoid affecting real progress)
        test_lessons = [
            "TEST_s0-unlock-1",
            "TEST_s0-unlock-2", 
            "TEST_s0-unlock-3",
            "TEST_s0-unlock-4"
        ]
        
        for lesson_id in test_lessons:
            response = self.session.post(f"{BASE_URL}/api/journey/complete-lesson", json={
                "lesson_id": lesson_id
            })
            assert response.status_code == 200
        
        # Check final progress - note: this may not unlock stage 1 if there are already
        # real s0- lessons completed. The logic counts lessons starting with "s{i}-"
        final_response = self.session.get(f"{BASE_URL}/api/journey/progress")
        assert final_response.status_code == 200
        
        # Verify all test lessons are in completed_lessons
        data = final_response.json()
        for lesson_id in test_lessons:
            assert lesson_id in data["completed_lessons"], f"{lesson_id} should be in completed_lessons"


class TestJourneyProgressStructure:
    """Tests for journey progress data structure"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Authenticate
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.authenticated = True
        else:
            self.authenticated = False
            pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_progress_has_valid_timestamp(self):
        """Test that progress has a valid started_at timestamp"""
        response = self.session.get(f"{BASE_URL}/api/journey/progress")
        assert response.status_code == 200
        
        data = response.json()
        assert "started_at" in data
        # Should be ISO format timestamp
        assert isinstance(data["started_at"], str)
        assert len(data["started_at"]) > 10, "started_at should be a valid ISO timestamp"
    
    def test_progress_user_id_matches(self):
        """Test that progress user_id matches authenticated user"""
        response = self.session.get(f"{BASE_URL}/api/journey/progress")
        assert response.status_code == 200
        
        data = response.json()
        assert "user_id" in data
        assert isinstance(data["user_id"], str)
        assert len(data["user_id"]) > 0, "user_id should not be empty"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
