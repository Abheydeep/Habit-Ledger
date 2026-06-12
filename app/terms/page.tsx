import type { Metadata } from "next";
import { MarketingFooter, MarketingNav, siteUrl } from "../../components/SeoPages";
import styles from "../../components/SeoPages.module.css";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Terms for using The Win List, a free habit tracker app for daily routines, core wins, optional routines, and offline-first progress.",
  alternates: {
    canonical: "/terms"
  },
  openGraph: {
    title: "Terms - The Win List",
    description: "Terms for using The Win List habit tracker app.",
    url: `${siteUrl}/terms`
  }
};

const sections = [
  {
    title: "Use of the app",
    body:
      "The Win List is provided as a free habit tracker app for personal daily routine tracking. You are responsible for how you use the app and for keeping your own backups if the data matters to you."
  },
  {
    title: "No professional advice",
    body:
      "The app is not medical, mental health, legal, or financial advice. It is a personal productivity tool for tracking core wins, optional routines, Mood, and routine patterns."
  },
  {
    title: "Local data",
    body:
      "The app stores progress locally by default. Clearing browser data, changing devices, or browser storage behavior may remove local progress unless you have exported a backup or enabled optional cloud backup."
  },
  {
    title: "Availability",
    body:
      "The Win List is provided without a guarantee of uninterrupted service. Features may change as the product improves."
  },
  {
    title: "Fair use",
    body:
      "Please do not attempt to abuse, scrape, attack, or disrupt the app, its hosting, or any optional sync infrastructure."
  },
  {
    title: "Updates",
    body:
      "These terms may be updated over time. Continued use of The Win List after updates means you accept the latest version."
  }
];

export default function TermsPage() {
  return (
    <main className={styles.shell}>
      <MarketingNav />
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Terms</span>
          <h1>Terms for using The Win List.</h1>
          <p>
            The Win List is a free habit tracker app for personal use. It is meant to help you track daily core wins and
            optional routines without turning the day into a pressure system.
          </p>
        </div>
        <aside className={styles.promiseCard}>
          <span>Free personal habit tracker</span>
          <span>No professional advice</span>
          <span>Local data needs your care</span>
          <span>Features can change</span>
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
