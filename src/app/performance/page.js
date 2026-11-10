"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PerfChart from "@/components/PerfChart";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { parseGscFile, totals, demoData, demoCsv, fmt } from "@/lib/gsc";

export default function PerformancePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const demo = useMemo(() => demoData(), []);
  const [source, setSource] = useState("demo");
  const [data, setData] = useState(demo);
  const [range, setRange] = useState(28);
  const [show, setShow] = useState({ clicks: true, impressions: true });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/app");
        return;
      }
      setUser(session.user);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/app");
      else setUser(session.user);
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/app");
  }

  async function onFiles(e) {
    const list = [...e.target.files];
    if (!list.length) return;
    setError("");

    const next = { daily: [], queries: [], pages: [] };
    const used = [];
    const skipped = [];

    for (const f of list) {
      try {
        const parsed = parseGscFile(await f.text());
        if (!parsed) skipped.push(f.name);
        else {
          next[parsed.type] = parsed.rows;
          used.push(f.name);
        }
      } catch {
        skipped.push(f.name);
      }
    }

    e.target.value = "";
    if (!used.length) {
      setError(
        "These files are not Search Console exports. Upload Dates.csv (or Chart.csv), Queries.csv and Pages.csv. The export must be in English."
      );
      return;
    }
    if (skipped.length) setError(`Skipped: ${skipped.join(", ")}`);
    setData(next);
    setFiles(used);
    setSource("csv");
  }

  function useDemo() {
    setData(demo);
    setSource("demo");
    setFiles([]);
    setError("");
  }

  function downloadSample() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([demoCsv()], { type: "text/csv" }));
    a.download = "sample-dates.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  const daily = range === 0 ? data.daily : data.daily.slice(-range);
  const t = totals(daily);
  const has = daily.length > 0;
  const top = (rows) => [...rows].sort((a, b) => b.clicks - a.clicks).slice(0, 10);

  if (!authReady) {
    return <main className="px-6 py-20 text-center text-[var(--muted)]">Loading...</main>;
  }

  return (
    <AppShell email={user?.email} onLogout={logout}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light">
            Search <span className="font-bold italic text-[var(--primary-2)]">Performance</span>
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Clicks, impressions, CTR and average position.</p>
        </div>
        {source === "demo" ? (
          <span className="rounded-full bg-orange-500/10 px-4 py-2 text-xs font-medium text-orange-300">
            DEMO DATA: sample numbers, not a real website
          </span>
        ) : (
          <span className="rounded-full bg-green-500/10 px-4 py-2 text-xs font-medium text-green-400">
            Your uploaded data
          </span>
        )}
      </div>

      {/* Upload box */}
      <div className="card mb-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm">
            <div className="font-medium">Use your own Search Console data</div>
            <div className="text-[var(--muted)]">
              Search Console, Performance, Export, Download CSV. Unzip it, then upload Dates.csv (or Chart.csv),
              Queries.csv and Pages.csv together.
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="btn-primary cursor-pointer px-5 py-3 text-sm font-medium">
              Upload CSV files
              <input type="file" accept=".csv,text/csv" multiple onChange={onFiles} className="hidden" />
            </label>
            {source === "csv" && (
              <button onClick={useDemo} className="rounded-full border border-[var(--border)] px-5 py-3 text-sm hover:bg-white/5">
                Back to demo
              </button>
            )}
            <button onClick={downloadSample} className="rounded-full border border-[var(--border)] px-5 py-3 text-sm hover:bg-white/5">
              Sample CSV
            </button>
          </div>
        </div>
        {files.length > 0 && <p className="mt-3 text-xs text-green-400">Loaded: {files.join(", ")}</p>}
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>

      {/* Range */}
      <div className="mb-4 flex gap-2">
        {[
          { l: "7 days", v: 7 },
          { l: "28 days", v: 28 },
          { l: "All", v: 0 },
        ].map((o) => (
          <button
            key={o.v}
            onClick={() => setRange(o.v)}
            className={`rounded-full px-4 py-2 text-sm ${
              range === o.v ? "bg-[var(--primary)] text-white" : "border border-[var(--border)] text-[var(--muted)] hover:bg-white/5"
            }`}
          >
            {o.l}
          </button>
        ))}
      </div>

      {/* Metric cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric
          label="Total clicks"
          value={has ? fmt(t.clicks) : "-"}
          bg="#3b6fe0"
          active={show.clicks}
          onToggle={() => setShow((s) => ({ ...s, clicks: !s.clicks }))}
        />
        <Metric
          label="Total impressions"
          value={has ? fmt(t.impressions) : "-"}
          bg="#6a4bd8"
          active={show.impressions}
          onToggle={() => setShow((s) => ({ ...s, impressions: !s.impressions }))}
        />
        <Metric label="Average CTR" value={has ? t.ctr.toFixed(1) + "%" : "-"} />
        <Metric label="Average position" value={has ? t.position.toFixed(1) : "-"} />
      </div>

      {/* Chart */}
      <div className="card mb-6 p-6">
        {has ? (
          <>
            <div className="mb-2 flex justify-between text-xs">
              <span className="text-[#4f8ef7]">Clicks</span>
              <span className="text-[#8b8df5]">Impressions</span>
            </div>
            <PerfChart data={daily} show={show} />
          </>
        ) : (
          <p className="py-10 text-center text-sm text-[var(--muted)]">
            No date-wise file found. Upload Dates.csv (or Chart.csv) to see the chart.
          </p>
        )}
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Table title="Top Queries" first="Query" rows={top(data.queries)} />
        <Table title="Top Pages" first="Page" rows={top(data.pages)} />
      </div>

      <p className="mt-6 text-xs text-[var(--muted)]">
        The date range filter applies to the cards and the chart. Query and page tables show the full exported period.
      </p>
    </AppShell>
  );
}

function Metric({ label, value, bg, active, onToggle }) {
  const colored = bg && active;
  return (
    <div
      className={`rounded-2xl p-5 ${colored ? "" : "card"}`}
      style={colored ? { background: bg } : undefined}
    >
      <label className="mb-2 flex items-center gap-2 text-sm">
        {onToggle && <input type="checkbox" checked={active} onChange={onToggle} className="h-4 w-4" />}
        <span className={colored ? "text-white" : "text-[var(--muted)]"}>{label}</span>
      </label>
      <div className="text-4xl font-semibold">{value}</div>
    </div>
  );
}

function Table({ title, first, rows }) {
  return (
    <div className="card p-6">
      <h2 className="mb-4 font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No file uploaded for this table.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[var(--muted)]">
              <tr>
                <th className="py-2 pr-3">{first}</th>
                <th className="py-2 pr-3 text-right">Clicks</th>
                <th className="py-2 pr-3 text-right">Impr.</th>
                <th className="py-2 pr-3 text-right">CTR</th>
                <th className="py-2 text-right">Pos.</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-[var(--border)]">
                  <td className="max-w-[200px] truncate py-2 pr-3">{r.label}</td>
                  <td className="py-2 pr-3 text-right">{fmt(r.clicks)}</td>
                  <td className="py-2 pr-3 text-right">{fmt(r.impressions)}</td>
                  <td className="py-2 pr-3 text-right">{r.ctr.toFixed(1)}%</td>
                  <td className="py-2 text-right">{r.position ? r.position.toFixed(1) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}