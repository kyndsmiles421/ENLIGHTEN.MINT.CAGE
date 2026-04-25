#!/usr/bin/env python3
import asyncio
from playwright.async_api import async_playwright

BASE_URL = "https://zero-scale-physics.preview.emergentagent.com"

# Critical routes to test
ROUTES = [
    "/apex-creator",
    "/creator-console",
    "/sovereign-hub",
    "/meditation",
    "/breathing",
    "/oracle",
    "/crystals",
    "/herbology",
    "/membership",
    "/economy",
    "/terms",
    "/privacy",
    "/forecasts",
    "/daily-briefing",
    "/coach",
    "/yoga",
    "/mantras",
    "/affirmations",
    "/daily-ritual",
    "/mood",
    "/akashic-records",
    "/star-chart",
    "/numerology",
    "/dreams",
    "/mayan",
    "/cosmic-calendar",
    "/cardology",
    "/animal-totems",
    "/sanctuary",
    "/zen-garden",
    "/soundscapes",
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
]

async def test_routes():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await context.new_page()
        
        page_errors = []
        
        def handle_pageerror(error):
            page_errors.append(str(error))
        
        page.on("pageerror", handle_pageerror)
        
        # Login
        await page.goto(f"{BASE_URL}/auth")
        await page.evaluate("""() => {
            localStorage.setItem('disclaimer_acknowledged', 'true');
            localStorage.setItem('disclaimer_version', '1');
        }""")
        await page.wait_for_timeout(1000)
        
        email = await page.query_selector('input[type="email"]')
        if email: await email.fill("kyndsmiles@gmail.com")
        
        pwd = await page.query_selector('input[type="password"]')
        if pwd: await pwd.fill("Sovereign2026!")
        
        btn = await page.query_selector('button:has-text("Begin Journey")')
        if btn: await btn.click()
        
        await page.wait_for_timeout(3000)
        print(f"Logged in: {page.url}\n")
        
        error_routes = []
        not_found_routes = []
        working_routes = []
        
        for route in ROUTES:
            page_errors.clear()
            try:
                await page.goto(f"{BASE_URL}{route}", wait_until="domcontentloaded", timeout=8000)
                await page.wait_for_timeout(1000)
                
                error_boundary = await page.query_selector('[data-testid="cosmic-error-boundary"]')
                not_found = await page.query_selector('text="Page Not Found"')
                
                if error_boundary:
                    error_routes.append(route)
                    print(f"ERROR: {route}")
                elif not_found:
                    not_found_routes.append(route)
                    print(f"404: {route}")
                else:
                    working_routes.append(route)
            except Exception as e:
                print(f"EXCEPTION: {route} - {str(e)[:50]}")
        
        await browser.close()
        
        print(f"\n\nSUMMARY:")
        print(f"Working: {len(working_routes)}")
        print(f"Error boundary: {len(error_routes)}")
        print(f"404: {len(not_found_routes)}")
        
        if error_routes:
            print(f"\nError routes: {error_routes}")
        if not_found_routes:
            print(f"\n404 routes: {not_found_routes}")

if __name__ == "__main__":
    asyncio.run(test_routes())
