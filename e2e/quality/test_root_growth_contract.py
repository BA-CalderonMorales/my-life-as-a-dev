"""
Root growth contract - the behavioral truth of the root system.

The reveal lives on the MASK STROKES inside <mask>: each tapered organ
body is clipped by white centerline strokes whose dashoffset windows
follow the tier springs. Rest shows zero root ink; scrolling grows tier
by tier; the grown state draws every stroke; reduced motion shows the
full static system. Mobile-standard runs first because it is the
reference viewport.
"""

import pytest

HIDE_EPSILON = 0.002
DRAWN_EPSILON = 0.02

# The mask strokes that carry the reveal, and the field underlay that
# still draws with plain stroke dashes until the field swaps to fills.
REVEAL_SELECTORS = (
    ".life-tree__root",
    ".life-roots-field__root",
)


def _offsets(page, selector):
    return page.evaluate(
        """
        (selector) => Array.from(document.querySelectorAll(selector)).map((el) => {
            const raw = parseFloat(getComputedStyle(el).strokeDashoffset);
            const width = parseFloat(getComputedStyle(el).strokeWidth);
            return { offset: Number.isFinite(raw) ? raw : 1, width };
        })
        """,
        selector,
    )


def _scroll_to_progress(page, fraction):
    y = page.evaluate(
        """
        (fraction) => {
            const root = document.querySelector('[data-life-index]');
            const journey = root.querySelector('[data-life-journey]');
            const stage = root.querySelector('.life-stage');
            const top = journey.getBoundingClientRect().top + window.scrollY;
            const range = journey.offsetHeight - stage.offsetHeight;
            if (range > 0) return top + range * fraction;
            return document.documentElement.scrollHeight - window.innerHeight;
        }
        """,
        fraction,
    )
    page.evaluate(f"window.scrollTo(0, {y})")
    page.wait_for_timeout(1800)


def test_rest_hides_every_root(browser, base_url):
    context = browser.new_context(viewport={"width": 390, "height": 844})
    page = context.new_page()
    page.goto(f"{base_url}/index.html", wait_until="networkidle")
    page.wait_for_timeout(500)

    for selector in REVEAL_SELECTORS:
        paths = _offsets(page, selector)
        assert paths, f"{selector}: no paths found"
        hidden = [p for p in paths if p["offset"] >= 1 - HIDE_EPSILON]
        assert len(hidden) == len(paths), (
            f"rest must show zero root ink; "
            f"{len(paths) - len(hidden)}/{len(paths)} of {selector} already drawn"
        )
    context.close()


def test_grown_draws_every_root(browser, base_url):
    for viewport in ({"width": 390, "height": 844}, {"width": 1440, "height": 900}):
        context = browser.new_context(viewport=viewport)
        page = context.new_page()
        page.goto(f"{base_url}/index.html", wait_until="networkidle")
        _scroll_to_progress(page, 0.55)

        for selector in REVEAL_SELECTORS:
            paths = _offsets(page, selector)
            assert paths, f"{viewport}: {selector} missing"
            undrawn = [p for p in paths if p["offset"] > DRAWN_EPSILON]
            assert not undrawn, (
                f"{viewport}: grown system incomplete for {selector}; "
                f"{len(undrawn)} paths still at offset > {DRAWN_EPSILON}"
            )
        context.close()


def test_growth_is_tier_ordered(browser, base_url):
    """Early in the scroll, heavy wood leads and fine feeders wait."""
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    page.goto(f"{base_url}/index.html", wait_until="networkidle")
    _scroll_to_progress(page, 0.20)

    # The reveal lives on the mask strokes; tiers are explicit classes.
    primary = _offsets(page, ".life-tree__root--primary")
    lateral = _offsets(page, ".life-tree__root--lateral")
    fine = _offsets(page, ".life-tree__root--fine")
    assert len(primary) >= 4 and lateral and fine, (
        "expected organ tiers present in the masks"
    )

    drawn_primary = sum(1 for p in primary if p["offset"] < 1 - HIDE_EPSILON)
    finished_primary = sum(1 for p in primary if p["offset"] <= DRAWN_EPSILON)
    drawn_fine = sum(1 for p in fine if p["offset"] < 1 - HIDE_EPSILON)
    drawn_lateral = sum(1 for p in lateral if p["offset"] < 1 - HIDE_EPSILON)
    assert drawn_primary >= 2, "primaries should be emerging by progress 0.20"
    assert finished_primary < len(primary), (
        "some heavy wood must still be growing at progress 0.20"
    )
    assert drawn_fine == 0, (
        "fine feeders must not lead the primaries at progress 0.20"
    )
    assert drawn_lateral <= drawn_primary, (
        "laterals must not outrun their primaries' actual growth"
    )
    context.close()


def test_reduced_motion_shows_static_roots(browser, base_url):
    context = browser.new_context(
        viewport={"width": 390, "height": 844},
        reduced_motion="reduce",
    )
    page = context.new_page()
    page.goto(f"{base_url}/index.html", wait_until="networkidle")
    page.wait_for_timeout(500)

    for selector in REVEAL_SELECTORS:
        paths = _offsets(page, selector)
        assert paths, f"{selector}: no paths found"
        undrawn = [p for p in paths if p["offset"] > DRAWN_EPSILON]
        assert not undrawn, (
            f"reduced motion must show fully drawn static roots; "
            f"{len(undrawn)}/{len(paths)} of {selector} hidden"
        )
    context.close()
