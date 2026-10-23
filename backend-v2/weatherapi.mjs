// WeatherAPI adapter. Secret values and provider response bodies never leave this module.
const GROUPS = [
  [0, [1000]], [2, [1003]], [3, [1006, 1009]], [45, [1030, 1135]], [48, [1147]],
  [51, [1150, 1153]], [56, [1168]], [57, [1171]],
  [61, [1063, 1180, 1183]], [63, [1186, 1189]], [65, [1192, 1195]],
  [66, [1069, 1072, 1198, 1204, 1249]], [67, [1201, 1207, 1252]],
  [71, [1066, 1114, 1210, 1213]], [73, [1216, 1219]], [75, [1117, 1222, 1225]],
  [77, [1237, 1261, 1264]], [80, [1240]], [81, [1243]], [82, [1246]],
  [85, [1255]], [86, [1258]], [95, [1087, 1273, 1276, 1279, 1282]]
];
export function weatherCode(code) {
  for (const [wmo, codes] of GROUPS) if (codes.includes(code)) return wmo;
  return -1; // Unknown must never become clear skies.
}
function issue(code) { return Object.assign(new Error('Weather provider unavailable'), { providerCode: code }); }
function number(value) { if (typeof value !== 'number' || !Number.isFinite(value)) throw issue('INVALID_DATA'); return value; }
function epoch(value) { const n = number(value); if (!Number.isSafeInteger(n) || n < 0) throw issue('INVALID_DATA'); return n; }
function coordinates(loc) { return loc && Number.isFinite(loc.latitude) && Math.abs(loc.latitude) <= 90 && Number.isFinite(loc.longitude) && Math.abs(loc.longitude) <= 180; }
export function normalizeForecast(data, units, now = Date.now()) {
  if (!['fahrenheit', 'celsius'].includes(units) || !Number.isFinite(now)) throw issue('INVALID_INPUT');
  const current = data?.current, days = data?.forecast?.forecastday;
  if (!current || !Array.isArray(days) || days.length < 2 || days.length > 3) throw issue('INVALID_DATA');
  const suffix = units === 'celsius' ? 'c' : 'f';
  const observed = epoch(current.last_updated_epoch), age = now - observed * 1000;
  if (age < -300000 || age >= 3600000) throw issue('STALE_CURRENT');
  const hourly = { time: [], temperature_2m: [] }, daily = { time: [], temperature_2m_max: [], temperature_2m_min: [] };
  for (const day of days) {
    if (!day?.day || !Array.isArray(day.hour) || day.hour.length < 23 || day.hour.length > 25) throw issue('INVALID_DATA');
    daily.time.push(epoch(day.hour[0].time_epoch));
    const high = number(day.day['maxtemp_' + suffix]), low = number(day.day['mintemp_' + suffix]);
    if (low > high) throw issue('INVALID_DATA');
    daily.temperature_2m_max.push(high); daily.temperature_2m_min.push(low);
    for (const hour of day.hour) {
      const time = epoch(hour.time_epoch);
      if (hourly.time.length && time <= hourly.time.at(-1)) throw issue('INVALID_DATA');
      hourly.time.push(time); hourly.temperature_2m.push(number(hour['temp_' + suffix]));
    }
  }
  if (hourly.time.filter(t => t * 1000 >= now).length < 6) throw issue('INVALID_DATA');
  return { provider: 'weatherapi', providerVersion: 1, attribution: { name: 'WeatherAPI.com', url: 'https://www.weatherapi.com/' },
    fetchedAt: now, currentExpiresAt: observed * 1000 + 3600000, forecastExpiresAt: now + 86400000,
    current: { time: observed, temperature_2m: number(current['temp_' + suffix]), apparent_temperature: number(current['feelslike_' + suffix]), weather_code: weatherCode(current.condition?.code) }, hourly, daily };
}
async function providerRequest(path, params, key, upstream) {
  if (typeof key !== 'string' || !key.trim()) throw issue('NOT_CONFIGURED');
  const url = new URL('https://api.weatherapi.com/v1/' + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  url.searchParams.set('key', key);
  const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await upstream(url.href, { redirect: 'manual', signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!response.ok) throw issue(response.status === 429 ? 'QUOTA' : 'UPSTREAM');
    if (!response.body) throw issue('INVALID_DATA');
    const reader = response.body.getReader(), decoder = new TextDecoder(); let size = 0, body = '';
    while (true) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength; if (size > 524288) { await reader.cancel(); throw issue('TOO_LARGE'); } body += decoder.decode(value, { stream: true }); }
    const data = JSON.parse(body + decoder.decode());
    if (data?.error) throw issue([2007, 2009].includes(data.error.code) ? 'QUOTA' : 'UPSTREAM');
    return data;
  } catch (error) { if (error.providerCode) throw error; throw issue('UPSTREAM'); }
  finally { clearTimeout(timeout); }
}
// Cache contains normalized responses and never includes the secret in its URL.
export async function fetchForecast(room, key, { upstream = (url, options) => fetch(url, options), cache = typeof caches === 'undefined' ? null : caches.default, now = Date.now() } = {}) {
  if (!coordinates(room?.location) || !['fahrenheit', 'celsius'].includes(room.units)) throw issue('INVALID_INPUT');
  if (typeof key !== 'string' || !key.trim()) throw issue('NOT_CONFIGURED');
  const cacheUrl = new URL('https://room-weather-cache.invalid/weatherapi/v1/forecast');
  cacheUrl.searchParams.set('q', room.location.latitude + ',' + room.location.longitude); cacheUrl.searchParams.set('units', room.units);
  const request = new Request(cacheUrl.href);
  try { const hit = await cache?.match(request); if (hit) { const data = await hit.json(); if (data.provider === 'weatherapi' && data.fetchedAt <= now && now - data.fetchedAt < 900000 && data.currentExpiresAt > now) return data; } } catch {}
  const data = normalizeForecast(await providerRequest('forecast.json', { q: room.location.latitude + ',' + room.location.longitude, days: 3, aqi: 'no', alerts: 'no' }, key, upstream), room.units, now);
  try { const seconds = Math.min(900, Math.floor((data.currentExpiresAt - now) / 1000)); if (seconds > 0) await cache?.put(request, new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=' + seconds } })); } catch {}
  return data;
}
export async function searchLocations(query, key, { upstream = (url, options) => fetch(url, options) } = {}) {
  if (typeof query !== 'string' || query.trim().length < 2 || query.length > 100 || /[\x00-\x1f]/.test(query)) throw issue('INVALID_INPUT');
  const data = await providerRequest('search.json', { q: query.trim() }, key, upstream);
  if (!Array.isArray(data)) throw issue('INVALID_DATA');
  return data.slice(0, 5).filter(item => typeof item?.name === 'string' && Number.isFinite(item.lat) && Math.abs(item.lat) <= 90 && Number.isFinite(item.lon) && Math.abs(item.lon) <= 180).map(item => ({ name: [item.name, item.region, item.country].filter(x => typeof x === 'string' && x.trim()).join(', ').slice(0, 160), latitude: item.lat, longitude: item.lon }));
}
