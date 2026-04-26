#!/usr/bin/env python3
"""
EXHAUSTIVE BUTTON SCAN for ENLIGHTEN.MINT.CAFE
Scans all routes for dead buttons that do nothing when clicked.
"""
import asyncio
import json
import os
from playwright.async_api import async_playwright

BASE_URL = "https://zero-scale-physics.preview.emergentagent.com"
SCREENSHOT_DIR = "/app/.screenshots"

# Routes to scan
ROUTES_TO_SCAN = [
    "/sovereign-hub", "/breathing", "/meditation", "/journal", "/coach",
    "/reflexology", "/herbology", "/aromatherapy", "/crystals", "/oracle",
    "/sacred-texts", "/encyclopedia", "/numerology", "/yoga", "/mudras",
    "/mantras", "/elixirs", "/acupressure", "/dreams", "/soundscapes",
    "/cosmic-calendar", "/forecasts", "/trade-circle", "/sovereigns",
    "/membership", "/settings", "/profile", "/realms", "/rpg",
    "/starseed-adventure", "/multiverse-realms", "/games", "/observatory",
    "/zen-garden", "/reiki", "/mood", "/frequencies", "/chakras",
    "/astrology", "/tarot", "/lifepath", "/horoscope"
]

# Results
dead_buttons = []
stub_buttons = []
wired_count = 0
total_clicked = 0

async def login(page):
    """Login to the app"""
    await page.goto(f"{BASE_URL}/auth", wait_until="networkidle", timeout=30000)
    await page.wait_for_timeout(2000)
    
    email = await page.query_selector('input[type="email"]')
    if email:
        await email.fill("kyndsmiles@gmail.com")
    
    password = await page.query_selector('input[type="password"]')
    if password:
        await password.fill("Sovereign2026!")
    
    await page.wait_for_timeout(500)
    
    submit = await page.query_selector('button[type="submit"]')
    if submit:
        await submit.click()
    
    await page.wait_for_timeout(4000)
    
    # Handle disclaimer
    disclaimer = await page.query_selector('button:has-text("I Understand"), button:has-text("Accept")')
    if disclaimer:
        await disclaimer.click()
        await page.wait_for_timeout(1000)
    
    # Skip tutorial
    skip = await page.query_selector('button:has-text("Skip")')
    if skip:
        await skip.click()
        await page.wait_for_timeout(500)
    
    print(f"Logged in: {page.url}")

async def get_buttons(page):
    """Get all clickable buttons on page"""
    return await page.evaluate("""() => {
        const btns = [];
        const skipIds = ['back-btn', 'hub-btn', 'close-btn', 'dock-', 'nav-', 'tab-'];
        const skipText = ['back to hub', 'close', 'hub'];
        
        document.querySelectorAll('button').forEach((btn, idx) => {
            const testId = btn.getAttribute('data-testid') || '';
            const text = (btn.textContent || '').trim().substring(0, 80);
            const rect = btn.getBoundingClientRect();
            
            if (rect.width < 5 || rect.height < 5) return;
            if (rect.top < -50 || rect.top > window.innerHeight + 100) return;
            
            if (skipIds.some(s => testId.toLowerCase().includes(s))) return;
            if (skipText.some(s => text.toLowerCase().includes(s))) return;
            
            btns.push({
                idx: idx,
                testId: testId,
                text: text,
                x: Math.round(rect.x + rect.width/2),
                y: Math.round(rect.y + rect.height/2)
            });
        });
        return btns;
    }""")

async def check_button_effect(page, btn, route):
    """Click button and check if it did anything"""
    global dead_buttons, stub_buttons, wired_count, total_clicked
    
    try:
        initial_url = page.url
        initial_html_len = await page.evaluate("() => document.body.innerHTML.length")
        
        # Click
        await page.mouse.click(btn['x'], btn['y'])
        total_clicked += 1
        
        # Wait 3 seconds
        await page.wait_for_timeout(3000)
        
        final_url = page.url
        final_html_len = await page.evaluate("() => document.body.innerHTML.length")
        
        url_changed = final_url != initial_url
        dom_changed = abs(final_html_len - initial_html_len) > 100
        
        # Check for stub toast
        toast = await page.evaluate("""() => {
            const toasts = document.querySelectorAll('[data-sonner-toast], .toast, [class*="toast"]');
            for (const t of toasts) {
                const txt = (t.textContent || '').toLowerCase();
                if (txt.includes('coming soon') || txt.includes('not implemented') || txt.includes('stub')) {
                    return t.textContent;
                }
            }
            return '';
        }""")
        
        if url_changed or dom_changed:
            if toast:
                stub_buttons.append({
                    "route": route,
                    "button_label": btn['text'],
                    "button_testid": btn['testId'],
                    "toast": toast[:60]
                })
                print(f"  STUB: {btn['text'][:35]}")
            else:
                wired_count += 1
                print(f"  WIRED: {btn['text'][:35]}")
        else:
            # DEAD
            dead_buttons.append({
                "route": route,
                "button_label": btn['text'],
                "button_testid": btn['testId'],
                "button_path_in_dom": f"button[{btn['idx']}]"
            })
            print(f"  DEAD: {btn['text'][:35]} (testid={btn['testId']})")
            # Screenshot
            fname = f"DEADBTN_{route.replace('/', '_')}_{len(dead_buttons)}.jpeg"
            await page.screenshot(path=f"{SCREENSHOT_DIR}/{fname}", quality=40, full_page=False)
        
        # Navigate back if URL changed
        if url_changed:
            await page.goto(f"{BASE_URL}{route}", wait_until="networkidle", timeout=15000)
            await page.wait_for_timeout(1500)
            
    except Exception as e:
        print(f"  Error: {str(e)[:50]}")

async def scan_route(page, route):
    """Scan all buttons on a route"""
    try:
        print(f"\n=== {route} ===")
        await page.goto(f"{BASE_URL}{route}", wait_until="networkidle", timeout=20000)
        await page.wait_for_timeout(2500)
        
        buttons = await get_buttons(page)
        print(f"Found {len(buttons)} buttons")
        
        for btn in buttons[:15]:  # Limit per page
            await check_button_effect(page, btn, route)
            
            # Stop early if too many dead buttons
            if len(dead_buttons) > 30:
                print("!!! STOPPING: More than 30 dead buttons found - structural problem")
                return False
                
    except Exception as e:
        print(f"Route error: {str(e)[:60]}")
    
    return True

async def main():
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 414, "height": 896})
        page = await context.new_page()
        
        await login(page)
        
        for route in ROUTES_TO_SCAN:
            should_continue = await scan_route(page, route)
            if not should_continue:
                break
        
        await browser.close()
    
    # Save results
    results = {
        "dead_buttons": dead_buttons,
        "stub_buttons": stub_buttons,
        "summary": {
            "total_buttons_clicked": total_clicked,
            "dead_count": len(dead_buttons),
            "stub_count": len(stub_buttons),
            "wired_count": wired_count
        }
    }
    
    with open("/app/test_reports/iteration_429.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n=== FINAL RESULTS ===")
    print(f"Total clicked: {total_clicked}")
    print(f"Dead: {len(dead_buttons)}")
    print(f"Stub: {len(stub_buttons)}")
    print(f"Wired: {wired_count}")
    
    print("\nDEAD BUTTONS:")
    for db in dead_buttons:
        print(f"  {db['route']}: {db['button_label'][:50]} ({db['button_testid']})")

if __name__ == "__main__":
    asyncio.run(main())
