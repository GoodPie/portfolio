import { formatDate, formatExposure } from "@/lib/format";
import { resolveRelation } from "@/lib/payload";
import type { PhotoDoc } from "@/lib/payload";
import { BirdInfo } from "@/components/bird-info";

function buildExifEntries(photo: PhotoDoc) {
  const exif = photo.exif;
  const camera = resolveRelation(photo.camera);
  const lens = resolveRelation(photo.lens);
  const lensName = exif?.lensModel || (lens?.name ?? undefined);

  return [
    camera?.name && { label: "Body", value: camera.name },
    exif?.focalLength && { label: "Focal Length", value: `${exif.focalLength}mm` },
    exif?.aperture && { label: "Aperture", value: `f/${exif.aperture}` },
    exif?.shutterSpeed && { label: "Shutter Speed", value: formatExposure(exif.shutterSpeed) },
    exif?.iso && { label: "ISO", value: `${exif.iso}` },
    lensName && { label: "Lens", value: lensName },
  ].filter(Boolean) as { label: string; value: string }[];
}

export function PhotoSidebar({ photo }: { photo: PhotoDoc }) {
  const bird = resolveRelation(photo.bird);
  const category = resolveRelation(photo.category);
  const exifEntries = buildExifEntries(photo);
  const hasPhotoDetails = photo.location || photo.description || photo.dateTaken;

  return (
    <aside className="order-2 lg:order-1 lg:sticky lg:top-24 flex flex-col gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-medium tracking-tight mb-2">
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

      {bird?.name && (
        <BirdInfo
          bird={{
            name: bird.name,
            scientificName: bird.scientificName,
            habitat: bird.habitat,
            diet: bird.diet,
            conservationStatus: bird.conservationStatus,
            facts: bird.facts,
            ebirdSpeciesCode: bird.ebirdSpeciesCode,
          }}
          slug={bird.slug}
          location={photo.location ?? undefined}
          dateTaken={photo.dateTaken ?? undefined}
          description={photo.description ?? undefined}
        />
      )}

      {!bird?.name && hasPhotoDetails && (
        <div className="border-t border-border/40 pt-4 flex flex-col gap-3">
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

      {photo.width && photo.height && (
        <p className="text-xs text-muted-foreground/50">
          {photo.width} &times; {photo.height}
        </p>
      )}
    </aside>
  );
}
