
from playwright.sync_api import sync_playwright
import time

def verify_highlighter():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        page.goto('http://localhost:4173/TimelineHistory/')

        # Wait for content to load
        page.wait_for_timeout(3000)

        # Take screenshot of Dashboard to see what is loaded
        page.screenshot(path='verification/dashboard_debug.png')

        # Try to find 'Mauryan Empire' title
        # It might be 'The Mauryan Empire' or something else?
        # Let's just click the first available card.
        # .group.relative is the card class in Dashboard.tsx

        # DashboardCard has className 'group relative ...'
        page.locator('.group.relative').first.click()

        page.wait_for_timeout(2000)

        # Scroll down
        page.mouse.wheel(0, 500)
        page.wait_for_timeout(1000)

        # Screenshot era detail
        page.screenshot(path='verification/era_detail.png')

        browser.close()

if __name__ == '__main__':
    verify_highlighter()
