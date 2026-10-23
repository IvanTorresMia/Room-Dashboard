import assert from 'node:assert/strict';
import { normalizeForecast, fetchForecast, searchLocations, weatherCode } from '../backend-v2/weatherapi.mjs';
const now = Date.UTC(2026, 9, 22, 12), start = now / 1000 - 12 * 3600;
function fixture() { return { current: { last_updated_epoch: now / 1000 - 600, temp_c: 20, temp_f: 68, feelslike_c: 19, feelslike_f: 66.2, condition: { code: 1000 } }, forecast: { forecastday: Array.from({ length: 3 }, (_, day) => ({ day: { maxtemp_c: 25, mintemp_c: 10, maxtemp_f: 77, mintemp_f: 50 }, hour: Array.from({ length: 24 }, (_, i) => ({ time_epoch: start + day * 86400 + i * 3600, temp_c: 20, temp_f: 68 })) })) } }; }
const room = { location: { latitude: 40, longitude: -122 }, units: 'fahrenheit' }, secret = 'test-secret-no-real-account';
const f = normalizeForecast(fixture(), 'fahrenheit', now), c = normalizeForecast(fixture(), 'celsius', now);
assert.equal(f.current.temperature_2m, 68); assert.equal(c.current.temperature_2m, 20); assert.equal(f.current.apparent_temperature, 66.2);
assert.equal(f.hourly.time.length, 72); assert.equal(f.daily.time.length, 3); assert.equal(f.currentExpiresAt, now + 3000000);
assert.equal(f.provider, 'weatherapi'); assert.equal(f.current.weather_code, 0);
for (const [provider, expected] of [[1003,2],[1030,45],[1147,48],[1183,61],[1201,67],[1225,75],[1276,95],[9999,-1]]) assert.equal(weatherCode(provider),expected);
for (const change of [d=>d.current.temp_f=null,d=>d.current.last_updated_epoch-=3600,d=>d.current.last_updated_epoch+=3600,d=>d.forecast.forecastday[0].hour[1].time_epoch=d.forecast.forecastday[0].hour[0].time_epoch,d=>d.forecast.forecastday[0].day.mintemp_f=99,d=>d.forecast.forecastday[0].hour=[]]) { const d=fixture();change(d);assert.throws(()=>normalizeForecast(d,'fahrenheit',now)); }
const entries = new Map(); let calls=0;
const cache={async match(k){return entries.get(k.url)?.clone();},async put(k,v){assert(!k.url.includes(secret));entries.set(k.url,v);}};
const upstream=async(url,options)=>{calls++;const u=new URL(url);assert.equal(u.origin,'https://api.weatherapi.com');assert.equal(u.pathname,'/v1/forecast.json');assert.equal(u.searchParams.get('key'),secret);assert.equal(u.searchParams.get('q'),'40,-122');assert.equal(u.searchParams.get('days'),'3');assert.equal(options.redirect,'manual');assert.equal(options.headers.Authorization,undefined);return Response.json(fixture());};
assert.deepEqual(await fetchForecast(room,secret,{upstream,cache,now}),f);
assert.deepEqual(await fetchForecast(room,secret,{upstream,cache,now}),f);assert.equal(calls,1);
assert(!JSON.stringify(f).includes(secret));
await fetchForecast({...room,units:'celsius'},secret,{upstream,cache,now});assert.equal(calls,2);
await fetchForecast(room,secret,{upstream,cache,now:now+901000});assert.equal(calls,3);
await fetchForecast(room,secret,{upstream,cache:{match(){throw Error();},put(){throw Error();}},now});assert.equal(calls,4);
for(const response of [()=>new Response('denied',{status:403}),()=>new Response('quota',{status:429}),()=>new Response(null,{status:302,headers:{Location:'https://evil.example'}}),()=>new Response('not-json'),()=>new Response('x'.repeat(524289)),()=>Response.json({error:{code:2007,message:secret}}),()=>Response.json({})]) {
 await assert.rejects(fetchForecast(room,secret,{upstream:async()=>response(),cache:null,now}),error=>!error.message.includes(secret));
}
await assert.rejects(fetchForecast(room,'',{upstream,cache,now}),e=>e.providerCode==='NOT_CONFIGURED');
await assert.rejects(fetchForecast({location:{latitude:999,longitude:0},units:'fahrenheit'},secret,{upstream,now}));
const locations=await searchLocations('Redding',secret,{upstream:async(url)=>{const u=new URL(url);assert.equal(u.pathname,'/v1/search.json');assert.equal(u.searchParams.get('q'),'Redding');return Response.json([{name:'Redding',region:'California',country:'USA',lat:40.58,lon:-122.39},{name:'bad',lat:999,lon:0}]);}});
assert.deepEqual(locations,[{name:'Redding, California, USA',latitude:40.58,longitude:-122.39}]);
await assert.rejects(searchLocations('x',secret));
console.log('Passed WeatherAPI normalization, units/epochs, condition mapping, current expiry, corrupt/stale data, secret isolation, cache separation/expiry, upstream failures and location search. Synthetic fixtures only.');
