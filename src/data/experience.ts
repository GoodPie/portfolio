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
    dateRange: "2025 — PRESENT",
    title: "Senior Full Stack Engineer",
    company: "HealthEngine",
    companyUrl: "https://healthengine.com.au",
    description:
      "Building healthcare technology that connects millions of Australians with healthcare providers. Contributing to providing telehealth services in a hybrid team environment.",
    technologies: ["PHP", "GraphQL", "NextJS", "React", "TypeScript", "AWS"],
  },
  {
    id: "02",
    dateRange: "2024 — 2025",
    title: "Senior Software Engineer",
    company: "Ascend Health",
    companyUrl: "https://www.ascendhealthgroup.com.au",
    description:
      "Delivered healthcare software solutions improving patient care and clinical workflows for Allied Health practitioners. Drove technical leadership across an agile team while architecting scalable cloud infrastructure.",
    technologies: ["Ruby on Rails", "React", "PostgreSQL", "TypeScript", "AWS"],
  },
  {
    id: "03",
    dateRange: "2019 — 2024",
    title: "Senior Software Engineer",
    company: "Consent2Go",
    companyUrl: "https://consent2go.com",
    description:
      "Led cross-functional teams to develop the Consent2Go platform, including web and mobile apps serving thousands of parents and staff. Spearheaded technical due diligence during application acquisition, orchestrating .NET migration for seamless integration. Contributed to executive strategy, shaping product roadmaps during critical growth phases. Mentored graduate engineers, establishing technical standards that accelerated team productivity.",
    technologies: ["React Native", "Expo", ".NET", "C#", "TypeScript", "AWS"],
  },
];
