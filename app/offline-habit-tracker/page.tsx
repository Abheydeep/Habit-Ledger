import type { Metadata } from "next";
import { JsonLd, SeoPage, appJsonLd, ogImageUrl, siteUrl } from "../../components/SeoPages";

export const metadata: Metadata = {
  title: "Offline Habit Tracker",
  description:
    "The Win List is an offline-first habit tracker PWA. Add it to your phone home screen and track core wins without relying on constant internet.",
  alternates: {
    canonical: "/offline-habit-tracker"
  },
  openGraph: {
    title: "Offline Habit Tracker PWA - The Win List",
    description: "Install The Win List to your phone and track daily core wins with offline-first local save.",
    url: `${siteUrl}/offline-habit-tracker`,
    images: [{ url: ogImageUrl, width: 1200, height: 630, type: "image/png" }]
  }
};

const sections = [
  {
    title: "Install like an app",
    body:
      "The Win List runs in your browser and can be added to your home screen. On iPhone, use Safari Share and Add to Home Screen. On Android, use the Chrome menu and Add to Home screen. Once installed, it opens like a focused app shell instead of another browser tab."
  },
  {
    title: "Works when the connection is weak",
    body:
      "The daily habit tracker experience is local-first. Your core wins, optional routines, Mood, notes, and progress are saved on the device so the app can still be useful without constant internet. That matters for commutes, travel, hostel Wi-Fi, patchy office networks, and low-energy nights when you still want to mark one win."
  },
  {
    title: "Fast return path",
    body:
      "A habit tracker only works if you can return quickly. Installing the PWA keeps The Win List one tap away, with reminders available as a light local nudge. The mobile screen stays centered on today: progress, core wins, optional routines when expanded, and a Mood control when you need more nuance than a checkbox."
  },
  {
    title: "No App Store needed",
    body:
      "The Win List is browser-based. You do not need to download from an app store, create an account, or wait through a heavy onboarding flow before logging a win. Open mywinlist.com, use the starter list or build your own, then keep the daily habit tracker close to your phone home screen."
  },
  {
    title: "Private by default",
    body:
      "Offline-first also means the first copy of your routine stays on your device. You can use The Win List as a no-login habit tracker, export a backup, or turn on optional cloud backup later. Local save remains the instant source of truth while offline."
  },
  {
    title: "Built for real daily routines",
    body:
      "Use it for wake time, water, steps, workouts, focused work, learning, expenses, screen limits, and sleep. The app keeps required core wins separate from optional routines, so an ambitious week can grow without making a tired day feel impossible."
  },
  {
    title: "What stays available offline",
    body:
      "Your current day, win list, completion history, Mood choices, daily notes, and local settings stay available in the browser storage on that device. If you open the PWA from your home screen, you can still review today, mark a win, and keep momentum without waiting for a network request. That makes the app useful before breakfast, in transit, between meetings, or anywhere a normal account-first tracker would feel too slow. The point is simple: your daily routine should load before your motivation disappears."
  }
];

const faq = [
  {
    question: "Can a habit tracker work offline?",
    answer:
      "Yes. The Win List is offline-first after the initial load. Your core wins, optional routines, Mood choices, notes, and local settings stay available on the device."
  },
  {
    question: "Do I need the App Store to install The Win List?",
    answer:
      "No. Open mywinlist.com in Safari or Chrome and use Add to Home Screen. It runs as a browser-based PWA without an App Store download."
  },
  {
    question: "What happens when my connection comes back?",
    answer:
      "Local save remains the instant source of truth. If you choose optional cloud backup, sync can run later, but daily tracking does not wait for the network."
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
        path="/offline-habit-tracker"
        breadcrumbParent={{ name: "Habit tracker", path: "/habit-tracker" }}
        faq={faq}
        highlights={["Installable PWA", "Works offline after first load", "Local reminders", "Saved locally. No login needed."]}
      />
    </>
  );
}
