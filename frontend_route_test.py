#!/usr/bin/env python3
"""
Frontend Route Testing Script for ENLIGHTEN.MINT.CAFE
Tests all routes for errors, 404s, and dimensional rift (ErrorBoundary)
"""
import asyncio
from playwright.async_api import async_playwright

BASE_URL = "https://zero-scale-physics.preview.emergentagent.com"

ROUTES_TO_TEST = [
    "/apex-creator",
    "/creator-console",
    "/meditation",
    "/breathing",
    "/oracle",
    "/crystals",
    "/herbology",
    "/aromatherapy",
    "/elixirs",
    "/mudras",
    "/nourishment",
    "/reiki",
    "/acupressure",
    "/reflexology",
    "/yoga",
    "/mantras",
    "/light-therapy",
    "/affirmations",
    "/daily-ritual",
    "/mood",
    "/journal",
    "/soundscapes",
    "/zen-garden",
    "/forecasts",
    "/daily-briefing",
    "/coach",
    "/star-chart",
    "/numerology",
    "/dreams",
    "/mayan",
    "/cosmic-calendar",
    "/cardology",
    "/animal-totems",
    "/sanctuary",
    "/exercises",
    "/tantra",
    "/hooponopono",
    "/yantra",
    "/sacred-texts",
    "/codex",
    "/teachings",
    "/learn",
    "/blessings",
    "/bible",
    "/creation-stories",
    "/forgotten-languages",
    "/encyclopedia",
    "/live",
    "/terms",
    "/privacy",
    "/economy",
    "/membership",
    "/cosmic-store",
    "/community",
    "/trade-circle",
    "/akashic-records",
    "/sovereign-hub",
]

async def test_routes():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await context.new_page()
        
        page_errors = []
        console_errors = []
        
        def handle_pageerror(error):
            page_errors.append(str(error))
            
        def handle_console(msg):
            if msg.type == "error":
                console_errors.append(msg.text)
        
        page.on("pageerror", handle_pageerror)
        page.on("console", handle_console)
        
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
        print(f"After login URL: {page.url}")
        
        results = []
        
        for route in ROUTES_TO_TEST:
            print(f"\nTesting {route}...")
            page_errors.clear()
            console_errors.clear()
            
            try:
                response = await page.goto(f"{BASE_URL}{route}", wait_until="domcontentloaded", timeout=15000)
                await page.wait_for_timeout(2000)
                
                status = response.status if response else 0
                final_url = page.url
                
                # Check for error boundary
                error_boundary = await page.query_selector('[data-testid="cosmic-error-boundary"]')
                has_error_boundary = error_boundary is not None
                
                # Check for 404
                not_found = await page.query_selector('text="Page Not Found"')
                is_404 = not_found is not None
                
                result = {
                    "route": route,
                    "status": status,
                    "final_url": final_url,
                    "error_boundary": has_error_boundary,
                    "is_404": is_404,
                    "page_errors": page_errors.copy(),
                    "console_errors": console_errors.copy()[:3]
                }
                results.append(result)
                
                if has_error_boundary:
                    print(f"  ERROR BOUNDARY (Dimensional Rift)!")
                    await page.screenshot(path=f"/app/.screenshots/error{route.replace('/', '_')}.png")
                elif is_404:
                    print(f"  404 NOT FOUND")
                elif page_errors:
                    print(f"  Page errors: {len(page_errors)}")
                else:
                    print(f"  OK (status: {status})")
                    
            except Exception as e:
                print(f"  Exception: {str(e)[:100]}")
                results.append({
                    "route": route,
                    "status": "Exception",
                    "error": str(e)[:200]
                })
        
        await browser.close()
        
        # Print summary
        print("\n\n" + "="*60)
        print("ROUTE TEST SUMMARY")
        print("="*60)
        
        working = []
        errors = []
        not_found = []
        
        for r in results:
            if r.get("error_boundary"):
                errors.append(r)
            elif r.get("is_404"):
                not_found.append(r)
            elif r.get("status") == "Exception":
                errors.append(r)
            else:
                working.append(r)
        
        print(f"\nWorking routes: {len(working)}")
        print(f"Error boundary routes: {len([r for r in errors if r.get('error_boundary')])}")
        print(f"404 routes: {len(not_found)}")
        print(f"Exception routes: {len([r for r in errors if r.get('status') == 'Exception'])}")
        
        if errors:
            print("\n--- ROUTES WITH ERRORS ---")
            for r in errors:
                print(f"  {r['route']}: {r.get('error', 'Error boundary')}")
                if r.get("page_errors"):
                    for e in r["page_errors"][:2]:
                        print(f"    Page error: {e[:100]}")
        
        if not_found:
            print("\n--- 404 ROUTES ---")
            for r in not_found:
                print(f"  {r['route']}")
        
        return results

if __name__ == "__main__":
    asyncio.run(test_routes())
