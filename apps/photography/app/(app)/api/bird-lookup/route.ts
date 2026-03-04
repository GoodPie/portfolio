import { generateText, Output, createGateway } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

interface NuthatchBird {
  sciName?: string;
  order?: string;
  family?: string;
  status?: string;
}

const conservationStatusMap: Record<string, string> = {
  LC: "Least Concern",
  NT: "Near Threatened",
  VU: "Vulnerable",
  EN: "Endangered",
  CR: "Critically Endangered",
  "Least Concern": "Least Concern",
  "Near Threatened": "Near Threatened",
  Vulnerable: "Vulnerable",
  Endangered: "Endangered",
  "Critically Endangered": "Critically Endangered",
};

async function fetchNuthatchData(name: string): Promise<NuthatchBird | null> {
  const apiKey = process.env.NUTHATCH_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://nuthatch.lastelm.software/v2/birds?name=${encodeURIComponent(name)}&pageSize=1`,
      { headers: { "API-Key": apiKey } },
    );

    if (!res.ok) return null;

    const data = await res.json();
    const entities = data.entities ?? data;
    if (!Array.isArray(entities) || entities.length === 0) return null;

    return entities[0] as NuthatchBird;
  } catch {
    return null;
  }
}

async function fetchAIData(
  name: string,
  missingFields: { taxonomy: boolean; conservation: boolean },
) {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) return null;

  const gateway = createGateway({ apiKey });

  const schemaFields: Record<string, z.ZodTypeAny> = {
    habitat: z.string().describe("Primary habitats where this species is found"),
    diet: z.string().describe("Primary diet and feeding behavior"),
    facts: z.array(z.string()).min(3).max(5).describe("Interesting facts about this bird species"),
    ebirdSpeciesCode: z
      .string()
      .describe(
        "The eBird species code (typically 6 lowercase letters, e.g. amerob for American Robin)",
      ),
  };

  if (missingFields.taxonomy) {
    schemaFields.scientificName = z.string().describe("Scientific (Latin) name");
    schemaFields.taxonomicOrder = z.string().describe("Taxonomic order (e.g. Passeriformes)");
    schemaFields.family = z.string().describe("Taxonomic family (e.g. Corvidae)");
  }

  if (missingFields.conservation) {
    schemaFields.conservationStatus = z
      .enum([
        "Least Concern",
        "Near Threatened",
        "Vulnerable",
        "Endangered",
        "Critically Endangered",
      ])
      .describe("IUCN conservation status");
  }

  try {
    const { output } = await generateText({
      model: gateway("google/gemini-3-flash"),
      output: Output.object({ schema: z.object(schemaFields) }),
      prompt: `Provide accurate information about the bird species: ${name}. Be concise but informative. For the eBird species code, use the standard 6-letter code used on ebird.org.`,
    });
    return output as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body?.name;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Bird name is required" }, { status: 400 });
    }

    const nuthatch = await fetchNuthatchData(name);

    const missingFields = {
      taxonomy: !nuthatch?.sciName || !nuthatch?.order || !nuthatch?.family,
      conservation: !nuthatch?.status,
    };

    const aiData = await fetchAIData(name, missingFields);

    const mappedStatus = nuthatch?.status ? (conservationStatusMap[nuthatch.status] ?? null) : null;

    const result: Record<string, unknown> = {
      scientificName: nuthatch?.sciName ?? (aiData?.scientificName as string | undefined) ?? null,
      taxonomicOrder: nuthatch?.order ?? (aiData?.taxonomicOrder as string | undefined) ?? null,
      family: nuthatch?.family ?? (aiData?.family as string | undefined) ?? null,
      conservationStatus:
        mappedStatus ?? (aiData?.conservationStatus as string | undefined) ?? null,
      habitat: (aiData?.habitat as string | undefined) ?? null,
      diet: (aiData?.diet as string | undefined) ?? null,
      facts: (aiData?.facts as string[] | undefined) ?? null,
      ebirdSpeciesCode: (aiData?.ebirdSpeciesCode as string | undefined) ?? null,
      source: {
        nuthatch: nuthatch !== null,
        ai: aiData !== null,
      },
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to look up bird information" }, { status: 500 });
  }
}
