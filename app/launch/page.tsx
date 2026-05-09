import type { Metadata } from "next";
import styles from "./LaunchPoster.module.css";

export const metadata: Metadata = {
  title: "Launch Poster | The Win List",
  description:
    "A shareable launch poster for The Win List, the daily wins tracker that helps you start with one small win.",
  alternates: {
    canonical: "/launch/"
  },
  openGraph: {
    title: "The Win List launch poster",
    description: "Track daily wins, not daily failures. Free, no login, and works offline.",
    url: "https://www.mywinlist.com/launch/",
    siteName: "The Win List",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "The Win List launch poster",
    description: "Track daily wins, not daily failures."
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
    title: "Finish the day without pressure",
    body: "Pick the few must-do wins that make today count. Optional routines stay extra credit."
  },
  {
    eyebrow: "Mood, not guilt",
    title: "Done, Strong, Partial, Rest",
    body: "Real life is not just a checkbox. Log the truth and keep moving."
  },
  {
    eyebrow: "Momentum loop",
    title: "First win starts the day",
    body: "One small mark done gives the day a starting point."
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
        <a className={styles.navButton} href="/">
          Open app
        </a>
      </nav>

      <article className={styles.poster} aria-labelledby="poster-title">
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.badge}>Live at mywinlist.com</span>
            <h1 id="poster-title">Track daily wins, not daily failures.</h1>
            <p>
              The Win List turns a tired day into core wins, optional routines, honest moods, and one clear next
              step.
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
            <h2>Your pattern becomes visible.</h2>
            <p>
              The app keeps the first day simple, then unlocks reflection when there is enough real activity to make
              it useful.
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
            <p>No reset drama. One win restarts momentum.</p>
          </div>
        </section>

        <footer className={styles.cta}>
          <div>
            <span>Start with one win.</span>
            <strong>mywinlist.com</strong>
          </div>
          <a href="/">Open The Win List</a>
        </footer>
      </article>
    </main>
  );
}
