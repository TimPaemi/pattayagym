/* Shared non-rendering UI hooks for CSP-safe pages. */
(function () {
  'use strict';

  var doc = document;

  function hydrateCurrentVenue() {
    if (window.PG_CURRENT_VENUE) return;
    var el = doc.getElementById('pg-current-venue');
    if (!el) return;
    try {
      window.PG_CURRENT_VENUE = JSON.parse(el.textContent || '{}');
    } catch (err) {
      window.PG_CURRENT_VENUE = null;
    }
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }

  function bindMediaFallback() {
    doc.addEventListener('error', function (event) {
      var img = event.target;
      if (!img || img.tagName !== 'IMG' || !img.hasAttribute('data-fallback-hide')) return;
      if (img.getAttribute('data-fallback-hide') === 'parent' && img.parentElement) {
        img.parentElement.hidden = true;
      } else {
        img.hidden = true;
      }
    }, true);
  }

  function bindDelegatedClicks() {
    doc.addEventListener('click', function (event) {
      var toggle = event.target.closest && event.target.closest('.nav-toggle');
      if (toggle) {
        var controls = toggle.getAttribute('aria-controls');
        var nav = controls ? doc.getElementById(controls) : null;
        nav = nav || doc.querySelector('.nav-links');
        if (nav) {
          nav.classList.toggle('open');
          toggle.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
        }
      }

      var share = event.target.closest && event.target.closest('[data-share-target]');
      if (share) {
        event.preventDefault();
        if (window.PG && typeof window.PG.share === 'function') {
          window.PG.share(share.getAttribute('data-share-target'));
        }
      }

      var clearFavorites = event.target.closest && event.target.closest('[data-clear-favorites]');
      if (clearFavorites) {
        event.preventDefault();
        if (window.PG && window.PG.favorites && typeof window.PG.favorites.clear === 'function') {
          window.PG.favorites.clear();
        }
      }
    });
  }

  function initVenueUi() {
    hydrateCurrentVenue();

    var navEl = doc.querySelector('.hero .nav');
    var bar = doc.getElementById('pg-scroll-progress');
    var btn = doc.getElementById('pg-back-to-top');
    var tocLinks = Array.prototype.slice.call(doc.querySelectorAll('.jump-pill'));
    var tocHeadings = tocLinks.map(function (link) {
      var id = link.getAttribute('href') ? link.getAttribute('href').slice(1) : '';
      return id ? doc.getElementById(id) : null;
    });

    if (btn) {
      btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    function updateToc() {
      if (!tocLinks.length) return;
      var activeIndex = 0;
      for (var i = 0; i < tocHeadings.length; i++) {
        if (tocHeadings[i] && tocHeadings[i].getBoundingClientRect().top <= 150) activeIndex = i;
      }
      tocLinks.forEach(function (link, index) {
        link.classList.toggle('is-active', index === activeIndex);
      });
    }

    function update() {
      var h = doc.documentElement;
      var range = h.scrollHeight - h.clientHeight;
      var scrolled = range > 0 ? h.scrollTop / range : 0;
      if (bar) bar.style.width = (Math.max(0, Math.min(1, scrolled)) * 100) + '%';
      if (btn) btn.classList.toggle('visible', h.scrollTop > 600);
      if (navEl) navEl.classList.toggle('scrolled', h.scrollTop > 30);
      updateToc();
    }

    doc.addEventListener('scroll', update, { passive: true });
    update();
  }

  hydrateCurrentVenue();
  registerServiceWorker();
  bindMediaFallback();
  bindDelegatedClicks();

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', initVenueUi);
  } else {
    initVenueUi();
  }
})();
