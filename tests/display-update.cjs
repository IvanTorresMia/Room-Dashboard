const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
for (const olderDocument of [false, true]) {
  const nodes = {}, ready = [];
  function element() { return {addEventListener(name, fn){this[name]=fn;},focus(){},parentNode:{insertBefore(link){nodes['update-display']=link;}}}; }
  const document = {getElementById(id){if(id==='update-display'&&olderDocument&&!nodes[id])return null;return nodes[id]||(nodes[id]=element());},createElement:element,addEventListener(name,fn){if(name==='DOMContentLoaded')ready.push(fn);}};
  const remote = {paired(){return true;},subscribe(){}};
  vm.runInNewContext(read('display-pair.js'), {window:{RoomRemote:remote},document,location:{search:'',pathname:'/Room-Dashboard/'},Date:{now(){return 123456789;}}});
  ready.forEach(fn=>fn());
  const update = nodes['update-display'];
  assert(update);
  update.click();
  assert.equal(update.href,'/Room-Dashboard/?display-update=123456789');
  assert.equal(update.target,undefined); // Same-context navigation, no Safari tab launch.
  nodes['display-connection'].click();
  assert.match(nodes['display-pair-status'].textContent,/already paired/);
}
const context={window:{addEventListener(){}},localStorage:{getItem(){return null;},setItem(){throw Error('Unexpected storage write');}}};
vm.runInNewContext(read('state.js'),context);
assert.equal(context.window.RoomState.get().theme,'calm');
assert.equal(context.window.RoomState.valid({theme:'meridian',mode:'dark',view:'weather'}),false);
context.document={documentElement:{setAttribute(){}},querySelector(){return null;},addEventListener(){}};
vm.runInNewContext(read('appearance.js'),context);
console.log('Passed: same-context cache-busting update link, older HTML recovery, existing pairing message and pre-catalog script fallback.');
