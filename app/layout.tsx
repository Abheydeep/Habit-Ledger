import type { Metadata, Viewport } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const iconPath = `${basePath}/icon.svg`;
const manifestPath = `${basePath}/manifest.webmanifest`;

export const metadata: Metadata = {
  title: "The Win List",
  description: "A daily must-do wins app for planning and completing what matters today",
  manifest: manifestPath,
  icons: {
    icon: iconPath,
    apple: iconPath
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
