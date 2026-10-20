/* Stable theme identities shared by the legacy browser renderer and Worker.
   ES5 / no dependencies. Larger-app adoption is documented in theme-lab/CATALOG.md. */
(function () {
  'use strict';
  var catalog = {
    ids: ['calm', 'keycap', 'edition', 'terminal', 'tide', 'meridian', 'atelier', 'platform'],
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
