# Remote control backend

The dashboard and controller stay on GitHub Pages. A Cloudflare Worker and D1 database store only the selected view, face, brightness, revision, and display acknowledgment. No paid products or plan upgrades are required.

## Deploy or restore

1. Stay on **Workers Free**. Do not enable Workers Paid for this dashboard. On Free, reaching quotas stops service; do not upgrade to bypass a quota.
2. In this folder, run `npm ci`, then `npx wrangler login --scopes account:read user:read workers:write workers_scripts:write d1:write`.
3. For an existing deployment, reuse the existing `ivans-room-remote` database. For a new installation only, run `npx wrangler d1 create ivans-room-remote`.
4. Copy `wrangler.example.json` to the ignored `wrangler.json`, enter the database ID, and optionally your account ID. Keep the binding name `DB`.
5. Run `npx wrangler d1 execute ivans-room-remote --remote --file=schema.sql`. The schema preserves existing settings.
6. Run `npx wrangler deploy`.
7. Generate a 32-byte random room key locally in the ignored `.pairing.json` file as `{"key":"64 hexadecimal characters"}`. Keep it private. Run `node set-room-key.mjs` to upload it as a Cloudflare secret without printing it or putting it in command arguments.
8. Set the public Worker address in the root `remote-config.js` and push it to GitHub. Never put the room key there.
9. On `/control/`, open **First-time setup / advanced connection**, enter that Worker address and the room key, then connect. Pair other devices with one-use codes.

## Pairing

On a connected control page, open **Pair devices → Generate pairing code**. On the iPad or phone, open `/control/`, enter that code, and connect. Then use the **Ivan's Room** link to open the display. Codes are 60 random bits, expire in ten minutes, are stored only as a hash, and can be claimed once. Generating a code invalidates the previous unused one.

The private display link is an alternative. Its key travels in a URL fragment, is saved on that device, and is removed from the address bar. Disconnect removes that browser's saved pairing, but does not revoke its old key. To revoke all existing devices, rotate `ROOM_KEY`, clear any outstanding pairing code, then reconnect your devices. Never share pairing links publicly.

## Limits and recovery

Both display and controller poll every five seconds only while visible; the preview never connects to the backend or acknowledges changes. The display reports its applied revision every thirty seconds or after a change. The controller only says **Confirmed on display** after that acknowledgment. Several wall-display tabs count as several displays; the confirmation means at least one paired display applied the settings.

A controller change updates its local preview immediately. Disconnected browsers keep working locally; pending changes retry while that page stays open. Reloading before a change is sent discards the pending send, and the server's saved selection wins after reconnecting. This is intentional to avoid an old device overwriting newer selections after a restart.

Keep the account on Free. Requests and database operations have hard daily quotas. No paid add-ons, custom domains, AI, subscriptions, or external fonts are used. The default five-second polling for one display and one visible controller is below the free request allowance. Existing applications share account quotas. If sync reaches a limit, local display controls continue working.

Run `node ../tests/remote.mjs` (Node 22.13+ with `node:sqlite`) for authentication, validation, conflict, pairing, and synchronization tests. Run `node ../tests/dashboard.cjs` for clock and weather tests. Use `npx wrangler dev` for a local Worker preview; production CORS permits GitHub Pages and the local dashboard server on port 8765.
