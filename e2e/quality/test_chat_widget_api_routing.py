"""
Chat widget API routing regressions.

These tests focus on the contract between the browser widget and the
backend endpoints. They use Playwright request interception so the
frontend behavior is exercised without depending on live cloud services.
"""

import json

from playwright.sync_api import Page, expect

from e2e.quality.test_chat_widget import CHAT_INPUT
from e2e.quality.test_chat_widget import CHAT_MODAL
from e2e.quality.test_chat_widget import CHAT_SEND_BTN
from e2e.quality.test_chat_widget import CHAT_TRIGGER


CURRENT_NVIDIA_URL = "https://nvidia-chat-proxy-python-dawfbmka6a-uc.a.run.app/nvidia/chat"
LEGACY_NVIDIA_URL = "https://nvidia-chat-proxy-python-882389009262.us-central1.run.app/nvidia/chat"
CURRENT_FALLBACK_URL = "https://agent-chat-proxy-dawfbmka6a-uc.a.run.app"
LEGACY_FALLBACK_URL = "https://agent-chat-proxy-882389009262.us-central1.run.app"


def _open_chat(page: Page, base_url: str) -> None:
    """Open the chat widget on the home page."""
    page.goto(base_url)
    page.wait_for_selector(CHAT_TRIGGER, timeout=5000)
    page.click(CHAT_TRIGGER)
    page.wait_for_selector(f"{CHAT_MODAL}.active")


def _send_message(page: Page, text: str) -> None:
    """Send a message through the chat widget."""
    page.fill(CHAT_INPUT, text)
    page.click(CHAT_SEND_BTN)


class TestChatWidgetApiRouting:
    """Focused e2e checks for API contract and fallback behavior."""

    def test_nvidia_response_contract_renders_cleanly(self, page: Page, base_url: str):
        """A valid NVIDIA response should render through the existing widget parser."""
        captured_payloads = []

        def handle_nvidia(route):
            captured_payloads.append(route.request.post_data_json)
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(
                    {
                        "answer": (
                            "**Routing looks good**\n"
                            "- Primary response path is active\n"
                            "Explore https://example.com #Python"
                        ),
                        "session_id": "session-nvidia-1",
                        "sources": ["https://example.com/source"],
                    }
                ),
            )

        page.route(CURRENT_NVIDIA_URL, handle_nvidia)

        _open_chat(page, base_url)
        _send_message(page, "What can you help with?")

        bot_message = page.locator(".ai-message-bot").last
        expect(bot_message).to_contain_text("Routing looks good")
        expect(bot_message.locator("li")).to_have_count(1)
        expect(bot_message.locator("a.ai-chat-link").first).to_have_attribute(
            "href", "https://example.com"
        )
        expect(bot_message.locator(".ai-chat-hashtag").first).to_have_text("#Python")

        assert len(captured_payloads) == 1
        payload = captured_payloads[0]
        assert payload["question"] == "What can you help with?"
        assert "context" in payload and isinstance(payload["context"], str)
        assert "page_url" in payload and payload["page_url"].startswith(base_url)

    def test_go_service_fallback_still_works_when_nvidia_fails(self, page: Page, base_url: str):
        """The widget should fall back to the Go endpoint if NVIDIA returns a non-2xx response."""
        calls = []

        def handle_current_nvidia(route):
            calls.append("current-nvidia")
            route.fulfill(
                status=503,
                content_type="application/json",
                body=json.dumps({"error": "nvidia unavailable"}),
            )

        def handle_legacy_nvidia(route):
            calls.append("legacy-nvidia")
            route.fulfill(
                status=503,
                content_type="application/json",
                body=json.dumps({"error": "legacy nvidia unavailable"}),
            )

        def handle_fallback(route):
            calls.append("fallback")
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(
                    {
                        "answer": "Fallback response rendered successfully.",
                        "session_id": "session-fallback-1",
                        "sources": [],
                    }
                ),
            )

        page.route(CURRENT_NVIDIA_URL, handle_current_nvidia)
        page.route(LEGACY_NVIDIA_URL, handle_legacy_nvidia)
        page.route(CURRENT_FALLBACK_URL, handle_fallback)

        _open_chat(page, base_url)
        _send_message(page, "Trigger the backup path")

        expect(page.locator(".ai-message-bot").last).to_contain_text(
            "Fallback response rendered successfully."
        )
        assert calls == ["current-nvidia", "legacy-nvidia", "fallback"]

    def test_legacy_nvidia_host_is_used_when_current_host_fails_network(self, page: Page, base_url: str):
        """The widget should try the legacy NVIDIA hostname if the current host fails to fetch."""
        calls = []

        def handle_current_nvidia(route):
            calls.append("current-nvidia")
            route.abort("internetdisconnected")

        def handle_legacy_nvidia(route):
            calls.append("legacy-nvidia")
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(
                    {
                        "answer": "Legacy NVIDIA host recovered the request.",
                        "session_id": "session-nvidia-legacy-1",
                        "sources": [],
                    }
                ),
            )

        page.route(CURRENT_NVIDIA_URL, handle_current_nvidia)
        page.route(LEGACY_NVIDIA_URL, handle_legacy_nvidia)

        _open_chat(page, base_url)
        _send_message(page, "Try the alternate NVIDIA host")

        expect(page.locator(".ai-message-bot").last).to_contain_text(
            "Legacy NVIDIA host recovered the request."
        )
        assert calls == ["current-nvidia", "legacy-nvidia"]

    def test_legacy_go_host_is_used_when_current_fallback_host_fails_network(self, page: Page, base_url: str):
        """The widget should try the legacy Go hostname if the current fallback host fails to fetch."""
        calls = []

        def handle_current_nvidia(route):
            calls.append("current-nvidia")
            route.fulfill(
                status=503,
                content_type="application/json",
                body=json.dumps({"error": "nvidia unavailable"}),
            )

        def handle_legacy_nvidia(route):
            calls.append("legacy-nvidia")
            route.fulfill(
                status=503,
                content_type="application/json",
                body=json.dumps({"error": "legacy nvidia unavailable"}),
            )

        def handle_current_fallback(route):
            calls.append("current-fallback")
            route.abort("internetdisconnected")

        def handle_legacy_fallback(route):
            calls.append("legacy-fallback")
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(
                    {
                        "answer": "Legacy Go host recovered the request.",
                        "session_id": "session-go-legacy-1",
                        "sources": [],
                    }
                ),
            )

        page.route(CURRENT_NVIDIA_URL, handle_current_nvidia)
        page.route(LEGACY_NVIDIA_URL, handle_legacy_nvidia)
        page.route(CURRENT_FALLBACK_URL, handle_current_fallback)
        page.route(LEGACY_FALLBACK_URL, handle_legacy_fallback)

        _open_chat(page, base_url)
        _send_message(page, "Try the alternate Go host")

        expect(page.locator(".ai-message-bot").last).to_contain_text(
            "Legacy Go host recovered the request."
        )
        assert calls == [
            "current-nvidia",
            "legacy-nvidia",
            "current-fallback",
            "legacy-fallback",
        ]
