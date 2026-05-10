"""
V1.2.6 — Launch Vault download endpoint (LOCKED).

Serves Play Store listing assets (image renders, listing copy) over HTTPS
for convenience. Binary release artifacts (.aab, .apk, keystore) and
signing fingerprints are now ADMIN-ONLY: every download requires the
caller to be authenticated as `admin` or `creator` role.

Why locked: V1.2.6 incident — public /launch.html and prior whitelist
exposed signed binaries and (briefly) keystore credentials to the open
web. Tightening to admin-only auth + redacted whitelist closes that gap.
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from pathlib import Path
from deps import db, get_current_user_optional

router = APIRouter(prefix="/downloads", tags=["launch-vault"])


async def _is_privileged(user: dict) -> bool:
    """True if the JWT-backed user has admin or creator role in DB."""
    if not user:
        return False
    doc = await db.users.find_one({"id": user.get("id")}, {"_id": 0, "role": 1, "is_admin": 1, "is_owner": 1, "tier": 1})
    if not doc:
        return False
    role = (doc.get("role") or "").lower()
    tier = (doc.get("tier") or "").lower()
    return (
        role in ("admin", "creator", "owner", "architect")
        or tier in ("creator", "admin", "owner")
        or bool(doc.get("is_admin") or doc.get("is_owner"))
    )

VAULT = Path("/app/build_artifacts")

# Public whitelist — Play Store LISTING assets only (no binaries, no signing material).
# These are screenshots and graphics that will become public on the Play Store anyway.
PUBLIC_WHITELIST = {
    "playstore/feature_graphic_1024x500.png": ("image/png", "feature_graphic_1024x500.png"),
    "playstore/phone_00_landing.jpeg":        ("image/jpeg", "phone_00_landing.jpg"),
    "playstore/phone_01_hub.jpeg":            ("image/jpeg", "phone_01_hub.jpg"),
    "playstore/phone_02_orbital.jpeg":        ("image/jpeg", "phone_02_orbital.jpg"),
    "playstore/phone_03_mixer.jpeg":          ("image/jpeg", "phone_03_mixer.jpg"),
    "playstore/phone_04_rock.jpeg":           ("image/jpeg", "phone_04_rock.jpg"),
    "playstore/phone_05_reflexology.jpeg":    ("image/jpeg", "phone_05_reflexology.jpg"),
    "playstore/tablet7_hub.jpeg":             ("image/jpeg", "tablet7_hub.jpg"),
    "playstore/tablet7_mixer.jpeg":           ("image/jpeg", "tablet7_mixer.jpg"),
    "playstore/tablet10_hub.jpeg":            ("image/jpeg", "tablet10_hub.jpg"),
    "playstore/tablet10_mixer.jpeg":          ("image/jpeg", "tablet10_mixer.jpg"),
    "playstore/LISTING_COPY.md":              ("text/markdown", "LISTING_COPY.md"),
}

# Admin-only whitelist — signed binaries + integrity hashes + redacted docs.
# Returned only when the caller is authenticated as admin/creator.
ADMIN_WHITELIST = {
    "enlighten-v1.0.4.apk":                ("application/vnd.android.package-archive", "enlighten-v1.0.4.apk"),
    "enlighten-mint-cafe-v1.0.4.aab":      ("application/octet-stream",                 "enlighten-mint-cafe-v1.0.4.aab"),
    "enlighten-v1.0.3.apk":                ("application/vnd.android.package-archive", "enlighten-v1.0.3.apk"),
    "enlighten-mint-cafe-v1.0.3.aab":      ("application/octet-stream",                 "enlighten-mint-cafe-v1.0.3.aab"),
    "enlighten-v1.0.2.apk":                ("application/vnd.android.package-archive", "enlighten-v1.0.2.apk"),
    "enlighten-mint-cafe-v1.0.2.aab":      ("application/octet-stream",                 "enlighten-mint-cafe-v1.0.2.aab"),
    "BUILD_INFO.md":                          ("text/markdown", "BUILD_INFO.md"),
    "INSTALL.md":                             ("text/markdown", "INSTALL.md"),
    "TEST_REPORT.md":                         ("text/markdown", "TEST_REPORT.md"),
    "KEYSTORE_FINGERPRINTS.txt":              ("text/plain", "KEYSTORE_FINGERPRINTS.txt"),
    "aab-sha256.txt":                         ("text/plain", "aab-sha256.txt"),
}


@router.get("/{filename:path}")
async def download_vault_file(
    filename: str,
    user: dict = Depends(get_current_user_optional),
):
    """
    Serve a whitelisted launch artifact.
    
    Public Play Store listing assets are served without auth.
    Binaries / signing-fingerprint files require admin or creator role.
    Anything not whitelisted returns 404.
    """
    # Public listing assets — no auth required.
    if filename in PUBLIC_WHITELIST:
        media_type, download_name = PUBLIC_WHITELIST[filename]
        file_path = VAULT / filename
        if not file_path.is_file():
            raise HTTPException(status_code=404, detail="File missing on disk")
        return FileResponse(
            file_path, media_type=media_type, filename=download_name,
            headers={"Cache-Control": "public, max-age=3600"},
        )
    
    # Admin-only artifacts — require authenticated admin/creator session.
    if filename in ADMIN_WHITELIST:
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required for build artifacts")
        if not await _is_privileged(user):
            raise HTTPException(status_code=403, detail="Admin or creator role required")
        media_type, download_name = ADMIN_WHITELIST[filename]
        file_path = VAULT / filename
        if not file_path.is_file():
            raise HTTPException(status_code=404, detail="File missing on disk")
        return FileResponse(
            file_path, media_type=media_type, filename=download_name,
            headers={"Cache-Control": "no-store, no-cache, must-revalidate"},
        )
    
    raise HTTPException(status_code=404, detail="Not in launch vault")


@router.get("")
async def list_vault(user: dict = Depends(get_current_user_optional)):
    """List Play Store listing assets (public). Binaries appear only for admins."""
    items = []
    for key, (mime, dn) in PUBLIC_WHITELIST.items():
        p = VAULT / key
        items.append({
            "filename": key,
            "download_name": dn,
            "mime": mime,
            "available": p.is_file(),
            "size_bytes": p.stat().st_size if p.is_file() else 0,
            "url": f"/api/downloads/{key}",
            "tier": "public",
        })
    if user and await _is_privileged(user):
        for key, (mime, dn) in ADMIN_WHITELIST.items():
            p = VAULT / key
            items.append({
                "filename": key,
                "download_name": dn,
                "mime": mime,
                "available": p.is_file(),
                "size_bytes": p.stat().st_size if p.is_file() else 0,
                "url": f"/api/downloads/{key}",
                "tier": "admin",
            })
    return {"vault": items, "total": sum(1 for i in items if i["available"])}
