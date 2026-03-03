import type { BirdDoc } from "@/lib/payload";

interface BirdBioProps {
  bird: BirdDoc;
}

export function BirdBio({ bird }: BirdBioProps) {
  const hasDetails = bird.habitat || bird.diet;
  const hasFacts = bird.facts && bird.facts.length > 0;

  if (!hasDetails && !hasFacts) return null;

  return (
    <section className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-8">
      {hasDetails && (
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
        </dl>
      )}

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
