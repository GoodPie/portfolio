import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@goodpie/ui/components/button";
import "./globals.css";

export const metadata: Metadata = {
  title: "Photography | Brandyn Britton",
  description: "Photography portfolio by Brandyn Britton",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-background text-foreground">
        {/* Navigation */}
        <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="font-serif text-lg font-medium tracking-tight text-foreground hover:text-primary transition-colors"
            >
              Photography
            </Link>
            <div className="flex items-center gap-1">
              <Button asChild variant="ghost" size="sm">
                <Link href="/">Galleries</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <a href="https://brandynbritton.com">&larr; Main Site</a>
              </Button>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border/40 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Brandyn Britton
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
