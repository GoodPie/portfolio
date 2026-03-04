import type { PhotoDoc } from "@/lib/payload";
import { formatExposure } from "@/lib/format";
import { resolveRelation, getImageUrl } from "@/lib/payload";

function buildJsonLd(photo: PhotoDoc, description: string, id: string) {
  const bird = resolveRelation(photo.bird);
  const camera = resolveRelation(photo.camera);
  const lens = resolveRelation(photo.lens);
  const category = resolveRelation(photo.category);
  const exif = photo.exif;
  const lensName = exif?.lensModel || (lens?.name ?? undefined);

  const exifEntries = [
    camera?.name && { label: "Body", value: camera.name },
    exif?.focalLength && { label: "Focal Length", value: `${exif.focalLength}mm` },
    exif?.aperture && { label: "Aperture", value: `f/${exif.aperture}` },
    exif?.shutterSpeed && { label: "Shutter Speed", value: formatExposure(exif.shutterSpeed) },
    exif?.iso && { label: "ISO", value: `${exif.iso}` },
    lensName && { label: "Lens", value: lensName },
  ].filter(Boolean) as { label: string; value: string }[];

  return {
    "@context": "https://schema.org",
    "@type": "Photograph",
    name: photo.caption || photo.title,
    description,
    contentUrl: getImageUrl(photo, 1800),
    url: `https://brandynbritton.com/photography/photo/${id}`,
    author: {
      "@type": "Person",
      name: "Brandyn Britton",
      url: "https://brandynbritton.com",
    },
    creator: {
      "@type": "Person",
      name: "Brandyn Britton",
      url: "https://brandynbritton.com",
    },
    ...(photo.dateTaken && { dateCreated: photo.dateTaken }),
    ...(photo.geolocation?.latitude !== null &&
      photo.geolocation?.latitude !== undefined &&
      photo.geolocation?.longitude !== null &&
      photo.geolocation?.longitude !== undefined && {
        contentLocation: {
          "@type": "Place",
          geo: {
            "@type": "GeoCoordinates",
            latitude: photo.geolocation.latitude,
            longitude: photo.geolocation.longitude,
          },
        },
      }),
    ...(photo.width &&
      photo.height && {
        width: {
          "@type": "QuantitativeValue",
          value: photo.width,
          unitCode: "E37",
        },
        height: {
          "@type": "QuantitativeValue",
          value: photo.height,
          unitCode: "E37",
        },
      }),
    encodingFormat: "image/jpeg",
    ...(exifEntries.length > 0 && {
      exifData: exifEntries.map((e) => ({
        "@type": "PropertyValue",
        name: e.label,
        value: e.value,
      })),
    }),
    ...(bird?.name && {
      about: {
        "@type": "Thing",
        name: bird.name,
        ...(bird.scientificName && {
          alternateName: bird.scientificName,
        }),
        ...(bird.habitat &&
          bird.diet &&
          bird.conservationStatus && {
            description: `Habitat: ${bird.habitat}. Diet: ${bird.diet}. Conservation status: ${bird.conservationStatus}.`,
          }),
        ...(bird.facts &&
          bird.facts.length > 0 && {
            additionalProperty: bird.facts.map((f) => ({
              "@type": "PropertyValue",
              name: "fact",
              value: f.fact,
            })),
          }),
      },
    }),
    ...(category?.title && { genre: category.title }),
  };
}

export function PhotoJsonLd({
  photo,
  description,
  id,
}: {
  photo: PhotoDoc;
  description: string;
  id: string;
}) {
  // JSON.stringify safely escapes all values — no XSS risk for structured data
  const jsonLd = JSON.stringify(buildJsonLd(photo, description, id));

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />;
}
