"use client";

import type { DefaultCellComponentProps } from "payload";
import type { Photo } from "@/payload-types";
import { useConfig } from "@payloadcms/ui";
import { formatAdminURL } from "payload/shared";
import Link from "next/link";

export default function ThumbnailCell({
  collectionSlug,
  link,
  linkURL,
  rowData,
}: DefaultCellComponentProps) {
  const { thumbnailURL, title, id } = rowData as Photo;
  const {
    config: {
      routes: { admin: adminRoute },
    },
  } = useConfig();

  const href =
    linkURL ??
    formatAdminURL({
      adminRoute,
      path: `/collections/${collectionSlug}/${encodeURIComponent(String(id))}`,
    });

  const content = (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {thumbnailURL && (
        <img
          alt={title ?? ""}
          height={40}
          loading="lazy"
          src={thumbnailURL}
          style={{ borderRadius: "4px", flexShrink: 0, objectFit: "cover" }}
          width={60}
        />
      )}
      <span>{title}</span>
    </div>
  );

  if (link) {
    return (
      <Link href={href} prefetch={false}>
        {content}
      </Link>
    );
  }

  return content;
}
