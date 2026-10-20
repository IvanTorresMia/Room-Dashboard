import catalog from '../theme-catalog.js';
const THEMES = catalog.ids;
const VIEWS = ['clock', 'glance', 'weather'];
export function validState(value) {
  return value && Object.keys(value).length === 3 && THEMES.includes(value.theme) && VIEWS.includes(value.view) && ['light', 'dark'].includes(value.mode);
}
function unpack(row) {
  return { settings: JSON.parse(row.settings), revision: row.revision, confirmedRevision: row.confirmed_revision, displaySeen: row.display_seen };
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowed = [env.ALLOWED_ORIGIN || 'https://ivantorresmia.github.io', 'http://127.0.0.1:8765', 'http://localhost:8765'];
    const cors = { 'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0], 'Vary': 'Origin', 'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Max-Age': '86400', 'Cache-Control': 'no-store' };
    const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
    if (origin && !allowed.includes(origin)) return reply({ error: 'Origin not allowed' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const path = new URL(request.url).pathname;
    if (path === '/health' && request.method === 'GET') return reply({ ok: true });
    if (!['/settings', '/ack', '/pair', '/claim'].includes(path)) return reply({ error: 'Not found' }, 404);
    if (!env.ROOM_KEY) return reply({ error: 'Remote control has not been configured' }, 503);
    if (path === '/claim' && request.method === 'POST') {
      try {
        const text = await request.text();
        if (text.length > 100) return reply({ error: 'Invalid code' }, 400);
        const body = JSON.parse(text);
        if (!body || typeof body.code !== 'string' || !/^[A-HJ-NP-Z2-9]{12}$/.test(body.code)) return reply({ error: 'Invalid code' }, 400);
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body.code));
        const hash = Array.from(new Uint8Array(digest), x => x.toString(16).padStart(2, '0')).join('');
        const claimed = await env.DB.prepare('DELETE FROM pairing WHERE id = 1 AND code_hash = ? AND expires > ? RETURNING id').bind(hash, Date.now()).first();
        return claimed ? reply({ key: env.ROOM_KEY }) : reply({ error: 'Code expired or used' }, 401);
      } catch { return reply({ error: 'Could not claim code' }, 400); }
    }
    const authorization = request.headers.get('Authorization') || '';
    if (!/^Bearer [a-f0-9]{64}$/.test(authorization)) return reply({ error: 'Pair this device first' }, 401);
    const received = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(authorization.slice(7))));
    const expected = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(env.ROOM_KEY)));
    let different = 0;
    for (let i = 0; i < received.length; i++) different |= received[i] ^ expected[i];
    if (different) return reply({ error: 'Invalid pairing key' }, 401);
    try {
      if (path === '/pair' && request.method === 'POST') {
        const bytes = crypto.getRandomValues(new Uint8Array(12));
        const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const code = Array.from(bytes, x => alphabet[x % 32]).join('');
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code));
        const hash = Array.from(new Uint8Array(digest), x => x.toString(16).padStart(2, '0')).join('');
        await env.DB.prepare('INSERT OR REPLACE INTO pairing (id, code_hash, expires) VALUES (1, ?, ?)').bind(hash, Date.now() + 600000).run();
        return reply({ code: code.match(/.{4}/g).join('-') });
      }
      if (path === '/settings' && request.method === 'GET') {
        return reply(unpack(await env.DB.prepare('SELECT * FROM room WHERE id = 1').first()));
      }
      if (request.method !== 'PUT' && request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
      const text = await request.text();
      if (text.length > 1024) return reply({ error: 'Request too large' }, 413);
      let body;
      try { body = JSON.parse(text); } catch { return reply({ error: 'Invalid JSON' }, 400); }
      if (!body || !Number.isSafeInteger(body.revision) || body.revision < 0) return reply({ error: 'Invalid revision' }, 400);
      if (path === '/ack' && request.method === 'POST') {
        await env.DB.prepare('UPDATE room SET confirmed_revision = ?, display_seen = ? WHERE id = 1 AND revision = ?').bind(body.revision, Date.now(), body.revision).run();
        return reply({ ok: true });
      }
      if (path === '/settings' && request.method === 'PUT') {
        if (!validState(body.settings)) return reply({ error: 'Invalid settings' }, 400);
        const changed = await env.DB.prepare('UPDATE room SET settings = ?, revision = revision + 1 WHERE id = 1 AND revision = ?').bind(JSON.stringify(body.settings), body.revision).run();
        const row = await env.DB.prepare('SELECT * FROM room WHERE id = 1').first();
        return reply(unpack(row), changed.meta.changes ? 200 : 409);
      }
      return reply({ error: 'Method not allowed' }, 405);
    } catch {
      return reply({ error: 'Remote storage is unavailable' }, 503);
    }
  }
};
