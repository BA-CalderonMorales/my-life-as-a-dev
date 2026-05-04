from playwright.sync_api import Page, expect


def test_version_selector_opens_without_duplicate_chevrons(page: Page, base_url: str):
    page.goto(f"{base_url}/canvas/glacial-caverns/")
    page.wait_for_load_state("networkidle")

    selector = page.locator("#md-version-selector")
    button = selector.locator(".md-version__current")
    listbox = selector.locator(".md-version__list")

    expect(selector).to_be_visible()
    expect(button.locator("svg")).to_have_count(1)

    pseudo_content = button.evaluate(
        "(el) => getComputedStyle(el, '::after').content"
    )
    assert pseudo_content in ("none", '""'), "Material's native chevron should be disabled"

    button.click()

    assert "md-version--active" in (selector.get_attribute("class") or "")
    expect(listbox).to_be_visible()
    links = listbox.locator(".md-version__link")
    expect(links.first()).to_be_visible()
    assert links.count() >= 2
    current_version = selector.locator(".md-version__label").inner_text()
    assert current_version.count(".") >= 2


def test_version_selector_preserves_current_page_links(page: Page, base_url: str):
    page.goto(f"{base_url}/canvas/glacial-caverns/")
    page.wait_for_load_state("networkidle")

    page.locator("#md-version-selector .md-version__current").click()
    first_link = page.locator("#md-version-selector .md-version__link").first()
    current_version = page.locator("#md-version-selector .md-version__label").inner_text()

    expect(first_link).to_have_attribute(
        "href",
        f"{base_url}/{current_version}/canvas/glacial-caverns/",
    )
