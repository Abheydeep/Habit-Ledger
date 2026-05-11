import { readFileSync } from "node:fs";

const component = readFileSync("components/HabitTracker.tsx", "utf8");
const css = readFileSync("app/globals.css", "utf8");
const layout = readFileSync("app/layout.tsx", "utf8");
const page = readFileSync("app/page.tsx", "utf8");
const robots = readFileSync("app/robots.ts", "utf8");
const sitemap = readFileSync("app/sitemap.ts", "utf8");
const launchPage = readFileSync("app/launch/page.tsx", "utf8");
const launchCss = readFileSync("app/launch/LaunchPoster.module.css", "utf8");
const reelPage = readFileSync("app/reel/page.tsx", "utf8");
const ogImage = readFileSync("public/og-image.svg", "utf8");
const manifest = readFileSync("public/manifest.webmanifest", "utf8");
const personalization = readFileSync("lib/personalization.ts", "utf8");
const habitData = readFileSync("lib/habitData.ts", "utf8");
const experienceState = readFileSync("lib/experienceState.ts", "utf8");
const anonymousAnalytics = readFileSync("lib/anonymousAnalytics.ts", "utf8");
const adminConsole = readFileSync("components/AdminConsole.tsx", "utf8");
const adminMetrics = readFileSync("lib/adminMetrics.ts", "utf8");
const anonymousUsageMigration = readFileSync("supabase/migrations/20260510_anonymous_usage_metrics.sql", "utf8");
const packageJson = readFileSync("package.json", "utf8");
const renderConfig = readFileSync("render.yaml", "utf8");
const releaseWorkflow = readFileSync(".github/workflows/release-verification.yml", "utf8");
const buildOutputGuard = readFileSync("tools/build-output-guard.mjs", "utf8");

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
      component.includes("Change these wins anytime.") &&
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
    name: "return path stays compact in the mobile date header",
    ok:
      component.includes("headerReturnAction") &&
      component.includes("headerReturnLabel") &&
      component.includes("handleHeaderReturnAction") &&
      component.includes("mobile-return-chip") &&
      component.includes("installActionWaiting") &&
      component.includes("installFallbackReady") &&
      component.includes('clientStateReady && !isInstalledApp') &&
      component.includes('headerReturnAction === "install"') &&
      component.includes('headerReturnAction === "reminder"') &&
      component.includes("disabled={installActionWaiting}") &&
      component.includes("Install is getting ready. Try again in a moment.") &&
      !component.includes("returnPromptVisible") &&
      !component.includes("RETURN_PROMPT_SEEN_DATE_KEY") &&
      !component.includes("return-path-prompt") &&
      css.includes(".mobile-return-chip") &&
      !css.includes(".mobile-activation-actions{grid-template-columns:minmax(0,1.55fr) repeat(2")
  },
  {
    name: "installed shell chrome follows dark mode",
    ok:
      layout.includes('statusBarStyle: "black-translucent"') &&
      layout.includes("themeInitScript") &&
      layout.includes("the-win-list:color-scheme:v1") &&
      layout.includes("root.dataset.colorScheme = scheme") &&
      layout.includes("(prefers-color-scheme: dark)") &&
      layout.includes("<head>") &&
      manifest.includes('"theme_color": "#111c19"') &&
      component.includes("syncShellThemeChrome") &&
      component.includes("getInitialColorScheme") &&
      component.includes('setMetaContent("theme-color", color)') &&
      css.includes(':root:not([data-color-scheme="light"]) body') &&
      css.includes(':root[data-color-scheme="dark"] body') &&
      css.includes(':root[data-color-scheme="dark"] .tracker-shell:not(.scheme-dark)')
  },
  {
    name: "installed PWA stops showing install actions",
    ok:
      component.includes("APP_INSTALLED_STORAGE_KEY") &&
      component.includes("installed-status-chip") &&
      component.includes('clientStateReady && !isInstalledApp') &&
      component.includes("headerReturnAction") &&
      css.includes(".installed-status-chip")
  },
  {
    name: "ios install path is explicit",
    ok:
      component.includes("isIOSDevice") &&
      component.includes("Add to Home Screen") &&
      component.includes("Share2") &&
      component.includes("mobile-return-chip") &&
      css.includes(".mobile-return-chip")
  },
  {
    name: "initial shell waits for local state before showing the app",
    ok:
      component.includes("tracker-shell booting") &&
      component.includes("tracker-boot-card") &&
      component.includes("Loading your wins") &&
      component.includes('if (!clientStateReady)') &&
      css.includes(".tracker-shell.booting") &&
      css.includes(".tracker-boot-card")
  },
  {
    name: "dark footer edit icon stays visible",
    ok:
      css.includes(".tracker-shell.scheme-dark .hero-actions .setup-edit-button svg") &&
      css.includes(".tracker-shell.scheme-dark .hero-actions .setup-build-button.hot svg") &&
      css.includes("stroke-width: 2.4")
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
    name: "launch poster is a polished shareable website route",
    ok:
      launchPage.includes("Track core wins. Keep optional routines light.") &&
      launchPage.includes("Core wins first") &&
      launchPage.includes("Optional routines") &&
      launchPage.includes("Mood, not guilt") &&
      launchPage.includes("First-win momentum") &&
      launchPage.includes("no-login/offline trust") &&
      launchPage.includes("5-day pattern reflection") &&
      launchPage.includes("Your 5-day pattern") &&
      launchPage.includes("mywinlist.com") &&
      launchCss.includes(".poster") &&
      launchCss.includes("@media print") &&
      launchCss.includes("Mobile launch poster polish") &&
      launchCss.includes("@media (max-width: 640px)") &&
      launchCss.includes("overflow-wrap: anywhere") &&
      sitemap.includes("`${siteUrl}/launch/`") &&
      component.includes('href={`${APP_BASE_PATH}/launch/`}') &&
      component.includes('href={`${APP_BASE_PATH}/reel/`}') &&
      renderConfig.includes("source: /launch") &&
      renderConfig.includes("destination: /launch/") &&
      component.includes("Launch poster")
  },
  {
    name: "reel caption uses current product language",
    ok:
      reelPage.includes("core wins") &&
      reelPage.includes("optional routines") &&
      reelPage.includes("Mood") &&
      reelPage.includes("first-win momentum") &&
      reelPage.includes("no-login/offline trust") &&
      reelPage.includes("5-day pattern reflection") &&
      !reelPage.includes("track daily wins") &&
      !reelPage.includes("log moods") &&
      !reelPage.includes("heat map")
  },
  {
    name: "anonymous admin metrics track usage without personal notes",
    ok:
      anonymousAnalytics.includes("anonymous_app_open") &&
      anonymousAnalytics.includes("anonymous_daily_summary") &&
      anonymousAnalytics.includes("completed_core_win_keys") &&
      anonymousAnalytics.includes("completed_optional_routine_keys") &&
      anonymousAnalytics.includes("getHabitCategory") &&
      anonymousAnalytics.includes("install_button_clicked") &&
      anonymousAnalytics.includes("ios_install_steps_opened") &&
      anonymousAnalytics.includes("appinstalled_detected") &&
      !anonymousAnalytics.includes("note") &&
      component.includes("trackAnonymousAppOpen") &&
      component.includes("trackAnonymousDailySummary") &&
      component.includes("trackAnonymousInstallEvent") &&
      adminConsole.includes("People tried app") &&
      adminConsole.includes("People with wins") &&
      adminConsole.includes("Install tries 7d") &&
      adminConsole.includes("iPhone steps 7d") &&
      adminConsole.includes("Top core wins, 7 days") &&
      adminConsole.includes("No-login usage and retention") &&
      adminConsole.includes("Users that keep using it") &&
      adminConsole.includes("handleShareReport") &&
      adminConsole.includes("buildAdminShareText") &&
      css.includes(".admin-report-grid") &&
      adminMetrics.includes("anonymous_visitors") &&
      adminMetrics.includes("install_attempt_users_7d") &&
      anonymousUsageMigration.includes("latest_summaries") &&
      anonymousUsageMigration.includes("install_attempt_events") &&
      anonymousUsageMigration.includes("shell_installed_users")
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
    name: "mobile first run focuses build and first win before analytics",
    ok:
      component.includes("firstRunFocus") &&
      component.includes("setup-pending") &&
      component.includes("first-run-focus") &&
      component.includes("Build in 30 sec") &&
      !component.includes("Use starter list") &&
      !component.includes("useStarterList") &&
      component.includes('dayOpen ? "Today\'s sections"') &&
      component.includes("Starter workday list") &&
      component.includes("Change these wins anytime.") &&
      component.includes("long-press a win") &&
      component.includes("setup-edit-button") &&
      component.includes("Edit wins") &&
      component.includes("mobile-return-chip") &&
      component.includes("experience-${experienceState}") &&
      component.includes("analyticsStage") &&
      css.includes(".mobile-activation-actions") &&
      css.includes(".setup-edit-button") &&
      !css.includes("repeat(3, minmax(0, 0.88fr))") &&
      css.includes(".tracker-shell.first-run-focus .hero-actions") &&
      css.includes(".tracker-shell.first-run-focus .month-panel") &&
      css.includes(".tracker-shell.setup-pending .starter-card p") &&
      css.includes(":where(button, a, input, select, textarea):focus-visible")
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
    name: "desktop today is prioritized over analytics",
    ok:
      css.includes("@media (min-width: 1081px)") &&
      css.includes("grid-template-columns: minmax(0, 1.15fr) minmax(330px, 0.85fr)") &&
      css.includes(".tracker-shell.analytics-locked .dashboard-grid") &&
      css.includes("grid-template-columns: minmax(0, 1fr)") &&
      css.includes(".today-header-controls") &&
      css.includes(".today-panel .section-header .progress-ring")
  },
  {
    name: "desktop first-run layout does not waste the locked analytics column",
    ok:
      css.includes("Desktop activation polish") &&
      css.includes(".tracker-shell.first-run-focus .tracker-hero,") &&
      css.includes("max-width: 1240px") &&
      css.includes(".tracker-shell.first-run-focus .hero-actions") &&
      css.includes("width: min(500px, 100%)") &&
      css.includes(".tracker-shell.first-run-focus .hero-actions-row.setup") &&
      css.includes("minmax(170px, 1.15fr)") &&
      css.includes(".tracker-shell.first-run-focus .starter-card") &&
      css.includes("max-width: 1040px") &&
      css.includes(".tracker-shell.scheme-dark.first-run-focus .hero-actions .icon-text-button:not(.hot)") &&
      css.includes(".habit-win-button") &&
      css.includes("grid-template-columns: 62px minmax(0, 1fr) max-content") &&
      css.includes(".tap-hint") &&
      css.includes("justify-self: end")
  },
  {
    name: "habit action labels make completion primary",
    ok:
      component.includes("Mark done") &&
      component.includes('"Mood"') &&
      !component.includes("Tap to win") &&
      css.includes(".habit-card-actions .mood-preview")
  },
  {
    name: "desktop simple today has orientation and local trust copy",
    ok:
      component.includes("desktop-orientation-strip") &&
      component.includes("Start with one win.") &&
      component.includes("Your streak begins here.") &&
      component.includes("Saved locally. No login needed.") &&
      css.includes(".desktop-orientation-strip") &&
      css.includes("display: none") &&
      css.includes("display: flex")
  },
  {
    name: "starter personalization copy is desktop-readable",
    ok:
      component.includes("Starter workday list") &&
      component.includes("Change these wins anytime.") &&
      component.includes("Edit here, or long-press a win to make it core or optional.") &&
      component.includes("starter-card-button") &&
      css.includes(".starter-card p") &&
      css.includes("display: block")
  },
  {
    name: "first-win aha and staged analytics stay contracted",
    ok:
      component.includes("firstWinAhaVisible") &&
      component.includes("first-win-aha-card") &&
      component.includes("Momentum started. First win logged.") &&
      component.includes("fiveDayReflectionVisible") &&
      component.includes("Your 5-day pattern") &&
      component.includes("Next best move") &&
      component.includes("analyticsUnlocked ? (") &&
      component.includes("summarizeTrackerActivity") &&
      component.includes("getProductExperienceState") &&
      component.includes("getAnalyticsUnlockStage") &&
      css.includes(".first-win-aha-card") &&
      css.includes(".five-day-pattern-card")
  },
  {
    name: "experience state and staged analytics are explicit",
    ok:
      experienceState.includes('type ProductExperienceState') &&
      experienceState.includes('"first_run_empty"') &&
      experienceState.includes('"first_run_started"') &&
      experienceState.includes('"starter_active_no_history"') &&
      experienceState.includes('"returning_lapsed"') &&
      experienceState.includes('type AnalyticsUnlockStage = "locked" | "recap" | "review" | "patterns"') &&
      experienceState.includes("getProductExperienceState") &&
      experienceState.includes("getAnalyticsUnlockStage") &&
      component.includes("Momentum summary") &&
      component.includes("Review unlocks after 2 active days or 3 wins.") &&
      component.includes("Heat map unlocks after 5 active days.") &&
      component.includes("monthlyReviewUnlocked") &&
      component.includes("patternAnalyticsUnlocked") &&
      css.includes(".analytics-stage-card") &&
      css.includes(".analytics-lock-copy")
  },
  {
    name: "lapsed and evening recap states stay supportive",
    ok:
      component.includes("No reset drama — restart with one win.") &&
      component.includes("Evening recap") &&
      component.includes("today-support-card") &&
      css.includes(".today-support-card") &&
      css.includes(".lapsed-return-card")
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
      component.includes("setQuickManagerOpen(true);") &&
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
      component.includes("quick-win-name-field") &&
      component.includes("Edit names here.") &&
      component.includes("quickOptionalOpen") &&
      component.includes("quickOptionalHabits") &&
      component.includes("quickIconHabitId") &&
      component.includes("quickDeleteConfirmId") &&
      component.includes("quick-thumb-button") &&
      component.includes("quick-icon-picker") &&
      component.includes("quick-delete-confirm") &&
      component.includes("quick-optional-toggle") &&
      component.includes("Optional wins") &&
      component.includes("Expand when you want to edit them.") &&
      component.includes("Full win settings") &&
      component.includes("wins-overflow-menu") &&
      component.includes("MoreHorizontal") &&
      css.includes(".quick-manager-sheet") &&
      css.includes(".quick-win-name-field input") &&
      css.includes(".quick-thumb-button") &&
      css.includes(".quick-icon-picker") &&
      css.includes(".quick-delete-confirm") &&
      css.includes(".quick-optional-toggle") &&
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
      component.includes("addFormOpen") &&
      component.includes("sampleIdeasOpen") &&
      component.includes("sample-ideas-sheet") &&
      component.includes("sample-habit-library") &&
      component.includes("editor-category-toggle") &&
      component.includes("groupHabitsByCategory") &&
      component.includes("expandedWinCategories") &&
      component.includes("createCategoryOpenState([category])") &&
      component.includes("editor-drag-handle") &&
      component.includes("expandedEditorField") &&
      component.includes("requirement-confirm-row") &&
      css.includes(".sample-habit-library") &&
      css.includes(".sample-ideas-sheet") &&
      css.includes(".add-habit-collapsed") &&
      css.includes(".editor-category") &&
      css.includes(".editor-card-row") &&
      css.includes(".editor-field-toggle") &&
      css.includes(".category-count-chip")
  },
  {
    name: "new users can edit wins before confirming personalization",
    ok:
      component.includes('type PersonalizerStep = "intro" | "about" | "wins" | "preview"') &&
      component.includes('{ key: "wins", label: "Your wins" }') &&
      component.includes("draftPersonalizedHabits") &&
      component.includes("DraftHabitList") &&
      component.includes("Core wins") &&
      component.includes("Optional routines") &&
      component.includes("userCustomizedWins") &&
      component.includes("draftHabits: habits") &&
      component.includes("onDraftRequirementToggle") &&
      css.includes(".draft-wins-builder") &&
      css.includes(".draft-habit-row") &&
      css.includes(".draft-add-row")
  },
  {
    name: "today long press exposes edit and remove without card clutter",
    ok:
      component.includes("Remove this win") &&
      component.includes("Edit name/icons") &&
      component.includes("requirementDeleteConfirmId") &&
      component.includes("Confirm remove optional") &&
      component.includes("Keep optional") &&
      component.includes("Press and hold for options")
  },
  {
    name: "settings opens as an overview instead of a heavy editor",
    ok: component.includes("setExpandedSettingsSections(collapsedSettingsSections);")
  },
  {
    name: "analytics keeps plain-language next move",
    ok: component.includes("Next best move") && component.includes("Tomorrow: protect")
  },
  {
    name: "release verification gates typecheck build tests and output assets",
    ok:
      packageJson.includes('"verify:release"') &&
      packageJson.includes('"build:guard"') &&
      renderConfig.includes("npm run verify:release") &&
      releaseWorkflow.includes("release/daily-driver-v1") &&
      releaseWorkflow.includes("npm ci") &&
      releaseWorkflow.includes("npm run typecheck") &&
      releaseWorkflow.includes("npm run test:primary-wins") &&
      releaseWorkflow.includes("npm run ux:guard") &&
      releaseWorkflow.includes("npm run build") &&
      releaseWorkflow.includes("npm run build:guard") &&
      buildOutputGuard.includes("out/index.html") &&
      buildOutputGuard.includes("Build in 30 sec") &&
      buildOutputGuard.includes("desktop-orientation-strip")
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
