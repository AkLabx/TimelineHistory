from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('http://localhost:5174/TimelineHistory/', wait_until='domcontentloaded')

    # Check for the Dashboard SOTA button
    print("Clicking SOTA Mindmap button...")
    page.click("button:has-text('3D')")

    # Give it a moment to render canvas
    page.wait_for_timeout(2000)

    # Get HTML elements in the mindmap
    print("Looking for nodes...")
    nodes = page.locator(".pointer-events-auto").all()
    print(f"Found {len(nodes)} clickable nodes.")
    if len(nodes) > 0:
        print("Clicking a node...")
        nodes[0].click()
        page.wait_for_timeout(1000)
        print("Successfully clicked a node without errors.")

    browser.close()
