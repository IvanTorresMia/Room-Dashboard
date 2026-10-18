(function () {
  'use strict';
  var CACHE_KEY = 'room-weather-v1';
  var REFRESH_MS = 15 * 60 * 1000;
  var weather = null;
  var savedAt = 0;
  var busy = false;
  var failed = false;
  var url = 'https://api.open-meteo.com/v1/forecast?latitude=40.5865&longitude=-122.3917' +
    '&current=temperature_2m,apparent_temperature,weather_code,is_day' +
    '&hourly=temperature_2m,weather_code,precipitation_probability,is_day' +
    '&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max' +
    '&temperature_unit=fahrenheit&timezone=America%2FLos_Angeles&timeformat=unixtime&forecast_days=3';
  function el(id) { return document.getElementById(id); }
  function put(id, value) { el(id).textContent = value; }
  // US Pacific time, including daylight saving. Avoids requiring Intl on old Safari.
  function pacificDate(timestamp) {
    var d = new Date(timestamp);
    var year = d.getUTCFullYear();
    var march = new Date(Date.UTC(year, 2, 1)).getUTCDay();
    var november = new Date(Date.UTC(year, 10, 1)).getUTCDay();
    var start = Date.UTC(year, 2, 8 + (7 - march) % 7, 10);
    var end = Date.UTC(year, 10, 1 + (7 - november) % 7, 9);
    return new Date(timestamp + (timestamp >= start && timestamp < end ? -7 : -8) * 3600000);
  }
  function time(timestamp, short) {
    var d = pacificDate(timestamp);
    var h = d.getUTCHours();
    var m = d.getUTCMinutes();
    return (h % 12 || 12) + (short ? '' : ':' + (m < 10 ? '0' : '') + m) + ' ' + (h < 12 ? 'AM' : 'PM');
  }
  function tick() {
    var now = Date.now();
    var d = pacificDate(now);
    var h = d.getUTCHours();
    var display = time(now, false).split(' ');
    put('clock', display[0]); put('meridiem', display[1]);
    put('date', ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getUTCDay()] + ', ' +
      ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][d.getUTCMonth()] + ' ' + d.getUTCDate());
    put('greeting', h < 5 ? 'THE QUIET HOURS' : h < 12 ? 'GOOD MORNING' : h < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING');
    if (weather) { renderWeather(); }
  }
  function description(code, day) {
    if (code === 0) { return day ? 'Clear skies' : 'Clear night'; }
    if (code === 1) { return day ? 'Mostly sunny' : 'Mostly clear'; }
    if (code === 2) { return 'Partly cloudy'; }
    if (code === 3) { return 'Overcast'; }
    if (code === 45 || code === 48) { return 'Foggy'; }
    if (code >= 51 && code <= 57) { return 'Drizzle'; }
    if (code >= 71 && code <= 77 || code === 85 || code === 86) { return 'Snow'; }
    if (code >= 95) { return 'Thunderstorms'; }
    if (code >= 61 && code <= 67 || code >= 80 && code <= 82) { return 'Rain showers'; }
    return 'Weather unavailable';
  }
  function icon(code, day) {
    var sun = '<circle cx="24" cy="24" r="8"/><path d="M24 3v6m0 30v6M3 24h6m30 0h6M9 9l4 4m22 22l4 4M9 39l4-4m22-22l4-4"/>';
    var moon = '<path d="M31 7a17 17 0 1 0 10 27A18 18 0 0 1 31 7Z"/>';
    var cloud = '<path d="M12 34a8 8 0 1 1 1-16 12 12 0 0 1 23 2 7 7 0 0 1 0 14Z"/>';
    var shape = code <= 1 ? (day ? sun : moon) : cloud;
    if (code === 2) { shape = '<circle cx="33" cy="13" r="7"/>' + cloud; }
    if (code === 45 || code === 48) { shape = cloud + '<path d="M10 40h28m-24 5h20"/>'; }
    if (code >= 51 && code <= 67 || code >= 80 && code <= 82) { shape += '<path d="M15 39l-2 5m12-5l-2 5m12-5l-2 5"/>'; }
    if (code >= 71 && code <= 77 || code === 85 || code === 86) { shape += '<path d="M16 40v5m-2-2h4m13-3v5m-2-2h4"/>'; }
    if (code >= 95) { shape += '<path d="M25 34l-6 7h6l-4 6"/>'; }
    return '<svg class="weather-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + shape + '</svg>';
  }
  function valid(data) {
    if (!data || !data.current || !data.daily || !data.hourly) { return false; }
    var groups = { current: ['temperature_2m', 'apparent_temperature', 'weather_code', 'is_day'], daily: ['time', 'temperature_2m_max', 'temperature_2m_min', 'sunrise', 'sunset', 'precipitation_probability_max'], hourly: ['time', 'temperature_2m', 'weather_code', 'is_day', 'precipitation_probability'] };
    var group, i, field, values, j;
    for (group in groups) {
      if (groups.hasOwnProperty(group)) {
        for (i = 0; i < groups[group].length; i++) {
          field = groups[group][i]; values = data[group][field];
          if (group === 'current') { if (typeof values !== 'number' || !isFinite(values)) { return false; } }
          else {
            if (!Array.isArray(values) || values.length !== data[group].time.length || values.length < (group === 'hourly' ? 6 : 2)) { return false; }
            for (j = 0; j < values.length; j++) { if (typeof values[j] !== 'number' || !isFinite(values[j])) { return false; } }
          }
        }
      }
    }
    return true;
  }
  function renderWeather() {
    var now = Date.now();
    var today = pacificDate(now).toISOString().slice(0, 10);
    var daily = weather.daily;
    var day = -1;
    var i;
    for (i = 0; i < daily.time.length; i++) {
      if (pacificDate(daily.time[i] * 1000).toISOString().slice(0, 10) === today) { day = i; break; }
    }
    var stale = now - savedAt > REFRESH_MS * 2;
    put('temperature', Math.round(weather.current.temperature_2m));
    put('condition', description(weather.current.weather_code, weather.current.is_day));
    el('current-icon').innerHTML = icon(weather.current.weather_code, weather.current.is_day);
    put('feels-like', 'Feels like ' + Math.round(weather.current.apparent_temperature) + '°' + (stale ? ' · Last reading' : ''));
    put('high', day < 0 ? '--°' : Math.round(daily.temperature_2m_max[day]) + '°');
    put('low', day < 0 ? '--°' : Math.round(daily.temperature_2m_min[day]) + '°');
    put('forecast-note', day < 0 ? 'Forecast needs an update' : daily.precipitation_probability_max[day] + '% chance of rain today');
    var hourly = weather.hourly;
    var html = '';
    var count = 0;
    for (i = 0; i < hourly.time.length && count < 6; i++) {
      if (hourly.time[i] * 1000 <= now) { continue; }
      html += '<div class="forecast-hour"><div class="forecast-time">' + time(hourly.time[i] * 1000, true) + '</div>' +
        '<span class="forecast-icon" role="img" aria-label="' + description(hourly.weather_code[i], hourly.is_day[i]) + '">' + icon(hourly.weather_code[i], hourly.is_day[i]) + '</span>' +
        '<span class="forecast-temp">' + Math.round(hourly.temperature_2m[i]) + '°</span><p class="forecast-rain">' + hourly.precipitation_probability[i] + '% rain</p></div>';
      count++;
    }
    el('forecast').innerHTML = html || '<p class="forecast-placeholder">Forecast expired. Waiting for a connection.</p>';
    var sunIndex = day;
    var sunrise = day >= 0 && now < daily.sunrise[day] * 1000;
    if (day >= 0 && now >= daily.sunset[day] * 1000) { sunIndex++; sunrise = true; }
    put('sun-label', sunrise ? 'SUNRISE' : 'SUNSET');
    put('sun-time', sunIndex >= 0 && sunIndex < daily.time.length ? time((sunrise ? daily.sunrise[sunIndex] : daily.sunset[sunIndex]) * 1000, false) : '--:--');
    put('sun-caption', sunrise ? 'A new day on the horizon' : "The day's last light");
    if (!busy) { put('status', (failed ? 'Connection lost · ' : stale ? 'Saved weather · ' : 'Updated ') + time(savedAt, false)); }
  }
  function fetchWeather() {
    if (busy) { return; }
    busy = true; el('refresh').disabled = true; put('status', 'Updating weather…');
    var request = new XMLHttpRequest();
    function finish(success) {
      busy = false; failed = !success; el('refresh').disabled = false;
      if (weather) { renderWeather(); }
      else { put('condition', 'Weather unavailable'); put('status', 'Unable to connect · tap refresh to retry'); }
    }
    request.open('GET', url, true); request.timeout = 15000;
    request.onload = function () {
      try {
        if (request.status < 200 || request.status >= 300) { throw new Error('Weather request failed'); }
        var data = JSON.parse(request.responseText);
        if (!valid(data)) { throw new Error('Incomplete forecast'); }
        weather = data; savedAt = Date.now();
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data: data, savedAt: savedAt })); } catch (ignored) { /* Private browsing may disable storage. */ }
        finish(true);
      } catch (error) { finish(false); }
    };
    request.onerror = request.ontimeout = function () { finish(false); };
    try { request.send(); } catch (error) { finish(false); }
  }
  el('sun-icon').innerHTML = '<svg class="weather-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 34h40M11 28a13 13 0 0 1 26 0M24 5v5M6 13l4 4m28-4l-4 4M17 41h14"/></svg>';
  try {
    var cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached && valid(cached.data) && typeof cached.savedAt === 'number' && cached.savedAt <= Date.now() && Date.now() - cached.savedAt < 86400000) { weather = cached.data; savedAt = cached.savedAt; }
  } catch (ignored) { /* The clock works even without storage. */ }
  el('refresh').addEventListener('click', fetchWeather);
  window.addEventListener('online', fetchWeather);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { tick(); if (Date.now() - savedAt >= REFRESH_MS) { fetchWeather(); } } });
  tick(); fetchWeather();
  setInterval(tick, 1000 * 15);
  setInterval(function () { if (!document.hidden) { fetchWeather(); } }, REFRESH_MS);
}());
