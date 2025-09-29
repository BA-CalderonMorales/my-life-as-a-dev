#!/usr/bin/env python3
"""
Headless browser verification script using Playwright.
Checks that the homepage renders properly with correct markdown formatting.
"""

import asyncio
from playwright.async_api import async_playwright


async def verify_homepage():
    """Verify that the homepage renders correctly."""
    async with async_playwright() as p:
        # Launch headless browser
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Navigate to the built site
        await page.goto('file:///workspaces/my-life-as-a-dev/site/index.html')

        # Wait for page to load
        await page.wait_for_load_state('networkidle')

        # Check for key elements
        checks = {
            'title': await page.title(),
            'h1_exists': await page.locator('h1').count() > 0,
            'h1_text': await page.locator('h1').first.text_content() if await page.locator('h1').count() > 0 else None,
            'buttons_exist': await page.locator('.md-button').count() > 0,
            'button_count': await page.locator('.md-button').count(),
            'tabs_exist': await page.locator('[role="tab"]').count() > 0,
            'tab_count': await page.locator('[role="tab"]').count(),
            'no_emojis_in_headings': True,  # Will check manually
            'svg_loaded': await page.locator('img[alt*="orbit"]').count() > 0,
        }

        # Check for emoji characters in headings
        headings = await page.locator('h1, h2, h3, h4, h5, h6').all_text_contents()
        for heading in headings:
            # Check for common emoji unicode ranges
            if any(ord(char) > 0x1F300 for char in heading):
                checks['no_emojis_in_headings'] = False
                print(f"❌ Found emoji in heading: {heading}")

        # Print results
        print("\n=== Page Verification Results ===\n")
        print(f"✓ Page Title: {checks['title']}")
        print(f"✓ H1 Heading: {checks['h1_text']}")
        print(f"✓ Buttons Found: {checks['button_count']}")
        print(f"✓ Tabs Found: {checks['tab_count']}")
        print(f"✓ SVG Loaded: {checks['svg_loaded']}")
        print(f"✓ No Emojis in Headings: {checks['no_emojis_in_headings']}")

        # Check if markdown rendered properly (no raw markdown visible)
        body_text = await page.locator('body').text_content()
        issues = []

        if '{ .md-button }' in body_text:
            issues.append("Raw button syntax visible")
        if '**' in body_text and '**Product-Minded' not in body_text:
            issues.append("Raw bold markdown visible")
        if '#' in body_text[:100]:  # Check beginning of page
            issues.append("Raw heading markdown visible")

        if issues:
            print(f"\n❌ Markdown Rendering Issues:")
            for issue in issues:
                print(f"   - {issue}")
        else:
            print(f"\n✓ Markdown Rendering: OK")

        await browser.close()

        return len(issues) == 0 and checks['no_emojis_in_headings']


if __name__ == "__main__":
    success = asyncio.run(verify_homepage())
    exit(0 if success else 1)