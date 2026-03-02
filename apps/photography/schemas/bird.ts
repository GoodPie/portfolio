import { defineType, defineField } from "sanity";

export const bird = defineType({
  name: "bird",
  title: "Bird",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
    }),
    defineField({
      name: "scientificName",
      title: "Scientific Name",
      type: "string",
    }),
    defineField({
      name: "habitat",
      title: "Habitat",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "diet",
      title: "Diet",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "conservationStatus",
      title: "Conservation Status",
      type: "string",
      options: {
        list: [
          "Least Concern",
          "Near Threatened",
          "Vulnerable",
          "Endangered",
          "Critically Endangered",
        ],
      },
    }),
    defineField({
      name: "facts",
      title: "Fun Facts",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: {
        hotspot: true,
        metadata: ["lqip", "palette"],
      },
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "scientificName",
      media: "coverImage",
    },
  },
});
