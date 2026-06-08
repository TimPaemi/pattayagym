/**
 * Shared breadcrumb + footer site links for tool pages (compare, plan, favorites).
 */
function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toolBreadcrumb(items) {
  const parts = items.map((it, i) => {
    const isLast = i === items.length - 1;
    if (isLast) return `<span class="u-text-bold">${esc(it.label)}</span>`;
    return `<a href="${it.href}" class="u-muted">${esc(it.label)}</a>`;
  });
  return `<nav aria-label="Breadcrumb" class="site-breadcrumb">${parts.join(' <span class="u-crumb-sep">/</span> ')}</nav>`;
}

function toolSiteFooterCol() {
  return `<div class="footer-col"><div class="footer-col-h">// The site</div><ul>
        <li><a href="/about/">About</a></li>
        <li><a href="/methodology/">Methodology</a></li>
        <li><a href="/guides/">Guides</a></li>
        <li><a href="/sports/">All sports</a></li>
        <li><a href="/search/">Search</a></li>
        <li><a href="/favorites/">Favorites</a></li>
        <li><a href="/compare/">Compare</a></li>
        <li><a href="/plan-my-trip/">Plan trip</a></li>
        <li><a href="/changelog/">Changelog</a></li>
      </ul></div>`;
}

module.exports = { esc, toolBreadcrumb, toolSiteFooterCol };
