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
      "Building healthcare technology solutions that connect patients with healthcare providers across Australia.",
    technologies: ["PHP", "GraphQL", "NextJS", "React", "TypeScript", "AWS"],
  },
  {
    id: "02",
    dateRange: "2024 — 2025",
    title: "Senior Software Engineer",
    company: "Ascend Health",
    companyUrl: "https://ascendhealth.com.au",
    description:
      "Developed healthcare software solutions improving patient care and clinical workflows.",
    technologies: ["PHP", "React", "TypeScript", "AWS"],
  },
  {
    id: "03",
    dateRange: "2019 — 2024",
    title: "Senior Software Engineer",
    company: "Consent2Go",
    companyUrl: "https://consent2go.com",
    description:
      "Led cross-functional teams building mobile apps with React Native/Expo. Spearheaded technical due diligence during SignMee acquisition. Mentored graduate engineers.",
    technologies: ["React Native", "Expo", ".NET", "TypeScript"],
  },
];
