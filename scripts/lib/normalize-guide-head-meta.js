/**
 * normalize-guide-head-meta.js — Single-pass repair for guide <title> / OG / Twitter / breadcrumb entities.
 */

function decodeAmpChain(s) {
  let prev;
  let out = String(s);
  do {
    prev = out;
    out = out.replace(/&amp;/g, '&');
  } while (out !== prev);
  return out;
}

function escMeta(s) {
  return decodeAmpChain(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripTags(s) {
  return String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function truncateDesc(s, max = 155) {
  const plain = decodeAmpChain(s).trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trimEnd();
}

function buildDescFromLede(html) {
  const ledes = [];
  const re = /<p class="hero-lede"[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = re.exec(html))) {
    const t = stripTags(m[1]);
    if (t) ledes.push(t);
  }
  return truncateDesc(ledes.join(' '));
}

function applyMetaDescription(html, desc) {
  const esc = escMeta(desc);
  let next = html;
  next = next.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${esc}"`);
  next = next.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${esc}"`);
  next = next.replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${esc}"`);
  return next;
}

function normalizeGuideHeadMeta(html) {
  let next = html;
  const descMatch = next.match(/<meta name="description" content="([^"]+)"/);
  if (descMatch && (descMatch[1].endsWith('...') || descMatch[1].includes('&amp;amp'))) {
    const fromLede = buildDescFromLede(next);
    const fallback = decodeAmpChain(descMatch[1]).replace(/\.\.\.$/, '').trim();
    const desc = fromLede.length >= 100 ? fromLede : truncateDesc(`${fallback} Hand-checked Pattaya.Gym guide.`);
    next = applyMetaDescription(next, desc);
  }
  next = next.replace(/<title>([^<]*)<\/title>/i, (m, t) => {
    const plain = decodeAmpChain(t).replace(/\s*\|\s*Pattaya\.Gym\s*$/i, '').trim();
    return `<title>${escMeta(plain)} | Pattaya.Gym</title>`;
  });
  next = next.replace(/<meta\s+property="og:title"\s+content="([^"]*)"/gi, (_, c) => `<meta property="og:title" content="${escMeta(c)}"`);
  next = next.replace(/<meta\s+name="twitter:title"\s+content="([^"]*)"/gi, (_, c) => `<meta name="twitter:title" content="${escMeta(c)}"`);
  next = next.replace(/(font-weight:600;">)([^<]*(?:&amp;)+[^<]*)(<\/span><\/nav>)/g, (m, pre, text, post) => {
    if (!text.includes('&amp;amp')) return m;
    return pre + decodeAmpChain(text).replace(/&/g, '&amp;') + post;
  });
  return next;
}

module.exports = { normalizeGuideHeadMeta, decodeAmpChain, escMeta };
