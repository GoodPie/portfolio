import Link from "next/link";
import { conservationStatusColors, getEbirdSpeciesUrl } from "@/lib/bird-utils";
import { formatDate } from "@/lib/format";

interface BirdInfoProps {
  bird: {
    name: string;
    scientificName?: string;
    habitat?: string;
    diet?: string;
    conservationStatus?: string;
    facts?: { fact: string }[];
    ebirdSpeciesCode?: string;
  };
  slug?: string;
  dateTaken?: string;
  description?: string;
}

export function BirdInfo({ bird, slug, dateTaken, description }: BirdInfoProps) {
  const details = [
    bird.habitat && { label: "Habitat", value: bird.habitat },
    bird.diet && { label: "Diet", value: bird.diet },
    bird.conservationStatus && {
      label: "Conservation Status",
      value: bird.conservationStatus,
      className: conservationStatusColors[bird.conservationStatus],
    },
    dateTaken && { label: "Date Taken", value: formatDate(dateTaken) },
  ].filter(Boolean) as { label: string; value: string; className?: string }[];

  return (
    <div className="border-border/40 flex flex-col gap-4 border-t pt-6">
      <div>
        <h2 className="text-muted-foreground mb-1 text-xs tracking-widest uppercase">Bird</h2>
        {slug ? (
          <Link
            href={`/birds/${slug}`}
            className="text-foreground hover:text-primary font-medium transition-colors"
          >
            {bird.name}
          </Link>
        ) : (
          <p className="text-foreground font-medium">{bird.name}</p>
        )}
        {bird.scientificName && (
          <p className="text-muted-foreground text-sm italic">{bird.scientificName}</p>
        )}
        {bird.ebirdSpeciesCode && (
          <a
            href={getEbirdSpeciesUrl(bird.ebirdSpeciesCode)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary text-xs transition-colors"
          >
            eBird &#8599;
          </a>
        )}
      </div>

      {description && <p className="text-muted-foreground text-sm">{description}</p>}

      {details.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {details.map((detail) => (
            <div key={detail.label}>
              <dt className="text-muted-foreground text-xs">{detail.label}</dt>
              <dd className={detail.className || "text-foreground"}>{detail.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {bird.facts && bird.facts.length > 0 && (
        <div>
          <h3 className="text-muted-foreground mb-2 text-xs tracking-widest uppercase">
            Fun Facts
          </h3>
          <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
            {bird.facts.map((f, i) => (
              <li key={i}>{f.fact}</li>
            ))}
          </ul>
        </div>
      )}

      {slug && (
        <Link
          href={`/birds/${slug}`}
          className="text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          View More {bird.name} Photos &rarr;
        </Link>
      )}
    </div>
  );
}
