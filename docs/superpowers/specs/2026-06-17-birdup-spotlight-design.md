# BirdUp Spotlight — Design Spec

**Date:** 2026-06-17
**Author:** Brandyn Britton
**App:** `apps/portfolio` (Astro 5)
**Status:** Approved design, pending spec review

## Goal

Make **BirdUp** stand out as the centerpiece of the portfolio, framed as a
**founder / product builder** credential. BirdUp already has a polished public
marketing site, so the portfolio's job is _not_ to re-pitch the product — it is
to present BirdUp as Brandyn's headline achievement and hand off to that site.

Success looks like: a visitor scanning the homepage immediately understands that
Brandyn designed and shipped a real Australian birding app, and has a clear,
prominent path to go see it.

## Approach (chosen)

**A — Featured "Spotlight" band on the homepage.** A single, visually elevated
section on `index.astro`. Not a dedicated case-study page (deferred to phase 2),
and not just another card in the projects grid.

Rejected alternatives:

- **B (spotlight + `/work/birdup` case study):** more depth, but the polished
  marketing site already covers the deep product pitch, and a case study is thin
  without screenshots. Deferred to phase 2.
- **C (featured card in the projects grid):** smallest change, but it stays
  _inside_ the grid and under-delivers on "stand out."

## Placement & page structure

New section component inserted into `apps/portfolio/src/pages/index.astro`.

New homepage order:

```
Hero → About (01) → ✨ BirdUp Spotlight → Experience (02) → Projects (03) → Contact
```

Rationale: placing it after About means the "I built this" framing lands after
the visitor knows who Brandyn is, and it sits _above_ the employment history so
it reads as the headline achievement. The Spotlight uses a **"Featured" eyebrow
with no number** (unlike the numbered `SectionLabel` used by About/Experience/
Projects), so it visually breaks out of the numbered sequence and reads as
special. The existing 01/02/03 numbering is unchanged.

## Layout & visual treatment

An **elevated panel** (distinct from the flat numbered sections):

- Container: `bg-card`, soft `border`, `rounded-2xl`, generous padding, with a
  subtle teal accent (glow or left-edge accent) so it stands apart from the plain
  sections above and below it.
- Two-column on desktop (`lg:grid-cols-2`), stacked on mobile:
  - **Left column:** "Featured" eyebrow → large serif headline `BirdUp.` (with
    the teal `.` flourish matching the Hero) → founder tagline → pitch paragraph
    → prominent **CTA button** → stack badges.
  - **Right column:** the signature highlights as a clean list, plus a reserved,
    aspect-framed **image slot** (a subtle gradient placeholder for now) so a
    device screenshot can drop in later with no layout rework.
- Entrance animation via the existing `FadeIn` component (`client:visible`).

The CTA is a real **button** (filled or bordered using `@goodpie/ui` `Button`),
deliberately distinct from the text-only links used elsewhere on the site — the
button itself is part of what makes the section stand out.

Matches the existing visual system: Playfair serif headline, Inter body in
`text-muted-foreground`, teal accent (`text-teal`), shadcn `Badge` for stack.

## Content & copy

Initial copy (editable in the data file post-build):

- **Eyebrow:** `Featured · Founder & Engineer`
- **Headline:** `BirdUp.`
- **Tagline:** _An Australian-first birding app I designed and built end to end._
- **Pitch:** "A field notebook and field guide that also scouts what's worth
  looking for nearby. It's an offline-first React Native app on a Rails 8 and
  PostGIS backend, with AI that identifies birds from a photo using the species
  that actually live near you and what's in season. Sensitive species have their
  locations hidden automatically."
- **Highlights (3):**
  - **Works without signal:** log a sighting anywhere, with no connection. It syncs once you're back online.
  - **Location-aware AI:** snap a photo and BirdUp suggests the species, weighing what actually lives near you at that time of year.
  - **Conservation first:** locations of threatened species stay hidden, even from the AI.
- **Stack badges:** `Rails 8` · `PostGIS` · `React Native` · `Expo` · `Next.js` · `WorkOS`
- **CTA:** `Visit BirdUp →`

## Data & components

Follows the existing data-driven convention (`src/data/projects.ts`,
`src/data/experience.ts`): content lives in a typed data file, the component is
presentation only.

### `apps/portfolio/src/data/birdup.ts`

```ts
export interface Highlight {
  title: string;
  description: string;
}

export interface FeaturedProduct {
  name: string; // "BirdUp"
  eyebrow: string; // "Featured · Founder & Engineer"
  tagline: string; // one-line founder framing
  description: string; // pitch paragraph
  highlights: Highlight[];
  stack: string[]; // tech badges
  url: string; // marketing site (CTA target)
  cta: string; // "Visit BirdUp"
}

export const birdup: FeaturedProduct = {
  /* values from Content & copy */
};
```

### `apps/portfolio/src/components/sections/Spotlight.astro`

- Imports `birdup` from `@/data/birdup`, `Section`, `FadeIn`, `Badge`, and
  `Button` from `@goodpie/ui/components/button`.
- Renders the panel layout above. No business logic in the template.
- CTA link: `target="_blank"`, `rel="noopener noreferrer"`, `aria-label`
  (e.g. `Visit the BirdUp website`), teal `focus-visible` ring matching
  `ProjectCard`.

### `apps/portfolio/src/pages/index.astro`

- Import `Spotlight` and render it between `<About />` and `<Experience />`.

## Accessibility

- Semantic `<section>`, single `h2` for the BirdUp headline (preserves heading order).
- Teal `focus-visible` ring on the CTA, matching `ProjectCard`.
- AAA-friendly contrast (dark-mode-first tokens already satisfy this).
- Reuses existing animation components, which already gate on the project's
  motion conventions.

## Out of scope (phase 2)

- `/work/birdup` dedicated case-study page (builder/engineering POV).
- Real device screenshots / mockups in the reserved image slot.
- `SoftwareApplication` / `CreativeWork` structured data via the
  `StructuredData` component — optional nice-to-have, can be added later.

## Assumptions to confirm during review

- **Marketing URL** defaults to `https://birdup.com.au` (inferred from the
  `contact@birdup.com.au` project contact). Confirm or correct — it is a
  one-line change in `birdup.ts`.
- **Role label** "Founder & Engineer" and **no timeframe** in the eyebrow.
  A timeframe (e.g. "2025 — Present") can be added if desired.
- Public product name is **"BirdUp"** (docs also use "BirdUp Australia").
