import type { CollectionConfig } from "payload";
import { publicRead, isAuthenticated } from "@/lib/access";

export const Lenses: CollectionConfig = {
  slug: "lenses",
  admin: {
    useAsTitle: "name",
  },
  access: {
    read: publicRead,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
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
