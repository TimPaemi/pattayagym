/**
 * Shared Pattaya Authority / TimPaemi network footer block (internal + external mesh).
 */

const SITE = 'https://pattaya-gym.com';

const NETWORK_SITES = [
  { name: 'Pattaya Authority', url: 'https://pattaya-authority.com/work/pattaya-gym-directory/', desc: 'Network hub' },
  { name: 'Restaurant Guide', url: 'https://pattaya-restaurant-guide.com/', desc: 'Eat after training' },
  { name: 'Visa Help', url: 'https://pattayavisahelp.com/', desc: 'Long-stay visas' },
  { name: 'Medical', url: 'https://pattaya-medical.com/', desc: 'Clinics & injury' },
  { name: 'School Guide', url: 'https://pattaya-school-guide.com/', desc: 'Families' },
  { name: 'Coffee', url: 'https://pattaya-coffee.com/', desc: 'Remote work' },
  { name: 'Personal Trainer', url: 'https://pattayapersonaltrainer.com/', desc: '1-on-1 coaching' },
  { name: 'Pattaya Villa', url: 'https://pattayavilla.com/', desc: 'Long-stay stays' },
  { name: 'Vehicle Rentals', url: 'https://pattaya-vehicle-rentals.com/', desc: 'Scooters & cars' },
  { name: 'PattayaPets', url: 'https://pattayapets.com/', desc: 'Vets & pet life' },
  { name: 'Mr We Outside', url: 'https://mrweoutside.com/', desc: 'Outdoor community' },
  { name: 'TimPaemi', url: 'https://timpaemi.com/', desc: 'Founders · agency' },
];

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function paNetworkHtml(opts = {}) {
  const hereOnGym = opts.hereOnGym !== false;
  const badgeUrl = opts.badgeUrl || 'https://pattaya-authority.com/';
  const cards = NETWORK_SITES.map((s) =>
    `<a href="${s.url}" class="pa-network-card" target="_blank" rel="noopener noreferrer"><span class="pa-network-card-name">${esc(s.name)}</span><span class="pa-network-card-desc">${esc(s.desc)}</span></a>`
  ).join('\n    ');
  const gymCard = hereOnGym
    ? `\n    <a href="${SITE}/guides/" class="pa-network-card pa-network-card-here"><span class="pa-network-card-name">Pattaya.Gym</span><span class="pa-network-card-desc">You are here</span></a>`
    : '';
  return `<section class="pa-network">
  <a href="${badgeUrl}" target="_blank" rel="noopener noreferrer" class="u-plain-link">
    <div class="pa-network-badge">★ A Pattaya Authority property ★</div>
  </a>
  <h2 class="pa-network-h">Pattaya <span class="accent">Authority.</span></h2>
  <p class="pa-network-sub">// Independent Pattaya guides · TimPaemi network</p>
  <nav class="pa-network-grid" aria-label="Pattaya Authority network">
    ${cards}
    ${gymCard}
  </nav>
</section>`;
}

/** Contextual in-page links to sister properties (internal site paths + network). */
function defaultSisterContextLinks() {
  return [
    { url: '/guides/', label: 'All Pattaya sport guides', desc: '44 editorial trip planners' },
    { url: '/compare/', label: 'Compare venues', desc: 'Side-by-side directory tool' },
    { url: '/plan-my-trip/', label: 'Plan my trip', desc: 'Build a shortlist by sport' },
    { url: '/favorites/', label: 'Favorites', desc: 'Your saved venue shortlist' },
    { url: '/search/', label: 'Search', desc: 'Filter all venues live' },
    { url: 'https://pattaya-restaurant-guide.com/', label: 'Restaurant Guide', desc: 'Eat after training', external: true },
    { url: 'https://pattayavisahelp.com/', label: 'Visa Help', desc: 'Long-stay and ED visas', external: true },
    { url: 'https://pattaya-medical.com/', label: 'Medical directory', desc: 'Clinics and rehab', external: true },
    { url: 'https://pattayapersonaltrainer.com/', label: 'Personal trainers', desc: '1-on-1 coaching', external: true },
  ];
}

function sisterContextHtml(links) {
  const items = (links || defaultSisterContextLinks()).map((l) => {
    const ext = l.external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<li><a href="${l.url}"${ext}>${esc(l.label)}</a> — ${esc(l.desc)}</li>`;
  }).join('\n        ');
  return `
<section class="section sister-context u-pt-0" id="sister-context-r84" aria-labelledby="sister-context-r84-h">
  <div class="wrap u-max-760">
    <div class="eyebrow"><span class="num">★</span> Pattaya network</div>
    <h2 id="sister-context-r84-h" class="h-section">Go <span class="accent-cyan">deeper.</span></h2>
    <ul class="venue-guide-link-list">
        ${items}
    </ul>
  </div>
</section>`;
}

module.exports = {
  SITE,
  NETWORK_SITES,
  paNetworkHtml,
  sisterContextHtml,
  defaultSisterContextLinks,
};
