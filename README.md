# Habit Ledger

A professional, mobile-friendly habit tracker for everyday routines in India.

## Features

- Daily habit status tracking
- Monthly matrix view
- Local browser storage
- Image export for daily progress
- Editable habits, icons, and order
- Personalization QA cases for future onboarding

## Development

```bash
npm install
npm run dev
```

The local app runs on `http://127.0.0.1:3005`.

## Build

```bash
NEXT_PUBLIC_BASE_PATH=/Habit-Ledger npm run build
```

## Deploy

GitHub Pages serves the static export from the `gh-pages` branch:

https://abheydeep.github.io/Habit-Ledger/

## Personalization Test Cases

Five sample onboarding cases live in `lib/personalizationTestCases.ts`. Each case includes:

- Sample user answers
- Expected personalized habits
- Expected character/avatar brief
- A sample daily log for status tracking
