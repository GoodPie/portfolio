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
    name: "FastCache",
    description:
      "A high-performance distributed caching library for Node.js with automatic invalidation and clustering support.",
    technologies: ["TypeScript", "Redis", "Node.js"],
    url: "https://github.com",
  },
  {
    id: "02",
    name: "QueryBuilder",
    description:
      "Type-safe SQL query builder with support for PostgreSQL, MySQL, and SQLite. Over 5k stars on GitHub.",
    technologies: ["TypeScript", "SQL", "Testing"],
    url: "https://github.com",
  },
  {
    id: "03",
    name: "DevMetrics",
    description:
      "Real-time dashboard for monitoring application performance and developer productivity metrics.",
    technologies: ["React", "Go", "Prometheus"],
    url: "https://github.com",
  },
];
