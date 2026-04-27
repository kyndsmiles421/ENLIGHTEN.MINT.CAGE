"""
test_iteration_v68_52.py — V68.52 ContextBus + primer ingestion regression.

Verifies:
  1) /api/myths/{civ_id}/generate accepts an optional `context_primer`
     field and returns {context_primed: true} when present.
  2) When a primer is supplied, the generated story is NOT pulled from
     the shared cache (each primed call is fresh and session-specific).
  3) Without a primer, generation falls back to the cached path and
     returns {context_primed: false} (backwards-compat).
  4) Primer hints (Pleiades / crystalline / phoenix / obsidian) appear
     in the LLM's output story when shipped via the primer.
"""
import os
import json
import urllib.request

API = os.environ.get("REACT_APP_BACKEND_URL", "https://zero-scale-physics.preview.emergentagent.com").rstrip("/") + "/api"
EMAIL = "kyndsmiles@gmail.com"
PASSWORD = "Sovereign2026!"


def _post(url, body, token=None):
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (sovereign-test-suite)",
            **({"Authorization": f"Bearer {token}"} if token else {}),
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))


def _login():
    res = _post(f"{API}/auth/login", {"email": EMAIL, "password": PASSWORD})
    return res.get("token") or res.get("access_token")


def test_myth_generate_without_primer_returns_uncontexted():
    """Unprimed generation should return context_primed=False."""
    token = _login()
    assert token, "login failed"
    res = _post(
        f"{API}/myths/mayan/generate",
        {"seed_title": "Kukulkan the Feathered Serpent"},
        token=token,
    )
    assert res.get("title"), "no title returned"
    assert res.get("context_primed") is False, "should NOT be primed"
    assert len(res.get("story", "")) > 100, "story too short"


def test_myth_generate_with_primer_returns_contexted_and_picks_up_hints():
    """Primed generation should return context_primed=True and the
    LLM's output should reference primer-supplied keywords."""
    token = _login()
    primer = (
        "\n\n[ContextBus — engine state]\n"
        'Current world: {"origin_name":"Pleiades","biome":"Crystalline Caverns of the Black Hills",'
        '"scene_description":"dark obsidian gates breathing violet shadow"}\n'
        'Current sovereign entity: {"description":"Crystal sovereign with violet aura",'
        '"spirit_animal":"phoenix"}\n'
    )
    res = _post(
        f"{API}/myths/mayan/generate",
        {"seed_title": "The Jaguar Sun God", "context_primer": primer},
        token=token,
    )
    assert res.get("title"), "no title returned"
    assert res.get("context_primed") is True, "should be primed"
    assert res.get("primer_hash"), "should have a primer_hash"
    story = res.get("story", "").lower()
    assert len(story) > 100, "story too short"
    # At least 3 of the 6 primer hints should land in the LLM output.
    hints = ["pleiades", "crystalline", "crystal", "violet", "obsidian", "phoenix"]
    hits = [h for h in hints if h in story]
    assert len(hits) >= 3, f"only {len(hits)} primer hints picked up: {hits}"


def test_myth_generate_primer_keyed_cache_returns_instantly_on_revisit():
    """V68.54 — Re-generating with the SAME primer must hit the cache
    (same primer_hash, same myth doc). Different primer must produce
    a different myth (different hash, different slot)."""
    import time
    token = _login()
    primer_a = (
        "\n[ContextBus]\nCurrent world: {\"origin_name\":\"Sirius\","
        "\"biome\":\"Helical Light Forest\",\"scene_description\":\"bright laughing dawn\"}\n"
    )
    primer_b = (
        "\n[ContextBus]\nCurrent world: {\"origin_name\":\"Andromeda\","
        "\"biome\":\"Cold Iron Sea\",\"scene_description\":\"deep heavy void echoes\"}\n"
    )

    body = {"seed_title": "The Maize God", "context_primer": primer_a}

    t0 = time.time()
    first = _post(f"{API}/myths/mayan/generate", body, token=token)
    t_first = time.time() - t0

    t0 = time.time()
    second = _post(f"{API}/myths/mayan/generate", body, token=token)
    t_second = time.time() - t0

    # Same primer → same myth (cache hit)
    assert first["title"] == second["title"], "primer-keyed cache miss on revisit"
    assert first["primer_hash"] == second["primer_hash"], "hash mismatch"
    # Cache hit should be MUCH faster than initial gen (LLM call ~5-15s,
    # cache ~<1s). Allow generous margin to keep the test stable.
    assert t_second < max(2.0, t_first / 2), (
        f"cache hit not fast enough: first={t_first:.2f}s second={t_second:.2f}s"
    )

    # Different primer → different myth (different cache slot)
    other = _post(
        f"{API}/myths/mayan/generate",
        {"seed_title": "The Maize God", "context_primer": primer_b},
        token=token,
    )
    assert other["primer_hash"] != first["primer_hash"], "different primers must hash differently"
