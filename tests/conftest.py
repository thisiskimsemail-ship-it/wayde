"""
Shared fixtures for Wade Studio browser tests.

Starts the Flask server once per session, launches Playwright browser,
and provides a fresh page for each test.
"""
import os
import time
import signal
import subprocess
import pytest
from playwright.sync_api import sync_playwright

SERVER_PORT = 3099  # Use non-standard port to avoid conflicts
BASE_URL = f"http://localhost:{SERVER_PORT}"


@pytest.fixture(scope="session")
def server():
    """Start Flask server for the test session."""
    env = os.environ.copy()
    env["PORT"] = str(SERVER_PORT)
    env["FLASK_DEBUG"] = "false"
    # Use a dummy API key if none set — tests that hit /api/chat will be skipped
    if "ANTHROPIC_API_KEY" not in env:
        env["ANTHROPIC_API_KEY"] = "test-placeholder"

    server_path = os.path.join(os.path.dirname(__file__), "..", "server.py")
    proc = subprocess.Popen(
        ["python3", server_path],
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    # Wait for server to be ready
    from urllib.request import urlopen
    for attempt in range(30):
        try:
            urlopen(BASE_URL, timeout=1)
            break
        except Exception:
            time.sleep(0.5)
    else:
        proc.kill()
        raise RuntimeError(f"Flask server failed to start on port {SERVER_PORT}")

    yield proc

    # Teardown
    proc.send_signal(signal.SIGTERM)
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        proc.kill()


@pytest.fixture(scope="session")
def browser():
    """Launch Playwright browser once per session."""
    pw = sync_playwright().start()
    browser = pw.chromium.launch(headless=True)
    yield browser
    browser.close()
    pw.stop()


@pytest.fixture
def page(browser, server):
    """Fresh browser page for each test."""
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    yield page
    page.close()
    context.close()


@pytest.fixture
def base_url():
    return BASE_URL
