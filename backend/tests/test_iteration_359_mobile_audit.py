"""
Iteration 359 - Mobile Viewport Interactive Element Audit
Backend regression spot-check for critical endpoints
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
OWNER_EMAIL = "kyndsmiles@gmail.com"
OWNER_PASSWORD = "Sovereign2026!"

class TestBackendRegression:
    """Backend regression spot-check for mobile audit"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get owner auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip(f"Auth failed: {response.status_code}")
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Auth headers for authenticated requests"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    # ── Auth Endpoints ──
    def test_auth_login(self):
        """POST /api/auth/login - owner login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data.get("user", {}).get("email") == OWNER_EMAIL
        print(f"✓ Login successful, role={data.get('user', {}).get('role')}")
    
    def test_auth_me(self, auth_headers):
        """GET /api/auth/me - get current user"""
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("email") == OWNER_EMAIL
        print(f"✓ /me returns user data")
    
    # ── Pillars Endpoints ──
    def test_pillars_list(self):
        """GET /api/pillars - public pillar list"""
        response = requests.get(f"{BASE_URL}/api/pillars")
        assert response.status_code == 200
        data = response.json()
        assert "pillars" in data
        assert len(data["pillars"]) >= 7
        print(f"✓ Pillars: {len(data['pillars'])} returned")
    
    def test_pillars_resonance(self, auth_headers):
        """GET /api/pillars/resonance - auth'd resonance state"""
        response = requests.get(f"{BASE_URL}/api/pillars/resonance", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "pillars" in data
        print(f"✓ Pillars resonance: {len(data['pillars'])} with states")
    
    # ── Sparks/Treasury Endpoints ──
    def test_sparks_wallet(self, auth_headers):
        """GET /api/sparks/wallet - user sparks balance"""
        response = requests.get(f"{BASE_URL}/api/sparks/wallet", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "sparks" in data
        print(f"✓ Sparks wallet: {data.get('sparks')} sparks")
    
    def test_treasury_balance(self, auth_headers):
        """GET /api/treasury/balance - user dust balance"""
        response = requests.get(f"{BASE_URL}/api/treasury/balance", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        # Could be 'balance' or 'user_dust_balance'
        dust = data.get("balance") or data.get("user_dust_balance") or 0
        print(f"✓ Treasury balance: {dust} dust")
    
    def test_sparks_immersion(self, auth_headers):
        """POST /api/sparks/immersion - log immersion time"""
        response = requests.post(f"{BASE_URL}/api/sparks/immersion", 
            json={"seconds": 60, "zone": "test_audit"},
            headers=auth_headers)
        # Should return 200 or 201
        assert response.status_code in [200, 201]
        print(f"✓ Immersion logged")
    
    # ── Subscriptions ──
    def test_subscription_tiers(self):
        """GET /api/subscriptions/tiers - list subscription tiers"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/tiers")
        assert response.status_code == 200
        data = response.json()
        # Should have tiers array
        tiers = data.get("tiers") or data
        if isinstance(tiers, list):
            assert len(tiers) >= 3
            print(f"✓ Subscription tiers: {len(tiers)} tiers")
        else:
            print(f"✓ Subscription tiers endpoint working")
    
    # ── Meditation History ──
    def test_meditation_history_log(self, auth_headers):
        """POST /api/meditation-history/log - log meditation session"""
        response = requests.post(f"{BASE_URL}/api/meditation-history/log",
            json={
                "meditation_type": "guided",
                "duration_seconds": 300,
                "meditation_id": "body-scan"
            },
            headers=auth_headers)
        # Should return 200 or 201
        assert response.status_code in [200, 201]
        print(f"✓ Meditation history logged")
    
    # ── RPG Endpoints ──
    def test_rpg_character(self, auth_headers):
        """GET /api/rpg/character - get RPG character"""
        response = requests.get(f"{BASE_URL}/api/rpg/character", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "level" in data or "name" in data
        print(f"✓ RPG character: level {data.get('level', 'N/A')}")
    
    def test_rpg_inventory(self, auth_headers):
        """GET /api/rpg/inventory - get RPG inventory"""
        response = requests.get(f"{BASE_URL}/api/rpg/inventory", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        print(f"✓ RPG inventory: {data.get('count', 0)} items")
    
    def test_rpg_quests_daily(self, auth_headers):
        """GET /api/rpg/quests/daily - get daily quests"""
        response = requests.get(f"{BASE_URL}/api/rpg/quests/daily", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        print(f"✓ RPG daily quests: {data.get('total_count', 0)} quests")
    
    # ── Trade Circle ──
    def test_trade_circle_listings(self, auth_headers):
        """GET /api/trade-circle/listings - get trade listings"""
        response = requests.get(f"{BASE_URL}/api/trade-circle/listings", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        listings = data.get("listings") or data
        print(f"✓ Trade circle: {len(listings) if isinstance(listings, list) else 'N/A'} listings")
    
    # ── Journal ──
    def test_journal_entries(self, auth_headers):
        """GET /api/journal/entries - get journal entries"""
        response = requests.get(f"{BASE_URL}/api/journal/entries", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        entries = data.get("entries") or data
        print(f"✓ Journal: {len(entries) if isinstance(entries, list) else 'N/A'} entries")
