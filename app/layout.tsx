import type { Metadata, Viewport } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const iconPath = `${basePath}/icon.svg`;

export const metadata: Metadata = {
  title: "Habit Ledger",
  description: "A professional daily habit tracker for health, focus, money, learning, and screen-time routines",
  icons: {
    icon: iconPath,
    apple: iconPath
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
