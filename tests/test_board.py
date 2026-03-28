"""
Test 3: Workshop Board — toggle, card rendering, auto-open, editing.

Verifies:
- Board toggle opens/closes the board pane
- Board has 4 zones (insights, ideas, parking, actions)
- Adding a card via JS auto-opens the board
- Cards can be edited (click-to-edit)
- Cards can be deleted
- Board count badge updates
- 50/50 layout for non-lean-canvas exercises
"""


def _start_exercise(page, base_url, mode="ideate", exercise="crazy-8s"):
    """Helper to start an exercise session."""
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    page.evaluate(f"() => startExercise('{mode}', '{exercise}')")
    page.wait_for_timeout(500)


def test_board_toggle_opens_pane(page, base_url):
    """Clicking board toggle opens the board pane."""
    _start_exercise(page, base_url)

    board_pane = page.query_selector("#boardPane")
    assert board_pane.evaluate("el => el.classList.contains('hidden')"), "Board should start hidden"

    page.click("#boardToggle")
    page.wait_for_timeout(300)

    assert not board_pane.evaluate("el => el.classList.contains('hidden')"), "Board should be visible"


def test_board_toggle_closes_pane(page, base_url):
    """Clicking board toggle again closes the board pane."""
    _start_exercise(page, base_url)

    page.click("#boardToggle")
    page.wait_for_timeout(300)
    page.click("#boardToggle")
    page.wait_for_timeout(300)

    board_pane = page.query_selector("#boardPane")
    assert board_pane.evaluate("el => el.classList.contains('hidden')"), "Board should close"


def test_board_has_four_zones(page, base_url):
    """Board contains insights, ideas, parking, and actions zones."""
    _start_exercise(page, base_url)
    page.click("#boardToggle")
    page.wait_for_timeout(300)

    zones = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('.board-zone')).map(z => z.dataset.zone);
    }""")
    expected = {"insights", "ideas", "parking", "actions"}
    assert set(zones) == expected, f"Expected {expected}, got {set(zones)}"


def test_add_card_auto_opens_board(page, base_url):
    """Adding the first board card auto-opens the board."""
    _start_exercise(page, base_url)

    board_pane = page.query_selector("#boardPane")
    assert board_pane.evaluate("el => el.classList.contains('hidden')"), "Board should start hidden"

    page.evaluate("""() => {
        addBoardCard('Test insight from automation', 'insights', 'ideate', 'Crazy 8s');
    }""")
    page.wait_for_timeout(500)

    assert not board_pane.evaluate("el => el.classList.contains('hidden')"), "Board should auto-open"

    cards = page.query_selector_all('.board-card')
    assert len(cards) == 1, f"Expected 1 card, got {len(cards)}"
    text = cards[0].query_selector('.board-card-text').text_content()
    assert "Test insight from automation" in text


def test_second_card_does_not_retoggle(page, base_url):
    """Adding a second card doesn't close the already-open board."""
    _start_exercise(page, base_url)

    page.evaluate("""() => {
        addBoardCard('First card', 'ideas', 'ideate', 'Test');
    }""")
    page.wait_for_timeout(300)

    page.evaluate("""() => {
        addBoardCard('Second card', 'ideas', 'ideate', 'Test');
    }""")
    page.wait_for_timeout(300)

    board_pane = page.query_selector("#boardPane")
    assert not board_pane.evaluate("el => el.classList.contains('hidden')"), "Board should stay open"

    cards = page.query_selector_all('.board-card')
    assert len(cards) == 2


def test_board_count_badge_updates(page, base_url):
    """Board count badge reflects number of cards."""
    _start_exercise(page, base_url)

    page.evaluate("""() => {
        addBoardCard('Idea 1', 'ideas', 'ideate', 'Test');
        addBoardCard('Idea 2', 'ideas', 'ideate', 'Test');
        addBoardCard('Insight 1', 'insights', 'ideate', 'Test');
    }""")
    page.wait_for_timeout(300)

    count = page.text_content("#boardCount")
    assert count == "3", f"Expected '3', got '{count}'"


def test_card_has_edit_button(page, base_url):
    """Each card has an edit pencil button."""
    _start_exercise(page, base_url)

    page.evaluate("() => addBoardCard('Editable idea', 'ideas', 'ideate', 'Test')")
    page.wait_for_timeout(300)

    edit_btn = page.query_selector('.board-card-edit-btn')
    assert edit_btn is not None, "Edit button not found"


def test_card_click_to_edit(page, base_url):
    """Clicking card text opens a textarea for editing."""
    _start_exercise(page, base_url)

    page.evaluate("() => addBoardCard('Original text', 'ideas', 'ideate', 'Test')")
    page.wait_for_timeout(300)

    page.click('.board-card-text')
    page.wait_for_timeout(300)

    textarea = page.query_selector('.board-card-edit')
    assert textarea is not None, "Edit textarea should appear"
    assert textarea.input_value() == "Original text"


def test_card_edit_saves(page, base_url):
    """Editing card text and pressing Enter saves the change."""
    _start_exercise(page, base_url)

    page.evaluate("() => addBoardCard('Before edit', 'ideas', 'ideate', 'Test')")
    page.wait_for_timeout(300)

    page.click('.board-card-text')
    page.wait_for_timeout(200)

    textarea = page.query_selector('.board-card-edit')
    textarea.fill('After edit')
    textarea.press('Enter')
    page.wait_for_timeout(300)

    text = page.text_content('.board-card-text')
    assert text == 'After edit', f"Expected 'After edit', got '{text}'"


def test_card_delete(page, base_url):
    """Clicking delete removes the card."""
    _start_exercise(page, base_url)

    page.evaluate("() => addBoardCard('To delete', 'ideas', 'ideate', 'Test')")
    page.wait_for_timeout(300)

    assert len(page.query_selector_all('.board-card')) == 1
    page.click('.board-card-delete')
    page.wait_for_timeout(300)
    assert len(page.query_selector_all('.board-card')) == 0


def test_board_50_50_layout(page, base_url):
    """Board uses 50/50 layout for non-lean-canvas exercises."""
    _start_exercise(page, base_url)
    page.click("#boardToggle")
    page.wait_for_timeout(300)

    layout = page.query_selector("#workshopLayout")
    has_active = layout.evaluate("el => el.classList.contains('board-active')")
    assert has_active

    has_lean = layout.evaluate("el => el.classList.contains('board-lean-canvas')")
    assert not has_lean, "Non-lean-canvas should not have lean layout class"
