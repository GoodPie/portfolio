export interface Post {
  slug: string;
  title: string;
  description: string;
  publishDate: string;
  tags: string[];
}

export const posts: Post[] = [
  {
    slug: "reviving-modular-tree",
    title: "Reviving Modular Tree for Blender 5",
    description:
      "Forking an abandoned Blender addon to learn about procedural tree generation and reconnect with my game development roots.",
    publishDate: "2026-01-15",
    tags: ["Blender", "Python", "Game Dev", "Open Source"],
  },
];
