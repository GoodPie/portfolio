import type { Post } from "@/data/posts";

const SITE_URL = "https://brandynbritton.com";

const AUTHOR_PERSON = {
  "@type": "Person",
  name: "Brandyn Britton",
  url: SITE_URL,
};

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Brandyn Britton",
    url: SITE_URL,
    jobTitle: "Senior Software Engineer",
    sameAs: [
      "https://github.com/Goodpie",
      "https://linkedin.com/in/brandyn-britton",
    ],
  };
}

export function blogPostingSchema({
  title,
  description,
  publishDate,
  slug,
  tags,
}: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    author: AUTHOR_PERSON,
    datePublished: publishDate,
    url: `${SITE_URL}/blog/${slug}`,
    keywords: tags,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${slug}`,
    },
  };
}

export function blogSchema(posts: Post[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog | Brandyn Britton",
    description:
      "Thoughts on software engineering, game development, and creative coding.",
    url: `${SITE_URL}/blog`,
    author: AUTHOR_PERSON,
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.publishDate,
      url: `${SITE_URL}/blog/${post.slug}`,
      keywords: post.tags,
    })),
  };
}

export function breadcrumbSchema(
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
