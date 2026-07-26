/**
 * v2-nav.js — canonical header + mobile drawer (NAV-SPEC-2026-V2).
 *
 * Rebuilt July 2026. The old header was a dark two-row bar with a starred neon
 * CTA and eight equally-weighted links. This one is a single 60px row on white
 * with a hairline rule: brand, links, one volt "Find a gym" pill.
 *
 * Yoga and Favorites are intentionally not in the desktop row — they are in the
 * drawer and the footer. Seven links is what fits at 1040px without wrapping,
 * and a header that wraps reads as broken.
 *
 * Keep in sync with build-v2.js nav() and apply-design-2026.js.
 */
function v2NavHtml() {
  return `<header class="nav" role="banner"><!--NAV-SPEC-2026-V2-->
  <div class="nav-row">
    <a href="/" class="brand" aria-label="Pattaya.Gym — home">pattaya<span class="dot">.</span>gym</a>
    <nav class="nav-links" aria-label="Primary">
      <a href="/category/muay-thai/">Muay Thai</a>
      <a href="/category/fitness/">Fitness</a>
      <a href="/category/golf/">Golf</a>
      <a href="/sports/">All sports</a>
      <a href="/guides/">Guides</a>
      <a href="/compare/" class="nav-tools-link">Compare</a>
      <a href="/plan-my-trip/" class="nav-tools-link">Plan</a>
    </nav>
    <a href="/search/" class="nav-cta">Find a gym</a>
    <button type="button" class="nav-burger" aria-label="Open menu" aria-expanded="false" aria-controls="nav-mobile"><span class="nav-burger-bar"></span><span class="nav-burger-bar"></span><span class="nav-burger-bar"></span></button>
  </div>
</header>
<nav class="nav-mobile" id="nav-mobile" hidden aria-label="Mobile menu">
  <a href="/" class="nav-mobile-link">Home</a>
  <a href="/category/muay-thai/" class="nav-mobile-link">Muay Thai</a>
  <a href="/category/fitness/" class="nav-mobile-link">Fitness</a>
  <a href="/category/golf/" class="nav-mobile-link">Golf</a>
  <a href="/category/yoga/" class="nav-mobile-link">Yoga</a>
  <a href="/sports/" class="nav-mobile-link">All sports</a>
  <a href="/guides/" class="nav-mobile-link">Guides</a>
  <a href="/plan-my-trip/" class="nav-mobile-link">Plan my trip</a>
  <a href="/compare/" class="nav-mobile-link">Compare</a>
  <a href="/favorites/" class="nav-mobile-link">Favorites</a>
  <a href="/search/" class="nav-mobile-link">Search</a>
  <a href="/about/" class="nav-mobile-link">About</a>
  <a href="/methodology/" class="nav-mobile-link">Methodology</a>
  <a href="/changelog/" class="nav-mobile-link">Changelog</a>
  <a href="/search/" class="nav-mobile-cta">Find a gym</a>
</nav>`;
}

module.exports = { v2NavHtml };
