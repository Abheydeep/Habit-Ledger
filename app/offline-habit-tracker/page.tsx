import type { Metadata } from "next";
import { JsonLd, SeoPage, appJsonLd, ogImageUrl, siteUrl } from "../../components/SeoPages";

export const metadata: Metadata = {
  title: "Offline Habit Tracker",
  description:
    "The Win List is an offline-first habit tracker PWA. Add it to your phone home screen and track core wins without relying on constant internet.",
  alternates: {
    canonical: "/offline-habit-tracker/"
  },
  openGraph: {
    title: "Offline Habit Tracker PWA - The Win List",
    description: "Install The Win List to your phone and track daily core wins with offline-first local save.",
    url: `${siteUrl}/offline-habit-tracker/`,
    images: [{ url: ogImageUrl, width: 1200, height: 630, type: "image/png" }]
  }
};

const sections = [
  {
    title: "Install like an app",
    body:
      "The Win List runs in your browser and can be added to your home screen. On iPhone, use Safari Share and Add to Home Screen. On Android, use the Chrome menu and Add to Home screen."
  },
  {
    title: "Works when the connection is weak",
    body:
      "The daily habit tracker experience is local-first. Your core wins, optional routines, Mood, notes, and progress are saved on the device so the app can still be useful without constant internet."
  },
  {
    title: "Fast return path",
    body:
      "A habit tracker only works if you can return quickly. Installing the PWA keeps The Win List one tap away, with reminders available as a light local nudge."
  },
  {
    title: "No App Store needed",
    body:
      "The Win List is browser-based. You do not need to download from an app store, create an account, or wait through a heavy onboarding flow before logging a win."
  }
];

export default function OfflineHabitTrackerPage() {
  return (
    <>
      <JsonLd data={appJsonLd} />
      <SeoPage
        eyebrow="Offline habit tracker"
        title="Offline Habit Tracker You Can Add to Your Phone"
        intro="The Win List is an offline-first habit tracker PWA for core wins, optional routines, Mood, and first-win momentum. Install it to your phone and keep your daily routine close."
        sections={sections}
        highlights={["Installable PWA", "Works offline after first load", "Local reminders", "Saved locally. No login needed."]}
      />
    </>
  );
}
