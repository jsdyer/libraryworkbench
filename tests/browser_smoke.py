"""Exercise the built starter at a project subpath in Chromium."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import shutil
import tempfile
import threading
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def main():
    screenshots = ROOT / "browser-checks"
    screenshots.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory() as temporary:
        shutil.copytree(ROOT / "dist", Path(temporary) / "example-tool")
        server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=temporary))
        threading.Thread(target=server.serve_forever, daemon=True).start()
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(executable_path=__import__("os").environ.get("CHROMIUM_PATH"))
                page = browser.new_page(viewport={"width": 1280, "height": 1000})
                errors = []
                page.on("pageerror", lambda error: errors.append(str(error)))
                page.goto(f"http://127.0.0.1:{server.server_port}/example-tool/")
                page.wait_for_function("document.querySelector('#metadata').textContent.includes('retrieved')")
                assert page.locator('#services article').count() == 2
                page.locator('#task').select_option('Camcorder tape')
                page.locator('#city').select_option('Halifax')
                assert 'no verified' in page.locator('#services').inner_text()
                page.locator('#city').select_option('Vancouver')
                assert 'MiniDV' in page.locator('#services').inner_text()
                assert '229,035' in page.locator('#nstable').inner_text()
                page.locator('#lab').select_option('Bud Osborn')
                assert '633' in page.locator('#labtable').inner_text()
                page.locator('#year').select_option('2023-2024')
                assert '229,035' not in page.locator('#nstable').inner_text()
                page.screenshot(path=str(screenshots / "desktop.png"), full_page=True)
                page.set_viewport_size({"width": 390, "height": 844})
                assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
                page.screenshot(path=str(screenshots / "mobile.png"), full_page=True)
                assert not errors, errors
                browser.close()
            print("Browser checks passed: project subpath, filters, records and mobile layout")
        finally:
            server.shutdown()


if __name__ == "__main__":
    main()
