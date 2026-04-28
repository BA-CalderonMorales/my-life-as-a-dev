/**
 * Focus Mode — Hide distractions for reading
 * Toggle with 'f' key (when not typing)
 */
(function () {
  'use strict';

  var isFocusMode = false;

  function toggle() {
    isFocusMode = !isFocusMode;
    document.body.classList.toggle('mlad-focus-mode', isFocusMode);
  }

  function isTyping() {
    var tag = document.activeElement && document.activeElement.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.activeElement && document.activeElement.isContentEditable;
  }

  document.addEventListener('keydown', function (e) {
    if (isTyping()) return;
    if (e.key === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      toggle();
    }
  });
})();
