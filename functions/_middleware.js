/**
 * functions/_middleware.js - host-specific noindex for the preview deployment.
 * Approved 2026-07-29.
 *
 * https://pattayagym.pages.dev/ serves the entire site, returns 200, and sends no
 * X-Robots-Tag. Its pages self-canonical to pattaya-gym.com, which helps, but a
 * canonical is a hint and not a deindex instruction - a full duplicate of 355
 * pages on a crawlable hostname is a duplicate-content surface we do not need.
 * robots.txt cannot fix it either: disallowing a URL prevents crawling, not
 * indexing. Only an HTTP X-Robots-Tag: noindex reliably removes it.
 *
 * _headers cannot express "this header, but only on that hostname", so this is
 * the one thing in the repo that has to run at request time.
 *
 * DESIGN RULE: this must never be able to take the site down. It awaits the
 * static response first and only ever adds a header to it. Every failure path
 * returns the untouched response, so the worst case is the preview host staying
 * indexable - exactly where we are today - and never a broken production page.
 *
 * The production hostnames are hardcoded. Anything else - pages.dev, a branch
 * preview, a future staging alias - is treated as not-production and marked
 * noindex, which is the safe default direction.
 */

const PRODUCTION_HOSTS = new Set(['pattaya-gym.com', 'www.pattaya-gym.com']);

export async function onRequest(context) {
  const response = await context.next();
  try {
    const host = new URL(context.request.url).hostname.toLowerCase();
    if (PRODUCTION_HOSTS.has(host)) return response;

    const tagged = new Response(response.body, response);
    tagged.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return tagged;
  } catch (err) {
    // A header is never worth failing a request over.
    return response;
  }
}
