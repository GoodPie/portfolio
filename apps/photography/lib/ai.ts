import { google } from "@ai-sdk/google";

// Straight to Google with GOOGLE_GENERATIVE_AI_API_KEY. Vercel AI Gateway's free
// tier refuses every Gemini model and BYOK, so the gateway is not used.
export const model = google("gemini-3.8-flash");
