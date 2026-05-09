import type { Metadata, Viewport } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteUrl = "https://www.mywinlist.com";
const siteName = "The Win List";
const siteDescription =
  "The Win List is a free daily wins tracker for core habits, optional routines, mood status, streaks, reminders, and offline-first progress.";
const iconPath = `${basePath}/icon.svg`;
const icon192Path = `${basePath}/icon-192.png`;
const appleTouchIconPath = `${basePath}/apple-touch-icon.png`;
const manifestPath = `${basePath}/manifest.webmanifest`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: "The Win List | Daily Wins Tracker",
    template: `%s | ${siteName}`
  },
  description: siteDescription,
  keywords: [
    "The Win List",
    "mywinlist",
    "daily wins tracker",
    "habit tracker",
    "routine tracker",
    "streak tracker",
    "offline habit tracker",
    "no signup habit tracker",
    "daily routine app",
    "core wins"
  ],
  authors: [{ name: "Abhey Deep" }],
  creator: "Abhey Deep",
  publisher: siteName,
  category: "productivity",
  manifest: manifestPath,
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  icons: {
    icon: [
      { url: iconPath, type: "image/svg+xml" },
      { url: icon192Path, sizes: "192x192", type: "image/png" }
    ],
    apple: [{ url: appleTouchIconPath, sizes: "180x180", type: "image/png" }]
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: "The Win List | Daily Wins Tracker",
    description: siteDescription,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "The Win List daily wins tracker"
      }
    ],
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "The Win List | Daily Wins Tracker",
    description: siteDescription,
    images: ["/opengraph-image"]
  },
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: "black-translucent"
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#111c19" },
    { media: "(prefers-color-scheme: light)", color: "#f5f7f2" }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
