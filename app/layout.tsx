import type { Metadata, Viewport } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const iconPath = `${basePath}/icon.svg`;
const icon192Path = `${basePath}/icon-192.png`;
const appleTouchIconPath = `${basePath}/apple-touch-icon.png`;
const manifestPath = `${basePath}/manifest.webmanifest`;

export const metadata: Metadata = {
  title: "The Win List",
  description: "A daily must-do wins app for planning and completing what matters today",
  manifest: manifestPath,
  icons: {
    icon: [
      { url: iconPath, type: "image/svg+xml" },
      { url: icon192Path, sizes: "192x192", type: "image/png" }
    ],
    apple: [{ url: appleTouchIconPath, sizes: "180x180", type: "image/png" }]
  },
  appleWebApp: {
    capable: true,
    title: "The Win List",
    statusBarStyle: "default"
  }
};

export const viewport: Viewport = {
  themeColor: "#f5f7f2"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
