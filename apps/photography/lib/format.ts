export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatExposure(time: number): string {
  if (time >= 1) return `${time}s`;
  return `1/${Math.round(1 / time)}s`;
}
