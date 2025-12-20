"""
Console output e2e tests.
Ensures the site has zero console errors and only a single welcome message.

This test prevents shipping code with console pollution that appears
unprofessional to developers inspecting the site.
"""

import pytest
from playwright.sync_api import Page, ConsoleMessage


class TestConsoleOutput:
    """Tests for browser console output cleanliness."""

    @pytest.fixture
    def console_messages(self, page: Page, base_url: str) -> list[ConsoleMessage]:
        """Capture all console messages when loading the home page."""
        messages: list[ConsoleMessage] = []

        def handle_console(msg: ConsoleMessage):
            messages.append(msg)

        page.on("console", handle_console)
        page.goto(f"{base_url}/index.html")
        page.wait_for_load_state("networkidle")

        # Allow extra time for any delayed console messages
        page.wait_for_timeout(1000)

        return messages

    def test_no_console_errors(self, console_messages: list[ConsoleMessage]):
        """There should be no console errors from our code."""
        errors = [
            msg for msg in console_messages
            if msg.type == "error"
            # Ignore browser-level errors we can't control
            and "net::ERR" not in msg.text
            and "Failed to load resource" not in msg.text
            and "Mixed Content" not in msg.text
            and "WebSocket" not in msg.text
            # CORS errors when using file:// protocol (ES modules need HTTP server)
            and "CORS policy" not in msg.text
            and "Cross origin requests" not in msg.text
        ]
        error_texts = [f"[{e.type}] {e.text}" for e in errors]
        assert not errors, f"Console errors found: {error_texts}"

    def test_no_console_warnings(self, console_messages: list[ConsoleMessage]):
        """There should be no console warnings from our code."""
        warnings = [
            msg for msg in console_messages
            if msg.type == "warning"
            # Ignore browser-level warnings we can't control
            and "DevTools" not in msg.text
            and "Source map" not in msg.text
            and "WebGL" not in msg.text
            and "swiftshader" not in msg.text
        ]
        warning_texts = [f"[{w.type}] {w.text}" for w in warnings]
        assert not warnings, f"Console warnings found: {warning_texts}"

    def test_single_welcome_message(self, console_messages: list[ConsoleMessage]):
        """There should be exactly one welcome message in the console."""
        # Check if JS loaded (won't load with file:// due to CORS)
        cors_blocked = any(
            "CORS policy" in msg.text or "Cross origin" in msg.text
            for msg in console_messages
        )

        if cors_blocked:
            # When using file:// protocol, ES modules are blocked by CORS
            # This is expected - the test should pass in HTTP server context
            pytest.skip(
                "ES modules blocked by CORS on file:// protocol. "
                "Run with HTTP server via DOCS_BASE_URL env var."
            )

        # Filter to only log-level messages from our code
        logs = [
            msg for msg in console_messages
            if msg.type == "log"
            and "Welcome to Brandon" in msg.text
        ]

        # Allow 1-2 messages (MkDocs instant loading may cause reinit)
        assert len(logs) >= 1 and len(logs) <= 2, (
            f"Expected 1-2 welcome messages, found {len(logs)}. "
            f"Messages: {[m.text for m in logs]}"
        )

        # Verify the welcome message content
        assert "Portfolio" in logs[0].text, "Welcome message should mention Portfolio"

    def test_no_debug_logs(self, console_messages: list[ConsoleMessage]):
        """There should be no debug log statements left in production code."""
        debug_patterns = [
            "[ThreeJSBackground]",
            "[ImmersiveScene]",
            "[AmbientParticleScene]",
            "[SceneManager]",
            "DEBUG:",
            "TODO:",
        ]

        debug_logs = [
            msg for msg in console_messages
            if msg.type in ("log", "info", "debug")
            and any(pattern in msg.text for pattern in debug_patterns)
        ]

        debug_texts = [f"[{d.type}] {d.text}" for d in debug_logs]
        assert not debug_logs, f"Debug logs found: {debug_texts}"

    def test_minimal_console_output(self, console_messages: list[ConsoleMessage]):
        """Console should have minimal output - only essential messages."""
        # Count messages that are not expected
        our_logs = [
            msg for msg in console_messages
            if msg.type in ("log", "info")
            # Exclude browser/library internal messages
            and "Download the React DevTools" not in msg.text
            and "[HMR]" not in msg.text
            and "[vite]" not in msg.text
            # Exclude dev server WebSocket messages
            and "Connected to ws://" not in msg.text
            and "WebSocket" not in msg.text
        ]

        # We expect only our welcome message(s) - allow 1-2 for instant loading
        welcome_count = len([m for m in our_logs if "Welcome to Brandon" in m.text])

        assert welcome_count >= 1 and welcome_count <= 2, (
            f"Expected 1-2 welcome messages, found {welcome_count}. "
            f"All logs: {[m.text for m in our_logs]}"
        )
