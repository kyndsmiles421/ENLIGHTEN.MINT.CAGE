"""
Iteration 430 Backend Tests
- Geology Workshop API verification
- Workshop Registry verification  
- Dead-state audit (journal, moods, sage-fx, coach)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://zero-scale-physics.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "kyndsmiles@gmail.com"
TEST_PASSWORD = "Sovereign2026!"


class TestGeologyWorkshop:
    """Geology Workshop API tests"""
    
    def test_geology_tools_endpoint(self):
        """GET /api/workshop/geology/tools should return 9 tools with Lucide icon names"""
        response = requests.get(f"{BASE_URL}/api/workshop/geology/tools")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "tools" in data, "Response should have 'tools' key"
        
        tools = data["tools"]
        assert len(tools) == 9, f"Expected 9 tools, got {len(tools)}"
        
        # Verify icon_symbol values are Lucide component names
        expected_icons = ["Hammer", "Search", "Droplets", "Layers", "Compass", "Map", "Eye", "Activity", "Cog"]
        actual_icons = [t.get("icon_symbol") for t in tools]
        
        for icon in expected_icons:
            assert icon in actual_icons, f"Expected icon '{icon}' not found in tools"
        
        print(f"SUCCESS: Found {len(tools)} tools with icons: {actual_icons}")
    
    def test_geology_materials_endpoint(self):
        """GET /api/workshop/geology/materials should return geology formations"""
        response = requests.get(f"{BASE_URL}/api/workshop/geology/materials")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        # Check for formations key (geology uses 'formations' as mat_key)
        assert "formations" in data, f"Response should have 'formations' key, got keys: {data.keys()}"
        
        formations = data["formations"]
        assert len(formations) >= 3, f"Expected at least 3 formations, got {len(formations)}"
        
        print(f"SUCCESS: Found {len(formations)} geology formations")


class TestWorkshopRegistry:
    """Workshop Registry API tests"""
    
    def test_registry_endpoint(self):
        """GET /api/workshop/registry should include geology module"""
        response = requests.get(f"{BASE_URL}/api/workshop/registry")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "modules" in data, "Response should have 'modules' key"
        
        modules = data["modules"]
        
        # Find geology module
        geology = next((m for m in modules if m.get("id") == "geology"), None)
        assert geology is not None, "Geology module not found in registry"
        
        assert geology.get("title") == "Geology Workshop", f"Expected title 'Geology Workshop', got {geology.get('title')}"
        assert geology.get("accentColor") == "#6B7280", f"Expected accentColor '#6B7280', got {geology.get('accentColor')}"
        
        print(f"SUCCESS: Geology module found with title='{geology.get('title')}', accentColor='{geology.get('accentColor')}'")


class TestDeadStateAudit:
    """Dead-state audit - verify APIs that buttons should call"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            data = response.json()
            return data.get("token") or data.get("access_token")
        pytest.skip(f"Authentication failed: {response.status_code}")
    
    def test_journal_post(self, auth_token):
        """POST /api/journal should create a journal entry"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        payload = {
            "title": "Test Entry Iteration 430",
            "content": "Test journal entry from iteration 430",
            "mood": "peaceful",
            "tags": ["test", "automation"]
        }
        
        response = requests.post(f"{BASE_URL}/api/journal", json=payload, headers=headers)
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data or "_id" in data or "entry" in data, f"Response should have entry ID, got: {data.keys()}"
        
        print(f"SUCCESS: Journal entry created")
    
    def test_moods_post(self, auth_token):
        """POST /api/moods should create a mood entry"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        payload = {
            "mood": "calm",
            "intensity": 7,
            "notes": "Test mood from iteration 430"
        }
        
        response = requests.post(f"{BASE_URL}/api/moods", json=payload, headers=headers)
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}: {response.text}"
        
        print(f"SUCCESS: Mood entry created")
    
    def test_sage_fx_prompt(self):
        """POST /api/sage-fx/prompt-to-fx should return filters"""
        payload = {"prompt": "sunrise"}
        
        response = requests.post(f"{BASE_URL}/api/sage-fx/prompt-to-fx", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Should return some filter/effect data
        assert data is not None, "Response should not be empty"
        
        print(f"SUCCESS: Sage FX prompt-to-fx returned data")
    
    def test_coach_session_create(self, auth_token):
        """POST /api/coach/sessions should create a session"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        payload = {
            "topic": "Test session from iteration 430",
            "mode": "spiritual"
        }
        
        response = requests.post(f"{BASE_URL}/api/coach/sessions", json=payload, headers=headers)
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}: {response.text}"
        
        data = response.json()
        session_id = data.get("session_id") or data.get("id") or data.get("_id")
        assert session_id is not None, f"Response should have session_id, got: {data.keys()}"
        
        print(f"SUCCESS: Coach session created with id: {session_id}")
        return session_id
    
    def test_coach_chat(self, auth_token):
        """POST /api/coach/chat should return a response"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # First create a session
        session_payload = {"topic": "Chat test", "mode": "spiritual"}
        session_response = requests.post(f"{BASE_URL}/api/coach/sessions", json=session_payload, headers=headers)
        
        if session_response.status_code not in [200, 201]:
            pytest.skip(f"Could not create session: {session_response.status_code}")
        
        session_data = session_response.json()
        session_id = session_data.get("session_id") or session_data.get("id") or session_data.get("_id")
        
        # Now send a chat message
        chat_payload = {
            "session_id": session_id,
            "message": "Hello, this is a test message"
        }
        
        response = requests.post(f"{BASE_URL}/api/coach/chat", json=chat_payload, headers=headers, timeout=60)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "response" in data or "message" in data or "reply" in data, f"Response should have reply, got: {data.keys()}"
        
        print(f"SUCCESS: Coach chat returned response")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
