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
      <article class="card">
        <div class="card-head">
          <span class="card-cat">${catLabel(g.category)}</span>
          ${favoriteBtn}
        </div>
        <h3>${titleHtml}</h3>
        <div class="card-meta">
          ${g.area ? `<span>📍 ${escapeHtml(g.area)}</span>` : ""}
          ${g.priceRange ? `<span>💰 ${escapeHtml(g.priceRange)}</span>` : ""}
          ${g.hours ? `<span>🕐 ${escapeHtml(g.hours)}</span>` : ""}
        </div>
        <p class="card-desc">${escapeHtml(g.description || "")}</p>
        ${tags ? `<div class="card-tags">${tags}</div>` : ""}
        ${actions.length ? `<div class="card-actions">${actions.join("")}</div>` : ""}
      </article>
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
