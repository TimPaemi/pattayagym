/**
 * Canonical V2 header + mobile menu (keep in sync with build-v2.js nav).
 */
function v2NavHtml() {
  return `<header class="nav" role="banner">
  <div class="nav-row">
    <a href="/" class="brand">pattaya<span class="dot">.</span>gym</a>
    <nav class="nav-links" aria-label="Primary">
      <a href="/category/muay-thai/">Muay Thai</a>
      <a href="/category/fitness/">Fitness</a>
      <a href="/category/golf/">Golf</a>
      <a href="/category/yoga/">Yoga</a>
      <a href="/sports/">All sports</a>
      <a href="/guides/">Guides</a>
      <a href="/compare/" class="nav-tools-link">Compare</a>
      <a href="/plan-my-trip/" class="nav-tools-link">Plan</a>
    </nav>
    <button type="button" class="nav-burger" aria-label="Open menu" aria-expanded="false" aria-controls="nav-mobile"><span class="nav-burger-bar"></span><span class="nav-burger-bar"></span><span class="nav-burger-bar"></span></button>
    <a href="/search/" class="nav-cta">★ Find a gym</a>
  </div>
</header>
<nav class="nav-mobile" id="nav-mobile" hidden aria-label="Mobile menu">
  <a href="/" class="nav-mobile-link">Home</a>
  <a href="/category/muay-thai/" class="nav-mobile-link">Muay Thai</a>
  <a href="/category/fitness/" class="nav-mobile-link">Fitness</a>
  <a href="/category/golf/" class="nav-mobile-link">Golf</a>
  <a href="/sports/" class="nav-mobile-link">All sports</a>
  <a href="/guides/" class="nav-mobile-link">Guides</a>
  <a href="/plan-my-trip/" class="nav-mobile-link">Plan my trip</a>
  <a href="/compare/" class="nav-mobile-link">Compare</a>
  <a href="/favorites/" class="nav-mobile-link">Favorites</a>
  <a href="/search/" class="nav-mobile-link">Search</a>
  <a href="/about/" class="nav-mobile-link">About</a>
  <a href="/methodology/" class="nav-mobile-link">Methodology</a>
  <a href="/changelog/" class="nav-mobile-link">Changelog</a>
  <a href="/search/" class="nav-mobile-cta">★ Find a gym</a>
</nav>`;
}

module.exports = { v2NavHtml };
