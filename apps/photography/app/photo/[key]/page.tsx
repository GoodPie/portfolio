import { ViewTransition } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { client, urlFor, responsiveSrcSet, getLqip } from "@/lib/sanity";

interface PhotoDetail {
  galleryTitle: string;
  galleryDate?: string;
  category?: string;
  image: {
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
          DateTimeOriginal?: string;
        };
      };
    };
  };
}

async function getPhoto(key: string): Promise<PhotoDetail | null> {
  return client.fetch(
    `*[_type == "gallery" && $key in images[]._key][0] {
      "galleryTitle": title,
      "galleryDate": date,
      "category": category->title,
      "image": images[_key == $key][0] {
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
    { key },
    { next: { revalidate: 60 } }
  );
}

function formatExposure(time: number): string {
  if (time >= 1) return `${time}s`;
  return `1/${Math.round(1 / time)}s`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PhotoPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const data = await getPhoto(key);

  if (!data?.image) {
    notFound();
  }

  const { image, galleryTitle, galleryDate, category } = data;
  const exif = image.asset?.metadata?.exif;
  const dimensions = image.asset?.metadata?.dimensions;
  const lqip = getLqip(image);

  const exifEntries = exif
    ? [
        exif.FocalLength && { label: "Focal Length", value: `${exif.FocalLength}mm` },
        exif.FNumber && { label: "Aperture", value: `f/${exif.FNumber}` },
        exif.ExposureTime && { label: "Shutter Speed", value: formatExposure(exif.ExposureTime) },
        exif.ISO && { label: "ISO", value: `${exif.ISO}` },
        exif.LensModel && { label: "Lens", value: exif.LensModel },
      ].filter(Boolean) as { label: string; value: string }[]
    : [];

  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        &larr; Back to gallery
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 lg:gap-12 items-start">
        {/* Meta — on mobile this renders below the photo (via order) */}
        <ViewTransition enter="meta-enter" default="none">
          <aside className="order-2 lg:order-1 lg:sticky lg:top-24 flex flex-col gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-medium tracking-tight">
                {image.caption || image.alt || galleryTitle}
              </h1>
              {image.caption && image.alt && image.alt !== image.caption && (
                <p className="mt-2 text-muted-foreground">{image.alt}</p>
              )}
            </div>

            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              <span>{galleryTitle}</span>
              {category && <span>{category}</span>}
              {galleryDate && <span>{formatDate(galleryDate)}</span>}
            </div>

            {exifEntries.length > 0 && (
              <div className="border-t border-border/40 pt-4">
                <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                  Camera
                </h2>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {exifEntries.map((entry) => (
                    <div key={entry.label}>
                      <dt className="text-muted-foreground text-xs">{entry.label}</dt>
                      <dd className="text-foreground">{entry.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {dimensions && (
              <div className="text-xs text-muted-foreground">
                {dimensions.width} &times; {dimensions.height}
              </div>
            )}
          </aside>
        </ViewTransition>

        {/* Photo */}
        <ViewTransition name={`photo-${key}`}>
          <div className="order-1 lg:order-2">
            <img
              src={urlFor(image).width(1800).auto("format").url()}
              srcSet={responsiveSrcSet(image)}
              sizes="(max-width: 1024px) 100vw, 65vw"
              alt={image.alt || image.caption || galleryTitle}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
              {...(lqip && {
                style: {
                  backgroundImage: `url(${lqip})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                },
              })}
            />
          </div>
        </ViewTransition>
      </div>
    </div>
  );
}
