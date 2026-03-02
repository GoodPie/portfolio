import type { MetadataRoute } from "next";
import { getPayloadClient, getImageUrl } from "@/lib/payload";
import type { PhotoDoc } from "@/lib/payload";

export const revalidate = 3600;

const BASE_URL = "https://brandynbritton.com/photography";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "photos",
    depth: 0,
    limit: 1000,
    sort: "-dateTaken",
  });

  const photos = docs as unknown as PhotoDoc[];

  const photoEntries: MetadataRoute.Sitemap = photos.map((photo) => ({
    url: `${BASE_URL}/photo/${photo.id}`,
    lastModified: new Date(),
    priority: 0.7,
    images: [getImageUrl(photo, 1200)],
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      priority: 1.0,
    },
    ...photoEntries,
  ];
}
