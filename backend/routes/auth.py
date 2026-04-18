from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel
from deps import db, get_current_user, logger, create_token
from datetime import datetime, timezone, timedelta
import uuid
import bcrypt
import os
from models import UserCreate, UserLogin

router = APIRouter()

TRIAL_DAYS = 7  # Free Premium trial for new users

@router.post("/auth/register")
async def register(user: UserCreate):
    existing = await db.users.find_one({"email": user.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    doc = {
        "id": user_id,
        "name": user.name,
        "email": user.email,
        "password": hashed,
        "created_at": now.isoformat(),
        "streak": 0,
        "last_active": now.isoformat()
    }
    await db.users.insert_one(doc)

    # Auto-activate 7-day Plus trial
    trial_end = now + timedelta(days=TRIAL_DAYS)
    await db.user_credits.insert_one({
        "user_id": user_id,
        "balance": 300,
        "tier": "plus",
        "subscription_active": True,
        "subscription_id": None,
        "credits_refreshed_at": now.isoformat(),
        "total_spent": 0,
        "total_credits_used": 0,
        "is_admin": False,
        "trial_active": True,
        "trial_started_at": now.isoformat(),
        "trial_expires_at": trial_end.isoformat(),
    })

    token = create_token(user_id, user.name)
    return {
        "token": token,
        "user": {"id": user_id, "name": user.name, "email": user.email},
        "trial": {"active": True, "tier": "plus", "days": TRIAL_DAYS, "expires_at": trial_end.isoformat()},
    }

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
    is_owner = bool(found.get("is_owner") or user.email == CREATOR_EMAIL)
    return {"token": token, "user": {"id": found["id"], "name": found["name"], "email": found["email"], "role": role, "is_owner": is_owner, "is_admin": bool(found.get("is_admin") or role == "admin")}}


class PasswordReset(BaseModel):
    email: str
    new_password: str


@router.post("/auth/reset-password")
async def reset_password(data: PasswordReset):
    """Simple password reset — verify email exists, then set new password."""
    found = await db.users.find_one({"email": data.email}, {"_id": 0, "id": 1})
    if not found:
        raise HTTPException(status_code=404, detail="No account found with that email")
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    hashed = bcrypt.hashpw(data.new_password.encode(), bcrypt.gensalt()).decode()
    await db.users.update_one({"id": found["id"]}, {"$set": {"password": hashed}})
    return {"status": "Password updated successfully"}


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


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  INVITE CODE SYSTEM — Creator grants council/admin roles
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post("/auth/generate-invite")
async def generate_invite_code(data: dict = Body(...), user=Depends(get_current_user)):
    """Admin/Creator generates an invite code that grants a role to whoever redeems it."""
    if user.get("role") not in ("admin", "creator"):
        raise HTTPException(status_code=403, detail="Only Creator/Admin can generate invite codes")

    role = data.get("role", "council")  # council, admin
    if role not in ("council", "admin"):
        raise HTTPException(status_code=400, detail="Role must be 'council' or 'admin'")

    max_uses = data.get("max_uses", 1)
    code = f"EMC-{uuid.uuid4().hex[:8].upper()}"

    await db.invite_codes.insert_one({
        "code": code,
        "role": role,
        "created_by": user["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "max_uses": max_uses,
        "uses": 0,
        "redeemed_by": [],
        "active": True,
    })

    return {"code": code, "role": role, "max_uses": max_uses}


@router.post("/auth/redeem-invite")
async def redeem_invite_code(data: dict = Body(...), user=Depends(get_current_user)):
    """User redeems an invite code to upgrade their role."""
    code = data.get("code", "").strip().upper()
    if not code:
        raise HTTPException(status_code=400, detail="Invite code required")

    invite = await db.invite_codes.find_one({"code": code, "active": True})
    if not invite:
        raise HTTPException(status_code=404, detail="Invalid or expired invite code")

    if invite["uses"] >= invite["max_uses"]:
        raise HTTPException(status_code=410, detail="Invite code has been fully redeemed")

    if user["id"] in invite.get("redeemed_by", []):
        raise HTTPException(status_code=409, detail="You already redeemed this code")

    new_role = invite["role"]

    # Update user role
    await db.users.update_one({"id": user["id"]}, {"$set": {"role": new_role}})

    # Update invite usage
    await db.invite_codes.update_one(
        {"code": code},
        {"$inc": {"uses": 1}, "$push": {"redeemed_by": user["id"]}}
    )

    # If max uses reached, deactivate
    if invite["uses"] + 1 >= invite["max_uses"]:
        await db.invite_codes.update_one({"code": code}, {"$set": {"active": False}})

    return {"status": "role_upgraded", "new_role": new_role, "user_id": user["id"]}


@router.get("/auth/my-invites")
async def get_my_invites(user=Depends(get_current_user)):
    """Admin/Creator lists their generated invite codes."""
    if user.get("role") not in ("admin", "creator"):
        raise HTTPException(status_code=403, detail="Only Creator/Admin can view invite codes")

    invites = await db.invite_codes.find(
        {"created_by": user["id"]}, {"_id": 0}
    ).to_list(100)

    return {"invites": invites}




# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  AVATAR SYSTEM
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AVATAR_SYMBOLS = [
    "lotus", "star", "moon", "sun", "flame", "leaf",
    "crystal", "feather", "spiral", "eye", "wave", "mountain",
]

AVATAR_COLORS = [
    "#FBBF24", "#2DD4BF", "#A78BFA", "#F472B6", "#60A5FA",
    "#34D399", "#FB923C", "#818CF8", "#F87171", "#22D3EE",
]


@router.get("/auth/avatar")
async def get_avatar(user=Depends(get_current_user)):
    """Get the user's avatar settings."""
    found = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    if not found:
        raise HTTPException(status_code=404, detail="User not found")
    avatar = found.get("avatar", {
        "color": "#FBBF24",
        "symbol": "star",
        "display_name": found.get("name", "Traveler"),
    })
    return {
        "avatar": avatar,
        "available_symbols": AVATAR_SYMBOLS,
        "available_colors": AVATAR_COLORS,
    }


@router.put("/auth/avatar")
async def update_avatar(data: dict, user=Depends(get_current_user)):
    """Update the user's avatar settings."""
    color = data.get("color", "#FBBF24")
    symbol = data.get("symbol", "star")
    display_name = data.get("display_name", "").strip()

    if color not in AVATAR_COLORS:
        color = "#FBBF24"
    if symbol not in AVATAR_SYMBOLS:
        symbol = "star"
    if not display_name:
        found = await db.users.find_one({"id": user["id"]}, {"_id": 0, "name": 1})
        display_name = found.get("name", "Traveler") if found else "Traveler"

    avatar = {"color": color, "symbol": symbol, "display_name": display_name[:20]}
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"avatar": avatar}},
    )
    return {"success": True, "avatar": avatar}
