
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { parseGscFile, fmt } from "@/lib/gsc";

export default function KeywordTrackerPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [keywords, setKeywords] = useState([]);
  const [fileName, setFileName] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("clicks");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  // Authentication
  useEffect(() => {
    let mounted = true;

    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session) {
        router.replace("/app");
      } else {
        setUser(session.user);
      }

      setAuthLoading(false);
    }

    checkUser();

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;

        if (!session) {
          router.replace("/app");
        } else {
          setUser(session.user);
        }

        setAuthLoading(false);
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/app");
  }

  // CSV upload
  async function handleUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");
    setUploading(true);

    try {
      const text = await file.text();
      const parsed = parseGscFile(text);

      if (!parsed || parsed.type !== "queries") {
        throw new Error(
          "Please upload a valid Google Search Console Queries.csv file."
        );
      }

      if (!parsed.rows.length) {
        throw new Error("No keyword data found in this CSV file.");
      }

      setKeywords(parsed.rows);
      setFileName(file.name);
      setMessage(`${parsed.rows.length} keywords successfully imported.`);
      setSearch("");
    } catch (err) {
      setError(err.message || "Could not read this CSV file.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  // Search and sorting
  const filteredKeywords = useMemo(() => {
    const filtered = keywords.filter((item) =>
      item.label?.toLowerCase().includes(search.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (sortBy === "position") return a.position - b.position;
      if (sortBy === "impressions") return b.impressions - a.impressions;
      if (sortBy === "ctr") return b.ctr - a.ctr;
      return b.clicks - a.clicks;
    });
  }, [keywords, search, sortBy]);

  // Summary metrics
  const stats = useMemo(() => {
    const clicks = keywords.reduce((sum, item) => sum + item.clicks, 0);
    const impressions = keywords.reduce(
      (sum, item) => sum + item.impressions,
      0
    );

    const ctr = impressions ? (clicks / impressions) * 100 : 0;

    const position = impressions
      ? keywords.reduce(
          (sum, item) => sum + item.position * item.impressions,
          0
        ) / impressions
      : 0;

    return { clicks, impressions, ctr, position };
  }, [keywords]);

  const opportunities = useMemo(
    () =>
      keywords
        .filter(
          (item) =>
            item.position >= 8 &&
            item.position <= 20 &&
            item.impressions >= 100
        )
        .sort((a, b) => b.impressions - a.impressions),
    [keywords]
  );

  const topKeywords = useMemo(
    () => [...keywords].sort((a, b) => b.clicks - a.clicks).slice(0, 5),
    [keywords]
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center text-white">
        Loading Keyword Tracker...
      </div>
    );
  }

  if (!user) return null;

  return (
    <AppShell email={user?.email} onLogout={logout}>
      <div className="space-y-7">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-[#a2a3e9] mb-2">
              SEO TOOLS / KEYWORD TRACKER
            </p>

            <h1 className="text-3xl font-bold text-white">
              Keyword Tracker
            </h1>

            <p className="text-sm text-gray-400 mt-2">
              Track keyword performance using your Google Search Console data.
            </p>
          </div>

          <label className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#696aac] hover:bg-[#8586c9] px-5 py-3 text-white text-sm font-semibold cursor-pointer transition">
            {uploading ? "Uploading..." : "Upload Queries CSV"}
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Messages */}
        {message && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Upload information */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-white font-semibold mb-2">
            Google Search Console Data
          </h2>

          <p className="text-sm text-gray-400">
            Export your Search Console Performance report and upload the
            Queries.csv file. This tracker uses actual exported keyword
            metrics, not live Google rankings.
          </p>

          {fileName && (
            <p className="text-xs text-[#a2a3e9] mt-3">
              Imported file: {fileName}
            </p>
          )}
        </div>

        {/* Empty state */}
        {keywords.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
            <div className="text-4xl mb-4">⌕</div>

            <h2 className="text-xl font-semibold text-white">
              No Keyword Data Yet
            </h2>

            <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
              Upload your Google Search Console Queries.csv file to see
              clicks, impressions, CTR and average keyword positions.
            </p>
          </div>
        ) : (
          <>
            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Clicks",
                  value: fmt(stats.clicks),
                  icon: "↗",
                },
                {
                  label: "Total Impressions",
                  value: fmt(stats.impressions),
                  icon: "◉",
                },
                {
                  label: "Average CTR",
                  value: `${stats.ctr.toFixed(1)}%`,
                  icon: "%",
                },
                {
                  label: "Average Position",
                  value: stats.position.toFixed(1),
                  icon: "#",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">{item.label}</p>
                    <span className="text-xl text-[#a2a3e9]">
                      {item.icon}
                    </span>
                  </div>

                  <p className="text-3xl font-bold text-white mt-4">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Top keywords */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-lg font-semibold text-white mb-4">
                Top Performing Keywords
              </h2>

              <div className="space-y-3">
                {topKeywords.map((item, index) => (
                  <div
                    key={`${item.label}-${index}`}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/5 pb-3 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#a2a3e9]">
                        #{index + 1}
                      </span>
                      <span className="text-sm text-white">
                        {item.label}
                      </span>
                    </div>

                    <span className="text-sm text-gray-400">
                      {fmt(item.clicks)} clicks
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities */}
            <div className="rounded-2xl border border-[#696aac]/30 bg-[#696aac]/[0.06] p-5">
              <h2 className="text-lg font-semibold text-white">
                Keyword Opportunities
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Keywords ranking around positions 8–20 with at least 100
                impressions. These may have potential for improvement.
              </p>

              <p className="text-2xl font-bold text-[#a2a3e9] mt-4">
                {opportunities.length}
              </p>

              <p className="text-xs text-gray-500">
                Potential improvement opportunities
              </p>
            </div>

            {/* Keyword table */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <div className="p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    All Keywords
                  </h2>

                  <p className="text-xs text-gray-400 mt-1">
                    {keywords.length} imported keywords
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="search"
                    placeholder="Search keywords..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none focus:border-[#696aac]"
                  />

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-xl border border-white/10 bg-[#111] px-4 py-2.5 text-sm text-white outline-none focus:border-[#696aac]"
                  >
                    <option value="clicks">Sort: Clicks</option>
                    <option value="impressions">Sort: Impressions</option>
                    <option value="ctr">Sort: CTR</option>
                    <option value="position">Sort: Position</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[650px]">
                  <thead className="bg-white/[0.04] text-xs uppercase text-gray-400">
                    <tr>
                      <th className="px-5 py-4">Keyword</th>
                      <th className="px-5 py-4">Clicks</th>
                      <th className="px-5 py-4">Impressions</th>
                      <th className="px-5 py-4">CTR</th>
                      <th className="px-5 py-4">Position</th>
                      <th className="px-5 py-4">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {filteredKeywords.map((item, index) => {
                      const status =
                        item.position <= 10
                          ? "Top 10"
                          : item.position <= 20
                          ? "Needs improvement"
                          : "Low visibility";

                      const statusClass =
                        item.position <= 10
                          ? "text-green-400 bg-green-400/10"
                          : item.position <= 20
                          ? "text-yellow-400 bg-yellow-400/10"
                          : "text-red-400 bg-red-400/10";

                      return (
                        <tr
                          key={`${item.label}-${index}`}
                          className="hover:bg-white/[0.03] transition"
                        >
                          <td className="px-5 py-4 text-sm text-white font-medium">
                            {item.label}
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-300">
                            {fmt(item.clicks)}
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-300">
                            {fmt(item.impressions)}
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-300">
                            {item.ctr.toFixed(1)}%
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-300">
                            {item.position.toFixed(1)}
                          </td>

                          <td className="px-5 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs ${statusClass}`}>
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredKeywords.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-10 text-center text-sm text-gray-400"
                        >
                          No matching keywords found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
