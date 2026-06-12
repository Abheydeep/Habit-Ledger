import type { Metadata } from "next";
import { MarketingFooter, MarketingNav, siteUrl } from "../../components/SeoPages";
import styles from "../../components/SeoPages.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for The Win List: local-first habit tracker storage, optional cloud backup, anonymous aggregate metrics, and no required account.",
  alternates: {
    canonical: "/privacy-policy"
  },
  openGraph: {
    title: "Privacy Policy - The Win List",
    description: "How The Win List handles local storage, optional sync, and aggregate usage metrics.",
    url: `${siteUrl}/privacy-policy`
  }
};

const sections = [
  {
    title: "Local-first storage",
    body:
      "The Win List is designed to work without sign up. Your core wins, optional routines, Mood logs, notes, settings, and local reminders are saved in browser storage on the device you use."
  },
  {
    title: "Optional cloud backup",
    body:
      "Cloud backup is optional. If you choose to sign in for sync, the app uses a secure magic-link flow and stores backup data through the configured Supabase project."
  },
  {
    title: "Anonymous aggregate metrics",
    body:
      "The app may collect aggregate product metrics such as first win events, install attempts, reminder attempts, and broad usage counts. These are used to understand whether the product is working and are not meant to expose personal habit details."
  },
  {
    title: "No required account",
    body:
      "You can use The Win List without creating an account. If you never enable optional cloud backup, the day-to-day habit tracker data stays local to your device."
  },
  {
    title: "Your control",
    body:
      "You can edit wins, remove wins, export a JSON backup, import a backup, or clear local browser data from your browser settings. Removing browser storage can delete local progress."
  },
  {
    title: "Changes",
    body:
      "This policy may change as The Win List improves. Material changes should be reflected on this page so users can understand how the app handles habit tracker data."
  }
];

export default function PrivacyPolicyPage() {
  return (
    <main className={styles.shell}>
      <MarketingNav />
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Privacy Policy</span>
          <h1>Local-first by default. Cloud backup only when you choose it.</h1>
          <p>
            The Win List is a free habit tracker app that works without sign up. The default experience saves your
            progress locally on your device.
          </p>
        </div>
        <aside className={styles.promiseCard}>
          <span>Saved locally. No login needed.</span>
          <span>Optional cloud backup</span>
          <span>Anonymous aggregate metrics</span>
          <span>Export and import available</span>
        </aside>
      </section>
      <section className={styles.sectionGrid}>
        {sections.map((section) => (
          <article className={styles.infoCard} key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </article>
        ))}
      </section>
      <MarketingFooter />
    </main>
  );
}
