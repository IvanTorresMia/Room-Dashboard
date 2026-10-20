/* Stable theme identities shared by the legacy browser renderer and Worker.
   ES5 / no dependencies. Larger-app adoption is documented in theme-lab/CATALOG.md. */
(function () {
  'use strict';
  var catalog = {
    ids: ['calm', 'keycap', 'edition', 'terminal', 'tide', 'meridian', 'atelier', 'platform'],
    paletteIds: ['recommended', 'orange', 'blue', 'red', 'green'],
    palettes: {
      recommended: { name: 'Recommended' },
      orange: { name: 'Signal Orange', dark: { background: '#111416', text: '#f3eee7', muted: '#b8c0c6', accent: '#ff782f', surface: '#20272c', border: '#56616a', onAccent: '#151719' }, light: { background: '#f1eeea', text: '#20272c', muted: '#525f69', accent: '#a43808', surface: '#e2dcd4', border: '#a9a198', onAccent: '#fff6e9' } },
      blue: { name: 'Ion Blue', dark: { background: '#0b1324', text: '#e6eeff', muted: '#b3c5e3', accent: '#659cff', surface: '#162640', border: '#476185', onAccent: '#091426' }, light: { background: '#edf2fa', text: '#122846', muted: '#4e6383', accent: '#164ed8', surface: '#dce6f6', border: '#9cafd0', onAccent: '#ffffff' } },
      red: { name: 'Laser Red', dark: { background: '#1a1014', text: '#fff0ee', muted: '#d6b9bc', accent: '#ff5b65', surface: '#301b24', border: '#80525c', onAccent: '#210d12' }, light: { background: '#f7efec', text: '#381a24', muted: '#795561', accent: '#bc233e', surface: '#eddde0', border: '#c198a0', onAccent: '#fff6ef' } },
      green: { name: 'Phosphor Green', dark: { background: '#11170f', text: '#eaf4e1', muted: '#b8c9aa', accent: '#acf553', surface: '#202c1a', border: '#596e44', onAccent: '#111b0b' }, light: { background: '#edf2e7', text: '#233c22', muted: '#526c4b', accent: '#2d651f', surface: '#dce8ce', border: '#9bb489', onAccent: '#f4ffe9' } }
    },
    faces: {
      calm: { name: 'Calm', description: 'Warm tones · quiet landscape', light: '#f3efe5', dark: '#171e23' },
      keycap: { name: 'Keycap', description: 'Orange accents · keyboard inspired', light: '#eeefed', dark: '#1c1e22' },
      edition: { name: 'Edition', description: 'Bold serif · the daily weather edition', light: '#f5f0e5', dark: '#25211f' },
      terminal: { name: 'Terminal', description: 'Green monochrome · instrument panel', light: '#edf3e7', dark: '#101c16' },
      tide: { name: 'Tide', description: 'Ocean blues · soft rounded forms', light: '#edf5fa', dark: '#122535' },
      meridian: { name: 'Meridian', description: 'Warm geometry · a quiet graphic poster', light: '#eee5d0', dark: '#282820' },
      atelier: { name: 'Atelier', description: 'Serif dial · a modern mantelpiece', light: '#eee7e7', dark: '#271e2a' },
      platform: { name: 'Platform', description: 'Cobalt signage · order at a glance', light: '#1747bd', dark: '#101c36' }
    }
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = catalog; }
  else { window.RoomThemes = catalog; }
}());
