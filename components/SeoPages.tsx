import styles from "./SeoPages.module.css";

export const siteUrl = "https://www.mywinlist.com";
export const siteName = "The Win List";
export const ogImageUrl = `${siteUrl}/og-image.png`;

export const publicRoutes = [
  { href: "/", label: "Open app" },
  { href: "/habit-tracker/", label: "Habit tracker" },
  { href: "/habit-tracker-no-sign-up/", label: "No sign up" },
  { href: "/offline-habit-tracker/", label: "Offline" },
  { href: "/habit-tracker-for-students/", label: "Students" },
  { href: "/habit-tracker-for-working-professionals/", label: "Professionals" },
  { href: "/about/", label: "About" },
  { href: "/contact/", label: "Contact" },
  { href: "/privacy-policy/", label: "Privacy" },
  { href: "/terms/", label: "Terms" }
];

export const productFeatures = [
  "Track 5 core wins daily",
  "Keep optional routines separate from required wins",
  "Log Mood as Won, Strong, Partial, Skipped, or Rest day",
  "Build first-win momentum and streaks",
  "Review your 5-day pattern after real activity",
  "Use a free habit tracker app with no sign up and offline-first local save"
];

export const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteName,
  alternateName: "My Win List",
  url: `${siteUrl}/`,
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web, iOS, Android",
  browserRequirements: "Works in a modern browser. Works offline after first load.",
  description:
    "The Win List is a free habit tracker app for 5 core wins, optional routines, Mood logging, streaks, reminders, and offline-first progress. No sign up needed.",
  creator: {
    "@type": "Person",
    name: "Abhey Deep"
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD"
  },
  featureList: productFeatures
};

export const habitTrackerFaq = [
  {
    question: "What is the best free habit tracker app?",
    answer:
      "The best habit tracker is the one you can actually keep using. The Win List is a free habit tracker app built around 5 core wins, optional routines, Mood logging, local save, and no sign up."
  },
  {
    question: "Is there a habit tracker that does not need an account?",
    answer:
      "Yes. The Win List works with no sign up and no login. Your progress is saved locally on your device, so you can start tracking daily habits without creating an account."
  },
  {
    question: "How do I track my habits every day?",
    answer:
      "Open The Win List, tap a core win, and log the Mood for the day: Won, Strong, Partial, Skipped, or Rest day. Your streak and 5-day pattern update as you keep using it."
  },
  {
    question: "What should I track in a habit tracker?",
    answer:
      "Start with a small set of habits that make the day better: waking up on time, drinking water, movement, focused work, and sleep. The Win List keeps these as core wins and lets optional routines stay extra."
  },
  {
    question: "Can I use a habit tracker without internet?",
    answer:
      "Yes. The Win List is offline-first. It saves locally on your device and can be installed to your phone home screen as a browser-based app."
  },
  {
    question: "How many habits should I track at once?",
    answer:
      "Most people do better with a short list. The Win List starts with 5 core wins, then lets you add optional routines without making the day feel impossible."
  },
  {
    question: "What happens if I miss a day on a habit tracker?",
    answer:
      "The Win List is designed to avoid reset drama. Use Skipped for a miss or Rest day for an intentional day off, then restart momentum with one core win."
  },
  {
    question: "How do I add a habit tracker app to my phone?",
    answer:
      "Open mywinlist.com in Safari on iPhone or Chrome on Android, then use Share or the browser menu and choose Add to Home Screen. No App Store is needed."
  },
  {
    question: "Is The Win List really free?",
    answer:
      "Yes. The Win List is free to use, requires no sign up, and saves progress locally on your device."
  }
];

type SeoSection = {
  title: string;
  body: string;
};

type SeoPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: SeoSection[];
  highlights?: string[];
  faq?: typeof habitTrackerFaq;
  ctaLabel?: string;
  ctaHref?: string;
};

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function faqJsonLd(faq: typeof habitTrackerFaq) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

export function MarketingNav() {
  return (
    <nav className={styles.nav} aria-label="The Win List navigation">
      <a className={styles.brand} href="/">
        <img src="/icon.svg" alt="" />
        <span>The Win List</span>
      </a>
      <div className={styles.navLinks}>
        <a href="/habit-tracker/">Habit tracker</a>
        <a href="/about/">About</a>
        <a href="/contact/">Contact</a>
      </div>
    </nav>
  );
}

export function MarketingFooter() {
  return (
    <footer className={styles.footer}>
      <div>
        <strong>The Win List</strong>
        <p>Free habit tracker app for core wins, optional routines, Mood, and offline-first progress.</p>
      </div>
      <div className={styles.footerLinks}>
        {publicRoutes.slice(1).map((route) => (
          <a href={route.href} key={route.href}>
            {route.label}
          </a>
        ))}
      </div>
    </footer>
  );
}

export function SeoPage({
  eyebrow,
  title,
  intro,
  sections,
  highlights = productFeatures.slice(0, 4),
  faq,
  ctaLabel = "Open The Win List",
  ctaHref = "/"
}: SeoPageProps) {
  return (
    <main className={styles.shell}>
      <MarketingNav />
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{intro}</p>
          <div className={styles.actions}>
            <a className={styles.primaryAction} href={ctaHref}>
              {ctaLabel}
            </a>
            <a className={styles.secondaryAction} href="/habit-tracker-no-sign-up/">
              No sign up
            </a>
          </div>
        </div>
        <aside className={styles.promiseCard} aria-label="The Win List promises">
          {highlights.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </aside>
      </section>

      <section className={styles.sectionGrid} aria-label="Product details">
        {sections.map((section) => (
          <article className={styles.infoCard} key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </article>
        ))}
      </section>

      {faq ? (
        <section className={styles.faq} aria-label="Habit tracker questions">
          <span className={styles.eyebrow}>FAQ</span>
          <h2>Questions people ask before choosing a habit tracker</h2>
          <div className={styles.faqList}>
            {faq.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      <MarketingFooter />
    </main>
  );
}

export function HomeSeoSection() {
  return (
    <section className={styles.homeSeo} aria-label="About The Win List habit tracker">
      <div className={styles.homeSeoInner}>
        <span className={styles.eyebrow}>Free habit tracker app</span>
        <h2>A simple habit tracker app that starts with today</h2>
        <p>
          The Win List is a free habit tracker app for daily routines, core wins, optional routines, Mood logging,
          streaks, and offline-first progress. No sign up is needed: your wins are saved locally on this device.
        </p>
        <div className={styles.homeSeoLinks}>
          <a href="/habit-tracker/">Read how it works</a>
          <a href="/offline-habit-tracker/">Offline habit tracker</a>
          <a href="/privacy-policy/">Privacy</a>
        </div>
      </div>
    </section>
  );
}
