"""
Test suite for Daily Wisdom and Thoth (11th teacher) features
Tests: daily-wisdom endpoint, Thoth teacher data, new mysticism/alchemy themes
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://zero-scale-physics.preview.emergentagent.com').rstrip('/')


class TestDailyWisdom:
    """Tests for GET /api/teachings/daily-wisdom endpoint"""
    
    def test_daily_wisdom_returns_200(self):
        """Daily wisdom endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/teachings/daily-wisdom")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ Daily wisdom endpoint returns 200")
    
    def test_daily_wisdom_has_required_fields(self):
        """Daily wisdom response has all required fields"""
        response = requests.get(f"{BASE_URL}/api/teachings/daily-wisdom")
        data = response.json()
        
        required_fields = ['teacher_id', 'teacher_name', 'tradition', 'color', 
                          'quote', 'teaching_title', 'teaching_excerpt', 'practice', 'date']
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        print(f"✓ Daily wisdom has all required fields: {required_fields}")
    
    def test_daily_wisdom_teacher_id_valid(self):
        """Daily wisdom teacher_id is a valid teacher"""
        response = requests.get(f"{BASE_URL}/api/teachings/daily-wisdom")
        data = response.json()
        
        # Verify teacher exists
        teacher_response = requests.get(f"{BASE_URL}/api/teachings/teacher/{data['teacher_id']}")
        assert teacher_response.status_code == 200, f"Teacher {data['teacher_id']} not found"
        print(f"✓ Daily wisdom teacher '{data['teacher_name']}' is valid")
    
    def test_daily_wisdom_deterministic_per_day(self):
        """Daily wisdom returns same result for same day (deterministic)"""
        response1 = requests.get(f"{BASE_URL}/api/teachings/daily-wisdom")
        response2 = requests.get(f"{BASE_URL}/api/teachings/daily-wisdom")
        
        data1 = response1.json()
        data2 = response2.json()
        
        assert data1['teacher_id'] == data2['teacher_id'], "Teacher should be same for same day"
        assert data1['quote'] == data2['quote'], "Quote should be same for same day"
        assert data1['teaching_title'] == data2['teaching_title'], "Teaching should be same for same day"
        print("✓ Daily wisdom is deterministic (same result for same day)")


class TestThothTeacher:
    """Tests for Thoth / Hermes Trismegistus as 11th teacher"""
    
    def test_teachers_count_is_11(self):
        """Teachers endpoint returns 11 teachers (including Thoth)"""
        response = requests.get(f"{BASE_URL}/api/teachings/teachers")
        data = response.json()
        
        assert len(data['teachers']) == 11, f"Expected 11 teachers, got {len(data['teachers'])}"
        print("✓ Teachers count is 11 (including Thoth)")
    
    def test_thoth_in_teachers_list(self):
        """Thoth is included in teachers list"""
        response = requests.get(f"{BASE_URL}/api/teachings/teachers")
        data = response.json()
        
        teacher_ids = [t['id'] for t in data['teachers']]
        assert 'thoth' in teacher_ids, "Thoth not found in teachers list"
        print("✓ Thoth is in teachers list")
    
    def test_thoth_teacher_detail_returns_200(self):
        """GET /api/teachings/teacher/thoth returns 200"""
        response = requests.get(f"{BASE_URL}/api/teachings/teacher/thoth")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ Thoth teacher detail returns 200")
    
    def test_thoth_has_correct_name(self):
        """Thoth has correct name"""
        response = requests.get(f"{BASE_URL}/api/teachings/teacher/thoth")
        data = response.json()
        
        assert data['name'] == "Thoth / Hermes Trismegistus", f"Unexpected name: {data['name']}"
        print(f"✓ Thoth name is correct: {data['name']}")
    
    def test_thoth_has_correct_tradition(self):
        """Thoth has correct tradition"""
        response = requests.get(f"{BASE_URL}/api/teachings/teacher/thoth")
        data = response.json()
        
        assert data['tradition'] == "Ancient Egyptian Mysticism / Hermeticism", f"Unexpected tradition: {data['tradition']}"
        print(f"✓ Thoth tradition is correct: {data['tradition']}")
    
    def test_thoth_has_5_teachings(self):
        """Thoth has exactly 5 teachings"""
        response = requests.get(f"{BASE_URL}/api/teachings/teacher/thoth")
        data = response.json()
        
        assert len(data['teachings']) == 5, f"Expected 5 teachings, got {len(data['teachings'])}"
        print(f"✓ Thoth has 5 teachings")
    
    def test_thoth_teachings_titles(self):
        """Thoth has correct teaching titles"""
        response = requests.get(f"{BASE_URL}/api/teachings/teacher/thoth")
        data = response.json()
        
        expected_titles = [
            "The Emerald Tablet",
            "The Seven Hermetic Principles",
            "The Book of Coming Forth by Day",
            "The Divine Mind — Nous",
            "The Great Work — Spiritual Alchemy"
        ]
        actual_titles = [t['title'] for t in data['teachings']]
        
        for title in expected_titles:
            assert title in actual_titles, f"Missing teaching: {title}"
        print(f"✓ Thoth has all 5 expected teachings")
    
    def test_thoth_has_8_quotes(self):
        """Thoth has exactly 8 quotes"""
        response = requests.get(f"{BASE_URL}/api/teachings/teacher/thoth")
        data = response.json()
        
        assert len(data['quotes']) == 8, f"Expected 8 quotes, got {len(data['quotes'])}"
        print(f"✓ Thoth has 8 quotes")
    
    def test_thoth_has_correct_themes(self):
        """Thoth has correct themes including mysticism and alchemy"""
        response = requests.get(f"{BASE_URL}/api/teachings/teacher/thoth")
        data = response.json()
        
        expected_themes = ["consciousness", "nature", "harmony", "mysticism", "alchemy"]
        for theme in expected_themes:
            assert theme in data['themes'], f"Missing theme: {theme}"
        print(f"✓ Thoth has correct themes: {data['themes']}")
    
    def test_thoth_core_principle(self):
        """Thoth has correct core principle"""
        response = requests.get(f"{BASE_URL}/api/teachings/teacher/thoth")
        data = response.json()
        
        assert "As above, so below" in data['core_principle'], "Core principle should contain 'As above, so below'"
        print(f"✓ Thoth core principle is correct")


class TestNewThemes:
    """Tests for new mysticism and alchemy themes"""
    
    def test_themes_count_is_11(self):
        """Themes endpoint returns 11 themes"""
        response = requests.get(f"{BASE_URL}/api/teachings/themes")
        data = response.json()
        
        assert len(data['themes']) == 11, f"Expected 11 themes, got {len(data['themes'])}"
        print("✓ Themes count is 11")
    
    def test_mysticism_theme_exists(self):
        """Mysticism theme exists"""
        response = requests.get(f"{BASE_URL}/api/teachings/themes")
        data = response.json()
        
        assert 'mysticism' in data['themes'], "Mysticism theme not found"
        assert data['themes']['mysticism']['label'] == "Mysticism & Alchemy", f"Unexpected label: {data['themes']['mysticism']['label']}"
        print("✓ Mysticism theme exists with correct label")
    
    def test_alchemy_theme_exists(self):
        """Alchemy theme exists"""
        response = requests.get(f"{BASE_URL}/api/teachings/themes")
        data = response.json()
        
        assert 'alchemy' in data['themes'], "Alchemy theme not found"
        assert data['themes']['alchemy']['label'] == "Sacred Transformation", f"Unexpected label: {data['themes']['alchemy']['label']}"
        print("✓ Alchemy theme exists with correct label")
    
    def test_mysticism_theme_includes_thoth(self):
        """Mysticism theme includes Thoth"""
        response = requests.get(f"{BASE_URL}/api/teachings/themes")
        data = response.json()
        
        assert 'thoth' in data['themes']['mysticism']['teachers'], "Thoth not in mysticism theme"
        print("✓ Mysticism theme includes Thoth")
    
    def test_alchemy_theme_includes_thoth(self):
        """Alchemy theme includes Thoth"""
        response = requests.get(f"{BASE_URL}/api/teachings/themes")
        data = response.json()
        
        assert 'thoth' in data['themes']['alchemy']['teachers'], "Thoth not in alchemy theme"
        print("✓ Alchemy theme includes Thoth")
    
    def test_mysticism_theme_endpoint(self):
        """GET /api/teachings/theme/mysticism returns correct data"""
        response = requests.get(f"{BASE_URL}/api/teachings/theme/mysticism")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert 'theme' in data, "Missing theme field"
        assert 'teachers' in data, "Missing teachers field"
        
        teacher_names = [t['teacher_name'] for t in data['teachers']]
        assert "Thoth / Hermes Trismegistus" in teacher_names, "Thoth not in mysticism theme teachers"
        print(f"✓ Mysticism theme endpoint works, includes Thoth")
    
    def test_alchemy_theme_endpoint(self):
        """GET /api/teachings/theme/alchemy returns correct data"""
        response = requests.get(f"{BASE_URL}/api/teachings/theme/alchemy")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert 'theme' in data, "Missing theme field"
        assert 'teachers' in data, "Missing teachers field"
        
        teacher_names = [t['teacher_name'] for t in data['teachers']]
        assert "Thoth / Hermes Trismegistus" in teacher_names, "Thoth not in alchemy theme teachers"
        print(f"✓ Alchemy theme endpoint works, includes Thoth")
    
    def test_thoth_in_consciousness_theme(self):
        """Thoth is included in consciousness theme"""
        response = requests.get(f"{BASE_URL}/api/teachings/themes")
        data = response.json()
        
        assert 'thoth' in data['themes']['consciousness']['teachers'], "Thoth not in consciousness theme"
        print("✓ Thoth is in consciousness theme")
    
    def test_thoth_in_nature_theme(self):
        """Thoth is included in nature theme"""
        response = requests.get(f"{BASE_URL}/api/teachings/themes")
        data = response.json()
        
        assert 'thoth' in data['themes']['nature']['teachers'], "Thoth not in nature theme"
        print("✓ Thoth is in nature theme")


class TestThothTeachingContent:
    """Tests for Thoth teaching content quality"""
    
    def test_emerald_tablet_content(self):
        """Emerald Tablet teaching has proper content"""
        response = requests.get(f"{BASE_URL}/api/teachings/teacher/thoth")
        data = response.json()
        
        emerald = next((t for t in data['teachings'] if t['id'] == 'emerald-tablet'), None)
        assert emerald is not None, "Emerald Tablet teaching not found"
        assert "As above, so below" in emerald['content'] or "Above" in emerald['content'], "Emerald Tablet should mention 'As above, so below'"
        assert 'practice' in emerald, "Teaching should have practice field"
        print("✓ Emerald Tablet teaching has proper content")
    
    def test_seven_principles_content(self):
        """Seven Hermetic Principles teaching has proper content"""
        response = requests.get(f"{BASE_URL}/api/teachings/teacher/thoth")
        data = response.json()
        
        principles = next((t for t in data['teachings'] if t['id'] == 'seven-principles'), None)
        assert principles is not None, "Seven Principles teaching not found"
        assert "MENTALISM" in principles['content'], "Should mention Mentalism principle"
        assert "VIBRATION" in principles['content'], "Should mention Vibration principle"
        print("✓ Seven Hermetic Principles teaching has proper content")
    
    def test_alchemy_teaching_content(self):
        """Spiritual Alchemy teaching has proper content"""
        response = requests.get(f"{BASE_URL}/api/teachings/teacher/thoth")
        data = response.json()
        
        alchemy = next((t for t in data['teachings'] if t['id'] == 'alchemy'), None)
        assert alchemy is not None, "Alchemy teaching not found"
        assert "NIGREDO" in alchemy['content'] or "Solve et Coagula" in alchemy['content'], "Should mention alchemical stages"
        print("✓ Spiritual Alchemy teaching has proper content")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
