import { jsPDF } from "jspdf";
import JSZip from "jszip";

const GREEN = [34, 197, 94];
const ORANGE = [249, 115, 22];
const RED = [239, 68, 68];
const PURPLE = [111, 114, 234];
const DARK = [11, 11, 22];
const GRAY = [110, 110, 130];
const TEXT = [30, 30, 45];

const STATUS_COLOR = { good: GREEN, warning: ORANGE, error: RED };
const STATUS_LABEL = { good: "GOOD", warning: "WARNING", error: "ERROR" };

const NAMES = {
  metaTitle: "Meta Title",
  metaDescription: "Meta Description",
  h1: "H1 Tags",
  pageSpeed: "Page Speed",
  schema: "Schema Markup",
  canonical: "Canonical Tags",
  imageAlt: "Image Alt Tags",
  mobile: "Mobile Friendly",
  https: "HTTPS",
  content: "Content Quality",
};

// jsPDF ka default font sirf basic characters dikhata hai
const clean = (s) => String(s ?? "").replace(/[^\x20-\x7E\u00A0-\u00FF\n]/g, "");

export function buildPdf({ data, fixes, crawl }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 40;
  let y = 0;

  const ensure = (h) => {
    if (y + h > H - 50) {
      doc.addPage();
      y = M + 10;
    }
  };

  const write = (str, { size = 10, bold = false, color = TEXT, indent = 0, gap = 0 } = {}) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(clean(str), W - 2 * M - indent);
    for (const line of lines) {
      ensure(size * 1.4);
      doc.text(line, M + indent, y);
      y += size * 1.4;
    }
    y += gap;
  };

  const section = (title) => {
    ensure(50);
    y += 14;
    write(title, { size: 14, bold: true, color: PURPLE, gap: 2 });
    doc.setDrawColor(...PURPLE);
    doc.setLineWidth(0.8);
    doc.line(M, y - 6, W - M, y - 6);
    y += 6;
  };

  // ---------- Header ----------
  doc.setFillColor(...DARK);
  doc.rect(0, 0, W, 120, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("RankBoost AI", M, 50);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(180, 182, 255);
  doc.text("SEO Audit Report", M, 70);
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 215);
  doc.text(clean(data.url).slice(0, 70), M, 92);
  doc.text(new Date().toLocaleDateString("en-GB"), M, 106);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(44);
  doc.setTextColor(255, 255, 255);
  doc.text(String(data.score), W - M - 50, 70, { align: "right" });
  doc.setFontSize(12);
  doc.setTextColor(200, 200, 215);
  doc.text("/100", W - M - 46, 70);
  doc.setFontSize(18);
  doc.setTextColor(180, 182, 255);
  doc.text("Grade " + data.grade, W - M, 100, { align: "right" });

  y = 150;

  // ---------- Overview ----------
  const counts = { good: 0, warning: 0, error: 0 };
  Object.values(data.results).forEach((r) => counts[r.status]++);
  section("Overview");
  write(`${counts.good} good   |   ${counts.warning} warnings   |   ${counts.error} errors`, {
    size: 11,
    bold: true,
    gap: 4,
  });

  // ---------- Factors ----------
  section("SEO Factors");
  Object.keys(NAMES).forEach((key) => {
    const r = data.results[key];
    if (!r) return;
    ensure(34);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...TEXT);
    doc.text(NAMES[key], M, y);
    doc.setTextColor(...STATUS_COLOR[r.status]);
    doc.text(STATUS_LABEL[r.status], W - M, y, { align: "right" });
    y += 14;
    write(r.message, { size: 9, color: GRAY, gap: 6 });
  });

  // ---------- AI fixes ----------
  if (fixes) {
    section("Recommended Fixes");
    write("New Title", { bold: true });
    write(fixes.newTitle, { color: GRAY, gap: 6 });
    write("New Meta Description", { bold: true });
    write(fixes.newMetaDescription, { color: GRAY, gap: 6 });
    write("Target Keywords", { bold: true });
    write((fixes.keywords || []).join(", "), { color: GRAY, gap: 6 });
    if (fixes.imageAlts?.length) {
      write("Image Alt Text", { bold: true });
      fixes.imageAlts.forEach((i) => write(`${i.src}  ->  ${i.alt}`, { size: 9, color: GRAY }));
      y += 6;
    }
    if (fixes.contentTips?.length) {
      write("Content Tips", { bold: true });
      fixes.contentTips.forEach((t) => write("- " + t, { color: GRAY }));
      y += 4;
    }
  }

  // ---------- Crawl ----------
  if (crawl) {
    section("Site Crawl");
    const broken = crawl.pages.filter((p) => p.status === 0 || p.status >= 400).length;
    const withIssues = crawl.pages.filter((p) => p.issues.length > 0).length;
    write(`${crawl.pages.length} pages scanned   |   ${withIssues} with issues   |   ${broken} broken`, {
      bold: true,
      gap: 6,
    });
    crawl.pages.forEach((p) => {
      ensure(30);
      write(`${p.url}  (status ${p.status || "none"})`, { size: 9, bold: true });
      if (p.issues.length === 0) write("No issues", { size: 9, color: GREEN, indent: 10, gap: 4 });
      else {
        p.issues.forEach((i) => write("- " + i, { size: 9, color: ORANGE, indent: 10 }));
        y += 4;
      }
    });
  }

  // ---------- Note ----------
  y += 10;
  write(
    "Note: These improvements strengthen your on-page SEO. Search rankings also depend on competition, backlinks and site authority, and changes usually take weeks to show in Google.",
    { size: 8, color: GRAY }
  );

  // ---------- Footer ----------
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(`RankBoost AI by TAMx Technologies   |   Page ${i} of ${pages}`, W / 2, H - 24, { align: "center" });
  }

  return doc;
}

export async function buildZip({ data, fixes, crawl }) {
  const zip = new JSZip();
  const doc = buildPdf({ data, fixes, crawl });
  zip.file("SEO-Report.pdf", doc.output("arraybuffer"));

  if (crawl) {
    zip.file("sitemap.xml", crawl.sitemap);
    zip.file("robots.txt", crawl.robots);
  }

  if (fixes) {
    const txt = [
      "NEW TITLE",
      fixes.newTitle,
      "",
      "NEW META DESCRIPTION",
      fixes.newMetaDescription,
      "",
      "TARGET KEYWORDS",
      (fixes.keywords || []).join(", "),
      "",
      "IMAGE ALT TEXT",
      ...(fixes.imageAlts || []).map((i) => `${i.src} -> ${i.alt}`),
      "",
      "CONTENT TIPS",
      ...(fixes.contentTips || []).map((t) => "- " + t),
    ].join("\n");
    zip.file("seo-fixes.txt", txt);
    zip.file(
      "schema-snippet.html",
      `<script type="application/ld+json">\n${JSON.stringify(fixes.schema || {}, null, 2)}\n</script>`
    );
  }

  zip.file(
    "README.txt",
    [
      "RankBoost AI - SEO Package",
      "",
      "SEO-Report.pdf       Full audit report",
      "seo-fixes.txt        New title, meta description, keywords, alt text",
      "schema-snippet.html  Paste inside the <head> of the page",
      "sitemap.xml          Upload to the website root (yoursite.com/sitemap.xml)",
      "robots.txt           Upload to the website root. If the site already has a",
      "                     robots.txt, compare it first instead of replacing it.",
      "",
      "After uploading sitemap.xml, submit it in Google Search Console.",
    ].join("\n")
  );

  return zip.generateAsync({ type: "blob" });
}