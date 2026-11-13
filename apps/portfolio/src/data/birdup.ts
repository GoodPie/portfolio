import type { ImageMetadata } from "astro";
import explore from "@/assets/birdup/explore.png";
import sighting from "@/assets/birdup/sighting.png";
import speciesSeasonal from "@/assets/birdup/species-seasonal.png";

export interface BirdUp {
  name: string;
  /** Two sentences for a birder. The homepage introduces BirdUp and hands off to birdup.com.au. */
  blurb: string;
  /** One data line under the links */
  fact: string;
  links: { label: string; href: string }[];
  /** App screens, as published on birdup.com.au */
  screens: { image: ImageMetadata; alt: string; caption: string }[];
  stack: string[];
  /** Short build notes for the engineering section */
  notes: { title: string; body: string }[];
}

export const birdup: BirdUp = {
  name: "BirdUp",
  blurb:
    "A field notebook and field guide for Australian birds that also scouts what's worth looking for nearby. It works without reception, and it hides the locations of threatened species.",
  fact: "850+ species · free on iOS and Android",
  links: [
    { label: "App Store", href: "https://apps.apple.com/au/app/birdup-australia/id6760929876" },
    {
      label: "Google Play",
      href: "https://play.google.com/store/apps/details?id=com.birdup.mobile",
    },
    { label: "birdup.com.au", href: "https://birdup.com.au" },
  ],
  screens: [
    {
      image: sighting,
      alt: "A logged Willie Wagtail sighting in BirdUp",
      caption: "Log the bird while it's still on the branch.",
    },
    {
      image: speciesSeasonal,
      alt: "The Rainbow Bee-eater species page in BirdUp",
      caption: "Every species page tells you whether it's here this month.",
    },
    {
      image: explore,
      alt: "The explore map in BirdUp showing nearby sightings",
      caption: "See what other birders found nearby.",
    },
  ],
  stack: ["Rails 8", "PostGIS", "React Native", "Expo", "Next.js", "WorkOS"],
  notes: [
    {
      title: "Offline first",
      body: "Sightings save on the phone and sync when it has signal again.",
    },
    {
      title: "Photo ID that knows where it is",
      body: "Suggestions are weighted by the species that occur near you that month.",
    },
    {
      title: "Threatened species stay hidden",
      body: "Their locations are obscured automatically, even from the AI.",
    },
  ],
};
