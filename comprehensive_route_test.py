#!/usr/bin/env python3
"""
Comprehensive Frontend Route Testing for ENLIGHTEN.MINT.CAFE
Tests ALL routes from App.js for errors, 404s, and dimensional rift
"""
import asyncio
from playwright.async_api import async_playwright

BASE_URL = "https://zero-scale-physics.preview.emergentagent.com"

# All routes from App.js
ALL_ROUTES = [
    "/landing",
    "/intro",
    "/auth",
    "/breathing",
    "/meditation",
    "/affirmations",
    "/mood",
    "/journal",
    "/soundscapes",
    "/exercises",
    "/nourishment",
    "/frequencies",
    "/rituals",
    "/community",
    "/challenges",
    "/profile",
    "/oracle",
    "/mudras",
    "/yantra",
    "/tantra",
    "/videos",
    "/analytics",
    "/trade-circle",
    "/classes",
    "/create",
    "/light-therapy",
    "/zen-garden",
    "/mantras",
    "/hooponopono",
    "/journey",
    "/learn",
    "/games",
    "/friends",
    "/cardology",
    "/mayan",
    "/avatar",
    "/yoga",
    "/teachings",
    "/wisdom-journal",
    "/numerology",
    "/animal-totems",
    "/dreams",
    "/green-journal",
    "/aromatherapy",
    "/herbology",
    "/elixirs",
    "/meal-planning",
    "/acupressure",
    "/reflexology",
    "/reiki",
    "/discover",
    "/daily-ritual",
    "/cosmic-calendar",
    "/certifications",
    "/wellness-reports",
    "/meditation-history",
    "/media-library",
    "/coach",
    "/daily-briefing",
    "/star-chart",
    "/vr",
    "/forecasts",
    "/cosmic-profile",
    "/tutorial",
    "/creation-stories",
    "/sacred-texts",
    "/pricing",
    "/settings",
    "/admin-setup",
    "/crystals",
    "/entanglement",
    "/music-lounge",
    "/blessings",
    "/akashic-records",
    "/encyclopedia",
    "/reading-list",
    "/growth-timeline",
    "/soul-reports",
    "/help-center",
    "/feedback",
    "/cosmic-mixer",
    "/starseed",
    "/creator",
    "/live",
    "/sovereign-circle",
    "/dance-music",
    "/my-creations",
    "/bible",
    "/starseed-adventure",
    "/starseed-realm",
    "/starseed-worlds",
    "/spiritual-avatar",
    "/avatar-gallery",
    "/cosmic-ledger",
    "/multiverse-realms",
    "/rpg",
    "/cosmic-insights",
    "/multiverse-map",
    "/nexus",
    "/dream-realms",
    "/rock-hounding",
    "/forgotten-languages",
    "/cosmic-store",
    "/evolution-lab",
    "/refinement-lab",
    "/hotspots",
    "/planetary-depths",
    "/quantum-field",
    "/dimensional-space",
    "/master-view",
    "/collective-shadow-map",
    "/fractal-engine",
    "/crystalline-engine",
    "/console",
    "/refractor",
    "/metatron",
    "/mastery-avenues",
    "/sovereign",
    "/cosmic-map",
    "/admin/power-spot",
    "/theory",
    "/workshop",
    "/hub",
    "/orbital-hub",
    "/sovereign-hub",
    "/ether-hub",
    "/lattice-view",
    "/ar-portal",
    "/liquidity-trader",
    "/master-engine",
    "/resource-alchemy",
    "/gravity-well",
    "/cryptic-quest",
    "/realms",
    "/crystal-skins",
    "/trade-passport",
    "/creator-console",
    "/quantum-loom",
    "/membership",
    "/sanctuary",
    "/silent-sanctuary",
    "/void",
    "/mint",
    "/minting-ceremony",
    "/vr/celestial-dome",
    "/observatory",
    "/archives",
    "/suanpan",
    "/botany",
    "/codex",
    "/botany-orbital",
    "/hexagram-journal",
    "/trade-orbital",
    "/codex-orbital",
    "/mastery-path",
    "/sovereign-admin",
    "/academy",
    "/terms",
    "/privacy",
    "/delete-account",
    "/economy",
    "/sovereigns",
    "/recursive-dive",
    "/seed-gallery",
    "/tesseract",
    "/sovereignty",
    "/enlightenment-os",
    "/lab",
    "/physics-lab",
    "/sovereign-canvas",
    "/replant",
    "/fabricator",
    "/smartdock",
    "/apex-creator",  # This was reported as 404
]

async def test_all_routes():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await context.new_page()
        
        page_errors = []
        
        def handle_pageerror(error):
            page_errors.append(str(error))
        
        page.on("pageerror", handle_pageerror)
        
        # Set localStorage to skip disclaimer
        await page.goto(f"{BASE_URL}/auth")
        await page.evaluate("""() => {
            localStorage.setItem('disclaimer_acknowledged', 'true');
            localStorage.setItem('disclaimer_version', '1');
        }""")
        
        # Login
        print("Logging in...")
        await page.wait_for_timeout(1000)
        
        email_input = await page.query_selector('input[type="email"]')
        if email_input:
            await email_input.fill("kyndsmiles@gmail.com")
        
        password_input = await page.query_selector('input[type="password"]')
        if password_input:
            await password_input.fill("Sovereign2026!")
        
        submit_btn = await page.query_selector('button:has-text("Begin Journey")')
        if submit_btn:
            await submit_btn.click()
        
        await page.wait_for_timeout(3000)
        print(f"After login URL: {page.url}\n")
        
        results = {
            "working": [],
            "error_boundary": [],
            "not_found": [],
            "page_errors": [],
            "exceptions": []
        }
        
        for route in ALL_ROUTES:
            page_errors.clear()
            
            try:
                response = await page.goto(f"{BASE_URL}{route}", wait_until="domcontentloaded", timeout=10000)
                await page.wait_for_timeout(1500)
                
                status = response.status if response else 0
                
                # Check for error boundary
                error_boundary = await page.query_selector('[data-testid="cosmic-error-boundary"]')
                has_error_boundary = error_boundary is not None
                
                # Check for 404
                not_found = await page.query_selector('text="Page Not Found"')
                is_404 = not_found is not None
                
                if has_error_boundary:
                    results["error_boundary"].append({"route": route, "errors": page_errors.copy()})
                    print(f"ERROR BOUNDARY: {route}")
                    await page.screenshot(path=f"/app/.screenshots/error{route.replace('/', '_')}.png")
                elif is_404:
                    results["not_found"].append(route)
                    print(f"404: {route}")
                elif page_errors:
                    results["page_errors"].append({"route": route, "errors": page_errors.copy()[:2]})
                else:
                    results["working"].append(route)
                    
            except Exception as e:
                results["exceptions"].append({"route": route, "error": str(e)[:100]})
                print(f"EXCEPTION: {route} - {str(e)[:50]}")
        
        await browser.close()
        
        # Print summary
        print("\n" + "="*60)
        print("COMPREHENSIVE ROUTE TEST SUMMARY")
        print("="*60)
        print(f"\nWorking routes: {len(results['working'])}")
        print(f"Error boundary routes: {len(results['error_boundary'])}")
        print(f"404 routes: {len(results['not_found'])}")
        print(f"Routes with page errors: {len(results['page_errors'])}")
        print(f"Exception routes: {len(results['exceptions'])}")
        
        if results["error_boundary"]:
            print("\n--- ROUTES WITH ERROR BOUNDARY (DIMENSIONAL RIFT) ---")
            for r in results["error_boundary"]:
                print(f"  {r['route']}")
                for e in r.get("errors", [])[:2]:
                    print(f"    Error: {e[:150]}")
        
        if results["not_found"]:
            print("\n--- 404 ROUTES ---")
            for r in results["not_found"]:
                print(f"  {r}")
        
        if results["exceptions"]:
            print("\n--- EXCEPTION ROUTES ---")
            for r in results["exceptions"]:
                print(f"  {r['route']}: {r['error']}")
        
        return results

if __name__ == "__main__":
    asyncio.run(test_all_routes())
