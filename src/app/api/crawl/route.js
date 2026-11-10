import { NextResponse } from "next/server";
import { crawlSite, buildSitemap, buildRobots } from "@/lib/crawler";

export const maxDuration = 60;

export async function POST(request) {
  try {
    let { url } = await request.json();
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    new URL(url);

    const { origin, pages } = await crawlSite(url, 10);
    return NextResponse.json({
      pages,
      sitemap: buildSitemap(pages),
      robots: buildRobots(origin),
    });
  } catch (e) {
    console.log("CRAWL error:", e);
    return NextResponse.json({ error: "Could not crawl this website." }, { status: 500 });
  }
}