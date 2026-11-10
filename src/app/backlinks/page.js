
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { parseCsv } from "@/lib/gsc";

export default function BacklinkAnalysisPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [links, setLinks] = useState([]);
  const [fileName, setFileName] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

  function findColumn(headers, names) {
    return headers.findIndex((header) =>
      names.some((name) => header.includes(name))
    );
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setMessage("");
    setUploading(true);

    try {
      const rows = parseCsv(await file.text());

      if (rows.length < 2) {
        throw new Error("CSV file is empty or invalid.");
      }

      const headers = rows[0].map((h) =>
        h.trim().toLowerCase().replace(/[_-]/g, " ")
      );

      const sourceIndex = findColumn(headers, [
        "source url",
        "referring page",
        "linking page",
        "source",
        "url",
      ]);

      const targetIndex = findColumn(headers, [
        "target url",
        "destination url",
        "target",
        "destination",
      ]);

      const domainIndex = findColumn(headers, [
        "referring domain",
        "source domain",
        "domain",
      ]);

      const anchorIndex = findColumn(headers, [
        "anchor text",
        "anchor",
      ]);

      const typeIndex = findColumn(headers, [
        "link type",
        "type",
      ]);

      const ratingIndex = findColumn(headers, [
        "domain rating",
        "domain authority",
        "authority score",
        "dr",
      ]);

      if (sourceIndex < 0 && domainIndex < 0) {
        throw new Error(
          "Source URL or Referring Domain column was not found. Please check your CSV headers."
        );
      }

      const parsedLinks = rows.slice(1).map((row) => {
        const source = row[sourceIndex]?.trim() || "";
        let domain = row[domainIndex]?.trim() || "";

        if (!domain && source) {
          try {
            domain = new URL(
              source.startsWith("http") ? source : `https://${source}`
            ).hostname;
          } catch {
            domain = source;
          }
        }

        const rawType = (
          typeIndex >= 0 ? row[typeIndex] : ""
        )?.trim().toLowerCase() || "";

        let linkType = "Unknown";

        if (rawType.includes("nofollow")) {
          linkType = "Nofollow";
        } else if (
          rawType.includes("dofollow") ||
          rawType.includes("follow")
        ) {
          linkType = "Dofollow";
        }

        return {
          source,
          target: targetIndex >= 0 ? row[targetIndex]?.trim() || "" : "",
          domain,
          anchor: anchorIndex >= 0 ? row[anchorIndex]?.trim() || "" : "",
          type: linkType,
          rating: ratingIndex >= 0
            ? Number.parseFloat(row[ratingIndex]) || null
            : null,
        };
      }).filter((item) => item.source || item.domain);

      if (!parsedLinks.length) {
        throw new Error("No valid backlink records found.");
      }

      setLinks(parsedLinks);
      setFileName(file.name);
      setMessage(`${parsedLinks.length} backlink records imported successfully.`);
      setSearch("");
      setFilter("all");
    } catch (err) {
      setError(err.message || "Could not read this CSV file.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  const stats = useMemo(() => {
    const domains = new Set(
      links.map((item) => item.domain.toLowerCase()).filter(Boolean)
    );

    return {
      total: links.length,
      domains: domains.size,
      dofollow: links.filter((item) => item.type === "Dofollow").length,
      nofollow: links.filter((item) => item.type === "Nofollow").length,
    };
  }, [links]);

  const filteredLinks = useMemo(() => {
    return links.filter((item) => {
      const query = search.toLowerCase();

      const matchesSearch =
        item.source.toLowerCase().includes(query) ||
        item.domain.toLowerCase().includes(query) ||
        item.target.toLowerCase().includes(query) ||
        item.anchor.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ||
        item.type.toLowerCase() === filter;

      return matchesSearch && matchesFilter;
    });
  }, [links, search, filter]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center text-white">
        Loading Backlink Analysis...
      </div>
    );
  }

  if (!user) return null;

  return (
    <AppShell email={user?.email} onLogout={logout}>
      <div className="space-y-7">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-[#a2a3e9] mb-2">
              SEO TOOLS / BACKLINK ANALYSIS
            </p>

            <h1 className="text-3xl font-bold text-white">
              Backlink Analysis
            </h1>

            <p className="text-sm text-gray-400 mt-2">
              Analyze your website's backlink profile and referring domains.
            </p>
          </div>

          <label className="inline-flex items-center justify-center rounded-xl bg-[#696aac] hover:bg-[#8586c9] px-5 py-3 text-white text-sm font-semibold cursor-pointer transition">
            {uploading ? "Uploading..." : "Upload Backlinks CSV"}

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

        {/* Information */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-white font-semibold mb-2">
            Import Backlink Data
          </h2>

          <p className="text-sm text-gray-400">
            Upload a backlink CSV export from Ahrefs, Semrush or another
            backlink provider. The file should contain a Source URL or
            Referring Domain column. Other supported columns include
            Target URL, Anchor Text, Link Type and Domain Rating.
          </p>

          {fileName && (
            <p className="text-xs text-[#a2a3e9] mt-3">
              Imported file: {fileName}
            </p>
          )}
        </div>

        {/* Empty state */}
        {links.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
            <div className="text-4xl mb-4">↗</div>

            <h2 className="text-xl font-semibold text-white">
              No Backlink Data Yet
            </h2>

            <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
              Import a backlink CSV to analyze referring domains,
              link types and backlink sources.
            </p>
          </div>
        ) : (
          <>
            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: "Total Backlinks", value: stats.total },
                { label: "Referring Domains", value: stats.domains },
                { label: "Dofollow Links", value: stats.dofollow },
                { label: "Nofollow Links", value: stats.nofollow },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <p className="text-sm text-gray-400">{item.label}</p>

                  <p className="text-3xl font-bold text-white mt-4">
                    {item.value.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Backlink table */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <div className="p-5 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Backlink Profile
                  </h2>

                  <p className="text-xs text-gray-400 mt-1">
                    {filteredLinks.length} of {links.length} records
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="search"
                    placeholder="Search source, domain or anchor..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#696aac]"
                  />

                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none focus:border-[#696aac]"
                  >
                    <option value="all">All Links</option>
                    <option value="dofollow">Dofollow</option>
                    <option value="nofollow">Nofollow</option>
                    <option value="unknown">Unknown Type</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-white/[0.04] text-xs uppercase text-gray-400">
                    <tr>
                      <th className="px-5 py-4">Source Domain</th>
                      <th className="px-5 py-4">Source URL</th>
                      <th className="px-5 py-4">Target URL</th>
                      <th className="px-5 py-4">Anchor Text</th>
                      <th className="px-5 py-4">Link Type</th>
                      <th className="px-5 py-4">Domain Rating</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {filteredLinks.map((item, index) => (
                      <tr
                        key={`${item.source}-${index}`}
                        className="hover:bg-white/[0.03]"
                      >
                        <td className="px-5 py-4 text-sm text-[#a2a3e9]">
                          {item.domain || "—"}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-300 max-w-[220px] truncate">
                          {item.source || "—"}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-300 max-w-[220px] truncate">
                          {item.target || "—"}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-300">
                          {item.anchor || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs ${
                            item.type === "Dofollow"
                              ? "bg-green-400/10 text-green-400"
                              : item.type === "Nofollow"
                              ? "bg-yellow-400/10 text-yellow-400"
                              : "bg-white/10 text-gray-400"
                          }`}>
                            {item.type}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-300">
                          {item.rating ?? "—"}
                        </td>
                      </tr>
                    ))}

                    {filteredLinks.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">
                          No matching backlinks found.
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
