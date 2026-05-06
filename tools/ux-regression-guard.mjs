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
    ok: component.includes("Perfect streak") && component.includes("A perfect streak counts days where every permanent win is logged.")
  },
  {
    name: "feedback controls remain available",
    ok: component.includes("Test feedback") && css.includes(".feedback-settings")
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
