"""
Test restored endpoints: /api/mudras, /api/videos, /api/exercises
These endpoints were broken due to missing JSONResponse import.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestMudrasEndpoint:
    """Test GET /api/mudras - should return 25 mudras with correct data fields"""
    
    def test_mudras_returns_200(self):
        """Verify mudras endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ GET /api/mudras returns 200 OK")
    
    def test_mudras_returns_list(self):
        """Verify mudras endpoint returns a list"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ GET /api/mudras returns list with {len(data)} items")
    
    def test_mudras_count(self):
        """Verify mudras endpoint returns 25 mudras"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        assert len(data) == 25, f"Expected 25 mudras, got {len(data)}"
        print("✓ GET /api/mudras returns exactly 25 mudras")
    
    def test_mudras_data_fields(self):
        """Verify each mudra has required fields"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        required_fields = ['id', 'name', 'sanskrit', 'image_url', 'color', 'chakra', 
                          'element', 'duration', 'benefits', 'description', 'practice',
                          'video_url', 'video_title', 'hand_position', 'category']
        
        for mudra in data:
            for field in required_fields:
                assert field in mudra, f"Mudra {mudra.get('id', 'unknown')} missing field: {field}"
        
        print(f"✓ All {len(data)} mudras have required fields: {', '.join(required_fields)}")
    
    def test_mudras_sample_data(self):
        """Verify sample mudra data is correct"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        
        # Find Gyan Mudra
        gyan = next((m for m in data if m['id'] == 'gyan'), None)
        assert gyan is not None, "Gyan Mudra not found"
        assert gyan['name'] == 'Gyan Mudra', f"Expected 'Gyan Mudra', got {gyan['name']}"
        assert gyan['chakra'] == 'Crown', f"Expected 'Crown' chakra, got {gyan['chakra']}"
        assert gyan['category'] == 'meditation', f"Expected 'meditation' category, got {gyan['category']}"
        
        print("✓ Gyan Mudra data verified: name, chakra, category correct")


class TestVideosEndpoint:
    """Test GET /api/videos - should return 23 videos with correct data fields"""
    
    def test_videos_returns_200(self):
        """Verify videos endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ GET /api/videos returns 200 OK")
    
    def test_videos_returns_list(self):
        """Verify videos endpoint returns a list"""
        response = requests.get(f"{BASE_URL}/api/videos")
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ GET /api/videos returns list with {len(data)} items")
    
    def test_videos_count(self):
        """Verify videos endpoint returns 23 videos"""
        response = requests.get(f"{BASE_URL}/api/videos")
        data = response.json()
        assert len(data) == 23, f"Expected 23 videos, got {len(data)}"
        print("✓ GET /api/videos returns exactly 23 videos")
    
    def test_videos_data_fields(self):
        """Verify each video has required fields"""
        response = requests.get(f"{BASE_URL}/api/videos")
        data = response.json()
        required_fields = ['id', 'title', 'category', 'video_url', 'thumbnail', 
                          'description', 'duration', 'level', 'instructor', 'tags']
        
        for video in data:
            for field in required_fields:
                assert field in video, f"Video {video.get('id', 'unknown')} missing field: {field}"
        
        print(f"✓ All {len(data)} videos have required fields: {', '.join(required_fields)}")
    
    def test_videos_categories(self):
        """Verify videos have expected categories"""
        response = requests.get(f"{BASE_URL}/api/videos")
        data = response.json()
        
        categories = set(v['category'] for v in data)
        expected_categories = {'mudras', 'yantra', 'tantra', 'breathwork', 'meditation', 
                              'frequencies', 'exercises', 'mantra', 'soundscapes', 'nourishment'}
        
        for cat in categories:
            assert cat in expected_categories, f"Unexpected category: {cat}"
        
        print(f"✓ Videos have valid categories: {', '.join(sorted(categories))}")


class TestExercisesEndpoint:
    """Test GET /api/exercises - should return 6 exercises with correct data fields"""
    
    def test_exercises_returns_200(self):
        """Verify exercises endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/exercises")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ GET /api/exercises returns 200 OK")
    
    def test_exercises_returns_list(self):
        """Verify exercises endpoint returns a list"""
        response = requests.get(f"{BASE_URL}/api/exercises")
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ GET /api/exercises returns list with {len(data)} items")
    
    def test_exercises_count(self):
        """Verify exercises endpoint returns 6 exercises"""
        response = requests.get(f"{BASE_URL}/api/exercises")
        data = response.json()
        assert len(data) == 6, f"Expected 6 exercises, got {len(data)}"
        print("✓ GET /api/exercises returns exactly 6 exercises")
    
    def test_exercises_data_fields(self):
        """Verify each exercise has required fields"""
        response = requests.get(f"{BASE_URL}/api/exercises")
        data = response.json()
        required_fields = ['id', 'name', 'category', 'steps', 'benefits', 'video_url',
                          'description', 'duration', 'level', 'philosophy', 'tips', 'color']
        
        for exercise in data:
            for field in required_fields:
                assert field in exercise, f"Exercise {exercise.get('id', 'unknown')} missing field: {field}"
        
        print(f"✓ All {len(data)} exercises have required fields: {', '.join(required_fields)}")
    
    def test_exercises_categories(self):
        """Verify exercises have expected categories (qigong, tai_chi)"""
        response = requests.get(f"{BASE_URL}/api/exercises")
        data = response.json()
        
        categories = set(e['category'] for e in data)
        expected_categories = {'qigong', 'tai_chi'}
        
        assert categories == expected_categories, f"Expected {expected_categories}, got {categories}"
        print(f"✓ Exercises have correct categories: {', '.join(sorted(categories))}")
    
    def test_exercises_sample_data(self):
        """Verify sample exercise data is correct"""
        response = requests.get(f"{BASE_URL}/api/exercises")
        data = response.json()
        
        # Find Standing Like a Tree
        standing = next((e for e in data if e['id'] == 'qigong-standing'), None)
        assert standing is not None, "Standing Like a Tree exercise not found"
        assert standing['name'] == 'Standing Like a Tree (Zhan Zhuang)', f"Unexpected name: {standing['name']}"
        assert standing['category'] == 'qigong', f"Expected 'qigong' category, got {standing['category']}"
        assert len(standing['steps']) > 0, "Exercise should have steps"
        assert len(standing['benefits']) > 0, "Exercise should have benefits"
        
        print("✓ Standing Like a Tree exercise data verified: name, category, steps, benefits correct")


class TestCacheHeaders:
    """Test that endpoints return proper cache headers"""
    
    def test_mudras_cache_header(self):
        """Verify mudras endpoint has cache-control header"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        cache_control = response.headers.get('cache-control', '')
        assert 'max-age=3600' in cache_control, f"Expected cache-control with max-age=3600, got: {cache_control}"
        print("✓ GET /api/mudras has cache-control: max-age=3600")
    
    def test_videos_cache_header(self):
        """Verify videos endpoint has cache-control header"""
        response = requests.get(f"{BASE_URL}/api/videos")
        cache_control = response.headers.get('cache-control', '')
        assert 'max-age=3600' in cache_control, f"Expected cache-control with max-age=3600, got: {cache_control}"
        print("✓ GET /api/videos has cache-control: max-age=3600")
    
    def test_exercises_cache_header(self):
        """Verify exercises endpoint has cache-control header"""
        response = requests.get(f"{BASE_URL}/api/exercises")
        cache_control = response.headers.get('cache-control', '')
        assert 'max-age=3600' in cache_control, f"Expected cache-control with max-age=3600, got: {cache_control}"
        print("✓ GET /api/exercises has cache-control: max-age=3600")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
