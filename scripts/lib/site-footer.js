/**
 * site-footer.js — FOOTER-SPEC-2026-V2: the canonical simple footer.
 *
 * Rebuilt July 2026 to match the Pattaya Insider footer shape, because the
 * network carries no cross-site links and shared visual language is therefore
 * the only mechanism left for signalling one publisher.
 *
 * SHAPE (left / right, then one legal bar):
 *   Left   brand mark + wordmark, one-sentence description, publisher credit,
 *          four @timpaemi social buttons
 *   Right  exactly four labelled columns, 5 links each
 *   Base   copyright + made-in line, and Privacy / Terms / Sitemap
 *   Note   one small-print line
 *
 * DELIBERATELY REMOVED from the previous five-block footer:
 *   - the founder photo (Insider has none; it made the footer top-heavy)
 *   - the "// Explore" slash prefixes on column headings
 *   - the standalone trust ticker line
 *   - the duplicate email line (Contact now lives in the Company column,
 *     which is where people actually look for it)
 *
 * DO NOT add columns, an address block, cross-site network credits, or a fifth
 * social platform. The timpaemi.com link is the author identity and the single
 * permitted cross-domain link.
 *
 * Used by build-v2.js, editorial-guide-shell.js, and apply-design-2026.js.
 */

const SOCIAL_ICONS = {
  youtube: '<path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.6V8.4l6.3 3.6-6.3 3.6z"/>',
  instagram: '<path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.3 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .3-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.3-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.3 2.2-.4 1.3-.1 1.7-.1 4.9-.1zm0 3.1a6.7 6.7 0 1 0 0 13.4 6.7 6.7 0 0 0 0-13.4zm0 11a4.3 4.3 0 1 1 0-8.6 4.3 4.3 0 0 1 0 8.6zm8.5-11.3a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0z"/>',
  tiktok: '<path d="M21 8.3a5.8 5.8 0 0 1-3.4-1.1v6.9a5.9 5.9 0 1 1-5.9-5.9c.3 0 .6 0 .9.1v3a2.9 2.9 0 1 0 2 2.8V1.6h2.9A3.4 3.4 0 0 0 21 5v3.3z"/>',
  facebook: '<path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"/>'
};

const SOCIAL = [
  { name: 'youtube', href: 'https://www.youtube.com/@timpaemi', label: 'YouTube' },
  { name: 'instagram', href: 'https://www.instagram.com/timpaemi/', label: 'Instagram' },
  { name: 'tiktok', href: 'https://www.tiktok.com/@timpaemi.com', label: 'TikTok' },
  { name: 'facebook', href: 'https://www.facebook.com/timpaemi', label: 'Facebook' }
];

const COLUMNS = [
  { title: 'Explore', links: [
    { label: 'Muay Thai', href: '/category/muay-thai/' },
    { label: 'Fitness', href: '/category/fitness/' },
    { label: 'Golf', href: '/category/golf/' },
    { label: 'Yoga', href: '/category/yoga/' },
    { label: 'All sports', href: '/sports/' }
  ]},
  { title: 'Plan', links: [
    { label: 'Plan your trip', href: '/plan-my-trip/' },
    { label: 'Compare venues', href: '/compare/' },
    { label: 'Find a coach', href: '/find-my-coach/' },
    { label: 'Map', href: '/map/' },
    { label: 'Favorites', href: '/favorites/' }
  ]},
  { title: 'Browse', links: [
    { label: 'Guides', href: '/guides/' },
    { label: 'Search', href: '/search/' },
    { label: 'Sport stats', href: '/pattaya-sport-stats/' },
    { label: 'Add your gym', href: '/add-your-gym/' },
    { label: 'Changelog', href: '/changelog/' }
  ]},
  { title: 'Company', links: [
    { label: 'About us', href: '/about/' },
    { label: 'How we work', href: '/colophon/' },
    { label: 'Methodology', href: '/methodology/' },
    { label: 'Press', href: '/press/' },
    { label: 'Contact', href: '/contact/' }
  ]}
];

function socialHtml() {
  return SOCIAL.map(s =>
    `<a href="${s.href}" class="footer-social-btn" target="_blank" rel="me noopener" aria-label="${s.label}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${SOCIAL_ICONS[s.name]}</svg></a>`
  ).join('');
}

function columnsHtml() {
  return COLUMNS.map(col =>
    `      <div class="footer-col">
        <h2 class="footer-col-h">${col.title}</h2>
        <ul>
${col.links.map(l => `          <li><a href="${l.href}">${l.label}</a></li>`).join('\n')}
        </ul>
      </div>`
  ).join('\n');
}

function siteFooterHtml(venueN) {
  const year = new Date().getFullYear();
  return `<footer class="footer" role="contentinfo"><!--FOOTER-SPEC-2026-V2-->
  <div class="footer-wrap">
    <div class="footer-top">
      <div>
        <a href="/" class="footer-brand" aria-label="Pattaya.Gym — home"><span class="footer-mark" aria-hidden="true"></span><span>pattaya<span class="accent">.gym</span></span></a>
        <p class="footer-desc">Every gym, ring and court in Pattaya &mdash; ${venueN} venues across 15 sports, checked in person by people who live here.</p>
        <p class="footer-desc">Written and kept up to date by <strong>Tim &amp; Paemi</strong>. <a href="https://timpaemi.com/" rel="author noopener" class="footer-pub-link">timpaemi.com</a></p>
        <div class="footer-social">${socialHtml()}</div>
      </div>
      <nav class="footer-nav" aria-label="Footer">
${columnsHtml()}
      </nav>
    </div>
    <div class="footer-base">
      <p>&copy; ${year} TimPaemi Co., Ltd. &middot; Made in Pattaya, Thailand</p>
      <p class="footer-legal"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/sitemap.xml">Sitemap</a></p>
    </div>
    <p class="footer-note">Listings are free and we take no payment for placement or ranking. Every venue is checked in person and re-checked on a rolling basis.</p>
  </div>
</footer>`;
}

module.exports = { siteFooterHtml };
