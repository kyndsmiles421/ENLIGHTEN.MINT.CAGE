from fastapi import APIRouter, HTTPException, Depends
from deps import db, get_current_user, logger, create_token
from datetime import datetime, timezone
import uuid, bcrypt, os
from models import UserCreate, UserLogin

router = APIRouter()

@router.post("/auth/register")
async def register(user: UserCreate):
    existing = await db.users.find_one({"email": user.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "name": user.name,
        "email": user.email,
        "password": hashed,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "streak": 0,
        "last_active": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(doc)
    token = create_token(user_id, user.name)
    return {"token": token, "user": {"id": user_id, "name": user.name, "email": user.email}}

CREATOR_EMAIL = "kyndsmiles@gmail.com"

@router.post("/auth/login")
async def login(user: UserLogin):
    found = await db.users.find_one({"email": user.email}, {"_id": 0})
    if not found or not bcrypt.checkpw(user.password.encode(), found["password"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Auto-activate Creator mode for the owner
    if user.email == CREATOR_EMAIL:
        if found.get("role") != "admin":
            await db.users.update_one({"id": found["id"]}, {"$set": {"role": "admin", "is_admin": True}})
        await db.user_credits.update_one(
            {"user_id": found["id"]},
            {"$set": {"tier": "super_user", "subscription_active": True, "is_admin": True, "credits": 999999, "balance": 999999}},
            upsert=True,
        )
        found["role"] = "admin"
        found["is_admin"] = True
    
    token = create_token(found["id"], found["name"])
    role = found.get("role", "user")
    return {"token": token, "user": {"id": found["id"], "name": found["name"], "email": found["email"], "role": role}}

@router.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    found = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    if not found:
        raise HTTPException(status_code=404, detail="User not found")
    return found



# Admin setup — secured by a one-time setup key
ADMIN_SETUP_KEY = os.environ.get("ADMIN_SETUP_KEY", "cosmic-creator-2026")


@router.post("/auth/set-admin")
async def set_admin(data: dict, user=Depends(get_current_user)):
    """One-time admin setup. Requires setup key."""
    setup_key = data.get("setup_key", "")
    if setup_key != ADMIN_SETUP_KEY:
        raise HTTPException(status_code=403, detail="Invalid setup key")

    await db.users.update_one({"id": user["id"]}, {"$set": {"role": "admin"}})

    # Also update credits to super_user unlimited
    await db.user_credits.update_one(
        {"user_id": user["id"]},
        {"$set": {
            "tier": "super_user",
            "subscription_active": True,
            "is_admin": True,
        }},
        upsert=True,
    )

    return {"status": "admin_granted", "user_id": user["id"]}

