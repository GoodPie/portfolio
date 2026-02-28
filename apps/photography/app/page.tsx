import { Button } from "@goodpie/ui/components/button";
import Link from "next/link";
import { PhotoFocusCards } from "@/components/photo-focus-cards";
import { client, urlFor } from "@/lib/sanity";

interface SiteSettings {
  title?: string;
  description?: string;
}

interface GalleryImage {
  _key: string;
  caption?: string;
  alt?: string;
  galleryTitle: string;
  asset: {
    _id: string;
    metadata?: {
      lqip?: string;
      dimensions?: { width: number; height: number; aspectRatio: number };
      exif?: {
        FocalLength?: number;
        FNumber?: number;
        ISO?: number;
        ExposureTime?: number;
        LensModel?: string;
      };
    };
  };
}

async function getSiteSettings(): Promise<SiteSettings> {
  return (
    client.fetch(
      `*[_type == "siteSettings"][0] { title, description }`,
      {},
      { next: { revalidate: 60 } }
    ) ?? {}
  );
}

async function getAllPhotos(): Promise<GalleryImage[]> {
  return client.fetch(
    `*[_type == "gallery"] | order(date desc) {
      title,
      images[] {
        _key,
        caption,
        alt,
        "galleryTitle": ^.title,
        asset-> {
          _id,
          metadata {
            lqip,
            dimensions,
            exif
          }
        }
      }
    }.images[]`,
    {},
    { next: { revalidate: 60 } }
  );
}

export default async function PhotosPage() {
  const [settings, photos] = await Promise.all([
    getSiteSettings(),
    getAllPhotos(),
  ]);

  const cards = photos.map((image) => ({
    title: image.alt || image.caption || image.galleryTitle,
    src: urlFor(image).width(1200).auto("format").url(),
    caption: image.caption,
    exif: image.asset?.metadata?.exif,
  }));

  return (
    <>
      {/* Hero */}
      <section className="mb-12 text-center">
        <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
          {settings?.title || "Photography"}
        </h1>
        {settings?.description && (
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {settings.description}
          </p>
        )}
      </section>

      {/* Photos */}
      {cards.length > 0 ? (
        <PhotoFocusCards photos={cards} />
      ) : (
        <div className="text-center py-24">
          <p className="text-muted-foreground">No photos yet.</p>
          <Button asChild variant="link" className="mt-4">
            <Link href="/studio">
              Open Studio to add your first gallery &rarr;
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}
