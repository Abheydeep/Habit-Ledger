import type { Metadata, Viewport } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteUrl = "https://www.mywinlist.com";
const siteName = "The Win List";
const siteDescription =
  "The Win List is a free habit tracker app for 5 core wins, optional routines, Mood logging, streaks, and offline-first progress. No sign up needed.";
const iconPath = `${basePath}/icon.svg`;
const icon192Path = `${basePath}/icon-192.png`;
const appleTouchIconPath = `${basePath}/apple-touch-icon.png`;
const manifestPath = `${basePath}/manifest.webmanifest`;
const themeInitScript = `
(() => {
  try {
    const storageKey = "the-win-list:color-scheme:v1";
    const stored = window.localStorage.getItem(storageKey);
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const scheme = stored === "dark" || stored === "light" ? stored : prefersDark ? "dark" : "light";
    const color = scheme === "dark" ? "#111c19" : "#f5f7f2";
    const root = document.documentElement;
    root.dataset.colorScheme = scheme;
    root.style.backgroundColor = color;
    const setMeta = (name, content) => {
      let meta = document.querySelector('meta[name="' + name + '"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", name);
        document.head.append(meta);
      }
      meta.setAttribute("content", content);
    };
    setMeta("theme-color", color);
    setMeta("msapplication-TileColor", color);
    setMeta("apple-mobile-web-app-status-bar-style", scheme === "dark" ? "black-translucent" : "default");
  } catch {
    document.documentElement.style.backgroundColor = "#f5f7f2";
  }
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: "Free Habit Tracker App, No Login | The Win List",
    template: `%s | ${siteName}`
  },
  description: siteDescription,
  keywords: [
    "The Win List",
    "mywinlist",
    "habit tracker app",
    "free habit tracker app",
    "habit tracker no sign up",
    "habit tracker without login",
    "online habit tracker",
    "daily habit tracker",
    "daily wins tracker",
    "habit tracker",
    "routine tracker",
    "streak tracker",
    "offline habit tracker",
    "habit tracker pwa",
    "habit tracker for students",
    "habit tracker for working professionals",
    "habit tracker for homemakers",
    "rest day habit tracker",
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
    title: "Free Habit Tracker App, No Login | The Win List",
    description: siteDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "The Win List free habit tracker app"
      }
    ],
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Habit Tracker App, No Login | The Win List",
    description: siteDescription,
    images: ["/og-image.png"]
  },
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: "black-translucent"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#111c19" },
    { media: "(prefers-color-scheme: light)", color: "#f5f7f2" }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
