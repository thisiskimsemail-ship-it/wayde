"""
Test 1: Welcome screen rendering.

Verifies:
- Page loads without JS errors
- Welcome heading shows 'The Studio'
- 'Step into Wade' enter button exists
- Input area exists (hidden on welcome)
- Feedback button is present
- Dark/light theme toggle works
- Brand colours are correct in CSS
"""


def test_page_loads_no_errors(page, base_url):
    """Page loads without console errors."""
    errors = []
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    critical = [e for e in errors if "favicon" not in e.lower()]
    assert len(critical) == 0, f"Console errors: {critical}"


def test_welcome_heading(page, base_url):
    """Welcome screen shows 'The Studio' heading."""
    page.goto(base_url)
    page.wait_for_selector("#welcome")
    heading = page.text_content(".welcome-title")
    assert "Studio" in heading


def test_enter_studio_button(page, base_url):
    """'Step into Wade' button exists and is visible."""
    page.goto(base_url)
    btn = page.query_selector("#enterStudioBtn")
    assert btn is not None, "Enter Studio button not found"
    assert btn.is_visible(), "Enter Studio button should be visible"


def test_input_area_exists(page, base_url):
    """Input area with text field exists."""
    page.goto(base_url)
    input_field = page.query_selector("#inputField")
    assert input_field is not None, "Input field not found"


def test_feedback_button(page, base_url):
    """Feedback button is present and visible."""
    page.goto(base_url)
    feedback = page.query_selector("#feedbackTab")
    assert feedback is not None, "Feedback tab not found"
    assert feedback.is_visible(), "Feedback tab not visible"


def test_theme_toggle(page, base_url):
    """Light/dark theme toggle changes html data-theme."""
    page.goto(base_url)
    theme = page.get_attribute("html", "data-theme")
    assert theme is None or theme == "dark", f"Expected dark theme, got '{theme}'"

    toggle = page.query_selector("#themeToggle")
    if toggle:
        toggle.click()
        page.wait_for_timeout(300)
        theme = page.get_attribute("html", "data-theme")
        assert theme == "light", f"Expected light after toggle, got '{theme}'"


def test_brand_colours_in_css(page, base_url):
    """CSS custom properties define the correct brand colours."""
    page.goto(base_url)
    colours = page.evaluate("""() => {
        const s = getComputedStyle(document.documentElement);
        return {
            orange: s.getPropertyValue('--orange').trim(),
            pink: s.getPropertyValue('--pink').trim(),
            teal: s.getPropertyValue('--teal').trim(),
            yellow: s.getPropertyValue('--yellow').trim()
        };
    }""")
    assert colours["orange"].upper() == "#F15A22", f"Orange: {colours['orange']}"
    assert colours["pink"].upper() == "#ED3694", f"Pink: {colours['pink']}"
    assert colours["teal"].upper() == "#27BDBE", f"Teal: {colours['teal']}"
    assert colours["yellow"].upper() == "#E4E517", f"Yellow: {colours['yellow']}"
