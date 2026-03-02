import { defineType, defineField } from "sanity";

export const camera = defineType({
  name: "camera",
  title: "Camera",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "e.g. Sony A7R V",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "manufacturer",
      title: "Manufacturer",
      type: "string",
      description: "e.g. Sony, Canon, Nikon",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "manufacturer",
    },
  },
});
