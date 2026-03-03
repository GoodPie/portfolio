import type { CollectionConfig } from "payload";
import { publicRead, isAuthenticated } from "@/lib/access";

export const Birds: CollectionConfig = {
  slug: "birds",
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
      name: "scientificName",
      type: "text",
    },
    {
      name: "habitat",
      type: "textarea",
    },
    {
      name: "diet",
      type: "textarea",
    },
    {
      name: "conservationStatus",
      type: "select",
      options: [
        { label: "Least Concern", value: "Least Concern" },
        { label: "Near Threatened", value: "Near Threatened" },
        { label: "Vulnerable", value: "Vulnerable" },
        { label: "Endangered", value: "Endangered" },
        { label: "Critically Endangered", value: "Critically Endangered" },
      ],
    },
    {
      name: "facts",
      type: "array",
      fields: [
        {
          name: "fact",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "photos",
    },
  ],
};
