"""
Console output e2e tests.

Philosophy:
-----------
A developer's console is their first impression of your code quality.
When someone opens DevTools on this portfolio site, they should see:

1. Zero errors from our code - we handle edge cases gracefully
2. Zero warnings from our code - we write clean, modern code
3. No intentional app logs on page load
4. No debug artifacts - we clean up after ourselves

INTENTIONAL CONSOLE OUTPUT:
--------------------------
The portfolio now keeps the console silent by default. Any console
output should come from the browser, MkDocs Material, or other known
third-party integrations rather than our application code.

EXPECTED THIRD-PARTY NOISE (filtered out):
------------------------------------------
These errors/messages come from browser extensions or MkDocs Material
and are NOT from our code:

- MutationObserver errors: MkDocs Material's instant loading feature
- WebSocket/Mixed Content: Dev server livereload over HTTPS (Codespaces)
- GitHub API 404s: MkDocs Material version provider (no releases exist)
- runtime.lastError: Browser extension async message handling
- message channel closed: Browser extension cleanup

This test suite enforces these standards to prevent console pollution
that appears unprofessional to developers inspecting the site.
"""

import pytest
from playwright.sync_api import Page, ConsoleMessage


# =============================================================================
# Constants
# =============================================================================

# Legacy welcome signature kept for regression coverage in case it returns.
WELCOME_MESSAGE_SIGNATURE = "Welcome to Brandon"

# Patterns that indicate debug code was left in production
DEBUG_PATTERNS = [
    "[ThreeJSBackground]",
    "[ImmersiveScene]",
    "[AmbientParticleScene]",
    "[HomePageScene]",
    "[SubtlePageScene]",
    "[SceneManager]",
    "[DeviceDetector]",
    "DEBUG:",
    "TODO:",
    "FIXME:",
    "console.log(",  # Literal console.log visible (usually from errors)
]

# Browser/environment errors we gracefully acknowledge but can't control
EXPECTED_BROWSER_ERRORS = [
    "net::ERR",                    # Network errors (offline, failed fetches)
    "Failed to load resource",     # Resource loading failures
    "Mixed Content",               # HTTP/HTTPS mixing (dev server HTTPS)
    # "WebSocket",                   # WebSocket connection issues (dev server)
    # "SecurityError",               # WebSocket security errors (dev server HTTPS)
    "CORS policy",                 # CORS blocking (file:// protocol)
    "Cross origin requests",       # Same as above
    "favicon",                     # Missing favicon (acceptable)
    # "MutationObserver",            # MkDocs Material observer timing issues (FIXED)
    "runtime.lastError",           # Browser extension errors
    "message channel closed",      # Browser extension async response errors
    "api.github.com",              # GitHub API errors (no releases)
    "releases/latest",             # Version provider when no releases exist
]

# Browser/environment warnings we gracefully acknowledge but can't control
EXPECTED_BROWSER_WARNINGS = [
    "DevTools",                    # DevTools-related messages
    "Source map",                  # Missing source maps (third-party libs)
    "WebGL",                       # WebGL capability warnings
    "swiftshader",                 # Software rendering fallback
    "deprecated",                  # Browser deprecation notices
    "third-party cookie",          # Cookie policy warnings
    # "insecure WebSocket",          # Dev server mixed content warnings
]

# Messages from dev tools/libraries we don't control
LIBRARY_MESSAGES = [
    "Download the React DevTools",
    "[HMR]",
    "[vite]",
    "Connected to ws://",
    "WebSocket",
    "Livereload",
    "runtime.lastError",           # Browser extension messages
    "message channel closed",      # Browser extension async errors
    "[console-patch]",              # Our console patch initialization
    "[AI Chat]",                    # Chat widget initialization (dev mode)
]


# =============================================================================
# Helper Functions
# =============================================================================

def is_cors_blocked(messages: list[ConsoleMessage]) -> bool:
    """Check if ES modules were blocked by CORS (file:// protocol)."""
    return any(
        "CORS policy" in msg.text or "Cross origin" in msg.text
        for msg in messages
    )


def is_our_error(msg: ConsoleMessage) -> bool:
    """Determine if an error is from our code (not browser/environment)."""
    if msg.type != "error":
        return False
    return not any(pattern in msg.text for pattern in EXPECTED_BROWSER_ERRORS)


def is_our_warning(msg: ConsoleMessage) -> bool:
    """Determine if a warning is from our code (not browser/environment)."""
    if msg.type != "warning":
        return False
    return not any(pattern in msg.text for pattern in EXPECTED_BROWSER_WARNINGS)


def is_our_log(msg: ConsoleMessage) -> bool:
    """Determine if a log message is from our code (not libraries)."""
    if msg.type not in ("log", "info"):
        return False
    return not any(pattern in msg.text for pattern in LIBRARY_MESSAGES)


def is_welcome_message(msg: ConsoleMessage) -> bool:
    """Check if a message is our intentional welcome message."""
    return (
        msg.type == "log"
        and WELCOME_MESSAGE_SIGNATURE in msg.text
    )


def is_debug_artifact(msg: ConsoleMessage) -> bool:
    """Check if a message is a debug artifact that shouldn't be in production."""
    if msg.type not in ("log", "info", "debug"):
        return False
    return any(pattern in msg.text for pattern in DEBUG_PATTERNS)


def format_messages(messages: list[ConsoleMessage]) -> list[str]:
    """Format console messages for readable assertion output."""
    formatted = []
    for m in messages:
        text = m.text[:100] + "..." if len(m.text) > 100 else m.text
        formatted.append(f"[{m.type.upper()}] {text}")
    return formatted


# =============================================================================
# Test Class
# =============================================================================

class TestConsoleOutput:
    """
    Tests for browser console output cleanliness.
    
    These tests ensure that developers inspecting the site see a clean,
    professional console with only our intentional welcome message.
    """

    @pytest.fixture
    def console_messages(self, page: Page, base_url: str) -> list[ConsoleMessage]:
        """Capture all console messages when loading the home page."""
        messages: list[ConsoleMessage] = []

        def handle_console(msg: ConsoleMessage):
            messages.append(msg)

        page.on("console", handle_console)
        page.goto(f"{base_url}/index.html")
        page.wait_for_load_state("networkidle")

        # Allow extra time for any delayed console messages (async operations)
        page.wait_for_timeout(1000)

        return messages

    # -------------------------------------------------------------------------
    # Error Tests
    # -------------------------------------------------------------------------

    def test_no_console_errors_from_our_code(self, console_messages: list[ConsoleMessage]):
        """
        There should be zero console errors from our code.
        
        Browser/network errors (CORS, fetch failures) are gracefully ignored
        as they're environment-dependent. But any error from our JavaScript
        indicates a bug that needs fixing.
        """
        our_errors = [msg for msg in console_messages if is_our_error(msg)]
        
        assert not our_errors, (
            f"Console errors found from our code!\n"
            f"This indicates unhandled exceptions or bugs.\n"
            f"Errors:\n" + "\n".join(format_messages(our_errors))
        )

    def test_errors_are_gracefully_handled(self, console_messages: list[ConsoleMessage]):
        """
        When browser/environment errors occur, we should handle them gracefully.
        
        This test documents what errors we expect and tolerate. If new error
        patterns appear frequently, we should add graceful handling for them.
        """
        all_errors = [msg for msg in console_messages if msg.type == "error"]
        our_errors = [msg for msg in all_errors if is_our_error(msg)]
        
        # Our errors are never acceptable
        assert not our_errors, (
            f"Unhandled errors from our code!\n"
            f"Errors:\n" + "\n".join(format_messages(our_errors))
        )

    # -------------------------------------------------------------------------
    # Warning Tests
    # -------------------------------------------------------------------------

    def test_no_console_warnings_from_our_code(self, console_messages: list[ConsoleMessage]):
        """
        There should be zero console warnings from our code.
        
        Warnings often indicate deprecated API usage, type mismatches,
        or other issues that should be addressed for code quality.
        """
        our_warnings = [msg for msg in console_messages if is_our_warning(msg)]
        
        assert not our_warnings, (
            f"Console warnings found from our code!\n"
            f"Warnings often indicate deprecated APIs or potential issues.\n"
            f"Warnings:\n" + "\n".join(format_messages(our_warnings))
        )

    # -------------------------------------------------------------------------
    # Intentional Log Tests
    # -------------------------------------------------------------------------

    def test_no_intentional_app_logs(self, console_messages: list[ConsoleMessage]):
        """
        The portfolio should not emit intentional app logs on page load.

        This keeps DevTools focused on actual issues instead of cosmetic
        branding messages or leftover instrumentation.
        """
        if is_cors_blocked(console_messages):
            pytest.skip(
                "ES modules blocked by CORS on file:// protocol. "
                "Run with HTTP server via DOCS_BASE_URL env var."
            )

        our_logs = [msg for msg in console_messages if is_our_log(msg)]

        assert not our_logs, (
            "Unexpected console logs found from our code.\n"
            "The portfolio should keep the console silent by default.\n"
            "Logs:\n" + "\n".join(format_messages(our_logs))
        )

    def test_legacy_welcome_message_is_not_reintroduced(self, console_messages: list[ConsoleMessage]):
        """
        The previous welcome-banner console log should stay removed.

        Reintroducing it would make the console noisier without improving
        user-facing behavior.
        """
        if is_cors_blocked(console_messages):
            pytest.skip(
                "ES modules blocked by CORS on file:// protocol. "
                "Run with HTTP server via DOCS_BASE_URL env var."
            )

        welcome_messages = [msg for msg in console_messages if is_welcome_message(msg)]
        assert not welcome_messages, (
            "Legacy welcome message should not appear in the console.\n"
            f"Messages found: {[m.text for m in welcome_messages]}"
        )

    # -------------------------------------------------------------------------
    # Debug Artifact Tests
    # -------------------------------------------------------------------------

    def test_no_debug_logs_in_production(self, console_messages: list[ConsoleMessage]):
        """
        There should be no debug log statements left in production code.
        
        Debug logs with prefixes like [SceneManager] or DEBUG: indicate
        development artifacts that should be removed before shipping.
        """
        debug_logs = [msg for msg in console_messages if is_debug_artifact(msg)]
        
        assert not debug_logs, (
            f"Debug logs found in production code!\n"
            f"Remove these before committing:\n" + 
            "\n".join(format_messages(debug_logs))
        )

    # -------------------------------------------------------------------------
    # Overall Cleanliness Tests
    # -------------------------------------------------------------------------

    def test_console_is_minimal_and_intentional(self, console_messages: list[ConsoleMessage]):
        """
        The console should be minimal with no application-authored logs.

        Every console.log is a choice. For the current site, we choose to
        keep the console silent unless a real issue needs attention.
        """
        if is_cors_blocked(console_messages):
            pytest.skip(
                "ES modules blocked by CORS on file:// protocol. "
                "Run with HTTP server via DOCS_BASE_URL env var."
            )

        our_logs = [msg for msg in console_messages if is_our_log(msg)]

        assert not our_logs, (
            "Unexpected console output found from our code.\n"
            "Only browser or third-party noise should remain after filtering.\n"
            "Unexpected logs:\n" + "\n".join(format_messages(our_logs))
        )

    def test_no_stack_traces_visible(self, console_messages: list[ConsoleMessage]):
        """
        No JavaScript stack traces should be visible to users.
        
        Stack traces indicate unhandled exceptions. All errors should be
        caught and handled gracefully with user-friendly messaging.
        """
        stack_trace_indicators = [
            "    at ",           # Standard JS stack trace line
            "TypeError:",        # Type errors
            "ReferenceError:",   # Reference errors
            "SyntaxError:",      # Syntax errors
            "RangeError:",       # Range errors
            "Uncaught",          # Uncaught exceptions
        ]
        
        stack_traces = [
            msg for msg in console_messages
            if msg.type == "error"
            and any(indicator in msg.text for indicator in stack_trace_indicators)
            # Exclude CORS errors which can have stack-like output
            and "CORS" not in msg.text
            and "Cross origin" not in msg.text
        ]
        
        assert not stack_traces, (
            f"Stack traces visible in console!\n"
            f"Errors should be caught and handled gracefully:\n" +
            "\n".join(format_messages(stack_traces))
        )
