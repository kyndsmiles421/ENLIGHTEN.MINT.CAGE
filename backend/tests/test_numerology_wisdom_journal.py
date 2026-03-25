"""
Tests for Numerology and Wisdom Journal features
- Numerology: Life Path, Destiny, Soul Urge, Personality, Birthday numbers
- Numerology Compatibility between two people
- Wisdom Journal: CRUD operations for personal reflections linked to teachings
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestNumerologyCalculate:
    """Tests for POST /api/numerology/calculate endpoint"""
    
    def test_calculate_john_1990_07_15_returns_life_path_5(self):
        """Test specific case: John born 1990-07-15 should have Life Path 5"""
        response = requests.post(f"{BASE_URL}/api/numerology/calculate", json={
            "name": "John",
            "birth_date": "1990-07-15"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify Life Path is 5
        # 1990-07-15: month=7, day=15->6, year=1990->1+9+9+0=19->10->1
        # 7 + 6 + 1 = 14 -> 5
        assert data["life_path"]["number"] == 5, f"Expected Life Path 5, got {data['life_path']['number']}"
        assert data["life_path"]["title"] == "The Freedom Seeker"
        assert data["name"] == "John"
        assert data["birth_date"] == "1990-07-15"
    
    def test_calculate_returns_all_five_numbers(self):
        """Test that calculation returns all 5 numerology numbers"""
        response = requests.post(f"{BASE_URL}/api/numerology/calculate", json={
            "name": "Alice Smith",
            "birth_date": "1985-03-22"
        })
        assert response.status_code == 200
        data = response.json()
        
        # Verify all 5 numbers are present
        assert "life_path" in data
        assert "destiny" in data
        assert "soul_urge" in data
        assert "personality" in data
        assert "birthday" in data
        
        # Verify each has a number
        assert "number" in data["life_path"]
        assert "number" in data["destiny"]
        assert "number" in data["soul_urge"]
        assert "number" in data["personality"]
        assert "number" in data["birthday"]
        
        # Verify life path has full details
        assert "title" in data["life_path"]
        assert "element" in data["life_path"]
        assert "color" in data["life_path"]
        assert "meaning" in data["life_path"]
        assert "strengths" in data["life_path"]
        assert "challenges" in data["life_path"]
        assert "spiritual_lesson" in data["life_path"]
    
    def test_calculate_missing_name_returns_400(self):
        """Test that missing name returns 400 error"""
        response = requests.post(f"{BASE_URL}/api/numerology/calculate", json={
            "birth_date": "1990-07-15"
        })
        assert response.status_code == 400
        assert "Name and birth date required" in response.json().get("detail", "")
    
    def test_calculate_missing_date_returns_400(self):
        """Test that missing birth date returns 400 error"""
        response = requests.post(f"{BASE_URL}/api/numerology/calculate", json={
            "name": "John"
        })
        assert response.status_code == 400
        assert "Name and birth date required" in response.json().get("detail", "")
    
    def test_calculate_empty_name_returns_400(self):
        """Test that empty name returns 400 error"""
        response = requests.post(f"{BASE_URL}/api/numerology/calculate", json={
            "name": "",
            "birth_date": "1990-07-15"
        })
        assert response.status_code == 400
    
    def test_calculate_invalid_date_format_returns_400(self):
        """Test that invalid date format returns 400 error"""
        response = requests.post(f"{BASE_URL}/api/numerology/calculate", json={
            "name": "John",
            "birth_date": "not-a-date"  # Completely invalid format
        })
        assert response.status_code == 400
        assert "Invalid date format" in response.json().get("detail", "")
    
    def test_calculate_master_number_11(self):
        """Test that master number 11 is preserved (not reduced to 2)"""
        # 1992-02-29: month=2, day=29->11 (master), year=1992->21->3
        # 2 + 11 + 3 = 16 -> 7 (not 11 in this case)
        # Let's use a date that gives 11: 1978-11-11
        # month=11 (master), day=11 (master), year=1978->25->7
        # 11 + 11 + 7 = 29 -> 11 (master!)
        response = requests.post(f"{BASE_URL}/api/numerology/calculate", json={
            "name": "Master Test",
            "birth_date": "1978-11-11"
        })
        assert response.status_code == 200
        data = response.json()
        # The life path should be 11 (master number)
        assert data["life_path"]["number"] == 11, f"Expected master number 11, got {data['life_path']['number']}"
        assert data["life_path"]["title"] == "The Illuminator (Master Number)"


class TestNumerologyCompatibility:
    """Tests for POST /api/numerology/compatibility endpoint"""
    
    def test_compatibility_returns_harmony_score_and_dynamic(self):
        """Test that compatibility returns harmony score and dynamic description"""
        response = requests.post(f"{BASE_URL}/api/numerology/compatibility", json={
            "name1": "Alice",
            "date1": "1990-05-15",
            "name2": "Bob",
            "date2": "1988-08-22"
        })
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "person1" in data
        assert "person2" in data
        assert "harmony_score" in data
        assert "dynamic" in data
        
        # Verify person data
        assert data["person1"]["name"] == "Alice"
        assert "life_path" in data["person1"]
        assert "title" in data["person1"]
        assert "color" in data["person1"]
        
        assert data["person2"]["name"] == "Bob"
        assert "life_path" in data["person2"]
        
        # Verify harmony score is a number between 0-100
        assert isinstance(data["harmony_score"], int)
        assert 0 <= data["harmony_score"] <= 100
        
        # Verify dynamic is a non-empty string
        assert isinstance(data["dynamic"], str)
        assert len(data["dynamic"]) > 0
    
    def test_compatibility_missing_data_returns_400(self):
        """Test that missing data returns 400 error"""
        # Missing name2
        response = requests.post(f"{BASE_URL}/api/numerology/compatibility", json={
            "name1": "Alice",
            "date1": "1990-05-15",
            "date2": "1988-08-22"
        })
        assert response.status_code == 400
        assert "Both names and dates required" in response.json().get("detail", "")
    
    def test_compatibility_missing_date_returns_400(self):
        """Test that missing date returns 400 error"""
        response = requests.post(f"{BASE_URL}/api/numerology/compatibility", json={
            "name1": "Alice",
            "date1": "1990-05-15",
            "name2": "Bob"
        })
        assert response.status_code == 400
    
    def test_compatibility_invalid_date_returns_400(self):
        """Test that invalid date format returns 400 error"""
        response = requests.post(f"{BASE_URL}/api/numerology/compatibility", json={
            "name1": "Alice",
            "date1": "invalid-date",
            "name2": "Bob",
            "date2": "1988-08-22"
        })
        assert response.status_code == 400


class TestWisdomJournal:
    """Tests for Wisdom Journal CRUD operations"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed - skipping authenticated tests")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Return headers with auth token"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_get_wisdom_journal_authenticated(self, auth_headers):
        """Test GET /api/wisdom-journal returns entries for authenticated user"""
        response = requests.get(f"{BASE_URL}/api/wisdom-journal", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "entries" in data
        assert isinstance(data["entries"], list)
    
    def test_get_wisdom_journal_unauthenticated_returns_401(self):
        """Test GET /api/wisdom-journal without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/wisdom-journal")
        assert response.status_code == 401
    
    def test_create_wisdom_journal_entry(self, auth_headers):
        """Test POST /api/wisdom-journal creates new reflection entry"""
        entry_data = {
            "teacher_id": "buddha",
            "teacher_name": "Buddha",
            "teaching_id": "four-noble-truths",
            "teaching_title": "The Four Noble Truths",
            "quote": "Pain is inevitable, suffering is optional.",
            "reflection": "TEST_This teaching reminds me that while I cannot control external events, I can control my response to them."
        }
        response = requests.post(f"{BASE_URL}/api/wisdom-journal", json=entry_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "entry" in data
        entry = data["entry"]
        assert "id" in entry
        assert entry["teacher_id"] == "buddha"
        assert entry["teacher_name"] == "Buddha"
        assert entry["teaching_title"] == "The Four Noble Truths"
        assert "TEST_" in entry["reflection"]
        assert "created_at" in entry
        
        # Store entry ID for cleanup
        self.__class__.created_entry_id = entry["id"]
    
    def test_create_wisdom_journal_personal_reflection(self, auth_headers):
        """Test creating a personal reflection without teacher"""
        entry_data = {
            "teacher_id": "",
            "teacher_name": "Personal Reflection",
            "teaching_id": "",
            "teaching_title": "",
            "quote": "",
            "reflection": "TEST_Personal insight about my spiritual journey today."
        }
        response = requests.post(f"{BASE_URL}/api/wisdom-journal", json=entry_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["entry"]["teacher_name"] == "Personal Reflection"
        
        # Store for cleanup
        self.__class__.personal_entry_id = data["entry"]["id"]
    
    def test_verify_entry_persisted(self, auth_headers):
        """Test that created entry appears in GET response"""
        response = requests.get(f"{BASE_URL}/api/wisdom-journal", headers=auth_headers)
        assert response.status_code == 200
        entries = response.json()["entries"]
        
        # Find our test entry
        test_entries = [e for e in entries if "TEST_" in e.get("reflection", "")]
        assert len(test_entries) >= 1, "Created test entry not found in journal"
    
    def test_delete_wisdom_journal_entry(self, auth_headers):
        """Test DELETE /api/wisdom-journal/{id} deletes an entry"""
        # First create an entry to delete
        entry_data = {
            "reflection": "TEST_Entry to be deleted"
        }
        create_response = requests.post(f"{BASE_URL}/api/wisdom-journal", json=entry_data, headers=auth_headers)
        assert create_response.status_code == 200
        entry_id = create_response.json()["entry"]["id"]
        
        # Delete the entry
        delete_response = requests.delete(f"{BASE_URL}/api/wisdom-journal/{entry_id}", headers=auth_headers)
        assert delete_response.status_code == 200
        assert delete_response.json().get("status") == "deleted"
        
        # Verify entry is gone
        get_response = requests.get(f"{BASE_URL}/api/wisdom-journal", headers=auth_headers)
        entries = get_response.json()["entries"]
        entry_ids = [e["id"] for e in entries]
        assert entry_id not in entry_ids, "Deleted entry still exists"
    
    def test_delete_invalid_id_returns_404(self, auth_headers):
        """Test DELETE /api/wisdom-journal/invalid-id returns 404"""
        response = requests.delete(f"{BASE_URL}/api/wisdom-journal/nonexistent-id-12345", headers=auth_headers)
        assert response.status_code == 404
        assert "Entry not found" in response.json().get("detail", "")
    
    def test_delete_unauthenticated_returns_401(self):
        """Test DELETE without auth returns 401"""
        response = requests.delete(f"{BASE_URL}/api/wisdom-journal/some-id")
        assert response.status_code == 401
    
    def test_cleanup_test_entries(self, auth_headers):
        """Cleanup: Delete all TEST_ prefixed entries"""
        response = requests.get(f"{BASE_URL}/api/wisdom-journal", headers=auth_headers)
        if response.status_code == 200:
            entries = response.json()["entries"]
            for entry in entries:
                if "TEST_" in entry.get("reflection", ""):
                    requests.delete(f"{BASE_URL}/api/wisdom-journal/{entry['id']}", headers=auth_headers)


class TestTeachersEndpoint:
    """Test that teachers endpoint works for Wisdom Journal dropdown"""
    
    def test_get_teachers_list(self):
        """Test GET /api/teachings/teachers returns list of teachers"""
        response = requests.get(f"{BASE_URL}/api/teachings/teachers")
        assert response.status_code == 200
        data = response.json()
        assert "teachers" in data
        assert len(data["teachers"]) >= 10  # Should have at least 10 teachers
        
        # Verify teacher structure
        teacher = data["teachers"][0]
        assert "id" in teacher
        assert "name" in teacher
    
    def test_get_teacher_details(self):
        """Test GET /api/teachings/teacher/{id} returns teacher with teachings"""
        response = requests.get(f"{BASE_URL}/api/teachings/teacher/buddha")
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == "buddha"
        assert "teachings" in data
        assert "quotes" in data
        assert len(data["teachings"]) > 0
        assert len(data["quotes"]) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
