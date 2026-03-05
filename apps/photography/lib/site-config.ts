import { unstable_cache } from "next/cache";
import type { SiteSetting } from "@/payload-types";
import { getPayloadClient } from "./payload";

export interface SiteConfig {
  // Env-derived
  siteUrl: string;
  photographyUrl: string;
  gaId: string | null;

  // Branding
  siteTitle: string;
  siteDescription: string;
  authorName: string;
  twitterHandle: string | null;
  portfolioLink: { url: string; label: string } | null;

  // Gallery page
  heroHeadline: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutLeft: string | null;
  aboutRight: string | null;

  // Birds page
  birdsSubtitle: string;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3024";
const gaId = process.env.NEXT_PUBLIC_GA_ID || null;

const getCachedSettings = unstable_cache(
  async (): Promise<SiteSetting> => {
    const payload = await getPayloadClient();
    return (await payload.findGlobal({ slug: "site-settings" })) as SiteSetting;
  },
  ["site-settings"],
  { revalidate: 60, tags: ["site-settings"] },
);

export async function getSiteConfig(): Promise<SiteConfig> {
  const settings = await getCachedSettings();

  const hasPortfolioLink = settings.portfolioLink?.url?.trim();

  return {
    siteUrl,
    photographyUrl: `${siteUrl}/photography`,
    gaId,

    siteTitle: settings.siteTitle || "Photography",
    siteDescription:
      settings.siteDescription ||
      "A personal photography collection — scenes and details captured between projects.",
    authorName: settings.authorName || "Brandyn Britton",
    twitterHandle: settings.twitterHandle || null,
    portfolioLink: hasPortfolioLink
      ? {
          url: settings.portfolioLink!.url!.trim(),
          label: settings.portfolioLink?.label?.trim() || "Portfolio",
        }
      : null,

    heroHeadline: settings.heroHeadline || "Mostly birds",
    heroSubtitle:
      settings.heroSubtitle || "Sometimes landscapes. Occasionally something else entirely.",
    aboutTitle: settings.aboutTitle || "About This Collection",
    aboutLeft: settings.aboutLeft || null,
    aboutRight: settings.aboutRight || null,

    birdsSubtitle: settings.birdsSubtitle || "Every bird I've had the privilege of photographing.",
  };
}
