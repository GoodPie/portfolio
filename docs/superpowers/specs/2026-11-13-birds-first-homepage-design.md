# Birds-first homepage: design

**Date:** 2026-11-13
**App:** `apps/portfolio` (Astro 7)
**Status:** Approved as written by Brandyn, 2026-11-13
**Visual reference:** `2026-11-13-birds-first-homepage-mock.html` (next to this file, light theme). It is a throwaway mock that hotlinks images. Use it for look and layout, not as code to keep. Where the mock and this document differ (nav targets, caption contents), this document wins.

## Calls made without Brandyn

These were decided by Claude while writing this up. Each is marked again where it appears. Brandyn can overturn any of them.

1. No place names in photo captions.
2. Photo names and titles are hand-edited for the homepage, not copied verbatim from the gallery.
3. The three BirdUp screens are used exactly as birdup.com.au already publishes them, including the one that shows a suburb and a street map.
4. The default page title, meta description, `llms.txt` opening line and social card are in scope.
5. Homepage photos are linked from the gallery's storage, not copied into the portfolio.
6. The whole Astro app goes light, not just the homepage (see Theme scope).
7. Motion is done in CSS, not with the Motion library, and is limited to the list under Look. Added 2026-11-13 after Brandyn asked for motion back.

## Why

The homepage reads as AI-made. It uses the stock dark portfolio kit (near-black, one teal accent, Playfair over Inter, untouched shadcn tokens), repeats the same decorations, fades everything in, shows no pictures, and half its copy is résumé-speak. Nothing on it is something only Brandyn could have made.

The page has two audiences, in this order:

1. Birders looking at BirdUp.
2. Other engineers.

## Goals

- The first screen shows Brandyn's own bird photograph and a plain first-person intro.
- A birder can reach BirdUp (both stores and the site) and the photo gallery without reading any engineering content.
- An engineer can jump straight to how BirdUp is built, then writing, open source and work history.
- Every element carries content. Nothing is there for decoration.
- The homepage renders fully with JavaScript off and ships no React islands.

## Non-goals

- Changing the photography gallery. It stays dark.
- Rewriting blog posts or restructuring the blog layouts.
- A BirdUp case study page.
- A dark mode or a theme toggle.
- Self-hosting fonts.
- Pulling homepage photos from the CMS automatically.

## Anti-goals

- Swapping one template for another (for example cream paper with a serif and a terracotta accent).
- Wearing BirdUp's brand: no Fraunces, Outfit, BirdUp green or its botanical illustrations.
- Copy that could sit on anyone's site.
- Shipping placeholder copy or bracketed captions.

## Approaches considered

1. **Strip and restock.** Keep the page order and dark theme, delete the tells, add real screenshots. Smallest job, but birders still get one section of a developer CV.
2. **Birds first (chosen).** One page ordered for a birder that gets deeper for an engineer. Chosen because it serves the priority audience first and the first screen is something no template produces.
3. **BirdUp's maker page.** Adopt BirdUp's look outright. Rejected because a personal site would be wearing a product's brand.

Light versus dark was decided by looking at the mock in both. **Light** was chosen: BirdUp's app screens are light and sit naturally on it, it matches where birders arrive from, and dark with one accent is the look being left behind.

This replaces the panel from `2026-06-17-birdup-spotlight-design.md`. That spec's principle stays: the portfolio introduces BirdUp and hands off to birdup.com.au, it does not re-pitch the product.

## The page, top to bottom

| #   | Section                        | Content                                                                                                                                        |
| --- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Masthead                       | Name as the `h1` at normal text size. Plain text nav: BirdUp (anchor), Photos (`/photography`), Writing (`/blog`), GitHub, Email.              |
| 2   | Opening                        | Left: the intro sentence set large, then a short line with a jump link to section 5. Right: the lead photo with a caption.                     |
| 3   | BirdUp (`#birdup`)             | Heading, two-sentence blurb, links to App Store, Google Play and birdup.com.au, one fact line, three app screens each with a one-line caption. |
| 4   | From the field (`#field`)      | Four photos with their gallery titles, each linking to its gallery page. "All photos" link to `/photography`.                                  |
| 5   | How BirdUp is built (`#built`) | Stack on one line, then three short notes.                                                                                                     |
| 6   | Writing (`#writing`)           | Posts from `src/data/posts.ts`, newest first, as month and year plus title.                                                                    |
| 7   | Open source                    | Projects from `src/data/projects.ts` as name plus one line. Sits beside Writing on wide screens.                                               |
| 8   | Work                           | Three rows: years, role, company (linked). No descriptions.                                                                                    |
| 9   | Footer                         | Email address, GitHub, LinkedIn as text links.                                                                                                 |

The old About and Contact sections go. The intro carries what About said, and the footer replaces Contact.

### Photo captions

Lead photo caption: common name, scientific name in italics, then the photo's title. A second data line gives month and year, focal length, aperture, shutter speed and ISO.

- **Names and titles are hand-edited (Claude's call).** Use correct spelling and sentence case, as in the mock: "Willie Wagtail", "Bombastic side-eye", "Pelican fountain". The gallery's own records differ ("Willie-Wagtale", "Nankeen Night-Heron", title case) and fixing them in the CMS is outside this work.
- **No place names or coordinates in captions or in `photos.ts` (Claude's call).** The gallery stores a `geolocation` field and it stays out of the homepage.
- **This rule does not cover the BirdUp screens (Claude's call).** The logged-sighting screen shows "Morley" and a street-level map with a pin, and the explore screen is a local map. Both are already public on birdup.com.au, so they are used as they are unless Brandyn asks for different screens.

## Look

Tokens for the light theme. Map them onto the existing shadcn token names inside the portfolio's own `src/styles/global.css` so prose and any shared component keep working. Do not edit `packages/ui/src/styles/globals.css`, because the gallery reads it.

| Role              | Value     | Token it maps to                   |
| ----------------- | --------- | ---------------------------------- |
| Page background   | `#f6f7f4` | `--background`                     |
| Text              | `#15181a` | `--foreground`                     |
| Secondary text    | `#575d61` | `--muted-foreground`               |
| Hairline rules    | `#d7dad3` | `--border`                         |
| Links             | `#1f45c9` | `--primary`, `--ring`              |
| Image placeholder | `#e8eae4` | `--card`, `--muted`, `--secondary` |

- **Type:** Literata (optical size axis, weights 400 and 500, italic 400) for all reading text and headings. IBM Plex Mono 400 at about 12.5px for data only: dates, years, the stack line, camera settings. Loaded from Google Fonts the same way the current fonts are.
- **Sizes:** body 18px on 1.55 line height. Intro `clamp(1.7rem, 3.1vw, 2.7rem)` on 1.18. Section headings 1.6rem at weight 500.
- **Layout:** max width 1240px, side padding `clamp(20px, 5vw, 56px)`, a hairline rule above each section, grids as in the mock, one column below about 860px.
- **Links:** blue and underlined inside text. In the nav and in lists they are text-coloured and underline or turn blue on hover.
- **Images:** square corners, no borders, no shadows.
- **Motion:** a little, in CSS only. Changed on 2026-11-13 during the build: Brandyn asked for motion and animation back "for a little flair". The original line here was "none". What moves, and how, is Claude's call:
  - On load, once: the intro text rises and the lead photo fades up, staggered, in under a second.
  - On scroll: the three app screens and the four field photos come forward as their row enters the screen, each a little after the last. This uses native scroll-driven animation, so browsers without it show the pictures in place.
  - On hover or keyboard focus: a photo leans in slightly inside its frame.
  - Between pages of the Astro app: a cross-fade, where the browser supports cross-document view transitions.
  - Rules that keep it from sliding back to the old page: no JavaScript and no React islands for motion, nothing is hidden when animation is unsupported, all of it is off under `prefers-reduced-motion` and in print, text outside the opening never animates on its own (a caption travels with its picture), and every animation lives in one gated block in `global.css`.
- **Not used anywhere:** cards, badges, icons, section numbers, uppercase tracked labels, accent full stops, gradients, glows.

## Theme scope (decision to confirm)

`BaseLayout.astro` sets `class="dark"` for the whole Astro app, and the blog index, posts and 404 page share it and `global.css`.

**Default in this design:** the whole Astro app goes light. The blog and 404 keep their layouts and only pick up the new tokens and fonts. The work outside the homepage is limited to:

- removing `class="dark"` from `<html>` in `BaseLayout.astro`, so the shared `.dark` token block stops applying;
- moving the prose colour mapping from `.prose-invert` to `.prose` and dropping `prose-invert` in `BlogLayout.astro`;
- replacing the hard-coded `--tw-prose-lead: oklch(0.985 0 0 / 80%)`, which would leave each post's first paragraph near-white on the light background;
- removing `FadeIn` from `blog/index.astro` and `404.astro`;
- replacing the teal classes in `404.astro` with the link colour;
- checking every shadcn token the portfolio still reads has a light value, for example `--primary-foreground` on the skip link.

Reason: "Writing" on the homepage links straight to the blog, and a light page that opens dark posts is a visible seam. It also avoids keeping two themes in one app.

**Alternative:** homepage only, through a theme prop on `BaseLayout`. Smaller blast radius, but two themes to maintain and the seam stays.

## Data and content

- **`src/data/photos.ts` (new).** A hand-picked list: gallery photo id, title, common name, scientific name, date, camera settings, alt text, and image URLs. Dates, scientific names, camera settings and image URLs are copied once from the gallery's public API at `/photography/api/photos/<id>?depth=1`. Names and titles are hand-edited (see Photo captions). Alt text is written by hand, because the gallery has no alt field. Starting picks, all replaceable: lead photo 29 (Willie Wagtail), then 5 (Tawny Frogmouth), 13 (New Holland Honeyeater), 44 (Australian Pelican), 24 (Nankeen Night Heron).
  - Photo 5 has no camera settings recorded. That is fine in the four-photo row, which shows titles only, but it cannot become the lead photo without them.
  - Photo 44 is a JPEG served through the gallery's API route, not a WebP on the blob host like the other four. Use the `www.brandynbritton.com` URL so it does not redirect.
- **Photo files (Claude's call).** Plain `<img>` with `srcset` pointing at the sizes the gallery already stores (card 800, large 1200, xl 1800), with width and height set. No image pipeline in the portfolio. Known ceiling: if a photo is deleted or replaced in the CMS, the homepage image breaks until `photos.ts` is updated.
- **BirdUp screens.** Three PNGs committed under `apps/portfolio/src/assets/birdup/` and rendered with Astro's `<Image>`. Use the three in the mock: a logged sighting, a species page, the explore map. The sources are in `~/development/birdup/birdup-api/Birdup-Web/apps/marketing/public/screenshots/` at 1206 by 2622 and about 1.1 to 1.4 MB each, so they must be resized on build.
- **`src/data/birdup.ts`.** Reshaped to what the section uses: name, blurb, fact line, three links, stack, three build notes. The eyebrow, tagline and CTA fields go.
- **`src/data/experience.ts`.** Keeps years, role, company and URL. Description and technologies go.
- **`src/data/projects.ts`.** Descriptions shortened to one plain line each. `llms.txt.ts` reads `description`, so the field stays.
- **BirdUp facts.** "850+ species" and "free on iOS and Android" come from birdup.com.au. Store links: `https://apps.apple.com/au/app/birdup-australia/id6760929876` and `https://play.google.com/store/apps/details?id=com.birdup.mobile`.

### Copy

All new wording is a draft for Brandyn to rewrite or approve before it ships: the intro sentence, the jump line, the BirdUp blurb, the three build notes, the six project one-liners, the photo names, titles and alt text in `photos.ts`, and the meta copy below. Screen captions reuse headings from birdup.com.au.

Rules for any copy written for this page: first person, specific, no em dashes, no résumé verbs ("spearheaded", "orchestrated", "crafting"), no "intersection of", no "let's build something together".

## What gets deleted

- Section components: `About`, `Contact`, `Experience`, `Projects`, `Spotlight`, and the current `Hero`.
- `ExperienceItem`, `ProjectCard` and `SectionLabel`, which only the deleted sections import, and `SocialLinks`, which nothing imports today.
- All six components in `src/components/animations/`, and the `motion` dependency once nothing imports it. The motion that came back later (see Look) is plain CSS and needs neither.
- `.motion-fade-in`, `.motion-line-reveal` and `pulse-glow` in `global.css`.
- Icon components nothing imports afterwards. `ArrowLeftIcon` stays for the blog.
- The `@source` line for `packages/ui` components, if the portfolio no longer imports any of them.

## What stays

The structure of the `BaseLayout` head and its SEO tags, `StructuredData` and `personSchema`, the skip link, the analytics tag, the sitemap, the blog, the 404 page, and `TreeCanvas` in the MTree post (React stays for it). Set `theme-color` to the new background.

## Meta copy and social card (Claude's call that these are in scope)

What people see when the link is shared still carries the old look and wording, so it changes with the page:

- **Default title and description in `BaseLayout.astro`.** The title is "Brandyn Britton | Software Engineer" and the description says "crafting delightful experiences", which the copy rules here ban. Both get rewritten to match the intro, and Brandyn approves them with the rest of the copy.
- **`llms.txt.ts`.** It opens with the same description line, and its "Home" line still lists about, experience, projects and contact sections. Update both.
- **`public/og-image.png`.** It is the dark, teal, Playfair card. Replace it with a 1200 by 630 card in the new look: the lead photo with the name in Literata. Made once and committed, not generated on build. The new card ships as `public/social-card.png`, because link previews are cached by URL and the old address would keep showing the old card.

## Accessibility and performance

- One `h1` (the name), an `h2` per section, real alt text on every photo, captions in `figcaption`.
- Text and link contrast at least 4.5:1 on the background, including secondary text.
- Lead photo loads eagerly with high fetch priority. Everything else loads lazily. Width and height on every image.
- No horizontal scroll at 375px.

## Left to the builder

Component breakdown, Tailwind utilities versus plain CSS, exact `srcset` and `sizes` values, how the three app screens behave on a phone, whether `Section.astro` survives, and how many posts to list before adding an "All writing" link (suggest eight).

## Done when

- `npm run check`, `npm run lint` and `npx turbo run build --filter=@goodpie/portfolio` pass.
- The built homepage contains no `astro-island` elements.
- The homepage has been viewed at 375, 768 and 1440 wide and matches the mock's layout.
- The blog index, one post with code blocks, the MTree post with the 3D tree, and the 404 page have been viewed in the light theme.
- `/photography` looks the same as before.
- Brandyn has approved the copy, and no bracketed placeholders remain.
