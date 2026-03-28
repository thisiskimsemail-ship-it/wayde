"""
Test 4: Light mode — theme switching, yellow→navy override, visual consistency.

Verifies:
- Theme toggle switches to light mode
- CSS variables update for light theme
- Framework stage uses navy (#1E194F) instead of yellow in light mode
- Other stages keep their colours in light mode
- Feedback button visible in light mode
"""


def test_light_mode_background(page, base_url):
    """Light mode sets light background colour."""
    page.goto(base_url)
    page.click("#themeToggle")
    page.wait_for_timeout(300)

    bg = page.evaluate("""() => {
        return getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    }""")
    assert bg.upper() == "#F6F5F5", f"Light mode bg should be #F6F5F5, got {bg}"


def test_light_mode_text_colour(page, base_url):
    """Light mode sets navy text colour."""
    page.goto(base_url)
    page.click("#themeToggle")
    page.wait_for_timeout(300)

    text = page.evaluate("""() => {
        return getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
    }""")
    assert text.upper() == "#1E194F", f"Light mode text should be #1E194F, got {text}"


def test_framework_yellow_to_navy_in_light(page, base_url):
    """Framework stage uses navy instead of yellow in light mode."""
    page.goto(base_url)
    page.click("#themeToggle")
    page.wait_for_timeout(300)

    # Start framework exercise via JS
    page.evaluate("() => startExercise('framework', 'lean-canvas')")
    page.wait_for_timeout(500)

    stage_color = page.evaluate("""() => {
        return getComputedStyle(document.body).getPropertyValue('--stage-color').trim();
    }""")
    assert stage_color.upper() == "#1E194F", f"Framework in light mode should be navy, got {stage_color}"


def test_other_stages_keep_colour_in_light(page, base_url):
    """Non-framework stages keep their colour in light mode."""
    expected = {
        "reframe": ("#F15A22", "five-whys"),
        "ideate": ("#ED3694", "crazy-8s"),
        "debate": ("#27BDBE", "pre-mortem"),
    }

    for mode, (expected_color, exercise) in expected.items():
        page.goto(base_url)
        page.wait_for_load_state("networkidle")
        page.click("#themeToggle")
        page.wait_for_timeout(300)

        page.evaluate(f"() => startExercise('{mode}', '{exercise}')")
        page.wait_for_timeout(500)

        stage_color = page.evaluate("""() => {
            return getComputedStyle(document.body).getPropertyValue('--stage-color').trim();
        }""")
        assert stage_color.upper() == expected_color, \
            f"{mode} in light mode: expected {expected_color}, got {stage_color}"


def test_feedback_visible_in_light_mode(page, base_url):
    """Feedback button is visible in light mode."""
    page.goto(base_url)
    page.click("#themeToggle")
    page.wait_for_timeout(300)

    feedback = page.query_selector("#feedbackTab")
    assert feedback is not None and feedback.is_visible()
