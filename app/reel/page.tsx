import type { Metadata } from "next";
import styles from "./ReelPage.module.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const reelPath = `${basePath}/reel/wheel-reel-30s.html`;

export const metadata: Metadata = {
  title: "30s Reel | The Win List",
  description:
    "Watch the 30-second The Win List reel: core wins, optional routines, Mood, first-win momentum, no-login/offline trust, and 5-day pattern reflection.",
  alternates: {
    canonical: "/reel/"
  },
  openGraph: {
    title: "The Win List 30-second reel",
    description:
      "Core wins, optional routines, Mood, first-win momentum, no-login/offline trust, and 5-day pattern reflection.",
    url: "https://www.mywinlist.com/reel/",
    siteName: "The Win List",
    type: "video.other"
  },
  twitter: {
    card: "summary_large_image",
    title: "The Win List 30-second reel",
    description: "Core wins, optional routines, Mood, and 5-day pattern reflection."
  }
};

export default function ReelPage() {
  return (
    <main className={styles.shell}>
      <nav className={styles.nav} aria-label="Reel page navigation">
        <a className={styles.brandLink} href={`${basePath}/`}>
          <img src={`${basePath}/icon.svg`} alt="" />
          The Win List
        </a>
        <div className={styles.navActions}>
          <a href={`${basePath}/launch/`}>Launch poster</a>
          <a href={`${basePath}/`}>Open app</a>
        </div>
      </nav>

      <section className={styles.layout}>
        <div className={styles.copy}>
          <span className={styles.kicker}>30-second reel</span>
          <h1>Every second earns the next.</h1>
          <p>
            A fast product reel for The Win List: core wins, optional routines, Mood, first-win momentum,
            no-login/offline trust, and 5-day pattern reflection.
          </p>
          <div className={styles.actionRow}>
            <a className={styles.downloadLink} href={reelPath} target="_blank" rel="noreferrer">
              Open raw reel
            </a>
            <a className={styles.downloadLink} href={`${basePath}/`}>
              Try The Win List
            </a>
          </div>
          <p className={styles.note}>Tip: open the raw reel, go fullscreen, screen-record 30 seconds, then add music.</p>
        </div>

        <div className={styles.preview} aria-label="The Win List 30-second reel preview">
          <div className={styles.phoneFrame}>
            <iframe
              className={styles.frame}
              src={reelPath}
              title="The Win List 30-second reel"
              loading="eager"
              allow="autoplay; fullscreen"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
