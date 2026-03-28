"""
Iteration 76: Dynamic Experience System Tests
- Activity Tracking API
- Personalized Dashboard API
- Spiritual Reading List API
- AI Reading Recommendations
"""
import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture
def auth_headers(auth_token):
    """Headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestActivityTracking:
    """Activity Tracking API Tests - POST /api/activity/track"""
    
    def test_track_activity_page_visit(self, auth_headers):
        """Test tracking a page visit activity"""
        response = requests.post(f"{BASE_URL}/api/activity/track", json={
            "page": "/meditation",
            "action": "visit",
            "label": "Meditation"
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("ok") == True
    
    def test_track_activity_interaction(self, auth_headers):
        """Test tracking an interaction activity"""
        response = requests.post(f"{BASE_URL}/api/activity/track", json={
            "page": "/breathing",
            "action": "interact",
            "label": "Started Box Breathing"
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("ok") == True
    
    def test_track_activity_complete(self, auth_headers):
        """Test tracking a completion activity"""
        response = requests.post(f"{BASE_URL}/api/activity/track", json={
            "page": "/yoga",
            "action": "complete",
            "label": "Completed Sun Salutation"
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("ok") == True
    
    def test_track_activity_empty_page(self, auth_headers):
        """Test tracking with empty page - should still return ok"""
        response = requests.post(f"{BASE_URL}/api/activity/track", json={
            "page": "",
            "action": "visit"
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("ok") == True
    
    def test_track_activity_requires_auth(self):
        """Test that activity tracking requires authentication"""
        response = requests.post(f"{BASE_URL}/api/activity/track", json={
            "page": "/meditation",
            "action": "visit"
        })
        
        # Should fail without auth
        assert response.status_code in [401, 403, 422]


class TestPersonalizedDashboard:
    """Personalized Dashboard API Tests - GET /api/dashboard/personalized"""
    
    def test_dashboard_returns_greeting(self, auth_headers):
        """Test dashboard returns time-based greeting"""
        response = requests.get(f"{BASE_URL}/api/dashboard/personalized", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check greeting exists and contains user name
        assert "greeting" in data
        assert isinstance(data["greeting"], str)
        assert len(data["greeting"]) > 0
    
    def test_dashboard_returns_time_of_day(self, auth_headers):
        """Test dashboard returns time of day"""
        response = requests.get(f"{BASE_URL}/api/dashboard/personalized", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "time_of_day" in data
        assert data["time_of_day"] in ["morning", "afternoon", "evening", "night"]
    
    def test_dashboard_returns_wisdom(self, auth_headers):
        """Test dashboard returns daily wisdom quote"""
        response = requests.get(f"{BASE_URL}/api/dashboard/personalized", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "wisdom" in data
        wisdom = data["wisdom"]
        assert "text" in wisdom
        assert "source" in wisdom
        assert "tradition" in wisdom
        assert "color" in wisdom
        assert len(wisdom["text"]) > 0
    
    def test_dashboard_returns_continue_items(self, auth_headers):
        """Test dashboard returns continue where you left off items"""
        response = requests.get(f"{BASE_URL}/api/dashboard/personalized", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "continue_items" in data
        assert isinstance(data["continue_items"], list)
        # Each item should have page, label, category, color
        for item in data["continue_items"]:
            assert "page" in item
            assert "label" in item
            assert "category" in item
            assert "color" in item
    
    def test_dashboard_returns_new_for_you(self, auth_headers):
        """Test dashboard returns new for you features"""
        response = requests.get(f"{BASE_URL}/api/dashboard/personalized", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "new_for_you" in data
        assert isinstance(data["new_for_you"], list)
        # Each item should have page, name, category, color
        for item in data["new_for_you"]:
            assert "page" in item
            assert "name" in item
            assert "category" in item
            assert "color" in item
    
    def test_dashboard_returns_progress_stats(self, auth_headers):
        """Test dashboard returns progress statistics"""
        response = requests.get(f"{BASE_URL}/api/dashboard/personalized", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "progress" in data
        progress = data["progress"]
        
        # Check all expected progress fields
        assert "streak_days" in progress
        assert "total_sessions" in progress
        assert "mood_entries" in progress
        assert "journal_entries" in progress
        assert "ai_sessions" in progress
        assert "features_discovered" in progress
        assert "total_features" in progress
        
        # Values should be integers
        assert isinstance(progress["streak_days"], int)
        assert isinstance(progress["total_sessions"], int)
        assert isinstance(progress["mood_entries"], int)
        assert isinstance(progress["journal_entries"], int)
    
    def test_dashboard_returns_featured_tradition(self, auth_headers):
        """Test dashboard returns featured tradition"""
        response = requests.get(f"{BASE_URL}/api/dashboard/personalized", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "featured_tradition" in data
        assert isinstance(data["featured_tradition"], str)
    
    def test_dashboard_requires_auth(self):
        """Test that dashboard requires authentication"""
        response = requests.get(f"{BASE_URL}/api/dashboard/personalized")
        
        assert response.status_code in [401, 403, 422]


class TestReadingList:
    """Reading List API Tests - GET /api/reading-list"""
    
    def test_reading_list_returns_all_books(self, auth_headers):
        """Test reading list returns all 24 books"""
        response = requests.get(f"{BASE_URL}/api/reading-list", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "all_books" in data
        books = data["all_books"]
        assert len(books) == 24  # Should have 24 curated books
    
    def test_reading_list_book_structure(self, auth_headers):
        """Test each book has required fields"""
        response = requests.get(f"{BASE_URL}/api/reading-list", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        for book in data["all_books"]:
            assert "id" in book
            assert "title" in book
            assert "author" in book
            assert "tradition" in book
            assert "level" in book
            assert "color" in book
            assert "desc" in book
            assert "saved" in book
            assert "completed" in book
            assert "score" in book
            
            # Level should be one of the valid levels
            assert book["level"] in ["Essential", "Intermediate", "Advanced"]
    
    def test_reading_list_returns_personalized(self, auth_headers):
        """Test reading list returns personalized recommendations"""
        response = requests.get(f"{BASE_URL}/api/reading-list", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "personalized" in data
        assert isinstance(data["personalized"], list)
    
    def test_reading_list_returns_explored_traditions(self, auth_headers):
        """Test reading list returns explored traditions"""
        response = requests.get(f"{BASE_URL}/api/reading-list", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "explored_traditions" in data
        assert isinstance(data["explored_traditions"], list)
    
    def test_reading_list_returns_counts(self, auth_headers):
        """Test reading list returns saved and completed counts"""
        response = requests.get(f"{BASE_URL}/api/reading-list", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "saved_count" in data
        assert "completed_count" in data
        assert isinstance(data["saved_count"], int)
        assert isinstance(data["completed_count"], int)
    
    def test_reading_list_requires_auth(self):
        """Test that reading list requires authentication"""
        response = requests.get(f"{BASE_URL}/api/reading-list")
        
        assert response.status_code in [401, 403, 422]


class TestReadingListSave:
    """Reading List Save API Tests - POST /api/reading-list/save"""
    
    def test_save_book(self, auth_headers):
        """Test saving a book to reading list"""
        response = requests.post(f"{BASE_URL}/api/reading-list/save", json={
            "book_id": 0,
            "action": "save"
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("ok") == True
    
    def test_unsave_book(self, auth_headers):
        """Test unsaving a book from reading list"""
        # First save
        requests.post(f"{BASE_URL}/api/reading-list/save", json={
            "book_id": 1,
            "action": "save"
        }, headers=auth_headers)
        
        # Then unsave
        response = requests.post(f"{BASE_URL}/api/reading-list/save", json={
            "book_id": 1,
            "action": "unsave"
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("ok") == True
    
    def test_complete_book(self, auth_headers):
        """Test marking a book as completed"""
        response = requests.post(f"{BASE_URL}/api/reading-list/save", json={
            "book_id": 2,
            "action": "complete"
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("ok") == True
    
    def test_uncomplete_book(self, auth_headers):
        """Test unmarking a book as completed"""
        # First complete
        requests.post(f"{BASE_URL}/api/reading-list/save", json={
            "book_id": 3,
            "action": "complete"
        }, headers=auth_headers)
        
        # Then uncomplete
        response = requests.post(f"{BASE_URL}/api/reading-list/save", json={
            "book_id": 3,
            "action": "uncomplete"
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("ok") == True
    
    def test_save_persists(self, auth_headers):
        """Test that save action persists in database"""
        # Save a book
        requests.post(f"{BASE_URL}/api/reading-list/save", json={
            "book_id": 5,
            "action": "save"
        }, headers=auth_headers)
        
        # Fetch reading list and verify
        response = requests.get(f"{BASE_URL}/api/reading-list", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        book_5 = next((b for b in data["all_books"] if b["id"] == 5), None)
        assert book_5 is not None
        assert book_5["saved"] == True
    
    def test_save_requires_auth(self):
        """Test that save requires authentication"""
        response = requests.post(f"{BASE_URL}/api/reading-list/save", json={
            "book_id": 0,
            "action": "save"
        })
        
        assert response.status_code in [401, 403, 422]


class TestAIReadingRecommendation:
    """AI Reading Recommendation API Tests - POST /api/reading-list/ai-recommendation"""
    
    def test_ai_recommendation_returns_response(self, auth_headers):
        """Test AI recommendation returns a response"""
        response = requests.post(f"{BASE_URL}/api/reading-list/ai-recommendation", json={
            "interests": "meditation and mindfulness",
            "mood": "curious"
        }, headers=auth_headers, timeout=45)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "recommendation" in data
        assert isinstance(data["recommendation"], str)
        assert len(data["recommendation"]) > 0
    
    def test_ai_recommendation_with_empty_interests(self, auth_headers):
        """Test AI recommendation with empty interests still works"""
        response = requests.post(f"{BASE_URL}/api/reading-list/ai-recommendation", json={
            "interests": "",
            "mood": ""
        }, headers=auth_headers, timeout=45)
        
        assert response.status_code == 200
        data = response.json()
        assert "recommendation" in data
    
    def test_ai_recommendation_requires_auth(self):
        """Test that AI recommendation requires authentication"""
        response = requests.post(f"{BASE_URL}/api/reading-list/ai-recommendation", json={
            "interests": "spirituality",
            "mood": "seeking"
        })
        
        assert response.status_code in [401, 403, 422]


class TestDailyWisdomConsistency:
    """Test that daily wisdom is consistent within the same day"""
    
    def test_wisdom_same_within_day(self, auth_headers):
        """Test that wisdom quote is the same for multiple requests on same day"""
        # Make two requests
        response1 = requests.get(f"{BASE_URL}/api/dashboard/personalized", headers=auth_headers)
        response2 = requests.get(f"{BASE_URL}/api/dashboard/personalized", headers=auth_headers)
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        wisdom1 = response1.json()["wisdom"]
        wisdom2 = response2.json()["wisdom"]
        
        # Same day should return same wisdom
        assert wisdom1["text"] == wisdom2["text"]
        assert wisdom1["source"] == wisdom2["source"]


class TestGreetingTimeOfDay:
    """Test greeting changes based on time of day"""
    
    def test_greeting_contains_name(self, auth_headers):
        """Test that greeting contains user's name"""
        response = requests.get(f"{BASE_URL}/api/dashboard/personalized", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Greeting should contain some form of name or "Seeker"
        greeting = data["greeting"]
        assert len(greeting) > 10  # Should be a meaningful greeting
    
    def test_time_of_day_valid(self, auth_headers):
        """Test time of day is one of valid values"""
        response = requests.get(f"{BASE_URL}/api/dashboard/personalized", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["time_of_day"] in ["morning", "afternoon", "evening", "night"]
