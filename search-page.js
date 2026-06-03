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

  var PAGE_SIZE = 24;
  var visibleLimit = PAGE_SIZE;
  var lastResults = [];

  var state = {
    q: '',
    cat: 'all',
    area: 'all',
    price: 'all',
    openNow: false
  };

  // Round 21 (Codex P2-5): open-now test that honors weekday + seasonal text.
  function isOpenNow(hoursStr) {
    var h = (hoursStr || '').toLowerCase();
    if (!h) return false;
    if (/24\s*\/?\s*7|24\s*hour/.test(h)) return true;
    var now = new Date();
    var ict = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (7 * 3600000));
    var dow = ict.getDay();
    var month = ict.getMonth();
    var DAYS = ['sun','mon','tue','wed','thu','fri','sat'];
    var MON = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
    var sm = h.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*[-–]\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/);
    if (sm) {
      var ma = MON.indexOf(sm[1]), mb = MON.indexOf(sm[2]);
      if (ma >= 0 && mb >= 0) {
        var inSeason = ma <= mb ? (month >= ma && month <= mb) : (month >= ma || month <= mb);
        if (!inSeason) return false;
      }
    }
    if (!/\bdaily\b|every\s*day|everyday/.test(h)) {
      var tokens = h.match(/\b(mon|tue|wed|thu|fri|sat|sun)\b(?:\s*[-–]\s*\b(mon|tue|wed|thu|fri|sat|sun)\b)?/g);
      if (tokens && tokens.length) {
        var allowed = {};
        for (var t = 0; t < tokens.length; t++) {
          var rg = tokens[t].match(/(mon|tue|wed|thu|fri|sat|sun)(?:\s*[-–]\s*(mon|tue|wed|thu|fri|sat|sun))?/);
          var ds = DAYS.indexOf(rg[1]);
          if (rg[2]) {
            var de = DAYS.indexOf(rg[2]);
            for (var d = ds; ; d = (d + 1) % 7) { allowed[d] = true; if (d === de) break; }
          } else { allowed[ds] = true; }
        }
        if (!allowed[dow]) return false;
      }
    }
    var nowMin = ict.getHours() * 60 + ict.getMinutes();
    var windows = [];
    var re = /(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/g;
    var mm;
    while ((mm = re.exec(h))) windows.push([+mm[1] * 60 + +mm[2], +mm[3] * 60 + +mm[4]]);
    if (!windows.length) return false;
    for (var wi = 0; wi < windows.length; wi++) {
      var ws = windows[wi][0], we = windows[wi][1];
      if (we <= ws) { if (nowMin >= ws || nowMin < we) return true; }
      else if (nowMin >= ws && nowMin < we) return true;
    }
    return false;
  }

  function matches(g) {
    // Category
    if (state.cat !== 'all' && g.category !== state.cat) return false;
    // Area
    if (state.area !== 'all' && areaSlug(g.area) !== state.area) return false;
    // Price (exact match on ฿/฿฿/฿฿฿/฿฿฿฿)
    if (state.price !== 'all' && g.priceRange !== state.price) return false;
    // Open now - Round 21 (Codex P2-5): honors weekday + seasonal
    // constraints in addition to HH:MM windows.
    if (state.openNow && !isOpenNow(g.hours)) return false;
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

  function ensureLoadMoreMount() {
    var grid = document.getElementById('search-results');
    if (!grid) return null;
    var mount = document.getElementById('search-load-more');
    if (!mount) {
      mount = document.createElement('div');
      mount.id = 'search-load-more';
      mount.className = 'search-load-more-wrap';
      grid.parentNode.insertBefore(mount, grid.nextSibling);
    }
    return mount;
  }

  function render(results) {
    lastResults = results;
    var statsEl = document.getElementById('stats');
    var grid = document.getElementById('search-results');
    var moreMount = ensureLoadMoreMount();
    if (!grid) return;
    var n = results.length;
    var total = window.GYMS.length;
    var showing = Math.min(visibleLimit, n);
    if (statsEl) {
      if (n === 0) {
        statsEl.innerHTML = 'No venues match your filters';
      } else if (n === total && showing === n) {
        statsEl.innerHTML = '<strong>' + total + '</strong> venues · showing all';
      } else if (showing < n) {
        statsEl.innerHTML =
          'Showing <strong>' + showing + '</strong> of <strong>' + n + '</strong> matches (' + total + ' total)';
      } else {
        statsEl.innerHTML =
          '<strong>' + n + '</strong> of ' + total + ' venues match your filters';
      }
    }
    if (moreMount) moreMount.innerHTML = '';
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
    for (var i = 0; i < showing; i++) {
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
    if (moreMount && n > showing) {
      var remain = n - showing;
      moreMount.innerHTML =
        '<button type="button" class="btn btn-secondary" id="search-load-more-btn">Load more (' +
        remain + ' remaining)</button>';
      document.getElementById('search-load-more-btn').addEventListener('click', function () {
        visibleLimit += PAGE_SIZE;
        render(lastResults);
      });
    }
  }

  function track(name, params){ try { if (window.gtag) window.gtag('event', name, params || {}); } catch(e){} }
  var lastTrackedState = '';
  function run() {
    visibleLimit = PAGE_SIZE;
    var results = window.GYMS.filter(matches);
    results.sort(function (a, b) {
      if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1;
      return (a.name || '').localeCompare(b.name || '');
    });
    render(results);
    // Round 20 - GA4 filter_apply event (debounced via state-hash)
    var snap = JSON.stringify(state);
    if (snap !== lastTrackedState) {
      lastTrackedState = snap;
      track('filter_apply', {
        q: state.q || '', cat: state.cat, area: state.area,
        price: state.price, open_now: state.openNow ? 1 : 0,
        result_count: results.length
      });
    }
  }

  function clearAll() {
    visibleLimit = PAGE_SIZE;
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
