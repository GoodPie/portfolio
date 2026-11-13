// ponytail: regex over built HTML, no test framework. Move to a real runner if the site grows more checks.
/* eslint-disable no-console -- the PASS/FAIL lines are this script's output */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

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
// Motion is allowed, but only as CSS inside the one reduced-motion gate in global.css
await check("motion-gated", () => {
  const css = read("src/styles/global.css").replace(/\/\*[\s\S]*?\*\//g, "");
  const start = css.indexOf("@media (prefers-reduced-motion: no-preference)");
  assert.ok(start >= 0, "no reduced-motion gate in global.css");
  let end = start;
  for (let i = css.indexOf("{", start), depth = 0; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) {
      end = i + 1;
      break;
    }
  }
  const inside = css.slice(start, end);
  const outside = css.slice(0, start) + css.slice(end);
  assert.ok(/animation:/.test(inside), "the gate holds no animation");
  assert.ok(
    !/animation|transition|@keyframes|scroll-behavior|scroll-smooth/.test(outside),
    "motion outside the reduced-motion gate",
  );
  assert.ok(
    inside.indexOf("animation-timeline") > inside.indexOf("@supports (animation-timeline: view())"),
    "scroll-driven animation needs its @supports guard",
  );
  // The build's minifier has folded animation-timeline into the animation shorthand before,
  // which browsers throw away. It has to survive as its own declaration.
  const built = readdirSync(new URL("../dist/_astro/", import.meta.url))
    .filter((f) => f.endsWith(".css"))
    .map((f) => read(`dist/_astro/${f}`))
    .join("");
  assert.ok(/animation-timeline:\s*--arrive/.test(built), "animation-timeline lost in the build");
  for (const name of ["rise", "develop", "arrive", "lean"])
    assert.ok(
      new RegExp(`class="[^"]*\\b${name}\\b`).test(body),
      `.${name} is not used on the page`,
    );
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
await check("no-empty-data", () =>
  assert.ok(!/class="(?:[^"]*\s)?data(?:\s[^"]*)?"[^>]*>\s*</.test(body)),
);
await check("writing-cap", () =>
  assert.ok((body.match(/href="\/blog\/[^"]+"/g) ?? []).length <= 8),
);
await check("blog-light", () => {
  assert.ok(!read("dist/blog/git-worktrees-multiple-branches/index.html").includes("prose-invert"));
  const css = read("src/styles/global.css");
  assert.ok(!css.includes("prose-invert") && !css.includes("0.985 0 0 / 80%"));
  // A long inline code string (the Kamal post has one) must wrap, not widen the page on a phone
  assert.ok(
    /:not\(pre\) > code\)[^}]*overflow-wrap: anywhere/.test(css),
    "inline code can overflow",
  );
});
await check("og-size", () => {
  const png = readFileSync(new URL("../dist/og-image.png", import.meta.url));
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1200, 630]);
});
if (process.argv.includes("--online"))
  await check("photos-reachable", async () => {
    const urls = imgs.flatMap((i) => i.match(/https:\/\/[^\s",]+/g) ?? []);
    assert.ok(urls.length >= 5, "no remote photo URLs found");
    // GET, not HEAD: the gallery's API file route answers HEAD with a 404
    for (const u of new Set(urls)) assert.ok((await fetch(u)).ok, u);
  });
process.exit(failed ? 1 : 0);
