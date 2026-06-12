import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const outDir = "out";
const indexPath = join(outDir, "index.html");
const cleanRoutePaths = {
  launch: join(outDir, "launch.html"),
  habitTracker: join(outDir, "habit-tracker.html"),
  noSignUp: join(outDir, "habit-tracker-no-sign-up.html"),
  offline: join(outDir, "offline-habit-tracker.html"),
  student: join(outDir, "habit-tracker-for-students.html"),
  professional: join(outDir, "habit-tracker-for-working-professionals.html"),
  about: join(outDir, "about.html"),
  contact: join(outDir, "contact.html"),
  privacy: join(outDir, "privacy-policy.html"),
  terms: join(outDir, "terms.html")
};
const slashAliasPaths = {
  launch: join(outDir, "launch", "index.html"),
  habitTracker: join(outDir, "habit-tracker", "index.html"),
  noSignUp: join(outDir, "habit-tracker-no-sign-up", "index.html"),
  offline: join(outDir, "offline-habit-tracker", "index.html"),
  student: join(outDir, "habit-tracker-for-students", "index.html"),
  professional: join(outDir, "habit-tracker-for-working-professionals", "index.html"),
  about: join(outDir, "about", "index.html"),
  contact: join(outDir, "contact", "index.html"),
  privacy: join(outDir, "privacy-policy", "index.html"),
  terms: join(outDir, "terms", "index.html")
};

if (!existsSync(indexPath)) {
  console.error("Build output guard failed: out/index.html is missing. Run `npm run build` first.");
  process.exit(1);
}

function listFiles(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });
}

function readMatchingAssets(extension) {
  return listFiles(join(outDir, "_next", "static"))
    .filter((path) => path.endsWith(extension))
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
}

function visibleWordCount(source) {
  return source
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

const html = readFileSync(indexPath, "utf8");
const launchHtml = existsSync(cleanRoutePaths.launch) ? readFileSync(cleanRoutePaths.launch, "utf8") : "";
const habitTrackerHtml = existsSync(cleanRoutePaths.habitTracker) ? readFileSync(cleanRoutePaths.habitTracker, "utf8") : "";
const noSignUpHtml = existsSync(cleanRoutePaths.noSignUp) ? readFileSync(cleanRoutePaths.noSignUp, "utf8") : "";
const offlineHtml = existsSync(cleanRoutePaths.offline) ? readFileSync(cleanRoutePaths.offline, "utf8") : "";
const studentHtml = existsSync(cleanRoutePaths.student) ? readFileSync(cleanRoutePaths.student, "utf8") : "";
const professionalHtml = existsSync(cleanRoutePaths.professional) ? readFileSync(cleanRoutePaths.professional, "utf8") : "";
const aboutHtml = existsSync(cleanRoutePaths.about) ? readFileSync(cleanRoutePaths.about, "utf8") : "";
const contactHtml = existsSync(cleanRoutePaths.contact) ? readFileSync(cleanRoutePaths.contact, "utf8") : "";
const privacyHtml = existsSync(cleanRoutePaths.privacy) ? readFileSync(cleanRoutePaths.privacy, "utf8") : "";
const termsHtml = existsSync(cleanRoutePaths.terms) ? readFileSync(cleanRoutePaths.terms, "utf8") : "";
const css = readMatchingAssets(".css");
const js = readMatchingAssets(".js");
const builtText = `${html}\n${css}\n${js}`;

const checks = [
  {
    name: "production shell includes SEO and PWA metadata",
    ok:
      html.includes("Free Habit Tracker App, No Login") &&
      html.includes('rel="manifest"') &&
      html.includes("https://www.mywinlist.com/") &&
      html.includes('"@type":"SoftwareApplication"') &&
      html.includes("/og-image.png") &&
      html.includes("A simple habit tracker app that starts with today") &&
      html.includes("Who it is built for") &&
      html.includes("Habit tracker questions") &&
      visibleWordCount(html) >= 500
  },
  {
    name: "seo landing and trust pages ship",
    ok:
      habitTrackerHtml.includes("Free Habit Tracker App for Daily Routines") &&
      habitTrackerHtml.includes('"@type":"FAQPage"') &&
      noSignUpHtml.includes("Habit Tracker App With No Sign Up") &&
      offlineHtml.includes("Offline Habit Tracker You Can Add to Your Phone") &&
      offlineHtml.includes("What stays available offline") &&
      studentHtml.includes("Free Habit Tracker for Students") &&
      professionalHtml.includes("Simple Habit Tracker for Working Professionals") &&
      aboutHtml.includes("I built The Win List") &&
      contactHtml.includes("GitHub repository") &&
      privacyHtml.includes("Local-first storage") &&
      termsHtml.includes("No professional advice") &&
      habitTrackerHtml.includes('rel="canonical" href="https://www.mywinlist.com/habit-tracker"') &&
      offlineHtml.includes('rel="canonical" href="https://www.mywinlist.com/offline-habit-tracker"') &&
      existsSync(cleanRoutePaths.noSignUp) &&
      Object.values(slashAliasPaths).every((path) => existsSync(path)) &&
      existsSync(join(outDir, "og-image.png"))
  },
  {
    name: "launch poster static page ships",
    ok:
      launchHtml.includes("Track core wins. Keep optional routines light.") &&
      launchHtml.includes("Core wins first") &&
      launchHtml.includes("Optional routines") &&
      launchHtml.includes("Mood, not guilt") &&
      launchHtml.includes("first-win momentum") &&
      launchHtml.includes("no-login/offline trust") &&
      launchHtml.includes("Your 5-day pattern") &&
      launchHtml.includes("mywinlist.com") &&
      builtText.includes("Launch poster")
  },
  {
    name: "dark theme prepaint guard ships",
    ok:
      html.includes("the-win-list:color-scheme:v1") &&
      /root\.dataset\.colorScheme\s*=\s*scheme/.test(html) &&
      html.includes("prefers-color-scheme: dark") &&
      /:root:not\(\[data-color-scheme="?light"?\]\) body/.test(css) &&
      /:root\[data-color-scheme="?dark"?\]\s*\.tracker-shell:not\(\.scheme-dark\)/.test(css) &&
      js.includes("the-win-list:color-scheme:v1")
  },
  {
    name: "desktop Today-first grid ships in CSS",
    ok:
      css.includes("@media (min-width:1081px)") &&
      /dashboard-grid\{grid-template-columns:minmax\(0,1\.15fr\) minmax\(330px,\.?85fr\)/.test(css) &&
      css.includes(".tracker-shell.analytics-locked .dashboard-grid{grid-template-columns:minmax(0,1fr)") &&
      /\.tracker-shell\.first-run-focus \.(?:tracker-hero|dashboard-grid),\.tracker-shell\.first-run-focus \.(?:dashboard-grid|tracker-hero)\{max-width:1240px/.test(css) &&
      css.includes(".tracker-shell.first-run-focus .hero-actions{width:min(500px,100%)") &&
      css.includes(".tracker-shell.first-run-focus .starter-card") &&
      css.includes("max-width:1040px") &&
      css.includes("grid-template-columns:58px minmax(0,1fr) max-content")
  },
  {
    name: "desktop activation copy and controls ship",
    ok:
      builtText.includes("desktop-orientation-strip") &&
      builtText.includes("Start with one win.") &&
      builtText.includes("Your streak begins here.") &&
      builtText.includes("Saved locally. No login needed.") &&
      builtText.includes("today-header-controls")
  },
  {
    name: "habit action hierarchy ships",
    ok:
      builtText.includes("Mark done") &&
      builtText.includes("Mood") &&
      !builtText.includes("Tap to win") &&
      builtText.includes("mood-preview")
  },
  {
    name: "mobile first-run activation ships",
    ok:
      builtText.includes("Build in 30 sec") &&
      !builtText.includes("Use starter list") &&
      builtText.includes("mobile-return-chip") &&
      builtText.includes("mobile-return-chip reminder") &&
      builtText.includes("Chrome install: tap the browser menu, then Add to Home screen.") &&
      builtText.includes("Install app") &&
      builtText.includes("Turn on daily reminders") &&
      builtText.includes("Change these wins anytime.") &&
      builtText.includes("long-press a win") &&
      builtText.includes("Today's sections") &&
      builtText.includes("Starter workday list") &&
      builtText.includes("first-run-focus") &&
      builtText.includes("setup-pending") &&
      css.includes(".tracker-shell.first-run-focus .month-panel{display:none}")
  },
  {
    name: "static fallback uses a neutral loading shell before local state",
    ok:
      html.includes("tracker-shell booting") &&
      html.includes("tracker-boot-card") &&
      html.includes("Loading your wins") &&
      !html.includes("Use starter list") &&
      !html.includes("experience-first_run_empty") &&
      !html.includes("analytics-locked") &&
      !html.includes("Tap to win") &&
      !html.includes("Monthly Review") &&
      !html.includes("Win heat map")
  },
  {
    name: "first-win aha and analytics staging ship",
    ok:
      builtText.includes("first-win-aha-card") &&
      builtText.includes("Momentum started. First win logged.") &&
      builtText.includes("Your 5-day pattern") &&
      builtText.includes("five-day-pattern-card") &&
      builtText.includes("Win heat map") &&
      builtText.includes("day-header.selected") &&
      builtText.includes("scrollTo({left") &&
      !builtText.includes("Momentum summary") &&
      builtText.includes("Review unlocks after 2 active days or 3 wins.") &&
      builtText.includes("Heat map unlocks after 5 active days.")
  },
  {
    name: "supportive returning states ship",
    ok:
      builtText.includes("No reset drama") &&
      builtText.includes("Evening recap") &&
      builtText.includes("today-support-card")
  },
  {
    name: "accessibility focus and touch states ship",
    ok:
      css.includes(":where(button,a,input,select,textarea):focus-visible") &&
      css.includes("-webkit-tap-highlight-color") &&
      css.includes("@media (hover:none)")
  }
];

const failed = checks.filter((check) => !check.ok);

if (failed.length > 0) {
  console.error("Build output guard failed:");
  for (const check of failed) {
    console.error(`- ${check.name}`);
  }
  process.exit(1);
}

console.log(`Build output guard passed (${checks.length} checks).`);
