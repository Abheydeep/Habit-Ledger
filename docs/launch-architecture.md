# The Win List Launch Architecture

The Win List is local-first. Browser storage remains the instant/offline source, and Supabase is an optional cloud layer for users who want backup and multi-device restore.

## Why Supabase First

Supabase gives the v1 product PostgreSQL, Auth, Row Level Security, Storage, and generated APIs without running a backend server. That matches this static Next app well.

Spring Boot is not rejected. It is deferred until the product needs custom recommendation services, billing, scheduled jobs, ad-serving rules, or enterprise APIs. The Supabase schema is plain PostgreSQL so a Spring Boot service can sit in front of it later.

## Consent Data Boundary

The product should not store everything for ads. It stores:

- Product utility data: wins, daily statuses, daily notes, profile basics, avatar selection.
- Consent records: sync, analytics, recommendations, ads personalization.
- Broad intent segments only when ads personalization is granted.

Daily notes are user utility data and must not be used for ad segmentation.

## Storage For First 1000 Users

Assumptions:

- 1000 users.
- 10 active wins per user.
- 365 days of usage.
- 10 daily log rows per user per day.
- Short notes on 20-30% of days.
- One avatar profile per user.

Expected rows:

```txt
profiles:          1,000
wins:              10,000
daily_win_logs:    3,650,000
daily_notes:       75,000 - 110,000
intent_segments:   10,000 - 40,000
usage_events:      1M - 5M
avatar_profiles:   1,000
```

Comfortable provision:

```txt
Postgres:          10 GB
Object storage:    5 GB
Conservative:      20 GB Postgres + 10 GB object storage
```

## Setup

1. Create a Supabase project.
2. Run `supabase/migrations/20260503_win_list_launch.sql` in the SQL editor or through Supabase CLI.
3. Copy `.env.example` to `.env.local`.
4. Fill `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Run the app and use the Sync drawer.

The anon key is safe for the browser only because Row Level Security policies restrict every user-owned table.

## Admin Console

The public app keeps customer sync simple: one terms checkbox and account sign-in. The backend metrics live at `/admin`.

Admin access is gated by `app_admins` and the `get_admin_metrics()` RPC. The console shows aggregate metrics such as registered users, completed onboarding, active wins, daily logs, consent counts, life-mode breakdowns, and storage planning. It intentionally does not show user notes.
