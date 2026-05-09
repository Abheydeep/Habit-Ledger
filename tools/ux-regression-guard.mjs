import { readFileSync } from "node:fs";

const component = readFileSync("components/HabitTracker.tsx", "utf8");
const css = readFileSync("app/globals.css", "utf8");
const layout = readFileSync("app/layout.tsx", "utf8");
const page = readFileSync("app/page.tsx", "utf8");
const robots = readFileSync("app/robots.ts", "utf8");
const sitemap = readFileSync("app/sitemap.ts", "utf8");
const ogImage = readFileSync("public/og-image.svg", "utf8");
const manifest = readFileSync("public/manifest.webmanifest", "utf8");
const personalization = readFileSync("lib/personalization.ts", "utf8");
const habitData = readFileSync("lib/habitData.ts", "utf8");

const checks = [
  {
    name: "no native confirm dialogs",
    ok: !/window\.confirm\s*\(/.test(component)
  },
  {
    name: "no native alert dialogs",
    ok: !/window\.alert\s*\(/.test(component)
  },
  {
    name: "today screen keeps companion context",
    ok: component.includes("Companion check-in") && css.includes(".companion-nudge")
  },
  {
    name: "local-first trust cue remains visible",
    ok: component.includes("localSaveLabel") && component.includes("No login needed.") && component.includes("Cloud backup")
  },
  {
    name: "first run remains non-blocking",
    ok:
      component.includes("setPersonalizerOpen(false);") &&
      component.includes("starter-card") &&
      component.includes("hasDefaultWinSetup") &&
      component.includes("Build your Win List") &&
      !component.includes("!simpleToday && shouldPromptPersonalization") &&
      component.includes('<option value="neutral">Neutral</option>') &&
      !component.includes("Auto from name") &&
      personalization.includes('avatarStyle: "neutral"')
  },
  {
    name: "daily copy keeps returning users awake",
    ok:
      component.includes("dailyNotePrompts") &&
      component.includes("dailyNotePlaceholder") &&
      component.includes("Third day. The habit is starting to stick.") &&
      component.includes("One week. That is real.") &&
      component.includes("Thirty days. That is a serious baseline.")
  },
  {
    name: "mood status path stays unified and explained",
    ok:
      habitData.includes("description:") &&
      component.includes("completedHabitIds = new Set") &&
      component.includes("record.completedHabitIds.includes(habitId)") &&
      component.includes("isCompletionMood(mood)") &&
      component.includes("mood.description") &&
      component.includes("ClipboardCheck size={16}") &&
      css.includes("minmax(74px, max-content)") &&
      css.includes(".mood-sticker em")
  },
  {
    name: "perfect streak wording stays clear",
    ok: component.includes("Perfect streak") && component.includes("A perfect streak counts days where every core win is logged.")
  },
  {
    name: "feedback controls remain available",
    ok: component.includes("Test feedback") && css.includes(".feedback-settings")
  },
  {
    name: "core wins can move both ways inline",
    ok: component.includes("makeOptionalHabitPermanent") && component.includes("makePermanentHabitOptional")
  },
  {
    name: "core win demotion requires press and hold",
    ok:
      component.includes("startRequirementLongPress") &&
      component.includes("requirement-longpress-panel") &&
      !component.includes('title="Make optional"')
  },
  {
    name: "return path prompt is daily gated near today",
    ok:
      component.includes("return-path-prompt") &&
      component.includes("RETURN_PROMPT_SEEN_DATE_KEY") &&
      component.includes("returnPromptVisible") &&
      component.includes("hideReturnPromptForToday") &&
      component.includes("return-path-dismiss") &&
      css.includes(".return-path-prompt") &&
      css.includes("grid-template-columns: repeat(auto-fit, minmax(70px, 1fr))") &&
      css.includes(".return-path-prompt button")
  },
  {
    name: "installed shell chrome follows dark mode",
    ok:
      layout.includes('statusBarStyle: "black-translucent"') &&
      layout.includes("(prefers-color-scheme: dark)") &&
      manifest.includes('"theme_color": "#111c19"') &&
      component.includes("syncShellThemeChrome") &&
      component.includes('setMetaContent("theme-color", color)') &&
      css.includes(':root[data-color-scheme="dark"] body')
  },
  {
    name: "installed PWA stops showing install actions",
    ok:
      component.includes("APP_INSTALLED_STORAGE_KEY") &&
      component.includes("installed-status-chip") &&
      component.includes("!isInstalledApp ? (") &&
      css.includes(".installed-status-chip")
  },
  {
    name: "ios install path is explicit",
    ok:
      component.includes("isIOSDevice") &&
      component.includes("Add to Home Screen") &&
      component.includes("Share2") &&
      component.includes("return-path-note") &&
      css.includes(".return-path-note")
  },
  {
    name: "ios has png touch icons",
    ok:
      layout.includes("apple-touch-icon.png") &&
      layout.includes("icon-192.png") &&
      manifest.includes("/icon-192.png") &&
      manifest.includes("/icon-512.png")
  },
  {
    name: "public search indexing signals stay complete",
    ok:
      layout.includes('metadataBase: new URL(siteUrl)') &&
      layout.includes('canonical: "/"') &&
      layout.includes("daily wins tracker") &&
      layout.includes("openGraph") &&
      layout.includes("twitter") &&
      layout.includes("/og-image.svg") &&
      page.includes('type="application/ld+json"') &&
      page.includes("<noscript>") &&
      page.includes("free daily wins tracker at mywinlist.com") &&
      page.includes('"@type": "WebApplication"') &&
      page.includes("mywinlist.com") &&
      robots.includes("sitemap.xml") &&
      robots.includes('export const dynamic = "force-static"') &&
      robots.includes('disallow: ["/admin"]') &&
      sitemap.includes("https://www.mywinlist.com") &&
      sitemap.includes('export const dynamic = "force-static"') &&
      sitemap.includes('changeFrequency: "daily"') &&
      manifest.includes('"id": "/"') &&
      manifest.includes('"categories": ["productivity", "health", "lifestyle"]') &&
      ogImage.includes("mywinlist.com") &&
      ogImage.includes("Free. No signup. Works offline.")
  },
  {
    name: "mobile today keeps more wins above the fold",
    ok:
      css.includes("Mobile daily-driver polish") &&
      css.includes("calc(92px + env(safe-area-inset-bottom))") &&
      css.includes("grid-template-columns: 46px minmax(0, 1fr)") &&
      css.includes(".brand-media .brand-avatar") &&
      component.includes('brand-lockup${personalizationSnapshot ? " personalized" : ""}') &&
      css.includes(".brand-lockup.personalized .brand-media .brand-avatar") &&
      component.includes("mobile-collapse-summary") &&
      component.includes("permanent-list-progress") &&
      css.includes(".permanent-list-progress")
  },
  {
    name: "simple today keeps day part headers visible",
    ok:
      component.includes('evening: "Evening"') &&
      component.includes("createInitialDayPartOpenState(getDayPartForHour(new Date().getHours()))") &&
      component.includes('evening: currentDayPart === "evening"') &&
      !component.includes("morning: true,\n    daytime: true,\n    evening: true") &&
      css.includes(".today-panel.simple .day-group:not(.optional-routines) .day-group-header small") &&
      !css.includes(".today-panel.simple .day-group:not(.optional-routines) .day-group-header {\n  display: none;")
  },
  {
    name: "optional routines header stays readable on mobile",
    ok:
      component.includes("Extra credit. Not required for 100%.") &&
      css.includes(".day-group.optional-routines .day-group-header div") &&
      css.includes(".day-group.optional-routines .day-group-header small") &&
      css.includes("white-space: normal")
  },
  {
    name: "mobile save status is toast-led and error-only",
    ok:
      component.includes("SAVE_TRUST_TOAST_DATE_KEY") &&
      component.includes("CLOUD_TRUST_TOAST_DATE_KEY") &&
      component.includes("backup-error-chip") &&
      !component.includes('className="persistence-strip"') &&
      css.includes(".backup-error-chip")
  },
  {
    name: "simple today mode remains default and toggleable",
    ok: component.includes("SIMPLE_TODAY_STORAGE_KEY") && component.includes("simple-today-button")
  },
  {
    name: "core list hint teaches hold menu without pressure copy",
    ok:
      component.includes("getHoldMenuHint") &&
      component.includes('currentDayPart !== "evening"') &&
      component.includes("permanentCount < 8") &&
      component.includes("HOLD_MENU_HINT_SEEN_KEY") &&
      component.includes("Hold menu tip") &&
      component.includes("Press and hold any core win") &&
      !component.includes("missedPerfectDaysInARow") &&
      !component.includes("PRESSURE_GUARD_SEEN_KEY") &&
      !component.includes("Lighten list") &&
      !component.includes('label: "Pressure guard"') &&
      css.includes(".pressure-guard-card")
  },
  {
    name: "dark mode mobile text remains readable",
    ok:
      css.includes(".tracker-shell.scheme-dark .backup-error-chip") &&
      css.includes(".tracker-shell.scheme-dark .note-box.compact.collapsed") &&
      css.includes(".tracker-shell.scheme-dark .day-group-header small") &&
      css.includes("color: #f3fbf7")
  },
  {
    name: "quick win manager avoids settings friction",
    ok:
      component.includes("quick-manager-sheet") &&
      component.includes("Full win settings") &&
      component.includes("wins-overflow-menu") &&
      component.includes("MoreHorizontal") &&
      css.includes(".quick-manager-sheet") &&
      css.includes(".wins-overflow-menu")
  },
  {
    name: "wins settings stay categorized and sample-led",
    ok:
      habitData.includes("habitCategoryMeta") &&
      habitData.includes("Drink jeera water") &&
      habitData.includes("First hour no screen") &&
      habitData.includes("Plan tomorrow") &&
      habitData.includes("getHabitCategory") &&
      component.includes("sample-habit-library") &&
      component.includes("editor-category-toggle") &&
      component.includes("groupHabitsByCategory") &&
      component.includes("expandedWinCategories") &&
      css.includes(".sample-habit-library") &&
      css.includes(".editor-category") &&
      css.includes(".category-count-chip")
  },
  {
    name: "settings opens as an overview instead of a heavy editor",
    ok: component.includes("setExpandedSettingsSections(collapsedSettingsSections);")
  },
  {
    name: "analytics keeps plain-language next move",
    ok: component.includes("Next best move") && component.includes("Tomorrow: protect")
  }
];

const failed = checks.filter((check) => !check.ok);

if (failed.length > 0) {
  console.error("UX regression guard failed:");
  for (const check of failed) {
    console.error(`- ${check.name}`);
  }
  process.exit(1);
}

console.log(`UX regression guard passed (${checks.length} checks).`);
