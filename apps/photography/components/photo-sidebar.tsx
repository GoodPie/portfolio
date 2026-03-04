import type { PhotoDoc } from "@/lib/payload";
import { BirdInfo } from "@/components/bird-info";
import { LocationMapLoader } from "@/components/location-map-loader";
import { formatDate, formatExposure } from "@/lib/format";
import { resolveRelation } from "@/lib/payload";

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
  const hasPhotoDetails = photo.description || photo.dateTaken;

  return (
    <aside className="order-2 flex flex-col gap-4 lg:sticky lg:top-24 lg:order-1">
      <div>
        <h1 className="mb-2 font-serif text-2xl font-medium tracking-tight md:text-3xl">
          {photo.caption || photo.title}
        </h1>
        <div className="text-muted-foreground flex items-center gap-3 text-sm">
          {category?.title && <span>{category.title}</span>}
          {category?.title && photo.dateTaken && <span className="text-border">·</span>}
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
          dateTaken={photo.dateTaken ?? undefined}
          description={photo.description ?? undefined}
        />
      )}

      {!bird?.name && hasPhotoDetails && (
        <div className="border-border/40 flex flex-col gap-3 border-t pt-4">
          <h2 className="text-muted-foreground text-xs tracking-widest uppercase">Photo Details</h2>
          {photo.description && (
            <p className="text-muted-foreground text-sm">{photo.description}</p>
          )}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
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
        <div className="border-border/40 border-t pt-6">
          <h2 className="text-muted-foreground mb-3 text-xs tracking-widest uppercase">Camera</h2>
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

      {photo.geolocation?.latitude !== null &&
        photo.geolocation?.latitude !== undefined &&
        photo.geolocation?.longitude !== null &&
        photo.geolocation?.longitude !== undefined && (
          <div className="border-border/40 border-t pt-6">
            <h2 className="text-muted-foreground mb-3 text-xs tracking-widest uppercase">
              Location
            </h2>
            <LocationMapLoader
              latitude={photo.geolocation.latitude}
              longitude={photo.geolocation.longitude}
            />
          </div>
        )}

      {photo.width && photo.height && (
        <p className="text-muted-foreground/50 text-xs">
          {photo.width} &times; {photo.height}
        </p>
      )}
    </aside>
  );
}
