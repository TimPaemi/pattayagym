#!/usr/bin/env node
/**
 * write-russian-speaking-guide.js — Full editorial rewrite (Q1 quality recovery).
 * Run: node scripts/write-russian-speaking-guide.js
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const guide = {
  slug: 'pattaya-russian-speaking-sport',
  crumb: 'Russian-speaking sport',
  kicker: 'Guide · Russian-speaking community · football · fitness · MT',
  readTime: '14 min read',
  title: 'Russian-speaking sport in Pattaya | Pattaya.Gym',
  desc: 'Where to train in Pattaya with Russian-speaking coaches and staff — Rusich Club, AF Academy, Castra, Elite Gym, Yoga Pattaya Studio, Muay Thai camps, and long-stay logistics.',
  h1: 'Russian-speaking <span class="accent-cyan">sport.</span>',
  lede: 'Pattaya\'s Russian-speaking corridor runs Naklua through Jomtien and East Pattaya. This guide lists only venues where Russian (or trilingual) coaching is documented in our directory — football academies, gyms, yoga, Muay Thai, and watersports — with honest booking and area advice.',
  body: require('./guide-bodies/pattaya-russian-speaking-sport'),
  sisterLinks: [
    { url: '/guides/kids-youth-sport-pattaya/', label: 'Kids & youth sport', desc: 'Football academies and schools' },
    { url: '/guides/english-speaking-muay-thai-pattaya/', label: 'English-speaking Muay Thai', desc: 'Multilingual camp shortlist' },
    { url: '/guides/training-thailand-visa-pattaya/', label: 'Training & visa', desc: 'Long-stay sport stays' },
    { url: 'https://pattayavisahelp.com/', external: true, label: 'Pattaya Visa Help', desc: 'DTV and reporting (sister site)' },
  ],
};

const bytes = writeEditorialGuide(guide);
console.log(`Wrote /guides/${guide.slug}/ (${(bytes / 1024).toFixed(1)} KB) editorial guide.`);
