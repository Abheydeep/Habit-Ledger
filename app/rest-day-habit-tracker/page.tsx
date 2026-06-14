import type { Metadata } from "next";
import { JsonLd, SeoPage, appJsonLd, ogImageUrl, siteUrl } from "../../components/SeoPages";

export const metadata: Metadata = {
  title: "Rest Day Habit Tracker",
  description:
    "Use The Win List as a rest-day friendly habit tracker with Mood logging, Partial wins, Skipped, Rest day, and no reset drama.",
  alternates: {
    canonical: "/rest-day-habit-tracker"
  },
  openGraph: {
    title: "Rest Day Habit Tracker - The Win List",
    description: "Track habits without all-or-nothing pressure. Rest day and Partial Mood keep the record honest.",
    url: `${siteUrl}/rest-day-habit-tracker`,
    images: [{ url: ogImageUrl, width: 1200, height: 630, type: "image/png" }]
  }
};

const sections = [
  {
    title: "A habit tracker that does not punish rest",
    body:
      "Many habit trackers treat every missed checkbox as failure. The Win List is built differently: it lets you mark Rest day when recovery is intentional, Partial when you did something, and Skipped when a win genuinely did not happen."
  },
  {
    title: "Mood gives the day more than one status",
    body:
      "The five Mood choices are Won, Strong, Partial, Skipped, and Rest day. That small difference matters because real routines are not always complete or empty. A half walk, a short study block, or an intentional early night can be recorded honestly."
  },
  {
    title: "No reset drama after a missed day",
    body:
      "The product language is built around momentum, not shame. If yesterday was messy, today still starts with one core win. The app helps you return instead of making the streak feel like a fragile glass object."
  },
  {
    title: "Optional routines keep pressure contained",
    body:
      "When a win is not truly must-do, move it to optional. Optional routines stay loggable and visible when expanded, but they do not punish the daily score. This is especially useful during travel, illness, exam weeks, or heavy work periods."
  },
  {
    title: "A better record for long-term patterns",
    body:
      "Rest day and Partial entries make the 5-day pattern more useful. Instead of a plain missed-or-done grid, you can see which habits survive low-energy days and which ones need smaller versions."
  },
  {
    title: "Simple enough to use when tired",
    body:
      "The Win List is designed for quick mobile check-ins. Core wins appear first, optional routines are collapsed by default, and Mood sits behind a secondary control so the main action stays simple."
  },
  {
    title: "Use rest as information, not an excuse",
    body:
      "Rest day works best when it is honest. If your body needed recovery, mark Rest day and keep the record clean. If the habit was too large, make a smaller version or move it to optional. Over time, those entries show whether a routine needs protection, a lighter target, or a real break."
  }
];

const faq = [
  {
    question: "Should a rest day break my habit streak?",
    answer:
      "Not necessarily. If rest is intentional, The Win List lets you log Rest day as a Mood so the record reflects recovery instead of treating it like failure."
  },
  {
    question: "What is the difference between Partial and Skipped?",
    answer:
      "Partial means you did something but not the full win. Skipped means the win did not happen today. Keeping them separate makes the habit record more useful."
  },
  {
    question: "How do I restart after missing habits?",
    answer:
      "Start with one core win. The Win List is designed around first-win momentum, so returning today matters more than punishing yesterday."
  }
];

export default function RestDayHabitTrackerPage() {
  return (
    <>
      <JsonLd data={appJsonLd} />
      <SeoPage
        eyebrow="Rest day habit tracker"
        title="Rest Day Habit Tracker Without Reset Drama"
        intro="The Win List helps you track habits with real-life Mood choices: Won, Strong, Partial, Skipped, and Rest day, so recovery and low-energy days stay honest."
        sections={sections}
        path="/rest-day-habit-tracker"
        breadcrumbParent={{ name: "Habit tracker", path: "/habit-tracker" }}
        faq={faq}
        highlights={["Rest day Mood", "Partial counts", "No reset drama", "Optional routines"]}
      />
    </>
  );
}
