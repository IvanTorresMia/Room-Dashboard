# Beyond the clock — content experiments

Four self-contained content prototypes for exploring an old tablet's second life. This directory imports nothing from the production dashboard, accounts, backends, theme catalog or pairing code. It does not read/write browser storage or contact services. The existing paired display and its eight themes are unchanged.

## Explore

Open `index.html` directly or serve from the repository root:

```sh
python3 -m http.server 8877 --bind 127.0.0.1 --directory theme-lab
```

Visit `http://127.0.0.1:8877/beyond/`. The gallery uses a scaled 1024×768 iframe to compare the intended landscape layout. Select a concept, try light/dark, and choose **Open full display** for actual-size controls and portrait behavior. Choose your concept/brightness before editing: changing either reloads the iframe and discards its session. Editing inside a preview does not transfer to a separately opened display. Open the full display first if you want to keep using it for a session.

Standalone URLs: `display.html?scene=form`, `?scene=reminder`, `?scene=house`, `?scene=focus`; add `&mode=dark` for dark. Invalid parameters default to Form Gallery/light. All links and assets are relative, so branch-hosted Pages paths work.

## Concepts

- **Form Gallery:** three original, static abstract artworks in one small inline SVG. Clay/ochre arches, a blue circular horizon, and a plum/rose composition. Tap Next artwork; there is no auto-rotation, image request or animation loop. Dark mode dims the art and changes its surrounding gallery surface.
- **A Small Reminder:** a large typographic poster on yellow paper or a dark olive surface. Cycle three original short messages, or enter up to 140 characters with an optional 40-character sign-off. Newlines are preserved, long text uses smaller type, and plain `textContent` prevents markup execution. Nothing is saved after reload.
- **House Notes:** two explicitly labeled sample boards: everyday life and a guest welcome. One prominent plan and two smaller notes. These are synthetic text fixtures, not a calendar, date-based schedule, shared notes service or personal data. The button switches between them; no editing/sync is implied.
- **One Thing:** one intention (up to 70 characters), with 5-, 25- or 45-minute focus sessions and a 10-second test option. Begin, pause, continue, reset and restart. The timer is useful while the page remains open; it is not an alarm service. No sound, notifications or background execution is promised. Editing and submitting a task resets the timer; cancel preserves the session. Reloading/switching concepts loses the session.

These are **content views**, not four additional color themes. Their styling is purpose-built for exploration. Keep the content model separate from face/brightness if selected concepts move into the larger app.

## Files and implementation

- `index.html`, `gallery.css`, `gallery.js`: concept selector, light/dark switch, descriptions and scaled interactive preview.
- `display.html`, `display.css`, `display.js`: all four standalone studies, inline artwork, text editor, sample-board switch and focus timer.
- `verify.cjs`: isolated tests. Run `node theme-lab/beyond/verify.cjs` from the repository root; no production files or libraries are imported.

Runtime assets total approximately 30 KB uncompressed. No libraries, external fonts, bitmaps, services, build or install step. Browser JavaScript uses ES5. CSS uses prefixed/unprefixed flexbox without gap, viewport sizing, ordinary borders and SVG. No CSS variables, Grid, Intl, fetch, storage or newer browser APIs are required. Static scenes schedule no timers. A running focus session updates once per second, stops scheduling when hidden, then recalculates from its deadline when visible. Pausing retains whole seconds. Completion stops the interval. Device clock changes can affect the deadline; session state is deliberately memory-only. No animation, blinking separator or autoplay.

Native forms and ordinary buttons are used. Editing has labels, character limits, Escape/Cancel behavior, focus return and a Tab boundary. The display behind the modal is hidden from accessibility while editing. Completion is announced through a status element; the countdown itself is not an every-second live announcement.

## Verification and limits

Passed: JavaScript syntax checks; all eight scene/palette combinations; no idle intervals; artwork cycling/wrap; safe custom message input/whitespace rejection; sample-board toggling; timer start/pause/reset/restart/completion; hidden-page catch-up; invalid task length and invalid URL defaults. The test environment has no storage or network APIs.

Modern in-app-browser checks: gallery switching, original artwork layout, custom multiline message editing, alternate guest board, task/duration editing and starting a short focus session in the gallery's 1024×768 iframe. Light layouts were visually inspected; dark modes are implemented and state-checked, with a browser spot check of dark focus. These checks do not establish physical iPad compatibility.

Physical iPad 4 / iOS 10.3.4 Safari and Home Screen acceptance remains pending. Check all concepts/palettes at actual landscape and portrait sizes, actual tap targets, longest allowed text, onscreen-keyboard editor scrolling, focus pause/resume and completion after backgrounding, and comfortable room-distance/night readability. Keep Auto-Lock configured appropriately: the site cannot guarantee the screen stays awake, and a timer cannot notify from a closed/suspended page. Test the chosen display in its installed context; Safari and Home Screen contexts can differ.

## Integration path

Keep these experiments out of production view validation until their behavior is selected. Current devices/server know only Clock, Glance and Weather. Simply adding view IDs would produce unsupported-settings errors on older displays.

For a selected view, define versioned content settings and capability/fallback rules first. For example: a reminder needs text/sign-off and size bounds; a household board needs ownership, editing, freshness and timezone rules; a shared focus session needs a server timestamp/deadline plus clear pause/control ownership; a photo gallery needs upload, storage, sizing, cache and privacy decisions. Preserve compatible local rendering and device acknowledgment only after a supported view is actually applied.

Then add a dedicated renderer, controller editing and persistence/sync support in the owning chat, reuse `theme-catalog.js` IDs for visual identities, and verify the old renderer still falls back safely. Do not import these transient fixtures as real room content or copy pairing/account code into the lab. Photo uploads, live calendars, music status and smart-home data are ideas only, not connected features in this collection.
