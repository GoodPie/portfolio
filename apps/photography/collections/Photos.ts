import type { CollectionConfig } from "payload";
import { generateBlurPlaceholder } from "@/hooks/generateBlurPlaceholder";
import { extractExifData } from "@/hooks/extractExifData";
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
    afterChange: [generateBlurPlaceholder, extractExifData],
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
      name: "location",
      type: "text",
    },
    {
      name: "dateTaken",
      type: "date",
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
        condition: (data) =>
          !!(
            data?.exif?.focalLength ||
            data?.exif?.aperture ||
            data?.exif?.iso
          ),
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
