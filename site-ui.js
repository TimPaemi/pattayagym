/* Shared UI: mobile nav, scroll progress, back-to-top, footer clock, venue hooks. */
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

  function bindMobileNav() {
    var burger = doc.querySelector('.nav-burger');
    var menu = doc.getElementById('nav-mobile');
    if (!burger || !menu) return;

    function openMenu() {
      menu.hidden = false;
      burger.setAttribute('aria-expanded', 'true');
      doc.body.classList.add('nav-open');
      var first = menu.querySelector('a');
      if (first) first.focus();
    }

    function closeMenu() {
      menu.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      doc.body.classList.remove('nav-open');
      burger.focus();
    }

    burger.addEventListener('click', function () {
      if (menu.hidden) openMenu();
      else closeMenu();
    });

    doc.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !menu.hidden) closeMenu();
    });

    menu.addEventListener('click', function (event) {
      if (event.target.tagName === 'A') closeMenu();
    });
  }

  function bindCtaMoreToggle() {
    doc.querySelectorAll('.venue-more-toggle, .home-more-toggle').forEach(function (btn) {
      var wrap = btn.closest('.venue-hero-ctas-wrap, .home-hero-ctas-wrap');
      if (!wrap) return;
      var fewer = btn.classList.contains('home-more-toggle') ? '− Fewer tools' : '− Fewer actions';
      var more = btn.classList.contains('home-more-toggle') ? '+ More tools' : '+ More actions';
      btn.addEventListener('click', function () {
        var open = wrap.classList.toggle('is-expanded');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.textContent = open ? fewer : more;
      });
    });
  }

  function bindScrollUi() {
    var navEl = doc.querySelector('.hero .nav') || doc.querySelector('.nav');
    var bar = doc.getElementById('pg-scroll-progress') || doc.querySelector('.progress-bar');
    var btn = doc.getElementById('pg-back-to-top') || doc.querySelector('.back-to-top');
    var tocLinks = Array.prototype.slice.call(
      doc.querySelectorAll('.jump-pill, .jump-nav-pills a')
    );
    var tocHeadings = tocLinks.map(function (link) {
      var id = link.getAttribute('href') ? link.getAttribute('href').slice(1) : '';
      return id ? doc.getElementById(id) : null;
    });

    if (btn) {
      btn.addEventListener('click', function () {
        var reduce = false;
        try {
          reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch (e) { /* ignore */ }
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
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
      var root = doc.documentElement;
      var range = root.scrollHeight - root.clientHeight;
      var scrolled = range > 0 ? root.scrollTop / range : 0;
      if (bar) bar.style.width = (Math.max(0, Math.min(1, scrolled)) * 100) + '%';
      if (btn) {
        var visible = root.scrollTop > 600;
        btn.classList.toggle('visible', visible);
        btn.classList.toggle('is-visible', visible);
      }
      if (navEl) navEl.classList.toggle('scrolled', root.scrollTop > 30);
      updateToc();
    }

    doc.addEventListener('scroll', update, { passive: true });
    update();
  }

  function bindFooterClock() {
    var el = doc.getElementById('pt-clock');
    if (!el) return;
    function tick() {
      var now = new Date();
      var ict = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (7 * 3600000));
      el.textContent = String(ict.getHours()).padStart(2, '0') + ':' + String(ict.getMinutes()).padStart(2, '0');
    }
    tick();
    setInterval(tick, 30000);
  }

  function init() {
    hydrateCurrentVenue();
    bindMediaFallback();
    bindDelegatedClicks();
    bindMobileNav();
    bindCtaMoreToggle();
    bindScrollUi();
    bindFooterClock();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
