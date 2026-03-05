import type { CollectionConfig } from "payload";
import { processUploadData } from "@/hooks/processUploadData";
import { revalidatePhotosCache } from "@/hooks/revalidateCache";
import { stripFullResolution } from "@/hooks/stripFullResolution";

export const Photos: CollectionConfig = {
  slug: "photos",
  admin: {
    useAsTitle: "title",
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  upload: {
    imageSizes: [
      { name: "thumbnail", width: 400, height: undefined },
      { name: "card", width: 800, height: undefined },
      { name: "large", width: 1200, height: undefined },
      { name: "xl", width: 1800, height: undefined },
      { name: "full", width: 2400, height: undefined },
    ],
    focalPoint: true,
    crop: true,
    adminThumbnail: "thumbnail",
    mimeTypes: ["image/*"],
  },
  hooks: {
    afterRead: [stripFullResolution],
    afterChange: [processUploadData, revalidatePhotosCache],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "caption",
      type: "text",
    },
    {
      name: "description",
      type: "textarea",
    },
    {
      name: "dateTaken",
      type: "date",
      index: true,
    },
    // Relationships
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
    },
    {
      name: "bird",
      type: "relationship",
      relationTo: "birds",
      index: true,
    },
    {
      name: "camera",
      type: "relationship",
      relationTo: "cameras",
    },
    {
      name: "lens",
      type: "relationship",
      relationTo: "lenses",
    },
    // EXIF data (auto-populated by hook)
    {
      name: "exif",
      type: "group",
      admin: {
        readOnly: true,
        condition: (data) => !!(data?.exif?.focalLength || data?.exif?.aperture || data?.exif?.iso),
      },
      fields: [
        { name: "focalLength", type: "number" },
        { name: "aperture", type: "number" },
        { name: "shutterSpeed", type: "number" },
        { name: "iso", type: "number" },
        { name: "lensModel", type: "text" },
        { name: "cameraModel", type: "text" },
      ],
    },
    // Geolocation (auto-populated by hook or manual via location search)
    {
      name: "geolocation",
      type: "group",
      fields: [
        {
          name: "locationSearch",
          type: "ui",
          admin: {
            components: {
              Field: "@/components/admin/location-search-field",
            },
          },
        },
        { name: "latitude", type: "number" },
        { name: "longitude", type: "number" },
      ],
    },
    // LQIP (auto-populated by hook)
    {
      name: "lqip",
      type: "text",
      admin: {
        readOnly: true,
        position: "sidebar",
      },
    },
    // Access control
    {
      name: "isProtected",
      type: "checkbox",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description: "When enabled, full-resolution downloads require authentication.",
      },
    },
    {
      name: "price",
      type: "number",
      admin: {
        position: "sidebar",
        description: "Price for full-resolution download (future ecommerce).",
        condition: (data) => data?.isProtected,
      },
    },
  ],
};
