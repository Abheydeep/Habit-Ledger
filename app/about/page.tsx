import type { Metadata } from "next";
import { MarketingFooter, MarketingNav, siteUrl } from "../../components/SeoPages";
import styles from "../../components/SeoPages.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "About The Win List, a free habit tracker app by Abhey Deep for core wins, optional routines, Mood, and offline-first daily progress.",
  alternates: {
    canonical: "/about/"
  },
  openGraph: {
    title: "About The Win List",
    description: "Why The Win List exists and how the 5 core wins habit tracker model works.",
    url: `${siteUrl}/about/`
  }
};

export default function AboutPage() {
  return (
    <main className={styles.shell}>
      <MarketingNav />
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>About The Win List</span>
          <h1>I built The Win List to make daily habits feel finishable.</h1>
          <p>
            I am Abhey Deep. I built The Win List because most habit trackers become another place to feel behind. This
            one starts smaller: 5 core wins, optional routines, Mood, first-win momentum, and a 5-day pattern once real
            activity exists.
          </p>
          <div className={styles.actions}>
            <a className={styles.primaryAction} href="/">
              Open the app
            </a>
            <a className={styles.secondaryAction} href="/habit-tracker/">
              How it works
            </a>
          </div>
        </div>
        <aside className={styles.promiseCard}>
          <span>Built as an India-based indie product</span>
          <span>Free to start, no sign up required</span>
          <span>Local-first by default</span>
          <span>Designed for real, uneven days</span>
        </aside>
      </section>

      <section className={styles.sectionGrid}>
        <article className={styles.infoCard}>
          <h2>The philosophy</h2>
          <p>
            A good habit tracker should not ask you to become a new person overnight. The Win List keeps the day
            centered on a few core wins and lets everything else stay optional.
          </p>
        </article>
        <article className={styles.infoCard}>
          <h2>Why Mood matters</h2>
          <p>
            Won, Strong, Partial, Skipped, and Rest day make the record honest. A partial attempt is still information,
            and an intentional rest day should not feel like failure.
          </p>
        </article>
        <article className={styles.infoCard}>
          <h2>Why local-first</h2>
          <p>
            The first win should not wait for account creation. The Win List saves locally by default, with optional
            cloud backup available when a user chooses it.
          </p>
        </article>
        <article className={styles.infoCard}>
          <h2>Where it is going</h2>
          <p>
            The product will keep improving around daily activation, install reminders, 5-day reflection, and simple
            ways to personalize wins without making the app feel heavy.
          </p>
        </article>
      </section>
      <MarketingFooter />
    </main>
  );
}
