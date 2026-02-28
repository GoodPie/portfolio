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
  {
    slug: "zero-downtime-rails-8-kamal-aws",
    title: "Zero-Downtime Rails 8 Deployments on AWS with Kamal: A Complete Guide",
    description:
      "A complete guide to deploying Rails 8 applications on AWS using Kamal. Learn how to achieve zero-downtime deployments while reducing costs from $75 to $27/month.",
    publishDate: "2025-12-08",
    tags: ["Rails 8", "AWS", "Kamal", "DevOps", "Docker"],
  },
  {
    slug: "git-worktrees-multiple-branches",
    title: "Git Worktrees: Working on Multiple Branches Without the Headache",
    description:
      "Learn how Git worktrees let you check out multiple branches simultaneously, keeping your context intact while handling production emergencies, code reviews, and parallel feature development.",
    publishDate: "2025-07-10",
    tags: ["Git", "Developer Tools", "Workflow", "Productivity"],
  },
  {
    slug: "html-to-pdf-ruby-on-rails",
    title: "HTML to PDF in Ruby on Rails",
    description:
      "Explore modern solutions for converting HTML to PDF in Rails applications using Ruby-Puppeteer, moving beyond legacy tools like WickedPDF and Prawn.",
    publishDate: "2024-06-24",
    tags: ["Ruby on Rails", "PDF", "Puppeteer", "Backend"],
  },
  {
    slug: "encouraging-code-policies-git-hooks",
    title: "Encouraging Code Policies Using Git Hooks",
    description:
      "A practical exploration of using Git hooks to enforce code policies, demonstrated through a pre-commit hook that validates translation file consistency in a React i18n project.",
    publishDate: "2024-01-04",
    tags: ["Git", "Developer Tools", "i18n", "Python"],
  },
];
