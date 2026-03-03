import type { BirdDoc } from "@/lib/payload";

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
    <section className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-8">
      <dl className="space-y-4">
        {bird.habitat && (
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Habitat
            </dt>
            <dd className="text-sm text-foreground leading-relaxed">{bird.habitat}</dd>
          </div>
        )}
        {bird.diet && (
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Diet
            </dt>
            <dd className="text-sm text-foreground leading-relaxed">{bird.diet}</dd>
          </div>
        )}
        {hasTaxonomy && (
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Classification
            </dt>
            <dd className="text-sm text-foreground leading-relaxed">
              {[bird.taxonomicOrder, bird.family].filter(Boolean).join(" \u00b7 ")}
            </dd>
          </div>
        )}
        {hasResources && (
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Resources
            </dt>
            <dd className="flex flex-col gap-1.5">
              <a
                href={`https://ebird.org/species/${bird.ebirdSpeciesCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                View on eBird &#8599;
              </a>
              <a
                href={`https://search.macaulaylibrary.org/catalog?taxonCode=${bird.ebirdSpeciesCode}&mediaType=audio`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Listen on Macaulay Library &#8599;
              </a>
            </dd>
          </div>
        )}
      </dl>

      {hasFacts && (
        <div>
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Fun Facts
          </h2>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
            {bird.facts!.map((f, i) => (
              <li key={i}>{f.fact}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
