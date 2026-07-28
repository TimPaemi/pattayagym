# Schema Reference

This site uses JSON-LD to help search engines understand the directory, venue pages, guides, breadcrumbs, and FAQ content. Preserve existing schema unless a change is clearly required and tested.

## Global Site Schema

Most pages include:

- `WebSite` for the Pattaya Gym brand and search target.
- `BreadcrumbList` where a page has a logical hierarchy.
- `ItemList` on index, category, area, and guide pages listing relevant venue URLs.
- `FAQPage` when page FAQs are rendered.

## Venue Page Schema

Every generated venue page should include a primary local-business-style block with:

- `@context: "https://schema.org"`
- `@type` chosen from the category mapping below.
- `name`
- `description`
- `url` for the Pattaya Gym page.
- `image` pointing to the per-venue OG image.
- `telephone` when known.
- `sameAs` entries when official website/social links are known.
- `priceRange` mapped from baht tiers to dollar-sign tiers.
- `address` as `PostalAddress`.
- `geo` as `GeoCoordinates`.
- `openingHoursSpecification` when the hours parser can produce structured values.

Venue geo coordinates currently use the Pattaya centroid placeholder when exact coordinates are unavailable. Treat this as an editorial TODO, not proof of exact location.

## Category To Schema Mapping

The build maps venue categories to the closest available Schema.org type:

| Category | Primary schema type | Notes |
|---|---|---|
| `muay-thai` | `SportsActivityLocation` | Add `SportsClub` service context where relevant. |
| `fitness` | `ExerciseGym` / `HealthClub` | Use the more specific local type when available. |
| `crossfit` | `ExerciseGym` | CrossFit affiliation should be verified in content, not assumed by schema. |
| `golf` | `GolfCourse` | Use for courses and golf resorts; simulators can remain local business/sports location. |
| `yoga` | `HealthAndBeautyBusiness` | Yoga-specific schema is limited, so content should carry the detail. |
| `racquet` | `SportsActivityLocation` | Tennis, padel, pickleball, badminton, squash. |
| `watersports` | `SportsActivityLocation` | Dive operators, kitesurfing, sailing, wakeboarding. |
| `swimming` | `SportsActivityLocation` | Pools, water parks, public swimming areas. |
| `climbing` | `SportsActivityLocation` | Indoor climbing and bouldering. |
| `clubs` | `SportsClub` | Running, rugby, cricket, archery, social sport clubs. |
| `kids-youth` | `SportsActivityLocation` | Youth academies; avoid `School` unless the venue is actually a school. |
| `equestrian` | `SportsActivityLocation` | Riding schools, polo, equestrian resorts. |
| `adventure` | `SportsActivityLocation` | Karting, skydiving, zipline, shooting, tours. |

## Service Schema

Relevant venue pages can include service-style details for what the venue offers. Examples:

- Muay Thai training.
- Gym membership.
- Golf green fees.
- Dive certification.
- Yoga classes.
- Kids' sport coaching.

Use service schema to clarify offerings, not to invent bookable products.

## FAQ Schema

FAQ schema should match visible FAQ content on the page. Do not add FAQ JSON-LD for questions that are not rendered.

Rules:

- Keep answers concise and factual.
- Avoid promotional claims.
- Include local context when useful.
- Do not include prices or opening hours unless the source is current.

## Breadcrumbs

Use stable URL hierarchy:

- Home -> category -> venue.
- Home -> area -> venue where an area page is the source context.
- Home -> guides -> guide.
- Home -> utility page.

Generated venue pages currently use the category hierarchy as the primary breadcrumb.

## Item Lists

Use `ItemList` for pages that present multiple venues:

- Homepage directory.
- Category pages.
- Area pages.
- Guide pages.
- Search-like generated utilities when the listed recommendations are static.

Each item should include position, name, and URL.

## Social Metadata

Open Graph and Twitter card metadata are not Schema.org, but they must stay aligned with schema:

- `og:url` matches canonical URL.
- `og:image` matches the root or per-venue OG image.
- `twitter:image` should match `og:image`.
- Per-venue images live at `/og/<venue-id>.png`.

## Testing

Use these checks after schema changes:

```cmd
npm run validate
npm run build
```

Then parse generated JSON-LD blocks locally or use Google's Rich Results Test on representative live URLs after deploy:

- Homepage.
- One venue page.
- One category page.
- One guide page.

Schema changes should not reduce indexability, remove canonical URLs, or break visible FAQ parity.
