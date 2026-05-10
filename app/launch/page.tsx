import type { Metadata } from "next";
import styles from "./LaunchPoster.module.css";

export const metadata: Metadata = {
  title: "Launch Poster | The Win List",
  description:
    "A shareable launch poster for The Win List: core wins, optional routines, Mood, first-win momentum, no-login/offline trust, and 5-day pattern reflection.",
  alternates: {
    canonical: "/launch/"
  },
  openGraph: {
    title: "The Win List launch poster",
    description:
      "Core wins, optional routines, Mood, first-win momentum, no-login/offline trust, and 5-day pattern reflection.",
    url: "https://www.mywinlist.com/launch/",
    siteName: "The Win List",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "The Win List launch poster",
    description: "Core wins, optional routines, Mood, and 5-day pattern reflection."
  }
};

const coreWins = [
  { label: "Wake up on time", detail: "Start before the day starts chasing you." },
  { label: "Drink 2-3L water", detail: "Small sips, fewer headaches." },
  { label: "Healthy home meal", detail: "Tiffin energy beats random snacking." }
];

const featureCards = [
  {
    eyebrow: "Core wins first",
    title: "Core wins keep today finishable",
    body: "Core wins define the day. Optional routines stay extra credit."
  },
  {
    eyebrow: "Mood, not guilt",
    title: "Won, Strong, Partial, Skipped, Rest day",
    body: "Mood records real life without turning optional routines into pressure."
  },
  {
    eyebrow: "First-win momentum",
    title: "One core win gets the day moving",
    body: "The first logged core win creates a clean starting point."
  }
];

const patternStats = [
  ["5 days", "showed up"],
  ["Hydration", "strongest win"],
  ["Wake time", "protect tomorrow"]
];

export default function LaunchPosterPage() {
  return (
    <main className={styles.shell}>
      <nav className={styles.nav} aria-label="Launch poster navigation">
        <a className={styles.brandLink} href="/">
          <img src="/icon.svg" alt="" />
          The Win List
        </a>
        <div className={styles.navActions}>
          <a className={styles.navButton} href="/">
            Open app
          </a>
          <a className={styles.navButton} href="/reel/">
            Watch reel
          </a>
        </div>
      </nav>

      <article className={styles.poster} aria-labelledby="poster-title">
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.badge}>Live at mywinlist.com</span>
            <h1 id="poster-title">Track core wins. Keep optional routines light.</h1>
            <p>
              Core wins stay clear, optional routines stay light, and Mood captures the real day with first-win
              momentum, no-login/offline trust, and 5-day pattern reflection.
            </p>
            <div className={styles.heroActions} aria-label="Product promises">
              <span>Free</span>
              <span>No login</span>
              <span>Works offline</span>
              <span>Installable</span>
            </div>
          </div>

          <div className={styles.phoneWrap} aria-label="The Win List app preview">
            <div className={styles.phone}>
              <div className={styles.phoneHeader}>
                <div>
                  <small>Sat, May 9</small>
                  <strong>0/5 core</strong>
                </div>
                <span>0%</span>
              </div>

              <div className={styles.setupRow}>
                <span>Build in 30 sec</span>
                <span>Use starter list</span>
              </div>

              <div className={styles.starterCard}>
                <small>Starter workday list</small>
                <strong>Build your Win List</strong>
                <p>Default wins to get moving. Build around your own day.</p>
              </div>

              <div className={styles.dayHeader}>
                <div>
                  <small>Core wins</small>
                  <strong>0/5 today</strong>
                </div>
                <span>5 left</span>
              </div>

              <div className={styles.sectionLine}>
                <strong>Morning</strong>
                <span>Start clean</span>
              </div>

              <div className={styles.winList}>
                {coreWins.map((win) => (
                  <div className={styles.winCard} key={win.label}>
                    <div className={styles.winIcon} aria-hidden="true">
                      {win.label.charAt(0)}
                    </div>
                    <div>
                      <strong>{win.label}</strong>
                      <p>{win.detail}</p>
                    </div>
                    <div className={styles.winActions}>
                      <span>Mark done</span>
                      <span>Mood</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.optionalBar}>
                <div>
                  <strong>Optional routines</strong>
                  <small>Extra credit. Not required for 100%.</small>
                </div>
                <span>0/5</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.featureGrid} aria-label="Why The Win List works">
          {featureCards.map((card) => (
            <div className={styles.featureCard} key={card.eyebrow}>
              <span>{card.eyebrow}</span>
              <h2>{card.title}</h2>
              <p>{card.body}</p>
            </div>
          ))}
        </section>

        <section className={styles.storyBand}>
          <div>
            <span className={styles.badge}>After a few days</span>
            <h2>Your 5-day pattern reflection becomes visible.</h2>
            <p>
              The app keeps the first day simple, then unlocks reflection when enough real activity exists.
            </p>
          </div>
          <div className={styles.patternCard} aria-label="Example five day pattern">
            <strong>Your 5-day pattern</strong>
            <div className={styles.patternStats}>
              {patternStats.map(([value, label]) => (
                <span key={value}>
                  <b>{value}</b>
                  <small>{label}</small>
                </span>
              ))}
            </div>
            <p>No reset drama. First-win momentum restarts from one core win.</p>
          </div>
        </section>

        <footer className={styles.cta}>
          <div>
            <span>Start with one win.</span>
            <strong>mywinlist.com</strong>
          </div>
          <div className={styles.ctaLinks}>
            <a href="/">Open The Win List</a>
            <a href="/reel/">Watch the 30s reel</a>
          </div>
        </footer>
      </article>
    </main>
  );
}
