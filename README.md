# Ivan's Room

A quiet, landscape clock and weather dashboard for an iPad 4 running iOS 10.3.4. Built with plain HTML, CSS, inline SVG, and ES5 JavaScript. No dependencies, build step, external fonts, or API keys.

The header's face button opens a compact picker: **Calm** (warm landscape), **Keycap** (gray/orange keyboard), **Edition** (serif newspaper), **Terminal** (green instrument panel), and **Tide** (blue rounded cards). **Light / Dark** switches brightness independently. Choices are remembered on each device when local storage is available, including existing Calm and Keycap preferences. The picker closes after a selection, an outside click, Escape, or focus leaving it. All ten combinations use Safari 10-compatible CSS and JavaScript; faces share one weather feed and require no extra fonts, libraries, or animation loops.

## Preview

Run `python3 -m http.server 8080` from this folder, then visit `http://localhost:8080`. To test on the iPad on the same Wi-Fi, visit `http://YOUR-COMPUTER-LAN-IP:8080`.

## GitHub Pages

Push these files to GitHub. In the repository's **Settings → Pages**, select **Deploy from a branch**, choose **main** and **/ (root)**, then save. GitHub will show the published address. Public repositories support Pages on GitHub Free.

On the iPad, open that address in Safari in landscape. Optionally use **Share → Add to Home Screen** for a cleaner display. Set **Settings → Display & Brightness → Auto-Lock → Never** if available, and keep the iPad powered for continuous use. This site does not depend on the modern Screen Wake Lock API.

## Weather and time

- Weather: [Open-Meteo](https://open-meteo.com/), Redding coordinates 40.5865, -122.3917; Fahrenheit; refreshes every 15 minutes while visible.
- The clock uses US Pacific time, including daylight saving, independently of the device's configured timezone. The device's date and time must still be accurate.
- Shows current temperature, apparent temperature, conditions, today's high/low and rain probability, six upcoming hours, and the next sunrise or sunset.
- Weather is saved locally where available. Saved readings are labeled when stale; data older than 24 hours is ignored at startup. Connection errors keep the last reading visible, with a status and retry button. First-load failure shows placeholders, never invented readings.
- Requests use XMLHttpRequest; JavaScript uses ES5 syntax. Layout uses flexbox without gap or CSS custom properties. All visual assets ship with the page.
- Weather requires internet access and the API's HTTPS certificate to be accepted by the iPad. Actual iOS 10.3.4 Safari testing is still required; a modern-browser preview cannot establish device compatibility.

Weather data attribution: [Open-Meteo](https://open-meteo.com/) ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)).
