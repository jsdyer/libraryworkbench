# Library Workbench

[Open the workbench](https://coolcode.ca/libraryworkbench/)

Pick a project such as transferring a VHS tape. See which equipment the central libraries in Halifax and Vancouver describe, what to bring, and where the library takes bookings. Historical use and attendance sit beside the practical directory.

<!-- coolcode:guide -->
Enter 90 minutes and 30 grams in the 3D print planner. This fits Halifax’s published under-two-hour service and gives a CAD $6.50 estimate in Richmond. At 120 minutes, only the Richmond option meets the published time limit. Try a PAL Hi8 cassette in the Vancouver transfer planner. Enter 60, 90, 45 for three tapes to see 3 h 15 min of real-time copying and roughly 13 GB of storage before setup and saving. Explore Regular 8 film, quarter-inch audio reels or floppy disks in the equipment directory. In the activity table, minutes per session relates reported hours to sessions. Select Halifax in 2024–25 to compare its survey and annual-report figures.
<!-- /coolcode:guide -->

## Makerspace projects

Compare a slicer’s time and material estimate with [Halifax Central’s published print guidance](https://www.halifaxpubliclibraries.ca/blogs/post/how-to-get-started-with-3d-printing/) and [Richmond’s Creation Stations](https://www.yourlibrary.ca/creation-stations/). Richmond charges $2 per job, $0.10 per gram and $1 per hour. The estimate prorates partial hours. The equipment directory includes sewing and Cricut projects during [Halifax studio programs](https://www.halifaxpubliclibraries.ca/library-spaces/use-of-space/lou-duggan-creative-studio/), plus Richmond’s Brighouse Launchpad. The library handles training, jobs and program schedules.

## Transfer estimates

The [tape planner](https://coolcode.ca/libraryworkbench/#tape-planner) compares the format and video standard on your cassette with the published Central Inspiration Lab inventory. NTSC and PAL compatibility is specific to each deck. A tape of unknown format or standard may require confirmation with the library. VPL’s video guide describes real-time transfer and gives about an hour of capture as an example of a 4 GB file. The calculator uses that approximate rate, counts only the selected running times and leaves setup and saving time for the visitor to allow. Rates for other media and equipment can differ. Equipment and tape standards were reviewed on 19 November 2026.

## Sources and interpretation

- The [Vancouver Inspiration Lab](https://www.vpl.ca/branches/central/level-3/inspiration-lab) lists equipment and links to its booking services. The [video transfer guide](https://www.vpl.ca/guides/inspiration-lab-digitization/video-digitization) explains real-time copying and camcorder connections. [Halifax Central’s Media Studio](https://www.halifaxpubliclibraries.ca/library-spaces/book-a-space/media-studio/) describes its digitization cart and booking requirements. The practical entries are curated summaries. Follow the library’s booking link to confirm current availability and equipment suitability.
- [Vancouver Public Library Annual Statistics 2024](https://www.vpl.ca/sites/default/files/2025-04/VPL%20Annual%20Statistics%202024%20FINAL.pdf#page=12), printed p. 11, reports hours of use and sessions at Central and Bud Osborn for calendar years 2023 and 2024. The report attributes the Central studios’ 2023 zero to closure. Stations combine digitization and creation. A station session can cover many types of work. Average minutes per session divides the reported total hours by the number of sessions and multiplies by 60. When no sessions were recorded the average is undefined.
- [Nova Scotia regional library statistics](https://data.novascotia.ca/d/tnu4-55e9) supply fiscal-year totals for each reporting system. A blank measure stays unreported. Programs and attendances can include in-person, self-directed and virtual activities. Attendance counts participations.
- [Halifax Public Libraries’ annual report](https://www2.halifaxpubliclibraries.ca/archives/annual-reports/2024-25/Annual-Report-2024-25-Infographic-11x7.25-DEC2025_Digital.pdf) reports 37,227 opening hours, 10,063 programs/events and 229,035 participants in 2024–25. The provincial Halifax row reports 37,227 hours, 9,646 programs and 392,959 attendances. The two publications give no reconciliation. The downloadable [request draft](web/halifax-data-request.txt) asks about their definitions and a recurring aggregate export.

## Refresh and development

The monthly workflow downloads the current provincial survey, checks region-year uniqueness, preserves missing measures and checks the fingerprints of the two reviewed report PDFs before publishing. The catalogue date tracks the survey pull. A report that blocks a scheduled download or changes its content keeps its last verified date and a visible status in the corresponding section. Its reviewed figures remain available while the survey updates independently. Equipment summaries are reviewed separately when a library changes a service. Neither user selections nor bookings are submitted by this tool. Booking links open the relevant library.

Run `python3 scripts/refresh.py` to retrieve data, `node --test tests/*.test.mjs` and `python3 -m unittest discover -s tests` to check it, then `python3 scripts/build.py` to build offline. Serve `dist/` locally. With Playwright Chromium installed, `python3 tests/browser_smoke.py` exercises the deployed layout.
