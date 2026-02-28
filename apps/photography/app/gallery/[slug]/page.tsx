import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@goodpie/ui/components/badge";
import { Button } from "@goodpie/ui/components/button";
import { PhotoFocusCards } from "@/components/photo-focus-cards";
import { client, urlFor } from "@/lib/sanity";

interface GalleryImage {
  _key: string;
  caption?: string;
  alt?: string;
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

interface Gallery {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  date?: string;
  category?: string;
  images: GalleryImage[];
}

async function getGallery(slug: string): Promise<Gallery | null> {
  return client.fetch(
    `*[_type == "gallery" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      date,
      "category": category->title,
      images[] {
        _key,
        caption,
        alt,
        asset-> {
          _id,
          metadata {
            lqip,
            dimensions,
            exif
          }
        }
      }
    }`,
    { slug },
    { next: { revalidate: 60 } }
  );
}

export async function generateStaticParams() {
  const galleries = await client.fetch<{ slug: string }[]>(
    `*[_type == "gallery"]{ "slug": slug.current }`
  );
  return galleries.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gallery = await getGallery(slug);
  if (!gallery) return { title: "Gallery not found" };
  return {
    title: `${gallery.title} | Photography | Brandyn Britton`,
    description: gallery.description,
  };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gallery = await getGallery(slug);

  if (!gallery) notFound();

  const photos = (gallery.images ?? []).map((image) => ({
    title: image.alt || image.caption || gallery.title,
    src: urlFor(image).width(1200).auto("format").url(),
    caption: image.caption,
    exif: image.asset?.metadata?.exif,
  }));

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">&larr; All Galleries</Link>
        </Button>
        <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          {gallery.title}
        </h1>
        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
          {gallery.category && <Badge variant="secondary">{gallery.category}</Badge>}
          {gallery.date && (
            <time dateTime={gallery.date}>
              {new Date(gallery.date).toLocaleDateString("en-AU", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          )}
          <span>{gallery.images?.length ?? 0} photos</span>
        </div>
        {gallery.description && (
          <p className="mt-4 max-w-2xl text-muted-foreground">
            {gallery.description}
          </p>
        )}
      </div>

      {/* Photo grid */}
      {photos.length > 0 ? (
        <PhotoFocusCards photos={photos} />
      ) : (
        <p className="text-center py-12 text-muted-foreground">
          No images in this gallery yet.
        </p>
      )}
    </>
  );
}
