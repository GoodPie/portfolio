/** Conservation status → Tailwind color class mapping. */
export const conservationStatusColors: Record<string, string> = {
  "Least Concern": "text-status-safe",
  "Near Threatened": "text-status-warning",
  Vulnerable: "text-status-caution",
  Endangered: "text-status-danger",
  "Critically Endangered": "text-status-critical",
};

/** Conservation status → badge variant-friendly bg color class. */
export const conservationStatusBgColors: Record<string, string> = {
  "Least Concern": "bg-status-safe/20 text-status-safe",
  "Near Threatened": "bg-status-warning/20 text-status-warning",
  Vulnerable: "bg-status-caution/20 text-status-caution",
  Endangered: "bg-status-danger/20 text-status-danger",
  "Critically Endangered": "bg-status-critical/20 text-status-critical",
};
