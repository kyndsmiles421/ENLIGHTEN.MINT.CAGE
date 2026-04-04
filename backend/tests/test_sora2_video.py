"""
Test Sora 2 Video Generation endpoints for iteration 58
- POST /api/ai-visuals/generate-video - Start video generation
- GET /api/ai-visuals/video-status/{job_id} - Poll video status
- GET /api/ai-visuals/video-stories - List stories with video availability
- Static files served at /api/static/videos/
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://zero-scale-physics.preview.emergentagent.com').rstrip('/')

@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "test@test.com",
        "password": "password"
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")

@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestVideoStories:
    """Test video-stories endpoint that lists available stories"""
    
    def test_video_stories_returns_15_stories(self, auth_headers):
        """GET /api/ai-visuals/video-stories returns 15 stories with has_video boolean"""
        response = requests.get(f"{BASE_URL}/api/ai-visuals/video-stories", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "stories" in data, "Response should have 'stories' field"
        assert len(data["stories"]) == 15, f"Expected 15 stories, got {len(data['stories'])}"
        
        # Each story should have story_id and has_video boolean
        for story in data["stories"]:
            assert "story_id" in story, "Each story should have story_id"
            assert "has_video" in story, "Each story should have has_video boolean"
            assert isinstance(story["has_video"], bool), "has_video should be boolean"
        
        # Check that expected story IDs are present
        story_ids = [s["story_id"] for s in data["stories"]]
        expected_ids = ["mayan", "egyptian", "aboriginal", "lakota", "hindu", "norse", "greek", 
                       "japanese", "yoruba", "maori", "chinese", "celtic", "inuit", "aztec", "sumerian"]
        for eid in expected_ids:
            assert eid in story_ids, f"Expected story_id '{eid}' not found"
        
        print(f"PASS: video-stories returns {len(data['stories'])} stories with has_video field")


class TestGenerateVideo:
    """Test video generation endpoint"""
    
    def test_generate_video_with_story_id_returns_status(self, auth_headers):
        """POST /api/ai-visuals/generate-video with story_id returns queued/generating/complete status"""
        response = requests.post(
            f"{BASE_URL}/api/ai-visuals/generate-video",
            json={"story_id": "mayan"},
            headers=auth_headers,
            timeout=30
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Response should have status field
        assert "status" in data, "Response should have 'status' field"
        assert data["status"] in ["queued", "generating", "complete"], f"Unexpected status: {data['status']}"
        
        # If not complete, should have job_id
        if data["status"] in ["queued", "generating"]:
            assert "job_id" in data, "Non-complete status should have job_id"
            assert data["job_id"] is not None, "job_id should not be None for queued/generating"
            print(f"PASS: generate-video returns status='{data['status']}' with job_id='{data['job_id']}'")
        else:
            # If complete, should have video_url
            assert "video_url" in data, "Complete status should have video_url"
            assert data["video_url"] is not None, "video_url should not be None for complete"
            print(f"PASS: generate-video returns status='complete' with video_url='{data['video_url']}'")
    
    def test_generate_video_invalid_story_returns_404(self, auth_headers):
        """POST /api/ai-visuals/generate-video with invalid story_id returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/ai-visuals/generate-video",
            json={"story_id": "invalid_story_xyz"},
            headers=auth_headers,
            timeout=30
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"
        print("PASS: Invalid story_id returns 404")
    
    def test_generate_video_no_params_returns_400(self, auth_headers):
        """POST /api/ai-visuals/generate-video with no story_id or prompt returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/ai-visuals/generate-video",
            json={},
            headers=auth_headers,
            timeout=30
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        print("PASS: No params returns 400")
    
    def test_generate_video_with_custom_prompt(self, auth_headers):
        """POST /api/ai-visuals/generate-video with custom prompt works"""
        response = requests.post(
            f"{BASE_URL}/api/ai-visuals/generate-video",
            json={"prompt": "A cosmic nebula with swirling purple and gold energy"},
            headers=auth_headers,
            timeout=30
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "status" in data
        assert data["status"] in ["queued", "generating", "complete"]
        print(f"PASS: Custom prompt accepted, status='{data['status']}'")


class TestVideoStatus:
    """Test video status polling endpoint"""
    
    def test_video_status_with_valid_job_id(self, auth_headers):
        """GET /api/ai-visuals/video-status/{job_id} returns status for valid job"""
        # First start a video generation to get a job_id
        gen_response = requests.post(
            f"{BASE_URL}/api/ai-visuals/generate-video",
            json={"story_id": "norse"},
            headers=auth_headers,
            timeout=30
        )
        assert gen_response.status_code == 200
        gen_data = gen_response.json()
        
        # If already complete (cached), skip this test
        if gen_data["status"] == "complete":
            print("SKIP: Video already cached, no job_id to poll")
            return
        
        job_id = gen_data.get("job_id")
        assert job_id is not None, "Should have job_id for non-complete status"
        
        # Poll the status
        status_response = requests.get(
            f"{BASE_URL}/api/ai-visuals/video-status/{job_id}",
            headers=auth_headers,
            timeout=30
        )
        assert status_response.status_code == 200, f"Expected 200, got {status_response.status_code}"
        status_data = status_response.json()
        
        assert "job_id" in status_data
        assert "status" in status_data
        assert status_data["status"] in ["queued", "generating", "complete", "failed"]
        
        print(f"PASS: video-status returns status='{status_data['status']}' for job_id='{job_id}'")
    
    def test_video_status_invalid_job_returns_404(self, auth_headers):
        """GET /api/ai-visuals/video-status/invalid_job returns 404"""
        response = requests.get(
            f"{BASE_URL}/api/ai-visuals/video-status/invalid_job_xyz",
            headers=auth_headers,
            timeout=30
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: Invalid job_id returns 404")


class TestStaticVideoFiles:
    """Test static file serving for videos"""
    
    def test_static_videos_path_exists(self, auth_headers):
        """Static files mount at /api/static/videos/ is accessible"""
        # Try to access a non-existent video - should return 404 (not 500)
        response = requests.get(
            f"{BASE_URL}/api/static/videos/nonexistent.mp4",
            headers=auth_headers,
            timeout=10
        )
        # Should be 404 (file not found) not 500 (server error) or 403 (forbidden)
        assert response.status_code == 404, f"Expected 404 for missing file, got {response.status_code}"
        print("PASS: Static videos path is accessible (returns 404 for missing files)")


class TestRegressionCreationStories:
    """Regression tests for creation stories endpoints"""
    
    def test_creation_stories_list_returns_15(self, auth_headers):
        """GET /api/creation-stories returns 15 stories"""
        response = requests.get(f"{BASE_URL}/api/creation-stories", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "stories" in data
        assert len(data["stories"]) == 15, f"Expected 15 stories, got {len(data['stories'])}"
        print(f"PASS: Creation stories returns {len(data['stories'])} stories")
    
    def test_creation_story_detail_mayan(self, auth_headers):
        """GET /api/creation-stories/mayan returns full story"""
        response = requests.get(f"{BASE_URL}/api/creation-stories/mayan", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["id"] == "mayan"
        assert "story" in data
        assert "culture" in data
        print("PASS: Mayan story detail returns full story")
    
    def test_story_scenes_endpoint_works(self, auth_headers):
        """POST /api/ai-visuals/story-scenes/{story_id} returns scenes"""
        response = requests.post(
            f"{BASE_URL}/api/ai-visuals/story-scenes/mayan",
            json={},
            headers=auth_headers,
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        assert "scenes" in data
        assert "total_scenes" in data
        assert data["total_scenes"] == 3
        print("PASS: Story scenes endpoint works")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
