# Photography

A white-label photography gallery built with [Next.js 16](https://nextjs.org/) and [Payload CMS 3](https://payloadcms.com/). Deployed as a microfrontend under `/photography` within the portfolio monorepo.

## Prerequisites

- Node.js 20+
- PostgreSQL database (e.g. [Supabase](https://supabase.com/))
- (Optional) [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) token for image storage

## Quickstart

### 1. Install dependencies

From the monorepo root:

```sh
npm install
```

### 2. Configure environment

```sh
cp .env.example .env.local
```

Fill in the required values:

| Variable                | Required | Description                                                                                                                         |
| ----------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`          | Yes      | PostgreSQL connection string                                                                                                        |
| `PAYLOAD_SECRET`        | Yes      | Random string, 32+ characters (`openssl rand -base64 32`)                                                                           |
| `BLOB_READ_WRITE_TOKEN` | No       | Vercel Blob token. Omit for local disk storage                                                                                      |
| `NEXT_PUBLIC_SITE_URL`  | No       | Public URL of your site (e.g. `https://example.com`). Defaults to `http://localhost:3024`. Used in sitemap, robots.txt, and JSON-LD |
| `NEXT_PUBLIC_GA_ID`     | No       | Google Analytics measurement ID (e.g. `G-XXXXXXXXXX`). Omit to disable tracking                                                     |
| `CRON_SECRET`           | No       | Secret for Vercel Cron job auth (`openssl rand -base64 32`). Required for automated quality scoring in production                    |

The remaining API keys (`E_BIRD_API_KEY`, `AI_GATEWAY_API_KEY`, etc.) are used for bird data enrichment and AI quality scoring, and are optional for basic operation.

### 3. Run database migrations

```sh
npx payload migrate
```

### 4. Start the dev server

```sh
# From monorepo root (starts all apps)
npm run dev

# Or just the photography app
npx turbo run dev --filter=@goodpie/photography
```

The app runs at [http://localhost:3024/photography](http://localhost:3024/photography) and the admin panel at [http://localhost:3024/photography/admin](http://localhost:3024/photography/admin).

### 5. Create your admin user

Visit `/photography/admin` and follow the prompt to create your first user account.

### 6. Configure site branding

Navigate to **Site Settings** in the admin panel. All branding and page content is managed here:

| Tab              | Fields                                                                         |
| ---------------- | ------------------------------------------------------------------------------ |
| **Branding**     | Site title, author name, meta description, Twitter handle, portfolio back-link |
| **Gallery Page** | Hero headline, hero subtitle, about section (left/right columns)               |
| **Birds Page**   | Subtitle text                                                                  |

Every field has a sensible default. On a fresh deploy the app works out of the box — customize as needed.

## Scripts

All commands run from `apps/photography/`:

```sh
npm run dev              # Start dev server (port 4400)
npm run build            # Generate types + production build
npm run start            # Start production server
npm run check            # TypeScript type check
npm run generate:types   # Regenerate payload-types.ts
npm run lint             # ESLint
npm run test             # Vitest
```

## Project Structure

```
app/
  (app)/                 # Frontend routes
    layout.tsx           # Root layout (nav, footer, GA)
    page.tsx             # Gallery homepage
    birds/               # Life list + species detail pages
    photo/[id]/          # Individual photo pages
  (payload)/             # Payload admin panel + API routes
  sitemap.ts
  robots.ts
collections/             # Payload collection configs
globals/
  SiteSettings.ts        # CMS-managed branding & content
components/
  admin/                 # Payload admin UI overrides
lib/
  payload.ts             # Payload client + cached queries
  site-config.ts         # getSiteConfig() — merges CMS + env vars
migrations/              # Database migrations
payload.config.ts        # Payload CMS config
```

## AI Quality Scoring

Photos are automatically scored by Gemini 3 Flash Vision across four dimensions:

| Dimension | Weight | Measures |
| --- | --- | --- |
| Technical | 20% | Sharpness (eye/feather detail), exposure, noise, dynamic range |
| Composition | 30% | Framing, background quality, rule of thirds, negative space |
| Subject Impact | 30% | Behavior, pose quality, eye contact, emotional response |
| Uniqueness | 20% | Unusual moment/angle/lighting, rarity of captured behavior |

Each dimension is scored 0–100, and a weighted **overall** score determines gallery sort order. An AI-generated note explains the assessment.

### How it works

1. **On upload**: The `processUploadData` hook queues a `scorePhoto` job via Payload Jobs
2. **Job processing**: A Vercel Cron calls `/photography/api/payload-jobs/run` every minute to process queued jobs
3. **Scoring**: The job sends the `large` (1200w) image + EXIF context to Gemini 3 Flash Vision and stores structured scores on the photo document
4. **Gallery sort**: The gallery page sorts by `qualityScores.overall` descending, with unscored photos appended at the end

### Scoring existing photos

Open any photo in the admin panel and click the **Score Photo** button in the sidebar. This queues and runs the scoring job immediately.

### Requirements

- `AI_GATEWAY_API_KEY` — Vercel AI Gateway key (also used by bird-lookup)
- `CRON_SECRET` — secures the jobs endpoint for Vercel Cron (production only)

### Vercel Cron setup

The `vercel.json` in this app configures a cron job that runs every minute (requires Vercel Pro plan). Set `CRON_SECRET` in your Vercel project environment variables — Vercel automatically sends it as a `Bearer` token in the `Authorization` header.

## White-Label Architecture

The app is fully white-labellable with zero code changes:

- **Environment variables** control infrastructure: site URL, analytics ID, API keys
- **SiteSettings CMS global** controls all branding and page content
- **`getSiteConfig()`** merges both into a single typed `SiteConfig` object, cached for 60s via `unstable_cache`

No author name, URL, social handle, or page copy is hardcoded in any frontend component.

## Deployment

The app is designed for [Vercel](https://vercel.com/) but works on any platform that supports Next.js.

Set the environment variables in your hosting provider's dashboard. The database migration runs automatically as part of `npm run build` via Payload's build hook, or can be triggered manually with `npx payload migrate`.
