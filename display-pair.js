(function () {
  'use strict';
  if (/(?:[?&])preview=1(?:&|$)/.test(location.search)) { return; }
  document.addEventListener('DOMContentLoaded', function () {
    var remote = window.RoomRemote;
    var trigger = document.getElementById('display-connection');
    var panel = document.getElementById('display-pair-panel');
    var field = document.getElementById('display-pair-code');
    var submit = document.getElementById('display-pair-submit');
    var close = document.getElementById('display-pair-close');
    var message = document.getElementById('display-pair-status');
    var updateLink = document.getElementById('update-display');
    if (!updateLink) {
      // An old cached document may fetch this newer script. Give it an update path too.
      updateLink = document.createElement('a');
      updateLink.id = 'update-display'; updateLink.className = 'display-update';
      updateLink.href = '?display-update=9'; updateLink.textContent = 'Update display';
      close.parentNode.insertBefore(updateLink, close);
    }
    updateLink.addEventListener('click', function () {
      // Navigate inside this Home Screen app: keep its origin and pairing store.
      updateLink.href = location.pathname + '?display-update=' + Date.now();
    });
    function update() { trigger.textContent = remote.paired() ? 'Display paired' : 'Pair display'; }
    function dismiss() { panel.hidden = true; trigger.focus(); }
    trigger.addEventListener('click', function () {
      panel.hidden = false;
      message.textContent = remote.paired() ? 'This app is already paired. Enter a new code only if you need to reconnect it.' : '';
      field.focus();
    });
    close.addEventListener('click', dismiss);
    panel.addEventListener('click', function (event) { if (event.target === panel) { dismiss(); } });
    panel.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' || event.keyCode === 27) { dismiss(); }
      if (event.key === 'Tab' || event.keyCode === 9) {
        var first = field;
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); close.focus(); }
        else if (!event.shiftKey && document.activeElement === close) { event.preventDefault(); first.focus(); }
      }
    });
    document.getElementById('display-pair-form').addEventListener('submit', function (event) {
      event.preventDefault(); submit.disabled = true; message.textContent = 'Pairing this display…';
      remote.claim(field.value.trim(), function (error) {
        submit.disabled = false;
        message.textContent = error || 'This display is paired. Keep this app open; changes from your phone or computer will appear here.';
        if (!error) { field.value = ''; close.textContent = 'Done'; }
        update();
      });
    });
    remote.subscribe(update); update();
  });
}());
