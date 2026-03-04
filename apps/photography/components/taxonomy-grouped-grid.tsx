"use client";

import { useMemo } from "react";
import type { BirdCardData } from "@/components/bird-grid";
import { BirdGrid } from "@/components/bird-grid";

interface TaxonomyGroup {
  order: string;
  families: { family: string; birds: BirdCardData[] }[];
}

export function TaxonomyGroupedGrid({ birds }: { birds: BirdCardData[] }) {
  const groups = useMemo(() => {
    const orderMap = new Map<string, Map<string, BirdCardData[]>>();
    const unclassified: BirdCardData[] = [];

    for (const bird of birds) {
      if (!bird.taxonomicOrder) {
        unclassified.push(bird);
        continue;
      }
      const order = bird.taxonomicOrder;
      const family = bird.family || "Unknown Family";
      if (!orderMap.has(order)) orderMap.set(order, new Map());
      const familyMap = orderMap.get(order)!;
      if (!familyMap.has(family)) familyMap.set(family, []);
      familyMap.get(family)!.push(bird);
    }

    const result: TaxonomyGroup[] = [];
    for (const [order, familyMap] of orderMap) {
      const families = Array.from(familyMap.entries()).map(([family, birds]) => ({
        family,
        birds,
      }));
      result.push({ order, families });
    }
    result.sort((a, b) => a.order.localeCompare(b.order));

    if (unclassified.length > 0) {
      result.push({
        order: "Unclassified",
        families: [{ family: "", birds: unclassified }],
      });
    }

    return result;
  }, [birds]);

  return (
    <div className="flex flex-col gap-10">
      {groups.map((group) => (
        <section key={group.order}>
          <h2 className="mb-4 font-serif text-2xl font-medium tracking-tight">{group.order}</h2>
          {group.families.map((fam) => (
            <div key={fam.family || "__none"} className="mb-6">
              {fam.family && (
                <p className="text-muted-foreground mb-3 text-xs tracking-widest uppercase">
                  {fam.family} <span className="opacity-50">({fam.birds.length})</span>
                </p>
              )}
              <BirdGrid birds={fam.birds} />
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
