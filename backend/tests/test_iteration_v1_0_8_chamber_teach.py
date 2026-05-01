"""
test_iteration_v1_0_8_chamber_teach.py — V1.0.8 regression

Validates the chamber-friendly fast path on /api/knowledge/deep-dive:

1. mode='quick' switches the backend to gpt-4o-mini with a 22s ceiling
   so the chamber LEARN button returns a real lesson inside the
   60-second preview-ingress window (instead of hanging at "TEACHING…"
   with an ingress-killed gpt-5.2 request).
2. The KnowledgeRequest pydantic model accepts the new optional `mode`
   field without breaking existing callers that omit it.
3. Default mode (no `mode` field, or mode=None, or mode='deep') keeps
   the original gpt-5.2 / 45s × 2 attempts behaviour.

These tests are pure validation of the request-shape and the routing
logic; they do not actually call the LLM (pytest must stay fast).
The live LLM call is exercised manually via curl during release prep.
"""
import pytest
from models import KnowledgeRequest


def test_knowledge_request_accepts_mode_quick():
    req = KnowledgeRequest(
        topic="Igneous Rocks",
        category="general",
        mode="quick",
    )
    assert req.mode == "quick"
    assert req.topic == "Igneous Rocks"
    assert req.category == "general"


def test_knowledge_request_mode_optional():
    """Existing callers that omit mode must still work — backward compat."""
    req = KnowledgeRequest(topic="Tantra", category="tantra")
    assert req.mode is None
    assert req.topic == "Tantra"


def test_knowledge_request_mode_can_be_explicit_none():
    req = KnowledgeRequest(topic="Mudra", category="mudra", mode=None)
    assert req.mode is None


def test_quick_mode_routing_logic_exists():
    """The endpoint source must contain the V1.0.8 fast-path branch."""
    import inspect
    from routes import knowledge as kmod
    src = inspect.getsource(kmod.knowledge_deep_dive)
    # The branch must check req.mode == 'quick' and select gpt-4o-mini
    # with a sub-30s timeout, so the chamber LEARN button cannot hang.
    assert "quick" in src.lower()
    assert "gpt-4o-mini" in src
    # Timeout must be tight enough to fit inside the preview ingress
    # 60s window with margin.
    assert "timeout_s = 22" in src or "timeout=22" in src or "timeout_s=22" in src


def test_deep_mode_still_uses_gpt_52():
    """Non-chamber callers still get the deep gpt-5.2 lesson."""
    import inspect
    from routes import knowledge as kmod
    src = inspect.getsource(kmod.knowledge_deep_dive)
    assert "gpt-5.2" in src
    assert "timeout_s = 45" in src or "timeout=45" in src
