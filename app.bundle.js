/* === pattaya-gym.com bundled runtime === */

/* ===== share.js ===== */
/* === pattaya-gym.com share helpers === */
window.PG = window.PG || {};

PG.share = function (network) {
  var url = encodeURIComponent(window.location.href);
  var title = encodeURIComponent(document.title.split(' | ')[0] || 'Pattaya Gym');
  var links = {
    whatsapp: 'https://wa.me/?text=' + title + '%20' + url,
    facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + url,
    twitter:  'https://twitter.com/intent/tweet?url=' + url + '&text=' + title,
    line:     'https://social-plugins.line.me/lineit/share?url=' + url,
    telegram: 'https://t.me/share/url?url=' + url + '&text=' + title,
    email:    'mailto:?subject=' + title + '&body=' + url
  };
  if (network === 'copy') {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(window.location.href).then(function () { PG.toast('Link copied to clipboard'); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = window.location.href;
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      PG.toast('Link copied to clipboard');
    }
    return;
  }
  if (network === 'native' && navigator.share) {
    navigator.share({ title: document.title, url: window.location.href }).catch(function () {});
    return;
  }
  window.open(links[network], '_blank', 'noopener,width=600,height=520');
};

PG.toast = function (msg) {
  var t = document.createElement('div');
  t.className = 'pg-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(function () { t.classList.add('show'); });
  setTimeout(function () {
    t.classList.remove('show');
    setTimeout(function () { t.remove(); }, 300);
  }, 2200);
};

/* ===== recent.js ===== */
/* Recently viewed venues, backed by localStorage */
(function () {
  window.PG = window.PG || {};
  var KEY = 'pg_recent_v1';
  var MAX = 8;

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function get() {
    try {
      var parsed = JSON.parse(localStorage.getItem(KEY));
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function set(items) {
    try {
      localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
    } catch (e) {
      /* Ignore private-mode storage failures. */
    }
  }

  function categoryLabel(key) {
    var cats = window.CATEGORIES || [];
    var match = cats.find(function (cat) { return cat.key === key; });
    return match ? match.label : String(key || '').replace(/-/g, ' ');
  }

  function fromGym(item) {
    var gyms = window.GYMS || [];
    var gym = gyms.find(function (g) { return g.id === item.id; });
    if (!gym) return item;
    return {
      id: gym.id,
      name: gym.name,
      category: gym.category,
      area: gym.area,
      priceRange: gym.priceRange,
      href: '/gyms/' + gym.id + '/'
    };
  }

  function saveCurrent(current) {
    if (!current || !current.id) return;
    var clean = {
      id: current.id,
      name: current.name || current.id,
      category: current.category || '',
      area: current.area || '',
      priceRange: current.priceRange || '',
      href: current.href || ('/gyms/' + current.id + '/')
    };
    var list = get().filter(function (item) { return item && item.id !== clean.id; });
    list.unshift(clean);
    set(list);
  }

  function renderCard(item) {
    var venue = fromGym(item);
    var meta = [venue.area, venue.priceRange].filter(Boolean).map(escapeHtml).join(' &middot; ');
    return '<a class="recent-card" href="' + escapeHtml(venue.href || ('/gyms/' + venue.id + '/')) + '">' +
      '<span class="recent-cat">' + escapeHtml(categoryLabel(venue.category)) + '</span>' +
      '<h3>' + escapeHtml(venue.name || venue.id) + '</h3>' +
      (meta ? '<p>' + meta + '</p>' : '') +
      '<span class="recent-cta">Open venue</span>' +
    '</a>';
  }

  function render() {
    var section = document.getElementById('recently-viewed');
    var grid = document.getElementById('recently-viewed-grid');
    if (!section || !grid) return;
    var current = window.PG_CURRENT_VENUE || null;
    var currentId = current && current.id;
    var list = get()
      .filter(function (item) { return item && item.id && item.id !== currentId; })
      .slice(0, 4);

    if (!list.length) {
      section.hidden = true;
      grid.innerHTML = '';
      return;
    }

    section.hidden = false;
    grid.innerHTML = list.map(renderCard).join('');
  }

  window.PG.recent = {
    get: get,
    set: set,
    render: render,
    saveCurrent: saveCurrent
  };

  document.addEventListener('DOMContentLoaded', function () {
    saveCurrent(window.PG_CURRENT_VENUE);
    render();
  });
})();

/* ===== favorites.js ===== */
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

/* ===== compare.js ===== */
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

/* ===== app.js ===== */
/* === Pattaya Gym Directory — UI logic === */
(function () {
  const gyms = window.GYMS || [];
  const cats = window.CATEGORIES || [];

  let activeCategory = "all";
  let query = "";

  const $ = (id) => document.getElementById(id);
  const grid = $("gym-grid");
  const chips = $("category-chips");
  const search = $("search");
  const searchClear = $("search-clear");
  const empty = $("empty-state");
  const resultCount = $("result-count");

  // Stats
  $("stat-total").textContent = gyms.length;
  $("stat-categories").textContent = cats.length;
  $("year").textContent = new Date().getFullYear();

  // Build category chips with counts
  const buildChips = () => {
    const counts = gyms.reduce((acc, g) => {
      acc[g.category] = (acc[g.category] || 0) + 1;
      return acc;
    }, {});
    const all = `<button class="chip ${activeCategory === "all" ? "active" : ""}" data-cat="all">All <span class="count">${gyms.length}</span></button>`;
    const rest = cats
      .map((c) => {
        const n = counts[c.key] || 0;
        const active = activeCategory === c.key ? "active" : "";
        return `<button class="chip ${active}" data-cat="${c.key}"><span>${c.emoji}</span> ${c.label} <span class="count">${n}</span></button>`;
      })
      .join("");
    chips.innerHTML = all + rest;

    chips.querySelectorAll(".chip").forEach((el) => {
      el.addEventListener("click", () => {
        activeCategory = el.dataset.cat;
        buildChips();
        render();
      });
    });
  };

  const escapeHtml = (s) =>
    String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const catLabel = (key) => {
    const c = cats.find((x) => x.key === key);
    return c ? `${c.emoji} ${c.label}` : key;
  };

  const renderCard = (g) => {
    const tags = (g.tags || []).map((t) => `<span class="card-tag">${escapeHtml(t)}</span>`).join("");
    const actions = [];
    // Every venue in data.js now has a generated /gyms/<id>/ page (build.js handles all entries)
    actions.push(`<a class="primary" href="/gyms/${g.id}/">View Details</a>`);
    if (g.mapsUrl) actions.push(`<a href="${g.mapsUrl}" target="_blank" rel="noopener">Map</a>`);
    if (g.website) actions.push(`<a href="${g.website}" target="_blank" rel="noopener">Website</a>`);
    if (g.phone) actions.push(`<a href="tel:${g.phone.replace(/\s/g, "")}">Call</a>`);
    const titleHtml = `<a href="/gyms/${g.id}/" style="color:inherit;text-decoration:none;">${escapeHtml(g.name)}</a>`;
    const favoriteBtn = `<button class="favorite-btn card-favorite" data-pg-favorite-id="${escapeHtml(g.id)}" data-pg-favorite-name="${escapeHtml(g.name)}" data-pg-favorite-category="${escapeHtml(g.category)}" data-pg-favorite-area="${escapeHtml(g.area || "")}" data-pg-favorite-price="${escapeHtml(g.priceRange || "")}" aria-pressed="false" aria-label="Save to favorites"><span class="fav-heart" aria-hidden="true">&#9825;</span><span class="fav-btn-label">Save</span></button>`;
    return `
      <a class="card" href="/gyms/${g.id}/">
        <div class="card-head">
          <span class="card-cat">${catLabel(g.category)}</span>
          ${favoriteBtn}
        </div>
        <h3>${escapeHtml(g.name)}</h3>
        <div class="card-meta">
          ${g.area ? `<span>${escapeHtml(g.area)}</span>` : ""}
          ${g.priceRange ? `<span>${escapeHtml(g.priceRange)}</span>` : ""}
          ${g.hours ? `<span>${escapeHtml(g.hours)}</span>` : ""}
        </div>
        <p class="card-desc">${escapeHtml(g.description || "")}</p>
        <span class="card-arrow">View venue →</span>
      </a>
    `;
  };

  const matches = (g) => {
    if (activeCategory !== "all" && g.category !== activeCategory) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    const haystack = [
      g.name, g.area, g.address, g.description,
      catLabel(g.category), (g.tags || []).join(" ")
    ].join(" ").toLowerCase();
    return haystack.includes(q);
  };

  const render = () => {
    const filtered = gyms.filter(matches);
    grid.innerHTML = filtered.map(renderCard).join("");
    resultCount.textContent = filtered.length;
    empty.hidden = filtered.length > 0;
    if (window.PG && PG.favorites) {
      PG.favorites.bindButtons(grid);
      PG.favorites.refreshAllButtons();
      PG.favorites.renderWidget();
    }
  };

  search.addEventListener("input", (e) => {
    query = e.target.value.trim();
    searchClear.classList.toggle("visible", query.length > 0);
    render();
  });

  searchClear.addEventListener("click", () => {
    search.value = "";
    query = "";
    searchClear.classList.remove("visible");
    render();
    search.focus();
  });

  // init
  buildChips();
  render();
})();

// Sticky nav scrolled-state (homepage only — uses global window scroll)
(function () {
  var navEl = document.querySelector('.hero .nav');
  if (!navEl) return;
  function update() {
    if (document.documentElement.scrollTop > 30 || document.body.scrollTop > 30) {
      navEl.classList.add('scrolled');
    } else {
      navEl.classList.remove('scrolled');
    }
  }
  document.addEventListener('scroll', update, { passive: true });
  update();
})();

// Spotlight: most-recently-verified venues, top 6
(function () {
  var grid = document.getElementById('spotlight-grid');
  if (!grid) return;
  var GYMS = window.GYMS || [];
  var CATS = window.CATEGORIES || [];
  var catLabel = function (k) {
    var c = CATS.find(function (x) { return x.key === k; });
    return c ? c.label : k;
  };
  var sorted = GYMS.slice().sort(function (a, b) {
    return String(b.verified || '').localeCompare(String(a.verified || ''));
  }).slice(0, 6);
  grid.innerHTML = sorted.map(function (g) {
    return '<a class="spot-card" href="/gyms/' + g.id + '/">' +
      '<span class="spot-cat">' + catLabel(g.category) + '</span>' +
      '<h3>' + (g.name || '') + '</h3>' +
      (g.area ? '<p class="spot-meta">📍 ' + g.area + (g.priceRange ? ' · 💰 ' + g.priceRange : '') + '</p>' : '') +
      (g.description ? '<p class="spot-desc">' + g.description.slice(0, 110) + (g.description.length > 110 ? '…' : '') + '</p>' : '') +
      '<span class="spot-cta">View page →</span>' +
    '</a>';
  }).join('');
})();

// Featured this month: editorially curated venues rotated by calendar month.
(function () {
  var wrap = document.getElementById('featured-month');
  var grid = document.getElementById('featured-month-grid');
  if (!wrap || !grid) return;
  var GYMS = window.GYMS || [];
  var CATS = window.CATEGORIES || [];
  var esc = function (s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var catLabel = function (k) {
    var c = CATS.find(function (x) { return x.key === k; });
    return c ? c.label : k;
  };
  var featured = GYMS.filter(function (g) { return g.featured; });
  if (!featured.length) return;
  var now = new Date();
  var offset = (now.getFullYear() * 12 + now.getMonth()) % featured.length;
  var picks = featured.slice(offset).concat(featured.slice(0, offset)).slice(0, 3);
  grid.innerHTML = picks.map(function (g) {
    return '<a class="featured-card" href="/gyms/' + encodeURIComponent(g.id) + '/">' +
      '<span>' + esc(catLabel(g.category)) + '</span>' +
      '<h3>' + esc(g.name) + '</h3>' +
      '<p>' + esc(g.area || g.description || 'Pattaya') + '</p>' +
    '</a>';
  }).join('');
  wrap.hidden = false;
})();

// Reader feedback: pulled from a manual JSON file so testimonials are explicit editorial data.
(function () {
  var section = document.getElementById('reader-feedback');
  var grid = document.getElementById('reviews-grid');
  var empty = document.getElementById('reviews-empty');
  if (!section || !grid) return;
  var esc = function (s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  fetch('/data/reviews.json', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : { reviews: [] }; })
    .then(function (payload) {
      var reviews = Array.isArray(payload) ? payload : (payload.reviews || []);
      reviews = reviews.filter(function (r) { return r && r.published !== false && r.quote; }).slice(0, 5);
      if (!reviews.length) {
        if (empty) empty.hidden = false;
        return;
      }
      if (empty) empty.hidden = true;
      grid.innerHTML = reviews.map(function (r) {
        return '<article class="review-card">' +
          '<blockquote>' + esc(r.quote) + '</blockquote>' +
          '<cite>' + esc(r.name || 'Directory reader') + (r.context ? ' - ' + esc(r.context) : '') + '</cite>' +
        '</article>';
      }).join('');
    })
    .catch(function () {
      if (empty) empty.hidden = false;
    });
})();

// ============ Plausible custom event tracking (no-op if Plausible blocked) ============
(function () {
  if (typeof document === 'undefined' || document.dataset && document.dataset.pgPlausibleTracking === '1') return;
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a || !window.plausible) return;
    var href = a.getAttribute('href') || '';
    if (href.startsWith('tel:')) {
      window.plausible('PhoneCall', { props: { phone: href.replace('tel:', '') } });
    } else if (a.target === '_blank' && href.startsWith('http')) {
      if (href.indexOf('maps.google') >= 0 || href.indexOf('goo.gl/maps') >= 0) {
        window.plausible('MapClick', { props: { url: href } });
      } else if (href.indexOf('facebook.com') >= 0 || href.indexOf('instagram.com') >= 0) {
        window.plausible('SocialClick', { props: { url: href } });
      } else {
        window.plausible('OutboundClick', { props: { url: href } });
      }
    }
  }, true);
})();

// ============ Deep-link search support: /?q=xxx auto-populates search ============
(function () {
  if (typeof window === 'undefined') return;
  try {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (!q) return;
    document.addEventListener('DOMContentLoaded', function () {
      var search = document.getElementById('search');
      if (!search) return;
      search.value = q;
      search.dispatchEvent(new Event('input', { bubbles: true }));
      var dir = document.getElementById('directory');
      if (dir) dir.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  } catch (e) {}
})();
