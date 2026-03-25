"""
Backend API tests for Cosmic Zen new features:
- Mudras (9 mudras)
- Yantras (7 yantras)
- Tantra (6 practices)
- Videos (10 videos)
- Classes (5 classes with enrollment/completion/certification)
- Frequencies (12 frequencies)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "password"

@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture(scope="module")
def auth_token(api_client):
    """Get authentication token via login"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    # Try register if login fails
    response = api_client.post(f"{BASE_URL}/api/auth/register", json={
        "name": "Test User",
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")

@pytest.fixture(scope="module")
def authenticated_client(api_client, auth_token):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return api_client


class TestMudrasAPI:
    """Test Mudras endpoints - should return 9 mudras"""
    
    def test_get_mudras_returns_list(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"GET /api/mudras: {len(data)} mudras returned")
    
    def test_get_mudras_returns_9_items(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 9, f"Expected 9 mudras, got {len(data)}"
        print(f"Mudras count verified: {len(data)}")
    
    def test_mudra_has_required_fields(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        data = response.json()
        required_fields = ["id", "name", "sanskrit", "description", "benefits", "chakra", "element", "duration", "practice", "color"]
        for mudra in data:
            for field in required_fields:
                assert field in mudra, f"Mudra missing field: {field}"
        print(f"All mudras have required fields: {required_fields}")


class TestYantrasAPI:
    """Test Yantras endpoints - should return 7 yantras"""
    
    def test_get_yantras_returns_list(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/yantras")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"GET /api/yantras: {len(data)} yantras returned")
    
    def test_get_yantras_returns_7_items(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/yantras")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 7, f"Expected 7 yantras, got {len(data)}"
        print(f"Yantras count verified: {len(data)}")
    
    def test_yantra_has_required_fields(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/yantras")
        assert response.status_code == 200
        data = response.json()
        required_fields = ["id", "name", "sanskrit", "description", "meaning", "deity", "mantra", "meditation", "color", "pattern"]
        for yantra in data:
            for field in required_fields:
                assert field in yantra, f"Yantra missing field: {field}"
        print(f"All yantras have required fields")


class TestTantraAPI:
    """Test Tantra endpoints - should return 6 practices"""
    
    def test_get_tantra_returns_list(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/tantra")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"GET /api/tantra: {len(data)} practices returned")
    
    def test_get_tantra_returns_6_items(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/tantra")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 6, f"Expected 6 tantra practices, got {len(data)}"
        print(f"Tantra practices count verified: {len(data)}")
    
    def test_tantra_has_required_fields(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/tantra")
        assert response.status_code == 200
        data = response.json()
        required_fields = ["id", "name", "category", "description", "duration", "level", "chakras", "instructions", "color"]
        for practice in data:
            for field in required_fields:
                assert field in practice, f"Tantra practice missing field: {field}"
        print(f"All tantra practices have required fields")
    
    def test_tantra_categories(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/tantra")
        assert response.status_code == 200
        data = response.json()
        categories = set(p["category"] for p in data)
        expected_categories = {"energy", "breathwork", "mantra"}
        assert categories == expected_categories, f"Expected categories {expected_categories}, got {categories}"
        print(f"Tantra categories verified: {categories}")


class TestVideosAPI:
    """Test Videos endpoints - should return 10 videos"""
    
    def test_get_videos_returns_list(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"GET /api/videos: {len(data)} videos returned")
    
    def test_get_videos_returns_10_items(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 10, f"Expected 10 videos, got {len(data)}"
        print(f"Videos count verified: {len(data)}")
    
    def test_video_has_required_fields(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        data = response.json()
        required_fields = ["id", "title", "category", "description", "duration", "level", "thumbnail", "instructor", "tags"]
        for video in data:
            for field in required_fields:
                assert field in video, f"Video missing field: {field}"
        print(f"All videos have required fields")
    
    def test_video_categories(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        data = response.json()
        categories = set(v["category"] for v in data)
        print(f"Video categories found: {categories}")
        # Should have multiple categories
        assert len(categories) >= 4, f"Expected at least 4 video categories, got {len(categories)}"


class TestClassesAPI:
    """Test Classes endpoints - should return 5 classes"""
    
    def test_get_classes_returns_list(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/classes")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"GET /api/classes: {len(data)} classes returned")
    
    def test_get_classes_returns_5_items(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/classes")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5, f"Expected 5 classes, got {len(data)}"
        print(f"Classes count verified: {len(data)}")
    
    def test_class_has_required_fields(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/classes")
        assert response.status_code == 200
        data = response.json()
        required_fields = ["id", "title", "description", "category", "instructor", "duration", "level", "thumbnail", "lessons"]
        for cls in data:
            for field in required_fields:
                assert field in cls, f"Class missing field: {field}"
        print(f"All classes have required fields")
    
    def test_get_class_detail(self, api_client):
        # First get list of classes
        response = api_client.get(f"{BASE_URL}/api/classes")
        assert response.status_code == 200
        classes = response.json()
        
        # Get detail for first class
        class_id = classes[0]["id"]
        response = api_client.get(f"{BASE_URL}/api/classes/{class_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == class_id
        assert "lessons" in data
        print(f"Class detail for {class_id}: {len(data['lessons'])} lessons")


class TestClassEnrollmentAPI:
    """Test Classes enrollment and completion flow"""
    
    def test_enroll_in_class(self, authenticated_client):
        # Get classes
        response = authenticated_client.get(f"{BASE_URL}/api/classes")
        assert response.status_code == 200
        classes = response.json()
        
        # Try to enroll in first class
        class_id = classes[0]["id"]
        response = authenticated_client.post(f"{BASE_URL}/api/classes/enroll", json={
            "class_id": class_id
        })
        # Either 200 (new enrollment) or 400 (already enrolled)
        assert response.status_code in [200, 400], f"Expected 200 or 400, got {response.status_code}"
        if response.status_code == 200:
            data = response.json()
            assert data["class_id"] == class_id
            print(f"Enrolled in class: {class_id}")
        else:
            print(f"Already enrolled in class: {class_id}")
    
    def test_get_my_enrollments(self, authenticated_client):
        response = authenticated_client.get(f"{BASE_URL}/api/classes/my/enrollments")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"User has {len(data)} enrollments")
    
    def test_complete_lesson(self, authenticated_client):
        # Get enrollments
        response = authenticated_client.get(f"{BASE_URL}/api/classes/my/enrollments")
        assert response.status_code == 200
        enrollments = response.json()
        
        if not enrollments:
            # Enroll first
            response = authenticated_client.get(f"{BASE_URL}/api/classes")
            classes = response.json()
            authenticated_client.post(f"{BASE_URL}/api/classes/enroll", json={
                "class_id": classes[0]["id"]
            })
            response = authenticated_client.get(f"{BASE_URL}/api/classes/my/enrollments")
            enrollments = response.json()
        
        if enrollments:
            enrollment = enrollments[0]
            class_id = enrollment["class_id"]
            
            # Get class detail to find a lesson
            response = authenticated_client.get(f"{BASE_URL}/api/classes/{class_id}")
            class_data = response.json()
            lessons = class_data.get("lessons", [])
            
            if lessons:
                lesson_id = lessons[0]["id"]
                response = authenticated_client.post(f"{BASE_URL}/api/classes/complete-lesson", json={
                    "class_id": class_id,
                    "lesson_id": lesson_id
                })
                # Either 200 (completed) or already completed
                assert response.status_code == 200, f"Expected 200, got {response.status_code}"
                data = response.json()
                assert lesson_id in data.get("completed_lessons", [])
                print(f"Completed lesson {lesson_id} in class {class_id}")


class TestCertificationsAPI:
    """Test Certifications endpoint"""
    
    def test_get_my_certifications(self, authenticated_client):
        response = authenticated_client.get(f"{BASE_URL}/api/certifications/my")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"User has {len(data)} certifications")


class TestFrequenciesAPI:
    """Test Frequencies endpoints - should return 12 frequencies"""
    
    def test_get_frequencies_returns_list(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/frequencies")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"GET /api/frequencies: {len(data)} frequencies returned")
    
    def test_get_frequencies_returns_12_items(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/frequencies")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 12, f"Expected 12 frequencies, got {len(data)}"
        print(f"Frequencies count verified: {len(data)}")
    
    def test_frequency_has_required_fields(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/frequencies")
        assert response.status_code == 200
        data = response.json()
        required_fields = ["id", "frequency", "name", "category", "description", "benefits", "chakra", "color"]
        for freq in data:
            for field in required_fields:
                assert field in freq, f"Frequency missing field: {field}"
        print(f"All frequencies have required fields")


class TestOracleAPI:
    """Test Oracle endpoints"""
    
    def test_get_zodiac(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/oracle/zodiac")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 12, f"Expected 12 zodiac signs, got {len(data)}"
        print(f"Zodiac signs: {len(data)}")
    
    def test_get_chinese_zodiac(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/oracle/chinese-zodiac")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 12, f"Expected 12 Chinese zodiac animals, got {len(data)}"
        print(f"Chinese zodiac animals: {len(data)}")
    
    def test_get_sacred_geometry(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/oracle/sacred-geometry")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 5, f"Expected at least 5 sacred geometry patterns, got {len(data)}"
        print(f"Sacred geometry patterns: {len(data)}")


class TestDashboardAPI:
    """Test Dashboard stats endpoint"""
    
    def test_get_dashboard_stats(self, authenticated_client):
        response = authenticated_client.get(f"{BASE_URL}/api/dashboard/stats")
        assert response.status_code == 200
        data = response.json()
        assert "mood_count" in data
        assert "journal_count" in data
        assert "streak" in data
        print(f"Dashboard stats: streak={data['streak']}, moods={data['mood_count']}, journals={data['journal_count']}")


class TestProfileAPI:
    """Test Profile endpoints"""
    
    def test_get_profile_covers(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/profile/covers")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 5, f"Expected at least 5 cover presets, got {len(data)}"
        print(f"Profile cover presets: {len(data)}")
    
    def test_get_my_profile(self, authenticated_client):
        response = authenticated_client.get(f"{BASE_URL}/api/profile/me")
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data or "display_name" in data
        print(f"Profile retrieved successfully")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
