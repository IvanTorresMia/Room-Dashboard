const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const source = fs.readFileSync(__dirname + '/display.js', 'utf8');
function boot(scene, mode='light', palette='studio') {
  const nodes={}, events={}, intervals=new Map(); let now=1000000, nextId=0;
  function node(id) { return nodes[id]||(nodes[id]={textContent:id==='task'?'Read a few good pages.':'',value:'',hidden:false,attrs:{},handlers:{},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];},addEventListener(k,fn){this.handlers[k]=fn;},focus(){document.activeElement=this;},querySelector(){return node('submit');}}); }
  const document={body:{attrs:{},setAttribute(k,v){this.attrs[k]=v;}},hidden:false,getElementById:node,addEventListener(k,fn){events[k]=fn;}};
  vm.runInNewContext(source,{document,window:{addEventListener(k,fn){events[k]=fn;}},location:{search:'?scene='+scene+'&mode='+mode+'&palette='+palette},Date:{now(){return now;}},setInterval(fn){const id=++nextId;intervals.set(id,fn);return id;},clearInterval(id){intervals.delete(id);}});
  return {nodes,document,intervals,events,click(id){node(id).handlers.click.call(node(id));},submit(){node('edit-form').handlers.submit({preventDefault(){}});},advance(ms){now+=ms;Array.from(intervals.values()).forEach(fn=>fn());},resume(){events.pageshow();},hide(){document.hidden=true;events.visibilitychange();},show(){document.hidden=false;events.visibilitychange();}};
}
for(const scene of ['form','reminder','house','focus'])for(const mode of ['light','dark'])for(const palette of ['studio','orange','blue','red','green']){
  const b=boot(scene,mode,palette);assert.equal(b.document.body.className,mode+' '+scene+(palette==='studio'?'':' tech'));
  assert.equal(b.document.body.attrs['data-palette'],palette);
  for(const other of ['form','reminder','house','focus'])assert.equal(b.nodes[other+'-scene'].hidden,scene!==other);
  assert.equal(b.intervals.size,0,'idle scenes must schedule no animation/timer loops');
}
let b=boot('form');b.click('next-art');assert.equal(b.nodes['art-1'].attrs.visibility,'visible');b.click('next-art');b.click('next-art');assert.equal(b.nodes['art-number'].textContent,'01 / 03');
b=boot('reminder');b.click('edit-message');b.nodes['edit-text'].value='  <b>A plain message</b>  ';b.nodes['edit-signature'].value='  HOME  ';b.submit();assert.equal(b.nodes.message.textContent,'<b>A plain message</b>');assert.equal(b.nodes.signature.textContent,'HOME');assert.equal(b.nodes.editor.hidden,true);
b.click('edit-message');b.nodes['edit-text'].value=' ';b.submit();assert.equal(b.nodes.editor.hidden,false);assert(b.nodes['edit-error'].textContent);b.click('edit-cancel');
b=boot('house');b.click('next-board');assert.equal(b.nodes['house-name'].textContent,'You are welcome here.');b.click('next-board');assert.equal(b.nodes['house-name'].textContent,'Our little home.');
b=boot('focus');b.click('edit-focus');b.nodes['edit-text'].value='Read one page';b.nodes.duration.value='10';b.submit();assert.equal(b.nodes.countdown.textContent,'00:10');
b.click('timer-toggle');assert.equal(b.intervals.size,1);b.advance(3000);assert.equal(b.nodes.countdown.textContent,'00:07');b.click('timer-toggle');assert.equal(b.intervals.size,0);b.advance(30000);assert.equal(b.nodes.countdown.textContent,'00:07');
b.click('timer-toggle');b.hide();assert.equal(b.intervals.size,0,'stop updates while hidden');b.advance(10000);b.show();assert.equal(b.nodes.countdown.textContent,'00:00');assert.match(b.nodes['timer-status'].textContent,/Take a little break/);assert.equal(b.intervals.size,0,'completion stops its timer');
b.click('timer-toggle');assert.equal(b.nodes.countdown.textContent,'00:10');b.click('timer-reset');assert.equal(b.nodes.countdown.textContent,'00:10');assert.equal(b.intervals.size,0);
b.click('edit-focus');b.nodes['edit-text'].value='x'.repeat(71);b.submit();assert.equal(b.nodes.editor.hidden,false);
b=boot('not-a-scene','unknown');assert.equal(b.document.body.className,'light form');
b=boot('reminder','dark','orange');assert.equal(b.nodes.message.textContent,'Less noise.\nMore signal.');
b=boot('form','dark','blue');assert.equal(b.nodes['art-name'].textContent,'Signal architecture');b.click('next-art');assert.equal(b.nodes['art-name'].textContent,'Orbital field');
b=boot('reminder','light','invalid');assert.equal(b.document.body.attrs['data-palette'],'studio');
assert(!/localStorage|sessionStorage|XMLHttpRequest|\bfetch\s*\(/.test(source));
console.log('PASS: 40 scene/brightness/palette combinations, artwork cycling, safe message editing, sample boards, timer pause/reset/restart/completion, hidden-page catch-up, idle zero-timer behavior, invalid input and no storage/network APIs.');
