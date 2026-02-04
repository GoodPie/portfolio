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
      "Secure Rails console access for AI agents through Model Context Protocol with safety features and read-only modes.",
    technologies: ["Ruby", "Rails", "MCP"],
    url: "https://github.com/Goodpie/rails-active-mcp",
  },
  {
    id: "02",
    name: "GameMaker Server",
    description:
      "Multiplayer game server for GameMaker:Studio written in Python, enabling real-time networked gameplay.",
    technologies: ["Python", "Networking", "GameMaker"],
    url: "https://github.com/Goodpie/gamemaker-server",
  },
  {
    id: "03",
    name: "Modular Tree",
    description:
      "Create dynamic procedural trees in Blender. Fork of MTree with enhanced features for 3D artists.",
    technologies: ["Python", "Blender", "3D"],
    url: "https://github.com/Goodpie/modular_tree",
  },
];
