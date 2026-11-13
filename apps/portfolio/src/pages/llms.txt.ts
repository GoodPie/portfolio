import type { APIRoute } from "astro";
import { posts } from "@/data/posts";
import { projects } from "@/data/projects";

const SITE_URL = "https://brandynbritton.com";

export const GET: APIRoute = () => {
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
  );

  const lines = [
    "# Brandyn Britton",
    "",
    "> I photograph birds around Perth, Western Australia, and built BirdUp, a birding app for Australia. I also write about software.",
    "",
    "## Pages",
    "",
    `- [Home](${SITE_URL}): Bird photography, BirdUp, how it is built, writing, open source and work history`,
    `- [Blog](${SITE_URL}/blog): Thoughts on software engineering, game development, and creative coding`,
    "",
    "## Blog Posts",
    "",
    ...sortedPosts.map(
      (post) => `- [${post.title}](${SITE_URL}/blog/${post.slug}): ${post.description}`,
    ),
    "",
    "## Optional",
    "",
    ...projects.map((project) => `- [${project.name}](${project.url}): ${project.description}`),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
