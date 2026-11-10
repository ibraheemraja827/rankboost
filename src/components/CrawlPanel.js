"use client";
import { useState } from "react";

function CopyBlock({ label, text }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl border border-[var(--border)] bg-black/30 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--primary-2)]">{label}</span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="text-xs text-[var(--muted)] hover:text-white"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-sm text-gray-300">{text}</pre>
    </div>
  );
}

export default function CrawlPanel({ url, onDone, initial }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 const [result, setResult] = useState(initial || null);

  async function run() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResult(json);
      setResult(json);
if (onDone) onDone(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const broken = result ? result.pages.filter((p) => p.status === 0 || p.status >= 400).length : 0;
  const withIssues = result ? result.pages.filter((p) => p.issues.length > 0).length : 0;

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold">Full Site Crawl</h2>
          <p className="text-sm text-[var(--muted)]">
            Scan up to 10 pages, find broken pages, and generate sitemap.xml and robots.txt.
          </p>
        </div>
        <button onClick={run} disabled={loading} className="btn-primary px-6 py-3 font-medium disabled:opacity-60">
          {loading ? "Crawling..." : "Crawl Website"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {result && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Stat n={result.pages.length} label="Pages scanned" color="text-[var(--primary-2)]" />
            <Stat n={withIssues} label="Pages with issues" color="text-orange-400" />
            <Stat n={broken} label="Broken pages" color="text-red-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[var(--muted)]">
                <tr>
                  <th className="py-2 pr-4">Page</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Issues</th>
                </tr>
              </thead>
              <tbody>
                {result.pages.map((p) => (
                  <tr key={p.url} className="border-t border-[var(--border)] align-top">
                    <td className="max-w-xs truncate py-3 pr-4">{p.url}</td>
                    <td className="py-3 pr-4">{p.status || "-"}</td>
                    <td className="py-3">
                      {p.issues.length === 0 ? (
                        <span className="text-green-400">No issues</span>
                      ) : (
                        <ul className="space-y-1 text-orange-300">
                          {p.issues.map((i) => (
                            <li key={i}>- {i}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <CopyBlock label="sitemap.xml" text={result.sitemap} />
          <CopyBlock label="robots.txt" text={result.robots} />
        </div>
      )}
    </div>
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