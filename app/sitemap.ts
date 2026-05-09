import type { MetadataRoute } from "next";

const siteUrl = "https://www.mywinlist.com";
const lastModified = new Date("2026-05-09T00:00:00.000Z");

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "daily",
      priority: 1
    }
  ];
}
