#!/usr/bin/env node
/**
 * write-round39-guide.js — 1 week / 1 month Muay Thai training in Pattaya.
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const g = {
  slug: 'train-muay-thai-pattaya-1-week-1-month',
  crumb: '1 week & 1 month training',
  kicker: 'Guide · Trip length · 1 week vs 1 month',
  readTime: '9 min read',
  title: 'Train Muay Thai in Pattaya: 1 week vs 1 month | Pattaya.Gym',
  desc: 'How to train Muay Thai in Pattaya for one week or one month: realistic goals, best camps per length, daily schedules, budgets, recovery, and visa notes.',
  h1: 'Train 1 week or <span class="accent-cyan">1 month.</span>',
  lede: 'One week is a sampler. One month is where habits form. This guide picks camps, budgets, and weekly rhythms for each trip length — so you do not book a resort month package for a seven-day experiment, or a walk-in gym for a serious four-week block.',
  body: require('./guide-bodies/train-week-month'),
};

const bytes = writeEditorialGuide(g);
console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
