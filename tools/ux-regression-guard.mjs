import { readFileSync } from "node:fs";

const component = readFileSync("components/HabitTracker.tsx", "utf8");
const css = readFileSync("app/globals.css", "utf8");

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
    ok: component.includes("setPersonalizerOpen(false);") && component.includes("starter-card")
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
    name: "return path prompt stays close to today",
    ok:
      component.includes("return-path-prompt") &&
      component.includes("const shouldShowReturnPrompt = !isInstalledApp || !reminderSettings.enabled;") &&
      css.includes(".return-path-prompt")
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
    name: "mobile today keeps more wins above the fold",
    ok:
      css.includes("Mobile daily-driver polish") &&
      css.includes("calc(92px + env(safe-area-inset-bottom))") &&
      css.includes("grid-template-columns: 46px minmax(0, 1fr)") &&
      css.includes(".brand-media .brand-avatar")
  },
  {
    name: "auto backup states remain visible",
    ok: component.includes("Backup pending") && component.includes("Backup now")
  },
  {
    name: "simple today mode remains default and toggleable",
    ok: component.includes("SIMPLE_TODAY_STORAGE_KEY") && component.includes("simple-today-button")
  },
  {
    name: "core list pressure guard remains visible",
    ok:
      component.includes("missedPerfectDaysInARow") &&
      component.includes('currentDayPart !== "evening"') &&
      component.includes("PRESSURE_GUARD_SEEN_KEY") &&
      css.includes(".pressure-guard-card")
  },
  {
    name: "dark mode mobile text remains readable",
    ok:
      css.includes(".tracker-shell.scheme-dark .persistence-strip span") &&
      css.includes(".tracker-shell.scheme-dark .note-box.compact.collapsed") &&
      css.includes(".tracker-shell.scheme-dark .day-group-header small") &&
      css.includes("color: #f3fbf7")
  },
  {
    name: "quick win manager avoids settings friction",
    ok: component.includes("quick-manager-sheet") && component.includes("Full win settings") && css.includes(".quick-manager-sheet")
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
