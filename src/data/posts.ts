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
    title: "Reviving MTree: A Procedural Tree Generator for Blender 5",
    description:
      "MTree was the best Blender addon for procedural trees, but it stopped working after Blender 2.8. I forked it, fixed it for Blender 5, and added L-Systems and Weber-Penn crown shapes.",
    publishDate: "2026-01-15",
    tags: ["Blender 5", "Procedural Generation", "UE5", "Open Source", "Python"],
  },
];
