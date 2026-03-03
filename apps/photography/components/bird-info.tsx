interface BirdInfoProps {
  bird: {
    name: string;
    scientificName?: string;
    habitat?: string;
    diet?: string;
    conservationStatus?: string;
    facts?: { fact: string }[];
  };
  location?: string;
  dateTaken?: string;
  description?: string;
}

const statusColors: Record<string, string> = {
  "Least Concern": "text-status-safe",
  "Near Threatened": "text-status-warning",
  Vulnerable: "text-status-caution",
  Endangered: "text-status-danger",
  "Critically Endangered": "text-status-critical",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function BirdInfo({ bird, location, dateTaken, description }: BirdInfoProps) {
  const details = [
    bird.habitat && { label: "Habitat", value: bird.habitat },
    bird.diet && { label: "Diet", value: bird.diet },
    bird.conservationStatus && {
      label: "Conservation Status",
      value: bird.conservationStatus,
      className: statusColors[bird.conservationStatus],
    },
    location && { label: "Location", value: location },
    dateTaken && { label: "Date Taken", value: formatDate(dateTaken) },
  ].filter(Boolean) as { label: string; value: string; className?: string }[];

  return (
    <div className="border-t border-border/40 pt-6 flex flex-col gap-4">
      <div>
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
          Bird
        </h2>
        <p className="text-foreground font-medium">{bird.name}</p>
        {bird.scientificName && (
          <p className="text-sm text-muted-foreground italic">{bird.scientificName}</p>
        )}
      </div>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

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
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Fun Facts
          </h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {bird.facts.map((f, i) => (
              <li key={i}>{f.fact}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
