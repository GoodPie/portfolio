# Photography App - Complete Feature Audit

## 1. PAYLOAD CMS COLLECTIONS

### Users Collection
- **Auth**: Yes (auth: true)
- **Access**: 
  - Read: Authenticated only
  - Create: Admin only
  - Update: Admin only
  - Delete: Admin only
- **Fields**:
  - `role` (select, default: "editor"): Admin | Editor [admin-only field]

### Photos Collection (Main Content)
- **Upload Config**:
  - Image sizes: thumbnail (400w), card (800w), large (1200w), xl (1800w), full (2400w)
  - Focal point & crop support enabled
  - Admin thumbnail: thumbnail
  - MIME types: image/*
- **Access**:
  - Read: Public
  - Create/Update/Delete: Authenticated users
- **Fields**:
  - `title` (text, required): Photo title
  - `caption` (text): Short caption
  - `description` (textarea): Full description
  - `location` (text): Where photo was taken
  - `dateTaken` (date): Date captured
  - `category` (relationship → categories): Single category
  - `bird` (relationship → birds): Single bird species
  - `camera` (relationship → cameras): Camera body used
  - `lens` (relationship → lenses): Lens used
  - `exif` (group, read-only, auto-populated):
    - focalLength (number): e.g., 500
    - aperture (number): e.g., 5.6
    - shutterSpeed (number): e.g., 0.002 (1/500s)
    - iso (number): e.g., 3200
    - lensModel (text): Extracted from EXIF
    - cameraModel (text): Extracted from EXIF
  - `lqip` (text, read-only, sidebar): Data URI blur placeholder (10x10 WebP)
  - `isProtected` (checkbox, default: true, sidebar): Requires auth for full-res download
  - `price` (number, sidebar, conditional on isProtected): For future ecommerce
- **Hooks**:
  - `afterRead`: stripFullResolution (hides full-res from public API)
  - `afterChange`: generateBlurPlaceholder (creates LQIP), extractExifData (parses EXIF)

### Birds Collection
- **Access**:
  - Read: Public
  - Create/Update/Delete: Authenticated
- **Fields**:
  - `name` (text, required): Common name (e.g., "Blue Jay")
  - `scientificName` (text): Latin name (e.g., "Cyanocitta cristata")
  - `habitat` (textarea): Where it lives
  - `diet` (textarea): What it eats
  - `conservationStatus` (select): Least Concern | Near Threatened | Vulnerable | Endangered | Critically Endangered
  - `facts` (array):
    - `fact` (text, required): Individual fun fact
  - `coverImage` (upload → photos): Photo to represent species

### Categories Collection
- **Access**: Public read, authenticated create/update/delete
- **Fields**:
  - `title` (text, required): Category name (e.g., "Landscapes", "Portraits")
  - `slug` (text, required, unique): URL-safe identifier (e.g., "landscapes")
  - `description` (textarea): Category description

### Cameras Collection
- **Access**: Public read, authenticated create/update/delete
- **Fields**:
  - `name` (text, required): Camera model (e.g., "Canon EOS R5")
  - `manufacturer` (text): Make (e.g., "Canon")

### Lenses Collection
- **Access**: Public read, authenticated create/update/delete
- **Fields**:
  - `name` (text, required): Lens model (e.g., "RF 100-500mm F4.5-7.1 IS USM")
  - `manufacturer` (text): Make (e.g., "Canon")

## 2. GLOBALS

### SiteSettings Global
- **Access**: Public read, admin update
- **Fields**:
  - `title` (text, required, default: "Photography | Brandyn Britton")
  - `description` (textarea, default: "A personal photography collection...")
  - `heroImage` (upload → photos): Featured hero image

## 3. FRONTEND ROUTES & PAGES

### Root Layout (`app/(app)/layout.tsx`)
- Metadata template: "%s | Photography | Brandyn Britton"
- Navigation bar (sticky, dark mode):
  - Logo: "Brandyn Britton." with teal dot
  - "Photography" text label
  - Link back to portfolio (https://brandynbritton.com)
- Main container: max-w-7xl, responsive padding
- Footer: copyright year
- Dark mode HTML with `data-scroll-behavior="smooth"`

### Photo Gallery Page (`app/(app)/page.tsx`)
- **Metadata**: title "Gallery"
- **Hero Section**:
  - Label: "Photography" (small caps)
  - Heading: "Mostly birds." (serif, with teal dot)
  - Subheading: "Sometimes landscapes. Occasionally something else entirely."
- **Data Loading**:
  - Server-side: fetches all photos (100 limit), depth: 1, sorted by `-dateTaken`
  - Transforms photos to PhotoCard format
  - Builds filter options (categories & birds with counts)
  - Revalidates every 60 seconds (ISR)
- **Features**:
  - Masonry grid layout (CSS columns: 1 sm:2 md:3)
  - View Transitions on photo cards
  - Hover effects: blur siblings, show EXIF overlay
  - Filtering by bird & category (client-side, URL-synced)
  - Empty state if no photos

### Photo Detail Page (`app/(app)/photo/[id]/page.tsx`)
- **Metadata**: Dynamic OG image, Twitter card (summary_large_image)
- **Description Building**:
  - Photo caption/title
  - Photo description
  - Bird name + scientific name
  - Category
  - Location (prefixed with "Taken in")
- **Layout** (grid on desktop, stacked on mobile):
  - Left/top: PhotoSidebar (sticky on lg)
    - Title (caption or title)
    - Category + date
    - Bird info (if present)
    - Photo details (location, date, description)
    - Camera/EXIF details
    - Image dimensions
  - Right/bottom: Photo image
    - Responsive srcset (capped at xl/1800w)
    - LQIP blur placeholder
    - View Transition name for animation
    - Alt text
    - Fetchpriority: high
- **Bird Info Display** (BirdInfo component):
  - Name + scientific name (italic)
  - Habitat, diet, conservation status (color-coded)
  - Location & date taken
  - Array of fun facts (bulleted list)
  - Conservation status colors:
    - "Least Concern": safe (blue)
    - "Near Threatened": warning (orange)
    - "Vulnerable": caution (amber)
    - "Endangered": danger (red)
    - "Critically Endangered": critical (dark red)
- **JSON-LD Structured Data** (PhotoJsonLd):
  - Schema.org Photograph type
  - Author/creator as Person (Brandyn Britton)
  - EXIF data as PropertyValue array
  - Bird metadata as Thing
  - Category as genre
  - Location and dimensions

## 4. CLIENT COMPONENTS

### GalleryShell (Client Component)
- **Props**:
  - allCards: PhotoCard[]
  - categories: FilterOption[]
  - birds: FilterOption[]
  - initialCategory: string | null
  - initialBird: string | null
- **Features**:
  - Local state for active filters
  - useMemo to filter cards based on active category/bird
  - Syncs filters to URL (replaceState, no navigation)
  - Supports clearing all filters
  - Empty states: no photos, no matches for filters
  - Shows FilterBar only if options exist
- **Filtering Logic**: AND logic (must match all active filters)

### PhotoGrid (Client Component)
- **Props**: photos: PhotoCard[]
- **Features**:
  - CSS columns masonry layout (1 sm:2 md:3)
  - Aspect ratio preserved via style prop
  - Next.js Image with custom loader for Payload sizes
  - Lazy loading (priority for first 2 images)
  - LQIP blur placeholder
  - Hover effects:
    - Current photo: normal
    - Other photos: blur-sm scale-98
    - Overlay appears: semi-transparent black (bg-black/50)
    - Shows EXIF overlay on hover
  - ExifOverlay displays:
    - Photo title/caption (large, white)
    - Formatted EXIF: "500mm · f/5.6 · 1/500s · ISO 3200"
    - Lens model (smallest text)
  - View Transitions on card enter/exit (photo-filter animation)

### FilterBar (Presentation Component)
- **Props**:
  - categories: FilterOption[]
  - birds: FilterOption[]
  - activeCategory: string | null
  - activeBird: string | null
  - onFilterChange: (key, value) => void
  - onClearAll: () => void
- **Features**:
  - Two FilterGroups: Category & Bird
  - Each group shows "All" (default) + individual options
  - Options display count (e.g., "Landscape 12")
  - Active filter highlighted (default variant)
  - Toggle behavior: click active = deselect
  - "Clear all filters" link shows if any filters active

### PhotoSidebar (Presentation Component)
- **Props**: photo: PhotoDoc
- **Displays**:
  - Title (caption or title)
  - Category + date (if present)
  - Bird section (if bird relation exists):
    - BirdInfo subcomponent with full details
  - Photo details section (if no bird or has other details):
    - Description
    - Location (2-col grid)
    - Date taken (2-col grid)
  - Camera/EXIF section:
    - Body, focal length, aperture, shutter speed, ISO, lens
    - 2-col grid layout
  - Image dimensions (xs text)

### BirdInfo (Presentation Component)
- **Props**:
  - bird: { name, scientificName?, habitat?, diet?, conservationStatus?, facts? }
  - location?: string
  - dateTaken?: string
  - description?: string
- **Displays**:
  - Bird name + scientific name (italic)
  - Photo description (if any)
  - Details grid:
    - Habitat, diet, conservation status (color-coded), location, date taken
  - Fun facts section (bulleted list)

### PhotoJsonLd (Presentation Component)
- Generates Schema.org Photograph JSON-LD
- Includes all metadata for SEO & rich snippets

## 5. UTILITIES & HELPERS

### `lib/payload.ts`
- **PhotoDoc Interface**: Full type definition for photo documents
- **getPayloadClient()**: Returns Payload instance
- **responsiveSrcSet(photo)**: Builds srcset string from Payload sizes (capped at xl/1800w)
- **getImageUrl(photo, targetWidth)**: Gets best URL for display width
- **getLqip(photo)**: Returns LQIP data URI
- **resolveRelation<T>(relation)**: Narrows polymorphic relations to populated object

### `lib/photos.ts`
- **FilterOption**: { id, label, count }
- **buildFilterOptions(photos)**: Extracts unique categories & birds with counts from photos
- **filterPhotos(photos, filters)**: Server-side filtering (AND logic)
- **filterPhotoCards(cards, filters)**: Client-side filtering (AND logic)
- **getActiveFilterNames(categories, birds, filters)**: Resolves IDs to labels for UI

### `lib/format.ts`
- **formatDate(dateStr)**: "March 3, 2026"
- **formatExposure(time)**: "1/500s" or "2.5s"

### `lib/access.ts`
- **publicRead**: Always true
- **isAuthenticated**: !!req.user
- **isAdmin**: user.role === "admin"
- **adminFieldAccess**: Same as isAdmin (field-level)

### `hooks/extractExifData.ts`
- **Trigger**: afterChange hook on photo upload
- **Extracts**: FocalLength, FNumber, ExposureTime, ISO, LensModel, CameraModel, DateTimeOriginal
- **Stores**: In photo.exif group
- **Auto-fill**: dateTaken from EXIF DateTimeOriginal if not provided
- **Prevents**: Infinite loops via context flag

### `hooks/generateBlurPlaceholder.ts`
- **Trigger**: afterChange hook on photo upload
- **Process**: 
  1. Resize to 10x10px
  2. Convert to WebP with quality 20
  3. Base64 encode to data URI
- **Stores**: In photo.lqip field
- **Prevents**: Infinite loops via context flag

### `hooks/stripFullResolution.ts`
- **Trigger**: afterRead hook on every photo fetch
- **Logic**:
  - Local API (Server Components, download endpoint): pass through
  - Authenticated users: pass through
  - Public REST/GraphQL: strip url, filename, and sizes.full.url
- **Purpose**: Prevent unauthorized access to full-resolution downloads via API

## 6. API ENDPOINTS

### Download Endpoint (`app/(app)/api/download/[id]/route.ts`)
- **Method**: GET
- **Auth**: Checks isProtected flag
  - If protected: requires user authentication
  - If not protected: public access
- **Process**:
  1. Fetch photo from Payload
  2. Check isProtected and auth status
  3. Validate file URL (only Vercel Blob or localhost)
  4. Fetch from Vercel Blob
  5. Stream with attachment header
- **Security**: 
  - SSRF protection (whitelists Vercel Blob & localhost)
  - Auth validation
  - Cache-Control: private, no-cache

### Admin API Route (`app/(payload)/api/[...slug]/route.ts`)
- Routes to Payload REST API

## 7. SITE METADATA

### robots.ts
- Allow: /
- Disallow: /admin, /api
- Sitemap: https://brandynbritton.com/photography/sitemap.xml

### sitemap.ts
- Main gallery entry: priority 1.0
- Photo entries: priority 0.7, includes image URL
- Revalidates hourly
- Supports up to 1000 photos

## 8. STYLING & THEME

### Color Palette (OKLch)
- **Overlay text**: oklch(0.97 0 0) - near white
- **Overlay muted**: oklch(0.7 0 0) - medium gray
- **Overlay dim**: oklch(0.6 0 0) - darker gray
- **Status safe** (Least Concern): oklch(0.72 0.19 142.5) - blue
- **Status warning** (Near Threatened): oklch(0.8 0.18 84) - orange
- **Status caution** (Vulnerable): oklch(0.7 0.18 55) - amber
- **Status danger** (Endangered): oklch(0.63 0.22 29) - red
- **Status critical** (Critically Endangered): oklch(0.5 0.21 27) - dark red

### Animations
- **image-reveal**: 0.6s opacity/scale entrance
- **vt-meta-enter**: Meta info slides left, delayed 0.15s
- **vt-photo-filter**: Photo cards scale-in (0.3s) / scale-out (0.2s)
- All respect `prefers-reduced-motion: reduce`

### Typography
- **Sans**: Inter (body, UI)
- **Serif**: Playfair Display (headings)
- Dark mode first

## 9. NEXT.js CONFIG

- **basePath**: /photography
- **Experimental**: 
  - viewTransition: true (for View Transitions API)
  - serverActions.allowedOrigins: localhost:3024
- **allowedDevOrigins**: localhost:3024
- **Wrapped** with Payload's withPayload() HOC

## 10. KEY FEATURES SUMMARY

✓ **Photo Upload** with multiple image sizes
✓ **EXIF Data Extraction** (automatic on upload)
✓ **LQIP Generation** (10x10 blur placeholder)
✓ **Bird Database** with conservation status & fun facts
✓ **Category System** for organizing photos
✓ **Camera & Lens Tracking** for equipment metadata
✓ **Masonry Gallery** with responsive columns
✓ **Filtering** by bird & category (client-side, URL-synced)
✓ **View Transitions** for smooth navigation
✓ **Detailed Photo Pages** with bird info, EXIF, location
✓ **Protected Downloads** with auth requirements
✓ **Full-Resolution Gating** (public capped at 1800px)
✓ **JSON-LD Structured Data** for SEO
✓ **Sitemap Generation** with image URLs
✓ **Access Control** (public, authenticated, admin tiers)
✓ **Dark Mode** by default
✓ **Performance**: ISR, lazy loading, LQIP blur, responsive images