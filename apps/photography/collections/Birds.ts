import type { CollectionConfig } from "payload";
import { publicRead, isAuthenticated } from "@/lib/access";
import { generateSlug } from "@/hooks/generateSlug";

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
  hooks: {
    beforeChange: [generateSlug],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "birdLookup",
      type: "ui",
      admin: {
        components: {
          Field: "@/components/admin/bird-lookup-button",
        },
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Auto-generated from name",
      },
    },
    {
      name: "scientificName",
      type: "text",
    },
    {
      name: "taxonomicOrder",
      type: "text",
      admin: {
        description: "e.g. Passeriformes, Accipitriformes",
      },
    },
    {
      name: "family",
      type: "text",
      admin: {
        description: "e.g. Corvidae, Accipitridae",
      },
    },
    {
      name: "ebirdSpeciesCode",
      type: "text",
      admin: {
        position: "sidebar",
        description:
          "6-letter eBird code (e.g. amerob). Find at ebird.org/species",
      },
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
    {
      name: "photos",
      type: "join",
      collection: "photos",
      on: "bird",
    },
  ],
};
