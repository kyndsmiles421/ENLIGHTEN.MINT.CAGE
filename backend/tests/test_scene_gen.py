"""
Test suite for AI Scene Generator endpoints
Tests POST /api/scene-gen/generate and GET /api/scene-gen/image/{filename}
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSceneGenEndpoints:
    """Scene Generation API tests"""
    
    def test_generate_scene_basic(self):
        """Test POST /api/scene-gen/generate with basic 2-color blend"""
        response = requests.post(
            f"{BASE_URL}/api/scene-gen/generate",
            json={
                "resonance_name": "TEST_Basic_Blend",
                "colors": ["#EF4444", "#22C55E"]
            },
            timeout=60
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify response structure
        assert "image_url" in data, "Response missing image_url"
        assert "prompt_used" in data, "Response missing prompt_used"
        assert "resonance_name" in data, "Response missing resonance_name"
        
        # Verify image_url is valid path
        assert data["image_url"] is not None, "image_url is None"
        assert data["image_url"].startswith("/api/scene-gen/image/"), f"Invalid image_url format: {data['image_url']}"
        
        # Verify resonance_name matches input
        assert data["resonance_name"] == "TEST_Basic_Blend"
        
        print(f"Generated image URL: {data['image_url']}")
        print(f"Prompt used: {data['prompt_used'][:100]}...")
        
        # Store for next test
        self.__class__.generated_image_url = data["image_url"]
    
    def test_generate_scene_with_mood(self):
        """Test POST /api/scene-gen/generate with mood parameter"""
        response = requests.post(
            f"{BASE_URL}/api/scene-gen/generate",
            json={
                "resonance_name": "TEST_Mood_Blend",
                "colors": ["#3B82F6", "#A855F7"],
                "mood": "cosmic ethereal"
            },
            timeout=60
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["image_url"] is not None
        assert "cosmic" in data["prompt_used"].lower() or "ethereal" in data["prompt_used"].lower()
        print(f"Mood-based prompt: {data['prompt_used'][:150]}...")
    
    def test_generate_scene_with_source_prompt(self):
        """Test POST /api/scene-gen/generate with custom source_prompt"""
        response = requests.post(
            f"{BASE_URL}/api/scene-gen/generate",
            json={
                "resonance_name": "TEST_Custom_Prompt",
                "colors": ["#FCD34D", "#FB923C"],
                "source_prompt": "ancient temple with golden light"
            },
            timeout=60
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["image_url"] is not None
        assert "ancient temple" in data["prompt_used"].lower() or "golden" in data["prompt_used"].lower()
        print(f"Custom prompt result: {data['prompt_used'][:150]}...")
    
    def test_generate_scene_three_colors(self):
        """Test POST /api/scene-gen/generate with 3-color blend"""
        response = requests.post(
            f"{BASE_URL}/api/scene-gen/generate",
            json={
                "resonance_name": "TEST_Triple_Blend",
                "colors": ["#EF4444", "#22C55E", "#3B82F6"]
            },
            timeout=60
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["image_url"] is not None
        # All 3 colors should be in prompt
        prompt_lower = data["prompt_used"].lower()
        assert "#ef4444" in prompt_lower or "ef4444" in prompt_lower or "#EF4444" in data["prompt_used"]
        print(f"3-color blend generated successfully")
    
    def test_serve_generated_image(self):
        """Test GET /api/scene-gen/image/{filename} serves valid image"""
        # First generate an image
        gen_response = requests.post(
            f"{BASE_URL}/api/scene-gen/generate",
            json={
                "resonance_name": "TEST_Image_Serve",
                "colors": ["#6366F1", "#A855F7"]
            },
            timeout=60
        )
        
        assert gen_response.status_code == 200
        image_url = gen_response.json()["image_url"]
        
        # Now fetch the image
        img_response = requests.get(f"{BASE_URL}{image_url}", timeout=30)
        
        assert img_response.status_code == 200, f"Image fetch failed: {img_response.status_code}"
        assert img_response.headers.get("content-type") == "image/png", f"Wrong content-type: {img_response.headers.get('content-type')}"
        
        # Verify image size > 10KB
        content_length = len(img_response.content)
        assert content_length > 10000, f"Image too small: {content_length} bytes"
        
        print(f"Image served successfully: {content_length} bytes")
    
    def test_serve_nonexistent_image(self):
        """Test GET /api/scene-gen/image/{filename} returns error for missing file"""
        response = requests.get(
            f"{BASE_URL}/api/scene-gen/image/nonexistent_file_12345.png",
            timeout=10
        )
        
        # Should return error (either 404 or JSON error)
        if response.status_code == 200:
            data = response.json()
            assert "error" in data, "Expected error response for nonexistent file"
        else:
            assert response.status_code in [404, 400], f"Unexpected status: {response.status_code}"
        
        print("Nonexistent image handled correctly")
    
    def test_generate_scene_empty_colors(self):
        """Test POST /api/scene-gen/generate with empty colors array"""
        response = requests.post(
            f"{BASE_URL}/api/scene-gen/generate",
            json={
                "resonance_name": "TEST_Empty",
                "colors": []
            },
            timeout=60
        )
        
        # Should still work (uses default prompt)
        assert response.status_code == 200
        data = response.json()
        # May or may not generate image depending on implementation
        print(f"Empty colors response: {data}")
    
    def test_generate_scene_no_resonance_name(self):
        """Test POST /api/scene-gen/generate without resonance_name"""
        response = requests.post(
            f"{BASE_URL}/api/scene-gen/generate",
            json={
                "colors": ["#EF4444", "#22C55E"]
            },
            timeout=60
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["image_url"] is not None
        assert data["resonance_name"] is None  # Should be None when not provided
        print("No resonance_name handled correctly")


class TestSceneGenIntegration:
    """Integration tests for scene generation flow"""
    
    def test_full_generation_flow(self):
        """Test complete flow: generate -> verify URL -> fetch image"""
        # Step 1: Generate
        gen_response = requests.post(
            f"{BASE_URL}/api/scene-gen/generate",
            json={
                "resonance_name": "TEST_Full_Flow",
                "colors": ["#EF4444", "#3B82F6"],
                "mood": "serene"
            },
            timeout=60
        )
        
        assert gen_response.status_code == 200
        gen_data = gen_response.json()
        
        # Step 2: Verify response structure
        assert gen_data["image_url"] is not None
        assert gen_data["prompt_used"] is not None
        assert gen_data["resonance_name"] == "TEST_Full_Flow"
        
        # Step 3: Fetch image
        img_response = requests.get(f"{BASE_URL}{gen_data['image_url']}", timeout=30)
        assert img_response.status_code == 200
        assert len(img_response.content) > 10000
        
        print("Full generation flow completed successfully")
    
    def test_multiple_generations_unique_urls(self):
        """Test that multiple generations produce unique image URLs"""
        urls = []
        
        for i in range(2):
            response = requests.post(
                f"{BASE_URL}/api/scene-gen/generate",
                json={
                    "resonance_name": f"TEST_Unique_{i}",
                    "colors": ["#EF4444", "#22C55E"]
                },
                timeout=60
            )
            
            assert response.status_code == 200
            url = response.json()["image_url"]
            assert url not in urls, f"Duplicate URL generated: {url}"
            urls.append(url)
        
        print(f"Generated {len(urls)} unique image URLs")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
