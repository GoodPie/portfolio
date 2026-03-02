import type { CollectionConfig } from "payload";

export const Lenses: CollectionConfig = {
  slug: "lenses",
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
