"""
Database Index Definitions — The Cosmic Collective
Creates indexes on startup for all heavily-queried collections.
Eliminates full collection scans, dramatically reducing response latency.
"""
from deps import db, logger


async def ensure_indexes():
    """Create all MongoDB indexes. Idempotent — safe to call on every startup."""
    try:
        # ── Core Auth ──
        await db.users.create_index("id", unique=True)
        await db.users.create_index("email", unique=True)

        # ── User-scoped collections (user_id is the primary access pattern) ──
        user_id_collections = [
            "moods", "journal", "profiles", "streaks", "coach_sessions",
            "custom_meditations", "activity_log", "user_garden", "zen_plants",
            "follows", "challenge_completions", "challenge_participants",
            "content_assets", "forge_items", "evolution_tracker",
            "user_credits", "push_subscriptions", "notification_prefs",
            "avatar_gallery", "starseed_characters", "rpg_characters",
            "rpg_currencies", "rpg_inventory", "multiverse_state",
            "avenue_progress", "mastery_tiers", "planetary_depth",
            "marketplace_inventory", "rock_hounding_collection",
            "node_harvests", "resonance_builds", "power_spots",
            "dreams", "dream_realms", "live_sessions", "coven_members",
            "mixer_subscriptions", "mixer_projects", "user_bonus_packs",
            "hexagram_journal", "dashboard_layouts", "scripture_journey_progress",
            "cosmic_state", "trade_listings", "starseed_alliances",
            "meditation_history", "daily_ritual_log", "wellness_reports",
            "cosmic_profiles", "community_posts", "activity_feed",
        ]
        for coll_name in user_id_collections:
            await db[coll_name].create_index("user_id")

        # ── Compound indexes for sorted queries (user_id + created_at DESC) ──
        sorted_collections = [
            "moods", "journal", "activity_log", "activity_feed",
            "community_posts", "coach_sessions", "dreams",
            "hexagram_journal", "meditation_history",
        ]
        for coll_name in sorted_collections:
            await db[coll_name].create_index(
                [("user_id", 1), ("created_at", -1)]
            )

        # ── Trade Circle ──
        await db.trade_listings.create_index("status")
        await db.trade_listings.create_index([("status", 1), ("created_at", -1)])
        await db.trade_offers.create_index("listing_id")
        await db.trade_offers.create_index("from_user_id")
        await db.trade_offers.create_index("to_user_id")

        # ── Community & Social ──
        await db.community_posts.create_index([("created_at", -1)])
        await db.follows.create_index([("follower_id", 1), ("following_id", 1)])
        await db.comments.create_index("post_id")

        # ── Live Sessions ──
        await db.live_sessions.create_index("status")
        await db.live_sessions.create_index([("status", 1), ("scheduled_at", 1)])

        # ── Feedback ──
        await db.feedback.create_index([("created_at", -1)])

        # ── Affirmations ──
        await db.affirmations.create_index("date")

        # ── Energy Gates ──
        await db.energy_gates.create_index("user_id")

        # ── Payment ──
        await db.payment_transactions.create_index("session_id")
        await db.broker_transactions.create_index("session_id")

        # ── Mixer-specific ──
        await db.mixer_projects.create_index([("user_id", 1), ("name", 1)])
        await db.mixer_recordings.create_index("user_id")
        await db.mixer_recordings.create_index([("user_id", 1), ("created_at", -1)])

        # ── Sovereign Architecture ──
        await db.sovereign_subscriptions.create_index("user_id", unique=True)
        await db.cross_tier_purchases.create_index("user_id")
        await db.cross_tier_purchases.create_index([("user_id", 1), ("feature_key", 1)])

        # ── Bible / Scripture ──
        await db.bible_chapters.create_index([("last_read_at", -1)])

        logger.info("All database indexes created/verified successfully")

    except Exception as e:
        logger.error(f"Index creation error: {e}")
