import type { MetadataRoute } from "next";
import { getCachedSitemapPhotos, getCachedAllBirds, getImageUrl } from "@/lib/payload";

const BASE_URL = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3024"}/photography`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [photos, birds] = await Promise.all([getCachedSitemapPhotos(), getCachedAllBirds()]);

  const photoEntries: MetadataRoute.Sitemap = photos.map((photo) => ({
    url: `${BASE_URL}/photo/${photo.id}`,
    lastModified: photo.updatedAt ? new Date(photo.updatedAt) : new Date(),
    priority: 0.7,
    images: [getImageUrl(photo, 1200)],
  }));

  const birdEntries: MetadataRoute.Sitemap = birds.map((bird) => ({
    url: `${BASE_URL}/birds/${bird.slug}`,
    lastModified: bird.updatedAt ? new Date(bird.updatedAt) : new Date(),
    priority: 0.6,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/birds`,
      lastModified: new Date(),
      priority: 0.8,
    },
    ...birdEntries,
    ...photoEntries,
  ];
}
