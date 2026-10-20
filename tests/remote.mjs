import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import vm from 'node:vm';
import worker from '../backend/worker.mjs';
const sql = new DatabaseSync(':memory:');
sql.exec(fs.readFileSync(new URL('../backend/schema.sql', import.meta.url), 'utf8'));
const DB = { prepare(query) {
  let args = [];
  return { bind(...values) { args = values; return this; }, async first() { return sql.prepare(query).get(...args) || null; }, async run() { const result = sql.prepare(query).run(...args); return { meta: { changes: result.changes } }; } };
} };
const key = 'a'.repeat(64);
const endpoint = 'https://ivans-room-remote.example.workers.dev';
const env = { DB, ROOM_KEY: key };
async function api(path, method = 'GET', body, token = key, origin = 'https://ivantorresmia.github.io') {
  const headers = { Origin: origin };
  if (token) headers.Authorization = 'Bearer ' + token;
  if (body) headers['Content-Type'] = 'application/json';
  const response = await worker.fetch(new Request(endpoint + path, { method, headers, body: body ? JSON.stringify(body) : undefined }), env);
  return { status: response.status, body: await response.json() };
}
assert.equal((await api('/settings', 'GET', null, '')).status, 401);
assert.equal((await api('/settings', 'GET', null, 'b'.repeat(64))).status, 401);
assert.equal((await api('/settings', 'GET', null, key, 'https://example.org')).status, 403);
let response = await api('/settings');
assert.equal(response.body.revision, 0);
assert.equal((await api('/settings', 'PUT', {revision:0,settings:{theme:'bad',view:'clock',mode:'dark'}})).status, 400);
response = await api('/settings', 'PUT', {revision:0,settings:{theme:'tide',view:'clock',mode:'light'}});
assert.equal(response.status, 200);
assert.equal(response.body.revision, 1);
assert.equal((await api('/settings', 'PUT', {revision:0,settings:{theme:'calm',view:'weather',mode:'dark'}})).status, 409);
await api('/ack', 'POST', { revision: 0 });
assert.equal((await api('/settings')).body.confirmedRevision, -1);
await api('/ack', 'POST', { revision: 1 });
assert.equal((await api('/settings')).body.confirmedRevision, 1);
let code = (await api('/pair', 'POST', {})).body.code.replace(/-/g, '');
assert.equal((await api('/claim', 'POST', {code:'AAAAAAAAAAAA'}, '')).status, 401);
assert.equal((await api('/claim', 'POST', {code}, '')).body.key, key);
assert.equal((await api('/claim', 'POST', {code}, '')).status, 401);
code = (await api('/pair', 'POST', {})).body.code.replace(/-/g, '');
sql.exec('UPDATE pairing SET expires = 0');
assert.equal((await api('/claim', 'POST', {code}, '')).status, 401);
const promises = [];
function device(controller, storageEnabled = true) {
  const events = {};
  const intervals = [];
  const storage = {'room-appearance-v1': JSON.stringify({theme:'keycap',mode:'light'}), 'room-remote-v1': JSON.stringify({endpoint,key})};
  let offline = false;
  const document = {hidden:false, getElementById() { return null; }, addEventListener(name, callback) { (events[name] ||= []).push(callback); }};
  const window = { addEventListener(name, callback) { (events[name] ||= []).push(callback); }};
  function XHR() { this.headers = {Origin:'https://ivantorresmia.github.io'}; }
  XHR.prototype.open = function(method,url) { this.method=method; this.url=url; };
  XHR.prototype.setRequestHeader = function(key,value) { this.headers[key]=value; };
  XHR.prototype.send = function(body) {
    const request = this;
    promises.push((async () => {
      if (offline) { request.onerror(); return; }
      const result = await worker.fetch(new Request(request.url, { method:request.method, headers:request.headers, body:body || undefined }), env);
      request.status=result.status; request.responseText=await result.text(); request.onload();
    })());
  };
  const context = vm.createContext({window,document,location:{pathname:controller?'/Room-Dashboard/control/':'/Room-Dashboard/',search:'',hash:'',origin:'https://ivantorresmia.github.io'},history:{},XMLHttpRequest:XHR,localStorage:{getItem(k){ if(!storageEnabled)throw Error();return storage[k] || null;},setItem(k,v){if(!storageEnabled)throw Error();storage[k]=v;},removeItem(k){delete storage[k];}},setInterval(fn){intervals.push(fn);},setTimeout(fn){promises.push(Promise.resolve().then(fn));},console});
  vm.runInContext(fs.readFileSync(new URL('../theme-catalog.js',import.meta.url),'utf8'),context);
  vm.runInContext(fs.readFileSync(new URL('../state.js',import.meta.url),'utf8'),context);
  // Legacy preferences migrate without losing the selected face.
  assert.equal(window.RoomState.get().view,'weather');
  if(storageEnabled)assert.equal(window.RoomState.get().theme,'keycap');
  vm.runInContext(fs.readFileSync(new URL('../remote.js',import.meta.url),'utf8'),context);
  for(const callback of events.DOMContentLoaded || [])callback();
  return {state:window.RoomState,remote:window.RoomRemote,poll:()=>intervals[0](),offline(value){offline=value;}};
}
async function settle() { while(promises.length)await Promise.all(promises.splice(0)); }
const display = device(false);
const control = device(true);
await settle();
assert.equal(control.state.get().view,'clock');
control.state.set({theme:'edition',mode:'dark',view:'glance'});
await settle(); display.poll(); await settle(); control.poll(); await settle();
assert.equal(display.state.get().view,'glance');
assert.equal((await api('/settings')).body.confirmedRevision,(await api('/settings')).body.revision);
display.state.set({theme:'terminal',mode:'light',view:'weather'});
await settle(); control.poll(); await settle();
assert.equal(control.state.get().theme,'terminal');
control.offline(true);control.state.set({theme:'tide',mode:'dark',view:'clock'});await settle();
assert.equal((await api('/settings')).body.settings.theme,'terminal');
control.offline(false);control.poll();await settle();display.poll();await settle();
assert.equal(display.state.get().theme,'tide');
assert.equal(display.state.get().view,'clock');
for (const theme of ['meridian', 'atelier', 'platform']) {
  for (const mode of ['light', 'dark']) {
    for (const view of ['clock', 'glance', 'weather']) {
      assert.equal(control.state.set({theme,mode,view}),true);
      await settle(); display.poll(); await settle(); control.poll(); await settle();
      assert.equal(display.state.get().theme,theme);
      assert.equal(display.state.get().mode,mode);
      assert.equal(display.state.get().view,view);
      const saved=await api('/settings');
      assert.equal(saved.body.confirmedRevision,saved.body.revision);
    }
  }
}
// A display with an older validator must distinguish unsupported settings from offline.
const olderDisplay = device(false);
const currentValid = olderDisplay.state.valid;
olderDisplay.state.valid = value => currentValid(value) && ['calm','keycap','edition','terminal','tide'].includes(value.theme);
const messages = [];
olderDisplay.remote.subscribe(message => messages.push(message));
control.state.set({theme:'meridian',mode:'light',view:'weather'});
await settle(); olderDisplay.poll(); await settle();
assert.match(messages.at(-1), /Display update needed/);
const unacknowledged = await api('/settings');
assert.notEqual(unacknowledged.body.confirmedRevision, unacknowledged.body.revision);
control.state.set({theme:'calm',mode:'dark',view:'clock'});
await settle(); olderDisplay.poll(); await settle();
assert.equal(olderDisplay.state.get().theme, 'calm');
assert.equal(messages.at(-1), 'Connected');
olderDisplay.offline(true); olderDisplay.poll(); await settle();
assert.equal(messages.at(-1), 'Offline · local controls still work');
const unavailable=device(true,false);await settle();assert.equal(unavailable.remote.paired(),false);
assert.equal(unavailable.state.set({theme:'tide',mode:'light',view:'glance'}),true);
console.log('Passed: Worker auth/CORS, state validation, conflict protection, display acknowledgment, one-use/expired pairing, legacy settings migration, bidirectional sync, offline retry, and unavailable storage.');
