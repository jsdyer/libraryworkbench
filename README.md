# Library Workbench

[Open the workbench](https://coolcode.ca/libraryworkbench/)

Pick a project such as transferring a VHS tape. See which equipment the central libraries in Halifax and Vancouver describe, what to bring, and where the library takes bookings. Historical use and attendance sit beside the practical directory.

<!-- coolcode:guide -->
Choose a recording or digitization task to see the equipment, what to bring, and the official booking route in each city. Switch between Vancouver labs to compare 2023 and 2024 sessions or hours. In the Nova Scotia survey, choose Halifax in 2024–25 to put opening hours, programs and attendance alongside Halifax’s annual report and download a data-request draft about the different counts.
<!-- /coolcode:guide -->

## Sources and interpretation

- The [Vancouver Inspiration Lab](https://www.vpl.ca/branches/central/level-3/inspiration-lab) lists equipment and links to its booking services. The [video transfer guide](https://www.vpl.ca/guides/inspiration-lab-digitization/video-digitization) explains real-time copying and camcorder connections. [Halifax Central’s Media Studio](https://www.halifaxpubliclibraries.ca/library-spaces/book-a-space/media-studio/) describes its digitization cart and booking requirements. The practical entries are curated summaries. Follow the library’s booking link to confirm current availability and equipment suitability.
- [Vancouver Public Library Annual Statistics 2024](https://www.vpl.ca/sites/default/files/2025-04/VPL%20Annual%20Statistics%202024%20FINAL.pdf#page=12), printed p. 11, reports hours of use and sessions at Central and Bud Osborn for calendar years 2023 and 2024. The report attributes the Central studios’ 2023 zero to closure. Stations combine digitization and creation. A station session can cover many types of work.
- [Nova Scotia regional library statistics](https://data.novascotia.ca/d/tnu4-55e9) supply fiscal-year totals for each reporting system. A blank measure stays unreported. Programs and attendances can include in-person, self-directed and virtual activities. Attendance counts participations.
- [Halifax Public Libraries’ annual report](https://www2.halifaxpubliclibraries.ca/archives/annual-reports/2024-25/Annual-Report-2024-25-Infographic-11x7.25-DEC2025_Digital.pdf) reports 37,227 opening hours, 10,063 programs/events and 229,035 participants in 2024–25. The provincial Halifax row reports 37,227 hours, 9,646 programs and 392,959 attendances. The two publications give no reconciliation. The downloadable [request draft](web/halifax-data-request.txt) asks about their definitions and a recurring aggregate export.

## Refresh and development

The monthly workflow downloads the current provincial survey, checks region-year uniqueness, preserves missing measures and checks the fingerprints of the two reviewed report PDFs before publishing. The catalogue date tracks the survey pull. A report that blocks a scheduled download or changes its content keeps its last verified date and a visible status in the corresponding section. Its reviewed figures remain available while the survey updates independently. Equipment summaries are reviewed separately when a library changes a service. Neither user selections nor bookings are submitted by this tool. Booking links open the relevant library.

Run `python3 scripts/refresh.py` to retrieve data, `node --test tests/*.test.mjs` and `python3 -m unittest discover -s tests` to check it, then `python3 scripts/build.py` to build offline. Serve `dist/` locally. With Playwright Chromium installed, `python3 tests/browser_smoke.py` exercises the deployed layout.
