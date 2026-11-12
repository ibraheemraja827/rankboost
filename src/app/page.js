
import Link from "next/link";
import {
  Search, Sparkles, Globe, Download, TrendingUp, Zap, Check, ArrowRight,
  Briefcase, Users, Code2, Gauge, Link2, FileText, Tag, Heading1,
  Image as ImageIcon, Smartphone, Lock, PenLine, BookOpen, History,
  GitCompare, ListChecks, LifeBuoy,
} from "lucide-react";
import ScoreGauge from "@/components/ScoreGauge";
import Reveal from "@/components/Reveal";
import HeroGlobe from "@/components/HeroGlobe";
import LoginGuard from "@/components/LoginGuard";
import NavAuth from "@/components/NavAuth";
import Logo from "@/components/Logo";

const STATS = [
  { n: "10", l: "SEO factors checked" },
  { n: "10", l: "pages crawled per scan" },
  { n: "100", l: "point SEO score with a grade" },
];

const WORDS = [
  "Meta Title", "Meta Description", "H1 Tags", "Page Speed", "Schema Markup",
  "Canonical Tags", "Image Alt Text", "Mobile Friendly", "HTTPS", "Content Depth",
];

const PROBLEMS = [
  { t: "You do not know what is wrong", d: "Your site looks fine to you, but Google may see missing titles, slow pages, broken links or thin content. Without a proper check, these problems stay hidden for months." },
  { t: "You do not have time to fix it", d: "Writing a title, description and schema for every page takes hours, and small mistakes are easy to make. Most owners never get to it." },
  { t: "Reports are hard to read", d: "Most SEO tools bury you in jargon and charts, with no clear list of what to do first. You end up with a report, but no plan." },
];

const FEATURES = [
  { Icon: Zap, t: "Instant SEO audit", d: "Enter a link and get an SEO score out of 100 with a clear grade from A to F. Ten important factors are checked, and each one tells you what is good, what needs attention and what is broken.", tag: "" },
  { Icon: Gauge, t: "Page speed test", d: "A real mobile speed test from Google PageSpeed, so you can see how fast your page loads on a phone. Slow pages lose visitors and rank lower.", tag: "" },
  { Icon: Sparkles, t: "AI-written fixes", d: "The AI reads your page and writes a better title, meta description, keywords, image alt text and schema markup. Everything is ready to copy and paste.", tag: "" },
  { Icon: Globe, t: "Full-site crawl", d: "Scans up to 10 pages in one go, finds broken pages, duplicate titles and thin content, and generates your sitemap.xml and robots.txt files.", tag: "" },
  { Icon: Download, t: "PDF and ZIP reports", d: "Download a branded PDF report to share with a client or your team, or a ZIP package with the report, fixes, sitemap and robots files together.", tag: "" },
  { Icon: TrendingUp, t: "Search performance", d: "See clicks, impressions, click-through rate and average position on one dashboard, using your own Search Console export. Direct Google connection is planned.", tag: "" },
  { Icon: History, t: "Saved reports", d: "Every scan is saved to your account, along with the AI fixes and crawl results. Open an old report any time and see how your site changed.", tag: "" },
  { Icon: GitCompare, t: "Competitor compare", d: "Scan your site and a competitor side by side and see exactly which SEO factors they win on. This feature is being built.", tag: "Coming soon" },
];

const BANDS = [
  { g: "A", r: "90 to 100", t: "Excellent", d: "Your basics are in very good shape. Only small tweaks are left.", c: "text-green-400" },
  { g: "B", r: "75 to 89", t: "Good", d: "A few fixes will make a clear difference.", c: "text-emerald-300" },
  { g: "C", r: "60 to 74", t: "Average", d: "There is plenty of room to improve. Start with the errors.", c: "text-yellow-300" },
  { g: "D", r: "40 to 59", t: "Weak", d: "Several important problems are holding the page back.", c: "text-orange-400" },
  { g: "F", r: "0 to 39", t: "Poor", d: "Major problems. Fix these first before anything else.", c: "text-red-400" },
];

const STEPS = [
  { t: "Enter your link", d: "Type your website address. There is nothing to install and no code to add to your site." },
  { t: "We scan it", d: "We check your page, run a mobile speed test and crawl up to 10 pages to look for problems." },
  { t: "AI writes the fixes", d: "You get a new title, description, keywords, alt text and schema, written for your own page." },
  { t: "Download and apply", d: "Copy the fixes, or download the full package and put the files on your site." },
];

const CHECKS = [
  { Icon: Tag, t: "Meta title", d: "The headline people see in Google results. It should include your main keyword (30 to 60 characters).", fix: "Write a unique title for every page." },
  { Icon: FileText, t: "Meta description", d: "The short text under your title. A good one earns more clicks (70 to 160 characters).", fix: "Describe the page in one clear sentence with a reason to click." },
  { Icon: Heading1, t: "H1 heading", d: "One clear main heading tells Google what the page is about.", fix: "Use exactly one H1 per page." },
  { Icon: Gauge, t: "Page speed", d: "Slow pages lose visitors and rank lower, especially on phones.", fix: "Compress images and remove scripts you do not need." },
  { Icon: Search, t: "Schema markup", d: "Extra code that helps Google understand your business and can unlock rich results.", fix: "Paste the JSON-LD snippet we generate into the page head." },
  { Icon: Link2, t: "Canonical tag", d: "Tells Google which version of a page is the main one, so duplicates do not split your ranking.", fix: "Point each page to its own preferred address." },
  { Icon: ImageIcon, t: "Image alt text", d: "Describes your images for search engines and for visitors who cannot see them.", fix: "Add a short, honest description to every meaningful image." },
  { Icon: Smartphone, t: "Mobile friendly", d: "Many searches happen on phones, and Google looks at the mobile version of your site.", fix: "Make sure the page has a viewport tag and a responsive layout." },
  { Icon: Lock, t: "HTTPS", d: "A secure connection builds trust and is a basic ranking signal.", fix: "Install an SSL certificate and redirect http to https." },
  { Icon: PenLine, t: "Content depth", d: "Pages with very little text rarely rank. We check that each page has enough useful content.", fix: "Answer the visitor's questions in full, in your own words." },
];

const GUIDE = [
  { Icon: BookOpen, t: "1. Read your report", d: "Start with the score and grade at the top. Then look at the ten factor cards: green means good, orange means a warning, red means an error. Each card explains the problem in plain words, so you always know what to look at." },
  { Icon: ListChecks, t: "2. Fix the right things first", d: "Fix the red errors first, then the orange warnings. Titles, meta descriptions and the H1 heading are the quickest wins, because they take minutes and directly affect how your page appears in Google." },
  { Icon: Sparkles, t: "3. Apply the AI fixes", d: "Press Fix with AI, then copy each block. Paste the title and description into your page settings or SEO plugin, add the schema snippet to the page head, and upload sitemap.xml and robots.txt to the root of your site." },
  { Icon: TrendingUp, t: "4. Track your results", d: "Submit your sitemap in Google Search Console, then check your clicks and impressions on the Performance page. Run the audit again after you make changes to see your score improve." },
  { Icon: LifeBuoy, t: "5. Avoid common mistakes", d: "Do not repeat the same title on many pages. Do not stuff keywords into the text. Do not copy content from other sites. Keep your sitemap updated when you add pages." },
];

const AUDIENCE = [
  { Icon: Briefcase, t: "Business owners", d: "Understand what is wrong with your website in plain language, without hiring an expert first." },
  { Icon: Users, t: "Agencies and freelancers", d: "Audit client sites fast and send a professional PDF report in a few clicks." },
  { Icon: Code2, t: "Developers", d: "Get ready-made meta tags, schema and sitemap files instead of writing them by hand." },
];

const FAQ = [
  { q: "How long does a scan take?", a: "Usually between 15 and 45 seconds, because we also run a real mobile speed test. Crawling up to 10 pages can take a little longer." },
  { q: "What is a good SEO score?", a: "A score of 75 or more (grade B or A) means your basics are in good shape. Below 60 means there are clear problems to fix. This is RankBoost's own score and not an official Google number." },
  { q: "Do I need technical knowledge?", a: "No. Every problem is explained in plain language, and the fixes are written for you to copy and paste." },
  { q: "Will it change my website automatically?", a: "No. RankBoost never touches your site. It gives you the fixes and files, and you decide what to apply. Automatic updates for platforms like WordPress are planned for later." },
  { q: "What is the AI used for?", a: "The AI reads your page and writes a better title, meta description, keywords, image alt text and schema markup. It is told to use only what is on your page and not to invent facts like addresses or phone numbers." },
  { q: "Can I compare my site with a competitor?", a: "Not yet. Competitor compare is being built. Today you can audit any site, including a competitor's, one at a time." },
  { q: "Can you guarantee a Google ranking?", a: "No tool honestly can. RankBoost fixes the technical and on-page problems quickly, which improves your chances, but rankings also depend on competition, backlinks and how trusted your site is." },
  { q: "Is my data safe?", a: "Each account only sees its own saved reports. We use your link and your page content to run the audit and generate fixes." },
];

const SAMPLE = [
  { n: "Meta Title", s: "good" },
  { n: "Meta Description", s: "good" },
  { n: "Page Speed", s: "warning" },
  { n: "Image Alt Tags", s: "warning" },
  { n: "Content Depth", s: "error" },
];

const PILL = {
  good: "bg-green-500/10 text-green-400",
  warning: "bg-orange-500/10 text-orange-400",
  error: "bg-red-500/10 text-red-400",
};

const PILL_LABEL = { good: "Good", warning: "Warning", error: "Error" };
const DIRS3 = ["left", "up", "right"];
const DIRS2 = ["left", "right"];
const DIRS4 = ["left", "up", "up", "right"];

function Heading({ children, sub, eyebrow }) {
  return (
    <Reveal dir="up" className="mx-auto mb-12 max-w-2xl text-center">
      {eyebrow && (
        <div className="mb-3 text-xs uppercase tracking-[0.25em] text-[var(--primary-2)]">
          {eyebrow}
        </div>
      )}
      <h2 className="mb-3 text-2xl font-light sm:text-3xl md:text-4xl">{children}</h2>
      {sub && <p className="text-[var(--muted)]">{sub}</p>}
    </Reveal>
  );
}

const Em = ({ children }) => (
  <span className="font-bold italic text-[var(--primary-2)]">{children}</span>
);

export default function Landing() {
  return (
    <div className="relative min-w-0 overflow-x-clip">
      <LoginGuard />

      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="orb absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="orb absolute -right-40 bottom-0 h-[380px] w-[380px] rounded-full bg-violet-500/15 blur-3xl" style={{ animationDelay: "-7s" }} />
      </div>

      {/* NAV */}
      <nav className="anim-down sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" aria-label="RankBoost AI home" className="shrink-0">
            <Logo withName />
          </Link>

          <div className="hidden items-center gap-5 text-sm text-[var(--muted)] lg:flex xl:gap-7">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#score" className="hover:text-white">Score guide</a>
            <a href="#guide" className="hover:text-white">Help guide</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </div>

          <div className="shrink-0">
            <NavAuth />
          </div>

          <div className="flex w-full items-center gap-5 overflow-x-auto border-t border-[var(--border)] pt-3 text-sm text-[var(--muted)] lg:hidden">
            <a href="#features" className="shrink-0 hover:text-white">Features</a>
            <a href="#how" className="shrink-0 hover:text-white">How it works</a>
            <a href="#score" className="shrink-0 hover:text-white">Score guide</a>
            <a href="#guide" className="shrink-0 hover:text-white">Help guide</a>
            <a href="#faq" className="shrink-0 hover:text-white">FAQ</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-w-0 overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div
            className="absolute -left-40 -top-56 h-[720px] w-[460px] -rotate-[38deg] blur-3xl"
            style={{ background: "linear-gradient(180deg, rgba(150,150,255,0.55), rgba(80,80,220,0.14) 60%, transparent)" }}
          />
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center font-extrabold leading-none tracking-tighter"
            style={{ fontSize: "clamp(8rem, 30vw, 26rem)", color: "rgba(255,255,255,0.028)" }}
          >
            TAMX
          </div>
        </div>

        <div className="relative mx-auto grid max-w-6xl min-w-0 items-center gap-10 px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-2 lg:gap-12 lg:pb-24">
          <div
            className="pointer-events-none absolute left-1/2 top-[42%] h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 opacity-30 sm:h-[460px] sm:w-[460px] sm:opacity-40 lg:left-[60%] lg:top-1/2 lg:h-[620px] lg:w-[620px] lg:opacity-60"
            aria-hidden="true"
          >
            <HeroGlobe />
          </div>

          <div className="relative z-10 min-w-0">
            <span className="anim-fade-up mb-5 inline-block rounded-full border border-[var(--border)] px-4 py-1 text-xs text-[var(--primary-2)]" style={{ animationDelay: "0.1s" }}>
              AI-powered SEO platform by TAMx Technologies
            </span>

            <h1 className="anim-left mb-5 text-3xl font-light leading-tight sm:text-4xl md:text-6xl" style={{ animationDelay: "0.2s" }}>
              Rank higher with <span className="shimmer font-bold italic">AI-powered</span> SEO
            </h1>

            <p className="anim-left mb-4 max-w-xl text-base text-[var(--muted)] sm:text-lg" style={{ animationDelay: "0.35s" }}>
              Paste your website link and RankBoost finds what is holding your site back in Google search, then writes the fixes for you.
            </p>

            <p className="anim-left mb-8 max-w-xl text-sm text-[var(--muted)] sm:text-base" style={{ animationDelay: "0.42s" }}>
              You get an SEO score out of 100, a mobile speed test, a crawl of up to 10 pages, and AI-written titles, descriptions, keywords, alt text and schema. Download a branded PDF report and track your search performance in one dashboard.
            </p>

            <div className="anim-fade-up flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4" style={{ animationDelay: "0.5s" }}>
              <Link href="/app" className="btn-primary pulse-glow inline-flex items-center justify-center gap-2 px-7 py-4 text-center font-medium">
                Analyze my website <ArrowRight size={18} />
              </Link>
              <a href="#how" className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-7 py-4 text-center font-medium hover:bg-white/5">
                See how it works
              </a>
            </div>

            <div className="anim-fade-up mt-10 grid max-w-xl grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-6" style={{ animationDelay: "0.65s" }}>
              {STATS.map((s) => (
                <div key={s.l} className="min-w-0">
                  <div className="text-2xl font-semibold sm:text-3xl">{s.n}</div>
                  <div className="text-sm text-[var(--muted)]">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="anim-right relative z-10 min-w-0" style={{ animationDelay: "0.3s" }}>
            <div className="float card w-full max-w-full overflow-hidden bg-[#0b0b16]/90 p-4 backdrop-blur sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold">SEO Audit Score</div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-[var(--muted)]">Sample report</span>
              </div>
              <ScoreGauge score={78} grade="B" />
              <div className="mt-4 space-y-2">
                {SAMPLE.map((r) => (
                  <div key={r.n} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-black/30 px-3 py-2 text-sm sm:px-4">
                    <span>{r.n}</span>
                    <span className={`rounded-md px-2 py-1 text-xs font-medium ${PILL[r.s]}`}>{PILL_LABEL[r.s]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-y border-[var(--border)] py-4">
        <div className="marquee flex w-max items-center gap-10 text-sm text-[var(--muted)]">
          {[...WORDS, ...WORDS].map((w, i) => (
            <span key={i} className="flex items-center gap-10 whitespace-nowrap">
              {w}
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary-2)]" />
            </span>
          ))}
        </div>
      </div>

      {/* PROBLEM */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Heading eyebrow="The problem" sub="Most website owners are stuck on the same three problems.">
          SEO feels <Em>confusing</Em>. It should not.
        </Heading>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
          {PROBLEMS.map((p, i) => (
            <Reveal key={p.t} dir={DIRS3[i % 3]} delay={(i % 3) * 100} className="h-full">
              <div className="card card-hover h-full min-w-0 p-4 sm:p-6">
                <h3 className="mb-2 font-semibold">{p.t}</h3>
                <p className="text-sm text-[var(--muted)]">{p.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20">
        <Heading eyebrow="Features" sub="From finding problems to fixing them and tracking results, without switching tools.">
          Everything in <Em>one place</Em>
        </Heading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {FEATURES.map(({ Icon, t, d, tag }, i) => (
            <Reveal key={t} dir={DIRS4[i % 4]} delay={(i % 4) * 90} className="h-full">
              <div className="card card-hover relative h-full min-w-0 p-4 sm:p-6">
                {tag && (
                  <span className="absolute right-4 top-4 rounded-full bg-[var(--primary)]/20 px-3 py-1 text-xs text-[var(--primary-2)]">
                    {tag}
                  </span>
                )}
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#14142a] text-[var(--primary-2)]">
                  <Icon size={20} />
                </div>
                <h3 className="mb-2 font-semibold">{t}</h3>
                <p className="text-sm text-[var(--muted)]">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20">
        <Heading eyebrow="How it works" sub="Four simple steps from link to fixes.">
          From link to <Em>results</Em>
        </Heading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.t} dir={DIRS4[i % 4]} delay={i * 120} className="h-full">
              <div className="card card-hover h-full min-w-0 p-4 sm:p-6">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] font-semibold">
                  {i + 1}
                </div>
                <h3 className="mb-2 font-semibold">{s.t}</h3>
                <p className="text-sm text-[var(--muted)]">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SCORE GUIDE */}
      <section id="score" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20">
        <Heading eyebrow="Score guide" sub="Your score is a quick way to see how healthy a page is. Here is what the numbers mean.">
          Understand your <Em>SEO score</Em>
        </Heading>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          <Reveal dir="left" className="h-full">
            <div className="card h-full min-w-0 p-4 sm:p-6">
              <h3 className="mb-4 font-semibold">Grades</h3>
              <div className="space-y-3">
                {BANDS.map((b) => (
                  <div key={b.g} className="flex items-start gap-3 rounded-xl bg-black/30 p-3 sm:gap-4 sm:p-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#14142a] text-xl font-bold ${b.c}`}>
                      {b.g}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium">
                        {b.t} <span className="ml-1 text-xs font-normal text-[var(--muted)]">{b.r}</span>
                      </div>
                      <p className="text-sm text-[var(--muted)]">{b.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal dir="right" className="h-full">
            <div className="card h-full min-w-0 p-4 sm:p-6">
              <h3 className="mb-4 font-semibold">How the score is calculated</h3>
              <p className="mb-4 text-sm text-[var(--muted)]">
                Each of the 10 factors gets one of three results. Your score is the total, shown as a percentage.
              </p>
              <div className="mb-6 space-y-2 text-sm">
                {[
                  { s: "good", t: "Good", d: "Full points. Nothing to do." },
                  { s: "warning", t: "Warning", d: "Half the points. Worth fixing soon." },
                  { s: "error", t: "Error", d: "No points. Fix this first." },
                ].map((r) => (
                  <div key={r.t} className="flex flex-wrap items-center gap-3 rounded-lg bg-black/30 px-3 py-3 sm:px-4">
                    <span className={`rounded-md px-2 py-1 text-xs font-medium ${PILL[r.s]}`}>{r.t}</span>
                    <span className="text-[var(--muted)]">{r.d}</span>
                  </div>
                ))}
              </div>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
                <li className="flex gap-3">
                  <Check size={18} className="mt-0.5 shrink-0 text-green-400" />
                  If the speed test cannot run, the score uses the factors that were checked.
                </li>
                <li className="flex gap-3">
                  <Check size={18} className="mt-0.5 shrink-0 text-green-400" />
                  This is RankBoost's own score. It is not an official Google score.
                </li>
                <li className="flex gap-3">
                  <Check size={18} className="mt-0.5 shrink-0 text-green-400" />
                  A higher score means healthier on-page SEO, not a guaranteed ranking.
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* WHAT WE CHECK */}
      <section id="checks" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20">
        <Heading eyebrow="What we check" sub="Ten important SEO factors, explained in plain words, with a simple tip for each.">
          What we <Em>check</Em>, and how to fix it
        </Heading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          {CHECKS.map(({ Icon, t, d, fix }, i) => (
            <Reveal key={t} dir={DIRS2[i % 2]} delay={Math.floor(i / 2) * 80} className="h-full">
              <div className="card card-hover flex h-full min-w-0 gap-4 p-4 sm:p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#14142a] text-[var(--primary-2)]">
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold">{t}</h3>
                  <p className="text-sm text-[var(--muted)]">{d}</p>
                  <p className="mt-2 text-xs text-[var(--primary-2)]">Fix: {fix}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* COMPETITOR */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal dir="zoom">
          <div className="card grid min-w-0 items-center gap-8 p-5 sm:p-8 md:p-10 lg:grid-cols-2" style={{ background: "linear-gradient(135deg,#12122e,#0b0b16)" }}>
            <div className="min-w-0">
              <span className="mb-4 inline-block rounded-full bg-[var(--primary)]/20 px-3 py-1 text-xs text-[var(--primary-2)]">
                Coming soon
              </span>
              <h2 className="mb-3 text-2xl font-light sm:text-3xl">
                Compare with your <Em>competitors</Em>
              </h2>
              <p className="mb-4 text-sm text-[var(--muted)] sm:text-base">
                Scan your website and a competitor's side by side. See both scores, and exactly which SEO factors they win on, so you know where to catch up first.
              </p>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
                {[
                  "Two scores, side by side",
                  "Factor-by-factor comparison",
                  "A clear list of where you are behind",
                ].map((x) => (
                  <li key={x} className="flex gap-3">
                    <Check size={18} className="mt-0.5 shrink-0 text-[var(--primary-2)]" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { n: "Your site", s: 78, c: "text-[var(--primary-2)]" },
                { n: "Competitor", s: 64, c: "text-[var(--muted)]" },
              ].map((x) => (
                <div key={x.n} className="min-w-0 rounded-2xl bg-black/30 p-3 text-center sm:p-6">
                  <div className="mb-1 text-xs text-[var(--muted)]">{x.n}</div>
                  <div className={`text-3xl font-semibold sm:text-5xl ${x.c}`}>{x.s}</div>
                  <div className="text-xs text-[var(--muted)]">Sample preview</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* HELP GUIDE */}
      <section id="guide" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20">
        <Heading eyebrow="Help guide" sub="New to SEO? Follow these five steps to go from your first report to real improvements.">
          How to get the <Em>most</Em> from RankBoost
        </Heading>
        <div className="space-y-3">
          {GUIDE.map(({ Icon, t, d }, i) => (
            <Reveal key={t} dir="up" delay={i * 70}>
              <details className="card group min-w-0 p-4 sm:p-5" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 font-medium [&::-webkit-details-marker]:hidden">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#14142a] text-[var(--primary-2)]">
                      <Icon size={18} />
                    </span>
                    {t}
                  </span>
                  <span className="shrink-0 text-xl text-[var(--primary-2)] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 pl-0 text-sm text-[var(--muted)] sm:pl-12">{d}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* AUDIENCE */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Heading eyebrow="Who it is for">
          Built for <Em>everyone</Em> who owns a website
        </Heading>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
          {AUDIENCE.map(({ Icon, t, d }, i) => (
            <Reveal key={t} dir={DIRS3[i % 3]} delay={(i % 3) * 100} className="h-full">
              <div className="card card-hover h-full min-w-0 p-4 sm:p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#14142a] text-[var(--primary-2)]">
                  <Icon size={20} />
                </div>
                <h3 className="mb-2 font-semibold">{t}</h3>
                <p className="text-sm text-[var(--muted)]">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HONEST EXPECTATIONS */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <Reveal dir="zoom">
          <div className="card p-5 sm:p-8">
            <h2 className="mb-3 text-2xl font-semibold sm:text-3xl">What to expect</h2>
            <p className="mb-4 text-sm text-[var(--muted)] sm:text-base">
              No tool can promise a number one ranking, and we will not either. RankBoost does the technical and on-page SEO work quickly and clearly, which gives your site a much better chance.
            </p>
            <ul className="space-y-2 text-sm">
              {[
                "Changes usually take 1 to 3 months to show up in Google.",
                "Rankings also depend on competition, backlinks and how trusted your site is.",
                "The best results come from fixing problems first, then publishing good content regularly.",
              ].map((x) => (
                <li key={x} className="flex gap-3">
                  <Check size={18} className="mt-0.5 shrink-0 text-green-400" />
                  <span className="text-[var(--muted)]">{x}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20">
        <Heading eyebrow="FAQ">
          Common <Em>questions</Em>
        </Heading>
        <div className="space-y-3">
          {FAQ.map((f, i) => (
            <Reveal key={f.q} dir="up" delay={i * 60}>
              <details className="card group min-w-0 p-4 sm:p-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 font-medium [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0">{f.q}</span>
                  <span className="shrink-0 text-xl text-[var(--primary-2)] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-[var(--muted)]">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <Reveal dir="zoom">
          <div className="card p-5 text-center sm:p-10" style={{ background: "linear-gradient(135deg,#14143a,#0b0b16)" }}>
            <h2 className="mb-3 text-2xl font-light sm:text-3xl md:text-4xl">
              Ready to see what is holding your site <span className="shimmer font-bold italic">back</span>?
            </h2>
            <p className="mb-8 text-sm text-[var(--muted)] sm:text-base">
              Paste your link and get your SEO score and fixes in about a minute.
            </p>
            <Link href="/app" className="btn-primary pulse-glow inline-flex items-center justify-center gap-2 px-6 py-4 text-center font-medium sm:px-8">
              Analyze my website <ArrowRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border)] bg-black/30">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 sm:py-14 md:grid-cols-4 md:gap-10">
          <div className="min-w-0 md:col-span-2">
            <Logo withName />
            <p className="mt-4 max-w-sm text-sm text-[var(--muted)]">
              RankBoost AI is an AI-powered SEO platform that audits your website, writes the fixes and helps you track your search performance.
            </p>
          </div>

          <div>
            <div className="mb-4 text-sm font-semibold">Product</div>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#how" className="hover:text-white">How it works</a></li>
              <li><a href="#score" className="hover:text-white">Score guide</a></li>
              <li><a href="#guide" className="hover:text-white">Help guide</a></li>
              <li><a href="#faq" className="hover:text-white">FAQ</a></li>
            </ul>
          </div>

          <div>
            <div className="mb-4 text-sm font-semibold">Company</div>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li><Link href="/app" className="hover:text-white">Log in</Link></li>
              <li>
                <a href="https://tamxai.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  TAMx Technologies
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border)]">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-5 text-xs text-[var(--muted)] sm:px-6 md:flex-row md:items-center">
            <div>© 2026 TAMx Technologies. All rights reserved.</div>
            <div className="max-w-2xl">SEO scores are RankBoost's own measure and do not guarantee Google rankings.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
