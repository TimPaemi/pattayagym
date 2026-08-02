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

  statusKey: function (g) {
    return String((g && g.status) || '').trim().toLowerCase();
  },

  operationBlocked: function (g) {
    return ['closed','likely-closed','unverified','out-of-area','not-in-pattaya','informational','non-sport','non-sport-attraction','public-beach'].indexOf(this.statusKey(g)) !== -1;
  },

  statusLabel: function (g) {
    var labels = {'closed':'Permanently closed','likely-closed':'Likely closed','unverified':'Unverified record','out-of-area':'Not in Pattaya','not-in-pattaya':'Not in Pattaya','informational':'Reference record, not a venue','non-sport':'Not a sports venue','non-sport-attraction':'Not a sports venue','public-beach':'Public beach, not a staffed venue','schedule-unconfirmed':'Timetable unconfirmed','limited-operation':'Limited operation'};
    var key = this.statusKey(g);
    return key ? (labels[key] || key.replace(/-/g, ' ')) : '';
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
      var venueName = btn.dataset.pgFavoriteName || 'this venue';
      btn.classList.toggle('is-saved', saved);
      btn.setAttribute('aria-pressed', saved ? 'true' : 'false');
      btn.setAttribute('aria-label', (saved ? 'Remove ' : 'Save ') + venueName + (saved ? ' from favorites' : ' to favorites'));
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
    var status = document.getElementById('favorites-status');
    if (status) status.textContent = list.length + ' saved venue' + (list.length === 1 ? '' : 's') + '.';
    target.innerHTML = list.map(function (item) {
      var current = byId[item.id];
      var g = current || item;
      var blocked = !current || this.operationBlocked(g);
      var statusText = current ? this.statusLabel(g) : 'Record no longer in directory';
      var statusKey = this.statusKey(g);
      var desc = g.description || '';
      if (desc.length > 140) desc = desc.slice(0, 140).trim() + '…';
      return '<article class="cat-venue-card favorite-list-card' + (blocked ? ' is-unresolved' : '') + '">' +
        '<div class="cv-head"><h3><a href="/gyms/' + this.esc(item.id) + '/">' + this.esc(g.name || item.name) + '</a></h3></div>' +
        (g.area ? '<div class="cv-meta">' + this.esc(g.area) + (!blocked && g.priceRange ? ' · ' + this.esc(g.priceRange) : '') + '</div>' : '') +
        (statusText ? '<span class="record-status' + (statusKey === 'closed' || statusKey === 'likely-closed' ? ' is-closed' : '') + '">' + this.esc(statusText) + '</span>' : '') +
        (desc ? '<p>' + this.esc(desc) + '</p>' : '') +
        '<div class="btn-row favorite-list-actions">' +
          '<a class="btn btn-primary" href="/gyms/' + this.esc(item.id) + '/">' + (blocked ? 'View record warning' : 'View venue') + '</a>' +
          '<button type="button" class="btn btn-ghost favorite-btn is-saved" data-pg-favorite-id="' + this.esc(item.id) + '" data-pg-favorite-name="' + this.esc(g.name || item.name) + '" aria-pressed="true"><span class="fav-heart" aria-hidden="true">&#9829;</span><span class="fav-btn-label">Remove</span></button>' +
        '</div></article>';
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
