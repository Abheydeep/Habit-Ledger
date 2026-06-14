import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const outDir = "out";
const cleanRoutes = [
  "about",
  "contact",
  "habit-tracker",
  "habit-tracker-for-homemakers",
  "habit-tracker-for-students",
  "habit-tracker-for-working-professionals",
  "habit-tracker-no-sign-up",
  "habit-tracker-pwa",
  "launch",
  "offline-habit-tracker",
  "privacy-policy",
  "reel",
  "rest-day-habit-tracker",
  "terms"
];

for (const route of cleanRoutes) {
  const htmlSource = join(outDir, `${route}.html`);
  const htmlTarget = join(outDir, route, "index.html");
  const textSource = join(outDir, `${route}.txt`);
  const textTarget = join(outDir, route, "index.txt");

  if (!existsSync(htmlSource)) {
    continue;
  }

  mkdirSync(dirname(htmlTarget), { recursive: true });
  copyFileSync(htmlSource, htmlTarget);

  if (existsSync(textSource)) {
    copyFileSync(textSource, textTarget);
  }
}
