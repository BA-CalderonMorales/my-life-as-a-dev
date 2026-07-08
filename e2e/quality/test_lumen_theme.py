"""
Lumen theme regression tests.
Checks shared light/dark contrast and top-tab consistency across key pages.
"""

import re

import pytest


PAGES = [
    ("/index.html", "home"),
    ("/404/", "404"),
]

SCHEMES = [
    ("light", "default"),
    ("dark", "slate"),
]

CONTRAST_TARGETS = [
    ".md-typeset",
    ".md-header",
    ".md-tabs__link",
    ".grid.cards > li",
    ".md-button--primary",
]


def _set_color_scheme(page, scheme: str):
    palette_index = "0" if scheme == "slate" else "1"
    page.evaluate(
        f"""
        localStorage.setItem('/.__palette', JSON.stringify({{index: {palette_index}}}));
        """
    )
    page.reload(wait_until="networkidle")
    page.wait_for_timeout(500)


def _rgb_to_tuple(value: str):
    match = re.search(r"rgba?\(([^)]+)\)", value)
    assert match, f"Expected rgb/rgba color, got {value}"
    parts = [float(part.strip()) for part in match.group(1).split(",")[:3]]
    return tuple(parts)


def _linearize(channel: float) -> float:
    channel = channel / 255
    if channel <= 0.03928:
        return channel / 12.92
    return ((channel + 0.055) / 1.055) ** 2.4


def _luminance(rgb) -> float:
    red, green, blue = (_linearize(channel) for channel in rgb)
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue


def _contrast(foreground, background) -> float:
    light = max(_luminance(foreground), _luminance(background))
    dark = min(_luminance(foreground), _luminance(background))
    return (light + 0.05) / (dark + 0.05)


@pytest.mark.parametrize("url_path,name", PAGES)
@pytest.mark.parametrize("scheme_name,scheme", SCHEMES)
def test_lumen_core_surfaces_meet_text_contrast(browser, base_url, url_path, name, scheme_name, scheme):
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    page.goto(f"{base_url}{url_path}", wait_until="networkidle")
    _set_color_scheme(page, scheme)

    failures = []
    for selector in CONTRAST_TARGETS:
        locator = page.locator(selector).first
        if locator.count() == 0 or not locator.is_visible():
            continue

        colors = locator.evaluate(
            """(el) => {
                const styles = window.getComputedStyle(el);
                let background = styles.backgroundColor;
                let current = el;
                while (
                    current &&
                    (background === 'rgba(0, 0, 0, 0)' || background === 'transparent')
                ) {
                    current = current.parentElement;
                    background = current ? window.getComputedStyle(current).backgroundColor : background;
                }
                return { color: styles.color, background };
            }"""
        )
        ratio = _contrast(_rgb_to_tuple(colors["color"]), _rgb_to_tuple(colors["background"]))
        if ratio < 4.5:
            failures.append(f"{selector}: {ratio:.2f} ({colors['color']} on {colors['background']})")

    context.close()
    assert not failures, f"Contrast failures on {name}/{scheme_name}: " + "; ".join(failures)


@pytest.mark.parametrize("url_path,name", PAGES)
def test_navigation_tabs_share_layout_metrics_except_canvas_state(browser, base_url, url_path, name):
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    page.goto(f"{base_url}{url_path}", wait_until="networkidle")

    metrics = page.locator(".md-tabs__link:visible").evaluate_all(
        """(links) => links.map((link) => {
            const styles = window.getComputedStyle(link);
            const rect = link.getBoundingClientRect();
            return {
                height: Math.round(rect.height),
                paddingLeft: styles.paddingLeft,
                paddingRight: styles.paddingRight,
                background: styles.backgroundColor,
                borderRadius: styles.borderRadius,
                fontSize: styles.fontSize,
                textTransform: styles.textTransform,
            };
        })"""
    )

    context.close()
    if len(metrics) < 2:
        assert len(metrics) == 1, "Expected one visible top navigation tab"
        return

    baseline = metrics[0]
    mismatches = [
        metric for metric in metrics[1:]
        if metric != baseline
    ]
    assert not mismatches, f"Top navigation tabs should share layout metrics on {name}: {mismatches}"
