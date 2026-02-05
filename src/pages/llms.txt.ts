import type { APIRoute } from "astro";
import { posts } from "@/data/posts";
import { projects } from "@/data/projects";

const SITE_URL = "https://brandynbritton.com";

export const GET: APIRoute = () => {
  const sortedPosts = [...posts].sort(
    (a, b) =>
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
  );

  const lines = [
    "# Brandyn Britton",
    "",
    "> Senior Software Engineer from Perth, Western Australia building scalable systems and crafting delightful experiences for the education and healthcare sectors.",
    "",
    "## Pages",
    "",
    `- [Home](${SITE_URL}): Portfolio homepage with about, experience, projects, and contact sections`,
    `- [Blog](${SITE_URL}/blog): Thoughts on software engineering, game development, and creative coding`,
    "",
    "## Blog Posts",
    "",
    ...sortedPosts.map(
      (post) =>
        `- [${post.title}](${SITE_URL}/blog/${post.slug}): ${post.description}`,
    ),
    "",
    "## Optional",
    "",
    ...projects.map(
      (project) =>
        `- [${project.name}](${project.url ?? SITE_URL}): ${project.description}`,
    ),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
