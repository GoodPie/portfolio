import { ViewTransition } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPayloadClient, responsiveSrcSet, getImageUrl, getLqip } from "@/lib/payload";
import type { PhotoDoc } from "@/lib/payload";
import { BirdInfo } from "@/components/bird-info";

export const revalidate = 60;

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
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const payload = await getPayloadClient();

  let raw;
  try {
    raw = await payload.findByID({
      collection: "photos",
      id,
      depth: 2,
    });
  } catch {
    notFound();
  }

  if (!raw) notFound();

  const photo = raw as unknown as PhotoDoc;
  const exif = photo.exif;
  const lqip = getLqip(photo);

  const bird = photo.bird && typeof photo.bird === "object" ? photo.bird : null;
  const camera = photo.camera && typeof photo.camera === "object" ? photo.camera : null;
  const lens = photo.lens && typeof photo.lens === "object" ? photo.lens : null;
  const category = photo.category && typeof photo.category === "object" ? photo.category : null;

  const lensName = exif?.lensModel || (lens && "name" in lens ? lens.name : undefined);

  const exifEntries = [
    camera && "name" in camera && { label: "Body", value: camera.name! },
    exif?.focalLength && { label: "Focal Length", value: `${exif.focalLength}mm` },
    exif?.aperture && { label: "Aperture", value: `f/${exif.aperture}` },
    exif?.shutterSpeed && { label: "Shutter Speed", value: formatExposure(exif.shutterSpeed) },
    exif?.iso && { label: "ISO", value: `${exif.iso}` },
    lensName && { label: "Lens", value: lensName },
  ].filter(Boolean) as { label: string; value: string }[];

  const hasPhotoDetails = photo.location || photo.description || photo.dateTaken;

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
                {photo.caption || photo.title}
              </h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {category?.title && <span>{category.title}</span>}
                {category?.title && photo.dateTaken && (
                  <span className="text-border">·</span>
                )}
                {photo.dateTaken && <span>{formatDate(photo.dateTaken)}</span>}
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

            {bird && "name" in bird && (
              <BirdInfo
                bird={{
                  name: bird.name!,
                  scientificName: bird.scientificName,
                  habitat: bird.habitat,
                  diet: bird.diet,
                  conservationStatus: bird.conservationStatus,
                  facts: bird.facts,
                }}
                location={photo.location ?? undefined}
                dateTaken={photo.dateTaken ?? undefined}
                description={photo.description ?? undefined}
              />
            )}

            {!(bird && "name" in bird) && hasPhotoDetails && (
              <div className="border-t border-border/40 pt-6 flex flex-col gap-3">
                <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
                  Photo Details
                </h2>
                {photo.description && (
                  <p className="text-sm text-muted-foreground">{photo.description}</p>
                )}
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {photo.location && (
                    <div>
                      <dt className="text-muted-foreground text-xs">Location</dt>
                      <dd className="text-foreground">{photo.location}</dd>
                    </div>
                  )}
                  {photo.dateTaken && (
                    <div>
                      <dt className="text-muted-foreground text-xs">Date Taken</dt>
                      <dd className="text-foreground">{formatDate(photo.dateTaken)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {photo.width && photo.height && (
              <p className="text-xs text-muted-foreground/50">
                {photo.width} &times; {photo.height}
              </p>
            )}
          </aside>
        </ViewTransition>

        {/* Photo */}
        <ViewTransition name={`photo-${id}`}>
          <div className="order-1 lg:order-2">
            <img
              src={getImageUrl(photo, 1800)}
              srcSet={responsiveSrcSet(photo)}
              sizes="(max-width: 1024px) 100vw, 65vw"
              alt={photo.caption || photo.title}
              width={photo.width ?? undefined}
              height={photo.height ?? undefined}
              fetchPriority="high"
              decoding="async"
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
