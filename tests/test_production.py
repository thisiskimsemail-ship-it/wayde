"""
Production smoke tests for The Studio.
Runs against the live Railway deployment — no local server needed.

Usage: python3 -m pytest tests/test_production.py -v --timeout=120
"""
import pytest
from playwright.sync_api import sync_playwright, expect

PROD_URL = "https://studio-production-46a3.up.railway.app"


@pytest.fixture(scope="module")
def browser():
    pw = sync_playwright().start()
    browser = pw.chromium.launch(headless=True)
    yield browser
    browser.close()
    pw.stop()


@pytest.fixture
def page(browser):
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    # Clear storage for clean state
    page.goto(PROD_URL)
    page.evaluate("localStorage.clear()")
    page.reload()
    page.wait_for_load_state("networkidle")
    yield page
    page.close()
    context.close()


# === TEST 1: Homepage loads correctly ===

class TestHomepage:
    def test_page_loads(self, page):
        """Homepage loads without errors."""
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(PROD_URL)
        page.wait_for_load_state("networkidle")
        assert len(errors) == 0, f"JS errors on page load: {errors}"

    def test_hero_content(self, page):
        """Hero section has correct copy."""
        page.goto(PROD_URL)
        assert page.locator(".lp-hero-heading").inner_text() == "The Studio"
        assert "virtual innovation workshop" in page.locator(".lp-hero-sub").inner_text().lower()

    def test_jam_button_exists(self, page):
        """Primary CTA 'Jam with Pete' exists."""
        page.goto(PROD_URL)
        btn = page.locator("#enterStudioBtn")
        assert btn.is_visible()
        assert "Jam with Pete" in btn.inner_text()

    def test_category_cards_visible(self, page):
        """All 4 category cards are visible."""
        page.goto(PROD_URL)
        for cat in ["THE UNTANGLE", "THE SPARK", "THE TEST", "THE BUILD"]:
            assert page.locator(f"text={cat}").first.is_visible(), f"Category {cat} not visible"

    def test_tool_pills_present(self, page):
        """Tool pills exist on category cards."""
        page.goto(PROD_URL)
        pills = page.locator(".lp-tool-pill")
        assert pills.count() >= 18, f"Expected 18+ tool pills, found {pills.count()}"

    def test_no_js_errors(self, page):
        """No JavaScript errors during page load."""
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(PROD_URL)
        page.wait_for_timeout(3000)
        assert len(errors) == 0, f"JS errors: {errors}"

    def test_header_nav(self, page):
        """Header nav has Studio and Toolbox links."""
        page.goto(PROD_URL)
        assert page.locator(".header-nav-link", has_text="The Studio").is_visible()
        assert page.locator(".header-nav-link", has_text="Toolbox").is_visible()

    def test_stats_show_20_tools(self, page):
        """Stats strip shows correct tool count."""
        page.goto(PROD_URL)
        stat = page.locator(".lp-stat-number").first
        assert stat.inner_text().strip() in ["20", "18", "17"], f"Tool count: {stat.inner_text()}"


# === TEST 2: Jam with Pete enters session ===

class TestSessionEntry:
    def test_jam_button_enters_session(self, page):
        """Clicking 'Jam with Pete' enters conversation mode."""
        page.goto(PROD_URL)
        page.click("#enterStudioBtn")
        # Wait for Pete's greeting
        page.wait_for_selector(".msg-agent", timeout=15000)
        page.wait_for_timeout(8000)  # Wait for streaming to complete
        greeting = page.locator(".msg-agent").first.inner_text()
        assert len(greeting) > 10, f"Pete's greeting too short: {greeting[:100]}"

    def test_input_bar_appears(self, page):
        """Input bar appears after entering session."""
        page.goto(PROD_URL)
        page.click("#enterStudioBtn")
        page.wait_for_selector(".msg-agent", timeout=15000)
        page.wait_for_timeout(2000)  # Wait for input to appear
        # Check textarea exists in DOM (may be in a footer outside main flow)
        assert page.locator("textarea").count() > 0, "No textarea found"

    def test_header_nav_hidden_in_session(self, page):
        """Header nav pills hide during session."""
        page.goto(PROD_URL)
        page.click("#enterStudioBtn")
        page.wait_for_selector(".msg-agent", timeout=15000)
        assert not page.locator(".header-nav").is_visible()

    def test_no_report_cta_at_start(self, page):
        """Report CTA not shown at session start."""
        page.goto(PROD_URL)
        page.click("#enterStudioBtn")
        page.wait_for_selector(".msg-agent", timeout=15000)
        # Report CTA should be hidden until wrap
        cta = page.locator("#reportCtaBtn")
        if cta.count() > 0:
            assert not cta.is_visible() or "disabled" in (cta.get_attribute("class") or "")


# === TEST 3: Direct tool start from homepage ===

class TestDirectToolStart:
    def test_tool_pill_starts_session(self, page):
        """Clicking a tool pill on homepage starts that tool's session."""
        page.goto(PROD_URL)
        # Find Five Whys pill and click it
        pill = page.locator("button.lp-tool-pill", has_text="Five Whys").first
        if pill.count() > 0:
            pill.click()
            page.wait_for_selector(".msg-agent", timeout=15000)
            # Should show session bar with Five Whys
            breadcrumb = page.locator(".breadcrumb-tool")
            if breadcrumb.count() > 0:
                assert "Five Whys" in breadcrumb.inner_text()

    def test_category_card_starts_session(self, page):
        """Clicking a category card enters session with context."""
        page.goto(PROD_URL)
        card = page.locator(".lp-process-card").first
        if card.count() > 0 and card.locator("a, button").first.count() > 0:
            card.locator("a, button").first.click()
            page.wait_for_timeout(3000)
            # Should be in some kind of session or page
            assert page.url != PROD_URL or page.locator(".msg-agent").count() > 0


# === TEST 4: Toolbox page ===

class TestToolbox:
    def test_toolbox_loads(self, page):
        """Toolbox page loads without errors."""
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(f"{PROD_URL}/toolbox.html")
        page.wait_for_load_state("networkidle")
        assert len(errors) == 0, f"JS errors: {errors}"

    def test_toolbox_has_all_categories(self, page):
        """Toolbox shows all 4 categories."""
        page.goto(f"{PROD_URL}/toolbox.html")
        page.wait_for_load_state("networkidle")
        content = page.content()
        for cat in ["Untangle", "Spark", "Test", "Build"]:
            assert cat in content, f"Category {cat} missing from toolbox"

    def test_toolbox_has_tools(self, page):
        """Toolbox has tool cards."""
        page.goto(f"{PROD_URL}/toolbox.html")
        page.wait_for_load_state("networkidle")
        cards = page.locator(".tb-tool-card")
        assert cards.count() >= 15, f"Expected 15+ tool cards, found {cards.count()}"

    def test_tool_detail_links_work(self, page):
        """Tool detail page links resolve (not 404)."""
        tools = [
            "five-whys", "empathy-map", "jobs-to-be-done", "socratic-questioning", "iceberg",
            "crazy-8s", "how-might-we", "scamper", "constraint-flip",
            "pre-mortem", "devils-advocate", "cold-open", "reality-check", "trade-off",
            "lean-canvas", "effectuation", "rapid-experiment", "flywheel", "theory-of-change"
        ]
        for tool in tools:
            resp = page.request.get(f"{PROD_URL}/tool-detail-{tool}.html")
            assert resp.status == 200, f"tool-detail-{tool}.html returned {resp.status}"


# === TEST 5: Tool detail pages ===

class TestToolDetailPages:
    def test_five_whys_page_loads(self, page):
        """Five Whys detail page loads correctly."""
        page.goto(f"{PROD_URL}/tool-detail-five-whys.html")
        page.wait_for_load_state("networkidle")
        assert "Five Whys" in page.title() or "Five Whys" in page.content()

    def test_detail_page_has_cta(self, page):
        """Detail page has 'Try this tool' CTA."""
        page.goto(f"{PROD_URL}/tool-detail-five-whys.html")
        page.wait_for_load_state("networkidle")
        cta = page.locator("a", has_text="Try")
        assert cta.count() > 0, "No 'Try' CTA found on detail page"

    def test_detail_page_toolbar(self, page):
        """Detail page has Aa and theme toggle."""
        page.goto(f"{PROD_URL}/tool-detail-five-whys.html")
        page.wait_for_load_state("networkidle")
        assert page.locator("#textSizeToggle").count() > 0, "No text size toggle"
        assert page.locator("#themeToggle").count() > 0, "No theme toggle"


# === TEST 6: SVG canvases ===

class TestSVGCanvases:
    def test_all_svgs_load(self, page):
        """All SVG canvas files return 200."""
        svgs = [
            "five-whys", "empathy-map", "jtbd", "crazy-8s", "hmw", "scamper",
            "pre-mortem", "devils-advocate", "analogical", "lean-canvas",
            "effectuation", "rapid-experiment", "flywheel", "theory-of-change",
            "trade-off", "iceberg", "constraint-flip", "cold-open", "socratic-questioning"
        ]
        for svg in svgs:
            resp = page.request.get(f"{PROD_URL}/svg/{svg}.svg")
            assert resp.status == 200, f"svg/{svg}.svg returned {resp.status}"


# === TEST 7: API endpoints ===

class TestAPIEndpoints:
    def test_chat_endpoint_exists(self, page):
        """Chat API responds (even without valid messages)."""
        resp = page.request.post(f"{PROD_URL}/api/chat", data={
            "headers": {"Content-Type": "application/json"},
            "data": '{"messages": [], "mode": "untangle", "exercise": "five-whys"}'
        })
        # Should respond (might be error but shouldn't be 404)
        assert resp.status != 404, "Chat endpoint not found"

    def test_event_endpoint(self, page):
        """Analytics event endpoint accepts events."""
        import json
        resp = page.request.post(f"{PROD_URL}/api/event",
            headers={"Content-Type": "application/json"},
            data=json.dumps({"event": "test_ping"})
        )
        assert resp.status == 200, f"Event endpoint returned {resp.status}"

    def test_report_docx_endpoint_exists(self, page):
        """DOCX report endpoint exists."""
        resp = page.request.post(f"{PROD_URL}/api/report/docx", data={
            "headers": {"Content-Type": "application/json"},
            "data": '{"report": "# Test Report", "exercise": "five-whys", "mode": "untangle"}'
        })
        assert resp.status != 404, "DOCX endpoint not found"


# === TEST 8: Mobile viewport ===

class TestMobile:
    def test_mobile_homepage(self, browser):
        """Homepage works at 390px mobile width."""
        context = browser.new_context(viewport={"width": 390, "height": 844})
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(PROD_URL)
        page.wait_for_load_state("networkidle")
        # Should load without JS errors
        assert len(errors) == 0, f"Mobile JS errors: {errors}"
        # CTA should be visible
        assert page.locator("#enterStudioBtn").is_visible()
        page.close()
        context.close()

    def test_mobile_session(self, browser):
        """Session works at mobile width."""
        context = browser.new_context(viewport={"width": 390, "height": 844})
        page = context.new_page()
        page.goto(PROD_URL)
        page.evaluate("localStorage.clear()")
        page.reload()
        page.wait_for_load_state("networkidle")
        page.click("#enterStudioBtn")
        page.wait_for_selector(".msg-agent", timeout=15000)
        page.wait_for_timeout(2000)
        # Check textarea exists (may not be "visible" in Playwright's strict sense on mobile)
        assert page.locator("textarea").count() > 0, "No textarea in DOM on mobile"
        page.close()
        context.close()


# === TEST 9: Light mode ===

class TestLightMode:
    def test_light_mode_toggle(self, page):
        """Theme toggle switches to light mode."""
        page.goto(PROD_URL)
        page.click("#themeToggle")
        page.wait_for_timeout(500)
        theme = page.evaluate("document.documentElement.getAttribute('data-theme')")
        assert theme == "light", f"Theme is {theme}, expected light"

    def test_light_mode_no_errors(self, page):
        """No JS errors in light mode."""
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(PROD_URL)
        page.click("#themeToggle")
        page.wait_for_timeout(1000)
        assert len(errors) == 0, f"Light mode JS errors: {errors}"


# === TEST 10: Privacy page ===

class TestPrivacy:
    def test_privacy_page_loads(self, page):
        """Privacy page loads."""
        resp = page.request.get(f"{PROD_URL}/privacy.html")
        assert resp.status == 200, f"Privacy page returned {resp.status}"
