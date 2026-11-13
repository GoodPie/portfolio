# Birds-First Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dark, animated, CV-shaped homepage of `apps/portfolio` with a light, static page that leads with Brandyn's bird photography and BirdUp, then goes deeper for engineers.

**Architecture:** The Astro app switches to a light theme by overriding shadcn tokens in its own stylesheet and dropping the `dark` class, so the blog and 404 follow without layout changes. The homepage becomes seven small `.astro` sections fed by typed data files, with no React islands. One dependency-free Node script asserts the built HTML against the spec.

**Tech Stack:** Astro 7, Tailwind CSS 4 (`@tailwindcss/vite`), `astro:assets` `<Image>`, Node `assert`. No new dependencies. `motion` is removed.

**Spec:** `docs/superpowers/specs/2026-11-13-birds-first-homepage-design.md`. Visual reference: `docs/superpowers/specs/2026-11-13-birds-first-homepage-mock.html`. Where they differ, the spec wins.

## Global Constraints

- Tokens: background `#f6f7f4`, text `#15181a`, secondary text `#575d61`, rules `#d7dad3`, links `#1f45c9`, image placeholder `#e8eae4`.
- Type: Literata (opsz axis, 400, 500, italic 400) for all reading text and headings. IBM Plex Mono 400 at 12.5px for data only (dates, years, stack, camera settings).
- The mock uses an 18px root, the app keeps 16px. Translated sizes: body `18px/1.55`, intro `clamp(1.9rem, 3.1vw, 3rem)` on 1.18 line height, section headings `1.8rem` at weight 500, captions `1rem`, nav `17px`.
- Layout: max width 1240px, side padding `clamp(20px, 5vw, 56px)`, hairline rule above each section, one column below 860px (`min-[860px]:` variants).
- Do not edit `packages/ui/src/styles/globals.css` or anything under `apps/photography`.
- Homepage ships no `astro-island`. No entrance animations, no hover transforms.
- Not used on the homepage: cards, badges, icons, section numbers, uppercase tracked labels, accent full stops, gradients, glows, rounded image corners, borders or shadows on images.
- Copy rules: first person, specific, no em dashes, no "spearheaded", "orchestrated", "crafting", "intersection of", "let's build something together". One exception from Brandyn's saved preference: his existing date ranges keep their form, for example `2025 — PRESENT`. The mock's "2025 to now" is not used.
- No place names or coordinates in captions or in `photos.ts`.
- All new copy below is draft. It ships only after Brandyn approves it in Task 6.
- Commits end with `Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>`.
- Run commands from `apps/portfolio` unless a step says otherwise.

## Review Focus

1. A gallery photo is deleted or renamed in the CMS, and the homepage shows a broken image. Expected: a check fails before deploy. Pinned by `photos-reachable` (Task 1, run in Task 6).
2. A 375px phone. Three app screens and long post titles must not cause horizontal scroll. Pinned by the `scrollWidth` step in Tasks 3, 4 and 6.
3. A photo with no camera settings (photo 5 today). Expected: the data line is omitted, not rendered blank. Pinned by `no-empty-data` (Task 1, turns green in Task 3).
4. Blog posts in the light theme. The first paragraph, inline code and code blocks must stay readable. Pinned by `blog-light` plus the viewing step in Task 2.
5. The link is shared and the preview still shows the old dark card or the word "crafting". Pinned by `og-size` and `copy-rules` (Task 1, turn green in Task 5).

## File Structure

Paths here and in the tasks are relative to `apps/portfolio` unless they start with `docs/` or name the repo root.

| File                                                                                 | Responsibility                                                         |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `scripts/check-home.mjs` (new)                                                       | Asserts the built site against the spec.                               |
| `src/styles/global.css`                                                              | Light tokens, fonts, prose mapping, four shared classes.               |
| `src/layouts/BaseLayout.astro`                                                       | No `dark` class, new `main` wrapper, `theme-color`, default meta copy. |
| `src/components/Section.astro`                                                       | Rule, padding, optional `id` and `title`.                              |
| `src/data/photos.ts` (new)                                                           | Lead photo and four field photos.                                      |
| `src/data/birdup.ts`                                                                 | BirdUp blurb, links, screens, stack, build notes.                      |
| `src/data/experience.ts`, `src/data/projects.ts`                                     | Trimmed to what the lists render.                                      |
| `src/assets/birdup/*.png` (new)                                                      | Three app screens.                                                     |
| `src/components/sections/{Opening,BirdUp,Field,Built,Writing,OpenSource,Work}.astro` | One per page section.                                                  |
| `src/pages/index.astro`                                                              | Masthead, the sections in order, footer.                               |
| `public/og-image.png`                                                                | New social card.                                                       |

---

### Task 1: Branch and the failing check

**Files:**

- Create: `apps/portfolio/scripts/check-home.mjs`
- Modify: `apps/portfolio/package.json` (scripts)

**Interfaces:**

- Produces: `npm run check:home` (builds, then runs the script). The script prints one `PASS` or `FAIL` line per named check and exits 1 if any failed. `--online` adds `photos-reachable`. Later tasks refer to checks by these names: `theme-light`, `no-islands`, `one-h1`, `anchors`, `image-attrs`, `lead-eager`, `links-out`, `copy-rules`, `no-empty-data`, `writing-cap`, `blog-light`, `og-size`, `photos-reachable`.

- [ ] **Step 1: Branch from main**

Run from the repo root: `git fetch origin && git checkout -b feat/birds-first-homepage origin/main`
The untracked spec, mock and plan come along. Leave the unrelated deleted texture and `.playwright-mcp/` alone.

- [ ] **Step 2: Write the check**

```js
// apps/portfolio/scripts/check-home.mjs
// ponytail: regex over built HTML, no test framework. Move to a real runner if the site grows more checks.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const html = read("dist/index.html");
const body = html.slice(html.indexOf("<body"));
const text = body.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ");
const imgs = body.match(/<img\b[^>]*>/g) ?? [];
let failed = false;
const check = async (name, fn) => {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (e) {
    failed = true;
    console.log(`FAIL ${name}: ${e.message}`);
  }
};

await check("theme-light", () => assert.ok(!/<html[^>]*class="[^"]*\bdark\b/.test(html)));
await check("no-islands", () => {
  assert.ok(!html.includes("<astro-island"));
  assert.ok(!html.includes("motion-fade-in"));
  assert.ok(!read("dist/blog/index.html").includes("<astro-island"));
});
await check("one-h1", () => assert.equal((body.match(/<h1\b/g) ?? []).length, 1));
await check("anchors", () => {
  for (const id of ["birdup", "field", "built", "writing"])
    assert.ok(body.includes(`id="${id}"`), id);
  assert.ok(body.includes('href="#built"'), "jump link");
});
await check("image-attrs", () => {
  assert.ok(imgs.length >= 8, `lead + 3 screens + 4 field photos, got ${imgs.length}`);
  for (const img of imgs)
    for (const a of ['alt="', "width=", "height="]) assert.ok(img.includes(a), `${a} on ${img}`);
  assert.ok(
    imgs.every((i) => !/alt=""/.test(i)),
    "empty alt",
  );
});
await check("lead-eager", () => {
  assert.ok(
    /fetchpriority="high"/.test(imgs[0]) && !/loading="lazy"/.test(imgs[0]),
    "lead is eager",
  );
  assert.ok(/srcset=/.test(imgs[0]) && /sizes=/.test(imgs[0]), "lead is responsive");
  assert.ok(
    imgs.slice(1).every((i) => /loading="lazy"/.test(i)),
    "the rest are lazy",
  );
});
await check("links-out", () => {
  for (const href of [
    "https://apps.apple.com/au/app/birdup-australia/id6760929876",
    "https://play.google.com/store/apps/details?id=com.birdup.mobile",
    "https://birdup.com.au",
    'href="/photography"',
    'href="/blog"',
    "mailto:contact@brandynbritton.com",
  ])
    assert.ok(body.includes(href), href);
});
await check("copy-rules", () => {
  assert.ok(
    !text.replace(/\d{4} — (\d{4}|present)/gi, "").includes("—"),
    "em dash outside a date range",
  );
  for (const banned of [
    /crafting/i,
    /intersection of/i,
    /spearhead/i,
    /orchestrat/i,
    /let's build something/i,
    /\[place/i,
  ])
    assert.ok(!banned.test(html), String(banned));
});
await check("no-empty-data", () => assert.ok(!/class="[^"]*\bdata\b[^"]*"[^>]*>\s*</.test(body)));
await check("writing-cap", () =>
  assert.ok((body.match(/href="\/blog\/[^"]+"/g) ?? []).length <= 8),
);
await check("blog-light", () => {
  assert.ok(!read("dist/blog/git-worktrees-multiple-branches/index.html").includes("prose-invert"));
  const css = read("src/styles/global.css");
  assert.ok(!css.includes("prose-invert") && !css.includes("0.985 0 0 / 80%"));
});
await check("og-size", () => {
  const png = readFileSync(new URL("../dist/og-image.png", import.meta.url));
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1200, 630]);
});
if (process.argv.includes("--online"))
  await check("photos-reachable", async () => {
    const urls = imgs.flatMap((i) => i.match(/https:\/\/[^\s",]+/g) ?? []);
    assert.ok(urls.length >= 5, "no remote photo URLs found");
    for (const u of new Set(urls)) assert.ok((await fetch(u, { method: "HEAD" })).ok, u);
  });
process.exit(failed ? 1 : 0);
```

Add to `package.json` scripts: `"check:home": "astro build && node scripts/check-home.mjs"`.

- [ ] **Step 3: Run it and confirm it fails**

Run: `npm run check:home`
Expected: exit 1. `FAIL` for `theme-light`, `no-islands`, `anchors`, `image-attrs`, `lead-eager`, `links-out`, `copy-rules`, `blog-light`. If `og-size` passes, note the current card's size.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers apps/portfolio/scripts/check-home.mjs apps/portfolio/package.json
git commit -m "test(portfolio): add built-homepage check and birds-first design docs"
```

---

### Task 2: Light theme and type across the Astro app

**Files:**

- Modify: `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/layouts/BlogLayout.astro`, `src/pages/blog/index.astro`, `src/pages/404.astro`, `src/components/Section.astro`

**Interfaces:**

- Produces, in `global.css` under `@layer components`:
  - `.data`: IBM Plex Mono, 12.5px, line height 1.5, `--muted-foreground`.
  - `.textlink`: `--primary`, underlined, 1px thick, offset 0.18em, 2px thick on hover.
  - `.listlink`: `--foreground`, same underline, `--primary` on hover.
  - `.section-title`: 1.8rem, weight 500, letter spacing -0.01em, 1rem bottom margin.
- Produces: `Section.astro` with `Props { id?: string; title?: string; class?: string }`. Root is `<section>` with `border-border border-t py-[clamp(40px,6vw,72px)]` plus `class`. Renders `<h2 class="section-title">` when `title` is set, then the slot.
- Produces: `<main>` in `BaseLayout` is `mx-auto min-h-screen max-w-[1240px] px-[clamp(20px,5vw,56px)] pb-24`.

- [ ] **Step 1: `global.css`**
  - Replace the Google Fonts import with Literata (`ital,opsz,wght@0,7..72,400;0,7..72,500;1,7..72,400`) and IBM Plex Mono (`wght@400`).
  - In `@theme inline`: `--font-serif: "Literata", Georgia, serif;` and `--font-mono: "IBM Plex Mono", ui-monospace, monospace;`. Delete `--font-sans`.
  - After the shared import, add a `:root` block: `--background`, `--popover`, `--primary-foreground` = `#f6f7f4`; `--foreground`, `--card-foreground`, `--popover-foreground`, `--secondary-foreground`, `--accent-foreground` = `#15181a`; `--card`, `--secondary`, `--muted`, `--accent` = `#e8eae4`; `--muted-foreground` = `#575d61`; `--border`, `--input` = `#d7dad3`; `--primary`, `--ring` = `#1f45c9`.
  - `body`: `font-serif antialiased text-[18px] leading-[1.55]`.
  - Rename `.prose-invert` to `.prose`. Set `--tw-prose-lead` and `--tw-prose-code` to `var(--foreground)`.
  - Delete `.motion-fade-in`, `.motion-line-reveal`, the `pulse-glow` keyframes and class. Keep the `@source` line for now (Task 4 removes it).
  - Add the four classes from Interfaces.

- [ ] **Step 2: Layouts and pages**
  - `BaseLayout.astro`: remove `class="dark"` from `<html>`, set `theme-color` to `#f6f7f4`, set the `<main>` classes from Interfaces. Leave the default title and description for Task 5.
  - `Section.astro`: implement the Interfaces signature.
  - `BlogLayout.astro`: remove `prose-invert` from the class list.
  - `blog/index.astro`: replace each `<FadeIn …>` wrapper with a `<div>` carrying the same `className` value as `class`. Remove the import.
  - `404.astro`: remove the four `FadeIn` wrappers and the import. `4<span class="text-teal">0</span>4` becomes `404`. The button's `bg-teal text-background hover:bg-teal/90` becomes `bg-primary text-primary-foreground hover:bg-primary/90`. Add `border-t-0` to its `Section` class.

- [ ] **Step 3: Run the check**

Run: `npm run check:home`
Expected: `PASS theme-light`, `PASS blog-light`. `no-islands` still fails on the homepage only.

- [ ] **Step 4: Look at the blog and 404**

Run `npm run dev` and view `/blog`, `/blog/git-worktrees-multiple-branches`, `/blog/reviving-modular-tree` and `/does-not-exist` at 1440 and 375 wide.
Expected: light background, Literata, readable first paragraph, inline code and code blocks, the 3D tree renders, no teal, no horizontal scroll. The homepage is expected to look wrong until Task 4.

- [ ] **Step 5: Commit**

```bash
git add apps/portfolio/src
git commit -m "feat(portfolio): switch the Astro app to the light theme and Literata"
```

---

### Task 3: Birder half (masthead, opening, BirdUp, field photos)

**Files:**

- Create: `src/data/photos.ts`, `src/assets/birdup/sighting.png`, `species-seasonal.png`, `explore.png`, `src/components/sections/Opening.astro`, `BirdUp.astro`, `Field.astro`
- Modify: `src/data/birdup.ts`, `src/pages/index.astro`
- Delete: `src/components/sections/Hero.astro`, `About.astro`, `Spotlight.astro`

**Interfaces:**

- Consumes: `.data`, `.textlink`, `.listlink`, `.section-title`, `Section` from Task 2.
- Produces in `photos.ts`:

```ts
export interface Photo {
  id: number; // gallery id, links to /photography/photo/<id>
  name: string;
  scientificName: string;
  title: string;
  alt: string;
  taken: string;
  settings?: string; // omitted when the gallery has none
  width: number; // of the xl file
  height: number;
  files: { card: string; large: string; xl: string }; // 800w, 1200w, 1800w
}
export const srcset: (p: Photo) => string; // "<card> 800w, <large> 1200w, <xl> 1800w"
export const lead: Photo;
export const field: Photo[];
```

- Produces in `birdup.ts`:

```ts
export interface BirdUp {
  name: string;
  blurb: string;
  fact: string;
  links: { label: string; href: string }[];
  screens: { image: ImageMetadata; alt: string; caption: string }[];
  stack: string[];
  notes: { title: string; body: string }[];
}
export const birdup: BirdUp;
```

- [ ] **Step 1: `photos.ts`**

File URLs: blob photos are `https://gia6op4yj3pmmws8.public.blob.vercel-storage.com/<stem>-<W>x<H>.webp`. Photo 44 is `https://www.brandynbritton.com/photography/api/photos/file/<stem>-<W>x<H>.jpg`.

|       | id  | name                   | scientificName               | title                             | taken    | settings                           | stem                          | card, large, xl               |
| ----- | --- | ---------------------- | ---------------------------- | --------------------------------- | -------- | ---------------------------------- | ----------------------------- | ----------------------------- |
| lead  | 29  | Willie Wagtail         | Rhipidura leucophrys         | Bombastic side-eye                | Mar 2026 | 600mm · f/6.3 · 1/800s · ISO 1600  | `DSC05476-2`                  | 800x533, 1200x800, 1800x1200  |
| field | 5   | Tawny Frogmouth        | Podargus strigoides          | Tired Tawny Frogmouth             | Feb 2026 | none                               | `DSC04228-Topaz-Gigapixel-4X` | 800x608, 1200x912, 1800x1368  |
| field | 13  | New Holland Honeyeater | Phylidonyris novaehollandiae | New Holland Honeyeater, screaming | Mar 2026 | 467mm · f/6.3 · 1/1000s · ISO 2500 | `DSC02410`                    | 800x533, 1200x800, 1800x1200  |
| field | 44  | Australian Pelican     | Pelecanus conspicillatus     | Pelican fountain                  | Mar 2026 | 400mm · f/6.3 · 1/800s · ISO 4000  | `ROT07425`                    | 800x533, 1200x800, 1800x1200  |
| field | 24  | Nankeen Night Heron    | Nycticorax caledonicus       | Spying on a Nankeen Night Heron   | Mar 2026 | 600mm · f/6.3 · 1/800s · ISO 5000  | `DSC05631-2`                  | 800x800, 1200x1200, 1800x1800 |

Write each `alt` after opening the photo: the bird and what it is doing, under 125 characters, no "photo of".

- [ ] **Step 2: BirdUp screens and data**

Copy `sighting.png`, `species-seasonal.png` and `explore.png` from `~/development/birdup/birdup-api/Birdup-Web/apps/marketing/public/screenshots/` into `src/assets/birdup/`. Rewrite `birdup.ts` to the interface with these values:

- `blurb`: "A field notebook and field guide for Australian birds that also scouts what's worth looking for nearby. It works without reception, and it hides the locations of threatened species."
- `fact`: "850+ species · free on iOS and Android"
- `links`: App Store `https://apps.apple.com/au/app/birdup-australia/id6760929876`, Google Play `https://play.google.com/store/apps/details?id=com.birdup.mobile`, birdup.com.au `https://birdup.com.au`
- `screens` captions, in order sighting, species, explore: "Log the bird while it's still on the branch." / "Every species page tells you whether it's here this month." / "See what other birders found nearby." Alts: "A logged Willie Wagtail sighting in BirdUp" / "The Rainbow Bee-eater species page in BirdUp" / "The explore map in BirdUp showing nearby sightings"
- `stack`: unchanged from today.
- `notes`: "Offline first" / "Sightings save on the phone and sync when it has signal again." Then "Photo ID that knows where it is" / "Suggestions are weighted by the species that occur near you that month." Then "Threatened species stay hidden" / "Their locations are obscured automatically, even from the AI."

- [ ] **Step 3: Sections and page**

Build to match the mock's first three blocks:

- `index.astro`: a masthead `<header>` with `<h1>` "Brandyn Britton" at 17px weight 500 and a nav of BirdUp `#birdup`, Photos `/photography`, Writing `/blog`, GitHub `https://github.com/Goodpie`, Email `mailto:contact@brandynbritton.com`, with a bottom rule. Then `<Opening />`, `<BirdUp />`, `<Field />`. Keep the old `<Experience />`, `<Projects />`, `<Contact />` below for now. Keep `StructuredData`.
- `Opening.astro`: grid `5fr 7fr` from 860px. Left: intro paragraph "I photograph birds around Perth and built BirdUp, a birding app for Australia. On weekdays I write software at Healthengine." with `.textlink` on BirdUp (`#birdup`) and Healthengine (`https://healthengine.com.au`), then "Birds come first on this page. If you're here for the engineering, skip to how BirdUp is built." with the last five words linking to `#built`. Right: `<figure>` with the lead `<img>` (`src` xl, `srcset`, `sizes="(max-width: 860px) 100vw, 680px"`, `width`, `height`, `fetchpriority="high"`, no `loading`) linking to `/photography/photo/29`. Caption: name, scientific name in `<em>`, title in secondary colour, then a `.data` line of `taken` and `settings` joined by " · ", rendered only when there is something to show.
- `BirdUp.astro`: `<Section id="birdup">`, grid `4fr 8fr` from 860px. Left: title, blurb, the three links as `.textlink`, the fact as `.data`. Right: the three screens with `<Image widths={[240, 480]} sizes="(max-width: 860px) 62vw, 240px" />`, three columns from 860px. Below 860px the row is a horizontal scroller (`flex overflow-x-auto snap-x`, each figure `w-[62vw] max-w-[260px] shrink-0 snap-start`).
- `Field.astro`: `<Section id="field">` with a heading row of "From the field" and an "All photos" `.textlink` to `/photography`. Four figures, two columns below 860px and four above, each `<img>` cropped with `aspect-[3/2] object-cover`, `src` card, `srcset`, `sizes="(max-width: 860px) 50vw, 280px"`, `loading="lazy"`, linking to its gallery page, title as caption.

Delete `Hero.astro`, `About.astro`, `Spotlight.astro`.

- [ ] **Step 4: Run the checks**

Run: `npm run check && npm run check:home`
Expected: `astro check` clean. `PASS one-h1`, `image-attrs`, `lead-eager`, `no-empty-data`. `anchors` fails on `built` and `writing` only. `no-islands` still fails (old sections).

- [ ] **Step 5: Look at it**

View `/` at 1440 and 375 next to the mock. In the console at 375: `document.documentElement.scrollWidth <= innerWidth` is `true`.

- [ ] **Step 6: Commit**

```bash
git add -A apps/portfolio/src
git commit -m "feat(portfolio): open the homepage with bird photos and BirdUp"
```

---

### Task 4: Engineer half and removing the old page

**Files:**

- Create: `src/components/sections/Built.astro`, `Writing.astro`, `OpenSource.astro`, `Work.astro`
- Modify: `src/pages/index.astro`, `src/data/experience.ts`, `src/data/projects.ts`, `src/styles/global.css`, `apps/portfolio/package.json`, `CLAUDE.md` (repo root)
- Delete: `src/components/sections/Experience.astro`, `Projects.astro`, `Contact.astro`, `src/components/ExperienceItem.astro`, `ProjectCard.astro`, `SectionLabel.astro`, `SocialLinks.astro`, `src/components/animations/` (all six), `src/components/icons/` except `ArrowLeftIcon.astro`

**Interfaces:**

- Consumes: `birdup.stack`, `birdup.notes` (Task 3), `posts` from `src/data/posts.ts`, the Task 2 classes and `Section`.
- Produces: `Experience { dateRange: string; title: string; company: string; companyUrl: string }` and `Project { name: string; description: string; url: string }`. `llms.txt.ts` keeps reading `name`, `url`, `description`.

- [ ] **Step 1: Trim the data**

`experience.ts`: drop `id`, `description`, `technologies`. Keep the three rows and their `dateRange` strings exactly as they are. `projects.ts`: drop `id` and `technologies`, order and descriptions as follows:

1. Rails Active MCP: "Ruby gem that gives AI agents safe, audited access to the Rails console."
2. Buildkite Notifier: "macOS menu bar app that watches CI builds."
3. Flagr OpenFeature Provider: "JavaScript OpenFeature provider for OpenFlagr."
4. Modular Tree: "Procedural tree generator for Blender 5, a fork of MTree."
5. GameMaker Server: "Python multiplayer server for GameMaker: Studio."
6. Frogs and Bee: "Date ideas, recipes and calendars for couples."

- [ ] **Step 2: Sections and page**

Match the lower half of the mock:

- `Built.astro`: `<Section id="built" title="How BirdUp is built">`, the stack joined by " · " as `.data`, the three notes in three columns from 860px (title at weight 500, body in secondary colour).
- `Writing.astro`: `<div id="writing">` with the title, then posts sorted newest first, `.slice(0, 8)`. Each row is a `.data` date from `toLocaleDateString("en-AU", { month: "short", year: "numeric" })` and the title as `.listlink` to `/blog/<slug>`, with a bottom rule. When there are more than eight posts, add an "All writing" `.textlink` to `/blog`.
- `OpenSource.astro`: `<div>` with the title, each project as a `.listlink` name over its description in secondary colour at 16px.
- `Work.astro`: `<Section title="Work">`, three rows of `dateRange` as `.data`, `title`, and `company` as `.listlink`. Grid `8rem 1fr 1fr` from 860px, stacked below.
- `index.astro`: replace the three old sections with `<Built />`, a `<Section>` holding `<Writing />` and `<OpenSource />` in a `7fr 5fr` grid from 860px, `<Work />`, and a `<footer>` with a top rule holding `contact@brandynbritton.com` (mailto), GitHub and LinkedIn (`https://linkedin.com/in/brandyn-britton`) as `.textlink`.

- [ ] **Step 3: Delete what nothing uses**

Delete the files listed above. Run from the repo root: `npm uninstall motion -w @goodpie/portfolio`. Remove the `@source "../../../../packages/ui/src/components";` line and its comment from `global.css`.

Run from the repo root: `grep -rnE "teal|motion/react|animations/|@goodpie/ui/components" apps/portfolio/src`
Expected: no output.

- [ ] **Step 4: Update `CLAUDE.md`**

In the `apps/portfolio` part: the homepage has no React islands and React remains only for the 3D tree in the MTree post, the section list is Opening, BirdUp, Field, Built, Writing, OpenSource, Work, the theme is light with tokens overridden in `apps/portfolio/src/styles/global.css`, fonts are Literata and IBM Plex Mono, homepage photos come from `src/data/photos.ts`, and `npm run check:home` checks the built page. Dark-mode-first now describes the gallery only. Replace "No test runner or linter is configured."

- [ ] **Step 5: Run the checks**

Run: `npm run check && npm run lint && npm run check:home`
Expected: clean, and every check passes except `copy-rules` (the meta description still says "crafting") and `og-size` if the old card is a different size.

- [ ] **Step 6: Look at it**

View `/` at 1440, 768 and 375 next to the mock. At 375: `document.documentElement.scrollWidth <= innerWidth` is `true`. Disable JavaScript and reload: the page looks the same.

- [ ] **Step 7: Commit**

```bash
git add -A apps/portfolio/src apps/portfolio/package.json CLAUDE.md package-lock.json
git commit -m "feat(portfolio): add the engineering half and remove the old homepage"
```

Do not use `git add -A apps/portfolio`. It would stage the unrelated deleted texture under `public/willow_tree/`.

---

### Task 5: Meta copy and social card

**Files:**

- Modify: `src/layouts/BaseLayout.astro`, `src/pages/llms.txt.ts`, `public/og-image.png`
- Temporary, never committed: `src/pages/og-card.astro`

- [ ] **Step 1: Meta copy**

`BaseLayout.astro` defaults: title "Brandyn Britton | Birds, BirdUp and software", description "I photograph birds around Perth, Western Australia, and built BirdUp, a birding app for Australia. I also write about software." In `llms.txt.ts`, the quoted line under the heading becomes the same description, and the Home line becomes "Bird photography, BirdUp, how it is built, writing, open source and work history".

- [ ] **Step 2: Make the card**

Create `src/pages/og-card.astro`: a 1200 by 630 page with no layout chrome. The lead photo's xl file fills the top 480px with `object-fit: cover`. Below it a 150px band in `#f6f7f4` holds "Brandyn Britton" in Literata 500 at 44px on the left and "Birds, BirdUp and software" in IBM Plex Mono at 18px in `#575d61` on the right, with 56px side padding. No gradients or overlays.

Run `npm run dev`, open `http://localhost:4300/og-card` in a browser sized to exactly 1200 by 630, wait for fonts and the photo, and save a screenshot over `public/og-image.png`. With the Playwright MCP that is `browser_resize` to 1200 by 630, `browser_navigate`, then `browser_take_screenshot` to a file. Then delete `src/pages/og-card.astro`.

- [ ] **Step 3: Run the check**

Run: `npm run check:home`
Expected: exit 0, every line `PASS`. Confirm `dist/og-card/` does not exist.

- [ ] **Step 4: Commit**

```bash
git add apps/portfolio/src apps/portfolio/public/og-image.png
git commit -m "feat(portfolio): match meta copy and social card to the new homepage"
```

---

### Task 6: Full verification and copy sign-off

- [ ] **Step 1: Run everything**

From the repo root: `npm run check && npm run lint && npx turbo run build --filter=@goodpie/portfolio`
Then in `apps/portfolio`: `node scripts/check-home.mjs --online`
Expected: all clean, every check `PASS` including `photos-reachable`.

- [ ] **Step 2: Confirm the gallery is untouched**

Run from the repo root: `git diff --stat origin/main -- packages apps/photography`
Expected: no output.

- [ ] **Step 3: View every page**

With `npm run preview`: `/` at 375, 768 and 1440 against the mock, `/blog`, one post with code blocks, the MTree post, and a 404. No horizontal scroll at 375 on any of them.

- [ ] **Step 4: Copy sign-off**

Give Brandyn one list of every draft string with its file: the intro and jump line (`Opening.astro`), blurb, fact and notes (`birdup.ts`), six project lines (`projects.ts`), five photo names, titles and alts (`photos.ts`), and the title and description (`BaseLayout.astro`, `llms.txt.ts`). Apply his edits, rerun `npm run check:home`, and commit. Do not merge before he has approved the list.
