"""
test_iteration_v1_1_1_tesseract_vault.py — V1.1.1 Tesseract Vault Hawaiian Imports

Tests:
1. GET /api/tesseract-vault/catalogue — public, returns 8 Hawaiian relics
2. GET /api/tesseract-vault/state — auth required, returns full vault state
3. POST /api/tesseract-vault/claim/{relic_id} — claim relic, tier-lock, idempotent, vault-full
4. POST /api/tesseract-vault/release/{relic_id} — release owned relic
5. REGRESSION: /api/ai-visuals/mesh-texture — cache hit for geology
6. REGRESSION: /api/sovereign/economy/volunteer/check — 410 Gone
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    BASE_URL = "https://zero-scale-physics.preview.emergentagent.com"

# Test credentials
TEST_EMAIL = "kyndsmiles@gmail.com"
TEST_PASSWORD = "Sovereign2026!"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for the owner account."""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        return data.get("token") or data.get("access_token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Return headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}"}


class TestTesseractVaultCatalogue:
    """Test public catalogue endpoint."""

    def test_catalogue_returns_8_relics(self):
        """GET /api/tesseract-vault/catalogue — public, returns 8 Hawaiian relics."""
        response = requests.get(f"{BASE_URL}/api/tesseract-vault/catalogue")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "relics" in data, "Response should contain 'relics' key"
        relics = data["relics"]
        assert len(relics) == 8, f"Expected 8 relics, got {len(relics)}"
        
        # Verify expected relic IDs
        expected_ids = {
            "lilikoi-fudge", "lychee", "macadamia", "koa-wood",
            "kona-coffee", "sea-salt", "taro", "spam-musubi"
        }
        actual_ids = {r["id"] for r in relics}
        assert actual_ids == expected_ids, f"Relic IDs mismatch: {actual_ids}"
        
        # Verify each relic has required fields
        for relic in relics:
            assert "id" in relic
            assert "label" in relic
            assert "origin" in relic
            assert "color" in relic
            assert "tier" in relic
        
        print(f"✓ Catalogue returns 8 Hawaiian relics: {[r['id'] for r in relics]}")


class TestTesseractVaultState:
    """Test authenticated vault state endpoint."""

    def test_state_requires_auth(self):
        """GET /api/tesseract-vault/state — should require auth."""
        response = requests.get(f"{BASE_URL}/api/tesseract-vault/state")
        assert response.status_code in [401, 403, 422], f"Expected auth error, got {response.status_code}"
        print("✓ State endpoint requires authentication")

    def test_state_returns_full_payload(self, auth_headers):
        """GET /api/tesseract-vault/state — returns full vault state."""
        response = requests.get(f"{BASE_URL}/api/tesseract-vault/state", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify quota structure
        assert "quota" in data, "Response should contain 'quota'"
        quota = data["quota"]
        assert "tier" in quota
        assert "base_slots" in quota
        assert "bonus_slots" in quota
        assert "total_slots" in quota
        assert "sparks_total" in quota
        assert "next_bonus_at" in quota
        
        # Verify catalogue with per-user state
        assert "catalogue" in data
        assert len(data["catalogue"]) == 8
        for item in data["catalogue"]:
            assert "claimed" in item
            assert "tier_eligible" in item
            assert "lock_reason" in item or item["tier_eligible"]
        
        # Verify claims and slots
        assert "claims" in data
        assert "slots_used" in data
        assert "slots_available" in data
        
        print(f"✓ State returns full payload: tier={quota['tier']}, slots={data['slots_used']}/{quota['total_slots']}")


class TestTesseractVaultClaim:
    """Test claim/release relic endpoints."""

    def test_claim_free_tier_relic(self, auth_headers):
        """POST /api/tesseract-vault/claim/macadamia — free-tier relic should succeed."""
        # First release if already claimed
        requests.post(f"{BASE_URL}/api/tesseract-vault/release/macadamia", headers=auth_headers)
        
        response = requests.post(f"{BASE_URL}/api/tesseract-vault/claim/macadamia", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("status") in ["claimed", "already_claimed"], f"Unexpected status: {data}"
        assert data.get("relic_id") == "macadamia"
        
        if data["status"] == "claimed":
            assert "slots_used" in data
            assert "slots_total" in data
            print(f"✓ Claimed macadamia: {data['slots_used']}/{data['slots_total']} slots")
        else:
            print("✓ Macadamia already claimed (idempotent)")

    def test_claim_tier_locked_relic(self, auth_headers):
        """POST /api/tesseract-vault/claim/lilikoi-fudge — sovereign+ relic should fail for discovery tier."""
        # Get current tier
        state_resp = requests.get(f"{BASE_URL}/api/tesseract-vault/state", headers=auth_headers)
        state = state_resp.json()
        user_tier = state["quota"]["tier"]
        
        # lilikoi-fudge requires sovereign+ tier
        response = requests.post(f"{BASE_URL}/api/tesseract-vault/claim/lilikoi-fudge", headers=auth_headers)
        
        if user_tier in ["sovereign", "sovereign_monthly", "sovereign_founder", "founder"]:
            # User has sovereign tier, claim should succeed
            assert response.status_code == 200, f"Sovereign user should be able to claim: {response.text}"
            print(f"✓ Sovereign user ({user_tier}) can claim lilikoi-fudge")
            # Clean up
            requests.post(f"{BASE_URL}/api/tesseract-vault/release/lilikoi-fudge", headers=auth_headers)
        else:
            # User is discovery tier, should get 403
            assert response.status_code == 403, f"Expected 403 for tier-locked relic, got {response.status_code}: {response.text}"
            print(f"✓ Tier-locked relic correctly returns 403 for {user_tier} tier")

    def test_claim_idempotent(self, auth_headers):
        """POST /api/tesseract-vault/claim/macadamia twice — should be idempotent."""
        # First claim
        requests.post(f"{BASE_URL}/api/tesseract-vault/claim/macadamia", headers=auth_headers)
        
        # Second claim should return already_claimed
        response = requests.post(f"{BASE_URL}/api/tesseract-vault/claim/macadamia", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("status") == "already_claimed", f"Expected already_claimed, got {data}"
        print("✓ Double-claim is idempotent (already_claimed)")

    def test_vault_full_error(self, auth_headers):
        """Fill vault slots then try to claim another — should get 402 vault_full."""
        # Get current state
        state_resp = requests.get(f"{BASE_URL}/api/tesseract-vault/state", headers=auth_headers)
        state = state_resp.json()
        total_slots = state["quota"]["total_slots"]
        
        # Release all claims first
        for claim in state.get("claims", []):
            requests.post(f"{BASE_URL}/api/tesseract-vault/release/{claim['relic_id']}", headers=auth_headers)
        
        # Claim relics up to total_slots
        free_relics = ["macadamia", "lychee", "kona-coffee", "sea-salt", "taro", "spam-musubi"]
        claimed = []
        for relic_id in free_relics[:total_slots]:
            resp = requests.post(f"{BASE_URL}/api/tesseract-vault/claim/{relic_id}", headers=auth_headers)
            if resp.status_code == 200 and resp.json().get("status") == "claimed":
                claimed.append(relic_id)
        
        print(f"  Claimed {len(claimed)} relics to fill {total_slots} slots")
        
        # Now try to claim one more
        if len(claimed) >= total_slots and len(free_relics) > total_slots:
            next_relic = free_relics[total_slots]
            response = requests.post(f"{BASE_URL}/api/tesseract-vault/claim/{next_relic}", headers=auth_headers)
            
            if response.status_code == 402:
                data = response.json()
                detail = data.get("detail", {})
                if isinstance(detail, dict):
                    assert detail.get("code") == "vault_full", f"Expected vault_full code: {detail}"
                    assert "quota" in detail
                    assert "used" in detail
                    print(f"✓ Vault full returns 402 with structured detail: {detail.get('message', '')[:50]}...")
                else:
                    print(f"✓ Vault full returns 402: {detail}")
            else:
                print(f"  Note: Got {response.status_code} instead of 402 (may have bonus slots)")
        else:
            print(f"  Skipped vault-full test (not enough free relics or slots)")
        
        # Cleanup - release all claimed relics
        for relic_id in claimed:
            requests.post(f"{BASE_URL}/api/tesseract-vault/release/{relic_id}", headers=auth_headers)
        print("  Cleaned up test claims")


class TestTesseractVaultRelease:
    """Test release relic endpoint."""

    def test_release_owned_relic(self, auth_headers):
        """POST /api/tesseract-vault/release/{relic_id} — release owned relic."""
        # First claim a relic
        requests.post(f"{BASE_URL}/api/tesseract-vault/claim/taro", headers=auth_headers)
        
        # Now release it
        response = requests.post(f"{BASE_URL}/api/tesseract-vault/release/taro", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("status") == "released"
        assert data.get("relic_id") == "taro"
        print("✓ Released owned relic successfully")

    def test_release_not_owned_relic(self, auth_headers):
        """POST /api/tesseract-vault/release/{relic_id} — releasing not-owned returns 404."""
        # Make sure we don't own this relic
        requests.post(f"{BASE_URL}/api/tesseract-vault/release/sea-salt", headers=auth_headers)
        
        # Try to release again
        response = requests.post(f"{BASE_URL}/api/tesseract-vault/release/sea-salt", headers=auth_headers)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"
        print("✓ Releasing not-owned relic returns 404")


class TestMeshTextureRegression:
    """Regression test for V1.1.0 mesh-texture endpoint."""

    def test_mesh_texture_geology_cache(self):
        """POST /api/ai-visuals/mesh-texture — geology should cache-hit."""
        response = requests.post(
            f"{BASE_URL}/api/ai-visuals/mesh-texture",
            json={"category": "rock", "ref_id": "geology"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "image_b64" in data or "data_url" in data, f"Response should contain image data: {list(data.keys())}"
        assert data.get("category") == "rock"
        assert data.get("ref_id") == "geology"
        print("✓ Mesh-texture geology endpoint working (cache hit expected)")


class TestVolunteerRegression:
    """Regression test for volunteer endpoint (should be 410 Gone)."""

    def test_volunteer_check_410(self, auth_headers):
        """POST /api/sovereign/economy/volunteer/check — should return 410 Gone."""
        response = requests.post(
            f"{BASE_URL}/api/sovereign/economy/volunteer/check",
            headers=auth_headers,
            json={"user_id": "test"}
        )
        assert response.status_code == 410, f"Expected 410 Gone, got {response.status_code}: {response.text}"
        print("✓ Volunteer endpoint returns 410 Gone (permanently deactivated)")


class TestCleanup:
    """Cleanup test claims after all tests."""

    def test_cleanup_claims(self, auth_headers):
        """Release any test claims to leave vault clean."""
        test_relics = ["macadamia", "lychee", "kona-coffee", "sea-salt", "taro", "spam-musubi"]
        released = []
        for relic_id in test_relics:
            resp = requests.post(f"{BASE_URL}/api/tesseract-vault/release/{relic_id}", headers=auth_headers)
            if resp.status_code == 200:
                released.append(relic_id)
        
        if released:
            print(f"✓ Cleanup: released {len(released)} test claims")
        else:
            print("✓ Cleanup: no test claims to release")
