import type { CollectionConfig } from "payload";

export const Cameras: CollectionConfig = {
  slug: "cameras",
  admin: {
    useAsTitle: "name",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "manufacturer",
      type: "text",
    },
  ],
};
