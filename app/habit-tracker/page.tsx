import type { Metadata } from "next";
import { JsonLd, SeoPage, appJsonLd, faqJsonLd, habitTrackerFaq, ogImageUrl, siteUrl } from "../../components/SeoPages";

export const metadata: Metadata = {
  title: "Free Habit Tracker App",
  description:
    "A free habit tracker app for daily routines, 5 core wins, optional routines, Mood logging, streaks, and offline-first progress. No sign up needed.",
  alternates: {
    canonical: "/habit-tracker"
  },
  openGraph: {
    title: "Free Habit Tracker App - The Win List",
    description:
      "Track 5 core wins daily with a simple habit tracker app that works without login and saves locally.",
    url: `${siteUrl}/habit-tracker`,
    images: [{ url: ogImageUrl, width: 1200, height: 630, type: "image/png" }]
  }
};

const sections = [
  {
    title: "A habit tracker app that works without login",
    body:
      "The Win List starts instantly. No account, email, or password is required. Your progress is saved locally on your device, which keeps the first session light and makes it easier to trust the app before choosing optional cloud backup."
  },
  {
    title: "5 core wins, not 50 habits you will abandon",
    body:
      "Most habit trackers become a long list of pressure. The Win List keeps the day finishable with 5 core wins and lets optional routines stay optional. You can make wins core or optional as your routine changes."
  },
  {
    title: "Log your Mood, not just a checkbox",
    body:
      "Daily life is not always clean. Log a win as Won, Strong, Partial, Skipped, or Rest day so your habit tracker records what actually happened instead of pretending every day is all-or-nothing."
  },
  {
    title: "Works offline and installs on your phone",
    body:
      "The Win List is a browser-based habit tracker PWA. Open it at mywinlist.com, add it to your home screen, and keep logging core wins even when your connection is unreliable."
  },
  {
    title: "Built for daily routines",
    body:
      "Use it for waking up on time, drinking water, walking, working out, focused work, learning, expenses, limiting reels, and sleep. The setup can be personalized for students, working professionals, homemakers, field workers, and business owners."
  },
  {
    title: "Reflection arrives after real activity",
    body:
      "The app stays simple on day one. After enough activity, your 5-day pattern helps you see the strongest win, the most fragile win, and the next routine to protect."
  }
];

export default function HabitTrackerLandingPage() {
  return (
    <>
      <JsonLd data={appJsonLd} />
      <JsonLd data={faqJsonLd(habitTrackerFaq)} />
      <SeoPage
        eyebrow="Free habit tracker app"
        title="Free Habit Tracker App for Daily Routines"
        intro="The Win List is a free habit tracker app for 5 core wins, optional routines, Mood logging, streaks, and offline-first progress. Start without sign up, install it on your phone, and keep the day finishable."
        sections={sections}
        faq={habitTrackerFaq}
      />
    </>
  );
}
