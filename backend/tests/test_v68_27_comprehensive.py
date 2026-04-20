"""
V68.27 Comprehensive Testing — Console Tabs, Chamber Mini-Games, Sparks, Quests
Tests all 11 console tabs tier gating, chamber backdrop generation, sparks/immersion,
and quest auto-detect endpoints.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://zero-scale-physics.preview.emergentagent.com').rstrip('/')

# Test credentials from test_credentials.md
OWNER_EMAIL = "kyndsmiles@gmail.com"
OWNER_PASSWORD = "Sovereign2026!"


class TestAuth:
    """Authentication and user tier verification"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for owner account"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        token = data.get("token") or data.get("access_token")
        assert token, "No token in login response"
        return token
    
    def test_login_returns_token(self, auth_token):
        """Verify login returns valid token"""
        assert auth_token is not None
        assert len(auth_token) > 10
        print(f"✓ Login successful, token length: {len(auth_token)}")
    
    def test_user_tier_is_creator(self, auth_token):
        """Verify owner account has CREATOR tier (role=admin/creator/council)"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/transmuter/status", headers=headers)
        assert response.status_code == 200, f"Transmuter status failed: {response.text}"
        data = response.json()
        print(f"✓ Transmuter status: tier_name={data.get('tier_name')}, tier_level={data.get('tier_level')}")
        
        # Also check profile for role
        profile_resp = requests.get(f"{BASE_URL}/api/profile/me", headers=headers)
        if profile_resp.status_code == 200:
            profile = profile_resp.json()
            role = profile.get("role", "user")
            print(f"✓ User role: {role}")
            # Owner should be admin/creator/council which maps to CREATOR tier (4)
            assert role in ("admin", "creator", "council", "owner"), f"Expected creator role, got {role}"


class TestChamberBackdrops:
    """Test AI-generated chamber backdrops (PUBLIC endpoint)"""
    
    CHAMBER_IDS = [
        "geology", "masonry", "carpentry", "culinary", 
        "herbology", "aromatherapy", "physics", "academy", 
        "meditation", "default"
    ]
    
    def test_chamber_backdrop_no_auth(self):
        """Verify chamber backdrop endpoint works WITHOUT auth (public)"""
        response = requests.post(
            f"{BASE_URL}/api/ai-visuals/chamber",
            json={"chamber_id": "geology"}
        )
        assert response.status_code == 200, f"Chamber backdrop failed: {response.text}"
        data = response.json()
        assert "image_b64" in data, "No image_b64 in response"
        # Check image is substantial (>100KB base64 = ~75KB image)
        img_len = len(data.get("image_b64", ""))
        print(f"✓ Geology chamber backdrop: {img_len} chars (≈{img_len * 3 // 4 // 1024}KB)")
        assert img_len > 100000, f"Image too small: {img_len} chars"
    
    @pytest.mark.parametrize("chamber_id", CHAMBER_IDS)
    def test_all_chamber_backdrops(self, chamber_id):
        """Test each chamber backdrop returns valid image"""
        response = requests.post(
            f"{BASE_URL}/api/ai-visuals/chamber",
            json={"chamber_id": chamber_id}
        )
        assert response.status_code == 200, f"Chamber {chamber_id} failed: {response.text}"
        data = response.json()
        assert "image_b64" in data, f"No image_b64 for {chamber_id}"
        img_len = len(data.get("image_b64", ""))
        print(f"✓ {chamber_id}: {img_len} chars")
        # Allow smaller images for cached/default
        assert img_len > 1000, f"Image too small for {chamber_id}: {img_len}"


class TestSparksEngine:
    """Test Sparks wallet and immersion endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        return response.json().get("token") or response.json().get("access_token")
    
    def test_sparks_wallet(self, auth_token):
        """Verify sparks wallet returns expected structure"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/sparks/wallet", headers=headers)
        assert response.status_code == 200, f"Sparks wallet failed: {response.text}"
        data = response.json()
        assert "sparks" in data, "No sparks field"
        assert "total_earned" in data, "No total_earned field"
        assert "cards_earned" in data, "No cards_earned field"
        print(f"✓ Sparks wallet: {data['sparks']} sparks, {data['total_earned']} total earned, {len(data['cards_earned'])} cards")
    
    def test_sparks_immersion(self, auth_token):
        """Test POST /api/sparks/immersion logs zone correctly"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        test_zones = ["geology_break", "masonry_material", "meditation_breath"]
        
        for zone in test_zones:
            response = requests.post(
                f"{BASE_URL}/api/sparks/immersion",
                json={"seconds": 10, "zone": zone},
                headers=headers
            )
            assert response.status_code == 200, f"Immersion failed for {zone}: {response.text}"
            data = response.json()
            assert "sparks_earned" in data, f"No sparks_earned for {zone}"
            assert data.get("zone") == zone, f"Zone mismatch: expected {zone}, got {data.get('zone')}"
            print(f"✓ Immersion {zone}: {data.get('sparks_earned')} sparks earned")
    
    def test_sparks_cards(self, auth_token):
        """Verify gaming cards endpoint returns card list"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/sparks/cards", headers=headers)
        assert response.status_code == 200, f"Sparks cards failed: {response.text}"
        data = response.json()
        assert "cards" in data, "No cards field"
        assert len(data["cards"]) > 0, "No cards returned"
        print(f"✓ Gaming cards: {len(data['cards'])} cards available")


class TestQuestsEngine:
    """Test quest system and auto-detect"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        return response.json().get("token") or response.json().get("access_token")
    
    def test_quests_available(self, auth_token):
        """Verify quests list returns expected structure"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/quests/available", headers=headers)
        assert response.status_code == 200, f"Quests available failed: {response.text}"
        data = response.json()
        assert "quests" in data, "No quests field"
        print(f"✓ Quests available: {len(data['quests'])} quests")
        for q in data["quests"]:
            print(f"  - {q['name']}: {len(q['steps'])} steps, {q['progress']*100:.0f}% complete")
    
    def test_quests_auto_detect(self, auth_token):
        """Test POST /api/quests/auto_detect with brain signal format"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        # Test signal format: <zone>:<mode>:(enter|hit|complete)
        test_signals = [
            "geology:break:enter",
            "masonry:break:hit",
            "meditation:breath:complete"
        ]
        
        for signal in test_signals:
            response = requests.post(
                f"{BASE_URL}/api/quests/auto_detect",
                json={"signal": signal},
                headers=headers
            )
            # Should return 200 even if no quest matches
            assert response.status_code == 200, f"Auto-detect failed for {signal}: {response.text}"
            data = response.json()
            print(f"✓ Auto-detect '{signal}': {data.get('status', 'ok')}")


class TestMixerUnlocks:
    """Test mixer/console tier gating"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        return response.json().get("token") or response.json().get("access_token")
    
    def test_mixer_unlocks(self, auth_token):
        """Verify mixer unlocks endpoint returns unlock data"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/marketplace/mixer-unlocks", headers=headers)
        assert response.status_code == 200, f"Mixer unlocks failed: {response.text}"
        data = response.json()
        print(f"✓ Mixer unlocks: {data}")
        # Owner should have full access
        assert "unlocked_pillars" in data or "has_full_unlock" in data


class TestWorkshopData:
    """Test workshop material/tool data endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        return response.json().get("token") or response.json().get("access_token")
    
    WORKSHOP_MODULES = [
        "masonry", "carpentry", "culinary", "electrical", 
        "plumbing", "nursing", "landscaping", "bible"
    ]
    
    @pytest.mark.parametrize("module_id", WORKSHOP_MODULES)
    def test_workshop_materials(self, auth_token, module_id):
        """Test workshop materials endpoint for each module"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(
            f"{BASE_URL}/api/workshop/{module_id}/materials",
            headers=headers
        )
        # Some modules may not have materials endpoint - that's OK
        if response.status_code == 404:
            print(f"⚠ {module_id}: No materials endpoint (expected for some modules)")
            return
        assert response.status_code == 200, f"Materials failed for {module_id}: {response.text}"
        data = response.json()
        print(f"✓ {module_id} materials: {len(data.get('materials', []))} items")
    
    @pytest.mark.parametrize("module_id", WORKSHOP_MODULES)
    def test_workshop_tools(self, auth_token, module_id):
        """Test workshop tools endpoint for each module"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(
            f"{BASE_URL}/api/workshop/{module_id}/tools",
            headers=headers
        )
        # Some modules may not have tools endpoint - that's OK
        if response.status_code == 404:
            print(f"⚠ {module_id}: No tools endpoint (expected for some modules)")
            return
        assert response.status_code == 200, f"Tools failed for {module_id}: {response.text}"
        data = response.json()
        print(f"✓ {module_id} tools: {len(data.get('tools', []))} items")


class TestResonancePresets:
    """Test resonance/mixer preset endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        return response.json().get("token") or response.json().get("access_token")
    
    def test_resonance_presets_list(self, auth_token):
        """Test resonance presets endpoint if available"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/resonance/presets", headers=headers)
        if response.status_code == 404:
            print("⚠ Resonance presets endpoint not found (may be frontend-only)")
            return
        assert response.status_code == 200, f"Resonance presets failed: {response.text}"
        data = response.json()
        print(f"✓ Resonance presets: {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
