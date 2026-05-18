/**
 * search-page.js
 * Live client-side search across all 158 Pattaya venues.
 * Reads window.GYMS + window.CATEGORIES set by /data.js
 *
 * Loaded by /search/index.html.
 * CSP-safe: served from 'self' origin, no eval, no inline injection.
 */
(function () {
  'use strict';

  // Wait for data.js to populate window.GYMS / window.CATEGORIES
  function ready() {
    if (!window.GYMS || !window.CATEGORIES) {
      return setTimeout(ready, 50);
    }
    init();
  }

  function esc(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Map data.js area string to a normalized slug+label for the dropdown
  var AREA_MAP = {
    'jomtien':         /jomtien/i,
    'naklua':          /naklua|north\s*pattaya|wongamat/i,
    'pratamnak':       /pratamnak|pratumnak/i,
    'central-pattaya': /central|beach\s*road|walking|soi\s*buakhao|3rd\s*road|mike|south\s*pattaya|pattaya\s*klang/i,
    'east-pattaya':    /east|darkside|mabprachan|nong\s*prue|sukhumvit|huai\s*yai|chai\s*ngam/i,
    'sattahip':        /sattahip|na\s*jomtien|bang\s*saray|bang\s*sare|u-tapao/i
  };
  var AREA_LABELS = {
    'jomtien':         'Jomtien Beach',
    'naklua':          'Naklua / North Pattaya',
    'pratamnak':       'Pratamnak Hill',
    'central-pattaya': 'Central Pattaya',
    'east-pattaya':    'East Pattaya / Darkside',
    'sattahip':        'Sattahip / Far South'
  };
  function areaSlug(s) {
    if (!s) return null;
    for (var k in AREA_MAP) if (AREA_MAP[k].test(s)) return k;
    return null;
  }

  // Lookup category label
  function catLabel(key) {
    var c = window.CATEGORIES.find(function (x) { return x.key === key; });
    return c ? c.label : key;
  }

  var state = {
    q: '',
    cat: 'all',
    area: 'all',
    price: 'all',
    openNow: false
  };

  function matches(g) {
    // Category
    if (state.cat !== 'all' && g.category !== state.cat) return false;
    // Area
    if (state.area !== 'all' && areaSlug(g.area) !== state.area) return false;
    // Price (exact match on ฿/฿฿/฿฿฿/฿฿฿฿)
    if (state.price !== 'all' && g.priceRange !== state.price) return false;
    // Open now — Round 17 (Codex F01.1). The previous heuristic flagged any
    // venue with "Daily" in its hours as always-open, which is wrong for
    // "Daily 09:00-18:00". This parses HH:MM-HH:MM windows out of the hours
    // string and checks them against current Pattaya time (ICT = UTC+7). The
    // regex shortcut for 24/7 is kept because that one is unambiguous.
    if (state.openNow) {
      var h = (g.hours || '').toLowerCase();
      if (/24\s*\/?\s*7|24\s*hour/i.test(h)) {
        // always open — pass
      } else {
        var now = new Date();
        var ictNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (7 * 3600000));
        var nowMin = ictNow.getHours() * 60 + ictNow.getMinutes();
        var windows = [];
        var re = /(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/g;
        var m;
        while ((m = re.exec(h))) windows.push([+m[1]*60 + +m[2], +m[3]*60 + +m[4]]);
        if (!windows.length) return false; // no parseable hours → conservative
        var openNow = false;
        for (var wi = 0; wi < windows.length; wi++) {
          var s = windows[wi][0], e = windows[wi][1];
          if (e <= s) { if (nowMin >= s || nowMin < e) { openNow = true; break; } } // overnight
          else if (nowMin >= s && nowMin < e) { openNow = true; break; }
        }
        if (!openNow) return false;
      }
    }
    // Text query (case-insensitive substring across name + area + category + tags + description)
    if (state.q) {
      var q = state.q.toLowerCase();
      var hay = [
        g.name || '',
        g.area || '',
        catLabel(g.category),
        (g.tags || []).join(' '),
        g.description || '',
        g.address || ''
      ].join(' ').toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  function render(results) {
    var statsEl = document.getElementById('stats');
    var grid = document.getElementById('search-results');
    if (!grid) return;
    var n = results.length;
    var total = window.GYMS.length;
    if (statsEl) {
      statsEl.innerHTML =
        n === total
          ? '<strong>' + total + '</strong> venues · showing all'
          : '<strong>' + n + '</strong> of ' + total + ' venues match your filters';
    }
    if (n === 0) {
      grid.innerHTML =
        '<div class="search-empty">' +
        '<div class="search-empty-emoji">·</div>' +
        '<h3>No matches</h3>' +
        '<p>Try a different keyword, broaden a filter, or clear all filters.</p>' +
        '<button type="button" id="clear-filters">Clear filters</button>' +
        '</div>';
      var btn = document.getElementById('clear-filters');
      if (btn) btn.addEventListener('click', clearAll);
      return;
    }
    var html = '';
    for (var i = 0; i < results.length; i++) {
      var g = results[i];
      var cat = catLabel(g.category);
      var desc = g.description || '';
      if (desc.length > 130) desc = desc.slice(0, 130).trim() + '…';
      html +=
        '<a class="result-card" href="/gyms/' + esc(g.id) + '/">' +
          '<div class="result-card-tag">// ' + esc(cat) + '</div>' +
          '<h3 class="result-card-name">' + esc(g.name) + '</h3>' +
          '<div class="result-card-meta">' + esc(g.area || '') + '</div>' +
          '<p class="result-card-desc">' + esc(desc) + '</p>' +
          '<div class="result-card-foot">' +
            '<span class="result-card-price">' + esc(g.priceRange || '—') + '</span>' +
            '<span class="result-card-arrow">View →</span>' +
          '</div>' +
        '</a>';
    }
    grid.innerHTML = html;
  }

  function run() {
    var results = window.GYMS.filter(matches);
    // Sort: featured first, then alphabetical
    results.sort(function (a, b) {
      if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1;
      return (a.name || '').localeCompare(b.name || '');
    });
    render(results);
  }

  function clearAll() {
    state.q = '';
    state.cat = 'all';
    state.area = 'all';
    state.price = 'all';
    state.openNow = false;
    var qEl = document.getElementById('q'); if (qEl) qEl.value = '';
    var areaEl = document.getElementById('area-filter'); if (areaEl) areaEl.value = 'all';
    var priceEl = document.getElementById('price-filter'); if (priceEl) priceEl.value = 'all';
    var openEl = document.getElementById('open-filter'); if (openEl) openEl.checked = false;
    document.querySelectorAll('.sf-pill').forEach(function (p) {
      p.classList.toggle('active', p.getAttribute('data-cat') === 'all');
    });
    run();
  }

  function init() {
    // Populate area dropdown
    var areaEl = document.getElementById('area-filter');
    if (areaEl && areaEl.children.length <= 1) {
      Object.keys(AREA_LABELS).forEach(function (slug) {
        var opt = document.createElement('option');
        opt.value = slug;
        opt.textContent = AREA_LABELS[slug];
        areaEl.appendChild(opt);
      });
    }

    // Bind events
    var qEl = document.getElementById('q');
    if (qEl) {
      qEl.addEventListener('input', function (e) {
        state.q = e.target.value.trim();
        run();
      });
    }
    var pills = document.querySelectorAll('.sf-pill');
    pills.forEach(function (p) {
      p.addEventListener('click', function () {
        state.cat = p.getAttribute('data-cat') || 'all';
        pills.forEach(function (other) { other.classList.remove('active'); });
        p.classList.add('active');
        run();
      });
    });
    if (areaEl) {
      areaEl.addEventListener('change', function (e) {
        state.area = e.target.value;
        run();
      });
    }
    var priceEl = document.getElementById('price-filter');
    if (priceEl) {
      priceEl.addEventListener('change', function (e) {
        state.price = e.target.value;
        run();
      });
    }
    var openEl = document.getElementById('open-filter');
    if (openEl) {
      openEl.addEventListener('change', function (e) {
        state.openNow = e.target.checked;
        run();
      });
    }

    // Read initial state from URL (?q=foo&cat=muay-thai)
    try {
      var sp = new URLSearchParams(window.location.search);
      if (sp.has('q')) {
        state.q = sp.get('q') || '';
        if (qEl) qEl.value = state.q;
      }
      if (sp.has('cat')) {
        state.cat = sp.get('cat');
        pills.forEach(function (p) {
          p.classList.toggle('active', p.getAttribute('data-cat') === state.cat);
        });
      }
    } catch (e) { /* SSR-safe */ }

    run();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }
})();
