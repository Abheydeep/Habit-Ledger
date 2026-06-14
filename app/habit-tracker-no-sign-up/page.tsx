import type { Metadata } from "next";
import { JsonLd, SeoPage, appJsonLd, ogImageUrl, siteUrl } from "../../components/SeoPages";

export const metadata: Metadata = {
  title: "Habit Tracker No Sign Up",
  description:
    "Use The Win List as a habit tracker without login. No account, no password, local save, and optional cloud backup only when you choose it.",
  alternates: {
    canonical: "/habit-tracker-no-sign-up"
  },
  openGraph: {
    title: "Habit Tracker Without Login - The Win List",
    description: "A free habit tracker app that starts without sign up and saves progress locally.",
    url: `${siteUrl}/habit-tracker-no-sign-up`,
    images: [{ url: ogImageUrl, width: 1200, height: 630, type: "image/png" }]
  }
};

const sections = [
  {
    title: "Start without creating an account",
    body:
      "Open mywinlist.com and start tracking. The Win List does not require sign up for the daily habit tracker experience, so the first action is a core win, not an account form."
  },
  {
    title: "Saved locally. No login needed.",
    body:
      "Your wins are saved locally on the device you use. That makes the app fast, private by default, and useful even before you decide whether cloud backup is worth turning on."
  },
  {
    title: "Optional cloud backup stays optional",
    body:
      "If you want backup later, you can sign in with a magic link and choose sync. Local save remains the source of truth while offline, and restore is explicit."
  },
  {
    title: "No ads, no forced subscription",
    body:
      "The Win List is free to use. The product is designed around a simple daily routine: open, log a core win, choose Mood if needed, and leave."
  }
];

const faq = [
  {
    question: "Can I use The Win List without creating an account?",
    answer:
      "Yes. The Win List works as a no-sign-up habit tracker. Open the app, track core wins, and keep progress saved locally on your device."
  },
  {
    question: "Will my wins disappear if I do not log in?",
    answer:
      "Your wins are saved locally in the browser on the device you use. You can keep using the app without login, and optional cloud backup is available later if you want it."
  },
  {
    question: "Why avoid sign up before the first win?",
    answer:
      "A habit tracker should help you start, not slow you down. The Win List keeps the first session focused on one daily win instead of an account form."
  }
];

export default function NoSignUpHabitTrackerPage() {
  return (
    <>
      <JsonLd data={appJsonLd} />
      <SeoPage
        eyebrow="Habit tracker without login"
        title="Habit Tracker App With No Sign Up"
        intro="The Win List is for people who want to track habits without making yet another account. Open it, track 5 core wins, and keep progress saved locally on your device."
        sections={sections}
        path="/habit-tracker-no-sign-up"
        breadcrumbParent={{ name: "Habit tracker", path: "/habit-tracker" }}
        faq={faq}
        highlights={[
          "No sign up required",
          "No password before first win",
          "Saved locally on this device",
          "Optional cloud backup only if you choose it"
        ]}
      />
    </>
  );
}
