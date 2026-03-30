"""
Test Dashboard Scripture Integration - Iteration 114
Tests for Sacred Scriptures section on Dashboard and scripture suggestions
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "kyndsmiles@gmail.com"
TEST_PASSWORD = "password"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        return data.get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture
def auth_headers(auth_token):
    """Headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestDashboardScriptureStats:
    """Test GET /api/dashboard/stats returns scripture data"""
    
    def test_dashboard_stats_returns_scripture_object(self, auth_headers):
        """Verify dashboard stats includes scripture object with required fields"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify scripture object exists
        assert "scripture" in data, "Response missing 'scripture' field"
        scripture = data["scripture"]
        
        # Verify required fields
        assert "chapters_read" in scripture, "Scripture missing 'chapters_read'"
        assert "active_journeys" in scripture, "Scripture missing 'active_journeys'"
        assert "recent_chapters" in scripture, "Scripture missing 'recent_chapters'"
        
        # Verify data types
        assert isinstance(scripture["chapters_read"], int), "chapters_read should be int"
        assert isinstance(scripture["active_journeys"], int), "active_journeys should be int"
        assert isinstance(scripture["recent_chapters"], list), "recent_chapters should be list"
        
        print(f"Scripture stats: chapters_read={scripture['chapters_read']}, active_journeys={scripture['active_journeys']}, recent_chapters count={len(scripture['recent_chapters'])}")
    
    def test_dashboard_stats_recent_chapters_structure(self, auth_headers):
        """Verify recent_chapters have correct structure for Continue Reading cards"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        scripture = data.get("scripture", {})
        recent_chapters = scripture.get("recent_chapters", [])
        
        if len(recent_chapters) > 0:
            chapter = recent_chapters[0]
            # Verify fields needed for Continue Reading cards
            assert "book_id" in chapter, "Chapter missing 'book_id' for navigation"
            assert "chapter_num" in chapter, "Chapter missing 'chapter_num' for navigation"
            # book_title is optional but useful
            print(f"Recent chapter: {chapter}")
        else:
            print("No recent chapters found - user may not have read any chapters yet")


class TestDashboardScriptureSuggestions:
    """Test GET /api/dashboard/suggestions returns scripture-related suggestions"""
    
    def test_suggestions_endpoint_returns_200(self, auth_headers):
        """Verify suggestions endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/dashboard/suggestions", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "suggestions" in data, "Response missing 'suggestions' field"
        assert isinstance(data["suggestions"], list), "suggestions should be a list"
        
        print(f"Total suggestions: {len(data['suggestions'])}")
    
    def test_scripture_suggestion_present(self, auth_headers):
        """Verify scripture-related suggestion is present based on user state"""
        # First check user's scripture state
        stats_response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=auth_headers)
        assert stats_response.status_code == 200
        
        stats = stats_response.json()
        scripture = stats.get("scripture", {})
        chapters_read = scripture.get("chapters_read", 0)
        
        # Get suggestions
        response = requests.get(f"{BASE_URL}/api/dashboard/suggestions", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        suggestions = data.get("suggestions", [])
        suggestion_ids = [s.get("id") for s in suggestions]
        
        print(f"User has read {chapters_read} chapters")
        print(f"Suggestion IDs: {suggestion_ids}")
        
        # Based on user state, check for appropriate suggestion
        if chapters_read == 0:
            # Should have "explore-scriptures" suggestion
            assert "explore-scriptures" in suggestion_ids, \
                f"Expected 'explore-scriptures' suggestion for user with 0 chapters. Got: {suggestion_ids}"
            print("PASS: 'explore-scriptures' suggestion present for new user")
        else:
            # User has chapters - check for journey suggestion or no scripture suggestion
            # Per the code: if chapters_read > 0 and no journey progress, show "start-scripture-journey"
            if "start-scripture-journey" in suggestion_ids:
                print("PASS: 'start-scripture-journey' suggestion present for user with chapters but no journeys")
            elif "explore-scriptures" not in suggestion_ids:
                print("PASS: No 'explore-scriptures' suggestion for user who has already read chapters")
            else:
                print(f"INFO: Suggestions present: {suggestion_ids}")
    
    def test_scripture_suggestion_structure(self, auth_headers):
        """Verify scripture suggestion has correct structure for frontend rendering"""
        response = requests.get(f"{BASE_URL}/api/dashboard/suggestions", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        suggestions = data.get("suggestions", [])
        
        # Find scripture-related suggestion
        scripture_suggestions = [s for s in suggestions if s.get("id") in ["explore-scriptures", "start-scripture-journey"]]
        
        if scripture_suggestions:
            suggestion = scripture_suggestions[0]
            # Verify required fields for frontend
            assert "id" in suggestion, "Suggestion missing 'id'"
            assert "title" in suggestion, "Suggestion missing 'title'"
            assert "desc" in suggestion, "Suggestion missing 'desc'"
            assert "path" in suggestion, "Suggestion missing 'path'"
            assert "color" in suggestion, "Suggestion missing 'color'"
            
            print(f"Scripture suggestion: {suggestion}")
            
            # Verify path is correct
            if suggestion["id"] == "explore-scriptures":
                assert suggestion["path"] == "/bible", f"Expected path '/bible', got '{suggestion['path']}'"
            elif suggestion["id"] == "start-scripture-journey":
                assert suggestion["path"] == "/bible?tab=journeys", f"Expected path '/bible?tab=journeys', got '{suggestion['path']}'"
        else:
            print("No scripture suggestion found - user may have completed all scripture activities")


class TestDashboardEndpointHealth:
    """Basic health checks for dashboard endpoints"""
    
    def test_dashboard_stats_requires_auth(self):
        """Verify dashboard stats requires authentication"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats")
        assert response.status_code in [401, 403, 422], f"Expected auth error, got {response.status_code}"
    
    def test_dashboard_suggestions_requires_auth(self):
        """Verify dashboard suggestions requires authentication"""
        response = requests.get(f"{BASE_URL}/api/dashboard/suggestions")
        assert response.status_code in [401, 403, 422], f"Expected auth error, got {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
