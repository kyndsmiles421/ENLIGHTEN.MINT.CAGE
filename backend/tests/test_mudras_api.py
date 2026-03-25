"""
Test suite for Mudras API - Testing the enhanced mudras page with images, videos, and hand positions
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestMudrasAPI:
    """Tests for GET /api/mudras endpoint"""
    
    def test_mudras_endpoint_returns_200(self):
        """Test that /api/mudras returns 200 status"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ GET /api/mudras returns 200")
    
    def test_mudras_returns_25_items(self):
        """Test that exactly 25 mudras are returned"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        assert len(data) == 25, f"Expected 25 mudras, got {len(data)}"
        print(f"✓ Returns exactly 25 mudras")
    
    def test_each_mudra_has_required_fields(self):
        """Test that each mudra has all required fields including new ones"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        
        required_fields = [
            'id', 'name', 'sanskrit', 'description', 'benefits', 
            'chakra', 'element', 'duration', 'practice', 'color', 
            'category', 'image_url', 'video_url', 'video_title', 'hand_position'
        ]
        
        for mudra in data:
            for field in required_fields:
                assert field in mudra, f"Mudra '{mudra.get('name', 'unknown')}' missing field: {field}"
        
        print(f"✓ All 25 mudras have all {len(required_fields)} required fields")
    
    def test_mudra_image_urls_are_valid(self):
        """Test that image_url fields contain valid URLs"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        
        for mudra in data:
            image_url = mudra.get('image_url', '')
            assert image_url.startswith('https://'), f"Mudra '{mudra['name']}' has invalid image_url: {image_url}"
            assert 'emergentagent.com' in image_url or 'unsplash' in image_url, f"Mudra '{mudra['name']}' image_url not from expected source"
        
        print("✓ All mudras have valid image URLs")
    
    def test_mudra_video_urls_are_youtube_embeds(self):
        """Test that video_url fields are YouTube embed URLs"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        
        for mudra in data:
            video_url = mudra.get('video_url', '')
            assert 'youtube.com/embed/' in video_url, f"Mudra '{mudra['name']}' has invalid video_url: {video_url}"
        
        print("✓ All mudras have valid YouTube embed URLs")
    
    def test_mudra_video_titles_not_empty(self):
        """Test that video_title fields are not empty"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        
        for mudra in data:
            video_title = mudra.get('video_title', '')
            assert len(video_title) > 0, f"Mudra '{mudra['name']}' has empty video_title"
        
        print("✓ All mudras have non-empty video titles")
    
    def test_mudra_hand_positions_not_empty(self):
        """Test that hand_position fields are not empty and descriptive"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        
        for mudra in data:
            hand_position = mudra.get('hand_position', '')
            assert len(hand_position) > 10, f"Mudra '{mudra['name']}' has too short hand_position: {hand_position}"
        
        print("✓ All mudras have descriptive hand positions")
    
    def test_mudra_categories_are_valid(self):
        """Test that all mudras have valid categories"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        
        valid_categories = ['meditation', 'healing', 'energy', 'devotional']
        
        for mudra in data:
            category = mudra.get('category', '')
            assert category in valid_categories, f"Mudra '{mudra['name']}' has invalid category: {category}"
        
        print(f"✓ All mudras have valid categories from {valid_categories}")
    
    def test_mudra_category_distribution(self):
        """Test that mudras are distributed across categories"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        
        categories = {}
        for mudra in data:
            cat = mudra.get('category', 'unknown')
            categories[cat] = categories.get(cat, 0) + 1
        
        # Verify we have mudras in all 4 categories
        assert len(categories) == 4, f"Expected 4 categories, got {len(categories)}: {categories}"
        
        # Verify each category has at least 1 mudra
        for cat in ['meditation', 'healing', 'energy', 'devotional']:
            assert categories.get(cat, 0) > 0, f"Category '{cat}' has no mudras"
        
        print(f"✓ Mudras distributed across categories: {categories}")
    
    def test_specific_mudras_exist(self):
        """Test that specific well-known mudras exist"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        
        mudra_names = [m['name'] for m in data]
        
        expected_mudras = ['Gyan Mudra', 'Anjali Mudra', 'Dhyana Mudra', 'Prana Mudra']
        
        for expected in expected_mudras:
            assert expected in mudra_names, f"Expected mudra '{expected}' not found"
        
        print(f"✓ All expected mudras found: {expected_mudras}")
    
    def test_mudra_benefits_are_lists(self):
        """Test that benefits field is a list with multiple items"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        
        for mudra in data:
            benefits = mudra.get('benefits', [])
            assert isinstance(benefits, list), f"Mudra '{mudra['name']}' benefits is not a list"
            assert len(benefits) >= 3, f"Mudra '{mudra['name']}' has too few benefits: {len(benefits)}"
        
        print("✓ All mudras have benefits as lists with 3+ items")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
