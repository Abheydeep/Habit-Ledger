import type { Metadata } from "next";
import { JsonLd, SeoPage, appJsonLd, ogImageUrl, siteUrl } from "../../components/SeoPages";

export const metadata: Metadata = {
  title: "Habit Tracker for Working Professionals",
  description:
    "A free habit tracker for working professionals to track water, steps, focused work, home meals, screen limits, sleep, and optional routines.",
  alternates: {
    canonical: "/habit-tracker-for-working-professionals"
  },
  openGraph: {
    title: "Habit Tracker for Working Professionals - The Win List",
    description: "Track workday core wins, focused work, meals, steps, and sleep without sign up.",
    url: `${siteUrl}/habit-tracker-for-working-professionals`,
    images: [{ url: ogImageUrl, width: 1200, height: 630, type: "image/png" }]
  }
};

const sections = [
  {
    title: "A workday habit tracker that respects low energy days",
    body:
      "Workdays are already full. The Win List keeps the daily routine small enough to finish: core wins first, optional routines collapsed, and Mood for honest logging."
  },
  {
    title: "Useful workday wins",
    body:
      "Track waking up on time, drinking water, walking 6k-8k steps, a healthy home meal, 90 minutes of focused work, expenses, screen limits, and sleep."
  },
  {
    title: "Keep pressure under control",
    body:
      "If a core win stops being truly must-do, make it optional. Optional routines remain visible when you want them, but they do not punish the daily score."
  },
  {
    title: "Return quickly from your phone",
    body:
      "The Win List can be installed to your phone home screen and used without login. It is made for quick check-ins during a commute, lunch break, or evening reset."
  }
];

const faq = [
  {
    question: "What habits matter most for working professionals?",
    answer:
      "Useful workday wins include water, steps, a focused work block, a healthy meal, screen limits, and sleep. The Win List keeps the must-do set small."
  },
  {
    question: "Can I keep workday habits separate from optional routines?",
    answer:
      "Yes. Core wins drive the daily score, while optional routines remain extra. That keeps a busy workday finishable."
  },
  {
    question: "Is this a work productivity app or a habit tracker?",
    answer:
      "It is a habit tracker for the whole day, not just work output. Focus matters, but food, movement, water, rest, and phone boundaries matter too."
  }
];

export default function ProfessionalHabitTrackerPage() {
  return (
    <>
      <JsonLd data={appJsonLd} />
      <SeoPage
        eyebrow="Habit tracker for working professionals"
        title="Simple Habit Tracker for Working Professionals"
        intro="The Win List turns a busy workday into a small set of core wins: water, movement, food, focus, screen limits, and sleep, with optional routines kept light."
        sections={sections}
        path="/habit-tracker-for-working-professionals"
        breadcrumbParent={{ name: "Habit tracker", path: "/habit-tracker" }}
        faq={faq}
        highlights={["Workday core wins", "90 min focused work", "Optional routines", "Works offline"]}
      />
    </>
  );
}
