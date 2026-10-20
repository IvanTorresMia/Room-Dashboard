(function () {
  'use strict';
  if (/(?:[?&])preview=1(?:&|$)/.test(location.search)) { return; }
  var storageKey = 'room-remote-v1';
  var config = null;
  var revision = null;
  var pending = null;
  var busy = false;
  var generation = 0;
  var ackAt = 0;
  var confirmed = -1;
  var seen = 0;
  var listeners = [];
  var lastMessage = '';
  var controller = /\/control\/?(?:index\.html)?$/.test(location.pathname);
  function validConfig(value) {
    return value && typeof value.endpoint === 'string' && /^https:\/\/[a-z0-9-]+\.[a-z0-9.-]+\.workers\.dev$/.test(value.endpoint) && /^[a-f0-9]{64}$/.test(value.key);
  }
  function status(message) {
    lastMessage = message;
    var indicator = document.getElementById('sync-indicator');
    if (indicator) { indicator.hidden = !message || message === 'Connected'; indicator.textContent = message; }
    for (var i = 0; i < listeners.length; i++) { listeners[i](message, { paired: !!config, revision: revision, confirmedRevision: confirmed, displaySeen: seen, pending: !!pending }); }
  }
  function request(method, path, body, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, config.endpoint + path, true);
    xhr.timeout = 12000;
    xhr.setRequestHeader('Authorization', 'Bearer ' + config.key);
    if (body) { xhr.setRequestHeader('Content-Type', 'application/json'); }
    xhr.onload = function () {
      var data;
      try { data = JSON.parse(xhr.responseText); } catch (ignored) { callback(0); return; }
      callback(xhr.status, data);
    };
    xhr.onerror = xhr.ontimeout = function () { callback(0); };
    try { xhr.send(body ? JSON.stringify(body) : null); } catch (ignored) { callback(0); }
  }
  function accept(data) {
    return data && window.RoomState.valid(data.settings) && typeof data.revision === 'number' && data.revision >= 0;
  }
  function cycle() {
    if (!config || busy || document.hidden) { return; }
    busy = true;
    var active = generation;
    request('GET', '/settings', null, function (code, data) {
      if (active !== generation) { return; }
      if (code !== 200) { busy = false; status(code === 401 ? 'Pairing expired · reconnect this device' : 'Offline · local controls still work'); return; }
      if (!accept(data)) {
        busy = false;
        status(controller ? 'Settings not supported · reload this controller' : 'Display update needed · tap Display paired, then Update display');
        return;
      }
      revision = data.revision; confirmed = data.confirmedRevision; seen = data.displaySeen;
      if (pending) {
        var sending = pending;
        request('PUT', '/settings', { settings: sending, revision: revision }, function (writeCode, result) {
          if (active !== generation) { return; }
          busy = false;
          if ((writeCode === 200 || writeCode === 409) && accept(result)) {
            revision = result.revision; confirmed = result.confirmedRevision; seen = result.displaySeen;
            if (writeCode === 200) {
              if (pending === sending) { pending = null; }
              status('Saved · waiting for display');
            } else { status('Another device changed settings · retrying'); }
            if (pending) { setTimeout(cycle, 100); }
          } else { status('Not sent · retrying when connected'); }
        });
        return;
      }
      window.RoomState.set(data.settings, 'remote');
      busy = false;
      status(controller ? (confirmed === revision && Date.now() - seen < 45000 ? 'Confirmed on display' : 'Connected · waiting for display') : 'Connected');
      if (!controller && (confirmed !== revision || Date.now() - ackAt > 30000)) {
        ackAt = Date.now();
        request('POST', '/ack', { revision: revision }, function () {});
      }
    });
  }
  function pairingLink() {
    if (!config) { return ''; }
    var path = location.pathname.replace(/control\/(index\.html)?$/, '').replace(/index\.html$/, '');
    if (path.charAt(path.length - 1) !== '/') { path += '/'; }
    return location.origin + path + 'control/#pair=' + encodeURIComponent(JSON.stringify(config));
  }
  function connect(value) {
    if (!validConfig(value)) { return false; }
    config = { endpoint: value.endpoint, key: value.key }; generation++; busy = false; revision = null; pending = null;
    try { localStorage.setItem(storageKey, JSON.stringify(config)); } catch (ignored) { status('Storage unavailable · pairing lasts until reload'); }
    status('Connecting…'); cycle(); return true;
  }
  window.RoomRemote = {
    connect: connect,
    parse: function (text) {
      try {
        var fragment = text.indexOf('#pair=');
        var value = JSON.parse(decodeURIComponent(fragment >= 0 ? text.slice(fragment + 6) : text));
        return validConfig(value) ? value : null;
      } catch (ignored) { return null; }
    },
    link: pairingLink,
    paired: function () { return !!config; },
    subscribe: function (fn) { listeners.push(fn); if (lastMessage) { fn(lastMessage, { paired: !!config, revision: revision, confirmedRevision: confirmed, displaySeen: seen, pending: !!pending }); } },
    createCode: function (callback) {
      if (!config) { callback('Connect this device first'); return; }
      request('POST', '/pair', {}, function (code, data) {
        callback(code === 200 && data && data.code ? null : 'Could not generate a code', data && data.code);
      });
    },
    claim: function (code, callback) {
      var endpoint = window.ROOM_REMOTE_ENDPOINT || '';
      var input = document.getElementById('endpoint');
      if (!endpoint && input) { endpoint = input.value.replace(/\/+$/, ''); }
      if (!/^https:\/\/[a-z0-9-]+\.[a-z0-9.-]+\.workers\.dev$/.test(endpoint)) { callback('Backend is not connected yet. Finish Cloudflare setup first.'); return; }
      var normalized = code.replace(/-/g, '').toUpperCase();
      if (!/^[A-HJ-NP-Z2-9]{12}$/.test(normalized)) { callback('Enter a 12-character code or a private pairing link.'); return; }
      var xhr = new XMLHttpRequest();
      xhr.open('POST', endpoint + '/claim', true); xhr.timeout = 12000;
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onload = function () {
        try {
          var data = JSON.parse(xhr.responseText);
          if (xhr.status === 200 && connect({ endpoint: endpoint, key: data.key })) { callback(null); }
          else { callback('Code expired or already used. Generate a new code.'); }
        } catch (ignored) { callback('Could not connect. Try again.'); }
      };
      xhr.onerror = xhr.ontimeout = function () { callback('Could not connect. Check your connection.'); };
      xhr.send(JSON.stringify({ code: normalized }));
    },
    disconnect: function () { generation++; config = null; pending = null; busy = false; revision = null; try { localStorage.removeItem(storageKey); } catch (ignored) {} status('Disconnected'); }
  };
  try { var saved = JSON.parse(localStorage.getItem(storageKey)); if (validConfig(saved)) { config = saved; } } catch (ignored) {}
  window.RoomState.subscribe(function (value, source) {
    if (config && source !== 'remote' && source !== 'tab') { pending = value; status('Sending…'); cycle(); }
  });
  document.addEventListener('DOMContentLoaded', function () {
    if (location.hash.indexOf('#pair=') === 0) {
      var incoming = window.RoomRemote.parse(location.hash);
      if (incoming) { connect(incoming); }
      try { history.replaceState(null, '', location.pathname + location.search); } catch (ignored) {}
    }
    if (!config) { status(controller ? 'Not paired · changes stay on this device' : 'Not paired · tap Pair display'); }
    cycle();
  });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { cycle(); } });
  window.addEventListener('online', cycle);
  window.addEventListener('pageshow', function () { ackAt = 0; cycle(); });
  window.addEventListener('focus', cycle);
  setInterval(cycle, 5000);
}());
