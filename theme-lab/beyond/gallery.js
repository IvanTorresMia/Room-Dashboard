(function () {
  'use strict';
  var scene = 'form', dark = true, palette = 'orange', frame = document.getElementById('preview'), buttons = document.querySelectorAll('[data-scene]');
  var ideas = {
    form: ['FORM GALLERY / 01', 'An object, rather than an app.', 'A tiny collection of abstract compositions built from a handful of shapes. Change the artwork with a tap. No images to download, no slideshow, no moving background.', 'Tap “Next artwork” in the preview.'],
    reminder: ['A SMALL REMINDER / 02', 'Make room for a few good words.', 'A personal message as a piece of typographic art. A welcome, a thought, a sentence that matters to you. Everything stays inside this browser session.', 'Tap “Write your own” and make it personal.'],
    house: ['HOUSE NOTES / 03', 'A shared place for everyday life.', 'A gentle household board: one plan, one useful note, one thing to look forward to. The examples are sample content; there is no calendar connection or phone sync.', 'Switch between the Everyday and Guests sample boards.'],
    focus: ['ONE THING / 04', 'Less information. More intention.', 'One task and a simple countdown. Choose a short session, start, pause, or begin again. The timer checks elapsed device time, so returning from another app catches it up.', 'Set a task and start a session. No audio or notifications.']
  };
  function fit() { var w = document.getElementById('frame-wrap').clientWidth; frame.style.transform = 'scale(' + w / 1024 + ')'; frame.style.webkitTransform = 'scale(' + w / 1024 + ')'; document.getElementById('frame-wrap').style.height = Math.round(w * .75) + 'px'; }
  function update() {
    var url = 'display.html?scene=' + scene + '&mode=' + (dark ? 'dark' : 'light') + '&palette=' + palette, data = ideas[scene], i;
    frame.src = url; frame.title = 'Interactive ' + data[0] + ' preview'; document.getElementById('open-display').href = url;
    document.getElementById('scene-label').textContent = data[0]; document.getElementById('idea-title').textContent = data[1]; document.getElementById('idea-description').textContent = data[2]; document.getElementById('try-note').textContent = 'TRY IT: ' + data[3];
    for (i = 0; i < buttons.length; i++) { buttons[i].setAttribute('aria-pressed', buttons[i].getAttribute('data-scene') === scene ? 'true' : 'false'); }
    document.getElementById('brightness').textContent = dark ? 'Try light' : 'Try dark'; document.getElementById('brightness').setAttribute('aria-pressed', dark ? 'true' : 'false');
  }
  for (var i = 0; i < buttons.length; i++) { buttons[i].addEventListener('click', function () { scene = this.getAttribute('data-scene'); update(); }); }
  document.getElementById('palette').addEventListener('change', function () { palette = this.value; dark = palette !== 'studio'; update(); });
  document.getElementById('brightness').addEventListener('click', function () { dark = !dark; update(); });
  window.addEventListener('resize', fit); update(); fit();
}());
