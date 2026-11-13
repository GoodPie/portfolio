export interface Project {
  name: string;
  /** One plain line. Also read by llms.txt.ts. */
  description: string;
  url: string;
}

export const projects: Project[] = [
  {
    name: "Rails Active MCP",
    description: "Ruby gem that gives AI agents safe, audited access to the Rails console.",
    url: "https://github.com/Goodpie/rails-active-mcp",
  },
  {
    name: "Buildkite Notifier",
    description: "macOS menu bar app that watches CI builds.",
    url: "https://github.com/Goodpie/buildkite-build-notifier",
  },
  {
    name: "Flagr OpenFeature Provider",
    description: "JavaScript OpenFeature provider for OpenFlagr.",
    url: "https://github.com/openflagr/flagr-openfeature-provider-js",
  },
  {
    name: "Modular Tree",
    description: "Procedural tree generator for Blender 5, a fork of MTree.",
    url: "https://github.com/Goodpie/modular_tree",
  },
  {
    name: "GameMaker Server",
    description: "Python multiplayer server for GameMaker: Studio.",
    url: "https://github.com/Goodpie/gamemaker-server",
  },
  {
    name: "Frogs and Bee",
    description: "Date ideas, recipes and calendars for couples.",
    url: "https://github.com/Goodpie/frogs-and-bee",
  },
];
