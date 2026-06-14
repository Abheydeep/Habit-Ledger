import styles from "./SeoPages.module.css";

export const siteUrl = "https://www.mywinlist.com";
export const siteName = "The Win List";
export const ogImageUrl = `${siteUrl}/og-image.png`;

export const publicRoutes = [
  { href: "/", label: "Open app" },
  { href: "/habit-tracker", label: "Habit tracker" },
  { href: "/habit-tracker-no-sign-up", label: "No sign up" },
  { href: "/offline-habit-tracker", label: "Offline" },
  { href: "/habit-tracker-pwa", label: "PWA" },
  { href: "/habit-tracker-for-students", label: "Students" },
  { href: "/habit-tracker-for-working-professionals", label: "Professionals" },
  { href: "/habit-tracker-for-homemakers", label: "Homemakers" },
  { href: "/rest-day-habit-tracker", label: "Rest days" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms", label: "Terms" }
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

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: siteUrl,
  logo: {
    "@type": "ImageObject",
    url: `${siteUrl}/icon-512.png`,
    width: 512,
    height: 512
  },
  sameAs: ["https://github.com/Abheydeep/Habit-Ledger"]
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  alternateName: "My Win List",
  url: siteUrl,
  publisher: {
    "@type": "Organization",
    name: siteName,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/icon-512.png`,
      width: 512,
      height: 512
    }
  }
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const habitTrackerFaq: FaqItem[] = [
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

export const homeFaq: FaqItem[] = [
  {
    question: "Is The Win List free?",
    answer: "Yes. The app is free to use, requires no sign up, and saves your daily wins locally on this device."
  },
  {
    question: "Can I use it offline?",
    answer:
      "Yes. After the first load, the app is designed as an offline-first PWA, so your daily routine stays available even when the connection is unreliable."
  },
  {
    question: "How many habits should I start with?",
    answer:
      "Start small. The Win List is designed around core wins and optional routines, so you can keep the required day light while still tracking extra habits when you have energy."
  }
];

type SeoSection = {
  title: string;
  body: string;
};

type BreadcrumbParent = {
  name: string;
  path: string;
};

type SeoPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: SeoSection[];
  path: string;
  highlights?: string[];
  faq?: FaqItem[];
  breadcrumbParent?: BreadcrumbParent;
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

export function faqJsonLd(faq: FaqItem[]) {
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

export function breadcrumbJsonLd(path: string, title: string, parent?: BreadcrumbParent) {
  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "The Win List",
      item: `${siteUrl}/`
    }
  ];

  if (parent) {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: parent.name,
      item: `${siteUrl}${parent.path}`
    });
  }

  items.push({
    "@type": "ListItem",
    position: items.length + 1,
    name: title,
    item: `${siteUrl}${path}`
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items
  };
}

export function MarketingNav() {
  return (
    <nav className={styles.nav} aria-label="The Win List navigation">
      <a className={styles.brand} href="/">
        <img src="/icon.svg" alt="" width="42" height="42" loading="eager" decoding="async" />
        <span>The Win List</span>
      </a>
      <div className={styles.navLinks}>
        <a href="/habit-tracker">Habit tracker</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
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
  path,
  highlights = productFeatures.slice(0, 4),
  faq,
  breadcrumbParent,
  ctaLabel = "Open The Win List",
  ctaHref = "/"
}: SeoPageProps) {
  return (
    <main className={styles.shell}>
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={breadcrumbJsonLd(path, title, breadcrumbParent)} />
      {faq ? <JsonLd data={faqJsonLd(faq)} /> : null}
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
            <a className={styles.secondaryAction} href="/habit-tracker-no-sign-up">
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
        <div className={styles.homeSeoGrid}>
          <article>
            <h3>What The Win List is</h3>
            <p>
              The Win List is a browser-based habit tracker app for people who want a finishable daily routine. Instead
              of asking you to track every possible goal, it starts with a small set of core wins that make the day feel
              complete. Optional routines stay separate, so extra habits can support the day without turning the app
              into a pressure machine.
            </p>
          </article>
          <article>
            <h3>How daily tracking works</h3>
            <p>
              Open the app, choose a win, and mark it when you have shown up. If the day was messy, use Mood to record
              what actually happened: Won, Strong, Partial, Skipped, or Rest day. That gives you a more honest habit
              record than a plain checkbox, especially on days when you did something but not everything.
            </p>
          </article>
          <article>
            <h3>Why no sign up matters</h3>
            <p>
              The first session should be about logging a win, not creating another account. The Win List saves progress
              locally on your device by default, works offline after first load, and keeps optional cloud backup as a
              choice. You can try the habit tracker immediately and decide later whether sync is useful.
            </p>
          </article>
          <article>
            <h3>Who it is built for</h3>
            <p>
              Students can use it for study blocks, water, movement, and sleep. Working professionals can use it for
              focused work, meals, steps, and evening shutdown. The same core wins model works for anyone who needs a
              simple daily routine tracker that does not punish real life.
            </p>
          </article>
          <article>
            <h3>What unlocks after a few days</h3>
            <p>
              Once you have enough activity, the app starts showing your 5-day pattern. That reflection highlights your
              strongest win, the win that needs protection, and the next small move to make tomorrow easier. The point
              is not to judge your month. It is to help you notice what is already working.
            </p>
          </article>
          <article>
            <h3>How to use it on your phone</h3>
            <p>
              Visit mywinlist.com in Safari or Chrome and add it to your home screen. The installable PWA opens quickly,
              uses a compact mobile layout, and keeps the main path simple: open, mark one core win, optionally log
              Mood, and leave with momentum.
            </p>
          </article>
        </div>
        <div className={styles.homeSeoFaq} aria-label="The Win List FAQ">
          <h3>Habit tracker questions</h3>
          {homeFaq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
        <div className={styles.homeSeoLinks}>
          <a href="/habit-tracker">Read how it works</a>
          <a href="/offline-habit-tracker">Offline habit tracker</a>
          <a href="/privacy-policy">Privacy</a>
        </div>
      </div>
    </section>
  );
}
