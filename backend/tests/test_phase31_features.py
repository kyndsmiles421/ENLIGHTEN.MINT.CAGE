"""
Phase 31 Feature Tests: Cosmic Calendar, Certifications, Wellness Reports, Meditation History, Uploads/Media Library
"""
import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture(scope="module")
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture(scope="module")
def auth_token(api_client):
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": "test@test.com",
        "password": "password"
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed")

@pytest.fixture(scope="module")
def authenticated_client(api_client, auth_token):
    api_client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return api_client


# ============ COSMIC CALENDAR TESTS ============
class TestCosmicCalendar:
    """Tests for /api/cosmic-calendar/today endpoint"""
    
    def test_cosmic_calendar_today_default(self, api_client):
        """Test cosmic calendar with default birth date"""
        response = api_client.get(f"{BASE_URL}/api/cosmic-calendar/today")
        assert response.status_code == 200
        data = response.json()
        
        # Verify all 4 cosmic systems are present
        assert "numerology" in data
        assert "moon" in data
        assert "mayan" in data
        assert "cardology" in data
        assert "date" in data
        assert "energy_summary" in data
        print(f"Cosmic Calendar default: date={data['date']}, energy_summary present")
    
    def test_cosmic_calendar_with_birth_params(self, api_client):
        """Test cosmic calendar with specific birth date params"""
        response = api_client.get(f"{BASE_URL}/api/cosmic-calendar/today?birth_month=3&birth_day=15&birth_year=1990")
        assert response.status_code == 200
        data = response.json()
        
        # Verify numerology structure
        assert "personal_year" in data["numerology"]
        assert "personal_month" in data["numerology"]
        assert "personal_day" in data["numerology"]
        assert "number" in data["numerology"]["personal_year"]
        assert "theme" in data["numerology"]["personal_year"]
        print(f"Numerology: Year={data['numerology']['personal_year']['number']}, Theme={data['numerology']['personal_year']['theme']}")
        
        # Verify moon structure
        assert "phase" in data["moon"]
        assert "code" in data["moon"]
        assert "age" in data["moon"]
        assert "guidance" in data["moon"]
        print(f"Moon: phase={data['moon']['phase']}, age={data['moon']['age']} days")
        
        # Verify mayan structure
        assert "kin" in data["mayan"]
        assert "day_sign" in data["mayan"]
        assert "glyph" in data["mayan"]
        assert "tone" in data["mayan"]
        assert "galactic_signature" in data["mayan"]
        print(f"Mayan: kin={data['mayan']['kin']}, signature={data['mayan']['galactic_signature']}")
        
        # Verify cardology structure
        assert "card" in data["cardology"]
        assert "suit" in data["cardology"]
        assert "value" in data["cardology"]
        assert "color" in data["cardology"]
        print(f"Cardology: card={data['cardology']['card']}")


# ============ WELLNESS REPORTS TESTS ============
class TestWellnessReports:
    """Tests for /api/wellness-reports endpoints"""
    
    def test_weekly_report(self, authenticated_client):
        """Test weekly wellness report"""
        response = authenticated_client.get(f"{BASE_URL}/api/wellness-reports/weekly")
        assert response.status_code == 200
        data = response.json()
        
        assert data["period"] == "weekly"
        assert "summary" in data
        assert "activities" in data
        assert "insights" in data
        
        # Verify summary structure
        summary = data["summary"]
        assert "total_activities" in summary
        assert "mood_breakdown" in summary
        assert "dominant_mood" in summary
        assert "avg_intensity" in summary
        print(f"Weekly Report: total_activities={summary['total_activities']}, dominant_mood={summary['dominant_mood']}")
        
        # Verify activities structure
        activities = data["activities"]
        assert "journals" in activities
        assert "meditations" in activities
        assert "yoga_sessions" in activities
        print(f"Weekly Activities: journals={activities['journals']}, meditations={activities['meditations']}")
        
        # Verify insights
        assert isinstance(data["insights"], list)
        print(f"Weekly Insights count: {len(data['insights'])}")
    
    def test_monthly_report(self, authenticated_client):
        """Test monthly wellness report"""
        response = authenticated_client.get(f"{BASE_URL}/api/wellness-reports/monthly")
        assert response.status_code == 200
        data = response.json()
        
        assert data["period"] == "monthly"
        assert "summary" in data
        assert "activities" in data
        assert "insights" in data
        
        summary = data["summary"]
        assert "total_activities" in summary
        assert "mood_breakdown" in summary
        print(f"Monthly Report: total_activities={summary['total_activities']}")
    
    def test_wellness_reports_unauthenticated(self, api_client):
        """Test that wellness reports require authentication"""
        # Remove auth header temporarily
        headers = {"Content-Type": "application/json"}
        response = requests.get(f"{BASE_URL}/api/wellness-reports/weekly", headers=headers)
        assert response.status_code in [401, 403]
        print("Weekly report correctly requires authentication")


# ============ MEDITATION HISTORY TESTS ============
class TestMeditationHistory:
    """Tests for /api/meditation-history endpoints"""
    
    def test_get_meditation_history(self, authenticated_client):
        """Test getting meditation history"""
        response = authenticated_client.get(f"{BASE_URL}/api/meditation-history")
        assert response.status_code == 200
        data = response.json()
        
        assert "sessions" in data
        assert "guided_sessions" in data
        assert "stats" in data
        
        # Verify stats structure
        stats = data["stats"]
        assert "total_sessions" in stats
        assert "total_minutes" in stats
        assert "avg_duration" in stats
        print(f"Meditation History: total_sessions={stats['total_sessions']}, total_minutes={stats['total_minutes']}")
    
    def test_log_meditation_session(self, authenticated_client):
        """Test logging a meditation session"""
        payload = {
            "type": "silent",
            "duration_minutes": 10,
            "focus": "breath",
            "intention": "TEST_Finding inner peace",
            "notes": "TEST_Session notes",
            "mood_before": "anxious",
            "mood_after": "calm",
            "depth_rating": 7
        }
        response = authenticated_client.post(f"{BASE_URL}/api/meditation-history/log", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "logged"
        assert "id" in data
        print(f"Logged meditation session: id={data['id']}")
        
        # Verify session appears in history
        history_response = authenticated_client.get(f"{BASE_URL}/api/meditation-history")
        assert history_response.status_code == 200
        history = history_response.json()
        
        # Check if our session is in the list
        session_found = any(s.get("intention") == "TEST_Finding inner peace" for s in history["sessions"])
        assert session_found, "Logged session should appear in history"
        print("Verified session appears in meditation history")
    
    def test_meditation_history_unauthenticated(self, api_client):
        """Test that meditation history requires authentication"""
        headers = {"Content-Type": "application/json"}
        response = requests.get(f"{BASE_URL}/api/meditation-history", headers=headers)
        assert response.status_code in [401, 403]
        print("Meditation history correctly requires authentication")


# ============ CERTIFICATIONS TESTS ============
class TestCertifications:
    """Tests for /api/certifications endpoints"""
    
    def test_get_my_certifications(self, authenticated_client):
        """Test getting user certifications"""
        response = authenticated_client.get(f"{BASE_URL}/api/certifications/my")
        assert response.status_code == 200
        data = response.json()
        
        # Should return an array (possibly empty)
        assert isinstance(data, list)
        print(f"User has {len(data)} certifications")
        
        # If there are certifications, verify structure
        if len(data) > 0:
            cert = data[0]
            assert "id" in cert or "class_name" in cert
            print(f"First certification: {cert.get('class_name', 'Unknown')}")
    
    def test_certifications_unauthenticated(self, api_client):
        """Test that certifications require authentication"""
        headers = {"Content-Type": "application/json"}
        response = requests.get(f"{BASE_URL}/api/certifications/my", headers=headers)
        assert response.status_code in [401, 403]
        print("Certifications correctly requires authentication")


# ============ UPLOADS/MEDIA LIBRARY TESTS ============
class TestUploads:
    """Tests for /api/uploads endpoints"""
    
    def test_get_my_uploads(self, authenticated_client):
        """Test getting user uploads"""
        response = authenticated_client.get(f"{BASE_URL}/api/uploads/my")
        assert response.status_code == 200
        data = response.json()
        
        assert "uploads" in data
        assert isinstance(data["uploads"], list)
        print(f"User has {len(data['uploads'])} uploads")
    
    def test_upload_media_file(self, authenticated_client, auth_token):
        """Test uploading a media file (multipart/form-data)"""
        # Create a small test audio file (just bytes for testing)
        test_content = b"TEST_AUDIO_CONTENT_" + b"0" * 1000  # Small test file
        
        # Use requests directly for multipart
        files = {
            'file': ('test_meditation.mp3', io.BytesIO(test_content), 'audio/mpeg')
        }
        data = {
            'title': 'TEST_Meditation Audio',
            'description': 'Test upload for testing',
            'media_type': 'audio',
            'tags': 'test,meditation'
        }
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.post(
            f"{BASE_URL}/api/uploads/media",
            files=files,
            data=data,
            headers=headers
        )
        assert response.status_code == 200
        result = response.json()
        
        assert result["status"] == "uploaded"
        assert "id" in result
        assert "filename" in result
        print(f"Uploaded file: id={result['id']}, filename={result['filename']}")
        
        # Store for cleanup
        return result["id"]
    
    def test_upload_invalid_file_type(self, auth_token):
        """Test that invalid file types are rejected"""
        test_content = b"TEST_INVALID_CONTENT"
        
        files = {
            'file': ('test.txt', io.BytesIO(test_content), 'text/plain')
        }
        data = {
            'title': 'Invalid File',
            'media_type': 'audio'
        }
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.post(
            f"{BASE_URL}/api/uploads/media",
            files=files,
            data=data,
            headers=headers
        )
        assert response.status_code == 400
        print("Invalid file type correctly rejected")
    
    def test_uploads_unauthenticated(self, api_client):
        """Test that uploads require authentication"""
        headers = {"Content-Type": "application/json"}
        response = requests.get(f"{BASE_URL}/api/uploads/my", headers=headers)
        assert response.status_code in [401, 403]
        print("Uploads correctly requires authentication")


# ============ REGRESSION TESTS ============
class TestRegression:
    """Regression tests for existing endpoints"""
    
    def test_health_endpoint(self, api_client):
        """Test health endpoint"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print("Health endpoint: OK")
    
    def test_auth_login(self, api_client):
        """Test login endpoint"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        print(f"Login successful: user={data['user'].get('email')}")
    
    def test_acupressure_points(self, api_client):
        """Test acupressure points endpoint"""
        response = api_client.get(f"{BASE_URL}/api/acupressure/points")
        assert response.status_code == 200
        data = response.json()
        # API returns {"points": [...]}
        points = data.get("points", data) if isinstance(data, dict) else data
        assert len(points) == 10
        print(f"Acupressure points: {len(points)} points returned")
    
    def test_reiki_chakras(self, api_client):
        """Test reiki chakras endpoint"""
        response = api_client.get(f"{BASE_URL}/api/reiki/chakras")
        assert response.status_code == 200
        data = response.json()
        # API returns {"chakras": [...]}
        chakras = data.get("chakras", data) if isinstance(data, dict) else data
        assert len(chakras) == 7
        print(f"Reiki chakras: {len(chakras)} chakras returned")
    
    def test_daily_ritual_generate(self, authenticated_client):
        """Test daily ritual generation"""
        response = authenticated_client.get(f"{BASE_URL}/api/daily-ritual/generate?time_of_day=morning")
        assert response.status_code == 200
        data = response.json()
        assert "ritual" in data
        assert "steps" in data["ritual"]
        print(f"Daily ritual: {len(data['ritual']['steps'])} steps generated")
