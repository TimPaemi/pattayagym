/**
 * venue-faq-templates.js — Category-aware FAQ pairs from verified venue data only.
 */

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function hasTag(g, t) {
  return (g.tags || []).some(x => x.toLowerCase().includes(t));
}

function priceLabel(pr) {
  const map = {
    '฿': 'budget',
    '฿฿': 'mid-range',
    '฿฿฿': 'premium',
    '฿฿฿฿': 'luxury',
  };
  return map[pr] || pr || 'varies';
}

function plainText(html) {
  return html
    .replace(/<a [^>]*>([\s\S]*?)<\/a>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function areaGuideLink(g) {
  const a = (g.area || '').toLowerCase();
  if (/jomtien|na jomtien/.test(a)) return '<a href="/guides/best-gym-jomtien-pattaya/">Jomtien guide</a>';
  if (/naklua|pratamnak|wongamat/.test(a)) return '<a href="/guides/best-gym-naklua-pratamnak-pattaya/">Naklua &amp; Pratamnak guide</a>';
  if (/east|darkside|mabprachan|nong prue|huai yai/.test(a)) return '<a href="/guides/best-gym-east-pattaya/">East Pattaya guide</a>';
  if (/sattahip|bang saray|u-tapao/.test(a)) return '<a href="/guides/best-gym-sattahip-pattaya/">Na Jomtien &amp; Sattahip guide</a>';
  if (/central|beach road|buakhao|walking|mike/.test(a)) return '<a href="/guides/best-gym-central-pattaya/">Central Pattaya guide</a>';
  return '<a href="/guides/">Pattaya sport guides</a>';
}

function faqsForVenue(g) {
  const name = g.name.split(/[\(（]/)[0].trim();
  const cat = g.category;
  const price = g.priceRange || 'varies';
  const pricePlain = priceLabel(price);
  const hours = g.hours ? esc(g.hours) : 'contact the venue to confirm current hours';
  const area = g.area ? g.area.split(/[—\/,]/)[0].trim() : 'Pattaya';
  const areaLink = areaGuideLink(g);
  const out = [];

  if (cat === 'muay-thai') {
    out.push({
      q: `Does ${name} accept beginners?`,
      a: hasTag(g, 'beginner') || hasTag(g, 'english') || (g.description || '').includes('beginner')
        ? `${name} welcomes beginners — confirm pad-round intensity on arrival. See our <a href="/guides/muay-thai-pattaya-beginners/">Muay Thai beginners guide</a>.`
        : `Most Pattaya Muay Thai camps accept first-timers — ask for technique-focused rounds, not hard sparring. Read <a href="/guides/is-muay-thai-safe-pattaya/">is Muay Thai safe?</a> before you book.`,
    });
    out.push({
      q: `What are typical prices at ${name}?`,
      a: `Listed tier: ${esc(price)} (${pricePlain}). Drop-ins and monthly rates change — call or message before you commit. Compare on <a href="/guides/cheapest-gyms-pattaya/">cheapest gyms</a> and <a href="/guides/best-muay-thai-pattaya/">best Muay Thai</a>.`,
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
      a: `Price tier on file: ${esc(price)} (${pricePlain}). Drop-in, monthly, and fight-camp packages differ — confirm directly. Long-stay: <a href="/guides/training-thailand-visa-pattaya/">training &amp; visa guide</a>.`,
    });
    out.push({
      q: `Where is ${name} located?`,
      a: `${name} is listed in ${esc(area)}. Area guide: ${areaLink}.`,
    });
  } else if (cat === 'fitness' || cat === 'crossfit') {
    out.push({
      q: `Can I get a day pass at ${name}?`,
      a: hasTag(g, '24-7') || hasTag(g, '24h')
        ? `${name} offers extended or 24-hour access — confirm guest/day-pass policy at reception. More: <a href="/guides/gym-day-pass-pattaya/">gym day pass guide</a>.`
        : `Day passes and short-stay deals vary — call ahead. See <a href="/guides/gym-day-pass-pattaya/">gym day pass Pattaya</a>.`,
    });
    out.push({
      q: `How much does ${name} cost?`,
      a: `Listed tier: ${esc(price)} (${pricePlain}). Monthly contracts and tourist passes differ — <a href="/guides/cheapest-gyms-pattaya/">cheapest gyms</a> · <a href="/compare/">compare tool</a>.`,
    });
    if (cat === 'crossfit') {
      out.push({
        q: `Is ${name} Pattaya's CrossFit affiliate?`,
        a: `CrossFit Pattaya @ Jungle Gym is Pattaya's only CrossFit affiliate. Full guide: <a href="/guides/crossfit-pattaya/">CrossFit Pattaya</a>.`,
      });
    } else {
      out.push({
        q: `When is ${name} open?`,
        a: `Hours on file: ${hours}. Chain gyms often allow 24/7 key-fob entry — <a href="/guides/24-hour-gyms-pattaya/">24-hour gyms</a>.`,
      });
    }
  } else if (cat === 'golf') {
    out.push({
      q: `How do I book a round at ${name}?`,
      a: `Book tee times through the pro shop or hotel concierge. Compare layouts: <a href="/guides/best-golf-courses-pattaya/">best golf courses</a>.`,
    });
    out.push({
      q: `What is the price tier at ${name}?`,
      a: `Listed tier: ${esc(price)} (${pricePlain}). Green fees, caddies, and cart hire are extra — confirm packages before you play.`,
    });
    out.push({
      q: `Can I combine golf with gym training in Pattaya?`,
      a: `Resort courses pair well with hotel gym day passes — <a href="/guides/luxury-sports-clubs-pattaya/">luxury sports clubs</a>.`,
    });
  } else if (cat === 'watersports') {
    out.push({
      q: `Does ${name} run PADI or watersport courses?`,
      a: hasTag(g, 'padi') || hasTag(g, 'dive')
        ? `Check course schedule directly — Open Water typically runs 3–4 days in Pattaya. <a href="/guides/best-dive-operators-pattaya/">Best dive operators</a>.`
        : `Confirm lesson types and equipment rental on booking. Watersports hub: <a href="/category/watersports/">all watersports</a>.`,
    });
    out.push({
      q: `Where is ${name}?`,
      a: `Listed in ${esc(area)}. ${areaLink} · beach belt: <a href="/guides/best-gym-jomtien-pattaya/">Jomtien</a>.`,
    });
    out.push({
      q: `What should I bring to ${name}?`,
      a: `Swimwear, reef-safe sunscreen, and cash for lockers. Dive and kite schools usually provide core gear for courses — confirm inclusions.`,
    });
  } else if (cat === 'swimming') {
    out.push({
      q: `Can I swim at ${name} without a hotel stay?`,
      a: hasTag(g, 'waterpark') || hasTag(g, 'family')
        ? `Water parks and some resort pools sell day tickets — call ahead. Guide: <a href="/guides/swimming-pools-pattaya/">swimming &amp; pools Pattaya</a>.`
        : `Day-pass policies vary — confirm walk-in access. Hotel pools: <a href="/guides/luxury-sports-clubs-pattaya/">luxury sports clubs</a>.`,
    });
    out.push({
      q: `Is ${name} good for families?`,
      a: `Pool and water venues suit mixed-age groups — <a href="/guides/family-friendly-pattaya/">family-friendly sport</a> · <a href="/guides/pattaya-gyms-childcare-family-pools/">childcare &amp; pools</a>.`,
    });
    out.push({
      q: `Where is ${name} located?`,
      a: `${esc(area)}. ${areaLink} · south water parks: <a href="/guides/best-gym-sattahip-pattaya/">Sattahip guide</a>.`,
    });
  } else if (cat === 'yoga') {
    out.push({
      q: `Are drop-in yoga classes available at ${name}?`,
      a: `Most studios sell single classes and weekly packages — confirm schedule on their site. <a href="/guides/yoga-retreat-pattaya/">Yoga retreat Pattaya</a>.`,
    });
    out.push({
      q: `Is ${name} suitable for beginners?`,
      a: `Studios routinely welcome first-timers — tell the instructor about injuries. <a href="/guides/best-for-beginners-pattaya/">Best for beginners</a>.`,
    });
    out.push({
      q: `Where is ${name} located?`,
      a: `${esc(area)} — ${areaLink}.`,
    });
  } else if (cat === 'racquet') {
    out.push({
      q: `How do I book a court at ${name}?`,
      a: `Call or LINE for peak-hour slots. <a href="/guides/padel-pickleball-pattaya/">Padel &amp; pickleball Pattaya</a>.`,
    });
    out.push({
      q: `Can beginners play at ${name}?`,
      a: `Many courts rent equipment and run intro sessions. <a href="/guides/best-for-beginners-pattaya/">Best for beginners</a>.`,
    });
    out.push({
      q: `What is the price tier at ${name}?`,
      a: `Listed tier: ${esc(price)} (${pricePlain}). Court hire is usually per hour plus equipment rental.`,
    });
  } else if (cat === 'kids-youth') {
    out.push({
      q: `What age groups does ${name} accept?`,
      a: `Confirm minimum age and supervision rules directly — youth academies differ on parent presence. <a href="/guides/family-friendly-pattaya/">Family-friendly Pattaya</a>.`,
    });
    out.push({
      q: `Can parents train while kids are at ${name}?`,
      a: `Some academies run fixed lesson windows — pair with nearby gym or pool time. <a href="/guides/pattaya-gyms-childcare-family-pools/">Childcare &amp; family pools</a>.`,
    });
    out.push({
      q: `Where is ${name}?`,
      a: `${esc(area)}. ${areaLink}.`,
    });
  } else if (cat === 'climbing') {
    out.push({
      q: `Do I need experience to climb at ${name}?`,
      a: `Most climbing gyms offer intro sessions and rental shoes — no prior experience required. <a href="/guides/best-for-beginners-pattaya/">Best for beginners</a>.`,
    });
    out.push({
      q: `What does a session at ${name} cost?`,
      a: `Listed tier: ${esc(price)} (${pricePlain}). Day passes and gear rental are usually separate — confirm on arrival.`,
    });
    out.push({
      q: `Where is ${name}?`,
      a: `${esc(area)}. ${areaLink}.`,
    });
  } else if (cat === 'adventure') {
    out.push({
      q: `How do I book ${name}?`,
      a: `Adventure venues often require advance booking in peak season — use contact buttons on this page or WhatsApp us for help.`,
    });
    out.push({
      q: `Are there age or weight limits at ${name}?`,
      a: `Confirm restrictions directly — zipline, skydive, and ATV operators enforce safety limits. <a href="/guides/family-friendly-pattaya/">Family-friendly guide</a> for kid-friendly adventure.`,
    });
    out.push({
      q: `Where is ${name}?`,
      a: `${esc(area)}. Transport: <a href="https://pattaya-vehicle-rentals.com/" target="_blank" rel="noopener noreferrer">Pattaya Vehicle Rentals</a>. ${areaLink}.`,
    });
  } else if (cat === 'equestrian') {
    out.push({
      q: `Do I need riding experience at ${name}?`,
      a: `Many equestrian venues offer beginner trail rides and lessons — confirm horse assignment and helmet policy on booking.`,
    });
    out.push({
      q: `How do I book ${name}?`,
      a: `Call or email ahead — polo and equestrian clubs rarely accept walk-ins. Listed tier: ${esc(price)} (${pricePlain}).`,
    });
    out.push({
      q: `Where is ${name}?`,
      a: `${esc(area)}. Often east or south of central Pattaya — ${areaLink}.`,
    });
  } else if (cat === 'clubs') {
    out.push({
      q: `Can visitors use ${name} without membership?`,
      a: `Social and sports clubs vary on guest access — call for day-pass or sponsor-member rules. <a href="/guides/luxury-sports-clubs-pattaya/">Luxury sports clubs</a>.`,
    });
    out.push({
      q: `What facilities does ${name} offer?`,
      a: g.description ? esc(g.description.slice(0, 180)) + (g.description.length > 180 ? '…' : '') : `Hand-checked club entry in ${esc(area)}.`,
    });
    out.push({
      q: `Where is ${name}?`,
      a: `${esc(area)}. ${areaLink} · gentle options: <a href="/guides/pattaya-seniors-low-impact-sport/">seniors low-impact</a>.`,
    });
  } else {
    out.push({
      q: `What is ${name} known for?`,
      a: g.description ? esc(g.description.slice(0, 200)) + (g.description.length > 200 ? '…' : '') : `${name} is a hand-checked Pattaya sport venue.`,
    });
    out.push({
      q: `How do I contact ${name}?`,
      a: g.phone
        ? `Phone on file: ${esc(g.phone)}. Use WhatsApp on this page for booking help.`
        : `Use the contact buttons on this page or browse <a href="/guides/">Pattaya sport guides</a>.`,
    });
    out.push({
      q: `Where is ${name} in Pattaya?`,
      a: `${esc(area)}. ${areaLink} · <a href="/compare/">compare venues</a>.`,
    });
  }

  return out.slice(0, 3);
}

function faqHtml(faqs) {
  return faqs.map(f =>
    `<details class="faq-item"><summary>${esc(f.q)}</summary><p>${f.a}</p></details>`
  ).join('');
}

function faqJsonLd(g, faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: plainText(f.a),
      },
    })),
  };
}

module.exports = { faqsForVenue, faqHtml, faqJsonLd, esc, plainText, priceLabel };
