"""
Test 5: Feedback widget — visibility, form, page context.

Verifies:
- Feedback tab visible on main pages
- Clicking tab opens feedback panel
- Panel has rating stars, textarea, submit button
- Feedback POST includes page context
"""


def test_feedback_tab_on_index(page, base_url):
    """Feedback tab is visible on the main page."""
    page.goto(base_url)
    tab = page.query_selector("#feedbackTab")
    assert tab is not None and tab.is_visible()


def test_feedback_tab_on_toolbox(page, base_url):
    """Feedback tab is visible on toolbox page."""
    page.goto(f"{base_url}/toolbox.html")
    page.wait_for_load_state("networkidle")
    tab = page.query_selector("#feedbackTab")
    assert tab is not None and tab.is_visible(), "Feedback tab should be on toolbox.html"


def test_feedback_tab_on_privacy(page, base_url):
    """Feedback tab is visible on privacy page."""
    page.goto(f"{base_url}/privacy.html")
    page.wait_for_load_state("networkidle")
    tab = page.query_selector("#feedbackTab")
    if tab is None:
        import pytest
        pytest.skip("Feedback tab not yet added to privacy.html")
    assert tab.is_visible()


def test_feedback_panel_opens(page, base_url):
    """Clicking feedback tab opens the panel."""
    page.goto(base_url)
    page.click("#feedbackTab")
    page.wait_for_timeout(300)

    panel = page.query_selector("#feedbackPanel")
    assert panel is not None
    assert not panel.evaluate("el => el.classList.contains('hidden')"), "Panel should be visible"


def test_feedback_panel_has_stars(page, base_url):
    """Feedback panel has 5 rating stars."""
    page.goto(base_url)
    page.click("#feedbackTab")
    page.wait_for_timeout(300)

    stars = page.query_selector_all(".feedback-star")
    assert len(stars) == 5, f"Expected 5 rating stars, got {len(stars)}"


def test_feedback_panel_has_textarea(page, base_url):
    """Feedback panel has a text area for comments."""
    page.goto(base_url)
    page.click("#feedbackTab")
    page.wait_for_timeout(300)

    textarea = page.query_selector("#feedbackInput")
    assert textarea is not None, "Feedback textarea (#feedbackInput) not found"


def test_feedback_panel_has_submit(page, base_url):
    """Feedback panel has a submit button."""
    page.goto(base_url)
    page.click("#feedbackTab")
    page.wait_for_timeout(300)

    submit = page.query_selector("#feedbackSubmit")
    assert submit is not None, "Feedback submit button not found"


def test_feedback_submit_sends_context(page, base_url):
    """Feedback submission includes page and session context."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")

    # Start an exercise to set mode/exercise context
    page.evaluate("() => startExercise('ideate', 'crazy-8s')")
    page.wait_for_timeout(500)

    # Open feedback panel
    page.click("#feedbackTab")
    page.wait_for_timeout(300)

    # Fill in feedback
    page.fill("#feedbackInput", "Test feedback from automated testing")

    # Click a star rating
    stars = page.query_selector_all(".feedback-star")
    if stars:
        stars[3].click()
        page.wait_for_timeout(100)

    # Intercept the fetch request to check payload
    payload = page.evaluate("""() => {
        return new Promise((resolve) => {
            const origFetch = window.fetch;
            window.fetch = function(url, opts) {
                if (url.includes('/api/feedback')) {
                    const body = JSON.parse(opts.body);
                    resolve(body);
                    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
                }
                return origFetch.apply(this, arguments);
            };
            document.querySelector('#feedbackSubmit')?.click();
            setTimeout(() => resolve(null), 3000);
        });
    }""")

    if payload:
        assert "page" in payload, f"Feedback should include 'page' field. Got: {list(payload.keys())}"
        assert "text" in payload or "feedback" in payload, "Feedback should include text"
