# Approved WeatherAPI work — October 23, 2026

Ivan approved the existing faces as shown in the actual-renderer preview and requested finalization, push and deployment handoff. Preserve all existing face designs. This approval does not mean the fixture preview is a completed live migration.

## Completed here

- backend-v2/weatherapi.mjs: server adapter, normalization to existing current/hourly/daily fields, condition mapping, assigned coordinates, °C/°F, secret-free cache keys, size/timeout/error bounds, 15-minute cache capped by current observation expiry, location search.
- tests/weatherapi.mjs: synthetic fixture checks pass. No live key/provider or physical-iPad acceptance claimed.
- marketing/faces-review.html and marketing/face-review/: actual display HTML/CSS/JS with isolated sample XHR and room settings. Proposed credit is overridden only in this fixture. It does not modify saved rooms/pairings. Review-only files must be excluded from public packaging.
- marketing/weather-review.html: historical illustrative comparison, not production source.

## Integration still REQUIRED

Current app/display/display.js still calls Open-Meteo directly. backend-v2/devices.mjs and app/account/account.js are not wired to WeatherAPI. There is no configured/verified real key in this chat. The new adapter alone does not switch weather.

App UX & Integration owns completing this work before shipping the provider switch:
1. Securely configure WEATHERAPI_KEY as Worker secret; do not request it in chat or include it in source, public cache URLs or logs. Start Free plan; do not buy automatically.
2. Use fetchForecast(room,key,options) behind existing authenticated display weather endpoint. Replace direct production Open-Meteo calls; no silent cross-provider fallback. Add verified-account/rate-limited server city search using searchLocations(query,key,options).
3. Keep source/version-aware browser caches. Purge old data correctly. Terms cap current-condition caching at 60 minutes and forecast at24h; expiring the combined payload at currentExpiresAt is conservative. Do not relabel old Open-Meteo readings as WeatherAPI. Unknown mapped code -1 must not render clear skies through existing <= comparisons.
4. Use metadata attribution and include a conspicuous intelligible weather disclaimer. Preserve current face compositions as far as practical; show any necessary disclaimer placement for review. Respect provider terms at https://www.weatherapi.com/terms (cache limits, attribution, disclaimer, keys).
5. Test real upstream response and city search, quota/errors, key isolation, units, midnight/DST, saved readings, clock-only request suppression, room-switch cancellation, auth/isolation and existing renderer/device suites. Then verify both physical iPads.
6. Update public support/privacy wording AFTER verified behavior. They currently describe older 24h current cache/Open-Meteo flow; do not publish stale claims. Account deletion reportedly deployed in your chat; confirm its actual process before updating policies.
7. Deploy via app owner with explicit public-file allowlist. Exclude ALL internal marketing review pages/directories/tools/docs. Preserve existing domains, devices, UID enrollment and other chats' work. Verify public-root routing separately from API origin authorization.

## Adapter interface

fetchForecast(room,key,{upstream,cache,now}) → normalized provider-tagged weather payload.
searchLocations(query,key,{upstream}) → [{name,latitude,longitude}].
normalizeForecast(data,units,now) and weatherCode(code) also exported.
Test: node tests/weatherapi.mjs.
