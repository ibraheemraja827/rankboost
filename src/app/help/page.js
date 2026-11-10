"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Tag, FileText, Heading1, Gauge, Code2, Link2,
  Image as ImageIcon, Smartphone, Lock, PenLine,
  Search, Sparkles, Globe, Download, ArrowRight,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

const STEPS = [
  { Icon: Search, t: "Scan your website", d: "Go to the Dashboard, enter your website link and click Analyze Website. You get a score out of 100 and 10 factor cards." },
  { Icon: ArrowRight, t: "Follow the Priority Action Plan", d: "Below the factor cards you will see the 5 most important problems to fix first, with simple steps for each." },
  { Icon: Sparkles, t: "Generate AI fixes", d: "Click Fix with AI to get a new title, meta description, keywords, image alt text and schema markup, ready to copy." },
  { Icon: Globe, t: "Crawl the full site", d: "Run the crawl to check up to 10 pages for broken pages, duplicate titles and thin content, and to build sitemap.xml and robots.txt." },
  { Icon: Download, t: "Export your report", d: "Download a PDF report for clients or a ZIP package with all the files you need." },
];

const FACTORS = [
  { Icon: Tag, t: "Meta title", d: "The headline people see in Google results. Aim for 30 to 60 characters and put your main keyword near the start." },
  { Icon: FileText, t: "Meta description", d: "The short text under the title in search results. A clear one earns more clicks. Aim for about 120 to 160 characters." },
  { Icon: Heading1, t: "H1 heading", d: "The main heading of the page. Each page should have exactly one, and it should say what the page is about." },
  { Icon: Gauge, t: "Page speed", d: "How fast the page loads on a phone. Slow pages lose visitors, and speed is a ranking signal." },
  { Icon: Code2, t: "Schema markup", d: "Extra code that tells search engines who you are and what the page is about. It can help you get rich results." },
  { Icon: Link2, t: "Canonical tag", d: "Tells Google which version of a page is the main one, so duplicate pages do not split your ranking." },
  { Icon: ImageIcon, t: "Image alt text", d: "A short description of each image. It helps search engines and visitors who cannot see the image." },
  { Icon: Smartphone, t: "Mobile friendly", d: "Whether the page works well on a phone. Google looks at the mobile version of your site first." },
  { Icon: Lock, t: "HTTPS", d: "A secure connection. Without it browsers show a Not secure warning, which hurts trust." },
  { Icon: PenLine, t: "Content quality", d: "Whether the page has enough useful text. Pages with very little content rarely rank well." },
];

const STATUS = [
  { cls: "bg-green-500/10 text-green-400", t: "Good", d: "This factor is fine. No action needed." },
  { cls: "bg-orange-500/10 text-orange-400", t: "Warning", d: "It works, but it can be improved." },
  { cls: "bg-red-500/10 text-red-400", t: "Error", d: "A real problem. Fix this first." },
];

const FAQ = [
  { q: "How long does a scan take?", a: "Usually 15 to 45 seconds, because a real mobile speed test runs as part of it. Crawling up to 10 pages can take a little longer." },
  { q: "Will RankBoost change my website?", a: "No. RankBoost never touches your site. It gives you the fixes and files, and you decide what to apply." },
  { q: "Can you guarantee a Google ranking?", a: "No tool honestly can. RankBoost helps you fix technical and on-page problems, which improves your chances, but rankings also depend on competition, backlinks and how trusted your site is." },
  { q: "Why is the AI Fix sometimes slow or failing?", a: "The AI service can be busy at peak times. RankBoost automatically tries other models. If it still fails, wait a minute and click Regenerate." },
  { q: "Are my saved reports private?", a: "Yes. Each account can only see its own reports and score history." },
  { q: "Why does Score History show only one point?", a: "A point is added every time you scan. Scan the same website again at a later time to see the line." },
  { q: "What does Competitor Compare measure?", a: "It compares the on-page and technical SEO of two homepages. It does not measure backlinks, domain authority or real rankings." },
  { q: "Is the Performance data real?", a: "It shows demo data until you upload your own Search Console CSV export. Demo data is clearly labelled." },
  { q: "How long until fixes show up in Google?", a: "Usually 1 to 3 months after you apply changes and Google re-crawls your pages." },
];

function Heading({ title, sub }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      {sub && <p className="mt-1 text-sm text-[var(--muted)]">{sub}</p>}
    </div>
  );
}

export default function HelpPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/app");
        return;
      }
      setUser(session.user);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.replace("/app");
      else setUser(session.user);
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/app");
  }

  if (!authReady) {
    return <main className="px-6 py-20 text-center text-[var(--muted)]">Loading...</main>;
  }

  return (
    <AppShell email={user?.email} onLogout={logout}>
      <div className="mb-8">
        <h1 className="text-3xl font-light">
          Help <span className="font-bold italic text-[var(--primary-2)]">&amp; Guide</span>
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Learn how to use RankBoost AI and what each SEO check means.
        </p>
      </div>

      <div className="space-y-10">
        {/* Getting started */}
        <section>
          <Heading title="Getting started" sub="From your website link to ready-to-use fixes in five steps." />
          <ol className="grid gap-4 md:grid-cols-2">
            {STEPS.map(({ Icon, t, d }, i) => (
              <li key={t} className="card flex gap-4 p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-semibold">
                  {i + 1}
                </span>
                <div>
                  <h3 className="mb-1 flex items-center gap-2 font-semibold">
                    <Icon size={16} className="text-[var(--primary-2)]" />
                    {t}
                  </h3>
                  <p className="text-sm text-[var(--muted)]">{d}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-4">
            <Link href="/app" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-medium">
              Go to Dashboard <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* Status meaning */}
        <section>
          <Heading title="Reading your results" sub="Every factor card shows one of three statuses." />
          <div className="grid gap-4 md:grid-cols-3">
            {STATUS.map((s) => (
              <div key={s.t} className="card p-5">
                <span className={`mb-3 inline-block rounded-md px-2 py-1 text-xs font-medium ${s.cls}`}>{s.t}</span>
                <p className="text-sm text-[var(--muted)]">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Factors */}
        <section>
          <Heading title="What each factor means" sub="The 10 SEO checks, explained in plain words." />
          <div className="grid gap-4 md:grid-cols-2">
            {FACTORS.map(({ Icon, t, d }) => (
              <div key={t} className="card flex gap-4 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/15 text-[var(--primary-2)]">
                  <Icon size={18} />
                </span>
                <div>
                  <h3 className="font-semibold">{t}</h3>
                  <p className="text-sm text-[var(--muted)]">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <Heading title="Frequently asked questions" />
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="card group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="text-xl text-[var(--primary-2)] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-[var(--muted)]">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Honest note */}
        <section className="card p-6">
          <h2 className="mb-2 font-semibold">What to expect</h2>
          <p className="text-sm text-[var(--muted)]">
            No tool can promise a number one ranking, and RankBoost does not either. It finds and explains
            technical and on-page problems and writes fixes for you to review. Always check AI suggestions
            before publishing them on your website.
          </p>
        </section>
      </div>
    </AppShell>
  );
}