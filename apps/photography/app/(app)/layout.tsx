import Link from "next/link";
import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const COPYRIGHT_YEAR = new Date().getFullYear();

export const metadata: Metadata = {
  metadataBase: new URL(
    (process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3024/photography").replace(
      /\/photography$/,
      "",
    ),
  ),
  title: {
    template: "%s | Photography | Brandyn Britton",
    default: "Photography | Brandyn Britton",
  },
  description:
    "A personal photography collection by Brandyn Britton — scenes and details captured between projects.",
  icons: {
    icon: [
      { url: "/photography/favicon.ico", sizes: "any" },
      { url: "/photography/favicon.svg", type: "image/svg+xml" },
      { url: "/photography/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/photography/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/photography/apple-touch-icon.png",
  },
  openGraph: {
    siteName: "Brandyn Britton",
  },
  twitter: {
    site: "@brandynbb96",
    creator: "@brandynbb96",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body className="bg-background text-foreground min-h-screen">
        {/* Navigation */}
        <nav className="border-border/40 bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur-sm">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 md:px-12 lg:px-24">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-foreground hover:text-primary font-serif text-lg font-medium tracking-tight transition-colors"
              >
                Brandyn Britton
                <span className="text-teal">.</span>
              </Link>
              <span className="text-muted-foreground/30">/</span>
              <span className="text-muted-foreground text-sm">Photography</span>
            </div>
            <a
              href="https://brandynbritton.com"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              &larr; Portfolio
            </a>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-6 py-12 md:px-12 lg:px-24">{children}</main>

        {/* Footer */}
        <footer className="border-border/40 border-t py-8">
          <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-24">
            <p className="text-muted-foreground text-center text-sm">
              &copy; {COPYRIGHT_YEAR} Brandyn Britton
            </p>
          </div>
        </footer>
        <GoogleAnalytics gaId="G-765RVP276V" />
      </body>
    </html>
  );
}
