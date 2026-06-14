const siteUrl = (process.env.SITE_URL || "https://www.mywinlist.com").replace(/\/$/, "");

function visibleText(source) {
  return source
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTag(source, pattern) {
  return source.match(pattern)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || "";
}

async function fetchText(path, userAgent = "The Win List live SEO check") {
  const response = await fetch(`${siteUrl}${path}`, {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "cache-control": "no-cache",
      pragma: "no-cache",
      "user-agent": userAgent
    }
  });
  const text = await response.text();
  return { response, text };
}

async function checkPage({ path, title, canonical, h1, minWords, mustInclude = [], mustNotInclude = [] }) {
  const variants = path.endsWith("/") ? [path] : [path, `${path}/`];
  const failures = [];

  for (const variant of variants) {
    const { response, text } = await fetchText(variant);
    const actualTitle = getTag(text, /<title>([^<]*)<\/title>/i);
    const actualCanonical = getTag(text, /rel="canonical" href="([^"]*)"/i);
    const actualH1 = getTag(text, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const words = visibleText(text).split(/\s+/).filter(Boolean).length;

    if (response.status !== 200) {
      failures.push(`${variant}: expected HTTP 200, got ${response.status}`);
    }
    if (actualTitle !== title) {
      failures.push(`${variant}: expected title "${title}", got "${actualTitle}"`);
    }
    if (actualCanonical !== canonical) {
      failures.push(`${variant}: expected canonical "${canonical}", got "${actualCanonical}"`);
    }
    if (actualH1 !== h1) {
      failures.push(`${variant}: expected h1 "${h1}", got "${actualH1}"`);
    }
    if (words < minWords) {
      failures.push(`${variant}: expected at least ${minWords} visible words, got ${words}`);
    }
    for (const needle of mustInclude) {
      if (!text.includes(needle)) {
        failures.push(`${variant}: missing "${needle}"`);
      }
    }
    for (const needle of mustNotInclude) {
      if (text.includes(needle)) {
        failures.push(`${variant}: unexpectedly includes "${needle}"`);
      }
    }

    console.log(
      JSON.stringify({
        path: variant,
        status: response.status,
        title: actualTitle,
        canonical: actualCanonical,
        h1: actualH1,
        words
      })
    );
  }

  return failures;
}

const checks = [
  {
    path: "/",
    title: "Free Habit Tracker App, No Login | The Win List",
    canonical: siteUrl,
    h1: "Free Habit Tracker App - The Win List",
    minWords: 500,
    mustInclude: ["A simple habit tracker app that starts with today", "Habit tracker questions"]
  },
  {
    path: "/habit-tracker",
    title: "Free Habit Tracker App | The Win List",
    canonical: `${siteUrl}/habit-tracker`,
    h1: "Free Habit Tracker App for Daily Routines",
    minWords: 700,
    mustInclude: ["Questions people ask before choosing a habit tracker", '"@type":"FAQPage"'],
    mustNotInclude: ["Loading your wins"]
  },
  {
    path: "/offline-habit-tracker",
    title: "Offline Habit Tracker | The Win List",
    canonical: `${siteUrl}/offline-habit-tracker`,
    h1: "Offline Habit Tracker You Can Add to Your Phone",
    minWords: 500,
    mustInclude: ["What stays available offline", "Works when the connection is weak"],
    mustNotInclude: ["Loading your wins"]
  }
];

const failures = [];
for (const check of checks) {
  failures.push(...(await checkPage(check)));
}

const { response: sitemapResponse, text: sitemap } = await fetchText("/sitemap.xml");
if (sitemapResponse.status !== 200) {
  failures.push(`/sitemap.xml: expected HTTP 200, got ${sitemapResponse.status}`);
}
for (const loc of ["/habit-tracker", "/offline-habit-tracker", "/habit-tracker-no-sign-up"]) {
  if (!sitemap.includes(`<loc>${siteUrl}${loc}</loc>`)) {
    failures.push(`/sitemap.xml: missing ${siteUrl}${loc}`);
  }
}

if (failures.length > 0) {
  console.error("Live SEO check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Live SEO check passed for ${siteUrl}.`);
