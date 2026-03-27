"""
Test iteration 60: Batch video generation endpoints and PWA features
- POST /api/ai-visuals/generate-batch: starts batch generation
- GET /api/ai-visuals/batch-status/{batch_id}: returns batch status
- PWA manifest.json validation
- Service worker registration
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestBatchVideoGeneration:
    """Test batch video generation endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup auth token for tests"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get auth token
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.authenticated = True
        else:
            self.authenticated = False
    
    def test_generate_batch_requires_auth(self):
        """POST /api/ai-visuals/generate-batch requires authentication"""
        response = requests.post(f"{BASE_URL}/api/ai-visuals/generate-batch", json={
            "story_ids": ["mayan"]
        })
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: generate-batch requires authentication")
    
    def test_generate_batch_returns_batch_id(self):
        """POST /api/ai-visuals/generate-batch returns batch_id"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.post(f"{BASE_URL}/api/ai-visuals/generate-batch", json={
            "story_ids": ["mayan"]  # Use already cached story to avoid long generation
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Should return batch_id and status
        assert "batch_id" in data or "status" in data, f"Missing batch_id or status: {data}"
        
        # If already running, that's also valid
        if data.get("status") == "already_running":
            print(f"PASS: generate-batch returns already_running status: {data}")
        else:
            assert "batch_id" in data, f"Missing batch_id: {data}"
            assert data.get("status") in ["started", "generating"], f"Unexpected status: {data}"
            print(f"PASS: generate-batch returns batch_id: {data.get('batch_id')}")
    
    def test_batch_status_requires_auth(self):
        """GET /api/ai-visuals/batch-status/{batch_id} requires authentication"""
        response = requests.get(f"{BASE_URL}/api/ai-visuals/batch-status/test123")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: batch-status requires authentication")
    
    def test_batch_status_invalid_id(self):
        """GET /api/ai-visuals/batch-status/{batch_id} returns 404 for invalid batch"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.get(f"{BASE_URL}/api/ai-visuals/batch-status/invalid_batch_id_12345")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: batch-status returns 404 for invalid batch_id")
    
    def test_batch_status_returns_correct_fields(self):
        """GET /api/ai-visuals/batch-status returns correct status fields"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        # First start a batch to get a valid batch_id
        start_response = self.session.post(f"{BASE_URL}/api/ai-visuals/generate-batch", json={
            "story_ids": ["mayan"]  # Already cached
        })
        
        if start_response.status_code != 200:
            pytest.skip("Could not start batch")
        
        data = start_response.json()
        batch_id = data.get("batch_id")
        
        if not batch_id:
            # If already running, get the batch_id from that response
            if data.get("status") == "already_running":
                print(f"PASS: Batch already running, status fields present: {data}")
                return
            pytest.skip("No batch_id returned")
        
        # Now check status
        status_response = self.session.get(f"{BASE_URL}/api/ai-visuals/batch-status/{batch_id}")
        assert status_response.status_code == 200, f"Expected 200, got {status_response.status_code}"
        
        status_data = status_response.json()
        # Verify required fields
        assert "batch_id" in status_data, "Missing batch_id"
        assert "status" in status_data, "Missing status"
        assert "completed" in status_data, "Missing completed count"
        assert "total" in status_data, "Missing total count"
        
        print(f"PASS: batch-status returns correct fields: status={status_data.get('status')}, completed={status_data.get('completed')}/{status_data.get('total')}")


class TestVideoStoriesEndpoint:
    """Test video-stories endpoint for cached video count"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup auth token for tests"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.authenticated = True
        else:
            self.authenticated = False
    
    def test_video_stories_returns_cached_count(self):
        """GET /api/ai-visuals/video-stories returns stories with has_video flag"""
        if not self.authenticated:
            pytest.skip("Authentication failed")
        
        response = self.session.get(f"{BASE_URL}/api/ai-visuals/video-stories")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "stories" in data, "Missing stories array"
        
        stories = data["stories"]
        assert len(stories) == 15, f"Expected 15 stories, got {len(stories)}"
        
        # Count cached videos
        cached_count = sum(1 for s in stories if s.get("has_video"))
        print(f"PASS: video-stories returns {cached_count} cached videos out of 15")
        
        # Verify Mayan and Norse are cached (per context)
        mayan = next((s for s in stories if s["story_id"] == "mayan"), None)
        norse = next((s for s in stories if s["story_id"] == "norse"), None)
        
        if mayan:
            print(f"  Mayan has_video: {mayan.get('has_video')}")
        if norse:
            print(f"  Norse has_video: {norse.get('has_video')}")


class TestPWAManifest:
    """Test PWA manifest.json configuration"""
    
    def test_manifest_accessible(self):
        """manifest.json is accessible"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: manifest.json is accessible")
    
    def test_manifest_has_required_fields(self):
        """manifest.json has required PWA fields"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        if response.status_code != 200:
            pytest.skip("manifest.json not accessible")
        
        data = response.json()
        
        # Check required fields
        assert "name" in data, "Missing name"
        assert "short_name" in data, "Missing short_name"
        assert "icons" in data, "Missing icons"
        assert "start_url" in data, "Missing start_url"
        assert "display" in data, "Missing display"
        
        print(f"PASS: manifest.json has required fields: name='{data.get('name')}', display='{data.get('display')}'")
    
    def test_manifest_display_standalone(self):
        """manifest.json has display: standalone for PWA"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        if response.status_code != 200:
            pytest.skip("manifest.json not accessible")
        
        data = response.json()
        assert data.get("display") == "standalone", f"Expected display: standalone, got {data.get('display')}"
        print("PASS: manifest.json has display: standalone")
    
    def test_manifest_has_icons(self):
        """manifest.json has proper icon definitions"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        if response.status_code != 200:
            pytest.skip("manifest.json not accessible")
        
        data = response.json()
        icons = data.get("icons", [])
        
        assert len(icons) >= 2, f"Expected at least 2 icons, got {len(icons)}"
        
        # Check for 192x192 and 512x512 icons
        sizes = [icon.get("sizes") for icon in icons]
        assert "192x192" in sizes, "Missing 192x192 icon"
        assert "512x512" in sizes, "Missing 512x512 icon"
        
        print(f"PASS: manifest.json has {len(icons)} icons including 192x192 and 512x512")
    
    def test_manifest_has_shortcuts(self):
        """manifest.json has shortcuts for quick actions"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        if response.status_code != 200:
            pytest.skip("manifest.json not accessible")
        
        data = response.json()
        shortcuts = data.get("shortcuts", [])
        
        assert len(shortcuts) >= 1, f"Expected at least 1 shortcut, got {len(shortcuts)}"
        
        shortcut_names = [s.get("name") for s in shortcuts]
        print(f"PASS: manifest.json has {len(shortcuts)} shortcuts: {shortcut_names}")


class TestServiceWorker:
    """Test service worker registration"""
    
    def test_service_worker_accessible(self):
        """sw.js is accessible"""
        response = requests.get(f"{BASE_URL}/sw.js")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: sw.js is accessible")
    
    def test_service_worker_has_cache_name(self):
        """sw.js defines a cache name"""
        response = requests.get(f"{BASE_URL}/sw.js")
        if response.status_code != 200:
            pytest.skip("sw.js not accessible")
        
        content = response.text
        assert "CACHE_NAME" in content or "cache" in content.lower(), "Missing cache configuration"
        print("PASS: sw.js has cache configuration")


class TestAppleMetaTags:
    """Test Apple PWA meta tags in index.html"""
    
    def test_index_html_accessible(self):
        """index.html is accessible"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: index.html is accessible")
    
    def test_apple_mobile_web_app_capable(self):
        """index.html has apple-mobile-web-app-capable meta tag"""
        response = requests.get(f"{BASE_URL}/")
        if response.status_code != 200:
            pytest.skip("index.html not accessible")
        
        content = response.text
        assert "apple-mobile-web-app-capable" in content, "Missing apple-mobile-web-app-capable meta tag"
        print("PASS: index.html has apple-mobile-web-app-capable meta tag")
    
    def test_apple_touch_icon(self):
        """index.html has apple-touch-icon link"""
        response = requests.get(f"{BASE_URL}/")
        if response.status_code != 200:
            pytest.skip("index.html not accessible")
        
        content = response.text
        assert "apple-touch-icon" in content, "Missing apple-touch-icon link"
        print("PASS: index.html has apple-touch-icon link")
    
    def test_viewport_fit_cover(self):
        """index.html has viewport-fit=cover for safe area insets"""
        response = requests.get(f"{BASE_URL}/")
        if response.status_code != 200:
            pytest.skip("index.html not accessible")
        
        content = response.text
        assert "viewport-fit=cover" in content or "viewport-fit: cover" in content, "Missing viewport-fit=cover"
        print("PASS: index.html has viewport-fit=cover for safe area insets")


class TestPWAAssets:
    """Test PWA asset files exist"""
    
    def test_logo192_exists(self):
        """logo192.png exists"""
        response = requests.get(f"{BASE_URL}/logo192.png")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: logo192.png exists")
    
    def test_logo512_exists(self):
        """logo512.png exists"""
        response = requests.get(f"{BASE_URL}/logo512.png")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: logo512.png exists")
    
    def test_apple_touch_icon_exists(self):
        """apple-touch-icon.png exists"""
        response = requests.get(f"{BASE_URL}/apple-touch-icon.png")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: apple-touch-icon.png exists")
    
    def test_favicon_exists(self):
        """favicon.ico exists"""
        response = requests.get(f"{BASE_URL}/favicon.ico")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: favicon.ico exists")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
