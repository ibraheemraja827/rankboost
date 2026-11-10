"use client";
import { useEffect, useState } from "react";
import {
  Tag, FileText, Heading1, Gauge, Code2,
  Link2, Image as ImageIcon, Smartphone, Lock, PenLine,
} from "lucide-react";
import ScoreGauge from "@/components/ScoreGauge";
import FactorCard from "@/components/FactorCard";
import CrawlPanel from "@/components/CrawlPanel";
import ExportPanel from "@/components/ExportPanel";
import AuthPanel from "@/components/AuthPanel";
import AIFixes from "@/components/AIFixes";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import ActionPlan from "@/components/ActionPlan";
import AuthBackground from "@/components/AuthBackground";

const FACTORS = [
  { key: "metaTitle", title: "Meta Title", Icon: Tag },
  { key: "metaDescription", title: "Meta Description", Icon: FileText },
  { key: "h1", title: "H1 Tags", Icon: Heading1 },
  { key: "pageSpeed", title: "Page Speed", Icon: Gauge },
  { key: "schema", title: "Schema Markup", Icon: Code2 },
  { key: "canonical", title: "Canonical Tags", Icon: Link2 },
  { key: "imageAlt", title: "Image Alt Tags", Icon: ImageIcon },
  { key: "mobile", title: "Mobile Friendly", Icon: Smartphone },
  { key: "https", title: "HTTPS", Icon: Lock },
  { key: "content", title: "Content Quality", Icon: PenLine },
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [fixes, setFixes] = useState(null);
  const [fixing, setFixing] = useState(false);
  const [crawl, setCrawl] = useState(null);
  const [reports, setReports] = useState([]);
  const [viewId, setViewId] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) loadReports();
    else setReports([]);
  }, [user]);

  async function loadReports() {
    const { data: rows } = await supabase
      .from("reports")
      .select("id,url,score,grade,updated_at")
      .order("updated_at", { ascending: false })
      .limit(30);
    setReports(rows || []);
  }

  async function logout() {
    await supabase.auth.signOut();
    setData(null);
    setFixes(null);
    setCrawl(null);
    setUrl("");
  }

  async function runAudit(e) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong");

      // pehle ka save kiya hua AI jawab aur crawl dobara use karein
      let saved = null;
      if (user) {
        const { data: existing } = await supabase
          .from("reports")
          .select("fixes,crawl")
          .eq("url", json.url)
          .maybeSingle();
        saved = existing;
        await supabase.from("reports").upsert(
          {
            user_id: user.id,
            url: json.url,
            score: json.score,
            grade: json.grade,
            data: json,
            updated_at: new Date().toISOString(),
          },
                   { onConflict: "user_id,url" }
        );
        await supabase.from("score_history").insert({
          user_id: user.id,
          url: json.url,
          score: json.score,
          grade: json.grade,
        });
        loadReports();
      }

      setData(json);
      setFixes(saved?.fixes || null);
      setCrawl(saved?.crawl || null);
      setViewId((v) => v + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function runFix() {
    setFixing(true);
    setError("");
    try {
      const res = await fetch("/api/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: data.context }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setFixes(json.fixes);
      if (user) {
        await supabase
          .from("reports")
          .update({ fixes: json.fixes, updated_at: new Date().toISOString() })
          .eq("url", data.url);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setFixing(false);
    }
  }

  async function onCrawlDone(result) {
    setCrawl(result);
    if (user) {
      await supabase
        .from("reports")
        .update({ crawl: result, updated_at: new Date().toISOString() })
        .eq("url", data.url);
    }
  }

  async function openReport(id) {
    const { data: row, error: err } = await supabase.from("reports").select("*").eq("id", id).single();
    if (err || !row) {
      setError("Could not open this report.");
      return;
    }
    setError("");
    setData(row.data);
    setFixes(row.fixes || null);
    setCrawl(row.crawl || null);
    setViewId((v) => v + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteReport(id) {
    await supabase.from("reports").delete().eq("id", id);
    loadReports();
  }

  const counts = { good: 0, warning: 0, error: 0 };
  if (data) Object.values(data.results).forEach((r) => counts[r.status]++);

  if (!authReady) {
    return <main className="px-6 py-20 text-center text-[var(--muted)]">Loading...</main>;
  }

   if (!user) {
    return (
      <>
        <AuthBackground />
        <main className="relative z-10 mx-auto max-w-6xl px-6 py-10">
          <header className="mb-12 flex items-center justify-between">
            <div className="text-2xl font-bold tracking-tight">
              Rank<span className="text-[var(--primary-2)]">Boost</span> AI
            </div>
            <div className="text-sm text-[var(--muted)]">by TAMx Technologies</div>
          </header>
          <AuthPanel />
        </main>
      </>
    );
  }

  return (
    <AppShell email={user.email} onLogout={logout}>
      <section className="mx-auto mb-12 max-w-3xl text-center">
        <h1 className="mb-4 text-4xl font-light md:text-5xl">
          Rank higher with{" "}
          <span className="font-bold italic text-[var(--primary-2)]">AI-powered</span> SEO
        </h1>
        <p className="mb-8 text-[var(--muted)]">
          Enter your website link. We find the SEO problems and fix them with AI.
        </p>
        <form onSubmit={runAudit} className="card flex gap-2 p-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.com"
            className="flex-1 bg-transparent px-4 outline-none placeholder:text-[var(--muted)]"
          />
          <button disabled={loading} className="btn-primary px-6 py-3 font-medium disabled:opacity-60">
            {loading ? "Scanning..." : "Analyze Website"}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </section>

      {data && (
        <section className="space-y-6">
          <div className="grid gap-6 md:grid-cols-[320px_1fr]">
            <div className="card p-6">
              <h2 className="mb-4 font-semibold">SEO Audit Score</h2>
              <ScoreGauge score={data.score} grade={data.grade} />
            </div>
            <div className="card p-6">
              <h2 className="mb-1 font-semibold">Audit Overview</h2>
              <p className="mb-6 truncate text-sm text-[var(--muted)]">{data.url}</p>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Stat n={counts.good} label="Good" color="text-green-400" />
                <Stat n={counts.warning} label="Warnings" color="text-orange-400" />
                <Stat n={counts.error} label="Errors" color="text-red-400" />
                <Stat n={FACTORS.length} label="Factors" color="text-[var(--primary-2)]" />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {FACTORS.map((f, i) => {
              const r = data.results[f.key];
              return (
                <FactorCard
                  key={f.key}
                  index={i + 1}
                  title={f.title}
                  Icon={f.Icon}
                  status={r ? r.status : "pending"}
                  message={r ? r.message : "Speed data unavailable for this site."}
                />
              );
            })}
          </div>
<ActionPlan results={data.results} />
          <div className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold">AI SEO Fixes</h2>
                <p className="text-sm text-[var(--muted)]">
                  {fixes
                    ? "Saved AI fixes loaded. You can regenerate them any time."
                    : "Get a new title, meta description, keywords, alt text and schema."}
                </p>
              </div>
              <button
                onClick={runFix}
                disabled={fixing}
                className="btn-primary px-6 py-3 font-medium disabled:opacity-60"
              >
                {fixing ? "Generating..." : fixes ? "Regenerate" : "Fix with AI"}
              </button>
            </div>

            {fixes && <AIFixes fixes={fixes} />}
          </div>

          <CrawlPanel key={viewId} url={data.url} onDone={onCrawlDone} initial={crawl} />
          <ExportPanel data={data} fixes={fixes} crawl={crawl} />
        </section>
      )}

      <History reports={reports} onOpen={openReport} onDelete={deleteReport} />
    </AppShell>
  );
}

function Stat({ n, label, color }) {
  return (
    <div>
      <div className={`text-3xl font-bold ${color}`}>{n}</div>
      <div className="text-sm text-[var(--muted)]">{label}</div>
    </div>
  );
}

function History({ reports, onOpen, onDelete }) {
  if (!reports.length) return null;
  return (
    <section id="reports" className="card mt-12 scroll-mt-6 p-6">
      <h2 className="mb-4 font-semibold">My Reports</h2>
      <div className="divide-y divide-[var(--border)]">
        {reports.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-4 py-3">
            <button onClick={() => onOpen(r.id)} className="min-w-0 flex-1 text-left">
              <div className="truncate font-medium hover:text-[var(--primary-2)]">{r.url}</div>
              <div className="text-xs text-[var(--muted)]">
                {new Date(r.updated_at).toLocaleString("en-GB")}
              </div>
            </button>
            <div className="text-right">
              <div className="font-bold">
                {r.score}
                <span className="text-xs font-normal text-[var(--muted)]">/100</span>
              </div>
              <div className="text-xs text-[var(--primary-2)]">Grade {r.grade}</div>
            </div>
            <button onClick={() => onDelete(r.id)} className="text-xs text-[var(--muted)] hover:text-red-400">
              Delete
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}