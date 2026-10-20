/* Isolated state checks: no app imports, browser storage, or network access. */
var fs = require('fs'), vm = require('vm'), assert = require('assert');
var source = fs.readFileSync(__dirname + '/preview.js', 'utf8');
var count = 0;
['meridian', 'atelier', 'platform'].forEach(function (face) {
  ['light', 'dark'].forEach(function (mode) {
    ['clock', 'glance', 'weather'].forEach(function (view) {
      ['12', '24'].forEach(function (format) {
        ['f', 'c'].forEach(function (units) {
          ['ready', 'stale', 'missing', 'expired'].forEach(function (state) {
            var nodes = {};
            function node() { return { textContent: '', children: [], appendChild: function (n) { this.children.push(n); } }; }
            var document = { body: {}, getElementById: function (id) { return nodes[id] || (nodes[id] = node()); }, createElement: node, addEventListener: function () {} };
            vm.runInNewContext(source, { document: document, location: { search: '?face=' + face + '&mode=' + mode + '&view=' + view + '&format=' + format + '&units=' + units + '&state=' + state + '&names=long&time=sample' }, window: { addEventListener: function () {} }, setInterval: function () {} });
            assert.equal(nodes.clock.textContent, format === '24' ? '23:48' : '11:48');
            assert.equal(nodes.period.textContent, format === '24' ? '' : 'PM');
            assert.equal(nodes.unit.textContent, units === 'c' ? '°C' : '°F');
            assert.equal(nodes.forecast.children.length, 6);
            assert.equal(nodes.forecast.children[0].children[0].textContent, format === '24' ? '00:00' : '12 AM');
            assert(nodes.room.textContent.length > 45);
            if (state === 'missing' || state === 'expired') {
              assert.equal(nodes.temperature.textContent, '--');
              nodes.forecast.children.forEach(function (n) { assert.equal(n.children[1].textContent, '—'); });
            } else { assert.equal(nodes.temperature.textContent, units === 'c' ? '22' : '72'); }
            if (view !== 'clock') { assert(/DEMO/.test(nodes.status.textContent)); }
            if (state === 'stale' && view !== 'clock') { assert(/2 HOURS OLD/.test(nodes.status.textContent)); }
            count++;
          });
        });
      });
    });
  });
});
console.log('PASS: ' + count + ' isolated face/settings combinations, midnight rollover, long names, units and unavailable/expired readings.');
