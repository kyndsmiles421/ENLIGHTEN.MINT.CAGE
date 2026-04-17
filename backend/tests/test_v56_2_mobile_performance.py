"""
V56.2 Mobile Performance Fix - Backend API Verification
Tests that all core APIs are still working after mobile performance fixes.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCoreAPIs:
    """Verify all core APIs are still working after V56.2 changes"""
    
    def test_health_endpoint(self):
        """Health check endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print(f"✓ Health: {data}")
    
    def test_crystals_api(self):
        """Crystals data API"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        assert "crystals" in data
        assert len(data["crystals"]) >= 10
        print(f"✓ Crystals: {len(data['crystals'])} crystals returned")
    
    def test_herbology_herbs_api(self):
        """Herbology herbs API"""
        response = requests.get(f"{BASE_URL}/api/herbology/herbs")
        assert response.status_code == 200
        data = response.json()
        assert "herbs" in data
        assert len(data["herbs"]) >= 10
        print(f"✓ Herbology: {len(data['herbs'])} herbs returned")
    
    def test_yoga_styles_api(self):
        """Yoga styles API"""
        response = requests.get(f"{BASE_URL}/api/yoga/styles")
        assert response.status_code == 200
        data = response.json()
        assert "styles" in data
        assert len(data["styles"]) >= 5
        print(f"✓ Yoga: {len(data['styles'])} styles returned")
    
    def test_oracle_zodiac_api(self):
        """Oracle zodiac API"""
        response = requests.get(f"{BASE_URL}/api/oracle/zodiac")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 12  # 12 zodiac signs
        print(f"✓ Oracle Zodiac: {len(data)} signs returned")
    
    def test_rpg_status_api(self):
        """RPG status API"""
        response = requests.get(f"{BASE_URL}/api/rpg/status")
        assert response.status_code == 200
        data = response.json()
        assert "version" in data
        assert "status" in data
        print(f"✓ RPG Status: version={data.get('version')}, status={data.get('status')}")
    
    def test_teachings_teachers_api(self):
        """Teachings teachers API"""
        response = requests.get(f"{BASE_URL}/api/teachings/teachers")
        assert response.status_code == 200
        data = response.json()
        assert "teachers" in data
        assert len(data["teachers"]) >= 5
        print(f"✓ Teachings: {len(data['teachers'])} teachers returned")
    
    def test_frequencies_api(self):
        """Frequencies API"""
        response = requests.get(f"{BASE_URL}/api/frequencies")
        assert response.status_code == 200
        data = response.json()
        # API returns list directly
        assert isinstance(data, list)
        assert len(data) >= 5
        print(f"✓ Frequencies: {len(data)} frequencies returned")
    
    def test_sovereign_status_api(self):
        """Sovereign status API (public)"""
        response = requests.get(f"{BASE_URL}/api/sovereign/status")
        assert response.status_code == 200
        data = response.json()
        assert "version" in data or "status" in data
        print(f"✓ Sovereign Status: {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
