import { Button } from "@goodpie/ui/components/button";
import Link from "next/link";
import { PhotoGrid } from "@/components/photo-grid";
import { client, urlFor } from "@/lib/sanity";

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
  const photos = await getAllPhotos();

  const cards = photos.map((image) => ({
    photoKey: image._key,
    title: image.alt || image.caption || image.galleryTitle,
    src: urlFor(image).width(1200).auto("format").url(),
    caption: image.caption,
    exif: image.asset?.metadata?.exif,
  }));

  return (
    <>
      {/* Hero */}
      <section className="mb-16 max-w-2xl">
        <p className="text-sm tracking-widest text-muted-foreground uppercase mb-4">
          Photography
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight mb-6">
          Mostly birds<span className="text-teal">.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          Sometimes landscapes. Occasionally something else entirely.
        </p>
      </section>

      {/* Photos */}
      {cards.length > 0 ? (
        <PhotoGrid photos={cards} />
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
