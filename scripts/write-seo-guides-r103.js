#!/usr/bin/env node
/**
 * Round 103 — SEO keyword gap guides:
 *   /guides/best-gyms-in-pattaya/
 *   /guides/hotel-gym-pattaya/
 *   /guides/boxing-kickboxing-gym-pattaya/
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const guides = [
  {
    slug: 'best-gyms-in-pattaya',
    crumb: 'Best gyms in Pattaya',
    kicker: 'Guide · Fitness · current prices · access',
    readTime: '11 min read',
    title: 'Best Gyms in Pattaya (2026) — Prices and Access | Pattaya.Gym',
    desc: 'Compare Pattaya gyms by current day and monthly prices, area, staffed access, 24-hour terms, training style and length of stay.',
    h1: 'Best gyms in <span class="accent-yellow">Pattaya.</span>',
    lede: 'Choose by access product, area and length of stay. This evidence-led shortlist separates ordinary gym entry, 24-hour member access, coached combat and multi-sport club days.',
    body: require('./guide-bodies/best-gyms-in-pattaya'),
    sisterLinks: [
      { url: '/guides/best-muay-thai-pattaya/', label: 'Best Muay Thai', desc: 'Camp ranking by tier' },
      { url: '/guides/cheapest-gyms-pattaya/', label: 'Cheapest gyms', desc: 'Budget price table' },
      { url: '/guides/gym-day-pass-pattaya/', label: 'Day pass', desc: 'Drop-in without contract' },
      { url: '/search/', label: 'Search records', desc: 'Filter by sport and area' },
    ],
  },
  {
    slug: 'hotel-gym-pattaya',
    crumb: 'Hotel gym access',
    kicker: 'Guide · Guest amenities · public passes · current evidence',
    readTime: '12 min read',
    title: 'Pattaya hotel gyms and public day passes | current guide',
    desc: 'Separate Pattaya hotel-guest gyms from public club and leisure-pool day passes, with current prices, access limits and booking questions.',
    h1: 'Pattaya hotel <span class="accent-cyan">gym access.</span>',
    lede: 'A hotel fitness listing proves an amenity, not a public pass. Compare guest-only gyms, one verified outside-guest club day and two pool-only products without inventing access.',
    body: require('./guide-bodies/hotel-gym-pattaya'),
    sisterLinks: [
      { url: '/guides/best-gyms-in-pattaya/', label: 'Best gyms', desc: 'Head-term ranked picks' },
      { url: '/guides/luxury-sports-clubs-pattaya/', label: 'Luxury clubs', desc: 'Fitz Club & resort tier' },
      { url: '/guides/swimming-pools-pattaya/', label: 'Swimming pools', desc: 'Pool-only day passes' },
      { url: '/category/fitness/', label: 'All fitness venues', desc: '157-directory filter' },
    ],
  },
  {
    slug: 'boxing-kickboxing-gym-pattaya',
    crumb: 'Boxing and kickboxing',
    kicker: 'Guide · Western boxing · kickboxing · current evidence',
    readTime: '16 min read',
    title: 'Boxing and kickboxing gyms in Pattaya | current guide',
    desc: 'Compare Pattaya boxing and kickboxing options by verified discipline, current class times, dated prices, facilities and residential or contact-first access.',
    h1: 'Boxing &amp; <span class="accent-pink">kickboxing.</span>',
    lede: 'Choose the exact striking product first. This guide separates combined boxing and Muay Thai classes, multi-discipline camps, fitness kickboxing, residential western boxing and an unverified former stadium.',
    body: require('./guide-bodies/boxing-kickboxing-gym-pattaya'),
    sisterLinks: [
      { url: '/guides/best-muay-thai-pattaya/', label: 'Best Muay Thai', desc: 'Current camp and price comparison' },
      { url: '/guides/bjj-mma-pattaya/', label: 'BJJ and MMA', desc: 'Grappling and hybrid fight gyms' },
      { url: '/area/central-pattaya/', label: 'Central Pattaya', desc: 'Compare access models by area' },
      { url: '/compare/', label: 'Compare venues', desc: 'Filter the directory' },
    ],
  },
];

const onlyArg = process.argv.find(arg => arg.startsWith('--guide-only='));
const onlySlug = onlyArg ? onlyArg.slice('--guide-only='.length) : '';
const selectedGuides = onlySlug ? guides.filter(g => g.slug === onlySlug) : guides;
if (onlySlug && selectedGuides.length === 0) {
  throw new Error(`Unknown --guide-only slug: ${onlySlug}`);
}

for (const g of selectedGuides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
