/**
 * site-footer.js — FOOTER-SPEC-2026: the canonical five-block footer.
 *
 * Block 1  Publisher (photo, site name, Tim & Paemi + timpaemi.com — the single brand link)
 * Block 2  Navigation — exactly four labelled columns, ≤5 links each
 * Block 3  Trust line — one static line, no ticker
 * Block 4  Contact — one email line
 * Block 5  Legal — one quiet line
 *
 * Used by build-v2.js, editorial-guide-shell.js, and apply-footer-spec.js.
 * Do not add columns, social icons, address blocks, or network credits here.
 */

function siteFooterHtml(venueN) {
  return `<footer class="footer" role="contentinfo"><!--FOOTER-SPEC-2026-->
  <div class="footer-wrap">
    <div class="footer-pub">
      <img class="footer-pub-photo" src="/authors/timpaemi.jpg" alt="Tim and Paemi" width="64" height="64" loading="lazy">
      <div class="footer-brand">pattaya<span class="accent">.gym</span></div>
      <p class="footer-pub-names">Written, photographed and kept up to date by Tim and Paemi, who live in Pattaya. <a href="https://timpaemi.com/" rel="author noopener">&rarr; timpaemi.com</a></p>
      <p class="footer-pub-scale">Every gym, ring and court in Pattaya &mdash; ${venueN} venues, hand-checked.</p>
    </div>
    <nav class="footer-nav" aria-label="Footer">
      <div class="footer-col">
        <div class="footer-col-h">// Explore</div>
        <ul>
          <li><a href="/category/muay-thai/">Muay Thai</a></li>
          <li><a href="/category/fitness/">Fitness</a></li>
          <li><a href="/category/golf/">Golf</a></li>
          <li><a href="/category/yoga/">Yoga</a></li>
          <li><a href="/guides/">Guides</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <div class="footer-col-h">// Tools</div>
        <ul>
          <li><a href="/search/">Search</a></li>
          <li><a href="/compare/">Compare</a></li>
          <li><a href="/plan-my-trip/">Plan trip</a></li>
          <li><a href="/map/">Map</a></li>
          <li><a href="/favorites/">Favorites</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <div class="footer-col-h">// About</div>
        <ul>
          <li><a href="/about/">About us</a></li>
          <li><a href="/colophon/">How we work</a></li>
          <li><a href="/methodology/">Methodology</a></li>
          <li><a href="/press/">Press</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <div class="footer-col-h">// Legal</div>
        <ul>
          <li><a href="/privacy/">Privacy</a></li>
          <li><a href="/terms/">Terms</a></li>
          <li><a href="/contact/">Contact</a></li>
        </ul>
      </div>
    </nav>
    <p class="footer-trust">${venueN} venues &middot; Hand-checked &middot; No paid placements &middot; Updated rolling</p>
    <p class="footer-contact"><a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a></p>
    <p class="footer-legal">&copy; 2026 TimPaemi Co., Ltd. &middot; <a href="/privacy/">Privacy</a> &middot; <a href="/terms/">Terms</a></p>
  </div>
</footer>`;
}

module.exports = { siteFooterHtml };
