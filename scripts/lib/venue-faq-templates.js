/**
 * venue-faq-templates.js — Category-aware FAQ pairs from verified venue data only.
 * No fabricated prices or hours beyond what data.js already states.
 */

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function hasTag(g, t) {
  return (g.tags || []).some(x => x.toLowerCase().includes(t));
}

function faqsForVenue(g) {
  const name = g.name.split(/[\(（]/)[0].trim();
  const cat = g.category;
  const price = g.priceRange || 'varies';
  const hours = g.hours ? esc(g.hours) : 'contact the venue to confirm current hours';
  const area = g.area ? g.area.split(/[—\/,]/)[0].trim() : 'Pattaya';
  const out = [];

  if (cat === 'muay-thai') {
    out.push({
      q: `Does ${name} accept beginners?`,
      a: hasTag(g, 'beginner') || hasTag(g, 'english') || g.description.includes('beginner')
        ? `${name} welcomes beginners — confirm pad-round intensity on arrival. See our <a href="/guides/muay-thai-pattaya-beginners/">Muay Thai beginners guide</a>.`
        : `Most Pattaya Muay Thai camps accept first-timers — ask for technique-focused rounds, not hard sparring. Read <a href="/guides/is-muay-thai-safe-pattaya/">is Muay Thai safe?</a> before you book.`,
    });
    out.push({
      q: `What are typical prices at ${name}?`,
      a: `Listed tier: ${price}. Drop-ins and monthly rates change — call or message before you commit. Compare budgets on <a href="/guides/cheapest-gyms-pattaya/">cheapest gyms</a> and <a href="/guides/best-muay-thai-pattaya/">best Muay Thai</a>.`,
    });
    if (hasTag(g, 'accommodation') || hasTag(g, 'all-inclusive')) {
      out.push({
        q: `Does ${name} offer accommodation?`,
        a: `This venue is tagged for stay-and-train options. See <a href="/guides/muay-thai-camps-with-accommodation-pattaya/">camps with accommodation</a> and confirm room availability directly.`,
      });
    } else {
      out.push({
        q: `When is ${name} open?`,
        a: `Hours on file: ${hours}. Pattaya camps often run two sessions daily (morning + afternoon) — arrive 15 minutes early for wrap and warm-up.`,
      });
    }
  } else if (cat === 'mma' || cat === 'bjj') {
    out.push({
      q: `Can beginners train BJJ/MMA at ${name}?`,
      a: `Ask for a fundamentals or intro class before open mat. Context: <a href="/guides/bjj-mma-pattaya/">BJJ &amp; MMA in Pattaya</a> · <a href="/guides/best-for-beginners-pattaya/">best for beginners</a>.`,
    });
    out.push({
      q: `What does training cost at ${name}?`,
      a: `Price tier on file: ${price}. Drop-in, monthly, and fight-camp packages differ — confirm directly. Long-stay visa paths: <a href="/guides/training-thailand-visa-pattaya/">training &amp; visa guide</a>.`,
    });
    out.push({
      q: `Where is ${name} located?`,
      a: `${name} is listed in ${esc(area)}. Area guide: <a href="/guides/best-gym-east-pattaya/">East Pattaya</a> or <a href="/guides/best-gym-jomtien-pattaya/">Jomtien</a> depending on your base.`,
    });
  } else if (cat === 'fitness' || cat === 'crossfit') {
    out.push({
      q: `Can I get a day pass at ${name}?`,
      a: hasTag(g, '24-7') || hasTag(g, '24h')
        ? `${name} offers extended or 24-hour access — confirm guest/day-pass policy at reception. More options: <a href="/guides/gym-day-pass-pattaya/">gym day pass guide</a>.`
        : `Day passes and short-stay deals vary by venue — call ahead. See <a href="/guides/gym-day-pass-pattaya/">gym day pass Pattaya</a> for walk-in friendly gyms.`,
    });
    out.push({
      q: `How much does ${name} cost?`,
      a: `Listed tier: ${price}. Monthly contracts and tourist passes differ — compare on <a href="/guides/cheapest-gyms-pattaya/">cheapest gyms</a> or <a href="/compare/">compare tool</a>.`,
    });
    if (cat === 'crossfit') {
      out.push({
        q: `Is ${name} Pattaya's CrossFit affiliate?`,
        a: `CrossFit Pattaya @ Jungle Gym is Pattaya's only CrossFit affiliate — also runs MMA and archery on-site. Full guide: <a href="/guides/crossfit-pattaya/">CrossFit Pattaya</a>.`,
      });
    } else {
      out.push({
        q: `When is ${name} open?`,
        a: `Hours on file: ${hours}. Chain gyms (Jetts, Anytime) often allow 24/7 key-fob entry — see <a href="/guides/24-hour-gyms-pattaya/">24-hour gyms</a>.`,
      });
    }
  } else if (cat === 'golf') {
    out.push({
      q: `How do I book a round at ${name}?`,
      a: `Book tee times through the course pro shop or hotel concierge. Compare layouts on <a href="/guides/best-golf-courses-pattaya/">best golf courses</a>.`,
    });
    out.push({
      q: `What is the price tier at ${name}?`,
      a: `Listed tier: ${price}. Green fees, caddies, and cart hire are extra — confirm packages before you play.`,
    });
    out.push({
      q: `Can I combine golf with gym training in Pattaya?`,
      a: `Many golfers stay at resort clubs with fitness facilities — <a href="/guides/luxury-sports-clubs-pattaya/">luxury sports clubs</a> · early tee times pair well with afternoon lifting.`,
    });
  } else if (cat === 'watersports' || cat === 'swimming') {
    if (hasTag(g, 'padi') || hasTag(g, 'dive') || cat === 'watersports') {
      out.push({
        q: `Does ${name} run PADI courses?`,
        a: `Check course schedule directly — Open Water typically runs 3–4 days in Pattaya. Operator comparison: <a href="/guides/best-dive-operators-pattaya/">best dive operators</a>.`,
      });
    } else {
      out.push({
        q: `Is ${name} good for families?`,
        a: `Water parks and pool clubs suit mixed-age groups — see <a href="/guides/family-friendly-pattaya/">family-friendly sport</a> and <a href="/guides/pattaya-gyms-childcare-family-pools/">childcare &amp; pools</a>.`,
      });
    }
    out.push({
      q: `Where is ${name}?`,
      a: `Listed in ${esc(area)}. South-side water venues: <a href="/guides/best-gym-sattahip-pattaya/">Na Jomtien &amp; Sattahip guide</a>. Beach belt: <a href="/guides/best-gym-jomtien-pattaya/">Jomtien</a>.`,
    });
    out.push({
      q: `What should I bring to ${name}?`,
      a: `Swimwear, reef-safe sunscreen, and cash for lockers or photos. Dive shops provide core equipment for courses — confirm inclusions when you book.`,
    });
  } else if (cat === 'yoga') {
    out.push({
      q: `Are drop-in yoga classes available at ${name}?`,
      a: `Most studios sell single classes and weekly packages — confirm schedule on their site. Retreat context: <a href="/guides/yoga-retreat-pattaya/">yoga retreat Pattaya</a>.`,
    });
    out.push({
      q: `Is ${name} suitable for beginners?`,
      a: `Yoga studios in Pattaya routinely welcome first-timers — tell the instructor about injuries. Broader intro sport: <a href="/guides/best-for-beginners-pattaya/">best for beginners</a>.`,
    });
    out.push({
      q: `Where is ${name} located?`,
      a: `${esc(area)} — pair with beach recovery or morning runs on <a href="/guides/best-gym-jomtien-pattaya/">Jomtien</a> or hilltop condos on <a href="/guides/best-gym-naklua-pratamnak-pattaya/">Pratamnak</a>.`,
    });
  } else if (cat === 'racquet') {
    out.push({
      q: `How do I book a court at ${name}?`,
      a: `Call or LINE the venue for peak-hour slots. Padel &amp; pickleball hub guide: <a href="/guides/padel-pickleball-pattaya/">padel &amp; pickleball Pattaya</a>.`,
    });
    out.push({
      q: `Can beginners play at ${name}?`,
      a: `Many courts rent equipment and run intro sessions — no prior racquet sport needed. See <a href="/guides/best-for-beginners-pattaya/">best for beginners</a>.`,
    });
    out.push({
      q: `What is the price tier at ${name}?`,
      a: `Listed tier: ${price}. Court hire is usually per hour plus equipment rental — confirm before you go.`,
    });
  } else {
    out.push({
      q: `What sport is ${name} known for?`,
      a: g.description ? esc(g.description.slice(0, 200)) + (g.description.length > 200 ? '…' : '') : `${name} is a hand-checked Pattaya sport venue in our directory.`,
    });
    out.push({
      q: `How do I contact ${name}?`,
      a: g.phone
        ? `Phone on file: ${esc(g.phone)}. You can also reach our team via WhatsApp on this page for booking help.`
        : `Use the contact buttons on this page or browse <a href="/guides/">Pattaya sport guides</a> for trip planning.`,
    });
    out.push({
      q: `Where is ${name} in Pattaya?`,
      a: `Listed area: ${esc(area)}. Explore nearby venues on <a href="/compare/">compare</a>.`,
    });
  }

  return out.slice(0, 3);
}

function faqHtml(faqs) {
  return faqs.map(f =>
    `<details class="faq-item"><summary>${esc(f.q)}</summary><p>${f.a}</p></details>`
  ).join('');
}

function faqJsonLd(g, faqs, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a.replace(/<[^>]+>/g, ''),
      },
    })),
  };
}

module.exports = { faqsForVenue, faqHtml, faqJsonLd, esc };
