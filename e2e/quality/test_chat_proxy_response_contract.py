"""Chat proxy response contract tests.

These tests exercise every suggested chat question through the browser UI while
mocking both Cloud Run services. They keep frontend response handling aligned
without depending on live model output or external API quota.
"""

from __future__ import annotations

import json
from typing import Dict, List
from urllib.parse import urlparse

import pytest
from playwright.sync_api import Page, expect


PROMPT_ROUTES: List[str] = [
    "/",
    "/index.html",
    "/learning/",
    "/learning/algorithms/",
    "/learning/algorithms/sliding_window/",
    "/learning/algorithms/dynamic_programming/",
    "/learning/algorithms/two_pointers/",
    "/learning/algorithms/backtracking/",
    "/learning/data_structures/",
    "/learning/cloud_ai/",
    "/learning/cloud_ai/vertex_ai/",
    "/projects/",
    "/projects/active/",
    "/docs-as-code/ai/",
    "/resume/",
]

SERVICE_MODES = ["nvidia", "go_fallback"]


def response_for(service: str, prompt: str) -> str:
    if service == "nvidia":
        return (
            "Here's the clean overview for the requested page:\n\n"
            "| Project | What it does | Key links |\n"
            "|---|---|---|\n"
            f"| My Life as a Dev | Answers: {prompt} <br> Uses the docs site as source of truth. "
            "| [Docs](https://ba-calderonmorales.github.io/my-life-as-a-dev/projects/) "
            "[GitHub](https://github.com/BA-CalderonMorales/my-life-as-a-dev) "
            "[Untrusted](https://unknown.example.com/fake) |\n"
            "---\n"
            "- Core answer\n"
            "  - Source-backed context\n"
            "    - Rendered with nested indentation\n"
        )

    return (
        f"Answering: {prompt}\n\n"
        "---\n"
        "- Uses source-backed docs and project context.\n"
        "  - Keeps nested details visually grouped.\n"
        "- GitHub: [BA-CalderonMorales](https://github.com/BA-CalderonMorales)\n"
        "- LinkedIn: [bcalderonmorales-cmoe](https://www.linkedin.com/in/bcalderonmorales-cmoe/)\n"
        "- Ignore invented destination: [bad](https://unknown.example.com/fake)"
    )


def is_trusted_href(href: str, base_url: str) -> bool:
    parsed = urlparse(href)
    base = urlparse(base_url)

    if parsed.netloc == base.netloc:
        return True

    if parsed.netloc == "ba-calderonmorales.github.io":
        return parsed.path.startswith("/my-life-as-a-dev/")

    if parsed.netloc == "github.com":
        return parsed.path == "/BA-CalderonMorales" or parsed.path.startswith(
            "/BA-CalderonMorales/"
        )

    if parsed.netloc == "www.linkedin.com":
        return parsed.path.rstrip("/") == "/in/bcalderonmorales-cmoe"

    return False


def install_proxy_mocks(page: Page, service_mode: str) -> Dict[str, int]:
    calls = {"nvidia": 0, "go": 0}

    def handle_nvidia(route):
        calls["nvidia"] += 1
        request_json = route.request.post_data_json
        if callable(request_json):
            request_json = request_json()
        prompt = request_json.get("question", "") if isinstance(request_json, dict) else ""

        if service_mode == "go_fallback":
            route.fulfill(
                status=503,
                content_type="application/json",
                body=json.dumps({"error": "Response failed quality checks"}),
            )
            return

        route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps(
                {
                    "answer": response_for("nvidia", prompt),
                    "session_id": "nvidia-session",
                    "sources": [],
                }
            ),
        )

    def handle_go(route):
        calls["go"] += 1
        request_json = route.request.post_data_json
        if callable(request_json):
            request_json = request_json()
        prompt = request_json.get("question", "") if isinstance(request_json, dict) else ""
        route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps(
                {
                    "answer": response_for("go", prompt),
                    "session_id": "go-session",
                    "sources": [],
                }
            ),
        )

    page.route("**/nvidia/chat", handle_nvidia)
    page.route("**agent-chat-proxy**", handle_go)
    return calls


def page_url(base_url: str, route_path: str) -> str:
    if route_path == "/":
        return f"{base_url}/"
    return f"{base_url}{route_path}"


@pytest.mark.parametrize("route_path", PROMPT_ROUTES)
@pytest.mark.parametrize("service_mode", SERVICE_MODES)
def test_suggested_chat_questions_render_clean_trusted_responses(
    page: Page, base_url: str, route_path: str, service_mode: str
):
    calls = install_proxy_mocks(page, service_mode)
    page.goto(page_url(base_url, route_path), wait_until="networkidle")

    page.evaluate("window.ChatConfig.MIN_REQUEST_INTERVAL = 0")
    prompts = page.evaluate(
        "window.SuggestedPrompts.getPromptsForPage(window.location.pathname)"
    )
    assert prompts, f"No suggested prompts configured for {route_path}"

    page.locator("#ai-chat-trigger").click()
    expect(page.locator("#ai-chat-modal")).to_be_visible()

    for prompt in prompts:
        expect(page.get_by_text(prompt, exact=True)).to_be_visible()

    for prompt in prompts:
        bot_count = page.locator(".ai-message-bot .ai-message-content").count()

        page.locator("#ai-chat-input").fill(prompt)
        page.locator(".ai-chat-send-btn").click()
        page.wait_for_function(
            "count => document.querySelectorAll('.ai-message-bot .ai-message-content').length > count",
            arg=bot_count,
        )

        latest = page.locator(".ai-message-bot .ai-message-content").nth(-1)
        text = latest.inner_text()
        html = latest.inner_html()
        hrefs = latest.locator("a.ai-chat-link").evaluate_all(
            "(links) => links.map((link) => link.href)"
        )

        assert prompt in text
        assert "|---|" not in text
        assert "<br" not in html.lower()
        assert "unknown.example.com" not in hrefs
        assert latest.locator("hr.ai-chat-separator").count() == 1
        assert latest.locator("ul.ai-chat-list ul.ai-chat-list").count() >= 1
        assert hrefs, f"No trusted links rendered for {route_path}: {prompt}"
        assert all(is_trusted_href(href, base_url) for href in hrefs), hrefs

    assert calls["nvidia"] >= len(prompts)
    if service_mode == "nvidia":
        assert calls["go"] == 0
    else:
        assert calls["go"] == len(prompts)
