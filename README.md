# Ivan's Room

A quiet, landscape clock and weather dashboard for an iPad 4 running iOS 10.3.4. Built with plain HTML, CSS, inline SVG, and ES5 JavaScript. No dependencies, build step, external fonts, or API keys.

The header's face button opens a compact picker: **Calm** (warm landscape), **Keycap** (gray/orange keyboard), **Edition** (serif newspaper), **Terminal** (green instrument panel), and **Tide** (blue rounded cards). **Light / Dark** switches brightness independently. Choices are remembered on each device when local storage is available, including existing Calm and Keycap preferences. The picker closes after a selection, an outside click, Escape, or focus leaving it. All ten combinations use Safari 10-compatible CSS and JavaScript; faces share one weather feed and require no extra fonts, libraries, or animation loops.

The **Content view** selector is independent of the face: **Clock** shows oversized time and date, **Glance** adds current weather, and **Weather** includes the forecast and sunrise/sunset. The Clock view skips weather requests until a weather view is selected again.

## Remote control

Open `/control/` on your computer or phone. It has view, style, and light/dark controls, plus a live local preview. Paired devices synchronize through a small Cloudflare Worker and D1 database; the iPad keeps its own controls. The controller distinguishes sending, saved, offline, and confirmed-on-display states. Pairing is saved separately on each browser.

On a connected controller, choose **Pair devices → Generate pairing code**. On the iPad, open `/control/`, enter that one-use code, connect, then follow **Ivan's Room** back to the dashboard. Repeat for your phone. Codes expire in ten minutes. Keep private pairing links private.

The deployment uses **Cloudflare Workers Free**, verified before deployment, and GitHub Pages. No paid plan, add-on, or custom domain is required. Do not upgrade either account for this project. If a free quota is reached, remote sync may fail until it resets; local controls remain available. See [backend/SETUP.md](backend/SETUP.md) for deployment, key rotation, limits, and recovery. Private credentials and pairing keys are excluded from Git.

Run `node tests/remote.mjs` for the backend and sync checks (requires Node with `node:sqlite`), and `node tests/dashboard.cjs` for clock/weather checks.

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
