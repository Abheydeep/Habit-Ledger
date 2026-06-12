import type { Metadata } from "next";
import { JsonLd, SeoPage, appJsonLd, ogImageUrl, siteUrl } from "../../components/SeoPages";

export const metadata: Metadata = {
  title: "Habit Tracker for Students",
  description:
    "A free habit tracker for students to track wake time, water, study focus, movement, screen limits, sleep, and optional routines.",
  alternates: {
    canonical: "/habit-tracker-for-students/"
  },
  openGraph: {
    title: "Habit Tracker for Students - The Win List",
    description: "Track study routines, sleep, movement, and daily core wins without sign up.",
    url: `${siteUrl}/habit-tracker-for-students/`,
    images: [{ url: ogImageUrl, width: 1200, height: 630, type: "image/png" }]
  }
};

const sections = [
  {
    title: "Track study days without overplanning them",
    body:
      "Student routines can swing between classes, exams, projects, travel, and late nights. The Win List keeps the habit tracker simple: 5 core wins and optional routines around them."
  },
  {
    title: "Useful student wins",
    body:
      "Start with wake up on time, drink water, walk or stretch, one real focus block, and sleep by a fixed time. Add optional routines like reading, revision, skincare, expense tracking, or no scrolling."
  },
  {
    title: "Partial days still count honestly",
    body:
      "Use Mood to log Won, Strong, Partial, Skipped, or Rest day. Partial is useful for exam season because doing something is different from doing nothing."
  },
  {
    title: "No sign up in the way",
    body:
      "Open The Win List on your phone, use the starter list, or build your own in 30 seconds. No account is required before the first tracked win."
  }
];

export default function StudentHabitTrackerPage() {
  return (
    <>
      <JsonLd data={appJsonLd} />
      <SeoPage
        eyebrow="Habit tracker for students"
        title="Free Habit Tracker for Students"
        intro="The Win List helps students track the small daily wins that keep study, sleep, water, movement, and phone time from turning into a blur."
        sections={sections}
        highlights={["Study focus", "Sleep routine", "Screen limits", "No sign up"]}
      />
    </>
  );
}
