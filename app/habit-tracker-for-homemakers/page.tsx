import type { Metadata } from "next";
import { JsonLd, SeoPage, appJsonLd, ogImageUrl, siteUrl } from "../../components/SeoPages";

export const metadata: Metadata = {
  title: "Habit Tracker for Homemakers",
  description:
    "A free habit tracker for homemakers to track water, meals, movement, planning, screen limits, rest, and optional home routines without pressure.",
  alternates: {
    canonical: "/habit-tracker-for-homemakers"
  },
  openGraph: {
    title: "Habit Tracker for Homemakers - The Win List",
    description: "Track daily home routines, core wins, optional routines, Mood, and rest without sign up.",
    url: `${siteUrl}/habit-tracker-for-homemakers`,
    images: [{ url: ogImageUrl, width: 1200, height: 630, type: "image/png" }]
  }
};

const sections = [
  {
    title: "A home routine tracker that stays finishable",
    body:
      "Home days can be full without looking like a formal schedule. The Win List keeps the habit tracker centered on a few core wins: water, movement, a nourishing meal, planning, rest, and one small reset that makes the day feel less scattered."
  },
  {
    title: "Core wins first, optional routines second",
    body:
      "A homemaker routine can easily become an endless list. The Win List separates required core wins from optional routines, so skincare, haircare, reading, decluttering, affirmations, or extra cleaning can stay useful without making the day feel like a failure."
  },
  {
    title: "Mood logging for real home days",
    body:
      "Not every day is neat. Use Mood to log Won, Strong, Partial, Skipped, or Rest day. Partial is helpful when you did something but not everything, and Rest day keeps intentional recovery from feeling like a broken streak."
  },
  {
    title: "Simple enough for low-energy evenings",
    body:
      "The mobile screen prioritizes today and the core wins. Optional routines stay collapsed until opened, and the app avoids making management controls permanent visual noise. The daily loop is meant to be fast: open, mark one win, and close."
  },
  {
    title: "No sign up before the first win",
    body:
      "The Win List saves locally on the device and starts without login. You can use the starter list, personalize it around your real home routine, and turn on optional cloud backup later if you want it."
  },
  {
    title: "Works for changing seasons of life",
    body:
      "Some weeks need health routines, some need planning, some need rest, and some need fewer wins. Core and optional controls let the list change with your energy instead of locking one version of productivity forever."
  },
  {
    title: "Sample starter wins for a home day",
    body:
      "A simple home-day list might include wake up on time, drink enough water, move for a few minutes, eat a healthy home meal, plan tomorrow, and sleep on time. The important part is not copying someone else perfectly. It is choosing a few wins that make your own home feel calmer and easier to return to tomorrow."
  }
];

const faq = [
  {
    question: "What habits should homemakers track?",
    answer:
      "Start with a small set: wake time, water, movement, a healthy home meal, planning, screen limits, and sleep. Keep extras like skincare, decluttering, or reading optional."
  },
  {
    question: "Can I track home routines without making the list overwhelming?",
    answer:
      "Yes. The Win List separates core wins from optional routines, so the required day stays small while extra home routines remain available."
  },
  {
    question: "Does a rest day count?",
    answer:
      "Yes. Rest day is a Mood option for intentional recovery. It helps the habit record stay honest without treating every low-energy day as failure."
  }
];

export default function HomemakerHabitTrackerPage() {
  return (
    <>
      <JsonLd data={appJsonLd} />
      <SeoPage
        eyebrow="Habit tracker for homemakers"
        title="Simple Habit Tracker for Homemakers"
        intro="The Win List helps homemakers track daily home routines without turning the day into pressure: core wins first, optional routines light, and Mood for real-life days."
        sections={sections}
        path="/habit-tracker-for-homemakers"
        breadcrumbParent={{ name: "Habit tracker", path: "/habit-tracker" }}
        faq={faq}
        highlights={["Home routines", "Optional routines", "Rest day", "No sign up"]}
      />
    </>
  );
}
