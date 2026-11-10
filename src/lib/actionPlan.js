// Scan ke results se top 5 priority fixes banata hai (AI ke baghair)
const GUIDE = {
  https: {
    title: "Enable HTTPS",
    impact: 10,
    effort: "Medium",
    why: "Bina HTTPS ke browser site ko 'Not secure' dikhata hai, is se visitors ka bharosa aur Google ka trust dono kam hote hain.",
    how: [
      "Apne hosting provider se free SSL certificate (Let's Encrypt) activate karein.",
      "Saare http:// links ko https:// par 301 redirect karein.",
    ],
  },
  metaTitle: {
    title: "Fix the Meta Title",
    impact: 9,
    effort: "Easy",
    why: "Title Google ke search result ki sab se bari line hoti hai aur click karne ka pehla sabab banti hai.",
    how: [
      "Har page ka apna unique title likhein, 30 se 60 characters ke darmiyan.",
      "Main keyword title ke shuru mein rakhein aur brand ka naam aakhir mein.",
    ],
  },
  mobile: {
    title: "Make the Site Mobile Friendly",
    impact: 8,
    effort: "Medium",
    why: "Google mobile-first indexing use karta hai, yaani ranking mobile version dekh kar hoti hai.",
    how: [
      'Head mein <meta name="viewport" content="width=device-width, initial-scale=1"> lagayen.',
      "Layout ko responsive banayen aur phone par test karein.",
    ],
  },
  pageSpeed: {
    title: "Improve Page Speed",
    impact: 8,
    effort: "Hard",
    why: "Slow site se visitors wapas chale jate hain aur speed ek confirmed ranking signal hai.",
    how: [
      "Bari images ko compress karein aur WebP format use karein.",
      "Unused JavaScript/CSS hatayen aur caching on karein.",
    ],
  },
  h1: {
    title: "Fix the H1 Heading",
    impact: 7,
    effort: "Easy",
    why: "H1 page ka main topic Google aur visitors dono ko batata hai.",
    how: [
      "Har page par sirf ek H1 rakhein.",
      "H1 mein page ka main keyword natural andaz mein likhein.",
    ],
  },
  metaDescription: {
    title: "Fix the Meta Description",
    impact: 7,
    effort: "Easy",
    why: "Description search result mein title ke neeche dikhti hai aur click-through badhane mein madad karti hai.",
    how: [
      "120 se 160 characters mein page ka faida saaf likhein.",
      "Aakhir mein chhota sa call-to-action rakhein.",
    ],
  },
  content: {
    title: "Improve Content Quality",
    impact: 6,
    effort: "Medium",
    why: "Google un pages ko behtar samajhta hai jin mein kaafi, kaam ka aur saaf likha hua content ho.",
    how: [
      "Page par kam az kam 300 se 500 alfaz ka useful content rakhein.",
      "Headings (H2/H3) se content ko hisson mein baantein.",
    ],
  },
  canonical: {
    title: "Add a Canonical Tag",
    impact: 5,
    effort: "Easy",
    why: "Canonical tag duplicate pages ki wajah se hone wale ranking ke nuksan se bachata hai.",
    how: [
      'Head mein <link rel="canonical" href="..."> lagayen jo page ka asli URL ho.',
    ],
  },
  imageAlt: {
    title: "Add Image Alt Text",
    impact: 5,
    effort: "Easy",
    why: "Alt text se Google tasveer samajhta hai, aur screen readers wale visitors ke liye bhi zaroori hai.",
    how: [
      "Har important image ko chhota aur saaf alt text dein.",
      "Keywords zabardasti na thonsein, bas tasveer ko sahi bayan karein.",
    ],
  },
  schema: {
    title: "Add Schema Markup",
    impact: 4,
    effort: "Medium",
    why: "Schema search engines ko batata hai ke aap kaun hain aur site kis baare mein hai, is se rich results ka mauqa milta hai.",
    how: [
      "JSON-LD schema (Organization ya LocalBusiness) head mein lagayen.",
      "Neeche wale AI Fixes se tayyar schema copy kar sakte hain.",
    ],
  },
};

export function buildActionPlan(results, limit = 5) {
  const items = [];
  for (const [key, guide] of Object.entries(GUIDE)) {
    const r = results?.[key];
    if (!r) continue;
    if (r.status !== "error" && r.status !== "warning") continue;
    const severity = r.status === "error" ? 2 : 1;
    items.push({
      key,
      status: r.status,
      message: r.message || "",
      score: severity * guide.impact,
      ...guide,
    });
  }
  items.sort((a, b) => b.score - a.score || b.impact - a.impact);
  return { top: items.slice(0, limit), total: items.length };
}