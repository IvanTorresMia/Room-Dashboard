const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const catalog = require('../theme-catalog.js');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
assert.equal(new Set(catalog.ids).size, 8);
assert.deepEqual(Object.keys(catalog.faces), catalog.ids);
for (const id of catalog.ids) {
  for (const file of ['index.html', 'control/index.html']) {
    const attr = file === 'index.html' ? 'data-face' : 'data-theme';
    assert(read(file).includes(attr + '="' + id + '"'), file + ' missing ' + id);
  }
  assert(/^#[0-9a-f]{6}$/.test(catalog.faces[id].light));
  assert(/^#[0-9a-f]{6}$/.test(catalog.faces[id].dark));
  const storage = { 'room-appearance-v1': JSON.stringify({theme:id,mode:'light',view:'glance'}), 'room-remote-v1': 'pairing sentinel' };
  const context = {window:{addEventListener(){}},localStorage:{getItem(k){return storage[k] || null;},setItem(k,v){storage[k]=v;}}};
  vm.runInNewContext(read('theme-catalog.js'), context);
  vm.runInNewContext(read('state.js'), context);
  assert.equal(context.window.RoomState.get().theme,id);
  assert.equal(context.window.RoomState.set({theme:id,mode:'dark',view:'weather'}),true);
  assert.equal(storage['room-remote-v1'],'pairing sentinel');
  assert.equal(context.window.RoomState.set({theme:'unknown',mode:'dark',view:'clock'}),false);
}
for (const file of ['index.html','control/index.html']) {
  assert(read(file).indexOf('theme-catalog.js') < read(file).indexOf('state.js'));
}
console.log('Passed: eight-theme catalog, both pickers, load order, saved-state restoration, unknown-ID rejection and pairing storage isolation.');
