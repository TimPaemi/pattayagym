/* Global keyboard shortcuts for pattaya-gym.com */
(function () {
  window.PG = window.PG || {};
  if (window.PG.shortcutsReady) return;
  window.PG.shortcutsReady = true;

  var sequence = '';
  var sequenceTimer = 0;
  var modal = null;

  function isEditable(el) {
    if (!el) return false;
    var tag = (el.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
  }

  function clearSequence() {
    sequence = '';
    if (sequenceTimer) window.clearTimeout(sequenceTimer);
    sequenceTimer = 0;
  }

  function go(path) {
    window.location.href = path;
  }

  function focusSearch() {
    var input = document.querySelector('#search, #q, input[type="search"]');
    if (input) {
      input.focus();
      if (input.select) input.select();
      return;
    }
    go('/search/');
  }

  function buildModal() {
    if (modal) return modal;
    modal = document.createElement('div');
    modal.className = 'shortcut-modal';
    modal.hidden = true;
    modal.innerHTML =
      '<div class="shortcut-panel" role="dialog" aria-modal="true" aria-labelledby="shortcut-title">' +
        '<button class="shortcut-close" type="button" aria-label="Close keyboard shortcuts">&times;</button>' +
        '<h2 id="shortcut-title">Keyboard shortcuts</h2>' +
        '<div class="shortcut-row"><kbd>/</kbd><span>Focus search</span></div>' +
        '<div class="shortcut-row"><kbd>g</kbd><kbd>h</kbd><span>Go home</span></div>' +
        '<div class="shortcut-row"><kbd>g</kbd><kbd>d</kbd><span>Go to directory</span></div>' +
        '<div class="shortcut-row"><kbd>g</kbd><kbd>g</kbd><span>Go to guides</span></div>' +
        '<div class="shortcut-row"><kbd>?</kbd><span>Show this panel</span></div>' +
      '</div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function (event) {
      if (event.target === modal || event.target.closest('.shortcut-close')) hideModal();
    });
    return modal;
  }

  function showModal() {
    var el = buildModal();
    el.hidden = false;
    var close = el.querySelector('.shortcut-close');
    if (close) close.focus();
  }

  function hideModal() {
    if (modal) modal.hidden = true;
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      hideModal();
      clearSequence();
      return;
    }
    if (isEditable(event.target)) return;

    var key = event.key.toLowerCase();

    if (sequence === 'g') {
      if (key === 'h') {
        event.preventDefault();
        clearSequence();
        go('/');
        return;
      }
      if (key === 'd') {
        event.preventDefault();
        clearSequence();
        go('/#directory');
        return;
      }
      if (key === 'g') {
        event.preventDefault();
        clearSequence();
        go('/guides/');
        return;
      }
      clearSequence();
    }

    if (event.key === '/') {
      event.preventDefault();
      focusSearch();
      return;
    }

    if (event.key === '?' || (event.shiftKey && key === '/')) {
      event.preventDefault();
      showModal();
      return;
    }

    if (key === 'g') {
      sequence = 'g';
      if (sequenceTimer) window.clearTimeout(sequenceTimer);
      sequenceTimer = window.setTimeout(clearSequence, 1400);
    }
  });
})();
