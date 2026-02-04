import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Project } from "@/data/projects";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="bg-card border-border hover:border-teal/30 transition-colors group">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <h3 className="text-xl font-serif">
          {project.name}
          <span className="text-teal">.</span>
        </h3>
        <span className="text-sm text-muted-foreground">{project.id}</span>
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
}
