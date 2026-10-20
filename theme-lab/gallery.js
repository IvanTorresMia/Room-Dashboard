(function () {
  'use strict';
  var controls = document.getElementById('controls'), links = document.querySelectorAll('a[data-face]'), frames = document.getElementsByTagName('iframe');
  function update() {
    var suffix = '', selects = controls.getElementsByTagName('select'), i;
    for (i = 0; i < selects.length; i++) { suffix += '&' + selects[i].id + '=' + encodeURIComponent(selects[i].value); }
    for (i = 0; i < links.length; i++) {
      var url = 'preview.html?face=' + links[i].getAttribute('data-face') + suffix;
      links[i].href = url; frames[i].src = url;
    }
  }
  controls.addEventListener('change', update); controls.addEventListener('submit', function (event) { event.preventDefault(); });
  update();
}());
