from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import jwt
from pathlib import Path
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(
    mongo_url,
    maxPoolSize=50,
    minPoolSize=5,
    maxIdleTimeMS=30000,
    connectTimeoutMS=5000,
    serverSelectionTimeoutMS=5000,
)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
JWT_SECRET = os.environ.get('JWT_SECRET')
JWT_ALGORITHM = "HS256"

security = HTTPBearer(auto_error=False)
optional_security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def create_token(user_id: str, name: str):
    payload = {
        "sub": user_id,
        "name": name,
        "exp": datetime.now(timezone.utc) + timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload["sub"]
        # V1.1.25 — Pull every tier-relevant field once so every
        # downstream route sees the SAME tier picture, and admin/owner/
        # creator accounts get a synthetic top-tier injection so they
        # never hit a single tier-gate anywhere in the OS. This is the
        # system-wide "creator mode" the architect requested — one
        # patch at the auth choke point instead of touching 28 routes.
        user_doc = await db.users.find_one(
            {"id": user_id},
            {
                "_id": 0,
                "role": 1, "is_admin": 1, "is_owner": 1,
                "tier": 1, "subscription_tier": 1, "tier_id": 1, "gilded_tier": 1,
                "email": 1,
            },
        ) or {}
        role = (user_doc.get("role") or "user").lower()
        raw_tier = (user_doc.get("tier") or "").lower()
        is_owner = bool(user_doc.get("is_owner") or user_doc.get("is_admin"))
        is_creator_role = role in ("admin", "owner", "creator", "architect")
        is_creator_tier = raw_tier in ("creator", "admin", "owner", "architect_admin")
        is_creator = is_owner or is_creator_role or is_creator_tier
        # Gilded tier resolution: real value, OR sovereign_founder for owners.
        gilded = user_doc.get("gilded_tier") or user_doc.get("subscription_tier") or user_doc.get("tier_id")
        if is_creator:
            gilded = "sovereign_founder"
            sub_tier = "sovereign"
        else:
            gilded = gilded or "discovery"
            sub_tier = user_doc.get("subscription_tier") or gilded
        return {
            "id": user_id,
            "name": payload["name"],
            "role": role,
            "tier": raw_tier or ("creator" if is_creator else "discovery"),
            "subscription_tier": sub_tier,
            "tier_id": user_doc.get("tier_id") or sub_tier,
            "gilded_tier": gilded,
            "is_admin": is_creator,
            "is_owner": is_creator,
        }
    except jwt.ExpiredSignatureError:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user_optional(credentials: HTTPAuthorizationCredentials = Depends(optional_security)):
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {"id": payload["sub"], "name": payload["name"]}
    except Exception:
        return None


def decode_token(token: str):
    """Decode a JWT token and return payload, or None if invalid."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {"id": payload["sub"], "name": payload.get("name", "")}
    except Exception:
        return None


async def create_activity(user_id: str, activity_type: str, message: str, data: dict = None):
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    profile = await db.profiles.find_one({"user_id": user_id}, {"_id": 0}) or {}
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "user_name": profile.get("display_name") or (user_doc.get("name", "") if user_doc else ""),
        "avatar_style": profile.get("avatar_style", "purple-teal"),
        "theme_color": profile.get("theme_color", "#D8B4FE"),
        "type": activity_type,
        "message": message,
        "data": data or {},
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.activity_feed.insert_one(doc)
