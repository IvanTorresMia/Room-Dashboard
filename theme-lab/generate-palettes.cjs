/* Optional maintainer helper. Pages serves the checked-in CSS directly; no build needed. */
const fs = require('node:fs');
const path = require('node:path');
const catalog = require('../theme-catalog.js');
const output = ['/* Generated from theme-catalog.js by theme-lab/generate-palettes.cjs. */\n',
'.face-picker .palette-label{display:block;font:700 12px Arial,sans-serif;letter-spacing:1px;margin:18px 8px 8px}.face-picker #palette-select{width:100%;max-width:none;min-height:44px;font-size:14px}.appearance-controls .face-picker .palette-reset{display:block;min-height:44px;font-size:12px;padding:8px;margin:0;border:0;text-decoration:underline;background:transparent;box-shadow:none}\n'];
for (const id of catalog.paletteIds.filter(id => id !== 'recommended')) {
  for (const mode of ['light','dark']) {
    const c = catalog.palettes[id][mode];
    const scope = 'html[data-palette="' + id + '"][data-mode="' + mode + '"]';
    function rule(selectors, body, extra='') {output.push(selectors.map(s => scope + extra + (s?' '+s:'')).join(',')+'{'+body+'}\n');}
    rule(['','body','.dashboard'], 'background:'+c.background+';color:'+c.text+';');
    rule(['.location','.eyebrow','.section-heading h1','.unit','.high-low','.feels-like','.section-heading>span','.forecast-time','.forecast-rain','.forecast-placeholder','.sun-caption','.connection','.connection a'], 'color:'+c.muted+';');
    rule(['.date','.meridiem','.high-low span','.sun-time','.condition','.forecast-temp'], 'color:'+c.text+';');
    rule(['.brand-mark','.current-icon','.forecast-icon','#sun-icon','.clock-panel .eyebrow'], 'color:'+c.accent+';');
    rule(['.theme-swatch','.location-dot'], 'background:'+c.accent+';');
    rule(['.weather-panel','.outlook','.footer','.forecast-hour','button','select','.face-picker'], 'border-color:'+c.border+';');
    rule(['button','select','.face-picker'], 'background:'+c.surface+';color:'+c.text+';box-shadow:none;');
    rule(['.face-picker button'], 'background:transparent;color:'+c.text+';');
    rule(['.face-picker button[aria-pressed="true"]'], 'background:'+c.background+';border-color:'+c.accent+';');
    rule(['button:focus','a:focus','select:focus'], 'outline-color:'+c.accent+';');
    rule(['.landscape path:nth-child(1)'], 'fill:'+c.border+';');
    rule(['.landscape path:nth-child(2)'], 'fill:'+c.surface+';');
    rule(['.landscape path:nth-child(3)'], 'fill:'+c.background+';');
    rule(['.brand-mark'], 'background:'+c.accent+';', '[data-theme="keycap"]');
    rule(['.dashboard'], 'background:linear-gradient(135deg,'+c.surface+' 0%,'+c.background+' 75%);', '[data-theme="keycap"]');
    rule(['.forecast-hour'], 'background:'+c.surface+';border-color:'+c.border+';', '[data-theme="keycap"]');
    rule(['.forecast-hour'], 'background:'+c.surface+';color:'+c.text+';', '[data-theme="tide"]');
    rule(['.dashboard:before','.dashboard:after'], 'background:'+c.accent+';', '[data-theme="meridian"]');
    rule(['.outlook'], 'background:'+c.accent+';color:'+c.onAccent+';', '[data-theme="platform"]');
    rule(['.outlook .section-heading h1','.outlook .section-heading>span','.outlook .forecast-time','.outlook .forecast-icon','.outlook .forecast-temp','.outlook .forecast-placeholder'], 'color:'+c.onAccent+';', '[data-theme="platform"]');
    rule(['.outlook .forecast-hour'], 'border-color:'+c.onAccent+';', '[data-theme="platform"]');
  }
}
const css = output.join(''), target = path.join(__dirname,'../palettes.css');
if (process.argv.includes('--check')) {
  if (fs.readFileSync(target,'utf8') !== css) throw Error('palettes.css is out of sync with the palette catalog');
  console.log('Passed: static palette CSS matches the canonical catalog.');
} else { fs.writeFileSync(target,css); }
