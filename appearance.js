// Kept separate and loaded before CSS to restore a saved appearance without flashing.
(function () {
  'use strict';
  var state = window.RoomState.get();
  var theme = state.theme;
  var mode = state.mode;
  var root = document.documentElement;
  // Older cached HTML does not load the catalog. Preserve its original faces until update.
  var faces = window.RoomThemes ? window.RoomThemes.faces : {
    calm: { name: 'Calm', light: '#f3efe5', dark: '#171e23' },
    keycap: { name: 'Keycap', light: '#eeefed', dark: '#1c1e22' },
    edition: { name: 'Edition', light: '#f5f0e5', dark: '#25211f' },
    terminal: { name: 'Terminal', light: '#edf3e7', dark: '#101c16' },
    tide: { name: 'Tide', light: '#edf5fa', dark: '#122535' }
  };
  function apply() {
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-mode', mode);
    root.setAttribute('data-view', state.view);
    root.setAttribute('data-palette', state.palette || 'recommended');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      var colors = window.RoomThemes && window.RoomThemes.palettes && window.RoomThemes.palettes[state.palette];
      meta.setAttribute('content', colors && colors[mode] ? colors[mode].background : faces[theme][mode]);
    }
  }
  apply();
  document.addEventListener('DOMContentLoaded', function () {
    var themeButton = document.getElementById('theme-toggle');
    var modeButton = document.getElementById('mode-toggle');
    var viewSelect = document.getElementById('view-select');
    var picker = document.getElementById('face-picker');
    var paletteSelect = document.getElementById('palette-select');
    var paletteReset = document.getElementById('palette-reset');
    var choices = picker.querySelectorAll('[data-face]');
    function closePicker(restoreFocus) {
      picker.hidden = true;
      themeButton.setAttribute('aria-expanded', 'false');
      if (restoreFocus) { themeButton.focus(); }
    }
    function update() {
      state = window.RoomState.get(); theme = state.theme; mode = state.mode;
      viewSelect.value = state.view;
      if (paletteSelect) { paletteSelect.value = state.palette || 'recommended'; }
      if (paletteReset) { paletteReset.hidden = !state.palette || state.palette === 'recommended'; }
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
      window.RoomState.set({ theme: theme, mode: mode, view: viewSelect.value, palette: state.palette || 'recommended' });
      update();
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
    viewSelect.addEventListener('change', save);
    if (paletteSelect) { paletteSelect.addEventListener('change', function () { var value = window.RoomState.get(); value.palette = this.value; window.RoomState.set(value); }); }
    if (paletteReset) { paletteReset.addEventListener('click', function () { var value = window.RoomState.get(); value.palette = 'recommended'; window.RoomState.set(value); paletteSelect.focus(); }); }
    window.RoomState.subscribe(update);
    update();
  });
}());
