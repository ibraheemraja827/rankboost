"use client";
import { useState } from "react";

function saveBlob(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export default function ExportPanel({ data, fixes, crawl }) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const host = (() => {
    try {
      return new URL(data.url).hostname.replace(/[^a-z0-9.-]/gi, "");
    } catch {
      return "website";
    }
  })();

  async function downloadPdf() {
    setBusy("pdf");
    setError("");
    try {
      const { buildPdf } = await import("@/lib/report");
      const doc = buildPdf({ data, fixes, crawl });
      saveBlob(doc.output("blob"), `SEO-Report-${host}.pdf`);
    } catch (e) {
      console.log(e);
      setError("Could not create the PDF.");
    } finally {
      setBusy("");
    }
  }

  async function downloadZip() {
    setBusy("zip");
    setError("");
    try {
      const { buildZip } = await import("@/lib/report");
      const blob = await buildZip({ data, fixes, crawl });
      saveBlob(blob, `SEO-Package-${host}.zip`);
    } catch (e) {
      console.log(e);
      setError("Could not create the ZIP.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold">Export Report</h2>
          <p className="text-sm text-[var(--muted)]">
            Download a branded PDF or the full SEO package (report, fixes, sitemap.xml, robots.txt).
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={downloadPdf}
            disabled={busy !== ""}
            className="rounded-full border border-[var(--border)] px-6 py-3 font-medium hover:bg-white/5 disabled:opacity-60"
          >
            {busy === "pdf" ? "Creating..." : "Download PDF"}
          </button>
          <button
            onClick={downloadZip}
            disabled={busy !== ""}
            className="btn-primary px-6 py-3 font-medium disabled:opacity-60"
          >
            {busy === "zip" ? "Creating..." : "Download Package"}
          </button>
        </div>
      </div>
      <p className="mt-3 text-xs text-[var(--muted)]">
        Included: audit {fixes ? "+ AI fixes" : ""} {crawl ? "+ crawl results" : ""}.
        {!fixes && " Run Fix with AI "}
        {!crawl && (fixes ? " Run Crawl Website " : "and Crawl Website ")}
        {(!fixes || !crawl) && "first to include more in the report."}
      </p>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}