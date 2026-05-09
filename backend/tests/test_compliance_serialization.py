"""
test_compliance_serialization.py — V1.2.4
─────────────────────────────────────────
Asserts that user-facing API responses NEVER emit:
  • Forbidden medical-claim terms ("Healing Arts", "Light Therapy", "Aromatherapy",
    "Chromotherapy", "Sound Healing", "Crystal Healing", "Reiki Healing",
    "Frequency Therapy")
  • The string literal "undefined" for required tool fields

Run before every deploy:
    pytest backend/tests/test_compliance_serialization.py -v
"""
import os
import sys
import pytest
import requests

API = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/") + "/api"

# Public endpoints that emit user-facing labels — no auth required.
PUBLIC_ENDPOINTS = [
    "/workshop/registry",
    "/workshop/search?q=workshop",
    "/workshop/geology/tools",
    "/workshop/nutrition/tools",
    "/workshop/permaculture/tools",
]

FORBIDDEN_TERMS = [
    "Healing Arts",
    "Light Therapy",
    "Aromatherapy",
    "Chromotherapy",
    "Sound Healing",
    "Crystal Healing",
    "Reiki Healing",
    "Frequency Therapy",
    "Healing Pillar",
    "Healing Arts Cell",
]


def _all_strings(obj):
    """Recursively yield every string inside a JSON-like structure."""
    if isinstance(obj, str):
        yield obj
    elif isinstance(obj, dict):
        for v in obj.values():
            yield from _all_strings(v)
    elif isinstance(obj, (list, tuple)):
        for v in obj:
            yield from _all_strings(v)


@pytest.mark.parametrize("path", PUBLIC_ENDPOINTS)
def test_no_forbidden_terms_in_response(path):
    """API responses must not leak medical-claim terms."""
    res = requests.get(f"{API}{path}", timeout=10)
    assert res.status_code == 200, f"GET {path} returned {res.status_code}"
    data = res.json()
    leaks = []
    for s in _all_strings(data):
        for term in FORBIDDEN_TERMS:
            if term in s:
                leaks.append(f"  '{term}' found in: {s[:120]}")
                break
    assert not leaks, f"\n[{path}] leaked forbidden terms:\n" + "\n".join(leaks[:20])


@pytest.mark.parametrize("module_id", ["geology", "nutrition", "permaculture", "first_aid"])
def test_workshop_tools_have_technique_and_description(module_id):
    """Every tool must serialize technique + description so frontend never renders 'undefined'."""
    res = requests.get(f"{API}/workshop/{module_id}/tools", timeout=10)
    assert res.status_code == 200, f"GET /workshop/{module_id}/tools returned {res.status_code}"
    data = res.json()
    tools = data.get("tools", [])
    assert tools, f"/workshop/{module_id}/tools returned empty tool list"
    for t in tools:
        assert "technique" in t and t["technique"], f"{module_id}.{t.get('id', '?')}: missing/empty technique"
        assert "description" in t and t["description"], f"{module_id}.{t.get('id', '?')}: missing/empty description"
        assert "undefined" not in (t.get("technique") or ""), f"{module_id}.{t.get('id', '?')}: technique == 'undefined'"
        assert "undefined" not in (t.get("description") or ""), f"{module_id}.{t.get('id', '?')}: description == 'undefined'"
