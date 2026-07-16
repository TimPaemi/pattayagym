/**
 * Shared Pattaya Authority / TimPaemi network footer block (internal + external mesh).
 */

const fs = require('fs');
const path = require('path');

const SITE = 'https://pattaya-gym.com';
const ROOT = path.resolve(__dirname, '../..');

function guideCount() {
  const guidesDir = path.join(ROOT, 'guides');
  if (!fs.existsSync(guidesDir)) return 47;
  return fs.readdirSync(guidesDir, { withFileTypes: true })
    .filter(e => e.isDirectory() && fs.existsSync(path.join(guidesDir, e.name, 'index.html')))
    .length;
}

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
  { name: 'Pattaya After Dark', url: 'https://pattaya-afterdark.com/', desc: 'Nightlife tonight' },
  { name: 'Mr We Outside', url: 'https://mrweoutside.com/', desc: 'Outdoor community' },
  { name: 'TimPaemi', url: 'https://timpaemi.com/', desc: 'Founders · agency' },
];

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function paNetworkHtml(opts = {}) {
  // PA-NET bold block — single source: timpaemi/network/network.json
  return `<!--PA-NET:START-->
  <!-- [html-validate-disable-next element-permitted-content] -->
  <style>.pa-net{--pa-pink:#ff2f8e;--pa-cyan:#00e5ff;font-family:inherit;box-sizing:border-box;width:100%;margin:0;padding:3rem 1.25rem 1.5rem;border-top:1px solid rgba(127,127,127,.22);color:inherit;-webkit-font-smoothing:antialiased}
.pa-net *{box-sizing:border-box}
.pa-net a{color:inherit;text-decoration:none}
.pa-net__in{max-width:1180px;margin:0 auto}
.pa-net__grid{display:grid;grid-template-columns:1fr;gap:2rem;text-align:left}
.pa-net__brand-name{font-weight:800;font-size:1.35rem;letter-spacing:.02em}
.pa-net__brand-name .pk{color:var(--pa-pink)}
.pa-net__brand p{margin:.7rem 0 0;font-size:.85rem;opacity:.72;line-height:1.5;max-width:34ch}
.pa-net__founder{margin:.6rem 0 0;font-size:.8rem;opacity:.85;font-weight:600}
.pa-net__tag{font-size:.66rem;letter-spacing:.22em;text-transform:uppercase;color:var(--pa-cyan);margin:0 0 .9rem}
.pa-net__col a{display:block;padding:.32rem 0;font-size:.9rem;opacity:.85;transition:opacity .15s,color .15s}
.pa-net__col a:hover,.pa-net__col a:focus-visible{opacity:1;color:var(--pa-cyan)}
.pa-net__col a .pk{color:var(--pa-pink);font-weight:700}
.pa-net__col-direct a{text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px;text-decoration-color:rgba(127,127,127,.55)}
.pa-net__col-direct a:hover,.pa-net__col-direct a:focus-visible{color:var(--pa-cyan);text-decoration-color:var(--pa-cyan)}
.pa-net__property{text-align:center;margin:2.4rem 0 0;padding-top:1.6rem;border-top:1px solid rgba(127,127,127,.18)}
.pa-net__badge{display:inline-block;font-size:.62rem;letter-spacing:.24em;color:var(--pa-cyan);border:1px solid rgba(127,127,127,.3);border-radius:4px;padding:.35rem .8rem;margin-bottom:1rem}
.pa-net__bigname{font-weight:900;font-size:clamp(1.8rem,5vw,2.8rem);letter-spacing:.01em;line-height:1}
.pa-net__bigname .pk{color:var(--pa-pink)}.pa-net__bigname .cy{color:var(--pa-cyan)}
.pa-net__strap{margin:.7rem 0 0;font-weight:700;font-size:1rem}
.pa-net__strap .pk{color:var(--pa-pink)}.pa-net__strap .cy{color:var(--pa-cyan)}
.pa-net__sub{margin:.5rem 0 0;font-size:.64rem;letter-spacing:.2em;text-transform:uppercase;opacity:.6}
.pa-net__sub b{color:var(--pa-cyan)}
.pa-net__credit{margin:1rem 0 0;font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;opacity:.7;line-height:1.7}
.pa-net__credit a{font-weight:700;text-decoration:underline;text-underline-offset:2px}
.pa-net__credit a:hover{color:var(--pa-cyan)}
.pa-net__bottom{text-align:center;margin:1.4rem 0 0;font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;opacity:.55}
.pa-net__bottom a{color:inherit;text-decoration:underline;text-underline-offset:2px}
@media(min-width:760px){.pa-net__grid{grid-template-columns:1.4fr 1fr 1fr;gap:2.5rem}.pa-net__col-net{column-count:2;column-gap:1.5rem}}
.pa-net-lite{font-family:inherit;display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;justify-content:center;width:100%;margin:0;padding:1rem;border-top:1px solid rgba(127,127,127,.2);font-size:.82rem;opacity:.9;color:inherit;text-align:center}
.pa-net-lite a{color:inherit;font-weight:600;text-underline-offset:2px}</style>
  <section class="pa-net" aria-label="Publisher">
    <div class="pa-net__in">
      <div class="pa-net__property" style="margin-top:0;border-top:0;padding-top:0">
        <div class="pa-net__brand-name">Pattaya Gym<span class="pk">.</span></div>
        <p style="margin:.7rem auto 0;font-size:.85rem;opacity:.72;line-height:1.5;max-width:52ch">Written, photographed and kept up to date by the team at <a href="https://pattaya-authority.com/" target="_blank" rel="author noopener noreferrer" style="font-weight:700;text-decoration:underline;text-underline-offset:2px">Pattaya Authority</a>, a Pattaya-based publishing studio.</p>
      </div>
      <div class="pa-net__bottom">© 2026 TIMPAEMI Co., Ltd. · <a href="https://timpaemi.com/privacy/" target="_blank" rel="noopener noreferrer">Privacy</a> · <a href="mailto:info@timpaemi.com">Contact</a></div>
    </div>
  </section>
<!--PA-NET:END-->`;
}

/** Contextual in-page links to sister properties (internal site paths + network). */
function defaultSisterContextLinks() {
  const n = guideCount();
  return [
    { url: '/guides/', label: 'All Pattaya sport guides', desc: `${n} editorial trip planners` },
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
  guideCount,
};
