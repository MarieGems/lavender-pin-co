(function () {
  var slots = document.querySelectorAll('[data-include]');
  var loads = Array.prototype.map.call(slots, function (el) {
    return fetch(el.getAttribute('data-include'))
      .then(function (r) { return r.text(); })
      .then(function (html) { el.outerHTML = html; })
      .catch(function () { /* leave the slot empty rather than break the page */ });
  });
  Promise.all(loads).then(function () {
    document.dispatchEvent(new CustomEvent('partials:loaded'));
  });
})();
