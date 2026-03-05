import { generateText, Output, createGateway } from "ai";
import { z } from "zod";

const scoringSchema = z.object({
  technical: z
    .number()
    .min(0)
    .max(100)
    .describe("Technical quality: sharpness, exposure, noise, dynamic range"),
  composition: z
    .number()
    .min(0)
    .max(100)
    .describe("Composition: framing, background quality, rule of thirds, negative space"),
  subjectImpact: z
    .number()
    .min(0)
    .max(100)
    .describe("Subject impact: behavior, pose quality, eye contact, emotional response"),
  uniqueness: z
    .number()
    .min(0)
    .max(100)
    .describe("Uniqueness: unusual moment/angle/lighting, rarity of behavior"),
  aiNotes: z.string().describe("Brief 1-2 sentence assessment of the photo"),
});

export interface PhotoScores {
  overall: number;
  technical: number;
  composition: number;
  subjectImpact: number;
  uniqueness: number;
  aiNotes: string;
  scoredAt: string;
}

const WEIGHTS = {
  technical: 0.2,
  composition: 0.3,
  subjectImpact: 0.3,
  uniqueness: 0.2,
};

export async function scorePhoto(
  imageUrl: string,
  exif?: {
    focalLength?: number | null;
    aperture?: number | null;
    shutterSpeed?: number | null;
    iso?: number | null;
  } | null,
): Promise<PhotoScores> {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    throw new Error("AI_GATEWAY_API_KEY is required for photo scoring");
  }

  const gateway = createGateway({ apiKey });

  let exifContext = "";
  if (exif) {
    const parts: string[] = [];
    if (exif.focalLength) parts.push(`${exif.focalLength}mm`);
    if (exif.aperture) parts.push(`f/${exif.aperture}`);
    if (exif.shutterSpeed) parts.push(`${exif.shutterSpeed}s`);
    if (exif.iso) parts.push(`ISO ${exif.iso}`);
    if (parts.length > 0) {
      exifContext = `\n\nEXIF context: ${parts.join(", ")}`;
    }
  }

  const { output } = await generateText({
    model: gateway("google/gemini-3-flash"),
    output: Output.object({ schema: scoringSchema }),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You are an expert bird and nature photography judge. Rate this photograph on four dimensions, each from 0-100.

Technical Quality (sharpness of subject especially eye/feather detail, exposure accuracy, noise level appropriate for the shooting conditions, dynamic range):
Composition (framing and placement of subject, background quality and separation, use of negative space, leading lines, rule of thirds):
Subject Impact (interesting behavior or moment captured, pose quality, eye contact with camera, emotional response the image evokes):
Uniqueness (how unusual or rare this moment/angle/lighting is, whether this captures something beyond a standard perch shot):${exifContext}

Be strict but fair. Reserve 90+ for truly exceptional shots. A decent clear photo of a perched bird with clean background should score around 60-70. Flight shots with sharp detail, interesting behavior, or dramatic lighting should score higher.

Return a brief 1-2 sentence note explaining your assessment.`,
          },
          {
            type: "image",
            image: new URL(imageUrl),
          },
        ],
      },
    ],
  });

  if (!output) {
    throw new Error("No output returned from scoring model");
  }

  const overall = Math.round(
    output.technical * WEIGHTS.technical +
      output.composition * WEIGHTS.composition +
      output.subjectImpact * WEIGHTS.subjectImpact +
      output.uniqueness * WEIGHTS.uniqueness,
  );

  return {
    overall,
    technical: output.technical,
    composition: output.composition,
    subjectImpact: output.subjectImpact,
    uniqueness: output.uniqueness,
    aiNotes: output.aiNotes,
    scoredAt: new Date().toISOString(),
  };
}
