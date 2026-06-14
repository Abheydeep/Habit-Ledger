import type { Metadata } from "next";
import { JsonLd, SeoPage, appJsonLd, ogImageUrl, siteUrl } from "../../components/SeoPages";

export const metadata: Metadata = {
  title: "Habit Tracker PWA",
  description:
    "Use The Win List as a habit tracker PWA: add it to your phone home screen, track core wins offline, and start without an app store download.",
  alternates: {
    canonical: "/habit-tracker-pwa"
  },
  openGraph: {
    title: "Habit Tracker PWA - The Win List",
    description: "A browser-based habit tracker PWA for core wins, Mood logging, and offline-first daily routines.",
    url: `${siteUrl}/habit-tracker-pwa`,
    images: [{ url: ogImageUrl, width: 1200, height: 630, type: "image/png" }]
  }
};

const sections = [
  {
    title: "A habit tracker PWA for quick daily check-ins",
    body:
      "The Win List is built as a browser-based habit tracker PWA. That means you can open it from your phone home screen, log a core win, choose Mood if needed, and leave without searching through browser tabs or installing a heavy native app."
  },
  {
    title: "No App Store or Play Store required",
    body:
      "Open mywinlist.com in Safari on iPhone or Chrome on Android, then use Add to Home Screen. The app icon sits beside your other apps, opens in a focused shell, and keeps the routine close enough for tired-day use."
  },
  {
    title: "Works offline after the first load",
    body:
      "A daily habit tracker should not become useless when the connection is weak. The Win List saves your current day, core wins, optional routines, Mood choices, notes, and settings locally on the device, so the main daily loop stays available."
  },
  {
    title: "Built around core wins, not app admin",
    body:
      "The PWA opens to today. Core wins stay first, optional routines stay tucked away until you want them, and the app avoids persistent admin strips that steal mobile space. The goal is one tap of momentum, not another dashboard to manage."
  },
  {
    title: "Light reminders, honest expectations",
    body:
      "The Win List supports local reminder settings and in-app nudges where the browser allows them. It does not pretend to be a server-push notification system; it stays lightweight and transparent about what a browser app can do."
  },
  {
    title: "A good fit before building a native app",
    body:
      "For daily habit tracking, a PWA can be enough: fast launch, home screen access, offline-first storage, and no sign-up wall. The Win List uses that strength so people can test the habit loop immediately before deciding whether sync or deeper features matter."
  }
];

const faq = [
  {
    question: "What is a habit tracker PWA?",
    answer:
      "A habit tracker PWA is a browser-based app that can be added to your phone home screen and work offline after the first load. The Win List uses this model for quick daily win tracking."
  },
  {
    question: "How do I install The Win List PWA?",
    answer:
      "On iPhone, open mywinlist.com in Safari, tap Share, and choose Add to Home Screen. On Android, open it in Chrome, tap the browser menu, and choose Add to Home screen."
  },
  {
    question: "Is a PWA enough for daily habit tracking?",
    answer:
      "For many people, yes. The important loop is opening quickly, marking one core win, and returning tomorrow. A PWA gives that without an app store download or forced account."
  }
];

export default function HabitTrackerPwaPage() {
  return (
    <>
      <JsonLd data={appJsonLd} />
      <SeoPage
        eyebrow="Habit tracker PWA"
        title="Habit Tracker PWA You Can Add to Your Phone"
        intro="The Win List is a free habit tracker PWA for core wins, optional routines, Mood logging, and offline-first progress. Add it to your phone home screen and keep the daily loop one tap away."
        sections={sections}
        path="/habit-tracker-pwa"
        breadcrumbParent={{ name: "Habit tracker", path: "/habit-tracker" }}
        faq={faq}
        highlights={["Add to Home Screen", "Works offline", "No app store", "No sign up"]}
      />
    </>
  );
}
