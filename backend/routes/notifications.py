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
            "reminder_hour": 8,
            "evening_hour": 20,
        },
    }


@router.post("/notifications/preferences")
async def update_preferences(data: dict = Body(...), user=Depends(get_current_user)):
    prefs = {
        "user_id": user["id"],
        "daily_relaxation": data.get("daily_relaxation", True),
        "cosmic_insights": data.get("cosmic_insights", True),
        "practice_reminders": data.get("practice_reminders", True),
        "reminder_hour": data.get("reminder_hour", 8),
        "evening_hour": data.get("evening_hour", 20),
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



QUANTUM_REMINDERS = {
    "morning": [
        ("Superposition Activated", "Infinite possibilities await you today. Collapse the wave function with your first breath.", "/breathing"),
        ("Quantum Coherence Check", "Your biofield is calibrating. A 5-minute meditation will bring all particles into alignment.", "/meditation"),
        ("Observer Effect: Active", "Your awareness shapes today's reality. Where will you place your cosmic gaze?", "/daily-briefing"),
        ("Entanglement Pulse", "You are connected to everyone you love — across any distance. Send them light.", "/coach"),
        ("Zero-Point Stillness", "Even in the void, energy hums. Start your day from the field of infinite potential.", "/meditation"),
    ],
    "evening": [
        ("Wave Function Settling", "The day's probabilities have collapsed into experience. Time to return to wave-state.", "/breathing"),
        ("Quantum Tunneling Complete", "Whatever barriers you faced today, your spirit passed through them. Rest now.", "/meditation"),
        ("Decoherence Release", "Let scattered energies re-harmonize. Your quantum field is resetting.", "/soundscapes"),
        ("Entanglement Gratitude", "Every connection today rippled across the quantum web. Feel the web hum with thanks.", "/journal"),
        ("Superposition Restoration", "Sleep returns you to superposition — holding all possibilities for tomorrow.", "/meditation"),
    ],
}


@router.get("/notifications/quantum-coherence")
async def get_quantum_coherence(user=Depends(get_current_user)):
    """Calculate quantum coherence score based on practice consistency."""
    now = datetime.now(timezone.utc)
    week_ago = (now - __import__('datetime').timedelta(days=7)).isoformat()

    # Gather practice signals
    mood_count = await db.mood_logs.count_documents({"user_id": user["id"], "timestamp": {"$gte": week_ago}})
    journal_count = await db.journals.count_documents({"user_id": user["id"], "created_at": {"$gte": week_ago}})
    med_count = await db.meditation_sessions.count_documents({"user_id": user["id"], "created_at": {"$gte": week_ago}})
    breath_count = await db.breath_sessions.count_documents({"user_id": user["id"], "created_at": {"$gte": week_ago}})
    streak_doc = await db.streaks.find_one({"user_id": user["id"]}, {"_id": 0})
    streak = streak_doc.get("current_streak", 0) if streak_doc else 0

    # Coherence formula: variety of practices + consistency
    variety_score = min(5, sum(1 for c in [mood_count, journal_count, med_count, breath_count] if c > 0)) * 10
    frequency_score = min(50, (mood_count + journal_count + med_count + breath_count) * 3)
    streak_bonus = min(25, streak * 5)
    coherence = min(100, variety_score + frequency_score + streak_bonus)

    # Determine quantum state description
    if coherence >= 80:
        state = "Quantum Coherence"
        desc = "All systems in phase — your biofield is amplifying exponentially"
        phase = "coherent"
    elif coherence >= 55:
        state = "Partial Alignment"
        desc = "Wave patterns converging — approaching coherence threshold"
        phase = "aligning"
    elif coherence >= 30:
        state = "Decoherence"
        desc = "Scattered frequencies detected — more practice will re-harmonize your field"
        phase = "decoherent"
    else:
        state = "Zero-Point"
        desc = "Resting in the void of potential — even one practice session activates the field"
        phase = "zeropoint"

    return {
        "coherence_score": coherence,
        "state": state,
        "description": desc,
        "phase": phase,
        "breakdown": {
            "variety": variety_score,
            "frequency": frequency_score,
            "streak_bonus": streak_bonus,
        },
        "signals": {
            "mood_logs": mood_count,
            "journal_entries": journal_count,
            "meditations": med_count,
            "breathwork": breath_count,
            "streak": streak,
        },
    }


@router.post("/notifications/send-scheduled")
async def send_scheduled_reminders(data: dict = Body(...)):
    """Trigger scheduled reminders for a given time slot (morning/evening). Called by scheduler."""
    import random
    slot = data.get("slot", "morning")
    messages = QUANTUM_REMINDERS.get(slot, QUANTUM_REMINDERS["morning"])

    # Find all users with active subscriptions and matching preference
    pref_key = "daily_relaxation"
    prefs_cursor = db.notification_prefs.find(
        {pref_key: True}, {"_id": 0, "user_id": 1}
    )
    user_ids = [p["user_id"] async for p in prefs_cursor]

    sent_total = 0
    for uid in user_ids:
        title, body, url = random.choice(messages)
        count = await send_push_to_user(uid, title, body, url, f"daily-{slot}")
        sent_total += count

    return {"slot": slot, "users_targeted": len(user_ids), "notifications_sent": sent_total}



# ─── In-App Notifications ───

@router.get("/notifications/inbox")
async def get_inbox(user=Depends(get_current_user)):
    """Get in-app notifications for the current user."""
    notifs = await db.in_app_notifications.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    unread = sum(1 for n in notifs if not n.get("read"))
    return {"notifications": notifs, "unread_count": unread}


@router.post("/notifications/read/{notif_id}")
async def mark_read(notif_id: str, user=Depends(get_current_user)):
    """Mark a notification as read."""
    await db.in_app_notifications.update_one(
        {"id": notif_id, "user_id": user["id"]},
        {"$set": {"read": True}}
    )
    return {"status": "read"}


@router.post("/notifications/read-all")
async def mark_all_read(user=Depends(get_current_user)):
    """Mark all notifications as read."""
    await db.in_app_notifications.update_many(
        {"user_id": user["id"], "read": False},
        {"$set": {"read": True}}
    )
    return {"status": "all_read"}
