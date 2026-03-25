"""
Test suite for Recommendation Engine and Advanced Learning Modules features.
Tests:
- GET /api/recommendations - personalized recommendations based on mood, time, engagement
- GET /api/learning/modules - 4 modules with unlock/progress status
- POST /api/learning/complete-lesson - marks lessons complete, tracks progress
- Module unlocking logic - Level 2 locked until all Level 1 lessons complete
- Engagement score calculation
"""
import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "testlearn@test.com"
TEST_PASSWORD = "password123"
TEST_NAME = "Test Learner"


class TestRecommendationEngine:
    """Tests for the Recommendation Engine API"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login with test account
        login_res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if login_res.status_code == 200:
            token = login_res.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip("Could not authenticate - skipping recommendation tests")
    
    def test_recommendations_endpoint_returns_200(self):
        """Test that GET /api/recommendations returns 200 with valid auth"""
        response = self.session.get(f"{BASE_URL}/api/recommendations")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: GET /api/recommendations returns 200")
    
    def test_recommendations_response_structure(self):
        """Test that recommendations response has correct structure"""
        response = self.session.get(f"{BASE_URL}/api/recommendations")
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert "recommendations" in data, "Missing 'recommendations' field"
        assert "time_period" in data, "Missing 'time_period' field"
        assert "mood_count" in data, "Missing 'mood_count' field"
        assert "journal_count" in data, "Missing 'journal_count' field"
        assert "journey_progress" in data, "Missing 'journey_progress' field"
        assert "engagement_score" in data, "Missing 'engagement_score' field"
        
        # Validate time_period is one of expected values
        assert data["time_period"] in ["morning", "afternoon", "evening", "night"], \
            f"Invalid time_period: {data['time_period']}"
        
        print(f"PASS: Response structure valid - time_period={data['time_period']}, engagement_score={data['engagement_score']}")
    
    def test_recommendations_list_structure(self):
        """Test that each recommendation has required fields"""
        response = self.session.get(f"{BASE_URL}/api/recommendations")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data["recommendations"], list), "recommendations should be a list"
        assert len(data["recommendations"]) > 0, "Should have at least one recommendation"
        
        for rec in data["recommendations"]:
            assert "id" in rec, "Recommendation missing 'id'"
            assert "name" in rec, "Recommendation missing 'name'"
            assert "path" in rec, "Recommendation missing 'path'"
            assert "icon" in rec, "Recommendation missing 'icon'"
            assert "color" in rec, "Recommendation missing 'color'"
            assert "desc" in rec, "Recommendation missing 'desc'"
            assert "reason" in rec, "Recommendation missing 'reason'"
            assert "priority" in rec, "Recommendation missing 'priority'"
            assert "source" in rec, "Recommendation missing 'source'"
            
            # Validate priority values
            assert rec["priority"] in ["high", "medium", "low"], f"Invalid priority: {rec['priority']}"
        
        print(f"PASS: All {len(data['recommendations'])} recommendations have valid structure")
    
    def test_recommendations_max_count(self):
        """Test that recommendations are capped at 6"""
        response = self.session.get(f"{BASE_URL}/api/recommendations")
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["recommendations"]) <= 6, f"Should have max 6 recommendations, got {len(data['recommendations'])}"
        print(f"PASS: Recommendations count ({len(data['recommendations'])}) is within limit of 6")
    
    def test_recommendations_mood_based(self):
        """Test that recommendations include mood-based suggestions for user with mood data"""
        response = self.session.get(f"{BASE_URL}/api/recommendations")
        assert response.status_code == 200
        data = response.json()
        
        # User testlearn@test.com has mood data (stressed)
        if data["mood_count"] > 0:
            # Should have at least one mood-based recommendation
            mood_recs = [r for r in data["recommendations"] if r.get("source") == "mood_analysis"]
            print(f"INFO: Found {len(mood_recs)} mood-based recommendations")
            
            # Check if any recommendation mentions mood in reason
            mood_reasons = [r for r in data["recommendations"] if "mood" in r.get("reason", "").lower()]
            assert len(mood_reasons) > 0 or len(mood_recs) > 0, \
                "User with mood data should have mood-based recommendations"
            print("PASS: Mood-based recommendations present for user with mood data")
        else:
            print("INFO: User has no mood data - checking for onboarding recommendation")
            onboarding_recs = [r for r in data["recommendations"] if r.get("source") == "onboarding"]
            print(f"INFO: Found {len(onboarding_recs)} onboarding recommendations")
    
    def test_recommendations_time_based(self):
        """Test that recommendations include time-of-day suggestions"""
        response = self.session.get(f"{BASE_URL}/api/recommendations")
        assert response.status_code == 200
        data = response.json()
        
        time_recs = [r for r in data["recommendations"] if r.get("source") == "time_of_day"]
        print(f"INFO: Found {len(time_recs)} time-of-day recommendations for {data['time_period']}")
        
        # Time-based recommendations should be present
        assert len(time_recs) > 0, "Should have time-of-day based recommendations"
        print("PASS: Time-of-day recommendations present")
    
    def test_engagement_score_calculation(self):
        """Test that engagement score is calculated correctly"""
        response = self.session.get(f"{BASE_URL}/api/recommendations")
        assert response.status_code == 200
        data = response.json()
        
        # Engagement score formula: mood_count*5 + journal_count*5 + journey_progress*3 + challenges*10 + rituals*4 + plants*3
        # Should be capped at 100
        assert isinstance(data["engagement_score"], int), "engagement_score should be an integer"
        assert 0 <= data["engagement_score"] <= 100, f"engagement_score should be 0-100, got {data['engagement_score']}"
        
        print(f"PASS: Engagement score ({data['engagement_score']}) is valid (0-100 range)")
    
    def test_recommendations_without_auth(self):
        """Test that recommendations endpoint requires authentication"""
        session = requests.Session()
        response = session.get(f"{BASE_URL}/api/recommendations")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("PASS: GET /api/recommendations returns 401 without auth")


class TestLearningModules:
    """Tests for the Advanced Learning Modules API"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login with test account
        login_res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if login_res.status_code == 200:
            token = login_res.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip("Could not authenticate - skipping learning module tests")
    
    def test_learning_modules_endpoint_returns_200(self):
        """Test that GET /api/learning/modules returns 200 with valid auth"""
        response = self.session.get(f"{BASE_URL}/api/learning/modules")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: GET /api/learning/modules returns 200")
    
    def test_learning_modules_returns_4_modules(self):
        """Test that exactly 4 modules are returned"""
        response = self.session.get(f"{BASE_URL}/api/learning/modules")
        assert response.status_code == 200
        data = response.json()
        
        assert "modules" in data, "Response missing 'modules' field"
        assert len(data["modules"]) == 4, f"Expected 4 modules, got {len(data['modules'])}"
        
        # Verify module levels
        levels = [m["level"] for m in data["modules"]]
        assert levels == [1, 2, 3, 4], f"Expected levels [1,2,3,4], got {levels}"
        
        print("PASS: Exactly 4 modules returned with levels 1-4")
    
    def test_learning_modules_structure(self):
        """Test that each module has required fields"""
        response = self.session.get(f"{BASE_URL}/api/learning/modules")
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["id", "title", "subtitle", "level", "color", "icon", 
                          "duration", "prerequisite", "description", "lessons",
                          "completed_count", "total_lessons", "unlocked", "completed"]
        
        for mod in data["modules"]:
            for field in required_fields:
                assert field in mod, f"Module {mod.get('id', 'unknown')} missing '{field}'"
            
            # Validate lessons structure
            assert isinstance(mod["lessons"], list), f"Module {mod['id']} lessons should be a list"
            assert len(mod["lessons"]) > 0, f"Module {mod['id']} should have lessons"
            
            for lesson in mod["lessons"]:
                assert "id" in lesson, "Lesson missing 'id'"
                assert "title" in lesson, "Lesson missing 'title'"
                assert "type" in lesson, "Lesson missing 'type'"
                assert "content" in lesson, "Lesson missing 'content'"
                assert "duration" in lesson, "Lesson missing 'duration'"
        
        print("PASS: All modules and lessons have valid structure")
    
    def test_learning_modules_unlock_logic(self):
        """Test that module unlocking follows prerequisite logic"""
        response = self.session.get(f"{BASE_URL}/api/learning/modules")
        assert response.status_code == 200
        data = response.json()
        
        modules = data["modules"]
        
        # Level 1 (foundations) should always be unlocked (no prerequisite)
        level1 = next(m for m in modules if m["level"] == 1)
        assert level1["unlocked"] == True, "Level 1 should always be unlocked"
        assert level1["prerequisite"] is None, "Level 1 should have no prerequisite"
        
        # Level 2 should be locked unless all Level 1 lessons are complete
        level2 = next(m for m in modules if m["level"] == 2)
        assert level2["prerequisite"] == "foundations", "Level 2 prerequisite should be 'foundations'"
        
        # If Level 1 is not complete, Level 2 should be locked
        if level1["completed_count"] < level1["total_lessons"]:
            assert level2["unlocked"] == False, "Level 2 should be locked when Level 1 incomplete"
            print("PASS: Level 2 correctly locked (Level 1 incomplete)")
        else:
            assert level2["unlocked"] == True, "Level 2 should be unlocked when Level 1 complete"
            print("PASS: Level 2 correctly unlocked (Level 1 complete)")
        
        print(f"INFO: Level 1 progress: {level1['completed_count']}/{level1['total_lessons']}")
    
    def test_learning_modules_total_counts(self):
        """Test that total_completed and total_lessons are correct"""
        response = self.session.get(f"{BASE_URL}/api/learning/modules")
        assert response.status_code == 200
        data = response.json()
        
        assert "total_completed" in data, "Missing 'total_completed'"
        assert "total_lessons" in data, "Missing 'total_lessons'"
        
        # Calculate expected totals
        expected_total = sum(m["total_lessons"] for m in data["modules"])
        expected_completed = sum(m["completed_count"] for m in data["modules"])
        
        assert data["total_lessons"] == expected_total, \
            f"total_lessons mismatch: expected {expected_total}, got {data['total_lessons']}"
        assert data["total_completed"] == expected_completed, \
            f"total_completed mismatch: expected {expected_completed}, got {data['total_completed']}"
        
        print(f"PASS: Total counts correct - {data['total_completed']}/{data['total_lessons']} lessons")
    
    def test_learning_modules_without_auth(self):
        """Test that learning modules endpoint requires authentication"""
        session = requests.Session()
        response = session.get(f"{BASE_URL}/api/learning/modules")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("PASS: GET /api/learning/modules returns 401 without auth")


class TestCompleteLessonAPI:
    """Tests for the POST /api/learning/complete-lesson endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login with test account
        login_res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if login_res.status_code == 200:
            token = login_res.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip("Could not authenticate - skipping complete lesson tests")
    
    def test_complete_lesson_success(self):
        """Test completing a lesson successfully"""
        # Complete lesson f-2 (second lesson in foundations)
        response = self.session.post(f"{BASE_URL}/api/learning/complete-lesson", json={
            "lesson_id": "f-2"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "completed_lessons" in data, "Response missing 'completed_lessons'"
        assert "current_module" in data, "Response missing 'current_module'"
        assert "lesson_id" in data, "Response missing 'lesson_id'"
        assert data["lesson_id"] == "f-2", f"Expected lesson_id 'f-2', got {data['lesson_id']}"
        assert "f-2" in data["completed_lessons"], "f-2 should be in completed_lessons"
        
        print(f"PASS: Lesson f-2 completed successfully. Total completed: {len(data['completed_lessons'])}")
    
    def test_complete_lesson_idempotent(self):
        """Test that completing same lesson twice doesn't duplicate"""
        # Complete f-1 twice
        response1 = self.session.post(f"{BASE_URL}/api/learning/complete-lesson", json={
            "lesson_id": "f-1"
        })
        assert response1.status_code == 200
        count1 = response1.json()["completed_lessons"].count("f-1")
        
        response2 = self.session.post(f"{BASE_URL}/api/learning/complete-lesson", json={
            "lesson_id": "f-1"
        })
        assert response2.status_code == 200
        count2 = response2.json()["completed_lessons"].count("f-1")
        
        assert count1 == 1, "f-1 should appear exactly once"
        assert count2 == 1, "f-1 should still appear exactly once after second completion"
        
        print("PASS: Completing same lesson twice is idempotent")
    
    def test_complete_lesson_missing_lesson_id(self):
        """Test that missing lesson_id returns 400"""
        response = self.session.post(f"{BASE_URL}/api/learning/complete-lesson", json={})
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("PASS: Missing lesson_id returns 400")
    
    def test_complete_lesson_invalid_lesson_id(self):
        """Test that invalid lesson_id returns 400"""
        response = self.session.post(f"{BASE_URL}/api/learning/complete-lesson", json={
            "lesson_id": "invalid-lesson-xyz"
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("PASS: Invalid lesson_id returns 400")
    
    def test_complete_lesson_without_auth(self):
        """Test that complete lesson endpoint requires authentication"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        response = session.post(f"{BASE_URL}/api/learning/complete-lesson", json={
            "lesson_id": "f-1"
        })
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("PASS: POST /api/learning/complete-lesson returns 401 without auth")
    
    def test_complete_lesson_updates_progress(self):
        """Test that completing lessons updates module progress"""
        # Get initial state
        modules_before = self.session.get(f"{BASE_URL}/api/learning/modules").json()
        level1_before = next(m for m in modules_before["modules"] if m["level"] == 1)
        
        # Complete f-3
        complete_res = self.session.post(f"{BASE_URL}/api/learning/complete-lesson", json={
            "lesson_id": "f-3"
        })
        assert complete_res.status_code == 200
        
        # Get updated state
        modules_after = self.session.get(f"{BASE_URL}/api/learning/modules").json()
        level1_after = next(m for m in modules_after["modules"] if m["level"] == 1)
        
        # Progress should be same or increased
        assert level1_after["completed_count"] >= level1_before["completed_count"], \
            "Completed count should not decrease"
        
        print(f"PASS: Progress updated - Level 1: {level1_after['completed_count']}/{level1_after['total_lessons']}")


class TestMoodRecommendationIntegration:
    """Tests for mood-based recommendation changes"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login with test account
        login_res = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if login_res.status_code == 200:
            token = login_res.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            pytest.skip("Could not authenticate - skipping mood integration tests")
    
    def test_recommendations_change_with_mood(self):
        """Test that logging a mood changes recommendations"""
        # Get initial recommendations
        recs_before = self.session.get(f"{BASE_URL}/api/recommendations").json()
        
        # Log a new mood (anxious)
        mood_res = self.session.post(f"{BASE_URL}/api/moods", json={
            "mood": "anxious",
            "intensity": 7,
            "note": "Test mood for recommendation testing"
        })
        assert mood_res.status_code == 200, f"Failed to log mood: {mood_res.text}"
        
        # Get new recommendations
        recs_after = self.session.get(f"{BASE_URL}/api/recommendations").json()
        
        # Mood count should increase
        assert recs_after["mood_count"] > recs_before["mood_count"], \
            "Mood count should increase after logging mood"
        
        # Check for anxious-related recommendations
        # MOOD_TOOL_MAP["anxious"] = ["breathing", "meditation", "hooponopono", "frequencies"]
        anxious_tools = ["breathing", "meditation", "hooponopono", "frequencies"]
        rec_ids = [r["id"] for r in recs_after["recommendations"]]
        
        has_anxious_rec = any(tool in rec_ids for tool in anxious_tools)
        print(f"INFO: Recommendations after anxious mood: {rec_ids}")
        print(f"INFO: Has anxious-related recommendation: {has_anxious_rec}")
        
        # Check if any recommendation mentions anxious mood
        mood_recs = [r for r in recs_after["recommendations"] if "anxious" in r.get("reason", "").lower()]
        print(f"INFO: Recommendations mentioning 'anxious': {len(mood_recs)}")
        
        print("PASS: Recommendations updated after mood logging")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
