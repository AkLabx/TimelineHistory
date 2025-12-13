
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

        # Click on 'Mauryan Empire' card (use specific selector to avoid ambiguity)
        # The card has a period label and a title.
        # We can select the heading inside the card.
        page.locator('h3', has_text='Mauryan Empire').first.click()

        page.wait_for_timeout(2000)

        # Scroll down to content
        page.mouse.wheel(0, 500)
        page.wait_for_timeout(1000)

        # Take screenshot of Mauryan Empire Era Detail
        page.screenshot(path='verification/mauryan_highlight.png')

        # Navigate to Ashoka (King)
        # Find a button for Ashoka
        page.get_by_text('Ashoka the Great').first.click()

        page.wait_for_timeout(2000)

        # Check for highlighted terms (dotted underline)
        # We can look for element with class 'cursor-help'
        # 'Ashoka' entry has 'Dhammaghosha' or 'Bherighosha' in content usually.

        page.screenshot(path='verification/ashoka_highlight.png')

        browser.close()

if __name__ == '__main__':
    verify_highlighter()
