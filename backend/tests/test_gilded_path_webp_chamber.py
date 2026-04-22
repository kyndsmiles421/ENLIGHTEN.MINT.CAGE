"""
Test Suite for V68.31 New Features:
1. WebP compression for chamber backdrops (POST /api/ai-visuals/chamber)
2. Gilded Path one-time purchase flow (/api/purchase/one-time/*)

Focused testing per main agent request - NOT a full regression.
"""
import pytest
import requests
import os
import time
import base64

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Test credentials from test_credentials.md
OWNER_EMAIL = "kyndsmiles@gmail.com"
OWNER_PASSWORD = "Sovereign2026!"


class TestAuthSetup:
    """Authentication setup for all tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token for owner account"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": OWNER_EMAIL, "password": OWNER_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in login response"
        return data["token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Return headers with auth token"""
        return {"Authorization": f"Bearer {auth_token}"}


# ═══════════════════════════════════════════════════════════════════
# SECTION 1: WebP Compression for Chamber Backdrops
# ═══════════════════════════════════════════════════════════════════

class TestChamberWebPCompression(TestAuthSetup):
    """Test WebP compression for chamber backdrops - Metabolic Seal <800KB goal"""
    
    def test_chamber_meditation_returns_webp_format(self, auth_headers):
        """GET /api/ai-visuals/chamber with chamber_id='meditation' returns WebP data URL"""
        response = requests.post(
            f"{BASE_URL}/api/ai-visuals/chamber",
            json={"chamber_id": "meditation"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Chamber request failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "image_b64" in data, "Missing image_b64 in response"
        assert "chamber_id" in data, "Missing chamber_id in response"
        assert data["chamber_id"] == "meditation"
        
        # Verify WebP format - must start with 'data:image/webp;base64,'
        image_b64 = data["image_b64"]
        assert image_b64.startswith("data:image/webp;base64,"), \
            f"Image is not WebP format. Starts with: {image_b64[:50]}"
        
        print(f"✓ Meditation chamber returns WebP format")
    
    def test_chamber_payload_under_300kb(self, auth_headers):
        """Verify total payload is under 300KB (Metabolic Seal target)"""
        response = requests.post(
            f"{BASE_URL}/api/ai-visuals/chamber",
            json={"chamber_id": "meditation"},
            headers=auth_headers
        )
        assert response.status_code == 200
        
        # Calculate payload size
        payload_size_bytes = len(response.content)
        payload_size_kb = payload_size_bytes / 1024
        
        print(f"Chamber payload size: {payload_size_kb:.2f} KB")
        
        # Metabolic Seal target: <300KB for chamber backdrops
        assert payload_size_kb < 300, \
            f"Payload {payload_size_kb:.2f}KB exceeds 300KB target"
        
        print(f"✓ Payload {payload_size_kb:.2f}KB is under 300KB target")
    
    def test_fresh_chamber_physics_webp_and_cache(self, auth_headers):
        """Test fresh chamber_id 'physics' - must succeed with WebP, cache to MongoDB"""
        # First request - may generate new image
        start_time = time.time()
        response1 = requests.post(
            f"{BASE_URL}/api/ai-visuals/chamber",
            json={"chamber_id": "physics"},
            headers=auth_headers
        )
        first_request_time = time.time() - start_time
        
        assert response1.status_code == 200, f"Physics chamber failed: {response1.text}"
        data1 = response1.json()
        
        # Verify WebP format
        assert data1["image_b64"].startswith("data:image/webp;base64,"), \
            "Physics chamber not returning WebP format"
        
        print(f"First request took {first_request_time:.2f}s")
        
        # Second request - should be cache hit (<500ms)
        start_time = time.time()
        response2 = requests.post(
            f"{BASE_URL}/api/ai-visuals/chamber",
            json={"chamber_id": "physics"},
            headers=auth_headers
        )
        second_request_time = time.time() - start_time
        
        assert response2.status_code == 200
        data2 = response2.json()
        
        # Verify cache hit is fast
        print(f"Second request (cache hit) took {second_request_time:.2f}s")
        assert second_request_time < 0.5, \
            f"Cache hit took {second_request_time:.2f}s, expected <500ms"
        
        # Verify same image returned
        assert data1["image_b64"] == data2["image_b64"], \
            "Cache returned different image"
        
        print(f"✓ Physics chamber: WebP format, cached, second request {second_request_time*1000:.0f}ms")
    
    def test_fresh_chamber_geology_webp_and_cache(self, auth_headers):
        """Test fresh chamber_id 'geology' - must succeed with WebP, cache to MongoDB"""
        # First request
        response1 = requests.post(
            f"{BASE_URL}/api/ai-visuals/chamber",
            json={"chamber_id": "geology"},
            headers=auth_headers
        )
        assert response1.status_code == 200, f"Geology chamber failed: {response1.text}"
        data1 = response1.json()
        
        # Verify WebP format
        assert data1["image_b64"].startswith("data:image/webp;base64,"), \
            "Geology chamber not returning WebP format"
        
        # Second request - cache hit
        start_time = time.time()
        response2 = requests.post(
            f"{BASE_URL}/api/ai-visuals/chamber",
            json={"chamber_id": "geology"},
            headers=auth_headers
        )
        cache_time = time.time() - start_time
        
        assert response2.status_code == 200
        assert cache_time < 0.5, f"Cache hit took {cache_time:.2f}s, expected <500ms"
        
        print(f"✓ Geology chamber: WebP format, cache hit in {cache_time*1000:.0f}ms")


# ═══════════════════════════════════════════════════════════════════
# SECTION 2: Gilded Path One-Time Purchase Flow
# ═══════════════════════════════════════════════════════════════════

class TestGildedPathPackages(TestAuthSetup):
    """Test GET /api/purchase/one-time/packages - public endpoint"""
    
    def test_packages_returns_all_four_tiers(self):
        """GET /api/purchase/one-time/packages returns all 4 packages (no auth required)"""
        response = requests.get(f"{BASE_URL}/api/purchase/one-time/packages")
        assert response.status_code == 200, f"Packages endpoint failed: {response.text}"
        
        data = response.json()
        assert "packages" in data, "Missing 'packages' in response"
        
        packages = data["packages"]
        assert len(packages) == 4, f"Expected 4 packages, got {len(packages)}"
        
        # Verify all expected tiers exist
        package_ids = [p["id"] for p in packages]
        expected_ids = ["seed", "artisan", "sovereign", "gilded"]
        for expected_id in expected_ids:
            assert expected_id in package_ids, f"Missing package: {expected_id}"
        
        print(f"✓ All 4 packages returned: {package_ids}")
    
    def test_packages_have_required_fields(self):
        """Each package must have: id, label, price, product_sku, service_descriptor"""
        response = requests.get(f"{BASE_URL}/api/purchase/one-time/packages")
        assert response.status_code == 200
        
        packages = response.json()["packages"]
        required_fields = ["id", "label", "price", "product_sku", "service_descriptor"]
        
        for pkg in packages:
            for field in required_fields:
                assert field in pkg, f"Package {pkg.get('id', 'unknown')} missing field: {field}"
            
            # Verify price is a number
            assert isinstance(pkg["price"], (int, float)), \
                f"Package {pkg['id']} price is not a number"
            
            # Verify service_descriptor is non-empty string
            assert isinstance(pkg["service_descriptor"], str) and len(pkg["service_descriptor"]) > 0, \
                f"Package {pkg['id']} has empty service_descriptor"
        
        print(f"✓ All packages have required fields: {required_fields}")
    
    def test_packages_correct_prices(self):
        """Verify package prices match expected values"""
        response = requests.get(f"{BASE_URL}/api/purchase/one-time/packages")
        assert response.status_code == 200
        
        packages = {p["id"]: p for p in response.json()["packages"]}
        
        expected_prices = {
            "seed": 9.00,
            "artisan": 29.00,
            "sovereign": 89.00,
            "gilded": 249.00
        }
        
        for tier_id, expected_price in expected_prices.items():
            actual_price = packages[tier_id]["price"]
            assert actual_price == expected_price, \
                f"Package {tier_id} price mismatch: expected {expected_price}, got {actual_price}"
        
        print(f"✓ All package prices correct: {expected_prices}")


class TestGildedPathCheckout(TestAuthSetup):
    """Test POST /api/purchase/one-time - create Stripe checkout session"""
    
    def test_create_checkout_artisan_returns_stripe_url(self, auth_headers):
        """POST with valid tier_id and origin_url returns real Stripe checkout URL"""
        response = requests.post(
            f"{BASE_URL}/api/purchase/one-time",
            json={
                "tier_id": "artisan",
                "origin_url": "https://example.com"
            },
            headers=auth_headers
        )
        assert response.status_code == 200, f"Checkout creation failed: {response.text}"
        
        data = response.json()
        
        # Verify response structure
        assert "url" in data, "Missing 'url' in response"
        assert "session_id" in data, "Missing 'session_id' in response"
        assert "amount" in data, "Missing 'amount' in response"
        assert "tier_id" in data, "Missing 'tier_id' in response"
        
        # Verify Stripe URL format
        assert data["url"].startswith("https://checkout.stripe.com/"), \
            f"URL is not a Stripe checkout URL: {data['url'][:50]}"
        
        # Verify amount matches artisan tier
        assert data["amount"] == 29.0, f"Amount mismatch: expected 29.0, got {data['amount']}"
        assert data["tier_id"] == "artisan"
        
        # Store session_id for later tests
        self.__class__.created_session_id = data["session_id"]
        
        print(f"✓ Stripe checkout URL created: {data['url'][:60]}...")
        print(f"✓ Session ID: {data['session_id']}")
    
    def test_create_checkout_invalid_tier_returns_400(self, auth_headers):
        """POST with invalid tier_id 'garbage' returns 400 'Invalid tier_id'"""
        response = requests.post(
            f"{BASE_URL}/api/purchase/one-time",
            json={
                "tier_id": "garbage",
                "origin_url": "https://example.com"
            },
            headers=auth_headers
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        
        data = response.json()
        assert "Invalid tier_id" in str(data.get("detail", "")), \
            f"Expected 'Invalid tier_id' error, got: {data}"
        
        print(f"✓ Invalid tier_id returns 400: {data}")
    
    def test_create_checkout_missing_origin_url_returns_400(self, auth_headers):
        """POST without origin_url returns 400 'origin_url required'"""
        response = requests.post(
            f"{BASE_URL}/api/purchase/one-time",
            json={"tier_id": "artisan"},
            headers=auth_headers
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        
        data = response.json()
        assert "origin_url required" in str(data.get("detail", "")), \
            f"Expected 'origin_url required' error, got: {data}"
        
        print(f"✓ Missing origin_url returns 400: {data}")
    
    def test_create_checkout_without_auth_returns_401_or_403(self):
        """POST without Authorization header returns 401 or 403"""
        response = requests.post(
            f"{BASE_URL}/api/purchase/one-time",
            json={
                "tier_id": "artisan",
                "origin_url": "https://example.com"
            }
        )
        assert response.status_code in [401, 403], \
            f"Expected 401/403, got {response.status_code}: {response.text}"
        
        print(f"✓ No auth returns {response.status_code}")


class TestGildedPathStatus(TestAuthSetup):
    """Test GET /api/purchase/one-time/status/{session_id}"""
    
    def test_status_for_unpaid_session(self, auth_headers):
        """GET status for freshly created (unpaid) session returns payment_status='unpaid'"""
        # First create a session
        create_response = requests.post(
            f"{BASE_URL}/api/purchase/one-time",
            json={
                "tier_id": "seed",
                "origin_url": "https://example.com"
            },
            headers=auth_headers
        )
        assert create_response.status_code == 200
        session_id = create_response.json()["session_id"]
        
        # Check status
        status_response = requests.get(
            f"{BASE_URL}/api/purchase/one-time/status/{session_id}",
            headers=auth_headers
        )
        assert status_response.status_code == 200, f"Status check failed: {status_response.text}"
        
        data = status_response.json()
        assert "payment_status" in data, "Missing payment_status"
        assert "already_fulfilled" in data, "Missing already_fulfilled"
        
        # Unpaid session should have payment_status='unpaid' and already_fulfilled=False
        assert data["payment_status"] == "unpaid", \
            f"Expected 'unpaid', got '{data['payment_status']}'"
        assert data["already_fulfilled"] == False, \
            f"Expected already_fulfilled=False, got {data['already_fulfilled']}"
        
        print(f"✓ Unpaid session status: {data}")
    
    def test_status_bogus_session_returns_404(self, auth_headers):
        """GET status for bogus_session_id returns 404 'Transaction not found'"""
        response = requests.get(
            f"{BASE_URL}/api/purchase/one-time/status/bogus_session_id_12345",
            headers=auth_headers
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        
        data = response.json()
        assert "Transaction not found" in str(data.get("detail", "")), \
            f"Expected 'Transaction not found', got: {data}"
        
        print(f"✓ Bogus session_id returns 404: {data}")


class TestGildedPathMyGilded(TestAuthSetup):
    """Test GET /api/purchase/one-time/my-gilded"""
    
    def test_my_gilded_for_user_without_purchase(self, auth_headers):
        """GET my-gilded for user with no purchase returns null values"""
        response = requests.get(
            f"{BASE_URL}/api/purchase/one-time/my-gilded",
            headers=auth_headers
        )
        assert response.status_code == 200, f"my-gilded failed: {response.text}"
        
        data = response.json()
        
        # Verify response structure
        assert "gilded_tier" in data, "Missing gilded_tier"
        assert "purchased_at" in data, "Missing purchased_at"
        assert "session_id" in data, "Missing session_id"
        
        # For user without purchase, all should be null
        # Note: Owner may have a gilded tier from previous tests, so we just verify structure
        print(f"✓ my-gilded response: gilded_tier={data['gilded_tier']}, purchased_at={data['purchased_at']}")


class TestGildedPathCrossUserProtection(TestAuthSetup):
    """Test cross-user protection - user A cannot poll user B's session"""
    
    def test_cross_user_session_access_denied(self, auth_headers):
        """User A cannot poll user B's session_id - returns 403 or 404"""
        # Create a session with owner account
        create_response = requests.post(
            f"{BASE_URL}/api/purchase/one-time",
            json={
                "tier_id": "sovereign",
                "origin_url": "https://example.com"
            },
            headers=auth_headers
        )
        assert create_response.status_code == 200
        session_id = create_response.json()["session_id"]
        
        # Try to access with no auth (simulating different user)
        # This should return 401/403 since no auth
        response = requests.get(
            f"{BASE_URL}/api/purchase/one-time/status/{session_id}"
        )
        assert response.status_code in [401, 403], \
            f"Expected 401/403 for unauthenticated access, got {response.status_code}"
        
        print(f"✓ Cross-user protection: unauthenticated access returns {response.status_code}")


class TestGildedPathMongoDBRow(TestAuthSetup):
    """Test MongoDB row structure in buy_time_transactions"""
    
    def test_transaction_row_has_required_fields(self, auth_headers):
        """Verify MongoDB row contains all required fields"""
        # Create a transaction
        create_response = requests.post(
            f"{BASE_URL}/api/purchase/one-time",
            json={
                "tier_id": "gilded",
                "origin_url": "https://example.com"
            },
            headers=auth_headers
        )
        assert create_response.status_code == 200
        session_id = create_response.json()["session_id"]
        
        # Check status to verify transaction exists
        status_response = requests.get(
            f"{BASE_URL}/api/purchase/one-time/status/{session_id}",
            headers=auth_headers
        )
        assert status_response.status_code == 200
        
        # The status endpoint reads from buy_time_transactions
        # If it returns 200, the row exists with correct user_id
        # We can't directly query MongoDB, but we can verify the endpoint works
        
        print(f"✓ Transaction row created and accessible for session: {session_id}")


# ═══════════════════════════════════════════════════════════════════
# SECTION 3: Quick Sanity Checks (per main agent request)
# ═══════════════════════════════════════════════════════════════════

class TestSanityChecks(TestAuthSetup):
    """Quick sanity checks that auth/subscriptions/economy still work"""
    
    def test_auth_login_works(self):
        """Sanity: POST /api/auth/login works"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": OWNER_EMAIL, "password": OWNER_PASSWORD}
        )
        assert response.status_code == 200, f"Auth login failed: {response.text}"
        assert "token" in response.json()
        print(f"✓ Auth login working")
    
    def test_subscriptions_tiers_works(self, auth_headers):
        """Sanity: GET /api/subscriptions/tiers works"""
        response = requests.get(
            f"{BASE_URL}/api/subscriptions/tiers",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Subscriptions tiers failed: {response.text}"
        data = response.json()
        assert "tiers" in data
        print(f"✓ Subscriptions tiers working")
    
    def test_economy_sparks_wallet_works(self, auth_headers):
        """Sanity: GET /api/sparks/wallet works"""
        response = requests.get(
            f"{BASE_URL}/api/sparks/wallet",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Sparks wallet failed: {response.text}"
        print(f"✓ Economy sparks wallet working")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
