// Hand-picked photos for the homepage. Dates, scientific names, camera settings and
// file names were copied once from the gallery API: /photography/api/photos/<id>?depth=1
// Names, titles and alt text are written by hand. No place names here, on purpose.
//
// ponytail: hotlinked from the gallery's storage, no image pipeline here. If a photo is
// deleted or re-uploaded in the CMS its image breaks until this file is updated.
// `node scripts/check-home.mjs --online` catches that. Copy the files in if it bites.

export interface Photo {
  /** Gallery id, links to /photography/photo/<id> */
  id: number;
  name: string;
  scientificName: string;
  title: string;
  alt: string;
  taken: string;
  /** Omitted when the gallery has no camera settings for the photo */
  settings?: string;
  /** Of the xl file */
  width: number;
  height: number;
  /** 800w, 1200w, 1800w */
  files: { card: string; large: string; xl: string };
}

const BLOB = "https://gia6op4yj3pmmws8.public.blob.vercel-storage.com";
// www, so the request does not redirect
const API = "https://www.brandynbritton.com/photography/api/photos/file";

const files = (base: string, ext: string, [card, large, xl]: [string, string, string]) => ({
  card: `${base}-${card}.${ext}`,
  large: `${base}-${large}.${ext}`,
  xl: `${base}-${xl}.${ext}`,
});

const LANDSCAPE: [string, string, string] = ["800x533", "1200x800", "1800x1200"];

export const srcset = (p: Photo) =>
  `${p.files.card} 800w, ${p.files.large} 1200w, ${p.files.xl} 1800w`;

export const lead: Photo = {
  id: 29,
  name: "Willie Wagtail",
  scientificName: "Rhipidura leucophrys",
  title: "Bombastic side-eye",
  alt: "A Willie Wagtail perched on the back of a wooden bench, giving the camera a sideways look.",
  taken: "Mar 2026",
  settings: "600mm · f/6.3 · 1/800s · ISO 1600",
  width: 1800,
  height: 1200,
  files: files(`${BLOB}/DSC05476-2`, "webp", LANDSCAPE),
};

export const field: Photo[] = [
  {
    id: 5,
    name: "Tawny Frogmouth",
    scientificName: "Podargus strigoides",
    title: "Tired Tawny Frogmouth",
    alt: "A Tawny Frogmouth dozing against a paperbark trunk, eyes shut and feathers fluffed.",
    taken: "Feb 2026",
    width: 1800,
    height: 1368,
    files: files(`${BLOB}/DSC04228-Topaz-Gigapixel-4X`, "webp", [
      "800x608",
      "1200x912",
      "1800x1368",
    ]),
  },
  {
    id: 13,
    name: "New Holland Honeyeater",
    scientificName: "Phylidonyris novaehollandiae",
    title: "New Holland Honeyeater, screaming",
    alt: "A New Holland Honeyeater calling with its bill wide open, perched on a bare twig.",
    taken: "Mar 2026",
    settings: "467mm · f/6.3 · 1/1000s · ISO 2500",
    width: 1800,
    height: 1200,
    files: files(`${BLOB}/DSC02410`, "webp", LANDSCAPE),
  },
  {
    id: 44,
    name: "Australian Pelican",
    scientificName: "Pelecanus conspicillatus",
    title: "Pelican fountain",
    alt: "An Australian Pelican on dark water with its bill raised, water trickling from the tip.",
    taken: "Mar 2026",
    settings: "400mm · f/6.3 · 1/800s · ISO 4000",
    width: 1800,
    height: 1200,
    // The one JPEG, served through the gallery's API route instead of the blob host
    files: files(`${API}/ROT07425`, "jpg", LANDSCAPE),
  },
  {
    id: 24,
    name: "Nankeen Night Heron",
    scientificName: "Nycticorax caledonicus",
    title: "Spying on a Nankeen Night Heron",
    alt: "A Nankeen Night Heron standing on a fallen log, seen through a gap in the leaves.",
    taken: "Mar 2026",
    settings: "600mm · f/6.3 · 1/800s · ISO 5000",
    width: 1800,
    height: 1800,
    files: files(`${BLOB}/DSC05631-2`, "webp", ["800x800", "1200x1200", "1800x1800"]),
  },
];
