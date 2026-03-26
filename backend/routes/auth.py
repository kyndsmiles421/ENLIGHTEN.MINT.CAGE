from fastapi import APIRouter, HTTPException, Depends
from deps import db, get_current_user, logger, create_token
from datetime import datetime, timezone
import uuid, bcrypt
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

@router.post("/auth/login")
async def login(user: UserLogin):
    found = await db.users.find_one({"email": user.email}, {"_id": 0})
    if not found or not bcrypt.checkpw(user.password.encode(), found["password"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(found["id"], found["name"])
    return {"token": token, "user": {"id": found["id"], "name": found["name"], "email": found["email"]}}

@router.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    found = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    if not found:
        raise HTTPException(status_code=404, detail="User not found")
    return found


