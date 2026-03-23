import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://relay-panel.bitmacro.io";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/relays", "/api/", "/auth/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
