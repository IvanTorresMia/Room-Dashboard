// Kept separate and loaded before CSS to restore a saved appearance without flashing.
(function () {
  'use strict';
  var key = 'room-appearance-v1';
  var theme = 'calm';
  var mode = 'dark';
  var root = document.documentElement;
  try {
    var saved = JSON.parse(localStorage.getItem(key));
    if (saved) {
      if (saved.theme === 'calm' || saved.theme === 'keycap') { theme = saved.theme; }
      if (saved.mode === 'light' || saved.mode === 'dark') { mode = saved.mode; }
    }
  } catch (ignored) { /* Appearance still works when storage is unavailable. */ }
  function apply() {
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-mode', mode);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) { meta.setAttribute('content', mode === 'light' ? (theme === 'calm' ? '#f3efe5' : '#eeefed') : (theme === 'calm' ? '#171e23' : '#1c1e22')); }
  }
  apply();
  document.addEventListener('DOMContentLoaded', function () {
    var themeButton = document.getElementById('theme-toggle');
    var modeButton = document.getElementById('mode-toggle');
    function update() {
      apply();
      var name = theme === 'calm' ? 'Calm' : 'Keycap';
      document.getElementById('theme-name').textContent = name;
      themeButton.setAttribute('aria-label', 'Change theme. Current theme: ' + name);
      document.getElementById('mode-name').textContent = mode === 'dark' ? 'Light' : 'Dark';
      document.getElementById('mode-symbol').textContent = mode === 'dark' ? '☀' : '☾';
      modeButton.setAttribute('aria-label', 'Switch to ' + (mode === 'dark' ? 'light' : 'dark') + ' mode');
    }
    function save() {
      update();
      try { localStorage.setItem(key, JSON.stringify({ theme: theme, mode: mode })); } catch (ignored) { /* Private browsing may block storage. */ }
    }
    themeButton.addEventListener('click', function () { theme = theme === 'calm' ? 'keycap' : 'calm'; save(); });
    modeButton.addEventListener('click', function () { mode = mode === 'dark' ? 'light' : 'dark'; save(); });
    update();
  });
}());
