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
        else:
            print("⚠️  Skipping authenticated tests due to auth failure")
        
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