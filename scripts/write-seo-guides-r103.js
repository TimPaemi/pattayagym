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
    kicker: 'Guide · Head term · ranked by area & trip type',
    readTime: '9 min read',
    title: 'Best Gyms in Pattaya (2026) — Ranked by Area | Pattaya.Gym',
    desc: 'The best gyms in Pattaya ranked by trip type and neighbourhood — commercial fitness, Muay Thai camps, budget picks, and luxury clubs. 157 venues hand-checked.',
    h1: 'Best gyms in <span class="accent-yellow">Pattaya.</span>',
    lede: 'The head-term guide: which Pattaya gym fits your trip — tourist day pass, Muay Thai camp, long-stay nomad, or luxury club. Ranked picks with links to every area guide and venue page.',
    body: require('./guide-bodies/best-gyms-in-pattaya'),
    sisterLinks: [
      { url: '/guides/best-muay-thai-pattaya/', label: 'Best Muay Thai', desc: 'Camp ranking by tier' },
      { url: '/guides/cheapest-gyms-pattaya/', label: 'Cheapest gyms', desc: 'Budget price table' },
      { url: '/guides/gym-day-pass-pattaya/', label: 'Day pass', desc: 'Drop-in without contract' },
      { url: '/search/', label: 'Search 157 venues', desc: 'Filter live' },
    ],
  },
  {
    slug: 'hotel-gym-pattaya',
    crumb: 'Hotel gym day pass',
    kicker: 'Guide · Resort fitness · visitor day passes',
    readTime: '7 min read',
    title: 'Hotel Gym Day Pass Pattaya — Resort Fitness for Visitors | Pattaya.Gym',
    desc: 'Which Pattaya hotel and resort gyms sell day passes to non-guests — Hilton, Centara, Marriott, Andaz and more. Pool, sauna, and gym access for tourists.',
    h1: 'Hotel gym <span class="accent-cyan">day pass.</span>',
    lede: 'Resort gyms versus commercial chains — when a hotel day pass beats Tony\'s Gym, which Pattaya hotels admit visitors, and what to ask before you pay.',
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
    crumb: 'Boxing & kickboxing',
    kicker: 'Guide · Western boxing · K1 · fight academies',
    readTime: '8 min read',
    title: 'Boxing & Kickboxing Gyms in Pattaya | Pattaya.Gym',
    desc: 'Western boxing and kickboxing in Pattaya — beyond Muay Thai. Fight academies, hybrid MMA gyms, and where to train hands-only or K1 rules.',
    h1: 'Boxing &amp; <span class="accent-pink">kickboxing.</span>',
    lede: 'Pattaya search results skew Muay Thai — this guide maps boxing, kickboxing, and hybrid fight gyms where you can train western striking without the clinch.',
    body: require('./guide-bodies/boxing-kickboxing-gym-pattaya'),
    sisterLinks: [
      { url: '/guides/best-muay-thai-pattaya/', label: 'Best Muay Thai', desc: 'When MT beats boxing' },
      { url: '/guides/bjj-mma-pattaya/', label: 'BJJ & MMA', desc: 'Hybrid fight gyms' },
      { url: '/guides/best-gym-central-pattaya/', label: 'Central Pattaya', desc: 'Pattaya Boxing World belt' },
      { url: '/compare/', label: 'Compare venues', desc: 'Side-by-side table' },
    ],
  },
];

for (const g of guides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
