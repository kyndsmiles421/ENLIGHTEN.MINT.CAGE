"""
Sovereign Middleware — Tier-Based Data Filtering
Intercepts requests and enriches them with tier capabilities.
Acts as the "Traffic Controller" — routes data by tier metadata
before heavy processing begins.
"""
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from deps import db, logger
import time


SOVEREIGN_TIER_ORDER = ["standard", "apprentice", "artisan", "sovereign"]
TIER_PRIORITIES = {"standard": 3, "apprentice": 2, "artisan": 1, "sovereign": 0}


class SovereignTierMiddleware(BaseHTTPMiddleware):
    """Middleware that:
    1. Attaches tier info to request state
    2. Tracks response times per tier for backpressure
    3. Adds standardized headers
    """

    async def dispatch(self, request: Request, call_next):
        start = time.time()

        # Only process /api routes
        if not request.url.path.startswith("/api"):
            return await call_next(request)

        # Extract tier from auth token if present
        tier = "standard"
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
            try:
                import jwt, os
                payload = jwt.decode(token, os.environ.get("JWT_SECRET", "cosmic_secret_key"), algorithms=["HS256"])
                user_id = payload.get("user_id")
                if user_id:
                    sub = await db.sovereign_subscriptions.find_one({"user_id": user_id}, {"_id": 0, "tier": 1})
                    if sub:
                        tier = sub.get("tier", "standard")
                    else:
                        legacy = await db.user_credits.find_one({"user_id": user_id}, {"_id": 0, "tier": 1})
                        if legacy:
                            mapping = {"free": "standard", "starter": "standard", "plus": "apprentice", "premium": "artisan", "super_user": "sovereign"}
                            tier = mapping.get(legacy.get("tier", "free"), "standard")
            except Exception:
                pass

        # Attach tier to request state
        request.state.sovereign_tier = tier
        request.state.tier_priority = TIER_PRIORITIES.get(tier, 3)

        response = await call_next(request)

        # Add standardized headers
        elapsed = time.time() - start
        response.headers["X-Sovereign-Tier"] = tier
        response.headers["X-Response-Time"] = f"{elapsed:.3f}s"
        response.headers["X-Tier-Priority"] = str(TIER_PRIORITIES.get(tier, 3))

        return response
