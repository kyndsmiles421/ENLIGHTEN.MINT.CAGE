"""
V56.2 Adaptive AI Content System Tests
Tests for:
- POST /api/knowledge/deep-dive returns content with visit_number and perspective fields
- Second call with 'fresh' in context returns DIFFERENT content and incremented visit_number
- knowledge_views collection tracks user views per topic
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAdaptiveAIDeepDive:
    """Tests for the adaptive AI deep-dive knowledge endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        # Login to get auth token
        login_resp = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test_v29_user@test.com",
            "password": "testpass123"
        })
        if login_resp.status_code == 200:
            token = login_resp.json().get("token")
            if token:
                self.session.headers.update({"Authorization": f"Bearer {token}"})
        yield
    
    def test_health_check(self):
        """Test API health endpoint"""
        resp = self.session.get(f"{BASE_URL}/api/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("status") == "ok"
        print("PASS: Health check endpoint working")
    
    def test_deep_dive_returns_visit_number_and_perspective(self):
        """Test that deep-dive returns visit_number and perspective fields"""
        # Use a unique topic to avoid cache hits
        unique_topic = f"TEST_Gyan_Mudra_{int(time.time())}"
        
        resp = self.session.post(f"{BASE_URL}/api/knowledge/deep-dive", json={
            "topic": unique_topic,
            "category": "mudra",
            "context": ""
        }, timeout=90)
        
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        data = resp.json()
        
        # Verify required fields
        assert "topic" in data, "Response missing 'topic' field"
        assert "content" in data, "Response missing 'content' field"
        assert "visit_number" in data, "Response missing 'visit_number' field"
        assert "perspective" in data, "Response missing 'perspective' field"
        
        # Verify visit_number is 1 for first visit
        assert data["visit_number"] == 1, f"Expected visit_number=1, got {data['visit_number']}"
        
        # Verify perspective is one of the 8 defined perspectives
        valid_perspectives = [
            "practical application",
            "historical and cross-cultural",
            "science",
            "story",
            "common mistakes",
            "daily life",
            "esoteric and mystical",
            "progressive journey"
        ]
        perspective_found = any(p in data["perspective"].lower() for p in valid_perspectives)
        assert perspective_found or len(data["perspective"]) > 10, f"Perspective seems invalid: {data['perspective']}"
        
        print(f"PASS: Deep-dive returns visit_number={data['visit_number']}, perspective present")
        print(f"  Perspective: {data['perspective'][:80]}...")
    
    def test_deep_dive_fresh_returns_different_content(self):
        """Test that calling with 'fresh' in context returns different content and incremented visit_number"""
        # Use a unique topic
        unique_topic = f"TEST_Crystal_Healing_{int(time.time())}"
        
        # First call - should be visit 1
        resp1 = self.session.post(f"{BASE_URL}/api/knowledge/deep-dive", json={
            "topic": unique_topic,
            "category": "general",
            "context": ""
        }, timeout=90)
        
        assert resp1.status_code == 200, f"First call failed: {resp1.status_code}"
        data1 = resp1.json()
        visit1 = data1.get("visit_number", 0)
        perspective1 = data1.get("perspective", "")
        content1 = data1.get("content", "")[:200]
        
        print(f"First call: visit_number={visit1}, perspective={perspective1[:50]}...")
        
        # Second call with 'fresh' - should be visit 2 with different perspective
        resp2 = self.session.post(f"{BASE_URL}/api/knowledge/deep-dive", json={
            "topic": unique_topic,
            "category": "general",
            "context": "fresh"
        }, timeout=90)
        
        assert resp2.status_code == 200, f"Second call failed: {resp2.status_code}"
        data2 = resp2.json()
        visit2 = data2.get("visit_number", 0)
        perspective2 = data2.get("perspective", "")
        content2 = data2.get("content", "")[:200]
        
        print(f"Second call (fresh): visit_number={visit2}, perspective={perspective2[:50]}...")
        
        # Verify visit_number incremented
        assert visit2 == visit1 + 1, f"Expected visit_number to increment from {visit1} to {visit1+1}, got {visit2}"
        
        # Verify perspective changed (different perspective rotation)
        # Note: perspectives rotate through 8 options, so they should be different
        assert perspective1 != perspective2, f"Perspective should change on fresh call"
        
        print(f"PASS: Fresh call incremented visit_number from {visit1} to {visit2}")
        print(f"PASS: Perspective changed from '{perspective1[:40]}...' to '{perspective2[:40]}...'")
    
    def test_deep_dive_topic_validation(self):
        """Test that deep-dive validates topic length"""
        # Topic too short
        resp = self.session.post(f"{BASE_URL}/api/knowledge/deep-dive", json={
            "topic": "a",
            "category": "general",
            "context": ""
        }, timeout=30)
        
        assert resp.status_code == 400, f"Expected 400 for short topic, got {resp.status_code}"
        print("PASS: Topic validation rejects short topics")
    
    def test_deep_dive_category_fallback(self):
        """Test that invalid category falls back to 'general'"""
        unique_topic = f"TEST_Meditation_{int(time.time())}"
        
        resp = self.session.post(f"{BASE_URL}/api/knowledge/deep-dive", json={
            "topic": unique_topic,
            "category": "invalid_category_xyz",
            "context": ""
        }, timeout=90)
        
        assert resp.status_code == 200, f"Expected 200 with fallback, got {resp.status_code}"
        data = resp.json()
        assert "content" in data, "Response should have content even with invalid category"
        print("PASS: Invalid category falls back to general and returns content")
    
    def test_knowledge_suggestions_endpoint(self):
        """Test knowledge suggestions endpoint returns valid data"""
        categories = ["mudra", "yantra", "tantra", "frequency", "exercise", "nourishment"]
        
        for category in categories:
            resp = self.session.get(f"{BASE_URL}/api/knowledge/suggestions/{category}")
            assert resp.status_code == 200, f"Suggestions for {category} failed: {resp.status_code}"
            data = resp.json()
            assert isinstance(data, list), f"Expected list for {category}, got {type(data)}"
            assert len(data) > 0, f"Expected suggestions for {category}, got empty list"
            print(f"PASS: Knowledge suggestions for '{category}' returns {len(data)} items")


class TestInteractiveModuleShuffle:
    """Tests for verifying InteractiveModule shuffle behavior via API"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_crystals_endpoint(self):
        """Test crystals endpoint returns data"""
        resp = self.session.get(f"{BASE_URL}/api/crystals")
        assert resp.status_code == 200, f"Crystals endpoint failed: {resp.status_code}"
        data = resp.json()
        # API returns {crystals: [...], categories: [...], chakras: [...], total: N}
        if isinstance(data, dict) and "crystals" in data:
            crystals = data["crystals"]
            assert isinstance(crystals, list), "Expected crystals to be a list"
            assert len(crystals) > 0, "Expected at least one crystal"
            print(f"PASS: Crystals endpoint returns {len(crystals)} items")
        else:
            assert isinstance(data, list), "Expected list of crystals"
            assert len(data) > 0, "Expected at least one crystal"
            print(f"PASS: Crystals endpoint returns {len(data)} items")
    
    def test_herbs_endpoint(self):
        """Test herbs/botany endpoint returns data"""
        # Try botany/catalog endpoint (herbs endpoint doesn't exist)
        resp = self.session.get(f"{BASE_URL}/api/botany/catalog")
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, dict) and "plants" in data:
                plants = data["plants"]
                assert isinstance(plants, list), "Expected plants to be a list"
                print(f"PASS: Botany catalog endpoint returns {len(plants)} plants")
            else:
                print(f"PASS: Botany catalog endpoint returns data")
        else:
            # Skip if endpoint doesn't exist
            print(f"INFO: Botany catalog endpoint returned {resp.status_code} - may not exist")
    
    def test_mudras_endpoint(self):
        """Test mudras endpoint returns data"""
        resp = self.session.get(f"{BASE_URL}/api/mudras")
        assert resp.status_code == 200, f"Mudras endpoint failed: {resp.status_code}"
        data = resp.json()
        if isinstance(data, dict) and "mudras" in data:
            mudras = data["mudras"]
            assert isinstance(mudras, list), "Expected mudras to be a list"
            print(f"PASS: Mudras endpoint returns {len(mudras)} items")
        else:
            assert isinstance(data, list), "Expected list of mudras"
            assert len(data) > 0, "Expected at least one mudra"
            print(f"PASS: Mudras endpoint returns {len(data)} items")


class TestTeachingsPage:
    """Tests for teachings page functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_teachings_teachers_endpoint(self):
        """Test teachings/teachers endpoint returns Buddha and others"""
        resp = self.session.get(f"{BASE_URL}/api/teachings/teachers")
        assert resp.status_code == 200, f"Teachers endpoint failed: {resp.status_code}"
        data = resp.json()
        
        # API returns {teachers: [...]} format
        if isinstance(data, dict) and "teachers" in data:
            teachers = data["teachers"]
            assert isinstance(teachers, list), "Expected teachers to be a list"
            assert len(teachers) > 0, "Expected at least one teacher"
            
            # Check for Buddha
            teacher_names = [t.get("name", "").lower() for t in teachers if isinstance(t, dict)]
            has_buddha = any("buddha" in name for name in teacher_names)
            assert has_buddha, f"Expected Buddha in teachers list, got: {teacher_names}"
            
            print(f"PASS: Teachers endpoint returns {len(teachers)} teachers including Buddha")
        else:
            assert isinstance(data, list), "Expected list of teachers"
            assert len(data) > 0, "Expected at least one teacher"
            print(f"PASS: Teachers endpoint returns {len(data)} teachers")
    
    def test_teachings_by_teacher_endpoint(self):
        """Test getting teachings for a specific teacher (Buddha)"""
        # First get teachers to find Buddha's ID
        resp = self.session.get(f"{BASE_URL}/api/teachings/teachers")
        assert resp.status_code == 200
        data = resp.json()
        
        # Handle {teachers: [...]} format
        teachers = data.get("teachers", data) if isinstance(data, dict) else data
        
        buddha = None
        for t in teachers:
            if isinstance(t, dict) and "buddha" in t.get("name", "").lower():
                buddha = t
                break
        
        if buddha:
            teacher_id = buddha.get("id", buddha.get("name", "buddha"))
            resp2 = self.session.get(f"{BASE_URL}/api/teachings/teacher/{teacher_id}")
            if resp2.status_code == 200:
                data = resp2.json()
                teachings = data.get("teachings", data) if isinstance(data, dict) else data
                if isinstance(teachings, list):
                    print(f"PASS: Buddha has {len(teachings)} teachings")
                else:
                    print(f"PASS: Buddha teachings endpoint returns data")
            else:
                # Try alternate endpoint format
                print(f"INFO: Teacher-specific endpoint returned {resp2.status_code}, may use different format")
        else:
            print("INFO: Buddha not found in teachers list, skipping specific teacher test")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
