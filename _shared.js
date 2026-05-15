const NAV_ITEMS = [
  ['Muay Thai', '/category/muay-thai/'],
  ['Gyms', '/category/fitness/'],
  ['Golf', '/category/golf/'],
  ['Yoga', '/category/yoga/'],
  ['Guides', '/guides/'],
  ['Map', '/map/']
];

const SPORT_LINKS = [
  ['Muay Thai camps', '/category/muay-thai/'],
  ['Fitness gyms', '/category/fitness/'],
  ['Golf courses', '/category/golf/'],
  ['Yoga studios', '/category/yoga/'],
  ['Watersports & diving', '/category/watersports/'],
  ['Racquet sports', '/category/racquet/'],
  ['Swimming pools', '/category/swimming/'],
  ['Adventure', '/category/adventure/']
];

const AREA_LINKS = [
  ['Jomtien Beach', '/area/jomtien/'],
  ['Naklua / North Pattaya', '/area/naklua/'],
  ['Pratamnak Hill', '/area/pratamnak/'],
  ['Central Pattaya', '/area/central-pattaya/'],
  ['East Pattaya / Darkside', '/area/east-pattaya/'],
  ['Sattahip / Far South', '/area/sattahip/']
];

const GUIDE_LINKS = [
  ['Best Muay Thai gyms', '/guides/best-muay-thai-pattaya/'],
  ['Best dive operators', '/guides/best-dive-operators-pattaya/'],
  ['Best golf courses', '/guides/best-golf-courses-pattaya/'],
  ['Cheapest gyms', '/guides/cheapest-gyms-pattaya/'],
  ['Luxury sports clubs', '/guides/luxury-sports-clubs-pattaya/'],
  ['24-hour gyms', '/guides/24-hour-gyms-pattaya/'],
  ['Family-friendly', '/guides/family-friendly-pattaya/'],
  ['Best for beginners', '/guides/best-for-beginners-pattaya/']
];

const TOOL_LINKS = [
  ['Search venues', '/search/'],
  ['Saved favorites', '/favorites/'],
  ['Interactive map', '/map/'],
  ['Compare venues', '/compare/'],
  ['Plan my trip', '/plan-my-trip/'],
  ['Find my coach', '/find-my-coach/'],
  ['About this site', '/about/'],
  ['Research methodology', '/methodology/'],
  ['Contact', '/contact/'],
  ['Press', '/press/']
];

function brandHtml() {
  return '<a href="/" class="brand">PATTAYA<span class="dot">.</span>GYM</a>';
}

function marquee() {
  const chunk = [
    '<span class="star">★</span>',
    '<span>PATTAYA.GYM × THE PLUG FOR TRAINING</span>',
    '<span class="star">★</span>',
    '<span>158 VENUES · HAND-CHECKED · LIVE</span>',
    '<span class="star">★</span>',
    '<span>MUAY THAI · MMA · BOXING · GOLF · TENNIS · YOGA</span>'
  ].join('');
  return `<div class="marquee" aria-hidden="true"><div class="marquee-track">${chunk.repeat(8)}</div></div>`;
}

function bottomMarquee() {
  const chunk = [
    '<span>FIND YOUR GYM</span>',
    '<span class="star">★</span>',
    '<span>BOOK A SESSION</span>',
    '<span class="star">★</span>',
    '<span>TRAIN IN PATTAYA</span>',
    '<span class="star">★</span>'
  ].join('');
  return `<div class="marquee-bottom" aria-hidden="true"><div class="marquee-track">${chunk.repeat(8)}</div></div>`;
}

function header() {
  const navLinks = NAV_ITEMS
    .map(([label, href]) => `<li><a href="${href}">${label}</a></li>`)
    .join('');

  return `<a href="#main" class="skip-link">Skip to main content</a>
${marquee()}
<nav class="nav" role="navigation" aria-label="Primary navigation">
  <div class="nav-row">
    ${brandHtml()}
    <ul class="nav-links" id="nav-links">
      ${navLinks}
    </ul>
    <button type="button" class="nav-toggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="nav-links">☰</button>
    <a href="/search/" class="nav-cta">FIND A SPOT →</a>
  </div>
</nav>`;
}

function linkList(items) {
  return items.map(([label, href]) => `<li><a href="${href}">${label}</a></li>`).join('\n        ');
}

function footer({ lastBuildDate = '2026-05-15' } = {}) {
  return `
${bottomMarquee()}
<footer class="site-footer" role="contentinfo">
  <div class="site-footer-inner">
    <div class="sf-col sf-brand-col">
      <div class="sf-brand">${brandHtml()}</div>
      <p class="sf-tag">The most comprehensive directory of gyms, Muay Thai camps, and sport venues in Pattaya, Thailand.</p>
    </div>
    <div class="sf-col">
      <p class="sf-heading">Sport categories</p>
      <ul>
        ${linkList(SPORT_LINKS)}
      </ul>
    </div>
    <div class="sf-col">
      <p class="sf-heading">Areas of Pattaya</p>
      <ul>
        ${linkList(AREA_LINKS)}
      </ul>
    </div>
    <div class="sf-col">
      <p class="sf-heading">Best-of guides</p>
      <ul>
        ${linkList(GUIDE_LINKS)}
      </ul>
    </div>
    <div class="sf-col">
      <p class="sf-heading">Tools & site</p>
      <ul>
        ${linkList(TOOL_LINKS)}
        <li><a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a></li>
        <li><a href="https://api.whatsapp.com/send/?phone=66967286999&amp;text=Hi%21%20I%27m%20reaching%20out%20via%20pattaya-gym.com" target="_blank" rel="noopener">WhatsApp +66 96 728 6999</a></li>
        <li><a href="https://line.me/ti/p/~timpaemi" target="_blank" rel="noopener">LINE @timpaemi</a></li>
      </ul>
    </div>
  </div>
  <div class="site-footer-base">
    <p>© 2026 pattaya-gym.com — Every gym & sport in Pattaya, Thailand.</p>
    <p class="sf-disclaimer">Last updated: ${lastBuildDate}. Independent directory. No paid placements. Listings researched and source-cited from public information.</p>
    <p class="sf-builtby">// Site built &amp; managed by PATTAYA AUTHORITY · TIM PAEMI <span class="sf-builtby-star">★</span> ©2026</p>
  </div>
</footer>`;
}

module.exports = {
  bottomMarquee,
  brandHtml,
  footer,
  header,
  marquee
};
