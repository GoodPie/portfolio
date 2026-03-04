import type { BirdDoc } from "@/lib/payload";
import { getEbirdSpeciesUrl } from "@/lib/bird-utils";

interface BirdBioProps {
  bird: BirdDoc;
}

export function BirdBio({ bird }: BirdBioProps) {
  const hasDetails = bird.habitat || bird.diet;
  const hasFacts = bird.facts && bird.facts.length > 0;
  const hasTaxonomy = bird.taxonomicOrder || bird.family;
  const hasResources = bird.ebirdSpeciesCode;

  if (!hasDetails && !hasFacts && !hasTaxonomy && !hasResources) return null;

  return (
    <section className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-2">
      <dl className="space-y-4">
        {bird.habitat && (
          <div>
            <dt className="text-muted-foreground mb-1 text-xs tracking-widest uppercase">
              Habitat
            </dt>
            <dd className="text-foreground text-sm leading-relaxed">{bird.habitat}</dd>
          </div>
        )}
        {bird.diet && (
          <div>
            <dt className="text-muted-foreground mb-1 text-xs tracking-widest uppercase">Diet</dt>
            <dd className="text-foreground text-sm leading-relaxed">{bird.diet}</dd>
          </div>
        )}
        {hasTaxonomy && (
          <div>
            <dt className="text-muted-foreground mb-1 text-xs tracking-widest uppercase">
              Classification
            </dt>
            <dd className="text-foreground text-sm leading-relaxed">
              {[bird.taxonomicOrder, bird.family].filter(Boolean).join(" \u00b7 ")}
            </dd>
          </div>
        )}
        {hasResources && (
          <div>
            <dt className="text-muted-foreground mb-2 text-xs tracking-widest uppercase">
              Resources
            </dt>
            <dd className="flex flex-col gap-1.5">
              <a
                href={getEbirdSpeciesUrl(bird.ebirdSpeciesCode!)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-sm transition-colors"
              >
                View on eBird &#8599;
              </a>
              <a
                href={`https://search.macaulaylibrary.org/catalog?taxonCode=${bird.ebirdSpeciesCode}&mediaType=audio`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
              >
                Listen on Macaulay Library &#8599;
              </a>
            </dd>
          </div>
        )}
      </dl>

      {hasFacts && (
        <div>
          <h2 className="text-muted-foreground mb-3 text-xs tracking-widest uppercase">
            Fun Facts
          </h2>
          <ul className="text-muted-foreground list-inside list-disc space-y-2 text-sm">
            {bird.facts!.map((f, i) => (
              <li key={i}>{f.fact}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
