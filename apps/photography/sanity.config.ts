import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";

export default defineConfig({
  name: "photography",
  title: "Photography Portfolio",
  projectId: "acr6dsfp",
  dataset: "production",
  basePath: "/photography/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            // Site Settings singleton
            S.listItem()
              .title("Site Settings")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
              ),
            S.divider(),
            // Galleries
            S.documentTypeListItem("gallery").title("Galleries"),
            // Categories
            S.documentTypeListItem("category").title("Categories"),
            S.divider(),
            // Equipment
            S.documentTypeListItem("camera").title("Cameras"),
            S.documentTypeListItem("lens").title("Lenses"),
            S.divider(),
            // Birds
            S.documentTypeListItem("bird").title("Birds"),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});
