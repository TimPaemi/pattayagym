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

function normalizeGuideHeadMeta(html) {
  let next = html;
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
