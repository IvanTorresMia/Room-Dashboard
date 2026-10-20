(function () {
  'use strict';
  var key = 'room-appearance-v1';
  var current = { theme: 'calm', mode: 'dark', view: 'weather', palette: 'recommended' };
  var listeners = [];
  // Frozen pre-catalog fallback for an older cached HTML document.
  var themes = window.RoomThemes ? window.RoomThemes.ids : ['calm', 'keycap', 'edition', 'terminal', 'tide'];
  var palettes = window.RoomThemes && window.RoomThemes.paletteIds ? window.RoomThemes.paletteIds : ['recommended'];
  var views = ['clock', 'glance', 'weather'];
  function valid(value) {
    return value && themes.indexOf(value.theme) >= 0 && ['light', 'dark'].indexOf(value.mode) >= 0 && views.indexOf(value.view) >= 0 && (typeof value.palette === 'undefined' || palettes.indexOf(value.palette) >= 0);
  }
  function copy() { return { theme: current.theme, mode: current.mode, view: current.view, palette: current.palette }; }
  function set(value, source) {
    if (!valid(value)) { return false; }
    var palette = value.palette || 'recommended';
    if (current.palette === palette && current.theme === value.theme && current.mode === value.mode && current.view === value.view) { return true; }
    current = { theme: value.theme, mode: value.mode, view: value.view, palette: palette };
    try { localStorage.setItem(key, JSON.stringify(current)); } catch (ignored) {}
    for (var i = 0; i < listeners.length; i++) { listeners[i](copy(), source || 'local'); }
    return true;
  }
  try {
    var saved = JSON.parse(localStorage.getItem(key));
    if (saved) {
      if (themes.indexOf(saved.theme) >= 0) { current.theme = saved.theme; }
      if (['light', 'dark'].indexOf(saved.mode) >= 0) { current.mode = saved.mode; }
      if (views.indexOf(saved.view) >= 0) { current.view = saved.view; }
      if (palettes.indexOf(saved.palette) >= 0) { current.palette = saved.palette; }
    }
  } catch (ignored) {}
  window.RoomState = { appearanceVersion: 2, get: copy, set: set, valid: valid, subscribe: function (fn) { listeners.push(fn); } };
  window.addEventListener('storage', function (event) {
    if (event.key === key && event.newValue) { try { set(JSON.parse(event.newValue), 'tab'); } catch (ignored) {} }
  });
}());
