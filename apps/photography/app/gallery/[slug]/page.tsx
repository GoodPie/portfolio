import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@goodpie/ui/components/badge";
import { Button } from "@goodpie/ui/components/button";
import { client, urlFor, getLqip, responsiveSrcSet } from "@/lib/sanity";

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

      {/* Masonry-style image grid */}
      {gallery.images && gallery.images.length > 0 ? (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {gallery.images.map((image) => {
            const lqip = getLqip(image);
            const dimensions = image.asset?.metadata?.dimensions;
            const width = dimensions?.width ?? 1200;
            const height = dimensions?.height ?? 800;
            const exif = image.asset?.metadata?.exif;

            return (
              <figure key={image._key} className="mb-4 break-inside-avoid">
                <Image
                  src={urlFor(image).width(1200).auto("format").url()}
                  alt={image.alt || image.caption || gallery.title}
                  width={width}
                  height={height}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  placeholder={lqip ? "blur" : "empty"}
                  blurDataURL={lqip}
                  className="w-full rounded-lg image-reveal"
                />
                {(image.caption || exif) && (
                  <figcaption className="mt-2 px-1 text-xs text-muted-foreground">
                    {image.caption && <span>{image.caption}</span>}
                    {exif && (
                      <span className="block mt-0.5 opacity-60">
                        {[
                          exif.FocalLength && `${exif.FocalLength}mm`,
                          exif.FNumber && `f/${exif.FNumber}`,
                          exif.ExposureTime &&
                            `${exif.ExposureTime >= 1 ? exif.ExposureTime : `1/${Math.round(1 / exif.ExposureTime)}`}s`,
                          exif.ISO && `ISO ${exif.ISO}`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    )}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      ) : (
        <p className="text-center py-12 text-muted-foreground">
          No images in this gallery yet.
        </p>
      )}
    </>
  );
}
