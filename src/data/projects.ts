export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export const projects: Project[] = [
  {
    id: "01",
    name: "Rails Active MCP",
    description:
      "Published Ruby gem enabling secure Rails console access for AI agents via Model Context Protocol. Features safety controls, read-only modes, and audit logging for enterprise AI integrations.",
    technologies: ["Ruby", "Rails", "MCP", "AI Tooling"],
    url: "https://github.com/Goodpie/rails-active-mcp",
  },
  {
    id: "02",
    name: "Buildkite Notifier",
    description:
      "Native macOS menu bar application for monitoring CI/CD builds in real-time. Provides instant notifications for build status changes across multiple pipelines.",
    technologies: ["Swift", "macOS", "Buildkite API"],
    url: "https://github.com/Goodpie/buildkite-build-notifier",
  },
  {
    id: "03",
    name: "Flagr OpenFeature Provider",
    description:
      "Open source contribution to OpenFlagr ecosystem. JavaScript provider implementing the OpenFeature specification for standardized feature flag evaluation.",
    technologies: ["TypeScript", "OpenFeature", "Feature Flags"],
    url: "https://github.com/openflagr/flagr-openfeature-provider-js",
  },
  {
    id: "04",
    name: "GameMaker Server",
    description:
      "Multiplayer game server for GameMaker:Studio written in Python, enabling real-time networked gameplay with socket management and player synchronization.",
    technologies: ["Python", "Networking", "GameMaker"],
    url: "https://github.com/Goodpie/gamemaker-server",
  },
  {
    id: "05",
    name: "Frogs and Bee",
    description:
      "Personal life organization app for couples. Save date ideas, manage recipes, and sync with calendars—built as a full-stack TypeScript application.",
    technologies: ["TypeScript", "React", "Full Stack"],
    url: "https://github.com/Goodpie/frogs-and-bee",
  },
  {
    id: "06",
    name: "Modular Tree",
    description:
      "Create dynamic procedural trees in Blender 5. Fork of MTree with enhanced node-based generation for 3D artists and game developers.",
    technologies: ["Python", "Blender", "3D Modeling"],
    url: "https://github.com/Goodpie/modular_tree",
  },
];
