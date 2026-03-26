"""
Backend API Tests for Cosmic Collective
- Regression tests for existing endpoints after refactoring
- Tests for 4 new feature modules: Aromatherapy, Herbology, Elixirs, Meals
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture(scope="module")
def auth_token(api_client):
    """Get authentication token"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": "test@test.com",
        "password": "password"
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")

@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Auth headers for authenticated requests"""
    return {"Authorization": f"Bearer {auth_token}"}


# ============================================================
# REGRESSION TESTS - Existing Endpoints After Refactoring
# ============================================================

class TestHealthAndAuth:
    """Health check and authentication endpoints"""
    
    def test_health_endpoint(self, api_client):
        """GET /api/health returns 200"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print(f"✓ Health check passed: {data}")
    
    def test_login_success(self, api_client):
        """POST /api/auth/login with test@test.com/password returns token"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "password"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == "test@test.com"
        print(f"✓ Login successful, user: {data['user']['name']}")
    
    def test_login_invalid_credentials(self, api_client):
        """POST /api/auth/login with wrong credentials returns 401"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid login correctly rejected")


class TestDashboard:
    """Dashboard endpoints"""
    
    def test_dashboard_stats(self, api_client, auth_headers):
        """GET /api/dashboard/stats returns streak data"""
        response = api_client.get(f"{BASE_URL}/api/dashboard/stats", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "streak" in data
        assert "mood_count" in data
        assert "journal_count" in data
        print(f"✓ Dashboard stats: streak={data['streak']}, moods={data['mood_count']}")


class TestYoga:
    """Yoga endpoints"""
    
    def test_yoga_styles(self, api_client):
        """GET /api/yoga/styles returns yoga styles"""
        response = api_client.get(f"{BASE_URL}/api/yoga/styles")
        assert response.status_code == 200
        data = response.json()
        assert "styles" in data
        assert len(data["styles"]) > 0
        print(f"✓ Yoga styles: {len(data['styles'])} styles returned")


class TestTeachings:
    """Teachings endpoints"""
    
    def test_teachers(self, api_client):
        """GET /api/teachings/teachers returns teachers array"""
        response = api_client.get(f"{BASE_URL}/api/teachings/teachers")
        assert response.status_code == 200
        data = response.json()
        assert "teachers" in data
        assert isinstance(data["teachers"], list)
        print(f"✓ Teachers: {len(data['teachers'])} teachers returned")


class TestCardology:
    """Cardology endpoints"""
    
    def test_birth_card(self, api_client):
        """GET /api/cardology/birth-card?month=3&day=15 returns card data"""
        response = api_client.get(f"{BASE_URL}/api/cardology/birth-card?month=3&day=15")
        assert response.status_code == 200
        data = response.json()
        assert "card" in data or "birth_card" in data or "name" in data
        print(f"✓ Birth card for March 15: {data}")


class TestAnimalTotems:
    """Animal totems endpoints"""
    
    def test_all_totems(self, api_client):
        """GET /api/animal-totems/all returns 12 birth totems"""
        response = api_client.get(f"{BASE_URL}/api/animal-totems/all")
        assert response.status_code == 200
        data = response.json()
        assert "birth_totems" in data
        assert len(data["birth_totems"]) == 12
        print(f"✓ Animal totems: {len(data['birth_totems'])} birth totems returned")


class TestMoonPhase:
    """Moon phase endpoints"""
    
    def test_moon_phase(self, api_client):
        """GET /api/moon-phase returns current moon phase"""
        response = api_client.get(f"{BASE_URL}/api/moon-phase")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data or "phase" in data
        print(f"✓ Moon phase: {data}")


# ============================================================
# NEW FEATURE TESTS - Aromatherapy Module
# ============================================================

class TestAromatherapy:
    """Aromatherapy endpoints - NEW FEATURE"""
    
    def test_get_oils(self, api_client):
        """GET /api/aromatherapy/oils returns 12 oils"""
        response = api_client.get(f"{BASE_URL}/api/aromatherapy/oils")
        assert response.status_code == 200
        data = response.json()
        assert "oils" in data
        assert len(data["oils"]) == 12
        # Verify oil structure
        oil = data["oils"][0]
        assert "id" in oil
        assert "name" in oil
        assert "properties" in oil
        assert "chakra" in oil
        print(f"✓ Aromatherapy oils: {len(data['oils'])} oils returned")
        print(f"  Sample oil: {oil['name']} - {oil['properties'][:2]}")
    
    def test_get_blends(self, api_client):
        """GET /api/aromatherapy/blends returns 8 blends"""
        response = api_client.get(f"{BASE_URL}/api/aromatherapy/blends")
        assert response.status_code == 200
        data = response.json()
        assert "blends" in data
        assert len(data["blends"]) == 8
        # Verify blend structure
        blend = data["blends"][0]
        assert "name" in blend
        assert "oils" in blend
        assert "ratio" in blend
        print(f"✓ Aromatherapy blends: {len(data['blends'])} blends returned")
        print(f"  Sample blend: {blend['name']} - {blend['oils']}")
    
    def test_get_oil_detail(self, api_client):
        """GET /api/aromatherapy/oil/lavender returns detail"""
        response = api_client.get(f"{BASE_URL}/api/aromatherapy/oil/lavender")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "lavender"
        assert data["name"] == "Lavender"
        assert "uses" in data
        assert "spiritual" in data
        assert "caution" in data
        print(f"✓ Lavender oil detail: {data['name']} - {data['chakra']}")
    
    def test_get_oil_not_found(self, api_client):
        """GET /api/aromatherapy/oil/nonexistent returns 404"""
        response = api_client.get(f"{BASE_URL}/api/aromatherapy/oil/nonexistent")
        assert response.status_code == 404
        print("✓ Non-existent oil correctly returns 404")


# ============================================================
# NEW FEATURE TESTS - Herbology Module
# ============================================================

class TestHerbology:
    """Herbology endpoints - NEW FEATURE"""
    
    def test_get_herbs(self, api_client):
        """GET /api/herbology/herbs returns 12 herbs"""
        response = api_client.get(f"{BASE_URL}/api/herbology/herbs")
        assert response.status_code == 200
        data = response.json()
        assert "herbs" in data
        assert len(data["herbs"]) == 12
        # Verify herb structure
        herb = data["herbs"][0]
        assert "id" in herb
        assert "name" in herb
        assert "latin" in herb
        assert "properties" in herb
        assert "systems" in herb
        print(f"✓ Herbology herbs: {len(data['herbs'])} herbs returned")
        print(f"  Sample herb: {herb['name']} ({herb['latin']})")
    
    def test_get_herb_detail(self, api_client):
        """GET /api/herbology/herb/ashwagandha returns detail"""
        response = api_client.get(f"{BASE_URL}/api/herbology/herb/ashwagandha")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "ashwagandha"
        assert data["name"] == "Ashwagandha"
        assert "traditional_use" in data
        assert "dosage" in data
        assert "caution" in data
        print(f"✓ Ashwagandha detail: {data['name']} - {data['family']} family")
    
    def test_get_herb_not_found(self, api_client):
        """GET /api/herbology/herb/nonexistent returns 404"""
        response = api_client.get(f"{BASE_URL}/api/herbology/herb/nonexistent")
        assert response.status_code == 404
        print("✓ Non-existent herb correctly returns 404")
    
    def test_herbs_by_system(self, api_client):
        """GET /api/herbology/by-system/nervous returns herbs for nervous system"""
        response = api_client.get(f"{BASE_URL}/api/herbology/by-system/nervous")
        assert response.status_code == 200
        data = response.json()
        assert "herbs" in data
        assert len(data["herbs"]) > 0
        print(f"✓ Herbs for nervous system: {len(data['herbs'])} herbs")


# ============================================================
# NEW FEATURE TESTS - Elixirs Module
# ============================================================

class TestElixirs:
    """Elixirs endpoints - NEW FEATURE"""
    
    def test_get_all_elixirs(self, api_client):
        """GET /api/elixirs/all returns 10 elixirs with categories"""
        response = api_client.get(f"{BASE_URL}/api/elixirs/all")
        assert response.status_code == 200
        data = response.json()
        assert "elixirs" in data
        assert "categories" in data
        assert len(data["elixirs"]) == 10
        assert len(data["categories"]) == 5
        # Verify elixir structure
        elixir = data["elixirs"][0]
        assert "id" in elixir
        assert "name" in elixir
        assert "category" in elixir
        assert "ingredients" in elixir
        assert "benefits" in elixir
        print(f"✓ Elixirs: {len(data['elixirs'])} elixirs, {len(data['categories'])} categories")
        print(f"  Sample elixir: {elixir['name']} ({elixir['category']})")
    
    def test_get_elixir_detail(self, api_client):
        """GET /api/elixirs/golden_milk returns detail"""
        response = api_client.get(f"{BASE_URL}/api/elixirs/golden_milk")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "golden_milk"
        assert data["name"] == "Golden Milk"
        assert "ingredients" in data
        assert "instructions" in data
        assert "tradition" in data
        print(f"✓ Golden Milk detail: {data['name']} - {data['best_time']}")
    
    def test_get_elixir_not_found(self, api_client):
        """GET /api/elixirs/nonexistent returns 404"""
        response = api_client.get(f"{BASE_URL}/api/elixirs/nonexistent")
        assert response.status_code == 404
        print("✓ Non-existent elixir correctly returns 404")
    
    def test_elixirs_by_category(self, api_client):
        """GET /api/elixirs/category/healing_latte returns filtered elixirs"""
        response = api_client.get(f"{BASE_URL}/api/elixirs/category/healing_latte")
        assert response.status_code == 200
        data = response.json()
        assert "elixirs" in data
        assert len(data["elixirs"]) > 0
        for elixir in data["elixirs"]:
            assert elixir["category"] == "healing_latte"
        print(f"✓ Healing lattes: {len(data['elixirs'])} elixirs")


# ============================================================
# NEW FEATURE TESTS - Meals Module
# ============================================================

class TestMeals:
    """Meals endpoints - NEW FEATURE"""
    
    def test_get_meal_plans(self, api_client):
        """GET /api/meals/plans returns 5 meal plans"""
        response = api_client.get(f"{BASE_URL}/api/meals/plans")
        assert response.status_code == 200
        data = response.json()
        assert "plans" in data
        assert len(data["plans"]) == 5
        # Verify plan structure
        plan = data["plans"][0]
        assert "id" in plan
        assert "name" in plan
        assert "focus" in plan
        assert "meal_count" in plan
        print(f"✓ Meal plans: {len(data['plans'])} plans returned")
        print(f"  Plans: {[p['name'] for p in data['plans']]}")
    
    def test_get_meal_plan_detail(self, api_client):
        """GET /api/meals/plan/energizing returns plan detail with meals array"""
        response = api_client.get(f"{BASE_URL}/api/meals/plan/energizing")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "energizing"
        assert data["name"] == "Energizing Vitality"
        assert "meals" in data
        assert len(data["meals"]) == 4  # breakfast, lunch, snack, dinner
        # Verify meal structure
        meal = data["meals"][0]
        assert "meal" in meal
        assert "name" in meal
        assert "items" in meal
        assert "intention" in meal
        print(f"✓ Energizing plan: {data['name']} - {len(data['meals'])} meals")
    
    def test_get_meal_plan_not_found(self, api_client):
        """GET /api/meals/plan/nonexistent returns 404"""
        response = api_client.get(f"{BASE_URL}/api/meals/plan/nonexistent")
        assert response.status_code == 404
        print("✓ Non-existent plan correctly returns 404")
    
    def test_log_meal_authenticated(self, api_client, auth_headers):
        """POST /api/meals/log (with auth) logs a meal entry"""
        response = api_client.post(f"{BASE_URL}/api/meals/log", json={
            "meal_type": "lunch",
            "items": ["TEST_quinoa bowl", "TEST_green salad"],
            "notes": "Test meal log",
            "gratitude": "Grateful for nourishment",
            "mindful_eating": True
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "logged"
        assert "id" in data
        print(f"✓ Meal logged successfully: {data['id']}")
        return data["id"]
    
    def test_get_meal_logs_authenticated(self, api_client, auth_headers):
        """GET /api/meals/log (with auth) returns logged meals"""
        response = api_client.get(f"{BASE_URL}/api/meals/log", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "logs" in data
        assert isinstance(data["logs"], list)
        print(f"✓ Meal logs retrieved: {len(data['logs'])} logs")
    
    def test_log_meal_unauthenticated(self, api_client):
        """POST /api/meals/log without auth returns 401"""
        response = api_client.post(f"{BASE_URL}/api/meals/log", json={
            "meal_type": "lunch",
            "items": ["test item"]
        })
        assert response.status_code in [401, 403]
        print("✓ Unauthenticated meal log correctly rejected")


# ============================================================
# CLEANUP
# ============================================================

class TestCleanup:
    """Cleanup test data"""
    
    def test_cleanup_test_meal_logs(self, api_client, auth_headers):
        """Delete TEST_ prefixed meal logs"""
        response = api_client.get(f"{BASE_URL}/api/meals/log", headers=auth_headers)
        if response.status_code == 200:
            logs = response.json().get("logs", [])
            deleted = 0
            for log in logs:
                items = log.get("items", [])
                if any("TEST_" in str(item) for item in items):
                    del_response = api_client.delete(f"{BASE_URL}/api/meals/log/{log['id']}", headers=auth_headers)
                    if del_response.status_code == 200:
                        deleted += 1
            print(f"✓ Cleanup: deleted {deleted} test meal logs")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
