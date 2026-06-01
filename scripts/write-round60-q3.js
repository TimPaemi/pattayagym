#!/usr/bin/env node
/**
 * write-round60-q3.js — Tier C editorial rewrites (6 remaining guides).
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const guides = [
  {
    slug: 'tennis-badminton-pattaya',
    crumb: 'Tennis & badminton',
    kicker: 'Guide · Tennis · badminton · Fitz Club · Greta · Inter Club',
    readTime: '12 min read',
    title: 'Tennis & badminton in Pattaya | Courts, clubs, booking | Pattaya.Gym',
    desc: 'Where to play tennis and badminton in Pattaya — Fitz Club Royal Cliff, Pattaya Tennis Club, Greta covered courts, Euro Badminton, hotel courts, pricing bands, and how racquet sport differs from padel.',
    h1: 'Tennis & <span class="accent-cyan">badminton.</span>',
    lede: 'Pattaya runs floodlit hard courts on Pratamnak, six covered ITF courts south at Greta, budget badminton halls on the Darkside, and seven tennis courts at Fitz Club inside Royal Cliff. Padel and pickleball have their own guide — this page is tennis and badminton only, sourced from our venue files.',
    body: require('./guide-bodies/tennis-badminton-pattaya'),
    sisterLinks: [
      { url: '/guides/padel-pickleball-pattaya/', label: 'Padel & pickleball', desc: 'Dedicated padel courts' },
      { url: '/guides/luxury-sports-clubs-pattaya/', label: 'Luxury sports clubs', desc: 'Fitz Club and resort tier' },
      { url: '/guides/best-gym-naklua-pratamnak-pattaya/', label: 'Pratamnak gyms', desc: 'Hilltop training belt' },
    ],
  },
  {
    slug: 'equestrian-pattaya',
    crumb: 'Equestrian',
    kicker: 'Guide · Horse riding · polo · Horseshoe Point · Thai Polo Club',
    readTime: '12 min read',
    title: 'Equestrian & polo in Pattaya | Horseshoe Point, Thai Polo Club | Pattaya.Gym',
    desc: 'Where to ride horses and play polo near Pattaya — Horseshoe Point 1,500-acre riding school at Mabprachan and Thai Polo Club 250-hectare fields, booking, safety, and pairing with golf or Muay Thai.',
    h1: 'Equestrian & <span class="accent-cyan">polo.</span>',
    lede: 'Pattaya equestrian means two world-scale venues — Horseshoe Point\'s International Riding School since 1999 and Thai Polo Club\'s tournament fields north of Mabprachan. This guide maps both from venue research: who each suits, what to book ahead, and how a horse day fits a wider sport holiday.',
    body: require('./guide-bodies/equestrian-pattaya'),
    sisterLinks: [
      { url: '/guides/luxury-sports-clubs-pattaya/', label: 'Luxury sports clubs', desc: 'Resort sport tier' },
      { url: '/guides/best-golf-courses-pattaya/', label: 'Best golf courses', desc: 'Championship Pattaya golf' },
      { url: '/guides/kids-youth-sport-pattaya/', label: 'Kids & youth sport', desc: 'FAST PRO at Horseshoe' },
    ],
  },
  {
    slug: 'kids-youth-sport-pattaya',
    crumb: 'Kids & youth',
    kicker: 'Guide · Football · trampoline · kids Muay Thai · Harbor Mall',
    readTime: '12 min read',
    title: 'Kids & youth sport in Pattaya | Football, trampoline, MT for kids | Pattaya.Gym',
    desc: 'Where kids play sport in Pattaya — AF Academy football from age 3, FAST PRO UEFA coaching, Rusich Club, BOUNCE and JumpZ at Harbor Mall, and Muay Thai kids programmes at major camps.',
    h1: 'Kids & youth <span class="accent-cyan">sport.</span>',
    lede: 'Pattaya kids sport means football academies from age 3, trampoline parks stacked at Harbor Mall, and Muay Thai programmes at major camps — nine dedicated venues in our directory plus cross-category options. This guide maps each path for relocating and holiday families without inventing prices or schedules.',
    body: require('./guide-bodies/kids-youth-sport-pattaya'),
    sisterLinks: [
      { url: '/guides/pattaya-gyms-childcare-family-pools/', label: 'Childcare & pools', desc: 'Train while kids swim' },
      { url: '/guides/family-friendly-pattaya/', label: 'Family-friendly', desc: 'Sport holidays with kids' },
      { url: 'https://pattaya-school-guide.com/', external: true, label: 'School Guide', desc: 'International schools Pattaya' },
    ],
  },
  {
    slug: 'climbing-pattaya',
    crumb: 'Climbing',
    kicker: 'Guide · Climbing · Deep Harbor · Bean Cow · top rope · lead',
    readTime: '12 min read',
    title: 'Climbing in Pattaya | Deep Climbing, Bean Cow, hotel walls | Pattaya.Gym',
    desc: 'Where to climb in Pattaya — Deep Climbing Gym 10m wall at Harbor Mall, Bean Cow CWA instruction in Huay Yai, hotel rock walls vs real gyms, and pairing with Muay Thai or family trampoline.',
    h1: 'Climbing in <span class="accent-cyan">Pattaya.</span>',
    lede: 'Pattaya climbing means two purpose-built indoor gyms — Deep at Harbor Mall north and Bean Cow on the Darkside — plus hotel adventure walls that are not route climbing. This guide maps both gyms, gear hire, and who should live near each belt.',
    body: require('./guide-bodies/climbing-pattaya'),
    sisterLinks: [
      { url: '/guides/kids-youth-sport-pattaya/', label: 'Kids & youth sport', desc: 'Harbor Mall trampoline stack' },
      { url: '/guides/best-gym-east-pattaya/', label: 'East Pattaya', desc: 'Bean Cow + Kombat belt' },
      { url: '/guides/adventure-pattaya/', label: 'Adventure Pattaya', desc: 'Zipline vs indoor walls' },
    ],
  },
  {
    slug: 'bjj-mma-pattaya',
    crumb: 'BJJ & MMA',
    kicker: 'Guide · BJJ · MMA · ALFA · Venum · Kombat · Rambaa M16',
    readTime: '12 min read',
    title: 'BJJ & MMA in Pattaya | Gi, No-Gi, cage gyms, fight camps | Pattaya.Gym',
    desc: 'Where to train BJJ and MMA in Pattaya — ALFA BJJ dedicated academy, Venum and Rage multi-discipline gyms, Kombat Group resort camp, Rambaa M16 cage, and CrossFit S&C on the Darkside.',
    h1: 'BJJ & <span class="accent-pink">MMA.</span>',
    lede: 'Pattaya is Muay Thai country first — but dedicated BJJ academies, cage gyms, and multi-discipline camps now cover Gi, No-Gi, MMA, and strength work from Jomtien to the Darkside. This guide maps venues where grappling is a real programme, not a single evening class on a boxing schedule.',
    body: require('./guide-bodies/bjj-mma-pattaya'),
    sisterLinks: [
      { url: '/guides/best-muay-thai-pattaya/', label: 'Best Muay Thai', desc: 'Ranked camps to pair with BJJ' },
      { url: '/guides/best-gym-east-pattaya/', label: 'East Pattaya camps', desc: 'Kombat, Rambaa, Jungle Gym' },
      { url: '/guides/training-thailand-visa-pattaya/', label: 'Training & visa', desc: 'Education visa via camps' },
    ],
  },
  {
    slug: 'running-cycling-clubs-pattaya',
    crumb: 'Running & clubs',
    kicker: 'Guide · Hash · cycling · beach aerobics · cricket · marathon',
    readTime: '12 min read',
    title: 'Running & cycling clubs in Pattaya | Hash, routes, social sport | Pattaya.Gym',
    desc: 'How to join running and cycling clubs in Pattaya — Pattaya Hash House Harriers, public routes, beach aerobics, cricket at Horseshoe, rugby Panthers, lawn bowls, and July marathon dates.',
    h1: 'Running & <span class="accent-cyan">cycling clubs.</span>',
    lede: 'Pattaya social sport means Monday hash runs since 1984, weekend cycling club meetups, free sunrise beach aerobics, and expat cricket and rugby teams — twenty-one club venues in our directory. This guide maps how to plug in without a monthly gym contract.',
    body: require('./guide-bodies/running-cycling-clubs-pattaya'),
    sisterLinks: [
      { url: '/guides/pattaya-digital-nomad-fitness/', label: 'Digital nomad fitness', desc: 'Long-stay week rhythm' },
      { url: '/guides/pattaya-seniors-low-impact-sport/', label: 'Seniors low-impact', desc: 'Bowls, petanque' },
      { url: '/guides/snooker-pool-billiards-pattaya/', label: 'Pool & snooker', desc: 'Indoor social evenings' },
    ],
  },
];

for (const g of guides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
