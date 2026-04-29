/* === pattaya-gym.com compare widget === */
window.PG = window.PG || {};

PG.compare = {
  KEY: 'pg_compare_v1',
  MAX: 4,

  esc: function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  },

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
        if (PG.toast) PG.toast('Max ' + this.MAX + ' venues - remove one to add another');
        return;
      }
      list.push({ id: id, name: name });
      if (PG.toast) PG.toast(name + ' added - ' + list.length + ' selected');
    }
    this.set(list);
    this.renderWidget();
    this.refreshAllButtons();
    this.renderVenueHelper();
  },

  clear: function () {
    this.set([]);
    this.renderWidget();
    this.refreshAllButtons();
    this.renderVenueHelper();
  },

  renderWidget: function () {
    var list = this.get();
    var widget = document.getElementById('pg-compare-widget');

    if (list.length === 0) {
      if (widget) widget.remove();
      this.renderVenueHelper();
      return;
    }

    if (!widget) {
      widget = document.createElement('div');
      widget.id = 'pg-compare-widget';
      document.body.appendChild(widget);
    }

    var self = this;
    var ids = list.map(function (x) { return x.id; }).join(',');
    var pills = list.map(function (x) {
      var label = x.name.length > 20 ? x.name.slice(0, 18) + '...' : x.name;
      return '<span class="pg-cw-pill">' +
        '<span>' + self.esc(label) + '</span>' +
        '<button class="pg-cw-x" data-pg-compare-remove="' + self.esc(x.id) + '" aria-label="Remove ' + self.esc(x.name) + '">x</button>' +
        '</span>';
    }).join('');

    widget.innerHTML =
      '<div class="pg-cw-inner">' +
        '<div class="pg-cw-header">' +
          '<strong>Compare (' + list.length + ')</strong>' +
          '<button class="pg-cw-clear" data-pg-compare-clear="1" title="Clear all">Clear</button>' +
        '</div>' +
        '<div class="pg-cw-list">' + pills + '</div>' +
        (list.length >= 2
          ? '<a class="pg-cw-go" href="/compare/?ids=' + encodeURIComponent(ids) + '">See comparison -></a>'
          : '<div class="pg-cw-hint">Add at least 2 venues to compare</div>') +
      '</div>';

    widget.querySelectorAll('[data-pg-compare-remove]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.pgCompareRemove;
        var item = list.find(function (x) { return x.id === id; });
        self.toggle(id, item ? item.name : id);
      });
    });
    var clear = widget.querySelector('[data-pg-compare-clear]');
    if (clear) clear.addEventListener('click', function () { self.clear(); });
    this.renderVenueHelper();
  },

  renderVenueHelper: function () {
    var current = window.PG_CURRENT_VENUE;
    var anchor = document.querySelector('.venue-actions');
    if (!current || !current.id || !anchor) return;
    var box = document.getElementById('compare-to-current');
    if (!box) {
      box = document.createElement('div');
      box.id = 'compare-to-current';
      box.className = 'compare-helper';
      anchor.insertAdjacentElement('afterend', box);
    }
    var list = this.get();
    var added = list.some(function (x) { return x.id === current.id; });
    var others = list.filter(function (x) { return x.id !== current.id; });
    var ids = list.map(function (x) { return x.id; }).join(',');
    if (added) {
      box.innerHTML = '<strong>In your compare set.</strong> ' +
        (list.length >= 2 ? '<a href="/compare/?ids=' + encodeURIComponent(ids) + '">Open comparison</a>' : '<span>Add one more venue to compare side by side.</span>');
      return;
    }
    if (!others.length) {
      box.innerHTML = '<strong>Compare this venue.</strong> <button class="btn btn-secondary" data-add-current-compare="1">Add to compare</button>';
    } else {
      box.innerHTML = '<label for="compare-to-select">Compare this venue with</label>' +
        '<select id="compare-to-select">' +
        others.map(function (x) { return '<option value="' + this.esc(x.id) + '">' + this.esc(x.name) + '</option>'; }, this).join('') +
        '</select>' +
        '<button class="btn btn-secondary" data-add-current-compare="1">Add this venue</button>';
    }
    var btn = box.querySelector('[data-add-current-compare]');
    if (btn) {
      var self = this;
      btn.addEventListener('click', function () {
        self.toggle(current.id, current.name || current.id);
      });
    }
  },

  refreshAllButtons: function () {
    var self = this;
    document.querySelectorAll('[data-pg-compare-id]').forEach(function (btn) {
      var added = self.has(btn.dataset.pgCompareId);
      btn.classList.toggle('is-added', added);
      var label = btn.querySelector('.cmp-btn-label') || btn;
      label.textContent = added ? 'Added to compare' : '+ Add to compare';
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
    this.renderVenueHelper();
  }
};

document.addEventListener('DOMContentLoaded', function () { PG.compare.init(); });
