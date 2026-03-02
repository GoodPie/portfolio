import { ViewTransition } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { client, urlFor, responsiveSrcSet, getLqip } from "@/lib/sanity";
import { BirdInfo } from "@/components/bird-info";

interface BirdData {
  name: string;
  scientificName?: string;
  habitat?: string;
  diet?: string;
  conservationStatus?: string;
  facts?: string[];
}

interface PhotoDetail {
  galleryTitle: string;
  galleryDate?: string;
  category?: string;
  image: {
    _key: string;
    caption?: string;
    alt?: string;
    camera?: { name: string; manufacturer?: string };
    lens?: { name: string; manufacturer?: string };
    bird?: BirdData;
    location?: string;
    description?: string;
    dateTaken?: string;
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
        location,
        description,
        dateTaken,
        camera-> { name, manufacturer },
        lens-> { name, manufacturer },
        bird-> {
          name,
          scientificName,
          habitat,
          diet,
          conservationStatus,
          facts
        },
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

  const lensName = exif?.LensModel || image.lens?.name;

  const exifEntries = [
    image.camera && { label: "Body", value: image.camera.name },
    exif?.FocalLength && { label: "Focal Length", value: `${exif.FocalLength}mm` },
    exif?.FNumber && { label: "Aperture", value: `f/${exif.FNumber}` },
    exif?.ExposureTime && { label: "Shutter Speed", value: formatExposure(exif.ExposureTime) },
    exif?.ISO && { label: "ISO", value: `${exif.ISO}` },
    lensName && { label: "Lens", value: lensName },
  ].filter(Boolean) as { label: string; value: string }[];

  const hasPhotoDetails = image.location || image.description || image.dateTaken;

  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-foreground transition-colors mb-6 lg:mb-8"
      >
        &larr; Back to gallery
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 lg:gap-16 items-start">
        {/* Meta — on mobile this renders below the photo (via order) */}
        <ViewTransition enter="meta-enter" default="none">
          <aside className="order-2 lg:order-1 lg:sticky lg:top-24 flex flex-col gap-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-medium tracking-tight mb-3">
                {image.caption || image.alt || galleryTitle}
              </h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {category && <span>{category}</span>}
                {category && galleryDate && (
                  <span className="text-border">·</span>
                )}
                {galleryDate && <span>{formatDate(galleryDate)}</span>}
              </div>
            </div>

            {exifEntries.length > 0 && (
              <div className="border-t border-border/40 pt-6">
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

            {image.bird && (
              <BirdInfo
                bird={image.bird}
                location={image.location}
                dateTaken={image.dateTaken}
                description={image.description}
              />
            )}

            {!image.bird && hasPhotoDetails && (
              <div className="border-t border-border/40 pt-6 flex flex-col gap-3">
                <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
                  Photo Details
                </h2>
                {image.description && (
                  <p className="text-sm text-muted-foreground">{image.description}</p>
                )}
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {image.location && (
                    <div>
                      <dt className="text-muted-foreground text-xs">Location</dt>
                      <dd className="text-foreground">{image.location}</dd>
                    </div>
                  )}
                  {image.dateTaken && (
                    <div>
                      <dt className="text-muted-foreground text-xs">Date Taken</dt>
                      <dd className="text-foreground">{formatDate(image.dateTaken)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {dimensions && (
              <p className="text-xs text-muted-foreground/50">
                {dimensions.width} &times; {dimensions.height}
              </p>
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
