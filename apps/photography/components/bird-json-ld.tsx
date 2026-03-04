import type { BirdDoc } from "@/lib/payload";
import type { PhotoDoc } from "@/lib/payload";
import { getEbirdSpeciesUrl } from "@/lib/bird-utils";
import { resolveRelation, getImageUrl } from "@/lib/payload";

function buildJsonLd(bird: BirdDoc) {
  const coverPhoto = resolveRelation(bird.coverImage as PhotoDoc | string | number | null);

  const properties = [
    ...(bird.taxonomicOrder
      ? [{ "@type": "PropertyValue", name: "taxonomicOrder", value: bird.taxonomicOrder }]
      : []),
    ...(bird.family ? [{ "@type": "PropertyValue", name: "family", value: bird.family }] : []),
    ...(bird.facts && bird.facts.length > 0
      ? bird.facts.map((f) => ({
          "@type": "PropertyValue",
          name: "fact",
          value: f.fact,
        }))
      : []),
  ];

  return {
    "@context": "https://schema.org",
    "@type": "Thing",
    name: bird.name,
    ...(bird.scientificName && { alternateName: bird.scientificName }),
    url: `https://brandynbritton.com/photography/birds/${bird.slug}`,
    ...(coverPhoto && { image: getImageUrl(coverPhoto, 1200) }),
    ...(bird.ebirdSpeciesCode && {
      sameAs: getEbirdSpeciesUrl(bird.ebirdSpeciesCode),
    }),
    ...(bird.habitat &&
      bird.diet &&
      bird.conservationStatus && {
        description: `Habitat: ${bird.habitat}. Diet: ${bird.diet}. Conservation status: ${bird.conservationStatus}.`,
      }),
    ...(properties.length > 0 && { additionalProperty: properties }),
  };
}

export function BirdJsonLd({ bird }: { bird: BirdDoc }) {
  // JSON.stringify safely escapes all values — no XSS risk for structured data
  const jsonLd = JSON.stringify(buildJsonLd(bird));

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />;
}
