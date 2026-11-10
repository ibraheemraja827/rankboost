"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, ScanSearch, Gauge, Trophy, AlertTriangle, ArrowRight } from "lucide-react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

const FACTORS = {
  metaTitle: "Meta Title",
  metaDescription: "Meta Description",
  h1: "H1 Tags",
  pageSpeed: "Page Speed",
  schema: "Schema Markup",
  canonical: "Canonical Tags",
  imageAlt: "Image Alt Tags",
  mobile: "Mobile Friendly",
  https: "HTTPS",
  content: "Content Quality",
};

const fmtFull = (d) => new Date(d).toLocaleString("en-GB");
const tone = (s) => (s >= 80 ? "text-green-400" : s >= 60 ? "text-orange-400" : "text-red-400");
const barTone = (s) => (s >= 80 ? "bg-green-400" : s >= 60 ? "bg-orange-400" : "bg-red-400");

function StatCard({ Icon, label, value, sub, valueCls }) {
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center gap-2 text-sm text-[var(--muted)]">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/15 text-[var(--primary-2)]">
          <Icon size={16} />
        </span>
        {label}
      </div>
      <div className={`text-3xl font-semibold ${valueCls || ""}`}>{value}</div>
      {sub && <div className="mt-1 truncate text-xs text-[var(--muted)]" title={sub}>{sub}</div>}
    </div>
  );
}

export default function OverviewPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [reports, setReports] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/app");
        return;
      }
      setUser(session.user);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.replace("/app");
      else setUser(session.user);
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const [r, h] = await Promise.all([
        supabase
          .from("reports")
          .select("id,url,score,grade,updated_at,results:data->results")
          .order("updated_at", { ascending: false })
          .limit(200),
        supabase
          .from("score_history")
          .select("id,url,score,grade,created_at")
          .order("created_at", { ascending: false })
          .limit(1000),
      ]);
      if (r.error) setError(r.error.message);
      else setReports(r.data || []);
      if (h.error) setError((e) => e || h.error.message);
      else setHistory(h.data || []);
      setNow(Date.now());
      setLoading(false);
    })();
  }, [user]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/app");
  }

  const stats = useMemo(() => {
    const sites = reports.length;
    const avg = sites ? Math.round(reports.reduce((a, r) => a + r.score, 0) / sites) : 0;
    const sorted = [...reports].sort((a, b) => b.score - a.score);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const week = history.filter((h) => new Date(h.created_at).getTime() >= weekAgo).length;

    const counts = {};
    reports.forEach((r) => {
      Object.entries(r.results || {}).forEach(([key, v]) => {
        if (!FACTORS[key]) return;
        if (v?.status === "error" || v?.status === "warning") {
          counts[key] = counts[key] || { error: 0, warning: 0 };
          counts[key][v.status] += 1;
        }
      });
    });
    const issues = Object.entries(counts)
      .map(([key, c]) => ({ key, ...c, total: c.error + c.warning }))
      .sort((a, b) => b.error - a.error || b.total - a.total)
      .slice(0, 5);

    return { sites, avg, best, worst, week, issues, sorted };
    }, [reports, history, now]);

  if (!authReady) {
    return <main className="px-6 py-20 text-center text-[var(--muted)]">Loading...</main>;
  }

  const empty = !loading && reports.length === 0;

  return (
    <AppShell email={user?.email} onLogout={logout}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light">
            Dashboard <span className="font-bold italic text-[var(--primary-2)]">Overview</span>
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">A summary of all the websites you have scanned.</p>
        </div>
        <Link href="/app" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-medium">
          Scan a website <ArrowRight size={16} />
        </Link>
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading...</p>
      ) : empty ? (
        <div className="card p-8 text-center">
          <h2 className="mb-2 font-semibold">No scans yet</h2>
          <p className="text-sm text-[var(--muted)]">
            Scan your first website and this page will fill up with your scores, common issues and recent activity.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard Icon={Globe} label="Websites scanned" value={stats.sites} />
            <StatCard Icon={ScanSearch} label="Total scans" value={history.length} sub={`${stats.week} in the last 7 days`} />
            <StatCard Icon={Gauge} label="Average score" value={stats.avg} valueCls={tone(stats.avg)} sub="Across your latest scans" />
            <StatCard
              Icon={Trophy}
              label="Best website"
              value={stats.best ? stats.best.score : "-"}
              valueCls={stats.best ? tone(stats.best.score) : ""}
              sub={stats.best?.url}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Common issues */}
            <div className="card p-6">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-400" />
                <h2 className="font-semibold">Most common issues</h2>
              </div>
              {stats.issues.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">No errors or warnings found in your saved scans.</p>
              ) : (
                <ul className="space-y-4">
                  {stats.issues.map((i) => (
                    <li key={i.key}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium">{FACTORS[i.key]}</span>
                        <span className="text-xs text-[var(--muted)]">
                          {i.error > 0 && <span className="text-red-400">{i.error} error{i.error > 1 ? "s" : ""}</span>}
                          {i.error > 0 && i.warning > 0 && " · "}
                          {i.warning > 0 && <span className="text-orange-400">{i.warning} warning{i.warning > 1 ? "s" : ""}</span>}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-[var(--primary-2)]"
                          style={{ width: `${Math.round((i.total / stats.sites) * 100)}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-[var(--muted)]">
                        On {i.total} of {stats.sites} website{stats.sites > 1 ? "s" : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recent scans */}
            <div className="card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Recent scans</h2>
                <Link href="/history" className="text-xs text-[var(--primary-2)] hover:underline">
                  View history
                </Link>
              </div>
              {history.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">
                  Scan history starts with your next scan.
                </p>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {history.slice(0, 6).map((h) => (
                    <li key={h.id} className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{h.url}</div>
                        <div className="text-xs text-[var(--muted)]">{fmtFull(h.created_at)}</div>
                      </div>
                      <div className={`shrink-0 font-semibold ${tone(h.score)}`}>
                        {h.score}
                        <span className="text-xs font-normal text-[var(--muted)]">/100</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* All websites */}
          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Your websites</h2>
              <span className="text-xs text-[var(--muted)]">Lowest score first</span>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {[...stats.sorted].reverse().map((r) => (
                <div key={r.id} className="flex items-center gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{r.url}</div>
                    <div className="text-xs text-[var(--muted)]">Last scan: {fmtFull(r.updated_at)}</div>
                  </div>
                  <div className="hidden w-40 sm:block">
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div className={`h-full rounded-full ${barTone(r.score)}`} style={{ width: `${r.score}%` }} />
                    </div>
                  </div>
                  <div className="w-20 text-right">
                    <span className={`font-semibold ${tone(r.score)}`}>{r.score}</span>
                    <span className="ml-1 text-xs text-[var(--primary-2)]">{r.grade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-[var(--muted)]">
            Scores are based on on-page and technical SEO checks of each homepage. They do not measure backlinks
            or actual Google rankings.
          </p>
        </div>
      )}
    </AppShell>
  );
}