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
                assert '$6.50' in page.locator('#richmond-price').inner_text()
                page.locator('#print-minutes').fill('120')
                assert 'Exceeds' in page.locator('#halifax-fit').inner_text()
                assert '$3.00 before HST' in page.locator('#oakville-price').inner_text()
                assert '$4.50' in page.locator('#toronto-price').inner_text()
                assert 'longer-print' in page.locator('#toronto-fit').inner_text()
                page.locator('#print-minutes').fill('181')
                assert 'longer appointment' in page.locator('#oakville-fit').inner_text()
                assert 'verified' in page.locator('#oakville-status').inner_text()
                page.locator('#task').select_option('3D print')
                page.locator('#city').select_option('Toronto')
                assert 'Digital Innovation Hubs' in page.locator('#services').inner_text()
                page.locator('#city').select_option('Oakville')
                assert 'Ultimaker' in page.locator('#services').inner_text()
                page.locator('#task').select_option('Mend or sew')
                page.locator('#city').select_option('Halifax')
                assert 'Lou Duggan' in page.locator('#services').inner_text()
                assert '3 h 15 min' in page.locator('#capture-time').inner_text()
                assert '13 GB' in page.locator('#capture-storage').inner_text()
                page.locator('#video-standard').select_option('PAL')
                assert 'alternative player' in page.locator('#station-name').inner_text()
                page.locator('#tape-format').select_option('Video8 / Hi8 / Digital8')
                assert '8 mm camcorder' in page.locator('#station-name').inner_text()
                page.locator('#durations').fill('1:90')
                assert page.locator('#durations').get_attribute('aria-invalid') == 'true'
                page.locator('#durations').fill('1:30')
                assert '1 h 30 min' in page.locator('#capture-time').inner_text()
                page.locator('#measure').select_option('Minutes per session')
                assert '140.5' in page.locator('#labtable').inner_text()
                page.locator('#measure').select_option('Hours of use')
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
