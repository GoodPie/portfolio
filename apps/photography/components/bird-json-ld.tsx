import type { BirdDoc } from "@/lib/payload";
import { resolveRelation, getImageUrl } from "@/lib/payload";
import type { PhotoDoc } from "@/lib/payload";

function buildJsonLd(bird: BirdDoc) {
  const coverPhoto = resolveRelation(bird.coverImage as PhotoDoc | string | number | null);

  return {
    "@context": "https://schema.org",
    "@type": "Thing",
    name: bird.name,
    ...(bird.scientificName && { alternateName: bird.scientificName }),
    url: `https://brandynbritton.com/photography/birds/${bird.slug}`,
    ...(coverPhoto && { image: getImageUrl(coverPhoto, 1200) }),
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
  };
}

export function BirdJsonLd({ bird }: { bird: BirdDoc }) {
  // JSON.stringify safely escapes all values — no XSS risk for structured data
  const jsonLd = JSON.stringify(buildJsonLd(bird));

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
  );
}
