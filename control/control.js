(function () {
  'use strict';
  function el(id) { return document.getElementById(id); }
  function update() {
    var state = window.RoomState.get();
    var buttons = document.querySelectorAll('[data-view], [data-theme], [data-mode]');
    for (var i = 0; i < buttons.length; i++) {
      var kind = buttons[i].hasAttribute('data-view') ? 'view' : buttons[i].hasAttribute('data-theme') ? 'theme' : 'mode';
      buttons[i].setAttribute('aria-pressed', buttons[i].getAttribute('data-' + kind) === state[kind] ? 'true' : 'false');
    }
    el('selection-summary').textContent = state.view + ' · ' + state.theme + ' · ' + state.mode;
  }
  function fitPreview() {
    var width = el('preview-wrap').clientWidth;
    el('preview-wrap').style.height = Math.round(width * 0.75) + 'px';
    el('preview').style.transform = 'scale(' + width / 1024 + ')';
    el('preview').style.webkitTransform = 'scale(' + width / 1024 + ')';
  }
  function sharing() {
    var paired = window.RoomRemote.paired();
    el('sharing').hidden = !paired;
    el('display-link').value = window.RoomRemote.link().replace('/control/#pair=', '/?v=5#pair=');
    el('connection-toggle').textContent = paired ? 'Pair devices' : 'Connect';
  }
  document.addEventListener('DOMContentLoaded', function () {
    var buttons = document.querySelectorAll('[data-view], [data-theme], [data-mode]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () {
        var state = window.RoomState.get();
        var kind = this.hasAttribute('data-view') ? 'view' : this.hasAttribute('data-theme') ? 'theme' : 'mode';
        state[kind] = this.getAttribute('data-' + kind); window.RoomState.set(state);
      });
    }
    window.RoomState.subscribe(update);
    window.RoomRemote.subscribe(function (message, details) {
      el('remote-status').textContent = message;
      el('status-dot').className = 'status-dot' + (message === 'Confirmed on display' ? ' connected' : '');
      sharing();
    });
    el('connection-toggle').addEventListener('click', function () { el('connection-panel').hidden = !el('connection-panel').hidden; });
    el('setup-form').addEventListener('submit', function (event) {
      event.preventDefault();
      if (window.RoomRemote.connect({ endpoint: el('endpoint').value.replace(/\/+$/, ''), key: el('room-key').value.trim() })) {
        el('room-key').value = ''; el('pair-error').textContent = ''; sharing();
      } else { el('pair-error').textContent = 'Check the Worker address and 64-character room key.'; }
    });
    el('pair-form').addEventListener('submit', function (event) {
      event.preventDefault();
      var text = el('pair-code').value.trim();
      var config = window.RoomRemote.parse(text);
      if (config) { window.RoomRemote.connect(config); el('pair-code').value = ''; el('pair-error').textContent = ''; sharing(); }
      else { window.RoomRemote.claim(text, function (error) { el('pair-error').textContent = error || 'Connected. To control the wall display, stay here and close Pair devices. Only open the dashboard on the device used as the display.'; if (!error) { el('pair-code').value = ''; sharing(); } }); }
    });
    el('create-code').addEventListener('click', function () {
      el('create-code').disabled = true;
      window.RoomRemote.createCode(function (error, code) {
        el('create-code').disabled = false; el('generated-code').textContent = error || code;
      });
    });
    el('copy-link').addEventListener('click', function () {
      el('display-link').focus(); el('display-link').select();
      try { el('copy-link').textContent = document.execCommand('copy') ? 'Copied' : 'Select and copy the link'; } catch (ignored) { el('copy-link').textContent = 'Select and copy the link'; }
    });
    el('disconnect').addEventListener('click', function () { window.RoomRemote.disconnect(); sharing(); });
    el('connection-panel').hidden = window.RoomRemote.paired();
    el('endpoint').value = window.ROOM_REMOTE_ENDPOINT || '';
    update(); sharing(); fitPreview();
  });
  window.addEventListener('resize', fitPreview);
}());
