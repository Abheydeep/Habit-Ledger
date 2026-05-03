"use client";

import { BarChart3, Cloud, Download, LockKeyhole, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAdminMetrics, type AdminMetrics } from "../lib/adminMetrics";
import { sendMagicLink } from "../lib/cloudSync";
import { getSupabaseClient, isSupabaseConfigured, type SupabaseSession } from "../lib/supabaseClient";

export function AdminConsole() {
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [email, setEmail] = useState("");
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Sign in with an admin account to view launch metrics.");

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setMessage("Supabase is not configured yet. Add environment keys before using the admin console.");
      return;
    }

    client.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      if (data.session?.user.email) {
        setEmail(data.session.user.email);
      }
    });

    const {
      data: { subscription }
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user.email) {
        setEmail(nextSession.user.email);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadMetrics = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client) {
      setMessage("Supabase is not configured yet.");
      return;
    }

    setBusy(true);
    setMessage("Loading admin metrics...");
    try {
      const nextMetrics = await fetchAdminMetrics(client);
      setMetrics(nextMetrics);
      setMessage("Admin metrics loaded.");
    } catch (error) {
      setMetrics(null);
      setMessage(error instanceof Error ? error.message : "Could not load admin metrics.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      void loadMetrics();
    }
  }, [loadMetrics, session]);

  const handleMagicLink = useCallback(async () => {
    const client = getSupabaseClient();
    const trimmedEmail = email.trim();

    if (!client) {
      setMessage("Supabase is not configured yet.");
      return;
    }

    if (!trimmedEmail) {
      setMessage("Enter the admin email first.");
      return;
    }

    setBusy(true);
    setMessage("Sending admin magic link...");
    try {
      await sendMagicLink(client, trimmedEmail);
      setMessage("Magic link sent. Open it from this browser, then return to /admin.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send the magic link.");
    } finally {
      setBusy(false);
    }
  }, [email]);

  const handleSignOut = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client) {
      return;
    }

    await client.auth.signOut();
    setSession(null);
    setMetrics(null);
    setMessage("Signed out of admin console.");
  }, []);

  const metricCards = useMemo(() => {
    if (!metrics) {
      return [];
    }

    return [
      ["Registered users", metrics.registered_users, Users],
      ["Profiles completed", metrics.profiles, ShieldCheck],
      ["Active wins", metrics.active_wins, BarChart3],
      ["Daily logs", metrics.daily_win_logs, BarChart3],
      ["Notes saved", metrics.daily_notes, Download],
      ["Intent segments", metrics.intent_segments, Cloud],
      ["7-day active users", metrics.daily_active_7d, Users],
      ["7-day sync uploads", metrics.sync_uploads_7d, RefreshCw]
    ] as const;
  }, [metrics]);

  return (
    <main className="admin-shell">
      <section className="admin-hero">
        <div className="admin-logo" aria-hidden="true">
          <LockKeyhole size={28} />
        </div>
        <div>
          <span className="section-kicker">The Win List admin</span>
          <h1>Launch console</h1>
          <p>Aggregate growth, sync, consent, and storage readiness. Personal notes stay out of this console.</p>
        </div>
      </section>

      <section className="admin-card">
        <div className="admin-card-header">
          <div>
            <span className="section-kicker">Access</span>
            <h2>Admin sign in</h2>
          </div>
          {session ? (
            <button className="tiny-text-button" type="button" onClick={handleSignOut}>
              Sign out
            </button>
          ) : null}
        </div>

        {!isSupabaseConfigured() ? (
          <p className="admin-note">Supabase is not connected yet. Add the public URL and anon key to enable admin login.</p>
        ) : null}

        <div className="admin-login-row">
          <input
            type="email"
            value={email}
            disabled={busy || Boolean(session)}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
          />
          {!session ? (
            <button className="icon-text-button hot" type="button" onClick={handleMagicLink} disabled={busy || !isSupabaseConfigured()}>
              <LockKeyhole size={18} aria-hidden="true" />
              Send magic link
            </button>
          ) : (
            <button className="icon-text-button hot" type="button" onClick={loadMetrics} disabled={busy}>
              <RefreshCw size={18} aria-hidden="true" />
              Refresh metrics
            </button>
          )}
        </div>

        <p className="sync-message" aria-live="polite">{message}</p>
      </section>

      {metrics ? (
        <>
          <section className="admin-metrics-grid" aria-label="Admin metrics">
            {metricCards.map(([label, value, Icon]) => (
              <article className="admin-metric-card" key={label}>
                <Icon size={20} aria-hidden="true" />
                <span>{label}</span>
                <strong>{formatMetric(value)}</strong>
              </article>
            ))}
          </section>

          <section className="admin-two-col">
            <AdminBreakdown title="Life modes" data={metrics.life_modes} />
            <AdminBreakdown title="Accepted terms by type" data={metrics.consents} />
          </section>

          <section className="admin-card">
            <span className="section-kicker">1000-user capacity</span>
            <h2>Storage plan</h2>
            <div className="admin-storage-grid">
              <span>Comfortable DB <strong>{metrics.storage_plan.comfortable_db}</strong></span>
              <span>Comfortable assets <strong>{metrics.storage_plan.comfortable_assets}</strong></span>
              <span>Conservative DB <strong>{metrics.storage_plan.conservative_db}</strong></span>
              <span>Conservative assets <strong>{metrics.storage_plan.conservative_assets}</strong></span>
            </div>
            <p className="admin-note">Generated {formatDate(metrics.generated_at)}. This dashboard uses aggregate rows only.</p>
          </section>
        </>
      ) : (
        <section className="admin-empty">
          <LockKeyhole size={26} aria-hidden="true" />
          <h2>Metrics are locked</h2>
          <p>Add your Supabase user to <code>app_admins</code>, then sign in here to see registered users and launch data.</p>
        </section>
      )}
    </main>
  );
}

function AdminBreakdown({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data);

  return (
    <section className="admin-card">
      <span className="section-kicker">{title}</span>
      {entries.length > 0 ? (
        <div className="admin-breakdown-list">
          {entries.map(([key, value]) => (
            <span key={key}>
              {humanize(key)}
              <strong>{formatMetric(value)}</strong>
            </span>
          ))}
        </div>
      ) : (
        <p className="admin-note">No data yet.</p>
      )}
    </section>
  );
}

function formatMetric(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function humanize(value: string) {
  return value.replace(/[_-]+/g, " ");
}
