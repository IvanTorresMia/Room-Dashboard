(function () {
  'use strict';
  var scene = 'form', mode = 'light', artwork = 0, thought = 0, board = 0, editorReturn = null;
  var duration = 1500, remaining = 1500, deadline = 0, running = false, timer = null;
  var art = [['Terracotta study', 'Arches, afternoon light, and a place to pause.', 'Terracotta study: a red sun, architectural arches and fine vertical lines'], ['A quiet horizon', 'A circle, a meeting of colors, a little distance.', 'A quiet horizon: a blue circle, a cream disc and still horizontal lines'], ['Two sides of a moment', 'Plum, rose, and a conversation in the middle.', 'Two sides of a moment: divided plum and rose fields with overlapping circles']];
  var thoughts = [['There is no hurry\nto be anywhere else.', 'MAKE YOURSELF AT HOME'], ['A little less noise.\nA little more room.', 'A THOUGHT FOR TODAY'], ['Good things can\nbe ordinary things.', 'OUR LITTLE HOME']];
  function el(id) { return document.getElementById(id); }
  function put(id, value) { el(id).textContent = value; }
  function trim(value) { return value.replace(/^\s+|\s+$/g, ''); }
  function pad(value) { return value < 10 ? '0' + value : String(value); }
  location.search.slice(1).split('&').forEach(function (pair) { var parts = pair.split('='); if (parts[0] === 'scene' && ['form', 'reminder', 'house', 'focus'].indexOf(parts[1]) !== -1) { scene = parts[1]; } if (parts[0] === 'mode' && parts[1] === 'dark') { mode = 'dark'; } });
  document.body.className = mode + ' ' + scene;
  ['form', 'reminder', 'house', 'focus'].forEach(function (name) { el(name + '-scene').hidden = scene !== name; el(name + '-actions').hidden = scene !== name; });
  var titles = { form: 'FORM GALLERY', reminder: 'A SMALL REMINDER', house: 'HOUSE NOTES', focus: 'ONE THING' };
  put('identity', titles[scene]); document.title = titles[scene] + ' · Room lab prototype';
  put('footnote', { form: 'ORIGINAL SVG ART · NO IMAGE DOWNLOADS', reminder: 'PERSONAL WORDS · THIS SESSION ONLY', house: 'SAMPLE CONTENT · NO CALENDAR OR PHONE SYNC', focus: 'LOCAL FOCUS TIMER · RELOAD STARTS OVER' }[scene]);
  el('next-art').addEventListener('click', function () {
    artwork = (artwork + 1) % art.length;
    for (var i = 0; i < art.length; i++) { el('art-' + i).setAttribute('visibility', i === artwork ? 'visible' : 'hidden'); }
    put('art-name', art[artwork][0]); put('art-description', art[artwork][1]); put('art-title', art[artwork][2]); put('art-number', pad(artwork + 1) + ' / 03');
  });
  function message(value, signoff) { put('message', value); el('message').className = value.length > 80 ? 'long' : ''; put('signature', signoff); }
  message(thoughts[0][0], thoughts[0][1]);
  el('next-message').addEventListener('click', function () { thought = (thought + 1) % thoughts.length; message(thoughts[thought][0], thoughts[thought][1]); });
  el('next-board').addEventListener('click', function () {
    board = 1 - board;
    put('house-name', board ? 'You are welcome here.' : 'Our little home.'); put('plan-label', board ? 'ON THE TABLE / A SAMPLE WELCOME' : 'ON THE TABLE / TONIGHT');
    put('plan', board ? 'Come in.\nMake yourself at home.' : 'Soup, good bread,\nand no big plans.'); put('plan-detail', board ? 'Tea is in the kitchen. The good mugs are for everyone.' : 'Dinner around 7. Come as you are.');
    put('house-reminder', board ? 'Leave the rush outside.' : 'Water the plants.'); put('house-detail', board ? 'Coats by the door. Everything else can wait.' : 'The fern by the window, too.'); put('looking-forward', board ? 'A long conversation.' : 'A walk after dinner.'); put('looking-detail', board ? 'No occasion required.' : 'Leave the phones at home.');
    put('next-board', board ? 'Back to the everyday board →' : 'Try the guests board →');
  });
  function stopTicks() { if (timer !== null) { clearInterval(timer); timer = null; } }
  function tick() {
    if (running) { remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000)); }
    put('countdown', pad(Math.floor(remaining / 60)) + ':' + pad(remaining % 60));
    el('countdown').setAttribute('aria-label', Math.floor(remaining / 60) + ' minutes ' + remaining % 60 + ' seconds remaining');
    if (running && remaining === 0) { running = false; stopTicks(); put('timer-status', 'That is enough for now. Take a little break.'); put('timer-toggle', 'Begin again'); }
  }
  function schedule() { stopTicks(); if (running && !document.hidden) { timer = setInterval(tick, 1000); } }
  function reset() { running = false; stopTicks(); remaining = duration; deadline = 0; tick(); put('timer-status', 'Ready when you are.'); put('timer-toggle', 'Begin'); }
  el('timer-toggle').addEventListener('click', function () {
    if (running) { tick(); if (!running) { return; } running = false; stopTicks(); put('timer-status', 'Paused. Pick it up when you are ready.'); put('timer-toggle', 'Continue'); }
    else { if (remaining <= 0) { remaining = duration; } running = true; deadline = Date.now() + remaining * 1000; put('timer-status', 'Just this, for a little while.'); put('timer-toggle', 'Pause'); tick(); schedule(); }
  });
  el('timer-reset').addEventListener('click', reset);
  function openEditor(trigger) {
    editorReturn = trigger; put('edit-error', ''); el('signature-field').hidden = scene !== 'reminder'; el('duration-field').hidden = scene !== 'focus';
    put('editor-title', scene === 'reminder' ? 'A small reminder.' : 'What deserves your attention?');
    put('edit-label', scene === 'reminder' ? 'Your message (up to 140 characters)' : 'Your intention (up to 70 characters)');
    el('edit-text').maxLength = scene === 'reminder' ? 140 : 70; el('edit-text').value = el(scene === 'reminder' ? 'message' : 'task').textContent;
    el('edit-signature').value = el('signature').textContent; el('duration').value = String(duration);
    el('editor').hidden = false; el('display').setAttribute('aria-hidden', 'true'); el('edit-text').focus();
  }
  function closeEditor() { el('editor').hidden = true; el('display').removeAttribute('aria-hidden'); if (editorReturn) { editorReturn.focus(); } }
  el('edit-message').addEventListener('click', function () { openEditor(this); }); el('edit-focus').addEventListener('click', function () { openEditor(this); });
  el('edit-cancel').addEventListener('click', closeEditor);
  el('edit-form').addEventListener('submit', function (event) {
    event.preventDefault(); var value = trim(el('edit-text').value), limit = scene === 'reminder' ? 140 : 70;
    if (!value || value.length > limit) { put('edit-error', 'Use 1–' + limit + ' characters.'); el('edit-text').focus(); return; }
    if (scene === 'reminder') { message(value, trim(el('edit-signature').value).slice(0, 40)); }
    else { put('task', value); el('task').className = value.length > 40 ? 'long' : ''; duration = [1500, 2700, 300, 10].indexOf(Number(el('duration').value)) !== -1 ? Number(el('duration').value) : 1500; put('timer-label', 'A LITTLE SPACE / ' + (duration === 10 ? '10 SECOND DEMO' : duration / 60 + ' MINUTES')); reset(); }
    closeEditor();
  });
  el('editor').addEventListener('keydown', function (event) {
    if (event.keyCode === 27 || event.key === 'Escape') { event.preventDefault(); closeEditor(); }
    if (event.keyCode === 9 || event.key === 'Tab') { var last = el('edit-form').querySelector('button[type="submit"]'); if (event.shiftKey && document.activeElement === el('edit-text')) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); el('edit-text').focus(); } }
  });
  function resume() { if (scene === 'focus') { tick(); schedule(); } }
  document.addEventListener('visibilitychange', resume); window.addEventListener('pageshow', resume); window.addEventListener('focus', resume);
  if (scene === 'focus') { tick(); }
}());
