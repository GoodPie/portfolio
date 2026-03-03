import type { Metadata } from "next";
import { cache } from "react";
import { ViewTransition } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPayloadClient, responsiveSrcSet, getImageUrl, getLqip, resolveRelation, getBirdBySlug } from "@/lib/payload";
import type { PhotoDoc } from "@/lib/payload";
import { PhotoSidebar } from "@/components/photo-sidebar";
import { PhotoJsonLd } from "@/components/photo-json-ld";

export const revalidate = 60;

const getPhoto = cache(async (id: string): Promise<PhotoDoc | null> => {
  const payload = await getPayloadClient();
  try {
    const raw = await payload.findByID({ collection: "photos", id, depth: 2 });
    return raw ? (raw as unknown as PhotoDoc) : null;
  } catch {
    return null;
  }
});

function buildDescription(photo: PhotoDoc): string {
  const parts: string[] = [];
  if (photo.caption) parts.push(photo.caption);
  if (photo.description) parts.push(photo.description);

  const bird = resolveRelation(photo.bird);
  const category = resolveRelation(photo.category);

  if (bird?.name) {
    parts.push(
      bird.scientificName
        ? `${bird.name} (${bird.scientificName})`
        : bird.name,
    );
  }
  if (category?.title) parts.push(category.title);
  if (photo.location) parts.push(`Taken in ${photo.location}`);

  return parts.join(" — ") || "Photo by Brandyn Britton";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const photo = await getPhoto(id);
  if (!photo) return { title: "Photo Not Found" };

  const title = photo.caption || photo.title;
  const description = buildDescription(photo);
  const imageUrl = getImageUrl(photo, 1200);

  const ogWidth = 1200;
  const ogHeight =
    photo.width && photo.height
      ? Math.round((ogWidth * photo.height) / photo.width)
      : undefined;

  return {
    title,
    description,
    openGraph: {
      type: "article",
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: ogWidth,
          ...(ogHeight && { height: ogHeight }),
          alt: title,
        },
      ],
      ...(photo.dateTaken && { publishedTime: photo.dateTaken }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `/photo/${id}`,
    },
  };
}

export default async function PhotoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const photo = await getPhoto(id);
  if (!photo) notFound();
  const lqip = getLqip(photo);

  // Build contextual back link
  let backHref = "/";
  let backLabel = "Back to gallery";

  if (from?.startsWith("birds/")) {
    const birdSlug = from.replace("birds/", "");
    const bird = await getBirdBySlug(birdSlug);
    if (bird) {
      backHref = `/birds/${birdSlug}`;
      backLabel = `Back to ${bird.name}`;
    }
  }

  return (
    <div>
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-foreground transition-colors mb-6 lg:mb-8"
      >
        &larr; {backLabel}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 lg:gap-16 items-start">
        {/* Meta — on mobile this renders below the photo (via order) */}
        <ViewTransition enter="meta-enter" default="none">
          <PhotoSidebar photo={photo} />
        </ViewTransition>

        {/* Photo */}
        <ViewTransition name={`photo-${id}`}>
          <div className="order-1 lg:order-2">
            <img
              src={getImageUrl(photo, 1800)}
              srcSet={responsiveSrcSet(photo)}
              sizes="(max-width: 1024px) 100vw, 65vw"
              alt={photo.caption || photo.title}
              width={photo.width ?? undefined}
              height={photo.height ?? undefined}
              fetchPriority="high"
              decoding="async"
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
              {...(lqip && {
                style: {
                  backgroundImage: `url(${lqip})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                },
              })}
            />
          </div>
        </ViewTransition>
      </div>

      <PhotoJsonLd photo={photo} description={buildDescription(photo)} id={id} />
    </div>
  );
}
