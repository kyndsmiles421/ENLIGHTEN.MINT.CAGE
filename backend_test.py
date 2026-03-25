#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Zen Energy Bar App
Tests all endpoints mentioned in the requirements
"""

import requests
import sys
import json
from datetime import datetime

class ZenEnergyAPITester:
    def __init__(self, base_url="https://zen-energy-bar.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.passed_tests = []

    def log_result(self, test_name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            self.passed_tests.append(test_name)
            print(f"✅ {test_name} - PASSED")
        else:
            self.failed_tests.append({"test": test_name, "details": details})
            print(f"❌ {test_name} - FAILED: {details}")

    def make_request(self, method, endpoint, data=None, auth_required=False):
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            
            return response
        except requests.exceptions.RequestException as e:
            return None

    def test_health_check(self):
        """Test GET /api/ returns health check"""
        response = self.make_request('GET', '')
        if response and response.status_code == 200:
            data = response.json()
            if "message" in data and "alive" in data["message"].lower():
                self.log_result("Health Check", True)
                return True
        self.log_result("Health Check", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_exercises_endpoint(self):
        """Test GET /api/exercises returns 6 exercises"""
        response = self.make_request('GET', 'exercises')
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) == 6:
                # Check if exercises have required fields
                required_fields = ['id', 'name', 'category', 'duration', 'level']
                all_valid = all(all(field in ex for field in required_fields) for ex in data)
                if all_valid:
                    self.log_result("Exercises Endpoint", True)
                    return True
                else:
                    self.log_result("Exercises Endpoint", False, "Missing required fields in exercises")
            else:
                self.log_result("Exercises Endpoint", False, f"Expected 6 exercises, got {len(data) if isinstance(data, list) else 'non-list'}")
        else:
            self.log_result("Exercises Endpoint", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_nourishment_endpoint(self):
        """Test GET /api/nourishment returns 8 items"""
        response = self.make_request('GET', 'nourishment')
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) == 8:
                # Check if items have required fields
                required_fields = ['id', 'name', 'category', 'energy_type']
                all_valid = all(all(field in item for field in required_fields) for item in data)
                if all_valid:
                    self.log_result("Nourishment Endpoint", True)
                    return True
                else:
                    self.log_result("Nourishment Endpoint", False, "Missing required fields in nourishment items")
            else:
                self.log_result("Nourishment Endpoint", False, f"Expected 8 items, got {len(data) if isinstance(data, list) else 'non-list'}")
        else:
            self.log_result("Nourishment Endpoint", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_frequencies_endpoint(self):
        """Test GET /api/frequencies returns 12 frequencies"""
        response = self.make_request('GET', 'frequencies')
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) == 12:
                # Check if frequencies have required fields
                required_fields = ['id', 'frequency', 'name', 'category']
                all_valid = all(all(field in freq for field in required_fields) for freq in data)
                if all_valid:
                    self.log_result("Frequencies Endpoint", True)
                    return True
                else:
                    self.log_result("Frequencies Endpoint", False, "Missing required fields in frequencies")
            else:
                self.log_result("Frequencies Endpoint", False, f"Expected 12 frequencies, got {len(data) if isinstance(data, list) else 'non-list'}")
        else:
            self.log_result("Frequencies Endpoint", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_daily_affirmation(self):
        """Test GET /api/affirmations/daily returns a daily affirmation"""
        response = self.make_request('GET', 'affirmations/daily')
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, dict) and 'text' in data and 'date' in data:
                if data['text'] and len(data['text']) > 10:  # Reasonable affirmation length
                    self.log_result("Daily Affirmation", True)
                    return True
                else:
                    self.log_result("Daily Affirmation", False, "Affirmation text too short or empty")
            else:
                self.log_result("Daily Affirmation", False, "Missing required fields (text, date)")
        else:
            self.log_result("Daily Affirmation", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_user_registration(self):
        """Test POST /api/auth/register with test user"""
        user_data = {
            "name": "CosmicTester",
            "email": "cosmic@test.com",
            "password": "cosmic123"
        }
        
        response = self.make_request('POST', 'auth/register', user_data)
        if response and response.status_code == 200:
            data = response.json()
            if 'token' in data and 'user' in data:
                self.token = data['token']
                self.user_id = data['user']['id']
                self.log_result("User Registration", True)
                return True
            else:
                self.log_result("User Registration", False, "Missing token or user in response")
        elif response and response.status_code == 400:
            # User might already exist, try login instead
            return self.test_user_login()
        else:
            self.log_result("User Registration", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_user_login(self):
        """Test POST /api/auth/login with test user"""
        login_data = {
            "email": "cosmic@test.com",
            "password": "cosmic123"
        }
        
        response = self.make_request('POST', 'auth/login', login_data)
        if response and response.status_code == 200:
            data = response.json()
            if 'token' in data and 'user' in data:
                self.token = data['token']
                self.user_id = data['user']['id']
                self.log_result("User Login", True)
                return True
            else:
                self.log_result("User Login", False, "Missing token or user in response")
        else:
            self.log_result("User Login", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_mood_creation(self):
        """Test POST /api/moods with mood data using auth token"""
        if not self.token:
            self.log_result("Mood Creation", False, "No auth token available")
            return False
            
        mood_data = {
            "mood": "Peaceful",
            "intensity": 7,
            "note": "Feeling centered after meditation"
        }
        
        response = self.make_request('POST', 'moods', mood_data, auth_required=True)
        if response and response.status_code == 200:
            data = response.json()
            if 'id' in data and data['mood'] == 'Peaceful' and data['intensity'] == 7:
                self.log_result("Mood Creation", True)
                return True
            else:
                self.log_result("Mood Creation", False, "Invalid mood data in response")
        else:
            self.log_result("Mood Creation", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_mood_history(self):
        """Test GET /api/moods returns mood history using auth token"""
        if not self.token:
            self.log_result("Mood History", False, "No auth token available")
            return False
            
        response = self.make_request('GET', 'moods', auth_required=True)
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_result("Mood History", True)
                return True
            else:
                self.log_result("Mood History", False, "Response is not a list")
        else:
            self.log_result("Mood History", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_journal_creation(self):
        """Test POST /api/journal with journal entry using auth token"""
        if not self.token:
            self.log_result("Journal Creation", False, "No auth token available")
            return False
            
        journal_data = {
            "title": "Test Entry",
            "content": "My reflection on today's meditation practice and energy work.",
            "mood": "Peaceful"
        }
        
        response = self.make_request('POST', 'journal', journal_data, auth_required=True)
        if response and response.status_code == 200:
            data = response.json()
            if 'id' in data and data['title'] == 'Test Entry':
                self.log_result("Journal Creation", True)
                return True
            else:
                self.log_result("Journal Creation", False, "Invalid journal data in response")
        else:
            self.log_result("Journal Creation", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_journal_history(self):
        """Test GET /api/journal returns journal entries using auth token"""
        if not self.token:
            self.log_result("Journal History", False, "No auth token available")
            return False
            
        response = self.make_request('GET', 'journal', auth_required=True)
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_result("Journal History", True)
                return True
            else:
                self.log_result("Journal History", False, "Response is not a list")
        else:
            self.log_result("Journal History", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_dashboard_stats(self):
        """Test GET /api/dashboard/stats returns stats using auth token"""
        if not self.token:
            self.log_result("Dashboard Stats", False, "No auth token available")
            return False
            
        response = self.make_request('GET', 'dashboard/stats', auth_required=True)
        if response and response.status_code == 200:
            data = response.json()
            required_fields = ['mood_count', 'journal_count', 'streak']
            if all(field in data for field in required_fields):
                self.log_result("Dashboard Stats", True)
                return True
            else:
                self.log_result("Dashboard Stats", False, "Missing required stats fields")
        else:
            self.log_result("Dashboard Stats", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_ritual_templates(self):
        """Test GET /api/rituals/templates returns 4 ritual templates"""
        response = self.make_request('GET', 'rituals/templates')
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) == 4:
                # Check if templates have required fields
                required_fields = ['id', 'name', 'time_of_day', 'steps', 'total_duration']
                all_valid = all(all(field in tmpl for field in required_fields) for tmpl in data)
                if all_valid:
                    # Check specific template names
                    template_names = [t['name'] for t in data]
                    expected_names = ['Morning Awakening', 'Evening Unwind', 'Midday Energy Boost', 'Deep Consciousness']
                    if all(name in template_names for name in expected_names):
                        self.log_result("Ritual Templates", True)
                        return True
                    else:
                        self.log_result("Ritual Templates", False, f"Missing expected template names. Got: {template_names}")
                else:
                    self.log_result("Ritual Templates", False, "Missing required fields in templates")
            else:
                self.log_result("Ritual Templates", False, f"Expected 4 templates, got {len(data) if isinstance(data, list) else 'non-list'}")
        else:
            self.log_result("Ritual Templates", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_ritual_creation(self):
        """Test POST /api/rituals creates a custom ritual (requires auth)"""
        if not self.token:
            self.log_result("Ritual Creation", False, "No auth token available")
            return False
            
        ritual_data = {
            "name": "Test Morning Ritual",
            "time_of_day": "morning",
            "steps": [
                {"type": "breathing", "name": "Box Breathing", "duration": 120, "config": None},
                {"type": "meditation", "name": "Quick Center", "duration": 300, "config": None}
            ]
        }
        
        response = self.make_request('POST', 'rituals', ritual_data, auth_required=True)
        if response and response.status_code == 200:
            data = response.json()
            if 'id' in data and data['name'] == 'Test Morning Ritual' and 'steps' in data:
                self.created_ritual_id = data['id']  # Store for later tests
                self.log_result("Ritual Creation", True)
                return True
            else:
                self.log_result("Ritual Creation", False, "Invalid ritual data in response")
        else:
            self.log_result("Ritual Creation", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_get_user_rituals(self):
        """Test GET /api/rituals returns user's saved rituals (requires auth)"""
        if not self.token:
            self.log_result("Get User Rituals", False, "No auth token available")
            return False
            
        response = self.make_request('GET', 'rituals', auth_required=True)
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_result("Get User Rituals", True)
                return True
            else:
                self.log_result("Get User Rituals", False, "Response is not a list")
        else:
            self.log_result("Get User Rituals", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_ritual_completion(self):
        """Test POST /api/rituals/{id}/complete marks ritual as completed (requires auth)"""
        if not self.token:
            self.log_result("Ritual Completion", False, "No auth token available")
            return False
            
        if not hasattr(self, 'created_ritual_id'):
            self.log_result("Ritual Completion", False, "No ritual ID available from creation test")
            return False
            
        completion_data = {
            "duration_seconds": 420,
            "steps_completed": 2
        }
        
        response = self.make_request('POST', f'rituals/{self.created_ritual_id}/complete', completion_data, auth_required=True)
        if response and response.status_code == 200:
            data = response.json()
            if 'id' in data and 'ritual_id' in data and data['duration_seconds'] == 420:
                self.log_result("Ritual Completion", True)
                return True
            else:
                self.log_result("Ritual Completion", False, "Invalid completion data in response")
        else:
            self.log_result("Ritual Completion", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_ritual_history(self):
        """Test GET /api/rituals/history returns completion history with streak/stats (requires auth)"""
        if not self.token:
            self.log_result("Ritual History", False, "No auth token available")
            return False
            
        response = self.make_request('GET', 'rituals/history', auth_required=True)
        if response and response.status_code == 200:
            data = response.json()
            required_fields = ['completions', 'total_sessions', 'total_minutes', 'ritual_streak']
            if all(field in data for field in required_fields):
                if isinstance(data['completions'], list):
                    self.log_result("Ritual History", True)
                    return True
                else:
                    self.log_result("Ritual History", False, "Completions field is not a list")
            else:
                self.log_result("Ritual History", False, "Missing required history fields")
        else:
            self.log_result("Ritual History", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_ritual_deletion(self):
        """Test DELETE /api/rituals/{id} deletes a ritual (requires auth)"""
        if not self.token:
            self.log_result("Ritual Deletion", False, "No auth token available")
            return False
            
        if not hasattr(self, 'created_ritual_id'):
            self.log_result("Ritual Deletion", False, "No ritual ID available from creation test")
            return False
            
        response = self.make_request('DELETE', f'rituals/{self.created_ritual_id}', auth_required=True)
        if response and response.status_code == 200:
            data = response.json()
            if 'deleted' in data and data['deleted'] is True:
                self.log_result("Ritual Deletion", True)
                return True
            else:
                self.log_result("Ritual Deletion", False, "Invalid deletion response")
        else:
            self.log_result("Ritual Deletion", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    # === COMMUNITY API TESTS ===
    
    def test_community_feed(self):
        """Test GET /api/community/feed returns posts with total count"""
        response = self.make_request('GET', 'community/feed')
        if response and response.status_code == 200:
            data = response.json()
            required_fields = ['posts', 'total', 'page', 'has_more']
            if all(field in data for field in required_fields):
                if isinstance(data['posts'], list) and isinstance(data['total'], int):
                    self.log_result("Community Feed", True)
                    return True
                else:
                    self.log_result("Community Feed", False, "Posts should be list, total should be int")
            else:
                self.log_result("Community Feed", False, f"Missing required fields: {required_fields}")
        else:
            self.log_result("Community Feed", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_community_post_creation(self):
        """Test POST /api/community/posts creates a post (requires auth)"""
        if not self.token:
            self.log_result("Community Post Creation", False, "No auth token available")
            return False
            
        post_data = {
            "post_type": "thought",
            "content": "Testing community post creation from backend test",
            "ritual_data": None,
            "affirmation_text": None,
            "milestone_type": None,
            "milestone_value": None
        }
        
        response = self.make_request('POST', 'community/posts', post_data, auth_required=True)
        if response and response.status_code == 200:
            data = response.json()
            if 'id' in data and data['content'] == post_data['content'] and data['post_type'] == 'thought':
                self.created_post_id = data['id']  # Store for later tests
                self.log_result("Community Post Creation", True)
                return True
            else:
                self.log_result("Community Post Creation", False, "Invalid post data in response")
        else:
            self.log_result("Community Post Creation", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_community_post_like(self):
        """Test POST /api/community/posts/{id}/like toggles like on a post (requires auth)"""
        if not self.token:
            self.log_result("Community Post Like", False, "No auth token available")
            return False
            
        if not hasattr(self, 'created_post_id'):
            self.log_result("Community Post Like", False, "No post ID available from creation test")
            return False
            
        response = self.make_request('POST', f'community/posts/{self.created_post_id}/like', {}, auth_required=True)
        if response and response.status_code == 200:
            data = response.json()
            if 'action' in data and 'like_count' in data:
                if data['action'] in ['liked', 'unliked'] and isinstance(data['like_count'], int):
                    self.log_result("Community Post Like", True)
                    return True
                else:
                    self.log_result("Community Post Like", False, "Invalid like response data")
            else:
                self.log_result("Community Post Like", False, "Missing action or like_count in response")
        else:
            self.log_result("Community Post Like", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_community_post_comment(self):
        """Test POST /api/community/posts/{id}/comment adds comment (requires auth)"""
        if not self.token:
            self.log_result("Community Post Comment", False, "No auth token available")
            return False
            
        if not hasattr(self, 'created_post_id'):
            self.log_result("Community Post Comment", False, "No post ID available from creation test")
            return False
            
        comment_data = {"text": "This is a test comment from backend test"}
        
        response = self.make_request('POST', f'community/posts/{self.created_post_id}/comment', comment_data, auth_required=True)
        if response and response.status_code == 200:
            data = response.json()
            if 'id' in data and data['text'] == comment_data['text'] and 'post_id' in data:
                self.created_comment_id = data['id']  # Store for later tests
                self.log_result("Community Post Comment", True)
                return True
            else:
                self.log_result("Community Post Comment", False, "Invalid comment data in response")
        else:
            self.log_result("Community Post Comment", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_community_post_comments_list(self):
        """Test GET /api/community/posts/{id}/comments returns comments list"""
        if not hasattr(self, 'created_post_id'):
            self.log_result("Community Post Comments List", False, "No post ID available from creation test")
            return False
            
        response = self.make_request('GET', f'community/posts/{self.created_post_id}/comments')
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                # Should have at least the comment we created
                if len(data) > 0 and any(c.get('text') == "This is a test comment from backend test" for c in data):
                    self.log_result("Community Post Comments List", True)
                    return True
                else:
                    self.log_result("Community Post Comments List", False, "Expected comment not found in list")
            else:
                self.log_result("Community Post Comments List", False, "Response should be a list")
        else:
            self.log_result("Community Post Comments List", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_community_post_deletion(self):
        """Test DELETE /api/community/posts/{id} deletes own post (requires auth)"""
        if not self.token:
            self.log_result("Community Post Deletion", False, "No auth token available")
            return False
            
        if not hasattr(self, 'created_post_id'):
            self.log_result("Community Post Deletion", False, "No post ID available from creation test")
            return False
            
        response = self.make_request('DELETE', f'community/posts/{self.created_post_id}', auth_required=True)
        if response and response.status_code == 200:
            data = response.json()
            if 'deleted' in data and data['deleted'] is True:
                self.log_result("Community Post Deletion", True)
                return True
            else:
                self.log_result("Community Post Deletion", False, "Invalid deletion response")
        else:
            self.log_result("Community Post Deletion", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_community_follow_toggle(self):
        """Test POST /api/community/follow/{user_id} toggles follow (requires auth)"""
        if not self.token:
            self.log_result("Community Follow Toggle", False, "No auth token available")
            return False
            
        # Use a dummy user ID for testing (we'll use the ritual user ID if we can get it)
        # For now, let's try to get active users first to find someone to follow
        active_response = self.make_request('GET', 'community/users/active')
        if active_response and active_response.status_code == 200:
            active_users = active_response.json()
            if isinstance(active_users, list) and len(active_users) > 0:
                # Find a user that's not us
                target_user = None
                for user in active_users:
                    if user.get('id') != self.user_id:
                        target_user = user
                        break
                
                if target_user:
                    response = self.make_request('POST', f'community/follow/{target_user["id"]}', {}, auth_required=True)
                    if response and response.status_code == 200:
                        data = response.json()
                        if 'action' in data and data['action'] in ['followed', 'unfollowed']:
                            self.log_result("Community Follow Toggle", True)
                            return True
                        else:
                            self.log_result("Community Follow Toggle", False, "Invalid follow response")
                    else:
                        self.log_result("Community Follow Toggle", False, f"Status: {response.status_code if response else 'No response'}")
                else:
                    self.log_result("Community Follow Toggle", False, "No other users found to follow")
            else:
                self.log_result("Community Follow Toggle", False, "No active users found")
        else:
            self.log_result("Community Follow Toggle", False, "Could not get active users list")
        return False

    def test_community_public_profile(self):
        """Test GET /api/community/profile/{user_id} returns public profile with stats"""
        if not self.user_id:
            self.log_result("Community Public Profile", False, "No user ID available")
            return False
            
        response = self.make_request('GET', f'community/profile/{self.user_id}')
        if response and response.status_code == 200:
            data = response.json()
            required_fields = ['id', 'name', 'post_count', 'mood_count', 'journal_count', 'ritual_sessions', 'follower_count', 'following_count']
            if all(field in data for field in required_fields):
                if all(isinstance(data[field], int) for field in ['post_count', 'mood_count', 'journal_count', 'ritual_sessions', 'follower_count', 'following_count']):
                    self.log_result("Community Public Profile", True)
                    return True
                else:
                    self.log_result("Community Public Profile", False, "Count fields should be integers")
            else:
                self.log_result("Community Public Profile", False, f"Missing required fields: {required_fields}")
        else:
            self.log_result("Community Public Profile", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_community_my_following(self):
        """Test GET /api/community/me/following returns list of followed user IDs"""
        if not self.token:
            self.log_result("Community My Following", False, "No auth token available")
            return False
            
        response = self.make_request('GET', 'community/me/following', auth_required=True)
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                # Should be a list of user IDs (strings)
                if all(isinstance(user_id, str) for user_id in data):
                    self.log_result("Community My Following", True)
                    return True
                else:
                    self.log_result("Community My Following", False, "All items should be strings (user IDs)")
            else:
                self.log_result("Community My Following", False, "Response should be a list")
        else:
            self.log_result("Community My Following", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_community_active_users(self):
        """Test GET /api/community/users/active returns active community members"""
        response = self.make_request('GET', 'community/users/active')
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                # Each user should have required fields
                if len(data) > 0:
                    required_fields = ['id', 'name', 'post_count', 'follower_count']
                    if all(all(field in user for field in required_fields) for user in data):
                        self.log_result("Community Active Users", True)
                        return True
                    else:
                        self.log_result("Community Active Users", False, "Missing required fields in user objects")
                else:
                    # Empty list is also valid
                    self.log_result("Community Active Users", True)
                    return True
            else:
                self.log_result("Community Active Users", False, "Response should be a list")
        else:
            self.log_result("Community Active Users", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_ritual_user_login(self):
        """Test login with the ritual test user that has existing posts"""
        login_data = {
            "email": "ritual@test.com",
            "password": "ritual123"
        }
        
        response = self.make_request('POST', 'auth/login', login_data)
        if response and response.status_code == 200:
            data = response.json()
            if 'token' in data and 'user' in data:
                self.ritual_token = data['token']
                self.ritual_user_id = data['user']['id']
                self.log_result("Ritual User Login", True)
                return True
            else:
                self.log_result("Ritual User Login", False, "Missing token or user in response")
        else:
            self.log_result("Ritual User Login", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    # === CHALLENGES API TESTS ===
    
    def test_challenges_list(self):
        """Test GET /api/challenges returns 7 challenge templates with participant counts"""
        response = self.make_request('GET', 'challenges')
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) == 7:
                # Check if challenges have required fields
                required_fields = ['id', 'name', 'description', 'duration_days', 'category', 'difficulty', 'rewards', 'participant_count']
                all_valid = all(all(field in challenge for field in required_fields) for challenge in data)
                if all_valid:
                    # Check specific challenge IDs
                    challenge_ids = [c['id'] for c in data]
                    expected_ids = ['7day-meditation', '14day-breathwork', '21day-ritual', '30day-journal', '7day-qigong', '10day-mood', '5day-frequency']
                    if all(cid in challenge_ids for cid in expected_ids):
                        self.log_result("Challenges List", True)
                        return True
                    else:
                        self.log_result("Challenges List", False, f"Missing expected challenge IDs. Got: {challenge_ids}")
                else:
                    self.log_result("Challenges List", False, "Missing required fields in challenges")
            else:
                self.log_result("Challenges List", False, f"Expected 7 challenges, got {len(data) if isinstance(data, list) else 'non-list'}")
        else:
            self.log_result("Challenges List", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_challenge_join(self):
        """Test POST /api/challenges/{id}/join joins a challenge (requires auth)"""
        if not self.token:
            self.log_result("Challenge Join", False, "No auth token available")
            return False
            
        # Use 7day-qigong as mentioned in the requirements (different from user's existing challenges)
        challenge_id = "7day-qigong"
        
        response = self.make_request('POST', f'challenges/{challenge_id}/join', {}, auth_required=True)
        if response and response.status_code == 200:
            data = response.json()
            required_fields = ['id', 'challenge_id', 'challenge_name', 'user_id', 'joined_at', 'checkins', 'current_streak', 'total_checkins', 'completed']
            if all(field in data for field in required_fields):
                if data['challenge_id'] == challenge_id and data['user_id'] == self.user_id:
                    self.joined_challenge_id = challenge_id  # Store for later tests
                    self.log_result("Challenge Join", True)
                    return True
                else:
                    self.log_result("Challenge Join", False, "Invalid challenge or user ID in response")
            else:
                self.log_result("Challenge Join", False, "Missing required fields in join response")
        elif response and response.status_code == 400:
            # User might already be joined - this is also a valid test result
            error_data = response.json()
            if "Already joined" in error_data.get('detail', ''):
                self.log_result("Challenge Join", True, "User already joined (expected behavior)")
                self.joined_challenge_id = challenge_id
                return True
            else:
                self.log_result("Challenge Join", False, f"Unexpected 400 error: {error_data.get('detail', 'Unknown')}")
        else:
            self.log_result("Challenge Join", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_challenge_checkin(self):
        """Test POST /api/challenges/{id}/checkin daily check-in (requires auth)"""
        if not self.token:
            self.log_result("Challenge Check-in", False, "No auth token available")
            return False
            
        if not hasattr(self, 'joined_challenge_id'):
            self.log_result("Challenge Check-in", False, "No joined challenge ID available")
            return False
            
        checkin_data = {"note": "Test check-in from backend test"}
        
        response = self.make_request('POST', f'challenges/{self.joined_challenge_id}/checkin', checkin_data, auth_required=True)
        if response and response.status_code == 200:
            data = response.json()
            required_fields = ['checkin_date', 'current_streak', 'best_streak', 'total_checkins', 'completed', 'challenge_name']
            if all(field in data for field in required_fields):
                if isinstance(data['current_streak'], int) and isinstance(data['total_checkins'], int):
                    self.log_result("Challenge Check-in", True)
                    return True
                else:
                    self.log_result("Challenge Check-in", False, "Streak and checkin counts should be integers")
            else:
                self.log_result("Challenge Check-in", False, "Missing required fields in checkin response")
        elif response and response.status_code == 400:
            # User might have already checked in today - this is also valid
            error_data = response.json()
            if "Already checked in" in error_data.get('detail', ''):
                self.log_result("Challenge Check-in", True, "Already checked in today (expected behavior)")
                return True
            else:
                self.log_result("Challenge Check-in", False, f"Unexpected 400 error: {error_data.get('detail', 'Unknown')}")
        else:
            self.log_result("Challenge Check-in", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_my_challenges(self):
        """Test GET /api/challenges/my returns user's joined challenges with progress (requires auth)"""
        if not self.token:
            self.log_result("My Challenges", False, "No auth token available")
            return False
            
        response = self.make_request('GET', 'challenges/my', auth_required=True)
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                # Each challenge should have required fields
                if len(data) > 0:
                    required_fields = ['id', 'challenge_id', 'challenge', 'progress', 'current_streak', 'total_checkins', 'completed']
                    if all(all(field in challenge for field in required_fields) for challenge in data):
                        # Check that progress is a percentage (0-100)
                        if all(0 <= challenge['progress'] <= 100 for challenge in data):
                            self.log_result("My Challenges", True)
                            return True
                        else:
                            self.log_result("My Challenges", False, "Progress should be between 0-100")
                    else:
                        self.log_result("My Challenges", False, "Missing required fields in challenge objects")
                else:
                    # Empty list is valid if user hasn't joined any challenges
                    self.log_result("My Challenges", True, "No challenges joined yet (valid)")
                    return True
            else:
                self.log_result("My Challenges", False, "Response should be a list")
        else:
            self.log_result("My Challenges", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_challenge_leaderboard(self):
        """Test GET /api/challenges/{id}/leaderboard returns sorted participants"""
        challenge_id = "7day-meditation"  # Use a challenge that likely has participants
        
        response = self.make_request('GET', f'challenges/{challenge_id}/leaderboard')
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                # Each participant should have required fields
                if len(data) > 0:
                    required_fields = ['user_id', 'user_name', 'current_streak', 'best_streak', 'total_checkins', 'completed']
                    if all(all(field in participant for field in required_fields) for participant in data):
                        # Check that leaderboard is sorted by current_streak (descending)
                        streaks = [p['current_streak'] for p in data]
                        if streaks == sorted(streaks, reverse=True):
                            self.log_result("Challenge Leaderboard", True)
                            return True
                        else:
                            self.log_result("Challenge Leaderboard", False, "Leaderboard not sorted by current_streak descending")
                    else:
                        self.log_result("Challenge Leaderboard", False, "Missing required fields in participant objects")
                else:
                    # Empty list is valid if no participants
                    self.log_result("Challenge Leaderboard", True, "No participants yet (valid)")
                    return True
            else:
                self.log_result("Challenge Leaderboard", False, "Response should be a list")
        else:
            self.log_result("Challenge Leaderboard", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_challenge_details(self):
        """Test GET /api/challenges/{id}/details returns challenge info"""
        challenge_id = "7day-meditation"
        
        response = self.make_request('GET', f'challenges/{challenge_id}/details')
        if response and response.status_code == 200:
            data = response.json()
            required_fields = ['id', 'name', 'description', 'duration_days', 'category', 'difficulty', 'rewards', 'participant_count', 'completion_count']
            if all(field in data for field in required_fields):
                if data['id'] == challenge_id and data['name'] == "7-Day Meditation Marathon":
                    if isinstance(data['participant_count'], int) and isinstance(data['completion_count'], int):
                        self.log_result("Challenge Details", True)
                        return True
                    else:
                        self.log_result("Challenge Details", False, "Participant and completion counts should be integers")
                else:
                    self.log_result("Challenge Details", False, f"Expected challenge ID {challenge_id} and correct name")
            else:
                self.log_result("Challenge Details", False, "Missing required fields in challenge details")
        else:
            self.log_result("Challenge Details", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_ritual_user_challenges(self):
        """Test challenges endpoints with ritual user that has existing challenge data"""
        if not hasattr(self, 'ritual_token'):
            self.log_result("Ritual User Challenges", False, "No ritual user token available")
            return False
            
        # Store current token and switch to ritual user
        old_token = self.token
        old_user_id = self.user_id
        self.token = self.ritual_token
        self.user_id = self.ritual_user_id
        
        # Test my challenges with user that has existing data
        response = self.make_request('GET', 'challenges/my', auth_required=True)
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) >= 2:  # Should have 7day-meditation and 5day-frequency
                # Check that user has the expected challenges
                challenge_ids = [c['challenge_id'] for c in data]
                if '7day-meditation' in challenge_ids and '5day-frequency' in challenge_ids:
                    # Check that each has at least 1 checkin
                    if all(c['total_checkins'] >= 1 for c in data):
                        self.log_result("Ritual User Challenges", True)
                        # Restore original token
                        self.token = old_token
                        self.user_id = old_user_id
                        return True
                    else:
                        self.log_result("Ritual User Challenges", False, "Expected at least 1 checkin for each challenge")
                else:
                    self.log_result("Ritual User Challenges", False, f"Expected 7day-meditation and 5day-frequency, got: {challenge_ids}")
            else:
                self.log_result("Ritual User Challenges", False, f"Expected at least 2 challenges, got {len(data) if isinstance(data, list) else 'non-list'}")
        else:
            self.log_result("Ritual User Challenges", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Restore original token
        self.token = old_token
        self.user_id = old_user_id
        return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Zen Energy Bar Backend API Tests")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test public endpoints first
        self.test_health_check()
        self.test_exercises_endpoint()
        self.test_nourishment_endpoint()
        self.test_frequencies_endpoint()
        self.test_daily_affirmation()
        
        # Test ritual templates (public endpoint)
        self.test_ritual_templates()
        
        # Test community public endpoints
        print("\n🌐 Testing Community Public Endpoints...")
        self.test_community_feed()
        self.test_community_active_users()
        
        # Test authentication
        auth_success = self.test_user_registration()
        if not auth_success:
            auth_success = self.test_user_login()
        
        # Test authenticated endpoints if auth succeeded
        if auth_success:
            self.test_mood_creation()
            self.test_mood_history()
            self.test_journal_creation()
            self.test_journal_history()
            self.test_dashboard_stats()
            
            # Test ritual endpoints (authenticated)
            self.test_ritual_creation()
            self.test_get_user_rituals()
            self.test_ritual_completion()
            self.test_ritual_history()
            self.test_ritual_deletion()
            
            # Test community authenticated endpoints
            print("\n👥 Testing Community Authenticated Endpoints...")
            self.test_community_post_creation()
            self.test_community_post_like()
            self.test_community_post_comment()
            self.test_community_post_comments_list()
            self.test_community_follow_toggle()
            self.test_community_public_profile()
            self.test_community_my_following()
            self.test_community_post_deletion()
        else:
            print("⚠️  Skipping authenticated tests due to auth failure")
        
        # Test with ritual user (has existing posts)
        print("\n🧘 Testing with Ritual User (existing posts)...")
        ritual_auth_success = self.test_ritual_user_login()
        if ritual_auth_success:
            # Test community endpoints with user that has existing data
            old_token = self.token
            old_user_id = self.user_id
            self.token = self.ritual_token
            self.user_id = self.ritual_user_id
            
            self.test_community_public_profile()
            self.test_community_my_following()
            
            # Restore original token
            self.token = old_token
            self.user_id = old_user_id
        
        # Test challenges endpoints
        print("\n🔥 Testing Challenges & Streaks Endpoints...")
        self.test_challenges_list()
        self.test_challenge_details()
        self.test_challenge_leaderboard()
        
        # Test authenticated challenge endpoints if auth succeeded
        if auth_success:
            self.test_challenge_join()
            self.test_challenge_checkin()
            self.test_my_challenges()
        
        # Test challenges with ritual user (has existing challenge data)
        if ritual_auth_success:
            self.test_ritual_user_challenges()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for failure in self.failed_tests:
                print(f"   • {failure['test']}: {failure['details']}")
        
        if self.passed_tests:
            print("\n✅ Passed Tests:")
            for test in self.passed_tests:
                print(f"   • {test}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = ZenEnergyAPITester()
    success = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())