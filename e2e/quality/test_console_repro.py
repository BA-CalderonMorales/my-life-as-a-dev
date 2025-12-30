import pytest
from playwright.sync_api import Page, ConsoleMessage

# Constants
WELCOME_MESSAGE_SIGNATURE = "Welcome to Brandon"

# Errors we want to ensure are NOT present
# These are specific errors that the console-patch.js should prevent
FORBIDDEN_ERRORS = [
    "TypeError: Failed to execute 'observe' on 'MutationObserver'",
    "Mixed Content",
    "SecurityError",
]

# We track 404s separately - only fail on 404s for site resources, not browser internals
SITE_404_INDICATORS = [
    "assets/",
    ".js",
    ".css",
    ".html",
    ".png",
    ".jpg",
    ".svg",
]

def test_console_cleanliness(page: Page, base_url: str):
    """
    Verify that the console is clean of specific errors.
    This test is designed to FAIL if the errors are present.
    """
    console_messages = []
    
    def handle_console(msg: ConsoleMessage):
        console_messages.append(msg)
    
    page.on("console", handle_console)
    
    # Navigate to the home page
    page.goto(f"{base_url}/")
    
    # Wait a bit for any async errors to appear
    page.wait_for_timeout(2000)
    
    # Check for forbidden errors
    found_errors = []
    for msg in console_messages:
        text = msg.text
        for error in FORBIDDEN_ERRORS:
            if error in text:
                found_errors.append(f"Found forbidden error: {text}")
        
        # Check for 404s only if they appear to be for site resources
        if "Failed to load resource" in text and "404" in text:
            # Only fail if it looks like a site resource
            if any(indicator in text for indicator in SITE_404_INDICATORS):
                found_errors.append(f"Found 404 for site resource: {text}")
    
    # Assert that no forbidden errors were found
    if found_errors:
        pytest.fail("\n".join(found_errors))

    # Verify patches are active
    # We inject a script to check if MutationObserver and WebSocket are patched
    patches_active = page.evaluate("""() => {
        const isMutationObserverPatched = window.MutationObserver.toString().includes('NativeMutationObserver');
        const isWebSocketPatched = window.WebSocket.toString().includes('NativeWebSocket');
        return { isMutationObserverPatched, isWebSocketPatched };
    }""")
    
    if not patches_active['isMutationObserverPatched']:
        pytest.fail("MutationObserver patch is NOT active!")
    
    if not patches_active['isWebSocketPatched']:
        pytest.fail("WebSocket patch is NOT active!")

    # Verify welcome message is present (sanity check)
    welcome_found = any(WELCOME_MESSAGE_SIGNATURE in msg.text for msg in console_messages)
    # We don't fail if welcome message is missing here, as the primary goal is to catch errors
    # But it's good to know
    if not welcome_found:
        print("Warning: Welcome message not found")
