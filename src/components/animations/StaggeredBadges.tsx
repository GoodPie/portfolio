import { motion, useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/badge";

interface Props {
  technologies: string[];
  className?: string;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export default function StaggeredBadges({ technologies, className }: Props) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={className}>
        {technologies.map((tech) => (
          <Badge key={tech} variant="secondary" className="text-xs font-normal">
            {tech}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={className}
    >
      {technologies.map((tech) => (
        <motion.div key={tech} variants={item} className="motion-fade-in">
          <Badge variant="secondary" className="text-xs font-normal">
            {tech}
          </Badge>
        </motion.div>
      ))}
    </motion.div>
  );
}
