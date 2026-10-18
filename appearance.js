// Kept separate and loaded before CSS to restore a saved appearance without flashing.
(function () {
  'use strict';
  var key = 'room-appearance-v1';
  var theme = 'calm';
  var mode = 'dark';
  var root = document.documentElement;
  var faces = {
    calm: { name: 'Calm', light: '#f3efe5', dark: '#171e23' },
    keycap: { name: 'Keycap', light: '#eeefed', dark: '#1c1e22' },
    edition: { name: 'Edition', light: '#f5f0e5', dark: '#25211f' },
    terminal: { name: 'Terminal', light: '#edf3e7', dark: '#101c16' },
    tide: { name: 'Tide', light: '#edf5fa', dark: '#122535' }
  };
  try {
    var saved = JSON.parse(localStorage.getItem(key));
    if (saved) {
      if (typeof saved.theme === 'string' && faces.hasOwnProperty(saved.theme)) { theme = saved.theme; }
      if (saved.mode === 'light' || saved.mode === 'dark') { mode = saved.mode; }
    }
  } catch (ignored) { /* Appearance still works when storage is unavailable. */ }
  function apply() {
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-mode', mode);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) { meta.setAttribute('content', faces[theme][mode]); }
  }
  apply();
  document.addEventListener('DOMContentLoaded', function () {
    var themeButton = document.getElementById('theme-toggle');
    var modeButton = document.getElementById('mode-toggle');
    var picker = document.getElementById('face-picker');
    var choices = picker.querySelectorAll('[data-face]');
    function closePicker(restoreFocus) {
      picker.hidden = true;
      themeButton.setAttribute('aria-expanded', 'false');
      if (restoreFocus) { themeButton.focus(); }
    }
    function update() {
      apply();
      var name = faces[theme].name;
      document.getElementById('theme-name').textContent = name;
      themeButton.setAttribute('aria-label', 'Choose face. Current face: ' + name);
      document.getElementById('mode-name').textContent = mode === 'dark' ? 'Light' : 'Dark';
      document.getElementById('mode-symbol').textContent = mode === 'dark' ? '☀' : '☾';
      for (var i = 0; i < choices.length; i++) {
        choices[i].setAttribute('aria-pressed', choices[i].getAttribute('data-face') === theme ? 'true' : 'false');
      }
      modeButton.setAttribute('aria-label', 'Switch to ' + (mode === 'dark' ? 'light' : 'dark') + ' mode');
    }
    function save() {
      update();
      try { localStorage.setItem(key, JSON.stringify({ theme: theme, mode: mode })); } catch (ignored) { /* Private browsing may block storage. */ }
    }
    themeButton.addEventListener('click', function () {
      picker.hidden = !picker.hidden;
      themeButton.setAttribute('aria-expanded', picker.hidden ? 'false' : 'true');
    });
    for (var i = 0; i < choices.length; i++) {
      choices[i].addEventListener('click', function () {
        theme = this.getAttribute('data-face'); save(); closePicker(true);
      });
    }
    document.addEventListener('click', function (event) {
      if (!picker.hidden && !picker.contains(event.target) && !themeButton.contains(event.target)) { closePicker(false); }
    });
    document.addEventListener('keydown', function (event) {
      if ((event.key === 'Escape' || event.keyCode === 27) && !picker.hidden) { closePicker(true); }
    });
    document.addEventListener('focusin', function (event) {
      if (!picker.hidden && !picker.contains(event.target) && !themeButton.contains(event.target)) { closePicker(false); }
    });
    modeButton.addEventListener('click', function () { mode = mode === 'dark' ? 'light' : 'dark'; save(); });
    update();
  });
}());
