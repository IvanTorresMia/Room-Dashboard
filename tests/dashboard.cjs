// Run with node tests/dashboard.cjs. Tests use synthetic weather, never shown in the app.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../app.js'), 'utf8');
function boot(iso, options = {}) {
  let now = Date.parse(iso);
  const elements = {};
  const requests = [];
  const intervals = [];
  const events = {};
  const storage = {};
  if (options.cache) storage['room-weather-v1'] = JSON.stringify(options.cache);
  function element(id) {
    return elements[id] || (elements[id] = {textContent: '', innerHTML: '', addEventListener(name, fn) { this[name] = fn; }});
  }
  class Clock extends Date { static now() { return now; } }
  function Request() { requests.push(this); }
  Request.prototype.open = function () {};
  Request.prototype.send = function () {};
  const document = {hidden: false, getElementById: element, addEventListener(name, fn) { events[name] = fn; }};
  vm.runInNewContext(source, { Date: Clock, document, window: {addEventListener(name, fn) { events[name] = fn; }},
    localStorage: {getItem(key) { if (options.storageBlocked) throw Error(); return storage[key] || null; }, setItem(key, value) { if (options.storageBlocked) throw Error(); storage[key] = value; }},
    XMLHttpRequest: Request, setInterval(fn, ms) { intervals.push({fn, ms}); }});
  return {elements, requests, intervals, events, document, advance(ms) { now += ms; }, reply(data) { const req = requests[requests.length - 1]; req.status = 200; req.responseText = JSON.stringify(data); req.onload(); }};
}
function fixture() {
  const midnight = Date.parse('2026-10-17T07:00:00Z') / 1000;
  const hours = Array.from({length: 72}, (_, i) => midnight + i * 3600);
  return {current: {temperature_2m: 80.3, apparent_temperature: 79.1, weather_code: 0, is_day: 1},
    hourly: {time: hours, temperature_2m: hours.map(() => 75), weather_code: hours.map(() => 0), is_day: hours.map(() => 1), precipitation_probability: hours.map(() => 5)},
    daily: {time: [midnight, midnight + 86400, midnight + 172800], temperature_2m_max: [85, 86, 87], temperature_2m_min: [50, 51, 52], sunrise: [midnight + 7 * 3600, midnight + 31 * 3600, midnight + 55 * 3600], sunset: [midnight + 18 * 3600, midnight + 42 * 3600, midnight + 66 * 3600], precipitation_probability_max: [10, 20, 30]}};
}
const transitions = [
  ['2026-03-08T09:59:00Z', '1:59', 'AM'], ['2026-03-08T10:00:00Z', '3:00', 'AM'],
  ['2026-11-01T08:59:00Z', '1:59', 'AM'], ['2026-11-01T09:00:00Z', '1:00', 'AM'],
  ['2026-10-18T07:00:00Z', '12:00', 'AM']
];
for (const [date, clock, period] of transitions) {
  const app = boot(date);
  assert.equal(app.elements.clock.textContent, clock);
  assert.equal(app.elements.meridiem.textContent, period);
}
let app = boot('2026-10-18T00:00:00Z');
app.reply(fixture());
assert.equal(app.elements.temperature.textContent, 80);
assert.equal((app.elements.forecast.innerHTML.match(/class="forecast-hour"/g) || []).length, 6);
assert.equal(app.elements['sun-label'].textContent, 'SUNSET');
assert.equal(app.elements.refresh.disabled, false);
app.advance(2 * 3600000);
app.intervals[0].fn();
assert.equal(app.elements['sun-label'].textContent, 'SUNRISE');
assert.match(app.elements['feels-like'].textContent, /Last reading/);
app.elements.refresh.click();
app.requests[1].onerror();
assert.match(app.elements.status.textContent, /Connection lost/);
assert.equal(app.elements.temperature.textContent, 80);
app.advance(6 * 3600000);
app.intervals[0].fn();
assert.equal(app.elements.high.textContent, '86°');
assert.equal(app.elements['sun-label'].textContent, 'SUNRISE');
app = boot('2026-10-18T00:00:00Z', {storageBlocked: true});
app.requests[0].ontimeout();
assert.equal(app.elements.condition.textContent, 'Weather unavailable');
assert.equal(app.elements.refresh.disabled, false);
app.elements.refresh.click();
app.reply(fixture());
assert.equal(app.elements.temperature.textContent, 80);
app = boot('2026-10-18T00:00:00Z');
const incomplete = fixture(); incomplete.hourly.temperature_2m[0] = null;
app.reply(incomplete);
assert.equal(app.elements.condition.textContent, 'Weather unavailable');
app = boot('2026-10-18T00:00:00Z', {cache: {data: fixture(), savedAt: Date.parse('2026-10-17T23:00:00Z')}});
assert.equal(app.elements.temperature.textContent, 80);
app.requests[0].onerror();
assert.match(app.elements.status.textContent, /Connection lost/);
app = boot('2026-10-18T00:00:00Z', {cache: {data: fixture(), savedAt: Date.parse('2026-10-16T23:00:00Z')}});
assert.equal(app.elements.temperature, undefined);
app.document.hidden = true;
app.intervals[1].fn();
assert.equal(app.requests.length, 1);
console.log('Passed: Pacific clock / DST, forecast, sunset / sunrise, midnight rollover, offline cache, timeout / retry, blocked storage, malformed response, and hidden-page polling.');
