import { motion, useReducedMotion } from "motion/react";

interface Props {
  className?: string;
  delay?: number;
}

export default function LineReveal({ className, delay = 0.3 }: Props) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className} />;
  }

  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      style={{ transformOrigin: "left" }}
      className={className ? `motion-line-reveal ${className}` : "motion-line-reveal"}
    />
  );
}
