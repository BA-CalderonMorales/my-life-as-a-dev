"""
Chat Widget e2e tests.

Philosophy:
-----------
The AI chat widget is a key interactive feature that provides:
1. Professional UI with clean, accessible design
2. Proper message formatting (markdown, links, lists)
3. Responsive error handling
4. Dev-only logging (no console noise in production)

These tests validate the widget's DOM structure, styling, and
basic interaction patterns without making actual API calls.
"""

import pytest
from playwright.sync_api import Page, expect


# =============================================================================
# Constants
# =============================================================================

# Widget element selectors
CHAT_TRIGGER = "#ai-chat-trigger"
CHAT_MODAL = "#ai-chat-modal"
CHAT_CONTAINER = ".ai-chat-container"
CHAT_HEADER = ".ai-chat-header"
CHAT_MESSAGES = "#ai-chat-messages"
CHAT_INPUT = "#ai-chat-input"
CHAT_SEND_BTN = ".ai-chat-send-btn"
CHAT_CLOSE_BTN = ".ai-chat-close"
CHAT_STATUS = ".ai-chat-status"


# =============================================================================
# Fixtures
# =============================================================================

@pytest.fixture
def chat_page(page: Page, http_server: str) -> Page:
    """Navigate to homepage and wait for chat widget to load."""
    page.goto(http_server)
    page.wait_for_selector(CHAT_TRIGGER, timeout=5000)
    return page


# =============================================================================
# Widget Structure Tests
# =============================================================================

class TestChatWidgetStructure:
    """Validate chat widget DOM structure and elements."""

    def test_chat_trigger_exists(self, chat_page: Page):
        """Chat trigger button should exist on page."""
        trigger = chat_page.locator(CHAT_TRIGGER)
        expect(trigger).to_be_visible()

    def test_chat_trigger_has_aria_label(self, chat_page: Page):
        """Chat trigger should have accessibility label."""
        trigger = chat_page.locator(CHAT_TRIGGER)
        expect(trigger).to_have_attribute("aria-label", "Ask AI Assistant")

    def test_chat_modal_hidden_by_default(self, chat_page: Page):
        """Chat modal should be hidden initially."""
        modal = chat_page.locator(CHAT_MODAL)
        expect(modal).not_to_have_class("active")

    def test_chat_modal_contains_required_elements(self, chat_page: Page):
        """Modal should contain all required child elements."""
        # Open modal first
        chat_page.click(CHAT_TRIGGER)
        chat_page.wait_for_selector(f"{CHAT_MODAL}.active")

        # Check required elements
        expect(chat_page.locator(CHAT_CONTAINER)).to_be_visible()
        expect(chat_page.locator(CHAT_HEADER)).to_be_visible()
        expect(chat_page.locator(CHAT_MESSAGES)).to_be_visible()
        expect(chat_page.locator(CHAT_INPUT)).to_be_visible()
        expect(chat_page.locator(CHAT_SEND_BTN)).to_be_visible()
        expect(chat_page.locator(CHAT_CLOSE_BTN)).to_be_visible()

    def test_chat_header_shows_current_title(self, chat_page: Page):
        """Header should display the current chat title."""
        chat_page.click(CHAT_TRIGGER)
        chat_page.wait_for_selector(f"{CHAT_MODAL}.active")

        title = chat_page.locator(".ai-chat-header-title")
        expect(title).to_be_visible()
        expect(title).to_have_text("Ask about Brandon's work")

    def test_welcome_message_displayed(self, chat_page: Page):
        """Initial welcome message should be displayed."""
        chat_page.click(CHAT_TRIGGER)
        chat_page.wait_for_selector(f"{CHAT_MODAL}.active")

        messages = chat_page.locator(".ai-message-bot")
        expect(messages.first).to_be_visible()
        expect(messages.first).to_contain_text("Hello!")


# =============================================================================
# Widget Interaction Tests
# =============================================================================

class TestChatWidgetInteraction:
    """Validate chat widget user interactions."""

    def test_clicking_trigger_opens_modal(self, chat_page: Page):
        """Clicking trigger should open the chat modal."""
        chat_page.click(CHAT_TRIGGER)
        modal = chat_page.locator(CHAT_MODAL)
        expect(modal).to_have_class("ai-chat-modal active")

    def test_clicking_close_button_closes_modal(self, chat_page: Page):
        """Clicking close button should close the modal."""
        # Open modal
        chat_page.click(CHAT_TRIGGER)
        chat_page.wait_for_selector(f"{CHAT_MODAL}.active")

        # Close modal
        chat_page.click(CHAT_CLOSE_BTN)
        modal = chat_page.locator(CHAT_MODAL)
        expect(modal).not_to_have_class("active")

    def test_escape_key_closes_modal(self, chat_page: Page):
        """Pressing Escape should close the modal."""
        # Open modal
        chat_page.click(CHAT_TRIGGER)
        chat_page.wait_for_selector(f"{CHAT_MODAL}.active")

        # Press Escape
        chat_page.keyboard.press("Escape")
        modal = chat_page.locator(CHAT_MODAL)
        expect(modal).not_to_have_class("active")

    def test_clicking_overlay_closes_modal(self, chat_page: Page):
        """Clicking the modal overlay should close it."""
        # Open modal
        chat_page.click(CHAT_TRIGGER)
        chat_page.wait_for_selector(f"{CHAT_MODAL}.active")

        # Click overlay (outside container)
        chat_page.click(CHAT_MODAL, position={"x": 10, "y": 10})
        modal = chat_page.locator(CHAT_MODAL)
        expect(modal).not_to_have_class("active")

    def test_input_receives_focus_on_open(self, chat_page: Page):
        """Input field should receive focus when modal opens."""
        chat_page.click(CHAT_TRIGGER)
        chat_page.wait_for_selector(f"{CHAT_MODAL}.active")

        input_field = chat_page.locator(CHAT_INPUT)
        expect(input_field).to_be_focused()

    def test_empty_message_not_sent(self, chat_page: Page):
        """Empty messages should not be sent."""
        chat_page.click(CHAT_TRIGGER)
        chat_page.wait_for_selector(f"{CHAT_MODAL}.active")

        # Count initial messages
        initial_count = chat_page.locator(".ai-message").count()

        # Try to send empty message
        chat_page.click(CHAT_SEND_BTN)

        # Should still have same message count
        assert chat_page.locator(".ai-message").count() == initial_count

    def test_user_message_appears_in_chat(self, chat_page: Page):
        """User messages should appear in the chat window."""
        chat_page.click(CHAT_TRIGGER)
        chat_page.wait_for_selector(f"{CHAT_MODAL}.active")

        # Type and send a message
        chat_page.fill(CHAT_INPUT, "Test message")
        chat_page.click(CHAT_SEND_BTN)

        # User message should appear
        user_messages = chat_page.locator(".ai-message-user")
        expect(user_messages.last).to_contain_text("Test message")


# =============================================================================
# Widget Accessibility Tests
# =============================================================================

class TestChatWidgetAccessibility:
    """Validate chat widget accessibility features."""

    def test_trigger_button_is_keyboard_accessible(self, chat_page: Page):
        """Trigger button should be accessible via keyboard."""
        trigger = chat_page.locator(CHAT_TRIGGER)
        trigger.focus()
        chat_page.keyboard.press("Enter")

        modal = chat_page.locator(CHAT_MODAL)
        expect(modal).to_have_class("ai-chat-modal active")

    def test_close_button_has_aria_label(self, chat_page: Page):
        """Close button should have accessibility label."""
        chat_page.click(CHAT_TRIGGER)
        chat_page.wait_for_selector(f"{CHAT_MODAL}.active")

        close_btn = chat_page.locator(CHAT_CLOSE_BTN)
        expect(close_btn).to_have_attribute("aria-label", "Close chat")

    def test_send_button_has_aria_label(self, chat_page: Page):
        """Send button should have accessibility label."""
        chat_page.click(CHAT_TRIGGER)
        chat_page.wait_for_selector(f"{CHAT_MODAL}.active")

        send_btn = chat_page.locator(CHAT_SEND_BTN)
        expect(send_btn).to_have_attribute("aria-label", "Send message")


# =============================================================================
# Widget Style Tests
# =============================================================================

class TestChatWidgetStyles:
    """Validate chat widget styling is applied correctly."""

    def test_trigger_has_fixed_positioning(self, chat_page: Page):
        """Trigger should be fixed positioned in viewport."""
        trigger = chat_page.locator(CHAT_TRIGGER)
        position = trigger.evaluate("el => getComputedStyle(el).position")
        assert position == "fixed"

    def test_modal_uses_flexbox_centering(self, chat_page: Page):
        """Modal should use flexbox for centering."""
        chat_page.click(CHAT_TRIGGER)
        chat_page.wait_for_selector(f"{CHAT_MODAL}.active")

        modal = chat_page.locator(CHAT_MODAL)
        display = modal.evaluate("el => getComputedStyle(el).display")
        assert display == "flex"

    def test_container_has_visible_border(self, chat_page: Page):
        """Container should preserve its card border styling."""
        chat_page.click(CHAT_TRIGGER)
        chat_page.wait_for_selector(f"{CHAT_MODAL}.active")

        container = chat_page.locator(CHAT_CONTAINER)
        border_width = container.evaluate("el => getComputedStyle(el).borderTopWidth")
        border_style = container.evaluate("el => getComputedStyle(el).borderTopStyle")
        assert border_width != "0px"
        assert border_style != "none"
