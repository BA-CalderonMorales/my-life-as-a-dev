from pathlib import Path
from playwright.sync_api import Page, expect


ROOT = Path(__file__).resolve().parents[2]
HEADER_CSS = (ROOT / "docs" / "assets" / "css" / "header-version.css").read_text(
    encoding="utf-8"
)


HEADER_FIXTURE = f"""
<!doctype html>
<html>
<head>
  <style>
    :root {{
      --md-default-bg-color: rgb(11, 12, 15);
      --md-default-fg-color: rgb(245, 245, 240);
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    }}
    html, body {{
      margin: 0;
      min-height: 100%;
      background: var(--md-default-bg-color);
      color: var(--md-default-fg-color);
      font-family: Inter, Arial, sans-serif;
    }}
    .md-header__inner {{
      display: flex;
      flex-wrap: nowrap;
      max-width: 100%;
      padding: 0 1rem;
    }}
    .md-header__title {{
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      font-family: var(--font-mono);
      text-transform: uppercase;
    }}
    .md-header__ellipsis {{
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }}
    .md-header__button {{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
    }}
    .md-tabs__list {{
      display: flex;
      gap: 1.75rem;
      margin: 0;
      padding: 0 1rem;
      list-style: none;
    }}
    .md-tabs__link {{
      box-sizing: border-box;
    }}
    {HEADER_CSS}
  </style>
</head>
<body>
  <header class="md-header">
    <nav class="md-header__inner md-grid" aria-label="Header">
      <a href="/" title="Brandon's Simplified Life" class="md-header__button md-logo" aria-label="Brandon's Simplified Life">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <rect width="24" height="24" fill="#64d2c8"></rect>
        </svg>
      </a>
      <div class="md-header__title" data-md-component="header-title">
        <div class="md-header__ellipsis">
          <div class="md-header__topic">BRANDON'S SIMPLIFIED LIFE</div>
          <div class="md-header__topic" data-md-component="header-topic">Home</div>
        </div>
      </div>
      <div class="md-version" id="md-version-selector">
        <button class="md-version__current" type="button">
          <span class="md-version__label">0.5.74</span>
        </button>
      </div>
    </nav>
  </header>
  <nav class="md-tabs">
    <ul class="md-tabs__list">
      <li><a class="md-tabs__link md-tabs__link--active">Home</a></li>
      <li><a class="md-tabs__link">Learning</a></li>
      <li><a class="md-tabs__link">Docs-as-Code</a></li>
    </ul>
  </nav>
</body>
</html>
"""


def _header_metrics(page: Page):
    return page.evaluate(
        """() => {
            const get = (selector) => document.querySelector(selector);
            const rect = (el) => {
                const r = el.getBoundingClientRect();
                return {
                    x: r.x,
                    y: r.y,
                    width: r.width,
                    height: r.height,
                    top: r.top,
                    bottom: r.bottom
                };
            };
            const styles = (el) => getComputedStyle(el);
            const header = get('.md-header');
            const tabs = get('.md-tabs');
            const logo = get('.md-logo');
            const topic = get('.md-header__topic');
            const title = get('.md-header__title');
            const logoRect = rect(logo);
            const topicRect = rect(topic);
            return {
                header: rect(header),
                tabs: tabs ? rect(tabs) : null,
                logo: logoRect,
                topic: topicRect,
                title: rect(title),
                text: topic.innerText.trim(),
                logoCenterY: logoRect.top + logoRect.height / 2,
                topicCenterY: topicRect.top + topicRect.height / 2,
                headerBg: styles(header).backgroundColor,
                tabsBg: tabs ? styles(tabs).backgroundColor : null,
                titleFontSize: styles(title).fontSize,
                topicOverflow: styles(topic).overflow,
            };
        }"""
    )


def _open_header_fixture(page: Page):
    page.set_content(HEADER_FIXTURE)


def test_desktop_header_aligns_logo_site_name_and_tabs(page: Page):
    page.set_viewport_size({"width": 1440, "height": 900})
    _open_header_fixture(page)

    metrics = _header_metrics(page)

    assert metrics["text"] == "BRANDON'S SIMPLIFIED LIFE"
    assert abs(metrics["logoCenterY"] - metrics["topicCenterY"]) <= 2
    assert metrics["logo"]["x"] < metrics["topic"]["x"]
    assert metrics["headerBg"] == metrics["tabsBg"]
    assert metrics["header"]["height"] >= 60


def test_mobile_header_keeps_site_name_visible_and_centered(page: Page):
    page.set_viewport_size({"width": 390, "height": 844})
    _open_header_fixture(page)

    metrics = _header_metrics(page)

    assert metrics["text"].startswith("BRANDON'S")
    assert metrics["topic"]["top"] >= metrics["header"]["top"]
    assert metrics["topic"]["bottom"] <= metrics["header"]["bottom"]
    topic_center = metrics["topic"]["top"] + metrics["topic"]["height"] / 2
    header_center = metrics["header"]["top"] + metrics["header"]["height"] / 2
    assert abs(topic_center - header_center) <= 2
    expect(page.locator(".md-header__topic").nth(0)).to_be_visible()
