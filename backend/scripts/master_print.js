#!/usr/bin/env node
/**
 * ════════════════════════════════════════════════════════════════════════
 *   ENLIGHTEN.MINT.CAFE — MASTER COVER / STORE-ASSET PRINT SCRIPT
 *   by INFINITY SOVEREIGN
 * ────────────────────────────────────────────────────────────────────────
 *   One command regenerates every Play Store + social asset:
 *
 *     node /app/backend/scripts/master_print.js
 *
 *   Output → /app/frontend/public/store-assets/
 *     • feature-graphic-1024x500.png   (Play Store hero banner)
 *     • app-icon-512.png               (Play Store hi-res icon)
 *     • app-icon-1024.png              (master icon; oversize)
 *     • og-cover-1200x630.png          (WhatsApp / X / LinkedIn)
 *     • playstore-1-hub.png            (phone screenshot 1080×1920)
 *     • playstore-2-observatory.png    (phone screenshot 1080×1920)
 *     • playstore-3-lattice.png        (phone screenshot 1080×1920)
 *
 *   Pipeline
 *     1. Playwright captures live routes from REACT_APP_BACKEND_URL
 *     2. PIL composes cosmic-nebula frames with gold overlays
 *     3. (optional) email the bundle via SendGrid   --mail=you@x.com
 *
 *   Environment:
 *     • Requires:   python3 + Pillow + numpy + playwright(python) preinstalled
 *     • Optional:   SENDGRID_API_KEY in backend/.env (for --mail)
 *
 *   Safe to re-run any time.  Idempotent.  Zero external services.
 * ════════════════════════════════════════════════════════════════════════
 */
const { execSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT       = "/app";
const OUT        = path.join(ROOT, "frontend/public/store-assets");
const CAPDIR     = path.join(OUT, "_captures");
const SCRIPTS    = path.join(ROOT, "backend/scripts");
const ENV_FILE   = path.join(ROOT, "frontend/.env");

function log(ms) { console.log(`\x1b[33m[master_print]\x1b[0m ${ms}`); }
function die(m)  { console.error(`\x1b[31m[master_print]\x1b[0m ${m}`); process.exit(1); }

function getBackendUrl() {
  if (!fs.existsSync(ENV_FILE)) die(`missing ${ENV_FILE}`);
  const env = fs.readFileSync(ENV_FILE, "utf8");
  const m = env.match(/REACT_APP_BACKEND_URL\s*=\s*(\S+)/);
  if (!m) die("REACT_APP_BACKEND_URL not found in frontend/.env");
  return m[1].trim();
}

function runPython(scriptPath) {
  log(`▶ python3 ${path.basename(scriptPath)}`);
  const r = spawnSync("python3", [scriptPath], { stdio: "inherit" });
  if (r.status !== 0) die(`failed: ${scriptPath}`);
}

// ── 1. Capture live screenshots via inline Python + Playwright ─────────
function captureLiveScreens(backendUrl) {
  log(`▶ capturing live routes from ${backendUrl}`);
  fs.mkdirSync(CAPDIR, { recursive: true });

  const pyCapture = `
import asyncio, os
from playwright.async_api import async_playwright
BASE = "${backendUrl}"
SAVE = "${CAPDIR}"
ROUTES = [("/", "cap_hub.png"),
          ("/hub", "cap_hub2.png"),
          ("/vr/celestial-dome", "cap_dome.png")]

async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        ctx = await browser.new_context(viewport={"width":1080,"height":1920}, device_scale_factor=1)
        page = await ctx.new_page()
        for route, fname in ROUTES:
            try:
                await page.goto(BASE + route, wait_until="networkidle", timeout=25000)
                await page.wait_for_timeout(2000)
                try:
                    sk = await page.query_selector('text=Skip')
                    if sk: await sk.click(); await page.wait_for_timeout(600)
                except: pass
                out = os.path.join(SAVE, fname)
                await page.screenshot(path=out, type="png", full_page=False)
                print(" ✓", fname)
            except Exception as e:
                print(" ✗", fname, e)
        await browser.close()

asyncio.run(main())
`;
  const tmpScript = "/tmp/_mp_capture.py";
  fs.writeFileSync(tmpScript, pyCapture);
  const r = spawnSync("python3", [tmpScript], { stdio: "inherit" });
  if (r.status !== 0) log(" ⚠ capture had errors — will fall back to existing files if present");
}

// ── 2. Generate the 4 static covers (nebula + emblem + title) ──────────
function buildCovers() { runPython(path.join(SCRIPTS, "build_store_covers.py")); }

// ── 3. Generate the 3 Play Store phone frames ──────────────────────────
function buildPlayStoreScreens() { runPython(path.join(SCRIPTS, "build_playstore_screens.py")); }

// ── 4. Optional email delivery via SendGrid ───────────────────────────
function emailBundle(toEmail) {
  const py = `
import os, base64, mimetypes, glob, sys
from datetime import datetime, timezone
OUT = "${OUT}"
TO  = "${toEmail}"
api = os.environ.get("SENDGRID_API_KEY")
frm = os.environ.get("SENDGRID_FROM_EMAIL", "kyndsmiles@gmail.com")
if not api:
    print("SENDGRID_API_KEY missing — skipping email"); sys.exit(0)

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition

files = [
  "feature-graphic-1024x500.png", "app-icon-512.png", "app-icon-1024.png",
  "og-cover-1200x630.png",
  "playstore-1-hub.png", "playstore-2-observatory.png", "playstore-3-lattice.png",
]
attachments = []
for f in files:
    p = os.path.join(OUT, f)
    if not os.path.exists(p): continue
    with open(p, "rb") as fh:
        data = base64.b64encode(fh.read()).decode()
    a = Attachment()
    a.file_content = FileContent(data)
    a.file_name    = FileName(f)
    a.file_type    = FileType(mimetypes.guess_type(f)[0] or "application/octet-stream")
    a.disposition  = Disposition("attachment")
    attachments.append(a)

now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
subject = "ENLIGHTEN.MINT.CAFE — Play Store Cover Bundle"
html = f'''
<div style="font-family: 'Playfair Display', Georgia, serif; background:#0a0514; color:#f5f0e6; padding:32px; border-radius:12px; max-width:680px; margin:auto">
  <h1 style="color:#F0C470; letter-spacing:0.5px; margin-bottom:4px">ENLIGHTEN.MINT.CAFE</h1>
  <p style="color:#FFB450; margin:0 0 24px 0; font-size:14px; letter-spacing:1px">THE SOVEREIGN UNIFIED ENGINE · by INFINITY SOVEREIGN</p>
  <hr style="border:none; border-top:1px solid #F0C47055; margin:20px 0"/>
  <p>Attached is the complete Google Play Store cover bundle, freshly regenerated {now}.</p>
  <ul style="line-height:1.9">
    <li><b>feature-graphic-1024x500.png</b> — Play Store hero banner</li>
    <li><b>app-icon-512.png / app-icon-1024.png</b> — Store icons</li>
    <li><b>og-cover-1200x630.png</b> — WhatsApp · X · LinkedIn preview</li>
    <li><b>playstore-1-hub.png</b> — 176+ Sovereign Nodules frame</li>
    <li><b>playstore-2-observatory.png</b> — Meditative Immersion frame</li>
    <li><b>playstore-3-lattice.png</b> — 9×9 Crystalline Lattice frame</li>
  </ul>
  <p style="margin-top:20px">Regenerate any time with:<br/>
  <code style="background:#1a0f2a; color:#F0C470; padding:6px 12px; border-radius:6px">node /app/backend/scripts/master_print.js</code></p>
  <hr style="border:none; border-top:1px solid #F0C47055; margin:24px 0"/>
  <p style="font-size:12px; color:#9a8a70">Sovereign PWA · 176+ Nodules · 9×9 Crystalline Lattice</p>
</div>'''

msg = Mail(from_email=frm, to_emails=TO, subject=subject, html_content=html)
msg.attachment = attachments
try:
    resp = SendGridAPIClient(api).send(msg)
    print(f"email → {TO}  status={resp.status_code}  attached={len(attachments)}")
except Exception as e:
    print("email FAILED:", e); sys.exit(1)
`;
  const tmp = "/tmp/_mp_mail.py";
  fs.writeFileSync(tmp, py);
  // Load SENDGRID_* from backend/.env manually so the subprocess has them
  const be = fs.readFileSync(path.join(ROOT, "backend/.env"), "utf8");
  const env = { ...process.env };
  be.split("\n").forEach(l => {
    const m = l.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2];
  });
  const r = spawnSync("python3", [tmp], { stdio: "inherit", env });
  if (r.status !== 0) die("email step failed");
}

// ── Entry point ───────────────────────────────────────────────────────
function main() {
  const args = process.argv.slice(2);
  const mailFlag = args.find(a => a.startsWith("--mail="));
  const mailTo = mailFlag ? mailFlag.split("=")[1] : null;
  const skipCap = args.includes("--skip-capture");

  const backendUrl = getBackendUrl();
  log(`backend: ${backendUrl}`);
  log(`output : ${OUT}`);

  fs.mkdirSync(OUT, { recursive: true });

  if (!skipCap) captureLiveScreens(backendUrl);
  buildCovers();
  buildPlayStoreScreens();

  // keep _captures directory so subsequent --skip-capture runs can reuse them

  // report
  log("generated:");
  fs.readdirSync(OUT).filter(f => /\.png$/.test(f)).sort().forEach(f => {
    const p = path.join(OUT, f);
    const kb = (fs.statSync(p).size / 1024).toFixed(1);
    console.log(`   ${f.padEnd(36)} ${kb} KB`);
  });

  if (mailTo) emailBundle(mailTo);

  log("✓ done.");
}

main();
