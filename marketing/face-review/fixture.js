/* Isolated review fixture only. No saved-room, credential or production files changed. */
(function () {
  'use strict';
  var M = window.RoomApp, params = {}, now = Date.now(), start = Math.floor(now / 3600000) * 3600, i;
  location.search.slice(1).split('&').forEach(function (pair) { var p = pair.split('='); params[p[0]] = decodeURIComponent(p[1] || ''); });
  var room = M.defaults('review'); room.name = 'SAMPLE WEATHER'; room.theme = window.RoomThemes.ids.indexOf(params.face) >= 0 ? params.face : 'calm'; room.mode = params.mode === 'dark' ? 'dark' : 'light'; room.view = params.view === 'glance' ? 'glance' : params.view === 'clock' ? 'clock' : 'weather'; room.location = { name: 'Redding · demo data', latitude: 40.5865, longitude: -122.3917 }; room.palette = 'recommended'; room.displayScale = 'balanced';
  M.read = function () { return { rooms: [room], persisted: true, message: '' }; };
  var data = { provider: 'weatherapi', current: { temperature_2m: 68, apparent_temperature: 67, weather_code: 0 }, hourly: { time: [], temperature_2m: [] }, daily: { time: [], temperature_2m_max: [], temperature_2m_min: [] } };
  for (i = 0; i < 72; i++) { data.hourly.time.push(start + i * 3600); data.hourly.temperature_2m.push([68,70,73,75,77,76,74,71][i % 8]); }
  // Hourly epochs cover current room-local date, so the renderer can select today's high/low.
  for (i = -1; i < 3; i++) { data.daily.time.push(start + i * 86400); data.daily.temperature_2m_max.push(77); data.daily.temperature_2m_min.push(50); }
  window.XMLHttpRequest = function () { this.open = function () {}; this.abort = function () { this.cancelled = true; }; this.send = function () { var self = this; setTimeout(function () { if (self.cancelled) { return; } self.status = 200; self.responseText = JSON.stringify(data); if (self.onload) { self.onload(); } }, 20); }; };
  // Prevent the production renderer's weather-cache writes in this disposable preview.
  var originalSet = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key, value) { if (key.indexOf('room-app-v2:weather:') !== 0) { originalSet.call(this, key, value); } };
  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('display-note').textContent = 'REAL RENDERER · SAMPLE DATA';
    document.getElementById('update-account-display').hidden = true;
    var credit = document.getElementById('weather-credit'); credit.href = 'https://www.weatherapi.com/'; credit.textContent = 'WeatherAPI.com · proposed credit';
  });
}());
