"""
Test suite for Spiritual Teachings feature
Tests all teachings-related endpoints including:
- GET /api/teachings/teachers - List all 10 spiritual teachers
- GET /api/teachings/teacher/{id} - Get full teacher details with teachings and quotes
- GET /api/teachings/themes - Get all 9 teaching themes
- GET /api/teachings/theme/{id} - Get teachers by theme
- POST /api/teachings/contemplate - Generate AI contemplation (requires auth)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestTeachingsEndpoints:
    """Tests for Spiritual Teachings API endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def get_auth_token(self):
        """Get authentication token for protected endpoints"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        return None
    
    # ========== GET /api/teachings/teachers ==========
    
    def test_get_teachers_returns_200(self):
        """GET /api/teachings/teachers should return 200"""
        response = self.session.get(f"{BASE_URL}/api/teachings/teachers")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: GET /api/teachings/teachers returns 200")
    
    def test_get_teachers_returns_10_teachers(self):
        """GET /api/teachings/teachers should return exactly 10 teachers"""
        response = self.session.get(f"{BASE_URL}/api/teachings/teachers")
        data = response.json()
        assert "teachers" in data, "Response should contain 'teachers' key"
        assert len(data["teachers"]) == 10, f"Expected 10 teachers, got {len(data['teachers'])}"
        print(f"PASS: Returns 10 teachers: {[t['name'] for t in data['teachers']]}")
    
    def test_get_teachers_structure(self):
        """Each teacher should have required fields"""
        response = self.session.get(f"{BASE_URL}/api/teachings/teachers")
        data = response.json()
        required_fields = ["id", "name", "tradition", "era", "color", "bio", "core_principle", "themes", "teaching_count", "quote_count"]
        
        for teacher in data["teachers"]:
            for field in required_fields:
                assert field in teacher, f"Teacher {teacher.get('name', 'unknown')} missing field: {field}"
        print("PASS: All teachers have required fields")
    
    def test_teachers_include_expected_names(self):
        """Teachers should include Buddha, Jesus, Muhammad, Krishna, Lao Tzu, Rumi, Thich Nhat Hanh, Yogananda, Ram Dass, Alan Watts"""
        response = self.session.get(f"{BASE_URL}/api/teachings/teachers")
        data = response.json()
        teacher_ids = [t["id"] for t in data["teachers"]]
        
        expected_ids = ["buddha", "jesus", "muhammad", "krishna", "laotzu", "rumi", "thich-nhat-hanh", "yogananda", "ramdass", "watts"]
        for expected_id in expected_ids:
            assert expected_id in teacher_ids, f"Missing teacher: {expected_id}"
        print(f"PASS: All 10 expected teachers present")
    
    # ========== GET /api/teachings/teacher/{id} ==========
    
    def test_get_teacher_buddha_returns_200(self):
        """GET /api/teachings/teacher/buddha should return 200"""
        response = self.session.get(f"{BASE_URL}/api/teachings/teacher/buddha")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: GET /api/teachings/teacher/buddha returns 200")
    
    def test_get_teacher_buddha_has_5_teachings(self):
        """Buddha should have 5 teachings"""
        response = self.session.get(f"{BASE_URL}/api/teachings/teacher/buddha")
        data = response.json()
        assert "teachings" in data, "Response should contain 'teachings'"
        assert len(data["teachings"]) == 5, f"Expected 5 teachings, got {len(data['teachings'])}"
        print(f"PASS: Buddha has 5 teachings: {[t['title'] for t in data['teachings']]}")
    
    def test_get_teacher_buddha_has_7_quotes(self):
        """Buddha should have 7 quotes"""
        response = self.session.get(f"{BASE_URL}/api/teachings/teacher/buddha")
        data = response.json()
        assert "quotes" in data, "Response should contain 'quotes'"
        assert len(data["quotes"]) == 7, f"Expected 7 quotes, got {len(data['quotes'])}"
        print(f"PASS: Buddha has 7 quotes")
    
    def test_get_teacher_jesus_returns_full_data(self):
        """GET /api/teachings/teacher/jesus should return full teacher data"""
        response = self.session.get(f"{BASE_URL}/api/teachings/teacher/jesus")
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == "jesus"
        assert data["name"] == "Jesus of Nazareth"
        assert "teachings" in data
        assert "quotes" in data
        assert len(data["teachings"]) >= 1
        assert len(data["quotes"]) >= 1
        print(f"PASS: Jesus has {len(data['teachings'])} teachings and {len(data['quotes'])} quotes")
    
    def test_get_teacher_invalid_returns_404(self):
        """GET /api/teachings/teacher/invalid should return 404"""
        response = self.session.get(f"{BASE_URL}/api/teachings/teacher/invalid")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: Invalid teacher returns 404")
    
    def test_get_teacher_teaching_structure(self):
        """Each teaching should have id, title, content, and practice"""
        response = self.session.get(f"{BASE_URL}/api/teachings/teacher/buddha")
        data = response.json()
        
        for teaching in data["teachings"]:
            assert "id" in teaching, "Teaching missing 'id'"
            assert "title" in teaching, "Teaching missing 'title'"
            assert "content" in teaching, "Teaching missing 'content'"
            assert "practice" in teaching, "Teaching missing 'practice'"
        print("PASS: All teachings have required structure")
    
    # ========== GET /api/teachings/themes ==========
    
    def test_get_themes_returns_200(self):
        """GET /api/teachings/themes should return 200"""
        response = self.session.get(f"{BASE_URL}/api/teachings/themes")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: GET /api/teachings/themes returns 200")
    
    def test_get_themes_returns_9_themes(self):
        """GET /api/teachings/themes should return 9 themes"""
        response = self.session.get(f"{BASE_URL}/api/teachings/themes")
        data = response.json()
        assert "themes" in data, "Response should contain 'themes'"
        assert len(data["themes"]) == 9, f"Expected 9 themes, got {len(data['themes'])}"
        print(f"PASS: Returns 9 themes: {list(data['themes'].keys())}")
    
    def test_themes_structure(self):
        """Each theme should have label, color, and teachers"""
        response = self.session.get(f"{BASE_URL}/api/teachings/themes")
        data = response.json()
        
        for theme_id, theme in data["themes"].items():
            assert "label" in theme, f"Theme {theme_id} missing 'label'"
            assert "color" in theme, f"Theme {theme_id} missing 'color'"
            assert "teachers" in theme, f"Theme {theme_id} missing 'teachers'"
            assert isinstance(theme["teachers"], list), f"Theme {theme_id} teachers should be a list"
        print("PASS: All themes have required structure")
    
    # ========== GET /api/teachings/theme/{id} ==========
    
    def test_get_theme_love_returns_200(self):
        """GET /api/teachings/theme/love should return 200"""
        response = self.session.get(f"{BASE_URL}/api/teachings/theme/love")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: GET /api/teachings/theme/love returns 200")
    
    def test_get_theme_love_returns_teachers(self):
        """GET /api/teachings/theme/love should return teachers related to love"""
        response = self.session.get(f"{BASE_URL}/api/teachings/theme/love")
        data = response.json()
        
        assert "theme" in data, "Response should contain 'theme'"
        assert "teachers" in data, "Response should contain 'teachers'"
        assert len(data["teachers"]) > 0, "Should have at least one teacher for love theme"
        
        teacher_ids = [t["teacher_id"] for t in data["teachers"]]
        print(f"PASS: Love theme has teachers: {teacher_ids}")
    
    def test_get_theme_invalid_returns_404(self):
        """GET /api/teachings/theme/invalid should return 404"""
        response = self.session.get(f"{BASE_URL}/api/teachings/theme/invalid")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: Invalid theme returns 404")
    
    # ========== POST /api/teachings/contemplate ==========
    
    def test_contemplate_without_auth_returns_401(self):
        """POST /api/teachings/contemplate without auth should return 401"""
        response = self.session.post(f"{BASE_URL}/api/teachings/contemplate", json={
            "teacher_id": "buddha",
            "teaching_id": "four-noble-truths"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: Contemplate without auth returns 401")
    
    def test_contemplate_with_auth_returns_200(self):
        """POST /api/teachings/contemplate with auth should return 200"""
        token = self.get_auth_token()
        if not token:
            pytest.skip("Could not get auth token")
        
        response = self.session.post(
            f"{BASE_URL}/api/teachings/contemplate",
            json={
                "teacher_id": "buddha",
                "teaching_id": "four-noble-truths"
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "contemplation" in data, "Response should contain 'contemplation'"
        assert "teacher" in data, "Response should contain 'teacher'"
        assert "teaching" in data, "Response should contain 'teaching'"
        print(f"PASS: Contemplate returns contemplation for {data['teacher']} - {data['teaching']}")
    
    def test_contemplate_invalid_teacher_returns_404(self):
        """POST /api/teachings/contemplate with invalid teacher should return 404"""
        token = self.get_auth_token()
        if not token:
            pytest.skip("Could not get auth token")
        
        response = self.session.post(
            f"{BASE_URL}/api/teachings/contemplate",
            json={
                "teacher_id": "invalid",
                "teaching_id": "some-teaching"
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: Contemplate with invalid teacher returns 404")
    
    def test_contemplate_invalid_teaching_returns_404(self):
        """POST /api/teachings/contemplate with invalid teaching should return 404"""
        token = self.get_auth_token()
        if not token:
            pytest.skip("Could not get auth token")
        
        response = self.session.post(
            f"{BASE_URL}/api/teachings/contemplate",
            json={
                "teacher_id": "buddha",
                "teaching_id": "invalid-teaching"
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: Contemplate with invalid teaching returns 404")


class TestAllTeachers:
    """Test each teacher individually"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
    
    @pytest.mark.parametrize("teacher_id,expected_name", [
        ("buddha", "Gautama Buddha"),
        ("jesus", "Jesus of Nazareth"),
        ("muhammad", "Prophet Muhammad"),
        ("krishna", "Lord Krishna"),
        ("laotzu", "Lao Tzu"),
        ("rumi", "Jalal ad-Din Rumi"),
        ("thich-nhat-hanh", "Thich Nhat Hanh"),
        ("yogananda", "Paramahansa Yogananda"),
        ("ramdass", "Ram Dass"),
        ("watts", "Alan Watts"),
    ])
    def test_each_teacher_endpoint(self, teacher_id, expected_name):
        """Test each teacher endpoint returns correct data"""
        response = self.session.get(f"{BASE_URL}/api/teachings/teacher/{teacher_id}")
        assert response.status_code == 200, f"Failed for {teacher_id}"
        data = response.json()
        assert data["name"] == expected_name, f"Expected {expected_name}, got {data['name']}"
        assert len(data["teachings"]) >= 1, f"{teacher_id} should have at least 1 teaching"
        assert len(data["quotes"]) >= 1, f"{teacher_id} should have at least 1 quote"
        print(f"PASS: {expected_name} - {len(data['teachings'])} teachings, {len(data['quotes'])} quotes")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
