from fastapi import APIRouter, HTTPException, Depends, Body
from fastapi.responses import JSONResponse
from deps import db, get_current_user, logger
from datetime import datetime, timezone
import os
import json
import uuid

router = APIRouter()

VAPID_PUBLIC_KEY = os.environ.get("VAPID_PUBLIC_KEY", "")
VAPID_PRIVATE_KEY = os.environ.get("VAPID_PRIVATE_KEY", "")
VAPID_CLAIMS_EMAIL = os.environ.get("VAPID_CLAIMS_EMAIL", "mailto:cosmic@cosmicollective.app")


@router.get("/notifications/vapid-public-key")
async def get_vapid_public_key():
    return {"public_key": VAPID_PUBLIC_KEY}


@router.post("/notifications/subscribe")
async def subscribe(data: dict = Body(...), user=Depends(get_current_user)):
    subscription = data.get("subscription")
    if not subscription or not subscription.get("endpoint"):
        raise HTTPException(status_code=400, detail="Invalid subscription object")

    sub_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "endpoint": subscription["endpoint"],
        "keys": subscription.get("keys", {}),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    # Upsert by endpoint to avoid duplicates
    await db.push_subscriptions.update_one(
        {"user_id": user["id"], "endpoint": subscription["endpoint"]},
        {"$set": sub_doc},
        upsert=True,
    )

    return {"status": "subscribed"}


@router.delete("/notifications/unsubscribe")
async def unsubscribe(data: dict = Body(...), user=Depends(get_current_user)):
    endpoint = data.get("endpoint", "")
    if endpoint:
        await db.push_subscriptions.delete_one({"user_id": user["id"], "endpoint": endpoint})
    else:
        await db.push_subscriptions.delete_many({"user_id": user["id"]})
    return {"status": "unsubscribed"}


@router.get("/notifications/status")
async def notification_status(user=Depends(get_current_user)):
    count = await db.push_subscriptions.count_documents({"user_id": user["id"]})
    prefs = await db.notification_prefs.find_one({"user_id": user["id"]}, {"_id": 0})
    return {
        "subscribed": count > 0,
        "subscription_count": count,
        "preferences": prefs or {
            "daily_relaxation": True,
            "cosmic_insights": True,
            "practice_reminders": True,
        },
    }


@router.post("/notifications/preferences")
async def update_preferences(data: dict = Body(...), user=Depends(get_current_user)):
    prefs = {
        "user_id": user["id"],
        "daily_relaxation": data.get("daily_relaxation", True),
        "cosmic_insights": data.get("cosmic_insights", True),
        "practice_reminders": data.get("practice_reminders", True),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.notification_prefs.update_one(
        {"user_id": user["id"]}, {"$set": prefs}, upsert=True
    )
    return {"status": "updated", "preferences": {k: v for k, v in prefs.items() if k != "_id" and k != "user_id"}}


async def send_push_to_user(user_id: str, title: str, body: str, url: str = "/", tag: str = "cosmic"):
    """Utility to send push notification to all user's subscriptions."""
    from pywebpush import webpush, WebPushException

    subs = await db.push_subscriptions.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(10)

    payload = json.dumps({
        "title": title,
        "body": body,
        "url": url,
        "tag": tag,
        "icon": "/logo192.png",
        "badge": "/logo192.png",
    })

    sent = 0
    for sub in subs:
        subscription_info = {
            "endpoint": sub["endpoint"],
            "keys": sub.get("keys", {}),
        }
        try:
            webpush(
                subscription_info=subscription_info,
                data=payload,
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims={"sub": VAPID_CLAIMS_EMAIL},
            )
            sent += 1
        except WebPushException as e:
            logger.warning(f"Push failed for {sub.get('endpoint', '')[:40]}: {e}")
            if "410" in str(e) or "404" in str(e):
                await db.push_subscriptions.delete_one({"endpoint": sub["endpoint"]})
        except Exception as e:
            logger.error(f"Push error: {e}")

    return sent


@router.post("/notifications/send-test")
async def send_test_notification(user=Depends(get_current_user)):
    """Send a test push notification to the current user."""
    sent = await send_push_to_user(
        user["id"],
        "Quantum Field Activated",
        "Your consciousness is entangled with the cosmos. Time for a moment of stillness.",
        "/meditation",
        "test",
    )
    return {"sent": sent}
