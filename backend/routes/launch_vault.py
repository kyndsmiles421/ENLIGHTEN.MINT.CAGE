"""
V68.39 — Launch Vault download endpoint.

Serves the signed .aab / .apk / Play Store listing assets over HTTPS so the
user can tap the URL directly from their phone's browser and have the file
land in their Downloads folder. No auth — these are public launch artifacts
the user is about to ship to the Play Store anyway, but we whitelist the
filenames so this isn't a general directory-traversal hole.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path

router = APIRouter(prefix="/downloads", tags=["launch-vault"])

VAULT = Path("/app/build_artifacts")

# Whitelist — only these filenames are downloadable. Prevents abuse.
WHITELIST = {
    # Android binaries — latest v1.0.3 (includes Reflexology)
    "enlighten-v1.0.3.apk":                ("application/vnd.android.package-archive", "enlighten-v1.0.3.apk"),
    "enlighten-mint-cafe-v1.0.3.aab":      ("application/octet-stream",                 "enlighten-mint-cafe-v1.0.3.aab"),
    # Previous version kept for download
    "enlighten-v1.0.2.apk":                ("application/vnd.android.package-archive", "enlighten-v1.0.2.apk"),
    "enlighten-mint-cafe-v1.0.2.aab":      ("application/octet-stream",                 "enlighten-mint-cafe-v1.0.2.aab"),
    "enlighten-mint-cafe-UPLOAD-KEY.keystore": ("application/octet-stream",             "enlighten-mint-cafe-UPLOAD-KEY.keystore"),
    # Play Store listing assets
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
    # Docs
    "BUILD_INFO.md":                          ("text/markdown", "BUILD_INFO.md"),
    "INSTALL.md":                             ("text/markdown", "INSTALL.md"),
    "TEST_REPORT.md":                         ("text/markdown", "TEST_REPORT.md"),
    "KEYSTORE_FINGERPRINTS.txt":              ("text/plain", "KEYSTORE_FINGERPRINTS.txt"),
}


@router.get("/{filename:path}")
async def download_vault_file(filename: str):
    """Serve a whitelisted launch artifact with Content-Disposition: attachment."""
    if filename not in WHITELIST:
        raise HTTPException(status_code=404, detail="Not in launch vault")
    media_type, download_name = WHITELIST[filename]
    file_path = VAULT / filename
    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not built yet")
    return FileResponse(
        path=str(file_path),
        media_type=media_type,
        filename=download_name,
    )


@router.get("")
async def list_vault():
    """Show what's available in the launch vault."""
    items = []
    for key, (mime, dn) in WHITELIST.items():
        p = VAULT / key
        items.append({
            "filename": key,
            "download_name": dn,
            "mime": mime,
            "available": p.is_file(),
            "size_bytes": p.stat().st_size if p.is_file() else 0,
            "url": f"/api/downloads/{key}",
        })
    return {"vault": items, "total": sum(1 for i in items if i["available"])}
