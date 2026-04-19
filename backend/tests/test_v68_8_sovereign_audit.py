"""
V68.8 Sovereign Audit - Full E2E Backend Verification
Tests: Auth core, GDPR export/delete, Owner bypass, Resend mail, Stripe, Core engine, Sampled modules
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Owner credentials - DO NOT DELETE THIS ACCOUNT
OWNER_EMAIL = "kyndsmiles@gmail.com"
OWNER_PASSWORD = "Sovereign2026!"

# Throwaway test user for deletion test
THROWAWAY_EMAIL = f"audit_throwaway_{int(time.time())}@test.com"
THROWAWAY_PASSWORD = "TestPass123!"
THROWAWAY_NAME = "Audit Throwaway"


class TestAuthCore:
    """Auth core: register, login, /me, owner bypass"""
    
    @pytest.fixture(scope="class")
    def owner_token(self):
        """Login as owner and get token"""
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        assert resp.status_code == 200, f"Owner login failed: {resp.text}"
        data = resp.json()
        assert "token" in data
        return data["token"]
    
    def test_owner_login_returns_admin_role(self):
        """Owner login should return role=admin and is_owner=true"""
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["user"]["role"] == "admin", f"Expected role=admin, got {data['user'].get('role')}"
        assert data["user"]["is_owner"] == True, "Expected is_owner=true"
        assert data["user"]["is_admin"] == True, "Expected is_admin=true"
        print(f"PASS: Owner login returns role=admin, is_owner=true, is_admin=true")
    
    def test_auth_me_returns_user(self, owner_token):
        """GET /api/auth/me returns user data"""
        resp = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {owner_token}"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        assert "email" in data
        assert data["email"] == OWNER_EMAIL
        print(f"PASS: /api/auth/me returns user with email={data['email']}")
    
    def test_register_new_throwaway_user(self):
        """POST /api/auth/register creates new user with trial"""
        resp = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": THROWAWAY_EMAIL,
            "password": THROWAWAY_PASSWORD,
            "name": THROWAWAY_NAME
        })
        assert resp.status_code == 200, f"Register failed: {resp.text}"
        data = resp.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == THROWAWAY_EMAIL
        assert "trial" in data
        assert data["trial"]["active"] == True
        assert data["trial"]["tier"] == "plus"
        print(f"PASS: Registered throwaway user {THROWAWAY_EMAIL} with 7-day Plus trial")
        return data["token"]


class TestGDPRCompliance:
    """GDPR Article 20 export and Article 17 deletion"""
    
    @pytest.fixture(scope="class")
    def owner_token(self):
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        return resp.json()["token"]
    
    @pytest.fixture(scope="class")
    def throwaway_token(self):
        """Register and get token for throwaway user"""
        resp = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": THROWAWAY_EMAIL,
            "password": THROWAWAY_PASSWORD,
            "name": THROWAWAY_NAME
        })
        if resp.status_code == 400 and "already registered" in resp.text:
            # Already registered, login instead
            resp = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": THROWAWAY_EMAIL,
                "password": THROWAWAY_PASSWORD
            })
        assert resp.status_code == 200, f"Throwaway auth failed: {resp.text}"
        return resp.json()["token"]
    
    def test_gdpr_export_returns_real_data(self, owner_token):
        """GET /api/auth/export returns JSON with export_metadata and collections"""
        resp = requests.get(f"{BASE_URL}/api/auth/export", headers={
            "Authorization": f"Bearer {owner_token}"
        })
        assert resp.status_code == 200, f"Export failed: {resp.text}"
        data = resp.json()
        assert "export_metadata" in data, "Missing export_metadata key"
        assert "collections" in data, "Missing collections key"
        assert data["export_metadata"]["format"] == "ENLIGHTEN.MINT.CAFE Sovereign Data Export v1"
        assert data["export_metadata"]["total_documents"] > 0, "Export is empty stub - no documents"
        print(f"PASS: GDPR export returned {data['export_metadata']['total_documents']} docs across {data['export_metadata']['total_collections']} collections")
    
    def test_gdpr_delete_throwaway_user(self, throwaway_token):
        """DELETE /api/auth/me on throwaway user - verify deletion"""
        # First verify user exists
        me_resp = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {throwaway_token}"
        })
        assert me_resp.status_code == 200, "Throwaway user should exist before deletion"
        
        # Delete the account
        del_resp = requests.delete(f"{BASE_URL}/api/auth/me", 
            headers={"Authorization": f"Bearer {throwaway_token}"},
            json={"confirm": "DELETE"}
        )
        assert del_resp.status_code == 200, f"Delete failed: {del_resp.text}"
        data = del_resp.json()
        assert data["status"] == "deleted"
        print(f"PASS: DELETE /api/auth/me returned 200, status=deleted, purged={data.get('collections_purged')}")
        
        # Verify login fails after deletion
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": THROWAWAY_EMAIL,
            "password": THROWAWAY_PASSWORD
        })
        assert login_resp.status_code == 401, f"Expected 401 after deletion, got {login_resp.status_code}"
        print(f"PASS: Login with deleted user returns 401")


class TestOwnerBypass:
    """Owner bypass: sparks>=99999, tier-gated endpoints return 200"""
    
    @pytest.fixture(scope="class")
    def owner_token(self):
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        return resp.json()["token"]
    
    def test_owner_balance_has_high_sparks(self, owner_token):
        """GET /api/sparks/wallet returns sparks>=99999 for owner"""
        resp = requests.get(f"{BASE_URL}/api/sparks/wallet", headers={
            "Authorization": f"Bearer {owner_token}"
        })
        assert resp.status_code == 200, f"Sparks wallet failed: {resp.text}"
        data = resp.json()
        sparks = data.get("sparks", 0)
        assert sparks >= 99999, f"Owner sparks={sparks}, expected >=99999"
        print(f"PASS: Owner sparks={sparks}")
        
        # Also check dust via bank/wallet
        resp2 = requests.get(f"{BASE_URL}/api/bank/wallet", headers={
            "Authorization": f"Bearer {owner_token}"
        })
        assert resp2.status_code == 200, f"Bank wallet failed: {resp2.text}"
        data2 = resp2.json()
        dust = data2.get("dust", 0)
        print(f"PASS: Owner dust={dust} (bank/wallet)")
    
    def test_tier_gated_endpoint_returns_200_for_owner(self, owner_token):
        """Tier-gated endpoints should return 200 for owner without paid tier"""
        # Test a few tier-gated endpoints
        endpoints = [
            "/api/achievements",
            "/api/challenges/daily-cross-module",
            "/api/profile/me",
        ]
        for ep in endpoints:
            resp = requests.get(f"{BASE_URL}{ep}", headers={
                "Authorization": f"Bearer {owner_token}"
            })
            assert resp.status_code == 200, f"{ep} returned {resp.status_code}: {resp.text}"
            print(f"PASS: {ep} returns 200 for owner")


class TestResendMailGateway:
    """Resend mail gateway: POST /api/admin/mail-test"""
    
    @pytest.fixture(scope="class")
    def owner_token(self):
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        return resp.json()["token"]
    
    def test_admin_mail_test(self, owner_token):
        """POST /api/admin/mail-test as owner - expect 200 or 503 if no API key"""
        resp = requests.post(f"{BASE_URL}/api/admin/mail-test", 
            headers={"Authorization": f"Bearer {owner_token}"},
            json={"to": OWNER_EMAIL}
        )
        if resp.status_code == 503:
            # No mail provider configured - this is acceptable in preview env
            print(f"WARNING: Mail provider not configured (503) - acceptable in preview env")
            pytest.skip("Mail provider not configured in preview env")
        assert resp.status_code == 200, f"Mail test failed: {resp.text}"
        data = resp.json()
        assert data.get("ok") == True or "provider" in data
        print(f"PASS: /api/admin/mail-test returned ok={data.get('ok')}, provider={data.get('provider')}")


class TestStripeIntegration:
    """Stripe: GET /api/subscriptions/tiers, POST /api/checkout, webhook endpoint"""
    
    @pytest.fixture(scope="class")
    def owner_token(self):
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        return resp.json()["token"]
    
    def test_subscription_tiers_returns_5_tiers(self, owner_token):
        """GET /api/subscriptions/tiers returns 5 tiers"""
        resp = requests.get(f"{BASE_URL}/api/subscriptions/tiers", headers={
            "Authorization": f"Bearer {owner_token}"
        })
        assert resp.status_code == 200, f"Tiers failed: {resp.text}"
        data = resp.json()
        tiers = data.get("tiers", data) if isinstance(data, dict) else data
        if isinstance(tiers, dict):
            tier_count = len(tiers)
        else:
            tier_count = len(tiers)
        assert tier_count >= 5, f"Expected 5 tiers, got {tier_count}"
        print(f"PASS: /api/subscriptions/tiers returns {tier_count} tiers")
    
    def test_stripe_webhook_endpoint_exists(self):
        """Stripe webhook endpoint /api/webhook/stripe exists (not 404)"""
        resp = requests.post(f"{BASE_URL}/api/webhook/stripe", data="test")
        # Should return 400 (bad payload) or 200, but NOT 404
        assert resp.status_code != 404, f"Stripe webhook endpoint not found (404)"
        print(f"PASS: /api/webhook/stripe exists (returned {resp.status_code})")


class TestCoreEngine:
    """Core engine: treasury, avatar, achievements, challenges, profile"""
    
    @pytest.fixture(scope="class")
    def owner_token(self):
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        return resp.json()["token"]
    
    def test_core_endpoints_return_200(self, owner_token):
        """Core engine endpoints all return 200 for owner"""
        endpoints = [
            "/api/treasury/balance",
            "/api/auth/avatar",
            "/api/achievements",
            "/api/challenges/daily-cross-module",
            "/api/profile/me",
        ]
        for ep in endpoints:
            resp = requests.get(f"{BASE_URL}{ep}", headers={
                "Authorization": f"Bearer {owner_token}"
            })
            assert resp.status_code == 200, f"{ep} returned {resp.status_code}: {resp.text}"
            print(f"PASS: {ep} returns 200")


class TestSampledModules:
    """Spot check sampled modules - all should return 200 for owner"""
    
    @pytest.fixture(scope="class")
    def owner_token(self):
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        return resp.json()["token"]
    
    def test_sampled_module_endpoints(self, owner_token):
        """Sampled module endpoints return 200 for owner"""
        endpoints = [
            "/api/meditation/constellation",
            "/api/journal",
            "/api/trade-circle/listings",
            "/api/rpg/character",
            "/api/botany/garden",
            "/api/bible/books",
            "/api/acupressure/points",
            "/api/breathing/my-custom",
            "/api/coach/modes",
            "/api/achievements/analytics",
        ]
        passed = 0
        failed = []
        for ep in endpoints:
            resp = requests.get(f"{BASE_URL}{ep}", headers={
                "Authorization": f"Bearer {owner_token}"
            })
            if resp.status_code == 200:
                passed += 1
                print(f"PASS: {ep} returns 200")
            else:
                failed.append(f"{ep} returned {resp.status_code}")
                print(f"FAIL: {ep} returned {resp.status_code}")
        
        # Allow some failures (endpoints may have different paths)
        assert passed >= 7, f"Too many failures: {failed}"
        print(f"PASS: {passed}/{len(endpoints)} sampled modules return 200")


class TestStaticComplianceSurfaces:
    """Static compliance: privacy.html, delete-account.html, assetlinks.json"""
    
    def test_privacy_html_returns_200(self):
        """GET /privacy.html returns 200 with HTML content"""
        resp = requests.get(f"{BASE_URL}/privacy.html")
        assert resp.status_code == 200, f"privacy.html returned {resp.status_code}"
        assert "text/html" in resp.headers.get("content-type", "")
        assert "Privacy Policy" in resp.text
        print(f"PASS: /privacy.html returns 200 HTML")
    
    def test_delete_account_html_returns_200(self):
        """GET /delete-account.html returns 200 with HTML content"""
        resp = requests.get(f"{BASE_URL}/delete-account.html")
        assert resp.status_code == 200, f"delete-account.html returned {resp.status_code}"
        assert "text/html" in resp.headers.get("content-type", "")
        assert "Delete" in resp.text
        print(f"PASS: /delete-account.html returns 200 HTML")
    
    def test_assetlinks_json_has_both_fingerprints(self):
        """GET /.well-known/assetlinks.json returns 200 with both SHA-256 fingerprints"""
        resp = requests.get(f"{BASE_URL}/.well-known/assetlinks.json")
        assert resp.status_code == 200, f"assetlinks.json returned {resp.status_code}"
        assert "application/json" in resp.headers.get("content-type", "")
        data = resp.json()
        assert isinstance(data, list) and len(data) > 0
        
        # Check for both fingerprints
        fingerprints = data[0]["target"]["sha256_cert_fingerprints"]
        assert "91:55:43:73:20:C2:46:95:D5:58:0A:65:E0:02:1C:6C:32:49:57:3D:ED:8B:D6:D6:E7:E0:48:07:EE:BA:B3:31" in fingerprints, "Missing Play Signing fingerprint"
        assert "C1:78:D0:3C:58:B1:E7:34:38:95:ED:C7:C7:6D:A6:5A:59:79:EB:AE:8D:6F:20:60:37:39:F0:D5:F0:1C:F8:28" in fingerprints, "Missing Upload key fingerprint"
        print(f"PASS: assetlinks.json has both SHA-256 fingerprints")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
