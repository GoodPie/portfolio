import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    (
      process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3024/photography"
    ).replace(/\/photography$/, ""),
  ),
  title: {
    template: "%s | Photography | Brandyn Britton",
    default: "Photography | Brandyn Britton",
  },
  description:
    "A personal photography collection by Brandyn Britton — scenes and details captured between projects.",
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
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 md:px-12 lg:px-24">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="font-serif text-lg font-medium tracking-tight text-foreground hover:text-primary transition-colors"
              >
                Brandyn Britton
                <span className="text-teal">.</span>
              </Link>
              <span className="text-muted-foreground/30">/</span>
              <span className="text-sm text-muted-foreground">Photography</span>
            </div>
            <a
              href="https://brandynbritton.com"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; Portfolio
            </a>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-6 py-12 md:px-12 lg:px-24">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border/40 py-8">
          <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-24">
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Brandyn Britton
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
