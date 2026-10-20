# Theme catalog and integration status

`/theme-catalog.js` is the canonical catalog of stable IDs, names, descriptions and base light/dark colors. It is ES5 and exposes `window.RoomThemes` in a browser, or CommonJS exports for the Worker and Node tests. Display content and theme are independent: each face supports Clock, Glance and Weather. Brightness is independent too. Keep existing IDs stable as new faces arrive.

| ID | Identity | Current dashboard/controller | Larger `/app/` renderer |
| --- | --- | --- | --- |
| calm | Warm landscape | Integrated | Existing prototype interpretation |
| keycap | Gray/orange keyboard | Integrated | Existing prototype interpretation |
| edition | Serif newspaper | Integrated | Existing prototype interpretation |
| terminal | Green instrument panel | Integrated | Existing prototype interpretation |
| tide | Ocean rounded cards | Integrated | Existing prototype interpretation |
| meridian | Warm geometric poster | Integrated | Pending integration |
| atelier | Plum/ivory circular mantel clock | Integrated | Pending integration |
| platform | Cobalt station signage | Integrated | Pending integration |

The current display and remote Worker validate against the same catalog. `appearance.js` reads its names/colors, while the static accessible buttons in `index.html` and `control/index.html` are checked against all catalog IDs by `tests/theme-catalog.cjs`. `themes.css` adapts the three new visual identities to the real renderer's clock, weather, cache/error labels, forecast and sunset. The existing five remain in `style.css` / `faces.css`. No demo weather code enters the production dashboard. Pairing keys, storage namespaces, database schema and endpoint remain unchanged.

The lab's `preview.html` stays a standalone synthetic-data design playground. Its settings and fixtures are deliberately separate from production. The original lab README describes that prototype layer; this file records the subsequent authorized production integration.

For the larger app's owning chat: adopt this catalog rather than inventing new theme IDs. Load it before the model/renderer (resolve the root-relative location using the deployment base); update model/backend-v2 validation and controller choices together. Port styles to the `/app/display/` semantic structure, keeping its explicit timezone, configurable units, long names, freshness, revision and acknowledgment handling. Do not replace that app's model or import the legacy sync or lab fixtures. Full CSS normalization is a future extraction after both renderers have physical-device checks; they currently share identities, not one stylesheet or component tree.

Future non-clock/non-weather ideas should be separate **content views** when they change the information or behavior, and **themes** when they only change presentation. This avoids duplicating every visual identity for each content type. Add a capability contract and safe older-client fallback before introducing new content views; current displays know only Clock, Glance and Weather.

## Updating the installed iPad and phone

After the Pages and Worker updates are available, reload the existing `/control/` page on the paired phone. Fully close and reopen the installed iPad Home Screen display, or reload its Safari tab, to fetch the updated renderer. Existing pairings are retained in the same running context; do not clear site data or create a new pairing to update. If a restored Home Screen page still shows the old picker, navigate that installed display to the same dashboard with `?v=8` to force a fresh document, preserving the origin and storage context. Reopen/reload normally first.

Choose Meridian, Atelier or Platform and wait for **Confirmed on display**. A phone preview alone is not evidence the iPad received it. An old display that has not refreshed cannot recognize the new IDs, so load the new code on both devices before selecting a new face. Physical iPad 4 / iOS 10.3.4 Safari and Home Screen visual acceptance is still pending; modern-browser and in-memory sync tests do not prove hardware compatibility.

### Cached Home Screen recovery (display version 9)

An installed page running the original five-theme validator rejects a valid response containing a newer theme. Previously this was incorrectly reported as “Offline · local controls still work.” `remote.js` now distinguishes a successful response with unsupported settings from a network failure and asks for a display update; it does not acknowledge a revision it cannot render. Regression coverage reproduces old faces working while new faces are rejected.

The connection panel now includes **Update display**, a same-context navigation with a timestamp query. It preserves the running app's origin and pairing storage rather than opening Safari. The panel identifies “Display version 9 · 8 faces.” New pairing script code also inserts the link when loaded by an older HTML document. A frozen five-theme fallback in the state/appearance scripts prevents older HTML without the catalog script from crashing during a mixed-cache refresh; the canonical catalog remains authoritative when loaded.

A fully cached older document and older scripts cannot receive this recovery UI until they load new code. First fully quit and reopen the Home Screen app, then inspect its own picker (not the phone's). If it still lists only five faces, a refreshed launch URL in Safari can verify the new display, but Safari pairing remains separate from Home Screen pairing. Do not clear site data as the first recovery step.

## Independent palettes (display version 10)

The current dashboard/controller now have independent `theme`, `palette`, `mode`, and `view` fields. `theme` retains all eight stable face IDs. `palette` is `recommended`, `orange`, `blue`, `red`, or `green`. The palette names and explicit light/dark roles live in `theme-catalog.js`; the saved appearance key remains `room-appearance-v1`, with no pairing-key changes. Missing/invalid palettes in saved local preferences default to Recommended while preserving recognized face/mode/view. New unknown palette selections are rejected.

Recommended applies no palette overrides, preserving each face's existing visual treatment. Changing faces while Recommended is selected follows the new face's original colors. Explicitly selected palettes stay selected across face, brightness and content changes. The controller offers labeled swatches and **Use recommended colors**; the iPad's existing face picker includes the palette selector/reset. These colors preserve the face's typography and geometry: Terminal stays monospace, Edition stays serif, Tide retains its cards, Keycap retains its keyboard forms, Atelier retains its dial, Meridian retains its geometry and Platform retains its contrasting forecast strip.

`palettes.css` is checked in, served directly after the existing face/view styles, and applies only to explicit custom palettes. There is no build step or runtime CSS-variable dependency. The optional maintainer helper `node theme-lab/generate-palettes.cjs` regenerates the stylesheet from the catalog; `--check` verifies parity. Original palettes remain in the original face styles. The tech colors have explicit text/muted/accent/surface/border/on-accent roles. Light orange uses a slightly darker accent than the lab's first color study to preserve small-text contrast on cards.

### Sync compatibility

The existing Worker accepts old three-field settings as Recommended and new four-field settings with a validated palette. The settings JSON holds the new field; no database migration/schema execution is needed. The new remote client advertises `X-Room-Appearance-Version: 2` only if both the state API and the document declare palette support (the `appearance-capability` meta marker plus `RoomState.appearanceVersion`). The CORS allowlist includes that request header.

For a legacy client, the Worker returns three-field settings while the room uses Recommended. When a custom palette is selected it returns HTTP 426 instead, and rejects legacy acknowledgments and legacy writes for that custom-palette state. This prevents an old cached display from confirming a palette it cannot render or silently clearing it. A supported client receives the explicit normalized palette, including Recommended for a preexisting three-field room. Authentication, pairing claims/codes, revision checks, weather requests/cache and storage namespaces remain unchanged. This version marker is a rendering capability, not a security credential.

Reload the phone controller and fully quit/reopen the iPad Home Screen app before selecting a custom palette. The iPad connection panel identifies **Display version 10 · 8 faces · 5 palettes** and retains **Update display** for same-context refresh. Do not clear website data or re-pair for this update. A display with code that predates the version marker may show its older generic offline/update message until refreshed; its pairing is still intact.

### Verification and larger-app handoff

`node tests/palettes.cjs` checks 240 setting combinations, local migration/persistence, actual controller actions retaining explicit palettes, recommended reset/follow-face behavior, both picker lists, pairing-storage isolation and at least 4.5:1 contrast for custom text/muted/accent roles on background and surface (and on-accent text on accent). `node tests/remote.mjs` checks all 240 combinations through the in-memory Worker + controller + display + acknowledgment path, legacy three-field compatibility, invalid palettes and rejection of unsupported acknowledgments/mixed-cache clients. Existing clock/weather, pairing and catalog/update-link checks pass.

Modern-browser visual checks cover the controller's labeled swatches, sticky desktop preview, palette persistence after reload, Edition/Ion Blue, Platform/Laser Red/light, and palette changes across Keycap/Atelier/Terminal/Tide/Calm/Meridian. The palette roles and shared style rules cover all eight faces; physical iPad 4 / iOS 10.3.4 Safari/Home Screen visual acceptance for the full matrix remains pending.

The larger `/app/` and account backend are not changed here. The owning chat should adopt the same palette IDs and default/migration rules, separate content/face/palette/brightness in room settings, and port role overrides to its renderer. Account presets remain separate future work. Do not copy this legacy shared-key sync protocol into the account backend.
