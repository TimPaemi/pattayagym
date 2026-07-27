/**
 * Mojibake detection and repair.
 *
 * SCOPE: pattaya-gym.com only. Hardcoded to this repo by design. Do not add a
 * site switch and do not copy it out to another repo.
 *
 * THE FAILURE
 * -----------
 * On 2026-07-27 at 12:29 something re-saved data.js, build-v2.js and
 * build-discovery.js reading UTF-8 through a single-byte Windows codepage and
 * writing it back as UTF-8. Every baht sign became a three-character run, every
 * em dash and curly apostrophe likewise. A build at 15:01 propagated it into 306
 * output files: all 215 venue pages, every area and category hub, all four JSON
 * APIs.
 *
 * Nothing was committed, so it never reached Google. Nothing in the build caught
 * it either - the HTML was well formed, the schema validated, the sitemap
 * aligned. Mojibake is valid UTF-8. It is only wrong to a human.
 *
 * THE REPAIR
 * ----------
 * The damage is a pure function, so it inverts exactly: take the run of
 * Latin-1 / cp1252 characters, encode each back to the single byte it came from,
 * decode the result as UTF-8.
 *
 * The trap is a PARTIALLY corrupted file. data.js held 11 correct baht signs next
 * to 166 broken ones. Round-tripping the whole file would have destroyed the 11
 * good ones, because U+0E3F has no single-byte form. So a run is only rewritten
 * when it (a) starts on a character that is a valid UTF-8 lead byte, (b) is
 * entirely single-byte-encodable, (c) decodes with no replacement character, and
 * (d) actually gets shorter - a real decode always does. Anything else is left
 * exactly as found.
 *
 * Double encoding happens when a mangled file is mangled again; the 2026-07-27
 * build-v2.js had it. repair() runs to a fixed point, up to 4 passes.
 *
 * NOTE ON THIS FILE: it contains no literal mojibake and no literal non-ASCII in
 * any matching position - every character class is written as a \\u escape. A
 * detector that carries corrupt sample text as its own signatures breaks the
 * moment the detector file is itself mangled, which is the exact failure it is
 * supposed to survive. Detection and repair share one definition below: a file is
 * corrupt if and only if repair() would change it.
 */

/* cp1252 code points that differ from Latin-1, in 0x80-0x9F. Windows tools read
   through this table, not Latin-1, so a reverse map that ignores it silently
   fails on every em dash and curly quote - the two most common casualties. */
const CP1252_TO_BYTE = new Map([
  [0x20AC, 0x80], [0x201A, 0x82], [0x0192, 0x83], [0x201E, 0x84], [0x2026, 0x85],
  [0x2020, 0x86], [0x2021, 0x87], [0x02C6, 0x88], [0x2030, 0x89], [0x0160, 0x8A],
  [0x2039, 0x8B], [0x0152, 0x8C], [0x017D, 0x8E], [0x2018, 0x91], [0x2019, 0x92],
  [0x201C, 0x93], [0x201D, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
  [0x02DC, 0x98], [0x2122, 0x99], [0x0161, 0x9A], [0x203A, 0x9B], [0x0153, 0x9C],
  [0x017E, 0x9E], [0x0178, 0x9F]
]);

/* Continuation class: 0x80-0xBF as Latin-1, plus every cp1252 special above. */
const CONT = '\\u0080-\\u00BF' +
  [...CP1252_TO_BYTE.keys()].map(c => '\\u' + c.toString(16).padStart(4, '0')).join('');
/* Lead class: 0xC2-0xF4, the valid UTF-8 multi-byte lead bytes. */
const RUN = new RegExp('[\\u00C2-\\u00F4][' + CONT + ']+', 'g');

function toByte(ch) {
  const c = ch.codePointAt(0);
  if (c <= 0xFF) return c;
  return CP1252_TO_BYTE.get(c);
}

/** Decode one candidate run, or return null if it is not really mojibake. */
function decodeRun(run) {
  const bytes = [];
  for (const ch of run) {
    const b = toByte(ch);
    if (b === undefined) return null;
    bytes.push(b);
  }
  const decoded = Buffer.from(bytes).toString('utf8');
  if (decoded.indexOf('\uFFFD') !== -1) return null;   // not valid UTF-8 underneath
  if (decoded.length >= run.length) return null;       // a real decode always shortens
  return decoded;
}

/** One repair pass. */
function pass(text) {
  return text.replace(RUN, run => {
    const decoded = decodeRun(run);
    return decoded === null ? run : decoded;
  });
}

/** Repair to a fixed point. Handles double and triple encoding. */
function repair(text) {
  let out = text;
  for (let i = 0; i < 4; i++) {
    const next = pass(out);
    if (next === out) break;
    out = next;
  }
  return out;
}

/**
 * How many corrupt runs a string contains, counted the same way repair() finds
 * them, plus any U+FFFD already lost. 0 means clean.
 */
function count(text) {
  let n = 0;
  let work = text;
  for (let i = 0; i < 4; i++) {
    let found = 0;
    work = work.replace(RUN, run => {
      const decoded = decodeRun(run);
      if (decoded === null) return run;
      found++;
      return decoded;
    });
    if (!found) break;
    n += found;
  }
  let i = 0;
  while ((i = text.indexOf('\uFFFD', i)) !== -1) { n++; i += 1; }
  return n;
}

module.exports = { repair, count };
