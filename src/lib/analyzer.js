import * as cheerio from "cheerio";

export async function fetchPage(url) {
  const start = Date.now();
  const res = await fetch(url, {
    headers: { "User-Agent": "RankBoostBot/1.0" },
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  });
  const html = await res.text();
  return { html, finalUrl: res.url, status: res.status, ms: Date.now() - start };
}

function check(status, message, value = null) {
  return { status, message, value }; // status: good | warning | error
}

export function analyzeHtml(html, finalUrl) {
  const $ = cheerio.load(html);
  const results = {};

  // 1. Meta Title
  const title = $("title").first().text().trim();
  if (!title) results.metaTitle = check("error", "Meta title is missing.");
  else if (title.length < 30 || title.length > 60)
    results.metaTitle = check("warning", `Title is ${title.length} characters. Ideal is 30-60.`, title);
  else results.metaTitle = check("good", "Your meta title is within the recommended length.", title);

  // 2. Meta Description
  const desc = $('meta[name="description"]').attr("content")?.trim() || "";
  if (!desc) results.metaDescription = check("error", "Meta description is missing.");
  else if (desc.length < 70 || desc.length > 160)
    results.metaDescription = check("warning", `Description is ${desc.length} characters. Ideal is 70-160.`, desc);
  else results.metaDescription = check("good", "Your meta description is within the recommended length.", desc);

  // 3. H1 Tags
  const h1s = $("h1");
  if (h1s.length === 0) results.h1 = check("error", "No H1 tag found.");
  else if (h1s.length > 1) results.h1 = check("warning", `${h1s.length} H1 tags found. Use only one.`, h1s.first().text().trim());
  else results.h1 = check("good", "Your page has one clear H1 tag.", h1s.first().text().trim());

  // 4. Schema Markup
  const schemas = $('script[type="application/ld+json"]').length;
  results.schema = schemas > 0
    ? check("good", `${schemas} schema block(s) found.`)
    : check("warning", "No schema markup (JSON-LD) found.");

  // 5. Canonical
  const canonical = $('link[rel="canonical"]').attr("href");
  results.canonical = canonical
    ? check("good", "Canonical tag is present.", canonical)
    : check("warning", "Canonical tag is missing.");

  // 6. Image Alt Tags
  const imgs = $("img");
  const missingAlt = imgs.filter((_, el) => !($(el).attr("alt") || "").trim()).length;
  if (imgs.length === 0) results.imageAlt = check("good", "No images found.");
  else if (missingAlt === 0) results.imageAlt = check("good", "All images have alt text.");
  else results.imageAlt = check("warning", `${missingAlt} of ${imgs.length} images are missing alt text.`);

  // 7. Mobile Friendly (viewport tag)
  results.mobile = $('meta[name="viewport"]').length
    ? check("good", "Viewport tag found, page is mobile friendly.")
    : check("error", "Viewport meta tag is missing.");

  // 8. HTTPS
  results.https = finalUrl.startsWith("https://")
    ? check("good", "Your site is secured with HTTPS.")
    : check("error", "Your site is not using HTTPS.");

  // 9. Content Quality (word count)
  $("script, style, noscript").remove();
  const words = $("body").text().replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
  if (words < 300) results.content = check("error", `Only ${words} words found. Add more depth (300+).`);
  else if (words < 600) results.content = check("warning", `${words} words found. Consider adding more value.`);
  else results.content = check("good", `${words} words found. Good content depth.`);

  return results;
}

export function calculateScore(results) {
  const items = Object.values(results);
  const points = items.reduce((sum, r) => sum + (r.status === "good" ? 1 : r.status === "warning" ? 0.5 : 0), 0);
  const score = Math.round((points / items.length) * 100);
  const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";
  return { score, grade };
}
export function extractContext(html, finalUrl) {
  const $ = cheerio.load(html);
  const title = $("title").first().text().trim();
  const description = $('meta[name="description"]').attr("content")?.trim() || "";
  const h1 = $("h1").first().text().trim();
  const headings = $("h2").map((_, el) => $(el).text().trim()).get().slice(0, 8);
  const images = $("img")
    .map((_, el) => ({ src: $(el).attr("src") || "", alt: ($(el).attr("alt") || "").trim() }))
    .get()
    .filter((i) => i.src && !i.alt)
    .slice(0, 6);
  $("script, style, noscript").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, 3000);
  return { url: finalUrl, title, description, h1, headings, images, text };
}