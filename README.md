# The Win List

A professional, mobile-friendly app for today's must-do wins in India.

## Features

- Daily win status tracking
- 5 primary wins with optional routines that do not punish the day score
- Monthly matrix view
- Local browser storage
- Installable PWA shell and lightweight local reminders
- Optional Supabase cloud sync with consent controls
- Admin console for aggregate launch metrics
- Image export for daily progress
- Editable wins, icons, and order
- Personalization QA cases for future onboarding

## Development

```bash
npm install
npm run dev
```

The local app runs on `http://127.0.0.1:3005`.

## Build

```bash
npm run build
```

For the legacy GitHub Pages backup URL:

```bash
NEXT_PUBLIC_BASE_PATH=/Habit-Ledger npm run build
```

## Optional Supabase Sync

Cloud sync is optional. The app works locally without Supabase.

```bash
cp .env.example .env.local
```

Fill:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Then run the migration in `supabase/migrations/20260503_win_list_launch.sql`.
Architecture notes and 1000-user storage estimates live in `docs/launch-architecture.md`.

## Admin Console

The admin console is available at `/admin` after Supabase is configured. It only shows aggregate metrics.

After your admin user signs up once, add that user to `app_admins` from the Supabase SQL editor using the authenticated user's UUID:

```sql
insert into public.app_admins (user_id, email)
values ('USER_UUID_HERE', 'admin@example.com');
```

## Deploy

Production is configured as a Render Static Site through `render.yaml`.

- Canonical URL: https://www.mywinlist.com
- Build command: `npm install && npm run build`
- Publish directory: `out`

GitHub Pages can remain as a backup static export from the `gh-pages` branch:

https://abheydeep.github.io/Habit-Ledger/

## Personalization Test Cases

Five sample onboarding cases live in `lib/personalizationTestCases.ts`. Each case includes:

- Sample user answers
- Expected personalized wins
- Expected character/avatar brief
- A sample daily log for status tracking
