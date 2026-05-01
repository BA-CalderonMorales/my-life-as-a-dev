/**
 * Focus Mode — Hide distractions for reading
 * Toggle with 'f' key (when not typing)
 */
(function () {
  'use strict';

  var isFocusMode = false;
  var badge = null;

  function createBadge() {
    var el = document.createElement('div');
    el.className = 'mlad-focus-badge';
    el.textContent = 'Focus mode — press f to exit';
    el.setAttribute('role', 'status');
    el.addEventListener('click', function () {
      toggle();
    });
    document.body.appendChild(el);
    return el;
  }

  function toggle() {
    isFocusMode = !isFocusMode;
    document.body.classList.toggle('mlad-focus-mode', isFocusMode);
    if (isFocusMode) {
      if (!badge) badge = createBadge();
      badge.classList.add('is-visible');
    } else if (badge) {
      badge.classList.remove('is-visible');
    }
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
