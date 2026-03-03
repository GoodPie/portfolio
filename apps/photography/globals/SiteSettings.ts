import type { GlobalConfig } from "payload";
import { publicRead, isAdmin } from "@/lib/access";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Settings",
  access: {
    read: publicRead,
    update: isAdmin,
  },
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
