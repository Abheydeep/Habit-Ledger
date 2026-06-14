import { HabitTracker } from "../components/HabitTracker";
import {
  HomeSeoSection,
  JsonLd,
  appJsonLd,
  faqJsonLd,
  homeFaq,
  organizationJsonLd,
  websiteJsonLd
} from "../components/SeoPages";

export default function HabitTrackerPage() {
  return (
    <>
      <JsonLd data={appJsonLd} />
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={faqJsonLd(homeFaq)} />
      <noscript>
        <main>
          <h1>Free Habit Tracker App - The Win List</h1>
          <p>
            The Win List is a free habit tracker app at mywinlist.com for 5 core wins, optional routines, Mood
            logging, streaks, reminders, and offline-first progress.
          </p>
          <p>
            Track the few wins that make today count, keep optional routines separate, and build momentum one day at a
            time.
          </p>
          <p>
            Visit <a href="https://www.mywinlist.com/">https://www.mywinlist.com/</a> with JavaScript enabled to use the
            app.
          </p>
        </main>
      </noscript>
      <HabitTracker />
      <HomeSeoSection />
    </>
  );
}
