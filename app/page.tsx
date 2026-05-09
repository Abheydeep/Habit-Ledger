import { HabitTracker } from "../components/HabitTracker";

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "The Win List",
  alternateName: "My Win List",
  url: "https://www.mywinlist.com/",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web, iOS, Android",
  browserRequirements: "Requires JavaScript. Works offline after first load.",
  description:
    "The Win List is a free daily wins tracker for core habits, optional routines, mood status, streaks, reminders, and offline-first progress.",
  creator: {
    "@type": "Person",
    name: "Abhey Deep"
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD"
  },
  featureList: [
    "Track core daily wins",
    "Keep optional routines separate from required wins",
    "Log realistic mood statuses like strong, partial, skipped, and rest day",
    "Build streaks and monthly progress",
    "Use local reminders and install as a PWA",
    "Save progress offline first with optional cloud backup"
  ]
};

export default function HabitTrackerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd).replace(/</g, "\\u003c") }}
      />
      <HabitTracker />
    </>
  );
}
