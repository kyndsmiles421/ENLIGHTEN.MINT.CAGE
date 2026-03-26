from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()
from deps import create_activity
import asyncio, random

# ========== FRIENDS SYSTEM ==========

@router.get("/users/discover")
async def discover_users(page: int = 1, limit: int = 20, user=Depends(get_current_user)):
    skip = (page - 1) * limit
    all_users = await db.users.find(
        {"id": {"$ne": user["id"]}},
        {"_id": 0, "password": 0, "email": 0}
    ).skip(skip).limit(limit).to_list(limit)

    user_ids = [u["id"] for u in all_users]
    friendships = await db.friendships.find(
        {"$or": [
            {"user_a": user["id"], "user_b": {"$in": user_ids}},
            {"user_b": user["id"], "user_a": {"$in": user_ids}},
        ]}, {"_id": 0}
    ).to_list(200)
    friend_set = {f["user_a"] if f["user_b"] == user["id"] else f["user_b"] for f in friendships}

    pending = await db.friend_requests.find(
        {"$or": [
            {"from_id": user["id"], "to_id": {"$in": user_ids}, "status": "pending"},
            {"to_id": user["id"], "from_id": {"$in": user_ids}, "status": "pending"},
        ]}, {"_id": 0}
    ).to_list(200)
    pending_set = {p["to_id"] if p["from_id"] == user["id"] else p["from_id"] for p in pending}

    results = []
    for u in all_users:
        profile = await db.profiles.find_one({"user_id": u["id"]}, {"_id": 0}) or {}
        results.append({
            "id": u["id"],
            "name": u.get("name", ""),
            "display_name": profile.get("display_name") or u.get("name", ""),
            "avatar_style": profile.get("avatar_style", "purple-teal"),
            "theme_color": profile.get("theme_color", "#D8B4FE"),
            "vibe_status": profile.get("vibe_status", ""),
            "streak": 0,
            "is_friend": u["id"] in friend_set,
            "is_pending": u["id"] in pending_set,
            "message_privacy": profile.get("message_privacy", "everyone"),
        })
    total = await db.users.count_documents({"id": {"$ne": user["id"]}})
    return {"users": results, "total": total, "page": page}


@router.post("/friends/request")
async def send_friend_request(data: dict, user=Depends(get_current_user)):
    target_id = data.get("user_id", "")
    if not target_id or target_id == user["id"]:
        raise HTTPException(status_code=400, detail="Invalid user_id")

    target = await db.users.find_one({"id": target_id})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    existing = await db.friend_requests.find_one({
        "$or": [
            {"from_id": user["id"], "to_id": target_id, "status": "pending"},
            {"from_id": target_id, "to_id": user["id"], "status": "pending"},
        ]
    })
    if existing:
        return {"status": "already_pending", "message": "Request already pending"}

    already_friends = await db.friendships.find_one({
        "$or": [
            {"user_a": user["id"], "user_b": target_id},
            {"user_a": target_id, "user_b": user["id"]},
        ]
    })
    if already_friends:
        return {"status": "already_friends", "message": "Already friends"}

    doc = {
        "id": str(uuid.uuid4()),
        "from_id": user["id"],
        "from_name": user["name"],
        "to_id": target_id,
        "to_name": target.get("name", ""),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.friend_requests.insert_one(doc)

    # Create activity
    await create_activity(user["id"], "friend_request", f"sent a friend request to {target.get('name', 'someone')}", {"target_id": target_id})

    return {"status": "sent", "message": f"Request sent to {target.get('name', '')}"}


@router.post("/friends/respond")
async def respond_friend_request(data: dict, user=Depends(get_current_user)):
    request_id = data.get("request_id", "")
    action = data.get("action", "")  # "accept" or "decline"
    if not request_id or action not in ("accept", "decline"):
        raise HTTPException(status_code=400, detail="request_id and action (accept/decline) required")

    req = await db.friend_requests.find_one({"id": request_id, "to_id": user["id"], "status": "pending"})
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if action == "accept":
        await db.friend_requests.update_one({"id": request_id}, {"$set": {"status": "accepted"}})
        friendship = {
            "id": str(uuid.uuid4()),
            "user_a": req["from_id"],
            "user_b": req["to_id"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.friendships.insert_one(friendship)
        # Also ensure mutual follows
        for pair in [(req["from_id"], req["to_id"]), (req["to_id"], req["from_id"])]:
            exists = await db.follows.find_one({"follower_id": pair[0], "following_id": pair[1]})
            if not exists:
                await db.follows.insert_one({"follower_id": pair[0], "following_id": pair[1], "created_at": datetime.now(timezone.utc).isoformat()})

        await create_activity(user["id"], "friend_accepted", f"became friends with {req['from_name']}", {"friend_id": req["from_id"]})
        return {"status": "accepted", "message": f"You are now friends with {req['from_name']}"}
    else:
        await db.friend_requests.update_one({"id": request_id}, {"$set": {"status": "declined"}})
        return {"status": "declined", "message": "Request declined"}


@router.delete("/friends/{friend_id}")
async def remove_friend(friend_id: str, user=Depends(get_current_user)):
    result = await db.friendships.delete_one({
        "$or": [
            {"user_a": user["id"], "user_b": friend_id},
            {"user_a": friend_id, "user_b": user["id"]},
        ]
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Friendship not found")
    return {"status": "removed"}


@router.get("/friends/list")
async def get_friends_list(user=Depends(get_current_user)):
    friendships = await db.friendships.find(
        {"$or": [{"user_a": user["id"]}, {"user_b": user["id"]}]},
        {"_id": 0}
    ).to_list(200)

    friend_ids = []
    for f in friendships:
        fid = f["user_b"] if f["user_a"] == user["id"] else f["user_a"]
        friend_ids.append(fid)

    friends = []
    for fid in friend_ids:
        u = await db.users.find_one({"id": fid}, {"_id": 0, "password": 0, "email": 0})
        if u:
            profile = await db.profiles.find_one({"user_id": fid}, {"_id": 0}) or {}
            streak = await db.streaks.find_one({"user_id": fid}, {"_id": 0})
            friends.append({
                "id": fid,
                "name": u.get("name", ""),
                "display_name": profile.get("display_name") or u.get("name", ""),
                "avatar_style": profile.get("avatar_style", "purple-teal"),
                "vibe_status": profile.get("vibe_status", ""),
                "theme_color": profile.get("theme_color", "#D8B4FE"),
                "streak": streak.get("current_streak", 0) if streak else 0,
            })

    return {"friends": friends, "count": len(friends)}


@router.get("/friends/requests")
async def get_friend_requests(user=Depends(get_current_user)):
    received = await db.friend_requests.find(
        {"to_id": user["id"], "status": "pending"}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    sent = await db.friend_requests.find(
        {"from_id": user["id"], "status": "pending"}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return {"received": received, "sent": sent}


@router.get("/friends/search")
async def search_users(q: str = "", user=Depends(get_current_user)):
    if not q or len(q) < 2:
        return {"users": []}

    results = await db.users.find(
        {"name": {"$regex": q, "$options": "i"}, "id": {"$ne": user["id"]}},
        {"_id": 0, "password": 0, "email": 0}
    ).to_list(20)

    user_ids = [r["id"] for r in results]
    friendships = await db.friendships.find(
        {"$or": [
            {"user_a": user["id"], "user_b": {"$in": user_ids}},
            {"user_b": user["id"], "user_a": {"$in": user_ids}},
        ]},
        {"_id": 0}
    ).to_list(200)
    friend_set = set()
    for f in friendships:
        friend_set.add(f["user_a"] if f["user_b"] == user["id"] else f["user_b"])

    pending = await db.friend_requests.find(
        {"$or": [
            {"from_id": user["id"], "to_id": {"$in": user_ids}, "status": "pending"},
            {"to_id": user["id"], "from_id": {"$in": user_ids}, "status": "pending"},
        ]},
        {"_id": 0}
    ).to_list(200)
    pending_set = set()
    for p in pending:
        pending_set.add(p["to_id"] if p["from_id"] == user["id"] else p["from_id"])

    users = []
    for r in results:
        profile = await db.profiles.find_one({"user_id": r["id"]}, {"_id": 0}) or {}
        users.append({
            "id": r["id"],
            "name": r.get("name", ""),
            "display_name": profile.get("display_name") or r.get("name", ""),
            "avatar_style": profile.get("avatar_style", "purple-teal"),
            "theme_color": profile.get("theme_color", "#D8B4FE"),
            "vibe_status": profile.get("vibe_status", ""),
            "is_friend": r["id"] in friend_set,
            "is_pending": r["id"] in pending_set,
            "message_privacy": profile.get("message_privacy", "everyone"),
        })

    return {"users": users}


@router.get("/friends/suggested")
async def get_suggested_friends(user=Depends(get_current_user)):
    friendships = await db.friendships.find(
        {"$or": [{"user_a": user["id"]}, {"user_b": user["id"]}]},
        {"_id": 0}
    ).to_list(200)
    friend_ids = set()
    for f in friendships:
        friend_ids.add(f["user_b"] if f["user_a"] == user["id"] else f["user_a"])
    friend_ids.add(user["id"])

    all_users = await db.users.find(
        {"id": {"$nin": list(friend_ids)}},
        {"_id": 0, "password": 0, "email": 0}
    ).to_list(10)

    pending = await db.friend_requests.find(
        {"from_id": user["id"], "status": "pending"}, {"_id": 0}
    ).to_list(100)
    pending_ids = {p["to_id"] for p in pending}

    suggested = []
    for u in all_users:
        profile = await db.profiles.find_one({"user_id": u["id"]}, {"_id": 0}) or {}
        streak = await db.streaks.find_one({"user_id": u["id"]}, {"_id": 0})
        suggested.append({
            "id": u["id"],
            "name": u.get("name", ""),
            "display_name": profile.get("display_name") or u.get("name", ""),
            "avatar_style": profile.get("avatar_style", "purple-teal"),
            "theme_color": profile.get("theme_color", "#D8B4FE"),
            "vibe_status": profile.get("vibe_status", ""),
            "streak": streak.get("current_streak", 0) if streak else 0,
            "is_pending": u["id"] in pending_ids,
        })

    return {"suggested": suggested}



@router.get("/friends/feed")
async def get_friends_feed(user=Depends(get_current_user)):
    friendships = await db.friendships.find(
        {"$or": [{"user_a": user["id"]}, {"user_b": user["id"]}]},
        {"_id": 0}
    ).to_list(200)
    friend_ids = [user["id"]]
    for f in friendships:
        fid = f["user_b"] if f["user_a"] == user["id"] else f["user_a"]
        friend_ids.append(fid)

    activities = await db.activity_feed.find(
        {"user_id": {"$in": friend_ids}},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)

    return {"feed": activities}


@router.post("/friends/share")
async def share_with_friends(data: dict, user=Depends(get_current_user)):
    share_type = data.get("type", "")  # achievement, score, milestone, tool
    message = data.get("message", "")
    share_data = data.get("data", {})

    if not share_type or not message:
        raise HTTPException(status_code=400, detail="type and message required")

    await create_activity(user["id"], f"share_{share_type}", message, share_data)
    return {"status": "shared", "message": "Shared with your friends!"}


# ========== DIRECT MESSAGES ==========

@router.post("/messages/send")
async def send_message(data: dict, user=Depends(get_current_user)):
    to_id = data.get("to_id", "")
    text = data.get("text", "")
    if not to_id or not text:
        raise HTTPException(status_code=400, detail="to_id and text required")

    target = await db.users.find_one({"id": to_id}, {"_id": 0, "id": 1})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    # Check recipient's message privacy setting
    target_profile = await db.profiles.find_one({"user_id": to_id}, {"_id": 0})
    msg_privacy = (target_profile or {}).get("message_privacy", "everyone")
    if msg_privacy == "nobody":
        raise HTTPException(status_code=403, detail="This user has disabled messages")
    if msg_privacy == "friends_only":
        is_friend = await db.friendships.find_one({
            "$or": [
                {"user_a": user["id"], "user_b": to_id},
                {"user_a": to_id, "user_b": user["id"]},
            ]
        })
        if not is_friend:
            raise HTTPException(status_code=403, detail="This user only accepts messages from friends")

    convo_id = "_".join(sorted([user["id"], to_id]))
    doc = {
        "id": str(uuid.uuid4()),
        "conversation_id": convo_id,
        "from_id": user["id"],
        "from_name": user["name"],
        "to_id": to_id,
        "text": text,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.messages.insert_one(doc)
    return {"status": "sent", "message_id": doc["id"]}


@router.get("/messages/conversations")
async def get_conversations(user=Depends(get_current_user)):
    pipeline = [
        {"$match": {"$or": [{"from_id": user["id"]}, {"to_id": user["id"]}]}},
        {"$sort": {"created_at": -1}},
        {"$group": {
            "_id": "$conversation_id",
            "last_message": {"$first": "$text"},
            "last_from": {"$first": "$from_id"},
            "last_time": {"$first": "$created_at"},
            "unread_count": {"$sum": {"$cond": [{"$and": [{"$eq": ["$to_id", user["id"]]}, {"$eq": ["$read", False]}]}, 1, 0]}},
        }},
        {"$sort": {"last_time": -1}},
    ]
    convos = await db.messages.aggregate(pipeline).to_list(50)

    result = []
    for c in convos:
        parts = c["_id"].split("_")
        other_id = parts[0] if parts[1] == user["id"] else parts[1]
        other_user = await db.users.find_one({"id": other_id}, {"_id": 0, "password": 0, "email": 0})
        profile = await db.profiles.find_one({"user_id": other_id}, {"_id": 0}) or {}
        result.append({
            "conversation_id": c["_id"],
            "other_id": other_id,
            "other_name": profile.get("display_name") or (other_user.get("name", "") if other_user else ""),
            "avatar_style": profile.get("avatar_style", "purple-teal"),
            "theme_color": profile.get("theme_color", "#D8B4FE"),
            "last_message": c["last_message"][:80],
            "last_from": c["last_from"],
            "last_time": c["last_time"],
            "unread_count": c["unread_count"],
        })

    return {"conversations": result}


@router.get("/messages/{conversation_id}")
async def get_messages(conversation_id: str, user=Depends(get_current_user)):
    if user["id"] not in conversation_id:
        raise HTTPException(status_code=403, detail="Access denied")

    messages = await db.messages.find(
        {"conversation_id": conversation_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(200)

    # Mark as read
    await db.messages.update_many(
        {"conversation_id": conversation_id, "to_id": user["id"], "read": False},
        {"$set": {"read": True}}
    )

    return {"messages": messages}



