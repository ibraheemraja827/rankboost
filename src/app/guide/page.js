
import Link from "next/link";
import {
  BookOpen,
  ListChecks,
  Sparkles,
  TrendingUp,
  LifeBuoy,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "SEO Guide | RankBoost",
  description: "Learn how to use RankBoost to audit and improve your website SEO.",
};

const GUIDE = [
  {
    Icon: BookOpen,
    title: "1. Read your report",
    description:
      "Start with the score and grade at the top. Then look at the ten factor cards: green means good, orange means a warning, red means an error. Each card explains the problem in plain words, so you always know what to look at.",
  },
  {
    Icon: ListChecks,
    title: "2. Fix the right things first",
    description:
      "Fix the red errors first, then the orange warnings. Titles, meta descriptions and the H1 heading are the quickest wins, because they take minutes and directly affect how your page appears in Google.",
  },
  {
    Icon: Sparkles,
    title: "3. Apply the AI fixes",
    description:
      "Press Fix with AI, then copy each block. Paste the title and description into your page settings or SEO plugin, add the schema snippet to the page head, and upload sitemap.xml and robots.txt to the root of your site.",
  },
  {
    Icon: TrendingUp,
    title: "4. Track your results",
    description:
      "Submit your sitemap in Google Search Console, then check your clicks and impressions on the Performance page. Run the audit again after you make changes to see your score improve.",
  },
  {
    Icon: LifeBuoy,
    title: "5. Avoid common mistakes",
    description:
      "Do not repeat the same title on many pages. Do not stuff keywords into the text. Do not copy content from other sites. Keep your sitemap updated when you add pages.",
  },
];

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-6 py-16 text-[var(--text)]">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-[var(--muted)] transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <header className="mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--primary-2)]">
            RankBoost Help Guide
          </p>
          <h1 className="mb-4 text-4xl font-semibold md:text-5xl">
            How to get the most from RankBoost
          </h1>
          <p className="max-w-2xl text-[var(--muted)]">
            New to SEO? Follow these five steps to go from your first report
            to real improvements.
          </p>
        </header>

        <section className="space-y-4">
          {GUIDE.map(({ Icon, title, description }, index) => (
            <details
              key={title}
              className="card group rounded-2xl p-5"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#14142a] text-[var(--primary-2)]">
                    <Icon size={19} />
                  </span>
                  {title}
                </span>
                <span className="text-xl text-[var(--primary-2)] transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 pl-13 text-sm leading-7 text-[var(--muted)]">
                {description}
              </p>
            </details>
          ))}
        </section>

        <section className="card mt-12 rounded-2xl p-8 text-center">
          <h2 className="mb-3 text-2xl font-semibold">
            Ready to improve your website SEO?
          </h2>
          <p className="mb-6 text-sm text-[var(--muted)]">
            Run a website audit and discover what needs to be improved.
          </p>
          <Link
            href="/app"
            className="btn-primary inline-flex items-center gap-2 px-7 py-3 font-medium"
          >
            Analyze my website
            <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </main>
  );
}
