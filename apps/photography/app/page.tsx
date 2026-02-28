import Link from "next/link";
import Image from "next/image";
import { client, urlFor, getLqip } from "@/lib/sanity";

interface Gallery {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  date?: string;
  category?: string;
  coverImage: {
    asset: {
      _id: string;
      metadata?: {
        lqip?: string;
        dimensions?: { width: number; height: number };
      };
    };
  };
  imageCount?: number;
}

async function getGalleries(): Promise<Gallery[]> {
  return client.fetch(
    `*[_type == "gallery"] | order(date desc) {
      _id,
      title,
      slug,
      description,
      date,
      "category": category->title,
      coverImage {
        ...,
        asset-> {
          _id,
          metadata {
            lqip,
            dimensions
          }
        }
      },
      "imageCount": count(images)
    }`,
    {},
    { next: { revalidate: 60 } }
  );
}

export default async function GalleriesPage() {
  const galleries = await getGalleries();

  return (
    <>
      {/* Hero */}
      <section className="mb-12 text-center">
        <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
          Photography
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          A collection of moments captured through the lens.
        </p>
      </section>

      {/* Gallery grid */}
      {galleries.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {galleries.map((gallery) => {
            const lqip = getLqip(gallery.coverImage);
            return (
              <Link
                key={gallery._id}
                href={`/gallery/${gallery.slug.current}`}
                className="group relative overflow-hidden rounded-lg border border-border/40 bg-card transition-all hover:border-primary/40 hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <Image
                    src={urlFor(gallery.coverImage)
                      .width(800)
                      .auto("format")
                      .url()}
                    alt={gallery.title}
                    width={800}
                    height={600}
                    placeholder={lqip ? "blur" : "empty"}
                    blurDataURL={lqip}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-lg font-medium">
                      {gallery.title}
                    </h2>
                    {gallery.imageCount && (
                      <span className="text-xs text-muted-foreground">
                        {gallery.imageCount} photos
                      </span>
                    )}
                  </div>
                  {gallery.category && (
                    <span className="mt-1 inline-block text-xs text-primary">
                      {gallery.category}
                    </span>
                  )}
                  {gallery.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {gallery.description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24">
          <p className="text-muted-foreground">No galleries yet.</p>
          <Link
            href="/studio"
            className="mt-4 inline-block text-sm text-primary hover:underline"
          >
            Open Studio to create your first gallery &rarr;
          </Link>
        </div>
      )}
    </>
  );
}
