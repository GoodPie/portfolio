export { cn } from "@goodpie/ui/lib/utils";

export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-AU", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}
