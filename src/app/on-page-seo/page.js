
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

const labels = {
  metaTitle: "Meta Title",
  metaDescription: "Meta Description",
  h1: "H1 Headings",
  schema: "Schema Markup",
  canonical: "Canonical URL",
  imageAlt: "Image ALT Tags",
  mobile: "Mobile Friendly",
  https: "HTTPS Security",
  content: "Content Quality",
};

export default function OnPageSEOPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [audit, setAudit] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/app");
        return;
      }

      setUser(session.user);
      setAuthReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) router.replace("/app");
        else setUser(session.user);
      }
    );

    return () => sub.subscription.unsubscribe();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/app");
  }

  async function runAudit(e) {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please enter a website URL.");
      return;
    }

    setLoading(true);
    setError("");
    setAudit(null);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "SEO audit failed.");
      }

      setAudit(data);
    } catch (err) {
      setError(err.message || "Could not scan this website.");
    } finally {
      setLoading(false);
    }
  }

  if (!authReady) {
    return (
      <main className="px-6 py-20 text-center text-[var(--muted)]">
        Loading...
      </main>
    );
  }

  const checks = audit
    ? Object.entries(audit.results || {}).filter(
        ([key, value]) =>
          key !== "pageSpeed" &&
          value &&
          typeof value === "object" &&
          value.status
      )
    : [];

  const good = checks.filter(([, item]) => item.status === "good").length;
  const warnings = checks.filter(([, item]) => item.status === "warning").length;
  const errors = checks.filter(([, item]) => item.status === "error").length;

  return (
    <AppShell email={user?.email} onLogout={logout}>
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary-2)]">
          RankBoost SEO Tools
        </p>

        <h1 className="text-3xl font-light">
          On-Page <span className="font-bold italic text-[var(--primary-2)]">SEO</span>
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Analyze individual website pages and discover SEO issues that need attention.
        </p>
      </div>

      <form onSubmit={runAudit} className="card mb-6 p-6">
        <label className="mb-3 block text-sm font-medium">
          Website URL
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--primary-2)]"
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary rounded-xl px-7 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Run SEO Audit"}
          </button>
        </div>

        <p className="mt-3 text-xs text-[var(--muted)]">
          Enter a public website URL to analyze its on-page SEO factors.
        </p>

        {error && (
          <p className="mt-4 text-sm text-red-400">{error}</p>
        )}
      </form>

      {loading && (
        <div className="card py-12 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary-2)]" />
          <p className="text-sm text-[var(--muted)]">
            Scanning website and analyzing SEO factors...
          </p>
        </div>
      )}

      {audit && !loading && (
        <>
          <div className="card mb-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-sm text-[var(--muted)]">Overall SEO Score</p>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-6xl font-bold text-[var(--primary-2)]">
                    {audit.score}
                  </span>
                  <span className="text-lg text-[var(--muted)]">/100</span>
                </div>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  Grade: {audit.grade}
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-black/30 px-6 py-5">
                <p className="mb-2 text-xs text-[var(--muted)]">AUDIT STATUS</p>
                <p className="text-2xl font-semibold text-[var(--primary-2)]">
                  {audit.grade}
                </p>
              </div>
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[var(--primary-2)] transition-all"
                style={{
                  width: `${Math.max(0, Math.min(100, audit.score))}%`,
                }}
              />
            </div>

            <p className="mt-3 break-all text-xs text-[var(--muted)]">
              Scanned URL: {audit.url}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard label="Passed Checks" value={good} color="text-green-400" />
            <SummaryCard label="Warnings" value={warnings} color="text-orange-400" />
            <SummaryCard label="Errors" value={errors} color="text-red-400" />
          </div>

          <div className="card mb-6 p-6">
            <h2 className="mb-5 text-lg font-semibold">SEO Audit Results</h2>

            <div className="space-y-3">
              {checks.map(([key, item]) => (
                <div
                  key={key}
                  className="rounded-xl border border-[var(--border)] bg-black/20 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-medium">
                      {labels[key] || key}
                    </h3>

                    <StatusBadge status={item.status} />
                  </div>

                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {item.message}
                  </p>

                  {item.value && (
                    <p className="mt-2 break-words text-xs text-[var(--primary-2)]">
                      {item.value}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {audit.context && (
            <div className="card p-6">
              <h2 className="mb-5 text-lg font-semibold">
                Page Content Overview
              </h2>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="mb-1 text-[var(--muted)]">Page Title</p>
                  <p>{audit.context.title || "Not found"}</p>
                </div>

                <div>
                  <p className="mb-1 text-[var(--muted)]">Meta Description</p>
                  <p>{audit.context.description || "Not found"}</p>
                </div>

                <div>
                  <p className="mb-1 text-[var(--muted)]">H1 Heading</p>
                  <p>{audit.context.h1 || "Not found"}</p>
                </div>

                <div>
                  <p className="mb-2 text-[var(--muted)]">H2 Headings</p>
                  {audit.context.headings?.length ? (
                    <ul className="list-inside list-disc space-y-2">
                      {audit.context.headings.map((heading, index) => (
                        <li key={index}>{heading}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No H2 headings found.</p>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-[var(--muted)]">
                    Images Missing ALT Text
                  </p>

                  {audit.context.images?.length ? (
                    <ul className="space-y-2">
                      {audit.context.images.map((image, index) => (
                        <li
                          key={index}
                          className="break-all rounded-lg bg-black/30 p-3 text-xs"
                        >
                          {image.src}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-green-400">
                      No images missing ALT text were found.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    good: "bg-green-500/10 text-green-400",
    warning: "bg-orange-500/10 text-orange-300",
    error: "bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        styles[status] || "bg-white/10 text-white"
      }`}
    >
      {status}
    </span>
  );
}
