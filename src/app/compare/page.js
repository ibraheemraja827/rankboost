"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import AppShell from "@/components/AppShell";
import ScoreGauge from "@/components/ScoreGauge";
import { supabase } from "@/lib/supabase";

const FACTORS = [
  { key: "metaTitle", title: "Meta Title" },
  { key: "metaDescription", title: "Meta Description" },
  { key: "h1", title: "H1 Tags" },
  { key: "pageSpeed", title: "Page Speed" },
  { key: "schema", title: "Schema Markup" },
  { key: "canonical", title: "Canonical Tags" },
  { key: "imageAlt", title: "Image Alt Tags" },
  { key: "mobile", title: "Mobile Friendly" },
  { key: "https", title: "HTTPS" },
  { key: "content", title: "Content Quality" },
];

const RANK = { good: 2, warning: 1, error: 0 };
const PILL = {
  good: "bg-green-500/10 text-green-400",
  warning: "bg-orange-500/10 text-orange-400",
  error: "bg-red-500/10 text-red-400",
};
const LABEL = { good: "Good", warning: "Warning", error: "Error" };

async function runAudit(url) {
  const res = await fetch("/api/audit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Scan failed");
  return json;
}

function Pill({ r }) {
  if (!r) return <span className="text-xs text-[var(--muted)]">No data</span>;
  return (
    <span className={`rounded-md px-2 py-1 text-xs font-medium ${PILL[r.status]}`}>
      {LABEL[r.status]}
    </span>
  );
}

export default function ComparePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [mine, setMine] = useState("");
  const [theirs, setTheirs] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [a, setA] = useState(null);
  const [b, setB] = useState(null);

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

  async function logout() {
    await supabase.auth.signOut();
    router.push("/app");
  }

  async function compare(e) {
    e.preventDefault();
    if (!mine.trim() || !theirs.trim()) {
      setError("Please enter both websites.");
      return;
    }
    setLoading(true);
    setError("");
    setA(null);
    setB(null);

    const [ra, rb] = await Promise.allSettled([runAudit(mine), runAudit(theirs)]);
    const problems = [];
    if (ra.status === "fulfilled") setA(ra.value);
    else problems.push(`Your website: ${ra.reason.message}`);
    if (rb.status === "fulfilled") setB(rb.value);
    else problems.push(`Competitor: ${rb.reason.message}`);
    if (problems.length) setError(problems.join("  |  "));
    setLoading(false);
  }

  if (!authReady) {
    return <main className="px-6 py-20 text-center text-[var(--muted)]">Loading...</main>;
  }

  const both = a && b;
  const rows = both
    ? FACTORS.map((f) => {
        const ra = a.results?.[f.key];
        const rb = b.results?.[f.key];
        let verdict = "na";
        if (ra && rb) {
          const x = RANK[ra.status];
          const y = RANK[rb.status];
          verdict = x > y ? "you" : y > x ? "them" : "tie";
        }
        return { ...f, ra, rb, verdict };
      })
    : [];

  const ahead = rows.filter((r) => r.verdict === "you").length;
  const behind = rows.filter((r) => r.verdict === "them").length;
  const tied = rows.filter((r) => r.verdict === "tie").length;
  const gaps = rows.filter((r) => r.verdict === "them");
  const diff = both ? a.score - b.score : 0;

  return (
    <AppShell email={user?.email} onLogout={logout}>
      <div className="mb-6">
        <h1 className="text-3xl font-light">
          Competitor <span className="font-bold italic text-[var(--primary-2)]">Compare</span>
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Compare your website with a competitor, factor by factor.
        </p>
      </div>

      <form onSubmit={compare} className="card mb-6 grid gap-3 p-4 md:grid-cols-[1fr_1fr_auto]">
        <input
          value={mine}
          onChange={(e) => setMine(e.target.value)}
          placeholder="Your website (example.com)"
          className="rounded-xl border border-[var(--border)] bg-black/30 px-4 py-3 outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)]"
        />
        <input
          value={theirs}
          onChange={(e) => setTheirs(e.target.value)}
          placeholder="Competitor website (competitor.com)"
          className="rounded-xl border border-[var(--border)] bg-black/30 px-4 py-3 outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)]"
        />
        <button disabled={loading} className="btn-primary px-6 py-3 font-medium disabled:opacity-60">
          {loading ? "Comparing..." : "Compare"}
        </button>
      </form>

      {loading && (
        <p className="mb-6 text-sm text-[var(--muted)]">
          Scanning both websites. This can take up to a minute.
        </p>
      )}
      {error && <p className="mb-6 text-sm text-red-400">{error}</p>}

      {both && (
        <div className="space-y-6">
          {/* Score cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { label: "Your website", d: a },
              { label: "Competitor", d: b },
            ].map(({ label, d }) => (
              <div key={label} className="card p-6">
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="font-semibold">{label}</h2>
                </div>
                <p className="mb-4 truncate text-sm text-[var(--muted)]">{d.url}</p>
                <ScoreGauge score={d.score} grade={d.grade} />
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card flex flex-wrap items-center gap-4 p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/15 text-[var(--primary-2)]">
              <Trophy size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold">
                {diff > 0
                  ? `Your website scores ${diff} points higher`
                  : diff < 0
                  ? `Competitor scores ${Math.abs(diff)} points higher`
                  : "Both websites have the same score"}
              </div>
              <div className="text-sm text-[var(--muted)]">
                You are ahead on {ahead} factors, behind on {behind}, and tied on {tied}.
              </div>
            </div>
          </div>

          {/* Factor table */}
          <div className="card p-6">
            <h2 className="mb-4 font-semibold">Factor by factor</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[var(--muted)]">
                  <tr>
                    <th className="py-2 pr-3">Factor</th>
                    <th className="py-2 pr-3">You</th>
                    <th className="py-2 pr-3">Competitor</th>
                    <th className="py-2 text-right">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.key} className="border-t border-[var(--border)]">
                      <td className="py-3 pr-3 font-medium">{r.title}</td>
                      <td className="py-3 pr-3"><Pill r={r.ra} /></td>
                      <td className="py-3 pr-3"><Pill r={r.rb} /></td>
                      <td className="py-3 text-right text-xs">
                        {r.verdict === "you" && <span className="text-green-400">You lead</span>}
                        {r.verdict === "them" && <span className="text-orange-400">Competitor leads</span>}
                        {r.verdict === "tie" && <span className="text-[var(--muted)]">Tie</span>}
                        {r.verdict === "na" && <span className="text-[var(--muted)]">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gaps */}
          <div className="card p-6">
            <h2 className="mb-1 font-semibold">Where to catch up</h2>
            {gaps.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">
                The competitor is not ahead on any factor. Nice work.
              </p>
            ) : (
              <>
                <p className="mb-4 text-sm text-[var(--muted)]">
                  These are the factors where the competitor does better than you.
                </p>
                <ul className="space-y-3">
                  {gaps.map((g) => (
                    <li key={g.key} className="rounded-xl border border-[var(--border)] bg-black/30 p-4">
                      <div className="mb-2 font-medium">{g.title}</div>
                      <div className="grid gap-2 text-sm md:grid-cols-2">
                        <div>
                          <span className="text-[var(--muted)]">You: </span>
                          <span className="text-gray-300">{g.ra?.message}</span>
                        </div>
                        <div>
                          <span className="text-[var(--muted)]">Competitor: </span>
                          <span className="text-gray-300">{g.rb?.message}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <p className="text-xs text-[var(--muted)]">
            This compares on-page and technical SEO of each homepage only. It does not measure backlinks,
            domain authority or actual rankings, so a higher score does not guarantee a higher Google position.
          </p>
        </div>
      )}
    </AppShell>
  );
}