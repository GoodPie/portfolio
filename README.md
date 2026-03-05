# brandynbritton.com

Personal portfolio and photography gallery, split across two apps in a Turborepo monorepo.

## What's in here

```
apps/
  portfolio/      Astro 5 + React 19 — the main site at brandynbritton.com
  photography/    Next.js 16 + Payload CMS 3 — photo gallery at /photography

packages/
  ui/             Shared shadcn/ui components, theme tokens, utilities
  tsconfig/       Shared TypeScript configs
```

**Portfolio** is a mostly-static Astro site with React islands where interactivity is needed (a 3D willow tree, some UI components). Content like projects and experience entries live as typed data files rather than a CMS.

**Photography** is a full gallery app backed by Payload CMS. Photos are stored in Vercel Blob, metadata (EXIF, bird species, camera/lens info) is extracted on upload, and the whole thing runs against Supabase Postgres. It serves as a microfrontend mounted under `/photography` on the portfolio.

## Getting started

You'll need Node 24+ and npm.

```bash
npm install
npm run dev        # starts both apps (portfolio on 4300, photography on 4400)
```

The photography app needs a few environment variables to talk to its database and blob storage — check `apps/photography/.env.example` if one exists, or look at `payload.config.ts` for what's expected (`DATABASE_URL`, `PAYLOAD_SECRET`, `BLOB_READ_WRITE_TOKEN`). Sighting maps require a Mapbox token via `NEXT_PUBLIC_MAPBOX_TOKEN`. Error monitoring uses Sentry — source map uploads require `SENTRY_AUTH_TOKEN`.

## Common commands

```bash
npm run build              # build everything
npm run check              # type-check all apps
npm run lint               # lint all apps
npm run format             # format with prettier

# target a single app
npx turbo run dev --filter=@goodpie/portfolio
npx turbo run dev --filter=@goodpie/photography
```

## Tech stack

|           | Portfolio                | Photography              |
| --------- | ------------------------ | ------------------------ |
| Framework | Astro 5                  | Next.js 16 (App Router)  |
| UI        | React 19, Tailwind CSS 4 | React 19, Tailwind CSS 4 |
| CMS       | —                        | Payload CMS 3.75.0       |
| 3D        | React Three Fiber        | —                        |
| Maps      | —                        | Mapbox GL JS             |
| Monitoring| —                        | Sentry                   |
| Database  | —                        | Supabase PostgreSQL      |
| Storage   | —                        | Vercel Blob              |
| Build     | Turborepo                | Turborepo                |
