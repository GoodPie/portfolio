import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Settings",
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      defaultValue: "Photography | Brandyn Britton",
    },
    {
      name: "description",
      type: "textarea",
      defaultValue:
        "A personal photography collection by Brandyn Britton — scenes and details captured between projects.",
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "photos",
    },
  ],
};
