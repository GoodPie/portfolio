import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Project } from "@/data/projects";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const cardContent = (
    <Card className="bg-card border-border hover:border-teal/30 transition-colors group h-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <h3 className="text-xl font-serif">
          {project.name}
          <span className="text-teal">.</span>
        </h3>
        <div className="flex items-center gap-2">
          {project.url && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground group-hover:text-teal transition-colors"
              aria-hidden="true"
            >
              <path d="M7 7h10v10" />
              <path d="M7 17 17 7" />
            </svg>
          )}
          <span className="text-sm text-muted-foreground">{project.id}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {project.technologies.map((tech) => (
            <Badge
              key={tech}
              variant="outline"
              className="text-xs font-mono font-normal"
            >
              {tech}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (project.url) {
    return (
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
        aria-label={`View ${project.name} on GitHub`}
      >
        {cardContent}
      </a>
    );
  }

  return cardContent;
}
