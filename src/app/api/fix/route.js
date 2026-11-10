import { NextResponse } from "next/server";

export const maxDuration = 60;

const DEFAULT_MODELS = ["gemini-3.8-flash", "gemini-3.5-flash-lite"];

async function askGemini(model, key, prompt) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: 4000,
    },
  };
  // thinking level sirf Gemini 3 models par lagta hai
  if (model.startsWith("gemini-3")) {
    body.generationConfig.thinkingConfig = { thinkingLevel: "low" };
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${model} -> ${res.status} ${text.slice(0, 200)}`);
  }

  const json = await res.json();
  const raw = json.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error(`${model} -> empty or invalid reply`);
  return JSON.parse(raw.slice(start, end + 1));
}

export async function POST(request) {
  try {
    const { context } = await request.json();
    if (!context) return NextResponse.json({ error: "Missing page data" }, { status: 400 });

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.log("FIX error: GEMINI_API_KEY missing in .env.local");
      return NextResponse.json({ error: "AI key is not configured." }, { status: 500 });
    }

    const models = (process.env.GEMINI_MODELS || process.env.GEMINI_MODEL || "")
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    const list = models.length ? models : DEFAULT_MODELS;

    const prompt = `You are an expert SEO specialist. Improve the SEO of this web page.

URL: ${context.url}
Current title: ${context.title || "(missing)"}
Current meta description: ${context.description || "(missing)"}
H1: ${context.h1 || "(missing)"}
H2 headings: ${(context.headings || []).join(" | ") || "(none)"}
Images missing alt text: ${JSON.stringify(context.images || [])}
Page text excerpt: ${(context.text || "").slice(0, 2000)}

Return ONLY valid JSON with exactly this shape:
{
  "newTitle": "30-60 characters, includes the main keyword",
  "newMetaDescription": "120-160 characters, clear and click-worthy",
  "keywords": ["8 relevant target keywords"],
  "imageAlts": [{"src": "image src", "alt": "short descriptive alt text"}],
  "schema": { "a valid JSON-LD object for this page, e.g. Organization or LocalBusiness or WebSite" },
  "contentTips": ["3 specific suggestions to improve the content"]
}
Base everything only on the page content given. Do not invent facts like addresses or phone numbers.`;

    let fixes = null;
    for (const model of list) {
      try {
        fixes = await askGemini(model, key, prompt);
        console.log("FIX ok with", model);
        break;
      } catch (e) {
        console.log("FIX failed:", e.message);
      }
    }

    if (!fixes) {
      return NextResponse.json(
        { error: "The AI service is busy right now. Please try again in a minute." },
        { status: 503 }
      );
    }

    fixes.keywords = fixes.keywords || [];
    fixes.imageAlts = fixes.imageAlts || [];
    fixes.contentTips = fixes.contentTips || [];
    fixes.schema = fixes.schema || {};

    return NextResponse.json({ fixes });
  } catch (e) {
    console.log("FIX error:", e.message);
    return NextResponse.json({ error: "AI could not generate fixes. Try again." }, { status: 500 });
  }
}