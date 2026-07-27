#!/usr/bin/env node
/**
 * deepen-round44-ranked.js — Editorial depth for beginners, family, female ranked guides.
 * Idempotent marker: deepen-r44-block
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MARKER = 'deepen-r44-block';
const ONLY = process.argv.find((arg) => arg.startsWith('--guide-only='))
  ?.split('=', 2)[1];

const BLOCKS = {
  'best-for-beginners-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-beg-h">
  <h2 id="${MARKER}-beg-h" class="guide-rank-section">How we define "beginner-friendly"</h2>
  <p>A venue makes this list if it accepts first-timers without prior experience, explains equipment or rules in English (or patiently in Thai), and does not pressure hard sparring or upsells on day one. Muay Thai beginners should start with the dedicated <a href="/guides/muay-thai-pattaya-beginners/">Muay Thai beginners guide</a> — this page covers <strong>all sports</strong>.</p>
  <h3>Muay Thai first-timers</h3>
  <p>Resort camps (<a href="/gyms/fairtex-pattaya/">Fairtex</a>, <a href="/gyms/kombat-group-thailand/">Kombat Group</a>) and comfort gyms (<a href="/gyms/battle-conquer-gym/">Battle Conquer</a>) lead for hand-holding. Budget walk-in test: <a href="/gyms/pattaya-thai-boxing-fitness/">Jomtien Thai Boxing</a> ~฿300. Safety context: <a href="/guides/is-muay-thai-safe-pattaya/">is Muay Thai safe?</a></p>
  <h3>First time in a commercial gym</h3>
  <p>Chain gyms (<a href="/gyms/jetts-fitness-pattaya/">Jetts</a>, <a href="/gyms/anytime-fitness-pattaya/">Anytime</a>) offer orientation tours. Budget iron: <a href="/gyms/coco-fitness/">Coco Fitness</a> Mike Mall day pass with towel included. Free outdoor: <a href="/gyms/pratumnak-fitness-park/">Pratumnak Fitness Park</a>.</p>
  <h3>Try before you commit</h3>
  <p><a href="/guides/gym-day-pass-pattaya/">Gym day pass guide</a> · <a href="/compare/">Compare venues</a> · Area picks: <a href="/guides/best-gym-central-pattaya/">Central</a> · <a href="/guides/best-gym-jomtien-pattaya/">Jomtien</a> · <a href="/guides/best-gym-east-pattaya/">East Pattaya</a></p>
</section>`,
  'family-friendly-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-fam-h">
  <h2 id="${MARKER}-fam-h" class="guide-rank-section">Planning sport with kids in Pattaya</h2>
  <p>Families split into two needs: <strong>kids active while parents train</strong> vs <strong>everyone doing sport together</strong>. This guide lists both — water parks, football academies, resort kids clubs, and public pools.</p>
  <h3>Parents who need a training window</h3>
  <p><a href="/guides/pattaya-gyms-childcare-family-pools/">Childcare &amp; family pools guide</a> covers hotels and clubs with kids zones while you lift or swim laps. <a href="/gyms/cross-pattaya-pratamnak/">Cross Pattaya Pratamnak</a> bundles gym + PLAYROOM kids zone + pool.</p>
  <h3>All-ages active days</h3>
  <p><a href="/gyms/ramayana-water-park/">Ramayana Water Park</a> (day trip south) · <a href="/gyms/centara-grand-mirage/">Centara Grand Mirage</a> water park · <a href="/gyms/jumpz-trampoline-park/">Jumpz Trampoline</a> · beach volleyball <a href="/gyms/jomtien-beach-volleyball/">Jomtien</a>.</p>
  <h3>Where to stay</h3>
  <p>Jomtien and Naklua beat central Pattaya for family sleep quality. Area guides: <a href="/guides/best-gym-jomtien-pattaya/">Jomtien</a> · <a href="/guides/best-gym-naklua-pratamnak-pattaya/">Naklua</a>. Schools: Pattaya School Guide.</p>
</section>`,
  'female-friendly-gyms-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-ff-h">
  <h2 id="${MARKER}-ff-h" class="guide-rank-section">What “female-friendly” can honestly mean</h2>
  <p><strong>If you only read one thing: no directory can guarantee how a woman will be treated in a future session.</strong> A defensible shortlist uses facts a reader can check before paying: a current identity, a published access product or responsive contact, a suitable class level, known operating or staffed hours, and clear questions about changing space, equipment and the route home. It must not turn reviews, photos of female customers or “for everyone” marketing into a harassment-free guarantee.</p>

  <p>This guide therefore treats “female-friendly” as a planning test, not an award. The trade-off is usually between a transparent product and a specialist programme. A commercial gym or sports club can publish a straightforward day pass and facilities but no coached introduction. A Muay Thai or BJJ venue can publish the exact coached session while leaving changing-room, equipment and class-composition questions unanswered. A yoga studio can publish language and class prices but still require timetable and level confirmation.</p>

  <p>Status overrides any legacy ranking. <a href="/gyms/platinum-fitness/">Platinum Fitness Club</a> remains an unverified identity and should not be used as a current recommendation. A record with no confirmed operator or live place cannot become “female-friendly” through old descriptions. The current evidence-led options below are comparison examples, not claims that other genders are excluded or that every future visit will feel the same.</p>

  <h2>Current comparison points</h2>
  <table>
    <thead>
      <tr><th>Option</th><th>Useful verified fact</th><th>Dated price evidence</th><th>What still needs asking</th></tr>
    </thead>
    <tbody>
      <tr><td><a href="/gyms/yoga-pattaya-studio/">Yoga Pattaya Studio</a></td><td>Ashtanga, Mysore, Hatha, Vinyasa, stretching and fitness yoga; class language varies among English, Russian and Thai</td><td>Standard drop-in ฿500 and Ashtanga drop-in ฿600, checked 25 July 2026</td><td>Selected teacher, language, level, mat and changing arrangements</td></tr>
      <tr><td><a href="/gyms/elite-gym-fitness/">Elite Gym &amp; Fitness</a></td><td>General gym, personal training and scheduled classes including yoga and dance formats</td><td>Gym day access ฿400; one group class ฿300, checked 25 July 2026</td><td>Class booking, trainer request, lockers, towels and staffed first-visit process</td></tr>
      <tr><td><a href="/gyms/castra-gym/">Castra Gym</a></td><td>General weights and cardio plus scheduled Muay Thai, BJJ, yoga and group fitness</td><td>Fight-club group class ฿300 and private class ฿600, checked 25 July 2026</td><td>General-gym price, selected class mix, teaching language and equipment</td></tr>
      <tr><td><a href="/gyms/battle-conquer-gym/">Battle &amp; Conquer</a></td><td>Twice-daily Muay Thai, weights area, sauna and cold plunge</td><td>Gym-only day ฿200 or one Muay Thai group session ฿500, checked 25 July 2026</td><td>Gloves, wraps, changing privacy, trainer assignment and beginner intensity</td></tr>
      <tr><td><a href="/gyms/fitz-club/">Fitz Club</a></td><td>Day access explicitly covers gym, pool, sauna and steam</td><td>Adult day pass ฿800, checked 25 July 2026</td><td>Tennis and squash are separate; confirm coaching and changing details</td></tr>
      <tr><td><a href="/gyms/g-fitness-pattaya/">G Fitness</a></td><td>Current Chaiyaphruek identity with strength, cardio, indoor-class and outdoor-training zones</td><td>No current rate card found on 26 July 2026</td><td>Day access, exact class time, language, equipment and facilities</td></tr>
    </tbody>
  </table>

  <p>The price column is intentionally narrow. Each number comes from the linked venue's operator source and carries its check date. It is not a city-wide women’s rate and does not prove a special women-only product. Blank prices stay blank until the operator publishes or confirms the exact access product.</p>

  <h2>Choose the format before the venue name</h2>
  <h3>For a conventional gym session</h3>
  <p>Elite gives the clearest current single-gym-access amount in this comparison. Fitz costs more but explicitly bundles the pool and wet areas. G Fitness has a current identity, phone and daily 07:00-21:00 listing but no public tariff. A first-time visitor should ask whether reception is staffed, whether a trainer introduction is available, what areas the pass covers, and whether lockers or changing space require a lock, deposit or separate charge.</p>

  <p>Twenty-four-hour member access deserves a separate check. <a href="/gyms/jetts-fitness-pattaya/">Jetts Little Walk</a> publishes narrower staffed periods than its 24-hour member access, and its visitor page did not expose a Little Walk price on 26 July 2026. <a href="/gyms/anytime-fitness-pattaya/">Anytime Fitness Pattaya</a> covers two branches and links to a free-trial request for Bukis Point, but a form is not guaranteed immediate entry. Arrange the first visit while staff can register and orient a visitor.</p>

  <h3>For Muay Thai or BJJ</h3>
  <p>Battle &amp; Conquer publishes two different short products: gym-only access and a coached Muay Thai group session. That distinction helps a newcomer avoid buying the wrong thing. Castra publishes Muay Thai Monday-Friday at 09:00-10:00 and 17:30-18:30, and BJJ Monday, Wednesday and Friday at 19:00-20:00, with gym access included in its fight-club classes. Both timetables and rates were checked on 25 July 2026.</p>

  <p>Neither venue's public tariff answers every female-specific planning question. Ask whether the selected session accepts complete beginners, whether hard sparring is optional, which protective equipment is needed, whether gloves or wraps are supplied, how changing privacy works and whether a preferred trainer request is possible. The <a href="/guides/muay-thai-pattaya-beginners/">Muay Thai beginners guide</a> explains class-format questions; the <a href="/guides/is-muay-thai-safe-pattaya/">Muay Thai safety guide</a> separates ordinary training risk from unsupported reassurance.</p>

  <h3>For yoga and lower-impact classes</h3>
  <p>Yoga Pattaya Studio publishes the most useful language-and-price combination in this shortlist. Its timetable covers several yoga formats, and the venue record states that language varies by teacher and session. A multilingual programme is not a guarantee that the preferred class is taught in the preferred language. Check the live timetable, name the class, and ask whether it is led or Mysore-style, what experience is expected and whether a mat is included.</p>

  <p>Someone building a longer low-impact week can continue to the <a href="/guides/yoga-retreat-pattaya/">yoga guide</a>. Do not assume that every hotel yoga mention is open to non-guests or that a broad business-hour window is a class schedule.</p>

  <h2>Location is part of the training decision</h2>
  <p>A well-documented venue can still be a poor fit if the exact pin and session time create a difficult return. Jomtien, Pratamnak, Central Pattaya and East Pattaya are different corridors; labels such as “Pattaya” or “South Pattaya” do not prove that two venues are close together. Use the exact map, not a neighbourhood stereotype. The <a href="/guides/best-gym-jomtien-pattaya/">Jomtien guide</a> and <a href="/guides/best-gym-naklua-pratamnak-pattaya/">Naklua and Pratamnak guide</a> compare access models by location.</p>

  <p>Before an early or late session, decide the return route in advance and confirm the actual end time. The directory does not publish invented walk times, ride fares or claims that one district is universally safe. If transport certainty matters more than a slightly cheaper class, choose the venue whose route and staffed arrival can be verified.</p>

  <h2>A message to send before booking</h2>
  <p>Send the venue the exact date, preferred time, activity and experience level. Ask: “Can a first-time woman join this session? Is it group or private? What is the full price and duration? Which language will the instructor use? Is sparring optional? What equipment should I bring? Are lockers and a private changing area available? What time should I arrive?” A current written reply closes more gaps than a generic “women welcome” slogan.</p>

  <p>For a general gym, replace the sparring question with trainer orientation, staffed registration and the exact equipment or class needed. For a pool or hotel club, ask whether non-guests are eligible and which facilities the pass includes. For a long package, ask about cancellation, absence, membership start and any card or deposit.</p>

</section>`,
};

function inject(slug, block) {
  const fp = path.join(ROOT, 'guides', slug, 'index.html');
  if (!fs.existsSync(fp)) return false;
  let html = fs.readFileSync(fp, 'utf8');
  if (slug === 'female-friendly-gyms-pattaya' && html.includes('id="deepen-r44-block-ff-h"')) {
    html = html.replace(
      /<section class="guide-rank-primer" id="guide-rank-primer"[\s\S]*?<\/section>/m,
      block.trim(),
    );
  } else if (html.includes(`id="${MARKER}"`)) {
    html = html.replace(new RegExp(`<section class="guide-editorial-depth" id="${MARKER}"[\\s\\S]*?</section>`, 'm'), block.trim());
  } else {
    const anchor = '<div id="full-list"></div>';
    if (!html.includes(anchor)) return false;
    html = html.replace(anchor, block + '\n  ' + anchor);
  }
  if (slug === 'female-friendly-gyms-pattaya') {
    const currentTldr = `<section class="tldr" aria-labelledby="tldr-h">
    <h2 id="tldr-h" class="tldr-title">Quick answer — start with verifiable fit</h2>
    <ol class="tldr-list">
      <li><strong><a href="/gyms/yoga-pattaya-studio/">Yoga Pattaya Studio</a></strong> — publishes class formats, language context and dated drop-in prices.</li>
      <li><strong><a href="/gyms/elite-gym-fitness/">Elite Gym &amp; Fitness</a></strong> — publishes a dated ordinary gym day price and a separate class tariff.</li>
      <li><strong><a href="/gyms/battle-conquer-gym/">Battle &amp; Conquer</a></strong> — separates gym-only access from coached Muay Thai and lists the group times.</li>
    </ol>
    <p class="tldr-footnote">These are evidence-led starting points, not safety guarantees. <a href="#${MARKER}">Read the decision test →</a></p>
  </section>`;
    const currentSafetyFilters = `<article class="venue-body guide-extra">
        <h2>Practical checks before paying</h2>
        <ul>
          <li>Confirm the current operator identity, exact map pin and access product before travelling.</li>
          <li>Arrange a first registration during staffed hours rather than assuming a member key-fob admits visitors.</li>
          <li>Ask the venue directly about changing privacy, lockers, class level, equipment and instructor language.</li>
          <li>Confirm the actual session end time and plan the return route without relying on an invented walk time or fare.</li>
        </ul>
      </article>`;
    const currentFaq = `<section class="guide-faq" aria-labelledby="faq-h">
    <h2 id="faq-h" style="font-size: 1.4rem; margin-bottom: 18px;">Common questions</h2>
    <details class="faq-item"><summary>Can this guide guarantee that a gym is harassment-free?</summary><p>No. Public sources can confirm identity, access, timetable, price and some facilities; they cannot guarantee future conduct. Use current operator answers, state the requested format and intensity, and leave any session that ignores clear boundaries.</p></details><details class="faq-item"><summary>Are women-only gyms or classes required for a good fit?</summary><p>No. The current directory evidence is stronger for mixed commercial gyms, studios and combat classes than for a separate women-only market. The useful test is whether the exact session, coaching level, changing arrangements, price and arrival process meet the individual traveller's needs.</p></details><details class="faq-item"><summary>What if the venue has no published price?</summary><p>Do not remove a confirmed operating venue and do not fill the gap with an old review. Ask for the exact session or pass price, inclusions, date validity and registration terms. A missing public price is a contact task, not evidence that the venue is closed.</p></details>
  </section>`;
    html = html
      .replace(/<section class="tldr"[\s\S]*?<\/section>/m, currentTldr)
      .replace(/<article class="venue-body guide-extra">[\s\S]*?<\/article>/m, currentSafetyFilters)
      .replace(/<section class="guide-faq"[\s\S]*?<\/section>/m, currentFaq)
      .replace(/<p class="hero-lede"[^>]*>[\s\S]*?<\/p>/m, '<p class="hero-lede" style="text-align:left; margin-left:0; max-width:760px;">Compare current Pattaya training options by access, class format, dated price and the questions a solo woman should settle before paying. The guide does not turn marketing or old reviews into a safety guarantee.</p>')
      .replace(/<p class="hero-meta"[^>]*>[\s\S]*?<\/p>/m, '<p class="hero-meta" style="text-align:left;">Decision guide · Evidence checked 2026-07-26 · Pattaya directory records</p>')
      .replace(/Updated <time datetime="[^"]+">[^<]+<\/time>/, 'Updated <time datetime="2026-07-26">2026-07-26</time>')
      .replace(/"dateModified":"[^"]+"/, '"dateModified":"2026-07-26"');
  }
  fs.writeFileSync(fp, html, 'utf8');
  return true;
}

let n = 0;
for (const [slug, block] of Object.entries(BLOCKS)) {
  if (ONLY && slug !== ONLY) continue;
  if (inject(slug, block)) {
    n++;
    console.log(`  /guides/${slug}/ deepened`);
  }
}
console.log(`Round 44 ranked deepen: ${n} guides.`);
