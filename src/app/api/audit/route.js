import { NextResponse } from "next/server";
import { fetchPage, analyzeHtml, calculateScore, extractContext } from "@/lib/analyzer";
import { getPageSpeed } from "@/lib/pagespeed";

export const maxDuration = 60;

export async function POST(request) {
  try {
    let { url } = await request.json();
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    new URL(url);

    const [page, speed] = await Promise.all([fetchPage(url), getPageSpeed(url)]);

    const results = analyzeHtml(page.html, page.finalUrl);
    if (speed) results.pageSpeed = speed;

    const { score, grade } = calculateScore(results);
    const context = extractContext(page.html, page.finalUrl);

    return NextResponse.json({ url: page.finalUrl, score, grade, results, context });
  } catch (e) {
    console.log("AUDIT error:", e);
    return NextResponse.json({ error: "Could not scan this website. Check the URL." }, { status: 500 });
  }
}