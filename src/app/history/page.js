"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
const fmtFull = (d) => new Date(d).toLocaleString("en-GB");

function LineChart({ points }) {
  const W = 800;
  const H = 280;
  const L = 44;
  const R = 24;
  const T = 20;
  const B = 34;
  const n = points.length;
  const x = (i) => (n === 1 ? (L + W - R) / 2 : L + (i / (n - 1)) * (W - L - R));
  const y = (s) => T + (1 - s / 100) * (H - T - B);

  const line = points.map((p, i) => `${x(i)},${y(p.score)}`).join(" ");
  const area = `${x(0)},${y(0)} ${line} ${x(n - 1)},${y(0)}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Score history chart">
      <defs>
        <linearGradient id="histFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a2a3e9" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a2a3e9" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="rgba(246,246,253,0.08)" />
          <text x={L - 10} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#64748b">
            {v}
          </text>
        </g>
      ))}

      {n > 1 && <polygon points={area} fill="url(#histFill)" />}
      {n > 1 && (
        <polyline
          points={line}
          fill="none"
          stroke="#a2a3e9"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}

      {points.map((p, i) => (
        <g key={p.id}>
          <circle cx={x(i)} cy={y(p.score)} r="5" fill="#020202" stroke="#a2a3e9" strokeWidth="2.5">
            <title>{`${p.score}/100 (${p.grade || "-"}) · ${fmtFull(p.created_at)}`}</title>
          </circle>
        </g>
      ))}

      {n > 0 && (
        <>
          <text x={x(0)} y={H - 10} textAnchor={n === 1 ? "middle" : "start"} fontSize="11" fill="#64748b">
            {fmtDate(points[0].created_at)}
          </text>
          {n > 1 && (
            <text x={x(n - 1)} y={H - 10} textAnchor="end" fontSize="11" fill="#64748b">
              {fmtDate(points[n - 1].created_at)}
            </text>
          )}
        </>
      )}
    </svg>
  );
}

function Stat({ label, value, sub, tone }) {
  return (
    <div className="card p-5">
      <div className="mb-1 text-sm text-[var(--muted)]">{label}</div>
      <div className={`text-3xl font-semibold ${tone || ""}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-[var(--muted)]">{sub}</div>}
    </div>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
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
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.replace("/app");
      else setUser(session.user);
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  async function load() {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("score_history")
      .select("id,url,score,grade,created_at")
      .order("created_at", { ascending: true })
      .limit(1000);
    if (err) setError(err.message);
    else setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    if (user) load();
  }, [user]);

  // websites, jis ka sab se naya scan pehle
  const urls = useMemo(() => {
    const last = {};
    rows.forEach((r) => {
      last[r.url] = r.created_at;
    });
    return Object.keys(last).sort((a, b) => (last[a] < last[b] ? 1 : -1));
  }, [rows]);

  useEffect(() => {
    if (urls.length && !urls.includes(selected)) setSelected(urls[0]);
  }, [urls, selected]);

  const points = useMemo(() => rows.filter((r) => r.url === selected), [rows, selected]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/app");
  }

  async function removeScan(id) {
    await supabase.from("score_history").delete().eq("id", id);
    setRows((rs) => rs.filter((r) => r.id !== id));
  }

  if (!authReady) {
    return <main className="px-6 py-20 text-center text-[var(--muted)]">Loading...</main>;
  }

  const latest = points[points.length - 1];
  const first = points[0];
  const change = latest && first ? latest.score - first.score : 0;
  const best = points.length ? Math.max(...points.map((p) => p.score)) : 0;

  return (
    <AppShell email={user?.email} onLogout={logout}>
      <div className="mb-6">
        <h1 className="text-3xl font-light">
          Score <span className="font-bold italic text-[var(--primary-2)]">History</span>
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
               Every scan score is saved here, so you can see whether your website is improving.
        </p>
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading...</p>
      ) : urls.length === 0 ? (
        <div className="card p-8 text-center">
          <h2 className="mb-2 font-semibold">No history yet</h2>
          <p className="text-sm text-[var(--muted)]">
            Scan a website from the Dashboard. Every new scan is added here as a point on the chart.
            The chart appears once the same website has at least 2 scans.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card flex flex-wrap items-center gap-3 p-4">
            <label htmlFor="site" className="text-sm text-[var(--muted)]">
              Website
            </label>
            <select
              id="site"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-black/40 px-4 py-2 text-sm outline-none focus:border-[var(--primary)]"
            >
              {urls.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Latest score" value={latest ? `${latest.score}` : "-"} sub={latest ? `Grade ${latest.grade || "-"}` : ""} />
            <Stat
              label="Change since first scan"
              value={points.length > 1 ? `${change > 0 ? "+" : ""}${change}` : "-"}
              tone={change > 0 ? "text-green-400" : change < 0 ? "text-red-400" : ""}
                          sub={points.length > 1 ? "points" : "Needs 2 scans"}
            />
            <Stat label="Best score" value={points.length ? best : "-"} />
            <Stat label="Total scans" value={points.length} />
          </div>

          <div className="card p-6">
            <h2 className="mb-4 font-semibold">Score over time</h2>
            {points.length === 1 && (
              <p className="mb-2 text-xs text-[var(--muted)]">
                               Only 1 scan so far. The line appears once you scan this website again.
              </p>
            )}
            {points.length > 0 && <LineChart points={points} />}
          </div>

          <div className="card p-6">
            <h2 className="mb-4 font-semibold">All scans</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[var(--muted)]">
                  <tr>
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3 text-right">Score</th>
                    <th className="py-2 pr-3 text-right">Grade</th>
                    <th className="py-2 text-right" />
                  </tr>
                </thead>
                <tbody>
                  {[...points].reverse().map((p) => (
                    <tr key={p.id} className="border-t border-[var(--border)]">
                      <td className="py-2 pr-3">{fmtFull(p.created_at)}</td>
                      <td className="py-2 pr-3 text-right font-medium">{p.score}</td>
                      <td className="py-2 pr-3 text-right text-[var(--primary-2)]">{p.grade || "-"}</td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => removeScan(p.id)}
                          className="text-[var(--muted)] hover:text-red-400"
                          aria-label="Delete this scan"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}