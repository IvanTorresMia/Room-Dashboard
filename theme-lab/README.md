# Room Dashboard face lab

Three isolated, buildless face prototypes. Everything added for this lab lives here. No app imports, external assets, fetch/XHR, account services, storage, credentials, or pairing behavior. All weather values and sunset times are synthetic and visibly labeled DEMO DATA. No deployment or integration has occurred.

## Open

From the repository root:

```sh
python3 -m http.server 8877 --bind 127.0.0.1 --directory theme-lab
```

Open http://127.0.0.1:8877/ . Alternatively, open `index.html` directly; the lab requires no server APIs. The gallery's controls update all three previews and their **Open display** links. Open a display link to review it without gallery controls. Browser Back returns to the gallery. State is encoded in each preview URL, with no persistence.

For tablet testing, serve **only this directory** on a trusted LAN interface and open the computer's LAN address on the tablet. Stop the server afterward. Install the standalone preview through Add to Home Screen to check that context independently.

## Concepts

- **Meridian:** poster geometry, clay sun disc, warm paper and olive-black night palette. Bold sans numerals and a low horizon create a decorative object without a landscape illustration.
- **Atelier:** a circular mantel-clock frame and Georgia numerals, with an asymmetrical weather ledger. Ivory/plum palettes, fine rules, and an italic date create a domestic, furniture-like face rather than Edition's newspaper composition.
- **Platform:** cobalt/cream signage, heavy sans numerals and a reversed forecast strip. A structured public-clock identity rather than Terminal's green monospace instrumentation.

Clock centers and enlarges the time; Glance adds current conditions; Weather adds six future hours and sunset. Room/location names wrap rather than silently truncate. The long-name preset exercises both. The weather selector exercises ready, stale (two-hour-old sample), missing, and expired (older than 24 hours, values hidden) states. Clock view hides every weather section. Units convert a single Fahrenheit fixture. Demo forecasts roll across midnight and follow 12/24-hour format. Live time explicitly uses the device's local zone; the fixed sample is October 20, 2026 at 23:48. Sunset is a fixed demo value, not an astronomical calculation.

## Files

- `index.html`, `gallery.css`, `gallery.js`: comparison gallery and native select controls.
- `preview.html`, `faces.css`, `preview.js`: shared semantic display structure, three visual identities, validated URL settings, local clock, and synthetic weather fixtures. One tiny inline SVG supplies the weather symbol; decorative geometry is CSS.
- `verify.cjs`: isolated Node state checks; no imports from the main app. Run `node theme-lab/verify.cjs` from the repository root.

Supported URL parameters: `face=meridian|atelier|platform`, `mode=light|dark`, `view=clock|glance|weather`, `format=12|24`, `units=f|c`, `state=ready|stale|missing|expired`, `names=short|long`, `time=live|sample`. Invalid values safely retain defaults. Example: `preview.html?face=atelier&mode=dark&view=weather&format=24&units=c&names=long&state=stale&time=sample`.

## Compatibility and verification

Browser scripts use ES5 syntax and DOM APIs, with prefixed and unprefixed flexbox. No CSS variables, Grid, flex gap, external fonts, packages, build step, continuous animations, modern networking or Intl requirement. Layout uses viewport units, ordinary borders, SVG and system fonts. Only a minute timer runs, skips hidden documents, and refreshes on focus/page-show/visibility resume. There are no seconds or blinking separators. This does not prevent screen sleep; the tablet's Auto-Lock setting remains relevant. Dark palettes reduce brightness; no claim of burn-in prevention or power savings is made.

Verification performed: JavaScript syntax checks; 288 combinations across faces, modes, views, formats, units and weather states, including midnight rollover and long names; modern in-app-browser visual spot checks of the gallery, Atelier dark/stale/Celsius/24-hour/long names, Platform expired readings, and the shared brightness control updating all preview URLs. These state checks do not establish layout correctness on every device.

Physical iPad 4 / iOS 10.3.4 Safari and Home Screen acceptance is **pending**. Modern-browser testing does not establish physical compatibility. Check at 1024×768 and with Safari bars visible: all six palettes and three views, 11:48 PM and 23:48, long names, Celsius/Fahrenheit, missing/stale/expired readings, landscape/portrait, background/resume, reload, Home Screen launch and a sustained session. Confirm no clipped numerals, rules or forecast strip; verify room-distance readability and comfortable night brightness on the actual panel.

## Integration handoff for the main chat

These are proposals, not new production theme IDs. Select the faces first. The main chat can map the selected CSS into `app/display/` later under explicit authorization:

1. Keep the production renderer's model, explicit time zone, cache validation, live weather requests and delivery/acknowledgment behavior. Do not import this fixture renderer or its device-local time logic into production.
2. Map `.time-panel`, `.clock-line`, `.weather-panel`, `.forecast-panel`, header and footer to the existing renderer's elements. Atelier needs an optional `.dial` wrapper; Meridian needs an inert decorative sun element or pseudo-element; Platform needs only style changes. Prefix selectors with the selected production theme to avoid changing existing faces.
3. Map model theme/mode/view to scoped attributes or classes. Translate `celsius`/`fahrenheit` and `hour12`/`hour24` at the existing model boundary, not through these lab URLs. Preserve escaping via `textContent` and allow wrapping for user-provided names.
4. Feed real weather and freshness labels from the existing renderer; remove DEMO labels only after the data source is actually live. Keep missing/expired placeholders and age/error labels. Preserve Clock's zero-weather-request behavior.
5. Add approved theme IDs to controller previews and validation, with safe older-client defaults. Run existing regression suites and the physical-device matrix before release. Never change pairing storage or import lab state as room settings.

The current root dashboard, five existing faces, `/app/`, backends, tests, shared docs and configuration were left untouched by this lab work. Other chats' pre-existing repository changes are outside its scope.
