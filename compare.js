/* === pattaya-gym.com compare widget === */
window.PG = window.PG || {};

PG.compare = {
  KEY: 'pg_compare_v1',
  MAX: 4,

  get: function () {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch (e) { return []; }
  },

  set: function (arr) {
    try { localStorage.setItem(this.KEY, JSON.stringify(arr.slice(0, this.MAX))); }
    catch (e) { /* private mode etc */ }
  },

  has: function (id) {
    return this.get().some(function (x) { return x.id === id; });
  },

  toggle: function (id, name) {
    var list = this.get();
    var idx = -1;
    for (var i = 0; i < list.length; i++) if (list[i].id === id) { idx = i; break; }
    if (idx >= 0) {
      list.splice(idx, 1);
      if (PG.toast) PG.toast(name + ' removed from compare');
    } else {
      if (list.length >= this.MAX) {
        if (PG.toast) PG.toast('Max ' + this.MAX + ' venues — remove one to add another');
        return;
      }
      list.push({ id: id, name: name });
      if (PG.toast) PG.toast(name + ' added — ' + list.length + ' selected');
    }
    this.set(list);
    this.renderWidget();
    this.refreshAllButtons();
  },

  clear: function () {
    this.set([]);
    this.renderWidget();
    this.refreshAllButtons();
  },

  renderWidget: function () {
    var list = this.get();
    var widget = document.getElementById('pg-compare-widget');

    if (list.length === 0) {
      if (widget) widget.remove();
      return;
    }

    if (!widget) {
      widget = document.createElement('div');
      widget.id = 'pg-compare-widget';
      document.body.appendChild(widget);
    }

    var ids = list.map(function (x) { return x.id; }).join(',');
    var pills = list.map(function (x) {
      return '<span class="pg-cw-pill">' +
        '<span>' + (x.name.length > 20 ? x.name.slice(0, 18) + '…' : x.name) + '</span>' +
        '<button class="pg-cw-x" onclick="PG.compare.toggle(\'' + x.id + '\',\'' + x.name.replace(/'/g, "\\'") + '\')" aria-label="Remove">×</button>' +
        '</span>';
    }).join('');

    widget.innerHTML =
      '<div class="pg-cw-inner">' +
        '<div class="pg-cw-header">' +
          '<strong>Compare (' + list.length + ')</strong>' +
          '<button class="pg-cw-clear" onclick="PG.compare.clear()" title="Clear all">Clear</button>' +
        '</div>' +
        '<div class="pg-cw-list">' + pills + '</div>' +
        (list.length >= 2
          ? '<a class="pg-cw-go" href="/compare/?ids=' + ids + '">See comparison →</a>'
          : '<div class="pg-cw-hint">Add at least 2 venues to compare</div>') +
      '</div>';
  },

  refreshAllButtons: function () {
    var self = this;
    document.querySelectorAll('[data-pg-compare-id]').forEach(function (btn) {
      var added = self.has(btn.dataset.pgCompareId);
      btn.classList.toggle('is-added', added);
      var label = btn.querySelector('.cmp-btn-label') || btn;
      label.textContent = added ? '✓ Added to compare' : '+ Add to compare';
    });
  },

  init: function () {
    var self = this;
    this.renderWidget();
    document.querySelectorAll('[data-pg-compare-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        self.toggle(btn.dataset.pgCompareId, btn.dataset.pgCompareName);
      });
    });
    this.refreshAllButtons();
  }
};

document.addEventListener('DOMContentLoaded', function () { PG.compare.init(); });
