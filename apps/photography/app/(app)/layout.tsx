import Link from "next/link";
import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { getSiteConfig } from "@/lib/site-config";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();

  return {
    metadataBase: new URL(config.siteUrl),
    title: {
      template: `%s | ${config.siteTitle}`,
      default: `${config.siteTitle} | ${config.authorName}`,
    },
    description: config.siteDescription,
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
      siteName: config.authorName,
    },
    ...(config.twitterHandle && {
      twitter: {
        site: config.twitterHandle,
        creator: config.twitterHandle,
      },
    }),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = await getSiteConfig();

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
                {config.authorName}
                <span className="text-teal">.</span>
              </Link>
              <span className="text-muted-foreground/30">/</span>
              <span className="text-muted-foreground text-sm">Photography</span>
            </div>
            {config.portfolioLink && (
              <a
                href={config.portfolioLink.url}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                &larr; {config.portfolioLink.label}
              </a>
            )}
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-6 py-12 md:px-12 lg:px-24">{children}</main>

        {/* Footer */}
        <footer className="border-border/40 border-t py-8">
          <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-24">
            <p className="text-muted-foreground text-center text-sm">
              &copy; {new Date().getFullYear()} {config.authorName}
            </p>
          </div>
        </footer>
        {config.gaId && <GoogleAnalytics gaId={config.gaId} />}
      </body>
    </html>
  );
}
