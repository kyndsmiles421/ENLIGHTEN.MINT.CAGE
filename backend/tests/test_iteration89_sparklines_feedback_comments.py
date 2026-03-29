"""
Iteration 89: Test new features - Sparklines, Feedback, Comments, Smart Suggestions
- Dashboard stats with sparkline data
- Smart suggestions endpoint
- Feedback submission and retrieval
- Community comments CRUD
"""
import pytest
import requests
import os

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
        data = response.json()
        return data.get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Auth headers for authenticated requests"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestDashboardStatsWithSparklines:
    """Test dashboard stats endpoint returns sparkline data"""
    
    def test_dashboard_stats_returns_sparkline(self, auth_headers):
        """GET /api/dashboard/stats should return sparkline object"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "sparkline" in data, "Response should contain 'sparkline' key"
        
        sparkline = data["sparkline"]
        assert "moods" in sparkline, "Sparkline should have 'moods' array"
        assert "journals" in sparkline, "Sparkline should have 'journals' array"
        assert "activity" in sparkline, "Sparkline should have 'activity' array"
        
        # Each sparkline should be a 7-day array
        assert isinstance(sparkline["moods"], list), "moods should be a list"
        assert isinstance(sparkline["journals"], list), "journals should be a list"
        assert isinstance(sparkline["activity"], list), "activity should be a list"
        
        assert len(sparkline["moods"]) == 7, f"moods should have 7 elements, got {len(sparkline['moods'])}"
        assert len(sparkline["journals"]) == 7, f"journals should have 7 elements, got {len(sparkline['journals'])}"
        assert len(sparkline["activity"]) == 7, f"activity should have 7 elements, got {len(sparkline['activity'])}"
        
        print(f"Sparkline data: moods={sparkline['moods']}, journals={sparkline['journals']}, activity={sparkline['activity']}")
    
    def test_dashboard_stats_has_standard_fields(self, auth_headers):
        """Dashboard stats should also have mood_count, journal_count, streak"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "mood_count" in data, "Should have mood_count"
        assert "journal_count" in data, "Should have journal_count"
        assert "streak" in data, "Should have streak"
        
        print(f"Stats: mood_count={data['mood_count']}, journal_count={data['journal_count']}, streak={data['streak']}")


class TestSmartSuggestions:
    """Test smart suggestions endpoint"""
    
    def test_get_suggestions(self, auth_headers):
        """GET /api/dashboard/suggestions should return personalized suggestions"""
        response = requests.get(f"{BASE_URL}/api/dashboard/suggestions", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "suggestions" in data, "Response should contain 'suggestions' key"
        
        suggestions = data["suggestions"]
        assert isinstance(suggestions, list), "suggestions should be a list"
        assert len(suggestions) <= 4, f"Should return max 4 suggestions, got {len(suggestions)}"
        
        # Verify suggestion structure
        for s in suggestions:
            assert "id" in s, "Suggestion should have 'id'"
            assert "title" in s, "Suggestion should have 'title'"
            assert "desc" in s, "Suggestion should have 'desc'"
            assert "path" in s, "Suggestion should have 'path'"
            assert "icon" in s, "Suggestion should have 'icon'"
            assert "color" in s, "Suggestion should have 'color'"
            assert "priority" in s, "Suggestion should have 'priority'"
        
        print(f"Got {len(suggestions)} suggestions: {[s['id'] for s in suggestions]}")
    
    def test_suggestions_require_auth(self):
        """Suggestions endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/dashboard/suggestions")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"


class TestFeedbackSubmission:
    """Test feedback submission and retrieval"""
    
    def test_submit_feedback(self, auth_headers):
        """POST /api/feedback/submit should create feedback"""
        payload = {
            "type": "suggestion",
            "category": "General",
            "message": "TEST_This is a test suggestion from iteration 89",
            "page": "/dashboard"
        }
        response = requests.post(f"{BASE_URL}/api/feedback/submit", json=payload, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("status") == "submitted", f"Expected status 'submitted', got {data.get('status')}"
        assert "id" in data, "Response should contain feedback id"
        
        print(f"Feedback submitted with id: {data['id']}")
        return data["id"]
    
    def test_get_my_feedback(self, auth_headers):
        """GET /api/feedback/my should return user's feedback"""
        response = requests.get(f"{BASE_URL}/api/feedback/my", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "feedback" in data, "Response should contain 'feedback' key"
        
        feedback_list = data["feedback"]
        assert isinstance(feedback_list, list), "feedback should be a list"
        
        # Check if our test feedback is there
        test_feedback = [f for f in feedback_list if "TEST_" in f.get("message", "")]
        print(f"Found {len(test_feedback)} test feedback items out of {len(feedback_list)} total")
        
        if feedback_list:
            f = feedback_list[0]
            assert "id" in f, "Feedback should have 'id'"
            assert "type" in f, "Feedback should have 'type'"
            assert "category" in f, "Feedback should have 'category'"
            assert "message" in f, "Feedback should have 'message'"
            assert "status" in f, "Feedback should have 'status'"
    
    def test_feedback_requires_auth(self):
        """Feedback endpoints should require authentication"""
        # Submit without auth
        response = requests.post(f"{BASE_URL}/api/feedback/submit", json={"message": "test"})
        assert response.status_code in [401, 403], f"Submit should require auth, got {response.status_code}"
        
        # Get my feedback without auth
        response = requests.get(f"{BASE_URL}/api/feedback/my")
        assert response.status_code in [401, 403], f"Get my feedback should require auth, got {response.status_code}"


class TestCommunityComments:
    """Test community comments CRUD"""
    
    def test_get_comments_for_feature(self):
        """GET /api/comments/{feature} should return comments (public endpoint)"""
        response = requests.get(f"{BASE_URL}/api/comments/crystals")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "comments" in data, "Response should contain 'comments' key"
        assert "count" in data, "Response should contain 'count' key"
        
        comments = data["comments"]
        assert isinstance(comments, list), "comments should be a list"
        
        print(f"Found {data['count']} comments for 'crystals' feature")
    
    def test_add_comment(self, auth_headers):
        """POST /api/comments/add should add a comment"""
        payload = {
            "feature": "crystals",
            "text": "TEST_This is a test comment from iteration 89"
        }
        response = requests.post(f"{BASE_URL}/api/comments/add", json=payload, headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("status") == "posted", f"Expected status 'posted', got {data.get('status')}"
        assert "comment" in data, "Response should contain 'comment' object"
        
        comment = data["comment"]
        assert "id" in comment, "Comment should have 'id'"
        assert comment.get("feature") == "crystals", "Comment feature should be 'crystals'"
        assert "TEST_" in comment.get("text", ""), "Comment text should contain our test message"
        
        print(f"Comment added with id: {comment['id']}")
        return comment["id"]
    
    def test_verify_comment_persisted(self, auth_headers):
        """Verify comment was persisted by fetching comments"""
        # First add a comment
        payload = {
            "feature": "blessings",
            "text": "TEST_Verify persistence comment"
        }
        add_response = requests.post(f"{BASE_URL}/api/comments/add", json=payload, headers=auth_headers)
        assert add_response.status_code == 200
        comment_id = add_response.json()["comment"]["id"]
        
        # Now fetch comments for blessings
        get_response = requests.get(f"{BASE_URL}/api/comments/blessings")
        assert get_response.status_code == 200
        
        comments = get_response.json()["comments"]
        found = any(c.get("id") == comment_id for c in comments)
        assert found, f"Comment {comment_id} should be in the comments list"
        
        print(f"Verified comment {comment_id} is persisted in blessings comments")
    
    def test_like_comment(self, auth_headers):
        """POST /api/comments/{id}/like should increment likes"""
        # First add a comment to like
        payload = {
            "feature": "crystals",
            "text": "TEST_Comment to like"
        }
        add_response = requests.post(f"{BASE_URL}/api/comments/add", json=payload, headers=auth_headers)
        assert add_response.status_code == 200
        comment_id = add_response.json()["comment"]["id"]
        
        # Like the comment
        like_response = requests.post(f"{BASE_URL}/api/comments/{comment_id}/like", headers=auth_headers)
        assert like_response.status_code == 200, f"Expected 200, got {like_response.status_code}: {like_response.text}"
        
        data = like_response.json()
        assert data.get("status") == "liked", f"Expected status 'liked', got {data.get('status')}"
        
        # Verify like count increased
        get_response = requests.get(f"{BASE_URL}/api/comments/crystals")
        comments = get_response.json()["comments"]
        liked_comment = next((c for c in comments if c.get("id") == comment_id), None)
        assert liked_comment is not None, "Should find the liked comment"
        assert liked_comment.get("likes", 0) >= 1, f"Likes should be >= 1, got {liked_comment.get('likes')}"
        
        print(f"Comment {comment_id} now has {liked_comment.get('likes')} likes")
    
    def test_like_nonexistent_comment(self, auth_headers):
        """Liking a non-existent comment should return 404"""
        response = requests.post(f"{BASE_URL}/api/comments/nonexistent-id-12345/like", headers=auth_headers)
        assert response.status_code == 404, f"Expected 404 for non-existent comment, got {response.status_code}"
    
    def test_add_comment_requires_auth(self):
        """Adding a comment should require authentication"""
        payload = {
            "feature": "crystals",
            "text": "Unauthorized comment"
        }
        response = requests.post(f"{BASE_URL}/api/comments/add", json=payload)
        assert response.status_code in [401, 403], f"Add comment should require auth, got {response.status_code}"


class TestCoachChatForAssistant:
    """Test coach chat endpoint used by floating assistant"""
    
    def test_coach_chat(self, auth_headers):
        """POST /api/coach/chat should return AI response"""
        payload = {
            "message": "Hello, can you help me with meditation?"
        }
        response = requests.post(f"{BASE_URL}/api/coach/chat", json=payload, headers=auth_headers, timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Response should have either 'reply' or 'message'
        assert "reply" in data or "message" in data, f"Response should have 'reply' or 'message': {data}"
        
        reply = data.get("reply") or data.get("message")
        assert len(reply) > 0, "Reply should not be empty"
        
        print(f"Coach reply (first 100 chars): {reply[:100]}...")
    
    def test_coach_chat_requires_auth(self):
        """Coach chat should require authentication"""
        payload = {"message": "Hello"}
        response = requests.post(f"{BASE_URL}/api/coach/chat", json=payload)
        assert response.status_code in [401, 403], f"Coach chat should require auth, got {response.status_code}"


# Cleanup test data
@pytest.fixture(scope="module", autouse=True)
def cleanup(auth_headers):
    """Cleanup test data after all tests"""
    yield
    # Note: In a real scenario, we'd delete TEST_ prefixed data
    # For now, we just leave it as the data is harmless
    print("Test cleanup: TEST_ prefixed feedback and comments remain in DB")
