import * as cheerio from "cheerio";

const SKIP_EXT = /\.(jpg|jpeg|png|gif|webp|svg|ico|pdf|zip|mp4|mp3|css|js|xml|json|woff2?|ttf)(\?|$)/i;

function normalize(href, base) {
  try {
    const u = new URL(href, base);
    if (!/^https?:$/.test(u.protocol)) return null;
    u.hash = "";
    let s = u.toString();
    if (u.pathname !== "/" && s.endsWith("/")) s = s.slice(0, -1);
    return s;
  } catch {
    return null;
  }
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function crawlSite(startUrl, maxPages = 10) {
  const start = normalize(startUrl, startUrl);
  const host = new URL(start).hostname;
  const queue = [start];
  const seen = new Set(queue);
  const pages = [];

  async function fetchOne(url) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "RankBoostBot/1.0" },
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
      });
      const type = res.headers.get("content-type") || "";
      if (!type.includes("text/html")) return { skipped: true };

      const html = await res.text();
      const $ = cheerio.load(html);

      const links = new Set();
      $("a[href]").each((_, el) => {
        const n = normalize($(el).attr("href"), res.url);
        if (n && new URL(n).hostname === host && !SKIP_EXT.test(n)) links.add(n);
      });

      const title = $("title").first().text().trim();
      const description = $('meta[name="description"]').attr("content")?.trim() || "";
      const h1Count = $("h1").length;
      const imgs = $("img");
      const missingAlt = imgs.filter((_, el) => !($(el).attr("alt") || "").trim()).length;
      $("script, style, noscript").remove();
      const words = $("body").text().replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;

      return { url, status: res.status, title, description, h1Count, missingAlt, words, links: [...links] };
    } catch {
      return { url, status: 0, title: "", description: "", h1Count: 0, missingAlt: 0, words: 0, links: [] };
    }
  }

  while (queue.length && pages.length < maxPages) {
    const batch = queue.splice(0, Math.min(4, maxPages - pages.length));
    const done = (await Promise.all(batch.map(fetchOne))).filter((p) => !p.skipped);
    for (const p of done) {
      pages.push(p);
      for (const link of p.links) {
        if (!seen.has(link) && seen.size < maxPages * 4) {
          seen.add(link);
          queue.push(link);
        }
      }
    }
  }

  // duplicate titles
  const titleCount = {};
  pages.forEach((p) => p.title && (titleCount[p.title] = (titleCount[p.title] || 0) + 1));

  // har page ki problems
  pages.forEach((p) => {
    const issues = [];
    if (p.status === 0 || p.status >= 400) issues.push(`Broken page (status ${p.status || "no response"})`);
    else {
      if (!p.title) issues.push("Title missing");
      else if (p.title.length < 30 || p.title.length > 60) issues.push(`Title length ${p.title.length} (ideal 30-60)`);
      if (titleCount[p.title] > 1) issues.push("Duplicate title");
      if (!p.description) issues.push("Meta description missing");
      if (p.h1Count !== 1) issues.push(p.h1Count === 0 ? "H1 missing" : `${p.h1Count} H1 tags`);
      if (p.words < 300) issues.push(`Thin content (${p.words} words)`);
      if (p.missingAlt > 0) issues.push(`${p.missingAlt} images without alt`);
    }
    p.issues = issues;
    delete p.links;
  });

  return { host, origin: new URL(start).origin, pages };
}

export function buildSitemap(pages) {
  const urls = pages
    .filter((p) => p.status === 200)
    .map((p) => `  <url>\n    <loc>${esc(p.url)}</loc>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

export function buildRobots(origin) {
  return `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml`;
}