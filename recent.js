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
