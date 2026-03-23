import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://relay-panel.bitmacro.io";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
  ];
}
