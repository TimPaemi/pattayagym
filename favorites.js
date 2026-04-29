/* === pattaya-gym.com favorites widget === */
window.PG = window.PG || {};

PG.favorites = {
  KEY: 'pg_favorites_v1',
  MAX: 100,

  esc: function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  },

  get: function () {
    try {
      var raw = JSON.parse(localStorage.getItem(this.KEY)) || [];
      return raw.filter(function (x) { return x && x.id; });
    } catch (e) {
      return [];
    }
  },

  set: function (arr) {
    var seen = {};
    var clean = [];
    arr.forEach(function (x) {
      if (!x || !x.id || seen[x.id]) return;
      seen[x.id] = true;
      clean.push({
        id: String(x.id),
        name: String(x.name || x.id),
        category: String(x.category || ''),
        area: String(x.area || ''),
        priceRange: String(x.priceRange || ''),
        savedAt: x.savedAt || new Date().toISOString()
      });
    });
    try { localStorage.setItem(this.KEY, JSON.stringify(clean.slice(0, this.MAX))); }
    catch (e) { /* private mode etc */ }
  },

  findVenue: function (id) {
    var gyms = window.GYMS || [];
    for (var i = 0; i < gyms.length; i++) {
      if (gyms[i].id === id) return gyms[i];
    }
    return null;
  },

  metaFromButton: function (btn) {
    var id = btn.dataset.pgFavoriteId;
    var g = this.findVenue(id) || {};
    return {
      id: id,
      name: btn.dataset.pgFavoriteName || g.name || id,
      category: btn.dataset.pgFavoriteCategory || g.category || '',
      area: btn.dataset.pgFavoriteArea || g.area || '',
      priceRange: btn.dataset.pgFavoritePrice || g.priceRange || ''
    };
  },

  has: function (id) {
    return this.get().some(function (x) { return x.id === id; });
  },

  toggle: function (item) {
    var list = this.get();
    var id = item && item.id;
    if (!id) return;
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) { idx = i; break; }
    }
    if (idx >= 0) {
      list.splice(idx, 1);
      if (PG.toast) PG.toast((item.name || id) + ' removed from favorites');
    } else {
      if (list.length >= this.MAX) {
        if (PG.toast) PG.toast('Favorites list is full');
        return;
      }
      item.savedAt = new Date().toISOString();
      list.unshift(item);
      if (PG.toast) PG.toast((item.name || id) + ' saved to favorites');
    }
    this.set(list);
    this.renderWidget();
    this.refreshAllButtons();
    this.renderListPage();
  },

  clear: function () {
    this.set([]);
    this.renderWidget();
    this.refreshAllButtons();
    this.renderListPage();
  },

  bindButtons: function (root) {
    var self = this;
    (root || document).querySelectorAll('[data-pg-favorite-id]').forEach(function (btn) {
      if (btn.dataset.pgFavoriteBound === '1') return;
      btn.dataset.pgFavoriteBound = '1';
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        self.toggle(self.metaFromButton(btn));
      });
    });
  },

  refreshAllButtons: function () {
    var self = this;
    document.querySelectorAll('[data-pg-favorite-id]').forEach(function (btn) {
      var saved = self.has(btn.dataset.pgFavoriteId);
      btn.classList.toggle('is-saved', saved);
      btn.setAttribute('aria-pressed', saved ? 'true' : 'false');
      btn.setAttribute('aria-label', saved ? 'Remove from favorites' : 'Save to favorites');
      var heart = btn.querySelector('.fav-heart');
      if (heart) heart.innerHTML = saved ? '&#9829;' : '&#9825;';
      var label = btn.querySelector('.fav-btn-label');
      if (label) label.textContent = saved ? 'Saved' : 'Save';
    });
  },

  renderWidget: function () {
    var list = this.get();
    var widget = document.getElementById('pg-favorites-widget');
    if (!list.length) {
      if (widget) widget.remove();
      return;
    }
    if (!widget) {
      widget = document.createElement('div');
      widget.id = 'pg-favorites-widget';
      document.body.appendChild(widget);
    }
    widget.innerHTML = '<a class="pg-fw-inner" href="/favorites/">' +
      '<span class="pg-fw-heart" aria-hidden="true">&#9829;</span>' +
      '<span><strong>' + list.length + '</strong> saved</span>' +
      '</a>';
  },

  renderListPage: function () {
    var target = document.getElementById('favorites-list');
    if (!target) return;
    var empty = document.getElementById('favorites-empty');
    var list = this.get();
    var gyms = window.GYMS || [];
    var byId = {};
    gyms.forEach(function (g) { byId[g.id] = g; });
    if (!list.length) {
      target.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    target.innerHTML = list.map(function (item) {
      var g = byId[item.id] || item;
      return '<article class="cat-venue-card favorite-list-card">' +
        '<div class="cv-head"><h3><a href="/gyms/' + this.esc(item.id) + '/">' + this.esc(g.name || item.name) + '</a></h3></div>' +
        (g.area ? '<div class="cv-meta">Area: ' + this.esc(g.area) + '</div>' : '') +
        (g.priceRange ? '<div class="cv-meta">Price: ' + this.esc(g.priceRange) + '</div>' : '') +
        (g.description ? '<p>' + this.esc(g.description) + '</p>' : '') +
        '<div class="card-actions">' +
          '<a class="primary" href="/gyms/' + this.esc(item.id) + '/">View Details</a>' +
          '<button class="favorite-btn is-saved" data-pg-favorite-id="' + this.esc(item.id) + '" data-pg-favorite-name="' + this.esc(g.name || item.name) + '" aria-pressed="true"><span class="fav-heart" aria-hidden="true">&#9829;</span><span class="fav-btn-label">Saved</span></button>' +
        '</div>' +
      '</article>';
    }, this).join('');
    this.bindButtons(target);
    this.refreshAllButtons();
  },

  init: function () {
    this.bindButtons(document);
    this.refreshAllButtons();
    this.renderWidget();
    this.renderListPage();
  }
};

document.addEventListener('DOMContentLoaded', function () { PG.favorites.init(); });
