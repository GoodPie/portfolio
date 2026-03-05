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
      type: "tabs",
      tabs: [
        {
          label: "Branding",
          fields: [
            {
              name: "siteTitle",
              label: "Site Title",
              type: "text",
              required: true,
              defaultValue: "Photography",
              admin: {
                description: "Used in browser tab title template (e.g. 'Photo Name | Photography')",
              },
            },
            {
              name: "siteDescription",
              label: "Default Meta Description",
              type: "textarea",
              defaultValue:
                "A personal photography collection — scenes and details captured between projects.",
            },
            {
              name: "authorName",
              label: "Author Name",
              type: "text",
              required: true,
              defaultValue: "Brandyn Britton",
              admin: {
                description: "Shown in navigation, footer, JSON-LD, and metadata fallbacks",
              },
            },
            {
              name: "twitterHandle",
              label: "Twitter Handle",
              type: "text",
              admin: {
                description:
                  "e.g. @username — used for Twitter Card meta tags. Leave empty to omit.",
              },
            },
            {
              name: "portfolioLink",
              label: "Portfolio Link",
              type: "group",
              admin: {
                description:
                  "Optional external link shown in the navigation bar. Leave URL empty to hide.",
              },
              fields: [
                {
                  name: "url",
                  label: "URL",
                  type: "text",
                },
                {
                  name: "label",
                  label: "Label",
                  type: "text",
                  defaultValue: "Portfolio",
                },
              ],
            },
          ],
        },
        {
          label: "Gallery Page",
          fields: [
            {
              name: "heroImage",
              type: "upload",
              relationTo: "photos",
            },
            {
              name: "heroHeadline",
              label: "Hero Headline",
              type: "text",
              defaultValue: "Mostly birds",
            },
            {
              name: "heroSubtitle",
              label: "Hero Subtitle",
              type: "textarea",
              defaultValue: "Sometimes landscapes. Occasionally something else entirely.",
            },
            {
              name: "aboutTitle",
              label: "About Section Title",
              type: "text",
              defaultValue: "About This Collection",
            },
            {
              name: "aboutLeft",
              label: "About — Left Column",
              type: "textarea",
              admin: {
                description: "Separate paragraphs with a blank line (double newline).",
              },
            },
            {
              name: "aboutRight",
              label: "About — Right Column",
              type: "textarea",
              admin: {
                description: "Separate paragraphs with a blank line (double newline).",
              },
            },
          ],
        },
        {
          label: "Birds Page",
          fields: [
            {
              name: "birdsSubtitle",
              label: "Birds Page Subtitle",
              type: "textarea",
              defaultValue: "Every bird I've had the privilege of photographing.",
            },
          ],
        },
      ],
    },
  ],
};
