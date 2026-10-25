"""A readable family story, accurate arrivals, and chapter changes without page jumps."""
import os
from pathlib import Path

import pytest
from playwright.sync_api import expect

YEARS = [2012, 2014, 2016, 2018, 2019, 2021, 2024, 2026, 2027]


def open_walk(page, base_url):
    page.goto(f"{base_url}/index.html#beyond-work", wait_until="networkidle")
    root = page.locator(".life-journey")
    root.scroll_into_view_if_needed()
    expect(root).to_have_class("studio-life life-journey life-ready")
    expect(root.locator(".life-scene")).to_have_attribute("data-scene-ready", "true")
    return root


def capture(page, root, name):
    if directory := os.environ.get("FAMILY_WALK_CAPTURES"):
        Path(directory).mkdir(parents=True, exist_ok=True)
        root.screenshot(path=str(Path(directory) / name))


@pytest.mark.parametrize("width,height", [(320, 740), (390, 844), (768, 1024), (1440, 1000)])
@pytest.mark.parametrize("scheme", ["default", "slate"])
def test_chapters_stay_readable_and_do_not_move_the_reader(browser, base_url, width, height, scheme):
    context = browser.new_context(viewport={"width": width, "height": height}, reduced_motion="reduce", has_touch=width < 1000)
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    if scheme == "slate":
        page.add_init_script("document.addEventListener('DOMContentLoaded', () => document.body.dataset.mdColorScheme = 'slate')")
    root = open_walk(page, base_url)
    scene = root.locator(".life-scene")
    story = root.locator(".life-story")
    root.locator(".life-controls").evaluate("el => el.scrollIntoView({block:'center'})")
    start_scroll = page.evaluate("scrollY")
    start_height = root.bounding_box()["height"]
    story_height = story.bounding_box()["height"]
    for year in YEARS:
        root.locator(f'[data-life-stop="{year}"]').evaluate("el => el.click()")
        expect(root).to_have_attribute("data-life-year", str(year))
        expect(root.locator(f"#life-{year}")).to_be_visible()
        expect(root.locator(".life-chapter:visible")).to_have_count(1)
        assert abs(page.evaluate("scrollY") - start_scroll) < 2
        assert abs(root.bounding_box()["height"] - start_height) < 2
        assert abs(story.bounding_box()["height"] - story_height) < 2
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
    expect(root.locator("#life-2027")).to_contain_text("expecting our third kiddo in 2027")
    expect(scene).to_have_attribute("aria-label", "The next chapter · Expected in 2027. One more on the way. Third kiddo expected in 2027.")
    root.locator('[data-life-stop="2026"]').evaluate("el => el.click()")
    capture(page, root, f"family-{width}-{scheme}-2026.png")
    if width in [390, 1440]:
        for year in [2012, 2016, 2019, 2027]:
            root.locator(f'[data-life-stop="{year}"]').evaluate("el => el.click()")
            capture(page, root, f"family-{width}-{scheme}-{year}.png")
    assert not errors, errors
    context.close()


def test_children_arrive_as_babies_then_grow_into_the_walk(page, base_url):
    page.emulate_media(reduced_motion="reduce")
    root = open_walk(page, base_url)
    first = root.locator(".life-child-first")
    second = root.locator(".life-child-second")
    third = root.locator(".life-future")
    expect(first).to_have_css("opacity", "0")
    expect(second).to_have_css("opacity", "0")
    root.locator('[data-life-stop="2019"]').click()
    expect(first).to_have_css("opacity", "1")
    expect(first.locator(".life-child-bundle")).not_to_have_css("display", "none")
    expect(first.locator(".life-child-bundle")).to_have_css("opacity", "1")
    expect(first.locator(".life-child-walker")).to_have_css("display", "none")
    root.locator('[data-life-stop="2021"]').click()
    expect(first.locator(".life-child-walker")).not_to_have_css("display", "none")
    root.locator('[data-life-stop="2024"]').click()
    expect(second).to_have_css("opacity", "1")
    expect(second.locator(".life-child-bundle")).not_to_have_css("display", "none")
    expect(second.locator(".life-child-bundle")).to_have_css("opacity", "1")
    root.locator('[data-life-stop="2026"]').click()
    expect(second.locator(".life-child-walker")).not_to_have_css("display", "none")
    expect(third).to_have_css("opacity", "0")
    root.locator('[data-life-stop="2027"]').click()
    expect(third).to_have_css("opacity", "1")
    expect(root.locator(".life-family-count")).to_contain_text("expected in 2027")


def test_relationship_dates_and_landscapes_match_the_story(page, base_url):
    page.emulate_media(reduced_motion="reduce")
    root = open_walk(page, base_url)
    expect(root.locator("#life-2012")).to_contain_text("Sunday school")
    root.locator('[data-life-stop="2014"]').click()
    expect(root.locator("#life-2014")).to_contain_text("started dating in 2014")
    expect(root.locator('[data-land="coast"].life-scenery')).to_have_css("opacity", "1")
    root.locator('[data-life-stop="2016"]').click()
    expect(root.locator("#life-2016")).to_contain_text("got married in 2016")
    expect(root.locator(".life-bunting")).to_have_css("opacity", "1")
    root.locator('[data-life-stop="2018"]').click()
    expect(root.locator('[data-land="spain"].life-scenery')).to_have_css("opacity", "1")
    root.locator('[data-life-stop="2019"]').click()
    expect(root.locator('[data-land="home"].life-scenery')).to_have_css("opacity", "1")


def test_play_pause_and_keyboard_scrubbing_are_safe(page, base_url):
    root = open_walk(page, base_url)
    original_leg = root.locator("#life-dad .life-leg-left").get_attribute("transform")
    play = root.locator(".life-play")
    play.click()
    expect(play).to_have_attribute("aria-pressed", "true")
    page.wait_for_timeout(700)
    expect(root).to_have_attribute("data-life-walking", "true")
    assert root.locator("#life-dad .life-leg-left").get_attribute("transform") != original_leg
    play.click()
    expect(play).to_have_attribute("aria-pressed", "false")
    page.wait_for_function("document.querySelector('.life-journey').dataset.lifeWalking === 'false'")
    geometry = root.locator(".life-person-dad").get_attribute("transform")
    page.wait_for_timeout(200)
    assert root.locator(".life-person-dad").get_attribute("transform") == geometry
    slider = root.locator(".life-range")
    slider.focus()
    page.keyboard.press("End")
    expect(root).to_have_attribute("data-life-year", "2027")
    expect(play).to_have_attribute("aria-pressed", "false")
    page.wait_for_function("document.querySelector('.life-journey').dataset.lifeWalking === 'false'")
    assert not page.locator('.life-scene [transform*="NaN"]').count()
    page.keyboard.press("Home")
    expect(root).to_have_attribute("data-life-year", "2012")


@pytest.mark.parametrize("scheme", ["default", "slate"])
def test_family_chapters_and_extra_pages_are_accessible(page, base_url, scheme):
    """Check the chapters and the recommendations at the end of the page."""
    from axe_playwright_python.sync_playwright import Axe
    page.emulate_media(reduced_motion="reduce")
    if scheme == "slate":
        page.add_init_script("document.addEventListener('DOMContentLoaded', () => document.body.dataset.mdColorScheme = 'slate')")
    root = open_walk(page, base_url)
    root.locator('[data-life-stop="2027"]').click()
    report = Axe().run(page, context={"include": [[".life-journey"], [".studio-recommendations"]]})
    violations = report.response.get("violations", [])
    assert not violations, [(v["id"], [(n["html"], n.get("failureSummary")) for n in v["nodes"]]) for v in violations]


def test_module_failure_keeps_the_written_story_available(page, base_url):
    page.route("**/studio-life/Journey.js", lambda route: route.abort())
    page.goto(f"{base_url}/index.html#beyond-work", wait_until="networkidle")
    root = page.locator(".life-journey")
    expect(root).to_have_class("studio-life life-journey life-fallback")
    expect(root.locator(".life-chapter:visible")).to_have_count(9)
    expect(root.locator(".life-controls")).not_to_be_visible()


def test_the_story_is_available_without_javascript(browser, base_url):
    context = browser.new_context(java_script_enabled=False)
    page = context.new_page()
    page.goto(f"{base_url}/index.html#beyond-work", wait_until="networkidle")
    root = page.locator(".life-journey")
    expect(root.locator(".life-chapter:visible")).to_have_count(9)
    expect(root.locator(".life-controls")).not_to_be_visible()
    context.close()


def test_walking_stops_when_the_scene_leaves_the_screen(page, base_url):
    root = open_walk(page, base_url)
    play = root.locator(".life-play")
    play.click()
    expect(play).to_have_attribute("aria-pressed", "true")
    page.locator("#connect").evaluate("el => el.scrollIntoView({block:'start'})")
    expect(play).to_have_attribute("aria-pressed", "false")
    page.wait_for_timeout(150)
    geometry = root.locator(".life-person-dad").get_attribute("transform")
    page.wait_for_timeout(200)
    assert root.locator(".life-person-dad").get_attribute("transform") == geometry


def test_delayed_enhancement_preserves_space_and_native_chapter_links(page, base_url):
    pending = []
    page.route("**/studio-life/Journey.js", lambda route: pending.append(route))
    page.goto(f"{base_url}/index.html#beyond-work", wait_until="domcontentloaded")
    root = page.locator(".life-journey")
    expect(root.locator(".life-controls")).to_be_visible()
    expect(root.locator(".life-range")).to_be_disabled()
    height = root.bounding_box()["height"]
    root.locator('[data-life-stop="2019"]').click()
    expect(root.locator("#life-2019")).to_be_visible()
    assert pending
    pending[0].continue_()
    expect(root).to_have_class("studio-life life-journey life-ready")
    expect(root).to_have_attribute("data-life-year", "2019")
    assert abs(root.bounding_box()["height"] - height) < 2


def test_family_profiles_and_post_service_beard(page, base_url):
    page.emulate_media(reduced_motion="reduce")
    root = open_walk(page, base_url)
    for character in ["life-dad", "life-mum", "life-kid"]:
        expect(root.locator(f"#{character} .life-eye")).to_have_count(1)
    beard = root.locator(".life-beard")
    for year in [2012, 2014, 2016, 2018, 2019]:
        root.locator(f'[data-life-stop="{year}"]').click()
        expect(beard).to_have_css("opacity", "0")
    for year in [2021, 2024, 2026, 2027]:
        root.locator(f'[data-life-stop="{year}"]').click()
        expect(beard).to_have_css("opacity", "1")


@pytest.mark.parametrize("width", [390, 1440])
def test_recommendations_follow_the_contact_section_without_a_resume_panel(browser, base_url, width):
    context = browser.new_context(viewport={"width": width, "height": 950}, reduced_motion="reduce")
    page = context.new_page()
    page.goto(f"{base_url}/index.html#connect", wait_until="networkidle")
    expect(page.locator(".life-more")).to_have_count(0)
    recommendations = page.locator(".studio-recommendations")
    expect(recommendations.locator("blockquote")).to_have_count(3)
    expect(recommendations.locator("figcaption strong")).to_have_text(["Viren Ghone", "Vignesh Kumar A C", "Jim Schenkelberg"])
    assert recommendations.bounding_box()["y"] >= page.locator(".studio-contact").bounding_box()["y"] + page.locator(".studio-contact").bounding_box()["height"]
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
    capture(page, recommendations, f"recommendations-{width}.png")
    context.close()


def scrub_to(root, year):
    root.locator(".life-range").evaluate("(el, year) => { el.value = year; el.dispatchEvent(new Event('input', {bubbles:true})); }", year)


def test_appearance_changes_follow_the_personal_chapters(page, base_url):
    page.emulate_media(reduced_motion="reduce")
    root = open_walk(page, base_url)
    for year in [2012, 2016, 2019]:
        scrub_to(root, year)
        expect(root.locator(".life-hair-full")).to_have_css("opacity", "1")
        expect(root.locator(".life-hair-thin")).to_have_css("opacity", "0")
        expect(root.locator(".life-beard")).to_have_css("opacity", "0")
        expect(root.locator(".life-hat")).to_have_css("opacity", "0")
    for year in [2021, 2023]:
        scrub_to(root, year)
        expect(root.locator(".life-hair-thin")).to_have_css("opacity", "1")
        expect(root.locator(".life-beard")).to_have_css("opacity", "1")
        expect(root.locator(".life-hat")).to_have_css("opacity", "0")
    scrub_to(root, 2024)
    expect(root.locator(".life-hat")).to_have_css("opacity", "1")


def test_growing_into_walking_blends_the_child_and_the_parent_pose(page, base_url):
    page.emulate_media(reduced_motion="reduce")
    root = open_walk(page, base_url)
    values = []
    for year in [2020.1, 2020.2, 2020.3, 2020.4]:
        scrub_to(root, year)
        values.append(root.locator(".life-child-first").evaluate("""el => ({
          baby:Number(getComputedStyle(el.querySelector('.life-child-bundle')).opacity),
          walking:Number(getComputedStyle(el.querySelector('.life-child-walker')).opacity),
          carry:Number(getComputedStyle(document.querySelector('.life-front-hand[data-parent="mum"]')).opacity),
          x:el.querySelector('.life-child-walker').transform.baseVal.consolidate().matrix.e,
          y:el.querySelector('.life-child-walker').transform.baseVal.consolidate().matrix.f
        })"""))
    assert all(0 < value["baby"] < 1 and 0 < value["walking"] < 1 for value in values)
    assert all(abs(value["baby"] + value["walking"] - 1) < .01 for value in values)
    assert all(abs(value["baby"] - value["carry"]) < .01 for value in values)
    assert all(first["walking"] < second["walking"] and first["y"] < second["y"] for first, second in zip(values, values[1:]))
    assert max(value["x"] for value in values) - min(value["x"] for value in values) < 1


def test_the_third_baby_is_carried_like_the_other_arrivals(page, base_url):
    page.emulate_media(reduced_motion="reduce")
    root = open_walk(page, base_url)
    scrub_to(root, 2027)
    baby = root.locator(".life-future")
    expect(baby).to_have_css("opacity", "1")
    expect(baby.locator('use[href="#life-infant"]')).to_have_count(1)
    expect(root.locator('.life-front-hand[data-parent="mum"]')).to_have_css("opacity", "1")
    infant = baby.bounding_box()
    mum = root.locator(".life-person-mum").bounding_box()
    assert abs(infant["x"] + infant["width"] / 2 - mum["x"] - mum["width"] / 2) < mum["width"]
    assert infant["y"] + infant["height"] < mum["y"] + mum["height"] * .8


def test_retargeting_a_walk_preserves_the_current_pose_and_scroll(page, base_url):
    root = open_walk(page, base_url)
    root.locator(".life-controls").evaluate("el => el.scrollIntoView({block:'center'})")
    scroll = page.evaluate("scrollY")
    for year in [2027, 2019, 2024]:
        before, after = root.evaluate("""(el, year) => {
          const dad=el.querySelector('.life-person-dad');
          const before=dad.getAttribute('transform');
          el.querySelector('[data-life-stop="'+year+'"]').click();
          return [before,dad.getAttribute('transform')];
        }""", year)
        assert before == after
        page.wait_for_timeout(200)
        assert abs(page.evaluate("scrollY") - scroll) < 2
    page.wait_for_function("document.querySelector('.life-journey').dataset.lifeWalking === 'false'")
    expect(root).to_have_attribute("data-life-year", "2024")
    assert not root.locator('[transform*="NaN"]').count()


@pytest.mark.parametrize("width", [390, 1440])
def test_later_hair_keeps_coverage_before_the_hat(browser, base_url, width):
    context = browser.new_context(viewport={"width": width, "height": 950}, reduced_motion="reduce")
    page = context.new_page()
    root = open_walk(page, base_url)
    scrub_to(root, 2021)
    expect(root.locator(".life-hat")).to_have_css("opacity", "0")
    young = root.locator(".life-hair-full").bounding_box()
    later = root.locator(".life-hair-thin").bounding_box()
    assert later["width"] >= young["width"] * .8
    assert later["height"] >= young["height"] * .8
    capture(page, root, f"family-{width}-hair-2021.png")
    context.close()


def test_arm_joints_keep_their_lengths_through_carrying_and_release(page, base_url):
    page.emulate_media(reduced_motion="reduce")
    root = open_walk(page, base_url)
    for year in [2012, 2018.5, 2019, 2020.2, 2020.5, 2021, 2023.5, 2024, 2025.4, 2026, 2026.5, 2027]:
        scrub_to(root, year)
        chains = root.locator(".life-arm").evaluate_all("""arms => arms.map(arm => {
          const forearm = arm.querySelector('.life-forearm'), hand = arm.querySelector('.life-hand');
          const a=arm.transform.baseVal.consolidate().matrix;
          const b=a.multiply(forearm.transform.baseVal.consolidate().matrix);
          const c=b.multiply(hand.transform.baseVal.consolidate().matrix);
          const p=new DOMPoint(0,0).matrixTransform(a), q=new DOMPoint(0,0).matrixTransform(b), r=new DOMPoint(0,0).matrixTransform(c);
          return {upper:Math.hypot(q.x-p.x,q.y-p.y),lower:Math.hypot(r.x-q.x,r.y-q.y), expectedUpper:Number(arm.dataset.upper),expectedLower:Number(arm.dataset.lower),opacity:getComputedStyle(arm).opacity};
        })""")
        assert len(chains) == 6
        for chain in chains:
            assert abs(chain["upper"] - chain["expectedUpper"]) < .01
            assert abs(chain["lower"] - chain["expectedLower"]) < .01
            assert chain["opacity"] == "1"
        assert not root.locator('[transform*="NaN"]').count()


@pytest.mark.parametrize("width", [390, 1440])
def test_carrying_hands_and_close_up_poses(browser, base_url, width):
    context = browser.new_context(viewport={"width": width, "height": 1000}, device_scale_factor=3, reduced_motion="reduce")
    page = context.new_page()
    root = open_walk(page, base_url)
    for year, parent, baby in [(2019, "mum", ".life-child-first .life-child-bundle"), (2024, "dad", ".life-child-second .life-child-bundle"), (2027, "mum", ".life-future")]:
        scrub_to(root, year)
        hand = root.locator(f'.life-front-hand[data-parent="{parent}"]')
        expect(hand).to_have_css("opacity", "1")
        a, b = hand.bounding_box(), root.locator(baby).bounding_box()
        assert a["x"] < b["x"] + b["width"] and a["x"] + a["width"] > b["x"]
        assert a["y"] < b["y"] + b["height"] and a["y"] + a["height"] > b["y"] + b["height"] * .35
        if directory := os.environ.get("FAMILY_HAND_CAPTURES"):
            Path(directory).mkdir(parents=True, exist_ok=True)
            root.locator(f".life-person-{parent}").evaluate("el => el.scrollIntoView({block:'center'})")
            box = root.locator(f".life-person-{parent}").bounding_box()
            clip = {"x":max(0,box["x"]-25),"y":max(0,box["y"]-15),"width":box["width"]+70,"height":box["height"]+30}
            clip["width"] = min(clip["width"], width-clip["x"])
            page.screenshot(path=str(Path(directory)/f"carry-{width}-{year}-{parent}.png"),clip=clip)
    if directory := os.environ.get("FAMILY_HAND_CAPTURES"):
        for year, parent in [(2018.8,"mum"),(2020.4,"mum"),(2023.8,"dad"),(2025.4,"dad"),(2026.8,"mum")]:
            scrub_to(root, year)
            root.locator(f".life-person-{parent}").evaluate("el => el.scrollIntoView({block:'center'})")
            box = root.locator(f".life-person-{parent}").bounding_box()
            clip = {"x":max(0,box["x"]-25),"y":max(0,box["y"]-15),"width":box["width"]+100,"height":box["height"]+35}
            clip["width"] = min(clip["width"], width-clip["x"])
            page.screenshot(path=str(Path(directory)/f"transition-{width}-{year}-{parent}.png"),clip=clip)
    context.close()


def test_grip_tracks_the_baby_during_the_walking_bob(page, base_url):
    root = open_walk(page, base_url)
    scrub_to(root, 2019)
    root.locator(".life-play").click()
    samples = page.evaluate("""async () => {
      const points=[];
      for(let i=0;i<12;i++) {
        await new Promise(resolve=>requestAnimationFrame(resolve));
        const hand=document.querySelector('.life-front-hand[data-parent="mum"]').getBoundingClientRect();
        const baby=document.querySelector('.life-child-first .life-child-bundle').getBoundingClientRect();
        points.push({x:hand.x-baby.x,y:hand.y-baby.y,top:baby.y});
      }
      return points;
    }""")
    assert max(p["top"] for p in samples)-min(p["top"] for p in samples) > .1
    assert max(p["x"] for p in samples)-min(p["x"] for p in samples) < .5
    assert max(p["y"] for p in samples)-min(p["y"] for p in samples) < .5


def test_child_steps_away_after_the_carrying_pose_is_released(page, base_url):
    page.emulate_media(reduced_motion="reduce")
    root = open_walk(page, base_url)
    scrub_to(root, 2025.25)
    baby = root.locator(".life-child-second .life-child-bundle")
    assert float(baby.evaluate("el => getComputedStyle(el).opacity")) > 0
    dad = root.locator(".life-person-dad").bounding_box()
    child = root.locator(".life-child-second .life-child-walker").bounding_box()
    assert child["x"] < dad["x"] + dad["width"] + 20
    scrub_to(root, 2025.6)
    expect(baby).to_have_css("opacity", "0")
    expect(root.locator('.life-front-hand[data-parent="dad"]')).to_have_css("opacity", "0")
    starting_x = root.locator(".life-child-second .life-child-walker").bounding_box()["x"]
    scrub_to(root, 2026)
    assert root.locator(".life-child-second .life-child-walker").bounding_box()["x"] > starting_x + 50
