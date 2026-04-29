# Contributing

This repo is a live production static site. Treat generated output, URLs, and data shape as production contracts.

## Setup

```cmd
npm install
npm run validate
npm run build
npm run serve
```

Open `http://localhost:8080/`.

## Required Checks

Run these before every PR or direct push:

```cmd
npm run validate
npm run build
npm run html:validate
```

For JavaScript changes, also run targeted syntax checks:

```cmd
node --check build.js
node --check build-extras.js
node --check build-discovery.js
node --check data.js
```

The build must print:

```text
Generated 158 venue pages (158 deep + 0 stubs)
```

## Conventions

- Keep existing URLs stable. Do not rename venue IDs, category keys, guide slugs, or area slugs.
- Keep `data.js` field names stable: `id`, `name`, `category`, `area`, `address`, `phone`, `website`, `social`, `hours`, `priceRange`, `description`, `tags`, `mapsUrl`, `verified`.
- Add fields only when the existing consumers tolerate them.
- Keep generated output committed with the source change that produced it.
- Do not add frontend frameworks or external asset CDNs.
- Use British English in editorial body copy unless quoting an official name.
- Preserve SEO metadata, schema blocks, canonical URLs, FAQ content, and internal links.
- Never fabricate venue facts, testimonials, reviews, opening hours, prices, or contact details.

## Generated Files

The build writes:

- `gyms/<id>/index.html`
- `category/<key>/index.html`
- `area/<slug>/index.html`
- `guides/<slug>/index.html`
- utility pages such as `search/`, `map/`, `favorites/`, `plan-my-trip/`, `find-my-coach/`
- `sitemap.xml`
- `feed.xml` and `feed/*.xml`
- `404.html`
- `robots.txt`

If a generated diff looks unrelated, run `npm run build` again. Builds should be idempotent.

## Pull Request Template

Use this structure in PR descriptions:

```md
## Summary
- 

## Files Changed
- 

## Verification
- [ ] npm run validate
- [ ] npm run build
- [ ] npm run html:validate
- [ ] Spot-checked affected page(s)
- [ ] Lighthouse run or reason not needed

## SEO / Accessibility Impact
- 

## Risks / Follow-ups
- 
```

## Review Checklist

- Source and generated files are both present.
- No unrelated generated churn.
- No URL/slug changes.
- No venue count hardcoding.
- Validation exits 0.
- Build exits 0 and produces 158 deep pages.
- Any new links are crawlable and intentional.
- Any new UI has keyboard focus states and mobile tap targets.
