import type { PhotoDoc } from "@/lib/payload";
import type { MetadataRoute } from "next";
import { getPayloadClient, getImageUrl, getAllBirds } from "@/lib/payload";

export const revalidate = 3600;

const BASE_URL = "https://brandynbritton.com/photography";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient();
  const [{ docs }, birds] = await Promise.all([
    payload.find({
      collection: "photos",
      depth: 0,
      limit: 1000,
      sort: "-dateTaken",
    }),
    getAllBirds(),
  ]);

  const photos = docs as unknown as PhotoDoc[];

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
