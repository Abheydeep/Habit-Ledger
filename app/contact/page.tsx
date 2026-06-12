import type { Metadata } from "next";
import { MarketingFooter, MarketingNav, siteUrl } from "../../components/SeoPages";
import styles from "../../components/SeoPages.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact The Win List for feedback, bug reports, or questions about the free habit tracker app.",
  alternates: {
    canonical: "/contact"
  },
  openGraph: {
    title: "Contact The Win List",
    description: "Send feedback or report an issue with The Win List habit tracker app.",
    url: `${siteUrl}/contact`
  }
};

export default function ContactPage() {
  return (
    <main className={styles.shell}>
      <MarketingNav />
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Contact</span>
          <h1>Send feedback about The Win List.</h1>
          <p>
            Found a bug, have a habit idea, or want to share what made the app easier to use? The fastest public route
            is the GitHub repository.
          </p>
          <div className={styles.actions}>
            <a className={styles.primaryAction} href="https://github.com/Abheydeep/Habit-Ledger" rel="noreferrer">
              Open GitHub
            </a>
            <a className={styles.secondaryAction} href="/">
              Open the app
            </a>
          </div>
        </div>
        <aside className={styles.promiseCard}>
          <span>Feedback is welcome</span>
          <span>Bug reports help the daily-driver loop</span>
          <span>No account is needed to try the app</span>
          <span>Admin metrics are aggregate-only</span>
        </aside>
      </section>
      <MarketingFooter />
    </main>
  );
}
