// ---------- CSV parser (quotes, BOM, \r\n sambhalta hai) ----------
export function parseCsv(text) {
  text = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [], cell = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else inQ = false;
      } else cell += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x !== "")) rows.push(row);
  return rows;
}

const num = (v) => parseFloat(String(v ?? "").replace(/[%,\s]/g, "")) || 0;

// Search Console ki export file pehchanta hai: Dates/Chart, Queries ya Pages
export function parseGscFile(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) return null;
  const head = rows[0].map((h) => h.trim().toLowerCase());
  const col = (word) => head.findIndex((h) => h.includes(word));
  const iC = col("click"), iI = col("impression"), iT = col("ctr"), iP = col("position");
  if (iC < 0 || iI < 0) return null;

  const first = head[0];
  let type = null;
  if (first === "date") type = "daily";
  else if (first.includes("quer")) type = "queries";
  else if (first.includes("page")) type = "pages";
  if (!type) return null;

  const body = rows.slice(1).map((r) => {
    const clicks = num(r[iC]);
    const impressions = num(r[iI]);
    const item = {
      clicks,
      impressions,
      ctr: iT >= 0 ? num(r[iT]) : impressions ? (clicks / impressions) * 100 : 0,
      position: iP >= 0 ? num(r[iP]) : 0,
    };
    if (type === "daily") item.date = r[0].trim();
    else item.label = r[0].trim();
    return item;
  });

  if (type === "daily") body.sort((a, b) => (a.date < b.date ? -1 : 1));
  return { type, rows: body };
}

// ---------- Total aur average ----------
export function totals(daily) {
  const clicks = daily.reduce((a, d) => a + d.clicks, 0);
  const impressions = daily.reduce((a, d) => a + d.impressions, 0);
  const ctr = impressions ? (clicks / impressions) * 100 : 0;
  const position = impressions
    ? daily.reduce((a, d) => a + d.position * d.impressions, 0) / impressions
    : 0;
  return { clicks, impressions, ctr, position };
}

export function fmt(n) {
  if (n >= 10000) return Math.round(n / 1000) + "K";
  if (n >= 1000) return (n / 1000).toFixed(2).replace(/\.?0+$/, "") + "K";
  return String(Math.round(n));
}

// ---------- Demo data (sirf design dikhane ke liye) ----------
function rng(seed) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export function demoDaily() {
  const r = rng(42);
  const start = Date.UTC(2026, 8, 24); // 24 Sep 2026
  const out = [];
  for (let i = 0; i < 28; i++) {
    const d = new Date(start + i * 86400000);
    const weekend = d.getUTCDay() === 0 || d.getUTCDay() === 6 ? 0.75 : 1;
    const trend = 1 + i * 0.025 + (i > 20 ? 0.25 : 0);
    const impressions = Math.round((900 + r() * 250) * trend * weekend);
    const ctr = 0.05 + r() * 0.03 + i * 0.0006;
    const clicks = Math.round(impressions * ctr);
    const position = Math.max(8, 24 - i * 0.35 + (r() - 0.5) * 1.5);
    out.push({
      date: d.toISOString().slice(0, 10),
      clicks,
      impressions,
      ctr: (clicks / impressions) * 100,
      position: +position.toFixed(1),
    });
  }
  return out;
}

export function demoData() {
  return {
    daily: demoDaily(),
    queries: [
      { label: "seo services", clicks: 212, impressions: 3400, ctr: 6.2, position: 9.4 },
      { label: "website audit tool", clicks: 168, impressions: 2100, ctr: 8.0, position: 6.1 },
      { label: "free seo checker", clicks: 131, impressions: 4300, ctr: 3.0, position: 14.8 },
      { label: "ai seo tool", clicks: 97, impressions: 1500, ctr: 6.5, position: 11.2 },
      { label: "how to improve website ranking", clicks: 64, impressions: 2800, ctr: 2.3, position: 18.6 },
    ],
    pages: [
      { label: "https://example.com/", clicks: 480, impressions: 6200, ctr: 7.7, position: 8.9 },
      { label: "https://example.com/services", clicks: 260, impressions: 3900, ctr: 6.7, position: 10.3 },
      { label: "https://example.com/blog/seo-tips", clicks: 190, impressions: 5100, ctr: 3.7, position: 15.4 },
      { label: "https://example.com/pricing", clicks: 88, impressions: 1200, ctr: 7.3, position: 7.8 },
    ],
  };
}

// Test ke liye: demo data ki CSV jo upload karke dekh sakte hain
export function demoCsv() {
  const lines = demoDaily().map(
    (d) => `${d.date},${d.clicks},${d.impressions},${d.ctr.toFixed(1)}%,${d.position}`
  );
  return "Date,Clicks,Impressions,CTR,Position\n" + lines.join("\n");
}