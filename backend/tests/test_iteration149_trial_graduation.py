"""
Iteration 149: Trial Graduation Modal Tests
Tests for:
1. GET /api/subscriptions/trial-summary - returns trial activity data
2. trial-summary for expired trial user shows trial_expired=true with highlights
3. trial-summary for admin user shows has_trial=false
4. my-plan for expired trial user shows trial.expired=true with expired_at
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "kyndsmiles@gmail.com"
ADMIN_PASSWORD = "password"
EXPIRED_TRIAL_EMAIL = "grad_test_522@test.com"
EXPIRED_TRIAL_PASSWORD = "testpass123"


class TestTrialGraduationBackend:
    """Tests for Trial Graduation feature backend endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip(f"Admin login failed: {response.status_code} - {response.text}")
    
    @pytest.fixture(scope="class")
    def expired_trial_token(self):
        """Get expired trial user auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": EXPIRED_TRIAL_EMAIL,
            "password": EXPIRED_TRIAL_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip(f"Expired trial user login failed: {response.status_code} - {response.text}")
    
    # ─── Test 1: trial-summary endpoint exists and returns data ───
    def test_trial_summary_endpoint_exists(self, admin_token):
        """Verify /api/subscriptions/trial-summary endpoint exists"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/subscriptions/trial-summary", headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "has_trial" in data, "Response should contain 'has_trial' field"
    
    # ─── Test 2: Admin user has no trial (has_trial=false) ───
    def test_admin_has_no_trial(self, admin_token):
        """Admin users should have has_trial=false since they don't have trials"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/subscriptions/trial-summary", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("has_trial") == False, f"Admin should have has_trial=false, got: {data}"
    
    # ─── Test 3: Expired trial user shows trial_expired=true ───
    def test_expired_trial_user_shows_expired(self, expired_trial_token):
        """Expired trial user should have trial_expired=true"""
        headers = {"Authorization": f"Bearer {expired_trial_token}"}
        response = requests.get(f"{BASE_URL}/api/subscriptions/trial-summary", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("has_trial") == True, f"Expired trial user should have has_trial=true, got: {data}"
        assert data.get("trial_expired") == True, f"Expired trial user should have trial_expired=true, got: {data}"
    
    # ─── Test 4: trial-summary returns expected fields ───
    def test_trial_summary_response_structure(self, expired_trial_token):
        """Verify trial-summary returns all expected fields"""
        headers = {"Authorization": f"Bearer {expired_trial_token}"}
        response = requests.get(f"{BASE_URL}/api/subscriptions/trial-summary", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        expected_fields = ["has_trial", "trial_active", "trial_expired", "started_at", "expired_at", "credits_used", "highlights", "total_activities"]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}. Response: {data}"
        
        # Verify highlights is a list
        assert isinstance(data.get("highlights"), list), "highlights should be a list"
        
        # Verify total_activities is a number
        assert isinstance(data.get("total_activities"), int), "total_activities should be an integer"
    
    # ─── Test 5: my-plan for expired trial shows trial.expired=true ───
    def test_my_plan_expired_trial_info(self, expired_trial_token):
        """my-plan endpoint should show trial.expired=true with expired_at for expired trial user"""
        headers = {"Authorization": f"Bearer {expired_trial_token}"}
        response = requests.get(f"{BASE_URL}/api/subscriptions/my-plan", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check trial object exists
        assert "trial" in data, f"my-plan should contain 'trial' field for expired trial user. Response: {data}"
        
        trial = data.get("trial", {})
        assert trial.get("expired") == True, f"trial.expired should be true. Got: {trial}"
        assert "expired_at" in trial, f"trial should contain 'expired_at' field. Got: {trial}"
        assert trial.get("expired_at"), f"expired_at should not be empty. Got: {trial}"
    
    # ─── Test 6: my-plan for admin shows no trial ───
    def test_my_plan_admin_no_trial(self, admin_token):
        """Admin user's my-plan should not have trial info (or trial.active=false)"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/subscriptions/my-plan", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Admin should either have no trial field or trial.active=false
        trial = data.get("trial")
        if trial:
            assert trial.get("active") == False, f"Admin trial should not be active. Got: {trial}"
        # If no trial field, that's also acceptable for admin
    
    # ─── Test 7: Verify highlights structure when present ───
    def test_highlights_structure(self, expired_trial_token):
        """Verify each highlight has feature, count, and icon fields"""
        headers = {"Authorization": f"Bearer {expired_trial_token}"}
        response = requests.get(f"{BASE_URL}/api/subscriptions/trial-summary", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        highlights = data.get("highlights", [])
        # If there are highlights, verify structure
        for highlight in highlights:
            assert "feature" in highlight, f"Highlight missing 'feature': {highlight}"
            assert "count" in highlight, f"Highlight missing 'count': {highlight}"
            assert "icon" in highlight, f"Highlight missing 'icon': {highlight}"
            assert isinstance(highlight.get("count"), int), f"count should be int: {highlight}"
    
    # ─── Test 8: Verify credits_used is returned ───
    def test_credits_used_returned(self, expired_trial_token):
        """Verify credits_used field is returned and is a number"""
        headers = {"Authorization": f"Bearer {expired_trial_token}"}
        response = requests.get(f"{BASE_URL}/api/subscriptions/trial-summary", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "credits_used" in data, "credits_used field should be present"
        assert isinstance(data.get("credits_used"), int), f"credits_used should be int, got: {type(data.get('credits_used'))}"
    
    # ─── Test 9: Unauthenticated request returns 401 ───
    def test_trial_summary_requires_auth(self):
        """trial-summary endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/trial-summary")
        
        assert response.status_code in [401, 403], f"Expected 401/403 for unauthenticated request, got {response.status_code}"
    
    # ─── Test 10: my-plan requires auth ───
    def test_my_plan_requires_auth(self):
        """my-plan endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/my-plan")
        
        assert response.status_code in [401, 403], f"Expected 401/403 for unauthenticated request, got {response.status_code}"


class TestTrialGraduationNewUser:
    """Tests for new user with active trial"""
    
    @pytest.fixture(scope="class")
    def new_user_token(self):
        """Register a new user and get token"""
        unique_email = f"TEST_trial_grad_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "testpass123",
            "name": "Trial Grad Test User"
        })
        if response.status_code in [200, 201]:
            return response.json().get("token")
        pytest.skip(f"New user registration failed: {response.status_code} - {response.text}")
    
    def test_new_user_has_active_trial(self, new_user_token):
        """New user should have active trial (has_trial=true, trial_active=true, trial_expired=false)"""
        headers = {"Authorization": f"Bearer {new_user_token}"}
        response = requests.get(f"{BASE_URL}/api/subscriptions/trial-summary", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        # New users get a 7-day Plus trial automatically
        assert data.get("has_trial") == True, f"New user should have has_trial=true. Got: {data}"
        assert data.get("trial_active") == True, f"New user should have trial_active=true. Got: {data}"
        assert data.get("trial_expired") == False, f"New user should have trial_expired=false. Got: {data}"
        assert data.get("started_at"), f"New user should have started_at timestamp. Got: {data}"
