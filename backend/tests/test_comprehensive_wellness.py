"""
Comprehensive API tests for ENLIGHTEN.MINT.CAFE Wellness App
Tests all static endpoints, auth, classes, videos, exercises, and practice pages
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndBasics:
    """Health check and basic API tests"""
    
    def test_health_endpoint(self):
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        print("✓ Health endpoint working")

class TestAuthentication:
    """Authentication flow tests"""
    
    def test_login_with_test_user(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == "test@test.com"
        print(f"✓ Login successful for test@test.com")
        return data["token"]
    
    def test_login_invalid_credentials(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials rejected correctly")

class TestClassesEndpoints:
    """Classes and lessons tests - CRITICAL for user requirement"""
    
    def test_get_all_classes(self):
        response = requests.get(f"{BASE_URL}/api/classes")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5, f"Expected 5 classes, got {len(data)}"
        for cls in data:
            assert "id" in cls
            assert "title" in cls
            assert "lessons" in cls or "lesson_count" in cls
            assert "thumbnail" in cls
        print(f"✓ Classes endpoint returns {len(data)} classes")
        return data
    
    def test_get_class_detail_with_lessons(self):
        # Get first class detail
        response = requests.get(f"{BASE_URL}/api/classes/cls-mudra-mastery")
        assert response.status_code == 200
        data = response.json()
        assert "lessons" in data
        assert len(data["lessons"]) >= 1, "Class should have lessons"
        
        # Verify lesson structure
        lesson = data["lessons"][0]
        assert "id" in lesson
        assert "title" in lesson
        assert "video_url" in lesson, "Lesson should have video_url"
        assert "content" in lesson, "Lesson should have content text"
        assert len(lesson["content"]) > 100, "Lesson content should be substantial"
        print(f"✓ Class detail has {len(data['lessons'])} lessons with video and content")
        return data
    
    def test_all_classes_have_full_lesson_content(self):
        """Verify all 5 classes have lessons with video_url and content"""
        classes_response = requests.get(f"{BASE_URL}/api/classes")
        classes = classes_response.json()
        
        for cls in classes:
            detail_response = requests.get(f"{BASE_URL}/api/classes/{cls['id']}")
            assert detail_response.status_code == 200
            detail = detail_response.json()
            
            assert "lessons" in detail, f"Class {cls['id']} missing lessons"
            assert len(detail["lessons"]) >= 1, f"Class {cls['id']} has no lessons"
            
            for lesson in detail["lessons"]:
                assert "video_url" in lesson, f"Lesson {lesson.get('id')} missing video_url"
                assert "content" in lesson, f"Lesson {lesson.get('id')} missing content"
                assert lesson["video_url"].startswith("https://"), f"Invalid video_url in lesson {lesson.get('id')}"
                assert len(lesson["content"]) > 50, f"Lesson {lesson.get('id')} content too short"
            
            print(f"✓ Class '{detail['title']}' has {len(detail['lessons'])} lessons with full content")
    
    def test_class_enrollment_flow(self):
        """Test enrollment and lesson completion"""
        # Login first
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        token = login_response.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Enroll in a class
        enroll_response = requests.post(f"{BASE_URL}/api/classes/enroll", 
            json={"class_id": "cls-mudra-mastery"},
            headers=headers)
        assert enroll_response.status_code == 200
        enrollment = enroll_response.json()
        assert "class_id" in enrollment
        print("✓ Class enrollment working")
        
        # Complete a lesson
        complete_response = requests.post(f"{BASE_URL}/api/classes/complete-lesson",
            json={"class_id": "cls-mudra-mastery", "lesson_id": "l1"},
            headers=headers)
        assert complete_response.status_code == 200
        print("✓ Lesson completion working")

class TestVideosEndpoints:
    """Videos library tests - should have 23 videos"""
    
    def test_get_all_videos(self):
        response = requests.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 23, f"Expected 23 videos, got {len(data)}"
        print(f"✓ Videos endpoint returns {len(data)} videos")
        return data
    
    def test_videos_have_required_fields(self):
        response = requests.get(f"{BASE_URL}/api/videos")
        data = response.json()
        
        categories = set()
        for video in data:
            assert "id" in video
            assert "title" in video
            assert "category" in video
            assert "video_url" in video
            assert "thumbnail" in video
            assert video["video_url"].startswith("https://www.youtube.com/embed/")
            categories.add(video["category"])
        
        print(f"✓ All videos have required fields")
        print(f"✓ Video categories: {categories}")
        assert len(categories) >= 8, f"Expected at least 8 categories, got {len(categories)}"

class TestExercisesEndpoints:
    """Exercises (Qigong/Tai Chi) tests - should have 6 exercises"""
    
    def test_get_all_exercises(self):
        response = requests.get(f"{BASE_URL}/api/exercises")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 6, f"Expected 6 exercises, got {len(data)}"
        print(f"✓ Exercises endpoint returns {len(data)} exercises")
        return data
    
    def test_exercises_have_video_and_steps(self):
        response = requests.get(f"{BASE_URL}/api/exercises")
        data = response.json()
        
        for ex in data:
            assert "id" in ex
            assert "name" in ex
            assert "video_url" in ex, f"Exercise {ex['name']} missing video_url"
            assert "steps" in ex, f"Exercise {ex['name']} missing steps"
            assert len(ex["steps"]) == 8, f"Exercise {ex['name']} should have 8 steps, has {len(ex['steps'])}"
            assert "philosophy" in ex, f"Exercise {ex['name']} missing philosophy"
            assert "tips" in ex, f"Exercise {ex['name']} missing tips"
            assert ex["video_url"].startswith("https://www.youtube.com/embed/")
            print(f"✓ Exercise '{ex['name']}' has video, 8 steps, philosophy, tips")

class TestMudrasEndpoints:
    """Mudras tests"""
    
    def test_get_all_mudras(self):
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 20, f"Expected at least 20 mudras, got {len(data)}"
        print(f"✓ Mudras endpoint returns {len(data)} mudras")
    
    def test_mudras_have_required_fields(self):
        response = requests.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        
        for mudra in data[:5]:  # Check first 5
            assert "id" in mudra
            assert "name" in mudra
            assert "description" in mudra
            assert "benefits" in mudra
            assert "chakra" in mudra
        print("✓ Mudras have required fields")

class TestFrequenciesEndpoints:
    """Frequencies tests"""
    
    def test_get_all_frequencies(self):
        response = requests.get(f"{BASE_URL}/api/frequencies")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 10, f"Expected at least 10 frequencies, got {len(data)}"
        print(f"✓ Frequencies endpoint returns {len(data)} frequencies")
    
    def test_frequencies_have_required_fields(self):
        response = requests.get(f"{BASE_URL}/api/frequencies")
        data = response.json()
        
        for freq in data:
            assert "id" in freq
            assert "frequency" in freq
            assert "name" in freq
            assert "description" in freq
            assert "chakra" in freq
            assert "benefits" in freq
        print("✓ Frequencies have required fields")

class TestYantrasEndpoints:
    """Yantras tests"""
    
    def test_get_all_yantras(self):
        response = requests.get(f"{BASE_URL}/api/yantras")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 5, f"Expected at least 5 yantras, got {len(data)}"
        print(f"✓ Yantras endpoint returns {len(data)} yantras")

class TestTantraEndpoints:
    """Tantra practices tests"""
    
    def test_get_all_tantra_practices(self):
        response = requests.get(f"{BASE_URL}/api/tantra")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 5, f"Expected at least 5 tantra practices, got {len(data)}"
        print(f"✓ Tantra endpoint returns {len(data)} practices")

class TestNourishmentEndpoints:
    """Nourishment/food tests"""
    
    def test_get_all_nourishment(self):
        response = requests.get(f"{BASE_URL}/api/nourishment")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 5, f"Expected at least 5 nourishment items, got {len(data)}"
        print(f"✓ Nourishment endpoint returns {len(data)} items")

class TestChallengesEndpoints:
    """Challenges tests"""
    
    def test_get_all_challenges(self):
        response = requests.get(f"{BASE_URL}/api/challenges")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 5, f"Expected at least 5 challenges, got {len(data)}"
        print(f"✓ Challenges endpoint returns {len(data)} challenges")

class TestOracleEndpoints:
    """Oracle/divination tests"""
    
    def test_get_zodiac_signs(self):
        response = requests.get(f"{BASE_URL}/api/oracle/zodiac")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 12, f"Expected 12 zodiac signs, got {len(data)}"
        print("✓ Zodiac signs endpoint working")
    
    def test_get_tarot_deck(self):
        response = requests.get(f"{BASE_URL}/api/oracle/tarot-deck")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 22, f"Expected at least 22 tarot cards, got {len(data)}"
        print("✓ Tarot deck endpoint working")

class TestCreationsEndpoints:
    """User creations tests"""
    
    def test_get_shared_creations(self):
        response = requests.get(f"{BASE_URL}/api/creations/shared")
        assert response.status_code == 200
        print("✓ Shared creations endpoint working")

class TestDashboardEndpoints:
    """Dashboard stats tests"""
    
    def test_get_dashboard_stats(self):
        # Login first
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        token = login_response.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "streak" in data
        assert "mood_count" in data
        assert "journal_count" in data
        print("✓ Dashboard stats endpoint working")

class TestAffirmationsEndpoints:
    """Affirmations tests"""
    
    def test_get_daily_affirmation(self):
        response = requests.get(f"{BASE_URL}/api/affirmations/daily")
        assert response.status_code == 200
        data = response.json()
        assert "text" in data
        print("✓ Daily affirmation endpoint working")

class TestProfileEndpoints:
    """Profile tests"""
    
    def test_get_cover_presets(self):
        response = requests.get(f"{BASE_URL}/api/profile/covers")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 5, f"Expected at least 5 cover presets, got {len(data)}"
        print(f"✓ Profile covers endpoint returns {len(data)} presets")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
