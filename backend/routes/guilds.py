from fastapi import APIRouter, Depends, HTTPException
from deps import db, get_current_user, create_activity
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/guilds", tags=["Guilds & Identity"])

# ─── Identity Modes ───
IDENTITY_MODES = {
    "full": {"id": "full", "name": "Full Identity", "description": "Standard video/audio transparency", "visible": True, "avatar": False},
    "avatar": {"id": "avatar", "name": "Avatar", "description": "Geometric visualization synced to voice frequency", "visible": True, "avatar": True},
    "ghost": {"id": "ghost", "name": "Ghost", "description": "Completely invisible to others", "visible": False, "avatar": False},
}

# ─── Guild Definitions (Class-Based) ───
CLASS_GUILDS = {
    "shaman": {"id": "guild_shaman", "name": "Resonance Circle", "class_id": "shaman", "color": "#C084FC"},
    "nomad": {"id": "guild_nomad", "name": "Wayfinder Lodge", "class_id": "nomad", "color": "#2DD4BF"},
    "architect": {"id": "guild_architect", "name": "Blueprint Sanctum", "class_id": "architect", "color": "#FBBF24"},
    "merchant": {"id": "guild_merchant", "name": "Trade Circle", "class_id": "merchant", "color": "#F59E0B"},
}

# ─── Widget Feed Channels ───
WIDGET_FEEDS = {
    "solfeggio": {"id": "feed_solfeggio", "name": "Frequency Exchange", "widget": "solfeggio", "color": "#C084FC"},
    "ambient": {"id": "feed_ambient", "name": "Soundscape Commons", "widget": "ambient", "color": "#3B82F6"},
    "orbital": {"id": "feed_orbital", "name": "Synthesis Lab", "widget": "orbital", "color": "#22C55E"},
    "forge": {"id": "feed_forge", "name": "Forge Workshop", "widget": "forge", "color": "#FBBF24"},
}


# ─── Identity Management ───

@router.get("/identity")
async def get_identity(user=Depends(get_current_user)):
    """Get current user's identity settings."""
    settings = await db.identity_settings.find_one({"user_id": user["id"]}, {"_id": 0})
    if not settings:
        settings = {
            "user_id": user["id"],
            "mode": "full",
            "mic_enabled": True,
            "video_enabled": True,
        }
    mode_data = IDENTITY_MODES.get(settings.get("mode", "full"), IDENTITY_MODES["full"])
    return {**settings, "mode_data": mode_data}


@router.patch("/identity")
async def update_identity(body: dict, user=Depends(get_current_user)):
    """Update identity mode and mic/video toggles."""
    updates = {}
    if "mode" in body:
        if body["mode"] not in IDENTITY_MODES:
            raise HTTPException(400, f"Invalid mode. Choose: {list(IDENTITY_MODES.keys())}")
        updates["mode"] = body["mode"]
    if "mic_enabled" in body:
        updates["mic_enabled"] = bool(body["mic_enabled"])
    if "video_enabled" in body:
        updates["video_enabled"] = bool(body["video_enabled"])

    if not updates:
        raise HTTPException(400, "No valid fields")

    updates["updated_at"] = datetime.now(timezone.utc).isoformat()

    await db.identity_settings.update_one(
        {"user_id": user["id"]},
        {"$set": updates, "$setOnInsert": {"user_id": user["id"]}},
        upsert=True,
    )

    settings = await db.identity_settings.find_one({"user_id": user["id"]}, {"_id": 0})
    mode_data = IDENTITY_MODES.get(settings.get("mode", "full"), IDENTITY_MODES["full"])
    return {**settings, "mode_data": mode_data}


# ─── Guild & Feed Channels ───

@router.get("/channels")
async def get_channels(user=Depends(get_current_user)):
    """Get all available guild and widget feed channels."""
    # Get user's class for guild access
    profile = await db.class_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    user_class = profile.get("class_id") if profile else None

    guilds = []
    for gid, guild in CLASS_GUILDS.items():
        guilds.append({
            **guild,
            "accessible": user_class == gid,
            "member_count": await db.guild_members.count_documents({"guild_id": guild["id"]}),
        })

    feeds = []
    for fid, feed in WIDGET_FEEDS.items():
        feeds.append({
            **feed,
            "accessible": True,
            "active_users": await db.feed_presence.count_documents({"feed_id": feed["id"]}),
        })

    return {"guilds": guilds, "feeds": feeds}


@router.post("/feed/{feed_id}/post")
async def post_to_feed(feed_id: str, body: dict, user=Depends(get_current_user)):
    """Post a message or blueprint to a widget feed."""
    # Validate feed exists
    feed = None
    for f in {**WIDGET_FEEDS, **{g["id"]: g for g in CLASS_GUILDS.values()}}:
        if f == feed_id or (isinstance(f, dict) and f.get("id") == feed_id):
            feed = f
            break

    text = body.get("text", "")
    blueprint = body.get("blueprint")

    if not text and not blueprint:
        raise HTTPException(400, "Content required")

    # Check identity — ghost users can't post
    identity = await db.identity_settings.find_one({"user_id": user["id"]}, {"_id": 0})
    if identity and identity.get("mode") == "ghost":
        raise HTTPException(403, "Ghost mode users cannot post to feeds")

    post_doc = {
        "id": str(uuid.uuid4()),
        "feed_id": feed_id,
        "user_id": user["id"],
        "user_name": user.get("name", "Anonymous"),
        "identity_mode": identity.get("mode", "full") if identity else "full",
        "text": text[:500],
        "blueprint": blueprint,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.feed_posts.insert_one(post_doc)
    post_doc.pop("_id", None)
    return post_doc


@router.get("/feed/{feed_id}/posts")
async def get_feed_posts(feed_id: str, skip: int = 0, limit: int = 30):
    """Get posts from a widget feed or guild channel."""
    posts = await db.feed_posts.find(
        {"feed_id": feed_id}, {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)

    # Mask ghost user names
    for post in posts:
        if post.get("identity_mode") == "ghost":
            post["user_name"] = "Anonymous Entity"

    return posts


@router.post("/feed/{feed_id}/join")
async def join_feed(feed_id: str, user=Depends(get_current_user)):
    """Mark user as present in a feed (for active user count)."""
    await db.feed_presence.update_one(
        {"feed_id": feed_id, "user_id": user["id"]},
        {"$set": {"feed_id": feed_id, "user_id": user["id"], "joined_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return {"joined": True}


@router.post("/feed/{feed_id}/leave")
async def leave_feed(feed_id: str, user=Depends(get_current_user)):
    """Remove user presence from a feed."""
    await db.feed_presence.delete_one({"feed_id": feed_id, "user_id": user["id"]})
    return {"left": True}
