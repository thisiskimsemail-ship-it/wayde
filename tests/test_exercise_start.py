"""
Test 2: Entering the studio and starting a session.

The user flow is: Welcome → "Step into Wade" → routing chat begins.
Exercise buttons don't exist as static HTML — the tool picker in the
session bar dropdown is the way to select a specific exercise.

Verifies:
- Clicking Enter Studio enters routing mode
- Body gets in-session class and data-mode
- Welcome hides
- Session bar appears
- Input area becomes visible
- Starting a specific exercise via JS sets correct state
"""


def test_enter_studio_starts_routing(page, base_url):
    """Clicking 'Step into Wade' enters routing mode."""
    page.goto(base_url)
    page.wait_for_selector("#enterStudioBtn")
    page.click("#enterStudioBtn")
    page.wait_for_timeout(1000)

    mode = page.get_attribute("body", "data-mode")
    assert mode == "routing", f"Expected routing, got {mode}"


def test_body_in_session_after_enter(page, base_url):
    """Body gets 'in-session' class after entering studio."""
    page.goto(base_url)
    page.wait_for_selector("#enterStudioBtn")
    page.click("#enterStudioBtn")
    page.wait_for_timeout(500)

    has_class = page.evaluate("() => document.body.classList.contains('in-session')")
    assert has_class, "Body should have 'in-session' class"


def test_welcome_hides_after_enter(page, base_url):
    """Welcome section hides after entering studio."""
    page.goto(base_url)
    page.wait_for_selector("#enterStudioBtn")
    page.click("#enterStudioBtn")
    page.wait_for_timeout(500)

    is_hidden = page.evaluate("() => document.getElementById('welcome').classList.contains('hidden')")
    assert is_hidden, "Welcome should be hidden"


def test_session_bar_visible_after_exercise(page, base_url):
    """Session bar appears after starting a specific exercise."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    page.evaluate("() => startExercise('ideate', 'crazy-8s')")
    page.wait_for_timeout(500)

    bar = page.query_selector("#sessionBar")
    assert bar is not None
    is_hidden = bar.evaluate("el => el.classList.contains('hidden')")
    assert not is_hidden, "Session bar should be visible after starting exercise"


def test_start_exercise_via_js(page, base_url):
    """Starting an exercise programmatically sets correct mode and exercise."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")

    # Start exercise directly via JS (simulates what happens after routing)
    page.evaluate("""() => {
        startExercise('ideate', 'crazy-8s');
    }""")
    page.wait_for_timeout(500)

    mode = page.get_attribute("body", "data-mode")
    assert mode == "ideate", f"Expected ideate, got {mode}"

    has_session = page.evaluate("() => document.body.classList.contains('in-session')")
    assert has_session, "Body should have in-session class"


def test_stage_colour_applied_after_exercise_start(page, base_url):
    """Stage colour CSS variable matches the selected stage."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")

    page.evaluate("() => startExercise('debate', 'pre-mortem')")
    page.wait_for_timeout(500)

    stage_color = page.evaluate("""() => {
        return getComputedStyle(document.body).getPropertyValue('--stage-color').trim();
    }""")
    assert stage_color.upper() == "#27BDBE", f"Expected teal #27BDBE, got {stage_color}"


def test_board_toggle_visible_in_session(page, base_url):
    """Board toggle button exists in session bar."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")

    page.evaluate("() => startExercise('reframe', 'five-whys')")
    page.wait_for_timeout(500)

    board_toggle = page.query_selector("#boardToggle")
    assert board_toggle is not None, "Board toggle not found"


def test_all_modes_set_correct_colour(page, base_url):
    """Each mode sets the correct stage colour."""
    expected = {
        "reframe": "#F15A22",
        "ideate": "#ED3694",
        "debate": "#27BDBE",
        "framework": "#E4E517",
    }
    exercises = {
        "reframe": "five-whys",
        "ideate": "crazy-8s",
        "debate": "pre-mortem",
        "framework": "lean-canvas",
    }

    for mode, expected_color in expected.items():
        page.goto(base_url)
        page.wait_for_load_state("networkidle")
        page.evaluate(f"() => startExercise('{mode}', '{exercises[mode]}')")
        page.wait_for_timeout(500)

        stage_color = page.evaluate("""() => {
            return getComputedStyle(document.body).getPropertyValue('--stage-color').trim();
        }""")
        assert stage_color.upper() == expected_color, \
            f"{mode}: expected {expected_color}, got {stage_color}"
