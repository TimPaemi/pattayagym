/**
 * Consent-first analytics for Pattaya.Gym.
 * The Google tag is not requested until the visitor explicitly opts in.
 */
(function () {
  'use strict';

  var KEY = 'pg_analytics_consent_v1';
  var GA_ID = 'G-F5F6KD3XFZ';
  var loaded = false;

  function privacySignal() {
    return navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1';
  }

  function readChoice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function writeChoice(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* storage can be disabled */ }
  }

  function expireAnalyticsCookies() {
    var names = document.cookie.split(';').map(function (part) { return part.split('=')[0].trim(); });
    names.filter(function (name) { return name === '_ga' || name.indexOf('_ga_') === 0; })
      .forEach(function (name) {
        document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax';
        document.cookie = name + '=; Max-Age=0; path=/; domain=.' + location.hostname + '; SameSite=Lax';
      });
  }

  function loadAnalytics() {
    if (loaded || privacySignal()) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    var tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    tag.referrerPolicy = 'strict-origin-when-cross-origin';
    document.head.appendChild(tag);
  }

  function removeControls() {
    var old = document.getElementById('privacy-consent');
    if (old) old.remove();
  }

  function decide(value) {
    writeChoice(value);
    removeControls();
    if (value === 'granted' && !privacySignal()) loadAnalytics();
    else expireAnalyticsCookies();
    document.dispatchEvent(new CustomEvent('pg:privacy-choice', { detail: { analytics: value } }));
  }

  function renderControls(force) {
    removeControls();
    var choice = readChoice();
    if (!force && (choice === 'granted' || choice === 'denied' || privacySignal())) return;

    var region = document.createElement('section');
    region.id = 'privacy-consent';
    region.className = 'privacy-consent';
    region.setAttribute('aria-label', 'Privacy choices');
    region.innerHTML =
      '<div class="privacy-consent-copy">' +
        '<strong>Privacy, without the fog.</strong>' +
        '<span>The directory works without analytics. Allow anonymous usage measurement, or continue with none.</span>' +
        '<a href="/privacy/">Read the policy</a>' +
      '</div>' +
      '<div class="privacy-consent-actions">' +
        '<button type="button" class="btn btn-ghost" data-consent="denied">No analytics</button>' +
        '<button type="button" class="btn btn-primary" data-consent="granted">Allow analytics</button>' +
      '</div>';
    region.addEventListener('click', function (event) {
      var button = event.target.closest('[data-consent]');
      if (button) decide(button.getAttribute('data-consent'));
    });
    document.body.appendChild(region);
    var first = region.querySelector('button');
    if (force && first) first.focus();
  }

  function addPreferencesButton() {
    if (document.getElementById('privacy-choices-button')) return;
    var button = document.createElement('button');
    button.id = 'privacy-choices-button';
    button.className = 'privacy-choices-button';
    button.type = 'button';
    button.textContent = 'Privacy choices';
    button.addEventListener('click', function () { renderControls(true); });
    document.body.appendChild(button);
  }

  function init() {
    addPreferencesButton();
    var choice = readChoice();
    if (privacySignal()) {
      writeChoice('denied');
      expireAnalyticsCookies();
      return;
    }
    if (choice === 'granted') loadAnalytics();
    else if (choice !== 'denied') renderControls(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
