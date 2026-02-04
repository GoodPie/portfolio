export interface Experience {
  id: string;
  dateRange: string;
  title: string;
  company: string;
  companyUrl: string;
  description: string;
  technologies: string[];
}

export const experiences: Experience[] = [
  {
    id: "01",
    dateRange: "2022 — PRESENT",
    title: "Senior Software Engineer",
    company: "Vercel",
    companyUrl: "https://vercel.com",
    description:
      "Lead development of core platform features, optimizing build performance and deployment pipelines. Architect solutions serving millions of requests per day.",
    technologies: ["TypeScript", "Go", "React", "AWS", "Kubernetes"],
  },
  {
    id: "02",
    dateRange: "2019 — 2022",
    title: "Software Engineer",
    company: "Airbnb",
    companyUrl: "https://airbnb.com",
    description:
      "Developed search and discovery features improving user engagement. Contributed to the design system used across the platform.",
    technologies: ["Java", "React", "GraphQL", "Redis"],
  },
];
