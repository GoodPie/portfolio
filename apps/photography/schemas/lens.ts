import { defineType, defineField } from "sanity";

export const lens = defineType({
  name: "lens",
  title: "Lens",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "e.g. FE 200-600mm F5.6-6.3 G OSS",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "manufacturer",
      title: "Manufacturer",
      type: "string",
      description: "e.g. Sony, Sigma, Tamron",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "manufacturer",
    },
  },
});
