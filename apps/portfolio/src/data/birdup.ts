export interface Highlight {
  title: string;
  description: string;
}

export interface FeaturedProduct {
  /** Product name, rendered as the headline (a teal "." is appended in the template). */
  name: string;
  /** Off-sequence label shown above the headline, e.g. "Featured · Founder & Engineer". */
  eyebrow: string;
  /** One-line founder framing, set in the serif italic. */
  tagline: string;
  /** Pitch paragraph. */
  description: string;
  /** Signature features, rendered as a 3-up row. */
  highlights: Highlight[];
  /** Tech stack, rendered as outline badges. */
  stack: string[];
  /** Marketing site, the CTA target. */
  url: string;
  /** CTA label. */
  cta: string;
}

export const birdup: FeaturedProduct = {
  name: "BirdUp",
  eyebrow: "Featured · Founder & Engineer",
  tagline: "An Australian-first birding app I designed and built end to end.",
  description:
    "A field notebook and field guide that also scouts what's worth looking for nearby. It's an offline-first React Native app on a Rails 8 and PostGIS backend, with AI that identifies birds from a photo using the species that actually live near you and what's in season. Sensitive species have their locations hidden automatically.",
  highlights: [
    {
      title: "Works without signal",
      description: "Log a sighting anywhere, with no connection. It syncs once you're back online.",
    },
    {
      title: "Location-aware AI",
      description:
        "Snap a photo and BirdUp suggests the species, weighing what actually lives near you at that time of year.",
    },
    {
      title: "Conservation first",
      description: "Locations of threatened species stay hidden, even from the AI.",
    },
  ],
  stack: ["Rails 8", "PostGIS", "React Native", "Expo", "Next.js", "WorkOS"],
  url: "https://birdup.com.au",
  cta: "Visit BirdUp",
};
