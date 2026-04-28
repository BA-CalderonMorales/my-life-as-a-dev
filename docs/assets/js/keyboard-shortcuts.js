/**
 * Keyboard Shortcuts — Vim-inspired navigation
 * Press ? to see available shortcuts.
 */
(function () {
  'use strict';

  var isModalOpen = false;
  var pendingG = false;
  var pendingTimer = null;

  var SHORTCUTS = [
    { key: '?', desc: 'Show this help' },
    { key: '/', desc: 'Focus search' },
    { key: 's', desc: 'Focus search' },
    { key: 't', desc: 'Toggle theme' },
    { key: 'g h', desc: 'Go to Home' },
    { key: 'g p', desc: 'Go to Projects' },
    { key: 'g l', desc: 'Go to Learning' },
    { key: 'g r', desc: 'Go to Resume' },
    { key: 'g d', desc: 'Go to Docs-as-Code' },
    { key: 'Esc', desc: 'Close modal / search' }
  ];

  function createModal() {
    var modal = document.createElement('div');
    modal.className = 'mlad-kb-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'Keyboard shortcuts');
    modal.setAttribute('aria-hidden', 'true');

    var inner = document.createElement('div');
    inner.className = 'mlad-kb-modal__inner';

    var title = document.createElement('div');
    title.className = 'mlad-kb-modal__title';
    title.textContent = 'Keyboard shortcuts';
    inner.appendChild(title);

    var grid = document.createElement('div');
    grid.className = 'mlad-kb-modal__grid';

    SHORTCUTS.forEach(function (s) {
      var row = document.createElement('div');
      row.className = 'mlad-kb-modal__row';

      var kbd = document.createElement('kbd');
      kbd.className = 'mlad-kb-modal__key';
      kbd.textContent = s.key;

      var desc = document.createElement('span');
      desc.className = 'mlad-kb-modal__desc';
      desc.textContent = s.desc;

      row.appendChild(kbd);
      row.appendChild(desc);
      grid.appendChild(row);
    });

    inner.appendChild(grid);
    modal.appendChild(inner);
    document.body.appendChild(modal);
    return modal;
  }

  var modal = createModal();

  var focusableSelectors = 'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';
  var lastFocused = null;

  function getFocusable(el) {
    return Array.from(el.querySelectorAll(focusableSelectors)).filter(function (e) {
      return !e.disabled && e.offsetParent !== null;
    });
  }

  function trapFocus(e) {
    var focusable = getFocusable(modal);
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function openModal() {
    isModalOpen = true;
    lastFocused = document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    var focusable = getFocusable(modal);
    if (focusable.length) focusable[0].focus();
    modal.addEventListener('keydown', trapFocus);
  }

  function closeModal() {
    isModalOpen = false;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('is-open');
    modal.removeEventListener('keydown', trapFocus);
    if (lastFocused) lastFocused.focus();
  }

  function focusSearch() {
    var search = document.querySelector('.md-search__input');
    if (search) {
      search.focus();
    }
  }

  function toggleTheme() {
    var toggle = document.querySelector('[data-md-component="palette"] input');
    if (toggle) {
      toggle.click();
    }
  }

  function closeSearch() {
    var search = document.querySelector('.md-search__overlay');
    if (search) {
      search.click();
    }
    var drawer = document.querySelector('[data-md-toggle="drawer"]');
    if (drawer && drawer.checked) {
      drawer.checked = false;
    }
  }

  function navigate(path) {
    var base = window.location.pathname.split('/')[1] || '';
    var prefix = base ? '/' + base + '/' : '/';
    window.location.href = prefix + path;
  }

  function isTyping() {
    var tag = document.activeElement && document.activeElement.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.activeElement && document.activeElement.isContentEditable;
  }

  document.addEventListener('keydown', function (e) {
    if (isTyping()) {
      if (e.key === 'Escape') {
        document.activeElement.blur();
      }
      return;
    }

    if (isModalOpen) {
      if (e.key === 'Escape' || e.key === '?') {
        e.preventDefault();
        closeModal();
      }
      return;
    }

    if (pendingG) {
      clearTimeout(pendingTimer);
      pendingG = false;
      switch (e.key) {
        case 'h': e.preventDefault(); navigate(''); break;
        case 'p': e.preventDefault(); navigate('projects/'); break;
        case 'l': e.preventDefault(); navigate('learning/'); break;
        case 'r': e.preventDefault(); navigate('resume/'); break;
        case 'd': e.preventDefault(); navigate('docs-as-code/'); break;
      }
      return;
    }

    switch (e.key) {
      case '?':
        e.preventDefault();
        openModal();
        break;
      case '/':
      case 's':
        e.preventDefault();
        focusSearch();
        break;
      case 't':
        e.preventDefault();
        toggleTheme();
        break;
      case 'g':
        e.preventDefault();
        pendingG = true;
        pendingTimer = setTimeout(function () { pendingG = false; }, 800);
        break;
      case 'Escape':
        closeSearch();
        break;
    }
  });

  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });
})();
