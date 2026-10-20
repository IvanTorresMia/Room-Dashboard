(function () {
  'use strict';
  var options = { face: 'meridian', mode: 'light', view: 'weather', format: '12', units: 'f', state: 'ready', names: 'short', time: 'live' };
  var allowed = { face: ['meridian', 'atelier', 'platform'], mode: ['light', 'dark'], view: ['clock', 'glance', 'weather'], format: ['12', '24'], units: ['f', 'c'], state: ['ready', 'stale', 'missing', 'expired'], names: ['short', 'long'], time: ['live', 'sample'] };
  function el(id) { return document.getElementById(id); }
  function put(id, text) { el(id).textContent = text; }
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function temperature(n) { return Math.round(options.units === 'c' ? (n - 32) * 5 / 9 : n) + '°'; }
  function timeLabel(hour, minute) { return options.format === '24' ? pad(hour) + ':' + pad(minute) : (hour % 12 || 12) + ':' + pad(minute); }
  function now() { return options.time === 'sample' ? new Date(2026, 9, 20, 23, 48) : new Date(); }
  function tick() {
    var d = now(), h = d.getHours();
    put('clock', timeLabel(h, d.getMinutes())); put('period', options.format === '24' ? '' : h < 12 ? 'AM' : 'PM');
    put('date', ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()] + ', ' + ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][d.getMonth()] + ' ' + d.getDate());
  }
  function render() {
    document.body.className = options.face + ' ' + options.mode + ' ' + options.view + ' ' + options.state;
    put('signature', { meridian: 'THE HOURS, UNHURRIED', atelier: 'A MOMENT AT HOME', platform: 'LOCAL TIME / ROOM SERVICE' }[options.face]);
    put('face-label', options.face.toUpperCase() + ' / ' + { meridian: '01', atelier: '02', platform: '03' }[options.face]);
    var room = options.names === 'long' ? 'The upstairs reading room & west-facing winter garden' : 'Living room';
    var place = options.names === 'long' ? 'San Francisco Bay Area, California, United States' : 'Redding, California';
    put('room', room); put('location', options.view === 'clock' ? 'A QUIET PLACE TO BE' : place);
    el('room').title = room; el('location').title = place;
    document.title = options.face.charAt(0).toUpperCase() + options.face.slice(1) + ' · Face lab';
    var unavailable = options.state === 'missing' || options.state === 'expired';
    put('temperature', unavailable ? '--' : temperature(72).replace('°', '')); put('unit', options.units === 'c' ? '°C' : '°F');
    put('condition', unavailable ? 'Weather unavailable' : 'Partly cloudy');
    put('detail', unavailable ? 'Waiting for a new reading' : 'Feels ' + temperature(71) + ' · H ' + temperature(76) + ' / L ' + temperature(54));
    put('sunset', unavailable ? 'SUNSET —' : options.format === '24' ? 'SUNSET 18:21' : 'SUNSET 6:21 PM');
    put('status', options.view === 'clock' ? 'THEME PROTOTYPE · DEVICE LOCAL TIME' : { ready: 'DEMO DATA · SAMPLE WEATHER', stale: 'DEMO DATA · SAVED READING · 2 HOURS OLD', missing: 'DEMO STATE · NO WEATHER READING', expired: 'DEMO STATE · READING OVER 24 HOURS OLD · HIDDEN' }[options.state]);
    el('forecast').textContent = '';
    var start = now().getHours(), values = [73, 74, 73, 70, 67, 64], i, node, label, value, hour;
    for (i = 0; i < 6; i++) {
      hour = (start + i + 1) % 24; node = document.createElement('div'); node.className = 'hour';
      label = document.createElement('span'); label.textContent = options.format === '24' ? pad(hour) + ':00' : (hour % 12 || 12) + (hour < 12 ? ' AM' : ' PM');
      value = document.createElement('strong'); value.textContent = unavailable ? '—' : temperature(values[i]);
      node.appendChild(label); node.appendChild(value); el('forecast').appendChild(node);
    }
    tick();
  }
  location.search.slice(1).split('&').forEach(function (pair) {
    var parts = pair.split('='), key = parts[0], value;
    try { value = decodeURIComponent(parts[1] || ''); } catch (ignored) { return; }
    if (allowed[key] && allowed[key].indexOf(value) !== -1) { options[key] = value; }
  });
  render();
  setInterval(function () { if (!document.hidden) { render(); } }, 60000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { render(); } });
  window.addEventListener('pageshow', render); window.addEventListener('focus', render);
}());
