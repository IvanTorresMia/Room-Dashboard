const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const catalog=require('../theme-catalog.js'),read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
function boot(saved,controller=false){
  const storage={'room-appearance-v1':JSON.stringify(saved),'room-remote-v1':'pairing sentinel'},events={},nodes={},buttons=[];
  function node(id){return nodes[id]||(nodes[id]={style:{},hidden:false,clientWidth:512,value:'',attrs:{},handlers:{},setAttribute(k,v){this.attrs[k]=v;},getAttribute(k){return this.attrs[k]??null;},hasAttribute(k){return Object.hasOwn(this.attrs,k);},addEventListener(k,fn){this.handlers[k]=fn;}});}
  for(const match of read('control/index.html').matchAll(/<button\b([^>]*)>/g)){
    const attrs=Object.fromEntries(Array.from(match[1].matchAll(/([\w-]+)="([^"]*)"/g),m=>[m[1],m[2]]));
    const b=node(attrs.id||'button-'+buttons.length);b.attrs=attrs;buttons.push(b);
  }
  const document={getElementById:node,querySelectorAll(){return buttons.filter(b=>['view','theme','mode','palette'].some(k=>b.hasAttribute('data-'+k)));},addEventListener(k,fn){events[k]=fn;}};
  const window={addEventListener(){},RoomRemote:{paired(){return false;},link(){return '';},subscribe(){}}};
  const context={window,document,localStorage:{getItem(k){return storage[k]||null;},setItem(k,v){storage[k]=v;}}};
  vm.runInNewContext(read('theme-catalog.js'),context);vm.runInNewContext(read('state.js'),context);
  if(controller){vm.runInNewContext(read('control/control.js'),context);events.DOMContentLoaded();}
  return{state:window.RoomState,storage,nodes,click(kind,value){const b=buttons.find(b=>b.attrs['data-'+kind]===value);b.handlers.click.call(b);}};
}
let count=0;
for(const theme of catalog.ids)for(const palette of catalog.paletteIds)for(const mode of ['light','dark'])for(const view of ['clock','glance','weather']){
  const b=boot({theme,palette,mode,view});assert.equal(b.state.get().palette,palette);assert.equal(b.state.get().theme,theme);
  assert.equal(b.state.set({theme,palette,mode,view}),true);assert.equal(b.storage['room-remote-v1'],'pairing sentinel');count++;
}
let b=boot({theme:'edition',mode:'light',view:'glance'});assert.equal(b.state.get().palette,'recommended');
b=boot({theme:'tide',mode:'dark',view:'weather',palette:'unknown'});assert.equal(b.state.get().theme,'tide');assert.equal(b.state.get().palette,'recommended');
assert.equal(b.state.set({theme:'tide',mode:'dark',view:'weather',palette:'unknown'}),false);
b=boot({theme:'calm',mode:'dark',view:'weather'},true);
b.click('palette','orange');assert.equal(b.state.get().palette,'orange');b.click('theme','edition');assert.equal(b.state.get().theme,'edition');assert.equal(b.state.get().palette,'orange');
b.click('mode','light');b.click('view','glance');assert.equal(b.state.get().palette,'orange');assert.equal(b.nodes['palette-reset'].hidden,false);
b.nodes['palette-reset'].handlers.click();assert.equal(b.state.get().palette,'recommended');assert.equal(b.nodes['palette-reset'].hidden,true);assert.match(b.nodes['recommended-note'].textContent,/Edition/);
b.click('theme','platform');assert.equal(b.state.get().palette,'recommended');assert.match(b.nodes['recommended-note'].textContent,/Platform/);assert.equal(b.nodes['recommended-swatch'].style.background,catalog.faces.platform.light);
assert.equal(JSON.parse(b.storage['room-appearance-v1']).palette,'recommended');assert.equal(b.storage['room-remote-v1'],'pairing sentinel');
for(const palette of catalog.paletteIds){assert(read('control/index.html').includes('data-palette="'+palette+'"'));assert(read('index.html').includes('value="'+palette+'"'));}
// Check text roles against the explicit palette surfaces, not just a screenshot.
function luminance(hex){const rgb=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
function contrast(a,b){const l=[luminance(a),luminance(b)].sort((a,b)=>b-a);return(l[0]+.05)/(l[1]+.05);}
for(const id of catalog.paletteIds.filter(id=>id!=='recommended'))for(const mode of ['light','dark']){
 const c=catalog.palettes[id][mode];
 for(const bg of [c.background,c.surface])for(const role of ['text','muted','accent'])assert(contrast(c[role],bg)>=4.5,id+' '+mode+' '+role+' contrast');
 assert(contrast(c.onAccent,c.accent)>=4.5,id+' button/reversed-panel contrast');
}
console.log('Passed: '+count+' settings combinations, old-state migration, palette preservation across actual controller actions, recommended reset, persistence, pairing isolation, both pickers and custom-palette text contrast.');
