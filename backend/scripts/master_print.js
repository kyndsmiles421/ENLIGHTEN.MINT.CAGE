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

// ── 4. Optional email delivery via unified mailer (Resend → SendGrid) ─
function emailBundle(toEmail) {
  const env = { ...process.env, BUNDLE_TO: toEmail };
  // Load backend/.env so RESEND_API_KEY / SENDGRID_API_KEY propagate
  try {
    const be = fs.readFileSync(path.join(ROOT, "backend/.env"), "utf8");
    be.split("\n").forEach(l => {
      const m = l.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m) env[m[1]] = m[2];
    });
  } catch {}
  log(`▶ emailing bundle → ${toEmail} (Resend preferred, SendGrid fallback)`);
  const r = spawnSync("python3", [path.join(SCRIPTS, "send_bundle.py")],
                      { stdio: "inherit", env });
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
