export async function getPageSpeed(url) {
  const key = process.env.PAGESPEED_API_KEY;
 if (!key) {
  console.log("PAGESPEED: key not found in .env.local");
  return null;
}

  const api =
    "https://www.googleapis.com/pagespeedonline/v5/runPagespeed" +
    `?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&key=${key}`;

  try {
    const res = await fetch(api, { signal: AbortSignal.timeout(45000) });
   if (!res.ok) {
  console.log("PAGESPEED error:", res.status, await res.text());
  return null;
}
    const json = await res.json();

    const lh = json.lighthouseResult;
    const perf = Math.round((lh.categories.performance.score || 0) * 100);
    const a = lh.audits;

    const lcp = a["largest-contentful-paint"]?.displayValue || "n/a";
    const cls = a["cumulative-layout-shift"]?.displayValue || "n/a";
    const tbt = a["total-blocking-time"]?.displayValue || "n/a";

    const status = perf >= 90 ? "good" : perf >= 50 ? "warning" : "error";
    const message =
      status === "good"
        ? `Fast page (${perf}/100). LCP ${lcp}.`
        : `Mobile speed is ${perf}/100. LCP ${lcp}, TBT ${tbt}. Optimize images and scripts.`;

    return { status, message, value: perf, details: { lcp, cls, tbt } };
} catch (e) {
  console.log("PAGESPEED failed:", e.message);
  return null;
}
   
}