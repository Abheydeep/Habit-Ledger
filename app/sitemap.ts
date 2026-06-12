import type { MetadataRoute } from "next";

const siteUrl = "https://www.mywinlist.com";
const lastModified = new Date("2026-06-12T00:00:00.000Z");

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${siteUrl}/habit-tracker`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.95
    },
    {
      url: `${siteUrl}/habit-tracker-no-sign-up`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.85
    },
    {
      url: `${siteUrl}/offline-habit-tracker`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.85
    },
    {
      url: `${siteUrl}/habit-tracker-for-students`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8
    },
    {
      url: `${siteUrl}/habit-tracker-for-working-professionals`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8
    },
    {
      url: `${siteUrl}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7
    },
    {
      url: `${siteUrl}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.55
    },
    {
      url: `${siteUrl}/terms`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.5
    },
    {
      url: `${siteUrl}/launch`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7
    },
    {
      url: `${siteUrl}/reel`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6
    }
  ];

  return routes;
}
