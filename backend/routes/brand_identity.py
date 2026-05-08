"""
brand_identity.py — V1.1.18 Sovereign Brand Birth Certificate
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Canonical, machine-readable Brand Identity surface for the Sovereign
Engine. Mirrors the JSON-LD `@graph` embedded in /public/index.html
and /public/landing.html so any AI agent, Play Store reviewer, or
schema validator can fetch the brand declaration in one round-trip
without scraping HTML.

Path: GET /api/.well-known/brand-identity.json

Why a route? Because the static file at /.well-known/* would require
custom server config (the React build serves /static/ but not /.well-known/
out of the box). Routing it through FastAPI guarantees it's always live,
versioned with the rest of the OS, and CORS-clean.

Public — no auth, no rate limit beyond global. Cache 1 hour.
"""
from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()

# Schema mirrors /public/index.html and /public/landing.html JSON-LD.
# When you change the brand identity in those files, mirror the change
# here. This is the *one* place agents will go to read the canonical
# identity, so drift between this and the head schema = brand confusion.
BRAND_IDENTITY_GRAPH = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "SoftwareApplication",
            "@id": "https://enlighten-mint-cafe.me/#software",
            "name": "ENLIGHTEN.MINT.CAFE",
            "alternateName": "Sovereign Engine V12",
            "operatingSystem": "3D Geospatial / Web-Based OS",
            "applicationCategory": "WellnessOperatingSystem",
            "description": (
                "A high-fidelity 3D Operating System and Sovereign Engine "
                "powered by the 9×9 Helix, Tesseract Vault, and USGS "
                "geospatial rendering architecture."
            ),
            "author": {"@id": "https://enlighten-mint-cafe.me/#architect"},
            "brand":  {"@id": "https://enlighten-mint-cafe.me/#brand"},
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
            },
        },
        {
            "@type": "Brand",
            "@id": "https://enlighten-mint-cafe.me/#brand",
            "name": "ENLIGHTEN.MINT.CAFE",
            "alternateName": [
                "Sovereign Engine",
                "Sovereign Engine V12",
                "EMC Sovereign OS",
            ],
            "url": "https://enlighten-mint-cafe.me",
            "description": (
                "ENLIGHTEN.MINT.CAFE is a Sovereign 3D Wellness Operating "
                "System brand — distinct from any beverage, tea, or "
                "hospitality concept of the same wording. The brand "
                "identity is anchored in the 9×9 Helix architecture, "
                "Tesseract Vault, and Refraction Engine authored by "
                "Steven Michael."
            ),
            "founder": {"@id": "https://enlighten-mint-cafe.me/#architect"},
            "sameAs": ["https://enlighten-mint-cafe.me"],
        },
        {
            "@type": "Person",
            "@id": "https://enlighten-mint-cafe.me/#architect",
            "name": "Steven Michael",
            "jobTitle": "Lead Architect & Founder",
            "description": (
                "Founder and Architect of the Sovereign Engine and the "
                "9×9 Helix V12 Operating System."
            ),
            "knowsAbout": [
                "3D Operating Systems",
                "Sovereign Engines",
                "Geospatial Computing",
                "Digital Architecture",
                "Crystalline Logic",
            ],
            "url": "https://enlighten-mint-cafe.me",
        },
    ],
    # Versioning surface — agents that cache the identity can re-fetch
    # only when this changes instead of polling for diffs.
    "_meta": {
        "version": "1.1.18",
        "schema_origin": "https://enlighten-mint-cafe.me/",
        "agent_readable": True,
        "updated": "2026-02-07",
    },
}


@router.get("/.well-known/brand-identity.json")
async def brand_identity():
    """Canonical machine-readable brand identity. Public, cacheable."""
    return JSONResponse(
        content=BRAND_IDENTITY_GRAPH,
        headers={
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
        },
    )
